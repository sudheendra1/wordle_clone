import "./App.css"
import WordleGame from "./components/WordleGame"

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Wordle Clone</h1>
        <div className="game-container">
          <WordleGame />
        </div>
      </header>
    </div>
  )
}

export default App
