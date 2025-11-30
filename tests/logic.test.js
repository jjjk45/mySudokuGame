import { bestCell } from "../src/js/logic";

describe('bestCell() -- finds the best empty cell (0 = empty) by min or max remaining candidates', () => {
    describe('mode = "min"', () => {
        test('finds the cell with the fewest candidates (single candidate)', () => {
            const board = [
                [1,2,3,4,5,6,7,8,9],
                [4,5,6,7,8,9,1,2,3],
                [7,8,9,1,2,3,4,5,6],
                [2,3,4,5,6,7,8,9,1],
                [5,6,7,8,9,1,2,3,4],
                [8,9,1,2,3,0,5,6,7],
                [3,4,5,6,7,8,9,1,2],
                [6,7,8,9,1,2,3,4,5],
                [9,1,2,3,4,5,6,7,8]
            ];
            const res = bestCell(board, 'min');
            expect(res.r).toBe(5);
            expect(res.c).toBe(5);
            expect(res.candidates).toBeInstanceOf(Array);
            expect(res.candidates).toEqual([4]);
        });
        test('returns nulls and empty array when no empty cells exist', () => {
        const fullBoard = [
            [1,2,3,4,5,6,7,8,9],
            [4,5,6,7,8,9,1,2,3],
            [7,8,9,1,2,3,4,5,6],
            [2,3,4,5,6,7,8,9,1],
            [5,6,7,8,9,1,2,3,4],
            [8,9,1,2,3,4,5,6,7],
            [3,4,5,6,7,8,9,1,2],
            [6,7,8,9,1,2,3,4,5],
            [9,1,2,3,4,5,6,7,8]
        ];
        const res = bestCell(fullBoard, 'min');
        expect(res.r).toBeNull();
        expect(res.c).toBeNull();
        expect(res.candidates).toEqual([]);
        });
        test('group of cells tie for fewest candidates, returns first found', () => {
        const board = [
            [1,2,3,4,5,6,7,8,9],
            [4,5,6,7,8,9,1,2,3],
            [7,8,9,1,2,3,4,5,6],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [3,4,5,6,7,8,9,1,2],
            [6,7,8,9,1,2,3,4,5],
            [9,1,2,3,4,5,6,7,8]
        ];
        const res = bestCell(board, 'min');
        expect(res.r).toBe(3);
        expect(res.c).toBe(0);
        expect(res.candidates).toBeInstanceOf(Array);
        expect(res.candidates).toHaveLength(3);
        });
    });
    describe('mode = "max"', () => {
        test('finds a cell with the most candidates on an empty board', () => {
            const empty = Array.from({length:9}, () => Array(9).fill(0));
            const res = bestCell(empty, 'max');
            expect(res.r).not.toBeNull();
            expect(res.c).not.toBeNull();
            expect(res.candidates).toBeInstanceOf(Array);
            expect(res.candidates).toHaveLength(9);
        });
        test('returns nulls and empty array when no empty cells exist', () => {
        const fullBoard = [
            [1,2,3,4,5,6,7,8,9],
            [4,5,6,7,8,9,1,2,3],
            [7,8,9,1,2,3,4,5,6],
            [2,3,4,5,6,7,8,9,1],
            [5,6,7,8,9,1,2,3,4],
            [8,9,1,2,3,4,5,6,7],
            [3,4,5,6,7,8,9,1,2],
            [6,7,8,9,1,2,3,4,5],
            [9,1,2,3,4,5,6,7,8]
        ];
        const res = bestCell(fullBoard, 'max');
        expect(res.r).toBeNull();
        expect(res.c).toBeNull();
        expect(res.candidates).toEqual([]);
        });
        test('group of cells tie for most candidates, returns first found', () => {
        const board = [
            [1,2,3,4,5,6,7,8,9],
            [4,5,6,7,8,9,1,2,3],
            [7,8,9,1,2,3,4,5,6],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [3,4,5,6,7,8,9,1,2],
            [6,7,8,9,1,2,3,4,5],
            [9,1,2,3,4,5,6,7,8]
        ];
        const res = bestCell(board, 'max');
        expect(res.r).toBe(3);
        expect(res.c).toBe(0);
        expect(res.candidates).toBeInstanceOf(Array);
        expect(res.candidates).toHaveLength(3);
        });
    });
    test('invalid mode logs error and defaults to "min"', () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const board = [
            [1,2,3,4,5,6,7,8,9],
            [2,3,4,5,6,7,8,9,1],
            [3,4,5,6,7,8,9,1,2],
            [4,5,6,7,8,9,1,2,3],
            [5,6,7,8,9,1,2,3,4],
            [6,7,8,9,1,2,3,4,5],
            [7,8,9,1,2,3,4,5,6],
            [8,9,1,2,3,4,5,6,7],
            [9,1,2,3,4,5,6,7,8]
        ];
        const res = bestCell(board, 'goo');
        expect(console.error).toHaveBeenCalledWith('Unknown mode "goo" in bestCell(), defaulting to "min"');
        errorSpy.mockRestore();
        expect(res.r).toBeNull();
        expect(res.c).toBeNull();
        expect(res.candidates).toEqual([]);
    });
});