var recognizeMicrophone  = require('watson-speech/speech-to-text/recognize-microphone');

async function getToken() {
  try {
      var res = await fetch('https://ectg51rx1i.execute-api.us-east-1.amazonaws.com/dev/api/speech-to-text/token');
      var token = await res.text();
      return token;
  } catch (error) {        
        console.error("Error fetching the token");
  }
}

module.exports = async function captureAudio() {
  let transcriptToken;
  try {
      transcriptToken = await getToken()
  } catch (error) {
      console.error("Error on authentication");
  }

  if (transcriptToken !== undefined) {

      var params = {
          access_token: transcriptToken,
          objectMode: true, // send objects instead of text
          extractResults: true, // convert {results: [{alternatives:[...]}], result_index: 0} to {alternatives: [...], index: 0}
          format: false, // optional - performs basic formatting on the results such as capitals an periods
          timestamps: true,
          mediaStream: window.currentStream,
          // speaker_labels: true,
          resultsBySpeaker: true,
      };             

      try {
          return recognizeMicrophone(params);
      }
      catch (error) {
          console.error("Error on geting the microphone stream");
          throw new AlertException(DANGER_ALERT, NOT_ABLE_TRANSCRIPT);
      }
  }
}