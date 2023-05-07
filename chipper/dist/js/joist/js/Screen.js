// Copyright 2013-2023, University of Colorado Boulder

/**
 * A Screen is the largest chunk of a simulation. (Java sims used the term Module, but that term
 * is too overloaded to use with JavaScript and Git.)
 *
 * When creating a Sim, Screens are supplied as the arguments. They can be specified as object literals or through
 * instances of this class. This class may centralize default behavior or state for Screens in the future, but right
 * now it only allows you to create Sims without using named parameter object literals.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Property from '../../axon/js/Property.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import { Path, Rectangle } from '../../scenery/js/imports.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import ReferenceIO from '../../tandem/js/types/ReferenceIO.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import ScreenIcon from './ScreenIcon.js';
import Multilink from '../../axon/js/Multilink.js';
import PatternStringProperty from '../../axon/js/PatternStringProperty.js';
const screenNamePatternStringProperty = JoistStrings.a11y.screenNamePatternStringProperty;
const screenSimPatternStringProperty = JoistStrings.a11y.screenSimPatternStringProperty;
const simScreenStringProperty = JoistStrings.a11y.simScreenStringProperty;

// constants
const MINIMUM_HOME_SCREEN_ICON_SIZE = new Dimension2(548, 373);
const MINIMUM_NAVBAR_ICON_SIZE = new Dimension2(147, 100);
const NAVBAR_ICON_ASPECT_RATIO = MINIMUM_NAVBAR_ICON_SIZE.width / MINIMUM_NAVBAR_ICON_SIZE.height;
const HOME_SCREEN_ICON_ASPECT_RATIO = MINIMUM_HOME_SCREEN_ICON_SIZE.width / MINIMUM_HOME_SCREEN_ICON_SIZE.height;
const ICON_ASPECT_RATIO_TOLERANCE = 5E-3; // how close to the ideal aspect ratio an icon must be

// Home screen and navigation bar icons must have the same aspect ratio, see https://github.com/phetsims/joist/issues/76
assert && assert(Math.abs(HOME_SCREEN_ICON_ASPECT_RATIO - HOME_SCREEN_ICON_ASPECT_RATIO) < ICON_ASPECT_RATIO_TOLERANCE, 'MINIMUM_HOME_SCREEN_ICON_SIZE and MINIMUM_NAVBAR_ICON_SIZE must have the same aspect ratio');

// Documentation is by the defaults

// Accept any subtype of TModel (defaults to supertype), and any subtype of ScreenView (defaults to subtype).

// The IntentionalAny in the model type is due to https://github.com/phetsims/joist/issues/783#issuecomment-1231017213

// Parameterized on M=Model and V=View
class Screen extends PhetioObject {
  // joist-internal

  static HOME_SCREEN_ICON_ASPECT_RATIO = HOME_SCREEN_ICON_ASPECT_RATIO;
  static MINIMUM_HOME_SCREEN_ICON_SIZE = MINIMUM_HOME_SCREEN_ICON_SIZE;
  static MINIMUM_NAVBAR_ICON_SIZE = MINIMUM_NAVBAR_ICON_SIZE;
  static ScreenIO = new IOType('ScreenIO', {
    valueType: Screen,
    supertype: ReferenceIO(IOType.ObjectIO),
    documentation: 'Section of a simulation which has its own model and view.'
  });
  constructor(createModel, createView, providedOptions) {
    const options = optionize()({
      // {TProperty<string>|null} name of the sim, as displayed to the user.
      // For single-screen sims, there is no home screen or navigation bar, and null is OK.
      // For multi-screen sims, this must be provided.
      name: null,
      // {boolean} whether nameProperty should be instrumented. see usage for explanation of its necessity.
      instrumentNameProperty: true,
      backgroundColorProperty: new Property('white'),
      // {Node|null} icon shown on the home screen. If null, then a default is created.
      // For single-screen sims, there is no home screen and the default is OK.
      homeScreenIcon: null,
      // {boolean} whether to draw a frame around the small icons on home screen
      showUnselectedHomeScreenIconFrame: false,
      // {Node|null} icon shown in the navigation bar. If null, then the home screen icon will be used, scaled to fit.
      navigationBarIcon: null,
      // {string|null} show a frame around the screen icon when the navbar's background fill is this color
      // 'black', 'white', or null (no frame)
      showScreenIconFrameForNavigationBarFill: null,
      // dt cap in seconds, see https://github.com/phetsims/joist/issues/130
      maxDT: 0.5,
      // a {null|function():Node} placed into the keyboard help dialog that can be opened from the navigation bar when this
      // screen is selected
      createKeyboardHelpNode: null,
      // pdom/voicing - The description that is used when interacting with screen icons/buttons in joist (and home screen).
      // This is often a full but short sentence with a period at the end of it. This is also used for voicing this screen
      // in the home screen.
      descriptionContent: null,
      // phet-io
      // @ts-expect-error include a default for un-instrumented, JavaScript sims
      tandem: Tandem.REQUIRED,
      phetioType: Screen.ScreenIO,
      phetioState: false,
      phetioFeatured: true
    }, providedOptions);
    assert && assert(_.includes(['black', 'white', null], options.showScreenIconFrameForNavigationBarFill), `invalid showScreenIconFrameForNavigationBarFill: ${options.showScreenIconFrameForNavigationBarFill}`);
    assert && assert(typeof options.name !== 'string', 'Screen no longer supports a name string, instead it should be a Property<string>');
    super(options);

    // Create a default homeScreenIcon, using the Screen's background color
    if (!options.homeScreenIcon) {
      const iconNode = new Rectangle(0, 0, MINIMUM_HOME_SCREEN_ICON_SIZE.width, MINIMUM_HOME_SCREEN_ICON_SIZE.height);
      options.homeScreenIcon = new ScreenIcon(iconNode, {
        fill: options.backgroundColorProperty.value,
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      });
    }

    // navigationBarIcon defaults to homeScreenIcon, and will be scaled down
    if (!options.navigationBarIcon) {
      options.navigationBarIcon = options.homeScreenIcon;
    }

    // Validate icon sizes
    validateIconSize(options.homeScreenIcon, MINIMUM_HOME_SCREEN_ICON_SIZE, HOME_SCREEN_ICON_ASPECT_RATIO, 'homeScreenIcon');
    validateIconSize(options.navigationBarIcon, MINIMUM_NAVBAR_ICON_SIZE, NAVBAR_ICON_ASPECT_RATIO, 'navigationBarIcon');
    if (assert && this.isPhetioInstrumented()) {
      assert && assert(_.endsWith(options.tandem.phetioID, Tandem.SCREEN_TANDEM_NAME_SUFFIX), 'Screen tandems should end with Screen suffix');
    }
    this.backgroundColorProperty = options.backgroundColorProperty;
    if (options.name) {
      this.nameProperty = options.name;

      // Don't instrument this.nameProperty if options.instrumentNameProperty is false or if options.name is not provided.
      // This additional option is needed because designers requested the ability to not instrument a screen's nameProperty
      // even if it has a name, see https://github.com/phetsims/joist/issues/627 and https://github.com/phetsims/joist/issues/629.
      options.instrumentNameProperty && this.addLinkedElement(options.name, {
        tandem: options.tandem.createTandem('nameProperty')
      });
    } else {
      // may be null for single-screen simulations, just make it blank
      this.nameProperty = new Property('');
    }
    this.homeScreenIcon = options.homeScreenIcon;
    this.navigationBarIcon = options.navigationBarIcon;
    this.showUnselectedHomeScreenIconFrame = options.showUnselectedHomeScreenIconFrame;
    this.showScreenIconFrameForNavigationBarFill = options.showScreenIconFrameForNavigationBarFill;
    this.createKeyboardHelpNode = options.createKeyboardHelpNode;

    // may be null for single-screen simulations
    this.pdomDisplayNameProperty = new DerivedProperty([this.nameProperty], name => {
      return name === null ? '' : StringUtils.fillIn(screenNamePatternStringProperty, {
        name: name
      });
    });
    this.maxDT = options.maxDT;
    this.createModel = createModel;
    this.createView = createView;

    // Construction of the model and view are delayed and controlled to enable features like
    // a) faster loading when only loading certain screens
    // b) showing a loading progress bar <not implemented>
    this._model = null;
    this._view = null;

    // Indicates whether the Screen is active. Clients can read this, joist sets it.
    // To prevent potential visual glitches, the value should change only while the screen's view is invisible.
    // That is: transitions from false to true before a Screen becomes visible, and from true to false after a Screen becomes invisible.
    this.activeProperty = new BooleanProperty(true, {
      tandem: options.tandem.createTandem('activeProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'Indicates whether the screen is currently displayed in the simulation.  For single-screen ' + 'simulations, there is only one screen and it is always active.'
    });

    // Used to set the ScreenView's descriptionContent. This is a bit of a misnomer because Screen is not a Node
    // subtype, so this is a value property rather than a setter.
    this.descriptionContent = '';
    if (options.descriptionContent) {
      this.descriptionContent = options.descriptionContent;
    } else if (this.nameProperty.value) {
      this.descriptionContent = new PatternStringProperty(screenNamePatternStringProperty, {
        name: this.nameProperty
      });
    } else {
      this.descriptionContent = simScreenStringProperty; // fall back on generic name
    }

    assert && this.activeProperty.lazyLink(() => {
      assert && assert(this._view, 'isActive should not change before the Screen view has been initialized');

      // In phet-io mode, the state of a sim can be set without a deterministic order. The activeProperty could be
      // changed before the view's visibility is set.
      if (!Tandem.PHET_IO_ENABLED) {
        assert && assert(!this._view.isVisible(), 'isActive should not change while the Screen view is visible');
      }
    });
  }

  // Returns the model (if it has been constructed)
  get model() {
    assert && assert(this._model, 'Model has not yet been constructed');
    return this._model;
  }

  // Returns the view (if it has been constructed)
  get view() {
    assert && assert(this._view, 'View has not yet been constructed');
    return this._view;
  }
  hasModel() {
    return !!this._model;
  }
  hasView() {
    return !!this._view;
  }
  reset() {

    // Background color not reset, as it's a responsibility of the code that changes the property
  }

  /**
   * Initialize the model.
   * (joist-internal)
   */
  initializeModel() {
    assert && assert(this._model === null, 'there was already a model');
    this._model = this.createModel();
  }

  /**
   * Initialize the view.
   * (joist-internal)
   * @param simNameProperty - The Property of the name of the sim, used for a11y.
   * @param displayedSimNameProperty - The Property of the display name of the sim, used for a11y. Could change based on screen.
   * @param numberOfScreens - the number of screens in the sim this runtime (could change with `?screens=...`.
   * @param isHomeScreen - if this screen is the home screen.
   */
  initializeView(simNameProperty, displayedSimNameProperty, numberOfScreens, isHomeScreen) {
    assert && assert(this._view === null, 'there was already a view');
    this._view = this.createView(this.model);
    this._view.setVisible(false); // a Screen is invisible until selected

    // Show the home screen's layoutBounds
    if (phet.chipper.queryParameters.dev) {
      this._view.addChild(devCreateLayoutBoundsNode(this._view.layoutBounds));
    }

    // For debugging, make it possible to see the visibleBounds.  This is not included with ?dev since
    // it should just be equal to what you see.
    if (phet.chipper.queryParameters.showVisibleBounds) {
      this._view.addChild(devCreateVisibleBoundsNode(this._view));
    }

    // Set the accessible label for the screen.
    Multilink.multilink([displayedSimNameProperty, simNameProperty, this.pdomDisplayNameProperty], (displayedName, simName, pdomDisplayName) => {
      let titleString;

      // Single screen sims don't need screen names, instead just show the title of the sim.
      // Using total screens for sim breaks modularity a bit, but it also is needed as that parameter changes the
      // labelling of this screen, see https://github.com/phetsims/joist/issues/496
      if (numberOfScreens === 1) {
        titleString = displayedName; // for multiscreen sims, like "Ratio and Proportion -- Create"
      } else if (isHomeScreen) {
        titleString = simName; // Like "Ratio and Propotion"
      } else {
        // initialize proper PDOM labelling for ScreenView
        titleString = StringUtils.fillIn(screenSimPatternStringProperty, {
          screenName: pdomDisplayName,
          simName: simName
        });
      }

      // if there is a screenSummaryNode, then set its intro string now
      this._view.setScreenSummaryIntroAndTitle(simName, pdomDisplayName, titleString, numberOfScreens > 1);
    });
    assert && this._view.pdomAudit();
  }
}

/**
 * Validates the sizes for the home screen icon and navigation bar icon.
 * @param icon - the icon to validate
 * @param minimumSize - the minimum allowed size for the icon
 * @param aspectRatio - the required aspect ratio
 * @param name - the name of the icon type (for assert messages)
 */
function validateIconSize(icon, minimumSize, aspectRatio, name) {
  assert && assert(icon.width >= minimumSize.width, `${name} width is too small: ${icon.width} < ${minimumSize.width}`);
  assert && assert(icon.height >= minimumSize.height, `${name} height is too small: ${icon.height} < ${minimumSize.height}`);

  // Validate home screen aspect ratio
  const actualAspectRatio = icon.width / icon.height;
  assert && assert(Math.abs(aspectRatio - actualAspectRatio) < ICON_ASPECT_RATIO_TOLERANCE, `${name} has invalid aspect ratio: ${actualAspectRatio}`);
}

/**
 * Creates a Node for visualizing the ScreenView layoutBounds with 'dev' query parameter.
 */
function devCreateLayoutBoundsNode(layoutBounds) {
  return new Path(Shape.bounds(layoutBounds), {
    stroke: 'red',
    lineWidth: 3,
    pickable: false
  });
}

/**
 * Creates a Node for visualizing the ScreenView visibleBoundsProperty with 'showVisibleBounds' query parameter.
 */
function devCreateVisibleBoundsNode(screenView) {
  const path = new Path(Shape.bounds(screenView.visibleBoundsProperty.value), {
    stroke: 'blue',
    lineWidth: 6,
    pickable: false
  });
  screenView.visibleBoundsProperty.link(visibleBounds => {
    path.shape = Shape.bounds(visibleBounds);
  });
  return path;
}
joist.register('Screen', Screen);
export default Screen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJTaGFwZSIsIm9wdGlvbml6ZSIsIlN0cmluZ1V0aWxzIiwiUGF0aCIsIlJlY3RhbmdsZSIsIlBoZXRpb09iamVjdCIsIlRhbmRlbSIsIklPVHlwZSIsIlJlZmVyZW5jZUlPIiwiam9pc3QiLCJKb2lzdFN0cmluZ3MiLCJTY3JlZW5JY29uIiwiTXVsdGlsaW5rIiwiUGF0dGVyblN0cmluZ1Byb3BlcnR5Iiwic2NyZWVuTmFtZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsImExMXkiLCJzY3JlZW5TaW1QYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJzaW1TY3JlZW5TdHJpbmdQcm9wZXJ0eSIsIk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFIiwiTUlOSU1VTV9OQVZCQVJfSUNPTl9TSVpFIiwiTkFWQkFSX0lDT05fQVNQRUNUX1JBVElPIiwid2lkdGgiLCJoZWlnaHQiLCJIT01FX1NDUkVFTl9JQ09OX0FTUEVDVF9SQVRJTyIsIklDT05fQVNQRUNUX1JBVElPX1RPTEVSQU5DRSIsImFzc2VydCIsIk1hdGgiLCJhYnMiLCJTY3JlZW4iLCJTY3JlZW5JTyIsInZhbHVlVHlwZSIsInN1cGVydHlwZSIsIk9iamVjdElPIiwiZG9jdW1lbnRhdGlvbiIsImNvbnN0cnVjdG9yIiwiY3JlYXRlTW9kZWwiLCJjcmVhdGVWaWV3IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIm5hbWUiLCJpbnN0cnVtZW50TmFtZVByb3BlcnR5IiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJob21lU2NyZWVuSWNvbiIsInNob3dVbnNlbGVjdGVkSG9tZVNjcmVlbkljb25GcmFtZSIsIm5hdmlnYXRpb25CYXJJY29uIiwic2hvd1NjcmVlbkljb25GcmFtZUZvck5hdmlnYXRpb25CYXJGaWxsIiwibWF4RFQiLCJjcmVhdGVLZXlib2FyZEhlbHBOb2RlIiwiZGVzY3JpcHRpb25Db250ZW50IiwidGFuZGVtIiwiUkVRVUlSRUQiLCJwaGV0aW9UeXBlIiwicGhldGlvU3RhdGUiLCJwaGV0aW9GZWF0dXJlZCIsIl8iLCJpbmNsdWRlcyIsImljb25Ob2RlIiwiZmlsbCIsInZhbHVlIiwibWF4SWNvbldpZHRoUHJvcG9ydGlvbiIsIm1heEljb25IZWlnaHRQcm9wb3J0aW9uIiwidmFsaWRhdGVJY29uU2l6ZSIsImlzUGhldGlvSW5zdHJ1bWVudGVkIiwiZW5kc1dpdGgiLCJwaGV0aW9JRCIsIlNDUkVFTl9UQU5ERU1fTkFNRV9TVUZGSVgiLCJuYW1lUHJvcGVydHkiLCJhZGRMaW5rZWRFbGVtZW50IiwiY3JlYXRlVGFuZGVtIiwicGRvbURpc3BsYXlOYW1lUHJvcGVydHkiLCJmaWxsSW4iLCJfbW9kZWwiLCJfdmlldyIsImFjdGl2ZVByb3BlcnR5IiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwibGF6eUxpbmsiLCJQSEVUX0lPX0VOQUJMRUQiLCJpc1Zpc2libGUiLCJtb2RlbCIsInZpZXciLCJoYXNNb2RlbCIsImhhc1ZpZXciLCJyZXNldCIsImluaXRpYWxpemVNb2RlbCIsImluaXRpYWxpemVWaWV3Iiwic2ltTmFtZVByb3BlcnR5IiwiZGlzcGxheWVkU2ltTmFtZVByb3BlcnR5IiwibnVtYmVyT2ZTY3JlZW5zIiwiaXNIb21lU2NyZWVuIiwic2V0VmlzaWJsZSIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiZGV2IiwiYWRkQ2hpbGQiLCJkZXZDcmVhdGVMYXlvdXRCb3VuZHNOb2RlIiwibGF5b3V0Qm91bmRzIiwic2hvd1Zpc2libGVCb3VuZHMiLCJkZXZDcmVhdGVWaXNpYmxlQm91bmRzTm9kZSIsIm11bHRpbGluayIsImRpc3BsYXllZE5hbWUiLCJzaW1OYW1lIiwicGRvbURpc3BsYXlOYW1lIiwidGl0bGVTdHJpbmciLCJzY3JlZW5OYW1lIiwic2V0U2NyZWVuU3VtbWFyeUludHJvQW5kVGl0bGUiLCJwZG9tQXVkaXQiLCJpY29uIiwibWluaW11bVNpemUiLCJhc3BlY3RSYXRpbyIsImFjdHVhbEFzcGVjdFJhdGlvIiwiYm91bmRzIiwic3Ryb2tlIiwibGluZVdpZHRoIiwicGlja2FibGUiLCJzY3JlZW5WaWV3IiwicGF0aCIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsImxpbmsiLCJ2aXNpYmxlQm91bmRzIiwic2hhcGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNjcmVlbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIFNjcmVlbiBpcyB0aGUgbGFyZ2VzdCBjaHVuayBvZiBhIHNpbXVsYXRpb24uIChKYXZhIHNpbXMgdXNlZCB0aGUgdGVybSBNb2R1bGUsIGJ1dCB0aGF0IHRlcm1cclxuICogaXMgdG9vIG92ZXJsb2FkZWQgdG8gdXNlIHdpdGggSmF2YVNjcmlwdCBhbmQgR2l0LilcclxuICpcclxuICogV2hlbiBjcmVhdGluZyBhIFNpbSwgU2NyZWVucyBhcmUgc3VwcGxpZWQgYXMgdGhlIGFyZ3VtZW50cy4gVGhleSBjYW4gYmUgc3BlY2lmaWVkIGFzIG9iamVjdCBsaXRlcmFscyBvciB0aHJvdWdoXHJcbiAqIGluc3RhbmNlcyBvZiB0aGlzIGNsYXNzLiBUaGlzIGNsYXNzIG1heSBjZW50cmFsaXplIGRlZmF1bHQgYmVoYXZpb3Igb3Igc3RhdGUgZm9yIFNjcmVlbnMgaW4gdGhlIGZ1dHVyZSwgYnV0IHJpZ2h0XHJcbiAqIG5vdyBpdCBvbmx5IGFsbG93cyB5b3UgdG8gY3JlYXRlIFNpbXMgd2l0aG91dCB1c2luZyBuYW1lZCBwYXJhbWV0ZXIgb2JqZWN0IGxpdGVyYWxzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgTm9kZSwgUGF0aCwgUERPTVZhbHVlVHlwZSwgUHJvZmlsZUNvbG9yUHJvcGVydHksIFJlY3RhbmdsZSB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QsIHsgUGhldGlvT2JqZWN0T3B0aW9ucyB9IGZyb20gJy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgUmVmZXJlbmNlSU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1JlZmVyZW5jZUlPLmpzJztcclxuaW1wb3J0IGpvaXN0IGZyb20gJy4vam9pc3QuanMnO1xyXG5pbXBvcnQgSm9pc3RTdHJpbmdzIGZyb20gJy4vSm9pc3RTdHJpbmdzLmpzJztcclxuaW1wb3J0IFNjcmVlbkljb24gZnJvbSAnLi9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgVE1vZGVsIGZyb20gJy4vVE1vZGVsLmpzJztcclxuaW1wb3J0IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1BhdHRlcm5TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBMaW5rYWJsZVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvTGlua2FibGVQcm9wZXJ0eS5qcyc7XHJcblxyXG5jb25zdCBzY3JlZW5OYW1lUGF0dGVyblN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkuc2NyZWVuTmFtZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc2NyZWVuU2ltUGF0dGVyblN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkuc2NyZWVuU2ltUGF0dGVyblN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBzaW1TY3JlZW5TdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnNpbVNjcmVlblN0cmluZ1Byb3BlcnR5O1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFID0gbmV3IERpbWVuc2lvbjIoIDU0OCwgMzczICk7XHJcbmNvbnN0IE1JTklNVU1fTkFWQkFSX0lDT05fU0laRSA9IG5ldyBEaW1lbnNpb24yKCAxNDcsIDEwMCApO1xyXG5jb25zdCBOQVZCQVJfSUNPTl9BU1BFQ1RfUkFUSU8gPSBNSU5JTVVNX05BVkJBUl9JQ09OX1NJWkUud2lkdGggLyBNSU5JTVVNX05BVkJBUl9JQ09OX1NJWkUuaGVpZ2h0O1xyXG5jb25zdCBIT01FX1NDUkVFTl9JQ09OX0FTUEVDVF9SQVRJTyA9IE1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFLndpZHRoIC8gTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUuaGVpZ2h0O1xyXG5jb25zdCBJQ09OX0FTUEVDVF9SQVRJT19UT0xFUkFOQ0UgPSA1RS0zOyAvLyBob3cgY2xvc2UgdG8gdGhlIGlkZWFsIGFzcGVjdCByYXRpbyBhbiBpY29uIG11c3QgYmVcclxuXHJcbi8vIEhvbWUgc2NyZWVuIGFuZCBuYXZpZ2F0aW9uIGJhciBpY29ucyBtdXN0IGhhdmUgdGhlIHNhbWUgYXNwZWN0IHJhdGlvLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy83NlxyXG5hc3NlcnQgJiYgYXNzZXJ0KCBNYXRoLmFicyggSE9NRV9TQ1JFRU5fSUNPTl9BU1BFQ1RfUkFUSU8gLSBIT01FX1NDUkVFTl9JQ09OX0FTUEVDVF9SQVRJTyApIDwgSUNPTl9BU1BFQ1RfUkFUSU9fVE9MRVJBTkNFLFxyXG4gICdNSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRSBhbmQgTUlOSU1VTV9OQVZCQVJfSUNPTl9TSVpFIG11c3QgaGF2ZSB0aGUgc2FtZSBhc3BlY3QgcmF0aW8nICk7XHJcblxyXG4vLyBEb2N1bWVudGF0aW9uIGlzIGJ5IHRoZSBkZWZhdWx0c1xyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIG5hbWU/OiBMaW5rYWJsZVByb3BlcnR5PHN0cmluZz4gfCBudWxsO1xyXG4gIGluc3RydW1lbnROYW1lUHJvcGVydHk/OiBib29sZWFuO1xyXG5cclxuICAvLyBJdCB3b3VsZCBiZSBwcmVmZXJhYmxlIHRvIHN1cHBvcnQgUHJvcGVydHk8Q29sb3IgfCBzdHJpbmc+IHNvbGVseSwgYnV0IG1hbnkgc3VidHlwZXMgYXJlIGhhcmRjb2RlZCB0byBiZSBDb2xvciBvbmx5XHJcbiAgLy8gb3Igc3RyaW5nIG9ubHksIHNvIHdlIHN1cHBvcnQgdGhpcyBwb2x5bW9ycGhpYyBmb3JtXHJcbiAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk/OiBQcm9wZXJ0eTxDb2xvciB8IHN0cmluZz4gfCBQcm9wZXJ0eTxDb2xvcj4gfCBQcm9wZXJ0eTxzdHJpbmc+IHwgUHJvZmlsZUNvbG9yUHJvcGVydHk7XHJcbiAgaG9tZVNjcmVlbkljb24/OiBTY3JlZW5JY29uIHwgbnVsbDtcclxuICBzaG93VW5zZWxlY3RlZEhvbWVTY3JlZW5JY29uRnJhbWU/OiBib29sZWFuO1xyXG4gIG5hdmlnYXRpb25CYXJJY29uPzogU2NyZWVuSWNvbiB8IG51bGw7XHJcbiAgc2hvd1NjcmVlbkljb25GcmFtZUZvck5hdmlnYXRpb25CYXJGaWxsPzogc3RyaW5nIHwgbnVsbDtcclxuICBtYXhEVD86IG51bWJlcjtcclxuICBjcmVhdGVLZXlib2FyZEhlbHBOb2RlPzogbnVsbCB8ICggKCB0YW5kZW06IFRhbmRlbSApID0+IE5vZGUgKTtcclxuICBkZXNjcmlwdGlvbkNvbnRlbnQ/OiBQRE9NVmFsdWVUeXBlIHwgbnVsbDtcclxufTtcclxuZXhwb3J0IHR5cGUgU2NyZWVuT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGhldGlvT2JqZWN0T3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxQaGV0aW9PYmplY3RPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG4vLyBBY2NlcHQgYW55IHN1YnR5cGUgb2YgVE1vZGVsIChkZWZhdWx0cyB0byBzdXBlcnR5cGUpLCBhbmQgYW55IHN1YnR5cGUgb2YgU2NyZWVuVmlldyAoZGVmYXVsdHMgdG8gc3VidHlwZSkuXHJcbnR5cGUgQ3JlYXRlVmlldzxNIGV4dGVuZHMgVE1vZGVsLCBWPiA9ICggbW9kZWw6IE0gKSA9PiBWO1xyXG5cclxuLy8gVGhlIEludGVudGlvbmFsQW55IGluIHRoZSBtb2RlbCB0eXBlIGlzIGR1ZSB0byBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzc4MyNpc3N1ZWNvbW1lbnQtMTIzMTAxNzIxM1xyXG5leHBvcnQgdHlwZSBBbnlTY3JlZW4gPSBTY3JlZW48SW50ZW50aW9uYWxBbnksIFNjcmVlblZpZXc+O1xyXG5cclxuLy8gUGFyYW1ldGVyaXplZCBvbiBNPU1vZGVsIGFuZCBWPVZpZXdcclxuY2xhc3MgU2NyZWVuPE0gZXh0ZW5kcyBUTW9kZWwsIFYgZXh0ZW5kcyBTY3JlZW5WaWV3PiBleHRlbmRzIFBoZXRpb09iamVjdCB7XHJcblxyXG4gIHB1YmxpYyBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogUHJvcGVydHk8Q29sb3I+IHwgUHJvcGVydHk8c3RyaW5nPiB8IFByb3BlcnR5PENvbG9yIHwgc3RyaW5nPjtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IG1heERUOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGFjdGl2ZVByb3BlcnR5OiBCb29sZWFuUHJvcGVydHk7XHJcbiAgcHVibGljIHJlYWRvbmx5IGRlc2NyaXB0aW9uQ29udGVudDogUERPTVZhbHVlVHlwZTtcclxuICBwdWJsaWMgcmVhZG9ubHkgbmFtZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+O1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgc2hvd1NjcmVlbkljb25GcmFtZUZvck5hdmlnYXRpb25CYXJGaWxsOiBzdHJpbmcgfCBudWxsO1xyXG4gIHB1YmxpYyByZWFkb25seSBob21lU2NyZWVuSWNvbjogU2NyZWVuSWNvbiB8IG51bGw7XHJcbiAgcHVibGljIG5hdmlnYXRpb25CYXJJY29uOiBTY3JlZW5JY29uIHwgbnVsbDtcclxuICBwdWJsaWMgcmVhZG9ubHkgc2hvd1Vuc2VsZWN0ZWRIb21lU2NyZWVuSWNvbkZyYW1lOiBib29sZWFuO1xyXG4gIHB1YmxpYyByZWFkb25seSBjcmVhdGVLZXlib2FyZEhlbHBOb2RlOiBudWxsIHwgKCAoIHRhbmRlbTogVGFuZGVtICkgPT4gTm9kZSApOyAvLyBqb2lzdC1pbnRlcm5hbFxyXG4gIHB1YmxpYyByZWFkb25seSBwZG9tRGlzcGxheU5hbWVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IGNyZWF0ZU1vZGVsOiAoKSA9PiBNO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgY3JlYXRlVmlldzogQ3JlYXRlVmlldzxNLCBWPjtcclxuICBwcml2YXRlIF9tb2RlbDogTSB8IG51bGw7XHJcbiAgcHJpdmF0ZSBfdmlldzogViB8IG51bGw7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSE9NRV9TQ1JFRU5fSUNPTl9BU1BFQ1RfUkFUSU8gPSBIT01FX1NDUkVFTl9JQ09OX0FTUEVDVF9SQVRJTztcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFID0gTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkU7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBNSU5JTVVNX05BVkJBUl9JQ09OX1NJWkUgPSBNSU5JTVVNX05BVkJBUl9JQ09OX1NJWkU7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTY3JlZW5JTyA9IG5ldyBJT1R5cGUoICdTY3JlZW5JTycsIHtcclxuICAgIHZhbHVlVHlwZTogU2NyZWVuLFxyXG4gICAgc3VwZXJ0eXBlOiBSZWZlcmVuY2VJTyggSU9UeXBlLk9iamVjdElPICksXHJcbiAgICBkb2N1bWVudGF0aW9uOiAnU2VjdGlvbiBvZiBhIHNpbXVsYXRpb24gd2hpY2ggaGFzIGl0cyBvd24gbW9kZWwgYW5kIHZpZXcuJ1xyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjcmVhdGVNb2RlbDogKCkgPT4gTSwgY3JlYXRlVmlldzogQ3JlYXRlVmlldzxNLCBWPiwgcHJvdmlkZWRPcHRpb25zOiBTY3JlZW5PcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U2NyZWVuT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBoZXRpb09iamVjdE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIHtUUHJvcGVydHk8c3RyaW5nPnxudWxsfSBuYW1lIG9mIHRoZSBzaW0sIGFzIGRpc3BsYXllZCB0byB0aGUgdXNlci5cclxuICAgICAgLy8gRm9yIHNpbmdsZS1zY3JlZW4gc2ltcywgdGhlcmUgaXMgbm8gaG9tZSBzY3JlZW4gb3IgbmF2aWdhdGlvbiBiYXIsIGFuZCBudWxsIGlzIE9LLlxyXG4gICAgICAvLyBGb3IgbXVsdGktc2NyZWVuIHNpbXMsIHRoaXMgbXVzdCBiZSBwcm92aWRlZC5cclxuICAgICAgbmFtZTogbnVsbCxcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSB3aGV0aGVyIG5hbWVQcm9wZXJ0eSBzaG91bGQgYmUgaW5zdHJ1bWVudGVkLiBzZWUgdXNhZ2UgZm9yIGV4cGxhbmF0aW9uIG9mIGl0cyBuZWNlc3NpdHkuXHJcbiAgICAgIGluc3RydW1lbnROYW1lUHJvcGVydHk6IHRydWUsXHJcblxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogbmV3IFByb3BlcnR5PENvbG9yIHwgc3RyaW5nPiggJ3doaXRlJyApLFxyXG5cclxuICAgICAgLy8ge05vZGV8bnVsbH0gaWNvbiBzaG93biBvbiB0aGUgaG9tZSBzY3JlZW4uIElmIG51bGwsIHRoZW4gYSBkZWZhdWx0IGlzIGNyZWF0ZWQuXHJcbiAgICAgIC8vIEZvciBzaW5nbGUtc2NyZWVuIHNpbXMsIHRoZXJlIGlzIG5vIGhvbWUgc2NyZWVuIGFuZCB0aGUgZGVmYXVsdCBpcyBPSy5cclxuICAgICAgaG9tZVNjcmVlbkljb246IG51bGwsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gd2hldGhlciB0byBkcmF3IGEgZnJhbWUgYXJvdW5kIHRoZSBzbWFsbCBpY29ucyBvbiBob21lIHNjcmVlblxyXG4gICAgICBzaG93VW5zZWxlY3RlZEhvbWVTY3JlZW5JY29uRnJhbWU6IGZhbHNlLFxyXG5cclxuICAgICAgLy8ge05vZGV8bnVsbH0gaWNvbiBzaG93biBpbiB0aGUgbmF2aWdhdGlvbiBiYXIuIElmIG51bGwsIHRoZW4gdGhlIGhvbWUgc2NyZWVuIGljb24gd2lsbCBiZSB1c2VkLCBzY2FsZWQgdG8gZml0LlxyXG4gICAgICBuYXZpZ2F0aW9uQmFySWNvbjogbnVsbCxcclxuXHJcbiAgICAgIC8vIHtzdHJpbmd8bnVsbH0gc2hvdyBhIGZyYW1lIGFyb3VuZCB0aGUgc2NyZWVuIGljb24gd2hlbiB0aGUgbmF2YmFyJ3MgYmFja2dyb3VuZCBmaWxsIGlzIHRoaXMgY29sb3JcclxuICAgICAgLy8gJ2JsYWNrJywgJ3doaXRlJywgb3IgbnVsbCAobm8gZnJhbWUpXHJcbiAgICAgIHNob3dTY3JlZW5JY29uRnJhbWVGb3JOYXZpZ2F0aW9uQmFyRmlsbDogbnVsbCxcclxuXHJcbiAgICAgIC8vIGR0IGNhcCBpbiBzZWNvbmRzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy8xMzBcclxuICAgICAgbWF4RFQ6IDAuNSxcclxuXHJcbiAgICAgIC8vIGEge251bGx8ZnVuY3Rpb24oKTpOb2RlfSBwbGFjZWQgaW50byB0aGUga2V5Ym9hcmQgaGVscCBkaWFsb2cgdGhhdCBjYW4gYmUgb3BlbmVkIGZyb20gdGhlIG5hdmlnYXRpb24gYmFyIHdoZW4gdGhpc1xyXG4gICAgICAvLyBzY3JlZW4gaXMgc2VsZWN0ZWRcclxuICAgICAgY3JlYXRlS2V5Ym9hcmRIZWxwTm9kZTogbnVsbCxcclxuXHJcbiAgICAgIC8vIHBkb20vdm9pY2luZyAtIFRoZSBkZXNjcmlwdGlvbiB0aGF0IGlzIHVzZWQgd2hlbiBpbnRlcmFjdGluZyB3aXRoIHNjcmVlbiBpY29ucy9idXR0b25zIGluIGpvaXN0IChhbmQgaG9tZSBzY3JlZW4pLlxyXG4gICAgICAvLyBUaGlzIGlzIG9mdGVuIGEgZnVsbCBidXQgc2hvcnQgc2VudGVuY2Ugd2l0aCBhIHBlcmlvZCBhdCB0aGUgZW5kIG9mIGl0LiBUaGlzIGlzIGFsc28gdXNlZCBmb3Igdm9pY2luZyB0aGlzIHNjcmVlblxyXG4gICAgICAvLyBpbiB0aGUgaG9tZSBzY3JlZW4uXHJcbiAgICAgIGRlc2NyaXB0aW9uQ29udGVudDogbnVsbCxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBpbmNsdWRlIGEgZGVmYXVsdCBmb3IgdW4taW5zdHJ1bWVudGVkLCBKYXZhU2NyaXB0IHNpbXNcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXHJcbiAgICAgIHBoZXRpb1R5cGU6IFNjcmVlbi5TY3JlZW5JTyxcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlLFxyXG4gICAgICBwaGV0aW9GZWF0dXJlZDogdHJ1ZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5pbmNsdWRlcyggWyAnYmxhY2snLCAnd2hpdGUnLCBudWxsIF0sIG9wdGlvbnMuc2hvd1NjcmVlbkljb25GcmFtZUZvck5hdmlnYXRpb25CYXJGaWxsICksXHJcbiAgICAgIGBpbnZhbGlkIHNob3dTY3JlZW5JY29uRnJhbWVGb3JOYXZpZ2F0aW9uQmFyRmlsbDogJHtvcHRpb25zLnNob3dTY3JlZW5JY29uRnJhbWVGb3JOYXZpZ2F0aW9uQmFyRmlsbH1gICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIG9wdGlvbnMubmFtZSAhPT0gJ3N0cmluZycsICdTY3JlZW4gbm8gbG9uZ2VyIHN1cHBvcnRzIGEgbmFtZSBzdHJpbmcsIGluc3RlYWQgaXQgc2hvdWxkIGJlIGEgUHJvcGVydHk8c3RyaW5nPicgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIGRlZmF1bHQgaG9tZVNjcmVlbkljb24sIHVzaW5nIHRoZSBTY3JlZW4ncyBiYWNrZ3JvdW5kIGNvbG9yXHJcbiAgICBpZiAoICFvcHRpb25zLmhvbWVTY3JlZW5JY29uICkge1xyXG4gICAgICBjb25zdCBpY29uTm9kZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIE1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFLndpZHRoLCBNSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRS5oZWlnaHQgKTtcclxuICAgICAgb3B0aW9ucy5ob21lU2NyZWVuSWNvbiA9IG5ldyBTY3JlZW5JY29uKCBpY29uTm9kZSwge1xyXG4gICAgICAgIGZpbGw6IG9wdGlvbnMuYmFja2dyb3VuZENvbG9yUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgbWF4SWNvbldpZHRoUHJvcG9ydGlvbjogMSxcclxuICAgICAgICBtYXhJY29uSGVpZ2h0UHJvcG9ydGlvbjogMVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbmF2aWdhdGlvbkJhckljb24gZGVmYXVsdHMgdG8gaG9tZVNjcmVlbkljb24sIGFuZCB3aWxsIGJlIHNjYWxlZCBkb3duXHJcbiAgICBpZiAoICFvcHRpb25zLm5hdmlnYXRpb25CYXJJY29uICkge1xyXG4gICAgICBvcHRpb25zLm5hdmlnYXRpb25CYXJJY29uID0gb3B0aW9ucy5ob21lU2NyZWVuSWNvbjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBWYWxpZGF0ZSBpY29uIHNpemVzXHJcbiAgICB2YWxpZGF0ZUljb25TaXplKCBvcHRpb25zLmhvbWVTY3JlZW5JY29uLCBNSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRSwgSE9NRV9TQ1JFRU5fSUNPTl9BU1BFQ1RfUkFUSU8sICdob21lU2NyZWVuSWNvbicgKTtcclxuICAgIHZhbGlkYXRlSWNvblNpemUoIG9wdGlvbnMubmF2aWdhdGlvbkJhckljb24sIE1JTklNVU1fTkFWQkFSX0lDT05fU0laRSwgTkFWQkFSX0lDT05fQVNQRUNUX1JBVElPLCAnbmF2aWdhdGlvbkJhckljb24nICk7XHJcblxyXG4gICAgaWYgKCBhc3NlcnQgJiYgdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmVuZHNXaXRoKCBvcHRpb25zLnRhbmRlbS5waGV0aW9JRCwgVGFuZGVtLlNDUkVFTl9UQU5ERU1fTkFNRV9TVUZGSVggKSwgJ1NjcmVlbiB0YW5kZW1zIHNob3VsZCBlbmQgd2l0aCBTY3JlZW4gc3VmZml4JyApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYmFja2dyb3VuZENvbG9yUHJvcGVydHkgPSBvcHRpb25zLmJhY2tncm91bmRDb2xvclByb3BlcnR5O1xyXG5cclxuICAgIGlmICggb3B0aW9ucy5uYW1lICkge1xyXG4gICAgICB0aGlzLm5hbWVQcm9wZXJ0eSA9IG9wdGlvbnMubmFtZTtcclxuXHJcbiAgICAgIC8vIERvbid0IGluc3RydW1lbnQgdGhpcy5uYW1lUHJvcGVydHkgaWYgb3B0aW9ucy5pbnN0cnVtZW50TmFtZVByb3BlcnR5IGlzIGZhbHNlIG9yIGlmIG9wdGlvbnMubmFtZSBpcyBub3QgcHJvdmlkZWQuXHJcbiAgICAgIC8vIFRoaXMgYWRkaXRpb25hbCBvcHRpb24gaXMgbmVlZGVkIGJlY2F1c2UgZGVzaWduZXJzIHJlcXVlc3RlZCB0aGUgYWJpbGl0eSB0byBub3QgaW5zdHJ1bWVudCBhIHNjcmVlbidzIG5hbWVQcm9wZXJ0eVxyXG4gICAgICAvLyBldmVuIGlmIGl0IGhhcyBhIG5hbWUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzYyNyBhbmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy82MjkuXHJcbiAgICAgIG9wdGlvbnMuaW5zdHJ1bWVudE5hbWVQcm9wZXJ0eSAmJiB0aGlzLmFkZExpbmtlZEVsZW1lbnQoIG9wdGlvbnMubmFtZSwge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbmFtZVByb3BlcnR5JyApXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gbWF5IGJlIG51bGwgZm9yIHNpbmdsZS1zY3JlZW4gc2ltdWxhdGlvbnMsIGp1c3QgbWFrZSBpdCBibGFua1xyXG4gICAgICB0aGlzLm5hbWVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggJycgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmhvbWVTY3JlZW5JY29uID0gb3B0aW9ucy5ob21lU2NyZWVuSWNvbjtcclxuICAgIHRoaXMubmF2aWdhdGlvbkJhckljb24gPSBvcHRpb25zLm5hdmlnYXRpb25CYXJJY29uO1xyXG4gICAgdGhpcy5zaG93VW5zZWxlY3RlZEhvbWVTY3JlZW5JY29uRnJhbWUgPSBvcHRpb25zLnNob3dVbnNlbGVjdGVkSG9tZVNjcmVlbkljb25GcmFtZTtcclxuICAgIHRoaXMuc2hvd1NjcmVlbkljb25GcmFtZUZvck5hdmlnYXRpb25CYXJGaWxsID0gb3B0aW9ucy5zaG93U2NyZWVuSWNvbkZyYW1lRm9yTmF2aWdhdGlvbkJhckZpbGw7XHJcbiAgICB0aGlzLmNyZWF0ZUtleWJvYXJkSGVscE5vZGUgPSBvcHRpb25zLmNyZWF0ZUtleWJvYXJkSGVscE5vZGU7XHJcblxyXG4gICAgLy8gbWF5IGJlIG51bGwgZm9yIHNpbmdsZS1zY3JlZW4gc2ltdWxhdGlvbnNcclxuICAgIHRoaXMucGRvbURpc3BsYXlOYW1lUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMubmFtZVByb3BlcnR5IF0sIG5hbWUgPT4ge1xyXG4gICAgICByZXR1cm4gbmFtZSA9PT0gbnVsbCA/ICcnIDogU3RyaW5nVXRpbHMuZmlsbEluKCBzY3JlZW5OYW1lUGF0dGVyblN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgICAgbmFtZTogbmFtZVxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5tYXhEVCA9IG9wdGlvbnMubWF4RFQ7XHJcblxyXG4gICAgdGhpcy5jcmVhdGVNb2RlbCA9IGNyZWF0ZU1vZGVsO1xyXG4gICAgdGhpcy5jcmVhdGVWaWV3ID0gY3JlYXRlVmlldztcclxuXHJcbiAgICAvLyBDb25zdHJ1Y3Rpb24gb2YgdGhlIG1vZGVsIGFuZCB2aWV3IGFyZSBkZWxheWVkIGFuZCBjb250cm9sbGVkIHRvIGVuYWJsZSBmZWF0dXJlcyBsaWtlXHJcbiAgICAvLyBhKSBmYXN0ZXIgbG9hZGluZyB3aGVuIG9ubHkgbG9hZGluZyBjZXJ0YWluIHNjcmVlbnNcclxuICAgIC8vIGIpIHNob3dpbmcgYSBsb2FkaW5nIHByb2dyZXNzIGJhciA8bm90IGltcGxlbWVudGVkPlxyXG4gICAgdGhpcy5fbW9kZWwgPSBudWxsO1xyXG4gICAgdGhpcy5fdmlldyA9IG51bGw7XHJcblxyXG4gICAgLy8gSW5kaWNhdGVzIHdoZXRoZXIgdGhlIFNjcmVlbiBpcyBhY3RpdmUuIENsaWVudHMgY2FuIHJlYWQgdGhpcywgam9pc3Qgc2V0cyBpdC5cclxuICAgIC8vIFRvIHByZXZlbnQgcG90ZW50aWFsIHZpc3VhbCBnbGl0Y2hlcywgdGhlIHZhbHVlIHNob3VsZCBjaGFuZ2Ugb25seSB3aGlsZSB0aGUgc2NyZWVuJ3MgdmlldyBpcyBpbnZpc2libGUuXHJcbiAgICAvLyBUaGF0IGlzOiB0cmFuc2l0aW9ucyBmcm9tIGZhbHNlIHRvIHRydWUgYmVmb3JlIGEgU2NyZWVuIGJlY29tZXMgdmlzaWJsZSwgYW5kIGZyb20gdHJ1ZSB0byBmYWxzZSBhZnRlciBhIFNjcmVlbiBiZWNvbWVzIGludmlzaWJsZS5cclxuICAgIHRoaXMuYWN0aXZlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYWN0aXZlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnSW5kaWNhdGVzIHdoZXRoZXIgdGhlIHNjcmVlbiBpcyBjdXJyZW50bHkgZGlzcGxheWVkIGluIHRoZSBzaW11bGF0aW9uLiAgRm9yIHNpbmdsZS1zY3JlZW4gJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICdzaW11bGF0aW9ucywgdGhlcmUgaXMgb25seSBvbmUgc2NyZWVuIGFuZCBpdCBpcyBhbHdheXMgYWN0aXZlLidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBVc2VkIHRvIHNldCB0aGUgU2NyZWVuVmlldydzIGRlc2NyaXB0aW9uQ29udGVudC4gVGhpcyBpcyBhIGJpdCBvZiBhIG1pc25vbWVyIGJlY2F1c2UgU2NyZWVuIGlzIG5vdCBhIE5vZGVcclxuICAgIC8vIHN1YnR5cGUsIHNvIHRoaXMgaXMgYSB2YWx1ZSBwcm9wZXJ0eSByYXRoZXIgdGhhbiBhIHNldHRlci5cclxuICAgIHRoaXMuZGVzY3JpcHRpb25Db250ZW50ID0gJyc7XHJcbiAgICBpZiAoIG9wdGlvbnMuZGVzY3JpcHRpb25Db250ZW50ICkge1xyXG4gICAgICB0aGlzLmRlc2NyaXB0aW9uQ29udGVudCA9IG9wdGlvbnMuZGVzY3JpcHRpb25Db250ZW50O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMubmFtZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICB0aGlzLmRlc2NyaXB0aW9uQ29udGVudCA9IG5ldyBQYXR0ZXJuU3RyaW5nUHJvcGVydHkoIHNjcmVlbk5hbWVQYXR0ZXJuU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgICBuYW1lOiB0aGlzLm5hbWVQcm9wZXJ0eVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5kZXNjcmlwdGlvbkNvbnRlbnQgPSBzaW1TY3JlZW5TdHJpbmdQcm9wZXJ0eTsgLy8gZmFsbCBiYWNrIG9uIGdlbmVyaWMgbmFtZVxyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydCAmJiB0aGlzLmFjdGl2ZVByb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3ZpZXcsICdpc0FjdGl2ZSBzaG91bGQgbm90IGNoYW5nZSBiZWZvcmUgdGhlIFNjcmVlbiB2aWV3IGhhcyBiZWVuIGluaXRpYWxpemVkJyApO1xyXG5cclxuICAgICAgLy8gSW4gcGhldC1pbyBtb2RlLCB0aGUgc3RhdGUgb2YgYSBzaW0gY2FuIGJlIHNldCB3aXRob3V0IGEgZGV0ZXJtaW5pc3RpYyBvcmRlci4gVGhlIGFjdGl2ZVByb3BlcnR5IGNvdWxkIGJlXHJcbiAgICAgIC8vIGNoYW5nZWQgYmVmb3JlIHRoZSB2aWV3J3MgdmlzaWJpbGl0eSBpcyBzZXQuXHJcbiAgICAgIGlmICggIVRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgKSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuX3ZpZXchLmlzVmlzaWJsZSgpLCAnaXNBY3RpdmUgc2hvdWxkIG5vdCBjaGFuZ2Ugd2hpbGUgdGhlIFNjcmVlbiB2aWV3IGlzIHZpc2libGUnICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8vIFJldHVybnMgdGhlIG1vZGVsIChpZiBpdCBoYXMgYmVlbiBjb25zdHJ1Y3RlZClcclxuICBwdWJsaWMgZ2V0IG1vZGVsKCk6IE0ge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fbW9kZWwsICdNb2RlbCBoYXMgbm90IHlldCBiZWVuIGNvbnN0cnVjdGVkJyApO1xyXG4gICAgcmV0dXJuIHRoaXMuX21vZGVsITtcclxuICB9XHJcblxyXG4gIC8vIFJldHVybnMgdGhlIHZpZXcgKGlmIGl0IGhhcyBiZWVuIGNvbnN0cnVjdGVkKVxyXG4gIHB1YmxpYyBnZXQgdmlldygpOiBWIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3ZpZXcsICdWaWV3IGhhcyBub3QgeWV0IGJlZW4gY29uc3RydWN0ZWQnICk7XHJcbiAgICByZXR1cm4gdGhpcy5fdmlldyE7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaGFzTW9kZWwoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gISF0aGlzLl9tb2RlbDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBoYXNWaWV3KCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICEhdGhpcy5fdmlldztcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBCYWNrZ3JvdW5kIGNvbG9yIG5vdCByZXNldCwgYXMgaXQncyBhIHJlc3BvbnNpYmlsaXR5IG9mIHRoZSBjb2RlIHRoYXQgY2hhbmdlcyB0aGUgcHJvcGVydHlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemUgdGhlIG1vZGVsLlxyXG4gICAqIChqb2lzdC1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgaW5pdGlhbGl6ZU1vZGVsKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fbW9kZWwgPT09IG51bGwsICd0aGVyZSB3YXMgYWxyZWFkeSBhIG1vZGVsJyApO1xyXG4gICAgdGhpcy5fbW9kZWwgPSB0aGlzLmNyZWF0ZU1vZGVsKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplIHRoZSB2aWV3LlxyXG4gICAqIChqb2lzdC1pbnRlcm5hbClcclxuICAgKiBAcGFyYW0gc2ltTmFtZVByb3BlcnR5IC0gVGhlIFByb3BlcnR5IG9mIHRoZSBuYW1lIG9mIHRoZSBzaW0sIHVzZWQgZm9yIGExMXkuXHJcbiAgICogQHBhcmFtIGRpc3BsYXllZFNpbU5hbWVQcm9wZXJ0eSAtIFRoZSBQcm9wZXJ0eSBvZiB0aGUgZGlzcGxheSBuYW1lIG9mIHRoZSBzaW0sIHVzZWQgZm9yIGExMXkuIENvdWxkIGNoYW5nZSBiYXNlZCBvbiBzY3JlZW4uXHJcbiAgICogQHBhcmFtIG51bWJlck9mU2NyZWVucyAtIHRoZSBudW1iZXIgb2Ygc2NyZWVucyBpbiB0aGUgc2ltIHRoaXMgcnVudGltZSAoY291bGQgY2hhbmdlIHdpdGggYD9zY3JlZW5zPS4uLmAuXHJcbiAgICogQHBhcmFtIGlzSG9tZVNjcmVlbiAtIGlmIHRoaXMgc2NyZWVuIGlzIHRoZSBob21lIHNjcmVlbi5cclxuICAgKi9cclxuICBwdWJsaWMgaW5pdGlhbGl6ZVZpZXcoIHNpbU5hbWVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiwgZGlzcGxheWVkU2ltTmFtZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCBudW1iZXJPZlNjcmVlbnM6IG51bWJlciwgaXNIb21lU2NyZWVuOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fdmlldyA9PT0gbnVsbCwgJ3RoZXJlIHdhcyBhbHJlYWR5IGEgdmlldycgKTtcclxuICAgIHRoaXMuX3ZpZXcgPSB0aGlzLmNyZWF0ZVZpZXcoIHRoaXMubW9kZWwgKTtcclxuICAgIHRoaXMuX3ZpZXcuc2V0VmlzaWJsZSggZmFsc2UgKTsgLy8gYSBTY3JlZW4gaXMgaW52aXNpYmxlIHVudGlsIHNlbGVjdGVkXHJcblxyXG4gICAgLy8gU2hvdyB0aGUgaG9tZSBzY3JlZW4ncyBsYXlvdXRCb3VuZHNcclxuICAgIGlmICggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5kZXYgKSB7XHJcbiAgICAgIHRoaXMuX3ZpZXcuYWRkQ2hpbGQoIGRldkNyZWF0ZUxheW91dEJvdW5kc05vZGUoIHRoaXMuX3ZpZXcubGF5b3V0Qm91bmRzICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGb3IgZGVidWdnaW5nLCBtYWtlIGl0IHBvc3NpYmxlIHRvIHNlZSB0aGUgdmlzaWJsZUJvdW5kcy4gIFRoaXMgaXMgbm90IGluY2x1ZGVkIHdpdGggP2RldiBzaW5jZVxyXG4gICAgLy8gaXQgc2hvdWxkIGp1c3QgYmUgZXF1YWwgdG8gd2hhdCB5b3Ugc2VlLlxyXG4gICAgaWYgKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnNob3dWaXNpYmxlQm91bmRzICkge1xyXG4gICAgICB0aGlzLl92aWV3LmFkZENoaWxkKCBkZXZDcmVhdGVWaXNpYmxlQm91bmRzTm9kZSggdGhpcy5fdmlldyApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2V0IHRoZSBhY2Nlc3NpYmxlIGxhYmVsIGZvciB0aGUgc2NyZWVuLlxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyBkaXNwbGF5ZWRTaW1OYW1lUHJvcGVydHksIHNpbU5hbWVQcm9wZXJ0eSwgdGhpcy5wZG9tRGlzcGxheU5hbWVQcm9wZXJ0eSBdLFxyXG4gICAgICAoIGRpc3BsYXllZE5hbWUsIHNpbU5hbWUsIHBkb21EaXNwbGF5TmFtZSApID0+IHtcclxuXHJcbiAgICAgICAgbGV0IHRpdGxlU3RyaW5nO1xyXG5cclxuICAgICAgICAvLyBTaW5nbGUgc2NyZWVuIHNpbXMgZG9uJ3QgbmVlZCBzY3JlZW4gbmFtZXMsIGluc3RlYWQganVzdCBzaG93IHRoZSB0aXRsZSBvZiB0aGUgc2ltLlxyXG4gICAgICAgIC8vIFVzaW5nIHRvdGFsIHNjcmVlbnMgZm9yIHNpbSBicmVha3MgbW9kdWxhcml0eSBhIGJpdCwgYnV0IGl0IGFsc28gaXMgbmVlZGVkIGFzIHRoYXQgcGFyYW1ldGVyIGNoYW5nZXMgdGhlXHJcbiAgICAgICAgLy8gbGFiZWxsaW5nIG9mIHRoaXMgc2NyZWVuLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy80OTZcclxuICAgICAgICBpZiAoIG51bWJlck9mU2NyZWVucyA9PT0gMSApIHtcclxuICAgICAgICAgIHRpdGxlU3RyaW5nID0gZGlzcGxheWVkTmFtZTsgLy8gZm9yIG11bHRpc2NyZWVuIHNpbXMsIGxpa2UgXCJSYXRpbyBhbmQgUHJvcG9ydGlvbiAtLSBDcmVhdGVcIlxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggaXNIb21lU2NyZWVuICkge1xyXG4gICAgICAgICAgdGl0bGVTdHJpbmcgPSBzaW1OYW1lOyAvLyBMaWtlIFwiUmF0aW8gYW5kIFByb3BvdGlvblwiXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIGluaXRpYWxpemUgcHJvcGVyIFBET00gbGFiZWxsaW5nIGZvciBTY3JlZW5WaWV3XHJcbiAgICAgICAgICB0aXRsZVN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc2NyZWVuU2ltUGF0dGVyblN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgICAgICAgIHNjcmVlbk5hbWU6IHBkb21EaXNwbGF5TmFtZSxcclxuICAgICAgICAgICAgc2ltTmFtZTogc2ltTmFtZVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYSBzY3JlZW5TdW1tYXJ5Tm9kZSwgdGhlbiBzZXQgaXRzIGludHJvIHN0cmluZyBub3dcclxuICAgICAgICB0aGlzLl92aWV3IS5zZXRTY3JlZW5TdW1tYXJ5SW50cm9BbmRUaXRsZSggc2ltTmFtZSwgcGRvbURpc3BsYXlOYW1lLCB0aXRsZVN0cmluZywgbnVtYmVyT2ZTY3JlZW5zID4gMSApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIHRoaXMuX3ZpZXcucGRvbUF1ZGl0KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIHRoZSBzaXplcyBmb3IgdGhlIGhvbWUgc2NyZWVuIGljb24gYW5kIG5hdmlnYXRpb24gYmFyIGljb24uXHJcbiAqIEBwYXJhbSBpY29uIC0gdGhlIGljb24gdG8gdmFsaWRhdGVcclxuICogQHBhcmFtIG1pbmltdW1TaXplIC0gdGhlIG1pbmltdW0gYWxsb3dlZCBzaXplIGZvciB0aGUgaWNvblxyXG4gKiBAcGFyYW0gYXNwZWN0UmF0aW8gLSB0aGUgcmVxdWlyZWQgYXNwZWN0IHJhdGlvXHJcbiAqIEBwYXJhbSBuYW1lIC0gdGhlIG5hbWUgb2YgdGhlIGljb24gdHlwZSAoZm9yIGFzc2VydCBtZXNzYWdlcylcclxuICovXHJcbmZ1bmN0aW9uIHZhbGlkYXRlSWNvblNpemUoIGljb246IE5vZGUsIG1pbmltdW1TaXplOiBEaW1lbnNpb24yLCBhc3BlY3RSYXRpbzogbnVtYmVyLCBuYW1lOiBzdHJpbmcgKTogdm9pZCB7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggaWNvbi53aWR0aCA+PSBtaW5pbXVtU2l6ZS53aWR0aCwgYCR7bmFtZX0gd2lkdGggaXMgdG9vIHNtYWxsOiAke2ljb24ud2lkdGh9IDwgJHttaW5pbXVtU2l6ZS53aWR0aH1gICk7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggaWNvbi5oZWlnaHQgPj0gbWluaW11bVNpemUuaGVpZ2h0LCBgJHtuYW1lfSBoZWlnaHQgaXMgdG9vIHNtYWxsOiAke2ljb24uaGVpZ2h0fSA8ICR7bWluaW11bVNpemUuaGVpZ2h0fWAgKTtcclxuXHJcbiAgLy8gVmFsaWRhdGUgaG9tZSBzY3JlZW4gYXNwZWN0IHJhdGlvXHJcbiAgY29uc3QgYWN0dWFsQXNwZWN0UmF0aW8gPSBpY29uLndpZHRoIC8gaWNvbi5oZWlnaHQ7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydChcclxuICAgIE1hdGguYWJzKCBhc3BlY3RSYXRpbyAtIGFjdHVhbEFzcGVjdFJhdGlvICkgPCBJQ09OX0FTUEVDVF9SQVRJT19UT0xFUkFOQ0UsXHJcbiAgICBgJHtuYW1lfSBoYXMgaW52YWxpZCBhc3BlY3QgcmF0aW86ICR7YWN0dWFsQXNwZWN0UmF0aW99YFxyXG4gICk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgTm9kZSBmb3IgdmlzdWFsaXppbmcgdGhlIFNjcmVlblZpZXcgbGF5b3V0Qm91bmRzIHdpdGggJ2RldicgcXVlcnkgcGFyYW1ldGVyLlxyXG4gKi9cclxuZnVuY3Rpb24gZGV2Q3JlYXRlTGF5b3V0Qm91bmRzTm9kZSggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICk6IE5vZGUge1xyXG4gIHJldHVybiBuZXcgUGF0aCggU2hhcGUuYm91bmRzKCBsYXlvdXRCb3VuZHMgKSwge1xyXG4gICAgc3Ryb2tlOiAncmVkJyxcclxuICAgIGxpbmVXaWR0aDogMyxcclxuICAgIHBpY2thYmxlOiBmYWxzZVxyXG4gIH0gKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBOb2RlIGZvciB2aXN1YWxpemluZyB0aGUgU2NyZWVuVmlldyB2aXNpYmxlQm91bmRzUHJvcGVydHkgd2l0aCAnc2hvd1Zpc2libGVCb3VuZHMnIHF1ZXJ5IHBhcmFtZXRlci5cclxuICovXHJcbmZ1bmN0aW9uIGRldkNyZWF0ZVZpc2libGVCb3VuZHNOb2RlKCBzY3JlZW5WaWV3OiBTY3JlZW5WaWV3ICk6IE5vZGUge1xyXG4gIGNvbnN0IHBhdGggPSBuZXcgUGF0aCggU2hhcGUuYm91bmRzKCBzY3JlZW5WaWV3LnZpc2libGVCb3VuZHNQcm9wZXJ0eS52YWx1ZSApLCB7XHJcbiAgICBzdHJva2U6ICdibHVlJyxcclxuICAgIGxpbmVXaWR0aDogNixcclxuICAgIHBpY2thYmxlOiBmYWxzZVxyXG4gIH0gKTtcclxuICBzY3JlZW5WaWV3LnZpc2libGVCb3VuZHNQcm9wZXJ0eS5saW5rKCB2aXNpYmxlQm91bmRzID0+IHtcclxuICAgIHBhdGguc2hhcGUgPSBTaGFwZS5ib3VuZHMoIHZpc2libGVCb3VuZHMgKTtcclxuICB9ICk7XHJcbiAgcmV0dXJuIHBhdGg7XHJcbn1cclxuXHJcbmpvaXN0LnJlZ2lzdGVyKCAnU2NyZWVuJywgU2NyZWVuICk7XHJcbmV4cG9ydCBkZWZhdWx0IFNjcmVlbjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSxrQ0FBa0M7QUFDOUQsT0FBT0MsZUFBZSxNQUFNLGtDQUFrQztBQUU5RCxPQUFPQyxRQUFRLE1BQU0sMkJBQTJCO0FBRWhELE9BQU9DLFVBQVUsTUFBTSw0QkFBNEI7QUFDbkQsU0FBU0MsS0FBSyxRQUFRLDBCQUEwQjtBQUNoRCxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9D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