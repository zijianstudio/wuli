// Copyright 2013-2023, University of Colorado Boulder

/**
 * View of Single Battery
 * The battery is laid out on its side, with the positive pole pointing to the right
 * @author Vasily Shakhov (Mlearner)
 * @author Anton Ulyanov (Mlearner)
 */

import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { LinearGradient, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ohmsLaw from '../../ohmsLaw.js';
import OhmsLawStrings from '../../OhmsLawStrings.js';
import OhmsLawConstants from '../OhmsLawConstants.js';
const voltageUnitsString = OhmsLawStrings.voltageUnits;

// constants
const FONT = new PhetFont({
  size: 19,
  weight: 'bold'
});
const BATTERY_HEIGHT = OhmsLawConstants.BATTERY_HEIGHT;
const NUB_HEIGHT = OhmsLawConstants.BATTERY_HEIGHT * 0.30;

// convert voltage to percentage (0 to 1)
const VOLTAGE_TO_SCALE = new LinearFunction(0.1, OhmsLawConstants.AA_VOLTAGE, 0.0001, 1, true);
const VOLTAGE_STRING_MAX_WIDTH = new Text(Utils.toFixed(OhmsLawConstants.VOLTAGE_RANGE.max, 1), {
  font: FONT
}).width;

// Fills for the battery
const MAIN_BODY_FILL = new LinearGradient(0, 0, 0, BATTERY_HEIGHT).addColorStop(0, '#777777').addColorStop(0.3, '#bdbdbd').addColorStop(1, '#2b2b2b');
const COPPER_PORTION_FILL = new LinearGradient(0, 0, 0, BATTERY_HEIGHT).addColorStop(0, '#cc4e00').addColorStop(0.3, '#dddad6').addColorStop(1, '#cc4e00');
const NUB_FILL = '#dddddd';
class BatteryView extends Node {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      tandem: Tandem.REQUIRED
    }, options);
    super();

    // @private - Determine the width of the batter pieces.
    this.mainBodyWidth = OhmsLawConstants.BATTERY_WIDTH * 0.87; // empirically determined
    const nubWidth = OhmsLawConstants.BATTERY_WIDTH * 0.05; // empirically determined
    const copperPortionWidth = OhmsLawConstants.BATTERY_WIDTH - this.mainBodyWidth - nubWidth;

    // The origin (0,0) is defined as the leftmost and vertically centered position of the battery
    const batteryNode = new Node();

    // @private
    this.mainBody = new Rectangle(0, 0, this.mainBodyWidth, BATTERY_HEIGHT, {
      stroke: '#000',
      fill: MAIN_BODY_FILL,
      y: -BATTERY_HEIGHT / 2
    });
    batteryNode.addChild(this.mainBody);

    // @private
    this.copperPortion = new Rectangle(0, 0, copperPortionWidth, BATTERY_HEIGHT, {
      stroke: '#000',
      fill: COPPER_PORTION_FILL,
      y: -BATTERY_HEIGHT / 2,
      x: this.mainBodyWidth
    });
    batteryNode.addChild(this.copperPortion);

    // @private
    this.nub = new Rectangle(copperPortionWidth, 0, nubWidth, NUB_HEIGHT, {
      stroke: '#000',
      fill: NUB_FILL,
      y: -NUB_HEIGHT / 2,
      x: this.mainBodyWidth
    });
    batteryNode.addChild(this.nub);
    this.addChild(batteryNode);

    // @private - Voltage label associated with the battery
    this.batteryText = new Node({
      x: 3,
      tandem: options.tandem.createTandem('batteryText')
    });

    // @private
    this.voltageValueText = new Text(OhmsLawConstants.AA_VOLTAGE, {
      font: FONT,
      tandem: options.tandem.createTandem('voltageValueText'),
      phetioReadyOnly: true
    });
    this.batteryText.addChild(this.voltageValueText);
    const voltageUnitsText = new Text(voltageUnitsString, {
      font: FONT,
      fill: 'blue',
      x: VOLTAGE_STRING_MAX_WIDTH * 1.1,
      maxWidth: (this.mainBodyWidth - VOLTAGE_STRING_MAX_WIDTH) * 0.9,
      // limit to 90% of remaining space
      tandem: options.tandem.createTandem('voltageUnitsText')
    });
    this.batteryText.addChild(voltageUnitsText);
    this.addChild(this.batteryText);
    this.mutate(options);
  }

  /**
   * Set the length of the battery as well as voltage text and position of the text associated with the battery
   * @param {number} voltage
   * @public
   */
  setVoltage(voltage) {
    // update the voltage readout text
    this.voltageValueText.string = Utils.toFixed(voltage, 1);

    // adjust length of the battery
    this.mainBody.setRect(0, 0, this.mainBodyWidth * VOLTAGE_TO_SCALE.evaluate(voltage), BATTERY_HEIGHT);
    this.copperPortion.x = this.mainBody.right;
    this.nub.x = this.mainBody.right;

    // set vertical position of the voltage label
    if (voltage >= OhmsLawConstants.AA_VOLTAGE) {
      this.batteryText.centerY = -7; // move slightly up from centered position, empirically determined
    }
    // move up if the voltage is greater than 0.1 but less than OhmsLawConstants.AA_VOLTAGE
    else if (voltage >= 0.1) {
      this.batteryText.centerY = -BATTERY_HEIGHT / 2 - 12; // place it above the battery
    }
  }
}

ohmsLaw.register('BatteryView', BatteryView);
export default BatteryView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaW5lYXJGdW5jdGlvbiIsIlV0aWxzIiwibWVyZ2UiLCJQaGV0Rm9udCIsIkxpbmVhckdyYWRpZW50IiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJUYW5kZW0iLCJvaG1zTGF3IiwiT2htc0xhd1N0cmluZ3MiLCJPaG1zTGF3Q29uc3RhbnRzIiwidm9sdGFnZVVuaXRzU3RyaW5nIiwidm9sdGFnZVVuaXRzIiwiRk9OVCIsInNpemUiLCJ3ZWlnaHQiLCJCQVRURVJZX0hFSUdIVCIsIk5VQl9IRUlHSFQiLCJWT0xUQUdFX1RPX1NDQUxFIiwiQUFfVk9MVEFHRSIsIlZPTFRBR0VfU1RSSU5HX01BWF9XSURUSCIsInRvRml4ZWQiLCJWT0xUQUdFX1JBTkdFIiwibWF4IiwiZm9udCIsIndpZHRoIiwiTUFJTl9CT0RZX0ZJTEwiLCJhZGRDb2xvclN0b3AiLCJDT1BQRVJfUE9SVElPTl9GSUxMIiwiTlVCX0ZJTEwiLCJCYXR0ZXJ5VmlldyIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsInRhbmRlbSIsIlJFUVVJUkVEIiwibWFpbkJvZHlXaWR0aCIsIkJBVFRFUllfV0lEVEgiLCJudWJXaWR0aCIsImNvcHBlclBvcnRpb25XaWR0aCIsImJhdHRlcnlOb2RlIiwibWFpbkJvZHkiLCJzdHJva2UiLCJmaWxsIiwieSIsImFkZENoaWxkIiwiY29wcGVyUG9ydGlvbiIsIngiLCJudWIiLCJiYXR0ZXJ5VGV4dCIsImNyZWF0ZVRhbmRlbSIsInZvbHRhZ2VWYWx1ZVRleHQiLCJwaGV0aW9SZWFkeU9ubHkiLCJ2b2x0YWdlVW5pdHNUZXh0IiwibWF4V2lkdGgiLCJtdXRhdGUiLCJzZXRWb2x0YWdlIiwidm9sdGFnZSIsInN0cmluZyIsInNldFJlY3QiLCJldmFsdWF0ZSIsInJpZ2h0IiwiY2VudGVyWSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQmF0dGVyeVZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldyBvZiBTaW5nbGUgQmF0dGVyeVxyXG4gKiBUaGUgYmF0dGVyeSBpcyBsYWlkIG91dCBvbiBpdHMgc2lkZSwgd2l0aCB0aGUgcG9zaXRpdmUgcG9sZSBwb2ludGluZyB0byB0aGUgcmlnaHRcclxuICogQGF1dGhvciBWYXNpbHkgU2hha2hvdiAoTWxlYXJuZXIpXHJcbiAqIEBhdXRob3IgQW50b24gVWx5YW5vdiAoTWxlYXJuZXIpXHJcbiAqL1xyXG5cclxuaW1wb3J0IExpbmVhckZ1bmN0aW9uIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9MaW5lYXJGdW5jdGlvbi5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IExpbmVhckdyYWRpZW50LCBOb2RlLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgb2htc0xhdyBmcm9tICcuLi8uLi9vaG1zTGF3LmpzJztcclxuaW1wb3J0IE9obXNMYXdTdHJpbmdzIGZyb20gJy4uLy4uL09obXNMYXdTdHJpbmdzLmpzJztcclxuaW1wb3J0IE9obXNMYXdDb25zdGFudHMgZnJvbSAnLi4vT2htc0xhd0NvbnN0YW50cy5qcyc7XHJcblxyXG5jb25zdCB2b2x0YWdlVW5pdHNTdHJpbmcgPSBPaG1zTGF3U3RyaW5ncy52b2x0YWdlVW5pdHM7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAxOSwgd2VpZ2h0OiAnYm9sZCcgfSApO1xyXG5jb25zdCBCQVRURVJZX0hFSUdIVCA9IE9obXNMYXdDb25zdGFudHMuQkFUVEVSWV9IRUlHSFQ7XHJcbmNvbnN0IE5VQl9IRUlHSFQgPSBPaG1zTGF3Q29uc3RhbnRzLkJBVFRFUllfSEVJR0hUICogMC4zMDtcclxuXHJcbi8vIGNvbnZlcnQgdm9sdGFnZSB0byBwZXJjZW50YWdlICgwIHRvIDEpXHJcbmNvbnN0IFZPTFRBR0VfVE9fU0NBTEUgPSBuZXcgTGluZWFyRnVuY3Rpb24oIDAuMSwgT2htc0xhd0NvbnN0YW50cy5BQV9WT0xUQUdFLCAwLjAwMDEsIDEsIHRydWUgKTtcclxuY29uc3QgVk9MVEFHRV9TVFJJTkdfTUFYX1dJRFRIID0gbmV3IFRleHQoIFV0aWxzLnRvRml4ZWQoIE9obXNMYXdDb25zdGFudHMuVk9MVEFHRV9SQU5HRS5tYXgsIDEgKSwgeyBmb250OiBGT05UIH0gKS53aWR0aDtcclxuXHJcbi8vIEZpbGxzIGZvciB0aGUgYmF0dGVyeVxyXG5jb25zdCBNQUlOX0JPRFlfRklMTCA9IG5ldyBMaW5lYXJHcmFkaWVudCggMCwgMCwgMCwgQkFUVEVSWV9IRUlHSFQgKVxyXG4gIC5hZGRDb2xvclN0b3AoIDAsICcjNzc3Nzc3JyApXHJcbiAgLmFkZENvbG9yU3RvcCggMC4zLCAnI2JkYmRiZCcgKVxyXG4gIC5hZGRDb2xvclN0b3AoIDEsICcjMmIyYjJiJyApO1xyXG5jb25zdCBDT1BQRVJfUE9SVElPTl9GSUxMID0gbmV3IExpbmVhckdyYWRpZW50KCAwLCAwLCAwLCBCQVRURVJZX0hFSUdIVCApXHJcbiAgLmFkZENvbG9yU3RvcCggMCwgJyNjYzRlMDAnIClcclxuICAuYWRkQ29sb3JTdG9wKCAwLjMsICcjZGRkYWQ2JyApXHJcbiAgLmFkZENvbG9yU3RvcCggMSwgJyNjYzRlMDAnICk7XHJcbmNvbnN0IE5VQl9GSUxMID0gJyNkZGRkZGQnO1xyXG5cclxuY2xhc3MgQmF0dGVyeVZpZXcgZXh0ZW5kcyBOb2RlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIERldGVybWluZSB0aGUgd2lkdGggb2YgdGhlIGJhdHRlciBwaWVjZXMuXHJcbiAgICB0aGlzLm1haW5Cb2R5V2lkdGggPSBPaG1zTGF3Q29uc3RhbnRzLkJBVFRFUllfV0lEVEggKiAwLjg3OyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICBjb25zdCBudWJXaWR0aCA9IE9obXNMYXdDb25zdGFudHMuQkFUVEVSWV9XSURUSCAqIDAuMDU7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuICAgIGNvbnN0IGNvcHBlclBvcnRpb25XaWR0aCA9IE9obXNMYXdDb25zdGFudHMuQkFUVEVSWV9XSURUSCAtIHRoaXMubWFpbkJvZHlXaWR0aCAtIG51YldpZHRoO1xyXG5cclxuICAgIC8vIFRoZSBvcmlnaW4gKDAsMCkgaXMgZGVmaW5lZCBhcyB0aGUgbGVmdG1vc3QgYW5kIHZlcnRpY2FsbHkgY2VudGVyZWQgcG9zaXRpb24gb2YgdGhlIGJhdHRlcnlcclxuICAgIGNvbnN0IGJhdHRlcnlOb2RlID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5tYWluQm9keSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIHRoaXMubWFpbkJvZHlXaWR0aCwgQkFUVEVSWV9IRUlHSFQsIHtcclxuICAgICAgc3Ryb2tlOiAnIzAwMCcsXHJcbiAgICAgIGZpbGw6IE1BSU5fQk9EWV9GSUxMLFxyXG4gICAgICB5OiAtQkFUVEVSWV9IRUlHSFQgLyAyXHJcbiAgICB9ICk7XHJcbiAgICBiYXR0ZXJ5Tm9kZS5hZGRDaGlsZCggdGhpcy5tYWluQm9keSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmNvcHBlclBvcnRpb24gPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBjb3BwZXJQb3J0aW9uV2lkdGgsIEJBVFRFUllfSEVJR0hULCB7XHJcbiAgICAgIHN0cm9rZTogJyMwMDAnLFxyXG4gICAgICBmaWxsOiBDT1BQRVJfUE9SVElPTl9GSUxMLFxyXG4gICAgICB5OiAtQkFUVEVSWV9IRUlHSFQgLyAyLFxyXG4gICAgICB4OiB0aGlzLm1haW5Cb2R5V2lkdGhcclxuICAgIH0gKTtcclxuICAgIGJhdHRlcnlOb2RlLmFkZENoaWxkKCB0aGlzLmNvcHBlclBvcnRpb24gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5udWIgPSBuZXcgUmVjdGFuZ2xlKCBjb3BwZXJQb3J0aW9uV2lkdGgsIDAsIG51YldpZHRoLCBOVUJfSEVJR0hULCB7XHJcbiAgICAgIHN0cm9rZTogJyMwMDAnLFxyXG4gICAgICBmaWxsOiBOVUJfRklMTCxcclxuICAgICAgeTogLU5VQl9IRUlHSFQgLyAyLFxyXG4gICAgICB4OiB0aGlzLm1haW5Cb2R5V2lkdGhcclxuICAgIH0gKTtcclxuICAgIGJhdHRlcnlOb2RlLmFkZENoaWxkKCB0aGlzLm51YiApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJhdHRlcnlOb2RlICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBWb2x0YWdlIGxhYmVsIGFzc29jaWF0ZWQgd2l0aCB0aGUgYmF0dGVyeVxyXG4gICAgdGhpcy5iYXR0ZXJ5VGV4dCA9IG5ldyBOb2RlKCB7IHg6IDMsIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYmF0dGVyeVRleHQnICkgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLnZvbHRhZ2VWYWx1ZVRleHQgPSBuZXcgVGV4dCggT2htc0xhd0NvbnN0YW50cy5BQV9WT0xUQUdFLCB7XHJcbiAgICAgIGZvbnQ6IEZPTlQsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndm9sdGFnZVZhbHVlVGV4dCcgKSxcclxuICAgICAgcGhldGlvUmVhZHlPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmJhdHRlcnlUZXh0LmFkZENoaWxkKCB0aGlzLnZvbHRhZ2VWYWx1ZVRleHQgKTtcclxuXHJcbiAgICBjb25zdCB2b2x0YWdlVW5pdHNUZXh0ID0gbmV3IFRleHQoIHZvbHRhZ2VVbml0c1N0cmluZywge1xyXG4gICAgICBmb250OiBGT05ULFxyXG4gICAgICBmaWxsOiAnYmx1ZScsXHJcbiAgICAgIHg6IFZPTFRBR0VfU1RSSU5HX01BWF9XSURUSCAqIDEuMSxcclxuICAgICAgbWF4V2lkdGg6ICggdGhpcy5tYWluQm9keVdpZHRoIC0gVk9MVEFHRV9TVFJJTkdfTUFYX1dJRFRIICkgKiAwLjksIC8vIGxpbWl0IHRvIDkwJSBvZiByZW1haW5pbmcgc3BhY2VcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd2b2x0YWdlVW5pdHNUZXh0JyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmJhdHRlcnlUZXh0LmFkZENoaWxkKCB2b2x0YWdlVW5pdHNUZXh0ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5iYXR0ZXJ5VGV4dCApO1xyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGxlbmd0aCBvZiB0aGUgYmF0dGVyeSBhcyB3ZWxsIGFzIHZvbHRhZ2UgdGV4dCBhbmQgcG9zaXRpb24gb2YgdGhlIHRleHQgYXNzb2NpYXRlZCB3aXRoIHRoZSBiYXR0ZXJ5XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZvbHRhZ2VcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0Vm9sdGFnZSggdm9sdGFnZSApIHtcclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIHZvbHRhZ2UgcmVhZG91dCB0ZXh0XHJcbiAgICB0aGlzLnZvbHRhZ2VWYWx1ZVRleHQuc3RyaW5nID0gVXRpbHMudG9GaXhlZCggdm9sdGFnZSwgMSApO1xyXG5cclxuICAgIC8vIGFkanVzdCBsZW5ndGggb2YgdGhlIGJhdHRlcnlcclxuICAgIHRoaXMubWFpbkJvZHkuc2V0UmVjdCggMCwgMCwgdGhpcy5tYWluQm9keVdpZHRoICogVk9MVEFHRV9UT19TQ0FMRS5ldmFsdWF0ZSggdm9sdGFnZSApLCBCQVRURVJZX0hFSUdIVCApO1xyXG4gICAgdGhpcy5jb3BwZXJQb3J0aW9uLnggPSB0aGlzLm1haW5Cb2R5LnJpZ2h0O1xyXG4gICAgdGhpcy5udWIueCA9IHRoaXMubWFpbkJvZHkucmlnaHQ7XHJcblxyXG4gICAgLy8gc2V0IHZlcnRpY2FsIHBvc2l0aW9uIG9mIHRoZSB2b2x0YWdlIGxhYmVsXHJcbiAgICBpZiAoIHZvbHRhZ2UgPj0gT2htc0xhd0NvbnN0YW50cy5BQV9WT0xUQUdFICkge1xyXG4gICAgICB0aGlzLmJhdHRlcnlUZXh0LmNlbnRlclkgPSAtNzsgLy8gbW92ZSBzbGlnaHRseSB1cCBmcm9tIGNlbnRlcmVkIHBvc2l0aW9uLCBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICB9XHJcbiAgICAvLyBtb3ZlIHVwIGlmIHRoZSB2b2x0YWdlIGlzIGdyZWF0ZXIgdGhhbiAwLjEgYnV0IGxlc3MgdGhhbiBPaG1zTGF3Q29uc3RhbnRzLkFBX1ZPTFRBR0VcclxuICAgIGVsc2UgaWYgKCB2b2x0YWdlID49IDAuMSApIHtcclxuICAgICAgdGhpcy5iYXR0ZXJ5VGV4dC5jZW50ZXJZID0gLUJBVFRFUllfSEVJR0hUIC8gMiAtIDEyOyAvLyBwbGFjZSBpdCBhYm92ZSB0aGUgYmF0dGVyeVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxub2htc0xhdy5yZWdpc3RlciggJ0JhdHRlcnlWaWV3JywgQmF0dGVyeVZpZXcgKTtcclxuXHJcbmV4cG9ydCBkZWZh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