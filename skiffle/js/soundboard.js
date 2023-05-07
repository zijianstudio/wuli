// Copyright 2021, University of Colorado Boulder

/**
 * JavaScript for the soundboard HTML file.
 */

// create a Web Audio context
let audioContext = null;
if ( window.AudioContext ) {
  audioContext = new window.AudioContext();
}
else if ( window.webkitAudioContext ) {
  audioContext = new window.webkitAudioContext();
}
else {

  // The browser doesn't support creating an audio context, create an empty object.  Failures will occur the first time
  // any code tries to do anything with the audio context.
  audioContext = {};
  console.error( 'error: this browser does not support Web Audio' );
}

// {Map.<string,AudioBuffer>} - map of file paths to decoded audio buffers, used to cache decoded audio data
const filePathToDecodedAudioBufferMap = new Map();

// {Map.<AudioBuffer,AudioBufferSourceNode>} - map of audio buffers to buffer source nodes, used to stop longer sounds
const audioBufferToBufferSourceNodeMap = new Map();

// function to play a previously decoded audio buffer, or stop playback that is already in progress
const playAudioBuffer = audioBuffer => {

  // Check to see if there is an entry in the audio-buffer-to-buffer-source map.  If there is, it means this sound is
  // currently playing and should be stopped.  This essentially allows users to toggle longer sounds, such as those that
  // used as loops.
  if ( audioBufferToBufferSourceNodeMap.has( audioBuffer ) ) {

    // Stop the sound.  The onended handler should remove it from the map.
    audioBufferToBufferSourceNodeMap.get( audioBuffer ).stop();
  }
  else {

    // This sound isn't currently playing, so create an audio buffer source node and start it up.
    const bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.connect( audioContext.destination );
    audioBufferToBufferSourceNodeMap.set( audioBuffer, bufferSource );
    bufferSource.onended = () => {
      audioBufferToBufferSourceNodeMap.delete( audioBuffer );
      bufferSource.onended = null;
    };
    bufferSource.start();
  }
};

// function to play a sound file, will used cached data if possible or will initiate decode if not
const playSound = soundUrl => { // eslint-disable-line no-unused-vars
  const audioBuffer = filePathToDecodedAudioBufferMap.get( soundUrl );
  if ( audioBuffer ) {

    // This file has already been decoded, so just play it.
    playAudioBuffer( audioBuffer );
  }
  else {

    // This is the first time this file has been played, so it needs to be decoded and then played.
    window.fetch( soundUrl )
      .then( response => response.arrayBuffer() )
      .then( arrayBuffer => audioContext.decodeAudioData( arrayBuffer ) )
      .then( audioBuffer => {
        filePathToDecodedAudioBufferMap.set( soundUrl, audioBuffer );
        playAudioBuffer( audioBuffer );
      } )
      .catch( error => {
        console.log( `unable to play file ${soundUrl}, error = ${error}` );
      } );
  }
};