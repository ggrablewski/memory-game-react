import React from 'react';

function Header({ playerNames, scores, currentPlayer }) {
  return (
    <header>
      <span
        id="gracz1"
        className={currentPlayer === 1 ? 'active-player' : ''}
      >
        {playerNames.player1}
      </span>
      <span id="wynik1">{scores.player1}</span>
      <span id="odstep"></span>
      <span
        id="gracz2"
        className={currentPlayer === 2 ? 'active-player' : ''}
      >
        {playerNames.player2}
      </span>
      <span id="wynik2">{scores.player2}</span>
    </header>
  );
}

export default Header;
