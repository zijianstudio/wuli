// Copyright 2022, University of Colorado Boulder

/**
 * Demo for GaugeNode
 */

import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import { VBox } from '../../../../scenery/js/imports.js';
import GaugeNode from '../../GaugeNode.js';
import NumberControl from '../../NumberControl.js';
export default function demoGaugeNode(layoutBounds) {
  const valueProperty = new Property(0);
  const gaugeValueRange = new Range(-100, 100);
  const sliderValueRange = new Range(gaugeValueRange.min - 20, gaugeValueRange.max + 20);
  const gaugeNode = new GaugeNode(valueProperty, new Property('GaugeNode'), gaugeValueRange);
  return new VBox({
    spacing: 15,
    children: [gaugeNode, NumberControl.withMinMaxTicks('Value:', valueProperty, sliderValueRange)],
    center: layoutBounds.center
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlJhbmdlIiwiVkJveCIsIkdhdWdlTm9kZSIsIk51bWJlckNvbnRyb2wiLCJkZW1vR2F1Z2VOb2RlIiwibGF5b3V0Qm91bmRzIiwidmFsdWVQcm9wZXJ0eSIsImdhdWdlVmFsdWVSYW5nZSIsInNsaWRlclZhbHVlUmFuZ2UiLCJtaW4iLCJtYXgiLCJnYXVnZU5vZGUiLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJ3aXRoTWluTWF4VGlja3MiLCJjZW50ZXIiXSwic291cmNlcyI6WyJkZW1vR2F1Z2VOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEZW1vIGZvciBHYXVnZU5vZGVcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgR2F1Z2VOb2RlIGZyb20gJy4uLy4uL0dhdWdlTm9kZS5qcyc7XHJcbmltcG9ydCBOdW1iZXJDb250cm9sIGZyb20gJy4uLy4uL051bWJlckNvbnRyb2wuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb0dhdWdlTm9kZSggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICk6IE5vZGUge1xyXG5cclxuICBjb25zdCB2YWx1ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAwICk7XHJcbiAgY29uc3QgZ2F1Z2VWYWx1ZVJhbmdlID0gbmV3IFJhbmdlKCAtMTAwLCAxMDAgKTtcclxuICBjb25zdCBzbGlkZXJWYWx1ZVJhbmdlID0gbmV3IFJhbmdlKCBnYXVnZVZhbHVlUmFuZ2UubWluIC0gMjAsIGdhdWdlVmFsdWVSYW5nZS5tYXggKyAyMCApO1xyXG5cclxuICBjb25zdCBnYXVnZU5vZGUgPSBuZXcgR2F1Z2VOb2RlKCB2YWx1ZVByb3BlcnR5LCBuZXcgUHJvcGVydHkoICdHYXVnZU5vZGUnICksIGdhdWdlVmFsdWVSYW5nZSApO1xyXG5cclxuICByZXR1cm4gbmV3IFZCb3goIHtcclxuICAgIHNwYWNpbmc6IDE1LFxyXG4gICAgY2hpbGRyZW46IFtcclxuICAgICAgZ2F1Z2VOb2RlLFxyXG4gICAgICBOdW1iZXJDb250cm9sLndpdGhNaW5NYXhUaWNrcyggJ1ZhbHVlOicsIHZhbHVlUHJvcGVydHksIHNsaWRlclZhbHVlUmFuZ2UgKVxyXG4gICAgXSxcclxuICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxyXG4gIH0gKTtcclxufSJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxpQ0FBaUM7QUFFdEQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxTQUFlQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzlELE9BQU9DLFNBQVMsTUFBTSxvQkFBb0I7QUFDMUMsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUVsRCxlQUFlLFNBQVNDLGFBQWFBLENBQUVDLFlBQXFCLEVBQVM7RUFFbkUsTUFBTUMsYUFBYSxHQUFHLElBQUlQLFFBQVEsQ0FBRSxDQUFFLENBQUM7RUFDdkMsTUFBTVEsZUFBZSxHQUFHLElBQUlQLEtBQUssQ0FBRSxDQUFDLEdBQUcsRUFBRSxHQUFJLENBQUM7RUFDOUMsTUFBTVEsZ0JBQWdCLEdBQUcsSUFBSVIsS0FBSyxDQUFFTyxlQUFlLENBQUNFLEdBQUcsR0FBRyxFQUFFLEVBQUVGLGVBQWUsQ0FBQ0csR0FBRyxHQUFHLEVBQUcsQ0FBQztFQUV4RixNQUFNQyxTQUFTLEdBQUcsSUFBSVQsU0FBUyxDQUFFSSxhQUFhLEVBQUUsSUFBSVAsUUFBUSxDQUFFLFdBQVksQ0FBQyxFQUFFUSxlQUFnQixDQUFDO0VBRTlGLE9BQU8sSUFBSU4sSUFBSSxDQUFFO0lBQ2ZXLE9BQU8sRUFBRSxFQUFFO0lBQ1hDLFFBQVEsRUFBRSxDQUNSRixTQUFTLEVBQ1RSLGFBQWEsQ0FBQ1csZUFBZSxDQUFFLFFBQVEsRUFBRVIsYUFBYSxFQUFFRSxnQkFBaUIsQ0FBQyxDQUMzRTtJQUNETyxNQUFNLEVBQUVWLFlBQVksQ0FBQ1U7RUFDdkIsQ0FBRSxDQUFDO0FBQ0wifQ==