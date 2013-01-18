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

hhelwi.sudoku = (function () {
    "use strict";

    var board, createBoard;

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
            var size, length, cells, _set, triggerCellReducedToSingleValue;

            // create private board fields
            size = blockHeight * blockWidth;
            length = size * size;
            cells = [];
            cells.length = length;

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

            triggerCellReducedToSingleValue = function (row, col, value) {
                //TODO calculate group intersections
            };

            _set = function (row, col, value) {
                // it is assumed that value holds correct value at this point and that there is never an empty cell
                var head, node;
                node = head = cells[col + row * size]; // get cell head
                // remove all values previous to given value
                while (true) {
                    node = node.next;
                    if (node === head) { // value is not found!
                        throw {
                            message: "not possible to set value"
                        };
                    }
                    if (node.value === value) { // found node => remove following nodes
                        while (true) {
                            node = node.next;
                            if (node === head) { // finished => single node left
                                triggerCellReducedToSingleValue(row, col, value);
                                return;
                            }
                            node.remove();
                        }
                    }
                    node.remove(); // not was not found till now => remove this previous node
                }
            };

            return { // create new board object with public API
                set: (function () {
                    if (symbols !== undefined) {
                        return function (row, col, value) {
                            if (value !== null) {
                                value = symbols.indexOf(value);
                            }
                            if (value === null || value < 0 || value >= size) {
                                throw {
                                    message: "invalid value"
                                };
                            }
                            _set(row, col, value);
                        };
                    }
                    return function (row, col, value) {
                        if (value !== null) {
                            _set(row, col, value);
                        }
                    };
                }())
            };
        };
    }());

    return { // public API
        create: createBoard
    };

}());