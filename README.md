# PuzzlePanch — Complete Website

Five playable browser games: Sudoku, 2048, Memory Match, Sliding Puzzle, and Tic-Tac-Toe.

## Start

Extract the ZIP and double-click `index.html`. No Node.js, package installation, account, or API key needed.

## Controls

- Select a game card; choose Easy / Medium / Hard.
- **2048:** Arrow keys, swipe on touchscreens, or on-screen arrows.
- **Sudoku:** Tap a square, then choose a number or type 1–9; Backspace erases.
- **Memory Match:** Flip two cards and find matching pairs.
- **Sliding Puzzle:** Tap a numbered tile beside the empty space.
- **Tic-Tac-Toe:** Choose Computer or Friend (same device).
- New game and Restart both begin a fresh round. Pause freezes the game timer and hides the board.
- The theme and sound buttons are at the top right. Your progress is saved in your browser's local storage.

## Offline use

The extracted local files work offline directly. To enable automatic offline caching after visiting a hosted version, serve over HTTPS (e.g., Vercel) or localhost; service workers do not run under `file://`.

## Tests

Open `tests/test-runner.html` to run the browser tests. Tests use no external libraries.

## Notes

- Sudoku boards are generated from valid completed grids with removed clues; difficulty is based on clue count, not an advanced human-solving rating. Generated boards are not guaranteed to have a unique solution; the app validates against its generated target grid.
- Tic-Tac-Toe hard AI uses minimax. The other AI difficulties are less challenging.
- Saving uses browser localStorage, so clearing browser data erases progress.


## Branding
The PuzzlePanch logo appears in the homepage hero. A matching icon appears in the navigation bar and browser favicon. Brand images live in `assets/` and are included in the offline cache.

### Tic-Tac-Toe friend mode fix
Local two-player mode now alternates X and O correctly. Regression test: `node tests/tictactoe.test.js` (Node is only needed for this optional test, not for gameplay). Offline cache version updated.
