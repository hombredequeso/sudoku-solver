import * as O from 'fp-ts/Option';
import {Option} from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import {Either} from 'fp-ts/Either';
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'
import {sequenceT} from 'fp-ts/Apply';

import {solve} from './graph';
import {Place, Puzzle, SolutionTree} from './sudoku'

import neatCsv from 'neat-csv';
import {createReadStream} from 'fs';


type Error = string;

interface TestData {
  puzzle: Puzzle,
  solution: SolutionTree
}

const makeTestData = (puzzle: Puzzle, solution: SolutionTree): TestData => ({puzzle, solution});

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
      const puzzle: Either<Error, Puzzle> = 
        pipe(
          parseInput(x.puzzle),
          E.map(A.map(toPlace))
        );
      const solution: Either<Error,SolutionTree> = 
        parseInput(x.solution);

      // Don't panic, it's just your good ol' applicative
      // https://rlee.dev/practical-guide-to-fp-ts-part-5
      const result: Either<Error, TestData> = pipe(
        sequenceT(E.either)(puzzle, solution),
        E.map((args) => makeTestData(...args))
      );

      return result;
    };

    const timef = <T>(f: ()=>T) => {
      const startTime = process.hrtime.bigint();
      const result = f();
      const endTime = process.hrtime.bigint();
      const executionTime = (endTime - startTime)/1000000n;
      return {result, executionTime};
    }

    const timedSolve = (puzzle: Puzzle) => {
      const startTime = process.hrtime.bigint();
      const result = solve(puzzle);
      const endTime = process.hrtime.bigint();
      const executionTime = (endTime - startTime)/1000000n;
      console.log(`Execution time: ${executionTime}`)
      return result;
    }

    const runTest = (t: TestData) => {
      // const solution: Option<SolutionTree> = timedSolve(t.puzzle);
      const {result, executionTime} = timef(() => solve(t.puzzle))
      const expectedSolution: Option<SolutionTree> = O.some(t.solution);
      expect(result).toEqual(expectedSolution);
      return executionTime;
    };

    return neatCsv(readStream).then((dataIn: any[]) => {
      const testData: Either<Error, TestData>[] = dataIn.map(x => parse(x));

      const results: Either<Error, bigint>[] = testData.map(x => E.map(runTest)(x));
      const timings = results.map(e => E.getOrElse(() => 0n)(e));
      console.log({timings});
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


