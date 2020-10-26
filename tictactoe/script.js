// make initial board

const gameBoard = (() => {
    const boardSize = 3;
    const board = [];

    function drawBoard() {
        board.length = 0;
        const gameSpace = document.querySelector('#game');
        gameSpace.innerHTML = '';

        for (let i = 0; i < boardSize; i++) {
            const rowArr = [];
            for (let j = 0; j < boardSize; j++) {
                rowArr.push(0);
                const square = document.createElement('button');
                square.className = 'square';
                square.setAttribute('row', i);
                square.setAttribute('column', j);
                square.addEventListener('click', updateSquare);
                gameSpace.append(square);
            }
            board.push(rowArr);
        }
    }

    drawBoard();

    document.querySelector('#reset').addEventListener('click', drawBoard);

    return { board, boardSize };
})();

const game = (() => {
    function check(arr) {
        return arr.every((x) => x > 0 && x == arr[0]) ? arr[0] : false;
    }

    const checkArray = () => {
        const resultsTable = [];
        const { boardSize } = gameBoard;
        const { board } = gameBoard;

        console.log({ boardSize, board });

        // rows
        // const rows = board.forEach((x) => resultsTable.push(x));

        // columns
        const columnArray = [];

        for (let i = 0; i < boardSize; i++) {
            const subArray = [];
            for (let j = 0; j < boardSize; j++) {
                subArray.push(board[j][i]);
            }

            columnArray.push(subArray);
        }

        columnArray.forEach((x) => resultsTable.push(x));

        // first diagonal
        const firstDiagonalArray = [];
        for (let i = 0; i < boardSize; i++) {
            firstDiagonalArray.push(board[i][i]);
        }
        resultsTable.push(firstDiagonalArray);

        // second diagonal
        const secondDiagonalArray = [];
        for (let i = 0; i < boardSize; i++) {
            secondDiagonalArray.push(board[i][boardSize - 1 - i]);
        }
        resultsTable.push(secondDiagonalArray);

        // check
        console.log(resultsTable);
        for (const item of resultsTable) {
            if (check(item)) {
                return `${check(item)} wins !`;
            }
        }
    };

    return { checkArray };
})();

// game display

// player

const playerOne = {
    name: 1,
    color: '#ffdce2',
};
const playerTwo = {
    name: 2,
    color: '#c3e7e2',
};

let playerOneTurn = true;

const currentPlayer = () => {
    const name = playerOneTurn ? playerOne.name : playerTwo.name;
    const color = playerOneTurn ? playerOne.color : playerTwo.color;
    return { name, color };
};

function updateSquare() {
    const x = this.getAttribute('row');
    const y = this.getAttribute('column');

    if (gameBoard.board[x][y] === 0) {
        gameBoard.board[x][y] = currentPlayer().name;
        this.style.backgroundColor = currentPlayer().color;
        playerOneTurn = !playerOneTurn;
        console.log(game.checkArray());
    }
}
