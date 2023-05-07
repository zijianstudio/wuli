// Copyright 2017-2022, University of Colorado Boulder

/**
 * Panel that is responsible for adjusting the value of its corresponding mass.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import SunConstants from '../../../../sun/js/SunConstants.js';
import massesAndSprings from '../../massesAndSprings.js';
import MassesAndSpringsStrings from '../../MassesAndSpringsStrings.js';
import MassesAndSpringsConstants from '../MassesAndSpringsConstants.js';
const massString = MassesAndSpringsStrings.mass;
const massValueString = MassesAndSpringsStrings.massValue;
class MassValueControlPanel extends Panel {
  /**
   * @param {Mass} mass
   * @param {Node} massNodeIcon: icon that represents the mass to be adjusted
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(mass, massNodeIcon, tandem, options) {
    assert && assert(mass.adjustable === true, 'MassValueControlPanel should only adjust a mass that is adjustable.');
    options = merge({
      minWidth: MassesAndSpringsConstants.PANEL_MIN_WIDTH,
      cornerRadius: MassesAndSpringsConstants.PANEL_CORNER_RADIUS,
      fill: 'white',
      align: 'center',
      stroke: 'gray',
      yMargin: 6,
      xMargin: 6,
      tandem: tandem
    }, options);

    // range for mass in kg
    const range = new Range(50, 300);
    const massInGramsProperty = new DynamicProperty(new Property(mass.massProperty), {
      bidirectional: true,
      map: mass => mass * 1000,
      inverseMap: massInGrams => massInGrams / 1000
    });
    const trackSizeProperty = new Property(options.basics ? new Dimension2(132, 0.1) : new Dimension2(125, 0.1));
    const valuePattern = StringUtils.fillIn(massValueString, {
      mass: SunConstants.VALUE_NAMED_PLACEHOLDER
    }, {
      font: new PhetFont({
        size: 14,
        weight: 'bold'
      })
    });
    const numberControl = new NumberControl(massString, massInGramsProperty, range, {
      stroke: null,
      sliderIndent: 7,
      layoutFunction: NumberControl.createLayoutFunction4({
        verticalSpacing: 8,
        arrowButtonsXSpacing: 5,
        hasReadoutProperty: new Property(true)
      }),
      delta: 1,
      // subcomponent options
      numberDisplayOptions: {
        valuePattern: valuePattern,
        textOptions: {
          font: new PhetFont(14)
        },
        maxWidth: 100,
        useRichText: true,
        decimalPlaces: 0
      },
      titleNodeOptions: {
        font: new PhetFont({
          size: 16,
          weight: 'bold'
        }),
        maxWidth: 45
      },
      sliderOptions: {
        majorTickLength: 10,
        thumbSize: new Dimension2(13, 24),
        thumbFill: '#00C4DF',
        thumbFillHighlighted: MassesAndSpringsConstants.THUMB_HIGHLIGHT,
        thumbTouchAreaXDilation: 6,
        constrainValue: value => Utils.roundSymmetric(value / 10) * 10,
        majorTicks: [{
          value: range.min,
          label: new Text(String(range.min), {
            font: new PhetFont(14)
          })
        }, {
          value: range.max,
          label: new Text(String(range.max), {
            font: new PhetFont(14)
          })
        }],
        trackSize: trackSizeProperty.value
      },
      arrowButtonOptions: {
        scale: 0.5,
        touchAreaXDilation: 16,
        touchAreaYDilation: 26
      }
    });
    const contentNode = new Node({
      children: [numberControl, massNodeIcon]
    });
    super(contentNode, options);
    massNodeIcon.leftTop = numberControl.leftTop.plus(new Vector2(45, -2));
    massNodeIcon.pickable = false;
  }
}
massesAndSprings.register('MassValueControlPanel', MassValueControlPanel);
export default MassValueControlPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEeW5hbWljUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJSYW5nZSIsIlV0aWxzIiwiVmVjdG9yMiIsIm1lcmdlIiwiU3RyaW5nVXRpbHMiLCJOdW1iZXJDb250cm9sIiwiUGhldEZvbnQiLCJOb2RlIiwiVGV4dCIsIlBhbmVsIiwiU3VuQ29uc3RhbnRzIiwibWFzc2VzQW5kU3ByaW5ncyIsIk1hc3Nlc0FuZFNwcmluZ3NTdHJpbmdzIiwiTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cyIsIm1hc3NTdHJpbmciLCJtYXNzIiwibWFzc1ZhbHVlU3RyaW5nIiwibWFzc1ZhbHVlIiwiTWFzc1ZhbHVlQ29udHJvbFBhbmVsIiwiY29uc3RydWN0b3IiLCJtYXNzTm9kZUljb24iLCJ0YW5kZW0iLCJvcHRpb25zIiwiYXNzZXJ0IiwiYWRqdXN0YWJsZSIsIm1pbldpZHRoIiwiUEFORUxfTUlOX1dJRFRIIiwiY29ybmVyUmFkaXVzIiwiUEFORUxfQ09STkVSX1JBRElVUyIsImZpbGwiLCJhbGlnbiIsInN0cm9rZSIsInlNYXJnaW4iLCJ4TWFyZ2luIiwicmFuZ2UiLCJtYXNzSW5HcmFtc1Byb3BlcnR5IiwibWFzc1Byb3BlcnR5IiwiYmlkaXJlY3Rpb25hbCIsIm1hcCIsImludmVyc2VNYXAiLCJtYXNzSW5HcmFtcyIsInRyYWNrU2l6ZVByb3BlcnR5IiwiYmFzaWNzIiwidmFsdWVQYXR0ZXJuIiwiZmlsbEluIiwiVkFMVUVfTkFNRURfUExBQ0VIT0xERVIiLCJmb250Iiwic2l6ZSIsIndlaWdodCIsIm51bWJlckNvbnRyb2wiLCJzbGlkZXJJbmRlbnQiLCJsYXlvdXRGdW5jdGlvbiIsImNyZWF0ZUxheW91dEZ1bmN0aW9uNCIsInZlcnRpY2FsU3BhY2luZyIsImFycm93QnV0dG9uc1hTcGFjaW5nIiwiaGFzUmVhZG91dFByb3BlcnR5IiwiZGVsdGEiLCJudW1iZXJEaXNwbGF5T3B0aW9ucyIsInRleHRPcHRpb25zIiwibWF4V2lkdGgiLCJ1c2VSaWNoVGV4dCIsImRlY2ltYWxQbGFjZXMiLCJ0aXRsZU5vZGVPcHRpb25zIiwic2xpZGVyT3B0aW9ucyIsIm1ham9yVGlja0xlbmd0aCIsInRodW1iU2l6ZSIsInRodW1iRmlsbCIsInRodW1iRmlsbEhpZ2hsaWdodGVkIiwiVEhVTUJfSElHSExJR0hUIiwidGh1bWJUb3VjaEFyZWFYRGlsYXRpb24iLCJjb25zdHJhaW5WYWx1ZSIsInZhbHVlIiwicm91bmRTeW1tZXRyaWMiLCJtYWpvclRpY2tzIiwibWluIiwibGFiZWwiLCJTdHJpbmciLCJtYXgiLCJ0cmFja1NpemUiLCJhcnJvd0J1dHRvbk9wdGlvbnMiLCJzY2FsZSIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsImNvbnRlbnROb2RlIiwiY2hpbGRyZW4iLCJsZWZ0VG9wIiwicGx1cyIsInBpY2thYmxlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNYXNzVmFsdWVDb250cm9sUGFuZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUGFuZWwgdGhhdCBpcyByZXNwb25zaWJsZSBmb3IgYWRqdXN0aW5nIHRoZSB2YWx1ZSBvZiBpdHMgY29ycmVzcG9uZGluZyBtYXNzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIERlbnplbGwgQmFybmV0dCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgRHluYW1pY1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRHluYW1pY1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBOdW1iZXJDb250cm9sIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9OdW1iZXJDb250cm9sLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IFN1bkNvbnN0YW50cyBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvU3VuQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IG1hc3Nlc0FuZFNwcmluZ3MgZnJvbSAnLi4vLi4vbWFzc2VzQW5kU3ByaW5ncy5qcyc7XHJcbmltcG9ydCBNYXNzZXNBbmRTcHJpbmdzU3RyaW5ncyBmcm9tICcuLi8uLi9NYXNzZXNBbmRTcHJpbmdzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzIGZyb20gJy4uL01hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuanMnO1xyXG5cclxuY29uc3QgbWFzc1N0cmluZyA9IE1hc3Nlc0FuZFNwcmluZ3NTdHJpbmdzLm1hc3M7XHJcbmNvbnN0IG1hc3NWYWx1ZVN0cmluZyA9IE1hc3Nlc0FuZFNwcmluZ3NTdHJpbmdzLm1hc3NWYWx1ZTtcclxuXHJcbmNsYXNzIE1hc3NWYWx1ZUNvbnRyb2xQYW5lbCBleHRlbmRzIFBhbmVsIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNYXNzfSBtYXNzXHJcbiAgICogQHBhcmFtIHtOb2RlfSBtYXNzTm9kZUljb246IGljb24gdGhhdCByZXByZXNlbnRzIHRoZSBtYXNzIHRvIGJlIGFkanVzdGVkXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbWFzcywgbWFzc05vZGVJY29uLCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXNzLmFkanVzdGFibGUgPT09IHRydWUsICdNYXNzVmFsdWVDb250cm9sUGFuZWwgc2hvdWxkIG9ubHkgYWRqdXN0IGEgbWFzcyB0aGF0IGlzIGFkanVzdGFibGUuJyApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBtaW5XaWR0aDogTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5QQU5FTF9NSU5fV0lEVEgsXHJcbiAgICAgIGNvcm5lclJhZGl1czogTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5QQU5FTF9DT1JORVJfUkFESVVTLFxyXG4gICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgIHN0cm9rZTogJ2dyYXknLFxyXG4gICAgICB5TWFyZ2luOiA2LFxyXG4gICAgICB4TWFyZ2luOiA2LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHJhbmdlIGZvciBtYXNzIGluIGtnXHJcbiAgICBjb25zdCByYW5nZSA9IG5ldyBSYW5nZSggNTAsIDMwMCApO1xyXG5cclxuICAgIGNvbnN0IG1hc3NJbkdyYW1zUHJvcGVydHkgPSBuZXcgRHluYW1pY1Byb3BlcnR5KCBuZXcgUHJvcGVydHkoIG1hc3MubWFzc1Byb3BlcnR5ICksIHtcclxuICAgICAgYmlkaXJlY3Rpb25hbDogdHJ1ZSxcclxuICAgICAgbWFwOiBtYXNzID0+IG1hc3MgKiAxMDAwLFxyXG4gICAgICBpbnZlcnNlTWFwOiBtYXNzSW5HcmFtcyA9PiBtYXNzSW5HcmFtcyAvIDEwMDBcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCB0cmFja1NpemVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggb3B0aW9ucy5iYXNpY3MgPyBuZXcgRGltZW5zaW9uMiggMTMyLCAwLjEgKSA6IG5ldyBEaW1lbnNpb24yKCAxMjUsIDAuMSApICk7XHJcbiAgICBjb25zdCB2YWx1ZVBhdHRlcm4gPSBTdHJpbmdVdGlscy5maWxsSW4oIG1hc3NWYWx1ZVN0cmluZywgeyBtYXNzOiBTdW5Db25zdGFudHMuVkFMVUVfTkFNRURfUExBQ0VIT0xERVIgfSwge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTQsIHdlaWdodDogJ2JvbGQnIH0gKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgbnVtYmVyQ29udHJvbCA9IG5ldyBOdW1iZXJDb250cm9sKCBtYXNzU3RyaW5nLCBtYXNzSW5HcmFtc1Byb3BlcnR5LCByYW5nZSwge1xyXG4gICAgICBzdHJva2U6IG51bGwsXHJcbiAgICAgIHNsaWRlckluZGVudDogNyxcclxuICAgICAgbGF5b3V0RnVuY3Rpb246IE51bWJlckNvbnRyb2wuY3JlYXRlTGF5b3V0RnVuY3Rpb240KCB7XHJcbiAgICAgICAgdmVydGljYWxTcGFjaW5nOiA4LFxyXG4gICAgICAgIGFycm93QnV0dG9uc1hTcGFjaW5nOiA1LFxyXG4gICAgICAgIGhhc1JlYWRvdXRQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCB0cnVlIClcclxuICAgICAgfSApLFxyXG4gICAgICBkZWx0YTogMSxcclxuXHJcbiAgICAgIC8vIHN1YmNvbXBvbmVudCBvcHRpb25zXHJcbiAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcbiAgICAgICAgdmFsdWVQYXR0ZXJuOiB2YWx1ZVBhdHRlcm4sXHJcbiAgICAgICAgdGV4dE9wdGlvbnM6IHtcclxuICAgICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTQgKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWF4V2lkdGg6IDEwMCxcclxuICAgICAgICB1c2VSaWNoVGV4dDogdHJ1ZSxcclxuICAgICAgICBkZWNpbWFsUGxhY2VzOiAwXHJcbiAgICAgIH0sXHJcbiAgICAgIHRpdGxlTm9kZU9wdGlvbnM6IHtcclxuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTYsIHdlaWdodDogJ2JvbGQnIH0gKSxcclxuICAgICAgICBtYXhXaWR0aDogNDVcclxuICAgICAgfSxcclxuICAgICAgc2xpZGVyT3B0aW9uczoge1xyXG4gICAgICAgIG1ham9yVGlja0xlbmd0aDogMTAsXHJcbiAgICAgICAgdGh1bWJTaXplOiBuZXcgRGltZW5zaW9uMiggMTMsIDI0ICksXHJcbiAgICAgICAgdGh1bWJGaWxsOiAnIzAwQzRERicsXHJcbiAgICAgICAgdGh1bWJGaWxsSGlnaGxpZ2h0ZWQ6IE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuVEhVTUJfSElHSExJR0hULFxyXG4gICAgICAgIHRodW1iVG91Y2hBcmVhWERpbGF0aW9uOiA2LFxyXG4gICAgICAgIGNvbnN0cmFpblZhbHVlOiB2YWx1ZSA9PiBVdGlscy5yb3VuZFN5bW1ldHJpYyggdmFsdWUgLyAxMCApICogMTAsXHJcbiAgICAgICAgbWFqb3JUaWNrczogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB2YWx1ZTogcmFuZ2UubWluLFxyXG4gICAgICAgICAgICBsYWJlbDogbmV3IFRleHQoIFN0cmluZyggcmFuZ2UubWluICksIHsgZm9udDogbmV3IFBoZXRGb250KCAxNCApIH0gKVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdmFsdWU6IHJhbmdlLm1heCxcclxuICAgICAgICAgICAgbGFiZWw6IG5ldyBUZXh0KCBTdHJpbmcoIHJhbmdlLm1heCApLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMTQgKSB9IClcclxuICAgICAgICAgIH1cclxuICAgICAgICBdLFxyXG4gICAgICAgIHRyYWNrU2l6ZTogdHJhY2tTaXplUHJvcGVydHkudmFsdWVcclxuICAgICAgfSxcclxuICAgICAgYXJyb3dCdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgc2NhbGU6IDAuNSxcclxuICAgICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDE2LFxyXG4gICAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogMjZcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgY29udGVudE5vZGUgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBudW1iZXJDb250cm9sLCBtYXNzTm9kZUljb24gXSB9ICk7XHJcblxyXG4gICAgc3VwZXIoIGNvbnRlbnROb2RlLCBvcHRpb25zICk7XHJcblxyXG4gICAgbWFzc05vZGVJY29uLmxlZnRUb3AgPSBudW1iZXJDb250cm9sLmxlZnRUb3AucGx1cyggbmV3IFZlY3RvcjIoIDQ1LCAtMiApICk7XHJcbiAgICBtYXNzTm9kZUljb24ucGlja2FibGUgPSBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbm1hc3Nlc0FuZFNwcmluZ3MucmVnaXN0ZXIoICdNYXNzVmFsdWVDb250cm9sUGFuZWwnLCBNYXNzVmFsdWVDb250cm9sUGFuZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgTWFzc1ZhbHVlQ29udHJvbFBhbmVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLEtB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