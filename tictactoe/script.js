//make initial board

let gameBoard = (() => {
    let boardSize = 3;
    const board = [];

    for (let i = 0; i < boardSize; i++) {
        let subArray = new Array(boardSize).fill(0);
        board.push(subArray);
    }

    document.querySelector('#reset').addEventListener('click', drawBoard);

    return { board, boardSize };
})();

//test case
/* gameBoard.board = [
    [1, 1, 2],
    [1, 0, 1],
    [2, 0, 1],
]; */

//check solutions

let game = (() => {
    function check(arr) {
        return arr.every((x) => x > 0 && x == arr[0]) ? arr[0] : false;
    }

    let checkArray = () => {
        const resultsTable = [];
        let boardSize = gameBoard.boardSize;
        let board = gameBoard.board;

        console.log({ boardSize, board });

        //rows
        let rows = board.forEach((x) => resultsTable.push(x));

        //columns
        let columnArray = [];

        for (let i = 0; i < boardSize; i++) {
            let subArray = [];
            for (let j = 0; j < boardSize; j++) {
                subArray.push(board[j][i]);
            }

            columnArray.push(subArray);
        }

        columnArray.forEach((x) => resultsTable.push(x));

        //first diagonal
        let firstDiagonalArray = [];
        for (i = 0; i < boardSize; i++) {
            firstDiagonalArray.push(board[i][i]);
        }
        resultsTable.push(firstDiagonalArray);

        //second diagonal
        let secondDiagonalArray = [];
        for (i = 0; i < boardSize; i++) {
            secondDiagonalArray.push(board[i][boardSize - 1 - i]);
        }
        resultsTable.push(secondDiagonalArray);

        //check
        console.log(resultsTable);
        for (let item of resultsTable) {
            if (check(item)) {
                return check(item) + ' wins !';
            }
        }
    };

    return { checkArray };
})();

// game display

function drawBoard() {
    boardSize = gameBoard.boardSize;
    let gameSpace = document.querySelector('#game');

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            let square = document.createElement('button');
            square.className = 'square';
            square.setAttribute('row', i);
            square.setAttribute('column', j);
            // square.innerText = '.';
            gameSpace.append(square);
        }
    }
}

drawBoard();

//player

let playerOne = {
    name: 1,
    color: '#ffdce2',
};
let playerTwo = {
    name: 2,
    color: '#c3e7e2',
};

let playerOneTurn = true;

let currentPlayer = () => {
    let name = playerOneTurn ? playerOne.name : playerTwo.name;
    let color = playerOneTurn ? playerOne.color : playerTwo.color;
    return { name, color };
};

function updateSquare() {
    let x = this.getAttribute('row');
    let y = this.getAttribute('column');

    if (gameBoard.board[x][y] === 0) {
        gameBoard.board[x][y] = currentPlayer().name;
        this.style.backgroundColor = currentPlayer().color;
        playerOneTurn = !playerOneTurn;
    }

    console.log(game.checkArray());
}

//

let squares = document.querySelectorAll('.square');
squares.forEach((x) => x.addEventListener('click', updateSquare));
