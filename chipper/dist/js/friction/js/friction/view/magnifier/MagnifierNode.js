// Copyright 2013-2023, University of Colorado Boulder

/**
 * a Scenery Node that depicts the magnified area between the two books where the atoms can be seen
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../../dot/js/Bounds2.js';
import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import { Shape } from '../../../../../kite/js/imports.js';
import merge from '../../../../../phet-core/js/merge.js';
import { Circle, FocusHighlightPath, HBox, Node, Path, Rectangle, Voicing } from '../../../../../scenery/js/imports.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../../tambo/js/soundManager.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import harpDrop_mp3 from '../../../../sounds/harpDrop_mp3.js';
import harpPickup_mp3 from '../../../../sounds/harpPickup_mp3.js';
import friction from '../../../friction.js';
import FrictionStrings from '../../../FrictionStrings.js';
import FrictionConstants from '../../FrictionConstants.js';
import FrictionModel from '../../model/FrictionModel.js';
import CueArrow from '../CueArrow.js';
import FrictionDragListener from '../FrictionDragListener.js';
import FrictionGrabDragInteraction from '../FrictionGrabDragInteraction.js';
import FrictionKeyboardDragListener from '../FrictionKeyboardDragListener.js';
import AtomCanvasNode from './AtomCanvasNode.js';
import MagnifierTargetNode from './MagnifierTargetNode.js';

// constants
const WIDTH = FrictionConstants.MAGNIFIER_WINDOW_WIDTH;
const HEIGHT = FrictionConstants.MAGNIFIER_WINDOW_HEIGHT;
const ROUND = 30;
const SCALE = 0.05;
const SOUND_LEVEL = 0.1;
const ARROW_TOP = 22;
const zoomedInChemistryBookString = FrictionStrings.a11y.zoomedInChemistryBook;
class MagnifierNode extends Voicing(Node) {
  /**
   * @param {FrictionModel} model
   * @param {number} targetX - x position of the MagnifierTargetNode rectangle
   * @param {number} targetY - y position of the MagnifierTargetNode rectangle
   * @param {string} title - the title of the book that is draggable, used for a11y
   * @param {TemperatureIncreasingAlerter} temperatureIncreasingAlerter
   * @param {TemperatureDecreasingAlerter} temperatureDecreasingAlerter
   * @param {BookMovementAlerter} bookMovementAlerter
   * @param {GrabbedDescriber} grabbedDescriber
   * @param {function():} alertSettledAndCool
   * @param {Object} [options]
   */
  constructor(model, targetX, targetY, title, temperatureIncreasingAlerter, temperatureDecreasingAlerter, bookMovementAlerter, grabbedDescriber, alertSettledAndCool, options) {
    options = merge({
      tandem: Tandem.REQUIRED,
      interactiveHighlight: 'invisible'
    }, options);
    super(options);

    // add container for clipping
    this.container = new Node();
    this.addChild(this.container);

    // @private - container where the individual atoms will be placed
    this.topAtomsLayer = new Node();

    // init drag for background
    const background = new Rectangle(-1.125 * WIDTH, -HEIGHT, 3.25 * WIDTH, 4 * HEIGHT / 3 - FrictionModel.MAGNIFIED_ATOMS_INFO.distance, ROUND, ROUND, {
      fill: FrictionConstants.TOP_BOOK_COLOR,
      cursor: 'pointer'
    });

    // init drag for drag area
    const atomDragArea = new VoicingRectangle(0.055 * WIDTH, 0.175 * HEIGHT, 0.875 * WIDTH, FrictionModel.MAGNIFIED_ATOMS_INFO.distanceY * 6, {
      fill: null,
      cursor: 'pointer',
      children: [background],
      // phet-io
      tandem: options.tandem.createTandem('atomDragArea'),
      phetioVisiblePropertyInstrumented: false,
      phetioInputEnabledPropertyInstrumented: true,
      // pdom
      focusHighlightLayerable: true,
      // interactive highlights
      interactiveHighlightLayerable: true,
      // voicing
      voicingNameResponse: zoomedInChemistryBookString
    });

    // arrow icon
    const leftArrow = new CueArrow({
      rotation: Math.PI,
      fill: 'white'
    });
    const rightArrow = new CueArrow({
      fill: 'white'
    });
    const visualArrowIcon = new HBox({
      children: [leftArrow, rightArrow],
      spacing: 20,
      centerX: WIDTH / 2,
      top: ARROW_TOP,
      // Cue arrows are visible if hintProperty is true, and if the inputEnabledProperty is true (can be disabled in studio)
      visibleProperty: DerivedProperty.and([model.hintProperty, atomDragArea.inputEnabledProperty])
    });

    // Intermediate Node to support PhET-iO instrumentation that can control the visibility and bypass the sim reverting it (like via reset).
    const hintArrowsNode = new Node({
      children: [visualArrowIcon],
      tandem: options.tandem.createTandem('hintArrowsNode'),
      phetioDocumentation: 'the node that holds the visual hint, or "cue" arrows'
    });

    // create and register the sound generators that will be used when the top book is picked up and dropped
    const bookPickupSoundClip = new SoundClip(harpPickup_mp3, {
      initialOutputLevel: SOUND_LEVEL
    });
    soundManager.addSoundGenerator(bookPickupSoundClip);
    const bookDropSoundClip = new SoundClip(harpDrop_mp3, {
      initialOutputLevel: SOUND_LEVEL
    });
    soundManager.addSoundGenerator(bookDropSoundClip);

    // @private - add bottom book
    this.bottomBookBackground = new Node({
      children: [new Rectangle(3, 2 * HEIGHT / 3 - 2, WIDTH - 6, HEIGHT / 3, 0, ROUND - 3, {
        fill: FrictionConstants.BOTTOM_BOOK_COLOR
      })]
    });

    // add the "bumps" to the book
    addRowCircles(FrictionModel.MAGNIFIED_ATOMS_INFO.radius, FrictionModel.MAGNIFIED_ATOMS_INFO.distanceX, this.bottomBookBackground, {
      color: FrictionConstants.BOTTOM_BOOK_COLOR,
      x: -FrictionModel.MAGNIFIED_ATOMS_INFO.distanceX / 2,
      y: 2 * HEIGHT / 3 - 2,
      width: WIDTH
    });
    this.container.addChild(this.bottomBookBackground);

    // @private - add top book
    this.topBookBackground = new Node();
    atomDragArea.addInputListener(new FrictionDragListener(model, temperatureIncreasingAlerter, temperatureDecreasingAlerter, bookMovementAlerter, {
      tandem: options.tandem.createTandem('dragListener'),
      startSound: bookPickupSoundClip,
      endSound: bookDropSoundClip,
      targetNode: this.topBookBackground,
      startDrag: () => atomDragArea.voicingSpeakFullResponse({
        objectResponse: grabbedDescriber.getVoicingGrabbedObjectResponse()
      })
    }));
    this.topBookBackground.addChild(atomDragArea);

    // add arrows before the drag area, then the grab cue hides the arrows
    this.topBookBackground.addChild(hintArrowsNode);
    addRowCircles(FrictionModel.MAGNIFIED_ATOMS_INFO.radius, FrictionModel.MAGNIFIED_ATOMS_INFO.distanceX, this.topBookBackground, {
      color: FrictionConstants.TOP_BOOK_COLOR,
      x: -WIDTH,
      y: HEIGHT / 3 - FrictionModel.MAGNIFIED_ATOMS_INFO.distance,
      width: 3 * WIDTH
    });

    // a11y - Custom shape highlights, shape will change with atomRowsToShearOffProperty. Focus and Interactive
    // highlights are identical, but we need two different Nodes because GrabDragInteraction adds children to the
    // focus highlight that are specific to the keyboard interaction.
    const focusHighlightPath = new FocusHighlightPath(getFocusHighlightShape(atomDragArea));
    const interactiveHighlightPath = new FocusHighlightPath(getFocusHighlightShape(atomDragArea));
    focusHighlightPath.pickable = false;
    interactiveHighlightPath.pickable = false;

    // pdom - the GrabDragInteraction is positioned based on the whole drag area, but the center of that is behind
    // the background white, so set a source Node to support mobile a11y that has a center that will respond to a pointer
    // down
    atomDragArea.setPDOMTransformSourceNode(interactiveHighlightPath);

    // a11y - add the focus highlight on top of the row circles must be added prior to adding the grab/drag interaction
    // this is a constraint of the grab/drag interaction, must be set before it's creation, but only for
    // focusHighlightLayerable
    this.topBookBackground.addChild(focusHighlightPath);
    this.topBookBackground.addChild(interactiveHighlightPath);
    atomDragArea.focusHighlight = focusHighlightPath;
    atomDragArea.interactiveHighlight = interactiveHighlightPath;

    // cuing arrows for the book
    const bookCueArrowLeft = new CueArrow({
      rotation: Math.PI
    });
    const bookCueArrowRight = new CueArrow();
    const horizontalCueArrows = new HBox({
      children: [bookCueArrowLeft, bookCueArrowRight],
      spacing: 30,
      // to be scaled down below
      centerX: WIDTH / 2,
      top: ARROW_TOP
    });
    const bookCueArrowVertical = new CueArrow({
      top: horizontalCueArrows.centerY,
      arrowLength: 55,
      rotation: Math.PI / 2,
      centerX: WIDTH / 2
    });
    const cueArrows = new Node({
      children: [horizontalCueArrows, bookCueArrowVertical],
      scale: 0.6,
      centerX: WIDTH / 2,
      top: ARROW_TOP
    });

    // pdom - add the keyboard drag listener to the top atoms
    this.keyboardDragListener = new FrictionKeyboardDragListener(model, temperatureIncreasingAlerter, temperatureDecreasingAlerter, bookMovementAlerter, {
      tandem: options.tandem.createTandem('keyboardDragListener')
    });

    // pdom
    const grabDragInteraction = new FrictionGrabDragInteraction(model, this.keyboardDragListener, atomDragArea, grabbedDescriber, alertSettledAndCool, {
      objectToGrabString: zoomedInChemistryBookString,
      tandem: options.tandem.createTandem('grabDragInteraction'),
      grabCueOptions: {
        center: atomDragArea.center.plusXY(0, 102) // empirically determined
      },

      grabbableOptions: {
        focusHighlight: focusHighlightPath
      },
      // The help text is provided by the BookNode's interaction
      keyboardHelpText: null,
      gestureHelpText: null,
      // handler for when the user grabs the book
      onGrab: () => {
        model.hintProperty.set(false); // hide the visual cue arrows
        bookPickupSoundClip.play();
      },
      // handler for when the user releases the book
      onRelease: () => {
        bookDropSoundClip.play();
      },
      dragCueNode: cueArrows
    });
    this.container.addChild(this.topBookBackground);
    atomDragArea.inputEnabledProperty.link(inputEnabled => {
      model.hintProperty.value = inputEnabled;
      grabDragInteraction.enabled = inputEnabled;
    });

    // Add the red border around the magnified area, and add a white shape below it to block out the clipped area.
    const topPadding = 500;
    const sidePadding = 800;
    const bottomPadding = 10; // don't go too far below the magnifier
    const rightX = WIDTH + sidePadding;
    const leftX = -sidePadding;
    const topY = -topPadding;
    const bottomY = HEIGHT + bottomPadding;
    const innerLowX = ROUND;
    const innerHighX = WIDTH - ROUND;
    const innerLowY = ROUND;
    const innerHighY = HEIGHT - ROUND;
    this.addChild(new Path(new Shape().moveTo(rightX, topY).lineTo(leftX, topY).lineTo(leftX, bottomY).lineTo(rightX, bottomY).lineTo(rightX, topY).lineTo(innerHighX, innerLowY - ROUND).arc(innerHighX, innerLowY, ROUND, -Math.PI / 2, 0, false).arc(innerHighX, innerHighY, ROUND, 0, Math.PI / 2, false).arc(innerLowX, innerHighY, ROUND, Math.PI / 2, Math.PI, false).arc(innerLowX, innerLowY, ROUND, Math.PI, Math.PI * 3 / 2, false).lineTo(innerHighX, innerLowY - ROUND).close(), {
      fill: 'white',
      pickable: true // absorb the input instead of grabbing the book through the background
    }));

    // add the containing border rectangle
    this.addChild(new Rectangle(0, 0, WIDTH, HEIGHT, ROUND, ROUND, {
      stroke: 'black',
      lineWidth: 5,
      pickable: false
    }));

    // add magnifier's target
    const magnifierTargetNode = new MagnifierTargetNode(targetX, targetY, WIDTH * SCALE, HEIGHT * SCALE, ROUND * SCALE, new Vector2(ROUND, HEIGHT), new Vector2(WIDTH - ROUND, HEIGHT));
    this.addChild(magnifierTargetNode);

    // @private - Add the canvas where the atoms will be rendered. For better performance, particularly on iPad, we are
    // using CanvasNode to render the atoms instead of individual nodes.
    this.atomCanvasNode = new AtomCanvasNode(model.atoms, {
      canvasBounds: new Bounds2(0, 0, WIDTH, HEIGHT)
    });
    this.container.addChild(this.atomCanvasNode);
    model.topBookPositionProperty.linkAttribute(this.topBookBackground, 'translation');
    model.topBookPositionProperty.linkAttribute(this.topAtomsLayer, 'translation');
    model.atomRowsToShearOffProperty.link(number => {
      // Adjust the drag area as the number of rows of atoms shears off.
      atomDragArea.setRectHeight((number + 2) * FrictionModel.MAGNIFIED_ATOMS_INFO.distanceY);

      // Update the size of the highlights accordingly
      const highlightShape = getFocusHighlightShape(atomDragArea);
      focusHighlightPath.setShape(highlightShape);
      interactiveHighlightPath.setShape(highlightShape);
    });

    // @private
    this.resetMagnifierNode = () => {
      grabDragInteraction.reset();
    };
  }

  /**
   * move forward in time
   * @public
   */
  step() {
    this.atomCanvasNode.invalidatePaint(); // tell the atom canvas to redraw itself on every step
  }

  /**
   * @public
   */
  reset() {
    this.resetMagnifierNode();
  }
}
friction.register('MagnifierNode', MagnifierNode);

// helper function that adds a row of circles at the specified position, used to add bumps to the magnified books
function addRowCircles(circleRadius, xSpacing, parentNode, options) {
  const numberOfAtomsForRow = options.width / xSpacing;
  for (let i = 0; i < numberOfAtomsForRow; i++) {
    parentNode.addChild(new Circle(circleRadius, {
      fill: options.color,
      y: options.y,
      x: options.x + xSpacing * i,
      pickable: false // input should pass through to a background Node which may support input depending on the atom circle.
    }));
  }
}

class VoicingRectangle extends Voicing(Rectangle) {
  constructor(x, y, width, height, options) {
    super(x, y, width, height, options);
  }
}

/**
 *
 * @param {Node} dragArea
 * @returns {Shape}
 */
function getFocusHighlightShape(dragArea) {
  // Use selfBounds because the dragArea has children that are larger than the focusHighlight we want.
  return Shape.bounds(dragArea.selfBounds.withOffsets(0, 40, 0, 0));
}
export default MagnifierNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiRGVyaXZlZFByb3BlcnR5IiwiVmVjdG9yMiIsIlNoYXBlIiwibWVyZ2UiLCJDaXJjbGUiLCJGb2N1c0hpZ2hsaWdodFBhdGgiLCJIQm94IiwiTm9kZSIsIlBhdGgiLCJSZWN0YW5nbGUiLCJWb2ljaW5nIiwiU291bmRDbGlwIiwic291bmRNYW5hZ2VyIiwiVGFuZGVtIiwiaGFycERyb3BfbXAzIiwiaGFycFBpY2t1cF9tcDMiLCJmcmljdGlvbiIsIkZyaWN0aW9uU3RyaW5ncyIsIkZyaWN0aW9uQ29uc3RhbnRzIiwiRnJpY3Rpb25Nb2RlbCIsIkN1ZUFycm93IiwiRnJpY3Rpb25EcmFnTGlzdGVuZXIiLCJGcmljdGlvbkdyYWJEcmFnSW50ZXJhY3Rpb24iLCJGcmljdGlvbktleWJvYXJkRHJhZ0xpc3RlbmVyIiwiQXRvbUNhbnZhc05vZGUiLCJNYWduaWZpZXJUYXJnZXROb2RlIiwiV0lEVEgiLCJNQUdOSUZJRVJfV0lORE9XX1dJRFRIIiwiSEVJR0hUIiwiTUFHTklGSUVSX1dJTkRPV19IRUlHSFQiLCJST1VORCIsIlNDQUxFIiwiU09VTkRfTEVWRUwiLCJBUlJPV19UT1AiLCJ6b29tZWRJbkNoZW1pc3RyeUJvb2tTdHJpbmciLCJhMTF5Iiwiem9vbWVkSW5DaGVtaXN0cnlCb29rIiwiTWFnbmlmaWVyTm9kZSIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ0YXJnZXRYIiwidGFyZ2V0WSIsInRpdGxlIiwidGVtcGVyYXR1cmVJbmNyZWFzaW5nQWxlcnRlciIsInRlbXBlcmF0dXJlRGVjcmVhc2luZ0FsZXJ0ZXIiLCJib29rTW92ZW1lbnRBbGVydGVyIiwiZ3JhYmJlZERlc2NyaWJlciIsImFsZXJ0U2V0dGxlZEFuZENvb2wiLCJvcHRpb25zIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJpbnRlcmFjdGl2ZUhpZ2hsaWdodCIsImNvbnRhaW5lciIsImFkZENoaWxkIiwidG9wQXRvbXNMYXllciIsImJhY2tncm91bmQiLCJNQUdOSUZJRURfQVRPTVNfSU5GTyIsImRpc3RhbmNlIiwiZmlsbCIsIlRPUF9CT09LX0NPTE9SIiwiY3Vyc29yIiwiYXRvbURyYWdBcmVhIiwiVm9pY2luZ1JlY3RhbmdsZSIsImRpc3RhbmNlWSIsImNoaWxkcmVuIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkIiwicGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJmb2N1c0hpZ2hsaWdodExheWVyYWJsZSIsImludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlIiwidm9pY2luZ05hbWVSZXNwb25zZSIsImxlZnRBcnJvdyIsInJvdGF0aW9uIiwiTWF0aCIsIlBJIiwicmlnaHRBcnJvdyIsInZpc3VhbEFycm93SWNvbiIsInNwYWNpbmciLCJjZW50ZXJYIiwidG9wIiwidmlzaWJsZVByb3BlcnR5IiwiYW5kIiwiaGludFByb3BlcnR5IiwiaW5wdXRFbmFibGVkUHJvcGVydHkiLCJoaW50QXJyb3dzTm9kZSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJib29rUGlja3VwU291bmRDbGlwIiwiaW5pdGlhbE91dHB1dExldmVsIiwiYWRkU291bmRHZW5lcmF0b3IiLCJib29rRHJvcFNvdW5kQ2xpcCIsImJvdHRvbUJvb2tCYWNrZ3JvdW5kIiwiQk9UVE9NX0JPT0tfQ09MT1IiLCJhZGRSb3dDaXJjbGVzIiwicmFkaXVzIiwiZGlzdGFuY2VYIiwiY29sb3IiLCJ4IiwieSIsIndpZHRoIiwidG9wQm9va0JhY2tncm91bmQiLCJhZGRJbnB1dExpc3RlbmVyIiwic3RhcnRTb3VuZCIsImVuZFNvdW5kIiwidGFyZ2V0Tm9kZSIsInN0YXJ0RHJhZyIsInZvaWNpbmdTcGVha0Z1bGxSZXNwb25zZSIsIm9iamVjdFJlc3BvbnNlIiwiZ2V0Vm9pY2luZ0dyYWJiZWRPYmplY3RSZXNwb25zZSIsImZvY3VzSGlnaGxpZ2h0UGF0aCIsImdldEZvY3VzSGlnaGxpZ2h0U2hhcGUiLCJpbnRlcmFjdGl2ZUhpZ2hsaWdodFBhdGgiLCJwaWNrYWJsZSIsInNldFBET01UcmFuc2Zvcm1Tb3VyY2VOb2RlIiwiZm9jdXNIaWdobGlnaHQiLCJib29rQ3VlQXJyb3dMZWZ0IiwiYm9va0N1ZUFycm93UmlnaHQiLCJob3Jpem9udGFsQ3VlQXJyb3dzIiwiYm9va0N1ZUFycm93VmVydGljYWwiLCJjZW50ZXJZIiwiYXJyb3dMZW5ndGgiLCJjdWVBcnJvd3MiLCJzY2FsZSIsImtleWJvYXJkRHJhZ0xpc3RlbmVyIiwiZ3JhYkRyYWdJbnRlcmFjdGlvbiIsIm9iamVjdFRvR3JhYlN0cmluZyIsImdyYWJDdWVPcHRpb25zIiwiY2VudGVyIiwicGx1c1hZIiwiZ3JhYmJhYmxlT3B0aW9ucyIsImtleWJvYXJkSGVscFRleHQiLCJnZXN0dXJlSGVscFRleHQiLCJvbkdyYWIiLCJzZXQiLCJwbGF5Iiwib25SZWxlYXNlIiwiZHJhZ0N1ZU5vZGUiLCJsaW5rIiwiaW5wdXRFbmFibGVkIiwidmFsdWUiLCJlbmFibGVkIiwidG9wUGFkZGluZyIsInNpZGVQYWRkaW5nIiwiYm90dG9tUGFkZGluZyIsInJpZ2h0WCIsImxlZnRYIiwidG9wWSIsImJvdHRvbVkiLCJpbm5lckxvd1giLCJpbm5lckhpZ2hYIiwiaW5uZXJMb3dZIiwiaW5uZXJIaWdoWSIsIm1vdmVUbyIsImxpbmVUbyIsImFyYyIsImNsb3NlIiwic3Ryb2tlIiwibGluZVdpZHRoIiwibWFnbmlmaWVyVGFyZ2V0Tm9kZSIsImF0b21DYW52YXNOb2RlIiwiYXRvbXMiLCJjYW52YXNCb3VuZHMiLCJ0b3BCb29rUG9zaXRpb25Qcm9wZXJ0eSIsImxpbmtBdHRyaWJ1dGUiLCJhdG9tUm93c1RvU2hlYXJPZmZQcm9wZXJ0eSIsIm51bWJlciIsInNldFJlY3RIZWlnaHQiLCJoaWdobGlnaHRTaGFwZSIsInNldFNoYXBlIiwicmVzZXRNYWduaWZpZXJOb2RlIiwicmVzZXQiLCJzdGVwIiwiaW52YWxpZGF0ZVBhaW50IiwicmVnaXN0ZXIiLCJjaXJjbGVSYWRpdXMiLCJ4U3BhY2luZyIsInBhcmVudE5vZGUiLCJudW1iZXJPZkF0b21zRm9yUm93IiwiaSIsImhlaWdodCIsImRyYWdBcmVhIiwiYm91bmRzIiwic2VsZkJvdW5kcyIsIndpdGhPZmZzZXRzIl0sInNvdXJjZXMiOlsiTWFnbmlmaWVyTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBhIFNjZW5lcnkgTm9kZSB0aGF0IGRlcGljdHMgdGhlIG1hZ25pZmllZCBhcmVhIGJldHdlZW4gdGhlIHR3byBib29rcyB3aGVyZSB0aGUgYXRvbXMgY2FuIGJlIHNlZW5cclxuICpcclxuICogQGF1dGhvciBBbmRyZXkgWmVsZW5rb3YgKE1sZWFybmVyKVxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBDaXJjbGUsIEZvY3VzSGlnaGxpZ2h0UGF0aCwgSEJveCwgTm9kZSwgUGF0aCwgUmVjdGFuZ2xlLCBWb2ljaW5nIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFNvdW5kQ2xpcCBmcm9tICcuLi8uLi8uLi8uLi8uLi90YW1iby9qcy9zb3VuZC1nZW5lcmF0b3JzL1NvdW5kQ2xpcC5qcyc7XHJcbmltcG9ydCBzb3VuZE1hbmFnZXIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vdGFtYm8vanMvc291bmRNYW5hZ2VyLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IGhhcnBEcm9wX21wMyBmcm9tICcuLi8uLi8uLi8uLi9zb3VuZHMvaGFycERyb3BfbXAzLmpzJztcclxuaW1wb3J0IGhhcnBQaWNrdXBfbXAzIGZyb20gJy4uLy4uLy4uLy4uL3NvdW5kcy9oYXJwUGlja3VwX21wMy5qcyc7XHJcbmltcG9ydCBmcmljdGlvbiBmcm9tICcuLi8uLi8uLi9mcmljdGlvbi5qcyc7XHJcbmltcG9ydCBGcmljdGlvblN0cmluZ3MgZnJvbSAnLi4vLi4vLi4vRnJpY3Rpb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IEZyaWN0aW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uL0ZyaWN0aW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEZyaWN0aW9uTW9kZWwgZnJvbSAnLi4vLi4vbW9kZWwvRnJpY3Rpb25Nb2RlbC5qcyc7XHJcbmltcG9ydCBDdWVBcnJvdyBmcm9tICcuLi9DdWVBcnJvdy5qcyc7XHJcbmltcG9ydCBGcmljdGlvbkRyYWdMaXN0ZW5lciBmcm9tICcuLi9GcmljdGlvbkRyYWdMaXN0ZW5lci5qcyc7XHJcbmltcG9ydCBGcmljdGlvbkdyYWJEcmFnSW50ZXJhY3Rpb24gZnJvbSAnLi4vRnJpY3Rpb25HcmFiRHJhZ0ludGVyYWN0aW9uLmpzJztcclxuaW1wb3J0IEZyaWN0aW9uS2V5Ym9hcmREcmFnTGlzdGVuZXIgZnJvbSAnLi4vRnJpY3Rpb25LZXlib2FyZERyYWdMaXN0ZW5lci5qcyc7XHJcbmltcG9ydCBBdG9tQ2FudmFzTm9kZSBmcm9tICcuL0F0b21DYW52YXNOb2RlLmpzJztcclxuaW1wb3J0IE1hZ25pZmllclRhcmdldE5vZGUgZnJvbSAnLi9NYWduaWZpZXJUYXJnZXROb2RlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBXSURUSCA9IEZyaWN0aW9uQ29uc3RhbnRzLk1BR05JRklFUl9XSU5ET1dfV0lEVEg7XHJcbmNvbnN0IEhFSUdIVCA9IEZyaWN0aW9uQ29uc3RhbnRzLk1BR05JRklFUl9XSU5ET1dfSEVJR0hUO1xyXG5jb25zdCBST1VORCA9IDMwO1xyXG5jb25zdCBTQ0FMRSA9IDAuMDU7XHJcbmNvbnN0IFNPVU5EX0xFVkVMID0gMC4xO1xyXG5jb25zdCBBUlJPV19UT1AgPSAyMjtcclxuXHJcbmNvbnN0IHpvb21lZEluQ2hlbWlzdHJ5Qm9va1N0cmluZyA9IEZyaWN0aW9uU3RyaW5ncy5hMTF5Lnpvb21lZEluQ2hlbWlzdHJ5Qm9vaztcclxuXHJcbmNsYXNzIE1hZ25pZmllck5vZGUgZXh0ZW5kcyBWb2ljaW5nKCBOb2RlICkge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0ZyaWN0aW9uTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRhcmdldFggLSB4IHBvc2l0aW9uIG9mIHRoZSBNYWduaWZpZXJUYXJnZXROb2RlIHJlY3RhbmdsZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0YXJnZXRZIC0geSBwb3NpdGlvbiBvZiB0aGUgTWFnbmlmaWVyVGFyZ2V0Tm9kZSByZWN0YW5nbGVcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGUgLSB0aGUgdGl0bGUgb2YgdGhlIGJvb2sgdGhhdCBpcyBkcmFnZ2FibGUsIHVzZWQgZm9yIGExMXlcclxuICAgKiBAcGFyYW0ge1RlbXBlcmF0dXJlSW5jcmVhc2luZ0FsZXJ0ZXJ9IHRlbXBlcmF0dXJlSW5jcmVhc2luZ0FsZXJ0ZXJcclxuICAgKiBAcGFyYW0ge1RlbXBlcmF0dXJlRGVjcmVhc2luZ0FsZXJ0ZXJ9IHRlbXBlcmF0dXJlRGVjcmVhc2luZ0FsZXJ0ZXJcclxuICAgKiBAcGFyYW0ge0Jvb2tNb3ZlbWVudEFsZXJ0ZXJ9IGJvb2tNb3ZlbWVudEFsZXJ0ZXJcclxuICAgKiBAcGFyYW0ge0dyYWJiZWREZXNjcmliZXJ9IGdyYWJiZWREZXNjcmliZXJcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCk6fSBhbGVydFNldHRsZWRBbmRDb29sXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCxcclxuICAgICAgICAgICAgICAgdGFyZ2V0WCxcclxuICAgICAgICAgICAgICAgdGFyZ2V0WSxcclxuICAgICAgICAgICAgICAgdGl0bGUsXHJcbiAgICAgICAgICAgICAgIHRlbXBlcmF0dXJlSW5jcmVhc2luZ0FsZXJ0ZXIsXHJcbiAgICAgICAgICAgICAgIHRlbXBlcmF0dXJlRGVjcmVhc2luZ0FsZXJ0ZXIsXHJcbiAgICAgICAgICAgICAgIGJvb2tNb3ZlbWVudEFsZXJ0ZXIsXHJcbiAgICAgICAgICAgICAgIGdyYWJiZWREZXNjcmliZXIsXHJcbiAgICAgICAgICAgICAgIGFsZXJ0U2V0dGxlZEFuZENvb2wsXHJcbiAgICAgICAgICAgICAgIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxyXG4gICAgICBpbnRlcmFjdGl2ZUhpZ2hsaWdodDogJ2ludmlzaWJsZSdcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIGFkZCBjb250YWluZXIgZm9yIGNsaXBwaW5nXHJcbiAgICB0aGlzLmNvbnRhaW5lciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmNvbnRhaW5lciApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gY29udGFpbmVyIHdoZXJlIHRoZSBpbmRpdmlkdWFsIGF0b21zIHdpbGwgYmUgcGxhY2VkXHJcbiAgICB0aGlzLnRvcEF0b21zTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIC8vIGluaXQgZHJhZyBmb3IgYmFja2dyb3VuZFxyXG4gICAgY29uc3QgYmFja2dyb3VuZCA9IG5ldyBSZWN0YW5nbGUoXHJcbiAgICAgIC0xLjEyNSAqIFdJRFRILFxyXG4gICAgICAtSEVJR0hULFxyXG4gICAgICAzLjI1ICogV0lEVEgsXHJcbiAgICAgIDQgKiBIRUlHSFQgLyAzIC0gRnJpY3Rpb25Nb2RlbC5NQUdOSUZJRURfQVRPTVNfSU5GTy5kaXN0YW5jZSxcclxuICAgICAgUk9VTkQsXHJcbiAgICAgIFJPVU5ELCB7XHJcbiAgICAgICAgZmlsbDogRnJpY3Rpb25Db25zdGFudHMuVE9QX0JPT0tfQ09MT1IsXHJcbiAgICAgICAgY3Vyc29yOiAncG9pbnRlcidcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBpbml0IGRyYWcgZm9yIGRyYWcgYXJlYVxyXG4gICAgY29uc3QgYXRvbURyYWdBcmVhID0gbmV3IFZvaWNpbmdSZWN0YW5nbGUoXHJcbiAgICAgIDAuMDU1ICogV0lEVEgsXHJcbiAgICAgIDAuMTc1ICogSEVJR0hULFxyXG4gICAgICAwLjg3NSAqIFdJRFRILFxyXG4gICAgICBGcmljdGlvbk1vZGVsLk1BR05JRklFRF9BVE9NU19JTkZPLmRpc3RhbmNlWSAqIDYsIHtcclxuICAgICAgICBmaWxsOiBudWxsLFxyXG4gICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgIGNoaWxkcmVuOiBbIGJhY2tncm91bmQgXSxcclxuXHJcbiAgICAgICAgLy8gcGhldC1pb1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYXRvbURyYWdBcmVhJyApLFxyXG4gICAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2UsXHJcbiAgICAgICAgcGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQ6IHRydWUsXHJcblxyXG4gICAgICAgIC8vIHBkb21cclxuICAgICAgICBmb2N1c0hpZ2hsaWdodExheWVyYWJsZTogdHJ1ZSxcclxuXHJcbiAgICAgICAgLy8gaW50ZXJhY3RpdmUgaGlnaGxpZ2h0c1xyXG4gICAgICAgIGludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlOiB0cnVlLFxyXG5cclxuICAgICAgICAvLyB2b2ljaW5nXHJcbiAgICAgICAgdm9pY2luZ05hbWVSZXNwb25zZTogem9vbWVkSW5DaGVtaXN0cnlCb29rU3RyaW5nXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBhcnJvdyBpY29uXHJcbiAgICBjb25zdCBsZWZ0QXJyb3cgPSBuZXcgQ3VlQXJyb3coIHsgcm90YXRpb246IE1hdGguUEksIGZpbGw6ICd3aGl0ZScgfSApO1xyXG4gICAgY29uc3QgcmlnaHRBcnJvdyA9IG5ldyBDdWVBcnJvdyggeyBmaWxsOiAnd2hpdGUnIH0gKTtcclxuICAgIGNvbnN0IHZpc3VhbEFycm93SWNvbiA9IG5ldyBIQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIGxlZnRBcnJvdywgcmlnaHRBcnJvdyBdLFxyXG4gICAgICBzcGFjaW5nOiAyMCxcclxuICAgICAgY2VudGVyWDogV0lEVEggLyAyLFxyXG4gICAgICB0b3A6IEFSUk9XX1RPUCxcclxuXHJcbiAgICAgIC8vIEN1ZSBhcnJvd3MgYXJlIHZpc2libGUgaWYgaGludFByb3BlcnR5IGlzIHRydWUsIGFuZCBpZiB0aGUgaW5wdXRFbmFibGVkUHJvcGVydHkgaXMgdHJ1ZSAoY2FuIGJlIGRpc2FibGVkIGluIHN0dWRpbylcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBEZXJpdmVkUHJvcGVydHkuYW5kKCBbIG1vZGVsLmhpbnRQcm9wZXJ0eSwgYXRvbURyYWdBcmVhLmlucHV0RW5hYmxlZFByb3BlcnR5IF0gKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEludGVybWVkaWF0ZSBOb2RlIHRvIHN1cHBvcnQgUGhFVC1pTyBpbnN0cnVtZW50YXRpb24gdGhhdCBjYW4gY29udHJvbCB0aGUgdmlzaWJpbGl0eSBhbmQgYnlwYXNzIHRoZSBzaW0gcmV2ZXJ0aW5nIGl0IChsaWtlIHZpYSByZXNldCkuXHJcbiAgICBjb25zdCBoaW50QXJyb3dzTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHZpc3VhbEFycm93SWNvbiBdLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2hpbnRBcnJvd3NOb2RlJyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndGhlIG5vZGUgdGhhdCBob2xkcyB0aGUgdmlzdWFsIGhpbnQsIG9yIFwiY3VlXCIgYXJyb3dzJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhbmQgcmVnaXN0ZXIgdGhlIHNvdW5kIGdlbmVyYXRvcnMgdGhhdCB3aWxsIGJlIHVzZWQgd2hlbiB0aGUgdG9wIGJvb2sgaXMgcGlja2VkIHVwIGFuZCBkcm9wcGVkXHJcbiAgICBjb25zdCBib29rUGlja3VwU291bmRDbGlwID0gbmV3IFNvdW5kQ2xpcCggaGFycFBpY2t1cF9tcDMsIHsgaW5pdGlhbE91dHB1dExldmVsOiBTT1VORF9MRVZFTCB9ICk7XHJcbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIGJvb2tQaWNrdXBTb3VuZENsaXAgKTtcclxuICAgIGNvbnN0IGJvb2tEcm9wU291bmRDbGlwID0gbmV3IFNvdW5kQ2xpcCggaGFycERyb3BfbXAzLCB7IGluaXRpYWxPdXRwdXRMZXZlbDogU09VTkRfTEVWRUwgfSApO1xyXG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCBib29rRHJvcFNvdW5kQ2xpcCApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gYWRkIGJvdHRvbSBib29rXHJcbiAgICB0aGlzLmJvdHRvbUJvb2tCYWNrZ3JvdW5kID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgUmVjdGFuZ2xlKFxyXG4gICAgICAgICAgMyxcclxuICAgICAgICAgIDIgKiBIRUlHSFQgLyAzIC0gMixcclxuICAgICAgICAgIFdJRFRIIC0gNixcclxuICAgICAgICAgIEhFSUdIVCAvIDMsXHJcbiAgICAgICAgICAwLFxyXG4gICAgICAgICAgUk9VTkQgLSAzLFxyXG4gICAgICAgICAgeyBmaWxsOiBGcmljdGlvbkNvbnN0YW50cy5CT1RUT01fQk9PS19DT0xPUiB9XHJcbiAgICAgICAgKVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBcImJ1bXBzXCIgdG8gdGhlIGJvb2tcclxuICAgIGFkZFJvd0NpcmNsZXMoXHJcbiAgICAgIEZyaWN0aW9uTW9kZWwuTUFHTklGSUVEX0FUT01TX0lORk8ucmFkaXVzLFxyXG4gICAgICBGcmljdGlvbk1vZGVsLk1BR05JRklFRF9BVE9NU19JTkZPLmRpc3RhbmNlWCxcclxuICAgICAgdGhpcy5ib3R0b21Cb29rQmFja2dyb3VuZCxcclxuICAgICAge1xyXG4gICAgICAgIGNvbG9yOiBGcmljdGlvbkNvbnN0YW50cy5CT1RUT01fQk9PS19DT0xPUixcclxuICAgICAgICB4OiAtRnJpY3Rpb25Nb2RlbC5NQUdOSUZJRURfQVRPTVNfSU5GTy5kaXN0YW5jZVggLyAyLFxyXG4gICAgICAgIHk6IDIgKiBIRUlHSFQgLyAzIC0gMixcclxuICAgICAgICB3aWR0aDogV0lEVEhcclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIHRoaXMuY29udGFpbmVyLmFkZENoaWxkKCB0aGlzLmJvdHRvbUJvb2tCYWNrZ3JvdW5kICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBhZGQgdG9wIGJvb2tcclxuICAgIHRoaXMudG9wQm9va0JhY2tncm91bmQgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIGF0b21EcmFnQXJlYS5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRnJpY3Rpb25EcmFnTGlzdGVuZXIoIG1vZGVsLCB0ZW1wZXJhdHVyZUluY3JlYXNpbmdBbGVydGVyLCB0ZW1wZXJhdHVyZURlY3JlYXNpbmdBbGVydGVyLFxyXG4gICAgICBib29rTW92ZW1lbnRBbGVydGVyLCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkcmFnTGlzdGVuZXInICksXHJcbiAgICAgICAgc3RhcnRTb3VuZDogYm9va1BpY2t1cFNvdW5kQ2xpcCxcclxuICAgICAgICBlbmRTb3VuZDogYm9va0Ryb3BTb3VuZENsaXAsXHJcbiAgICAgICAgdGFyZ2V0Tm9kZTogdGhpcy50b3BCb29rQmFja2dyb3VuZCxcclxuICAgICAgICBzdGFydERyYWc6ICgpID0+IGF0b21EcmFnQXJlYS52b2ljaW5nU3BlYWtGdWxsUmVzcG9uc2UoIHtcclxuICAgICAgICAgIG9iamVjdFJlc3BvbnNlOiBncmFiYmVkRGVzY3JpYmVyLmdldFZvaWNpbmdHcmFiYmVkT2JqZWN0UmVzcG9uc2UoKVxyXG4gICAgICAgIH0gKVxyXG4gICAgICB9ICkgKTtcclxuXHJcbiAgICB0aGlzLnRvcEJvb2tCYWNrZ3JvdW5kLmFkZENoaWxkKCBhdG9tRHJhZ0FyZWEgKTtcclxuXHJcbiAgICAvLyBhZGQgYXJyb3dzIGJlZm9yZSB0aGUgZHJhZyBhcmVhLCB0aGVuIHRoZSBncmFiIGN1ZSBoaWRlcyB0aGUgYXJyb3dzXHJcbiAgICB0aGlzLnRvcEJvb2tCYWNrZ3JvdW5kLmFkZENoaWxkKCBoaW50QXJyb3dzTm9kZSApO1xyXG5cclxuICAgIGFkZFJvd0NpcmNsZXMoXHJcbiAgICAgIEZyaWN0aW9uTW9kZWwuTUFHTklGSUVEX0FUT01TX0lORk8ucmFkaXVzLFxyXG4gICAgICBGcmljdGlvbk1vZGVsLk1BR05JRklFRF9BVE9NU19JTkZPLmRpc3RhbmNlWCxcclxuICAgICAgdGhpcy50b3BCb29rQmFja2dyb3VuZCxcclxuICAgICAge1xyXG4gICAgICAgIGNvbG9yOiBGcmljdGlvbkNvbnN0YW50cy5UT1BfQk9PS19DT0xPUixcclxuICAgICAgICB4OiAtV0lEVEgsXHJcbiAgICAgICAgeTogSEVJR0hUIC8gMyAtIEZyaWN0aW9uTW9kZWwuTUFHTklGSUVEX0FUT01TX0lORk8uZGlzdGFuY2UsXHJcbiAgICAgICAgd2lkdGg6IDMgKiBXSURUSFxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIGExMXkgLSBDdXN0b20gc2hhcGUgaGlnaGxpZ2h0cywgc2hhcGUgd2lsbCBjaGFuZ2Ugd2l0aCBhdG9tUm93c1RvU2hlYXJPZmZQcm9wZXJ0eS4gRm9jdXMgYW5kIEludGVyYWN0aXZlXHJcbiAgICAvLyBoaWdobGlnaHRzIGFyZSBpZGVudGljYWwsIGJ1dCB3ZSBuZWVkIHR3byBkaWZmZXJlbnQgTm9kZXMgYmVjYXVzZSBHcmFiRHJhZ0ludGVyYWN0aW9uIGFkZHMgY2hpbGRyZW4gdG8gdGhlXHJcbiAgICAvLyBmb2N1cyBoaWdobGlnaHQgdGhhdCBhcmUgc3BlY2lmaWMgdG8gdGhlIGtleWJvYXJkIGludGVyYWN0aW9uLlxyXG4gICAgY29uc3QgZm9jdXNIaWdobGlnaHRQYXRoID0gbmV3IEZvY3VzSGlnaGxpZ2h0UGF0aCggZ2V0Rm9jdXNIaWdobGlnaHRTaGFwZSggYXRvbURyYWdBcmVhICkgKTtcclxuICAgIGNvbnN0IGludGVyYWN0aXZlSGlnaGxpZ2h0UGF0aCA9IG5ldyBGb2N1c0hpZ2hsaWdodFBhdGgoIGdldEZvY3VzSGlnaGxpZ2h0U2hhcGUoIGF0b21EcmFnQXJlYSApICk7XHJcbiAgICBmb2N1c0hpZ2hsaWdodFBhdGgucGlja2FibGUgPSBmYWxzZTtcclxuICAgIGludGVyYWN0aXZlSGlnaGxpZ2h0UGF0aC5waWNrYWJsZSA9IGZhbHNlO1xyXG5cclxuICAgIC8vIHBkb20gLSB0aGUgR3JhYkRyYWdJbnRlcmFjdGlvbiBpcyBwb3NpdGlvbmVkIGJhc2VkIG9uIHRoZSB3aG9sZSBkcmFnIGFyZWEsIGJ1dCB0aGUgY2VudGVyIG9mIHRoYXQgaXMgYmVoaW5kXHJcbiAgICAvLyB0aGUgYmFja2dyb3VuZCB3aGl0ZSwgc28gc2V0IGEgc291cmNlIE5vZGUgdG8gc3VwcG9ydCBtb2JpbGUgYTExeSB0aGF0IGhhcyBhIGNlbnRlciB0aGF0IHdpbGwgcmVzcG9uZCB0byBhIHBvaW50ZXJcclxuICAgIC8vIGRvd25cclxuICAgIGF0b21EcmFnQXJlYS5zZXRQRE9NVHJhbnNmb3JtU291cmNlTm9kZSggaW50ZXJhY3RpdmVIaWdobGlnaHRQYXRoICk7XHJcblxyXG4gICAgLy8gYTExeSAtIGFkZCB0aGUgZm9jdXMgaGlnaGxpZ2h0IG9uIHRvcCBvZiB0aGUgcm93IGNpcmNsZXMgbXVzdCBiZSBhZGRlZCBwcmlvciB0byBhZGRpbmcgdGhlIGdyYWIvZHJhZyBpbnRlcmFjdGlvblxyXG4gICAgLy8gdGhpcyBpcyBhIGNvbnN0cmFpbnQgb2YgdGhlIGdyYWIvZHJhZyBpbnRlcmFjdGlvbiwgbXVzdCBiZSBzZXQgYmVmb3JlIGl0J3MgY3JlYXRpb24sIGJ1dCBvbmx5IGZvclxyXG4gICAgLy8gZm9jdXNIaWdobGlnaHRMYXllcmFibGVcclxuICAgIHRoaXMudG9wQm9va0JhY2tncm91bmQuYWRkQ2hpbGQoIGZvY3VzSGlnaGxpZ2h0UGF0aCApO1xyXG4gICAgdGhpcy50b3BCb29rQmFja2dyb3VuZC5hZGRDaGlsZCggaW50ZXJhY3RpdmVIaWdobGlnaHRQYXRoICk7XHJcbiAgICBhdG9tRHJhZ0FyZWEuZm9jdXNIaWdobGlnaHQgPSBmb2N1c0hpZ2hsaWdodFBhdGg7XHJcbiAgICBhdG9tRHJhZ0FyZWEuaW50ZXJhY3RpdmVIaWdobGlnaHQgPSBpbnRlcmFjdGl2ZUhpZ2hsaWdodFBhdGg7XHJcblxyXG4gICAgLy8gY3VpbmcgYXJyb3dzIGZvciB0aGUgYm9va1xyXG4gICAgY29uc3QgYm9va0N1ZUFycm93TGVmdCA9IG5ldyBDdWVBcnJvdygge1xyXG4gICAgICByb3RhdGlvbjogTWF0aC5QSVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgYm9va0N1ZUFycm93UmlnaHQgPSBuZXcgQ3VlQXJyb3coKTtcclxuXHJcbiAgICBjb25zdCBob3Jpem9udGFsQ3VlQXJyb3dzID0gbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgYm9va0N1ZUFycm93TGVmdCwgYm9va0N1ZUFycm93UmlnaHQgXSxcclxuICAgICAgc3BhY2luZzogMzAsIC8vIHRvIGJlIHNjYWxlZCBkb3duIGJlbG93XHJcbiAgICAgIGNlbnRlclg6IFdJRFRIIC8gMixcclxuICAgICAgdG9wOiBBUlJPV19UT1BcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBib29rQ3VlQXJyb3dWZXJ0aWNhbCA9IG5ldyBDdWVBcnJvdygge1xyXG4gICAgICB0b3A6IGhvcml6b250YWxDdWVBcnJvd3MuY2VudGVyWSxcclxuICAgICAgYXJyb3dMZW5ndGg6IDU1LFxyXG4gICAgICByb3RhdGlvbjogTWF0aC5QSSAvIDIsXHJcbiAgICAgIGNlbnRlclg6IFdJRFRIIC8gMlxyXG5cclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGN1ZUFycm93cyA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIGhvcml6b250YWxDdWVBcnJvd3MsIGJvb2tDdWVBcnJvd1ZlcnRpY2FsIF0sXHJcbiAgICAgIHNjYWxlOiAwLjYsXHJcbiAgICAgIGNlbnRlclg6IFdJRFRIIC8gMixcclxuICAgICAgdG9wOiBBUlJPV19UT1BcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBwZG9tIC0gYWRkIHRoZSBrZXlib2FyZCBkcmFnIGxpc3RlbmVyIHRvIHRoZSB0b3AgYXRvbXNcclxuICAgIHRoaXMua2V5Ym9hcmREcmFnTGlzdGVuZXIgPSBuZXcgRnJpY3Rpb25LZXlib2FyZERyYWdMaXN0ZW5lciggbW9kZWwsIHRlbXBlcmF0dXJlSW5jcmVhc2luZ0FsZXJ0ZXIsXHJcbiAgICAgIHRlbXBlcmF0dXJlRGVjcmVhc2luZ0FsZXJ0ZXIsIGJvb2tNb3ZlbWVudEFsZXJ0ZXIsIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2tleWJvYXJkRHJhZ0xpc3RlbmVyJyApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBwZG9tXHJcbiAgICBjb25zdCBncmFiRHJhZ0ludGVyYWN0aW9uID0gbmV3IEZyaWN0aW9uR3JhYkRyYWdJbnRlcmFjdGlvbiggbW9kZWwsIHRoaXMua2V5Ym9hcmREcmFnTGlzdGVuZXIsIGF0b21EcmFnQXJlYSwgZ3JhYmJlZERlc2NyaWJlciwgYWxlcnRTZXR0bGVkQW5kQ29vbCwge1xyXG4gICAgICBvYmplY3RUb0dyYWJTdHJpbmc6IHpvb21lZEluQ2hlbWlzdHJ5Qm9va1N0cmluZyxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdncmFiRHJhZ0ludGVyYWN0aW9uJyApLFxyXG4gICAgICBncmFiQ3VlT3B0aW9uczoge1xyXG4gICAgICAgIGNlbnRlcjogYXRvbURyYWdBcmVhLmNlbnRlci5wbHVzWFkoIDAsIDEwMiApIC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuICAgICAgfSxcclxuICAgICAgZ3JhYmJhYmxlT3B0aW9uczoge1xyXG4gICAgICAgIGZvY3VzSGlnaGxpZ2h0OiBmb2N1c0hpZ2hsaWdodFBhdGhcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIFRoZSBoZWxwIHRleHQgaXMgcHJvdmlkZWQgYnkgdGhlIEJvb2tOb2RlJ3MgaW50ZXJhY3Rpb25cclxuICAgICAga2V5Ym9hcmRIZWxwVGV4dDogbnVsbCxcclxuICAgICAgZ2VzdHVyZUhlbHBUZXh0OiBudWxsLFxyXG5cclxuICAgICAgLy8gaGFuZGxlciBmb3Igd2hlbiB0aGUgdXNlciBncmFicyB0aGUgYm9va1xyXG4gICAgICBvbkdyYWI6ICgpID0+IHtcclxuICAgICAgICBtb2RlbC5oaW50UHJvcGVydHkuc2V0KCBmYWxzZSApOyAvLyBoaWRlIHRoZSB2aXN1YWwgY3VlIGFycm93c1xyXG4gICAgICAgIGJvb2tQaWNrdXBTb3VuZENsaXAucGxheSgpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gaGFuZGxlciBmb3Igd2hlbiB0aGUgdXNlciByZWxlYXNlcyB0aGUgYm9va1xyXG4gICAgICBvblJlbGVhc2U6ICgpID0+IHtcclxuICAgICAgICBib29rRHJvcFNvdW5kQ2xpcC5wbGF5KCk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBkcmFnQ3VlTm9kZTogY3VlQXJyb3dzXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5jb250YWluZXIuYWRkQ2hpbGQoIHRoaXMudG9wQm9va0JhY2tncm91bmQgKTtcclxuXHJcbiAgICBhdG9tRHJhZ0FyZWEuaW5wdXRFbmFibGVkUHJvcGVydHkubGluayggaW5wdXRFbmFibGVkID0+IHtcclxuICAgICAgbW9kZWwuaGludFByb3BlcnR5LnZhbHVlID0gaW5wdXRFbmFibGVkO1xyXG4gICAgICBncmFiRHJhZ0ludGVyYWN0aW9uLmVuYWJsZWQgPSBpbnB1dEVuYWJsZWQ7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSByZWQgYm9yZGVyIGFyb3VuZCB0aGUgbWFnbmlmaWVkIGFyZWEsIGFuZCBhZGQgYSB3aGl0ZSBzaGFwZSBiZWxvdyBpdCB0byBibG9jayBvdXQgdGhlIGNsaXBwZWQgYXJlYS5cclxuICAgIGNvbnN0IHRvcFBhZGRpbmcgPSA1MDA7XHJcbiAgICBjb25zdCBzaWRlUGFkZGluZyA9IDgwMDtcclxuICAgIGNvbnN0IGJvdHRvbVBhZGRpbmcgPSAxMDsgLy8gZG9uJ3QgZ28gdG9vIGZhciBiZWxvdyB0aGUgbWFnbmlmaWVyXHJcbiAgICBjb25zdCByaWdodFggPSBXSURUSCArIHNpZGVQYWRkaW5nO1xyXG4gICAgY29uc3QgbGVmdFggPSAtc2lkZVBhZGRpbmc7XHJcbiAgICBjb25zdCB0b3BZID0gLXRvcFBhZGRpbmc7XHJcbiAgICBjb25zdCBib3R0b21ZID0gSEVJR0hUICsgYm90dG9tUGFkZGluZztcclxuICAgIGNvbnN0IGlubmVyTG93WCA9IFJPVU5EO1xyXG4gICAgY29uc3QgaW5uZXJIaWdoWCA9IFdJRFRIIC0gUk9VTkQ7XHJcbiAgICBjb25zdCBpbm5lckxvd1kgPSBST1VORDtcclxuICAgIGNvbnN0IGlubmVySGlnaFkgPSBIRUlHSFQgLSBST1VORDtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBQYXRoKCBuZXcgU2hhcGUoKS5tb3ZlVG8oIHJpZ2h0WCwgdG9wWSApXHJcbiAgICAgIC5saW5lVG8oIGxlZnRYLCB0b3BZIClcclxuICAgICAgLmxpbmVUbyggbGVmdFgsIGJvdHRvbVkgKVxyXG4gICAgICAubGluZVRvKCByaWdodFgsIGJvdHRvbVkgKVxyXG4gICAgICAubGluZVRvKCByaWdodFgsIHRvcFkgKVxyXG4gICAgICAubGluZVRvKCBpbm5lckhpZ2hYLCBpbm5lckxvd1kgLSBST1VORCApXHJcbiAgICAgIC5hcmMoIGlubmVySGlnaFgsIGlubmVyTG93WSwgUk9VTkQsIC1NYXRoLlBJIC8gMiwgMCwgZmFsc2UgKVxyXG4gICAgICAuYXJjKCBpbm5lckhpZ2hYLCBpbm5lckhpZ2hZLCBST1VORCwgMCwgTWF0aC5QSSAvIDIsIGZhbHNlIClcclxuICAgICAgLmFyYyggaW5uZXJMb3dYLCBpbm5lckhpZ2hZLCBST1VORCwgTWF0aC5QSSAvIDIsIE1hdGguUEksIGZhbHNlIClcclxuICAgICAgLmFyYyggaW5uZXJMb3dYLCBpbm5lckxvd1ksIFJPVU5ELCBNYXRoLlBJLCBNYXRoLlBJICogMyAvIDIsIGZhbHNlIClcclxuICAgICAgLmxpbmVUbyggaW5uZXJIaWdoWCwgaW5uZXJMb3dZIC0gUk9VTkQgKVxyXG4gICAgICAuY2xvc2UoKSwge1xyXG4gICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICBwaWNrYWJsZTogdHJ1ZSAvLyBhYnNvcmIgdGhlIGlucHV0IGluc3RlYWQgb2YgZ3JhYmJpbmcgdGhlIGJvb2sgdGhyb3VnaCB0aGUgYmFja2dyb3VuZFxyXG4gICAgfSApICk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBjb250YWluaW5nIGJvcmRlciByZWN0YW5nbGVcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBSZWN0YW5nbGUoIDAsIDAsIFdJRFRILCBIRUlHSFQsIFJPVU5ELCBST1VORCwge1xyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGxpbmVXaWR0aDogNSxcclxuICAgICAgcGlja2FibGU6IGZhbHNlXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBhZGQgbWFnbmlmaWVyJ3MgdGFyZ2V0XHJcbiAgICBjb25zdCBtYWduaWZpZXJUYXJnZXROb2RlID0gbmV3IE1hZ25pZmllclRhcmdldE5vZGUoXHJcbiAgICAgIHRhcmdldFgsXHJcbiAgICAgIHRhcmdldFksXHJcbiAgICAgIFdJRFRIICogU0NBTEUsXHJcbiAgICAgIEhFSUdIVCAqIFNDQUxFLFxyXG4gICAgICBST1VORCAqIFNDQUxFLFxyXG4gICAgICBuZXcgVmVjdG9yMiggUk9VTkQsIEhFSUdIVCApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggV0lEVEggLSBST1VORCwgSEVJR0hUIClcclxuICAgICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBtYWduaWZpZXJUYXJnZXROb2RlICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBBZGQgdGhlIGNhbnZhcyB3aGVyZSB0aGUgYXRvbXMgd2lsbCBiZSByZW5kZXJlZC4gRm9yIGJldHRlciBwZXJmb3JtYW5jZSwgcGFydGljdWxhcmx5IG9uIGlQYWQsIHdlIGFyZVxyXG4gICAgLy8gdXNpbmcgQ2FudmFzTm9kZSB0byByZW5kZXIgdGhlIGF0b21zIGluc3RlYWQgb2YgaW5kaXZpZHVhbCBub2Rlcy5cclxuICAgIHRoaXMuYXRvbUNhbnZhc05vZGUgPSBuZXcgQXRvbUNhbnZhc05vZGUoIG1vZGVsLmF0b21zLCB7XHJcbiAgICAgIGNhbnZhc0JvdW5kczogbmV3IEJvdW5kczIoIDAsIDAsIFdJRFRILCBIRUlHSFQgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5jb250YWluZXIuYWRkQ2hpbGQoIHRoaXMuYXRvbUNhbnZhc05vZGUgKTtcclxuXHJcbiAgICBtb2RlbC50b3BCb29rUG9zaXRpb25Qcm9wZXJ0eS5saW5rQXR0cmlidXRlKCB0aGlzLnRvcEJvb2tCYWNrZ3JvdW5kLCAndHJhbnNsYXRpb24nICk7XHJcbiAgICBtb2RlbC50b3BCb29rUG9zaXRpb25Qcm9wZXJ0eS5saW5rQXR0cmlidXRlKCB0aGlzLnRvcEF0b21zTGF5ZXIsICd0cmFuc2xhdGlvbicgKTtcclxuXHJcbiAgICBtb2RlbC5hdG9tUm93c1RvU2hlYXJPZmZQcm9wZXJ0eS5saW5rKCBudW1iZXIgPT4ge1xyXG5cclxuICAgICAgLy8gQWRqdXN0IHRoZSBkcmFnIGFyZWEgYXMgdGhlIG51bWJlciBvZiByb3dzIG9mIGF0b21zIHNoZWFycyBvZmYuXHJcbiAgICAgIGF0b21EcmFnQXJlYS5zZXRSZWN0SGVpZ2h0KCAoIG51bWJlciArIDIgKSAqIEZyaWN0aW9uTW9kZWwuTUFHTklGSUVEX0FUT01TX0lORk8uZGlzdGFuY2VZICk7XHJcblxyXG4gICAgICAvLyBVcGRhdGUgdGhlIHNpemUgb2YgdGhlIGhpZ2hsaWdodHMgYWNjb3JkaW5nbHlcclxuICAgICAgY29uc3QgaGlnaGxpZ2h0U2hhcGUgPSBnZXRGb2N1c0hpZ2hsaWdodFNoYXBlKCBhdG9tRHJhZ0FyZWEgKTtcclxuICAgICAgZm9jdXNIaWdobGlnaHRQYXRoLnNldFNoYXBlKCBoaWdobGlnaHRTaGFwZSApO1xyXG4gICAgICBpbnRlcmFjdGl2ZUhpZ2hsaWdodFBhdGguc2V0U2hhcGUoIGhpZ2hsaWdodFNoYXBlICk7XHJcblxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLnJlc2V0TWFnbmlmaWVyTm9kZSA9ICgpID0+IHtcclxuICAgICAgZ3JhYkRyYWdJbnRlcmFjdGlvbi5yZXNldCgpO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1vdmUgZm9yd2FyZCBpbiB0aW1lXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoKSB7XHJcbiAgICB0aGlzLmF0b21DYW52YXNOb2RlLmludmFsaWRhdGVQYWludCgpOyAvLyB0ZWxsIHRoZSBhdG9tIGNhbnZhcyB0byByZWRyYXcgaXRzZWxmIG9uIGV2ZXJ5IHN0ZXBcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMucmVzZXRNYWduaWZpZXJOb2RlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5mcmljdGlvbi5yZWdpc3RlciggJ01hZ25pZmllck5vZGUnLCBNYWduaWZpZXJOb2RlICk7XHJcblxyXG4vLyBoZWxwZXIgZnVuY3Rpb24gdGhhdCBhZGRzIGEgcm93IG9mIGNpcmNsZXMgYXQgdGhlIHNwZWNpZmllZCBwb3NpdGlvbiwgdXNlZCB0byBhZGQgYnVtcHMgdG8gdGhlIG1hZ25pZmllZCBib29rc1xyXG5mdW5jdGlvbiBhZGRSb3dDaXJjbGVzKCBjaXJjbGVSYWRpdXMsIHhTcGFjaW5nLCBwYXJlbnROb2RlLCBvcHRpb25zICkge1xyXG4gIGNvbnN0IG51bWJlck9mQXRvbXNGb3JSb3cgPSBvcHRpb25zLndpZHRoIC8geFNwYWNpbmc7XHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZBdG9tc0ZvclJvdzsgaSsrICkge1xyXG4gICAgcGFyZW50Tm9kZS5hZGRDaGlsZCggbmV3IENpcmNsZSggY2lyY2xlUmFkaXVzLCB7XHJcbiAgICAgIGZpbGw6IG9wdGlvbnMuY29sb3IsXHJcbiAgICAgIHk6IG9wdGlvbnMueSxcclxuICAgICAgeDogb3B0aW9ucy54ICsgeFNwYWNpbmcgKiBpLFxyXG4gICAgICBwaWNrYWJsZTogZmFsc2UgLy8gaW5wdXQgc2hvdWxkIHBhc3MgdGhyb3VnaCB0byBhIGJhY2tncm91bmQgTm9kZSB3aGljaCBtYXkgc3VwcG9ydCBpbnB1dCBkZXBlbmRpbmcgb24gdGhlIGF0b20gY2lyY2xlLlxyXG4gICAgfSApICk7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBWb2ljaW5nUmVjdGFuZ2xlIGV4dGVuZHMgVm9pY2luZyggUmVjdGFuZ2xlICkge1xyXG4gIGNvbnN0cnVjdG9yKCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBvcHRpb25zICkge1xyXG4gICAgc3VwZXIoIHgsIHksIHdpZHRoLCBoZWlnaHQsIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKlxyXG4gKiBAcGFyYW0ge05vZGV9IGRyYWdBcmVhXHJcbiAqIEByZXR1cm5zIHtTaGFwZX1cclxuICovXHJcbmZ1bmN0aW9uIGdldEZvY3VzSGlnaGxpZ2h0U2hhcGUoIGRyYWdBcmVhICkge1xyXG5cclxuICAvLyBVc2Ugc2VsZkJvdW5kcyBiZWNhdXNlIHRoZSBkcmFnQXJlYSBoYXMgY2hpbGRyZW4gdGhhdCBhcmUgbGFyZ2VyIHRoYW4gdGhlIGZvY3VzSGlnaGxpZ2h0IHdlIHdhbnQuXHJcbiAgcmV0dXJuIFNoYXBlLmJvdW5kcyggZHJhZ0FyZWEuc2VsZkJvdW5kcy53aXRoT2Zmc2V0cyggMCwgNDAsIDAsIDAgKSApO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNYWduaWZpZXJOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sa0NBQWtDO0FBQ3RELE9BQU9DLGVBQWUsTUFBTSwyQ0FBMkM7QUFDdkUsT0FBT0MsT0FBTyxNQUFNLGtDQUFrQztBQUN0RCxTQUFTQyxLQUFLLFFBQVEsbUNBQW1DO0FBQ3pELE9BQU9DLEtBQUssTUFBTSxzQ0FBc0M7QUFDeEQsU0FBU0MsTUFBTSxFQUFFQyxrQkFBa0IsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxPQUFPLFFBQVEsc0NBQXNDO0FBQ3ZILE9BQU9DLFNBQVMsTUFBTSx1REFBdUQ7QUFDN0UsT0FBT0MsWUFBWSxNQUFNLHlDQUF5QztBQUNsRSxPQUFP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