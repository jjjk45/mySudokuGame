const { bestCell } = require('../src/js/logic');

describe('bestCell() -- the min or max remaining candidates cell', () => {

    test('finds the cell with the fewest candidates (single candidate)', () => {
        // board where only (0,0) can be 1
        const board = [
            [0,2,3,4,5,6,7,8,9],
            [4,5,6,7,8,9,1,2,3],
            [7,8,9,1,2,3,4,5,6],
            [2,3,4,5,6,7,8,9,1],
            [5,6,7,8,9,1,2,3,4],
            [8,9,1,2,3,4,5,6,7],
            [3,4,5,6,7,8,9,1,2],
            [6,7,8,9,1,2,3,4,5],
            [9,1,2,3,4,5,6,7,8]
        ];

        const res = bestCell(board, 'min');
        expect(res.r).toBe(0);
        expect(res.c).toBe(0);
        expect(res.candidates).toEqual([1]);
    });

    test('finds a cell with the most candidates on an empty board', () => {
        const empty = Array.from({length:9}, () => Array(9).fill(0));
        const res = bestCell(empty, 'max');
        expect(res.r).not.toBeNull();
        expect(res.c).not.toBeNull();
        expect(Array.isArray(res.candidates)).toBe(true);
        // on an empty board any cell should have all 9 candidates
        expect(res.candidates.length).toBe(9);
    });
});