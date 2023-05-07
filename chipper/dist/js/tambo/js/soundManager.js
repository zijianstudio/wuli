// Copyright 2018-2023, University of Colorado Boulder

/**
 * A singleton object that registers sound generators, connects them to the audio output, and provides a number of
 * related services, such as:
 *  - master enable/disable
 *  - master gain control
 *  - enable/disable of sounds based on visibility of an associated Scenery node
 *  - enable/disable of sounds based on their assigned sonification level (e.g. "basic" or "extra")
 *  - gain control for sounds based on their assigned category, e.g. UI versus sim-specific sounds
 *  - a shared reverb unit to add some spatialization and make all sounds seem to originate with the same space
 *
 *  The singleton object must be initialized before sound generators can be added.
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Utils from '../../dot/js/Utils.js';
import { Display, DisplayedProperty } from '../../scenery/js/imports.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import emptyApartmentBedroom06Resampled_mp3 from '../sounds/emptyApartmentBedroom06Resampled_mp3.js';
import audioContextStateChangeMonitor from './audioContextStateChangeMonitor.js';
import phetAudioContext from './phetAudioContext.js';
import soundConstants from './soundConstants.js';
import SoundLevelEnum from './SoundLevelEnum.js';
import tambo from './tambo.js';
import optionize from '../../phet-core/js/optionize.js';
import Multilink from '../../axon/js/Multilink.js';
import arrayRemove from '../../phet-core/js/arrayRemove.js';
import createObservableArray from '../../axon/js/createObservableArray.js';

// constants
const AUDIO_DUCKING_LEVEL = 0.15; // gain value to use for the ducking gain node when ducking is active

// options that can be used when adding a sound generator that can control some aspects of its behavior
// sound generators that are queued up and waiting to be added when initialization is complete
// sound generator with its sonification level
// constants
const DEFAULT_REVERB_LEVEL = 0.02;
const LINEAR_GAIN_CHANGE_TIME = soundConstants.DEFAULT_LINEAR_GAIN_CHANGE_TIME; // in seconds
const GAIN_LOGGING_ENABLED = false;
class SoundManager extends PhetioObject {
  // global enabled state for sound generation

  // enabled state for extra sounds

  // an array where the sound generators are stored along with information about how to manage them

  // output level for the master gain node when sonification is enabled

  // reverb level, needed because some browsers don't support reading of gain values, see methods for more info

  // A map of category names to GainNode instances that control gains for that category name.  This filled in during
  // initialization, see the usage of options.categories in the initialize function for more information.
  // an array of properties where, if any of these are true, overall output level is "ducked" (i.e. reduced)
  // flag that tracks whether the sonification manager has been initialized, should never be set outside this file
  // sound generators that are queued up if attempts are made to add them before initialization has occurred
  // audio nodes that are used in the signal chain between sound generators and the audio context destination
  displayedPropertyMap = new Map();
  constructor(tandem = Tandem.OPTIONAL) {
    super({
      tandem: tandem,
      phetioState: false,
      phetioDocumentation: 'Controls the simulation\'s sound. For sims that do not support sound, this element and ' + 'its children can be ignored.'
    });
    this.enabledProperty = new BooleanProperty(phet.chipper.queryParameters.supportsSound, {
      tandem: tandem.createTandem('enabledProperty'),
      phetioState: false,
      // This is a preference, global sound control is handled by the audioManager
      phetioDocumentation: 'Determines whether sound is enabled. Supported only if this sim supportsSound=true.'
    });
    this.extraSoundEnabledProperty = new BooleanProperty(phet.chipper.queryParameters.extraSoundInitiallyEnabled, {
      tandem: tandem.createTandem('extraSoundEnabledProperty'),
      phetioState: false,
      // This is a preference, global sound control is handled by the audioManager
      phetioDocumentation: 'Determines whether extra sound is enabled. Extra sound is additional sounds that ' + 'can serve to improve the learning experience for individuals with visual disabilities. ' + 'Note that not all simulations that support sound also support extra sound. Also note ' + 'that the value is irrelevant when enabledProperty is false.'
    });
    this.soundGeneratorInfoArray = [];
    this._masterOutputLevel = 1;
    this._reverbLevel = DEFAULT_REVERB_LEVEL;
    this.gainNodesForCategories = new Map();
    this.duckingProperties = createObservableArray();
    this.initialized = false;
    this.soundGeneratorsAwaitingAdd = [];
    this.masterGainNode = null;
    this.duckingGainNode = null;
    this.convolver = null;
    this.reverbGainNode = null;
    this.dryGainNode = null;
  }

  /**
   * Initialize the sonification manager. This function must be invoked before any sound generators can be added.
   */
  initialize(simConstructionCompleteProperty, audioEnabledProperty, simVisibleProperty, simActiveProperty, simSettingPhetioStateProperty, providedOptions) {
    assert && assert(!this.initialized, 'can\'t initialize the sound manager more than once');
    const options = optionize()({
      categories: ['sim-specific', 'user-interface']
    }, providedOptions);

    // options validation
    assert && assert(options.categories.length === _.uniq(options.categories).length, 'categories must be unique');
    const now = phetAudioContext.currentTime;

    // The final stage is a dynamics compressor that is used essentially as a limiter to prevent clipping.
    const dynamicsCompressor = phetAudioContext.createDynamicsCompressor();
    dynamicsCompressor.threshold.setValueAtTime(-6, now);
    dynamicsCompressor.knee.setValueAtTime(5, now);
    dynamicsCompressor.ratio.setValueAtTime(12, now);
    dynamicsCompressor.attack.setValueAtTime(0, now);
    dynamicsCompressor.release.setValueAtTime(0.25, now);
    dynamicsCompressor.connect(phetAudioContext.destination);

    // Create the ducking gain node, which is used to reduce the overall sound output level temporarily in certain
    // situations, such as when the voicing feature is actively producing speech.
    this.duckingGainNode = phetAudioContext.createGain();
    this.duckingGainNode.connect(dynamicsCompressor);

    // Create the master gain node for all sounds managed by this sonification manager.
    this.masterGainNode = phetAudioContext.createGain();
    this.masterGainNode.connect(this.duckingGainNode);

    // Set up a convolver node, which will be used to create the reverb effect.
    this.convolver = phetAudioContext.createConvolver();
    const setConvolverBuffer = audioBuffer => {
      if (audioBuffer) {
        this.convolver.buffer = audioBuffer;
        emptyApartmentBedroom06Resampled_mp3.audioBufferProperty.unlink(setConvolverBuffer);
      }
    };
    emptyApartmentBedroom06Resampled_mp3.audioBufferProperty.link(setConvolverBuffer);

    // gain node that will control the reverb level
    this.reverbGainNode = phetAudioContext.createGain();
    this.reverbGainNode.connect(this.masterGainNode);
    this.reverbGainNode.gain.setValueAtTime(this._reverbLevel, phetAudioContext.currentTime);
    this.convolver.connect(this.reverbGainNode);

    // dry (non-reverbed) portion of the output
    this.dryGainNode = phetAudioContext.createGain();
    this.dryGainNode.gain.setValueAtTime(1 - this._reverbLevel, phetAudioContext.currentTime);
    this.dryGainNode.gain.linearRampToValueAtTime(1 - this._reverbLevel, phetAudioContext.currentTime + LINEAR_GAIN_CHANGE_TIME);
    this.dryGainNode.connect(this.masterGainNode);

    // Create and hook up gain nodes for each of the defined categories.
    assert && assert(this.convolver !== null && this.dryGainNode !== null, 'some audio nodes have not been initialized');
    options.categories.forEach(categoryName => {
      const gainNode = phetAudioContext.createGain();
      gainNode.connect(this.convolver);
      gainNode.connect(this.dryGainNode);
      this.gainNodesForCategories.set(categoryName, gainNode);
    });

    // Hook up a listener that turns down the master gain if sonification is disabled or if the sim isn't visible or
    // isn't active.
    Multilink.multilink([this.enabledProperty, audioEnabledProperty, simConstructionCompleteProperty, simVisibleProperty, simActiveProperty, simSettingPhetioStateProperty], (enabled, audioEnabled, simInitComplete, simVisible, simActive, simSettingPhetioState) => {
      const fullyEnabled = enabled && audioEnabled && simInitComplete && simVisible && simActive && !simSettingPhetioState;
      const gain = fullyEnabled ? this._masterOutputLevel : 0;

      // Set the gain, but somewhat gradually in order to avoid rapid transients, which can sound like clicks.
      this.masterGainNode.gain.linearRampToValueAtTime(gain, phetAudioContext.currentTime + LINEAR_GAIN_CHANGE_TIME);
    });
    const duckMainOutputLevelProperty = new BooleanProperty(false);

    // Define a listener that will update the state of the collective ducking Property that indicates whether ducking
    // (overall volume reduction to prevent overlap with other sounds) should be active or inactive.
    const updateDuckingState = () => {
      // Reduce the array of individual ducking Properties array to a single boolean value.
      duckMainOutputLevelProperty.value = this.duckingProperties.reduce((valueSoFar, currentProperty) => valueSoFar || currentProperty.value, false);
    };

    // Implement ducking of the main output.
    duckMainOutputLevelProperty.lazyLink(duckOutput => {
      // State checking - make sure the ducking gain node exists.
      assert && assert(this.duckingGainNode, 'ducking listener fired, but no ducking gain node exists');

      // Use time constant values that will turn down the output level faster than it will turn it up.  This sounds
      // better, since it prevents overlap with the voice.
      const timeConstant = duckOutput ? 0.05 : 0.5;

      // Duck or don't.
      const now = phetAudioContext.currentTime;
      this.duckingGainNode?.gain.cancelScheduledValues(now);
      this.duckingGainNode?.gain.setTargetAtTime(duckOutput ? AUDIO_DUCKING_LEVEL : 1, now, timeConstant);
    });

    // Handle the adding and removal of individual ducking Properties.
    this.duckingProperties.addItemAddedListener(addedDuckingProperty => {
      addedDuckingProperty.link(updateDuckingState);
      const checkAndRemove = removedDuckingProperty => {
        if (removedDuckingProperty === addedDuckingProperty) {
          removedDuckingProperty.unlink(updateDuckingState);
          this.duckingProperties.removeItemRemovedListener(checkAndRemove);
        }
      };
      this.duckingProperties.addItemRemovedListener(checkAndRemove);
    });

    //------------------------------------------------------------------------------------------------------------------
    // Handle the audio context state, both when changes occur and when it is initially muted due to the autoplay
    // policy.  As of this writing (Feb 2019), there are some differences in how the audio context state behaves on
    // different platforms, so the code monitors different events and states to keep the audio context running.  As the
    // behavior of the audio context becomes more consistent across browsers, it may be possible to simplify this.
    //------------------------------------------------------------------------------------------------------------------

    // function to remove the user interaction listeners, used to avoid code duplication
    const removeUserInteractionListeners = () => {
      window.removeEventListener('touchstart', resumeAudioContext, false);
      if (Display.userGestureEmitter.hasListener(resumeAudioContext)) {
        Display.userGestureEmitter.removeListener(resumeAudioContext);
      }
    };

    // listener that resumes the audio context
    const resumeAudioContext = () => {
      if (phetAudioContext.state !== 'running') {
        phet.log && phet.log(`audio context not running, attempting to resume, state = ${phetAudioContext.state}`);

        // tell the audio context to resume
        phetAudioContext.resume().then(() => {
          phet.log && phet.log(`resume appears to have succeeded, phetAudioContext.state = ${phetAudioContext.state}`);
          removeUserInteractionListeners();
        }).catch(err => {
          const errorMessage = `error when trying to resume audio context, err = ${err}`;
          console.error(errorMessage);
          assert && alert(errorMessage);
        });
      } else {
        // audio context is already running, no need to listen anymore
        removeUserInteractionListeners();
      }
    };

    // listen for a touchstart - this only works to resume the audio context on iOS devices (as of this writing)
    window.addEventListener('touchstart', resumeAudioContext, false);

    // listen for other user gesture events
    Display.userGestureEmitter.addListener(resumeAudioContext);

    // During testing, several use cases were found where the audio context state changes to something other than the
    // "running" state while the sim is in use (generally either "suspended" or "interrupted", depending on the
    // browser).  The following code is intended to handle this situation by trying to resume it right away.  GitHub
    // issues with details about why this is necessary are:
    // - https://github.com/phetsims/tambo/issues/58
    // - https://github.com/phetsims/tambo/issues/59
    // - https://github.com/phetsims/fractions-common/issues/82
    // - https://github.com/phetsims/friction/issues/173
    // - https://github.com/phetsims/resistance-in-a-wire/issues/190
    // - https://github.com/phetsims/tambo/issues/90
    let previousAudioContextState = phetAudioContext.state;
    audioContextStateChangeMonitor.addStateChangeListener(phetAudioContext, state => {
      phet.log && phet.log(`audio context state changed, old state = ${previousAudioContextState}, new state = ${state}, audio context time = ${phetAudioContext.currentTime}`);
      if (state !== 'running') {
        // Add a listener that will resume the audio context on the next touchstart.
        window.addEventListener('touchstart', resumeAudioContext, false);

        // Listen also for other user gesture events that can be used to resume the audio context.
        if (!Display.userGestureEmitter.hasListener(resumeAudioContext)) {
          Display.userGestureEmitter.addListener(resumeAudioContext);
        }
      } else {
        console.log('AudioContext is now running.');
      }
      previousAudioContextState = state;
    });
    this.initialized = true;

    // Add any sound generators that were waiting for initialization to complete (must be done after init complete).
    this.soundGeneratorsAwaitingAdd.forEach(soundGeneratorAwaitingAdd => {
      this.addSoundGenerator(soundGeneratorAwaitingAdd.soundGenerator, soundGeneratorAwaitingAdd.soundGeneratorAddOptions);
    });
    this.soundGeneratorsAwaitingAdd.length = 0;
  }

  /**
   * Returns true if the specified soundGenerator has been previously added to the soundManager.
   */
  hasSoundGenerator(soundGenerator) {
    return _.some(this.soundGeneratorInfoArray, soundGeneratorInfo => soundGeneratorInfo.soundGenerator === soundGenerator);
  }

  /**
   * Add a sound generator.  This connects the sound generator to the audio path, puts it on the list of sound
   * generators, and creates and returns a unique ID.
   */
  addSoundGenerator(soundGenerator, providedOptions) {
    // We'll need an empty object of no options were provided.
    if (providedOptions === undefined) {
      providedOptions = {};
    }

    // Check if initialization has been done and, if not, queue the sound generator and its options for addition
    // once initialization is complete.  Note that when sound is not supported, initialization will never occur.
    if (!this.initialized) {
      this.soundGeneratorsAwaitingAdd.push({
        soundGenerator: soundGenerator,
        soundGeneratorAddOptions: providedOptions
      });
      return;
    }

    // state checking - make sure the needed nodes have been created
    assert && assert(this.convolver !== null && this.dryGainNode !== null, 'some audio nodes have not been initialized');

    // Verify that this is not a duplicate addition.
    const hasSoundGenerator = this.hasSoundGenerator(soundGenerator);
    assert && assert(!hasSoundGenerator, 'can\'t add the same sound generator twice');

    // default options
    const options = optionize()({
      sonificationLevel: SoundLevelEnum.BASIC,
      associatedViewNode: null,
      categoryName: null
    }, providedOptions);

    // option validation
    assert && assert(_.includes(_.values(SoundLevelEnum), options.sonificationLevel), `invalid value for sonification level: ${options.sonificationLevel}`);

    // Connect the sound generator to an output path.
    if (options.categoryName === null) {
      soundGenerator.connect(this.convolver);
      soundGenerator.connect(this.dryGainNode);
    } else {
      assert && assert(this.gainNodesForCategories.has(options.categoryName), `category does not exist : ${options.categoryName}`);
      soundGenerator.connect(this.gainNodesForCategories.get(options.categoryName));
    }

    // Keep a record of the sound generator along with additional information about it.
    const soundGeneratorInfo = {
      soundGenerator: soundGenerator,
      sonificationLevel: options.sonificationLevel
    };
    this.soundGeneratorInfoArray.push(soundGeneratorInfo);

    // Add the global enable Property to the list of Properties that enable this sound generator.
    soundGenerator.addEnableControlProperty(this.enabledProperty);

    // If this sound generator is only enabled in extra mode, add the extra mode Property as an enable-control.
    if (options.sonificationLevel === SoundLevelEnum.EXTRA) {
      soundGenerator.addEnableControlProperty(this.extraSoundEnabledProperty);
    }

    // If a view node was specified, create and pass in a boolean Property that is true only when the node is displayed.
    if (options.associatedViewNode) {
      const displayedProperty = new DisplayedProperty(options.associatedViewNode);
      soundGenerator.addEnableControlProperty(displayedProperty);
      this.displayedPropertyMap.set(soundGenerator, displayedProperty);
    }
  }

  /**
   * Remove the specified sound generator.
   */
  removeSoundGenerator(soundGenerator) {
    // Check if the sound manager is initialized and, if not, issue a warning and ignore the request.  This is not an
    // assertion because the sound manager may not be initialized in cases where the sound is not enabled for the
    // simulation, but this method can still end up being invoked.
    if (!this.initialized) {
      const toRemove = this.soundGeneratorsAwaitingAdd.filter(s => s.soundGenerator === soundGenerator);
      assert && assert(toRemove.length > 0, 'unable to remove sound generator - not found');
      while (toRemove.length > 0) {
        arrayRemove(this.soundGeneratorsAwaitingAdd, toRemove[0]);
        toRemove.shift();
      }
      return;
    }

    // find the info object for this sound generator
    let soundGeneratorInfo = null;
    for (let i = 0; i < this.soundGeneratorInfoArray.length; i++) {
      if (this.soundGeneratorInfoArray[i].soundGenerator === soundGenerator) {
        // found it
        soundGeneratorInfo = this.soundGeneratorInfoArray[i];
        break;
      }
    }

    // make sure it is actually present on the list
    assert && assert(soundGeneratorInfo, 'unable to remove sound generator - not found');

    // disconnect the sound generator from any audio nodes to which it may be connected
    if (soundGenerator.isConnectedTo(this.convolver)) {
      soundGenerator.disconnect(this.convolver);
    }
    if (soundGenerator.isConnectedTo(this.dryGainNode)) {
      soundGenerator.disconnect(this.dryGainNode);
    }
    this.gainNodesForCategories.forEach(gainNode => {
      if (soundGenerator.isConnectedTo(gainNode)) {
        soundGenerator.disconnect(gainNode);
      }
    });

    // Remove the sound generator from the list.
    if (soundGeneratorInfo) {
      this.soundGeneratorInfoArray.splice(this.soundGeneratorInfoArray.indexOf(soundGeneratorInfo), 1);
    }

    // Clean up created DisplayedProperties that were created for the associated soundGenerator
    if (this.displayedPropertyMap.has(soundGenerator)) {
      this.displayedPropertyMap.get(soundGenerator).dispose();
      this.displayedPropertyMap.delete(soundGenerator);
    }
  }

  /**
   * Set the master output level for sounds.
   * @param level - valid values from 0 (min) through 1 (max)
   */
  setMasterOutputLevel(level) {
    // Check if initialization has been done.  This is not an assertion because the sound manager may not be
    // initialized if sound is not enabled for the sim.
    if (!this.initialized) {
      console.warn('an attempt was made to set the master output level on an uninitialized sound manager, ignoring');
      return;
    }

    // range check
    assert && assert(level >= 0 && level <= 1, `output level value out of range: ${level}`);
    this._masterOutputLevel = level;
    if (this.enabledProperty.value) {
      this.masterGainNode.gain.linearRampToValueAtTime(level, phetAudioContext.currentTime + LINEAR_GAIN_CHANGE_TIME);
    }
  }
  set masterOutputLevel(outputLevel) {
    this.setMasterOutputLevel(outputLevel);
  }
  get masterOutputLevel() {
    return this.getMasterOutputLevel();
  }

  /**
   * Get the current output level setting.
   */
  getMasterOutputLevel() {
    return this._masterOutputLevel;
  }

  /**
   * Set the output level for the specified category of sound generator.
   * @param categoryName - name of category to which this invocation applies
   * @param outputLevel - valid values from 0 through 1
   */
  setOutputLevelForCategory(categoryName, outputLevel) {
    // Check if initialization has been done.  This is not an assertion because the sound manager may not be
    // initialized if sound is not enabled for the sim.
    if (!this.initialized) {
      console.warn('an attempt was made to set the output level for a sound category on an uninitialized sound manager, ignoring');
      return;
    }
    assert && assert(this.initialized, 'output levels for categories cannot be added until initialization has been done');

    // range check
    assert && assert(outputLevel >= 0 && outputLevel <= 1, `output level value out of range: ${outputLevel}`);

    // verify that the specified category exists
    assert && assert(this.gainNodesForCategories.get(categoryName), `no category with name = ${categoryName}`);

    // Set the gain value on the appropriate gain node.
    const gainNode = this.gainNodesForCategories.get(categoryName);
    if (gainNode) {
      gainNode.gain.setValueAtTime(outputLevel, phetAudioContext.currentTime);
    }
  }

  /**
   * Add a ducking Property.  When any of the ducking Properties are true, the output level will be "ducked", meaning
   * that it will be reduced.
   */
  addDuckingProperty(duckingProperty) {
    this.duckingProperties.add(duckingProperty);
  }

  /**
   * Remove a ducking Property that had been previously added.
   */
  removeDuckingProperty(duckingProperty) {
    assert && assert(this.duckingProperties.includes(duckingProperty), 'ducking Property not present');
    this.duckingProperties.remove(duckingProperty);
  }

  /**
   * Get the output level for the specified sound generator category.
   * @param categoryName - name of category to which this invocation applies
   */
  getOutputLevelForCategory(categoryName) {
    // Check if initialization has been done.  This is not an assertion because the sound manager may not be
    // initialized if sound is not enabled for the sim.
    if (!this.initialized) {
      console.warn('an attempt was made to get the output level for a sound category on an uninitialized sound manager, returning 0');
      return 0;
    }

    // Get the GainNode for the specified category.
    const gainNode = this.gainNodesForCategories.get(categoryName);
    assert && assert(gainNode, `no category with name = ${categoryName}`);
    return gainNode.gain.value;
  }

  /**
   * Set the amount of reverb.
   * @param newReverbLevel - value from 0 to 1, 0 = totally dry, 1 = wet
   */
  setReverbLevel(newReverbLevel) {
    // Check if initialization has been done.  This is not an assertion because the sound manager may not be
    // initialized if sound is not enabled for the sim.
    if (!this.initialized) {
      console.warn('an attempt was made to set the reverb level on an uninitialized sound manager, ignoring');
      return;
    }
    if (newReverbLevel !== this._reverbLevel) {
      assert && assert(newReverbLevel >= 0 && newReverbLevel <= 1, `reverb value out of range: ${newReverbLevel}`);
      const now = phetAudioContext.currentTime;
      this.reverbGainNode.gain.linearRampToValueAtTime(newReverbLevel, now + LINEAR_GAIN_CHANGE_TIME);
      this.dryGainNode.gain.linearRampToValueAtTime(1 - newReverbLevel, now + LINEAR_GAIN_CHANGE_TIME);
      this._reverbLevel = newReverbLevel;
    }
  }
  set reverbLevel(reverbLevel) {
    this.setReverbLevel(reverbLevel);
  }
  get reverbLevel() {
    return this.getReverbLevel();
  }
  getReverbLevel() {
    return this._reverbLevel;
  }
  set enabled(enabled) {
    this.enabledProperty.value = enabled;
  }
  get enabled() {
    return this.enabledProperty.value;
  }
  set sonificationLevel(sonificationLevel) {
    this.extraSoundEnabledProperty.value = sonificationLevel === SoundLevelEnum.EXTRA;
  }

  /**
   * ES5 getter for sonification level
   */
  get sonificationLevel() {
    return this.extraSoundEnabledProperty.value ? SoundLevelEnum.EXTRA : SoundLevelEnum.BASIC;
  }

  /**
   * Log the value of the gain parameter at every animation frame for the specified duration.  This is useful for
   * debugging, because these parameters change over time when set using methods like "setTargetAtTime", and the
   * details of how they change seems to be different on the different browsers.
   *
   * It may be possible to remove this method someday once the behavior is more consistent across browsers.  See
   * https://github.com/phetsims/resistance-in-a-wire/issues/205 for some history on this.
   *
   * @param gainNode
   * @param duration - duration for logging, in seconds
   */
  logGain(gainNode, duration) {
    duration = duration || 1;
    const startTime = Date.now();

    // closure that will be invoked multiple times to log the changing values
    function logGain() {
      const now = Date.now();
      const timeInMilliseconds = now - startTime;
      console.log(`Time (ms): ${Utils.toFixed(timeInMilliseconds, 2)}, Gain Value: ${gainNode.gain.value}`);
      if (now - startTime < duration * 1000) {
        window.requestAnimationFrame(logGain);
      }
    }
    if (GAIN_LOGGING_ENABLED) {
      // kick off the logging
      console.log('------- start of gain logging -----');
      logGain();
    }
  }

  /**
   * Log the value of the master gain as it changes, used primarily for debug.
   * @param duration - in seconds
   */
  logMasterGain(duration) {
    if (this.masterGainNode) {
      this.logGain(this.masterGainNode, duration);
    }
  }

  /**
   * Log the value of the reverb gain as it changes, used primarily for debug.
   * @param duration - duration for logging, in seconds
   */
  logReverbGain(duration) {
    if (this.reverbGainNode) {
      this.logGain(this.reverbGainNode, duration);
    }
  }
}
const soundManager = new SoundManager();
tambo.register('soundManager', soundManager);
export default soundManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJVdGlscyIsIkRpc3BsYXkiLCJEaXNwbGF5ZWRQcm9wZXJ0eSIsIlBoZXRpb09iamVjdCIsIlRhbmRlbSIsImVtcHR5QXBhcnRtZW50QmVkcm9vbTA2UmVzYW1wbGVkX21wMyIsImF1ZGlvQ29udGV4dFN0YXRlQ2hhbmdlTW9uaXRvciIsInBoZXRBdWRpb0NvbnRleHQiLCJzb3VuZENvbnN0YW50cyIsIlNvdW5kTGV2ZWxFbnVtIiwidGFtYm8iLCJvcHRpb25pemUiLCJNdWx0aWxpbmsiLCJhcnJheVJlbW92ZSIsImNyZWF0ZU9ic2VydmFibGVBcnJheSIsIkFVRElPX0RVQ0tJTkdfTEVWRUwiLCJERUZBVUxUX1JFVkVSQl9MRVZFTCIsIkxJTkVBUl9HQUlOX0NIQU5HRV9USU1FIiwiREVGQVVMVF9MSU5FQVJfR0FJTl9DSEFOR0VfVElNRSIsIkdBSU5fTE9HR0lOR19FTkFCTEVEIiwiU291bmRNYW5hZ2VyIiwiZGlzcGxheWVkUHJvcGVydHlNYXAiLCJNYXAiLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsIk9QVElPTkFMIiwicGhldGlvU3RhdGUiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiZW5hYmxlZFByb3BlcnR5IiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJzdXBwb3J0c1NvdW5kIiwiY3JlYXRlVGFuZGVtIiwiZXh0cmFTb3VuZEVuYWJsZWRQcm9wZXJ0eSIsImV4dHJhU291bmRJbml0aWFsbHlFbmFibGVkIiwic291bmRHZW5lcmF0b3JJbmZvQXJyYXkiLCJfbWFzdGVyT3V0cHV0TGV2ZWwiLCJfcmV2ZXJiTGV2ZWwiLCJnYWluTm9kZXNGb3JDYXRlZ29yaWVzIiwiZHVja2luZ1Byb3BlcnRpZXMiLCJpbml0aWFsaXplZCIsInNvdW5kR2VuZXJhdG9yc0F3YWl0aW5nQWRkIiwibWFzdGVyR2Fpbk5vZGUiLCJkdWNraW5nR2Fpbk5vZGUiLCJjb252b2x2ZXIiLCJyZXZlcmJHYWluTm9kZSIsImRyeUdhaW5Ob2RlIiwiaW5pdGlhbGl6ZSIsInNpbUNvbnN0cnVjdGlvbkNvbXBsZXRlUHJvcGVydHkiLCJhdWRpb0VuYWJsZWRQcm9wZXJ0eSIsInNpbVZpc2libGVQcm9wZXJ0eSIsInNpbUFjdGl2ZVByb3BlcnR5Iiwic2ltU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJhc3NlcnQiLCJvcHRpb25zIiwiY2F0ZWdvcmllcyIsImxlbmd0aCIsIl8iLCJ1bmlxIiwibm93IiwiY3VycmVudFRpbWUiLCJkeW5hbWljc0NvbXByZXNzb3IiLCJjcmVhdGVEeW5hbWljc0NvbXByZXNzb3IiLCJ0aHJlc2hvbGQiLCJzZXRWYWx1ZUF0VGltZSIsImtuZWUiLCJyYXRpbyIsImF0dGFjayIsInJlbGVhc2UiLCJjb25uZWN0IiwiZGVzdGluYXRpb24iLCJjcmVhdGVHYWluIiwiY3JlYXRlQ29udm9sdmVyIiwic2V0Q29udm9sdmVyQnVmZmVyIiwiYXVkaW9CdWZmZXIiLCJidWZmZXIiLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidW5saW5rIiwibGluayIsImdhaW4iLCJsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZSIsImZvckVhY2giLCJjYXRlZ29yeU5hbWUiLCJnYWluTm9kZSIsInNldCIsIm11bHRpbGluayIsImVuYWJsZWQiLCJhdWRpb0VuYWJsZWQiLCJzaW1Jbml0Q29tcGxldGUiLCJzaW1WaXNpYmxlIiwic2ltQWN0aXZlIiwic2ltU2V0dGluZ1BoZXRpb1N0YXRlIiwiZnVsbHlFbmFibGVkIiwiZHVja01haW5PdXRwdXRMZXZlbFByb3BlcnR5IiwidXBkYXRlRHVja2luZ1N0YXRlIiwidmFsdWUiLCJyZWR1Y2UiLCJ2YWx1ZVNvRmFyIiwiY3VycmVudFByb3BlcnR5IiwibGF6eUxpbmsiLCJkdWNrT3V0cHV0IiwidGltZUNvbnN0YW50IiwiY2FuY2VsU2NoZWR1bGVkVmFsdWVzIiwic2V0VGFyZ2V0QXRUaW1lIiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJhZGRlZER1Y2tpbmdQcm9wZXJ0eSIsImNoZWNrQW5kUmVtb3ZlIiwicmVtb3ZlZER1Y2tpbmdQcm9wZXJ0eSIsInJlbW92ZUl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwicmVtb3ZlVXNlckludGVyYWN0aW9uTGlzdGVuZXJzIiwid2luZG93IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInJlc3VtZUF1ZGlvQ29udGV4dCIsInVzZXJHZXN0dXJlRW1pdHRlciIsImhhc0xpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJzdGF0ZSIsImxvZyIsInJlc3VtZSIsInRoZW4iLCJjYXRjaCIsImVyciIsImVycm9yTWVzc2FnZSIsImNvbnNvbGUiLCJlcnJvciIsImFsZXJ0IiwiYWRkRXZlbnRMaXN0ZW5lciIsImFkZExpc3RlbmVyIiwicHJldmlvdXNBdWRpb0NvbnRleHRTdGF0ZSIsImFkZFN0YXRlQ2hhbmdlTGlzdGVuZXIiLCJzb3VuZEdlbmVyYXRvckF3YWl0aW5nQWRkIiwiYWRkU291bmRHZW5lcmF0b3IiLCJzb3VuZEdlbmVyYXRvciIsInNvdW5kR2VuZXJhdG9yQWRkT3B0aW9ucyIsImhhc1NvdW5kR2VuZXJhdG9yIiwic29tZSIsInNvdW5kR2VuZXJhdG9ySW5mbyIsInVuZGVmaW5lZCIsInB1c2giLCJzb25pZmljYXRpb25MZXZlbCIsIkJBU0lDIiwiYXNzb2NpYXRlZFZpZXdOb2RlIiwiaW5jbHVkZXMiLCJ2YWx1ZXMiLCJoYXMiLCJnZXQiLCJhZGRFbmFibGVDb250cm9sUHJvcGVydHkiLCJFWFRSQSIsImRpc3BsYXllZFByb3BlcnR5IiwicmVtb3ZlU291bmRHZW5lcmF0b3IiLCJ0b1JlbW92ZSIsImZpbHRlciIsInMiLCJzaGlmdCIsImkiLCJpc0Nvbm5lY3RlZFRvIiwiZGlzY29ubmVjdCIsInNwbGljZSIsImluZGV4T2YiLCJkaXNwb3NlIiwiZGVsZXRlIiwic2V0TWFzdGVyT3V0cHV0TGV2ZWwiLCJsZXZlbCIsIndhcm4iLCJtYXN0ZXJPdXRwdXRMZXZlbCIsIm91dHB1dExldmVsIiwiZ2V0TWFzdGVyT3V0cHV0TGV2ZWwiLCJzZXRPdXRwdXRMZXZlbEZvckNhdGVnb3J5IiwiYWRkRHVja2luZ1Byb3BlcnR5IiwiZHVja2luZ1Byb3BlcnR5IiwiYWRkIiwicmVtb3ZlRHVja2luZ1Byb3BlcnR5IiwicmVtb3ZlIiwiZ2V0T3V0cHV0TGV2ZWxGb3JDYXRlZ29yeSIsInNldFJldmVyYkxldmVsIiwibmV3UmV2ZXJiTGV2ZWwiLCJyZXZlcmJMZXZlbCIsImdldFJldmVyYkxldmVsIiwibG9nR2FpbiIsImR1cmF0aW9uIiwic3RhcnRUaW1lIiwiRGF0ZSIsInRpbWVJbk1pbGxpc2Vjb25kcyIsInRvRml4ZWQiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJsb2dNYXN0ZXJHYWluIiwibG9nUmV2ZXJiR2FpbiIsInNvdW5kTWFuYWdlciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsic291bmRNYW5hZ2VyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgc2luZ2xldG9uIG9iamVjdCB0aGF0IHJlZ2lzdGVycyBzb3VuZCBnZW5lcmF0b3JzLCBjb25uZWN0cyB0aGVtIHRvIHRoZSBhdWRpbyBvdXRwdXQsIGFuZCBwcm92aWRlcyBhIG51bWJlciBvZlxyXG4gKiByZWxhdGVkIHNlcnZpY2VzLCBzdWNoIGFzOlxyXG4gKiAgLSBtYXN0ZXIgZW5hYmxlL2Rpc2FibGVcclxuICogIC0gbWFzdGVyIGdhaW4gY29udHJvbFxyXG4gKiAgLSBlbmFibGUvZGlzYWJsZSBvZiBzb3VuZHMgYmFzZWQgb24gdmlzaWJpbGl0eSBvZiBhbiBhc3NvY2lhdGVkIFNjZW5lcnkgbm9kZVxyXG4gKiAgLSBlbmFibGUvZGlzYWJsZSBvZiBzb3VuZHMgYmFzZWQgb24gdGhlaXIgYXNzaWduZWQgc29uaWZpY2F0aW9uIGxldmVsIChlLmcuIFwiYmFzaWNcIiBvciBcImV4dHJhXCIpXHJcbiAqICAtIGdhaW4gY29udHJvbCBmb3Igc291bmRzIGJhc2VkIG9uIHRoZWlyIGFzc2lnbmVkIGNhdGVnb3J5LCBlLmcuIFVJIHZlcnN1cyBzaW0tc3BlY2lmaWMgc291bmRzXHJcbiAqICAtIGEgc2hhcmVkIHJldmVyYiB1bml0IHRvIGFkZCBzb21lIHNwYXRpYWxpemF0aW9uIGFuZCBtYWtlIGFsbCBzb3VuZHMgc2VlbSB0byBvcmlnaW5hdGUgd2l0aCB0aGUgc2FtZSBzcGFjZVxyXG4gKlxyXG4gKiAgVGhlIHNpbmdsZXRvbiBvYmplY3QgbXVzdCBiZSBpbml0aWFsaXplZCBiZWZvcmUgc291bmQgZ2VuZXJhdG9ycyBjYW4gYmUgYWRkZWQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgeyBEaXNwbGF5LCBEaXNwbGF5ZWRQcm9wZXJ0eSwgTm9kZSB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBlbXB0eUFwYXJ0bWVudEJlZHJvb20wNlJlc2FtcGxlZF9tcDMgZnJvbSAnLi4vc291bmRzL2VtcHR5QXBhcnRtZW50QmVkcm9vbTA2UmVzYW1wbGVkX21wMy5qcyc7XHJcbmltcG9ydCBhdWRpb0NvbnRleHRTdGF0ZUNoYW5nZU1vbml0b3IgZnJvbSAnLi9hdWRpb0NvbnRleHRTdGF0ZUNoYW5nZU1vbml0b3IuanMnO1xyXG5pbXBvcnQgcGhldEF1ZGlvQ29udGV4dCBmcm9tICcuL3BoZXRBdWRpb0NvbnRleHQuanMnO1xyXG5pbXBvcnQgc291bmRDb25zdGFudHMgZnJvbSAnLi9zb3VuZENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBTb3VuZExldmVsRW51bSBmcm9tICcuL1NvdW5kTGV2ZWxFbnVtLmpzJztcclxuaW1wb3J0IHRhbWJvIGZyb20gJy4vdGFtYm8uanMnO1xyXG5pbXBvcnQgU291bmRHZW5lcmF0b3IgZnJvbSAnLi9zb3VuZC1nZW5lcmF0b3JzL1NvdW5kR2VuZXJhdG9yLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5LCB7IFByb3BlcnR5TGlua0xpc3RlbmVyIH0gZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgYXJyYXlSZW1vdmUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FycmF5UmVtb3ZlLmpzJztcclxuaW1wb3J0IGNyZWF0ZU9ic2VydmFibGVBcnJheSwgeyBPYnNlcnZhYmxlQXJyYXkgfSBmcm9tICcuLi8uLi9heG9uL2pzL2NyZWF0ZU9ic2VydmFibGVBcnJheS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQVVESU9fRFVDS0lOR19MRVZFTCA9IDAuMTU7IC8vIGdhaW4gdmFsdWUgdG8gdXNlIGZvciB0aGUgZHVja2luZyBnYWluIG5vZGUgd2hlbiBkdWNraW5nIGlzIGFjdGl2ZVxyXG5cclxuLy8gb3B0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIHdoZW4gYWRkaW5nIGEgc291bmQgZ2VuZXJhdG9yIHRoYXQgY2FuIGNvbnRyb2wgc29tZSBhc3BlY3RzIG9mIGl0cyBiZWhhdmlvclxyXG5leHBvcnQgdHlwZSBTb3VuZEdlbmVyYXRvckFkZE9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIFRoZSAnc29uaWZpY2F0aW9uIGxldmVsJyBpcyB1c2VkIHRvIGRldGVybWluZSB3aGV0aGVyIGEgZ2l2ZW4gc291bmQgc2hvdWxkIGJlIGVuYWJsZWQgZ2l2ZW4gdGhlIHNldHRpbmcgb2YgdGhlXHJcbiAgLy8gc29uaWZpY2F0aW9uIGxldmVsIHBhcmFtZXRlciBmb3IgdGhlIHNpbS5cclxuICBzb25pZmljYXRpb25MZXZlbD86IFNvdW5kTGV2ZWxFbnVtO1xyXG5cclxuICAvLyBUaGUgYXNzb2NpYXRlZCB2aWV3IG5vZGUgaXMgYSBTY2VuZXJ5IG5vZGUgdGhhdCwgaWYgcHJvdmlkZWQsIG11c3QgYmUgdmlzaWJsZSBpbiB0aGUgZGlzcGxheSBmb3IgdGhlIHNvdW5kXHJcbiAgLy8gZ2VuZXJhdG9yIHRvIGJlIGVuYWJsZWQuICBUaGlzIGlzIGdlbmVyYWxseSB1c2VkIG9ubHkgZm9yIHNvdW5kcyB0aGF0IGNhbiBwbGF5IGZvciBsb25nIGR1cmF0aW9ucywgc3VjaCBhcyBhXHJcbiAgLy8gbG9vcGluZyBzb3VuZCBjbGlwLCB0aGF0IHNob3VsZCBiZSBzdG9wcGVkIHdoZW4gdGhlIGFzc29jaWF0ZWQgdmlzdWFsIHJlcHJlc2VudGF0aW9uIGlzIGhpZGRlbi5cclxuICBhc3NvY2lhdGVkVmlld05vZGU/OiBOb2RlIHwgbnVsbDtcclxuXHJcbiAgLy8gY2F0ZWdvcnkgbmFtZSBmb3IgdGhpcyBzb3VuZFxyXG4gIGNhdGVnb3J5TmFtZT86IHN0cmluZyB8IG51bGw7XHJcbn07XHJcblxyXG4vLyBzb3VuZCBnZW5lcmF0b3JzIHRoYXQgYXJlIHF1ZXVlZCB1cCBhbmQgd2FpdGluZyB0byBiZSBhZGRlZCB3aGVuIGluaXRpYWxpemF0aW9uIGlzIGNvbXBsZXRlXHJcbnR5cGUgU291bmRHZW5lcmF0b3JBd2FpdGluZ0FkZCA9IHtcclxuICBzb3VuZEdlbmVyYXRvcjogU291bmRHZW5lcmF0b3I7XHJcbiAgc291bmRHZW5lcmF0b3JBZGRPcHRpb25zOiBTb3VuZEdlbmVyYXRvckFkZE9wdGlvbnM7XHJcbn07XHJcblxyXG4vLyBzb3VuZCBnZW5lcmF0b3Igd2l0aCBpdHMgc29uaWZpY2F0aW9uIGxldmVsXHJcbnR5cGUgU291bmRHZW5lcmF0b3JJbmZvID0ge1xyXG4gIHNvdW5kR2VuZXJhdG9yOiBTb3VuZEdlbmVyYXRvcjtcclxuICBzb25pZmljYXRpb25MZXZlbDogU291bmRMZXZlbEVudW07XHJcbn07XHJcblxyXG50eXBlIFNvdW5kR2VuZXJhdG9ySW5pdGlhbGl6YXRpb25PcHRpb25zID0ge1xyXG5cclxuICAvLyBUaGlzIG9wdGlvbiBjYW4gYmUgdXNlZCB0byBkZWZpbmUgYSBzZXQgb2YgY2F0ZWdvcmllcyB0aGF0IGNhbiBiZSB1c2VkIHRvIGdyb3VwIHNvdW5kIGdlbmVyYXRvcnMgdG9nZXRoZXIgYW5kXHJcbiAgLy8gdGhlbiBjb250cm9sIHRoZWlyIHZvbHVtZSBjb2xsZWN0aXZlbHkuICBUaGUgbmFtZXMgc2hvdWxkIGJlIHVuaXF1ZS4gIFNlZSB0aGUgZGVmYXVsdCBpbml0aWFsaXphdGlvbiB2YWx1ZXMgZm9yIGFuXHJcbiAgLy8gZXhhbXBsZSBsaXN0LlxyXG4gIGNhdGVnb3JpZXM/OiBzdHJpbmdbXTtcclxufTtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBERUZBVUxUX1JFVkVSQl9MRVZFTCA9IDAuMDI7XHJcbmNvbnN0IExJTkVBUl9HQUlOX0NIQU5HRV9USU1FID0gc291bmRDb25zdGFudHMuREVGQVVMVF9MSU5FQVJfR0FJTl9DSEFOR0VfVElNRTsgLy8gaW4gc2Vjb25kc1xyXG5jb25zdCBHQUlOX0xPR0dJTkdfRU5BQkxFRCA9IGZhbHNlO1xyXG5cclxuY2xhc3MgU291bmRNYW5hZ2VyIGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcclxuXHJcbiAgLy8gZ2xvYmFsIGVuYWJsZWQgc3RhdGUgZm9yIHNvdW5kIGdlbmVyYXRpb25cclxuICBwdWJsaWMgcmVhZG9ubHkgZW5hYmxlZFByb3BlcnR5OiBCb29sZWFuUHJvcGVydHk7XHJcblxyXG4gIC8vIGVuYWJsZWQgc3RhdGUgZm9yIGV4dHJhIHNvdW5kc1xyXG4gIHB1YmxpYyByZWFkb25seSBleHRyYVNvdW5kRW5hYmxlZFByb3BlcnR5OiBCb29sZWFuUHJvcGVydHk7XHJcblxyXG4gIC8vIGFuIGFycmF5IHdoZXJlIHRoZSBzb3VuZCBnZW5lcmF0b3JzIGFyZSBzdG9yZWQgYWxvbmcgd2l0aCBpbmZvcm1hdGlvbiBhYm91dCBob3cgdG8gbWFuYWdlIHRoZW1cclxuICBwcml2YXRlIHJlYWRvbmx5IHNvdW5kR2VuZXJhdG9ySW5mb0FycmF5OiBTb3VuZEdlbmVyYXRvckluZm9bXTtcclxuXHJcbiAgLy8gb3V0cHV0IGxldmVsIGZvciB0aGUgbWFzdGVyIGdhaW4gbm9kZSB3aGVuIHNvbmlmaWNhdGlvbiBpcyBlbmFibGVkXHJcbiAgcHJpdmF0ZSBfbWFzdGVyT3V0cHV0TGV2ZWw6IG51bWJlcjtcclxuXHJcbiAgLy8gcmV2ZXJiIGxldmVsLCBuZWVkZWQgYmVjYXVzZSBzb21lIGJyb3dzZXJzIGRvbid0IHN1cHBvcnQgcmVhZGluZyBvZiBnYWluIHZhbHVlcywgc2VlIG1ldGhvZHMgZm9yIG1vcmUgaW5mb1xyXG4gIHByaXZhdGUgX3JldmVyYkxldmVsOiBudW1iZXI7XHJcblxyXG4gIC8vIEEgbWFwIG9mIGNhdGVnb3J5IG5hbWVzIHRvIEdhaW5Ob2RlIGluc3RhbmNlcyB0aGF0IGNvbnRyb2wgZ2FpbnMgZm9yIHRoYXQgY2F0ZWdvcnkgbmFtZS4gIFRoaXMgZmlsbGVkIGluIGR1cmluZ1xyXG4gIC8vIGluaXRpYWxpemF0aW9uLCBzZWUgdGhlIHVzYWdlIG9mIG9wdGlvbnMuY2F0ZWdvcmllcyBpbiB0aGUgaW5pdGlhbGl6ZSBmdW5jdGlvbiBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICBwcml2YXRlIHJlYWRvbmx5IGdhaW5Ob2Rlc0ZvckNhdGVnb3JpZXM6IE1hcDxzdHJpbmcsIEdhaW5Ob2RlPjtcclxuXHJcbiAgLy8gYW4gYXJyYXkgb2YgcHJvcGVydGllcyB3aGVyZSwgaWYgYW55IG9mIHRoZXNlIGFyZSB0cnVlLCBvdmVyYWxsIG91dHB1dCBsZXZlbCBpcyBcImR1Y2tlZFwiIChpLmUuIHJlZHVjZWQpXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkdWNraW5nUHJvcGVydGllczogT2JzZXJ2YWJsZUFycmF5PFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+PjtcclxuXHJcbiAgLy8gZmxhZyB0aGF0IHRyYWNrcyB3aGV0aGVyIHRoZSBzb25pZmljYXRpb24gbWFuYWdlciBoYXMgYmVlbiBpbml0aWFsaXplZCwgc2hvdWxkIG5ldmVyIGJlIHNldCBvdXRzaWRlIHRoaXMgZmlsZVxyXG4gIHB1YmxpYyBpbml0aWFsaXplZDogYm9vbGVhbjtcclxuXHJcbiAgLy8gc291bmQgZ2VuZXJhdG9ycyB0aGF0IGFyZSBxdWV1ZWQgdXAgaWYgYXR0ZW1wdHMgYXJlIG1hZGUgdG8gYWRkIHRoZW0gYmVmb3JlIGluaXRpYWxpemF0aW9uIGhhcyBvY2N1cnJlZFxyXG4gIHByaXZhdGUgcmVhZG9ubHkgc291bmRHZW5lcmF0b3JzQXdhaXRpbmdBZGQ6IFNvdW5kR2VuZXJhdG9yQXdhaXRpbmdBZGRbXTtcclxuXHJcbiAgLy8gYXVkaW8gbm9kZXMgdGhhdCBhcmUgdXNlZCBpbiB0aGUgc2lnbmFsIGNoYWluIGJldHdlZW4gc291bmQgZ2VuZXJhdG9ycyBhbmQgdGhlIGF1ZGlvIGNvbnRleHQgZGVzdGluYXRpb25cclxuICBwcml2YXRlIG1hc3RlckdhaW5Ob2RlOiBHYWluTm9kZSB8IG51bGw7XHJcbiAgcHJpdmF0ZSBjb252b2x2ZXI6IENvbnZvbHZlck5vZGUgfCBudWxsO1xyXG4gIHByaXZhdGUgcmV2ZXJiR2Fpbk5vZGU6IEdhaW5Ob2RlIHwgbnVsbDtcclxuICBwcml2YXRlIGRyeUdhaW5Ob2RlOiBHYWluTm9kZSB8IG51bGw7XHJcbiAgcHJpdmF0ZSBkdWNraW5nR2Fpbk5vZGU6IEdhaW5Ob2RlIHwgbnVsbDtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwbGF5ZWRQcm9wZXJ0eU1hcCA9IG5ldyBNYXA8U291bmRHZW5lcmF0b3IsIERpc3BsYXllZFByb3BlcnR5PigpO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhbmRlbTogVGFuZGVtID0gVGFuZGVtLk9QVElPTkFMICkge1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLFxyXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdDb250cm9scyB0aGUgc2ltdWxhdGlvblxcJ3Mgc291bmQuIEZvciBzaW1zIHRoYXQgZG8gbm90IHN1cHBvcnQgc291bmQsIHRoaXMgZWxlbWVudCBhbmQgJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICdpdHMgY2hpbGRyZW4gY2FuIGJlIGlnbm9yZWQuJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZW5hYmxlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5zdXBwb3J0c1NvdW5kLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VuYWJsZWRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlLCAvLyBUaGlzIGlzIGEgcHJlZmVyZW5jZSwgZ2xvYmFsIHNvdW5kIGNvbnRyb2wgaXMgaGFuZGxlZCBieSB0aGUgYXVkaW9NYW5hZ2VyXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdEZXRlcm1pbmVzIHdoZXRoZXIgc291bmQgaXMgZW5hYmxlZC4gU3VwcG9ydGVkIG9ubHkgaWYgdGhpcyBzaW0gc3VwcG9ydHNTb3VuZD10cnVlLidcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmV4dHJhU291bmRFbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmV4dHJhU291bmRJbml0aWFsbHlFbmFibGVkLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2V4dHJhU291bmRFbmFibGVkUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZSwgLy8gVGhpcyBpcyBhIHByZWZlcmVuY2UsIGdsb2JhbCBzb3VuZCBjb250cm9sIGlzIGhhbmRsZWQgYnkgdGhlIGF1ZGlvTWFuYWdlclxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRGV0ZXJtaW5lcyB3aGV0aGVyIGV4dHJhIHNvdW5kIGlzIGVuYWJsZWQuIEV4dHJhIHNvdW5kIGlzIGFkZGl0aW9uYWwgc291bmRzIHRoYXQgJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICdjYW4gc2VydmUgdG8gaW1wcm92ZSB0aGUgbGVhcm5pbmcgZXhwZXJpZW5jZSBmb3IgaW5kaXZpZHVhbHMgd2l0aCB2aXN1YWwgZGlzYWJpbGl0aWVzLiAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ05vdGUgdGhhdCBub3QgYWxsIHNpbXVsYXRpb25zIHRoYXQgc3VwcG9ydCBzb3VuZCBhbHNvIHN1cHBvcnQgZXh0cmEgc291bmQuIEFsc28gbm90ZSAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RoYXQgdGhlIHZhbHVlIGlzIGlycmVsZXZhbnQgd2hlbiBlbmFibGVkUHJvcGVydHkgaXMgZmFsc2UuJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuc291bmRHZW5lcmF0b3JJbmZvQXJyYXkgPSBbXTtcclxuICAgIHRoaXMuX21hc3Rlck91dHB1dExldmVsID0gMTtcclxuICAgIHRoaXMuX3JldmVyYkxldmVsID0gREVGQVVMVF9SRVZFUkJfTEVWRUw7XHJcbiAgICB0aGlzLmdhaW5Ob2Rlc0ZvckNhdGVnb3JpZXMgPSBuZXcgTWFwPHN0cmluZywgR2Fpbk5vZGU+KCk7XHJcbiAgICB0aGlzLmR1Y2tpbmdQcm9wZXJ0aWVzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcbiAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgICB0aGlzLnNvdW5kR2VuZXJhdG9yc0F3YWl0aW5nQWRkID0gW107XHJcbiAgICB0aGlzLm1hc3RlckdhaW5Ob2RlID0gbnVsbDtcclxuICAgIHRoaXMuZHVja2luZ0dhaW5Ob2RlID0gbnVsbDtcclxuICAgIHRoaXMuY29udm9sdmVyID0gbnVsbDtcclxuICAgIHRoaXMucmV2ZXJiR2Fpbk5vZGUgPSBudWxsO1xyXG4gICAgdGhpcy5kcnlHYWluTm9kZSA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplIHRoZSBzb25pZmljYXRpb24gbWFuYWdlci4gVGhpcyBmdW5jdGlvbiBtdXN0IGJlIGludm9rZWQgYmVmb3JlIGFueSBzb3VuZCBnZW5lcmF0b3JzIGNhbiBiZSBhZGRlZC5cclxuICAgKi9cclxuICBwdWJsaWMgaW5pdGlhbGl6ZSggc2ltQ29uc3RydWN0aW9uQ29tcGxldGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgIGF1ZGlvRW5hYmxlZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgc2ltVmlzaWJsZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgc2ltQWN0aXZlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+LFxyXG4gICAgICAgICAgICAgICAgICAgICBzaW1TZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IFNvdW5kR2VuZXJhdG9ySW5pdGlhbGl6YXRpb25PcHRpb25zICk6IHZvaWQge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmluaXRpYWxpemVkLCAnY2FuXFwndCBpbml0aWFsaXplIHRoZSBzb3VuZCBtYW5hZ2VyIG1vcmUgdGhhbiBvbmNlJyApO1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U291bmRHZW5lcmF0b3JJbml0aWFsaXphdGlvbk9wdGlvbnMsIFNvdW5kR2VuZXJhdG9ySW5pdGlhbGl6YXRpb25PcHRpb25zPigpKCB7XHJcbiAgICAgIGNhdGVnb3JpZXM6IFsgJ3NpbS1zcGVjaWZpYycsICd1c2VyLWludGVyZmFjZScgXVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gb3B0aW9ucyB2YWxpZGF0aW9uXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KFxyXG4gICAgICBvcHRpb25zLmNhdGVnb3JpZXMubGVuZ3RoID09PSBfLnVuaXEoIG9wdGlvbnMuY2F0ZWdvcmllcyApLmxlbmd0aCxcclxuICAgICAgJ2NhdGVnb3JpZXMgbXVzdCBiZSB1bmlxdWUnXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IG5vdyA9IHBoZXRBdWRpb0NvbnRleHQuY3VycmVudFRpbWU7XHJcblxyXG4gICAgLy8gVGhlIGZpbmFsIHN0YWdlIGlzIGEgZHluYW1pY3MgY29tcHJlc3NvciB0aGF0IGlzIHVzZWQgZXNzZW50aWFsbHkgYXMgYSBsaW1pdGVyIHRvIHByZXZlbnQgY2xpcHBpbmcuXHJcbiAgICBjb25zdCBkeW5hbWljc0NvbXByZXNzb3IgPSBwaGV0QXVkaW9Db250ZXh0LmNyZWF0ZUR5bmFtaWNzQ29tcHJlc3NvcigpO1xyXG4gICAgZHluYW1pY3NDb21wcmVzc29yLnRocmVzaG9sZC5zZXRWYWx1ZUF0VGltZSggLTYsIG5vdyApO1xyXG4gICAgZHluYW1pY3NDb21wcmVzc29yLmtuZWUuc2V0VmFsdWVBdFRpbWUoIDUsIG5vdyApO1xyXG4gICAgZHluYW1pY3NDb21wcmVzc29yLnJhdGlvLnNldFZhbHVlQXRUaW1lKCAxMiwgbm93ICk7XHJcbiAgICBkeW5hbWljc0NvbXByZXNzb3IuYXR0YWNrLnNldFZhbHVlQXRUaW1lKCAwLCBub3cgKTtcclxuICAgIGR5bmFtaWNzQ29tcHJlc3Nvci5yZWxlYXNlLnNldFZhbHVlQXRUaW1lKCAwLjI1LCBub3cgKTtcclxuICAgIGR5bmFtaWNzQ29tcHJlc3Nvci5jb25uZWN0KCBwaGV0QXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBkdWNraW5nIGdhaW4gbm9kZSwgd2hpY2ggaXMgdXNlZCB0byByZWR1Y2UgdGhlIG92ZXJhbGwgc291bmQgb3V0cHV0IGxldmVsIHRlbXBvcmFyaWx5IGluIGNlcnRhaW5cclxuICAgIC8vIHNpdHVhdGlvbnMsIHN1Y2ggYXMgd2hlbiB0aGUgdm9pY2luZyBmZWF0dXJlIGlzIGFjdGl2ZWx5IHByb2R1Y2luZyBzcGVlY2guXHJcbiAgICB0aGlzLmR1Y2tpbmdHYWluTm9kZSA9IHBoZXRBdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xyXG4gICAgdGhpcy5kdWNraW5nR2Fpbk5vZGUuY29ubmVjdCggZHluYW1pY3NDb21wcmVzc29yICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBtYXN0ZXIgZ2FpbiBub2RlIGZvciBhbGwgc291bmRzIG1hbmFnZWQgYnkgdGhpcyBzb25pZmljYXRpb24gbWFuYWdlci5cclxuICAgIHRoaXMubWFzdGVyR2Fpbk5vZGUgPSBwaGV0QXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcclxuICAgIHRoaXMubWFzdGVyR2Fpbk5vZGUuY29ubmVjdCggdGhpcy5kdWNraW5nR2Fpbk5vZGUgKTtcclxuXHJcbiAgICAvLyBTZXQgdXAgYSBjb252b2x2ZXIgbm9kZSwgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIGNyZWF0ZSB0aGUgcmV2ZXJiIGVmZmVjdC5cclxuICAgIHRoaXMuY29udm9sdmVyID0gcGhldEF1ZGlvQ29udGV4dC5jcmVhdGVDb252b2x2ZXIoKTtcclxuICAgIGNvbnN0IHNldENvbnZvbHZlckJ1ZmZlcjogUHJvcGVydHlMaW5rTGlzdGVuZXI8QXVkaW9CdWZmZXIgfCBudWxsPiA9IGF1ZGlvQnVmZmVyID0+IHtcclxuICAgICAgaWYgKCBhdWRpb0J1ZmZlciApIHtcclxuICAgICAgICB0aGlzLmNvbnZvbHZlciEuYnVmZmVyID0gYXVkaW9CdWZmZXI7XHJcbiAgICAgICAgZW1wdHlBcGFydG1lbnRCZWRyb29tMDZSZXNhbXBsZWRfbXAzLmF1ZGlvQnVmZmVyUHJvcGVydHkudW5saW5rKCBzZXRDb252b2x2ZXJCdWZmZXIgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGVtcHR5QXBhcnRtZW50QmVkcm9vbTA2UmVzYW1wbGVkX21wMy5hdWRpb0J1ZmZlclByb3BlcnR5LmxpbmsoIHNldENvbnZvbHZlckJ1ZmZlciApO1xyXG5cclxuICAgIC8vIGdhaW4gbm9kZSB0aGF0IHdpbGwgY29udHJvbCB0aGUgcmV2ZXJiIGxldmVsXHJcbiAgICB0aGlzLnJldmVyYkdhaW5Ob2RlID0gcGhldEF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XHJcbiAgICB0aGlzLnJldmVyYkdhaW5Ob2RlLmNvbm5lY3QoIHRoaXMubWFzdGVyR2Fpbk5vZGUgKTtcclxuICAgIHRoaXMucmV2ZXJiR2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSggdGhpcy5fcmV2ZXJiTGV2ZWwsIHBoZXRBdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKTtcclxuICAgIHRoaXMuY29udm9sdmVyLmNvbm5lY3QoIHRoaXMucmV2ZXJiR2Fpbk5vZGUgKTtcclxuXHJcbiAgICAvLyBkcnkgKG5vbi1yZXZlcmJlZCkgcG9ydGlvbiBvZiB0aGUgb3V0cHV0XHJcbiAgICB0aGlzLmRyeUdhaW5Ob2RlID0gcGhldEF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XHJcbiAgICB0aGlzLmRyeUdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoIDEgLSB0aGlzLl9yZXZlcmJMZXZlbCwgcGhldEF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSApO1xyXG4gICAgdGhpcy5kcnlHYWluTm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKFxyXG4gICAgICAxIC0gdGhpcy5fcmV2ZXJiTGV2ZWwsXHJcbiAgICAgIHBoZXRBdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyBMSU5FQVJfR0FJTl9DSEFOR0VfVElNRVxyXG4gICAgKTtcclxuICAgIHRoaXMuZHJ5R2Fpbk5vZGUuY29ubmVjdCggdGhpcy5tYXN0ZXJHYWluTm9kZSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgaG9vayB1cCBnYWluIG5vZGVzIGZvciBlYWNoIG9mIHRoZSBkZWZpbmVkIGNhdGVnb3JpZXMuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmNvbnZvbHZlciAhPT0gbnVsbCAmJiB0aGlzLmRyeUdhaW5Ob2RlICE9PSBudWxsLCAnc29tZSBhdWRpbyBub2RlcyBoYXZlIG5vdCBiZWVuIGluaXRpYWxpemVkJyApO1xyXG4gICAgb3B0aW9ucy5jYXRlZ29yaWVzLmZvckVhY2goIGNhdGVnb3J5TmFtZSA9PiB7XHJcbiAgICAgIGNvbnN0IGdhaW5Ob2RlID0gcGhldEF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XHJcbiAgICAgIGdhaW5Ob2RlLmNvbm5lY3QoIHRoaXMuY29udm9sdmVyISApO1xyXG4gICAgICBnYWluTm9kZS5jb25uZWN0KCB0aGlzLmRyeUdhaW5Ob2RlISApO1xyXG4gICAgICB0aGlzLmdhaW5Ob2Rlc0ZvckNhdGVnb3JpZXMuc2V0KCBjYXRlZ29yeU5hbWUsIGdhaW5Ob2RlICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSG9vayB1cCBhIGxpc3RlbmVyIHRoYXQgdHVybnMgZG93biB0aGUgbWFzdGVyIGdhaW4gaWYgc29uaWZpY2F0aW9uIGlzIGRpc2FibGVkIG9yIGlmIHRoZSBzaW0gaXNuJ3QgdmlzaWJsZSBvclxyXG4gICAgLy8gaXNuJ3QgYWN0aXZlLlxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgW1xyXG4gICAgICAgIHRoaXMuZW5hYmxlZFByb3BlcnR5LFxyXG4gICAgICAgIGF1ZGlvRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgICAgIHNpbUNvbnN0cnVjdGlvbkNvbXBsZXRlUHJvcGVydHksXHJcbiAgICAgICAgc2ltVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICAgIHNpbUFjdGl2ZVByb3BlcnR5LFxyXG4gICAgICAgIHNpbVNldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5XHJcbiAgICAgIF0sXHJcbiAgICAgICggZW5hYmxlZCwgYXVkaW9FbmFibGVkLCBzaW1Jbml0Q29tcGxldGUsIHNpbVZpc2libGUsIHNpbUFjdGl2ZSwgc2ltU2V0dGluZ1BoZXRpb1N0YXRlICkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBmdWxseUVuYWJsZWQgPSBlbmFibGVkICYmIGF1ZGlvRW5hYmxlZCAmJiBzaW1Jbml0Q29tcGxldGUgJiYgc2ltVmlzaWJsZSAmJiBzaW1BY3RpdmUgJiYgIXNpbVNldHRpbmdQaGV0aW9TdGF0ZTtcclxuICAgICAgICBjb25zdCBnYWluID0gZnVsbHlFbmFibGVkID8gdGhpcy5fbWFzdGVyT3V0cHV0TGV2ZWwgOiAwO1xyXG5cclxuICAgICAgICAvLyBTZXQgdGhlIGdhaW4sIGJ1dCBzb21ld2hhdCBncmFkdWFsbHkgaW4gb3JkZXIgdG8gYXZvaWQgcmFwaWQgdHJhbnNpZW50cywgd2hpY2ggY2FuIHNvdW5kIGxpa2UgY2xpY2tzLlxyXG4gICAgICAgIHRoaXMubWFzdGVyR2Fpbk5vZGUhLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoXHJcbiAgICAgICAgICBnYWluLFxyXG4gICAgICAgICAgcGhldEF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIExJTkVBUl9HQUlOX0NIQU5HRV9USU1FXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBkdWNrTWFpbk91dHB1dExldmVsUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIERlZmluZSBhIGxpc3RlbmVyIHRoYXQgd2lsbCB1cGRhdGUgdGhlIHN0YXRlIG9mIHRoZSBjb2xsZWN0aXZlIGR1Y2tpbmcgUHJvcGVydHkgdGhhdCBpbmRpY2F0ZXMgd2hldGhlciBkdWNraW5nXHJcbiAgICAvLyAob3ZlcmFsbCB2b2x1bWUgcmVkdWN0aW9uIHRvIHByZXZlbnQgb3ZlcmxhcCB3aXRoIG90aGVyIHNvdW5kcykgc2hvdWxkIGJlIGFjdGl2ZSBvciBpbmFjdGl2ZS5cclxuICAgIGNvbnN0IHVwZGF0ZUR1Y2tpbmdTdGF0ZSA9ICgpID0+IHtcclxuXHJcbiAgICAgIC8vIFJlZHVjZSB0aGUgYXJyYXkgb2YgaW5kaXZpZHVhbCBkdWNraW5nIFByb3BlcnRpZXMgYXJyYXkgdG8gYSBzaW5nbGUgYm9vbGVhbiB2YWx1ZS5cclxuICAgICAgZHVja01haW5PdXRwdXRMZXZlbFByb3BlcnR5LnZhbHVlID0gdGhpcy5kdWNraW5nUHJvcGVydGllcy5yZWR1Y2UoXHJcbiAgICAgICAgKCB2YWx1ZVNvRmFyLCBjdXJyZW50UHJvcGVydHkgKSA9PiB2YWx1ZVNvRmFyIHx8IGN1cnJlbnRQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICBmYWxzZVxyXG4gICAgICApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBJbXBsZW1lbnQgZHVja2luZyBvZiB0aGUgbWFpbiBvdXRwdXQuXHJcbiAgICBkdWNrTWFpbk91dHB1dExldmVsUHJvcGVydHkubGF6eUxpbmsoIGR1Y2tPdXRwdXQgPT4ge1xyXG5cclxuICAgICAgLy8gU3RhdGUgY2hlY2tpbmcgLSBtYWtlIHN1cmUgdGhlIGR1Y2tpbmcgZ2FpbiBub2RlIGV4aXN0cy5cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5kdWNraW5nR2Fpbk5vZGUsICdkdWNraW5nIGxpc3RlbmVyIGZpcmVkLCBidXQgbm8gZHVja2luZyBnYWluIG5vZGUgZXhpc3RzJyApO1xyXG5cclxuICAgICAgLy8gVXNlIHRpbWUgY29uc3RhbnQgdmFsdWVzIHRoYXQgd2lsbCB0dXJuIGRvd24gdGhlIG91dHB1dCBsZXZlbCBmYXN0ZXIgdGhhbiBpdCB3aWxsIHR1cm4gaXQgdXAuICBUaGlzIHNvdW5kc1xyXG4gICAgICAvLyBiZXR0ZXIsIHNpbmNlIGl0IHByZXZlbnRzIG92ZXJsYXAgd2l0aCB0aGUgdm9pY2UuXHJcbiAgICAgIGNvbnN0IHRpbWVDb25zdGFudCA9IGR1Y2tPdXRwdXQgPyAwLjA1IDogMC41O1xyXG5cclxuICAgICAgLy8gRHVjayBvciBkb24ndC5cclxuICAgICAgY29uc3Qgbm93ID0gcGhldEF1ZGlvQ29udGV4dC5jdXJyZW50VGltZTtcclxuICAgICAgdGhpcy5kdWNraW5nR2Fpbk5vZGU/LmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKCBub3cgKTtcclxuICAgICAgdGhpcy5kdWNraW5nR2Fpbk5vZGU/LmdhaW4uc2V0VGFyZ2V0QXRUaW1lKCBkdWNrT3V0cHV0ID8gQVVESU9fRFVDS0lOR19MRVZFTCA6IDEsIG5vdywgdGltZUNvbnN0YW50ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSGFuZGxlIHRoZSBhZGRpbmcgYW5kIHJlbW92YWwgb2YgaW5kaXZpZHVhbCBkdWNraW5nIFByb3BlcnRpZXMuXHJcbiAgICB0aGlzLmR1Y2tpbmdQcm9wZXJ0aWVzLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCBhZGRlZER1Y2tpbmdQcm9wZXJ0eSA9PiB7XHJcbiAgICAgIGFkZGVkRHVja2luZ1Byb3BlcnR5LmxpbmsoIHVwZGF0ZUR1Y2tpbmdTdGF0ZSApO1xyXG4gICAgICBjb25zdCBjaGVja0FuZFJlbW92ZSA9ICggcmVtb3ZlZER1Y2tpbmdQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4gKSA9PiB7XHJcbiAgICAgICAgaWYgKCByZW1vdmVkRHVja2luZ1Byb3BlcnR5ID09PSBhZGRlZER1Y2tpbmdQcm9wZXJ0eSApIHtcclxuICAgICAgICAgIHJlbW92ZWREdWNraW5nUHJvcGVydHkudW5saW5rKCB1cGRhdGVEdWNraW5nU3RhdGUgKTtcclxuICAgICAgICAgIHRoaXMuZHVja2luZ1Byb3BlcnRpZXMucmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lciggY2hlY2tBbmRSZW1vdmUgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIHRoaXMuZHVja2luZ1Byb3BlcnRpZXMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggY2hlY2tBbmRSZW1vdmUgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gSGFuZGxlIHRoZSBhdWRpbyBjb250ZXh0IHN0YXRlLCBib3RoIHdoZW4gY2hhbmdlcyBvY2N1ciBhbmQgd2hlbiBpdCBpcyBpbml0aWFsbHkgbXV0ZWQgZHVlIHRvIHRoZSBhdXRvcGxheVxyXG4gICAgLy8gcG9saWN5LiAgQXMgb2YgdGhpcyB3cml0aW5nIChGZWIgMjAxOSksIHRoZXJlIGFyZSBzb21lIGRpZmZlcmVuY2VzIGluIGhvdyB0aGUgYXVkaW8gY29udGV4dCBzdGF0ZSBiZWhhdmVzIG9uXHJcbiAgICAvLyBkaWZmZXJlbnQgcGxhdGZvcm1zLCBzbyB0aGUgY29kZSBtb25pdG9ycyBkaWZmZXJlbnQgZXZlbnRzIGFuZCBzdGF0ZXMgdG8ga2VlcCB0aGUgYXVkaW8gY29udGV4dCBydW5uaW5nLiAgQXMgdGhlXHJcbiAgICAvLyBiZWhhdmlvciBvZiB0aGUgYXVkaW8gY29udGV4dCBiZWNvbWVzIG1vcmUgY29uc2lzdGVudCBhY3Jvc3MgYnJvd3NlcnMsIGl0IG1heSBiZSBwb3NzaWJsZSB0byBzaW1wbGlmeSB0aGlzLlxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBmdW5jdGlvbiB0byByZW1vdmUgdGhlIHVzZXIgaW50ZXJhY3Rpb24gbGlzdGVuZXJzLCB1c2VkIHRvIGF2b2lkIGNvZGUgZHVwbGljYXRpb25cclxuICAgIGNvbnN0IHJlbW92ZVVzZXJJbnRlcmFjdGlvbkxpc3RlbmVycyA9ICgpID0+IHtcclxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0JywgcmVzdW1lQXVkaW9Db250ZXh0LCBmYWxzZSApO1xyXG4gICAgICBpZiAoIERpc3BsYXkudXNlckdlc3R1cmVFbWl0dGVyLmhhc0xpc3RlbmVyKCByZXN1bWVBdWRpb0NvbnRleHQgKSApIHtcclxuICAgICAgICBEaXNwbGF5LnVzZXJHZXN0dXJlRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggcmVzdW1lQXVkaW9Db250ZXh0ICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gbGlzdGVuZXIgdGhhdCByZXN1bWVzIHRoZSBhdWRpbyBjb250ZXh0XHJcbiAgICBjb25zdCByZXN1bWVBdWRpb0NvbnRleHQgPSAoKSA9PiB7XHJcblxyXG4gICAgICBpZiAoIHBoZXRBdWRpb0NvbnRleHQuc3RhdGUgIT09ICdydW5uaW5nJyApIHtcclxuXHJcbiAgICAgICAgcGhldC5sb2cgJiYgcGhldC5sb2coIGBhdWRpbyBjb250ZXh0IG5vdCBydW5uaW5nLCBhdHRlbXB0aW5nIHRvIHJlc3VtZSwgc3RhdGUgPSAke3BoZXRBdWRpb0NvbnRleHQuc3RhdGV9YCApO1xyXG5cclxuICAgICAgICAvLyB0ZWxsIHRoZSBhdWRpbyBjb250ZXh0IHRvIHJlc3VtZVxyXG4gICAgICAgIHBoZXRBdWRpb0NvbnRleHQucmVzdW1lKClcclxuICAgICAgICAgIC50aGVuKCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHBoZXQubG9nICYmIHBoZXQubG9nKCBgcmVzdW1lIGFwcGVhcnMgdG8gaGF2ZSBzdWNjZWVkZWQsIHBoZXRBdWRpb0NvbnRleHQuc3RhdGUgPSAke3BoZXRBdWRpb0NvbnRleHQuc3RhdGV9YCApO1xyXG4gICAgICAgICAgICByZW1vdmVVc2VySW50ZXJhY3Rpb25MaXN0ZW5lcnMoKTtcclxuICAgICAgICAgIH0gKVxyXG4gICAgICAgICAgLmNhdGNoKCBlcnIgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgZXJyb3Igd2hlbiB0cnlpbmcgdG8gcmVzdW1lIGF1ZGlvIGNvbnRleHQsIGVyciA9ICR7ZXJyfWA7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIGVycm9yTWVzc2FnZSApO1xyXG4gICAgICAgICAgICBhc3NlcnQgJiYgYWxlcnQoIGVycm9yTWVzc2FnZSApO1xyXG4gICAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBhdWRpbyBjb250ZXh0IGlzIGFscmVhZHkgcnVubmluZywgbm8gbmVlZCB0byBsaXN0ZW4gYW55bW9yZVxyXG4gICAgICAgIHJlbW92ZVVzZXJJbnRlcmFjdGlvbkxpc3RlbmVycygpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGxpc3RlbiBmb3IgYSB0b3VjaHN0YXJ0IC0gdGhpcyBvbmx5IHdvcmtzIHRvIHJlc3VtZSB0aGUgYXVkaW8gY29udGV4dCBvbiBpT1MgZGV2aWNlcyAoYXMgb2YgdGhpcyB3cml0aW5nKVxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0JywgcmVzdW1lQXVkaW9Db250ZXh0LCBmYWxzZSApO1xyXG5cclxuICAgIC8vIGxpc3RlbiBmb3Igb3RoZXIgdXNlciBnZXN0dXJlIGV2ZW50c1xyXG4gICAgRGlzcGxheS51c2VyR2VzdHVyZUVtaXR0ZXIuYWRkTGlzdGVuZXIoIHJlc3VtZUF1ZGlvQ29udGV4dCApO1xyXG5cclxuICAgIC8vIER1cmluZyB0ZXN0aW5nLCBzZXZlcmFsIHVzZSBjYXNlcyB3ZXJlIGZvdW5kIHdoZXJlIHRoZSBhdWRpbyBjb250ZXh0IHN0YXRlIGNoYW5nZXMgdG8gc29tZXRoaW5nIG90aGVyIHRoYW4gdGhlXHJcbiAgICAvLyBcInJ1bm5pbmdcIiBzdGF0ZSB3aGlsZSB0aGUgc2ltIGlzIGluIHVzZSAoZ2VuZXJhbGx5IGVpdGhlciBcInN1c3BlbmRlZFwiIG9yIFwiaW50ZXJydXB0ZWRcIiwgZGVwZW5kaW5nIG9uIHRoZVxyXG4gICAgLy8gYnJvd3NlcikuICBUaGUgZm9sbG93aW5nIGNvZGUgaXMgaW50ZW5kZWQgdG8gaGFuZGxlIHRoaXMgc2l0dWF0aW9uIGJ5IHRyeWluZyB0byByZXN1bWUgaXQgcmlnaHQgYXdheS4gIEdpdEh1YlxyXG4gICAgLy8gaXNzdWVzIHdpdGggZGV0YWlscyBhYm91dCB3aHkgdGhpcyBpcyBuZWNlc3NhcnkgYXJlOlxyXG4gICAgLy8gLSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdGFtYm8vaXNzdWVzLzU4XHJcbiAgICAvLyAtIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YW1iby9pc3N1ZXMvNTlcclxuICAgIC8vIC0gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ZyYWN0aW9ucy1jb21tb24vaXNzdWVzLzgyXHJcbiAgICAvLyAtIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mcmljdGlvbi9pc3N1ZXMvMTczXHJcbiAgICAvLyAtIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9yZXNpc3RhbmNlLWluLWEtd2lyZS9pc3N1ZXMvMTkwXHJcbiAgICAvLyAtIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YW1iby9pc3N1ZXMvOTBcclxuICAgIGxldCBwcmV2aW91c0F1ZGlvQ29udGV4dFN0YXRlOiBBdWRpb0NvbnRleHRTdGF0ZSA9IHBoZXRBdWRpb0NvbnRleHQuc3RhdGU7XHJcbiAgICBhdWRpb0NvbnRleHRTdGF0ZUNoYW5nZU1vbml0b3IuYWRkU3RhdGVDaGFuZ2VMaXN0ZW5lciggcGhldEF1ZGlvQ29udGV4dCwgKCBzdGF0ZTogQXVkaW9Db250ZXh0U3RhdGUgKSA9PiB7XHJcblxyXG4gICAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyhcclxuICAgICAgICBgYXVkaW8gY29udGV4dCBzdGF0ZSBjaGFuZ2VkLCBvbGQgc3RhdGUgPSAke1xyXG4gICAgICAgICAgcHJldmlvdXNBdWRpb0NvbnRleHRTdGF0ZVxyXG4gICAgICAgIH0sIG5ldyBzdGF0ZSA9ICR7XHJcbiAgICAgICAgICBzdGF0ZVxyXG4gICAgICAgIH0sIGF1ZGlvIGNvbnRleHQgdGltZSA9ICR7XHJcbiAgICAgICAgICBwaGV0QXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lfWBcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGlmICggc3RhdGUgIT09ICdydW5uaW5nJyApIHtcclxuXHJcbiAgICAgICAgLy8gQWRkIGEgbGlzdGVuZXIgdGhhdCB3aWxsIHJlc3VtZSB0aGUgYXVkaW8gY29udGV4dCBvbiB0aGUgbmV4dCB0b3VjaHN0YXJ0LlxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIHJlc3VtZUF1ZGlvQ29udGV4dCwgZmFsc2UgKTtcclxuXHJcbiAgICAgICAgLy8gTGlzdGVuIGFsc28gZm9yIG90aGVyIHVzZXIgZ2VzdHVyZSBldmVudHMgdGhhdCBjYW4gYmUgdXNlZCB0byByZXN1bWUgdGhlIGF1ZGlvIGNvbnRleHQuXHJcbiAgICAgICAgaWYgKCAhRGlzcGxheS51c2VyR2VzdHVyZUVtaXR0ZXIuaGFzTGlzdGVuZXIoIHJlc3VtZUF1ZGlvQ29udGV4dCApICkge1xyXG4gICAgICAgICAgRGlzcGxheS51c2VyR2VzdHVyZUVtaXR0ZXIuYWRkTGlzdGVuZXIoIHJlc3VtZUF1ZGlvQ29udGV4dCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBjb25zb2xlLmxvZyggJ0F1ZGlvQ29udGV4dCBpcyBub3cgcnVubmluZy4nICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHByZXZpb3VzQXVkaW9Db250ZXh0U3RhdGUgPSBzdGF0ZTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBBZGQgYW55IHNvdW5kIGdlbmVyYXRvcnMgdGhhdCB3ZXJlIHdhaXRpbmcgZm9yIGluaXRpYWxpemF0aW9uIHRvIGNvbXBsZXRlIChtdXN0IGJlIGRvbmUgYWZ0ZXIgaW5pdCBjb21wbGV0ZSkuXHJcbiAgICB0aGlzLnNvdW5kR2VuZXJhdG9yc0F3YWl0aW5nQWRkLmZvckVhY2goIHNvdW5kR2VuZXJhdG9yQXdhaXRpbmdBZGQgPT4ge1xyXG4gICAgICB0aGlzLmFkZFNvdW5kR2VuZXJhdG9yKFxyXG4gICAgICAgIHNvdW5kR2VuZXJhdG9yQXdhaXRpbmdBZGQuc291bmRHZW5lcmF0b3IsXHJcbiAgICAgICAgc291bmRHZW5lcmF0b3JBd2FpdGluZ0FkZC5zb3VuZEdlbmVyYXRvckFkZE9wdGlvbnNcclxuICAgICAgKTtcclxuICAgIH0gKTtcclxuICAgIHRoaXMuc291bmRHZW5lcmF0b3JzQXdhaXRpbmdBZGQubGVuZ3RoID0gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIHNvdW5kR2VuZXJhdG9yIGhhcyBiZWVuIHByZXZpb3VzbHkgYWRkZWQgdG8gdGhlIHNvdW5kTWFuYWdlci5cclxuICAgKi9cclxuICBwdWJsaWMgaGFzU291bmRHZW5lcmF0b3IoIHNvdW5kR2VuZXJhdG9yOiBTb3VuZEdlbmVyYXRvciApOiBib29sZWFuIHtcclxuICAgIHJldHVybiBfLnNvbWUoXHJcbiAgICAgIHRoaXMuc291bmRHZW5lcmF0b3JJbmZvQXJyYXksXHJcbiAgICAgIHNvdW5kR2VuZXJhdG9ySW5mbyA9PiBzb3VuZEdlbmVyYXRvckluZm8uc291bmRHZW5lcmF0b3IgPT09IHNvdW5kR2VuZXJhdG9yXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGEgc291bmQgZ2VuZXJhdG9yLiAgVGhpcyBjb25uZWN0cyB0aGUgc291bmQgZ2VuZXJhdG9yIHRvIHRoZSBhdWRpbyBwYXRoLCBwdXRzIGl0IG9uIHRoZSBsaXN0IG9mIHNvdW5kXHJcbiAgICogZ2VuZXJhdG9ycywgYW5kIGNyZWF0ZXMgYW5kIHJldHVybnMgYSB1bmlxdWUgSUQuXHJcbiAgICovXHJcbiAgcHVibGljIGFkZFNvdW5kR2VuZXJhdG9yKCBzb3VuZEdlbmVyYXRvcjogU291bmRHZW5lcmF0b3IsIHByb3ZpZGVkT3B0aW9ucz86IFNvdW5kR2VuZXJhdG9yQWRkT3B0aW9ucyApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBXZSdsbCBuZWVkIGFuIGVtcHR5IG9iamVjdCBvZiBubyBvcHRpb25zIHdlcmUgcHJvdmlkZWQuXHJcbiAgICBpZiAoIHByb3ZpZGVkT3B0aW9ucyA9PT0gdW5kZWZpbmVkICkge1xyXG4gICAgICBwcm92aWRlZE9wdGlvbnMgPSB7fTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBpZiBpbml0aWFsaXphdGlvbiBoYXMgYmVlbiBkb25lIGFuZCwgaWYgbm90LCBxdWV1ZSB0aGUgc291bmQgZ2VuZXJhdG9yIGFuZCBpdHMgb3B0aW9ucyBmb3IgYWRkaXRpb25cclxuICAgIC8vIG9uY2UgaW5pdGlhbGl6YXRpb24gaXMgY29tcGxldGUuICBOb3RlIHRoYXQgd2hlbiBzb3VuZCBpcyBub3Qgc3VwcG9ydGVkLCBpbml0aWFsaXphdGlvbiB3aWxsIG5ldmVyIG9jY3VyLlxyXG4gICAgaWYgKCAhdGhpcy5pbml0aWFsaXplZCApIHtcclxuICAgICAgdGhpcy5zb3VuZEdlbmVyYXRvcnNBd2FpdGluZ0FkZC5wdXNoKCB7XHJcbiAgICAgICAgc291bmRHZW5lcmF0b3I6IHNvdW5kR2VuZXJhdG9yLFxyXG4gICAgICAgIHNvdW5kR2VuZXJhdG9yQWRkT3B0aW9uczogcHJvdmlkZWRPcHRpb25zXHJcbiAgICAgIH0gKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHN0YXRlIGNoZWNraW5nIC0gbWFrZSBzdXJlIHRoZSBuZWVkZWQgbm9kZXMgaGF2ZSBiZWVuIGNyZWF0ZWRcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY29udm9sdmVyICE9PSBudWxsICYmIHRoaXMuZHJ5R2Fpbk5vZGUgIT09IG51bGwsICdzb21lIGF1ZGlvIG5vZGVzIGhhdmUgbm90IGJlZW4gaW5pdGlhbGl6ZWQnICk7XHJcblxyXG4gICAgLy8gVmVyaWZ5IHRoYXQgdGhpcyBpcyBub3QgYSBkdXBsaWNhdGUgYWRkaXRpb24uXHJcbiAgICBjb25zdCBoYXNTb3VuZEdlbmVyYXRvciA9IHRoaXMuaGFzU291bmRHZW5lcmF0b3IoIHNvdW5kR2VuZXJhdG9yICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhaGFzU291bmRHZW5lcmF0b3IsICdjYW5cXCd0IGFkZCB0aGUgc2FtZSBzb3VuZCBnZW5lcmF0b3IgdHdpY2UnICk7XHJcblxyXG4gICAgLy8gZGVmYXVsdCBvcHRpb25zXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNvdW5kR2VuZXJhdG9yQWRkT3B0aW9ucywgU291bmRHZW5lcmF0b3JBZGRPcHRpb25zPigpKCB7XHJcbiAgICAgIHNvbmlmaWNhdGlvbkxldmVsOiBTb3VuZExldmVsRW51bS5CQVNJQyxcclxuICAgICAgYXNzb2NpYXRlZFZpZXdOb2RlOiBudWxsLFxyXG4gICAgICBjYXRlZ29yeU5hbWU6IG51bGxcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIG9wdGlvbiB2YWxpZGF0aW9uXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KFxyXG4gICAgICBfLmluY2x1ZGVzKCBfLnZhbHVlcyggU291bmRMZXZlbEVudW0gKSwgb3B0aW9ucy5zb25pZmljYXRpb25MZXZlbCApLFxyXG4gICAgICBgaW52YWxpZCB2YWx1ZSBmb3Igc29uaWZpY2F0aW9uIGxldmVsOiAke29wdGlvbnMuc29uaWZpY2F0aW9uTGV2ZWx9YFxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBDb25uZWN0IHRoZSBzb3VuZCBnZW5lcmF0b3IgdG8gYW4gb3V0cHV0IHBhdGguXHJcbiAgICBpZiAoIG9wdGlvbnMuY2F0ZWdvcnlOYW1lID09PSBudWxsICkge1xyXG4gICAgICBzb3VuZEdlbmVyYXRvci5jb25uZWN0KCB0aGlzLmNvbnZvbHZlciEgKTtcclxuICAgICAgc291bmRHZW5lcmF0b3IuY29ubmVjdCggdGhpcy5kcnlHYWluTm9kZSEgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KFxyXG4gICAgICAgIHRoaXMuZ2Fpbk5vZGVzRm9yQ2F0ZWdvcmllcy5oYXMoIG9wdGlvbnMuY2F0ZWdvcnlOYW1lICksXHJcbiAgICAgICAgYGNhdGVnb3J5IGRvZXMgbm90IGV4aXN0IDogJHtvcHRpb25zLmNhdGVnb3J5TmFtZX1gXHJcbiAgICAgICk7XHJcbiAgICAgIHNvdW5kR2VuZXJhdG9yLmNvbm5lY3QoIHRoaXMuZ2Fpbk5vZGVzRm9yQ2F0ZWdvcmllcy5nZXQoIG9wdGlvbnMuY2F0ZWdvcnlOYW1lICkhICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gS2VlcCBhIHJlY29yZCBvZiB0aGUgc291bmQgZ2VuZXJhdG9yIGFsb25nIHdpdGggYWRkaXRpb25hbCBpbmZvcm1hdGlvbiBhYm91dCBpdC5cclxuICAgIGNvbnN0IHNvdW5kR2VuZXJhdG9ySW5mbyA9IHtcclxuICAgICAgc291bmRHZW5lcmF0b3I6IHNvdW5kR2VuZXJhdG9yLFxyXG4gICAgICBzb25pZmljYXRpb25MZXZlbDogb3B0aW9ucy5zb25pZmljYXRpb25MZXZlbFxyXG4gICAgfTtcclxuICAgIHRoaXMuc291bmRHZW5lcmF0b3JJbmZvQXJyYXkucHVzaCggc291bmRHZW5lcmF0b3JJbmZvICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBnbG9iYWwgZW5hYmxlIFByb3BlcnR5IHRvIHRoZSBsaXN0IG9mIFByb3BlcnRpZXMgdGhhdCBlbmFibGUgdGhpcyBzb3VuZCBnZW5lcmF0b3IuXHJcbiAgICBzb3VuZEdlbmVyYXRvci5hZGRFbmFibGVDb250cm9sUHJvcGVydHkoIHRoaXMuZW5hYmxlZFByb3BlcnR5ICk7XHJcblxyXG4gICAgLy8gSWYgdGhpcyBzb3VuZCBnZW5lcmF0b3IgaXMgb25seSBlbmFibGVkIGluIGV4dHJhIG1vZGUsIGFkZCB0aGUgZXh0cmEgbW9kZSBQcm9wZXJ0eSBhcyBhbiBlbmFibGUtY29udHJvbC5cclxuICAgIGlmICggb3B0aW9ucy5zb25pZmljYXRpb25MZXZlbCA9PT0gU291bmRMZXZlbEVudW0uRVhUUkEgKSB7XHJcbiAgICAgIHNvdW5kR2VuZXJhdG9yLmFkZEVuYWJsZUNvbnRyb2xQcm9wZXJ0eSggdGhpcy5leHRyYVNvdW5kRW5hYmxlZFByb3BlcnR5ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgYSB2aWV3IG5vZGUgd2FzIHNwZWNpZmllZCwgY3JlYXRlIGFuZCBwYXNzIGluIGEgYm9vbGVhbiBQcm9wZXJ0eSB0aGF0IGlzIHRydWUgb25seSB3aGVuIHRoZSBub2RlIGlzIGRpc3BsYXllZC5cclxuICAgIGlmICggb3B0aW9ucy5hc3NvY2lhdGVkVmlld05vZGUgKSB7XHJcbiAgICAgIGNvbnN0IGRpc3BsYXllZFByb3BlcnR5ID0gbmV3IERpc3BsYXllZFByb3BlcnR5KCBvcHRpb25zLmFzc29jaWF0ZWRWaWV3Tm9kZSApO1xyXG4gICAgICBzb3VuZEdlbmVyYXRvci5hZGRFbmFibGVDb250cm9sUHJvcGVydHkoIGRpc3BsYXllZFByb3BlcnR5ICk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BsYXllZFByb3BlcnR5TWFwLnNldCggc291bmRHZW5lcmF0b3IsIGRpc3BsYXllZFByb3BlcnR5ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgdGhlIHNwZWNpZmllZCBzb3VuZCBnZW5lcmF0b3IuXHJcbiAgICovXHJcbiAgcHVibGljIHJlbW92ZVNvdW5kR2VuZXJhdG9yKCBzb3VuZEdlbmVyYXRvcjogU291bmRHZW5lcmF0b3IgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgdGhlIHNvdW5kIG1hbmFnZXIgaXMgaW5pdGlhbGl6ZWQgYW5kLCBpZiBub3QsIGlzc3VlIGEgd2FybmluZyBhbmQgaWdub3JlIHRoZSByZXF1ZXN0LiAgVGhpcyBpcyBub3QgYW5cclxuICAgIC8vIGFzc2VydGlvbiBiZWNhdXNlIHRoZSBzb3VuZCBtYW5hZ2VyIG1heSBub3QgYmUgaW5pdGlhbGl6ZWQgaW4gY2FzZXMgd2hlcmUgdGhlIHNvdW5kIGlzIG5vdCBlbmFibGVkIGZvciB0aGVcclxuICAgIC8vIHNpbXVsYXRpb24sIGJ1dCB0aGlzIG1ldGhvZCBjYW4gc3RpbGwgZW5kIHVwIGJlaW5nIGludm9rZWQuXHJcbiAgICBpZiAoICF0aGlzLmluaXRpYWxpemVkICkge1xyXG5cclxuICAgICAgY29uc3QgdG9SZW1vdmUgPSB0aGlzLnNvdW5kR2VuZXJhdG9yc0F3YWl0aW5nQWRkLmZpbHRlciggcyA9PiBzLnNvdW5kR2VuZXJhdG9yID09PSBzb3VuZEdlbmVyYXRvciApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0b1JlbW92ZS5sZW5ndGggPiAwLCAndW5hYmxlIHRvIHJlbW92ZSBzb3VuZCBnZW5lcmF0b3IgLSBub3QgZm91bmQnICk7XHJcbiAgICAgIHdoaWxlICggdG9SZW1vdmUubGVuZ3RoID4gMCApIHtcclxuICAgICAgICBhcnJheVJlbW92ZSggdGhpcy5zb3VuZEdlbmVyYXRvcnNBd2FpdGluZ0FkZCwgdG9SZW1vdmVbIDAgXSApO1xyXG4gICAgICAgIHRvUmVtb3ZlLnNoaWZ0KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBmaW5kIHRoZSBpbmZvIG9iamVjdCBmb3IgdGhpcyBzb3VuZCBnZW5lcmF0b3JcclxuICAgIGxldCBzb3VuZEdlbmVyYXRvckluZm8gPSBudWxsO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zb3VuZEdlbmVyYXRvckluZm9BcnJheS5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCB0aGlzLnNvdW5kR2VuZXJhdG9ySW5mb0FycmF5WyBpIF0uc291bmRHZW5lcmF0b3IgPT09IHNvdW5kR2VuZXJhdG9yICkge1xyXG5cclxuICAgICAgICAvLyBmb3VuZCBpdFxyXG4gICAgICAgIHNvdW5kR2VuZXJhdG9ySW5mbyA9IHRoaXMuc291bmRHZW5lcmF0b3JJbmZvQXJyYXlbIGkgXTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIG1ha2Ugc3VyZSBpdCBpcyBhY3R1YWxseSBwcmVzZW50IG9uIHRoZSBsaXN0XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzb3VuZEdlbmVyYXRvckluZm8sICd1bmFibGUgdG8gcmVtb3ZlIHNvdW5kIGdlbmVyYXRvciAtIG5vdCBmb3VuZCcgKTtcclxuXHJcbiAgICAvLyBkaXNjb25uZWN0IHRoZSBzb3VuZCBnZW5lcmF0b3IgZnJvbSBhbnkgYXVkaW8gbm9kZXMgdG8gd2hpY2ggaXQgbWF5IGJlIGNvbm5lY3RlZFxyXG4gICAgaWYgKCBzb3VuZEdlbmVyYXRvci5pc0Nvbm5lY3RlZFRvKCB0aGlzLmNvbnZvbHZlciEgKSApIHtcclxuICAgICAgc291bmRHZW5lcmF0b3IuZGlzY29ubmVjdCggdGhpcy5jb252b2x2ZXIhICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIHNvdW5kR2VuZXJhdG9yLmlzQ29ubmVjdGVkVG8oIHRoaXMuZHJ5R2Fpbk5vZGUhICkgKSB7XHJcbiAgICAgIHNvdW5kR2VuZXJhdG9yLmRpc2Nvbm5lY3QoIHRoaXMuZHJ5R2Fpbk5vZGUhICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmdhaW5Ob2Rlc0ZvckNhdGVnb3JpZXMuZm9yRWFjaCggZ2Fpbk5vZGUgPT4ge1xyXG4gICAgICBpZiAoIHNvdW5kR2VuZXJhdG9yLmlzQ29ubmVjdGVkVG8oIGdhaW5Ob2RlICkgKSB7XHJcbiAgICAgICAgc291bmRHZW5lcmF0b3IuZGlzY29ubmVjdCggZ2Fpbk5vZGUgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFJlbW92ZSB0aGUgc291bmQgZ2VuZXJhdG9yIGZyb20gdGhlIGxpc3QuXHJcbiAgICBpZiAoIHNvdW5kR2VuZXJhdG9ySW5mbyApIHtcclxuICAgICAgdGhpcy5zb3VuZEdlbmVyYXRvckluZm9BcnJheS5zcGxpY2UoIHRoaXMuc291bmRHZW5lcmF0b3JJbmZvQXJyYXkuaW5kZXhPZiggc291bmRHZW5lcmF0b3JJbmZvICksIDEgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDbGVhbiB1cCBjcmVhdGVkIERpc3BsYXllZFByb3BlcnRpZXMgdGhhdCB3ZXJlIGNyZWF0ZWQgZm9yIHRoZSBhc3NvY2lhdGVkIHNvdW5kR2VuZXJhdG9yXHJcbiAgICBpZiAoIHRoaXMuZGlzcGxheWVkUHJvcGVydHlNYXAuaGFzKCBzb3VuZEdlbmVyYXRvciApICkge1xyXG4gICAgICB0aGlzLmRpc3BsYXllZFByb3BlcnR5TWFwLmdldCggc291bmRHZW5lcmF0b3IgKSEuZGlzcG9zZSgpO1xyXG4gICAgICB0aGlzLmRpc3BsYXllZFByb3BlcnR5TWFwLmRlbGV0ZSggc291bmRHZW5lcmF0b3IgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgbWFzdGVyIG91dHB1dCBsZXZlbCBmb3Igc291bmRzLlxyXG4gICAqIEBwYXJhbSBsZXZlbCAtIHZhbGlkIHZhbHVlcyBmcm9tIDAgKG1pbikgdGhyb3VnaCAxIChtYXgpXHJcbiAgICovXHJcbiAgcHVibGljIHNldE1hc3Rlck91dHB1dExldmVsKCBsZXZlbDogbnVtYmVyICk6IHZvaWQge1xyXG5cclxuICAgIC8vIENoZWNrIGlmIGluaXRpYWxpemF0aW9uIGhhcyBiZWVuIGRvbmUuICBUaGlzIGlzIG5vdCBhbiBhc3NlcnRpb24gYmVjYXVzZSB0aGUgc291bmQgbWFuYWdlciBtYXkgbm90IGJlXHJcbiAgICAvLyBpbml0aWFsaXplZCBpZiBzb3VuZCBpcyBub3QgZW5hYmxlZCBmb3IgdGhlIHNpbS5cclxuICAgIGlmICggIXRoaXMuaW5pdGlhbGl6ZWQgKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybiggJ2FuIGF0dGVtcHQgd2FzIG1hZGUgdG8gc2V0IHRoZSBtYXN0ZXIgb3V0cHV0IGxldmVsIG9uIGFuIHVuaW5pdGlhbGl6ZWQgc291bmQgbWFuYWdlciwgaWdub3JpbmcnICk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyByYW5nZSBjaGVja1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbGV2ZWwgPj0gMCAmJiBsZXZlbCA8PSAxLCBgb3V0cHV0IGxldmVsIHZhbHVlIG91dCBvZiByYW5nZTogJHtsZXZlbH1gICk7XHJcblxyXG4gICAgdGhpcy5fbWFzdGVyT3V0cHV0TGV2ZWwgPSBsZXZlbDtcclxuICAgIGlmICggdGhpcy5lbmFibGVkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHRoaXMubWFzdGVyR2Fpbk5vZGUhLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoXHJcbiAgICAgICAgbGV2ZWwsXHJcbiAgICAgICAgcGhldEF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIExJTkVBUl9HQUlOX0NIQU5HRV9USU1FXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IG1hc3Rlck91dHB1dExldmVsKCBvdXRwdXRMZXZlbCApIHtcclxuICAgIHRoaXMuc2V0TWFzdGVyT3V0cHV0TGV2ZWwoIG91dHB1dExldmVsICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IG1hc3Rlck91dHB1dExldmVsKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TWFzdGVyT3V0cHV0TGV2ZWwoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgY3VycmVudCBvdXRwdXQgbGV2ZWwgc2V0dGluZy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TWFzdGVyT3V0cHV0TGV2ZWwoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9tYXN0ZXJPdXRwdXRMZXZlbDtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIG91dHB1dCBsZXZlbCBmb3IgdGhlIHNwZWNpZmllZCBjYXRlZ29yeSBvZiBzb3VuZCBnZW5lcmF0b3IuXHJcbiAgICogQHBhcmFtIGNhdGVnb3J5TmFtZSAtIG5hbWUgb2YgY2F0ZWdvcnkgdG8gd2hpY2ggdGhpcyBpbnZvY2F0aW9uIGFwcGxpZXNcclxuICAgKiBAcGFyYW0gb3V0cHV0TGV2ZWwgLSB2YWxpZCB2YWx1ZXMgZnJvbSAwIHRocm91Z2ggMVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRPdXRwdXRMZXZlbEZvckNhdGVnb3J5KCBjYXRlZ29yeU5hbWU6IHN0cmluZywgb3V0cHV0TGV2ZWw6IG51bWJlciApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBDaGVjayBpZiBpbml0aWFsaXphdGlvbiBoYXMgYmVlbiBkb25lLiAgVGhpcyBpcyBub3QgYW4gYXNzZXJ0aW9uIGJlY2F1c2UgdGhlIHNvdW5kIG1hbmFnZXIgbWF5IG5vdCBiZVxyXG4gICAgLy8gaW5pdGlhbGl6ZWQgaWYgc291bmQgaXMgbm90IGVuYWJsZWQgZm9yIHRoZSBzaW0uXHJcbiAgICBpZiAoICF0aGlzLmluaXRpYWxpemVkICkge1xyXG4gICAgICBjb25zb2xlLndhcm4oICdhbiBhdHRlbXB0IHdhcyBtYWRlIHRvIHNldCB0aGUgb3V0cHV0IGxldmVsIGZvciBhIHNvdW5kIGNhdGVnb3J5IG9uIGFuIHVuaW5pdGlhbGl6ZWQgc291bmQgbWFuYWdlciwgaWdub3JpbmcnICk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmluaXRpYWxpemVkLCAnb3V0cHV0IGxldmVscyBmb3IgY2F0ZWdvcmllcyBjYW5ub3QgYmUgYWRkZWQgdW50aWwgaW5pdGlhbGl6YXRpb24gaGFzIGJlZW4gZG9uZScgKTtcclxuXHJcbiAgICAvLyByYW5nZSBjaGVja1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3V0cHV0TGV2ZWwgPj0gMCAmJiBvdXRwdXRMZXZlbCA8PSAxLCBgb3V0cHV0IGxldmVsIHZhbHVlIG91dCBvZiByYW5nZTogJHtvdXRwdXRMZXZlbH1gICk7XHJcblxyXG4gICAgLy8gdmVyaWZ5IHRoYXQgdGhlIHNwZWNpZmllZCBjYXRlZ29yeSBleGlzdHNcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZ2Fpbk5vZGVzRm9yQ2F0ZWdvcmllcy5nZXQoIGNhdGVnb3J5TmFtZSApLCBgbm8gY2F0ZWdvcnkgd2l0aCBuYW1lID0gJHtjYXRlZ29yeU5hbWV9YCApO1xyXG5cclxuICAgIC8vIFNldCB0aGUgZ2FpbiB2YWx1ZSBvbiB0aGUgYXBwcm9wcmlhdGUgZ2FpbiBub2RlLlxyXG4gICAgY29uc3QgZ2Fpbk5vZGUgPSB0aGlzLmdhaW5Ob2Rlc0ZvckNhdGVnb3JpZXMuZ2V0KCBjYXRlZ29yeU5hbWUgKTtcclxuICAgIGlmICggZ2Fpbk5vZGUgKSB7XHJcbiAgICAgIGdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoIG91dHB1dExldmVsLCBwaGV0QXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYSBkdWNraW5nIFByb3BlcnR5LiAgV2hlbiBhbnkgb2YgdGhlIGR1Y2tpbmcgUHJvcGVydGllcyBhcmUgdHJ1ZSwgdGhlIG91dHB1dCBsZXZlbCB3aWxsIGJlIFwiZHVja2VkXCIsIG1lYW5pbmdcclxuICAgKiB0aGF0IGl0IHdpbGwgYmUgcmVkdWNlZC5cclxuICAgKi9cclxuICBwdWJsaWMgYWRkRHVja2luZ1Byb3BlcnR5KCBkdWNraW5nUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+ICk6IHZvaWQge1xyXG4gICAgdGhpcy5kdWNraW5nUHJvcGVydGllcy5hZGQoIGR1Y2tpbmdQcm9wZXJ0eSApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBhIGR1Y2tpbmcgUHJvcGVydHkgdGhhdCBoYWQgYmVlbiBwcmV2aW91c2x5IGFkZGVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVEdWNraW5nUHJvcGVydHkoIGR1Y2tpbmdQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4gKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmR1Y2tpbmdQcm9wZXJ0aWVzLmluY2x1ZGVzKCBkdWNraW5nUHJvcGVydHkgKSwgJ2R1Y2tpbmcgUHJvcGVydHkgbm90IHByZXNlbnQnICk7XHJcbiAgICB0aGlzLmR1Y2tpbmdQcm9wZXJ0aWVzLnJlbW92ZSggZHVja2luZ1Byb3BlcnR5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIG91dHB1dCBsZXZlbCBmb3IgdGhlIHNwZWNpZmllZCBzb3VuZCBnZW5lcmF0b3IgY2F0ZWdvcnkuXHJcbiAgICogQHBhcmFtIGNhdGVnb3J5TmFtZSAtIG5hbWUgb2YgY2F0ZWdvcnkgdG8gd2hpY2ggdGhpcyBpbnZvY2F0aW9uIGFwcGxpZXNcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0T3V0cHV0TGV2ZWxGb3JDYXRlZ29yeSggY2F0ZWdvcnlOYW1lOiBzdHJpbmcgKTogbnVtYmVyIHtcclxuXHJcbiAgICAvLyBDaGVjayBpZiBpbml0aWFsaXphdGlvbiBoYXMgYmVlbiBkb25lLiAgVGhpcyBpcyBub3QgYW4gYXNzZXJ0aW9uIGJlY2F1c2UgdGhlIHNvdW5kIG1hbmFnZXIgbWF5IG5vdCBiZVxyXG4gICAgLy8gaW5pdGlhbGl6ZWQgaWYgc291bmQgaXMgbm90IGVuYWJsZWQgZm9yIHRoZSBzaW0uXHJcbiAgICBpZiAoICF0aGlzLmluaXRpYWxpemVkICkge1xyXG4gICAgICBjb25zb2xlLndhcm4oICdhbiBhdHRlbXB0IHdhcyBtYWRlIHRvIGdldCB0aGUgb3V0cHV0IGxldmVsIGZvciBhIHNvdW5kIGNhdGVnb3J5IG9uIGFuIHVuaW5pdGlhbGl6ZWQgc291bmQgbWFuYWdlciwgcmV0dXJuaW5nIDAnICk7XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCB0aGUgR2Fpbk5vZGUgZm9yIHRoZSBzcGVjaWZpZWQgY2F0ZWdvcnkuXHJcbiAgICBjb25zdCBnYWluTm9kZSA9IHRoaXMuZ2Fpbk5vZGVzRm9yQ2F0ZWdvcmllcy5nZXQoIGNhdGVnb3J5TmFtZSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZ2Fpbk5vZGUsIGBubyBjYXRlZ29yeSB3aXRoIG5hbWUgPSAke2NhdGVnb3J5TmFtZX1gICk7XHJcblxyXG4gICAgcmV0dXJuIGdhaW5Ob2RlIS5nYWluLnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBhbW91bnQgb2YgcmV2ZXJiLlxyXG4gICAqIEBwYXJhbSBuZXdSZXZlcmJMZXZlbCAtIHZhbHVlIGZyb20gMCB0byAxLCAwID0gdG90YWxseSBkcnksIDEgPSB3ZXRcclxuICAgKi9cclxuICBwdWJsaWMgc2V0UmV2ZXJiTGV2ZWwoIG5ld1JldmVyYkxldmVsOiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgaW5pdGlhbGl6YXRpb24gaGFzIGJlZW4gZG9uZS4gIFRoaXMgaXMgbm90IGFuIGFzc2VydGlvbiBiZWNhdXNlIHRoZSBzb3VuZCBtYW5hZ2VyIG1heSBub3QgYmVcclxuICAgIC8vIGluaXRpYWxpemVkIGlmIHNvdW5kIGlzIG5vdCBlbmFibGVkIGZvciB0aGUgc2ltLlxyXG4gICAgaWYgKCAhdGhpcy5pbml0aWFsaXplZCApIHtcclxuICAgICAgY29uc29sZS53YXJuKCAnYW4gYXR0ZW1wdCB3YXMgbWFkZSB0byBzZXQgdGhlIHJldmVyYiBsZXZlbCBvbiBhbiB1bmluaXRpYWxpemVkIHNvdW5kIG1hbmFnZXIsIGlnbm9yaW5nJyApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBuZXdSZXZlcmJMZXZlbCAhPT0gdGhpcy5fcmV2ZXJiTGV2ZWwgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG5ld1JldmVyYkxldmVsID49IDAgJiYgbmV3UmV2ZXJiTGV2ZWwgPD0gMSwgYHJldmVyYiB2YWx1ZSBvdXQgb2YgcmFuZ2U6ICR7bmV3UmV2ZXJiTGV2ZWx9YCApO1xyXG4gICAgICBjb25zdCBub3cgPSBwaGV0QXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xyXG4gICAgICB0aGlzLnJldmVyYkdhaW5Ob2RlIS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKCBuZXdSZXZlcmJMZXZlbCwgbm93ICsgTElORUFSX0dBSU5fQ0hBTkdFX1RJTUUgKTtcclxuICAgICAgdGhpcy5kcnlHYWluTm9kZSEuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSggMSAtIG5ld1JldmVyYkxldmVsLCBub3cgKyBMSU5FQVJfR0FJTl9DSEFOR0VfVElNRSApO1xyXG4gICAgICB0aGlzLl9yZXZlcmJMZXZlbCA9IG5ld1JldmVyYkxldmVsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCByZXZlcmJMZXZlbCggcmV2ZXJiTGV2ZWwgKSB7XHJcbiAgICB0aGlzLnNldFJldmVyYkxldmVsKCByZXZlcmJMZXZlbCApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCByZXZlcmJMZXZlbCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmV2ZXJiTGV2ZWwoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRSZXZlcmJMZXZlbCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3JldmVyYkxldmVsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBlbmFibGVkKCBlbmFibGVkOiBib29sZWFuICkge1xyXG4gICAgdGhpcy5lbmFibGVkUHJvcGVydHkudmFsdWUgPSBlbmFibGVkO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBlbmFibGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZW5hYmxlZFByb3BlcnR5LnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBzb25pZmljYXRpb25MZXZlbCggc29uaWZpY2F0aW9uTGV2ZWw6IFNvdW5kTGV2ZWxFbnVtICkge1xyXG4gICAgdGhpcy5leHRyYVNvdW5kRW5hYmxlZFByb3BlcnR5LnZhbHVlID0gc29uaWZpY2F0aW9uTGV2ZWwgPT09IFNvdW5kTGV2ZWxFbnVtLkVYVFJBO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRVM1IGdldHRlciBmb3Igc29uaWZpY2F0aW9uIGxldmVsXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBzb25pZmljYXRpb25MZXZlbCgpOiBTb3VuZExldmVsRW51bSB7XHJcbiAgICByZXR1cm4gdGhpcy5leHRyYVNvdW5kRW5hYmxlZFByb3BlcnR5LnZhbHVlID8gU291bmRMZXZlbEVudW0uRVhUUkEgOiBTb3VuZExldmVsRW51bS5CQVNJQztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExvZyB0aGUgdmFsdWUgb2YgdGhlIGdhaW4gcGFyYW1ldGVyIGF0IGV2ZXJ5IGFuaW1hdGlvbiBmcmFtZSBmb3IgdGhlIHNwZWNpZmllZCBkdXJhdGlvbi4gIFRoaXMgaXMgdXNlZnVsIGZvclxyXG4gICAqIGRlYnVnZ2luZywgYmVjYXVzZSB0aGVzZSBwYXJhbWV0ZXJzIGNoYW5nZSBvdmVyIHRpbWUgd2hlbiBzZXQgdXNpbmcgbWV0aG9kcyBsaWtlIFwic2V0VGFyZ2V0QXRUaW1lXCIsIGFuZCB0aGVcclxuICAgKiBkZXRhaWxzIG9mIGhvdyB0aGV5IGNoYW5nZSBzZWVtcyB0byBiZSBkaWZmZXJlbnQgb24gdGhlIGRpZmZlcmVudCBicm93c2Vycy5cclxuICAgKlxyXG4gICAqIEl0IG1heSBiZSBwb3NzaWJsZSB0byByZW1vdmUgdGhpcyBtZXRob2Qgc29tZWRheSBvbmNlIHRoZSBiZWhhdmlvciBpcyBtb3JlIGNvbnNpc3RlbnQgYWNyb3NzIGJyb3dzZXJzLiAgU2VlXHJcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3Jlc2lzdGFuY2UtaW4tYS13aXJlL2lzc3Vlcy8yMDUgZm9yIHNvbWUgaGlzdG9yeSBvbiB0aGlzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGdhaW5Ob2RlXHJcbiAgICogQHBhcmFtIGR1cmF0aW9uIC0gZHVyYXRpb24gZm9yIGxvZ2dpbmcsIGluIHNlY29uZHNcclxuICAgKi9cclxuICBwdWJsaWMgbG9nR2FpbiggZ2Fpbk5vZGU6IEdhaW5Ob2RlLCBkdXJhdGlvbjogbnVtYmVyICk6IHZvaWQge1xyXG5cclxuICAgIGR1cmF0aW9uID0gZHVyYXRpb24gfHwgMTtcclxuICAgIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XHJcblxyXG4gICAgLy8gY2xvc3VyZSB0aGF0IHdpbGwgYmUgaW52b2tlZCBtdWx0aXBsZSB0aW1lcyB0byBsb2cgdGhlIGNoYW5naW5nIHZhbHVlc1xyXG4gICAgZnVuY3Rpb24gbG9nR2FpbigpOiB2b2lkIHtcclxuICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgICAgY29uc3QgdGltZUluTWlsbGlzZWNvbmRzID0gbm93IC0gc3RhcnRUaW1lO1xyXG4gICAgICBjb25zb2xlLmxvZyggYFRpbWUgKG1zKTogJHtVdGlscy50b0ZpeGVkKCB0aW1lSW5NaWxsaXNlY29uZHMsIDIgKX0sIEdhaW4gVmFsdWU6ICR7Z2Fpbk5vZGUuZ2Fpbi52YWx1ZX1gICk7XHJcbiAgICAgIGlmICggbm93IC0gc3RhcnRUaW1lIDwgKCBkdXJhdGlvbiAqIDEwMDAgKSApIHtcclxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCBsb2dHYWluICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIEdBSU5fTE9HR0lOR19FTkFCTEVEICkge1xyXG5cclxuICAgICAgLy8ga2ljayBvZmYgdGhlIGxvZ2dpbmdcclxuICAgICAgY29uc29sZS5sb2coICctLS0tLS0tIHN0YXJ0IG9mIGdhaW4gbG9nZ2luZyAtLS0tLScgKTtcclxuICAgICAgbG9nR2FpbigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTG9nIHRoZSB2YWx1ZSBvZiB0aGUgbWFzdGVyIGdhaW4gYXMgaXQgY2hhbmdlcywgdXNlZCBwcmltYXJpbHkgZm9yIGRlYnVnLlxyXG4gICAqIEBwYXJhbSBkdXJhdGlvbiAtIGluIHNlY29uZHNcclxuICAgKi9cclxuICBwdWJsaWMgbG9nTWFzdGVyR2FpbiggZHVyYXRpb246IG51bWJlciApOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5tYXN0ZXJHYWluTm9kZSApIHtcclxuICAgICAgdGhpcy5sb2dHYWluKCB0aGlzLm1hc3RlckdhaW5Ob2RlLCBkdXJhdGlvbiApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTG9nIHRoZSB2YWx1ZSBvZiB0aGUgcmV2ZXJiIGdhaW4gYXMgaXQgY2hhbmdlcywgdXNlZCBwcmltYXJpbHkgZm9yIGRlYnVnLlxyXG4gICAqIEBwYXJhbSBkdXJhdGlvbiAtIGR1cmF0aW9uIGZvciBsb2dnaW5nLCBpbiBzZWNvbmRzXHJcbiAgICovXHJcbiAgcHVibGljIGxvZ1JldmVyYkdhaW4oIGR1cmF0aW9uOiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBpZiAoIHRoaXMucmV2ZXJiR2Fpbk5vZGUgKSB7XHJcbiAgICAgIHRoaXMubG9nR2FpbiggdGhpcy5yZXZlcmJHYWluTm9kZSwgZHVyYXRpb24gKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IHNvdW5kTWFuYWdlciA9IG5ldyBTb3VuZE1hbmFnZXIoKTtcclxudGFtYm8ucmVnaXN0ZXIoICdzb3VuZE1hbmFnZXInLCBzb3VuZE1hbmFnZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgc291bmRNYW5hZ2VyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUs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