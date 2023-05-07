// Copyright 2015-2023, University of Colorado Boulder

/**
 * Model for the "intro" Screen, which has an upper and lower medium, interfacing at the middle of the screen,
 * and the laser at the top left shining toward the interface.  This is a subclass of BendingLightScreenView.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Ray2 from '../../../../dot/js/Ray2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import { Color } from '../../../../scenery/js/imports.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../../common/BendingLightConstants.js';
import BendingLightModel from '../../common/model/BendingLightModel.js';
import IntensityMeter from '../../common/model/IntensityMeter.js';
import LightRay from '../../common/model/LightRay.js';
import Medium from '../../common/model/Medium.js';
import Reading from '../../common/model/Reading.js';
import Substance from '../../common/model/Substance.js';
import WaveParticle from '../../common/model/WaveParticle.js';
import LaserViewEnum from '../../common/model/LaserViewEnum.js';
import Multilink from '../../../../axon/js/Multilink.js';

// constants
const CHARACTERISTIC_LENGTH = BendingLightConstants.WAVELENGTH_RED;

// If the ray is too long in this step, then webgl will have rendering artifacts, see #147
const BEAM_LENGTH = 1E-3;
class IntroModel extends BendingLightModel {
  /**
   * @param bottomSubstance - state of bottom medium
   * @param horizontalPlayAreaOffset - specifies center alignment
   * @param tandem
   */
  constructor(bottomSubstance, horizontalPlayAreaOffset, tandem) {
    super(Math.PI * 3 / 4, true, BendingLightModel.DEFAULT_LASER_DISTANCE_FROM_PIVOT, tandem);

    // Top medium
    // TODO: Split this into topSubstanceProperty for phet-io
    const topMedium = new Medium(Shape.rect(-0.1, 0, 0.2, 0.1), Substance.AIR, this.mediumColorFactory.getColor(Substance.AIR.indexOfRefractionForRedLight));
    this.topMediumProperty = new Property(topMedium, {
      // TODO: https://github.com/phetsims/bending-light/issues/414
      hasListenerOrderDependencies: true,
      // See https://github.com/phetsims/bending-light/issues/378
      reentrant: true,
      tandem: tandem.createTandem('topMediumProperty'),
      phetioValueType: Medium.MediumIO
    });

    // Bottom medium
    const bottomMedium = new Medium(Shape.rect(-0.1, -0.1, 0.2, 0.1), bottomSubstance, this.mediumColorFactory.getColor(bottomSubstance.indexOfRefractionForRedLight));
    this.bottomMediumProperty = new Property(bottomMedium, {
      // TODO: https://github.com/phetsims/bending-light/issues/414
      hasListenerOrderDependencies: true,
      // See https://github.com/phetsims/bending-light/issues/378
      reentrant: true,
      tandem: tandem.createTandem('bottomMediumProperty'),
      phetioValueType: Medium.MediumIO
    });
    this.time = 0;

    // Update the top medium index of refraction when top medium change
    // (read-only)
    this.indexOfRefractionOfTopMediumProperty = new DerivedProperty([this.topMediumProperty, this.laser.colorProperty], (topMedium, color) => topMedium.getIndexOfRefraction(color.wavelength), {
      tandem: tandem.createTandem('indexOfRefractionOfTopMediumProperty'),
      phetioValueType: NumberIO
    });

    // Update the bottom medium index of refraction when bottom medium change
    // (read-only)
    this.indexOfRefractionOfBottomMediumProperty = new DerivedProperty([this.bottomMediumProperty, this.laser.colorProperty], (bottomMedium, color) => bottomMedium.getIndexOfRefraction(color.wavelength), {
      tandem: tandem.createTandem('indexOfRefractionOfBottomMediumProperty'),
      phetioValueType: NumberIO
    });

    // (read-only)-model components
    this.intensityMeter = new IntensityMeter(-this.modelWidth * (horizontalPlayAreaOffset ? 0.34 : 0.48), -this.modelHeight * 0.285, -this.modelWidth * (horizontalPlayAreaOffset ? 0.282 : 0.421), -this.modelHeight * 0.312);
    Multilink.multilink([this.laserViewProperty, this.laser.onProperty, this.intensityMeter.sensorPositionProperty, this.intensityMeter.enabledProperty, this.laser.emissionPointProperty, this.laser.colorProperty, this.indexOfRefractionOfBottomMediumProperty, this.indexOfRefractionOfTopMediumProperty], () => {
      // clear the accumulator in the intensity meter so it can sum up the newly created rays
      this.intensityMeter.clearRayReadings();
      this.updateModel();
      if (this.laserViewProperty.value === LaserViewEnum.WAVE && this.laser.onProperty.value) {
        if (!this.allowWebGL) {
          this.createInitialParticles();
        }
      }
    });

    // Note: vectors that are used in step function are created here to reduce Vector2 allocations
    // light ray tail position
    this.tailVector = new Vector2(0, 0);

    // light ray tip position
    this.tipVector = new Vector2(0, 0);
    this.rotationArrowAngleOffset = -Math.PI / 4;
  }

  /**
   * Light rays were cleared from model before propagateRays was called, this creates them according to the laser and
   * mediums
   */
  propagateRays() {
    if (this.laser.onProperty.value) {
      const tail = this.laser.emissionPointProperty.value;

      // Snell's law, see http://en.wikipedia.org/wiki/Snell's_law for definition of n1, n2, theta1, theta2
      // index in top medium
      const n1 = this.indexOfRefractionOfTopMediumProperty.get();

      // index of bottom medium
      const n2 = this.indexOfRefractionOfBottomMediumProperty.get();

      // angle from the up vertical
      const theta1 = this.laser.getAngle() - Math.PI / 2;

      // angle from the down vertical
      const theta2 = Math.asin(n1 / n2 * Math.sin(theta1));

      // start with full strength laser
      const sourcePower = 1.0;

      // cross section of incident light, used to compute wave widths
      const a = CHARACTERISTIC_LENGTH * 4;

      // This one fixes the input beam to be a fixed width independent of angle
      const sourceWaveWidth = a / 2;

      // according to http://en.wikipedia.org/wiki/Wavelength
      const color = this.laser.colorProperty.get().getColor();
      const wavelengthInTopMedium = this.laser.colorProperty.get().wavelength / n1;

      // calculated wave width of reflected and refracted wave width.
      // specially used in in wave Mode
      const trapeziumWidth = Math.abs(sourceWaveWidth / Math.sin(this.laser.getAngle()));

      // since the n1 depends on the wavelength, when you change the wavelength,
      // the wavelengthInTopMedium also changes (seemingly in the opposite direction)
      const incidentRay = new LightRay(trapeziumWidth, tail, new Vector2(0, 0), n1, wavelengthInTopMedium, this.laser.getWavelength() * 1E9, sourcePower, color, sourceWaveWidth, 0.0, true, false, this.laserViewProperty.value, 'incident');
      const rayAbsorbed = this.addAndAbsorb(incidentRay, 'incident');
      if (!rayAbsorbed) {
        const thetaOfTotalInternalReflection = Math.asin(n2 / n1);
        let hasTransmittedRay = isNaN(thetaOfTotalInternalReflection) || theta1 < thetaOfTotalInternalReflection;

        // reflected
        // assuming perpendicular beam polarization, compute percent power
        let reflectedPowerRatio;
        if (hasTransmittedRay) {
          reflectedPowerRatio = BendingLightModel.getReflectedPower(n1, n2, Math.cos(theta1), Math.cos(theta2));
        } else {
          reflectedPowerRatio = 1.0;
        }

        // If nothing is transmitted, do not create a 0 power transmitted ray, see #296
        if (reflectedPowerRatio === 1.0) {
          hasTransmittedRay = false;
        }

        // make sure it has enough power to show up on the intensity meter, after rounding
        const hasReflectedRay = reflectedPowerRatio >= 0.005;
        if (hasReflectedRay) {
          const reflectedRay = new LightRay(trapeziumWidth, new Vector2(0, 0), Vector2.createPolar(BEAM_LENGTH, Math.PI - this.laser.getAngle()), n1, wavelengthInTopMedium, this.laser.getWavelength() * 1E9, reflectedPowerRatio * sourcePower, color, sourceWaveWidth, incidentRay.getNumberOfWavelengths(), true, true, this.laserViewProperty.value, 'reflected');
          this.addAndAbsorb(reflectedRay, 'reflected');
        } else {
          reflectedPowerRatio = 0;
        }

        // fire a transmitted ray if there wasn't total internal reflection
        if (hasTransmittedRay) {
          // transmitted
          // n2/n1 = L1/L2 => L2 = L1*n2/n1
          const transmittedWavelength = incidentRay.wavelength / n2 * n1;
          if (!(isNaN(theta2) || !isFinite(theta2))) {
            let transmittedPowerRatio = BendingLightModel.getTransmittedPower(n1, n2, Math.cos(theta1), Math.cos(theta2));
            if (!hasReflectedRay) {
              transmittedPowerRatio = 1;
            }

            // make the beam width depend on the input beam width, so that the same beam width is transmitted as was
            // intercepted
            const beamHalfWidth = a / 2;
            const extentInterceptedHalfWidth = beamHalfWidth / Math.sin(Math.PI / 2 - theta1) / 2;
            const transmittedBeamHalfWidth = Math.cos(theta2) * extentInterceptedHalfWidth;
            const transmittedWaveWidth = transmittedBeamHalfWidth * 2;
            const transmittedRay = new LightRay(trapeziumWidth, new Vector2(0, 0), Vector2.createPolar(BEAM_LENGTH, theta2 - Math.PI / 2), n2, transmittedWavelength, this.laser.getWavelength() * 1E9, transmittedPowerRatio * sourcePower, color, transmittedWaveWidth, incidentRay.getNumberOfWavelengths(), true, true, this.laserViewProperty.value, 'transmitted');
            this.addAndAbsorb(transmittedRay, 'transmitted');
          }
        }
      }
    }
  }

  /**
   * Checks whether the intensity meter should absorb the ray, and if so adds a truncated ray.
   * If the intensity meter misses the ray, the original ray is added.
   * @param ray - model of light ray
   * @param rayType - 'incident', 'transmitted' or 'reflected'
   */
  addAndAbsorb(ray, rayType) {
    const angleOffset = rayType === 'incident' ? Math.PI : 0;

    // find intersection points with the intensity sensor
    const intersects = this.intensityMeter.enabledProperty.value ? ray.getIntersections(this.intensityMeter.getSensorShape(), rayType) : [];

    // if it intersected, then absorb the ray
    let rayAbsorbed = intersects.length > 0;
    if (rayAbsorbed) {
      let x;
      let y;
      assert && assert(intersects.length <= 2, 'too many intersections');
      if (intersects.length === 1) {
        // intersect point at sensor shape start position when laser within sensor region
        x = intersects[0].point.x;
        y = intersects[0].point.y;
      } else {
        assert && assert(intersects.length === 2);
        x = (intersects[0].point.x + intersects[1].point.x) / 2;
        y = (intersects[0].point.y + intersects[1].point.y) / 2;
      }
      const distance = Math.sqrt(x * x + y * y);
      const interrupted = new LightRay(ray.trapeziumWidth, ray.tail, Vector2.createPolar(distance, ray.getAngle() + angleOffset), ray.indexOfRefraction, ray.wavelength, this.laser.getWavelength() * 1E9, ray.powerFraction, this.laser.colorProperty.get().getColor(), ray.waveWidth, ray.numWavelengthsPhaseOffset, false, ray.extendBackwards, this.laserViewProperty.value, rayType);

      // don't let the wave intersect the intensity meter if it is behind the laser emission point
      const isForward = ray.toVector().dot(interrupted.toVector()) > 0;
      if (interrupted.getLength() < ray.getLength() && isForward) {
        this.addRay(interrupted);
      } else {
        this.addRay(ray);
        rayAbsorbed = false;
      }
    } else {
      this.addRay(ray);
    }
    if (rayAbsorbed) {
      this.intensityMeter.addRayReading(new Reading(ray.powerFraction));
    } else {
      this.intensityMeter.addRayReading(Reading.MISS);
    }
    return rayAbsorbed;
  }
  reset() {
    super.reset();
    this.topMediumProperty.reset();
    this.bottomMediumProperty.reset();
    this.intensityMeter.reset();
  }

  /**
   * Determine the velocity of the topmost light ray at the specified position, if one exists, otherwise None
   * @param position - position where the velocity to be determined
   */
  getVelocity(position) {
    const laserView = this.laserViewProperty.value;
    for (let i = 0; i < this.rays.length; i++) {
      if (this.rays[i].contains(position, laserView === LaserViewEnum.WAVE)) {
        return this.rays[i].getVelocityVector();
      }
    }
    return new Vector2(0, 0);
  }

  /**
   * Determine the wave value of the topmost light ray at the specified position, or None if none exists
   * @param position - position where the wave value to be determined
   * @returns - returns object of time and magnitude if point is on ray otherwise returns null
   */
  getWaveValue(position) {
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      if (ray.contains(position, this.laserViewProperty.value === LaserViewEnum.WAVE)) {
        // map power to displayed amplitude
        const amplitude = Math.sqrt(ray.powerFraction);

        // find out how far the light has come, so we can compute the remainder of phases
        const rayUnitVector = ray.getUnitVector();
        const x = position.x - ray.tail.x;
        const y = position.y - ray.tail.y;
        const distanceAlongRay = rayUnitVector.x * x + rayUnitVector.y * y;
        const phase = ray.getCosArg(distanceAlongRay);

        // wave is a*cos(theta)
        return {
          time: ray.time,
          magnitude: amplitude * Math.cos(phase + Math.PI)
        };
      }
    }
    return null;
  }

  /**
   * Called by the animation loop.
   */
  step() {
    if (this.isPlayingProperty.value) {
      this.updateSimulationTimeAndWaveShape(this.speedProperty.value);
    }
  }

  /**
   * Update simulation time and wave propagation.
   */
  updateSimulationTimeAndWaveShape(speed) {
    // Update the time
    this.time = this.time + (speed === TimeSpeed.NORMAL ? 1E-16 : 0.5E-16);

    // set time for each ray
    this.rays.forEach(ray => ray.setTime(this.time));
    if (this.laser.onProperty.value && this.laserViewProperty.value === LaserViewEnum.WAVE) {
      if (!this.allowWebGL) {
        this.propagateParticles();
      }
    }
  }

  /**
   * create the particles between light ray tail and and tip
   */
  createInitialParticles() {
    let particleColor;
    let particleGradientColor;
    let j;
    for (let k = 0; k < this.rays.length; k++) {
      const lightRay = this.rays[k];
      const directionVector = lightRay.getUnitVector();
      const wavelength = lightRay.wavelength;
      const angle = lightRay.getAngle();
      if (k === 0) {
        // calculating tip and tail for incident ray
        this.tipVector.x = lightRay.tip.x + directionVector.x * lightRay.trapeziumWidth / 2 * Math.cos(angle);
        this.tipVector.y = lightRay.tip.y + directionVector.y * lightRay.trapeziumWidth / 2 * Math.cos(angle);
        this.tailVector.x = lightRay.tail.x;
        this.tailVector.y = lightRay.tail.y;
      } else {
        // calculating tip and tail for reflected and refracted rays
        this.tipVector.x = 1 * Math.cos(angle);
        this.tipVector.y = 1 * Math.sin(angle);
        this.tailVector.x = lightRay.tail.x - directionVector.x * lightRay.trapeziumWidth / 2 * Math.cos(angle);
        this.tailVector.y = lightRay.tail.y - directionVector.y * lightRay.trapeziumWidth / 2 * Math.cos(angle);
      }
      const lightRayInRay2Form = new Ray2(this.tailVector, directionVector);
      const distance = this.tipVector.distance(this.tailVector);
      const gapBetweenSuccessiveParticles = wavelength;
      particleColor = new Color(lightRay.color.getRed(), lightRay.color.getGreen(), lightRay.color.getBlue(), Math.sqrt(lightRay.powerFraction)).toCSS();
      particleGradientColor = new Color(0, 0, 0, Math.sqrt(lightRay.powerFraction)).toCSS();

      // calculate the number of particles that can fit in the distance
      const numberOfParticles = Math.min(Math.ceil(distance / gapBetweenSuccessiveParticles), 150) + 1;
      let waveParticleGap = 0;

      // create the wave particles
      for (j = 0; j < numberOfParticles; j++) {
        lightRay.particles.push(new WaveParticle(lightRayInRay2Form.pointAtDistance(waveParticleGap), lightRay.waveWidth, particleColor, particleGradientColor, angle, wavelength));
        waveParticleGap += gapBetweenSuccessiveParticles;
      }
    }
  }

  /**
   * Propagate the particles
   */
  propagateParticles() {
    for (let i = 0; i < this.rays.length; i++) {
      const lightRay = this.rays[i];
      const wavelength = lightRay.wavelength;
      const directionVector = lightRay.getUnitVector();
      const waveParticles = lightRay.particles;

      // Compute the total phase along the length of the ray.
      const totalPhaseOffsetInNumberOfWavelengths = lightRay.getPhaseOffset() / 2 / Math.PI;

      // Just keep the fractional part
      let phaseDiff = totalPhaseOffsetInNumberOfWavelengths % 1 * wavelength;
      let tailX;
      let tailY;
      const angle = lightRay.getAngle();
      if (i === 0) {
        // for incident ray
        tailX = lightRay.tail.x;
        tailY = lightRay.tail.y;
      } else {
        // for reflected and refracted ray
        const distance = lightRay.trapeziumWidth / 2 * Math.cos(angle);
        phaseDiff = (distance + phaseDiff) % wavelength;
        tailX = lightRay.tail.x - directionVector.x * lightRay.trapeziumWidth / 2 * Math.cos(angle);
        tailY = lightRay.tail.y - directionVector.y * lightRay.trapeziumWidth / 2 * Math.cos(angle);
      }

      // Changing the wave particle position within the wave particle phase
      for (let j = 0; j < waveParticles.length; j++) {
        const particle = waveParticles[j];
        particle.setX(tailX + directionVector.x * (j * wavelength + phaseDiff));
        particle.setY(tailY + directionVector.y * (j * wavelength + phaseDiff));
      }
    }
  }
}
bendingLight.register('IntroModel', IntroModel);
export default IntroModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlJheTIiLCJWZWN0b3IyIiwiU2hhcGUiLCJUaW1lU3BlZWQiLCJDb2xvciIsIk51bWJlcklPIiwiYmVuZGluZ0xpZ2h0IiwiQmVuZGluZ0xpZ2h0Q29uc3RhbnRzIiwiQmVuZGluZ0xpZ2h0TW9kZWwiLCJJbnRlbnNpdHlNZXRlciIsIkxpZ2h0UmF5IiwiTWVkaXVtIiwiUmVhZGluZyIsIlN1YnN0YW5jZSIsIldhdmVQYXJ0aWNsZSIsIkxhc2VyVmlld0VudW0iLCJNdWx0aWxpbmsiLCJDSEFSQUNURVJJU1RJQ19MRU5HVEgiLCJXQVZFTEVOR1RIX1JFRCIsIkJFQU1fTEVOR1RIIiwiSW50cm9Nb2RlbCIsImNvbnN0cnVjdG9yIiwiYm90dG9tU3Vic3RhbmNlIiwiaG9yaXpvbnRhbFBsYXlBcmVhT2Zmc2V0IiwidGFuZGVtIiwiTWF0aCIsIlBJIiwiREVGQVVMVF9MQVNFUl9ESVNUQU5DRV9GUk9NX1BJVk9UIiwidG9wTWVkaXVtIiwicmVjdCIsIkFJUiIsIm1lZGl1bUNvbG9yRmFjdG9yeSIsImdldENvbG9yIiwiaW5kZXhPZlJlZnJhY3Rpb25Gb3JSZWRMaWdodCIsInRvcE1lZGl1bVByb3BlcnR5IiwiaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llcyIsInJlZW50cmFudCIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1ZhbHVlVHlwZSIsIk1lZGl1bUlPIiwiYm90dG9tTWVkaXVtIiwiYm90dG9tTWVkaXVtUHJvcGVydHkiLCJ0aW1lIiwiaW5kZXhPZlJlZnJhY3Rpb25PZlRvcE1lZGl1bVByb3BlcnR5IiwibGFzZXIiLCJjb2xvclByb3BlcnR5IiwiY29sb3IiLCJnZXRJbmRleE9mUmVmcmFjdGlvbiIsIndhdmVsZW5ndGgiLCJpbmRleE9mUmVmcmFjdGlvbk9mQm90dG9tTWVkaXVtUHJvcGVydHkiLCJpbnRlbnNpdHlNZXRlciIsIm1vZGVsV2lkdGgiLCJtb2RlbEhlaWdodCIsIm11bHRpbGluayIsImxhc2VyVmlld1Byb3BlcnR5Iiwib25Qcm9wZXJ0eSIsInNlbnNvclBvc2l0aW9uUHJvcGVydHkiLCJlbmFibGVkUHJvcGVydHkiLCJlbWlzc2lvblBvaW50UHJvcGVydHkiLCJjbGVhclJheVJlYWRpbmdzIiwidXBkYXRlTW9kZWwiLCJ2YWx1ZSIsIldBVkUiLCJhbGxvd1dlYkdMIiwiY3JlYXRlSW5pdGlhbFBhcnRpY2xlcyIsInRhaWxWZWN0b3IiLCJ0aXBWZWN0b3IiLCJyb3RhdGlvbkFycm93QW5nbGVPZmZzZXQiLCJwcm9wYWdhdGVSYXlzIiwidGFpbCIsIm4xIiwiZ2V0IiwibjIiLCJ0aGV0YTEiLCJnZXRBbmdsZSIsInRoZXRhMiIsImFzaW4iLCJzaW4iLCJzb3VyY2VQb3dlciIsImEiLCJzb3VyY2VXYXZlV2lkdGgiLCJ3YXZlbGVuZ3RoSW5Ub3BNZWRpdW0iLCJ0cmFwZXppdW1XaWR0aCIsImFicyIsImluY2lkZW50UmF5IiwiZ2V0V2F2ZWxlbmd0aCIsInJheUFic29yYmVkIiwiYWRkQW5kQWJzb3JiIiwidGhldGFPZlRvdGFsSW50ZXJuYWxSZWZsZWN0aW9uIiwiaGFzVHJhbnNtaXR0ZWRSYXkiLCJpc05hTiIsInJlZmxlY3RlZFBvd2VyUmF0aW8iLCJnZXRSZWZsZWN0ZWRQb3dlciIsImNvcyIsImhhc1JlZmxlY3RlZFJheSIsInJlZmxlY3RlZFJheSIsImNyZWF0ZVBvbGFyIiwiZ2V0TnVtYmVyT2ZXYXZlbGVuZ3RocyIsInRyYW5zbWl0dGVkV2F2ZWxlbmd0aCIsImlzRmluaXRlIiwidHJhbnNtaXR0ZWRQb3dlclJhdGlvIiwiZ2V0VHJhbnNtaXR0ZWRQb3dlciIsImJlYW1IYWxmV2lkdGgiLCJleHRlbnRJbnRlcmNlcHRlZEhhbGZXaWR0aCIsInRyYW5zbWl0dGVkQmVhbUhhbGZXaWR0aCIsInRyYW5zbWl0dGVkV2F2ZVdpZHRoIiwidHJhbnNtaXR0ZWRSYXkiLCJyYXkiLCJyYXlUeXBlIiwiYW5nbGVPZmZzZXQiLCJpbnRlcnNlY3RzIiwiZ2V0SW50ZXJzZWN0aW9ucyIsImdldFNlbnNvclNoYXBlIiwibGVuZ3RoIiwieCIsInkiLCJhc3NlcnQiLCJwb2ludCIsImRpc3RhbmNlIiwic3FydCIsImludGVycnVwdGVkIiwiaW5kZXhPZlJlZnJhY3Rpb24iLCJwb3dlckZyYWN0aW9uIiwid2F2ZVdpZHRoIiwibnVtV2F2ZWxlbmd0aHNQaGFzZU9mZnNldCIsImV4dGVuZEJhY2t3YXJkcyIsImlzRm9yd2FyZCIsInRvVmVjdG9yIiwiZG90IiwiZ2V0TGVuZ3RoIiwiYWRkUmF5IiwiYWRkUmF5UmVhZGluZyIsIk1JU1MiLCJyZXNldCIsImdldFZlbG9jaXR5IiwicG9zaXRpb24iLCJsYXNlclZpZXciLCJpIiwicmF5cyIsImNvbnRhaW5zIiwiZ2V0VmVsb2NpdHlWZWN0b3IiLCJnZXRXYXZlVmFsdWUiLCJhbXBsaXR1ZGUiLCJyYXlVbml0VmVjdG9yIiwiZ2V0VW5pdFZlY3RvciIsImRpc3RhbmNlQWxvbmdSYXkiLCJwaGFzZSIsImdldENvc0FyZyIsIm1hZ25pdHVkZSIsInN0ZXAiLCJpc1BsYXlpbmdQcm9wZXJ0eSIsInVwZGF0ZVNpbXVsYXRpb25UaW1lQW5kV2F2ZVNoYXBlIiwic3BlZWRQcm9wZXJ0eSIsInNwZWVkIiwiTk9STUFMIiwiZm9yRWFjaCIsInNldFRpbWUiLCJwcm9wYWdhdGVQYXJ0aWNsZXMiLCJwYXJ0aWNsZUNvbG9yIiwicGFydGljbGVHcmFkaWVudENvbG9yIiwiaiIsImsiLCJsaWdodFJheSIsImRpcmVjdGlvblZlY3RvciIsImFuZ2xlIiwidGlwIiwibGlnaHRSYXlJblJheTJGb3JtIiwiZ2FwQmV0d2VlblN1Y2Nlc3NpdmVQYXJ0aWNsZXMiLCJnZXRSZWQiLCJnZXRHcmVlbiIsImdldEJsdWUiLCJ0b0NTUyIsIm51bWJlck9mUGFydGljbGVzIiwibWluIiwiY2VpbCIsIndhdmVQYXJ0aWNsZUdhcCIsInBhcnRpY2xlcyIsInB1c2giLCJwb2ludEF0RGlzdGFuY2UiLCJ3YXZlUGFydGljbGVzIiwidG90YWxQaGFzZU9mZnNldEluTnVtYmVyT2ZXYXZlbGVuZ3RocyIsImdldFBoYXNlT2Zmc2V0IiwicGhhc2VEaWZmIiwidGFpbFgiLCJ0YWlsWSIsInBhcnRpY2xlIiwic2V0WCIsInNldFkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkludHJvTW9kZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgZm9yIHRoZSBcImludHJvXCIgU2NyZWVuLCB3aGljaCBoYXMgYW4gdXBwZXIgYW5kIGxvd2VyIG1lZGl1bSwgaW50ZXJmYWNpbmcgYXQgdGhlIG1pZGRsZSBvZiB0aGUgc2NyZWVuLFxyXG4gKiBhbmQgdGhlIGxhc2VyIGF0IHRoZSB0b3AgbGVmdCBzaGluaW5nIHRvd2FyZCB0aGUgaW50ZXJmYWNlLiAgVGhpcyBpcyBhIHN1YmNsYXNzIG9mIEJlbmRpbmdMaWdodFNjcmVlblZpZXcuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgQ2hhbmRyYXNoZWthciBCZW1hZ29uaSAoQWN0dWFsIENvbmNlcHRzKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYXkyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYXkyLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUaW1lU3BlZWQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1RpbWVTcGVlZC5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBiZW5kaW5nTGlnaHQgZnJvbSAnLi4vLi4vYmVuZGluZ0xpZ2h0LmpzJztcclxuaW1wb3J0IEJlbmRpbmdMaWdodENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQmVuZGluZ0xpZ2h0Q29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEJlbmRpbmdMaWdodE1vZGVsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9CZW5kaW5nTGlnaHRNb2RlbC5qcyc7XHJcbmltcG9ydCBJbnRlbnNpdHlNZXRlciBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvSW50ZW5zaXR5TWV0ZXIuanMnO1xyXG5pbXBvcnQgTGlnaHRSYXkgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0xpZ2h0UmF5LmpzJztcclxuaW1wb3J0IE1lZGl1bSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvTWVkaXVtLmpzJztcclxuaW1wb3J0IFJlYWRpbmcgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1JlYWRpbmcuanMnO1xyXG5pbXBvcnQgU3Vic3RhbmNlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9TdWJzdGFuY2UuanMnO1xyXG5pbXBvcnQgV2F2ZVBhcnRpY2xlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9XYXZlUGFydGljbGUuanMnO1xyXG5pbXBvcnQgUmF5VHlwZUVudW0gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1JheVR5cGVFbnVtLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTGFzZXJWaWV3RW51bSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvTGFzZXJWaWV3RW51bS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IENIQVJBQ1RFUklTVElDX0xFTkdUSCA9IEJlbmRpbmdMaWdodENvbnN0YW50cy5XQVZFTEVOR1RIX1JFRDtcclxuXHJcbi8vIElmIHRoZSByYXkgaXMgdG9vIGxvbmcgaW4gdGhpcyBzdGVwLCB0aGVuIHdlYmdsIHdpbGwgaGF2ZSByZW5kZXJpbmcgYXJ0aWZhY3RzLCBzZWUgIzE0N1xyXG5jb25zdCBCRUFNX0xFTkdUSCA9IDFFLTM7XHJcblxyXG5jbGFzcyBJbnRyb01vZGVsIGV4dGVuZHMgQmVuZGluZ0xpZ2h0TW9kZWwge1xyXG4gIHB1YmxpYyB0b3BNZWRpdW1Qcm9wZXJ0eTogUHJvcGVydHk8TWVkaXVtPjtcclxuICBwdWJsaWMgYm90dG9tTWVkaXVtUHJvcGVydHk6IFByb3BlcnR5PE1lZGl1bT47XHJcbiAgcHVibGljIHRpbWU6IG51bWJlcjtcclxuICBwcml2YXRlIGluZGV4T2ZSZWZyYWN0aW9uT2ZUb3BNZWRpdW1Qcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPjtcclxuICBwcml2YXRlIGluZGV4T2ZSZWZyYWN0aW9uT2ZCb3R0b21NZWRpdW1Qcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPjtcclxuICBwdWJsaWMgaW50ZW5zaXR5TWV0ZXI6IEludGVuc2l0eU1ldGVyO1xyXG4gIHByaXZhdGUgdGFpbFZlY3RvcjogVmVjdG9yMjtcclxuICBwcml2YXRlIHRpcFZlY3RvcjogVmVjdG9yMjtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGJvdHRvbVN1YnN0YW5jZSAtIHN0YXRlIG9mIGJvdHRvbSBtZWRpdW1cclxuICAgKiBAcGFyYW0gaG9yaXpvbnRhbFBsYXlBcmVhT2Zmc2V0IC0gc3BlY2lmaWVzIGNlbnRlciBhbGlnbm1lbnRcclxuICAgKiBAcGFyYW0gdGFuZGVtXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBib3R0b21TdWJzdGFuY2U6IFN1YnN0YW5jZSwgaG9yaXpvbnRhbFBsYXlBcmVhT2Zmc2V0OiBib29sZWFuLCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICBzdXBlciggTWF0aC5QSSAqIDMgLyA0LCB0cnVlLCBCZW5kaW5nTGlnaHRNb2RlbC5ERUZBVUxUX0xBU0VSX0RJU1RBTkNFX0ZST01fUElWT1QsIHRhbmRlbSApO1xyXG5cclxuICAgIC8vIFRvcCBtZWRpdW1cclxuICAgIC8vIFRPRE86IFNwbGl0IHRoaXMgaW50byB0b3BTdWJzdGFuY2VQcm9wZXJ0eSBmb3IgcGhldC1pb1xyXG4gICAgY29uc3QgdG9wTWVkaXVtID0gbmV3IE1lZGl1bSggU2hhcGUucmVjdCggLTAuMSwgMCwgMC4yLCAwLjEgKSwgU3Vic3RhbmNlLkFJUixcclxuICAgICAgdGhpcy5tZWRpdW1Db2xvckZhY3RvcnkuZ2V0Q29sb3IoIFN1YnN0YW5jZS5BSVIuaW5kZXhPZlJlZnJhY3Rpb25Gb3JSZWRMaWdodCApICk7XHJcbiAgICB0aGlzLnRvcE1lZGl1bVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCB0b3BNZWRpdW0sIHtcclxuXHJcbiAgICAgIC8vIFRPRE86IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9iZW5kaW5nLWxpZ2h0L2lzc3Vlcy80MTRcclxuICAgICAgaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llczogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYmVuZGluZy1saWdodC9pc3N1ZXMvMzc4XHJcbiAgICAgIHJlZW50cmFudDogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndG9wTWVkaXVtUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogTWVkaXVtLk1lZGl1bUlPXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQm90dG9tIG1lZGl1bVxyXG4gICAgY29uc3QgYm90dG9tTWVkaXVtID0gbmV3IE1lZGl1bSggU2hhcGUucmVjdCggLTAuMSwgLTAuMSwgMC4yLCAwLjEgKSwgYm90dG9tU3Vic3RhbmNlLFxyXG4gICAgICB0aGlzLm1lZGl1bUNvbG9yRmFjdG9yeS5nZXRDb2xvciggYm90dG9tU3Vic3RhbmNlLmluZGV4T2ZSZWZyYWN0aW9uRm9yUmVkTGlnaHQgKSApO1xyXG4gICAgdGhpcy5ib3R0b21NZWRpdW1Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggYm90dG9tTWVkaXVtLCB7XHJcblxyXG4gICAgICAvLyBUT0RPOiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYmVuZGluZy1saWdodC9pc3N1ZXMvNDE0XHJcbiAgICAgIGhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXM6IHRydWUsXHJcblxyXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2JlbmRpbmctbGlnaHQvaXNzdWVzLzM3OFxyXG4gICAgICByZWVudHJhbnQ6IHRydWUsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2JvdHRvbU1lZGl1bVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IE1lZGl1bS5NZWRpdW1JT1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy50aW1lID0gMDtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIHRvcCBtZWRpdW0gaW5kZXggb2YgcmVmcmFjdGlvbiB3aGVuIHRvcCBtZWRpdW0gY2hhbmdlXHJcbiAgICAvLyAocmVhZC1vbmx5KVxyXG4gICAgdGhpcy5pbmRleE9mUmVmcmFjdGlvbk9mVG9wTWVkaXVtUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbXHJcbiAgICAgICAgdGhpcy50b3BNZWRpdW1Qcm9wZXJ0eSxcclxuICAgICAgICB0aGlzLmxhc2VyLmNvbG9yUHJvcGVydHlcclxuICAgICAgXSxcclxuICAgICAgKCB0b3BNZWRpdW0sIGNvbG9yICkgPT4gdG9wTWVkaXVtLmdldEluZGV4T2ZSZWZyYWN0aW9uKCBjb2xvci53YXZlbGVuZ3RoICksIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbmRleE9mUmVmcmFjdGlvbk9mVG9wTWVkaXVtUHJvcGVydHknICksXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdW1iZXJJT1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBib3R0b20gbWVkaXVtIGluZGV4IG9mIHJlZnJhY3Rpb24gd2hlbiBib3R0b20gbWVkaXVtIGNoYW5nZVxyXG4gICAgLy8gKHJlYWQtb25seSlcclxuICAgIHRoaXMuaW5kZXhPZlJlZnJhY3Rpb25PZkJvdHRvbU1lZGl1bVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggW1xyXG4gICAgICAgIHRoaXMuYm90dG9tTWVkaXVtUHJvcGVydHksXHJcbiAgICAgICAgdGhpcy5sYXNlci5jb2xvclByb3BlcnR5XHJcbiAgICAgIF0sXHJcbiAgICAgICggYm90dG9tTWVkaXVtLCBjb2xvciApID0+IGJvdHRvbU1lZGl1bS5nZXRJbmRleE9mUmVmcmFjdGlvbiggY29sb3Iud2F2ZWxlbmd0aCApLCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaW5kZXhPZlJlZnJhY3Rpb25PZkJvdHRvbU1lZGl1bVByb3BlcnR5JyApLFxyXG4gICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogTnVtYmVySU9cclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIChyZWFkLW9ubHkpLW1vZGVsIGNvbXBvbmVudHNcclxuICAgIHRoaXMuaW50ZW5zaXR5TWV0ZXIgPSBuZXcgSW50ZW5zaXR5TWV0ZXIoXHJcbiAgICAgIC10aGlzLm1vZGVsV2lkdGggKiAoIGhvcml6b250YWxQbGF5QXJlYU9mZnNldCA/IDAuMzQgOiAwLjQ4ICksXHJcbiAgICAgIC10aGlzLm1vZGVsSGVpZ2h0ICogMC4yODUsXHJcbiAgICAgIC10aGlzLm1vZGVsV2lkdGggKiAoIGhvcml6b250YWxQbGF5QXJlYU9mZnNldCA/IDAuMjgyIDogMC40MjEgKSxcclxuICAgICAgLXRoaXMubW9kZWxIZWlnaHQgKiAwLjMxMlxyXG4gICAgKTtcclxuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbXHJcbiAgICAgIHRoaXMubGFzZXJWaWV3UHJvcGVydHksXHJcbiAgICAgIHRoaXMubGFzZXIub25Qcm9wZXJ0eSxcclxuICAgICAgdGhpcy5pbnRlbnNpdHlNZXRlci5zZW5zb3JQb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICB0aGlzLmludGVuc2l0eU1ldGVyLmVuYWJsZWRQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5sYXNlci5lbWlzc2lvblBvaW50UHJvcGVydHksXHJcbiAgICAgIHRoaXMubGFzZXIuY29sb3JQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5pbmRleE9mUmVmcmFjdGlvbk9mQm90dG9tTWVkaXVtUHJvcGVydHksXHJcbiAgICAgIHRoaXMuaW5kZXhPZlJlZnJhY3Rpb25PZlRvcE1lZGl1bVByb3BlcnR5XHJcbiAgICBdLCAoKSA9PiB7XHJcblxyXG4gICAgICAvLyBjbGVhciB0aGUgYWNjdW11bGF0b3IgaW4gdGhlIGludGVuc2l0eSBtZXRlciBzbyBpdCBjYW4gc3VtIHVwIHRoZSBuZXdseSBjcmVhdGVkIHJheXNcclxuICAgICAgdGhpcy5pbnRlbnNpdHlNZXRlci5jbGVhclJheVJlYWRpbmdzKCk7XHJcbiAgICAgIHRoaXMudXBkYXRlTW9kZWwoKTtcclxuICAgICAgaWYgKCB0aGlzLmxhc2VyVmlld1Byb3BlcnR5LnZhbHVlID09PSBMYXNlclZpZXdFbnVtLldBVkUgJiYgdGhpcy5sYXNlci5vblByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIGlmICggIXRoaXMuYWxsb3dXZWJHTCApIHtcclxuICAgICAgICAgIHRoaXMuY3JlYXRlSW5pdGlhbFBhcnRpY2xlcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIE5vdGU6IHZlY3RvcnMgdGhhdCBhcmUgdXNlZCBpbiBzdGVwIGZ1bmN0aW9uIGFyZSBjcmVhdGVkIGhlcmUgdG8gcmVkdWNlIFZlY3RvcjIgYWxsb2NhdGlvbnNcclxuICAgIC8vIGxpZ2h0IHJheSB0YWlsIHBvc2l0aW9uXHJcbiAgICB0aGlzLnRhaWxWZWN0b3IgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG5cclxuICAgIC8vIGxpZ2h0IHJheSB0aXAgcG9zaXRpb25cclxuICAgIHRoaXMudGlwVmVjdG9yID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuXHJcbiAgICB0aGlzLnJvdGF0aW9uQXJyb3dBbmdsZU9mZnNldCA9IC1NYXRoLlBJIC8gNDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExpZ2h0IHJheXMgd2VyZSBjbGVhcmVkIGZyb20gbW9kZWwgYmVmb3JlIHByb3BhZ2F0ZVJheXMgd2FzIGNhbGxlZCwgdGhpcyBjcmVhdGVzIHRoZW0gYWNjb3JkaW5nIHRvIHRoZSBsYXNlciBhbmRcclxuICAgKiBtZWRpdW1zXHJcbiAgICovXHJcbiAgcHVibGljIHByb3BhZ2F0ZVJheXMoKTogdm9pZCB7XHJcbiAgICBpZiAoIHRoaXMubGFzZXIub25Qcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgY29uc3QgdGFpbCA9IHRoaXMubGFzZXIuZW1pc3Npb25Qb2ludFByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgICAgLy8gU25lbGwncyBsYXcsIHNlZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NuZWxsJ3NfbGF3IGZvciBkZWZpbml0aW9uIG9mIG4xLCBuMiwgdGhldGExLCB0aGV0YTJcclxuICAgICAgLy8gaW5kZXggaW4gdG9wIG1lZGl1bVxyXG4gICAgICBjb25zdCBuMSA9IHRoaXMuaW5kZXhPZlJlZnJhY3Rpb25PZlRvcE1lZGl1bVByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgICAgLy8gaW5kZXggb2YgYm90dG9tIG1lZGl1bVxyXG4gICAgICBjb25zdCBuMiA9IHRoaXMuaW5kZXhPZlJlZnJhY3Rpb25PZkJvdHRvbU1lZGl1bVByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgICAgLy8gYW5nbGUgZnJvbSB0aGUgdXAgdmVydGljYWxcclxuICAgICAgY29uc3QgdGhldGExID0gdGhpcy5sYXNlci5nZXRBbmdsZSgpIC0gTWF0aC5QSSAvIDI7XHJcblxyXG4gICAgICAvLyBhbmdsZSBmcm9tIHRoZSBkb3duIHZlcnRpY2FsXHJcbiAgICAgIGNvbnN0IHRoZXRhMiA9IE1hdGguYXNpbiggbjEgLyBuMiAqIE1hdGguc2luKCB0aGV0YTEgKSApO1xyXG5cclxuICAgICAgLy8gc3RhcnQgd2l0aCBmdWxsIHN0cmVuZ3RoIGxhc2VyXHJcbiAgICAgIGNvbnN0IHNvdXJjZVBvd2VyID0gMS4wO1xyXG5cclxuICAgICAgLy8gY3Jvc3Mgc2VjdGlvbiBvZiBpbmNpZGVudCBsaWdodCwgdXNlZCB0byBjb21wdXRlIHdhdmUgd2lkdGhzXHJcbiAgICAgIGNvbnN0IGEgPSBDSEFSQUNURVJJU1RJQ19MRU5HVEggKiA0O1xyXG5cclxuICAgICAgLy8gVGhpcyBvbmUgZml4ZXMgdGhlIGlucHV0IGJlYW0gdG8gYmUgYSBmaXhlZCB3aWR0aCBpbmRlcGVuZGVudCBvZiBhbmdsZVxyXG4gICAgICBjb25zdCBzb3VyY2VXYXZlV2lkdGggPSBhIC8gMjtcclxuXHJcbiAgICAgIC8vIGFjY29yZGluZyB0byBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1dhdmVsZW5ndGhcclxuICAgICAgY29uc3QgY29sb3IgPSB0aGlzLmxhc2VyLmNvbG9yUHJvcGVydHkuZ2V0KCkuZ2V0Q29sb3IoKTtcclxuICAgICAgY29uc3Qgd2F2ZWxlbmd0aEluVG9wTWVkaXVtID0gdGhpcy5sYXNlci5jb2xvclByb3BlcnR5LmdldCgpLndhdmVsZW5ndGggLyBuMTtcclxuXHJcbiAgICAgIC8vIGNhbGN1bGF0ZWQgd2F2ZSB3aWR0aCBvZiByZWZsZWN0ZWQgYW5kIHJlZnJhY3RlZCB3YXZlIHdpZHRoLlxyXG4gICAgICAvLyBzcGVjaWFsbHkgdXNlZCBpbiBpbiB3YXZlIE1vZGVcclxuICAgICAgY29uc3QgdHJhcGV6aXVtV2lkdGggPSBNYXRoLmFicyggc291cmNlV2F2ZVdpZHRoIC8gTWF0aC5zaW4oIHRoaXMubGFzZXIuZ2V0QW5nbGUoKSApICk7XHJcblxyXG4gICAgICAvLyBzaW5jZSB0aGUgbjEgZGVwZW5kcyBvbiB0aGUgd2F2ZWxlbmd0aCwgd2hlbiB5b3UgY2hhbmdlIHRoZSB3YXZlbGVuZ3RoLFxyXG4gICAgICAvLyB0aGUgd2F2ZWxlbmd0aEluVG9wTWVkaXVtIGFsc28gY2hhbmdlcyAoc2VlbWluZ2x5IGluIHRoZSBvcHBvc2l0ZSBkaXJlY3Rpb24pXHJcbiAgICAgIGNvbnN0IGluY2lkZW50UmF5ID0gbmV3IExpZ2h0UmF5KCB0cmFwZXppdW1XaWR0aCwgdGFpbCwgbmV3IFZlY3RvcjIoIDAsIDAgKSwgbjEsIHdhdmVsZW5ndGhJblRvcE1lZGl1bSxcclxuICAgICAgICB0aGlzLmxhc2VyLmdldFdhdmVsZW5ndGgoKSAqIDFFOSwgc291cmNlUG93ZXIsIGNvbG9yLCBzb3VyY2VXYXZlV2lkdGgsIDAuMCwgdHJ1ZSwgZmFsc2UsIHRoaXMubGFzZXJWaWV3UHJvcGVydHkudmFsdWUsICdpbmNpZGVudCcgKTtcclxuXHJcbiAgICAgIGNvbnN0IHJheUFic29yYmVkID0gdGhpcy5hZGRBbmRBYnNvcmIoIGluY2lkZW50UmF5LCAnaW5jaWRlbnQnICk7XHJcbiAgICAgIGlmICggIXJheUFic29yYmVkICkge1xyXG4gICAgICAgIGNvbnN0IHRoZXRhT2ZUb3RhbEludGVybmFsUmVmbGVjdGlvbiA9IE1hdGguYXNpbiggbjIgLyBuMSApO1xyXG4gICAgICAgIGxldCBoYXNUcmFuc21pdHRlZFJheSA9IGlzTmFOKCB0aGV0YU9mVG90YWxJbnRlcm5hbFJlZmxlY3Rpb24gKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZXRhMSA8IHRoZXRhT2ZUb3RhbEludGVybmFsUmVmbGVjdGlvbjtcclxuXHJcbiAgICAgICAgLy8gcmVmbGVjdGVkXHJcbiAgICAgICAgLy8gYXNzdW1pbmcgcGVycGVuZGljdWxhciBiZWFtIHBvbGFyaXphdGlvbiwgY29tcHV0ZSBwZXJjZW50IHBvd2VyXHJcbiAgICAgICAgbGV0IHJlZmxlY3RlZFBvd2VyUmF0aW87XHJcbiAgICAgICAgaWYgKCBoYXNUcmFuc21pdHRlZFJheSApIHtcclxuICAgICAgICAgIHJlZmxlY3RlZFBvd2VyUmF0aW8gPSBCZW5kaW5nTGlnaHRNb2RlbC5nZXRSZWZsZWN0ZWRQb3dlciggbjEsIG4yLCBNYXRoLmNvcyggdGhldGExICksIE1hdGguY29zKCB0aGV0YTIgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHJlZmxlY3RlZFBvd2VyUmF0aW8gPSAxLjA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBub3RoaW5nIGlzIHRyYW5zbWl0dGVkLCBkbyBub3QgY3JlYXRlIGEgMCBwb3dlciB0cmFuc21pdHRlZCByYXksIHNlZSAjMjk2XHJcbiAgICAgICAgaWYgKCByZWZsZWN0ZWRQb3dlclJhdGlvID09PSAxLjAgKSB7XHJcbiAgICAgICAgICBoYXNUcmFuc21pdHRlZFJheSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gbWFrZSBzdXJlIGl0IGhhcyBlbm91Z2ggcG93ZXIgdG8gc2hvdyB1cCBvbiB0aGUgaW50ZW5zaXR5IG1ldGVyLCBhZnRlciByb3VuZGluZ1xyXG4gICAgICAgIGNvbnN0IGhhc1JlZmxlY3RlZFJheSA9IHJlZmxlY3RlZFBvd2VyUmF0aW8gPj0gMC4wMDU7XHJcbiAgICAgICAgaWYgKCBoYXNSZWZsZWN0ZWRSYXkgKSB7XHJcbiAgICAgICAgICBjb25zdCByZWZsZWN0ZWRSYXkgPSBuZXcgTGlnaHRSYXkoXHJcbiAgICAgICAgICAgIHRyYXBleml1bVdpZHRoLFxyXG4gICAgICAgICAgICBuZXcgVmVjdG9yMiggMCwgMCApLFxyXG4gICAgICAgICAgICBWZWN0b3IyLmNyZWF0ZVBvbGFyKCBCRUFNX0xFTkdUSCwgTWF0aC5QSSAtIHRoaXMubGFzZXIuZ2V0QW5nbGUoKSApLFxyXG4gICAgICAgICAgICBuMSxcclxuICAgICAgICAgICAgd2F2ZWxlbmd0aEluVG9wTWVkaXVtLFxyXG4gICAgICAgICAgICB0aGlzLmxhc2VyLmdldFdhdmVsZW5ndGgoKSAqIDFFOSxcclxuICAgICAgICAgICAgcmVmbGVjdGVkUG93ZXJSYXRpbyAqIHNvdXJjZVBvd2VyLFxyXG4gICAgICAgICAgICBjb2xvcixcclxuICAgICAgICAgICAgc291cmNlV2F2ZVdpZHRoLFxyXG4gICAgICAgICAgICBpbmNpZGVudFJheS5nZXROdW1iZXJPZldhdmVsZW5ndGhzKCksXHJcbiAgICAgICAgICAgIHRydWUsXHJcbiAgICAgICAgICAgIHRydWUsIHRoaXMubGFzZXJWaWV3UHJvcGVydHkudmFsdWUsICdyZWZsZWN0ZWQnXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgdGhpcy5hZGRBbmRBYnNvcmIoIHJlZmxlY3RlZFJheSwgJ3JlZmxlY3RlZCcgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICByZWZsZWN0ZWRQb3dlclJhdGlvID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZpcmUgYSB0cmFuc21pdHRlZCByYXkgaWYgdGhlcmUgd2Fzbid0IHRvdGFsIGludGVybmFsIHJlZmxlY3Rpb25cclxuICAgICAgICBpZiAoIGhhc1RyYW5zbWl0dGVkUmF5ICkge1xyXG5cclxuICAgICAgICAgIC8vIHRyYW5zbWl0dGVkXHJcbiAgICAgICAgICAvLyBuMi9uMSA9IEwxL0wyID0+IEwyID0gTDEqbjIvbjFcclxuICAgICAgICAgIGNvbnN0IHRyYW5zbWl0dGVkV2F2ZWxlbmd0aCA9IGluY2lkZW50UmF5LndhdmVsZW5ndGggLyBuMiAqIG4xO1xyXG4gICAgICAgICAgaWYgKCAhKCBpc05hTiggdGhldGEyICkgfHwgIWlzRmluaXRlKCB0aGV0YTIgKSApICkge1xyXG4gICAgICAgICAgICBsZXQgdHJhbnNtaXR0ZWRQb3dlclJhdGlvID0gQmVuZGluZ0xpZ2h0TW9kZWwuZ2V0VHJhbnNtaXR0ZWRQb3dlcihcclxuICAgICAgICAgICAgICBuMSxcclxuICAgICAgICAgICAgICBuMixcclxuICAgICAgICAgICAgICBNYXRoLmNvcyggdGhldGExICksXHJcbiAgICAgICAgICAgICAgTWF0aC5jb3MoIHRoZXRhMiApXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGlmICggIWhhc1JlZmxlY3RlZFJheSApIHtcclxuICAgICAgICAgICAgICB0cmFuc21pdHRlZFBvd2VyUmF0aW8gPSAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBtYWtlIHRoZSBiZWFtIHdpZHRoIGRlcGVuZCBvbiB0aGUgaW5wdXQgYmVhbSB3aWR0aCwgc28gdGhhdCB0aGUgc2FtZSBiZWFtIHdpZHRoIGlzIHRyYW5zbWl0dGVkIGFzIHdhc1xyXG4gICAgICAgICAgICAvLyBpbnRlcmNlcHRlZFxyXG4gICAgICAgICAgICBjb25zdCBiZWFtSGFsZldpZHRoID0gYSAvIDI7XHJcbiAgICAgICAgICAgIGNvbnN0IGV4dGVudEludGVyY2VwdGVkSGFsZldpZHRoID0gYmVhbUhhbGZXaWR0aCAvIE1hdGguc2luKCBNYXRoLlBJIC8gMiAtIHRoZXRhMSApIC8gMjtcclxuICAgICAgICAgICAgY29uc3QgdHJhbnNtaXR0ZWRCZWFtSGFsZldpZHRoID0gTWF0aC5jb3MoIHRoZXRhMiApICogZXh0ZW50SW50ZXJjZXB0ZWRIYWxmV2lkdGg7XHJcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zbWl0dGVkV2F2ZVdpZHRoID0gdHJhbnNtaXR0ZWRCZWFtSGFsZldpZHRoICogMjtcclxuICAgICAgICAgICAgY29uc3QgdHJhbnNtaXR0ZWRSYXkgPSBuZXcgTGlnaHRSYXkoXHJcbiAgICAgICAgICAgICAgdHJhcGV6aXVtV2lkdGgsXHJcbiAgICAgICAgICAgICAgbmV3IFZlY3RvcjIoIDAsIDAgKSxcclxuICAgICAgICAgICAgICBWZWN0b3IyLmNyZWF0ZVBvbGFyKCBCRUFNX0xFTkdUSCwgdGhldGEyIC0gTWF0aC5QSSAvIDIgKSxcclxuICAgICAgICAgICAgICBuMixcclxuICAgICAgICAgICAgICB0cmFuc21pdHRlZFdhdmVsZW5ndGgsXHJcbiAgICAgICAgICAgICAgdGhpcy5sYXNlci5nZXRXYXZlbGVuZ3RoKCkgKiAxRTksXHJcbiAgICAgICAgICAgICAgdHJhbnNtaXR0ZWRQb3dlclJhdGlvICogc291cmNlUG93ZXIsXHJcbiAgICAgICAgICAgICAgY29sb3IsXHJcbiAgICAgICAgICAgICAgdHJhbnNtaXR0ZWRXYXZlV2lkdGgsXHJcbiAgICAgICAgICAgICAgaW5jaWRlbnRSYXkuZ2V0TnVtYmVyT2ZXYXZlbGVuZ3RocygpLFxyXG4gICAgICAgICAgICAgIHRydWUsXHJcbiAgICAgICAgICAgICAgdHJ1ZSxcclxuICAgICAgICAgICAgICB0aGlzLmxhc2VyVmlld1Byb3BlcnR5LnZhbHVlLCAndHJhbnNtaXR0ZWQnICk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkQW5kQWJzb3JiKCB0cmFuc21pdHRlZFJheSwgJ3RyYW5zbWl0dGVkJyApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGludGVuc2l0eSBtZXRlciBzaG91bGQgYWJzb3JiIHRoZSByYXksIGFuZCBpZiBzbyBhZGRzIGEgdHJ1bmNhdGVkIHJheS5cclxuICAgKiBJZiB0aGUgaW50ZW5zaXR5IG1ldGVyIG1pc3NlcyB0aGUgcmF5LCB0aGUgb3JpZ2luYWwgcmF5IGlzIGFkZGVkLlxyXG4gICAqIEBwYXJhbSByYXkgLSBtb2RlbCBvZiBsaWdodCByYXlcclxuICAgKiBAcGFyYW0gcmF5VHlwZSAtICdpbmNpZGVudCcsICd0cmFuc21pdHRlZCcgb3IgJ3JlZmxlY3RlZCdcclxuICAgKi9cclxuICBwcml2YXRlIGFkZEFuZEFic29yYiggcmF5OiBMaWdodFJheSwgcmF5VHlwZTogUmF5VHlwZUVudW0gKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBhbmdsZU9mZnNldCA9IHJheVR5cGUgPT09ICdpbmNpZGVudCcgPyBNYXRoLlBJIDogMDtcclxuXHJcbiAgICAvLyBmaW5kIGludGVyc2VjdGlvbiBwb2ludHMgd2l0aCB0aGUgaW50ZW5zaXR5IHNlbnNvclxyXG4gICAgY29uc3QgaW50ZXJzZWN0cyA9IHRoaXMuaW50ZW5zaXR5TWV0ZXIuZW5hYmxlZFByb3BlcnR5LnZhbHVlID9cclxuICAgICAgICAgICAgICAgICAgICAgICByYXkuZ2V0SW50ZXJzZWN0aW9ucyggdGhpcy5pbnRlbnNpdHlNZXRlci5nZXRTZW5zb3JTaGFwZSgpLCByYXlUeXBlICkgOiBbXTtcclxuXHJcbiAgICAvLyBpZiBpdCBpbnRlcnNlY3RlZCwgdGhlbiBhYnNvcmIgdGhlIHJheVxyXG4gICAgbGV0IHJheUFic29yYmVkID0gaW50ZXJzZWN0cy5sZW5ndGggPiAwO1xyXG4gICAgaWYgKCByYXlBYnNvcmJlZCApIHtcclxuICAgICAgbGV0IHg7XHJcbiAgICAgIGxldCB5O1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbnRlcnNlY3RzLmxlbmd0aCA8PSAyLCAndG9vIG1hbnkgaW50ZXJzZWN0aW9ucycgKTtcclxuICAgICAgaWYgKCBpbnRlcnNlY3RzLmxlbmd0aCA9PT0gMSApIHtcclxuXHJcbiAgICAgICAgLy8gaW50ZXJzZWN0IHBvaW50IGF0IHNlbnNvciBzaGFwZSBzdGFydCBwb3NpdGlvbiB3aGVuIGxhc2VyIHdpdGhpbiBzZW5zb3IgcmVnaW9uXHJcbiAgICAgICAgeCA9IGludGVyc2VjdHNbIDAgXS5wb2ludC54O1xyXG4gICAgICAgIHkgPSBpbnRlcnNlY3RzWyAwIF0ucG9pbnQueTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbnRlcnNlY3RzLmxlbmd0aCA9PT0gMiApO1xyXG4gICAgICAgIHggPSAoIGludGVyc2VjdHNbIDAgXS5wb2ludC54ICsgaW50ZXJzZWN0c1sgMSBdLnBvaW50LnggKSAvIDI7XHJcbiAgICAgICAgeSA9ICggaW50ZXJzZWN0c1sgMCBdLnBvaW50LnkgKyBpbnRlcnNlY3RzWyAxIF0ucG9pbnQueSApIC8gMjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZGlzdGFuY2UgPSBNYXRoLnNxcnQoIHggKiB4ICsgeSAqIHkgKTtcclxuICAgICAgY29uc3QgaW50ZXJydXB0ZWQgPSBuZXcgTGlnaHRSYXkoXHJcbiAgICAgICAgcmF5LnRyYXBleml1bVdpZHRoLFxyXG4gICAgICAgIHJheS50YWlsLFxyXG4gICAgICAgIFZlY3RvcjIuY3JlYXRlUG9sYXIoIGRpc3RhbmNlLCByYXkuZ2V0QW5nbGUoKSArIGFuZ2xlT2Zmc2V0ICksXHJcbiAgICAgICAgcmF5LmluZGV4T2ZSZWZyYWN0aW9uLFxyXG4gICAgICAgIHJheS53YXZlbGVuZ3RoLFxyXG4gICAgICAgIHRoaXMubGFzZXIuZ2V0V2F2ZWxlbmd0aCgpICogMUU5LFxyXG4gICAgICAgIHJheS5wb3dlckZyYWN0aW9uLFxyXG4gICAgICAgIHRoaXMubGFzZXIuY29sb3JQcm9wZXJ0eS5nZXQoKS5nZXRDb2xvcigpISxcclxuICAgICAgICByYXkud2F2ZVdpZHRoLFxyXG4gICAgICAgIHJheS5udW1XYXZlbGVuZ3Roc1BoYXNlT2Zmc2V0LFxyXG4gICAgICAgIGZhbHNlLFxyXG4gICAgICAgIHJheS5leHRlbmRCYWNrd2FyZHMsXHJcbiAgICAgICAgdGhpcy5sYXNlclZpZXdQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICByYXlUeXBlXHJcbiAgICAgICk7XHJcblxyXG4gICAgICAvLyBkb24ndCBsZXQgdGhlIHdhdmUgaW50ZXJzZWN0IHRoZSBpbnRlbnNpdHkgbWV0ZXIgaWYgaXQgaXMgYmVoaW5kIHRoZSBsYXNlciBlbWlzc2lvbiBwb2ludFxyXG4gICAgICBjb25zdCBpc0ZvcndhcmQgPSByYXkudG9WZWN0b3IoKS5kb3QoIGludGVycnVwdGVkLnRvVmVjdG9yKCkgKSA+IDA7XHJcbiAgICAgIGlmICggaW50ZXJydXB0ZWQuZ2V0TGVuZ3RoKCkgPCByYXkuZ2V0TGVuZ3RoKCkgJiYgaXNGb3J3YXJkICkge1xyXG4gICAgICAgIHRoaXMuYWRkUmF5KCBpbnRlcnJ1cHRlZCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuYWRkUmF5KCByYXkgKTtcclxuICAgICAgICByYXlBYnNvcmJlZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5hZGRSYXkoIHJheSApO1xyXG4gICAgfVxyXG4gICAgaWYgKCByYXlBYnNvcmJlZCApIHtcclxuICAgICAgdGhpcy5pbnRlbnNpdHlNZXRlci5hZGRSYXlSZWFkaW5nKCBuZXcgUmVhZGluZyggcmF5LnBvd2VyRnJhY3Rpb24gKSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuaW50ZW5zaXR5TWV0ZXIuYWRkUmF5UmVhZGluZyggUmVhZGluZy5NSVNTICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmF5QWJzb3JiZWQ7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgcmVzZXQoKTogdm9pZCB7XHJcbiAgICBzdXBlci5yZXNldCgpO1xyXG4gICAgdGhpcy50b3BNZWRpdW1Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5ib3R0b21NZWRpdW1Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5pbnRlbnNpdHlNZXRlci5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lIHRoZSB2ZWxvY2l0eSBvZiB0aGUgdG9wbW9zdCBsaWdodCByYXkgYXQgdGhlIHNwZWNpZmllZCBwb3NpdGlvbiwgaWYgb25lIGV4aXN0cywgb3RoZXJ3aXNlIE5vbmVcclxuICAgKiBAcGFyYW0gcG9zaXRpb24gLSBwb3NpdGlvbiB3aGVyZSB0aGUgdmVsb2NpdHkgdG8gYmUgZGV0ZXJtaW5lZFxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRWZWxvY2l0eSggcG9zaXRpb246IFZlY3RvcjIgKTogVmVjdG9yMiB7XHJcbiAgICBjb25zdCBsYXNlclZpZXcgPSB0aGlzLmxhc2VyVmlld1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5yYXlzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIHRoaXMucmF5c1sgaSBdLmNvbnRhaW5zKCBwb3NpdGlvbiwgbGFzZXJWaWV3ID09PSBMYXNlclZpZXdFbnVtLldBVkUgKSApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yYXlzWyBpIF0uZ2V0VmVsb2NpdHlWZWN0b3IoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmUgdGhlIHdhdmUgdmFsdWUgb2YgdGhlIHRvcG1vc3QgbGlnaHQgcmF5IGF0IHRoZSBzcGVjaWZpZWQgcG9zaXRpb24sIG9yIE5vbmUgaWYgbm9uZSBleGlzdHNcclxuICAgKiBAcGFyYW0gcG9zaXRpb24gLSBwb3NpdGlvbiB3aGVyZSB0aGUgd2F2ZSB2YWx1ZSB0byBiZSBkZXRlcm1pbmVkXHJcbiAgICogQHJldHVybnMgLSByZXR1cm5zIG9iamVjdCBvZiB0aW1lIGFuZCBtYWduaXR1ZGUgaWYgcG9pbnQgaXMgb24gcmF5IG90aGVyd2lzZSByZXR1cm5zIG51bGxcclxuICAgKi9cclxuICBwcm90ZWN0ZWQgZ2V0V2F2ZVZhbHVlKCBwb3NpdGlvbjogVmVjdG9yMiApOiB7IHRpbWU6IG51bWJlcjsgbWFnbml0dWRlOiBudW1iZXIgfSB8IG51bGwge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5yYXlzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCByYXkgPSB0aGlzLnJheXNbIGkgXTtcclxuICAgICAgaWYgKCByYXkuY29udGFpbnMoIHBvc2l0aW9uLCB0aGlzLmxhc2VyVmlld1Byb3BlcnR5LnZhbHVlID09PSBMYXNlclZpZXdFbnVtLldBVkUgKSApIHtcclxuXHJcbiAgICAgICAgLy8gbWFwIHBvd2VyIHRvIGRpc3BsYXllZCBhbXBsaXR1ZGVcclxuICAgICAgICBjb25zdCBhbXBsaXR1ZGUgPSBNYXRoLnNxcnQoIHJheS5wb3dlckZyYWN0aW9uICk7XHJcblxyXG4gICAgICAgIC8vIGZpbmQgb3V0IGhvdyBmYXIgdGhlIGxpZ2h0IGhhcyBjb21lLCBzbyB3ZSBjYW4gY29tcHV0ZSB0aGUgcmVtYWluZGVyIG9mIHBoYXNlc1xyXG4gICAgICAgIGNvbnN0IHJheVVuaXRWZWN0b3IgPSByYXkuZ2V0VW5pdFZlY3RvcigpO1xyXG4gICAgICAgIGNvbnN0IHggPSBwb3NpdGlvbi54IC0gcmF5LnRhaWwueDtcclxuICAgICAgICBjb25zdCB5ID0gcG9zaXRpb24ueSAtIHJheS50YWlsLnk7XHJcbiAgICAgICAgY29uc3QgZGlzdGFuY2VBbG9uZ1JheSA9IHJheVVuaXRWZWN0b3IueCAqIHggKyByYXlVbml0VmVjdG9yLnkgKiB5O1xyXG4gICAgICAgIGNvbnN0IHBoYXNlID0gcmF5LmdldENvc0FyZyggZGlzdGFuY2VBbG9uZ1JheSApO1xyXG5cclxuICAgICAgICAvLyB3YXZlIGlzIGEqY29zKHRoZXRhKVxyXG4gICAgICAgIHJldHVybiB7IHRpbWU6IHJheS50aW1lLCBtYWduaXR1ZGU6IGFtcGxpdHVkZSAqIE1hdGguY29zKCBwaGFzZSArIE1hdGguUEkgKSB9O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCBieSB0aGUgYW5pbWF0aW9uIGxvb3AuXHJcbiAgICovXHJcbiAgcHVibGljIHN0ZXAoKTogdm9pZCB7XHJcblxyXG4gICAgaWYgKCB0aGlzLmlzUGxheWluZ1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICB0aGlzLnVwZGF0ZVNpbXVsYXRpb25UaW1lQW5kV2F2ZVNoYXBlKCB0aGlzLnNwZWVkUHJvcGVydHkudmFsdWUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSBzaW11bGF0aW9uIHRpbWUgYW5kIHdhdmUgcHJvcGFnYXRpb24uXHJcbiAgICovXHJcbiAgcHVibGljIHVwZGF0ZVNpbXVsYXRpb25UaW1lQW5kV2F2ZVNoYXBlKCBzcGVlZDogVGltZVNwZWVkICk6IHZvaWQge1xyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgdGltZVxyXG4gICAgdGhpcy50aW1lID0gdGhpcy50aW1lICsgKCBzcGVlZCA9PT0gVGltZVNwZWVkLk5PUk1BTCA/IDFFLTE2IDogMC41RS0xNiApO1xyXG5cclxuICAgIC8vIHNldCB0aW1lIGZvciBlYWNoIHJheVxyXG4gICAgdGhpcy5yYXlzLmZvckVhY2goIHJheSA9PiByYXkuc2V0VGltZSggdGhpcy50aW1lICkgKTtcclxuICAgIGlmICggdGhpcy5sYXNlci5vblByb3BlcnR5LnZhbHVlICYmIHRoaXMubGFzZXJWaWV3UHJvcGVydHkudmFsdWUgPT09IExhc2VyVmlld0VudW0uV0FWRSApIHtcclxuICAgICAgaWYgKCAhdGhpcy5hbGxvd1dlYkdMICkge1xyXG4gICAgICAgIHRoaXMucHJvcGFnYXRlUGFydGljbGVzKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGNyZWF0ZSB0aGUgcGFydGljbGVzIGJldHdlZW4gbGlnaHQgcmF5IHRhaWwgYW5kIGFuZCB0aXBcclxuICAgKi9cclxuICBwcml2YXRlIGNyZWF0ZUluaXRpYWxQYXJ0aWNsZXMoKTogdm9pZCB7XHJcblxyXG4gICAgbGV0IHBhcnRpY2xlQ29sb3I6IHN0cmluZztcclxuICAgIGxldCBwYXJ0aWNsZUdyYWRpZW50Q29sb3I6IHN0cmluZztcclxuICAgIGxldCBqO1xyXG4gICAgZm9yICggbGV0IGsgPSAwOyBrIDwgdGhpcy5yYXlzLmxlbmd0aDsgaysrICkge1xyXG4gICAgICBjb25zdCBsaWdodFJheSA9IHRoaXMucmF5c1sgayBdO1xyXG4gICAgICBjb25zdCBkaXJlY3Rpb25WZWN0b3IgPSBsaWdodFJheS5nZXRVbml0VmVjdG9yKCk7XHJcbiAgICAgIGNvbnN0IHdhdmVsZW5ndGggPSBsaWdodFJheS53YXZlbGVuZ3RoO1xyXG4gICAgICBjb25zdCBhbmdsZSA9IGxpZ2h0UmF5LmdldEFuZ2xlKCk7XHJcbiAgICAgIGlmICggayA9PT0gMCApIHtcclxuXHJcbiAgICAgICAgLy8gY2FsY3VsYXRpbmcgdGlwIGFuZCB0YWlsIGZvciBpbmNpZGVudCByYXlcclxuICAgICAgICB0aGlzLnRpcFZlY3Rvci54ID0gbGlnaHRSYXkudGlwLnggKyBkaXJlY3Rpb25WZWN0b3IueCAqIGxpZ2h0UmF5LnRyYXBleml1bVdpZHRoIC8gMiAqIE1hdGguY29zKCBhbmdsZSApO1xyXG4gICAgICAgIHRoaXMudGlwVmVjdG9yLnkgPSBsaWdodFJheS50aXAueSArIGRpcmVjdGlvblZlY3Rvci55ICogbGlnaHRSYXkudHJhcGV6aXVtV2lkdGggLyAyICogTWF0aC5jb3MoIGFuZ2xlICk7XHJcbiAgICAgICAgdGhpcy50YWlsVmVjdG9yLnggPSBsaWdodFJheS50YWlsLng7XHJcbiAgICAgICAgdGhpcy50YWlsVmVjdG9yLnkgPSBsaWdodFJheS50YWlsLnk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIGNhbGN1bGF0aW5nIHRpcCBhbmQgdGFpbCBmb3IgcmVmbGVjdGVkIGFuZCByZWZyYWN0ZWQgcmF5c1xyXG4gICAgICAgIHRoaXMudGlwVmVjdG9yLnggPSAoIDEgKSAqIE1hdGguY29zKCBhbmdsZSApO1xyXG4gICAgICAgIHRoaXMudGlwVmVjdG9yLnkgPSAoIDEgKSAqIE1hdGguc2luKCBhbmdsZSApO1xyXG4gICAgICAgIHRoaXMudGFpbFZlY3Rvci54ID0gbGlnaHRSYXkudGFpbC54IC0gZGlyZWN0aW9uVmVjdG9yLnggKiBsaWdodFJheS50cmFwZXppdW1XaWR0aCAvIDIgKiBNYXRoLmNvcyggYW5nbGUgKTtcclxuICAgICAgICB0aGlzLnRhaWxWZWN0b3IueSA9IGxpZ2h0UmF5LnRhaWwueSAtIGRpcmVjdGlvblZlY3Rvci55ICogbGlnaHRSYXkudHJhcGV6aXVtV2lkdGggLyAyICogTWF0aC5jb3MoIGFuZ2xlICk7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgbGlnaHRSYXlJblJheTJGb3JtID0gbmV3IFJheTIoIHRoaXMudGFpbFZlY3RvciwgZGlyZWN0aW9uVmVjdG9yICk7XHJcbiAgICAgIGNvbnN0IGRpc3RhbmNlID0gdGhpcy50aXBWZWN0b3IuZGlzdGFuY2UoIHRoaXMudGFpbFZlY3RvciApO1xyXG4gICAgICBjb25zdCBnYXBCZXR3ZWVuU3VjY2Vzc2l2ZVBhcnRpY2xlcyA9IHdhdmVsZW5ndGg7XHJcbiAgICAgIHBhcnRpY2xlQ29sb3IgPSBuZXcgQ29sb3IoIGxpZ2h0UmF5LmNvbG9yLmdldFJlZCgpLCBsaWdodFJheS5jb2xvci5nZXRHcmVlbigpLCBsaWdodFJheS5jb2xvci5nZXRCbHVlKCksXHJcbiAgICAgICAgTWF0aC5zcXJ0KCBsaWdodFJheS5wb3dlckZyYWN0aW9uICkgKS50b0NTUygpO1xyXG4gICAgICBwYXJ0aWNsZUdyYWRpZW50Q29sb3IgPSBuZXcgQ29sb3IoIDAsIDAsIDAsIE1hdGguc3FydCggbGlnaHRSYXkucG93ZXJGcmFjdGlvbiApICkudG9DU1MoKTtcclxuXHJcbiAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgbnVtYmVyIG9mIHBhcnRpY2xlcyB0aGF0IGNhbiBmaXQgaW4gdGhlIGRpc3RhbmNlXHJcbiAgICAgIGNvbnN0IG51bWJlck9mUGFydGljbGVzID0gTWF0aC5taW4oIE1hdGguY2VpbCggZGlzdGFuY2UgLyBnYXBCZXR3ZWVuU3VjY2Vzc2l2ZVBhcnRpY2xlcyApLCAxNTAgKSArIDE7XHJcbiAgICAgIGxldCB3YXZlUGFydGljbGVHYXAgPSAwO1xyXG5cclxuICAgICAgLy8gY3JlYXRlIHRoZSB3YXZlIHBhcnRpY2xlc1xyXG4gICAgICBmb3IgKCBqID0gMDsgaiA8IG51bWJlck9mUGFydGljbGVzOyBqKysgKSB7XHJcbiAgICAgICAgbGlnaHRSYXkucGFydGljbGVzLnB1c2goIG5ldyBXYXZlUGFydGljbGUoIGxpZ2h0UmF5SW5SYXkyRm9ybS5wb2ludEF0RGlzdGFuY2UoIHdhdmVQYXJ0aWNsZUdhcCApLFxyXG4gICAgICAgICAgbGlnaHRSYXkud2F2ZVdpZHRoLCBwYXJ0aWNsZUNvbG9yLCBwYXJ0aWNsZUdyYWRpZW50Q29sb3IsIGFuZ2xlLCB3YXZlbGVuZ3RoICkgKTtcclxuICAgICAgICB3YXZlUGFydGljbGVHYXAgKz0gZ2FwQmV0d2VlblN1Y2Nlc3NpdmVQYXJ0aWNsZXM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByb3BhZ2F0ZSB0aGUgcGFydGljbGVzXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBwcm9wYWdhdGVQYXJ0aWNsZXMoKTogdm9pZCB7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5yYXlzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBsaWdodFJheSA9IHRoaXMucmF5c1sgaSBdO1xyXG4gICAgICBjb25zdCB3YXZlbGVuZ3RoID0gbGlnaHRSYXkud2F2ZWxlbmd0aDtcclxuICAgICAgY29uc3QgZGlyZWN0aW9uVmVjdG9yID0gbGlnaHRSYXkuZ2V0VW5pdFZlY3RvcigpO1xyXG4gICAgICBjb25zdCB3YXZlUGFydGljbGVzID0gbGlnaHRSYXkucGFydGljbGVzO1xyXG5cclxuICAgICAgLy8gQ29tcHV0ZSB0aGUgdG90YWwgcGhhc2UgYWxvbmcgdGhlIGxlbmd0aCBvZiB0aGUgcmF5LlxyXG4gICAgICBjb25zdCB0b3RhbFBoYXNlT2Zmc2V0SW5OdW1iZXJPZldhdmVsZW5ndGhzID0gbGlnaHRSYXkuZ2V0UGhhc2VPZmZzZXQoKSAvIDIgLyBNYXRoLlBJO1xyXG5cclxuICAgICAgLy8gSnVzdCBrZWVwIHRoZSBmcmFjdGlvbmFsIHBhcnRcclxuICAgICAgbGV0IHBoYXNlRGlmZiA9ICggdG90YWxQaGFzZU9mZnNldEluTnVtYmVyT2ZXYXZlbGVuZ3RocyAlIDEgKSAqIHdhdmVsZW5ndGg7XHJcbiAgICAgIGxldCB0YWlsWDtcclxuICAgICAgbGV0IHRhaWxZO1xyXG4gICAgICBjb25zdCBhbmdsZSA9IGxpZ2h0UmF5LmdldEFuZ2xlKCk7XHJcbiAgICAgIGlmICggaSA9PT0gMCApIHtcclxuXHJcbiAgICAgICAgLy8gZm9yIGluY2lkZW50IHJheVxyXG4gICAgICAgIHRhaWxYID0gbGlnaHRSYXkudGFpbC54O1xyXG4gICAgICAgIHRhaWxZID0gbGlnaHRSYXkudGFpbC55O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBmb3IgcmVmbGVjdGVkIGFuZCByZWZyYWN0ZWQgcmF5XHJcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBsaWdodFJheS50cmFwZXppdW1XaWR0aCAvIDIgKiBNYXRoLmNvcyggYW5nbGUgKTtcclxuICAgICAgICBwaGFzZURpZmYgPSAoIGRpc3RhbmNlICsgcGhhc2VEaWZmICkgJSB3YXZlbGVuZ3RoO1xyXG4gICAgICAgIHRhaWxYID0gbGlnaHRSYXkudGFpbC54IC0gKCBkaXJlY3Rpb25WZWN0b3IueCAqIGxpZ2h0UmF5LnRyYXBleml1bVdpZHRoIC8gMiAqIE1hdGguY29zKCBhbmdsZSApICk7XHJcbiAgICAgICAgdGFpbFkgPSBsaWdodFJheS50YWlsLnkgLSAoIGRpcmVjdGlvblZlY3Rvci55ICogbGlnaHRSYXkudHJhcGV6aXVtV2lkdGggLyAyICogTWF0aC5jb3MoIGFuZ2xlICkgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2hhbmdpbmcgdGhlIHdhdmUgcGFydGljbGUgcG9zaXRpb24gd2l0aGluIHRoZSB3YXZlIHBhcnRpY2xlIHBoYXNlXHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHdhdmVQYXJ0aWNsZXMubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgICAgY29uc3QgcGFydGljbGUgPSB3YXZlUGFydGljbGVzWyBqIF07XHJcbiAgICAgICAgcGFydGljbGUuc2V0WCggdGFpbFggKyAoIGRpcmVjdGlvblZlY3Rvci54ICogKCAoIGogKiB3YXZlbGVuZ3RoICkgKyBwaGFzZURpZmYgKSApICk7XHJcbiAgICAgICAgcGFydGljbGUuc2V0WSggdGFpbFkgKyAoIGRpcmVjdGlvblZlY3Rvci55ICogKCAoIGogKiB3YXZlbGVuZ3RoICkgKyBwaGFzZURpZmYgKSApICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmJlbmRpbmdMaWdodC5yZWdpc3RlciggJ0ludHJvTW9kZWwnLCBJbnRyb01vZGVsICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBJbnRyb01vZGVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLElBQUksTUFBTSw0QkFBNEI7QUFDN0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsU0FBU0MsS0FBSyxRQUFRLG1DQUFtQztBQUV6RCxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFDaEQsT0FBT0MscUJBQXFCLE1BQU0sdUNBQXVDO0FBQ3pFLE9BQU9DLGlCQUFpQixNQUFNLHlDQUF5QztBQUN2RSxPQUFPQyxjQUFjLE1BQU0sc0NBQXNDO0FBQ2pFLE9BQU9DLFFBQVEsTUFBTSxnQ0FBZ0M7QUFDckQsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsWUFBWSxNQUFNLG9DQUFvQztBQUc3RCxPQUFPQyxhQUFhLE1BQU0scUNBQXFDO0FBQy9ELE9BQU9DLFNBQVMsTUFBTSxrQ0FBa0M7O0FBRXhEO0FBQ0EsTUFBTUMscUJBQXFCLEdBQUdWLHFCQUFxQixDQUFDVyxjQUFjOztBQUVsRTtBQUNBLE1BQU1DLFdBQVcsR0FBRyxJQUFJO0FBRXhCLE1BQU1DLFVBQVUsU0FBU1osaUJBQWlCLENBQUM7RUFVekM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNTYSxXQUFXQSxDQUFFQyxlQUEwQixFQUFFQyx3QkFBaUMsRUFBRUMsTUFBYyxFQUFHO0lBRWxHLEtBQUssQ0FBRUMsSUFBSSxDQUFDQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUVsQixpQkFBaUIsQ0FBQ21CLGlDQUFpQyxFQUFFSCxNQUFPLENBQUM7O0lBRTNGO0lBQ0E7SUFDQSxNQUFNSSxTQUFTLEdBQUcsSUFBSWpCLE1BQU0sQ0FBRVQsS0FBSyxDQUFDMkIsSUFBSSxDQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBSSxDQUFDLEVBQUVoQixTQUFTLENBQUNpQixHQUFHLEVBQzFFLElBQUksQ0FBQ0Msa0JBQWtCLENBQUNDLFFBQVEsQ0FBRW5CLFNBQVMsQ0FBQ2lCLEdBQUcsQ0FBQ0csNEJBQTZCLENBQUUsQ0FBQztJQUNsRixJQUFJLENBQUNDLGlCQUFpQixHQUFHLElBQUluQyxRQUFRLENBQUU2QixTQUFTLEVBQUU7TUFFaEQ7TUFDQU8sNEJBQTRCLEVBQUUsSUFBSTtNQUVsQztNQUNBQyxTQUFTLEVBQUUsSUFBSTtNQUNmWixNQUFNLEVBQUVBLE1BQU0sQ0FBQ2EsWUFBWSxDQUFFLG1CQUFvQixDQUFDO01BQ2xEQyxlQUFlLEVBQUUzQixNQUFNLENBQUM0QjtJQUMxQixDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNQyxZQUFZLEdBQUcsSUFBSTdCLE1BQU0sQ0FBRVQsS0FBSyxDQUFDMkIsSUFBSSxDQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFJLENBQUMsRUFBRVAsZUFBZSxFQUNsRixJQUFJLENBQUNTLGtCQUFrQixDQUFDQyxRQUFRLENBQUVWLGVBQWUsQ0FBQ1csNEJBQTZCLENBQUUsQ0FBQztJQUNwRixJQUFJLENBQUNRLG9CQUFvQixHQUFHLElBQUkxQyxRQUFRLENBQUV5QyxZQUFZLEVBQUU7TUFFdEQ7TUFDQUwsNEJBQTRCLEVBQUUsSUFBSTtNQUVsQztNQUNBQyxTQUFTLEVBQUUsSUFBSTtNQUNmWixNQUFNLEVBQUVBLE1BQU0sQ0FBQ2EsWUFBWSxDQUFFLHNCQUF1QixDQUFDO01BQ3JEQyxlQUFlLEVBQUUzQixNQUFNLENBQUM0QjtJQUMxQixDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNHLElBQUksR0FBRyxDQUFDOztJQUViO0lBQ0E7SUFDQSxJQUFJLENBQUNDLG9DQUFvQyxHQUFHLElBQUk3QyxlQUFlLENBQUUsQ0FDN0QsSUFBSSxDQUFDb0MsaUJBQWlCLEVBQ3RCLElBQUksQ0FBQ1UsS0FBSyxDQUFDQyxhQUFhLENBQ3pCLEVBQ0QsQ0FBRWpCLFNBQVMsRUFBRWtCLEtBQUssS0FBTWxCLFNBQVMsQ0FBQ21CLG9CQUFvQixDQUFFRCxLQUFLLENBQUNFLFVBQVcsQ0FBQyxFQUFFO01BQzFFeEIsTUFBTSxFQUFFQSxNQUFNLENBQUNhLFlBQVksQ0FBRSxzQ0FBdUMsQ0FBQztNQUNyRUMsZUFBZSxFQUFFakM7SUFDbkIsQ0FBRSxDQUFDOztJQUVMO0lBQ0E7SUFDQSxJQUFJLENBQUM0Qyx1Q0FBdUMsR0FBRyxJQUFJbkQsZUFBZSxDQUFFLENBQ2hFLElBQUksQ0FBQzJDLG9CQUFvQixFQUN6QixJQUFJLENBQUNHLEtBQUssQ0FBQ0MsYUFBYSxDQUN6QixFQUNELENBQUVMLFlBQVksRUFBRU0sS0FBSyxLQUFNTixZQUFZLENBQUNPLG9CQUFvQixDQUFFRCxLQUFLLENBQUNFLFVBQVcsQ0FBQyxFQUFFO01BQ2hGeEIsTUFBTSxFQUFFQSxNQUFNLENBQUNhLFlBQVksQ0FBRSx5Q0FBMEMsQ0FBQztNQUN4RUMsZUFBZSxFQUFFakM7SUFDbkIsQ0FBRSxDQUFDOztJQUVMO0lBQ0EsSUFBSSxDQUFDNkMsY0FBYyxHQUFHLElBQUl6QyxjQUFjLENBQ3RDLENBQUMsSUFBSSxDQUFDMEMsVUFBVSxJQUFLNUIsd0JBQXdCLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBRSxFQUM3RCxDQUFDLElBQUksQ0FBQzZCLFdBQVcsR0FBRyxLQUFLLEVBQ3pCLENBQUMsSUFBSSxDQUFDRCxVQUFVLElBQUs1Qix3QkFBd0IsR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFFLEVBQy9ELENBQUMsSUFBSSxDQUFDNkIsV0FBVyxHQUFHLEtBQ3RCLENBQUM7SUFFRHBDLFNBQVMsQ0FBQ3FDLFNBQVMsQ0FBRSxDQUNuQixJQUFJLENBQUNDLGlCQUFpQixFQUN0QixJQUFJLENBQUNWLEtBQUssQ0FBQ1csVUFBVSxFQUNyQixJQUFJLENBQUNMLGNBQWMsQ0FBQ00sc0JBQXNCLEVBQzFDLElBQUksQ0FBQ04sY0FBYyxDQUFDTyxlQUFlLEVBQ25DLElBQUksQ0FBQ2IsS0FBSyxDQUFDYyxxQkFBcUIsRUFDaEMsSUFBSSxDQUFDZCxLQUFLLENBQUNDLGFBQWEsRUFDeEIsSUFBSSxDQUFDSSx1Q0FBdUMsRUFDNUMsSUFBSSxDQUFDTixvQ0FBb0MsQ0FDMUMsRUFBRSxNQUFNO01BRVA7TUFDQSxJQUFJLENBQUNPLGNBQWMsQ0FBQ1MsZ0JBQWdCLENBQUMsQ0FBQztNQUN0QyxJQUFJLENBQUNDLFdBQVcsQ0FBQyxDQUFDO01BQ2xCLElBQUssSUFBSSxDQUFDTixpQkFBaUIsQ0FBQ08sS0FBSyxLQUFLOUMsYUFBYSxDQUFDK0MsSUFBSSxJQUFJLElBQUksQ0FBQ2xCLEtBQUssQ0FBQ1csVUFBVSxDQUFDTSxLQUFLLEVBQUc7UUFDeEYsSUFBSyxDQUFDLElBQUksQ0FBQ0UsVUFBVSxFQUFHO1VBQ3RCLElBQUksQ0FBQ0Msc0JBQXNCLENBQUMsQ0FBQztRQUMvQjtNQUNGO0lBQ0YsQ0FBRSxDQUFDOztJQUVIO0lBQ0E7SUFDQSxJQUFJLENBQUNDLFVBQVUsR0FBRyxJQUFJaEUsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7O0lBRXJDO0lBQ0EsSUFBSSxDQUFDaUUsU0FBUyxHQUFHLElBQUlqRSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztJQUVwQyxJQUFJLENBQUNrRSx3QkFBd0IsR0FBRyxDQUFDMUMsSUFBSSxDQUFDQyxFQUFFLEdBQUcsQ0FBQztFQUM5Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNTMEMsYUFBYUEsQ0FBQSxFQUFTO0lBQzNCLElBQUssSUFBSSxDQUFDeEIsS0FBSyxDQUFDVyxVQUFVLENBQUNNLEtBQUssRUFBRztNQUNqQyxNQUFNUSxJQUFJLEdBQUcsSUFBSSxDQUFDekIsS0FBSyxDQUFDYyxxQkFBcUIsQ0FBQ0csS0FBSzs7TUFFbkQ7TUFDQTtNQUNBLE1BQU1TLEVBQUUsR0FBRyxJQUFJLENBQUMzQixvQ0FBb0MsQ0FBQzRCLEdBQUcsQ0FBQyxDQUFDOztNQUUxRDtNQUNBLE1BQU1DLEVBQUUsR0FBRyxJQUFJLENBQUN2Qix1Q0FBdUMsQ0FBQ3NCLEdBQUcsQ0FBQyxDQUFDOztNQUU3RDtNQUNBLE1BQU1FLE1BQU0sR0FBRyxJQUFJLENBQUM3QixLQUFLLENBQUM4QixRQUFRLENBQUMsQ0FBQyxHQUFHakQsSUFBSSxDQUFDQyxFQUFFLEdBQUcsQ0FBQzs7TUFFbEQ7TUFDQSxNQUFNaUQsTUFBTSxHQUFHbEQsSUFBSSxDQUFDbUQsSUFBSSxDQUFFTixFQUFFLEdBQUdFLEVBQUUsR0FBRy9DLElBQUksQ0FBQ29ELEdBQUcsQ0FBRUosTUFBTyxDQUFFLENBQUM7O01BRXhEO01BQ0EsTUFBTUssV0FBVyxHQUFHLEdBQUc7O01BRXZCO01BQ0EsTUFBTUMsQ0FBQyxHQUFHOUQscUJBQXFCLEdBQUcsQ0FBQzs7TUFFbkM7TUFDQSxNQUFNK0QsZUFBZSxHQUFHRCxDQUFDLEdBQUcsQ0FBQzs7TUFFN0I7TUFDQSxNQUFNakMsS0FBSyxHQUFHLElBQUksQ0FBQ0YsS0FBSyxDQUFDQyxhQUFhLENBQUMwQixHQUFHLENBQUMsQ0FBQyxDQUFDdkMsUUFBUSxDQUFDLENBQUM7TUFDdkQsTUFBTWlELHFCQUFxQixHQUFHLElBQUksQ0FBQ3JDLEtBQUssQ0FBQ0MsYUFBYSxDQUFDMEIsR0FBRyxDQUFDLENBQUMsQ0FBQ3ZCLFVBQVUsR0FBR3NCLEVBQUU7O01BRTVFO01BQ0E7TUFDQSxNQUFNWSxjQUFjLEdBQUd6RCxJQUFJLENBQUMwRCxHQUFHLENBQUVILGVBQWUsR0FBR3ZELElBQUksQ0FBQ29ELEdBQUcsQ0FBRSxJQUFJLENBQUNqQyxLQUFLLENBQUM4QixRQUFRLENBQUMsQ0FBRSxDQUFFLENBQUM7O01BRXRGO01BQ0E7TUFDQSxNQUFNVSxXQUFXLEdBQUcsSUFBSTFFLFFBQVEsQ0FBRXdFLGNBQWMsRUFBRWIsSUFBSSxFQUFFLElBQUlwRSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUFFcUUsRUFBRSxFQUFFVyxxQkFBcUIsRUFDcEcsSUFBSSxDQUFDckMsS0FBSyxDQUFDeUMsYUFBYSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUVQLFdBQVcsRUFBRWhDLEtBQUssRUFBRWtDLGVBQWUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMxQixpQkFBaUIsQ0FBQ08sS0FBSyxFQUFFLFVBQVcsQ0FBQztNQUVySSxNQUFNeUIsV0FBVyxHQUFHLElBQUksQ0FBQ0MsWUFBWSxDQUFFSCxXQUFXLEVBQUUsVUFBVyxDQUFDO01BQ2hFLElBQUssQ0FBQ0UsV0FBVyxFQUFHO1FBQ2xCLE1BQU1FLDhCQUE4QixHQUFHL0QsSUFBSSxDQUFDbUQsSUFBSSxDQUFFSixFQUFFLEdBQUdGLEVBQUcsQ0FBQztRQUMzRCxJQUFJbUIsaUJBQWlCLEdBQUdDLEtBQUssQ0FBRUYsOEJBQStCLENBQUMsSUFDdkNmLE1BQU0sR0FBR2UsOEJBQThCOztRQUUvRDtRQUNBO1FBQ0EsSUFBSUcsbUJBQW1CO1FBQ3ZCLElBQUtGLGlCQUFpQixFQUFHO1VBQ3ZCRSxtQkFBbUIsR0FBR25GLGlCQUFpQixDQUFDb0YsaUJBQWlCLENBQUV0QixFQUFFLEVBQUVFLEVBQUUsRUFBRS9DLElBQUksQ0FBQ29FLEdBQUcsQ0FBRXBCLE1BQU8sQ0FBQyxFQUFFaEQsSUFBSSxDQUFDb0UsR0FBRyxDQUFFbEIsTUFBTyxDQUFFLENBQUM7UUFDN0csQ0FBQyxNQUNJO1VBQ0hnQixtQkFBbUIsR0FBRyxHQUFHO1FBQzNCOztRQUVBO1FBQ0EsSUFBS0EsbUJBQW1CLEtBQUssR0FBRyxFQUFHO1VBQ2pDRixpQkFBaUIsR0FBRyxLQUFLO1FBQzNCOztRQUVBO1FBQ0EsTUFBTUssZUFBZSxHQUFHSCxtQkFBbUIsSUFBSSxLQUFLO1FBQ3BELElBQUtHLGVBQWUsRUFBRztVQUNyQixNQUFNQyxZQUFZLEdBQUcsSUFBSXJGLFFBQVEsQ0FDL0J3RSxjQUFjLEVBQ2QsSUFBSWpGLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CQSxPQUFPLENBQUMrRixXQUFXLENBQUU3RSxXQUFXLEVBQUVNLElBQUksQ0FBQ0MsRUFBRSxHQUFHLElBQUksQ0FBQ2tCLEtBQUssQ0FBQzhCLFFBQVEsQ0FBQyxDQUFFLENBQUMsRUFDbkVKLEVBQUUsRUFDRlcscUJBQXFCLEVBQ3JCLElBQUksQ0FBQ3JDLEtBQUssQ0FBQ3lDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUNoQ00sbUJBQW1CLEdBQUdiLFdBQVcsRUFDakNoQyxLQUFLLEVBQ0xrQyxlQUFlLEVBQ2ZJLFdBQVcsQ0FBQ2Esc0JBQXNCLENBQUMsQ0FBQyxFQUNwQyxJQUFJLEVBQ0osSUFBSSxFQUFFLElBQUksQ0FBQzNDLGlCQUFpQixDQUFDTyxLQUFLLEVBQUUsV0FDdEMsQ0FBQztVQUNELElBQUksQ0FBQzBCLFlBQVksQ0FBRVEsWUFBWSxFQUFFLFdBQVksQ0FBQztRQUNoRCxDQUFDLE1BQ0k7VUFDSEosbUJBQW1CLEdBQUcsQ0FBQztRQUN6Qjs7UUFFQTtRQUNBLElBQUtGLGlCQUFpQixFQUFHO1VBRXZCO1VBQ0E7VUFDQSxNQUFNUyxxQkFBcUIsR0FBR2QsV0FBVyxDQUFDcEMsVUFBVSxHQUFHd0IsRUFBRSxHQUFHRixFQUFFO1VBQzlELElBQUssRUFBR29CLEtBQUssQ0FBRWYsTUFBTyxDQUFDLElBQUksQ0FBQ3dCLFFBQVEsQ0FBRXhCLE1BQU8sQ0FBQyxDQUFFLEVBQUc7WUFDakQsSUFBSXlCLHFCQUFxQixHQUFHNUYsaUJBQWlCLENBQUM2RixtQkFBbUIsQ0FDL0QvQixFQUFFLEVBQ0ZFLEVBQUUsRUFDRi9DLElBQUksQ0FBQ29FLEdBQUcsQ0FBRXBCLE1BQU8sQ0FBQyxFQUNsQmhELElBQUksQ0FBQ29FLEdBQUcsQ0FBRWxCLE1BQU8sQ0FDbkIsQ0FBQztZQUNELElBQUssQ0FBQ21CLGVBQWUsRUFBRztjQUN0Qk0scUJBQXFCLEdBQUcsQ0FBQztZQUMzQjs7WUFFQTtZQUNBO1lBQ0EsTUFBTUUsYUFBYSxHQUFHdkIsQ0FBQyxHQUFHLENBQUM7WUFDM0IsTUFBTXdCLDBCQUEwQixHQUFHRCxhQUFhLEdBQUc3RSxJQUFJLENBQUNvRCxHQUFHLENBQUVwRCxJQUFJLENBQUNDLEVBQUUsR0FBRyxDQUFDLEdBQUcrQyxNQUFPLENBQUMsR0FBRyxDQUFDO1lBQ3ZGLE1BQU0rQix3QkFBd0IsR0FBRy9FLElBQUksQ0FBQ29FLEdBQUcsQ0FBRWxCLE1BQU8sQ0FBQyxHQUFHNEIsMEJBQTBCO1lBQ2hGLE1BQU1FLG9CQUFvQixHQUFHRCx3QkFBd0IsR0FBRyxDQUFDO1lBQ3pELE1BQU1FLGNBQWMsR0FBRyxJQUFJaEcsUUFBUSxDQUNqQ3dFLGNBQWMsRUFDZCxJQUFJakYsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDbkJBLE9BQU8sQ0FBQytGLFdBQVcsQ0FBRTdFLFdBQVcsRUFBRXdELE1BQU0sR0FBR2xELElBQUksQ0FBQ0MsRUFBRSxHQUFHLENBQUUsQ0FBQyxFQUN4RDhDLEVBQUUsRUFDRjBCLHFCQUFxQixFQUNyQixJQUFJLENBQUN0RCxLQUFLLENBQUN5QyxhQUFhLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFDaENlLHFCQUFxQixHQUFHdEIsV0FBVyxFQUNuQ2hDLEtBQUssRUFDTDJELG9CQUFvQixFQUNwQnJCLFdBQVcsQ0FBQ2Esc0JBQXNCLENBQUMsQ0FBQyxFQUNwQyxJQUFJLEVBQ0osSUFBSSxFQUNKLElBQUksQ0FBQzNDLGlCQUFpQixDQUFDTyxLQUFLLEVBQUUsYUFBYyxDQUFDO1lBQy9DLElBQUksQ0FBQzBCLFlBQVksQ0FBRW1CLGNBQWMsRUFBRSxhQUFjLENBQUM7VUFDcEQ7UUFDRjtNQUNGO0lBQ0Y7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDVW5CLFlBQVlBLENBQUVvQixHQUFhLEVBQUVDLE9BQW9CLEVBQVk7SUFDbkUsTUFBTUMsV0FBVyxHQUFHRCxPQUFPLEtBQUssVUFBVSxHQUFHbkYsSUFBSSxDQUFDQyxFQUFFLEdBQUcsQ0FBQzs7SUFFeEQ7SUFDQSxNQUFNb0YsVUFBVSxHQUFHLElBQUksQ0FBQzVELGNBQWMsQ0FBQ08sZUFBZSxDQUFDSSxLQUFLLEdBQ3pDOEMsR0FBRyxDQUFDSSxnQkFBZ0IsQ0FBRSxJQUFJLENBQUM3RCxjQUFjLENBQUM4RCxjQUFjLENBQUMsQ0FBQyxFQUFFSixPQUFRLENBQUMsR0FBRyxFQUFFOztJQUU3RjtJQUNBLElBQUl0QixXQUFXLEdBQUd3QixVQUFVLENBQUNHLE1BQU0sR0FBRyxDQUFDO0lBQ3ZDLElBQUszQixXQUFXLEVBQUc7TUFDakIsSUFBSTRCLENBQUM7TUFDTCxJQUFJQyxDQUFDO01BQ0xDLE1BQU0sSUFBSUEsTUFBTSxDQUFFTixVQUFVLENBQUNHLE1BQU0sSUFBSSxDQUFDLEVBQUUsd0JBQXlCLENBQUM7TUFDcEUsSUFBS0gsVUFBVSxDQUFDRyxNQUFNLEtBQUssQ0FBQyxFQUFHO1FBRTdCO1FBQ0FDLENBQUMsR0FBR0osVUFBVSxDQUFFLENBQUMsQ0FBRSxDQUFDTyxLQUFLLENBQUNILENBQUM7UUFDM0JDLENBQUMsR0FBR0wsVUFBVSxDQUFFLENBQUMsQ0FBRSxDQUFDTyxLQUFLLENBQUNGLENBQUM7TUFDN0IsQ0FBQyxNQUNJO1FBQ0hDLE1BQU0sSUFBSUEsTUFBTSxDQUFFTixVQUFVLENBQUNHLE1BQU0sS0FBSyxDQUFFLENBQUM7UUFDM0NDLENBQUMsR0FBRyxDQUFFSixVQUFVLENBQUUsQ0FBQyxDQUFFLENBQUNPLEtBQUssQ0FBQ0gsQ0FBQyxHQUFHSixVQUFVLENBQUUsQ0FBQyxDQUFFLENBQUNPLEtBQUssQ0FBQ0gsQ0FBQyxJQUFLLENBQUM7UUFDN0RDLENBQUMsR0FBRyxDQUFFTCxVQUFVLENBQUUsQ0FBQyxDQUFFLENBQUNPLEtBQUssQ0FBQ0YsQ0FBQyxHQUFHTCxVQUFVLENBQUUsQ0FBQyxDQUFFLENBQUNPLEtBQUssQ0FBQ0YsQ0FBQyxJQUFLLENBQUM7TUFDL0Q7TUFFQSxNQUFNRyxRQUFRLEdBQUc3RixJQUFJLENBQUM4RixJQUFJLENBQUVMLENBQUMsR0FBR0EsQ0FBQyxHQUFHQyxDQUFDLEdBQUdBLENBQUUsQ0FBQztNQUMzQyxNQUFNSyxXQUFXLEdBQUcsSUFBSTlHLFFBQVEsQ0FDOUJpRyxHQUFHLENBQUN6QixjQUFjLEVBQ2xCeUIsR0FBRyxDQUFDdEMsSUFBSSxFQUNScEUsT0FBTyxDQUFDK0YsV0FBVyxDQUFFc0IsUUFBUSxFQUFFWCxHQUFHLENBQUNqQyxRQUFRLENBQUMsQ0FBQyxHQUFHbUMsV0FBWSxDQUFDLEVBQzdERixHQUFHLENBQUNjLGlCQUFpQixFQUNyQmQsR0FBRyxDQUFDM0QsVUFBVSxFQUNkLElBQUksQ0FBQ0osS0FBSyxDQUFDeUMsYUFBYSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQ2hDc0IsR0FBRyxDQUFDZSxhQUFhLEVBQ2pCLElBQUksQ0FBQzlFLEtBQUssQ0FBQ0MsYUFBYSxDQUFDMEIsR0FBRyxDQUFDLENBQUMsQ0FBQ3ZDLFFBQVEsQ0FBQyxDQUFDLEVBQ3pDMkUsR0FBRyxDQUFDZ0IsU0FBUyxFQUNiaEIsR0FBRyxDQUFDaUIseUJBQXlCLEVBQzdCLEtBQUssRUFDTGpCLEdBQUcsQ0FBQ2tCLGVBQWUsRUFDbkIsSUFBSSxDQUFDdkUsaUJBQWlCLENBQUNPLEtBQUssRUFDNUIrQyxPQUNGLENBQUM7O01BRUQ7TUFDQSxNQUFNa0IsU0FBUyxHQUFHbkIsR0FBRyxDQUFDb0IsUUFBUSxDQUFDLENBQUMsQ0FBQ0MsR0FBRyxDQUFFUixXQUFXLENBQUNPLFFBQVEsQ0FBQyxDQUFFLENBQUMsR0FBRyxDQUFDO01BQ2xFLElBQUtQLFdBQVcsQ0FBQ1MsU0FBUyxDQUFDLENBQUMsR0FBR3RCLEdBQUcsQ0FBQ3NCLFNBQVMsQ0FBQyxDQUFDLElBQUlILFNBQVMsRUFBRztRQUM1RCxJQUFJLENBQUNJLE1BQU0sQ0FBRVYsV0FBWSxDQUFDO01BQzVCLENBQUMsTUFDSTtRQUNILElBQUksQ0FBQ1UsTUFBTSxDQUFFdkIsR0FBSSxDQUFDO1FBQ2xCckIsV0FBVyxHQUFHLEtBQUs7TUFDckI7SUFDRixDQUFDLE1BQ0k7TUFDSCxJQUFJLENBQUM0QyxNQUFNLENBQUV2QixHQUFJLENBQUM7SUFDcEI7SUFDQSxJQUFLckIsV0FBVyxFQUFHO01BQ2pCLElBQUksQ0FBQ3BDLGNBQWMsQ0FBQ2lGLGFBQWEsQ0FBRSxJQUFJdkgsT0FBTyxDQUFFK0YsR0FBRyxDQUFDZSxhQUFjLENBQUUsQ0FBQztJQUN2RSxDQUFDLE1BQ0k7TUFDSCxJQUFJLENBQUN4RSxjQUFjLENBQUNpRixhQUFhLENBQUV2SCxPQUFPLENBQUN3SCxJQUFLLENBQUM7SUFDbkQ7SUFDQSxPQUFPOUMsV0FBVztFQUNwQjtFQUVnQitDLEtBQUtBLENBQUEsRUFBUztJQUM1QixLQUFLLENBQUNBLEtBQUssQ0FBQyxDQUFDO0lBQ2IsSUFBSSxDQUFDbkcsaUJBQWlCLENBQUNtRyxLQUFLLENBQUMsQ0FBQztJQUM5QixJQUFJLENBQUM1RixvQkFBb0IsQ0FBQzRGLEtBQUssQ0FBQyxDQUFDO0lBQ2pDLElBQUksQ0FBQ25GLGNBQWMsQ0FBQ21GLEtBQUssQ0FBQyxDQUFDO0VBQzdCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ1NDLFdBQVdBLENBQUVDLFFBQWlCLEVBQVk7SUFDL0MsTUFBTUMsU0FBUyxHQUFHLElBQUksQ0FBQ2xGLGlCQUFpQixDQUFDTyxLQUFLO0lBQzlDLEtBQU0sSUFBSTRFLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNDLElBQUksQ0FBQ3pCLE1BQU0sRUFBRXdCLENBQUMsRUFBRSxFQUFHO01BQzNDLElBQUssSUFBSSxDQUFDQyxJQUFJLENBQUVELENBQUMsQ0FBRSxDQUFDRSxRQUFRLENBQUVKLFFBQVEsRUFBRUMsU0FBUyxLQUFLekgsYUFBYSxDQUFDK0MsSUFBSyxDQUFDLEVBQUc7UUFDM0UsT0FBTyxJQUFJLENBQUM0RSxJQUFJLENBQUVELENBQUMsQ0FBRSxDQUFDRyxpQkFBaUIsQ0FBQyxDQUFDO01BQzNDO0lBQ0Y7SUFDQSxPQUFPLElBQUkzSSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztFQUM1Qjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ1k0SSxZQUFZQSxDQUFFTixRQUFpQixFQUErQztJQUN0RixLQUFNLElBQUlFLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNDLElBQUksQ0FBQ3pCLE1BQU0sRUFBRXdCLENBQUMsRUFBRSxFQUFHO01BQzNDLE1BQU05QixHQUFHLEdBQUcsSUFBSSxDQUFDK0IsSUFBSSxDQUFFRCxDQUFDLENBQUU7TUFDMUIsSUFBSzlCLEdBQUcsQ0FBQ2dDLFFBQVEsQ0FBRUosUUFBUSxFQUFFLElBQUksQ0FBQ2pGLGlCQUFpQixDQUFDTyxLQUFLLEtBQUs5QyxhQUFhLENBQUMrQyxJQUFLLENBQUMsRUFBRztRQUVuRjtRQUNBLE1BQU1nRixTQUFTLEdBQUdySCxJQUFJLENBQUM4RixJQUFJLENBQUVaLEdBQUcsQ0FBQ2UsYUFBYyxDQUFDOztRQUVoRDtRQUNBLE1BQU1xQixhQUFhLEdBQUdwQyxHQUFHLENBQUNxQyxhQUFhLENBQUMsQ0FBQztRQUN6QyxNQUFNOUIsQ0FBQyxHQUFHcUIsUUFBUSxDQUFDckIsQ0FBQyxHQUFHUCxHQUFHLENBQUN0QyxJQUFJLENBQUM2QyxDQUFDO1FBQ2pDLE1BQU1DLENBQUMsR0FBR29CLFFBQVEsQ0FBQ3BCLENBQUMsR0FBR1IsR0FBRyxDQUFDdEMsSUFBSSxDQUFDOEMsQ0FBQztRQUNqQyxNQUFNOEIsZ0JBQWdCLEdBQUdGLGFBQWEsQ0FBQzdCLENBQUMsR0FBR0EsQ0FBQyxHQUFHNkIsYUFBYSxDQUFDNUIsQ0FBQyxHQUFHQSxDQUFDO1FBQ2xFLE1BQU0rQixLQUFLLEdBQUd2QyxHQUFHLENBQUN3QyxTQUFTLENBQUVGLGdCQUFpQixDQUFDOztRQUUvQztRQUNBLE9BQU87VUFBRXZHLElBQUksRUFBRWlFLEdBQUcsQ0FBQ2pFLElBQUk7VUFBRTBHLFNBQVMsRUFBRU4sU0FBUyxHQUFHckgsSUFBSSxDQUFDb0UsR0FBRyxDQUFFcUQsS0FBSyxHQUFHekgsSUFBSSxDQUFDQyxFQUFHO1FBQUUsQ0FBQztNQUMvRTtJQUNGO0lBQ0EsT0FBTyxJQUFJO0VBQ2I7O0VBRUE7QUFDRjtBQUNBO0VBQ1MySCxJQUFJQSxDQUFBLEVBQVM7SUFFbEIsSUFBSyxJQUFJLENBQUNDLGlCQUFpQixDQUFDekYsS0FBSyxFQUFHO01BQ2xDLElBQUksQ0FBQzBGLGdDQUFnQyxDQUFFLElBQUksQ0FBQ0MsYUFBYSxDQUFDM0YsS0FBTSxDQUFDO0lBQ25FO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0VBQ1MwRixnQ0FBZ0NBLENBQUVFLEtBQWdCLEVBQVM7SUFFaEU7SUFDQSxJQUFJLENBQUMvRyxJQUFJLEdBQUcsSUFBSSxDQUFDQSxJQUFJLElBQUsrRyxLQUFLLEtBQUt0SixTQUFTLENBQUN1SixNQUFNLEdBQUcsS0FBSyxHQUFHLE9BQU8sQ0FBRTs7SUFFeEU7SUFDQSxJQUFJLENBQUNoQixJQUFJLENBQUNpQixPQUFPLENBQUVoRCxHQUFHLElBQUlBLEdBQUcsQ0FBQ2lELE9BQU8sQ0FBRSxJQUFJLENBQUNsSCxJQUFLLENBQUUsQ0FBQztJQUNwRCxJQUFLLElBQUksQ0FBQ0UsS0FBSyxDQUFDVyxVQUFVLENBQUNNLEtBQUssSUFBSSxJQUFJLENBQUNQLGlCQUFpQixDQUFDTyxLQUFLLEtBQUs5QyxhQUFhLENBQUMrQyxJQUFJLEVBQUc7TUFDeEYsSUFBSyxDQUFDLElBQUksQ0FBQ0MsVUFBVSxFQUFHO1FBQ3RCLElBQUksQ0FBQzhGLGtCQUFrQixDQUFDLENBQUM7TUFDM0I7SUFDRjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtFQUNVN0Ysc0JBQXNCQSxDQUFBLEVBQVM7SUFFckMsSUFBSThGLGFBQXFCO0lBQ3pCLElBQUlDLHFCQUE2QjtJQUNqQyxJQUFJQyxDQUFDO0lBQ0wsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDdkIsSUFBSSxDQUFDekIsTUFBTSxFQUFFZ0QsQ0FBQyxFQUFFLEVBQUc7TUFDM0MsTUFBTUMsUUFBUSxHQUFHLElBQUksQ0FBQ3hCLElBQUksQ0FBRXVCLENBQUMsQ0FBRTtNQUMvQixNQUFNRSxlQUFlLEdBQUdELFFBQVEsQ0FBQ2xCLGFBQWEsQ0FBQyxDQUFDO01BQ2hELE1BQU1oRyxVQUFVLEdBQUdrSCxRQUFRLENBQUNsSCxVQUFVO01BQ3RDLE1BQU1vSCxLQUFLLEdBQUdGLFFBQVEsQ0FBQ3hGLFFBQVEsQ0FBQyxDQUFDO01BQ2pDLElBQUt1RixDQUFDLEtBQUssQ0FBQyxFQUFHO1FBRWI7UUFDQSxJQUFJLENBQUMvRixTQUFTLENBQUNnRCxDQUFDLEdBQUdnRCxRQUFRLENBQUNHLEdBQUcsQ0FBQ25ELENBQUMsR0FBR2lELGVBQWUsQ0FBQ2pELENBQUMsR0FBR2dELFFBQVEsQ0FBQ2hGLGNBQWMsR0FBRyxDQUFDLEdBQUd6RCxJQUFJLENBQUNvRSxHQUFHLENBQUV1RSxLQUFNLENBQUM7UUFDdkcsSUFBSSxDQUFDbEcsU0FBUyxDQUFDaUQsQ0FBQyxHQUFHK0MsUUFBUSxDQUFDRyxHQUFHLENBQUNsRCxDQUFDLEdBQUdnRCxlQUFlLENBQUNoRCxDQUFDLEdBQUcrQyxRQUFRLENBQUNoRixjQUFjLEdBQUcsQ0FBQyxHQUFHekQsSUFBSSxDQUFDb0UsR0FBRyxDQUFFdUUsS0FBTSxDQUFDO1FBQ3ZHLElBQUksQ0FBQ25HLFVBQVUsQ0FBQ2lELENBQUMsR0FBR2dELFFBQVEsQ0FBQzdGLElBQUksQ0FBQzZDLENBQUM7UUFDbkMsSUFBSSxDQUFDakQsVUFBVSxDQUFDa0QsQ0FBQyxHQUFHK0MsUUFBUSxDQUFDN0YsSUFBSSxDQUFDOEMsQ0FBQztNQUNyQyxDQUFDLE1BQ0k7UUFFSDtRQUNBLElBQUksQ0FBQ2pELFNBQVMsQ0FBQ2dELENBQUMsR0FBSyxDQUFDLEdBQUt6RixJQUFJLENBQUNvRSxHQUFHLENBQUV1RSxLQUFNLENBQUM7UUFDNUMsSUFBSSxDQUFDbEcsU0FBUyxDQUFDaUQsQ0FBQyxHQUFLLENBQUMsR0FBSzFGLElBQUksQ0FBQ29ELEdBQUcsQ0FBRXVGLEtBQU0sQ0FBQztRQUM1QyxJQUFJLENBQUNuRyxVQUFVLENBQUNpRCxDQUFDLEdBQUdnRCxRQUFRLENBQUM3RixJQUFJLENBQUM2QyxDQUFDLEdBQUdpRCxlQUFlLENBQUNqRCxDQUFDLEdBQUdnRCxRQUFRLENBQUNoRixjQUFjLEdBQUcsQ0FBQyxHQUFHekQsSUFBSSxDQUFDb0UsR0FBRyxDQUFFdUUsS0FBTSxDQUFDO1FBQ3pHLElBQUksQ0FBQ25HLFVBQVUsQ0FBQ2tELENBQUMsR0FBRytDLFFBQVEsQ0FBQzdGLElBQUksQ0FBQzhDLENBQUMsR0FBR2dELGVBQWUsQ0FBQ2hELENBQUMsR0FBRytDLFFBQVEsQ0FBQ2hGLGNBQWMsR0FBRyxDQUFDLEdBQUd6RCxJQUFJLENBQUNvRSxHQUFHLENBQUV1RSxLQUFNLENBQUM7TUFDM0c7TUFDQSxNQUFNRSxrQkFBa0IsR0FBRyxJQUFJdEssSUFBSSxDQUFFLElBQUksQ0FBQ2lFLFVBQVUsRUFBRWtHLGVBQWdCLENBQUM7TUFDdkUsTUFBTTdDLFFBQVEsR0FBRyxJQUFJLENBQUNwRCxTQUFTLENBQUNvRCxRQUFRLENBQUUsSUFBSSxDQUFDckQsVUFBVyxDQUFDO01BQzNELE1BQU1zRyw2QkFBNkIsR0FBR3ZILFVBQVU7TUFDaEQ4RyxhQUFhLEdBQUcsSUFBSTFKLEtBQUssQ0FBRThKLFFBQVEsQ0FBQ3BILEtBQUssQ0FBQzBILE1BQU0sQ0FBQyxDQUFDLEVBQUVOLFFBQVEsQ0FBQ3BILEtBQUssQ0FBQzJILFFBQVEsQ0FBQyxDQUFDLEVBQUVQLFFBQVEsQ0FBQ3BILEtBQUssQ0FBQzRILE9BQU8sQ0FBQyxDQUFDLEVBQ3JHakosSUFBSSxDQUFDOEYsSUFBSSxDQUFFMkMsUUFBUSxDQUFDeEMsYUFBYyxDQUFFLENBQUMsQ0FBQ2lELEtBQUssQ0FBQyxDQUFDO01BQy9DWixxQkFBcUIsR0FBRyxJQUFJM0osS0FBSyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFcUIsSUFBSSxDQUFDOEYsSUFBSSxDQUFFMkMsUUFBUSxDQUFDeEMsYUFBYyxDQUFFLENBQUMsQ0FBQ2lELEtBQUssQ0FBQyxDQUFDOztNQUV6RjtNQUNBLE1BQU1DLGlCQUFpQixHQUFHbkosSUFBSSxDQUFDb0osR0FBRyxDQUFFcEosSUFBSSxDQUFDcUosSUFBSSxDQUFFeEQsUUFBUSxHQUFHaUQsNkJBQThCLENBQUMsRUFBRSxHQUFJLENBQUMsR0FBRyxDQUFDO01BQ3BHLElBQUlRLGVBQWUsR0FBRyxDQUFDOztNQUV2QjtNQUNBLEtBQU1mLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR1ksaUJBQWlCLEVBQUVaLENBQUMsRUFBRSxFQUFHO1FBQ3hDRSxRQUFRLENBQUNjLFNBQVMsQ0FBQ0MsSUFBSSxDQUFFLElBQUluSyxZQUFZLENBQUV3SixrQkFBa0IsQ0FBQ1ksZUFBZSxDQUFFSCxlQUFnQixDQUFDLEVBQzlGYixRQUFRLENBQUN2QyxTQUFTLEVBQUVtQyxhQUFhLEVBQUVDLHFCQUFxQixFQUFFSyxLQUFLLEVBQUVwSCxVQUFXLENBQUUsQ0FBQztRQUNqRitILGVBQWUsSUFBSVIsNkJBQTZCO01BQ2xEO0lBQ0Y7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7RUFDVVYsa0JBQWtCQSxDQUFBLEVBQVM7SUFFakMsS0FBTSxJQUFJcEIsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ0MsSUFBSSxDQUFDekIsTUFBTSxFQUFFd0IsQ0FBQyxFQUFFLEVBQUc7TUFDM0MsTUFBTXlCLFFBQVEsR0FBRyxJQUFJLENBQUN4QixJQUFJLENBQUVELENBQUMsQ0FBRTtNQUMvQixNQUFNekYsVUFBVSxHQUFHa0gsUUFBUSxDQUFDbEgsVUFBVTtNQUN0QyxNQUFNbUgsZUFBZSxHQUFHRCxRQUFRLENBQUNsQixhQUFhLENBQUMsQ0FBQztNQUNoRCxNQUFNbUMsYUFBYSxHQUFHakIsUUFBUSxDQUFDYyxTQUFTOztNQUV4QztNQUNBLE1BQU1JLHFDQUFxQyxHQUFHbEIsUUFBUSxDQUFDbUIsY0FBYyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUc1SixJQUFJLENBQUNDLEVBQUU7O01BRXJGO01BQ0EsSUFBSTRKLFNBQVMsR0FBS0YscUNBQXFDLEdBQUcsQ0FBQyxHQUFLcEksVUFBVTtNQUMxRSxJQUFJdUksS0FBSztNQUNULElBQUlDLEtBQUs7TUFDVCxNQUFNcEIsS0FBSyxHQUFHRixRQUFRLENBQUN4RixRQUFRLENBQUMsQ0FBQztNQUNqQyxJQUFLK0QsQ0FBQyxLQUFLLENBQUMsRUFBRztRQUViO1FBQ0E4QyxLQUFLLEdBQUdyQixRQUFRLENBQUM3RixJQUFJLENBQUM2QyxDQUFDO1FBQ3ZCc0UsS0FBSyxHQUFHdEIsUUFBUSxDQUFDN0YsSUFBSSxDQUFDOEMsQ0FBQztNQUN6QixDQUFDLE1BQ0k7UUFFSDtRQUNBLE1BQU1HLFFBQVEsR0FBRzRDLFFBQVEsQ0FBQ2hGLGNBQWMsR0FBRyxDQUFDLEdBQUd6RCxJQUFJLENBQUNvRSxHQUFHLENBQUV1RSxLQUFNLENBQUM7UUFDaEVrQixTQUFTLEdBQUcsQ0FBRWhFLFFBQVEsR0FBR2dFLFNBQVMsSUFBS3RJLFVBQVU7UUFDakR1SSxLQUFLLEdBQUdyQixRQUFRLENBQUM3RixJQUFJLENBQUM2QyxDQUFDLEdBQUtpRCxlQUFlLENBQUNqRCxDQUFDLEdBQUdnRCxRQUFRLENBQUNoRixjQUFjLEdBQUcsQ0FBQyxHQUFHekQsSUFBSSxDQUFDb0UsR0FBRyxDQUFFdUUsS0FBTSxDQUFHO1FBQ2pHb0IsS0FBSyxHQUFHdEIsUUFBUSxDQUFDN0YsSUFBSSxDQUFDOEMsQ0FBQyxHQUFLZ0QsZUFBZSxDQUFDaEQsQ0FBQyxHQUFHK0MsUUFBUSxDQUFDaEYsY0FBYyxHQUFHLENBQUMsR0FBR3pELElBQUksQ0FBQ29FLEdBQUcsQ0FBRXVFLEtBQU0sQ0FBRztNQUNuRzs7TUFFQTtNQUNBLEtBQU0sSUFBSUosQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHbUIsYUFBYSxDQUFDbEUsTUFBTSxFQUFFK0MsQ0FBQyxFQUFFLEVBQUc7UUFDL0MsTUFBTXlCLFFBQVEsR0FBR04sYUFBYSxDQUFFbkIsQ0FBQyxDQUFFO1FBQ25DeUIsUUFBUSxDQUFDQyxJQUFJLENBQUVILEtBQUssR0FBS3BCLGVBQWUsQ0FBQ2pELENBQUMsSUFBTzhDLENBQUMsR0FBR2hILFVBQVUsR0FBS3NJLFNBQVMsQ0FBSyxDQUFDO1FBQ25GRyxRQUFRLENBQUNFLElBQUksQ0FBRUgsS0FBSyxHQUFLckIsZUFBZSxDQUFDaEQsQ0FBQyxJQUFPNkMsQ0FBQyxHQUFHaEgsVUFBVSxHQUFLc0ksU0FBUyxDQUFLLENBQUM7TUFDckY7SUFDRjtFQUNGO0FBQ0Y7QUFFQWhMLFlBQVksQ0FBQ3NMLFFBQVEsQ0FBRSxZQUFZLEVBQUV4SyxVQUFXLENBQUM7QUFFakQsZUFBZUEsVUFBVSJ9