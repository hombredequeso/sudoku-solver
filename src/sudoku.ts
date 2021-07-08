import * as O from 'fp-ts/Option';
import {Option} from 'fp-ts/Option';

import { pipe } from 'fp-ts/function'

export type Place = Option<number>;
export type Puzzle = Place[];
export type SolutionTree = number[];

export interface Matrix<T> {
  data: T[]; 
  columns: number
}

export const getColumn= <T>(m: Matrix<T>, column: number) => {
  if (m.columns < 0 || column < 0) {
    return [];
  }
  let columnData = [];
  let pos = column;
  while (pos < m.data.length) {
    columnData.push(m.data[pos])
    pos = pos + m.columns;
  }
  return columnData;
}

export const rowCount= <T>(m: Matrix<T>) => {
  if (m.columns < 1) return 0;
  return Math.ceil((m.data.length||0) / m.columns);
}


export const merge = (puzzle: Place[], solutionTree: SolutionTree): Place[] => 
  puzzle.map((p,i) => 
    i < solutionTree.length ?
    O.some(solutionTree[i]) :
    p
  );


export const getRow = <T>(m: Matrix<T>, row: number) =>
  m.data.slice(row*m.columns, (row+1)*m.columns)


export const isValidRow = (m: Matrix<Option<number>>, row: number): boolean => 
  areAllSomesUnique(getRow(m, row));

export const isValidColumn = (m: Matrix<Option<number>>, column: number): boolean => 
  areAllSomesUnique(getColumn(m, column));


export const isValid = (m: Matrix<Option<number>>): boolean => {
  const rows = rowCount(m);
  const rowsValid = (new Array(rows).fill(0))
    .reduce(
      (acc, next, i)=> acc && isValidRow(m, i), 
      true);
  const columnsValid = (new Array(m.columns).fill(0))
    .reduce(
      (acc, next, i)=> acc && isValidColumn(m, i), 
      true);
  return rowsValid && columnsValid;
}



export const getSquareData = (sudokuPuzzle: Puzzle, square: number): Puzzle => {
  const startPos = (Math.floor(square/3)*27) + (square%3 * 3);
  const secondRowShift = 9;
  const thirdRowShift = 18;

  const squareData = 
    sudokuPuzzle.slice(startPos, startPos + 3)
    .concat(sudokuPuzzle.slice(startPos + secondRowShift, startPos + secondRowShift +3))
    .concat(sudokuPuzzle.slice(startPos + thirdRowShift, startPos + thirdRowShift+ 3));
  return squareData;
}

export const isValidSquare = (sudokuPuzzle: Puzzle, square: number): boolean => {
  const squareData = getSquareData(sudokuPuzzle, square);
  return areAllSomesUnique(squareData);
}


export const areValidSquares = (puzzle: Puzzle, squares: number[]): boolean => {
  return squares.every(s => isValidSquare(puzzle, s));
}

export const allSquares = new Array(9).fill(0).map((x,i) => i);

export const isValidPuzzle = (puzzle: Puzzle): boolean => {
  const matrix = {data: puzzle, columns:9};
  return isValid(matrix) && areValidSquares(puzzle, allSquares);
};


export const reducer = <T>(acc: T[], next: Option<T>) => 
  pipe(
    next,
    O.map(n => [...acc, n]),
    O.getOrElse(()=>acc)
  );

export const areAllSomesUnique = (a: Option<number>[]): boolean => {
  let start : number[] = [];
  const somes = a.reduce(reducer, start);
  return areAllElementsUnique(somes);
};


export const areAllElementsUnique = (a: number[])=>
  (new Set<number>(a).size) === a.length;


// export {isValid, merge, isValidPuzzle};
