import React, { useState, useEffect, useRef, useCallback } from "react";
import Data, { refreshACData } from "../Game/data";
import Card from "./Card";
import "./GameBoard.css";

function GameBoard({ isAC }) {
  const [cardsArray, setCardsArray] = useState([]);
  const [moves, setMoves] = useState(0);
  const [firstCard, setFirstCard] = useState(null);
  const [secondCard, setSecondCard] = useState(null);
  const [stopFlip, setStopFlip] = useState(false);
  const [won, setWon] = useState(0);
  const [disableClicks, setDisableClicks] = useState(false);
  const [loading, setLoading] = useState(false);

  // forces card remount every deal
  const [dealId, setDealId] = useState(0);

  // track mismatch timeout so we can cancel it
  const mismatchTimerRef = useRef(null);

  function shuffleArray(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  async function preloadImages(urls = [], timeout = 4000) {
    if (!urls.length) return;

    const loaders = urls.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          let done = false;

          const finish = () => {
            if (!done) {
              done = true;
              resolve();
            }
          };

          img.onload = finish;
          img.onerror = finish;
          img.src = src;

          setTimeout(finish, timeout);
        })
    );

    await Promise.all(loaders);
  }

  const handleNewGame = useCallback(async () => {
    setDisableClicks(true);
    setStopFlip(true);

    // Cancel any pending mismatch timer
    if (mismatchTimerRef.current) {
      clearTimeout(mismatchTimerRef.current);
      mismatchTimerRef.current = null;
    }

    setFirstCard(null);
    setSecondCard(null);

    // Clear board first (prevents flicker)
    setCardsArray([]);
    await new Promise((resolve) => setTimeout(resolve, 0));

    setLoading(true);

    try {
      const newCards = isAC
        ? await refreshACData()
        : await Data(false);

      const sanitized = (newCards || []).map((c) => ({
        ...c,
        matched: false,
      }));

      const urls = sanitized.map((c) => c.img).filter(Boolean);
      await preloadImages(urls);

      const shuffled = shuffleArray(sanitized);

      // Force fresh remount of Cards
      setDealId((d) => d + 1);

      setCardsArray(shuffled);
      setMoves(0);
      setWon(0);
    } catch (err) {
      console.error("[GameBoard] new game failed", err);
    } finally {
      setLoading(false);
      setStopFlip(false);
      setDisableClicks(false);
    }
  }, [isAC]);

  useEffect(() => {
    handleNewGame();
  }, [handleNewGame]);

  function handleSelectedCards(item) {
    if (firstCard && firstCard.id !== item.id) {
      setSecondCard(item);
    } else {
      setFirstCard(item);
    }
  }

  useEffect(() => {
    if (firstCard && secondCard) {
      setStopFlip(true);

      if (firstCard.name === secondCard.name) {
        setCardsArray((prev) =>
          prev.map((unit) =>
            unit.name === firstCard.name
              ? { ...unit, matched: true }
              : unit
          )
        );

        setWon((prev) => prev + 1);
        removeSelection();
      } else {
        mismatchTimerRef.current = setTimeout(() => {
          removeSelection();
          mismatchTimerRef.current = null;
        }, 1000);
      }
    }
  }, [firstCard, secondCard]);

  function removeSelection() {
    setFirstCard(null);
    setSecondCard(null);
    setStopFlip(false);
    setMoves((prev) => prev + 1);
  }

  const theme = isAC ? "Animal Crossing" : "Kirby";

  return (
    <div className="container">
      <div className="header">
        <h1>{theme} Memory Game</h1>
      </div>

      <div className="gameboard-container">
        {loading && (
          <div className="spinner-overlay">
            <div className="spinner" />
          </div>
        )}

        <div className="board">
          {cardsArray.map((item) => {
            const isToggled =
              (firstCard && item.id === firstCard.id) ||
              (secondCard && item.id === secondCard.id) ||
              item.matched === true;

            return (
              <Card
                key={`${dealId}-${item.id}`}
                item={item}
                toggled={!!isToggled}
                stopflip={stopFlip || disableClicks}
                handleSelectedCards={(itm) => {
                  if (disableClicks || stopFlip) return;
                  if (firstCard && firstCard.id === itm.id) return;
                  handleSelectedCards(itm);
                }}
              />
            );
          })}
        </div>

        {won !== 6 ? (
          <div className="comments">Moves : {moves}</div>
        ) : (
          <div className="comments">
            You Won in {moves} moves!
          </div>
        )}

        <button
          className="button"
          onClick={handleNewGame}
          disabled={disableClicks || loading}
        >
          New Game
        </button>
      </div>
    </div>
  );
}

export default GameBoard;
