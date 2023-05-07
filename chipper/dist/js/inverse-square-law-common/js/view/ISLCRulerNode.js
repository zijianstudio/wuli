// Copyright 2017-2022, University of Colorado Boulder

/**
 * The draggable horizontal ruler.
 *
 * @author Michael Barlow (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import merge from '../../../phet-core/js/merge.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import GrabDragInteraction from '../../../scenery-phet/js/accessibility/GrabDragInteraction.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import RulerNode from '../../../scenery-phet/js/RulerNode.js';
import SceneryPhetStrings from '../../../scenery-phet/js/SceneryPhetStrings.js';
import { DragListener, FocusHighlightFromNode, InteractiveHighlighting, KeyboardDragListener, KeyboardUtils, Line, Node } from '../../../scenery/js/imports.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import SoundLevelEnum from '../../../tambo/js/SoundLevelEnum.js';
import soundManager from '../../../tambo/js/soundManager.js';
import grab_mp3 from '../../../tambo/sounds/grab_mp3.js';
import release_mp3 from '../../../tambo/sounds/release_mp3.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Utterance from '../../../utterance-queue/js/Utterance.js';
import rulerMovement000_mp3 from '../../sounds/rulerMovement000_mp3.js';
import inverseSquareLawCommon from '../inverseSquareLawCommon.js';
import InverseSquareLawCommonStrings from '../InverseSquareLawCommonStrings.js';
import ISLCQueryParameters from '../ISLCQueryParameters.js';

// constants
const unitsCentimetersString = InverseSquareLawCommonStrings.units.centimeters;
const rulerHelpTextString = InverseSquareLawCommonStrings.a11y.ruler.rulerHelpText;
const rulerKeyboardHintString = InverseSquareLawCommonStrings.a11y.ruler.rulerKeyboardHint;
const gestureHelpTextPatternStringProperty = SceneryPhetStrings.a11y.grabDrag.gestureHelpTextPatternStringProperty;
const rulerLabelString = InverseSquareLawCommonStrings.a11y.ruler.rulerLabel;
const measureDistanceRulerString = InverseSquareLawCommonStrings.a11y.ruler.measureDistanceRuler;
const RULER_WIDTH = 500;
const RULER_HEIGHT = 35;
const RULER_INSET = 10;
const SHOW_RULER_REGIONS = ISLCQueryParameters.showRulerRegions;
const SOUND_PLAY_DRAG_DISTANCE = 0.5; // in screen coords

class ISLCRulerNode extends InteractiveHighlighting(Node) {
  /**
   * @param {Property.<number>} rulerPositionProperty
   * @param {Bounds2} dragBounds - draggable bounds of the ruler, in model coords. Note that this will be dilated by
   *                                half the width of the ruler in the y dimensions. Also the right bound will not
   *                                be based on the center of the ruler, but instead based on the "zero mark" of
   *                                the ruler (located on the left side of the ruler)
   * @param {ModelViewTransform2} modelViewTransform
   * @param {function():number} getObject1Position - get the position in model coords, of the first object
   * @param {Alerter} rulerAlerter TODO: when other types need this, likely should create an ISLC interface for this
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(rulerPositionProperty, dragBounds, modelViewTransform, getObject1Position, rulerAlerter, options) {
    assert && options && assert(options.tagName === undefined, 'RulerNode sets its own tagName, see GrabDragInteraction usage below.');
    options = merge({
      // Node
      cursor: 'pointer',
      cssTransform: true,
      tagName: 'div',
      focusable: true,
      // SelfOptions
      snapToNearest: null,
      majorTickLabels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      unitString: unitsCentimetersString,
      backgroundFill: '#ddd',
      rulerInset: RULER_INSET,
      // {number} If using with snapToNearest, then this number will be rounded by the that value.
      modelYForCenterJump: 0.5,
      // sound generation

      // {TSoundPlayer|null} - sound players, null indicates default should be used, use nullSoundPlayer to disable
      grabRulerSoundPlayer: null,
      releaseRulerSoundPlayer: null,
      movementSoundPlayer: null,
      // {number} - amount of distance that the ruler should travel before playing another sound, same units as the
      // rulerPositionProperty.
      movementSoundDistance: 0.5,
      // pdom
      moveOnHoldDelay: 750,
      grabDragInteractionOptions: {
        objectToGrabString: rulerLabelString,
        grabbableAccessibleName: measureDistanceRulerString,
        // Empirically determined values to place the cue above the ruler.
        grabCueOptions: {
          x: 135,
          y: -45
        },
        keyboardHelpText: StringUtils.fillIn(rulerHelpTextString, {
          deviceSpecificHint: rulerKeyboardHintString
        }),
        // Overwrite the gesture help text to include ruler-specific logic. This isn't always needed.
        gestureHelpText: StringUtils.fillIn(rulerHelpTextString, {
          deviceSpecificHint: StringUtils.fillIn(gestureHelpTextPatternStringProperty, {
            objectToGrab: rulerLabelString
          })
        })
      },
      tandem: Tandem.REQUIRED
    }, options);
    const majorTickLabels = options.majorTickLabels;
    const rulerUnitString = options.unitString;
    super(options);
    const ruler = new RulerNode(RULER_WIDTH, RULER_HEIGHT, 50, majorTickLabels, rulerUnitString, {
      backgroundFill: options.backgroundFill,
      insetsWidth: options.rulerInset,
      minorTicksPerMajorTick: 4,
      majorTickFont: new PhetFont(12),
      snapToNearest: options.snapToNearest ? options.snapToNearest : 0,
      unitsFont: new PhetFont(10),
      unitsSpacing: 3,
      tandem: Tandem.OPT_OUT
    });
    this.addChild(ruler);
    ruler.mouseArea = Shape.rectangle(0, 0, ruler.bounds.width, RULER_HEIGHT);
    ruler.touchArea = ruler.mouseArea;

    // Use the constant instead of `this.width` because RulerNode adds inset on each side of the ruler.
    dragBounds.maxX = dragBounds.maxX + modelViewTransform.viewToModelDeltaX(RULER_WIDTH / 2);

    // Add half of the ruler height so the whole ruler is bounded, not just the center. Use the constant instead of
    // `this.height` because RulerNode adds line width around for drawing
    const dragBoundsWithRulerHeight = dragBounds.dilatedY(modelViewTransform.viewToModelDeltaY(RULER_HEIGHT / 2));

    // sound generation

    let grabRulerSoundPlayer;
    if (options.grabRulerSoundPlayer === null) {
      // no sound player specified by the client, use the default
      grabRulerSoundPlayer = new SoundClip(grab_mp3);
      soundManager.addSoundGenerator(grabRulerSoundPlayer);
    } else {
      grabRulerSoundPlayer = options.grabRulerSoundPlayer;
    }
    let releaseRulerSoundPlayer;
    if (options.releaseRulerSoundPlayer === null) {
      // no sound player specified by the client, use the default
      releaseRulerSoundPlayer = new SoundClip(release_mp3);
      soundManager.addSoundGenerator(releaseRulerSoundPlayer);
    } else {
      releaseRulerSoundPlayer = options.releaseRulerSoundPlayer;
    }

    // check if a sound player was provided for ruler motion and, if not, create a default
    let movementSoundPlayer;
    if (options.movementSoundPlayer === null) {
      // no sound player provided, use the default
      movementSoundPlayer = new SoundClip(rulerMovement000_mp3, {
        initialOutputLevel: 0.2
      });
      soundManager.addSoundGenerator(movementSoundPlayer, {
        sonificationLevel: SoundLevelEnum.EXTRA
      });
    } else {
      // use the sound player specified by the user
      movementSoundPlayer = options.movementSoundPlayer;
    }

    // variable to track position where last movement sound was produced
    const positionOfLastMotionSound = rulerPositionProperty.value.copy();
    this.addInputListener(new DragListener({
      positionProperty: rulerPositionProperty,
      tandem: options.tandem.createTandem('dragListener'),
      transform: modelViewTransform,
      targetNode: ruler,
      useParentOffset: true,
      mapPosition: position => {
        // snap to nearest snapToNearest if specified
        if (options.snapToNearest) {
          // x in model coordinates
          const xModel = position.x;
          position.x = Utils.roundSymmetric(xModel / options.snapToNearest) * options.snapToNearest;
        }

        // map withing the drag bounds, this is the same as using "dragBoundsProperty'
        return dragBoundsWithRulerHeight.closestPointTo(position);
      },
      start() {
        positionOfLastMotionSound.set(rulerPositionProperty.value);
      },
      drag() {
        const distanceFromLastMotionSoundPlay = rulerPositionProperty.value.distance(positionOfLastMotionSound);
        if (distanceFromLastMotionSoundPlay > SOUND_PLAY_DRAG_DISTANCE) {
          movementSoundPlayer.play();
          positionOfLastMotionSound.set(rulerPositionProperty.value);
        }
        rulerAlerter.onDrag();
      }
    }));

    // pdom - custom focus highlight
    const focusHighlight = new FocusHighlightFromNode(ruler, {
      useLocalBounds: true
    });
    this.setFocusHighlight(focusHighlight);
    const grabbedUtterance = new Utterance();
    const keyboardDragDelta = modelViewTransform.modelToViewDeltaX(options.snapToNearest);

    // supports keyboard interaction
    const keyboardDragListener = new KeyboardDragListener({
      dragBoundsProperty: new Property(dragBoundsWithRulerHeight),
      positionProperty: rulerPositionProperty,
      transform: modelViewTransform,
      moveOnHoldDelay: options.moveOnHoldDelay,
      dragDelta: 2 * keyboardDragDelta,
      shiftDragDelta: keyboardDragDelta,
      start() {
        // play a sound at the start of a drag
        movementSoundPlayer.play();
        positionOfLastMotionSound.set(rulerPositionProperty.value);
      },
      // snap to nearest snapToNearest, called on end so that dragging doesn't snap to a value for as long
      // as key is held down
      drag() {
        if (options.snapToNearest) {
          const xModel = rulerPositionProperty.get().x;
          const snappedX = Utils.roundSymmetric(xModel / options.snapToNearest) * options.snapToNearest;
          rulerPositionProperty.set(new Vector2(snappedX, rulerPositionProperty.get().y));
        }

        // play a sound if the ruler has been dragged for a ways without being released
        const distanceFromLastMotionSoundPlay = rulerPositionProperty.value.distance(positionOfLastMotionSound);
        if (distanceFromLastMotionSoundPlay > SOUND_PLAY_DRAG_DISTANCE) {
          movementSoundPlayer.play();
          positionOfLastMotionSound.set(rulerPositionProperty.value);
        }
        rulerAlerter.onDrag();
      },
      tandem: options.tandem.createTandem('keyboardDragListener')
    });
    assert && assert(!options.onGrab, 'ISLCRulerNode sets its own onGrab');
    assert && assert(!options.onRelease, 'ISLCRulerNode sets its own onRelease');
    assert && assert(!options.listenersForDragState, 'ISLCRulerNode sets its own listenersForDragState');
    const grabDragInteractionOptions = merge(options.grabDragInteractionOptions, {
      onGrab: () => {
        grabRulerSoundPlayer.play();

        // call this first to update the dsecriber state before the alert
        rulerAlerter.onGrab();
        grabbedUtterance.alert = rulerAlerter.getRulerGrabbedAlertable();
        this.alertDescriptionUtterance(grabbedUtterance);
      },
      onRelease: () => {
        releaseRulerSoundPlayer.play();
      },
      tandem: options.tandem.createTandem('grabDragInteraction')
    });

    // @private - add the "grab button" interaction
    this.grabDragInteraction = new GrabDragInteraction(this, keyboardDragListener, grabDragInteractionOptions);

    // If you can't use mouse/touch, then you cant use keyboard either
    this.inputEnabledProperty.link(inputEnabled => {
      this.grabDragInteraction.enabled = inputEnabled;
    });

    // pdom - the GrabDragInteraction is added to this Node but the drag handler and transform changes are applied
    // to the child RulerNode - PDOM siblings need to reposition with the RulerNode
    this.setPDOMTransformSourceNode(ruler);

    // the ruler's origin is the center, this offset gets the edge of it.
    const rulerAlignWithObjectXOffset = modelViewTransform.viewToModelDeltaX(RULER_WIDTH) / 2;

    // register hotkeys
    keyboardDragListener.hotkeys = [{
      keys: [KeyboardUtils.KEY_J, KeyboardUtils.KEY_C],
      // jump to center of object 1
      callback: () => {
        const x = getObject1Position();
        const destinationPosition = new Vector2(x + rulerAlignWithObjectXOffset, options.modelYForCenterJump);
        if (!rulerPositionProperty.value.equals(destinationPosition)) {
          rulerPositionProperty.set(destinationPosition);
          movementSoundPlayer.play();
        }
        rulerAlerter.alertJumpCenterMass();
      }
    }, {
      keys: [KeyboardUtils.KEY_J, KeyboardUtils.KEY_H],
      // jump home
      callback: () => {
        if (!rulerPositionProperty.value.equals(rulerPositionProperty.initialValue)) {
          movementSoundPlayer.play();
        }
        rulerPositionProperty.set(rulerPositionProperty.initialValue);
        this.grabDragInteraction.releaseDraggable();
        rulerAlerter.alertJumpHome();
      }
    }];

    // @public - ruler node is never destroyed, no listener disposal necessary
    rulerPositionProperty.link(value => {
      ruler.center = modelViewTransform.modelToViewPosition(value);
    });
    if (SHOW_RULER_REGIONS) {
      const lineOptions = {
        stroke: 'black',
        x: ruler.width / 2,
        y: RULER_HEIGHT / 2
      };
      const xLine = new Line(-10, 0, 10, 0, lineOptions);
      const yLine = new Line(0, -10, 0, 10, lineOptions);
      ruler.addChild(xLine);
      ruler.addChild(yLine);
    }
  }

  /**
   * @public
   */
  reset() {
    this.grabDragInteraction.reset();
  }
}
inverseSquareLawCommon.register('ISLCRulerNode', ISLCRulerNode);
export default ISLCRulerNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlV0aWxzIiwiVmVjdG9yMiIsIlNoYXBlIiwibWVyZ2UiLCJTdHJpbmdVdGlscyIsIkdyYWJEcmFnSW50ZXJhY3Rpb24iLCJQaGV0Rm9udCIsIlJ1bGVyTm9kZSIsIlNjZW5lcnlQaGV0U3RyaW5ncyIsIkRyYWdMaXN0ZW5lciIsIkZvY3VzSGlnaGxpZ2h0RnJvbU5vZGUiLCJJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyIsIktleWJvYXJkRHJhZ0xpc3RlbmVyIiwiS2V5Ym9hcmRVdGlscyIsIkxpbmUiLCJOb2RlIiwiU291bmRDbGlwIiwiU291bmRMZXZlbEVudW0iLCJzb3VuZE1hbmFnZXIiLCJncmFiX21wMyIsInJlbGVhc2VfbXAzIiwiVGFuZGVtIiwiVXR0ZXJhbmNlIiwicnVsZXJNb3ZlbWVudDAwMF9tcDMiLCJpbnZlcnNlU3F1YXJlTGF3Q29tbW9uIiwiSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MiLCJJU0xDUXVlcnlQYXJhbWV0ZXJzIiwidW5pdHNDZW50aW1ldGVyc1N0cmluZyIsInVuaXRzIiwiY2VudGltZXRlcnMiLCJydWxlckhlbHBUZXh0U3RyaW5nIiwiYTExeSIsInJ1bGVyIiwicnVsZXJIZWxwVGV4dCIsInJ1bGVyS2V5Ym9hcmRIaW50U3RyaW5nIiwicnVsZXJLZXlib2FyZEhpbnQiLCJnZXN0dXJlSGVscFRleHRQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJncmFiRHJhZyIsInJ1bGVyTGFiZWxTdHJpbmciLCJydWxlckxhYmVsIiwibWVhc3VyZURpc3RhbmNlUnVsZXJTdHJpbmciLCJtZWFzdXJlRGlzdGFuY2VSdWxlciIsIlJVTEVSX1dJRFRIIiwiUlVMRVJfSEVJR0hUIiwiUlVMRVJfSU5TRVQiLCJTSE9XX1JVTEVSX1JFR0lPTlMiLCJzaG93UnVsZXJSZWdpb25zIiwiU09VTkRfUExBWV9EUkFHX0RJU1RBTkNFIiwiSVNMQ1J1bGVyTm9kZSIsImNvbnN0cnVjdG9yIiwicnVsZXJQb3NpdGlvblByb3BlcnR5IiwiZHJhZ0JvdW5kcyIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImdldE9iamVjdDFQb3NpdGlvbiIsInJ1bGVyQWxlcnRlciIsIm9wdGlvbnMiLCJhc3NlcnQiLCJ0YWdOYW1lIiwidW5kZWZpbmVkIiwiY3Vyc29yIiwiY3NzVHJhbnNmb3JtIiwiZm9jdXNhYmxlIiwic25hcFRvTmVhcmVzdCIsIm1ham9yVGlja0xhYmVscyIsInVuaXRTdHJpbmciLCJiYWNrZ3JvdW5kRmlsbCIsInJ1bGVySW5zZXQiLCJtb2RlbFlGb3JDZW50ZXJKdW1wIiwiZ3JhYlJ1bGVyU291bmRQbGF5ZXIiLCJyZWxlYXNlUnVsZXJTb3VuZFBsYXllciIsIm1vdmVtZW50U291bmRQbGF5ZXIiLCJtb3ZlbWVudFNvdW5kRGlzdGFuY2UiLCJtb3ZlT25Ib2xkRGVsYXkiLCJncmFiRHJhZ0ludGVyYWN0aW9uT3B0aW9ucyIsIm9iamVjdFRvR3JhYlN0cmluZyIsImdyYWJiYWJsZUFjY2Vzc2libGVOYW1lIiwiZ3JhYkN1ZU9wdGlvbnMiLCJ4IiwieSIsImtleWJvYXJkSGVscFRleHQiLCJmaWxsSW4iLCJkZXZpY2VTcGVjaWZpY0hpbnQiLCJnZXN0dXJlSGVscFRleHQiLCJvYmplY3RUb0dyYWIiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInJ1bGVyVW5pdFN0cmluZyIsImluc2V0c1dpZHRoIiwibWlub3JUaWNrc1Blck1ham9yVGljayIsIm1ham9yVGlja0ZvbnQiLCJ1bml0c0ZvbnQiLCJ1bml0c1NwYWNpbmciLCJPUFRfT1VUIiwiYWRkQ2hpbGQiLCJtb3VzZUFyZWEiLCJyZWN0YW5nbGUiLCJib3VuZHMiLCJ3aWR0aCIsInRvdWNoQXJlYSIsIm1heFgiLCJ2aWV3VG9Nb2RlbERlbHRhWCIsImRyYWdCb3VuZHNXaXRoUnVsZXJIZWlnaHQiLCJkaWxhdGVkWSIsInZpZXdUb01vZGVsRGVsdGFZIiwiYWRkU291bmRHZW5lcmF0b3IiLCJpbml0aWFsT3V0cHV0TGV2ZWwiLCJzb25pZmljYXRpb25MZXZlbCIsIkVYVFJBIiwicG9zaXRpb25PZkxhc3RNb3Rpb25Tb3VuZCIsInZhbHVlIiwiY29weSIsImFkZElucHV0TGlzdGVuZXIiLCJwb3NpdGlvblByb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwidHJhbnNmb3JtIiwidGFyZ2V0Tm9kZSIsInVzZVBhcmVudE9mZnNldCIsIm1hcFBvc2l0aW9uIiwicG9zaXRpb24iLCJ4TW9kZWwiLCJyb3VuZFN5bW1ldHJpYyIsImNsb3Nlc3RQb2ludFRvIiwic3RhcnQiLCJzZXQiLCJkcmFnIiwiZGlzdGFuY2VGcm9tTGFzdE1vdGlvblNvdW5kUGxheSIsImRpc3RhbmNlIiwicGxheSIsIm9uRHJhZyIsImZvY3VzSGlnaGxpZ2h0IiwidXNlTG9jYWxCb3VuZHMiLCJzZXRGb2N1c0hpZ2hsaWdodCIsImdyYWJiZWRVdHRlcmFuY2UiLCJrZXlib2FyZERyYWdEZWx0YSIsIm1vZGVsVG9WaWV3RGVsdGFYIiwia2V5Ym9hcmREcmFnTGlzdGVuZXIiLCJkcmFnQm91bmRzUHJvcGVydHkiLCJkcmFnRGVsdGEiLCJzaGlmdERyYWdEZWx0YSIsImdldCIsInNuYXBwZWRYIiwib25HcmFiIiwib25SZWxlYXNlIiwibGlzdGVuZXJzRm9yRHJhZ1N0YXRlIiwiYWxlcnQiLCJnZXRSdWxlckdyYWJiZWRBbGVydGFibGUiLCJhbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlIiwiZ3JhYkRyYWdJbnRlcmFjdGlvbiIsImlucHV0RW5hYmxlZFByb3BlcnR5IiwibGluayIsImlucHV0RW5hYmxlZCIsImVuYWJsZWQiLCJzZXRQRE9NVHJhbnNmb3JtU291cmNlTm9kZSIsInJ1bGVyQWxpZ25XaXRoT2JqZWN0WE9mZnNldCIsImhvdGtleXMiLCJrZXlzIiwiS0VZX0oiLCJLRVlfQyIsImNhbGxiYWNrIiwiZGVzdGluYXRpb25Qb3NpdGlvbiIsImVxdWFscyIsImFsZXJ0SnVtcENlbnRlck1hc3MiLCJLRVlfSCIsImluaXRpYWxWYWx1ZSIsInJlbGVhc2VEcmFnZ2FibGUiLCJhbGVydEp1bXBIb21lIiwiY2VudGVyIiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsImxpbmVPcHRpb25zIiwic3Ryb2tlIiwieExpbmUiLCJ5TGluZSIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJU0xDUnVsZXJOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSBkcmFnZ2FibGUgaG9yaXpvbnRhbCBydWxlci5cclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIEJhcmxvdyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IEdyYWJEcmFnSW50ZXJhY3Rpb24gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2FjY2Vzc2liaWxpdHkvR3JhYkRyYWdJbnRlcmFjdGlvbi5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgUnVsZXJOb2RlIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9SdWxlck5vZGUuanMnO1xyXG5pbXBvcnQgU2NlbmVyeVBoZXRTdHJpbmdzIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TY2VuZXJ5UGhldFN0cmluZ3MuanMnO1xyXG5pbXBvcnQgeyBEcmFnTGlzdGVuZXIsIEZvY3VzSGlnaGxpZ2h0RnJvbU5vZGUsIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nLCBLZXlib2FyZERyYWdMaXN0ZW5lciwgS2V5Ym9hcmRVdGlscywgTGluZSwgTm9kZSB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBTb3VuZENsaXAgZnJvbSAnLi4vLi4vLi4vdGFtYm8vanMvc291bmQtZ2VuZXJhdG9ycy9Tb3VuZENsaXAuanMnO1xyXG5pbXBvcnQgU291bmRMZXZlbEVudW0gZnJvbSAnLi4vLi4vLi4vdGFtYm8vanMvU291bmRMZXZlbEVudW0uanMnO1xyXG5pbXBvcnQgc291bmRNYW5hZ2VyIGZyb20gJy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kTWFuYWdlci5qcyc7XHJcbmltcG9ydCBncmFiX21wMyBmcm9tICcuLi8uLi8uLi90YW1iby9zb3VuZHMvZ3JhYl9tcDMuanMnO1xyXG5pbXBvcnQgcmVsZWFzZV9tcDMgZnJvbSAnLi4vLi4vLi4vdGFtYm8vc291bmRzL3JlbGVhc2VfbXAzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IFV0dGVyYW5jZSBmcm9tICcuLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvVXR0ZXJhbmNlLmpzJztcclxuaW1wb3J0IHJ1bGVyTW92ZW1lbnQwMDBfbXAzIGZyb20gJy4uLy4uL3NvdW5kcy9ydWxlck1vdmVtZW50MDAwX21wMy5qcyc7XHJcbmltcG9ydCBpbnZlcnNlU3F1YXJlTGF3Q29tbW9uIGZyb20gJy4uL2ludmVyc2VTcXVhcmVMYXdDb21tb24uanMnO1xyXG5pbXBvcnQgSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MgZnJvbSAnLi4vSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgSVNMQ1F1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9JU0xDUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCB1bml0c0NlbnRpbWV0ZXJzU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MudW5pdHMuY2VudGltZXRlcnM7XHJcbmNvbnN0IHJ1bGVySGVscFRleHRTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnJ1bGVyLnJ1bGVySGVscFRleHQ7XHJcbmNvbnN0IHJ1bGVyS2V5Ym9hcmRIaW50U3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5ydWxlci5ydWxlcktleWJvYXJkSGludDtcclxuY29uc3QgZ2VzdHVyZUhlbHBUZXh0UGF0dGVyblN0cmluZ1Byb3BlcnR5ID0gU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkuZ3JhYkRyYWcuZ2VzdHVyZUhlbHBUZXh0UGF0dGVyblN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBydWxlckxhYmVsU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5ydWxlci5ydWxlckxhYmVsO1xyXG5jb25zdCBtZWFzdXJlRGlzdGFuY2VSdWxlclN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkucnVsZXIubWVhc3VyZURpc3RhbmNlUnVsZXI7XHJcblxyXG5jb25zdCBSVUxFUl9XSURUSCA9IDUwMDtcclxuY29uc3QgUlVMRVJfSEVJR0hUID0gMzU7XHJcbmNvbnN0IFJVTEVSX0lOU0VUID0gMTA7XHJcbmNvbnN0IFNIT1dfUlVMRVJfUkVHSU9OUyA9IElTTENRdWVyeVBhcmFtZXRlcnMuc2hvd1J1bGVyUmVnaW9ucztcclxuY29uc3QgU09VTkRfUExBWV9EUkFHX0RJU1RBTkNFID0gMC41OyAvLyBpbiBzY3JlZW4gY29vcmRzXHJcblxyXG5jbGFzcyBJU0xDUnVsZXJOb2RlIGV4dGVuZHMgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcoIE5vZGUgKSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IHJ1bGVyUG9zaXRpb25Qcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7Qm91bmRzMn0gZHJhZ0JvdW5kcyAtIGRyYWdnYWJsZSBib3VuZHMgb2YgdGhlIHJ1bGVyLCBpbiBtb2RlbCBjb29yZHMuIE5vdGUgdGhhdCB0aGlzIHdpbGwgYmUgZGlsYXRlZCBieVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYWxmIHRoZSB3aWR0aCBvZiB0aGUgcnVsZXIgaW4gdGhlIHkgZGltZW5zaW9ucy4gQWxzbyB0aGUgcmlnaHQgYm91bmQgd2lsbCBub3RcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmUgYmFzZWQgb24gdGhlIGNlbnRlciBvZiB0aGUgcnVsZXIsIGJ1dCBpbnN0ZWFkIGJhc2VkIG9uIHRoZSBcInplcm8gbWFya1wiIG9mXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBydWxlciAobG9jYXRlZCBvbiB0aGUgbGVmdCBzaWRlIG9mIHRoZSBydWxlcilcclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKTpudW1iZXJ9IGdldE9iamVjdDFQb3NpdGlvbiAtIGdldCB0aGUgcG9zaXRpb24gaW4gbW9kZWwgY29vcmRzLCBvZiB0aGUgZmlyc3Qgb2JqZWN0XHJcbiAgICogQHBhcmFtIHtBbGVydGVyfSBydWxlckFsZXJ0ZXIgVE9ETzogd2hlbiBvdGhlciB0eXBlcyBuZWVkIHRoaXMsIGxpa2VseSBzaG91bGQgY3JlYXRlIGFuIElTTEMgaW50ZXJmYWNlIGZvciB0aGlzXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcnVsZXJQb3NpdGlvblByb3BlcnR5LCBkcmFnQm91bmRzLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIGdldE9iamVjdDFQb3NpdGlvbiwgcnVsZXJBbGVydGVyLCBvcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIG9wdGlvbnMgJiYgYXNzZXJ0KCBvcHRpb25zLnRhZ05hbWUgPT09IHVuZGVmaW5lZCwgJ1J1bGVyTm9kZSBzZXRzIGl0cyBvd24gdGFnTmFtZSwgc2VlIEdyYWJEcmFnSW50ZXJhY3Rpb24gdXNhZ2UgYmVsb3cuJyApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8gTm9kZVxyXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgY3NzVHJhbnNmb3JtOiB0cnVlLFxyXG4gICAgICB0YWdOYW1lOiAnZGl2JyxcclxuICAgICAgZm9jdXNhYmxlOiB0cnVlLFxyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgc25hcFRvTmVhcmVzdDogbnVsbCxcclxuICAgICAgbWFqb3JUaWNrTGFiZWxzOiBbICcwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JywgJzEwJyBdLFxyXG4gICAgICB1bml0U3RyaW5nOiB1bml0c0NlbnRpbWV0ZXJzU3RyaW5nLFxyXG4gICAgICBiYWNrZ3JvdW5kRmlsbDogJyNkZGQnLFxyXG4gICAgICBydWxlckluc2V0OiBSVUxFUl9JTlNFVCxcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ9IElmIHVzaW5nIHdpdGggc25hcFRvTmVhcmVzdCwgdGhlbiB0aGlzIG51bWJlciB3aWxsIGJlIHJvdW5kZWQgYnkgdGhlIHRoYXQgdmFsdWUuXHJcbiAgICAgIG1vZGVsWUZvckNlbnRlckp1bXA6IDAuNSxcclxuXHJcbiAgICAgIC8vIHNvdW5kIGdlbmVyYXRpb25cclxuXHJcbiAgICAgIC8vIHtUU291bmRQbGF5ZXJ8bnVsbH0gLSBzb3VuZCBwbGF5ZXJzLCBudWxsIGluZGljYXRlcyBkZWZhdWx0IHNob3VsZCBiZSB1c2VkLCB1c2UgbnVsbFNvdW5kUGxheWVyIHRvIGRpc2FibGVcclxuICAgICAgZ3JhYlJ1bGVyU291bmRQbGF5ZXI6IG51bGwsXHJcbiAgICAgIHJlbGVhc2VSdWxlclNvdW5kUGxheWVyOiBudWxsLFxyXG4gICAgICBtb3ZlbWVudFNvdW5kUGxheWVyOiBudWxsLFxyXG5cclxuICAgICAgLy8ge251bWJlcn0gLSBhbW91bnQgb2YgZGlzdGFuY2UgdGhhdCB0aGUgcnVsZXIgc2hvdWxkIHRyYXZlbCBiZWZvcmUgcGxheWluZyBhbm90aGVyIHNvdW5kLCBzYW1lIHVuaXRzIGFzIHRoZVxyXG4gICAgICAvLyBydWxlclBvc2l0aW9uUHJvcGVydHkuXHJcbiAgICAgIG1vdmVtZW50U291bmREaXN0YW5jZTogMC41LFxyXG5cclxuICAgICAgLy8gcGRvbVxyXG4gICAgICBtb3ZlT25Ib2xkRGVsYXk6IDc1MCxcclxuICAgICAgZ3JhYkRyYWdJbnRlcmFjdGlvbk9wdGlvbnM6IHtcclxuICAgICAgICBvYmplY3RUb0dyYWJTdHJpbmc6IHJ1bGVyTGFiZWxTdHJpbmcsXHJcbiAgICAgICAgZ3JhYmJhYmxlQWNjZXNzaWJsZU5hbWU6IG1lYXN1cmVEaXN0YW5jZVJ1bGVyU3RyaW5nLFxyXG5cclxuICAgICAgICAvLyBFbXBpcmljYWxseSBkZXRlcm1pbmVkIHZhbHVlcyB0byBwbGFjZSB0aGUgY3VlIGFib3ZlIHRoZSBydWxlci5cclxuICAgICAgICBncmFiQ3VlT3B0aW9uczoge1xyXG4gICAgICAgICAgeDogMTM1LFxyXG4gICAgICAgICAgeTogLTQ1XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAga2V5Ym9hcmRIZWxwVGV4dDogU3RyaW5nVXRpbHMuZmlsbEluKCBydWxlckhlbHBUZXh0U3RyaW5nLCB7XHJcbiAgICAgICAgICBkZXZpY2VTcGVjaWZpY0hpbnQ6IHJ1bGVyS2V5Ym9hcmRIaW50U3RyaW5nXHJcbiAgICAgICAgfSApLFxyXG5cclxuICAgICAgICAvLyBPdmVyd3JpdGUgdGhlIGdlc3R1cmUgaGVscCB0ZXh0IHRvIGluY2x1ZGUgcnVsZXItc3BlY2lmaWMgbG9naWMuIFRoaXMgaXNuJ3QgYWx3YXlzIG5lZWRlZC5cclxuICAgICAgICBnZXN0dXJlSGVscFRleHQ6IFN0cmluZ1V0aWxzLmZpbGxJbiggcnVsZXJIZWxwVGV4dFN0cmluZywge1xyXG4gICAgICAgICAgZGV2aWNlU3BlY2lmaWNIaW50OiBTdHJpbmdVdGlscy5maWxsSW4oIGdlc3R1cmVIZWxwVGV4dFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgICBvYmplY3RUb0dyYWI6IHJ1bGVyTGFiZWxTdHJpbmdcclxuICAgICAgICAgIH0gKVxyXG4gICAgICAgIH0gKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBtYWpvclRpY2tMYWJlbHMgPSBvcHRpb25zLm1ham9yVGlja0xhYmVscztcclxuICAgIGNvbnN0IHJ1bGVyVW5pdFN0cmluZyA9IG9wdGlvbnMudW5pdFN0cmluZztcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHJ1bGVyID0gbmV3IFJ1bGVyTm9kZShcclxuICAgICAgUlVMRVJfV0lEVEgsXHJcbiAgICAgIFJVTEVSX0hFSUdIVCxcclxuICAgICAgNTAsXHJcbiAgICAgIG1ham9yVGlja0xhYmVscyxcclxuICAgICAgcnVsZXJVbml0U3RyaW5nLCB7XHJcbiAgICAgICAgYmFja2dyb3VuZEZpbGw6IG9wdGlvbnMuYmFja2dyb3VuZEZpbGwsXHJcbiAgICAgICAgaW5zZXRzV2lkdGg6IG9wdGlvbnMucnVsZXJJbnNldCxcclxuICAgICAgICBtaW5vclRpY2tzUGVyTWFqb3JUaWNrOiA0LFxyXG4gICAgICAgIG1ham9yVGlja0ZvbnQ6IG5ldyBQaGV0Rm9udCggMTIgKSxcclxuICAgICAgICBzbmFwVG9OZWFyZXN0OiBvcHRpb25zLnNuYXBUb05lYXJlc3QgPyBvcHRpb25zLnNuYXBUb05lYXJlc3QgOiAwLFxyXG4gICAgICAgIHVuaXRzRm9udDogbmV3IFBoZXRGb250KCAxMCApLFxyXG4gICAgICAgIHVuaXRzU3BhY2luZzogMyxcclxuICAgICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJ1bGVyICk7XHJcblxyXG4gICAgcnVsZXIubW91c2VBcmVhID0gU2hhcGUucmVjdGFuZ2xlKCAwLCAwLCBydWxlci5ib3VuZHMud2lkdGgsIFJVTEVSX0hFSUdIVCApO1xyXG4gICAgcnVsZXIudG91Y2hBcmVhID0gcnVsZXIubW91c2VBcmVhO1xyXG5cclxuICAgIC8vIFVzZSB0aGUgY29uc3RhbnQgaW5zdGVhZCBvZiBgdGhpcy53aWR0aGAgYmVjYXVzZSBSdWxlck5vZGUgYWRkcyBpbnNldCBvbiBlYWNoIHNpZGUgb2YgdGhlIHJ1bGVyLlxyXG4gICAgZHJhZ0JvdW5kcy5tYXhYID0gZHJhZ0JvdW5kcy5tYXhYICsgbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsRGVsdGFYKCBSVUxFUl9XSURUSCAvIDIgKTtcclxuXHJcbiAgICAvLyBBZGQgaGFsZiBvZiB0aGUgcnVsZXIgaGVpZ2h0IHNvIHRoZSB3aG9sZSBydWxlciBpcyBib3VuZGVkLCBub3QganVzdCB0aGUgY2VudGVyLiBVc2UgdGhlIGNvbnN0YW50IGluc3RlYWQgb2ZcclxuICAgIC8vIGB0aGlzLmhlaWdodGAgYmVjYXVzZSBSdWxlck5vZGUgYWRkcyBsaW5lIHdpZHRoIGFyb3VuZCBmb3IgZHJhd2luZ1xyXG4gICAgY29uc3QgZHJhZ0JvdW5kc1dpdGhSdWxlckhlaWdodCA9IGRyYWdCb3VuZHMuZGlsYXRlZFkoIG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbERlbHRhWSggUlVMRVJfSEVJR0hUIC8gMiApICk7XHJcblxyXG4gICAgLy8gc291bmQgZ2VuZXJhdGlvblxyXG5cclxuICAgIGxldCBncmFiUnVsZXJTb3VuZFBsYXllcjtcclxuICAgIGlmICggb3B0aW9ucy5ncmFiUnVsZXJTb3VuZFBsYXllciA9PT0gbnVsbCApIHtcclxuXHJcbiAgICAgIC8vIG5vIHNvdW5kIHBsYXllciBzcGVjaWZpZWQgYnkgdGhlIGNsaWVudCwgdXNlIHRoZSBkZWZhdWx0XHJcbiAgICAgIGdyYWJSdWxlclNvdW5kUGxheWVyID0gbmV3IFNvdW5kQ2xpcCggZ3JhYl9tcDMgKTtcclxuICAgICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCBncmFiUnVsZXJTb3VuZFBsYXllciApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGdyYWJSdWxlclNvdW5kUGxheWVyID0gb3B0aW9ucy5ncmFiUnVsZXJTb3VuZFBsYXllcjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcmVsZWFzZVJ1bGVyU291bmRQbGF5ZXI7XHJcbiAgICBpZiAoIG9wdGlvbnMucmVsZWFzZVJ1bGVyU291bmRQbGF5ZXIgPT09IG51bGwgKSB7XHJcblxyXG4gICAgICAvLyBubyBzb3VuZCBwbGF5ZXIgc3BlY2lmaWVkIGJ5IHRoZSBjbGllbnQsIHVzZSB0aGUgZGVmYXVsdFxyXG4gICAgICByZWxlYXNlUnVsZXJTb3VuZFBsYXllciA9IG5ldyBTb3VuZENsaXAoIHJlbGVhc2VfbXAzICk7XHJcbiAgICAgIHNvdW5kTWFuYWdlci5hZGRTb3VuZEdlbmVyYXRvciggcmVsZWFzZVJ1bGVyU291bmRQbGF5ZXIgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZWxlYXNlUnVsZXJTb3VuZFBsYXllciA9IG9wdGlvbnMucmVsZWFzZVJ1bGVyU291bmRQbGF5ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgYSBzb3VuZCBwbGF5ZXIgd2FzIHByb3ZpZGVkIGZvciBydWxlciBtb3Rpb24gYW5kLCBpZiBub3QsIGNyZWF0ZSBhIGRlZmF1bHRcclxuICAgIGxldCBtb3ZlbWVudFNvdW5kUGxheWVyO1xyXG4gICAgaWYgKCBvcHRpb25zLm1vdmVtZW50U291bmRQbGF5ZXIgPT09IG51bGwgKSB7XHJcblxyXG4gICAgICAvLyBubyBzb3VuZCBwbGF5ZXIgcHJvdmlkZWQsIHVzZSB0aGUgZGVmYXVsdFxyXG4gICAgICBtb3ZlbWVudFNvdW5kUGxheWVyID0gbmV3IFNvdW5kQ2xpcCggcnVsZXJNb3ZlbWVudDAwMF9tcDMsIHsgaW5pdGlhbE91dHB1dExldmVsOiAwLjIgfSApO1xyXG4gICAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIG1vdmVtZW50U291bmRQbGF5ZXIsIHsgc29uaWZpY2F0aW9uTGV2ZWw6IFNvdW5kTGV2ZWxFbnVtLkVYVFJBIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gdXNlIHRoZSBzb3VuZCBwbGF5ZXIgc3BlY2lmaWVkIGJ5IHRoZSB1c2VyXHJcbiAgICAgIG1vdmVtZW50U291bmRQbGF5ZXIgPSBvcHRpb25zLm1vdmVtZW50U291bmRQbGF5ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdmFyaWFibGUgdG8gdHJhY2sgcG9zaXRpb24gd2hlcmUgbGFzdCBtb3ZlbWVudCBzb3VuZCB3YXMgcHJvZHVjZWRcclxuICAgIGNvbnN0IHBvc2l0aW9uT2ZMYXN0TW90aW9uU291bmQgPSBydWxlclBvc2l0aW9uUHJvcGVydHkudmFsdWUuY29weSgpO1xyXG5cclxuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICBwb3NpdGlvblByb3BlcnR5OiBydWxlclBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ0xpc3RlbmVyJyApLFxyXG4gICAgICB0cmFuc2Zvcm06IG1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgdGFyZ2V0Tm9kZTogcnVsZXIsXHJcbiAgICAgIHVzZVBhcmVudE9mZnNldDogdHJ1ZSxcclxuICAgICAgbWFwUG9zaXRpb246IHBvc2l0aW9uID0+IHtcclxuXHJcbiAgICAgICAgLy8gc25hcCB0byBuZWFyZXN0IHNuYXBUb05lYXJlc3QgaWYgc3BlY2lmaWVkXHJcbiAgICAgICAgaWYgKCBvcHRpb25zLnNuYXBUb05lYXJlc3QgKSB7XHJcblxyXG4gICAgICAgICAgLy8geCBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAgICAgICAgY29uc3QgeE1vZGVsID0gcG9zaXRpb24ueDtcclxuICAgICAgICAgIHBvc2l0aW9uLnggPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggeE1vZGVsIC8gb3B0aW9ucy5zbmFwVG9OZWFyZXN0ICkgKiBvcHRpb25zLnNuYXBUb05lYXJlc3Q7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBtYXAgd2l0aGluZyB0aGUgZHJhZyBib3VuZHMsIHRoaXMgaXMgdGhlIHNhbWUgYXMgdXNpbmcgXCJkcmFnQm91bmRzUHJvcGVydHknXHJcbiAgICAgICAgcmV0dXJuIGRyYWdCb3VuZHNXaXRoUnVsZXJIZWlnaHQuY2xvc2VzdFBvaW50VG8oIHBvc2l0aW9uICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHBvc2l0aW9uT2ZMYXN0TW90aW9uU291bmQuc2V0KCBydWxlclBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgfSxcclxuICAgICAgZHJhZygpIHtcclxuICAgICAgICBjb25zdCBkaXN0YW5jZUZyb21MYXN0TW90aW9uU291bmRQbGF5ID0gcnVsZXJQb3NpdGlvblByb3BlcnR5LnZhbHVlLmRpc3RhbmNlKCBwb3NpdGlvbk9mTGFzdE1vdGlvblNvdW5kICk7XHJcbiAgICAgICAgaWYgKCBkaXN0YW5jZUZyb21MYXN0TW90aW9uU291bmRQbGF5ID4gU09VTkRfUExBWV9EUkFHX0RJU1RBTkNFICkge1xyXG4gICAgICAgICAgbW92ZW1lbnRTb3VuZFBsYXllci5wbGF5KCk7XHJcbiAgICAgICAgICBwb3NpdGlvbk9mTGFzdE1vdGlvblNvdW5kLnNldCggcnVsZXJQb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBydWxlckFsZXJ0ZXIub25EcmFnKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIHBkb20gLSBjdXN0b20gZm9jdXMgaGlnaGxpZ2h0XHJcbiAgICBjb25zdCBmb2N1c0hpZ2hsaWdodCA9IG5ldyBGb2N1c0hpZ2hsaWdodEZyb21Ob2RlKCBydWxlciwgeyB1c2VMb2NhbEJvdW5kczogdHJ1ZSB9ICk7XHJcbiAgICB0aGlzLnNldEZvY3VzSGlnaGxpZ2h0KCBmb2N1c0hpZ2hsaWdodCApO1xyXG5cclxuICAgIGNvbnN0IGdyYWJiZWRVdHRlcmFuY2UgPSBuZXcgVXR0ZXJhbmNlKCk7XHJcbiAgICBjb25zdCBrZXlib2FyZERyYWdEZWx0YSA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWCggb3B0aW9ucy5zbmFwVG9OZWFyZXN0ICk7XHJcblxyXG4gICAgLy8gc3VwcG9ydHMga2V5Ym9hcmQgaW50ZXJhY3Rpb25cclxuICAgIGNvbnN0IGtleWJvYXJkRHJhZ0xpc3RlbmVyID0gbmV3IEtleWJvYXJkRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgIGRyYWdCb3VuZHNQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBkcmFnQm91bmRzV2l0aFJ1bGVySGVpZ2h0ICksXHJcbiAgICAgIHBvc2l0aW9uUHJvcGVydHk6IHJ1bGVyUG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgdHJhbnNmb3JtOiBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIG1vdmVPbkhvbGREZWxheTogb3B0aW9ucy5tb3ZlT25Ib2xkRGVsYXksXHJcbiAgICAgIGRyYWdEZWx0YTogMiAqIGtleWJvYXJkRHJhZ0RlbHRhLFxyXG4gICAgICBzaGlmdERyYWdEZWx0YToga2V5Ym9hcmREcmFnRGVsdGEsXHJcblxyXG4gICAgICBzdGFydCgpIHtcclxuXHJcbiAgICAgICAgLy8gcGxheSBhIHNvdW5kIGF0IHRoZSBzdGFydCBvZiBhIGRyYWdcclxuICAgICAgICBtb3ZlbWVudFNvdW5kUGxheWVyLnBsYXkoKTtcclxuICAgICAgICBwb3NpdGlvbk9mTGFzdE1vdGlvblNvdW5kLnNldCggcnVsZXJQb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBzbmFwIHRvIG5lYXJlc3Qgc25hcFRvTmVhcmVzdCwgY2FsbGVkIG9uIGVuZCBzbyB0aGF0IGRyYWdnaW5nIGRvZXNuJ3Qgc25hcCB0byBhIHZhbHVlIGZvciBhcyBsb25nXHJcbiAgICAgIC8vIGFzIGtleSBpcyBoZWxkIGRvd25cclxuICAgICAgZHJhZygpIHtcclxuICAgICAgICBpZiAoIG9wdGlvbnMuc25hcFRvTmVhcmVzdCApIHtcclxuICAgICAgICAgIGNvbnN0IHhNb2RlbCA9IHJ1bGVyUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54O1xyXG4gICAgICAgICAgY29uc3Qgc25hcHBlZFggPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggeE1vZGVsIC8gb3B0aW9ucy5zbmFwVG9OZWFyZXN0ICkgKiBvcHRpb25zLnNuYXBUb05lYXJlc3Q7XHJcbiAgICAgICAgICBydWxlclBvc2l0aW9uUHJvcGVydHkuc2V0KCBuZXcgVmVjdG9yMiggc25hcHBlZFgsIHJ1bGVyUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55ICkgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHBsYXkgYSBzb3VuZCBpZiB0aGUgcnVsZXIgaGFzIGJlZW4gZHJhZ2dlZCBmb3IgYSB3YXlzIHdpdGhvdXQgYmVpbmcgcmVsZWFzZWRcclxuICAgICAgICBjb25zdCBkaXN0YW5jZUZyb21MYXN0TW90aW9uU291bmRQbGF5ID0gcnVsZXJQb3NpdGlvblByb3BlcnR5LnZhbHVlLmRpc3RhbmNlKCBwb3NpdGlvbk9mTGFzdE1vdGlvblNvdW5kICk7XHJcbiAgICAgICAgaWYgKCBkaXN0YW5jZUZyb21MYXN0TW90aW9uU291bmRQbGF5ID4gU09VTkRfUExBWV9EUkFHX0RJU1RBTkNFICkge1xyXG4gICAgICAgICAgbW92ZW1lbnRTb3VuZFBsYXllci5wbGF5KCk7XHJcbiAgICAgICAgICBwb3NpdGlvbk9mTGFzdE1vdGlvblNvdW5kLnNldCggcnVsZXJQb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBydWxlckFsZXJ0ZXIub25EcmFnKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAna2V5Ym9hcmREcmFnTGlzdGVuZXInIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5vbkdyYWIsICdJU0xDUnVsZXJOb2RlIHNldHMgaXRzIG93biBvbkdyYWInICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5vblJlbGVhc2UsICdJU0xDUnVsZXJOb2RlIHNldHMgaXRzIG93biBvblJlbGVhc2UnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5saXN0ZW5lcnNGb3JEcmFnU3RhdGUsICdJU0xDUnVsZXJOb2RlIHNldHMgaXRzIG93biBsaXN0ZW5lcnNGb3JEcmFnU3RhdGUnICk7XHJcbiAgICBjb25zdCBncmFiRHJhZ0ludGVyYWN0aW9uT3B0aW9ucyA9IG1lcmdlKCBvcHRpb25zLmdyYWJEcmFnSW50ZXJhY3Rpb25PcHRpb25zLCB7XHJcblxyXG4gICAgICBvbkdyYWI6ICgpID0+IHtcclxuICAgICAgICBncmFiUnVsZXJTb3VuZFBsYXllci5wbGF5KCk7XHJcblxyXG4gICAgICAgIC8vIGNhbGwgdGhpcyBmaXJzdCB0byB1cGRhdGUgdGhlIGRzZWNyaWJlciBzdGF0ZSBiZWZvcmUgdGhlIGFsZXJ0XHJcbiAgICAgICAgcnVsZXJBbGVydGVyLm9uR3JhYigpO1xyXG5cclxuICAgICAgICBncmFiYmVkVXR0ZXJhbmNlLmFsZXJ0ID0gcnVsZXJBbGVydGVyLmdldFJ1bGVyR3JhYmJlZEFsZXJ0YWJsZSgpO1xyXG4gICAgICAgIHRoaXMuYWxlcnREZXNjcmlwdGlvblV0dGVyYW5jZSggZ3JhYmJlZFV0dGVyYW5jZSApO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgb25SZWxlYXNlOiAoKSA9PiB7XHJcbiAgICAgICAgcmVsZWFzZVJ1bGVyU291bmRQbGF5ZXIucGxheSgpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdncmFiRHJhZ0ludGVyYWN0aW9uJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBhZGQgdGhlIFwiZ3JhYiBidXR0b25cIiBpbnRlcmFjdGlvblxyXG4gICAgdGhpcy5ncmFiRHJhZ0ludGVyYWN0aW9uID0gbmV3IEdyYWJEcmFnSW50ZXJhY3Rpb24oIHRoaXMsIGtleWJvYXJkRHJhZ0xpc3RlbmVyLCBncmFiRHJhZ0ludGVyYWN0aW9uT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIElmIHlvdSBjYW4ndCB1c2UgbW91c2UvdG91Y2gsIHRoZW4geW91IGNhbnQgdXNlIGtleWJvYXJkIGVpdGhlclxyXG4gICAgdGhpcy5pbnB1dEVuYWJsZWRQcm9wZXJ0eS5saW5rKCBpbnB1dEVuYWJsZWQgPT4ge1xyXG4gICAgICB0aGlzLmdyYWJEcmFnSW50ZXJhY3Rpb24uZW5hYmxlZCA9IGlucHV0RW5hYmxlZDtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBwZG9tIC0gdGhlIEdyYWJEcmFnSW50ZXJhY3Rpb24gaXMgYWRkZWQgdG8gdGhpcyBOb2RlIGJ1dCB0aGUgZHJhZyBoYW5kbGVyIGFuZCB0cmFuc2Zvcm0gY2hhbmdlcyBhcmUgYXBwbGllZFxyXG4gICAgLy8gdG8gdGhlIGNoaWxkIFJ1bGVyTm9kZSAtIFBET00gc2libGluZ3MgbmVlZCB0byByZXBvc2l0aW9uIHdpdGggdGhlIFJ1bGVyTm9kZVxyXG4gICAgdGhpcy5zZXRQRE9NVHJhbnNmb3JtU291cmNlTm9kZSggcnVsZXIgKTtcclxuXHJcbiAgICAvLyB0aGUgcnVsZXIncyBvcmlnaW4gaXMgdGhlIGNlbnRlciwgdGhpcyBvZmZzZXQgZ2V0cyB0aGUgZWRnZSBvZiBpdC5cclxuICAgIGNvbnN0IHJ1bGVyQWxpZ25XaXRoT2JqZWN0WE9mZnNldCA9IG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbERlbHRhWCggUlVMRVJfV0lEVEggKSAvIDI7XHJcblxyXG4gICAgLy8gcmVnaXN0ZXIgaG90a2V5c1xyXG4gICAga2V5Ym9hcmREcmFnTGlzdGVuZXIuaG90a2V5cyA9IFsge1xyXG4gICAgICBrZXlzOiBbIEtleWJvYXJkVXRpbHMuS0VZX0osIEtleWJvYXJkVXRpbHMuS0VZX0MgXSwgLy8ganVtcCB0byBjZW50ZXIgb2Ygb2JqZWN0IDFcclxuICAgICAgY2FsbGJhY2s6ICgpID0+IHtcclxuICAgICAgICBjb25zdCB4ID0gZ2V0T2JqZWN0MVBvc2l0aW9uKCk7XHJcbiAgICAgICAgY29uc3QgZGVzdGluYXRpb25Qb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCB4ICsgcnVsZXJBbGlnbldpdGhPYmplY3RYT2Zmc2V0LCBvcHRpb25zLm1vZGVsWUZvckNlbnRlckp1bXAgKTtcclxuICAgICAgICBpZiAoICFydWxlclBvc2l0aW9uUHJvcGVydHkudmFsdWUuZXF1YWxzKCBkZXN0aW5hdGlvblBvc2l0aW9uICkgKSB7XHJcbiAgICAgICAgICBydWxlclBvc2l0aW9uUHJvcGVydHkuc2V0KCBkZXN0aW5hdGlvblBvc2l0aW9uICk7XHJcbiAgICAgICAgICBtb3ZlbWVudFNvdW5kUGxheWVyLnBsYXkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJ1bGVyQWxlcnRlci5hbGVydEp1bXBDZW50ZXJNYXNzKCk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAga2V5czogWyBLZXlib2FyZFV0aWxzLktFWV9KLCBLZXlib2FyZFV0aWxzLktFWV9IIF0sIC8vIGp1bXAgaG9tZVxyXG4gICAgICBjYWxsYmFjazogKCkgPT4ge1xyXG4gICAgICAgIGlmICggIXJ1bGVyUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5lcXVhbHMoIHJ1bGVyUG9zaXRpb25Qcm9wZXJ0eS5pbml0aWFsVmFsdWUgKSApIHtcclxuICAgICAgICAgIG1vdmVtZW50U291bmRQbGF5ZXIucGxheSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBydWxlclBvc2l0aW9uUHJvcGVydHkuc2V0KCBydWxlclBvc2l0aW9uUHJvcGVydHkuaW5pdGlhbFZhbHVlICk7XHJcbiAgICAgICAgdGhpcy5ncmFiRHJhZ0ludGVyYWN0aW9uLnJlbGVhc2VEcmFnZ2FibGUoKTtcclxuXHJcbiAgICAgICAgcnVsZXJBbGVydGVyLmFsZXJ0SnVtcEhvbWUoKTtcclxuICAgICAgfVxyXG4gICAgfSBdO1xyXG5cclxuXHJcbiAgICAvLyBAcHVibGljIC0gcnVsZXIgbm9kZSBpcyBuZXZlciBkZXN0cm95ZWQsIG5vIGxpc3RlbmVyIGRpc3Bvc2FsIG5lY2Vzc2FyeVxyXG4gICAgcnVsZXJQb3NpdGlvblByb3BlcnR5LmxpbmsoIHZhbHVlID0+IHtcclxuICAgICAgcnVsZXIuY2VudGVyID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHZhbHVlICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgaWYgKCBTSE9XX1JVTEVSX1JFR0lPTlMgKSB7XHJcbiAgICAgIGNvbnN0IGxpbmVPcHRpb25zID0geyBzdHJva2U6ICdibGFjaycsIHg6IHJ1bGVyLndpZHRoIC8gMiwgeTogUlVMRVJfSEVJR0hUIC8gMiB9O1xyXG4gICAgICBjb25zdCB4TGluZSA9IG5ldyBMaW5lKCAtMTAsIDAsIDEwLCAwLCBsaW5lT3B0aW9ucyApO1xyXG4gICAgICBjb25zdCB5TGluZSA9IG5ldyBMaW5lKCAwLCAtMTAsIDAsIDEwLCBsaW5lT3B0aW9ucyApO1xyXG4gICAgICBydWxlci5hZGRDaGlsZCggeExpbmUgKTtcclxuICAgICAgcnVsZXIuYWRkQ2hpbGQoIHlMaW5lICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLmdyYWJEcmFnSW50ZXJhY3Rpb24ucmVzZXQoKTtcclxuICB9XHJcbn1cclxuXHJcbmludmVyc2VTcXVhcmVMYXdDb21tb24ucmVnaXN0ZXIoICdJU0xDUnVsZXJOb2RlJywgSVNMQ1J1bGVyTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBJU0xDUnVsZXJOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSw4QkFBOEI7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLDBCQUEwQjtBQUM1QyxPQUFPQyxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELFNBQVNDLEtBQUssUUFBUSw2QkFBNkI7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLGdDQUFnQztBQUNsRCxPQUFPQyxXQUFXLE1BQU0sNENBQTRDO0FBQ3BFLE9BQU9DLG1CQUFtQixNQUFNLCtEQUErRDtBQUMvRixPQUFPQyxRQUFRLE1BQU0sc0NBQXNDO0FBQzNELE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFDN0QsT0FBT0Msa0JBQWtCLE1BQU0sZ0RBQWdEO0FBQy9FLFNBQVNDLFlBQVksRUFBRUMsc0JBQXNCLEVBQUVDLHVCQUF1QixFQUFFQyxvQkFBb0IsRUFBRUMsYUFBYSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxnQ0FBZ0M7QUFDL0osT0FBT0MsU0FBUyxNQUFNLGlEQUFpRDtBQUN2RSxPQUFPQyxjQUFjLE1BQU0scUNBQXFDO0FBQ2hFLE9BQU9DLFlBQVksTUFBTSxtQ0FB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