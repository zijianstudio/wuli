// Copyright 2013-2023, University of Colorado Boulder

/**
 * Main class that represents one simulation.
 * Provides default initialization, such as polyfills as well.
 * If the simulation has only one screen, then there is no homescreen, home icon or screen icon in the navigation bar.
 *
 * The type for the contained Screen instances is Screen<any,any> since we do not want to parameterize Sim<[{M1,V1},{M2,V2}]
 * etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import animationFrameTimer from '../../axon/js/animationFrameTimer.js';
import BooleanProperty from '../../axon/js/BooleanProperty.js';
import createObservableArray from '../../axon/js/createObservableArray.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Emitter from '../../axon/js/Emitter.js';
import NumberProperty from '../../axon/js/NumberProperty.js';
import Property from '../../axon/js/Property.js';
import stepTimer from '../../axon/js/stepTimer.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Random from '../../dot/js/Random.js';
import DotUtils from '../../dot/js/Utils.js'; // eslint-disable-line default-import-match-filename
import platform from '../../phet-core/js/platform.js';
import optionize from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import BarrierRectangle from '../../scenery-phet/js/BarrierRectangle.js';
import { animatedPanZoomSingleton, Color, globalKeyStateTracker, Node, Utils, voicingManager, voicingUtteranceQueue } from '../../scenery/js/imports.js';
import '../../sherpa/lib/game-up-camera-1.0.0.js';
import soundManager from '../../tambo/js/soundManager.js';
import PhetioAction from '../../tandem/js/PhetioAction.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import audioManager from './audioManager.js';
import Heartbeat from './Heartbeat.js';
import Helper from './Helper.js';
import HomeScreen from './HomeScreen.js';
import HomeScreenView from './HomeScreenView.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import LookAndFeel from './LookAndFeel.js';
import MemoryMonitor from './MemoryMonitor.js';
import NavigationBar from './NavigationBar.js';
import packageJSON from './packageJSON.js';
import PreferencesModel from './preferences/PreferencesModel.js';
import Profiler from './Profiler.js';
import QueryParametersWarningDialog from './QueryParametersWarningDialog.js';
import Screen from './Screen.js';
import ScreenSelectionSoundGenerator from './ScreenSelectionSoundGenerator.js';
import ScreenshotGenerator from './ScreenshotGenerator.js';
import selectScreens from './selectScreens.js';
import SimDisplay from './SimDisplay.js';
import SimInfo from './SimInfo.js';
import LegendsOfLearningSupport from './thirdPartySupport/LegendsOfLearningSupport.js';
import Toolbar from './toolbar/Toolbar.js';
import updateCheck from './updateCheck.js';
import Multilink from '../../axon/js/Multilink.js';
import Combination from '../../dot/js/Combination.js';
import Permutation from '../../dot/js/Permutation.js';
import ArrayIO from '../../tandem/js/types/ArrayIO.js';
import StringIO from '../../tandem/js/types/StringIO.js';
// constants
const PROGRESS_BAR_WIDTH = 273;
const SUPPORTS_GESTURE_DESCRIPTION = platform.android || platform.mobileSafari;

// globals
phet.joist.elapsedTime = 0; // in milliseconds, use this in Tween.start for replicable playbacks

// When the simulation is going to be used to play back a recorded session, the simulation must be put into a special
// mode in which it will only update the model + view based on the playback clock events rather than the system clock.
// This must be set before the simulation is launched in order to ensure that no errant stepSimulation steps are called
// before the playback events begin.  This value is overridden for playback by PhetioEngineIO.
// (phet-io)
phet.joist.playbackModeEnabledProperty = new BooleanProperty(phet.chipper.queryParameters.playbackMode);
assert && assert(typeof phet.chipper.brand === 'string', 'phet.chipper.brand is required to run a sim');
export default class Sim extends PhetioObject {
  // (joist-internal)

  // Indicates sim construction completed, and that all screen models and views have been created.
  // This was added for PhET-iO but can be used by any client. This does not coincide with the end of the Sim
  // constructor (because Sim has asynchronous steps that finish after the constructor is completed)
  _isConstructionCompleteProperty = new Property(false);
  isConstructionCompleteProperty = this._isConstructionCompleteProperty;

  // Stores the effective window dimensions that the simulation will be taking up

  // Indicates when the sim resized.  This Action is implemented so it can be automatically played back.

  // (joist-internal)

  // Sim screens normally update by implementing model.step(dt) or view.step(dt).  When that is impossible or
  // relatively awkward, it is possible to listen for a callback when a frame begins, when a frame is being processed
  // or after the frame is complete.  See https://github.com/phetsims/joist/issues/534

  // Indicates when a frame starts.  Listen to this Emitter if you have an action that must be
  // performed before the step begins.
  frameStartedEmitter = new Emitter();
  frameEndedEmitter = new Emitter({
    tandem: Tandem.GENERAL_MODEL.createTandem('frameEndedEmitter'),
    phetioHighFrequency: true,
    phetioDocumentation: 'Indicates when a frame ends. Listen to this Emitter if you have an action that must be ' + 'performed after the model and view step completes.'
  });

  // Steps the simulation. This Action is implemented so it can be automatically
  // played back for PhET-iO record/playback.  Listen to this Action if you have an action that happens during the
  // simulation step.
  // the ordered list of sim-specific screens that appear in this runtime of the sim
  // all screens that appear in the runtime of this sim, with the homeScreen first if it was created
  // the displayed name in the sim. This depends on what screens are shown this runtime (effected by query parameters).
  // true if all possible screens are present (order-independent)
  // When the sim is active, scenery processes inputs and stepSimulation(dt) runs from the system clock.
  // Set to false for when the sim will be paused.
  activeProperty = new BooleanProperty(true, {
    tandem: Tandem.GENERAL_MODEL.createTandem('activeProperty'),
    phetioFeatured: true,
    phetioDocumentation: 'Determines whether the entire simulation is running and processing user input. ' + 'Setting this property to false pauses the simulation, and prevents user interaction.'
  });

  // indicates whether the browser tab containing the simulation is currently visible

  // (joist-internal) - How the home screen and navbar are scaled. This scale is based on the
  // HomeScreen's layout bounds to support a consistently sized nav bar and menu. If this scale was based on the
  // layout bounds of the current screen, there could be differences in the nav bar across screens.
  scaleProperty = new NumberProperty(1);

  // (joist-internal) global bounds for the entire simulation. null before first resize
  boundsProperty = new Property(null);

  // (joist-internal) global bounds for the screen-specific part (excludes the navigation bar), null before first resize
  screenBoundsProperty = new Property(null);
  lookAndFeel = new LookAndFeel();
  memoryMonitor = new MemoryMonitor();

  // public (read-only) {boolean} - if true, add support specific to accessible technology that work with touch devices.

  // If any sim screen has keyboard help content, trigger creation of a keyboard help button.

  // if PhET-iO is currently setting the state of the simulation. See PhetioStateEngine for details. This must be
  // declared before soundManager.initialized is called.
  // if PhET-iO is currently setting the state of the simulation and in the process of clearing dynamic elements as a
  // precursor to setting the state of those elements. See PhetioStateEngine for details. This must be
  // declared before soundManager.initialized is called.
  // (joist-internal)
  version = packageJSON.version;

  // number of animation frames that have occurred
  frameCounter = 0;

  // Whether the window has resized since our last updateDisplay()
  resizePending = true;

  // Make our locale available
  locale = phet.chipper.locale || 'en';

  // create this only after all other members have been set on Sim

  // The Toolbar is not created unless requested with a PreferencesModel.
  toolbar = null;

  // Manages state related to preferences. Enabled features for preferences are provided through the
  // PreferencesModel.
  // list of nodes that are "modal" and hence block input with the barrierRectangle.  Used by modal dialogs
  // and the PhetMenu
  modalNodeStack = createObservableArray();

  // (joist-internal) Semi-transparent black barrier used to block input events when a dialog (or other popup)
  // is present, and fade out the background.
  barrierRectangle = new BarrierRectangle(this.modalNodeStack);

  // layer for popups, dialogs, and their backgrounds and barriers
  // TODO: How should we handle the popup for navigation? Can we set this to private? https://github.com/phetsims/joist/issues/841
  topLayer = new Node({
    children: [this.barrierRectangle]
  });

  // root node for the Display

  // Keep track of the previous time for computing dt, and initially signify that time hasn't been recorded yet.
  lastStepTime = -1;
  lastAnimationFrameTime = -1;

  // (joist-internal) Bind the animation loop so it can be called from requestAnimationFrame with the right this.

  /**
   * @param simNameProperty - the name of the simulation, to be displayed in the navbar and homescreen
   * @param allSimScreens - the possible screens for the sim in order of declaration (does not include the home screen)
   * @param [providedOptions] - see below for options
   */
  constructor(simNameProperty, allSimScreens, providedOptions) {
    window.phetSplashScreenDownloadComplete();
    assert && assert(allSimScreens.length >= 1, 'at least one screen is required');
    const options = optionize()({
      credits: {},
      // a {Node} placed onto the home screen (if available)
      homeScreenWarningNode: null,
      // If a PreferencesModel supports any preferences, the sim will include the PreferencesDialog and a
      // button in the NavigationBar to open it. Simulation conditions (like what locales are available) might enable
      // a PreferencesDialog by default. But PreferencesModel has many options you can provide.
      preferencesModel: null,
      // Passed to SimDisplay, but a top level option for API ease.
      webgl: SimDisplay.DEFAULT_WEBGL,
      // phet-io
      phetioState: false,
      phetioReadOnly: true,
      tandem: Tandem.ROOT
    }, providedOptions);
    if (!options.preferencesModel) {
      options.preferencesModel = new PreferencesModel();
    }

    // Some options are used by sim and SimDisplay. Promote webgl to top level sim option out of API ease, but it is
    // passed to the SimDisplay.
    const simDisplayOptions = {
      webgl: options.webgl,
      tandem: Tandem.GENERAL_VIEW.createTandem('display'),
      preferencesModel: options.preferencesModel
    };
    super(options);
    this.credits = options.credits;
    this.simNameProperty = simNameProperty;

    // playbackModeEnabledProperty cannot be changed after Sim construction has begun, hence this listener is added before
    // anything else is done, see https://github.com/phetsims/phet-io/issues/1146
    phet.joist.playbackModeEnabledProperty.lazyLink(() => {
      throw new Error('playbackModeEnabledProperty cannot be changed after Sim construction has begun');
    });
    assert && this.isConstructionCompleteProperty.lazyLink(isConstructionComplete => {
      assert && assert(isConstructionComplete, 'Sim construction should never uncomplete');
    });
    const dimensionProperty = new Property(new Dimension2(0, 0), {
      valueComparisonStrategy: 'equalsFunction'
    });

    // Note: the public API is TReadOnlyProperty
    this.dimensionProperty = dimensionProperty;
    this.resizeAction = new PhetioAction((width, height) => {
      assert && assert(width > 0 && height > 0, 'sim should have a nonzero area');
      dimensionProperty.value = new Dimension2(width, height);

      // Gracefully support bad dimensions, see https://github.com/phetsims/joist/issues/472
      if (width === 0 || height === 0) {
        return;
      }
      const scale = Math.min(width / HomeScreenView.LAYOUT_BOUNDS.width, height / HomeScreenView.LAYOUT_BOUNDS.height);

      // 40 px high on iPad Mobile Safari
      const navBarHeight = scale * NavigationBar.NAVIGATION_BAR_SIZE.height;
      this.navigationBar.layout(scale, width, navBarHeight);
      this.navigationBar.y = height - navBarHeight;
      this.display.setSize(new Dimension2(width, height));
      const screenHeight = height - this.navigationBar.height;
      if (this.toolbar) {
        this.toolbar.layout(scale, screenHeight);
      }

      // The available bounds for screens and top layer children - though currently provided
      // full width and height, will soon be reduced when menus (specifically the Preferences
      // Toolbar) takes up screen space.
      const screenMinX = this.toolbar ? this.toolbar.getDisplayedWidth() : 0;
      const availableScreenBounds = new Bounds2(screenMinX, 0, width, screenHeight);

      // Layout each of the screens
      _.each(this.screens, m => m.view.layout(availableScreenBounds));
      this.topLayer.children.forEach(child => {
        child.layout && child.layout(availableScreenBounds);
      });

      // Fixes problems where the div would be way off center on iOS7
      if (platform.mobileSafari) {
        window.scrollTo(0, 0);
      }

      // update our scale and bounds properties after other changes (so listeners can be fired after screens are resized)
      this.scaleProperty.value = scale;
      this.boundsProperty.value = new Bounds2(0, 0, width, height);
      this.screenBoundsProperty.value = availableScreenBounds.copy();

      // set the scale describing the target Node, since scale from window resize is applied to each ScreenView,
      // (children of the PanZoomListener targetNode)
      animatedPanZoomSingleton.listener.setTargetScale(scale);

      // set the bounds which accurately describe the panZoomListener targetNode, since it would otherwise be
      // inaccurate with the very large BarrierRectangle
      animatedPanZoomSingleton.listener.setTargetBounds(this.boundsProperty.value);

      // constrain the simulation pan bounds so that it cannot be moved off screen
      animatedPanZoomSingleton.listener.setPanBounds(this.boundsProperty.value);
    }, {
      tandem: Tandem.GENERAL_MODEL.createTandem('resizeAction'),
      parameters: [{
        name: 'width',
        phetioType: NumberIO
      }, {
        name: 'height',
        phetioType: NumberIO
      }],
      phetioPlayback: true,
      phetioEventMetadata: {
        // resizeAction needs to always be playbackable because it acts independently of any other playback event.
        // Because of its unique nature, it should be a "top-level" `playback: true` event so that it is never marked as
        // `playback: false`. There are cases where it is nested under another `playback: true` event, like when the
        // wrapper launches the simulation, that cannot be avoided. For this reason, we use this override.
        alwaysPlaybackableOverride: true
      },
      phetioDocumentation: 'Executes when the sim is resized. Values are the sim dimensions in CSS pixels.'
    });
    this.stepSimulationAction = new PhetioAction(dt => {
      this.frameStartedEmitter.emit();

      // increment this before we can have an exception thrown, to see if we are missing frames
      this.frameCounter++;

      // Apply time scale effects here before usage
      dt *= phet.chipper.queryParameters.speed;
      if (this.resizePending) {
        this.resizeToWindow();
      }

      // If the user is on the home screen, we won't have a Screen that we'll want to step.  This must be done after
      // fuzz mouse, because fuzzing could change the selected screen, see #130
      const screen = this.selectedScreenProperty.value;

      // cap dt based on the current screen, see https://github.com/phetsims/joist/issues/130
      dt = Math.min(dt, screen.maxDT);

      // TODO: we are /1000 just to *1000?  Seems wasteful and like opportunity for error. See https://github.com/phetsims/joist/issues/387
      // Store the elapsed time in milliseconds for usage by Tween clients
      phet.joist.elapsedTime += dt * 1000;

      // timer step before model/view steps, see https://github.com/phetsims/joist/issues/401
      // Note that this is vital to support Interactive Description and the utterance queue.
      stepTimer.emit(dt);

      // If the dt is 0, we will skip the model step (see https://github.com/phetsims/joist/issues/171)
      if (screen.model.step && dt) {
        screen.model.step(dt);
      }

      // If using the TWEEN animation library, then update tweens before rendering the scene.
      // Update the tweens after the model is updated but before the view step.
      // See https://github.com/phetsims/joist/issues/401.
      //TODO https://github.com/phetsims/joist/issues/404 run TWEENs for the selected screen only
      if (window.TWEEN) {
        window.TWEEN.update(phet.joist.elapsedTime);
      }
      this.display.step(dt);

      // View step is the last thing before updateDisplay(), so we can do paint updates there.
      // See https://github.com/phetsims/joist/issues/401.
      screen.view.step(dt);

      // Do not update the display while PhET-iO is customizing, or it could show the sim before it is fully ready for display.
      if (!(Tandem.PHET_IO_ENABLED && !phet.phetio.phetioEngine.isReadyForDisplay)) {
        this.display.updateDisplay();
      }
      if (phet.chipper.queryParameters.memoryLimit) {
        this.memoryMonitor.measure();
      }
      this.frameEndedEmitter.emit();
    }, {
      tandem: Tandem.GENERAL_MODEL.createTandem('stepSimulationAction'),
      parameters: [{
        name: 'dt',
        phetioType: NumberIO,
        phetioDocumentation: 'The amount of time stepped in each call, in seconds.'
      }],
      phetioHighFrequency: true,
      phetioPlayback: true,
      phetioDocumentation: 'A function that steps time forward.'
    });
    const screensTandem = Tandem.GENERAL_MODEL.createTandem('screens');
    const screenData = selectScreens(allSimScreens, phet.chipper.queryParameters.homeScreen, QueryStringMachine.containsKey('homeScreen'), phet.chipper.queryParameters.initialScreen, QueryStringMachine.containsKey('initialScreen'), phet.chipper.queryParameters.screens, QueryStringMachine.containsKey('screens'), selectedSimScreens => {
      const possibleScreenIndices = selectedSimScreens.map(screen => {
        return allSimScreens.indexOf(screen) + 1;
      });
      const validValues = _.flatten(Combination.combinationsOf(possibleScreenIndices).map(subset => Permutation.permutationsOf(subset))).filter(array => array.length > 0).sort();

      // Controls the subset (and order) of screens that appear to the user. Separate from the ?screens query parameter
      // for phet-io purposes. See https://github.com/phetsims/joist/issues/827
      this.availableScreensProperty = new Property(possibleScreenIndices, {
        tandem: screensTandem.createTandem('availableScreensProperty'),
        isValidValue: value => _.some(validValues, validValue => _.isEqual(value, validValue)),
        phetioFeatured: true,
        phetioValueType: ArrayIO(NumberIO),
        phetioDocumentation: 'Controls which screens are available, and the order they are displayed.'
      });
      this.activeSimScreensProperty = new DerivedProperty([this.availableScreensProperty], screenIndices => {
        return screenIndices.map(index => allSimScreens[index - 1]);
      });
    }, selectedSimScreens => {
      return new HomeScreen(this.simNameProperty, () => this.selectedScreenProperty, selectedSimScreens, this.activeSimScreensProperty, {
        tandem: options.tandem.createTandem(window.phetio.PhetioIDUtils.HOME_SCREEN_COMPONENT_NAME),
        warningNode: options.homeScreenWarningNode
      });
    });
    this.homeScreen = screenData.homeScreen;
    this.simScreens = screenData.selectedSimScreens;
    this.screens = screenData.screens;
    this.allScreensCreated = screenData.allScreensCreated;
    this.selectedScreenProperty = new Property(screenData.initialScreen, {
      tandem: screensTandem.createTandem('selectedScreenProperty'),
      phetioFeatured: true,
      phetioDocumentation: 'Determines which screen is selected in the simulation',
      validValues: this.screens,
      phetioValueType: Screen.ScreenIO
    });

    // If the activeSimScreens changes, we'll want to update what the active screen (or selected screen) is for specific
    // cases.
    this.activeSimScreensProperty.lazyLink(screens => {
      const screen = this.selectedScreenProperty.value;
      if (screen === this.homeScreen) {
        if (screens.length === 1) {
          // If we're on the home screen and it switches to a 1-screen sim, go to that screen
          this.selectedScreenProperty.value = screens[0];
        } else if (!screens.includes(this.homeScreen.model.selectedScreenProperty.value)) {
          // If we're on the home screen and our "selected" screen disappears, select the first sim screen
          this.homeScreen.model.selectedScreenProperty.value = screens[0];
        }
      } else if (!screens.includes(screen)) {
        // If we're on a screen that "disappears", go to the first screen
        this.selectedScreenProperty.value = screens[0];
      }
    });
    this.displayedSimNameProperty = new DerivedProperty([this.availableScreensProperty, this.simNameProperty, this.selectedScreenProperty, JoistStrings.simTitleWithScreenNamePatternStringProperty,
    // We just need notifications on any of these changing, return args as a unique value to make sure listeners fire.
    DerivedProperty.deriveAny(this.simScreens.map(screen => screen.nameProperty), (...args) => [...args])], (availableScreens, simName, selectedScreen, titleWithScreenPattern) => {
      const screenName = selectedScreen.nameProperty.value;
      const isMultiScreenSimDisplayingSingleScreen = availableScreens.length === 1 && allSimScreens.length > 1;

      // update the titleText based on values of the sim name and screen name
      if (isMultiScreenSimDisplayingSingleScreen && simName && screenName) {
        // If the 'screens' query parameter selects only 1 screen and both the sim and screen name are not the empty
        // string, then update the nav bar title to include a hyphen and the screen name after the sim name.
        return StringUtils.fillIn(titleWithScreenPattern, {
          simName: simName,
          screenName: screenName
        });
      } else if (isMultiScreenSimDisplayingSingleScreen && screenName) {
        return screenName;
      } else {
        return simName;
      }
    }, {
      tandem: Tandem.GENERAL_MODEL.createTandem('displayedSimNameProperty'),
      phetioFeatured: true,
      phetioValueType: StringIO,
      phetioDocumentation: 'Customize this string by editing its dependencies.'
    });

    // Local variable is settable...
    const browserTabVisibleProperty = new BooleanProperty(true, {
      tandem: Tandem.GENERAL_MODEL.createTandem('browserTabVisibleProperty'),
      phetioDocumentation: 'Indicates whether the browser tab containing the simulation is currently visible',
      phetioReadOnly: true,
      phetioFeatured: true
    });

    // ... but the public class attribute is read-only
    this.browserTabVisibleProperty = browserTabVisibleProperty;

    // set the state of the property that indicates if the browser tab is visible
    document.addEventListener('visibilitychange', () => {
      browserTabVisibleProperty.set(document.visibilityState === 'visible');
    }, false);
    assert && assert(window.phet.joist.launchCalled, 'Sim must be launched using simLauncher, ' + 'see https://github.com/phetsims/joist/issues/142');
    this.supportsGestureDescription = phet.chipper.queryParameters.supportsInteractiveDescription && SUPPORTS_GESTURE_DESCRIPTION;
    this.hasKeyboardHelpContent = _.some(this.simScreens, simScreen => !!simScreen.createKeyboardHelpNode);
    assert && assert(!window.phet.joist.sim, 'Only supports one sim at a time');
    window.phet.joist.sim = this;
    this.isSettingPhetioStateProperty = Tandem.PHET_IO_ENABLED ? phet.phetio.phetioEngine.phetioStateEngine.isSettingStateProperty : new BooleanProperty(false);
    this.isClearingPhetioDynamicElementsProperty = Tandem.PHET_IO_ENABLED ? phet.phetio.phetioEngine.phetioStateEngine.isClearingDynamicElementsProperty : new BooleanProperty(false);

    // commented out because https://github.com/phetsims/joist/issues/553 is deferred for after GQIO-oneone
    // if ( PHET_IO_ENABLED ) {
    //   this.engagementMetrics = new EngagementMetrics( this );
    // }

    this.preferencesModel = options.preferencesModel;

    // initialize audio and audio subcomponents
    audioManager.initialize(this);

    // hook up sound generation for screen changes
    if (this.preferencesModel.audioModel.supportsSound) {
      soundManager.addSoundGenerator(new ScreenSelectionSoundGenerator(this.selectedScreenProperty, this.homeScreen, {
        initialOutputLevel: 0.5
      }), {
        categoryName: 'user-interface'
      });
    }

    // Make ScreenshotGenerator available globally so it can be used in preload files such as PhET-iO.
    window.phet.joist.ScreenshotGenerator = ScreenshotGenerator;

    // If the locale query parameter was specified, then we may be running the all.html file, so adjust the title.
    // See https://github.com/phetsims/chipper/issues/510
    this.simNameProperty.link(simName => {
      $('title').html(simName);
    });

    // For now the Toolbar only includes controls for Voicing and is only constructed when that feature is supported.
    if (this.preferencesModel.audioModel.supportsVoicing) {
      this.toolbar = new Toolbar(this.preferencesModel.audioModel.toolbarEnabledProperty, this.selectedScreenProperty, this.lookAndFeel);

      // when the Toolbar positions update, resize the sim to fit in the available space
      this.toolbar.rightPositionProperty.lazyLink(() => {
        this.resize(this.boundsProperty.value.width, this.boundsProperty.value.height);
      });
    }
    this.display = new SimDisplay(simDisplayOptions);
    this.rootNode = this.display.rootNode;
    Helper.initialize(this, this.display);
    Multilink.multilink([this.activeProperty, phet.joist.playbackModeEnabledProperty], (active, playbackModeEnabled) => {
      // If in playbackMode is enabled, then the display must be interactive to support PDOM event listeners during
      // playback (which often come directly from sim code and not from user input).
      if (playbackModeEnabled) {
        this.display.interactive = true;
        globalKeyStateTracker.enabled = true;
      } else {
        // When the sim is inactive, make it non-interactive, see https://github.com/phetsims/scenery/issues/414
        this.display.interactive = active;
        globalKeyStateTracker.enabled = active;
      }
    });
    document.body.appendChild(this.display.domElement);
    Heartbeat.start(this);
    this.navigationBar = new NavigationBar(this, Tandem.GENERAL_VIEW.createTandem('navigationBar'));
    this.updateBackground = () => {
      this.lookAndFeel.backgroundColorProperty.value = Color.toColor(this.selectedScreenProperty.value.backgroundColorProperty.value);
    };
    this.lookAndFeel.backgroundColorProperty.link(backgroundColor => {
      this.display.backgroundColor = backgroundColor;
    });
    this.selectedScreenProperty.link(() => this.updateBackground());

    // When the user switches screens, interrupt the input on the previous screen.
    // See https://github.com/phetsims/scenery/issues/218
    this.selectedScreenProperty.lazyLink((newScreen, oldScreen) => oldScreen.view.interruptSubtreeInput());
    this.simInfo = new SimInfo(this);

    // Set up PhET-iO, must be done after phet.joist.sim is assigned
    Tandem.PHET_IO_ENABLED && phet.phetio.phetioEngine.onSimConstructionStarted(this.simInfo, this.isConstructionCompleteProperty, this.frameEndedEmitter, this.display);
    this.isSettingPhetioStateProperty.lazyLink(isSettingState => {
      if (!isSettingState) {
        this.updateViews();
      }
    });
    this.boundRunAnimationLoop = this.runAnimationLoop.bind(this);

    // Third party support
    phet.chipper.queryParameters.legendsOfLearning && new LegendsOfLearningSupport(this).start();
  }

  /**
   * Update the views of the sim. This is meant to run after the state has been set to make sure that all view
   * elements are in sync with the new, current state of the sim. (even when the sim is inactive, as in the state
   * wrapper).
   */
  updateViews() {
    // Trigger layout code
    this.resizeToWindow();
    this.selectedScreenProperty.value.view.step && this.selectedScreenProperty.value.view.step(0);

    // Clear all UtteranceQueue outputs that may have collected Utterances while state-setting logic occurred.
    // This is transient. https://github.com/phetsims/utterance-queue/issues/22 and https://github.com/phetsims/scenery/issues/1397
    this.display.descriptionUtteranceQueue.clear();
    voicingUtteranceQueue.clear();

    // Update the display asynchronously since it can trigger events on pointer validation, see https://github.com/phetsims/ph-scale/issues/212
    animationFrameTimer.runOnNextTick(() => phet.joist.display.updateDisplay());
  }
  finishInit(screens) {
    _.each(screens, screen => {
      screen.view.layerSplit = true;
      this.display.simulationRoot.addChild(screen.view);
    });
    this.display.simulationRoot.addChild(this.navigationBar);
    if (this.preferencesModel.audioModel.supportsVoicing) {
      assert && assert(this.toolbar, 'toolbar should exist for voicing');
      this.display.simulationRoot.addChild(this.toolbar);
      this.display.simulationRoot.pdomOrder = [this.toolbar];

      // If Voicing is not "fully" enabled, only the toolbar is able to produce Voicing output.
      // All other simulation components should not voice anything. This must be called only after
      // all ScreenViews have been constructed.
      voicingManager.voicingFullyEnabledProperty.link(fullyEnabled => {
        this.setSimVoicingVisible(fullyEnabled);
      });
    }
    this.selectedScreenProperty.link(currentScreen => {
      screens.forEach(screen => {
        const visible = screen === currentScreen;

        // Make the selected screen visible and active, other screens invisible and inactive.
        // screen.isActiveProperty should change only while the screen is invisible, https://github.com/phetsims/joist/issues/418
        if (visible) {
          screen.activeProperty.set(visible);
        }
        screen.view.setVisible(visible);
        if (!visible) {
          screen.activeProperty.set(visible);
        }
      });
      this.updateBackground();
      if (!this.isSettingPhetioStateProperty.value) {
        // Zoom out again after changing screens so we don't pan to the center of the focused ScreenView,
        // and so user has an overview of the new screen, see https://github.com/phetsims/joist/issues/682.
        animatedPanZoomSingleton.listener.resetTransform();
      }
    });
    this.display.simulationRoot.addChild(this.topLayer);

    // Fit to the window and render the initial scene
    // Can't synchronously do this in Firefox, see https://github.com/phetsims/vegas/issues/55 and
    // https://bugzilla.mozilla.org/show_bug.cgi?id=840412.
    const resizeListener = () => {
      // Don't resize on window size changes if we are playing back input events.
      // See https://github.com/phetsims/joist/issues/37
      if (!phet.joist.playbackModeEnabledProperty.value) {
        this.resizePending = true;
      }
    };
    $(window).resize(resizeListener);
    window.addEventListener('resize', resizeListener);
    window.addEventListener('orientationchange', resizeListener);
    window.visualViewport && window.visualViewport.addEventListener('resize', resizeListener);
    this.resizeToWindow();

    // Kick off checking for updates, if that is enabled
    updateCheck.check();

    // If there are warnings, show them in a dialog
    if (QueryStringMachine.warnings.length) {
      const warningDialog = new QueryParametersWarningDialog(QueryStringMachine.warnings, {
        closeButtonListener: () => {
          warningDialog.hide();
          warningDialog.dispose();
        }
      });
      warningDialog.show();
    }
  }

  /*
   * Adds a popup in the global coordinate frame. If the popup is model, it displays a semi-transparent black input
   * barrier behind it. A modal popup prevent the user from interacting with the reset of the application until the
   * popup is hidden. Use hidePopup() to hide the popup.
   * @param popup - the popup, must implemented node.hide(), called by hidePopup
   * @param isModal - whether popup is modal
   */
  showPopup(popup, isModal) {
    assert && assert(popup);
    assert && assert(!!popup.hide, 'Missing popup.hide() for showPopup');
    assert && assert(!this.topLayer.hasChild(popup), 'popup already shown');
    if (isModal) {
      this.rootNode.interruptSubtreeInput();
      this.modalNodeStack.push(popup);

      // pdom - modal dialogs should be the only readable content in the sim
      this.setPDOMViewsVisible(false);

      // voicing - responses from Nodes hidden by the modal dialog should not voice.
      this.setNonModalVoicingVisible(false);
    }
    if (popup.layout) {
      popup.layout(this.screenBoundsProperty.value);
    }
    this.topLayer.addChild(popup);
  }

  /*
   * Hides a popup that was previously displayed with showPopup()
   * @param popup
   * @param isModal - whether popup is modal
   */
  hidePopup(popup, isModal) {
    assert && assert(popup && this.modalNodeStack.includes(popup));
    assert && assert(this.topLayer.hasChild(popup), 'popup was not shown');
    if (isModal) {
      this.modalNodeStack.remove(popup);
      if (this.modalNodeStack.length === 0) {
        // After hiding all popups, Voicing becomes enabled for components in the simulation window only if
        // "Sim Voicing" switch is on.
        this.setNonModalVoicingVisible(voicingManager.voicingFullyEnabledProperty.value);

        // pdom - when the dialog is hidden, make all ScreenView content visible to assistive technology
        this.setPDOMViewsVisible(true);
      }
    }
    this.topLayer.removeChild(popup);
  }
  resizeToWindow() {
    this.resizePending = false;
    this.resize(window.innerWidth, window.innerHeight); // eslint-disable-line bad-sim-text
  }

  resize(width, height) {
    this.resizeAction.execute(width, height);
  }
  start() {
    // In order to animate the loading progress bar, we must schedule work with setTimeout
    // This array of {function} is the work that must be completed to launch the sim.
    const workItems = [];

    // Schedule instantiation of the screens
    this.screens.forEach(screen => {
      workItems.push(() => {
        // Screens may share the same instance of backgroundProperty, see joist#441
        if (!screen.backgroundColorProperty.hasListener(this.updateBackground)) {
          screen.backgroundColorProperty.link(this.updateBackground);
        }
        screen.initializeModel();
      });
      workItems.push(() => {
        screen.initializeView(this.simNameProperty, this.displayedSimNameProperty, this.screens.length, this.homeScreen === screen);
      });
    });

    // loop to run startup items asynchronously so the DOM can be updated to show animation on the progress bar
    const runItem = i => {
      setTimeout(
      // eslint-disable-line bad-sim-text
      () => {
        workItems[i]();

        // Move the progress ahead by one so we show the full progress bar for a moment before the sim starts up

        const progress = DotUtils.linear(0, workItems.length - 1, 0.25, 1.0, i);

        // Support iOS Reading Mode, which saves a DOM snapshot after the progressBarForeground has already been
        // removed from the document, see https://github.com/phetsims/joist/issues/389
        if (document.getElementById('progressBarForeground')) {
          // Grow the progress bar foreground to the right based on the progress so far.
          document.getElementById('progressBarForeground').setAttribute('width', `${progress * PROGRESS_BAR_WIDTH}`);
        }
        if (i + 1 < workItems.length) {
          runItem(i + 1);
        } else {
          setTimeout(() => {
            // eslint-disable-line bad-sim-text
            this.finishInit(this.screens);

            // Make sure requestAnimationFrame is defined
            Utils.polyfillRequestAnimationFrame();

            // Option for profiling
            // if true, prints screen initialization time (total, model, view) to the console and displays
            // profiling information on the screen
            if (phet.chipper.queryParameters.profiler) {
              Profiler.start(this);
            }

            // Notify listeners that all models and views have been constructed, and the Sim is ready to be shown.
            // Used by PhET-iO. This does not coincide with the end of the Sim constructor (because Sim has
            // asynchronous steps that finish after the constructor is completed )
            this._isConstructionCompleteProperty.value = true;

            // place the requestAnimationFrame *before* rendering to assure as close to 60fps with the setTimeout fallback.
            // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
            // Launch the bound version so it can easily be swapped out for debugging.
            // Schedules animation updates and runs the first step()
            this.boundRunAnimationLoop();

            // If the sim is in playback mode, then flush the timer's listeners. This makes sure that anything kicked
            // to the next frame with `timer.runOnNextTick` during startup (like every notification about a PhET-iO
            // instrumented element in phetioEngine.phetioObjectAdded()) can clear out before beginning playback.
            if (phet.joist.playbackModeEnabledProperty.value) {
              let beforeCounts = null;
              if (assert) {
                beforeCounts = Array.from(Random.allRandomInstances).map(n => n.numberOfCalls);
              }
              stepTimer.emit(0);
              if (assert) {
                const afterCounts = Array.from(Random.allRandomInstances).map(n => n.numberOfCalls);
                assert && assert(_.isEqual(beforeCounts, afterCounts), `Random was called more times in the playback sim on startup, before: ${beforeCounts}, after: ${afterCounts}`);
              }
            }

            // After the application is ready to go, remove the splash screen and progress bar.  Note the splash
            // screen is removed after one step(), so the rendering is ready to go when the progress bar is hidden.
            // no-op otherwise and will be disposed by phetioEngine.
            if (!Tandem.PHET_IO_ENABLED || phet.preloads.phetio.queryParameters.phetioStandalone) {
              window.phetSplashScreen.dispose();
            }
            // Sanity check that there is no phetio object in phet brand, see https://github.com/phetsims/phet-io/issues/1229
            phet.chipper.brand === 'phet' && assert && assert(!Tandem.PHET_IO_ENABLED, 'window.phet.preloads.phetio should not exist for phet brand');

            // Communicate sim load (successfully) to joist/tests/test-sims.html
            if (phet.chipper.queryParameters.continuousTest) {
              phet.chipper.reportContinuousTestResult({
                type: 'continuous-test-load'
              });
            }
            if (phet.chipper.queryParameters.postMessageOnLoad) {
              window.parent && window.parent.postMessage(JSON.stringify({
                type: 'load',
                url: window.location.href
              }), '*');
            }
          }, 25); // pause for a few milliseconds with the progress bar filled in before going to the home screen
        }
      },
      // The following sets the amount of delay between each work item to make it easier to see the changes to the
      // progress bar.  A total value is divided by the number of work items.  This makes it possible to see the
      // progress bar when few work items exist, such as for a single screen sim, but allows things to move
      // reasonably quickly when more work items exist, such as for a four-screen sim.
      30 / workItems.length);
    };
    runItem(0);
  }

  // Bound to this.boundRunAnimationLoop so it can be run in window.requestAnimationFrame
  runAnimationLoop() {
    window.requestAnimationFrame(this.boundRunAnimationLoop);

    // Only run animation frames for an active sim. If in playbackMode, playback logic will handle animation frame
    // stepping manually.
    if (this.activeProperty.value && !phet.joist.playbackModeEnabledProperty.value) {
      // Handle Input fuzzing before stepping the sim because input events occur outside of sim steps, but not before the
      // first sim step (to prevent issues like https://github.com/phetsims/equality-explorer/issues/161).
      this.frameCounter > 0 && this.display.fuzzInputEvents();
      this.stepOneFrame();
    }

    // The animation frame timer runs every frame
    const currentTime = Date.now();
    animationFrameTimer.emit(getDT(this.lastAnimationFrameTime, currentTime));
    this.lastAnimationFrameTime = currentTime;
    if (Tandem.PHET_IO_ENABLED) {
      // PhET-iO batches messages to be sent to other frames, messages must be sent whether the sim is active or not
      phet.phetio.phetioCommandProcessor.onAnimationLoop(this);
    }
  }

  // Run a single frame including model, view and display updates, used by Legends of Learning
  stepOneFrame() {
    // Compute the elapsed time since the last frame, or guess 1/60th of a second if it is the first frame
    const currentTime = Date.now();
    const dt = getDT(this.lastStepTime, currentTime);
    this.lastStepTime = currentTime;

    // Don't run the simulation on steps back in time (see https://github.com/phetsims/joist/issues/409)
    if (dt > 0) {
      this.stepSimulation(dt);
    }
  }

  /**
   * Update the simulation model, view, scenery display with an elapsed time of dt.
   * @param dt - in seconds
   * (phet-io)
   */
  stepSimulation(dt) {
    this.stepSimulationAction.execute(dt);
  }

  /**
   * Hide or show all accessible content related to the sim ScreenViews, and navigation bar. This content will
   * remain visible, but not be tab navigable or readable with a screen reader. This is generally useful when
   * displaying a pop up or modal dialog.
   */
  setPDOMViewsVisible(visible) {
    for (let i = 0; i < this.screens.length; i++) {
      this.screens[i].view.pdomVisible = visible;
    }
    this.navigationBar.pdomVisible = visible;
    this.homeScreen && this.homeScreen.view.setPDOMVisible(visible);
    this.toolbar && this.toolbar.setPDOMVisible(visible);
  }

  /**
   * Set the voicingVisible state of simulation components. When false, ONLY the Toolbar
   * and its buttons will be able to announce Voicing utterances. This is used by the
   * "Sim Voicing" switch in the toolbar which will disable all Voicing in the sim so that
   * only Toolbar content is announced.
   */
  setSimVoicingVisible(visible) {
    this.setNonModalVoicingVisible(visible);
    this.topLayer && this.topLayer.setVoicingVisible(visible);
  }

  /**
   * Sets voicingVisible on all elements "behind" the modal node stack. In this case, voicing should not work for those
   * components when set to false.
   * @param visible
   */
  setNonModalVoicingVisible(visible) {
    for (let i = 0; i < this.screens.length; i++) {
      this.screens[i].view.voicingVisible = visible; // home screen is the first item, if created
    }

    this.navigationBar.voicingVisible = visible;
  }
}

// This Node supports children that have layout.

/**
 * Compute the dt since the last event
 * @param lastTime - milliseconds, time of the last event
 * @param currentTime - milliseconds, current time.  Passed in instead of computed so there is no "slack" between measurements
 */
function getDT(lastTime, currentTime) {
  // Compute the elapsed time since the last frame, or guess 1/60th of a second if it is the first frame
  return lastTime === -1 ? 1 / 60 : (currentTime - lastTime) / 1000.0;
}
joist.register('Sim', Sim);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhbmltYXRpb25GcmFtZVRpbWVyIiwiQm9vbGVhblByb3BlcnR5IiwiY3JlYXRlT2JzZXJ2YWJsZUFycmF5IiwiRGVyaXZlZFByb3BlcnR5IiwiRW1pdHRlciIsIk51bWJlclByb3BlcnR5IiwiUHJvcGVydHkiLCJzdGVwVGltZXIiLCJCb3VuZHMyIiwiRGltZW5zaW9uMiIsIlJhbmRvbSIsIkRvdFV0aWxzIiwicGxhdGZvcm0iLCJvcHRpb25pemUiLCJTdHJpbmdVdGlscyIsIkJhcnJpZXJSZWN0YW5nbGUiLCJhbmltYXRlZFBhblpvb21TaW5nbGV0b24iLCJDb2xvciIsImdsb2JhbEtleVN0YXRlVHJhY2tlciIsIk5vZGUiLCJVdGlscyIsInZvaWNpbmdNYW5hZ2VyIiwidm9pY2luZ1V0dGVyYW5jZVF1ZXVlIiwic291bmRNYW5hZ2VyIiwiUGhldGlvQWN0aW9uIiwiUGhldGlvT2JqZWN0IiwiVGFuZGVtIiwiTnVtYmVySU8iLCJhdWRpb01hbmFnZXIiLCJIZWFydGJlYXQiLCJIZWxwZXIiLCJIb21lU2NyZWVuIiwiSG9tZVNjcmVlblZpZXciLCJqb2lzdCIsIkpvaXN0U3RyaW5ncyIsIkxvb2tBbmRGZWVsIiwiTWVtb3J5TW9uaXRvciIsIk5hdmlnYXRpb25CYXIiLCJwYWNrYWdlSlNPTiIsIlByZWZlcmVuY2VzTW9kZWwiLCJQcm9maWxlciIsIlF1ZXJ5UGFyYW1ldGVyc1dhcm5pbmdEaWFsb2ciLCJTY3JlZW4iLCJTY3JlZW5TZWxlY3Rpb25Tb3VuZEdlbmVyYXRvciIsIlNjcmVlbnNob3RHZW5lcmF0b3IiLCJzZWxlY3RTY3JlZW5zIiwiU2ltRGlzcGxheSIsIlNpbUluZm8iLCJMZWdlbmRzT2ZMZWFybmluZ1N1cHBvcnQiLCJUb29sYmFyIiwidXBkYXRlQ2hlY2siLCJNdWx0aWxpbmsiLCJDb21iaW5hdGlvbiIsIlBlcm11dGF0aW9uIiwiQXJyYXlJTyIsIlN0cmluZ0lPIiwiUFJPR1JFU1NfQkFSX1dJRFRIIiwiU1VQUE9SVFNfR0VTVFVSRV9ERVNDUklQVElPTiIsImFuZHJvaWQiLCJtb2JpbGVTYWZhcmkiLCJwaGV0IiwiZWxhcHNlZFRpbWUiLCJwbGF5YmFja01vZGVFbmFibGVkUHJvcGVydHkiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwicGxheWJhY2tNb2RlIiwiYXNzZXJ0IiwiYnJhbmQiLCJTaW0iLCJfaXNDb25zdHJ1Y3Rpb25Db21wbGV0ZVByb3BlcnR5IiwiaXNDb25zdHJ1Y3Rpb25Db21wbGV0ZVByb3BlcnR5IiwiZnJhbWVTdGFydGVkRW1pdHRlciIsImZyYW1lRW5kZWRFbWl0dGVyIiwidGFuZGVtIiwiR0VORVJBTF9NT0RFTCIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0hpZ2hGcmVxdWVuY3kiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiYWN0aXZlUHJvcGVydHkiLCJwaGV0aW9GZWF0dXJlZCIsInNjYWxlUHJvcGVydHkiLCJib3VuZHNQcm9wZXJ0eSIsInNjcmVlbkJvdW5kc1Byb3BlcnR5IiwibG9va0FuZEZlZWwiLCJtZW1vcnlNb25pdG9yIiwidmVyc2lvbiIsImZyYW1lQ291bnRlciIsInJlc2l6ZVBlbmRpbmciLCJsb2NhbGUiLCJ0b29sYmFyIiwibW9kYWxOb2RlU3RhY2siLCJiYXJyaWVyUmVjdGFuZ2xlIiwidG9wTGF5ZXIiLCJjaGlsZHJlbiIsImxhc3RTdGVwVGltZSIsImxhc3RBbmltYXRpb25GcmFtZVRpbWUiLCJjb25zdHJ1Y3RvciIsInNpbU5hbWVQcm9wZXJ0eSIsImFsbFNpbVNjcmVlbnMiLCJwcm92aWRlZE9wdGlvbnMiLCJ3aW5kb3ciLCJwaGV0U3BsYXNoU2NyZWVuRG93bmxvYWRDb21wbGV0ZSIsImxlbmd0aCIsIm9wdGlvbnMiLCJjcmVkaXRzIiwiaG9tZVNjcmVlbldhcm5pbmdOb2RlIiwicHJlZmVyZW5jZXNNb2RlbCIsIndlYmdsIiwiREVGQVVMVF9XRUJHTCIsInBoZXRpb1N0YXRlIiwicGhldGlvUmVhZE9ubHkiLCJST09UIiwic2ltRGlzcGxheU9wdGlvbnMiLCJHRU5FUkFMX1ZJRVciLCJsYXp5TGluayIsIkVycm9yIiwiaXNDb25zdHJ1Y3Rpb25Db21wbGV0ZSIsImRpbWVuc2lvblByb3BlcnR5IiwidmFsdWVDb21wYXJpc29uU3RyYXRlZ3kiLCJyZXNpemVBY3Rpb24iLCJ3aWR0aCIsImhlaWdodCIsInZhbHVlIiwic2NhbGUiLCJNYXRoIiwibWluIiwiTEFZT1VUX0JPVU5EUyIsIm5hdkJhckhlaWdodCIsIk5BVklHQVRJT05fQkFSX1NJWkUiLCJuYXZpZ2F0aW9uQmFyIiwibGF5b3V0IiwieSIsImRpc3BsYXkiLCJzZXRTaXplIiwic2NyZWVuSGVpZ2h0Iiwic2NyZWVuTWluWCIsImdldERpc3BsYXllZFdpZHRoIiwiYXZhaWxhYmxlU2NyZWVuQm91bmRzIiwiXyIsImVhY2giLCJzY3JlZW5zIiwibSIsInZpZXciLCJmb3JFYWNoIiwiY2hpbGQiLCJzY3JvbGxUbyIsImNvcHkiLCJsaXN0ZW5lciIsInNldFRhcmdldFNjYWxlIiwic2V0VGFyZ2V0Qm91bmRzIiwic2V0UGFuQm91bmRzIiwicGFyYW1ldGVycyIsIm5hbWUiLCJwaGV0aW9UeXBlIiwicGhldGlvUGxheWJhY2siLCJwaGV0aW9FdmVudE1ldGFkYXRhIiwiYWx3YXlzUGxheWJhY2thYmxlT3ZlcnJpZGUiLCJzdGVwU2ltdWxhdGlvbkFjdGlvbiIsImR0IiwiZW1pdCIsInNwZWVkIiwicmVzaXplVG9XaW5kb3ciLCJzY3JlZW4iLCJzZWxlY3RlZFNjcmVlblByb3BlcnR5IiwibWF4RFQiLCJtb2RlbCIsInN0ZXAiLCJUV0VFTiIsInVwZGF0ZSIsIlBIRVRfSU9fRU5BQkxFRCIsInBoZXRpbyIsInBoZXRpb0VuZ2luZSIsImlzUmVhZHlGb3JEaXNwbGF5IiwidXBkYXRlRGlzcGxheSIsIm1lbW9yeUxpbWl0IiwibWVhc3VyZSIsInNjcmVlbnNUYW5kZW0iLCJzY3JlZW5EYXRhIiwiaG9tZVNjcmVlbiIsIlF1ZXJ5U3RyaW5nTWFjaGluZSIsImNvbnRhaW5zS2V5IiwiaW5pdGlhbFNjcmVlbiIsInNlbGVjdGVkU2ltU2NyZWVucyIsInBvc3NpYmxlU2NyZWVuSW5kaWNlcyIsIm1hcCIsImluZGV4T2YiLCJ2YWxpZFZhbHVlcyIsImZsYXR0ZW4iLCJjb21iaW5hdGlvbnNPZiIsInN1YnNldCIsInBlcm11dGF0aW9uc09mIiwiZmlsdGVyIiwiYXJyYXkiLCJzb3J0IiwiYXZhaWxhYmxlU2NyZWVuc1Byb3BlcnR5IiwiaXNWYWxpZFZhbHVlIiwic29tZSIsInZhbGlkVmFsdWUiLCJpc0VxdWFsIiwicGhldGlvVmFsdWVUeXBlIiwiYWN0aXZlU2ltU2NyZWVuc1Byb3BlcnR5Iiwic2NyZWVuSW5kaWNlcyIsImluZGV4IiwiUGhldGlvSURVdGlscyIsIkhPTUVfU0NSRUVOX0NPTVBPTkVOVF9OQU1FIiwid2FybmluZ05vZGUiLCJzaW1TY3JlZW5zIiwiYWxsU2NyZWVuc0NyZWF0ZWQiLCJTY3JlZW5JTyIsImluY2x1ZGVzIiwiZGlzcGxheWVkU2ltTmFtZVByb3BlcnR5Iiwic2ltVGl0bGVXaXRoU2NyZWVuTmFtZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsImRlcml2ZUFueSIsIm5hbWVQcm9wZXJ0eSIsImFyZ3MiLCJhdmFpbGFibGVTY3JlZW5zIiwic2ltTmFtZSIsInNlbGVjdGVkU2NyZWVuIiwidGl0bGVXaXRoU2NyZWVuUGF0dGVybiIsInNjcmVlbk5hbWUiLCJpc011bHRpU2NyZWVuU2ltRGlzcGxheWluZ1NpbmdsZVNjcmVlbiIsImZpbGxJbiIsImJyb3dzZXJUYWJWaXNpYmxlUHJvcGVydHkiLCJkb2N1bWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJzZXQiLCJ2aXNpYmlsaXR5U3RhdGUiLCJsYXVuY2hDYWxsZWQiLCJzdXBwb3J0c0dlc3R1cmVEZXNjcmlwdGlvbiIsInN1cHBvcnRzSW50ZXJhY3RpdmVEZXNjcmlwdGlvbiIsImhhc0tleWJvYXJkSGVscENvbnRlbnQiLCJzaW1TY3JlZW4iLCJjcmVhdGVLZXlib2FyZEhlbHBOb2RlIiwic2ltIiwiaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSIsInBoZXRpb1N0YXRlRW5naW5lIiwiaXNTZXR0aW5nU3RhdGVQcm9wZXJ0eSIsImlzQ2xlYXJpbmdQaGV0aW9EeW5hbWljRWxlbWVudHNQcm9wZXJ0eSIsImlzQ2xlYXJpbmdEeW5hbWljRWxlbWVudHNQcm9wZXJ0eSIsImluaXRpYWxpemUiLCJhdWRpb01vZGVsIiwic3VwcG9ydHNTb3VuZCIsImFkZFNvdW5kR2VuZXJhdG9yIiwiaW5pdGlhbE91dHB1dExldmVsIiwiY2F0ZWdvcnlOYW1lIiwibGluayIsIiQiLCJodG1sIiwic3VwcG9ydHNWb2ljaW5nIiwidG9vbGJhckVuYWJsZWRQcm9wZXJ0eSIsInJpZ2h0UG9zaXRpb25Qcm9wZXJ0eSIsInJlc2l6ZSIsInJvb3ROb2RlIiwibXVsdGlsaW5rIiwiYWN0aXZlIiwicGxheWJhY2tNb2RlRW5hYmxlZCIsImludGVyYWN0aXZlIiwiZW5hYmxlZCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsImRvbUVsZW1lbnQiLCJzdGFydCIsInVwZGF0ZUJhY2tncm91bmQiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsInRvQ29sb3IiLCJiYWNrZ3JvdW5kQ29sb3IiLCJuZXdTY3JlZW4iLCJvbGRTY3JlZW4iLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJzaW1JbmZvIiwib25TaW1Db25zdHJ1Y3Rpb25TdGFydGVkIiwiaXNTZXR0aW5nU3RhdGUiLCJ1cGRhdGVWaWV3cyIsImJvdW5kUnVuQW5pbWF0aW9uTG9vcCIsInJ1bkFuaW1hdGlvbkxvb3AiLCJiaW5kIiwibGVnZW5kc09mTGVhcm5pbmciLCJkZXNjcmlwdGlvblV0dGVyYW5jZVF1ZXVlIiwiY2xlYXIiLCJydW5Pbk5leHRUaWNrIiwiZmluaXNoSW5pdCIsImxheWVyU3BsaXQiLCJzaW11bGF0aW9uUm9vdCIsImFkZENoaWxkIiwicGRvbU9yZGVyIiwidm9pY2luZ0Z1bGx5RW5hYmxlZFByb3BlcnR5IiwiZnVsbHlFbmFibGVkIiwic2V0U2ltVm9pY2luZ1Zpc2libGUiLCJjdXJyZW50U2NyZWVuIiwidmlzaWJsZSIsInNldFZpc2libGUiLCJyZXNldFRyYW5zZm9ybSIsInJlc2l6ZUxpc3RlbmVyIiwidmlzdWFsVmlld3BvcnQiLCJjaGVjayIsIndhcm5pbmdzIiwid2FybmluZ0RpYWxvZyIsImNsb3NlQnV0dG9uTGlzdGVuZXIiLCJoaWRlIiwiZGlzcG9zZSIsInNob3ciLCJzaG93UG9wdXAiLCJwb3B1cCIsImlzTW9kYWwiLCJoYXNDaGlsZCIsInB1c2giLCJzZXRQRE9NVmlld3NWaXNpYmxlIiwic2V0Tm9uTW9kYWxWb2ljaW5nVmlzaWJsZSIsImhpZGVQb3B1cCIsInJlbW92ZSIsInJlbW92ZUNoaWxkIiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwiZXhlY3V0ZSIsIndvcmtJdGVtcyIsImhhc0xpc3RlbmVyIiwiaW5pdGlhbGl6ZU1vZGVsIiwiaW5pdGlhbGl6ZVZpZXciLCJydW5JdGVtIiwiaSIsInNldFRpbWVvdXQiLCJwcm9ncmVzcyIsImxpbmVhciIsImdldEVsZW1lbnRCeUlkIiwic2V0QXR0cmlidXRlIiwicG9seWZpbGxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJwcm9maWxlciIsImJlZm9yZUNvdW50cyIsIkFycmF5IiwiZnJvbSIsImFsbFJhbmRvbUluc3RhbmNlcyIsIm4iLCJudW1iZXJPZkNhbGxzIiwiYWZ0ZXJDb3VudHMiLCJwcmVsb2FkcyIsInBoZXRpb1N0YW5kYWxvbmUiLCJwaGV0U3BsYXNoU2NyZWVuIiwiY29udGludW91c1Rlc3QiLCJyZXBvcnRDb250aW51b3VzVGVzdFJlc3VsdCIsInR5cGUiLCJwb3N0TWVzc2FnZU9uTG9hZCIsInBhcmVudCIsInBvc3RNZXNzYWdlIiwiSlNPTiIsInN0cmluZ2lmeSIsInVybCIsImxvY2F0aW9uIiwiaHJlZiIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsImZ1enpJbnB1dEV2ZW50cyIsInN0ZXBPbmVGcmFtZSIsImN1cnJlbnRUaW1lIiwiRGF0ZSIsIm5vdyIsImdldERUIiwicGhldGlvQ29tbWFuZFByb2Nlc3NvciIsIm9uQW5pbWF0aW9uTG9vcCIsInN0ZXBTaW11bGF0aW9uIiwicGRvbVZpc2libGUiLCJzZXRQRE9NVmlzaWJsZSIsInNldFZvaWNpbmdWaXNpYmxlIiwidm9pY2luZ1Zpc2libGUiLCJsYXN0VGltZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2ltLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1haW4gY2xhc3MgdGhhdCByZXByZXNlbnRzIG9uZSBzaW11bGF0aW9uLlxyXG4gKiBQcm92aWRlcyBkZWZhdWx0IGluaXRpYWxpemF0aW9uLCBzdWNoIGFzIHBvbHlmaWxscyBhcyB3ZWxsLlxyXG4gKiBJZiB0aGUgc2ltdWxhdGlvbiBoYXMgb25seSBvbmUgc2NyZWVuLCB0aGVuIHRoZXJlIGlzIG5vIGhvbWVzY3JlZW4sIGhvbWUgaWNvbiBvciBzY3JlZW4gaWNvbiBpbiB0aGUgbmF2aWdhdGlvbiBiYXIuXHJcbiAqXHJcbiAqIFRoZSB0eXBlIGZvciB0aGUgY29udGFpbmVkIFNjcmVlbiBpbnN0YW5jZXMgaXMgU2NyZWVuPGFueSxhbnk+IHNpbmNlIHdlIGRvIG5vdCB3YW50IHRvIHBhcmFtZXRlcml6ZSBTaW08W3tNMSxWMX0se00yLFYyfV1cclxuICogZXRjLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IGFuaW1hdGlvbkZyYW1lVGltZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9hbmltYXRpb25GcmFtZVRpbWVyLmpzJztcclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBzdGVwVGltZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9zdGVwVGltZXIuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFJhbmRvbSBmcm9tICcuLi8uLi9kb3QvanMvUmFuZG9tLmpzJztcclxuaW1wb3J0IERvdFV0aWxzIGZyb20gJy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZGVmYXVsdC1pbXBvcnQtbWF0Y2gtZmlsZW5hbWVcclxuaW1wb3J0IHBsYXRmb3JtIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9wbGF0Zm9ybS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgQmFycmllclJlY3RhbmdsZSBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvQmFycmllclJlY3RhbmdsZS5qcyc7XHJcbmltcG9ydCB7IGFuaW1hdGVkUGFuWm9vbVNpbmdsZXRvbiwgQ29sb3IsIGdsb2JhbEtleVN0YXRlVHJhY2tlciwgTm9kZSwgVXRpbHMsIHZvaWNpbmdNYW5hZ2VyLCB2b2ljaW5nVXR0ZXJhbmNlUXVldWUgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgJy4uLy4uL3NoZXJwYS9saWIvZ2FtZS11cC1jYW1lcmEtMS4wLjAuanMnO1xyXG5pbXBvcnQgc291bmRNYW5hZ2VyIGZyb20gJy4uLy4uL3RhbWJvL2pzL3NvdW5kTWFuYWdlci5qcyc7XHJcbmltcG9ydCBQaGV0aW9BY3Rpb24gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1BoZXRpb0FjdGlvbi5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QsIHsgUGhldGlvT2JqZWN0T3B0aW9ucyB9IGZyb20gJy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcclxuaW1wb3J0IGF1ZGlvTWFuYWdlciBmcm9tICcuL2F1ZGlvTWFuYWdlci5qcyc7XHJcbmltcG9ydCBIZWFydGJlYXQgZnJvbSAnLi9IZWFydGJlYXQuanMnO1xyXG5pbXBvcnQgSGVscGVyIGZyb20gJy4vSGVscGVyLmpzJztcclxuaW1wb3J0IEhvbWVTY3JlZW4gZnJvbSAnLi9Ib21lU2NyZWVuLmpzJztcclxuaW1wb3J0IEhvbWVTY3JlZW5WaWV3IGZyb20gJy4vSG9tZVNjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgam9pc3QgZnJvbSAnLi9qb2lzdC5qcyc7XHJcbmltcG9ydCBKb2lzdFN0cmluZ3MgZnJvbSAnLi9Kb2lzdFN0cmluZ3MuanMnO1xyXG5pbXBvcnQgTG9va0FuZEZlZWwgZnJvbSAnLi9Mb29rQW5kRmVlbC5qcyc7XHJcbmltcG9ydCBNZW1vcnlNb25pdG9yIGZyb20gJy4vTWVtb3J5TW9uaXRvci5qcyc7XHJcbmltcG9ydCBOYXZpZ2F0aW9uQmFyIGZyb20gJy4vTmF2aWdhdGlvbkJhci5qcyc7XHJcbmltcG9ydCBwYWNrYWdlSlNPTiBmcm9tICcuL3BhY2thZ2VKU09OLmpzJztcclxuaW1wb3J0IFByZWZlcmVuY2VzTW9kZWwgZnJvbSAnLi9wcmVmZXJlbmNlcy9QcmVmZXJlbmNlc01vZGVsLmpzJztcclxuaW1wb3J0IFByb2ZpbGVyIGZyb20gJy4vUHJvZmlsZXIuanMnO1xyXG5pbXBvcnQgUXVlcnlQYXJhbWV0ZXJzV2FybmluZ0RpYWxvZyBmcm9tICcuL1F1ZXJ5UGFyYW1ldGVyc1dhcm5pbmdEaWFsb2cuanMnO1xyXG5pbXBvcnQgU2NyZWVuLCB7IEFueVNjcmVlbiB9IGZyb20gJy4vU2NyZWVuLmpzJztcclxuaW1wb3J0IFNjcmVlblNlbGVjdGlvblNvdW5kR2VuZXJhdG9yIGZyb20gJy4vU2NyZWVuU2VsZWN0aW9uU291bmRHZW5lcmF0b3IuanMnO1xyXG5pbXBvcnQgU2NyZWVuc2hvdEdlbmVyYXRvciBmcm9tICcuL1NjcmVlbnNob3RHZW5lcmF0b3IuanMnO1xyXG5pbXBvcnQgc2VsZWN0U2NyZWVucyBmcm9tICcuL3NlbGVjdFNjcmVlbnMuanMnO1xyXG5pbXBvcnQgU2ltRGlzcGxheSBmcm9tICcuL1NpbURpc3BsYXkuanMnO1xyXG5pbXBvcnQgU2ltSW5mbyBmcm9tICcuL1NpbUluZm8uanMnO1xyXG5pbXBvcnQgTGVnZW5kc09mTGVhcm5pbmdTdXBwb3J0IGZyb20gJy4vdGhpcmRQYXJ0eVN1cHBvcnQvTGVnZW5kc09mTGVhcm5pbmdTdXBwb3J0LmpzJztcclxuaW1wb3J0IFRvb2xiYXIgZnJvbSAnLi90b29sYmFyL1Rvb2xiYXIuanMnO1xyXG5pbXBvcnQgdXBkYXRlQ2hlY2sgZnJvbSAnLi91cGRhdGVDaGVjay5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IHsgQ3JlZGl0c0RhdGEgfSBmcm9tICcuL0NyZWRpdHNOb2RlLmpzJztcclxuaW1wb3J0IHsgUG9wdXBhYmxlTm9kZSB9IGZyb20gJy4uLy4uL3N1bi9qcy9Qb3B1cGFibGUuanMnO1xyXG5pbXBvcnQgUGlja09wdGlvbmFsIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrT3B0aW9uYWwuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9SZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IENvbWJpbmF0aW9uIGZyb20gJy4uLy4uL2RvdC9qcy9Db21iaW5hdGlvbi5qcyc7XHJcbmltcG9ydCBQZXJtdXRhdGlvbiBmcm9tICcuLi8uLi9kb3QvanMvUGVybXV0YXRpb24uanMnO1xyXG5pbXBvcnQgQXJyYXlJTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvQXJyYXlJTy5qcyc7XHJcbmltcG9ydCBTdHJpbmdJTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvU3RyaW5nSU8uanMnO1xyXG5pbXBvcnQgeyBMb2NhbGUgfSBmcm9tICcuL2kxOG4vbG9jYWxlUHJvcGVydHkuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFBST0dSRVNTX0JBUl9XSURUSCA9IDI3MztcclxuY29uc3QgU1VQUE9SVFNfR0VTVFVSRV9ERVNDUklQVElPTiA9IHBsYXRmb3JtLmFuZHJvaWQgfHwgcGxhdGZvcm0ubW9iaWxlU2FmYXJpO1xyXG5cclxuLy8gZ2xvYmFsc1xyXG5waGV0LmpvaXN0LmVsYXBzZWRUaW1lID0gMDsgLy8gaW4gbWlsbGlzZWNvbmRzLCB1c2UgdGhpcyBpbiBUd2Vlbi5zdGFydCBmb3IgcmVwbGljYWJsZSBwbGF5YmFja3NcclxuXHJcbi8vIFdoZW4gdGhlIHNpbXVsYXRpb24gaXMgZ29pbmcgdG8gYmUgdXNlZCB0byBwbGF5IGJhY2sgYSByZWNvcmRlZCBzZXNzaW9uLCB0aGUgc2ltdWxhdGlvbiBtdXN0IGJlIHB1dCBpbnRvIGEgc3BlY2lhbFxyXG4vLyBtb2RlIGluIHdoaWNoIGl0IHdpbGwgb25seSB1cGRhdGUgdGhlIG1vZGVsICsgdmlldyBiYXNlZCBvbiB0aGUgcGxheWJhY2sgY2xvY2sgZXZlbnRzIHJhdGhlciB0aGFuIHRoZSBzeXN0ZW0gY2xvY2suXHJcbi8vIFRoaXMgbXVzdCBiZSBzZXQgYmVmb3JlIHRoZSBzaW11bGF0aW9uIGlzIGxhdW5jaGVkIGluIG9yZGVyIHRvIGVuc3VyZSB0aGF0IG5vIGVycmFudCBzdGVwU2ltdWxhdGlvbiBzdGVwcyBhcmUgY2FsbGVkXHJcbi8vIGJlZm9yZSB0aGUgcGxheWJhY2sgZXZlbnRzIGJlZ2luLiAgVGhpcyB2YWx1ZSBpcyBvdmVycmlkZGVuIGZvciBwbGF5YmFjayBieSBQaGV0aW9FbmdpbmVJTy5cclxuLy8gKHBoZXQtaW8pXHJcbnBoZXQuam9pc3QucGxheWJhY2tNb2RlRW5hYmxlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5wbGF5YmFja01vZGUgKTtcclxuXHJcbmFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBwaGV0LmNoaXBwZXIuYnJhbmQgPT09ICdzdHJpbmcnLCAncGhldC5jaGlwcGVyLmJyYW5kIGlzIHJlcXVpcmVkIHRvIHJ1biBhIHNpbScgKTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIGNyZWRpdHM/OiBDcmVkaXRzRGF0YTtcclxuXHJcbiAgLy8gYSB7Tm9kZX0gcGxhY2VkIG9udG8gdGhlIGhvbWUgc2NyZWVuIChpZiBhdmFpbGFibGUpXHJcbiAgaG9tZVNjcmVlbldhcm5pbmdOb2RlPzogbnVsbCB8IE5vZGU7XHJcblxyXG4gIC8vIFRoZSBQcmVmZXJlbmNlc01vZGVsIGRlZmluZXMgdGhlIGF2YWlsYWJsZSBmZWF0dXJlcyBmb3IgdGhlIHNpbXVsYXRpb24gdGhhdCBhcmUgY29udHJvbGxhYmxlXHJcbiAgLy8gdGhyb3VnaCB0aGUgUHJlZmVyZW5jZXMgRGlhbG9nLiBXaWxsIG5vdCBiZSBudWxsISBUaGlzIGlzIGEgd29ya2Fyb3VuZCB0byBwcmV2ZW50IGNyZWF0aW5nIGEgXCJkZWZhdWx0XCIgUHJlZmVyZW5jZXNNb2RlbFxyXG4gIHByZWZlcmVuY2VzTW9kZWw/OiBQcmVmZXJlbmNlc01vZGVsIHwgbnVsbDtcclxuXHJcbiAgLy8gUGFzc2VkIHRvIFNpbURpc3BsYXksIGJ1dCBhIHRvcCBsZXZlbCBvcHRpb24gZm9yIEFQSSBlYXNlLlxyXG4gIHdlYmdsPzogYm9vbGVhbjtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFNpbU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tPcHRpb25hbDxQaGV0aW9PYmplY3QsICdwaGV0aW9EZXNpZ25lZCc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2ltIGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcclxuXHJcbiAgLy8gKGpvaXN0LWludGVybmFsKVxyXG4gIHB1YmxpYyByZWFkb25seSBzaW1OYW1lUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz47XHJcblxyXG4gIC8vIEluZGljYXRlcyBzaW0gY29uc3RydWN0aW9uIGNvbXBsZXRlZCwgYW5kIHRoYXQgYWxsIHNjcmVlbiBtb2RlbHMgYW5kIHZpZXdzIGhhdmUgYmVlbiBjcmVhdGVkLlxyXG4gIC8vIFRoaXMgd2FzIGFkZGVkIGZvciBQaEVULWlPIGJ1dCBjYW4gYmUgdXNlZCBieSBhbnkgY2xpZW50LiBUaGlzIGRvZXMgbm90IGNvaW5jaWRlIHdpdGggdGhlIGVuZCBvZiB0aGUgU2ltXHJcbiAgLy8gY29uc3RydWN0b3IgKGJlY2F1c2UgU2ltIGhhcyBhc3luY2hyb25vdXMgc3RlcHMgdGhhdCBmaW5pc2ggYWZ0ZXIgdGhlIGNvbnN0cnVjdG9yIGlzIGNvbXBsZXRlZClcclxuICBwcml2YXRlIHJlYWRvbmx5IF9pc0NvbnN0cnVjdGlvbkNvbXBsZXRlUHJvcGVydHkgPSBuZXcgUHJvcGVydHk8Ym9vbGVhbj4oIGZhbHNlICk7XHJcbiAgcHVibGljIHJlYWRvbmx5IGlzQ29uc3RydWN0aW9uQ29tcGxldGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4gPSB0aGlzLl9pc0NvbnN0cnVjdGlvbkNvbXBsZXRlUHJvcGVydHk7XHJcblxyXG4gIC8vIFN0b3JlcyB0aGUgZWZmZWN0aXZlIHdpbmRvdyBkaW1lbnNpb25zIHRoYXQgdGhlIHNpbXVsYXRpb24gd2lsbCBiZSB0YWtpbmcgdXBcclxuICBwdWJsaWMgcmVhZG9ubHkgZGltZW5zaW9uUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PERpbWVuc2lvbjI+O1xyXG5cclxuICAvLyBJbmRpY2F0ZXMgd2hlbiB0aGUgc2ltIHJlc2l6ZWQuICBUaGlzIEFjdGlvbiBpcyBpbXBsZW1lbnRlZCBzbyBpdCBjYW4gYmUgYXV0b21hdGljYWxseSBwbGF5ZWQgYmFjay5cclxuICBwcml2YXRlIHJlYWRvbmx5IHJlc2l6ZUFjdGlvbjogUGhldGlvQWN0aW9uPFsgbnVtYmVyLCBudW1iZXIgXT47XHJcblxyXG4gIC8vIChqb2lzdC1pbnRlcm5hbClcclxuICBwcml2YXRlIHJlYWRvbmx5IG5hdmlnYXRpb25CYXI6IE5hdmlnYXRpb25CYXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGhvbWVTY3JlZW46IEhvbWVTY3JlZW4gfCBudWxsO1xyXG5cclxuICAvLyBTaW0gc2NyZWVucyBub3JtYWxseSB1cGRhdGUgYnkgaW1wbGVtZW50aW5nIG1vZGVsLnN0ZXAoZHQpIG9yIHZpZXcuc3RlcChkdCkuICBXaGVuIHRoYXQgaXMgaW1wb3NzaWJsZSBvclxyXG4gIC8vIHJlbGF0aXZlbHkgYXdrd2FyZCwgaXQgaXMgcG9zc2libGUgdG8gbGlzdGVuIGZvciBhIGNhbGxiYWNrIHdoZW4gYSBmcmFtZSBiZWdpbnMsIHdoZW4gYSBmcmFtZSBpcyBiZWluZyBwcm9jZXNzZWRcclxuICAvLyBvciBhZnRlciB0aGUgZnJhbWUgaXMgY29tcGxldGUuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy81MzRcclxuXHJcbiAgLy8gSW5kaWNhdGVzIHdoZW4gYSBmcmFtZSBzdGFydHMuICBMaXN0ZW4gdG8gdGhpcyBFbWl0dGVyIGlmIHlvdSBoYXZlIGFuIGFjdGlvbiB0aGF0IG11c3QgYmVcclxuICAvLyBwZXJmb3JtZWQgYmVmb3JlIHRoZSBzdGVwIGJlZ2lucy5cclxuICBwdWJsaWMgcmVhZG9ubHkgZnJhbWVTdGFydGVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBmcmFtZUVuZGVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7XHJcbiAgICB0YW5kZW06IFRhbmRlbS5HRU5FUkFMX01PREVMLmNyZWF0ZVRhbmRlbSggJ2ZyYW1lRW5kZWRFbWl0dGVyJyApLFxyXG4gICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogdHJ1ZSxcclxuICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdJbmRpY2F0ZXMgd2hlbiBhIGZyYW1lIGVuZHMuIExpc3RlbiB0byB0aGlzIEVtaXR0ZXIgaWYgeW91IGhhdmUgYW4gYWN0aW9uIHRoYXQgbXVzdCBiZSAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICdwZXJmb3JtZWQgYWZ0ZXIgdGhlIG1vZGVsIGFuZCB2aWV3IHN0ZXAgY29tcGxldGVzLidcclxuICB9ICk7XHJcblxyXG4gIC8vIFN0ZXBzIHRoZSBzaW11bGF0aW9uLiBUaGlzIEFjdGlvbiBpcyBpbXBsZW1lbnRlZCBzbyBpdCBjYW4gYmUgYXV0b21hdGljYWxseVxyXG4gIC8vIHBsYXllZCBiYWNrIGZvciBQaEVULWlPIHJlY29yZC9wbGF5YmFjay4gIExpc3RlbiB0byB0aGlzIEFjdGlvbiBpZiB5b3UgaGF2ZSBhbiBhY3Rpb24gdGhhdCBoYXBwZW5zIGR1cmluZyB0aGVcclxuICAvLyBzaW11bGF0aW9uIHN0ZXAuXHJcbiAgcHVibGljIHJlYWRvbmx5IHN0ZXBTaW11bGF0aW9uQWN0aW9uOiBQaGV0aW9BY3Rpb248WyBudW1iZXIgXT47XHJcblxyXG4gIC8vIHRoZSBvcmRlcmVkIGxpc3Qgb2Ygc2ltLXNwZWNpZmljIHNjcmVlbnMgdGhhdCBhcHBlYXIgaW4gdGhpcyBydW50aW1lIG9mIHRoZSBzaW1cclxuICBwdWJsaWMgcmVhZG9ubHkgc2ltU2NyZWVuczogQW55U2NyZWVuW107XHJcblxyXG4gIC8vIGFsbCBzY3JlZW5zIHRoYXQgYXBwZWFyIGluIHRoZSBydW50aW1lIG9mIHRoaXMgc2ltLCB3aXRoIHRoZSBob21lU2NyZWVuIGZpcnN0IGlmIGl0IHdhcyBjcmVhdGVkXHJcbiAgcHVibGljIHJlYWRvbmx5IHNjcmVlbnM6IEFueVNjcmVlbltdO1xyXG5cclxuICAvLyB0aGUgZGlzcGxheWVkIG5hbWUgaW4gdGhlIHNpbS4gVGhpcyBkZXBlbmRzIG9uIHdoYXQgc2NyZWVucyBhcmUgc2hvd24gdGhpcyBydW50aW1lIChlZmZlY3RlZCBieSBxdWVyeSBwYXJhbWV0ZXJzKS5cclxuICBwdWJsaWMgcmVhZG9ubHkgZGlzcGxheWVkU2ltTmFtZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+O1xyXG4gIHB1YmxpYyByZWFkb25seSBzZWxlY3RlZFNjcmVlblByb3BlcnR5OiBQcm9wZXJ0eTxBbnlTY3JlZW4+O1xyXG5cclxuICAvLyB0cnVlIGlmIGFsbCBwb3NzaWJsZSBzY3JlZW5zIGFyZSBwcmVzZW50IChvcmRlci1pbmRlcGVuZGVudClcclxuICBwcml2YXRlIHJlYWRvbmx5IGFsbFNjcmVlbnNDcmVhdGVkOiBib29sZWFuO1xyXG5cclxuICBwcml2YXRlIGF2YWlsYWJsZVNjcmVlbnNQcm9wZXJ0eSE6IFByb3BlcnR5PG51bWJlcltdPjtcclxuICBwdWJsaWMgYWN0aXZlU2ltU2NyZWVuc1Byb3BlcnR5ITogUmVhZE9ubHlQcm9wZXJ0eTxBbnlTY3JlZW5bXT47XHJcblxyXG4gIC8vIFdoZW4gdGhlIHNpbSBpcyBhY3RpdmUsIHNjZW5lcnkgcHJvY2Vzc2VzIGlucHV0cyBhbmQgc3RlcFNpbXVsYXRpb24oZHQpIHJ1bnMgZnJvbSB0aGUgc3lzdGVtIGNsb2NrLlxyXG4gIC8vIFNldCB0byBmYWxzZSBmb3Igd2hlbiB0aGUgc2ltIHdpbGwgYmUgcGF1c2VkLlxyXG4gIHB1YmxpYyByZWFkb25seSBhY3RpdmVQcm9wZXJ0eTogQm9vbGVhblByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgdGFuZGVtOiBUYW5kZW0uR0VORVJBTF9NT0RFTC5jcmVhdGVUYW5kZW0oICdhY3RpdmVQcm9wZXJ0eScgKSxcclxuICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlLFxyXG4gICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0RldGVybWluZXMgd2hldGhlciB0aGUgZW50aXJlIHNpbXVsYXRpb24gaXMgcnVubmluZyBhbmQgcHJvY2Vzc2luZyB1c2VyIGlucHV0LiAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICdTZXR0aW5nIHRoaXMgcHJvcGVydHkgdG8gZmFsc2UgcGF1c2VzIHRoZSBzaW11bGF0aW9uLCBhbmQgcHJldmVudHMgdXNlciBpbnRlcmFjdGlvbi4nXHJcbiAgfSApO1xyXG5cclxuICAvLyBpbmRpY2F0ZXMgd2hldGhlciB0aGUgYnJvd3NlciB0YWIgY29udGFpbmluZyB0aGUgc2ltdWxhdGlvbiBpcyBjdXJyZW50bHkgdmlzaWJsZVxyXG4gIHB1YmxpYyByZWFkb25seSBicm93c2VyVGFiVmlzaWJsZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gKGpvaXN0LWludGVybmFsKSAtIEhvdyB0aGUgaG9tZSBzY3JlZW4gYW5kIG5hdmJhciBhcmUgc2NhbGVkLiBUaGlzIHNjYWxlIGlzIGJhc2VkIG9uIHRoZVxyXG4gIC8vIEhvbWVTY3JlZW4ncyBsYXlvdXQgYm91bmRzIHRvIHN1cHBvcnQgYSBjb25zaXN0ZW50bHkgc2l6ZWQgbmF2IGJhciBhbmQgbWVudS4gSWYgdGhpcyBzY2FsZSB3YXMgYmFzZWQgb24gdGhlXHJcbiAgLy8gbGF5b3V0IGJvdW5kcyBvZiB0aGUgY3VycmVudCBzY3JlZW4sIHRoZXJlIGNvdWxkIGJlIGRpZmZlcmVuY2VzIGluIHRoZSBuYXYgYmFyIGFjcm9zcyBzY3JlZW5zLlxyXG4gIHB1YmxpYyByZWFkb25seSBzY2FsZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxICk7XHJcblxyXG4gIC8vIChqb2lzdC1pbnRlcm5hbCkgZ2xvYmFsIGJvdW5kcyBmb3IgdGhlIGVudGlyZSBzaW11bGF0aW9uLiBudWxsIGJlZm9yZSBmaXJzdCByZXNpemVcclxuICBwdWJsaWMgcmVhZG9ubHkgYm91bmRzUHJvcGVydHkgPSBuZXcgUHJvcGVydHk8Qm91bmRzMiB8IG51bGw+KCBudWxsICk7XHJcblxyXG4gIC8vIChqb2lzdC1pbnRlcm5hbCkgZ2xvYmFsIGJvdW5kcyBmb3IgdGhlIHNjcmVlbi1zcGVjaWZpYyBwYXJ0IChleGNsdWRlcyB0aGUgbmF2aWdhdGlvbiBiYXIpLCBudWxsIGJlZm9yZSBmaXJzdCByZXNpemVcclxuICBwdWJsaWMgcmVhZG9ubHkgc2NyZWVuQm91bmRzUHJvcGVydHkgPSBuZXcgUHJvcGVydHk8Qm91bmRzMiB8IG51bGw+KCBudWxsICk7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBsb29rQW5kRmVlbCA9IG5ldyBMb29rQW5kRmVlbCgpO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbWVtb3J5TW9uaXRvciA9IG5ldyBNZW1vcnlNb25pdG9yKCk7XHJcblxyXG4gIC8vIHB1YmxpYyAocmVhZC1vbmx5KSB7Ym9vbGVhbn0gLSBpZiB0cnVlLCBhZGQgc3VwcG9ydCBzcGVjaWZpYyB0byBhY2Nlc3NpYmxlIHRlY2hub2xvZ3kgdGhhdCB3b3JrIHdpdGggdG91Y2ggZGV2aWNlcy5cclxuICBwcml2YXRlIHJlYWRvbmx5IHN1cHBvcnRzR2VzdHVyZURlc2NyaXB0aW9uOiBib29sZWFuO1xyXG5cclxuICAvLyBJZiBhbnkgc2ltIHNjcmVlbiBoYXMga2V5Ym9hcmQgaGVscCBjb250ZW50LCB0cmlnZ2VyIGNyZWF0aW9uIG9mIGEga2V5Ym9hcmQgaGVscCBidXR0b24uXHJcbiAgcHVibGljIHJlYWRvbmx5IGhhc0tleWJvYXJkSGVscENvbnRlbnQ6IGJvb2xlYW47XHJcblxyXG4gIC8vIGlmIFBoRVQtaU8gaXMgY3VycmVudGx5IHNldHRpbmcgdGhlIHN0YXRlIG9mIHRoZSBzaW11bGF0aW9uLiBTZWUgUGhldGlvU3RhdGVFbmdpbmUgZm9yIGRldGFpbHMuIFRoaXMgbXVzdCBiZVxyXG4gIC8vIGRlY2xhcmVkIGJlZm9yZSBzb3VuZE1hbmFnZXIuaW5pdGlhbGl6ZWQgaXMgY2FsbGVkLlxyXG4gIHB1YmxpYyByZWFkb25seSBpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gaWYgUGhFVC1pTyBpcyBjdXJyZW50bHkgc2V0dGluZyB0aGUgc3RhdGUgb2YgdGhlIHNpbXVsYXRpb24gYW5kIGluIHRoZSBwcm9jZXNzIG9mIGNsZWFyaW5nIGR5bmFtaWMgZWxlbWVudHMgYXMgYVxyXG4gIC8vIHByZWN1cnNvciB0byBzZXR0aW5nIHRoZSBzdGF0ZSBvZiB0aG9zZSBlbGVtZW50cy4gU2VlIFBoZXRpb1N0YXRlRW5naW5lIGZvciBkZXRhaWxzLiBUaGlzIG11c3QgYmVcclxuICAvLyBkZWNsYXJlZCBiZWZvcmUgc291bmRNYW5hZ2VyLmluaXRpYWxpemVkIGlzIGNhbGxlZC5cclxuICBwdWJsaWMgcmVhZG9ubHkgaXNDbGVhcmluZ1BoZXRpb0R5bmFtaWNFbGVtZW50c1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gKGpvaXN0LWludGVybmFsKVxyXG4gIHB1YmxpYyByZWFkb25seSB2ZXJzaW9uOiBzdHJpbmcgPSBwYWNrYWdlSlNPTi52ZXJzaW9uO1xyXG5cclxuICAvLyBudW1iZXIgb2YgYW5pbWF0aW9uIGZyYW1lcyB0aGF0IGhhdmUgb2NjdXJyZWRcclxuICBwdWJsaWMgZnJhbWVDb3VudGVyID0gMDtcclxuXHJcbiAgLy8gV2hldGhlciB0aGUgd2luZG93IGhhcyByZXNpemVkIHNpbmNlIG91ciBsYXN0IHVwZGF0ZURpc3BsYXkoKVxyXG4gIHByaXZhdGUgcmVzaXplUGVuZGluZyA9IHRydWU7XHJcblxyXG4gIC8vIE1ha2Ugb3VyIGxvY2FsZSBhdmFpbGFibGVcclxuICBwdWJsaWMgcmVhZG9ubHkgbG9jYWxlOiBMb2NhbGUgPSBwaGV0LmNoaXBwZXIubG9jYWxlIHx8ICdlbic7XHJcblxyXG4gIC8vIGNyZWF0ZSB0aGlzIG9ubHkgYWZ0ZXIgYWxsIG90aGVyIG1lbWJlcnMgaGF2ZSBiZWVuIHNldCBvbiBTaW1cclxuICBwcml2YXRlIHJlYWRvbmx5IHNpbUluZm86IFNpbUluZm87XHJcbiAgcHVibGljIHJlYWRvbmx5IGRpc3BsYXk6IFNpbURpc3BsYXk7XHJcblxyXG4gIC8vIFRoZSBUb29sYmFyIGlzIG5vdCBjcmVhdGVkIHVubGVzcyByZXF1ZXN0ZWQgd2l0aCBhIFByZWZlcmVuY2VzTW9kZWwuXHJcbiAgcHJpdmF0ZSByZWFkb25seSB0b29sYmFyOiBUb29sYmFyIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8vIE1hbmFnZXMgc3RhdGUgcmVsYXRlZCB0byBwcmVmZXJlbmNlcy4gRW5hYmxlZCBmZWF0dXJlcyBmb3IgcHJlZmVyZW5jZXMgYXJlIHByb3ZpZGVkIHRocm91Z2ggdGhlXHJcbiAgLy8gUHJlZmVyZW5jZXNNb2RlbC5cclxuICBwdWJsaWMgcmVhZG9ubHkgcHJlZmVyZW5jZXNNb2RlbDogUHJlZmVyZW5jZXNNb2RlbDtcclxuXHJcbiAgLy8gbGlzdCBvZiBub2RlcyB0aGF0IGFyZSBcIm1vZGFsXCIgYW5kIGhlbmNlIGJsb2NrIGlucHV0IHdpdGggdGhlIGJhcnJpZXJSZWN0YW5nbGUuICBVc2VkIGJ5IG1vZGFsIGRpYWxvZ3NcclxuICAvLyBhbmQgdGhlIFBoZXRNZW51XHJcbiAgcHJpdmF0ZSBtb2RhbE5vZGVTdGFjayA9IGNyZWF0ZU9ic2VydmFibGVBcnJheTxQb3B1cGFibGVOb2RlPigpO1xyXG5cclxuICAvLyAoam9pc3QtaW50ZXJuYWwpIFNlbWktdHJhbnNwYXJlbnQgYmxhY2sgYmFycmllciB1c2VkIHRvIGJsb2NrIGlucHV0IGV2ZW50cyB3aGVuIGEgZGlhbG9nIChvciBvdGhlciBwb3B1cClcclxuICAvLyBpcyBwcmVzZW50LCBhbmQgZmFkZSBvdXQgdGhlIGJhY2tncm91bmQuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBiYXJyaWVyUmVjdGFuZ2xlID0gbmV3IEJhcnJpZXJSZWN0YW5nbGUoIHRoaXMubW9kYWxOb2RlU3RhY2sgKTtcclxuXHJcbiAgLy8gbGF5ZXIgZm9yIHBvcHVwcywgZGlhbG9ncywgYW5kIHRoZWlyIGJhY2tncm91bmRzIGFuZCBiYXJyaWVyc1xyXG4gIC8vIFRPRE86IEhvdyBzaG91bGQgd2UgaGFuZGxlIHRoZSBwb3B1cCBmb3IgbmF2aWdhdGlvbj8gQ2FuIHdlIHNldCB0aGlzIHRvIHByaXZhdGU/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvODQxXHJcbiAgcHVibGljIHJlYWRvbmx5IHRvcExheWVyID0gbmV3IE5vZGUoIHtcclxuICAgIGNoaWxkcmVuOiBbIHRoaXMuYmFycmllclJlY3RhbmdsZSBdXHJcbiAgfSApIGFzIFRvcExheWVyTm9kZTtcclxuXHJcbiAgLy8gcm9vdCBub2RlIGZvciB0aGUgRGlzcGxheVxyXG4gIHB1YmxpYyByZWFkb25seSByb290Tm9kZTogTm9kZTtcclxuXHJcbiAgLy8gS2VlcCB0cmFjayBvZiB0aGUgcHJldmlvdXMgdGltZSBmb3IgY29tcHV0aW5nIGR0LCBhbmQgaW5pdGlhbGx5IHNpZ25pZnkgdGhhdCB0aW1lIGhhc24ndCBiZWVuIHJlY29yZGVkIHlldC5cclxuICBwcml2YXRlIGxhc3RTdGVwVGltZSA9IC0xO1xyXG4gIHByaXZhdGUgbGFzdEFuaW1hdGlvbkZyYW1lVGltZSA9IC0xO1xyXG5cclxuICAvLyAoam9pc3QtaW50ZXJuYWwpIEJpbmQgdGhlIGFuaW1hdGlvbiBsb29wIHNvIGl0IGNhbiBiZSBjYWxsZWQgZnJvbSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgd2l0aCB0aGUgcmlnaHQgdGhpcy5cclxuICBwcml2YXRlIHJlYWRvbmx5IGJvdW5kUnVuQW5pbWF0aW9uTG9vcDogKCkgPT4gdm9pZDtcclxuICBwcml2YXRlIHJlYWRvbmx5IHVwZGF0ZUJhY2tncm91bmQ6ICgpID0+IHZvaWQ7XHJcbiAgcHVibGljIHJlYWRvbmx5IGNyZWRpdHM6IENyZWRpdHNEYXRhO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gc2ltTmFtZVByb3BlcnR5IC0gdGhlIG5hbWUgb2YgdGhlIHNpbXVsYXRpb24sIHRvIGJlIGRpc3BsYXllZCBpbiB0aGUgbmF2YmFyIGFuZCBob21lc2NyZWVuXHJcbiAgICogQHBhcmFtIGFsbFNpbVNjcmVlbnMgLSB0aGUgcG9zc2libGUgc2NyZWVucyBmb3IgdGhlIHNpbSBpbiBvcmRlciBvZiBkZWNsYXJhdGlvbiAoZG9lcyBub3QgaW5jbHVkZSB0aGUgaG9tZSBzY3JlZW4pXHJcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdIC0gc2VlIGJlbG93IGZvciBvcHRpb25zXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzaW1OYW1lUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4sIGFsbFNpbVNjcmVlbnM6IEFueVNjcmVlbltdLCBwcm92aWRlZE9wdGlvbnM/OiBTaW1PcHRpb25zICkge1xyXG5cclxuICAgIHdpbmRvdy5waGV0U3BsYXNoU2NyZWVuRG93bmxvYWRDb21wbGV0ZSgpO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFsbFNpbVNjcmVlbnMubGVuZ3RoID49IDEsICdhdCBsZWFzdCBvbmUgc2NyZWVuIGlzIHJlcXVpcmVkJyApO1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U2ltT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBoZXRpb09iamVjdE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIGNyZWRpdHM6IHt9LFxyXG5cclxuICAgICAgLy8gYSB7Tm9kZX0gcGxhY2VkIG9udG8gdGhlIGhvbWUgc2NyZWVuIChpZiBhdmFpbGFibGUpXHJcbiAgICAgIGhvbWVTY3JlZW5XYXJuaW5nTm9kZTogbnVsbCxcclxuXHJcbiAgICAgIC8vIElmIGEgUHJlZmVyZW5jZXNNb2RlbCBzdXBwb3J0cyBhbnkgcHJlZmVyZW5jZXMsIHRoZSBzaW0gd2lsbCBpbmNsdWRlIHRoZSBQcmVmZXJlbmNlc0RpYWxvZyBhbmQgYVxyXG4gICAgICAvLyBidXR0b24gaW4gdGhlIE5hdmlnYXRpb25CYXIgdG8gb3BlbiBpdC4gU2ltdWxhdGlvbiBjb25kaXRpb25zIChsaWtlIHdoYXQgbG9jYWxlcyBhcmUgYXZhaWxhYmxlKSBtaWdodCBlbmFibGVcclxuICAgICAgLy8gYSBQcmVmZXJlbmNlc0RpYWxvZyBieSBkZWZhdWx0LiBCdXQgUHJlZmVyZW5jZXNNb2RlbCBoYXMgbWFueSBvcHRpb25zIHlvdSBjYW4gcHJvdmlkZS5cclxuICAgICAgcHJlZmVyZW5jZXNNb2RlbDogbnVsbCxcclxuXHJcbiAgICAgIC8vIFBhc3NlZCB0byBTaW1EaXNwbGF5LCBidXQgYSB0b3AgbGV2ZWwgb3B0aW9uIGZvciBBUEkgZWFzZS5cclxuICAgICAgd2ViZ2w6IFNpbURpc3BsYXkuREVGQVVMVF9XRUJHTCxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgaWYgKCAhb3B0aW9ucy5wcmVmZXJlbmNlc01vZGVsICkge1xyXG4gICAgICBvcHRpb25zLnByZWZlcmVuY2VzTW9kZWwgPSBuZXcgUHJlZmVyZW5jZXNNb2RlbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNvbWUgb3B0aW9ucyBhcmUgdXNlZCBieSBzaW0gYW5kIFNpbURpc3BsYXkuIFByb21vdGUgd2ViZ2wgdG8gdG9wIGxldmVsIHNpbSBvcHRpb24gb3V0IG9mIEFQSSBlYXNlLCBidXQgaXQgaXNcclxuICAgIC8vIHBhc3NlZCB0byB0aGUgU2ltRGlzcGxheS5cclxuICAgIGNvbnN0IHNpbURpc3BsYXlPcHRpb25zOiB7XHJcbiAgICAgIHdlYmdsOiBib29sZWFuO1xyXG4gICAgICB0YW5kZW06IFRhbmRlbTtcclxuICAgICAgcHJlZmVyZW5jZXNNb2RlbDogUHJlZmVyZW5jZXNNb2RlbDtcclxuICAgIH0gPSB7XHJcbiAgICAgIHdlYmdsOiBvcHRpb25zLndlYmdsLFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5HRU5FUkFMX1ZJRVcuY3JlYXRlVGFuZGVtKCAnZGlzcGxheScgKSxcclxuICAgICAgcHJlZmVyZW5jZXNNb2RlbDogb3B0aW9ucy5wcmVmZXJlbmNlc01vZGVsXHJcbiAgICB9O1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5jcmVkaXRzID0gb3B0aW9ucy5jcmVkaXRzO1xyXG5cclxuICAgIHRoaXMuc2ltTmFtZVByb3BlcnR5ID0gc2ltTmFtZVByb3BlcnR5O1xyXG5cclxuICAgIC8vIHBsYXliYWNrTW9kZUVuYWJsZWRQcm9wZXJ0eSBjYW5ub3QgYmUgY2hhbmdlZCBhZnRlciBTaW0gY29uc3RydWN0aW9uIGhhcyBiZWd1biwgaGVuY2UgdGhpcyBsaXN0ZW5lciBpcyBhZGRlZCBiZWZvcmVcclxuICAgIC8vIGFueXRoaW5nIGVsc2UgaXMgZG9uZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy8xMTQ2XHJcbiAgICBwaGV0LmpvaXN0LnBsYXliYWNrTW9kZUVuYWJsZWRQcm9wZXJ0eS5sYXp5TGluayggKCkgPT4ge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdwbGF5YmFja01vZGVFbmFibGVkUHJvcGVydHkgY2Fubm90IGJlIGNoYW5nZWQgYWZ0ZXIgU2ltIGNvbnN0cnVjdGlvbiBoYXMgYmVndW4nICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIHRoaXMuaXNDb25zdHJ1Y3Rpb25Db21wbGV0ZVByb3BlcnR5LmxhenlMaW5rKCBpc0NvbnN0cnVjdGlvbkNvbXBsZXRlID0+IHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaXNDb25zdHJ1Y3Rpb25Db21wbGV0ZSwgJ1NpbSBjb25zdHJ1Y3Rpb24gc2hvdWxkIG5ldmVyIHVuY29tcGxldGUnICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgZGltZW5zaW9uUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG5ldyBEaW1lbnNpb24yKCAwLCAwICksIHtcclxuICAgICAgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdlcXVhbHNGdW5jdGlvbidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBOb3RlOiB0aGUgcHVibGljIEFQSSBpcyBUUmVhZE9ubHlQcm9wZXJ0eVxyXG4gICAgdGhpcy5kaW1lbnNpb25Qcm9wZXJ0eSA9IGRpbWVuc2lvblByb3BlcnR5O1xyXG5cclxuICAgIHRoaXMucmVzaXplQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbjxbIG51bWJlciwgbnVtYmVyIF0+KCAoIHdpZHRoLCBoZWlnaHQgKSA9PiB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHdpZHRoID4gMCAmJiBoZWlnaHQgPiAwLCAnc2ltIHNob3VsZCBoYXZlIGEgbm9uemVybyBhcmVhJyApO1xyXG5cclxuICAgICAgZGltZW5zaW9uUHJvcGVydHkudmFsdWUgPSBuZXcgRGltZW5zaW9uMiggd2lkdGgsIGhlaWdodCApO1xyXG5cclxuICAgICAgLy8gR3JhY2VmdWxseSBzdXBwb3J0IGJhZCBkaW1lbnNpb25zLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy80NzJcclxuICAgICAgaWYgKCB3aWR0aCA9PT0gMCB8fCBoZWlnaHQgPT09IDAgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IHNjYWxlID0gTWF0aC5taW4oIHdpZHRoIC8gSG9tZVNjcmVlblZpZXcuTEFZT1VUX0JPVU5EUy53aWR0aCwgaGVpZ2h0IC8gSG9tZVNjcmVlblZpZXcuTEFZT1VUX0JPVU5EUy5oZWlnaHQgKTtcclxuXHJcbiAgICAgIC8vIDQwIHB4IGhpZ2ggb24gaVBhZCBNb2JpbGUgU2FmYXJpXHJcbiAgICAgIGNvbnN0IG5hdkJhckhlaWdodCA9IHNjYWxlICogTmF2aWdhdGlvbkJhci5OQVZJR0FUSU9OX0JBUl9TSVpFLmhlaWdodDtcclxuICAgICAgdGhpcy5uYXZpZ2F0aW9uQmFyLmxheW91dCggc2NhbGUsIHdpZHRoLCBuYXZCYXJIZWlnaHQgKTtcclxuICAgICAgdGhpcy5uYXZpZ2F0aW9uQmFyLnkgPSBoZWlnaHQgLSBuYXZCYXJIZWlnaHQ7XHJcbiAgICAgIHRoaXMuZGlzcGxheS5zZXRTaXplKCBuZXcgRGltZW5zaW9uMiggd2lkdGgsIGhlaWdodCApICk7XHJcbiAgICAgIGNvbnN0IHNjcmVlbkhlaWdodCA9IGhlaWdodCAtIHRoaXMubmF2aWdhdGlvbkJhci5oZWlnaHQ7XHJcblxyXG4gICAgICBpZiAoIHRoaXMudG9vbGJhciApIHtcclxuICAgICAgICB0aGlzLnRvb2xiYXIubGF5b3V0KCBzY2FsZSwgc2NyZWVuSGVpZ2h0ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFRoZSBhdmFpbGFibGUgYm91bmRzIGZvciBzY3JlZW5zIGFuZCB0b3AgbGF5ZXIgY2hpbGRyZW4gLSB0aG91Z2ggY3VycmVudGx5IHByb3ZpZGVkXHJcbiAgICAgIC8vIGZ1bGwgd2lkdGggYW5kIGhlaWdodCwgd2lsbCBzb29uIGJlIHJlZHVjZWQgd2hlbiBtZW51cyAoc3BlY2lmaWNhbGx5IHRoZSBQcmVmZXJlbmNlc1xyXG4gICAgICAvLyBUb29sYmFyKSB0YWtlcyB1cCBzY3JlZW4gc3BhY2UuXHJcbiAgICAgIGNvbnN0IHNjcmVlbk1pblggPSB0aGlzLnRvb2xiYXIgPyB0aGlzLnRvb2xiYXIuZ2V0RGlzcGxheWVkV2lkdGgoKSA6IDA7XHJcbiAgICAgIGNvbnN0IGF2YWlsYWJsZVNjcmVlbkJvdW5kcyA9IG5ldyBCb3VuZHMyKCBzY3JlZW5NaW5YLCAwLCB3aWR0aCwgc2NyZWVuSGVpZ2h0ICk7XHJcblxyXG4gICAgICAvLyBMYXlvdXQgZWFjaCBvZiB0aGUgc2NyZWVuc1xyXG4gICAgICBfLmVhY2goIHRoaXMuc2NyZWVucywgbSA9PiBtLnZpZXcubGF5b3V0KCBhdmFpbGFibGVTY3JlZW5Cb3VuZHMgKSApO1xyXG5cclxuICAgICAgdGhpcy50b3BMYXllci5jaGlsZHJlbi5mb3JFYWNoKCBjaGlsZCA9PiB7XHJcbiAgICAgICAgY2hpbGQubGF5b3V0ICYmIGNoaWxkLmxheW91dCggYXZhaWxhYmxlU2NyZWVuQm91bmRzICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIEZpeGVzIHByb2JsZW1zIHdoZXJlIHRoZSBkaXYgd291bGQgYmUgd2F5IG9mZiBjZW50ZXIgb24gaU9TN1xyXG4gICAgICBpZiAoIHBsYXRmb3JtLm1vYmlsZVNhZmFyaSApIHtcclxuICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oIDAsIDAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdXBkYXRlIG91ciBzY2FsZSBhbmQgYm91bmRzIHByb3BlcnRpZXMgYWZ0ZXIgb3RoZXIgY2hhbmdlcyAoc28gbGlzdGVuZXJzIGNhbiBiZSBmaXJlZCBhZnRlciBzY3JlZW5zIGFyZSByZXNpemVkKVxyXG4gICAgICB0aGlzLnNjYWxlUHJvcGVydHkudmFsdWUgPSBzY2FsZTtcclxuICAgICAgdGhpcy5ib3VuZHNQcm9wZXJ0eS52YWx1ZSA9IG5ldyBCb3VuZHMyKCAwLCAwLCB3aWR0aCwgaGVpZ2h0ICk7XHJcbiAgICAgIHRoaXMuc2NyZWVuQm91bmRzUHJvcGVydHkudmFsdWUgPSBhdmFpbGFibGVTY3JlZW5Cb3VuZHMuY29weSgpO1xyXG5cclxuICAgICAgLy8gc2V0IHRoZSBzY2FsZSBkZXNjcmliaW5nIHRoZSB0YXJnZXQgTm9kZSwgc2luY2Ugc2NhbGUgZnJvbSB3aW5kb3cgcmVzaXplIGlzIGFwcGxpZWQgdG8gZWFjaCBTY3JlZW5WaWV3LFxyXG4gICAgICAvLyAoY2hpbGRyZW4gb2YgdGhlIFBhblpvb21MaXN0ZW5lciB0YXJnZXROb2RlKVxyXG4gICAgICBhbmltYXRlZFBhblpvb21TaW5nbGV0b24ubGlzdGVuZXIhLnNldFRhcmdldFNjYWxlKCBzY2FsZSApO1xyXG5cclxuICAgICAgLy8gc2V0IHRoZSBib3VuZHMgd2hpY2ggYWNjdXJhdGVseSBkZXNjcmliZSB0aGUgcGFuWm9vbUxpc3RlbmVyIHRhcmdldE5vZGUsIHNpbmNlIGl0IHdvdWxkIG90aGVyd2lzZSBiZVxyXG4gICAgICAvLyBpbmFjY3VyYXRlIHdpdGggdGhlIHZlcnkgbGFyZ2UgQmFycmllclJlY3RhbmdsZVxyXG4gICAgICBhbmltYXRlZFBhblpvb21TaW5nbGV0b24ubGlzdGVuZXIhLnNldFRhcmdldEJvdW5kcyggdGhpcy5ib3VuZHNQcm9wZXJ0eS52YWx1ZSApO1xyXG5cclxuICAgICAgLy8gY29uc3RyYWluIHRoZSBzaW11bGF0aW9uIHBhbiBib3VuZHMgc28gdGhhdCBpdCBjYW5ub3QgYmUgbW92ZWQgb2ZmIHNjcmVlblxyXG4gICAgICBhbmltYXRlZFBhblpvb21TaW5nbGV0b24ubGlzdGVuZXIhLnNldFBhbkJvdW5kcyggdGhpcy5ib3VuZHNQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgfSwge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5HRU5FUkFMX01PREVMLmNyZWF0ZVRhbmRlbSggJ3Jlc2l6ZUFjdGlvbicgKSxcclxuICAgICAgcGFyYW1ldGVyczogW1xyXG4gICAgICAgIHsgbmFtZTogJ3dpZHRoJywgcGhldGlvVHlwZTogTnVtYmVySU8gfSxcclxuICAgICAgICB7IG5hbWU6ICdoZWlnaHQnLCBwaGV0aW9UeXBlOiBOdW1iZXJJTyB9XHJcbiAgICAgIF0sXHJcbiAgICAgIHBoZXRpb1BsYXliYWNrOiB0cnVlLFxyXG4gICAgICBwaGV0aW9FdmVudE1ldGFkYXRhOiB7XHJcblxyXG4gICAgICAgIC8vIHJlc2l6ZUFjdGlvbiBuZWVkcyB0byBhbHdheXMgYmUgcGxheWJhY2thYmxlIGJlY2F1c2UgaXQgYWN0cyBpbmRlcGVuZGVudGx5IG9mIGFueSBvdGhlciBwbGF5YmFjayBldmVudC5cclxuICAgICAgICAvLyBCZWNhdXNlIG9mIGl0cyB1bmlxdWUgbmF0dXJlLCBpdCBzaG91bGQgYmUgYSBcInRvcC1sZXZlbFwiIGBwbGF5YmFjazogdHJ1ZWAgZXZlbnQgc28gdGhhdCBpdCBpcyBuZXZlciBtYXJrZWQgYXNcclxuICAgICAgICAvLyBgcGxheWJhY2s6IGZhbHNlYC4gVGhlcmUgYXJlIGNhc2VzIHdoZXJlIGl0IGlzIG5lc3RlZCB1bmRlciBhbm90aGVyIGBwbGF5YmFjazogdHJ1ZWAgZXZlbnQsIGxpa2Ugd2hlbiB0aGVcclxuICAgICAgICAvLyB3cmFwcGVyIGxhdW5jaGVzIHRoZSBzaW11bGF0aW9uLCB0aGF0IGNhbm5vdCBiZSBhdm9pZGVkLiBGb3IgdGhpcyByZWFzb24sIHdlIHVzZSB0aGlzIG92ZXJyaWRlLlxyXG4gICAgICAgIGFsd2F5c1BsYXliYWNrYWJsZU92ZXJyaWRlOiB0cnVlXHJcbiAgICAgIH0sXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFeGVjdXRlcyB3aGVuIHRoZSBzaW0gaXMgcmVzaXplZC4gVmFsdWVzIGFyZSB0aGUgc2ltIGRpbWVuc2lvbnMgaW4gQ1NTIHBpeGVscy4nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zdGVwU2ltdWxhdGlvbkFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oIGR0ID0+IHtcclxuICAgICAgdGhpcy5mcmFtZVN0YXJ0ZWRFbWl0dGVyLmVtaXQoKTtcclxuXHJcbiAgICAgIC8vIGluY3JlbWVudCB0aGlzIGJlZm9yZSB3ZSBjYW4gaGF2ZSBhbiBleGNlcHRpb24gdGhyb3duLCB0byBzZWUgaWYgd2UgYXJlIG1pc3NpbmcgZnJhbWVzXHJcbiAgICAgIHRoaXMuZnJhbWVDb3VudGVyKys7XHJcblxyXG4gICAgICAvLyBBcHBseSB0aW1lIHNjYWxlIGVmZmVjdHMgaGVyZSBiZWZvcmUgdXNhZ2VcclxuICAgICAgZHQgKj0gcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5zcGVlZDtcclxuXHJcbiAgICAgIGlmICggdGhpcy5yZXNpemVQZW5kaW5nICkge1xyXG4gICAgICAgIHRoaXMucmVzaXplVG9XaW5kb3coKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSWYgdGhlIHVzZXIgaXMgb24gdGhlIGhvbWUgc2NyZWVuLCB3ZSB3b24ndCBoYXZlIGEgU2NyZWVuIHRoYXQgd2UnbGwgd2FudCB0byBzdGVwLiAgVGhpcyBtdXN0IGJlIGRvbmUgYWZ0ZXJcclxuICAgICAgLy8gZnV6eiBtb3VzZSwgYmVjYXVzZSBmdXp6aW5nIGNvdWxkIGNoYW5nZSB0aGUgc2VsZWN0ZWQgc2NyZWVuLCBzZWUgIzEzMFxyXG4gICAgICBjb25zdCBzY3JlZW4gPSB0aGlzLnNlbGVjdGVkU2NyZWVuUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgICAvLyBjYXAgZHQgYmFzZWQgb24gdGhlIGN1cnJlbnQgc2NyZWVuLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy8xMzBcclxuICAgICAgZHQgPSBNYXRoLm1pbiggZHQsIHNjcmVlbi5tYXhEVCApO1xyXG5cclxuICAgICAgLy8gVE9ETzogd2UgYXJlIC8xMDAwIGp1c3QgdG8gKjEwMDA/ICBTZWVtcyB3YXN0ZWZ1bCBhbmQgbGlrZSBvcHBvcnR1bml0eSBmb3IgZXJyb3IuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzM4N1xyXG4gICAgICAvLyBTdG9yZSB0aGUgZWxhcHNlZCB0aW1lIGluIG1pbGxpc2Vjb25kcyBmb3IgdXNhZ2UgYnkgVHdlZW4gY2xpZW50c1xyXG4gICAgICBwaGV0LmpvaXN0LmVsYXBzZWRUaW1lICs9IGR0ICogMTAwMDtcclxuXHJcbiAgICAgIC8vIHRpbWVyIHN0ZXAgYmVmb3JlIG1vZGVsL3ZpZXcgc3RlcHMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzQwMVxyXG4gICAgICAvLyBOb3RlIHRoYXQgdGhpcyBpcyB2aXRhbCB0byBzdXBwb3J0IEludGVyYWN0aXZlIERlc2NyaXB0aW9uIGFuZCB0aGUgdXR0ZXJhbmNlIHF1ZXVlLlxyXG4gICAgICBzdGVwVGltZXIuZW1pdCggZHQgKTtcclxuXHJcbiAgICAgIC8vIElmIHRoZSBkdCBpcyAwLCB3ZSB3aWxsIHNraXAgdGhlIG1vZGVsIHN0ZXAgKHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzE3MSlcclxuICAgICAgaWYgKCBzY3JlZW4ubW9kZWwuc3RlcCAmJiBkdCApIHtcclxuICAgICAgICBzY3JlZW4ubW9kZWwuc3RlcCggZHQgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSWYgdXNpbmcgdGhlIFRXRUVOIGFuaW1hdGlvbiBsaWJyYXJ5LCB0aGVuIHVwZGF0ZSB0d2VlbnMgYmVmb3JlIHJlbmRlcmluZyB0aGUgc2NlbmUuXHJcbiAgICAgIC8vIFVwZGF0ZSB0aGUgdHdlZW5zIGFmdGVyIHRoZSBtb2RlbCBpcyB1cGRhdGVkIGJ1dCBiZWZvcmUgdGhlIHZpZXcgc3RlcC5cclxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvNDAxLlxyXG4gICAgICAvL1RPRE8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy80MDQgcnVuIFRXRUVOcyBmb3IgdGhlIHNlbGVjdGVkIHNjcmVlbiBvbmx5XHJcbiAgICAgIGlmICggd2luZG93LlRXRUVOICkge1xyXG4gICAgICAgIHdpbmRvdy5UV0VFTi51cGRhdGUoIHBoZXQuam9pc3QuZWxhcHNlZFRpbWUgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5kaXNwbGF5LnN0ZXAoIGR0ICk7XHJcblxyXG4gICAgICAvLyBWaWV3IHN0ZXAgaXMgdGhlIGxhc3QgdGhpbmcgYmVmb3JlIHVwZGF0ZURpc3BsYXkoKSwgc28gd2UgY2FuIGRvIHBhaW50IHVwZGF0ZXMgdGhlcmUuXHJcbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzQwMS5cclxuICAgICAgc2NyZWVuLnZpZXcuc3RlcCggZHQgKTtcclxuXHJcbiAgICAgIC8vIERvIG5vdCB1cGRhdGUgdGhlIGRpc3BsYXkgd2hpbGUgUGhFVC1pTyBpcyBjdXN0b21pemluZywgb3IgaXQgY291bGQgc2hvdyB0aGUgc2ltIGJlZm9yZSBpdCBpcyBmdWxseSByZWFkeSBmb3IgZGlzcGxheS5cclxuICAgICAgaWYgKCAhKCBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICYmICFwaGV0LnBoZXRpby5waGV0aW9FbmdpbmUuaXNSZWFkeUZvckRpc3BsYXkgKSApIHtcclxuICAgICAgICB0aGlzLmRpc3BsYXkudXBkYXRlRGlzcGxheSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMubWVtb3J5TGltaXQgKSB7XHJcbiAgICAgICAgdGhpcy5tZW1vcnlNb25pdG9yLm1lYXN1cmUoKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmZyYW1lRW5kZWRFbWl0dGVyLmVtaXQoKTtcclxuICAgIH0sIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uR0VORVJBTF9NT0RFTC5jcmVhdGVUYW5kZW0oICdzdGVwU2ltdWxhdGlvbkFjdGlvbicgKSxcclxuICAgICAgcGFyYW1ldGVyczogWyB7XHJcbiAgICAgICAgbmFtZTogJ2R0JyxcclxuICAgICAgICBwaGV0aW9UeXBlOiBOdW1iZXJJTyxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIGFtb3VudCBvZiB0aW1lIHN0ZXBwZWQgaW4gZWFjaCBjYWxsLCBpbiBzZWNvbmRzLidcclxuICAgICAgfSBdLFxyXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0EgZnVuY3Rpb24gdGhhdCBzdGVwcyB0aW1lIGZvcndhcmQuJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHNjcmVlbnNUYW5kZW0gPSBUYW5kZW0uR0VORVJBTF9NT0RFTC5jcmVhdGVUYW5kZW0oICdzY3JlZW5zJyApO1xyXG5cclxuICAgIGNvbnN0IHNjcmVlbkRhdGEgPSBzZWxlY3RTY3JlZW5zKFxyXG4gICAgICBhbGxTaW1TY3JlZW5zLFxyXG4gICAgICBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmhvbWVTY3JlZW4sXHJcbiAgICAgIFF1ZXJ5U3RyaW5nTWFjaGluZS5jb250YWluc0tleSggJ2hvbWVTY3JlZW4nICksXHJcbiAgICAgIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuaW5pdGlhbFNjcmVlbixcclxuICAgICAgUXVlcnlTdHJpbmdNYWNoaW5lLmNvbnRhaW5zS2V5KCAnaW5pdGlhbFNjcmVlbicgKSxcclxuICAgICAgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5zY3JlZW5zLFxyXG4gICAgICBRdWVyeVN0cmluZ01hY2hpbmUuY29udGFpbnNLZXkoICdzY3JlZW5zJyApLFxyXG4gICAgICBzZWxlY3RlZFNpbVNjcmVlbnMgPT4ge1xyXG4gICAgICAgIGNvbnN0IHBvc3NpYmxlU2NyZWVuSW5kaWNlcyA9IHNlbGVjdGVkU2ltU2NyZWVucy5tYXAoIHNjcmVlbiA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gYWxsU2ltU2NyZWVucy5pbmRleE9mKCBzY3JlZW4gKSArIDE7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIGNvbnN0IHZhbGlkVmFsdWVzID0gXy5mbGF0dGVuKCBDb21iaW5hdGlvbi5jb21iaW5hdGlvbnNPZiggcG9zc2libGVTY3JlZW5JbmRpY2VzICkubWFwKCBzdWJzZXQgPT4gUGVybXV0YXRpb24ucGVybXV0YXRpb25zT2YoIHN1YnNldCApICkgKVxyXG4gICAgICAgICAgLmZpbHRlciggYXJyYXkgPT4gYXJyYXkubGVuZ3RoID4gMCApLnNvcnQoKTtcclxuXHJcbiAgICAgICAgLy8gQ29udHJvbHMgdGhlIHN1YnNldCAoYW5kIG9yZGVyKSBvZiBzY3JlZW5zIHRoYXQgYXBwZWFyIHRvIHRoZSB1c2VyLiBTZXBhcmF0ZSBmcm9tIHRoZSA/c2NyZWVucyBxdWVyeSBwYXJhbWV0ZXJcclxuICAgICAgICAvLyBmb3IgcGhldC1pbyBwdXJwb3Nlcy4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvODI3XHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGVTY3JlZW5zUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHBvc3NpYmxlU2NyZWVuSW5kaWNlcywge1xyXG4gICAgICAgICAgdGFuZGVtOiBzY3JlZW5zVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2F2YWlsYWJsZVNjcmVlbnNQcm9wZXJ0eScgKSxcclxuICAgICAgICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gXy5zb21lKCB2YWxpZFZhbHVlcywgdmFsaWRWYWx1ZSA9PiBfLmlzRXF1YWwoIHZhbHVlLCB2YWxpZFZhbHVlICkgKSxcclxuICAgICAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlLFxyXG4gICAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBBcnJheUlPKCBOdW1iZXJJTyApLFxyXG4gICAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0NvbnRyb2xzIHdoaWNoIHNjcmVlbnMgYXJlIGF2YWlsYWJsZSwgYW5kIHRoZSBvcmRlciB0aGV5IGFyZSBkaXNwbGF5ZWQuJ1xyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgdGhpcy5hY3RpdmVTaW1TY3JlZW5zUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMuYXZhaWxhYmxlU2NyZWVuc1Byb3BlcnR5IF0sIHNjcmVlbkluZGljZXMgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIHNjcmVlbkluZGljZXMubWFwKCBpbmRleCA9PiBhbGxTaW1TY3JlZW5zWyBpbmRleCAtIDEgXSApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfSxcclxuICAgICAgc2VsZWN0ZWRTaW1TY3JlZW5zID0+IHtcclxuICAgICAgICByZXR1cm4gbmV3IEhvbWVTY3JlZW4oIHRoaXMuc2ltTmFtZVByb3BlcnR5LCAoKSA9PiB0aGlzLnNlbGVjdGVkU2NyZWVuUHJvcGVydHksIHNlbGVjdGVkU2ltU2NyZWVucywgdGhpcy5hY3RpdmVTaW1TY3JlZW5zUHJvcGVydHksIHtcclxuICAgICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCB3aW5kb3cucGhldGlvLlBoZXRpb0lEVXRpbHMuSE9NRV9TQ1JFRU5fQ09NUE9ORU5UX05BTUUgKSxcclxuICAgICAgICAgIHdhcm5pbmdOb2RlOiBvcHRpb25zLmhvbWVTY3JlZW5XYXJuaW5nTm9kZVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLmhvbWVTY3JlZW4gPSBzY3JlZW5EYXRhLmhvbWVTY3JlZW47XHJcbiAgICB0aGlzLnNpbVNjcmVlbnMgPSBzY3JlZW5EYXRhLnNlbGVjdGVkU2ltU2NyZWVucztcclxuICAgIHRoaXMuc2NyZWVucyA9IHNjcmVlbkRhdGEuc2NyZWVucztcclxuICAgIHRoaXMuYWxsU2NyZWVuc0NyZWF0ZWQgPSBzY3JlZW5EYXRhLmFsbFNjcmVlbnNDcmVhdGVkO1xyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eTxBbnlTY3JlZW4+KCBzY3JlZW5EYXRhLmluaXRpYWxTY3JlZW4sIHtcclxuICAgICAgdGFuZGVtOiBzY3JlZW5zVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NlbGVjdGVkU2NyZWVuUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRGV0ZXJtaW5lcyB3aGljaCBzY3JlZW4gaXMgc2VsZWN0ZWQgaW4gdGhlIHNpbXVsYXRpb24nLFxyXG4gICAgICB2YWxpZFZhbHVlczogdGhpcy5zY3JlZW5zLFxyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IFNjcmVlbi5TY3JlZW5JT1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIElmIHRoZSBhY3RpdmVTaW1TY3JlZW5zIGNoYW5nZXMsIHdlJ2xsIHdhbnQgdG8gdXBkYXRlIHdoYXQgdGhlIGFjdGl2ZSBzY3JlZW4gKG9yIHNlbGVjdGVkIHNjcmVlbikgaXMgZm9yIHNwZWNpZmljXHJcbiAgICAvLyBjYXNlcy5cclxuICAgIHRoaXMuYWN0aXZlU2ltU2NyZWVuc1Byb3BlcnR5LmxhenlMaW5rKCBzY3JlZW5zID0+IHtcclxuICAgICAgY29uc3Qgc2NyZWVuID0gdGhpcy5zZWxlY3RlZFNjcmVlblByb3BlcnR5LnZhbHVlO1xyXG4gICAgICBpZiAoIHNjcmVlbiA9PT0gdGhpcy5ob21lU2NyZWVuICkge1xyXG4gICAgICAgIGlmICggc2NyZWVucy5sZW5ndGggPT09IDEgKSB7XHJcbiAgICAgICAgICAvLyBJZiB3ZSdyZSBvbiB0aGUgaG9tZSBzY3JlZW4gYW5kIGl0IHN3aXRjaGVzIHRvIGEgMS1zY3JlZW4gc2ltLCBnbyB0byB0aGF0IHNjcmVlblxyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZFNjcmVlblByb3BlcnR5LnZhbHVlID0gc2NyZWVuc1sgMCBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggIXNjcmVlbnMuaW5jbHVkZXMoIHRoaXMuaG9tZVNjcmVlbi5tb2RlbC5zZWxlY3RlZFNjcmVlblByb3BlcnR5LnZhbHVlICkgKSB7XHJcbiAgICAgICAgICAvLyBJZiB3ZSdyZSBvbiB0aGUgaG9tZSBzY3JlZW4gYW5kIG91ciBcInNlbGVjdGVkXCIgc2NyZWVuIGRpc2FwcGVhcnMsIHNlbGVjdCB0aGUgZmlyc3Qgc2ltIHNjcmVlblxyXG4gICAgICAgICAgdGhpcy5ob21lU2NyZWVuLm1vZGVsLnNlbGVjdGVkU2NyZWVuUHJvcGVydHkudmFsdWUgPSBzY3JlZW5zWyAwIF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCAhc2NyZWVucy5pbmNsdWRlcyggc2NyZWVuICkgKSB7XHJcbiAgICAgICAgLy8gSWYgd2UncmUgb24gYSBzY3JlZW4gdGhhdCBcImRpc2FwcGVhcnNcIiwgZ28gdG8gdGhlIGZpcnN0IHNjcmVlblxyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eS52YWx1ZSA9IHNjcmVlbnNbIDAgXTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZGlzcGxheWVkU2ltTmFtZVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggW1xyXG4gICAgICB0aGlzLmF2YWlsYWJsZVNjcmVlbnNQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5zaW1OYW1lUHJvcGVydHksXHJcbiAgICAgIHRoaXMuc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eSxcclxuICAgICAgSm9pc3RTdHJpbmdzLnNpbVRpdGxlV2l0aFNjcmVlbk5hbWVQYXR0ZXJuU3RyaW5nUHJvcGVydHksXHJcblxyXG4gICAgICAvLyBXZSBqdXN0IG5lZWQgbm90aWZpY2F0aW9ucyBvbiBhbnkgb2YgdGhlc2UgY2hhbmdpbmcsIHJldHVybiBhcmdzIGFzIGEgdW5pcXVlIHZhbHVlIHRvIG1ha2Ugc3VyZSBsaXN0ZW5lcnMgZmlyZS5cclxuICAgICAgRGVyaXZlZFByb3BlcnR5LmRlcml2ZUFueSggdGhpcy5zaW1TY3JlZW5zLm1hcCggc2NyZWVuID0+IHNjcmVlbi5uYW1lUHJvcGVydHkgKSwgKCAuLi5hcmdzICkgPT4gWyAuLi5hcmdzIF0gKVxyXG4gICAgXSwgKCBhdmFpbGFibGVTY3JlZW5zLCBzaW1OYW1lLCBzZWxlY3RlZFNjcmVlbiwgdGl0bGVXaXRoU2NyZWVuUGF0dGVybiApID0+IHtcclxuICAgICAgY29uc3Qgc2NyZWVuTmFtZSA9IHNlbGVjdGVkU2NyZWVuLm5hbWVQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgIGNvbnN0IGlzTXVsdGlTY3JlZW5TaW1EaXNwbGF5aW5nU2luZ2xlU2NyZWVuID0gYXZhaWxhYmxlU2NyZWVucy5sZW5ndGggPT09IDEgJiYgYWxsU2ltU2NyZWVucy5sZW5ndGggPiAxO1xyXG5cclxuICAgICAgLy8gdXBkYXRlIHRoZSB0aXRsZVRleHQgYmFzZWQgb24gdmFsdWVzIG9mIHRoZSBzaW0gbmFtZSBhbmQgc2NyZWVuIG5hbWVcclxuICAgICAgaWYgKCBpc011bHRpU2NyZWVuU2ltRGlzcGxheWluZ1NpbmdsZVNjcmVlbiAmJiBzaW1OYW1lICYmIHNjcmVlbk5hbWUgKSB7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSAnc2NyZWVucycgcXVlcnkgcGFyYW1ldGVyIHNlbGVjdHMgb25seSAxIHNjcmVlbiBhbmQgYm90aCB0aGUgc2ltIGFuZCBzY3JlZW4gbmFtZSBhcmUgbm90IHRoZSBlbXB0eVxyXG4gICAgICAgIC8vIHN0cmluZywgdGhlbiB1cGRhdGUgdGhlIG5hdiBiYXIgdGl0bGUgdG8gaW5jbHVkZSBhIGh5cGhlbiBhbmQgdGhlIHNjcmVlbiBuYW1lIGFmdGVyIHRoZSBzaW0gbmFtZS5cclxuICAgICAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCB0aXRsZVdpdGhTY3JlZW5QYXR0ZXJuLCB7XHJcbiAgICAgICAgICBzaW1OYW1lOiBzaW1OYW1lLFxyXG4gICAgICAgICAgc2NyZWVuTmFtZTogc2NyZWVuTmFtZVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggaXNNdWx0aVNjcmVlblNpbURpc3BsYXlpbmdTaW5nbGVTY3JlZW4gJiYgc2NyZWVuTmFtZSApIHtcclxuICAgICAgICByZXR1cm4gc2NyZWVuTmFtZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gc2ltTmFtZTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5HRU5FUkFMX01PREVMLmNyZWF0ZVRhbmRlbSggJ2Rpc3BsYXllZFNpbU5hbWVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWUsXHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogU3RyaW5nSU8sXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdDdXN0b21pemUgdGhpcyBzdHJpbmcgYnkgZWRpdGluZyBpdHMgZGVwZW5kZW5jaWVzLidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBMb2NhbCB2YXJpYWJsZSBpcyBzZXR0YWJsZS4uLlxyXG4gICAgY29uc3QgYnJvd3NlclRhYlZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uR0VORVJBTF9NT0RFTC5jcmVhdGVUYW5kZW0oICdicm93c2VyVGFiVmlzaWJsZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGJyb3dzZXIgdGFiIGNvbnRhaW5pbmcgdGhlIHNpbXVsYXRpb24gaXMgY3VycmVudGx5IHZpc2libGUnLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyAuLi4gYnV0IHRoZSBwdWJsaWMgY2xhc3MgYXR0cmlidXRlIGlzIHJlYWQtb25seVxyXG4gICAgdGhpcy5icm93c2VyVGFiVmlzaWJsZVByb3BlcnR5ID0gYnJvd3NlclRhYlZpc2libGVQcm9wZXJ0eTtcclxuXHJcbiAgICAvLyBzZXQgdGhlIHN0YXRlIG9mIHRoZSBwcm9wZXJ0eSB0aGF0IGluZGljYXRlcyBpZiB0aGUgYnJvd3NlciB0YWIgaXMgdmlzaWJsZVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3Zpc2liaWxpdHljaGFuZ2UnLCAoKSA9PiB7XHJcbiAgICAgIGJyb3dzZXJUYWJWaXNpYmxlUHJvcGVydHkuc2V0KCBkb2N1bWVudC52aXNpYmlsaXR5U3RhdGUgPT09ICd2aXNpYmxlJyApO1xyXG4gICAgfSwgZmFsc2UgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB3aW5kb3cucGhldC5qb2lzdC5sYXVuY2hDYWxsZWQsICdTaW0gbXVzdCBiZSBsYXVuY2hlZCB1c2luZyBzaW1MYXVuY2hlciwgJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy8xNDInICk7XHJcblxyXG4gICAgdGhpcy5zdXBwb3J0c0dlc3R1cmVEZXNjcmlwdGlvbiA9IHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuc3VwcG9ydHNJbnRlcmFjdGl2ZURlc2NyaXB0aW9uICYmIFNVUFBPUlRTX0dFU1RVUkVfREVTQ1JJUFRJT047XHJcbiAgICB0aGlzLmhhc0tleWJvYXJkSGVscENvbnRlbnQgPSBfLnNvbWUoIHRoaXMuc2ltU2NyZWVucywgc2ltU2NyZWVuID0+ICEhc2ltU2NyZWVuLmNyZWF0ZUtleWJvYXJkSGVscE5vZGUgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhd2luZG93LnBoZXQuam9pc3Quc2ltLCAnT25seSBzdXBwb3J0cyBvbmUgc2ltIGF0IGEgdGltZScgKTtcclxuICAgIHdpbmRvdy5waGV0LmpvaXN0LnNpbSA9IHRoaXM7XHJcblxyXG4gICAgdGhpcy5pc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5ID0gVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaGV0LnBoZXRpby5waGV0aW9FbmdpbmUucGhldGlvU3RhdGVFbmdpbmUuaXNTZXR0aW5nU3RhdGVQcm9wZXJ0eSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIHRoaXMuaXNDbGVhcmluZ1BoZXRpb0R5bmFtaWNFbGVtZW50c1Byb3BlcnR5ID0gVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBoZXQucGhldGlvLnBoZXRpb0VuZ2luZS5waGV0aW9TdGF0ZUVuZ2luZS5pc0NsZWFyaW5nRHluYW1pY0VsZW1lbnRzUHJvcGVydHkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIGNvbW1lbnRlZCBvdXQgYmVjYXVzZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzU1MyBpcyBkZWZlcnJlZCBmb3IgYWZ0ZXIgR1FJTy1vbmVvbmVcclxuICAgIC8vIGlmICggUEhFVF9JT19FTkFCTEVEICkge1xyXG4gICAgLy8gICB0aGlzLmVuZ2FnZW1lbnRNZXRyaWNzID0gbmV3IEVuZ2FnZW1lbnRNZXRyaWNzKCB0aGlzICk7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgdGhpcy5wcmVmZXJlbmNlc01vZGVsID0gb3B0aW9ucy5wcmVmZXJlbmNlc01vZGVsO1xyXG5cclxuICAgIC8vIGluaXRpYWxpemUgYXVkaW8gYW5kIGF1ZGlvIHN1YmNvbXBvbmVudHNcclxuICAgIGF1ZGlvTWFuYWdlci5pbml0aWFsaXplKCB0aGlzICk7XHJcblxyXG4gICAgLy8gaG9vayB1cCBzb3VuZCBnZW5lcmF0aW9uIGZvciBzY3JlZW4gY2hhbmdlc1xyXG4gICAgaWYgKCB0aGlzLnByZWZlcmVuY2VzTW9kZWwuYXVkaW9Nb2RlbC5zdXBwb3J0c1NvdW5kICkge1xyXG4gICAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoXHJcbiAgICAgICAgbmV3IFNjcmVlblNlbGVjdGlvblNvdW5kR2VuZXJhdG9yKCB0aGlzLnNlbGVjdGVkU2NyZWVuUHJvcGVydHksIHRoaXMuaG9tZVNjcmVlbiwgeyBpbml0aWFsT3V0cHV0TGV2ZWw6IDAuNSB9ICksXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgY2F0ZWdvcnlOYW1lOiAndXNlci1pbnRlcmZhY2UnXHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE1ha2UgU2NyZWVuc2hvdEdlbmVyYXRvciBhdmFpbGFibGUgZ2xvYmFsbHkgc28gaXQgY2FuIGJlIHVzZWQgaW4gcHJlbG9hZCBmaWxlcyBzdWNoIGFzIFBoRVQtaU8uXHJcbiAgICB3aW5kb3cucGhldC5qb2lzdC5TY3JlZW5zaG90R2VuZXJhdG9yID0gU2NyZWVuc2hvdEdlbmVyYXRvcjtcclxuXHJcbiAgICAvLyBJZiB0aGUgbG9jYWxlIHF1ZXJ5IHBhcmFtZXRlciB3YXMgc3BlY2lmaWVkLCB0aGVuIHdlIG1heSBiZSBydW5uaW5nIHRoZSBhbGwuaHRtbCBmaWxlLCBzbyBhZGp1c3QgdGhlIHRpdGxlLlxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy81MTBcclxuICAgIHRoaXMuc2ltTmFtZVByb3BlcnR5LmxpbmsoIHNpbU5hbWUgPT4ge1xyXG4gICAgICAkKCAndGl0bGUnICkuaHRtbCggc2ltTmFtZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEZvciBub3cgdGhlIFRvb2xiYXIgb25seSBpbmNsdWRlcyBjb250cm9scyBmb3IgVm9pY2luZyBhbmQgaXMgb25seSBjb25zdHJ1Y3RlZCB3aGVuIHRoYXQgZmVhdHVyZSBpcyBzdXBwb3J0ZWQuXHJcbiAgICBpZiAoIHRoaXMucHJlZmVyZW5jZXNNb2RlbC5hdWRpb01vZGVsLnN1cHBvcnRzVm9pY2luZyApIHtcclxuICAgICAgdGhpcy50b29sYmFyID0gbmV3IFRvb2xiYXIoIHRoaXMucHJlZmVyZW5jZXNNb2RlbC5hdWRpb01vZGVsLnRvb2xiYXJFbmFibGVkUHJvcGVydHksIHRoaXMuc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eSxcclxuICAgICAgICB0aGlzLmxvb2tBbmRGZWVsICk7XHJcblxyXG4gICAgICAvLyB3aGVuIHRoZSBUb29sYmFyIHBvc2l0aW9ucyB1cGRhdGUsIHJlc2l6ZSB0aGUgc2ltIHRvIGZpdCBpbiB0aGUgYXZhaWxhYmxlIHNwYWNlXHJcbiAgICAgIHRoaXMudG9vbGJhci5yaWdodFBvc2l0aW9uUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcclxuICAgICAgICB0aGlzLnJlc2l6ZSggdGhpcy5ib3VuZHNQcm9wZXJ0eS52YWx1ZSEud2lkdGgsIHRoaXMuYm91bmRzUHJvcGVydHkudmFsdWUhLmhlaWdodCApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kaXNwbGF5ID0gbmV3IFNpbURpc3BsYXkoIHNpbURpc3BsYXlPcHRpb25zICk7XHJcbiAgICB0aGlzLnJvb3ROb2RlID0gdGhpcy5kaXNwbGF5LnJvb3ROb2RlO1xyXG5cclxuICAgIEhlbHBlci5pbml0aWFsaXplKCB0aGlzLCB0aGlzLmRpc3BsYXkgKTtcclxuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIHRoaXMuYWN0aXZlUHJvcGVydHksIHBoZXQuam9pc3QucGxheWJhY2tNb2RlRW5hYmxlZFByb3BlcnR5IF0sICggYWN0aXZlLCBwbGF5YmFja01vZGVFbmFibGVkOiBib29sZWFuICkgPT4ge1xyXG5cclxuICAgICAgLy8gSWYgaW4gcGxheWJhY2tNb2RlIGlzIGVuYWJsZWQsIHRoZW4gdGhlIGRpc3BsYXkgbXVzdCBiZSBpbnRlcmFjdGl2ZSB0byBzdXBwb3J0IFBET00gZXZlbnQgbGlzdGVuZXJzIGR1cmluZ1xyXG4gICAgICAvLyBwbGF5YmFjayAod2hpY2ggb2Z0ZW4gY29tZSBkaXJlY3RseSBmcm9tIHNpbSBjb2RlIGFuZCBub3QgZnJvbSB1c2VyIGlucHV0KS5cclxuICAgICAgaWYgKCBwbGF5YmFja01vZGVFbmFibGVkICkge1xyXG4gICAgICAgIHRoaXMuZGlzcGxheS5pbnRlcmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgZ2xvYmFsS2V5U3RhdGVUcmFja2VyLmVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBXaGVuIHRoZSBzaW0gaXMgaW5hY3RpdmUsIG1ha2UgaXQgbm9uLWludGVyYWN0aXZlLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzQxNFxyXG4gICAgICAgIHRoaXMuZGlzcGxheS5pbnRlcmFjdGl2ZSA9IGFjdGl2ZTtcclxuICAgICAgICBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIuZW5hYmxlZCA9IGFjdGl2ZTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHRoaXMuZGlzcGxheS5kb21FbGVtZW50ICk7XHJcblxyXG4gICAgSGVhcnRiZWF0LnN0YXJ0KCB0aGlzICk7XHJcblxyXG4gICAgdGhpcy5uYXZpZ2F0aW9uQmFyID0gbmV3IE5hdmlnYXRpb25CYXIoIHRoaXMsIFRhbmRlbS5HRU5FUkFMX1ZJRVcuY3JlYXRlVGFuZGVtKCAnbmF2aWdhdGlvbkJhcicgKSApO1xyXG5cclxuICAgIHRoaXMudXBkYXRlQmFja2dyb3VuZCA9ICgpID0+IHtcclxuICAgICAgdGhpcy5sb29rQW5kRmVlbC5iYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eS52YWx1ZSA9IENvbG9yLnRvQ29sb3IoIHRoaXMuc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eS52YWx1ZS5iYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmxvb2tBbmRGZWVsLmJhY2tncm91bmRDb2xvclByb3BlcnR5LmxpbmsoIGJhY2tncm91bmRDb2xvciA9PiB7XHJcbiAgICAgIHRoaXMuZGlzcGxheS5iYWNrZ3JvdW5kQ29sb3IgPSBiYWNrZ3JvdW5kQ29sb3I7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zZWxlY3RlZFNjcmVlblByb3BlcnR5LmxpbmsoICgpID0+IHRoaXMudXBkYXRlQmFja2dyb3VuZCgpICk7XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgdXNlciBzd2l0Y2hlcyBzY3JlZW5zLCBpbnRlcnJ1cHQgdGhlIGlucHV0IG9uIHRoZSBwcmV2aW91cyBzY3JlZW4uXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzIxOFxyXG4gICAgdGhpcy5zZWxlY3RlZFNjcmVlblByb3BlcnR5LmxhenlMaW5rKCAoIG5ld1NjcmVlbiwgb2xkU2NyZWVuICkgPT4gb2xkU2NyZWVuLnZpZXcuaW50ZXJydXB0U3VidHJlZUlucHV0KCkgKTtcclxuXHJcbiAgICB0aGlzLnNpbUluZm8gPSBuZXcgU2ltSW5mbyggdGhpcyApO1xyXG5cclxuICAgIC8vIFNldCB1cCBQaEVULWlPLCBtdXN0IGJlIGRvbmUgYWZ0ZXIgcGhldC5qb2lzdC5zaW0gaXMgYXNzaWduZWRcclxuICAgIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgJiYgcGhldC5waGV0aW8ucGhldGlvRW5naW5lLm9uU2ltQ29uc3RydWN0aW9uU3RhcnRlZChcclxuICAgICAgdGhpcy5zaW1JbmZvLFxyXG4gICAgICB0aGlzLmlzQ29uc3RydWN0aW9uQ29tcGxldGVQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5mcmFtZUVuZGVkRW1pdHRlcixcclxuICAgICAgdGhpcy5kaXNwbGF5XHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eS5sYXp5TGluayggaXNTZXR0aW5nU3RhdGUgPT4ge1xyXG4gICAgICBpZiAoICFpc1NldHRpbmdTdGF0ZSApIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXdzKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmJvdW5kUnVuQW5pbWF0aW9uTG9vcCA9IHRoaXMucnVuQW5pbWF0aW9uTG9vcC5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgLy8gVGhpcmQgcGFydHkgc3VwcG9ydFxyXG4gICAgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5sZWdlbmRzT2ZMZWFybmluZyAmJiBuZXcgTGVnZW5kc09mTGVhcm5pbmdTdXBwb3J0KCB0aGlzICkuc3RhcnQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgdmlld3Mgb2YgdGhlIHNpbS4gVGhpcyBpcyBtZWFudCB0byBydW4gYWZ0ZXIgdGhlIHN0YXRlIGhhcyBiZWVuIHNldCB0byBtYWtlIHN1cmUgdGhhdCBhbGwgdmlld1xyXG4gICAqIGVsZW1lbnRzIGFyZSBpbiBzeW5jIHdpdGggdGhlIG5ldywgY3VycmVudCBzdGF0ZSBvZiB0aGUgc2ltLiAoZXZlbiB3aGVuIHRoZSBzaW0gaXMgaW5hY3RpdmUsIGFzIGluIHRoZSBzdGF0ZVxyXG4gICAqIHdyYXBwZXIpLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgdXBkYXRlVmlld3MoKTogdm9pZCB7XHJcblxyXG4gICAgLy8gVHJpZ2dlciBsYXlvdXQgY29kZVxyXG4gICAgdGhpcy5yZXNpemVUb1dpbmRvdygpO1xyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eS52YWx1ZS52aWV3LnN0ZXAgJiYgdGhpcy5zZWxlY3RlZFNjcmVlblByb3BlcnR5LnZhbHVlLnZpZXcuc3RlcCggMCApO1xyXG5cclxuICAgIC8vIENsZWFyIGFsbCBVdHRlcmFuY2VRdWV1ZSBvdXRwdXRzIHRoYXQgbWF5IGhhdmUgY29sbGVjdGVkIFV0dGVyYW5jZXMgd2hpbGUgc3RhdGUtc2V0dGluZyBsb2dpYyBvY2N1cnJlZC5cclxuICAgIC8vIFRoaXMgaXMgdHJhbnNpZW50LiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdXR0ZXJhbmNlLXF1ZXVlL2lzc3Vlcy8yMiBhbmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzEzOTdcclxuICAgIHRoaXMuZGlzcGxheS5kZXNjcmlwdGlvblV0dGVyYW5jZVF1ZXVlLmNsZWFyKCk7XHJcbiAgICB2b2ljaW5nVXR0ZXJhbmNlUXVldWUuY2xlYXIoKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYXN5bmNocm9ub3VzbHkgc2luY2UgaXQgY2FuIHRyaWdnZXIgZXZlbnRzIG9uIHBvaW50ZXIgdmFsaWRhdGlvbiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waC1zY2FsZS9pc3N1ZXMvMjEyXHJcbiAgICBhbmltYXRpb25GcmFtZVRpbWVyLnJ1bk9uTmV4dFRpY2soICgpID0+IHBoZXQuam9pc3QuZGlzcGxheS51cGRhdGVEaXNwbGF5KCkgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZmluaXNoSW5pdCggc2NyZWVuczogQW55U2NyZWVuW10gKTogdm9pZCB7XHJcblxyXG4gICAgXy5lYWNoKCBzY3JlZW5zLCBzY3JlZW4gPT4ge1xyXG4gICAgICBzY3JlZW4udmlldy5sYXllclNwbGl0ID0gdHJ1ZTtcclxuICAgICAgdGhpcy5kaXNwbGF5LnNpbXVsYXRpb25Sb290LmFkZENoaWxkKCBzY3JlZW4udmlldyApO1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5kaXNwbGF5LnNpbXVsYXRpb25Sb290LmFkZENoaWxkKCB0aGlzLm5hdmlnYXRpb25CYXIgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMucHJlZmVyZW5jZXNNb2RlbC5hdWRpb01vZGVsLnN1cHBvcnRzVm9pY2luZyApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy50b29sYmFyLCAndG9vbGJhciBzaG91bGQgZXhpc3QgZm9yIHZvaWNpbmcnICk7XHJcbiAgICAgIHRoaXMuZGlzcGxheS5zaW11bGF0aW9uUm9vdC5hZGRDaGlsZCggdGhpcy50b29sYmFyISApO1xyXG4gICAgICB0aGlzLmRpc3BsYXkuc2ltdWxhdGlvblJvb3QucGRvbU9yZGVyID0gWyB0aGlzLnRvb2xiYXIhIF07XHJcblxyXG4gICAgICAvLyBJZiBWb2ljaW5nIGlzIG5vdCBcImZ1bGx5XCIgZW5hYmxlZCwgb25seSB0aGUgdG9vbGJhciBpcyBhYmxlIHRvIHByb2R1Y2UgVm9pY2luZyBvdXRwdXQuXHJcbiAgICAgIC8vIEFsbCBvdGhlciBzaW11bGF0aW9uIGNvbXBvbmVudHMgc2hvdWxkIG5vdCB2b2ljZSBhbnl0aGluZy4gVGhpcyBtdXN0IGJlIGNhbGxlZCBvbmx5IGFmdGVyXHJcbiAgICAgIC8vIGFsbCBTY3JlZW5WaWV3cyBoYXZlIGJlZW4gY29uc3RydWN0ZWQuXHJcbiAgICAgIHZvaWNpbmdNYW5hZ2VyLnZvaWNpbmdGdWxseUVuYWJsZWRQcm9wZXJ0eS5saW5rKCBmdWxseUVuYWJsZWQgPT4ge1xyXG4gICAgICAgIHRoaXMuc2V0U2ltVm9pY2luZ1Zpc2libGUoIGZ1bGx5RW5hYmxlZCApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zZWxlY3RlZFNjcmVlblByb3BlcnR5LmxpbmsoIGN1cnJlbnRTY3JlZW4gPT4ge1xyXG4gICAgICBzY3JlZW5zLmZvckVhY2goIHNjcmVlbiA9PiB7XHJcbiAgICAgICAgY29uc3QgdmlzaWJsZSA9IHNjcmVlbiA9PT0gY3VycmVudFNjcmVlbjtcclxuXHJcbiAgICAgICAgLy8gTWFrZSB0aGUgc2VsZWN0ZWQgc2NyZWVuIHZpc2libGUgYW5kIGFjdGl2ZSwgb3RoZXIgc2NyZWVucyBpbnZpc2libGUgYW5kIGluYWN0aXZlLlxyXG4gICAgICAgIC8vIHNjcmVlbi5pc0FjdGl2ZVByb3BlcnR5IHNob3VsZCBjaGFuZ2Ugb25seSB3aGlsZSB0aGUgc2NyZWVuIGlzIGludmlzaWJsZSwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy80MThcclxuICAgICAgICBpZiAoIHZpc2libGUgKSB7XHJcbiAgICAgICAgICBzY3JlZW4uYWN0aXZlUHJvcGVydHkuc2V0KCB2aXNpYmxlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNjcmVlbi52aWV3LnNldFZpc2libGUoIHZpc2libGUgKTtcclxuICAgICAgICBpZiAoICF2aXNpYmxlICkge1xyXG4gICAgICAgICAgc2NyZWVuLmFjdGl2ZVByb3BlcnR5LnNldCggdmlzaWJsZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLnVwZGF0ZUJhY2tncm91bmQoKTtcclxuXHJcbiAgICAgIGlmICggIXRoaXMuaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eS52YWx1ZSApIHtcclxuXHJcbiAgICAgICAgLy8gWm9vbSBvdXQgYWdhaW4gYWZ0ZXIgY2hhbmdpbmcgc2NyZWVucyBzbyB3ZSBkb24ndCBwYW4gdG8gdGhlIGNlbnRlciBvZiB0aGUgZm9jdXNlZCBTY3JlZW5WaWV3LFxyXG4gICAgICAgIC8vIGFuZCBzbyB1c2VyIGhhcyBhbiBvdmVydmlldyBvZiB0aGUgbmV3IHNjcmVlbiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvNjgyLlxyXG4gICAgICAgIGFuaW1hdGVkUGFuWm9vbVNpbmdsZXRvbi5saXN0ZW5lciEucmVzZXRUcmFuc2Zvcm0oKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZGlzcGxheS5zaW11bGF0aW9uUm9vdC5hZGRDaGlsZCggdGhpcy50b3BMYXllciApO1xyXG5cclxuICAgIC8vIEZpdCB0byB0aGUgd2luZG93IGFuZCByZW5kZXIgdGhlIGluaXRpYWwgc2NlbmVcclxuICAgIC8vIENhbid0IHN5bmNocm9ub3VzbHkgZG8gdGhpcyBpbiBGaXJlZm94LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZlZ2FzL2lzc3Vlcy81NSBhbmRcclxuICAgIC8vIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTg0MDQxMi5cclxuICAgIGNvbnN0IHJlc2l6ZUxpc3RlbmVyID0gKCkgPT4ge1xyXG5cclxuICAgICAgLy8gRG9uJ3QgcmVzaXplIG9uIHdpbmRvdyBzaXplIGNoYW5nZXMgaWYgd2UgYXJlIHBsYXlpbmcgYmFjayBpbnB1dCBldmVudHMuXHJcbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzM3XHJcbiAgICAgIGlmICggIXBoZXQuam9pc3QucGxheWJhY2tNb2RlRW5hYmxlZFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIHRoaXMucmVzaXplUGVuZGluZyA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICAkKCB3aW5kb3cgKS5yZXNpemUoIHJlc2l6ZUxpc3RlbmVyICk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3Jlc2l6ZScsIHJlc2l6ZUxpc3RlbmVyICk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ29yaWVudGF0aW9uY2hhbmdlJywgcmVzaXplTGlzdGVuZXIgKTtcclxuICAgIHdpbmRvdy52aXN1YWxWaWV3cG9ydCAmJiB3aW5kb3cudmlzdWFsVmlld3BvcnQuYWRkRXZlbnRMaXN0ZW5lciggJ3Jlc2l6ZScsIHJlc2l6ZUxpc3RlbmVyICk7XHJcbiAgICB0aGlzLnJlc2l6ZVRvV2luZG93KCk7XHJcblxyXG4gICAgLy8gS2ljayBvZmYgY2hlY2tpbmcgZm9yIHVwZGF0ZXMsIGlmIHRoYXQgaXMgZW5hYmxlZFxyXG4gICAgdXBkYXRlQ2hlY2suY2hlY2soKTtcclxuXHJcbiAgICAvLyBJZiB0aGVyZSBhcmUgd2FybmluZ3MsIHNob3cgdGhlbSBpbiBhIGRpYWxvZ1xyXG4gICAgaWYgKCBRdWVyeVN0cmluZ01hY2hpbmUud2FybmluZ3MubGVuZ3RoICkge1xyXG4gICAgICBjb25zdCB3YXJuaW5nRGlhbG9nID0gbmV3IFF1ZXJ5UGFyYW1ldGVyc1dhcm5pbmdEaWFsb2coIFF1ZXJ5U3RyaW5nTWFjaGluZS53YXJuaW5ncywge1xyXG4gICAgICAgIGNsb3NlQnV0dG9uTGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICAgIHdhcm5pbmdEaWFsb2cuaGlkZSgpO1xyXG4gICAgICAgICAgd2FybmluZ0RpYWxvZy5kaXNwb3NlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHdhcm5pbmdEaWFsb2cuc2hvdygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLypcclxuICAgKiBBZGRzIGEgcG9wdXAgaW4gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lLiBJZiB0aGUgcG9wdXAgaXMgbW9kZWwsIGl0IGRpc3BsYXlzIGEgc2VtaS10cmFuc3BhcmVudCBibGFjayBpbnB1dFxyXG4gICAqIGJhcnJpZXIgYmVoaW5kIGl0LiBBIG1vZGFsIHBvcHVwIHByZXZlbnQgdGhlIHVzZXIgZnJvbSBpbnRlcmFjdGluZyB3aXRoIHRoZSByZXNldCBvZiB0aGUgYXBwbGljYXRpb24gdW50aWwgdGhlXHJcbiAgICogcG9wdXAgaXMgaGlkZGVuLiBVc2UgaGlkZVBvcHVwKCkgdG8gaGlkZSB0aGUgcG9wdXAuXHJcbiAgICogQHBhcmFtIHBvcHVwIC0gdGhlIHBvcHVwLCBtdXN0IGltcGxlbWVudGVkIG5vZGUuaGlkZSgpLCBjYWxsZWQgYnkgaGlkZVBvcHVwXHJcbiAgICogQHBhcmFtIGlzTW9kYWwgLSB3aGV0aGVyIHBvcHVwIGlzIG1vZGFsXHJcbiAgICovXHJcbiAgcHVibGljIHNob3dQb3B1cCggcG9wdXA6IFBvcHVwYWJsZU5vZGUsIGlzTW9kYWw6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb3B1cCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggISFwb3B1cC5oaWRlLCAnTWlzc2luZyBwb3B1cC5oaWRlKCkgZm9yIHNob3dQb3B1cCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLnRvcExheWVyLmhhc0NoaWxkKCBwb3B1cCApLCAncG9wdXAgYWxyZWFkeSBzaG93bicgKTtcclxuICAgIGlmICggaXNNb2RhbCApIHtcclxuICAgICAgdGhpcy5yb290Tm9kZS5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcclxuICAgICAgdGhpcy5tb2RhbE5vZGVTdGFjay5wdXNoKCBwb3B1cCApO1xyXG5cclxuICAgICAgLy8gcGRvbSAtIG1vZGFsIGRpYWxvZ3Mgc2hvdWxkIGJlIHRoZSBvbmx5IHJlYWRhYmxlIGNvbnRlbnQgaW4gdGhlIHNpbVxyXG4gICAgICB0aGlzLnNldFBET01WaWV3c1Zpc2libGUoIGZhbHNlICk7XHJcblxyXG4gICAgICAvLyB2b2ljaW5nIC0gcmVzcG9uc2VzIGZyb20gTm9kZXMgaGlkZGVuIGJ5IHRoZSBtb2RhbCBkaWFsb2cgc2hvdWxkIG5vdCB2b2ljZS5cclxuICAgICAgdGhpcy5zZXROb25Nb2RhbFZvaWNpbmdWaXNpYmxlKCBmYWxzZSApO1xyXG4gICAgfVxyXG4gICAgaWYgKCBwb3B1cC5sYXlvdXQgKSB7XHJcbiAgICAgIHBvcHVwLmxheW91dCggdGhpcy5zY3JlZW5Cb3VuZHNQcm9wZXJ0eS52YWx1ZSEgKTtcclxuICAgIH1cclxuICAgIHRoaXMudG9wTGF5ZXIuYWRkQ2hpbGQoIHBvcHVwICk7XHJcbiAgfVxyXG5cclxuICAvKlxyXG4gICAqIEhpZGVzIGEgcG9wdXAgdGhhdCB3YXMgcHJldmlvdXNseSBkaXNwbGF5ZWQgd2l0aCBzaG93UG9wdXAoKVxyXG4gICAqIEBwYXJhbSBwb3B1cFxyXG4gICAqIEBwYXJhbSBpc01vZGFsIC0gd2hldGhlciBwb3B1cCBpcyBtb2RhbFxyXG4gICAqL1xyXG4gIHB1YmxpYyBoaWRlUG9wdXAoIHBvcHVwOiBQb3B1cGFibGVOb2RlLCBpc01vZGFsOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcG9wdXAgJiYgdGhpcy5tb2RhbE5vZGVTdGFjay5pbmNsdWRlcyggcG9wdXAgKSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy50b3BMYXllci5oYXNDaGlsZCggcG9wdXAgKSwgJ3BvcHVwIHdhcyBub3Qgc2hvd24nICk7XHJcbiAgICBpZiAoIGlzTW9kYWwgKSB7XHJcbiAgICAgIHRoaXMubW9kYWxOb2RlU3RhY2sucmVtb3ZlKCBwb3B1cCApO1xyXG4gICAgICBpZiAoIHRoaXMubW9kYWxOb2RlU3RhY2subGVuZ3RoID09PSAwICkge1xyXG5cclxuICAgICAgICAvLyBBZnRlciBoaWRpbmcgYWxsIHBvcHVwcywgVm9pY2luZyBiZWNvbWVzIGVuYWJsZWQgZm9yIGNvbXBvbmVudHMgaW4gdGhlIHNpbXVsYXRpb24gd2luZG93IG9ubHkgaWZcclxuICAgICAgICAvLyBcIlNpbSBWb2ljaW5nXCIgc3dpdGNoIGlzIG9uLlxyXG4gICAgICAgIHRoaXMuc2V0Tm9uTW9kYWxWb2ljaW5nVmlzaWJsZSggdm9pY2luZ01hbmFnZXIudm9pY2luZ0Z1bGx5RW5hYmxlZFByb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgICAgIC8vIHBkb20gLSB3aGVuIHRoZSBkaWFsb2cgaXMgaGlkZGVuLCBtYWtlIGFsbCBTY3JlZW5WaWV3IGNvbnRlbnQgdmlzaWJsZSB0byBhc3Npc3RpdmUgdGVjaG5vbG9neVxyXG4gICAgICAgIHRoaXMuc2V0UERPTVZpZXdzVmlzaWJsZSggdHJ1ZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnRvcExheWVyLnJlbW92ZUNoaWxkKCBwb3B1cCApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNpemVUb1dpbmRvdygpOiB2b2lkIHtcclxuICAgIHRoaXMucmVzaXplUGVuZGluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5yZXNpemUoIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWQtc2ltLXRleHRcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVzaXplKCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIHRoaXMucmVzaXplQWN0aW9uLmV4ZWN1dGUoIHdpZHRoLCBoZWlnaHQgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydCgpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBJbiBvcmRlciB0byBhbmltYXRlIHRoZSBsb2FkaW5nIHByb2dyZXNzIGJhciwgd2UgbXVzdCBzY2hlZHVsZSB3b3JrIHdpdGggc2V0VGltZW91dFxyXG4gICAgLy8gVGhpcyBhcnJheSBvZiB7ZnVuY3Rpb259IGlzIHRoZSB3b3JrIHRoYXQgbXVzdCBiZSBjb21wbGV0ZWQgdG8gbGF1bmNoIHRoZSBzaW0uXHJcbiAgICBjb25zdCB3b3JrSXRlbXM6IEFycmF5PCgpID0+IHZvaWQ+ID0gW107XHJcblxyXG4gICAgLy8gU2NoZWR1bGUgaW5zdGFudGlhdGlvbiBvZiB0aGUgc2NyZWVuc1xyXG4gICAgdGhpcy5zY3JlZW5zLmZvckVhY2goIHNjcmVlbiA9PiB7XHJcbiAgICAgIHdvcmtJdGVtcy5wdXNoKCAoKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIFNjcmVlbnMgbWF5IHNoYXJlIHRoZSBzYW1lIGluc3RhbmNlIG9mIGJhY2tncm91bmRQcm9wZXJ0eSwgc2VlIGpvaXN0IzQ0MVxyXG4gICAgICAgIGlmICggIXNjcmVlbi5iYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eS5oYXNMaXN0ZW5lciggdGhpcy51cGRhdGVCYWNrZ3JvdW5kICkgKSB7XHJcbiAgICAgICAgICBzY3JlZW4uYmFja2dyb3VuZENvbG9yUHJvcGVydHkubGluayggdGhpcy51cGRhdGVCYWNrZ3JvdW5kICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNjcmVlbi5pbml0aWFsaXplTW9kZWwoKTtcclxuICAgICAgfSApO1xyXG4gICAgICB3b3JrSXRlbXMucHVzaCggKCkgPT4ge1xyXG4gICAgICAgIHNjcmVlbi5pbml0aWFsaXplVmlldyggdGhpcy5zaW1OYW1lUHJvcGVydHksIHRoaXMuZGlzcGxheWVkU2ltTmFtZVByb3BlcnR5LCB0aGlzLnNjcmVlbnMubGVuZ3RoLCB0aGlzLmhvbWVTY3JlZW4gPT09IHNjcmVlbiApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gbG9vcCB0byBydW4gc3RhcnR1cCBpdGVtcyBhc3luY2hyb25vdXNseSBzbyB0aGUgRE9NIGNhbiBiZSB1cGRhdGVkIHRvIHNob3cgYW5pbWF0aW9uIG9uIHRoZSBwcm9ncmVzcyBiYXJcclxuICAgIGNvbnN0IHJ1bkl0ZW0gPSAoIGk6IG51bWJlciApID0+IHtcclxuICAgICAgc2V0VGltZW91dCggLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWQtc2ltLXRleHRcclxuICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICB3b3JrSXRlbXNbIGkgXSgpO1xyXG5cclxuICAgICAgICAgIC8vIE1vdmUgdGhlIHByb2dyZXNzIGFoZWFkIGJ5IG9uZSBzbyB3ZSBzaG93IHRoZSBmdWxsIHByb2dyZXNzIGJhciBmb3IgYSBtb21lbnQgYmVmb3JlIHRoZSBzaW0gc3RhcnRzIHVwXHJcblxyXG4gICAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBEb3RVdGlscy5saW5lYXIoIDAsIHdvcmtJdGVtcy5sZW5ndGggLSAxLCAwLjI1LCAxLjAsIGkgKTtcclxuXHJcbiAgICAgICAgICAvLyBTdXBwb3J0IGlPUyBSZWFkaW5nIE1vZGUsIHdoaWNoIHNhdmVzIGEgRE9NIHNuYXBzaG90IGFmdGVyIHRoZSBwcm9ncmVzc0JhckZvcmVncm91bmQgaGFzIGFscmVhZHkgYmVlblxyXG4gICAgICAgICAgLy8gcmVtb3ZlZCBmcm9tIHRoZSBkb2N1bWVudCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvMzg5XHJcbiAgICAgICAgICBpZiAoIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAncHJvZ3Jlc3NCYXJGb3JlZ3JvdW5kJyApICkge1xyXG5cclxuICAgICAgICAgICAgLy8gR3JvdyB0aGUgcHJvZ3Jlc3MgYmFyIGZvcmVncm91bmQgdG8gdGhlIHJpZ2h0IGJhc2VkIG9uIHRoZSBwcm9ncmVzcyBzbyBmYXIuXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAncHJvZ3Jlc3NCYXJGb3JlZ3JvdW5kJyApIS5zZXRBdHRyaWJ1dGUoICd3aWR0aCcsIGAke3Byb2dyZXNzICogUFJPR1JFU1NfQkFSX1dJRFRIfWAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICggaSArIDEgPCB3b3JrSXRlbXMubGVuZ3RoICkge1xyXG4gICAgICAgICAgICBydW5JdGVtKCBpICsgMSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoICgpID0+IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWQtc2ltLXRleHRcclxuICAgICAgICAgICAgICB0aGlzLmZpbmlzaEluaXQoIHRoaXMuc2NyZWVucyApO1xyXG5cclxuICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGlzIGRlZmluZWRcclxuICAgICAgICAgICAgICBVdGlscy5wb2x5ZmlsbFJlcXVlc3RBbmltYXRpb25GcmFtZSgpO1xyXG5cclxuICAgICAgICAgICAgICAvLyBPcHRpb24gZm9yIHByb2ZpbGluZ1xyXG4gICAgICAgICAgICAgIC8vIGlmIHRydWUsIHByaW50cyBzY3JlZW4gaW5pdGlhbGl6YXRpb24gdGltZSAodG90YWwsIG1vZGVsLCB2aWV3KSB0byB0aGUgY29uc29sZSBhbmQgZGlzcGxheXNcclxuICAgICAgICAgICAgICAvLyBwcm9maWxpbmcgaW5mb3JtYXRpb24gb24gdGhlIHNjcmVlblxyXG4gICAgICAgICAgICAgIGlmICggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5wcm9maWxlciApIHtcclxuICAgICAgICAgICAgICAgIFByb2ZpbGVyLnN0YXJ0KCB0aGlzICk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAvLyBOb3RpZnkgbGlzdGVuZXJzIHRoYXQgYWxsIG1vZGVscyBhbmQgdmlld3MgaGF2ZSBiZWVuIGNvbnN0cnVjdGVkLCBhbmQgdGhlIFNpbSBpcyByZWFkeSB0byBiZSBzaG93bi5cclxuICAgICAgICAgICAgICAvLyBVc2VkIGJ5IFBoRVQtaU8uIFRoaXMgZG9lcyBub3QgY29pbmNpZGUgd2l0aCB0aGUgZW5kIG9mIHRoZSBTaW0gY29uc3RydWN0b3IgKGJlY2F1c2UgU2ltIGhhc1xyXG4gICAgICAgICAgICAgIC8vIGFzeW5jaHJvbm91cyBzdGVwcyB0aGF0IGZpbmlzaCBhZnRlciB0aGUgY29uc3RydWN0b3IgaXMgY29tcGxldGVkIClcclxuICAgICAgICAgICAgICB0aGlzLl9pc0NvbnN0cnVjdGlvbkNvbXBsZXRlUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAvLyBwbGFjZSB0aGUgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICpiZWZvcmUqIHJlbmRlcmluZyB0byBhc3N1cmUgYXMgY2xvc2UgdG8gNjBmcHMgd2l0aCB0aGUgc2V0VGltZW91dCBmYWxsYmFjay5cclxuICAgICAgICAgICAgICAvLyBodHRwOi8vcGF1bGlyaXNoLmNvbS8yMDExL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtYW5pbWF0aW5nL1xyXG4gICAgICAgICAgICAgIC8vIExhdW5jaCB0aGUgYm91bmQgdmVyc2lvbiBzbyBpdCBjYW4gZWFzaWx5IGJlIHN3YXBwZWQgb3V0IGZvciBkZWJ1Z2dpbmcuXHJcbiAgICAgICAgICAgICAgLy8gU2NoZWR1bGVzIGFuaW1hdGlvbiB1cGRhdGVzIGFuZCBydW5zIHRoZSBmaXJzdCBzdGVwKClcclxuICAgICAgICAgICAgICB0aGlzLmJvdW5kUnVuQW5pbWF0aW9uTG9vcCgpO1xyXG5cclxuICAgICAgICAgICAgICAvLyBJZiB0aGUgc2ltIGlzIGluIHBsYXliYWNrIG1vZGUsIHRoZW4gZmx1c2ggdGhlIHRpbWVyJ3MgbGlzdGVuZXJzLiBUaGlzIG1ha2VzIHN1cmUgdGhhdCBhbnl0aGluZyBraWNrZWRcclxuICAgICAgICAgICAgICAvLyB0byB0aGUgbmV4dCBmcmFtZSB3aXRoIGB0aW1lci5ydW5Pbk5leHRUaWNrYCBkdXJpbmcgc3RhcnR1cCAobGlrZSBldmVyeSBub3RpZmljYXRpb24gYWJvdXQgYSBQaEVULWlPXHJcbiAgICAgICAgICAgICAgLy8gaW5zdHJ1bWVudGVkIGVsZW1lbnQgaW4gcGhldGlvRW5naW5lLnBoZXRpb09iamVjdEFkZGVkKCkpIGNhbiBjbGVhciBvdXQgYmVmb3JlIGJlZ2lubmluZyBwbGF5YmFjay5cclxuICAgICAgICAgICAgICBpZiAoIHBoZXQuam9pc3QucGxheWJhY2tNb2RlRW5hYmxlZFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJlZm9yZUNvdW50cyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBpZiAoIGFzc2VydCApIHtcclxuICAgICAgICAgICAgICAgICAgYmVmb3JlQ291bnRzID0gQXJyYXkuZnJvbSggUmFuZG9tLmFsbFJhbmRvbUluc3RhbmNlcyApLm1hcCggbiA9PiBuLm51bWJlck9mQ2FsbHMgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzdGVwVGltZXIuZW1pdCggMCApO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICAgICAgICAgICAgICBjb25zdCBhZnRlckNvdW50cyA9IEFycmF5LmZyb20oIFJhbmRvbS5hbGxSYW5kb21JbnN0YW5jZXMgKS5tYXAoIG4gPT4gbi5udW1iZXJPZkNhbGxzICk7XHJcbiAgICAgICAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uaXNFcXVhbCggYmVmb3JlQ291bnRzLCBhZnRlckNvdW50cyApLFxyXG4gICAgICAgICAgICAgICAgICAgIGBSYW5kb20gd2FzIGNhbGxlZCBtb3JlIHRpbWVzIGluIHRoZSBwbGF5YmFjayBzaW0gb24gc3RhcnR1cCwgYmVmb3JlOiAke2JlZm9yZUNvdW50c30sIGFmdGVyOiAke2FmdGVyQ291bnRzfWAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIC8vIEFmdGVyIHRoZSBhcHBsaWNhdGlvbiBpcyByZWFkeSB0byBnbywgcmVtb3ZlIHRoZSBzcGxhc2ggc2NyZWVuIGFuZCBwcm9ncmVzcyBiYXIuICBOb3RlIHRoZSBzcGxhc2hcclxuICAgICAgICAgICAgICAvLyBzY3JlZW4gaXMgcmVtb3ZlZCBhZnRlciBvbmUgc3RlcCgpLCBzbyB0aGUgcmVuZGVyaW5nIGlzIHJlYWR5IHRvIGdvIHdoZW4gdGhlIHByb2dyZXNzIGJhciBpcyBoaWRkZW4uXHJcbiAgICAgICAgICAgICAgLy8gbm8tb3Agb3RoZXJ3aXNlIGFuZCB3aWxsIGJlIGRpc3Bvc2VkIGJ5IHBoZXRpb0VuZ2luZS5cclxuICAgICAgICAgICAgICBpZiAoICFUYW5kZW0uUEhFVF9JT19FTkFCTEVEIHx8IHBoZXQucHJlbG9hZHMucGhldGlvLnF1ZXJ5UGFyYW1ldGVycy5waGV0aW9TdGFuZGFsb25lICkge1xyXG4gICAgICAgICAgICAgICAgd2luZG93LnBoZXRTcGxhc2hTY3JlZW4uZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAvLyBTYW5pdHkgY2hlY2sgdGhhdCB0aGVyZSBpcyBubyBwaGV0aW8gb2JqZWN0IGluIHBoZXQgYnJhbmQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMTIyOVxyXG4gICAgICAgICAgICAgIHBoZXQuY2hpcHBlci5icmFuZCA9PT0gJ3BoZXQnICYmIGFzc2VydCAmJiBhc3NlcnQoICFUYW5kZW0uUEhFVF9JT19FTkFCTEVELCAnd2luZG93LnBoZXQucHJlbG9hZHMucGhldGlvIHNob3VsZCBub3QgZXhpc3QgZm9yIHBoZXQgYnJhbmQnICk7XHJcblxyXG4gICAgICAgICAgICAgIC8vIENvbW11bmljYXRlIHNpbSBsb2FkIChzdWNjZXNzZnVsbHkpIHRvIGpvaXN0L3Rlc3RzL3Rlc3Qtc2ltcy5odG1sXHJcbiAgICAgICAgICAgICAgaWYgKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmNvbnRpbnVvdXNUZXN0ICkge1xyXG4gICAgICAgICAgICAgICAgcGhldC5jaGlwcGVyLnJlcG9ydENvbnRpbnVvdXNUZXN0UmVzdWx0KCB7XHJcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdjb250aW51b3VzLXRlc3QtbG9hZCdcclxuICAgICAgICAgICAgICAgIH0gKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnBvc3RNZXNzYWdlT25Mb2FkICkge1xyXG4gICAgICAgICAgICAgICAgd2luZG93LnBhcmVudCAmJiB3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKCBKU09OLnN0cmluZ2lmeSgge1xyXG4gICAgICAgICAgICAgICAgICB0eXBlOiAnbG9hZCcsXHJcbiAgICAgICAgICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWZcclxuICAgICAgICAgICAgICAgIH0gKSwgJyonICk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAyNSApOyAvLyBwYXVzZSBmb3IgYSBmZXcgbWlsbGlzZWNvbmRzIHdpdGggdGhlIHByb2dyZXNzIGJhciBmaWxsZWQgaW4gYmVmb3JlIGdvaW5nIHRvIHRoZSBob21lIHNjcmVlblxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgc2V0cyB0aGUgYW1vdW50IG9mIGRlbGF5IGJldHdlZW4gZWFjaCB3b3JrIGl0ZW0gdG8gbWFrZSBpdCBlYXNpZXIgdG8gc2VlIHRoZSBjaGFuZ2VzIHRvIHRoZVxyXG4gICAgICAgIC8vIHByb2dyZXNzIGJhci4gIEEgdG90YWwgdmFsdWUgaXMgZGl2aWRlZCBieSB0aGUgbnVtYmVyIG9mIHdvcmsgaXRlbXMuICBUaGlzIG1ha2VzIGl0IHBvc3NpYmxlIHRvIHNlZSB0aGVcclxuICAgICAgICAvLyBwcm9ncmVzcyBiYXIgd2hlbiBmZXcgd29yayBpdGVtcyBleGlzdCwgc3VjaCBhcyBmb3IgYSBzaW5nbGUgc2NyZWVuIHNpbSwgYnV0IGFsbG93cyB0aGluZ3MgdG8gbW92ZVxyXG4gICAgICAgIC8vIHJlYXNvbmFibHkgcXVpY2tseSB3aGVuIG1vcmUgd29yayBpdGVtcyBleGlzdCwgc3VjaCBhcyBmb3IgYSBmb3VyLXNjcmVlbiBzaW0uXHJcbiAgICAgICAgMzAgLyB3b3JrSXRlbXMubGVuZ3RoXHJcbiAgICAgICk7XHJcbiAgICB9O1xyXG4gICAgcnVuSXRlbSggMCApO1xyXG4gIH1cclxuXHJcbiAgLy8gQm91bmQgdG8gdGhpcy5ib3VuZFJ1bkFuaW1hdGlvbkxvb3Agc28gaXQgY2FuIGJlIHJ1biBpbiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXHJcbiAgcHJpdmF0ZSBydW5BbmltYXRpb25Mb29wKCk6IHZvaWQge1xyXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggdGhpcy5ib3VuZFJ1bkFuaW1hdGlvbkxvb3AgKTtcclxuXHJcbiAgICAvLyBPbmx5IHJ1biBhbmltYXRpb24gZnJhbWVzIGZvciBhbiBhY3RpdmUgc2ltLiBJZiBpbiBwbGF5YmFja01vZGUsIHBsYXliYWNrIGxvZ2ljIHdpbGwgaGFuZGxlIGFuaW1hdGlvbiBmcmFtZVxyXG4gICAgLy8gc3RlcHBpbmcgbWFudWFsbHkuXHJcbiAgICBpZiAoIHRoaXMuYWN0aXZlUHJvcGVydHkudmFsdWUgJiYgIXBoZXQuam9pc3QucGxheWJhY2tNb2RlRW5hYmxlZFByb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgLy8gSGFuZGxlIElucHV0IGZ1enppbmcgYmVmb3JlIHN0ZXBwaW5nIHRoZSBzaW0gYmVjYXVzZSBpbnB1dCBldmVudHMgb2NjdXIgb3V0c2lkZSBvZiBzaW0gc3RlcHMsIGJ1dCBub3QgYmVmb3JlIHRoZVxyXG4gICAgICAvLyBmaXJzdCBzaW0gc3RlcCAodG8gcHJldmVudCBpc3N1ZXMgbGlrZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzE2MSkuXHJcbiAgICAgIHRoaXMuZnJhbWVDb3VudGVyID4gMCAmJiB0aGlzLmRpc3BsYXkuZnV6eklucHV0RXZlbnRzKCk7XHJcblxyXG4gICAgICB0aGlzLnN0ZXBPbmVGcmFtZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoZSBhbmltYXRpb24gZnJhbWUgdGltZXIgcnVucyBldmVyeSBmcmFtZVxyXG4gICAgY29uc3QgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgYW5pbWF0aW9uRnJhbWVUaW1lci5lbWl0KCBnZXREVCggdGhpcy5sYXN0QW5pbWF0aW9uRnJhbWVUaW1lLCBjdXJyZW50VGltZSApICk7XHJcbiAgICB0aGlzLmxhc3RBbmltYXRpb25GcmFtZVRpbWUgPSBjdXJyZW50VGltZTtcclxuXHJcbiAgICBpZiAoIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgKSB7XHJcblxyXG4gICAgICAvLyBQaEVULWlPIGJhdGNoZXMgbWVzc2FnZXMgdG8gYmUgc2VudCB0byBvdGhlciBmcmFtZXMsIG1lc3NhZ2VzIG11c3QgYmUgc2VudCB3aGV0aGVyIHRoZSBzaW0gaXMgYWN0aXZlIG9yIG5vdFxyXG4gICAgICBwaGV0LnBoZXRpby5waGV0aW9Db21tYW5kUHJvY2Vzc29yLm9uQW5pbWF0aW9uTG9vcCggdGhpcyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gUnVuIGEgc2luZ2xlIGZyYW1lIGluY2x1ZGluZyBtb2RlbCwgdmlldyBhbmQgZGlzcGxheSB1cGRhdGVzLCB1c2VkIGJ5IExlZ2VuZHMgb2YgTGVhcm5pbmdcclxuICBwdWJsaWMgc3RlcE9uZUZyYW1lKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIENvbXB1dGUgdGhlIGVsYXBzZWQgdGltZSBzaW5jZSB0aGUgbGFzdCBmcmFtZSwgb3IgZ3Vlc3MgMS82MHRoIG9mIGEgc2Vjb25kIGlmIGl0IGlzIHRoZSBmaXJzdCBmcmFtZVxyXG4gICAgY29uc3QgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgY29uc3QgZHQgPSBnZXREVCggdGhpcy5sYXN0U3RlcFRpbWUsIGN1cnJlbnRUaW1lICk7XHJcbiAgICB0aGlzLmxhc3RTdGVwVGltZSA9IGN1cnJlbnRUaW1lO1xyXG5cclxuICAgIC8vIERvbid0IHJ1biB0aGUgc2ltdWxhdGlvbiBvbiBzdGVwcyBiYWNrIGluIHRpbWUgKHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzQwOSlcclxuICAgIGlmICggZHQgPiAwICkge1xyXG4gICAgICB0aGlzLnN0ZXBTaW11bGF0aW9uKCBkdCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSBzaW11bGF0aW9uIG1vZGVsLCB2aWV3LCBzY2VuZXJ5IGRpc3BsYXkgd2l0aCBhbiBlbGFwc2VkIHRpbWUgb2YgZHQuXHJcbiAgICogQHBhcmFtIGR0IC0gaW4gc2Vjb25kc1xyXG4gICAqIChwaGV0LWlvKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGVwU2ltdWxhdGlvbiggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIHRoaXMuc3RlcFNpbXVsYXRpb25BY3Rpb24uZXhlY3V0ZSggZHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhpZGUgb3Igc2hvdyBhbGwgYWNjZXNzaWJsZSBjb250ZW50IHJlbGF0ZWQgdG8gdGhlIHNpbSBTY3JlZW5WaWV3cywgYW5kIG5hdmlnYXRpb24gYmFyLiBUaGlzIGNvbnRlbnQgd2lsbFxyXG4gICAqIHJlbWFpbiB2aXNpYmxlLCBidXQgbm90IGJlIHRhYiBuYXZpZ2FibGUgb3IgcmVhZGFibGUgd2l0aCBhIHNjcmVlbiByZWFkZXIuIFRoaXMgaXMgZ2VuZXJhbGx5IHVzZWZ1bCB3aGVuXHJcbiAgICogZGlzcGxheWluZyBhIHBvcCB1cCBvciBtb2RhbCBkaWFsb2cuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFBET01WaWV3c1Zpc2libGUoIHZpc2libGU6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnNjcmVlbnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuc2NyZWVuc1sgaSBdLnZpZXcucGRvbVZpc2libGUgPSB2aXNpYmxlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubmF2aWdhdGlvbkJhci5wZG9tVmlzaWJsZSA9IHZpc2libGU7XHJcbiAgICB0aGlzLmhvbWVTY3JlZW4gJiYgdGhpcy5ob21lU2NyZWVuLnZpZXcuc2V0UERPTVZpc2libGUoIHZpc2libGUgKTtcclxuICAgIHRoaXMudG9vbGJhciAmJiB0aGlzLnRvb2xiYXIuc2V0UERPTVZpc2libGUoIHZpc2libGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgdm9pY2luZ1Zpc2libGUgc3RhdGUgb2Ygc2ltdWxhdGlvbiBjb21wb25lbnRzLiBXaGVuIGZhbHNlLCBPTkxZIHRoZSBUb29sYmFyXHJcbiAgICogYW5kIGl0cyBidXR0b25zIHdpbGwgYmUgYWJsZSB0byBhbm5vdW5jZSBWb2ljaW5nIHV0dGVyYW5jZXMuIFRoaXMgaXMgdXNlZCBieSB0aGVcclxuICAgKiBcIlNpbSBWb2ljaW5nXCIgc3dpdGNoIGluIHRoZSB0b29sYmFyIHdoaWNoIHdpbGwgZGlzYWJsZSBhbGwgVm9pY2luZyBpbiB0aGUgc2ltIHNvIHRoYXRcclxuICAgKiBvbmx5IFRvb2xiYXIgY29udGVudCBpcyBhbm5vdW5jZWQuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFNpbVZvaWNpbmdWaXNpYmxlKCB2aXNpYmxlOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgdGhpcy5zZXROb25Nb2RhbFZvaWNpbmdWaXNpYmxlKCB2aXNpYmxlICk7XHJcbiAgICB0aGlzLnRvcExheWVyICYmIHRoaXMudG9wTGF5ZXIuc2V0Vm9pY2luZ1Zpc2libGUoIHZpc2libGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdm9pY2luZ1Zpc2libGUgb24gYWxsIGVsZW1lbnRzIFwiYmVoaW5kXCIgdGhlIG1vZGFsIG5vZGUgc3RhY2suIEluIHRoaXMgY2FzZSwgdm9pY2luZyBzaG91bGQgbm90IHdvcmsgZm9yIHRob3NlXHJcbiAgICogY29tcG9uZW50cyB3aGVuIHNldCB0byBmYWxzZS5cclxuICAgKiBAcGFyYW0gdmlzaWJsZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXROb25Nb2RhbFZvaWNpbmdWaXNpYmxlKCB2aXNpYmxlOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zY3JlZW5zLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICB0aGlzLnNjcmVlbnNbIGkgXS52aWV3LnZvaWNpbmdWaXNpYmxlID0gdmlzaWJsZTsgLy8gaG9tZSBzY3JlZW4gaXMgdGhlIGZpcnN0IGl0ZW0sIGlmIGNyZWF0ZWRcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm5hdmlnYXRpb25CYXIudm9pY2luZ1Zpc2libGUgPSB2aXNpYmxlO1xyXG4gIH1cclxufVxyXG5cclxudHlwZSBMYXlvdXROb2RlID0gTm9kZSAmIHtcclxuICBsYXlvdXQ/OiAoIGxheW91dEJvdW5kczogQm91bmRzMiApID0+IHZvaWQ7XHJcbn07XHJcblxyXG4vLyBUaGlzIE5vZGUgc3VwcG9ydHMgY2hpbGRyZW4gdGhhdCBoYXZlIGxheW91dC5cclxudHlwZSBUb3BMYXllck5vZGUgPSB7XHJcbiAgYWRkQ2hpbGQoIGNoaWxkOiBMYXlvdXROb2RlICk6IHZvaWQ7XHJcbiAgY2hpbGRyZW46IExheW91dE5vZGVbXTtcclxufSAmIE5vZGU7XHJcblxyXG4vKipcclxuICogQ29tcHV0ZSB0aGUgZHQgc2luY2UgdGhlIGxhc3QgZXZlbnRcclxuICogQHBhcmFtIGxhc3RUaW1lIC0gbWlsbGlzZWNvbmRzLCB0aW1lIG9mIHRoZSBsYXN0IGV2ZW50XHJcbiAqIEBwYXJhbSBjdXJyZW50VGltZSAtIG1pbGxpc2Vjb25kcywgY3VycmVudCB0aW1lLiAgUGFzc2VkIGluIGluc3RlYWQgb2YgY29tcHV0ZWQgc28gdGhlcmUgaXMgbm8gXCJzbGFja1wiIGJldHdlZW4gbWVhc3VyZW1lbnRzXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXREVCggbGFzdFRpbWU6IG51bWJlciwgY3VycmVudFRpbWU6IG51bWJlciApOiBudW1iZXIge1xyXG5cclxuICAvLyBDb21wdXRlIHRoZSBlbGFwc2VkIHRpbWUgc2luY2UgdGhlIGxhc3QgZnJhbWUsIG9yIGd1ZXNzIDEvNjB0aCBvZiBhIHNlY29uZCBpZiBpdCBpcyB0aGUgZmlyc3QgZnJhbWVcclxuICByZXR1cm4gKCBsYXN0VGltZSA9PT0gLTEgKSA/IDEgLyA2MCA6XHJcbiAgICAgICAgICggY3VycmVudFRpbWUgLSBsYXN0VGltZSApIC8gMTAwMC4wO1xyXG59XHJcblxyXG5qb2lzdC5yZWdpc3RlciggJ1NpbScsIFNpbSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLG1CQUFtQixNQUFNLHNDQUFzQztBQUN0RSxPQUFPQyxlQUFlLE1BQU0sa0NBQWtDO0FBQzlELE9BQU9DLHFCQUFxQixNQUFNLHdDQUF3QztBQUMxRSxPQUFP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