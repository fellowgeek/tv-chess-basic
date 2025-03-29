// This function loads the app settings from a response or the current session.
function chessLoadSettings(response = '', updateStatuses = false) {
    // If the response is not empty, parse it and update the session.
    if (response != '') {
        session = JSON.parse(response.replace(/\n/g, '\\n'));
        if (session.appDarkMode == undefined) session.appDarkMode = 'N';
        if (session.appBackground == undefined) session.appBackground = 'bg-1';
    }

    // Update the UI
    updateUIFromSession();
}

// This function saves the current session to the storage.
function chessSaveSettings() {
    // check if the session has changed
    let sessionHash = generateHash(JSON.stringify(session));
    if (sessionHash == lastSessionHash) {
        debugLog('Session has not changed, save skipped.');
        return;
    }

    // write the session to the storage
    enClose({
        nativeCall: 'writeData',
        data: {
            content: JSON.stringify(session),
        }
    });

    // update the last session hash
    lastSessionHash = sessionHash;
}

// This function updates the session from the settings user interface.
function updateSessionFromSettingsUI() {
    // Update the session
    session.appDarkMode = $$('#appDarkMode').prop('checked') ? 'Y' : 'N';
    session.appBackground = $$('#appBackground').val();
}

// This function updates the settings user interface from the session.
function updateUIFromSession() {
    // Update page background
    $$('.page[data-name="home"]').removeClass('bg-1 bg-2 bg-3 bg-4 bg-5 bg-6').addClass(session.appBackground);

    // Update the dark mode settings
    $$('#appDarkMode').prop('checked', session.appDarkMode == 'Y' ? true : false);
    if (session.appDarkMode == 'Y') {
        app.setDarkMode(true);
        //app.setColorTheme('#ff2d55');
    } else {
        app.setDarkMode(false);
        app.setColorTheme('#007aff');
    }

    // Update the background selector
    $$('#appBackground').val(session.appBackground);

}

// This function resets all app settings to default.
function chessReset() {
    // Reset the session
    session = {
        hostDarkMode: 'N',
        hostBackground: 'bg-1',
        hostSelectedSubscription: 'hostalerts.monthly',
        hostServers: [],
        hostLayout: '',
        hostDeviceToken: '',
        applicationBadge: 0,
        hasSubscription: 'N',
        hasNotificationAuthorization: 'N',
        unlockCode: '******',
        clientID: ''
    };

    // Remove all servers from the UI
    let tiles = hostTiles.getItems().filter(tile => {
        return tile.getElement().getAttribute('data-button') == undefined;
    });
    hostTiles.remove(tiles, {
        removeElements: true,
        layout: false
    });
    hostTiles.layout();

    // Reset the application badge
    enClose({
        nativeCall: 'updateApplicationBadgeCount',
        data: {
            badge: 0
        }
    });

    // Get subscription status
    enClose({
        'nativeCall': 'getSubscriptionStatus',
        successCallback: 'hostUpdateSubscription'
    });

    // Get notification authorization status
    enClose({
        'nativeCall': 'getNotificationsAuthorizationStatus',
        successCallback: 'hostUpdateNotificationAuthorization'
    });

    // Update the UI
    updateUIFromSession();

    setTimeout(() => {
        // Update the UI
        updateUIFromSession();

        // Save session
        hostSaveSettings();
    }, 2500);
}

// This function sets the app backgroung image.
function chessSetBackground(bg) {
    // Validate the background
    if (/\b(bg-1|bg-2|bg-3|bg-4|bg-5)\b/.test(bg) == false) {
        return false;
    }

    // Update the session and set the background
    session.hostBackground = bg;
    $$('.page[data-name="home"]').removeClass('bg-1 bg-2 bg-3 bg-4 bg-5 bg-6').addClass(session.hostBackground);

    // Save the session
    hostSaveSettings();
}

// This function compares two FEN strings and provides humorous commentary about the chess game
function chessGenerateHumorousCommentary(beforeFEN, afterFEN) {
    const chessBefore = new Chess(beforeFEN);

    // Get the move that led to afterFEN
    const moves = chessBefore.moves({ verbose: true });

    console.log(moves);
    let lastMove = null;

    for (const move of moves) {
        chessBefore.move(move.san);
        if (chessBefore.fen() === afterFEN) {
            lastMove = move;
            break;
        }
        chessBefore.undo();
    }

    if (!lastMove) {
        return "Something strange happened... Did we just enter an alternate reality?";
    }

    const pieceNames = {
        p: ["pawn", "peasant", "little guy"],
        n: ["knight", "horsey", "noble steed", "the horse thing"],
        b: ["bishop", "pointy hat dude", "diagonal menace"],
        r: ["rook", "castle", "tower of power"],
        q: ["queen", "royal powerhouse", "chess overlord"],
        k: ["king", "big boss", "royal slowpoke"]
    };

    function getRandomComment(comments) {
        return comments[Math.floor(Math.random() * comments.length)];
    }

    function getRandomPieceName(type) {
        return getRandomComment(pieceNames[type] || [type]);
    }

    const pieceName = getRandomPieceName(lastMove.piece);
    const capturedPieceName = lastMove.captured ? getRandomPieceName(lastMove.captured) : null;

    if (lastMove.captured) {
        const captureComments = [
            `${pieceName.charAt(0).toUpperCase() + pieceName.slice(1)} devours the ${capturedPieceName}! Survival of the fittest!`,
            `The ${pieceName} says: 'You won't be needing that square anymore, ${capturedPieceName}.'`,
            `One less ${capturedPieceName} on the board... someone’s not making it home for dinner!`
        ];
        return getRandomComment(captureComments);
    }

    if (lastMove.flags.includes("k")) {
        return getRandomComment([
            "The king shuffles to safety! A tactical retreat, or just cold feet?",
            "Castling: The king's way of saying 'Nope, not today!'",
            "The king moves... behind his rook. Classic game of hide and seek!"
        ]);
    }

    if (lastMove.flags.includes("p")) {
        return getRandomComment([
            "En passant! The most confusing rule strikes again!",
            "A sneaky pawn swipe! That was smoother than a magician’s trick!",
            "Even some grandmasters forget about en passant... but not this time!"
        ]);
    }

    if (lastMove.flags.includes("q") || lastMove.flags.includes("r")) {
        return getRandomComment([
            "A humble pawn just transformed into royalty! Glow-up of the century!",
            "Pawn to queen: ‘You wouldn't believe my journey!’",
            "Promotion time! That pawn just got a serious job upgrade!"
        ]);
    }

    if (lastMove.san.includes("+")) {
        return getRandomComment([
            `${pieceName.charAt(0).toUpperCase() + pieceName.slice(1)} says: ‘Knock, knock, your Majesty!’`,
            "Check! The king feels a slight breeze of danger.",
            "Oh no! The king is under attack! Quick, someone call security!"
        ]);
    }

    if (lastMove.san.includes("#")) {
        return getRandomComment([
            "Checkmate! That’s game over, folks!",
            "That was a royal shutdown! The king has been dethroned!",
            "Game over! Someone just pulled off a checkmate like a boss!"
        ]);
    }

    return getRandomComment([
        `${pieceName.charAt(0).toUpperCase() + pieceName.slice(1)} moves to ${lastMove.to}. Probably part of some grandmaster plan... or just vibes.`,
        `${pieceName.charAt(0).toUpperCase() + pieceName.slice(1)} steps forward with confidence! Or maybe just hesitation disguised as strategy?`,
        `${pieceName.charAt(0).toUpperCase() + pieceName.slice(1)} finds a new home at ${lastMove.to}. Hope it’s cozy!`
    ]);
}

// This function copies text from HTML element to clipboard.
function copyToClipboard(elementID) {
    let copyText = document.getElementById(elementID);
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);

    // Issue a haptic feedback
    enClose({
        nativeCall: 'issueHaptic',
    });
}

// This function masks input number.
function maskInputNumber(input) {
    let value = input.value;

    // Allow only valid numeric characters
    value = value.replace(/[^0-9]/g, '');

    // Remove leading zeros
    value = value.replace(/^0+/, '');

    // Update the input value
    input.value = value;
}

// This function generates a hash for a string.
function generateHash(str) {
    let hash = 0;
    if (str.length === 0) {
        return hash;
    }
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

// Performs a functional test of the app.
function test() {
    let beforeFEN = "r2qkbnr/p3pppp/npppb3/8/2P1P3/3P3N/PP2BPPP/RNBQK2R w KQkq - 0 6";
    let afterFEN = "r2qkbnr/p3pppp/npppb3/8/2P1P3/3P3N/PP2BPPP/RNBQ1RK1 b kq - 1 6";
    console.log(chessGenerateHumorousCommentary(beforeFEN, afterFEN));
}