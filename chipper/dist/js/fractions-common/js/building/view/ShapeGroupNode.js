// Copyright 2018-2022, University of Colorado Boulder

/**
 * View for a ShapeGroup.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import ReturnButton from '../../../../scenery-phet/js/buttons/ReturnButton.js';
import { HBox, Node, Path, VBox } from '../../../../scenery/js/imports.js';
import RoundPushButton from '../../../../sun/js/buttons/RoundPushButton.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import RoundArrowButton from '../../common/view/RoundArrowButton.js';
import fractionsCommon from '../../fractionsCommon.js';
import BuildingRepresentation from '../model/BuildingRepresentation.js';
import ShapeGroup from '../model/ShapeGroup.js';
import ShapePiece from '../model/ShapePiece.js';
import GroupNode from './GroupNode.js';
import ShapeContainerNode from './ShapeContainerNode.js';

// constants
const CONTAINER_PADDING = FractionsCommonConstants.SHAPE_CONTAINER_PADDING;
class ShapeGroupNode extends GroupNode {
  /**
   * @param {ShapeGroup} shapeGroup
   * @param {Object} [options]
   */
  constructor(shapeGroup, options) {
    assert && assert(shapeGroup instanceof ShapeGroup);
    options = merge({
      hasButtons: true,
      removeLastListener: null,
      dragBoundsProperty: null
    }, options);
    super(shapeGroup, options);

    // @public {ShapeGroup}
    this.shapeGroup = shapeGroup;

    // @private {ObservableArrayDef.<ShapeContainerNode>}
    this.shapeContainerNodes = createObservableArray();

    // @private {Property.<Bounds2>} - Our original drag bounds (which we'll need to map before providing to our
    // drag listener)
    this.generalDragBoundsProperty = options.dragBoundsProperty;
    this.isSelectedProperty.linkAttribute(this.controlLayer, 'visible');

    // @private {function}
    this.addShapeContainerListener = this.addShapeContainer.bind(this);
    this.removeShapeContainerListener = this.removeShapeContainer.bind(this);
    this.shapeGroup.shapeContainers.addItemAddedListener(this.addShapeContainerListener);
    this.shapeGroup.shapeContainers.addItemRemovedListener(this.removeShapeContainerListener);
    this.shapeGroup.shapeContainers.forEach(this.addShapeContainerListener);
    assert && assert(shapeGroup.shapeContainers.length > 0);
    const lineSize = 8;

    // @private {Node}
    this.addContainerButton = new RoundPushButton({
      content: new Path(new Shape().moveTo(-lineSize, 0).lineTo(lineSize, 0).moveTo(0, -lineSize).lineTo(0, lineSize), {
        stroke: 'black',
        lineCap: 'round',
        lineWidth: 3.75
      }),
      radius: FractionsCommonConstants.ROUND_BUTTON_RADIUS,
      xMargin: FractionsCommonConstants.ROUND_BUTTON_MARGIN,
      yMargin: FractionsCommonConstants.ROUND_BUTTON_MARGIN,
      listener: shapeGroup.increaseContainerCount.bind(shapeGroup),
      enabled: !this.isIcon,
      baseColor: FractionsCommonColors.greenRoundArrowButtonProperty
    });

    // @private {Node}
    this.removeContainerButton = new RoundPushButton({
      content: new Path(new Shape().moveTo(-lineSize, 0).lineTo(lineSize, 0), {
        stroke: 'black',
        lineCap: 'round',
        lineWidth: 3.75
      }),
      radius: FractionsCommonConstants.ROUND_BUTTON_RADIUS,
      xMargin: FractionsCommonConstants.ROUND_BUTTON_MARGIN,
      yMargin: FractionsCommonConstants.ROUND_BUTTON_MARGIN,
      listener: shapeGroup.decreaseContainerCount.bind(shapeGroup),
      enabled: !this.isIcon,
      baseColor: FractionsCommonColors.redRoundArrowButtonProperty
    });

    // Touch areas for add/remove buttons
    const addRemoveOffsets = {
      left: CONTAINER_PADDING / 2,
      right: CONTAINER_PADDING * 1.2,
      inside: CONTAINER_PADDING / 2,
      outside: CONTAINER_PADDING
    };
    this.addContainerButton.touchArea = Shape.boundsOffsetWithRadii(this.addContainerButton.localBounds, {
      top: addRemoveOffsets.outside,
      bottom: addRemoveOffsets.inside,
      left: addRemoveOffsets.left,
      right: addRemoveOffsets.right
    }, {
      topRight: 10
    });
    this.removeContainerButton.touchArea = Shape.boundsOffsetWithRadii(this.removeContainerButton.localBounds, {
      top: addRemoveOffsets.inside,
      bottom: addRemoveOffsets.outside,
      left: addRemoveOffsets.left,
      right: addRemoveOffsets.right
    }, {
      bottomRight: 10
    });

    // @private {function}
    this.addRemoveVisibleListener = numShapeContainers => {
      this.addContainerButton.visible = numShapeContainers < shapeGroup.maxContainers;
      this.removeContainerButton.visible = numShapeContainers > 1;
    };
    this.shapeGroup.shapeContainers.lengthProperty.link(this.addRemoveVisibleListener);

    // @private {Node}
    this.rightButtonBox = new VBox({
      spacing: CONTAINER_PADDING,
      children: [this.addContainerButton, this.removeContainerButton],
      resize: false,
      excludeInvisibleChildrenFromBounds: false,
      centerY: 0
    });
    if (options.hasButtons && shapeGroup.maxContainers > 1) {
      this.controlLayer.addChild(this.rightButtonBox);
    }

    // @private {Property.<boolean>}
    this.decreaseEnabledProperty = new DerivedProperty([shapeGroup.partitionDenominatorProperty], denominator => {
      return !this.isIcon && denominator > shapeGroup.partitionDenominatorProperty.range.min;
    });
    this.increaseEnabledProperty = new DerivedProperty([shapeGroup.partitionDenominatorProperty], denominator => {
      return !this.isIcon && denominator < shapeGroup.partitionDenominatorProperty.range.max;
    });

    // @private {Node}
    this.decreasePartitionCountButton = new RoundArrowButton({
      arrowRotation: -Math.PI / 2,
      enabledProperty: this.decreaseEnabledProperty,
      listener: () => {
        shapeGroup.partitionDenominatorProperty.value -= 1;
      }
    });
    // @private {Node}
    this.increasePartitionCountButton = new RoundArrowButton({
      arrowRotation: Math.PI / 2,
      enabledProperty: this.increaseEnabledProperty,
      listener: () => {
        shapeGroup.partitionDenominatorProperty.value += 1;
      }
    });

    // Set up touch areas for the partition buttons
    const partitionCountOffsets = {
      top: CONTAINER_PADDING / 2,
      bottom: CONTAINER_PADDING * 1.2,
      inside: CONTAINER_PADDING / 2,
      outside: CONTAINER_PADDING * 1.5
    };
    this.decreasePartitionCountButton.touchArea = Shape.boundsOffsetWithRadii(this.decreasePartitionCountButton.localBounds, {
      top: partitionCountOffsets.top,
      bottom: partitionCountOffsets.bottom,
      left: partitionCountOffsets.outside,
      right: partitionCountOffsets.inside
    }, {
      bottomLeft: 10
    });
    this.increasePartitionCountButton.touchArea = Shape.boundsOffsetWithRadii(this.increasePartitionCountButton.localBounds, {
      top: partitionCountOffsets.top,
      bottom: partitionCountOffsets.bottom,
      left: partitionCountOffsets.inside,
      right: partitionCountOffsets.outside
    }, {
      bottomRight: 10
    });
    if (options.hasButtons) {
      this.controlLayer.addChild(new HBox({
        spacing: CONTAINER_PADDING,
        children: [this.decreasePartitionCountButton, this.increasePartitionCountButton],
        top: (shapeGroup.representation === BuildingRepresentation.BAR ? FractionsCommonConstants.SHAPE_VERTICAL_BAR_HEIGHT : FractionsCommonConstants.SHAPE_SIZE) / 2 + CONTAINER_PADDING - 3,
        centerX: 0
      }));
    }

    // @private {Node}
    this.returnButton = new ReturnButton(options.removeLastListener, {
      // constants tuned for current appearance
      rightBottom: shapeGroup.representation === BuildingRepresentation.BAR ? new Vector2(-50, -75 / 2) : new Vector2(-36, -36)
    });

    // Construct a touch shape
    let returnTouchShape = Shape.boundsOffsetWithRadii(this.returnButton.localBounds, {
      top: 10,
      left: 10,
      bottom: 12,
      right: 12
    }, {
      bottomRight: 10,
      topLeft: 10,
      topRight: 10,
      bottomLeft: 10
    });
    const returnInverseTransform = Matrix3.translationFromVector(this.returnButton.translation.negated());
    if (shapeGroup.representation === BuildingRepresentation.BAR) {
      returnTouchShape = returnTouchShape.shapeDifference(Shape.bounds(ShapePiece.VERTICAL_BAR_BOUNDS).transformed(returnInverseTransform));
    } else {
      returnTouchShape = returnTouchShape.shapeDifference(Shape.circle(0, 0, FractionsCommonConstants.SHAPE_SIZE / 2).transformed(returnInverseTransform));
    }
    this.returnButton.touchArea = returnTouchShape;
    const undoArrowContainer = new Node();

    // @private {function}
    this.updateVisibilityListener = () => {
      undoArrowContainer.children = shapeGroup.hasAnyPieces() ? [this.returnButton] : [];
    };
    this.shapeGroup.changedEmitter.addListener(this.updateVisibilityListener);
    this.updateVisibilityListener();
    if (options.hasButtons) {
      this.controlLayer.addChild(undoArrowContainer);
    }
    if (!this.isIcon) {
      // @private {Property.<Bounds2>}
      this.dragBoundsProperty = new Property(Bounds2.NOTHING);

      // @private {function}
      this.dragBoundsListener = this.updateDragBounds.bind(this);
      this.generalDragBoundsProperty.link(this.dragBoundsListener);

      // Keep the group in the drag bounds (when they change)
      this.dragBoundsProperty.lazyLink(dragBounds => {
        shapeGroup.positionProperty.value = dragBounds.closestPointTo(shapeGroup.positionProperty.value);
      });
      this.attachDragListener(this.dragBoundsProperty, options);
    }

    // Now that we have a return button and drag bounds, we should update right-button positions
    this.updateRightButtonPosition();
    this.mutate(options);
  }

  /**
   * Updates the available drag bounds. This can be influenced not only by the "general" drag bounds (places in the
   * play area), but since our size can change we need to compensate for shifts in size.
   * @private
   */
  updateDragBounds() {
    if (this.generalDragBoundsProperty) {
      let safeBounds = this.controlLayer.bounds.union(this.returnButton.bounds); // undo button not always in the control layer

      const containerTop = -(this.shapeGroup.representation === BuildingRepresentation.PIE ? FractionsCommonConstants.SHAPE_SIZE : FractionsCommonConstants.SHAPE_VERTICAL_BAR_HEIGHT) / 2;
      safeBounds = safeBounds.withMinY(Math.min(safeBounds.top, containerTop));
      this.dragBoundsProperty.value = this.generalDragBoundsProperty.value.withOffsets(safeBounds.left, safeBounds.top, -safeBounds.right, -safeBounds.bottom);
    }
  }

  /**
   * Updates the position of the rightButtonBox (and potentially updates drag bounds based on that).
   * @private
   */
  updateRightButtonPosition() {
    // Our container initializers are called before we add things in the subtype, so we need an additional check here.
    if (this.rightButtonBox) {
      // Subtracts 0.5 since our containers have their origins in their centers
      this.rightButtonBox.left = (this.shapeContainerNodes.length - 0.5) * (FractionsCommonConstants.SHAPE_SIZE + CONTAINER_PADDING);
      this.updateDragBounds();
    }
  }

  /**
   * Adds a ShapeContainer's view
   * @private
   *
   * @param {ShapeContainer} shapeContainer
   */
  addShapeContainer(shapeContainer) {
    const shapeContainerNode = new ShapeContainerNode(shapeContainer);
    this.shapeContainerNodes.push(shapeContainerNode);
    this.displayLayer.addChild(shapeContainerNode);
    this.updateRightButtonPosition();
  }

  /**
   * Removes a ShapeContainer's view
   * @private
   *
   * @param {ShapeContainer} shapeContainer
   */
  removeShapeContainer(shapeContainer) {
    const shapeContainerNode = this.shapeContainerNodes.find(shapeContainerNode => {
      return shapeContainerNode.shapeContainer === shapeContainer;
    });
    assert && assert(shapeContainerNode);
    this.shapeContainerNodes.remove(shapeContainerNode);
    this.displayLayer.removeChild(shapeContainerNode);
    shapeContainerNode.dispose();
    this.updateRightButtonPosition();
  }

  /**
   * Releases references
   * @public
   * @override
   */
  dispose() {
    this.shapeContainerNodes.forEach(shapeContainer => shapeContainer.dispose());
    this.shapeGroup.changedEmitter.removeListener(this.updateVisibilityListener);
    this.shapeGroup.shapeContainers.lengthProperty.unlink(this.addRemoveVisibleListener);
    this.generalDragBoundsProperty && this.generalDragBoundsProperty.unlink(this.dragBoundsListener);
    this.shapeGroup.shapeContainers.removeItemAddedListener(this.addShapeContainerListener);
    this.shapeGroup.shapeContainers.removeItemRemovedListener(this.removeShapeContainerListener);
    this.decreasePartitionCountButton.dispose();
    this.increasePartitionCountButton.dispose();
    this.decreaseEnabledProperty.dispose();
    this.increaseEnabledProperty.dispose();
    this.addContainerButton.dispose();
    this.removeContainerButton.dispose();
    this.returnButton.dispose();
    super.dispose();
  }

  /**
   * Creates an icon that looks like a ShapeGroupNode.
   * @public
   *
   * @param {BuildingRepresentation} representation
   * @param {boolean} hasExpansionButtons
   * @returns {Node}
   */
  static createIcon(representation, hasExpansionButtons) {
    const iconNode = new ShapeGroupNode(new ShapeGroup(representation, {
      maxContainers: hasExpansionButtons ? 6 : 1
    }), {
      isIcon: true,
      scale: FractionsCommonConstants.SHAPE_BUILD_SCALE,
      pickable: false
    });
    iconNode.localBounds = iconNode.localBounds.withMinY(iconNode.localBounds.minY - 2 * iconNode.localBounds.centerY);
    return iconNode;
  }
}
fractionsCommon.register('ShapeGroupNode', ShapeGroupNode);
export default ShapeGroupNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJEZXJpdmVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkJvdW5kczIiLCJNYXRyaXgzIiwiVmVjdG9yMiIsIlNoYXBlIiwibWVyZ2UiLCJSZXR1cm5CdXR0b24iLCJIQm94IiwiTm9kZSIsIlBhdGgiLCJWQm94IiwiUm91bmRQdXNoQnV0dG9uIiwiRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzIiwiRnJhY3Rpb25zQ29tbW9uQ29sb3JzIiwiUm91bmRBcnJvd0J1dHRvbiIsImZyYWN0aW9uc0NvbW1vbiIsIkJ1aWxkaW5nUmVwcmVzZW50YXRpb24iLCJTaGFwZUdyb3VwIiwiU2hhcGVQaWVjZSIsIkdyb3VwTm9kZSIsIlNoYXBlQ29udGFpbmVyTm9kZSIsIkNPTlRBSU5FUl9QQURESU5HIiwiU0hBUEVfQ09OVEFJTkVSX1BBRERJTkciLCJTaGFwZUdyb3VwTm9kZSIsImNvbnN0cnVjdG9yIiwic2hhcGVHcm91cCIsIm9wdGlvbnMiLCJhc3NlcnQiLCJoYXNCdXR0b25zIiwicmVtb3ZlTGFzdExpc3RlbmVyIiwiZHJhZ0JvdW5kc1Byb3BlcnR5Iiwic2hhcGVDb250YWluZXJOb2RlcyIsImdlbmVyYWxEcmFnQm91bmRzUHJvcGVydHkiLCJpc1NlbGVjdGVkUHJvcGVydHkiLCJsaW5rQXR0cmlidXRlIiwiY29udHJvbExheWVyIiwiYWRkU2hhcGVDb250YWluZXJMaXN0ZW5lciIsImFkZFNoYXBlQ29udGFpbmVyIiwiYmluZCIsInJlbW92ZVNoYXBlQ29udGFpbmVyTGlzdGVuZXIiLCJyZW1vdmVTaGFwZUNvbnRhaW5lciIsInNoYXBlQ29udGFpbmVycyIsImFkZEl0ZW1BZGRlZExpc3RlbmVyIiwiYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciIsImZvckVhY2giLCJsZW5ndGgiLCJsaW5lU2l6ZSIsImFkZENvbnRhaW5lckJ1dHRvbiIsImNvbnRlbnQiLCJtb3ZlVG8iLCJsaW5lVG8iLCJzdHJva2UiLCJsaW5lQ2FwIiwibGluZVdpZHRoIiwicmFkaXVzIiwiUk9VTkRfQlVUVE9OX1JBRElVUyIsInhNYXJnaW4iLCJST1VORF9CVVRUT05fTUFSR0lOIiwieU1hcmdpbiIsImxpc3RlbmVyIiwiaW5jcmVhc2VDb250YWluZXJDb3VudCIsImVuYWJsZWQiLCJpc0ljb24iLCJiYXNlQ29sb3IiLCJncmVlblJvdW5kQXJyb3dCdXR0b25Qcm9wZXJ0eSIsInJlbW92ZUNvbnRhaW5lckJ1dHRvbiIsImRlY3JlYXNlQ29udGFpbmVyQ291bnQiLCJyZWRSb3VuZEFycm93QnV0dG9uUHJvcGVydHkiLCJhZGRSZW1vdmVPZmZzZXRzIiwibGVmdCIsInJpZ2h0IiwiaW5zaWRlIiwib3V0c2lkZSIsInRvdWNoQXJlYSIsImJvdW5kc09mZnNldFdpdGhSYWRpaSIsImxvY2FsQm91bmRzIiwidG9wIiwiYm90dG9tIiwidG9wUmlnaHQiLCJib3R0b21SaWdodCIsImFkZFJlbW92ZVZpc2libGVMaXN0ZW5lciIsIm51bVNoYXBlQ29udGFpbmVycyIsInZpc2libGUiLCJtYXhDb250YWluZXJzIiwibGVuZ3RoUHJvcGVydHkiLCJsaW5rIiwicmlnaHRCdXR0b25Cb3giLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJyZXNpemUiLCJleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIiwiY2VudGVyWSIsImFkZENoaWxkIiwiZGVjcmVhc2VFbmFibGVkUHJvcGVydHkiLCJwYXJ0aXRpb25EZW5vbWluYXRvclByb3BlcnR5IiwiZGVub21pbmF0b3IiLCJyYW5nZSIsIm1pbiIsImluY3JlYXNlRW5hYmxlZFByb3BlcnR5IiwibWF4IiwiZGVjcmVhc2VQYXJ0aXRpb25Db3VudEJ1dHRvbiIsImFycm93Um90YXRpb24iLCJNYXRoIiwiUEkiLCJlbmFibGVkUHJvcGVydHkiLCJ2YWx1ZSIsImluY3JlYXNlUGFydGl0aW9uQ291bnRCdXR0b24iLCJwYXJ0aXRpb25Db3VudE9mZnNldHMiLCJib3R0b21MZWZ0IiwicmVwcmVzZW50YXRpb24iLCJCQVIiLCJTSEFQRV9WRVJUSUNBTF9CQVJfSEVJR0hUIiwiU0hBUEVfU0laRSIsImNlbnRlclgiLCJyZXR1cm5CdXR0b24iLCJyaWdodEJvdHRvbSIsInJldHVyblRvdWNoU2hhcGUiLCJ0b3BMZWZ0IiwicmV0dXJuSW52ZXJzZVRyYW5zZm9ybSIsInRyYW5zbGF0aW9uRnJvbVZlY3RvciIsInRyYW5zbGF0aW9uIiwibmVnYXRlZCIsInNoYXBlRGlmZmVyZW5jZSIsImJvdW5kcyIsIlZFUlRJQ0FMX0JBUl9CT1VORFMiLCJ0cmFuc2Zvcm1lZCIsImNpcmNsZSIsInVuZG9BcnJvd0NvbnRhaW5lciIsInVwZGF0ZVZpc2liaWxpdHlMaXN0ZW5lciIsImhhc0FueVBpZWNlcyIsImNoYW5nZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJOT1RISU5HIiwiZHJhZ0JvdW5kc0xpc3RlbmVyIiwidXBkYXRlRHJhZ0JvdW5kcyIsImxhenlMaW5rIiwiZHJhZ0JvdW5kcyIsInBvc2l0aW9uUHJvcGVydHkiLCJjbG9zZXN0UG9pbnRUbyIsImF0dGFjaERyYWdMaXN0ZW5lciIsInVwZGF0ZVJpZ2h0QnV0dG9uUG9zaXRpb24iLCJtdXRhdGUiLCJzYWZlQm91bmRzIiwidW5pb24iLCJjb250YWluZXJUb3AiLCJQSUUiLCJ3aXRoTWluWSIsIndpdGhPZmZzZXRzIiwic2hhcGVDb250YWluZXIiLCJzaGFwZUNvbnRhaW5lck5vZGUiLCJwdXNoIiwiZGlzcGxheUxheWVyIiwiZmluZCIsInJlbW92ZSIsInJlbW92ZUNoaWxkIiwiZGlzcG9zZSIsInJlbW92ZUxpc3RlbmVyIiwidW5saW5rIiwicmVtb3ZlSXRlbUFkZGVkTGlzdGVuZXIiLCJyZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyIiwiY3JlYXRlSWNvbiIsImhhc0V4cGFuc2lvbkJ1dHRvbnMiLCJpY29uTm9kZSIsInNjYWxlIiwiU0hBUEVfQlVJTERfU0NBTEUiLCJwaWNrYWJsZSIsIm1pblkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNoYXBlR3JvdXBOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFZpZXcgZm9yIGEgU2hhcGVHcm91cC5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgUmV0dXJuQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1JldHVybkJ1dHRvbi5qcyc7XHJcbmltcG9ydCB7IEhCb3gsIE5vZGUsIFBhdGgsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUm91bmRQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JvdW5kUHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBGcmFjdGlvbnNDb21tb25Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0ZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBGcmFjdGlvbnNDb21tb25Db2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvRnJhY3Rpb25zQ29tbW9uQ29sb3JzLmpzJztcclxuaW1wb3J0IFJvdW5kQXJyb3dCdXR0b24gZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvUm91bmRBcnJvd0J1dHRvbi5qcyc7XHJcbmltcG9ydCBmcmFjdGlvbnNDb21tb24gZnJvbSAnLi4vLi4vZnJhY3Rpb25zQ29tbW9uLmpzJztcclxuaW1wb3J0IEJ1aWxkaW5nUmVwcmVzZW50YXRpb24gZnJvbSAnLi4vbW9kZWwvQnVpbGRpbmdSZXByZXNlbnRhdGlvbi5qcyc7XHJcbmltcG9ydCBTaGFwZUdyb3VwIGZyb20gJy4uL21vZGVsL1NoYXBlR3JvdXAuanMnO1xyXG5pbXBvcnQgU2hhcGVQaWVjZSBmcm9tICcuLi9tb2RlbC9TaGFwZVBpZWNlLmpzJztcclxuaW1wb3J0IEdyb3VwTm9kZSBmcm9tICcuL0dyb3VwTm9kZS5qcyc7XHJcbmltcG9ydCBTaGFwZUNvbnRhaW5lck5vZGUgZnJvbSAnLi9TaGFwZUNvbnRhaW5lck5vZGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IENPTlRBSU5FUl9QQURESU5HID0gRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLlNIQVBFX0NPTlRBSU5FUl9QQURESU5HO1xyXG5cclxuY2xhc3MgU2hhcGVHcm91cE5vZGUgZXh0ZW5kcyBHcm91cE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7U2hhcGVHcm91cH0gc2hhcGVHcm91cFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc2hhcGVHcm91cCwgb3B0aW9ucyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNoYXBlR3JvdXAgaW5zdGFuY2VvZiBTaGFwZUdyb3VwICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGhhc0J1dHRvbnM6IHRydWUsXHJcbiAgICAgIHJlbW92ZUxhc3RMaXN0ZW5lcjogbnVsbCxcclxuICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiBudWxsXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIHNoYXBlR3JvdXAsIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtTaGFwZUdyb3VwfVxyXG4gICAgdGhpcy5zaGFwZUdyb3VwID0gc2hhcGVHcm91cDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7T2JzZXJ2YWJsZUFycmF5RGVmLjxTaGFwZUNvbnRhaW5lck5vZGU+fVxyXG4gICAgdGhpcy5zaGFwZUNvbnRhaW5lck5vZGVzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1Byb3BlcnR5LjxCb3VuZHMyPn0gLSBPdXIgb3JpZ2luYWwgZHJhZyBib3VuZHMgKHdoaWNoIHdlJ2xsIG5lZWQgdG8gbWFwIGJlZm9yZSBwcm92aWRpbmcgdG8gb3VyXHJcbiAgICAvLyBkcmFnIGxpc3RlbmVyKVxyXG4gICAgdGhpcy5nZW5lcmFsRHJhZ0JvdW5kc1Byb3BlcnR5ID0gb3B0aW9ucy5kcmFnQm91bmRzUHJvcGVydHk7XHJcblxyXG4gICAgdGhpcy5pc1NlbGVjdGVkUHJvcGVydHkubGlua0F0dHJpYnV0ZSggdGhpcy5jb250cm9sTGF5ZXIsICd2aXNpYmxlJyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn1cclxuICAgIHRoaXMuYWRkU2hhcGVDb250YWluZXJMaXN0ZW5lciA9IHRoaXMuYWRkU2hhcGVDb250YWluZXIuYmluZCggdGhpcyApO1xyXG4gICAgdGhpcy5yZW1vdmVTaGFwZUNvbnRhaW5lckxpc3RlbmVyID0gdGhpcy5yZW1vdmVTaGFwZUNvbnRhaW5lci5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgdGhpcy5zaGFwZUdyb3VwLnNoYXBlQ29udGFpbmVycy5hZGRJdGVtQWRkZWRMaXN0ZW5lciggdGhpcy5hZGRTaGFwZUNvbnRhaW5lckxpc3RlbmVyICk7XHJcbiAgICB0aGlzLnNoYXBlR3JvdXAuc2hhcGVDb250YWluZXJzLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIHRoaXMucmVtb3ZlU2hhcGVDb250YWluZXJMaXN0ZW5lciApO1xyXG4gICAgdGhpcy5zaGFwZUdyb3VwLnNoYXBlQ29udGFpbmVycy5mb3JFYWNoKCB0aGlzLmFkZFNoYXBlQ29udGFpbmVyTGlzdGVuZXIgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzaGFwZUdyb3VwLnNoYXBlQ29udGFpbmVycy5sZW5ndGggPiAwICk7XHJcblxyXG4gICAgY29uc3QgbGluZVNpemUgPSA4O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtOb2RlfVxyXG4gICAgdGhpcy5hZGRDb250YWluZXJCdXR0b24gPSBuZXcgUm91bmRQdXNoQnV0dG9uKCB7XHJcbiAgICAgIGNvbnRlbnQ6IG5ldyBQYXRoKCBuZXcgU2hhcGUoKS5tb3ZlVG8oIC1saW5lU2l6ZSwgMCApLmxpbmVUbyggbGluZVNpemUsIDAgKS5tb3ZlVG8oIDAsIC1saW5lU2l6ZSApLmxpbmVUbyggMCwgbGluZVNpemUgKSwge1xyXG4gICAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgICBsaW5lQ2FwOiAncm91bmQnLFxyXG4gICAgICAgIGxpbmVXaWR0aDogMy43NVxyXG4gICAgICB9ICksXHJcbiAgICAgIHJhZGl1czogRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLlJPVU5EX0JVVFRPTl9SQURJVVMsXHJcbiAgICAgIHhNYXJnaW46IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5ST1VORF9CVVRUT05fTUFSR0lOLFxyXG4gICAgICB5TWFyZ2luOiBGcmFjdGlvbnNDb21tb25Db25zdGFudHMuUk9VTkRfQlVUVE9OX01BUkdJTixcclxuICAgICAgbGlzdGVuZXI6IHNoYXBlR3JvdXAuaW5jcmVhc2VDb250YWluZXJDb3VudC5iaW5kKCBzaGFwZUdyb3VwICksXHJcbiAgICAgIGVuYWJsZWQ6ICF0aGlzLmlzSWNvbixcclxuICAgICAgYmFzZUNvbG9yOiBGcmFjdGlvbnNDb21tb25Db2xvcnMuZ3JlZW5Sb3VuZEFycm93QnV0dG9uUHJvcGVydHlcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Tm9kZX1cclxuICAgIHRoaXMucmVtb3ZlQ29udGFpbmVyQnV0dG9uID0gbmV3IFJvdW5kUHVzaEJ1dHRvbigge1xyXG4gICAgICBjb250ZW50OiBuZXcgUGF0aCggbmV3IFNoYXBlKCkubW92ZVRvKCAtbGluZVNpemUsIDAgKS5saW5lVG8oIGxpbmVTaXplLCAwICksIHtcclxuICAgICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgICAgbGluZUNhcDogJ3JvdW5kJyxcclxuICAgICAgICBsaW5lV2lkdGg6IDMuNzVcclxuICAgICAgfSApLFxyXG4gICAgICByYWRpdXM6IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5ST1VORF9CVVRUT05fUkFESVVTLFxyXG4gICAgICB4TWFyZ2luOiBGcmFjdGlvbnNDb21tb25Db25zdGFudHMuUk9VTkRfQlVUVE9OX01BUkdJTixcclxuICAgICAgeU1hcmdpbjogRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLlJPVU5EX0JVVFRPTl9NQVJHSU4sXHJcbiAgICAgIGxpc3RlbmVyOiBzaGFwZUdyb3VwLmRlY3JlYXNlQ29udGFpbmVyQ291bnQuYmluZCggc2hhcGVHcm91cCApLFxyXG4gICAgICBlbmFibGVkOiAhdGhpcy5pc0ljb24sXHJcbiAgICAgIGJhc2VDb2xvcjogRnJhY3Rpb25zQ29tbW9uQ29sb3JzLnJlZFJvdW5kQXJyb3dCdXR0b25Qcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRvdWNoIGFyZWFzIGZvciBhZGQvcmVtb3ZlIGJ1dHRvbnNcclxuICAgIGNvbnN0IGFkZFJlbW92ZU9mZnNldHMgPSB7XHJcbiAgICAgIGxlZnQ6IENPTlRBSU5FUl9QQURESU5HIC8gMixcclxuICAgICAgcmlnaHQ6IENPTlRBSU5FUl9QQURESU5HICogMS4yLFxyXG4gICAgICBpbnNpZGU6IENPTlRBSU5FUl9QQURESU5HIC8gMixcclxuICAgICAgb3V0c2lkZTogQ09OVEFJTkVSX1BBRERJTkdcclxuICAgIH07XHJcbiAgICB0aGlzLmFkZENvbnRhaW5lckJ1dHRvbi50b3VjaEFyZWEgPSBTaGFwZS5ib3VuZHNPZmZzZXRXaXRoUmFkaWkoIHRoaXMuYWRkQ29udGFpbmVyQnV0dG9uLmxvY2FsQm91bmRzLCB7XHJcbiAgICAgIHRvcDogYWRkUmVtb3ZlT2Zmc2V0cy5vdXRzaWRlLFxyXG4gICAgICBib3R0b206IGFkZFJlbW92ZU9mZnNldHMuaW5zaWRlLFxyXG4gICAgICBsZWZ0OiBhZGRSZW1vdmVPZmZzZXRzLmxlZnQsXHJcbiAgICAgIHJpZ2h0OiBhZGRSZW1vdmVPZmZzZXRzLnJpZ2h0XHJcbiAgICB9LCB7XHJcbiAgICAgIHRvcFJpZ2h0OiAxMFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5yZW1vdmVDb250YWluZXJCdXR0b24udG91Y2hBcmVhID0gU2hhcGUuYm91bmRzT2Zmc2V0V2l0aFJhZGlpKCB0aGlzLnJlbW92ZUNvbnRhaW5lckJ1dHRvbi5sb2NhbEJvdW5kcywge1xyXG4gICAgICB0b3A6IGFkZFJlbW92ZU9mZnNldHMuaW5zaWRlLFxyXG4gICAgICBib3R0b206IGFkZFJlbW92ZU9mZnNldHMub3V0c2lkZSxcclxuICAgICAgbGVmdDogYWRkUmVtb3ZlT2Zmc2V0cy5sZWZ0LFxyXG4gICAgICByaWdodDogYWRkUmVtb3ZlT2Zmc2V0cy5yaWdodFxyXG4gICAgfSwge1xyXG4gICAgICBib3R0b21SaWdodDogMTBcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259XHJcbiAgICB0aGlzLmFkZFJlbW92ZVZpc2libGVMaXN0ZW5lciA9IG51bVNoYXBlQ29udGFpbmVycyA9PiB7XHJcbiAgICAgIHRoaXMuYWRkQ29udGFpbmVyQnV0dG9uLnZpc2libGUgPSBudW1TaGFwZUNvbnRhaW5lcnMgPCBzaGFwZUdyb3VwLm1heENvbnRhaW5lcnM7XHJcbiAgICAgIHRoaXMucmVtb3ZlQ29udGFpbmVyQnV0dG9uLnZpc2libGUgPSBudW1TaGFwZUNvbnRhaW5lcnMgPiAxO1xyXG4gICAgfTtcclxuICAgIHRoaXMuc2hhcGVHcm91cC5zaGFwZUNvbnRhaW5lcnMubGVuZ3RoUHJvcGVydHkubGluayggdGhpcy5hZGRSZW1vdmVWaXNpYmxlTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Tm9kZX1cclxuICAgIHRoaXMucmlnaHRCdXR0b25Cb3ggPSBuZXcgVkJveCgge1xyXG4gICAgICBzcGFjaW5nOiBDT05UQUlORVJfUEFERElORyxcclxuICAgICAgY2hpbGRyZW46IFsgdGhpcy5hZGRDb250YWluZXJCdXR0b24sIHRoaXMucmVtb3ZlQ29udGFpbmVyQnV0dG9uIF0sXHJcbiAgICAgIHJlc2l6ZTogZmFsc2UsXHJcbiAgICAgIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHM6IGZhbHNlLFxyXG4gICAgICBjZW50ZXJZOiAwXHJcbiAgICB9ICk7XHJcbiAgICBpZiAoIG9wdGlvbnMuaGFzQnV0dG9ucyAmJiBzaGFwZUdyb3VwLm1heENvbnRhaW5lcnMgPiAxICkge1xyXG4gICAgICB0aGlzLmNvbnRyb2xMYXllci5hZGRDaGlsZCggdGhpcy5yaWdodEJ1dHRvbkJveCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEBwcml2YXRlIHtQcm9wZXJ0eS48Ym9vbGVhbj59XHJcbiAgICB0aGlzLmRlY3JlYXNlRW5hYmxlZFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBzaGFwZUdyb3VwLnBhcnRpdGlvbkRlbm9taW5hdG9yUHJvcGVydHkgXSwgZGVub21pbmF0b3IgPT4ge1xyXG4gICAgICByZXR1cm4gIXRoaXMuaXNJY29uICYmICggZGVub21pbmF0b3IgPiBzaGFwZUdyb3VwLnBhcnRpdGlvbkRlbm9taW5hdG9yUHJvcGVydHkucmFuZ2UubWluICk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmluY3JlYXNlRW5hYmxlZFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBzaGFwZUdyb3VwLnBhcnRpdGlvbkRlbm9taW5hdG9yUHJvcGVydHkgXSwgZGVub21pbmF0b3IgPT4ge1xyXG4gICAgICByZXR1cm4gIXRoaXMuaXNJY29uICYmICggZGVub21pbmF0b3IgPCBzaGFwZUdyb3VwLnBhcnRpdGlvbkRlbm9taW5hdG9yUHJvcGVydHkucmFuZ2UubWF4ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge05vZGV9XHJcbiAgICB0aGlzLmRlY3JlYXNlUGFydGl0aW9uQ291bnRCdXR0b24gPSBuZXcgUm91bmRBcnJvd0J1dHRvbigge1xyXG4gICAgICBhcnJvd1JvdGF0aW9uOiAtTWF0aC5QSSAvIDIsXHJcbiAgICAgIGVuYWJsZWRQcm9wZXJ0eTogdGhpcy5kZWNyZWFzZUVuYWJsZWRQcm9wZXJ0eSxcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBzaGFwZUdyb3VwLnBhcnRpdGlvbkRlbm9taW5hdG9yUHJvcGVydHkudmFsdWUgLT0gMTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgLy8gQHByaXZhdGUge05vZGV9XHJcbiAgICB0aGlzLmluY3JlYXNlUGFydGl0aW9uQ291bnRCdXR0b24gPSBuZXcgUm91bmRBcnJvd0J1dHRvbigge1xyXG4gICAgICBhcnJvd1JvdGF0aW9uOiBNYXRoLlBJIC8gMixcclxuICAgICAgZW5hYmxlZFByb3BlcnR5OiB0aGlzLmluY3JlYXNlRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIHNoYXBlR3JvdXAucGFydGl0aW9uRGVub21pbmF0b3JQcm9wZXJ0eS52YWx1ZSArPSAxO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU2V0IHVwIHRvdWNoIGFyZWFzIGZvciB0aGUgcGFydGl0aW9uIGJ1dHRvbnNcclxuICAgIGNvbnN0IHBhcnRpdGlvbkNvdW50T2Zmc2V0cyA9IHtcclxuICAgICAgdG9wOiBDT05UQUlORVJfUEFERElORyAvIDIsXHJcbiAgICAgIGJvdHRvbTogQ09OVEFJTkVSX1BBRERJTkcgKiAxLjIsXHJcbiAgICAgIGluc2lkZTogQ09OVEFJTkVSX1BBRERJTkcgLyAyLFxyXG4gICAgICBvdXRzaWRlOiBDT05UQUlORVJfUEFERElORyAqIDEuNVxyXG4gICAgfTtcclxuICAgIHRoaXMuZGVjcmVhc2VQYXJ0aXRpb25Db3VudEJ1dHRvbi50b3VjaEFyZWEgPSBTaGFwZS5ib3VuZHNPZmZzZXRXaXRoUmFkaWkoIHRoaXMuZGVjcmVhc2VQYXJ0aXRpb25Db3VudEJ1dHRvbi5sb2NhbEJvdW5kcywge1xyXG4gICAgICB0b3A6IHBhcnRpdGlvbkNvdW50T2Zmc2V0cy50b3AsXHJcbiAgICAgIGJvdHRvbTogcGFydGl0aW9uQ291bnRPZmZzZXRzLmJvdHRvbSxcclxuICAgICAgbGVmdDogcGFydGl0aW9uQ291bnRPZmZzZXRzLm91dHNpZGUsXHJcbiAgICAgIHJpZ2h0OiBwYXJ0aXRpb25Db3VudE9mZnNldHMuaW5zaWRlXHJcbiAgICB9LCB7XHJcbiAgICAgIGJvdHRvbUxlZnQ6IDEwXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmluY3JlYXNlUGFydGl0aW9uQ291bnRCdXR0b24udG91Y2hBcmVhID0gU2hhcGUuYm91bmRzT2Zmc2V0V2l0aFJhZGlpKCB0aGlzLmluY3JlYXNlUGFydGl0aW9uQ291bnRCdXR0b24ubG9jYWxCb3VuZHMsIHtcclxuICAgICAgdG9wOiBwYXJ0aXRpb25Db3VudE9mZnNldHMudG9wLFxyXG4gICAgICBib3R0b206IHBhcnRpdGlvbkNvdW50T2Zmc2V0cy5ib3R0b20sXHJcbiAgICAgIGxlZnQ6IHBhcnRpdGlvbkNvdW50T2Zmc2V0cy5pbnNpZGUsXHJcbiAgICAgIHJpZ2h0OiBwYXJ0aXRpb25Db3VudE9mZnNldHMub3V0c2lkZVxyXG4gICAgfSwge1xyXG4gICAgICBib3R0b21SaWdodDogMTBcclxuICAgIH0gKTtcclxuXHJcbiAgICBpZiAoIG9wdGlvbnMuaGFzQnV0dG9ucyApIHtcclxuICAgICAgdGhpcy5jb250cm9sTGF5ZXIuYWRkQ2hpbGQoIG5ldyBIQm94KCB7XHJcbiAgICAgICAgc3BhY2luZzogQ09OVEFJTkVSX1BBRERJTkcsXHJcbiAgICAgICAgY2hpbGRyZW46IFsgdGhpcy5kZWNyZWFzZVBhcnRpdGlvbkNvdW50QnV0dG9uLCB0aGlzLmluY3JlYXNlUGFydGl0aW9uQ291bnRCdXR0b24gXSxcclxuICAgICAgICB0b3A6ICggc2hhcGVHcm91cC5yZXByZXNlbnRhdGlvbiA9PT0gQnVpbGRpbmdSZXByZXNlbnRhdGlvbi5CQVIgPyBGcmFjdGlvbnNDb21tb25Db25zdGFudHMuU0hBUEVfVkVSVElDQUxfQkFSX0hFSUdIVCA6IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5TSEFQRV9TSVpFICkgLyAyICsgQ09OVEFJTkVSX1BBRERJTkcgLSAzLFxyXG4gICAgICAgIGNlbnRlclg6IDBcclxuICAgICAgfSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHByaXZhdGUge05vZGV9XHJcbiAgICB0aGlzLnJldHVybkJ1dHRvbiA9IG5ldyBSZXR1cm5CdXR0b24oIG9wdGlvbnMucmVtb3ZlTGFzdExpc3RlbmVyLCB7XHJcbiAgICAgIC8vIGNvbnN0YW50cyB0dW5lZCBmb3IgY3VycmVudCBhcHBlYXJhbmNlXHJcbiAgICAgIHJpZ2h0Qm90dG9tOiBzaGFwZUdyb3VwLnJlcHJlc2VudGF0aW9uID09PSBCdWlsZGluZ1JlcHJlc2VudGF0aW9uLkJBUlxyXG4gICAgICAgICAgICAgICAgICAgPyBuZXcgVmVjdG9yMiggLTUwLCAtNzUgLyAyIClcclxuICAgICAgICAgICAgICAgICAgIDogbmV3IFZlY3RvcjIoIC0zNiwgLTM2IClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDb25zdHJ1Y3QgYSB0b3VjaCBzaGFwZVxyXG4gICAgbGV0IHJldHVyblRvdWNoU2hhcGUgPSBTaGFwZS5ib3VuZHNPZmZzZXRXaXRoUmFkaWkoIHRoaXMucmV0dXJuQnV0dG9uLmxvY2FsQm91bmRzLCB7XHJcbiAgICAgIHRvcDogMTAsIGxlZnQ6IDEwLCBib3R0b206IDEyLCByaWdodDogMTJcclxuICAgIH0sIHtcclxuICAgICAgYm90dG9tUmlnaHQ6IDEwLCB0b3BMZWZ0OiAxMCwgdG9wUmlnaHQ6IDEwLCBib3R0b21MZWZ0OiAxMFxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgcmV0dXJuSW52ZXJzZVRyYW5zZm9ybSA9IE1hdHJpeDMudHJhbnNsYXRpb25Gcm9tVmVjdG9yKCB0aGlzLnJldHVybkJ1dHRvbi50cmFuc2xhdGlvbi5uZWdhdGVkKCkgKTtcclxuICAgIGlmICggc2hhcGVHcm91cC5yZXByZXNlbnRhdGlvbiA9PT0gQnVpbGRpbmdSZXByZXNlbnRhdGlvbi5CQVIgKSB7XHJcbiAgICAgIHJldHVyblRvdWNoU2hhcGUgPSByZXR1cm5Ub3VjaFNoYXBlLnNoYXBlRGlmZmVyZW5jZSggU2hhcGUuYm91bmRzKCBTaGFwZVBpZWNlLlZFUlRJQ0FMX0JBUl9CT1VORFMgKS50cmFuc2Zvcm1lZCggcmV0dXJuSW52ZXJzZVRyYW5zZm9ybSApICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuVG91Y2hTaGFwZSA9IHJldHVyblRvdWNoU2hhcGUuc2hhcGVEaWZmZXJlbmNlKCBTaGFwZS5jaXJjbGUoIDAsIDAsIEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5TSEFQRV9TSVpFIC8gMiApLnRyYW5zZm9ybWVkKCByZXR1cm5JbnZlcnNlVHJhbnNmb3JtICkgKTtcclxuICAgIH1cclxuICAgIHRoaXMucmV0dXJuQnV0dG9uLnRvdWNoQXJlYSA9IHJldHVyblRvdWNoU2hhcGU7XHJcblxyXG4gICAgY29uc3QgdW5kb0Fycm93Q29udGFpbmVyID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259XHJcbiAgICB0aGlzLnVwZGF0ZVZpc2liaWxpdHlMaXN0ZW5lciA9ICgpID0+IHtcclxuICAgICAgdW5kb0Fycm93Q29udGFpbmVyLmNoaWxkcmVuID0gc2hhcGVHcm91cC5oYXNBbnlQaWVjZXMoKSA/IFsgdGhpcy5yZXR1cm5CdXR0b24gXSA6IFtdO1xyXG4gICAgfTtcclxuICAgIHRoaXMuc2hhcGVHcm91cC5jaGFuZ2VkRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy51cGRhdGVWaXNpYmlsaXR5TGlzdGVuZXIgKTtcclxuICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eUxpc3RlbmVyKCk7XHJcbiAgICBpZiAoIG9wdGlvbnMuaGFzQnV0dG9ucyApIHtcclxuICAgICAgdGhpcy5jb250cm9sTGF5ZXIuYWRkQ2hpbGQoIHVuZG9BcnJvd0NvbnRhaW5lciApO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBpZiAoICF0aGlzLmlzSWNvbiApIHtcclxuICAgICAgLy8gQHByaXZhdGUge1Byb3BlcnR5LjxCb3VuZHMyPn1cclxuICAgICAgdGhpcy5kcmFnQm91bmRzUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIEJvdW5kczIuTk9USElORyApO1xyXG5cclxuICAgICAgLy8gQHByaXZhdGUge2Z1bmN0aW9ufVxyXG4gICAgICB0aGlzLmRyYWdCb3VuZHNMaXN0ZW5lciA9IHRoaXMudXBkYXRlRHJhZ0JvdW5kcy5iaW5kKCB0aGlzICk7XHJcbiAgICAgIHRoaXMuZ2VuZXJhbERyYWdCb3VuZHNQcm9wZXJ0eS5saW5rKCB0aGlzLmRyYWdCb3VuZHNMaXN0ZW5lciApO1xyXG5cclxuICAgICAgLy8gS2VlcCB0aGUgZ3JvdXAgaW4gdGhlIGRyYWcgYm91bmRzICh3aGVuIHRoZXkgY2hhbmdlKVxyXG4gICAgICB0aGlzLmRyYWdCb3VuZHNQcm9wZXJ0eS5sYXp5TGluayggZHJhZ0JvdW5kcyA9PiB7XHJcbiAgICAgICAgc2hhcGVHcm91cC5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gZHJhZ0JvdW5kcy5jbG9zZXN0UG9pbnRUbyggc2hhcGVHcm91cC5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHRoaXMuYXR0YWNoRHJhZ0xpc3RlbmVyKCB0aGlzLmRyYWdCb3VuZHNQcm9wZXJ0eSwgb3B0aW9ucyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE5vdyB0aGF0IHdlIGhhdmUgYSByZXR1cm4gYnV0dG9uIGFuZCBkcmFnIGJvdW5kcywgd2Ugc2hvdWxkIHVwZGF0ZSByaWdodC1idXR0b24gcG9zaXRpb25zXHJcbiAgICB0aGlzLnVwZGF0ZVJpZ2h0QnV0dG9uUG9zaXRpb24oKTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgYXZhaWxhYmxlIGRyYWcgYm91bmRzLiBUaGlzIGNhbiBiZSBpbmZsdWVuY2VkIG5vdCBvbmx5IGJ5IHRoZSBcImdlbmVyYWxcIiBkcmFnIGJvdW5kcyAocGxhY2VzIGluIHRoZVxyXG4gICAqIHBsYXkgYXJlYSksIGJ1dCBzaW5jZSBvdXIgc2l6ZSBjYW4gY2hhbmdlIHdlIG5lZWQgdG8gY29tcGVuc2F0ZSBmb3Igc2hpZnRzIGluIHNpemUuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVEcmFnQm91bmRzKCkge1xyXG4gICAgaWYgKCB0aGlzLmdlbmVyYWxEcmFnQm91bmRzUHJvcGVydHkgKSB7XHJcbiAgICAgIGxldCBzYWZlQm91bmRzID0gdGhpcy5jb250cm9sTGF5ZXIuYm91bmRzLnVuaW9uKCB0aGlzLnJldHVybkJ1dHRvbi5ib3VuZHMgKTsgLy8gdW5kbyBidXR0b24gbm90IGFsd2F5cyBpbiB0aGUgY29udHJvbCBsYXllclxyXG5cclxuICAgICAgY29uc3QgY29udGFpbmVyVG9wID0gLSggdGhpcy5zaGFwZUdyb3VwLnJlcHJlc2VudGF0aW9uID09PSBCdWlsZGluZ1JlcHJlc2VudGF0aW9uLlBJRSA/IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5TSEFQRV9TSVpFIDogRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLlNIQVBFX1ZFUlRJQ0FMX0JBUl9IRUlHSFQgKSAvIDI7XHJcbiAgICAgIHNhZmVCb3VuZHMgPSBzYWZlQm91bmRzLndpdGhNaW5ZKCBNYXRoLm1pbiggc2FmZUJvdW5kcy50b3AsIGNvbnRhaW5lclRvcCApICk7XHJcbiAgICAgIHRoaXMuZHJhZ0JvdW5kc1Byb3BlcnR5LnZhbHVlID0gdGhpcy5nZW5lcmFsRHJhZ0JvdW5kc1Byb3BlcnR5LnZhbHVlLndpdGhPZmZzZXRzKCBzYWZlQm91bmRzLmxlZnQsIHNhZmVCb3VuZHMudG9wLCAtc2FmZUJvdW5kcy5yaWdodCwgLXNhZmVCb3VuZHMuYm90dG9tICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSBwb3NpdGlvbiBvZiB0aGUgcmlnaHRCdXR0b25Cb3ggKGFuZCBwb3RlbnRpYWxseSB1cGRhdGVzIGRyYWcgYm91bmRzIGJhc2VkIG9uIHRoYXQpLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlUmlnaHRCdXR0b25Qb3NpdGlvbigpIHtcclxuICAgIC8vIE91ciBjb250YWluZXIgaW5pdGlhbGl6ZXJzIGFyZSBjYWxsZWQgYmVmb3JlIHdlIGFkZCB0aGluZ3MgaW4gdGhlIHN1YnR5cGUsIHNvIHdlIG5lZWQgYW4gYWRkaXRpb25hbCBjaGVjayBoZXJlLlxyXG4gICAgaWYgKCB0aGlzLnJpZ2h0QnV0dG9uQm94ICkge1xyXG4gICAgICAvLyBTdWJ0cmFjdHMgMC41IHNpbmNlIG91ciBjb250YWluZXJzIGhhdmUgdGhlaXIgb3JpZ2lucyBpbiB0aGVpciBjZW50ZXJzXHJcbiAgICAgIHRoaXMucmlnaHRCdXR0b25Cb3gubGVmdCA9ICggdGhpcy5zaGFwZUNvbnRhaW5lck5vZGVzLmxlbmd0aCAtIDAuNSApICogKCBGcmFjdGlvbnNDb21tb25Db25zdGFudHMuU0hBUEVfU0laRSArIENPTlRBSU5FUl9QQURESU5HICk7XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZURyYWdCb3VuZHMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBTaGFwZUNvbnRhaW5lcidzIHZpZXdcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTaGFwZUNvbnRhaW5lcn0gc2hhcGVDb250YWluZXJcclxuICAgKi9cclxuICBhZGRTaGFwZUNvbnRhaW5lciggc2hhcGVDb250YWluZXIgKSB7XHJcbiAgICBjb25zdCBzaGFwZUNvbnRhaW5lck5vZGUgPSBuZXcgU2hhcGVDb250YWluZXJOb2RlKCBzaGFwZUNvbnRhaW5lciApO1xyXG4gICAgdGhpcy5zaGFwZUNvbnRhaW5lck5vZGVzLnB1c2goIHNoYXBlQ29udGFpbmVyTm9kZSApO1xyXG4gICAgdGhpcy5kaXNwbGF5TGF5ZXIuYWRkQ2hpbGQoIHNoYXBlQ29udGFpbmVyTm9kZSApO1xyXG4gICAgdGhpcy51cGRhdGVSaWdodEJ1dHRvblBvc2l0aW9uKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGEgU2hhcGVDb250YWluZXIncyB2aWV3XHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2hhcGVDb250YWluZXJ9IHNoYXBlQ29udGFpbmVyXHJcbiAgICovXHJcbiAgcmVtb3ZlU2hhcGVDb250YWluZXIoIHNoYXBlQ29udGFpbmVyICkge1xyXG4gICAgY29uc3Qgc2hhcGVDb250YWluZXJOb2RlID0gdGhpcy5zaGFwZUNvbnRhaW5lck5vZGVzLmZpbmQoIHNoYXBlQ29udGFpbmVyTm9kZSA9PiB7XHJcbiAgICAgIHJldHVybiBzaGFwZUNvbnRhaW5lck5vZGUuc2hhcGVDb250YWluZXIgPT09IHNoYXBlQ29udGFpbmVyO1xyXG4gICAgfSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2hhcGVDb250YWluZXJOb2RlICk7XHJcblxyXG4gICAgdGhpcy5zaGFwZUNvbnRhaW5lck5vZGVzLnJlbW92ZSggc2hhcGVDb250YWluZXJOb2RlICk7XHJcbiAgICB0aGlzLmRpc3BsYXlMYXllci5yZW1vdmVDaGlsZCggc2hhcGVDb250YWluZXJOb2RlICk7XHJcbiAgICBzaGFwZUNvbnRhaW5lck5vZGUuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy51cGRhdGVSaWdodEJ1dHRvblBvc2l0aW9uKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLnNoYXBlQ29udGFpbmVyTm9kZXMuZm9yRWFjaCggc2hhcGVDb250YWluZXIgPT4gc2hhcGVDb250YWluZXIuZGlzcG9zZSgpICk7XHJcbiAgICB0aGlzLnNoYXBlR3JvdXAuY2hhbmdlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMudXBkYXRlVmlzaWJpbGl0eUxpc3RlbmVyICk7XHJcbiAgICB0aGlzLnNoYXBlR3JvdXAuc2hhcGVDb250YWluZXJzLmxlbmd0aFByb3BlcnR5LnVubGluayggdGhpcy5hZGRSZW1vdmVWaXNpYmxlTGlzdGVuZXIgKTtcclxuICAgIHRoaXMuZ2VuZXJhbERyYWdCb3VuZHNQcm9wZXJ0eSAmJiB0aGlzLmdlbmVyYWxEcmFnQm91bmRzUHJvcGVydHkudW5saW5rKCB0aGlzLmRyYWdCb3VuZHNMaXN0ZW5lciApO1xyXG5cclxuICAgIHRoaXMuc2hhcGVHcm91cC5zaGFwZUNvbnRhaW5lcnMucmVtb3ZlSXRlbUFkZGVkTGlzdGVuZXIoIHRoaXMuYWRkU2hhcGVDb250YWluZXJMaXN0ZW5lciApO1xyXG4gICAgdGhpcy5zaGFwZUdyb3VwLnNoYXBlQ29udGFpbmVycy5yZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyKCB0aGlzLnJlbW92ZVNoYXBlQ29udGFpbmVyTGlzdGVuZXIgKTtcclxuXHJcbiAgICB0aGlzLmRlY3JlYXNlUGFydGl0aW9uQ291bnRCdXR0b24uZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5pbmNyZWFzZVBhcnRpdGlvbkNvdW50QnV0dG9uLmRpc3Bvc2UoKTtcclxuICAgIHRoaXMuZGVjcmVhc2VFbmFibGVkUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5pbmNyZWFzZUVuYWJsZWRQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmFkZENvbnRhaW5lckJ1dHRvbi5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLnJlbW92ZUNvbnRhaW5lckJ1dHRvbi5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLnJldHVybkJ1dHRvbi5kaXNwb3NlKCk7XHJcblxyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbiBpY29uIHRoYXQgbG9va3MgbGlrZSBhIFNoYXBlR3JvdXBOb2RlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QnVpbGRpbmdSZXByZXNlbnRhdGlvbn0gcmVwcmVzZW50YXRpb25cclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGhhc0V4cGFuc2lvbkJ1dHRvbnNcclxuICAgKiBAcmV0dXJucyB7Tm9kZX1cclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlSWNvbiggcmVwcmVzZW50YXRpb24sIGhhc0V4cGFuc2lvbkJ1dHRvbnMgKSB7XHJcbiAgICBjb25zdCBpY29uTm9kZSA9IG5ldyBTaGFwZUdyb3VwTm9kZSggbmV3IFNoYXBlR3JvdXAoIHJlcHJlc2VudGF0aW9uLCB7XHJcbiAgICAgIG1heENvbnRhaW5lcnM6IGhhc0V4cGFuc2lvbkJ1dHRvbnMgPyA2IDogMVxyXG4gICAgfSApLCB7XHJcbiAgICAgIGlzSWNvbjogdHJ1ZSxcclxuICAgICAgc2NhbGU6IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5TSEFQRV9CVUlMRF9TQ0FMRSxcclxuICAgICAgcGlja2FibGU6IGZhbHNlXHJcbiAgICB9ICk7XHJcbiAgICBpY29uTm9kZS5sb2NhbEJvdW5kcyA9IGljb25Ob2RlLmxvY2FsQm91bmRzLndpdGhNaW5ZKCBpY29uTm9kZS5sb2NhbEJvdW5kcy5taW5ZIC0gMiAqIGljb25Ob2RlLmxvY2FsQm91bmRzLmNlbnRlclkgKTtcclxuICAgIHJldHVybiBpY29uTm9kZTtcclxuICB9XHJcbn1cclxuXHJcbmZyYWN0aW9uc0NvbW1vbi5yZWdpc3RlciggJ1NoYXBlR3JvdXBOb2RlJywgU2hhcGVHcm91cE5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgU2hhcGVHcm91cE5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLHFCQUFxQixNQUFNLDhDQUE4QztBQUNoRixPQUFPQyxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFlBQVksTUFBTSxxREFBcUQ7QUFDOUUsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUMxRSxPQUFPQyxlQUFlLE1BQU0sK0NBQStDO0FBQzNFLE9BQU9DLHdCQUF3QixNQUFNLDBDQUEwQztBQUMvRSxPQUFPQyxxQkFBcUIsTUFBTSw0Q0FBNEM7QUFDOUUsT0FBT0MsZ0JBQWdCLE1BQU0sdUNBQXVDO0FBQ3BFLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0Msc0JBQXNCLE1BQU0sb0NBQW9DO0FBQ3ZF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