
import * as O from 'fp-ts/Option';
import {Option} from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import {Either} from 'fp-ts/Either';

import * as A from 'fp-ts/Array'

import { pipe } from 'fp-ts/function'

type Place = Option<number>;
type Puzzle = Place[];
type SolutionTree = number[];

const solve = (puzzle: Puzzle): Option<SolutionTree> => {
  return O.none;
}

describe('read data into structure', () => {
  test('works', () => {
    const sudokuSource = "070000043040009610800634900094052000358460020000800530080070091902100005007040802,679518243543729618821634957794352186358461729216897534485276391962183475137945862";

    const toPlace = (i: number): Option<number> => (i === 0)? O.none: O.some(i);
    const parseE = (s: string): Either<string, number> => {  
      const n = Number.parseInt(s);
      return (isNaN(n))? E.left(`Parse Error: ${s} is not an integer`): E.right(n);
    }

    const [problem, solution] = sudokuSource.split(',');
    const puzzle: Either<string,number>[] = problem.split('').map(c => parseE(c)); // .map(i => toPlace(i));

    const expectedResult: Either<string, Option<number[]>> = pipe(
      solution.split(''),
      A.map(parseE),
      A.sequence(E.Applicative),
      E.map(O.some)
    );

    const result: Either<string, Option<number>[]> = 
      pipe(
        puzzle, 
        A.sequence(E.Applicative), 
        E.map(A.map(toPlace))
      );

    console.log(result);

    const soln: Either<string, Option<SolutionTree>> =
      pipe(
        result,
        E.map(solve)
      );

    // expect(soln).toEqual(expectedResult);
  })
})


