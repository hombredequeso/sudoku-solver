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
  areAllSomesUnique(sudokuPuzzle.slice(row*9, 9));

const isValidColumn = (sudokuPuzzle: Puzzle, column: number): Boolean => 
  areAllSomesUnique(getColumnData(sudokuPuzzle, column, 9));

const isValidSquare = (sudokuPuzzle: Puzzle, square: number): Boolean => {
  const startPos = (square%3)* 27 + (square%3 * 3);
  const secondRowShift = 9;
  const thirdRowShift = 18;

  const squareData = 
    sudokuPuzzle.slice(startPos, 3)
    .concat(sudokuPuzzle.slice(startPos + secondRowShift, 3))
    .concat(sudokuPuzzle.slice(startPos + thirdRowShift, 3));

  return areAllSomesUnique(squareData);
}

const reducer = <T>(acc: T[], next: Option<T>) => 
  next.map(n => [...acc, n]).getOrElse(()=>acc);

const areAllSomesUnique = (a: Option<number>[]): Boolean => {
  let start : number[] = [];
  const somes = a.reduce(reducer, start);
  return areAllElementsUnique(somes);
};

const arbArrayWithRepeats: Arbitrary<number[]> = 
  fc.array(fc.integer(), {minLength: 1})
  .chain(a => fc.tuple(fc.constant(a), fc.integer({min:a.length+1, max:a.length*2})))
  .chain(x => {
    const seedArray = x[0];
    const arrayLength = x[1];
    return fc.tuple(
      fc.constant(seedArray), 
      fc.array(fc.integer({min:0, max:seedArray.length - 1}), {minLength:arrayLength, maxLength: arrayLength}))
  })
  .map(x => {
    const seedArray = x[0];
    const positions = x[1];
    return positions.map(i => seedArray[i])
  });

const areAllElementsUnique = (a: number[])=>
  (new Set<number>(a).size) === a.length;

describe('areAllElementsUnique', () => {
  test('returns true when there are no duplicates', () => {
    fc.assert(fc.property(fc.set(fc.integer()), (a) => {
      expect(areAllElementsUnique(a)).toEqual(true);
    }));
  })

  test('returns false when there are duplicates', () => {
    fc.assert(fc.property(arbArrayWithRepeats, (a) => {
      console.log(a);
      expect(areAllElementsUnique(a)).toEqual(false);
    }));
  })
})

