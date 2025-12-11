import {
  Dom,
  Effect,
  MediaStreamCapture,
  Module,
  Player,
  Webcam,
} from "https://cdn.jsdelivr.net/npm/@banuba/webar@1.17.6/dist/BanubaSDK.browser.esm.js";

import clientToken from "./token.js";

import {
  appID,
  server,
  token,
  userID,
  userName,
  roomID,
} from "./zego-token.js";

let player;

/**
 * Creates a Banuba player instance.
 * @returns {Promise<Player>} A promise that resolves with a player instance.
 * @throws {Error} If the player creation fails, an error is thrown.
 */
async function createPlayer() {
  try {
    player = await Player.create({
      clientToken,

      // Load SDK additional files from CDN
      locateFile: {
        "BanubaSDK.data":
          "https://cdn.jsdelivr.net/npm/@banuba/webar@1.17.6/dist/BanubaSDK.data",
        "BanubaSDK.wasm":
          "https://cdn.jsdelivr.net/npm/@banuba/webar@1.17.6/dist/BanubaSDK.wasm",
        "BanubaSDK.simd.wasm":
          "https://cdn.jsdelivr.net/npm/@banuba/webar@1.17.6/dist/BanubaSDK.simd.wasm",
      },

      // Set device pixel ratio to 1 to avoid blurry images and better performance
      devicePixelRatio: 1,
    });
  } catch (error) {
    console.error("Failed to create player", error);
    return;
  }

  try {
    // Preload and apply effect
    const effect = await Effect.preload("effects/test_BG.zip");

    // Other effects
    // const effect = await Effect.preload("effects/Hipster3.zip");
    // const effect = await Effect.preload("effects/MonsterFactory.zip");
    // const effect = await Effect.preload("effects/Glasses.zip");

    player.applyEffect(effect);

    // Find more about available modules:
    // https://docs.banuba.com/face-ar-sdk-v1/generated/typedoc/classes/Module.html
    for (const moduleName of ["face_tracker", "background"]) {
      const module = await Module.preload(
        `https://cdn.jsdelivr.net/npm/@banuba/webar@1.17.6/dist/modules/${moduleName}.zip`
      );
      await player.addModule(module);
    }

    // Create webcam instance
    const webcam = new Webcam();

    // Use webcam in player
    await player.use(webcam);

    // Render player in DOM
    Dom.render(player, document.querySelector("#local-video"));

    console.info("Player created");
  } catch (error) {
    console.error("Failed to create player", error);
  }
}

// Initialize the ZegoExpressEngine instance
const zg = new ZegoExpressEngine(appID, server);

// Callback for updates on the current user's room connection status.
zg.on("roomStateUpdate", (roomID, state, errorCode, extendedData) => {
  if (state == "DISCONNECTED") {
    // Disconnected from the room
    console.info("Disconnected from the room");
  }

  if (state == "CONNECTING") {
    // Connecting to the room
    console.info("Connecting to the room");
  }

  if (state == "CONNECTED") {
    // Connected to the room
    console.info("Connected to the room");
  }
});

// Callback for updates on the status of ther users in the room.
zg.on("roomUserUpdate", (roomID, updateType, userList) => {
  console.warn(
    `roomUserUpdate: room ${roomID}, user ${
      updateType === "ADD" ? "added" : "left"
    } `,
    JSON.stringify(userList)
  );
});

// Callback for updates on the status of the streams in the room.
zg.on(
  "roomStreamUpdate",
  async (roomID, updateType, streamList, extendedData) => {
    console.info("roomStreamUpdate", updateType, streamList);

    if (updateType == "ADD") {
      // New stream added, start playing the stream.
      console.info("New stream added, start playing the stream.");
    } else if (updateType == "DELETE") {
      // Stream deleted, stop playing the stream.
      console.info("Stream deleted, stop playing the stream.");
    }
  }
);

zg.on("publisherStateUpdate", (result) => {
  console.info("publisherStateUpdate", result);
});

zg.on("publishQualityUpdate", (streamID, stats) => {
  console.info("publishQualityUpdate", streamID, stats);
});

zg.on("playerStateUpdate", (result) => {
  console.info("playerStateUpdate", result);
});

zg.on("playQualityUpdate", (streamID, stats) => {
  console.info("playQualityUpdate", streamID, stats);
});

const requirementsResult = await zg.checkSystemRequirements();

// The [result] indicates whether it is compatible. It indicates WebRTC is supported when the [webRTC] is [true]. For more results, see the API documents.
console.info("checkSystemRequirements: ", requirementsResult);

// Log in to a room. It returns `true` if the login is successful.
// The roomUserUpdate callback is disabled by default. To receive this callback, you must set the `userUpdate` property to `true` when logging in to a room.
const loginRoomResult = await zg.loginRoom(
  roomID,
  token,
  { userID, userName },
  { userUpdate: true }
);

console.info("loginRoom: ", loginRoomResult);

// Create a Banuba SDK player
await createPlayer();

// Create a MediaStreamCapture instance from Banuba SDK player
const capture = await new MediaStreamCapture(player);

// Connected to the room successfully. You can perform operations such as stream publishing and playing only after the room is successfully connected.
// Create a stream and start the preview.
// After calling the createZegoStream method, you need to wait for the ZEGO server to return the local stream object before any further operation.
const localStream = await zg.createZegoStream({
  custom: {
    video: {
      source: capture,
    },
    audio: {
      source: capture,
    },
  },
  autoPlay: true,
  enableAutoplayDialog: true,
});

// Publish a stream to ZEGOCLOUD audio and video cloud. You can set `streamID` based on your service requirements but ensure that it is globally unique.
const streamID = new Date().getTime().toString();

// localStream is the MediaStream object created by calling creatStream in the previous step.
zg.startPublishingStream(streamID, localStream);

// Start playing a remote stream.
const remoteStream = await zg.startPlayingStream(streamID);

// View remote stream in the <div> element on your webpage.
const remoteView = zg.createRemoteStreamView(remoteStream);

// The remote-video is the <div> element's id on your webpage.
remoteView.play("remote-video", { enableAutoplayDialog: true });
