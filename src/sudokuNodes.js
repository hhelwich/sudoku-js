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

    var createDefGroups, invertGroups, createBoard;

    createDefGroups = function (blockHeight, blockWidth) { // initialize groups
        var size, i, j, k, l, a, groups;
        size = blockHeight * blockWidth;
        groups = [];
        groups.length = 3 * size; // size groups for rows, cols, blocks
        // add rows
        for (i = 0; i < size; i += 1) {
            a = [];
            a.length = size;
            for (j = 0; j < size; j += 1) {
                a[j] = i * size + j;
            }
            groups[i] = a;
        }
        // add cols
        for (i = 0; i < size; i += 1) {
            a = [];
            a.length = size;
            for (j = 0; j < size; j += 1) {
                a[j] = i + j * size;
            }
            groups[size + i] = a;
        }
        // add blocks
        for (i = 0; i < blockWidth; i += 1) {
            for (j = 0; j < blockHeight; j += 1) {
                a = [];
                a.length = size;
                for (k = 0; k < blockHeight; k += 1) {
                    for (l = 0; l < blockWidth; l += 1) {
                        a[k * blockWidth + l] = (i * blockHeight + k) * size + j * blockWidth + l;
                    }
                }
                groups[size * 2 + i * blockHeight + j] = a;
            }
        }
        return groups;
    };

    /**
     *
     * @param groups
     * @param size
     * @return {Array}
     * array of arrays with group indices sorted in ascending order.
     */
    invertGroups = function (groups, size) {
        var i, j, g, n, length, inv;
        n = groups.length; // number of groups
        length = size * size; // number of cells
        // initialize return structure
        inv = [];
        inv.length = length;
        for (i = 0; i < length; i += 1) {
            inv[i] = [];
        }
        for (i = 0; i < n; i += 1) { // iterate groups
            g = groups[i];
            for (j = 0; j < size; j += 1) { // iterate cells in group
                inv[g[j]].push(i);
            }
        }
        return inv;
    };

    createBoard = (function () {

        //TODO: Array.indexOf() could be optimized by using that elements are sorted (eg binary search)

        // return public visible function createBoard()
        return function (blockHeight, blockWidth, symbols) {
            var size, length, cells, _set, removeValue, triggerCellReducedToSingleValue, checkIndex, removeQueue,
                removeUndoable, undoUntil, valueCount, solve, getFirstMinIndex, triggerCheckDoubleTwins,
                set, get, toString, groups, groupsInv;

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

            groups = createDefGroups(blockHeight, blockWidth);
            groupsInv = invertGroups(groups, size);

            // private functions of board

            removeUndoable = function (array, idx) {
                // remove element form array
                var value = array.splice(idx, 1)[0];
                // remember operation to be able to undo it
                removeQueue.push(value, idx, array);
            };

            undoUntil = function (mark) {
                var i, n;
                n = (removeQueue.length - mark) / 3;
                // assume n is natural number
                for (i = 0; i < n; i += 1) {
                    removeQueue.pop().splice(removeQueue.pop(), 0, removeQueue.pop());
                }
                valueCount += n;
            };

            triggerCheckDoubleTwins = function (cellIdx, value) {
                //TODO: make groups of general kind / optimize
                //TODO: generalize to handle also bigger siblings
                //TODO implement
            };

            triggerCellReducedToSingleValue = function (cellIdx, value) {
                var i, j, n, grps, g, idx;
                grps = groupsInv[cellIdx]; // groups which include the current cell
                n = grps.length;
                // remove value from other cells on the same groups
                for (i = 0; i < n; i += 1) { // iterate groups of cell
                    g = groups[grps[i]];
                    for (j = g.length - 1; j >= 0; j -= 1) { // iterate cells of group which are different to current cell
                        idx = g[j];
                        if (idx === undefined) { // can happen because this function is recursive (via removeValue())
                            continue;
                        }
                        if (idx !== cellIdx) {
                            removeValue(idx, value);
                        }
                    }
                    idx = g.indexOf(cellIdx);
                    // remove cell from group if not already done
                    if (idx !== -1) {
                        removeUndoable(g, idx);
                    }
                }
            };

            removeValue = function (cellIdx, value) {
                var cell, idx;
                cell = cells[cellIdx];
                idx = cell.indexOf(value);
                if (idx !== -1) { // value contained in cell => remove
                    if (cell.length === 1) {
                        throw {
                            message: "invalid board"
                        };
                    }
                    // remove value and remember
                    removeUndoable(cell, idx);
                    valueCount -= 1;
                    if (cell.length === 1) {
                        triggerCellReducedToSingleValue(cellIdx, cell[0]);
                    }
                    return true;
                }
                return false;
            };

            _set = function (cellIdx, value) {
                // it is assumed that value holds correct value at this point and that there is never an empty cell
                var cell, idx, i, n;
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
                    removeUndoable(cell, i);
                }
                // remember all successive values
                for (i = idx + 1; i < n; i += 1) {
                    removeUndoable(cell, i);
                }
                // remove all other values from cell
                cell.length = 0;
                cell[0] = value;
                valueCount -= n - 1;
                triggerCellReducedToSingleValue(cellIdx, value);
                return true;
            };

            checkIndex = function (row, col) {
                if (row < 0 || row >= size || col < 0 || col >= size) {
                    throw {
                        message: "invalid index"
                    };
                }
            };

            getFirstMinIndex = function () {
                //TODO optimize by try tracking on the fly
                var i, l, cellIdx = null, minLength = size + 1;
                for (i = 0; i < length; i += 1) {
                    l = cells[i].length;
                    if (l > 1 && l < minLength) {
                        minLength = l;
                        cellIdx = i;
                    }
                }
                return cellIdx;
            };

            solve = function () {
                var cellIdx, value, i, mark, cell;
                cellIdx = getFirstMinIndex();
                if (cellIdx === null) { // field is already complete
                    return true;
                }
                cell = cells[cellIdx];
                mark = removeQueue.length;
                for (i = 0; i < cell.length; i += 1) {
                    value = cell[i];
                    try {
                        if (_set(cellIdx, value) && solve()) { // _set() throws exception if board gets invalid
                            return true;
                        }
                    } catch (e) {
                        // nothing to do
                    }
                    undoUntil(mark);
                }
                return false;
            };

            set = function (row, col, value) {
                checkIndex(row, col);
                if (symbols !== undefined && value !== null) {
                    value = symbols.indexOf(value);
                }
                if (value === null || value < 0 || value >= size) {
                    throw {
                        message: "invalid value"
                    };
                }
                _set(col + row * size, value);
                return this;
            };

            get = function (row, col) {
                var value;
                checkIndex(row, col);
                value = cells[col + row * size];
                if (value.length === 1) {
                    return symbols.charAt(value[0]);
                }
                return null;
            };

            toString = function () {
                var i, j, string = "", value;
                for (i = 0; i < size; i += 1) {
                    for (j = 0; j < size; j += 1) {
                        value = get(i, j);
                        if (j > 0) {
                            string += " ";
                        }
                        string += (value === null ? "_" : get(i, j));
                    }
                    if (i < size - 1) {
                        string += "\n";
                    }
                }
                return string;
            };

            return { // create new board object with public API
                set: set,
                get: get,
                toString: toString,
                solve: solve
            };
        };
    }());

    return { // public API
        create: createBoard
    };

}());