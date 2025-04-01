// Create an empty session object to store session data
var session = {};
// Object to store chess board
var board = null;
// Inital FEN string
const chessStartFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Function to log messages to the console when __DEBUG_MODE__ is enabled
function debugLog(...message) {
    if(typeof __DEBUG_MODE__ != 'undefined' && __DEBUG_MODE__ == true) {
        console.log(...message);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    session = {
        chessAICommentary: 'Y',
        chessSoundsEnabled: 'Y',
        chessHapticsEnabled: 'Y',
        chessFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        chessLastFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        chessPGN: '',
        chessPiecesTheme: 'alpha',
        appDarkMode: 'N',
        appBackground: 'bg-1',
    };

    // Initalize the game
    chessInitGame();

}

function chessNewGame() {
    if (board == null) {
        chessInitGame();
        return;
    }

    // reset the game
    board.clear();
    board.position(chessStartFEN);
    session.chessFEN = chessStartFEN;
    session.chessLastFEN = chessStartFEN;
    session.chessPGN = '';
}

function chessInitGame() {
    debugLog('Initializing chess game...');

    var config = {
        draggable: true,
        position: session.chessFEN,
        pieceTheme: 'assets/img/chesspieces/' + session.chessPiecesTheme + '/{piece}.png',
    }

    board = Chessboard('chessBoard', config);
}

// Resize the chess board when window is resized
window.addEventListener('resize', function() {
    debugLog('Window resized: ' + window.innerWidth + 'x' + window.innerHeight);
    if (board != null) {
        board.resize();
    }
});


// This function sets the app backgroung image.
function chessSetBackground(bg) {
    // Validate the background
    if (/\b(bg-1|bg-2|bg-3|bg-4|bg-5|bg-6|bg-7|bg-8|bg-9)\b/.test(bg) == false) {
        return false;
    }

    // Update the session and set the background
    session.hostBackground = bg;
    $$('body').removeClass('bg-1 bg-2 bg-3 bg-4 bg-5 bg-6 bg-7 bg-8 bg-9').addClass(session.hostBackground);
}