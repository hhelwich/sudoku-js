/*
 * sudoku-js
 * https://github.com/hhelwich/sudoku-js
 *
 * Copyright (c) 2013 Hendrik Helwich
 * Licensed under the GPLv3 license.
 */
/*global IN_TEST:false */
/*jslint  bitwise: true */

var hhelwi = hhelwi || {};

hhelwi.sudoku = (function () {
    "use strict";

    var
        sudoku,
        internals, // add internal operations which should be tested but should not be in the api
        Field = (function () {

            // create constructor function to handle browsers which do not have Object.create()
            var constr = function (rows, cols, symbols, data) {
                var i;
                this.size = rows * cols; // height and width
                this.rows = rows; // number of elements in a column of a block
                this.cols = cols; // number of elements in a row of a block
                this.symbols = symbols; // can also be undefined
                this.length = this.size * this.size;
                if (data === undefined) {
                    data = [];
                    data.length = this.length; // number of elements
                    for (i = this.length - 1; i >= 0; i -= 1) {
                        data[i] = null;
                    }
                } else {
                    data = data.slice();
                }
                this.data = data;
            };

            constr.prototype = {

                // add convenient getter
                getX: function (row, col) { // TODO make private
                    return this.data[col + row * this.size];
                },

                // add convenient setter
                setX: function (row, col, value) { // TODO make private
                    if (value !== null & (value < 0 || value >= this.size)) {
                        throw "invalid value " + value;
                    }
                    this.data[col + row * this.size] = value;
                },

                get: function (row, col) {
                    var value = this.getX(row, col);
                    if (value !== null && this.symbols !== undefined) {
                        value = this.symbols.charAt(value);
                    }
                    return value;
                },

                // add convenient setter
                set: function (row, col, value) {
                    if (value !== null && this.symbols !== undefined) {
                        value = this.symbols.indexOf(value);
                    }
                    this.setX(row, col, value);
                },

                isEqual: function (other) {
                    var i;
                    if (this === other) {
                        return true;
                    }
                    if (this.row !== other.row || this.cols !== other.cols) {
                        return false;
                    }
                    if (this.symbols !== other.symbols) {
                        return false;
                    }
                    for (i = this.length - 1; i >= 0; i -= 1) {
                        if (this.data[i] !== other.data[i]) {
                            return false;
                        }
                    }
                    return true;
                },

                clone: function () {
                    return new Field(this.rows, this.cols, this.symbols, this.data);
                },

                getBlockIndex: function (row, col) {
                    if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
                        return undefined;
                    }
                    return (~~(row / this.rows)) * this.rows + ~~(col / this.cols);
                },

                solve: function (randomize) {
                    return candidateTrackField(this).solve(randomize, {active: false});
                },

                generate: function () {
                    return candidateTrackField(this).solve(true, {active: true});
                },

                toString: function () {
                    var i, j, string = "", value;
                    for (i = 0; i < this.size; i += 1) {
                        for (j = 0; j < this.size; j += 1) {
                            value = this.get(i, j);
                            if (j > 0) {
                                string += " ";
                            }
                            string += (value === null ? "_" : this.get(i, j));
                        }
                        if (i < this.size - 1) {
                            string += "\n";
                        }
                    }
                    return string;
                }
            };

            return constr;
        }()),
        create = function (rows, cols, symbols) {
            return new Field(rows, cols, symbols);
        },
        candidateTrackField = (function () {
            var
                numberOfSetBits = function (i) {
                    i -= ((i >> 1) & 0x55555555);
                    i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
                    return (((i + (i >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
                },
                firstSetBit = function (i) {
                    //TODO create operation without loop to increase performance
                    var f;
                    if (i === 0) {
                        return -1;
                    }
                    for (f = 0; (i & 1) === 0; f += 1) {
                        i >>= 1;
                    }
                    return f;
                },
                shuffle = function (array) {
                    var i,
                        j,
                        t;
                    for (i = array.length - 1; i > 0; i -= 1) {
                        // create random number from 0 .. i + 1
                        j = ~~(Math.random() * (i + 1));
                        // swap
                        t = array[i];
                        array[i] = array[j];
                        array[j] = t;
                    }
                    return array;
                },
                api; // api comes here

            // end of var candidateTrackField;

            if (IN_TEST) { // export internal functions for testing
                internals = {
                    numberOfSetBits : numberOfSetBits,
                    firstSetBit: firstSetBit,
                    shuffle: shuffle
                };
            }

            return function (field) {
                // bitsets with set ones for all possible symbols (default sudoku: 9)
                // numbers: 64 bit
                var rows,
                    cols,
                    blocks,
                    r,
                    c,
                    b,
                    e,
                    maxBit,
                    rebuildBitsetsFor = function (row, col) {
                        var block, i, j, e, rd, cd;
                        block = field.getBlockIndex(row, col);
                        // add all possible elements to the three bitsets
                        rows[row] = maxBit;
                        cols[col] = maxBit;
                        blocks[block] = maxBit;
                        // reduce row and column bitsets
                        for (j = 0; j < field.size; j += 1) {
                            e = field.getX(row, j);
                            if (e !== null) {
                                rows[row] &= ~(1 << e);
                            }
                            e = field.getX(j, col);
                            if (e !== null) {
                                cols[col] &= ~(1 << e);
                            }
                        }
                        // reduce block bitset

                        rd = (~~(row / field.rows)) * field.rows;
                        cd = (~~(col / field.cols)) * field.cols;
                        for (i = 0; i < field.rows; i += 1) {
                            for (j = 0; j < field.cols; j += 1) {
                                e = field.getX(i + rd, j + cd);
                                if (e !== null) {
                                    blocks[block] &= ~(1 << e);
                                }
                            }
                        }
                    },
                    getCandidates = function (bitset) {
                        var ret = [],
                            i;
                        for (i = 0; i < field.size; i += 1) {
                            if ((bitset & (1 << i)) !== 0) {
                                ret.push(i);
                            }
                        }
                        return ret;
                    };
                if (field.size > 63) {
                    throw "field is to big for this implementation";
                }
                maxBit = (1 << field.size) - 1;
                // initialize arrays with full bitsets
                rows = [];
                rows.length = field.size;
                for (r = field.size - 1; r >= 0; r -= 1) {
                    rows[r] = maxBit;
                }
                cols = rows.slice();
                blocks = rows.slice();

                // reduce bitsets by pre-filled field values
                for (r = field.size - 1; r >= 0; r -= 1) {
                    for (c = field.size - 1; c >= 0; c -= 1) {
                        e = field.getX(r, c);
                        if (e !== null) {
                            b = field.getBlockIndex(r, c);
                            e = ~(1 << e);
                            rows[r] &= e;
                            cols[c] &= e;
                            blocks[b] &= e;
                        }
                    }
                }
                var ret = {
                    set: function (row, col, value) {
                        var current = field.getX(row, col),
                            block;
                        if (value === null) {
                            if (current !== null) {
                                field.setX(row, col, null);
                                rebuildBitsetsFor(row, col);
                            }
                        } else {
                            field.setX(row, col, value);
                            if (current === null) {
                                // remove value from corresponding bitsets
                                block = field.getBlockIndex(row, col);
                                value = ~(1 << value);
                                rows[row] &= value;
                                cols[col] &= value;
                                blocks[block] &= value;
                            } else {
                                rebuildBitsetsFor(row, col);
                            }
                        }
                    },
                    /**
                     * Returns information for the first cell in the field which has a minimal of possible valid values.
                     * The possible values are calculated by intersection of the possible values of the corresponding
                     * row, column and block to a cell.
                     * The information returned includes the position of the cell in the field and the valid values for
                     * this field.
                     *
                     * @return {*}
                     */
                    getMinIndices: function () {
                        var r, c, b, e, f, minCandCount = field.size + 1,
                            candidates = [];
                        for (r = 0; r < field.size; r += 1) {
                            for (c = 0; c < field.size; c += 1) {
                                e = field.getX(r, c);
                                if (e === null) {
                                    b = field.getBlockIndex(r, c);
                                    e = rows[r] & cols[c] & blocks[b];
                                    f = numberOfSetBits(e);
                                    if (f <= minCandCount) {
                                        if (f < minCandCount) {
                                            minCandCount = f;
                                            candidates.length = 0;
                                        }
                                        candidates.push({
                                            row: r,
                                            col: c,
                                            cand: e
                                        });
                                    }
                                }
                            }
                        }
                        return candidates;
                    },
                    solve: function (randomize, perforate) {
                        //TODO clean this up
                        var indices = this.getMinIndices(),
                            index,
                            i,
                            j,
                            candidates,
                            value;
                        if (indices.length === 0) { // field is complete
                            if (perforate.active) { // remember completed field
                                field.solution = field.clone();
                                // jump up with active backtrack <=> current solution is unique => try to minimize
                            }
                            return true;
                        }
                        // choose index
                        index = indices[randomize ? ~~(Math.random() * indices.length) : 0];
                        indices = null; // free for gc
                        // create candidates list for index
                        candidates = getCandidates(index.cand);
                        if (randomize) {
                            shuffle(candidates);
                        }
                        // iterate candidates
                        for (i = 0; i < candidates.length; i += 1) {
                            value = candidates[i];
                            this.set(index.row, index.col, value);
                            if (this.solve(randomize, perforate)) {
                                if (perforate.active) {
                                    if (candidates.length > 1) {
                                        // make sure no other candidates are valid to get a unique solvable field
                                        for (j = i + 1; j < candidates.length; j += 1) {
                                            this.set(index.row, index.col, candidates[j]);
                                            if (this.solve(randomize, {active: false, clear:true})) {
                                                // this filed cannot be removed (field would not be unique)
                                                //perforate.active = false; // stop backtracking here
                                                this.set(index.row, index.col, value);
                                                return true;
                                            }
                                        }
                                        this.set(index.row, index.col, null);
                                    }
                                    this.set(index.row, index.col, null);
                                }
                                if (perforate.clear) {
                                    this.set(index.row, index.col, null);
                                }
                                return true;
                            } else {
                                this.set(index.row, index.col, null);
                            }
                        }
                        return false;
                    }
                };
                if (IN_TEST) {
                    // method only needed for testing
                    ret.getRowCandidates = function (row) {
                        return getCandidates(rows[row]);
                    };
                    // method only needed for testing
                        ret.getColCandidates = function (col) {
                        return getCandidates(cols[col]);
                    };
                    // method only needed for testing
                    ret.getBlockCandidates = function (block) {
                        return getCandidates(blocks[block]);
                    };
                }
                return ret;
            };
        }());

    sudoku = {
        create: create
    };

    if (IN_TEST) {
        internals.candidateTrackField = candidateTrackField;
        sudoku.internals = internals;
    }

    return sudoku;

}());