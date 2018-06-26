# JavaScript Tic-Tac-Toe

A Tic-Tac-Toe browser game running on JavaScript.

## Links
- [Game](https://htmlpreview.github.io/?https://github.com/nmacawile/js-tic-tac-toe/blob/master/index.html)
- [Project page](https://www.theodinproject.com/courses/javascript/lessons/tic-tac-toe-javascript)

## Features
- Play against another player
- Play against AI with various difficulty settings
- Change game mode anytime by clicking on any player's name

## Minimax

### The Minimax function and its parameters
```javascript
const minimax = (board, mode, depth = 0) => {
```

`board` should be an copy of the board that needs to be evaluated

`mode` can either be `"max"` or `"min"`

`depth`, an optional parameter with a default value of `0`, should be a number

### Game evalution
#### End nodes
Evaluates the `board` when the game is over. This triggers only at the end nodes where there are no more moves available.
```javascript
  let gameScore = evaluate(board)
  if (gameScore !== false)
    return { score: gameScore, position: null }
```

#### Depth limiter
Evaluates the board if it reaches a certain amount of depth even if the game is not over. 
Child nodes won't be explored any further. This is used to limit the number of moves the AI can look ahead.
Higher value means 'smarter' AI, but also uses more resources. For chess application, it is important to limit the depth to avoid slowdown and stack overflow.

```javascript
  if (depth === difficulty) 
    return { score: 0, position: null }
```
In this case, the `difficulty` value acts as the depth limiter.

### Recursion
Applies minimax to all child nodes. It alternates between `MIN` and `MAX`. If the current node is being evaluated for `MAX`, all child nodes should be evaluated for `MIN` and vice-versa.
```javascript
  let nextMode = mode === "max" ? "min" : "max"

  let minimaxedMoves = []
  game.findEmptyCells(board).forEach(cell => {
    minimaxedMoves.push({
      score: minimax(simulate(board, cell, mode), nextMode, depth + 1).score, 
      position: cell
    })
  })
```

### Finding the `MIN` or `MAX`
Stores the nodes that have the best value in an array depending on whether it is looking for the `MIN` or `MAX`
```javascript
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
```

### Choosing a random node from the array
Randomly selects from the array of nodes with the best value
```javascript
  return bestMoves[Math.floor(Math.random() * bestMoves.length)]
}
```
