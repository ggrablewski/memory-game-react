import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import GameBoard from './components/GameBoard';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameSettings, setGameSettings] = useState(null);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [playerNames, setPlayerNames] = useState({ player1: 'Ignaś', player2: 'Tato' });

  const startGame = (settings) => {
    setGameSettings(settings);
    setPlayerNames({ player1: settings.player1Name, player2: settings.player2Name });
    setScores({ player1: 0, player2: 0 });
    setCurrentPlayer(1);
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameStarted(false);
    setScores({ player1: 0, player2: 0 });
    setCurrentPlayer(1);
  };

  const incrementScore = (player) => {
    setScores(prev => ({
      ...prev,
      [player]: prev[player] + 1
    }));
  };

  const switchPlayer = () => {
    setCurrentPlayer(prev => prev === 1 ? 2 : 1);
  };

  return (
    <div className="App" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/dark_green_1.jpg)` }}>
      <Header
        playerNames={playerNames}
        scores={scores}
        currentPlayer={currentPlayer}
      />
      {!gameStarted ? (
        <WelcomeScreen onStartGame={startGame} previousSettings={gameSettings} />
      ) : (
        <GameBoard
          settings={gameSettings}
          currentPlayer={currentPlayer}
          playerNames={playerNames}
          scores={scores}
          onIncrementScore={incrementScore}
          onSwitchPlayer={switchPlayer}
          onResetGame={resetGame}
        />
      )}
    </div>
  );
}

export default App;
