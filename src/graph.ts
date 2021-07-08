import * as O from 'fp-ts/Option';
import {Option} from 'fp-ts/Option';

import {isValidPuzzle, isValid, merge, Place, Puzzle, SolutionTree} from './sudoku';

type Node = number[];

let leafNodeCount = 0;

export function* getChildren(min: number, max: number, puzzle: Puzzle, n: Node): Generator<Node, any, boolean> {
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


export function isSolution(n: Node, p: Puzzle): boolean {
  return (n.length === p.length);
}


let iterations = 0;

export function findSolution(
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


export const solve = (puzzle: Puzzle): Option<SolutionTree> => {
  iterations = 0;
  leafNodeCount = 0;
  let root: Node = [];
  const getChildrenLocal = (n: Node): Generator<Node, any, boolean> => getChildren(1, 9, puzzle, n);
  const isValidLocal = (n: number[]) => {return isValidPuzzle(merge(puzzle, n))};
  const isSolutionLocal = (n: number[]) => isSolution(n, puzzle);
  let solution = findSolution(root, getChildrenLocal, isValidLocal, isSolutionLocal);
  return solution;
}



