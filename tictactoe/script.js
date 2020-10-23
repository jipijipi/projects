//make initial board

let gameBoard = (() => {
    let boardSize = 3;
    const board = [];

    for (let i = 0; i < boardSize; i++) {
        let subArray = new Array(boardSize).fill(0);
        board.push(subArray);
    }

    return { board, boardSize };
})();

//test case
gameBoard.board = [
    [1, 1, 2],
    [1, 2, 1],
    [2, 0, 1],
];

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

let drawBoard = () => {
    numberOfSquares = gameBoard.boardSize ** 2;
    let gameSpace = document.querySelector('#game');

    for (let i = 0; i < numberOfSquares; i++) {
        let square = document.createElement('button');
        square.className = 'square';
        square.innerText = '.';
        gameSpace.append(square);
    }
};

drawBoard();
