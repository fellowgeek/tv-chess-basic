var board = null;

function onDragStart(source, piece, position, orientation) {
    // do not pick up pieces if the game is over
    if (chessController.isGameOver()) return false;

    // only pick up pieces for the side to move
    if ((chessController.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (chessController.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }
}

function onDrop(source, target) {
    // see if the move is legal
    try  {
        session.chessLastFEN = chessController.fen();
        let move = chessController.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        });
        console.log(move.flags);
    } catch {
        // illegal move
        return 'snapback';
    }

    // Play sound effects and haptics
    chessPlaySound();
    chessIssueHaptics();

    updateStatus();
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd() {
    board.position(chessController.fen());
}

function updateStatus() {
    var status = ''

    var moveColor = 'White';
    if (chessController.turn() === 'b') {
        moveColor = 'Black';
    }

    // checkmate?
    if (chessController.isCheckmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.';
    }

    // draw?
    else if (chessController.isDraw()) {
        status = 'Game over, drawn position';
    }

    // game still on
    else {
        status = moveColor + ' to move';

        // check?
        if (chessController.isCheck()) {
            status += ', ' + moveColor + ' is in check';
        }
    }

    // Update the session
    session.chessFEN = chessController.fen();

    // Provide insightful comentary
    debugLog(chessGenerateHumorousCommentary(session.chessLastFEN, session.chessFEN));

    $$('#status').text(status);
    $$('#fen').text(chessController.fen());
    $$('#pgn').text(chessController.pgn());
}

function chessInitGame() {
    var config = {
        draggable: true,
        position: session.chessFEN,
        pieceTheme: 'assets/img/chesspieces/wikipedia/{piece}.png',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
    }

    board = Chessboard('chessBoard', config);
    session.chessFEN = chessController.fen();
    session.chessLastFEN = chessController.fen();
    updateStatus();
}
