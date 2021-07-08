import * as O from 'fp-ts/Option';
import {Option} from 'fp-ts/Option';

import {isValidPuzzle, isValid, merge, Place, Puzzle, SolutionTree} from './sudoku';


export function* getChildren(min: number, max: number, puzzle: Puzzle, n: SolutionTree): Generator<SolutionTree, any, boolean> {
  if (n.length >= puzzle.length) {
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


export function isSolution(n: SolutionTree, p: Puzzle): boolean {
  return (n.length === p.length);
}


export function findSolution(
  n: SolutionTree, 
  getChildrenLocal: (n: SolutionTree)=> Generator<SolutionTree, any, boolean>, 
  isValidLocal: (n: SolutionTree) => boolean, 
  isSolutionLocal: (n: SolutionTree) => boolean)
  : Option<SolutionTree> {

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
  let root: SolutionTree = [];
  const getChildrenLocal = (n: SolutionTree): Generator<SolutionTree, any, boolean> => getChildren(1, 9, puzzle, n);
  const isValidLocal = (n: number[]) => {return isValidPuzzle(merge(puzzle, n))};
  const isSolutionLocal = (n: number[]) => isSolution(n, puzzle);
  let solution = findSolution(root, getChildrenLocal, isValidLocal, isSolutionLocal);
  return solution;
}



