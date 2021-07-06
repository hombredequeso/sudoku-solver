import * as fc from 'fast-check';
import { Arbitrary } from 'fast-check';
import * as O from 'fp-ts/Option';
import {Option} from 'fp-ts/Option';

import { pipe } from 'fp-ts/function'

type Place = Option<number>;
type Puzzle = Place[];
type SolutionTree = number[];

interface Matrix<T> {
  data: T[]; 
  columns: number
}

const getColumn= <T>(m: Matrix<T>, column: number) => {
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

const rowCount= <T>(m: Matrix<T>) => {
  if (m.columns < 1) return 0;
  return Math.ceil((m.data.length||0) / m.columns);
}

describe('rowCount', () => {
  test('returns the number of rows in the matrix', () => {
    expect(rowCount({data:[], columns:1})).toEqual(0);
    expect(rowCount({data:[], columns:0})).toEqual(0);
    expect(rowCount({data:[1], columns:1})).toEqual(1);
    expect(rowCount({data:[1, 2], columns:1})).toEqual(2);
    expect(rowCount({data:[1, 2, 3, 4, 5, 6], columns:2})).toEqual(3);
    expect(rowCount({data:[1, 2, 3, 4, 5, 6, 7], columns:2})).toEqual(4);
  })

})

const merge = (puzzle: Place[], solutionTree: SolutionTree): Place[] => 
  puzzle.map((p,i) => 
    i < solutionTree.length ?
    O.some(solutionTree[i]) :
    p
  );

const intOption: Arbitrary<Option<number>> = fc.integer().map(i => O.some(i));
const intOption2: Arbitrary<Option<number>> = fc.boolean().chain(b => b ? intOption : fc.constant(O.none));

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
      const allAreSome = resultUpToSolnTree.every(x => O.isSome(x));
      expect(allAreSome).toEqual(true);
    }));
  });
});

describe('getColumn', () => {
  test('returns empty array for various combinations', () => {
    expect(getColumn({data:[], columns:0}, 0)).toEqual([]);
    expect(getColumn({data:[], columns:0}, 1)).toEqual([]);
    expect(getColumn({data:[], columns:0}, 1)).toEqual([]);
    expect(getColumn({data:[], columns:0}, 0)).toEqual([]);
    expect(getColumn({data:[], columns:0}, -1)).toEqual([]);
  });

  test('returns expected column data', () => {
    const matrix = {data: [0, 1, 2, 3,
                    10, 11, 12, 13,
                    20, 21, 22, 23],
      columns: 4};

    expect(getColumn(matrix, 0)).toEqual([0,10, 20]);
    expect(getColumn(matrix, 1)).toEqual([1, 11, 21]);
    expect(getColumn(matrix, 3)).toEqual([3, 13, 23]);
  })
});


const getRow = <T>(m: Matrix<T>, row: number) =>
  m.data.slice(row*m.columns, (row+1)*m.columns)


describe('getRow', () => {
  test('returns empty array for various combinations', () => {
    expect(getRow({data:[], columns: 0}, 0)).toEqual([]);
    expect(getRow({data: [], columns: 1}, 0)).toEqual([]);
    expect(getRow({data: [], columns: 0}, 1)).toEqual([]);
  });

  test('returns expected row data', () => {
    const matrix = {data: [0, 1, 2, 3,
                    10, 11, 12, 13,
                    20, 21, 22, 23],
      columns: 4};
    expect(getRow(matrix, 0)).toEqual([0,1,2,3]);
    expect(getRow(matrix, 1)).toEqual([10, 11,12,13]);
    expect(getRow(matrix, 2)).toEqual([20, 21, 22, 23]);
  })
})

const isValidRow = (m: Matrix<Option<number>>, row: number): boolean => 
  areAllSomesUnique(getRow(m, row));

const isValidColumn = (m: Matrix<Option<number>>, column: number): boolean => 
  areAllSomesUnique(getColumn(m, column));


const isValid = (m: Matrix<Option<number>>): boolean => {
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


describe('Work on a square', () => {
  test('a simple square test', () => {
    const matrix: number[] = [1, 2, 3,
                    2, 3, 1,
                    3, 1, 2];
    const liftedmatrix = matrix.map(x => O.some(x));
    const m: Matrix<Option<number>> = {data: liftedmatrix, columns: 3}

    for (let x=0;x<2;x++) {
      expect(isValidRow(m, x)).toEqual(true);
      expect(isValidColumn(m, x)).toEqual(true);
    }
  });



  test('isValid', () => {

    const matrix = 
      [1, 2, 3,
        2, 3, 1,
        3, 1, 2];

    const liftedmatrix = matrix.map(x => O.some(x));
    expect(isValid({data: liftedmatrix, columns: 3})).toEqual(true);
  })

})

const getSquareData = (sudokuPuzzle: Puzzle, square: number): Puzzle => {
  const startPos = square * 9;
  const secondRowShift = 9;
  const thirdRowShift = 18;

  const squareData = 
    sudokuPuzzle.slice(startPos, startPos + 3)
    .concat(sudokuPuzzle.slice(startPos + secondRowShift, startPos + secondRowShift +3))
    .concat(sudokuPuzzle.slice(startPos + thirdRowShift, startPos + thirdRowShift+ 3));
  return squareData;
}

const isValidSquare = (sudokuPuzzle: Puzzle, square: number): boolean => {
  const squareData = getSquareData(sudokuPuzzle, square);
  return areAllSomesUnique(squareData);
}


describe('isValidSquare', () => {
  test('is true if all numbers only appear once', () => {
    const m = new Array(81).fill(0).map((x,i) => i).map(x => O.some(x));
    for(let i = 0; i < 9; i++) {
      expect(isValidSquare(m, i)).toEqual(true);
    }
  })

  test('is false if there are any duplicates', () => {
    const m = new Array(81).fill(0).map((x,i) => i).map(x => O.some(x));
    m[1] = O.some(0);
    m[9] = O.some(11 + 9);
    expect(isValidSquare(m, 0)).toEqual(false);
    expect(isValidSquare(m, 1)).toEqual(false);
  })

  test('is true if there are nones', () => {
    const m = new Array(81).fill(0).map(x => O.none);
    for(let i = 0; i < 9; i++) {
      expect(isValidSquare(m, i)).toEqual(true);
    }
  });

  test('is true if there the array does not have elements', () => {
    const m = new Array(0);
    for(let i = 0; i < 9; i++) {
      expect(isValidSquare(m, i)).toEqual(true);
    }
  });
});



const areValidSquares = (puzzle: Puzzle, squares: number[]): boolean => {
  return squares.every(s => isValidSquare(puzzle, s));
}


describe('areValidSquares', () => {
  test('is true if all numbers only appear once', () => {
    const m = new Array(81).fill(0).map((x,i) => i).map(x => O.some(x));
    const squares = new Array(9).fill(0).map((x,i) => i);
    expect(areValidSquares(m, squares)).toEqual(true);
  })

  test('is false if there are any duplicates', () => {
    const m = new Array(81).fill(0).map((x,i) => i).map(x => O.some(x));
    m[1] = O.some(0);
    m[9] = O.some(11 + 9);
    const squares = new Array(9).fill(0).map((x,i) => i);
    expect(areValidSquares(m, squares)).toEqual(false);
  })

  test('is true if there are nones', () => {
    const m = new Array(81).fill(0).map(x => O.none);
    const squares = new Array(9).fill(0).map((x,i) => i);
    expect(areValidSquares(m, squares)).toEqual(true);
  });

  test('is true if there the array does not have elements', () => {
    const m = new Array(0);
    const squares = new Array(9).fill(0).map((x,i) => i);
    expect(areValidSquares(m, squares)).toEqual(true);
  });
});

const allSquares = new Array(9).fill(0).map((x,i) => i);

const isValidPuzzle = (puzzle: Puzzle): boolean => {
  const matrix = {data: puzzle, columns:9};
  return isValid(matrix) && areValidSquares(puzzle, allSquares);
};


describe('isValidPuzzle', () => {
  test('is true if all numbers only appear once', () => {
    const m = new Array(81).fill(0).map((x,i) => i).map(x => O.some(x));
    expect(isValidPuzzle(m)).toEqual(true);
  })

  test('is false if there are any duplicates', () => {
    const m = new Array(81).fill(0).map((x,i) => i).map(x => O.some(x));
    m[1] = O.some(0);
    m[9] = O.some(11 + 9);
    expect(isValidPuzzle(m)).toEqual(false);
  })

  test('is true if there are nones', () => {
    const m = new Array(81).fill(0).map(x => O.none);
    expect(isValidPuzzle(m)).toEqual(true);
  });

  test('is true if there the array does not have elements', () => {
    const m = new Array(0);
    expect(isValidPuzzle(m)).toEqual(true);
  });
});

const reducer = <T>(acc: T[], next: Option<T>) => 
  pipe(
    next,
    O.map(n => [...acc, n]),
    O.getOrElse(()=>acc)
  );

const areAllSomesUnique = (a: Option<number>[]): boolean => {
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


export {isValid, merge, isValidPuzzle};

