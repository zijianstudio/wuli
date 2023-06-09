// Copyright 2016-2022, University of Colorado Boulder

/**
 * Button for toggling 'recording' state on/off.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import { Circle, Rectangle } from '../../../scenery/js/imports.js';
import BooleanRoundToggleButton from '../../../sun/js/buttons/BooleanRoundToggleButton.js';
import PhetColorScheme from '../PhetColorScheme.js';
import sceneryPhet from '../sceneryPhet.js';
import optionize from '../../../phet-core/js/optionize.js';
export default class RecordStopButton extends BooleanRoundToggleButton {
  constructor(recordingProperty, providedOptions) {
    const options = optionize()({
      // RecordStopButtonOptions
      radius: 30,
      // BooleanRoundToggleButtonOptions
      xMargin: 16.5,
      yMargin: 16.5
    }, providedOptions);
    const squareLength = 0.75 * options.radius;

    // stop icon, a black square
    const stopIcon = new Rectangle(0, 0, 0.75 * options.radius, 0.75 * options.radius, {
      fill: 'black'
    });

    // record icon, a red circle
    const recordIcon = new Circle(0.6 * squareLength, {
      fill: PhetColorScheme.RED_COLORBLIND,
      center: stopIcon.center
    });
    super(recordingProperty, stopIcon, recordIcon, options);

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('scenery-phet', 'RecordStopButton', this);
  }
}
sceneryPhet.register('RecordStopButton', RecordStopButton);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnN0YW5jZVJlZ2lzdHJ5IiwiQ2lyY2xlIiwiUmVjdGFuZ2xlIiwiQm9vbGVhblJvdW5kVG9nZ2xlQnV0dG9uIiwiUGhldENvbG9yU2NoZW1lIiwic2NlbmVyeVBoZXQiLCJvcHRpb25pemUiLCJSZWNvcmRTdG9wQnV0dG9uIiwiY29uc3RydWN0b3IiLCJyZWNvcmRpbmdQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJyYWRpdXMiLCJ4TWFyZ2luIiwieU1hcmdpbiIsInNxdWFyZUxlbmd0aCIsInN0b3BJY29uIiwiZmlsbCIsInJlY29yZEljb24iLCJSRURfQ09MT1JCTElORCIsImNlbnRlciIsImFzc2VydCIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiYmluZGVyIiwicmVnaXN0ZXJEYXRhVVJMIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJSZWNvcmRTdG9wQnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJ1dHRvbiBmb3IgdG9nZ2xpbmcgJ3JlY29yZGluZycgc3RhdGUgb24vb2ZmLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBJbnN0YW5jZVJlZ2lzdHJ5IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9kb2N1bWVudGF0aW9uL0luc3RhbmNlUmVnaXN0cnkuanMnO1xyXG5pbXBvcnQgeyBDaXJjbGUsIFJlY3RhbmdsZSB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBCb29sZWFuUm91bmRUb2dnbGVCdXR0b24sIHsgQm9vbGVhblJvdW5kVG9nZ2xlQnV0dG9uT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL0Jvb2xlYW5Sb3VuZFRvZ2dsZUJ1dHRvbi5qcyc7XHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vUGhldENvbG9yU2NoZW1lLmpzJztcclxuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4uL3NjZW5lcnlQaGV0LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICByYWRpdXM/OiBudW1iZXI7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBSZWNvcmRTdG9wQnV0dG9uT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgQm9vbGVhblJvdW5kVG9nZ2xlQnV0dG9uT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY29yZFN0b3BCdXR0b24gZXh0ZW5kcyBCb29sZWFuUm91bmRUb2dnbGVCdXR0b24ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHJlY29yZGluZ1Byb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPiwgcHJvdmlkZWRPcHRpb25zPzogUmVjb3JkU3RvcEJ1dHRvbk9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxSZWNvcmRTdG9wQnV0dG9uT3B0aW9ucywgU2VsZk9wdGlvbnMsIEJvb2xlYW5Sb3VuZFRvZ2dsZUJ1dHRvbk9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFJlY29yZFN0b3BCdXR0b25PcHRpb25zXHJcbiAgICAgIHJhZGl1czogMzAsXHJcblxyXG4gICAgICAvLyBCb29sZWFuUm91bmRUb2dnbGVCdXR0b25PcHRpb25zXHJcbiAgICAgIHhNYXJnaW46IDE2LjUsXHJcbiAgICAgIHlNYXJnaW46IDE2LjVcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHNxdWFyZUxlbmd0aCA9IDAuNzUgKiBvcHRpb25zLnJhZGl1cztcclxuXHJcbiAgICAvLyBzdG9wIGljb24sIGEgYmxhY2sgc3F1YXJlXHJcbiAgICBjb25zdCBzdG9wSWNvbiA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDAuNzUgKiBvcHRpb25zLnJhZGl1cywgMC43NSAqIG9wdGlvbnMucmFkaXVzLCB7IGZpbGw6ICdibGFjaycgfSApO1xyXG5cclxuICAgIC8vIHJlY29yZCBpY29uLCBhIHJlZCBjaXJjbGVcclxuICAgIGNvbnN0IHJlY29yZEljb24gPSBuZXcgQ2lyY2xlKCAwLjYgKiBzcXVhcmVMZW5ndGgsIHtcclxuICAgICAgZmlsbDogUGhldENvbG9yU2NoZW1lLlJFRF9DT0xPUkJMSU5ELFxyXG4gICAgICBjZW50ZXI6IHN0b3BJY29uLmNlbnRlclxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCByZWNvcmRpbmdQcm9wZXJ0eSwgc3RvcEljb24sIHJlY29yZEljb24sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcclxuICAgIGFzc2VydCAmJiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3NjZW5lcnktcGhldCcsICdSZWNvcmRTdG9wQnV0dG9uJywgdGhpcyApO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdSZWNvcmRTdG9wQnV0dG9uJywgUmVjb3JkU3RvcEJ1dHRvbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxnQkFBZ0IsTUFBTSx5REFBeUQ7QUFDdEYsU0FBU0MsTUFBTSxFQUFFQyxTQUFTLFFBQVEsZ0NBQWdDO0FBQ2xFLE9BQU9DLHdCQUF3QixNQUEyQyxxREFBcUQ7QUFDL0gsT0FBT0MsZUFBZSxNQUFNLHVCQUF1QjtBQUNuRCxPQUFPQyxXQUFXLE1BQU0sbUJBQW1CO0FBQzNDLE9BQU9DLFNBQVMsTUFBTSxvQ0FBb0M7QUFTMUQsZUFBZSxNQUFNQyxnQkFBZ0IsU0FBU0osd0JBQXdCLENBQUM7RUFFOURLLFdBQVdBLENBQUVDLGlCQUFvQyxFQUFFQyxlQUF5QyxFQUFHO0lBRXBHLE1BQU1DLE9BQU8sR0FBR0wsU0FBUyxDQUF3RSxDQUFDLENBQUU7TUFFbEc7TUFDQU0sTUFBTSxFQUFFLEVBQUU7TUFFVjtNQUNBQyxPQUFPLEVBQUUsSUFBSTtNQUNiQyxPQUFPLEVBQUU7SUFDWCxDQUFDLEVBQUVKLGVBQWdCLENBQUM7SUFFcEIsTUFBTUssWUFBWSxHQUFHLElBQUksR0FBR0osT0FBTyxDQUFDQyxNQUFNOztJQUUxQztJQUNBLE1BQU1JLFFBQVEsR0FBRyxJQUFJZCxTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEdBQUdTLE9BQU8sQ0FBQ0MsTUFBTSxFQUFFLElBQUksR0FBR0QsT0FBTyxDQUFDQyxNQUFNLEVBQUU7TUFBRUssSUFBSSxFQUFFO0lBQVEsQ0FBRSxDQUFDOztJQUV2RztJQUNBLE1BQU1DLFVBQVUsR0FBRyxJQUFJakIsTUFBTSxDQUFFLEdBQUcsR0FBR2MsWUFBWSxFQUFFO01BQ2pERSxJQUFJLEVBQUViLGVBQWUsQ0FBQ2UsY0FBYztNQUNwQ0MsTUFBTSxFQUFFSixRQUFRLENBQUNJO0lBQ25CLENBQUUsQ0FBQztJQUVILEtBQUssQ0FBRVgsaUJBQWlCLEVBQUVPLFFBQVEsRUFBRUUsVUFBVSxFQUFFUCxPQUFRLENBQUM7O0lBRXpEO0lBQ0FVLE1BQU0sSUFBSUMsSUFBSSxDQUFDQyxPQUFPLENBQUNDLGVBQWUsQ0FBQ0MsTUFBTSxJQUFJekIsZ0JBQWdCLENBQUMwQixlQUFlLENBQUUsY0FBYyxFQUFFLGtCQUFrQixFQUFFLElBQUssQ0FBQztFQUMvSDtBQUNGO0FBRUFyQixXQUFXLENBQUNzQixRQUFRLENBQUUsa0JBQWtCLEVBQUVwQixnQkFBaUIsQ0FBQyJ9