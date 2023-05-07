// Copyright 2013-2023, University of Colorado Boulder

/**
 * Shows the draggable pusher, which applies force to the objects in the center of the screen and falls down if he exceeds the maximum velocity.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Image, Node, SimpleDragHandler } from '../../../../scenery/js/imports.js';
import pusher_0_png from '../../../images/pusher_0_png.js';
import pusher_10_png from '../../../images/pusher_10_png.js';
import pusher_11_png from '../../../images/pusher_11_png.js';
import pusher_12_png from '../../../images/pusher_12_png.js';
import pusher_13_png from '../../../images/pusher_13_png.js';
import pusher_14_png from '../../../images/pusher_14_png.js';
import pusher_15_png from '../../../images/pusher_15_png.js';
import pusher_16_png from '../../../images/pusher_16_png.js';
import pusher_17_png from '../../../images/pusher_17_png.js';
import pusher_18_png from '../../../images/pusher_18_png.js';
import pusher_19_png from '../../../images/pusher_19_png.js';
import pusher_1_png from '../../../images/pusher_1_png.js';
import pusher_20_png from '../../../images/pusher_20_png.js';
import pusher_21_png from '../../../images/pusher_21_png.js';
import pusher_22_png from '../../../images/pusher_22_png.js';
import pusher_23_png from '../../../images/pusher_23_png.js';
import pusher_24_png from '../../../images/pusher_24_png.js';
import pusher_25_png from '../../../images/pusher_25_png.js';
import pusher_26_png from '../../../images/pusher_26_png.js';
import pusher_27_png from '../../../images/pusher_27_png.js';
import pusher_28_png from '../../../images/pusher_28_png.js';
import pusher_29_png from '../../../images/pusher_29_png.js';
import pusher_2_png from '../../../images/pusher_2_png.js';
import pusher_30_png from '../../../images/pusher_30_png.js';
import pusher_3_png from '../../../images/pusher_3_png.js';
import pusher_4_png from '../../../images/pusher_4_png.js';
import pusher_5_png from '../../../images/pusher_5_png.js';
import pusher_6_png from '../../../images/pusher_6_png.js';
import pusher_7_png from '../../../images/pusher_7_png.js';
import pusher_8_png from '../../../images/pusher_8_png.js';
import pusher_9_png from '../../../images/pusher_9_png.js';
import pusher_fall_down_png from '../../../images/pusher_fall_down_png.js';
import pusher_straight_on_png from '../../../images/pusher_straight_on_png.js';
import forcesAndMotionBasics from '../../forcesAndMotionBasics.js';
import MotionConstants from '../MotionConstants.js';
class PusherNode extends Node {
  /**
   * Constructor for PusherNode
   *
   * @param {MotionModel} model the model for the entire 'motion', 'friction' or 'acceleration' screen
   * @param {number} layoutWidth width for the layout for purposes of centering the character when pushing
   * @param {Tandem} tandem
   */
  constructor(model, layoutWidth, tandem) {
    const scale = 0.95;

    // Create all the images up front, add as children and toggle their visible for performance and reduced garbage collection
    const pushingRightNodes = [];
    const pushingLeftNodes = [];
    const children = [];
    const standingUp = new Image(pusher_straight_on_png, {
      visible: true,
      pickable: true,
      scale: scale,
      tandem: tandem.createTandem('standingUpImageNode')
    });
    const fallLeft = new Image(pusher_fall_down_png, {
      visible: false,
      pickable: false,
      scale: scale,
      tandem: tandem.createTandem('fallLeftImage')
    });
    const fallRight = new Image(pusher_fall_down_png, {
      visible: false,
      pickable: false,
      scale: new Vector2(-scale, scale),
      tandem: tandem.createTandem('fallRightImage')
    });
    let visibleNode = standingUp;
    children.push(standingUp);
    children.push(fallLeft);
    children.push(fallRight);
    for (let i = 0; i <= 30; i++) {
      const image = i === 0 ? pusher_0_png : i === 1 ? pusher_1_png : i === 2 ? pusher_2_png : i === 3 ? pusher_3_png : i === 4 ? pusher_4_png : i === 5 ? pusher_5_png : i === 6 ? pusher_6_png : i === 7 ? pusher_7_png : i === 8 ? pusher_8_png : i === 9 ? pusher_9_png : i === 10 ? pusher_10_png : i === 11 ? pusher_11_png : i === 12 ? pusher_12_png : i === 13 ? pusher_13_png : i === 14 ? pusher_14_png : i === 15 ? pusher_15_png : i === 16 ? pusher_16_png : i === 17 ? pusher_17_png : i === 18 ? pusher_18_png : i === 19 ? pusher_19_png : i === 20 ? pusher_20_png : i === 21 ? pusher_21_png : i === 22 ? pusher_22_png : i === 23 ? pusher_23_png : i === 24 ? pusher_24_png : i === 25 ? pusher_25_png : i === 26 ? pusher_26_png : i === 27 ? pusher_27_png : i === 28 ? pusher_28_png : i === 29 ? pusher_29_png : i === 30 ? pusher_30_png : null;
      const rightImageNode = new Image(image, {
        visible: false,
        pickable: false,
        scale: scale,
        tandem: tandem.createTandem(`rightImageNode${i}`)
      });
      const leftImageNode = new Image(image, {
        visible: false,
        pickable: false,
        scale: new Vector2(-scale, scale),
        tandem: tandem.createTandem(`leftImageNode${i}`)
      });
      pushingRightNodes.push(rightImageNode);
      pushingLeftNodes.push(leftImageNode);
      children.push(rightImageNode);
      children.push(leftImageNode);
    }
    const setVisibleNode = node => {
      if (node !== visibleNode) {
        visibleNode.visible = false;
        visibleNode.pickable = false;
        node.visible = true;
        node.pickable = true;
        visibleNode = node;
      }
    };
    super({
      children: children,
      tandem: tandem
    });

    // @private - if there are no items on the stack, the node is not interactive and the
    // drag handler will not do anything
    this.interactive = true;

    // Update the position when the pusher is not applying force (fallen or standing)
    const updateZeroForcePosition = x => {
      const pusherY = 362 - visibleNode.height;
      visibleNode.translate(x, pusherY - visibleNode.y, true);
    };

    /**
     * Reset the zero force position so that the pusher is at the correct place when the pusher falls over or when
     * applied force is set to zero after.  Dependent on the width of the item stack, direction the pusher fell, or the
     * direction the pusher was applying a force before the force was set to zero.
     *
     * @param {string} direction description
     */
    const resetZeroForcePosition = direction => {
      if (model.stack.length > 0) {
        const item = model.stack.get(0);

        // get the scaled width of the first image on the stack
        const scaledWidth = item.view.getScaledWidth();

        // add a little more space (10) so the pusher isn't exactly touching the stack
        const delta = scaledWidth / 2 - item.pusherInsetProperty.get() + 10;
        if (direction === 'right') {
          visibleNode.centerX = layoutWidth / 2 - visibleNode.width / 2 - delta;
        } else {
          visibleNode.centerX = layoutWidth / 2 + visibleNode.width / 2 + delta;
        }
      }
    };

    /**
     * Update the position of the visible node when force is being applied to the stack.
     * Dependent on the width of the stack, the width of the visible node, and direction
     * of the applied force
     */
    const updateAppliedForcePosition = () => {
      assert && assert(model.stack.length > 0);
      const pusherY = 362 - visibleNode.height;
      const item = model.stack.get(0);

      // get the scaled width of the first item in the stack
      const scaledWidth = item.view.getScaledWidth();
      const delta = scaledWidth / 2 - item.pusherInsetProperty.get();
      if (model.appliedForceProperty.get() > 0) {
        visibleNode.setTranslation(layoutWidth / 2 - visibleNode.width - delta, pusherY);
      } else {
        visibleNode.setTranslation(layoutWidth / 2 + visibleNode.width + delta, pusherY);
      }

      // if the user empties the stack, the standing image should be where the applied force position was
      standingUp.centerX = visibleNode.centerX;
    };

    // get new position for the pusher node when he falls so that he falls back from
    // the item stack when it is moving too quickly
    // @returns {number}
    const getPusherNodeDeltaX = () => {
      // the change in position for the model
      const modelDelta = -(model.positionProperty.get() - model.previousModelPosition);

      // return, transformed by the view scale
      return modelDelta * MotionConstants.POSITION_SCALE;
    };

    /**
     * Called when the pusher has let go, either from falling or from setting the
     * applied force to zero.
     *
     * @param  {Node} newVisibleNode - visibleNode, should be either falling or standing images of the pusher
     * @param  {string} direction      description
     */
    const pusherLetGo = (newVisibleNode, direction) => {
      // update the visible node and place it in a position dependent on the direction
      // of falling or the applied force
      setVisibleNode(newVisibleNode);
      resetZeroForcePosition(direction);

      // get the translation delta from the transformed model delta and translate
      const x = getPusherNodeDeltaX();
      updateZeroForcePosition(x);
    };
    model.fallenProperty.link(fallen => {
      if (fallen) {
        const newVisibleNode = model.fallenDirectionProperty.get() === 'left' ? fallLeft : fallRight;
        pusherLetGo(newVisibleNode, model.fallenDirectionProperty.get());
      } else {
        // the pusher just stood up after falling, set center standing image at the current
        // fallen position
        standingUp.centerX = visibleNode.centerX;
        setVisibleNode(standingUp);
      }
    });
    model.appliedForceProperty.link((appliedForce, previousAppliedForce) => {
      if (appliedForce === 0) {
        pusherLetGo(standingUp, previousAppliedForce > 0 ? 'right' : 'left');
      }

      // update visibility and position if pusher is on screen and is still able to push
      else {
        const index = Math.min(30, Utils.roundSymmetric(Math.abs(appliedForce / 500 * 30)));
        if (appliedForce > 0) {
          setVisibleNode(pushingRightNodes[index]);
        } else {
          setVisibleNode(pushingLeftNodes[index]);
        }
        updateAppliedForcePosition();
      }
    });
    const initializePusherNode = () => {
      // makd sure that the standing node is visible, and place in initial position
      setVisibleNode(standingUp);
      visibleNode.centerX = layoutWidth / 2 + (model.pusherPositionProperty.get() - model.positionProperty.get()) * MotionConstants.POSITION_SCALE;
    };

    // on reset all, the model should set the node to the initial pusher position
    model.resetAllEmitter.addListener(() => {
      initializePusherNode();
    });

    // when the stack composition changes, we want to update the applied force position
    // model.stackSize does not need a dispose function since it persists for the duration of the simulation
    model.stackSizeProperty.link(stackSize => {
      if (stackSize > 0) {
        // only do this if the pusher is standing and there is non zero applied force
        if (!model.fallenProperty.get() && model.appliedForceProperty.get() !== 0) {
          updateAppliedForcePosition();
        }
      }
    });

    //Update the rightImage and position when the model changes
    model.positionProperty.link(() => {
      if (model.appliedForceProperty.get() === 0 || model.fallenProperty.get()) {
        const x = getPusherNodeDeltaX();
        // to save processor time, don't update if the pusher is too far off screen
        if (Math.abs(x) < 2000) {
          updateZeroForcePosition(x);
        }
      }
    });
    const listener = new SimpleDragHandler({
      tandem: tandem.createTandem('dragListener'),
      allowTouchSnag: true,
      translate: options => {
        if (this.interactive) {
          const newAppliedForce = model.appliedForceProperty.get() + options.delta.x;
          const clampedAppliedForce = Math.max(-500, Math.min(500, newAppliedForce));

          // the new force should be rounded so that applied force is not
          // more precise than friction force, see https://github.com/phetsims/forces-and-motion-basics/issues/197
          const roundedForce = Utils.roundSymmetric(clampedAppliedForce);

          //Only apply a force if the pusher is not fallen, see #48
          if (!model.fallenProperty.get()) {
            model.appliedForceProperty.set(roundedForce);
          }
        }
      },
      start: () => {
        if (this.interactive) {
          // if the user interacts with the pusher, resume model 'playing' so that the sim does not seem broken
          if (!model.playProperty.value) {
            model.playProperty.set(true);
          }
        }
      },
      end: () => {
        if (this.interactive) {
          // if the model is paused, the applied force should remain the same
          if (model.playProperty.value) {
            model.appliedForceProperty.set(0);
          }
        }
      }
    });
    this.addInputListener(listener);

    //Make it so you cannot drag the pusher until one ItemNode is in the play area
    model.stack.lengthProperty.link(length => {
      if (length === 0) {
        this.cursor = 'default';
        this.interactive = false;
      } else {
        this.cursor = 'pointer';
        this.interactive = true;
      }
    });

    // place the pusher in the correct position initially
    initializePusherNode();
  }
}
forcesAndMotionBasics.register('PusherNode', PusherNode);
export default PusherNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlZlY3RvcjIiLCJJbWFnZSIsIk5vZGUiLCJTaW1wbGVEcmFnSGFuZGxlciIsInB1c2hlcl8wX3BuZyIsInB1c2hlcl8xMF9wbmciLCJwdXNoZXJfMTFfcG5nIiwicHVzaGVyXzEyX3BuZyIsInB1c2hlcl8xM19wbmciLCJwdXNoZXJfMTRfcG5nIiwicHVzaGVyXzE1X3BuZyIsInB1c2hlcl8xNl9wbmciLCJwdXNoZXJfMTdfcG5nIiwicHVzaGVyXzE4X3BuZyIsInB1c2hlcl8xOV9wbmciLCJwdXNoZXJfMV9wbmciLCJwdXNoZXJfMjBfcG5nIiwicHVzaGVyXzIxX3BuZyIsInB1c2hlcl8yMl9wbmciLCJwdXNoZXJfMjNfcG5nIiwicHVzaGVyXzI0X3BuZyIsInB1c2hlcl8yNV9wbmciLCJwdXNoZXJfMjZfcG5nIiwicHVzaGVyXzI3X3BuZyIsInB1c2hlcl8yOF9wbmciLCJwdXNoZXJfMjlfcG5nIiwicHVzaGVyXzJfcG5nIiwicHVzaGVyXzMwX3BuZyIsInB1c2hlcl8zX3BuZyIsInB1c2hlcl80X3BuZyIsInB1c2hlcl81X3BuZyIsInB1c2hlcl82X3BuZyIsInB1c2hlcl83X3BuZyIsInB1c2hlcl84X3BuZyIsInB1c2hlcl85X3BuZyIsInB1c2hlcl9mYWxsX2Rvd25fcG5nIiwicHVzaGVyX3N0cmFpZ2h0X29uX3BuZyIsImZvcmNlc0FuZE1vdGlvbkJhc2ljcyIsIk1vdGlvbkNvbnN0YW50cyIsIlB1c2hlck5vZGUiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwibGF5b3V0V2lkdGgiLCJ0YW5kZW0iLCJzY2FsZSIsInB1c2hpbmdSaWdodE5vZGVzIiwicHVzaGluZ0xlZnROb2RlcyIsImNoaWxkcmVuIiwic3RhbmRpbmdVcCIsInZpc2libGUiLCJwaWNrYWJsZSIsImNyZWF0ZVRhbmRlbSIsImZhbGxMZWZ0IiwiZmFsbFJpZ2h0IiwidmlzaWJsZU5vZGUiLCJwdXNoIiwiaSIsImltYWdlIiwicmlnaHRJbWFnZU5vZGUiLCJsZWZ0SW1hZ2VOb2RlIiwic2V0VmlzaWJsZU5vZGUiLCJub2RlIiwiaW50ZXJhY3RpdmUiLCJ1cGRhdGVaZXJvRm9yY2VQb3NpdGlvbiIsIngiLCJwdXNoZXJZIiwiaGVpZ2h0IiwidHJhbnNsYXRlIiwieSIsInJlc2V0WmVyb0ZvcmNlUG9zaXRpb24iLCJkaXJlY3Rpb24iLCJzdGFjayIsImxlbmd0aCIsIml0ZW0iLCJnZXQiLCJzY2FsZWRXaWR0aCIsInZpZXciLCJnZXRTY2FsZWRXaWR0aCIsImRlbHRhIiwicHVzaGVySW5zZXRQcm9wZXJ0eSIsImNlbnRlclgiLCJ3aWR0aCIsInVwZGF0ZUFwcGxpZWRGb3JjZVBvc2l0aW9uIiwiYXNzZXJ0IiwiYXBwbGllZEZvcmNlUHJvcGVydHkiLCJzZXRUcmFuc2xhdGlvbiIsImdldFB1c2hlck5vZGVEZWx0YVgiLCJtb2RlbERlbHRhIiwicG9zaXRpb25Qcm9wZXJ0eSIsInByZXZpb3VzTW9kZWxQb3NpdGlvbiIsIlBPU0lUSU9OX1NDQUxFIiwicHVzaGVyTGV0R28iLCJuZXdWaXNpYmxlTm9kZSIsImZhbGxlblByb3BlcnR5IiwibGluayIsImZhbGxlbiIsImZhbGxlbkRpcmVjdGlvblByb3BlcnR5IiwiYXBwbGllZEZvcmNlIiwicHJldmlvdXNBcHBsaWVkRm9yY2UiLCJpbmRleCIsIk1hdGgiLCJtaW4iLCJyb3VuZFN5bW1ldHJpYyIsImFicyIsImluaXRpYWxpemVQdXNoZXJOb2RlIiwicHVzaGVyUG9zaXRpb25Qcm9wZXJ0eSIsInJlc2V0QWxsRW1pdHRlciIsImFkZExpc3RlbmVyIiwic3RhY2tTaXplUHJvcGVydHkiLCJzdGFja1NpemUiLCJsaXN0ZW5lciIsImFsbG93VG91Y2hTbmFnIiwib3B0aW9ucyIsIm5ld0FwcGxpZWRGb3JjZSIsImNsYW1wZWRBcHBsaWVkRm9yY2UiLCJtYXgiLCJyb3VuZGVkRm9yY2UiLCJzZXQiLCJzdGFydCIsInBsYXlQcm9wZXJ0eSIsInZhbHVlIiwiZW5kIiwiYWRkSW5wdXRMaXN0ZW5lciIsImxlbmd0aFByb3BlcnR5IiwiY3Vyc29yIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQdXNoZXJOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNob3dzIHRoZSBkcmFnZ2FibGUgcHVzaGVyLCB3aGljaCBhcHBsaWVzIGZvcmNlIHRvIHRoZSBvYmplY3RzIGluIHRoZSBjZW50ZXIgb2YgdGhlIHNjcmVlbiBhbmQgZmFsbHMgZG93biBpZiBoZSBleGNlZWRzIHRoZSBtYXhpbXVtIHZlbG9jaXR5LlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IEltYWdlLCBOb2RlLCBTaW1wbGVEcmFnSGFuZGxlciB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBwdXNoZXJfMF9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3B1c2hlcl8wX3BuZy5qcyc7XHJcbmltcG9ydCBwdXNoZXJfMTBfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9wdXNoZXJfMTBfcG5nLmpzJztcclxuaW1wb3J0IHB1c2hlcl8xMV9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3B1c2hlcl8xMV9wbmcuanMnO1xyXG5pbXBvcnQgcHVzaGVyXzEyX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvcHVzaGVyXzEyX3BuZy5qcyc7XHJcbmltcG9ydCBwdXNoZXJfMTNfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9wdXNoZXJfMTNfcG5nLmpzJztcclxuaW1wb3J0IHB1c2hlcl8xNF9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3B1c2hlcl8xNF9wbmcuanMnO1xyXG5pbXBvcnQgcHVzaGVyXzE1X3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvcHVzaGVyXzE1X3BuZy5qcyc7XHJcbmltcG9ydCBwdXNoZXJfMTZfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9wdXNoZXJfMTZfcG5nLmpzJztcclxuaW1wb3J0IHB1c2hlcl8xN19wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3B1c2hlcl8xN19wbmcuanMnO1xyXG5pbXBvcnQgcHVzaGVyXzE4X3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvcHVzaGVyXzE4X3BuZy5qcyc7XHJcbmltcG9ydCBwdXNoZXJfMTlfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9wdXNoZXJfMTlfcG5nLmpzJztcclxuaW1wb3J0IHB1c2hlcl8xX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvcHVzaGVyXzFfcG5nLmpzJztcclxuaW1wb3J0IHB1c2hlcl8yMF9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3B1c2hlcl8yMF9wbmcuanMnO1xyXG5pbXBvcnQgcHVzaGVyXzIxX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvcHVzaGVyXzIxX3BuZy5qcyc7XHJcbmltcG9ydCBwdXNoZXJfMjJfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9wdXNoZXJfMjJfcG5nLmpzJztcclxuaW1wb3J0IHB1c2hlcl8yM19wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3B1c2hlcl8yM19wbmcuanMnO1xyXG5pbXBvcnQgcHVzaGVyXzI0X3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvcHVzaGVyXzI0X3BuZy5qcyc7XHJcbmltcG9ydCBwdXNoZXJfMjVfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9wdXNoZXJfMjVfcG5nLmpzJztcclxuaW1wb3J0IHB1c2hlcl8yNl9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3B1c2hlcl8yNl9wbmcuanMnO1xyXG5pbXBvcnQgcHVzaGVyXzI3X3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvcHVzaGVyXzI3X3BuZy5qcyc7XHJcbmltcG9ydCBwdXNoZXJfMjhfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9wdXNoZXJfMjhfcG5nLmpzJztcclxuaW1wb3J0IHB1c2hlcl8yOV9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3B1c2hlcl8yOV9wbmcuanMnO1xyXG5pbXBvcnQgcHVzaGVyXzJfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9wdXNoZXJfMl9wbmcuanMnO1xyXG5pbXBvcnQgcHVzaGVyXzMwX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvcHVzaGVyXzMwX3BuZy5qcyc7XHJcbmltcG9ydCBwdXNoZXJfM19wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3B1c2hlcl8zX3BuZy5qcyc7XHJcbmltcG9ydCBwdXNoZXJfNF9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3B1c2hlcl80X3BuZy5qcyc7XHJcbmltcG9ydCBwdXNoZXJfNV9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3B1c2hlcl81X3BuZy5qcyc7XHJcbmltcG9ydCBwdXNoZXJfNl9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3B1c2hlcl82X3BuZy5qcyc7XHJcbmltcG9ydCBwdXNoZXJfN19wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3B1c2hlcl83X3BuZy5qcyc7XHJcbmltcG9ydCBwdXNoZXJfOF9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3B1c2hlcl84X3BuZy5qcyc7XHJcbmltcG9ydCBwdXNoZXJfOV9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3B1c2hlcl85X3BuZy5qcyc7XHJcbmltcG9ydCBwdXNoZXJfZmFsbF9kb3duX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvcHVzaGVyX2ZhbGxfZG93bl9wbmcuanMnO1xyXG5pbXBvcnQgcHVzaGVyX3N0cmFpZ2h0X29uX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvcHVzaGVyX3N0cmFpZ2h0X29uX3BuZy5qcyc7XHJcbmltcG9ydCBmb3JjZXNBbmRNb3Rpb25CYXNpY3MgZnJvbSAnLi4vLi4vZm9yY2VzQW5kTW90aW9uQmFzaWNzLmpzJztcclxuaW1wb3J0IE1vdGlvbkNvbnN0YW50cyBmcm9tICcuLi9Nb3Rpb25Db25zdGFudHMuanMnO1xyXG5cclxuY2xhc3MgUHVzaGVyTm9kZSBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yIGZvciBQdXNoZXJOb2RlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01vdGlvbk1vZGVsfSBtb2RlbCB0aGUgbW9kZWwgZm9yIHRoZSBlbnRpcmUgJ21vdGlvbicsICdmcmljdGlvbicgb3IgJ2FjY2VsZXJhdGlvbicgc2NyZWVuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxheW91dFdpZHRoIHdpZHRoIGZvciB0aGUgbGF5b3V0IGZvciBwdXJwb3NlcyBvZiBjZW50ZXJpbmcgdGhlIGNoYXJhY3RlciB3aGVuIHB1c2hpbmdcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCBsYXlvdXRXaWR0aCwgdGFuZGVtICkge1xyXG4gICAgY29uc3Qgc2NhbGUgPSAwLjk1O1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbGwgdGhlIGltYWdlcyB1cCBmcm9udCwgYWRkIGFzIGNoaWxkcmVuIGFuZCB0b2dnbGUgdGhlaXIgdmlzaWJsZSBmb3IgcGVyZm9ybWFuY2UgYW5kIHJlZHVjZWQgZ2FyYmFnZSBjb2xsZWN0aW9uXHJcbiAgICBjb25zdCBwdXNoaW5nUmlnaHROb2RlcyA9IFtdO1xyXG4gICAgY29uc3QgcHVzaGluZ0xlZnROb2RlcyA9IFtdO1xyXG4gICAgY29uc3QgY2hpbGRyZW4gPSBbXTtcclxuICAgIGNvbnN0IHN0YW5kaW5nVXAgPSBuZXcgSW1hZ2UoIHB1c2hlcl9zdHJhaWdodF9vbl9wbmcsIHtcclxuICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgcGlja2FibGU6IHRydWUsXHJcbiAgICAgIHNjYWxlOiBzY2FsZSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3RhbmRpbmdVcEltYWdlTm9kZScgKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgZmFsbExlZnQgPSBuZXcgSW1hZ2UoIHB1c2hlcl9mYWxsX2Rvd25fcG5nLCB7XHJcbiAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICBwaWNrYWJsZTogZmFsc2UsXHJcbiAgICAgIHNjYWxlOiBzY2FsZSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZmFsbExlZnRJbWFnZScgKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgZmFsbFJpZ2h0ID0gbmV3IEltYWdlKCBwdXNoZXJfZmFsbF9kb3duX3BuZywge1xyXG4gICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgcGlja2FibGU6IGZhbHNlLFxyXG4gICAgICBzY2FsZTogbmV3IFZlY3RvcjIoIC1zY2FsZSwgc2NhbGUgKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZmFsbFJpZ2h0SW1hZ2UnIClcclxuICAgIH0gKTtcclxuICAgIGxldCB2aXNpYmxlTm9kZSA9IHN0YW5kaW5nVXA7XHJcblxyXG4gICAgY2hpbGRyZW4ucHVzaCggc3RhbmRpbmdVcCApO1xyXG4gICAgY2hpbGRyZW4ucHVzaCggZmFsbExlZnQgKTtcclxuICAgIGNoaWxkcmVuLnB1c2goIGZhbGxSaWdodCApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDw9IDMwOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGltYWdlID0gaSA9PT0gMCA/IHB1c2hlcl8wX3BuZyA6XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9PT0gMSA/IHB1c2hlcl8xX3BuZyA6XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9PT0gMiA/IHB1c2hlcl8yX3BuZyA6XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9PT0gMyA/IHB1c2hlcl8zX3BuZyA6XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9PT0gNCA/IHB1c2hlcl80X3BuZyA6XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9PT0gNSA/IHB1c2hlcl81X3BuZyA6XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9PT0gNiA/IHB1c2hlcl82X3BuZyA6XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9PT0gNyA/IHB1c2hlcl83X3BuZyA6XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9PT0gOCA/IHB1c2hlcl84X3BuZyA6XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9PT0gOSA/IHB1c2hlcl85X3BuZyA6XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9PT0gMTAgPyBwdXNoZXJfMTBfcG5nIDpcclxuICAgICAgICAgICAgICAgICAgICBpID09PSAxMSA/IHB1c2hlcl8xMV9wbmcgOlxyXG4gICAgICAgICAgICAgICAgICAgIGkgPT09IDEyID8gcHVzaGVyXzEyX3BuZyA6XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9PT0gMTMgPyBwdXNoZXJfMTNfcG5nIDpcclxuICAgICAgICAgICAgICAgICAgICBpID09PSAxNCA/IHB1c2hlcl8xNF9wbmcgOlxyXG4gICAgICAgICAgICAgICAgICAgIGkgPT09IDE1ID8gcHVzaGVyXzE1X3BuZyA6XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9PT0gMTYgPyBwdXNoZXJfMTZfcG5nIDpcclxuICAgICAgICAgICAgICAgICAgICBpID09PSAxNyA/IHB1c2hlcl8xN19wbmcgOlxyXG4gICAgICAgICAgICAgICAgICAgIGkgPT09IDE4ID8gcHVzaGVyXzE4X3BuZyA6XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9PT0gMTkgPyBwdXNoZXJfMTlfcG5nIDpcclxuICAgICAgICAgICAgICAgICAgICBpID09PSAyMCA/IHB1c2hlcl8yMF9wbmcgOlxyXG4gICAgICAgICAgICAgICAgICAgIGkgPT09IDIxID8gcHVzaGVyXzIxX3BuZyA6XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9PT0gMjIgPyBwdXNoZXJfMjJfcG5nIDpcclxuICAgICAgICAgICAgICAgICAgICBpID09PSAyMyA/IHB1c2hlcl8yM19wbmcgOlxyXG4gICAgICAgICAgICAgICAgICAgIGkgPT09IDI0ID8gcHVzaGVyXzI0X3BuZyA6XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9PT0gMjUgPyBwdXNoZXJfMjVfcG5nIDpcclxuICAgICAgICAgICAgICAgICAgICBpID09PSAyNiA/IHB1c2hlcl8yNl9wbmcgOlxyXG4gICAgICAgICAgICAgICAgICAgIGkgPT09IDI3ID8gcHVzaGVyXzI3X3BuZyA6XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9PT0gMjggPyBwdXNoZXJfMjhfcG5nIDpcclxuICAgICAgICAgICAgICAgICAgICBpID09PSAyOSA/IHB1c2hlcl8yOV9wbmcgOlxyXG4gICAgICAgICAgICAgICAgICAgIGkgPT09IDMwID8gcHVzaGVyXzMwX3BuZyA6XHJcbiAgICAgICAgICAgICAgICAgICAgbnVsbDtcclxuICAgICAgY29uc3QgcmlnaHRJbWFnZU5vZGUgPSBuZXcgSW1hZ2UoIGltYWdlLCB7XHJcbiAgICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgcGlja2FibGU6IGZhbHNlLFxyXG4gICAgICAgIHNjYWxlOiBzY2FsZSxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oIGByaWdodEltYWdlTm9kZSR7aX1gIClcclxuICAgICAgfSApO1xyXG4gICAgICBjb25zdCBsZWZ0SW1hZ2VOb2RlID0gbmV3IEltYWdlKCBpbWFnZSwge1xyXG4gICAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgICBzY2FsZTogbmV3IFZlY3RvcjIoIC1zY2FsZSwgc2NhbGUgKSxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oIGBsZWZ0SW1hZ2VOb2RlJHtpfWAgKVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHB1c2hpbmdSaWdodE5vZGVzLnB1c2goIHJpZ2h0SW1hZ2VOb2RlICk7XHJcbiAgICAgIHB1c2hpbmdMZWZ0Tm9kZXMucHVzaCggbGVmdEltYWdlTm9kZSApO1xyXG4gICAgICBjaGlsZHJlbi5wdXNoKCByaWdodEltYWdlTm9kZSApO1xyXG4gICAgICBjaGlsZHJlbi5wdXNoKCBsZWZ0SW1hZ2VOb2RlICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc2V0VmlzaWJsZU5vZGUgPSBub2RlID0+IHtcclxuICAgICAgaWYgKCBub2RlICE9PSB2aXNpYmxlTm9kZSApIHtcclxuICAgICAgICB2aXNpYmxlTm9kZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdmlzaWJsZU5vZGUucGlja2FibGUgPSBmYWxzZTtcclxuICAgICAgICBub2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIG5vZGUucGlja2FibGUgPSB0cnVlO1xyXG4gICAgICAgIHZpc2libGVOb2RlID0gbm9kZTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICBjaGlsZHJlbjogY2hpbGRyZW4sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBpZiB0aGVyZSBhcmUgbm8gaXRlbXMgb24gdGhlIHN0YWNrLCB0aGUgbm9kZSBpcyBub3QgaW50ZXJhY3RpdmUgYW5kIHRoZVxyXG4gICAgLy8gZHJhZyBoYW5kbGVyIHdpbGwgbm90IGRvIGFueXRoaW5nXHJcbiAgICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIHBvc2l0aW9uIHdoZW4gdGhlIHB1c2hlciBpcyBub3QgYXBwbHlpbmcgZm9yY2UgKGZhbGxlbiBvciBzdGFuZGluZylcclxuICAgIGNvbnN0IHVwZGF0ZVplcm9Gb3JjZVBvc2l0aW9uID0geCA9PiB7XHJcbiAgICAgIGNvbnN0IHB1c2hlclkgPSAzNjIgLSB2aXNpYmxlTm9kZS5oZWlnaHQ7XHJcbiAgICAgIHZpc2libGVOb2RlLnRyYW5zbGF0ZSggeCwgcHVzaGVyWSAtIHZpc2libGVOb2RlLnksIHRydWUgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXNldCB0aGUgemVybyBmb3JjZSBwb3NpdGlvbiBzbyB0aGF0IHRoZSBwdXNoZXIgaXMgYXQgdGhlIGNvcnJlY3QgcGxhY2Ugd2hlbiB0aGUgcHVzaGVyIGZhbGxzIG92ZXIgb3Igd2hlblxyXG4gICAgICogYXBwbGllZCBmb3JjZSBpcyBzZXQgdG8gemVybyBhZnRlci4gIERlcGVuZGVudCBvbiB0aGUgd2lkdGggb2YgdGhlIGl0ZW0gc3RhY2ssIGRpcmVjdGlvbiB0aGUgcHVzaGVyIGZlbGwsIG9yIHRoZVxyXG4gICAgICogZGlyZWN0aW9uIHRoZSBwdXNoZXIgd2FzIGFwcGx5aW5nIGEgZm9yY2UgYmVmb3JlIHRoZSBmb3JjZSB3YXMgc2V0IHRvIHplcm8uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvbiBkZXNjcmlwdGlvblxyXG4gICAgICovXHJcbiAgICBjb25zdCByZXNldFplcm9Gb3JjZVBvc2l0aW9uID0gZGlyZWN0aW9uID0+IHtcclxuICAgICAgaWYgKCBtb2RlbC5zdGFjay5sZW5ndGggPiAwICkge1xyXG5cclxuICAgICAgICBjb25zdCBpdGVtID0gbW9kZWwuc3RhY2suZ2V0KCAwICk7XHJcblxyXG4gICAgICAgIC8vIGdldCB0aGUgc2NhbGVkIHdpZHRoIG9mIHRoZSBmaXJzdCBpbWFnZSBvbiB0aGUgc3RhY2tcclxuICAgICAgICBjb25zdCBzY2FsZWRXaWR0aCA9IGl0ZW0udmlldy5nZXRTY2FsZWRXaWR0aCgpO1xyXG5cclxuICAgICAgICAvLyBhZGQgYSBsaXR0bGUgbW9yZSBzcGFjZSAoMTApIHNvIHRoZSBwdXNoZXIgaXNuJ3QgZXhhY3RseSB0b3VjaGluZyB0aGUgc3RhY2tcclxuICAgICAgICBjb25zdCBkZWx0YSA9IHNjYWxlZFdpZHRoIC8gMiAtIGl0ZW0ucHVzaGVySW5zZXRQcm9wZXJ0eS5nZXQoKSArIDEwO1xyXG5cclxuICAgICAgICBpZiAoIGRpcmVjdGlvbiA9PT0gJ3JpZ2h0JyApIHtcclxuICAgICAgICAgIHZpc2libGVOb2RlLmNlbnRlclggPSBsYXlvdXRXaWR0aCAvIDIgLSB2aXNpYmxlTm9kZS53aWR0aCAvIDIgLSBkZWx0YTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB2aXNpYmxlTm9kZS5jZW50ZXJYID0gbGF5b3V0V2lkdGggLyAyICsgdmlzaWJsZU5vZGUud2lkdGggLyAyICsgZGVsdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlIHRoZSBwb3NpdGlvbiBvZiB0aGUgdmlzaWJsZSBub2RlIHdoZW4gZm9yY2UgaXMgYmVpbmcgYXBwbGllZCB0byB0aGUgc3RhY2suXHJcbiAgICAgKiBEZXBlbmRlbnQgb24gdGhlIHdpZHRoIG9mIHRoZSBzdGFjaywgdGhlIHdpZHRoIG9mIHRoZSB2aXNpYmxlIG5vZGUsIGFuZCBkaXJlY3Rpb25cclxuICAgICAqIG9mIHRoZSBhcHBsaWVkIGZvcmNlXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IHVwZGF0ZUFwcGxpZWRGb3JjZVBvc2l0aW9uID0gKCkgPT4ge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtb2RlbC5zdGFjay5sZW5ndGggPiAwICk7XHJcbiAgICAgIGNvbnN0IHB1c2hlclkgPSAzNjIgLSB2aXNpYmxlTm9kZS5oZWlnaHQ7XHJcbiAgICAgIGNvbnN0IGl0ZW0gPSBtb2RlbC5zdGFjay5nZXQoIDAgKTtcclxuXHJcbiAgICAgIC8vIGdldCB0aGUgc2NhbGVkIHdpZHRoIG9mIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBzdGFja1xyXG4gICAgICBjb25zdCBzY2FsZWRXaWR0aCA9IGl0ZW0udmlldy5nZXRTY2FsZWRXaWR0aCgpO1xyXG5cclxuICAgICAgY29uc3QgZGVsdGEgPSBzY2FsZWRXaWR0aCAvIDIgLSBpdGVtLnB1c2hlckluc2V0UHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgIGlmICggbW9kZWwuYXBwbGllZEZvcmNlUHJvcGVydHkuZ2V0KCkgPiAwICkge1xyXG4gICAgICAgIHZpc2libGVOb2RlLnNldFRyYW5zbGF0aW9uKCAoIGxheW91dFdpZHRoIC8gMiAtIHZpc2libGVOb2RlLndpZHRoIC0gZGVsdGEgKSwgcHVzaGVyWSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHZpc2libGVOb2RlLnNldFRyYW5zbGF0aW9uKCAoIGxheW91dFdpZHRoIC8gMiArIHZpc2libGVOb2RlLndpZHRoICsgZGVsdGEgKSwgcHVzaGVyWSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBpZiB0aGUgdXNlciBlbXB0aWVzIHRoZSBzdGFjaywgdGhlIHN0YW5kaW5nIGltYWdlIHNob3VsZCBiZSB3aGVyZSB0aGUgYXBwbGllZCBmb3JjZSBwb3NpdGlvbiB3YXNcclxuICAgICAgc3RhbmRpbmdVcC5jZW50ZXJYID0gdmlzaWJsZU5vZGUuY2VudGVyWDtcclxuICAgIH07XHJcblxyXG4gICAgLy8gZ2V0IG5ldyBwb3NpdGlvbiBmb3IgdGhlIHB1c2hlciBub2RlIHdoZW4gaGUgZmFsbHMgc28gdGhhdCBoZSBmYWxscyBiYWNrIGZyb21cclxuICAgIC8vIHRoZSBpdGVtIHN0YWNrIHdoZW4gaXQgaXMgbW92aW5nIHRvbyBxdWlja2x5XHJcbiAgICAvLyBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAgY29uc3QgZ2V0UHVzaGVyTm9kZURlbHRhWCA9ICgpID0+IHtcclxuICAgICAgLy8gdGhlIGNoYW5nZSBpbiBwb3NpdGlvbiBmb3IgdGhlIG1vZGVsXHJcbiAgICAgIGNvbnN0IG1vZGVsRGVsdGEgPSAtKCBtb2RlbC5wb3NpdGlvblByb3BlcnR5LmdldCgpIC0gbW9kZWwucHJldmlvdXNNb2RlbFBvc2l0aW9uICk7XHJcblxyXG4gICAgICAvLyByZXR1cm4sIHRyYW5zZm9ybWVkIGJ5IHRoZSB2aWV3IHNjYWxlXHJcbiAgICAgIHJldHVybiBtb2RlbERlbHRhICogTW90aW9uQ29uc3RhbnRzLlBPU0lUSU9OX1NDQUxFO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgd2hlbiB0aGUgcHVzaGVyIGhhcyBsZXQgZ28sIGVpdGhlciBmcm9tIGZhbGxpbmcgb3IgZnJvbSBzZXR0aW5nIHRoZVxyXG4gICAgICogYXBwbGllZCBmb3JjZSB0byB6ZXJvLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSAge05vZGV9IG5ld1Zpc2libGVOb2RlIC0gdmlzaWJsZU5vZGUsIHNob3VsZCBiZSBlaXRoZXIgZmFsbGluZyBvciBzdGFuZGluZyBpbWFnZXMgb2YgdGhlIHB1c2hlclxyXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSBkaXJlY3Rpb24gICAgICBkZXNjcmlwdGlvblxyXG4gICAgICovXHJcbiAgICBjb25zdCBwdXNoZXJMZXRHbyA9ICggbmV3VmlzaWJsZU5vZGUsIGRpcmVjdGlvbiApID0+IHtcclxuICAgICAgLy8gdXBkYXRlIHRoZSB2aXNpYmxlIG5vZGUgYW5kIHBsYWNlIGl0IGluIGEgcG9zaXRpb24gZGVwZW5kZW50IG9uIHRoZSBkaXJlY3Rpb25cclxuICAgICAgLy8gb2YgZmFsbGluZyBvciB0aGUgYXBwbGllZCBmb3JjZVxyXG4gICAgICBzZXRWaXNpYmxlTm9kZSggbmV3VmlzaWJsZU5vZGUgKTtcclxuICAgICAgcmVzZXRaZXJvRm9yY2VQb3NpdGlvbiggZGlyZWN0aW9uICk7XHJcblxyXG4gICAgICAvLyBnZXQgdGhlIHRyYW5zbGF0aW9uIGRlbHRhIGZyb20gdGhlIHRyYW5zZm9ybWVkIG1vZGVsIGRlbHRhIGFuZCB0cmFuc2xhdGVcclxuICAgICAgY29uc3QgeCA9IGdldFB1c2hlck5vZGVEZWx0YVgoKTtcclxuICAgICAgdXBkYXRlWmVyb0ZvcmNlUG9zaXRpb24oIHggKTtcclxuICAgIH07XHJcblxyXG4gICAgbW9kZWwuZmFsbGVuUHJvcGVydHkubGluayggZmFsbGVuID0+IHtcclxuICAgICAgaWYgKCBmYWxsZW4gKSB7XHJcbiAgICAgICAgY29uc3QgbmV3VmlzaWJsZU5vZGUgPSBtb2RlbC5mYWxsZW5EaXJlY3Rpb25Qcm9wZXJ0eS5nZXQoKSA9PT0gJ2xlZnQnID8gZmFsbExlZnQgOiBmYWxsUmlnaHQ7XHJcbiAgICAgICAgcHVzaGVyTGV0R28oIG5ld1Zpc2libGVOb2RlLCBtb2RlbC5mYWxsZW5EaXJlY3Rpb25Qcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIHRoZSBwdXNoZXIganVzdCBzdG9vZCB1cCBhZnRlciBmYWxsaW5nLCBzZXQgY2VudGVyIHN0YW5kaW5nIGltYWdlIGF0IHRoZSBjdXJyZW50XHJcbiAgICAgICAgLy8gZmFsbGVuIHBvc2l0aW9uXHJcbiAgICAgICAgc3RhbmRpbmdVcC5jZW50ZXJYID0gdmlzaWJsZU5vZGUuY2VudGVyWDtcclxuICAgICAgICBzZXRWaXNpYmxlTm9kZSggc3RhbmRpbmdVcCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgbW9kZWwuYXBwbGllZEZvcmNlUHJvcGVydHkubGluayggKCBhcHBsaWVkRm9yY2UsIHByZXZpb3VzQXBwbGllZEZvcmNlICkgPT4ge1xyXG4gICAgICBpZiAoIGFwcGxpZWRGb3JjZSA9PT0gMCApIHtcclxuICAgICAgICBwdXNoZXJMZXRHbyggc3RhbmRpbmdVcCwgcHJldmlvdXNBcHBsaWVkRm9yY2UgPiAwID8gJ3JpZ2h0JyA6ICdsZWZ0JyApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB1cGRhdGUgdmlzaWJpbGl0eSBhbmQgcG9zaXRpb24gaWYgcHVzaGVyIGlzIG9uIHNjcmVlbiBhbmQgaXMgc3RpbGwgYWJsZSB0byBwdXNoXHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gTWF0aC5taW4oIDMwLCBVdGlscy5yb3VuZFN5bW1ldHJpYyggTWF0aC5hYnMoIGFwcGxpZWRGb3JjZSAvIDUwMCAqIDMwICkgKSApO1xyXG4gICAgICAgIGlmICggYXBwbGllZEZvcmNlID4gMCApIHtcclxuICAgICAgICAgIHNldFZpc2libGVOb2RlKCBwdXNoaW5nUmlnaHROb2Rlc1sgaW5kZXggXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHNldFZpc2libGVOb2RlKCBwdXNoaW5nTGVmdE5vZGVzWyBpbmRleCBdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHVwZGF0ZUFwcGxpZWRGb3JjZVBvc2l0aW9uKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBpbml0aWFsaXplUHVzaGVyTm9kZSA9ICgpID0+IHtcclxuICAgICAgLy8gbWFrZCBzdXJlIHRoYXQgdGhlIHN0YW5kaW5nIG5vZGUgaXMgdmlzaWJsZSwgYW5kIHBsYWNlIGluIGluaXRpYWwgcG9zaXRpb25cclxuICAgICAgc2V0VmlzaWJsZU5vZGUoIHN0YW5kaW5nVXAgKTtcclxuICAgICAgdmlzaWJsZU5vZGUuY2VudGVyWCA9IGxheW91dFdpZHRoIC8gMiArICggbW9kZWwucHVzaGVyUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSAtIG1vZGVsLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKSAqIE1vdGlvbkNvbnN0YW50cy5QT1NJVElPTl9TQ0FMRTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gb24gcmVzZXQgYWxsLCB0aGUgbW9kZWwgc2hvdWxkIHNldCB0aGUgbm9kZSB0byB0aGUgaW5pdGlhbCBwdXNoZXIgcG9zaXRpb25cclxuICAgIG1vZGVsLnJlc2V0QWxsRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICBpbml0aWFsaXplUHVzaGVyTm9kZSgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHdoZW4gdGhlIHN0YWNrIGNvbXBvc2l0aW9uIGNoYW5nZXMsIHdlIHdhbnQgdG8gdXBkYXRlIHRoZSBhcHBsaWVkIGZvcmNlIHBvc2l0aW9uXHJcbiAgICAvLyBtb2RlbC5zdGFja1NpemUgZG9lcyBub3QgbmVlZCBhIGRpc3Bvc2UgZnVuY3Rpb24gc2luY2UgaXQgcGVyc2lzdHMgZm9yIHRoZSBkdXJhdGlvbiBvZiB0aGUgc2ltdWxhdGlvblxyXG4gICAgbW9kZWwuc3RhY2tTaXplUHJvcGVydHkubGluayggc3RhY2tTaXplID0+IHtcclxuICAgICAgaWYgKCBzdGFja1NpemUgPiAwICkge1xyXG4gICAgICAgIC8vIG9ubHkgZG8gdGhpcyBpZiB0aGUgcHVzaGVyIGlzIHN0YW5kaW5nIGFuZCB0aGVyZSBpcyBub24gemVybyBhcHBsaWVkIGZvcmNlXHJcbiAgICAgICAgaWYgKCAhbW9kZWwuZmFsbGVuUHJvcGVydHkuZ2V0KCkgJiYgbW9kZWwuYXBwbGllZEZvcmNlUHJvcGVydHkuZ2V0KCkgIT09IDAgKSB7XHJcbiAgICAgICAgICB1cGRhdGVBcHBsaWVkRm9yY2VQb3NpdGlvbigpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vVXBkYXRlIHRoZSByaWdodEltYWdlIGFuZCBwb3NpdGlvbiB3aGVuIHRoZSBtb2RlbCBjaGFuZ2VzXHJcbiAgICBtb2RlbC5wb3NpdGlvblByb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgaWYgKCBtb2RlbC5hcHBsaWVkRm9yY2VQcm9wZXJ0eS5nZXQoKSA9PT0gMCB8fCBtb2RlbC5mYWxsZW5Qcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICBjb25zdCB4ID0gZ2V0UHVzaGVyTm9kZURlbHRhWCgpO1xyXG4gICAgICAgIC8vIHRvIHNhdmUgcHJvY2Vzc29yIHRpbWUsIGRvbid0IHVwZGF0ZSBpZiB0aGUgcHVzaGVyIGlzIHRvbyBmYXIgb2ZmIHNjcmVlblxyXG4gICAgICAgIGlmICggTWF0aC5hYnMoIHggKSA8IDIwMDAgKSB7XHJcbiAgICAgICAgICB1cGRhdGVaZXJvRm9yY2VQb3NpdGlvbiggeCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGxpc3RlbmVyID0gbmV3IFNpbXBsZURyYWdIYW5kbGVyKCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RyYWdMaXN0ZW5lcicgKSxcclxuICAgICAgYWxsb3dUb3VjaFNuYWc6IHRydWUsXHJcbiAgICAgIHRyYW5zbGF0ZTogb3B0aW9ucyA9PiB7XHJcbiAgICAgICAgaWYgKCB0aGlzLmludGVyYWN0aXZlICkge1xyXG4gICAgICAgICAgY29uc3QgbmV3QXBwbGllZEZvcmNlID0gbW9kZWwuYXBwbGllZEZvcmNlUHJvcGVydHkuZ2V0KCkgKyBvcHRpb25zLmRlbHRhLng7XHJcbiAgICAgICAgICBjb25zdCBjbGFtcGVkQXBwbGllZEZvcmNlID0gTWF0aC5tYXgoIC01MDAsIE1hdGgubWluKCA1MDAsIG5ld0FwcGxpZWRGb3JjZSApICk7XHJcblxyXG4gICAgICAgICAgLy8gdGhlIG5ldyBmb3JjZSBzaG91bGQgYmUgcm91bmRlZCBzbyB0aGF0IGFwcGxpZWQgZm9yY2UgaXMgbm90XHJcbiAgICAgICAgICAvLyBtb3JlIHByZWNpc2UgdGhhbiBmcmljdGlvbiBmb3JjZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mb3JjZXMtYW5kLW1vdGlvbi1iYXNpY3MvaXNzdWVzLzE5N1xyXG4gICAgICAgICAgY29uc3Qgcm91bmRlZEZvcmNlID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIGNsYW1wZWRBcHBsaWVkRm9yY2UgKTtcclxuXHJcbiAgICAgICAgICAvL09ubHkgYXBwbHkgYSBmb3JjZSBpZiB0aGUgcHVzaGVyIGlzIG5vdCBmYWxsZW4sIHNlZSAjNDhcclxuICAgICAgICAgIGlmICggIW1vZGVsLmZhbGxlblByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgICAgICBtb2RlbC5hcHBsaWVkRm9yY2VQcm9wZXJ0eS5zZXQoIHJvdW5kZWRGb3JjZSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIHN0YXJ0OiAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCB0aGlzLmludGVyYWN0aXZlICkge1xyXG5cclxuICAgICAgICAgIC8vIGlmIHRoZSB1c2VyIGludGVyYWN0cyB3aXRoIHRoZSBwdXNoZXIsIHJlc3VtZSBtb2RlbCAncGxheWluZycgc28gdGhhdCB0aGUgc2ltIGRvZXMgbm90IHNlZW0gYnJva2VuXHJcbiAgICAgICAgICBpZiAoICFtb2RlbC5wbGF5UHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICAgIG1vZGVsLnBsYXlQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBlbmQ6ICgpID0+IHtcclxuICAgICAgICBpZiAoIHRoaXMuaW50ZXJhY3RpdmUgKSB7XHJcblxyXG4gICAgICAgICAgLy8gaWYgdGhlIG1vZGVsIGlzIHBhdXNlZCwgdGhlIGFwcGxpZWQgZm9yY2Ugc2hvdWxkIHJlbWFpbiB0aGUgc2FtZVxyXG4gICAgICAgICAgaWYgKCBtb2RlbC5wbGF5UHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICAgIG1vZGVsLmFwcGxpZWRGb3JjZVByb3BlcnR5LnNldCggMCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCBsaXN0ZW5lciApO1xyXG5cclxuICAgIC8vTWFrZSBpdCBzbyB5b3UgY2Fubm90IGRyYWcgdGhlIHB1c2hlciB1bnRpbCBvbmUgSXRlbU5vZGUgaXMgaW4gdGhlIHBsYXkgYXJlYVxyXG4gICAgbW9kZWwuc3RhY2subGVuZ3RoUHJvcGVydHkubGluayggbGVuZ3RoID0+IHtcclxuICAgICAgaWYgKCBsZW5ndGggPT09IDAgKSB7XHJcbiAgICAgICAgdGhpcy5jdXJzb3IgPSAnZGVmYXVsdCc7XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcGxhY2UgdGhlIHB1c2hlciBpbiB0aGUgY29ycmVjdCBwb3NpdGlvbiBpbml0aWFsbHlcclxuICAgIGluaXRpYWxpemVQdXNoZXJOb2RlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5mb3JjZXNBbmRNb3Rpb25CYXNpY3MucmVnaXN0ZXIoICdQdXNoZXJOb2RlJywgUHVzaGVyTm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUHVzaGVyTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELFNBQVNDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxpQkFBaUIsUUFBUSxtQ0FBbUM7QUFDbEYsT0FBT0MsWUFBWSxNQUFNLGlDQUFpQztBQUMxRCxPQUFPQyxhQUFhLE1BQU0sa0NBQWtDO0FBQzVELE9BQU9DLGFBQWEsTUFBTSxrQ0FBa0M7QUFDNUQsT0FBT0MsYUFBYSxNQUFNLGtDQUFrQztBQUM1RCxPQUFPQyxhQUFhLE1BQU0sa0NBQWtDO0FBQzVELE9BQU9DLGFBQWEsTUFBTSxrQ0FBa0M7QUFDNUQsT0FBT0MsYUFBYSxNQUFNLGtDQUFrQztBQUM1RCxPQUFPQyxhQUFhLE1BQU0sa0NBQWtDO0FBQzVELE9BQU9DLGFBQWEsTUFBTSxrQ0FBa0M7QUFDNUQsT0FBT0MsYUFBYSxNQUFNLGtDQUFrQztBQUM1RCxPQUFPQyxhQUFhLE1BQU0sa0NBQWtDO0FBQzVELE9BQU9DLFlBQVksTUFB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