// Object to store chess board
var board = null;

// Inital FEN string
const chessStartFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Create an empty session object to store session data
var session = {
    chessFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    chessPiecesTheme: 'alpha',
    chessTheme: 'classic',
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

    // Apply the theme to the board (twice with delay due to a race condition bug)
    chessSetTheme(session.chessTheme);
    setTimeout(() => {
        chessSetTheme(session.chessTheme);
    }, 50);
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
function chessSetBackground(background) {
    // Validate the background
    if (/\b(bg-1|bg-2|bg-3|bg-4|bg-5|bg-6|bg-7|bg-8|bg-9)\b/.test(background) == false) {
        return false;
    }

    // Update the session and set the background
    session.appBackground = background;

    const body = document.querySelector('body');
    body.classList.remove('bg-1', 'bg-2', 'bg-3', 'bg-4', 'bg-5', 'bg-6', 'bg-7', 'bg-8', 'bg-9');
    body.classList.add(session.appBackground);
}

// This function sets the chess color theme
function chessSetTheme(theme) {

    const themes = {
        classic: {
            black: '#999',
            white: '#eee',
            notation: '#000',
            outline: 'rgba(135, 135, 135, 10)',
            filter: '',
        },
        sepia: {
            black: '#999',
            white: '#eee',
            notation: '#000',
            outline: 'rgba(135, 135, 135, 10)',
            filter: 'sepia(100%)',

        },
        spring: {
            black: 'rgb(96,133,44)',
            white: 'rgb(199, 224, 142)',
            notation: '#000',
            outline: 'rgba(146, 173, 108, 0.92)',
            filter: '',
        },
        winter: {
            black: 'rgb(27, 133, 214)',
            white: 'rgb(115, 186, 237)',
            notation: '#000',
            outline: 'rgba(250, 250, 250, 0.94)',
            filter: '',
        },
        picnic: {
            black: 'rgb(221, 51, 51)',
            white: '#eee',
            notation: '#000',
            outline: 'white',
            filter: '',
        },
    }

    // Validate the theme
    if (/\b(classic|sepia|spring|winter|picnic|snow)\b/.test(theme) == false) {
        return false;
    }

    // Update the session and set the theme
    session.chessTheme = theme;
    $('.black-3c85d').css('background-color', themes[theme].black);
    $('.white-1e1d7').css('background-color', themes[theme].white);
    $('.notation-322f9').css('color', themes[theme].notation);
    $('.board-b72b1').css('outline-color', themes[theme].outline);
    $('#chessBoard').css('filter', themes[theme].filter);
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
