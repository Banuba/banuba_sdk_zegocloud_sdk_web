# ZegoCloud+Banuba RTC Video Call

This demo shows how to use ZegoCloud and Banuba SDK to make a video call.

## Prerequisites

*   Create a ZegoCloud account and obtain an AppID and server address.
*   Generate a token for your user in ZegoCloud Admin Console.
*   Install the latest version of Google Chrome browser.
*   Enable camera and microphone permissions in Google Chrome.

## How to use

1.  Clone this repository.
2.  Open `index.html` in Google Chrome.
3.  Replace `YOUR_APPID`, `YOUR_SERVER_ADDRESS`, `YOUR_TOKEN`, `YOUR_USER_ID`, `YOUR_USER_NAME`, `YOUR_ROOM_ID` and `YOUR_BANUBA_TOKEN` with your actual values in `zego-token.js` and `token.js` files.
4.  Run the demo by clicking on the "Run" button in the browser.

## What's included

*   `index.html`: The HTML file that displays the video call.
*   `script.js`: The JavaScript file that handles the video call logic.
*   `style.css`: The CSS file that styles the HTML elements.
*   `token.js`: The JavaScript file that contains your Banuba SDK token.
*   `zega-token.js`: The JavaScript file that contains your ZegoCloud AppID, server address, token, user ID, user name, and room ID.

## How it works

1.  The demo uses the Banuba SDK to create a player instance and loads the SDK additional files from CDN.
2.  The demo uses the ZegoCloud SDK to create a ZegoExpressEngine instance and logs in to a room.
3.  The demo creates a local stream using the Banuba SDK and publishes it to ZegoCloud.
4.  The demo starts playing a remote stream from ZegoCloud.
5.  The demo displays the local and remote streams in the HTML elements.
