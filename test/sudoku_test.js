/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false, sudoku:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/

/*
 ======== A Handy Little QUnit Reference ========
 http://docs.jquery.com/QUnit

 Test methods:
 expect(numAssertions)
 stop(increment)
 start(decrement)
 Test assertions:
 ok(value, [message])
 equal(actual, expected, [message])
 notEqual(actual, expected, [message])
 deepEqual(actual, expected, [message])
 notDeepEqual(actual, expected, [message])
 strictEqual(actual, expected, [message])
 notStrictEqual(actual, expected, [message])
 raises(block, [expected], [message])
 */

test( "test addEase length", function() {
    strictEqual(sudoku.addEase(3, 4).length, 3 * 4);
});

test( "test addEase get", function() {
    var field = sudoku.addEase(2, 2);
    strictEqual(field.get(0, 0), null);
    strictEqual(field.get(1, 1), null);
    strictEqual(field.get(1, 2), undefined);
    strictEqual(field.get(2, 1), undefined);
});