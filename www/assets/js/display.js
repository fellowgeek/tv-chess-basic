// Object to store chess board
var board = null;

// Inital FEN string
const chessStartFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Create an empty session object to store session data
var session = {
    chessFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    chessPiecesTheme: 'alpha',
    appDarkMode: 'N',
    appBackground: 'bg-1',
};

// Function to log messages to the console when __DEBUG_MODE__ is enabled
function debugLog(...message) {
    if(typeof __DEBUG_MODE__ != 'undefined' && __DEBUG_MODE__ == true) {
        console.log(...message);
    }
}

// This function (re)initalizes the chess board and loads the last state from session (if any)
function chessInitGame() {
    debugLog('Initializing chess game...');

    var config = {
        draggable: false,
        position: session.chessFEN,
        pieceTheme: 'assets/img/chesspieces/' + session.chessPiecesTheme + '/{piece}.png',
    }

    board = Chessboard('chessBoard', config);
}

// This function starts a new chess game
function chessNewGame() {
    if (board == null) {
        chessInitGame();
        return;
    }

    // reset the game
    board.clear();
    board.position(chessStartFEN);
    session.chessFEN = chessStartFEN;
}

// This function sets the app backgroung image.
function chessSetBackground(bg) {
    // Validate the background
    if (/\b(bg-1|bg-2|bg-3|bg-4|bg-5|bg-6|bg-7|bg-8|bg-9)\b/.test(bg) == false) {
        return false;
    }

    // Update the session and set the background
    session.appBackground = bg;

    const body = document.querySelector('body');
    body.classList.remove('bg-1', 'bg-2', 'bg-3', 'bg-4', 'bg-5', 'bg-6', 'bg-7', 'bg-8', 'bg-9');
    body.classList.add(session.appBackground);
}

// This function updated the chess board on external display based on a FEN string
function chessUpdateBoard(FEN) {
    if (FEN == session.chessFEN) {
        return;
    }

    session.chessFEN = FEN;
    board.position(FEN);
}

// Resize the chess board when window is resized
window.addEventListener('resize', function() {
    debugLog('Window resized: ' + window.innerWidth + 'x' + window.innerHeight);
    if (board != null) {
        board.resize();
    }
});
