// Copyright 2013-2023, University of Colorado Boulder

/**
 * Scenery display object (scene graph node) for the Balloon of the model.
 *
 * Accessible content for BalloonNode acts as a container for the button and application div, which are provided by
 * children of this node.  Beware that changing the scene graph under this node will change the structure of the
 * accessible content.
 *
 * @author Vasily Shakhov (Mlearner)
 * @author John Blanco
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import GrabDragInteraction from '../../../../scenery-phet/js/accessibility/GrabDragInteraction.js';
import { DragListener, FocusHighlightFromNode, Image, InteractiveHighlighting, KeyboardDragListener, KeyboardUtils, Line, Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import boundaryReachedSoundPlayer from '../../../../tambo/js/shared-sound-players/boundaryReachedSoundPlayer.js';
import PitchedPopGenerator from '../../../../tambo/js/sound-generators/PitchedPopGenerator.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import balloonGrab006_mp3 from '../../../sounds/balloonGrab006_mp3.js';
import balloonHitSweater_mp3 from '../../../sounds/balloonHitSweater_mp3.js';
import balloonRelease006_mp3 from '../../../sounds/balloonRelease006_mp3.js';
import wallContact_mp3 from '../../../sounds/wallContact_mp3.js';
import balloonsAndStaticElectricity from '../../balloonsAndStaticElectricity.js';
import BASEA11yStrings from '../BASEA11yStrings.js';
import BASEConstants from '../BASEConstants.js';
import BASEQueryParameters from '../BASEQueryParameters.js';
import BalloonDirectionEnum from '../model/BalloonDirectionEnum.js';
import PlayAreaMap from '../model/PlayAreaMap.js';
import BalloonInteractionCueNode from './BalloonInteractionCueNode.js';
import BalloonRubbingSoundGenerator from './BalloonRubbingSoundGenerator.js';
import BalloonVelocitySoundGenerator from './BalloonVelocitySoundGenerator.js';
import BalloonDescriber from './describers/BalloonDescriber.js';
import MinusChargeNode from './MinusChargeNode.js';
import PlusChargeNode from './PlusChargeNode.js';

// pdom - critical x positions for the balloon
const X_POSITIONS = PlayAreaMap.X_POSITIONS;

// constants
const grabBalloonKeyboardHelpString = BASEA11yStrings.grabBalloonKeyboardHelp.value;
const GRAB_RELEASE_SOUND_LEVEL = 0.1; // empirically determined

class BalloonNode extends Node {
  /**
   * @mixes InteractiveHighlighting
   * @param {BalloonModel} model
   * @param {Image} imageSource - image source from the image plugin
   * @param {BASEModel} globalModel
   * @param {string} accessibleLabelString - the accessible label for this balloon
   * @param {string} otherAccessibleLabelString - the accessible label for the "other" balloon
   * @param {Bounds2} layoutBounds - layout bounds of the ScreenView containing this node
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(model, imageSource, globalModel, accessibleLabelString, otherAccessibleLabelString, layoutBounds, tandem, options) {
    options = merge({
      cursor: 'pointer',
      // {Object} - options passed to the drift velocity sound generator
      balloonVelocitySoundGeneratorOptions: {
        enableControlProperties: [model.isVisibleProperty]
      },
      // {Object} - options passed to the balloon rubbing sound generator
      balloonRubbingSoundGeneratorOptions: {},
      // {function} - additional method to call at end of pointer drag
      pointerDrag: _.noop,
      // {function} - additional method to call at end of keyboard drag
      keyboardDrag: _.noop,
      // pdom - this node will act as a container for more accessible content, its children will implement
      // most of the keyboard navigation
      containerTagName: 'div',
      tagName: 'div',
      labelTagName: 'h3',
      labelContent: accessibleLabelString
    }, options);
    assert && assert(!options.tandem, 'required param');
    options.tandem = tandem;

    // super constructor
    super(options);

    // @private
    this.model = model;
    this.globalModel = globalModel;

    // pdom - a type that generates descriptions for the balloon
    this.describer = new BalloonDescriber(globalModel, globalModel.wall, model, accessibleLabelString, otherAccessibleLabelString, this);

    // @private - the utterance to be sent to the utteranceQueue when a jumping action occurs
    this.jumpingUtterance = new Utterance();
    const originalChargesNode = new Node({
      pickable: false,
      tandem: tandem.createTandem('originalChargesNode')
    });
    const addedChargesNode = new Node({
      pickable: false,
      tandem: tandem.createTandem('addedChargesNode')
    });

    // Finish a drag interaction by updating the Property tracking that the balloon is dragged and resetting velocities.
    const endDragListener = () => {
      model.isDraggedProperty.set(false);
      model.velocityProperty.set(new Vector2(0, 0));
      model.dragVelocityProperty.set(new Vector2(0, 0));
      releaseBalloonSoundPlayer.play();
    };

    // Set up the bounds Property that will keep track of where the balloon can be dragged.
    const boundsWithoutWall = new Bounds2(0, 0, globalModel.width - model.width, globalModel.height - model.height);
    const boundsWithWall = new Bounds2(0, 0, globalModel.width - globalModel.wallWidth - model.width, globalModel.height - model.height);
    const balloonDragBoundsProperty = new Property(boundsWithWall);
    globalModel.wall.isVisibleProperty.link(isWallVisible => {
      balloonDragBoundsProperty.set(isWallVisible ? boundsWithWall : boundsWithoutWall);
    });

    // Create the sound generators for grab and release of the balloons.
    const grabBalloonSoundPlayer = new SoundClip(balloonGrab006_mp3, {
      initialOutputLevel: GRAB_RELEASE_SOUND_LEVEL
    });
    soundManager.addSoundGenerator(grabBalloonSoundPlayer);
    const releaseBalloonSoundPlayer = new SoundClip(balloonRelease006_mp3, {
      initialOutputLevel: GRAB_RELEASE_SOUND_LEVEL
    });
    soundManager.addSoundGenerator(releaseBalloonSoundPlayer);

    // drag handling
    const dragHandler = new DragListener({
      positionProperty: model.positionProperty,
      dragBoundsProperty: balloonDragBoundsProperty,
      allowTouchSnag: true,
      start: () => {
        model.draggingWithPointer = true;
        model.isDraggedProperty.set(true);
        grabBalloonSoundPlayer.play();
      },
      drag: options.pointerDrag,
      end: () => {
        endDragListener();
        model.draggingWithPointer = false;
      },
      tandem: tandem.createTandem('dragListener')
    });
    this.addInputListener(dragHandler);
    const balloonImageNode = new Image(imageSource, {
      tandem: tandem.createTandem('balloonImageNode'),
      // the balloonImageNode is not pickable so that mouse and touch areas which are smaller than the bounds
      // of the image can be used by setting them on the parent of the image
      pickable: false
    });

    // now add the balloon, so that the tether is behind it in the z order
    this.addChild(balloonImageNode);

    // Create a custom touch/mouse area that matches the shape of the balloons reasonably well.  This was created to
    // match the artwork as it is at the time of this writing, and if the artwork changes, this may need to change too.
    const mainBodyEllipse = Shape.ellipse(balloonImageNode.centerX, balloonImageNode.centerY * 0.91, balloonImageNode.width * 0.51, balloonImageNode.height * 0.465, 0);
    const nubRect = Shape.rectangle(balloonImageNode.centerX - balloonImageNode.width * 0.05, balloonImageNode.height * 0.9, balloonImageNode.width * 0.1, balloonImageNode.height * 0.1);
    const pointerAreaShape = Shape.union([mainBodyEllipse, nubRect]);
    this.mouseArea = pointerAreaShape;
    this.touchArea = pointerAreaShape;

    // static charges
    for (let i = 0; i < model.plusCharges.length; i++) {
      originalChargesNode.addChild(new PlusChargeNode(model.plusCharges[i].position));
      originalChargesNode.addChild(new MinusChargeNode(model.minusCharges[i].position));
    }

    // possible charges
    const addedNodes = []; // track in a local array to update visibility with charge
    for (let i = model.plusCharges.length; i < model.minusCharges.length; i++) {
      const addedMinusChargeNode = new MinusChargeNode(model.minusCharges[i].position);
      addedMinusChargeNode.visible = false;
      addedChargesNode.addChild(addedMinusChargeNode);
      addedNodes.push(addedMinusChargeNode);
    }
    this.addChild(originalChargesNode);
    this.addChild(addedChargesNode);

    // if change charge, show more minus charges
    model.chargeProperty.link(chargeVal => {
      const numVisibleMinusCharges = Math.abs(chargeVal);
      for (let i = 0; i < addedNodes.length; i++) {
        addedNodes[i].visible = i < numVisibleMinusCharges;
      }
    });

    // link the position of this node to the model
    model.positionProperty.link(position => {
      this.translation = position;
    });

    // show charges based on showCharges property
    globalModel.showChargesProperty.link(value => {
      if (value === 'diff') {
        originalChargesNode.visible = false;
        addedChargesNode.visible = true;
      } else {
        const visibility = value === 'all';
        originalChargesNode.visible = visibility;
        addedChargesNode.visible = visibility;
      }
    });

    // {Property.<boolean> - a value that reflects whether charges are being shown on the balloon
    const chargesShownOnBalloonProperty = new DerivedProperty([globalModel.showChargesProperty], showCharges => showCharges !== 'none');

    // sound generation for charges moving on to this balloon
    const popSoundGenerator = new PitchedPopGenerator({
      enableControlProperties: [chargesShownOnBalloonProperty],
      initialOutputLevel: 0.3
    });
    soundManager.addSoundGenerator(popSoundGenerator);
    model.chargeProperty.lazyLink(charge => {
      const chargeAbsoluteValue = Math.abs(charge);
      if (chargeAbsoluteValue > 0) {
        popSoundGenerator.playPop(chargeAbsoluteValue / BASEConstants.MAX_BALLOON_CHARGE);
      }
    });

    // sound generation for drift velocity
    soundManager.addSoundGenerator(new BalloonVelocitySoundGenerator(model.velocityProperty, model.touchingWallProperty, options.balloonVelocitySoundGeneratorOptions));

    // @private {BalloonRubbingSoundGenerator} - Sound generation for when the balloon is being rubbed on the sweater or
    // against the wall.
    this.balloonRubbingSoundGenerator = new BalloonRubbingSoundGenerator(model.dragVelocityProperty, model.onSweaterProperty, model.touchingWallProperty, options.balloonRubbingSoundGeneratorOptions);
    soundManager.addSoundGenerator(this.balloonRubbingSoundGenerator);

    // sound generation for when the balloon contacts the sweater
    const balloonHitsSweaterSoundClip = new SoundClip(balloonHitSweater_mp3, {
      initialOutputLevel: 0.075
    });
    soundManager.addSoundGenerator(balloonHitsSweaterSoundClip);
    model.velocityProperty.lazyLink((currentVelocity, previousVelocity) => {
      const currentSpeed = currentVelocity.magnitude;
      const previousSpeed = previousVelocity.magnitude;
      if (currentSpeed === 0 && previousSpeed > 0 && model.onSweaterProperty.value) {
        balloonHitsSweaterSoundClip.play();
      }
    });

    // Add the sound generation for when the balloon hits the wall or the drag bounds.
    const balloonHitsWallSoundClip = new SoundClip(wallContact_mp3, {
      initialOutputLevel: 0.15
    });
    soundManager.addSoundGenerator(balloonHitsWallSoundClip);
    model.positionProperty.lazyLink((position, previousPosition) => {
      // Test whether the balloon has come into contact with an edge and play a sound if so.
      const dragBounds = balloonDragBoundsProperty.value;
      if (position.x >= dragBounds.maxX && previousPosition.x < dragBounds.maxX) {
        // A different sound is played based on whether the balloon has hit the wall or the drag bounds.
        if (globalModel.wall.isVisibleProperty.value) {
          balloonHitsWallSoundClip.play();
        } else {
          boundaryReachedSoundPlayer.play();
        }
      } else if (position.x <= dragBounds.minX && previousPosition.x > dragBounds.minX) {
        boundaryReachedSoundPlayer.play();
      }
      if (position.y >= dragBounds.maxY && previousPosition.y < dragBounds.maxY) {
        boundaryReachedSoundPlayer.play();
      } else if (position.y <= dragBounds.minY && previousPosition.y > dragBounds.minY) {
        boundaryReachedSoundPlayer.play();
      }
    });

    // pdom
    balloonImageNode.focusHighlight = new FocusHighlightFromNode(balloonImageNode);

    // pdom - when the balloon charge, position, or model.showChargesProperty changes, the balloon needs a new
    // description for assistive technology
    const updateAccessibleDescription = () => {
      this.descriptionContent = this.describer.getBalloonDescription();
    };
    model.positionProperty.link(updateAccessibleDescription);
    model.chargeProperty.link(updateAccessibleDescription);
    model.isDraggedProperty.link(updateAccessibleDescription);
    globalModel.showChargesProperty.link(updateAccessibleDescription);
    const dragBoundsProperty = new Property(this.getDragBounds());

    // @private - the drag handler needs to be updated in a step function, see KeyboardDragHandler for more information
    let successfulKeyboardDrag = false; // used to hide the "drag" cue once a successful keyboard drag happens
    const boundaryUtterance = new Utterance();
    this.keyboardDragHandler = new KeyboardDragListener({
      dragVelocity: 300,
      // in view coordinates per second
      shiftDragVelocity: 100,
      // in view coordinates per second
      dragBoundsProperty: dragBoundsProperty,
      positionProperty: model.positionProperty,
      shiftKeyMultiplier: 0.25,
      start: event => {
        const key = KeyboardUtils.getEventCode(event.domEvent);
        successfulKeyboardDrag = true;

        // if already touching a boundary when dragging starts, announce an indication of this
        if (this.attemptToMoveBeyondBoundary(key)) {
          const attemptedDirection = this.getAttemptedMovementDirection(key);
          boundaryUtterance.alert = this.describer.movementDescriber.getTouchingBoundaryDescription(attemptedDirection);
          this.alertDescriptionUtterance(boundaryUtterance);
        }
      },
      drag: options.keyboardDrag,
      tandem: tandem.createTandem('keyboardDragListener')
    });

    // made visible when the balloon is picked up with a keyboard for the first time to show how a user can drag with
    // a keyboard
    const interactionCueNode = new BalloonInteractionCueNode(globalModel, model, this, layoutBounds);
    interactionCueNode.center = balloonImageNode.center;

    // Attach the GrabDragInteraction to a child of this Node so that the accessible
    // content for the interaction is underneath this node. Cannot attach to the balloonImageNode
    // because it is important that that Node be pickable: false for the touch areas. The Node takes
    // the shape of the touchArea so that bounds do not interfere or extend beyond the elliptical touch
    // area shape.
    const grabDragTargetNode = new InteractiveHighlightInteractionNode(this.touchArea);
    this.addChild(grabDragTargetNode);
    const grabDragInteraction = new GrabDragInteraction(grabDragTargetNode, this.keyboardDragHandler, {
      objectToGrabString: accessibleLabelString,
      dragCueNode: interactionCueNode,
      // BASE needs to control the ordering of all alerts after a release happens, so prevent
      // the default release alert
      // alertOnRelease: false,

      grabCueOptions: {
        centerTop: balloonImageNode.centerBottom.plusXY(0, 10)
      },
      keyboardHelpText: grabBalloonKeyboardHelpString,
      onGrab: () => {
        model.isDraggedProperty.set(true);
        grabBalloonSoundPlayer.play();
      },
      onRelease: () => {
        endDragListener();

        // reset the key state of the drag handler by interrupting the drag
        this.keyboardDragHandler.interrupt();
      },
      // hides the interactionCueNode cue node after a successful drag
      showDragCueNode: () => !successfulKeyboardDrag,
      tandem: tandem.createTandem('grabDragInteraction')
    });

    // jump to the wall on 'J + W'
    this.keyboardDragHandler.hotkeys = [{
      keys: [KeyboardUtils.KEY_J, KeyboardUtils.KEY_W],
      callback: () => {
        this.jumpBalloon(new Vector2(X_POSITIONS.AT_WALL, model.getCenterY()));
      }
    }, {
      keys: [KeyboardUtils.KEY_J, KeyboardUtils.KEY_S],
      callback: () => {
        this.jumpBalloon(new Vector2(X_POSITIONS.AT_NEAR_SWEATER, model.getCenterY()));
      }
    }, {
      keys: [KeyboardUtils.KEY_J, KeyboardUtils.KEY_N],
      callback: () => {
        this.jumpBalloon(new Vector2(X_POSITIONS.AT_NEAR_WALL, model.getCenterY()));
      }
    }, {
      keys: [KeyboardUtils.KEY_J, KeyboardUtils.KEY_C],
      callback: () => {
        this.jumpBalloon(new Vector2(X_POSITIONS.AT_CENTER_PLAY_AREA, model.getCenterY()));
      }
    }];

    // update the drag bounds when wall visibility changes
    globalModel.wall.isVisibleProperty.link(() => {
      dragBoundsProperty.value = this.getDragBounds();
    });
    model.resetEmitter.addListener(() => {
      // if reset, release the balloon from dragging
      dragHandler.interrupt();

      // reset so the "drag" cue shows up again for the GrabDragInteraction
      successfulKeyboardDrag = false;
      this.describer.reset();
      grabDragInteraction.reset();
    });

    // Handle a query parameter that adds a line and a marker at the "charge center".  This can be useful for debugging.
    if (BASEQueryParameters.showBalloonChargeCenter) {
      const parentToLocalChargeCenter = this.parentToLocalPoint(model.getChargeCenter());
      this.addChild(new Rectangle(0, 0, 5, 5, {
        fill: 'green',
        center: parentToLocalChargeCenter
      }));
      this.addChild(new Line(-500, parentToLocalChargeCenter.y, 500, parentToLocalChargeCenter.y, {
        stroke: 'green'
      }));
    }
  }

  /**
   * Step the model forward in time.
   * @param  {number} dt
   * @public
   */
  step(dt) {
    this.balloonRubbingSoundGenerator.step(dt);

    // Step the describer, which uses polling to determine the next alerts describing interactions with the balloon.
    this.describer.step(dt);
  }

  /**
   * Jump the balloon to a new position, first muting the utteranceQueue, then updating position, then clearing the
   * queue and enabling it once more.  Finally, we will add a custom utterance to the queue describing the jump
   * interaction.
   * @param  {Vector2} center - new center position for the balloon
   * @public
   */
  jumpBalloon(center) {
    this.model.jumping = true;

    // release balloon so that the jump is not associated with velocity
    this.model.setCenter(center);

    // clear the queue of utterances that collected as position changed
    this.forEachUtteranceQueue(utteranceQueue => utteranceQueue.clear());

    // Send a custom alert, depending on where the balloon was moved to
    this.jumpingUtterance.alert = this.describer.movementDescriber.getJumpingDescription(center);
    this.alertDescriptionUtterance(this.jumpingUtterance);

    // reset forces in tracked values in describer that determine description for induced charge change
    this.describer.chargeDescriber.resetReferenceForces();
  }

  /**
   * Determine if the user attempted to move beyond the play area bounds with the keyboard.
   * @param {string} key
   * @returns {boolean}
   * @public
   */
  attemptToMoveBeyondBoundary(key) {
    return KeyboardDragListener.isLeftMovementKey(key) && this.model.isTouchingLeftBoundary() || KeyboardDragListener.isUpMovementKey(key) && this.model.isTouchingTopBoundary() || KeyboardDragListener.isRightMovementKey(key) && this.model.isTouchingRightBoundary() || KeyboardDragListener.isDownMovementKey(key) && this.model.isTouchingBottomBoundary();
  }

  /**
   * @param {string} key
   * @returns {string}
   * @public
   */
  getAttemptedMovementDirection(key) {
    let direction;
    if (KeyboardDragListener.isLeftMovementKey(key)) {
      direction = BalloonDirectionEnum.LEFT;
    } else if (KeyboardDragListener.isRightMovementKey(key)) {
      direction = BalloonDirectionEnum.RIGHT;
    } else if (KeyboardDragListener.isUpMovementKey(key)) {
      direction = BalloonDirectionEnum.UP;
    } else if (KeyboardDragListener.isDownMovementKey(key)) {
      direction = BalloonDirectionEnum.DOWN;
    }
    assert && assert(direction);
    return direction;
  }

  /**
   * Gets the available bounds for dragging, which will change when the wall becomes invisible.
   * @returns {Bounds2}
   * @private
   */
  getDragBounds() {
    const modelBounds = this.globalModel.playAreaBounds;
    const balloonWidth = this.model.width;
    const balloonHeight = this.model.height;
    return new Bounds2(modelBounds.minX, modelBounds.minY, modelBounds.maxX - balloonWidth, modelBounds.maxY - balloonHeight);
  }
}

/**
 * A node that mixes InteractiveHighlighting to support Interactive Highlights. The GrabDragInteraction implements
 * the highlights used for interaction and they are applied to a child of this Node. In order to use the
 * same highlights, InteractiveHighlighting is composed with the same Node that uses GrabDragInteraction.
 */
class InteractiveHighlightInteractionNode extends InteractiveHighlighting(Path) {}
balloonsAndStaticElectricity.register('BalloonNode', BalloonNode);
export default BalloonNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkJvdW5kczIiLCJWZWN0b3IyIiwiU2hhcGUiLCJtZXJnZSIsIkdyYWJEcmFnSW50ZXJhY3Rpb24iLCJEcmFnTGlzdGVuZXIiLCJGb2N1c0hpZ2hsaWdodEZyb21Ob2RlIiwiSW1hZ2UiLCJJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyIsIktleWJvYXJkRHJhZ0xpc3RlbmVyIiwiS2V5Ym9hcmRVdGlscyIsIkxpbmUiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsImJvdW5kYXJ5UmVhY2hlZFNvdW5kUGxheWVyIiwiUGl0Y2hlZFBvcEdlbmVyYXRvciIsIlNvdW5kQ2xpcCIsInNvdW5kTWFuYWdlciIsIlV0dGVyYW5jZSIsImJhbGxvb25HcmFiMDA2X21wMyIsImJhbGxvb25IaXRTd2VhdGVyX21wMyIsImJhbGxvb25SZWxlYXNlMDA2X21wMyIsIndhbGxDb250YWN0X21wMyIsImJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkiLCJCQVNFQTExeVN0cmluZ3MiLCJCQVNFQ29uc3RhbnRzIiwiQkFTRVF1ZXJ5UGFyYW1ldGVycyIsIkJhbGxvb25EaXJlY3Rpb25FbnVtIiwiUGxheUFyZWFNYXAiLCJCYWxsb29uSW50ZXJhY3Rpb25DdWVOb2RlIiwiQmFsbG9vblJ1YmJpbmdTb3VuZEdlbmVyYXRvciIsIkJhbGxvb25WZWxvY2l0eVNvdW5kR2VuZXJhdG9yIiwiQmFsbG9vbkRlc2NyaWJlciIsIk1pbnVzQ2hhcmdlTm9kZSIsIlBsdXNDaGFyZ2VOb2RlIiwiWF9QT1NJVElPTlMiLCJncmFiQmFsbG9vbktleWJvYXJkSGVscFN0cmluZyIsImdyYWJCYWxsb29uS2V5Ym9hcmRIZWxwIiwidmFsdWUiLCJHUkFCX1JFTEVBU0VfU09VTkRfTEVWRUwiLCJCYWxsb29uTm9kZSIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJpbWFnZVNvdXJjZSIsImdsb2JhbE1vZGVsIiwiYWNjZXNzaWJsZUxhYmVsU3RyaW5nIiwib3RoZXJBY2Nlc3NpYmxlTGFiZWxTdHJpbmciLCJsYXlvdXRCb3VuZHMiLCJ0YW5kZW0iLCJvcHRpb25zIiwiY3Vyc29yIiwiYmFsbG9vblZlbG9jaXR5U291bmRHZW5lcmF0b3JPcHRpb25zIiwiZW5hYmxlQ29udHJvbFByb3BlcnRpZXMiLCJpc1Zpc2libGVQcm9wZXJ0eSIsImJhbGxvb25SdWJiaW5nU291bmRHZW5lcmF0b3JPcHRpb25zIiwicG9pbnRlckRyYWciLCJfIiwibm9vcCIsImtleWJvYXJkRHJhZyIsImNvbnRhaW5lclRhZ05hbWUiLCJ0YWdOYW1lIiwibGFiZWxUYWdOYW1lIiwibGFiZWxDb250ZW50IiwiYXNzZXJ0IiwiZGVzY3JpYmVyIiwid2FsbCIsImp1bXBpbmdVdHRlcmFuY2UiLCJvcmlnaW5hbENoYXJnZXNOb2RlIiwicGlja2FibGUiLCJjcmVhdGVUYW5kZW0iLCJhZGRlZENoYXJnZXNOb2RlIiwiZW5kRHJhZ0xpc3RlbmVyIiwiaXNEcmFnZ2VkUHJvcGVydHkiLCJzZXQiLCJ2ZWxvY2l0eVByb3BlcnR5IiwiZHJhZ1ZlbG9jaXR5UHJvcGVydHkiLCJyZWxlYXNlQmFsbG9vblNvdW5kUGxheWVyIiwicGxheSIsImJvdW5kc1dpdGhvdXRXYWxsIiwid2lkdGgiLCJoZWlnaHQiLCJib3VuZHNXaXRoV2FsbCIsIndhbGxXaWR0aCIsImJhbGxvb25EcmFnQm91bmRzUHJvcGVydHkiLCJsaW5rIiwiaXNXYWxsVmlzaWJsZSIsImdyYWJCYWxsb29uU291bmRQbGF5ZXIiLCJpbml0aWFsT3V0cHV0TGV2ZWwiLCJhZGRTb3VuZEdlbmVyYXRvciIsImRyYWdIYW5kbGVyIiwicG9zaXRpb25Qcm9wZXJ0eSIsImRyYWdCb3VuZHNQcm9wZXJ0eSIsImFsbG93VG91Y2hTbmFnIiwic3RhcnQiLCJkcmFnZ2luZ1dpdGhQb2ludGVyIiwiZHJhZyIsImVuZCIsImFkZElucHV0TGlzdGVuZXIiLCJiYWxsb29uSW1hZ2VOb2RlIiwiYWRkQ2hpbGQiLCJtYWluQm9keUVsbGlwc2UiLCJlbGxpcHNlIiwiY2VudGVyWCIsImNlbnRlclkiLCJudWJSZWN0IiwicmVjdGFuZ2xlIiwicG9pbnRlckFyZWFTaGFwZSIsInVuaW9uIiwibW91c2VBcmVhIiwidG91Y2hBcmVhIiwiaSIsInBsdXNDaGFyZ2VzIiwibGVuZ3RoIiwicG9zaXRpb24iLCJtaW51c0NoYXJnZXMiLCJhZGRlZE5vZGVzIiwiYWRkZWRNaW51c0NoYXJnZU5vZGUiLCJ2aXNpYmxlIiwicHVzaCIsImNoYXJnZVByb3BlcnR5IiwiY2hhcmdlVmFsIiwibnVtVmlzaWJsZU1pbnVzQ2hhcmdlcyIsIk1hdGgiLCJhYnMiLCJ0cmFuc2xhdGlvbiIsInNob3dDaGFyZ2VzUHJvcGVydHkiLCJ2aXNpYmlsaXR5IiwiY2hhcmdlc1Nob3duT25CYWxsb29uUHJvcGVydHkiLCJzaG93Q2hhcmdlcyIsInBvcFNvdW5kR2VuZXJhdG9yIiwibGF6eUxpbmsiLCJjaGFyZ2UiLCJjaGFyZ2VBYnNvbHV0ZVZhbHVlIiwicGxheVBvcCIsIk1BWF9CQUxMT09OX0NIQVJHRSIsInRvdWNoaW5nV2FsbFByb3BlcnR5IiwiYmFsbG9vblJ1YmJpbmdTb3VuZEdlbmVyYXRvciIsIm9uU3dlYXRlclByb3BlcnR5IiwiYmFsbG9vbkhpdHNTd2VhdGVyU291bmRDbGlwIiwiY3VycmVudFZlbG9jaXR5IiwicHJldmlvdXNWZWxvY2l0eSIsImN1cnJlbnRTcGVlZCIsIm1hZ25pdHVkZSIsInByZXZpb3VzU3BlZWQiLCJiYWxsb29uSGl0c1dhbGxTb3VuZENsaXAiLCJwcmV2aW91c1Bvc2l0aW9uIiwiZHJhZ0JvdW5kcyIsIngiLCJtYXhYIiwibWluWCIsInkiLCJtYXhZIiwibWluWSIsImZvY3VzSGlnaGxpZ2h0IiwidXBkYXRlQWNjZXNzaWJsZURlc2NyaXB0aW9uIiwiZGVzY3JpcHRpb25Db250ZW50IiwiZ2V0QmFsbG9vbkRlc2NyaXB0aW9uIiwiZ2V0RHJhZ0JvdW5kcyIsInN1Y2Nlc3NmdWxLZXlib2FyZERyYWciLCJib3VuZGFyeVV0dGVyYW5jZSIsImtleWJvYXJkRHJhZ0hhbmRsZXIiLCJkcmFnVmVsb2NpdHkiLCJzaGlmdERyYWdWZWxvY2l0eSIsInNoaWZ0S2V5TXVsdGlwbGllciIsImV2ZW50Iiwia2V5IiwiZ2V0RXZlbnRDb2RlIiwiZG9tRXZlbnQiLCJhdHRlbXB0VG9Nb3ZlQmV5b25kQm91bmRhcnkiLCJhdHRlbXB0ZWREaXJlY3Rpb24iLCJnZXRBdHRlbXB0ZWRNb3ZlbWVudERpcmVjdGlvbiIsImFsZXJ0IiwibW92ZW1lbnREZXNjcmliZXIiLCJnZXRUb3VjaGluZ0JvdW5kYXJ5RGVzY3JpcHRpb24iLCJhbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlIiwiaW50ZXJhY3Rpb25DdWVOb2RlIiwiY2VudGVyIiwiZ3JhYkRyYWdUYXJnZXROb2RlIiwiSW50ZXJhY3RpdmVIaWdobGlnaHRJbnRlcmFjdGlvbk5vZGUiLCJncmFiRHJhZ0ludGVyYWN0aW9uIiwib2JqZWN0VG9HcmFiU3RyaW5nIiwiZHJhZ0N1ZU5vZGUiLCJncmFiQ3VlT3B0aW9ucyIsImNlbnRlclRvcCIsImNlbnRlckJvdHRvbSIsInBsdXNYWSIsImtleWJvYXJkSGVscFRleHQiLCJvbkdyYWIiLCJvblJlbGVhc2UiLCJpbnRlcnJ1cHQiLCJzaG93RHJhZ0N1ZU5vZGUiLCJob3RrZXlzIiwia2V5cyIsIktFWV9KIiwiS0VZX1ciLCJjYWxsYmFjayIsImp1bXBCYWxsb29uIiwiQVRfV0FMTCIsImdldENlbnRlclkiLCJLRVlfUyIsIkFUX05FQVJfU1dFQVRFUiIsIktFWV9OIiwiQVRfTkVBUl9XQUxMIiwiS0VZX0MiLCJBVF9DRU5URVJfUExBWV9BUkVBIiwicmVzZXRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJyZXNldCIsInNob3dCYWxsb29uQ2hhcmdlQ2VudGVyIiwicGFyZW50VG9Mb2NhbENoYXJnZUNlbnRlciIsInBhcmVudFRvTG9jYWxQb2ludCIsImdldENoYXJnZUNlbnRlciIsImZpbGwiLCJzdHJva2UiLCJzdGVwIiwiZHQiLCJqdW1waW5nIiwic2V0Q2VudGVyIiwiZm9yRWFjaFV0dGVyYW5jZVF1ZXVlIiwidXR0ZXJhbmNlUXVldWUiLCJjbGVhciIsImdldEp1bXBpbmdEZXNjcmlwdGlvbiIsImNoYXJnZURlc2NyaWJlciIsInJlc2V0UmVmZXJlbmNlRm9yY2VzIiwiaXNMZWZ0TW92ZW1lbnRLZXkiLCJpc1RvdWNoaW5nTGVmdEJvdW5kYXJ5IiwiaXNVcE1vdmVtZW50S2V5IiwiaXNUb3VjaGluZ1RvcEJvdW5kYXJ5IiwiaXNSaWdodE1vdmVtZW50S2V5IiwiaXNUb3VjaGluZ1JpZ2h0Qm91bmRhcnkiLCJpc0Rvd25Nb3ZlbWVudEtleSIsImlzVG91Y2hpbmdCb3R0b21Cb3VuZGFyeSIsImRpcmVjdGlvbiIsIkxFRlQiLCJSSUdIVCIsIlVQIiwiRE9XTiIsIm1vZGVsQm91bmRzIiwicGxheUFyZWFCb3VuZHMiLCJiYWxsb29uV2lkdGgiLCJiYWxsb29uSGVpZ2h0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCYWxsb29uTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTY2VuZXJ5IGRpc3BsYXkgb2JqZWN0IChzY2VuZSBncmFwaCBub2RlKSBmb3IgdGhlIEJhbGxvb24gb2YgdGhlIG1vZGVsLlxyXG4gKlxyXG4gKiBBY2Nlc3NpYmxlIGNvbnRlbnQgZm9yIEJhbGxvb25Ob2RlIGFjdHMgYXMgYSBjb250YWluZXIgZm9yIHRoZSBidXR0b24gYW5kIGFwcGxpY2F0aW9uIGRpdiwgd2hpY2ggYXJlIHByb3ZpZGVkIGJ5XHJcbiAqIGNoaWxkcmVuIG9mIHRoaXMgbm9kZS4gIEJld2FyZSB0aGF0IGNoYW5naW5nIHRoZSBzY2VuZSBncmFwaCB1bmRlciB0aGlzIG5vZGUgd2lsbCBjaGFuZ2UgdGhlIHN0cnVjdHVyZSBvZiB0aGVcclxuICogYWNjZXNzaWJsZSBjb250ZW50LlxyXG4gKlxyXG4gKiBAYXV0aG9yIFZhc2lseSBTaGFraG92IChNbGVhcm5lcilcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgR3JhYkRyYWdJbnRlcmFjdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYWNjZXNzaWJpbGl0eS9HcmFiRHJhZ0ludGVyYWN0aW9uLmpzJztcclxuaW1wb3J0IHsgRHJhZ0xpc3RlbmVyLCBGb2N1c0hpZ2hsaWdodEZyb21Ob2RlLCBJbWFnZSwgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcsIEtleWJvYXJkRHJhZ0xpc3RlbmVyLCBLZXlib2FyZFV0aWxzLCBMaW5lLCBOb2RlLCBQYXRoLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgYm91bmRhcnlSZWFjaGVkU291bmRQbGF5ZXIgZnJvbSAnLi4vLi4vLi4vLi4vdGFtYm8vanMvc2hhcmVkLXNvdW5kLXBsYXllcnMvYm91bmRhcnlSZWFjaGVkU291bmRQbGF5ZXIuanMnO1xyXG5pbXBvcnQgUGl0Y2hlZFBvcEdlbmVyYXRvciBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9qcy9zb3VuZC1nZW5lcmF0b3JzL1BpdGNoZWRQb3BHZW5lcmF0b3IuanMnO1xyXG5pbXBvcnQgU291bmRDbGlwIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvU291bmRDbGlwLmpzJztcclxuaW1wb3J0IHNvdW5kTWFuYWdlciBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9qcy9zb3VuZE1hbmFnZXIuanMnO1xyXG5pbXBvcnQgVXR0ZXJhbmNlIGZyb20gJy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2UuanMnO1xyXG5pbXBvcnQgYmFsbG9vbkdyYWIwMDZfbXAzIGZyb20gJy4uLy4uLy4uL3NvdW5kcy9iYWxsb29uR3JhYjAwNl9tcDMuanMnO1xyXG5pbXBvcnQgYmFsbG9vbkhpdFN3ZWF0ZXJfbXAzIGZyb20gJy4uLy4uLy4uL3NvdW5kcy9iYWxsb29uSGl0U3dlYXRlcl9tcDMuanMnO1xyXG5pbXBvcnQgYmFsbG9vblJlbGVhc2UwMDZfbXAzIGZyb20gJy4uLy4uLy4uL3NvdW5kcy9iYWxsb29uUmVsZWFzZTAwNl9tcDMuanMnO1xyXG5pbXBvcnQgd2FsbENvbnRhY3RfbXAzIGZyb20gJy4uLy4uLy4uL3NvdW5kcy93YWxsQ29udGFjdF9tcDMuanMnO1xyXG5pbXBvcnQgYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eSBmcm9tICcuLi8uLi9iYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5LmpzJztcclxuaW1wb3J0IEJBU0VBMTF5U3RyaW5ncyBmcm9tICcuLi9CQVNFQTExeVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgQkFTRUNvbnN0YW50cyBmcm9tICcuLi9CQVNFQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEJBU0VRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vQkFTRVF1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBCYWxsb29uRGlyZWN0aW9uRW51bSBmcm9tICcuLi9tb2RlbC9CYWxsb29uRGlyZWN0aW9uRW51bS5qcyc7XHJcbmltcG9ydCBQbGF5QXJlYU1hcCBmcm9tICcuLi9tb2RlbC9QbGF5QXJlYU1hcC5qcyc7XHJcbmltcG9ydCBCYWxsb29uSW50ZXJhY3Rpb25DdWVOb2RlIGZyb20gJy4vQmFsbG9vbkludGVyYWN0aW9uQ3VlTm9kZS5qcyc7XHJcbmltcG9ydCBCYWxsb29uUnViYmluZ1NvdW5kR2VuZXJhdG9yIGZyb20gJy4vQmFsbG9vblJ1YmJpbmdTb3VuZEdlbmVyYXRvci5qcyc7XHJcbmltcG9ydCBCYWxsb29uVmVsb2NpdHlTb3VuZEdlbmVyYXRvciBmcm9tICcuL0JhbGxvb25WZWxvY2l0eVNvdW5kR2VuZXJhdG9yLmpzJztcclxuaW1wb3J0IEJhbGxvb25EZXNjcmliZXIgZnJvbSAnLi9kZXNjcmliZXJzL0JhbGxvb25EZXNjcmliZXIuanMnO1xyXG5pbXBvcnQgTWludXNDaGFyZ2VOb2RlIGZyb20gJy4vTWludXNDaGFyZ2VOb2RlLmpzJztcclxuaW1wb3J0IFBsdXNDaGFyZ2VOb2RlIGZyb20gJy4vUGx1c0NoYXJnZU5vZGUuanMnO1xyXG5cclxuLy8gcGRvbSAtIGNyaXRpY2FsIHggcG9zaXRpb25zIGZvciB0aGUgYmFsbG9vblxyXG5jb25zdCBYX1BPU0lUSU9OUyA9IFBsYXlBcmVhTWFwLlhfUE9TSVRJT05TO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IGdyYWJCYWxsb29uS2V5Ym9hcmRIZWxwU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmdyYWJCYWxsb29uS2V5Ym9hcmRIZWxwLnZhbHVlO1xyXG5jb25zdCBHUkFCX1JFTEVBU0VfU09VTkRfTEVWRUwgPSAwLjE7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuXHJcbmNsYXNzIEJhbGxvb25Ob2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBtaXhlcyBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ1xyXG4gICAqIEBwYXJhbSB7QmFsbG9vbk1vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7SW1hZ2V9IGltYWdlU291cmNlIC0gaW1hZ2Ugc291cmNlIGZyb20gdGhlIGltYWdlIHBsdWdpblxyXG4gICAqIEBwYXJhbSB7QkFTRU1vZGVsfSBnbG9iYWxNb2RlbFxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhY2Nlc3NpYmxlTGFiZWxTdHJpbmcgLSB0aGUgYWNjZXNzaWJsZSBsYWJlbCBmb3IgdGhpcyBiYWxsb29uXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG90aGVyQWNjZXNzaWJsZUxhYmVsU3RyaW5nIC0gdGhlIGFjY2Vzc2libGUgbGFiZWwgZm9yIHRoZSBcIm90aGVyXCIgYmFsbG9vblxyXG4gICAqIEBwYXJhbSB7Qm91bmRzMn0gbGF5b3V0Qm91bmRzIC0gbGF5b3V0IGJvdW5kcyBvZiB0aGUgU2NyZWVuVmlldyBjb250YWluaW5nIHRoaXMgbm9kZVxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLFxyXG4gICAgICAgICAgICAgICBpbWFnZVNvdXJjZSxcclxuICAgICAgICAgICAgICAgZ2xvYmFsTW9kZWwsXHJcbiAgICAgICAgICAgICAgIGFjY2Vzc2libGVMYWJlbFN0cmluZyxcclxuICAgICAgICAgICAgICAgb3RoZXJBY2Nlc3NpYmxlTGFiZWxTdHJpbmcsXHJcbiAgICAgICAgICAgICAgIGxheW91dEJvdW5kcyxcclxuICAgICAgICAgICAgICAgdGFuZGVtLFxyXG4gICAgICAgICAgICAgICBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuXHJcbiAgICAgIC8vIHtPYmplY3R9IC0gb3B0aW9ucyBwYXNzZWQgdG8gdGhlIGRyaWZ0IHZlbG9jaXR5IHNvdW5kIGdlbmVyYXRvclxyXG4gICAgICBiYWxsb29uVmVsb2NpdHlTb3VuZEdlbmVyYXRvck9wdGlvbnM6IHtcclxuICAgICAgICBlbmFibGVDb250cm9sUHJvcGVydGllczogWyBtb2RlbC5pc1Zpc2libGVQcm9wZXJ0eSBdXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyB7T2JqZWN0fSAtIG9wdGlvbnMgcGFzc2VkIHRvIHRoZSBiYWxsb29uIHJ1YmJpbmcgc291bmQgZ2VuZXJhdG9yXHJcbiAgICAgIGJhbGxvb25SdWJiaW5nU291bmRHZW5lcmF0b3JPcHRpb25zOiB7fSxcclxuXHJcbiAgICAgIC8vIHtmdW5jdGlvbn0gLSBhZGRpdGlvbmFsIG1ldGhvZCB0byBjYWxsIGF0IGVuZCBvZiBwb2ludGVyIGRyYWdcclxuICAgICAgcG9pbnRlckRyYWc6IF8ubm9vcCxcclxuXHJcbiAgICAgIC8vIHtmdW5jdGlvbn0gLSBhZGRpdGlvbmFsIG1ldGhvZCB0byBjYWxsIGF0IGVuZCBvZiBrZXlib2FyZCBkcmFnXHJcbiAgICAgIGtleWJvYXJkRHJhZzogXy5ub29wLFxyXG5cclxuICAgICAgLy8gcGRvbSAtIHRoaXMgbm9kZSB3aWxsIGFjdCBhcyBhIGNvbnRhaW5lciBmb3IgbW9yZSBhY2Nlc3NpYmxlIGNvbnRlbnQsIGl0cyBjaGlsZHJlbiB3aWxsIGltcGxlbWVudFxyXG4gICAgICAvLyBtb3N0IG9mIHRoZSBrZXlib2FyZCBuYXZpZ2F0aW9uXHJcbiAgICAgIGNvbnRhaW5lclRhZ05hbWU6ICdkaXYnLFxyXG4gICAgICB0YWdOYW1lOiAnZGl2JyxcclxuICAgICAgbGFiZWxUYWdOYW1lOiAnaDMnLFxyXG4gICAgICBsYWJlbENvbnRlbnQ6IGFjY2Vzc2libGVMYWJlbFN0cmluZ1xyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLnRhbmRlbSwgJ3JlcXVpcmVkIHBhcmFtJyApO1xyXG4gICAgb3B0aW9ucy50YW5kZW0gPSB0YW5kZW07XHJcblxyXG4gICAgLy8gc3VwZXIgY29uc3RydWN0b3JcclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuICAgIHRoaXMuZ2xvYmFsTW9kZWwgPSBnbG9iYWxNb2RlbDtcclxuXHJcbiAgICAvLyBwZG9tIC0gYSB0eXBlIHRoYXQgZ2VuZXJhdGVzIGRlc2NyaXB0aW9ucyBmb3IgdGhlIGJhbGxvb25cclxuICAgIHRoaXMuZGVzY3JpYmVyID0gbmV3IEJhbGxvb25EZXNjcmliZXIoIGdsb2JhbE1vZGVsLCBnbG9iYWxNb2RlbC53YWxsLCBtb2RlbCwgYWNjZXNzaWJsZUxhYmVsU3RyaW5nLCBvdGhlckFjY2Vzc2libGVMYWJlbFN0cmluZywgdGhpcyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gdGhlIHV0dGVyYW5jZSB0byBiZSBzZW50IHRvIHRoZSB1dHRlcmFuY2VRdWV1ZSB3aGVuIGEganVtcGluZyBhY3Rpb24gb2NjdXJzXHJcbiAgICB0aGlzLmp1bXBpbmdVdHRlcmFuY2UgPSBuZXcgVXR0ZXJhbmNlKCk7XHJcblxyXG4gICAgY29uc3Qgb3JpZ2luYWxDaGFyZ2VzTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnb3JpZ2luYWxDaGFyZ2VzTm9kZScgKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgYWRkZWRDaGFyZ2VzTm9kZSA9IG5ldyBOb2RlKCB7IHBpY2thYmxlOiBmYWxzZSwgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYWRkZWRDaGFyZ2VzTm9kZScgKSB9ICk7XHJcblxyXG4gICAgLy8gRmluaXNoIGEgZHJhZyBpbnRlcmFjdGlvbiBieSB1cGRhdGluZyB0aGUgUHJvcGVydHkgdHJhY2tpbmcgdGhhdCB0aGUgYmFsbG9vbiBpcyBkcmFnZ2VkIGFuZCByZXNldHRpbmcgdmVsb2NpdGllcy5cclxuICAgIGNvbnN0IGVuZERyYWdMaXN0ZW5lciA9ICgpID0+IHtcclxuICAgICAgbW9kZWwuaXNEcmFnZ2VkUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgICBtb2RlbC52ZWxvY2l0eVByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoIDAsIDAgKSApO1xyXG4gICAgICBtb2RlbC5kcmFnVmVsb2NpdHlQcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCAwLCAwICkgKTtcclxuICAgICAgcmVsZWFzZUJhbGxvb25Tb3VuZFBsYXllci5wbGF5KCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFNldCB1cCB0aGUgYm91bmRzIFByb3BlcnR5IHRoYXQgd2lsbCBrZWVwIHRyYWNrIG9mIHdoZXJlIHRoZSBiYWxsb29uIGNhbiBiZSBkcmFnZ2VkLlxyXG4gICAgY29uc3QgYm91bmRzV2l0aG91dFdhbGwgPSBuZXcgQm91bmRzMiggMCwgMCwgZ2xvYmFsTW9kZWwud2lkdGggLSBtb2RlbC53aWR0aCwgZ2xvYmFsTW9kZWwuaGVpZ2h0IC0gbW9kZWwuaGVpZ2h0ICk7XHJcbiAgICBjb25zdCBib3VuZHNXaXRoV2FsbCA9IG5ldyBCb3VuZHMyKFxyXG4gICAgICAwLFxyXG4gICAgICAwLFxyXG4gICAgICBnbG9iYWxNb2RlbC53aWR0aCAtIGdsb2JhbE1vZGVsLndhbGxXaWR0aCAtIG1vZGVsLndpZHRoLFxyXG4gICAgICBnbG9iYWxNb2RlbC5oZWlnaHQgLSBtb2RlbC5oZWlnaHRcclxuICAgICk7XHJcbiAgICBjb25zdCBiYWxsb29uRHJhZ0JvdW5kc1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBib3VuZHNXaXRoV2FsbCApO1xyXG4gICAgZ2xvYmFsTW9kZWwud2FsbC5pc1Zpc2libGVQcm9wZXJ0eS5saW5rKCBpc1dhbGxWaXNpYmxlID0+IHtcclxuICAgICAgYmFsbG9vbkRyYWdCb3VuZHNQcm9wZXJ0eS5zZXQoIGlzV2FsbFZpc2libGUgPyBib3VuZHNXaXRoV2FsbCA6IGJvdW5kc1dpdGhvdXRXYWxsICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBzb3VuZCBnZW5lcmF0b3JzIGZvciBncmFiIGFuZCByZWxlYXNlIG9mIHRoZSBiYWxsb29ucy5cclxuICAgIGNvbnN0IGdyYWJCYWxsb29uU291bmRQbGF5ZXIgPSBuZXcgU291bmRDbGlwKCBiYWxsb29uR3JhYjAwNl9tcDMsIHtcclxuICAgICAgaW5pdGlhbE91dHB1dExldmVsOiBHUkFCX1JFTEVBU0VfU09VTkRfTEVWRUxcclxuICAgIH0gKTtcclxuICAgIHNvdW5kTWFuYWdlci5hZGRTb3VuZEdlbmVyYXRvciggZ3JhYkJhbGxvb25Tb3VuZFBsYXllciApO1xyXG4gICAgY29uc3QgcmVsZWFzZUJhbGxvb25Tb3VuZFBsYXllciA9IG5ldyBTb3VuZENsaXAoIGJhbGxvb25SZWxlYXNlMDA2X21wMywge1xyXG4gICAgICBpbml0aWFsT3V0cHV0TGV2ZWw6IEdSQUJfUkVMRUFTRV9TT1VORF9MRVZFTFxyXG4gICAgfSApO1xyXG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCByZWxlYXNlQmFsbG9vblNvdW5kUGxheWVyICk7XHJcblxyXG4gICAgLy8gZHJhZyBoYW5kbGluZ1xyXG4gICAgY29uc3QgZHJhZ0hhbmRsZXIgPSBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcblxyXG4gICAgICBwb3NpdGlvblByb3BlcnR5OiBtb2RlbC5wb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBkcmFnQm91bmRzUHJvcGVydHk6IGJhbGxvb25EcmFnQm91bmRzUHJvcGVydHksXHJcbiAgICAgIGFsbG93VG91Y2hTbmFnOiB0cnVlLFxyXG4gICAgICBzdGFydDogKCkgPT4ge1xyXG4gICAgICAgIG1vZGVsLmRyYWdnaW5nV2l0aFBvaW50ZXIgPSB0cnVlO1xyXG4gICAgICAgIG1vZGVsLmlzRHJhZ2dlZFByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgICAgIGdyYWJCYWxsb29uU291bmRQbGF5ZXIucGxheSgpO1xyXG4gICAgICB9LFxyXG4gICAgICBkcmFnOiBvcHRpb25zLnBvaW50ZXJEcmFnLFxyXG4gICAgICBlbmQ6ICgpID0+IHtcclxuICAgICAgICBlbmREcmFnTGlzdGVuZXIoKTtcclxuICAgICAgICBtb2RlbC5kcmFnZ2luZ1dpdGhQb2ludGVyID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RyYWdMaXN0ZW5lcicgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCBkcmFnSGFuZGxlciApO1xyXG5cclxuICAgIGNvbnN0IGJhbGxvb25JbWFnZU5vZGUgPSBuZXcgSW1hZ2UoIGltYWdlU291cmNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2JhbGxvb25JbWFnZU5vZGUnICksXHJcblxyXG4gICAgICAvLyB0aGUgYmFsbG9vbkltYWdlTm9kZSBpcyBub3QgcGlja2FibGUgc28gdGhhdCBtb3VzZSBhbmQgdG91Y2ggYXJlYXMgd2hpY2ggYXJlIHNtYWxsZXIgdGhhbiB0aGUgYm91bmRzXHJcbiAgICAgIC8vIG9mIHRoZSBpbWFnZSBjYW4gYmUgdXNlZCBieSBzZXR0aW5nIHRoZW0gb24gdGhlIHBhcmVudCBvZiB0aGUgaW1hZ2VcclxuICAgICAgcGlja2FibGU6IGZhbHNlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gbm93IGFkZCB0aGUgYmFsbG9vbiwgc28gdGhhdCB0aGUgdGV0aGVyIGlzIGJlaGluZCBpdCBpbiB0aGUgeiBvcmRlclxyXG4gICAgdGhpcy5hZGRDaGlsZCggYmFsbG9vbkltYWdlTm9kZSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIGN1c3RvbSB0b3VjaC9tb3VzZSBhcmVhIHRoYXQgbWF0Y2hlcyB0aGUgc2hhcGUgb2YgdGhlIGJhbGxvb25zIHJlYXNvbmFibHkgd2VsbC4gIFRoaXMgd2FzIGNyZWF0ZWQgdG9cclxuICAgIC8vIG1hdGNoIHRoZSBhcnR3b3JrIGFzIGl0IGlzIGF0IHRoZSB0aW1lIG9mIHRoaXMgd3JpdGluZywgYW5kIGlmIHRoZSBhcnR3b3JrIGNoYW5nZXMsIHRoaXMgbWF5IG5lZWQgdG8gY2hhbmdlIHRvby5cclxuICAgIGNvbnN0IG1haW5Cb2R5RWxsaXBzZSA9IFNoYXBlLmVsbGlwc2UoXHJcbiAgICAgIGJhbGxvb25JbWFnZU5vZGUuY2VudGVyWCxcclxuICAgICAgYmFsbG9vbkltYWdlTm9kZS5jZW50ZXJZICogMC45MSxcclxuICAgICAgYmFsbG9vbkltYWdlTm9kZS53aWR0aCAqIDAuNTEsXHJcbiAgICAgIGJhbGxvb25JbWFnZU5vZGUuaGVpZ2h0ICogMC40NjUsXHJcbiAgICAgIDBcclxuICAgICk7XHJcbiAgICBjb25zdCBudWJSZWN0ID0gU2hhcGUucmVjdGFuZ2xlKFxyXG4gICAgICBiYWxsb29uSW1hZ2VOb2RlLmNlbnRlclggLSBiYWxsb29uSW1hZ2VOb2RlLndpZHRoICogMC4wNSxcclxuICAgICAgYmFsbG9vbkltYWdlTm9kZS5oZWlnaHQgKiAwLjksXHJcbiAgICAgIGJhbGxvb25JbWFnZU5vZGUud2lkdGggKiAwLjEsXHJcbiAgICAgIGJhbGxvb25JbWFnZU5vZGUuaGVpZ2h0ICogMC4xXHJcbiAgICApO1xyXG4gICAgY29uc3QgcG9pbnRlckFyZWFTaGFwZSA9IFNoYXBlLnVuaW9uKCBbIG1haW5Cb2R5RWxsaXBzZSwgbnViUmVjdCBdICk7XHJcbiAgICB0aGlzLm1vdXNlQXJlYSA9IHBvaW50ZXJBcmVhU2hhcGU7XHJcbiAgICB0aGlzLnRvdWNoQXJlYSA9IHBvaW50ZXJBcmVhU2hhcGU7XHJcblxyXG4gICAgLy8gc3RhdGljIGNoYXJnZXNcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG1vZGVsLnBsdXNDaGFyZ2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBvcmlnaW5hbENoYXJnZXNOb2RlLmFkZENoaWxkKCBuZXcgUGx1c0NoYXJnZU5vZGUoIG1vZGVsLnBsdXNDaGFyZ2VzWyBpIF0ucG9zaXRpb24gKSApO1xyXG4gICAgICBvcmlnaW5hbENoYXJnZXNOb2RlLmFkZENoaWxkKCBuZXcgTWludXNDaGFyZ2VOb2RlKCBtb2RlbC5taW51c0NoYXJnZXNbIGkgXS5wb3NpdGlvbiApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcG9zc2libGUgY2hhcmdlc1xyXG4gICAgY29uc3QgYWRkZWROb2RlcyA9IFtdOyAvLyB0cmFjayBpbiBhIGxvY2FsIGFycmF5IHRvIHVwZGF0ZSB2aXNpYmlsaXR5IHdpdGggY2hhcmdlXHJcbiAgICBmb3IgKCBsZXQgaSA9IG1vZGVsLnBsdXNDaGFyZ2VzLmxlbmd0aDsgaSA8IG1vZGVsLm1pbnVzQ2hhcmdlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgYWRkZWRNaW51c0NoYXJnZU5vZGUgPSBuZXcgTWludXNDaGFyZ2VOb2RlKCBtb2RlbC5taW51c0NoYXJnZXNbIGkgXS5wb3NpdGlvbiApO1xyXG4gICAgICBhZGRlZE1pbnVzQ2hhcmdlTm9kZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIGFkZGVkQ2hhcmdlc05vZGUuYWRkQ2hpbGQoIGFkZGVkTWludXNDaGFyZ2VOb2RlICk7XHJcblxyXG4gICAgICBhZGRlZE5vZGVzLnB1c2goIGFkZGVkTWludXNDaGFyZ2VOb2RlICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFkZENoaWxkKCBvcmlnaW5hbENoYXJnZXNOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBhZGRlZENoYXJnZXNOb2RlICk7XHJcblxyXG4gICAgLy8gaWYgY2hhbmdlIGNoYXJnZSwgc2hvdyBtb3JlIG1pbnVzIGNoYXJnZXNcclxuICAgIG1vZGVsLmNoYXJnZVByb3BlcnR5LmxpbmsoIGNoYXJnZVZhbCA9PiB7XHJcbiAgICAgIGNvbnN0IG51bVZpc2libGVNaW51c0NoYXJnZXMgPSBNYXRoLmFicyggY2hhcmdlVmFsICk7XHJcblxyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhZGRlZE5vZGVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGFkZGVkTm9kZXNbIGkgXS52aXNpYmxlID0gaSA8IG51bVZpc2libGVNaW51c0NoYXJnZXM7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBsaW5rIHRoZSBwb3NpdGlvbiBvZiB0aGlzIG5vZGUgdG8gdGhlIG1vZGVsXHJcbiAgICBtb2RlbC5wb3NpdGlvblByb3BlcnR5LmxpbmsoIHBvc2l0aW9uID0+IHtcclxuICAgICAgdGhpcy50cmFuc2xhdGlvbiA9IHBvc2l0aW9uO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHNob3cgY2hhcmdlcyBiYXNlZCBvbiBzaG93Q2hhcmdlcyBwcm9wZXJ0eVxyXG4gICAgZ2xvYmFsTW9kZWwuc2hvd0NoYXJnZXNQcm9wZXJ0eS5saW5rKCB2YWx1ZSA9PiB7XHJcbiAgICAgIGlmICggdmFsdWUgPT09ICdkaWZmJyApIHtcclxuICAgICAgICBvcmlnaW5hbENoYXJnZXNOb2RlLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICBhZGRlZENoYXJnZXNOb2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IHZpc2liaWxpdHkgPSAoIHZhbHVlID09PSAnYWxsJyApO1xyXG4gICAgICAgIG9yaWdpbmFsQ2hhcmdlc05vZGUudmlzaWJsZSA9IHZpc2liaWxpdHk7XHJcbiAgICAgICAgYWRkZWRDaGFyZ2VzTm9kZS52aXNpYmxlID0gdmlzaWJpbGl0eTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHtQcm9wZXJ0eS48Ym9vbGVhbj4gLSBhIHZhbHVlIHRoYXQgcmVmbGVjdHMgd2hldGhlciBjaGFyZ2VzIGFyZSBiZWluZyBzaG93biBvbiB0aGUgYmFsbG9vblxyXG4gICAgY29uc3QgY2hhcmdlc1Nob3duT25CYWxsb29uUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIGdsb2JhbE1vZGVsLnNob3dDaGFyZ2VzUHJvcGVydHkgXSxcclxuICAgICAgc2hvd0NoYXJnZXMgPT4gc2hvd0NoYXJnZXMgIT09ICdub25lJ1xyXG4gICAgKTtcclxuXHJcbiAgICAvLyBzb3VuZCBnZW5lcmF0aW9uIGZvciBjaGFyZ2VzIG1vdmluZyBvbiB0byB0aGlzIGJhbGxvb25cclxuICAgIGNvbnN0IHBvcFNvdW5kR2VuZXJhdG9yID0gbmV3IFBpdGNoZWRQb3BHZW5lcmF0b3IoIHtcclxuICAgICAgZW5hYmxlQ29udHJvbFByb3BlcnRpZXM6IFsgY2hhcmdlc1Nob3duT25CYWxsb29uUHJvcGVydHkgXSxcclxuICAgICAgaW5pdGlhbE91dHB1dExldmVsOiAwLjNcclxuICAgIH0gKTtcclxuICAgIHNvdW5kTWFuYWdlci5hZGRTb3VuZEdlbmVyYXRvciggcG9wU291bmRHZW5lcmF0b3IgKTtcclxuICAgIG1vZGVsLmNoYXJnZVByb3BlcnR5LmxhenlMaW5rKCBjaGFyZ2UgPT4ge1xyXG4gICAgICBjb25zdCBjaGFyZ2VBYnNvbHV0ZVZhbHVlID0gTWF0aC5hYnMoIGNoYXJnZSApO1xyXG4gICAgICBpZiAoIGNoYXJnZUFic29sdXRlVmFsdWUgPiAwICkge1xyXG4gICAgICAgIHBvcFNvdW5kR2VuZXJhdG9yLnBsYXlQb3AoIGNoYXJnZUFic29sdXRlVmFsdWUgLyBCQVNFQ29uc3RhbnRzLk1BWF9CQUxMT09OX0NIQVJHRSApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gc291bmQgZ2VuZXJhdGlvbiBmb3IgZHJpZnQgdmVsb2NpdHlcclxuICAgIHNvdW5kTWFuYWdlci5hZGRTb3VuZEdlbmVyYXRvciggbmV3IEJhbGxvb25WZWxvY2l0eVNvdW5kR2VuZXJhdG9yKFxyXG4gICAgICBtb2RlbC52ZWxvY2l0eVByb3BlcnR5LFxyXG4gICAgICBtb2RlbC50b3VjaGluZ1dhbGxQcm9wZXJ0eSxcclxuICAgICAgb3B0aW9ucy5iYWxsb29uVmVsb2NpdHlTb3VuZEdlbmVyYXRvck9wdGlvbnNcclxuICAgICkgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QmFsbG9vblJ1YmJpbmdTb3VuZEdlbmVyYXRvcn0gLSBTb3VuZCBnZW5lcmF0aW9uIGZvciB3aGVuIHRoZSBiYWxsb29uIGlzIGJlaW5nIHJ1YmJlZCBvbiB0aGUgc3dlYXRlciBvclxyXG4gICAgLy8gYWdhaW5zdCB0aGUgd2FsbC5cclxuICAgIHRoaXMuYmFsbG9vblJ1YmJpbmdTb3VuZEdlbmVyYXRvciA9IG5ldyBCYWxsb29uUnViYmluZ1NvdW5kR2VuZXJhdG9yKFxyXG4gICAgICBtb2RlbC5kcmFnVmVsb2NpdHlQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwub25Td2VhdGVyUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLnRvdWNoaW5nV2FsbFByb3BlcnR5LFxyXG4gICAgICBvcHRpb25zLmJhbGxvb25SdWJiaW5nU291bmRHZW5lcmF0b3JPcHRpb25zXHJcbiAgICApO1xyXG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCB0aGlzLmJhbGxvb25SdWJiaW5nU291bmRHZW5lcmF0b3IgKTtcclxuXHJcbiAgICAvLyBzb3VuZCBnZW5lcmF0aW9uIGZvciB3aGVuIHRoZSBiYWxsb29uIGNvbnRhY3RzIHRoZSBzd2VhdGVyXHJcbiAgICBjb25zdCBiYWxsb29uSGl0c1N3ZWF0ZXJTb3VuZENsaXAgPSBuZXcgU291bmRDbGlwKCBiYWxsb29uSGl0U3dlYXRlcl9tcDMsIHtcclxuICAgICAgaW5pdGlhbE91dHB1dExldmVsOiAwLjA3NVxyXG4gICAgfSApO1xyXG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCBiYWxsb29uSGl0c1N3ZWF0ZXJTb3VuZENsaXAgKTtcclxuICAgIG1vZGVsLnZlbG9jaXR5UHJvcGVydHkubGF6eUxpbmsoICggY3VycmVudFZlbG9jaXR5LCBwcmV2aW91c1ZlbG9jaXR5ICkgPT4ge1xyXG4gICAgICBjb25zdCBjdXJyZW50U3BlZWQgPSBjdXJyZW50VmVsb2NpdHkubWFnbml0dWRlO1xyXG4gICAgICBjb25zdCBwcmV2aW91c1NwZWVkID0gcHJldmlvdXNWZWxvY2l0eS5tYWduaXR1ZGU7XHJcbiAgICAgIGlmICggY3VycmVudFNwZWVkID09PSAwICYmIHByZXZpb3VzU3BlZWQgPiAwICYmIG1vZGVsLm9uU3dlYXRlclByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIGJhbGxvb25IaXRzU3dlYXRlclNvdW5kQ2xpcC5wbGF5KCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIHNvdW5kIGdlbmVyYXRpb24gZm9yIHdoZW4gdGhlIGJhbGxvb24gaGl0cyB0aGUgd2FsbCBvciB0aGUgZHJhZyBib3VuZHMuXHJcbiAgICBjb25zdCBiYWxsb29uSGl0c1dhbGxTb3VuZENsaXAgPSBuZXcgU291bmRDbGlwKCB3YWxsQ29udGFjdF9tcDMsIHtcclxuICAgICAgaW5pdGlhbE91dHB1dExldmVsOiAwLjE1XHJcbiAgICB9ICk7XHJcbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIGJhbGxvb25IaXRzV2FsbFNvdW5kQ2xpcCApO1xyXG4gICAgbW9kZWwucG9zaXRpb25Qcm9wZXJ0eS5sYXp5TGluayggKCBwb3NpdGlvbiwgcHJldmlvdXNQb3NpdGlvbiApID0+IHtcclxuXHJcbiAgICAgIC8vIFRlc3Qgd2hldGhlciB0aGUgYmFsbG9vbiBoYXMgY29tZSBpbnRvIGNvbnRhY3Qgd2l0aCBhbiBlZGdlIGFuZCBwbGF5IGEgc291bmQgaWYgc28uXHJcbiAgICAgIGNvbnN0IGRyYWdCb3VuZHMgPSBiYWxsb29uRHJhZ0JvdW5kc1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgICBpZiAoIHBvc2l0aW9uLnggPj0gZHJhZ0JvdW5kcy5tYXhYICYmIHByZXZpb3VzUG9zaXRpb24ueCA8IGRyYWdCb3VuZHMubWF4WCApIHtcclxuXHJcbiAgICAgICAgLy8gQSBkaWZmZXJlbnQgc291bmQgaXMgcGxheWVkIGJhc2VkIG9uIHdoZXRoZXIgdGhlIGJhbGxvb24gaGFzIGhpdCB0aGUgd2FsbCBvciB0aGUgZHJhZyBib3VuZHMuXHJcbiAgICAgICAgaWYgKCBnbG9iYWxNb2RlbC53YWxsLmlzVmlzaWJsZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgICAgYmFsbG9vbkhpdHNXYWxsU291bmRDbGlwLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBib3VuZGFyeVJlYWNoZWRTb3VuZFBsYXllci5wbGF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBwb3NpdGlvbi54IDw9IGRyYWdCb3VuZHMubWluWCAmJiBwcmV2aW91c1Bvc2l0aW9uLnggPiBkcmFnQm91bmRzLm1pblggKSB7XHJcbiAgICAgICAgYm91bmRhcnlSZWFjaGVkU291bmRQbGF5ZXIucGxheSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggcG9zaXRpb24ueSA+PSBkcmFnQm91bmRzLm1heFkgJiYgcHJldmlvdXNQb3NpdGlvbi55IDwgZHJhZ0JvdW5kcy5tYXhZICkge1xyXG4gICAgICAgIGJvdW5kYXJ5UmVhY2hlZFNvdW5kUGxheWVyLnBsYXkoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggcG9zaXRpb24ueSA8PSBkcmFnQm91bmRzLm1pblkgJiYgcHJldmlvdXNQb3NpdGlvbi55ID4gZHJhZ0JvdW5kcy5taW5ZICkge1xyXG4gICAgICAgIGJvdW5kYXJ5UmVhY2hlZFNvdW5kUGxheWVyLnBsYXkoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHBkb21cclxuICAgIGJhbGxvb25JbWFnZU5vZGUuZm9jdXNIaWdobGlnaHQgPSBuZXcgRm9jdXNIaWdobGlnaHRGcm9tTm9kZSggYmFsbG9vbkltYWdlTm9kZSApO1xyXG5cclxuICAgIC8vIHBkb20gLSB3aGVuIHRoZSBiYWxsb29uIGNoYXJnZSwgcG9zaXRpb24sIG9yIG1vZGVsLnNob3dDaGFyZ2VzUHJvcGVydHkgY2hhbmdlcywgdGhlIGJhbGxvb24gbmVlZHMgYSBuZXdcclxuICAgIC8vIGRlc2NyaXB0aW9uIGZvciBhc3Npc3RpdmUgdGVjaG5vbG9neVxyXG4gICAgY29uc3QgdXBkYXRlQWNjZXNzaWJsZURlc2NyaXB0aW9uID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLmRlc2NyaXB0aW9uQ29udGVudCA9IHRoaXMuZGVzY3JpYmVyLmdldEJhbGxvb25EZXNjcmlwdGlvbigpO1xyXG4gICAgfTtcclxuICAgIG1vZGVsLnBvc2l0aW9uUHJvcGVydHkubGluayggdXBkYXRlQWNjZXNzaWJsZURlc2NyaXB0aW9uICk7XHJcbiAgICBtb2RlbC5jaGFyZ2VQcm9wZXJ0eS5saW5rKCB1cGRhdGVBY2Nlc3NpYmxlRGVzY3JpcHRpb24gKTtcclxuICAgIG1vZGVsLmlzRHJhZ2dlZFByb3BlcnR5LmxpbmsoIHVwZGF0ZUFjY2Vzc2libGVEZXNjcmlwdGlvbiApO1xyXG4gICAgZ2xvYmFsTW9kZWwuc2hvd0NoYXJnZXNQcm9wZXJ0eS5saW5rKCB1cGRhdGVBY2Nlc3NpYmxlRGVzY3JpcHRpb24gKTtcclxuXHJcbiAgICBjb25zdCBkcmFnQm91bmRzUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHRoaXMuZ2V0RHJhZ0JvdW5kcygpICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSB0aGUgZHJhZyBoYW5kbGVyIG5lZWRzIHRvIGJlIHVwZGF0ZWQgaW4gYSBzdGVwIGZ1bmN0aW9uLCBzZWUgS2V5Ym9hcmREcmFnSGFuZGxlciBmb3IgbW9yZSBpbmZvcm1hdGlvblxyXG4gICAgbGV0IHN1Y2Nlc3NmdWxLZXlib2FyZERyYWcgPSBmYWxzZTsgLy8gdXNlZCB0byBoaWRlIHRoZSBcImRyYWdcIiBjdWUgb25jZSBhIHN1Y2Nlc3NmdWwga2V5Ym9hcmQgZHJhZyBoYXBwZW5zXHJcbiAgICBjb25zdCBib3VuZGFyeVV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoKTtcclxuICAgIHRoaXMua2V5Ym9hcmREcmFnSGFuZGxlciA9IG5ldyBLZXlib2FyZERyYWdMaXN0ZW5lcigge1xyXG4gICAgICBkcmFnVmVsb2NpdHk6IDMwMCwgLy8gaW4gdmlldyBjb29yZGluYXRlcyBwZXIgc2Vjb25kXHJcbiAgICAgIHNoaWZ0RHJhZ1ZlbG9jaXR5OiAxMDAsIC8vIGluIHZpZXcgY29vcmRpbmF0ZXMgcGVyIHNlY29uZFxyXG4gICAgICBkcmFnQm91bmRzUHJvcGVydHk6IGRyYWdCb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogbW9kZWwucG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgc2hpZnRLZXlNdWx0aXBsaWVyOiAwLjI1LFxyXG4gICAgICBzdGFydDogZXZlbnQgPT4ge1xyXG4gICAgICAgIGNvbnN0IGtleSA9IEtleWJvYXJkVXRpbHMuZ2V0RXZlbnRDb2RlKCBldmVudC5kb21FdmVudCApO1xyXG4gICAgICAgIHN1Y2Nlc3NmdWxLZXlib2FyZERyYWcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBpZiBhbHJlYWR5IHRvdWNoaW5nIGEgYm91bmRhcnkgd2hlbiBkcmFnZ2luZyBzdGFydHMsIGFubm91bmNlIGFuIGluZGljYXRpb24gb2YgdGhpc1xyXG4gICAgICAgIGlmICggdGhpcy5hdHRlbXB0VG9Nb3ZlQmV5b25kQm91bmRhcnkoIGtleSApICkge1xyXG4gICAgICAgICAgY29uc3QgYXR0ZW1wdGVkRGlyZWN0aW9uID0gdGhpcy5nZXRBdHRlbXB0ZWRNb3ZlbWVudERpcmVjdGlvbigga2V5ICk7XHJcbiAgICAgICAgICBib3VuZGFyeVV0dGVyYW5jZS5hbGVydCA9IHRoaXMuZGVzY3JpYmVyLm1vdmVtZW50RGVzY3JpYmVyLmdldFRvdWNoaW5nQm91bmRhcnlEZXNjcmlwdGlvbiggYXR0ZW1wdGVkRGlyZWN0aW9uICk7XHJcbiAgICAgICAgICB0aGlzLmFsZXJ0RGVzY3JpcHRpb25VdHRlcmFuY2UoIGJvdW5kYXJ5VXR0ZXJhbmNlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBkcmFnOiBvcHRpb25zLmtleWJvYXJkRHJhZyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAna2V5Ym9hcmREcmFnTGlzdGVuZXInIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBtYWRlIHZpc2libGUgd2hlbiB0aGUgYmFsbG9vbiBpcyBwaWNrZWQgdXAgd2l0aCBhIGtleWJvYXJkIGZvciB0aGUgZmlyc3QgdGltZSB0byBzaG93IGhvdyBhIHVzZXIgY2FuIGRyYWcgd2l0aFxyXG4gICAgLy8gYSBrZXlib2FyZFxyXG4gICAgY29uc3QgaW50ZXJhY3Rpb25DdWVOb2RlID0gbmV3IEJhbGxvb25JbnRlcmFjdGlvbkN1ZU5vZGUoIGdsb2JhbE1vZGVsLCBtb2RlbCwgdGhpcywgbGF5b3V0Qm91bmRzICk7XHJcbiAgICBpbnRlcmFjdGlvbkN1ZU5vZGUuY2VudGVyID0gYmFsbG9vbkltYWdlTm9kZS5jZW50ZXI7XHJcblxyXG4gICAgLy8gQXR0YWNoIHRoZSBHcmFiRHJhZ0ludGVyYWN0aW9uIHRvIGEgY2hpbGQgb2YgdGhpcyBOb2RlIHNvIHRoYXQgdGhlIGFjY2Vzc2libGVcclxuICAgIC8vIGNvbnRlbnQgZm9yIHRoZSBpbnRlcmFjdGlvbiBpcyB1bmRlcm5lYXRoIHRoaXMgbm9kZS4gQ2Fubm90IGF0dGFjaCB0byB0aGUgYmFsbG9vbkltYWdlTm9kZVxyXG4gICAgLy8gYmVjYXVzZSBpdCBpcyBpbXBvcnRhbnQgdGhhdCB0aGF0IE5vZGUgYmUgcGlja2FibGU6IGZhbHNlIGZvciB0aGUgdG91Y2ggYXJlYXMuIFRoZSBOb2RlIHRha2VzXHJcbiAgICAvLyB0aGUgc2hhcGUgb2YgdGhlIHRvdWNoQXJlYSBzbyB0aGF0IGJvdW5kcyBkbyBub3QgaW50ZXJmZXJlIG9yIGV4dGVuZCBiZXlvbmQgdGhlIGVsbGlwdGljYWwgdG91Y2hcclxuICAgIC8vIGFyZWEgc2hhcGUuXHJcbiAgICBjb25zdCBncmFiRHJhZ1RhcmdldE5vZGUgPSBuZXcgSW50ZXJhY3RpdmVIaWdobGlnaHRJbnRlcmFjdGlvbk5vZGUoIHRoaXMudG91Y2hBcmVhICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBncmFiRHJhZ1RhcmdldE5vZGUgKTtcclxuICAgIGNvbnN0IGdyYWJEcmFnSW50ZXJhY3Rpb24gPSBuZXcgR3JhYkRyYWdJbnRlcmFjdGlvbiggZ3JhYkRyYWdUYXJnZXROb2RlLCB0aGlzLmtleWJvYXJkRHJhZ0hhbmRsZXIsIHtcclxuICAgICAgb2JqZWN0VG9HcmFiU3RyaW5nOiBhY2Nlc3NpYmxlTGFiZWxTdHJpbmcsXHJcbiAgICAgIGRyYWdDdWVOb2RlOiBpbnRlcmFjdGlvbkN1ZU5vZGUsXHJcblxyXG4gICAgICAvLyBCQVNFIG5lZWRzIHRvIGNvbnRyb2wgdGhlIG9yZGVyaW5nIG9mIGFsbCBhbGVydHMgYWZ0ZXIgYSByZWxlYXNlIGhhcHBlbnMsIHNvIHByZXZlbnRcclxuICAgICAgLy8gdGhlIGRlZmF1bHQgcmVsZWFzZSBhbGVydFxyXG4gICAgICAvLyBhbGVydE9uUmVsZWFzZTogZmFsc2UsXHJcblxyXG4gICAgICBncmFiQ3VlT3B0aW9uczoge1xyXG4gICAgICAgIGNlbnRlclRvcDogYmFsbG9vbkltYWdlTm9kZS5jZW50ZXJCb3R0b20ucGx1c1hZKCAwLCAxMCApXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBrZXlib2FyZEhlbHBUZXh0OiBncmFiQmFsbG9vbktleWJvYXJkSGVscFN0cmluZyxcclxuXHJcbiAgICAgIG9uR3JhYjogKCkgPT4ge1xyXG4gICAgICAgIG1vZGVsLmlzRHJhZ2dlZFByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgICAgIGdyYWJCYWxsb29uU291bmRQbGF5ZXIucGxheSgpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgb25SZWxlYXNlOiAoKSA9PiB7XHJcbiAgICAgICAgZW5kRHJhZ0xpc3RlbmVyKCk7XHJcblxyXG4gICAgICAgIC8vIHJlc2V0IHRoZSBrZXkgc3RhdGUgb2YgdGhlIGRyYWcgaGFuZGxlciBieSBpbnRlcnJ1cHRpbmcgdGhlIGRyYWdcclxuICAgICAgICB0aGlzLmtleWJvYXJkRHJhZ0hhbmRsZXIuaW50ZXJydXB0KCk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBoaWRlcyB0aGUgaW50ZXJhY3Rpb25DdWVOb2RlIGN1ZSBub2RlIGFmdGVyIGEgc3VjY2Vzc2Z1bCBkcmFnXHJcbiAgICAgIHNob3dEcmFnQ3VlTm9kZTogKCkgPT4gIXN1Y2Nlc3NmdWxLZXlib2FyZERyYWcsXHJcblxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdncmFiRHJhZ0ludGVyYWN0aW9uJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8ganVtcCB0byB0aGUgd2FsbCBvbiAnSiArIFcnXHJcbiAgICB0aGlzLmtleWJvYXJkRHJhZ0hhbmRsZXIuaG90a2V5cyA9IFtcclxuICAgICAge1xyXG4gICAgICAgIGtleXM6IFsgS2V5Ym9hcmRVdGlscy5LRVlfSiwgS2V5Ym9hcmRVdGlscy5LRVlfVyBdLFxyXG4gICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmp1bXBCYWxsb29uKCBuZXcgVmVjdG9yMiggWF9QT1NJVElPTlMuQVRfV0FMTCwgbW9kZWwuZ2V0Q2VudGVyWSgpICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXlzOiBbIEtleWJvYXJkVXRpbHMuS0VZX0osIEtleWJvYXJkVXRpbHMuS0VZX1MgXSxcclxuICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5qdW1wQmFsbG9vbiggbmV3IFZlY3RvcjIoIFhfUE9TSVRJT05TLkFUX05FQVJfU1dFQVRFUiwgbW9kZWwuZ2V0Q2VudGVyWSgpICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXlzOiBbIEtleWJvYXJkVXRpbHMuS0VZX0osIEtleWJvYXJkVXRpbHMuS0VZX04gXSxcclxuICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5qdW1wQmFsbG9vbiggbmV3IFZlY3RvcjIoIFhfUE9TSVRJT05TLkFUX05FQVJfV0FMTCwgbW9kZWwuZ2V0Q2VudGVyWSgpICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXlzOiBbIEtleWJvYXJkVXRpbHMuS0VZX0osIEtleWJvYXJkVXRpbHMuS0VZX0MgXSxcclxuICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5qdW1wQmFsbG9vbiggbmV3IFZlY3RvcjIoIFhfUE9TSVRJT05TLkFUX0NFTlRFUl9QTEFZX0FSRUEsIG1vZGVsLmdldENlbnRlclkoKSApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICBdO1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgZHJhZyBib3VuZHMgd2hlbiB3YWxsIHZpc2liaWxpdHkgY2hhbmdlc1xyXG4gICAgZ2xvYmFsTW9kZWwud2FsbC5pc1Zpc2libGVQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgIGRyYWdCb3VuZHNQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuZ2V0RHJhZ0JvdW5kcygpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIG1vZGVsLnJlc2V0RW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG5cclxuICAgICAgLy8gaWYgcmVzZXQsIHJlbGVhc2UgdGhlIGJhbGxvb24gZnJvbSBkcmFnZ2luZ1xyXG4gICAgICBkcmFnSGFuZGxlci5pbnRlcnJ1cHQoKTtcclxuXHJcbiAgICAgIC8vIHJlc2V0IHNvIHRoZSBcImRyYWdcIiBjdWUgc2hvd3MgdXAgYWdhaW4gZm9yIHRoZSBHcmFiRHJhZ0ludGVyYWN0aW9uXHJcbiAgICAgIHN1Y2Nlc3NmdWxLZXlib2FyZERyYWcgPSBmYWxzZTtcclxuXHJcbiAgICAgIHRoaXMuZGVzY3JpYmVyLnJlc2V0KCk7XHJcbiAgICAgIGdyYWJEcmFnSW50ZXJhY3Rpb24ucmVzZXQoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgYSBxdWVyeSBwYXJhbWV0ZXIgdGhhdCBhZGRzIGEgbGluZSBhbmQgYSBtYXJrZXIgYXQgdGhlIFwiY2hhcmdlIGNlbnRlclwiLiAgVGhpcyBjYW4gYmUgdXNlZnVsIGZvciBkZWJ1Z2dpbmcuXHJcbiAgICBpZiAoIEJBU0VRdWVyeVBhcmFtZXRlcnMuc2hvd0JhbGxvb25DaGFyZ2VDZW50ZXIgKSB7XHJcbiAgICAgIGNvbnN0IHBhcmVudFRvTG9jYWxDaGFyZ2VDZW50ZXIgPSB0aGlzLnBhcmVudFRvTG9jYWxQb2ludCggbW9kZWwuZ2V0Q2hhcmdlQ2VudGVyKCkgKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggbmV3IFJlY3RhbmdsZSggMCwgMCwgNSwgNSwgeyBmaWxsOiAnZ3JlZW4nLCBjZW50ZXI6IHBhcmVudFRvTG9jYWxDaGFyZ2VDZW50ZXIgfSApICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBMaW5lKCAtNTAwLCBwYXJlbnRUb0xvY2FsQ2hhcmdlQ2VudGVyLnksIDUwMCwgcGFyZW50VG9Mb2NhbENoYXJnZUNlbnRlci55LCB7IHN0cm9rZTogJ2dyZWVuJyB9ICkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXAgdGhlIG1vZGVsIGZvcndhcmQgaW4gdGltZS5cclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGR0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG5cclxuICAgIHRoaXMuYmFsbG9vblJ1YmJpbmdTb3VuZEdlbmVyYXRvci5zdGVwKCBkdCApO1xyXG5cclxuICAgIC8vIFN0ZXAgdGhlIGRlc2NyaWJlciwgd2hpY2ggdXNlcyBwb2xsaW5nIHRvIGRldGVybWluZSB0aGUgbmV4dCBhbGVydHMgZGVzY3JpYmluZyBpbnRlcmFjdGlvbnMgd2l0aCB0aGUgYmFsbG9vbi5cclxuICAgIHRoaXMuZGVzY3JpYmVyLnN0ZXAoIGR0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBKdW1wIHRoZSBiYWxsb29uIHRvIGEgbmV3IHBvc2l0aW9uLCBmaXJzdCBtdXRpbmcgdGhlIHV0dGVyYW5jZVF1ZXVlLCB0aGVuIHVwZGF0aW5nIHBvc2l0aW9uLCB0aGVuIGNsZWFyaW5nIHRoZVxyXG4gICAqIHF1ZXVlIGFuZCBlbmFibGluZyBpdCBvbmNlIG1vcmUuICBGaW5hbGx5LCB3ZSB3aWxsIGFkZCBhIGN1c3RvbSB1dHRlcmFuY2UgdG8gdGhlIHF1ZXVlIGRlc2NyaWJpbmcgdGhlIGp1bXBcclxuICAgKiBpbnRlcmFjdGlvbi5cclxuICAgKiBAcGFyYW0gIHtWZWN0b3IyfSBjZW50ZXIgLSBuZXcgY2VudGVyIHBvc2l0aW9uIGZvciB0aGUgYmFsbG9vblxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBqdW1wQmFsbG9vbiggY2VudGVyICkge1xyXG4gICAgdGhpcy5tb2RlbC5qdW1waW5nID0gdHJ1ZTtcclxuXHJcbiAgICAvLyByZWxlYXNlIGJhbGxvb24gc28gdGhhdCB0aGUganVtcCBpcyBub3QgYXNzb2NpYXRlZCB3aXRoIHZlbG9jaXR5XHJcbiAgICB0aGlzLm1vZGVsLnNldENlbnRlciggY2VudGVyICk7XHJcblxyXG4gICAgLy8gY2xlYXIgdGhlIHF1ZXVlIG9mIHV0dGVyYW5jZXMgdGhhdCBjb2xsZWN0ZWQgYXMgcG9zaXRpb24gY2hhbmdlZFxyXG4gICAgdGhpcy5mb3JFYWNoVXR0ZXJhbmNlUXVldWUoIHV0dGVyYW5jZVF1ZXVlID0+IHV0dGVyYW5jZVF1ZXVlLmNsZWFyKCkgKTtcclxuXHJcbiAgICAvLyBTZW5kIGEgY3VzdG9tIGFsZXJ0LCBkZXBlbmRpbmcgb24gd2hlcmUgdGhlIGJhbGxvb24gd2FzIG1vdmVkIHRvXHJcbiAgICB0aGlzLmp1bXBpbmdVdHRlcmFuY2UuYWxlcnQgPSB0aGlzLmRlc2NyaWJlci5tb3ZlbWVudERlc2NyaWJlci5nZXRKdW1waW5nRGVzY3JpcHRpb24oIGNlbnRlciApO1xyXG4gICAgdGhpcy5hbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlKCB0aGlzLmp1bXBpbmdVdHRlcmFuY2UgKTtcclxuXHJcbiAgICAvLyByZXNldCBmb3JjZXMgaW4gdHJhY2tlZCB2YWx1ZXMgaW4gZGVzY3JpYmVyIHRoYXQgZGV0ZXJtaW5lIGRlc2NyaXB0aW9uIGZvciBpbmR1Y2VkIGNoYXJnZSBjaGFuZ2VcclxuICAgIHRoaXMuZGVzY3JpYmVyLmNoYXJnZURlc2NyaWJlci5yZXNldFJlZmVyZW5jZUZvcmNlcygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lIGlmIHRoZSB1c2VyIGF0dGVtcHRlZCB0byBtb3ZlIGJleW9uZCB0aGUgcGxheSBhcmVhIGJvdW5kcyB3aXRoIHRoZSBrZXlib2FyZC5cclxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGF0dGVtcHRUb01vdmVCZXlvbmRCb3VuZGFyeSgga2V5ICkge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgKCBLZXlib2FyZERyYWdMaXN0ZW5lci5pc0xlZnRNb3ZlbWVudEtleSgga2V5ICkgJiYgdGhpcy5tb2RlbC5pc1RvdWNoaW5nTGVmdEJvdW5kYXJ5KCkgKSB8fFxyXG4gICAgICAoIEtleWJvYXJkRHJhZ0xpc3RlbmVyLmlzVXBNb3ZlbWVudEtleSgga2V5ICkgJiYgdGhpcy5tb2RlbC5pc1RvdWNoaW5nVG9wQm91bmRhcnkoKSApIHx8XHJcbiAgICAgICggS2V5Ym9hcmREcmFnTGlzdGVuZXIuaXNSaWdodE1vdmVtZW50S2V5KCBrZXkgKSAmJiB0aGlzLm1vZGVsLmlzVG91Y2hpbmdSaWdodEJvdW5kYXJ5KCkgKSB8fFxyXG4gICAgICAoIEtleWJvYXJkRHJhZ0xpc3RlbmVyLmlzRG93bk1vdmVtZW50S2V5KCBrZXkgKSAmJiB0aGlzLm1vZGVsLmlzVG91Y2hpbmdCb3R0b21Cb3VuZGFyeSgpIClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0QXR0ZW1wdGVkTW92ZW1lbnREaXJlY3Rpb24oIGtleSApIHtcclxuICAgIGxldCBkaXJlY3Rpb247XHJcbiAgICBpZiAoIEtleWJvYXJkRHJhZ0xpc3RlbmVyLmlzTGVmdE1vdmVtZW50S2V5KCBrZXkgKSApIHtcclxuICAgICAgZGlyZWN0aW9uID0gQmFsbG9vbkRpcmVjdGlvbkVudW0uTEVGVDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBLZXlib2FyZERyYWdMaXN0ZW5lci5pc1JpZ2h0TW92ZW1lbnRLZXkoIGtleSApICkge1xyXG4gICAgICBkaXJlY3Rpb24gPSBCYWxsb29uRGlyZWN0aW9uRW51bS5SSUdIVDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBLZXlib2FyZERyYWdMaXN0ZW5lci5pc1VwTW92ZW1lbnRLZXkoIGtleSApICkge1xyXG4gICAgICBkaXJlY3Rpb24gPSBCYWxsb29uRGlyZWN0aW9uRW51bS5VUDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBLZXlib2FyZERyYWdMaXN0ZW5lci5pc0Rvd25Nb3ZlbWVudEtleSgga2V5ICkgKSB7XHJcbiAgICAgIGRpcmVjdGlvbiA9IEJhbGxvb25EaXJlY3Rpb25FbnVtLkRPV047XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZGlyZWN0aW9uICk7XHJcbiAgICByZXR1cm4gZGlyZWN0aW9uO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgYXZhaWxhYmxlIGJvdW5kcyBmb3IgZHJhZ2dpbmcsIHdoaWNoIHdpbGwgY2hhbmdlIHdoZW4gdGhlIHdhbGwgYmVjb21lcyBpbnZpc2libGUuXHJcbiAgICogQHJldHVybnMge0JvdW5kczJ9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXREcmFnQm91bmRzKCkge1xyXG4gICAgY29uc3QgbW9kZWxCb3VuZHMgPSB0aGlzLmdsb2JhbE1vZGVsLnBsYXlBcmVhQm91bmRzO1xyXG4gICAgY29uc3QgYmFsbG9vbldpZHRoID0gdGhpcy5tb2RlbC53aWR0aDtcclxuICAgIGNvbnN0IGJhbGxvb25IZWlnaHQgPSB0aGlzLm1vZGVsLmhlaWdodDtcclxuICAgIHJldHVybiBuZXcgQm91bmRzMiggbW9kZWxCb3VuZHMubWluWCwgbW9kZWxCb3VuZHMubWluWSwgbW9kZWxCb3VuZHMubWF4WCAtIGJhbGxvb25XaWR0aCwgbW9kZWxCb3VuZHMubWF4WSAtIGJhbGxvb25IZWlnaHQgKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIG5vZGUgdGhhdCBtaXhlcyBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyB0byBzdXBwb3J0IEludGVyYWN0aXZlIEhpZ2hsaWdodHMuIFRoZSBHcmFiRHJhZ0ludGVyYWN0aW9uIGltcGxlbWVudHNcclxuICogdGhlIGhpZ2hsaWdodHMgdXNlZCBmb3IgaW50ZXJhY3Rpb24gYW5kIHRoZXkgYXJlIGFwcGxpZWQgdG8gYSBjaGlsZCBvZiB0aGlzIE5vZGUuIEluIG9yZGVyIHRvIHVzZSB0aGVcclxuICogc2FtZSBoaWdobGlnaHRzLCBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyBpcyBjb21wb3NlZCB3aXRoIHRoZSBzYW1lIE5vZGUgdGhhdCB1c2VzIEdyYWJEcmFnSW50ZXJhY3Rpb24uXHJcbiAqL1xyXG5jbGFzcyBJbnRlcmFjdGl2ZUhpZ2hsaWdodEludGVyYWN0aW9uTm9kZSBleHRlbmRzIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nKCBQYXRoICkge31cclxuXHJcbmJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkucmVnaXN0ZXIoICdCYWxsb29uTm9kZScsIEJhbGxvb25Ob2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBCYWxsb29uTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7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