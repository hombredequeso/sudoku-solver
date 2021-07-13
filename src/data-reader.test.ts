import * as O from 'fp-ts/Option';
import {Option} from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import {Either} from 'fp-ts/Either';
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'

import {solve} from './graph';
import {Place, Puzzle, SolutionTree} from './sudoku'

// const neatCsv = require('neat-csv');
import neatCsv from 'neat-csv';
import {createReadStream} from 'fs';


type Error = string;

interface TestData {
  puzzle: Puzzle,
  solution: SolutionTree
}

describe('read data into structure', () => {

  const toPlace = (i: number): Option<number> => (i === 0)? O.none: O.some(i);
  const parseE = (s: string): Either<Error, number> => {  
    const n = Number.parseInt(s);
    return (isNaN(n))? E.left(`Parse Error: ${s} is not an integer`): E.right(n);
  }
  const parseInput = (s: string): Either<Error, number[]> => pipe(
    s.split(''),
    A.map(parseE),
    A.sequence(E.Applicative) // turn Either<E,T>[] => Either<E,T[]>
  );

  test('bulk test', () => {
    const testFile = 'data/sudoku-100-puzzles.csv';
    const readStream = createReadStream(testFile);

    const parse = (x: any): Either<Error, TestData> => {
      const puzzleStr = x.puzzle;
      const puzzle: Either<Error, Puzzle> = 
        pipe(
          parseInput(problemStr),
          E.map(A.map(toPlace))
        );
      const solution: Either<Error,SolutionTree>  = parseInput(x.solution);

    }

    return neatCsv(readStream).then((x: any[]) => {
      // console.log(x)
    });

  });

  test('works', () => {
    const sudokuSource = "070000043040009610800634900094052000358460020000800530080070091902100005007040802,679518243543729618821634957794352186358461729216897534485276391962183475137945862";


    const [problemStr, solutionStr] = sudokuSource.split(',');


    const puzzle: Either<Error, Puzzle> = 
      pipe(
        parseInput(problemStr),
        E.map(A.map(toPlace))
      );

    const soln: Either<Error, Option<SolutionTree>> =
      pipe(
        puzzle,
        E.map(solve)
      );

    const expectedResult: Either<Error, Option<SolutionTree>> = pipe(
      parseInput(solutionStr),
      E.map(O.some)
    );

    expect(soln).toEqual(expectedResult);
  })
})


