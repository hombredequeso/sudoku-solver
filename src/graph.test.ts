import * as fc from 'fast-check';
import { Arbitrary } from 'fast-check';
import * as O from 'fp-ts/Option';
import {Option} from 'fp-ts/Option';

import {isValidPuzzle, isValid, merge, Place, Puzzle, SolutionTree} from './sudoku';
import {getChildren, isSolution, findSolution, solve} from './graph'


describe('getChildren', () => {
  test('Returns min to max children',  () => {
    const puzzle = new Array(9).fill(O.none);
    let root: SolutionTree = [];
    const min = 1;
    const max = 3;
    const gen = getChildren(min, max, puzzle, root);
    expect(gen.next().value).toEqual([1]);
    expect(gen.next().value).toEqual([2]);
    expect(gen.next().value).toEqual([3]);
    expect(gen.next().done).toEqual(true);
  })

  test('Returns one child if one specified in puzzle', () => {
    const puzzle = new Array(9).fill(O.none);
    puzzle[0] = O.some(50);
    let root: SolutionTree = [];
    const min = 1;
    const max = 3;
    const gen = getChildren(min, max, puzzle, root);
    expect(gen.next().value).toEqual([50]);
    expect(gen.next().done).toEqual(true);
  })
})


describe('traverse tree', () => {
  test('fine solution does not find a solution',  () => {
    let root: SolutionTree = [];
    const puzzle = new Array(9).fill(O.none);
    const getChildrenLocal = (n: SolutionTree): Generator<SolutionTree, any, boolean> => getChildren(1, 3, puzzle, n);
    const isValidLocal = (n: number[]) => {return isValid({data: merge(puzzle, n), columns: 3})};
    const isSolutionLocal = (n: number[]) => isSolution(n, puzzle);
    let solution = findSolution(root, getChildrenLocal, isValidLocal, isSolutionLocal);
    expect(solution).toEqual(O.some([1,2,3,2,3,1,3,1,2]));
  })
})


describe('solve one square', () => {
  test('finds a solution to a 9',  () => {
    let root: SolutionTree = [];
    const puzzle: Puzzle = new Array(9).fill(O.none);
    const solution = solve(puzzle);
    expect(solution).toEqual(O.some([1,2,3,4,5,6,7,8,9]));
  })

  test('finds a solution to a 18',  () => {
    let root: SolutionTree = [];
    const puzzle: Puzzle = new Array(18).fill(O.none);
    const solution = solve(puzzle);
    expect(solution).toEqual(O.some([1,2,3,4,5,6,7,8,9, 4,5,6,7,8,9,1,2,3]));
  })
})

