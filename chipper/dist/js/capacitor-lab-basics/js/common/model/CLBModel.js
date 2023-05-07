// Copyright 2015-2022, University of Colorado Boulder

/**
 * Base model for Capacitor Lab: Basics.  This gets extended by CLBLightBulbModel and CapacitanceModel.
 * This base model holds high level view properties that are shared by both screens.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import CapacitorConstants from '../../../../scenery-phet/js/capacitor/CapacitorConstants.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import Stopwatch from '../../../../scenery-phet/js/Stopwatch.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import { Color } from '../../../../scenery/js/imports.js';
import capacitorLabBasics from '../../capacitorLabBasics.js';
import CLBConstants from '../CLBConstants.js';
import Voltmeter from './meter/Voltmeter.js';

// constants
// reference coordinate frame size for world nodes
const CANVAS_RENDERING_SIZE = new Dimension2(1024, 618);

// TODO: Move color out of the model?!?!?!
const CURRENT_ELECTRONS_ARROW_COLOR = new Color(83, 200, 236);
const CURRENT_CONVENTIONAL_ARROW_COLOR = new Color(PhetColorScheme.RED_COLORBLIND);
class CLBModel {
  /**
   * @param {ParallelCircuit} circuit
   * @param {Property.<boolean>} switchUsedProperty - whether switch has been changed by user. Affects both screens.
   * @param {YawPitchModelViewTransform3} modelViewTransform
   * @param {Tandem} tandem
   */
  constructor(circuit, switchUsedProperty, modelViewTransform, tandem) {
    // @public {Property.<boolean>}
    this.switchUsedProperty = switchUsedProperty;

    // @public {CapacitanceCircuit}
    this.circuit = circuit;

    // @public {YawPitchModelViewTransform3} (read-only)
    this.modelViewTransform = modelViewTransform;

    // @public {Property.<boolean>}
    this.plateChargesVisibleProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('plateChargesVisibleProperty')
    });

    // @public {Property.<boolean>}
    this.electricFieldVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('electricFieldVisibleProperty')
    });

    // @public {Property.<boolean>}
    this.capacitanceMeterVisibleProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('capacitanceMeterVisibleProperty')
    });

    // @public {Property.<boolean>}
    this.topPlateChargeMeterVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('topPlateChargeMeterVisibleProperty')
    });

    // @public {Property.<boolean>}
    this.storedEnergyMeterVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('storedEnergyMeterVisibleProperty')
    });

    // @public {Property.<boolean>}
    this.barGraphsVisibleProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('barGraphsVisibleProperty')
    });

    // @public {Property.<boolean>}
    this.voltmeterVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('voltmeterVisibleProperty')
    });

    // @public {Property.<boolean>}
    this.currentVisibleProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('currentVisibleProperty')
    });

    // @public {Property.<boolean>}
    this.currentOrientationProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('currentOrientationProperty')
    });

    // @public {Property.<Color>}
    this.arrowColorProperty = new DerivedProperty([this.currentOrientationProperty], value => {
      if (value === 0) {
        return CURRENT_ELECTRONS_ARROW_COLOR;
      } else {
        return CURRENT_CONVENTIONAL_ARROW_COLOR;
      }
    }, {
      tandem: tandem.createTandem('arrowColorProperty'),
      phetioValueType: Color.ColorIO
    });

    // @public {Property.<boolean>} Whether the sim is paused
    this.isPlayingProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('isPlayingProperty')
    });

    // @public {Stopwatch}
    this.stopwatch = new Stopwatch({
      timePropertyOptions: {
        range: Stopwatch.ZERO_TO_ALMOST_SIXTY
      },
      tandem: tandem.createTandem('stopwatch')
    });

    // @public {Property.<TimeSpeed>}
    this.timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);

    // @public {Emitter}
    this.stepEmitter = new Emitter({
      parameters: [{
        valueType: 'number'
      }]
    });

    // @private {Bounds2}
    this.worldBounds = CANVAS_RENDERING_SIZE.toBounds();

    // @public {Voltmeter}
    this.voltmeter = new Voltmeter(this.circuit, this.worldBounds, modelViewTransform, this.voltmeterVisibleProperty, tandem.createTandem('voltmeter'));
    this.circuit.maxPlateCharge = this.getMaxPlateCharge();
    this.circuit.maxEffectiveEField = this.getMaxEffectiveEField();
  }

  /**
   * Compute maximum possible charge on the top plate as
   *
   * Q_max = (epsilon_0 * A_max / d_min) * V_max
   *
   * where A is the plate area, d is the plate separation, and V is the battery voltage.
   * @public
   *
   * @returns {number} charge in Coulombs
   */
  getMaxPlateCharge() {
    const maxArea = CapacitorConstants.PLATE_WIDTH_RANGE.max * CapacitorConstants.PLATE_WIDTH_RANGE.max;
    const maxVoltage = CLBConstants.BATTERY_VOLTAGE_RANGE.max;
    return CLBConstants.EPSILON_0 * maxArea * maxVoltage / CapacitorConstants.PLATE_SEPARATION_RANGE.min;
  }

  /**
   * Compute maximum possible E-field in the capacitor as
   *
   * E_max = Q_max / (epsilon_0 * A_min)
   *       = (A_max / A_min) * V_max / d_min
   *
   * where A is the plate area, d is the plate separation, and V is the battery voltage.
   * @public
   *
   * @returns {number} E-field in V/m
   */
  getMaxEffectiveEField() {
    const maxArea = CapacitorConstants.PLATE_WIDTH_RANGE.max * CapacitorConstants.PLATE_WIDTH_RANGE.max;
    const minArea = CapacitorConstants.PLATE_WIDTH_RANGE.min * CapacitorConstants.PLATE_WIDTH_RANGE.min;
    return maxArea / minArea * CLBConstants.BATTERY_VOLTAGE_RANGE.max / CapacitorConstants.PLATE_SEPARATION_RANGE.min;
  }

  /**
   * Step function for the CLBModel.
   * @public
   *
   * @param {number} dt
   * @param {boolean} isManual
   */
  step(dt, isManual) {
    if (this.isPlayingProperty.value || isManual) {
      // If a manual step is called the dt should be the same a normal dt value.
      const adjustedDt = isManual ? dt : dt * (this.timeSpeedProperty.value === TimeSpeed.SLOW ? 0.125 : 1);
      this.circuit.step(adjustedDt);
      this.stepEmitter.emit(adjustedDt);
      this.stopwatch.step(adjustedDt);
    }
  }

  /**
   * Manually steps forward in time.
   * @public
   */
  manualStep() {
    this.step(0.2, true);
  }

  // @public
  reset() {
    this.plateChargesVisibleProperty.reset();
    this.electricFieldVisibleProperty.reset();
    this.capacitanceMeterVisibleProperty.reset();
    this.barGraphsVisibleProperty.reset();
    this.voltmeterVisibleProperty.reset();
    this.currentVisibleProperty.reset();
    this.currentOrientationProperty.reset();
    this.switchUsedProperty.reset();
    this.isPlayingProperty.reset();
    this.timeSpeedProperty.reset();
    this.stopwatch.reset();
  }
}
capacitorLabBasics.register('CLBModel', CLBModel);
export default CLBModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiRW51bWVyYXRpb25Qcm9wZXJ0eSIsIk51bWJlclByb3BlcnR5IiwiRGltZW5zaW9uMiIsIkNhcGFjaXRvckNvbnN0YW50cyIsIlBoZXRDb2xvclNjaGVtZSIsIlN0b3B3YXRjaCIsIlRpbWVTcGVlZCIsIkNvbG9yIiwiY2FwYWNpdG9yTGFiQmFzaWNzIiwiQ0xCQ29uc3RhbnRzIiwiVm9sdG1ldGVyIiwiQ0FOVkFTX1JFTkRFUklOR19TSVpFIiwiQ1VSUkVOVF9FTEVDVFJPTlNfQVJST1dfQ09MT1IiLCJDVVJSRU5UX0NPTlZFTlRJT05BTF9BUlJPV19DT0xPUiIsIlJFRF9DT0xPUkJMSU5EIiwiQ0xCTW9kZWwiLCJjb25zdHJ1Y3RvciIsImNpcmN1aXQiLCJzd2l0Y2hVc2VkUHJvcGVydHkiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJ0YW5kZW0iLCJwbGF0ZUNoYXJnZXNWaXNpYmxlUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJlbGVjdHJpY0ZpZWxkVmlzaWJsZVByb3BlcnR5IiwiY2FwYWNpdGFuY2VNZXRlclZpc2libGVQcm9wZXJ0eSIsInRvcFBsYXRlQ2hhcmdlTWV0ZXJWaXNpYmxlUHJvcGVydHkiLCJzdG9yZWRFbmVyZ3lNZXRlclZpc2libGVQcm9wZXJ0eSIsImJhckdyYXBoc1Zpc2libGVQcm9wZXJ0eSIsInZvbHRtZXRlclZpc2libGVQcm9wZXJ0eSIsImN1cnJlbnRWaXNpYmxlUHJvcGVydHkiLCJjdXJyZW50T3JpZW50YXRpb25Qcm9wZXJ0eSIsImFycm93Q29sb3JQcm9wZXJ0eSIsInZhbHVlIiwicGhldGlvVmFsdWVUeXBlIiwiQ29sb3JJTyIsImlzUGxheWluZ1Byb3BlcnR5Iiwic3RvcHdhdGNoIiwidGltZVByb3BlcnR5T3B0aW9ucyIsInJhbmdlIiwiWkVST19UT19BTE1PU1RfU0lYVFkiLCJ0aW1lU3BlZWRQcm9wZXJ0eSIsIk5PUk1BTCIsInN0ZXBFbWl0dGVyIiwicGFyYW1ldGVycyIsInZhbHVlVHlwZSIsIndvcmxkQm91bmRzIiwidG9Cb3VuZHMiLCJ2b2x0bWV0ZXIiLCJtYXhQbGF0ZUNoYXJnZSIsImdldE1heFBsYXRlQ2hhcmdlIiwibWF4RWZmZWN0aXZlRUZpZWxkIiwiZ2V0TWF4RWZmZWN0aXZlRUZpZWxkIiwibWF4QXJlYSIsIlBMQVRFX1dJRFRIX1JBTkdFIiwibWF4IiwibWF4Vm9sdGFnZSIsIkJBVFRFUllfVk9MVEFHRV9SQU5HRSIsIkVQU0lMT05fMCIsIlBMQVRFX1NFUEFSQVRJT05fUkFOR0UiLCJtaW4iLCJtaW5BcmVhIiwic3RlcCIsImR0IiwiaXNNYW51YWwiLCJhZGp1c3RlZER0IiwiU0xPVyIsImVtaXQiLCJtYW51YWxTdGVwIiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNMQk1vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJhc2UgbW9kZWwgZm9yIENhcGFjaXRvciBMYWI6IEJhc2ljcy4gIFRoaXMgZ2V0cyBleHRlbmRlZCBieSBDTEJMaWdodEJ1bGJNb2RlbCBhbmQgQ2FwYWNpdGFuY2VNb2RlbC5cclxuICogVGhpcyBiYXNlIG1vZGVsIGhvbGRzIGhpZ2ggbGV2ZWwgdmlldyBwcm9wZXJ0aWVzIHRoYXQgYXJlIHNoYXJlZCBieSBib3RoIHNjcmVlbnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEFuZHJldyBBZGFyZSAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgQ2FwYWNpdG9yQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9jYXBhY2l0b3IvQ2FwYWNpdG9yQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFBoZXRDb2xvclNjaGVtZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldENvbG9yU2NoZW1lLmpzJztcclxuaW1wb3J0IFN0b3B3YXRjaCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU3RvcHdhdGNoLmpzJztcclxuaW1wb3J0IFRpbWVTcGVlZCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVGltZVNwZWVkLmpzJztcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY2FwYWNpdG9yTGFiQmFzaWNzIGZyb20gJy4uLy4uL2NhcGFjaXRvckxhYkJhc2ljcy5qcyc7XHJcbmltcG9ydCBDTEJDb25zdGFudHMgZnJvbSAnLi4vQ0xCQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFZvbHRtZXRlciBmcm9tICcuL21ldGVyL1ZvbHRtZXRlci5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuLy8gcmVmZXJlbmNlIGNvb3JkaW5hdGUgZnJhbWUgc2l6ZSBmb3Igd29ybGQgbm9kZXNcclxuY29uc3QgQ0FOVkFTX1JFTkRFUklOR19TSVpFID0gbmV3IERpbWVuc2lvbjIoIDEwMjQsIDYxOCApO1xyXG5cclxuLy8gVE9ETzogTW92ZSBjb2xvciBvdXQgb2YgdGhlIG1vZGVsPyE/IT8hXHJcbmNvbnN0IENVUlJFTlRfRUxFQ1RST05TX0FSUk9XX0NPTE9SID0gbmV3IENvbG9yKCA4MywgMjAwLCAyMzYgKTtcclxuY29uc3QgQ1VSUkVOVF9DT05WRU5USU9OQUxfQVJST1dfQ09MT1IgPSBuZXcgQ29sb3IoIFBoZXRDb2xvclNjaGVtZS5SRURfQ09MT1JCTElORCApO1xyXG5cclxuY2xhc3MgQ0xCTW9kZWwge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UGFyYWxsZWxDaXJjdWl0fSBjaXJjdWl0XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHN3aXRjaFVzZWRQcm9wZXJ0eSAtIHdoZXRoZXIgc3dpdGNoIGhhcyBiZWVuIGNoYW5nZWQgYnkgdXNlci4gQWZmZWN0cyBib3RoIHNjcmVlbnMuXHJcbiAgICogQHBhcmFtIHtZYXdQaXRjaE1vZGVsVmlld1RyYW5zZm9ybTN9IG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggY2lyY3VpdCwgc3dpdGNoVXNlZFByb3BlcnR5LCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHRhbmRlbSApIHtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59XHJcbiAgICB0aGlzLnN3aXRjaFVzZWRQcm9wZXJ0eSA9IHN3aXRjaFVzZWRQcm9wZXJ0eTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtDYXBhY2l0YW5jZUNpcmN1aXR9XHJcbiAgICB0aGlzLmNpcmN1aXQgPSBjaXJjdWl0O1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1lhd1BpdGNoTW9kZWxWaWV3VHJhbnNmb3JtM30gKHJlYWQtb25seSlcclxuICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtID0gbW9kZWxWaWV3VHJhbnNmb3JtO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn1cclxuICAgIHRoaXMucGxhdGVDaGFyZ2VzVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwbGF0ZUNoYXJnZXNWaXNpYmxlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59XHJcbiAgICB0aGlzLmVsZWN0cmljRmllbGRWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVjdHJpY0ZpZWxkVmlzaWJsZVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fVxyXG4gICAgdGhpcy5jYXBhY2l0YW5jZU1ldGVyVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjYXBhY2l0YW5jZU1ldGVyVmlzaWJsZVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fVxyXG4gICAgdGhpcy50b3BQbGF0ZUNoYXJnZU1ldGVyVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndG9wUGxhdGVDaGFyZ2VNZXRlclZpc2libGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn1cclxuICAgIHRoaXMuc3RvcmVkRW5lcmd5TWV0ZXJWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzdG9yZWRFbmVyZ3lNZXRlclZpc2libGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn1cclxuICAgIHRoaXMuYmFyR3JhcGhzVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdiYXJHcmFwaHNWaXNpYmxlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59XHJcbiAgICB0aGlzLnZvbHRtZXRlclZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZvbHRtZXRlclZpc2libGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn1cclxuICAgIHRoaXMuY3VycmVudFZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY3VycmVudFZpc2libGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn1cclxuICAgIHRoaXMuY3VycmVudE9yaWVudGF0aW9uUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY3VycmVudE9yaWVudGF0aW9uUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Q29sb3I+fVxyXG4gICAgdGhpcy5hcnJvd0NvbG9yUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMuY3VycmVudE9yaWVudGF0aW9uUHJvcGVydHkgXSwgdmFsdWUgPT4ge1xyXG4gICAgICBpZiAoIHZhbHVlID09PSAwICkge1xyXG4gICAgICAgIHJldHVybiBDVVJSRU5UX0VMRUNUUk9OU19BUlJPV19DT0xPUjtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gQ1VSUkVOVF9DT05WRU5USU9OQUxfQVJST1dfQ09MT1I7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYXJyb3dDb2xvclByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IENvbG9yLkNvbG9ySU9cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IFdoZXRoZXIgdGhlIHNpbSBpcyBwYXVzZWRcclxuICAgIHRoaXMuaXNQbGF5aW5nUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2lzUGxheWluZ1Byb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7U3RvcHdhdGNofVxyXG4gICAgdGhpcy5zdG9wd2F0Y2ggPSBuZXcgU3RvcHdhdGNoKCB7XHJcbiAgICAgIHRpbWVQcm9wZXJ0eU9wdGlvbnM6IHtcclxuICAgICAgICByYW5nZTogU3RvcHdhdGNoLlpFUk9fVE9fQUxNT1NUX1NJWFRZXHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N0b3B3YXRjaCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxUaW1lU3BlZWQ+fVxyXG4gICAgdGhpcy50aW1lU3BlZWRQcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvblByb3BlcnR5KCBUaW1lU3BlZWQuTk9STUFMICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7RW1pdHRlcn1cclxuICAgIHRoaXMuc3RlcEVtaXR0ZXIgPSBuZXcgRW1pdHRlciggeyBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiAnbnVtYmVyJyB9IF0gfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtCb3VuZHMyfVxyXG4gICAgdGhpcy53b3JsZEJvdW5kcyA9IENBTlZBU19SRU5ERVJJTkdfU0laRS50b0JvdW5kcygpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1ZvbHRtZXRlcn1cclxuICAgIHRoaXMudm9sdG1ldGVyID0gbmV3IFZvbHRtZXRlciggdGhpcy5jaXJjdWl0LCB0aGlzLndvcmxkQm91bmRzLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHRoaXMudm9sdG1ldGVyVmlzaWJsZVByb3BlcnR5LCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndm9sdG1ldGVyJyApICk7XHJcblxyXG4gICAgdGhpcy5jaXJjdWl0Lm1heFBsYXRlQ2hhcmdlID0gdGhpcy5nZXRNYXhQbGF0ZUNoYXJnZSgpO1xyXG4gICAgdGhpcy5jaXJjdWl0Lm1heEVmZmVjdGl2ZUVGaWVsZCA9IHRoaXMuZ2V0TWF4RWZmZWN0aXZlRUZpZWxkKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21wdXRlIG1heGltdW0gcG9zc2libGUgY2hhcmdlIG9uIHRoZSB0b3AgcGxhdGUgYXNcclxuICAgKlxyXG4gICAqIFFfbWF4ID0gKGVwc2lsb25fMCAqIEFfbWF4IC8gZF9taW4pICogVl9tYXhcclxuICAgKlxyXG4gICAqIHdoZXJlIEEgaXMgdGhlIHBsYXRlIGFyZWEsIGQgaXMgdGhlIHBsYXRlIHNlcGFyYXRpb24sIGFuZCBWIGlzIHRoZSBiYXR0ZXJ5IHZvbHRhZ2UuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn0gY2hhcmdlIGluIENvdWxvbWJzXHJcbiAgICovXHJcbiAgZ2V0TWF4UGxhdGVDaGFyZ2UoKSB7XHJcblxyXG4gICAgY29uc3QgbWF4QXJlYSA9IENhcGFjaXRvckNvbnN0YW50cy5QTEFURV9XSURUSF9SQU5HRS5tYXggKiBDYXBhY2l0b3JDb25zdGFudHMuUExBVEVfV0lEVEhfUkFOR0UubWF4O1xyXG4gICAgY29uc3QgbWF4Vm9sdGFnZSA9IENMQkNvbnN0YW50cy5CQVRURVJZX1ZPTFRBR0VfUkFOR0UubWF4O1xyXG5cclxuICAgIHJldHVybiBDTEJDb25zdGFudHMuRVBTSUxPTl8wICogbWF4QXJlYSAqIG1heFZvbHRhZ2UgLyBDYXBhY2l0b3JDb25zdGFudHMuUExBVEVfU0VQQVJBVElPTl9SQU5HRS5taW47XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21wdXRlIG1heGltdW0gcG9zc2libGUgRS1maWVsZCBpbiB0aGUgY2FwYWNpdG9yIGFzXHJcbiAgICpcclxuICAgKiBFX21heCA9IFFfbWF4IC8gKGVwc2lsb25fMCAqIEFfbWluKVxyXG4gICAqICAgICAgID0gKEFfbWF4IC8gQV9taW4pICogVl9tYXggLyBkX21pblxyXG4gICAqXHJcbiAgICogd2hlcmUgQSBpcyB0aGUgcGxhdGUgYXJlYSwgZCBpcyB0aGUgcGxhdGUgc2VwYXJhdGlvbiwgYW5kIFYgaXMgdGhlIGJhdHRlcnkgdm9sdGFnZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBFLWZpZWxkIGluIFYvbVxyXG4gICAqL1xyXG4gIGdldE1heEVmZmVjdGl2ZUVGaWVsZCgpIHtcclxuXHJcbiAgICBjb25zdCBtYXhBcmVhID0gQ2FwYWNpdG9yQ29uc3RhbnRzLlBMQVRFX1dJRFRIX1JBTkdFLm1heCAqIENhcGFjaXRvckNvbnN0YW50cy5QTEFURV9XSURUSF9SQU5HRS5tYXg7XHJcbiAgICBjb25zdCBtaW5BcmVhID0gQ2FwYWNpdG9yQ29uc3RhbnRzLlBMQVRFX1dJRFRIX1JBTkdFLm1pbiAqIENhcGFjaXRvckNvbnN0YW50cy5QTEFURV9XSURUSF9SQU5HRS5taW47XHJcblxyXG4gICAgcmV0dXJuIG1heEFyZWEgLyBtaW5BcmVhICogQ0xCQ29uc3RhbnRzLkJBVFRFUllfVk9MVEFHRV9SQU5HRS5tYXggLyBDYXBhY2l0b3JDb25zdGFudHMuUExBVEVfU0VQQVJBVElPTl9SQU5HRS5taW47XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwIGZ1bmN0aW9uIGZvciB0aGUgQ0xCTW9kZWwuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICogQHBhcmFtIHtib29sZWFufSBpc01hbnVhbFxyXG4gICAqL1xyXG4gIHN0ZXAoIGR0LCBpc01hbnVhbCApIHtcclxuICAgIGlmICggdGhpcy5pc1BsYXlpbmdQcm9wZXJ0eS52YWx1ZSB8fCBpc01hbnVhbCApIHtcclxuXHJcbiAgICAgIC8vIElmIGEgbWFudWFsIHN0ZXAgaXMgY2FsbGVkIHRoZSBkdCBzaG91bGQgYmUgdGhlIHNhbWUgYSBub3JtYWwgZHQgdmFsdWUuXHJcbiAgICAgIGNvbnN0IGFkanVzdGVkRHQgPSBpc01hbnVhbCA/IGR0IDogZHQgKiAoIHRoaXMudGltZVNwZWVkUHJvcGVydHkudmFsdWUgPT09IFRpbWVTcGVlZC5TTE9XID8gMC4xMjUgOiAxICk7XHJcbiAgICAgIHRoaXMuY2lyY3VpdC5zdGVwKCBhZGp1c3RlZER0ICk7XHJcbiAgICAgIHRoaXMuc3RlcEVtaXR0ZXIuZW1pdCggYWRqdXN0ZWREdCApO1xyXG4gICAgICB0aGlzLnN0b3B3YXRjaC5zdGVwKCBhZGp1c3RlZER0ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYW51YWxseSBzdGVwcyBmb3J3YXJkIGluIHRpbWUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIG1hbnVhbFN0ZXAoKSB7XHJcbiAgICB0aGlzLnN0ZXAoIDAuMiwgdHJ1ZSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5wbGF0ZUNoYXJnZXNWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZWxlY3RyaWNGaWVsZFZpc2libGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5jYXBhY2l0YW5jZU1ldGVyVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmJhckdyYXBoc1Zpc2libGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy52b2x0bWV0ZXJWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuY3VycmVudFZpc2libGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5jdXJyZW50T3JpZW50YXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zd2l0Y2hVc2VkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuaXNQbGF5aW5nUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudGltZVNwZWVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc3RvcHdhdGNoLnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5jYXBhY2l0b3JMYWJCYXNpY3MucmVnaXN0ZXIoICdDTEJNb2RlbCcsIENMQk1vZGVsICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDTEJNb2RlbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLE9BQU8sTUFBTSxnQ0FBZ0M7QUFDcEQsT0FBT0Ms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