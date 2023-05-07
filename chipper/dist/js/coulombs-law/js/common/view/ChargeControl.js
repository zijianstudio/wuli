// Copyright 2017-2021, University of Colorado Boulder

/**
 * Arrow buttons, slider and text box for editing the object value amount.
 *
 * @author  Jesse Greenberg
 * @author  Michael Barlow
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import ISLCObjectControlPanel from '../../../../inverse-square-law-common/js/view/ISLCObjectControlPanel.js';
import merge from '../../../../phet-core/js/merge.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Slider from '../../../../sun/js/Slider.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import coulombsLaw from '../../coulombsLaw.js';
import ChargeControlSliderThumb from './ChargeControlSliderThumb.js';

// constants
const TRACK_SIZE = new Dimension2(132, 0.25);
class ChargeControl extends ISLCObjectControlPanel {
  /**
   * @param {string} titleString
   * @param {string} unitString - for the NumberControl readout
   * @param {Property.<number>} objectProperty - the number Property associated with the ISLCObject
   * @param {Range} valueRange - max and min values for the object Property, used for display and as NumberControl argument
   * @param {number} scaleFactor - multiplicative constant for getting proper readouts/positions on Macro and Atomic screens
   * @param {Object} [options]
   */
  constructor(titleString, unitString, objectProperty, valueRange, scaleFactor, options) {
    options = merge({
      // panel options
      align: 'center',
      additionalTicks: [{
        value: 0
      }],
      numberControlOptions: {
        sliderOptions: {
          trackSize: TRACK_SIZE,
          // Instead of having a LinkedProperty to this.chargeControlProperty, link directly to the model Property.
          phetioLinkedProperty: objectProperty
        },
        titleNodeOptions: {
          font: new PhetFont(16)
        },
        numberDisplayOptions: {
          textOptions: {
            font: new PhetFont(12)
          },
          xMargin: 4,
          yMargin: 2
        },
        arrowButtonOptions: {
          scale: 0.5
        }
      },
      tandem: Tandem.REQUIRED
    }, options);

    // {Property.<number>} - intermediate Property to allow for scaling between atomic units and microcoulombs
    //  - value ranges from -10 to 10
    //  - unit can be e or mc
    // TODO: make this DynamicProperty to support PhET-iO LinkedElement, or eliminate altogether
    const chargeControlProperty = new NumberProperty(objectProperty.get() * scaleFactor, {
      range: new Range(-10, 10)
    });

    // no unlinking/disposing required as Property is never destroyed
    chargeControlProperty.link(value => {
      objectProperty.set(value / scaleFactor);
    });
    const chargeControlRange = new Range(valueRange.min * scaleFactor, valueRange.max * scaleFactor);

    // add custom thumb to the slider
    options.numberControlOptions.sliderOptions.thumbNode = new ChargeControlSliderThumb(objectProperty, merge({}, options, {
      tandem: options.tandem.createTandem(ISLCObjectControlPanel.NUMBER_CONTROL_TANDEM_NAME).createTandem(NumberControl.SLIDER_TANDEM_NAME).createTandem(Slider.THUMB_NODE_TANDEM_NAME)
    }));
    super(titleString, unitString, chargeControlProperty, chargeControlRange, options);

    // @public
    this.chargeControlProperty = chargeControlProperty;
  }

  // @public
  reset() {
    this.chargeControlProperty.reset();
  }
}
coulombsLaw.register('ChargeControl', ChargeControl);
export default ChargeControl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJSYW5nZSIsIklTTENPYmplY3RDb250cm9sUGFuZWwiLCJtZXJnZSIsIk51bWJlckNvbnRyb2wiLCJQaGV0Rm9udCIsIlNsaWRlciIsIlRhbmRlbSIsImNvdWxvbWJzTGF3IiwiQ2hhcmdlQ29udHJvbFNsaWRlclRodW1iIiwiVFJBQ0tfU0laRSIsIkNoYXJnZUNvbnRyb2wiLCJjb25zdHJ1Y3RvciIsInRpdGxlU3RyaW5nIiwidW5pdFN0cmluZyIsIm9iamVjdFByb3BlcnR5IiwidmFsdWVSYW5nZSIsInNjYWxlRmFjdG9yIiwib3B0aW9ucyIsImFsaWduIiwiYWRkaXRpb25hbFRpY2tzIiwidmFsdWUiLCJudW1iZXJDb250cm9sT3B0aW9ucyIsInNsaWRlck9wdGlvbnMiLCJ0cmFja1NpemUiLCJwaGV0aW9MaW5rZWRQcm9wZXJ0eSIsInRpdGxlTm9kZU9wdGlvbnMiLCJmb250IiwibnVtYmVyRGlzcGxheU9wdGlvbnMiLCJ0ZXh0T3B0aW9ucyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiYXJyb3dCdXR0b25PcHRpb25zIiwic2NhbGUiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsImNoYXJnZUNvbnRyb2xQcm9wZXJ0eSIsImdldCIsInJhbmdlIiwibGluayIsInNldCIsImNoYXJnZUNvbnRyb2xSYW5nZSIsIm1pbiIsIm1heCIsInRodW1iTm9kZSIsImNyZWF0ZVRhbmRlbSIsIk5VTUJFUl9DT05UUk9MX1RBTkRFTV9OQU1FIiwiU0xJREVSX1RBTkRFTV9OQU1FIiwiVEhVTUJfTk9ERV9UQU5ERU1fTkFNRSIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDaGFyZ2VDb250cm9sLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEFycm93IGJ1dHRvbnMsIHNsaWRlciBhbmQgdGV4dCBib3ggZm9yIGVkaXRpbmcgdGhlIG9iamVjdCB2YWx1ZSBhbW91bnQuXHJcbiAqXHJcbiAqIEBhdXRob3IgIEplc3NlIEdyZWVuYmVyZ1xyXG4gKiBAYXV0aG9yICBNaWNoYWVsIEJhcmxvd1xyXG4gKi9cclxuXHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IElTTENPYmplY3RDb250cm9sUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vaW52ZXJzZS1zcXVhcmUtbGF3LWNvbW1vbi9qcy92aWV3L0lTTENPYmplY3RDb250cm9sUGFuZWwuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IE51bWJlckNvbnRyb2wgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL051bWJlckNvbnRyb2wuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IFNsaWRlciBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvU2xpZGVyLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IGNvdWxvbWJzTGF3IGZyb20gJy4uLy4uL2NvdWxvbWJzTGF3LmpzJztcclxuaW1wb3J0IENoYXJnZUNvbnRyb2xTbGlkZXJUaHVtYiBmcm9tICcuL0NoYXJnZUNvbnRyb2xTbGlkZXJUaHVtYi5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgVFJBQ0tfU0laRSA9IG5ldyBEaW1lbnNpb24yKCAxMzIsIDAuMjUgKTtcclxuXHJcbmNsYXNzIENoYXJnZUNvbnRyb2wgZXh0ZW5kcyBJU0xDT2JqZWN0Q29udHJvbFBhbmVsIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlU3RyaW5nXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVuaXRTdHJpbmcgLSBmb3IgdGhlIE51bWJlckNvbnRyb2wgcmVhZG91dFxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IG9iamVjdFByb3BlcnR5IC0gdGhlIG51bWJlciBQcm9wZXJ0eSBhc3NvY2lhdGVkIHdpdGggdGhlIElTTENPYmplY3RcclxuICAgKiBAcGFyYW0ge1JhbmdlfSB2YWx1ZVJhbmdlIC0gbWF4IGFuZCBtaW4gdmFsdWVzIGZvciB0aGUgb2JqZWN0IFByb3BlcnR5LCB1c2VkIGZvciBkaXNwbGF5IGFuZCBhcyBOdW1iZXJDb250cm9sIGFyZ3VtZW50XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNjYWxlRmFjdG9yIC0gbXVsdGlwbGljYXRpdmUgY29uc3RhbnQgZm9yIGdldHRpbmcgcHJvcGVyIHJlYWRvdXRzL3Bvc2l0aW9ucyBvbiBNYWNybyBhbmQgQXRvbWljIHNjcmVlbnNcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRpdGxlU3RyaW5nLCB1bml0U3RyaW5nLCBvYmplY3RQcm9wZXJ0eSwgdmFsdWVSYW5nZSwgc2NhbGVGYWN0b3IsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBwYW5lbCBvcHRpb25zXHJcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgYWRkaXRpb25hbFRpY2tzOiBbIHsgdmFsdWU6IDAgfSBdLFxyXG5cclxuICAgICAgbnVtYmVyQ29udHJvbE9wdGlvbnM6IHtcclxuICAgICAgICBzbGlkZXJPcHRpb25zOiB7XHJcbiAgICAgICAgICB0cmFja1NpemU6IFRSQUNLX1NJWkUsXHJcblxyXG4gICAgICAgICAgLy8gSW5zdGVhZCBvZiBoYXZpbmcgYSBMaW5rZWRQcm9wZXJ0eSB0byB0aGlzLmNoYXJnZUNvbnRyb2xQcm9wZXJ0eSwgbGluayBkaXJlY3RseSB0byB0aGUgbW9kZWwgUHJvcGVydHkuXHJcbiAgICAgICAgICBwaGV0aW9MaW5rZWRQcm9wZXJ0eTogb2JqZWN0UHJvcGVydHlcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRpdGxlTm9kZU9wdGlvbnM6IHsgZm9udDogbmV3IFBoZXRGb250KCAxNiApIH0sXHJcbiAgICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcclxuICAgICAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTIgKVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHhNYXJnaW46IDQsXHJcbiAgICAgICAgICB5TWFyZ2luOiAyXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhcnJvd0J1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICAgIHNjYWxlOiAwLjVcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRFxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHtQcm9wZXJ0eS48bnVtYmVyPn0gLSBpbnRlcm1lZGlhdGUgUHJvcGVydHkgdG8gYWxsb3cgZm9yIHNjYWxpbmcgYmV0d2VlbiBhdG9taWMgdW5pdHMgYW5kIG1pY3JvY291bG9tYnNcclxuICAgIC8vICAtIHZhbHVlIHJhbmdlcyBmcm9tIC0xMCB0byAxMFxyXG4gICAgLy8gIC0gdW5pdCBjYW4gYmUgZSBvciBtY1xyXG4gICAgLy8gVE9ETzogbWFrZSB0aGlzIER5bmFtaWNQcm9wZXJ0eSB0byBzdXBwb3J0IFBoRVQtaU8gTGlua2VkRWxlbWVudCwgb3IgZWxpbWluYXRlIGFsdG9nZXRoZXJcclxuICAgIGNvbnN0IGNoYXJnZUNvbnRyb2xQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggb2JqZWN0UHJvcGVydHkuZ2V0KCkgKiBzY2FsZUZhY3Rvciwge1xyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAtMTAsIDEwIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBubyB1bmxpbmtpbmcvZGlzcG9zaW5nIHJlcXVpcmVkIGFzIFByb3BlcnR5IGlzIG5ldmVyIGRlc3Ryb3llZFxyXG4gICAgY2hhcmdlQ29udHJvbFByb3BlcnR5LmxpbmsoIHZhbHVlID0+IHtcclxuICAgICAgb2JqZWN0UHJvcGVydHkuc2V0KCB2YWx1ZSAvIHNjYWxlRmFjdG9yICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY2hhcmdlQ29udHJvbFJhbmdlID0gbmV3IFJhbmdlKCB2YWx1ZVJhbmdlLm1pbiAqIHNjYWxlRmFjdG9yLCB2YWx1ZVJhbmdlLm1heCAqIHNjYWxlRmFjdG9yICk7XHJcblxyXG4gICAgLy8gYWRkIGN1c3RvbSB0aHVtYiB0byB0aGUgc2xpZGVyXHJcbiAgICBvcHRpb25zLm51bWJlckNvbnRyb2xPcHRpb25zLnNsaWRlck9wdGlvbnMudGh1bWJOb2RlID0gbmV3IENoYXJnZUNvbnRyb2xTbGlkZXJUaHVtYiggb2JqZWN0UHJvcGVydHksXHJcbiAgICAgIG1lcmdlKCB7fSwgb3B0aW9ucywge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCBJU0xDT2JqZWN0Q29udHJvbFBhbmVsLk5VTUJFUl9DT05UUk9MX1RBTkRFTV9OQU1FIClcclxuICAgICAgICAgIC5jcmVhdGVUYW5kZW0oIE51bWJlckNvbnRyb2wuU0xJREVSX1RBTkRFTV9OQU1FICkuY3JlYXRlVGFuZGVtKCBTbGlkZXIuVEhVTUJfTk9ERV9UQU5ERU1fTkFNRSApXHJcbiAgICAgIH0gKSApO1xyXG5cclxuICAgIHN1cGVyKCB0aXRsZVN0cmluZywgdW5pdFN0cmluZywgY2hhcmdlQ29udHJvbFByb3BlcnR5LCBjaGFyZ2VDb250cm9sUmFuZ2UsIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLmNoYXJnZUNvbnRyb2xQcm9wZXJ0eSA9IGNoYXJnZUNvbnRyb2xQcm9wZXJ0eTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuY2hhcmdlQ29udHJvbFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5jb3Vsb21ic0xhdy5yZWdpc3RlciggJ0NoYXJnZUNvbnRyb2wnLCBDaGFyZ2VDb250cm9sICk7XHJcbmV4cG9ydCBkZWZhdWx0IENoYXJnZUNvbnRyb2w7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0Msc0JBQXNCLE1BQU0seUVBQXlFO0FBQzVHLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsYUFBYSxNQUFNLDhDQUE4QztBQUN4RSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLE1BQU0sTUFBTSw4QkFBOEI7QUFDakQsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLHdCQUF3QixNQUFNLCtCQUErQjs7QUFFcEU7QUFDQSxNQUFNQyxVQUFVLEdBQUcsSUFBSVYsVUFBVSxDQUFFLEdBQUcsRUFBRSxJQUFLLENBQUM7QUFFOUMsTUFBTVcsYUFBYSxTQUFTVCxzQkFBc0IsQ0FBQztFQUVqRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VVLFdBQVdBLENBQUVDLFdBQVcsRUFBRUMsVUFBVSxFQUFFQyxjQUFjLEVBQUVDLFVBQVUsRUFBRUMsV0FBVyxFQUFFQyxP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