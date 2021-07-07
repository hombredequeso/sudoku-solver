
import * as O from 'fp-ts/Option';
import {Option} from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import {Either} from 'fp-ts/Either';

import * as A from 'fp-ts/Array'

import { pipe } from 'fp-ts/function'

import {solve} from './graph.test';

type Place = Option<number>;
type Puzzle = Place[];
type SolutionTree = number[];
type Error = string;


describe('read data into structure', () => {
  test('works', () => {
    const sudokuSource = "070000043040009610800634900094052000358460020000800530080070091902100005007040802,679518243543729618821634957794352186358461729216897534485276391962183475137945862";

    const toPlace = (i: number): Option<number> => (i === 0)? O.none: O.some(i);
    const parseE = (s: string): Either<Error, number> => {  
      const n = Number.parseInt(s);
      return (isNaN(n))? E.left(`Parse Error: ${s} is not an integer`): E.right(n);
    }

    const [problemStr, solutionStr] = sudokuSource.split(',');

    const parseInput = (s: string): Either<Error, number[]> => pipe(
      s.split(''),
      A.map(parseE),
      A.sequence(E.Applicative) // turn Either<E,T>[] => Either<E,T[]>
    );

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


