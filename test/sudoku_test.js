/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false, hhelwi:false*/
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

// test public api

test( "test createField length", function() {
    strictEqual(hhelwi.sudoku.create(3, 4).length, 3 * 4 * 3 * 4);
});

test( "test createField size", function() {
    strictEqual(hhelwi.sudoku.create(3, 4).size, 3 * 4);
});

test( "test createField get", function() {
    var field = hhelwi.sudoku.create(2, 3);
    strictEqual(field.get(0, 0), null);
    strictEqual(field.get(5, 5), null);
    strictEqual(field.get(5, 6), undefined);
    strictEqual(field.get(6, 5), undefined);
});

test( "test createField set / get", function() {
    var field = hhelwi.sudoku.create(2, 3);
    strictEqual(field.get(5, 5), null);
    field.set(2, 3, 3);
    strictEqual(field.get(2, 3), 3);
});

test( "test createField array index", function() {
    var field = hhelwi.sudoku.create(2, 3);
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

test( "test field getBlockIndex", function() {
    var field = hhelwi.sudoku.create(2, 3);
    strictEqual(field.getBlockIndex(0, 0), 0);
    strictEqual(field.getBlockIndex(0, 1), 0);
    strictEqual(field.getBlockIndex(0, 2), 0);
    strictEqual(field.getBlockIndex(0, 3), 1);
    strictEqual(field.getBlockIndex(0, 5), 1);
    strictEqual(field.getBlockIndex(0, 6), undefined);
    strictEqual(field.getBlockIndex(0, 0), 0);
});

function createCandidateTrackField() {
    var field = hhelwi.sudoku.create(2, 3),
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
    ctField = hhelwi.sudoku.internals.candidateTrackField(field);
    return ctField;
}

test( "test solve", function() {
    var field = hhelwi.sudoku.create(3, 3),
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
    ok(field.solve());
    deepEqual(field, expected, "validate solution");
});

test( "test solve empty", function() {
    ok(hhelwi.sudoku.create(3, 3).solve(), "solve empty 9x9");
});

test( "test generate from empty", function() {
    var field = hhelwi.sudoku.create(3, 3), f2;
    ok(field.generate(), "generate from empty 9x9");
    f2 = field.clone();
    notDeepEqual(f2, field.solution);
    f2.solve();
    deepEqual(f2, field.solution);
});

// ------------------------------------------------------------- test internals

test( "test internal util firstSetBit", function() {
    var firstSetBit = hhelwi.sudoku.internals.firstSetBit;
    strictEqual(firstSetBit(0), -1);
    strictEqual(firstSetBit(1), 0);
    strictEqual(firstSetBit(2), 1);
    strictEqual(firstSetBit(3), 0);
    strictEqual(firstSetBit(4), 2);
    strictEqual(firstSetBit(~0), 0);
    strictEqual(firstSetBit(1 << 31), 31);
    // works only up to 32 bits as double64 gets converted to int32 for bit operations
    strictEqual(firstSetBit(1 << 32), 0);
});

test( "test internal util numberOfSetBits", function() {
    var numberOfSetBits = hhelwi.sudoku.internals.numberOfSetBits;
    strictEqual(numberOfSetBits(0), 0);
    strictEqual(numberOfSetBits(1), 1);
    strictEqual(numberOfSetBits(2), 1);
    strictEqual(numberOfSetBits(4), 1);
    strictEqual(numberOfSetBits(8), 1);
    strictEqual(numberOfSetBits(16), 1);
    strictEqual(numberOfSetBits(3), 2);
    strictEqual(numberOfSetBits(6), 2);
    strictEqual(numberOfSetBits(15), 4);
    strictEqual(numberOfSetBits(31), 5);
    strictEqual(numberOfSetBits(7 << 29), 3);
    strictEqual(numberOfSetBits(7 << 30), 2);
    strictEqual(numberOfSetBits(7 << 31), 1);
    strictEqual(numberOfSetBits(7 << 32), 3); // why?
    strictEqual(numberOfSetBits(~0), 32);
    strictEqual(numberOfSetBits(~0 << 1), 31);
});

test( "test shuffle", function() {
    var shuffle = hhelwi.sudoku.internals.shuffle;
    var array = [0,1,2,3,4,5,6,7,8],
        ar2,
        i,
        j,
        k,
        l;
    for (l = 0; l < 9; l += 1) {
        for (k = 0; k < 9;) {
            ar2 = array.slice();
            shuffle(ar2);
            strictEqual(ar2.length, 9);
            // check all numbers are still elements of array
            outer:
                for (i = 0; i < 9; i += 1) {
                    for (j = 0; j < 9; j += 1) {
                        if (ar2[j] === i) {
                            continue outer;
                        }
                    }
                    ok(false);
                }
            // check every number comes at some time at position l
            if (ar2[l] === k) {
                k += 1;
            }
        }
    }
});

test( "test candidateTrackField", function() {
    var ctField = createCandidateTrackField();
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

test( "test candidateTrackField getMinIndices", function() {
    var ctField = createCandidateTrackField();
    deepEqual(ctField.getMinIndices(), [{  // single field with no candidates (unsolvable field)
        row: 1,
        col: 4,
        cand: 0 // empty set
    }]);
    ctField.set(0, 4, null);
    ctField.set(3, 4, null);
    deepEqual(ctField.getMinIndices(), [{ // two fields (1,2) & (1,4) with one candidate (4)
        row: 1,
        col: 2,
        cand: 1 << 4 // {4}
    },{
        row: 1,
        col: 4,
        cand: 1 << 4 // {4}
    }]);
    ctField.set(1, 1, null);
    ctField.set(4, 1, 0);
    ctField.set(4, 0, 1);
    deepEqual(ctField.getMinIndices(), [{ // two fields (1,2) & (1,4) with one candidate (5) / (3)
        row: 4,
        col: 3,
        cand: 1 << 5 // {5}
    },{
        row: 4,
        col: 5,
        cand: 1 << 3 // {3}
    }]);
});
