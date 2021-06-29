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

const getColumnData = <T>(arr: T[], rowSize: number, column: number) => {
  if (rowSize < 0 || column < 0) {
    return [];
  }
  let columnData = [];
  let pos = column;
  while (pos < arr.length) {
    columnData.push(arr[pos])
    pos = pos + rowSize;
  }
  return columnData;
}

describe('getColumnData', () => {
  test('returns empty array for various combinations', () => {
    expect(getColumnData([], 0, 0)).toEqual([]);
    expect(getColumnData([], 1, 1)).toEqual([]);
    expect(getColumnData([], 1, 1)).toEqual([]);
    expect(getColumnData([], -1, 0)).toEqual([]);
    expect(getColumnData([], 0, -1)).toEqual([]);
  });

  test('returns expected column data', () => {
    const matrix = [0, 1, 2, 3,
                    10, 11, 12, 13,
                    20, 21, 22, 23];

    expect(getColumnData(matrix, 4, 0)).toEqual([0,10, 20]);
    expect(getColumnData(matrix, 4, 1)).toEqual([1, 11, 21]);
    expect(getColumnData(matrix, 4, 3)).toEqual([3, 13, 23]);
  })
});


const getRowData = <T>(arr: T[], rowSize: number, row: number) =>
  arr.slice(row*rowSize, (row+1)*rowSize)


describe('getColumnData', () => {
  test('returns empty array for various combinations', () => {
    expect(getRowData([], 0, 0)).toEqual([]);
    expect(getRowData([], 1, 0)).toEqual([]);
    expect(getRowData([], 0, 1)).toEqual([]);
  });

  test('returns expected row data', () => {
    const matrix = [0, 1, 2, 3,
                    10, 11, 12, 13,
                    20, 21, 22, 23];
    expect(getRowData(matrix, 4, 0)).toEqual([0,1,2,3]);
    expect(getRowData(matrix, 4, 1)).toEqual([10, 11,12,13]);
    expect(getRowData(matrix, 4, 2)).toEqual([20, 21, 22, 23]);
  })
})

const isValidRow = (sudokuPuzzle: Puzzle, rowSize: number, row: number): Boolean => 
  areAllSomesUnique(getRowData(sudokuPuzzle, rowSize, row));

const isValidColumn = (sudokuPuzzle: Puzzle, rowSize: number, column: number): Boolean => 
  areAllSomesUnique(getColumnData(sudokuPuzzle, rowSize, column));


const isValid = (puzzle, rows, columns) => {
  const rowsValid = (new Array(rows).fill(0))
    .reduce(
      (acc, next, i)=> acc && isValidRow(puzzle, rows, i), 
      true);
  const columnsValid = (new Array(columns).fill(0))
    .reduce(
      (acc, next, i)=> acc && isValidColumn(puzzle, rows, i), 
      true);
  return rowsValid && columnsValid;
}


describe('Work on a square', () => {
  test('a simple square test', () => {
    const matrix = [1, 2, 3,
                    2, 3, 1,
                    3, 1, 2];
    const liftedmatrix = matrix.map(x => option(x));

    for (let x=0;x<2;x++) {
      expect(isValidRow(liftedmatrix, 3, x)).toEqual(true);
      expect(isValidColumn(liftedmatrix, 3, x)).toEqual(true);
    }
  });



  test('isValid', () => {

    const matrix = 
      [1, 2, 3,
        2, 3, 1,
        3, 1, 2];

    const liftedmatrix = matrix.map(x => option(x));
    expect(isValid(liftedmatrix,3,3)).toEqual(true);
  })

})

const getSquareData = (sudokuPuzzle: Puzzle, square: number): Puzzle => {
  const startPos = (square%3)* 27 + (square%3 * 3);
  const secondRowShift = 9;
  const thirdRowShift = 18;

  const squareData = 
    sudokuPuzzle.slice(startPos, 3)
    .concat(sudokuPuzzle.slice(startPos + secondRowShift, 3))
    .concat(sudokuPuzzle.slice(startPos + thirdRowShift, 3));
  return squareData;
}

const isValidSquare = (sudokuPuzzle: Puzzle, square: number): Boolean => {
  const squareData = getSquareData(sudokuPuzzle, square);
  return areAllSomesUnique(squareData);
}

const reducer = <T>(acc: T[], next: Option<T>) => 
  next.map<T[]>(n => [...acc, n]).getOrElse(()=>acc);

const areAllSomesUnique = (a: Option<number>[]): Boolean => {
  let start : number[] = [];
  const somes = a.reduce(reducer, start);
  return areAllElementsUnique(somes);
};

const arbArrayWithRepeats = <T>(arb: Arbitrary<T>): Arbitrary<T[]> => 
  fc.array(arb, {minLength: 1})
  .chain(arbs => fc.tuple(
    fc.constant(arbs), 
    fc.integer({min:arbs.length+1, max:arbs.length*2})))
  .chain(([seedArray, arrayLength]) => 
    fc.tuple(
      fc.constant(seedArray), 
      fc.array(fc.integer({min:0, max:seedArray.length - 1}), {minLength:arrayLength, maxLength: arrayLength}))
  )
  .map(([seedArray, positions]) =>
    positions.map(i => seedArray[i]) );

const areAllElementsUnique = (a: number[])=>
  (new Set<number>(a).size) === a.length;

describe('areAllElementsUnique', () => {
  test('returns true when there are no duplicates', () => {
    fc.assert(fc.property(fc.set(fc.integer()), (a) => {
      expect(areAllElementsUnique(a)).toEqual(true);
    }));
  })

  test('returns false when there are duplicates', () => {
    fc.assert(fc.property(arbArrayWithRepeats(fc.integer()), (a) => {
      expect(areAllElementsUnique(a)).toEqual(false);
    }));
  })
})


export {isValid, merge};
