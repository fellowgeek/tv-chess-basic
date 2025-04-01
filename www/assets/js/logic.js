var board = null;
const chessStartFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

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
    } catch {
        // illegal move
        return 'snapback';
    }

    // Play sound effects and haptics
    chessPlaySound();
    chessIssueHaptics();

    updateStatus();
}

// update the board position after the piece snap for castling, en passant, pawn promotion
function onSnapEnd() {
    board.position(chessController.fen());
}

function updateStatus(intial = false) {
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
    session.chessPGN = chessController.pgn();

    // Provide insightful comentary
    if (intial == false) {
        let commentary = alt_chessGenerateHumorousCommentary(session.chessLastFEN, session.chessFEN);
        let comentaryParts = commentary.split('|');
        comentaryParts.forEach((comentaryPart, index) => {
            comentaryParts[index] = createSlugFromFirst10Words(comentaryPart);
        });
        commentary = commentary.replaceAll('|', '');
        debugLog(comentaryParts);
        chessSpeak(commentary);
    }

    $$('#status').text(status);
    $$('#fen').text(chessController.fen());
    $$('#pgn').text(chessController.pgn());

    // save session
    chessSaveSettings();
}

function chessNewGame() {
    if (board == null) {
        chessInitGame();
        return;
    }

    // reset the game
    board.clear();
    board.position(chessStartFEN);
    chessController.reset();
    session.chessFEN = chessStartFEN;
    session.chessLastFEN = chessStartFEN;
    session.chessPGN = '';

    updateStatus(true);
}

function chessInitGame() {
    debugLog('Initializing chess game...');

    var config = {
        draggable: true,
        position: session.chessFEN,
        pieceTheme: 'assets/img/chesspieces/' + session.chessPiecesTheme + '/{piece}.png',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
    }

    board = Chessboard('chessBoard', config);
    chessController.loadPgn(session.chessPGN);
    updateStatus(true);

    debugLog(`%c${chessController.ascii()}`, 'font-family: menlo, consolas, monospace');
}

// Resize the chess board when window is resized
window.addEventListener('resize', function() {
    debugLog('Window resized: ' + window.innerWidth + 'x' + window.innerHeight);
    if (board != null) {
        board.resize();
    }
});