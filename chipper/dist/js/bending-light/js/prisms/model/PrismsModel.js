// Copyright 2015-2023, University of Colorado Boulder

/**
 * Model for the "prisms" screen, in which the user can move the laser and many prisms.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Ray2 from '../../../../dot/js/Ray2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import { Color } from '../../../../scenery/js/imports.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../../common/BendingLightConstants.js';
import BendingLightModel from '../../common/model/BendingLightModel.js';
import LightRay from '../../common/model/LightRay.js';
import Medium from '../../common/model/Medium.js';
import MediumColorFactory from '../../common/model/MediumColorFactory.js';
import Substance from '../../common/model/Substance.js';
import BendingLightCircle from './BendingLightCircle.js';
import ColoredRay from './ColoredRay.js';
import Polygon from './Polygon.js';
import Prism from './Prism.js';
import SemiCircle from './SemiCircle.js';
import ColorModeEnum from '../../common/model/ColorModeEnum.js';
import Multilink from '../../../../axon/js/Multilink.js';

// constants
const WAVELENGTH_RED = BendingLightConstants.WAVELENGTH_RED;
const CHARACTERISTIC_LENGTH = WAVELENGTH_RED;
class PrismsModel extends BendingLightModel {
  constructor(providedOptions) {
    super(Math.PI, false, 1E-16, providedOptions.tandem);
    this.prisms = createObservableArray(); // (read-only)

    // (read-only) - List of intersections, which can be shown graphically
    this.intersections = createObservableArray();
    this.mediumColorFactory = new MediumColorFactory();

    // Show multiple beams to help show how lenses work
    this.manyRaysProperty = new Property(1);

    // If false, will hide non TIR reflections
    this.showReflectionsProperty = new BooleanProperty(false);
    this.showNormalsProperty = new BooleanProperty(false);
    this.showProtractorProperty = new BooleanProperty(false);

    // Environment the laser is in
    this.environmentMediumProperty = new Property(new Medium(Shape.rect(-1, 0, 2, 1), Substance.AIR, this.mediumColorFactory.getColor(Substance.AIR.indexOfRefractionForRedLight)), {
      hasListenerOrderDependencies: true,
      // TODO: https://github.com/phetsims/bending-light/issues/414

      // See https://github.com/phetsims/bending-light/issues/378
      reentrant: true
    });

    // Material that comprises the prisms
    this.prismMediumProperty = new Property(new Medium(Shape.rect(-1, -1, 2, 1), Substance.GLASS, this.mediumColorFactory.getColor(Substance.GLASS.indexOfRefractionForRedLight)), {
      hasListenerOrderDependencies: true,
      // TODO: https://github.com/phetsims/bending-light/issues/414

      // See https://github.com/phetsims/bending-light/issues/378
      reentrant: true
    });
    this.intersectionStrokeProperty = new Property('black');
    this.laser.colorModeProperty.link(colorMode => {
      this.intersectionStrokeProperty.value = colorMode === ColorModeEnum.WHITE ? 'white' : 'black';
    });
    Multilink.multilink([this.manyRaysProperty, this.environmentMediumProperty, this.showReflectionsProperty, this.prismMediumProperty, this.laser.onProperty, this.laser.pivotProperty, this.laser.emissionPointProperty, this.showNormalsProperty, this.laser.colorModeProperty, this.laser.colorProperty, this.laserViewProperty], () => {
      this.clear();
      this.updateModel();
      this.dirty = true;
    });

    // coalesce repeat updates so work is not duplicated in white light node.
    this.dirty = true;
    this.rotationArrowAngleOffset = 0;
  }
  reset() {
    super.reset();
    this.prisms.clear();
    this.manyRaysProperty.reset();
    this.environmentMediumProperty.reset();
    this.prismMediumProperty.reset();
    this.showReflectionsProperty.reset();
    this.showNormalsProperty.reset();
    this.showProtractorProperty.reset();
  }

  /**
   * List of prism prototypes that can be created in the sim
   */
  getPrismPrototypes() {
    const prismsTypes = [];

    // characteristic length scale
    const a = CHARACTERISTIC_LENGTH * 10;

    // triangle, attach at bottom right
    prismsTypes.push(new Prism(new Polygon(1, [new Vector2(-a / 2, -a / (2 * Math.sqrt(3))), new Vector2(a / 2, -a / (2 * Math.sqrt(3))), new Vector2(0, a / Math.sqrt(3))], 0), 'triangle'));

    // trapezoid, attach at bottom right
    prismsTypes.push(new Prism(new Polygon(1, [new Vector2(-a / 2, -a * Math.sqrt(3) / 4), new Vector2(a / 2, -a * Math.sqrt(3) / 4), new Vector2(a / 4, a * Math.sqrt(3) / 4), new Vector2(-a / 4, a * Math.sqrt(3) / 4)], 0), 'trapezoid'));

    // attach at bottom right
    prismsTypes.push(new Prism(new Polygon(2, [new Vector2(-a / 2, a / 2), new Vector2(a / 2, a / 2), new Vector2(a / 2, -a / 2), new Vector2(-a / 2, -a / 2)], 0), 'square'));
    const radius = a / 2;

    // Continuous Circle
    prismsTypes.push(new Prism(new BendingLightCircle(new Vector2(0, 0), radius), 'circle'));

    // SemiCircle
    prismsTypes.push(new Prism(new SemiCircle(1, [new Vector2(0, radius), new Vector2(0, -radius)], radius), 'semicircle'));

    // DivergingLens
    prismsTypes.push(new Prism(new Polygon(2, [new Vector2(-0.6 * radius, radius), new Vector2(0.6 * radius, radius), new Vector2(0.6 * radius, -radius), new Vector2(-0.6 * radius, -radius)], radius), 'diverging-lens'));
    return prismsTypes;
  }

  /**
   * Adds a prism to the model.
   */
  addPrism(prism) {
    this.prisms.add(prism);
  }

  /**
   * Removes a prism from the model
   */
  removePrism(prism) {
    this.prisms.remove(prism);
    this.updateModel();
  }

  /**
   * Determines whether white light or single color light
   * @param ray - tail and direction for light
   * @param power - amount of power this light has
   * @param laserInPrism - specifies whether laser in prism
   */
  propagate(ray, power, laserInPrism) {
    // Determines whether to use white light or single color light
    let mediumIndexOfRefraction;
    if (this.laser.colorModeProperty.value === ColorModeEnum.WHITE) {
      // This number is the number of (equally spaced wavelength) rays to show in a white beam. More rays looks
      // better but is more computationally intensive.
      const wavelengths = BendingLightConstants.WHITE_LIGHT_WAVELENGTHS;
      for (let i = 0; i < wavelengths.length; i++) {
        const wavelength = wavelengths[i] / 1E9; // convert to meters
        mediumIndexOfRefraction = laserInPrism ? this.prismMediumProperty.value.getIndexOfRefraction(wavelength) : this.environmentMediumProperty.value.getIndexOfRefraction(wavelength);

        // show the intersection for the smallest and largest wavelengths.  Protect against floating point error for
        // the latter
        const showIntersection = i === 0 || i === wavelengths.length - 1;
        this.propagateTheRay(new ColoredRay(ray, power, wavelength, mediumIndexOfRefraction, BendingLightConstants.SPEED_OF_LIGHT / wavelength), 0, showIntersection);
      }
    } else {
      mediumIndexOfRefraction = laserInPrism ? this.prismMediumProperty.value.getIndexOfRefraction(this.laser.getWavelength()) : this.environmentMediumProperty.value.getIndexOfRefraction(this.laser.getWavelength());
      this.propagateTheRay(new ColoredRay(ray, power, this.laser.getWavelength(), mediumIndexOfRefraction, this.laser.getFrequency()), 0, true);
    }
  }

  /**
   * Algorithm that computes the trajectories of the rays throughout the system
   */
  propagateRays() {
    if (this.laser.onProperty.value) {
      const tail = this.laser.emissionPointProperty.value;
      const laserInPrism = this.isLaserInPrism();
      const directionUnitVector = this.laser.getDirectionUnitVector();
      if (this.manyRaysProperty.value === 1) {
        // This can be used to show the main central ray
        this.propagate(new Ray2(tail, directionUnitVector), 1.0, laserInPrism);
      } else {
        // Many parallel rays
        for (let x = -WAVELENGTH_RED; x <= WAVELENGTH_RED * 1.1; x += WAVELENGTH_RED / 2) {
          const offset = directionUnitVector.rotated(Math.PI / 2).multiplyScalar(x);
          this.propagate(new Ray2(offset.add(tail), directionUnitVector), 1.0, laserInPrism);
        }
      }
    }
  }

  /**
   * Determine if the laser beam originates within a prism for purpose of determining what index of refraction to use
   * initially
   */
  isLaserInPrism() {
    const emissionPoint = this.laser.emissionPointProperty.value;
    for (let i = 0; i < this.prisms.length; i++) {
      if (this.prisms[i].contains(emissionPoint)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Recursive algorithm to compute the pattern of rays in the system. This is the main computation of this model,
   * rays are cleared beforehand and this algorithm adds them as it goes
   * @param incidentRay - model of the ray
   * @param count - number of rays
   * @param showIntersection - true if the intersection should be shown.  True for single rays and for
   *                                     extrema of white light wavelengths
   */
  propagateTheRay(incidentRay, count, showIntersection) {
    let rayColor;
    let rayVisibleColor;
    const waveWidth = CHARACTERISTIC_LENGTH * 5;

    // Termination condition: we have reached too many iterations or if the ray is very weak
    if (count > 50 || incidentRay.power < 0.001) {
      return;
    }

    // Check for an intersection
    const intersection = this.getIntersection(incidentRay, this.prisms);
    const L = incidentRay.directionUnitVector;
    const n1 = incidentRay.mediumIndexOfRefraction;
    const wavelengthInN1 = incidentRay.wavelength / n1;
    if (intersection !== null) {
      // List the intersection in the model
      if (showIntersection) {
        this.intersections.add(intersection);
      }
      const pointOnOtherSide = incidentRay.directionUnitVector.times(1E-12).add(intersection.point);
      let outputInsidePrism = false;
      const lightRayAfterIntersectionInRay2Form = new Ray2(pointOnOtherSide, incidentRay.directionUnitVector);
      this.prisms.forEach(prism => {
        const intersection = prism.getTranslatedShape().shape.intersection(lightRayAfterIntersectionInRay2Form);
        if (intersection.length % 2 === 1) {
          outputInsidePrism = true;
        }
      });

      // Index of refraction of the other medium
      const n2 = outputInsidePrism ? this.prismMediumProperty.value.getIndexOfRefraction(incidentRay.getBaseWavelength()) : this.environmentMediumProperty.value.getIndexOfRefraction(incidentRay.getBaseWavelength());

      // Precompute for readability
      const point = intersection.point;
      const n = intersection.unitNormal;

      // Compute the output rays, see http://en.wikipedia.org/wiki/Snell's_law#Vector_form
      const cosTheta1 = n.dotXY(L.x * -1, L.y * -1);
      const cosTheta2Radicand = 1 - Math.pow(n1 / n2, 2) * (1 - Math.pow(cosTheta1, 2));
      const totalInternalReflection = cosTheta2Radicand < 0;
      const cosTheta2 = Math.sqrt(Math.abs(cosTheta2Radicand));
      const vReflect = n.times(2 * cosTheta1).add(L);
      let vRefract = cosTheta1 > 0 ? L.times(n1 / n2).addXY(n.x * (n1 / n2 * cosTheta1 - cosTheta2), n.y * (n1 / n2 * cosTheta1 - cosTheta2)) : L.times(n1 / n2).addXY(n.x * (n1 / n2 * cosTheta1 + cosTheta2), n.y * (n1 / n2 * cosTheta1 + cosTheta2));

      // Normalize the direction vector, see https://github.com/phetsims/bending-light/issues/226
      vRefract = vRefract.normalized();
      const reflectedPower = totalInternalReflection ? 1 : Utils.clamp(BendingLightModel.getReflectedPower(n1, n2, cosTheta1, cosTheta2), 0, 1);
      const transmittedPower = totalInternalReflection ? 0 : Utils.clamp(BendingLightModel.getTransmittedPower(n1, n2, cosTheta1, cosTheta2), 0, 1);

      // Create the new rays and propagate them recursively
      const reflectedRay = new Ray2(incidentRay.directionUnitVector.times(-1E-12).add(point), vReflect);
      const reflected = new ColoredRay(reflectedRay, incidentRay.power * reflectedPower, incidentRay.wavelength, incidentRay.mediumIndexOfRefraction, incidentRay.frequency);
      const refractedRay = new Ray2(incidentRay.directionUnitVector.times(+1E-12).add(point), vRefract);
      const refracted = new ColoredRay(refractedRay, incidentRay.power * transmittedPower, incidentRay.wavelength, n2, incidentRay.frequency);
      if (this.showReflectionsProperty.value || totalInternalReflection) {
        this.propagateTheRay(reflected, count + 1, showIntersection);
      }
      this.propagateTheRay(refracted, count + 1, showIntersection);
      rayColor = new Color(0, 0, 0, 0);
      rayVisibleColor = VisibleColor.wavelengthToColor(incidentRay.wavelength * 1E9);
      rayColor.set(rayVisibleColor.getRed(), rayVisibleColor.getGreen(), rayVisibleColor.getBlue(), rayVisibleColor.getAlpha());

      // Add the incident ray itself
      this.addRay(new LightRay(CHARACTERISTIC_LENGTH / 2, incidentRay.tail, intersection.point, n1, wavelengthInN1, incidentRay.wavelength * 1E9, incidentRay.power, rayColor, waveWidth, 0, true, false, this.laserViewProperty.value, 'prism'));
    } else {
      rayColor = new Color(0, 0, 0, 0);
      rayVisibleColor = VisibleColor.wavelengthToColor(incidentRay.wavelength * 1E9);
      rayColor.set(rayVisibleColor.getRed(), rayVisibleColor.getGreen(), rayVisibleColor.getBlue(), rayVisibleColor.getAlpha());

      // No intersection, so the light ray should just keep going
      this.addRay(new LightRay(CHARACTERISTIC_LENGTH / 2, incidentRay.tail,
      // If the light ray gets too long, it will cause rendering artifacts like #219
      incidentRay.tail.plus(incidentRay.directionUnitVector.times(2E-4)), n1, wavelengthInN1, incidentRay.wavelength * 1E9, incidentRay.power, rayColor, waveWidth, 0, true, false, this.laserViewProperty.value, 'prism'));
    }
  }

  /**
   * Find the nearest intersection between a light ray and the set of prisms in the play area
   * @param incidentRay - model of the ray
   * @param prisms
   * @returns - returns the intersection if one was found or null if no intersections
   */
  getIntersection(incidentRay, prisms) {
    let allIntersections = [];
    prisms.forEach(prism => {
      prism.getIntersections(incidentRay).forEach(intersection => allIntersections.push(intersection));
    });

    // Get the closest one (which would be hit first)
    allIntersections = _.sortBy(allIntersections, allIntersection => allIntersection.point.distance(incidentRay.tail));
    return allIntersections.length === 0 ? null : allIntersections[0];
  }

  /**
   */
  clear() {
    this.intersections.clear();
  }
}
bendingLight.register('PrismsModel', PrismsModel);
export default PrismsModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJQcm9wZXJ0eSIsIlJheTIiLCJVdGlscyIsIlZlY3RvcjIiLCJTaGFwZSIsIlZpc2libGVDb2xvciIsIkNvbG9yIiwiYmVuZGluZ0xpZ2h0IiwiQmVuZGluZ0xpZ2h0Q29uc3RhbnRzIiwiQmVuZGluZ0xpZ2h0TW9kZWwiLCJMaWdodFJheSIsIk1lZGl1bSIsIk1lZGl1bUNvbG9yRmFjdG9yeSIsIlN1YnN0YW5jZSIsIkJlbmRpbmdMaWdodENpcmNsZSIsIkNvbG9yZWRSYXkiLCJQb2x5Z29uIiwiUHJpc20iLCJTZW1pQ2lyY2xlIiwiQ29sb3JNb2RlRW51bSIsIk11bHRpbGluayIsIldBVkVMRU5HVEhfUkVEIiwiQ0hBUkFDVEVSSVNUSUNfTEVOR1RIIiwiUHJpc21zTW9kZWwiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIk1hdGgiLCJQSSIsInRhbmRlbSIsInByaXNtcyIsImludGVyc2VjdGlvbnMiLCJtZWRpdW1Db2xvckZhY3RvcnkiLCJtYW55UmF5c1Byb3BlcnR5Iiwic2hvd1JlZmxlY3Rpb25zUHJvcGVydHkiLCJzaG93Tm9ybWFsc1Byb3BlcnR5Iiwic2hvd1Byb3RyYWN0b3JQcm9wZXJ0eSIsImVudmlyb25tZW50TWVkaXVtUHJvcGVydHkiLCJyZWN0IiwiQUlSIiwiZ2V0Q29sb3IiLCJpbmRleE9mUmVmcmFjdGlvbkZvclJlZExpZ2h0IiwiaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llcyIsInJlZW50cmFudCIsInByaXNtTWVkaXVtUHJvcGVydHkiLCJHTEFTUyIsImludGVyc2VjdGlvblN0cm9rZVByb3BlcnR5IiwibGFzZXIiLCJjb2xvck1vZGVQcm9wZXJ0eSIsImxpbmsiLCJjb2xvck1vZGUiLCJ2YWx1ZSIsIldISVRFIiwibXVsdGlsaW5rIiwib25Qcm9wZXJ0eSIsInBpdm90UHJvcGVydHkiLCJlbWlzc2lvblBvaW50UHJvcGVydHkiLCJjb2xvclByb3BlcnR5IiwibGFzZXJWaWV3UHJvcGVydHkiLCJjbGVhciIsInVwZGF0ZU1vZGVsIiwiZGlydHkiLCJyb3RhdGlvbkFycm93QW5nbGVPZmZzZXQiLCJyZXNldCIsImdldFByaXNtUHJvdG90eXBlcyIsInByaXNtc1R5cGVzIiwiYSIsInB1c2giLCJzcXJ0IiwicmFkaXVzIiwiYWRkUHJpc20iLCJwcmlzbSIsImFkZCIsInJlbW92ZVByaXNtIiwicmVtb3ZlIiwicHJvcGFnYXRlIiwicmF5IiwicG93ZXIiLCJsYXNlckluUHJpc20iLCJtZWRpdW1JbmRleE9mUmVmcmFjdGlvbiIsIndhdmVsZW5ndGhzIiwiV0hJVEVfTElHSFRfV0FWRUxFTkdUSFMiLCJpIiwibGVuZ3RoIiwid2F2ZWxlbmd0aCIsImdldEluZGV4T2ZSZWZyYWN0aW9uIiwic2hvd0ludGVyc2VjdGlvbiIsInByb3BhZ2F0ZVRoZVJheSIsIlNQRUVEX09GX0xJR0hUIiwiZ2V0V2F2ZWxlbmd0aCIsImdldEZyZXF1ZW5jeSIsInByb3BhZ2F0ZVJheXMiLCJ0YWlsIiwiaXNMYXNlckluUHJpc20iLCJkaXJlY3Rpb25Vbml0VmVjdG9yIiwiZ2V0RGlyZWN0aW9uVW5pdFZlY3RvciIsIngiLCJvZmZzZXQiLCJyb3RhdGVkIiwibXVsdGlwbHlTY2FsYXIiLCJlbWlzc2lvblBvaW50IiwiY29udGFpbnMiLCJpbmNpZGVudFJheSIsImNvdW50IiwicmF5Q29sb3IiLCJyYXlWaXNpYmxlQ29sb3IiLCJ3YXZlV2lkdGgiLCJpbnRlcnNlY3Rpb24iLCJnZXRJbnRlcnNlY3Rpb24iLCJMIiwibjEiLCJ3YXZlbGVuZ3RoSW5OMSIsInBvaW50T25PdGhlclNpZGUiLCJ0aW1lcyIsInBvaW50Iiwib3V0cHV0SW5zaWRlUHJpc20iLCJsaWdodFJheUFmdGVySW50ZXJzZWN0aW9uSW5SYXkyRm9ybSIsImZvckVhY2giLCJnZXRUcmFuc2xhdGVkU2hhcGUiLCJzaGFwZSIsIm4yIiwiZ2V0QmFzZVdhdmVsZW5ndGgiLCJuIiwidW5pdE5vcm1hbCIsImNvc1RoZXRhMSIsImRvdFhZIiwieSIsImNvc1RoZXRhMlJhZGljYW5kIiwicG93IiwidG90YWxJbnRlcm5hbFJlZmxlY3Rpb24iLCJjb3NUaGV0YTIiLCJhYnMiLCJ2UmVmbGVjdCIsInZSZWZyYWN0IiwiYWRkWFkiLCJub3JtYWxpemVkIiwicmVmbGVjdGVkUG93ZXIiLCJjbGFtcCIsImdldFJlZmxlY3RlZFBvd2VyIiwidHJhbnNtaXR0ZWRQb3dlciIsImdldFRyYW5zbWl0dGVkUG93ZXIiLCJyZWZsZWN0ZWRSYXkiLCJyZWZsZWN0ZWQiLCJmcmVxdWVuY3kiLCJyZWZyYWN0ZWRSYXkiLCJyZWZyYWN0ZWQiLCJ3YXZlbGVuZ3RoVG9Db2xvciIsInNldCIsImdldFJlZCIsImdldEdyZWVuIiwiZ2V0Qmx1ZSIsImdldEFscGhhIiwiYWRkUmF5IiwicGx1cyIsImFsbEludGVyc2VjdGlvbnMiLCJnZXRJbnRlcnNlY3Rpb25zIiwiXyIsInNvcnRCeSIsImFsbEludGVyc2VjdGlvbiIsImRpc3RhbmNlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQcmlzbXNNb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBmb3IgdGhlIFwicHJpc21zXCIgc2NyZWVuLCBpbiB3aGljaCB0aGUgdXNlciBjYW4gbW92ZSB0aGUgbGFzZXIgYW5kIG1hbnkgcHJpc21zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENoYW5kcmFzaGVrYXIgQmVtYWdvbmkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IGNyZWF0ZU9ic2VydmFibGVBcnJheSwgeyBPYnNlcnZhYmxlQXJyYXkgfSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL2NyZWF0ZU9ic2VydmFibGVBcnJheS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFJheTIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JheTIuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBWaXNpYmxlQ29sb3IgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1Zpc2libGVDb2xvci5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBiZW5kaW5nTGlnaHQgZnJvbSAnLi4vLi4vYmVuZGluZ0xpZ2h0LmpzJztcclxuaW1wb3J0IEJlbmRpbmdMaWdodENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQmVuZGluZ0xpZ2h0Q29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEJlbmRpbmdMaWdodE1vZGVsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9CZW5kaW5nTGlnaHRNb2RlbC5qcyc7XHJcbmltcG9ydCBMaWdodFJheSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvTGlnaHRSYXkuanMnO1xyXG5pbXBvcnQgTWVkaXVtIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9NZWRpdW0uanMnO1xyXG5pbXBvcnQgTWVkaXVtQ29sb3JGYWN0b3J5IGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9NZWRpdW1Db2xvckZhY3RvcnkuanMnO1xyXG5pbXBvcnQgU3Vic3RhbmNlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9TdWJzdGFuY2UuanMnO1xyXG5pbXBvcnQgQmVuZGluZ0xpZ2h0Q2lyY2xlIGZyb20gJy4vQmVuZGluZ0xpZ2h0Q2lyY2xlLmpzJztcclxuaW1wb3J0IENvbG9yZWRSYXkgZnJvbSAnLi9Db2xvcmVkUmF5LmpzJztcclxuaW1wb3J0IEludGVyc2VjdGlvbiBmcm9tICcuL0ludGVyc2VjdGlvbi5qcyc7XHJcbmltcG9ydCBQb2x5Z29uIGZyb20gJy4vUG9seWdvbi5qcyc7XHJcbmltcG9ydCBQcmlzbSBmcm9tICcuL1ByaXNtLmpzJztcclxuaW1wb3J0IFNlbWlDaXJjbGUgZnJvbSAnLi9TZW1pQ2lyY2xlLmpzJztcclxuaW1wb3J0IENvbG9yTW9kZUVudW0gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0NvbG9yTW9kZUVudW0uanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBXQVZFTEVOR1RIX1JFRCA9IEJlbmRpbmdMaWdodENvbnN0YW50cy5XQVZFTEVOR1RIX1JFRDtcclxuY29uc3QgQ0hBUkFDVEVSSVNUSUNfTEVOR1RIID0gV0FWRUxFTkdUSF9SRUQ7XHJcblxyXG5jbGFzcyBQcmlzbXNNb2RlbCBleHRlbmRzIEJlbmRpbmdMaWdodE1vZGVsIHtcclxuICBwdWJsaWMgcmVhZG9ubHkgcHJpc21zOiBPYnNlcnZhYmxlQXJyYXk8UHJpc20+O1xyXG4gIHB1YmxpYyByZWFkb25seSBpbnRlcnNlY3Rpb25zOiBPYnNlcnZhYmxlQXJyYXk8SW50ZXJzZWN0aW9uPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgbWFueVJheXNQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgc2hvd1JlZmxlY3Rpb25zUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyByZWFkb25seSBzaG93Tm9ybWFsc1Byb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgc2hvd1Byb3RyYWN0b3JQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgcHVibGljIHJlYWRvbmx5IGVudmlyb25tZW50TWVkaXVtUHJvcGVydHk6IFByb3BlcnR5PE1lZGl1bT47XHJcbiAgcHVibGljIHJlYWRvbmx5IHByaXNtTWVkaXVtUHJvcGVydHk6IFByb3BlcnR5PE1lZGl1bT47XHJcbiAgcHVibGljIHJlYWRvbmx5IGludGVyc2VjdGlvblN0cm9rZVByb3BlcnR5OiBQcm9wZXJ0eTxzdHJpbmc+O1xyXG4gIHB1YmxpYyBkaXJ0eTogYm9vbGVhbjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBzdXBlciggTWF0aC5QSSwgZmFsc2UsIDFFLTE2LCBwcm92aWRlZE9wdGlvbnMhLnRhbmRlbSEgKTtcclxuXHJcbiAgICB0aGlzLnByaXNtcyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpOyAvLyAocmVhZC1vbmx5KVxyXG5cclxuICAgIC8vIChyZWFkLW9ubHkpIC0gTGlzdCBvZiBpbnRlcnNlY3Rpb25zLCB3aGljaCBjYW4gYmUgc2hvd24gZ3JhcGhpY2FsbHlcclxuICAgIHRoaXMuaW50ZXJzZWN0aW9ucyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG5cclxuICAgIHRoaXMubWVkaXVtQ29sb3JGYWN0b3J5ID0gbmV3IE1lZGl1bUNvbG9yRmFjdG9yeSgpO1xyXG5cclxuICAgIC8vIFNob3cgbXVsdGlwbGUgYmVhbXMgdG8gaGVscCBzaG93IGhvdyBsZW5zZXMgd29ya1xyXG4gICAgdGhpcy5tYW55UmF5c1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAxICk7XHJcblxyXG4gICAgLy8gSWYgZmFsc2UsIHdpbGwgaGlkZSBub24gVElSIHJlZmxlY3Rpb25zXHJcbiAgICB0aGlzLnNob3dSZWZsZWN0aW9uc1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuICAgIHRoaXMuc2hvd05vcm1hbHNQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgICB0aGlzLnNob3dQcm90cmFjdG9yUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEVudmlyb25tZW50IHRoZSBsYXNlciBpcyBpblxyXG4gICAgdGhpcy5lbnZpcm9ubWVudE1lZGl1bVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBuZXcgTWVkaXVtKCBTaGFwZS5yZWN0KCAtMSwgMCwgMiwgMSApLCBTdWJzdGFuY2UuQUlSLCB0aGlzLm1lZGl1bUNvbG9yRmFjdG9yeS5nZXRDb2xvciggU3Vic3RhbmNlLkFJUi5pbmRleE9mUmVmcmFjdGlvbkZvclJlZExpZ2h0ICkgKSwge1xyXG4gICAgICBoYXNMaXN0ZW5lck9yZGVyRGVwZW5kZW5jaWVzOiB0cnVlLCAvLyBUT0RPOiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYmVuZGluZy1saWdodC9pc3N1ZXMvNDE0XHJcblxyXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2JlbmRpbmctbGlnaHQvaXNzdWVzLzM3OFxyXG4gICAgICByZWVudHJhbnQ6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBNYXRlcmlhbCB0aGF0IGNvbXByaXNlcyB0aGUgcHJpc21zXHJcbiAgICB0aGlzLnByaXNtTWVkaXVtUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG5ldyBNZWRpdW0oIFNoYXBlLnJlY3QoIC0xLCAtMSwgMiwgMSApLCBTdWJzdGFuY2UuR0xBU1MsIHRoaXMubWVkaXVtQ29sb3JGYWN0b3J5LmdldENvbG9yKCBTdWJzdGFuY2UuR0xBU1MuaW5kZXhPZlJlZnJhY3Rpb25Gb3JSZWRMaWdodCApICksIHtcclxuICAgICAgaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llczogdHJ1ZSwgLy8gVE9ETzogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2JlbmRpbmctbGlnaHQvaXNzdWVzLzQxNFxyXG5cclxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9iZW5kaW5nLWxpZ2h0L2lzc3Vlcy8zNzhcclxuICAgICAgcmVlbnRyYW50OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5pbnRlcnNlY3Rpb25TdHJva2VQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggJ2JsYWNrJyApO1xyXG4gICAgdGhpcy5sYXNlci5jb2xvck1vZGVQcm9wZXJ0eS5saW5rKCBjb2xvck1vZGUgPT4ge1xyXG4gICAgICB0aGlzLmludGVyc2VjdGlvblN0cm9rZVByb3BlcnR5LnZhbHVlID0gY29sb3JNb2RlID09PSBDb2xvck1vZGVFbnVtLldISVRFID8gJ3doaXRlJyA6ICdibGFjayc7XHJcbiAgICB9ICk7XHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbXHJcbiAgICAgIHRoaXMubWFueVJheXNQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5lbnZpcm9ubWVudE1lZGl1bVByb3BlcnR5LFxyXG4gICAgICB0aGlzLnNob3dSZWZsZWN0aW9uc1Byb3BlcnR5LFxyXG4gICAgICB0aGlzLnByaXNtTWVkaXVtUHJvcGVydHksXHJcbiAgICAgIHRoaXMubGFzZXIub25Qcm9wZXJ0eSxcclxuICAgICAgdGhpcy5sYXNlci5waXZvdFByb3BlcnR5LFxyXG4gICAgICB0aGlzLmxhc2VyLmVtaXNzaW9uUG9pbnRQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5zaG93Tm9ybWFsc1Byb3BlcnR5LFxyXG4gICAgICB0aGlzLmxhc2VyLmNvbG9yTW9kZVByb3BlcnR5LFxyXG4gICAgICB0aGlzLmxhc2VyLmNvbG9yUHJvcGVydHksXHJcbiAgICAgIHRoaXMubGFzZXJWaWV3UHJvcGVydHlcclxuICAgIF0sICgpID0+IHtcclxuICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgICB0aGlzLnVwZGF0ZU1vZGVsKCk7XHJcbiAgICAgIHRoaXMuZGlydHkgPSB0cnVlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGNvYWxlc2NlIHJlcGVhdCB1cGRhdGVzIHNvIHdvcmsgaXMgbm90IGR1cGxpY2F0ZWQgaW4gd2hpdGUgbGlnaHQgbm9kZS5cclxuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xyXG5cclxuICAgIHRoaXMucm90YXRpb25BcnJvd0FuZ2xlT2Zmc2V0ID0gMDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSByZXNldCgpOiB2b2lkIHtcclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcbiAgICB0aGlzLnByaXNtcy5jbGVhcigpO1xyXG4gICAgdGhpcy5tYW55UmF5c1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmVudmlyb25tZW50TWVkaXVtUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucHJpc21NZWRpdW1Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zaG93UmVmbGVjdGlvbnNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zaG93Tm9ybWFsc1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNob3dQcm90cmFjdG9yUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExpc3Qgb2YgcHJpc20gcHJvdG90eXBlcyB0aGF0IGNhbiBiZSBjcmVhdGVkIGluIHRoZSBzaW1cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0UHJpc21Qcm90b3R5cGVzKCk6IFByaXNtW10ge1xyXG4gICAgY29uc3QgcHJpc21zVHlwZXMgPSBbXTtcclxuXHJcbiAgICAvLyBjaGFyYWN0ZXJpc3RpYyBsZW5ndGggc2NhbGVcclxuICAgIGNvbnN0IGEgPSBDSEFSQUNURVJJU1RJQ19MRU5HVEggKiAxMDtcclxuXHJcbiAgICAvLyB0cmlhbmdsZSwgYXR0YWNoIGF0IGJvdHRvbSByaWdodFxyXG4gICAgcHJpc21zVHlwZXMucHVzaCggbmV3IFByaXNtKCBuZXcgUG9seWdvbiggMSwgW1xyXG4gICAgICBuZXcgVmVjdG9yMiggLWEgLyAyLCAtYSAvICggMiAqIE1hdGguc3FydCggMyApICkgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIGEgLyAyLCAtYSAvICggMiAqIE1hdGguc3FydCggMyApICkgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDAsIGEgLyBNYXRoLnNxcnQoIDMgKSApXHJcbiAgICBdLCAwICksICd0cmlhbmdsZScgKSApO1xyXG5cclxuICAgIC8vIHRyYXBlem9pZCwgYXR0YWNoIGF0IGJvdHRvbSByaWdodFxyXG4gICAgcHJpc21zVHlwZXMucHVzaCggbmV3IFByaXNtKCBuZXcgUG9seWdvbiggMSwgW1xyXG4gICAgICBuZXcgVmVjdG9yMiggLWEgLyAyLCAtYSAqIE1hdGguc3FydCggMyApIC8gNCApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggYSAvIDIsIC1hICogTWF0aC5zcXJ0KCAzICkgLyA0ICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCBhIC8gNCwgYSAqIE1hdGguc3FydCggMyApIC8gNCApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggLWEgLyA0LCBhICogTWF0aC5zcXJ0KCAzICkgLyA0IClcclxuICAgIF0sIDAgKSwgJ3RyYXBlem9pZCcgKSApO1xyXG5cclxuICAgIC8vIGF0dGFjaCBhdCBib3R0b20gcmlnaHRcclxuICAgIHByaXNtc1R5cGVzLnB1c2goIG5ldyBQcmlzbSggbmV3IFBvbHlnb24oIDIsIFtcclxuICAgICAgbmV3IFZlY3RvcjIoIC1hIC8gMiwgYSAvIDIgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIGEgLyAyLCBhIC8gMiApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggYSAvIDIsIC1hIC8gMiApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggLWEgLyAyLCAtYSAvIDIgKVxyXG4gICAgXSwgMCApLCAnc3F1YXJlJyApICk7XHJcblxyXG4gICAgY29uc3QgcmFkaXVzID0gYSAvIDI7XHJcblxyXG4gICAgLy8gQ29udGludW91cyBDaXJjbGVcclxuICAgIHByaXNtc1R5cGVzLnB1c2goIG5ldyBQcmlzbSggbmV3IEJlbmRpbmdMaWdodENpcmNsZSggbmV3IFZlY3RvcjIoIDAsIDAgKSwgcmFkaXVzICksICdjaXJjbGUnICkgKTtcclxuXHJcbiAgICAvLyBTZW1pQ2lyY2xlXHJcbiAgICBwcmlzbXNUeXBlcy5wdXNoKCBuZXcgUHJpc20oIG5ldyBTZW1pQ2lyY2xlKCAxLCBbXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAwLCByYWRpdXMgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDAsIC1yYWRpdXMgKVxyXG4gICAgXSwgcmFkaXVzICksICdzZW1pY2lyY2xlJyApICk7XHJcblxyXG4gICAgLy8gRGl2ZXJnaW5nTGVuc1xyXG4gICAgcHJpc21zVHlwZXMucHVzaCggbmV3IFByaXNtKCBuZXcgUG9seWdvbiggMiwgW1xyXG4gICAgICBuZXcgVmVjdG9yMiggLTAuNiAqIHJhZGl1cywgcmFkaXVzICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAwLjYgKiByYWRpdXMsIHJhZGl1cyApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMC42ICogcmFkaXVzLCAtcmFkaXVzICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAtMC42ICogcmFkaXVzLCAtcmFkaXVzIClcclxuICAgIF0sIHJhZGl1cyApLCAnZGl2ZXJnaW5nLWxlbnMnICkgKTtcclxuICAgIHJldHVybiBwcmlzbXNUeXBlcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBwcmlzbSB0byB0aGUgbW9kZWwuXHJcbiAgICovXHJcbiAgcHVibGljIGFkZFByaXNtKCBwcmlzbTogUHJpc20gKTogdm9pZCB7XHJcbiAgICB0aGlzLnByaXNtcy5hZGQoIHByaXNtICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGEgcHJpc20gZnJvbSB0aGUgbW9kZWxcclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlUHJpc20oIHByaXNtOiBQcmlzbSApOiB2b2lkIHtcclxuICAgIHRoaXMucHJpc21zLnJlbW92ZSggcHJpc20gKTtcclxuICAgIHRoaXMudXBkYXRlTW9kZWwoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciB3aGl0ZSBsaWdodCBvciBzaW5nbGUgY29sb3IgbGlnaHRcclxuICAgKiBAcGFyYW0gcmF5IC0gdGFpbCBhbmQgZGlyZWN0aW9uIGZvciBsaWdodFxyXG4gICAqIEBwYXJhbSBwb3dlciAtIGFtb3VudCBvZiBwb3dlciB0aGlzIGxpZ2h0IGhhc1xyXG4gICAqIEBwYXJhbSBsYXNlckluUHJpc20gLSBzcGVjaWZpZXMgd2hldGhlciBsYXNlciBpbiBwcmlzbVxyXG4gICAqL1xyXG4gIHByaXZhdGUgcHJvcGFnYXRlKCByYXk6IFJheTIsIHBvd2VyOiBudW1iZXIsIGxhc2VySW5QcmlzbTogYm9vbGVhbiApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBEZXRlcm1pbmVzIHdoZXRoZXIgdG8gdXNlIHdoaXRlIGxpZ2h0IG9yIHNpbmdsZSBjb2xvciBsaWdodFxyXG4gICAgbGV0IG1lZGl1bUluZGV4T2ZSZWZyYWN0aW9uO1xyXG4gICAgaWYgKCB0aGlzLmxhc2VyLmNvbG9yTW9kZVByb3BlcnR5LnZhbHVlID09PSBDb2xvck1vZGVFbnVtLldISVRFICkge1xyXG4gICAgICAvLyBUaGlzIG51bWJlciBpcyB0aGUgbnVtYmVyIG9mIChlcXVhbGx5IHNwYWNlZCB3YXZlbGVuZ3RoKSByYXlzIHRvIHNob3cgaW4gYSB3aGl0ZSBiZWFtLiBNb3JlIHJheXMgbG9va3NcclxuICAgICAgLy8gYmV0dGVyIGJ1dCBpcyBtb3JlIGNvbXB1dGF0aW9uYWxseSBpbnRlbnNpdmUuXHJcbiAgICAgIGNvbnN0IHdhdmVsZW5ndGhzID0gQmVuZGluZ0xpZ2h0Q29uc3RhbnRzLldISVRFX0xJR0hUX1dBVkVMRU5HVEhTO1xyXG5cclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgd2F2ZWxlbmd0aHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3Qgd2F2ZWxlbmd0aCA9IHdhdmVsZW5ndGhzWyBpIF0gLyAxRTk7IC8vIGNvbnZlcnQgdG8gbWV0ZXJzXHJcbiAgICAgICAgbWVkaXVtSW5kZXhPZlJlZnJhY3Rpb24gPSBsYXNlckluUHJpc20gP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmlzbU1lZGl1bVByb3BlcnR5LnZhbHVlLmdldEluZGV4T2ZSZWZyYWN0aW9uKCB3YXZlbGVuZ3RoICkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudE1lZGl1bVByb3BlcnR5LnZhbHVlLmdldEluZGV4T2ZSZWZyYWN0aW9uKCB3YXZlbGVuZ3RoICk7XHJcblxyXG4gICAgICAgIC8vIHNob3cgdGhlIGludGVyc2VjdGlvbiBmb3IgdGhlIHNtYWxsZXN0IGFuZCBsYXJnZXN0IHdhdmVsZW5ndGhzLiAgUHJvdGVjdCBhZ2FpbnN0IGZsb2F0aW5nIHBvaW50IGVycm9yIGZvclxyXG4gICAgICAgIC8vIHRoZSBsYXR0ZXJcclxuICAgICAgICBjb25zdCBzaG93SW50ZXJzZWN0aW9uID0gKCBpID09PSAwICkgfHwgKCBpID09PSB3YXZlbGVuZ3Rocy5sZW5ndGggLSAxICk7XHJcbiAgICAgICAgdGhpcy5wcm9wYWdhdGVUaGVSYXkoIG5ldyBDb2xvcmVkUmF5KCByYXksIHBvd2VyLCB3YXZlbGVuZ3RoLCBtZWRpdW1JbmRleE9mUmVmcmFjdGlvbixcclxuICAgICAgICAgIEJlbmRpbmdMaWdodENvbnN0YW50cy5TUEVFRF9PRl9MSUdIVCAvIHdhdmVsZW5ndGggKSwgMCwgc2hvd0ludGVyc2VjdGlvbiApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgbWVkaXVtSW5kZXhPZlJlZnJhY3Rpb24gPSBsYXNlckluUHJpc20gP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJpc21NZWRpdW1Qcm9wZXJ0eS52YWx1ZS5nZXRJbmRleE9mUmVmcmFjdGlvbiggdGhpcy5sYXNlci5nZXRXYXZlbGVuZ3RoKCkgKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnZpcm9ubWVudE1lZGl1bVByb3BlcnR5LnZhbHVlLmdldEluZGV4T2ZSZWZyYWN0aW9uKCB0aGlzLmxhc2VyLmdldFdhdmVsZW5ndGgoKSApO1xyXG4gICAgICB0aGlzLnByb3BhZ2F0ZVRoZVJheSggbmV3IENvbG9yZWRSYXkoIHJheSwgcG93ZXIsIHRoaXMubGFzZXIuZ2V0V2F2ZWxlbmd0aCgpLFxyXG4gICAgICAgIG1lZGl1bUluZGV4T2ZSZWZyYWN0aW9uLCB0aGlzLmxhc2VyLmdldEZyZXF1ZW5jeSgpICksIDAsIHRydWUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFsZ29yaXRobSB0aGF0IGNvbXB1dGVzIHRoZSB0cmFqZWN0b3JpZXMgb2YgdGhlIHJheXMgdGhyb3VnaG91dCB0aGUgc3lzdGVtXHJcbiAgICovXHJcbiAgcHVibGljIHByb3BhZ2F0ZVJheXMoKTogdm9pZCB7XHJcblxyXG4gICAgaWYgKCB0aGlzLmxhc2VyLm9uUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIGNvbnN0IHRhaWwgPSB0aGlzLmxhc2VyLmVtaXNzaW9uUG9pbnRQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgY29uc3QgbGFzZXJJblByaXNtID0gdGhpcy5pc0xhc2VySW5QcmlzbSgpO1xyXG4gICAgICBjb25zdCBkaXJlY3Rpb25Vbml0VmVjdG9yID0gdGhpcy5sYXNlci5nZXREaXJlY3Rpb25Vbml0VmVjdG9yKCk7XHJcbiAgICAgIGlmICggdGhpcy5tYW55UmF5c1Byb3BlcnR5LnZhbHVlID09PSAxICkge1xyXG5cclxuICAgICAgICAvLyBUaGlzIGNhbiBiZSB1c2VkIHRvIHNob3cgdGhlIG1haW4gY2VudHJhbCByYXlcclxuICAgICAgICB0aGlzLnByb3BhZ2F0ZSggbmV3IFJheTIoIHRhaWwsIGRpcmVjdGlvblVuaXRWZWN0b3IgKSwgMS4wLCBsYXNlckluUHJpc20gKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gTWFueSBwYXJhbGxlbCByYXlzXHJcbiAgICAgICAgZm9yICggbGV0IHggPSAtV0FWRUxFTkdUSF9SRUQ7IHggPD0gV0FWRUxFTkdUSF9SRUQgKiAxLjE7IHggKz0gV0FWRUxFTkdUSF9SRUQgLyAyICkge1xyXG4gICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gZGlyZWN0aW9uVW5pdFZlY3Rvci5yb3RhdGVkKCBNYXRoLlBJIC8gMiApLm11bHRpcGx5U2NhbGFyKCB4ICk7XHJcbiAgICAgICAgICB0aGlzLnByb3BhZ2F0ZSggbmV3IFJheTIoIG9mZnNldC5hZGQoIHRhaWwgKSwgZGlyZWN0aW9uVW5pdFZlY3RvciApLCAxLjAsIGxhc2VySW5QcmlzbSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lIGlmIHRoZSBsYXNlciBiZWFtIG9yaWdpbmF0ZXMgd2l0aGluIGEgcHJpc20gZm9yIHB1cnBvc2Ugb2YgZGV0ZXJtaW5pbmcgd2hhdCBpbmRleCBvZiByZWZyYWN0aW9uIHRvIHVzZVxyXG4gICAqIGluaXRpYWxseVxyXG4gICAqL1xyXG4gIHByaXZhdGUgaXNMYXNlckluUHJpc20oKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBlbWlzc2lvblBvaW50ID0gdGhpcy5sYXNlci5lbWlzc2lvblBvaW50UHJvcGVydHkudmFsdWU7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnByaXNtcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCB0aGlzLnByaXNtc1sgaSBdLmNvbnRhaW5zKCBlbWlzc2lvblBvaW50ICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlY3Vyc2l2ZSBhbGdvcml0aG0gdG8gY29tcHV0ZSB0aGUgcGF0dGVybiBvZiByYXlzIGluIHRoZSBzeXN0ZW0uIFRoaXMgaXMgdGhlIG1haW4gY29tcHV0YXRpb24gb2YgdGhpcyBtb2RlbCxcclxuICAgKiByYXlzIGFyZSBjbGVhcmVkIGJlZm9yZWhhbmQgYW5kIHRoaXMgYWxnb3JpdGhtIGFkZHMgdGhlbSBhcyBpdCBnb2VzXHJcbiAgICogQHBhcmFtIGluY2lkZW50UmF5IC0gbW9kZWwgb2YgdGhlIHJheVxyXG4gICAqIEBwYXJhbSBjb3VudCAtIG51bWJlciBvZiByYXlzXHJcbiAgICogQHBhcmFtIHNob3dJbnRlcnNlY3Rpb24gLSB0cnVlIGlmIHRoZSBpbnRlcnNlY3Rpb24gc2hvdWxkIGJlIHNob3duLiAgVHJ1ZSBmb3Igc2luZ2xlIHJheXMgYW5kIGZvclxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJlbWEgb2Ygd2hpdGUgbGlnaHQgd2F2ZWxlbmd0aHNcclxuICAgKi9cclxuICBwcml2YXRlIHByb3BhZ2F0ZVRoZVJheSggaW5jaWRlbnRSYXk6IENvbG9yZWRSYXksIGNvdW50OiBudW1iZXIsIHNob3dJbnRlcnNlY3Rpb246IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBsZXQgcmF5Q29sb3I7XHJcbiAgICBsZXQgcmF5VmlzaWJsZUNvbG9yO1xyXG4gICAgY29uc3Qgd2F2ZVdpZHRoID0gQ0hBUkFDVEVSSVNUSUNfTEVOR1RIICogNTtcclxuXHJcbiAgICAvLyBUZXJtaW5hdGlvbiBjb25kaXRpb246IHdlIGhhdmUgcmVhY2hlZCB0b28gbWFueSBpdGVyYXRpb25zIG9yIGlmIHRoZSByYXkgaXMgdmVyeSB3ZWFrXHJcbiAgICBpZiAoIGNvdW50ID4gNTAgfHwgaW5jaWRlbnRSYXkucG93ZXIgPCAwLjAwMSApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGZvciBhbiBpbnRlcnNlY3Rpb25cclxuICAgIGNvbnN0IGludGVyc2VjdGlvbiA9IHRoaXMuZ2V0SW50ZXJzZWN0aW9uKCBpbmNpZGVudFJheSwgdGhpcy5wcmlzbXMgKTtcclxuICAgIGNvbnN0IEwgPSBpbmNpZGVudFJheS5kaXJlY3Rpb25Vbml0VmVjdG9yO1xyXG4gICAgY29uc3QgbjEgPSBpbmNpZGVudFJheS5tZWRpdW1JbmRleE9mUmVmcmFjdGlvbjtcclxuICAgIGNvbnN0IHdhdmVsZW5ndGhJbk4xID0gaW5jaWRlbnRSYXkud2F2ZWxlbmd0aCAvIG4xO1xyXG4gICAgaWYgKCBpbnRlcnNlY3Rpb24gIT09IG51bGwgKSB7XHJcblxyXG4gICAgICAvLyBMaXN0IHRoZSBpbnRlcnNlY3Rpb24gaW4gdGhlIG1vZGVsXHJcbiAgICAgIGlmICggc2hvd0ludGVyc2VjdGlvbiApIHtcclxuICAgICAgICB0aGlzLmludGVyc2VjdGlvbnMuYWRkKCBpbnRlcnNlY3Rpb24gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgcG9pbnRPbk90aGVyU2lkZSA9ICggaW5jaWRlbnRSYXkuZGlyZWN0aW9uVW5pdFZlY3Rvci50aW1lcyggMUUtMTIgKSApLmFkZCggaW50ZXJzZWN0aW9uLnBvaW50ICk7XHJcbiAgICAgIGxldCBvdXRwdXRJbnNpZGVQcmlzbSA9IGZhbHNlO1xyXG4gICAgICBjb25zdCBsaWdodFJheUFmdGVySW50ZXJzZWN0aW9uSW5SYXkyRm9ybSA9IG5ldyBSYXkyKCBwb2ludE9uT3RoZXJTaWRlLCBpbmNpZGVudFJheS5kaXJlY3Rpb25Vbml0VmVjdG9yICk7XHJcbiAgICAgIHRoaXMucHJpc21zLmZvckVhY2goICggcHJpc206IFByaXNtICkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGludGVyc2VjdGlvbiA9IHByaXNtLmdldFRyYW5zbGF0ZWRTaGFwZSgpLnNoYXBlLmludGVyc2VjdGlvbiggbGlnaHRSYXlBZnRlckludGVyc2VjdGlvbkluUmF5MkZvcm0gKTtcclxuICAgICAgICBpZiAoIGludGVyc2VjdGlvbi5sZW5ndGggJSAyID09PSAxICkge1xyXG4gICAgICAgICAgb3V0cHV0SW5zaWRlUHJpc20gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gSW5kZXggb2YgcmVmcmFjdGlvbiBvZiB0aGUgb3RoZXIgbWVkaXVtXHJcbiAgICAgIGNvbnN0IG4yID0gb3V0cHV0SW5zaWRlUHJpc20gP1xyXG4gICAgICAgICAgICAgICAgIHRoaXMucHJpc21NZWRpdW1Qcm9wZXJ0eS52YWx1ZS5nZXRJbmRleE9mUmVmcmFjdGlvbiggaW5jaWRlbnRSYXkuZ2V0QmFzZVdhdmVsZW5ndGgoKSApIDpcclxuICAgICAgICAgICAgICAgICB0aGlzLmVudmlyb25tZW50TWVkaXVtUHJvcGVydHkudmFsdWUuZ2V0SW5kZXhPZlJlZnJhY3Rpb24oIGluY2lkZW50UmF5LmdldEJhc2VXYXZlbGVuZ3RoKCkgKTtcclxuXHJcbiAgICAgIC8vIFByZWNvbXB1dGUgZm9yIHJlYWRhYmlsaXR5XHJcbiAgICAgIGNvbnN0IHBvaW50ID0gaW50ZXJzZWN0aW9uLnBvaW50O1xyXG4gICAgICBjb25zdCBuID0gaW50ZXJzZWN0aW9uLnVuaXROb3JtYWw7XHJcblxyXG4gICAgICAvLyBDb21wdXRlIHRoZSBvdXRwdXQgcmF5cywgc2VlIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU25lbGwnc19sYXcjVmVjdG9yX2Zvcm1cclxuICAgICAgY29uc3QgY29zVGhldGExID0gbi5kb3RYWSggTC54ICogLTEsIEwueSAqIC0xICk7XHJcbiAgICAgIGNvbnN0IGNvc1RoZXRhMlJhZGljYW5kID0gMSAtIE1hdGgucG93KCBuMSAvIG4yLCAyICkgKiAoIDEgLSBNYXRoLnBvdyggY29zVGhldGExLCAyICkgKTtcclxuICAgICAgY29uc3QgdG90YWxJbnRlcm5hbFJlZmxlY3Rpb24gPSBjb3NUaGV0YTJSYWRpY2FuZCA8IDA7XHJcbiAgICAgIGNvbnN0IGNvc1RoZXRhMiA9IE1hdGguc3FydCggTWF0aC5hYnMoIGNvc1RoZXRhMlJhZGljYW5kICkgKTtcclxuICAgICAgY29uc3QgdlJlZmxlY3QgPSAoIG4udGltZXMoIDIgKiBjb3NUaGV0YTEgKSApLmFkZCggTCApO1xyXG4gICAgICBsZXQgdlJlZnJhY3QgPSBjb3NUaGV0YTEgPiAwID9cclxuICAgICAgICAgICAgICAgICAgICAgKCBMLnRpbWVzKCBuMSAvIG4yICkgKS5hZGRYWShcclxuICAgICAgICAgICAgICAgICAgICAgICBuLnggKiAoIG4xIC8gbjIgKiBjb3NUaGV0YTEgLSBjb3NUaGV0YTIgKSxcclxuICAgICAgICAgICAgICAgICAgICAgICBuLnkgKiAoIG4xIC8gbjIgKiBjb3NUaGV0YTEgLSBjb3NUaGV0YTIgKVxyXG4gICAgICAgICAgICAgICAgICAgICApIDpcclxuICAgICAgICAgICAgICAgICAgICAgKCBMLnRpbWVzKCBuMSAvIG4yICkgKS5hZGRYWShcclxuICAgICAgICAgICAgICAgICAgICAgICBuLnggKiAoIG4xIC8gbjIgKiBjb3NUaGV0YTEgKyBjb3NUaGV0YTIgKSxcclxuICAgICAgICAgICAgICAgICAgICAgICBuLnkgKiAoIG4xIC8gbjIgKiBjb3NUaGV0YTEgKyBjb3NUaGV0YTIgKVxyXG4gICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgLy8gTm9ybWFsaXplIHRoZSBkaXJlY3Rpb24gdmVjdG9yLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2JlbmRpbmctbGlnaHQvaXNzdWVzLzIyNlxyXG4gICAgICB2UmVmcmFjdCA9IHZSZWZyYWN0Lm5vcm1hbGl6ZWQoKTtcclxuXHJcbiAgICAgIGNvbnN0IHJlZmxlY3RlZFBvd2VyID0gdG90YWxJbnRlcm5hbFJlZmxlY3Rpb24gPyAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBVdGlscy5jbGFtcCggQmVuZGluZ0xpZ2h0TW9kZWwuZ2V0UmVmbGVjdGVkUG93ZXIoIG4xLCBuMiwgY29zVGhldGExLCBjb3NUaGV0YTIgKSwgMCwgMSApO1xyXG4gICAgICBjb25zdCB0cmFuc21pdHRlZFBvd2VyID0gdG90YWxJbnRlcm5hbFJlZmxlY3Rpb24gPyAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFV0aWxzLmNsYW1wKCBCZW5kaW5nTGlnaHRNb2RlbC5nZXRUcmFuc21pdHRlZFBvd2VyKCBuMSwgbjIsIGNvc1RoZXRhMSwgY29zVGhldGEyICksIDAsIDEgKTtcclxuXHJcbiAgICAgIC8vIENyZWF0ZSB0aGUgbmV3IHJheXMgYW5kIHByb3BhZ2F0ZSB0aGVtIHJlY3Vyc2l2ZWx5XHJcbiAgICAgIGNvbnN0IHJlZmxlY3RlZFJheSA9IG5ldyBSYXkyKCBpbmNpZGVudFJheS5kaXJlY3Rpb25Vbml0VmVjdG9yLnRpbWVzKCAtMUUtMTIgKS5hZGQoIHBvaW50ICksIHZSZWZsZWN0ICk7XHJcbiAgICAgIGNvbnN0IHJlZmxlY3RlZCA9IG5ldyBDb2xvcmVkUmF5KFxyXG4gICAgICAgIHJlZmxlY3RlZFJheSxcclxuICAgICAgICBpbmNpZGVudFJheS5wb3dlciAqIHJlZmxlY3RlZFBvd2VyLFxyXG4gICAgICAgIGluY2lkZW50UmF5LndhdmVsZW5ndGgsXHJcbiAgICAgICAgaW5jaWRlbnRSYXkubWVkaXVtSW5kZXhPZlJlZnJhY3Rpb24sXHJcbiAgICAgICAgaW5jaWRlbnRSYXkuZnJlcXVlbmN5XHJcbiAgICAgICk7XHJcbiAgICAgIGNvbnN0IHJlZnJhY3RlZFJheSA9IG5ldyBSYXkyKCBpbmNpZGVudFJheS5kaXJlY3Rpb25Vbml0VmVjdG9yLnRpbWVzKCArMUUtMTIgKS5hZGQoIHBvaW50ICksIHZSZWZyYWN0ICk7XHJcbiAgICAgIGNvbnN0IHJlZnJhY3RlZCA9IG5ldyBDb2xvcmVkUmF5KFxyXG4gICAgICAgIHJlZnJhY3RlZFJheSxcclxuICAgICAgICBpbmNpZGVudFJheS5wb3dlciAqIHRyYW5zbWl0dGVkUG93ZXIsXHJcbiAgICAgICAgaW5jaWRlbnRSYXkud2F2ZWxlbmd0aCxcclxuICAgICAgICBuMixcclxuICAgICAgICBpbmNpZGVudFJheS5mcmVxdWVuY3lcclxuICAgICAgKTtcclxuICAgICAgaWYgKCB0aGlzLnNob3dSZWZsZWN0aW9uc1Byb3BlcnR5LnZhbHVlIHx8IHRvdGFsSW50ZXJuYWxSZWZsZWN0aW9uICkge1xyXG4gICAgICAgIHRoaXMucHJvcGFnYXRlVGhlUmF5KCByZWZsZWN0ZWQsIGNvdW50ICsgMSwgc2hvd0ludGVyc2VjdGlvbiApO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucHJvcGFnYXRlVGhlUmF5KCByZWZyYWN0ZWQsIGNvdW50ICsgMSwgc2hvd0ludGVyc2VjdGlvbiApO1xyXG4gICAgICByYXlDb2xvciA9IG5ldyBDb2xvciggMCwgMCwgMCwgMCApO1xyXG4gICAgICByYXlWaXNpYmxlQ29sb3IgPSBWaXNpYmxlQ29sb3Iud2F2ZWxlbmd0aFRvQ29sb3IoIGluY2lkZW50UmF5LndhdmVsZW5ndGggKiAxRTkgKTtcclxuICAgICAgcmF5Q29sb3Iuc2V0KCByYXlWaXNpYmxlQ29sb3IuZ2V0UmVkKCksIHJheVZpc2libGVDb2xvci5nZXRHcmVlbigpLCByYXlWaXNpYmxlQ29sb3IuZ2V0Qmx1ZSgpLFxyXG4gICAgICAgIHJheVZpc2libGVDb2xvci5nZXRBbHBoYSgpICk7XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIGluY2lkZW50IHJheSBpdHNlbGZcclxuICAgICAgdGhpcy5hZGRSYXkoIG5ldyBMaWdodFJheSggQ0hBUkFDVEVSSVNUSUNfTEVOR1RIIC8gMixcclxuICAgICAgICBpbmNpZGVudFJheS50YWlsLFxyXG4gICAgICAgIGludGVyc2VjdGlvbi5wb2ludCxcclxuICAgICAgICBuMSxcclxuICAgICAgICB3YXZlbGVuZ3RoSW5OMSxcclxuICAgICAgICBpbmNpZGVudFJheS53YXZlbGVuZ3RoICogMUU5LFxyXG4gICAgICAgIGluY2lkZW50UmF5LnBvd2VyLFxyXG4gICAgICAgIHJheUNvbG9yLFxyXG4gICAgICAgIHdhdmVXaWR0aCxcclxuICAgICAgICAwLFxyXG4gICAgICAgIHRydWUsXHJcbiAgICAgICAgZmFsc2UsXHJcbiAgICAgICAgdGhpcy5sYXNlclZpZXdQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICAncHJpc20nXHJcbiAgICAgICkgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByYXlDb2xvciA9IG5ldyBDb2xvciggMCwgMCwgMCwgMCApO1xyXG4gICAgICByYXlWaXNpYmxlQ29sb3IgPSBWaXNpYmxlQ29sb3Iud2F2ZWxlbmd0aFRvQ29sb3IoIGluY2lkZW50UmF5LndhdmVsZW5ndGggKiAxRTkgKTtcclxuICAgICAgcmF5Q29sb3Iuc2V0KCByYXlWaXNpYmxlQ29sb3IuZ2V0UmVkKCksIHJheVZpc2libGVDb2xvci5nZXRHcmVlbigpLCByYXlWaXNpYmxlQ29sb3IuZ2V0Qmx1ZSgpLFxyXG4gICAgICAgIHJheVZpc2libGVDb2xvci5nZXRBbHBoYSgpICk7XHJcblxyXG4gICAgICAvLyBObyBpbnRlcnNlY3Rpb24sIHNvIHRoZSBsaWdodCByYXkgc2hvdWxkIGp1c3Qga2VlcCBnb2luZ1xyXG4gICAgICB0aGlzLmFkZFJheSggbmV3IExpZ2h0UmF5KFxyXG4gICAgICAgIENIQVJBQ1RFUklTVElDX0xFTkdUSCAvIDIsXHJcbiAgICAgICAgaW5jaWRlbnRSYXkudGFpbCxcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIGxpZ2h0IHJheSBnZXRzIHRvbyBsb25nLCBpdCB3aWxsIGNhdXNlIHJlbmRlcmluZyBhcnRpZmFjdHMgbGlrZSAjMjE5XHJcbiAgICAgICAgaW5jaWRlbnRSYXkudGFpbC5wbHVzKCBpbmNpZGVudFJheS5kaXJlY3Rpb25Vbml0VmVjdG9yLnRpbWVzKCAyRS00ICkgKSxcclxuICAgICAgICBuMSxcclxuICAgICAgICB3YXZlbGVuZ3RoSW5OMSxcclxuICAgICAgICBpbmNpZGVudFJheS53YXZlbGVuZ3RoICogMUU5LFxyXG4gICAgICAgIGluY2lkZW50UmF5LnBvd2VyLFxyXG4gICAgICAgIHJheUNvbG9yLFxyXG4gICAgICAgIHdhdmVXaWR0aCxcclxuICAgICAgICAwLFxyXG4gICAgICAgIHRydWUsXHJcbiAgICAgICAgZmFsc2UsXHJcbiAgICAgICAgdGhpcy5sYXNlclZpZXdQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICAncHJpc20nXHJcbiAgICAgICkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmQgdGhlIG5lYXJlc3QgaW50ZXJzZWN0aW9uIGJldHdlZW4gYSBsaWdodCByYXkgYW5kIHRoZSBzZXQgb2YgcHJpc21zIGluIHRoZSBwbGF5IGFyZWFcclxuICAgKiBAcGFyYW0gaW5jaWRlbnRSYXkgLSBtb2RlbCBvZiB0aGUgcmF5XHJcbiAgICogQHBhcmFtIHByaXNtc1xyXG4gICAqIEByZXR1cm5zIC0gcmV0dXJucyB0aGUgaW50ZXJzZWN0aW9uIGlmIG9uZSB3YXMgZm91bmQgb3IgbnVsbCBpZiBubyBpbnRlcnNlY3Rpb25zXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRJbnRlcnNlY3Rpb24oIGluY2lkZW50UmF5OiBDb2xvcmVkUmF5LCBwcmlzbXM6IFByaXNtW10gKTogSW50ZXJzZWN0aW9uIHwgbnVsbCB7XHJcbiAgICBsZXQgYWxsSW50ZXJzZWN0aW9uczogSW50ZXJzZWN0aW9uW10gPSBbXTtcclxuICAgIHByaXNtcy5mb3JFYWNoKCBwcmlzbSA9PiB7XHJcbiAgICAgIHByaXNtLmdldEludGVyc2VjdGlvbnMoIGluY2lkZW50UmF5ICkuZm9yRWFjaCggKCBpbnRlcnNlY3Rpb246IEludGVyc2VjdGlvbiApID0+IGFsbEludGVyc2VjdGlvbnMucHVzaCggaW50ZXJzZWN0aW9uICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBHZXQgdGhlIGNsb3Nlc3Qgb25lICh3aGljaCB3b3VsZCBiZSBoaXQgZmlyc3QpXHJcbiAgICBhbGxJbnRlcnNlY3Rpb25zID0gXy5zb3J0QnkoIGFsbEludGVyc2VjdGlvbnMsIGFsbEludGVyc2VjdGlvbiA9PiBhbGxJbnRlcnNlY3Rpb24ucG9pbnQuZGlzdGFuY2UoIGluY2lkZW50UmF5LnRhaWwgKSApO1xyXG4gICAgcmV0dXJuIGFsbEludGVyc2VjdGlvbnMubGVuZ3RoID09PSAwID8gbnVsbCA6IGFsbEludGVyc2VjdGlvbnNbIDAgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcclxuICAgIHRoaXMuaW50ZXJzZWN0aW9ucy5jbGVhcigpO1xyXG4gIH1cclxufVxyXG5cclxuYmVuZGluZ0xpZ2h0LnJlZ2lzdGVyKCAnUHJpc21zTW9kZWwnLCBQcmlzbXNNb2RlbCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUHJpc21zTW9kZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxxQkFBcUIsTUFBMkIsOENBQThDO0FBQ3JHLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsSUFBSSxNQUFNLDRCQUE0QjtBQUM3QyxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxZQUFZLE1BQU0sNkNBQTZDO0FBQ3RFLFNBQVNDLEtBQUssUUFBcUIsbUNBQW1DO0FBQ3RFLE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFDaEQsT0FBT0MscUJBQXFCLE1BQU0sdUNBQXVDO0FBQ3pFLE9BQU9DLGlCQUFpQixNQUFNLHlDQUF5QztBQUN2RSxPQUFPQyxRQUFRLE1BQU0sZ0NBQWdDO0FBQ3JELE9BQU9DLE1BQU0sTUFBTSw4QkFBOEI7QUFDakQsT0FBT0Ms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