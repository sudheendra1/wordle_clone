"use client"

import { useState, useEffect, useCallback } from "react"
import WordleGrid from "./WordleGrid"
import WordleKeyboard from "./WordleKeyboard"
import { startNewGame, checkGuess } from "../services/gameService"
import "../styles/WordleGame.css"

function WordleGame() {
  const [guesses, setGuesses] = useState([])
  const [currentGuess, setCurrentGuess] = useState("")
  const [feedback, setFeedback] = useState([])
  const [gameState, setGameState] = useState("playing")
  const [remainingTries, setRemainingTries] = useState(6)
  const [keyboardColors, setKeyboardColors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [targetWord, setTargetWord] = useState("")
  const [darkMode, setDarkMode] = useState(false);

  // Start a new game
  const initGame = useCallback(async () => {
    setIsLoading(true)
    try {
      await startNewGame()
      setGuesses([])
      setCurrentGuess("")
      setFeedback([])
      setGameState("playing")
      setRemainingTries(6)
      setKeyboardColors({})
      setErrorMessage("")
      setTargetWord("")
    } catch (error) {
      setErrorMessage("Failed to start a new game. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initialize game on component mount
  useEffect(() => {
    initGame()
  }, [initGame])

  // Handle keyboard input
  const handleKeyPress = useCallback(
    (key) => {
      if (gameState !== "playing" || isLoading) return

      if (key === "ENTER") {
        if (currentGuess.length !== 5) {
          setErrorMessage("Please enter a 5-letter word")
          return
        }
        submitGuess()
      } else if (key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1))
        setErrorMessage("")
      } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
        setCurrentGuess((prev) => prev + key)
        setErrorMessage("")
      }
    },
    [currentGuess, gameState, isLoading],
  )

  // Submit the current guess
  const submitGuess = async () => {
    if (currentGuess.length !== 5) return

    setIsLoading(true)
    try {
      const result = await checkGuess(currentGuess)

      // Update guesses and feedback
      setGuesses((prev) => [...prev, currentGuess])
      setFeedback((prev) => [...prev, result.feedback])
      setRemainingTries(result.remaining)

      // Update keyboard colors
      const newKeyboardColors = { ...keyboardColors }
      currentGuess.split("").forEach((letter, index) => {
        const color = result.feedback[index]
        // Only update if the new color has higher priority
        // Priority: green > yellow > gray
        if (
          !newKeyboardColors[letter] ||
          (newKeyboardColors[letter] === "gray" && (color === "yellow" || color === "green")) ||
          (newKeyboardColors[letter] === "yellow" && color === "green")
        ) {
          newKeyboardColors[letter] = color
        }
      })
      setKeyboardColors(newKeyboardColors)

      if (result.target_word) {
        setTargetWord(result.target_word)
      }

      // Check game state
      if (result.success) {
        setGameState("won")
        setErrorMessage("Congratulations! You guessed the word correctly!")
      } else if (result.game_over) {
        setGameState("lost")
        setErrorMessage("Game Over! You ran out of tries!")
      }

      // Reset current guess
      setCurrentGuess("")
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleKeyPress("ENTER")
      } else if (e.key === "Backspace") {
        handleKeyPress("BACKSPACE")
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase())
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyPress])

  return (
    <div className={`wordle-game ${darkMode ? 'dark' : ''}`}>
      <div className="game-header">
      {/* <button onClick={() => setDarkMode(!darkMode)}>
  {darkMode ? 'Light Mode' : 'Dark Mode'}
</button> */}
        <div className="tries-counter">
          Tries left: <span>{remainingTries}</span>
        </div>
        <button onClick={initGame} disabled={isLoading} className="new-game-button">
          New Game
        </button>
      </div>

      <WordleGrid guesses={guesses} currentGuess={currentGuess} feedback={feedback} maxTries={6} />


      {targetWord && (gameState === "won" || gameState === "lost") && (
        <div className="target-word-reveal">
          The word was: <span className="target-word">{targetWord.toUpperCase()}</span>
        </div>
      )}

      <WordleKeyboard
        onKeyPress={handleKeyPress}
        keyColors={keyboardColors}
        disabled={gameState !== "playing" || isLoading}
      />

      {errorMessage && <div className={`message ${gameState === "won" ? "success" : "error"}`}>{errorMessage}</div>}

      

      {gameState === "won" && !errorMessage && <div className="message success">You won! 🎉</div>}

      {gameState === "lost" && !errorMessage && <div className="message error">Game over! Try again.</div>}
    </div>
  )
}

export default WordleGame
