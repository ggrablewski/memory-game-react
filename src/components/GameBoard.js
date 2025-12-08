import React, { useState, useEffect, useRef, useCallback } from 'react';
import Card from './Card';

const ROZMIARY = { '4': [4, 3], '6': [6, 5], '9': [9, 6], '10': [10, 8] };
const KOMPUTER_FILM_LIST = {
  0: ["rzuf.mp4"],
  1: ["fred.mp4"],
  2: ["bolec.mp4"],
  3: ["cwaniak.mp4"],
  4: ["gigantus.mp4"],
  5: ["pulkownik.mp4"],
  6: ["brutus.mp4"],
  7: ["cezar.mp4"],
  8: ["rezyser1.mp4", "rezyser2.mp4"],
  9: ["waldek.mp4"]
};

const losuj = (max) => Math.floor(Math.random() * max);
const numer = (x) => x.toString().padStart(2, "0");

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = 0; i < arr.length * 3; i++) {
    const idx1 = losuj(arr.length);
    const idx2 = losuj(arr.length);
    [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
  }
  return arr;
};

function GameBoard({ settings, currentPlayer, playerNames, scores, onIncrementScore, onSwitchPlayer, onResetGame }) {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [isClickable, setIsClickable] = useState(true);
  const [showMessage, setShowMessage] = useState(null);
  const [remainingPairs, setRemainingPairs] = useState(0);
  const [memory, setMemory] = useState([]);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [gameReady, setGameReady] = useState(false);
  const computerMoveInProgress = useRef(false);
  const currentFlippedCards = useRef([]);

  const audioRefs = useRef({
    start: new Audio(`${process.env.PUBLIC_URL}/start.mp3`),
    uncover: new Audio(`${process.env.PUBLIC_URL}/bounce_1.mp3`),
    wrong: new Audio(`${process.env.PUBLIC_URL}/bounce_2.mp3`),
    correct: new Audio(`${process.env.PUBLIC_URL}/dog.mp3`),
    cheers: new Audio(`${process.env.PUBLIC_URL}/cheers.mp3`)
  });

  const boardSize = ROZMIARY[settings.boardSize];
  const [cols, rows] = boardSize;
  const totalCards = cols * rows;

  const prepareCards = useCallback(() => {
    const imageNumbers = shuffleArray(Array.from({ length: 40 }, (_, i) => numer(i)));
    const cardValues = [];
    for (let i = 0; i < totalCards / 2; i++) {
      const cardNum = imageNumbers[i];
      cardValues.push(cardNum, cardNum);
    }
    return shuffleArray(cardValues);
  }, [totalCards]);

  useEffect(() => {
    let video = null;

    if (settings.showIntro && settings.withComputer) {
      const level = Math.floor(Math.min(settings.difficulty, 99) / 10);
      const films = KOMPUTER_FILM_LIST[level];
      const film = films[losuj(films.length)];

      video = document.createElement('video');
      video.src = film;
      video.autoplay = false;
      video.controls = false;
      video.style.position = 'absolute';
      video.style.top = '50%';
      video.style.left = '50%';
      video.style.transform = 'translate(-50%, -50%)';
      video.style.width = '640px';
      video.style.height = '360px';
      video.style.zIndex = '1000';
      document.body.appendChild(video);
      video.play();
      video.onended = () => {
        setTimeout(() => {
          if (document.body.contains(video)) {
            document.body.removeChild(video);
          }
          setGameReady(true);
        }, 1000);
      };
    } else {
      setGameReady(true);
    }

    return () => {
      if (video && document.body.contains(video)) {
        document.body.removeChild(video);
      }
    };
  }, [settings]);

  useEffect(() => {
    if (!gameReady) return;

    const cardValues = prepareCards();
    const newCards = cardValues.map((value, index) => ({
      id: index,
      value,
      row: Math.floor(index / cols),
      col: index % cols
    }));
    setCards(newCards);
    setRemainingPairs(totalCards / 2);
    audioRefs.current.start.play();

    if (settings.withComputer) {
      const newMemory = Array.from({ length: 40 }, () => []);
      setMemory(newMemory);
      const moves = shuffleArray(newCards.map(card => card.id));
      setPossibleMoves(moves);
    }
  }, [gameReady, prepareCards, totalCards, cols, settings.withComputer]);

  const isComputerTurn = useCallback(() => {
    return settings.withComputer && currentPlayer === 2;
  }, [settings.withComputer, currentPlayer]);

  const endGame = useCallback((finalScores = scores) => {
    audioRefs.current.cheers.play();
    let message;
    if (finalScores.player1 === finalScores.player2) {
      message = 'REMIS !!!';
    } else {
      const winner = finalScores.player1 > finalScores.player2 ? playerNames.player1 : playerNames.player2;
      const koncowka = ['a', 'A'].includes(winner[winner.length - 1]) ? 'a' : '';
      message = `Wygrał${koncowka}\n${winner}`;
    }
    setShowMessage({ type: 'endGame', text: message });
  }, [scores, playerNames]);

  const showPlayerChange = useCallback(() => {
    onSwitchPlayer();
    const nextPlayer = currentPlayer === 1 ? 2 : 1;
    setShowMessage({
      type: 'playerChange',
      text: `Teraz\n${playerNames[`player${nextPlayer}`]}`
    });
    setTimeout(() => {
      setShowMessage(null);
      setIsClickable(true);
    }, 1000);
  }, [currentPlayer, playerNames, onSwitchPlayer]);

  const handleCardClick = useCallback((cardId) => {
    if (!isClickable && !isComputerTurn()) return;
    if (currentFlippedCards.current.includes(cardId) || matchedCards.includes(cardId)) return;

    audioRefs.current.uncover.play();
    const card = cards.find(c => c.id === cardId);

    if (settings.withComputer) {
      if (losuj(100) < settings.difficulty) {
        setMemory(prevMemory => {
          const newMemory = [...prevMemory];
          const cardValue = parseInt(card.value);
          if (newMemory[cardValue].length === 0 ||
              (newMemory[cardValue].length === 1 && newMemory[cardValue][0] !== cardId)) {
            newMemory[cardValue].push(cardId);
            setPossibleMoves(prev => prev.filter(id => id !== cardId));
          }
          return newMemory;
        });
      } else if (isComputerTurn()) {
        setPossibleMoves(prev => {
          const newMoves = [...prev];
          const idx = newMoves.indexOf(cardId);
          if (idx === 0 && newMoves.length > 1) {
            const randomIdx = 1 + losuj(newMoves.length - 1);
            [newMoves[0], newMoves[randomIdx]] = [newMoves[randomIdx], newMoves[0]];
          }
          return newMoves;
        });
      }
    }

    if (currentFlippedCards.current.length === 0) {
      currentFlippedCards.current = [cardId];
      setFlippedCards([cardId]);
    } else if (currentFlippedCards.current.length === 1) {
      currentFlippedCards.current = [...currentFlippedCards.current, cardId];
      setFlippedCards(prev => [...prev, cardId]);
      setIsClickable(false);

      setTimeout(() => {
        const firstCardId = currentFlippedCards.current[0];
        const firstCard = cards.find(c => c.id === firstCardId);
        const secondCard = card;

        if (firstCard.value === secondCard.value) {
          audioRefs.current.correct.play();
          setMatchedCards(prev => [...prev, firstCardId, cardId]);
          currentFlippedCards.current = [];
          setFlippedCards([]);
          onIncrementScore(`player${currentPlayer}`);

          const newRemainingPairs = remainingPairs - 1;
          setRemainingPairs(newRemainingPairs);

          if (settings.withComputer) {
            setPossibleMoves(prev => prev.filter(id => id !== firstCardId && id !== cardId));
            setMemory(prevMemory => {
              const newMemory = [...prevMemory];
              newMemory[parseInt(firstCard.value)] = [];
              return newMemory;
            });
          }

          if (newRemainingPairs === 0) {
            const updatedScores = {
              ...scores,
              [`player${currentPlayer}`]: scores[`player${currentPlayer}`] + 1
            };
            endGame(updatedScores);
          } else {
            setIsClickable(true);
          }
        } else {
          audioRefs.current.wrong.play();
          currentFlippedCards.current = [];
          setFlippedCards([]);
          showPlayerChange();
        }
      }, 1000);
    }
  }, [isClickable, isComputerTurn, matchedCards, cards, settings, remainingPairs, currentPlayer, onIncrementScore, endGame, showPlayerChange]);

  useEffect(() => {
    if (isComputerTurn() && isClickable && flippedCards.length === 0 && cards.length > 0 && !computerMoveInProgress.current) {
      computerMoveInProgress.current = true;

      setTimeout(() => {
        const findPairInMemory = () => {
          for (let i = 0; i < 40; i++) {
            if (memory[i] && memory[i].length === 2) {
              return i;
            }
          }
          return -1;
        };

        const findOtherCard = (cardValue, flippedId) => {
          const memEntry = memory[parseInt(cardValue)];
          if (!memEntry || memEntry.length === 0) return -1;
          for (let id of memEntry) {
            if (id !== flippedId) return id;
          }
          return -1;
        };

        const pairCardValue = findPairInMemory();
        if (pairCardValue !== -1 && memory[pairCardValue].length === 2) {
          const ids = [...memory[pairCardValue]];
          handleCardClick(ids[0]);
          setTimeout(() => {
            handleCardClick(ids[1]);
            computerMoveInProgress.current = false;
          }, 1000);
        } else if (possibleMoves.length > 0) {
          const firstCardId = possibleMoves[0];
          const firstCard = cards.find(c => c.id === firstCardId);
          if (firstCard) {
            handleCardClick(firstCardId);
            const otherId = findOtherCard(firstCard.value, firstCardId);
            if (otherId !== -1) {
              setTimeout(() => {
                handleCardClick(otherId);
                computerMoveInProgress.current = false;
              }, 1000);
            } else if (possibleMoves.length > 1) {
              setTimeout(() => {
                handleCardClick(possibleMoves[1]);
                computerMoveInProgress.current = false;
              }, 1000);
            } else {
              computerMoveInProgress.current = false;
            }
          } else {
            computerMoveInProgress.current = false;
          }
        } else {
          computerMoveInProgress.current = false;
        }
      }, 500);
    }
  }, [isComputerTurn, isClickable, flippedCards.length, cards, memory, possibleMoves, handleCardClick]);

  const coverImage = settings.coverColor === 'red' ? `${process.env.PUBLIC_URL}/cover_red.png` : `${process.env.PUBLIC_URL}/cover_blue.png`;

  if (!gameReady) {
    return <div style={{ height: '100vh' }}></div>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        id="gra"
        style={{
          '--wiersze': rows,
          '--kolumny': cols
        }}
      >
        {cards.map(card => (
          <Card
            key={card.id}
            card={card}
            isFlipped={flippedCards.includes(card.id)}
            isMatched={matchedCards.includes(card.id)}
            coverImage={coverImage}
            onCardClick={handleCardClick}
          />
        ))}
        {showMessage && (
          <div className="modal-window">
            <div style={{ whiteSpace: 'pre-line', textAlign: 'center' }}>
              {showMessage.text}
            </div>
            {showMessage.type === 'endGame' && (
              <div className="button-ok" onClick={onResetGame}>
                Brawo!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GameBoard;

