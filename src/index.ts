import * as O from 'fp-ts/Option';
import {Option} from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import {Either} from 'fp-ts/Either';
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'

import {solve} from './graph';
import {Place, Puzzle, SolutionTree} from './sudoku'

type Error = string;

var myArgs = process.argv.slice(2);
const problemStr = myArgs[0];

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

const puzzle: Either<Error, Puzzle> = 
  pipe(
    parseInput(problemStr),
    E.map(A.map(toPlace))
  );

console.time('Solve Puzzle');
const soln: Either<Error, Option<SolutionTree>> =
  pipe(
    puzzle,
    E.map(solve)
  );
console.timeEnd('Solve Puzzle');

const msg1 = (s: Option<SolutionTree>) =>  pipe(
  s,
  O.map(x => x.join('')),
  O.getOrElse(() => "no solution found")
)

const msg2 = pipe(
  soln,
  E.map(x => msg1(x)),
  E.getOrElse(() => "error processing input")
);

console.log(msg2);
