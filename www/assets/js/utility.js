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

// Define a function for making an AJAX call using the fetch API.
async function httpRequest(url, options, successCallback, errorCallback, finalCallback, isRaw = false) {
    if (typeof options == 'undefined')
        options = {};

    // Auto stringify the body
    if (typeof options.body != 'undefined' && isRaw == false) {
        options.body = JSON.stringify(options.body);
    }
    try {
        const fetchResult = fetch(url, options);
        const response = await fetchResult;
        if (response.ok) {
            if (typeof successCallback != 'undefined')
                successCallback(response);
        } else {
            if (typeof errorCallback != 'undefined')
                errorCallback(response);
        }
    } catch (error) {
        if (typeof errorCallback != 'undefined')
            errorCallback(error);
    } finally {
        if (typeof finalCallback != 'undefined')
            finalCallback();
    }
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

// This function creates an HTML element from a string.
function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild;
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

// This function generates a random tile name of the specified length.
function generateRandomTileName(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }
    return code;
}

// This function generates a random number between two numbers.
function getRandomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// This function gets a random icon from the icon select popup
function getRandomIcon() {
    let icons = [];
    let iconItems = $$('.host-select-icon-item');
    iconItems.forEach((iconItem, index) => {
        icons.push($$(iconItem).data('icon'));
    });

    return icons[getRandomNumberBetween(0, icons.length - 1)];
}

// This function returns region names
function getRegionName(regionCode) {
    try {
        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
        return regionNames.of(regionCode);
    } catch (error) {
        return null;
    }
}

// This function returns the number of seconds since a timestamp
function secondsSinceTimestamp(timestamp) {
    const now = new Date();
    const timestampDate = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const differenceInMilliseconds = now - timestampDate;
    return Math.floor(differenceInMilliseconds / 1000);
}

// This function checks if an array has duplicates.
function arrayHasDuplicates(array) {
    return array.some((item, index) => array.indexOf(item) !== index);
}

// Performs a functional test of the app.
function test() {
}