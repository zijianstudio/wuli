// Copyright 2015-2023, University of Colorado Boulder

/**
 * Explore screenview of Make a Ten. Provides a panel where 100s, 10s or 1s can be dragged out, combined, and pulled
 * apart, and displays the total in the upper-left.
 *
 * @author Sharfudeen Ashraf
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import CountingObject from '../../../../../counting-common/js/common/model/CountingObject.js';
import CountingCommonScreenView from '../../../../../counting-common/js/common/view/CountingCommonScreenView.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import MathSymbols from '../../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { HBox, Text } from '../../../../../scenery/js/imports.js';
import Checkbox from '../../../../../sun/js/Checkbox.js';
import makeATen from '../../../makeATen.js';
import MakeATenStrings from '../../../MakeATenStrings.js';
import MakeATenConstants from '../../common/MakeATenConstants.js';
import ExplorePanel from './ExplorePanel.js';
import SplitCueNode from './SplitCueNode.js';
const hideTotalString = MakeATenStrings.hideTotal;

// constants
const EQUATION_FONT = new PhetFont({
  size: 60,
  weight: 'bold'
});
class MakeATenExploreScreenView extends CountingCommonScreenView {
  /**
   * @param {MakeATenExploreModel} model
   */
  constructor(model) {
    super(model);

    // @private {Function} - Called with function( countingObjectNode ) on number splits
    this.numberSplitListener = this.onNumberSplit.bind(this);

    // @private {Function} - Called with function( countingObjectNode ) when a number begins to be interacted with.
    this.numberInteractionListener = this.onNumberInteractionStarted.bind(this);

    // @private {Function} - Called with function( countingObject ) when a number finishes animation
    this.numberAnimationFinishedListener = this.onNumberAnimationFinished.bind(this);

    // @private {Function} - Called with function( countingObject ) when a number finishes being dragged
    this.numberDragFinishedListener = this.onNumberDragFinished.bind(this);
    this.finishInitialization();

    // @private {BooleanProperty} - Whether the total (sum) is hidden
    this.hideSumProperty = new BooleanProperty(false);
    const sumText = new Text('0', {
      font: EQUATION_FONT,
      fill: MakeATenConstants.EQUATION_FILL
    });
    model.sumProperty.linkAttribute(sumText, 'string');

    // @private {HBox} - Displays the sum of our numbers and an equals sign, e.g. "256 ="
    this.sumNode = new HBox({
      children: [sumText, new Text(MathSymbols.EQUAL_TO, {
        font: EQUATION_FONT,
        fill: MakeATenConstants.EQUATION_FILL
      })],
      spacing: 15
    });
    this.addChild(this.sumNode);

    // @private {ExplorePanel} - Shows 100,10,1 that can be dragged.
    this.explorePanel = new ExplorePanel(this, model.sumProperty, model.resetEmitter);
    this.addChild(this.explorePanel);
    const hideSumText = new Text(hideTotalString, {
      maxWidth: 150,
      font: new PhetFont({
        size: 25,
        weight: 'bold'
      }),
      fill: 'black'
    });

    // @private {Checkbox} - When checked, hides the sum in the upper-left
    this.hideSumCheckbox = new Checkbox(this.hideSumProperty, hideSumText, {
      spacing: 10,
      boxWidth: 30
    });
    this.hideSumCheckbox.touchArea = this.hideSumCheckbox.localBounds.dilatedXY(10, 4);
    this.addChild(this.hideSumCheckbox);
    this.hideSumProperty.link(hideSum => {
      this.sumNode.visible = !hideSum;
    });
    this.addChild(this.countingObjectLayerNode);
    this.addChild(new SplitCueNode(model.splitCue));
    this.layoutControls();
  }

  /**
   * @public
   * @override
   */
  layoutControls() {
    super.layoutControls();
    const visibleBounds = this.visibleBoundsProperty.value;
    this.explorePanel.centerX = visibleBounds.centerX;
    this.explorePanel.bottom = visibleBounds.bottom - 10;
    this.hideSumCheckbox.left = this.explorePanel.right + 20;
    this.hideSumCheckbox.bottom = visibleBounds.bottom - 10;
    this.sumNode.left = visibleBounds.left + 30;
    this.sumNode.top = visibleBounds.top + 30;
  }

  /**
   * Whether the counting object is predominantly over the explore panel (should be collected).
   * @private
   *
   * @param {CountingObject} countingObject
   * @returns {boolean}
   */
  isNumberInReturnZone(countingObject) {
    // Compute the local point on the number that would need to go into the return zone.
    // This point is a bit farther down than the exact center, as it was annoying to "miss" the return zone
    // slightly by being too high (while the mouse WAS in the return zone).
    const localBounds = countingObject.localBounds;
    const localReturnPoint = localBounds.center.plus(localBounds.centerBottom).dividedScalar(2);

    // And the bounds of our panel
    const panelBounds = this.explorePanel.bounds.withMaxY(this.visibleBoundsProperty.value.bottom);

    // View coordinate of our return point
    const paperCenter = countingObject.positionProperty.value.plus(localReturnPoint);
    return panelBounds.containsPoint(paperCenter);
  }

  /**
   * @public
   * @override
   */
  onCountingObjectAdded(countingObject) {
    const countingObjectNode = super.onCountingObjectAdded(countingObject);

    // Add listeners
    countingObjectNode.splitEmitter.addListener(this.numberSplitListener);
    countingObjectNode.interactionStartedEmitter.addListener(this.numberInteractionListener);
    countingObject.endAnimationEmitter.addListener(this.numberAnimationFinishedListener);
    countingObjectNode.endDragEmitter.addListener(this.numberDragFinishedListener);
  }

  /**
   * @public
   * @override
   */
  onCountingObjectRemoved(countingObject) {
    const countingObjectNode = this.findCountingObjectNode(countingObject);

    // Remove listeners
    countingObjectNode.endDragEmitter.removeListener(this.numberDragFinishedListener);
    countingObject.endAnimationEmitter.removeListener(this.numberAnimationFinishedListener);
    countingObjectNode.interactionStartedEmitter.removeListener(this.numberInteractionListener);
    countingObjectNode.splitEmitter.removeListener(this.numberSplitListener);

    // Detach any attached cues
    if (this.model.splitCue.countingObjectProperty.value === countingObject) {
      this.model.splitCue.detach();
    }
    super.onCountingObjectRemoved(countingObject);
  }

  /**
   * Called when a counting object node is split.
   * @private
   *
   * @param {CountingObjectNode} countingObjectNode
   */
  onNumberSplit(countingObjectNode) {
    this.model.splitCue.triggerFade();
  }

  /**
   * Called when a counting object node starts being interacted with.
   * @private
   *
   * @param {CountingObjectNode} countingObjectNode
   */
  onNumberInteractionStarted(countingObjectNode) {
    const countingObject = countingObjectNode.countingObject;
    if (countingObject.numberValueProperty.value > 1) {
      this.model.splitCue.attachToNumber(countingObject);
    }
  }

  /**
   * Called when a counting object has finished animating to its destination.
   * @private
   *
   * @param {CountingObject} countingObject
   */
  onNumberAnimationFinished(countingObject) {
    // If it animated to the return zone, it's probably split and meant to be returned.
    if (this.isNumberInReturnZone(countingObject)) {
      this.model.removeCountingObject(countingObject);
    }
  }

  /**
   * Called when a counting object has finished being dragged.
   * @private
   *
   * @param {CountingObjectNode} countingObjectNode
   */
  onNumberDragFinished(countingObjectNode) {
    const countingObject = countingObjectNode.countingObject;

    // Return it to the panel if it's been dropped in the panel.
    if (this.isNumberInReturnZone(countingObject)) {
      const baseNumbers = countingObject.baseNumbers;

      // Split it into a CountingObject for each of its base numbers, and animate them to their targets in the
      // explore panel.
      for (let i = baseNumbers.length - 1; i >= 0; i--) {
        const baseNumber = baseNumbers[i];
        const baseCountingObject = new CountingObject(baseNumber.numberValue, countingObject.positionProperty.value);

        // Set its destination to the proper target (with the offset so that it will disappear once centered).
        let targetPosition = this.explorePanel.digitLengthToTargetNode[baseNumber.digitLength].getOriginPosition();
        const paperCenterOffset = new CountingObject(baseNumber.numberValue, new Vector2(0, 0)).localBounds.center;
        targetPosition = targetPosition.minus(paperCenterOffset);
        baseCountingObject.setDestination(targetPosition, true);

        // Add the new base counting object
        this.model.addCountingObject(baseCountingObject);
      }

      // Remove the original counting object (as we have added its components).
      this.model.removeCountingObject(countingObject);
    }
  }

  /**
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.hideSumProperty.reset();
  }
}
makeATen.register('MakeATenExploreScreenView', MakeATenExploreScreenView);
export default MakeATenExploreScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJDb3VudGluZ09iamVjdCIsIkNvdW50aW5nQ29tbW9uU2NyZWVuVmlldyIsIlZlY3RvcjIiLCJNYXRoU3ltYm9scyIsIlBoZXRGb250IiwiSEJveCIsIlRleHQiLCJDaGVja2JveCIsIm1ha2VBVGVuIiwiTWFrZUFUZW5TdHJpbmdzIiwiTWFrZUFUZW5Db25zdGFudHMiLCJFeHBsb3JlUGFuZWwiLCJTcGxpdEN1ZU5vZGUiLCJoaWRlVG90YWxTdHJpbmciLCJoaWRlVG90YWwiLCJFUVVBVElPTl9GT05UIiwic2l6ZSIsIndlaWdodCIsIk1ha2VBVGVuRXhwbG9yZVNjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwibnVtYmVyU3BsaXRMaXN0ZW5lciIsIm9uTnVtYmVyU3BsaXQiLCJiaW5kIiwibnVtYmVySW50ZXJhY3Rpb25MaXN0ZW5lciIsIm9uTnVtYmVySW50ZXJhY3Rpb25TdGFydGVkIiwibnVtYmVyQW5pbWF0aW9uRmluaXNoZWRMaXN0ZW5lciIsIm9uTnVtYmVyQW5pbWF0aW9uRmluaXNoZWQiLCJudW1iZXJEcmFnRmluaXNoZWRMaXN0ZW5lciIsIm9uTnVtYmVyRHJhZ0ZpbmlzaGVkIiwiZmluaXNoSW5pdGlhbGl6YXRpb24iLCJoaWRlU3VtUHJvcGVydHkiLCJzdW1UZXh0IiwiZm9udCIsImZpbGwiLCJFUVVBVElPTl9GSUxMIiwic3VtUHJvcGVydHkiLCJsaW5rQXR0cmlidXRlIiwic3VtTm9kZSIsImNoaWxkcmVuIiwiRVFVQUxfVE8iLCJzcGFjaW5nIiwiYWRkQ2hpbGQiLCJleHBsb3JlUGFuZWwiLCJyZXNldEVtaXR0ZXIiLCJoaWRlU3VtVGV4dCIsIm1heFdpZHRoIiwiaGlkZVN1bUNoZWNrYm94IiwiYm94V2lkdGgiLCJ0b3VjaEFyZWEiLCJsb2NhbEJvdW5kcyIsImRpbGF0ZWRYWSIsImxpbmsiLCJoaWRlU3VtIiwidmlzaWJsZSIsImNvdW50aW5nT2JqZWN0TGF5ZXJOb2RlIiwic3BsaXRDdWUiLCJsYXlvdXRDb250cm9scyIsInZpc2libGVCb3VuZHMiLCJ2aXNpYmxlQm91bmRzUHJvcGVydHkiLCJ2YWx1ZSIsImNlbnRlclgiLCJib3R0b20iLCJsZWZ0IiwicmlnaHQiLCJ0b3AiLCJpc051bWJlckluUmV0dXJuWm9uZSIsImNvdW50aW5nT2JqZWN0IiwibG9jYWxSZXR1cm5Qb2ludCIsImNlbnRlciIsInBsdXMiLCJjZW50ZXJCb3R0b20iLCJkaXZpZGVkU2NhbGFyIiwicGFuZWxCb3VuZHMiLCJib3VuZHMiLCJ3aXRoTWF4WSIsInBhcGVyQ2VudGVyIiwicG9zaXRpb25Qcm9wZXJ0eSIsImNvbnRhaW5zUG9pbnQiLCJvbkNvdW50aW5nT2JqZWN0QWRkZWQiLCJjb3VudGluZ09iamVjdE5vZGUiLCJzcGxpdEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImludGVyYWN0aW9uU3RhcnRlZEVtaXR0ZXIiLCJlbmRBbmltYXRpb25FbWl0dGVyIiwiZW5kRHJhZ0VtaXR0ZXIiLCJvbkNvdW50aW5nT2JqZWN0UmVtb3ZlZCIsImZpbmRDb3VudGluZ09iamVjdE5vZGUiLCJyZW1vdmVMaXN0ZW5lciIsImNvdW50aW5nT2JqZWN0UHJvcGVydHkiLCJkZXRhY2giLCJ0cmlnZ2VyRmFkZSIsIm51bWJlclZhbHVlUHJvcGVydHkiLCJhdHRhY2hUb051bWJlciIsInJlbW92ZUNvdW50aW5nT2JqZWN0IiwiYmFzZU51bWJlcnMiLCJpIiwibGVuZ3RoIiwiYmFzZU51bWJlciIsImJhc2VDb3VudGluZ09iamVjdCIsIm51bWJlclZhbHVlIiwidGFyZ2V0UG9zaXRpb24iLCJkaWdpdExlbmd0aFRvVGFyZ2V0Tm9kZSIsImRpZ2l0TGVuZ3RoIiwiZ2V0T3JpZ2luUG9zaXRpb24iLCJwYXBlckNlbnRlck9mZnNldCIsIm1pbnVzIiwic2V0RGVzdGluYXRpb24iLCJhZGRDb3VudGluZ09iamVjdCIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNYWtlQVRlbkV4cGxvcmVTY3JlZW5WaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEV4cGxvcmUgc2NyZWVudmlldyBvZiBNYWtlIGEgVGVuLiBQcm92aWRlcyBhIHBhbmVsIHdoZXJlIDEwMHMsIDEwcyBvciAxcyBjYW4gYmUgZHJhZ2dlZCBvdXQsIGNvbWJpbmVkLCBhbmQgcHVsbGVkXHJcbiAqIGFwYXJ0LCBhbmQgZGlzcGxheXMgdGhlIHRvdGFsIGluIHRoZSB1cHBlci1sZWZ0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBDb3VudGluZ09iamVjdCBmcm9tICcuLi8uLi8uLi8uLi8uLi9jb3VudGluZy1jb21tb24vanMvY29tbW9uL21vZGVsL0NvdW50aW5nT2JqZWN0LmpzJztcclxuaW1wb3J0IENvdW50aW5nQ29tbW9uU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi8uLi9jb3VudGluZy1jb21tb24vanMvY29tbW9uL3ZpZXcvQ291bnRpbmdDb21tb25TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IEhCb3gsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcclxuaW1wb3J0IG1ha2VBVGVuIGZyb20gJy4uLy4uLy4uL21ha2VBVGVuLmpzJztcclxuaW1wb3J0IE1ha2VBVGVuU3RyaW5ncyBmcm9tICcuLi8uLi8uLi9NYWtlQVRlblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgTWFrZUFUZW5Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL01ha2VBVGVuQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEV4cGxvcmVQYW5lbCBmcm9tICcuL0V4cGxvcmVQYW5lbC5qcyc7XHJcbmltcG9ydCBTcGxpdEN1ZU5vZGUgZnJvbSAnLi9TcGxpdEN1ZU5vZGUuanMnO1xyXG5cclxuY29uc3QgaGlkZVRvdGFsU3RyaW5nID0gTWFrZUFUZW5TdHJpbmdzLmhpZGVUb3RhbDtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBFUVVBVElPTl9GT05UID0gbmV3IFBoZXRGb250KCB7IHNpemU6IDYwLCB3ZWlnaHQ6ICdib2xkJyB9ICk7XHJcblxyXG5jbGFzcyBNYWtlQVRlbkV4cGxvcmVTY3JlZW5WaWV3IGV4dGVuZHMgQ291bnRpbmdDb21tb25TY3JlZW5WaWV3IHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge01ha2VBVGVuRXhwbG9yZU1vZGVsfSBtb2RlbFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCApIHtcclxuXHJcbiAgICBzdXBlciggbW9kZWwgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7RnVuY3Rpb259IC0gQ2FsbGVkIHdpdGggZnVuY3Rpb24oIGNvdW50aW5nT2JqZWN0Tm9kZSApIG9uIG51bWJlciBzcGxpdHNcclxuICAgIHRoaXMubnVtYmVyU3BsaXRMaXN0ZW5lciA9IHRoaXMub25OdW1iZXJTcGxpdC5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0Z1bmN0aW9ufSAtIENhbGxlZCB3aXRoIGZ1bmN0aW9uKCBjb3VudGluZ09iamVjdE5vZGUgKSB3aGVuIGEgbnVtYmVyIGJlZ2lucyB0byBiZSBpbnRlcmFjdGVkIHdpdGguXHJcbiAgICB0aGlzLm51bWJlckludGVyYWN0aW9uTGlzdGVuZXIgPSB0aGlzLm9uTnVtYmVySW50ZXJhY3Rpb25TdGFydGVkLmJpbmQoIHRoaXMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7RnVuY3Rpb259IC0gQ2FsbGVkIHdpdGggZnVuY3Rpb24oIGNvdW50aW5nT2JqZWN0ICkgd2hlbiBhIG51bWJlciBmaW5pc2hlcyBhbmltYXRpb25cclxuICAgIHRoaXMubnVtYmVyQW5pbWF0aW9uRmluaXNoZWRMaXN0ZW5lciA9IHRoaXMub25OdW1iZXJBbmltYXRpb25GaW5pc2hlZC5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0Z1bmN0aW9ufSAtIENhbGxlZCB3aXRoIGZ1bmN0aW9uKCBjb3VudGluZ09iamVjdCApIHdoZW4gYSBudW1iZXIgZmluaXNoZXMgYmVpbmcgZHJhZ2dlZFxyXG4gICAgdGhpcy5udW1iZXJEcmFnRmluaXNoZWRMaXN0ZW5lciA9IHRoaXMub25OdW1iZXJEcmFnRmluaXNoZWQuYmluZCggdGhpcyApO1xyXG5cclxuICAgIHRoaXMuZmluaXNoSW5pdGlhbGl6YXRpb24oKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Qm9vbGVhblByb3BlcnR5fSAtIFdoZXRoZXIgdGhlIHRvdGFsIChzdW0pIGlzIGhpZGRlblxyXG4gICAgdGhpcy5oaWRlU3VtUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIGNvbnN0IHN1bVRleHQgPSBuZXcgVGV4dCggJzAnLCB7IGZvbnQ6IEVRVUFUSU9OX0ZPTlQsIGZpbGw6IE1ha2VBVGVuQ29uc3RhbnRzLkVRVUFUSU9OX0ZJTEwgfSApO1xyXG4gICAgbW9kZWwuc3VtUHJvcGVydHkubGlua0F0dHJpYnV0ZSggc3VtVGV4dCwgJ3N0cmluZycgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7SEJveH0gLSBEaXNwbGF5cyB0aGUgc3VtIG9mIG91ciBudW1iZXJzIGFuZCBhbiBlcXVhbHMgc2lnbiwgZS5nLiBcIjI1NiA9XCJcclxuICAgIHRoaXMuc3VtTm9kZSA9IG5ldyBIQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgc3VtVGV4dCxcclxuICAgICAgICBuZXcgVGV4dCggTWF0aFN5bWJvbHMuRVFVQUxfVE8sIHsgZm9udDogRVFVQVRJT05fRk9OVCwgZmlsbDogTWFrZUFUZW5Db25zdGFudHMuRVFVQVRJT05fRklMTCB9IClcclxuICAgICAgXSwgc3BhY2luZzogMTVcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnN1bU5vZGUgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7RXhwbG9yZVBhbmVsfSAtIFNob3dzIDEwMCwxMCwxIHRoYXQgY2FuIGJlIGRyYWdnZWQuXHJcbiAgICB0aGlzLmV4cGxvcmVQYW5lbCA9IG5ldyBFeHBsb3JlUGFuZWwoIHRoaXMsIG1vZGVsLnN1bVByb3BlcnR5LCBtb2RlbC5yZXNldEVtaXR0ZXIgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuZXhwbG9yZVBhbmVsICk7XHJcblxyXG4gICAgY29uc3QgaGlkZVN1bVRleHQgPSBuZXcgVGV4dCggaGlkZVRvdGFsU3RyaW5nLCB7XHJcbiAgICAgIG1heFdpZHRoOiAxNTAsXHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCgge1xyXG4gICAgICAgIHNpemU6IDI1LFxyXG4gICAgICAgIHdlaWdodDogJ2JvbGQnXHJcbiAgICAgIH0gKSxcclxuICAgICAgZmlsbDogJ2JsYWNrJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtDaGVja2JveH0gLSBXaGVuIGNoZWNrZWQsIGhpZGVzIHRoZSBzdW0gaW4gdGhlIHVwcGVyLWxlZnRcclxuICAgIHRoaXMuaGlkZVN1bUNoZWNrYm94ID0gbmV3IENoZWNrYm94KCB0aGlzLmhpZGVTdW1Qcm9wZXJ0eSwgaGlkZVN1bVRleHQsIHtcclxuICAgICAgc3BhY2luZzogMTAsXHJcbiAgICAgIGJveFdpZHRoOiAzMFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5oaWRlU3VtQ2hlY2tib3gudG91Y2hBcmVhID0gdGhpcy5oaWRlU3VtQ2hlY2tib3gubG9jYWxCb3VuZHMuZGlsYXRlZFhZKCAxMCwgNCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5oaWRlU3VtQ2hlY2tib3ggKTtcclxuXHJcbiAgICB0aGlzLmhpZGVTdW1Qcm9wZXJ0eS5saW5rKCBoaWRlU3VtID0+IHtcclxuICAgICAgdGhpcy5zdW1Ob2RlLnZpc2libGUgPSAhaGlkZVN1bTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmNvdW50aW5nT2JqZWN0TGF5ZXJOb2RlICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFNwbGl0Q3VlTm9kZSggbW9kZWwuc3BsaXRDdWUgKSApO1xyXG5cclxuICAgIHRoaXMubGF5b3V0Q29udHJvbHMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBsYXlvdXRDb250cm9scygpIHtcclxuICAgIHN1cGVyLmxheW91dENvbnRyb2xzKCk7XHJcblxyXG4gICAgY29uc3QgdmlzaWJsZUJvdW5kcyA9IHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIHRoaXMuZXhwbG9yZVBhbmVsLmNlbnRlclggPSB2aXNpYmxlQm91bmRzLmNlbnRlclg7XHJcbiAgICB0aGlzLmV4cGxvcmVQYW5lbC5ib3R0b20gPSB2aXNpYmxlQm91bmRzLmJvdHRvbSAtIDEwO1xyXG5cclxuICAgIHRoaXMuaGlkZVN1bUNoZWNrYm94LmxlZnQgPSB0aGlzLmV4cGxvcmVQYW5lbC5yaWdodCArIDIwO1xyXG4gICAgdGhpcy5oaWRlU3VtQ2hlY2tib3guYm90dG9tID0gdmlzaWJsZUJvdW5kcy5ib3R0b20gLSAxMDtcclxuXHJcbiAgICB0aGlzLnN1bU5vZGUubGVmdCA9IHZpc2libGVCb3VuZHMubGVmdCArIDMwO1xyXG4gICAgdGhpcy5zdW1Ob2RlLnRvcCA9IHZpc2libGVCb3VuZHMudG9wICsgMzA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHRoZSBjb3VudGluZyBvYmplY3QgaXMgcHJlZG9taW5hbnRseSBvdmVyIHRoZSBleHBsb3JlIHBhbmVsIChzaG91bGQgYmUgY29sbGVjdGVkKS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtDb3VudGluZ09iamVjdH0gY291bnRpbmdPYmplY3RcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpc051bWJlckluUmV0dXJuWm9uZSggY291bnRpbmdPYmplY3QgKSB7XHJcbiAgICAvLyBDb21wdXRlIHRoZSBsb2NhbCBwb2ludCBvbiB0aGUgbnVtYmVyIHRoYXQgd291bGQgbmVlZCB0byBnbyBpbnRvIHRoZSByZXR1cm4gem9uZS5cclxuICAgIC8vIFRoaXMgcG9pbnQgaXMgYSBiaXQgZmFydGhlciBkb3duIHRoYW4gdGhlIGV4YWN0IGNlbnRlciwgYXMgaXQgd2FzIGFubm95aW5nIHRvIFwibWlzc1wiIHRoZSByZXR1cm4gem9uZVxyXG4gICAgLy8gc2xpZ2h0bHkgYnkgYmVpbmcgdG9vIGhpZ2ggKHdoaWxlIHRoZSBtb3VzZSBXQVMgaW4gdGhlIHJldHVybiB6b25lKS5cclxuICAgIGNvbnN0IGxvY2FsQm91bmRzID0gY291bnRpbmdPYmplY3QubG9jYWxCb3VuZHM7XHJcbiAgICBjb25zdCBsb2NhbFJldHVyblBvaW50ID0gbG9jYWxCb3VuZHMuY2VudGVyLnBsdXMoIGxvY2FsQm91bmRzLmNlbnRlckJvdHRvbSApLmRpdmlkZWRTY2FsYXIoIDIgKTtcclxuXHJcbiAgICAvLyBBbmQgdGhlIGJvdW5kcyBvZiBvdXIgcGFuZWxcclxuICAgIGNvbnN0IHBhbmVsQm91bmRzID0gdGhpcy5leHBsb3JlUGFuZWwuYm91bmRzLndpdGhNYXhZKCB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eS52YWx1ZS5ib3R0b20gKTtcclxuXHJcbiAgICAvLyBWaWV3IGNvb3JkaW5hdGUgb2Ygb3VyIHJldHVybiBwb2ludFxyXG4gICAgY29uc3QgcGFwZXJDZW50ZXIgPSBjb3VudGluZ09iamVjdC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnBsdXMoIGxvY2FsUmV0dXJuUG9pbnQgKTtcclxuXHJcbiAgICByZXR1cm4gcGFuZWxCb3VuZHMuY29udGFpbnNQb2ludCggcGFwZXJDZW50ZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBvbkNvdW50aW5nT2JqZWN0QWRkZWQoIGNvdW50aW5nT2JqZWN0ICkge1xyXG4gICAgY29uc3QgY291bnRpbmdPYmplY3ROb2RlID0gc3VwZXIub25Db3VudGluZ09iamVjdEFkZGVkKCBjb3VudGluZ09iamVjdCApO1xyXG5cclxuICAgIC8vIEFkZCBsaXN0ZW5lcnNcclxuICAgIGNvdW50aW5nT2JqZWN0Tm9kZS5zcGxpdEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMubnVtYmVyU3BsaXRMaXN0ZW5lciApO1xyXG4gICAgY291bnRpbmdPYmplY3ROb2RlLmludGVyYWN0aW9uU3RhcnRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMubnVtYmVySW50ZXJhY3Rpb25MaXN0ZW5lciApO1xyXG4gICAgY291bnRpbmdPYmplY3QuZW5kQW5pbWF0aW9uRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5udW1iZXJBbmltYXRpb25GaW5pc2hlZExpc3RlbmVyICk7XHJcbiAgICBjb3VudGluZ09iamVjdE5vZGUuZW5kRHJhZ0VtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMubnVtYmVyRHJhZ0ZpbmlzaGVkTGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBvbkNvdW50aW5nT2JqZWN0UmVtb3ZlZCggY291bnRpbmdPYmplY3QgKSB7XHJcbiAgICBjb25zdCBjb3VudGluZ09iamVjdE5vZGUgPSB0aGlzLmZpbmRDb3VudGluZ09iamVjdE5vZGUoIGNvdW50aW5nT2JqZWN0ICk7XHJcblxyXG4gICAgLy8gUmVtb3ZlIGxpc3RlbmVyc1xyXG4gICAgY291bnRpbmdPYmplY3ROb2RlLmVuZERyYWdFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLm51bWJlckRyYWdGaW5pc2hlZExpc3RlbmVyICk7XHJcbiAgICBjb3VudGluZ09iamVjdC5lbmRBbmltYXRpb25FbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLm51bWJlckFuaW1hdGlvbkZpbmlzaGVkTGlzdGVuZXIgKTtcclxuICAgIGNvdW50aW5nT2JqZWN0Tm9kZS5pbnRlcmFjdGlvblN0YXJ0ZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLm51bWJlckludGVyYWN0aW9uTGlzdGVuZXIgKTtcclxuICAgIGNvdW50aW5nT2JqZWN0Tm9kZS5zcGxpdEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMubnVtYmVyU3BsaXRMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIERldGFjaCBhbnkgYXR0YWNoZWQgY3Vlc1xyXG4gICAgaWYgKCB0aGlzLm1vZGVsLnNwbGl0Q3VlLmNvdW50aW5nT2JqZWN0UHJvcGVydHkudmFsdWUgPT09IGNvdW50aW5nT2JqZWN0ICkge1xyXG4gICAgICB0aGlzLm1vZGVsLnNwbGl0Q3VlLmRldGFjaCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyLm9uQ291bnRpbmdPYmplY3RSZW1vdmVkKCBjb3VudGluZ09iamVjdCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gYSBjb3VudGluZyBvYmplY3Qgbm9kZSBpcyBzcGxpdC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtDb3VudGluZ09iamVjdE5vZGV9IGNvdW50aW5nT2JqZWN0Tm9kZVxyXG4gICAqL1xyXG4gIG9uTnVtYmVyU3BsaXQoIGNvdW50aW5nT2JqZWN0Tm9kZSApIHtcclxuICAgIHRoaXMubW9kZWwuc3BsaXRDdWUudHJpZ2dlckZhZGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGEgY291bnRpbmcgb2JqZWN0IG5vZGUgc3RhcnRzIGJlaW5nIGludGVyYWN0ZWQgd2l0aC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtDb3VudGluZ09iamVjdE5vZGV9IGNvdW50aW5nT2JqZWN0Tm9kZVxyXG4gICAqL1xyXG4gIG9uTnVtYmVySW50ZXJhY3Rpb25TdGFydGVkKCBjb3VudGluZ09iamVjdE5vZGUgKSB7XHJcbiAgICBjb25zdCBjb3VudGluZ09iamVjdCA9IGNvdW50aW5nT2JqZWN0Tm9kZS5jb3VudGluZ09iamVjdDtcclxuICAgIGlmICggY291bnRpbmdPYmplY3QubnVtYmVyVmFsdWVQcm9wZXJ0eS52YWx1ZSA+IDEgKSB7XHJcbiAgICAgIHRoaXMubW9kZWwuc3BsaXRDdWUuYXR0YWNoVG9OdW1iZXIoIGNvdW50aW5nT2JqZWN0ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIGNvdW50aW5nIG9iamVjdCBoYXMgZmluaXNoZWQgYW5pbWF0aW5nIHRvIGl0cyBkZXN0aW5hdGlvbi5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtDb3VudGluZ09iamVjdH0gY291bnRpbmdPYmplY3RcclxuICAgKi9cclxuICBvbk51bWJlckFuaW1hdGlvbkZpbmlzaGVkKCBjb3VudGluZ09iamVjdCApIHtcclxuICAgIC8vIElmIGl0IGFuaW1hdGVkIHRvIHRoZSByZXR1cm4gem9uZSwgaXQncyBwcm9iYWJseSBzcGxpdCBhbmQgbWVhbnQgdG8gYmUgcmV0dXJuZWQuXHJcbiAgICBpZiAoIHRoaXMuaXNOdW1iZXJJblJldHVyblpvbmUoIGNvdW50aW5nT2JqZWN0ICkgKSB7XHJcbiAgICAgIHRoaXMubW9kZWwucmVtb3ZlQ291bnRpbmdPYmplY3QoIGNvdW50aW5nT2JqZWN0ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIGNvdW50aW5nIG9iamVjdCBoYXMgZmluaXNoZWQgYmVpbmcgZHJhZ2dlZC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtDb3VudGluZ09iamVjdE5vZGV9IGNvdW50aW5nT2JqZWN0Tm9kZVxyXG4gICAqL1xyXG4gIG9uTnVtYmVyRHJhZ0ZpbmlzaGVkKCBjb3VudGluZ09iamVjdE5vZGUgKSB7XHJcbiAgICBjb25zdCBjb3VudGluZ09iamVjdCA9IGNvdW50aW5nT2JqZWN0Tm9kZS5jb3VudGluZ09iamVjdDtcclxuXHJcbiAgICAvLyBSZXR1cm4gaXQgdG8gdGhlIHBhbmVsIGlmIGl0J3MgYmVlbiBkcm9wcGVkIGluIHRoZSBwYW5lbC5cclxuICAgIGlmICggdGhpcy5pc051bWJlckluUmV0dXJuWm9uZSggY291bnRpbmdPYmplY3QgKSApIHtcclxuICAgICAgY29uc3QgYmFzZU51bWJlcnMgPSBjb3VudGluZ09iamVjdC5iYXNlTnVtYmVycztcclxuXHJcbiAgICAgIC8vIFNwbGl0IGl0IGludG8gYSBDb3VudGluZ09iamVjdCBmb3IgZWFjaCBvZiBpdHMgYmFzZSBudW1iZXJzLCBhbmQgYW5pbWF0ZSB0aGVtIHRvIHRoZWlyIHRhcmdldHMgaW4gdGhlXHJcbiAgICAgIC8vIGV4cGxvcmUgcGFuZWwuXHJcbiAgICAgIGZvciAoIGxldCBpID0gYmFzZU51bWJlcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgICAgY29uc3QgYmFzZU51bWJlciA9IGJhc2VOdW1iZXJzWyBpIF07XHJcbiAgICAgICAgY29uc3QgYmFzZUNvdW50aW5nT2JqZWN0ID0gbmV3IENvdW50aW5nT2JqZWN0KCBiYXNlTnVtYmVyLm51bWJlclZhbHVlLCBjb3VudGluZ09iamVjdC5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgICAgIC8vIFNldCBpdHMgZGVzdGluYXRpb24gdG8gdGhlIHByb3BlciB0YXJnZXQgKHdpdGggdGhlIG9mZnNldCBzbyB0aGF0IGl0IHdpbGwgZGlzYXBwZWFyIG9uY2UgY2VudGVyZWQpLlxyXG4gICAgICAgIGxldCB0YXJnZXRQb3NpdGlvbiA9IHRoaXMuZXhwbG9yZVBhbmVsLmRpZ2l0TGVuZ3RoVG9UYXJnZXROb2RlWyBiYXNlTnVtYmVyLmRpZ2l0TGVuZ3RoIF0uZ2V0T3JpZ2luUG9zaXRpb24oKTtcclxuICAgICAgICBjb25zdCBwYXBlckNlbnRlck9mZnNldCA9IG5ldyBDb3VudGluZ09iamVjdCggYmFzZU51bWJlci5udW1iZXJWYWx1ZSwgbmV3IFZlY3RvcjIoIDAsIDAgKSApLmxvY2FsQm91bmRzLmNlbnRlcjtcclxuICAgICAgICB0YXJnZXRQb3NpdGlvbiA9IHRhcmdldFBvc2l0aW9uLm1pbnVzKCBwYXBlckNlbnRlck9mZnNldCApO1xyXG4gICAgICAgIGJhc2VDb3VudGluZ09iamVjdC5zZXREZXN0aW5hdGlvbiggdGFyZ2V0UG9zaXRpb24sIHRydWUgKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIHRoZSBuZXcgYmFzZSBjb3VudGluZyBvYmplY3RcclxuICAgICAgICB0aGlzLm1vZGVsLmFkZENvdW50aW5nT2JqZWN0KCBiYXNlQ291bnRpbmdPYmplY3QgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUmVtb3ZlIHRoZSBvcmlnaW5hbCBjb3VudGluZyBvYmplY3QgKGFzIHdlIGhhdmUgYWRkZWQgaXRzIGNvbXBvbmVudHMpLlxyXG4gICAgICB0aGlzLm1vZGVsLnJlbW92ZUNvdW50aW5nT2JqZWN0KCBjb3VudGluZ09iamVjdCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuXHJcbiAgICB0aGlzLmhpZGVTdW1Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxubWFrZUFUZW4ucmVnaXN0ZXIoICdNYWtlQVRlbkV4cGxvcmVTY3JlZW5WaWV3JywgTWFrZUFUZW5FeHBsb3JlU2NyZWVuVmlldyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTWFrZUFUZW5FeHBsb3JlU2NyZWVuVmlldztcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLDJDQUEyQztBQUN2RSxPQUFPQyxjQUFjLE1BQU0sa0VBQWtFO0FBQzdGLE9BQU9DLHdCQUF3QixNQUFNLDJFQUEyRTtBQUNoSCxPQUFPQyxPQUFPLE1BQU0sa0NBQWtDO0FBQ3RELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsT0FBT0MsUUFBUSxNQUFNLDRDQUE0QztBQUNqRSxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxzQ0FBc0M7QUFDakUsT0FBT0MsUUFBUSxNQUFNLG1DQUFtQztBQUN4RCxPQUFPQyxRQUFRLE1BQU0sc0JBQXNCO0FBQzNDLE9BQU9DLGVBQWUsTUFBTSw2QkFBNkI7QUFDekQsT0FBT0MsaUJBQWlCLE1BQU0sbUNBQW1DO0FBQ2pFLE9BQU9DLFlBQVksTUFBTSxtQkFBbUI7QUFDNUMsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjtBQUU1QyxNQUFNQyxlQUFlLEdBQUdKLGVBQWUsQ0FBQ0ssU0FBUzs7QUFFakQ7QUFDQSxNQUFNQyxhQUFhLEdBQUcsSUFBSVgsUUFBUSxDQUFFO0VBQUVZLElBQUksRUFBRSxFQUFFO0VBQUVDLE1BQU0sRUFBRTtBQUFPLENBQUUsQ0FBQztBQUVsRSxNQUFNQyx5QkFBeUIsU0FBU2pCLHdCQUF3QixDQUFDO0VBQy9EO0FBQ0Y7QUFDQTtFQUNFa0IsV0FBV0EsQ0FBRUMs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