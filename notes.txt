type Place = int||null
type Puzzle = Place[];

const sudokuPuzzle: Puzzle = []

const isValidRow(sudokuPuzzle, row): Boolean => {}
const isValidColumn(sudokuPuzzle, column): Boolean => {}
const isValidSquare(sudokuPuzzle, square): Boolean => {}

const solutionTree: [];

const currentSudokuState: SudokuPuzzle

const merge = (sudokuPuzzle, solutionTree): SudokuPuzzle => {
}

const isComplete(sudokuPuzzel) : Boolean => {}

// inc solution tree
// if valid move to next node (unless on last node => got solution)
// if invalid inc current node
// if past 9 backtrack.
//

const solve(sudokuPuzzle, solutionTree) => {
  let solved = false;

  while (!solved) {
    solved = iterate(sudokuPuzzle, solutionTree)
  }
}

const iterate(sudokuPuzzle, solutionTree): Boolean => {
    const [currentIncrement, row, column, square] = increment(sudokuPuzzle, solutionTree);
    if (currentIncrement > 9) {
      backtrack
      return false;
    } 
    const nextSolution = merge(sudokuPuzzel, solutionTree);
    const isValid = testRow(nextSolution, row) && testColumn(nextSolution, column) && testSquare(nextSolution, ??);
    const completed = isComplete(sudokuPuzzel);

    if (isValid && completed) {
      return true;
    } 

    if (isValid && !completed) {
      next iteration
    }
}




describe('dummy test', () => {
  test('tests work', () => {
    expect(1).toEqual(1);
  });
});
