# fenster
A repository to test Android vibration and Voicing in a PhET sim.

This repo uses Cordova to test haptics and Voicing from a PhET simulation on numerous platforms. For now we are most interested in Android tablet based vibration, so we are using Cordova to access native android vibration.
Android WebViews do not support SpeechSynthesis, so we need to find a solution that will allow speech from the native Android app using Cordova.

"Fenster" is the german word for window, which is fitting because this app will act as a wrapper with iframes, WebViews, and DOM windows. Messages will be sent from within frames to the Cordova app to request speech and vibration on the native platform.

fenster uses the same Cordova build environment as quake, see https://github.com/phetsims/quake#setting-up-the-build-environment for information about setting up the environment.
