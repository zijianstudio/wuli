// Copyright 2018-2023, University of Colorado Boulder

/**
 * View for a NumberGroup.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import ReturnButton from '../../../../scenery-phet/js/buttons/ReturnButton.js';
import { Line, Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../fractionsCommon.js';
import NumberGroup from '../model/NumberGroup.js';
import NumberSpotType from '../model/NumberSpotType.js';
import GroupNode from './GroupNode.js';
class NumberGroupNode extends GroupNode {
  /**
   * @param {NumberGroup} numberGroup
   * @param {Object} [options]
   */
  constructor(numberGroup, options) {
    assert && assert(numberGroup instanceof NumberGroup);
    options = merge({
      hasCardBackground: true,
      dragBoundsProperty: null,
      removeLastListener: null,
      // node options
      cursor: 'pointer'
    }, options);
    super(numberGroup, options);

    // @public {NumberGroup}
    this.numberGroup = numberGroup;
    const createSpot = spot => {
      const outline = Rectangle.bounds(spot.bounds, {
        stroke: FractionsCommonColors.numberOutlineProperty,
        lineDash: [10, 5],
        lineWidth: 2,
        lineJoin: 'round'
      });
      const text = new Text(' ', {
        fill: FractionsCommonColors.numberTextFillProperty,
        font: spot.type === NumberSpotType.WHOLE ? FractionsCommonConstants.NUMBER_WHOLE_FONT : FractionsCommonConstants.NUMBER_FRACTIONAL_FONT,
        center: outline.center
      });
      const notAllowedSize = spot.bounds.width * 0.6; // Find the right ratio?
      const notAllowedShape = new Shape().circle(0, 0, notAllowedSize).moveToPoint(Vector2.createPolar(notAllowedSize, -0.25 * Math.PI)).lineToPoint(Vector2.createPolar(notAllowedSize, 0.75 * Math.PI));
      const notAllowedNode = new Path(notAllowedShape, {
        stroke: FractionsCommonColors.numberNotAllowedProperty,
        lineWidth: 3,
        center: outline.center
      });
      this.itemsToDispose.push(Multilink.multilink([spot.pieceProperty, spot.showNotAllowedProperty], (piece, notAllowed) => {
        if (piece !== null) {
          text.string = piece.number;
          text.center = outline.center;
        }
        text.visible = piece !== null;
        outline.visible = !text.visible && !notAllowed;
        notAllowedNode.visible = !text.visible && notAllowed;
      }));
      return new Node({
        children: [outline, notAllowedNode, text]
      });
    };
    const numeratorSpot = createSpot(numberGroup.numeratorSpot);
    const denominatorSpot = createSpot(numberGroup.denominatorSpot);
    let wholeSpot;
    if (numberGroup.isMixedNumber) {
      wholeSpot = createSpot(numberGroup.wholeSpot);
    }
    const cardBackground = new Rectangle({
      fill: FractionsCommonColors.numberFillProperty,
      stroke: FractionsCommonColors.numberStrokeProperty,
      cornerRadius: FractionsCommonConstants.NUMBER_CORNER_RADIUS
    });

    // @private {function}
    this.completeVisibilityListener = isComplete => {
      cardBackground.visible = isComplete;
    };
    this.numberGroup.isCompleteProperty.link(this.completeVisibilityListener);
    const fractionLine = new Line({
      lineCap: 'round',
      lineWidth: 4,
      stroke: FractionsCommonColors.numberFractionLineProperty
    });

    // @private {Node}
    this.returnButton = new ReturnButton(options.removeLastListener);
    this.returnButton.touchArea = this.returnButton.localBounds.dilated(10);
    this.itemsToDispose.push(this.returnButton);

    // @private {function}
    this.allSpotsBoundsListener = allSpotsBounds => {
      const expandedBounds = allSpotsBounds.dilatedX(5);
      this.displayLayer.mouseArea = expandedBounds;
      this.displayLayer.touchArea = expandedBounds;
      cardBackground.rectBounds = allSpotsBounds.dilatedXY(20, 15);
      this.returnButton.rightCenter = cardBackground.leftCenter.plusXY(5, 0); // Some slight overlap shown in mockups
    };

    this.numberGroup.allSpotsBoundsProperty.link(this.allSpotsBoundsListener);

    // @private {function}
    this.fractionLineLengthListener = hasDoubleDigits => {
      const lineWidth = hasDoubleDigits ? 60 : 40;
      fractionLine.x1 = -lineWidth / 2 + numberGroup.numeratorSpot.bounds.centerX;
      fractionLine.x2 = lineWidth / 2 + numberGroup.numeratorSpot.bounds.centerX;
    };
    this.numberGroup.hasDoubleDigitsProperty.link(this.fractionLineLengthListener);

    // @private {function}
    this.undoVisibilityListener = Multilink.multilink([numberGroup.hasPiecesProperty, this.isSelectedProperty], (hasPieces, isSelected) => {
      this.returnButton.visible = hasPieces && isSelected;
    });
    this.itemsToDispose.push(this.undoVisibilityListener);
    this.controlLayer.children = [...(this.isIcon ? [] : [this.returnButton])];
    this.displayLayer.children = [...(options.hasCardBackground ? [cardBackground] : []), fractionLine, numeratorSpot, denominatorSpot, ...(numberGroup.isMixedNumber ? [wholeSpot] : [])];
    if (!this.isIcon) {
      // @private {Property.<Bounds2>}
      this.dragBoundsProperty = new DerivedProperty([options.dragBoundsProperty, this.numberGroup.allSpotsBoundsProperty], (dragBounds, allSpotsBounds) => {
        return dragBounds.withOffsets(cardBackground.left, cardBackground.top, -cardBackground.right, -cardBackground.bottom);
      });
      this.itemsToDispose.push(this.dragBoundsProperty);

      // Keep the group in the drag bounds (when they change)
      // No need to unlink, as we own the given Property
      this.dragBoundsProperty.lazyLink(dragBounds => {
        numberGroup.positionProperty.value = dragBounds.closestPointTo(numberGroup.positionProperty.value);
      });
      this.attachDragListener(this.dragBoundsProperty, options);
    }
    this.mutate(options);
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.numberGroup.isCompleteProperty.unlink(this.completeVisibilityListener);
    this.numberGroup.hasDoubleDigitsProperty.unlink(this.fractionLineLengthListener);
    this.numberGroup.allSpotsBoundsProperty.unlink(this.allSpotsBoundsListener);
    super.dispose();
  }

  /**
   * Creates an icon for the number group node.
   * @public
   *
   * @param {boolean} isMixedNumber
   * @returns {Node}
   */
  static createIcon(isMixedNumber) {
    return new NumberGroupNode(new NumberGroup(isMixedNumber), {
      isIcon: true,
      scale: FractionsCommonConstants.NUMBER_BUILD_SCALE,
      pickable: false
    });
  }
}
fractionsCommon.register('NumberGroupNode', NumberGroupNode);
export default NumberGroupNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJWZWN0b3IyIiwiU2hhcGUiLCJtZXJnZSIsIlJldHVybkJ1dHRvbiIsIkxpbmUiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsIlRleHQiLCJGcmFjdGlvbnNDb21tb25Db25zdGFudHMiLCJGcmFjdGlvbnNDb21tb25Db2xvcnMiLCJmcmFjdGlvbnNDb21tb24iLCJOdW1iZXJHcm91cCIsIk51bWJlclNwb3RUeXBlIiwiR3JvdXBOb2RlIiwiTnVtYmVyR3JvdXBOb2RlIiwiY29uc3RydWN0b3IiLCJudW1iZXJHcm91cCIsIm9wdGlvbnMiLCJhc3NlcnQiLCJoYXNDYXJkQmFja2dyb3VuZCIsImRyYWdCb3VuZHNQcm9wZXJ0eSIsInJlbW92ZUxhc3RMaXN0ZW5lciIsImN1cnNvciIsImNyZWF0ZVNwb3QiLCJzcG90Iiwib3V0bGluZSIsImJvdW5kcyIsInN0cm9rZSIsIm51bWJlck91dGxpbmVQcm9wZXJ0eSIsImxpbmVEYXNoIiwibGluZVdpZHRoIiwibGluZUpvaW4iLCJ0ZXh0IiwiZmlsbCIsIm51bWJlclRleHRGaWxsUHJvcGVydHkiLCJmb250IiwidHlwZSIsIldIT0xFIiwiTlVNQkVSX1dIT0xFX0ZPTlQiLCJOVU1CRVJfRlJBQ1RJT05BTF9GT05UIiwiY2VudGVyIiwibm90QWxsb3dlZFNpemUiLCJ3aWR0aCIsIm5vdEFsbG93ZWRTaGFwZSIsImNpcmNsZSIsIm1vdmVUb1BvaW50IiwiY3JlYXRlUG9sYXIiLCJNYXRoIiwiUEkiLCJsaW5lVG9Qb2ludCIsIm5vdEFsbG93ZWROb2RlIiwibnVtYmVyTm90QWxsb3dlZFByb3BlcnR5IiwiaXRlbXNUb0Rpc3Bvc2UiLCJwdXNoIiwibXVsdGlsaW5rIiwicGllY2VQcm9wZXJ0eSIsInNob3dOb3RBbGxvd2VkUHJvcGVydHkiLCJwaWVjZSIsIm5vdEFsbG93ZWQiLCJzdHJpbmciLCJudW1iZXIiLCJ2aXNpYmxlIiwiY2hpbGRyZW4iLCJudW1lcmF0b3JTcG90IiwiZGVub21pbmF0b3JTcG90Iiwid2hvbGVTcG90IiwiaXNNaXhlZE51bWJlciIsImNhcmRCYWNrZ3JvdW5kIiwibnVtYmVyRmlsbFByb3BlcnR5IiwibnVtYmVyU3Ryb2tlUHJvcGVydHkiLCJjb3JuZXJSYWRpdXMiLCJOVU1CRVJfQ09STkVSX1JBRElVUyIsImNvbXBsZXRlVmlzaWJpbGl0eUxpc3RlbmVyIiwiaXNDb21wbGV0ZSIsImlzQ29tcGxldGVQcm9wZXJ0eSIsImxpbmsiLCJmcmFjdGlvbkxpbmUiLCJsaW5lQ2FwIiwibnVtYmVyRnJhY3Rpb25MaW5lUHJvcGVydHkiLCJyZXR1cm5CdXR0b24iLCJ0b3VjaEFyZWEiLCJsb2NhbEJvdW5kcyIsImRpbGF0ZWQiLCJhbGxTcG90c0JvdW5kc0xpc3RlbmVyIiwiYWxsU3BvdHNCb3VuZHMiLCJleHBhbmRlZEJvdW5kcyIsImRpbGF0ZWRYIiwiZGlzcGxheUxheWVyIiwibW91c2VBcmVhIiwicmVjdEJvdW5kcyIsImRpbGF0ZWRYWSIsInJpZ2h0Q2VudGVyIiwibGVmdENlbnRlciIsInBsdXNYWSIsImFsbFNwb3RzQm91bmRzUHJvcGVydHkiLCJmcmFjdGlvbkxpbmVMZW5ndGhMaXN0ZW5lciIsImhhc0RvdWJsZURpZ2l0cyIsIngxIiwiY2VudGVyWCIsIngyIiwiaGFzRG91YmxlRGlnaXRzUHJvcGVydHkiLCJ1bmRvVmlzaWJpbGl0eUxpc3RlbmVyIiwiaGFzUGllY2VzUHJvcGVydHkiLCJpc1NlbGVjdGVkUHJvcGVydHkiLCJoYXNQaWVjZXMiLCJpc1NlbGVjdGVkIiwiY29udHJvbExheWVyIiwiaXNJY29uIiwiZHJhZ0JvdW5kcyIsIndpdGhPZmZzZXRzIiwibGVmdCIsInRvcCIsInJpZ2h0IiwiYm90dG9tIiwibGF6eUxpbmsiLCJwb3NpdGlvblByb3BlcnR5IiwidmFsdWUiLCJjbG9zZXN0UG9pbnRUbyIsImF0dGFjaERyYWdMaXN0ZW5lciIsIm11dGF0ZSIsImRpc3Bvc2UiLCJ1bmxpbmsiLCJjcmVhdGVJY29uIiwic2NhbGUiLCJOVU1CRVJfQlVJTERfU0NBTEUiLCJwaWNrYWJsZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTnVtYmVyR3JvdXBOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFZpZXcgZm9yIGEgTnVtYmVyR3JvdXAuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFJldHVybkJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZXR1cm5CdXR0b24uanMnO1xyXG5pbXBvcnQgeyBMaW5lLCBOb2RlLCBQYXRoLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9GcmFjdGlvbnNDb21tb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgRnJhY3Rpb25zQ29tbW9uQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0ZyYWN0aW9uc0NvbW1vbkNvbG9ycy5qcyc7XHJcbmltcG9ydCBmcmFjdGlvbnNDb21tb24gZnJvbSAnLi4vLi4vZnJhY3Rpb25zQ29tbW9uLmpzJztcclxuaW1wb3J0IE51bWJlckdyb3VwIGZyb20gJy4uL21vZGVsL051bWJlckdyb3VwLmpzJztcclxuaW1wb3J0IE51bWJlclNwb3RUeXBlIGZyb20gJy4uL21vZGVsL051bWJlclNwb3RUeXBlLmpzJztcclxuaW1wb3J0IEdyb3VwTm9kZSBmcm9tICcuL0dyb3VwTm9kZS5qcyc7XHJcblxyXG5jbGFzcyBOdW1iZXJHcm91cE5vZGUgZXh0ZW5kcyBHcm91cE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyR3JvdXB9IG51bWJlckdyb3VwXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBudW1iZXJHcm91cCwgb3B0aW9ucyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG51bWJlckdyb3VwIGluc3RhbmNlb2YgTnVtYmVyR3JvdXAgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgaGFzQ2FyZEJhY2tncm91bmQ6IHRydWUsXHJcbiAgICAgIGRyYWdCb3VuZHNQcm9wZXJ0eTogbnVsbCxcclxuICAgICAgcmVtb3ZlTGFzdExpc3RlbmVyOiBudWxsLFxyXG5cclxuICAgICAgLy8gbm9kZSBvcHRpb25zXHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG51bWJlckdyb3VwLCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7TnVtYmVyR3JvdXB9XHJcbiAgICB0aGlzLm51bWJlckdyb3VwID0gbnVtYmVyR3JvdXA7XHJcblxyXG4gICAgY29uc3QgY3JlYXRlU3BvdCA9IHNwb3QgPT4ge1xyXG4gICAgICBjb25zdCBvdXRsaW5lID0gUmVjdGFuZ2xlLmJvdW5kcyggc3BvdC5ib3VuZHMsIHtcclxuICAgICAgICBzdHJva2U6IEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5udW1iZXJPdXRsaW5lUHJvcGVydHksXHJcbiAgICAgICAgbGluZURhc2g6IFsgMTAsIDUgXSxcclxuICAgICAgICBsaW5lV2lkdGg6IDIsXHJcbiAgICAgICAgbGluZUpvaW46ICdyb3VuZCdcclxuICAgICAgfSApO1xyXG4gICAgICBjb25zdCB0ZXh0ID0gbmV3IFRleHQoICcgJywge1xyXG4gICAgICAgIGZpbGw6IEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5udW1iZXJUZXh0RmlsbFByb3BlcnR5LFxyXG4gICAgICAgIGZvbnQ6IHNwb3QudHlwZSA9PT0gTnVtYmVyU3BvdFR5cGUuV0hPTEUgPyBGcmFjdGlvbnNDb21tb25Db25zdGFudHMuTlVNQkVSX1dIT0xFX0ZPTlQgOiBGcmFjdGlvbnNDb21tb25Db25zdGFudHMuTlVNQkVSX0ZSQUNUSU9OQUxfRk9OVCxcclxuICAgICAgICBjZW50ZXI6IG91dGxpbmUuY2VudGVyXHJcbiAgICAgIH0gKTtcclxuICAgICAgY29uc3Qgbm90QWxsb3dlZFNpemUgPSBzcG90LmJvdW5kcy53aWR0aCAqIDAuNjsgLy8gRmluZCB0aGUgcmlnaHQgcmF0aW8/XHJcbiAgICAgIGNvbnN0IG5vdEFsbG93ZWRTaGFwZSA9IG5ldyBTaGFwZSgpLmNpcmNsZSggMCwgMCwgbm90QWxsb3dlZFNpemUgKVxyXG4gICAgICAgIC5tb3ZlVG9Qb2ludCggVmVjdG9yMi5jcmVhdGVQb2xhciggbm90QWxsb3dlZFNpemUsIC0wLjI1ICogTWF0aC5QSSApIClcclxuICAgICAgICAubGluZVRvUG9pbnQoIFZlY3RvcjIuY3JlYXRlUG9sYXIoIG5vdEFsbG93ZWRTaXplLCAwLjc1ICogTWF0aC5QSSApICk7XHJcbiAgICAgIGNvbnN0IG5vdEFsbG93ZWROb2RlID0gbmV3IFBhdGgoIG5vdEFsbG93ZWRTaGFwZSwge1xyXG4gICAgICAgIHN0cm9rZTogRnJhY3Rpb25zQ29tbW9uQ29sb3JzLm51bWJlck5vdEFsbG93ZWRQcm9wZXJ0eSxcclxuICAgICAgICBsaW5lV2lkdGg6IDMsXHJcbiAgICAgICAgY2VudGVyOiBvdXRsaW5lLmNlbnRlclxyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuaXRlbXNUb0Rpc3Bvc2UucHVzaCggTXVsdGlsaW5rLm11bHRpbGluayggWyBzcG90LnBpZWNlUHJvcGVydHksIHNwb3Quc2hvd05vdEFsbG93ZWRQcm9wZXJ0eSBdLCAoIHBpZWNlLCBub3RBbGxvd2VkICkgPT4ge1xyXG4gICAgICAgIGlmICggcGllY2UgIT09IG51bGwgKSB7XHJcbiAgICAgICAgICB0ZXh0LnN0cmluZyA9IHBpZWNlLm51bWJlcjtcclxuICAgICAgICAgIHRleHQuY2VudGVyID0gb3V0bGluZS5jZW50ZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRleHQudmlzaWJsZSA9IHBpZWNlICE9PSBudWxsO1xyXG4gICAgICAgIG91dGxpbmUudmlzaWJsZSA9ICF0ZXh0LnZpc2libGUgJiYgIW5vdEFsbG93ZWQ7XHJcbiAgICAgICAgbm90QWxsb3dlZE5vZGUudmlzaWJsZSA9ICF0ZXh0LnZpc2libGUgJiYgbm90QWxsb3dlZDtcclxuICAgICAgfSApICk7XHJcbiAgICAgIHJldHVybiBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBvdXRsaW5lLCBub3RBbGxvd2VkTm9kZSwgdGV4dCBdIH0gKTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgbnVtZXJhdG9yU3BvdCA9IGNyZWF0ZVNwb3QoIG51bWJlckdyb3VwLm51bWVyYXRvclNwb3QgKTtcclxuICAgIGNvbnN0IGRlbm9taW5hdG9yU3BvdCA9IGNyZWF0ZVNwb3QoIG51bWJlckdyb3VwLmRlbm9taW5hdG9yU3BvdCApO1xyXG4gICAgbGV0IHdob2xlU3BvdDtcclxuICAgIGlmICggbnVtYmVyR3JvdXAuaXNNaXhlZE51bWJlciApIHtcclxuICAgICAgd2hvbGVTcG90ID0gY3JlYXRlU3BvdCggbnVtYmVyR3JvdXAud2hvbGVTcG90ICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY2FyZEJhY2tncm91bmQgPSBuZXcgUmVjdGFuZ2xlKCB7XHJcbiAgICAgIGZpbGw6IEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5udW1iZXJGaWxsUHJvcGVydHksXHJcbiAgICAgIHN0cm9rZTogRnJhY3Rpb25zQ29tbW9uQ29sb3JzLm51bWJlclN0cm9rZVByb3BlcnR5LFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cy5OVU1CRVJfQ09STkVSX1JBRElVU1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn1cclxuICAgIHRoaXMuY29tcGxldGVWaXNpYmlsaXR5TGlzdGVuZXIgPSBpc0NvbXBsZXRlID0+IHtcclxuICAgICAgY2FyZEJhY2tncm91bmQudmlzaWJsZSA9IGlzQ29tcGxldGU7XHJcbiAgICB9O1xyXG4gICAgdGhpcy5udW1iZXJHcm91cC5pc0NvbXBsZXRlUHJvcGVydHkubGluayggdGhpcy5jb21wbGV0ZVZpc2liaWxpdHlMaXN0ZW5lciApO1xyXG5cclxuICAgIGNvbnN0IGZyYWN0aW9uTGluZSA9IG5ldyBMaW5lKCB7XHJcbiAgICAgIGxpbmVDYXA6ICdyb3VuZCcsXHJcbiAgICAgIGxpbmVXaWR0aDogNCxcclxuICAgICAgc3Ryb2tlOiBGcmFjdGlvbnNDb21tb25Db2xvcnMubnVtYmVyRnJhY3Rpb25MaW5lUHJvcGVydHlcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Tm9kZX1cclxuICAgIHRoaXMucmV0dXJuQnV0dG9uID0gbmV3IFJldHVybkJ1dHRvbiggb3B0aW9ucy5yZW1vdmVMYXN0TGlzdGVuZXIgKTtcclxuICAgIHRoaXMucmV0dXJuQnV0dG9uLnRvdWNoQXJlYSA9IHRoaXMucmV0dXJuQnV0dG9uLmxvY2FsQm91bmRzLmRpbGF0ZWQoIDEwICk7XHJcbiAgICB0aGlzLml0ZW1zVG9EaXNwb3NlLnB1c2goIHRoaXMucmV0dXJuQnV0dG9uICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Z1bmN0aW9ufVxyXG4gICAgdGhpcy5hbGxTcG90c0JvdW5kc0xpc3RlbmVyID0gYWxsU3BvdHNCb3VuZHMgPT4ge1xyXG4gICAgICBjb25zdCBleHBhbmRlZEJvdW5kcyA9IGFsbFNwb3RzQm91bmRzLmRpbGF0ZWRYKCA1ICk7XHJcbiAgICAgIHRoaXMuZGlzcGxheUxheWVyLm1vdXNlQXJlYSA9IGV4cGFuZGVkQm91bmRzO1xyXG4gICAgICB0aGlzLmRpc3BsYXlMYXllci50b3VjaEFyZWEgPSBleHBhbmRlZEJvdW5kcztcclxuICAgICAgY2FyZEJhY2tncm91bmQucmVjdEJvdW5kcyA9IGFsbFNwb3RzQm91bmRzLmRpbGF0ZWRYWSggMjAsIDE1ICk7XHJcbiAgICAgIHRoaXMucmV0dXJuQnV0dG9uLnJpZ2h0Q2VudGVyID0gY2FyZEJhY2tncm91bmQubGVmdENlbnRlci5wbHVzWFkoIDUsIDAgKTsgLy8gU29tZSBzbGlnaHQgb3ZlcmxhcCBzaG93biBpbiBtb2NrdXBzXHJcbiAgICB9O1xyXG4gICAgdGhpcy5udW1iZXJHcm91cC5hbGxTcG90c0JvdW5kc1Byb3BlcnR5LmxpbmsoIHRoaXMuYWxsU3BvdHNCb3VuZHNMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn1cclxuICAgIHRoaXMuZnJhY3Rpb25MaW5lTGVuZ3RoTGlzdGVuZXIgPSBoYXNEb3VibGVEaWdpdHMgPT4ge1xyXG4gICAgICBjb25zdCBsaW5lV2lkdGggPSBoYXNEb3VibGVEaWdpdHMgPyA2MCA6IDQwO1xyXG4gICAgICBmcmFjdGlvbkxpbmUueDEgPSAtbGluZVdpZHRoIC8gMiArIG51bWJlckdyb3VwLm51bWVyYXRvclNwb3QuYm91bmRzLmNlbnRlclg7XHJcbiAgICAgIGZyYWN0aW9uTGluZS54MiA9IGxpbmVXaWR0aCAvIDIgKyBudW1iZXJHcm91cC5udW1lcmF0b3JTcG90LmJvdW5kcy5jZW50ZXJYO1xyXG4gICAgfTtcclxuICAgIHRoaXMubnVtYmVyR3JvdXAuaGFzRG91YmxlRGlnaXRzUHJvcGVydHkubGluayggdGhpcy5mcmFjdGlvbkxpbmVMZW5ndGhMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn1cclxuICAgIHRoaXMudW5kb1Zpc2liaWxpdHlMaXN0ZW5lciA9IE11bHRpbGluay5tdWx0aWxpbmsoIFsgbnVtYmVyR3JvdXAuaGFzUGllY2VzUHJvcGVydHksIHRoaXMuaXNTZWxlY3RlZFByb3BlcnR5IF0sICggaGFzUGllY2VzLCBpc1NlbGVjdGVkICkgPT4ge1xyXG4gICAgICB0aGlzLnJldHVybkJ1dHRvbi52aXNpYmxlID0gaGFzUGllY2VzICYmIGlzU2VsZWN0ZWQ7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLml0ZW1zVG9EaXNwb3NlLnB1c2goIHRoaXMudW5kb1Zpc2liaWxpdHlMaXN0ZW5lciApO1xyXG5cclxuICAgIHRoaXMuY29udHJvbExheWVyLmNoaWxkcmVuID0gW1xyXG4gICAgICAuLi4oIHRoaXMuaXNJY29uID8gW10gOiBbIHRoaXMucmV0dXJuQnV0dG9uIF0gKVxyXG4gICAgXTtcclxuXHJcbiAgICB0aGlzLmRpc3BsYXlMYXllci5jaGlsZHJlbiA9IFtcclxuICAgICAgLi4uKCBvcHRpb25zLmhhc0NhcmRCYWNrZ3JvdW5kID8gWyBjYXJkQmFja2dyb3VuZCBdIDogW10gKSxcclxuICAgICAgZnJhY3Rpb25MaW5lLFxyXG4gICAgICBudW1lcmF0b3JTcG90LFxyXG4gICAgICBkZW5vbWluYXRvclNwb3QsXHJcbiAgICAgIC4uLiggbnVtYmVyR3JvdXAuaXNNaXhlZE51bWJlciA/IFsgd2hvbGVTcG90IF0gOiBbXSApXHJcbiAgICBdO1xyXG5cclxuICAgIGlmICggIXRoaXMuaXNJY29uICkge1xyXG4gICAgICAvLyBAcHJpdmF0ZSB7UHJvcGVydHkuPEJvdW5kczI+fVxyXG4gICAgICB0aGlzLmRyYWdCb3VuZHNQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgb3B0aW9ucy5kcmFnQm91bmRzUHJvcGVydHksIHRoaXMubnVtYmVyR3JvdXAuYWxsU3BvdHNCb3VuZHNQcm9wZXJ0eSBdLCAoIGRyYWdCb3VuZHMsIGFsbFNwb3RzQm91bmRzICkgPT4ge1xyXG4gICAgICAgIHJldHVybiBkcmFnQm91bmRzLndpdGhPZmZzZXRzKCBjYXJkQmFja2dyb3VuZC5sZWZ0LCBjYXJkQmFja2dyb3VuZC50b3AsIC1jYXJkQmFja2dyb3VuZC5yaWdodCwgLWNhcmRCYWNrZ3JvdW5kLmJvdHRvbSApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuaXRlbXNUb0Rpc3Bvc2UucHVzaCggdGhpcy5kcmFnQm91bmRzUHJvcGVydHkgKTtcclxuXHJcbiAgICAgIC8vIEtlZXAgdGhlIGdyb3VwIGluIHRoZSBkcmFnIGJvdW5kcyAod2hlbiB0aGV5IGNoYW5nZSlcclxuICAgICAgLy8gTm8gbmVlZCB0byB1bmxpbmssIGFzIHdlIG93biB0aGUgZ2l2ZW4gUHJvcGVydHlcclxuICAgICAgdGhpcy5kcmFnQm91bmRzUHJvcGVydHkubGF6eUxpbmsoIGRyYWdCb3VuZHMgPT4ge1xyXG4gICAgICAgIG51bWJlckdyb3VwLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBkcmFnQm91bmRzLmNsb3Nlc3RQb2ludFRvKCBudW1iZXJHcm91cC5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHRoaXMuYXR0YWNoRHJhZ0xpc3RlbmVyKCB0aGlzLmRyYWdCb3VuZHNQcm9wZXJ0eSwgb3B0aW9ucyApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5udW1iZXJHcm91cC5pc0NvbXBsZXRlUHJvcGVydHkudW5saW5rKCB0aGlzLmNvbXBsZXRlVmlzaWJpbGl0eUxpc3RlbmVyICk7XHJcbiAgICB0aGlzLm51bWJlckdyb3VwLmhhc0RvdWJsZURpZ2l0c1Byb3BlcnR5LnVubGluayggdGhpcy5mcmFjdGlvbkxpbmVMZW5ndGhMaXN0ZW5lciApO1xyXG4gICAgdGhpcy5udW1iZXJHcm91cC5hbGxTcG90c0JvdW5kc1Byb3BlcnR5LnVubGluayggdGhpcy5hbGxTcG90c0JvdW5kc0xpc3RlbmVyICk7XHJcblxyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbiBpY29uIGZvciB0aGUgbnVtYmVyIGdyb3VwIG5vZGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBpc01peGVkTnVtYmVyXHJcbiAgICogQHJldHVybnMge05vZGV9XHJcbiAgICovXHJcbiAgc3RhdGljIGNyZWF0ZUljb24oIGlzTWl4ZWROdW1iZXIgKSB7XHJcbiAgICByZXR1cm4gbmV3IE51bWJlckdyb3VwTm9kZSggbmV3IE51bWJlckdyb3VwKCBpc01peGVkTnVtYmVyICksIHtcclxuICAgICAgaXNJY29uOiB0cnVlLFxyXG4gICAgICBzY2FsZTogRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLk5VTUJFUl9CVUlMRF9TQ0FMRSxcclxuICAgICAgcGlja2FibGU6IGZhbHNlXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5mcmFjdGlvbnNDb21tb24ucmVnaXN0ZXIoICdOdW1iZXJHcm91cE5vZGUnLCBOdW1iZXJHcm91cE5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgTnVtYmVyR3JvdXBOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxTQUFT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