import * as fc from 'fast-check';
import { Arbitrary } from 'fast-check';
import * as O from 'fp-ts/Option';
import {Option} from 'fp-ts/Option';

import {isValidPuzzle, isValid, merge} from './sudoku.test';

type Node = number[];
type Place = Option<number>;
type Puzzle = Place[];
type SolutionTree = number[];

let leafNodeCount = 0;
function* getChildren(min: number, max: number, puzzle: Puzzle, n: Node): Generator<Node, any, boolean> {
  if (n.length >= puzzle.length) {
    ++leafNodeCount;
    return;
  }
  const currentNodeLen = n.length;
  if (O.isSome(puzzle[currentNodeLen])) {
    const puzzleValue = O.getOrElse(() => -1)(puzzle[currentNodeLen]);
    n.push(puzzleValue);
    yield n;
    n.pop();
  } else {
    for(let i=min; i<=max; i++) {
      n.push(i);
      yield n;
      n.pop();
    }
  }
}


describe('getChildren', () => {
  test('Returns min to max children',  () => {
    const puzzle = new Array(9).fill(O.none);
    let root: Node = [];
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
    let root: Node = [];
    const min = 1;
    const max = 3;
    const gen = getChildren(min, max, puzzle, root);
    expect(gen.next().value).toEqual([50]);
    expect(gen.next().done).toEqual(true);
  })
})

// function traverse(n: Node) {
//   const gen = getChildren(n);
//   let child = gen.next().value;
//   while (child !== undefined) {
//     traverse(child)
//     child = gen.next().value;
//   }
// }

function isSolution(n: Node, p: Puzzle): boolean {
  return (n.length === p.length);
}


let iterations = 0;

function findSolution(
  n: Node, 
  getChildrenLocal: (n: Node)=> Generator<Node, any, boolean>, 
  isValidLocal: (n: Node) => boolean, 
  isSolutionLocal: (n: Node) => boolean)
  : Option<Node> {

    ++iterations;
    if (!isValidLocal(n)) {
      return O.none;
    }
    if (isSolutionLocal(n)) {
      return O.some(n);
    }
    const gen = getChildrenLocal(n);
    let next = gen.next();
    while (!next.done) {
      let child = next.value;
      let solution = findSolution(child, getChildrenLocal, isValidLocal, isSolutionLocal);
      if (O.isSome(solution)) {
        return solution;
      }
      next = gen.next();
    }
    return O.none;
  }

describe('traverse tree', () => {
  test('fine solution does not find a solution',  () => {
    iterations = 0;
    leafNodeCount = 0;
    let root: Node = [];
    const puzzle = new Array(9).fill(O.none);
    const getChildrenLocal = (n: Node): Generator<Node, any, boolean> => getChildren(1, 3, puzzle, n);
    const isValidLocal = (n: number[]) => {return isValid({data: merge(puzzle, n), columns: 3})};
    const isSolutionLocal = (n: number[]) => isSolution(n, puzzle);
    let solution = findSolution(root, getChildrenLocal, isValidLocal, isSolutionLocal);
    expect(solution).toEqual(O.some([1,2,3,2,3,1,3,1,2]));
  })
})


const solve = (puzzle: Puzzle): Option<SolutionTree> => {
  iterations = 0;
  leafNodeCount = 0;
  let root: Node = [];
  const getChildrenLocal = (n: Node): Generator<Node, any, boolean> => getChildren(1, 9, puzzle, n);
  const isValidLocal = (n: number[]) => {return isValidPuzzle(merge(puzzle, n))};
  const isSolutionLocal = (n: number[]) => isSolution(n, puzzle);
  let solution = findSolution(root, getChildrenLocal, isValidLocal, isSolutionLocal);
  return solution;
}


describe('solve one square', () => {
  test('finds a solution to a 9',  () => {
    let root: Node = [];
    const puzzle: Puzzle = new Array(9).fill(O.none);
    const solution = solve(puzzle);
    expect(solution).toEqual(O.some([1,2,3,4,5,6,7,8,9]));
  })

  test('finds a solution to a 18',  () => {
    let root: Node = [];
    const puzzle: Puzzle = new Array(18).fill(O.none);
    const solution = solve(puzzle);
    expect(solution).toEqual(O.some([1,2,3,4,5,6,7,8,9, 4,5,6,7,8,9,1,2,3]));
  })
})

export {solve};
