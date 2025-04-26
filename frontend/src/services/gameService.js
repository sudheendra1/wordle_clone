// API URL - adjust this to match your Flask server
const API_URL = "https://wordle-clone-hd4g.onrender.com"

// Start a new game
export async function startNewGame() {
  const response = await fetch(`${API_URL}/get-word`, {
    method: "GET",
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to start a new game")
  }

  return response.json()
}

// Check a guess
export async function checkGuess(guess) {
  const response = await fetch(`${API_URL}/check-guess`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ guess: guess.toLowerCase() }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to check guess")
  }

  return data
}
