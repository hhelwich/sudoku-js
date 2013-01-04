/*
 * sudoku-js
 * https://github.com/hhelwich/sudoku-js
 *
 * Copyright (c) 2013 Hendrik Helwich
 * Licensed under the GPLv3 license.
 */

(function (global) {
    "use strict";

    var
        createField = function (rows, cols, fieldArray) {
            var i;
            if (fieldArray === undefined) { // no buffer given => create new array initialized with null
                fieldArray = [];
                fieldArray.length = rows * cols * rows * cols; // number of elements
                fieldArray.size = rows * cols; // height and width
                fieldArray.rows = rows; // number of elements in a column of a block
                fieldArray.cols = cols; // number of elements in a row of a block
                for (i = fieldArray.length - 1; i >= 0; i -= 1) {
                    fieldArray[i] = null;
                }
            }

            // add convenient getter
            fieldArray.get = function (row, col) {
                return this[col + row * this.size];
            };

            // add convenient setter
            fieldArray.set = function (row, col, value) {
                if (value < 0 || value >= this.size) {
                    throw "invalid value " + value;
                }
                this[col + row * this.size] = value;
            };

            fieldArray.solve = function () {
                var ctField = candidateTrackField(this);
            };

            return fieldArray;
        },
        candidateTrackField = (function () {
            // only needed for testing
            var getCandidates = function (bitset, size) {
                var ret = [],
                    i;
                for (i = 0; i < size; i += 1) {
                    if ((bitset & (1 << i)) !== 0) {
                        ret.push(i);
                    }
                }
                return ret;
            };

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
                        block = (~~(row / field.rows)) * field.rows + ~~(col / field.cols);
                        // add all possible elements to the three bitsets
                        rows[row] = maxBit;
                        cols[col] = maxBit;
                        blocks[block] = maxBit;
                        // reduce row and column bitsets
                        for (j = 0; j < field.size; j += 1) {
                            e = field.get(row, j);
                            if (e !== null) {
                                rows[row] &= ~(1 << e);
                            }
                            e = field.get(j, col);
                            if (e !== null) {
                                cols[col] &= ~(1 << e);
                            }
                        }
                        // reduce block bitset

                        rd = (~~(row / field.rows)) * field.rows;
                        cd = (~~(col / field.cols)) * field.cols;
                        for (i = 0; i < field.rows; i += 1) {
                            for (j = 0; j < field.cols; j += 1) {
                                e = field.get(i + rd, j + cd);
                                if (e !== null) {
                                    blocks[block] &= ~(1 << e);
                                }
                            }
                        }
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
                        e = field.get(r, c);
                        if (e !== null) {
                            b = (~~(r / field.rows)) * field.rows + ~~(c / field.cols); // block index to element
                            e = ~(1 << e);
                            rows[r] &= e;
                            cols[c] &= e;
                            blocks[b] &= e;
                        }
                    }
                }
                return {
                    get: function (row, col) {
                        return field.get(row, col);
                    },
                    set: function (row, col, value) {
                        var current = this.get(row, col),
                            block;
                        if (value === null) {
                            if (current !== null) {
                                field.set(row, col, null);
                                rebuildBitsetsFor(row, col);
                            }
                        } else {
                            field.set(row, col, value);
                            if (current === null) {
                                // remove value from corresponding bitsets
                                block = (~~(row / field.rows)) * field.rows + ~~(col / field.cols);
                                value = ~(1 << value);
                                rows[row] &= value;
                                cols[col] &= value;
                                blocks[block] &= value;
                            } else {
                                rebuildBitsetsFor(row, col);
                            }
                        }
                    },
                    // method only needed for testing
                    getRowCandidates: function (row) {
                        return getCandidates(rows[row], field.size);
                    },
                    // method only needed for testing
                    getColCandidates: function (col) {
                        return getCandidates(cols[col], field.size);
                    },
                    // method only needed for testing
                    getBlockCandidates: function (block) {
                        return getCandidates(blocks[block], field.size);
                    }

                };
            };
        }());

    global.sudoku = {
        createField: createField,
        candidateTrackField: candidateTrackField
    };
}(window));