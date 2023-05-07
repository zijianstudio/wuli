// Copyright 2020-2022, University of Colorado Boulder

/**
 * InitialNetWorthAccordionBox displays the initial net worth value, which is provided as a Property, in an accordion
 * box.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import NLCConstants from '../../../../number-line-common/js/common/NLCConstants.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, RichText, Text } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import NumberPicker from '../../../../sun/js/NumberPicker.js';
import NLOConstants from '../../common/NLOConstants.js';
import numberLineOperations from '../../numberLineOperations.js';
import NumberLineOperationsStrings from '../../NumberLineOperationsStrings.js';
class InitialNetWorthAccordionBox extends AccordionBox {
  /**
   * @param {NumberProperty} initialNetWorthProperty
   * @param {Property.<Range>} netWorthRangeProperty
   * @param {Object} [options]
   */
  constructor(initialNetWorthProperty, netWorthRangeProperty, options) {
    options = merge({
      titleNode: new Text(NumberLineOperationsStrings.initialNetWorth, {
        font: new PhetFont(18),
        maxWidth: 200 // empirically determined using stringTest=long
      })
    }, NLCConstants.ACCORDION_BOX_COMMON_OPTIONS, options);
    const label = new RichText(NumberLineOperationsStrings.initialNetWorthWithBreak, {
      align: 'center',
      font: new PhetFont(24),
      maxWidth: 150 // empirically determined using stringTest=long
    });

    const equalsAndCurrencyUnits = new Text(`= ${NumberLineOperationsStrings.currencyUnits}`, {
      font: new PhetFont(24),
      maxWidth: 150 // empirically determined using stringTest=long
    });

    const initialNetWorthPicker = new NumberPicker(initialNetWorthProperty, netWorthRangeProperty, {
      incrementFunction: value => value + 100,
      decrementFunction: value => value - 100,
      yMargin: 10,
      arrowHeight: 10,
      color: NLOConstants.DARK_BLUE_POINT_COLOR,
      font: new PhetFont(26)
    });
    const content = new HBox({
      children: [label, equalsAndCurrencyUnits, initialNetWorthPicker],
      spacing: 15
    });
    super(content, options);
  }
}
numberLineOperations.register('InitialNetWorthAccordionBox', InitialNetWorthAccordionBox);
export default InitialNetWorthAccordionBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOTENDb25zdGFudHMiLCJtZXJnZSIsIlBoZXRGb250IiwiSEJveCIsIlJpY2hUZXh0IiwiVGV4dCIsIkFjY29yZGlvbkJveCIsIk51bWJlclBpY2tlciIsIk5MT0NvbnN0YW50cyIsIm51bWJlckxpbmVPcGVyYXRpb25zIiwiTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzIiwiSW5pdGlhbE5ldFdvcnRoQWNjb3JkaW9uQm94IiwiY29uc3RydWN0b3IiLCJpbml0aWFsTmV0V29ydGhQcm9wZXJ0eSIsIm5ldFdvcnRoUmFuZ2VQcm9wZXJ0eSIsIm9wdGlvbnMiLCJ0aXRsZU5vZGUiLCJpbml0aWFsTmV0V29ydGgiLCJmb250IiwibWF4V2lkdGgiLCJBQ0NPUkRJT05fQk9YX0NPTU1PTl9PUFRJT05TIiwibGFiZWwiLCJpbml0aWFsTmV0V29ydGhXaXRoQnJlYWsiLCJhbGlnbiIsImVxdWFsc0FuZEN1cnJlbmN5VW5pdHMiLCJjdXJyZW5jeVVuaXRzIiwiaW5pdGlhbE5ldFdvcnRoUGlja2VyIiwiaW5jcmVtZW50RnVuY3Rpb24iLCJ2YWx1ZSIsImRlY3JlbWVudEZ1bmN0aW9uIiwieU1hcmdpbiIsImFycm93SGVpZ2h0IiwiY29sb3IiLCJEQVJLX0JMVUVfUE9JTlRfQ09MT1IiLCJjb250ZW50IiwiY2hpbGRyZW4iLCJzcGFjaW5nIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbml0aWFsTmV0V29ydGhBY2NvcmRpb25Cb3guanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSW5pdGlhbE5ldFdvcnRoQWNjb3JkaW9uQm94IGRpc3BsYXlzIHRoZSBpbml0aWFsIG5ldCB3b3J0aCB2YWx1ZSwgd2hpY2ggaXMgcHJvdmlkZWQgYXMgYSBQcm9wZXJ0eSwgaW4gYW4gYWNjb3JkaW9uXHJcbiAqIGJveC5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgTkxDQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL251bWJlci1saW5lLWNvbW1vbi9qcy9jb21tb24vTkxDQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBIQm94LCBSaWNoVGV4dCwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBY2NvcmRpb25Cb3ggZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0FjY29yZGlvbkJveC5qcyc7XHJcbmltcG9ydCBOdW1iZXJQaWNrZXIgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL051bWJlclBpY2tlci5qcyc7XHJcbmltcG9ydCBOTE9Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL05MT0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBudW1iZXJMaW5lT3BlcmF0aW9ucyBmcm9tICcuLi8uLi9udW1iZXJMaW5lT3BlcmF0aW9ucy5qcyc7XHJcbmltcG9ydCBOdW1iZXJMaW5lT3BlcmF0aW9uc1N0cmluZ3MgZnJvbSAnLi4vLi4vTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzLmpzJztcclxuXHJcbmNsYXNzIEluaXRpYWxOZXRXb3J0aEFjY29yZGlvbkJveCBleHRlbmRzIEFjY29yZGlvbkJveCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyUHJvcGVydHl9IGluaXRpYWxOZXRXb3J0aFByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48UmFuZ2U+fSBuZXRXb3J0aFJhbmdlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGluaXRpYWxOZXRXb3J0aFByb3BlcnR5LCBuZXRXb3J0aFJhbmdlUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHRpdGxlTm9kZTogbmV3IFRleHQoIE51bWJlckxpbmVPcGVyYXRpb25zU3RyaW5ncy5pbml0aWFsTmV0V29ydGgsIHtcclxuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE4ICksXHJcbiAgICAgICAgbWF4V2lkdGg6IDIwMCAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHVzaW5nIHN0cmluZ1Rlc3Q9bG9uZ1xyXG4gICAgICB9IClcclxuICAgIH0sIE5MQ0NvbnN0YW50cy5BQ0NPUkRJT05fQk9YX0NPTU1PTl9PUFRJT05TLCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgbGFiZWwgPSBuZXcgUmljaFRleHQoIE51bWJlckxpbmVPcGVyYXRpb25zU3RyaW5ncy5pbml0aWFsTmV0V29ydGhXaXRoQnJlYWssIHtcclxuICAgICAgYWxpZ246ICdjZW50ZXInLFxyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDI0ICksXHJcbiAgICAgIG1heFdpZHRoOiAxNTAgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB1c2luZyBzdHJpbmdUZXN0PWxvbmdcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBlcXVhbHNBbmRDdXJyZW5jeVVuaXRzID0gbmV3IFRleHQoIGA9ICR7TnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzLmN1cnJlbmN5VW5pdHN9YCwge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDI0ICksXHJcbiAgICAgIG1heFdpZHRoOiAxNTAgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB1c2luZyBzdHJpbmdUZXN0PWxvbmdcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBpbml0aWFsTmV0V29ydGhQaWNrZXIgPSBuZXcgTnVtYmVyUGlja2VyKFxyXG4gICAgICBpbml0aWFsTmV0V29ydGhQcm9wZXJ0eSxcclxuICAgICAgbmV0V29ydGhSYW5nZVByb3BlcnR5LFxyXG4gICAgICB7XHJcbiAgICAgICAgaW5jcmVtZW50RnVuY3Rpb246IHZhbHVlID0+IHZhbHVlICsgMTAwLFxyXG4gICAgICAgIGRlY3JlbWVudEZ1bmN0aW9uOiB2YWx1ZSA9PiB2YWx1ZSAtIDEwMCxcclxuICAgICAgICB5TWFyZ2luOiAxMCxcclxuICAgICAgICBhcnJvd0hlaWdodDogMTAsXHJcbiAgICAgICAgY29sb3I6IE5MT0NvbnN0YW50cy5EQVJLX0JMVUVfUE9JTlRfQ09MT1IsXHJcbiAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAyNiApXHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgY29udGVudCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIGxhYmVsLCBlcXVhbHNBbmRDdXJyZW5jeVVuaXRzLCBpbml0aWFsTmV0V29ydGhQaWNrZXIgXSxcclxuICAgICAgc3BhY2luZzogMTVcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggY29udGVudCwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxubnVtYmVyTGluZU9wZXJhdGlvbnMucmVnaXN0ZXIoICdJbml0aWFsTmV0V29ydGhBY2NvcmRpb25Cb3gnLCBJbml0aWFsTmV0V29ydGhBY2NvcmRpb25Cb3ggKTtcclxuZXhwb3J0IGRlZmF1bHQgSW5pdGlhbE5ldFdvcnRoQWNjb3JkaW9uQm94O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxZQUFZLE1BQU0sMERBQTBEO0FBQ25GLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLEVBQUVDLFFBQVEsRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUN4RSxPQUFPQyxZQUFZLE1BQU0sb0NBQW9DO0FBQzdELE9BQU9DLFlBQVksTUFBTSxvQ0FBb0M7QUFDN0QsT0FBT0MsWUFBWSxNQUFNLDhCQUE4QjtBQUN2RCxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7QUFDaEUsT0FBT0MsMkJBQTJCLE1BQU0sc0NBQXNDO0FBRTlFLE1BQU1DLDJCQUEyQixTQUFTTCxZQUFZLENBQUM7RUFFckQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFTSxXQUFXQSxDQUFFQyx1QkFBdUIsRUFBRUMscUJBQXFCLEVBQUVDLE9BQU8sRUFBRztJQUVyRUEsT0FBTyxHQUFHZCxLQUFLLENBQUU7TUFDZmUsU0FBUyxFQUFFLElBQUlYLElBQUksQ0FBRUssMkJBQTJCLENBQUNPLGVBQWUsRUFBRTtRQUNoRUMsSUFBSSxFQUFFLElBQUloQixRQUFRLENBQUUsRUFBRyxDQUFDO1FBQ3hCaUIsUUFBUSxFQUFFLEdBQUcsQ0FBQztNQUNoQixDQUFFO0lBQ0osQ0FBQyxFQUFFbkIsWUFBWSxDQUFDb0IsNEJBQTRCLEVBQUVMLE9BQVEsQ0FBQztJQUV2RCxNQUFNTSxLQUFLLEdBQUcsSUFBSWpCLFFBQVEsQ0FBRU0sMkJBQTJCLENBQUNZLHdCQUF3QixFQUFFO01BQ2hGQyxLQUFLLEVBQUUsUUFBUTtNQUNmTCxJQUFJLEVBQUUsSUFBSWhCLFFBQVEsQ0FBRSxFQUFHLENBQUM7TUFDeEJpQixRQUFRLEVBQUUsR0FBRyxDQUFDO0lBQ2hCLENBQUUsQ0FBQzs7SUFFSCxNQUFNSyxzQkFBc0IsR0FBRyxJQUFJbkIsSUFBSSxDQUFHLEtBQUlLLDJCQUEyQixDQUFDZSxhQUFjLEVBQUMsRUFBRTtNQUN6RlAsSUFBSSxFQUFFLElBQUloQixRQUFRLENBQUUsRUFBRyxDQUFDO01BQ3hCaUIsUUFBUSxFQUFFLEdBQUcsQ0FBQztJQUNoQixDQUFFLENBQUM7O0lBRUgsTUFBTU8scUJBQXFCLEdBQUcsSUFBSW5CLFlBQVksQ0FDNUNNLHVCQUF1QixFQUN2QkMscUJBQXFCLEVBQ3JCO01BQ0VhLGlCQUFpQixFQUFFQyxLQUFLLElBQUlBLEtBQUssR0FBRyxHQUFHO01BQ3ZDQyxpQkFBaUIsRUFBRUQsS0FBSyxJQUFJQSxLQUFLLEdBQUcsR0FBRztNQUN2Q0UsT0FBTyxFQUFFLEVBQUU7TUFDWEMsV0FBVyxFQUFFLEVBQUU7TUFDZkMsS0FBSyxFQUFFeEIsWUFBWSxDQUFDeUIscUJBQXFCO01BQ3pDZixJQUFJLEVBQUUsSUFBSWhCLFFBQVEsQ0FBRSxFQUFHO0lBQ3pCLENBQ0YsQ0FBQztJQUVELE1BQU1nQyxPQUFPLEdBQUcsSUFBSS9CLElBQUksQ0FBRTtNQUN4QmdDLFFBQVEsRUFBRSxDQUFFZCxLQUFLLEVBQUVHLHNCQUFzQixFQUFFRSxxQkFBcUIsQ0FBRTtNQUNsRVUsT0FBTyxFQUFFO0lBQ1gsQ0FBRSxDQUFDO0lBRUgsS0FBSyxDQUFFRixPQUFPLEVBQUVuQixPQUFRLENBQUM7RUFDM0I7QUFDRjtBQUVBTixvQkFBb0IsQ0FBQzRCLFFBQVEsQ0FBRSw2QkFBNkIsRUFBRTFCLDJCQUE0QixDQUFDO0FBQzNGLGVBQWVBLDJCQUEyQiJ9