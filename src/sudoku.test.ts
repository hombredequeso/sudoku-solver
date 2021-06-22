import * as fc from 'fast-check';
import { Arbitrary } from 'fast-check';
import {Option, option, none} from 'ts-option';

type Place = Option<number>;
type Puzzle = Place[];
type SolutionTree = number[];

const merge = (puzzle: Puzzle, solutionTree: SolutionTree): Puzzle => 
  puzzle.map((p,i) => 
    i < solutionTree.length ?
    option(solutionTree[i]) :
    p
  );

const intOption: Arbitrary<Option<number>> = fc.integer().map(i => option(i));
const intOption2: Arbitrary<Option<number>> = fc.boolean().chain(b => b ? intOption : fc.constant(none));

describe('merge', () => {
  test('merges puzzle and solutionTree', () => {
    fc.assert(fc.property(fc.array(intOption2), fc.array(fc.nat()), (intOptions, ints) => {
      const result = merge(intOptions, ints);
      expect(result.length).toEqual(intOptions.length);
    }));
  });

  test('All elements up to length of solutionTree should be Some', () => {
    fc.assert(fc.property(fc.array(intOption2), fc.array(fc.nat()), (intOptions, ints) => {
      const result = merge(intOptions, ints);
      const resultUpToSolnTree = result.slice(0, ints.length);
      const allAreSome = resultUpToSolnTree.every(x => x.isDefined);
      expect(allAreSome).toEqual(true);
    }));
  });
});

const getColumnData = (sudokuPuzzle: Puzzle, column: number, rowSize: number) => {
  let columnData = [];
  let pos = column;
  while (pos < sudokuPuzzle.length) {
    columnData.push(sudokuPuzzle[pos])
    pos = pos + rowSize;
  }
  return columnData;
}

const isValidRow = (sudokuPuzzle: Puzzle, row: number): Boolean => 
  areAllOptionElementsUnique(sudokuPuzzle.slice(row*9, 9));

const isValidColumn = (sudokuPuzzle: Puzzle, column: number): Boolean => 
  areAllOptionElementsUnique(getColumnData(sudokuPuzzle, column, 9));

const isValidSquare = (sudokuPuzzle: Puzzle, square: number): Boolean => {
  const startPos = (square%3)* 27 + (square%3 * 3);
  const secondRowShift = 9;
  const thirdRowShift = 18;

  const squareData = 
    sudokuPuzzle.slice(startPos, 3)
    .concat(sudokuPuzzle.slice(startPos + secondRowShift, 3))
    .concat(sudokuPuzzle.slice(startPos + thirdRowShift, 3));

  return areAllOptionElementsUnique(squareData);
}

const reducer = <T>(acc: T[], next: Option<T>) => 
  next.map(n => [...acc, n]).getOrElse(()=>acc);

const areAllOptionElementsUnique = (a: Option<number>[]): Boolean => {
  let start : number[] = [];
  const somes = a.reduce(reducer, start);
  return areAllElementsUnique(somes);
};

const areAllElementsUnique = (a: number[])=>
  (new Set<number>(a).size) === a.length;

// describe('isValidRow', () => {
//   test('returns true unless there are duplicates', () => {
//     fc.assert(fc.property(noRepeatArray, (a) => {
//       console.log(a)
//     }));
//   })
// })

