// Copyright 2013-2022, University of Colorado Boulder

/**
 * View for the grid in trapezoid and chamber pools which shows horizontal lines along the pool indicating the depth.
 * Callouts indicating depth are shown on the lines with an option (slantMultiplier) to show them horizontally displaced
 * compared with the ones on the above and below lines. Supports both english and metric units.
 *
 * @author Vasily Shakhov (Mlearner)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import fluidPressureAndFlow from '../../fluidPressureAndFlow.js';
import FluidPressureAndFlowStrings from '../../FluidPressureAndFlowStrings.js';
import GridLinesNode from './GridLinesNode.js';
const ftString = FluidPressureAndFlowStrings.ft;
const mString = FluidPressureAndFlowStrings.m;
const valueWithUnitsPatternString = FluidPressureAndFlowStrings.valueWithUnitsPattern;
class TrapezoidPoolGrid extends Node {
  /**
   * @param {UnderPressureModel} underPressureModel
   * @param {ModelViewTransform2 } modelViewTransform to convert between model and view co-ordinates
   * @param {number} poolLeftX is pool left x coordinate
   * @param {number} poolTopY is pool top y coordinate
   * @param {number} poolRightX is pool right x coordinate
   * @param {number} poolBottomY is pool bottom y coordinate
   * @param {number} poolHeight is height of the pool
   * @param {number} labelXPosition is label x position
   * @param {number} slantMultiplier is to make label line up in space between the pools
   */
  constructor(underPressureModel, modelViewTransform, poolLeftX, poolTopY, poolRightX, poolBottomY, poolHeight, labelXPosition, slantMultiplier) {
    super();
    const fontOptions = {
      font: new PhetFont(12),
      maxWidth: 20
    };

    // add grid line
    this.addChild(new GridLinesNode(underPressureModel.measureUnitsProperty, modelViewTransform, poolLeftX, poolTopY, poolRightX, poolBottomY));

    // Add the labels for meters
    const depthLabelsMeters = new Node();
    for (let depthMeters = 0; depthMeters <= poolHeight; depthMeters++) {
      const metersText = new Text(StringUtils.format(valueWithUnitsPatternString, depthMeters, mString), fontOptions);
      const metersLabelRect = new Rectangle(0, 0, metersText.width + 5, metersText.height + 5, 10, 10, {
        fill: '#67a257'
      });
      metersText.center = metersLabelRect.center;
      metersLabelRect.addChild(metersText);
      metersLabelRect.centerX = labelXPosition + modelViewTransform.modelToViewX(depthMeters * slantMultiplier);
      metersLabelRect.centerY = modelViewTransform.modelToViewY(-depthMeters);
      depthLabelsMeters.addChild(metersLabelRect);
    }

    // Add the labels for feet, adjust for loop to limit number of labels.
    const depthLabelsFeet = new Node();
    for (let depthFeet = 0; depthFeet <= poolHeight * 3.3 + 1; depthFeet += 5) {
      const feetText = new Text(StringUtils.format(valueWithUnitsPatternString, depthFeet, ftString), fontOptions);
      const feetLabelRect = new Rectangle(0, 0, feetText.width + 5, feetText.height + 5, 10, 10, {
        fill: '#67a257'
      });
      feetText.center = feetLabelRect.center;
      feetLabelRect.addChild(feetText);
      feetLabelRect.centerX = labelXPosition + modelViewTransform.modelToViewDeltaX(depthFeet / 3.3 * slantMultiplier);
      feetLabelRect.centerY = modelViewTransform.modelToViewY(-depthFeet / 3.3);
      depthLabelsFeet.addChild(feetLabelRect);
    }
    this.addChild(depthLabelsMeters);
    this.addChild(depthLabelsFeet);
    underPressureModel.measureUnitsProperty.link(measureUnits => {
      depthLabelsFeet.visible = measureUnits === 'english';
      depthLabelsMeters.visible = measureUnits !== 'english';
    });
    underPressureModel.isGridVisibleProperty.linkAttribute(this, 'visible');
  }
}
fluidPressureAndFlow.register('TrapezoidPoolGrid', TrapezoidPoolGrid);
export default TrapezoidPoolGrid;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJpbmdVdGlscyIsIlBoZXRGb250IiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJmbHVpZFByZXNzdXJlQW5kRmxvdyIsIkZsdWlkUHJlc3N1cmVBbmRGbG93U3RyaW5ncyIsIkdyaWRMaW5lc05vZGUiLCJmdFN0cmluZyIsImZ0IiwibVN0cmluZyIsIm0iLCJ2YWx1ZVdpdGhVbml0c1BhdHRlcm5TdHJpbmciLCJ2YWx1ZVdpdGhVbml0c1BhdHRlcm4iLCJUcmFwZXpvaWRQb29sR3JpZCIsImNvbnN0cnVjdG9yIiwidW5kZXJQcmVzc3VyZU1vZGVsIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwicG9vbExlZnRYIiwicG9vbFRvcFkiLCJwb29sUmlnaHRYIiwicG9vbEJvdHRvbVkiLCJwb29sSGVpZ2h0IiwibGFiZWxYUG9zaXRpb24iLCJzbGFudE11bHRpcGxpZXIiLCJmb250T3B0aW9ucyIsImZvbnQiLCJtYXhXaWR0aCIsImFkZENoaWxkIiwibWVhc3VyZVVuaXRzUHJvcGVydHkiLCJkZXB0aExhYmVsc01ldGVycyIsImRlcHRoTWV0ZXJzIiwibWV0ZXJzVGV4dCIsImZvcm1hdCIsIm1ldGVyc0xhYmVsUmVjdCIsIndpZHRoIiwiaGVpZ2h0IiwiZmlsbCIsImNlbnRlciIsImNlbnRlclgiLCJtb2RlbFRvVmlld1giLCJjZW50ZXJZIiwibW9kZWxUb1ZpZXdZIiwiZGVwdGhMYWJlbHNGZWV0IiwiZGVwdGhGZWV0IiwiZmVldFRleHQiLCJmZWV0TGFiZWxSZWN0IiwibW9kZWxUb1ZpZXdEZWx0YVgiLCJsaW5rIiwibWVhc3VyZVVuaXRzIiwidmlzaWJsZSIsImlzR3JpZFZpc2libGVQcm9wZXJ0eSIsImxpbmtBdHRyaWJ1dGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRyYXBlem9pZFBvb2xHcmlkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFZpZXcgZm9yIHRoZSBncmlkIGluIHRyYXBlem9pZCBhbmQgY2hhbWJlciBwb29scyB3aGljaCBzaG93cyBob3Jpem9udGFsIGxpbmVzIGFsb25nIHRoZSBwb29sIGluZGljYXRpbmcgdGhlIGRlcHRoLlxyXG4gKiBDYWxsb3V0cyBpbmRpY2F0aW5nIGRlcHRoIGFyZSBzaG93biBvbiB0aGUgbGluZXMgd2l0aCBhbiBvcHRpb24gKHNsYW50TXVsdGlwbGllcikgdG8gc2hvdyB0aGVtIGhvcml6b250YWxseSBkaXNwbGFjZWRcclxuICogY29tcGFyZWQgd2l0aCB0aGUgb25lcyBvbiB0aGUgYWJvdmUgYW5kIGJlbG93IGxpbmVzLiBTdXBwb3J0cyBib3RoIGVuZ2xpc2ggYW5kIG1ldHJpYyB1bml0cy5cclxuICpcclxuICogQGF1dGhvciBWYXNpbHkgU2hha2hvdiAoTWxlYXJuZXIpXHJcbiAqIEBhdXRob3IgU2lkZGhhcnRoYSBDaGludGhhcGFsbHkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcblxyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFJlY3RhbmdsZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBmbHVpZFByZXNzdXJlQW5kRmxvdyBmcm9tICcuLi8uLi9mbHVpZFByZXNzdXJlQW5kRmxvdy5qcyc7XHJcbmltcG9ydCBGbHVpZFByZXNzdXJlQW5kRmxvd1N0cmluZ3MgZnJvbSAnLi4vLi4vRmx1aWRQcmVzc3VyZUFuZEZsb3dTdHJpbmdzLmpzJztcclxuaW1wb3J0IEdyaWRMaW5lc05vZGUgZnJvbSAnLi9HcmlkTGluZXNOb2RlLmpzJztcclxuXHJcbmNvbnN0IGZ0U3RyaW5nID0gRmx1aWRQcmVzc3VyZUFuZEZsb3dTdHJpbmdzLmZ0O1xyXG5jb25zdCBtU3RyaW5nID0gRmx1aWRQcmVzc3VyZUFuZEZsb3dTdHJpbmdzLm07XHJcbmNvbnN0IHZhbHVlV2l0aFVuaXRzUGF0dGVyblN0cmluZyA9IEZsdWlkUHJlc3N1cmVBbmRGbG93U3RyaW5ncy52YWx1ZVdpdGhVbml0c1BhdHRlcm47XHJcblxyXG5jbGFzcyBUcmFwZXpvaWRQb29sR3JpZCBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VW5kZXJQcmVzc3VyZU1vZGVsfSB1bmRlclByZXNzdXJlTW9kZWxcclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTIgfSBtb2RlbFZpZXdUcmFuc2Zvcm0gdG8gY29udmVydCBiZXR3ZWVuIG1vZGVsIGFuZCB2aWV3IGNvLW9yZGluYXRlc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwb29sTGVmdFggaXMgcG9vbCBsZWZ0IHggY29vcmRpbmF0ZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwb29sVG9wWSBpcyBwb29sIHRvcCB5IGNvb3JkaW5hdGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcG9vbFJpZ2h0WCBpcyBwb29sIHJpZ2h0IHggY29vcmRpbmF0ZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwb29sQm90dG9tWSBpcyBwb29sIGJvdHRvbSB5IGNvb3JkaW5hdGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcG9vbEhlaWdodCBpcyBoZWlnaHQgb2YgdGhlIHBvb2xcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGFiZWxYUG9zaXRpb24gaXMgbGFiZWwgeCBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzbGFudE11bHRpcGxpZXIgaXMgdG8gbWFrZSBsYWJlbCBsaW5lIHVwIGluIHNwYWNlIGJldHdlZW4gdGhlIHBvb2xzXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHVuZGVyUHJlc3N1cmVNb2RlbCwgbW9kZWxWaWV3VHJhbnNmb3JtLCBwb29sTGVmdFgsIHBvb2xUb3BZLCBwb29sUmlnaHRYLCBwb29sQm90dG9tWSxcclxuICAgICAgICAgICAgICAgcG9vbEhlaWdodCwgbGFiZWxYUG9zaXRpb24sIHNsYW50TXVsdGlwbGllciApIHtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIGNvbnN0IGZvbnRPcHRpb25zID0geyBmb250OiBuZXcgUGhldEZvbnQoIDEyICksIG1heFdpZHRoOiAyMCB9O1xyXG5cclxuICAgIC8vIGFkZCBncmlkIGxpbmVcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBHcmlkTGluZXNOb2RlKCB1bmRlclByZXNzdXJlTW9kZWwubWVhc3VyZVVuaXRzUHJvcGVydHksIG1vZGVsVmlld1RyYW5zZm9ybSwgcG9vbExlZnRYLCBwb29sVG9wWSxcclxuICAgICAgcG9vbFJpZ2h0WCwgcG9vbEJvdHRvbVkgKSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgbGFiZWxzIGZvciBtZXRlcnNcclxuICAgIGNvbnN0IGRlcHRoTGFiZWxzTWV0ZXJzID0gbmV3IE5vZGUoKTtcclxuICAgIGZvciAoIGxldCBkZXB0aE1ldGVycyA9IDA7IGRlcHRoTWV0ZXJzIDw9IHBvb2xIZWlnaHQ7IGRlcHRoTWV0ZXJzKysgKSB7XHJcbiAgICAgIGNvbnN0IG1ldGVyc1RleHQgPSBuZXcgVGV4dCggU3RyaW5nVXRpbHMuZm9ybWF0KCB2YWx1ZVdpdGhVbml0c1BhdHRlcm5TdHJpbmcsIGRlcHRoTWV0ZXJzLCBtU3RyaW5nICksIGZvbnRPcHRpb25zICk7XHJcbiAgICAgIGNvbnN0IG1ldGVyc0xhYmVsUmVjdCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIG1ldGVyc1RleHQud2lkdGggKyA1LCBtZXRlcnNUZXh0LmhlaWdodCArIDUsIDEwLCAxMCxcclxuICAgICAgICB7IGZpbGw6ICcjNjdhMjU3JyB9ICk7XHJcbiAgICAgIG1ldGVyc1RleHQuY2VudGVyID0gbWV0ZXJzTGFiZWxSZWN0LmNlbnRlcjtcclxuICAgICAgbWV0ZXJzTGFiZWxSZWN0LmFkZENoaWxkKCBtZXRlcnNUZXh0ICk7XHJcbiAgICAgIG1ldGVyc0xhYmVsUmVjdC5jZW50ZXJYID0gbGFiZWxYUG9zaXRpb24gKyBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBkZXB0aE1ldGVycyAqIHNsYW50TXVsdGlwbGllciApO1xyXG4gICAgICBtZXRlcnNMYWJlbFJlY3QuY2VudGVyWSA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIC1kZXB0aE1ldGVycyApO1xyXG4gICAgICBkZXB0aExhYmVsc01ldGVycy5hZGRDaGlsZCggbWV0ZXJzTGFiZWxSZWN0ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIHRoZSBsYWJlbHMgZm9yIGZlZXQsIGFkanVzdCBmb3IgbG9vcCB0byBsaW1pdCBudW1iZXIgb2YgbGFiZWxzLlxyXG4gICAgY29uc3QgZGVwdGhMYWJlbHNGZWV0ID0gbmV3IE5vZGUoKTtcclxuICAgIGZvciAoIGxldCBkZXB0aEZlZXQgPSAwOyBkZXB0aEZlZXQgPD0gcG9vbEhlaWdodCAqIDMuMyArIDE7IGRlcHRoRmVldCArPSA1ICkge1xyXG4gICAgICBjb25zdCBmZWV0VGV4dCA9IG5ldyBUZXh0KCBTdHJpbmdVdGlscy5mb3JtYXQoIHZhbHVlV2l0aFVuaXRzUGF0dGVyblN0cmluZywgZGVwdGhGZWV0LCBmdFN0cmluZyApLCBmb250T3B0aW9ucyApO1xyXG4gICAgICBjb25zdCBmZWV0TGFiZWxSZWN0ID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgZmVldFRleHQud2lkdGggKyA1LCBmZWV0VGV4dC5oZWlnaHQgKyA1LCAxMCwgMTAsIHsgZmlsbDogJyM2N2EyNTcnIH0gKTtcclxuICAgICAgZmVldFRleHQuY2VudGVyID0gZmVldExhYmVsUmVjdC5jZW50ZXI7XHJcbiAgICAgIGZlZXRMYWJlbFJlY3QuYWRkQ2hpbGQoIGZlZXRUZXh0ICk7XHJcbiAgICAgIGZlZXRMYWJlbFJlY3QuY2VudGVyWCA9IGxhYmVsWFBvc2l0aW9uICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBkZXB0aEZlZXQgLyAzLjMgKiBzbGFudE11bHRpcGxpZXIgKTtcclxuICAgICAgZmVldExhYmVsUmVjdC5jZW50ZXJZID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggLWRlcHRoRmVldCAvIDMuMyApO1xyXG4gICAgICBkZXB0aExhYmVsc0ZlZXQuYWRkQ2hpbGQoIGZlZXRMYWJlbFJlY3QgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBkZXB0aExhYmVsc01ldGVycyApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZGVwdGhMYWJlbHNGZWV0ICk7XHJcblxyXG4gICAgdW5kZXJQcmVzc3VyZU1vZGVsLm1lYXN1cmVVbml0c1Byb3BlcnR5LmxpbmsoIG1lYXN1cmVVbml0cyA9PiB7XHJcbiAgICAgIGRlcHRoTGFiZWxzRmVldC52aXNpYmxlID0gKCBtZWFzdXJlVW5pdHMgPT09ICdlbmdsaXNoJyApO1xyXG4gICAgICBkZXB0aExhYmVsc01ldGVycy52aXNpYmxlID0gKCBtZWFzdXJlVW5pdHMgIT09ICdlbmdsaXNoJyApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHVuZGVyUHJlc3N1cmVNb2RlbC5pc0dyaWRWaXNpYmxlUHJvcGVydHkubGlua0F0dHJpYnV0ZSggdGhpcywgJ3Zpc2libGUnICk7XHJcbiAgfVxyXG59XHJcblxyXG5mbHVpZFByZXNzdXJlQW5kRmxvdy5yZWdpc3RlciggJ1RyYXBlem9pZFBvb2xHcmlkJywgVHJhcGV6b2lkUG9vbEdyaWQgKTtcclxuZXhwb3J0IGRlZmF1bHQgVHJhcGV6b2lkUG9vbEdyaWQ7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsT0FBT0MsUUFBUSxN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