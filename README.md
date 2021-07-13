# Sudoku Solver

sudoku-solver is a Typescript project for solving sudoku puzzles by brute force.

## Installation

Use the [yarn](https://yarnpkg.com/) package manager.

```bash
yarn
```

To test:

```bash
yarn test
```
## Usage

```bash
yarn start 070000043040009610800634900094052000358460020000800530080070091902100005007040802
```

## Project Notes

### Property Based Testing
There is a small number of property based tests in sudoku.test.ts

### Functional Library
The fp-ts library is used in this project. It's most pronounced use is in the solve.test.ts tests.

### Sudoku Solving
Sudoku puzzles are solved using a depth-first tree search. This is mostly contained in graph.ts.
The tree is represented by an array, where each element of the array represents a layer in the tree. It is never necessary to generate the entire tree (which could be up to a limit of 9^81 nodes - unpleasantly large for a computer's memory),just keep track of the current path through the tree, determining if is valid, and if it is a solution.


## Source of Sudoku puzzles

https://www.kaggle.com/rohanrao/sudoku

## License
[MIT](https://choosealicense.com/licenses/mit/)


