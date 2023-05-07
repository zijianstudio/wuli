// Copyright 2018-2022, University of Colorado Boulder

/**
 * View for a NumberPiece.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { DragListener, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../fractionsCommon.js';
import NumberPiece from '../model/NumberPiece.js';
class NumberPieceNode extends Node {
  /**
   * @param {NumberPiece} numberPiece
   * @param {Object} [options]
   */
  constructor(numberPiece, options) {
    assert && assert(numberPiece instanceof NumberPiece);
    options = merge({
      // {function|null} - Called when it is dropped, with a single argument of whether it was from a touch.
      dropListener: null,
      // {boolean} - For pieces placed in stacks/containers, we don't care about the positionProperty. In addition,
      // pieces in stacks/containers ALSO care about not showing up when the piece is user-controlled or animating.
      positioned: false,
      // {ModelViewTransform2|null} - If positioned, a model-view-transform should be provided.
      modelViewTransform: null
    }, options);
    super();

    // @public {NumberPiece}
    this.numberPiece = numberPiece;

    // @private {boolean}
    this.positioned = options.positioned;

    // @private {ModelViewTransform2|null}
    this.modelViewTransform = options.modelViewTransform;
    assert && assert(!this.positioned || this.modelViewTransform, 'Positioned NumberPieceNodes need a MVT');
    this.addChild(Rectangle.bounds(numberPiece.bounds, {
      fill: FractionsCommonColors.numberFillProperty,
      stroke: FractionsCommonColors.numberStrokeProperty,
      cornerRadius: FractionsCommonConstants.NUMBER_CORNER_RADIUS
    }));
    this.addChild(new Text(numberPiece.number, {
      font: FractionsCommonConstants.NUMBER_FRACTIONAL_FONT,
      fill: FractionsCommonColors.numberTextFillProperty,
      center: Vector2.ZERO
    }));

    // @private {function}
    this.positionListener = this.updatePosition.bind(this);
    this.scaleListener = this.updateScale.bind(this);
    this.animatingListener = this.updateAnimating.bind(this);
    if (this.positioned) {
      this.numberPiece.positionProperty.link(this.positionListener);
      this.numberPiece.scaleProperty.link(this.scaleListener);
      this.numberPiece.isAnimatingProperty.link(this.animatingListener);
    }

    // @private {function}
    this.visibilityListener = Multilink.multilink([numberPiece.isUserControlledProperty, numberPiece.isAnimatingProperty], (isUserControlled, isAnimating) => {
      if (!this.positioned) {
        this.visible = !isUserControlled && !isAnimating;
      }
    });
    let wasTouch = false;

    // @public {DragListener}
    this.dragListener = new DragListener({
      targetNode: this,
      transform: options.modelViewTransform,
      positionProperty: numberPiece.positionProperty,
      start: event => {
        wasTouch = event.pointer.isTouchLike();
      },
      end: () => {
        options.dropListener && options.dropListener(wasTouch);
      }
    });

    // No need to unlink, as we own the given Property (same lifetime, and we own the listener)
    this.dragListener.isUserControlledProperty.link(controlled => {
      numberPiece.isUserControlledProperty.value = controlled;
    });
    this.mutate(options);
  }

  /**
   * Updates the position of this node to correspond to the model position.
   * @public
   */
  updatePosition() {
    this.translation = this.modelViewTransform.modelToViewPosition(this.numberPiece.positionProperty.value);
  }

  /**
   * Updates the scale of this node to correspond to the model scale.
   * @public
   */
  updateScale() {
    this.setScaleMagnitude(this.numberPiece.scaleProperty.value);
  }

  /**
   * Handles animation changes.
   * @public
   */
  updateAnimating() {
    if (this.numberPiece.isAnimatingProperty.value) {
      this.moveToBack();
      this.pickable = false;
    }
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    // Required disposal, since we are passing the isUserControlledProperty
    this.dragListener.dispose();
    this.visibilityListener.dispose();
    if (this.positioned) {
      this.numberPiece.positionProperty.unlink(this.positionListener);
      this.numberPiece.scaleProperty.unlink(this.scaleListener);
      this.numberPiece.isAnimatingProperty.unlink(this.animatingListener);
    }
    super.dispose();
  }
}
fractionsCommon.register('NumberPieceNode', NumberPieceNode);
export default NumberPieceNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJWZWN0b3IyIiwibWVyZ2UiLCJEcmFnTGlzdGVuZXIiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiVGV4dCIsIkZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cyIsIkZyYWN0aW9uc0NvbW1vbkNvbG9ycyIsImZyYWN0aW9uc0NvbW1vbiIsIk51bWJlclBpZWNlIiwiTnVtYmVyUGllY2VOb2RlIiwiY29uc3RydWN0b3IiLCJudW1iZXJQaWVjZSIsIm9wdGlvbnMiLCJhc3NlcnQiLCJkcm9wTGlzdGVuZXIiLCJwb3NpdGlvbmVkIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiYWRkQ2hpbGQiLCJib3VuZHMiLCJmaWxsIiwibnVtYmVyRmlsbFByb3BlcnR5Iiwic3Ryb2tlIiwibnVtYmVyU3Ryb2tlUHJvcGVydHkiLCJjb3JuZXJSYWRpdXMiLCJOVU1CRVJfQ09STkVSX1JBRElVUyIsIm51bWJlciIsImZvbnQiLCJOVU1CRVJfRlJBQ1RJT05BTF9GT05UIiwibnVtYmVyVGV4dEZpbGxQcm9wZXJ0eSIsImNlbnRlciIsIlpFUk8iLCJwb3NpdGlvbkxpc3RlbmVyIiwidXBkYXRlUG9zaXRpb24iLCJiaW5kIiwic2NhbGVMaXN0ZW5lciIsInVwZGF0ZVNjYWxlIiwiYW5pbWF0aW5nTGlzdGVuZXIiLCJ1cGRhdGVBbmltYXRpbmciLCJwb3NpdGlvblByb3BlcnR5IiwibGluayIsInNjYWxlUHJvcGVydHkiLCJpc0FuaW1hdGluZ1Byb3BlcnR5IiwidmlzaWJpbGl0eUxpc3RlbmVyIiwibXVsdGlsaW5rIiwiaXNVc2VyQ29udHJvbGxlZFByb3BlcnR5IiwiaXNVc2VyQ29udHJvbGxlZCIsImlzQW5pbWF0aW5nIiwidmlzaWJsZSIsIndhc1RvdWNoIiwiZHJhZ0xpc3RlbmVyIiwidGFyZ2V0Tm9kZSIsInRyYW5zZm9ybSIsInN0YXJ0IiwiZXZlbnQiLCJwb2ludGVyIiwiaXNUb3VjaExpa2UiLCJlbmQiLCJjb250cm9sbGVkIiwidmFsdWUiLCJtdXRhdGUiLCJ0cmFuc2xhdGlvbiIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJzZXRTY2FsZU1hZ25pdHVkZSIsIm1vdmVUb0JhY2siLCJwaWNrYWJsZSIsImRpc3Bvc2UiLCJ1bmxpbmsiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk51bWJlclBpZWNlTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciBhIE51bWJlclBpZWNlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IERyYWdMaXN0ZW5lciwgTm9kZSwgUmVjdGFuZ2xlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uc0NvbW1vbkNvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9GcmFjdGlvbnNDb21tb25Db2xvcnMuanMnO1xyXG5pbXBvcnQgZnJhY3Rpb25zQ29tbW9uIGZyb20gJy4uLy4uL2ZyYWN0aW9uc0NvbW1vbi5qcyc7XHJcbmltcG9ydCBOdW1iZXJQaWVjZSBmcm9tICcuLi9tb2RlbC9OdW1iZXJQaWVjZS5qcyc7XHJcblxyXG5jbGFzcyBOdW1iZXJQaWVjZU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge051bWJlclBpZWNlfSBudW1iZXJQaWVjZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbnVtYmVyUGllY2UsIG9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBudW1iZXJQaWVjZSBpbnN0YW5jZW9mIE51bWJlclBpZWNlICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIC8vIHtmdW5jdGlvbnxudWxsfSAtIENhbGxlZCB3aGVuIGl0IGlzIGRyb3BwZWQsIHdpdGggYSBzaW5nbGUgYXJndW1lbnQgb2Ygd2hldGhlciBpdCB3YXMgZnJvbSBhIHRvdWNoLlxyXG4gICAgICBkcm9wTGlzdGVuZXI6IG51bGwsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBGb3IgcGllY2VzIHBsYWNlZCBpbiBzdGFja3MvY29udGFpbmVycywgd2UgZG9uJ3QgY2FyZSBhYm91dCB0aGUgcG9zaXRpb25Qcm9wZXJ0eS4gSW4gYWRkaXRpb24sXHJcbiAgICAgIC8vIHBpZWNlcyBpbiBzdGFja3MvY29udGFpbmVycyBBTFNPIGNhcmUgYWJvdXQgbm90IHNob3dpbmcgdXAgd2hlbiB0aGUgcGllY2UgaXMgdXNlci1jb250cm9sbGVkIG9yIGFuaW1hdGluZy5cclxuICAgICAgcG9zaXRpb25lZDogZmFsc2UsXHJcblxyXG4gICAgICAvLyB7TW9kZWxWaWV3VHJhbnNmb3JtMnxudWxsfSAtIElmIHBvc2l0aW9uZWQsIGEgbW9kZWwtdmlldy10cmFuc2Zvcm0gc2hvdWxkIGJlIHByb3ZpZGVkLlxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm06IG51bGxcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge051bWJlclBpZWNlfVxyXG4gICAgdGhpcy5udW1iZXJQaWVjZSA9IG51bWJlclBpZWNlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufVxyXG4gICAgdGhpcy5wb3NpdGlvbmVkID0gb3B0aW9ucy5wb3NpdGlvbmVkO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfG51bGx9XHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLnBvc2l0aW9uZWQgfHwgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0sICdQb3NpdGlvbmVkIE51bWJlclBpZWNlTm9kZXMgbmVlZCBhIE1WVCcgKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBSZWN0YW5nbGUuYm91bmRzKCBudW1iZXJQaWVjZS5ib3VuZHMsIHtcclxuICAgICAgZmlsbDogRnJhY3Rpb25zQ29tbW9uQ29sb3JzLm51bWJlckZpbGxQcm9wZXJ0eSxcclxuICAgICAgc3Ryb2tlOiBGcmFjdGlvbnNDb21tb25Db2xvcnMubnVtYmVyU3Ryb2tlUHJvcGVydHksXHJcbiAgICAgIGNvcm5lclJhZGl1czogRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLk5VTUJFUl9DT1JORVJfUkFESVVTXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgVGV4dCggbnVtYmVyUGllY2UubnVtYmVyLCB7XHJcbiAgICAgIGZvbnQ6IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5OVU1CRVJfRlJBQ1RJT05BTF9GT05ULFxyXG4gICAgICBmaWxsOiBGcmFjdGlvbnNDb21tb25Db2xvcnMubnVtYmVyVGV4dEZpbGxQcm9wZXJ0eSxcclxuICAgICAgY2VudGVyOiBWZWN0b3IyLlpFUk9cclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn1cclxuICAgIHRoaXMucG9zaXRpb25MaXN0ZW5lciA9IHRoaXMudXBkYXRlUG9zaXRpb24uYmluZCggdGhpcyApO1xyXG4gICAgdGhpcy5zY2FsZUxpc3RlbmVyID0gdGhpcy51cGRhdGVTY2FsZS5iaW5kKCB0aGlzICk7XHJcbiAgICB0aGlzLmFuaW1hdGluZ0xpc3RlbmVyID0gdGhpcy51cGRhdGVBbmltYXRpbmcuYmluZCggdGhpcyApO1xyXG4gICAgaWYgKCB0aGlzLnBvc2l0aW9uZWQgKSB7XHJcbiAgICAgIHRoaXMubnVtYmVyUGllY2UucG9zaXRpb25Qcm9wZXJ0eS5saW5rKCB0aGlzLnBvc2l0aW9uTGlzdGVuZXIgKTtcclxuICAgICAgdGhpcy5udW1iZXJQaWVjZS5zY2FsZVByb3BlcnR5LmxpbmsoIHRoaXMuc2NhbGVMaXN0ZW5lciApO1xyXG4gICAgICB0aGlzLm51bWJlclBpZWNlLmlzQW5pbWF0aW5nUHJvcGVydHkubGluayggdGhpcy5hbmltYXRpbmdMaXN0ZW5lciApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn1cclxuICAgIHRoaXMudmlzaWJpbGl0eUxpc3RlbmVyID0gTXVsdGlsaW5rLm11bHRpbGluayggW1xyXG4gICAgICBudW1iZXJQaWVjZS5pc1VzZXJDb250cm9sbGVkUHJvcGVydHksXHJcbiAgICAgIG51bWJlclBpZWNlLmlzQW5pbWF0aW5nUHJvcGVydHlcclxuICAgIF0sICggaXNVc2VyQ29udHJvbGxlZCwgaXNBbmltYXRpbmcgKSA9PiB7XHJcbiAgICAgIGlmICggIXRoaXMucG9zaXRpb25lZCApIHtcclxuICAgICAgICB0aGlzLnZpc2libGUgPSAhaXNVc2VyQ29udHJvbGxlZCAmJiAhaXNBbmltYXRpbmc7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBsZXQgd2FzVG91Y2ggPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtEcmFnTGlzdGVuZXJ9XHJcbiAgICB0aGlzLmRyYWdMaXN0ZW5lciA9IG5ldyBEcmFnTGlzdGVuZXIoIHtcclxuICAgICAgdGFyZ2V0Tm9kZTogdGhpcyxcclxuICAgICAgdHJhbnNmb3JtOiBvcHRpb25zLm1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogbnVtYmVyUGllY2UucG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgc3RhcnQ6IGV2ZW50ID0+IHtcclxuICAgICAgICB3YXNUb3VjaCA9IGV2ZW50LnBvaW50ZXIuaXNUb3VjaExpa2UoKTtcclxuICAgICAgfSxcclxuICAgICAgZW5kOiAoKSA9PiB7XHJcbiAgICAgICAgb3B0aW9ucy5kcm9wTGlzdGVuZXIgJiYgb3B0aW9ucy5kcm9wTGlzdGVuZXIoIHdhc1RvdWNoICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBObyBuZWVkIHRvIHVubGluaywgYXMgd2Ugb3duIHRoZSBnaXZlbiBQcm9wZXJ0eSAoc2FtZSBsaWZldGltZSwgYW5kIHdlIG93biB0aGUgbGlzdGVuZXIpXHJcbiAgICB0aGlzLmRyYWdMaXN0ZW5lci5pc1VzZXJDb250cm9sbGVkUHJvcGVydHkubGluayggY29udHJvbGxlZCA9PiB7XHJcbiAgICAgIG51bWJlclBpZWNlLmlzVXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSA9IGNvbnRyb2xsZWQ7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIHBvc2l0aW9uIG9mIHRoaXMgbm9kZSB0byBjb3JyZXNwb25kIHRvIHRoZSBtb2RlbCBwb3NpdGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdXBkYXRlUG9zaXRpb24oKSB7XHJcbiAgICB0aGlzLnRyYW5zbGF0aW9uID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggdGhpcy5udW1iZXJQaWVjZS5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSBzY2FsZSBvZiB0aGlzIG5vZGUgdG8gY29ycmVzcG9uZCB0byB0aGUgbW9kZWwgc2NhbGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHVwZGF0ZVNjYWxlKCkge1xyXG4gICAgdGhpcy5zZXRTY2FsZU1hZ25pdHVkZSggdGhpcy5udW1iZXJQaWVjZS5zY2FsZVByb3BlcnR5LnZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIYW5kbGVzIGFuaW1hdGlvbiBjaGFuZ2VzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICB1cGRhdGVBbmltYXRpbmcoKSB7XHJcbiAgICBpZiAoIHRoaXMubnVtYmVyUGllY2UuaXNBbmltYXRpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgdGhpcy5tb3ZlVG9CYWNrKCk7XHJcbiAgICAgIHRoaXMucGlja2FibGUgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICAvLyBSZXF1aXJlZCBkaXNwb3NhbCwgc2luY2Ugd2UgYXJlIHBhc3NpbmcgdGhlIGlzVXNlckNvbnRyb2xsZWRQcm9wZXJ0eVxyXG4gICAgdGhpcy5kcmFnTGlzdGVuZXIuZGlzcG9zZSgpO1xyXG5cclxuICAgIHRoaXMudmlzaWJpbGl0eUxpc3RlbmVyLmRpc3Bvc2UoKTtcclxuXHJcbiAgICBpZiAoIHRoaXMucG9zaXRpb25lZCApIHtcclxuICAgICAgdGhpcy5udW1iZXJQaWVjZS5wb3NpdGlvblByb3BlcnR5LnVubGluayggdGhpcy5wb3NpdGlvbkxpc3RlbmVyICk7XHJcbiAgICAgIHRoaXMubnVtYmVyUGllY2Uuc2NhbGVQcm9wZXJ0eS51bmxpbmsoIHRoaXMuc2NhbGVMaXN0ZW5lciApO1xyXG4gICAgICB0aGlzLm51bWJlclBpZWNlLmlzQW5pbWF0aW5nUHJvcGVydHkudW5saW5rKCB0aGlzLmFuaW1hdGluZ0xpc3RlbmVyICk7XHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuZnJhY3Rpb25zQ29tbW9uLnJlZ2lzdGVyKCAnTnVtYmVyUGllY2VOb2RlJywgTnVtYmVyUGllY2VOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IE51bWJlclBpZWNlTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsU0FBU0MsWUFBWSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUN2RixPQUFPQyx3QkFBd0IsTUFBTSwwQ0FBMEM7QUFDL0UsT0FBT0MscUJBQXFCLE1BQU0sNENBQTRDO0FBQzlFLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0MsV0FBVyxNQUFNLHlCQUF5QjtBQUVqRCxNQUFNQyxlQUFlLFNBQVNQLElBQUksQ0FBQztFQUNqQztBQUNGO0FBQ0E7QUFDQTtFQUNFUSxXQUFXQSxDQUFFQyxXQUFXLEVBQUVDLE9BQU8sRUFBRztJQUNsQ0MsTUFBTSxJQUFJQSxNQUFNLENBQUVGLFdBQVcsWUFBWUgsV0FBWSxDQUFDO0lBRXRESSxPQUFPLEdBQUdaLEtBQUssQ0FBRTtNQUNmO01BQ0FjLFlBQVksRUFBRSxJQUFJO01BRWxCO01BQ0E7TUFDQUMsVUFBVSxFQUFFLEtBQUs7TUFFakI7TUFDQUMsa0JBQWtCLEVBQUU7SUFDdEIsQ0FBQyxFQUFFSixPQUFRLENBQUM7SUFFWixLQUFLLENBQUMsQ0FBQzs7SUFFUDtJQUNBLElBQUksQ0FBQ0QsV0FBVyxHQUFHQSxXQUFXOztJQUU5QjtJQUNBLElBQUksQ0FBQ0ksVUFBVSxHQUFHSCxPQUFPLENBQUNHLFVBQVU7O0lBRXBDO0lBQ0EsSUFBSSxDQUFDQyxrQkFBa0IsR0FBR0osT0FBTyxDQUFDSSxrQkFBa0I7SUFFcERILE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUMsSUFBSSxDQUFDRSxVQUFVLElBQUksSUFBSSxDQUFDQyxrQkFBa0IsRUFBRSx3Q0FBeUMsQ0FBQztJQUV6RyxJQUFJLENBQUNDLFFBQVEsQ0FBRWQsU0FBUyxDQUFDZSxNQUFNLENBQUVQLFdBQVcsQ0FBQ08sTUFBTSxFQUFFO01BQ25EQyxJQUFJLEVBQUViLHFCQUFxQixDQUFDYyxrQkFBa0I7TUFDOUNDLE1BQU0sRUFBRWYscUJBQXFCLENBQUNnQixvQkFBb0I7TUFDbERDLFlBQVksRUFBRWxCLHdCQUF3QixDQUFDbUI7SUFDekMsQ0FBRSxDQUFFLENBQUM7SUFFTCxJQUFJLENBQUNQLFFBQVEsQ0FBRSxJQUFJYixJQUFJLENBQUVPLFdBQVcsQ0FBQ2MsTUFBTSxFQUFFO01BQzNDQyxJQUFJLEVBQUVyQix3QkFBd0IsQ0FBQ3NCLHNCQUFzQjtNQUNyRFIsSUFBSSxFQUFFYixxQkFBcUIsQ0FBQ3NCLHNCQUFzQjtNQUNsREMsTUFBTSxFQUFFOUIsT0FBTyxDQUFDK0I7SUFDbEIsQ0FBRSxDQUFFLENBQUM7O0lBRUw7SUFDQSxJQUFJLENBQUNDLGdCQUFnQixHQUFHLElBQUksQ0FBQ0MsY0FBYyxDQUFDQyxJQUFJLENBQUUsSUFBSyxDQUFDO0lBQ3hELElBQUksQ0FBQ0MsYUFBYSxHQUFHLElBQUksQ0FBQ0MsV0FBVyxDQUFDRixJQUFJLENBQUUsSUFBSyxDQUFDO0lBQ2xELElBQUksQ0FBQ0csaUJBQWlCLEdBQUcsSUFBSSxDQUFDQyxlQUFlLENBQUNKLElBQUksQ0FBRSxJQUFLLENBQUM7SUFDMUQsSUFBSyxJQUFJLENBQUNsQixVQUFVLEVBQUc7TUFDckIsSUFBSSxDQUFDSixXQUFXLENBQUMyQixnQkFBZ0IsQ0FBQ0MsSUFBSSxDQUFFLElBQUksQ0FBQ1IsZ0JBQWlCLENBQUM7TUFDL0QsSUFBSSxDQUFDcEIsV0FBVyxDQUFDNkIsYUFBYSxDQUFDRCxJQUFJLENBQUUsSUFBSSxDQUFDTCxhQUFjLENBQUM7TUFDekQsSUFBSSxDQUFDdkIsV0FBVyxDQUFDOEIsbUJBQW1CLENBQUNGLElBQUksQ0FBRSxJQUFJLENBQUNILGlCQUFrQixDQUFDO0lBQ3JFOztJQUVBO0lBQ0EsSUFBSSxDQUFDTSxrQkFBa0IsR0FBRzVDLFNBQVMsQ0FBQzZDLFNBQVMsQ0FBRSxDQUM3Q2hDLFdBQVcsQ0FBQ2lDLHdCQUF3QixFQUNwQ2pDLFdBQVcsQ0FBQzhCLG1CQUFtQixDQUNoQyxFQUFFLENBQUVJLGdCQUFnQixFQUFFQyxXQUFXLEtBQU07TUFDdEMsSUFBSyxDQUFDLElBQUksQ0FBQy9CLFVBQVUsRUFBRztRQUN0QixJQUFJLENBQUNnQyxPQUFPLEdBQUcsQ0FBQ0YsZ0JBQWdCLElBQUksQ0FBQ0MsV0FBVztNQUNsRDtJQUNGLENBQUUsQ0FBQztJQUVILElBQUlFLFFBQVEsR0FBRyxLQUFLOztJQUVwQjtJQUNBLElBQUksQ0FBQ0MsWUFBWSxHQUFHLElBQUloRCxZQUFZLENBQUU7TUFDcENpRCxVQUFVLEVBQUUsSUFBSTtNQUNoQkMsU0FBUyxFQUFFdkMsT0FBTyxDQUFDSSxrQkFBa0I7TUFDckNzQixnQkFBZ0IsRUFBRTNCLFdBQVcsQ0FBQzJCLGdCQUFnQjtNQUM5Q2MsS0FBSyxFQUFFQyxLQUFLLElBQUk7UUFDZEwsUUFBUSxHQUFHSyxLQUFLLENBQUNDLE9BQU8sQ0FBQ0MsV0FBVyxDQUFDLENBQUM7TUFDeEMsQ0FBQztNQUNEQyxHQUFHLEVBQUVBLENBQUEsS0FBTTtRQUNUNUMsT0FBTyxDQUFDRSxZQUFZLElBQUlGLE9BQU8sQ0FBQ0UsWUFBWSxDQUFFa0MsUUFBUyxDQUFDO01BQzFEO0lBQ0YsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDQyxZQUFZLENBQUNMLHdCQUF3QixDQUFDTCxJQUFJLENBQUVrQixVQUFVLElBQUk7TUFDN0Q5QyxXQUFXLENBQUNpQyx3QkFBd0IsQ0FBQ2MsS0FBSyxHQUFHRCxVQUFVO0lBQ3pELENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0UsTUFBTSxDQUFFL0MsT0FBUSxDQUFDO0VBQ3hCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VvQixjQUFjQSxDQUFBLEVBQUc7SUFDZixJQUFJLENBQUM0QixXQUFXLEdBQUcsSUFBSSxDQUFDNUMsa0JBQWtCLENBQUM2QyxtQkFBbUIsQ0FBRSxJQUFJLENBQUNsRCxXQUFXLENBQUMyQixnQkFBZ0IsQ0FBQ29CLEtBQU0sQ0FBQztFQUMzRzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFdkIsV0FBV0EsQ0FBQSxFQUFHO0lBQ1osSUFBSSxDQUFDMkIsaUJBQWlCLENBQUUsSUFBSSxDQUFDbkQsV0FBVyxDQUFDNkIsYUFBYSxDQUFDa0IsS0FBTSxDQUFDO0VBQ2hFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VyQixlQUFlQSxDQUFBLEVBQUc7SUFDaEIsSUFBSyxJQUFJLENBQUMxQixXQUFXLENBQUM4QixtQkFBbUIsQ0FBQ2lCLEtBQUssRUFBRztNQUNoRCxJQUFJLENBQUNLLFVBQVUsQ0FBQyxDQUFDO01BQ2pCLElBQUksQ0FBQ0MsUUFBUSxHQUFHLEtBQUs7SUFDdkI7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLE9BQU9BLENBQUEsRUFBRztJQUNSO0lBQ0EsSUFBSSxDQUFDaEIsWUFBWSxDQUFDZ0IsT0FBTyxDQUFDLENBQUM7SUFFM0IsSUFBSSxDQUFDdkIsa0JBQWtCLENBQUN1QixPQUFPLENBQUMsQ0FBQztJQUVqQyxJQUFLLElBQUksQ0FBQ2xELFVBQVUsRUFBRztNQUNyQixJQUFJLENBQUNKLFdBQVcsQ0FBQzJCLGdCQUFnQixDQUFDNEIsTUFBTSxDQUFFLElBQUksQ0FBQ25DLGdCQUFpQixDQUFDO01BQ2pFLElBQUksQ0FBQ3BCLFdBQVcsQ0FBQzZCLGFBQWEsQ0FBQzBCLE1BQU0sQ0FBRSxJQUFJLENBQUNoQyxhQUFjLENBQUM7TUFDM0QsSUFBSSxDQUFDdkIsV0FBVyxDQUFDOEIsbUJBQW1CLENBQUN5QixNQUFNLENBQUUsSUFBSSxDQUFDOUIsaUJBQWtCLENBQUM7SUFDdkU7SUFFQSxLQUFLLENBQUM2QixPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUExRCxlQUFlLENBQUM0RCxRQUFRLENBQUUsaUJBQWlCLEVBQUUxRCxlQUFnQixDQUFDO0FBQzlELGVBQWVBLGVBQWUifQ==