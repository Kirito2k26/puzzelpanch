(function () {
  const {test, assert} = window.PuzzlePanchTests;
  const page = document.getElementById('homepage-frame').contentDocument;
  const expected = ['Sudoku', '2048', 'Memory Match', 'Sliding Puzzle', 'Tic-Tac-Toe'];
  test('Exactly five game cards appear', () => assert(page.querySelectorAll('[data-game-card]').length === 5, 'Expected five cards'));
  test('All five game names appear once', () => {
    const names = [...page.querySelectorAll('[data-game-card] h3')].map(el => el.textContent.trim());
    assert(JSON.stringify(names) === JSON.stringify(expected), 'Incorrect game names/order: ' + names.join(', '));
  });
  test('Every game card is a keyboard-accessible button', () => {
    assert([...page.querySelectorAll('[data-game-card]')].every(el => el.tagName === 'BUTTON' && el.type === 'button'), 'Card not a button');
  });
  test('Game cards retain correct identifiers', () => {
    const ids = [...page.querySelectorAll('[data-game-card]')].map(el => el.dataset.gameCard);
    assert(JSON.stringify(ids) === JSON.stringify(['sudoku','2048','memory','sliding','tictactoe']), 'Game identifiers incorrect');
  });
})();
