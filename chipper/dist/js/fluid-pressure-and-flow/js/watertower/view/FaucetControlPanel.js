// Copyright 2014-2022, University of Colorado Boulder

/**
 * FaucetControlPanel
 *
 * @author Siddhartha Chinthapally (Actual Concepts) on 7/5/2014.
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text, VBox } from '../../../../scenery/js/imports.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import fluidPressureAndFlow from '../../fluidPressureAndFlow.js';
import FluidPressureAndFlowStrings from '../../FluidPressureAndFlowStrings.js';
const manualString = FluidPressureAndFlowStrings.manual;
const matchLeakageString = FluidPressureAndFlowStrings.matchLeakage;
class FaucetControlPanel extends VBox {
  /**
   * @param {Property.<string>} faucetModeProperty controls whether the faucet is operating in manual or match leakage mode
   * @param {Object} [options]
   */
  constructor(faucetModeProperty, options) {
    const textOptions = {
      font: new PhetFont(14)
    };
    const manualText = new Text(manualString, textOptions);
    const matchLeakageText = new Text(matchLeakageString, textOptions);
    super({
      children: [new AquaRadioButton(faucetModeProperty, 'manual', manualText, {
        radius: 8
      }), new AquaRadioButton(faucetModeProperty, 'matchLeakage', matchLeakageText, {
        radius: 8
      })],
      spacing: 5,
      align: 'left'
    });
    this.mutate(options);
  }
}
fluidPressureAndFlow.register('FaucetControlPanel', FaucetControlPanel);
export default FaucetControlPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0Rm9udCIsIlRleHQiLCJWQm94IiwiQXF1YVJhZGlvQnV0dG9uIiwiZmx1aWRQcmVzc3VyZUFuZEZsb3ciLCJGbHVpZFByZXNzdXJlQW5kRmxvd1N0cmluZ3MiLCJtYW51YWxTdHJpbmciLCJtYW51YWwiLCJtYXRjaExlYWthZ2VTdHJpbmciLCJtYXRjaExlYWthZ2UiLCJGYXVjZXRDb250cm9sUGFuZWwiLCJjb25zdHJ1Y3RvciIsImZhdWNldE1vZGVQcm9wZXJ0eSIsIm9wdGlvbnMiLCJ0ZXh0T3B0aW9ucyIsImZvbnQiLCJtYW51YWxUZXh0IiwibWF0Y2hMZWFrYWdlVGV4dCIsImNoaWxkcmVuIiwicmFkaXVzIiwic3BhY2luZyIsImFsaWduIiwibXV0YXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGYXVjZXRDb250cm9sUGFuZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRmF1Y2V0Q29udHJvbFBhbmVsXHJcbiAqXHJcbiAqIEBhdXRob3IgU2lkZGhhcnRoYSBDaGludGhhcGFsbHkgKEFjdHVhbCBDb25jZXB0cykgb24gNy81LzIwMTQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQXF1YVJhZGlvQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BcXVhUmFkaW9CdXR0b24uanMnO1xyXG5pbXBvcnQgZmx1aWRQcmVzc3VyZUFuZEZsb3cgZnJvbSAnLi4vLi4vZmx1aWRQcmVzc3VyZUFuZEZsb3cuanMnO1xyXG5pbXBvcnQgRmx1aWRQcmVzc3VyZUFuZEZsb3dTdHJpbmdzIGZyb20gJy4uLy4uL0ZsdWlkUHJlc3N1cmVBbmRGbG93U3RyaW5ncy5qcyc7XHJcblxyXG5jb25zdCBtYW51YWxTdHJpbmcgPSBGbHVpZFByZXNzdXJlQW5kRmxvd1N0cmluZ3MubWFudWFsO1xyXG5jb25zdCBtYXRjaExlYWthZ2VTdHJpbmcgPSBGbHVpZFByZXNzdXJlQW5kRmxvd1N0cmluZ3MubWF0Y2hMZWFrYWdlO1xyXG5cclxuY2xhc3MgRmF1Y2V0Q29udHJvbFBhbmVsIGV4dGVuZHMgVkJveCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPHN0cmluZz59IGZhdWNldE1vZGVQcm9wZXJ0eSBjb250cm9scyB3aGV0aGVyIHRoZSBmYXVjZXQgaXMgb3BlcmF0aW5nIGluIG1hbnVhbCBvciBtYXRjaCBsZWFrYWdlIG1vZGVcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGZhdWNldE1vZGVQcm9wZXJ0eSwgb3B0aW9ucyApIHtcclxuICAgIGNvbnN0IHRleHRPcHRpb25zID0geyBmb250OiBuZXcgUGhldEZvbnQoIDE0ICkgfTtcclxuICAgIGNvbnN0IG1hbnVhbFRleHQgPSBuZXcgVGV4dCggbWFudWFsU3RyaW5nLCB0ZXh0T3B0aW9ucyApO1xyXG4gICAgY29uc3QgbWF0Y2hMZWFrYWdlVGV4dCA9IG5ldyBUZXh0KCBtYXRjaExlYWthZ2VTdHJpbmcsIHRleHRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgQXF1YVJhZGlvQnV0dG9uKCBmYXVjZXRNb2RlUHJvcGVydHksICdtYW51YWwnLCBtYW51YWxUZXh0LCB7IHJhZGl1czogOCB9ICksXHJcbiAgICAgICAgbmV3IEFxdWFSYWRpb0J1dHRvbiggZmF1Y2V0TW9kZVByb3BlcnR5LCAnbWF0Y2hMZWFrYWdlJywgbWF0Y2hMZWFrYWdlVGV4dCwgeyByYWRpdXM6IDggfSApXHJcbiAgICAgIF0sXHJcbiAgICAgIHNwYWNpbmc6IDUsXHJcbiAgICAgIGFsaWduOiAnbGVmdCdcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuZmx1aWRQcmVzc3VyZUFuZEZsb3cucmVnaXN0ZXIoICdGYXVjZXRDb250cm9sUGFuZWwnLCBGYXVjZXRDb250cm9sUGFuZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgRmF1Y2V0Q29udHJvbFBhbmVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM5RCxPQUFPQyxlQUFlLE1BQU0sdUNBQXVDO0FBQ25FLE9BQU9DLG9CQUFvQixNQUFNLCtCQUErQjtBQUNoRSxPQUFPQywyQkFBMkIsTUFBTSxzQ0FBc0M7QUFFOUUsTUFBTUMsWUFBWSxHQUFHRCwyQkFBMkIsQ0FBQ0UsTUFBTTtBQUN2RCxNQUFNQyxrQkFBa0IsR0FBR0gsMkJBQTJCLENBQUNJLFlBQVk7QUFFbkUsTUFBTUMsa0JBQWtCLFNBQVNSLElBQUksQ0FBQztFQUVwQztBQUNGO0FBQ0E7QUFDQTtFQUNFUyxXQUFXQSxDQUFFQyxrQkFBa0IsRUFBRUMsT0FBTyxFQUFHO0lBQ3pDLE1BQU1DLFdBQVcsR0FBRztNQUFFQyxJQUFJLEVBQUUsSUFBSWYsUUFBUSxDQUFFLEVBQUc7SUFBRSxDQUFDO0lBQ2hELE1BQU1nQixVQUFVLEdBQUcsSUFBSWYsSUFBSSxDQUFFSyxZQUFZLEVBQUVRLFdBQVksQ0FBQztJQUN4RCxNQUFNRyxnQkFBZ0IsR0FBRyxJQUFJaEIsSUFBSSxDQUFFTyxrQkFBa0IsRUFBRU0sV0FBWSxDQUFDO0lBRXBFLEtBQUssQ0FBRTtNQUNMSSxRQUFRLEVBQUUsQ0FDUixJQUFJZixlQUFlLENBQUVTLGtCQUFrQixFQUFFLFFBQVEsRUFBRUksVUFBVSxFQUFFO1FBQUVHLE1BQU0sRUFBRTtNQUFFLENBQUUsQ0FBQyxFQUM5RSxJQUFJaEIsZUFBZSxDQUFFUyxrQkFBa0IsRUFBRSxjQUFjLEVBQUVLLGdCQUFnQixFQUFFO1FBQUVFLE1BQU0sRUFBRTtNQUFFLENBQUUsQ0FBQyxDQUMzRjtNQUNEQyxPQUFPLEVBQUUsQ0FBQztNQUNWQyxLQUFLLEVBQUU7SUFDVCxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNDLE1BQU0sQ0FBRVQsT0FBUSxDQUFDO0VBQ3hCO0FBQ0Y7QUFFQVQsb0JBQW9CLENBQUNtQixRQUFRLENBQUUsb0JBQW9CLEVBQUViLGtCQUFtQixDQUFDO0FBQ3pFLGVBQWVBLGtCQUFrQiJ9