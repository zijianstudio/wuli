// Copyright 2015-2023, University of Colorado Boulder

/**
 * Initializes phet globals that are used by all simulations, including assertions and query-parameters.
 * See https://github.com/phetsims/phetcommon/issues/23
 * This file must be loaded before the simulation is started up, and this file cannot be loaded as an AMD module.
 * The easiest way to do this is via a <script> tag in your HTML file.
 *
 * PhET Simulations can be launched with query parameters which enable certain features.  To use a query parameter,
 * provide the full URL of the simulation and append a question mark (?) then the query parameter (and optionally its
 * value assignment).  For instance:
 * https://phet-dev.colorado.edu/html/reactants-products-and-leftovers/1.0.0-dev.13/reactants-products-and-leftovers_en.html?dev
 *
 * Here is an example of a value assignment:
 * https://phet-dev.colorado.edu/html/reactants-products-and-leftovers/1.0.0-dev.13/reactants-products-and-leftovers_en.html?webgl=false
 *
 * To use multiple query parameters, specify the question mark before the first query parameter, then ampersands (&)
 * between other query parameters.  Here is an example of multiple query parameters:
 * https://phet-dev.colorado.edu/html/reactants-products-and-leftovers/1.0.0-dev.13/reactants-products-and-leftovers_en.html?dev&showPointerAreas&webgl=false
 *
 * For more on query parameters in general, see http://en.wikipedia.org/wiki/Query_string
 * For details on common-code query parameters, see QUERY_PARAMETERS_SCHEMA below.
 * For sim-specific query parameters (if there are any), see *QueryParameters.js in the simulation's repository.
 *
 * Many of these query parameters' jsdoc is rendered and visible publicly to PhET-iO client. Those sections should be
 * marked, see top level comment in Client.js about private vs public documentation
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Malley (PixelZoom, Inc.)
 */
(function () {
  assert && assert(window.QueryStringMachine, 'QueryStringMachine is used, and should be loaded before this code runs');

  // packageObject may not always be available if initialize-globals used without chipper-initialization.js
  const packageObject = _.hasIn(window, 'phet.chipper.packageObject') ? phet.chipper.packageObject : {};
  const packagePhet = packageObject.phet || {};

  // duck type defaults so that not all package.json files need to have a phet.simFeatures section.
  const packageSimFeatures = packagePhet.simFeatures || {};

  // The color profile used by default, if no colorProfiles are specified in package.json.
  // NOTE: Duplicated in SceneryConstants.js since scenery does not include initialize-globals.js
  const DEFAULT_COLOR_PROFILE = 'default';

  // The possible color profiles for the current simulation.
  const colorProfiles = packageSimFeatures.colorProfiles || [DEFAULT_COLOR_PROFILE];

  // Private Doc: Note: the following jsdoc is for the public facing PhET-iO API. In addition, all query parameters in the schema
  // that are a "memberOf" the "PhetQueryParameters" namespace are used in the jsdoc that is public (client facing)
  // phet-io documentation. Private comments about implementation details will be in comments above the jsdoc, and
  // marked as such.
  // Note: this had to be jsdoc directly for QUERY_PARAMETERS_SCHEMA to support the correct auto formatting.

  /**
   * Query parameters that manipulate the startup state of the PhET simulation. This is not
   * an object defined in the global scope, but rather it serves as documentation about available query parameters.
   * Note: The "flag" type for query parameters does not expect a value for the key, but rather just the presence of
   * the key itself.
   * @namespace {Object} PhetQueryParameters
   */
  const QUERY_PARAMETERS_SCHEMA = {
    // Schema that describes query parameters for PhET common code.
    // These query parameters are available via global phet.chipper.queryParameters.

    /**
     * In environments where users should not be able to navigate hyperlinks away from the simulation, clients can use
     * ?allowLinks=false.  In this case, links are displayed and not clickable. This query parameter is public facing.
     * @memberOf PhetQueryParameters
     * @type {boolean}
     */
    allowLinks: {
      type: 'boolean',
      defaultValue: true,
      public: true
    },
    /**
     * Allows setting of the sound state, possible values are 'enabled' (default), 'muted', and 'disabled'.  Sound
     * must be supported by the sim for this to have any effect.
     * @memberOf PhetQueryParameters
     * @type {string}
     */
    audio: {
      type: 'string',
      defaultValue: 'enabled',
      validValues: ['enabled', 'disabled', 'muted'],
      public: true
    },
    /**
     * Generates object reports that can be used by binder. For internal use.
     * See InstanceRegistry.js and binder repo (specifically getFromSimInMaster.js) sfor more details.
     */
    binder: {
      type: 'flag'
    },
    /**
     * specifies the brand that should be used in unbuilt mode
     */
    brand: {
      type: 'string',
      defaultValue: 'adapted-from-phet'
    },
    /**
     * When present, will trigger changes that are more similar to the build environment.
     * Right now, this includes computing higher-resolution mipmaps for the mipmap plugin.
     */
    buildCompatible: {
      type: 'flag'
    },
    /**
     * When provided a non-zero-length value, the sim will send out assorted events meant for continus testing
     * integration (see sim-test.js).
     */
    continuousTest: {
      type: 'string',
      defaultValue: ''
    },
    // Private Doc:  For external use. The below jsdoc is public to the PhET-iO API documentation. Change wisely.
    /**
     * The color profile used at startup, relevant only for sims that support multiple color profiles. 'default' and
     * 'projector' are implemented in several sims, other profile names are not currently standardized.
     * @memberOf PhetQueryParameters
     * @type {string}
     */
    colorProfile: {
      type: 'string',
      defaultValue: colorProfiles[0],
      // usually "default", but some sims like masses-and-springs-basics do not use default at all
      validValues: colorProfiles,
      public: true
    },
    /**
     * enables debugger commands in certain cases like thrown errors and failed tests.
     */
    debugger: {
      type: 'flag'
    },
    // Output deprecation warnings via console.warn, see https://github.com/phetsims/chipper/issues/882. For internal
    // use only.
    deprecationWarnings: {
      type: 'flag'
    },
    /**
     * enables developer-only features, such as showing the layout bounds
     */
    dev: {
      type: 'flag'
    },
    /**
     * enables assertions
     */
    ea: {
      type: 'flag'
    },
    /**
     * Enables all assertions, as above but with more time-consuming checks
     */
    eall: {
      type: 'flag'
    },
    /**
     * Controls whether extra sound is on or off at startup (user can change later).  This query parameter is public
     * facing.
     * @type {boolean}
     */
    extraSoundInitiallyEnabled: {
      type: 'flag',
      public: true
    },
    /**
     * Randomly sends mouse events and touch events to sim.
     */
    fuzz: {
      type: 'flag'
    },
    /**
     * Randomly sends keyboard events to the sim. Must have accessibility enabled.
     */
    fuzzBoard: {
      type: 'flag'
    },
    /**
     * Randomly sends mouse events to sim.
     */
    fuzzMouse: {
      type: 'flag'
    },
    /**
     * The maximum number of concurrent pointers allowed for fuzzing. Using a value larger than 1 will test multitouch
     * behavior (with ?fuzz, ?fuzzMouse, ?fuzzTouch, etc.)
     */
    fuzzPointers: {
      type: 'number',
      defaultValue: 1
    },
    /**
     * Randomly sends touch events to sim.
     */
    fuzzTouch: {
      type: 'flag'
    },
    /**
     * if fuzzMouse=true or fuzzTouch=true, this is the average number of mouse/touch events to synthesize per frame.
     */
    fuzzRate: {
      type: 'number',
      defaultValue: 100,
      isValidValue: function (value) {
        return value > 0;
      }
    },
    /**
     * Used for providing an external Google Analytics (using the soon-to-be-sunset UA/Universial Analytics) property
     * for tracking, see https://github.com/phetsims/phetcommon/issues/46 for more information.
     *
     * Generally, this string will start with 'UA-' (otherwise use ?ga4)
     *
     * This is useful for various users/clients that want to embed simulations, or direct users to simulations. For
     * example, if a sim is included in an epub, the sim HTML won't have to be modified to include page tracking.
     */
    ga: {
      type: 'string',
      defaultValue: null
    },
    /**
     * Used for providing an external Google Analytics 4 (gtag.js) property for tracking, see
     * https://github.com/phetsims/phetcommon/issues/46 for more information.
     *
     * Generally, this string will start with 'G-' for GA4 trackers
     *
     * This is useful for various users/clients that want to embed simulations, or direct users to simulations. For
     * example, if a sim is included in an epub, the sim HTML won't have to be modified to include page tracking.
     */
    ga4: {
      type: 'string',
      defaultValue: null
    },
    /**
     * Launches the game-up-camera code which delivers images to requests in BrainPOP/Game Up/SnapThought
     */
    gameUp: {
      type: 'flag'
    },
    /**
     * Enables the game-up-camera code to respond to messages from any origin
     */
    gameUpTestHarness: {
      type: 'flag'
    },
    /**
     * Enables logging for game-up-camera, see gameUp
     */
    gameUpLogging: {
      type: 'flag'
    },
    /**
     * Used for providing a Google Analytics page ID for tracking, see
     * https://github.com/phetsims/phetcommon/issues/46 for more information.
     *
     * This is given as the 3rd parameter to a pageview send when provided
     */
    gaPage: {
      type: 'string',
      defaultValue: null
    },
    // Private Doc:  For external use. The below jsdoc is public to the PhET-iO API documentation. Change wisely.
    /**
     * Indicates whether to display the home screen.
     * For multi-screen sims only, throws an assertion error if supplied for a single-screen sim.
     * @memberOf PhetQueryParameters
     * @type {boolean}
     */
    homeScreen: {
      type: 'boolean',
      defaultValue: true,
      public: true
    },
    // Private Doc: For external use. The below jsdoc is public to the PhET-iO API documentation. Change wisely.
    // The value is one of the values in the screens array, not an index into the screens array.
    /**
     * Specifies the initial screen that will be visible when the sim starts.
     * See `?screens` query parameter for screen numbering.
     * For multi-screen sims only, throws an assertion error if applied in a single-screen sims.
     * The default value of 0 is the home screen.
     * @memberOf PhetQueryParameters
     * @type {number}
     */
    initialScreen: {
      type: 'number',
      defaultValue: 0,
      // the home screen
      public: true
    },
    /**
     * Enables support for Legends of Learning platform, including broadcasting 'init' and responding to pause/resume.
     */
    legendsOfLearning: {
      type: 'flag'
    },
    /**
     * If this is a finite number AND assertions are enabled, it will track maximum (TinyEmitter) listener counts, and
     * will assert that the count is not greater than the limit.
     */
    listenerLimit: {
      type: 'number',
      defaultValue: Number.POSITIVE_INFINITY,
      public: false
    },
    /**
     * Select the language of the sim to the specific locale. Default to "en".
     * @memberOf PhetQueryParameters
     * @type {string}
     */
    locale: {
      type: 'string',
      defaultValue: 'en'
      // Do NOT add the `public` key here. We want invalid values to fall back to en.
    },

    /**
     * Provides the locales to load during startup for an un-built simulation (will automatically load the ?locale, or
     * English if provided).
     *
     * If the only provided value is '*', then it will load all the locales.
     */
    locales: {
      type: 'array',
      elementSchema: {
        type: 'string'
      },
      defaultValue: []
    },
    /**
     * Enables basic logging to the console.
     * Usage in code: phet.log && phet.log( 'your message' );
     */
    log: {
      type: 'flag'
    },
    /**
     * Sets a maximum "memory" limit (in MB). If the simulation's running average of memory usage goes over this amount
     * in operation (as determined currently by using Chome's window.performance), then an error will be thrown.
     *
     * This is useful for continuous testing, to ensure we aren't leaking huge amounts of memory, and can also be used
     * with the Chrome command-line flag --enable-precise-memory-info to make the determination more accurate.
     *
     * The value 0 will be ignored, since our sims are likely to use more than that much memory.
     */
    memoryLimit: {
      type: 'number',
      defaultValue: 0
    },
    /**
     * Enables transforming the PDOM for accessibility on mobile devices. This work is experimental, and still hidden
     * in a scenery branch pdom-transform. Must be used in combination with the accessibility query parameter, or
     * on a sim that has accessibility enabled by default. This query parameter is not intended to be long lived,
     * in the future these features should be always enabled in the scenery a11y framework.
     * See https://github.com/phetsims/scenery/issues/852
     *
     * For internal use and testing only, though links with this may be shared with collaborators.
     *
     * @a11y
     */
    mobileA11yTest: {
      type: 'flag'
    },
    /**
     * If this is a finite number AND assertions are enabled, it will track maximum Node parent counts, and
     * will assert that the count is not greater than the limit.
     */
    parentLimit: {
      type: 'number',
      defaultValue: Number.POSITIVE_INFINITY,
      public: false
    },
    /**
     * When a simulation is run from the PhET Android app, it should set this flag. It alters statistics that the sim sends
     * to Google Analytics and potentially other sources in the future.
     *
     * Also removes the following items from the "PhET Menu":
     * Report a Problem
     * Check for Updates
     * Screenshot
     * Full Screen
     */
    'phet-android-app': {
      type: 'flag'
    },
    /**
     * When a simulation is run from the PhET iOS app, it should set this flag. It alters statistics that the sim sends
     * to Google Analytics and potentially other sources in the future.
     *
     * Also removes the following items from the "PhET Menu":
     * Report a Problem
     * Check for Updates
     * Screenshot
     * Full Screen
     */
    'phet-app': {
      type: 'flag'
    },
    /**
     * If true, puts the simulation in a special mode where it will wait for manual control of the sim playback.
     */
    playbackMode: {
      type: 'boolean',
      defaultValue: false
    },
    /**
     * Fires a post-message when the sim is about to change to another URL
     */
    postMessageOnBeforeUnload: {
      type: 'flag'
    },
    /**
     * passes errors to test-sims
     */
    postMessageOnError: {
      type: 'flag'
    },
    /**
     * triggers a post-message that fires when the sim finishes loading, currently used by aqua test-sims
     */
    postMessageOnLoad: {
      type: 'flag'
    },
    /**
     * triggers a post-message that fires when the simulation is ready to start.
     */
    postMessageOnReady: {
      type: 'flag'
    },
    /**
     * Controls whether the preserveDrawingBuffer:true is set on WebGL Canvases. This allows canvas.toDataURL() to work
     * (used for certain methods that require screenshot generation using foreign object rasterization, etc.).
     * Generally reduces WebGL performance, so it should not always be on (thus the query parameter).
     */
    preserveDrawingBuffer: {
      type: 'flag'
    },
    /**
     * If true, the full screen button won't be shown in the phet menu
     */
    preventFullScreen: {
      type: 'flag'
    },
    /**
     * shows profiling information for the sim
     */
    profiler: {
      type: 'flag'
    },
    /**
     * adds a menu item that will open a window with a QR code with the URL of the simulation
     */
    qrCode: {
      type: 'flag'
    },
    /**
     * Random seed in the preload code that can be used to make sure playback simulations use the same seed (and thus
     * the simulation state, given the input events and frames, can be exactly reproduced)
     * See Random.js
     */
    randomSeed: {
      type: 'number',
      defaultValue: Math.random() // eslint-disable-line bad-sim-text
    },

    /**
     * Specify a renderer for the Sim's rootNode to use.
     */
    rootRenderer: {
      type: 'string',
      defaultValue: null,
      validValues: [null, 'canvas', 'svg', 'dom', 'webgl'] // see Node.setRenderer
    },

    /**
     * Array of one or more logs to enable in scenery 0.2+, delimited with commas.
     * For example: ?sceneryLog=Display,Drawable,WebGLBlock results in [ 'Display', 'Drawable', 'WebGLBlock' ]
     * Don't change this without updating the signature in scenery unit tests too.
     *
     * The entire supported list is in scenery.js in the logProperties object.
     */
    sceneryLog: {
      type: 'array',
      elementSchema: {
        type: 'string'
      },
      defaultValue: null
    },
    /**
     * Scenery logs will be output to a string instead of the window
     */
    sceneryStringLog: {
      type: 'flag'
    },
    /**
     * Specifies the set of screens that appear in the sim, and their order.
     * Uses 1-based (not zero-based) and "," delimited string such as "1,3,4" to get the 1st, 3rd and 4th screen.
     * @type {Array.<number>}
     */
    screens: {
      type: 'array',
      elementSchema: {
        type: 'number',
        isValidValue: Number.isInteger
      },
      defaultValue: null,
      isValidValue: function (value) {
        // screen indices cannot be duplicated
        return value === null || value.length === _.uniq(value).length && value.length > 0;
      },
      public: true
    },
    /**
     * Typically used to show answers (or hidden controls that show answers) to challenges in sim games.
     * For internal use by PhET team members only.
     */
    showAnswers: {
      type: 'flag',
      private: true
    },
    /**
     * Displays an overlay of the current bounds of each CanvasNode
     */
    showCanvasNodeBounds: {
      type: 'flag'
    },
    /**
     * Displays an overlay of the current bounds of each phet.scenery.FittedBlock
     */
    showFittedBlockBounds: {
      type: 'flag'
    },
    /**
     * Shows hit areas as dashed lines.
     */
    showHitAreas: {
      type: 'flag'
    },
    /**
     * Shows pointer areas as dashed lines. touchAreas are red, mouseAreas are blue.
     */
    showPointerAreas: {
      type: 'flag'
    },
    /**
     * Displays a semi-transparent cursor indicator for the position of each active pointer on the screen.
     */
    showPointers: {
      type: 'flag'
    },
    /**
     * Shows the visible bounds in ScreenView.js, for debugging the layout outside of the "dev" bounds
     */
    showVisibleBounds: {
      type: 'flag'
    },
    /**
     * Shuffles listeners each time they are notified, to help us test order dependency, see https://github.com/phetsims/axon/issues/215
     *
     * 'default' - no shuffling
     * 'random' - chooses a seed for you
     * 'random(123)' - specify a seed
     * 'reverse' - reverse the order of listeners
     */
    listenerOrder: {
      type: 'string',
      defaultValue: 'default',
      isValidValue: function (value) {
        // NOTE: this regular expression must be maintained in TinyEmitter.ts as well.
        const regex = /random(?:%28|\()(\d+)(?:%29|\))/;
        return value === 'default' || value === 'random' || value === 'reverse' || value.match(regex);
      }
    },
    /**
     * When true, use SpeechSynthesisParentPolyfill to assign an implementation of SpeechSynthesis
     * to the window so that it can be used in platforms where it otherwise would not be available.
     * Assumes that an implementation of SpeechSynthesis is available from a parent iframe window.
     * See SpeechSynthesisParentPolyfill in utterance-queue for more information.
     *
     * This cannot be a query parameter in utterance-queue because utterance-queue (a dependency of scenery)
     * can not use QueryStringMachine. See https://github.com/phetsims/scenery/issues/1366.
     *
     * For more information about the motivation for this see https://github.com/phetsims/fenster/issues/3
     *
     * For internal use only.
     */
    speechSynthesisFromParent: {
      type: 'flag'
    },
    /**
     * Speed multiplier for everything in the sim. This scales the value of dt for AXON/timer,
     * model.step, view.step, and anything else that is controlled from Sim.stepSimulation.
     * Normal speed is 1. Larger values make time go faster, smaller values make time go slower.
     * For example, ?speed=0.5 is half the normal speed.
     * Useful for testing multi-touch, so that objects are easier to grab while they're moving.
     * For internal use only, not public facing.
     */
    speed: {
      type: 'number',
      defaultValue: 1,
      isValidValue: function (value) {
        return value > 0;
      }
    },
    /**
     * Override translated strings.
     * The value is encoded JSON of the form { "namespace.key":"value", "namespace.key":"value", ... }
     * Example: { "PH_SCALE/logarithmic":"foo", "PH_SCALE/linear":"bar" }
     * Encode the JSON in a browser console using: encodeURIComponent( JSON.stringify( value ) )
     */
    strings: {
      type: 'string',
      defaultValue: null
    },
    /**
     * Sets a string used for various i18n test.  The values are:
     *
     * double: duplicates all of the translated strings which will allow to see (a) if all strings
     *   are translated and (b) whether the layout can accommodate longer strings from other languages.
     *   Note this is a heuristic rule that does not cover all cases.
     *
     * long: an exceptionally long string will be substituted for all strings. Use this to test for layout problems.
     *
     * rtl: a string that tests RTL (right-to-left) capabilities will be substituted for all strings
     *
     * xss: tests for security issues related to https://github.com/phetsims/special-ops/issues/18,
     *   and running a sim should NOT redirect to another page. Preferably should be used for built versions or
     *   other versions where assertions are not enabled.
     *
     * none|null: the normal translated string will be shown
     *
     * dynamic: adds global hotkey listeners to change the strings, see https://github.com/phetsims/chipper/issues/1319
     *   right arrow - doubles a string, like string = string+string
     *   left arrow - halves a string
     *   up arrow - cycles to next stride in random word list
     *   down arrow - cycles to previous stride in random word list
     *   spacebar - resets to initial English strings, and resets the stride
     *
     * {string}: if any other string provided, that string will be substituted everywhere. This facilitates testing
     *   specific cases, like whether the word 'vitesse' would substitute for 'speed' well.  Also, using "/u20" it
     *   will show whitespace for all of the strings, making it easy to identify non-translated strings.
     */
    stringTest: {
      type: 'string',
      defaultValue: null
    },
    /**
     * adds keyboard shortcuts. ctrl+i (forward) or ctrl+u (backward). Also, the same physical keys on the
     * dvorak keyboard (c=forward and g=backwards)
     *
     * NOTE: DUPLICATION ALERT. Don't change this without looking at parameter in PHET_IO_WRAPPERS/Client.ts
     */
    keyboardLocaleSwitcher: {
      type: 'flag'
    },
    /**
     *
     * Enables interactive description in the simulation. Use this option to render the Parallel DOM for keyboard
     * navigation and screen-reader-based auditory descriptions. Can be permanently enabled if
     * `supportsInteractiveDescription: true` is added under the `phet.simFeatures` entry of package.json. Query parameter
     * value will always override package.json entry.
     */
    supportsInteractiveDescription: {
      type: 'boolean',
      defaultValue: !!packageSimFeatures.supportsInteractiveDescription
    },
    /**
     * Enables support for the "Interactive Highlights" feature, where highlights appear around interactive
     * UI components. This is most useful for users with low vision and makes it easier to identify interactive
     * components. Though enabled here, the feature will be turned off until enabled by the user from the Preferences
     * dialog.
     *
     * This feature is enabled by default whenever supportsInteractiveDescription is true in package.json, since PhET
     * wants to scale out this feature with all sims that support alternative input. The feature can be DISABLED when
     * supportsInteractiveDescription is true by setting `supportsInteractiveHighlights: false` under
     * `phet.simFeatures` in package.json.
     *
     * The query parameter will always override the package.json entry.
     */
    supportsInteractiveHighlights: {
      type: 'boolean',
      // If supportsInteractiveHighlights is explicitly provided in package.json, use that value. Otherwise, enable
      // Interactive Highlights when Interactive Description is supported.
      defaultValue: packageSimFeatures.hasOwnProperty('supportsInteractiveHighlights') ? !!packageSimFeatures.supportsInteractiveHighlights : !!packageSimFeatures.supportsInteractiveDescription
    },
    /**
     * By default, Interactive Highlights are disabled on startup. Provide this flag to have the feature enabled on
     * startup. Has no effect if supportsInteractiveHighlights is false.
     */
    interactiveHighlightsInitiallyEnabled: {
      type: 'flag',
      public: true
    },
    /**
     * Indicates whether custom gesture control is enabled by default in the simulation.
     * This input method is still in development, mostly to be used in combination with the voicing
     * feature. It allows you to swipe the screen to move focus, double tap the screen to activate
     * components, and tap and hold to initiate custom gestures.
     *
     * For internal use, though may be used in shared links with collaborators.
     */
    supportsGestureControl: {
      type: 'boolean',
      defaultValue: !!packageSimFeatures.supportsGestureControl
    },
    /**
     * Indicates whether or not the "Voicing" feature is enabled. This is a prototype
     * feature that uses the web-speech API to provide speech output to the user about
     * what is happening in the simulation.
     *
     * For internal use only. This is currently only used in prototypes.
     */
    supportsVoicing: {
      type: 'boolean',
      defaultValue: !!packageSimFeatures.supportsVoicing
    },
    /**
     * By default, voicing is not enabled on startup. Add this flag to start the sim with voicing enabled.
     */
    voicingInitiallyEnabled: {
      type: 'flag'
    },
    /**
     * A debug query parameter that will save and load you preferences (from the Preferences Dialog) through multiple runtimes.
     * See PreferencesStorage.register to see what Properties support this save/load feature.
     */
    preferencesStorage: {
      type: 'flag'
    },
    /**
     * Console log the voicing responses that are spoken by SpeechSynthesis
     */
    printVoicingResponses: {
      type: 'flag'
    },
    /**
     * Enables panning and zooming of the simulation. Can be permanently disabled if supportsPanAndZoom: false is
     * added under the `phet.simFeatures` entry of package.json. Query parameter value will always override package.json entry.
     *
     * Public, so that users can disable this feature if they need to.
     */
    supportsPanAndZoom: {
      type: 'boolean',
      public: true,
      // even if not provided in package.json, this defaults to being true
      defaultValue: !packageSimFeatures.hasOwnProperty('supportsPanAndZoom') || packageSimFeatures.supportsPanAndZoom
    },
    /**
     * Indicates whether the sound library should be enabled.  If true, an icon is added to the nav bar icon to enable
     * the user to turn sound on/off.  There is also a Sim option for enabling sound which can override this.
     * Primarily for internal use, though we may share links with collaborates that use this parameter.
     */
    supportsSound: {
      type: 'boolean',
      defaultValue: !!packageSimFeatures.supportsSound
    },
    /**
     * Indicates whether extra sounds are used in addition to basic sounds as part of the sound design.  If true, the
     * PhET menu will have an option for enabling extra sounds.  This will be ignored if sound is not generally
     * enabled (see ?supportsSound).
     *
     * Primarily for internal use, though we may share links with collaborates that use this parameter.
     */
    supportsExtraSound: {
      type: 'boolean',
      defaultValue: !!packageSimFeatures.supportsExtraSound
    },
    /**
     * Indicates whether or not vibration is enabled, and which paradigm is enabled for testing. There
     * are several "paradigms", which are different vibration output designs.  For temporary use
     * while we investigate use of this feature. In the long run there will probably be only
     * one design and it can be enabled/disabled with something more like `supportsVibration`.
     *
     * These are numbered, but type is string so default can be null, where all vibration is disabled.
     *
     * Used internally, though links are shared with collaborators and possibly in paper publications.
     */
    vibrationParadigm: {
      type: 'string',
      defaultValue: null
    },
    /**
     * Enables WebGL rendering. See https://github.com/phetsims/scenery/issues/289.
     * Note that simulations can opt-in to webgl via new Sim({webgl:true}), but using ?webgl=true takes
     * precedence.  If no webgl query parameter is supplied, then simulations take the Sim option value, which
     * defaults to false.  See see https://github.com/phetsims/scenery/issues/621
     */
    webgl: {
      type: 'boolean',
      defaultValue: true
    }
  };

  // Initialize query parameters, see docs above
  (function () {
    // Create the attachment point for all PhET globals
    window.phet = window.phet || {};
    window.phet.chipper = window.phet.chipper || {};

    // Read query parameters
    window.phet.chipper.queryParameters = QueryStringMachine.getAll(QUERY_PARAMETERS_SCHEMA);
    window.phet.chipper.colorProfiles = colorProfiles;

    /**
     * Determines whether any type of fuzzing is enabled. This is a function so that the associated query parameters
     * can be changed from the console while the sim is running. See https://github.com/phetsims/sun/issues/677.
     * @returns {boolean}
     */
    window.phet.chipper.isFuzzEnabled = () => window.phet.chipper.queryParameters.fuzz || window.phet.chipper.queryParameters.fuzzMouse || window.phet.chipper.queryParameters.fuzzTouch || window.phet.chipper.queryParameters.fuzzBoard;

    // Add a log function that displays messages to the console. Examples:
    // phet.log && phet.log( 'You win!' );
    // phet.log && phet.log( 'You lose', { color: 'red' } );
    if (window.phet.chipper.queryParameters.log) {
      window.phet.log = function (message, options) {
        options = _.assignIn({
          color: '#009900' // green
        }, options);
        console.log(`%c${message}`, `color: ${options.color}`); // green
      };
    }

    /**
     * Gets the name of brand to use, which determines which logo to show in the navbar as well as what options
     * to show in the PhET menu and what text to show in the About dialog.
     * See https://github.com/phetsims/brand/issues/11
     * @returns {string}
     */
    window.phet.chipper.brand = window.phet.chipper.brand || phet.chipper.queryParameters.brand || 'adapted-from-phet';

    // {string|null} - See documentation of stringTest query parameter - we need to support this during build, where
    //                 there aren't any query parameters.
    const stringTest = typeof window !== 'undefined' && phet.chipper.queryParameters.stringTest ? phet.chipper.queryParameters.stringTest : null;

    /**
     * Maps an input string to a final string, accommodating tricks like doubleStrings.
     * This function is used to modify all strings in a sim when the stringTest query parameter is used.
     * The stringTest query parameter and its options are documented in the query parameter docs above.
     * It is used in string.js and sim.html.
     * @param string - the string to be mapped
     * @returns {string}
     */
    window.phet.chipper.mapString = function (string) {
      return stringTest === null ? string : stringTest === 'double' ? `${string}:${string}` : stringTest === 'long' ? '12345678901234567890123456789012345678901234567890' : stringTest === 'rtl' ? '\u202b\u062a\u0633\u062a (\u0632\u0628\u0627\u0646)\u202c' : stringTest === 'xss' ? `${string}<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABCQEBtxmN7wAAAABJRU5ErkJggg==" onload="window.location.href=atob('aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==')" />` : stringTest === 'none' ? string : stringTest === 'dynamic' ? string :
      // In the fallback case, supply whatever string was given in the query parameter value
      stringTest;
    };

    // If locale was provided as a query parameter, then change the locale used by Google Analytics.
    if (QueryStringMachine.containsKey('locale')) {
      window.phet.chipper.locale = phet.chipper.queryParameters.locale;
    } else if (!window.phet.chipper.locale) {
      // Fill in a default
      window.phet.chipper.locale = 'en';
    }
    const stringOverrides = JSON.parse(phet.chipper.queryParameters.strings || '{}');

    /**
     * Get a string given the key. This implementation is meant for use only in the build sim. For more info see the
     * string plugin.
     * @param {string} key - like "REPO/string.key.here" which includes the requirejsNamespace, which is specified in package.json
     * @returns {string}
     */
    phet.chipper.getStringForBuiltSim = key => {
      assert && assert(!!phet.chipper.isProduction, 'expected to be running a built sim');
      assert && assert(!!phet.chipper.strings, 'phet.chipper.strings should be filled out by initialization script');
      assert && assert(!!phet.chipper.locale, 'locale is required to look up the correct strings');

      // override strings via the 'strings' query parameter
      if (stringOverrides[key]) {
        return stringOverrides[key];
      }
      let stringMap = phet.chipper.strings[phet.chipper.locale];

      // Don't fail out on unsupported locales, see https://github.com/phetsims/chipper/issues/694
      if (!stringMap) {
        // See if there's a translation for just the language code
        stringMap = phet.chipper.strings[phet.chipper.locale.slice(0, 2)];
        if (!stringMap) {
          stringMap = phet.chipper.strings.en;
        }
      }
      return phet.chipper.mapString(stringMap[key]);
    };
  })();

  /**
   * Utility function to pause synchronously for the given number of milliseconds.
   * @param {number} millis - amount of time to pause synchronously
   */
  function sleep(millis) {
    const date = new Date();
    let curDate;
    do {
      curDate = new Date();
    } while (curDate - date < millis);
  }

  /*
   * These are used to make sure our sims still behave properly with an artificially higher load (so we can test what happens
   * at 30fps, 5fps, etc). There tend to be bugs that only happen on less-powerful devices, and these functions facilitate
   * testing a sim for robustness, and allowing others to reproduce slow-behavior bugs.
   */
  window.phet.chipper.makeEverythingSlow = function () {
    window.setInterval(() => {
      sleep(64);
    }, 16); // eslint-disable-line bad-sim-text
  };

  window.phet.chipper.makeRandomSlowness = function () {
    window.setInterval(() => {
      sleep(Math.ceil(100 + Math.random() * 200));
    }, Math.ceil(100 + Math.random() * 200)); // eslint-disable-line bad-sim-text
  };

  // Are we running a built html file?
  window.phet.chipper.isProduction = $('meta[name=phet-sim-level]').attr('content') === 'production';

  // Are we running in an app?
  window.phet.chipper.isApp = phet.chipper.queryParameters['phet-app'] || phet.chipper.queryParameters['phet-android-app'];

  /**
   * Enables or disables assertions in common libraries using query parameters.
   * There are two types of assertions: basic and slow. Enabling slow assertions will adversely impact performance.
   * 'ea' enables basic assertions, 'eall' enables basic and slow assertions.
   * Must be run before the main modules, and assumes that assert.js and query-parameters.js has been run.
   */
  (function () {
    // enables all assertions (basic and slow)
    const enableAllAssertions = !phet.chipper.isProduction && phet.chipper.queryParameters.eall;

    // enables basic assertions
    const enableBasicAssertions = enableAllAssertions || !phet.chipper.isProduction && phet.chipper.queryParameters.ea || phet.chipper.isDebugBuild;
    if (enableBasicAssertions) {
      window.assertions.enableAssert();
    }
    if (enableAllAssertions) {
      window.assertions.enableAssertSlow();
    }

    /**
     * Sends a message to a continuous testing container.
     * @public
     *
     * @param {Object} [options] - Specific object results sent to CT.
     */
    window.phet.chipper.reportContinuousTestResult = options => {
      window.parent && window.parent.postMessage(JSON.stringify(_.assignIn({
        continuousTest: JSON.parse(phet.chipper.queryParameters.continuousTest),
        url: window.location.href
      }, options)), '*');
    };
    if (phet.chipper.queryParameters.continuousTest) {
      window.addEventListener('error', a => {
        let message = '';
        let stack = '';
        if (a && a.message) {
          message = a.message;
        }
        if (a && a.error && a.error.stack) {
          stack = a.error.stack;
        }
        phet.chipper.reportContinuousTestResult({
          type: 'continuous-test-error',
          message: message,
          stack: stack
        });
      });
      window.addEventListener('beforeunload', e => {
        phet.chipper.reportContinuousTestResult({
          type: 'continuous-test-unload'
        });
      });
      // window.open stub. otherwise we get tons of "Report Problem..." popups that stall
      window.open = () => {
        return {
          focus: () => {},
          blur: () => {}
        };
      };
    }

    // Communicate sim errors to joist/tests/test-sims.html
    if (phet.chipper.queryParameters.postMessageOnError) {
      window.addEventListener('error', a => {
        let message = '';
        let stack = '';
        if (a && a.message) {
          message = a.message;
        }
        if (a && a.error && a.error.stack) {
          stack = a.error.stack;
        }
        window.parent && window.parent.postMessage(JSON.stringify({
          type: 'error',
          url: window.location.href,
          message: message,
          stack: stack
        }), '*');
      });
    }
    if (phet.chipper.queryParameters.postMessageOnBeforeUnload) {
      window.addEventListener('beforeunload', e => {
        window.parent && window.parent.postMessage(JSON.stringify({
          type: 'beforeUnload'
        }), '*');
      });
    }
  })();
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3NlcnQiLCJ3aW5kb3ciLCJRdWVyeVN0cmluZ01hY2hpbmUiLCJwYWNrYWdlT2JqZWN0IiwiXyIsImhhc0luIiwicGhldCIsImNoaXBwZXIiLCJwYWNrYWdlUGhldCIsInBhY2thZ2VTaW1GZWF0dXJlcyIsInNpbUZlYXR1cmVzIiwiREVGQVVMVF9DT0xPUl9QUk9GSUxFIiwiY29sb3JQcm9maWxlcyIsIlFVRVJZX1BBUkFNRVRFUlNfU0NIRU1BIiwiYWxsb3dMaW5rcyIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJwdWJsaWMiLCJhdWRpbyIsInZhbGlkVmFsdWVzIiwiYmluZGVyIiwiYnJhbmQiLCJidWlsZENvbXBhdGlibGUiLCJjb250aW51b3VzVGVzdCIsImNvbG9yUHJvZmlsZSIsImRlYnVnZ2VyIiwiZGVwcmVjYXRpb25XYXJuaW5ncyIsImRldiIsImVhIiwiZWFsbCIsImV4dHJhU291bmRJbml0aWFsbHlFbmFibGVkIiwiZnV6eiIsImZ1enpCb2FyZCIsImZ1enpNb3VzZSIsImZ1enpQb2ludGVycyIsImZ1enpUb3VjaCIsImZ1enpSYXRlIiwiaXNWYWxpZFZhbHVlIiwidmFsdWUiLCJnYSIsImdhNCIsImdhbWVVcCIsImdhbWVVcFRlc3RIYXJuZXNzIiwiZ2FtZVVwTG9nZ2luZyIsImdhUGFnZSIsImhvbWVTY3JlZW4iLCJpbml0aWFsU2NyZWVuIiwibGVnZW5kc09mTGVhcm5pbmciLCJsaXN0ZW5lckxpbWl0IiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJsb2NhbGUiLCJsb2NhbGVzIiwiZWxlbWVudFNjaGVtYSIsImxvZyIsIm1lbW9yeUxpbWl0IiwibW9iaWxlQTExeVRlc3QiLCJwYXJlbnRMaW1pdCIsInBsYXliYWNrTW9kZSIsInBvc3RNZXNzYWdlT25CZWZvcmVVbmxvYWQiLCJwb3N0TWVzc2FnZU9uRXJyb3IiLCJwb3N0TWVzc2FnZU9uTG9hZCIsInBvc3RNZXNzYWdlT25SZWFkeSIsInByZXNlcnZlRHJhd2luZ0J1ZmZlciIsInByZXZlbnRGdWxsU2NyZWVuIiwicHJvZmlsZXIiLCJxckNvZGUiLCJyYW5kb21TZWVkIiwiTWF0aCIsInJhbmRvbSIsInJvb3RSZW5kZXJlciIsInNjZW5lcnlMb2ciLCJzY2VuZXJ5U3RyaW5nTG9nIiwic2NyZWVucyIsImlzSW50ZWdlciIsImxlbmd0aCIsInVuaXEiLCJzaG93QW5zd2VycyIsInByaXZhdGUiLCJzaG93Q2FudmFzTm9kZUJvdW5kcyIsInNob3dGaXR0ZWRCbG9ja0JvdW5kcyIsInNob3dIaXRBcmVhcyIsInNob3dQb2ludGVyQXJlYXMiLCJzaG93UG9pbnRlcnMiLCJzaG93VmlzaWJsZUJvdW5kcyIsImxpc3RlbmVyT3JkZXIiLCJyZWdleCIsIm1hdGNoIiwic3BlZWNoU3ludGhlc2lzRnJvbVBhcmVudCIsInNwZWVkIiwic3RyaW5ncyIsInN0cmluZ1Rlc3QiLCJrZXlib2FyZExvY2FsZVN3aXRjaGVyIiwic3VwcG9ydHNJbnRlcmFjdGl2ZURlc2NyaXB0aW9uIiwic3VwcG9ydHNJbnRlcmFjdGl2ZUhpZ2hsaWdodHMiLCJoYXNPd25Qcm9wZXJ0eSIsImludGVyYWN0aXZlSGlnaGxpZ2h0c0luaXRpYWxseUVuYWJsZWQiLCJzdXBwb3J0c0dlc3R1cmVDb250cm9sIiwic3VwcG9ydHNWb2ljaW5nIiwidm9pY2luZ0luaXRpYWxseUVuYWJsZWQiLCJwcmVmZXJlbmNlc1N0b3JhZ2UiLCJwcmludFZvaWNpbmdSZXNwb25zZXMiLCJzdXBwb3J0c1BhbkFuZFpvb20iLCJzdXBwb3J0c1NvdW5kIiwic3VwcG9ydHNFeHRyYVNvdW5kIiwidmlicmF0aW9uUGFyYWRpZ20iLCJ3ZWJnbCIsInF1ZXJ5UGFyYW1ldGVycyIsImdldEFsbCIsImlzRnV6ekVuYWJsZWQiLCJtZXNzYWdlIiwib3B0aW9ucyIsImFzc2lnbkluIiwiY29sb3IiLCJjb25zb2xlIiwibWFwU3RyaW5nIiwic3RyaW5nIiwiY29udGFpbnNLZXkiLCJzdHJpbmdPdmVycmlkZXMiLCJKU09OIiwicGFyc2UiLCJnZXRTdHJpbmdGb3JCdWlsdFNpbSIsImtleSIsImlzUHJvZHVjdGlvbiIsInN0cmluZ01hcCIsInNsaWNlIiwiZW4iLCJzbGVlcCIsIm1pbGxpcyIsImRhdGUiLCJEYXRlIiwiY3VyRGF0ZSIsIm1ha2VFdmVyeXRoaW5nU2xvdyIsInNldEludGVydmFsIiwibWFrZVJhbmRvbVNsb3duZXNzIiwiY2VpbCIsIiQiLCJhdHRyIiwiaXNBcHAiLCJlbmFibGVBbGxBc3NlcnRpb25zIiwiZW5hYmxlQmFzaWNBc3NlcnRpb25zIiwiaXNEZWJ1Z0J1aWxkIiwiYXNzZXJ0aW9ucyIsImVuYWJsZUFzc2VydCIsImVuYWJsZUFzc2VydFNsb3ciLCJyZXBvcnRDb250aW51b3VzVGVzdFJlc3VsdCIsInBhcmVudCIsInBvc3RNZXNzYWdlIiwic3RyaW5naWZ5IiwidXJsIiwibG9jYXRpb24iLCJocmVmIiwiYWRkRXZlbnRMaXN0ZW5lciIsImEiLCJzdGFjayIsImVycm9yIiwiZSIsIm9wZW4iLCJmb2N1cyIsImJsdXIiXSwic291cmNlcyI6WyJpbml0aWFsaXplLWdsb2JhbHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZXMgcGhldCBnbG9iYWxzIHRoYXQgYXJlIHVzZWQgYnkgYWxsIHNpbXVsYXRpb25zLCBpbmNsdWRpbmcgYXNzZXJ0aW9ucyBhbmQgcXVlcnktcGFyYW1ldGVycy5cclxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0Y29tbW9uL2lzc3Vlcy8yM1xyXG4gKiBUaGlzIGZpbGUgbXVzdCBiZSBsb2FkZWQgYmVmb3JlIHRoZSBzaW11bGF0aW9uIGlzIHN0YXJ0ZWQgdXAsIGFuZCB0aGlzIGZpbGUgY2Fubm90IGJlIGxvYWRlZCBhcyBhbiBBTUQgbW9kdWxlLlxyXG4gKiBUaGUgZWFzaWVzdCB3YXkgdG8gZG8gdGhpcyBpcyB2aWEgYSA8c2NyaXB0PiB0YWcgaW4geW91ciBIVE1MIGZpbGUuXHJcbiAqXHJcbiAqIFBoRVQgU2ltdWxhdGlvbnMgY2FuIGJlIGxhdW5jaGVkIHdpdGggcXVlcnkgcGFyYW1ldGVycyB3aGljaCBlbmFibGUgY2VydGFpbiBmZWF0dXJlcy4gIFRvIHVzZSBhIHF1ZXJ5IHBhcmFtZXRlcixcclxuICogcHJvdmlkZSB0aGUgZnVsbCBVUkwgb2YgdGhlIHNpbXVsYXRpb24gYW5kIGFwcGVuZCBhIHF1ZXN0aW9uIG1hcmsgKD8pIHRoZW4gdGhlIHF1ZXJ5IHBhcmFtZXRlciAoYW5kIG9wdGlvbmFsbHkgaXRzXHJcbiAqIHZhbHVlIGFzc2lnbm1lbnQpLiAgRm9yIGluc3RhbmNlOlxyXG4gKiBodHRwczovL3BoZXQtZGV2LmNvbG9yYWRvLmVkdS9odG1sL3JlYWN0YW50cy1wcm9kdWN0cy1hbmQtbGVmdG92ZXJzLzEuMC4wLWRldi4xMy9yZWFjdGFudHMtcHJvZHVjdHMtYW5kLWxlZnRvdmVyc19lbi5odG1sP2RldlxyXG4gKlxyXG4gKiBIZXJlIGlzIGFuIGV4YW1wbGUgb2YgYSB2YWx1ZSBhc3NpZ25tZW50OlxyXG4gKiBodHRwczovL3BoZXQtZGV2LmNvbG9yYWRvLmVkdS9odG1sL3JlYWN0YW50cy1wcm9kdWN0cy1hbmQtbGVmdG92ZXJzLzEuMC4wLWRldi4xMy9yZWFjdGFudHMtcHJvZHVjdHMtYW5kLWxlZnRvdmVyc19lbi5odG1sP3dlYmdsPWZhbHNlXHJcbiAqXHJcbiAqIFRvIHVzZSBtdWx0aXBsZSBxdWVyeSBwYXJhbWV0ZXJzLCBzcGVjaWZ5IHRoZSBxdWVzdGlvbiBtYXJrIGJlZm9yZSB0aGUgZmlyc3QgcXVlcnkgcGFyYW1ldGVyLCB0aGVuIGFtcGVyc2FuZHMgKCYpXHJcbiAqIGJldHdlZW4gb3RoZXIgcXVlcnkgcGFyYW1ldGVycy4gIEhlcmUgaXMgYW4gZXhhbXBsZSBvZiBtdWx0aXBsZSBxdWVyeSBwYXJhbWV0ZXJzOlxyXG4gKiBodHRwczovL3BoZXQtZGV2LmNvbG9yYWRvLmVkdS9odG1sL3JlYWN0YW50cy1wcm9kdWN0cy1hbmQtbGVmdG92ZXJzLzEuMC4wLWRldi4xMy9yZWFjdGFudHMtcHJvZHVjdHMtYW5kLWxlZnRvdmVyc19lbi5odG1sP2RldiZzaG93UG9pbnRlckFyZWFzJndlYmdsPWZhbHNlXHJcbiAqXHJcbiAqIEZvciBtb3JlIG9uIHF1ZXJ5IHBhcmFtZXRlcnMgaW4gZ2VuZXJhbCwgc2VlIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUXVlcnlfc3RyaW5nXHJcbiAqIEZvciBkZXRhaWxzIG9uIGNvbW1vbi1jb2RlIHF1ZXJ5IHBhcmFtZXRlcnMsIHNlZSBRVUVSWV9QQVJBTUVURVJTX1NDSEVNQSBiZWxvdy5cclxuICogRm9yIHNpbS1zcGVjaWZpYyBxdWVyeSBwYXJhbWV0ZXJzIChpZiB0aGVyZSBhcmUgYW55KSwgc2VlICpRdWVyeVBhcmFtZXRlcnMuanMgaW4gdGhlIHNpbXVsYXRpb24ncyByZXBvc2l0b3J5LlxyXG4gKlxyXG4gKiBNYW55IG9mIHRoZXNlIHF1ZXJ5IHBhcmFtZXRlcnMnIGpzZG9jIGlzIHJlbmRlcmVkIGFuZCB2aXNpYmxlIHB1YmxpY2x5IHRvIFBoRVQtaU8gY2xpZW50LiBUaG9zZSBzZWN0aW9ucyBzaG91bGQgYmVcclxuICogbWFya2VkLCBzZWUgdG9wIGxldmVsIGNvbW1lbnQgaW4gQ2xpZW50LmpzIGFib3V0IHByaXZhdGUgdnMgcHVibGljIGRvY3VtZW50YXRpb25cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuKCBmdW5jdGlvbigpIHtcclxuXHJcblxyXG4gIGFzc2VydCAmJiBhc3NlcnQoIHdpbmRvdy5RdWVyeVN0cmluZ01hY2hpbmUsICdRdWVyeVN0cmluZ01hY2hpbmUgaXMgdXNlZCwgYW5kIHNob3VsZCBiZSBsb2FkZWQgYmVmb3JlIHRoaXMgY29kZSBydW5zJyApO1xyXG5cclxuICAvLyBwYWNrYWdlT2JqZWN0IG1heSBub3QgYWx3YXlzIGJlIGF2YWlsYWJsZSBpZiBpbml0aWFsaXplLWdsb2JhbHMgdXNlZCB3aXRob3V0IGNoaXBwZXItaW5pdGlhbGl6YXRpb24uanNcclxuICBjb25zdCBwYWNrYWdlT2JqZWN0ID0gXy5oYXNJbiggd2luZG93LCAncGhldC5jaGlwcGVyLnBhY2thZ2VPYmplY3QnICkgPyBwaGV0LmNoaXBwZXIucGFja2FnZU9iamVjdCA6IHt9O1xyXG4gIGNvbnN0IHBhY2thZ2VQaGV0ID0gcGFja2FnZU9iamVjdC5waGV0IHx8IHt9O1xyXG5cclxuICAvLyBkdWNrIHR5cGUgZGVmYXVsdHMgc28gdGhhdCBub3QgYWxsIHBhY2thZ2UuanNvbiBmaWxlcyBuZWVkIHRvIGhhdmUgYSBwaGV0LnNpbUZlYXR1cmVzIHNlY3Rpb24uXHJcbiAgY29uc3QgcGFja2FnZVNpbUZlYXR1cmVzID0gcGFja2FnZVBoZXQuc2ltRmVhdHVyZXMgfHwge307XHJcblxyXG4gIC8vIFRoZSBjb2xvciBwcm9maWxlIHVzZWQgYnkgZGVmYXVsdCwgaWYgbm8gY29sb3JQcm9maWxlcyBhcmUgc3BlY2lmaWVkIGluIHBhY2thZ2UuanNvbi5cclxuICAvLyBOT1RFOiBEdXBsaWNhdGVkIGluIFNjZW5lcnlDb25zdGFudHMuanMgc2luY2Ugc2NlbmVyeSBkb2VzIG5vdCBpbmNsdWRlIGluaXRpYWxpemUtZ2xvYmFscy5qc1xyXG4gIGNvbnN0IERFRkFVTFRfQ09MT1JfUFJPRklMRSA9ICdkZWZhdWx0JztcclxuXHJcbiAgLy8gVGhlIHBvc3NpYmxlIGNvbG9yIHByb2ZpbGVzIGZvciB0aGUgY3VycmVudCBzaW11bGF0aW9uLlxyXG4gIGNvbnN0IGNvbG9yUHJvZmlsZXMgPSBwYWNrYWdlU2ltRmVhdHVyZXMuY29sb3JQcm9maWxlcyB8fCBbIERFRkFVTFRfQ09MT1JfUFJPRklMRSBdO1xyXG5cclxuICAvLyBQcml2YXRlIERvYzogTm90ZTogdGhlIGZvbGxvd2luZyBqc2RvYyBpcyBmb3IgdGhlIHB1YmxpYyBmYWNpbmcgUGhFVC1pTyBBUEkuIEluIGFkZGl0aW9uLCBhbGwgcXVlcnkgcGFyYW1ldGVycyBpbiB0aGUgc2NoZW1hXHJcbiAgLy8gdGhhdCBhcmUgYSBcIm1lbWJlck9mXCIgdGhlIFwiUGhldFF1ZXJ5UGFyYW1ldGVyc1wiIG5hbWVzcGFjZSBhcmUgdXNlZCBpbiB0aGUganNkb2MgdGhhdCBpcyBwdWJsaWMgKGNsaWVudCBmYWNpbmcpXHJcbiAgLy8gcGhldC1pbyBkb2N1bWVudGF0aW9uLiBQcml2YXRlIGNvbW1lbnRzIGFib3V0IGltcGxlbWVudGF0aW9uIGRldGFpbHMgd2lsbCBiZSBpbiBjb21tZW50cyBhYm92ZSB0aGUganNkb2MsIGFuZFxyXG4gIC8vIG1hcmtlZCBhcyBzdWNoLlxyXG4gIC8vIE5vdGU6IHRoaXMgaGFkIHRvIGJlIGpzZG9jIGRpcmVjdGx5IGZvciBRVUVSWV9QQVJBTUVURVJTX1NDSEVNQSB0byBzdXBwb3J0IHRoZSBjb3JyZWN0IGF1dG8gZm9ybWF0dGluZy5cclxuXHJcbiAgLyoqXHJcbiAgICogUXVlcnkgcGFyYW1ldGVycyB0aGF0IG1hbmlwdWxhdGUgdGhlIHN0YXJ0dXAgc3RhdGUgb2YgdGhlIFBoRVQgc2ltdWxhdGlvbi4gVGhpcyBpcyBub3RcclxuICAgKiBhbiBvYmplY3QgZGVmaW5lZCBpbiB0aGUgZ2xvYmFsIHNjb3BlLCBidXQgcmF0aGVyIGl0IHNlcnZlcyBhcyBkb2N1bWVudGF0aW9uIGFib3V0IGF2YWlsYWJsZSBxdWVyeSBwYXJhbWV0ZXJzLlxyXG4gICAqIE5vdGU6IFRoZSBcImZsYWdcIiB0eXBlIGZvciBxdWVyeSBwYXJhbWV0ZXJzIGRvZXMgbm90IGV4cGVjdCBhIHZhbHVlIGZvciB0aGUga2V5LCBidXQgcmF0aGVyIGp1c3QgdGhlIHByZXNlbmNlIG9mXHJcbiAgICogdGhlIGtleSBpdHNlbGYuXHJcbiAgICogQG5hbWVzcGFjZSB7T2JqZWN0fSBQaGV0UXVlcnlQYXJhbWV0ZXJzXHJcbiAgICovXHJcbiAgY29uc3QgUVVFUllfUEFSQU1FVEVSU19TQ0hFTUEgPSB7XHJcbiAgICAvLyBTY2hlbWEgdGhhdCBkZXNjcmliZXMgcXVlcnkgcGFyYW1ldGVycyBmb3IgUGhFVCBjb21tb24gY29kZS5cclxuICAgIC8vIFRoZXNlIHF1ZXJ5IHBhcmFtZXRlcnMgYXJlIGF2YWlsYWJsZSB2aWEgZ2xvYmFsIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbiBlbnZpcm9ubWVudHMgd2hlcmUgdXNlcnMgc2hvdWxkIG5vdCBiZSBhYmxlIHRvIG5hdmlnYXRlIGh5cGVybGlua3MgYXdheSBmcm9tIHRoZSBzaW11bGF0aW9uLCBjbGllbnRzIGNhbiB1c2VcclxuICAgICAqID9hbGxvd0xpbmtzPWZhbHNlLiAgSW4gdGhpcyBjYXNlLCBsaW5rcyBhcmUgZGlzcGxheWVkIGFuZCBub3QgY2xpY2thYmxlLiBUaGlzIHF1ZXJ5IHBhcmFtZXRlciBpcyBwdWJsaWMgZmFjaW5nLlxyXG4gICAgICogQG1lbWJlck9mIFBoZXRRdWVyeVBhcmFtZXRlcnNcclxuICAgICAqIEB0eXBlIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBhbGxvd0xpbmtzOiB7XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgZGVmYXVsdFZhbHVlOiB0cnVlLFxyXG4gICAgICBwdWJsaWM6IHRydWVcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBbGxvd3Mgc2V0dGluZyBvZiB0aGUgc291bmQgc3RhdGUsIHBvc3NpYmxlIHZhbHVlcyBhcmUgJ2VuYWJsZWQnIChkZWZhdWx0KSwgJ211dGVkJywgYW5kICdkaXNhYmxlZCcuICBTb3VuZFxyXG4gICAgICogbXVzdCBiZSBzdXBwb3J0ZWQgYnkgdGhlIHNpbSBmb3IgdGhpcyB0byBoYXZlIGFueSBlZmZlY3QuXHJcbiAgICAgKiBAbWVtYmVyT2YgUGhldFF1ZXJ5UGFyYW1ldGVyc1xyXG4gICAgICogQHR5cGUge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgYXVkaW86IHtcclxuICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgIGRlZmF1bHRWYWx1ZTogJ2VuYWJsZWQnLFxyXG4gICAgICB2YWxpZFZhbHVlczogWyAnZW5hYmxlZCcsICdkaXNhYmxlZCcsICdtdXRlZCcgXSxcclxuICAgICAgcHVibGljOiB0cnVlXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGVzIG9iamVjdCByZXBvcnRzIHRoYXQgY2FuIGJlIHVzZWQgYnkgYmluZGVyLiBGb3IgaW50ZXJuYWwgdXNlLlxyXG4gICAgICogU2VlIEluc3RhbmNlUmVnaXN0cnkuanMgYW5kIGJpbmRlciByZXBvIChzcGVjaWZpY2FsbHkgZ2V0RnJvbVNpbUluTWFzdGVyLmpzKSBzZm9yIG1vcmUgZGV0YWlscy5cclxuICAgICAqL1xyXG4gICAgYmluZGVyOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc3BlY2lmaWVzIHRoZSBicmFuZCB0aGF0IHNob3VsZCBiZSB1c2VkIGluIHVuYnVpbHQgbW9kZVxyXG4gICAgICovXHJcbiAgICBicmFuZDoge1xyXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgZGVmYXVsdFZhbHVlOiAnYWRhcHRlZC1mcm9tLXBoZXQnXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hlbiBwcmVzZW50LCB3aWxsIHRyaWdnZXIgY2hhbmdlcyB0aGF0IGFyZSBtb3JlIHNpbWlsYXIgdG8gdGhlIGJ1aWxkIGVudmlyb25tZW50LlxyXG4gICAgICogUmlnaHQgbm93LCB0aGlzIGluY2x1ZGVzIGNvbXB1dGluZyBoaWdoZXItcmVzb2x1dGlvbiBtaXBtYXBzIGZvciB0aGUgbWlwbWFwIHBsdWdpbi5cclxuICAgICAqL1xyXG4gICAgYnVpbGRDb21wYXRpYmxlOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hlbiBwcm92aWRlZCBhIG5vbi16ZXJvLWxlbmd0aCB2YWx1ZSwgdGhlIHNpbSB3aWxsIHNlbmQgb3V0IGFzc29ydGVkIGV2ZW50cyBtZWFudCBmb3IgY29udGludXMgdGVzdGluZ1xyXG4gICAgICogaW50ZWdyYXRpb24gKHNlZSBzaW0tdGVzdC5qcykuXHJcbiAgICAgKi9cclxuICAgIGNvbnRpbnVvdXNUZXN0OiB7XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6ICcnXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFByaXZhdGUgRG9jOiAgRm9yIGV4dGVybmFsIHVzZS4gVGhlIGJlbG93IGpzZG9jIGlzIHB1YmxpYyB0byB0aGUgUGhFVC1pTyBBUEkgZG9jdW1lbnRhdGlvbi4gQ2hhbmdlIHdpc2VseS5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGNvbG9yIHByb2ZpbGUgdXNlZCBhdCBzdGFydHVwLCByZWxldmFudCBvbmx5IGZvciBzaW1zIHRoYXQgc3VwcG9ydCBtdWx0aXBsZSBjb2xvciBwcm9maWxlcy4gJ2RlZmF1bHQnIGFuZFxyXG4gICAgICogJ3Byb2plY3RvcicgYXJlIGltcGxlbWVudGVkIGluIHNldmVyYWwgc2ltcywgb3RoZXIgcHJvZmlsZSBuYW1lcyBhcmUgbm90IGN1cnJlbnRseSBzdGFuZGFyZGl6ZWQuXHJcbiAgICAgKiBAbWVtYmVyT2YgUGhldFF1ZXJ5UGFyYW1ldGVyc1xyXG4gICAgICogQHR5cGUge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgY29sb3JQcm9maWxlOiB7XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IGNvbG9yUHJvZmlsZXNbIDAgXSwgLy8gdXN1YWxseSBcImRlZmF1bHRcIiwgYnV0IHNvbWUgc2ltcyBsaWtlIG1hc3Nlcy1hbmQtc3ByaW5ncy1iYXNpY3MgZG8gbm90IHVzZSBkZWZhdWx0IGF0IGFsbFxyXG4gICAgICB2YWxpZFZhbHVlczogY29sb3JQcm9maWxlcyxcclxuICAgICAgcHVibGljOiB0cnVlXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlcyBkZWJ1Z2dlciBjb21tYW5kcyBpbiBjZXJ0YWluIGNhc2VzIGxpa2UgdGhyb3duIGVycm9ycyBhbmQgZmFpbGVkIHRlc3RzLlxyXG4gICAgICovXHJcbiAgICBkZWJ1Z2dlcjogeyB0eXBlOiAnZmxhZycgfSxcclxuXHJcbiAgICAvLyBPdXRwdXQgZGVwcmVjYXRpb24gd2FybmluZ3MgdmlhIGNvbnNvbGUud2Fybiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy84ODIuIEZvciBpbnRlcm5hbFxyXG4gICAgLy8gdXNlIG9ubHkuXHJcbiAgICBkZXByZWNhdGlvbldhcm5pbmdzOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlcyBkZXZlbG9wZXItb25seSBmZWF0dXJlcywgc3VjaCBhcyBzaG93aW5nIHRoZSBsYXlvdXQgYm91bmRzXHJcbiAgICAgKi9cclxuICAgIGRldjogeyB0eXBlOiAnZmxhZycgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuYWJsZXMgYXNzZXJ0aW9uc1xyXG4gICAgICovXHJcbiAgICBlYTogeyB0eXBlOiAnZmxhZycgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEVuYWJsZXMgYWxsIGFzc2VydGlvbnMsIGFzIGFib3ZlIGJ1dCB3aXRoIG1vcmUgdGltZS1jb25zdW1pbmcgY2hlY2tzXHJcbiAgICAgKi9cclxuICAgIGVhbGw6IHsgdHlwZTogJ2ZsYWcnIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb250cm9scyB3aGV0aGVyIGV4dHJhIHNvdW5kIGlzIG9uIG9yIG9mZiBhdCBzdGFydHVwICh1c2VyIGNhbiBjaGFuZ2UgbGF0ZXIpLiAgVGhpcyBxdWVyeSBwYXJhbWV0ZXIgaXMgcHVibGljXHJcbiAgICAgKiBmYWNpbmcuXHJcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZXh0cmFTb3VuZEluaXRpYWxseUVuYWJsZWQ6IHtcclxuICAgICAgdHlwZTogJ2ZsYWcnLFxyXG4gICAgICBwdWJsaWM6IHRydWVcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSYW5kb21seSBzZW5kcyBtb3VzZSBldmVudHMgYW5kIHRvdWNoIGV2ZW50cyB0byBzaW0uXHJcbiAgICAgKi9cclxuICAgIGZ1eno6IHsgdHlwZTogJ2ZsYWcnIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSYW5kb21seSBzZW5kcyBrZXlib2FyZCBldmVudHMgdG8gdGhlIHNpbS4gTXVzdCBoYXZlIGFjY2Vzc2liaWxpdHkgZW5hYmxlZC5cclxuICAgICAqL1xyXG4gICAgZnV6ekJvYXJkOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmFuZG9tbHkgc2VuZHMgbW91c2UgZXZlbnRzIHRvIHNpbS5cclxuICAgICAqL1xyXG4gICAgZnV6ek1vdXNlOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIG1heGltdW0gbnVtYmVyIG9mIGNvbmN1cnJlbnQgcG9pbnRlcnMgYWxsb3dlZCBmb3IgZnV6emluZy4gVXNpbmcgYSB2YWx1ZSBsYXJnZXIgdGhhbiAxIHdpbGwgdGVzdCBtdWx0aXRvdWNoXHJcbiAgICAgKiBiZWhhdmlvciAod2l0aCA/ZnV6eiwgP2Z1enpNb3VzZSwgP2Z1enpUb3VjaCwgZXRjLilcclxuICAgICAqL1xyXG4gICAgZnV6elBvaW50ZXJzOiB7XHJcbiAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IDFcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSYW5kb21seSBzZW5kcyB0b3VjaCBldmVudHMgdG8gc2ltLlxyXG4gICAgICovXHJcbiAgICBmdXp6VG91Y2g6IHsgdHlwZTogJ2ZsYWcnIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBpZiBmdXp6TW91c2U9dHJ1ZSBvciBmdXp6VG91Y2g9dHJ1ZSwgdGhpcyBpcyB0aGUgYXZlcmFnZSBudW1iZXIgb2YgbW91c2UvdG91Y2ggZXZlbnRzIHRvIHN5bnRoZXNpemUgcGVyIGZyYW1lLlxyXG4gICAgICovXHJcbiAgICBmdXp6UmF0ZToge1xyXG4gICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgZGVmYXVsdFZhbHVlOiAxMDAsXHJcbiAgICAgIGlzVmFsaWRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlICkgeyByZXR1cm4gdmFsdWUgPiAwOyB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBmb3IgcHJvdmlkaW5nIGFuIGV4dGVybmFsIEdvb2dsZSBBbmFseXRpY3MgKHVzaW5nIHRoZSBzb29uLXRvLWJlLXN1bnNldCBVQS9Vbml2ZXJzaWFsIEFuYWx5dGljcykgcHJvcGVydHlcclxuICAgICAqIGZvciB0cmFja2luZywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0Y29tbW9uL2lzc3Vlcy80NiBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBHZW5lcmFsbHksIHRoaXMgc3RyaW5nIHdpbGwgc3RhcnQgd2l0aCAnVUEtJyAob3RoZXJ3aXNlIHVzZSA/Z2E0KVxyXG4gICAgICpcclxuICAgICAqIFRoaXMgaXMgdXNlZnVsIGZvciB2YXJpb3VzIHVzZXJzL2NsaWVudHMgdGhhdCB3YW50IHRvIGVtYmVkIHNpbXVsYXRpb25zLCBvciBkaXJlY3QgdXNlcnMgdG8gc2ltdWxhdGlvbnMuIEZvclxyXG4gICAgICogZXhhbXBsZSwgaWYgYSBzaW0gaXMgaW5jbHVkZWQgaW4gYW4gZXB1YiwgdGhlIHNpbSBIVE1MIHdvbid0IGhhdmUgdG8gYmUgbW9kaWZpZWQgdG8gaW5jbHVkZSBwYWdlIHRyYWNraW5nLlxyXG4gICAgICovXHJcbiAgICBnYToge1xyXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgZGVmYXVsdFZhbHVlOiBudWxsXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBmb3IgcHJvdmlkaW5nIGFuIGV4dGVybmFsIEdvb2dsZSBBbmFseXRpY3MgNCAoZ3RhZy5qcykgcHJvcGVydHkgZm9yIHRyYWNraW5nLCBzZWVcclxuICAgICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0Y29tbW9uL2lzc3Vlcy80NiBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBHZW5lcmFsbHksIHRoaXMgc3RyaW5nIHdpbGwgc3RhcnQgd2l0aCAnRy0nIGZvciBHQTQgdHJhY2tlcnNcclxuICAgICAqXHJcbiAgICAgKiBUaGlzIGlzIHVzZWZ1bCBmb3IgdmFyaW91cyB1c2Vycy9jbGllbnRzIHRoYXQgd2FudCB0byBlbWJlZCBzaW11bGF0aW9ucywgb3IgZGlyZWN0IHVzZXJzIHRvIHNpbXVsYXRpb25zLiBGb3JcclxuICAgICAqIGV4YW1wbGUsIGlmIGEgc2ltIGlzIGluY2x1ZGVkIGluIGFuIGVwdWIsIHRoZSBzaW0gSFRNTCB3b24ndCBoYXZlIHRvIGJlIG1vZGlmaWVkIHRvIGluY2x1ZGUgcGFnZSB0cmFja2luZy5cclxuICAgICAqL1xyXG4gICAgZ2E0OiB7XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IG51bGxcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBMYXVuY2hlcyB0aGUgZ2FtZS11cC1jYW1lcmEgY29kZSB3aGljaCBkZWxpdmVycyBpbWFnZXMgdG8gcmVxdWVzdHMgaW4gQnJhaW5QT1AvR2FtZSBVcC9TbmFwVGhvdWdodFxyXG4gICAgICovXHJcbiAgICBnYW1lVXA6IHsgdHlwZTogJ2ZsYWcnIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFbmFibGVzIHRoZSBnYW1lLXVwLWNhbWVyYSBjb2RlIHRvIHJlc3BvbmQgdG8gbWVzc2FnZXMgZnJvbSBhbnkgb3JpZ2luXHJcbiAgICAgKi9cclxuICAgIGdhbWVVcFRlc3RIYXJuZXNzOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRW5hYmxlcyBsb2dnaW5nIGZvciBnYW1lLXVwLWNhbWVyYSwgc2VlIGdhbWVVcFxyXG4gICAgICovXHJcbiAgICBnYW1lVXBMb2dnaW5nOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBmb3IgcHJvdmlkaW5nIGEgR29vZ2xlIEFuYWx5dGljcyBwYWdlIElEIGZvciB0cmFja2luZywgc2VlXHJcbiAgICAgKiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldGNvbW1vbi9pc3N1ZXMvNDYgZm9yIG1vcmUgaW5mb3JtYXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogVGhpcyBpcyBnaXZlbiBhcyB0aGUgM3JkIHBhcmFtZXRlciB0byBhIHBhZ2V2aWV3IHNlbmQgd2hlbiBwcm92aWRlZFxyXG4gICAgICovXHJcbiAgICBnYVBhZ2U6IHtcclxuICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgIGRlZmF1bHRWYWx1ZTogbnVsbFxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBQcml2YXRlIERvYzogIEZvciBleHRlcm5hbCB1c2UuIFRoZSBiZWxvdyBqc2RvYyBpcyBwdWJsaWMgdG8gdGhlIFBoRVQtaU8gQVBJIGRvY3VtZW50YXRpb24uIENoYW5nZSB3aXNlbHkuXHJcbiAgICAvKipcclxuICAgICAqIEluZGljYXRlcyB3aGV0aGVyIHRvIGRpc3BsYXkgdGhlIGhvbWUgc2NyZWVuLlxyXG4gICAgICogRm9yIG11bHRpLXNjcmVlbiBzaW1zIG9ubHksIHRocm93cyBhbiBhc3NlcnRpb24gZXJyb3IgaWYgc3VwcGxpZWQgZm9yIGEgc2luZ2xlLXNjcmVlbiBzaW0uXHJcbiAgICAgKiBAbWVtYmVyT2YgUGhldFF1ZXJ5UGFyYW1ldGVyc1xyXG4gICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGhvbWVTY3JlZW46IHtcclxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IHRydWUsXHJcbiAgICAgIHB1YmxpYzogdHJ1ZVxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBQcml2YXRlIERvYzogRm9yIGV4dGVybmFsIHVzZS4gVGhlIGJlbG93IGpzZG9jIGlzIHB1YmxpYyB0byB0aGUgUGhFVC1pTyBBUEkgZG9jdW1lbnRhdGlvbi4gQ2hhbmdlIHdpc2VseS5cclxuICAgIC8vIFRoZSB2YWx1ZSBpcyBvbmUgb2YgdGhlIHZhbHVlcyBpbiB0aGUgc2NyZWVucyBhcnJheSwgbm90IGFuIGluZGV4IGludG8gdGhlIHNjcmVlbnMgYXJyYXkuXHJcbiAgICAvKipcclxuICAgICAqIFNwZWNpZmllcyB0aGUgaW5pdGlhbCBzY3JlZW4gdGhhdCB3aWxsIGJlIHZpc2libGUgd2hlbiB0aGUgc2ltIHN0YXJ0cy5cclxuICAgICAqIFNlZSBgP3NjcmVlbnNgIHF1ZXJ5IHBhcmFtZXRlciBmb3Igc2NyZWVuIG51bWJlcmluZy5cclxuICAgICAqIEZvciBtdWx0aS1zY3JlZW4gc2ltcyBvbmx5LCB0aHJvd3MgYW4gYXNzZXJ0aW9uIGVycm9yIGlmIGFwcGxpZWQgaW4gYSBzaW5nbGUtc2NyZWVuIHNpbXMuXHJcbiAgICAgKiBUaGUgZGVmYXVsdCB2YWx1ZSBvZiAwIGlzIHRoZSBob21lIHNjcmVlbi5cclxuICAgICAqIEBtZW1iZXJPZiBQaGV0UXVlcnlQYXJhbWV0ZXJzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBpbml0aWFsU2NyZWVuOiB7XHJcbiAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IDAsIC8vIHRoZSBob21lIHNjcmVlblxyXG4gICAgICBwdWJsaWM6IHRydWVcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFbmFibGVzIHN1cHBvcnQgZm9yIExlZ2VuZHMgb2YgTGVhcm5pbmcgcGxhdGZvcm0sIGluY2x1ZGluZyBicm9hZGNhc3RpbmcgJ2luaXQnIGFuZCByZXNwb25kaW5nIHRvIHBhdXNlL3Jlc3VtZS5cclxuICAgICAqL1xyXG4gICAgbGVnZW5kc09mTGVhcm5pbmc6IHsgdHlwZTogJ2ZsYWcnIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiB0aGlzIGlzIGEgZmluaXRlIG51bWJlciBBTkQgYXNzZXJ0aW9ucyBhcmUgZW5hYmxlZCwgaXQgd2lsbCB0cmFjayBtYXhpbXVtIChUaW55RW1pdHRlcikgbGlzdGVuZXIgY291bnRzLCBhbmRcclxuICAgICAqIHdpbGwgYXNzZXJ0IHRoYXQgdGhlIGNvdW50IGlzIG5vdCBncmVhdGVyIHRoYW4gdGhlIGxpbWl0LlxyXG4gICAgICovXHJcbiAgICBsaXN0ZW5lckxpbWl0OiB7XHJcbiAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSxcclxuICAgICAgcHVibGljOiBmYWxzZVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNlbGVjdCB0aGUgbGFuZ3VhZ2Ugb2YgdGhlIHNpbSB0byB0aGUgc3BlY2lmaWMgbG9jYWxlLiBEZWZhdWx0IHRvIFwiZW5cIi5cclxuICAgICAqIEBtZW1iZXJPZiBQaGV0UXVlcnlQYXJhbWV0ZXJzXHJcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBsb2NhbGU6IHtcclxuICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgIGRlZmF1bHRWYWx1ZTogJ2VuJ1xyXG4gICAgICAvLyBEbyBOT1QgYWRkIHRoZSBgcHVibGljYCBrZXkgaGVyZS4gV2Ugd2FudCBpbnZhbGlkIHZhbHVlcyB0byBmYWxsIGJhY2sgdG8gZW4uXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHJvdmlkZXMgdGhlIGxvY2FsZXMgdG8gbG9hZCBkdXJpbmcgc3RhcnR1cCBmb3IgYW4gdW4tYnVpbHQgc2ltdWxhdGlvbiAod2lsbCBhdXRvbWF0aWNhbGx5IGxvYWQgdGhlID9sb2NhbGUsIG9yXHJcbiAgICAgKiBFbmdsaXNoIGlmIHByb3ZpZGVkKS5cclxuICAgICAqXHJcbiAgICAgKiBJZiB0aGUgb25seSBwcm92aWRlZCB2YWx1ZSBpcyAnKicsIHRoZW4gaXQgd2lsbCBsb2FkIGFsbCB0aGUgbG9jYWxlcy5cclxuICAgICAqL1xyXG4gICAgbG9jYWxlczoge1xyXG4gICAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgICBlbGVtZW50U2NoZW1hOiB7XHJcbiAgICAgICAgdHlwZTogJ3N0cmluZydcclxuICAgICAgfSxcclxuICAgICAgZGVmYXVsdFZhbHVlOiBbXVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEVuYWJsZXMgYmFzaWMgbG9nZ2luZyB0byB0aGUgY29uc29sZS5cclxuICAgICAqIFVzYWdlIGluIGNvZGU6IHBoZXQubG9nICYmIHBoZXQubG9nKCAneW91ciBtZXNzYWdlJyApO1xyXG4gICAgICovXHJcbiAgICBsb2c6IHsgdHlwZTogJ2ZsYWcnIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIGEgbWF4aW11bSBcIm1lbW9yeVwiIGxpbWl0IChpbiBNQikuIElmIHRoZSBzaW11bGF0aW9uJ3MgcnVubmluZyBhdmVyYWdlIG9mIG1lbW9yeSB1c2FnZSBnb2VzIG92ZXIgdGhpcyBhbW91bnRcclxuICAgICAqIGluIG9wZXJhdGlvbiAoYXMgZGV0ZXJtaW5lZCBjdXJyZW50bHkgYnkgdXNpbmcgQ2hvbWUncyB3aW5kb3cucGVyZm9ybWFuY2UpLCB0aGVuIGFuIGVycm9yIHdpbGwgYmUgdGhyb3duLlxyXG4gICAgICpcclxuICAgICAqIFRoaXMgaXMgdXNlZnVsIGZvciBjb250aW51b3VzIHRlc3RpbmcsIHRvIGVuc3VyZSB3ZSBhcmVuJ3QgbGVha2luZyBodWdlIGFtb3VudHMgb2YgbWVtb3J5LCBhbmQgY2FuIGFsc28gYmUgdXNlZFxyXG4gICAgICogd2l0aCB0aGUgQ2hyb21lIGNvbW1hbmQtbGluZSBmbGFnIC0tZW5hYmxlLXByZWNpc2UtbWVtb3J5LWluZm8gdG8gbWFrZSB0aGUgZGV0ZXJtaW5hdGlvbiBtb3JlIGFjY3VyYXRlLlxyXG4gICAgICpcclxuICAgICAqIFRoZSB2YWx1ZSAwIHdpbGwgYmUgaWdub3JlZCwgc2luY2Ugb3VyIHNpbXMgYXJlIGxpa2VseSB0byB1c2UgbW9yZSB0aGFuIHRoYXQgbXVjaCBtZW1vcnkuXHJcbiAgICAgKi9cclxuICAgIG1lbW9yeUxpbWl0OiB7XHJcbiAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IDBcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFbmFibGVzIHRyYW5zZm9ybWluZyB0aGUgUERPTSBmb3IgYWNjZXNzaWJpbGl0eSBvbiBtb2JpbGUgZGV2aWNlcy4gVGhpcyB3b3JrIGlzIGV4cGVyaW1lbnRhbCwgYW5kIHN0aWxsIGhpZGRlblxyXG4gICAgICogaW4gYSBzY2VuZXJ5IGJyYW5jaCBwZG9tLXRyYW5zZm9ybS4gTXVzdCBiZSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggdGhlIGFjY2Vzc2liaWxpdHkgcXVlcnkgcGFyYW1ldGVyLCBvclxyXG4gICAgICogb24gYSBzaW0gdGhhdCBoYXMgYWNjZXNzaWJpbGl0eSBlbmFibGVkIGJ5IGRlZmF1bHQuIFRoaXMgcXVlcnkgcGFyYW1ldGVyIGlzIG5vdCBpbnRlbmRlZCB0byBiZSBsb25nIGxpdmVkLFxyXG4gICAgICogaW4gdGhlIGZ1dHVyZSB0aGVzZSBmZWF0dXJlcyBzaG91bGQgYmUgYWx3YXlzIGVuYWJsZWQgaW4gdGhlIHNjZW5lcnkgYTExeSBmcmFtZXdvcmsuXHJcbiAgICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg1MlxyXG4gICAgICpcclxuICAgICAqIEZvciBpbnRlcm5hbCB1c2UgYW5kIHRlc3Rpbmcgb25seSwgdGhvdWdoIGxpbmtzIHdpdGggdGhpcyBtYXkgYmUgc2hhcmVkIHdpdGggY29sbGFib3JhdG9ycy5cclxuICAgICAqXHJcbiAgICAgKiBAYTExeVxyXG4gICAgICovXHJcbiAgICBtb2JpbGVBMTF5VGVzdDogeyB0eXBlOiAnZmxhZycgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIElmIHRoaXMgaXMgYSBmaW5pdGUgbnVtYmVyIEFORCBhc3NlcnRpb25zIGFyZSBlbmFibGVkLCBpdCB3aWxsIHRyYWNrIG1heGltdW0gTm9kZSBwYXJlbnQgY291bnRzLCBhbmRcclxuICAgICAqIHdpbGwgYXNzZXJ0IHRoYXQgdGhlIGNvdW50IGlzIG5vdCBncmVhdGVyIHRoYW4gdGhlIGxpbWl0LlxyXG4gICAgICovXHJcbiAgICBwYXJlbnRMaW1pdDoge1xyXG4gICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgZGVmYXVsdFZhbHVlOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXHJcbiAgICAgIHB1YmxpYzogZmFsc2VcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGVuIGEgc2ltdWxhdGlvbiBpcyBydW4gZnJvbSB0aGUgUGhFVCBBbmRyb2lkIGFwcCwgaXQgc2hvdWxkIHNldCB0aGlzIGZsYWcuIEl0IGFsdGVycyBzdGF0aXN0aWNzIHRoYXQgdGhlIHNpbSBzZW5kc1xyXG4gICAgICogdG8gR29vZ2xlIEFuYWx5dGljcyBhbmQgcG90ZW50aWFsbHkgb3RoZXIgc291cmNlcyBpbiB0aGUgZnV0dXJlLlxyXG4gICAgICpcclxuICAgICAqIEFsc28gcmVtb3ZlcyB0aGUgZm9sbG93aW5nIGl0ZW1zIGZyb20gdGhlIFwiUGhFVCBNZW51XCI6XHJcbiAgICAgKiBSZXBvcnQgYSBQcm9ibGVtXHJcbiAgICAgKiBDaGVjayBmb3IgVXBkYXRlc1xyXG4gICAgICogU2NyZWVuc2hvdFxyXG4gICAgICogRnVsbCBTY3JlZW5cclxuICAgICAqL1xyXG4gICAgJ3BoZXQtYW5kcm9pZC1hcHAnOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hlbiBhIHNpbXVsYXRpb24gaXMgcnVuIGZyb20gdGhlIFBoRVQgaU9TIGFwcCwgaXQgc2hvdWxkIHNldCB0aGlzIGZsYWcuIEl0IGFsdGVycyBzdGF0aXN0aWNzIHRoYXQgdGhlIHNpbSBzZW5kc1xyXG4gICAgICogdG8gR29vZ2xlIEFuYWx5dGljcyBhbmQgcG90ZW50aWFsbHkgb3RoZXIgc291cmNlcyBpbiB0aGUgZnV0dXJlLlxyXG4gICAgICpcclxuICAgICAqIEFsc28gcmVtb3ZlcyB0aGUgZm9sbG93aW5nIGl0ZW1zIGZyb20gdGhlIFwiUGhFVCBNZW51XCI6XHJcbiAgICAgKiBSZXBvcnQgYSBQcm9ibGVtXHJcbiAgICAgKiBDaGVjayBmb3IgVXBkYXRlc1xyXG4gICAgICogU2NyZWVuc2hvdFxyXG4gICAgICogRnVsbCBTY3JlZW5cclxuICAgICAqL1xyXG4gICAgJ3BoZXQtYXBwJzogeyB0eXBlOiAnZmxhZycgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIElmIHRydWUsIHB1dHMgdGhlIHNpbXVsYXRpb24gaW4gYSBzcGVjaWFsIG1vZGUgd2hlcmUgaXQgd2lsbCB3YWl0IGZvciBtYW51YWwgY29udHJvbCBvZiB0aGUgc2ltIHBsYXliYWNrLlxyXG4gICAgICovXHJcbiAgICBwbGF5YmFja01vZGU6IHtcclxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IGZhbHNlXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlyZXMgYSBwb3N0LW1lc3NhZ2Ugd2hlbiB0aGUgc2ltIGlzIGFib3V0IHRvIGNoYW5nZSB0byBhbm90aGVyIFVSTFxyXG4gICAgICovXHJcbiAgICBwb3N0TWVzc2FnZU9uQmVmb3JlVW5sb2FkOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGFzc2VzIGVycm9ycyB0byB0ZXN0LXNpbXNcclxuICAgICAqL1xyXG4gICAgcG9zdE1lc3NhZ2VPbkVycm9yOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdHJpZ2dlcnMgYSBwb3N0LW1lc3NhZ2UgdGhhdCBmaXJlcyB3aGVuIHRoZSBzaW0gZmluaXNoZXMgbG9hZGluZywgY3VycmVudGx5IHVzZWQgYnkgYXF1YSB0ZXN0LXNpbXNcclxuICAgICAqL1xyXG4gICAgcG9zdE1lc3NhZ2VPbkxvYWQ6IHsgdHlwZTogJ2ZsYWcnIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0cmlnZ2VycyBhIHBvc3QtbWVzc2FnZSB0aGF0IGZpcmVzIHdoZW4gdGhlIHNpbXVsYXRpb24gaXMgcmVhZHkgdG8gc3RhcnQuXHJcbiAgICAgKi9cclxuICAgIHBvc3RNZXNzYWdlT25SZWFkeTogeyB0eXBlOiAnZmxhZycgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnRyb2xzIHdoZXRoZXIgdGhlIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjp0cnVlIGlzIHNldCBvbiBXZWJHTCBDYW52YXNlcy4gVGhpcyBhbGxvd3MgY2FudmFzLnRvRGF0YVVSTCgpIHRvIHdvcmtcclxuICAgICAqICh1c2VkIGZvciBjZXJ0YWluIG1ldGhvZHMgdGhhdCByZXF1aXJlIHNjcmVlbnNob3QgZ2VuZXJhdGlvbiB1c2luZyBmb3JlaWduIG9iamVjdCByYXN0ZXJpemF0aW9uLCBldGMuKS5cclxuICAgICAqIEdlbmVyYWxseSByZWR1Y2VzIFdlYkdMIHBlcmZvcm1hbmNlLCBzbyBpdCBzaG91bGQgbm90IGFsd2F5cyBiZSBvbiAodGh1cyB0aGUgcXVlcnkgcGFyYW1ldGVyKS5cclxuICAgICAqL1xyXG4gICAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSWYgdHJ1ZSwgdGhlIGZ1bGwgc2NyZWVuIGJ1dHRvbiB3b24ndCBiZSBzaG93biBpbiB0aGUgcGhldCBtZW51XHJcbiAgICAgKi9cclxuICAgIHByZXZlbnRGdWxsU2NyZWVuOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2hvd3MgcHJvZmlsaW5nIGluZm9ybWF0aW9uIGZvciB0aGUgc2ltXHJcbiAgICAgKi9cclxuICAgIHByb2ZpbGVyOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkcyBhIG1lbnUgaXRlbSB0aGF0IHdpbGwgb3BlbiBhIHdpbmRvdyB3aXRoIGEgUVIgY29kZSB3aXRoIHRoZSBVUkwgb2YgdGhlIHNpbXVsYXRpb25cclxuICAgICAqL1xyXG4gICAgcXJDb2RlOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmFuZG9tIHNlZWQgaW4gdGhlIHByZWxvYWQgY29kZSB0aGF0IGNhbiBiZSB1c2VkIHRvIG1ha2Ugc3VyZSBwbGF5YmFjayBzaW11bGF0aW9ucyB1c2UgdGhlIHNhbWUgc2VlZCAoYW5kIHRodXNcclxuICAgICAqIHRoZSBzaW11bGF0aW9uIHN0YXRlLCBnaXZlbiB0aGUgaW5wdXQgZXZlbnRzIGFuZCBmcmFtZXMsIGNhbiBiZSBleGFjdGx5IHJlcHJvZHVjZWQpXHJcbiAgICAgKiBTZWUgUmFuZG9tLmpzXHJcbiAgICAgKi9cclxuICAgIHJhbmRvbVNlZWQ6IHtcclxuICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgIGRlZmF1bHRWYWx1ZTogTWF0aC5yYW5kb20oKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhZC1zaW0tdGV4dFxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNwZWNpZnkgYSByZW5kZXJlciBmb3IgdGhlIFNpbSdzIHJvb3ROb2RlIHRvIHVzZS5cclxuICAgICAqL1xyXG4gICAgcm9vdFJlbmRlcmVyOiB7XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IG51bGwsXHJcbiAgICAgIHZhbGlkVmFsdWVzOiBbIG51bGwsICdjYW52YXMnLCAnc3ZnJywgJ2RvbScsICd3ZWJnbCcgXSAvLyBzZWUgTm9kZS5zZXRSZW5kZXJlclxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFycmF5IG9mIG9uZSBvciBtb3JlIGxvZ3MgdG8gZW5hYmxlIGluIHNjZW5lcnkgMC4yKywgZGVsaW1pdGVkIHdpdGggY29tbWFzLlxyXG4gICAgICogRm9yIGV4YW1wbGU6ID9zY2VuZXJ5TG9nPURpc3BsYXksRHJhd2FibGUsV2ViR0xCbG9jayByZXN1bHRzIGluIFsgJ0Rpc3BsYXknLCAnRHJhd2FibGUnLCAnV2ViR0xCbG9jaycgXVxyXG4gICAgICogRG9uJ3QgY2hhbmdlIHRoaXMgd2l0aG91dCB1cGRhdGluZyB0aGUgc2lnbmF0dXJlIGluIHNjZW5lcnkgdW5pdCB0ZXN0cyB0b28uXHJcbiAgICAgKlxyXG4gICAgICogVGhlIGVudGlyZSBzdXBwb3J0ZWQgbGlzdCBpcyBpbiBzY2VuZXJ5LmpzIGluIHRoZSBsb2dQcm9wZXJ0aWVzIG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgc2NlbmVyeUxvZzoge1xyXG4gICAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgICBlbGVtZW50U2NoZW1hOiB7XHJcbiAgICAgICAgdHlwZTogJ3N0cmluZydcclxuICAgICAgfSxcclxuICAgICAgZGVmYXVsdFZhbHVlOiBudWxsXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2NlbmVyeSBsb2dzIHdpbGwgYmUgb3V0cHV0IHRvIGEgc3RyaW5nIGluc3RlYWQgb2YgdGhlIHdpbmRvd1xyXG4gICAgICovXHJcbiAgICBzY2VuZXJ5U3RyaW5nTG9nOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3BlY2lmaWVzIHRoZSBzZXQgb2Ygc2NyZWVucyB0aGF0IGFwcGVhciBpbiB0aGUgc2ltLCBhbmQgdGhlaXIgb3JkZXIuXHJcbiAgICAgKiBVc2VzIDEtYmFzZWQgKG5vdCB6ZXJvLWJhc2VkKSBhbmQgXCIsXCIgZGVsaW1pdGVkIHN0cmluZyBzdWNoIGFzIFwiMSwzLDRcIiB0byBnZXQgdGhlIDFzdCwgM3JkIGFuZCA0dGggc2NyZWVuLlxyXG4gICAgICogQHR5cGUge0FycmF5LjxudW1iZXI+fVxyXG4gICAgICovXHJcbiAgICBzY3JlZW5zOiB7XHJcbiAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgIGVsZW1lbnRTY2hlbWE6IHtcclxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgICBpc1ZhbGlkVmFsdWU6IE51bWJlci5pc0ludGVnZXJcclxuICAgICAgfSxcclxuICAgICAgZGVmYXVsdFZhbHVlOiBudWxsLFxyXG4gICAgICBpc1ZhbGlkVmFsdWU6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcclxuXHJcbiAgICAgICAgLy8gc2NyZWVuIGluZGljZXMgY2Fubm90IGJlIGR1cGxpY2F0ZWRcclxuICAgICAgICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgKCB2YWx1ZS5sZW5ndGggPT09IF8udW5pcSggdmFsdWUgKS5sZW5ndGggJiYgdmFsdWUubGVuZ3RoID4gMCApO1xyXG4gICAgICB9LFxyXG4gICAgICBwdWJsaWM6IHRydWVcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUeXBpY2FsbHkgdXNlZCB0byBzaG93IGFuc3dlcnMgKG9yIGhpZGRlbiBjb250cm9scyB0aGF0IHNob3cgYW5zd2VycykgdG8gY2hhbGxlbmdlcyBpbiBzaW0gZ2FtZXMuXHJcbiAgICAgKiBGb3IgaW50ZXJuYWwgdXNlIGJ5IFBoRVQgdGVhbSBtZW1iZXJzIG9ubHkuXHJcbiAgICAgKi9cclxuICAgIHNob3dBbnN3ZXJzOiB7XHJcbiAgICAgIHR5cGU6ICdmbGFnJyxcclxuICAgICAgcHJpdmF0ZTogdHJ1ZVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIERpc3BsYXlzIGFuIG92ZXJsYXkgb2YgdGhlIGN1cnJlbnQgYm91bmRzIG9mIGVhY2ggQ2FudmFzTm9kZVxyXG4gICAgICovXHJcbiAgICBzaG93Q2FudmFzTm9kZUJvdW5kczogeyB0eXBlOiAnZmxhZycgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIERpc3BsYXlzIGFuIG92ZXJsYXkgb2YgdGhlIGN1cnJlbnQgYm91bmRzIG9mIGVhY2ggcGhldC5zY2VuZXJ5LkZpdHRlZEJsb2NrXHJcbiAgICAgKi9cclxuICAgIHNob3dGaXR0ZWRCbG9ja0JvdW5kczogeyB0eXBlOiAnZmxhZycgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3dzIGhpdCBhcmVhcyBhcyBkYXNoZWQgbGluZXMuXHJcbiAgICAgKi9cclxuICAgIHNob3dIaXRBcmVhczogeyB0eXBlOiAnZmxhZycgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3dzIHBvaW50ZXIgYXJlYXMgYXMgZGFzaGVkIGxpbmVzLiB0b3VjaEFyZWFzIGFyZSByZWQsIG1vdXNlQXJlYXMgYXJlIGJsdWUuXHJcbiAgICAgKi9cclxuICAgIHNob3dQb2ludGVyQXJlYXM6IHsgdHlwZTogJ2ZsYWcnIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEaXNwbGF5cyBhIHNlbWktdHJhbnNwYXJlbnQgY3Vyc29yIGluZGljYXRvciBmb3IgdGhlIHBvc2l0aW9uIG9mIGVhY2ggYWN0aXZlIHBvaW50ZXIgb24gdGhlIHNjcmVlbi5cclxuICAgICAqL1xyXG4gICAgc2hvd1BvaW50ZXJzOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2hvd3MgdGhlIHZpc2libGUgYm91bmRzIGluIFNjcmVlblZpZXcuanMsIGZvciBkZWJ1Z2dpbmcgdGhlIGxheW91dCBvdXRzaWRlIG9mIHRoZSBcImRldlwiIGJvdW5kc1xyXG4gICAgICovXHJcbiAgICBzaG93VmlzaWJsZUJvdW5kczogeyB0eXBlOiAnZmxhZycgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNodWZmbGVzIGxpc3RlbmVycyBlYWNoIHRpbWUgdGhleSBhcmUgbm90aWZpZWQsIHRvIGhlbHAgdXMgdGVzdCBvcmRlciBkZXBlbmRlbmN5LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2F4b24vaXNzdWVzLzIxNVxyXG4gICAgICpcclxuICAgICAqICdkZWZhdWx0JyAtIG5vIHNodWZmbGluZ1xyXG4gICAgICogJ3JhbmRvbScgLSBjaG9vc2VzIGEgc2VlZCBmb3IgeW91XHJcbiAgICAgKiAncmFuZG9tKDEyMyknIC0gc3BlY2lmeSBhIHNlZWRcclxuICAgICAqICdyZXZlcnNlJyAtIHJldmVyc2UgdGhlIG9yZGVyIG9mIGxpc3RlbmVyc1xyXG4gICAgICovXHJcbiAgICBsaXN0ZW5lck9yZGVyOiB7XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6ICdkZWZhdWx0JyxcclxuICAgICAgaXNWYWxpZFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7XHJcblxyXG4gICAgICAgIC8vIE5PVEU6IHRoaXMgcmVndWxhciBleHByZXNzaW9uIG11c3QgYmUgbWFpbnRhaW5lZCBpbiBUaW55RW1pdHRlci50cyBhcyB3ZWxsLlxyXG4gICAgICAgIGNvbnN0IHJlZ2V4ID0gL3JhbmRvbSg/OiUyOHxcXCgpKFxcZCspKD86JTI5fFxcKSkvO1xyXG5cclxuICAgICAgICByZXR1cm4gdmFsdWUgPT09ICdkZWZhdWx0JyB8fCB2YWx1ZSA9PT0gJ3JhbmRvbScgfHwgdmFsdWUgPT09ICdyZXZlcnNlJyB8fCB2YWx1ZS5tYXRjaCggcmVnZXggKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZW4gdHJ1ZSwgdXNlIFNwZWVjaFN5bnRoZXNpc1BhcmVudFBvbHlmaWxsIHRvIGFzc2lnbiBhbiBpbXBsZW1lbnRhdGlvbiBvZiBTcGVlY2hTeW50aGVzaXNcclxuICAgICAqIHRvIHRoZSB3aW5kb3cgc28gdGhhdCBpdCBjYW4gYmUgdXNlZCBpbiBwbGF0Zm9ybXMgd2hlcmUgaXQgb3RoZXJ3aXNlIHdvdWxkIG5vdCBiZSBhdmFpbGFibGUuXHJcbiAgICAgKiBBc3N1bWVzIHRoYXQgYW4gaW1wbGVtZW50YXRpb24gb2YgU3BlZWNoU3ludGhlc2lzIGlzIGF2YWlsYWJsZSBmcm9tIGEgcGFyZW50IGlmcmFtZSB3aW5kb3cuXHJcbiAgICAgKiBTZWUgU3BlZWNoU3ludGhlc2lzUGFyZW50UG9seWZpbGwgaW4gdXR0ZXJhbmNlLXF1ZXVlIGZvciBtb3JlIGluZm9ybWF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIFRoaXMgY2Fubm90IGJlIGEgcXVlcnkgcGFyYW1ldGVyIGluIHV0dGVyYW5jZS1xdWV1ZSBiZWNhdXNlIHV0dGVyYW5jZS1xdWV1ZSAoYSBkZXBlbmRlbmN5IG9mIHNjZW5lcnkpXHJcbiAgICAgKiBjYW4gbm90IHVzZSBRdWVyeVN0cmluZ01hY2hpbmUuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTM2Ni5cclxuICAgICAqXHJcbiAgICAgKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGUgbW90aXZhdGlvbiBmb3IgdGhpcyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ZlbnN0ZXIvaXNzdWVzLzNcclxuICAgICAqXHJcbiAgICAgKiBGb3IgaW50ZXJuYWwgdXNlIG9ubHkuXHJcbiAgICAgKi9cclxuICAgIHNwZWVjaFN5bnRoZXNpc0Zyb21QYXJlbnQ6IHtcclxuICAgICAgdHlwZTogJ2ZsYWcnXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3BlZWQgbXVsdGlwbGllciBmb3IgZXZlcnl0aGluZyBpbiB0aGUgc2ltLiBUaGlzIHNjYWxlcyB0aGUgdmFsdWUgb2YgZHQgZm9yIEFYT04vdGltZXIsXHJcbiAgICAgKiBtb2RlbC5zdGVwLCB2aWV3LnN0ZXAsIGFuZCBhbnl0aGluZyBlbHNlIHRoYXQgaXMgY29udHJvbGxlZCBmcm9tIFNpbS5zdGVwU2ltdWxhdGlvbi5cclxuICAgICAqIE5vcm1hbCBzcGVlZCBpcyAxLiBMYXJnZXIgdmFsdWVzIG1ha2UgdGltZSBnbyBmYXN0ZXIsIHNtYWxsZXIgdmFsdWVzIG1ha2UgdGltZSBnbyBzbG93ZXIuXHJcbiAgICAgKiBGb3IgZXhhbXBsZSwgP3NwZWVkPTAuNSBpcyBoYWxmIHRoZSBub3JtYWwgc3BlZWQuXHJcbiAgICAgKiBVc2VmdWwgZm9yIHRlc3RpbmcgbXVsdGktdG91Y2gsIHNvIHRoYXQgb2JqZWN0cyBhcmUgZWFzaWVyIHRvIGdyYWIgd2hpbGUgdGhleSdyZSBtb3ZpbmcuXHJcbiAgICAgKiBGb3IgaW50ZXJuYWwgdXNlIG9ubHksIG5vdCBwdWJsaWMgZmFjaW5nLlxyXG4gICAgICovXHJcbiAgICBzcGVlZDoge1xyXG4gICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgZGVmYXVsdFZhbHVlOiAxLFxyXG4gICAgICBpc1ZhbGlkVmFsdWU6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcclxuICAgICAgICByZXR1cm4gdmFsdWUgPiAwO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogT3ZlcnJpZGUgdHJhbnNsYXRlZCBzdHJpbmdzLlxyXG4gICAgICogVGhlIHZhbHVlIGlzIGVuY29kZWQgSlNPTiBvZiB0aGUgZm9ybSB7IFwibmFtZXNwYWNlLmtleVwiOlwidmFsdWVcIiwgXCJuYW1lc3BhY2Uua2V5XCI6XCJ2YWx1ZVwiLCAuLi4gfVxyXG4gICAgICogRXhhbXBsZTogeyBcIlBIX1NDQUxFL2xvZ2FyaXRobWljXCI6XCJmb29cIiwgXCJQSF9TQ0FMRS9saW5lYXJcIjpcImJhclwiIH1cclxuICAgICAqIEVuY29kZSB0aGUgSlNPTiBpbiBhIGJyb3dzZXIgY29uc29sZSB1c2luZzogZW5jb2RlVVJJQ29tcG9uZW50KCBKU09OLnN0cmluZ2lmeSggdmFsdWUgKSApXHJcbiAgICAgKi9cclxuICAgIHN0cmluZ3M6IHtcclxuICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgIGRlZmF1bHRWYWx1ZTogbnVsbFxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgYSBzdHJpbmcgdXNlZCBmb3IgdmFyaW91cyBpMThuIHRlc3QuICBUaGUgdmFsdWVzIGFyZTpcclxuICAgICAqXHJcbiAgICAgKiBkb3VibGU6IGR1cGxpY2F0ZXMgYWxsIG9mIHRoZSB0cmFuc2xhdGVkIHN0cmluZ3Mgd2hpY2ggd2lsbCBhbGxvdyB0byBzZWUgKGEpIGlmIGFsbCBzdHJpbmdzXHJcbiAgICAgKiAgIGFyZSB0cmFuc2xhdGVkIGFuZCAoYikgd2hldGhlciB0aGUgbGF5b3V0IGNhbiBhY2NvbW1vZGF0ZSBsb25nZXIgc3RyaW5ncyBmcm9tIG90aGVyIGxhbmd1YWdlcy5cclxuICAgICAqICAgTm90ZSB0aGlzIGlzIGEgaGV1cmlzdGljIHJ1bGUgdGhhdCBkb2VzIG5vdCBjb3ZlciBhbGwgY2FzZXMuXHJcbiAgICAgKlxyXG4gICAgICogbG9uZzogYW4gZXhjZXB0aW9uYWxseSBsb25nIHN0cmluZyB3aWxsIGJlIHN1YnN0aXR1dGVkIGZvciBhbGwgc3RyaW5ncy4gVXNlIHRoaXMgdG8gdGVzdCBmb3IgbGF5b3V0IHByb2JsZW1zLlxyXG4gICAgICpcclxuICAgICAqIHJ0bDogYSBzdHJpbmcgdGhhdCB0ZXN0cyBSVEwgKHJpZ2h0LXRvLWxlZnQpIGNhcGFiaWxpdGllcyB3aWxsIGJlIHN1YnN0aXR1dGVkIGZvciBhbGwgc3RyaW5nc1xyXG4gICAgICpcclxuICAgICAqIHhzczogdGVzdHMgZm9yIHNlY3VyaXR5IGlzc3VlcyByZWxhdGVkIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zcGVjaWFsLW9wcy9pc3N1ZXMvMTgsXHJcbiAgICAgKiAgIGFuZCBydW5uaW5nIGEgc2ltIHNob3VsZCBOT1QgcmVkaXJlY3QgdG8gYW5vdGhlciBwYWdlLiBQcmVmZXJhYmx5IHNob3VsZCBiZSB1c2VkIGZvciBidWlsdCB2ZXJzaW9ucyBvclxyXG4gICAgICogICBvdGhlciB2ZXJzaW9ucyB3aGVyZSBhc3NlcnRpb25zIGFyZSBub3QgZW5hYmxlZC5cclxuICAgICAqXHJcbiAgICAgKiBub25lfG51bGw6IHRoZSBub3JtYWwgdHJhbnNsYXRlZCBzdHJpbmcgd2lsbCBiZSBzaG93blxyXG4gICAgICpcclxuICAgICAqIGR5bmFtaWM6IGFkZHMgZ2xvYmFsIGhvdGtleSBsaXN0ZW5lcnMgdG8gY2hhbmdlIHRoZSBzdHJpbmdzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEzMTlcclxuICAgICAqICAgcmlnaHQgYXJyb3cgLSBkb3VibGVzIGEgc3RyaW5nLCBsaWtlIHN0cmluZyA9IHN0cmluZytzdHJpbmdcclxuICAgICAqICAgbGVmdCBhcnJvdyAtIGhhbHZlcyBhIHN0cmluZ1xyXG4gICAgICogICB1cCBhcnJvdyAtIGN5Y2xlcyB0byBuZXh0IHN0cmlkZSBpbiByYW5kb20gd29yZCBsaXN0XHJcbiAgICAgKiAgIGRvd24gYXJyb3cgLSBjeWNsZXMgdG8gcHJldmlvdXMgc3RyaWRlIGluIHJhbmRvbSB3b3JkIGxpc3RcclxuICAgICAqICAgc3BhY2ViYXIgLSByZXNldHMgdG8gaW5pdGlhbCBFbmdsaXNoIHN0cmluZ3MsIGFuZCByZXNldHMgdGhlIHN0cmlkZVxyXG4gICAgICpcclxuICAgICAqIHtzdHJpbmd9OiBpZiBhbnkgb3RoZXIgc3RyaW5nIHByb3ZpZGVkLCB0aGF0IHN0cmluZyB3aWxsIGJlIHN1YnN0aXR1dGVkIGV2ZXJ5d2hlcmUuIFRoaXMgZmFjaWxpdGF0ZXMgdGVzdGluZ1xyXG4gICAgICogICBzcGVjaWZpYyBjYXNlcywgbGlrZSB3aGV0aGVyIHRoZSB3b3JkICd2aXRlc3NlJyB3b3VsZCBzdWJzdGl0dXRlIGZvciAnc3BlZWQnIHdlbGwuICBBbHNvLCB1c2luZyBcIi91MjBcIiBpdFxyXG4gICAgICogICB3aWxsIHNob3cgd2hpdGVzcGFjZSBmb3IgYWxsIG9mIHRoZSBzdHJpbmdzLCBtYWtpbmcgaXQgZWFzeSB0byBpZGVudGlmeSBub24tdHJhbnNsYXRlZCBzdHJpbmdzLlxyXG4gICAgICovXHJcbiAgICBzdHJpbmdUZXN0OiB7XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IG51bGxcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGRzIGtleWJvYXJkIHNob3J0Y3V0cy4gY3RybCtpIChmb3J3YXJkKSBvciBjdHJsK3UgKGJhY2t3YXJkKS4gQWxzbywgdGhlIHNhbWUgcGh5c2ljYWwga2V5cyBvbiB0aGVcclxuICAgICAqIGR2b3JhayBrZXlib2FyZCAoYz1mb3J3YXJkIGFuZCBnPWJhY2t3YXJkcylcclxuICAgICAqXHJcbiAgICAgKiBOT1RFOiBEVVBMSUNBVElPTiBBTEVSVC4gRG9uJ3QgY2hhbmdlIHRoaXMgd2l0aG91dCBsb29raW5nIGF0IHBhcmFtZXRlciBpbiBQSEVUX0lPX1dSQVBQRVJTL0NsaWVudC50c1xyXG4gICAgICovXHJcbiAgICBrZXlib2FyZExvY2FsZVN3aXRjaGVyOiB7XHJcbiAgICAgIHR5cGU6ICdmbGFnJ1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBFbmFibGVzIGludGVyYWN0aXZlIGRlc2NyaXB0aW9uIGluIHRoZSBzaW11bGF0aW9uLiBVc2UgdGhpcyBvcHRpb24gdG8gcmVuZGVyIHRoZSBQYXJhbGxlbCBET00gZm9yIGtleWJvYXJkXHJcbiAgICAgKiBuYXZpZ2F0aW9uIGFuZCBzY3JlZW4tcmVhZGVyLWJhc2VkIGF1ZGl0b3J5IGRlc2NyaXB0aW9ucy4gQ2FuIGJlIHBlcm1hbmVudGx5IGVuYWJsZWQgaWZcclxuICAgICAqIGBzdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb246IHRydWVgIGlzIGFkZGVkIHVuZGVyIHRoZSBgcGhldC5zaW1GZWF0dXJlc2AgZW50cnkgb2YgcGFja2FnZS5qc29uLiBRdWVyeSBwYXJhbWV0ZXJcclxuICAgICAqIHZhbHVlIHdpbGwgYWx3YXlzIG92ZXJyaWRlIHBhY2thZ2UuanNvbiBlbnRyeS5cclxuICAgICAqL1xyXG4gICAgc3VwcG9ydHNJbnRlcmFjdGl2ZURlc2NyaXB0aW9uOiB7XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgZGVmYXVsdFZhbHVlOiAhIXBhY2thZ2VTaW1GZWF0dXJlcy5zdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb25cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFbmFibGVzIHN1cHBvcnQgZm9yIHRoZSBcIkludGVyYWN0aXZlIEhpZ2hsaWdodHNcIiBmZWF0dXJlLCB3aGVyZSBoaWdobGlnaHRzIGFwcGVhciBhcm91bmQgaW50ZXJhY3RpdmVcclxuICAgICAqIFVJIGNvbXBvbmVudHMuIFRoaXMgaXMgbW9zdCB1c2VmdWwgZm9yIHVzZXJzIHdpdGggbG93IHZpc2lvbiBhbmQgbWFrZXMgaXQgZWFzaWVyIHRvIGlkZW50aWZ5IGludGVyYWN0aXZlXHJcbiAgICAgKiBjb21wb25lbnRzLiBUaG91Z2ggZW5hYmxlZCBoZXJlLCB0aGUgZmVhdHVyZSB3aWxsIGJlIHR1cm5lZCBvZmYgdW50aWwgZW5hYmxlZCBieSB0aGUgdXNlciBmcm9tIHRoZSBQcmVmZXJlbmNlc1xyXG4gICAgICogZGlhbG9nLlxyXG4gICAgICpcclxuICAgICAqIFRoaXMgZmVhdHVyZSBpcyBlbmFibGVkIGJ5IGRlZmF1bHQgd2hlbmV2ZXIgc3VwcG9ydHNJbnRlcmFjdGl2ZURlc2NyaXB0aW9uIGlzIHRydWUgaW4gcGFja2FnZS5qc29uLCBzaW5jZSBQaEVUXHJcbiAgICAgKiB3YW50cyB0byBzY2FsZSBvdXQgdGhpcyBmZWF0dXJlIHdpdGggYWxsIHNpbXMgdGhhdCBzdXBwb3J0IGFsdGVybmF0aXZlIGlucHV0LiBUaGUgZmVhdHVyZSBjYW4gYmUgRElTQUJMRUQgd2hlblxyXG4gICAgICogc3VwcG9ydHNJbnRlcmFjdGl2ZURlc2NyaXB0aW9uIGlzIHRydWUgYnkgc2V0dGluZyBgc3VwcG9ydHNJbnRlcmFjdGl2ZUhpZ2hsaWdodHM6IGZhbHNlYCB1bmRlclxyXG4gICAgICogYHBoZXQuc2ltRmVhdHVyZXNgIGluIHBhY2thZ2UuanNvbi5cclxuICAgICAqXHJcbiAgICAgKiBUaGUgcXVlcnkgcGFyYW1ldGVyIHdpbGwgYWx3YXlzIG92ZXJyaWRlIHRoZSBwYWNrYWdlLmpzb24gZW50cnkuXHJcbiAgICAgKi9cclxuICAgIHN1cHBvcnRzSW50ZXJhY3RpdmVIaWdobGlnaHRzOiB7XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuXHJcbiAgICAgIC8vIElmIHN1cHBvcnRzSW50ZXJhY3RpdmVIaWdobGlnaHRzIGlzIGV4cGxpY2l0bHkgcHJvdmlkZWQgaW4gcGFja2FnZS5qc29uLCB1c2UgdGhhdCB2YWx1ZS4gT3RoZXJ3aXNlLCBlbmFibGVcclxuICAgICAgLy8gSW50ZXJhY3RpdmUgSGlnaGxpZ2h0cyB3aGVuIEludGVyYWN0aXZlIERlc2NyaXB0aW9uIGlzIHN1cHBvcnRlZC5cclxuICAgICAgZGVmYXVsdFZhbHVlOiBwYWNrYWdlU2ltRmVhdHVyZXMuaGFzT3duUHJvcGVydHkoICdzdXBwb3J0c0ludGVyYWN0aXZlSGlnaGxpZ2h0cycgKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgISFwYWNrYWdlU2ltRmVhdHVyZXMuc3VwcG9ydHNJbnRlcmFjdGl2ZUhpZ2hsaWdodHMgOiAhIXBhY2thZ2VTaW1GZWF0dXJlcy5zdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb25cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCeSBkZWZhdWx0LCBJbnRlcmFjdGl2ZSBIaWdobGlnaHRzIGFyZSBkaXNhYmxlZCBvbiBzdGFydHVwLiBQcm92aWRlIHRoaXMgZmxhZyB0byBoYXZlIHRoZSBmZWF0dXJlIGVuYWJsZWQgb25cclxuICAgICAqIHN0YXJ0dXAuIEhhcyBubyBlZmZlY3QgaWYgc3VwcG9ydHNJbnRlcmFjdGl2ZUhpZ2hsaWdodHMgaXMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIGludGVyYWN0aXZlSGlnaGxpZ2h0c0luaXRpYWxseUVuYWJsZWQ6IHtcclxuICAgICAgdHlwZTogJ2ZsYWcnLFxyXG4gICAgICBwdWJsaWM6IHRydWVcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbmRpY2F0ZXMgd2hldGhlciBjdXN0b20gZ2VzdHVyZSBjb250cm9sIGlzIGVuYWJsZWQgYnkgZGVmYXVsdCBpbiB0aGUgc2ltdWxhdGlvbi5cclxuICAgICAqIFRoaXMgaW5wdXQgbWV0aG9kIGlzIHN0aWxsIGluIGRldmVsb3BtZW50LCBtb3N0bHkgdG8gYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIHRoZSB2b2ljaW5nXHJcbiAgICAgKiBmZWF0dXJlLiBJdCBhbGxvd3MgeW91IHRvIHN3aXBlIHRoZSBzY3JlZW4gdG8gbW92ZSBmb2N1cywgZG91YmxlIHRhcCB0aGUgc2NyZWVuIHRvIGFjdGl2YXRlXHJcbiAgICAgKiBjb21wb25lbnRzLCBhbmQgdGFwIGFuZCBob2xkIHRvIGluaXRpYXRlIGN1c3RvbSBnZXN0dXJlcy5cclxuICAgICAqXHJcbiAgICAgKiBGb3IgaW50ZXJuYWwgdXNlLCB0aG91Z2ggbWF5IGJlIHVzZWQgaW4gc2hhcmVkIGxpbmtzIHdpdGggY29sbGFib3JhdG9ycy5cclxuICAgICAqL1xyXG4gICAgc3VwcG9ydHNHZXN0dXJlQ29udHJvbDoge1xyXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgIGRlZmF1bHRWYWx1ZTogISFwYWNrYWdlU2ltRmVhdHVyZXMuc3VwcG9ydHNHZXN0dXJlQ29udHJvbFxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEluZGljYXRlcyB3aGV0aGVyIG9yIG5vdCB0aGUgXCJWb2ljaW5nXCIgZmVhdHVyZSBpcyBlbmFibGVkLiBUaGlzIGlzIGEgcHJvdG90eXBlXHJcbiAgICAgKiBmZWF0dXJlIHRoYXQgdXNlcyB0aGUgd2ViLXNwZWVjaCBBUEkgdG8gcHJvdmlkZSBzcGVlY2ggb3V0cHV0IHRvIHRoZSB1c2VyIGFib3V0XHJcbiAgICAgKiB3aGF0IGlzIGhhcHBlbmluZyBpbiB0aGUgc2ltdWxhdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBGb3IgaW50ZXJuYWwgdXNlIG9ubHkuIFRoaXMgaXMgY3VycmVudGx5IG9ubHkgdXNlZCBpbiBwcm90b3R5cGVzLlxyXG4gICAgICovXHJcbiAgICBzdXBwb3J0c1ZvaWNpbmc6IHtcclxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6ICEhcGFja2FnZVNpbUZlYXR1cmVzLnN1cHBvcnRzVm9pY2luZ1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEJ5IGRlZmF1bHQsIHZvaWNpbmcgaXMgbm90IGVuYWJsZWQgb24gc3RhcnR1cC4gQWRkIHRoaXMgZmxhZyB0byBzdGFydCB0aGUgc2ltIHdpdGggdm9pY2luZyBlbmFibGVkLlxyXG4gICAgICovXHJcbiAgICB2b2ljaW5nSW5pdGlhbGx5RW5hYmxlZDoge1xyXG4gICAgICB0eXBlOiAnZmxhZydcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIGRlYnVnIHF1ZXJ5IHBhcmFtZXRlciB0aGF0IHdpbGwgc2F2ZSBhbmQgbG9hZCB5b3UgcHJlZmVyZW5jZXMgKGZyb20gdGhlIFByZWZlcmVuY2VzIERpYWxvZykgdGhyb3VnaCBtdWx0aXBsZSBydW50aW1lcy5cclxuICAgICAqIFNlZSBQcmVmZXJlbmNlc1N0b3JhZ2UucmVnaXN0ZXIgdG8gc2VlIHdoYXQgUHJvcGVydGllcyBzdXBwb3J0IHRoaXMgc2F2ZS9sb2FkIGZlYXR1cmUuXHJcbiAgICAgKi9cclxuICAgIHByZWZlcmVuY2VzU3RvcmFnZToge1xyXG4gICAgICB0eXBlOiAnZmxhZydcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zb2xlIGxvZyB0aGUgdm9pY2luZyByZXNwb25zZXMgdGhhdCBhcmUgc3Bva2VuIGJ5IFNwZWVjaFN5bnRoZXNpc1xyXG4gICAgICovXHJcbiAgICBwcmludFZvaWNpbmdSZXNwb25zZXM6IHtcclxuICAgICAgdHlwZTogJ2ZsYWcnXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRW5hYmxlcyBwYW5uaW5nIGFuZCB6b29taW5nIG9mIHRoZSBzaW11bGF0aW9uLiBDYW4gYmUgcGVybWFuZW50bHkgZGlzYWJsZWQgaWYgc3VwcG9ydHNQYW5BbmRab29tOiBmYWxzZSBpc1xyXG4gICAgICogYWRkZWQgdW5kZXIgdGhlIGBwaGV0LnNpbUZlYXR1cmVzYCBlbnRyeSBvZiBwYWNrYWdlLmpzb24uIFF1ZXJ5IHBhcmFtZXRlciB2YWx1ZSB3aWxsIGFsd2F5cyBvdmVycmlkZSBwYWNrYWdlLmpzb24gZW50cnkuXHJcbiAgICAgKlxyXG4gICAgICogUHVibGljLCBzbyB0aGF0IHVzZXJzIGNhbiBkaXNhYmxlIHRoaXMgZmVhdHVyZSBpZiB0aGV5IG5lZWQgdG8uXHJcbiAgICAgKi9cclxuICAgIHN1cHBvcnRzUGFuQW5kWm9vbToge1xyXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgIHB1YmxpYzogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIGV2ZW4gaWYgbm90IHByb3ZpZGVkIGluIHBhY2thZ2UuanNvbiwgdGhpcyBkZWZhdWx0cyB0byBiZWluZyB0cnVlXHJcbiAgICAgIGRlZmF1bHRWYWx1ZTogIXBhY2thZ2VTaW1GZWF0dXJlcy5oYXNPd25Qcm9wZXJ0eSggJ3N1cHBvcnRzUGFuQW5kWm9vbScgKSB8fCBwYWNrYWdlU2ltRmVhdHVyZXMuc3VwcG9ydHNQYW5BbmRab29tXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIHNvdW5kIGxpYnJhcnkgc2hvdWxkIGJlIGVuYWJsZWQuICBJZiB0cnVlLCBhbiBpY29uIGlzIGFkZGVkIHRvIHRoZSBuYXYgYmFyIGljb24gdG8gZW5hYmxlXHJcbiAgICAgKiB0aGUgdXNlciB0byB0dXJuIHNvdW5kIG9uL29mZi4gIFRoZXJlIGlzIGFsc28gYSBTaW0gb3B0aW9uIGZvciBlbmFibGluZyBzb3VuZCB3aGljaCBjYW4gb3ZlcnJpZGUgdGhpcy5cclxuICAgICAqIFByaW1hcmlseSBmb3IgaW50ZXJuYWwgdXNlLCB0aG91Z2ggd2UgbWF5IHNoYXJlIGxpbmtzIHdpdGggY29sbGFib3JhdGVzIHRoYXQgdXNlIHRoaXMgcGFyYW1ldGVyLlxyXG4gICAgICovXHJcbiAgICBzdXBwb3J0c1NvdW5kOiB7XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgZGVmYXVsdFZhbHVlOiAhIXBhY2thZ2VTaW1GZWF0dXJlcy5zdXBwb3J0c1NvdW5kXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5kaWNhdGVzIHdoZXRoZXIgZXh0cmEgc291bmRzIGFyZSB1c2VkIGluIGFkZGl0aW9uIHRvIGJhc2ljIHNvdW5kcyBhcyBwYXJ0IG9mIHRoZSBzb3VuZCBkZXNpZ24uICBJZiB0cnVlLCB0aGVcclxuICAgICAqIFBoRVQgbWVudSB3aWxsIGhhdmUgYW4gb3B0aW9uIGZvciBlbmFibGluZyBleHRyYSBzb3VuZHMuICBUaGlzIHdpbGwgYmUgaWdub3JlZCBpZiBzb3VuZCBpcyBub3QgZ2VuZXJhbGx5XHJcbiAgICAgKiBlbmFibGVkIChzZWUgP3N1cHBvcnRzU291bmQpLlxyXG4gICAgICpcclxuICAgICAqIFByaW1hcmlseSBmb3IgaW50ZXJuYWwgdXNlLCB0aG91Z2ggd2UgbWF5IHNoYXJlIGxpbmtzIHdpdGggY29sbGFib3JhdGVzIHRoYXQgdXNlIHRoaXMgcGFyYW1ldGVyLlxyXG4gICAgICovXHJcbiAgICBzdXBwb3J0c0V4dHJhU291bmQ6IHtcclxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6ICEhcGFja2FnZVNpbUZlYXR1cmVzLnN1cHBvcnRzRXh0cmFTb3VuZFxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEluZGljYXRlcyB3aGV0aGVyIG9yIG5vdCB2aWJyYXRpb24gaXMgZW5hYmxlZCwgYW5kIHdoaWNoIHBhcmFkaWdtIGlzIGVuYWJsZWQgZm9yIHRlc3RpbmcuIFRoZXJlXHJcbiAgICAgKiBhcmUgc2V2ZXJhbCBcInBhcmFkaWdtc1wiLCB3aGljaCBhcmUgZGlmZmVyZW50IHZpYnJhdGlvbiBvdXRwdXQgZGVzaWducy4gIEZvciB0ZW1wb3JhcnkgdXNlXHJcbiAgICAgKiB3aGlsZSB3ZSBpbnZlc3RpZ2F0ZSB1c2Ugb2YgdGhpcyBmZWF0dXJlLiBJbiB0aGUgbG9uZyBydW4gdGhlcmUgd2lsbCBwcm9iYWJseSBiZSBvbmx5XHJcbiAgICAgKiBvbmUgZGVzaWduIGFuZCBpdCBjYW4gYmUgZW5hYmxlZC9kaXNhYmxlZCB3aXRoIHNvbWV0aGluZyBtb3JlIGxpa2UgYHN1cHBvcnRzVmlicmF0aW9uYC5cclxuICAgICAqXHJcbiAgICAgKiBUaGVzZSBhcmUgbnVtYmVyZWQsIGJ1dCB0eXBlIGlzIHN0cmluZyBzbyBkZWZhdWx0IGNhbiBiZSBudWxsLCB3aGVyZSBhbGwgdmlicmF0aW9uIGlzIGRpc2FibGVkLlxyXG4gICAgICpcclxuICAgICAqIFVzZWQgaW50ZXJuYWxseSwgdGhvdWdoIGxpbmtzIGFyZSBzaGFyZWQgd2l0aCBjb2xsYWJvcmF0b3JzIGFuZCBwb3NzaWJseSBpbiBwYXBlciBwdWJsaWNhdGlvbnMuXHJcbiAgICAgKi9cclxuICAgIHZpYnJhdGlvblBhcmFkaWdtOiB7XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IG51bGxcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFbmFibGVzIFdlYkdMIHJlbmRlcmluZy4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8yODkuXHJcbiAgICAgKiBOb3RlIHRoYXQgc2ltdWxhdGlvbnMgY2FuIG9wdC1pbiB0byB3ZWJnbCB2aWEgbmV3IFNpbSh7d2ViZ2w6dHJ1ZX0pLCBidXQgdXNpbmcgP3dlYmdsPXRydWUgdGFrZXNcclxuICAgICAqIHByZWNlZGVuY2UuICBJZiBubyB3ZWJnbCBxdWVyeSBwYXJhbWV0ZXIgaXMgc3VwcGxpZWQsIHRoZW4gc2ltdWxhdGlvbnMgdGFrZSB0aGUgU2ltIG9wdGlvbiB2YWx1ZSwgd2hpY2hcclxuICAgICAqIGRlZmF1bHRzIHRvIGZhbHNlLiAgU2VlIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNjIxXHJcbiAgICAgKi9cclxuICAgIHdlYmdsOiB7XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgZGVmYXVsdFZhbHVlOiB0cnVlXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLy8gSW5pdGlhbGl6ZSBxdWVyeSBwYXJhbWV0ZXJzLCBzZWUgZG9jcyBhYm92ZVxyXG4gICggZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBhdHRhY2htZW50IHBvaW50IGZvciBhbGwgUGhFVCBnbG9iYWxzXHJcbiAgICB3aW5kb3cucGhldCA9IHdpbmRvdy5waGV0IHx8IHt9O1xyXG4gICAgd2luZG93LnBoZXQuY2hpcHBlciA9IHdpbmRvdy5waGV0LmNoaXBwZXIgfHwge307XHJcblxyXG4gICAgLy8gUmVhZCBxdWVyeSBwYXJhbWV0ZXJzXHJcbiAgICB3aW5kb3cucGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycyA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGwoIFFVRVJZX1BBUkFNRVRFUlNfU0NIRU1BICk7XHJcbiAgICB3aW5kb3cucGhldC5jaGlwcGVyLmNvbG9yUHJvZmlsZXMgPSBjb2xvclByb2ZpbGVzO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGFueSB0eXBlIG9mIGZ1enppbmcgaXMgZW5hYmxlZC4gVGhpcyBpcyBhIGZ1bmN0aW9uIHNvIHRoYXQgdGhlIGFzc29jaWF0ZWQgcXVlcnkgcGFyYW1ldGVyc1xyXG4gICAgICogY2FuIGJlIGNoYW5nZWQgZnJvbSB0aGUgY29uc29sZSB3aGlsZSB0aGUgc2ltIGlzIHJ1bm5pbmcuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy82NzcuXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgd2luZG93LnBoZXQuY2hpcHBlci5pc0Z1enpFbmFibGVkID0gKCkgPT5cclxuICAgICAgKCB3aW5kb3cucGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5mdXp6IHx8XHJcbiAgICAgICAgd2luZG93LnBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuZnV6ek1vdXNlIHx8XHJcbiAgICAgICAgd2luZG93LnBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuZnV6elRvdWNoIHx8XHJcbiAgICAgICAgd2luZG93LnBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuZnV6ekJvYXJkXHJcbiAgICAgICk7XHJcblxyXG4gICAgLy8gQWRkIGEgbG9nIGZ1bmN0aW9uIHRoYXQgZGlzcGxheXMgbWVzc2FnZXMgdG8gdGhlIGNvbnNvbGUuIEV4YW1wbGVzOlxyXG4gICAgLy8gcGhldC5sb2cgJiYgcGhldC5sb2coICdZb3Ugd2luIScgKTtcclxuICAgIC8vIHBoZXQubG9nICYmIHBoZXQubG9nKCAnWW91IGxvc2UnLCB7IGNvbG9yOiAncmVkJyB9ICk7XHJcbiAgICBpZiAoIHdpbmRvdy5waGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmxvZyApIHtcclxuICAgICAgd2luZG93LnBoZXQubG9nID0gZnVuY3Rpb24oIG1lc3NhZ2UsIG9wdGlvbnMgKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IF8uYXNzaWduSW4oIHtcclxuICAgICAgICAgIGNvbG9yOiAnIzAwOTkwMCcgLy8gZ3JlZW5cclxuICAgICAgICB9LCBvcHRpb25zICk7XHJcbiAgICAgICAgY29uc29sZS5sb2coIGAlYyR7bWVzc2FnZX1gLCBgY29sb3I6ICR7b3B0aW9ucy5jb2xvcn1gICk7IC8vIGdyZWVuXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBuYW1lIG9mIGJyYW5kIHRvIHVzZSwgd2hpY2ggZGV0ZXJtaW5lcyB3aGljaCBsb2dvIHRvIHNob3cgaW4gdGhlIG5hdmJhciBhcyB3ZWxsIGFzIHdoYXQgb3B0aW9uc1xyXG4gICAgICogdG8gc2hvdyBpbiB0aGUgUGhFVCBtZW51IGFuZCB3aGF0IHRleHQgdG8gc2hvdyBpbiB0aGUgQWJvdXQgZGlhbG9nLlxyXG4gICAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9icmFuZC9pc3N1ZXMvMTFcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHdpbmRvdy5waGV0LmNoaXBwZXIuYnJhbmQgPSB3aW5kb3cucGhldC5jaGlwcGVyLmJyYW5kIHx8IHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuYnJhbmQgfHwgJ2FkYXB0ZWQtZnJvbS1waGV0JztcclxuXHJcbiAgICAvLyB7c3RyaW5nfG51bGx9IC0gU2VlIGRvY3VtZW50YXRpb24gb2Ygc3RyaW5nVGVzdCBxdWVyeSBwYXJhbWV0ZXIgLSB3ZSBuZWVkIHRvIHN1cHBvcnQgdGhpcyBkdXJpbmcgYnVpbGQsIHdoZXJlXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgdGhlcmUgYXJlbid0IGFueSBxdWVyeSBwYXJhbWV0ZXJzLlxyXG4gICAgY29uc3Qgc3RyaW5nVGVzdCA9ICggdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5zdHJpbmdUZXN0ICkgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuc3RyaW5nVGVzdCA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgbnVsbDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE1hcHMgYW4gaW5wdXQgc3RyaW5nIHRvIGEgZmluYWwgc3RyaW5nLCBhY2NvbW1vZGF0aW5nIHRyaWNrcyBsaWtlIGRvdWJsZVN0cmluZ3MuXHJcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gbW9kaWZ5IGFsbCBzdHJpbmdzIGluIGEgc2ltIHdoZW4gdGhlIHN0cmluZ1Rlc3QgcXVlcnkgcGFyYW1ldGVyIGlzIHVzZWQuXHJcbiAgICAgKiBUaGUgc3RyaW5nVGVzdCBxdWVyeSBwYXJhbWV0ZXIgYW5kIGl0cyBvcHRpb25zIGFyZSBkb2N1bWVudGVkIGluIHRoZSBxdWVyeSBwYXJhbWV0ZXIgZG9jcyBhYm92ZS5cclxuICAgICAqIEl0IGlzIHVzZWQgaW4gc3RyaW5nLmpzIGFuZCBzaW0uaHRtbC5cclxuICAgICAqIEBwYXJhbSBzdHJpbmcgLSB0aGUgc3RyaW5nIHRvIGJlIG1hcHBlZFxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgd2luZG93LnBoZXQuY2hpcHBlci5tYXBTdHJpbmcgPSBmdW5jdGlvbiggc3RyaW5nICkge1xyXG4gICAgICByZXR1cm4gc3RyaW5nVGVzdCA9PT0gbnVsbCA/IHN0cmluZyA6XHJcbiAgICAgICAgICAgICBzdHJpbmdUZXN0ID09PSAnZG91YmxlJyA/IGAke3N0cmluZ306JHtzdHJpbmd9YCA6XHJcbiAgICAgICAgICAgICBzdHJpbmdUZXN0ID09PSAnbG9uZycgPyAnMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAnIDpcclxuICAgICAgICAgICAgIHN0cmluZ1Rlc3QgPT09ICdydGwnID8gJ1xcdTIwMmJcXHUwNjJhXFx1MDYzM1xcdTA2MmEgKFxcdTA2MzJcXHUwNjI4XFx1MDYyN1xcdTA2NDYpXFx1MjAyYycgOlxyXG4gICAgICAgICAgICAgc3RyaW5nVGVzdCA9PT0gJ3hzcycgPyBgJHtzdHJpbmd9PGltZyBzcmM9XCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFFQUFBQUJDQVlBQUFBZkZjU0pBQUFBRFVsRVFWUUlXMk5rWUdENER3QUJDUUVCdHhtTjd3QUFBQUJKUlU1RXJrSmdnZz09XCIgb25sb2FkPVwid2luZG93LmxvY2F0aW9uLmhyZWY9YXRvYignYUhSMGNITTZMeTkzZDNjdWVXOTFkSFZpWlM1amIyMHZkMkYwWTJnL2RqMWtVWGMwZHpsWFoxaGpVUT09JylcIiAvPmAgOlxyXG4gICAgICAgICAgICAgc3RyaW5nVGVzdCA9PT0gJ25vbmUnID8gc3RyaW5nIDpcclxuICAgICAgICAgICAgIHN0cmluZ1Rlc3QgPT09ICdkeW5hbWljJyA/IHN0cmluZyA6XHJcblxyXG4gICAgICAgICAgICAgICAvLyBJbiB0aGUgZmFsbGJhY2sgY2FzZSwgc3VwcGx5IHdoYXRldmVyIHN0cmluZyB3YXMgZ2l2ZW4gaW4gdGhlIHF1ZXJ5IHBhcmFtZXRlciB2YWx1ZVxyXG4gICAgICAgICAgICAgc3RyaW5nVGVzdDtcclxuICAgIH07XHJcblxyXG4gICAgLy8gSWYgbG9jYWxlIHdhcyBwcm92aWRlZCBhcyBhIHF1ZXJ5IHBhcmFtZXRlciwgdGhlbiBjaGFuZ2UgdGhlIGxvY2FsZSB1c2VkIGJ5IEdvb2dsZSBBbmFseXRpY3MuXHJcbiAgICBpZiAoIFF1ZXJ5U3RyaW5nTWFjaGluZS5jb250YWluc0tleSggJ2xvY2FsZScgKSApIHtcclxuICAgICAgd2luZG93LnBoZXQuY2hpcHBlci5sb2NhbGUgPSBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmxvY2FsZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCAhd2luZG93LnBoZXQuY2hpcHBlci5sb2NhbGUgKSB7XHJcbiAgICAgIC8vIEZpbGwgaW4gYSBkZWZhdWx0XHJcbiAgICAgIHdpbmRvdy5waGV0LmNoaXBwZXIubG9jYWxlID0gJ2VuJztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzdHJpbmdPdmVycmlkZXMgPSBKU09OLnBhcnNlKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnN0cmluZ3MgfHwgJ3t9JyApO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IGEgc3RyaW5nIGdpdmVuIHRoZSBrZXkuIFRoaXMgaW1wbGVtZW50YXRpb24gaXMgbWVhbnQgZm9yIHVzZSBvbmx5IGluIHRoZSBidWlsZCBzaW0uIEZvciBtb3JlIGluZm8gc2VlIHRoZVxyXG4gICAgICogc3RyaW5nIHBsdWdpbi5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgLSBsaWtlIFwiUkVQTy9zdHJpbmcua2V5LmhlcmVcIiB3aGljaCBpbmNsdWRlcyB0aGUgcmVxdWlyZWpzTmFtZXNwYWNlLCB3aGljaCBpcyBzcGVjaWZpZWQgaW4gcGFja2FnZS5qc29uXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwaGV0LmNoaXBwZXIuZ2V0U3RyaW5nRm9yQnVpbHRTaW0gPSBrZXkgPT4ge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhIXBoZXQuY2hpcHBlci5pc1Byb2R1Y3Rpb24sICdleHBlY3RlZCB0byBiZSBydW5uaW5nIGEgYnVpbHQgc2ltJyApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhIXBoZXQuY2hpcHBlci5zdHJpbmdzLCAncGhldC5jaGlwcGVyLnN0cmluZ3Mgc2hvdWxkIGJlIGZpbGxlZCBvdXQgYnkgaW5pdGlhbGl6YXRpb24gc2NyaXB0JyApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhIXBoZXQuY2hpcHBlci5sb2NhbGUsICdsb2NhbGUgaXMgcmVxdWlyZWQgdG8gbG9vayB1cCB0aGUgY29ycmVjdCBzdHJpbmdzJyApO1xyXG5cclxuICAgICAgLy8gb3ZlcnJpZGUgc3RyaW5ncyB2aWEgdGhlICdzdHJpbmdzJyBxdWVyeSBwYXJhbWV0ZXJcclxuICAgICAgaWYgKCBzdHJpbmdPdmVycmlkZXNbIGtleSBdICkge1xyXG4gICAgICAgIHJldHVybiBzdHJpbmdPdmVycmlkZXNbIGtleSBdO1xyXG4gICAgICB9XHJcbiAgICAgIGxldCBzdHJpbmdNYXAgPSBwaGV0LmNoaXBwZXIuc3RyaW5nc1sgcGhldC5jaGlwcGVyLmxvY2FsZSBdO1xyXG5cclxuICAgICAgLy8gRG9uJ3QgZmFpbCBvdXQgb24gdW5zdXBwb3J0ZWQgbG9jYWxlcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy82OTRcclxuICAgICAgaWYgKCAhc3RyaW5nTWFwICkge1xyXG5cclxuICAgICAgICAvLyBTZWUgaWYgdGhlcmUncyBhIHRyYW5zbGF0aW9uIGZvciBqdXN0IHRoZSBsYW5ndWFnZSBjb2RlXHJcbiAgICAgICAgc3RyaW5nTWFwID0gcGhldC5jaGlwcGVyLnN0cmluZ3NbIHBoZXQuY2hpcHBlci5sb2NhbGUuc2xpY2UoIDAsIDIgKSBdO1xyXG5cclxuICAgICAgICBpZiAoICFzdHJpbmdNYXAgKSB7XHJcbiAgICAgICAgICBzdHJpbmdNYXAgPSBwaGV0LmNoaXBwZXIuc3RyaW5ncy5lbjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHBoZXQuY2hpcHBlci5tYXBTdHJpbmcoIHN0cmluZ01hcFsga2V5IF0gKTtcclxuICAgIH07XHJcbiAgfSgpICk7XHJcblxyXG4gIC8qKlxyXG4gICAqIFV0aWxpdHkgZnVuY3Rpb24gdG8gcGF1c2Ugc3luY2hyb25vdXNseSBmb3IgdGhlIGdpdmVuIG51bWJlciBvZiBtaWxsaXNlY29uZHMuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1pbGxpcyAtIGFtb3VudCBvZiB0aW1lIHRvIHBhdXNlIHN5bmNocm9ub3VzbHlcclxuICAgKi9cclxuICBmdW5jdGlvbiBzbGVlcCggbWlsbGlzICkge1xyXG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICBsZXQgY3VyRGF0ZTtcclxuICAgIGRvIHtcclxuICAgICAgY3VyRGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICB9IHdoaWxlICggY3VyRGF0ZSAtIGRhdGUgPCBtaWxsaXMgKTtcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICogVGhlc2UgYXJlIHVzZWQgdG8gbWFrZSBzdXJlIG91ciBzaW1zIHN0aWxsIGJlaGF2ZSBwcm9wZXJseSB3aXRoIGFuIGFydGlmaWNpYWxseSBoaWdoZXIgbG9hZCAoc28gd2UgY2FuIHRlc3Qgd2hhdCBoYXBwZW5zXHJcbiAgICogYXQgMzBmcHMsIDVmcHMsIGV0YykuIFRoZXJlIHRlbmQgdG8gYmUgYnVncyB0aGF0IG9ubHkgaGFwcGVuIG9uIGxlc3MtcG93ZXJmdWwgZGV2aWNlcywgYW5kIHRoZXNlIGZ1bmN0aW9ucyBmYWNpbGl0YXRlXHJcbiAgICogdGVzdGluZyBhIHNpbSBmb3Igcm9idXN0bmVzcywgYW5kIGFsbG93aW5nIG90aGVycyB0byByZXByb2R1Y2Ugc2xvdy1iZWhhdmlvciBidWdzLlxyXG4gICAqL1xyXG4gIHdpbmRvdy5waGV0LmNoaXBwZXIubWFrZUV2ZXJ5dGhpbmdTbG93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB3aW5kb3cuc2V0SW50ZXJ2YWwoICgpID0+IHsgc2xlZXAoIDY0ICk7IH0sIDE2ICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFkLXNpbS10ZXh0XHJcbiAgfTtcclxuICB3aW5kb3cucGhldC5jaGlwcGVyLm1ha2VSYW5kb21TbG93bmVzcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgd2luZG93LnNldEludGVydmFsKCAoKSA9PiB7IHNsZWVwKCBNYXRoLmNlaWwoIDEwMCArIE1hdGgucmFuZG9tKCkgKiAyMDAgKSApOyB9LCBNYXRoLmNlaWwoIDEwMCArIE1hdGgucmFuZG9tKCkgKiAyMDAgKSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhZC1zaW0tdGV4dFxyXG4gIH07XHJcblxyXG4gIC8vIEFyZSB3ZSBydW5uaW5nIGEgYnVpbHQgaHRtbCBmaWxlP1xyXG4gIHdpbmRvdy5waGV0LmNoaXBwZXIuaXNQcm9kdWN0aW9uID0gJCggJ21ldGFbbmFtZT1waGV0LXNpbS1sZXZlbF0nICkuYXR0ciggJ2NvbnRlbnQnICkgPT09ICdwcm9kdWN0aW9uJztcclxuXHJcbiAgLy8gQXJlIHdlIHJ1bm5pbmcgaW4gYW4gYXBwP1xyXG4gIHdpbmRvdy5waGV0LmNoaXBwZXIuaXNBcHAgPSBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzWyAncGhldC1hcHAnIF0gfHwgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVyc1sgJ3BoZXQtYW5kcm9pZC1hcHAnIF07XHJcblxyXG4gIC8qKlxyXG4gICAqIEVuYWJsZXMgb3IgZGlzYWJsZXMgYXNzZXJ0aW9ucyBpbiBjb21tb24gbGlicmFyaWVzIHVzaW5nIHF1ZXJ5IHBhcmFtZXRlcnMuXHJcbiAgICogVGhlcmUgYXJlIHR3byB0eXBlcyBvZiBhc3NlcnRpb25zOiBiYXNpYyBhbmQgc2xvdy4gRW5hYmxpbmcgc2xvdyBhc3NlcnRpb25zIHdpbGwgYWR2ZXJzZWx5IGltcGFjdCBwZXJmb3JtYW5jZS5cclxuICAgKiAnZWEnIGVuYWJsZXMgYmFzaWMgYXNzZXJ0aW9ucywgJ2VhbGwnIGVuYWJsZXMgYmFzaWMgYW5kIHNsb3cgYXNzZXJ0aW9ucy5cclxuICAgKiBNdXN0IGJlIHJ1biBiZWZvcmUgdGhlIG1haW4gbW9kdWxlcywgYW5kIGFzc3VtZXMgdGhhdCBhc3NlcnQuanMgYW5kIHF1ZXJ5LXBhcmFtZXRlcnMuanMgaGFzIGJlZW4gcnVuLlxyXG4gICAqL1xyXG4gICggZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gZW5hYmxlcyBhbGwgYXNzZXJ0aW9ucyAoYmFzaWMgYW5kIHNsb3cpXHJcbiAgICBjb25zdCBlbmFibGVBbGxBc3NlcnRpb25zID0gIXBoZXQuY2hpcHBlci5pc1Byb2R1Y3Rpb24gJiYgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5lYWxsO1xyXG5cclxuICAgIC8vIGVuYWJsZXMgYmFzaWMgYXNzZXJ0aW9uc1xyXG4gICAgY29uc3QgZW5hYmxlQmFzaWNBc3NlcnRpb25zID0gZW5hYmxlQWxsQXNzZXJ0aW9ucyB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCAhcGhldC5jaGlwcGVyLmlzUHJvZHVjdGlvbiAmJiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmVhICkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBoZXQuY2hpcHBlci5pc0RlYnVnQnVpbGQ7XHJcblxyXG4gICAgaWYgKCBlbmFibGVCYXNpY0Fzc2VydGlvbnMgKSB7XHJcbiAgICAgIHdpbmRvdy5hc3NlcnRpb25zLmVuYWJsZUFzc2VydCgpO1xyXG4gICAgfVxyXG4gICAgaWYgKCBlbmFibGVBbGxBc3NlcnRpb25zICkge1xyXG4gICAgICB3aW5kb3cuYXNzZXJ0aW9ucy5lbmFibGVBc3NlcnRTbG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZW5kcyBhIG1lc3NhZ2UgdG8gYSBjb250aW51b3VzIHRlc3RpbmcgY29udGFpbmVyLlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBTcGVjaWZpYyBvYmplY3QgcmVzdWx0cyBzZW50IHRvIENULlxyXG4gICAgICovXHJcbiAgICB3aW5kb3cucGhldC5jaGlwcGVyLnJlcG9ydENvbnRpbnVvdXNUZXN0UmVzdWx0ID0gb3B0aW9ucyA9PiB7XHJcbiAgICAgIHdpbmRvdy5wYXJlbnQgJiYgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSggSlNPTi5zdHJpbmdpZnkoIF8uYXNzaWduSW4oIHtcclxuICAgICAgICBjb250aW51b3VzVGVzdDogSlNPTi5wYXJzZSggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5jb250aW51b3VzVGVzdCApLFxyXG4gICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWZcclxuICAgICAgfSwgb3B0aW9ucyApICksICcqJyApO1xyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuY29udGludW91c1Rlc3QgKSB7XHJcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnZXJyb3InLCBhID0+IHtcclxuICAgICAgICBsZXQgbWVzc2FnZSA9ICcnO1xyXG4gICAgICAgIGxldCBzdGFjayA9ICcnO1xyXG4gICAgICAgIGlmICggYSAmJiBhLm1lc3NhZ2UgKSB7XHJcbiAgICAgICAgICBtZXNzYWdlID0gYS5tZXNzYWdlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIGEgJiYgYS5lcnJvciAmJiBhLmVycm9yLnN0YWNrICkge1xyXG4gICAgICAgICAgc3RhY2sgPSBhLmVycm9yLnN0YWNrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwaGV0LmNoaXBwZXIucmVwb3J0Q29udGludW91c1Rlc3RSZXN1bHQoIHtcclxuICAgICAgICAgIHR5cGU6ICdjb250aW51b3VzLXRlc3QtZXJyb3InLFxyXG4gICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcclxuICAgICAgICAgIHN0YWNrOiBzdGFja1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfSApO1xyXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2JlZm9yZXVubG9hZCcsIGUgPT4ge1xyXG4gICAgICAgIHBoZXQuY2hpcHBlci5yZXBvcnRDb250aW51b3VzVGVzdFJlc3VsdCgge1xyXG4gICAgICAgICAgdHlwZTogJ2NvbnRpbnVvdXMtdGVzdC11bmxvYWQnXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIC8vIHdpbmRvdy5vcGVuIHN0dWIuIG90aGVyd2lzZSB3ZSBnZXQgdG9ucyBvZiBcIlJlcG9ydCBQcm9ibGVtLi4uXCIgcG9wdXBzIHRoYXQgc3RhbGxcclxuICAgICAgd2luZG93Lm9wZW4gPSAoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIGZvY3VzOiAoKSA9PiB7fSxcclxuICAgICAgICAgIGJsdXI6ICgpID0+IHt9XHJcbiAgICAgICAgfTtcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDb21tdW5pY2F0ZSBzaW0gZXJyb3JzIHRvIGpvaXN0L3Rlc3RzL3Rlc3Qtc2ltcy5odG1sXHJcbiAgICBpZiAoIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMucG9zdE1lc3NhZ2VPbkVycm9yICkge1xyXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgYSA9PiB7XHJcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSAnJztcclxuICAgICAgICBsZXQgc3RhY2sgPSAnJztcclxuICAgICAgICBpZiAoIGEgJiYgYS5tZXNzYWdlICkge1xyXG4gICAgICAgICAgbWVzc2FnZSA9IGEubWVzc2FnZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBhICYmIGEuZXJyb3IgJiYgYS5lcnJvci5zdGFjayApIHtcclxuICAgICAgICAgIHN0YWNrID0gYS5lcnJvci5zdGFjaztcclxuICAgICAgICB9XHJcbiAgICAgICAgd2luZG93LnBhcmVudCAmJiB3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKCBKU09OLnN0cmluZ2lmeSgge1xyXG4gICAgICAgICAgdHlwZTogJ2Vycm9yJyxcclxuICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXHJcbiAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxyXG4gICAgICAgICAgc3RhY2s6IHN0YWNrXHJcbiAgICAgICAgfSApLCAnKicgKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5wb3N0TWVzc2FnZU9uQmVmb3JlVW5sb2FkICkge1xyXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2JlZm9yZXVubG9hZCcsIGUgPT4ge1xyXG4gICAgICAgIHdpbmRvdy5wYXJlbnQgJiYgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSggSlNPTi5zdHJpbmdpZnkoIHtcclxuICAgICAgICAgIHR5cGU6ICdiZWZvcmVVbmxvYWQnXHJcbiAgICAgICAgfSApLCAnKicgKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gIH0oKSAp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