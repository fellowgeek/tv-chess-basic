// Framework7 app instance
var app = null;
// Assign Dom7 to $$ for easier DOM manipulation
var $$ = Dom7;
// Create an empty session object to store session data
var session = {};
// Create an empty session hash to store the session data hash
var lastSessionHash = '';
// Load env.js in debug mode
var loadEnv = true;
// Store if the tiles are being dragged
var isDragging = false;
// Global variable
let Chess;
// Create an empty object to store the chess controller instance
var chessController = null;

// Function to log messages to the console when __DEBUG_MODE__ is enabled
function debugLog(...message) {
    if(typeof __DEBUG_MODE__ != 'undefined' && __DEBUG_MODE__ == true) {
        console.log(...message);
    }
}

// Load environment variables in debug mode
if (loadEnv == true) {
    let envJS = document.createElement('script');
    envJS.type = 'text/javascript';
    envJS.src = 'assets/js/debug.env';
    // When env.js is loaded, initialize the app
    envJS.onload = function() {
        debugLog("debug.env loaded successfully");
        initializeApp();
    }
    document.body.appendChild(envJS);
} else {
    debugLog("env.js not loaded");
    initializeApp();
}

function initializeApp() {
    // Intial app state
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

    // Load chess.js for chess move generation/validation, piece placement/movement, and check/checkmate/stalemate detection
    import('./chess.js').then((module) => {
        Chess = module.Chess; // Access the Chess object from the module
        chessController = new Chess();
    });

    // Initialize Framework7 app with iOS theme
    var theme = 'ios';
    app = new Framework7({
        el: '#app', // Root element
        theme, // App theme
        name: 'TV Chess - Basic', // App name
        panel: {
            swipe: false,
            resizable: false,
        }, // Enable swipe panel
        routes: [ // Define app routes
            {
                name: 'home',
                path: '/',
                url: './pages/home.html',
            }
        ]
    });
}

// Event listener for page initialization
$$(document).on('page:init', function (e, page) {
    // Log the page initialization event
    debugLog('event: "page:init" triggered for "' + page.name + '"');

    // If the home page is initialized
    if(page.name != 'home')
        return;

    updateUIFromSession();

    // Read data from storage and load settings
    enClose({
        nativeCall: 'readData',
        successCallback: 'chessLoadSettings',
        errorCallback: 'console.log'
    });

    // Event listener for when the right panel is opened
    $$('.panel-right').on('panel:open', function () {
        debugLog('panel: "right" opened.');
        // Update the panel user interface from the session
        updateUIFromSession();
    });

    // Event listener for when the right panel is closed
    $$('.panel-right').on('panel:closed', function () {
        debugLog('panel: "right" closed.');
        // Update settings from the panel user interface
        chessInitGame();
        updateSessionFromSettingsUI();
        setTimeout(() => {
            chessSaveSettings();
        }, 250);
    });

    // Event listener for when the settings are changed
    $$('.settings').on('change', function() {
        debugLog('event: "change" triggered on ".settings" class.');
        updateSessionFromSettingsUI();
        updateUIFromSession();
    });

    // Event listener for new game button
    $$('.chessNewGame').click(function() {
        chessNewGame();
        setTimeout(() => {
            app.panel.close('right');
        }, 250);
    });

    // Event listener for when the reset button is clicked
    $$('#btnReset').click(function() {
        app.dialog.confirm('Would you like to reset the app data?', 'Reset App', () => {
            // Reset the app session and close the panel
            chessReset();
            setTimeout(() => {
                app.panel.close('right');
            }, 250);
        }, null);
    });

});
