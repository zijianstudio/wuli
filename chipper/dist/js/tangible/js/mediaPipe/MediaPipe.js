// Copyright 2022-2023, University of Colorado Boulder

/**
 * Adds the boilerplate needed for MediaPipe "hands" implementation to run in PhET Sims. See https://github.com/phetsims/ratio-and-proportion/issues/431
 * See https://google.github.io/mediapipe/solutions/hands.html
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
import tangible from '../tangible.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import ArrayIO from '../../../tandem/js/types/ArrayIO.js';
import OopsDialog from '../../../scenery-phet/js/OopsDialog.js';
import ObjectLiteralIO from '../../../tandem/js/types/ObjectLiteralIO.js';
import IOType from '../../../tandem/js/types/IOType.js';
import Property from '../../../axon/js/Property.js';
import MediaPipeQueryParameters from './MediaPipeQueryParameters.js';
import draggableResizableHTMLElement from './draggableResizableHTMLElement.js';
import Tandem from '../../../tandem/js/Tandem.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import stepTimer from '../../../axon/js/stepTimer.js';
import { HBox, Node, RichText, Text, VBox, VoicingRichText, VoicingText } from '../../../scenery/js/imports.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import animationFrameTimer from '../../../axon/js/animationFrameTimer.js';
import ComboBox from '../../../sun/js/ComboBox.js';
import TangibleStrings from '../TangibleStrings.js';
import PreferencesDialog from '../../../joist/js/preferences/PreferencesDialog.js';
import JoistStrings from '../../../joist/js/JoistStrings.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import StringProperty from '../../../axon/js/StringProperty.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
if (MediaPipeQueryParameters.showVideo) {
  assert && assert(MediaPipeQueryParameters.cameraInput === 'hands', '?showVideo is expected to accompany ?cameraInput=hands and its features');
}

// Allow accessing these off window. See https://stackoverflow.com/questions/12709074/how-do-you-explicitly-set-a-new-property-on-window-in-typescript

const CAMERA_IMAGE_RESOLUTION_FACTOR = MediaPipeQueryParameters.cameraImageResolutionFactor;
let initialized = false;

// 21 points, in order, corresponding to hand landmark positions, see https://google.github.io/mediapipe/solutions/hands.html#hand-landmark-model

const MediaPipeResultsIO = new IOType('MediaPipeResultsIO', {
  isValidValue: () => true,
  toStateObject: mediaPipeResults => {
    return {
      multiHandLandmarks: mediaPipeResults.multiHandLandmarks,
      multiHandedness: mediaPipeResults.multiHandedness
    };
  },
  stateSchema: {
    multiHandLandmarks: ArrayIO(ArrayIO(ObjectLiteralIO)),
    multiHandedness: ArrayIO(ObjectLiteralIO)
  }
});

// Failure to send camera input to hands indicates that the Hands library was unable to load correctly (most likely
// due to a lack of internet connection). Keep track of this so that we don't resend failures on every frame.
let failedOnFrame = false;

// Keep our own track of if we have started playing the video (which is the metric that matters for sending data to the
// hands model).
let videoPlaying = false;
class MediaPipe {
  // device id from the browser often will be and empty string (`''`), so make sure the default value is a unique string
  // so that the initial Property notifications happen.
  static selectedDeviceProperty = new StringProperty('DEFAULT_VALUE');
  static availableDevices = [];

  // Flip across the x axis, flipping y values
  static xAxisFlippedProperty = new BooleanProperty(false);

  // Flip across the y axis, flipping x values
  static yAxisFlippedProperty = new BooleanProperty(false);
  static videoStreamDimension2 = new Dimension2(1280, 720);

  // the most recent results from MediaPipe
  static resultsProperty = new Property(null, {
    phetioValueType: NullableIO(MediaPipeResultsIO),
    tandem: Tandem.GLOBAL_VIEW.createTandem('mediaPipe').createTandem('resultsProperty'),
    phetioDocumentation: 'A Property that holds the raw data coming from MediaPipe. Set to null if there are no hands detected.'
  });

  /**
   * Initialize mediaPipe by loading all needed scripts, and initializing hand tracking.
   * Store results of tracking to MediaPipe.results.
   */
  static initialize(providedOptions) {
    assert && assert(!initialized);
    assert && assert(document.body, 'a document body is needed to attache imported scripts');
    initialized = true;
    const options = optionize()({
      fromLocalDependency: false,
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.2,
      minTrackingConfidence: 0.2
    }, providedOptions);
    (async () => {
      // eslint-disable-line @typescript-eslint/no-floating-promises

      // Populate the available video devices that MediaPipe can use, then select one to initiate the MediaPipe stream
      if (navigator.mediaDevices) {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        for (let i = 0; i < mediaDevices.length; i++) {
          const mediaDevice = mediaDevices[i];
          if (mediaDevice.kind === 'videoinput') {
            MediaPipe.availableDevices.push(mediaDevice);
          }
        }
      }
      if (MediaPipe.availableDevices.length > 0) {
        MediaPipe.selectedDeviceProperty.value = MediaPipe.availableDevices[0].deviceId;
      }
    })();
    const videoElement = document.createElement('video');
    document.body.appendChild(videoElement);
    let canvasElement = null;
    let canvasContext = null;
    if (MediaPipeQueryParameters.showVideo) {
      canvasElement = document.createElement('canvas');
      canvasElement.style.width = '100%';
      canvasElement.style.height = '100%';
      canvasContext = canvasElement.getContext('2d');
      const element = draggableResizableHTMLElement(canvasElement);
      document.body.appendChild(element);
    }
    assert && options.fromLocalDependency && assert(window.mediaPipeDependencies, 'mediaPipeDependencies expected to load mediaPipe');
    const hands = new window.Hands({
      locateFile: file => {
        if (options.fromLocalDependency) {
          assert && assert(window.mediaPipeDependencies.hasOwnProperty(file), `file not in mediaPipeDependencies: ${file}`);
          return window.mediaPipeDependencies[file];
        } else {
          // use a cdn
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`;
        }
      }
    });
    hands.setOptions(options);
    hands.onResults(results => {
      MediaPipe.resultsProperty.value = results.multiHandLandmarks.length > 0 ? results : null;

      // Update the image if displaying the canvas video over the phetsim.
      if (MediaPipeQueryParameters.showVideo) {
        MediaPipe.drawToCanvas(canvasElement, canvasContext, results.image);
      }
    });

    // @ts-expect-error - nonstandard global on window.navigator
    if (window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia) {
      // Don't send the same video time twice
      let currentTime = -1;

      // Don't send while already sending data to hands
      let handsSending = false;
      let animationFrameCounter = 0;
      animationFrameTimer.addListener(async () => {
        animationFrameCounter = ++animationFrameCounter % 100000000;
        if (animationFrameCounter % MediaPipeQueryParameters.cameraFrameResolution !== 0) {
          return;
        }

        // We need to be careful here. Hands does not want to be sent "bad" data. This includes:
        // * Currently waiting for hands.send to resolve
        // * There isn't a videoElement that is playing
        // * There isn't a videoElement with a stream attached to it (thus no image data)
        // * Duplicating the "send" call on the same frame would be redundant
        if (!handsSending && videoPlaying && videoElement.srcObject && videoElement.currentTime !== currentTime && !failedOnFrame) {
          currentTime = videoElement.currentTime;
          videoElement.width = videoElement.videoWidth * CAMERA_IMAGE_RESOLUTION_FACTOR;
          videoElement.height = videoElement.videoHeight * CAMERA_IMAGE_RESOLUTION_FACTOR;
          try {
            handsSending = true;
            await hands.send({
              image: videoElement
            });
            handsSending = false;
          } catch (e) {
            console.error('Internet trouble:', e);
            MediaPipe.showOopsDialog(TangibleStrings.cameraInputRequiresInternetStringProperty);
            failedOnFrame = true;
          }
        }
      });
      MediaPipe.selectedDeviceProperty.lazyLink(deviceID => {
        if (videoElement.srcObject) {
          MediaPipe.stopStream(videoElement);
        }
        MediaPipe.startStream(videoElement, deviceID);
      });
    } else {
      console.error('no navigator.mediaDevices detected');
      MediaPipe.showOopsDialog(TangibleStrings.noMediaDevicesStringProperty);
    }
  }
  static stopStream(videoElement) {
    if (videoElement.srcObject instanceof MediaStream) {
      const tracks = videoElement.srcObject.getTracks();
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].stop();
      }
    }
    videoElement.srcObject = null;
    videoPlaying = false;
  }
  static startStream(videoElement, deviceID) {
    const constraints = {
      video: {
        facingMode: 'user',
        width: MediaPipe.videoStreamDimension2.width,
        height: MediaPipe.videoStreamDimension2.height,
        deviceId: deviceID && deviceID !== '' ? {
          exact: deviceID
        } : undefined
      }
    };

    // Load the current desired device

    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      videoElement.srcObject = stream;
      videoElement.onloadedmetadata = async () => {
        await videoElement.play();

        // Keep our own data here, because I couldn't find this data on the videoElement itself.
        videoPlaying = true;
      };
    }).catch(e => {
      console.error(e);
      MediaPipe.showOopsDialog(TangibleStrings.noMediaDeviceStringProperty);
    });
  }

  // Display a dialog indicating that the MediaPipe feature is not going to work because it requires internet access.
  static showOopsDialog(message) {
    // Waiting for next step ensures we will have a sim to append to the Dialog to.
    stepTimer.runOnNextTick(() => {
      const offlineDialog = new OopsDialog(message, {
        closeButtonListener: () => {
          offlineDialog.hide();
          offlineDialog.dispose();
        },
        title: new Text(TangibleStrings.errorLoadingCameraInputHandsStringProperty, {
          font: new PhetFont(28)
        })
      });
      offlineDialog.show();
    });
  }

  /**
   * Update the canvas to the current image
   */
  static drawToCanvas(canvasElement, canvasContext, image) {
    assert && assert(canvasContext, 'must have a canvasContext');
    canvasContext.save();
    canvasContext.translate(canvasElement.width, 0);
    canvasContext.scale(-1, 1); // flip camera for viewing to the user.
    canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasContext.drawImage(image, 0, 0, canvasElement.width, canvasElement.height);
    canvasContext.restore();
  }
  static getMediaPipeOptionsNode() {
    const deviceComboBoxItems = MediaPipe.availableDevices.map((device, i) => {
      const label = device.label || `Camera ${i + 1}`;
      return {
        value: device.deviceId,
        createNode: tandem => new Text(label),
        a11yName: label
      };
    });

    // A content Node here allows us to have a list box parent for the ComboBox.
    const content = new Node();

    // If there aren't mediaDevices available, be graceful
    const deviceSelectorNode = MediaPipe.availableDevices.length > 0 ? new ComboBox(MediaPipe.selectedDeviceProperty, deviceComboBoxItems, content, {
      accessibleName: TangibleStrings.inputDeviceStringProperty,
      tandem: Tandem.OPT_OUT
    }) : new Node();
    const vbox = new VBox({
      spacing: 10,
      align: 'left',
      children: [new Text(TangibleStrings.cameraInputHandsStringProperty, combineOptions({
        tagName: 'h3',
        accessibleName: TangibleStrings.cameraInputHandsStringProperty
      }, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS)), new VoicingText(TangibleStrings.cameraInputHandsHelpTextStringProperty, combineOptions({
        readingBlockNameResponse: StringUtils.fillIn(JoistStrings.a11y.preferences.tabs.labelledDescriptionPatternStringProperty, {
          label: TangibleStrings.cameraInputHandsStringProperty,
          description: TangibleStrings.cameraInputHandsHelpTextStringProperty
        })
      }, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS)), new HBox({
        spacing: 10,
        children: [new Text(TangibleStrings.inputDeviceStringProperty, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS), deviceSelectorNode]
      }), new VBox({
        spacing: 5,
        align: 'left',
        layoutOptions: {
          topMargin: 10
        },
        children: [new VoicingText(TangibleStrings.troubleshootingCameraInputHandsStringProperty, combineOptions({
          tagName: 'h3',
          accessibleName: TangibleStrings.troubleshootingCameraInputHandsStringProperty
        }, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS)), new VoicingRichText(TangibleStrings.troubleshootingParagraphStringProperty, combineOptions({
          lineWrap: PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS.maxWidth
        }, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS)), new VoicingText(TangibleStrings.cameraInputFlipYHeadingStringProperty, combineOptions({
          layoutOptions: {
            topMargin: 15
          }
        }, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS)), new Checkbox(MediaPipe.yAxisFlippedProperty, new RichText(TangibleStrings.cameraInputFlipYStringProperty, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS), {
          voicingNameResponse: TangibleStrings.cameraInputFlipYStringProperty,
          voiceNameResponseOnSelection: false,
          accessibleName: TangibleStrings.cameraInputFlipYStringProperty,
          checkedContextResponse: TangibleStrings.a11y.cameraInputFlipYCheckedStringProperty,
          uncheckedContextResponse: TangibleStrings.a11y.cameraInputFlipYUncheckedStringProperty,
          tandem: Tandem.OPT_OUT
        }), new VoicingText(TangibleStrings.cameraInputFlipXHeadingStringProperty, combineOptions({
          layoutOptions: {
            topMargin: 10
          }
        }, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS)), new Checkbox(MediaPipe.xAxisFlippedProperty, new RichText(TangibleStrings.cameraInputFlipXStringProperty, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS), {
          voicingNameResponse: TangibleStrings.cameraInputFlipXStringProperty,
          voiceNameResponseOnSelection: false,
          accessibleName: TangibleStrings.cameraInputFlipXStringProperty,
          checkedContextResponse: TangibleStrings.a11y.cameraInputFlipXCheckedStringProperty,
          uncheckedContextResponse: TangibleStrings.a11y.cameraInputFlipXUncheckedStringProperty,
          tandem: Tandem.OPT_OUT
        })]
      })]
    });
    content.addChild(vbox);
    return content;
  }
}
tangible.register('MediaPipe', MediaPipe);
export default MediaPipe;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0YW5naWJsZSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiQXJyYXlJTyIsIk9vcHNEaWFsb2ciLCJPYmplY3RMaXRlcmFsSU8iLCJJT1R5cGUiLCJQcm9wZXJ0eSIsIk1lZGlhUGlwZVF1ZXJ5UGFyYW1ldGVycyIsImRyYWdnYWJsZVJlc2l6YWJsZUhUTUxFbGVtZW50IiwiVGFuZGVtIiwiTnVsbGFibGVJTyIsInN0ZXBUaW1lciIsIkhCb3giLCJOb2RlIiwiUmljaFRleHQiLCJUZXh0IiwiVkJveCIsIlZvaWNpbmdSaWNoVGV4dCIsIlZvaWNpbmdUZXh0IiwiUGhldEZvbnQiLCJhbmltYXRpb25GcmFtZVRpbWVyIiwiQ29tYm9Cb3giLCJUYW5naWJsZVN0cmluZ3MiLCJQcmVmZXJlbmNlc0RpYWxvZyIsIkpvaXN0U3RyaW5ncyIsIlN0cmluZ1V0aWxzIiwiU3RyaW5nUHJvcGVydHkiLCJCb29sZWFuUHJvcGVydHkiLCJDaGVja2JveCIsIkRpbWVuc2lvbjIiLCJzaG93VmlkZW8iLCJhc3NlcnQiLCJjYW1lcmFJbnB1dCIsIkNBTUVSQV9JTUFHRV9SRVNPTFVUSU9OX0ZBQ1RPUiIsImNhbWVyYUltYWdlUmVzb2x1dGlvbkZhY3RvciIsImluaXRpYWxpemVkIiwiTWVkaWFQaXBlUmVzdWx0c0lPIiwiaXNWYWxpZFZhbHVlIiwidG9TdGF0ZU9iamVjdCIsIm1lZGlhUGlwZVJlc3VsdHMiLCJtdWx0aUhhbmRMYW5kbWFya3MiLCJtdWx0aUhhbmRlZG5lc3MiLCJzdGF0ZVNjaGVtYSIsImZhaWxlZE9uRnJhbWUiLCJ2aWRlb1BsYXlpbmciLCJNZWRpYVBpcGUiLCJzZWxlY3RlZERldmljZVByb3BlcnR5IiwiYXZhaWxhYmxlRGV2aWNlcyIsInhBeGlzRmxpcHBlZFByb3BlcnR5IiwieUF4aXNGbGlwcGVkUHJvcGVydHkiLCJ2aWRlb1N0cmVhbURpbWVuc2lvbjIiLCJyZXN1bHRzUHJvcGVydHkiLCJwaGV0aW9WYWx1ZVR5cGUiLCJ0YW5kZW0iLCJHTE9CQUxfVklFVyIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJpbml0aWFsaXplIiwicHJvdmlkZWRPcHRpb25zIiwiZG9jdW1lbnQiLCJib2R5Iiwib3B0aW9ucyIsImZyb21Mb2NhbERlcGVuZGVuY3kiLCJtYXhOdW1IYW5kcyIsIm1vZGVsQ29tcGxleGl0eSIsIm1pbkRldGVjdGlvbkNvbmZpZGVuY2UiLCJtaW5UcmFja2luZ0NvbmZpZGVuY2UiLCJuYXZpZ2F0b3IiLCJtZWRpYURldmljZXMiLCJlbnVtZXJhdGVEZXZpY2VzIiwiaSIsImxlbmd0aCIsIm1lZGlhRGV2aWNlIiwia2luZCIsInB1c2giLCJ2YWx1ZSIsImRldmljZUlkIiwidmlkZW9FbGVtZW50IiwiY3JlYXRlRWxlbWVudCIsImFwcGVuZENoaWxkIiwiY2FudmFzRWxlbWVudCIsImNhbnZhc0NvbnRleHQiLCJzdHlsZSIsIndpZHRoIiwiaGVpZ2h0IiwiZ2V0Q29udGV4dCIsImVsZW1lbnQiLCJ3aW5kb3ciLCJtZWRpYVBpcGVEZXBlbmRlbmNpZXMiLCJoYW5kcyIsIkhhbmRzIiwibG9jYXRlRmlsZSIsImZpbGUiLCJoYXNPd25Qcm9wZXJ0eSIsInNldE9wdGlvbnMiLCJvblJlc3VsdHMiLCJyZXN1bHRzIiwiZHJhd1RvQ2FudmFzIiwiaW1hZ2UiLCJnZXRVc2VyTWVkaWEiLCJjdXJyZW50VGltZSIsImhhbmRzU2VuZGluZyIsImFuaW1hdGlvbkZyYW1lQ291bnRlciIsImFkZExpc3RlbmVyIiwiY2FtZXJhRnJhbWVSZXNvbHV0aW9uIiwic3JjT2JqZWN0IiwidmlkZW9XaWR0aCIsInZpZGVvSGVpZ2h0Iiwic2VuZCIsImUiLCJjb25zb2xlIiwiZXJyb3IiLCJzaG93T29wc0RpYWxvZyIsImNhbWVyYUlucHV0UmVxdWlyZXNJbnRlcm5ldFN0cmluZ1Byb3BlcnR5IiwibGF6eUxpbmsiLCJkZXZpY2VJRCIsInN0b3BTdHJlYW0iLCJzdGFydFN0cmVhbSIsIm5vTWVkaWFEZXZpY2VzU3RyaW5nUHJvcGVydHkiLCJNZWRpYVN0cmVhbSIsInRyYWNrcyIsImdldFRyYWNrcyIsInN0b3AiLCJjb25zdHJhaW50cyIsInZpZGVvIiwiZmFjaW5nTW9kZSIsImV4YWN0IiwidW5kZWZpbmVkIiwidGhlbiIsInN0cmVhbSIsIm9ubG9hZGVkbWV0YWRhdGEiLCJwbGF5IiwiY2F0Y2giLCJub01lZGlhRGV2aWNlU3RyaW5nUHJvcGVydHkiLCJtZXNzYWdlIiwicnVuT25OZXh0VGljayIsIm9mZmxpbmVEaWFsb2ciLCJjbG9zZUJ1dHRvbkxpc3RlbmVyIiwiaGlkZSIsImRpc3Bvc2UiLCJ0aXRsZSIsImVycm9yTG9hZGluZ0NhbWVyYUlucHV0SGFuZHNTdHJpbmdQcm9wZXJ0eSIsImZvbnQiLCJzaG93Iiwic2F2ZSIsInRyYW5zbGF0ZSIsInNjYWxlIiwiY2xlYXJSZWN0IiwiZHJhd0ltYWdlIiwicmVzdG9yZSIsImdldE1lZGlhUGlwZU9wdGlvbnNOb2RlIiwiZGV2aWNlQ29tYm9Cb3hJdGVtcyIsIm1hcCIsImRldmljZSIsImxhYmVsIiwiY3JlYXRlTm9kZSIsImExMXlOYW1lIiwiY29udGVudCIsImRldmljZVNlbGVjdG9yTm9kZSIsImFjY2Vzc2libGVOYW1lIiwiaW5wdXREZXZpY2VTdHJpbmdQcm9wZXJ0eSIsIk9QVF9PVVQiLCJ2Ym94Iiwic3BhY2luZyIsImFsaWduIiwiY2hpbGRyZW4iLCJjYW1lcmFJbnB1dEhhbmRzU3RyaW5nUHJvcGVydHkiLCJ0YWdOYW1lIiwiUEFORUxfU0VDVElPTl9MQUJFTF9PUFRJT05TIiwiY2FtZXJhSW5wdXRIYW5kc0hlbHBUZXh0U3RyaW5nUHJvcGVydHkiLCJyZWFkaW5nQmxvY2tOYW1lUmVzcG9uc2UiLCJmaWxsSW4iLCJhMTF5IiwicHJlZmVyZW5jZXMiLCJ0YWJzIiwibGFiZWxsZWREZXNjcmlwdGlvblBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsImRlc2NyaXB0aW9uIiwiUEFORUxfU0VDVElPTl9DT05URU5UX09QVElPTlMiLCJsYXlvdXRPcHRpb25zIiwidG9wTWFyZ2luIiwidHJvdWJsZXNob290aW5nQ2FtZXJhSW5wdXRIYW5kc1N0cmluZ1Byb3BlcnR5IiwidHJvdWJsZXNob290aW5nUGFyYWdyYXBoU3RyaW5nUHJvcGVydHkiLCJsaW5lV3JhcCIsIm1heFdpZHRoIiwiY2FtZXJhSW5wdXRGbGlwWUhlYWRpbmdTdHJpbmdQcm9wZXJ0eSIsImNhbWVyYUlucHV0RmxpcFlTdHJpbmdQcm9wZXJ0eSIsInZvaWNpbmdOYW1lUmVzcG9uc2UiLCJ2b2ljZU5hbWVSZXNwb25zZU9uU2VsZWN0aW9uIiwiY2hlY2tlZENvbnRleHRSZXNwb25zZSIsImNhbWVyYUlucHV0RmxpcFlDaGVja2VkU3RyaW5nUHJvcGVydHkiLCJ1bmNoZWNrZWRDb250ZXh0UmVzcG9uc2UiLCJjYW1lcmFJbnB1dEZsaXBZVW5jaGVja2VkU3RyaW5nUHJvcGVydHkiLCJjYW1lcmFJbnB1dEZsaXBYSGVhZGluZ1N0cmluZ1Byb3BlcnR5IiwiY2FtZXJhSW5wdXRGbGlwWFN0cmluZ1Byb3BlcnR5IiwiY2FtZXJhSW5wdXRGbGlwWENoZWNrZWRTdHJpbmdQcm9wZXJ0eSIsImNhbWVyYUlucHV0RmxpcFhVbmNoZWNrZWRTdHJpbmdQcm9wZXJ0eSIsImFkZENoaWxkIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNZWRpYVBpcGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQWRkcyB0aGUgYm9pbGVycGxhdGUgbmVlZGVkIGZvciBNZWRpYVBpcGUgXCJoYW5kc1wiIGltcGxlbWVudGF0aW9uIHRvIHJ1biBpbiBQaEVUIFNpbXMuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcmF0aW8tYW5kLXByb3BvcnRpb24vaXNzdWVzLzQzMVxyXG4gKiBTZWUgaHR0cHM6Ly9nb29nbGUuZ2l0aHViLmlvL21lZGlhcGlwZS9zb2x1dGlvbnMvaGFuZHMuaHRtbFxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5pbXBvcnQgdGFuZ2libGUgZnJvbSAnLi4vdGFuZ2libGUuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xyXG5pbXBvcnQgQXJyYXlJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvQXJyYXlJTy5qcyc7XHJcbmltcG9ydCBPb3BzRGlhbG9nIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9Pb3BzRGlhbG9nLmpzJztcclxuaW1wb3J0IE9iamVjdExpdGVyYWxJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvT2JqZWN0TGl0ZXJhbElPLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTWVkaWFQaXBlUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4vTWVkaWFQaXBlUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IGRyYWdnYWJsZVJlc2l6YWJsZUhUTUxFbGVtZW50IGZyb20gJy4vZHJhZ2dhYmxlUmVzaXphYmxlSFRNTEVsZW1lbnQuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgTnVsbGFibGVJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVsbGFibGVJTy5qcyc7XHJcbmltcG9ydCBzdGVwVGltZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9zdGVwVGltZXIuanMnO1xyXG5pbXBvcnQgeyBIQm94LCBOb2RlLCBSaWNoVGV4dCwgVGV4dCwgVGV4dE9wdGlvbnMsIFZCb3gsIFZvaWNpbmdSaWNoVGV4dCwgVm9pY2luZ1JpY2hUZXh0T3B0aW9ucywgVm9pY2luZ1RleHQsIFZvaWNpbmdUZXh0T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgYW5pbWF0aW9uRnJhbWVUaW1lciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL2FuaW1hdGlvbkZyYW1lVGltZXIuanMnO1xyXG5pbXBvcnQgQ29tYm9Cb3ggZnJvbSAnLi4vLi4vLi4vc3VuL2pzL0NvbWJvQm94LmpzJztcclxuaW1wb3J0IFRhbmdpYmxlU3RyaW5ncyBmcm9tICcuLi9UYW5naWJsZVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgUHJlZmVyZW5jZXNEaWFsb2cgZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvcHJlZmVyZW5jZXMvUHJlZmVyZW5jZXNEaWFsb2cuanMnO1xyXG5pbXBvcnQgSm9pc3RTdHJpbmdzIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL0pvaXN0U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1N0cmluZ1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBDaGVja2JveCBmcm9tICcuLi8uLi8uLi9zdW4vanMvQ2hlY2tib3guanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcblxyXG5pZiAoIE1lZGlhUGlwZVF1ZXJ5UGFyYW1ldGVycy5zaG93VmlkZW8gKSB7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggTWVkaWFQaXBlUXVlcnlQYXJhbWV0ZXJzLmNhbWVyYUlucHV0ID09PSAnaGFuZHMnLCAnP3Nob3dWaWRlbyBpcyBleHBlY3RlZCB0byBhY2NvbXBhbnkgP2NhbWVyYUlucHV0PWhhbmRzIGFuZCBpdHMgZmVhdHVyZXMnICk7XHJcbn1cclxuXHJcbnR5cGUgSGFuZHNUeXBlID0ge1xyXG4gIHNldE9wdGlvbnMoIG9wdGlvbnM6IE1lZGlhUGlwZUluaXRpYWxpemVPcHRpb25zICk6IHZvaWQ7XHJcbiAgb25SZXN1bHRzKCBjYWxsYmFjazogKCByZXN1bHRzOiBNZWRpYVBpcGVSZXN1bHRzICkgPT4gdm9pZCApOiB2b2lkO1xyXG4gIHNlbmQoIG9iamVjdDogeyBpbWFnZTogSFRNTFZpZGVvRWxlbWVudCB9ICk6IFByb21pc2U8dm9pZD47XHJcbn07XHJcblxyXG4vLyBBbGxvdyBhY2Nlc3NpbmcgdGhlc2Ugb2ZmIHdpbmRvdy4gU2VlIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEyNzA5MDc0L2hvdy1kby15b3UtZXhwbGljaXRseS1zZXQtYS1uZXctcHJvcGVydHktb24td2luZG93LWluLXR5cGVzY3JpcHRcclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gIGludGVyZmFjZSBXaW5kb3cgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9jb25zaXN0ZW50LXR5cGUtZGVmaW5pdGlvbnNcclxuICAgIG1lZGlhUGlwZURlcGVuZGVuY2llczogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcclxuICAgIEhhbmRzOiB7IG5ldyggb3B0aW9uczogSW50ZW50aW9uYWxBbnkgKTogSGFuZHNUeXBlIH07XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBDQU1FUkFfSU1BR0VfUkVTT0xVVElPTl9GQUNUT1IgPSBNZWRpYVBpcGVRdWVyeVBhcmFtZXRlcnMuY2FtZXJhSW1hZ2VSZXNvbHV0aW9uRmFjdG9yO1xyXG5cclxuZXhwb3J0IHR5cGUgSGFuZFBvaW50ID0ge1xyXG4gIHg6IG51bWJlcjtcclxuICB5OiBudW1iZXI7XHJcbiAgejogbnVtYmVyO1xyXG4gIHZpc2liaWxpdHk/OiBib29sZWFuO1xyXG59O1xyXG5cclxubGV0IGluaXRpYWxpemVkID0gZmFsc2U7XHJcblxyXG50eXBlIE1lZGlhUGlwZUluaXRpYWxpemVPcHRpb25zID0ge1xyXG5cclxuICAvLyBkZWZhdWx0IHRvIGZhbHNlLCB3aGVyZSB3ZSBkb3dubG9hZCBtZWRpYVBpcGUgZGVwZW5kZW5jaWVzIGZyb20gb25saW5lLiBJZiB0cnVlLCB1c2UgbG9jYWwgZGVwZW5kZW5jaWVzIHRvIGxvYWQgdGhlIGxpYnJhcnkuXHJcbiAgZnJvbUxvY2FsRGVwZW5kZW5jeT86IGJvb2xlYW47XHJcblxyXG4gIC8vIE1heGltdW0gbnVtYmVyIG9mIGhhbmRzIHRvIGRldGVjdC4gRGVmYXVsdCB0byAyLiBTZWUgaHR0cHM6Ly9nb29nbGUuZ2l0aHViLmlvL21lZGlhcGlwZS9zb2x1dGlvbnMvaGFuZHMjbWF4X251bV9oYW5kc1xyXG4gIG1heE51bUhhbmRzPzogbnVtYmVyO1xyXG5cclxuICAvLyBDb21wbGV4aXR5IG9mIHRoZSBoYW5kIGxhbmRtYXJrIG1vZGVsOiAwIG9yIDEuIExhbmRtYXJrIGFjY3VyYWN5IGFzIHdlbGwgYXMgaW5mZXJlbmNlIGxhdGVuY3kgZ2VuZXJhbGx5IGdvIHVwIHdpdGhcclxuICAvLyB0aGUgbW9kZWwgY29tcGxleGl0eS4gRGVmYXVsdCB0byAxLiBTZWUgaHR0cHM6Ly9nb29nbGUuZ2l0aHViLmlvL21lZGlhcGlwZS9zb2x1dGlvbnMvaGFuZHMjbW9kZWxfY29tcGxleGl0eVxyXG4gIG1vZGVsQ29tcGxleGl0eT86IG51bWJlcjtcclxuXHJcbiAgLy8gTWluaW11bSBjb25maWRlbmNlIHZhbHVlIChbMC4wLCAxLjBdKSBmcm9tIHRoZSBoYW5kIGRldGVjdGlvbiBtb2RlbCBmb3IgdGhlIGRldGVjdGlvbiB0byBiZSBjb25zaWRlcmVkIHN1Y2Nlc3NmdWwuXHJcbiAgLy8gRGVmYXVsdCB0byAwLjUuIFNlZSBodHRwczovL2dvb2dsZS5naXRodWIuaW8vbWVkaWFwaXBlL3NvbHV0aW9ucy9oYW5kcyNtaW5fZGV0ZWN0aW9uX2NvbmZpZGVuY2VcclxuICBtaW5EZXRlY3Rpb25Db25maWRlbmNlPzogbnVtYmVyO1xyXG5cclxuICAvLyBNaW5pbXVtIGNvbmZpZGVuY2UgdmFsdWUgKFswLjAsIDEuMF0pIGZyb20gdGhlIGxhbmRtYXJrLXRyYWNraW5nIG1vZGVsIGZvciB0aGUgaGFuZCBsYW5kbWFya3MgdG8gYmUgY29uc2lkZXJlZFxyXG4gIC8vIHRyYWNrZWQgc3VjY2Vzc2Z1bGx5LCBvciBvdGhlcndpc2UgaGFuZCBkZXRlY3Rpb24gd2lsbCBiZSBpbnZva2VkIGF1dG9tYXRpY2FsbHkgb24gdGhlIG5leHQgaW5wdXQgaW1hZ2UuIFNldHRpbmdcclxuICAvLyBpdCB0byBhIGhpZ2hlciB2YWx1ZSBjYW4gaW5jcmVhc2Ugcm9idXN0bmVzcyBvZiB0aGUgc29sdXRpb24sIGF0IHRoZSBleHBlbnNlIG9mIGEgaGlnaGVyIGxhdGVuY3kuIElnbm9yZWQgaWZcclxuICAvLyBzdGF0aWNfaW1hZ2VfbW9kZSBpcyB0cnVlLCB3aGVyZSBoYW5kIGRldGVjdGlvbiBzaW1wbHkgcnVucyBvbiBldmVyeSBpbWFnZS4gRGVmYXVsdCB0byAwLjUuIGh0dHBzOi8vZ29vZ2xlLmdpdGh1Yi5pby9tZWRpYXBpcGUvc29sdXRpb25zL2hhbmRzI21pbl90cmFja2luZ19jb25maWRlbmNlXHJcbiAgbWluVHJhY2tpbmdDb25maWRlbmNlPzogbnVtYmVyO1xyXG59O1xyXG5cclxuLy8gMjEgcG9pbnRzLCBpbiBvcmRlciwgY29ycmVzcG9uZGluZyB0byBoYW5kIGxhbmRtYXJrIHBvc2l0aW9ucywgc2VlIGh0dHBzOi8vZ29vZ2xlLmdpdGh1Yi5pby9tZWRpYXBpcGUvc29sdXRpb25zL2hhbmRzLmh0bWwjaGFuZC1sYW5kbWFyay1tb2RlbFxyXG5leHBvcnQgdHlwZSBIYW5kTGFuZG1hcmtzID0gWyBIYW5kUG9pbnQsIEhhbmRQb2ludCwgSGFuZFBvaW50LCBIYW5kUG9pbnQsIEhhbmRQb2ludCwgSGFuZFBvaW50LCBIYW5kUG9pbnQsIEhhbmRQb2ludCwgSGFuZFBvaW50LCBIYW5kUG9pbnQsIEhhbmRQb2ludCwgSGFuZFBvaW50LCBIYW5kUG9pbnQsIEhhbmRQb2ludCwgSGFuZFBvaW50LCBIYW5kUG9pbnQsIEhhbmRQb2ludCwgSGFuZFBvaW50LCBIYW5kUG9pbnQsIEhhbmRQb2ludCwgSGFuZFBvaW50IF07XHJcblxyXG50eXBlIEhhbmRlZG5lc3NEYXRhID0ge1xyXG4gIGRpc3BsYXlOYW1lPzogc3RyaW5nO1xyXG4gIGluZGV4OiBudW1iZXI7XHJcbiAgbGFiZWw6IHN0cmluZztcclxuICBzY29yZTogbnVtYmVyO1xyXG59O1xyXG5leHBvcnQgdHlwZSBNZWRpYVBpcGVSZXN1bHRzID0ge1xyXG4gIGltYWdlOiBIVE1MQ2FudmFzRWxlbWVudDtcclxuXHJcbiAgLy8gT25lIGZvciBlYWNoIGhhbmQgZGV0ZWN0ZWRcclxuICBtdWx0aUhhbmRMYW5kbWFya3M6IEhhbmRMYW5kbWFya3NbXTtcclxuICBtdWx0aUhhbmRlZG5lc3M6IEhhbmRlZG5lc3NEYXRhW107XHJcbn07XHJcblxyXG5jb25zdCBNZWRpYVBpcGVSZXN1bHRzSU8gPSBuZXcgSU9UeXBlKCAnTWVkaWFQaXBlUmVzdWx0c0lPJywge1xyXG4gIGlzVmFsaWRWYWx1ZTogKCkgPT4gdHJ1ZSxcclxuICB0b1N0YXRlT2JqZWN0OiAoIG1lZGlhUGlwZVJlc3VsdHM6IE1lZGlhUGlwZVJlc3VsdHMgKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBtdWx0aUhhbmRMYW5kbWFya3M6IG1lZGlhUGlwZVJlc3VsdHMubXVsdGlIYW5kTGFuZG1hcmtzLFxyXG4gICAgICBtdWx0aUhhbmRlZG5lc3M6IG1lZGlhUGlwZVJlc3VsdHMubXVsdGlIYW5kZWRuZXNzXHJcbiAgICB9O1xyXG4gIH0sXHJcbiAgc3RhdGVTY2hlbWE6IHtcclxuICAgIG11bHRpSGFuZExhbmRtYXJrczogQXJyYXlJTyggQXJyYXlJTyggT2JqZWN0TGl0ZXJhbElPICkgKSxcclxuICAgIG11bHRpSGFuZGVkbmVzczogQXJyYXlJTyggT2JqZWN0TGl0ZXJhbElPIClcclxuICB9XHJcbn0gKTtcclxuXHJcbi8vIEZhaWx1cmUgdG8gc2VuZCBjYW1lcmEgaW5wdXQgdG8gaGFuZHMgaW5kaWNhdGVzIHRoYXQgdGhlIEhhbmRzIGxpYnJhcnkgd2FzIHVuYWJsZSB0byBsb2FkIGNvcnJlY3RseSAobW9zdCBsaWtlbHlcclxuLy8gZHVlIHRvIGEgbGFjayBvZiBpbnRlcm5ldCBjb25uZWN0aW9uKS4gS2VlcCB0cmFjayBvZiB0aGlzIHNvIHRoYXQgd2UgZG9uJ3QgcmVzZW5kIGZhaWx1cmVzIG9uIGV2ZXJ5IGZyYW1lLlxyXG5sZXQgZmFpbGVkT25GcmFtZSA9IGZhbHNlO1xyXG5cclxuLy8gS2VlcCBvdXIgb3duIHRyYWNrIG9mIGlmIHdlIGhhdmUgc3RhcnRlZCBwbGF5aW5nIHRoZSB2aWRlbyAod2hpY2ggaXMgdGhlIG1ldHJpYyB0aGF0IG1hdHRlcnMgZm9yIHNlbmRpbmcgZGF0YSB0byB0aGVcclxuLy8gaGFuZHMgbW9kZWwpLlxyXG5sZXQgdmlkZW9QbGF5aW5nID0gZmFsc2U7XHJcblxyXG5jbGFzcyBNZWRpYVBpcGUge1xyXG5cclxuICAvLyBkZXZpY2UgaWQgZnJvbSB0aGUgYnJvd3NlciBvZnRlbiB3aWxsIGJlIGFuZCBlbXB0eSBzdHJpbmcgKGAnJ2ApLCBzbyBtYWtlIHN1cmUgdGhlIGRlZmF1bHQgdmFsdWUgaXMgYSB1bmlxdWUgc3RyaW5nXHJcbiAgLy8gc28gdGhhdCB0aGUgaW5pdGlhbCBQcm9wZXJ0eSBub3RpZmljYXRpb25zIGhhcHBlbi5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IHNlbGVjdGVkRGV2aWNlUHJvcGVydHkgPSBuZXcgU3RyaW5nUHJvcGVydHkoICdERUZBVUxUX1ZBTFVFJyApO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgYXZhaWxhYmxlRGV2aWNlczogTWVkaWFEZXZpY2VJbmZvW10gPSBbXTtcclxuXHJcbiAgLy8gRmxpcCBhY3Jvc3MgdGhlIHggYXhpcywgZmxpcHBpbmcgeSB2YWx1ZXNcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IHhBeGlzRmxpcHBlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgLy8gRmxpcCBhY3Jvc3MgdGhlIHkgYXhpcywgZmxpcHBpbmcgeCB2YWx1ZXNcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IHlBeGlzRmxpcHBlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSB2aWRlb1N0cmVhbURpbWVuc2lvbjIgPSBuZXcgRGltZW5zaW9uMiggMTI4MCwgNzIwICk7XHJcblxyXG4gIC8vIHRoZSBtb3N0IHJlY2VudCByZXN1bHRzIGZyb20gTWVkaWFQaXBlXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSByZXN1bHRzUHJvcGVydHkgPSBuZXcgUHJvcGVydHk8TWVkaWFQaXBlUmVzdWx0cyB8IG51bGw+KCBudWxsLCB7XHJcbiAgICBwaGV0aW9WYWx1ZVR5cGU6IE51bGxhYmxlSU8oIE1lZGlhUGlwZVJlc3VsdHNJTyApLFxyXG4gICAgdGFuZGVtOiBUYW5kZW0uR0xPQkFMX1ZJRVcuY3JlYXRlVGFuZGVtKCAnbWVkaWFQaXBlJyApLmNyZWF0ZVRhbmRlbSggJ3Jlc3VsdHNQcm9wZXJ0eScgKSxcclxuICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdBIFByb3BlcnR5IHRoYXQgaG9sZHMgdGhlIHJhdyBkYXRhIGNvbWluZyBmcm9tIE1lZGlhUGlwZS4gU2V0IHRvIG51bGwgaWYgdGhlcmUgYXJlIG5vIGhhbmRzIGRldGVjdGVkLidcclxuICB9ICk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemUgbWVkaWFQaXBlIGJ5IGxvYWRpbmcgYWxsIG5lZWRlZCBzY3JpcHRzLCBhbmQgaW5pdGlhbGl6aW5nIGhhbmQgdHJhY2tpbmcuXHJcbiAgICogU3RvcmUgcmVzdWx0cyBvZiB0cmFja2luZyB0byBNZWRpYVBpcGUucmVzdWx0cy5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGluaXRpYWxpemUoIHByb3ZpZGVkT3B0aW9ucz86IE1lZGlhUGlwZUluaXRpYWxpemVPcHRpb25zICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIWluaXRpYWxpemVkICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkb2N1bWVudC5ib2R5LCAnYSBkb2N1bWVudCBib2R5IGlzIG5lZWRlZCB0byBhdHRhY2hlIGltcG9ydGVkIHNjcmlwdHMnICk7XHJcbiAgICBpbml0aWFsaXplZCA9IHRydWU7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxNZWRpYVBpcGVJbml0aWFsaXplT3B0aW9ucz4oKSgge1xyXG4gICAgICBmcm9tTG9jYWxEZXBlbmRlbmN5OiBmYWxzZSxcclxuICAgICAgbWF4TnVtSGFuZHM6IDIsXHJcbiAgICAgIG1vZGVsQ29tcGxleGl0eTogMSxcclxuICAgICAgbWluRGV0ZWN0aW9uQ29uZmlkZW5jZTogMC4yLFxyXG4gICAgICBtaW5UcmFja2luZ0NvbmZpZGVuY2U6IDAuMlxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgKCBhc3luYyAoKSA9PiB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWZsb2F0aW5nLXByb21pc2VzXHJcblxyXG4gICAgICAvLyBQb3B1bGF0ZSB0aGUgYXZhaWxhYmxlIHZpZGVvIGRldmljZXMgdGhhdCBNZWRpYVBpcGUgY2FuIHVzZSwgdGhlbiBzZWxlY3Qgb25lIHRvIGluaXRpYXRlIHRoZSBNZWRpYVBpcGUgc3RyZWFtXHJcbiAgICAgIGlmICggbmF2aWdhdG9yLm1lZGlhRGV2aWNlcyApIHtcclxuICAgICAgICBjb25zdCBtZWRpYURldmljZXMgPSBhd2FpdCBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMoKTtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBtZWRpYURldmljZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgICBjb25zdCBtZWRpYURldmljZSA9IG1lZGlhRGV2aWNlc1sgaSBdO1xyXG4gICAgICAgICAgaWYgKCBtZWRpYURldmljZS5raW5kID09PSAndmlkZW9pbnB1dCcgKSB7XHJcbiAgICAgICAgICAgIE1lZGlhUGlwZS5hdmFpbGFibGVEZXZpY2VzLnB1c2goIG1lZGlhRGV2aWNlICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmICggTWVkaWFQaXBlLmF2YWlsYWJsZURldmljZXMubGVuZ3RoID4gMCApIHtcclxuICAgICAgICBNZWRpYVBpcGUuc2VsZWN0ZWREZXZpY2VQcm9wZXJ0eS52YWx1ZSA9IE1lZGlhUGlwZS5hdmFpbGFibGVEZXZpY2VzWyAwIF0uZGV2aWNlSWQ7XHJcbiAgICAgIH1cclxuICAgIH0gKSgpO1xyXG5cclxuICAgIGNvbnN0IHZpZGVvRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICd2aWRlbycgKTtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHZpZGVvRWxlbWVudCApO1xyXG5cclxuICAgIGxldCBjYW52YXNFbGVtZW50OiBIVE1MQ2FudmFzRWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG4gICAgbGV0IGNhbnZhc0NvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIGlmICggTWVkaWFQaXBlUXVlcnlQYXJhbWV0ZXJzLnNob3dWaWRlbyApIHtcclxuICAgICAgY2FudmFzRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XHJcbiAgICAgIGNhbnZhc0VsZW1lbnQuc3R5bGUud2lkdGggPSAnMTAwJSc7XHJcbiAgICAgIGNhbnZhc0VsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xyXG4gICAgICBjYW52YXNDb250ZXh0ID0gY2FudmFzRWxlbWVudC5nZXRDb250ZXh0KCAnMmQnICk7XHJcblxyXG4gICAgICBjb25zdCBlbGVtZW50ID0gZHJhZ2dhYmxlUmVzaXphYmxlSFRNTEVsZW1lbnQoIGNhbnZhc0VsZW1lbnQgKTtcclxuXHJcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGVsZW1lbnQgKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3NlcnQgJiYgb3B0aW9ucy5mcm9tTG9jYWxEZXBlbmRlbmN5ICYmIGFzc2VydCggd2luZG93Lm1lZGlhUGlwZURlcGVuZGVuY2llcywgJ21lZGlhUGlwZURlcGVuZGVuY2llcyBleHBlY3RlZCB0byBsb2FkIG1lZGlhUGlwZScgKTtcclxuXHJcbiAgICBjb25zdCBoYW5kcyA9IG5ldyB3aW5kb3cuSGFuZHMoIHtcclxuICAgICAgbG9jYXRlRmlsZTogKCBmaWxlOiBzdHJpbmcgKSA9PiB7XHJcbiAgICAgICAgaWYgKCBvcHRpb25zLmZyb21Mb2NhbERlcGVuZGVuY3kgKSB7XHJcblxyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggd2luZG93Lm1lZGlhUGlwZURlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eSggZmlsZSApLCBgZmlsZSBub3QgaW4gbWVkaWFQaXBlRGVwZW5kZW5jaWVzOiAke2ZpbGV9YCApO1xyXG4gICAgICAgICAgcmV0dXJuIHdpbmRvdy5tZWRpYVBpcGVEZXBlbmRlbmNpZXNbIGZpbGUgXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gdXNlIGEgY2RuXHJcbiAgICAgICAgICByZXR1cm4gYGh0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9ucG0vQG1lZGlhcGlwZS9oYW5kc0AwLjQuMTY0NjQyNDkxNS8ke2ZpbGV9YDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIGhhbmRzLnNldE9wdGlvbnMoIG9wdGlvbnMgKTtcclxuICAgIGhhbmRzLm9uUmVzdWx0cyggKCByZXN1bHRzOiBNZWRpYVBpcGVSZXN1bHRzICkgPT4ge1xyXG4gICAgICBNZWRpYVBpcGUucmVzdWx0c1Byb3BlcnR5LnZhbHVlID0gcmVzdWx0cy5tdWx0aUhhbmRMYW5kbWFya3MubGVuZ3RoID4gMCA/IHJlc3VsdHMgOiBudWxsO1xyXG5cclxuICAgICAgLy8gVXBkYXRlIHRoZSBpbWFnZSBpZiBkaXNwbGF5aW5nIHRoZSBjYW52YXMgdmlkZW8gb3ZlciB0aGUgcGhldHNpbS5cclxuICAgICAgaWYgKCBNZWRpYVBpcGVRdWVyeVBhcmFtZXRlcnMuc2hvd1ZpZGVvICkge1xyXG4gICAgICAgIE1lZGlhUGlwZS5kcmF3VG9DYW52YXMoIGNhbnZhc0VsZW1lbnQhLCBjYW52YXNDb250ZXh0ISwgcmVzdWx0cy5pbWFnZSApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG5vbnN0YW5kYXJkIGdsb2JhbCBvbiB3aW5kb3cubmF2aWdhdG9yXHJcbiAgICBpZiAoIHdpbmRvdy5uYXZpZ2F0b3IubWVkaWFEZXZpY2VzICYmIHdpbmRvdy5uYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSApIHtcclxuXHJcbiAgICAgIC8vIERvbid0IHNlbmQgdGhlIHNhbWUgdmlkZW8gdGltZSB0d2ljZVxyXG4gICAgICBsZXQgY3VycmVudFRpbWUgPSAtMTtcclxuXHJcbiAgICAgIC8vIERvbid0IHNlbmQgd2hpbGUgYWxyZWFkeSBzZW5kaW5nIGRhdGEgdG8gaGFuZHNcclxuICAgICAgbGV0IGhhbmRzU2VuZGluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgbGV0IGFuaW1hdGlvbkZyYW1lQ291bnRlciA9IDA7XHJcblxyXG4gICAgICBhbmltYXRpb25GcmFtZVRpbWVyLmFkZExpc3RlbmVyKCBhc3luYyAoKSA9PiB7XHJcblxyXG4gICAgICAgIGFuaW1hdGlvbkZyYW1lQ291bnRlciA9ICsrYW5pbWF0aW9uRnJhbWVDb3VudGVyICUgMTAwMDAwMDAwO1xyXG5cclxuICAgICAgICBpZiAoIGFuaW1hdGlvbkZyYW1lQ291bnRlciAlIE1lZGlhUGlwZVF1ZXJ5UGFyYW1ldGVycy5jYW1lcmFGcmFtZVJlc29sdXRpb24gIT09IDAgKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBXZSBuZWVkIHRvIGJlIGNhcmVmdWwgaGVyZS4gSGFuZHMgZG9lcyBub3Qgd2FudCB0byBiZSBzZW50IFwiYmFkXCIgZGF0YS4gVGhpcyBpbmNsdWRlczpcclxuICAgICAgICAvLyAqIEN1cnJlbnRseSB3YWl0aW5nIGZvciBoYW5kcy5zZW5kIHRvIHJlc29sdmVcclxuICAgICAgICAvLyAqIFRoZXJlIGlzbid0IGEgdmlkZW9FbGVtZW50IHRoYXQgaXMgcGxheWluZ1xyXG4gICAgICAgIC8vICogVGhlcmUgaXNuJ3QgYSB2aWRlb0VsZW1lbnQgd2l0aCBhIHN0cmVhbSBhdHRhY2hlZCB0byBpdCAodGh1cyBubyBpbWFnZSBkYXRhKVxyXG4gICAgICAgIC8vICogRHVwbGljYXRpbmcgdGhlIFwic2VuZFwiIGNhbGwgb24gdGhlIHNhbWUgZnJhbWUgd291bGQgYmUgcmVkdW5kYW50XHJcbiAgICAgICAgaWYgKCAhaGFuZHNTZW5kaW5nICYmIHZpZGVvUGxheWluZyAmJiB2aWRlb0VsZW1lbnQuc3JjT2JqZWN0ICYmXHJcbiAgICAgICAgICAgICB2aWRlb0VsZW1lbnQuY3VycmVudFRpbWUgIT09IGN1cnJlbnRUaW1lICYmICFmYWlsZWRPbkZyYW1lICkge1xyXG4gICAgICAgICAgY3VycmVudFRpbWUgPSB2aWRlb0VsZW1lbnQuY3VycmVudFRpbWU7XHJcblxyXG4gICAgICAgICAgdmlkZW9FbGVtZW50LndpZHRoID0gdmlkZW9FbGVtZW50LnZpZGVvV2lkdGggKiBDQU1FUkFfSU1BR0VfUkVTT0xVVElPTl9GQUNUT1I7XHJcbiAgICAgICAgICB2aWRlb0VsZW1lbnQuaGVpZ2h0ID0gdmlkZW9FbGVtZW50LnZpZGVvSGVpZ2h0ICogQ0FNRVJBX0lNQUdFX1JFU09MVVRJT05fRkFDVE9SO1xyXG5cclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGhhbmRzU2VuZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIGF3YWl0IGhhbmRzLnNlbmQoIHsgaW1hZ2U6IHZpZGVvRWxlbWVudCB9ICk7XHJcbiAgICAgICAgICAgIGhhbmRzU2VuZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2F0Y2goIGUgKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoICdJbnRlcm5ldCB0cm91YmxlOicsIGUgKTtcclxuICAgICAgICAgICAgTWVkaWFQaXBlLnNob3dPb3BzRGlhbG9nKCBUYW5naWJsZVN0cmluZ3MuY2FtZXJhSW5wdXRSZXF1aXJlc0ludGVybmV0U3RyaW5nUHJvcGVydHkgKTtcclxuICAgICAgICAgICAgZmFpbGVkT25GcmFtZSA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBNZWRpYVBpcGUuc2VsZWN0ZWREZXZpY2VQcm9wZXJ0eS5sYXp5TGluayggZGV2aWNlSUQgPT4ge1xyXG4gICAgICAgIGlmICggdmlkZW9FbGVtZW50LnNyY09iamVjdCApIHtcclxuICAgICAgICAgIE1lZGlhUGlwZS5zdG9wU3RyZWFtKCB2aWRlb0VsZW1lbnQgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgTWVkaWFQaXBlLnN0YXJ0U3RyZWFtKCB2aWRlb0VsZW1lbnQsIGRldmljZUlEICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc29sZS5lcnJvciggJ25vIG5hdmlnYXRvci5tZWRpYURldmljZXMgZGV0ZWN0ZWQnICk7XHJcbiAgICAgIE1lZGlhUGlwZS5zaG93T29wc0RpYWxvZyggVGFuZ2libGVTdHJpbmdzLm5vTWVkaWFEZXZpY2VzU3RyaW5nUHJvcGVydHkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgc3RhdGljIHN0b3BTdHJlYW0oIHZpZGVvRWxlbWVudDogSFRNTFZpZGVvRWxlbWVudCApOiB2b2lkIHtcclxuICAgIGlmICggdmlkZW9FbGVtZW50LnNyY09iamVjdCBpbnN0YW5jZW9mIE1lZGlhU3RyZWFtICkge1xyXG4gICAgICBjb25zdCB0cmFja3MgPSB2aWRlb0VsZW1lbnQuc3JjT2JqZWN0LmdldFRyYWNrcygpO1xyXG5cclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdHJhY2tzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIHRyYWNrc1sgaSBdLnN0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdmlkZW9FbGVtZW50LnNyY09iamVjdCA9IG51bGw7XHJcbiAgICB2aWRlb1BsYXlpbmcgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc3RhdGljIHN0YXJ0U3RyZWFtKCB2aWRlb0VsZW1lbnQ6IEhUTUxWaWRlb0VsZW1lbnQsIGRldmljZUlEOiBzdHJpbmcgKTogdm9pZCB7XHJcbiAgICBjb25zdCBjb25zdHJhaW50cyA9IHtcclxuICAgICAgdmlkZW86IHtcclxuICAgICAgICBmYWNpbmdNb2RlOiAndXNlcicsXHJcbiAgICAgICAgd2lkdGg6IE1lZGlhUGlwZS52aWRlb1N0cmVhbURpbWVuc2lvbjIud2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0OiBNZWRpYVBpcGUudmlkZW9TdHJlYW1EaW1lbnNpb24yLmhlaWdodCxcclxuICAgICAgICBkZXZpY2VJZDogKCBkZXZpY2VJRCAmJiBkZXZpY2VJRCAhPT0gJycgKSA/IHsgZXhhY3Q6IGRldmljZUlEIH0gOiB1bmRlZmluZWRcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBMb2FkIHRoZSBjdXJyZW50IGRlc2lyZWQgZGV2aWNlXHJcblxyXG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoIGNvbnN0cmFpbnRzICkudGhlbiggc3RyZWFtID0+IHtcclxuICAgICAgdmlkZW9FbGVtZW50LnNyY09iamVjdCA9IHN0cmVhbTtcclxuICAgICAgdmlkZW9FbGVtZW50Lm9ubG9hZGVkbWV0YWRhdGEgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgYXdhaXQgdmlkZW9FbGVtZW50LnBsYXkoKTtcclxuXHJcbiAgICAgICAgLy8gS2VlcCBvdXIgb3duIGRhdGEgaGVyZSwgYmVjYXVzZSBJIGNvdWxkbid0IGZpbmQgdGhpcyBkYXRhIG9uIHRoZSB2aWRlb0VsZW1lbnQgaXRzZWxmLlxyXG4gICAgICAgIHZpZGVvUGxheWluZyA9IHRydWU7XHJcbiAgICAgIH07XHJcbiAgICB9ICkuY2F0Y2goIGUgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCBlICk7XHJcbiAgICAgIE1lZGlhUGlwZS5zaG93T29wc0RpYWxvZyggVGFuZ2libGVTdHJpbmdzLm5vTWVkaWFEZXZpY2VTdHJpbmdQcm9wZXJ0eSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLy8gRGlzcGxheSBhIGRpYWxvZyBpbmRpY2F0aW5nIHRoYXQgdGhlIE1lZGlhUGlwZSBmZWF0dXJlIGlzIG5vdCBnb2luZyB0byB3b3JrIGJlY2F1c2UgaXQgcmVxdWlyZXMgaW50ZXJuZXQgYWNjZXNzLlxyXG4gIHByaXZhdGUgc3RhdGljIHNob3dPb3BzRGlhbG9nKCBtZXNzYWdlOiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+ICk6IHZvaWQge1xyXG5cclxuICAgIC8vIFdhaXRpbmcgZm9yIG5leHQgc3RlcCBlbnN1cmVzIHdlIHdpbGwgaGF2ZSBhIHNpbSB0byBhcHBlbmQgdG8gdGhlIERpYWxvZyB0by5cclxuICAgIHN0ZXBUaW1lci5ydW5Pbk5leHRUaWNrKCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IG9mZmxpbmVEaWFsb2cgPSBuZXcgT29wc0RpYWxvZyggbWVzc2FnZSwge1xyXG4gICAgICAgIGNsb3NlQnV0dG9uTGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICAgIG9mZmxpbmVEaWFsb2cuaGlkZSgpO1xyXG4gICAgICAgICAgb2ZmbGluZURpYWxvZy5kaXNwb3NlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aXRsZTogbmV3IFRleHQoIFRhbmdpYmxlU3RyaW5ncy5lcnJvckxvYWRpbmdDYW1lcmFJbnB1dEhhbmRzU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMjggKVxyXG4gICAgICAgIH0gKVxyXG4gICAgICB9ICk7XHJcbiAgICAgIG9mZmxpbmVEaWFsb2cuc2hvdygpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSBjYW52YXMgdG8gdGhlIGN1cnJlbnQgaW1hZ2VcclxuICAgKi9cclxuICBwcml2YXRlIHN0YXRpYyBkcmF3VG9DYW52YXMoIGNhbnZhc0VsZW1lbnQ6IEhUTUxDYW52YXNFbGVtZW50LCBjYW52YXNDb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGltYWdlOiBIVE1MQ2FudmFzRWxlbWVudCApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNhbnZhc0NvbnRleHQsICdtdXN0IGhhdmUgYSBjYW52YXNDb250ZXh0JyApO1xyXG4gICAgY2FudmFzQ29udGV4dC5zYXZlKCk7XHJcbiAgICBjYW52YXNDb250ZXh0LnRyYW5zbGF0ZSggY2FudmFzRWxlbWVudC53aWR0aCwgMCApO1xyXG4gICAgY2FudmFzQ29udGV4dC5zY2FsZSggLTEsIDEgKTsgLy8gZmxpcCBjYW1lcmEgZm9yIHZpZXdpbmcgdG8gdGhlIHVzZXIuXHJcbiAgICBjYW52YXNDb250ZXh0LmNsZWFyUmVjdCggMCwgMCwgY2FudmFzRWxlbWVudC53aWR0aCwgY2FudmFzRWxlbWVudC5oZWlnaHQgKTtcclxuICAgIGNhbnZhc0NvbnRleHQuZHJhd0ltYWdlKCBpbWFnZSwgMCwgMCwgY2FudmFzRWxlbWVudC53aWR0aCwgY2FudmFzRWxlbWVudC5oZWlnaHQgKTtcclxuICAgIGNhbnZhc0NvbnRleHQucmVzdG9yZSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyBnZXRNZWRpYVBpcGVPcHRpb25zTm9kZSgpOiBOb2RlIHtcclxuXHJcbiAgICBjb25zdCBkZXZpY2VDb21ib0JveEl0ZW1zID0gTWVkaWFQaXBlLmF2YWlsYWJsZURldmljZXMubWFwKCAoIGRldmljZSwgaSApID0+IHtcclxuICAgICAgY29uc3QgbGFiZWwgPSBkZXZpY2UubGFiZWwgfHwgYENhbWVyYSAke2kgKyAxfWA7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgdmFsdWU6IGRldmljZS5kZXZpY2VJZCxcclxuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoIGxhYmVsICksXHJcbiAgICAgICAgYTExeU5hbWU6IGxhYmVsXHJcbiAgICAgIH07XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQSBjb250ZW50IE5vZGUgaGVyZSBhbGxvd3MgdXMgdG8gaGF2ZSBhIGxpc3QgYm94IHBhcmVudCBmb3IgdGhlIENvbWJvQm94LlxyXG4gICAgY29uc3QgY29udGVudCA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgLy8gSWYgdGhlcmUgYXJlbid0IG1lZGlhRGV2aWNlcyBhdmFpbGFibGUsIGJlIGdyYWNlZnVsXHJcbiAgICBjb25zdCBkZXZpY2VTZWxlY3Rvck5vZGUgPSBNZWRpYVBpcGUuYXZhaWxhYmxlRGV2aWNlcy5sZW5ndGggPiAwID8gbmV3IENvbWJvQm94KCBNZWRpYVBpcGUuc2VsZWN0ZWREZXZpY2VQcm9wZXJ0eSwgZGV2aWNlQ29tYm9Cb3hJdGVtcywgY29udGVudCwge1xyXG4gICAgICBhY2Nlc3NpYmxlTmFtZTogVGFuZ2libGVTdHJpbmdzLmlucHV0RGV2aWNlU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgIH0gKSA6IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgY29uc3QgdmJveCA9IG5ldyBWQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDEwLFxyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIG5ldyBUZXh0KCBUYW5naWJsZVN0cmluZ3MuY2FtZXJhSW5wdXRIYW5kc1N0cmluZ1Byb3BlcnR5LCBjb21iaW5lT3B0aW9uczxUZXh0T3B0aW9ucz4oIHtcclxuICAgICAgICAgIHRhZ05hbWU6ICdoMycsXHJcbiAgICAgICAgICBhY2Nlc3NpYmxlTmFtZTogVGFuZ2libGVTdHJpbmdzLmNhbWVyYUlucHV0SGFuZHNTdHJpbmdQcm9wZXJ0eVxyXG4gICAgICAgIH0sIFByZWZlcmVuY2VzRGlhbG9nLlBBTkVMX1NFQ1RJT05fTEFCRUxfT1BUSU9OUyApICksXHJcbiAgICAgICAgbmV3IFZvaWNpbmdUZXh0KCBUYW5naWJsZVN0cmluZ3MuY2FtZXJhSW5wdXRIYW5kc0hlbHBUZXh0U3RyaW5nUHJvcGVydHksIGNvbWJpbmVPcHRpb25zPFZvaWNpbmdUZXh0T3B0aW9ucz4oIHtcclxuICAgICAgICAgIHJlYWRpbmdCbG9ja05hbWVSZXNwb25zZTogU3RyaW5nVXRpbHMuZmlsbEluKCBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmxhYmVsbGVkRGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgICAgICAgbGFiZWw6IFRhbmdpYmxlU3RyaW5ncy5jYW1lcmFJbnB1dEhhbmRzU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBUYW5naWJsZVN0cmluZ3MuY2FtZXJhSW5wdXRIYW5kc0hlbHBUZXh0U3RyaW5nUHJvcGVydHlcclxuICAgICAgICAgIH0gKVxyXG4gICAgICAgIH0sIFByZWZlcmVuY2VzRGlhbG9nLlBBTkVMX1NFQ1RJT05fQ09OVEVOVF9PUFRJT05TICkgKSxcclxuICAgICAgICBuZXcgSEJveCgge1xyXG4gICAgICAgICAgc3BhY2luZzogMTAsXHJcbiAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICBuZXcgVGV4dCggVGFuZ2libGVTdHJpbmdzLmlucHV0RGV2aWNlU3RyaW5nUHJvcGVydHksIFByZWZlcmVuY2VzRGlhbG9nLlBBTkVMX1NFQ1RJT05fQ09OVEVOVF9PUFRJT05TICksXHJcbiAgICAgICAgICAgIGRldmljZVNlbGVjdG9yTm9kZVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH0gKSxcclxuICAgICAgICBuZXcgVkJveCgge1xyXG4gICAgICAgICAgc3BhY2luZzogNSxcclxuICAgICAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgICAgICBsYXlvdXRPcHRpb25zOiB7IHRvcE1hcmdpbjogMTAgfSxcclxuICAgICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICAgIG5ldyBWb2ljaW5nVGV4dCggVGFuZ2libGVTdHJpbmdzLnRyb3VibGVzaG9vdGluZ0NhbWVyYUlucHV0SGFuZHNTdHJpbmdQcm9wZXJ0eSwgY29tYmluZU9wdGlvbnM8VGV4dE9wdGlvbnM+KCB7XHJcbiAgICAgICAgICAgICAgdGFnTmFtZTogJ2gzJyxcclxuICAgICAgICAgICAgICBhY2Nlc3NpYmxlTmFtZTogVGFuZ2libGVTdHJpbmdzLnRyb3VibGVzaG9vdGluZ0NhbWVyYUlucHV0SGFuZHNTdHJpbmdQcm9wZXJ0eVxyXG4gICAgICAgICAgICB9LCBQcmVmZXJlbmNlc0RpYWxvZy5QQU5FTF9TRUNUSU9OX0xBQkVMX09QVElPTlMgKSApLFxyXG4gICAgICAgICAgICBuZXcgVm9pY2luZ1JpY2hUZXh0KCBUYW5naWJsZVN0cmluZ3MudHJvdWJsZXNob290aW5nUGFyYWdyYXBoU3RyaW5nUHJvcGVydHksIGNvbWJpbmVPcHRpb25zPFZvaWNpbmdSaWNoVGV4dE9wdGlvbnM+KCB7XHJcbiAgICAgICAgICAgICAgbGluZVdyYXA6IFByZWZlcmVuY2VzRGlhbG9nLlBBTkVMX1NFQ1RJT05fQ09OVEVOVF9PUFRJT05TLm1heFdpZHRoXHJcbiAgICAgICAgICAgIH0sIFByZWZlcmVuY2VzRGlhbG9nLlBBTkVMX1NFQ1RJT05fQ09OVEVOVF9PUFRJT05TICkgKSxcclxuICAgICAgICAgICAgbmV3IFZvaWNpbmdUZXh0KCBUYW5naWJsZVN0cmluZ3MuY2FtZXJhSW5wdXRGbGlwWUhlYWRpbmdTdHJpbmdQcm9wZXJ0eSwgY29tYmluZU9wdGlvbnM8Vm9pY2luZ1RleHRPcHRpb25zPigge1xyXG4gICAgICAgICAgICAgIGxheW91dE9wdGlvbnM6IHsgdG9wTWFyZ2luOiAxNSB9XHJcbiAgICAgICAgICAgIH0sIFByZWZlcmVuY2VzRGlhbG9nLlBBTkVMX1NFQ1RJT05fQ09OVEVOVF9PUFRJT05TICkgKSxcclxuICAgICAgICAgICAgbmV3IENoZWNrYm94KCBNZWRpYVBpcGUueUF4aXNGbGlwcGVkUHJvcGVydHksXHJcbiAgICAgICAgICAgICAgbmV3IFJpY2hUZXh0KCBUYW5naWJsZVN0cmluZ3MuY2FtZXJhSW5wdXRGbGlwWVN0cmluZ1Byb3BlcnR5LCBQcmVmZXJlbmNlc0RpYWxvZy5QQU5FTF9TRUNUSU9OX0NPTlRFTlRfT1BUSU9OUyApLCB7XHJcbiAgICAgICAgICAgICAgICB2b2ljaW5nTmFtZVJlc3BvbnNlOiBUYW5naWJsZVN0cmluZ3MuY2FtZXJhSW5wdXRGbGlwWVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICAgICAgICAgICAgdm9pY2VOYW1lUmVzcG9uc2VPblNlbGVjdGlvbjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhY2Nlc3NpYmxlTmFtZTogVGFuZ2libGVTdHJpbmdzLmNhbWVyYUlucHV0RmxpcFlTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgICAgICAgICAgIGNoZWNrZWRDb250ZXh0UmVzcG9uc2U6IFRhbmdpYmxlU3RyaW5ncy5hMTF5LmNhbWVyYUlucHV0RmxpcFlDaGVja2VkU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgICAgICAgICB1bmNoZWNrZWRDb250ZXh0UmVzcG9uc2U6IFRhbmdpYmxlU3RyaW5ncy5hMTF5LmNhbWVyYUlucHV0RmxpcFlVbmNoZWNrZWRTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgICAgICAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgICAgICAgICAgICB9ICksXHJcbiAgICAgICAgICAgIG5ldyBWb2ljaW5nVGV4dCggVGFuZ2libGVTdHJpbmdzLmNhbWVyYUlucHV0RmxpcFhIZWFkaW5nU3RyaW5nUHJvcGVydHksIGNvbWJpbmVPcHRpb25zPFZvaWNpbmdUZXh0T3B0aW9ucz4oIHtcclxuICAgICAgICAgICAgICBsYXlvdXRPcHRpb25zOiB7IHRvcE1hcmdpbjogMTAgfVxyXG4gICAgICAgICAgICB9LCBQcmVmZXJlbmNlc0RpYWxvZy5QQU5FTF9TRUNUSU9OX0NPTlRFTlRfT1BUSU9OUyApICksXHJcbiAgICAgICAgICAgIG5ldyBDaGVja2JveCggTWVkaWFQaXBlLnhBeGlzRmxpcHBlZFByb3BlcnR5LFxyXG4gICAgICAgICAgICAgIG5ldyBSaWNoVGV4dCggVGFuZ2libGVTdHJpbmdzLmNhbWVyYUlucHV0RmxpcFhTdHJpbmdQcm9wZXJ0eSwgUHJlZmVyZW5jZXNEaWFsb2cuUEFORUxfU0VDVElPTl9DT05URU5UX09QVElPTlMgKSwge1xyXG4gICAgICAgICAgICAgICAgdm9pY2luZ05hbWVSZXNwb25zZTogVGFuZ2libGVTdHJpbmdzLmNhbWVyYUlucHV0RmxpcFhTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgICAgICAgICAgIHZvaWNlTmFtZVJlc3BvbnNlT25TZWxlY3Rpb246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYWNjZXNzaWJsZU5hbWU6IFRhbmdpYmxlU3RyaW5ncy5jYW1lcmFJbnB1dEZsaXBYU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgICAgICAgICBjaGVja2VkQ29udGV4dFJlc3BvbnNlOiBUYW5naWJsZVN0cmluZ3MuYTExeS5jYW1lcmFJbnB1dEZsaXBYQ2hlY2tlZFN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICAgICAgICAgICAgdW5jaGVja2VkQ29udGV4dFJlc3BvbnNlOiBUYW5naWJsZVN0cmluZ3MuYTExeS5jYW1lcmFJbnB1dEZsaXBYVW5jaGVja2VkU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgICAgICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICAgICAgICAgICAgfSApXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfSApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb250ZW50LmFkZENoaWxkKCB2Ym94ICk7XHJcbiAgICByZXR1cm4gY29udGVudDtcclxuICB9XHJcblxyXG59XHJcblxyXG50YW5naWJsZS5yZWdpc3RlciggJ01lZGlhUGlwZScsIE1lZGlhUGlwZSApO1xyXG5leHBvcnQgZGVmYXVsdCBNZWRpYVBpcGU7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBT0EsUUFBUSxNQUFNLGdCQUFnQjtBQUNyQyxPQUFPQyxTQUFTLElBQUlDLGNBQWMsUUFBUSxvQ0FBb0M7QUFFOUUsT0FBT0MsT0FBTyxNQUFNLHFDQUFxQztBQUN6RCxPQUFPQyxVQUFVLE1BQU0sd0NBQXdDO0FBQy9ELE9BQU9DLGVBQWUsTUFBTSw2Q0FBNkM7QUFDekUsT0FBT0MsTUFBTSxNQUFNLG9DQUFvQztBQUN2RCxPQUFPQyxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLHdCQUF3QixNQUFNLCtCQUErQjtB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