import * as fc from 'fast-check';
import { Arbitrary } from 'fast-check';

import * as O from 'fp-ts/Option';
import {Option} from 'fp-ts/Option';
import { pipe } from 'fp-ts/function'

import {Place, Puzzle, SolutionTree, rowCount, merge, getColumn, getRow, Matrix, isValidColumn, isValidSquare, isValidRow, isValid, areValidSquares, isValidPuzzle, areAllElementsUnique } from './sudoku';


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


const someOption: Arbitrary<Option<number>> = fc.integer().map(i => O.some(i));
const intOption: Arbitrary<Option<number>> = fc.boolean().chain(b => b ? someOption : fc.constant(O.none));

describe('merge', () => {
  test('merges puzzle and solutionTree', () => {
    fc.assert(fc.property(fc.array(intOption), fc.array(fc.nat()), (intOptions, ints) => {
      const result = merge(intOptions, ints);
      expect(result.length).toEqual(intOptions.length);
    }));
  });

  test('All elements up to length of solutionTree should be Some', () => {
    fc.assert(fc.property(fc.array(intOption), fc.array(fc.nat()), (intOptions, ints) => {
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



describe('isValidSquare', () => {
  test('is true if all numbers only appear once', () => {
    const m = new Array(81).fill(0).map((x,i) => i).map(x => O.some(x));
    for(let i = 0; i < 9; i++) {
      expect(isValidSquare(m, i)).toEqual(true);
    }
  })


  test('is valid square special', () => {
    const p = [1,2,3,4,5,6,7,8,9, 4,5,6, 7].map(x => O.some(x));
    expect(isValidSquare(p, 0)).toEqual(true);
    expect(isValidSquare(p, 1)).toEqual(true);
    expect(isValidSquare(p, 2)).toEqual(true);
  })


  test('is false if there are any duplicates', () => {
    const m = new Array(81).fill(0).map((x,i) => i).map(x => O.some(x));
    m[0] = O.some(100);
    m[9] = O.some(100);

    m[5] = O.some(200);
    m[14] = O.some(200);

    m[7] = O.some(300);
    m[16] = O.some(300);

    m[27] = O.some(400);
    m[28] = O.some(400);

    m[30] = O.some(500);
    m[39] = O.some(500);

    expect(isValidSquare(m, 0)).toEqual(false); 
     expect(isValidSquare(m, 1)).toEqual(false);
     expect(isValidSquare(m, 2)).toEqual(false);
     expect(isValidSquare(m, 3)).toEqual(false);
     expect(isValidSquare(m, 4)).toEqual(false);
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



