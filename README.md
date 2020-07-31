Chrome (Edge Chromium) Devtools Network Timestamps tab
===

This is a small extension based on a boilerplate project to be used as a starting point for developing a Chrome DevTools Extension.

Installation
===

 * Open [chrome://extensions](chrome://extensions)
 * Enable 'Developer Mode' checkbox
 * Click 'Load unpacked extensions...'
 * Select the `devtools-extension` folder

Usage
===

Open the 'Network Timestamps' tab and start browsing. Timestamped network accesses will start to fill your console and the devtools panel.
Click 'Clear Log' to delete the contents of the page and start collecting new network accesses

TODO developing the 'copy to clipboard' once I get past permissions issues.

Components
===
devtools.html -> devtools.js: includes the event listener for 'onRequestFinished' and passes it to the console and (via SendMessage) panel.js
panel.html -> panel.js, messaging.js: panel.js includes the code to populate the panel if the appendRecord method is called
            messaging.js sets up a listener for messages and will fire appendRecord once received
background.js -> relays data to/from the inspected page.



