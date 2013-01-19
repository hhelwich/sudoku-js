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
        var Node, T;

        // use this constructor to use inheritance to share node methods
        Node = (function () {
            var C = function (value) { // value will be set to the new created object
                this.value = value;
            };
            C.prototype = { // functions which should be shared between all nodes
                remove: function () {
                    this.next.prev = this.prev;
                    this.prev.next = this.next;
                },
                reInsert: function () {
                    this.next.prev = this;
                    this.prev.next = this;
                },
                insertAfter: function (node) {
                    this.next = node.next;
                    this.prev = node;
                    node.next.prev = this;
                    node.next = this;
                }
            };
            return C;
        }());

        T = function () {}; // use temporary to share cell values between nodes (and methods)

        // return public visible function createBoard()
        return function (blockHeight, blockWidth, symbols) {
            var size, length, cells, _set, _get, removeValue, triggerCellReducedToSingleValue, checkIndex, removedNodes,
                remove, undoUntil, nodeCount;

            // create private board fields
            size = blockHeight * blockWidth;
            length = size * size;
            cells = [];
            cells.length = length;
            nodeCount = size * length; // currently not removed nodes in cells
            removedNodes = [];

            (function () { // initialize cells
                var i, j, node;
                // create head object (will never be removed) for each cell.
                for (i = 0; i < length; i += 1) {
                    // circular doubly linked list with only one empty element
                    node = {};
                    node.next = node;
                    node.prev = node;
                    cells[i] = node;
                }
                // create empty board
                for (i = size - 1; i >= 0; i -= 1) {

                    // use prototype to store value (to reduce memory usage)
                    T.prototype = new Node(i);

                    // add possible values for each cell as doubly linked list

                    for (j = 0; j < length; j += 1) {
                        node = new T();
                        node.insertAfter(cells[j]);
                        // node = {next: ?, prev: ?} -> {value: i} -> {remove(), ...}
                    }
                }
            }());

            // private functions of board

            remove = function (head, node) {
                node.remove();
                removedNodes.push(node);
                nodeCount -= 1;
            };

            undoUntil = function (oldLength) {
                var i, n = removedNodes.length - oldLength;
                for (i = 0; i < n; i += 1) {
                    removedNodes.pop().reInsert();
                }
                nodeCount += n;
            };

            removeValue = function (row, col, value) {
                var head, node;
                node = head = cells[col + row * size]; // get cell head
                for (;;) {
                    node = node.next;
                    if (node === head) { // value was already removed before
                        return false;
                    }
                    if (node.value === value) { // found node => remove node
                        remove(head, node);
                        // check if single value is left in cell
                        if (head.next === head.prev) {
                            triggerCellReducedToSingleValue(row, col, head.next.value);
                        }
                        return true;
                    }
                }
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
                        if (r !== row && c !== col) {
                            removeValue(r, c, value);
                        }
                    }
                }
            };

            _set = function (row, col, value) {
                // it is assumed that value holds correct value at this point and that there is never an empty cell
                var head, node;
                node = head = cells[col + row * size]; // get cell head
                // remove all values previous to given value
                for (;;) {
                    node = node.next;
                    if (node === head) { // value is not found!
                        throw {
                            message: "not possible to set value"
                        };
                    }
                    if (node.value === value) { // found node => remove following nodes
                        for (;;) {
                            node = node.next;
                            if (node === head) { // finished => single node left
                                triggerCellReducedToSingleValue(row, col, value);
                                return;
                            }
                            remove(head, node);
                        }
                    }
                    remove(head, node); // node was not found till now => remove this preceding node
                }
            };

            _get = function (row, col) {
                var node = cells[col + row * size];
                if (node !== node.next && node.next.next === node) { // single node
                    return node.next.value;
                }
                return null;
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
                    value = _get(row, col);
                    if (value !== null) {
                        value = symbols.charAt(value);
                    }
                    return value;
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