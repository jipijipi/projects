//make initial board

let gameBoard = (() => {
    let boardsize = 3;
    const board = [];

    for (let i = 0; i < boardsize; i++) {
        let subArray = new Array(boardsize).fill(0);
        board.push(subArray);
    }

    return board;
})();

gameBoard = [
    [1, 0, 1],
    [0, 1, 1],
    [0, 0, 1],
];

//check solutions

function check(arr) {
    return arr.every((x) => x > 0 && x == arr[0]) ? arr[0] : false;
}

function checkArray() {
    const resultsTable = [];

    let rows = gameBoard.forEach((x) => resultsTable.push(x));

    return resultsTable;
}
