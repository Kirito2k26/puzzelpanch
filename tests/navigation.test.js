(function () {
  const {test, assert} = window.PuzzlePanchTests;
  const frame = document.getElementById('homepage-frame');
  const page = frame.contentDocument;
  const win = frame.contentWindow;
  const ids = ['sudoku', '2048', 'memory', 'sliding', 'tictactoe'];
  test('Game view starts hidden and home view starts visible', () => {
    assert(!page.getElementById('home-view').hidden, 'Home should be visible');
    assert(page.getElementById('game-view').hidden, 'Game view should be hidden');
  });
  test('Each card opens its own placeholder screen', () => {
    ids.forEach(id => {
      page.querySelector('[data-game-card="' + id + '"]').click();
      assert(page.getElementById('home-view').hidden, 'Home still visible for ' + id);
      assert(!page.getElementById('game-view').hidden, 'Game view hidden for ' + id);
      assert(page.getElementById('game-title').textContent.trim() === page.querySelector('[data-game-card="' + id + '"] h3').textContent.trim(), 'Wrong title for ' + id);
      assert(win.PuzzlePanchApp.selectedGame === id, 'Wrong selected game');
      page.getElementById('back-to-games').click();
    });
  });
  test('Back to Games restores the homepage', () => {
    page.querySelector('[data-game-card="sudoku"]').click();
    page.getElementById('back-to-games').click();
    assert(!page.getElementById('home-view').hidden, 'Home not restored');
    assert(page.getElementById('game-view').hidden, 'Game screen not hidden');
    assert(win.PuzzlePanchApp.selectedGame === null, 'Selection not cleared');
  });
  test('Browser back and forward switch screens', () => {
    assert(typeof win.PuzzlePanchApp.showGame === 'function', 'Navigation API missing');
    win.PuzzlePanchApp.showGame('2048');
    assert(win.location.hash === '#game/2048', 'Game route missing');
    win.location.hash = '';
    win.dispatchEvent(new win.Event('hashchange'));
    assert(!page.getElementById('home-view').hidden, 'Home not shown on route change');
  });
})();
