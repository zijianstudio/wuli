// Copyright 2013-2023, University of Colorado Boulder

/**
 * Shows the draggable node for any of the items in the Motion, Friction and Acceleration screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Image, Node, Rectangle, SimpleDragHandler, Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import forcesAndMotionBasics from '../../forcesAndMotionBasics.js';
import ForcesAndMotionBasicsStrings from '../../ForcesAndMotionBasicsStrings.js';
const pattern0MassUnitsKilogramsString = ForcesAndMotionBasicsStrings.pattern['0massUnitsKilograms'];

//Workaround for https://github.com/phetsims/scenery/issues/108
const IDENTITY = Matrix3.scaling(1, 1);
class ItemNode extends Node {
  /**
   * Constructor for ItemNode
   * @param {MotionModel} model the entire model for the containing screen
   * @param {MotionScreenView} motionView the entire view for the containing screen
   * @param {Item} item the corresponding to this ItemNode
   * @param {Image} normalImage the phet.scenery.Image to show for this node
   * @param {Image} sittingImage optional image for when the person is sitting down
   * @param {Image} holdingImage optional image for when the person is holding an object
   * @param {Property} showMassesProperty property for whether the mass value should be shown
   * @param {Rectangle} itemToolbox - The toolbox that contains this item
   */
  constructor(model, motionView, item, normalImage, sittingImage, holdingImage, showMassesProperty, itemToolbox, tandem) {
    super({
      cursor: 'pointer',
      scale: item.imageScaleProperty.get(),
      tandem: tandem
    });
    this.item = item;
    this.uniqueId = this.id; // use node to generate a specific id to quickly find this element in the parallel DOM.

    // translate this node to the item's position
    this.translate(item.positionProperty.get());

    //Create the node for the main graphic
    const normalImageNode = new Image(normalImage, {
      tandem: tandem.createTandem('normalImageNode')
    });
    this.normalImageNode = normalImageNode;

    // keep track of the sitting image to track its width for the pusher
    // @public (read-only)
    this.sittingImage = new Image(sittingImage, {
      tandem: tandem.createTandem('sittingImageNode')
    });

    //When the model changes, update the image position as well as which image is shown
    const updateImage = () => {
      // var centerX = normalImageNode.centerX;
      if (typeof holdingImage !== 'undefined' && item.armsUp() && item.onBoardProperty.get()) {
        normalImageNode.image = holdingImage;
      } else if (item.onBoardProperty.get() && typeof sittingImage !== 'undefined') {
        normalImageNode.image = sittingImage;
      } else {
        normalImageNode.image = normalImage;
      }
      if (this.labelNode) {
        this.updateLabelPosition();
      }
    };

    // Make sure the arms are updated (even if nothing else changed)
    // TODO: It is possible that this can be removed once these issues are closed, see
    // https://github.com/phetsims/forces-and-motion-basics/issues/240
    // https://github.com/phetsims/axon/issues/135
    Tandem.PHET_IO_ENABLED && phet.phetio.phetioEngine.phetioStateEngine.stateSetEmitter.addListener(updateImage);
    for (let i = 0; i < model.items.length; i++) {
      model.items[i].draggingProperty.link(updateImage);
    }
    model.stack.lengthProperty.link(updateImage);

    //When the user drags the object, start
    const moveToStack = () => {
      item.onBoardProperty.set(true);
      const imageWidth = item.getCurrentScale() * normalImageNode.width;
      item.animateTo(motionView.layoutBounds.width / 2 - imageWidth / 2 + item.centeringOffset, motionView.topOfStack - this.height, 'stack');
      model.stack.add(item);
      if (model.stack.length > 3) {
        model.spliceStackBottom();
      }
    };

    // called on end drag, update direction of girl or man to match current applied force and velocity of model
    const updatePersonDirection = person => {
      // default direction is to the left
      let direction = 'left';

      // if girl or man is alread on the stack, direction should match person that is already on the stack
      let personInStack;
      for (let i = 0; i < model.stack.length; i++) {
        const itemInStack = model.stack.get(i);
        if (itemInStack === person) {
          // skip the person that is currently being dragged
          continue;
        }
        if (itemInStack.name === 'girl' || itemInStack.name === 'man') {
          personInStack = itemInStack;
        }
      }
      if (personInStack) {
        direction = personInStack.directionProperty.get();
      } else if (person.context.appliedForceProperty.get() !== 0) {
        // if there is an applied force on the stack, direction should match applied force
        if (person.context.appliedForceProperty.get() > 0) {
          direction = 'right';
        } else {
          direction = 'left';
        }
      } else {
        // if there is no applied force, check velocity for direction
        if (person.context.velocityProperty.get() > 0) {
          direction = 'right';
        }
      }
      person.directionProperty.set(direction);
    };
    const dragHandler = new SimpleDragHandler({
      tandem: tandem.createTandem('dragListener'),
      translate: options => {
        item.positionProperty.set(options.position);
      },
      //When picking up an object, remove it from the stack.
      start: () => {
        //Move it to front (z-order)
        this.moveToFront();

        // move the parent toolbox to the front so that items of one toolbox are not in front of another
        // itemToolbox is in a container so it should not occlude other items in the screen view
        itemToolbox.moveToFront();
        item.draggingProperty.set(true);
        const index = model.stack.indexOf(item);
        if (index >= 0) {
          model.spliceStack(index);
        }
        item.onBoardProperty.set(false);

        //Don't allow the user to translate the object while it is animating
        item.cancelAnimation();
      },
      //End the drag
      end: () => {
        item.draggingProperty.set(false);
        //If the user drops it above the ground, move to the top of the stack on the skateboard, otherwise go back to the original position.
        if (item.positionProperty.get().y < 350) {
          moveToStack();

          // if item is man or girl, rotate depending on the current model velocity and applied force
          if (item.name === 'man' || item.name === 'girl') {
            updatePersonDirection(item);
          }
        } else {
          // send the item home and make sure that the label is centered
          item.animateHome();
          this.labelNode.centerX = normalImageNode.centerX;
        }
      }
    });
    this.addInputListener(dragHandler);

    // if the item is being dragged, cancel the drag on reset
    model.resetAllEmitter.addListener(() => {
      // cancel the drag and reset item
      if (item.draggingProperty.get()) {
        dragHandler.interrupt();
        item.reset();
      }
    });

    //Label for the mass (if it is shown)
    const massLabelText = new Text(item.mystery ? '?' : StringUtils.format(pattern0MassUnitsKilogramsString, item.mass), {
      font: new PhetFont({
        size: 15,
        weight: 'bold'
      }),
      maxWidth: normalImageNode.width / 1.5,
      tandem: tandem.createTandem('massLabelText')
    });
    const roundedRadius = 10;
    const roundRect = new Rectangle(0, 0, massLabelText.width + roundedRadius, massLabelText.height + roundedRadius, roundedRadius, roundedRadius, {
      fill: 'white',
      stroke: 'gray'
    }).mutate({
      centerX: massLabelText.centerX,
      centerY: massLabelText.centerY
    });

    // the label needs to be scaled back up after the image was scaled down
    // normalize the maximum width to then restrict the labels for i18n
    const labelText = new Node({
      children: [roundRect, massLabelText],
      scale: 1.0 / item.imageScaleProperty.get(),
      tandem: tandem.createTandem('labelText')
    });
    this.labelNode = labelText;

    //Update the position of the item
    item.positionProperty.link(position => {
      this.setTranslation(position);
    });

    // When the object is scaled or change direction, update the image part
    Multilink.multilink([item.interactionScaleProperty, item.directionProperty], (interactionScale, direction) => {
      const scale = item.imageScaleProperty.get() * interactionScale;
      this.setScaleMagnitude(scale);

      // make sure that labels remain the same size
      labelText.setScaleMagnitude(1 / scale);
      normalImageNode.setMatrix(IDENTITY);
      if (direction === 'right') {
        // store the center so that it can be reapplied after change in scale
        const centerX = normalImageNode.centerX;
        normalImageNode.scale(-1, 1);

        // reapply the center
        normalImageNode.centerX = centerX;
      }

      // when scale or direction change, make sure that the label is still centered
      this.updateLabelPosition();
    });
    item.onBoardProperty.link(updateImage);
    this.addChild(normalImageNode);
    this.addChild(labelText);
    showMassesProperty.link(showMasses => {
      labelText.visible = showMasses;
    });
  }

  /**
   * Set the label position relative to the bottom of the image.
   * @private
   */
  updateLabelPosition() {
    this.labelNode.bottom = this.normalImageNode.height - 5;
    this.labelNode.centerX = this.normalImageNode.centerX;
  }

  /**
   * Get the width of this item node, modified by the current scale factor.  If the item
   * is using its sitting representation, use that to get the scaled width
   *
   * @returns {number}
   * @public
   */
  getScaledWidth() {
    // if the item has a sitting image, use that image for the width
    let scaledWidth;
    if (this.sittingImage) {
      scaledWidth = this.sittingImage.width * this.item.getCurrentScale();
    } else {
      scaledWidth = this.normalImageNode.width * this.item.getCurrentScale();
    }
    return scaledWidth;
  }
}
forcesAndMotionBasics.register('ItemNode', ItemNode);
export default ItemNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJNYXRyaXgzIiwiU3RyaW5nVXRpbHMiLCJQaGV0Rm9udCIsIkltYWdlIiwiTm9kZSIsIlJlY3RhbmdsZSIsIlNpbXBsZURyYWdIYW5kbGVyIiwiVGV4dCIsIlRhbmRlbSIsImZvcmNlc0FuZE1vdGlvbkJhc2ljcyIsIkZvcmNlc0FuZE1vdGlvbkJhc2ljc1N0cmluZ3MiLCJwYXR0ZXJuME1hc3NVbml0c0tpbG9ncmFtc1N0cmluZyIsInBhdHRlcm4iLCJJREVOVElUWSIsInNjYWxpbmciLCJJdGVtTm9kZSIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJtb3Rpb25WaWV3IiwiaXRlbSIsIm5vcm1hbEltYWdlIiwic2l0dGluZ0ltYWdlIiwiaG9sZGluZ0ltYWdlIiwic2hvd01hc3Nlc1Byb3BlcnR5IiwiaXRlbVRvb2xib3giLCJ0YW5kZW0iLCJjdXJzb3IiLCJzY2FsZSIsImltYWdlU2NhbGVQcm9wZXJ0eSIsImdldCIsInVuaXF1ZUlkIiwiaWQiLCJ0cmFuc2xhdGUiLCJwb3NpdGlvblByb3BlcnR5Iiwibm9ybWFsSW1hZ2VOb2RlIiwiY3JlYXRlVGFuZGVtIiwidXBkYXRlSW1hZ2UiLCJhcm1zVXAiLCJvbkJvYXJkUHJvcGVydHkiLCJpbWFnZSIsImxhYmVsTm9kZSIsInVwZGF0ZUxhYmVsUG9zaXRpb24iLCJQSEVUX0lPX0VOQUJMRUQiLCJwaGV0IiwicGhldGlvIiwicGhldGlvRW5naW5lIiwicGhldGlvU3RhdGVFbmdpbmUiLCJzdGF0ZVNldEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImkiLCJpdGVtcyIsImxlbmd0aCIsImRyYWdnaW5nUHJvcGVydHkiLCJsaW5rIiwic3RhY2siLCJsZW5ndGhQcm9wZXJ0eSIsIm1vdmVUb1N0YWNrIiwic2V0IiwiaW1hZ2VXaWR0aCIsImdldEN1cnJlbnRTY2FsZSIsIndpZHRoIiwiYW5pbWF0ZVRvIiwibGF5b3V0Qm91bmRzIiwiY2VudGVyaW5nT2Zmc2V0IiwidG9wT2ZTdGFjayIsImhlaWdodCIsImFkZCIsInNwbGljZVN0YWNrQm90dG9tIiwidXBkYXRlUGVyc29uRGlyZWN0aW9uIiwicGVyc29uIiwiZGlyZWN0aW9uIiwicGVyc29uSW5TdGFjayIsIml0ZW1JblN0YWNrIiwibmFtZSIsImRpcmVjdGlvblByb3BlcnR5IiwiY29udGV4dCIsImFwcGxpZWRGb3JjZVByb3BlcnR5IiwidmVsb2NpdHlQcm9wZXJ0eSIsImRyYWdIYW5kbGVyIiwib3B0aW9ucyIsInBvc2l0aW9uIiwic3RhcnQiLCJtb3ZlVG9Gcm9udCIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZVN0YWNrIiwiY2FuY2VsQW5pbWF0aW9uIiwiZW5kIiwieSIsImFuaW1hdGVIb21lIiwiY2VudGVyWCIsImFkZElucHV0TGlzdGVuZXIiLCJyZXNldEFsbEVtaXR0ZXIiLCJpbnRlcnJ1cHQiLCJyZXNldCIsIm1hc3NMYWJlbFRleHQiLCJteXN0ZXJ5IiwiZm9ybWF0IiwibWFzcyIsImZvbnQiLCJzaXplIiwid2VpZ2h0IiwibWF4V2lkdGgiLCJyb3VuZGVkUmFkaXVzIiwicm91bmRSZWN0IiwiZmlsbCIsInN0cm9rZSIsIm11dGF0ZSIsImNlbnRlclkiLCJsYWJlbFRleHQiLCJjaGlsZHJlbiIsInNldFRyYW5zbGF0aW9uIiwibXVsdGlsaW5rIiwiaW50ZXJhY3Rpb25TY2FsZVByb3BlcnR5IiwiaW50ZXJhY3Rpb25TY2FsZSIsInNldFNjYWxlTWFnbml0dWRlIiwic2V0TWF0cml4IiwiYWRkQ2hpbGQiLCJzaG93TWFzc2VzIiwidmlzaWJsZSIsImJvdHRvbSIsImdldFNjYWxlZFdpZHRoIiwic2NhbGVkV2lkdGgiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkl0ZW1Ob2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNob3dzIHRoZSBkcmFnZ2FibGUgbm9kZSBmb3IgYW55IG9mIHRoZSBpdGVtcyBpbiB0aGUgTW90aW9uLCBGcmljdGlvbiBhbmQgQWNjZWxlcmF0aW9uIHNjcmVlbnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBJbWFnZSwgTm9kZSwgUmVjdGFuZ2xlLCBTaW1wbGVEcmFnSGFuZGxlciwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBmb3JjZXNBbmRNb3Rpb25CYXNpY3MgZnJvbSAnLi4vLi4vZm9yY2VzQW5kTW90aW9uQmFzaWNzLmpzJztcclxuaW1wb3J0IEZvcmNlc0FuZE1vdGlvbkJhc2ljc1N0cmluZ3MgZnJvbSAnLi4vLi4vRm9yY2VzQW5kTW90aW9uQmFzaWNzU3RyaW5ncy5qcyc7XHJcblxyXG5jb25zdCBwYXR0ZXJuME1hc3NVbml0c0tpbG9ncmFtc1N0cmluZyA9IEZvcmNlc0FuZE1vdGlvbkJhc2ljc1N0cmluZ3MucGF0dGVyblsgJzBtYXNzVW5pdHNLaWxvZ3JhbXMnIF07XHJcblxyXG4vL1dvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMDhcclxuY29uc3QgSURFTlRJVFkgPSBNYXRyaXgzLnNjYWxpbmcoIDEsIDEgKTtcclxuXHJcbmNsYXNzIEl0ZW1Ob2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yIGZvciBJdGVtTm9kZVxyXG4gICAqIEBwYXJhbSB7TW90aW9uTW9kZWx9IG1vZGVsIHRoZSBlbnRpcmUgbW9kZWwgZm9yIHRoZSBjb250YWluaW5nIHNjcmVlblxyXG4gICAqIEBwYXJhbSB7TW90aW9uU2NyZWVuVmlld30gbW90aW9uVmlldyB0aGUgZW50aXJlIHZpZXcgZm9yIHRoZSBjb250YWluaW5nIHNjcmVlblxyXG4gICAqIEBwYXJhbSB7SXRlbX0gaXRlbSB0aGUgY29ycmVzcG9uZGluZyB0byB0aGlzIEl0ZW1Ob2RlXHJcbiAgICogQHBhcmFtIHtJbWFnZX0gbm9ybWFsSW1hZ2UgdGhlIHBoZXQuc2NlbmVyeS5JbWFnZSB0byBzaG93IGZvciB0aGlzIG5vZGVcclxuICAgKiBAcGFyYW0ge0ltYWdlfSBzaXR0aW5nSW1hZ2Ugb3B0aW9uYWwgaW1hZ2UgZm9yIHdoZW4gdGhlIHBlcnNvbiBpcyBzaXR0aW5nIGRvd25cclxuICAgKiBAcGFyYW0ge0ltYWdlfSBob2xkaW5nSW1hZ2Ugb3B0aW9uYWwgaW1hZ2UgZm9yIHdoZW4gdGhlIHBlcnNvbiBpcyBob2xkaW5nIGFuIG9iamVjdFxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHl9IHNob3dNYXNzZXNQcm9wZXJ0eSBwcm9wZXJ0eSBmb3Igd2hldGhlciB0aGUgbWFzcyB2YWx1ZSBzaG91bGQgYmUgc2hvd25cclxuICAgKiBAcGFyYW0ge1JlY3RhbmdsZX0gaXRlbVRvb2xib3ggLSBUaGUgdG9vbGJveCB0aGF0IGNvbnRhaW5zIHRoaXMgaXRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgbW90aW9uVmlldywgaXRlbSwgbm9ybWFsSW1hZ2UsIHNpdHRpbmdJbWFnZSwgaG9sZGluZ0ltYWdlLCBzaG93TWFzc2VzUHJvcGVydHksIGl0ZW1Ub29sYm94LCB0YW5kZW0gKSB7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgIHNjYWxlOiBpdGVtLmltYWdlU2NhbGVQcm9wZXJ0eS5nZXQoKSxcclxuXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5pdGVtID0gaXRlbTtcclxuXHJcbiAgICB0aGlzLnVuaXF1ZUlkID0gdGhpcy5pZDsgLy8gdXNlIG5vZGUgdG8gZ2VuZXJhdGUgYSBzcGVjaWZpYyBpZCB0byBxdWlja2x5IGZpbmQgdGhpcyBlbGVtZW50IGluIHRoZSBwYXJhbGxlbCBET00uXHJcblxyXG4gICAgLy8gdHJhbnNsYXRlIHRoaXMgbm9kZSB0byB0aGUgaXRlbSdzIHBvc2l0aW9uXHJcbiAgICB0aGlzLnRyYW5zbGF0ZSggaXRlbS5wb3NpdGlvblByb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgLy9DcmVhdGUgdGhlIG5vZGUgZm9yIHRoZSBtYWluIGdyYXBoaWNcclxuICAgIGNvbnN0IG5vcm1hbEltYWdlTm9kZSA9IG5ldyBJbWFnZSggbm9ybWFsSW1hZ2UsIHsgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbm9ybWFsSW1hZ2VOb2RlJyApIH0gKTtcclxuICAgIHRoaXMubm9ybWFsSW1hZ2VOb2RlID0gbm9ybWFsSW1hZ2VOb2RlO1xyXG5cclxuICAgIC8vIGtlZXAgdHJhY2sgb2YgdGhlIHNpdHRpbmcgaW1hZ2UgdG8gdHJhY2sgaXRzIHdpZHRoIGZvciB0aGUgcHVzaGVyXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpXHJcbiAgICB0aGlzLnNpdHRpbmdJbWFnZSA9IG5ldyBJbWFnZSggc2l0dGluZ0ltYWdlLCB7IHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NpdHRpbmdJbWFnZU5vZGUnICkgfSApO1xyXG5cclxuICAgIC8vV2hlbiB0aGUgbW9kZWwgY2hhbmdlcywgdXBkYXRlIHRoZSBpbWFnZSBwb3NpdGlvbiBhcyB3ZWxsIGFzIHdoaWNoIGltYWdlIGlzIHNob3duXHJcbiAgICBjb25zdCB1cGRhdGVJbWFnZSA9ICgpID0+IHtcclxuICAgICAgLy8gdmFyIGNlbnRlclggPSBub3JtYWxJbWFnZU5vZGUuY2VudGVyWDtcclxuICAgICAgaWYgKCAoIHR5cGVvZiBob2xkaW5nSW1hZ2UgIT09ICd1bmRlZmluZWQnICkgJiYgKCBpdGVtLmFybXNVcCgpICYmIGl0ZW0ub25Cb2FyZFByb3BlcnR5LmdldCgpICkgKSB7XHJcbiAgICAgICAgbm9ybWFsSW1hZ2VOb2RlLmltYWdlID0gaG9sZGluZ0ltYWdlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBpdGVtLm9uQm9hcmRQcm9wZXJ0eS5nZXQoKSAmJiB0eXBlb2Ygc2l0dGluZ0ltYWdlICE9PSAndW5kZWZpbmVkJyApIHtcclxuICAgICAgICBub3JtYWxJbWFnZU5vZGUuaW1hZ2UgPSBzaXR0aW5nSW1hZ2U7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgbm9ybWFsSW1hZ2VOb2RlLmltYWdlID0gbm9ybWFsSW1hZ2U7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCB0aGlzLmxhYmVsTm9kZSApIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZUxhYmVsUG9zaXRpb24oKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBNYWtlIHN1cmUgdGhlIGFybXMgYXJlIHVwZGF0ZWQgKGV2ZW4gaWYgbm90aGluZyBlbHNlIGNoYW5nZWQpXHJcbiAgICAvLyBUT0RPOiBJdCBpcyBwb3NzaWJsZSB0aGF0IHRoaXMgY2FuIGJlIHJlbW92ZWQgb25jZSB0aGVzZSBpc3N1ZXMgYXJlIGNsb3NlZCwgc2VlXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZm9yY2VzLWFuZC1tb3Rpb24tYmFzaWNzL2lzc3Vlcy8yNDBcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9heG9uL2lzc3Vlcy8xMzVcclxuICAgIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgJiYgcGhldC5waGV0aW8ucGhldGlvRW5naW5lLnBoZXRpb1N0YXRlRW5naW5lLnN0YXRlU2V0RW1pdHRlci5hZGRMaXN0ZW5lciggdXBkYXRlSW1hZ2UgKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBtb2RlbC5pdGVtcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgbW9kZWwuaXRlbXNbIGkgXS5kcmFnZ2luZ1Byb3BlcnR5LmxpbmsoIHVwZGF0ZUltYWdlICk7XHJcbiAgICB9XHJcblxyXG4gICAgbW9kZWwuc3RhY2subGVuZ3RoUHJvcGVydHkubGluayggdXBkYXRlSW1hZ2UgKTtcclxuXHJcbiAgICAvL1doZW4gdGhlIHVzZXIgZHJhZ3MgdGhlIG9iamVjdCwgc3RhcnRcclxuICAgIGNvbnN0IG1vdmVUb1N0YWNrID0gKCkgPT4ge1xyXG4gICAgICBpdGVtLm9uQm9hcmRQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgICAgY29uc3QgaW1hZ2VXaWR0aCA9IGl0ZW0uZ2V0Q3VycmVudFNjYWxlKCkgKiBub3JtYWxJbWFnZU5vZGUud2lkdGg7XHJcbiAgICAgIGl0ZW0uYW5pbWF0ZVRvKCBtb3Rpb25WaWV3LmxheW91dEJvdW5kcy53aWR0aCAvIDIgLSBpbWFnZVdpZHRoIC8gMiArIGl0ZW0uY2VudGVyaW5nT2Zmc2V0LCBtb3Rpb25WaWV3LnRvcE9mU3RhY2sgLSB0aGlzLmhlaWdodCwgJ3N0YWNrJyApO1xyXG4gICAgICBtb2RlbC5zdGFjay5hZGQoIGl0ZW0gKTtcclxuICAgICAgaWYgKCBtb2RlbC5zdGFjay5sZW5ndGggPiAzICkge1xyXG4gICAgICAgIG1vZGVsLnNwbGljZVN0YWNrQm90dG9tKCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gY2FsbGVkIG9uIGVuZCBkcmFnLCB1cGRhdGUgZGlyZWN0aW9uIG9mIGdpcmwgb3IgbWFuIHRvIG1hdGNoIGN1cnJlbnQgYXBwbGllZCBmb3JjZSBhbmQgdmVsb2NpdHkgb2YgbW9kZWxcclxuICAgIGNvbnN0IHVwZGF0ZVBlcnNvbkRpcmVjdGlvbiA9IHBlcnNvbiA9PiB7XHJcblxyXG4gICAgICAvLyBkZWZhdWx0IGRpcmVjdGlvbiBpcyB0byB0aGUgbGVmdFxyXG4gICAgICBsZXQgZGlyZWN0aW9uID0gJ2xlZnQnO1xyXG5cclxuICAgICAgLy8gaWYgZ2lybCBvciBtYW4gaXMgYWxyZWFkIG9uIHRoZSBzdGFjaywgZGlyZWN0aW9uIHNob3VsZCBtYXRjaCBwZXJzb24gdGhhdCBpcyBhbHJlYWR5IG9uIHRoZSBzdGFja1xyXG4gICAgICBsZXQgcGVyc29uSW5TdGFjaztcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbW9kZWwuc3RhY2subGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgaXRlbUluU3RhY2sgPSBtb2RlbC5zdGFjay5nZXQoIGkgKTtcclxuXHJcbiAgICAgICAgaWYgKCBpdGVtSW5TdGFjayA9PT0gcGVyc29uICkge1xyXG4gICAgICAgICAgLy8gc2tpcCB0aGUgcGVyc29uIHRoYXQgaXMgY3VycmVudGx5IGJlaW5nIGRyYWdnZWRcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIGl0ZW1JblN0YWNrLm5hbWUgPT09ICdnaXJsJyB8fCBpdGVtSW5TdGFjay5uYW1lID09PSAnbWFuJyApIHtcclxuICAgICAgICAgIHBlcnNvbkluU3RhY2sgPSBpdGVtSW5TdGFjaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBwZXJzb25JblN0YWNrICkge1xyXG4gICAgICAgIGRpcmVjdGlvbiA9IHBlcnNvbkluU3RhY2suZGlyZWN0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHBlcnNvbi5jb250ZXh0LmFwcGxpZWRGb3JjZVByb3BlcnR5LmdldCgpICE9PSAwICkge1xyXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGFwcGxpZWQgZm9yY2Ugb24gdGhlIHN0YWNrLCBkaXJlY3Rpb24gc2hvdWxkIG1hdGNoIGFwcGxpZWQgZm9yY2VcclxuICAgICAgICBpZiAoIHBlcnNvbi5jb250ZXh0LmFwcGxpZWRGb3JjZVByb3BlcnR5LmdldCgpID4gMCApIHtcclxuICAgICAgICAgIGRpcmVjdGlvbiA9ICdyaWdodCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgZGlyZWN0aW9uID0gJ2xlZnQnO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBubyBhcHBsaWVkIGZvcmNlLCBjaGVjayB2ZWxvY2l0eSBmb3IgZGlyZWN0aW9uXHJcbiAgICAgICAgaWYgKCBwZXJzb24uY29udGV4dC52ZWxvY2l0eVByb3BlcnR5LmdldCgpID4gMCApIHtcclxuICAgICAgICAgIGRpcmVjdGlvbiA9ICdyaWdodCc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHBlcnNvbi5kaXJlY3Rpb25Qcm9wZXJ0eS5zZXQoIGRpcmVjdGlvbiApO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBkcmFnSGFuZGxlciA9IG5ldyBTaW1wbGVEcmFnSGFuZGxlcigge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdkcmFnTGlzdGVuZXInICksXHJcbiAgICAgIHRyYW5zbGF0ZTogb3B0aW9ucyA9PiB7XHJcbiAgICAgICAgaXRlbS5wb3NpdGlvblByb3BlcnR5LnNldCggb3B0aW9ucy5wb3NpdGlvbiApO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy9XaGVuIHBpY2tpbmcgdXAgYW4gb2JqZWN0LCByZW1vdmUgaXQgZnJvbSB0aGUgc3RhY2suXHJcbiAgICAgIHN0YXJ0OiAoKSA9PiB7XHJcblxyXG4gICAgICAgIC8vTW92ZSBpdCB0byBmcm9udCAoei1vcmRlcilcclxuICAgICAgICB0aGlzLm1vdmVUb0Zyb250KCk7XHJcblxyXG4gICAgICAgIC8vIG1vdmUgdGhlIHBhcmVudCB0b29sYm94IHRvIHRoZSBmcm9udCBzbyB0aGF0IGl0ZW1zIG9mIG9uZSB0b29sYm94IGFyZSBub3QgaW4gZnJvbnQgb2YgYW5vdGhlclxyXG4gICAgICAgIC8vIGl0ZW1Ub29sYm94IGlzIGluIGEgY29udGFpbmVyIHNvIGl0IHNob3VsZCBub3Qgb2NjbHVkZSBvdGhlciBpdGVtcyBpbiB0aGUgc2NyZWVuIHZpZXdcclxuICAgICAgICBpdGVtVG9vbGJveC5tb3ZlVG9Gcm9udCgpO1xyXG5cclxuICAgICAgICBpdGVtLmRyYWdnaW5nUHJvcGVydHkuc2V0KCB0cnVlICk7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSBtb2RlbC5zdGFjay5pbmRleE9mKCBpdGVtICk7XHJcbiAgICAgICAgaWYgKCBpbmRleCA+PSAwICkge1xyXG4gICAgICAgICAgbW9kZWwuc3BsaWNlU3RhY2soIGluZGV4ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGl0ZW0ub25Cb2FyZFByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuXHJcbiAgICAgICAgLy9Eb24ndCBhbGxvdyB0aGUgdXNlciB0byB0cmFuc2xhdGUgdGhlIG9iamVjdCB3aGlsZSBpdCBpcyBhbmltYXRpbmdcclxuICAgICAgICBpdGVtLmNhbmNlbEFuaW1hdGlvbigpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy9FbmQgdGhlIGRyYWdcclxuICAgICAgZW5kOiAoKSA9PiB7XHJcbiAgICAgICAgaXRlbS5kcmFnZ2luZ1Byb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgICAgICAvL0lmIHRoZSB1c2VyIGRyb3BzIGl0IGFib3ZlIHRoZSBncm91bmQsIG1vdmUgdG8gdGhlIHRvcCBvZiB0aGUgc3RhY2sgb24gdGhlIHNrYXRlYm9hcmQsIG90aGVyd2lzZSBnbyBiYWNrIHRvIHRoZSBvcmlnaW5hbCBwb3NpdGlvbi5cclxuICAgICAgICBpZiAoIGl0ZW0ucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55IDwgMzUwICkge1xyXG4gICAgICAgICAgbW92ZVRvU3RhY2soKTtcclxuXHJcbiAgICAgICAgICAvLyBpZiBpdGVtIGlzIG1hbiBvciBnaXJsLCByb3RhdGUgZGVwZW5kaW5nIG9uIHRoZSBjdXJyZW50IG1vZGVsIHZlbG9jaXR5IGFuZCBhcHBsaWVkIGZvcmNlXHJcbiAgICAgICAgICBpZiAoIGl0ZW0ubmFtZSA9PT0gJ21hbicgfHwgaXRlbS5uYW1lID09PSAnZ2lybCcgKSB7XHJcbiAgICAgICAgICAgIHVwZGF0ZVBlcnNvbkRpcmVjdGlvbiggaXRlbSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIC8vIHNlbmQgdGhlIGl0ZW0gaG9tZSBhbmQgbWFrZSBzdXJlIHRoYXQgdGhlIGxhYmVsIGlzIGNlbnRlcmVkXHJcbiAgICAgICAgICBpdGVtLmFuaW1hdGVIb21lKCk7XHJcbiAgICAgICAgICB0aGlzLmxhYmVsTm9kZS5jZW50ZXJYID0gbm9ybWFsSW1hZ2VOb2RlLmNlbnRlclg7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIGRyYWdIYW5kbGVyICk7XHJcblxyXG4gICAgLy8gaWYgdGhlIGl0ZW0gaXMgYmVpbmcgZHJhZ2dlZCwgY2FuY2VsIHRoZSBkcmFnIG9uIHJlc2V0XHJcbiAgICBtb2RlbC5yZXNldEFsbEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgLy8gY2FuY2VsIHRoZSBkcmFnIGFuZCByZXNldCBpdGVtXHJcbiAgICAgIGlmICggaXRlbS5kcmFnZ2luZ1Byb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgIGRyYWdIYW5kbGVyLmludGVycnVwdCgpO1xyXG4gICAgICAgIGl0ZW0ucmVzZXQoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vTGFiZWwgZm9yIHRoZSBtYXNzIChpZiBpdCBpcyBzaG93bilcclxuICAgIGNvbnN0IG1hc3NMYWJlbFRleHQgPSBuZXcgVGV4dCggaXRlbS5teXN0ZXJ5ID8gJz8nIDogU3RyaW5nVXRpbHMuZm9ybWF0KCBwYXR0ZXJuME1hc3NVbml0c0tpbG9ncmFtc1N0cmluZywgaXRlbS5tYXNzICksIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7XHJcbiAgICAgICAgc2l6ZTogMTUsXHJcbiAgICAgICAgd2VpZ2h0OiAnYm9sZCdcclxuICAgICAgfSApLFxyXG4gICAgICBtYXhXaWR0aDogbm9ybWFsSW1hZ2VOb2RlLndpZHRoIC8gMS41LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtYXNzTGFiZWxUZXh0JyApXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCByb3VuZGVkUmFkaXVzID0gMTA7XHJcbiAgICBjb25zdCByb3VuZFJlY3QgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBtYXNzTGFiZWxUZXh0LndpZHRoICsgcm91bmRlZFJhZGl1cywgbWFzc0xhYmVsVGV4dC5oZWlnaHQgKyByb3VuZGVkUmFkaXVzLCByb3VuZGVkUmFkaXVzLCByb3VuZGVkUmFkaXVzLCB7XHJcbiAgICAgIGZpbGw6ICd3aGl0ZScsXHJcbiAgICAgIHN0cm9rZTogJ2dyYXknXHJcbiAgICB9ICkubXV0YXRlKCB7IGNlbnRlclg6IG1hc3NMYWJlbFRleHQuY2VudGVyWCwgY2VudGVyWTogbWFzc0xhYmVsVGV4dC5jZW50ZXJZIH0gKTtcclxuXHJcbiAgICAvLyB0aGUgbGFiZWwgbmVlZHMgdG8gYmUgc2NhbGVkIGJhY2sgdXAgYWZ0ZXIgdGhlIGltYWdlIHdhcyBzY2FsZWQgZG93blxyXG4gICAgLy8gbm9ybWFsaXplIHRoZSBtYXhpbXVtIHdpZHRoIHRvIHRoZW4gcmVzdHJpY3QgdGhlIGxhYmVscyBmb3IgaTE4blxyXG4gICAgY29uc3QgbGFiZWxUZXh0ID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgcm91bmRSZWN0LCBtYXNzTGFiZWxUZXh0IF0sXHJcbiAgICAgIHNjYWxlOiAxLjAgLyBpdGVtLmltYWdlU2NhbGVQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGFiZWxUZXh0JyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmxhYmVsTm9kZSA9IGxhYmVsVGV4dDtcclxuXHJcbiAgICAvL1VwZGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIGl0ZW1cclxuICAgIGl0ZW0ucG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBwb3NpdGlvbiA9PiB7IHRoaXMuc2V0VHJhbnNsYXRpb24oIHBvc2l0aW9uICk7IH0gKTtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSBvYmplY3QgaXMgc2NhbGVkIG9yIGNoYW5nZSBkaXJlY3Rpb24sIHVwZGF0ZSB0aGUgaW1hZ2UgcGFydFxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyBpdGVtLmludGVyYWN0aW9uU2NhbGVQcm9wZXJ0eSwgaXRlbS5kaXJlY3Rpb25Qcm9wZXJ0eSBdLCAoIGludGVyYWN0aW9uU2NhbGUsIGRpcmVjdGlvbiApID0+IHtcclxuICAgICAgY29uc3Qgc2NhbGUgPSBpdGVtLmltYWdlU2NhbGVQcm9wZXJ0eS5nZXQoKSAqIGludGVyYWN0aW9uU2NhbGU7XHJcbiAgICAgIHRoaXMuc2V0U2NhbGVNYWduaXR1ZGUoIHNjYWxlICk7XHJcblxyXG4gICAgICAvLyBtYWtlIHN1cmUgdGhhdCBsYWJlbHMgcmVtYWluIHRoZSBzYW1lIHNpemVcclxuICAgICAgbGFiZWxUZXh0LnNldFNjYWxlTWFnbml0dWRlKCAxIC8gc2NhbGUgKTtcclxuXHJcbiAgICAgIG5vcm1hbEltYWdlTm9kZS5zZXRNYXRyaXgoIElERU5USVRZICk7XHJcbiAgICAgIGlmICggZGlyZWN0aW9uID09PSAncmlnaHQnICkge1xyXG5cclxuICAgICAgICAvLyBzdG9yZSB0aGUgY2VudGVyIHNvIHRoYXQgaXQgY2FuIGJlIHJlYXBwbGllZCBhZnRlciBjaGFuZ2UgaW4gc2NhbGVcclxuICAgICAgICBjb25zdCBjZW50ZXJYID0gbm9ybWFsSW1hZ2VOb2RlLmNlbnRlclg7XHJcblxyXG4gICAgICAgIG5vcm1hbEltYWdlTm9kZS5zY2FsZSggLTEsIDEgKTtcclxuXHJcbiAgICAgICAgLy8gcmVhcHBseSB0aGUgY2VudGVyXHJcbiAgICAgICAgbm9ybWFsSW1hZ2VOb2RlLmNlbnRlclggPSBjZW50ZXJYO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB3aGVuIHNjYWxlIG9yIGRpcmVjdGlvbiBjaGFuZ2UsIG1ha2Ugc3VyZSB0aGF0IHRoZSBsYWJlbCBpcyBzdGlsbCBjZW50ZXJlZFxyXG4gICAgICB0aGlzLnVwZGF0ZUxhYmVsUG9zaXRpb24oKTtcclxuICAgIH0gKTtcclxuICAgIGl0ZW0ub25Cb2FyZFByb3BlcnR5LmxpbmsoIHVwZGF0ZUltYWdlICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggbm9ybWFsSW1hZ2VOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBsYWJlbFRleHQgKTtcclxuXHJcbiAgICBzaG93TWFzc2VzUHJvcGVydHkubGluayggc2hvd01hc3NlcyA9PiB7IGxhYmVsVGV4dC52aXNpYmxlID0gc2hvd01hc3NlczsgfSApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgbGFiZWwgcG9zaXRpb24gcmVsYXRpdmUgdG8gdGhlIGJvdHRvbSBvZiB0aGUgaW1hZ2UuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVMYWJlbFBvc2l0aW9uKCkge1xyXG4gICAgdGhpcy5sYWJlbE5vZGUuYm90dG9tID0gdGhpcy5ub3JtYWxJbWFnZU5vZGUuaGVpZ2h0IC0gNTtcclxuICAgIHRoaXMubGFiZWxOb2RlLmNlbnRlclggPSB0aGlzLm5vcm1hbEltYWdlTm9kZS5jZW50ZXJYO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSB3aWR0aCBvZiB0aGlzIGl0ZW0gbm9kZSwgbW9kaWZpZWQgYnkgdGhlIGN1cnJlbnQgc2NhbGUgZmFjdG9yLiAgSWYgdGhlIGl0ZW1cclxuICAgKiBpcyB1c2luZyBpdHMgc2l0dGluZyByZXByZXNlbnRhdGlvbiwgdXNlIHRoYXQgdG8gZ2V0IHRoZSBzY2FsZWQgd2lkdGhcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFNjYWxlZFdpZHRoKCkge1xyXG5cclxuICAgIC8vIGlmIHRoZSBpdGVtIGhhcyBhIHNpdHRpbmcgaW1hZ2UsIHVzZSB0aGF0IGltYWdlIGZvciB0aGUgd2lkdGhcclxuICAgIGxldCBzY2FsZWRXaWR0aDtcclxuICAgIGlmICggdGhpcy5zaXR0aW5nSW1hZ2UgKSB7XHJcbiAgICAgIHNjYWxlZFdpZHRoID0gdGhpcy5zaXR0aW5nSW1hZ2Uud2lkdGggKiB0aGlzLml0ZW0uZ2V0Q3VycmVudFNjYWxlKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgc2NhbGVkV2lkdGggPSB0aGlzLm5vcm1hbEltYWdlTm9kZS53aWR0aCAqIHRoaXMuaXRlbS5nZXRDdXJyZW50U2NhbGUoKTtcclxuICAgIH1cclxuICAgIHJldHVybiBzY2FsZWRXaWR0aDtcclxuICB9XHJcbn1cclxuXHJcbmZvcmNlc0FuZE1vdGlvbkJhc2ljcy5yZWdpc3RlciggJ0l0ZW1Ob2RlJywgSXRlbU5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEl0ZW1Ob2RlO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxpQkFBaUIsRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUNuRyxPQUFPQyxN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