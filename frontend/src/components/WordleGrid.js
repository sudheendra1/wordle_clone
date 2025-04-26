import "../styles/WordleGrid.css"

function WordleGrid({ guesses, currentGuess, feedback, maxTries }) {
  // Create array of rows based on maxTries
  const rows = Array(maxTries).fill(null)

  return (
    <div className="wordle-grid">
      {rows.map((_, rowIndex) => {
        // Determine what to display in this row
        const isCurrentRow = rowIndex === guesses.length
        const isPastRow = rowIndex < guesses.length
        const rowFeedback = isPastRow ? feedback[rowIndex] : null
        const rowWord = isPastRow ? guesses[rowIndex] : isCurrentRow ? currentGuess : ""

        // Pad the current guess with empty cells
        const displayLetters = rowWord.padEnd(5, " ").split("")

        return (
          <div key={rowIndex} className="grid-row">
            {displayLetters.map((letter, colIndex) => {
              // Determine cell styling based on feedback
              let cellClass = "grid-cell"

              if (isPastRow && rowFeedback) {
                cellClass += ` ${rowFeedback[colIndex]}`
              } else if (letter !== " ") {
                cellClass += " filled"
              }

              return (
                <div key={colIndex} className={cellClass}>
                  {letter !== " " ? letter.toUpperCase() : ""}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default WordleGrid
