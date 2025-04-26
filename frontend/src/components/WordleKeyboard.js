"use client"
import "../styles/WordleKeyboard.css"

function WordleKeyboard({ onKeyPress, keyColors, disabled }) {
  // Define keyboard layout
  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
  ]

  return (
    <div className="wordle-keyboard">
      {keyboardRows.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => {
            // Determine key styling based on feedback
            let keyClass = "keyboard-key"

            // Special sizing for Enter and Backspace
            if (key === "ENTER" || key === "BACKSPACE") {
              keyClass += " key-wide"
            }

            // Apply color based on feedback
            if (keyColors[key]) {
              keyClass += ` ${keyColors[key]}`
            }

            if (disabled) {
              keyClass += " disabled"
            }

            return (
              <button
                key={key}
                className={keyClass}
                onClick={() => !disabled && onKeyPress(key)}
                disabled={disabled}
                aria-label={key}
              >
                {key === "BACKSPACE" ? "⌫" : key}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default WordleKeyboard
