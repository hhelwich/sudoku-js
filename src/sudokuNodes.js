/*
 * sudoku-js
 * https://github.com/hhelwich/sudoku-js
 *
 * Copyright (c) 2013 Hendrik Helwich
 * Licensed under the GPLv3 license.
 */
/*global IN_TEST:false */

(function () {
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

        return function (blockHeight, blockWidth, values) {
            var cells, size, length, i, j, node;

            size = blockHeight * blockWidth;
            length = size * size;

            cells = [];
            cells.length = length;

            // create header object (will never be removed) for each cell.
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

            return { // create new board object
                blockHeight: blockHeight,
                blockWidth: blockWidth,
                values: values,
                size: size,
                length: length,
                cells: cells
            };
        };
    }());

    board = createBoard(3, 3, "123456789");

}());