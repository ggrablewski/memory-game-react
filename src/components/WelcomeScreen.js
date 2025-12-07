import React, { useState, useEffect } from 'react';

const KOMPUTER_NAME_LIST = [
  "RZUF", "Fred", "Bolec", "Cwaniak", "Gigantus",
  "Pułkownik UB", "Brutus", "Cezar", "Reżyser kina akcji", "Waldek"
];

function WelcomeScreen({ onStartGame }) {
  const [player1Name, setPlayer1Name] = useState('Ignaś');
  const [player2Name, setPlayer2Name] = useState('Tato');
  const [boardSize, setBoardSize] = useState('4');
  const [coverColor, setCoverColor] = useState('red');
  const [withComputer, setWithComputer] = useState(false);
  const [difficulty, setDifficulty] = useState(50);
  const [showIntro, setShowIntro] = useState(true);
  const [humanName, setHumanName] = useState('Tato');
  const [computerName, setComputerName] = useState('Cwaniak');

  useEffect(() => {
    const newComputerName = KOMPUTER_NAME_LIST[Math.floor(Math.min(difficulty, 99) / 10)];
    setComputerName(newComputerName);
    if (withComputer) {
      setPlayer2Name(newComputerName);
    }
  }, [difficulty, withComputer]);

  const handleComputerToggle = () => {
    if (!withComputer) {
      setHumanName(player2Name);
      setPlayer2Name(computerName);
      setWithComputer(true);
    } else {
      setPlayer2Name(humanName);
      setWithComputer(false);
    }
  };

  const handleStart = () => {
    const settings = {
      player1Name,
      player2Name,
      boardSize,
      coverColor,
      withComputer,
      difficulty,
      showIntro: withComputer && showIntro
    };
    onStartGame(settings);
  };

  return (
    <div id="ekran-powitalny">
      <div className="formularz">
        <div>
          <div>
            <label htmlFor="player1">Imię gracza 1</label><br/>
            <input
              id="player1"
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
            />
          </div>
          <br/>
          <div>
            <label htmlFor="player2">Imię gracza 2</label><br/>
            <input
              id="player2"
              type="text"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              disabled={withComputer}
            />
          </div>
        </div>
        <div>
          <legend>Rozmiar planszy</legend>
          <label>
            <input
              type="radio"
              name="rozmiar"
              value="4"
              checked={boardSize === '4'}
              onChange={(e) => setBoardSize(e.target.value)}
            />
            4×3 <img src="4x3_transparent.png" width="40px" height="30px" alt="4x3"/>
          </label>
          <label>
            <input
              type="radio"
              name="rozmiar"
              value="6"
              checked={boardSize === '6'}
              onChange={(e) => setBoardSize(e.target.value)}
            />
            6×5 <img src="6x5_transparent.png" width="60px" height="50px" alt="6x5"/>
          </label>
          <label>
            <input
              type="radio"
              name="rozmiar"
              value="9"
              checked={boardSize === '9'}
              onChange={(e) => setBoardSize(e.target.value)}
            />
            9×6 <img src="9x6_transparent.png" width="90px" height="60px" alt="9x6"/>
          </label>
          <label>
            <input
              type="radio"
              name="rozmiar"
              value="10"
              checked={boardSize === '10'}
              onChange={(e) => setBoardSize(e.target.value)}
            />
            10×8 <img src="10x8_transparent.png" width="100px" height="80px" alt="10x8"/>
          </label>
        </div>
        <div>
          <legend>Kolor okładki</legend>
          <label>
            <input
              type="radio"
              name="okladka"
              value="red"
              checked={coverColor === 'red'}
              onChange={(e) => setCoverColor(e.target.value)}
            />
            <img src="cover_red.png" width="80px" height="80px" alt="red cover"/>
          </label>
          <label>
            <input
              type="radio"
              name="okladka"
              value="blue"
              checked={coverColor === 'blue'}
              onChange={(e) => setCoverColor(e.target.value)}
            />
            <img src="cover_blue.png" width="80px" height="80px" alt="blue cover"/>
          </label>
        </div>
        <div>
          <label htmlFor="komputer">
            <input
              name="komputer"
              type="checkbox"
              id="komputer"
              checked={withComputer}
              onChange={handleComputerToggle}
            />
            {' '}Gram z komputerem
          </label>
          <label htmlFor="intro">
            <input
              name="intro"
              type="checkbox"
              id="intro"
              checked={showIntro}
              onChange={(e) => setShowIntro(e.target.checked)}
              disabled={!withComputer}
            />
            {' '}Pokaż intro
          </label>
          <div>
            <label htmlFor="poziom">
              Poziom trudności <span id="procent">{difficulty}%</span>
            </label><br/>
            <input
              id="poziom"
              name="poziom"
              type="range"
              min="0"
              max="100"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={!withComputer}
            />
          </div>
        </div>
      </div>
      <div className="button-ok" onClick={handleStart}>
        Zaczynamy!
      </div>
    </div>
  );
}

export default WelcomeScreen;
