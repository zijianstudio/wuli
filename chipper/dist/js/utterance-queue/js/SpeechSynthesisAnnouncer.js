// Copyright 2022-2023, University of Colorado Boulder

/**
 * Uses the Web Speech API to produce speech from the browser. There is no speech output until the SpeechSynthesisAnnouncer has
 * been initialized. Supported voices will depend on platform. For each voice, you can customize the rate and pitch.
 *
 * Only one SpeechSynthesisAnnouncer can be used at a time. This class uses a global instance of window.speechSynthesis
 * and assumes it has full control over it. This is not a singleton because subclasses may extend this for specific
 * uses. For example, PhET has one subclass specific to its Voicing feature and another specific to
 * custom speech synthesis in number-suite-common sims.
 *
 * A note about PhET-iO instrumentation:
 * Properties are instrumented for PhET-iO to provide a record of learners that may have used this feature (and how). All
 * Properties should be phetioState:false so the values are not overwritten when a customized state is loaded.
 * Properties are not phetioReadonly so that clients can overwrite the values using the PhET-iO API and studio.
 *
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Emitter from '../../axon/js/Emitter.js';
import EnabledComponent from '../../axon/js/EnabledComponent.js';
import NumberProperty from '../../axon/js/NumberProperty.js';
import Property from '../../axon/js/Property.js';
import Range from '../../dot/js/Range.js';
import optionize, { optionize3 } from '../../phet-core/js/optionize.js';
import stripEmbeddingMarks from '../../phet-core/js/stripEmbeddingMarks.js';
import Announcer from '../../utterance-queue/js/Announcer.js';
import Utterance from '../../utterance-queue/js/Utterance.js';
import SpeechSynthesisParentPolyfill from './SpeechSynthesisParentPolyfill.js';
import utteranceQueueNamespace from './utteranceQueueNamespace.js';
import stepTimer from '../../axon/js/stepTimer.js';
import platform from '../../phet-core/js/platform.js';
import Multilink from '../../axon/js/Multilink.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import NullableIO from '../../tandem/js/types/NullableIO.js';
import validate from '../../axon/js/validate.js';
import Validation from '../../axon/js/Validation.js';
// If a polyfill for SpeechSynthesis is requested, try to initialize it here before SpeechSynthesis usages. For
// now this is a PhET specific feature, available by query parameter in initialize-globals. QueryStringMachine
// cannot be used for this, see https://github.com/phetsims/scenery/issues/1366
if (window.phet && phet.chipper && phet.chipper.queryParameters && phet.chipper.queryParameters.speechSynthesisFromParent) {
  SpeechSynthesisParentPolyfill.initialize();
}

// In ms, how frequently we will use SpeechSynthesis to keep the feature active. After long intervals without
// using SpeechSynthesis Chromebooks will take a long time to produce the next speech. Presumably it is disabling
// the feature as an optimization. But this workaround gets around it and keeps speech fast.
const ENGINE_WAKE_INTERVAL = 5000;

// In ms, how long to wait before we consider the SpeechSynthesis engine as having failed to speak a requested
// utterance. ChromeOS and Safari in particular may simply fail to speak. If the amount of time between our speak()
// request and the time we receive the `start` event is too long then we know there was a failure and we can try
// to handle accordingly. Length is somewhat arbitrary, but 5 seconds felt OK and seemed to work well to recover from
// this error case.
const PENDING_UTTERANCE_DELAY = 5000;

// In Windows Chromium, long utterances with the Google voices simply stop after 15 seconds and we never get end or
// cancel events. The workaround proposed in https://bugs.chromium.org/p/chromium/issues/detail?id=679437 is
// to pause/resume the utterance at an interval.
const PAUSE_RESUME_WORKAROUND_INTERVAL = 10000;

// In ms. In Safari, the `start` and `end` listener do not fire consistently, especially after interruption
// with cancel. But speaking behind a timeout/delay improves the behavior significantly. Timeout of 125 ms was
// determined with testing to be a good value to use. Values less than 125 broke the workaround, while larger
// values feel too sluggish. See https://github.com/phetsims/john-travoltage/issues/435
// Beware that UtteranceQueueTests use this value too. Don't change without checking those tests.
const VOICING_UTTERANCE_INTERVAL = 125;

// A list of "novelty" voices made available by the operating system...for some reason. There is nothing special about
// these novelty SpeechSynthesisVoices to exclude them. So having a list to exclude by name and maintining over time
// is the best we can do.
const NOVELTY_VOICES = ['Albert', 'Bad News', 'Bahh', 'Bells', 'Boing', 'Bubbles', 'Cellos', 'Good News', 'Jester', 'Organ', 'Superstar', 'Trinoids', 'Whisper', 'Wobble', 'Zarvox',
// not technically "novelty" but still sound too bad and would be distracting to users, see
// https://github.com/phetsims/utterance-queue/issues/93#issuecomment-1303901484
'Flo', 'Grandma', 'Grandpa', 'Junior'];

// Only one instance of SpeechSynthesisAnnouncer can be initialized, see top level type documentation.
let initializeCount = 0;
// The SpeechSynthesisVoice.lang property has a schema that is different from our locale (see https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/lang)
// As a result, manually map a couple important values back to our own supported locales, see https://github.com/phetsims/number-play/issues/230.
// You can test that this map is working with something like `'en-GB': 'es'`
const voiceLangToSupportedLocale = {
  cmn: 'zh_CN',
  yue: 'zh_HK',
  'yue-HK': 'zh_HK',
  yue_HK: 'zh_HK',
  'fil-PH': 'tl',
  // ISO 639-1 does not support filipino, so this is better than nothing (since it has translation support)
  fil_PH: 'tl'
};
const UTTERANCE_OPTION_DEFAULTS = {
  // If true and this Utterance is currently being spoken by the speech synth, announcing it
  // to the queue again will immediately cancel the synth and new content will be
  // spoken. Otherwise, new content for this utterance will be spoken whenever the old
  // content has finished speaking. Used when adding the Utterance to be spoken.
  cancelSelf: true,
  // Only applies to two Utterances with the same priority. If true and another Utterance is currently
  // being spoken by the speech synth (or queued by SpeechSynthesisAnnouncer), announcing this Utterance will immediately cancel
  // the other content being spoken by the synth. Otherwise, content for the new utterance will be spoken as soon as
  // the browser finishes speaking the utterances in front of it in line. Used when adding the Utterance to be spoken.
  cancelOther: true,
  // Provide a specific SpeechSynthesisVoice for only this Utterance, or if null use the Announcer's general
  // voiceProperty value. Used when speaking the Utterance.
  voice: null
};

// Options to the initialize function

class SpeechSynthesisAnnouncer extends Announcer {
  // controls the speaking rate of Web Speech

  // controls the pitch of the synth

  // Controls volume of the synth. Intended for use with unit tests only!!

  // In ms, how long to go before "waking the SpeechSynthesis" engine to keep speech
  // fast on Chromebooks, see documentation around ENGINE_WAKE_INTERVAL.
  // In ms, how long since we have applied the "pause/resume" workaround for long utterances in Chromium. Very
  // long SpeechSynthesisUtterances (longer than 15 seconds) get cut on Chromium and we never get "end" or "cancel"
  // events due to a platform bug, see https://bugs.chromium.org/p/chromium/issues/detail?id=679437.
  // In ms, how long it has been since we requested speech of a new utterance and when
  // the synth has successfully started speaking it. It is possible that the synth will fail to speak so if
  // this timer gets too high we handle the failure case.
  // Amount of time in ms to wait between speaking SpeechSynthesisUtterances, see
  // VOICING_UTTERANCE_INTERVAL for details about why this is necessary. Initialized to the interval value
  // so that we can speak instantly the first time.
  // emits events when the speaker starts/stops speaking, with the Utterance that is
  // either starting or stopping
  // To get around multiple inheritance issues, create enabledProperty via composition instead, then create
  // a reference on this component for the enabledProperty
  // Controls whether Voicing is enabled in a "main window" area of the application.
  // This supports the ability to disable Voicing for the important screen content of your application while keeping
  // Voicing for surrounding UI components enabled (for example).
  // Property that indicates that the Voicing feature is enabled for all areas of the application.
  // Indicates whether speech is fully enabled AND speech is allowed, as specified
  // by the Property provided in initialize(). See speechAllowedProperty of initialize(). In order for this Property
  // to be true, speechAllowedProperty, enabledProperty, and mainWindowVoicingEnabledProperty must all be true.
  // Initialized in the constructor because we don't have access to all the dependency Properties until initialize.
  // These two variable keep a public, readonly interface. We cannot use a DerivedProperty because it needs to be
  // listened to before its dependencies are created, see https://github.com/phetsims/utterance-queue/issues/72
  // synth from Web Speech API that drives speech, defined on initialize
  // possible voices for Web Speech synthesis
  // Holds a reference to the Utterance that is actively being spoken by the announcer. Note that depending
  // on the platform, there may be a delay between the speak() request and when the synth actually starts speaking.
  // Keeping a reference supports cancelling, priority changes, and cleaning when finished speaking.
  // is the VoicingManager initialized for use? This is prototypal so it isn't always initialized
  // Controls whether speech is allowed with synthesis. Null until initialized, and can be set by options to
  // initialize().
  // bound so we can link and unlink to this.canSpeakProperty when the SpeechSynthesisAnnouncer becomes initialized.
  // A listener that will cancel the Utterance that is being announced if its canAnnounceProperty becomes false.
  // Set when this Announcer begins to announce a new Utterance and cleared when the Utterance is finished/cancelled.
  // Bound so that the listener can be added and removed on Utterances without creating many closures.
  // Switch to true to enable debugging features (like logging)
  constructor(providedOptions) {
    const options = optionize()({
      // {boolean} - SpeechSynthesisAnnouncer generally doesn't care about ResponseCollectorProperties,
      // that is more specific to the Voicing feature.
      respectResponseCollectorProperties: false,
      debug: false,
      tandem: Tandem.OPTIONAL
    }, providedOptions);
    super(options);
    this.debug = options.debug;
    this.voiceProperty = new Property(null, {
      tandem: options.tandem.createTandem('voiceProperty'),
      phetioValueType: NullableIO(SpeechSynthesisVoiceIO),
      phetioState: false,
      phetioReadOnly: true,
      phetioDocumentation: 'the voice that is currently voicing responses'
    });
    this.voiceRateProperty = new NumberProperty(1.0, {
      range: new Range(0.75, 2),
      tandem: options.tandem.createTandem('voiceRateProperty'),
      phetioState: false,
      phetioDocumentation: 'changes the rate of the voicing-feature voice'
    });
    this.voicePitchProperty = new NumberProperty(1.0, {
      range: new Range(0.5, 2),
      tandem: options.tandem.createTandem('voicePitchProperty'),
      phetioState: false,
      phetioDocumentation: 'changes the pitch of the voicing-feature voice'
    });
    this.voiceVolumeProperty = new NumberProperty(1.0, {
      range: new Range(0, 1)
    });

    // Indicates whether speech using SpeechSynthesis has been requested at least once.
    // The first time speech is requested, it must be done synchronously from user input with absolutely no delay.
    // requestSpeech() generally uses a timeout to workaround browser bugs, but those cannot be used until after the
    // first request for speech.
    this.hasSpoken = false;
    this.timeSinceWakingEngine = 0;
    this.timeSincePauseResume = 0;
    this.timeSincePendingUtterance = 0;
    this.timeSinceUtteranceEnd = VOICING_UTTERANCE_INTERVAL;
    this.startSpeakingEmitter = new Emitter({
      parameters: [{
        valueType: 'string'
      }, {
        valueType: Utterance
      }]
    });
    this.endSpeakingEmitter = new Emitter({
      parameters: [{
        valueType: 'string'
      }, {
        valueType: Utterance
      }]
    });
    this.enabledComponentImplementation = new EnabledComponent({
      // initial value for the enabledProperty, false because speech should not happen until requested by user
      enabled: false,
      tandem: options.tandem,
      enabledPropertyOptions: {
        phetioDocumentation: 'toggles this controller of SpeechSynthesis on and off',
        phetioState: false,
        phetioFeatured: false
      }
    });
    assert && assert(this.enabledComponentImplementation.enabledProperty.isSettable(), 'enabledProperty must be settable');
    this.enabledProperty = this.enabledComponentImplementation.enabledProperty;
    this.mainWindowVoicingEnabledProperty = new BooleanProperty(true, {
      tandem: options.tandem.createTandem('mainWindowVoicingEnabledProperty'),
      phetioState: false,
      phetioDocumentation: 'toggles the voicing feature on and off for the simulation screen (not the voicing preferences and toolbar controls)'
    });
    this.voicingFullyEnabledProperty = DerivedProperty.and([this.enabledProperty, this.mainWindowVoicingEnabledProperty]);
    this._speechAllowedAndFullyEnabledProperty = new BooleanProperty(false);
    this.speechAllowedAndFullyEnabledProperty = this._speechAllowedAndFullyEnabledProperty;
    this.synth = null;
    this.voicesProperty = new Property([]);
    this.speakingSpeechSynthesisUtteranceWrapper = null;
    this.isInitializedProperty = new BooleanProperty(false);
    this.canSpeakProperty = null;
    this.boundHandleCanSpeakChange = this.handleCanSpeakChange.bind(this);
    this.boundHandleCanAnnounceChange = this.handleCanAnnounceChange.bind(this);
    if (this.debug) {
      this.announcementCompleteEmitter.addListener((utterance, string) => {
        console.log('announcement complete', string);
      });
      this.startSpeakingEmitter.addListener(string => {
        this.debug && console.log('startSpeakingListener', string);
      });
      this.endSpeakingEmitter.addListener(string => {
        this.debug && console.log('endSpeakingListener', string);
      });
    }
  }
  get initialized() {
    return this.isInitializedProperty.value;
  }

  /**
   * Indicate that the SpeechSynthesisAnnouncer is ready for use, and attempt to populate voices (if they are ready yet). Adds
   * listeners that control speech.
   *
   * @param userGestureEmitter - Emits when user input happens, which is required before the browser is
   *                                       allowed to use SpeechSynthesis for the first time.
   * @param [providedOptions]
   */
  initialize(userGestureEmitter, providedOptions) {
    assert && assert(!this.initialized, 'can only be initialized once');
    assert && assert(SpeechSynthesisAnnouncer.isSpeechSynthesisSupported(), 'trying to initialize speech, but speech is not supported on this platform.');

    // See top level type documentation.
    assert && assert(initializeCount === 0, 'Only one instance of SpeechSynthesisAnnouncer can be initialized at a time.');
    initializeCount++;
    const options = optionize()({
      // {BooleanProperty|DerivedProperty.<boolean>} - Controls whether speech is allowed with speech synthesis.
      // Combined into another DerivedProperty with this.enabledProperty so you don't have to use that as one
      // of the Properties that derive speechAllowedProperty, if you are passing in a DerivedProperty.
      speechAllowedProperty: new BooleanProperty(true)
    }, providedOptions);
    this.synth = window.speechSynthesis;

    // whether the optional Property indicating speech is allowed and the SpeechSynthesisAnnouncer is enabled
    this.canSpeakProperty = DerivedProperty.and([options.speechAllowedProperty, this.enabledProperty]);
    this.canSpeakProperty.link(this.boundHandleCanSpeakChange);

    // Set the speechAllowedAndFullyEnabledProperty when dependency Properties update
    Multilink.multilink([options.speechAllowedProperty, this.voicingFullyEnabledProperty], (speechAllowed, voicingFullyEnabled) => {
      this._speechAllowedAndFullyEnabledProperty.value = speechAllowed && voicingFullyEnabled;
    });

    // browsers tend to generate the list of voices lazily, so the list of voices may be empty until speech is first
    // requested. Some browsers don't have an addEventListener function on speechSynthesis so check to see if it exists
    // before trying to call it.
    const synth = this.getSynth();
    synth.addEventListener && synth.addEventListener('voiceschanged', () => {
      this.populateVoices();
    });

    // try to populate voices immediately in case the browser populates them eagerly and we never get an
    // onvoiceschanged event
    this.populateVoices();

    // To get Voicing to happen quickly on Chromebooks we set the counter to a value that will trigger the "engine
    // wake" interval on the next animation frame the first time we get a user gesture. See ENGINE_WAKE_INTERVAL
    // for more information about this workaround.
    const startEngineListener = () => {
      this.timeSinceWakingEngine = ENGINE_WAKE_INTERVAL;

      // Display is on the namespace but cannot be imported due to circular dependencies
      userGestureEmitter.removeListener(startEngineListener);
    };
    userGestureEmitter.addListener(startEngineListener);

    // listener for timing variables
    stepTimer.addListener(this.step.bind(this));
    this.isInitializedProperty.value = true;
  }

  /**
   * @param dt - in seconds from stepTimer
   */
  step(dt) {
    // convert to ms
    dt *= 1000;

    // if initialized, this means we have a synth.
    const synth = this.getSynth();
    if (this.initialized && synth) {
      // If we haven't spoken yet, keep checking the synth to determine when there has been a successful usage
      // of SpeechSynthesis. Note this will be true if ANY SpeechSynthesisAnnouncer has successful speech (not just
      // this instance).
      if (!this.hasSpoken) {
        this.hasSpoken = synth.speaking;
      }

      // Increment the amount of time since the synth has stopped speaking the previous utterance, but don't
      // start counting up until the synth has finished speaking its current utterance.
      this.timeSinceUtteranceEnd = synth.speaking ? 0 : this.timeSinceUtteranceEnd + dt;
      this.timeSincePendingUtterance = this.speakingSpeechSynthesisUtteranceWrapper && !this.speakingSpeechSynthesisUtteranceWrapper.started ? this.timeSincePendingUtterance + dt : 0;
      if (this.timeSincePendingUtterance > PENDING_UTTERANCE_DELAY) {
        assert && assert(this.speakingSpeechSynthesisUtteranceWrapper, 'should have this.speakingSpeechSynthesisUtteranceWrapper');

        // It has been too long since we requested speech without speaking, the synth is likely failing on this platform
        this.handleSpeechSynthesisEnd(this.speakingSpeechSynthesisUtteranceWrapper.announceText, this.speakingSpeechSynthesisUtteranceWrapper);
        this.speakingSpeechSynthesisUtteranceWrapper = null;

        // cancel the synth because we really don't want it to keep trying to speak this utterance after handling
        // the assumed failure
        this.cancelSynth();
      }

      // Wait until VOICING_UTTERANCE_INTERVAL to speak again for more consistent behavior on certain platforms,
      // see documentation for the constant for more information. By setting readyToAnnounce in the step function
      // we also don't have to rely at all on the SpeechSynthesisUtterance 'end' event, which is inconsistent on
      // certain platforms. Also, not ready to announce if we are waiting for the synth to start speaking something.
      if (this.timeSinceUtteranceEnd > VOICING_UTTERANCE_INTERVAL && !this.speakingSpeechSynthesisUtteranceWrapper) {
        this.readyToAnnounce = true;
      }

      // SpeechSynthesisUtterances longer than 15 seconds will get interrupted on Chrome and fail to stop with
      // end or error events. https://bugs.chromium.org/p/chromium/issues/detail?id=679437 suggests a workaround
      // that uses pause/resume like this. The workaround is needed for desktop Chrome when using `localService: false`
      // voices. The bug does not appear on any Microsoft Edge voices. This workaround breaks SpeechSynthesis on
      // android. In this check we only use this workaround where needed.
      if (platform.chromium && !platform.android && this.voiceProperty.value && !this.voiceProperty.value.localService) {
        // Not necessary to apply the workaround unless we are currently speaking.
        this.timeSincePauseResume = synth.speaking ? this.timeSincePauseResume + dt : 0;
        if (this.timeSincePauseResume > PAUSE_RESUME_WORKAROUND_INTERVAL) {
          this.timeSincePauseResume = 0;
          synth.pause();
          synth.resume();
        }
      }

      // A workaround to keep SpeechSynthesis responsive on Chromebooks. If there is a long enough interval between
      // speech requests, the next time SpeechSynthesis is used it is very slow on Chromebook. We think the browser
      // turns "off" the synthesis engine for performance. If it has been long enough since using speech synthesis and
      // there is nothing to speak in the queue, requesting speech with empty content keeps the engine active.
      // See https://github.com/phetsims/gravity-force-lab-basics/issues/303.
      if (platform.chromeOS) {
        this.timeSinceWakingEngine += dt;
        if (!synth.speaking && this.timeSinceWakingEngine > ENGINE_WAKE_INTERVAL) {
          this.timeSinceWakingEngine = 0;

          // This space is actually quite important. An empty string began breaking chromebooks in https://github.com/phetsims/friction/issues/328
          synth.speak(new SpeechSynthesisUtterance(' '));
        }
      }
    }
  }

  /**
   * When we can no longer speak, cancel all speech to silence everything.
   */
  handleCanSpeakChange(canSpeak) {
    if (!canSpeak) {
      this.cancel();
    }
  }

  /**
   * Update the list of `voices` available to the synth, and notify that the list has changed.
   */
  populateVoices() {
    const synth = this.getSynth();
    if (synth) {
      // the browser sometimes provides duplicate voices, prune those out of the list
      this.voicesProperty.value = _.uniqBy(synth.getVoices(), voice => voice.name);
    }
  }

  /**
   * Returns an array of SpeechSynthesisVoices that are sorted such that the best sounding voices come first.
   * As of 9/27/21, we find that the "Google" voices sound best while Apple's "Fred" sounds the worst so the list
   * will be ordered to reflect that. This way "Google" voices will be selected by default when available and "Fred"
   * will almost never be the default Voice since it is last in the list. See
   * https://github.com/phetsims/scenery/issues/1282/ for discussion and this decision.
   */
  getPrioritizedVoices() {
    assert && assert(this.initialized, 'No voices available until the SpeechSynthesisAnnouncer is initialized');
    assert && assert(this.voicesProperty.value.length > 0, 'No voices available to provided a prioritized list.');
    const allVoices = this.voicesProperty.value.slice();

    // exclude "novelty" voices that are included by the operating system but marked as English.
    // const voicesWithoutNovelty = _.filter( allVoices, voice => !NOVELTY_VOICES.includes( voice.name ) );
    const voicesWithoutNovelty = _.filter(allVoices, voice => {
      // Remove the voice if the SpeechSynthesisVoice.name includes a substring of the entry in our list (the browser
      // might include more information in the name than we maintain, like locale info or something else).
      return !_.some(NOVELTY_VOICES, noveltyVoice => voice.name.includes(noveltyVoice));
    });
    const getIndex = voice => voice.name.includes('Google') ? -1 :
    // Google should move toward the front
    voice.name.includes('Fred') ? voicesWithoutNovelty.length :
    // Fred should move toward the back
    voicesWithoutNovelty.indexOf(voice); // Otherwise preserve ordering

    return voicesWithoutNovelty.sort((a, b) => getIndex(a) - getIndex(b));
  }

  /**
   * Voicing as a feature is not translatable. This function gets the "prioritized" voices (as decided by PhET) and
   * prunes out the non-english ones. This does not use this.getPrioritizedVoicesForLocale because the required Locale
   * type doesn't include 'en-US' or 'en_US' as valid values, just 'en'.
   */
  getEnglishPrioritizedVoices() {
    return _.filter(this.getPrioritizedVoices(), voice => {
      // most browsers use dashes to separate the local, Android uses underscore.
      return voice.lang === 'en-US' || voice.lang === 'en_US';
    });
  }

  /**
   * Voicing as a feature is not translatable, but some SpeechSynthesisAnnouncer usages outside of voicing are. This
   * function gets the "prioritized" voices (as decided by PhET) and
   * prunes out everything that is not the "provided" locale. The algorithm for mapping locale is as follows:
   *
   * locale: 'en' - Provided locale parameter
   * voice: 'en_GB' - YES matches!
   * voice: 'en' - YES
   *
   * locale: 'en_GB'
   * voice: 'en' - NO
   * voice: 'en_GB' - YES
   * voice: 'en-GB' - YES
   * voice: 'en-US' - NO
   *
   * locale: 'zh_CN'
   * voice: 'zh' - NO
   * voice: 'zh_CN' - YES
   *
   * locale: 'zh'
   * voice: 'zh' - YES
   * voice: 'zh_CN' - YES
   * voice: 'zh-TW' - YES
   *
   * locale: 'es_ES'
   * voice: 'es_MX' - NO
   * voice: 'es' - NO
   * voice: 'es-ES' - YES
   */
  getPrioritizedVoicesForLocale(locale) {
    // Four letter locales of type Locale include an underscore between the language and the region. Most browser voice
    // names use a dash instead of an underscore, so we need to create a version of the locale with dashes.
    const underscoreLocale = locale;
    const dashLocale = locale.replace('_', '-');
    return _.filter(this.getPrioritizedVoices(), voice => {
      // Handle unsupported locale mapping here, see voiceLangToSupportedLocale and https://github.com/phetsims/number-play/issues/230.
      const voiceLang = voiceLangToSupportedLocale.hasOwnProperty(voice.lang) ? voiceLangToSupportedLocale[voice.lang] : voice.lang;
      let matchesShortLocale = false;
      if (voiceLang.includes('_') || voiceLang.includes('-')) {
        // Mapping zh_CN or zh-CN -> zh
        matchesShortLocale = underscoreLocale === voiceLang.slice(0, 2);
      }

      // while most browsers use dashes to separate the local, Android uses underscore, so compare both types. Loosely
      // compare with includes() so all country-specific voices are available for two-letter Locale codes.
      return matchesShortLocale || underscoreLocale === voiceLang || dashLocale === voiceLang;
    });
  }

  /**
   * Implements announce so the SpeechSynthesisAnnouncer can be a source of output for utteranceQueue.
   */
  announce(announceText, utterance) {
    if (this.initialized && this.canSpeakProperty && this.canSpeakProperty.value) {
      this.requestSpeech(announceText, utterance);
    } else {
      // The announcer is not going to announce this utterance, signify that we are done with it.
      this.handleAnnouncementFailure(utterance, announceText);
    }
  }

  /**
   * The announcement of this utterance has failed in some way, signify to clients of this announcer that the utterance
   * will never complete. For example start/end events on the SpeechSynthesisUtterance will never fire.
   */
  handleAnnouncementFailure(utterance, announceText) {
    this.debug && console.log('announcement failure', announceText);
    this.announcementCompleteEmitter.emit(utterance, announceText);
  }

  /**
   * Use speech synthesis to speak an utterance. No-op unless SpeechSynthesisAnnouncer is initialized and other output
   * controlling Properties are true (see speechAllowedProperty in initialize()). This explicitly ignores
   * this.enabledProperty, allowing speech even when SpeechSynthesisAnnouncer is disabled. This is useful in rare cases, for
   * example when the SpeechSynthesisAnnouncer recently becomes disabled by the user and we need to announce confirmation of
   * that decision ("Voicing off" or "All audio off").
   *
   * NOTE: This will interrupt any currently speaking utterance.
   */
  speakIgnoringEnabled(utterance) {
    if (this.initialized) {
      this.cancel();
      this.requestSpeech(utterance.getAlertText(this.respectResponseCollectorProperties), utterance);
    }
  }

  /**
   * Request speech with SpeechSynthesis.
   */
  requestSpeech(announceText, utterance) {
    assert && assert(SpeechSynthesisAnnouncer.isSpeechSynthesisSupported(), 'trying to speak with speechSynthesis, but it is not supported on this platform');
    this.debug && console.log('requestSpeech', announceText);

    // If the utterance text is null, then opt out early
    if (!announceText) {
      this.handleAnnouncementFailure(utterance, announceText);
      return;
    }

    // Utterance.announcerOptions must be more general to allow this type to apply to any implementation of Announcer, thus "Object" as the provided options.
    const utteranceOptions = optionize3()({}, UTTERANCE_OPTION_DEFAULTS, utterance.announcerOptions);

    // embedding marks (for i18n) impact the output, strip before speaking, type cast number to string if applicable (for number)
    const stringToSpeak = removeBrTags(stripEmbeddingMarks(announceText + ''));

    // Disallow any unfilled template variables to be set in the PDOM.
    validate(stringToSpeak, Validation.STRING_WITHOUT_TEMPLATE_VARS_VALIDATOR);
    const speechSynthUtterance = new SpeechSynthesisUtterance(stringToSpeak);
    speechSynthUtterance.voice = utteranceOptions.voice || this.voiceProperty.value;
    speechSynthUtterance.pitch = this.voicePitchProperty.value;
    speechSynthUtterance.rate = this.voiceRateProperty.value;
    speechSynthUtterance.volume = this.voiceVolumeProperty.value;
    const startListener = () => {
      this.startSpeakingEmitter.emit(stringToSpeak, utterance);
      assert && assert(this.speakingSpeechSynthesisUtteranceWrapper, 'should have been set in requestSpeech');
      this.speakingSpeechSynthesisUtteranceWrapper.started = true;
      speechSynthUtterance.removeEventListener('start', startListener);
    };
    const endListener = () => {
      this.handleSpeechSynthesisEnd(stringToSpeak, speechSynthesisUtteranceWrapper);
    };

    // Keep a reference to the SpeechSynthesisUtterance and the start/endListeners so that we can remove them later.
    // Notice this is used in the function scopes above.
    // IMPORTANT NOTE: Also, this acts as a workaround for a Safari bug where the `end` event does not fire
    // consistently. If the SpeechSynthesisUtterance is not in memory when it is time for the `end` event, Safari
    // will fail to emit that event. See
    // https://stackoverflow.com/questions/23483990/speechsynthesis-api-onend-callback-not-working and
    // https://github.com/phetsims/john-travoltage/issues/435 and https://github.com/phetsims/utterance-queue/issues/52
    const speechSynthesisUtteranceWrapper = new SpeechSynthesisUtteranceWrapper(utterance, announceText, speechSynthUtterance, false, endListener, startListener);
    assert && assert(this.speakingSpeechSynthesisUtteranceWrapper === null, 'Wrapper should be null, we should have received an end event to clear it before the next one.');
    this.speakingSpeechSynthesisUtteranceWrapper = speechSynthesisUtteranceWrapper;
    speechSynthUtterance.addEventListener('start', startListener);
    speechSynthUtterance.addEventListener('end', endListener);

    // In Safari the `end` listener does not fire consistently, (especially after cancel)
    // but the error event does. In this case signify that speaking has ended.
    speechSynthUtterance.addEventListener('error', endListener);

    // Signify to the utterance-queue that we cannot speak yet until this utterance has finished
    this.readyToAnnounce = false;

    // This is generally set in the step function when the synth is not speaking, but there is a Firefox issue where
    // the SpeechSynthesis.speaking is set to `true` asynchronously. So we eagerly reset this timing variable to
    // signify that we need to wait VOICING_UTTERANCE_INTERVAL until we are allowed to speak again.
    // See https://github.com/phetsims/utterance-queue/issues/40
    this.timeSinceUtteranceEnd = 0;

    // Interrupt if the Utterance can no longer be announced.
    utterance.canAnnounceProperty.link(this.boundHandleCanAnnounceChange);
    utterance.voicingCanAnnounceProperty.link(this.boundHandleCanAnnounceChange);
    this.getSynth().speak(speechSynthUtterance);
  }

  /**
   * When a canAnnounceProperty changes to false for an Utterance, that utterance should be cancelled.
   */
  handleCanAnnounceChange() {
    if (this.speakingSpeechSynthesisUtteranceWrapper) {
      this.cancelUtteranceIfCanAnnounceFalse(this.speakingSpeechSynthesisUtteranceWrapper.utterance);
    }
  }

  /**
   * When a canAnnounceProperty changes, cancel the Utterance if the value becomes false.
   */
  cancelUtteranceIfCanAnnounceFalse(utterance) {
    if (!utterance.canAnnounceProperty.value || !utterance.voicingCanAnnounceProperty.value) {
      this.cancelUtterance(utterance);
    }
  }

  /**
   * All the work necessary when we are finished with an utterance, intended for end or cancel.
   * Emits events signifying that we are done with speech and does some disposal.
   */
  handleSpeechSynthesisEnd(stringToSpeak, speechSynthesisUtteranceWrapper) {
    this.endSpeakingEmitter.emit(stringToSpeak, speechSynthesisUtteranceWrapper.utterance);
    this.announcementCompleteEmitter.emit(speechSynthesisUtteranceWrapper.utterance, speechSynthesisUtteranceWrapper.speechSynthesisUtterance.text);
    speechSynthesisUtteranceWrapper.speechSynthesisUtterance.removeEventListener('error', speechSynthesisUtteranceWrapper.endListener);
    speechSynthesisUtteranceWrapper.speechSynthesisUtterance.removeEventListener('end', speechSynthesisUtteranceWrapper.endListener);
    speechSynthesisUtteranceWrapper.speechSynthesisUtterance.removeEventListener('start', speechSynthesisUtteranceWrapper.startListener);

    // The endSpeakingEmitter may end up calling handleSpeechSynthesisEnd in its listeners, we need to be graceful
    const utteranceCanAnnounceProperty = speechSynthesisUtteranceWrapper.utterance.canAnnounceProperty;
    if (utteranceCanAnnounceProperty.hasListener(this.boundHandleCanAnnounceChange)) {
      utteranceCanAnnounceProperty.unlink(this.boundHandleCanAnnounceChange);
    }
    const utteranceVoicingCanAnnounceProperty = speechSynthesisUtteranceWrapper.utterance.voicingCanAnnounceProperty;
    if (utteranceVoicingCanAnnounceProperty.hasListener(this.boundHandleCanAnnounceChange)) {
      utteranceVoicingCanAnnounceProperty.unlink(this.boundHandleCanAnnounceChange);
    }
    this.speakingSpeechSynthesisUtteranceWrapper = null;
  }

  /**
   * Returns a references to the SpeechSynthesis of the SpeechSynthesisAnnouncer that is used to request speech with the Web
   * Speech API. Every references has a check to ensure that the synth is available.
   */
  getSynth() {
    assert && assert(SpeechSynthesisAnnouncer.isSpeechSynthesisSupported(), 'Trying to use SpeechSynthesis, but it is not supported on this platform.');
    return this.synth;
  }

  /**
   * Stops any Utterance that is currently being announced or is (about to be announced).
   * (utterance-queue internal)
   */
  cancel() {
    if (this.initialized) {
      this.speakingSpeechSynthesisUtteranceWrapper && this.cancelUtterance(this.speakingSpeechSynthesisUtteranceWrapper.utterance);
    }
  }

  /**
   * Cancel the provided Utterance, if it is currently being spoken by this Announcer. Does not cancel
   * any other utterances that may be in the UtteranceQueue.
   * (utterance-queue internal)
   */
  cancelUtterance(utterance) {
    const wrapper = this.speakingSpeechSynthesisUtteranceWrapper;
    if (wrapper && utterance === wrapper.utterance) {
      this.handleSpeechSynthesisEnd(wrapper.announceText, wrapper);

      // silence all speech - after handleSpeechSynthesisEnd so we don't do that work twice in case `cancelSynth`
      // also triggers end events immediately (but that doesn't happen on all browsers)
      this.cancelSynth();
    }
  }

  /**
   * Given one utterance, should it cancel another provided utterance?
   */
  shouldUtteranceCancelOther(utterance, utteranceToCancel) {
    // Utterance.announcerOptions must be more general to allow this type to apply to any implementation of Announcer, thus "Object" as the provided options.
    const utteranceOptions = optionize3()({}, UTTERANCE_OPTION_DEFAULTS, utterance.announcerOptions);
    let shouldCancel;
    if (utteranceToCancel.priorityProperty.value !== utterance.priorityProperty.value) {
      shouldCancel = utteranceToCancel.priorityProperty.value < utterance.priorityProperty.value;
    } else {
      shouldCancel = utteranceOptions.cancelOther;
      if (utteranceToCancel && utteranceToCancel === utterance) {
        shouldCancel = utteranceOptions.cancelSelf;
      }
    }
    return shouldCancel;
  }

  /**
   * When the priority for a new utterance changes or if a new utterance is added to the queue, determine whether
   * we should cancel the synth immediately.
   */
  onUtterancePriorityChange(nextAvailableUtterance) {
    // test against what is currently being spoken by the synth
    const wrapper = this.speakingSpeechSynthesisUtteranceWrapper;
    if (wrapper && this.shouldUtteranceCancelOther(nextAvailableUtterance, wrapper.utterance)) {
      this.cancelUtterance(wrapper.utterance);
    }
  }

  /**
   * Cancel the synth. This will silence speech. This will silence any speech and cancel the
   */
  cancelSynth() {
    assert && assert(this.initialized, 'must be initialized to use synth');
    const synth = this.getSynth();
    synth && synth.cancel();
  }

  /**
   * Returns true if SpeechSynthesis is available on the window. This check is sufficient for all of
   * SpeechSynthesisAnnouncer. On platforms where speechSynthesis is available, all features of it are available, except for the
   * onvoiceschanged event in a couple of platforms. However, the listener can still be set
   * without issue on those platforms so we don't need to check for its existence. On those platforms, voices
   * are provided right on load.
   */
  static isSpeechSynthesisSupported() {
    return !!window.speechSynthesis && !!window.SpeechSynthesisUtterance;
  }
}

/**
 * An inner class that combines some objects that are necessary to keep track of to dispose
 * SpeechSynthesisUtterances when it is time. It is also used for the "Safari Workaround" to keep a reference
 * of the SpeechSynthesisUtterance in memory long enough for the 'end' event to be emitted.
 */
class SpeechSynthesisUtteranceWrapper {
  constructor(utterance, announceText, speechSynthesisUtterance, started, endListener, startListener) {
    this.utterance = utterance;
    this.announceText = announceText;
    this.speechSynthesisUtterance = speechSynthesisUtterance;
    this.started = started;
    this.endListener = endListener;
    this.startListener = startListener;
  }
}

/**
 * Remove <br> or <br/> tags from a string
 * @param string - plain text or html string
 */
function removeBrTags(string) {
  return string.split('<br/>').join(' ').split('<br>').join(' ');
}
const SpeechSynthesisVoiceIO = new IOType('SpeechSynthesisVoiceIO', {
  isValidValue: v => true,
  // SpeechSynthesisVoice is not available on window
  toStateObject: speechSynthesisVoice => speechSynthesisVoice.name
});
utteranceQueueNamespace.register('SpeechSynthesisAnnouncer', SpeechSynthesisAnnouncer);
export default SpeechSynthesisAnnouncer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiRW5hYmxlZENvbXBvbmVudCIsIk51bWJlclByb3BlcnR5IiwiUHJvcGVydHkiLCJSYW5nZSIsIm9wdGlvbml6ZSIsIm9wdGlvbml6ZTMiLCJzdHJpcEVtYmVkZGluZ01hcmtzIiwiQW5ub3VuY2VyIiwiVXR0ZXJhbmNlIiwiU3BlZWNoU3ludGhlc2lzUGFyZW50UG9seWZpbGwiLCJ1dHRlcmFuY2VRdWV1ZU5hbWVzcGFjZSIsInN0ZXBUaW1lciIsInBsYXRmb3JtIiwiTXVsdGlsaW5rIiwiVGFuZGVtIiwiSU9UeXBlIiwiTnVsbGFibGVJTyIsInZhbGlkYXRlIiwiVmFsaWRhdGlvbiIsIndpbmRvdyIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwic3BlZWNoU3ludGhlc2lzRnJvbVBhcmVudCIsImluaXRpYWxpemUiLCJFTkdJTkVfV0FLRV9JTlRFUlZBTCIsIlBFTkRJTkdfVVRURVJBTkNFX0RFTEFZIiwiUEFVU0VfUkVTVU1FX1dPUktBUk9VTkRfSU5URVJWQUwiLCJWT0lDSU5HX1VUVEVSQU5DRV9JTlRFUlZBTCIsIk5PVkVMVFlfVk9JQ0VTIiwiaW5pdGlhbGl6ZUNvdW50Iiwidm9pY2VMYW5nVG9TdXBwb3J0ZWRMb2NhbGUiLCJjbW4iLCJ5dWUiLCJ5dWVfSEsiLCJmaWxfUEgiLCJVVFRFUkFOQ0VfT1BUSU9OX0RFRkFVTFRTIiwiY2FuY2VsU2VsZiIsImNhbmNlbE90aGVyIiwidm9pY2UiLCJTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJyZXNwZWN0UmVzcG9uc2VDb2xsZWN0b3JQcm9wZXJ0aWVzIiwiZGVidWciLCJ0YW5kZW0iLCJPUFRJT05BTCIsInZvaWNlUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9WYWx1ZVR5cGUiLCJTcGVlY2hTeW50aGVzaXNWb2ljZUlPIiwicGhldGlvU3RhdGUiLCJwaGV0aW9SZWFkT25seSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJ2b2ljZVJhdGVQcm9wZXJ0eSIsInJhbmdlIiwidm9pY2VQaXRjaFByb3BlcnR5Iiwidm9pY2VWb2x1bWVQcm9wZXJ0eSIsImhhc1Nwb2tlbiIsInRpbWVTaW5jZVdha2luZ0VuZ2luZSIsInRpbWVTaW5jZVBhdXNlUmVzdW1lIiwidGltZVNpbmNlUGVuZGluZ1V0dGVyYW5jZSIsInRpbWVTaW5jZVV0dGVyYW5jZUVuZCIsInN0YXJ0U3BlYWtpbmdFbWl0dGVyIiwicGFyYW1ldGVycyIsInZhbHVlVHlwZSIsImVuZFNwZWFraW5nRW1pdHRlciIsImVuYWJsZWRDb21wb25lbnRJbXBsZW1lbnRhdGlvbiIsImVuYWJsZWQiLCJlbmFibGVkUHJvcGVydHlPcHRpb25zIiwicGhldGlvRmVhdHVyZWQiLCJhc3NlcnQiLCJlbmFibGVkUHJvcGVydHkiLCJpc1NldHRhYmxlIiwibWFpbldpbmRvd1ZvaWNpbmdFbmFibGVkUHJvcGVydHkiLCJ2b2ljaW5nRnVsbHlFbmFibGVkUHJvcGVydHkiLCJhbmQiLCJfc3BlZWNoQWxsb3dlZEFuZEZ1bGx5RW5hYmxlZFByb3BlcnR5Iiwic3BlZWNoQWxsb3dlZEFuZEZ1bGx5RW5hYmxlZFByb3BlcnR5Iiwic3ludGgiLCJ2b2ljZXNQcm9wZXJ0eSIsInNwZWFraW5nU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlciIsImlzSW5pdGlhbGl6ZWRQcm9wZXJ0eSIsImNhblNwZWFrUHJvcGVydHkiLCJib3VuZEhhbmRsZUNhblNwZWFrQ2hhbmdlIiwiaGFuZGxlQ2FuU3BlYWtDaGFuZ2UiLCJiaW5kIiwiYm91bmRIYW5kbGVDYW5Bbm5vdW5jZUNoYW5nZSIsImhhbmRsZUNhbkFubm91bmNlQ2hhbmdlIiwiYW5ub3VuY2VtZW50Q29tcGxldGVFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJ1dHRlcmFuY2UiLCJzdHJpbmciLCJjb25zb2xlIiwibG9nIiwiaW5pdGlhbGl6ZWQiLCJ2YWx1ZSIsInVzZXJHZXN0dXJlRW1pdHRlciIsImlzU3BlZWNoU3ludGhlc2lzU3VwcG9ydGVkIiwic3BlZWNoQWxsb3dlZFByb3BlcnR5Iiwic3BlZWNoU3ludGhlc2lzIiwibGluayIsIm11bHRpbGluayIsInNwZWVjaEFsbG93ZWQiLCJ2b2ljaW5nRnVsbHlFbmFibGVkIiwiZ2V0U3ludGgiLCJhZGRFdmVudExpc3RlbmVyIiwicG9wdWxhdGVWb2ljZXMiLCJzdGFydEVuZ2luZUxpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJzdGVwIiwiZHQiLCJzcGVha2luZyIsInN0YXJ0ZWQiLCJoYW5kbGVTcGVlY2hTeW50aGVzaXNFbmQiLCJhbm5vdW5jZVRleHQiLCJjYW5jZWxTeW50aCIsInJlYWR5VG9Bbm5vdW5jZSIsImNocm9taXVtIiwiYW5kcm9pZCIsImxvY2FsU2VydmljZSIsInBhdXNlIiwicmVzdW1lIiwiY2hyb21lT1MiLCJzcGVhayIsIlNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZSIsImNhblNwZWFrIiwiY2FuY2VsIiwiXyIsInVuaXFCeSIsImdldFZvaWNlcyIsIm5hbWUiLCJnZXRQcmlvcml0aXplZFZvaWNlcyIsImxlbmd0aCIsImFsbFZvaWNlcyIsInNsaWNlIiwidm9pY2VzV2l0aG91dE5vdmVsdHkiLCJmaWx0ZXIiLCJzb21lIiwibm92ZWx0eVZvaWNlIiwiaW5jbHVkZXMiLCJnZXRJbmRleCIsImluZGV4T2YiLCJzb3J0IiwiYSIsImIiLCJnZXRFbmdsaXNoUHJpb3JpdGl6ZWRWb2ljZXMiLCJsYW5nIiwiZ2V0UHJpb3JpdGl6ZWRWb2ljZXNGb3JMb2NhbGUiLCJsb2NhbGUiLCJ1bmRlcnNjb3JlTG9jYWxlIiwiZGFzaExvY2FsZSIsInJlcGxhY2UiLCJ2b2ljZUxhbmciLCJoYXNPd25Qcm9wZXJ0eSIsIm1hdGNoZXNTaG9ydExvY2FsZSIsImFubm91bmNlIiwicmVxdWVzdFNwZWVjaCIsImhhbmRsZUFubm91bmNlbWVudEZhaWx1cmUiLCJlbWl0Iiwic3BlYWtJZ25vcmluZ0VuYWJsZWQiLCJnZXRBbGVydFRleHQiLCJ1dHRlcmFuY2VPcHRpb25zIiwiYW5ub3VuY2VyT3B0aW9ucyIsInN0cmluZ1RvU3BlYWsiLCJyZW1vdmVCclRhZ3MiLCJTVFJJTkdfV0lUSE9VVF9URU1QTEFURV9WQVJTX1ZBTElEQVRPUiIsInNwZWVjaFN5bnRoVXR0ZXJhbmNlIiwicGl0Y2giLCJyYXRlIiwidm9sdW1lIiwic3RhcnRMaXN0ZW5lciIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJlbmRMaXN0ZW5lciIsInNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIiLCJTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyIiwiY2FuQW5ub3VuY2VQcm9wZXJ0eSIsInZvaWNpbmdDYW5Bbm5vdW5jZVByb3BlcnR5IiwiY2FuY2VsVXR0ZXJhbmNlSWZDYW5Bbm5vdW5jZUZhbHNlIiwiY2FuY2VsVXR0ZXJhbmNlIiwic3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlIiwidGV4dCIsInV0dGVyYW5jZUNhbkFubm91bmNlUHJvcGVydHkiLCJoYXNMaXN0ZW5lciIsInVubGluayIsInV0dGVyYW5jZVZvaWNpbmdDYW5Bbm5vdW5jZVByb3BlcnR5Iiwid3JhcHBlciIsInNob3VsZFV0dGVyYW5jZUNhbmNlbE90aGVyIiwidXR0ZXJhbmNlVG9DYW5jZWwiLCJzaG91bGRDYW5jZWwiLCJwcmlvcml0eVByb3BlcnR5Iiwib25VdHRlcmFuY2VQcmlvcml0eUNoYW5nZSIsIm5leHRBdmFpbGFibGVVdHRlcmFuY2UiLCJzcGxpdCIsImpvaW4iLCJpc1ZhbGlkVmFsdWUiLCJ2IiwidG9TdGF0ZU9iamVjdCIsInNwZWVjaFN5bnRoZXNpc1ZvaWNlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVXNlcyB0aGUgV2ViIFNwZWVjaCBBUEkgdG8gcHJvZHVjZSBzcGVlY2ggZnJvbSB0aGUgYnJvd3Nlci4gVGhlcmUgaXMgbm8gc3BlZWNoIG91dHB1dCB1bnRpbCB0aGUgU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyIGhhc1xyXG4gKiBiZWVuIGluaXRpYWxpemVkLiBTdXBwb3J0ZWQgdm9pY2VzIHdpbGwgZGVwZW5kIG9uIHBsYXRmb3JtLiBGb3IgZWFjaCB2b2ljZSwgeW91IGNhbiBjdXN0b21pemUgdGhlIHJhdGUgYW5kIHBpdGNoLlxyXG4gKlxyXG4gKiBPbmx5IG9uZSBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIgY2FuIGJlIHVzZWQgYXQgYSB0aW1lLiBUaGlzIGNsYXNzIHVzZXMgYSBnbG9iYWwgaW5zdGFuY2Ugb2Ygd2luZG93LnNwZWVjaFN5bnRoZXNpc1xyXG4gKiBhbmQgYXNzdW1lcyBpdCBoYXMgZnVsbCBjb250cm9sIG92ZXIgaXQuIFRoaXMgaXMgbm90IGEgc2luZ2xldG9uIGJlY2F1c2Ugc3ViY2xhc3NlcyBtYXkgZXh0ZW5kIHRoaXMgZm9yIHNwZWNpZmljXHJcbiAqIHVzZXMuIEZvciBleGFtcGxlLCBQaEVUIGhhcyBvbmUgc3ViY2xhc3Mgc3BlY2lmaWMgdG8gaXRzIFZvaWNpbmcgZmVhdHVyZSBhbmQgYW5vdGhlciBzcGVjaWZpYyB0b1xyXG4gKiBjdXN0b20gc3BlZWNoIHN5bnRoZXNpcyBpbiBudW1iZXItc3VpdGUtY29tbW9uIHNpbXMuXHJcbiAqXHJcbiAqIEEgbm90ZSBhYm91dCBQaEVULWlPIGluc3RydW1lbnRhdGlvbjpcclxuICogUHJvcGVydGllcyBhcmUgaW5zdHJ1bWVudGVkIGZvciBQaEVULWlPIHRvIHByb3ZpZGUgYSByZWNvcmQgb2YgbGVhcm5lcnMgdGhhdCBtYXkgaGF2ZSB1c2VkIHRoaXMgZmVhdHVyZSAoYW5kIGhvdykuIEFsbFxyXG4gKiBQcm9wZXJ0aWVzIHNob3VsZCBiZSBwaGV0aW9TdGF0ZTpmYWxzZSBzbyB0aGUgdmFsdWVzIGFyZSBub3Qgb3ZlcndyaXR0ZW4gd2hlbiBhIGN1c3RvbWl6ZWQgc3RhdGUgaXMgbG9hZGVkLlxyXG4gKiBQcm9wZXJ0aWVzIGFyZSBub3QgcGhldGlvUmVhZG9ubHkgc28gdGhhdCBjbGllbnRzIGNhbiBvdmVyd3JpdGUgdGhlIHZhbHVlcyB1c2luZyB0aGUgUGhFVC1pTyBBUEkgYW5kIHN0dWRpby5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBFbmFibGVkQ29tcG9uZW50IGZyb20gJy4uLy4uL2F4b24vanMvRW5hYmxlZENvbXBvbmVudC5qcyc7XHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBvcHRpb25pemUzLCBPcHRpb25pemVEZWZhdWx0cyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgc3RyaXBFbWJlZGRpbmdNYXJrcyBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvc3RyaXBFbWJlZGRpbmdNYXJrcy5qcyc7XHJcbmltcG9ydCBBbm5vdW5jZXIsIHsgQW5ub3VuY2VyT3B0aW9ucyB9IGZyb20gJy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9Bbm5vdW5jZXIuanMnO1xyXG5pbXBvcnQgVXR0ZXJhbmNlIGZyb20gJy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2UuanMnO1xyXG5pbXBvcnQgU3BlZWNoU3ludGhlc2lzUGFyZW50UG9seWZpbGwgZnJvbSAnLi9TcGVlY2hTeW50aGVzaXNQYXJlbnRQb2x5ZmlsbC5qcyc7XHJcbmltcG9ydCB1dHRlcmFuY2VRdWV1ZU5hbWVzcGFjZSBmcm9tICcuL3V0dGVyYW5jZVF1ZXVlTmFtZXNwYWNlLmpzJztcclxuaW1wb3J0IHsgUmVzb2x2ZWRSZXNwb25zZSB9IGZyb20gJy4vUmVzcG9uc2VQYWNrZXQuanMnO1xyXG5pbXBvcnQgc3RlcFRpbWVyIGZyb20gJy4uLy4uL2F4b24vanMvc3RlcFRpbWVyLmpzJztcclxuaW1wb3J0IHBsYXRmb3JtIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9wbGF0Zm9ybS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBOdWxsYWJsZUlPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdWxsYWJsZUlPLmpzJztcclxuaW1wb3J0IHZhbGlkYXRlIGZyb20gJy4uLy4uL2F4b24vanMvdmFsaWRhdGUuanMnO1xyXG5pbXBvcnQgVmFsaWRhdGlvbiBmcm9tICcuLi8uLi9heG9uL2pzL1ZhbGlkYXRpb24uanMnO1xyXG5pbXBvcnQgeyBMb2NhbGUgfSBmcm9tICcuLi8uLi9qb2lzdC9qcy9pMThuL2xvY2FsZVByb3BlcnR5LmpzJztcclxuXHJcbi8vIElmIGEgcG9seWZpbGwgZm9yIFNwZWVjaFN5bnRoZXNpcyBpcyByZXF1ZXN0ZWQsIHRyeSB0byBpbml0aWFsaXplIGl0IGhlcmUgYmVmb3JlIFNwZWVjaFN5bnRoZXNpcyB1c2FnZXMuIEZvclxyXG4vLyBub3cgdGhpcyBpcyBhIFBoRVQgc3BlY2lmaWMgZmVhdHVyZSwgYXZhaWxhYmxlIGJ5IHF1ZXJ5IHBhcmFtZXRlciBpbiBpbml0aWFsaXplLWdsb2JhbHMuIFF1ZXJ5U3RyaW5nTWFjaGluZVxyXG4vLyBjYW5ub3QgYmUgdXNlZCBmb3IgdGhpcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMzY2XHJcbmlmICggd2luZG93LnBoZXQgJiYgcGhldC5jaGlwcGVyICYmIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMgJiYgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5zcGVlY2hTeW50aGVzaXNGcm9tUGFyZW50ICkge1xyXG4gIFNwZWVjaFN5bnRoZXNpc1BhcmVudFBvbHlmaWxsLmluaXRpYWxpemUoKTtcclxufVxyXG5cclxuLy8gSW4gbXMsIGhvdyBmcmVxdWVudGx5IHdlIHdpbGwgdXNlIFNwZWVjaFN5bnRoZXNpcyB0byBrZWVwIHRoZSBmZWF0dXJlIGFjdGl2ZS4gQWZ0ZXIgbG9uZyBpbnRlcnZhbHMgd2l0aG91dFxyXG4vLyB1c2luZyBTcGVlY2hTeW50aGVzaXMgQ2hyb21lYm9va3Mgd2lsbCB0YWtlIGEgbG9uZyB0aW1lIHRvIHByb2R1Y2UgdGhlIG5leHQgc3BlZWNoLiBQcmVzdW1hYmx5IGl0IGlzIGRpc2FibGluZ1xyXG4vLyB0aGUgZmVhdHVyZSBhcyBhbiBvcHRpbWl6YXRpb24uIEJ1dCB0aGlzIHdvcmthcm91bmQgZ2V0cyBhcm91bmQgaXQgYW5kIGtlZXBzIHNwZWVjaCBmYXN0LlxyXG5jb25zdCBFTkdJTkVfV0FLRV9JTlRFUlZBTCA9IDUwMDA7XHJcblxyXG4vLyBJbiBtcywgaG93IGxvbmcgdG8gd2FpdCBiZWZvcmUgd2UgY29uc2lkZXIgdGhlIFNwZWVjaFN5bnRoZXNpcyBlbmdpbmUgYXMgaGF2aW5nIGZhaWxlZCB0byBzcGVhayBhIHJlcXVlc3RlZFxyXG4vLyB1dHRlcmFuY2UuIENocm9tZU9TIGFuZCBTYWZhcmkgaW4gcGFydGljdWxhciBtYXkgc2ltcGx5IGZhaWwgdG8gc3BlYWsuIElmIHRoZSBhbW91bnQgb2YgdGltZSBiZXR3ZWVuIG91ciBzcGVhaygpXHJcbi8vIHJlcXVlc3QgYW5kIHRoZSB0aW1lIHdlIHJlY2VpdmUgdGhlIGBzdGFydGAgZXZlbnQgaXMgdG9vIGxvbmcgdGhlbiB3ZSBrbm93IHRoZXJlIHdhcyBhIGZhaWx1cmUgYW5kIHdlIGNhbiB0cnlcclxuLy8gdG8gaGFuZGxlIGFjY29yZGluZ2x5LiBMZW5ndGggaXMgc29tZXdoYXQgYXJiaXRyYXJ5LCBidXQgNSBzZWNvbmRzIGZlbHQgT0sgYW5kIHNlZW1lZCB0byB3b3JrIHdlbGwgdG8gcmVjb3ZlciBmcm9tXHJcbi8vIHRoaXMgZXJyb3IgY2FzZS5cclxuY29uc3QgUEVORElOR19VVFRFUkFOQ0VfREVMQVkgPSA1MDAwO1xyXG5cclxuLy8gSW4gV2luZG93cyBDaHJvbWl1bSwgbG9uZyB1dHRlcmFuY2VzIHdpdGggdGhlIEdvb2dsZSB2b2ljZXMgc2ltcGx5IHN0b3AgYWZ0ZXIgMTUgc2Vjb25kcyBhbmQgd2UgbmV2ZXIgZ2V0IGVuZCBvclxyXG4vLyBjYW5jZWwgZXZlbnRzLiBUaGUgd29ya2Fyb3VuZCBwcm9wb3NlZCBpbiBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD02Nzk0MzcgaXNcclxuLy8gdG8gcGF1c2UvcmVzdW1lIHRoZSB1dHRlcmFuY2UgYXQgYW4gaW50ZXJ2YWwuXHJcbmNvbnN0IFBBVVNFX1JFU1VNRV9XT1JLQVJPVU5EX0lOVEVSVkFMID0gMTAwMDA7XHJcblxyXG4vLyBJbiBtcy4gSW4gU2FmYXJpLCB0aGUgYHN0YXJ0YCBhbmQgYGVuZGAgbGlzdGVuZXIgZG8gbm90IGZpcmUgY29uc2lzdGVudGx5LCBlc3BlY2lhbGx5IGFmdGVyIGludGVycnVwdGlvblxyXG4vLyB3aXRoIGNhbmNlbC4gQnV0IHNwZWFraW5nIGJlaGluZCBhIHRpbWVvdXQvZGVsYXkgaW1wcm92ZXMgdGhlIGJlaGF2aW9yIHNpZ25pZmljYW50bHkuIFRpbWVvdXQgb2YgMTI1IG1zIHdhc1xyXG4vLyBkZXRlcm1pbmVkIHdpdGggdGVzdGluZyB0byBiZSBhIGdvb2QgdmFsdWUgdG8gdXNlLiBWYWx1ZXMgbGVzcyB0aGFuIDEyNSBicm9rZSB0aGUgd29ya2Fyb3VuZCwgd2hpbGUgbGFyZ2VyXHJcbi8vIHZhbHVlcyBmZWVsIHRvbyBzbHVnZ2lzaC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2huLXRyYXZvbHRhZ2UvaXNzdWVzLzQzNVxyXG4vLyBCZXdhcmUgdGhhdCBVdHRlcmFuY2VRdWV1ZVRlc3RzIHVzZSB0aGlzIHZhbHVlIHRvby4gRG9uJ3QgY2hhbmdlIHdpdGhvdXQgY2hlY2tpbmcgdGhvc2UgdGVzdHMuXHJcbmNvbnN0IFZPSUNJTkdfVVRURVJBTkNFX0lOVEVSVkFMID0gMTI1O1xyXG5cclxuLy8gQSBsaXN0IG9mIFwibm92ZWx0eVwiIHZvaWNlcyBtYWRlIGF2YWlsYWJsZSBieSB0aGUgb3BlcmF0aW5nIHN5c3RlbS4uLmZvciBzb21lIHJlYXNvbi4gVGhlcmUgaXMgbm90aGluZyBzcGVjaWFsIGFib3V0XHJcbi8vIHRoZXNlIG5vdmVsdHkgU3BlZWNoU3ludGhlc2lzVm9pY2VzIHRvIGV4Y2x1ZGUgdGhlbS4gU28gaGF2aW5nIGEgbGlzdCB0byBleGNsdWRlIGJ5IG5hbWUgYW5kIG1haW50aW5pbmcgb3ZlciB0aW1lXHJcbi8vIGlzIHRoZSBiZXN0IHdlIGNhbiBkby5cclxuY29uc3QgTk9WRUxUWV9WT0lDRVMgPSBbXHJcbiAgJ0FsYmVydCcsXHJcbiAgJ0JhZCBOZXdzJyxcclxuICAnQmFoaCcsXHJcbiAgJ0JlbGxzJyxcclxuICAnQm9pbmcnLFxyXG4gICdCdWJibGVzJyxcclxuICAnQ2VsbG9zJyxcclxuICAnR29vZCBOZXdzJyxcclxuICAnSmVzdGVyJyxcclxuICAnT3JnYW4nLFxyXG4gICdTdXBlcnN0YXInLFxyXG4gICdUcmlub2lkcycsXHJcbiAgJ1doaXNwZXInLFxyXG4gICdXb2JibGUnLFxyXG4gICdaYXJ2b3gnLFxyXG5cclxuICAvLyBub3QgdGVjaG5pY2FsbHkgXCJub3ZlbHR5XCIgYnV0IHN0aWxsIHNvdW5kIHRvbyBiYWQgYW5kIHdvdWxkIGJlIGRpc3RyYWN0aW5nIHRvIHVzZXJzLCBzZWVcclxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdXR0ZXJhbmNlLXF1ZXVlL2lzc3Vlcy85MyNpc3N1ZWNvbW1lbnQtMTMwMzkwMTQ4NFxyXG4gICdGbG8nLFxyXG4gICdHcmFuZG1hJyxcclxuICAnR3JhbmRwYScsXHJcbiAgJ0p1bmlvcidcclxuXTtcclxuXHJcbi8vIE9ubHkgb25lIGluc3RhbmNlIG9mIFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlciBjYW4gYmUgaW5pdGlhbGl6ZWQsIHNlZSB0b3AgbGV2ZWwgdHlwZSBkb2N1bWVudGF0aW9uLlxyXG5sZXQgaW5pdGlhbGl6ZUNvdW50ID0gMDtcclxuXHJcbnR5cGUgU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VPcHRpb25zID0ge1xyXG4gIGNhbmNlbFNlbGY/OiBib29sZWFuO1xyXG4gIGNhbmNlbE90aGVyPzogYm9vbGVhbjtcclxuICB2b2ljZT86IFNwZWVjaFN5bnRoZXNpc1ZvaWNlIHwgbnVsbDtcclxufTtcclxuXHJcbi8vIFRoZSBTcGVlY2hTeW50aGVzaXNWb2ljZS5sYW5nIHByb3BlcnR5IGhhcyBhIHNjaGVtYSB0aGF0IGlzIGRpZmZlcmVudCBmcm9tIG91ciBsb2NhbGUgKHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvU3BlZWNoU3ludGhlc2lzVm9pY2UvbGFuZylcclxuLy8gQXMgYSByZXN1bHQsIG1hbnVhbGx5IG1hcCBhIGNvdXBsZSBpbXBvcnRhbnQgdmFsdWVzIGJhY2sgdG8gb3VyIG93biBzdXBwb3J0ZWQgbG9jYWxlcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9udW1iZXItcGxheS9pc3N1ZXMvMjMwLlxyXG4vLyBZb3UgY2FuIHRlc3QgdGhhdCB0aGlzIG1hcCBpcyB3b3JraW5nIHdpdGggc29tZXRoaW5nIGxpa2UgYCdlbi1HQic6ICdlcydgXHJcbmNvbnN0IHZvaWNlTGFuZ1RvU3VwcG9ydGVkTG9jYWxlOiBSZWNvcmQ8c3RyaW5nLCBMb2NhbGU+ID0ge1xyXG4gIGNtbjogJ3poX0NOJyxcclxuICB5dWU6ICd6aF9ISycsXHJcbiAgJ3l1ZS1ISyc6ICd6aF9ISycsXHJcbiAgeXVlX0hLOiAnemhfSEsnLFxyXG4gICdmaWwtUEgnOiAndGwnLCAvLyBJU08gNjM5LTEgZG9lcyBub3Qgc3VwcG9ydCBmaWxpcGlubywgc28gdGhpcyBpcyBiZXR0ZXIgdGhhbiBub3RoaW5nIChzaW5jZSBpdCBoYXMgdHJhbnNsYXRpb24gc3VwcG9ydClcclxuICBmaWxfUEg6ICd0bCdcclxufTtcclxuXHJcbmNvbnN0IFVUVEVSQU5DRV9PUFRJT05fREVGQVVMVFM6IE9wdGlvbml6ZURlZmF1bHRzPFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlT3B0aW9ucz4gPSB7XHJcblxyXG4gIC8vIElmIHRydWUgYW5kIHRoaXMgVXR0ZXJhbmNlIGlzIGN1cnJlbnRseSBiZWluZyBzcG9rZW4gYnkgdGhlIHNwZWVjaCBzeW50aCwgYW5ub3VuY2luZyBpdFxyXG4gIC8vIHRvIHRoZSBxdWV1ZSBhZ2FpbiB3aWxsIGltbWVkaWF0ZWx5IGNhbmNlbCB0aGUgc3ludGggYW5kIG5ldyBjb250ZW50IHdpbGwgYmVcclxuICAvLyBzcG9rZW4uIE90aGVyd2lzZSwgbmV3IGNvbnRlbnQgZm9yIHRoaXMgdXR0ZXJhbmNlIHdpbGwgYmUgc3Bva2VuIHdoZW5ldmVyIHRoZSBvbGRcclxuICAvLyBjb250ZW50IGhhcyBmaW5pc2hlZCBzcGVha2luZy4gVXNlZCB3aGVuIGFkZGluZyB0aGUgVXR0ZXJhbmNlIHRvIGJlIHNwb2tlbi5cclxuICBjYW5jZWxTZWxmOiB0cnVlLFxyXG5cclxuICAvLyBPbmx5IGFwcGxpZXMgdG8gdHdvIFV0dGVyYW5jZXMgd2l0aCB0aGUgc2FtZSBwcmlvcml0eS4gSWYgdHJ1ZSBhbmQgYW5vdGhlciBVdHRlcmFuY2UgaXMgY3VycmVudGx5XHJcbiAgLy8gYmVpbmcgc3Bva2VuIGJ5IHRoZSBzcGVlY2ggc3ludGggKG9yIHF1ZXVlZCBieSBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIpLCBhbm5vdW5jaW5nIHRoaXMgVXR0ZXJhbmNlIHdpbGwgaW1tZWRpYXRlbHkgY2FuY2VsXHJcbiAgLy8gdGhlIG90aGVyIGNvbnRlbnQgYmVpbmcgc3Bva2VuIGJ5IHRoZSBzeW50aC4gT3RoZXJ3aXNlLCBjb250ZW50IGZvciB0aGUgbmV3IHV0dGVyYW5jZSB3aWxsIGJlIHNwb2tlbiBhcyBzb29uIGFzXHJcbiAgLy8gdGhlIGJyb3dzZXIgZmluaXNoZXMgc3BlYWtpbmcgdGhlIHV0dGVyYW5jZXMgaW4gZnJvbnQgb2YgaXQgaW4gbGluZS4gVXNlZCB3aGVuIGFkZGluZyB0aGUgVXR0ZXJhbmNlIHRvIGJlIHNwb2tlbi5cclxuICBjYW5jZWxPdGhlcjogdHJ1ZSxcclxuXHJcbiAgLy8gUHJvdmlkZSBhIHNwZWNpZmljIFNwZWVjaFN5bnRoZXNpc1ZvaWNlIGZvciBvbmx5IHRoaXMgVXR0ZXJhbmNlLCBvciBpZiBudWxsIHVzZSB0aGUgQW5ub3VuY2VyJ3MgZ2VuZXJhbFxyXG4gIC8vIHZvaWNlUHJvcGVydHkgdmFsdWUuIFVzZWQgd2hlbiBzcGVha2luZyB0aGUgVXR0ZXJhbmNlLlxyXG4gIHZvaWNlOiBudWxsXHJcbn07XHJcblxyXG4vLyBPcHRpb25zIHRvIHRoZSBpbml0aWFsaXplIGZ1bmN0aW9uXHJcbmV4cG9ydCB0eXBlIFNwZWVjaFN5bnRoZXNpc0luaXRpYWxpemVPcHRpb25zID0ge1xyXG4gIHNwZWVjaEFsbG93ZWRQcm9wZXJ0eT86IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+O1xyXG59O1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuXHJcbiAgLy8gU3dpdGNoIHRvIHRydWUgdG8gZW5hYmxlIGRlYnVnZ2luZyBmZWF0dXJlcyAobGlrZSBsb2dnaW5nKVxyXG4gIGRlYnVnPzogYm9vbGVhbjtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlck9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIEFubm91bmNlck9wdGlvbnM7XHJcblxyXG5jbGFzcyBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIgZXh0ZW5kcyBBbm5vdW5jZXIge1xyXG4gIHB1YmxpYyByZWFkb25seSB2b2ljZVByb3BlcnR5OiBQcm9wZXJ0eTxudWxsIHwgU3BlZWNoU3ludGhlc2lzVm9pY2U+O1xyXG5cclxuICAvLyBjb250cm9scyB0aGUgc3BlYWtpbmcgcmF0ZSBvZiBXZWIgU3BlZWNoXHJcbiAgcHVibGljIHJlYWRvbmx5IHZvaWNlUmF0ZVByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuXHJcbiAgLy8gY29udHJvbHMgdGhlIHBpdGNoIG9mIHRoZSBzeW50aFxyXG4gIHB1YmxpYyByZWFkb25seSB2b2ljZVBpdGNoUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG5cclxuICAvLyBDb250cm9scyB2b2x1bWUgb2YgdGhlIHN5bnRoLiBJbnRlbmRlZCBmb3IgdXNlIHdpdGggdW5pdCB0ZXN0cyBvbmx5ISFcclxuICBwcml2YXRlIHJlYWRvbmx5IHZvaWNlVm9sdW1lUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG5cclxuICAvLyBJbiBtcywgaG93IGxvbmcgdG8gZ28gYmVmb3JlIFwid2FraW5nIHRoZSBTcGVlY2hTeW50aGVzaXNcIiBlbmdpbmUgdG8ga2VlcCBzcGVlY2hcclxuICAvLyBmYXN0IG9uIENocm9tZWJvb2tzLCBzZWUgZG9jdW1lbnRhdGlvbiBhcm91bmQgRU5HSU5FX1dBS0VfSU5URVJWQUwuXHJcbiAgcHJpdmF0ZSB0aW1lU2luY2VXYWtpbmdFbmdpbmU6IG51bWJlcjtcclxuXHJcbiAgLy8gSW4gbXMsIGhvdyBsb25nIHNpbmNlIHdlIGhhdmUgYXBwbGllZCB0aGUgXCJwYXVzZS9yZXN1bWVcIiB3b3JrYXJvdW5kIGZvciBsb25nIHV0dGVyYW5jZXMgaW4gQ2hyb21pdW0uIFZlcnlcclxuICAvLyBsb25nIFNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZXMgKGxvbmdlciB0aGFuIDE1IHNlY29uZHMpIGdldCBjdXQgb24gQ2hyb21pdW0gYW5kIHdlIG5ldmVyIGdldCBcImVuZFwiIG9yIFwiY2FuY2VsXCJcclxuICAvLyBldmVudHMgZHVlIHRvIGEgcGxhdGZvcm0gYnVnLCBzZWUgaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9Njc5NDM3LlxyXG4gIHByaXZhdGUgdGltZVNpbmNlUGF1c2VSZXN1bWU6IG51bWJlcjtcclxuXHJcbiAgLy8gSW4gbXMsIGhvdyBsb25nIGl0IGhhcyBiZWVuIHNpbmNlIHdlIHJlcXVlc3RlZCBzcGVlY2ggb2YgYSBuZXcgdXR0ZXJhbmNlIGFuZCB3aGVuXHJcbiAgLy8gdGhlIHN5bnRoIGhhcyBzdWNjZXNzZnVsbHkgc3RhcnRlZCBzcGVha2luZyBpdC4gSXQgaXMgcG9zc2libGUgdGhhdCB0aGUgc3ludGggd2lsbCBmYWlsIHRvIHNwZWFrIHNvIGlmXHJcbiAgLy8gdGhpcyB0aW1lciBnZXRzIHRvbyBoaWdoIHdlIGhhbmRsZSB0aGUgZmFpbHVyZSBjYXNlLlxyXG4gIHByaXZhdGUgdGltZVNpbmNlUGVuZGluZ1V0dGVyYW5jZTogbnVtYmVyO1xyXG5cclxuICAvLyBBbW91bnQgb2YgdGltZSBpbiBtcyB0byB3YWl0IGJldHdlZW4gc3BlYWtpbmcgU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlcywgc2VlXHJcbiAgLy8gVk9JQ0lOR19VVFRFUkFOQ0VfSU5URVJWQUwgZm9yIGRldGFpbHMgYWJvdXQgd2h5IHRoaXMgaXMgbmVjZXNzYXJ5LiBJbml0aWFsaXplZCB0byB0aGUgaW50ZXJ2YWwgdmFsdWVcclxuICAvLyBzbyB0aGF0IHdlIGNhbiBzcGVhayBpbnN0YW50bHkgdGhlIGZpcnN0IHRpbWUuXHJcbiAgcHJpdmF0ZSB0aW1lU2luY2VVdHRlcmFuY2VFbmQ6IG51bWJlcjtcclxuXHJcbiAgLy8gZW1pdHMgZXZlbnRzIHdoZW4gdGhlIHNwZWFrZXIgc3RhcnRzL3N0b3BzIHNwZWFraW5nLCB3aXRoIHRoZSBVdHRlcmFuY2UgdGhhdCBpc1xyXG4gIC8vIGVpdGhlciBzdGFydGluZyBvciBzdG9wcGluZ1xyXG4gIHB1YmxpYyByZWFkb25seSBzdGFydFNwZWFraW5nRW1pdHRlcjogVEVtaXR0ZXI8WyBSZXNvbHZlZFJlc3BvbnNlLCBVdHRlcmFuY2UgXT47XHJcbiAgcHVibGljIHJlYWRvbmx5IGVuZFNwZWFraW5nRW1pdHRlcjogVEVtaXR0ZXI8WyBSZXNvbHZlZFJlc3BvbnNlLCBVdHRlcmFuY2UgXT47XHJcblxyXG4gIC8vIFRvIGdldCBhcm91bmQgbXVsdGlwbGUgaW5oZXJpdGFuY2UgaXNzdWVzLCBjcmVhdGUgZW5hYmxlZFByb3BlcnR5IHZpYSBjb21wb3NpdGlvbiBpbnN0ZWFkLCB0aGVuIGNyZWF0ZVxyXG4gIC8vIGEgcmVmZXJlbmNlIG9uIHRoaXMgY29tcG9uZW50IGZvciB0aGUgZW5hYmxlZFByb3BlcnR5XHJcbiAgcHJpdmF0ZSBlbmFibGVkQ29tcG9uZW50SW1wbGVtZW50YXRpb246IEVuYWJsZWRDb21wb25lbnQ7XHJcbiAgcHVibGljIHJlYWRvbmx5IGVuYWJsZWRQcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICAvLyBDb250cm9scyB3aGV0aGVyIFZvaWNpbmcgaXMgZW5hYmxlZCBpbiBhIFwibWFpbiB3aW5kb3dcIiBhcmVhIG9mIHRoZSBhcHBsaWNhdGlvbi5cclxuICAvLyBUaGlzIHN1cHBvcnRzIHRoZSBhYmlsaXR5IHRvIGRpc2FibGUgVm9pY2luZyBmb3IgdGhlIGltcG9ydGFudCBzY3JlZW4gY29udGVudCBvZiB5b3VyIGFwcGxpY2F0aW9uIHdoaWxlIGtlZXBpbmdcclxuICAvLyBWb2ljaW5nIGZvciBzdXJyb3VuZGluZyBVSSBjb21wb25lbnRzIGVuYWJsZWQgKGZvciBleGFtcGxlKS5cclxuICBwdWJsaWMgcmVhZG9ubHkgbWFpbldpbmRvd1ZvaWNpbmdFbmFibGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICAvLyBQcm9wZXJ0eSB0aGF0IGluZGljYXRlcyB0aGF0IHRoZSBWb2ljaW5nIGZlYXR1cmUgaXMgZW5hYmxlZCBmb3IgYWxsIGFyZWFzIG9mIHRoZSBhcHBsaWNhdGlvbi5cclxuICBwdWJsaWMgdm9pY2luZ0Z1bGx5RW5hYmxlZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gSW5kaWNhdGVzIHdoZXRoZXIgc3BlZWNoIGlzIGZ1bGx5IGVuYWJsZWQgQU5EIHNwZWVjaCBpcyBhbGxvd2VkLCBhcyBzcGVjaWZpZWRcclxuICAvLyBieSB0aGUgUHJvcGVydHkgcHJvdmlkZWQgaW4gaW5pdGlhbGl6ZSgpLiBTZWUgc3BlZWNoQWxsb3dlZFByb3BlcnR5IG9mIGluaXRpYWxpemUoKS4gSW4gb3JkZXIgZm9yIHRoaXMgUHJvcGVydHlcclxuICAvLyB0byBiZSB0cnVlLCBzcGVlY2hBbGxvd2VkUHJvcGVydHksIGVuYWJsZWRQcm9wZXJ0eSwgYW5kIG1haW5XaW5kb3dWb2ljaW5nRW5hYmxlZFByb3BlcnR5IG11c3QgYWxsIGJlIHRydWUuXHJcbiAgLy8gSW5pdGlhbGl6ZWQgaW4gdGhlIGNvbnN0cnVjdG9yIGJlY2F1c2Ugd2UgZG9uJ3QgaGF2ZSBhY2Nlc3MgdG8gYWxsIHRoZSBkZXBlbmRlbmN5IFByb3BlcnRpZXMgdW50aWwgaW5pdGlhbGl6ZS5cclxuICAvLyBUaGVzZSB0d28gdmFyaWFibGUga2VlcCBhIHB1YmxpYywgcmVhZG9ubHkgaW50ZXJmYWNlLiBXZSBjYW5ub3QgdXNlIGEgRGVyaXZlZFByb3BlcnR5IGJlY2F1c2UgaXQgbmVlZHMgdG8gYmVcclxuICAvLyBsaXN0ZW5lZCB0byBiZWZvcmUgaXRzIGRlcGVuZGVuY2llcyBhcmUgY3JlYXRlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy91dHRlcmFuY2UtcXVldWUvaXNzdWVzLzcyXHJcbiAgcHVibGljIHJlYWRvbmx5IHNwZWVjaEFsbG93ZWRBbmRGdWxseUVuYWJsZWRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfc3BlZWNoQWxsb3dlZEFuZEZ1bGx5RW5hYmxlZFByb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIHN5bnRoIGZyb20gV2ViIFNwZWVjaCBBUEkgdGhhdCBkcml2ZXMgc3BlZWNoLCBkZWZpbmVkIG9uIGluaXRpYWxpemVcclxuICBwcml2YXRlIHN5bnRoOiBudWxsIHwgU3BlZWNoU3ludGhlc2lzO1xyXG5cclxuICAvLyBwb3NzaWJsZSB2b2ljZXMgZm9yIFdlYiBTcGVlY2ggc3ludGhlc2lzXHJcbiAgcHVibGljIHZvaWNlc1Byb3BlcnR5OiBUUHJvcGVydHk8U3BlZWNoU3ludGhlc2lzVm9pY2VbXT47XHJcblxyXG4gIC8vIEhvbGRzIGEgcmVmZXJlbmNlIHRvIHRoZSBVdHRlcmFuY2UgdGhhdCBpcyBhY3RpdmVseSBiZWluZyBzcG9rZW4gYnkgdGhlIGFubm91bmNlci4gTm90ZSB0aGF0IGRlcGVuZGluZ1xyXG4gIC8vIG9uIHRoZSBwbGF0Zm9ybSwgdGhlcmUgbWF5IGJlIGEgZGVsYXkgYmV0d2VlbiB0aGUgc3BlYWsoKSByZXF1ZXN0IGFuZCB3aGVuIHRoZSBzeW50aCBhY3R1YWxseSBzdGFydHMgc3BlYWtpbmcuXHJcbiAgLy8gS2VlcGluZyBhIHJlZmVyZW5jZSBzdXBwb3J0cyBjYW5jZWxsaW5nLCBwcmlvcml0eSBjaGFuZ2VzLCBhbmQgY2xlYW5pbmcgd2hlbiBmaW5pc2hlZCBzcGVha2luZy5cclxuICBwcml2YXRlIHNwZWFraW5nU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlcjogU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlciB8IG51bGw7XHJcblxyXG4gIC8vIGlzIHRoZSBWb2ljaW5nTWFuYWdlciBpbml0aWFsaXplZCBmb3IgdXNlPyBUaGlzIGlzIHByb3RvdHlwYWwgc28gaXQgaXNuJ3QgYWx3YXlzIGluaXRpYWxpemVkXHJcbiAgcHVibGljIGlzSW5pdGlhbGl6ZWRQcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICAvLyBDb250cm9scyB3aGV0aGVyIHNwZWVjaCBpcyBhbGxvd2VkIHdpdGggc3ludGhlc2lzLiBOdWxsIHVudGlsIGluaXRpYWxpemVkLCBhbmQgY2FuIGJlIHNldCBieSBvcHRpb25zIHRvXHJcbiAgLy8gaW5pdGlhbGl6ZSgpLlxyXG4gIHByaXZhdGUgY2FuU3BlYWtQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4gfCBudWxsO1xyXG5cclxuICAvLyBib3VuZCBzbyB3ZSBjYW4gbGluayBhbmQgdW5saW5rIHRvIHRoaXMuY2FuU3BlYWtQcm9wZXJ0eSB3aGVuIHRoZSBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIgYmVjb21lcyBpbml0aWFsaXplZC5cclxuICBwcml2YXRlIHJlYWRvbmx5IGJvdW5kSGFuZGxlQ2FuU3BlYWtDaGFuZ2U6ICggY2FuU3BlYWs6IGJvb2xlYW4gKSA9PiB2b2lkO1xyXG5cclxuICAvLyBBIGxpc3RlbmVyIHRoYXQgd2lsbCBjYW5jZWwgdGhlIFV0dGVyYW5jZSB0aGF0IGlzIGJlaW5nIGFubm91bmNlZCBpZiBpdHMgY2FuQW5ub3VuY2VQcm9wZXJ0eSBiZWNvbWVzIGZhbHNlLlxyXG4gIC8vIFNldCB3aGVuIHRoaXMgQW5ub3VuY2VyIGJlZ2lucyB0byBhbm5vdW5jZSBhIG5ldyBVdHRlcmFuY2UgYW5kIGNsZWFyZWQgd2hlbiB0aGUgVXR0ZXJhbmNlIGlzIGZpbmlzaGVkL2NhbmNlbGxlZC5cclxuICAvLyBCb3VuZCBzbyB0aGF0IHRoZSBsaXN0ZW5lciBjYW4gYmUgYWRkZWQgYW5kIHJlbW92ZWQgb24gVXR0ZXJhbmNlcyB3aXRob3V0IGNyZWF0aW5nIG1hbnkgY2xvc3VyZXMuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBib3VuZEhhbmRsZUNhbkFubm91bmNlQ2hhbmdlOiAoIGNhbkFubm91bmNlOiBib29sZWFuICkgPT4gdm9pZDtcclxuXHJcbiAgLy8gU3dpdGNoIHRvIHRydWUgdG8gZW5hYmxlIGRlYnVnZ2luZyBmZWF0dXJlcyAobGlrZSBsb2dnaW5nKVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGVidWc6IGJvb2xlYW47XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlck9wdGlvbnMsIFNlbGZPcHRpb25zLCBBbm5vdW5jZXJPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIgZ2VuZXJhbGx5IGRvZXNuJ3QgY2FyZSBhYm91dCBSZXNwb25zZUNvbGxlY3RvclByb3BlcnRpZXMsXHJcbiAgICAgIC8vIHRoYXQgaXMgbW9yZSBzcGVjaWZpYyB0byB0aGUgVm9pY2luZyBmZWF0dXJlLlxyXG4gICAgICByZXNwZWN0UmVzcG9uc2VDb2xsZWN0b3JQcm9wZXJ0aWVzOiBmYWxzZSxcclxuXHJcbiAgICAgIGRlYnVnOiBmYWxzZSxcclxuXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVElPTkFMXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuZGVidWcgPSBvcHRpb25zLmRlYnVnO1xyXG5cclxuICAgIHRoaXMudm9pY2VQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eTxudWxsIHwgU3BlZWNoU3ludGhlc2lzVm9pY2U+KCBudWxsLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndm9pY2VQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdWxsYWJsZUlPKCBTcGVlY2hTeW50aGVzaXNWb2ljZUlPICksXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0aGUgdm9pY2UgdGhhdCBpcyBjdXJyZW50bHkgdm9pY2luZyByZXNwb25zZXMnXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnZvaWNlUmF0ZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxLjAsIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMC43NSwgMiApLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZvaWNlUmF0ZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdjaGFuZ2VzIHRoZSByYXRlIG9mIHRoZSB2b2ljaW5nLWZlYXR1cmUgdm9pY2UnXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnZvaWNlUGl0Y2hQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMS4wLCB7XHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAuNSwgMiApLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZvaWNlUGl0Y2hQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnY2hhbmdlcyB0aGUgcGl0Y2ggb2YgdGhlIHZvaWNpbmctZmVhdHVyZSB2b2ljZSdcclxuICAgIH0gKTtcclxuICAgIHRoaXMudm9pY2VWb2x1bWVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMS4wLCB7XHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDEgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEluZGljYXRlcyB3aGV0aGVyIHNwZWVjaCB1c2luZyBTcGVlY2hTeW50aGVzaXMgaGFzIGJlZW4gcmVxdWVzdGVkIGF0IGxlYXN0IG9uY2UuXHJcbiAgICAvLyBUaGUgZmlyc3QgdGltZSBzcGVlY2ggaXMgcmVxdWVzdGVkLCBpdCBtdXN0IGJlIGRvbmUgc3luY2hyb25vdXNseSBmcm9tIHVzZXIgaW5wdXQgd2l0aCBhYnNvbHV0ZWx5IG5vIGRlbGF5LlxyXG4gICAgLy8gcmVxdWVzdFNwZWVjaCgpIGdlbmVyYWxseSB1c2VzIGEgdGltZW91dCB0byB3b3JrYXJvdW5kIGJyb3dzZXIgYnVncywgYnV0IHRob3NlIGNhbm5vdCBiZSB1c2VkIHVudGlsIGFmdGVyIHRoZVxyXG4gICAgLy8gZmlyc3QgcmVxdWVzdCBmb3Igc3BlZWNoLlxyXG4gICAgdGhpcy5oYXNTcG9rZW4gPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnRpbWVTaW5jZVdha2luZ0VuZ2luZSA9IDA7XHJcbiAgICB0aGlzLnRpbWVTaW5jZVBhdXNlUmVzdW1lID0gMDtcclxuXHJcbiAgICB0aGlzLnRpbWVTaW5jZVBlbmRpbmdVdHRlcmFuY2UgPSAwO1xyXG5cclxuICAgIHRoaXMudGltZVNpbmNlVXR0ZXJhbmNlRW5kID0gVk9JQ0lOR19VVFRFUkFOQ0VfSU5URVJWQUw7XHJcblxyXG4gICAgdGhpcy5zdGFydFNwZWFraW5nRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7IHBhcmFtZXRlcnM6IFsgeyB2YWx1ZVR5cGU6ICdzdHJpbmcnIH0sIHsgdmFsdWVUeXBlOiBVdHRlcmFuY2UgfSBdIH0gKTtcclxuICAgIHRoaXMuZW5kU3BlYWtpbmdFbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHsgcGFyYW1ldGVyczogWyB7IHZhbHVlVHlwZTogJ3N0cmluZycgfSwgeyB2YWx1ZVR5cGU6IFV0dGVyYW5jZSB9IF0gfSApO1xyXG5cclxuICAgIHRoaXMuZW5hYmxlZENvbXBvbmVudEltcGxlbWVudGF0aW9uID0gbmV3IEVuYWJsZWRDb21wb25lbnQoIHtcclxuXHJcbiAgICAgIC8vIGluaXRpYWwgdmFsdWUgZm9yIHRoZSBlbmFibGVkUHJvcGVydHksIGZhbHNlIGJlY2F1c2Ugc3BlZWNoIHNob3VsZCBub3QgaGFwcGVuIHVudGlsIHJlcXVlc3RlZCBieSB1c2VyXHJcbiAgICAgIGVuYWJsZWQ6IGZhbHNlLFxyXG5cclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbSxcclxuICAgICAgZW5hYmxlZFByb3BlcnR5T3B0aW9uczoge1xyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0b2dnbGVzIHRoaXMgY29udHJvbGxlciBvZiBTcGVlY2hTeW50aGVzaXMgb24gYW5kIG9mZicsXHJcbiAgICAgICAgcGhldGlvU3RhdGU6IGZhbHNlLFxyXG4gICAgICAgIHBoZXRpb0ZlYXR1cmVkOiBmYWxzZVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5lbmFibGVkQ29tcG9uZW50SW1wbGVtZW50YXRpb24uZW5hYmxlZFByb3BlcnR5LmlzU2V0dGFibGUoKSwgJ2VuYWJsZWRQcm9wZXJ0eSBtdXN0IGJlIHNldHRhYmxlJyApO1xyXG4gICAgdGhpcy5lbmFibGVkUHJvcGVydHkgPSB0aGlzLmVuYWJsZWRDb21wb25lbnRJbXBsZW1lbnRhdGlvbi5lbmFibGVkUHJvcGVydHk7XHJcblxyXG4gICAgdGhpcy5tYWluV2luZG93Vm9pY2luZ0VuYWJsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtYWluV2luZG93Vm9pY2luZ0VuYWJsZWRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndG9nZ2xlcyB0aGUgdm9pY2luZyBmZWF0dXJlIG9uIGFuZCBvZmYgZm9yIHRoZSBzaW11bGF0aW9uIHNjcmVlbiAobm90IHRoZSB2b2ljaW5nIHByZWZlcmVuY2VzIGFuZCB0b29sYmFyIGNvbnRyb2xzKSdcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnZvaWNpbmdGdWxseUVuYWJsZWRQcm9wZXJ0eSA9IERlcml2ZWRQcm9wZXJ0eS5hbmQoIFsgdGhpcy5lbmFibGVkUHJvcGVydHksIHRoaXMubWFpbldpbmRvd1ZvaWNpbmdFbmFibGVkUHJvcGVydHkgXSApO1xyXG5cclxuICAgIHRoaXMuX3NwZWVjaEFsbG93ZWRBbmRGdWxseUVuYWJsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgICB0aGlzLnNwZWVjaEFsbG93ZWRBbmRGdWxseUVuYWJsZWRQcm9wZXJ0eSA9IHRoaXMuX3NwZWVjaEFsbG93ZWRBbmRGdWxseUVuYWJsZWRQcm9wZXJ0eTtcclxuXHJcbiAgICB0aGlzLnN5bnRoID0gbnVsbDtcclxuICAgIHRoaXMudm9pY2VzUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIFtdICk7XHJcblxyXG4gICAgdGhpcy5zcGVha2luZ1NwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIgPSBudWxsO1xyXG4gICAgdGhpcy5pc0luaXRpYWxpemVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG4gICAgdGhpcy5jYW5TcGVha1Byb3BlcnR5ID0gbnVsbDtcclxuICAgIHRoaXMuYm91bmRIYW5kbGVDYW5TcGVha0NoYW5nZSA9IHRoaXMuaGFuZGxlQ2FuU3BlYWtDaGFuZ2UuYmluZCggdGhpcyApO1xyXG4gICAgdGhpcy5ib3VuZEhhbmRsZUNhbkFubm91bmNlQ2hhbmdlID0gdGhpcy5oYW5kbGVDYW5Bbm5vdW5jZUNoYW5nZS5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLmRlYnVnICkge1xyXG4gICAgICB0aGlzLmFubm91bmNlbWVudENvbXBsZXRlRW1pdHRlci5hZGRMaXN0ZW5lciggKCB1dHRlcmFuY2UsIHN0cmluZyApID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyggJ2Fubm91bmNlbWVudCBjb21wbGV0ZScsIHN0cmluZyApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuc3RhcnRTcGVha2luZ0VtaXR0ZXIuYWRkTGlzdGVuZXIoIHN0cmluZyA9PiB7XHJcbiAgICAgICAgdGhpcy5kZWJ1ZyAmJiBjb25zb2xlLmxvZyggJ3N0YXJ0U3BlYWtpbmdMaXN0ZW5lcicsIHN0cmluZyApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuZW5kU3BlYWtpbmdFbWl0dGVyLmFkZExpc3RlbmVyKCBzdHJpbmcgPT4ge1xyXG4gICAgICAgIHRoaXMuZGVidWcgJiYgY29uc29sZS5sb2coICdlbmRTcGVha2luZ0xpc3RlbmVyJywgc3RyaW5nICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgaW5pdGlhbGl6ZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5pc0luaXRpYWxpemVkUHJvcGVydHkudmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbmRpY2F0ZSB0aGF0IHRoZSBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIgaXMgcmVhZHkgZm9yIHVzZSwgYW5kIGF0dGVtcHQgdG8gcG9wdWxhdGUgdm9pY2VzIChpZiB0aGV5IGFyZSByZWFkeSB5ZXQpLiBBZGRzXHJcbiAgICogbGlzdGVuZXJzIHRoYXQgY29udHJvbCBzcGVlY2guXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdXNlckdlc3R1cmVFbWl0dGVyIC0gRW1pdHMgd2hlbiB1c2VyIGlucHV0IGhhcHBlbnMsIHdoaWNoIGlzIHJlcXVpcmVkIGJlZm9yZSB0aGUgYnJvd3NlciBpc1xyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsb3dlZCB0byB1c2UgU3BlZWNoU3ludGhlc2lzIGZvciB0aGUgZmlyc3QgdGltZS5cclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgaW5pdGlhbGl6ZSggdXNlckdlc3R1cmVFbWl0dGVyOiBURW1pdHRlciwgcHJvdmlkZWRPcHRpb25zPzogU3BlZWNoU3ludGhlc2lzSW5pdGlhbGl6ZU9wdGlvbnMgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pbml0aWFsaXplZCwgJ2NhbiBvbmx5IGJlIGluaXRpYWxpemVkIG9uY2UnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIuaXNTcGVlY2hTeW50aGVzaXNTdXBwb3J0ZWQoKSwgJ3RyeWluZyB0byBpbml0aWFsaXplIHNwZWVjaCwgYnV0IHNwZWVjaCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoaXMgcGxhdGZvcm0uJyApO1xyXG5cclxuICAgIC8vIFNlZSB0b3AgbGV2ZWwgdHlwZSBkb2N1bWVudGF0aW9uLlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5pdGlhbGl6ZUNvdW50ID09PSAwLCAnT25seSBvbmUgaW5zdGFuY2Ugb2YgU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyIGNhbiBiZSBpbml0aWFsaXplZCBhdCBhIHRpbWUuJyApO1xyXG4gICAgaW5pdGlhbGl6ZUNvdW50Kys7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTcGVlY2hTeW50aGVzaXNJbml0aWFsaXplT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8ge0Jvb2xlYW5Qcm9wZXJ0eXxEZXJpdmVkUHJvcGVydHkuPGJvb2xlYW4+fSAtIENvbnRyb2xzIHdoZXRoZXIgc3BlZWNoIGlzIGFsbG93ZWQgd2l0aCBzcGVlY2ggc3ludGhlc2lzLlxyXG4gICAgICAvLyBDb21iaW5lZCBpbnRvIGFub3RoZXIgRGVyaXZlZFByb3BlcnR5IHdpdGggdGhpcy5lbmFibGVkUHJvcGVydHkgc28geW91IGRvbid0IGhhdmUgdG8gdXNlIHRoYXQgYXMgb25lXHJcbiAgICAgIC8vIG9mIHRoZSBQcm9wZXJ0aWVzIHRoYXQgZGVyaXZlIHNwZWVjaEFsbG93ZWRQcm9wZXJ0eSwgaWYgeW91IGFyZSBwYXNzaW5nIGluIGEgRGVyaXZlZFByb3BlcnR5LlxyXG4gICAgICBzcGVlY2hBbGxvd2VkUHJvcGVydHk6IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5zeW50aCA9IHdpbmRvdy5zcGVlY2hTeW50aGVzaXM7XHJcblxyXG4gICAgLy8gd2hldGhlciB0aGUgb3B0aW9uYWwgUHJvcGVydHkgaW5kaWNhdGluZyBzcGVlY2ggaXMgYWxsb3dlZCBhbmQgdGhlIFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlciBpcyBlbmFibGVkXHJcbiAgICB0aGlzLmNhblNwZWFrUHJvcGVydHkgPSBEZXJpdmVkUHJvcGVydHkuYW5kKCBbIG9wdGlvbnMuc3BlZWNoQWxsb3dlZFByb3BlcnR5LCB0aGlzLmVuYWJsZWRQcm9wZXJ0eSBdICk7XHJcbiAgICB0aGlzLmNhblNwZWFrUHJvcGVydHkubGluayggdGhpcy5ib3VuZEhhbmRsZUNhblNwZWFrQ2hhbmdlICk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBzcGVlY2hBbGxvd2VkQW5kRnVsbHlFbmFibGVkUHJvcGVydHkgd2hlbiBkZXBlbmRlbmN5IFByb3BlcnRpZXMgdXBkYXRlXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICBbIG9wdGlvbnMuc3BlZWNoQWxsb3dlZFByb3BlcnR5LCB0aGlzLnZvaWNpbmdGdWxseUVuYWJsZWRQcm9wZXJ0eSBdLFxyXG4gICAgICAoIHNwZWVjaEFsbG93ZWQsIHZvaWNpbmdGdWxseUVuYWJsZWQgKSA9PiB7XHJcbiAgICAgICAgdGhpcy5fc3BlZWNoQWxsb3dlZEFuZEZ1bGx5RW5hYmxlZFByb3BlcnR5LnZhbHVlID0gc3BlZWNoQWxsb3dlZCAmJiB2b2ljaW5nRnVsbHlFbmFibGVkO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gYnJvd3NlcnMgdGVuZCB0byBnZW5lcmF0ZSB0aGUgbGlzdCBvZiB2b2ljZXMgbGF6aWx5LCBzbyB0aGUgbGlzdCBvZiB2b2ljZXMgbWF5IGJlIGVtcHR5IHVudGlsIHNwZWVjaCBpcyBmaXJzdFxyXG4gICAgLy8gcmVxdWVzdGVkLiBTb21lIGJyb3dzZXJzIGRvbid0IGhhdmUgYW4gYWRkRXZlbnRMaXN0ZW5lciBmdW5jdGlvbiBvbiBzcGVlY2hTeW50aGVzaXMgc28gY2hlY2sgdG8gc2VlIGlmIGl0IGV4aXN0c1xyXG4gICAgLy8gYmVmb3JlIHRyeWluZyB0byBjYWxsIGl0LlxyXG4gICAgY29uc3Qgc3ludGggPSB0aGlzLmdldFN5bnRoKCkhO1xyXG4gICAgc3ludGguYWRkRXZlbnRMaXN0ZW5lciAmJiBzeW50aC5hZGRFdmVudExpc3RlbmVyKCAndm9pY2VzY2hhbmdlZCcsICgpID0+IHtcclxuICAgICAgdGhpcy5wb3B1bGF0ZVZvaWNlcygpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHRyeSB0byBwb3B1bGF0ZSB2b2ljZXMgaW1tZWRpYXRlbHkgaW4gY2FzZSB0aGUgYnJvd3NlciBwb3B1bGF0ZXMgdGhlbSBlYWdlcmx5IGFuZCB3ZSBuZXZlciBnZXQgYW5cclxuICAgIC8vIG9udm9pY2VzY2hhbmdlZCBldmVudFxyXG4gICAgdGhpcy5wb3B1bGF0ZVZvaWNlcygpO1xyXG5cclxuICAgIC8vIFRvIGdldCBWb2ljaW5nIHRvIGhhcHBlbiBxdWlja2x5IG9uIENocm9tZWJvb2tzIHdlIHNldCB0aGUgY291bnRlciB0byBhIHZhbHVlIHRoYXQgd2lsbCB0cmlnZ2VyIHRoZSBcImVuZ2luZVxyXG4gICAgLy8gd2FrZVwiIGludGVydmFsIG9uIHRoZSBuZXh0IGFuaW1hdGlvbiBmcmFtZSB0aGUgZmlyc3QgdGltZSB3ZSBnZXQgYSB1c2VyIGdlc3R1cmUuIFNlZSBFTkdJTkVfV0FLRV9JTlRFUlZBTFxyXG4gICAgLy8gZm9yIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgdGhpcyB3b3JrYXJvdW5kLlxyXG4gICAgY29uc3Qgc3RhcnRFbmdpbmVMaXN0ZW5lciA9ICgpID0+IHtcclxuICAgICAgdGhpcy50aW1lU2luY2VXYWtpbmdFbmdpbmUgPSBFTkdJTkVfV0FLRV9JTlRFUlZBTDtcclxuXHJcbiAgICAgIC8vIERpc3BsYXkgaXMgb24gdGhlIG5hbWVzcGFjZSBidXQgY2Fubm90IGJlIGltcG9ydGVkIGR1ZSB0byBjaXJjdWxhciBkZXBlbmRlbmNpZXNcclxuICAgICAgdXNlckdlc3R1cmVFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBzdGFydEVuZ2luZUxpc3RlbmVyICk7XHJcbiAgICB9O1xyXG4gICAgdXNlckdlc3R1cmVFbWl0dGVyLmFkZExpc3RlbmVyKCBzdGFydEVuZ2luZUxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gbGlzdGVuZXIgZm9yIHRpbWluZyB2YXJpYWJsZXNcclxuICAgIHN0ZXBUaW1lci5hZGRMaXN0ZW5lciggdGhpcy5zdGVwLmJpbmQoIHRoaXMgKSApO1xyXG5cclxuICAgIHRoaXMuaXNJbml0aWFsaXplZFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBkdCAtIGluIHNlY29uZHMgZnJvbSBzdGVwVGltZXJcclxuICAgKi9cclxuICBwcml2YXRlIHN0ZXAoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gY29udmVydCB0byBtc1xyXG4gICAgZHQgKj0gMTAwMDtcclxuXHJcbiAgICAvLyBpZiBpbml0aWFsaXplZCwgdGhpcyBtZWFucyB3ZSBoYXZlIGEgc3ludGguXHJcbiAgICBjb25zdCBzeW50aCA9IHRoaXMuZ2V0U3ludGgoKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuaW5pdGlhbGl6ZWQgJiYgc3ludGggKSB7XHJcblxyXG4gICAgICAvLyBJZiB3ZSBoYXZlbid0IHNwb2tlbiB5ZXQsIGtlZXAgY2hlY2tpbmcgdGhlIHN5bnRoIHRvIGRldGVybWluZSB3aGVuIHRoZXJlIGhhcyBiZWVuIGEgc3VjY2Vzc2Z1bCB1c2FnZVxyXG4gICAgICAvLyBvZiBTcGVlY2hTeW50aGVzaXMuIE5vdGUgdGhpcyB3aWxsIGJlIHRydWUgaWYgQU5ZIFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlciBoYXMgc3VjY2Vzc2Z1bCBzcGVlY2ggKG5vdCBqdXN0XHJcbiAgICAgIC8vIHRoaXMgaW5zdGFuY2UpLlxyXG4gICAgICBpZiAoICF0aGlzLmhhc1Nwb2tlbiApIHtcclxuICAgICAgICB0aGlzLmhhc1Nwb2tlbiA9IHN5bnRoLnNwZWFraW5nO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBJbmNyZW1lbnQgdGhlIGFtb3VudCBvZiB0aW1lIHNpbmNlIHRoZSBzeW50aCBoYXMgc3RvcHBlZCBzcGVha2luZyB0aGUgcHJldmlvdXMgdXR0ZXJhbmNlLCBidXQgZG9uJ3RcclxuICAgICAgLy8gc3RhcnQgY291bnRpbmcgdXAgdW50aWwgdGhlIHN5bnRoIGhhcyBmaW5pc2hlZCBzcGVha2luZyBpdHMgY3VycmVudCB1dHRlcmFuY2UuXHJcbiAgICAgIHRoaXMudGltZVNpbmNlVXR0ZXJhbmNlRW5kID0gc3ludGguc3BlYWtpbmcgPyAwIDogdGhpcy50aW1lU2luY2VVdHRlcmFuY2VFbmQgKyBkdDtcclxuXHJcblxyXG4gICAgICB0aGlzLnRpbWVTaW5jZVBlbmRpbmdVdHRlcmFuY2UgPSAoIHRoaXMuc3BlYWtpbmdTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyICYmICF0aGlzLnNwZWFraW5nU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlci5zdGFydGVkICkgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVTaW5jZVBlbmRpbmdVdHRlcmFuY2UgKyBkdCA6IDA7XHJcblxyXG4gICAgICBpZiAoIHRoaXMudGltZVNpbmNlUGVuZGluZ1V0dGVyYW5jZSA+IFBFTkRJTkdfVVRURVJBTkNFX0RFTEFZICkge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuc3BlYWtpbmdTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyLCAnc2hvdWxkIGhhdmUgdGhpcy5zcGVha2luZ1NwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXInICk7XHJcblxyXG4gICAgICAgIC8vIEl0IGhhcyBiZWVuIHRvbyBsb25nIHNpbmNlIHdlIHJlcXVlc3RlZCBzcGVlY2ggd2l0aG91dCBzcGVha2luZywgdGhlIHN5bnRoIGlzIGxpa2VseSBmYWlsaW5nIG9uIHRoaXMgcGxhdGZvcm1cclxuICAgICAgICB0aGlzLmhhbmRsZVNwZWVjaFN5bnRoZXNpc0VuZCggdGhpcy5zcGVha2luZ1NwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIhLmFubm91bmNlVGV4dCwgdGhpcy5zcGVha2luZ1NwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIhICk7XHJcbiAgICAgICAgdGhpcy5zcGVha2luZ1NwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIgPSBudWxsO1xyXG5cclxuICAgICAgICAvLyBjYW5jZWwgdGhlIHN5bnRoIGJlY2F1c2Ugd2UgcmVhbGx5IGRvbid0IHdhbnQgaXQgdG8ga2VlcCB0cnlpbmcgdG8gc3BlYWsgdGhpcyB1dHRlcmFuY2UgYWZ0ZXIgaGFuZGxpbmdcclxuICAgICAgICAvLyB0aGUgYXNzdW1lZCBmYWlsdXJlXHJcbiAgICAgICAgdGhpcy5jYW5jZWxTeW50aCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBXYWl0IHVudGlsIFZPSUNJTkdfVVRURVJBTkNFX0lOVEVSVkFMIHRvIHNwZWFrIGFnYWluIGZvciBtb3JlIGNvbnNpc3RlbnQgYmVoYXZpb3Igb24gY2VydGFpbiBwbGF0Zm9ybXMsXHJcbiAgICAgIC8vIHNlZSBkb2N1bWVudGF0aW9uIGZvciB0aGUgY29uc3RhbnQgZm9yIG1vcmUgaW5mb3JtYXRpb24uIEJ5IHNldHRpbmcgcmVhZHlUb0Fubm91bmNlIGluIHRoZSBzdGVwIGZ1bmN0aW9uXHJcbiAgICAgIC8vIHdlIGFsc28gZG9uJ3QgaGF2ZSB0byByZWx5IGF0IGFsbCBvbiB0aGUgU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlICdlbmQnIGV2ZW50LCB3aGljaCBpcyBpbmNvbnNpc3RlbnQgb25cclxuICAgICAgLy8gY2VydGFpbiBwbGF0Zm9ybXMuIEFsc28sIG5vdCByZWFkeSB0byBhbm5vdW5jZSBpZiB3ZSBhcmUgd2FpdGluZyBmb3IgdGhlIHN5bnRoIHRvIHN0YXJ0IHNwZWFraW5nIHNvbWV0aGluZy5cclxuICAgICAgaWYgKCB0aGlzLnRpbWVTaW5jZVV0dGVyYW5jZUVuZCA+IFZPSUNJTkdfVVRURVJBTkNFX0lOVEVSVkFMICYmICF0aGlzLnNwZWFraW5nU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlciApIHtcclxuICAgICAgICB0aGlzLnJlYWR5VG9Bbm5vdW5jZSA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZXMgbG9uZ2VyIHRoYW4gMTUgc2Vjb25kcyB3aWxsIGdldCBpbnRlcnJ1cHRlZCBvbiBDaHJvbWUgYW5kIGZhaWwgdG8gc3RvcCB3aXRoXHJcbiAgICAgIC8vIGVuZCBvciBlcnJvciBldmVudHMuIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTY3OTQzNyBzdWdnZXN0cyBhIHdvcmthcm91bmRcclxuICAgICAgLy8gdGhhdCB1c2VzIHBhdXNlL3Jlc3VtZSBsaWtlIHRoaXMuIFRoZSB3b3JrYXJvdW5kIGlzIG5lZWRlZCBmb3IgZGVza3RvcCBDaHJvbWUgd2hlbiB1c2luZyBgbG9jYWxTZXJ2aWNlOiBmYWxzZWBcclxuICAgICAgLy8gdm9pY2VzLiBUaGUgYnVnIGRvZXMgbm90IGFwcGVhciBvbiBhbnkgTWljcm9zb2Z0IEVkZ2Ugdm9pY2VzLiBUaGlzIHdvcmthcm91bmQgYnJlYWtzIFNwZWVjaFN5bnRoZXNpcyBvblxyXG4gICAgICAvLyBhbmRyb2lkLiBJbiB0aGlzIGNoZWNrIHdlIG9ubHkgdXNlIHRoaXMgd29ya2Fyb3VuZCB3aGVyZSBuZWVkZWQuXHJcbiAgICAgIGlmICggcGxhdGZvcm0uY2hyb21pdW0gJiYgIXBsYXRmb3JtLmFuZHJvaWQgJiYgKCB0aGlzLnZvaWNlUHJvcGVydHkudmFsdWUgJiYgIXRoaXMudm9pY2VQcm9wZXJ0eS52YWx1ZS5sb2NhbFNlcnZpY2UgKSApIHtcclxuXHJcbiAgICAgICAgLy8gTm90IG5lY2Vzc2FyeSB0byBhcHBseSB0aGUgd29ya2Fyb3VuZCB1bmxlc3Mgd2UgYXJlIGN1cnJlbnRseSBzcGVha2luZy5cclxuICAgICAgICB0aGlzLnRpbWVTaW5jZVBhdXNlUmVzdW1lID0gc3ludGguc3BlYWtpbmcgPyB0aGlzLnRpbWVTaW5jZVBhdXNlUmVzdW1lICsgZHQgOiAwO1xyXG4gICAgICAgIGlmICggdGhpcy50aW1lU2luY2VQYXVzZVJlc3VtZSA+IFBBVVNFX1JFU1VNRV9XT1JLQVJPVU5EX0lOVEVSVkFMICkge1xyXG4gICAgICAgICAgdGhpcy50aW1lU2luY2VQYXVzZVJlc3VtZSA9IDA7XHJcbiAgICAgICAgICBzeW50aC5wYXVzZSgpO1xyXG4gICAgICAgICAgc3ludGgucmVzdW1lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBBIHdvcmthcm91bmQgdG8ga2VlcCBTcGVlY2hTeW50aGVzaXMgcmVzcG9uc2l2ZSBvbiBDaHJvbWVib29rcy4gSWYgdGhlcmUgaXMgYSBsb25nIGVub3VnaCBpbnRlcnZhbCBiZXR3ZWVuXHJcbiAgICAgIC8vIHNwZWVjaCByZXF1ZXN0cywgdGhlIG5leHQgdGltZSBTcGVlY2hTeW50aGVzaXMgaXMgdXNlZCBpdCBpcyB2ZXJ5IHNsb3cgb24gQ2hyb21lYm9vay4gV2UgdGhpbmsgdGhlIGJyb3dzZXJcclxuICAgICAgLy8gdHVybnMgXCJvZmZcIiB0aGUgc3ludGhlc2lzIGVuZ2luZSBmb3IgcGVyZm9ybWFuY2UuIElmIGl0IGhhcyBiZWVuIGxvbmcgZW5vdWdoIHNpbmNlIHVzaW5nIHNwZWVjaCBzeW50aGVzaXMgYW5kXHJcbiAgICAgIC8vIHRoZXJlIGlzIG5vdGhpbmcgdG8gc3BlYWsgaW4gdGhlIHF1ZXVlLCByZXF1ZXN0aW5nIHNwZWVjaCB3aXRoIGVtcHR5IGNvbnRlbnQga2VlcHMgdGhlIGVuZ2luZSBhY3RpdmUuXHJcbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ3Jhdml0eS1mb3JjZS1sYWItYmFzaWNzL2lzc3Vlcy8zMDMuXHJcbiAgICAgIGlmICggcGxhdGZvcm0uY2hyb21lT1MgKSB7XHJcbiAgICAgICAgdGhpcy50aW1lU2luY2VXYWtpbmdFbmdpbmUgKz0gZHQ7XHJcbiAgICAgICAgaWYgKCAhc3ludGguc3BlYWtpbmcgJiYgdGhpcy50aW1lU2luY2VXYWtpbmdFbmdpbmUgPiBFTkdJTkVfV0FLRV9JTlRFUlZBTCApIHtcclxuICAgICAgICAgIHRoaXMudGltZVNpbmNlV2FraW5nRW5naW5lID0gMDtcclxuXHJcbiAgICAgICAgICAvLyBUaGlzIHNwYWNlIGlzIGFjdHVhbGx5IHF1aXRlIGltcG9ydGFudC4gQW4gZW1wdHkgc3RyaW5nIGJlZ2FuIGJyZWFraW5nIGNocm9tZWJvb2tzIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mcmljdGlvbi9pc3N1ZXMvMzI4XHJcbiAgICAgICAgICBzeW50aC5zcGVhayggbmV3IFNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZSggJyAnICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZW4gd2UgY2FuIG5vIGxvbmdlciBzcGVhaywgY2FuY2VsIGFsbCBzcGVlY2ggdG8gc2lsZW5jZSBldmVyeXRoaW5nLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgaGFuZGxlQ2FuU3BlYWtDaGFuZ2UoIGNhblNwZWFrOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgaWYgKCAhY2FuU3BlYWsgKSB7IHRoaXMuY2FuY2VsKCk7IH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgbGlzdCBvZiBgdm9pY2VzYCBhdmFpbGFibGUgdG8gdGhlIHN5bnRoLCBhbmQgbm90aWZ5IHRoYXQgdGhlIGxpc3QgaGFzIGNoYW5nZWQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBwb3B1bGF0ZVZvaWNlcygpOiB2b2lkIHtcclxuICAgIGNvbnN0IHN5bnRoID0gdGhpcy5nZXRTeW50aCgpO1xyXG4gICAgaWYgKCBzeW50aCApIHtcclxuXHJcbiAgICAgIC8vIHRoZSBicm93c2VyIHNvbWV0aW1lcyBwcm92aWRlcyBkdXBsaWNhdGUgdm9pY2VzLCBwcnVuZSB0aG9zZSBvdXQgb2YgdGhlIGxpc3RcclxuICAgICAgdGhpcy52b2ljZXNQcm9wZXJ0eS52YWx1ZSA9IF8udW5pcUJ5KCBzeW50aC5nZXRWb2ljZXMoKSwgdm9pY2UgPT4gdm9pY2UubmFtZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBTcGVlY2hTeW50aGVzaXNWb2ljZXMgdGhhdCBhcmUgc29ydGVkIHN1Y2ggdGhhdCB0aGUgYmVzdCBzb3VuZGluZyB2b2ljZXMgY29tZSBmaXJzdC5cclxuICAgKiBBcyBvZiA5LzI3LzIxLCB3ZSBmaW5kIHRoYXQgdGhlIFwiR29vZ2xlXCIgdm9pY2VzIHNvdW5kIGJlc3Qgd2hpbGUgQXBwbGUncyBcIkZyZWRcIiBzb3VuZHMgdGhlIHdvcnN0IHNvIHRoZSBsaXN0XHJcbiAgICogd2lsbCBiZSBvcmRlcmVkIHRvIHJlZmxlY3QgdGhhdC4gVGhpcyB3YXkgXCJHb29nbGVcIiB2b2ljZXMgd2lsbCBiZSBzZWxlY3RlZCBieSBkZWZhdWx0IHdoZW4gYXZhaWxhYmxlIGFuZCBcIkZyZWRcIlxyXG4gICAqIHdpbGwgYWxtb3N0IG5ldmVyIGJlIHRoZSBkZWZhdWx0IFZvaWNlIHNpbmNlIGl0IGlzIGxhc3QgaW4gdGhlIGxpc3QuIFNlZVxyXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMjgyLyBmb3IgZGlzY3Vzc2lvbiBhbmQgdGhpcyBkZWNpc2lvbi5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UHJpb3JpdGl6ZWRWb2ljZXMoKTogU3BlZWNoU3ludGhlc2lzVm9pY2VbXSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmluaXRpYWxpemVkLCAnTm8gdm9pY2VzIGF2YWlsYWJsZSB1bnRpbCB0aGUgU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyIGlzIGluaXRpYWxpemVkJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy52b2ljZXNQcm9wZXJ0eS52YWx1ZS5sZW5ndGggPiAwLCAnTm8gdm9pY2VzIGF2YWlsYWJsZSB0byBwcm92aWRlZCBhIHByaW9yaXRpemVkIGxpc3QuJyApO1xyXG5cclxuICAgIGNvbnN0IGFsbFZvaWNlcyA9IHRoaXMudm9pY2VzUHJvcGVydHkudmFsdWUuc2xpY2UoKTtcclxuXHJcbiAgICAvLyBleGNsdWRlIFwibm92ZWx0eVwiIHZvaWNlcyB0aGF0IGFyZSBpbmNsdWRlZCBieSB0aGUgb3BlcmF0aW5nIHN5c3RlbSBidXQgbWFya2VkIGFzIEVuZ2xpc2guXHJcbiAgICAvLyBjb25zdCB2b2ljZXNXaXRob3V0Tm92ZWx0eSA9IF8uZmlsdGVyKCBhbGxWb2ljZXMsIHZvaWNlID0+ICFOT1ZFTFRZX1ZPSUNFUy5pbmNsdWRlcyggdm9pY2UubmFtZSApICk7XHJcbiAgICBjb25zdCB2b2ljZXNXaXRob3V0Tm92ZWx0eSA9IF8uZmlsdGVyKCBhbGxWb2ljZXMsIHZvaWNlID0+IHtcclxuXHJcbiAgICAgIC8vIFJlbW92ZSB0aGUgdm9pY2UgaWYgdGhlIFNwZWVjaFN5bnRoZXNpc1ZvaWNlLm5hbWUgaW5jbHVkZXMgYSBzdWJzdHJpbmcgb2YgdGhlIGVudHJ5IGluIG91ciBsaXN0ICh0aGUgYnJvd3NlclxyXG4gICAgICAvLyBtaWdodCBpbmNsdWRlIG1vcmUgaW5mb3JtYXRpb24gaW4gdGhlIG5hbWUgdGhhbiB3ZSBtYWludGFpbiwgbGlrZSBsb2NhbGUgaW5mbyBvciBzb21ldGhpbmcgZWxzZSkuXHJcbiAgICAgIHJldHVybiAhXy5zb21lKCBOT1ZFTFRZX1ZPSUNFUywgbm92ZWx0eVZvaWNlID0+IHZvaWNlLm5hbWUuaW5jbHVkZXMoIG5vdmVsdHlWb2ljZSApICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgZ2V0SW5kZXggPSAoIHZvaWNlOiBTcGVlY2hTeW50aGVzaXNWb2ljZSApID0+XHJcbiAgICAgIHZvaWNlLm5hbWUuaW5jbHVkZXMoICdHb29nbGUnICkgPyAtMSA6IC8vIEdvb2dsZSBzaG91bGQgbW92ZSB0b3dhcmQgdGhlIGZyb250XHJcbiAgICAgIHZvaWNlLm5hbWUuaW5jbHVkZXMoICdGcmVkJyApID8gdm9pY2VzV2l0aG91dE5vdmVsdHkubGVuZ3RoIDogLy8gRnJlZCBzaG91bGQgbW92ZSB0b3dhcmQgdGhlIGJhY2tcclxuICAgICAgdm9pY2VzV2l0aG91dE5vdmVsdHkuaW5kZXhPZiggdm9pY2UgKTsgLy8gT3RoZXJ3aXNlIHByZXNlcnZlIG9yZGVyaW5nXHJcblxyXG4gICAgcmV0dXJuIHZvaWNlc1dpdGhvdXROb3ZlbHR5LnNvcnQoICggYSwgYiApID0+IGdldEluZGV4KCBhICkgLSBnZXRJbmRleCggYiApICk7XHJcblxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVm9pY2luZyBhcyBhIGZlYXR1cmUgaXMgbm90IHRyYW5zbGF0YWJsZS4gVGhpcyBmdW5jdGlvbiBnZXRzIHRoZSBcInByaW9yaXRpemVkXCIgdm9pY2VzIChhcyBkZWNpZGVkIGJ5IFBoRVQpIGFuZFxyXG4gICAqIHBydW5lcyBvdXQgdGhlIG5vbi1lbmdsaXNoIG9uZXMuIFRoaXMgZG9lcyBub3QgdXNlIHRoaXMuZ2V0UHJpb3JpdGl6ZWRWb2ljZXNGb3JMb2NhbGUgYmVjYXVzZSB0aGUgcmVxdWlyZWQgTG9jYWxlXHJcbiAgICogdHlwZSBkb2Vzbid0IGluY2x1ZGUgJ2VuLVVTJyBvciAnZW5fVVMnIGFzIHZhbGlkIHZhbHVlcywganVzdCAnZW4nLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRFbmdsaXNoUHJpb3JpdGl6ZWRWb2ljZXMoKTogU3BlZWNoU3ludGhlc2lzVm9pY2VbXSB7XHJcbiAgICByZXR1cm4gXy5maWx0ZXIoIHRoaXMuZ2V0UHJpb3JpdGl6ZWRWb2ljZXMoKSwgdm9pY2UgPT4ge1xyXG5cclxuICAgICAgLy8gbW9zdCBicm93c2VycyB1c2UgZGFzaGVzIHRvIHNlcGFyYXRlIHRoZSBsb2NhbCwgQW5kcm9pZCB1c2VzIHVuZGVyc2NvcmUuXHJcbiAgICAgIHJldHVybiB2b2ljZS5sYW5nID09PSAnZW4tVVMnIHx8IHZvaWNlLmxhbmcgPT09ICdlbl9VUyc7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBWb2ljaW5nIGFzIGEgZmVhdHVyZSBpcyBub3QgdHJhbnNsYXRhYmxlLCBidXQgc29tZSBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIgdXNhZ2VzIG91dHNpZGUgb2Ygdm9pY2luZyBhcmUuIFRoaXNcclxuICAgKiBmdW5jdGlvbiBnZXRzIHRoZSBcInByaW9yaXRpemVkXCIgdm9pY2VzIChhcyBkZWNpZGVkIGJ5IFBoRVQpIGFuZFxyXG4gICAqIHBydW5lcyBvdXQgZXZlcnl0aGluZyB0aGF0IGlzIG5vdCB0aGUgXCJwcm92aWRlZFwiIGxvY2FsZS4gVGhlIGFsZ29yaXRobSBmb3IgbWFwcGluZyBsb2NhbGUgaXMgYXMgZm9sbG93czpcclxuICAgKlxyXG4gICAqIGxvY2FsZTogJ2VuJyAtIFByb3ZpZGVkIGxvY2FsZSBwYXJhbWV0ZXJcclxuICAgKiB2b2ljZTogJ2VuX0dCJyAtIFlFUyBtYXRjaGVzIVxyXG4gICAqIHZvaWNlOiAnZW4nIC0gWUVTXHJcbiAgICpcclxuICAgKiBsb2NhbGU6ICdlbl9HQidcclxuICAgKiB2b2ljZTogJ2VuJyAtIE5PXHJcbiAgICogdm9pY2U6ICdlbl9HQicgLSBZRVNcclxuICAgKiB2b2ljZTogJ2VuLUdCJyAtIFlFU1xyXG4gICAqIHZvaWNlOiAnZW4tVVMnIC0gTk9cclxuICAgKlxyXG4gICAqIGxvY2FsZTogJ3poX0NOJ1xyXG4gICAqIHZvaWNlOiAnemgnIC0gTk9cclxuICAgKiB2b2ljZTogJ3poX0NOJyAtIFlFU1xyXG4gICAqXHJcbiAgICogbG9jYWxlOiAnemgnXHJcbiAgICogdm9pY2U6ICd6aCcgLSBZRVNcclxuICAgKiB2b2ljZTogJ3poX0NOJyAtIFlFU1xyXG4gICAqIHZvaWNlOiAnemgtVFcnIC0gWUVTXHJcbiAgICpcclxuICAgKiBsb2NhbGU6ICdlc19FUydcclxuICAgKiB2b2ljZTogJ2VzX01YJyAtIE5PXHJcbiAgICogdm9pY2U6ICdlcycgLSBOT1xyXG4gICAqIHZvaWNlOiAnZXMtRVMnIC0gWUVTXHJcbiAgICovXHJcbiAgcHVibGljIGdldFByaW9yaXRpemVkVm9pY2VzRm9yTG9jYWxlKCBsb2NhbGU6IExvY2FsZSApOiBTcGVlY2hTeW50aGVzaXNWb2ljZVtdIHtcclxuXHJcbiAgICAvLyBGb3VyIGxldHRlciBsb2NhbGVzIG9mIHR5cGUgTG9jYWxlIGluY2x1ZGUgYW4gdW5kZXJzY29yZSBiZXR3ZWVuIHRoZSBsYW5ndWFnZSBhbmQgdGhlIHJlZ2lvbi4gTW9zdCBicm93c2VyIHZvaWNlXHJcbiAgICAvLyBuYW1lcyB1c2UgYSBkYXNoIGluc3RlYWQgb2YgYW4gdW5kZXJzY29yZSwgc28gd2UgbmVlZCB0byBjcmVhdGUgYSB2ZXJzaW9uIG9mIHRoZSBsb2NhbGUgd2l0aCBkYXNoZXMuXHJcbiAgICBjb25zdCB1bmRlcnNjb3JlTG9jYWxlID0gbG9jYWxlO1xyXG4gICAgY29uc3QgZGFzaExvY2FsZSA9IGxvY2FsZS5yZXBsYWNlKCAnXycsICctJyApO1xyXG5cclxuICAgIHJldHVybiBfLmZpbHRlciggdGhpcy5nZXRQcmlvcml0aXplZFZvaWNlcygpLCB2b2ljZSA9PiB7XHJcblxyXG4gICAgICAvLyBIYW5kbGUgdW5zdXBwb3J0ZWQgbG9jYWxlIG1hcHBpbmcgaGVyZSwgc2VlIHZvaWNlTGFuZ1RvU3VwcG9ydGVkTG9jYWxlIGFuZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbnVtYmVyLXBsYXkvaXNzdWVzLzIzMC5cclxuICAgICAgY29uc3Qgdm9pY2VMYW5nID0gdm9pY2VMYW5nVG9TdXBwb3J0ZWRMb2NhbGUuaGFzT3duUHJvcGVydHkoIHZvaWNlLmxhbmcgKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZvaWNlTGFuZ1RvU3VwcG9ydGVkTG9jYWxlWyB2b2ljZS5sYW5nIF0gOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2b2ljZS5sYW5nO1xyXG5cclxuICAgICAgbGV0IG1hdGNoZXNTaG9ydExvY2FsZSA9IGZhbHNlO1xyXG4gICAgICBpZiAoIHZvaWNlTGFuZy5pbmNsdWRlcyggJ18nICkgfHwgdm9pY2VMYW5nLmluY2x1ZGVzKCAnLScgKSApIHtcclxuXHJcbiAgICAgICAgLy8gTWFwcGluZyB6aF9DTiBvciB6aC1DTiAtPiB6aFxyXG4gICAgICAgIG1hdGNoZXNTaG9ydExvY2FsZSA9IHVuZGVyc2NvcmVMb2NhbGUgPT09IHZvaWNlTGFuZy5zbGljZSggMCwgMiApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB3aGlsZSBtb3N0IGJyb3dzZXJzIHVzZSBkYXNoZXMgdG8gc2VwYXJhdGUgdGhlIGxvY2FsLCBBbmRyb2lkIHVzZXMgdW5kZXJzY29yZSwgc28gY29tcGFyZSBib3RoIHR5cGVzLiBMb29zZWx5XHJcbiAgICAgIC8vIGNvbXBhcmUgd2l0aCBpbmNsdWRlcygpIHNvIGFsbCBjb3VudHJ5LXNwZWNpZmljIHZvaWNlcyBhcmUgYXZhaWxhYmxlIGZvciB0d28tbGV0dGVyIExvY2FsZSBjb2Rlcy5cclxuICAgICAgcmV0dXJuIG1hdGNoZXNTaG9ydExvY2FsZSB8fCB1bmRlcnNjb3JlTG9jYWxlID09PSB2b2ljZUxhbmcgfHwgZGFzaExvY2FsZSA9PT0gdm9pY2VMYW5nO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW1wbGVtZW50cyBhbm5vdW5jZSBzbyB0aGUgU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyIGNhbiBiZSBhIHNvdXJjZSBvZiBvdXRwdXQgZm9yIHV0dGVyYW5jZVF1ZXVlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBhbm5vdW5jZSggYW5ub3VuY2VUZXh0OiBSZXNvbHZlZFJlc3BvbnNlLCB1dHRlcmFuY2U6IFV0dGVyYW5jZSApOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5pbml0aWFsaXplZCAmJiB0aGlzLmNhblNwZWFrUHJvcGVydHkgJiYgdGhpcy5jYW5TcGVha1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICB0aGlzLnJlcXVlc3RTcGVlY2goIGFubm91bmNlVGV4dCwgdXR0ZXJhbmNlICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIFRoZSBhbm5vdW5jZXIgaXMgbm90IGdvaW5nIHRvIGFubm91bmNlIHRoaXMgdXR0ZXJhbmNlLCBzaWduaWZ5IHRoYXQgd2UgYXJlIGRvbmUgd2l0aCBpdC5cclxuICAgICAgdGhpcy5oYW5kbGVBbm5vdW5jZW1lbnRGYWlsdXJlKCB1dHRlcmFuY2UsIGFubm91bmNlVGV4dCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGFubm91bmNlbWVudCBvZiB0aGlzIHV0dGVyYW5jZSBoYXMgZmFpbGVkIGluIHNvbWUgd2F5LCBzaWduaWZ5IHRvIGNsaWVudHMgb2YgdGhpcyBhbm5vdW5jZXIgdGhhdCB0aGUgdXR0ZXJhbmNlXHJcbiAgICogd2lsbCBuZXZlciBjb21wbGV0ZS4gRm9yIGV4YW1wbGUgc3RhcnQvZW5kIGV2ZW50cyBvbiB0aGUgU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlIHdpbGwgbmV2ZXIgZmlyZS5cclxuICAgKi9cclxuICBwcml2YXRlIGhhbmRsZUFubm91bmNlbWVudEZhaWx1cmUoIHV0dGVyYW5jZTogVXR0ZXJhbmNlLCBhbm5vdW5jZVRleHQ6IFJlc29sdmVkUmVzcG9uc2UgKTogdm9pZCB7XHJcbiAgICB0aGlzLmRlYnVnICYmIGNvbnNvbGUubG9nKCAnYW5ub3VuY2VtZW50IGZhaWx1cmUnLCBhbm5vdW5jZVRleHQgKTtcclxuICAgIHRoaXMuYW5ub3VuY2VtZW50Q29tcGxldGVFbWl0dGVyLmVtaXQoIHV0dGVyYW5jZSwgYW5ub3VuY2VUZXh0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVc2Ugc3BlZWNoIHN5bnRoZXNpcyB0byBzcGVhayBhbiB1dHRlcmFuY2UuIE5vLW9wIHVubGVzcyBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIgaXMgaW5pdGlhbGl6ZWQgYW5kIG90aGVyIG91dHB1dFxyXG4gICAqIGNvbnRyb2xsaW5nIFByb3BlcnRpZXMgYXJlIHRydWUgKHNlZSBzcGVlY2hBbGxvd2VkUHJvcGVydHkgaW4gaW5pdGlhbGl6ZSgpKS4gVGhpcyBleHBsaWNpdGx5IGlnbm9yZXNcclxuICAgKiB0aGlzLmVuYWJsZWRQcm9wZXJ0eSwgYWxsb3dpbmcgc3BlZWNoIGV2ZW4gd2hlbiBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIgaXMgZGlzYWJsZWQuIFRoaXMgaXMgdXNlZnVsIGluIHJhcmUgY2FzZXMsIGZvclxyXG4gICAqIGV4YW1wbGUgd2hlbiB0aGUgU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyIHJlY2VudGx5IGJlY29tZXMgZGlzYWJsZWQgYnkgdGhlIHVzZXIgYW5kIHdlIG5lZWQgdG8gYW5ub3VuY2UgY29uZmlybWF0aW9uIG9mXHJcbiAgICogdGhhdCBkZWNpc2lvbiAoXCJWb2ljaW5nIG9mZlwiIG9yIFwiQWxsIGF1ZGlvIG9mZlwiKS5cclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgd2lsbCBpbnRlcnJ1cHQgYW55IGN1cnJlbnRseSBzcGVha2luZyB1dHRlcmFuY2UuXHJcbiAgICovXHJcbiAgcHVibGljIHNwZWFrSWdub3JpbmdFbmFibGVkKCB1dHRlcmFuY2U6IFV0dGVyYW5jZSApOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5pbml0aWFsaXplZCApIHtcclxuICAgICAgdGhpcy5jYW5jZWwoKTtcclxuICAgICAgdGhpcy5yZXF1ZXN0U3BlZWNoKCB1dHRlcmFuY2UuZ2V0QWxlcnRUZXh0KCB0aGlzLnJlc3BlY3RSZXNwb25zZUNvbGxlY3RvclByb3BlcnRpZXMgKSwgdXR0ZXJhbmNlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXF1ZXN0IHNwZWVjaCB3aXRoIFNwZWVjaFN5bnRoZXNpcy5cclxuICAgKi9cclxuICBwcml2YXRlIHJlcXVlc3RTcGVlY2goIGFubm91bmNlVGV4dDogUmVzb2x2ZWRSZXNwb25zZSwgdXR0ZXJhbmNlOiBVdHRlcmFuY2UgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIuaXNTcGVlY2hTeW50aGVzaXNTdXBwb3J0ZWQoKSwgJ3RyeWluZyB0byBzcGVhayB3aXRoIHNwZWVjaFN5bnRoZXNpcywgYnV0IGl0IGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhpcyBwbGF0Zm9ybScgKTtcclxuXHJcbiAgICB0aGlzLmRlYnVnICYmIGNvbnNvbGUubG9nKCAncmVxdWVzdFNwZWVjaCcsIGFubm91bmNlVGV4dCApO1xyXG5cclxuICAgIC8vIElmIHRoZSB1dHRlcmFuY2UgdGV4dCBpcyBudWxsLCB0aGVuIG9wdCBvdXQgZWFybHlcclxuICAgIGlmICggIWFubm91bmNlVGV4dCApIHtcclxuICAgICAgdGhpcy5oYW5kbGVBbm5vdW5jZW1lbnRGYWlsdXJlKCB1dHRlcmFuY2UsIGFubm91bmNlVGV4dCApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXR0ZXJhbmNlLmFubm91bmNlck9wdGlvbnMgbXVzdCBiZSBtb3JlIGdlbmVyYWwgdG8gYWxsb3cgdGhpcyB0eXBlIHRvIGFwcGx5IHRvIGFueSBpbXBsZW1lbnRhdGlvbiBvZiBBbm5vdW5jZXIsIHRodXMgXCJPYmplY3RcIiBhcyB0aGUgcHJvdmlkZWQgb3B0aW9ucy5cclxuICAgIGNvbnN0IHV0dGVyYW5jZU9wdGlvbnMgPSBvcHRpb25pemUzPFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlT3B0aW9ucywgU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VPcHRpb25zPigpKFxyXG4gICAgICB7fSwgVVRURVJBTkNFX09QVElPTl9ERUZBVUxUUywgdXR0ZXJhbmNlLmFubm91bmNlck9wdGlvbnNcclxuICAgICk7XHJcblxyXG4gICAgLy8gZW1iZWRkaW5nIG1hcmtzIChmb3IgaTE4bikgaW1wYWN0IHRoZSBvdXRwdXQsIHN0cmlwIGJlZm9yZSBzcGVha2luZywgdHlwZSBjYXN0IG51bWJlciB0byBzdHJpbmcgaWYgYXBwbGljYWJsZSAoZm9yIG51bWJlcilcclxuICAgIGNvbnN0IHN0cmluZ1RvU3BlYWsgPSByZW1vdmVCclRhZ3MoIHN0cmlwRW1iZWRkaW5nTWFya3MoIGFubm91bmNlVGV4dCArICcnICkgKTtcclxuXHJcbiAgICAvLyBEaXNhbGxvdyBhbnkgdW5maWxsZWQgdGVtcGxhdGUgdmFyaWFibGVzIHRvIGJlIHNldCBpbiB0aGUgUERPTS5cclxuICAgIHZhbGlkYXRlKCBzdHJpbmdUb1NwZWFrLCBWYWxpZGF0aW9uLlNUUklOR19XSVRIT1VUX1RFTVBMQVRFX1ZBUlNfVkFMSURBVE9SICk7XHJcblxyXG4gICAgY29uc3Qgc3BlZWNoU3ludGhVdHRlcmFuY2UgPSBuZXcgU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlKCBzdHJpbmdUb1NwZWFrICk7XHJcbiAgICBzcGVlY2hTeW50aFV0dGVyYW5jZS52b2ljZSA9IHV0dGVyYW5jZU9wdGlvbnMudm9pY2UgfHwgdGhpcy52b2ljZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgc3BlZWNoU3ludGhVdHRlcmFuY2UucGl0Y2ggPSB0aGlzLnZvaWNlUGl0Y2hQcm9wZXJ0eS52YWx1ZTtcclxuICAgIHNwZWVjaFN5bnRoVXR0ZXJhbmNlLnJhdGUgPSB0aGlzLnZvaWNlUmF0ZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgc3BlZWNoU3ludGhVdHRlcmFuY2Uudm9sdW1lID0gdGhpcy52b2ljZVZvbHVtZVByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIGNvbnN0IHN0YXJ0TGlzdGVuZXIgPSAoKSA9PiB7XHJcbiAgICAgIHRoaXMuc3RhcnRTcGVha2luZ0VtaXR0ZXIuZW1pdCggc3RyaW5nVG9TcGVhaywgdXR0ZXJhbmNlICk7XHJcblxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnNwZWFraW5nU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlciwgJ3Nob3VsZCBoYXZlIGJlZW4gc2V0IGluIHJlcXVlc3RTcGVlY2gnICk7XHJcbiAgICAgIHRoaXMuc3BlYWtpbmdTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyIS5zdGFydGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgIHNwZWVjaFN5bnRoVXR0ZXJhbmNlLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdzdGFydCcsIHN0YXJ0TGlzdGVuZXIgKTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgZW5kTGlzdGVuZXIgPSAoKSA9PiB7XHJcbiAgICAgIHRoaXMuaGFuZGxlU3BlZWNoU3ludGhlc2lzRW5kKCBzdHJpbmdUb1NwZWFrLCBzcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEtlZXAgYSByZWZlcmVuY2UgdG8gdGhlIFNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZSBhbmQgdGhlIHN0YXJ0L2VuZExpc3RlbmVycyBzbyB0aGF0IHdlIGNhbiByZW1vdmUgdGhlbSBsYXRlci5cclxuICAgIC8vIE5vdGljZSB0aGlzIGlzIHVzZWQgaW4gdGhlIGZ1bmN0aW9uIHNjb3BlcyBhYm92ZS5cclxuICAgIC8vIElNUE9SVEFOVCBOT1RFOiBBbHNvLCB0aGlzIGFjdHMgYXMgYSB3b3JrYXJvdW5kIGZvciBhIFNhZmFyaSBidWcgd2hlcmUgdGhlIGBlbmRgIGV2ZW50IGRvZXMgbm90IGZpcmVcclxuICAgIC8vIGNvbnNpc3RlbnRseS4gSWYgdGhlIFNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZSBpcyBub3QgaW4gbWVtb3J5IHdoZW4gaXQgaXMgdGltZSBmb3IgdGhlIGBlbmRgIGV2ZW50LCBTYWZhcmlcclxuICAgIC8vIHdpbGwgZmFpbCB0byBlbWl0IHRoYXQgZXZlbnQuIFNlZVxyXG4gICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjM0ODM5OTAvc3BlZWNoc3ludGhlc2lzLWFwaS1vbmVuZC1jYWxsYmFjay1ub3Qtd29ya2luZyBhbmRcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2huLXRyYXZvbHRhZ2UvaXNzdWVzLzQzNSBhbmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3V0dGVyYW5jZS1xdWV1ZS9pc3N1ZXMvNTJcclxuICAgIGNvbnN0IHNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIgPSBuZXcgU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlciggdXR0ZXJhbmNlLCBhbm5vdW5jZVRleHQsIHNwZWVjaFN5bnRoVXR0ZXJhbmNlLCBmYWxzZSwgZW5kTGlzdGVuZXIsIHN0YXJ0TGlzdGVuZXIgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnNwZWFraW5nU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlciA9PT0gbnVsbCwgJ1dyYXBwZXIgc2hvdWxkIGJlIG51bGwsIHdlIHNob3VsZCBoYXZlIHJlY2VpdmVkIGFuIGVuZCBldmVudCB0byBjbGVhciBpdCBiZWZvcmUgdGhlIG5leHQgb25lLicgKTtcclxuICAgIHRoaXMuc3BlYWtpbmdTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyID0gc3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlcjtcclxuXHJcbiAgICBzcGVlY2hTeW50aFV0dGVyYW5jZS5hZGRFdmVudExpc3RlbmVyKCAnc3RhcnQnLCBzdGFydExpc3RlbmVyICk7XHJcbiAgICBzcGVlY2hTeW50aFV0dGVyYW5jZS5hZGRFdmVudExpc3RlbmVyKCAnZW5kJywgZW5kTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBJbiBTYWZhcmkgdGhlIGBlbmRgIGxpc3RlbmVyIGRvZXMgbm90IGZpcmUgY29uc2lzdGVudGx5LCAoZXNwZWNpYWxseSBhZnRlciBjYW5jZWwpXHJcbiAgICAvLyBidXQgdGhlIGVycm9yIGV2ZW50IGRvZXMuIEluIHRoaXMgY2FzZSBzaWduaWZ5IHRoYXQgc3BlYWtpbmcgaGFzIGVuZGVkLlxyXG4gICAgc3BlZWNoU3ludGhVdHRlcmFuY2UuYWRkRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgZW5kTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBTaWduaWZ5IHRvIHRoZSB1dHRlcmFuY2UtcXVldWUgdGhhdCB3ZSBjYW5ub3Qgc3BlYWsgeWV0IHVudGlsIHRoaXMgdXR0ZXJhbmNlIGhhcyBmaW5pc2hlZFxyXG4gICAgdGhpcy5yZWFkeVRvQW5ub3VuY2UgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBUaGlzIGlzIGdlbmVyYWxseSBzZXQgaW4gdGhlIHN0ZXAgZnVuY3Rpb24gd2hlbiB0aGUgc3ludGggaXMgbm90IHNwZWFraW5nLCBidXQgdGhlcmUgaXMgYSBGaXJlZm94IGlzc3VlIHdoZXJlXHJcbiAgICAvLyB0aGUgU3BlZWNoU3ludGhlc2lzLnNwZWFraW5nIGlzIHNldCB0byBgdHJ1ZWAgYXN5bmNocm9ub3VzbHkuIFNvIHdlIGVhZ2VybHkgcmVzZXQgdGhpcyB0aW1pbmcgdmFyaWFibGUgdG9cclxuICAgIC8vIHNpZ25pZnkgdGhhdCB3ZSBuZWVkIHRvIHdhaXQgVk9JQ0lOR19VVFRFUkFOQ0VfSU5URVJWQUwgdW50aWwgd2UgYXJlIGFsbG93ZWQgdG8gc3BlYWsgYWdhaW4uXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3V0dGVyYW5jZS1xdWV1ZS9pc3N1ZXMvNDBcclxuICAgIHRoaXMudGltZVNpbmNlVXR0ZXJhbmNlRW5kID0gMDtcclxuXHJcbiAgICAvLyBJbnRlcnJ1cHQgaWYgdGhlIFV0dGVyYW5jZSBjYW4gbm8gbG9uZ2VyIGJlIGFubm91bmNlZC5cclxuICAgIHV0dGVyYW5jZS5jYW5Bbm5vdW5jZVByb3BlcnR5LmxpbmsoIHRoaXMuYm91bmRIYW5kbGVDYW5Bbm5vdW5jZUNoYW5nZSApO1xyXG4gICAgdXR0ZXJhbmNlLnZvaWNpbmdDYW5Bbm5vdW5jZVByb3BlcnR5LmxpbmsoIHRoaXMuYm91bmRIYW5kbGVDYW5Bbm5vdW5jZUNoYW5nZSApO1xyXG5cclxuICAgIHRoaXMuZ2V0U3ludGgoKSEuc3BlYWsoIHNwZWVjaFN5bnRoVXR0ZXJhbmNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGVuIGEgY2FuQW5ub3VuY2VQcm9wZXJ0eSBjaGFuZ2VzIHRvIGZhbHNlIGZvciBhbiBVdHRlcmFuY2UsIHRoYXQgdXR0ZXJhbmNlIHNob3VsZCBiZSBjYW5jZWxsZWQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBoYW5kbGVDYW5Bbm5vdW5jZUNoYW5nZSgpOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5zcGVha2luZ1NwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIgKSB7XHJcbiAgICAgIHRoaXMuY2FuY2VsVXR0ZXJhbmNlSWZDYW5Bbm5vdW5jZUZhbHNlKCB0aGlzLnNwZWFraW5nU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlci51dHRlcmFuY2UgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZW4gYSBjYW5Bbm5vdW5jZVByb3BlcnR5IGNoYW5nZXMsIGNhbmNlbCB0aGUgVXR0ZXJhbmNlIGlmIHRoZSB2YWx1ZSBiZWNvbWVzIGZhbHNlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY2FuY2VsVXR0ZXJhbmNlSWZDYW5Bbm5vdW5jZUZhbHNlKCB1dHRlcmFuY2U6IFV0dGVyYW5jZSApOiB2b2lkIHtcclxuICAgIGlmICggIXV0dGVyYW5jZS5jYW5Bbm5vdW5jZVByb3BlcnR5LnZhbHVlIHx8ICF1dHRlcmFuY2Uudm9pY2luZ0NhbkFubm91bmNlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHRoaXMuY2FuY2VsVXR0ZXJhbmNlKCB1dHRlcmFuY2UgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFsbCB0aGUgd29yayBuZWNlc3Nhcnkgd2hlbiB3ZSBhcmUgZmluaXNoZWQgd2l0aCBhbiB1dHRlcmFuY2UsIGludGVuZGVkIGZvciBlbmQgb3IgY2FuY2VsLlxyXG4gICAqIEVtaXRzIGV2ZW50cyBzaWduaWZ5aW5nIHRoYXQgd2UgYXJlIGRvbmUgd2l0aCBzcGVlY2ggYW5kIGRvZXMgc29tZSBkaXNwb3NhbC5cclxuICAgKi9cclxuICBwcml2YXRlIGhhbmRsZVNwZWVjaFN5bnRoZXNpc0VuZCggc3RyaW5nVG9TcGVhazogUmVzb2x2ZWRSZXNwb25zZSwgc3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlcjogU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlciApOiB2b2lkIHtcclxuICAgIHRoaXMuZW5kU3BlYWtpbmdFbWl0dGVyLmVtaXQoIHN0cmluZ1RvU3BlYWssIHNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIudXR0ZXJhbmNlICk7XHJcbiAgICB0aGlzLmFubm91bmNlbWVudENvbXBsZXRlRW1pdHRlci5lbWl0KCBzcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyLnV0dGVyYW5jZSwgc3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlci5zcGVlY2hTeW50aGVzaXNVdHRlcmFuY2UudGV4dCApO1xyXG5cclxuICAgIHNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIuc3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIuZW5kTGlzdGVuZXIgKTtcclxuICAgIHNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIuc3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdlbmQnLCBzcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyLmVuZExpc3RlbmVyICk7XHJcbiAgICBzcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyLnNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZS5yZW1vdmVFdmVudExpc3RlbmVyKCAnc3RhcnQnLCBzcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyLnN0YXJ0TGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBUaGUgZW5kU3BlYWtpbmdFbWl0dGVyIG1heSBlbmQgdXAgY2FsbGluZyBoYW5kbGVTcGVlY2hTeW50aGVzaXNFbmQgaW4gaXRzIGxpc3RlbmVycywgd2UgbmVlZCB0byBiZSBncmFjZWZ1bFxyXG4gICAgY29uc3QgdXR0ZXJhbmNlQ2FuQW5ub3VuY2VQcm9wZXJ0eSA9IHNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIudXR0ZXJhbmNlLmNhbkFubm91bmNlUHJvcGVydHk7XHJcbiAgICBpZiAoIHV0dGVyYW5jZUNhbkFubm91bmNlUHJvcGVydHkuaGFzTGlzdGVuZXIoIHRoaXMuYm91bmRIYW5kbGVDYW5Bbm5vdW5jZUNoYW5nZSApICkge1xyXG4gICAgICB1dHRlcmFuY2VDYW5Bbm5vdW5jZVByb3BlcnR5LnVubGluayggdGhpcy5ib3VuZEhhbmRsZUNhbkFubm91bmNlQ2hhbmdlICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdXR0ZXJhbmNlVm9pY2luZ0NhbkFubm91bmNlUHJvcGVydHkgPSBzcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyLnV0dGVyYW5jZS52b2ljaW5nQ2FuQW5ub3VuY2VQcm9wZXJ0eTtcclxuICAgIGlmICggdXR0ZXJhbmNlVm9pY2luZ0NhbkFubm91bmNlUHJvcGVydHkuaGFzTGlzdGVuZXIoIHRoaXMuYm91bmRIYW5kbGVDYW5Bbm5vdW5jZUNoYW5nZSApICkge1xyXG4gICAgICB1dHRlcmFuY2VWb2ljaW5nQ2FuQW5ub3VuY2VQcm9wZXJ0eS51bmxpbmsoIHRoaXMuYm91bmRIYW5kbGVDYW5Bbm5vdW5jZUNoYW5nZSApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc3BlYWtpbmdTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSByZWZlcmVuY2VzIHRvIHRoZSBTcGVlY2hTeW50aGVzaXMgb2YgdGhlIFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlciB0aGF0IGlzIHVzZWQgdG8gcmVxdWVzdCBzcGVlY2ggd2l0aCB0aGUgV2ViXHJcbiAgICogU3BlZWNoIEFQSS4gRXZlcnkgcmVmZXJlbmNlcyBoYXMgYSBjaGVjayB0byBlbnN1cmUgdGhhdCB0aGUgc3ludGggaXMgYXZhaWxhYmxlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0U3ludGgoKTogbnVsbCB8IFNwZWVjaFN5bnRoZXNpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBTcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIuaXNTcGVlY2hTeW50aGVzaXNTdXBwb3J0ZWQoKSwgJ1RyeWluZyB0byB1c2UgU3BlZWNoU3ludGhlc2lzLCBidXQgaXQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGlzIHBsYXRmb3JtLicgKTtcclxuICAgIHJldHVybiB0aGlzLnN5bnRoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RvcHMgYW55IFV0dGVyYW5jZSB0aGF0IGlzIGN1cnJlbnRseSBiZWluZyBhbm5vdW5jZWQgb3IgaXMgKGFib3V0IHRvIGJlIGFubm91bmNlZCkuXHJcbiAgICogKHV0dGVyYW5jZS1xdWV1ZSBpbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgY2FuY2VsKCk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLmluaXRpYWxpemVkICkge1xyXG4gICAgICB0aGlzLnNwZWFraW5nU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlciAmJiB0aGlzLmNhbmNlbFV0dGVyYW5jZSggdGhpcy5zcGVha2luZ1NwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXIudXR0ZXJhbmNlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYW5jZWwgdGhlIHByb3ZpZGVkIFV0dGVyYW5jZSwgaWYgaXQgaXMgY3VycmVudGx5IGJlaW5nIHNwb2tlbiBieSB0aGlzIEFubm91bmNlci4gRG9lcyBub3QgY2FuY2VsXHJcbiAgICogYW55IG90aGVyIHV0dGVyYW5jZXMgdGhhdCBtYXkgYmUgaW4gdGhlIFV0dGVyYW5jZVF1ZXVlLlxyXG4gICAqICh1dHRlcmFuY2UtcXVldWUgaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGNhbmNlbFV0dGVyYW5jZSggdXR0ZXJhbmNlOiBVdHRlcmFuY2UgKTogdm9pZCB7XHJcblxyXG4gICAgY29uc3Qgd3JhcHBlciA9IHRoaXMuc3BlYWtpbmdTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyO1xyXG5cclxuICAgIGlmICggd3JhcHBlciAmJiB1dHRlcmFuY2UgPT09IHdyYXBwZXIudXR0ZXJhbmNlICkge1xyXG4gICAgICB0aGlzLmhhbmRsZVNwZWVjaFN5bnRoZXNpc0VuZCggd3JhcHBlci5hbm5vdW5jZVRleHQsIHdyYXBwZXIgKTtcclxuXHJcbiAgICAgIC8vIHNpbGVuY2UgYWxsIHNwZWVjaCAtIGFmdGVyIGhhbmRsZVNwZWVjaFN5bnRoZXNpc0VuZCBzbyB3ZSBkb24ndCBkbyB0aGF0IHdvcmsgdHdpY2UgaW4gY2FzZSBgY2FuY2VsU3ludGhgXHJcbiAgICAgIC8vIGFsc28gdHJpZ2dlcnMgZW5kIGV2ZW50cyBpbW1lZGlhdGVseSAoYnV0IHRoYXQgZG9lc24ndCBoYXBwZW4gb24gYWxsIGJyb3dzZXJzKVxyXG4gICAgICB0aGlzLmNhbmNlbFN5bnRoKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiBvbmUgdXR0ZXJhbmNlLCBzaG91bGQgaXQgY2FuY2VsIGFub3RoZXIgcHJvdmlkZWQgdXR0ZXJhbmNlP1xyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBzaG91bGRVdHRlcmFuY2VDYW5jZWxPdGhlciggdXR0ZXJhbmNlOiBVdHRlcmFuY2UsIHV0dGVyYW5jZVRvQ2FuY2VsOiBVdHRlcmFuY2UgKTogYm9vbGVhbiB7XHJcblxyXG4gICAgLy8gVXR0ZXJhbmNlLmFubm91bmNlck9wdGlvbnMgbXVzdCBiZSBtb3JlIGdlbmVyYWwgdG8gYWxsb3cgdGhpcyB0eXBlIHRvIGFwcGx5IHRvIGFueSBpbXBsZW1lbnRhdGlvbiBvZiBBbm5vdW5jZXIsIHRodXMgXCJPYmplY3RcIiBhcyB0aGUgcHJvdmlkZWQgb3B0aW9ucy5cclxuICAgIGNvbnN0IHV0dGVyYW5jZU9wdGlvbnMgPSBvcHRpb25pemUzPFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlT3B0aW9ucywgU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VPcHRpb25zPigpKFxyXG4gICAgICB7fSwgVVRURVJBTkNFX09QVElPTl9ERUZBVUxUUywgdXR0ZXJhbmNlLmFubm91bmNlck9wdGlvbnNcclxuICAgICk7XHJcblxyXG4gICAgbGV0IHNob3VsZENhbmNlbDtcclxuICAgIGlmICggdXR0ZXJhbmNlVG9DYW5jZWwucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSAhPT0gdXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHNob3VsZENhbmNlbCA9IHV0dGVyYW5jZVRvQ2FuY2VsLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPCB1dHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBzaG91bGRDYW5jZWwgPSB1dHRlcmFuY2VPcHRpb25zLmNhbmNlbE90aGVyO1xyXG4gICAgICBpZiAoIHV0dGVyYW5jZVRvQ2FuY2VsICYmIHV0dGVyYW5jZVRvQ2FuY2VsID09PSB1dHRlcmFuY2UgKSB7XHJcbiAgICAgICAgc2hvdWxkQ2FuY2VsID0gdXR0ZXJhbmNlT3B0aW9ucy5jYW5jZWxTZWxmO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNob3VsZENhbmNlbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZW4gdGhlIHByaW9yaXR5IGZvciBhIG5ldyB1dHRlcmFuY2UgY2hhbmdlcyBvciBpZiBhIG5ldyB1dHRlcmFuY2UgaXMgYWRkZWQgdG8gdGhlIHF1ZXVlLCBkZXRlcm1pbmUgd2hldGhlclxyXG4gICAqIHdlIHNob3VsZCBjYW5jZWwgdGhlIHN5bnRoIGltbWVkaWF0ZWx5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBvblV0dGVyYW5jZVByaW9yaXR5Q2hhbmdlKCBuZXh0QXZhaWxhYmxlVXR0ZXJhbmNlOiBVdHRlcmFuY2UgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gdGVzdCBhZ2FpbnN0IHdoYXQgaXMgY3VycmVudGx5IGJlaW5nIHNwb2tlbiBieSB0aGUgc3ludGhcclxuICAgIGNvbnN0IHdyYXBwZXIgPSB0aGlzLnNwZWFraW5nU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlV3JhcHBlcjtcclxuICAgIGlmICggd3JhcHBlciAmJiB0aGlzLnNob3VsZFV0dGVyYW5jZUNhbmNlbE90aGVyKCBuZXh0QXZhaWxhYmxlVXR0ZXJhbmNlLCB3cmFwcGVyLnV0dGVyYW5jZSApICkge1xyXG4gICAgICB0aGlzLmNhbmNlbFV0dGVyYW5jZSggd3JhcHBlci51dHRlcmFuY2UgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbmNlbCB0aGUgc3ludGguIFRoaXMgd2lsbCBzaWxlbmNlIHNwZWVjaC4gVGhpcyB3aWxsIHNpbGVuY2UgYW55IHNwZWVjaCBhbmQgY2FuY2VsIHRoZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgY2FuY2VsU3ludGgoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmluaXRpYWxpemVkLCAnbXVzdCBiZSBpbml0aWFsaXplZCB0byB1c2Ugc3ludGgnICk7XHJcbiAgICBjb25zdCBzeW50aCA9IHRoaXMuZ2V0U3ludGgoKSE7XHJcbiAgICBzeW50aCAmJiBzeW50aC5jYW5jZWwoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBTcGVlY2hTeW50aGVzaXMgaXMgYXZhaWxhYmxlIG9uIHRoZSB3aW5kb3cuIFRoaXMgY2hlY2sgaXMgc3VmZmljaWVudCBmb3IgYWxsIG9mXHJcbiAgICogU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyLiBPbiBwbGF0Zm9ybXMgd2hlcmUgc3BlZWNoU3ludGhlc2lzIGlzIGF2YWlsYWJsZSwgYWxsIGZlYXR1cmVzIG9mIGl0IGFyZSBhdmFpbGFibGUsIGV4Y2VwdCBmb3IgdGhlXHJcbiAgICogb252b2ljZXNjaGFuZ2VkIGV2ZW50IGluIGEgY291cGxlIG9mIHBsYXRmb3Jtcy4gSG93ZXZlciwgdGhlIGxpc3RlbmVyIGNhbiBzdGlsbCBiZSBzZXRcclxuICAgKiB3aXRob3V0IGlzc3VlIG9uIHRob3NlIHBsYXRmb3JtcyBzbyB3ZSBkb24ndCBuZWVkIHRvIGNoZWNrIGZvciBpdHMgZXhpc3RlbmNlLiBPbiB0aG9zZSBwbGF0Zm9ybXMsIHZvaWNlc1xyXG4gICAqIGFyZSBwcm92aWRlZCByaWdodCBvbiBsb2FkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgaXNTcGVlY2hTeW50aGVzaXNTdXBwb3J0ZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gISF3aW5kb3cuc3BlZWNoU3ludGhlc2lzICYmICEhd2luZG93LlNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbiBpbm5lciBjbGFzcyB0aGF0IGNvbWJpbmVzIHNvbWUgb2JqZWN0cyB0aGF0IGFyZSBuZWNlc3NhcnkgdG8ga2VlcCB0cmFjayBvZiB0byBkaXNwb3NlXHJcbiAqIFNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZXMgd2hlbiBpdCBpcyB0aW1lLiBJdCBpcyBhbHNvIHVzZWQgZm9yIHRoZSBcIlNhZmFyaSBXb3JrYXJvdW5kXCIgdG8ga2VlcCBhIHJlZmVyZW5jZVxyXG4gKiBvZiB0aGUgU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlIGluIG1lbW9yeSBsb25nIGVub3VnaCBmb3IgdGhlICdlbmQnIGV2ZW50IHRvIGJlIGVtaXR0ZWQuXHJcbiAqL1xyXG5jbGFzcyBTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyIHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHB1YmxpYyByZWFkb25seSB1dHRlcmFuY2U6IFV0dGVyYW5jZSxcclxuICAgICAgICAgICAgICAgICAgICAgIHB1YmxpYyByZWFkb25seSBhbm5vdW5jZVRleHQ6IFJlc29sdmVkUmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICBwdWJsaWMgcmVhZG9ubHkgc3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlOiBTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICBwdWJsaWMgc3RhcnRlZDogYm9vbGVhbixcclxuICAgICAgICAgICAgICAgICAgICAgIHB1YmxpYyByZWFkb25seSBlbmRMaXN0ZW5lcjogKCkgPT4gdm9pZCxcclxuICAgICAgICAgICAgICAgICAgICAgIHB1YmxpYyByZWFkb25seSBzdGFydExpc3RlbmVyOiAoKSA9PiB2b2lkICkge1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJlbW92ZSA8YnI+IG9yIDxici8+IHRhZ3MgZnJvbSBhIHN0cmluZ1xyXG4gKiBAcGFyYW0gc3RyaW5nIC0gcGxhaW4gdGV4dCBvciBodG1sIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gcmVtb3ZlQnJUYWdzKCBzdHJpbmc6IHN0cmluZyApOiBzdHJpbmcge1xyXG4gIHJldHVybiBzdHJpbmcuc3BsaXQoICc8YnIvPicgKS5qb2luKCAnICcgKS5zcGxpdCggJzxicj4nICkuam9pbiggJyAnICk7XHJcbn1cclxuXHJcbmNvbnN0IFNwZWVjaFN5bnRoZXNpc1ZvaWNlSU8gPSBuZXcgSU9UeXBlKCAnU3BlZWNoU3ludGhlc2lzVm9pY2VJTycsIHtcclxuICBpc1ZhbGlkVmFsdWU6IHYgPT4gdHJ1ZSwgLy8gU3BlZWNoU3ludGhlc2lzVm9pY2UgaXMgbm90IGF2YWlsYWJsZSBvbiB3aW5kb3dcclxuICB0b1N0YXRlT2JqZWN0OiBzcGVlY2hTeW50aGVzaXNWb2ljZSA9PiBzcGVlY2hTeW50aGVzaXNWb2ljZS5uYW1lXHJcbn0gKTtcclxuXHJcbnV0dGVyYW5jZVF1ZXVlTmFtZXNwYWNlLnJlZ2lzdGVyKCAnU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyJywgU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyICk7XHJcbmV4cG9ydCBkZWZhdWx0IFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSxrQ0FBa0M7QUFDOUQsT0FBT0MsZUFBZSxNQUFNLGtDQUFrQztBQUM5RCxPQUFPQyxPQUFPLE1BQU0sMEJBQTBCO0FBQzlDLE9BQU9DLGdCQUFnQixNQUFNLG1DQUFtQztBQUdoRSxPQUFPQyxjQUFjLE1BQU0saUNBQWlDO0FBQzVELE9BQU9DLFFBQVEsTUFBTSwyQkFBMkI7QUFDaEQsT0FBT0MsS0FBSyxNQUFNLHVCQUF1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