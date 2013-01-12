/*jslint  browser: true, bitwise: true */
/*globals jQuery, sudoku */
(function ($) {
    "use strict";

    var container = $(".container"),
        i,
        j,
        table,
        field,
        field2,
        row,
        center = function () {
            container.css({
                top: Math.max(0, (($(window).height() - container.outerHeight()) / 2) +
                    $(window).scrollTop()) + "px",
                left: Math.max(0, (($(window).width() - container.outerWidth()) / 2) +
                    $(window).scrollLeft()) + "px"
            });
        },
        createField = function () {
            var input,
                tblc,
                handleKeyUp = function (row, col, input) {
                    var i, body, old;
                    field2.set(row, col, $.trim(input.val()));
                    if (field.solution.isEqual(field2)) {
                        for (i = 0; i < 200 * 5; i += 200) {
                            body = $("body");
                            old = body.css("background-color");
                            window.setTimeout(function () {
                                body.css("background-color", "#00FF00");
                            }, i);
                            window.setTimeout(function () {
                                body.css("background-color", old);
                            }, i + 100);
                        }
                    }
                },
                size = $("select option:selected").val().split("x");

            // create empty sudoku field
            field = hhelwi.sudoku.create(size[0], size[1], "123456789");
            // generate sudoku
            field.generate();
            field2 = field.clone();

            // create sudoku field table
            table = $("<table/>");
            for (i = 0; i < field.size; i += 1) {
                row = $("<tr/>");
                for (j = 0; j < field.size; j += 1) {
                    tblc = $('<td class="block' +
                        ~~(((i % (field.rows * 2)) / field.rows) +
                            ~~((j % (field.cols * 2)) / field.cols)) % 2 + '"/>');
                    if (field.get(i, j) === null) {
                        input = $('<input type="text"/>');
                        (function () {
                            var row = i, col = j, inpt = input;
                            input.keyup(function () {
                                handleKeyUp(row, col, inpt);
                            });
                        }());
                        tblc.append(input);
                    } else {
                        tblc.text(field.get(i, j));
                    }
                    row.append(tblc);
                }
                table.append(row);
            }
            container.empty().append(table);
            center();


        };

    // center content on page
    $(window).resize(center);

    $("input[type=button]").click(createField);

    createField();

}(jQuery));