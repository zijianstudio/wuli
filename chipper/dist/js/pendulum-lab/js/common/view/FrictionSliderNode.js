// Copyright 2014-2022, University of Colorado Boulder

/**
 * Friction slider node in 'Pendulum lab' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import pendulumLab from '../../pendulumLab.js';
import PendulumLabStrings from '../../PendulumLabStrings.js';
import PendulumLabConstants from '../PendulumLabConstants.js';
import PendulumNumberControl from './PendulumNumberControl.js';
const frictionString = PendulumLabStrings.friction;
const lotsString = PendulumLabStrings.lots;
const noneString = PendulumLabStrings.none;

/**
 * Converts the numerical value of the slider to friction, does not assign to friction property
 * @private
 *
 * @param {number} sliderValue
 * @returns {number}
 */
function sliderValueToFriction(sliderValue) {
  return 0.0005 * (Math.pow(2, sliderValue) - 1);
}

/**
 * Converts the numerical value of the friction to a slider value, does not assign to slider property
 * @private
 *
 * @param {number}friction
 * @returns {number}
 */
function frictionToSliderValue(friction) {
  return Utils.roundSymmetric(Math.log(friction / 0.0005 + 1) / Math.LN2);
}
class FrictionSliderNode extends Node {
  /**
   * @param {Property.<number>} frictionProperty - Property to update by slider.
   * @param {Range} frictionRange - Possible range of frictionProperty value.
   * @param {Object} [options]
   */
  constructor(frictionProperty, frictionRange, options) {
    const sliderValueProperty = new DynamicProperty(new Property(frictionProperty), {
      bidirectional: true,
      map: frictionToSliderValue,
      inverseMap: sliderValueToFriction
    });

    // range the slider can have
    const sliderValueRange = new Range(frictionToSliderValue(frictionRange.min), frictionToSliderValue(frictionRange.max));

    //TODO #210 replace '{0}' with SunConstants.VALUE_NAMED_PLACEHOLDER
    const numberControl = new PendulumNumberControl(frictionString, sliderValueProperty, sliderValueRange, '{0}', 'rgb(50,145,184)', {
      hasReadoutProperty: new BooleanProperty(false),
      includeArrowButtons: false,
      sliderPadding: 14,
      sliderOptions: {
        thumbFill: '#00C4DF',
        thumbFillHighlighted: '#71EDFF',
        minorTickLength: 5,
        majorTickLength: 10,
        constrainValue: value => Utils.roundSymmetric(value),
        majorTicks: [{
          value: sliderValueRange.min,
          label: new Text(noneString, {
            font: PendulumLabConstants.TICK_FONT,
            maxWidth: 50
          })
        }, {
          value: sliderValueRange.getCenter(),
          label: null
        }, {
          value: sliderValueRange.max,
          label: new Text(lotsString, {
            font: PendulumLabConstants.TICK_FONT,
            maxWidth: 50
          })
        }],
        minorTickSpacing: sliderValueRange.getLength() / 10
      }
    });

    // describes the panel box containing the friction slider
    super(merge({
      children: [numberControl]
    }, options));
  }
}
pendulumLab.register('FrictionSliderNode', FrictionSliderNode);
export default FrictionSliderNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEeW5hbWljUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlJhbmdlIiwiVXRpbHMiLCJtZXJnZSIsIk5vZGUiLCJUZXh0IiwicGVuZHVsdW1MYWIiLCJQZW5kdWx1bUxhYlN0cmluZ3MiLCJQZW5kdWx1bUxhYkNvbnN0YW50cyIsIlBlbmR1bHVtTnVtYmVyQ29udHJvbCIsImZyaWN0aW9uU3RyaW5nIiwiZnJpY3Rpb24iLCJsb3RzU3RyaW5nIiwibG90cyIsIm5vbmVTdHJpbmciLCJub25lIiwic2xpZGVyVmFsdWVUb0ZyaWN0aW9uIiwic2xpZGVyVmFsdWUiLCJNYXRoIiwicG93IiwiZnJpY3Rpb25Ub1NsaWRlclZhbHVlIiwicm91bmRTeW1tZXRyaWMiLCJsb2ciLCJMTjIiLCJGcmljdGlvblNsaWRlck5vZGUiLCJjb25zdHJ1Y3RvciIsImZyaWN0aW9uUHJvcGVydHkiLCJmcmljdGlvblJhbmdlIiwib3B0aW9ucyIsInNsaWRlclZhbHVlUHJvcGVydHkiLCJiaWRpcmVjdGlvbmFsIiwibWFwIiwiaW52ZXJzZU1hcCIsInNsaWRlclZhbHVlUmFuZ2UiLCJtaW4iLCJtYXgiLCJudW1iZXJDb250cm9sIiwiaGFzUmVhZG91dFByb3BlcnR5IiwiaW5jbHVkZUFycm93QnV0dG9ucyIsInNsaWRlclBhZGRpbmciLCJzbGlkZXJPcHRpb25zIiwidGh1bWJGaWxsIiwidGh1bWJGaWxsSGlnaGxpZ2h0ZWQiLCJtaW5vclRpY2tMZW5ndGgiLCJtYWpvclRpY2tMZW5ndGgiLCJjb25zdHJhaW5WYWx1ZSIsInZhbHVlIiwibWFqb3JUaWNrcyIsImxhYmVsIiwiZm9udCIsIlRJQ0tfRk9OVCIsIm1heFdpZHRoIiwiZ2V0Q2VudGVyIiwibWlub3JUaWNrU3BhY2luZyIsImdldExlbmd0aCIsImNoaWxkcmVuIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGcmljdGlvblNsaWRlck5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRnJpY3Rpb24gc2xpZGVyIG5vZGUgaW4gJ1BlbmR1bHVtIGxhYicgc2ltdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBBbmRyZXkgWmVsZW5rb3YgKE1sZWFybmVyKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRHluYW1pY1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRHluYW1pY1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHBlbmR1bHVtTGFiIGZyb20gJy4uLy4uL3BlbmR1bHVtTGFiLmpzJztcclxuaW1wb3J0IFBlbmR1bHVtTGFiU3RyaW5ncyBmcm9tICcuLi8uLi9QZW5kdWx1bUxhYlN0cmluZ3MuanMnO1xyXG5pbXBvcnQgUGVuZHVsdW1MYWJDb25zdGFudHMgZnJvbSAnLi4vUGVuZHVsdW1MYWJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgUGVuZHVsdW1OdW1iZXJDb250cm9sIGZyb20gJy4vUGVuZHVsdW1OdW1iZXJDb250cm9sLmpzJztcclxuXHJcbmNvbnN0IGZyaWN0aW9uU3RyaW5nID0gUGVuZHVsdW1MYWJTdHJpbmdzLmZyaWN0aW9uO1xyXG5jb25zdCBsb3RzU3RyaW5nID0gUGVuZHVsdW1MYWJTdHJpbmdzLmxvdHM7XHJcbmNvbnN0IG5vbmVTdHJpbmcgPSBQZW5kdWx1bUxhYlN0cmluZ3Mubm9uZTtcclxuXHJcbi8qKlxyXG4gKiBDb252ZXJ0cyB0aGUgbnVtZXJpY2FsIHZhbHVlIG9mIHRoZSBzbGlkZXIgdG8gZnJpY3Rpb24sIGRvZXMgbm90IGFzc2lnbiB0byBmcmljdGlvbiBwcm9wZXJ0eVxyXG4gKiBAcHJpdmF0ZVxyXG4gKlxyXG4gKiBAcGFyYW0ge251bWJlcn0gc2xpZGVyVmFsdWVcclxuICogQHJldHVybnMge251bWJlcn1cclxuICovXHJcbmZ1bmN0aW9uIHNsaWRlclZhbHVlVG9GcmljdGlvbiggc2xpZGVyVmFsdWUgKSB7XHJcbiAgcmV0dXJuIDAuMDAwNSAqICggTWF0aC5wb3coIDIsIHNsaWRlclZhbHVlICkgLSAxICk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb252ZXJ0cyB0aGUgbnVtZXJpY2FsIHZhbHVlIG9mIHRoZSBmcmljdGlvbiB0byBhIHNsaWRlciB2YWx1ZSwgZG9lcyBub3QgYXNzaWduIHRvIHNsaWRlciBwcm9wZXJ0eVxyXG4gKiBAcHJpdmF0ZVxyXG4gKlxyXG4gKiBAcGFyYW0ge251bWJlcn1mcmljdGlvblxyXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gKi9cclxuZnVuY3Rpb24gZnJpY3Rpb25Ub1NsaWRlclZhbHVlKCBmcmljdGlvbiApIHtcclxuICByZXR1cm4gVXRpbHMucm91bmRTeW1tZXRyaWMoIE1hdGgubG9nKCBmcmljdGlvbiAvIDAuMDAwNSArIDEgKSAvIE1hdGguTE4yICk7XHJcbn1cclxuXHJcbmNsYXNzIEZyaWN0aW9uU2xpZGVyTm9kZSBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IGZyaWN0aW9uUHJvcGVydHkgLSBQcm9wZXJ0eSB0byB1cGRhdGUgYnkgc2xpZGVyLlxyXG4gICAqIEBwYXJhbSB7UmFuZ2V9IGZyaWN0aW9uUmFuZ2UgLSBQb3NzaWJsZSByYW5nZSBvZiBmcmljdGlvblByb3BlcnR5IHZhbHVlLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZnJpY3Rpb25Qcm9wZXJ0eSwgZnJpY3Rpb25SYW5nZSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBzbGlkZXJWYWx1ZVByb3BlcnR5ID0gbmV3IER5bmFtaWNQcm9wZXJ0eSggbmV3IFByb3BlcnR5KCBmcmljdGlvblByb3BlcnR5ICksIHtcclxuICAgICAgYmlkaXJlY3Rpb25hbDogdHJ1ZSxcclxuICAgICAgbWFwOiBmcmljdGlvblRvU2xpZGVyVmFsdWUsXHJcbiAgICAgIGludmVyc2VNYXA6IHNsaWRlclZhbHVlVG9GcmljdGlvblxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHJhbmdlIHRoZSBzbGlkZXIgY2FuIGhhdmVcclxuICAgIGNvbnN0IHNsaWRlclZhbHVlUmFuZ2UgPSBuZXcgUmFuZ2UoIGZyaWN0aW9uVG9TbGlkZXJWYWx1ZSggZnJpY3Rpb25SYW5nZS5taW4gKSwgZnJpY3Rpb25Ub1NsaWRlclZhbHVlKCBmcmljdGlvblJhbmdlLm1heCApICk7XHJcblxyXG4gICAgLy9UT0RPICMyMTAgcmVwbGFjZSAnezB9JyB3aXRoIFN1bkNvbnN0YW50cy5WQUxVRV9OQU1FRF9QTEFDRUhPTERFUlxyXG4gICAgY29uc3QgbnVtYmVyQ29udHJvbCA9IG5ldyBQZW5kdWx1bU51bWJlckNvbnRyb2woIGZyaWN0aW9uU3RyaW5nLCBzbGlkZXJWYWx1ZVByb3BlcnR5LCBzbGlkZXJWYWx1ZVJhbmdlLCAnezB9JywgJ3JnYig1MCwxNDUsMTg0KScsIHtcclxuICAgICAgaGFzUmVhZG91dFByb3BlcnR5OiBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApLFxyXG4gICAgICBpbmNsdWRlQXJyb3dCdXR0b25zOiBmYWxzZSxcclxuICAgICAgc2xpZGVyUGFkZGluZzogMTQsXHJcbiAgICAgIHNsaWRlck9wdGlvbnM6IHtcclxuICAgICAgICB0aHVtYkZpbGw6ICcjMDBDNERGJyxcclxuICAgICAgICB0aHVtYkZpbGxIaWdobGlnaHRlZDogJyM3MUVERkYnLFxyXG4gICAgICAgIG1pbm9yVGlja0xlbmd0aDogNSxcclxuICAgICAgICBtYWpvclRpY2tMZW5ndGg6IDEwLFxyXG4gICAgICAgIGNvbnN0cmFpblZhbHVlOiB2YWx1ZSA9PiBVdGlscy5yb3VuZFN5bW1ldHJpYyggdmFsdWUgKSxcclxuXHJcbiAgICAgICAgbWFqb3JUaWNrczogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB2YWx1ZTogc2xpZGVyVmFsdWVSYW5nZS5taW4sXHJcbiAgICAgICAgICAgIGxhYmVsOiBuZXcgVGV4dCggbm9uZVN0cmluZywgeyBmb250OiBQZW5kdWx1bUxhYkNvbnN0YW50cy5USUNLX0ZPTlQsIG1heFdpZHRoOiA1MCB9IClcclxuICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgdmFsdWU6IHNsaWRlclZhbHVlUmFuZ2UuZ2V0Q2VudGVyKCksXHJcbiAgICAgICAgICAgIGxhYmVsOiBudWxsXHJcbiAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIHZhbHVlOiBzbGlkZXJWYWx1ZVJhbmdlLm1heCxcclxuICAgICAgICAgICAgbGFiZWw6IG5ldyBUZXh0KCBsb3RzU3RyaW5nLCB7IGZvbnQ6IFBlbmR1bHVtTGFiQ29uc3RhbnRzLlRJQ0tfRk9OVCwgbWF4V2lkdGg6IDUwIH0gKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF0sXHJcblxyXG4gICAgICAgIG1pbm9yVGlja1NwYWNpbmc6IHNsaWRlclZhbHVlUmFuZ2UuZ2V0TGVuZ3RoKCkgLyAxMFxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gZGVzY3JpYmVzIHRoZSBwYW5lbCBib3ggY29udGFpbmluZyB0aGUgZnJpY3Rpb24gc2xpZGVyXHJcbiAgICBzdXBlciggbWVyZ2UoIHtcclxuICAgICAgY2hpbGRyZW46IFsgbnVtYmVyQ29udHJvbCBdXHJcbiAgICB9LCBvcHRpb25zICkgKTtcclxuICB9XHJcbn1cclxuXHJcbnBlbmR1bHVtTGFiLnJlZ2lzdGVyKCAnRnJpY3Rpb25TbGlkZXJOb2RlJywgRnJpY3Rpb25TbGlkZXJOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBGcmljdGlvblNsaWRlck5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM5RCxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUM1RCxPQUFPQyxvQkFBb0IsTUFBTSw0QkFBNEI7QUFDN0QsT0FBT0MscUJBQXFCLE1BQU0sNEJBQTRCO0FBRTlELE1BQU1DLGNBQWMsR0FBR0gsa0JBQWtCLENBQUNJLFFBQVE7QUFDbEQsTUFBTUMsVUFBVSxHQUFHTCxrQkFBa0IsQ0FBQ00sSUFBSTtBQUMxQyxNQUFNQyxVQUFVLEdBQUdQLGtCQUFrQixDQUFDUSxJQUFJOztBQUUxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNDLHFCQUFxQkEsQ0FBRUMsV0FBVyxFQUFHO0VBQzVDLE9BQU8sTUFBTSxJQUFLQyxJQUFJLENBQUNDLEdBQUcsQ0FBRSxDQUFDLEVBQUVGLFdBQVksQ0FBQyxHQUFHLENBQUMsQ0FBRTtBQUNwRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNHLHFCQUFx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