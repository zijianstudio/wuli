// Copyright 2018-2022, University of Colorado Boulder

/**
 * Main view for FractionChallenges
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text, VBox } from '../../../../scenery/js/imports.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import NumberGroupStack from '../../building/model/NumberGroupStack.js';
import NumberStack from '../../building/model/NumberStack.js';
import ShapeGroupStack from '../../building/model/ShapeGroupStack.js';
import ShapeStack from '../../building/model/ShapeStack.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import fractionsCommon from '../../fractionsCommon.js';
import FractionsCommonStrings from '../../FractionsCommonStrings.js';
import FractionChallengePanel from './FractionChallengePanel.js';
import GameLayerNode from './GameLayerNode.js';
import TargetNode from './TargetNode.js';
const levelTitlePatternString = FractionsCommonStrings.levelTitlePattern;
const nextString = VegasStrings.next;

// constants
const PANEL_MARGIN = FractionsCommonConstants.PANEL_MARGIN;
class FractionChallengeNode extends Node {
  /**
   * @param {FractionChallenge} challenge
   * @param {Bounds2} layoutBounds
   * @param {function|null} nextLevelCallback - Called with no arguments, forwards to the next level (if there is one)
   * @param {Emitter} incorrectAttemptEmitter
   * @param {Property.<boolean>} allLevelsCompleteProperty
   */
  constructor(challenge, layoutBounds, nextLevelCallback, incorrectAttemptEmitter, allLevelsCompleteProperty) {
    super();

    // @private {FractionChallenge}
    this.challenge = challenge;

    // @private {Property.<Bounds2>}
    this.shapeDragBoundsProperty = new Property(layoutBounds);
    this.numberDragBoundsProperty = new Property(layoutBounds);

    // @private {Node}
    this.panel = new FractionChallengePanel(challenge, (event, stack) => {
      if (!stack.array.length) {
        return;
      }
      const modelPoint = this.modelViewTransform.viewToModelPosition(this.globalToLocalPoint(event.pointer.point));
      if (stack instanceof ShapeStack) {
        const shapePiece = challenge.pullShapePieceFromStack(stack, modelPoint);
        const shapePieceNode = this.layerNode.getShapePieceNode(shapePiece);
        shapePieceNode.dragListener.press(event, shapePieceNode);
      } else if (stack instanceof NumberStack) {
        const numberPiece = challenge.pullNumberPieceFromStack(stack, modelPoint);
        const numberPieceNode = this.layerNode.getNumberPieceNode(numberPiece);
        numberPieceNode.dragListener.press(event, numberPieceNode);
      } else if (stack instanceof ShapeGroupStack) {
        const shapeGroup = challenge.pullGroupFromStack(stack, modelPoint);
        const shapeGroupNode = this.layerNode.getShapeGroupNode(shapeGroup);
        shapeGroupNode.dragListener.press(event, shapeGroupNode);
      } else if (stack instanceof NumberGroupStack) {
        const numberGroup = challenge.pullGroupFromStack(stack, modelPoint);
        const numberGroupNode = this.layerNode.getNumberGroupNode(numberGroup);
        numberGroupNode.dragListener.press(event, numberGroupNode);
      } else {
        throw new Error('unknown stack type');
      }
    });

    // @private {Array.<Node>}
    this.targetNodes = challenge.targets.map(target => new TargetNode(target, challenge));

    // @private {Node}
    this.targetsContainer = new VBox({
      spacing: 0,
      align: 'left',
      children: this.targetNodes
    });

    // @private {Node}
    this.levelText = new Text(StringUtils.fillIn(levelTitlePatternString, {
      number: challenge.levelNumber
    }), {
      font: new PhetFont({
        size: 30,
        weight: 'bold'
      }),
      maxWidth: 400
    });

    // @private {TextPushButton}
    this.nextLevelButton = new TextPushButton(nextString, {
      listener: nextLevelCallback,
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      font: new PhetFont(24),
      maxTextWidth: 150
    });

    // @private {Node}
    this.levelCompleteNode = new VBox({
      spacing: 10,
      children: [new FaceNode(180), ...(nextLevelCallback ? [this.nextLevelButton] : [])]
    });

    // @private {function}
    this.levelCompleteListener = score => {
      this.levelCompleteNode.visible = score === this.challenge.targets.length && !allLevelsCompleteProperty.value;
    };
    this.challenge.scoreProperty.link(this.levelCompleteListener);

    // layout
    this.panel.bottom = layoutBounds.bottom - PANEL_MARGIN;
    this.targetsContainer.right = layoutBounds.right - PANEL_MARGIN;
    const horizontalCenter = (layoutBounds.left + this.targetsContainer.left) / 2;
    this.targetsContainer.centerY = 234; // Tuned so that this should be just high enough to work for stacks of 10
    this.panel.centerX = horizontalCenter;
    if (this.panel.left < PANEL_MARGIN) {
      this.panel.left = PANEL_MARGIN;
    }
    this.levelText.centerX = horizontalCenter;
    this.levelText.top = layoutBounds.top + PANEL_MARGIN;
    const verticalCenter = (this.levelText.bottom + this.panel.top) / 2;
    const center = new Vector2(horizontalCenter, verticalCenter);
    // @public {Vector2}
    this.challengeCenter = center;
    this.levelCompleteNode.center = center;

    // @public {ModelViewTransform2}
    this.modelViewTransform = new ModelViewTransform2(Matrix3.translationFromVector(center));
    this.panel.updateModelPositions(this.modelViewTransform);
    this.targetNodes.forEach(targetNode => targetNode.updateModelPositions(this.modelViewTransform, this.targetsContainer));
    this.shapeDragBoundsProperty.value = this.modelViewTransform.viewToModelBounds(layoutBounds);
    this.numberDragBoundsProperty.value = this.modelViewTransform.viewToModelBounds(layoutBounds);

    // @private {GameLayerNode}
    this.layerNode = new GameLayerNode(challenge, this.modelViewTransform, this.shapeDragBoundsProperty, this.numberDragBoundsProperty, this.targetsContainer, this.panel, incorrectAttemptEmitter);
    this.children = [this.panel, this.targetsContainer, this.levelText, this.layerNode, this.levelCompleteNode];
  }

  /**
   * Checks whether the given pointer is the last pointer actively manipulating a group.
   * @public
   *
   * @param {Pointer} pointer
   * @returns {boolean}
   */
  isPointerActive(pointer) {
    return this.layerNode.activePointerProperty.value === pointer;
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.layerNode.dispose();
    this.challenge.scoreProperty.unlink(this.levelCompleteListener);
    this.nextLevelButton.dispose();
    this.targetNodes.forEach(targetNode => targetNode.dispose());
    this.panel.dispose();
    super.dispose();
  }
}
fractionsCommon.register('FractionChallengeNode', FractionChallengeNode);
export default FractionChallengeNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIk1hdHJpeDMiLCJWZWN0b3IyIiwiU3RyaW5nVXRpbHMiLCJNb2RlbFZpZXdUcmFuc2Zvcm0yIiwiRmFjZU5vZGUiLCJQaGV0Q29sb3JTY2hlbWUiLCJQaGV0Rm9udCIsIk5vZGUiLCJUZXh0IiwiVkJveCIsIlRleHRQdXNoQnV0dG9uIiwiVmVnYXNTdHJpbmdzIiwiTnVtYmVyR3JvdXBTdGFjayIsIk51bWJlclN0YWNrIiwiU2hhcGVHcm91cFN0YWNrIiwiU2hhcGVTdGFjayIsIkZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cyIsImZyYWN0aW9uc0NvbW1vbiIsIkZyYWN0aW9uc0NvbW1vblN0cmluZ3MiLCJGcmFjdGlvbkNoYWxsZW5nZVBhbmVsIiwiR2FtZUxheWVyTm9kZSIsIlRhcmdldE5vZGUiLCJsZXZlbFRpdGxlUGF0dGVyblN0cmluZyIsImxldmVsVGl0bGVQYXR0ZXJuIiwibmV4dFN0cmluZyIsIm5leHQiLCJQQU5FTF9NQVJHSU4iLCJGcmFjdGlvbkNoYWxsZW5nZU5vZGUiLCJjb25zdHJ1Y3RvciIsImNoYWxsZW5nZSIsImxheW91dEJvdW5kcyIsIm5leHRMZXZlbENhbGxiYWNrIiwiaW5jb3JyZWN0QXR0ZW1wdEVtaXR0ZXIiLCJhbGxMZXZlbHNDb21wbGV0ZVByb3BlcnR5Iiwic2hhcGVEcmFnQm91bmRzUHJvcGVydHkiLCJudW1iZXJEcmFnQm91bmRzUHJvcGVydHkiLCJwYW5lbCIsImV2ZW50Iiwic3RhY2siLCJhcnJheSIsImxlbmd0aCIsIm1vZGVsUG9pbnQiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJ2aWV3VG9Nb2RlbFBvc2l0aW9uIiwiZ2xvYmFsVG9Mb2NhbFBvaW50IiwicG9pbnRlciIsInBvaW50Iiwic2hhcGVQaWVjZSIsInB1bGxTaGFwZVBpZWNlRnJvbVN0YWNrIiwic2hhcGVQaWVjZU5vZGUiLCJsYXllck5vZGUiLCJnZXRTaGFwZVBpZWNlTm9kZSIsImRyYWdMaXN0ZW5lciIsInByZXNzIiwibnVtYmVyUGllY2UiLCJwdWxsTnVtYmVyUGllY2VGcm9tU3RhY2siLCJudW1iZXJQaWVjZU5vZGUiLCJnZXROdW1iZXJQaWVjZU5vZGUiLCJzaGFwZUdyb3VwIiwicHVsbEdyb3VwRnJvbVN0YWNrIiwic2hhcGVHcm91cE5vZGUiLCJnZXRTaGFwZUdyb3VwTm9kZSIsIm51bWJlckdyb3VwIiwibnVtYmVyR3JvdXBOb2RlIiwiZ2V0TnVtYmVyR3JvdXBOb2RlIiwiRXJyb3IiLCJ0YXJnZXROb2RlcyIsInRhcmdldHMiLCJtYXAiLCJ0YXJnZXQiLCJ0YXJnZXRzQ29udGFpbmVyIiwic3BhY2luZyIsImFsaWduIiwiY2hpbGRyZW4iLCJsZXZlbFRleHQiLCJmaWxsSW4iLCJudW1iZXIiLCJsZXZlbE51bWJlciIsImZvbnQiLCJzaXplIiwid2VpZ2h0IiwibWF4V2lkdGgiLCJuZXh0TGV2ZWxCdXR0b24iLCJsaXN0ZW5lciIsImJhc2VDb2xvciIsIkJVVFRPTl9ZRUxMT1ciLCJtYXhUZXh0V2lkdGgiLCJsZXZlbENvbXBsZXRlTm9kZSIsImxldmVsQ29tcGxldGVMaXN0ZW5lciIsInNjb3JlIiwidmlzaWJsZSIsInZhbHVlIiwic2NvcmVQcm9wZXJ0eSIsImxpbmsiLCJib3R0b20iLCJyaWdodCIsImhvcml6b250YWxDZW50ZXIiLCJsZWZ0IiwiY2VudGVyWSIsImNlbnRlclgiLCJ0b3AiLCJ2ZXJ0aWNhbENlbnRlciIsImNlbnRlciIsImNoYWxsZW5nZUNlbnRlciIsInRyYW5zbGF0aW9uRnJvbVZlY3RvciIsInVwZGF0ZU1vZGVsUG9zaXRpb25zIiwiZm9yRWFjaCIsInRhcmdldE5vZGUiLCJ2aWV3VG9Nb2RlbEJvdW5kcyIsImlzUG9pbnRlckFjdGl2ZSIsImFjdGl2ZVBvaW50ZXJQcm9wZXJ0eSIsImRpc3Bvc2UiLCJ1bmxpbmsiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkZyYWN0aW9uQ2hhbGxlbmdlTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIHZpZXcgZm9yIEZyYWN0aW9uQ2hhbGxlbmdlc1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IEZhY2VOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9GYWNlTm9kZS5qcyc7XHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRDb2xvclNjaGVtZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRleHRQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1RleHRQdXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IFZlZ2FzU3RyaW5ncyBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9WZWdhc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgTnVtYmVyR3JvdXBTdGFjayBmcm9tICcuLi8uLi9idWlsZGluZy9tb2RlbC9OdW1iZXJHcm91cFN0YWNrLmpzJztcclxuaW1wb3J0IE51bWJlclN0YWNrIGZyb20gJy4uLy4uL2J1aWxkaW5nL21vZGVsL051bWJlclN0YWNrLmpzJztcclxuaW1wb3J0IFNoYXBlR3JvdXBTdGFjayBmcm9tICcuLi8uLi9idWlsZGluZy9tb2RlbC9TaGFwZUdyb3VwU3RhY2suanMnO1xyXG5pbXBvcnQgU2hhcGVTdGFjayBmcm9tICcuLi8uLi9idWlsZGluZy9tb2RlbC9TaGFwZVN0YWNrLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IGZyYWN0aW9uc0NvbW1vbiBmcm9tICcuLi8uLi9mcmFjdGlvbnNDb21tb24uanMnO1xyXG5pbXBvcnQgRnJhY3Rpb25zQ29tbW9uU3RyaW5ncyBmcm9tICcuLi8uLi9GcmFjdGlvbnNDb21tb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uQ2hhbGxlbmdlUGFuZWwgZnJvbSAnLi9GcmFjdGlvbkNoYWxsZW5nZVBhbmVsLmpzJztcclxuaW1wb3J0IEdhbWVMYXllck5vZGUgZnJvbSAnLi9HYW1lTGF5ZXJOb2RlLmpzJztcclxuaW1wb3J0IFRhcmdldE5vZGUgZnJvbSAnLi9UYXJnZXROb2RlLmpzJztcclxuXHJcbmNvbnN0IGxldmVsVGl0bGVQYXR0ZXJuU3RyaW5nID0gRnJhY3Rpb25zQ29tbW9uU3RyaW5ncy5sZXZlbFRpdGxlUGF0dGVybjtcclxuY29uc3QgbmV4dFN0cmluZyA9IFZlZ2FzU3RyaW5ncy5uZXh0O1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFBBTkVMX01BUkdJTiA9IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5QQU5FTF9NQVJHSU47XHJcblxyXG5jbGFzcyBGcmFjdGlvbkNoYWxsZW5nZU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge0ZyYWN0aW9uQ2hhbGxlbmdlfSBjaGFsbGVuZ2VcclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IGxheW91dEJvdW5kc1xyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb258bnVsbH0gbmV4dExldmVsQ2FsbGJhY2sgLSBDYWxsZWQgd2l0aCBubyBhcmd1bWVudHMsIGZvcndhcmRzIHRvIHRoZSBuZXh0IGxldmVsIChpZiB0aGVyZSBpcyBvbmUpXHJcbiAgICogQHBhcmFtIHtFbWl0dGVyfSBpbmNvcnJlY3RBdHRlbXB0RW1pdHRlclxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBhbGxMZXZlbHNDb21wbGV0ZVByb3BlcnR5XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNoYWxsZW5nZSwgbGF5b3V0Qm91bmRzLCBuZXh0TGV2ZWxDYWxsYmFjaywgaW5jb3JyZWN0QXR0ZW1wdEVtaXR0ZXIsIGFsbExldmVsc0NvbXBsZXRlUHJvcGVydHkgKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtGcmFjdGlvbkNoYWxsZW5nZX1cclxuICAgIHRoaXMuY2hhbGxlbmdlID0gY2hhbGxlbmdlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtQcm9wZXJ0eS48Qm91bmRzMj59XHJcbiAgICB0aGlzLnNoYXBlRHJhZ0JvdW5kc1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBsYXlvdXRCb3VuZHMgKTtcclxuICAgIHRoaXMubnVtYmVyRHJhZ0JvdW5kc1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBsYXlvdXRCb3VuZHMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Tm9kZX1cclxuICAgIHRoaXMucGFuZWwgPSBuZXcgRnJhY3Rpb25DaGFsbGVuZ2VQYW5lbCggY2hhbGxlbmdlLCAoIGV2ZW50LCBzdGFjayApID0+IHtcclxuICAgICAgaWYgKCAhc3RhY2suYXJyYXkubGVuZ3RoICkgeyByZXR1cm47IH1cclxuICAgICAgY29uc3QgbW9kZWxQb2ludCA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsUG9zaXRpb24oIHRoaXMuZ2xvYmFsVG9Mb2NhbFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkgKTtcclxuICAgICAgaWYgKCBzdGFjayBpbnN0YW5jZW9mIFNoYXBlU3RhY2sgKSB7XHJcbiAgICAgICAgY29uc3Qgc2hhcGVQaWVjZSA9IGNoYWxsZW5nZS5wdWxsU2hhcGVQaWVjZUZyb21TdGFjayggc3RhY2ssIG1vZGVsUG9pbnQgKTtcclxuICAgICAgICBjb25zdCBzaGFwZVBpZWNlTm9kZSA9IHRoaXMubGF5ZXJOb2RlLmdldFNoYXBlUGllY2VOb2RlKCBzaGFwZVBpZWNlICk7XHJcbiAgICAgICAgc2hhcGVQaWVjZU5vZGUuZHJhZ0xpc3RlbmVyLnByZXNzKCBldmVudCwgc2hhcGVQaWVjZU5vZGUgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggc3RhY2sgaW5zdGFuY2VvZiBOdW1iZXJTdGFjayApIHtcclxuICAgICAgICBjb25zdCBudW1iZXJQaWVjZSA9IGNoYWxsZW5nZS5wdWxsTnVtYmVyUGllY2VGcm9tU3RhY2soIHN0YWNrLCBtb2RlbFBvaW50ICk7XHJcbiAgICAgICAgY29uc3QgbnVtYmVyUGllY2VOb2RlID0gdGhpcy5sYXllck5vZGUuZ2V0TnVtYmVyUGllY2VOb2RlKCBudW1iZXJQaWVjZSApO1xyXG4gICAgICAgIG51bWJlclBpZWNlTm9kZS5kcmFnTGlzdGVuZXIucHJlc3MoIGV2ZW50LCBudW1iZXJQaWVjZU5vZGUgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggc3RhY2sgaW5zdGFuY2VvZiBTaGFwZUdyb3VwU3RhY2sgKSB7XHJcbiAgICAgICAgY29uc3Qgc2hhcGVHcm91cCA9IGNoYWxsZW5nZS5wdWxsR3JvdXBGcm9tU3RhY2soIHN0YWNrLCBtb2RlbFBvaW50ICk7XHJcbiAgICAgICAgY29uc3Qgc2hhcGVHcm91cE5vZGUgPSB0aGlzLmxheWVyTm9kZS5nZXRTaGFwZUdyb3VwTm9kZSggc2hhcGVHcm91cCApO1xyXG4gICAgICAgIHNoYXBlR3JvdXBOb2RlLmRyYWdMaXN0ZW5lci5wcmVzcyggZXZlbnQsIHNoYXBlR3JvdXBOb2RlICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHN0YWNrIGluc3RhbmNlb2YgTnVtYmVyR3JvdXBTdGFjayApIHtcclxuICAgICAgICBjb25zdCBudW1iZXJHcm91cCA9IGNoYWxsZW5nZS5wdWxsR3JvdXBGcm9tU3RhY2soIHN0YWNrLCBtb2RlbFBvaW50ICk7XHJcbiAgICAgICAgY29uc3QgbnVtYmVyR3JvdXBOb2RlID0gdGhpcy5sYXllck5vZGUuZ2V0TnVtYmVyR3JvdXBOb2RlKCBudW1iZXJHcm91cCApO1xyXG4gICAgICAgIG51bWJlckdyb3VwTm9kZS5kcmFnTGlzdGVuZXIucHJlc3MoIGV2ZW50LCBudW1iZXJHcm91cE5vZGUgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICd1bmtub3duIHN0YWNrIHR5cGUnICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QXJyYXkuPE5vZGU+fVxyXG4gICAgdGhpcy50YXJnZXROb2RlcyA9IGNoYWxsZW5nZS50YXJnZXRzLm1hcCggdGFyZ2V0ID0+IG5ldyBUYXJnZXROb2RlKCB0YXJnZXQsIGNoYWxsZW5nZSApICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge05vZGV9XHJcbiAgICB0aGlzLnRhcmdldHNDb250YWluZXIgPSBuZXcgVkJveCgge1xyXG4gICAgICBzcGFjaW5nOiAwLFxyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICBjaGlsZHJlbjogdGhpcy50YXJnZXROb2Rlc1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtOb2RlfVxyXG4gICAgdGhpcy5sZXZlbFRleHQgPSBuZXcgVGV4dCggU3RyaW5nVXRpbHMuZmlsbEluKCBsZXZlbFRpdGxlUGF0dGVyblN0cmluZywgeyBudW1iZXI6IGNoYWxsZW5nZS5sZXZlbE51bWJlciB9ICksIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDMwLCB3ZWlnaHQ6ICdib2xkJyB9ICksXHJcbiAgICAgIG1heFdpZHRoOiA0MDBcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VGV4dFB1c2hCdXR0b259XHJcbiAgICB0aGlzLm5leHRMZXZlbEJ1dHRvbiA9IG5ldyBUZXh0UHVzaEJ1dHRvbiggbmV4dFN0cmluZywge1xyXG4gICAgICBsaXN0ZW5lcjogbmV4dExldmVsQ2FsbGJhY2ssXHJcbiAgICAgIGJhc2VDb2xvcjogUGhldENvbG9yU2NoZW1lLkJVVFRPTl9ZRUxMT1csXHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMjQgKSxcclxuICAgICAgbWF4VGV4dFdpZHRoOiAxNTBcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Tm9kZX1cclxuICAgIHRoaXMubGV2ZWxDb21wbGV0ZU5vZGUgPSBuZXcgVkJveCgge1xyXG4gICAgICBzcGFjaW5nOiAxMCxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgRmFjZU5vZGUoIDE4MCApLFxyXG4gICAgICAgIC4uLiggbmV4dExldmVsQ2FsbGJhY2sgPyBbIHRoaXMubmV4dExldmVsQnV0dG9uIF0gOiBbXSApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259XHJcbiAgICB0aGlzLmxldmVsQ29tcGxldGVMaXN0ZW5lciA9IHNjb3JlID0+IHtcclxuICAgICAgdGhpcy5sZXZlbENvbXBsZXRlTm9kZS52aXNpYmxlID0gc2NvcmUgPT09IHRoaXMuY2hhbGxlbmdlLnRhcmdldHMubGVuZ3RoICYmICFhbGxMZXZlbHNDb21wbGV0ZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgfTtcclxuICAgIHRoaXMuY2hhbGxlbmdlLnNjb3JlUHJvcGVydHkubGluayggdGhpcy5sZXZlbENvbXBsZXRlTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBsYXlvdXRcclxuICAgIHRoaXMucGFuZWwuYm90dG9tID0gbGF5b3V0Qm91bmRzLmJvdHRvbSAtIFBBTkVMX01BUkdJTjtcclxuICAgIHRoaXMudGFyZ2V0c0NvbnRhaW5lci5yaWdodCA9IGxheW91dEJvdW5kcy5yaWdodCAtIFBBTkVMX01BUkdJTjtcclxuICAgIGNvbnN0IGhvcml6b250YWxDZW50ZXIgPSAoIGxheW91dEJvdW5kcy5sZWZ0ICsgdGhpcy50YXJnZXRzQ29udGFpbmVyLmxlZnQgKSAvIDI7XHJcbiAgICB0aGlzLnRhcmdldHNDb250YWluZXIuY2VudGVyWSA9IDIzNDsgLy8gVHVuZWQgc28gdGhhdCB0aGlzIHNob3VsZCBiZSBqdXN0IGhpZ2ggZW5vdWdoIHRvIHdvcmsgZm9yIHN0YWNrcyBvZiAxMFxyXG4gICAgdGhpcy5wYW5lbC5jZW50ZXJYID0gaG9yaXpvbnRhbENlbnRlcjtcclxuICAgIGlmICggdGhpcy5wYW5lbC5sZWZ0IDwgUEFORUxfTUFSR0lOICkge1xyXG4gICAgICB0aGlzLnBhbmVsLmxlZnQgPSBQQU5FTF9NQVJHSU47XHJcbiAgICB9XHJcbiAgICB0aGlzLmxldmVsVGV4dC5jZW50ZXJYID0gaG9yaXpvbnRhbENlbnRlcjtcclxuICAgIHRoaXMubGV2ZWxUZXh0LnRvcCA9IGxheW91dEJvdW5kcy50b3AgKyBQQU5FTF9NQVJHSU47XHJcbiAgICBjb25zdCB2ZXJ0aWNhbENlbnRlciA9ICggdGhpcy5sZXZlbFRleHQuYm90dG9tICsgdGhpcy5wYW5lbC50b3AgKSAvIDI7XHJcbiAgICBjb25zdCBjZW50ZXIgPSBuZXcgVmVjdG9yMiggaG9yaXpvbnRhbENlbnRlciwgdmVydGljYWxDZW50ZXIgKTtcclxuICAgIC8vIEBwdWJsaWMge1ZlY3RvcjJ9XHJcbiAgICB0aGlzLmNoYWxsZW5nZUNlbnRlciA9IGNlbnRlcjtcclxuICAgIHRoaXMubGV2ZWxDb21wbGV0ZU5vZGUuY2VudGVyID0gY2VudGVyO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge01vZGVsVmlld1RyYW5zZm9ybTJ9XHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IG5ldyBNb2RlbFZpZXdUcmFuc2Zvcm0yKCBNYXRyaXgzLnRyYW5zbGF0aW9uRnJvbVZlY3RvciggY2VudGVyICkgKTtcclxuXHJcbiAgICB0aGlzLnBhbmVsLnVwZGF0ZU1vZGVsUG9zaXRpb25zKCB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSApO1xyXG4gICAgdGhpcy50YXJnZXROb2Rlcy5mb3JFYWNoKCB0YXJnZXROb2RlID0+IHRhcmdldE5vZGUudXBkYXRlTW9kZWxQb3NpdGlvbnMoIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLCB0aGlzLnRhcmdldHNDb250YWluZXIgKSApO1xyXG5cclxuICAgIHRoaXMuc2hhcGVEcmFnQm91bmRzUHJvcGVydHkudmFsdWUgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbEJvdW5kcyggbGF5b3V0Qm91bmRzICk7XHJcbiAgICB0aGlzLm51bWJlckRyYWdCb3VuZHNQcm9wZXJ0eS52YWx1ZSA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsQm91bmRzKCBsYXlvdXRCb3VuZHMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7R2FtZUxheWVyTm9kZX1cclxuICAgIHRoaXMubGF5ZXJOb2RlID0gbmV3IEdhbWVMYXllck5vZGUoIGNoYWxsZW5nZSwgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0sIHRoaXMuc2hhcGVEcmFnQm91bmRzUHJvcGVydHksIHRoaXMubnVtYmVyRHJhZ0JvdW5kc1Byb3BlcnR5LCB0aGlzLnRhcmdldHNDb250YWluZXIsIHRoaXMucGFuZWwsIGluY29ycmVjdEF0dGVtcHRFbWl0dGVyICk7XHJcblxyXG4gICAgdGhpcy5jaGlsZHJlbiA9IFtcclxuICAgICAgdGhpcy5wYW5lbCxcclxuICAgICAgdGhpcy50YXJnZXRzQ29udGFpbmVyLFxyXG4gICAgICB0aGlzLmxldmVsVGV4dCxcclxuICAgICAgdGhpcy5sYXllck5vZGUsXHJcbiAgICAgIHRoaXMubGV2ZWxDb21wbGV0ZU5vZGVcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gcG9pbnRlciBpcyB0aGUgbGFzdCBwb2ludGVyIGFjdGl2ZWx5IG1hbmlwdWxhdGluZyBhIGdyb3VwLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UG9pbnRlcn0gcG9pbnRlclxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGlzUG9pbnRlckFjdGl2ZSggcG9pbnRlciApIHtcclxuICAgIHJldHVybiB0aGlzLmxheWVyTm9kZS5hY3RpdmVQb2ludGVyUHJvcGVydHkudmFsdWUgPT09IHBvaW50ZXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5sYXllck5vZGUuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5jaGFsbGVuZ2Uuc2NvcmVQcm9wZXJ0eS51bmxpbmsoIHRoaXMubGV2ZWxDb21wbGV0ZUxpc3RlbmVyICk7XHJcbiAgICB0aGlzLm5leHRMZXZlbEJ1dHRvbi5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLnRhcmdldE5vZGVzLmZvckVhY2goIHRhcmdldE5vZGUgPT4gdGFyZ2V0Tm9kZS5kaXNwb3NlKCkgKTtcclxuICAgIHRoaXMucGFuZWwuZGlzcG9zZSgpO1xyXG5cclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmZyYWN0aW9uc0NvbW1vbi5yZWdpc3RlciggJ0ZyYWN0aW9uQ2hhbGxlbmdlTm9kZScsIEZyYWN0aW9uQ2hhbGxlbmdlTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBGcmFjdGlvbkNoYWxsZW5nZU5vZGU7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxXQUFXLE1BQU0sK0NBQStDO0FBQ3ZFLE9BQU9DLG1CQUFtQixNQUFNLHVEQUF1RDtBQUN2RixPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLGVBQWUsTUFBTSxnREFBZ0Q7QUFDNUUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUNwRSxPQUFPQyxjQUFjLE1BQU0sOENBQThDO0FBQ3pFLE9BQU9DLFlBQVksTUFBTSxzQ0FBc0M7QUFDL0QsT0FBT0MsZ0JBQWdCLE1BQU0sMENBQTBDO0FBQ3ZFLE9BQU9DLFdBQVcsTUFBTSxxQ0FBcUM7QUFDN0QsT0FBT0MsZUFBZSxNQUFNLHlDQUF5QztBQUNyRSxPQUFPQyxVQUFVLE1BQU0sb0NBQW9DO0FBQzNELE9BQU9DLHdCQUF3QixNQUFNLDBDQUEwQztBQUMvRSxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLHNCQUFzQixNQUFNLGlDQUFpQztBQUNwRSxPQUFPQyxzQkFBc0IsTUFBTSw2QkFBNkI7QUFDaEUsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUM5QyxPQUFPQyxVQUFVLE1BQU0saUJBQWlCO0FBRXhDLE1BQU1DLHVCQUF1QixHQUFHSixzQkFBc0IsQ0FBQ0ssaUJBQWlCO0FBQ3hFLE1BQU1DLFVBQVUsR0FBR2IsWUFBWSxDQUFDYyxJQUFJOztBQUVwQztBQUNBLE1BQU1DLFlBQVksR0FBR1Ysd0JBQXdCLENBQUNVLFlBQVk7QUFFMUQsTUFBTUMscUJB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