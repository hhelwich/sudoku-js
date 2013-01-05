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
        symb = "123456789";

    // create empty sudoku 9x9 field table
    table = $("<table/>");
    for (i = 0; i < 9; i += 1) {
        row = $("<tr/>");
        for (j = 0; j < 9; j += 1) {
            row.append('<td class="block' + (~~((i % 6) / 3) + ~~((j % 6) / 3)) % 2 + '"/>');
        }
        table.append(row);
    }
    container.append(table);
    table = $("td");

    // center content on page
    $(window).resize(center);
    center();

    // generate sudoku
    field = sudoku.createField(3, 3);
    field.generate();

    // fill up table
    for (i = 0; i < 81; i += 1) {
        $(table.get(i)).html(field[i] === null ? '<input type="text"/>' : symb.charAt(field[i]));
    }

}(jQuery));