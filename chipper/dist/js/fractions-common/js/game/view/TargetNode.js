// Copyright 2018-2022, University of Colorado Boulder

/**
 * Shows a container with a given visual representation of the target (what should go in it).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import ReturnButton from '../../../../scenery-phet/js/buttons/ReturnButton.js';
import GradientRectangle from '../../../../scenery-phet/js/GradientRectangle.js';
import MixedFractionNode from '../../../../scenery-phet/js/MixedFractionNode.js';
import { Color, HBox, Node, Rectangle } from '../../../../scenery/js/imports.js';
import NumberGroup from '../../building/model/NumberGroup.js';
import NumberPiece from '../../building/model/NumberPiece.js';
import ShapeGroup from '../../building/model/ShapeGroup.js';
import NumberGroupNode from '../../building/view/NumberGroupNode.js';
import ShapeGroupNode from '../../building/view/ShapeGroupNode.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../fractionsCommon.js';
import FilledPartition from '../model/FilledPartition.js';
import ShapePartition from '../model/ShapePartition.js';
import ShapeTarget from '../model/ShapeTarget.js';
import FilledPartitionNode from './FilledPartitionNode.js';

// constants
const CORNER_RADIUS = 5;
const CORNER_OFFSET = 1;
const MIXED_SCALE = 0.6;
const UNMIXED_IMPROPER_SCALE = 0.9;
const UNMIXED_PROPER_SCALE = 1;

// compute the maximum width for our different scales
const maxPartitionWidthMap = {};
[MIXED_SCALE, UNMIXED_IMPROPER_SCALE, UNMIXED_PROPER_SCALE].forEach(scale => {
  maxPartitionWidthMap[scale] = Math.max(...ShapePartition.GAME_PARTITIONS.map(partition => {
    const filledPartition = new FilledPartition(partition, _.range(0, partition.length).map(() => true), Color.RED);
    return new FilledPartitionNode(filledPartition, {
      layoutScale: scale,
      adaptiveScale: true,
      primaryFill: Color.RED
    }).width;
  }));
});
class TargetNode extends HBox {
  /**
   * @param {Target} target
   * @param {FractionChallenge} challenge
   */
  constructor(target, challenge) {
    super({
      spacing: 10
    });

    // @private {Target}
    this.target = target;

    // @private {ModelViewTransform2|null}
    this.modelViewTransform = null;

    // @private {Node|null}
    this.parentContainer = null;
    const isShapeTarget = target instanceof ShapeTarget;

    // @private {Node|null}
    this.placeholder = null;
    if (challenge.hasShapes) {
      const shapeGroup = new ShapeGroup(challenge.representation);
      _.times(challenge.maxTargetWholes - 1, () => shapeGroup.increaseContainerCount());
      this.placeholder = new ShapeGroupNode(shapeGroup, {
        isIcon: true,
        hasButtons: false,
        scale: FractionsCommonConstants.SHAPE_COLLECTION_SCALE
      });
    } else {
      const numberGroup = new NumberGroup(challenge.hasMixedTargets);
      numberGroup.numeratorSpot.pieceProperty.value = new NumberPiece(challenge.maxNumber);
      numberGroup.denominatorSpot.pieceProperty.value = new NumberPiece(challenge.maxNumber);
      if (challenge.hasMixedTargets) {
        numberGroup.wholeSpot.pieceProperty.value = new NumberPiece(challenge.maxNumber);
      }
      this.placeholder = new NumberGroupNode(numberGroup, {
        isIcon: true,
        hasCardBackground: false,
        scale: FractionsCommonConstants.NUMBER_COLLECTION_SCALE
      });
    }
    this.background = new Rectangle(0, 0, this.placeholder.width + (challenge.hasShapes ? 20 : challenge.hasMixedTargets ? 60 : 80), 100, {
      cornerRadius: CORNER_RADIUS,
      fill: FractionsCommonColors.collectionBackgroundProperty,
      stroke: FractionsCommonColors.collectionBorderProperty
    });
    this.placeholder.dispose();
    this.placeholder = null;

    // @private {GradientRectangle}
    this.highlight = new GradientRectangle({
      fill: 'yellow'
    });
    this.highlight.rectBounds = this.background.bounds.eroded(5);
    this.highlight.extension = 0.5;
    this.highlight.margin = 10;
    this.highlightListener = hoveringCount => {
      this.highlight.visible = hoveringCount > 0;
    };
    this.target.hoveringGroups.lengthProperty.link(this.highlightListener);

    // @private {Rectangle}
    this.container = new Node({
      children: [this.highlight, this.background]
    });

    // @private {Vector2}
    this.groupCenter = this.background.center.plusXY(0, challenge.hasShapes ? 10 : 0);

    // @private {Node|null}
    this.groupNode = null;

    // @private {Node}
    this.returnButton = new ReturnButton(() => {
      if (this.groupNode) {
        challenge.returnTarget(target);
      }
    }, {
      cornerRadius: CORNER_RADIUS - CORNER_OFFSET,
      leftTop: this.background.leftTop.plus(new Vector2(CORNER_OFFSET, CORNER_OFFSET))
    });
    this.returnButton.touchArea = this.returnButton.localBounds.dilated(12);
    this.container.addChild(this.returnButton);

    // @private {function}
    this.groupListener = group => {
      this.returnButton.visible = !!group;
      this.groupNode && this.groupNode.dispose();
      this.groupNode = null;
      if (group) {
        if (challenge.hasShapes) {
          this.groupNode = new ShapeGroupNode(group, {
            isIcon: true,
            hasButtons: false,
            scale: FractionsCommonConstants.SHAPE_COLLECTION_SCALE,
            positioned: false
          });
        } else {
          this.groupNode = new NumberGroupNode(group, {
            isIcon: true,
            hasCardBackground: false,
            scale: FractionsCommonConstants.NUMBER_COLLECTION_SCALE,
            positioned: false
          });
        }
        this.groupNode.center = this.groupCenter;
        this.container.addChild(this.groupNode);
        if (this.modelViewTransform) {
          // Whenever we get a group placed, we need to update the target position so that the subsequent animation
          // goes to the right place.
          target.positionProperty.value = this.modelViewTransform.viewToModelPosition(this.groupNode.getUniqueTrailTo(this.parentContainer).localToGlobalPoint(Vector2.ZERO));
        }
      }
    };
    this.target.groupProperty.link(this.groupListener);
    this.addChild(this.container);
    if (isShapeTarget) {
      const scale = challenge.hasMixedTargets ? 0.6 : challenge.maxTargetWholes > 1 ? 0.9 : 1;
      const padding = 10;
      const maxWidth = maxPartitionWidthMap[scale];
      const box = new HBox({
        spacing: padding,
        children: target.filledPartitions.map(filledPartition => new FilledPartitionNode(filledPartition, {
          layoutScale: scale,
          adaptiveScale: true
        }))
      });
      const quantity = target.filledPartitions.length;
      const combinedMaxWidth = maxWidth * quantity + padding * (quantity - 1);
      this.addChild(new Node({
        children: [box],
        localBounds: box.localBounds.withMaxX(box.localBounds.minX + combinedMaxWidth)
      }));
    } else {
      const whole = challenge.hasMixedTargets ? Math.floor(target.fraction.value) : null;
      const numerator = whole ? target.fraction.minus(new Fraction(whole, 1)).numerator : target.fraction.numerator;
      const denominator = target.fraction.denominator;
      this.addChild(new MixedFractionNode({
        whole: whole === 0 ? null : whole,
        numerator: numerator === 0 ? whole === null ? 0 : null : numerator,
        denominator: denominator,
        scale: 1.2
      }));
    }
  }

  /**
   * Sets the model positions of our model objects corresponding to their displayed (view) positions.
   * @public
   *
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Node} parentContainer - A parent node that contains this node, and has no transform relative to the
   *                                 screenView.
   */
  updateModelPositions(modelViewTransform, parentContainer) {
    this.modelViewTransform = modelViewTransform;
    this.parentContainer = parentContainer;

    // Initialize with an approximate position so we can compute the closest target
    this.target.positionProperty.value = modelViewTransform.viewToModelPosition(this.container.getUniqueTrailTo(parentContainer).localToGlobalPoint(this.groupCenter));
  }

  /**
   * Disposes the node
   * @public
   * @override
   */
  dispose() {
    this.target.groupProperty.unlink(this.groupListener);
    this.target.hoveringGroups.lengthProperty.unlink(this.highlightListener);
    this.groupNode && this.groupNode.dispose();
    this.highlight.dispose();
    this.returnButton.dispose();
    super.dispose();
  }
}
fractionsCommon.register('TargetNode', TargetNode);
export default TargetNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiRnJhY3Rpb24iLCJSZXR1cm5CdXR0b24iLCJHcmFkaWVudFJlY3RhbmdsZSIsIk1peGVkRnJhY3Rpb25Ob2RlIiwiQ29sb3IiLCJIQm94IiwiTm9kZSIsIlJlY3RhbmdsZSIsIk51bWJlckdyb3VwIiwiTnVtYmVyUGllY2UiLCJTaGFwZUdyb3VwIiwiTnVtYmVyR3JvdXBOb2RlIiwiU2hhcGVHcm91cE5vZGUiLCJGcmFjdGlvbnNDb21tb25Db25zdGFudHMiLCJGcmFjdGlvbnNDb21tb25Db2xvcnMiLCJmcmFjdGlvbnNDb21tb24iLCJGaWxsZWRQYXJ0aXRpb24iLCJTaGFwZVBhcnRpdGlvbiIsIlNoYXBlVGFyZ2V0IiwiRmlsbGVkUGFydGl0aW9uTm9kZSIsIkNPUk5FUl9SQURJVVMiLCJDT1JORVJfT0ZGU0VUIiwiTUlYRURfU0NBTEUiLCJVTk1JWEVEX0lNUFJPUEVSX1NDQUxFIiwiVU5NSVhFRF9QUk9QRVJfU0NBTEUiLCJtYXhQYXJ0aXRpb25XaWR0aE1hcCIsImZvckVhY2giLCJzY2FsZSIsIk1hdGgiLCJtYXgiLCJHQU1FX1BBUlRJVElPTlMiLCJtYXAiLCJwYXJ0aXRpb24iLCJmaWxsZWRQYXJ0aXRpb24iLCJfIiwicmFuZ2UiLCJsZW5ndGgiLCJSRUQiLCJsYXlvdXRTY2FsZSIsImFkYXB0aXZlU2NhbGUiLCJwcmltYXJ5RmlsbCIsIndpZHRoIiwiVGFyZ2V0Tm9kZSIsImNvbnN0cnVjdG9yIiwidGFyZ2V0IiwiY2hhbGxlbmdlIiwic3BhY2luZyIsIm1vZGVsVmlld1RyYW5zZm9ybSIsInBhcmVudENvbnRhaW5lciIsImlzU2hhcGVUYXJnZXQiLCJwbGFjZWhvbGRlciIsImhhc1NoYXBlcyIsInNoYXBlR3JvdXAiLCJyZXByZXNlbnRhdGlvbiIsInRpbWVzIiwibWF4VGFyZ2V0V2hvbGVzIiwiaW5jcmVhc2VDb250YWluZXJDb3VudCIsImlzSWNvbiIsImhhc0J1dHRvbnMiLCJTSEFQRV9DT0xMRUNUSU9OX1NDQUxFIiwibnVtYmVyR3JvdXAiLCJoYXNNaXhlZFRhcmdldHMiLCJudW1lcmF0b3JTcG90IiwicGllY2VQcm9wZXJ0eSIsInZhbHVlIiwibWF4TnVtYmVyIiwiZGVub21pbmF0b3JTcG90Iiwid2hvbGVTcG90IiwiaGFzQ2FyZEJhY2tncm91bmQiLCJOVU1CRVJfQ09MTEVDVElPTl9TQ0FMRSIsImJhY2tncm91bmQiLCJjb3JuZXJSYWRpdXMiLCJmaWxsIiwiY29sbGVjdGlvbkJhY2tncm91bmRQcm9wZXJ0eSIsInN0cm9rZSIsImNvbGxlY3Rpb25Cb3JkZXJQcm9wZXJ0eSIsImRpc3Bvc2UiLCJoaWdobGlnaHQiLCJyZWN0Qm91bmRzIiwiYm91bmRzIiwiZXJvZGVkIiwiZXh0ZW5zaW9uIiwibWFyZ2luIiwiaGlnaGxpZ2h0TGlzdGVuZXIiLCJob3ZlcmluZ0NvdW50IiwidmlzaWJsZSIsImhvdmVyaW5nR3JvdXBzIiwibGVuZ3RoUHJvcGVydHkiLCJsaW5rIiwiY29udGFpbmVyIiwiY2hpbGRyZW4iLCJncm91cENlbnRlciIsImNlbnRlciIsInBsdXNYWSIsImdyb3VwTm9kZSIsInJldHVybkJ1dHRvbiIsInJldHVyblRhcmdldCIsImxlZnRUb3AiLCJwbHVzIiwidG91Y2hBcmVhIiwibG9jYWxCb3VuZHMiLCJkaWxhdGVkIiwiYWRkQ2hpbGQiLCJncm91cExpc3RlbmVyIiwiZ3JvdXAiLCJwb3NpdGlvbmVkIiwicG9zaXRpb25Qcm9wZXJ0eSIsInZpZXdUb01vZGVsUG9zaXRpb24iLCJnZXRVbmlxdWVUcmFpbFRvIiwibG9jYWxUb0dsb2JhbFBvaW50IiwiWkVSTyIsImdyb3VwUHJvcGVydHkiLCJwYWRkaW5nIiwibWF4V2lkdGgiLCJib3giLCJmaWxsZWRQYXJ0aXRpb25zIiwicXVhbnRpdHkiLCJjb21iaW5lZE1heFdpZHRoIiwid2l0aE1heFgiLCJtaW5YIiwid2hvbGUiLCJmbG9vciIsImZyYWN0aW9uIiwibnVtZXJhdG9yIiwibWludXMiLCJkZW5vbWluYXRvciIsInVwZGF0ZU1vZGVsUG9zaXRpb25zIiwidW5saW5rIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUYXJnZXROb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNob3dzIGEgY29udGFpbmVyIHdpdGggYSBnaXZlbiB2aXN1YWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRhcmdldCAod2hhdCBzaG91bGQgZ28gaW4gaXQpLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgRnJhY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9tb2RlbC9GcmFjdGlvbi5qcyc7XHJcbmltcG9ydCBSZXR1cm5CdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUmV0dXJuQnV0dG9uLmpzJztcclxuaW1wb3J0IEdyYWRpZW50UmVjdGFuZ2xlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9HcmFkaWVudFJlY3RhbmdsZS5qcyc7XHJcbmltcG9ydCBNaXhlZEZyYWN0aW9uTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWl4ZWRGcmFjdGlvbk5vZGUuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgSEJveCwgTm9kZSwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IE51bWJlckdyb3VwIGZyb20gJy4uLy4uL2J1aWxkaW5nL21vZGVsL051bWJlckdyb3VwLmpzJztcclxuaW1wb3J0IE51bWJlclBpZWNlIGZyb20gJy4uLy4uL2J1aWxkaW5nL21vZGVsL051bWJlclBpZWNlLmpzJztcclxuaW1wb3J0IFNoYXBlR3JvdXAgZnJvbSAnLi4vLi4vYnVpbGRpbmcvbW9kZWwvU2hhcGVHcm91cC5qcyc7XHJcbmltcG9ydCBOdW1iZXJHcm91cE5vZGUgZnJvbSAnLi4vLi4vYnVpbGRpbmcvdmlldy9OdW1iZXJHcm91cE5vZGUuanMnO1xyXG5pbXBvcnQgU2hhcGVHcm91cE5vZGUgZnJvbSAnLi4vLi4vYnVpbGRpbmcvdmlldy9TaGFwZUdyb3VwTm9kZS5qcyc7XHJcbmltcG9ydCBGcmFjdGlvbnNDb21tb25Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0ZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBGcmFjdGlvbnNDb21tb25Db2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvRnJhY3Rpb25zQ29tbW9uQ29sb3JzLmpzJztcclxuaW1wb3J0IGZyYWN0aW9uc0NvbW1vbiBmcm9tICcuLi8uLi9mcmFjdGlvbnNDb21tb24uanMnO1xyXG5pbXBvcnQgRmlsbGVkUGFydGl0aW9uIGZyb20gJy4uL21vZGVsL0ZpbGxlZFBhcnRpdGlvbi5qcyc7XHJcbmltcG9ydCBTaGFwZVBhcnRpdGlvbiBmcm9tICcuLi9tb2RlbC9TaGFwZVBhcnRpdGlvbi5qcyc7XHJcbmltcG9ydCBTaGFwZVRhcmdldCBmcm9tICcuLi9tb2RlbC9TaGFwZVRhcmdldC5qcyc7XHJcbmltcG9ydCBGaWxsZWRQYXJ0aXRpb25Ob2RlIGZyb20gJy4vRmlsbGVkUGFydGl0aW9uTm9kZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQ09STkVSX1JBRElVUyA9IDU7XHJcbmNvbnN0IENPUk5FUl9PRkZTRVQgPSAxO1xyXG5cclxuY29uc3QgTUlYRURfU0NBTEUgPSAwLjY7XHJcbmNvbnN0IFVOTUlYRURfSU1QUk9QRVJfU0NBTEUgPSAwLjk7XHJcbmNvbnN0IFVOTUlYRURfUFJPUEVSX1NDQUxFID0gMTtcclxuXHJcbi8vIGNvbXB1dGUgdGhlIG1heGltdW0gd2lkdGggZm9yIG91ciBkaWZmZXJlbnQgc2NhbGVzXHJcbmNvbnN0IG1heFBhcnRpdGlvbldpZHRoTWFwID0ge307XHJcblsgTUlYRURfU0NBTEUsIFVOTUlYRURfSU1QUk9QRVJfU0NBTEUsIFVOTUlYRURfUFJPUEVSX1NDQUxFIF0uZm9yRWFjaCggc2NhbGUgPT4ge1xyXG4gIG1heFBhcnRpdGlvbldpZHRoTWFwWyBzY2FsZSBdID0gTWF0aC5tYXgoIC4uLlNoYXBlUGFydGl0aW9uLkdBTUVfUEFSVElUSU9OUy5tYXAoIHBhcnRpdGlvbiA9PiB7XHJcbiAgICBjb25zdCBmaWxsZWRQYXJ0aXRpb24gPSBuZXcgRmlsbGVkUGFydGl0aW9uKCBwYXJ0aXRpb24sIF8ucmFuZ2UoIDAsIHBhcnRpdGlvbi5sZW5ndGggKS5tYXAoICgpID0+IHRydWUgKSwgQ29sb3IuUkVEICk7XHJcbiAgICByZXR1cm4gbmV3IEZpbGxlZFBhcnRpdGlvbk5vZGUoIGZpbGxlZFBhcnRpdGlvbiwge1xyXG4gICAgICBsYXlvdXRTY2FsZTogc2NhbGUsXHJcbiAgICAgIGFkYXB0aXZlU2NhbGU6IHRydWUsXHJcbiAgICAgIHByaW1hcnlGaWxsOiBDb2xvci5SRURcclxuICAgIH0gKS53aWR0aDtcclxuICB9ICkgKTtcclxufSApO1xyXG5cclxuY2xhc3MgVGFyZ2V0Tm9kZSBleHRlbmRzIEhCb3gge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VGFyZ2V0fSB0YXJnZXRcclxuICAgKiBAcGFyYW0ge0ZyYWN0aW9uQ2hhbGxlbmdlfSBjaGFsbGVuZ2VcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFyZ2V0LCBjaGFsbGVuZ2UgKSB7XHJcbiAgICBzdXBlcigge1xyXG4gICAgICBzcGFjaW5nOiAxMFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtUYXJnZXR9XHJcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7TW9kZWxWaWV3VHJhbnNmb3JtMnxudWxsfVxyXG4gICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0gPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtOb2RlfG51bGx9XHJcbiAgICB0aGlzLnBhcmVudENvbnRhaW5lciA9IG51bGw7XHJcblxyXG4gICAgY29uc3QgaXNTaGFwZVRhcmdldCA9IHRhcmdldCBpbnN0YW5jZW9mIFNoYXBlVGFyZ2V0O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtOb2RlfG51bGx9XHJcbiAgICB0aGlzLnBsYWNlaG9sZGVyID0gbnVsbDtcclxuICAgIGlmICggY2hhbGxlbmdlLmhhc1NoYXBlcyApIHtcclxuICAgICAgY29uc3Qgc2hhcGVHcm91cCA9IG5ldyBTaGFwZUdyb3VwKCBjaGFsbGVuZ2UucmVwcmVzZW50YXRpb24gKTtcclxuICAgICAgXy50aW1lcyggY2hhbGxlbmdlLm1heFRhcmdldFdob2xlcyAtIDEsICgpID0+IHNoYXBlR3JvdXAuaW5jcmVhc2VDb250YWluZXJDb3VudCgpICk7XHJcbiAgICAgIHRoaXMucGxhY2Vob2xkZXIgPSBuZXcgU2hhcGVHcm91cE5vZGUoIHNoYXBlR3JvdXAsIHtcclxuICAgICAgICBpc0ljb246IHRydWUsXHJcbiAgICAgICAgaGFzQnV0dG9uczogZmFsc2UsXHJcbiAgICAgICAgc2NhbGU6IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5TSEFQRV9DT0xMRUNUSU9OX1NDQUxFXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBjb25zdCBudW1iZXJHcm91cCA9IG5ldyBOdW1iZXJHcm91cCggY2hhbGxlbmdlLmhhc01peGVkVGFyZ2V0cyApO1xyXG4gICAgICBudW1iZXJHcm91cC5udW1lcmF0b3JTcG90LnBpZWNlUHJvcGVydHkudmFsdWUgPSBuZXcgTnVtYmVyUGllY2UoIGNoYWxsZW5nZS5tYXhOdW1iZXIgKTtcclxuICAgICAgbnVtYmVyR3JvdXAuZGVub21pbmF0b3JTcG90LnBpZWNlUHJvcGVydHkudmFsdWUgPSBuZXcgTnVtYmVyUGllY2UoIGNoYWxsZW5nZS5tYXhOdW1iZXIgKTtcclxuICAgICAgaWYgKCBjaGFsbGVuZ2UuaGFzTWl4ZWRUYXJnZXRzICkge1xyXG4gICAgICAgIG51bWJlckdyb3VwLndob2xlU3BvdC5waWVjZVByb3BlcnR5LnZhbHVlID0gbmV3IE51bWJlclBpZWNlKCBjaGFsbGVuZ2UubWF4TnVtYmVyICk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5wbGFjZWhvbGRlciA9IG5ldyBOdW1iZXJHcm91cE5vZGUoIG51bWJlckdyb3VwLCB7XHJcbiAgICAgICAgaXNJY29uOiB0cnVlLFxyXG4gICAgICAgIGhhc0NhcmRCYWNrZ3JvdW5kOiBmYWxzZSxcclxuICAgICAgICBzY2FsZTogRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLk5VTUJFUl9DT0xMRUNUSU9OX1NDQUxFXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmJhY2tncm91bmQgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCB0aGlzLnBsYWNlaG9sZGVyLndpZHRoICsgKCBjaGFsbGVuZ2UuaGFzU2hhcGVzID8gMjAgOiBjaGFsbGVuZ2UuaGFzTWl4ZWRUYXJnZXRzID8gNjAgOiA4MCApLCAxMDAsIHtcclxuICAgICAgY29ybmVyUmFkaXVzOiBDT1JORVJfUkFESVVTLFxyXG4gICAgICBmaWxsOiBGcmFjdGlvbnNDb21tb25Db2xvcnMuY29sbGVjdGlvbkJhY2tncm91bmRQcm9wZXJ0eSxcclxuICAgICAgc3Ryb2tlOiBGcmFjdGlvbnNDb21tb25Db2xvcnMuY29sbGVjdGlvbkJvcmRlclByb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnBsYWNlaG9sZGVyLmRpc3Bvc2UoKTtcclxuICAgIHRoaXMucGxhY2Vob2xkZXIgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtHcmFkaWVudFJlY3RhbmdsZX1cclxuICAgIHRoaXMuaGlnaGxpZ2h0ID0gbmV3IEdyYWRpZW50UmVjdGFuZ2xlKCB7XHJcbiAgICAgIGZpbGw6ICd5ZWxsb3cnXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmhpZ2hsaWdodC5yZWN0Qm91bmRzID0gdGhpcy5iYWNrZ3JvdW5kLmJvdW5kcy5lcm9kZWQoIDUgKTtcclxuICAgIHRoaXMuaGlnaGxpZ2h0LmV4dGVuc2lvbiA9IDAuNTtcclxuICAgIHRoaXMuaGlnaGxpZ2h0Lm1hcmdpbiA9IDEwO1xyXG4gICAgdGhpcy5oaWdobGlnaHRMaXN0ZW5lciA9IGhvdmVyaW5nQ291bnQgPT4ge1xyXG4gICAgICB0aGlzLmhpZ2hsaWdodC52aXNpYmxlID0gaG92ZXJpbmdDb3VudCA+IDA7XHJcbiAgICB9O1xyXG4gICAgdGhpcy50YXJnZXQuaG92ZXJpbmdHcm91cHMubGVuZ3RoUHJvcGVydHkubGluayggdGhpcy5oaWdobGlnaHRMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtSZWN0YW5nbGV9XHJcbiAgICB0aGlzLmNvbnRhaW5lciA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgdGhpcy5oaWdobGlnaHQsXHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VmVjdG9yMn1cclxuICAgIHRoaXMuZ3JvdXBDZW50ZXIgPSB0aGlzLmJhY2tncm91bmQuY2VudGVyLnBsdXNYWSggMCwgY2hhbGxlbmdlLmhhc1NoYXBlcyA/IDEwIDogMCApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtOb2RlfG51bGx9XHJcbiAgICB0aGlzLmdyb3VwTm9kZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge05vZGV9XHJcbiAgICB0aGlzLnJldHVybkJ1dHRvbiA9IG5ldyBSZXR1cm5CdXR0b24oICgpID0+IHtcclxuICAgICAgaWYgKCB0aGlzLmdyb3VwTm9kZSApIHtcclxuICAgICAgICBjaGFsbGVuZ2UucmV0dXJuVGFyZ2V0KCB0YXJnZXQgKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBjb3JuZXJSYWRpdXM6IENPUk5FUl9SQURJVVMgLSBDT1JORVJfT0ZGU0VULFxyXG4gICAgICBsZWZ0VG9wOiB0aGlzLmJhY2tncm91bmQubGVmdFRvcC5wbHVzKCBuZXcgVmVjdG9yMiggQ09STkVSX09GRlNFVCwgQ09STkVSX09GRlNFVCApIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMucmV0dXJuQnV0dG9uLnRvdWNoQXJlYSA9IHRoaXMucmV0dXJuQnV0dG9uLmxvY2FsQm91bmRzLmRpbGF0ZWQoIDEyICk7XHJcbiAgICB0aGlzLmNvbnRhaW5lci5hZGRDaGlsZCggdGhpcy5yZXR1cm5CdXR0b24gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259XHJcbiAgICB0aGlzLmdyb3VwTGlzdGVuZXIgPSBncm91cCA9PiB7XHJcbiAgICAgIHRoaXMucmV0dXJuQnV0dG9uLnZpc2libGUgPSAhIWdyb3VwO1xyXG5cclxuICAgICAgdGhpcy5ncm91cE5vZGUgJiYgdGhpcy5ncm91cE5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICB0aGlzLmdyb3VwTm9kZSA9IG51bGw7XHJcblxyXG4gICAgICBpZiAoIGdyb3VwICkge1xyXG4gICAgICAgIGlmICggY2hhbGxlbmdlLmhhc1NoYXBlcyApIHtcclxuICAgICAgICAgIHRoaXMuZ3JvdXBOb2RlID0gbmV3IFNoYXBlR3JvdXBOb2RlKCBncm91cCwge1xyXG4gICAgICAgICAgICBpc0ljb246IHRydWUsXHJcbiAgICAgICAgICAgIGhhc0J1dHRvbnM6IGZhbHNlLFxyXG4gICAgICAgICAgICBzY2FsZTogRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLlNIQVBFX0NPTExFQ1RJT05fU0NBTEUsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uZWQ6IGZhbHNlXHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5ncm91cE5vZGUgPSBuZXcgTnVtYmVyR3JvdXBOb2RlKCBncm91cCwge1xyXG4gICAgICAgICAgICBpc0ljb246IHRydWUsXHJcbiAgICAgICAgICAgIGhhc0NhcmRCYWNrZ3JvdW5kOiBmYWxzZSxcclxuICAgICAgICAgICAgc2NhbGU6IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5OVU1CRVJfQ09MTEVDVElPTl9TQ0FMRSxcclxuICAgICAgICAgICAgcG9zaXRpb25lZDogZmFsc2VcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ncm91cE5vZGUuY2VudGVyID0gdGhpcy5ncm91cENlbnRlcjtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5hZGRDaGlsZCggdGhpcy5ncm91cE5vZGUgKTtcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSApIHtcclxuICAgICAgICAgIC8vIFdoZW5ldmVyIHdlIGdldCBhIGdyb3VwIHBsYWNlZCwgd2UgbmVlZCB0byB1cGRhdGUgdGhlIHRhcmdldCBwb3NpdGlvbiBzbyB0aGF0IHRoZSBzdWJzZXF1ZW50IGFuaW1hdGlvblxyXG4gICAgICAgICAgLy8gZ29lcyB0byB0aGUgcmlnaHQgcGxhY2UuXHJcbiAgICAgICAgICB0YXJnZXQucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsUG9zaXRpb24oXHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBOb2RlLmdldFVuaXF1ZVRyYWlsVG8oIHRoaXMucGFyZW50Q29udGFpbmVyICkubG9jYWxUb0dsb2JhbFBvaW50KCBWZWN0b3IyLlpFUk8gKVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aGlzLnRhcmdldC5ncm91cFByb3BlcnR5LmxpbmsoIHRoaXMuZ3JvdXBMaXN0ZW5lciApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuY29udGFpbmVyICk7XHJcblxyXG4gICAgaWYgKCBpc1NoYXBlVGFyZ2V0ICkge1xyXG4gICAgICBjb25zdCBzY2FsZSA9IGNoYWxsZW5nZS5oYXNNaXhlZFRhcmdldHMgPyAwLjYgOiAoIGNoYWxsZW5nZS5tYXhUYXJnZXRXaG9sZXMgPiAxID8gMC45IDogMSApO1xyXG4gICAgICBjb25zdCBwYWRkaW5nID0gMTA7XHJcbiAgICAgIGNvbnN0IG1heFdpZHRoID0gbWF4UGFydGl0aW9uV2lkdGhNYXBbIHNjYWxlIF07XHJcbiAgICAgIGNvbnN0IGJveCA9IG5ldyBIQm94KCB7XHJcbiAgICAgICAgc3BhY2luZzogcGFkZGluZyxcclxuICAgICAgICBjaGlsZHJlbjogdGFyZ2V0LmZpbGxlZFBhcnRpdGlvbnMubWFwKCBmaWxsZWRQYXJ0aXRpb24gPT4gbmV3IEZpbGxlZFBhcnRpdGlvbk5vZGUoIGZpbGxlZFBhcnRpdGlvbiwge1xyXG4gICAgICAgICAgbGF5b3V0U2NhbGU6IHNjYWxlLFxyXG4gICAgICAgICAgYWRhcHRpdmVTY2FsZTogdHJ1ZVxyXG4gICAgICAgIH0gKSApXHJcbiAgICAgIH0gKTtcclxuICAgICAgY29uc3QgcXVhbnRpdHkgPSB0YXJnZXQuZmlsbGVkUGFydGl0aW9ucy5sZW5ndGg7XHJcbiAgICAgIGNvbnN0IGNvbWJpbmVkTWF4V2lkdGggPSBtYXhXaWR0aCAqIHF1YW50aXR5ICsgcGFkZGluZyAqICggcXVhbnRpdHkgLSAxICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBOb2RlKCB7XHJcbiAgICAgICAgY2hpbGRyZW46IFsgYm94IF0sXHJcbiAgICAgICAgbG9jYWxCb3VuZHM6IGJveC5sb2NhbEJvdW5kcy53aXRoTWF4WCggYm94LmxvY2FsQm91bmRzLm1pblggKyBjb21iaW5lZE1heFdpZHRoIClcclxuICAgICAgfSApICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3Qgd2hvbGUgPSBjaGFsbGVuZ2UuaGFzTWl4ZWRUYXJnZXRzID8gTWF0aC5mbG9vciggdGFyZ2V0LmZyYWN0aW9uLnZhbHVlICkgOiBudWxsO1xyXG4gICAgICBjb25zdCBudW1lcmF0b3IgPSB3aG9sZSA/IHRhcmdldC5mcmFjdGlvbi5taW51cyggbmV3IEZyYWN0aW9uKCB3aG9sZSwgMSApICkubnVtZXJhdG9yIDogdGFyZ2V0LmZyYWN0aW9uLm51bWVyYXRvcjtcclxuICAgICAgY29uc3QgZGVub21pbmF0b3IgPSB0YXJnZXQuZnJhY3Rpb24uZGVub21pbmF0b3I7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBNaXhlZEZyYWN0aW9uTm9kZSgge1xyXG4gICAgICAgIHdob2xlOiB3aG9sZSA9PT0gMCA/IG51bGwgOiB3aG9sZSxcclxuICAgICAgICBudW1lcmF0b3I6IG51bWVyYXRvciA9PT0gMCA/ICggd2hvbGUgPT09IG51bGwgPyAwIDogbnVsbCApIDogbnVtZXJhdG9yLFxyXG4gICAgICAgIGRlbm9taW5hdG9yOiBkZW5vbWluYXRvcixcclxuICAgICAgICBzY2FsZTogMS4yXHJcbiAgICAgIH0gKSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgbW9kZWwgcG9zaXRpb25zIG9mIG91ciBtb2RlbCBvYmplY3RzIGNvcnJlc3BvbmRpbmcgdG8gdGhlaXIgZGlzcGxheWVkICh2aWV3KSBwb3NpdGlvbnMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge05vZGV9IHBhcmVudENvbnRhaW5lciAtIEEgcGFyZW50IG5vZGUgdGhhdCBjb250YWlucyB0aGlzIG5vZGUsIGFuZCBoYXMgbm8gdHJhbnNmb3JtIHJlbGF0aXZlIHRvIHRoZVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyZWVuVmlldy5cclxuICAgKi9cclxuICB1cGRhdGVNb2RlbFBvc2l0aW9ucyggbW9kZWxWaWV3VHJhbnNmb3JtLCBwYXJlbnRDb250YWluZXIgKSB7XHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IG1vZGVsVmlld1RyYW5zZm9ybTtcclxuICAgIHRoaXMucGFyZW50Q29udGFpbmVyID0gcGFyZW50Q29udGFpbmVyO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgd2l0aCBhbiBhcHByb3hpbWF0ZSBwb3NpdGlvbiBzbyB3ZSBjYW4gY29tcHV0ZSB0aGUgY2xvc2VzdCB0YXJnZXRcclxuICAgIHRoaXMudGFyZ2V0LnBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxQb3NpdGlvbihcclxuICAgICAgdGhpcy5jb250YWluZXIuZ2V0VW5pcXVlVHJhaWxUbyggcGFyZW50Q29udGFpbmVyICkubG9jYWxUb0dsb2JhbFBvaW50KCB0aGlzLmdyb3VwQ2VudGVyIClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNwb3NlcyB0aGUgbm9kZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy50YXJnZXQuZ3JvdXBQcm9wZXJ0eS51bmxpbmsoIHRoaXMuZ3JvdXBMaXN0ZW5lciApO1xyXG4gICAgdGhpcy50YXJnZXQuaG92ZXJpbmdHcm91cHMubGVuZ3RoUHJvcGVydHkudW5saW5rKCB0aGlzLmhpZ2hsaWdodExpc3RlbmVyICk7XHJcblxyXG4gICAgdGhpcy5ncm91cE5vZGUgJiYgdGhpcy5ncm91cE5vZGUuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5oaWdobGlnaHQuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5yZXR1cm5CdXR0b24uZGlzcG9zZSgpO1xyXG5cclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmZyYWN0aW9uc0NvbW1vbi5yZWdpc3RlciggJ1RhcmdldE5vZGUnLCBUYXJnZXROb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IFRhcmdldE5vZGU7XHJcbiJdLCJtYXBwaW5n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