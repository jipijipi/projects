let board = makeBoard();

function makeBoard() {
    let boardsize = 3;
    let board = [];

    for (let i = 0; i < boardsize; i++) {
        let subArray = new Array(boardsize).fill(0);
        board.push(subArray);
    }

    return board;
}

function checkRow(arr) {
    return arr.every((x) => x > 0 && x == arr[0]) ? arr[0] : false;
}
