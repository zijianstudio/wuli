// Copyright 2016-2022, University of Colorado Boulder

/**
 * control that allows the user to adjust value of a variable using arrow buttons displayed to the left and right of
 * the value
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import MathSymbolFont from '../../../../scenery-phet/js/MathSymbolFont.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Node, Text } from '../../../../scenery/js/imports.js';
import NumberSpinner from '../../../../sun/js/NumberSpinner.js';
import expressionExchange from '../../expressionExchange.js';

// constants
const READOUT_FONT = new PhetFont(16);
const VARIABLE_FONT = new MathSymbolFont(24);
const EQUALS_SIGN_FONT = new PhetFont(22); // because the equals sign in MathSymbolFont looked bad
const DEFAULT_MIN_VALUE = -10;
const DEFAULT_MAX_VALUE = 10;
class LeftRightNumberSpinner extends Node {
  /**
   * @param {Property.<number>} variableValueProperty - property that wraps the values that will be manipulated
   * @param {string} variableString - the variable text displayed in the control
   * @param {Object} [options]
   */
  constructor(variableValueProperty, variableString, options) {
    super();
    options = merge({
      minValue: DEFAULT_MIN_VALUE,
      maxValue: DEFAULT_MAX_VALUE
    }, options);

    // create and add the readout
    const numberSpinner = new NumberSpinner(variableValueProperty, new Property(new Range(options.minValue, options.maxValue)), {
      arrowsPosition: 'leftRight',
      numberDisplayOptions: {
        xMargin: 5,
        yMargin: 3,
        cornerRadius: 4,
        textOptions: {
          font: READOUT_FONT
        }
      }
    });

    // create an HBox that will hold the variable, the equals sign, and the number spinner
    this.addChild(new HBox({
      spacing: 6,
      children: [new Text(variableString, {
        font: VARIABLE_FONT
      }), new Text(MathSymbols.EQUAL_TO, {
        font: EQUALS_SIGN_FONT
      }), numberSpinner]
    }));
  }
}
expressionExchange.register('LeftRightNumberSpinner', LeftRightNumberSpinner);
export default LeftRightNumberSpinner;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlJhbmdlIiwibWVyZ2UiLCJNYXRoU3ltYm9sRm9udCIsIk1hdGhTeW1ib2xzIiwiUGhldEZvbnQiLCJIQm94IiwiTm9kZSIsIlRleHQiLCJOdW1iZXJTcGlubmVyIiwiZXhwcmVzc2lvbkV4Y2hhbmdlIiwiUkVBRE9VVF9GT05UIiwiVkFSSUFCTEVfRk9OVCIsIkVRVUFMU19TSUdOX0ZPTlQiLCJERUZBVUxUX01JTl9WQUxVRSIsIkRFRkFVTFRfTUFYX1ZBTFVFIiwiTGVmdFJpZ2h0TnVtYmVyU3Bpbm5lciIsImNvbnN0cnVjdG9yIiwidmFyaWFibGVWYWx1ZVByb3BlcnR5IiwidmFyaWFibGVTdHJpbmciLCJvcHRpb25zIiwibWluVmFsdWUiLCJtYXhWYWx1ZSIsIm51bWJlclNwaW5uZXIiLCJhcnJvd3NQb3NpdGlvbiIsIm51bWJlckRpc3BsYXlPcHRpb25zIiwieE1hcmdpbiIsInlNYXJnaW4iLCJjb3JuZXJSYWRpdXMiLCJ0ZXh0T3B0aW9ucyIsImZvbnQiLCJhZGRDaGlsZCIsInNwYWNpbmciLCJjaGlsZHJlbiIsIkVRVUFMX1RPIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMZWZ0UmlnaHROdW1iZXJTcGlubmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIGNvbnRyb2wgdGhhdCBhbGxvd3MgdGhlIHVzZXIgdG8gYWRqdXN0IHZhbHVlIG9mIGEgdmFyaWFibGUgdXNpbmcgYXJyb3cgYnV0dG9ucyBkaXNwbGF5ZWQgdG8gdGhlIGxlZnQgYW5kIHJpZ2h0IG9mXHJcbiAqIHRoZSB2YWx1ZVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBNYXRoU3ltYm9sRm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWF0aFN5bWJvbEZvbnQuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IEhCb3gsIE5vZGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgTnVtYmVyU3Bpbm5lciBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvTnVtYmVyU3Bpbm5lci5qcyc7XHJcbmltcG9ydCBleHByZXNzaW9uRXhjaGFuZ2UgZnJvbSAnLi4vLi4vZXhwcmVzc2lvbkV4Y2hhbmdlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBSRUFET1VUX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDE2ICk7XHJcbmNvbnN0IFZBUklBQkxFX0ZPTlQgPSBuZXcgTWF0aFN5bWJvbEZvbnQoIDI0ICk7XHJcbmNvbnN0IEVRVUFMU19TSUdOX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDIyICk7IC8vIGJlY2F1c2UgdGhlIGVxdWFscyBzaWduIGluIE1hdGhTeW1ib2xGb250IGxvb2tlZCBiYWRcclxuY29uc3QgREVGQVVMVF9NSU5fVkFMVUUgPSAtMTA7XHJcbmNvbnN0IERFRkFVTFRfTUFYX1ZBTFVFID0gMTA7XHJcblxyXG5jbGFzcyBMZWZ0UmlnaHROdW1iZXJTcGlubmVyIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IHZhcmlhYmxlVmFsdWVQcm9wZXJ0eSAtIHByb3BlcnR5IHRoYXQgd3JhcHMgdGhlIHZhbHVlcyB0aGF0IHdpbGwgYmUgbWFuaXB1bGF0ZWRcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFyaWFibGVTdHJpbmcgLSB0aGUgdmFyaWFibGUgdGV4dCBkaXNwbGF5ZWQgaW4gdGhlIGNvbnRyb2xcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHZhcmlhYmxlVmFsdWVQcm9wZXJ0eSwgdmFyaWFibGVTdHJpbmcsIG9wdGlvbnMgKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBtaW5WYWx1ZTogREVGQVVMVF9NSU5fVkFMVUUsXHJcbiAgICAgIG1heFZhbHVlOiBERUZBVUxUX01BWF9WQUxVRVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhbmQgYWRkIHRoZSByZWFkb3V0XHJcbiAgICBjb25zdCBudW1iZXJTcGlubmVyID0gbmV3IE51bWJlclNwaW5uZXIoIHZhcmlhYmxlVmFsdWVQcm9wZXJ0eSwgbmV3IFByb3BlcnR5KCBuZXcgUmFuZ2UoIG9wdGlvbnMubWluVmFsdWUsIG9wdGlvbnMubWF4VmFsdWUgKSApLCB7XHJcbiAgICAgIGFycm93c1Bvc2l0aW9uOiAnbGVmdFJpZ2h0JyxcclxuICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcclxuICAgICAgICB4TWFyZ2luOiA1LFxyXG4gICAgICAgIHlNYXJnaW46IDMsXHJcbiAgICAgICAgY29ybmVyUmFkaXVzOiA0LFxyXG4gICAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgICBmb250OiBSRUFET1VUX0ZPTlRcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYW4gSEJveCB0aGF0IHdpbGwgaG9sZCB0aGUgdmFyaWFibGUsIHRoZSBlcXVhbHMgc2lnbiwgYW5kIHRoZSBudW1iZXIgc3Bpbm5lclxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IEhCb3goIHtcclxuICAgICAgc3BhY2luZzogNixcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgVGV4dCggdmFyaWFibGVTdHJpbmcsIHsgZm9udDogVkFSSUFCTEVfRk9OVCB9ICksXHJcbiAgICAgICAgbmV3IFRleHQoIE1hdGhTeW1ib2xzLkVRVUFMX1RPLCB7IGZvbnQ6IEVRVUFMU19TSUdOX0ZPTlQgfSApLFxyXG4gICAgICAgIG51bWJlclNwaW5uZXIgXVxyXG4gICAgfSApICk7XHJcbiAgfVxyXG59XHJcblxyXG5leHByZXNzaW9uRXhjaGFuZ2UucmVnaXN0ZXIoICdMZWZ0UmlnaHROdW1iZXJTcGlubmVyJywgTGVmdFJpZ2h0TnVtYmVyU3Bpbm5lciApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTGVmdFJpZ2h0TnVtYmVyU3Bpbm5lcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxjQUFjLE1BQU0sK0NBQStDO0FBQzFFLE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUNwRSxPQUFPQyxhQUFhLE1BQU0scUNBQXFDO0FBQy9ELE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2Qjs7QUFFNUQ7QUFDQSxNQUFNQyxZQUFZLEdBQUcsSUFBSU4sUUFBUSxDQUFFLEVBQUcsQ0FBQztBQUN2QyxNQUFNTyxhQUFhLEdBQUcsSUFBSVQsY0FBYyxDQUFFLEVBQUcsQ0FBQztBQUM5QyxNQUFNVSxnQkFBZ0IsR0FBRyxJQUFJUixRQUFRLENBQUUsRUFBRyxDQUFDLENBQUMsQ0FBQztBQUM3QyxNQUFNUyxpQkFBaUIsR0FBRyxDQUFDLEVBQUU7QUFDN0IsTUFBTUMsaUJBQWlCLEdBQUcsRUFBRTtBQUU1QixNQUFNQyxzQkFBc0IsU0FBU1QsSUFBSSxDQUFDO0VBRXhDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRVUsV0FBV0EsQ0FBRUMscUJBQXFCLEVBQUVDLGNBQWMsRUFBRUMsT0FBTyxFQUFHO0lBQzVELEtBQUssQ0FBQyxDQUFDO0lBRVBBLE9BQU8sR0FBR2xCLEtBQUssQ0FBRTtNQUNmbUIsUUFBUSxFQUFFUCxpQkFBaUI7TUFDM0JRLFFBQVEsRUFBRVA7SUFDWixDQUFDLEVBQUVLLE9BQVEsQ0FBQzs7SUFFWjtJQUNBLE1BQU1HLGFBQWEsR0FBRyxJQUFJZCxhQUFhLENBQUVTLHFCQUFxQixFQUFFLElBQUlsQixRQUFRLENBQUUsSUFBSUMsS0FBSyxDQUFFbUIsT0FBTyxDQUFDQyxRQUFRLEVBQUVELE9BQU8sQ0FBQ0UsUUFBUyxDQUFFLENBQUMsRUFBRTtNQUMvSEUsY0FBYyxFQUFFLFdBQVc7TUFDM0JDLG9CQUFvQixFQUFFO1FBQ3BCQyxPQUFPLEVBQUUsQ0FBQztRQUNWQyxPQUFPLEVBQUUsQ0FBQztRQUNWQyxZQUFZLEVBQUUsQ0FBQztRQUNmQyxXQUFXLEVBQUU7VUFDWEMsSUFBSSxFQUFFbkI7UUFDUjtNQUNGO0lBQ0YsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDb0IsUUFBUSxDQUFFLElBQUl6QixJQUFJLENBQUU7TUFDdkIwQixPQUFPLEVBQUUsQ0FBQztNQUNWQyxRQUFRLEVBQUUsQ0FDUixJQUFJekIsSUFBSSxDQUFFVyxjQUFjLEVBQUU7UUFBRVcsSUFBSSxFQUFFbEI7TUFBYyxDQUFFLENBQUMsRUFDbkQsSUFBSUosSUFBSSxDQUFFSixXQUFXLENBQUM4QixRQUFRLEVBQUU7UUFBRUosSUFBSSxFQUFFakI7TUFBaUIsQ0FBRSxDQUFDLEVBQzVEVSxhQUFhO0lBQ2pCLENBQUUsQ0FBRSxDQUFDO0VBQ1A7QUFDRjtBQUVBYixrQkFBa0IsQ0FBQ3lCLFFBQVEsQ0FBRSx3QkFBd0IsRUFBRW5CLHNCQUF1QixDQUFDO0FBRS9FLGVBQWVBLHNCQUFzQiJ9