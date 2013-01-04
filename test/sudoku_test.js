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

test( "test createField length", function() {
    strictEqual(sudoku.createField(3, 4).length, 3 * 4 * 3 * 4);
});

test( "test createField size", function() {
    strictEqual(sudoku.createField(3, 4).size, 3 * 4);
});

test( "test createField get", function() {
    var field = sudoku.createField(2, 3);
    strictEqual(field.get(0, 0), null);
    strictEqual(field.get(5, 5), null);
    strictEqual(field.get(5, 6), undefined);
    strictEqual(field.get(6, 5), undefined);
});

test( "test createField set / get", function() {
    var field = sudoku.createField(2, 3);
    strictEqual(field.get(5, 5), null);
    field.set(2, 3, 3);
    strictEqual(field.get(2, 3), 3);
});

test( "test createField array index", function() {
    var field = sudoku.createField(2, 3);
    strictEqual(field.get(1, 2), null);
    field.set(0, 1, 2);
    field.set(1, 0, 3);
    field.set(1, 2, 4);
    strictEqual(field.get(0, 1), 2);
    strictEqual(field.get(1, 0), 3);
    strictEqual(field.get(1, 2), 4);
    strictEqual(field[0 * field.size + 1], 2);
    strictEqual(field[1 * field.size + 0], 3);
    strictEqual(field[1 * field.size + 2], 4);
});

test( "test candidateTrackField", function() {
    var field = sudoku.createField(2, 3),
        ctField;
    field.set(0, 0, 0);
    field.set(1, 1, 1);
    field.set(2, 2, 2);
    field.set(1, 3, 3);
    field.set(0, 4, 4);
    field.set(1, 5, 5);
    field.set(2, 4, 0);
    field.set(3, 4, 1);
    field.set(4, 4, 2);
    field.set(5, 3, 4);
    ctField = sudoku.candidateTrackField(field);
    deepEqual(ctField.getRowCandidates(0), [1,2,3,5]);
    deepEqual(ctField.getRowCandidates(1), [0,2,4]);
    deepEqual(ctField.getRowCandidates(2), [1,3,4,5]);
    deepEqual(ctField.getRowCandidates(3), [0,2,3,4,5]);
    deepEqual(ctField.getRowCandidates(4), [0,1,3,4,5]);
    deepEqual(ctField.getRowCandidates(5), [0,1,2,3,5]);
    deepEqual(ctField.getColCandidates(0), [1,2,3,4,5]);
    deepEqual(ctField.getColCandidates(1), [0,2,3,4,5]);
    deepEqual(ctField.getColCandidates(2), [0,1,3,4,5]);
    deepEqual(ctField.getColCandidates(3), [0,1,2,5]);
    deepEqual(ctField.getColCandidates(4), [3,5]);
    deepEqual(ctField.getColCandidates(5), [0,1,2,3,4]);
    deepEqual(ctField.getBlockCandidates(0), [2,3,4,5]);
    deepEqual(ctField.getBlockCandidates(1), [0,1,2]);
    deepEqual(ctField.getBlockCandidates(2), [0,1,3,4,5]);
    deepEqual(ctField.getBlockCandidates(3), [2,3,4,5]);
    deepEqual(ctField.getBlockCandidates(4), [0,1,2,3,4,5]);
    deepEqual(ctField.getBlockCandidates(5), [0,1,3,5]);
    // remove 5 from three sets
    ctField.set(3, 1, 5);
    deepEqual(ctField.getRowCandidates(3), [0,2,3,4]);
    deepEqual(ctField.getColCandidates(1), [0,2,3,4]);
    deepEqual(ctField.getBlockCandidates(2), [0,1,3,4]);
    // replace with 3
    ctField.set(3, 1, 3);
    deepEqual(ctField.getRowCandidates(3), [0,2,4,5]);
    deepEqual(ctField.getColCandidates(1), [0,2,4,5]);
    deepEqual(ctField.getBlockCandidates(2), [0,1,4,5]);
    // remove element
    ctField.set(3, 1, null);
    deepEqual(ctField.getRowCandidates(3), [0,2,3,4,5]);
    deepEqual(ctField.getColCandidates(1), [0,2,3,4,5]);
    deepEqual(ctField.getBlockCandidates(2), [0,1,3,4,5]);
});
/* ignore test
test( "test solve", function() {
    var field = sudoku.createField(3, 3),
        expected = [
            5, 8, 2, 6, 7, 3, 4, 0, 1,
            3, 7, 6, 4, 0, 1, 8, 2, 5,
            0, 1, 4, 8, 5, 2, 7, 6, 3,
            8, 2, 1, 5, 4, 0, 3, 7, 6,
            4, 5, 7, 1, 3, 6, 2, 8, 0,
            6, 3, 0, 2, 8, 7, 5, 1, 4,
            2, 0, 8, 3, 6, 4, 1, 5, 7,
            7, 4, 5, 0, 1, 8, 6, 3, 2,
            1, 6, 3, 7, 2, 5, 0, 4, 8];
    // minimal unique solvable field with 17 entries
    field.set(0, 7, 0);
    field.set(1, 0, 3);
    field.set(2, 1, 1);
    field.set(3, 4, 4);
    field.set(3, 6, 3);
    field.set(3, 8, 6);
    field.set(4, 2, 7);
    field.set(4, 6, 2);
    field.set(5, 2, 0);
    field.set(5, 4, 8);
    field.set(6, 0, 2);
    field.set(6, 3, 3);
    field.set(6, 6, 1);
    field.set(7, 1, 4);
    field.set(7, 3, 0);
    field.set(8, 3, 7);
    field.set(8, 5, 5);
    field.solve();
    ok(solve(field));
    strictEqual(field, expected, "validate solution");
});
*/