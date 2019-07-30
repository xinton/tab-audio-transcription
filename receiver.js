// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const captureAudio = require('./transcription')

async function startAudioCapture() {
  try {
    // Start to capture the microphone audio
    this.transcriptStream = await captureAudio();

    this.transcriptStream.on('data', (data) => {
      // Get the transcribed audio
      if (data.final) {
        // Final transcribed message
        appendMessage(`${data.speaker} : ${data.alternatives[0].transcript}`)

      } else {
        // Peek message
        appendMessage(`${data.speaker} : ${data.alternatives[0].transcript}`)
      }
    });

    this.transcriptStream.on('error', (err) => {
      /**
       * Errors exceptions
       */
      if (err.toString().indexOf('WebSocket') >= 0) {
        // WebSocket error. Problem with IBM service.
        console.log("WebSocket error. Problem with IBM service")

      }
      if (err.toString().indexOf('NotAllowedError') >= 0) {
        // Microhpone not allowed on broswer
        console.log("Microhpone not allowed on broswer")
      }
    });

    this.transcriptStream.on('close', function (event) {
      console.log("The transcript stream was closed")
    });

    this.transcriptStream.on('end', function (end) {
      console.log("The transcript stream was ended")
    });
  } catch (error) {
    console.error('Error on transcript stream')
  }
}

startAudioCapture();

function appendMessage(text){
  let ul = document.getElementById('messages');
  let li = document.createElement('li')
  let message = document.createTextNode(text); 

  li.appendChild(message);
  ul.appendChild(li)
}

// Note: |window.currentStream| was set in background.js.

// Stop video play-out, stop the MediaStreamTracks, and set style class to
// "shutdown".
function shutdownReceiver() {
  if (!window.currentStream) {
    return;
  }

  var player = document.getElementById('player');
  player.src = '';
  var tracks = window.currentStream.getTracks();
  for (var i = 0; i < tracks.length; ++i) {
    tracks[i].stop();
  }
  window.currentStream = null;

  document.body.className = 'shutdown';
}

window.addEventListener('load', function() {
  // Start video play-out of the captured audio/video MediaStream once the page
  // has loaded.
  var player = document.getElementById('player');
  player.addEventListener('canplay', function() {
    this.volume = 0.75;
    this.muted = false;
    this.play();
  });
  player.setAttribute('controls', '1');
  player.srcObject = window.currentStream;

  // Add onended event listeners. This detects when tab capture was shut down by
  // closing the tab being captured.
  var tracks = window.currentStream.getTracks();
  for (var i = 0; i < tracks.length; ++i) {
    tracks[i].addEventListener('ended', function() {
      console.log('MediaStreamTrack[' + i + '] ended, shutting down...');
      shutdownReceiver();
    });
  }
});

// Shutdown when the receiver page is closed.
window.addEventListener('beforeunload', shutdownReceiver);
