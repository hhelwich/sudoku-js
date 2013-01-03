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
        addEase = function (rows, cols, fieldArray) {
            var i;
            if (fieldArray === undefined) { // no buffer given => create new array initialized with null
                fieldArray = [];
                fieldArray.length = rows * cols;
                fieldArray.rows = rows;
                fieldArray.cols = cols;
                for (i = fieldArray.length - 1; i >= 0; i-= 1) {
                    fieldArray[i] = null;
                }
            }

            // add convenient getter
            fieldArray.get = function (row, col) {
                return this[col + row * this.cols];
            };

            // add convenient setter
            fieldArray.set = function (row, col, value) {
                this[col + row * this.cols] = value;
            };

            return fieldArray;
        };

    global.sudoku = {
        addEase : addEase
    };
}(window));