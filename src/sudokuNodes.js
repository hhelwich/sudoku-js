/*
 * sudoku-js
 * https://github.com/hhelwich/sudoku-js
 *
 * Copyright (c) 2013 Hendrik Helwich
 * Licensed under the GPLv3 license.
 */
/*global IN_TEST:false */
/*jslint nomen: true, todo: true */

var hhelwi = hhelwi || {};

hhelwi.sudoku2 = (function () {
    "use strict";

    var createBoard;

    createBoard = (function () {

        // return public visible function createBoard()
        return function (blockHeight, blockWidth, symbols) {
            var size, length, cells, _set, removeValue, triggerCellReducedToSingleValue, checkIndex, removeQueue,
                rememberRemove, undoUntil, valueCount;

            // create private board fields
            size = blockHeight * blockWidth;
            length = size * size;
            cells = [];
            cells.length = length;
            valueCount = size * length; // currently not removed nodes in cells
            removeQueue = [];

            (function () { // initialize cells to have an empty board representation
                var cell, i;
                cell = [];
                cell.length = size;
                if (length > 0) {
                    // fill cell array with values equal to index => empty cell
                    for (i = 0; i < size; i += 1) {
                        cell[i] = i;
                    }
                    // set array to last cell
                    cells[length - 1] = cell;
                    // set all other cells with cloned value
                    for (i = length - 2; i >= 0; i -= 1) {
                        cells[i] = cell.slice();
                    }
                }
            }());

            // private functions of board

            rememberRemove = function (cellIdx, idx, value) {
                removeQueue.push(cellIdx);
                removeQueue.push(idx);
                removeQueue.push(value);
            };

            undoUntil = function (mark) {
                var i, n;
                n = (removeQueue.length - mark) / 3;
                // assume n is natural number
                for (i = 0; i < n; i += 1) {
                    cells[removeQueue.pop()].splice(removeQueue.pop(), 0, removeQueue.pop());
                }
                valueCount += n;
            };

            triggerCellReducedToSingleValue = function (row, col, value) {
                //TODO: make groups of general kind / optimize
                var i, j, brs, bcs, r, c;
                // remove value from other cells on the same row
                for (i = 0; i < size; i += 1) {
                    if (i !== col) {
                        removeValue(row, i, value);
                    }
                }
                // remove value from other cells on the same column
                for (i = 0; i < size; i += 1) {
                    if (i !== row) {
                        removeValue(i, col, value);
                    }
                }
                // remove value from other cells on the same block
                brs = (~~(row / blockHeight)) * blockHeight;
                bcs = (~~(col / blockWidth)) * blockWidth;
                for (i = 0; i < blockHeight; i += 1) {
                    r = brs + i;
                    for (j = 0; j < blockWidth; j += 1) {
                        c = bcs + j;
                        if (r !== row || c !== col) {
                            removeValue(r, c, value);
                        }
                    }
                }
            };

            removeValue = function (row, col, value) {
                var cellIdx, cell, idx;
                cellIdx = col + row * size;
                cell = cells[cellIdx];
                idx = cell.indexOf(value);
                if (idx !== -1) { // value contained in cell => remove
                    if (cell.length === 1) {
                        throw {
                            message: "invalid board"
                        };
                    }
                    // remove value from cell
                    cell.splice(idx, 1);
                    // remember remove
                    rememberRemove(cellIdx, idx, value);
                    valueCount -= 1;
                    if (cell.length === 1) {
                        triggerCellReducedToSingleValue(row, col, cell[0]);
                    }
                    return true;
                }
                return false;
            };

            _set = function (row, col, value) {
                // it is assumed that value holds correct value at this point and that there is never an empty cell
                var cellIdx, cell, idx, i, n;
                cellIdx = col + row * size;
                cell = cells[cellIdx];
                idx = cell.indexOf(value);
                if (idx === -1) {
                    throw {
                        message: "impossible value"
                    };
                }
                // value contained in cell => remove all others
                if (cell.length === 1) { // nothing to do
                    return false;
                }
                n = cell.length;
                // remember all preceding values
                for (i = 0; i < idx; i += 1) {
                    rememberRemove(cellIdx, i, cell[i]);
                }
                // remember all successive values
                for (i = idx + 1; i < n; i += 1) {
                    rememberRemove(cellIdx, i, cell[i]);
                }
                // remove all other values from cell
                cell.length = 0;
                cell[0] = value;
                valueCount -= n - 1;
                triggerCellReducedToSingleValue(row, col, value);
                return true;
            };

            checkIndex = function (row, col) {
                if (row < 0 || row >= size || col < 0 || col >= size) {
                    throw {
                        message: "invalid index"
                    };
                }
            };

            return { // create new board object with public API
                set: function (row, col, value) {
                    checkIndex(row, col);
                    if (symbols !== undefined && value !== null) {
                        value = symbols.indexOf(value);
                    }
                    if (value === null || value < 0 || value >= size) {
                        throw {
                            message: "invalid value"
                        };
                    }
                    _set(row, col, value);
                },
                get: function (row, col) {
                    var value;
                    checkIndex(row, col);
                    value = cells[col + row * size];
                    if (value.length === 1) {
                        return symbols.charAt(value[0]);
                    }
                    return null;
                },
                toString: function () {
                    var i, j, string = "", value;
                    for (i = 0; i < size; i += 1) {
                        for (j = 0; j < size; j += 1) {
                            value = this.get(i, j);
                            if (j > 0) {
                                string += " ";
                            }
                            string += (value === null ? "_" : this.get(i, j));
                        }
                        if (i < size - 1) {
                            string += "\n";
                        }
                    }
                    return string;
                }
            };
        };
    }());

    return { // public API
        create: createBoard
    };

}());