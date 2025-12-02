import { bestCell, shuffle, isValid, fillRandomBoard } from "../src/js/logic";


describe('bestCell() -- finds the best empty cell (0 = empty) by min or max remaining candidates', () => {
    describe('mode = "min"', () => {
        test('finds the cell with the fewest candidates', () => {
            const board = [
                [0,0,0,0,0,7,5,4,0],
                [0,0,5,3,0,4,0,1,0],
                [0,0,0,0,6,0,3,0,8],
                [0,0,0,0,0,9,6,0,0],
                [0,0,0,6,0,2,0,0,3],
                [0,5,0,0,0,8,0,2,0],
                [0,0,1,4,0,3,0,0,0],
                [7,0,6,0,0,0,0,8,0],
                [8,0,0,0,0,0,0,0,1]
            ];
            const res = bestCell(board, 'min');
            expect(res.r).toBe(2);
            expect(res.c).toBe(5);
            expect(res.candidates).toBeInstanceOf(Array);
            expect(res.candidates).toEqual([1,5]);
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
            expect(res.candidates).toBeInstanceOf(Array);
            expect(res.candidates).toEqual([]);
        });
        test('returns the earliest cell when multiple cells have the same minimum candidate count', () => {
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
            const empty = Array(9).fill().map(() => Array(9).fill(0));
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
        bestCell(board, 'goo');
        expect(console.error).toHaveBeenCalledWith('Unknown mode "goo" in bestCell(), defaulting to "min"');
        errorSpy.mockRestore();
    });
});

describe('shuffle() -- shuffles an array in place using Fisher-Yates algorithm', () => {
    test('maintains original array length', () => {
        const arr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
        const originalLength = arr.length;
        shuffle(arr);
        expect(arr.length).toBe(originalLength);
    });
    test('maintains all original array elements', () => {
        const arr = [
            11, 14, 26,  1, 23, 25, 20, 28,  8,
            4, 30,  5,  6, 15, 29,  7, 21, 10,
            27, 19, 16, 22,  3,  9, 13, 17, 12,
            2, 24, 18
        ];
        const arrCopy = arr.slice();
        shuffle(arr);
        expect(arr.sort()).toEqual(arrCopy.sort());
    });
});

describe('isValid() -- checks if a number can be placed in a specific cell without violating Sudoku rules', () => {
    test('returns true for valid placement', () => {
        const board = [
            [1,2,3,4,5,6,7,8,9],
            [4,5,6,7,8,9,1,2,3],
            [7,8,9,1,2,3,4,5,6],
            [2,3,4,5,6,7,8,9,1],
            [5,6,7,8,0,1,2,3,4],
            [8,9,1,2,3,4,5,6,7],
            [3,4,5,6,7,8,9,1,2],
            [6,7,8,9,1,2,3,4,5],
            [9,1,2,3,4,5,6,7,8]
        ];
        expect(isValid(board, 4, 4, 9)).toBe(true);
    });
    test('returns true for multiple valid placements in same space', () => {
        const board = [
            [1,2,3,4,5,6,7,8,9],
            [4,5,6,7,8,9,1,2,3],
            [7,8,9,1,2,3,4,5,6],
            [2,3,4,5,6,7,8,9,1],
            [5,6,7,8,9,1,2,3,4],
            [8,9,1,2,3,4,5,6,7],
            [3,4,5,0,7,8,9,1,2],
            [0,7,8,0,1,2,0,4,5],
            [9,1,2,0,4,5,6,7,8]
        ];
        expect(isValid(board, 7, 3, 9)).toBe(true);
        expect(isValid(board, 7, 3, 3)).toBe(true);
        expect(isValid(board, 7, 3, 6)).toBe(true);
    });
    test('returns false for invalid placements', () => {
        const board = [
            [0,2,3,4,5,6,7,8,9],
            [4,5,6,7,8,9,1,2,3],
            [7,8,9,1,2,3,4,5,6],
            [2,3,4,5,6,7,8,9,1],
            [5,6,7,8,9,1,2,3,4],
            [8,9,1,2,3,4,5,6,7],
            [3,4,5,6,7,8,9,1,2],
            [0,7,8,0,1,2,0,4,5],
            [9,1,2,0,4,5,6,7,8]
        ];
        expect(isValid(board, 0, 0, 5)).toBe(false);
        expect(isValid(board, 0, 0, 9)).toBe(false);
        expect(isValid(board, 0, 1, 2)).toBe(false);
    });
});

describe('fillRandomBoard() -- in place fills a Sudoku board randomly while adhering to Sudoku rules', () => {
    test('successfully fills an empty board', () => {
        const board = Array(9).fill().map(() => Array(9).fill(0));
        const result = fillRandomBoard(board);
        expect(result).toBe(true);
        for(let r=0; r<9; r++) {
            for(let c=0; c<9; c++) {
                expect(board[r][c]).toBeGreaterThanOrEqual(1);
                expect(board[r][c]).toBeLessThanOrEqual(9);
            }
        }
    });
    test('does not alter a partially filled valid board', () => {
        const board = [
            [0,0,0,0,0,7,5,4,0],
            [0,0,5,3,0,4,0,1,0],
            [0,0,0,0,6,0,3,0,8],
            [0,0,0,0,0,9,6,0,0],
            [0,0,0,6,0,2,0,0,3],
            [0,5,0,0,0,8,0,2,0],
            [0,0,1,4,0,3,0,0,0],
            [7,0,6,0,0,0,0,8,0],
            [8,0,0,0,0,0,0,0,1]
        ];
        fillRandomBoard(board);
        expect(board[0][5]).toBe(7);
        expect(board[0][6]).toBe(5);
        expect(board[1][2]).toBe(5);
        expect(board[3][5]).toBe(9);
        expect(board[6][2]).toBe(1);
        expect(board[8][0]).toBe(8);
        expect(board[8][8]).toBe(1);
    });
});