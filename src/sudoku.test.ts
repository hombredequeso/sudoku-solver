import * as fc from 'fast-check';
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

const intOption: Arbitrary<Option<int>> = fc.integer().map(i => option(i));
const intOption2: Arbitrary<Option<int>> = fc.boolean().chain(b => b ? intOption : fc.constant(none));

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

const noRepeatArray: Arbitrary<int[]> = fc.array(fc.nat()).map(a => a.fold)

// const isValidRow(sudokuPuzzle, row): Boolean => {}

describe('isValidRow', () => {
  test('returns true unless there are duplicates', () => {
    fc.assert(fc.property(fc.array(fc.nat()), (a) => {
      console.log(a)
    }));
  })
})

