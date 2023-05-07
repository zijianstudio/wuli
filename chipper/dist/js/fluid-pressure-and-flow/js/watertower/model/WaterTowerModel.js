// Copyright 2014-2022, University of Colorado Boulder

/**
 * Model for the 'Water Tower' screen.
 * Origin is at the left bound on the ground. And y grows in the direction of sky from ground.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Constants from '../../common/Constants.js';
import FluidColorModel from '../../common/model/FluidColorModel.js';
import getStandardAirPressure from '../../common/model/getStandardAirPressure.js';
import Sensor from '../../common/model/Sensor.js';
import Units from '../../common/model/Units.js';
import VelocitySensor from '../../common/model/VelocitySensor.js';
import fluidPressureAndFlow from '../../fluidPressureAndFlow.js';
import FluidPressureAndFlowStrings from '../../FluidPressureAndFlowStrings.js';
import Hose from './Hose.js';
import WaterDrop from './WaterDrop.js';
import WaterTower from './WaterTower.js';
const densityUnitsEnglishString = FluidPressureAndFlowStrings.densityUnitsEnglish;
const densityUnitsMetricString = FluidPressureAndFlowStrings.densityUnitsMetric;
const valueWithUnitsPatternString = FluidPressureAndFlowStrings.valueWithUnitsPattern;
class WaterTowerModel {
  constructor() {
    this.fluidDensityRange = new Range(Constants.GASOLINE_DENSITY, Constants.HONEY_DENSITY);
    this.isRulerVisibleProperty = new Property(false);
    this.isMeasuringTapeVisibleProperty = new Property(false);
    this.isSpeedometerVisibleProperty = new Property(true);
    this.isHoseVisibleProperty = new Property(false);
    this.isPlayingProperty = new Property(true); //Whether the sim is paused or running
    this.faucetFlowRateProperty = new Property(0); // cubic meter/sec
    this.isFaucetEnabledProperty = new Property(true);
    this.measureUnitsProperty = new Property('metric'); //metric, english
    this.fluidDensityProperty = new Property(Constants.WATER_DENSITY);
    this.fluidDensityControlExpandedProperty = new Property(false);
    this.rulerPositionProperty = new Vector2Property(new Vector2(300, 350)); // px
    this.measuringTapeBasePositionProperty = new Vector2Property(new Vector2(10, 0)); // initial position (of crosshair near the base) of tape in model coordinates
    this.measuringTapeTipPositionProperty = new Vector2Property(new Vector2(17, 0)); // initial position (of crosshair  at the tip) of tape in model coordinates
    this.waterFlowProperty = new Property('water');
    this.isSluiceOpenProperty = new BooleanProperty(false);
    this.faucetModeProperty = new Property('manual'); //manual or matchLeakage
    this.scaleProperty = new Property(1); // scale coefficient
    this.speedProperty = new Property('normal'); //speed of the model, either 'normal' or 'slow'
    this.tankFullLevelDurationProperty = new Property(0); // the number of seconds tank has been full for. This property is used to enable/disable the fill button. // Fill button is disabled only when the tank has been full for at least 1 sec

    // position the tank frame at (1, 1.5). (0, 0) is the left most point on the ground.
    this.waterTower = new WaterTower({
      tankPosition: new Vector2(7, 11.1)
    }); //INITIAL_Y is 15 in java

    this.hose = new Hose(4, Math.PI / 2);
    this.faucetPosition = new Vector2(9.1, 26.6); //faucet right co-ordinates
    this.faucetDrops = createObservableArray();
    this.waterTowerDrops = createObservableArray();
    this.hoseDrops = createObservableArray();
    this.fluidColorModel = new FluidColorModel(this.fluidDensityProperty, this.fluidDensityRange);
    this.barometers = [];
    for (let i = 0; i < 2; i++) {
      this.barometers.push(new Sensor(new Vector2(0, 0), 0));
    }
    this.speedometers = [];
    for (let j = 0; j < 2; j++) {
      this.speedometers.push(new VelocitySensor(new Vector2(0, 0), new Vector2(0, 0)));
    }
    Multilink.multilink([this.waterTower.isFullProperty, this.faucetModeProperty], (isFull, faucetMode) => {
      if (faucetMode === 'manual') {
        this.isFaucetEnabledProperty.value = !isFull;
        if (isFull) {
          this.faucetFlowRateProperty.value = 0;
        }
      } else {
        this.isFaucetEnabledProperty.value = false;
      }
    });

    // variables used in step function. Declaring here to avoid gc
    this.dropsToRemove = [];
    this.accumulatedDt = 0;
    this.accumulatedDtForSensors = 0;
    this.leakageVolume = 0;
    this.newFaucetDrops = [];
    this.newWaterTowerDrops = [];
    this.newHoseDrops = [];
  }

  /**
   * Resets all model elements
   * @public
   */
  reset() {
    this.isRulerVisibleProperty.reset();
    this.isMeasuringTapeVisibleProperty.reset();
    this.isSpeedometerVisibleProperty.reset();
    this.isHoseVisibleProperty.reset();
    this.isPlayingProperty.reset();
    this.faucetFlowRateProperty.reset();
    this.isFaucetEnabledProperty.reset();
    this.measureUnitsProperty.reset();
    this.fluidDensityProperty.reset();
    this.fluidDensityControlExpandedProperty.reset();
    this.rulerPositionProperty.reset();
    this.measuringTapeBasePositionProperty.reset();
    this.measuringTapeTipPositionProperty.reset();
    this.waterFlowProperty.reset();
    this.isSluiceOpenProperty.reset();
    this.faucetModeProperty.reset();
    this.scaleProperty.reset();
    this.speedProperty.reset();
    this.tankFullLevelDurationProperty.reset();
    _.each(this.barometers, barometer => {
      barometer.reset();
    });
    _.each(this.speedometers, speedometer => {
      speedometer.reset();
    });
    this.waterTower.reset();
    this.faucetDrops.clear();
    this.waterTowerDrops.clear();
    this.hoseDrops.clear();
  }

  /**
   * @private
   */
  getFluidPressure(height) {
    return height * 9.8 * this.fluidDensityProperty.value;
  }

  /**
   * @public
   */
  getPressureAtCoords(x, y) {
    //
    if (y < 0) {
      return 0;
    }
    let pressure = getStandardAirPressure(y);

    //add the fluid pressure if the point is inside the fluid in the tank
    if (this.isPointInWater(x, y)) {
      pressure = getStandardAirPressure(this.waterTower.tankPositionProperty.value.y + this.waterTower.fluidLevelProperty.value) + this.getFluidPressure(this.waterTower.tankPositionProperty.value.y + this.waterTower.fluidLevelProperty.value - y);
    }
    return pressure;
  }

  /**
   * @public
   */
  getPressureString(pressure, units, x, y) {
    return Units.getPressureString(pressure, units, this.isPointInWater(x, y));
  }

  /**
   * @private
   */
  isPointInWater(x, y) {
    return x > this.waterTower.tankPositionProperty.value.x && x < this.waterTower.tankPositionProperty.value.x + 2 * this.waterTower.TANK_RADIUS && y > this.waterTower.tankPositionProperty.value.y && y < this.waterTower.tankPositionProperty.value.y + this.waterTower.fluidLevelProperty.value;
  }

  /**
   * Called by the animation loop.
   * @public
   */
  step(dt) {
    // prevent sudden dt bursts on slow devices or when the user comes back to the tab after a while
    dt = dt > 0.04 ? 0.04 : dt;
    if (this.isPlayingProperty.value) {
      if (this.speedProperty.value === 'normal') {
        this.stepInternal(dt);
      } else {
        this.stepInternal(0.33 * dt);
      }
    }
  }

  /**
   * @private
   */
  stepInternal(dt) {
    // Ensure that water flow looks ok even on very low frame rates
    this.accumulatedDt += dt;
    this.accumulatedDtForSensors += dt;
    let newFaucetDrop;
    let newWaterDrop;
    let newHoseDrop;
    let remainingVolume;
    let waterVolumeExpelled;
    this.newFaucetDrops = [];
    this.newWaterTowerDrops = [];
    this.newHoseDrops = [];
    while (this.accumulatedDt > 0.016) {
      this.accumulatedDt -= 0.016;
      if (this.faucetModeProperty.value === 'manual' && this.isFaucetEnabledProperty.value && this.faucetFlowRateProperty.value > 0 || this.faucetModeProperty.value === 'matchLeakage' && this.isSluiceOpenProperty.value && this.waterTower.fluidVolumeProperty.value > 0) {
        newFaucetDrop = new WaterDrop(this.faucetPosition.copy().plus(new Vector2(dotRandom.nextDouble() * 0.2 - 0.1, 1.5)), new Vector2(0, 0), this.faucetModeProperty.value === 'manual' ? this.faucetFlowRateProperty.value * 0.016 : this.leakageVolume);
        this.faucetDrops.push(newFaucetDrop);
        this.newFaucetDrops.push(newFaucetDrop);
        newFaucetDrop.step(this.accumulatedDt);
      }

      // Add watertower drops if the tank is open and there is enough fluid in the tank to be visible on the tower
      // Note: If fluid volume is very low (the fluid level is less than 1px height) then sometimes it doesn't show on the tower, but is visible with a magnifier
      if (this.isSluiceOpenProperty.value && this.waterTower.fluidVolumeProperty.value > 0 && !this.isHoseVisibleProperty.value) {
        this.velocityMagnitude = Math.sqrt(2 * Constants.EARTH_GRAVITY * this.waterTower.fluidLevelProperty.value);
        waterVolumeExpelled = this.velocityMagnitude * 2.8 * 0.016;
        remainingVolume = this.waterTower.fluidVolumeProperty.value;
        this.leakageVolume = remainingVolume > waterVolumeExpelled ? waterVolumeExpelled : remainingVolume;
        let dropVolume = this.leakageVolume;
        let radius = Utils.cubeRoot(3 * this.leakageVolume / (4 * Math.PI));

        // when the fluid level is less than the sluice hole, ensure that the water drops are not bigger than the fluid level
        if (this.waterTower.fluidLevelProperty.value < this.waterTower.HOLE_SIZE && radius > this.waterTower.fluidLevelProperty.value / 2) {
          radius = this.waterTower.fluidLevelProperty.value / 2;
          // ensure a minimum radius so that the water drop is visible on the screen
          if (radius < 0.1) {
            radius = 0.1;
          }
          dropVolume = 4 * Math.PI * radius * radius * radius / 3;
        }
        newWaterDrop = new WaterDrop(this.waterTower.tankPositionProperty.value.plus(new Vector2(2 * this.waterTower.TANK_RADIUS, 0.25 + radius)), new Vector2(this.velocityMagnitude, 0), dropVolume);
        this.waterTowerDrops.push(newWaterDrop);
        newWaterDrop.step(this.accumulatedDt);
        this.newWaterTowerDrops.push(newWaterDrop);
        this.waterTower.fluidVolumeProperty.value = this.waterTower.fluidVolumeProperty.value - this.leakageVolume;
      }

      // Add hose drops if the tank is open and there is fluid in the tank to be visible on the tower and the hose is visible
      // Note: If fluid volume is very low (the fluid level is less than 1px height) then sometimes it doesn't show on the tower, but is visible with a magnifier
      if (this.isSluiceOpenProperty.value && this.waterTower.fluidVolumeProperty.value > 0 && this.isHoseVisibleProperty.value) {
        this.leakageVolume = 0;
        const y = this.hose.rotationPivotY + this.waterTower.tankPositionProperty.value.y + 0.1;
        if (y < this.waterTower.fluidLevelProperty.value + this.waterTower.tankPositionProperty.value.y) {
          this.velocityMagnitude = Math.sqrt(2 * Constants.EARTH_GRAVITY * (this.waterTower.tankPositionProperty.value.y + this.waterTower.fluidLevelProperty.value - y));
          waterVolumeExpelled = this.velocityMagnitude * 2.8 * 0.016;
          remainingVolume = this.waterTower.fluidVolumeProperty.value;
          this.leakageVolume = remainingVolume > waterVolumeExpelled ? waterVolumeExpelled : remainingVolume;
          newHoseDrop = new WaterDrop(new Vector2(this.hose.rotationPivotX + this.waterTower.tankPositionProperty.value.x + 2 * this.waterTower.TANK_RADIUS - 0.1 + dotRandom.nextDouble() * 0.2 - 0.1, y + dotRandom.nextDouble() * 0.2 - 0.1), new Vector2(this.velocityMagnitude * Math.cos(this.hose.angleProperty.value), this.velocityMagnitude * Math.sin(this.hose.angleProperty.value)), this.leakageVolume);
          this.hoseDrops.push(newHoseDrop);
          newHoseDrop.step(this.accumulatedDt);
          this.newHoseDrops.push(newHoseDrop);
          this.waterTower.fluidVolumeProperty.value = this.waterTower.fluidVolumeProperty.value - this.leakageVolume;
        }
      }
    }
    for (let i = 0, numberOfDrops = this.faucetDrops.length; i < numberOfDrops; i++) {
      // step only the 'old' drops
      if (this.newFaucetDrops.indexOf(this.faucetDrops.get(i)) === -1) {
        this.faucetDrops.get(i).step(dt);
      }

      // check if the faucetDrops hit the fluidLevel
      if (this.faucetDrops.get(i).positionProperty.value.y < this.waterTower.tankPositionProperty.value.y + (this.waterTower.fluidLevelProperty.value > this.faucetDrops.get(i).radius ? this.waterTower.fluidLevelProperty.value + this.faucetDrops.get(i).radius : 0.3 + this.faucetDrops.get(i).radius)) {
        this.dropsToRemove.push(this.faucetDrops.get(i));
        if (this.waterTower.fluidVolumeProperty.value < this.waterTower.TANK_VOLUME) {
          this.waterTower.fluidVolumeProperty.value = this.waterTower.fluidVolumeProperty.value + this.faucetDrops.get(i).volumeProperty.value;
        }
        if (this.waterTower.fluidVolumeProperty.value > this.waterTower.TANK_VOLUME) {
          this.waterTower.fluidVolumeProperty.value = this.waterTower.TANK_VOLUME;
        }
      }
    }

    // Update the value only when it is less than 1. We are only interested in the 1 sec boundary.
    // Otherwise it will emit too many updates.
    if (this.waterTower.fluidVolumeProperty.value >= 0.995 * this.waterTower.TANK_VOLUME) {
      if (this.tankFullLevelDurationProperty.value < 0.2) {
        this.tankFullLevelDurationProperty.value += dt;
      }
    } else {
      this.tankFullLevelDurationProperty.value = 0;
    }
    if (this.dropsToRemove.length > 0) {
      this.faucetDrops.removeAll(this.dropsToRemove.filter(drop => this.faucetDrops.includes(drop)));
    }
    this.dropsToRemove = [];
    for (let i = 0, numberOfDrops = this.waterTowerDrops.length; i < numberOfDrops; i++) {
      //step only the 'old' drops
      if (this.newWaterTowerDrops.indexOf(this.waterTowerDrops.get(i)) === -1) {
        this.waterTowerDrops.get(i).step(dt);
      }

      //remove them as soon as they go below the ground
      if (this.waterTowerDrops.get(i).positionProperty.value.y < 0) {
        this.dropsToRemove.push(this.waterTowerDrops.get(i));
      }
    }
    if (this.dropsToRemove.length > 0) {
      this.waterTowerDrops.removeAll(this.dropsToRemove.filter(drop => this.waterTowerDrops.includes(drop)));
    }

    //hose
    this.dropsToRemove = [];
    for (let i = 0, numberOfDrops = this.hoseDrops.length; i < numberOfDrops; i++) {
      //step only the 'old' drops
      if (this.newHoseDrops.indexOf(this.hoseDrops.get(i)) === -1) {
        this.hoseDrops.get(i).step(dt);
      }
      //remove them as soon as they hit the ground
      if (this.hoseDrops.get(i).positionProperty.value.y < 0) {
        this.dropsToRemove.push(this.hoseDrops.get(i));
      }
    }
    if (this.dropsToRemove.length > 0) {
      this.hoseDrops.removeAll(this.dropsToRemove.filter(drop => this.hoseDrops.includes(drop)));
    }

    // update sensor values only about 10 times per sec
    // update the sensor values only when water is flowing
    if (this.accumulatedDtForSensors > 0.1 && (this.hoseDrops.length > 0 || this.waterTowerDrops.length > 0 || this.faucetDrops.length > 0)) {
      this.accumulatedDtForSensors -= 0.1;
      for (let k = 0; k < this.speedometers.length; k++) {
        this.speedometers[k].valueProperty.value = this.getWaterDropVelocityAt(this.modelViewTransform.viewToModelX(this.speedometers[k].positionProperty.value.x + 50), this.modelViewTransform.viewToModelY(this.speedometers[k].positionProperty.value.y + 72));
      }
    }
  }

  /**
   * @public
   */
  getFluidDensityString() {
    if (this.measureUnitsProperty.value === 'english') {
      return StringUtils.format(valueWithUnitsPatternString, Utils.toFixed(Units.FLUID_DENSITY_ENGLISH_PER_METRIC * this.fluidDensityProperty.value, 2), densityUnitsEnglishString);
    } else {
      return StringUtils.format(valueWithUnitsPatternString, Utils.roundSymmetric(this.fluidDensityProperty.value), densityUnitsMetricString);
    }
  }

  /**
   * @public
   */
  getWaterDropVelocityAt(x, y) {
    // There might be waterdrops under the ground that are not yet removed.
    // Report (0,0) velocity for all those drops.
    if (y < 0) {
      return Vector2.ZERO;
    }
    let waterDrops = this.waterTowerDrops;
    for (let i = 0, j = waterDrops.length; i < j; i++) {
      if (waterDrops.get(i).contains(new Vector2(x, y))) {
        return waterDrops.get(i).velocityProperty.value;
      }
    }
    waterDrops = this.hoseDrops;
    for (let i = 0, j = waterDrops.length; i < j; i++) {
      if (waterDrops.get(i).contains(new Vector2(x, y))) {
        return waterDrops.get(i).velocityProperty.value;
      }
    }
    return Vector2.ZERO;
  }
}
fluidPressureAndFlow.register('WaterTowerModel', WaterTowerModel);
export default WaterTowerModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJNdWx0aWxpbmsiLCJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsIlJhbmdlIiwiVXRpbHMiLCJWZWN0b3IyIiwiVmVjdG9yMlByb3BlcnR5IiwiU3RyaW5nVXRpbHMiLCJDb25zdGFudHMiLCJGbHVpZENvbG9yTW9kZWwiLCJnZXRTdGFuZGFyZEFpclByZXNzdXJlIiwiU2Vuc29yIiwiVW5pdHMiLCJWZWxvY2l0eVNlbnNvciIsImZsdWlkUHJlc3N1cmVBbmRGbG93IiwiRmx1aWRQcmVzc3VyZUFuZEZsb3dTdHJpbmdzIiwiSG9zZSIsIldhdGVyRHJvcCIsIldhdGVyVG93ZXIiLCJkZW5zaXR5VW5pdHNFbmdsaXNoU3RyaW5nIiwiZGVuc2l0eVVuaXRzRW5nbGlzaCIsImRlbnNpdHlVbml0c01ldHJpY1N0cmluZyIsImRlbnNpdHlVbml0c01ldHJpYyIsInZhbHVlV2l0aFVuaXRzUGF0dGVyblN0cmluZyIsInZhbHVlV2l0aFVuaXRzUGF0dGVybiIsIldhdGVyVG93ZXJNb2RlbCIsImNvbnN0cnVjdG9yIiwiZmx1aWREZW5zaXR5UmFuZ2UiLCJHQVNPTElORV9ERU5TSVRZIiwiSE9ORVlfREVOU0lUWSIsImlzUnVsZXJWaXNpYmxlUHJvcGVydHkiLCJpc01lYXN1cmluZ1RhcGVWaXNpYmxlUHJvcGVydHkiLCJpc1NwZWVkb21ldGVyVmlzaWJsZVByb3BlcnR5IiwiaXNIb3NlVmlzaWJsZVByb3BlcnR5IiwiaXNQbGF5aW5nUHJvcGVydHkiLCJmYXVjZXRGbG93UmF0ZVByb3BlcnR5IiwiaXNGYXVjZXRFbmFibGVkUHJvcGVydHkiLCJtZWFzdXJlVW5pdHNQcm9wZXJ0eSIsImZsdWlkRGVuc2l0eVByb3BlcnR5IiwiV0FURVJfREVOU0lUWSIsImZsdWlkRGVuc2l0eUNvbnRyb2xFeHBhbmRlZFByb3BlcnR5IiwicnVsZXJQb3NpdGlvblByb3BlcnR5IiwibWVhc3VyaW5nVGFwZUJhc2VQb3NpdGlvblByb3BlcnR5IiwibWVhc3VyaW5nVGFwZVRpcFBvc2l0aW9uUHJvcGVydHkiLCJ3YXRlckZsb3dQcm9wZXJ0eSIsImlzU2x1aWNlT3BlblByb3BlcnR5IiwiZmF1Y2V0TW9kZVByb3BlcnR5Iiwic2NhbGVQcm9wZXJ0eSIsInNwZWVkUHJvcGVydHkiLCJ0YW5rRnVsbExldmVsRHVyYXRpb25Qcm9wZXJ0eSIsIndhdGVyVG93ZXIiLCJ0YW5rUG9zaXRpb24iLCJob3NlIiwiTWF0aCIsIlBJIiwiZmF1Y2V0UG9zaXRpb24iLCJmYXVjZXREcm9wcyIsIndhdGVyVG93ZXJEcm9wcyIsImhvc2VEcm9wcyIsImZsdWlkQ29sb3JNb2RlbCIsImJhcm9tZXRlcnMiLCJpIiwicHVzaCIsInNwZWVkb21ldGVycyIsImoiLCJtdWx0aWxpbmsiLCJpc0Z1bGxQcm9wZXJ0eSIsImlzRnVsbCIsImZhdWNldE1vZGUiLCJ2YWx1ZSIsImRyb3BzVG9SZW1vdmUiLCJhY2N1bXVsYXRlZER0IiwiYWNjdW11bGF0ZWREdEZvclNlbnNvcnMiLCJsZWFrYWdlVm9sdW1lIiwibmV3RmF1Y2V0RHJvcHMiLCJuZXdXYXRlclRvd2VyRHJvcHMiLCJuZXdIb3NlRHJvcHMiLCJyZXNldCIsIl8iLCJlYWNoIiwiYmFyb21ldGVyIiwic3BlZWRvbWV0ZXIiLCJjbGVhciIsImdldEZsdWlkUHJlc3N1cmUiLCJoZWlnaHQiLCJnZXRQcmVzc3VyZUF0Q29vcmRzIiwieCIsInkiLCJwcmVzc3VyZSIsImlzUG9pbnRJbldhdGVyIiwidGFua1Bvc2l0aW9uUHJvcGVydHkiLCJmbHVpZExldmVsUHJvcGVydHkiLCJnZXRQcmVzc3VyZVN0cmluZyIsInVuaXRzIiwiVEFOS19SQURJVVMiLCJzdGVwIiwiZHQiLCJzdGVwSW50ZXJuYWwiLCJuZXdGYXVjZXREcm9wIiwibmV3V2F0ZXJEcm9wIiwibmV3SG9zZURyb3AiLCJyZW1haW5pbmdWb2x1bWUiLCJ3YXRlclZvbHVtZUV4cGVsbGVkIiwiZmx1aWRWb2x1bWVQcm9wZXJ0eSIsImNvcHkiLCJwbHVzIiwibmV4dERvdWJsZSIsInZlbG9jaXR5TWFnbml0dWRlIiwic3FydCIsIkVBUlRIX0dSQVZJVFkiLCJkcm9wVm9sdW1lIiwicmFkaXVzIiwiY3ViZVJvb3QiLCJIT0xFX1NJWkUiLCJyb3RhdGlvblBpdm90WSIsInJvdGF0aW9uUGl2b3RYIiwiY29zIiwiYW5nbGVQcm9wZXJ0eSIsInNpbiIsIm51bWJlck9mRHJvcHMiLCJsZW5ndGgiLCJpbmRleE9mIiwiZ2V0IiwicG9zaXRpb25Qcm9wZXJ0eSIsIlRBTktfVk9MVU1FIiwidm9sdW1lUHJvcGVydHkiLCJyZW1vdmVBbGwiLCJmaWx0ZXIiLCJkcm9wIiwiaW5jbHVkZXMiLCJrIiwidmFsdWVQcm9wZXJ0eSIsImdldFdhdGVyRHJvcFZlbG9jaXR5QXQiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJ2aWV3VG9Nb2RlbFgiLCJ2aWV3VG9Nb2RlbFkiLCJnZXRGbHVpZERlbnNpdHlTdHJpbmciLCJmb3JtYXQiLCJ0b0ZpeGVkIiwiRkxVSURfREVOU0lUWV9FTkdMSVNIX1BFUl9NRVRSSUMiLCJyb3VuZFN5bW1ldHJpYyIsIlpFUk8iLCJ3YXRlckRyb3BzIiwiY29udGFpbnMiLCJ2ZWxvY2l0eVByb3BlcnR5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJXYXRlclRvd2VyTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgZm9yIHRoZSAnV2F0ZXIgVG93ZXInIHNjcmVlbi5cclxuICogT3JpZ2luIGlzIGF0IHRoZSBsZWZ0IGJvdW5kIG9uIHRoZSBncm91bmQuIEFuZCB5IGdyb3dzIGluIHRoZSBkaXJlY3Rpb24gb2Ygc2t5IGZyb20gZ3JvdW5kLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgRmx1aWRDb2xvck1vZGVsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9GbHVpZENvbG9yTW9kZWwuanMnO1xyXG5pbXBvcnQgZ2V0U3RhbmRhcmRBaXJQcmVzc3VyZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvZ2V0U3RhbmRhcmRBaXJQcmVzc3VyZS5qcyc7XHJcbmltcG9ydCBTZW5zb3IgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1NlbnNvci5qcyc7XHJcbmltcG9ydCBVbml0cyBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvVW5pdHMuanMnO1xyXG5pbXBvcnQgVmVsb2NpdHlTZW5zb3IgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1ZlbG9jaXR5U2Vuc29yLmpzJztcclxuaW1wb3J0IGZsdWlkUHJlc3N1cmVBbmRGbG93IGZyb20gJy4uLy4uL2ZsdWlkUHJlc3N1cmVBbmRGbG93LmpzJztcclxuaW1wb3J0IEZsdWlkUHJlc3N1cmVBbmRGbG93U3RyaW5ncyBmcm9tICcuLi8uLi9GbHVpZFByZXNzdXJlQW5kRmxvd1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgSG9zZSBmcm9tICcuL0hvc2UuanMnO1xyXG5pbXBvcnQgV2F0ZXJEcm9wIGZyb20gJy4vV2F0ZXJEcm9wLmpzJztcclxuaW1wb3J0IFdhdGVyVG93ZXIgZnJvbSAnLi9XYXRlclRvd2VyLmpzJztcclxuXHJcbmNvbnN0IGRlbnNpdHlVbml0c0VuZ2xpc2hTdHJpbmcgPSBGbHVpZFByZXNzdXJlQW5kRmxvd1N0cmluZ3MuZGVuc2l0eVVuaXRzRW5nbGlzaDtcclxuY29uc3QgZGVuc2l0eVVuaXRzTWV0cmljU3RyaW5nID0gRmx1aWRQcmVzc3VyZUFuZEZsb3dTdHJpbmdzLmRlbnNpdHlVbml0c01ldHJpYztcclxuY29uc3QgdmFsdWVXaXRoVW5pdHNQYXR0ZXJuU3RyaW5nID0gRmx1aWRQcmVzc3VyZUFuZEZsb3dTdHJpbmdzLnZhbHVlV2l0aFVuaXRzUGF0dGVybjtcclxuXHJcbmNsYXNzIFdhdGVyVG93ZXJNb2RlbCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIHRoaXMuZmx1aWREZW5zaXR5UmFuZ2UgPSBuZXcgUmFuZ2UoIENvbnN0YW50cy5HQVNPTElORV9ERU5TSVRZLCBDb25zdGFudHMuSE9ORVlfREVOU0lUWSApO1xyXG5cclxuICAgIHRoaXMuaXNSdWxlclZpc2libGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggZmFsc2UgKTtcclxuICAgIHRoaXMuaXNNZWFzdXJpbmdUYXBlVmlzaWJsZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xyXG4gICAgdGhpcy5pc1NwZWVkb21ldGVyVmlzaWJsZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCB0cnVlICk7XHJcbiAgICB0aGlzLmlzSG9zZVZpc2libGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggZmFsc2UgKTtcclxuICAgIHRoaXMuaXNQbGF5aW5nUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHRydWUgKTsvL1doZXRoZXIgdGhlIHNpbSBpcyBwYXVzZWQgb3IgcnVubmluZ1xyXG4gICAgdGhpcy5mYXVjZXRGbG93UmF0ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAwICk7Ly8gY3ViaWMgbWV0ZXIvc2VjXHJcbiAgICB0aGlzLmlzRmF1Y2V0RW5hYmxlZFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCB0cnVlICk7XHJcbiAgICB0aGlzLm1lYXN1cmVVbml0c1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAnbWV0cmljJyApOy8vbWV0cmljLCBlbmdsaXNoXHJcbiAgICB0aGlzLmZsdWlkRGVuc2l0eVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBDb25zdGFudHMuV0FURVJfREVOU0lUWSApO1xyXG4gICAgdGhpcy5mbHVpZERlbnNpdHlDb250cm9sRXhwYW5kZWRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggZmFsc2UgKTtcclxuICAgIHRoaXMucnVsZXJQb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggbmV3IFZlY3RvcjIoIDMwMCwgMzUwICkgKTsgLy8gcHhcclxuICAgIHRoaXMubWVhc3VyaW5nVGFwZUJhc2VQb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggbmV3IFZlY3RvcjIoIDEwLCAwICkgKTsgLy8gaW5pdGlhbCBwb3NpdGlvbiAob2YgY3Jvc3NoYWlyIG5lYXIgdGhlIGJhc2UpIG9mIHRhcGUgaW4gbW9kZWwgY29vcmRpbmF0ZXNcclxuICAgIHRoaXMubWVhc3VyaW5nVGFwZVRpcFBvc2l0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBuZXcgVmVjdG9yMiggMTcsIDAgKSApOyAvLyBpbml0aWFsIHBvc2l0aW9uIChvZiBjcm9zc2hhaXIgIGF0IHRoZSB0aXApIG9mIHRhcGUgaW4gbW9kZWwgY29vcmRpbmF0ZXNcclxuICAgIHRoaXMud2F0ZXJGbG93UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoICd3YXRlcicgKTtcclxuICAgIHRoaXMuaXNTbHVpY2VPcGVuUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG4gICAgdGhpcy5mYXVjZXRNb2RlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoICdtYW51YWwnICk7IC8vbWFudWFsIG9yIG1hdGNoTGVha2FnZVxyXG4gICAgdGhpcy5zY2FsZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAxICk7IC8vIHNjYWxlIGNvZWZmaWNpZW50XHJcbiAgICB0aGlzLnNwZWVkUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoICdub3JtYWwnICk7IC8vc3BlZWQgb2YgdGhlIG1vZGVsLCBlaXRoZXIgJ25vcm1hbCcgb3IgJ3Nsb3cnXHJcbiAgICB0aGlzLnRhbmtGdWxsTGV2ZWxEdXJhdGlvblByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAwICk7Ly8gdGhlIG51bWJlciBvZiBzZWNvbmRzIHRhbmsgaGFzIGJlZW4gZnVsbCBmb3IuIFRoaXMgcHJvcGVydHkgaXMgdXNlZCB0byBlbmFibGUvZGlzYWJsZSB0aGUgZmlsbCBidXR0b24uIC8vIEZpbGwgYnV0dG9uIGlzIGRpc2FibGVkIG9ubHkgd2hlbiB0aGUgdGFuayBoYXMgYmVlbiBmdWxsIGZvciBhdCBsZWFzdCAxIHNlY1xyXG5cclxuICAgIC8vIHBvc2l0aW9uIHRoZSB0YW5rIGZyYW1lIGF0ICgxLCAxLjUpLiAoMCwgMCkgaXMgdGhlIGxlZnQgbW9zdCBwb2ludCBvbiB0aGUgZ3JvdW5kLlxyXG4gICAgdGhpcy53YXRlclRvd2VyID0gbmV3IFdhdGVyVG93ZXIoIHsgdGFua1Bvc2l0aW9uOiBuZXcgVmVjdG9yMiggNywgMTEuMSApIH0gKTsgLy9JTklUSUFMX1kgaXMgMTUgaW4gamF2YVxyXG5cclxuICAgIHRoaXMuaG9zZSA9IG5ldyBIb3NlKCA0LCBNYXRoLlBJIC8gMiApO1xyXG5cclxuICAgIHRoaXMuZmF1Y2V0UG9zaXRpb24gPSBuZXcgVmVjdG9yMiggOS4xLCAyNi42ICk7IC8vZmF1Y2V0IHJpZ2h0IGNvLW9yZGluYXRlc1xyXG4gICAgdGhpcy5mYXVjZXREcm9wcyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG4gICAgdGhpcy53YXRlclRvd2VyRHJvcHMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTtcclxuICAgIHRoaXMuaG9zZURyb3BzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcbiAgICB0aGlzLmZsdWlkQ29sb3JNb2RlbCA9IG5ldyBGbHVpZENvbG9yTW9kZWwoIHRoaXMuZmx1aWREZW5zaXR5UHJvcGVydHksIHRoaXMuZmx1aWREZW5zaXR5UmFuZ2UgKTtcclxuXHJcbiAgICB0aGlzLmJhcm9tZXRlcnMgPSBbXTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IDI7IGkrKyApIHtcclxuICAgICAgdGhpcy5iYXJvbWV0ZXJzLnB1c2goIG5ldyBTZW5zb3IoIG5ldyBWZWN0b3IyKCAwLCAwICksIDAgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc3BlZWRvbWV0ZXJzID0gW107XHJcbiAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCAyOyBqKysgKSB7XHJcbiAgICAgIHRoaXMuc3BlZWRvbWV0ZXJzLnB1c2goIG5ldyBWZWxvY2l0eVNlbnNvciggbmV3IFZlY3RvcjIoIDAsIDAgKSwgbmV3IFZlY3RvcjIoIDAsIDAgKSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyB0aGlzLndhdGVyVG93ZXIuaXNGdWxsUHJvcGVydHksIHRoaXMuZmF1Y2V0TW9kZVByb3BlcnR5IF0sICggaXNGdWxsLCBmYXVjZXRNb2RlICkgPT4ge1xyXG4gICAgICBpZiAoIGZhdWNldE1vZGUgPT09ICdtYW51YWwnICkge1xyXG4gICAgICAgIHRoaXMuaXNGYXVjZXRFbmFibGVkUHJvcGVydHkudmFsdWUgPSAhaXNGdWxsO1xyXG4gICAgICAgIGlmICggaXNGdWxsICkge1xyXG4gICAgICAgICAgdGhpcy5mYXVjZXRGbG93UmF0ZVByb3BlcnR5LnZhbHVlID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5pc0ZhdWNldEVuYWJsZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdmFyaWFibGVzIHVzZWQgaW4gc3RlcCBmdW5jdGlvbi4gRGVjbGFyaW5nIGhlcmUgdG8gYXZvaWQgZ2NcclxuICAgIHRoaXMuZHJvcHNUb1JlbW92ZSA9IFtdO1xyXG4gICAgdGhpcy5hY2N1bXVsYXRlZER0ID0gMDtcclxuICAgIHRoaXMuYWNjdW11bGF0ZWREdEZvclNlbnNvcnMgPSAwO1xyXG5cclxuICAgIHRoaXMubGVha2FnZVZvbHVtZSA9IDA7XHJcbiAgICB0aGlzLm5ld0ZhdWNldERyb3BzID0gW107XHJcbiAgICB0aGlzLm5ld1dhdGVyVG93ZXJEcm9wcyA9IFtdO1xyXG4gICAgdGhpcy5uZXdIb3NlRHJvcHMgPSBbXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyBhbGwgbW9kZWwgZWxlbWVudHNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLmlzUnVsZXJWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuaXNNZWFzdXJpbmdUYXBlVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmlzU3BlZWRvbWV0ZXJWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuaXNIb3NlVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmlzUGxheWluZ1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmZhdWNldEZsb3dSYXRlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuaXNGYXVjZXRFbmFibGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubWVhc3VyZVVuaXRzUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZmx1aWREZW5zaXR5UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZmx1aWREZW5zaXR5Q29udHJvbEV4cGFuZGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucnVsZXJQb3NpdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLm1lYXN1cmluZ1RhcGVCYXNlUG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5tZWFzdXJpbmdUYXBlVGlwUG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy53YXRlckZsb3dQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5pc1NsdWljZU9wZW5Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5mYXVjZXRNb2RlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc2NhbGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zcGVlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnRhbmtGdWxsTGV2ZWxEdXJhdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcblxyXG4gICAgXy5lYWNoKCB0aGlzLmJhcm9tZXRlcnMsIGJhcm9tZXRlciA9PiB7XHJcbiAgICAgIGJhcm9tZXRlci5yZXNldCgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIF8uZWFjaCggdGhpcy5zcGVlZG9tZXRlcnMsIHNwZWVkb21ldGVyID0+IHtcclxuICAgICAgc3BlZWRvbWV0ZXIucmVzZXQoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLndhdGVyVG93ZXIucmVzZXQoKTtcclxuICAgIHRoaXMuZmF1Y2V0RHJvcHMuY2xlYXIoKTtcclxuICAgIHRoaXMud2F0ZXJUb3dlckRyb3BzLmNsZWFyKCk7XHJcbiAgICB0aGlzLmhvc2VEcm9wcy5jbGVhcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXRGbHVpZFByZXNzdXJlKCBoZWlnaHQgKSB7XHJcbiAgICByZXR1cm4gaGVpZ2h0ICogOS44ICogdGhpcy5mbHVpZERlbnNpdHlQcm9wZXJ0eS52YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRQcmVzc3VyZUF0Q29vcmRzKCB4LCB5ICkge1xyXG4gICAgLy9cclxuICAgIGlmICggeSA8IDAgKSB7XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBwcmVzc3VyZSA9IGdldFN0YW5kYXJkQWlyUHJlc3N1cmUoIHkgKTtcclxuXHJcbiAgICAvL2FkZCB0aGUgZmx1aWQgcHJlc3N1cmUgaWYgdGhlIHBvaW50IGlzIGluc2lkZSB0aGUgZmx1aWQgaW4gdGhlIHRhbmtcclxuICAgIGlmICggdGhpcy5pc1BvaW50SW5XYXRlciggeCwgeSApICkge1xyXG4gICAgICBwcmVzc3VyZSA9IGdldFN0YW5kYXJkQWlyUHJlc3N1cmUoIHRoaXMud2F0ZXJUb3dlci50YW5rUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ICsgdGhpcy53YXRlclRvd2VyLmZsdWlkTGV2ZWxQcm9wZXJ0eS52YWx1ZSApICtcclxuICAgICAgICAgICAgICAgICB0aGlzLmdldEZsdWlkUHJlc3N1cmUoIHRoaXMud2F0ZXJUb3dlci50YW5rUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ICsgdGhpcy53YXRlclRvd2VyLmZsdWlkTGV2ZWxQcm9wZXJ0eS52YWx1ZSAtIHkgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcHJlc3N1cmU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0UHJlc3N1cmVTdHJpbmcoIHByZXNzdXJlLCB1bml0cywgeCwgeSApIHtcclxuICAgIHJldHVybiBVbml0cy5nZXRQcmVzc3VyZVN0cmluZyggcHJlc3N1cmUsIHVuaXRzLCB0aGlzLmlzUG9pbnRJbldhdGVyKCB4LCB5ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgaXNQb2ludEluV2F0ZXIoIHgsIHkgKSB7XHJcbiAgICByZXR1cm4gKCB4ID4gdGhpcy53YXRlclRvd2VyLnRhbmtQb3NpdGlvblByb3BlcnR5LnZhbHVlLnggJiZcclxuICAgICAgICAgICAgIHggPCB0aGlzLndhdGVyVG93ZXIudGFua1Bvc2l0aW9uUHJvcGVydHkudmFsdWUueCArIDIgKiB0aGlzLndhdGVyVG93ZXIuVEFOS19SQURJVVMgJiZcclxuICAgICAgICAgICAgIHkgPiB0aGlzLndhdGVyVG93ZXIudGFua1Bvc2l0aW9uUHJvcGVydHkudmFsdWUueSAmJiB5IDwgdGhpcy53YXRlclRvd2VyLnRhbmtQb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgKyB0aGlzLndhdGVyVG93ZXIuZmx1aWRMZXZlbFByb3BlcnR5LnZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgYnkgdGhlIGFuaW1hdGlvbiBsb29wLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIC8vIHByZXZlbnQgc3VkZGVuIGR0IGJ1cnN0cyBvbiBzbG93IGRldmljZXMgb3Igd2hlbiB0aGUgdXNlciBjb21lcyBiYWNrIHRvIHRoZSB0YWIgYWZ0ZXIgYSB3aGlsZVxyXG4gICAgZHQgPSAoIGR0ID4gMC4wNCApID8gMC4wNCA6IGR0O1xyXG4gICAgaWYgKCB0aGlzLmlzUGxheWluZ1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICBpZiAoIHRoaXMuc3BlZWRQcm9wZXJ0eS52YWx1ZSA9PT0gJ25vcm1hbCcgKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwSW50ZXJuYWwoIGR0ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zdGVwSW50ZXJuYWwoIDAuMzMgKiBkdCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHN0ZXBJbnRlcm5hbCggZHQgKSB7XHJcblxyXG4gICAgLy8gRW5zdXJlIHRoYXQgd2F0ZXIgZmxvdyBsb29rcyBvayBldmVuIG9uIHZlcnkgbG93IGZyYW1lIHJhdGVzXHJcbiAgICB0aGlzLmFjY3VtdWxhdGVkRHQgKz0gZHQ7XHJcbiAgICB0aGlzLmFjY3VtdWxhdGVkRHRGb3JTZW5zb3JzICs9IGR0O1xyXG5cclxuICAgIGxldCBuZXdGYXVjZXREcm9wO1xyXG4gICAgbGV0IG5ld1dhdGVyRHJvcDtcclxuICAgIGxldCBuZXdIb3NlRHJvcDtcclxuICAgIGxldCByZW1haW5pbmdWb2x1bWU7XHJcbiAgICBsZXQgd2F0ZXJWb2x1bWVFeHBlbGxlZDtcclxuXHJcbiAgICB0aGlzLm5ld0ZhdWNldERyb3BzID0gW107XHJcbiAgICB0aGlzLm5ld1dhdGVyVG93ZXJEcm9wcyA9IFtdO1xyXG4gICAgdGhpcy5uZXdIb3NlRHJvcHMgPSBbXTtcclxuXHJcbiAgICB3aGlsZSAoIHRoaXMuYWNjdW11bGF0ZWREdCA+IDAuMDE2ICkge1xyXG4gICAgICB0aGlzLmFjY3VtdWxhdGVkRHQgLT0gMC4wMTY7XHJcbiAgICAgIGlmICggKCB0aGlzLmZhdWNldE1vZGVQcm9wZXJ0eS52YWx1ZSA9PT0gJ21hbnVhbCcgJiYgdGhpcy5pc0ZhdWNldEVuYWJsZWRQcm9wZXJ0eS52YWx1ZSAmJiB0aGlzLmZhdWNldEZsb3dSYXRlUHJvcGVydHkudmFsdWUgPiAwICkgfHxcclxuICAgICAgICAgICAoIHRoaXMuZmF1Y2V0TW9kZVByb3BlcnR5LnZhbHVlID09PSAnbWF0Y2hMZWFrYWdlJyAmJiB0aGlzLmlzU2x1aWNlT3BlblByb3BlcnR5LnZhbHVlICYmIHRoaXMud2F0ZXJUb3dlci5mbHVpZFZvbHVtZVByb3BlcnR5LnZhbHVlID4gMCApICkge1xyXG4gICAgICAgIG5ld0ZhdWNldERyb3AgPSBuZXcgV2F0ZXJEcm9wKCB0aGlzLmZhdWNldFBvc2l0aW9uLmNvcHkoKS5wbHVzKCBuZXcgVmVjdG9yMiggZG90UmFuZG9tLm5leHREb3VibGUoKSAqIDAuMiAtIDAuMSxcclxuICAgICAgICAgIDEuNSApICksIG5ldyBWZWN0b3IyKCAwLCAwICksXHJcbiAgICAgICAgICB0aGlzLmZhdWNldE1vZGVQcm9wZXJ0eS52YWx1ZSA9PT0gJ21hbnVhbCcgPyB0aGlzLmZhdWNldEZsb3dSYXRlUHJvcGVydHkudmFsdWUgKiAwLjAxNiA6IHRoaXMubGVha2FnZVZvbHVtZSApO1xyXG4gICAgICAgIHRoaXMuZmF1Y2V0RHJvcHMucHVzaCggbmV3RmF1Y2V0RHJvcCApO1xyXG4gICAgICAgIHRoaXMubmV3RmF1Y2V0RHJvcHMucHVzaCggbmV3RmF1Y2V0RHJvcCApO1xyXG4gICAgICAgIG5ld0ZhdWNldERyb3Auc3RlcCggdGhpcy5hY2N1bXVsYXRlZER0ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEFkZCB3YXRlcnRvd2VyIGRyb3BzIGlmIHRoZSB0YW5rIGlzIG9wZW4gYW5kIHRoZXJlIGlzIGVub3VnaCBmbHVpZCBpbiB0aGUgdGFuayB0byBiZSB2aXNpYmxlIG9uIHRoZSB0b3dlclxyXG4gICAgICAvLyBOb3RlOiBJZiBmbHVpZCB2b2x1bWUgaXMgdmVyeSBsb3cgKHRoZSBmbHVpZCBsZXZlbCBpcyBsZXNzIHRoYW4gMXB4IGhlaWdodCkgdGhlbiBzb21ldGltZXMgaXQgZG9lc24ndCBzaG93IG9uIHRoZSB0b3dlciwgYnV0IGlzIHZpc2libGUgd2l0aCBhIG1hZ25pZmllclxyXG4gICAgICBpZiAoIHRoaXMuaXNTbHVpY2VPcGVuUHJvcGVydHkudmFsdWUgJiYgdGhpcy53YXRlclRvd2VyLmZsdWlkVm9sdW1lUHJvcGVydHkudmFsdWUgPiAwICYmICF0aGlzLmlzSG9zZVZpc2libGVQcm9wZXJ0eS52YWx1ZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eU1hZ25pdHVkZSA9IE1hdGguc3FydCggMiAqIENvbnN0YW50cy5FQVJUSF9HUkFWSVRZICogdGhpcy53YXRlclRvd2VyLmZsdWlkTGV2ZWxQcm9wZXJ0eS52YWx1ZSApO1xyXG5cclxuICAgICAgICB3YXRlclZvbHVtZUV4cGVsbGVkID0gdGhpcy52ZWxvY2l0eU1hZ25pdHVkZSAqIDIuOCAqIDAuMDE2O1xyXG5cclxuICAgICAgICByZW1haW5pbmdWb2x1bWUgPSB0aGlzLndhdGVyVG93ZXIuZmx1aWRWb2x1bWVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICB0aGlzLmxlYWthZ2VWb2x1bWUgPSByZW1haW5pbmdWb2x1bWUgPiB3YXRlclZvbHVtZUV4cGVsbGVkID8gd2F0ZXJWb2x1bWVFeHBlbGxlZCA6IHJlbWFpbmluZ1ZvbHVtZTtcclxuICAgICAgICBsZXQgZHJvcFZvbHVtZSA9IHRoaXMubGVha2FnZVZvbHVtZTtcclxuICAgICAgICBsZXQgcmFkaXVzID0gVXRpbHMuY3ViZVJvb3QoICggMyAqIHRoaXMubGVha2FnZVZvbHVtZSApIC8gKCA0ICogTWF0aC5QSSApICk7XHJcblxyXG4gICAgICAgIC8vIHdoZW4gdGhlIGZsdWlkIGxldmVsIGlzIGxlc3MgdGhhbiB0aGUgc2x1aWNlIGhvbGUsIGVuc3VyZSB0aGF0IHRoZSB3YXRlciBkcm9wcyBhcmUgbm90IGJpZ2dlciB0aGFuIHRoZSBmbHVpZCBsZXZlbFxyXG4gICAgICAgIGlmICggdGhpcy53YXRlclRvd2VyLmZsdWlkTGV2ZWxQcm9wZXJ0eS52YWx1ZSA8IHRoaXMud2F0ZXJUb3dlci5IT0xFX1NJWkUgJiYgcmFkaXVzID4gdGhpcy53YXRlclRvd2VyLmZsdWlkTGV2ZWxQcm9wZXJ0eS52YWx1ZSAvIDIgKSB7XHJcbiAgICAgICAgICByYWRpdXMgPSB0aGlzLndhdGVyVG93ZXIuZmx1aWRMZXZlbFByb3BlcnR5LnZhbHVlIC8gMjtcclxuICAgICAgICAgIC8vIGVuc3VyZSBhIG1pbmltdW0gcmFkaXVzIHNvIHRoYXQgdGhlIHdhdGVyIGRyb3AgaXMgdmlzaWJsZSBvbiB0aGUgc2NyZWVuXHJcbiAgICAgICAgICBpZiAoIHJhZGl1cyA8IDAuMSApIHtcclxuICAgICAgICAgICAgcmFkaXVzID0gMC4xO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZHJvcFZvbHVtZSA9IDQgKiBNYXRoLlBJICogcmFkaXVzICogcmFkaXVzICogcmFkaXVzIC8gMztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG5ld1dhdGVyRHJvcCA9IG5ldyBXYXRlckRyb3AoIHRoaXMud2F0ZXJUb3dlci50YW5rUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzKCBuZXcgVmVjdG9yMiggMiAqIHRoaXMud2F0ZXJUb3dlci5UQU5LX1JBRElVUyxcclxuICAgICAgICAgIDAuMjUgKyByYWRpdXMgKSApLCBuZXcgVmVjdG9yMiggdGhpcy52ZWxvY2l0eU1hZ25pdHVkZSwgMCApLCBkcm9wVm9sdW1lICk7XHJcbiAgICAgICAgdGhpcy53YXRlclRvd2VyRHJvcHMucHVzaCggbmV3V2F0ZXJEcm9wICk7XHJcbiAgICAgICAgbmV3V2F0ZXJEcm9wLnN0ZXAoIHRoaXMuYWNjdW11bGF0ZWREdCApO1xyXG4gICAgICAgIHRoaXMubmV3V2F0ZXJUb3dlckRyb3BzLnB1c2goIG5ld1dhdGVyRHJvcCApO1xyXG5cclxuICAgICAgICB0aGlzLndhdGVyVG93ZXIuZmx1aWRWb2x1bWVQcm9wZXJ0eS52YWx1ZSA9IHRoaXMud2F0ZXJUb3dlci5mbHVpZFZvbHVtZVByb3BlcnR5LnZhbHVlIC0gdGhpcy5sZWFrYWdlVm9sdW1lO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQWRkIGhvc2UgZHJvcHMgaWYgdGhlIHRhbmsgaXMgb3BlbiBhbmQgdGhlcmUgaXMgZmx1aWQgaW4gdGhlIHRhbmsgdG8gYmUgdmlzaWJsZSBvbiB0aGUgdG93ZXIgYW5kIHRoZSBob3NlIGlzIHZpc2libGVcclxuICAgICAgLy8gTm90ZTogSWYgZmx1aWQgdm9sdW1lIGlzIHZlcnkgbG93ICh0aGUgZmx1aWQgbGV2ZWwgaXMgbGVzcyB0aGFuIDFweCBoZWlnaHQpIHRoZW4gc29tZXRpbWVzIGl0IGRvZXNuJ3Qgc2hvdyBvbiB0aGUgdG93ZXIsIGJ1dCBpcyB2aXNpYmxlIHdpdGggYSBtYWduaWZpZXJcclxuICAgICAgaWYgKCB0aGlzLmlzU2x1aWNlT3BlblByb3BlcnR5LnZhbHVlICYmIHRoaXMud2F0ZXJUb3dlci5mbHVpZFZvbHVtZVByb3BlcnR5LnZhbHVlID4gMCAmJiB0aGlzLmlzSG9zZVZpc2libGVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICB0aGlzLmxlYWthZ2VWb2x1bWUgPSAwO1xyXG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLmhvc2Uucm90YXRpb25QaXZvdFkgKyB0aGlzLndhdGVyVG93ZXIudGFua1Bvc2l0aW9uUHJvcGVydHkudmFsdWUueSArIDAuMTtcclxuICAgICAgICBpZiAoIHkgPCB0aGlzLndhdGVyVG93ZXIuZmx1aWRMZXZlbFByb3BlcnR5LnZhbHVlICsgdGhpcy53YXRlclRvd2VyLnRhbmtQb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgKSB7XHJcbiAgICAgICAgICB0aGlzLnZlbG9jaXR5TWFnbml0dWRlID0gTWF0aC5zcXJ0KCAyICogQ29uc3RhbnRzLkVBUlRIX0dSQVZJVFkgKlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCB0aGlzLndhdGVyVG93ZXIudGFua1Bvc2l0aW9uUHJvcGVydHkudmFsdWUueSArIHRoaXMud2F0ZXJUb3dlci5mbHVpZExldmVsUHJvcGVydHkudmFsdWUgLSB5ICkgKTtcclxuICAgICAgICAgIHdhdGVyVm9sdW1lRXhwZWxsZWQgPSB0aGlzLnZlbG9jaXR5TWFnbml0dWRlICogMi44ICogMC4wMTY7XHJcbiAgICAgICAgICByZW1haW5pbmdWb2x1bWUgPSB0aGlzLndhdGVyVG93ZXIuZmx1aWRWb2x1bWVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICAgIHRoaXMubGVha2FnZVZvbHVtZSA9IHJlbWFpbmluZ1ZvbHVtZSA+IHdhdGVyVm9sdW1lRXhwZWxsZWQgPyB3YXRlclZvbHVtZUV4cGVsbGVkIDogcmVtYWluaW5nVm9sdW1lO1xyXG5cclxuICAgICAgICAgIG5ld0hvc2VEcm9wID0gbmV3IFdhdGVyRHJvcCggbmV3IFZlY3RvcjIoIHRoaXMuaG9zZS5yb3RhdGlvblBpdm90WCArIHRoaXMud2F0ZXJUb3dlci50YW5rUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54ICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDIgKiB0aGlzLndhdGVyVG93ZXIuVEFOS19SQURJVVMgLSAwLjEgKyBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogMC4yIC0gMC4xLFxyXG4gICAgICAgICAgICB5ICsgZG90UmFuZG9tLm5leHREb3VibGUoKSAqIDAuMiAtIDAuMSApLFxyXG4gICAgICAgICAgICBuZXcgVmVjdG9yMiggdGhpcy52ZWxvY2l0eU1hZ25pdHVkZSAqIE1hdGguY29zKCB0aGlzLmhvc2UuYW5nbGVQcm9wZXJ0eS52YWx1ZSApLFxyXG4gICAgICAgICAgICAgIHRoaXMudmVsb2NpdHlNYWduaXR1ZGUgKiBNYXRoLnNpbiggdGhpcy5ob3NlLmFuZ2xlUHJvcGVydHkudmFsdWUgKSApLCB0aGlzLmxlYWthZ2VWb2x1bWUgKTtcclxuXHJcbiAgICAgICAgICB0aGlzLmhvc2VEcm9wcy5wdXNoKCBuZXdIb3NlRHJvcCApO1xyXG4gICAgICAgICAgbmV3SG9zZURyb3Auc3RlcCggdGhpcy5hY2N1bXVsYXRlZER0ICk7XHJcbiAgICAgICAgICB0aGlzLm5ld0hvc2VEcm9wcy5wdXNoKCBuZXdIb3NlRHJvcCApO1xyXG4gICAgICAgICAgdGhpcy53YXRlclRvd2VyLmZsdWlkVm9sdW1lUHJvcGVydHkudmFsdWUgPSB0aGlzLndhdGVyVG93ZXIuZmx1aWRWb2x1bWVQcm9wZXJ0eS52YWx1ZSAtIHRoaXMubGVha2FnZVZvbHVtZTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoIGxldCBpID0gMCwgbnVtYmVyT2ZEcm9wcyA9IHRoaXMuZmF1Y2V0RHJvcHMubGVuZ3RoOyBpIDwgbnVtYmVyT2ZEcm9wczsgaSsrICkge1xyXG4gICAgICAvLyBzdGVwIG9ubHkgdGhlICdvbGQnIGRyb3BzXHJcbiAgICAgIGlmICggdGhpcy5uZXdGYXVjZXREcm9wcy5pbmRleE9mKCB0aGlzLmZhdWNldERyb3BzLmdldCggaSApICkgPT09IC0xICkge1xyXG4gICAgICAgIHRoaXMuZmF1Y2V0RHJvcHMuZ2V0KCBpICkuc3RlcCggZHQgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gY2hlY2sgaWYgdGhlIGZhdWNldERyb3BzIGhpdCB0aGUgZmx1aWRMZXZlbFxyXG4gICAgICBpZiAoIHRoaXMuZmF1Y2V0RHJvcHMuZ2V0KCBpICkucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55IDwgdGhpcy53YXRlclRvd2VyLnRhbmtQb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgK1xyXG4gICAgICAgICAgICggKCB0aGlzLndhdGVyVG93ZXIuZmx1aWRMZXZlbFByb3BlcnR5LnZhbHVlID4gdGhpcy5mYXVjZXREcm9wcy5nZXQoIGkgKS5yYWRpdXMgKSA/XHJcbiAgICAgICAgICAgICB0aGlzLndhdGVyVG93ZXIuZmx1aWRMZXZlbFByb3BlcnR5LnZhbHVlICsgdGhpcy5mYXVjZXREcm9wcy5nZXQoIGkgKS5yYWRpdXMgOlxyXG4gICAgICAgICAgICAgMC4zICsgdGhpcy5mYXVjZXREcm9wcy5nZXQoIGkgKS5yYWRpdXMgKSApIHtcclxuICAgICAgICB0aGlzLmRyb3BzVG9SZW1vdmUucHVzaCggdGhpcy5mYXVjZXREcm9wcy5nZXQoIGkgKSApO1xyXG5cclxuICAgICAgICBpZiAoIHRoaXMud2F0ZXJUb3dlci5mbHVpZFZvbHVtZVByb3BlcnR5LnZhbHVlIDwgdGhpcy53YXRlclRvd2VyLlRBTktfVk9MVU1FICkge1xyXG4gICAgICAgICAgdGhpcy53YXRlclRvd2VyLmZsdWlkVm9sdW1lUHJvcGVydHkudmFsdWUgPSB0aGlzLndhdGVyVG93ZXIuZmx1aWRWb2x1bWVQcm9wZXJ0eS52YWx1ZSArIHRoaXMuZmF1Y2V0RHJvcHMuZ2V0KCBpICkudm9sdW1lUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIHRoaXMud2F0ZXJUb3dlci5mbHVpZFZvbHVtZVByb3BlcnR5LnZhbHVlID4gdGhpcy53YXRlclRvd2VyLlRBTktfVk9MVU1FICkge1xyXG4gICAgICAgICAgdGhpcy53YXRlclRvd2VyLmZsdWlkVm9sdW1lUHJvcGVydHkudmFsdWUgPSB0aGlzLndhdGVyVG93ZXIuVEFOS19WT0xVTUU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSB2YWx1ZSBvbmx5IHdoZW4gaXQgaXMgbGVzcyB0aGFuIDEuIFdlIGFyZSBvbmx5IGludGVyZXN0ZWQgaW4gdGhlIDEgc2VjIGJvdW5kYXJ5LlxyXG4gICAgLy8gT3RoZXJ3aXNlIGl0IHdpbGwgZW1pdCB0b28gbWFueSB1cGRhdGVzLlxyXG4gICAgaWYgKCB0aGlzLndhdGVyVG93ZXIuZmx1aWRWb2x1bWVQcm9wZXJ0eS52YWx1ZSA+PSAwLjk5NSAqIHRoaXMud2F0ZXJUb3dlci5UQU5LX1ZPTFVNRSApIHtcclxuICAgICAgaWYgKCB0aGlzLnRhbmtGdWxsTGV2ZWxEdXJhdGlvblByb3BlcnR5LnZhbHVlIDwgMC4yICkge1xyXG4gICAgICAgIHRoaXMudGFua0Z1bGxMZXZlbER1cmF0aW9uUHJvcGVydHkudmFsdWUgKz0gZHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnRhbmtGdWxsTGV2ZWxEdXJhdGlvblByb3BlcnR5LnZhbHVlID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMuZHJvcHNUb1JlbW92ZS5sZW5ndGggPiAwICkge1xyXG4gICAgICB0aGlzLmZhdWNldERyb3BzLnJlbW92ZUFsbCggdGhpcy5kcm9wc1RvUmVtb3ZlLmZpbHRlciggZHJvcCA9PiB0aGlzLmZhdWNldERyb3BzLmluY2x1ZGVzKCBkcm9wICkgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZHJvcHNUb1JlbW92ZSA9IFtdO1xyXG4gICAgZm9yICggbGV0IGkgPSAwLCBudW1iZXJPZkRyb3BzID0gdGhpcy53YXRlclRvd2VyRHJvcHMubGVuZ3RoOyBpIDwgbnVtYmVyT2ZEcm9wczsgaSsrICkge1xyXG4gICAgICAvL3N0ZXAgb25seSB0aGUgJ29sZCcgZHJvcHNcclxuICAgICAgaWYgKCB0aGlzLm5ld1dhdGVyVG93ZXJEcm9wcy5pbmRleE9mKCB0aGlzLndhdGVyVG93ZXJEcm9wcy5nZXQoIGkgKSApID09PSAtMSApIHtcclxuICAgICAgICB0aGlzLndhdGVyVG93ZXJEcm9wcy5nZXQoIGkgKS5zdGVwKCBkdCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvL3JlbW92ZSB0aGVtIGFzIHNvb24gYXMgdGhleSBnbyBiZWxvdyB0aGUgZ3JvdW5kXHJcbiAgICAgIGlmICggdGhpcy53YXRlclRvd2VyRHJvcHMuZ2V0KCBpICkucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55IDwgMCApIHtcclxuICAgICAgICB0aGlzLmRyb3BzVG9SZW1vdmUucHVzaCggdGhpcy53YXRlclRvd2VyRHJvcHMuZ2V0KCBpICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy5kcm9wc1RvUmVtb3ZlLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgIHRoaXMud2F0ZXJUb3dlckRyb3BzLnJlbW92ZUFsbCggdGhpcy5kcm9wc1RvUmVtb3ZlLmZpbHRlciggZHJvcCA9PiB0aGlzLndhdGVyVG93ZXJEcm9wcy5pbmNsdWRlcyggZHJvcCApICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvL2hvc2VcclxuICAgIHRoaXMuZHJvcHNUb1JlbW92ZSA9IFtdO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMCwgbnVtYmVyT2ZEcm9wcyA9IHRoaXMuaG9zZURyb3BzLmxlbmd0aDsgaSA8IG51bWJlck9mRHJvcHM7IGkrKyApIHtcclxuICAgICAgLy9zdGVwIG9ubHkgdGhlICdvbGQnIGRyb3BzXHJcbiAgICAgIGlmICggdGhpcy5uZXdIb3NlRHJvcHMuaW5kZXhPZiggdGhpcy5ob3NlRHJvcHMuZ2V0KCBpICkgKSA9PT0gLTEgKSB7XHJcbiAgICAgICAgdGhpcy5ob3NlRHJvcHMuZ2V0KCBpICkuc3RlcCggZHQgKTtcclxuICAgICAgfVxyXG4gICAgICAvL3JlbW92ZSB0aGVtIGFzIHNvb24gYXMgdGhleSBoaXQgdGhlIGdyb3VuZFxyXG4gICAgICBpZiAoIHRoaXMuaG9zZURyb3BzLmdldCggaSApLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueSA8IDAgKSB7XHJcbiAgICAgICAgdGhpcy5kcm9wc1RvUmVtb3ZlLnB1c2goIHRoaXMuaG9zZURyb3BzLmdldCggaSApICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMuZHJvcHNUb1JlbW92ZS5sZW5ndGggPiAwICkge1xyXG4gICAgICB0aGlzLmhvc2VEcm9wcy5yZW1vdmVBbGwoIHRoaXMuZHJvcHNUb1JlbW92ZS5maWx0ZXIoIGRyb3AgPT4gdGhpcy5ob3NlRHJvcHMuaW5jbHVkZXMoIGRyb3AgKSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdXBkYXRlIHNlbnNvciB2YWx1ZXMgb25seSBhYm91dCAxMCB0aW1lcyBwZXIgc2VjXHJcbiAgICAvLyB1cGRhdGUgdGhlIHNlbnNvciB2YWx1ZXMgb25seSB3aGVuIHdhdGVyIGlzIGZsb3dpbmdcclxuICAgIGlmICggdGhpcy5hY2N1bXVsYXRlZER0Rm9yU2Vuc29ycyA+IDAuMSAmJlxyXG4gICAgICAgICAoIHRoaXMuaG9zZURyb3BzLmxlbmd0aCA+IDAgfHwgdGhpcy53YXRlclRvd2VyRHJvcHMubGVuZ3RoID4gMCB8fCB0aGlzLmZhdWNldERyb3BzLmxlbmd0aCA+IDAgKSApIHtcclxuICAgICAgdGhpcy5hY2N1bXVsYXRlZER0Rm9yU2Vuc29ycyAtPSAwLjE7XHJcbiAgICAgIGZvciAoIGxldCBrID0gMDsgayA8IHRoaXMuc3BlZWRvbWV0ZXJzLmxlbmd0aDsgaysrICkge1xyXG4gICAgICAgIHRoaXMuc3BlZWRvbWV0ZXJzWyBrIF0udmFsdWVQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuZ2V0V2F0ZXJEcm9wVmVsb2NpdHlBdCggdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxYKCB0aGlzLnNwZWVkb21ldGVyc1sgayBdLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueCArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDUwICksXHJcbiAgICAgICAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbFkoIHRoaXMuc3BlZWRvbWV0ZXJzWyBrIF0ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ICsgNzIgKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0Rmx1aWREZW5zaXR5U3RyaW5nKCkge1xyXG4gICAgaWYgKCB0aGlzLm1lYXN1cmVVbml0c1Byb3BlcnR5LnZhbHVlID09PSAnZW5nbGlzaCcgKSB7XHJcbiAgICAgIHJldHVybiBTdHJpbmdVdGlscy5mb3JtYXQoIHZhbHVlV2l0aFVuaXRzUGF0dGVyblN0cmluZyxcclxuICAgICAgICBVdGlscy50b0ZpeGVkKCBVbml0cy5GTFVJRF9ERU5TSVRZX0VOR0xJU0hfUEVSX01FVFJJQyAqIHRoaXMuZmx1aWREZW5zaXR5UHJvcGVydHkudmFsdWUsIDIgKSwgZGVuc2l0eVVuaXRzRW5nbGlzaFN0cmluZyApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBTdHJpbmdVdGlscy5mb3JtYXQoIHZhbHVlV2l0aFVuaXRzUGF0dGVyblN0cmluZywgVXRpbHMucm91bmRTeW1tZXRyaWMoIHRoaXMuZmx1aWREZW5zaXR5UHJvcGVydHkudmFsdWUgKSwgZGVuc2l0eVVuaXRzTWV0cmljU3RyaW5nICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0V2F0ZXJEcm9wVmVsb2NpdHlBdCggeCwgeSApIHtcclxuXHJcbiAgICAvLyBUaGVyZSBtaWdodCBiZSB3YXRlcmRyb3BzIHVuZGVyIHRoZSBncm91bmQgdGhhdCBhcmUgbm90IHlldCByZW1vdmVkLlxyXG4gICAgLy8gUmVwb3J0ICgwLDApIHZlbG9jaXR5IGZvciBhbGwgdGhvc2UgZHJvcHMuXHJcbiAgICBpZiAoIHkgPCAwICkge1xyXG4gICAgICByZXR1cm4gVmVjdG9yMi5aRVJPO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCB3YXRlckRyb3BzID0gdGhpcy53YXRlclRvd2VyRHJvcHM7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDAsIGogPSB3YXRlckRyb3BzLmxlbmd0aDsgaSA8IGo7IGkrKyApIHtcclxuICAgICAgaWYgKCB3YXRlckRyb3BzLmdldCggaSApLmNvbnRhaW5zKCBuZXcgVmVjdG9yMiggeCwgeSApICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIHdhdGVyRHJvcHMuZ2V0KCBpICkudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHdhdGVyRHJvcHMgPSB0aGlzLmhvc2VEcm9wcztcclxuICAgIGZvciAoIGxldCBpID0gMCwgaiA9IHdhdGVyRHJvcHMubGVuZ3RoOyBpIDwgajsgaSsrICkge1xyXG4gICAgICBpZiAoIHdhdGVyRHJvcHMuZ2V0KCBpICkuY29udGFpbnMoIG5ldyBWZWN0b3IyKCB4LCB5ICkgKSApIHtcclxuICAgICAgICByZXR1cm4gd2F0ZXJEcm9wcy5nZXQoIGkgKS52ZWxvY2l0eVByb3BlcnR5LnZhbHVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFZlY3RvcjIuWkVSTztcclxuICB9XHJcbn1cclxuXHJcbmZsdWlkUHJlc3N1cmVBbmRGbG93LnJlZ2lzdGVyKCAnV2F0ZXJUb3dlck1vZGVsJywgV2F0ZXJUb3dlck1vZGVsICk7XHJcbmV4cG9ydCBkZWZhdWx0IFdhdGVyVG93ZXJNb2RlbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLHFCQUFxQixNQUFNLDhDQUE4QztBQUNoRixPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxlQUFlLE1BQU0sdUNBQXVDO0FBQ25FLE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsT0FBT0MsU0FBUyxNQUFNLDJCQUEyQjtBQUNqRCxPQUFPQyxlQUFlLE1BQU0sdUNBQXVDO0FBQ25FLE9BQU9DLHNCQUFzQixNQUFNLDhDQUE4QztBQUNqRixPQUFPQyxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsY0FBYyxNQUFNLHNDQUFzQztBQUNqRSxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7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