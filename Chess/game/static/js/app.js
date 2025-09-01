async function createBoard() {
    responseInfo = await getBoard()
    let board = responseInfo.board

    window.turn = responseInfo.turn

    turn = window.turn

    let turns = document.getElementById('turns')
    if (turn == true) {
        turns.innerText = "White's Turn ⚪"
    }
    else {
        turns.innerHTML = "Black's Turn ⚫"
    }

    const aiCol = document.getElementById('aiCol').innerText
    if (aiCol !== 'None') {
        getAiMove(aiCol)
    }


    window.boardVar = board

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let sqColor
            let uiNum
            let uiLet
            if ((i + j) % 2 == 0) {
                sqColor = 'light'
            }
            else {
                sqColor = 'dark'
            }
            piece = board[i][j]
            cords = i + "" + j
            if (j == 0) {
                uiNum = 8 - i
            }
            if (i == 7) {
                uiLet = String.fromCharCode(97 + j)
            }
            drawSquares(sqColor, piece, cords, uiNum, uiLet)
        }
    }

}

createBoard()


// sends get request to get the board position
async function getBoard() {
    let board;

    await $.get('/board', function (data) {
        reData = data
    })
    return reData

}
// sends post request to get possible moves
async function getMoves(pieceId) {
    let moves = []
    let checkMate = false
    let draw = false
    let captureStatus
    await $.post('/board', {
        sqId: pieceId,
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
    }, function (data) {
        moves = data.moves
        checkMate = data.checkMate
        draw = data.draw
        captureStatus = data.captureStatus
    })
    return moves, checkMate, draw, captureStatus
}

// sends post request to move pieces
async function movePieces(oldId, newId) {
    let board
    let turn
    await $.post('/board', {
        oldSqId: oldId,
        newSqId: newId,
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
    }, function (data) {
        board = data.board
        turn = data.turn
    })
    return board, turn
}

// sends post request to move ai piece
async function getAiMove(aiCol) {
    let board
    let turn
    await $.post('/board', {
        aiCol: aiCol,
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
    }, function (data) {
        board = data.board
        turn = data.turn
    })
    return board, turn
}


function drawSquares(sqColor, piece, cords, uiNum, uiLet) {
    let boardDiv = document.getElementById('board')

    let sqDiv = document.createElement('div')
    sqDiv.classList.add('square')
    sqDiv.classList.add(sqColor)
    sqDiv.setAttribute('id', cords)

    if (uiNum !== undefined) {
        let span = document.createElement('span')
        span.innerText = uiNum
        span.classList.add('uiNum')
        sqDiv.appendChild(span)
    }

    if (uiLet !== undefined) {
        let span = document.createElement('span')
        span.innerText = uiLet
        span.classList.add('uiLet')
        sqDiv.appendChild(span)
    }

    if (piece) {
        let pieceImg = document.createElement('img')
        pieceImg.classList.add('piece-img')
        pieceImg.src = drawImages(piece)
        pieceImg.setAttribute('id', piece)
        sqDiv.appendChild(pieceImg)
    }

    boardDiv.appendChild(sqDiv)
}


function drawImages(piece) {
    let color;
    if (isUpperCase(piece)) {
        color = 'white';
    } else {
        color = 'black';
    }

    let pieceName = '';
    switch (piece.toLowerCase()) {
        case 'p':
            pieceName = 'pawn';
            break;
        case 'r':
            pieceName = 'rook';
            break;
        case 'n':
            pieceName = 'knight';
            break;
        case 'b':
            pieceName = 'bishop';
            break;
        case 'q':
            pieceName = 'queen';
            break;
        case 'k':
            pieceName = 'king';
            break;
        default:
            pieceName = piece.toLowerCase();
    }

    const imageUrl = `/static/images/${color}-${pieceName}.png`;
    console.log(imageUrl);
    return imageUrl;
}



// Event listeners

let selected = null
document.getElementById('board').addEventListener('click', async function (event) {
    const aiCol = document.getElementById('aiCol').innerText

    if (aiCol !== 'None') {
        if (aiCol === "True" && window.turn === false || aiCol === "False" && window.turn === true) {
            return
        }
    }

    let clickedSquare = event.target.closest('.square')
    if (clickedSquare) {
        let currentPiece = window.boardVar[clickedSquare.id[0]][clickedSquare.id[1]]
        let isCorrectColor = sameColor(window.turn, currentPiece)
        let isSelected = selected === clickedSquare.id
        let isPossible = clickedSquare.classList.contains('possible-move')
        
        if (isPossible) {
            let moves = await movePieces(selected, clickedSquare.id)
            selected = null
            await updateBoard(moves[0], moves[1])
        }

        if (currentPiece && isCorrectColor && !isSelected) {
            if (selected) {
                document.getElementById(selected).classList.remove('selected')
                let elementsToRemove = document.querySelectorAll('.possible-move, .capture-moves, .possible-moves');
                elementsToRemove.forEach(function (element) {
                    element.remove();
                });
            }
            selected = clickedSquare.id
            clickedSquare.classList.add('selected')
            let moves, checkMate, draw, captureStatus = await getMoves(selected)
            if (checkMate) {
                checkMateHandler('c')
            }
            if (draw) {
                checkMateHandler('d')
            }
            let isFound = false
            for (let i = 0; i < moves.length; i++) {
                let piece = window.boardVar[moves[i][0]][moves[i][1]]
                if (piece) {
                    drawPossibleMoves(moves[i], 'capture')
                    isFound = true
                } else {
                    drawPossibleMoves(moves[i], 'move')
                    isFound = true
                }
            }
        }
        else if (!currentPiece && !isSelected) {
            if (selected) {
                document.getElementById(selected).classList.remove('selected')
                let elementsToRemove = document.querySelectorAll('.possible-move, .capture-moves, .possible-moves');
                elementsToRemove.forEach(function (element) {
                    element.remove();
                });
                selected = null
            }
        }
        else if (isSelected) {
            clickedSquare.classList.remove('selected')
            let elementsToRemove = document.querySelectorAll('.possible-move, .capture-moves, .possible-moves');
            elementsToRemove.forEach(function (element) {
                element.remove();
            });
            selected = null
        }
    }
})


function drawPossibleMoves(cords, moveType) {
    let move = document.getElementById(cords)

    let div = document.createElement('div')

    if (moveType == 'move') {
        div.classList.add('possible-moves')
        move.appendChild(div)
        move.classList.add('possible-move')
    } else {
        div.classList.add('capture-moves')
        move.appendChild(div)
        move.classList.add('possible-move')

    }
}


function isUpperCase(string) {
    return string == string.toUpperCase();
}


function sameColor(switcher, string) {
    let isUpperCase = (string) => /^[A-Z]*$/.test(string)

    if (switcher == true) {
        return isUpperCase(string[0])
    }
    else if (switcher == false) {

        if (string) {
            return !isUpperCase(string[0])
        }
    }

}

function checkMateHandler(checker) {
    togglePopup()
    let win = ''
    if (checker == 'c') {
        if (window.turn == true) {
            win = 'black won by checkmate'
        }
        else {
            win = 'white won by checkmate'
        }
    }
    if (checker == 'd') {
        win = 'Draw'
    }
    document.getElementById("winner").innerText = win
}

function drawcaptureStatus(captureStatus) {
    let darkStatus = document.getElementById('darkStatus')
    let lightStatus = document.getElementById('lightStatus')

    darkStatus.innerHTML = '<h2>Captured Pieces:</h2>'
    lightStatus.innerHTML = '<h2>Captured Pieces:</h2>'
    // Dark

    for (let i = 0; i < captureStatus[0].length; i++) {
        let image = document.createElement('img')
        image.classList.add('captured-piece')
        image.src = drawImages(captureStatus[0][i])

        darkStatus.appendChild(image)

    }


    // Light

    for (let i = 0; i < captureStatus[1].length; i++) {
        let image = document.createElement('img')
        image.classList.add('captured-piece')
        image.src = drawImages(captureStatus[1][i])

        lightStatus.appendChild(image)
    }

}

function togglePopup() {
    document.getElementById("popup-1").classList.toggle("active");
}

async function updateBoard(board, turn) {
    let boardDiv = document.getElementById('board')
    boardDiv.innerHTML = ''
    window.boardVar = board
    window.turn = turn

    const aiCol = document.getElementById('aiCol').innerText

    let turns = document.getElementById('turns')
    if (window.turn == true) {
        turns.innerText = "White's Turn"
    }
    else {
        turns.innerHTML = "Black's Turn"
    }

    if (aiCol !== 'None') {
        if (aiCol === "True" && window.turn === false || aiCol === "False" && window.turn === true) {
            getAiMove(aiCol)
        }
    }

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let sqColor
            let uiNum
            let uiLet
            if ((i + j) % 2 == 0) {
                sqColor = 'light'
            }
            else {
                sqColor = 'dark'
            }
            piece = board[i][j]
            cords = i + "" + j
            if (j == 0) {
                uiNum = 8 - i
            }
            if (i == 7) {
                uiLet = String.fromCharCode(97 + j)
            }
            drawSquares(sqColor, piece, cords, uiNum, uiLet)
        }
    }
}