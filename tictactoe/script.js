//make initial board

let gameBoard = (() => {
    let boardSize = 3;
    const board = [];

    for (let i = 0; i < boardSize; i++) {
        let subArray = new Array(boardSize).fill(0);
        board.push(subArray);
    }

    return board;
})();

gameBoard = [
    [1, 1, 2],
    [1, 2, 1],
    [2, 0, 1],
];

//check solutions

function check(arr) {
    return arr.every((x) => x > 0 && x == arr[0]) ? arr[0] : false;
}

function checkArray() {
    const resultsTable = [];
    let boardSize = gameBoard[0].length;

    //rows
    let rows = gameBoard.forEach((x) => resultsTable.push(x));

    //columns
    let columnArray = [];

    for (let i = 0; i < boardSize; i++) {
        let subArray = [];
        for (let j = 0; j < boardSize; j++) {
            subArray.push(gameBoard[j][i]);
        }

        columnArray.push(subArray);
    }

    columnArray.forEach((x) => resultsTable.push(x));

    //first diagonal
    let firstDiagonalArray = [];
    for (i = 0; i < boardSize; i++) {
        firstDiagonalArray.push(gameBoard[i][i]);
    }
    resultsTable.push(firstDiagonalArray);

    //second diagonal
    let secondDiagonalArray = [];
    for (i = 0; i < boardSize; i++) {
        secondDiagonalArray.push(gameBoard[i][boardSize - 1 - i]);
    }
    resultsTable.push(secondDiagonalArray);

    //check
    console.log(resultsTable);
    for (let item of resultsTable) {
        if (check(item)) {
            return check(item) + ' wins !';
        }
    }
}
