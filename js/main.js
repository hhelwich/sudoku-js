/*jslint  browser: true, bitwise: true */
/*globals jQuery, sudoku */
(function ($) {
    "use strict";

    var container = $(".container"),
        i,
        j,
        table,
        field,
        row,
        center = function () {
            container.css({
                top: Math.max(0, (($(window).height() - container.outerHeight()) / 2) +
                    $(window).scrollTop()) + "px",
                left: Math.max(0, (($(window).width() - container.outerWidth()) / 2) +
                    $(window).scrollLeft()) + "px"
            });
        },
        symb = "123456789ABCDEF",
        validateInputs = function (inputs) {
            var i, idx, val;
            for (i = 0; i < inputs.length; i += 1) {
                if (inputs[i].val().length === 0) { // field is not complete
                    return;
                }
            }
            // field is complete => validate content
            for (i = 0; i < inputs.length; i += 1) {
                idx = inputs[i].attr('id');
                val = inputs[i].val();
                if (field.solution[idx] !== symb.indexOf(val)) {
                    inputs[i].css("color", "#FF0000");
                } else {
                    inputs[i].css("color", "#00FF00");
                }
            }
        },
        createField = function () {
            var input,
                inputs = [],
                handleKeyUp = function () {
                    var input = $(this);
                    input.val($.trim(input.val()));
                    validateInputs(inputs);
                },
                size = $("select option:selected").val().split("x");

            // create empty sudoku field
            field = sudoku.createField(size[0], size[1]);

            // create empty sudoku 9x9 field table
            table = $("<table/>");
            for (i = 0; i < field.size; i += 1) {
                row = $("<tr/>");
                for (j = 0; j < field.size; j += 1) {
                    row.append('<td class="block' +
                        Math.floor(((i % (field.rows * 2)) / field.rows) +
                            Math.floor((j % (field.cols * 2)) / field.cols)) % 2 + '"/>');
                }
                table.append(row);
            }
            container.empty().append(table);
            table = $("td");
            // generate sudoku
            field.generate();
            center();

            // fill up table
            for (i = 0; i < field.length; i += 1) {
                if (field[i] === null) {
                    input = $('<input id="' + i + '" type="text"/>');
                    inputs.push(input);
                    input.keyup(handleKeyUp);
                    $(table.get(i)).append(input);
                } else {
                    $(table.get(i)).text(symb.charAt(field[i]));
                }
            }

        };

    // center content on page
    $(window).resize(center);

    $("input[type=button]").click(createField);

    createField();

}(jQuery));