import * as fc from 'fast-check';
import { Arbitrary } from 'fast-check';
import {Option, option, none} from 'ts-option';

import {isValid, merge} from './sudoku.test';

type Node = number[];
type Place = Option<number>;
type Puzzle = Place[];

let leafNodeCount = 0;
function* getChildren(min: number, max: number, puzzle: Puzzle, n: Node) {
  // console.log({n});
  if (n.length >= puzzle.length) {
    ++leafNodeCount;
    return;
  }
  for(let i=min; i<=max; i++) {
    n.push(i);
    yield n;
    n.pop(i);
  }
}

function traverse(n: Node) {
  const gen = getChildren(n);
  let child = gen.next().value;
  while (child !== undefined) {
    traverse(child)
    child = gen.next().value;
  }
}

function isSolution(n: Node, p: Puzzle): boolean {
  return (n.length === p.length);
}


let iterations = 0;

function findSolution(n: Node, getChildrenLocal, isValidLocal, isSolutionLocal): Option<Node> {
  ++iterations;
  if (!isValidLocal(n)) {
    return none;
  }
  if (isSolutionLocal(n)) {
    return option(n);
  }
  const gen = getChildrenLocal(n);
  let next = gen.next();
  while (!next.done) {
    let child = next.value;
    let solution = findSolution(child, getChildrenLocal, isValidLocal, isSolutionLocal);
    if (solution.isDefined) {
      return solution;
    }
    next = gen.next();
  }
  return none;
}

describe('traverse tree', () => {
  test('fine solution does not find a solution',  () => {
    iterations = 0;
    leafNodeCount = 0;
    let root = [];
    const puzzle = new Array(9).fill(none);
    const getChildrenLocal = (n) => getChildren(1, 3, puzzle, n);
    const isValidLocal = (n) => {return isValid(merge(puzzle, n), 3, 3)};
    const isSolutionLocal = (n) => isSolution(n, puzzle);
    let solution = findSolution(root, getChildrenLocal, isValidLocal, isSolutionLocal);
    console.log({iterations, leafNodeCount, solution })
    expect(solution).toEqual(option([1,2,3,2,3,1,3,1,2]));
  })
})