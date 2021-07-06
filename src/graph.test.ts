import * as fc from 'fast-check';
import { Arbitrary } from 'fast-check';
import * as O from 'fp-ts/Option';
import {Option} from 'fp-ts/Option';

import {isValid, merge} from './sudoku.test';

type Node = number[];
type Place = Option<number>;
type Puzzle = Place[];

let leafNodeCount = 0;
function* getChildren(min: number, max: number, puzzle: Puzzle, n: Node): Generator<Node, any, boolean> {
  if (n.length >= puzzle.length) {
    ++leafNodeCount;
    return;
  }
  for(let i=min; i<=max; i++) {
    n.push(i);
    yield n;
    n.pop();
  }
}

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
    // console.log({iterations, leafNodeCount, solution })
    expect(solution).toEqual(O.some([1,2,3,2,3,1,3,1,2]));
  })
})
