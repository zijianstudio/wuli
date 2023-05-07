// Copyright 2017-2022, University of Colorado Boulder

/**
 * Shows the product or factors for a partitioned area over a rounded background.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import { HBox, Node, Rectangle, RichText, Text } from '../../../../scenery/js/imports.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonConstants from '../AreaModelCommonConstants.js';
import PartialProductsChoice from '../model/PartialProductsChoice.js';
import AreaModelCommonColors from './AreaModelCommonColors.js';
class PartialProductLabelNode extends Node {
  /**
   * @param {Property.<PartialProductsChoice>} partialProductsChoiceProperty
   * @param {Property.<PartitionedArea|null>} partitionedAreaProperty
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed
   */
  constructor(partialProductsChoiceProperty, partitionedAreaProperty, allowExponents) {
    assert && assert(partialProductsChoiceProperty instanceof ReadOnlyProperty);
    assert && assert(typeof allowExponents === 'boolean');
    super();

    // @public {Property.<PartitionedArea|null>} - Exposed for improved positioning capability AND setting with pool
    this.partitionedAreaProperty = partitionedAreaProperty;
    const areaProperty = new DynamicProperty(partitionedAreaProperty, {
      derive: 'areaProperty'
    });
    const visibleProperty = new DynamicProperty(partitionedAreaProperty, {
      derive: 'visibleProperty',
      defaultValue: false
    });
    const horizontalSizeProperty = new DynamicProperty(partitionedAreaProperty, {
      derive: partitionedArea => partitionedArea.partitions.horizontal.sizeProperty
    });
    const verticalSizeProperty = new DynamicProperty(partitionedAreaProperty, {
      derive: partitionedArea => partitionedArea.partitions.vertical.sizeProperty
    });
    const background = new Rectangle({
      cornerRadius: 3,
      stroke: new DerivedProperty([areaProperty, AreaModelCommonColors.partialProductBorderProperty], (area, color) => area === null || area.coefficient === 0 ? 'transparent' : color),
      fill: AreaModelCommonColors.partialProductBackgroundProperty
    });
    this.addChild(background);
    const box = new HBox({
      align: 'origin'
    });
    this.addChild(box);

    // Visibility
    Multilink.multilink([partialProductsChoiceProperty, visibleProperty], (choice, areaVisible) => {
      this.visible = areaVisible && choice !== PartialProductsChoice.HIDDEN;
    });

    // RichTexts (we reuse the same instances to prevent GC and cpu cost)
    const productRichText = new RichText('', {
      font: AreaModelCommonConstants.PARTIAL_PRODUCT_FONT
    });
    const factorsTextOptions = {
      font: AreaModelCommonConstants.PARTIAL_FACTOR_FONT
    };
    const horizontalRichText = new RichText('', factorsTextOptions);
    const verticalRichText = new RichText('', factorsTextOptions);
    const rectangleSize = allowExponents ? 12 : 14;

    // Shifting the rectangles down, so we don't incur a large performance penalty for size-testing things
    const rectangleExponentPadding = allowExponents ? 1.3 : 0;
    const rectangleCenterY = new Text(' ', factorsTextOptions).centerY - rectangleSize / 2 + rectangleExponentPadding;
    const horizontalRectangle = new Rectangle(0, rectangleCenterY, rectangleSize, rectangleSize, {
      stroke: 'black',
      lineWidth: 0.7
    });
    const verticalRectangle = new Rectangle(0, rectangleCenterY, rectangleSize, rectangleSize, {
      stroke: 'black',
      lineWidth: 0.7
    });
    if (allowExponents) {
      const exponentPadding = 2;
      horizontalRectangle.localBounds = horizontalRectangle.localBounds.dilatedX(exponentPadding);
      verticalRectangle.localBounds = verticalRectangle.localBounds.dilatedX(exponentPadding);
    }

    // Persistent text nodes (for performance)
    const leftParenNode = new Text('(', factorsTextOptions);
    const middleParensNode = new Text(')(', factorsTextOptions);
    const rightParenNode = new Text(')', factorsTextOptions);
    const timesNode = new Text(MathSymbols.TIMES, factorsTextOptions);

    // Text/alignment
    Multilink.multilink([horizontalSizeProperty, verticalSizeProperty, partialProductsChoiceProperty], (horizontalSize, verticalSize, choice) => {
      let children;

      // Hidden
      if (choice === PartialProductsChoice.HIDDEN) {
        children = [];
      }

      // Product
      else if (choice === PartialProductsChoice.PRODUCTS) {
        productRichText.string = horizontalSize === null || verticalSize === null ? '?' : horizontalSize.times(verticalSize).toRichString(false);
        children = [productRichText];
      }

      // Factors
      else {
        const horizontalNode = horizontalSize ? horizontalRichText.setString(horizontalSize.toRichString(false)) : horizontalRectangle;
        const verticalNode = verticalSize ? verticalRichText.setString(verticalSize.toRichString(false)) : verticalRectangle;
        if (allowExponents) {
          box.spacing = 0;
          children = [leftParenNode, verticalNode, middleParensNode, horizontalNode, rightParenNode];
        } else {
          box.spacing = 2;
          children = [verticalNode, timesNode, horizontalNode];
        }
      }
      box.children = children;
      if (isFinite(box.width)) {
        box.center = Vector2.ZERO;
        background.rectBounds = box.bounds.dilatedXY(4, 2);
      }
    });
  }
}
areaModelCommon.register('PartialProductLabelNode', PartialProductLabelNode);
export default PartialProductLabelNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJEeW5hbWljUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJSZWFkT25seVByb3BlcnR5IiwiVmVjdG9yMiIsIk1hdGhTeW1ib2xzIiwiSEJveCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJSaWNoVGV4dCIsIlRleHQiLCJhcmVhTW9kZWxDb21tb24iLCJBcmVhTW9kZWxDb21tb25Db25zdGFudHMiLCJQYXJ0aWFsUHJvZHVjdHNDaG9pY2UiLCJBcmVhTW9kZWxDb21tb25Db2xvcnMiLCJQYXJ0aWFsUHJvZHVjdExhYmVsTm9kZSIsImNvbnN0cnVjdG9yIiwicGFydGlhbFByb2R1Y3RzQ2hvaWNlUHJvcGVydHkiLCJwYXJ0aXRpb25lZEFyZWFQcm9wZXJ0eSIsImFsbG93RXhwb25lbnRzIiwiYXNzZXJ0IiwiYXJlYVByb3BlcnR5IiwiZGVyaXZlIiwidmlzaWJsZVByb3BlcnR5IiwiZGVmYXVsdFZhbHVlIiwiaG9yaXpvbnRhbFNpemVQcm9wZXJ0eSIsInBhcnRpdGlvbmVkQXJlYSIsInBhcnRpdGlvbnMiLCJob3Jpem9udGFsIiwic2l6ZVByb3BlcnR5IiwidmVydGljYWxTaXplUHJvcGVydHkiLCJ2ZXJ0aWNhbCIsImJhY2tncm91bmQiLCJjb3JuZXJSYWRpdXMiLCJzdHJva2UiLCJwYXJ0aWFsUHJvZHVjdEJvcmRlclByb3BlcnR5IiwiYXJlYSIsImNvbG9yIiwiY29lZmZpY2llbnQiLCJmaWxsIiwicGFydGlhbFByb2R1Y3RCYWNrZ3JvdW5kUHJvcGVydHkiLCJhZGRDaGlsZCIsImJveCIsImFsaWduIiwibXVsdGlsaW5rIiwiY2hvaWNlIiwiYXJlYVZpc2libGUiLCJ2aXNpYmxlIiwiSElEREVOIiwicHJvZHVjdFJpY2hUZXh0IiwiZm9udCIsIlBBUlRJQUxfUFJPRFVDVF9GT05UIiwiZmFjdG9yc1RleHRPcHRpb25zIiwiUEFSVElBTF9GQUNUT1JfRk9OVCIsImhvcml6b250YWxSaWNoVGV4dCIsInZlcnRpY2FsUmljaFRleHQiLCJyZWN0YW5nbGVTaXplIiwicmVjdGFuZ2xlRXhwb25lbnRQYWRkaW5nIiwicmVjdGFuZ2xlQ2VudGVyWSIsImNlbnRlclkiLCJob3Jpem9udGFsUmVjdGFuZ2xlIiwibGluZVdpZHRoIiwidmVydGljYWxSZWN0YW5nbGUiLCJleHBvbmVudFBhZGRpbmciLCJsb2NhbEJvdW5kcyIsImRpbGF0ZWRYIiwibGVmdFBhcmVuTm9kZSIsIm1pZGRsZVBhcmVuc05vZGUiLCJyaWdodFBhcmVuTm9kZSIsInRpbWVzTm9kZSIsIlRJTUVTIiwiaG9yaXpvbnRhbFNpemUiLCJ2ZXJ0aWNhbFNpemUiLCJjaGlsZHJlbiIsIlBST0RVQ1RTIiwic3RyaW5nIiwidGltZXMiLCJ0b1JpY2hTdHJpbmciLCJob3Jpem9udGFsTm9kZSIsInNldFN0cmluZyIsInZlcnRpY2FsTm9kZSIsInNwYWNpbmciLCJpc0Zpbml0ZSIsIndpZHRoIiwiY2VudGVyIiwiWkVSTyIsInJlY3RCb3VuZHMiLCJib3VuZHMiLCJkaWxhdGVkWFkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBhcnRpYWxQcm9kdWN0TGFiZWxOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNob3dzIHRoZSBwcm9kdWN0IG9yIGZhY3RvcnMgZm9yIGEgcGFydGl0aW9uZWQgYXJlYSBvdmVyIGEgcm91bmRlZCBiYWNrZ3JvdW5kLlxyXG4gKlxyXG4gKiBOT1RFOiBUaGlzIHR5cGUgaXMgZGVzaWduZWQgdG8gYmUgcGVyc2lzdGVudCwgYW5kIHdpbGwgbm90IG5lZWQgdG8gcmVsZWFzZSByZWZlcmVuY2VzIHRvIGF2b2lkIG1lbW9yeSBsZWFrcy5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRHluYW1pY1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRHluYW1pY1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IE1hdGhTeW1ib2xzIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYXRoU3ltYm9scy5qcyc7XHJcbmltcG9ydCB7IEhCb3gsIE5vZGUsIFJlY3RhbmdsZSwgUmljaFRleHQsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgYXJlYU1vZGVsQ29tbW9uIGZyb20gJy4uLy4uL2FyZWFNb2RlbENvbW1vbi5qcyc7XHJcbmltcG9ydCBBcmVhTW9kZWxDb21tb25Db25zdGFudHMgZnJvbSAnLi4vQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFBhcnRpYWxQcm9kdWN0c0Nob2ljZSBmcm9tICcuLi9tb2RlbC9QYXJ0aWFsUHJvZHVjdHNDaG9pY2UuanMnO1xyXG5pbXBvcnQgQXJlYU1vZGVsQ29tbW9uQ29sb3JzIGZyb20gJy4vQXJlYU1vZGVsQ29tbW9uQ29sb3JzLmpzJztcclxuXHJcbmNsYXNzIFBhcnRpYWxQcm9kdWN0TGFiZWxOb2RlIGV4dGVuZHMgTm9kZSB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48UGFydGlhbFByb2R1Y3RzQ2hvaWNlPn0gcGFydGlhbFByb2R1Y3RzQ2hvaWNlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxQYXJ0aXRpb25lZEFyZWF8bnVsbD59IHBhcnRpdGlvbmVkQXJlYVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtib29sZWFufSBhbGxvd0V4cG9uZW50cyAtIFdoZXRoZXIgZXhwb25lbnRzIChwb3dlcnMgb2YgeCkgYXJlIGFsbG93ZWRcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcGFydGlhbFByb2R1Y3RzQ2hvaWNlUHJvcGVydHksIHBhcnRpdGlvbmVkQXJlYVByb3BlcnR5LCBhbGxvd0V4cG9uZW50cyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBhcnRpYWxQcm9kdWN0c0Nob2ljZVByb3BlcnR5IGluc3RhbmNlb2YgUmVhZE9ubHlQcm9wZXJ0eSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGFsbG93RXhwb25lbnRzID09PSAnYm9vbGVhbicgKTtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxQYXJ0aXRpb25lZEFyZWF8bnVsbD59IC0gRXhwb3NlZCBmb3IgaW1wcm92ZWQgcG9zaXRpb25pbmcgY2FwYWJpbGl0eSBBTkQgc2V0dGluZyB3aXRoIHBvb2xcclxuICAgIHRoaXMucGFydGl0aW9uZWRBcmVhUHJvcGVydHkgPSBwYXJ0aXRpb25lZEFyZWFQcm9wZXJ0eTtcclxuXHJcbiAgICBjb25zdCBhcmVhUHJvcGVydHkgPSBuZXcgRHluYW1pY1Byb3BlcnR5KCBwYXJ0aXRpb25lZEFyZWFQcm9wZXJ0eSwge1xyXG4gICAgICBkZXJpdmU6ICdhcmVhUHJvcGVydHknXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCB2aXNpYmxlUHJvcGVydHkgPSBuZXcgRHluYW1pY1Byb3BlcnR5KCBwYXJ0aXRpb25lZEFyZWFQcm9wZXJ0eSwge1xyXG4gICAgICBkZXJpdmU6ICd2aXNpYmxlUHJvcGVydHknLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IGZhbHNlXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBob3Jpem9udGFsU2l6ZVByb3BlcnR5ID0gbmV3IER5bmFtaWNQcm9wZXJ0eSggcGFydGl0aW9uZWRBcmVhUHJvcGVydHksIHtcclxuICAgICAgZGVyaXZlOiBwYXJ0aXRpb25lZEFyZWEgPT4gcGFydGl0aW9uZWRBcmVhLnBhcnRpdGlvbnMuaG9yaXpvbnRhbC5zaXplUHJvcGVydHlcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHZlcnRpY2FsU2l6ZVByb3BlcnR5ID0gbmV3IER5bmFtaWNQcm9wZXJ0eSggcGFydGl0aW9uZWRBcmVhUHJvcGVydHksIHtcclxuICAgICAgZGVyaXZlOiBwYXJ0aXRpb25lZEFyZWEgPT4gcGFydGl0aW9uZWRBcmVhLnBhcnRpdGlvbnMudmVydGljYWwuc2l6ZVByb3BlcnR5XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgYmFja2dyb3VuZCA9IG5ldyBSZWN0YW5nbGUoIHtcclxuICAgICAgY29ybmVyUmFkaXVzOiAzLFxyXG4gICAgICBzdHJva2U6IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgICAgWyBhcmVhUHJvcGVydHksIEFyZWFNb2RlbENvbW1vbkNvbG9ycy5wYXJ0aWFsUHJvZHVjdEJvcmRlclByb3BlcnR5IF0sXHJcbiAgICAgICAgKCBhcmVhLCBjb2xvciApID0+ICggYXJlYSA9PT0gbnVsbCB8fCBhcmVhLmNvZWZmaWNpZW50ID09PSAwICkgPyAndHJhbnNwYXJlbnQnIDogY29sb3IgKSxcclxuICAgICAgZmlsbDogQXJlYU1vZGVsQ29tbW9uQ29sb3JzLnBhcnRpYWxQcm9kdWN0QmFja2dyb3VuZFByb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBiYWNrZ3JvdW5kICk7XHJcblxyXG4gICAgY29uc3QgYm94ID0gbmV3IEhCb3goIHtcclxuICAgICAgYWxpZ246ICdvcmlnaW4nXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBib3ggKTtcclxuXHJcbiAgICAvLyBWaXNpYmlsaXR5XHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIHBhcnRpYWxQcm9kdWN0c0Nob2ljZVByb3BlcnR5LCB2aXNpYmxlUHJvcGVydHkgXSwgKCBjaG9pY2UsIGFyZWFWaXNpYmxlICkgPT4ge1xyXG4gICAgICB0aGlzLnZpc2libGUgPSBhcmVhVmlzaWJsZSAmJiAoIGNob2ljZSAhPT0gUGFydGlhbFByb2R1Y3RzQ2hvaWNlLkhJRERFTiApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFJpY2hUZXh0cyAod2UgcmV1c2UgdGhlIHNhbWUgaW5zdGFuY2VzIHRvIHByZXZlbnQgR0MgYW5kIGNwdSBjb3N0KVxyXG4gICAgY29uc3QgcHJvZHVjdFJpY2hUZXh0ID0gbmV3IFJpY2hUZXh0KCAnJywge1xyXG4gICAgICBmb250OiBBcmVhTW9kZWxDb21tb25Db25zdGFudHMuUEFSVElBTF9QUk9EVUNUX0ZPTlRcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGZhY3RvcnNUZXh0T3B0aW9ucyA9IHtcclxuICAgICAgZm9udDogQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLlBBUlRJQUxfRkFDVE9SX0ZPTlRcclxuICAgIH07XHJcbiAgICBjb25zdCBob3Jpem9udGFsUmljaFRleHQgPSBuZXcgUmljaFRleHQoICcnLCBmYWN0b3JzVGV4dE9wdGlvbnMgKTtcclxuICAgIGNvbnN0IHZlcnRpY2FsUmljaFRleHQgPSBuZXcgUmljaFRleHQoICcnLCBmYWN0b3JzVGV4dE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCByZWN0YW5nbGVTaXplID0gYWxsb3dFeHBvbmVudHMgPyAxMiA6IDE0O1xyXG5cclxuICAgIC8vIFNoaWZ0aW5nIHRoZSByZWN0YW5nbGVzIGRvd24sIHNvIHdlIGRvbid0IGluY3VyIGEgbGFyZ2UgcGVyZm9ybWFuY2UgcGVuYWx0eSBmb3Igc2l6ZS10ZXN0aW5nIHRoaW5nc1xyXG4gICAgY29uc3QgcmVjdGFuZ2xlRXhwb25lbnRQYWRkaW5nID0gYWxsb3dFeHBvbmVudHMgPyAxLjMgOiAwO1xyXG4gICAgY29uc3QgcmVjdGFuZ2xlQ2VudGVyWSA9IG5ldyBUZXh0KCAnICcsIGZhY3RvcnNUZXh0T3B0aW9ucyApLmNlbnRlclkgLSByZWN0YW5nbGVTaXplIC8gMiArIHJlY3RhbmdsZUV4cG9uZW50UGFkZGluZztcclxuICAgIGNvbnN0IGhvcml6b250YWxSZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCByZWN0YW5nbGVDZW50ZXJZLCByZWN0YW5nbGVTaXplLCByZWN0YW5nbGVTaXplLCB7XHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgbGluZVdpZHRoOiAwLjdcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHZlcnRpY2FsUmVjdGFuZ2xlID0gbmV3IFJlY3RhbmdsZSggMCwgcmVjdGFuZ2xlQ2VudGVyWSwgcmVjdGFuZ2xlU2l6ZSwgcmVjdGFuZ2xlU2l6ZSwge1xyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGxpbmVXaWR0aDogMC43XHJcbiAgICB9ICk7XHJcbiAgICBpZiAoIGFsbG93RXhwb25lbnRzICkge1xyXG4gICAgICBjb25zdCBleHBvbmVudFBhZGRpbmcgPSAyO1xyXG4gICAgICBob3Jpem9udGFsUmVjdGFuZ2xlLmxvY2FsQm91bmRzID0gaG9yaXpvbnRhbFJlY3RhbmdsZS5sb2NhbEJvdW5kcy5kaWxhdGVkWCggZXhwb25lbnRQYWRkaW5nICk7XHJcbiAgICAgIHZlcnRpY2FsUmVjdGFuZ2xlLmxvY2FsQm91bmRzID0gdmVydGljYWxSZWN0YW5nbGUubG9jYWxCb3VuZHMuZGlsYXRlZFgoIGV4cG9uZW50UGFkZGluZyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFBlcnNpc3RlbnQgdGV4dCBub2RlcyAoZm9yIHBlcmZvcm1hbmNlKVxyXG4gICAgY29uc3QgbGVmdFBhcmVuTm9kZSA9IG5ldyBUZXh0KCAnKCcsIGZhY3RvcnNUZXh0T3B0aW9ucyApO1xyXG4gICAgY29uc3QgbWlkZGxlUGFyZW5zTm9kZSA9IG5ldyBUZXh0KCAnKSgnLCBmYWN0b3JzVGV4dE9wdGlvbnMgKTtcclxuICAgIGNvbnN0IHJpZ2h0UGFyZW5Ob2RlID0gbmV3IFRleHQoICcpJywgZmFjdG9yc1RleHRPcHRpb25zICk7XHJcbiAgICBjb25zdCB0aW1lc05vZGUgPSBuZXcgVGV4dCggTWF0aFN5bWJvbHMuVElNRVMsIGZhY3RvcnNUZXh0T3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFRleHQvYWxpZ25tZW50XHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICBbIGhvcml6b250YWxTaXplUHJvcGVydHksIHZlcnRpY2FsU2l6ZVByb3BlcnR5LCBwYXJ0aWFsUHJvZHVjdHNDaG9pY2VQcm9wZXJ0eSBdLFxyXG4gICAgICAoIGhvcml6b250YWxTaXplLCB2ZXJ0aWNhbFNpemUsIGNob2ljZSApID0+IHtcclxuICAgICAgICBsZXQgY2hpbGRyZW47XHJcblxyXG4gICAgICAgIC8vIEhpZGRlblxyXG4gICAgICAgIGlmICggY2hvaWNlID09PSBQYXJ0aWFsUHJvZHVjdHNDaG9pY2UuSElEREVOICkge1xyXG4gICAgICAgICAgY2hpbGRyZW4gPSBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFByb2R1Y3RcclxuICAgICAgICBlbHNlIGlmICggY2hvaWNlID09PSBQYXJ0aWFsUHJvZHVjdHNDaG9pY2UuUFJPRFVDVFMgKSB7XHJcbiAgICAgICAgICBwcm9kdWN0UmljaFRleHQuc3RyaW5nID0gKCBob3Jpem9udGFsU2l6ZSA9PT0gbnVsbCB8fCB2ZXJ0aWNhbFNpemUgPT09IG51bGwgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICc/J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGhvcml6b250YWxTaXplLnRpbWVzKCB2ZXJ0aWNhbFNpemUgKS50b1JpY2hTdHJpbmcoIGZhbHNlICk7XHJcbiAgICAgICAgICBjaGlsZHJlbiA9IFsgcHJvZHVjdFJpY2hUZXh0IF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBGYWN0b3JzXHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgY29uc3QgaG9yaXpvbnRhbE5vZGUgPSBob3Jpem9udGFsU2l6ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGhvcml6b250YWxSaWNoVGV4dC5zZXRTdHJpbmcoIGhvcml6b250YWxTaXplLnRvUmljaFN0cmluZyggZmFsc2UgKSApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogaG9yaXpvbnRhbFJlY3RhbmdsZTtcclxuICAgICAgICAgIGNvbnN0IHZlcnRpY2FsTm9kZSA9IHZlcnRpY2FsU2l6ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyB2ZXJ0aWNhbFJpY2hUZXh0LnNldFN0cmluZyggdmVydGljYWxTaXplLnRvUmljaFN0cmluZyggZmFsc2UgKSApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHZlcnRpY2FsUmVjdGFuZ2xlO1xyXG5cclxuICAgICAgICAgIGlmICggYWxsb3dFeHBvbmVudHMgKSB7XHJcbiAgICAgICAgICAgIGJveC5zcGFjaW5nID0gMDtcclxuICAgICAgICAgICAgY2hpbGRyZW4gPSBbXHJcbiAgICAgICAgICAgICAgbGVmdFBhcmVuTm9kZSxcclxuICAgICAgICAgICAgICB2ZXJ0aWNhbE5vZGUsXHJcbiAgICAgICAgICAgICAgbWlkZGxlUGFyZW5zTm9kZSxcclxuICAgICAgICAgICAgICBob3Jpem9udGFsTm9kZSxcclxuICAgICAgICAgICAgICByaWdodFBhcmVuTm9kZVxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGJveC5zcGFjaW5nID0gMjtcclxuICAgICAgICAgICAgY2hpbGRyZW4gPSBbXHJcbiAgICAgICAgICAgICAgdmVydGljYWxOb2RlLFxyXG4gICAgICAgICAgICAgIHRpbWVzTm9kZSxcclxuICAgICAgICAgICAgICBob3Jpem9udGFsTm9kZVxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYm94LmNoaWxkcmVuID0gY2hpbGRyZW47XHJcblxyXG4gICAgICAgIGlmICggaXNGaW5pdGUoIGJveC53aWR0aCApICkge1xyXG4gICAgICAgICAgYm94LmNlbnRlciA9IFZlY3RvcjIuWkVSTztcclxuICAgICAgICAgIGJhY2tncm91bmQucmVjdEJvdW5kcyA9IGJveC5ib3VuZHMuZGlsYXRlZFhZKCA0LCAyICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5hcmVhTW9kZWxDb21tb24ucmVnaXN0ZXIoICdQYXJ0aWFsUHJvZHVjdExhYmVsTm9kZScsIFBhcnRpYWxQcm9kdWN0TGFiZWxOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQYXJ0aWFsUHJvZHVjdExhYmVsTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLGdCQUFnQixNQUFNLHlDQUF5QztBQUN0RSxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsUUFBUSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3pGLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0Msd0JBQXdCLE1BQU0sZ0NBQWdDO0FBQ3JFLE9BQU9DLHFCQUFxQixNQUFNLG1DQUFtQztBQUNyRSxPQUFPQyxxQkFBcUIsTUFBTSw0QkFBNEI7QUFFOUQsTUFBTUMsdUJBQXVCLFNBQVNSLElBQUksQ0FBQztF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