let cellElements = []
for(let i = 0; i < 9; i ++) {
  element = document.querySelector(`#cell_${i}`)
  cellElements.push(element)
}

document.addEventListener('click', e => {  
  if (e.target && e.target.className === "cell") {
    let cellNo = e.target.dataset["index"]
    if (!game.isOver() && !game.currentPlayer().isComputer) {
      game.currentPlayer().markThis(cellNo)
    }
    else if(game.isOver())
      console.log("It's over.")
    else if (game.currentPlayer().isComputer)
      console.log(`Wait for your turn.`)
  }
})


const game = (() => {
  let _game  
  let _activeTurn
  let _players
  let _board
  let _isOver = true
  let _status
  const patterns = [[0, 1, 2], [3, 4, 5], [6, 7, 8],   // horizontal
                    [0, 3, 6], [1, 4, 7], [2, 5, 8],   // vertical
                    [0, 4, 8], [2, 4, 6]]              // diagonal

  const newBoard = () => {
    let cells = []
    for (let i = 0; i < 9; i ++)
      cells.push("")
    return cells
  }

  const switchTurn = () => {
    _activeTurn = _activeTurn === 0 ? 1 : 0
  }

  const notifyComputer = () => {
    if(currentPlayer().isComputer)
      currentPlayer().notify()
  }

  const currentPlayer = () => _players[_activeTurn]

  const board = () => _board

  const players = () => _players
 
  const initialize = (player1, player2) => {
    _board = newBoard()    
    refreshCellView()
    _players = [player1, player2]
    _activeTurn = 0
    _isOver = false
    _status = `It's ${currentPlayer().name}'s turn!`
    status()
    notifyComputer()
  }
  
  const mark = cell => {
    if (_board[cell] === "") {
      _board[cell] = currentPlayer().marker
      updateCellView(cell)
      checkGameConditions()
    }
    else {
      console.log("Please choose another square.")
      notifyComputer()
    }
  }

  const updateCellView = cell => {
    cellElements[cell].innerHTML = 
    currentPlayer().marker === "x" ? 
    "<i class='fas fa-times'></i>" :
    "<i class='far fa-circle'></i>"
  }

  const refreshCellView = () => {
    for(let i = 0; i < 9; i ++) {
      cellElements[i].textContent = ""
    }
  }

  const highlightWinningPattern = pattern => {
    pattern.forEach(index => {
      cellElements[index].classList.add("highlight")
    })
  }

  const findEmptyCells = boardInstance => {
    let freeCells = []
    for(let i = 0; i < 9; i ++)
      if (boardInstance[i] === "")
        freeCells.push(i)
    return freeCells
  }

  const checkGameConditions = () => {
    let winningPattern = findWinningPattern(_board)
    if (winningPattern) {
      _isOver = true
      _status = `${currentPlayer().name} wins!`
      highlightWinningPattern(winningPattern)
      status()
    }
    else if (draw(_board)) {
      _isOver = true
      _status = "It's a draw!"
      status()
    }
    else {      
      switchTurn()
      _status = `It's ${currentPlayer().name}'s turn`
      status()
      notifyComputer()
    }
  }

  const isOver = () => _isOver

  const findWinningPattern = (boardInstance) => {    
    let winPattern = []
    patterns.forEach(pattern => {
      let pick = boardInstance[pattern[0]]
      if (pick && pattern.every(index => boardInstance[index] === pick)) {
        winPattern.push(...pattern)
      }
    }) 

    if (winPattern.length !== 0)
      return winPattern
    return false  
  }

  const winner = boardInstance => {
    for(let i = 0; i < patterns.length; i ++) {
      let currentPattern = patterns[i]
      let pick = boardInstance[currentPattern[0]]
      if (pick && currentPattern.every(index => boardInstance[index] === pick)) {
        return pick
      }
    }
    return false
  }

  const draw = boardInstance => {
    if (boardInstance.some(cell => cell === ""))
      return false    
    return true    
  }

  const markers = () => _players.map(p => p.marker)

  const status = () => {
    console.log(`Players: ${_players[0].name} vs ${_players[1].name}`)
    console.log(_board)
    console.log(_status)
  }

  _game = { 
    board, newBoard, currentPlayer, isOver,
    initialize, status, mark, players, markers, findEmptyCells, winner, draw
  }
  return _game
})()

// PLAYER

const Player = (name, marker) => {
  game
  const markThis = (cell) => {
    game.mark(cell)
  }
  return { name, marker, markThis, game }
}

// COMPUTER

const Computer = (name = "Computer", marker, difficulty = 2) => {
  game
  difficulty = (difficulty < 1 || isNaN(difficulty)) ? 1 : difficulty

  const markThis = (cell) => {
    game.mark(cell)
  }

  const notify = () => {
   let bestMove = findBestMove()
   markThis(bestMove.position)
  }

  const findBestMove = () => minimax(game.board(), "max")

  const minimax = (board, mode, depth = 0) => {
    let gameScore = evaluate(board)
    if (gameScore !== false)
      return { score: gameScore, position: null }

    if (depth === difficulty) 
      return { score: 0, position: null }

    let nextMode = mode === "max" ? "min" : "max"

    let minimaxedMoves = []
    game.findEmptyCells(board).forEach(cell => {
      minimaxedMoves.push({
        score: minimax(simulate(board, cell, mode), nextMode, depth + 1).score, 
        position: cell
      })
    })


    let bestMoves = minimaxedMoves.reduce((stored, current) => { 
      if (stored.length === 0)
        return [current]
      else if (stored[0].score < current.score && mode === "max") //max
        return [current]
      else if (stored[0].score > current.score && mode === "min") //min
        return [current]
      else if (stored[0].score === current.score)
        stored.push(current)
      return stored
    }, [])

    if (depth === 0)
      console.log(minimaxedMoves)

    return bestMoves[Math.floor(Math.random() * bestMoves.length)]
  }

  let _opponentMarker
  const opponentMarker = () => { 
    _opponentMarker = _opponentMarker || game.markers().find(m => m !== marker)
    return _opponentMarker
  }

  const simulate = (board, position, mode) => {
    let simMarker = mode === "max" ? marker : opponentMarker()
    simulation = board.slice(0)
    simulation.splice(position, 1, simMarker)
    return simulation
  }

  const evaluate = board => {
    let winner = game.winner(board)
    if (winner)
      if (winner === marker)
        return 10
      else if (winner !== marker)
        return -10

    if (game.draw(board))
      return 0
    return false
  }


  let isComputer = true
  return { name, marker, markThis, game, isComputer, notify, findBestMove, evaluate }
}



let a = Player("AAAA", "x")
//console.log(a.marker)

let b = Player("BBBB", "b")
//console.log(b.marker)


let d = Computer("DDD", "d", 1)
//console.log(c.marker)

let c = Computer("CCC", "o", 2)
//console.log(c.marker)

game.initialize(a, c)