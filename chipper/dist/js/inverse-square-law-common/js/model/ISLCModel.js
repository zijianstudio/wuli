// Copyright 2017-2023, University of Colorado Boulder

/**
 * Main model for a system of two objects that exert forces on each other.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import Multilink from '../../../axon/js/Multilink.js';
import Property from '../../../axon/js/Property.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import merge from '../../../phet-core/js/merge.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import inverseSquareLawCommon from '../inverseSquareLawCommon.js';
import ISLCObjectEnum from './ISLCObjectEnum.js';

// constants
const OBJECT_ONE = ISLCObjectEnum.OBJECT_ONE;
const OBJECT_TWO = ISLCObjectEnum.OBJECT_TWO;
class ISLCModel {
  /**
   * @param {number} forceConstant the appropriate force constant (e.g. G or k)
   * @param {ISLCObject} object1 -  the first Mass or Charge object
   * @param {ISLCObject} object2 -  the second Mass or Charge object
   * @param {Range} positionRange - in meters, position range for the objects, min is the left boundary for left object,
   *                                and the same for max/right
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(forceConstant, object1, object2, positionRange, tandem, options) {
    options = merge({
      snapObjectsToNearest: null,
      // {number|null} if defined, objects will snap to nearest value in model coordinates
      minSeparationBetweenObjects: 0.1 // in meters
    }, options);
    assert && assert(object1.positionProperty.units === object2.positionProperty.units, 'units should be the same');

    // @public (read-only)
    this.leftObjectBoundary = positionRange.min;
    this.rightObjectBoundary = positionRange.max;

    // @public {Property.<boolean>} - whether to display the force values
    this.showForceValuesProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('showForceValuesProperty'),
      phetioDocumentation: 'Whether the force values should be displayed'
    });

    // @public
    this.object1 = object1;
    this.object2 = object2;

    // set the appropriate enum reference to each object.
    object1.enum = ISLCObjectEnum.OBJECT_ONE;
    object2.enum = ISLCObjectEnum.OBJECT_TWO;

    // @public
    // {Property.<ISLCObjectEnum|null>} - needed for adjusting alerts when an object moves as a result of a radius increase
    this.pushedObjectEnumProperty = new Property(null);

    // @private
    this.snapObjectsToNearest = options.snapObjectsToNearest;
    this.minSeparationBetweenObjects = options.minSeparationBetweenObjects;
    this.forceConstant = forceConstant;

    // @public - emits an event when the model is updated by step
    this.stepEmitter = new Emitter();

    // @public {Property.<number>} - calculates the force based on changes to values and positions
    // objects are never destroyed, so forceProperty does not require disposal
    this.forceProperty = new DerivedProperty([this.object1.valueProperty,
    // see valueProperty in ISLCObject.js
    this.object2.valueProperty, this.object1.positionProperty, this.object2.positionProperty], (v1, v2, x1, x2) => this.calculateForce(v1, v2, Math.abs(x2 - x1)), {
      phetioValueType: NumberIO,
      tandem: tandem.createTandem('forceProperty'),
      units: 'N',
      phetioDocumentation: 'The force of one object on the other (in Newtons)'
    });

    // @private {Property.<number>} - The distance between the two objects. Added for PhET-iO.
    this.separationProperty = new DerivedProperty([this.object1.positionProperty, this.object2.positionProperty], (p1, p2) => Math.abs(p2 - p1), {
      phetioValueType: NumberIO,
      tandem: tandem.createTandem('separationProperty'),
      units: object1.positionProperty.units,
      phetioDocumentation: 'The distance between the two objects\' centers'
    });
    const updateRange = object => {
      const maxPosition = this.getObjectMaxPosition(object);
      const minPosition = this.getObjectMinPosition(object);
      object.enabledRangeProperty.set(new Range(minPosition, maxPosition));
    };

    // pdom - necessary to reset the enabledRangeProperty to prevent object overlap, disposal not necessary
    // We need to update the available range for each object when the either's radius or position changes.
    Multilink.multilink([object1.positionProperty, object2.positionProperty], () => {
      updateRange(object1);
      updateRange(object2);
    });

    // when sim is reset, we only reset the position properties of each object to their initial values
    // thus, there is no need to dispose of the listeners below
    this.object1.radiusProperty.link(() => {
      this.object1.radiusLastChanged = true;
      this.object2.radiusLastChanged = false;

      // update range if radius changed with "constant radius" setting (which didn't trigger other model updates)
      updateRange(object1);
      updateRange(object2);
    });
    this.object2.radiusProperty.link(() => {
      this.object2.radiusLastChanged = true;
      this.object1.radiusLastChanged = false;

      // update range if radius changed with "constant radius" setting (which didn't trigger other model updates)
      updateRange(object2);
      updateRange(object1);
    });

    // wire up logic to update the state of the pushedObjectEnumProperty
    const createPushedPositionListener = objectEnum => {
      return () => {
        // This conditional should only be hit if the mass has changed in addition to the position. Since the object's
        // valueProperty would be set in the previous frame, and then this frame's step function would update the
        // position.
        if (this.object1.valueChangedSinceLastStep || this.object2.valueChangedSinceLastStep) {
          this.pushedObjectEnumProperty.value = objectEnum;
        } else {
          this.pushedObjectEnumProperty.value = null;
        }
      };
    };

    // lazy link so we don't have a strange initial condition even though we haven't moved the pushers.
    object1.positionProperty.lazyLink(createPushedPositionListener(ISLCObjectEnum.OBJECT_ONE));
    object2.positionProperty.lazyLink(createPushedPositionListener(ISLCObjectEnum.OBJECT_TWO));

    // when the mass is lessened, there is no way that pushed an object, so set to null
    const massChangedListener = (newMass, oldMass) => {
      if (oldMass > newMass) {
        this.pushedObjectEnumProperty.value = null;
      }
    };
    object1.valueProperty.link(massChangedListener);
    object2.valueProperty.link(massChangedListener);

    // reset after step is complete.
    this.stepEmitter.addListener(() => {
      this.object1.onStepEnd();
      this.object2.onStepEnd();
    });
  }

  /**
   * Step function makes sure objects don't go out of bounds and don't overlap each other at each time step.
   *
   * @public
   */
  step() {
    const minX = this.leftObjectBoundary;
    const maxX = this.rightObjectBoundary;
    let positionObject1 = this.object1.positionProperty.get();
    let positionObject2 = this.object2.positionProperty.get();

    // bounds for the left object are the left boundary and the right edge of object 2 minus half the min separation
    const minPositionObject1 = minX;
    const maxPositionObject1 = this.getObjectMaxPosition(this.object1);

    // bounds for the right object are the right edge of object 1 plus half the separation distance and the right edge
    const minPositionObject2 = this.getObjectMinPosition(this.object2);
    const maxPositionObject2 = maxX;

    // make sure that the objects don't go beyond the boundaries
    positionObject1 = Math.max(minPositionObject1, positionObject1);
    positionObject2 = Math.min(positionObject2, maxPositionObject2);

    // make sure objects don't overlap
    positionObject1 = Math.min(positionObject1, maxPositionObject1);
    positionObject2 = Math.max(minPositionObject2, positionObject2);

    // if objects are limited to a certain precision, round position values to that precision
    positionObject1 = this.snapToGrid(positionObject1);
    positionObject2 = this.snapToGrid(positionObject2);
    if (this.object1.isDraggingProperty.get()) {
      this.object1.positionProperty.set(positionObject1);
    } else if (this.object2.isDraggingProperty.get()) {
      this.object2.positionProperty.set(positionObject2);
    } else {
      // neither object is dragging, radius must have changed
      if (this.object1.radiusLastChanged) {
        if (this.object2.positionProperty.get() < maxX) {
          // only set if it is different
          if (positionObject2 !== this.object2.positionProperty.get()) {
            // object2 is not at the edge update its position
            this.object2.positionProperty.set(positionObject2);
            this.object2.positionChangedFromSecondarySourceEmitter.emit(OBJECT_ONE);
          }
        } else {
          // only set if it is different
          if (positionObject1 !== this.object1.positionProperty.get()) {
            // object2 is at the edge update object1 position
            this.object1.positionProperty.set(positionObject1);
            this.object1.positionChangedFromSecondarySourceEmitter.emit(OBJECT_ONE);
          }
        }
      } else if (this.object2.radiusLastChanged) {
        if (this.object1.positionProperty.get() > minX) {
          // only set if it is different
          if (positionObject1 !== this.object1.positionProperty.get()) {
            // object1 is not at boundary, update position
            this.object1.positionProperty.set(positionObject1);
            this.object1.positionChangedFromSecondarySourceEmitter.emit(OBJECT_TWO);
          }
        } else {
          // only set if it is different
          if (positionObject2 !== this.object2.positionProperty.get()) {
            this.object2.positionProperty.set(positionObject2);
            this.object2.positionChangedFromSecondarySourceEmitter.emit(OBJECT_TWO);
          }
        }
      }
    }

    // broadcast a message that we have updated the model
    this.stepEmitter.emit();
  }

  /**
   * Helper function to for accessing and mapping force ranges in the inheriting sims' views
   * @public
   *
   * @returns {number} - positive number, representing the magnitude of the force vector
   */
  getMinForceMagnitude() {
    this.assertObjectsHaveSameRange();
    const maxDistance = Math.abs(this.rightObjectBoundary - this.leftObjectBoundary);

    // Since we're checking for magnitude, negative values for charges will need
    // to be set to zero.
    const minValue = this.object1.valueRange.min < 0 ? 0 : this.object1.valueRange.min;

    // ensure we always return a positive force value or zero
    return Math.abs(this.calculateForce(minValue, minValue, maxDistance));
  }

  /**
   * Get the minimum possible force. Unlike getMinForceMagnitude, this function can return a negative value.
   * @public
   * @returns {number} the smallest possible force magnitude
   */
  getMinForce() {
    this.assertObjectsHaveSameRange();
    const maxDistance = Math.abs(this.rightObjectBoundary - this.leftObjectBoundary);
    const minValue = this.object1.valueRange.min;

    // ensure we always return a positive force value or zero
    return Math.abs(this.calculateForce(minValue, minValue, maxDistance));
  }

  /**
   * Helper function to for accessing and mapping force ranges in the inheriting sims' views
   *
   * @public
   * @returns {number} the largest possible force magnitude
   */
  getMaxForce() {
    this.assertObjectsHaveSameRange();
    return Math.abs(this.calculateForce(this.object1.valueRange.max, this.object2.valueRange.max, this.snapToGrid(this.object1.constantRadius * 2 + this.minSeparationBetweenObjects)));
  }

  /**
   * Multiple functions in the model need to assume this, so these assertions are factored out.
   * @private
   */
  assertObjectsHaveSameRange() {
    assert && assert(this.object1.valueProperty.range.min === this.object2.valueProperty.range.min, 'range min should be the same');
    assert && assert(this.object1.valueProperty.range.max === this.object2.valueProperty.range.max, 'range max should be the same');
  }

  /**
   * Get the minimum possible separation between the objects' centers given a defined value for each of their
   * main properties.
   *
   * @public
   * @param  {number} value - the object's mass or charge
   * @returns {number} the distance between the objects' centers
   */
  getMinDistance(value) {
    // calculate radius for masses and charges at maximum mass/charge
    const minRadius = this.object1.calculateRadius(value);
    return 2 * minRadius + this.minSeparationBetweenObjects;
  }

  /**
   * Helper function to calculate the force within the model
   *
   * @public
   * @param  {number} v1 - the first object's mass or charge
   * @param  {number} v2 - the second object's mass or charge
   * @param  {number} distance - the distance between the objects' centers
   * @returns {number} the force between the two objects
   */
  calculateForce(v1, v2, distance) {
    assert && assert(distance > 0, 'must have non zero distance between objects');
    return this.forceConstant * v1 * v2 / (distance * distance);
  }

  /**
   * Returns the sum of the radii of the two spherical objects in this sim, plus the model's min separation between
   * the two objects.  This is used throughout the model.
   *
   * @public
   * @returns {number}
   */
  getSumRadiusWithSeparation() {
    const distanceSum = this.object1.radiusProperty.get() + this.object2.radiusProperty.get() + this.minSeparationBetweenObjects;
    return this.snapToGrid(distanceSum);
  }

  /**
   * Get the absolute maximum horizontal position for an object, relative to the object's center.
   *
   * @private
   * @param  {ISLCObject} object
   * @returns {number}
   */
  getObjectMaxPosition(object) {
    const sumRadius = this.getSumRadiusWithSeparation();
    let maxX;
    if (object === this.object1) {
      // the max value for the left object is the position of the right object minius the sum of radii
      maxX = this.object2.positionProperty.get() - sumRadius;
    } else if (object === this.object2) {
      // the max value for the right object is the right edge minus the puller width and the radius of the object
      maxX = this.rightObjectBoundary;
    }
    return this.snapToGrid(maxX);
  }

  /**
   * Get the absolute minimum horizontal position for an object.
   *
   * @private
   * @param  {ISLCObject} object
   * @returns {number}
   */
  getObjectMinPosition(object) {
    const sumRadius = this.getSumRadiusWithSeparation();
    let minX;
    if (object === this.object1) {
      // the min value for the left object is the left edge plus the puller width and the radius of the object
      minX = this.leftObjectBoundary;
    } else if (object === this.object2) {
      // min value for the right object is the position of the left object plus the sum of radii between the two
      // object plus the min distance
      minX = this.object1.positionProperty.get() + sumRadius;
    }
    return this.snapToGrid(minX);
  }

  /**
   * Get whether or not the position of a mass was most recently changed based on the other pushing it.
   * @public
   *
   * @returns {boolean}
   */
  massWasPushed() {
    return this.pushedObjectEnumProperty.value !== null;
  }

  /**
   * If this model constrains the objects to a grid, this snaps the position to the nearest spot in the grid.
   *
   * @private
   * @param  {number} position
   * @returns {number}
   */
  snapToGrid(position) {
    let snappedPosition = position;
    const numDecimalPlaces = Utils.numberOfDecimalPlaces(this.snapObjectsToNearest);
    if (this.snapObjectsToNearest) {
      snappedPosition = Utils.roundSymmetric(position / this.snapObjectsToNearest) * this.snapObjectsToNearest;
      snappedPosition = Utils.toFixedNumber(snappedPosition, numDecimalPlaces);
    }

    // now make sure that the snapped position is within the left and right boundaries for this model
    snappedPosition = Math.min(snappedPosition, this.rightObjectBoundary);
    snappedPosition = Math.max(snappedPosition, this.leftObjectBoundary);
    return snappedPosition;
  }

  // @public
  reset() {
    this.showForceValuesProperty.reset();

    // if the position of object2 is equal to object1's initial position, an error will result when we
    // reset object1's position. Thus, we need to check for that one edge case prior to reset
    if (this.object2.positionProperty.get() === this.object1.positionProperty.initialValue) {
      this.object2.reset();
      this.object1.reset();
    } else {
      this.object1.reset();
      this.object2.reset();
    }

    // This needs to be reset after the objects, see https://github.com/phetsims/gravity-force-lab-basics/issues/132
    this.pushedObjectEnumProperty.reset();
  }
}
inverseSquareLawCommon.register('ISLCModel', ISLCModel);
export default ISLCModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiTXVsdGlsaW5rIiwiUHJvcGVydHkiLCJSYW5nZSIsIlV0aWxzIiwibWVyZ2UiLCJOdW1iZXJJTyIsImludmVyc2VTcXVhcmVMYXdDb21tb24iLCJJU0xDT2JqZWN0RW51bSIsIk9CSkVDVF9PTkUiLCJPQkpFQ1RfVFdPIiwiSVNMQ01vZGVsIiwiY29uc3RydWN0b3IiLCJmb3JjZUNvbnN0YW50Iiwib2JqZWN0MSIsIm9iamVjdDIiLCJwb3NpdGlvblJhbmdlIiwidGFuZGVtIiwib3B0aW9ucyIsInNuYXBPYmplY3RzVG9OZWFyZXN0IiwibWluU2VwYXJhdGlvbkJldHdlZW5PYmplY3RzIiwiYXNzZXJ0IiwicG9zaXRpb25Qcm9wZXJ0eSIsInVuaXRzIiwibGVmdE9iamVjdEJvdW5kYXJ5IiwibWluIiwicmlnaHRPYmplY3RCb3VuZGFyeSIsIm1heCIsInNob3dGb3JjZVZhbHVlc1Byb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsImVudW0iLCJwdXNoZWRPYmplY3RFbnVtUHJvcGVydHkiLCJzdGVwRW1pdHRlciIsImZvcmNlUHJvcGVydHkiLCJ2YWx1ZVByb3BlcnR5IiwidjEiLCJ2MiIsIngxIiwieDIiLCJjYWxjdWxhdGVGb3JjZSIsIk1hdGgiLCJhYnMiLCJwaGV0aW9WYWx1ZVR5cGUiLCJzZXBhcmF0aW9uUHJvcGVydHkiLCJwMSIsInAyIiwidXBkYXRlUmFuZ2UiLCJvYmplY3QiLCJtYXhQb3NpdGlvbiIsImdldE9iamVjdE1heFBvc2l0aW9uIiwibWluUG9zaXRpb24iLCJnZXRPYmplY3RNaW5Qb3NpdGlvbiIsImVuYWJsZWRSYW5nZVByb3BlcnR5Iiwic2V0IiwibXVsdGlsaW5rIiwicmFkaXVzUHJvcGVydHkiLCJsaW5rIiwicmFkaXVzTGFzdENoYW5nZWQiLCJjcmVhdGVQdXNoZWRQb3NpdGlvbkxpc3RlbmVyIiwib2JqZWN0RW51bSIsInZhbHVlQ2hhbmdlZFNpbmNlTGFzdFN0ZXAiLCJ2YWx1ZSIsImxhenlMaW5rIiwibWFzc0NoYW5nZWRMaXN0ZW5lciIsIm5ld01hc3MiLCJvbGRNYXNzIiwiYWRkTGlzdGVuZXIiLCJvblN0ZXBFbmQiLCJzdGVwIiwibWluWCIsIm1heFgiLCJwb3NpdGlvbk9iamVjdDEiLCJnZXQiLCJwb3NpdGlvbk9iamVjdDIiLCJtaW5Qb3NpdGlvbk9iamVjdDEiLCJtYXhQb3NpdGlvbk9iamVjdDEiLCJtaW5Qb3NpdGlvbk9iamVjdDIiLCJtYXhQb3NpdGlvbk9iamVjdDIiLCJzbmFwVG9HcmlkIiwiaXNEcmFnZ2luZ1Byb3BlcnR5IiwicG9zaXRpb25DaGFuZ2VkRnJvbVNlY29uZGFyeVNvdXJjZUVtaXR0ZXIiLCJlbWl0IiwiZ2V0TWluRm9yY2VNYWduaXR1ZGUiLCJhc3NlcnRPYmplY3RzSGF2ZVNhbWVSYW5nZSIsIm1heERpc3RhbmNlIiwibWluVmFsdWUiLCJ2YWx1ZVJhbmdlIiwiZ2V0TWluRm9yY2UiLCJnZXRNYXhGb3JjZSIsImNvbnN0YW50UmFkaXVzIiwicmFuZ2UiLCJnZXRNaW5EaXN0YW5jZSIsIm1pblJhZGl1cyIsImNhbGN1bGF0ZVJhZGl1cyIsImRpc3RhbmNlIiwiZ2V0U3VtUmFkaXVzV2l0aFNlcGFyYXRpb24iLCJkaXN0YW5jZVN1bSIsInN1bVJhZGl1cyIsIm1hc3NXYXNQdXNoZWQiLCJwb3NpdGlvbiIsInNuYXBwZWRQb3NpdGlvbiIsIm51bURlY2ltYWxQbGFjZXMiLCJudW1iZXJPZkRlY2ltYWxQbGFjZXMiLCJyb3VuZFN5bW1ldHJpYyIsInRvRml4ZWROdW1iZXIiLCJyZXNldCIsImluaXRpYWxWYWx1ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSVNMQ01vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1haW4gbW9kZWwgZm9yIGEgc3lzdGVtIG9mIHR3byBvYmplY3RzIHRoYXQgZXhlcnQgZm9yY2VzIG9uIGVhY2ggb3RoZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBpbnZlcnNlU3F1YXJlTGF3Q29tbW9uIGZyb20gJy4uL2ludmVyc2VTcXVhcmVMYXdDb21tb24uanMnO1xyXG5pbXBvcnQgSVNMQ09iamVjdEVudW0gZnJvbSAnLi9JU0xDT2JqZWN0RW51bS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgT0JKRUNUX09ORSA9IElTTENPYmplY3RFbnVtLk9CSkVDVF9PTkU7XHJcbmNvbnN0IE9CSkVDVF9UV08gPSBJU0xDT2JqZWN0RW51bS5PQkpFQ1RfVFdPO1xyXG5cclxuY2xhc3MgSVNMQ01vZGVsIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGZvcmNlQ29uc3RhbnQgdGhlIGFwcHJvcHJpYXRlIGZvcmNlIGNvbnN0YW50IChlLmcuIEcgb3IgaylcclxuICAgKiBAcGFyYW0ge0lTTENPYmplY3R9IG9iamVjdDEgLSAgdGhlIGZpcnN0IE1hc3Mgb3IgQ2hhcmdlIG9iamVjdFxyXG4gICAqIEBwYXJhbSB7SVNMQ09iamVjdH0gb2JqZWN0MiAtICB0aGUgc2Vjb25kIE1hc3Mgb3IgQ2hhcmdlIG9iamVjdFxyXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHBvc2l0aW9uUmFuZ2UgLSBpbiBtZXRlcnMsIHBvc2l0aW9uIHJhbmdlIGZvciB0aGUgb2JqZWN0cywgbWluIGlzIHRoZSBsZWZ0IGJvdW5kYXJ5IGZvciBsZWZ0IG9iamVjdCxcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5kIHRoZSBzYW1lIGZvciBtYXgvcmlnaHRcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBmb3JjZUNvbnN0YW50LCBvYmplY3QxLCBvYmplY3QyLCBwb3NpdGlvblJhbmdlLCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHNuYXBPYmplY3RzVG9OZWFyZXN0OiBudWxsLCAvLyB7bnVtYmVyfG51bGx9IGlmIGRlZmluZWQsIG9iamVjdHMgd2lsbCBzbmFwIHRvIG5lYXJlc3QgdmFsdWUgaW4gbW9kZWwgY29vcmRpbmF0ZXNcclxuICAgICAgbWluU2VwYXJhdGlvbkJldHdlZW5PYmplY3RzOiAwLjEgLy8gaW4gbWV0ZXJzXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb2JqZWN0MS5wb3NpdGlvblByb3BlcnR5LnVuaXRzID09PSBvYmplY3QyLnBvc2l0aW9uUHJvcGVydHkudW5pdHMsICd1bml0cyBzaG91bGQgYmUgdGhlIHNhbWUnICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KVxyXG4gICAgdGhpcy5sZWZ0T2JqZWN0Qm91bmRhcnkgPSBwb3NpdGlvblJhbmdlLm1pbjtcclxuICAgIHRoaXMucmlnaHRPYmplY3RCb3VuZGFyeSA9IHBvc2l0aW9uUmFuZ2UubWF4O1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gLSB3aGV0aGVyIHRvIGRpc3BsYXkgdGhlIGZvcmNlIHZhbHVlc1xyXG4gICAgdGhpcy5zaG93Rm9yY2VWYWx1ZXNQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc2hvd0ZvcmNlVmFsdWVzUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdXaGV0aGVyIHRoZSBmb3JjZSB2YWx1ZXMgc2hvdWxkIGJlIGRpc3BsYXllZCdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLm9iamVjdDEgPSBvYmplY3QxO1xyXG4gICAgdGhpcy5vYmplY3QyID0gb2JqZWN0MjtcclxuXHJcbiAgICAvLyBzZXQgdGhlIGFwcHJvcHJpYXRlIGVudW0gcmVmZXJlbmNlIHRvIGVhY2ggb2JqZWN0LlxyXG4gICAgb2JqZWN0MS5lbnVtID0gSVNMQ09iamVjdEVudW0uT0JKRUNUX09ORTtcclxuICAgIG9iamVjdDIuZW51bSA9IElTTENPYmplY3RFbnVtLk9CSkVDVF9UV087XHJcblxyXG4gICAgLy8gQHB1YmxpY1xyXG4gICAgLy8ge1Byb3BlcnR5LjxJU0xDT2JqZWN0RW51bXxudWxsPn0gLSBuZWVkZWQgZm9yIGFkanVzdGluZyBhbGVydHMgd2hlbiBhbiBvYmplY3QgbW92ZXMgYXMgYSByZXN1bHQgb2YgYSByYWRpdXMgaW5jcmVhc2VcclxuICAgIHRoaXMucHVzaGVkT2JqZWN0RW51bVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBudWxsICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuc25hcE9iamVjdHNUb05lYXJlc3QgPSBvcHRpb25zLnNuYXBPYmplY3RzVG9OZWFyZXN0O1xyXG4gICAgdGhpcy5taW5TZXBhcmF0aW9uQmV0d2Vlbk9iamVjdHMgPSBvcHRpb25zLm1pblNlcGFyYXRpb25CZXR3ZWVuT2JqZWN0cztcclxuICAgIHRoaXMuZm9yY2VDb25zdGFudCA9IGZvcmNlQ29uc3RhbnQ7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIGVtaXRzIGFuIGV2ZW50IHdoZW4gdGhlIG1vZGVsIGlzIHVwZGF0ZWQgYnkgc3RlcFxyXG4gICAgdGhpcy5zdGVwRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IC0gY2FsY3VsYXRlcyB0aGUgZm9yY2UgYmFzZWQgb24gY2hhbmdlcyB0byB2YWx1ZXMgYW5kIHBvc2l0aW9uc1xyXG4gICAgLy8gb2JqZWN0cyBhcmUgbmV2ZXIgZGVzdHJveWVkLCBzbyBmb3JjZVByb3BlcnR5IGRvZXMgbm90IHJlcXVpcmUgZGlzcG9zYWxcclxuICAgIHRoaXMuZm9yY2VQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFtcclxuICAgICAgdGhpcy5vYmplY3QxLnZhbHVlUHJvcGVydHksIC8vIHNlZSB2YWx1ZVByb3BlcnR5IGluIElTTENPYmplY3QuanNcclxuICAgICAgdGhpcy5vYmplY3QyLnZhbHVlUHJvcGVydHksXHJcbiAgICAgIHRoaXMub2JqZWN0MS5wb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICB0aGlzLm9iamVjdDIucG9zaXRpb25Qcm9wZXJ0eVxyXG4gICAgXSwgKCB2MSwgdjIsIHgxLCB4MiApID0+IHRoaXMuY2FsY3VsYXRlRm9yY2UoIHYxLCB2MiwgTWF0aC5hYnMoIHgyIC0geDEgKSApLCB7XHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogTnVtYmVySU8sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZvcmNlUHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnTicsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdUaGUgZm9yY2Ugb2Ygb25lIG9iamVjdCBvbiB0aGUgb3RoZXIgKGluIE5ld3RvbnMpJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtQcm9wZXJ0eS48bnVtYmVyPn0gLSBUaGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgdHdvIG9iamVjdHMuIEFkZGVkIGZvciBQaEVULWlPLlxyXG4gICAgdGhpcy5zZXBhcmF0aW9uUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbXHJcbiAgICAgIHRoaXMub2JqZWN0MS5wb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICB0aGlzLm9iamVjdDIucG9zaXRpb25Qcm9wZXJ0eVxyXG4gICAgXSwgKCBwMSwgcDIgKSA9PiBNYXRoLmFicyggcDIgLSBwMSApLCB7XHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogTnVtYmVySU8sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NlcGFyYXRpb25Qcm9wZXJ0eScgKSxcclxuICAgICAgdW5pdHM6IG9iamVjdDEucG9zaXRpb25Qcm9wZXJ0eS51bml0cyxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSB0d28gb2JqZWN0c1xcJyBjZW50ZXJzJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHVwZGF0ZVJhbmdlID0gb2JqZWN0ID0+IHtcclxuICAgICAgY29uc3QgbWF4UG9zaXRpb24gPSB0aGlzLmdldE9iamVjdE1heFBvc2l0aW9uKCBvYmplY3QgKTtcclxuICAgICAgY29uc3QgbWluUG9zaXRpb24gPSB0aGlzLmdldE9iamVjdE1pblBvc2l0aW9uKCBvYmplY3QgKTtcclxuXHJcbiAgICAgIG9iamVjdC5lbmFibGVkUmFuZ2VQcm9wZXJ0eS5zZXQoIG5ldyBSYW5nZSggbWluUG9zaXRpb24sIG1heFBvc2l0aW9uICkgKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gcGRvbSAtIG5lY2Vzc2FyeSB0byByZXNldCB0aGUgZW5hYmxlZFJhbmdlUHJvcGVydHkgdG8gcHJldmVudCBvYmplY3Qgb3ZlcmxhcCwgZGlzcG9zYWwgbm90IG5lY2Vzc2FyeVxyXG4gICAgLy8gV2UgbmVlZCB0byB1cGRhdGUgdGhlIGF2YWlsYWJsZSByYW5nZSBmb3IgZWFjaCBvYmplY3Qgd2hlbiB0aGUgZWl0aGVyJ3MgcmFkaXVzIG9yIHBvc2l0aW9uIGNoYW5nZXMuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIG9iamVjdDEucG9zaXRpb25Qcm9wZXJ0eSwgb2JqZWN0Mi5wb3NpdGlvblByb3BlcnR5IF0sICgpID0+IHtcclxuICAgICAgdXBkYXRlUmFuZ2UoIG9iamVjdDEgKTtcclxuICAgICAgdXBkYXRlUmFuZ2UoIG9iamVjdDIgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB3aGVuIHNpbSBpcyByZXNldCwgd2Ugb25seSByZXNldCB0aGUgcG9zaXRpb24gcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCB0byB0aGVpciBpbml0aWFsIHZhbHVlc1xyXG4gICAgLy8gdGh1cywgdGhlcmUgaXMgbm8gbmVlZCB0byBkaXNwb3NlIG9mIHRoZSBsaXN0ZW5lcnMgYmVsb3dcclxuICAgIHRoaXMub2JqZWN0MS5yYWRpdXNQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMub2JqZWN0MS5yYWRpdXNMYXN0Q2hhbmdlZCA9IHRydWU7XHJcbiAgICAgIHRoaXMub2JqZWN0Mi5yYWRpdXNMYXN0Q2hhbmdlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgLy8gdXBkYXRlIHJhbmdlIGlmIHJhZGl1cyBjaGFuZ2VkIHdpdGggXCJjb25zdGFudCByYWRpdXNcIiBzZXR0aW5nICh3aGljaCBkaWRuJ3QgdHJpZ2dlciBvdGhlciBtb2RlbCB1cGRhdGVzKVxyXG4gICAgICB1cGRhdGVSYW5nZSggb2JqZWN0MSApO1xyXG4gICAgICB1cGRhdGVSYW5nZSggb2JqZWN0MiApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMub2JqZWN0Mi5yYWRpdXNQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMub2JqZWN0Mi5yYWRpdXNMYXN0Q2hhbmdlZCA9IHRydWU7XHJcbiAgICAgIHRoaXMub2JqZWN0MS5yYWRpdXNMYXN0Q2hhbmdlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgLy8gdXBkYXRlIHJhbmdlIGlmIHJhZGl1cyBjaGFuZ2VkIHdpdGggXCJjb25zdGFudCByYWRpdXNcIiBzZXR0aW5nICh3aGljaCBkaWRuJ3QgdHJpZ2dlciBvdGhlciBtb2RlbCB1cGRhdGVzKVxyXG4gICAgICB1cGRhdGVSYW5nZSggb2JqZWN0MiApO1xyXG4gICAgICB1cGRhdGVSYW5nZSggb2JqZWN0MSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHdpcmUgdXAgbG9naWMgdG8gdXBkYXRlIHRoZSBzdGF0ZSBvZiB0aGUgcHVzaGVkT2JqZWN0RW51bVByb3BlcnR5XHJcbiAgICBjb25zdCBjcmVhdGVQdXNoZWRQb3NpdGlvbkxpc3RlbmVyID0gb2JqZWN0RW51bSA9PiB7XHJcbiAgICAgIHJldHVybiAoKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIFRoaXMgY29uZGl0aW9uYWwgc2hvdWxkIG9ubHkgYmUgaGl0IGlmIHRoZSBtYXNzIGhhcyBjaGFuZ2VkIGluIGFkZGl0aW9uIHRvIHRoZSBwb3NpdGlvbi4gU2luY2UgdGhlIG9iamVjdCdzXHJcbiAgICAgICAgLy8gdmFsdWVQcm9wZXJ0eSB3b3VsZCBiZSBzZXQgaW4gdGhlIHByZXZpb3VzIGZyYW1lLCBhbmQgdGhlbiB0aGlzIGZyYW1lJ3Mgc3RlcCBmdW5jdGlvbiB3b3VsZCB1cGRhdGUgdGhlXHJcbiAgICAgICAgLy8gcG9zaXRpb24uXHJcbiAgICAgICAgaWYgKCB0aGlzLm9iamVjdDEudmFsdWVDaGFuZ2VkU2luY2VMYXN0U3RlcCB8fCB0aGlzLm9iamVjdDIudmFsdWVDaGFuZ2VkU2luY2VMYXN0U3RlcCApIHtcclxuICAgICAgICAgIHRoaXMucHVzaGVkT2JqZWN0RW51bVByb3BlcnR5LnZhbHVlID0gb2JqZWN0RW51bTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnB1c2hlZE9iamVjdEVudW1Qcm9wZXJ0eS52YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBsYXp5IGxpbmsgc28gd2UgZG9uJ3QgaGF2ZSBhIHN0cmFuZ2UgaW5pdGlhbCBjb25kaXRpb24gZXZlbiB0aG91Z2ggd2UgaGF2ZW4ndCBtb3ZlZCB0aGUgcHVzaGVycy5cclxuICAgIG9iamVjdDEucG9zaXRpb25Qcm9wZXJ0eS5sYXp5TGluayggY3JlYXRlUHVzaGVkUG9zaXRpb25MaXN0ZW5lciggSVNMQ09iamVjdEVudW0uT0JKRUNUX09ORSApICk7XHJcbiAgICBvYmplY3QyLnBvc2l0aW9uUHJvcGVydHkubGF6eUxpbmsoIGNyZWF0ZVB1c2hlZFBvc2l0aW9uTGlzdGVuZXIoIElTTENPYmplY3RFbnVtLk9CSkVDVF9UV08gKSApO1xyXG5cclxuICAgIC8vIHdoZW4gdGhlIG1hc3MgaXMgbGVzc2VuZWQsIHRoZXJlIGlzIG5vIHdheSB0aGF0IHB1c2hlZCBhbiBvYmplY3QsIHNvIHNldCB0byBudWxsXHJcbiAgICBjb25zdCBtYXNzQ2hhbmdlZExpc3RlbmVyID0gKCBuZXdNYXNzLCBvbGRNYXNzICkgPT4ge1xyXG4gICAgICBpZiAoIG9sZE1hc3MgPiBuZXdNYXNzICkge1xyXG4gICAgICAgIHRoaXMucHVzaGVkT2JqZWN0RW51bVByb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIG9iamVjdDEudmFsdWVQcm9wZXJ0eS5saW5rKCBtYXNzQ2hhbmdlZExpc3RlbmVyICk7XHJcbiAgICBvYmplY3QyLnZhbHVlUHJvcGVydHkubGluayggbWFzc0NoYW5nZWRMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIHJlc2V0IGFmdGVyIHN0ZXAgaXMgY29tcGxldGUuXHJcbiAgICB0aGlzLnN0ZXBFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMub2JqZWN0MS5vblN0ZXBFbmQoKTtcclxuICAgICAgdGhpcy5vYmplY3QyLm9uU3RlcEVuZCgpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXAgZnVuY3Rpb24gbWFrZXMgc3VyZSBvYmplY3RzIGRvbid0IGdvIG91dCBvZiBib3VuZHMgYW5kIGRvbid0IG92ZXJsYXAgZWFjaCBvdGhlciBhdCBlYWNoIHRpbWUgc3RlcC5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCkge1xyXG4gICAgY29uc3QgbWluWCA9IHRoaXMubGVmdE9iamVjdEJvdW5kYXJ5O1xyXG4gICAgY29uc3QgbWF4WCA9IHRoaXMucmlnaHRPYmplY3RCb3VuZGFyeTtcclxuXHJcbiAgICBsZXQgcG9zaXRpb25PYmplY3QxID0gdGhpcy5vYmplY3QxLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBsZXQgcG9zaXRpb25PYmplY3QyID0gdGhpcy5vYmplY3QyLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgLy8gYm91bmRzIGZvciB0aGUgbGVmdCBvYmplY3QgYXJlIHRoZSBsZWZ0IGJvdW5kYXJ5IGFuZCB0aGUgcmlnaHQgZWRnZSBvZiBvYmplY3QgMiBtaW51cyBoYWxmIHRoZSBtaW4gc2VwYXJhdGlvblxyXG4gICAgY29uc3QgbWluUG9zaXRpb25PYmplY3QxID0gbWluWDtcclxuICAgIGNvbnN0IG1heFBvc2l0aW9uT2JqZWN0MSA9IHRoaXMuZ2V0T2JqZWN0TWF4UG9zaXRpb24oIHRoaXMub2JqZWN0MSApO1xyXG5cclxuICAgIC8vIGJvdW5kcyBmb3IgdGhlIHJpZ2h0IG9iamVjdCBhcmUgdGhlIHJpZ2h0IGVkZ2Ugb2Ygb2JqZWN0IDEgcGx1cyBoYWxmIHRoZSBzZXBhcmF0aW9uIGRpc3RhbmNlIGFuZCB0aGUgcmlnaHQgZWRnZVxyXG4gICAgY29uc3QgbWluUG9zaXRpb25PYmplY3QyID0gdGhpcy5nZXRPYmplY3RNaW5Qb3NpdGlvbiggdGhpcy5vYmplY3QyICk7XHJcbiAgICBjb25zdCBtYXhQb3NpdGlvbk9iamVjdDIgPSBtYXhYO1xyXG5cclxuICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHRoZSBvYmplY3RzIGRvbid0IGdvIGJleW9uZCB0aGUgYm91bmRhcmllc1xyXG4gICAgcG9zaXRpb25PYmplY3QxID0gTWF0aC5tYXgoIG1pblBvc2l0aW9uT2JqZWN0MSwgcG9zaXRpb25PYmplY3QxICk7XHJcbiAgICBwb3NpdGlvbk9iamVjdDIgPSBNYXRoLm1pbiggcG9zaXRpb25PYmplY3QyLCBtYXhQb3NpdGlvbk9iamVjdDIgKTtcclxuXHJcbiAgICAvLyBtYWtlIHN1cmUgb2JqZWN0cyBkb24ndCBvdmVybGFwXHJcbiAgICBwb3NpdGlvbk9iamVjdDEgPSBNYXRoLm1pbiggcG9zaXRpb25PYmplY3QxLCBtYXhQb3NpdGlvbk9iamVjdDEgKTtcclxuICAgIHBvc2l0aW9uT2JqZWN0MiA9IE1hdGgubWF4KCBtaW5Qb3NpdGlvbk9iamVjdDIsIHBvc2l0aW9uT2JqZWN0MiApO1xyXG5cclxuICAgIC8vIGlmIG9iamVjdHMgYXJlIGxpbWl0ZWQgdG8gYSBjZXJ0YWluIHByZWNpc2lvbiwgcm91bmQgcG9zaXRpb24gdmFsdWVzIHRvIHRoYXQgcHJlY2lzaW9uXHJcbiAgICBwb3NpdGlvbk9iamVjdDEgPSB0aGlzLnNuYXBUb0dyaWQoIHBvc2l0aW9uT2JqZWN0MSApO1xyXG4gICAgcG9zaXRpb25PYmplY3QyID0gdGhpcy5zbmFwVG9HcmlkKCBwb3NpdGlvbk9iamVjdDIgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMub2JqZWN0MS5pc0RyYWdnaW5nUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIHRoaXMub2JqZWN0MS5wb3NpdGlvblByb3BlcnR5LnNldCggcG9zaXRpb25PYmplY3QxICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5vYmplY3QyLmlzRHJhZ2dpbmdQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgdGhpcy5vYmplY3QyLnBvc2l0aW9uUHJvcGVydHkuc2V0KCBwb3NpdGlvbk9iamVjdDIgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gbmVpdGhlciBvYmplY3QgaXMgZHJhZ2dpbmcsIHJhZGl1cyBtdXN0IGhhdmUgY2hhbmdlZFxyXG4gICAgICBpZiAoIHRoaXMub2JqZWN0MS5yYWRpdXNMYXN0Q2hhbmdlZCApIHtcclxuICAgICAgICBpZiAoIHRoaXMub2JqZWN0Mi5wb3NpdGlvblByb3BlcnR5LmdldCgpIDwgbWF4WCApIHtcclxuXHJcbiAgICAgICAgICAvLyBvbmx5IHNldCBpZiBpdCBpcyBkaWZmZXJlbnRcclxuICAgICAgICAgIGlmICggcG9zaXRpb25PYmplY3QyICE9PSB0aGlzLm9iamVjdDIucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIG9iamVjdDIgaXMgbm90IGF0IHRoZSBlZGdlIHVwZGF0ZSBpdHMgcG9zaXRpb25cclxuICAgICAgICAgICAgdGhpcy5vYmplY3QyLnBvc2l0aW9uUHJvcGVydHkuc2V0KCBwb3NpdGlvbk9iamVjdDIgKTtcclxuICAgICAgICAgICAgdGhpcy5vYmplY3QyLnBvc2l0aW9uQ2hhbmdlZEZyb21TZWNvbmRhcnlTb3VyY2VFbWl0dGVyLmVtaXQoIE9CSkVDVF9PTkUgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gb25seSBzZXQgaWYgaXQgaXMgZGlmZmVyZW50XHJcbiAgICAgICAgICBpZiAoIHBvc2l0aW9uT2JqZWN0MSAhPT0gdGhpcy5vYmplY3QxLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBvYmplY3QyIGlzIGF0IHRoZSBlZGdlIHVwZGF0ZSBvYmplY3QxIHBvc2l0aW9uXHJcbiAgICAgICAgICAgIHRoaXMub2JqZWN0MS5wb3NpdGlvblByb3BlcnR5LnNldCggcG9zaXRpb25PYmplY3QxICk7XHJcbiAgICAgICAgICAgIHRoaXMub2JqZWN0MS5wb3NpdGlvbkNoYW5nZWRGcm9tU2Vjb25kYXJ5U291cmNlRW1pdHRlci5lbWl0KCBPQkpFQ1RfT05FICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB0aGlzLm9iamVjdDIucmFkaXVzTGFzdENoYW5nZWQgKSB7XHJcbiAgICAgICAgaWYgKCB0aGlzLm9iamVjdDEucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSA+IG1pblggKSB7XHJcblxyXG4gICAgICAgICAgLy8gb25seSBzZXQgaWYgaXQgaXMgZGlmZmVyZW50XHJcbiAgICAgICAgICBpZiAoIHBvc2l0aW9uT2JqZWN0MSAhPT0gdGhpcy5vYmplY3QxLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBvYmplY3QxIGlzIG5vdCBhdCBib3VuZGFyeSwgdXBkYXRlIHBvc2l0aW9uXHJcbiAgICAgICAgICAgIHRoaXMub2JqZWN0MS5wb3NpdGlvblByb3BlcnR5LnNldCggcG9zaXRpb25PYmplY3QxICk7XHJcbiAgICAgICAgICAgIHRoaXMub2JqZWN0MS5wb3NpdGlvbkNoYW5nZWRGcm9tU2Vjb25kYXJ5U291cmNlRW1pdHRlci5lbWl0KCBPQkpFQ1RfVFdPICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIG9ubHkgc2V0IGlmIGl0IGlzIGRpZmZlcmVudFxyXG4gICAgICAgICAgaWYgKCBwb3NpdGlvbk9iamVjdDIgIT09IHRoaXMub2JqZWN0Mi5wb3NpdGlvblByb3BlcnR5LmdldCgpICkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5vYmplY3QyLnBvc2l0aW9uUHJvcGVydHkuc2V0KCBwb3NpdGlvbk9iamVjdDIgKTtcclxuICAgICAgICAgICAgdGhpcy5vYmplY3QyLnBvc2l0aW9uQ2hhbmdlZEZyb21TZWNvbmRhcnlTb3VyY2VFbWl0dGVyLmVtaXQoIE9CSkVDVF9UV08gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBicm9hZGNhc3QgYSBtZXNzYWdlIHRoYXQgd2UgaGF2ZSB1cGRhdGVkIHRoZSBtb2RlbFxyXG4gICAgdGhpcy5zdGVwRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIZWxwZXIgZnVuY3Rpb24gdG8gZm9yIGFjY2Vzc2luZyBhbmQgbWFwcGluZyBmb3JjZSByYW5nZXMgaW4gdGhlIGluaGVyaXRpbmcgc2ltcycgdmlld3NcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSAtIHBvc2l0aXZlIG51bWJlciwgcmVwcmVzZW50aW5nIHRoZSBtYWduaXR1ZGUgb2YgdGhlIGZvcmNlIHZlY3RvclxyXG4gICAqL1xyXG4gIGdldE1pbkZvcmNlTWFnbml0dWRlKCkge1xyXG4gICAgdGhpcy5hc3NlcnRPYmplY3RzSGF2ZVNhbWVSYW5nZSgpO1xyXG4gICAgY29uc3QgbWF4RGlzdGFuY2UgPSBNYXRoLmFicyggdGhpcy5yaWdodE9iamVjdEJvdW5kYXJ5IC0gdGhpcy5sZWZ0T2JqZWN0Qm91bmRhcnkgKTtcclxuXHJcbiAgICAvLyBTaW5jZSB3ZSdyZSBjaGVja2luZyBmb3IgbWFnbml0dWRlLCBuZWdhdGl2ZSB2YWx1ZXMgZm9yIGNoYXJnZXMgd2lsbCBuZWVkXHJcbiAgICAvLyB0byBiZSBzZXQgdG8gemVyby5cclxuICAgIGNvbnN0IG1pblZhbHVlID0gdGhpcy5vYmplY3QxLnZhbHVlUmFuZ2UubWluIDwgMCA/IDAgOiB0aGlzLm9iamVjdDEudmFsdWVSYW5nZS5taW47XHJcblxyXG4gICAgLy8gZW5zdXJlIHdlIGFsd2F5cyByZXR1cm4gYSBwb3NpdGl2ZSBmb3JjZSB2YWx1ZSBvciB6ZXJvXHJcbiAgICByZXR1cm4gTWF0aC5hYnMoIHRoaXMuY2FsY3VsYXRlRm9yY2UoIG1pblZhbHVlLCBtaW5WYWx1ZSwgbWF4RGlzdGFuY2UgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBtaW5pbXVtIHBvc3NpYmxlIGZvcmNlLiBVbmxpa2UgZ2V0TWluRm9yY2VNYWduaXR1ZGUsIHRoaXMgZnVuY3Rpb24gY2FuIHJldHVybiBhIG5lZ2F0aXZlIHZhbHVlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgc21hbGxlc3QgcG9zc2libGUgZm9yY2UgbWFnbml0dWRlXHJcbiAgICovXHJcbiAgZ2V0TWluRm9yY2UoKSB7XHJcbiAgICB0aGlzLmFzc2VydE9iamVjdHNIYXZlU2FtZVJhbmdlKCk7XHJcbiAgICBjb25zdCBtYXhEaXN0YW5jZSA9IE1hdGguYWJzKCB0aGlzLnJpZ2h0T2JqZWN0Qm91bmRhcnkgLSB0aGlzLmxlZnRPYmplY3RCb3VuZGFyeSApO1xyXG5cclxuICAgIGNvbnN0IG1pblZhbHVlID0gdGhpcy5vYmplY3QxLnZhbHVlUmFuZ2UubWluO1xyXG5cclxuICAgIC8vIGVuc3VyZSB3ZSBhbHdheXMgcmV0dXJuIGEgcG9zaXRpdmUgZm9yY2UgdmFsdWUgb3IgemVyb1xyXG4gICAgcmV0dXJuIE1hdGguYWJzKCB0aGlzLmNhbGN1bGF0ZUZvcmNlKCBtaW5WYWx1ZSwgbWluVmFsdWUsIG1heERpc3RhbmNlICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0byBmb3IgYWNjZXNzaW5nIGFuZCBtYXBwaW5nIGZvcmNlIHJhbmdlcyBpbiB0aGUgaW5oZXJpdGluZyBzaW1zJyB2aWV3c1xyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSBsYXJnZXN0IHBvc3NpYmxlIGZvcmNlIG1hZ25pdHVkZVxyXG4gICAqL1xyXG4gIGdldE1heEZvcmNlKCkge1xyXG4gICAgdGhpcy5hc3NlcnRPYmplY3RzSGF2ZVNhbWVSYW5nZSgpO1xyXG4gICAgcmV0dXJuIE1hdGguYWJzKCB0aGlzLmNhbGN1bGF0ZUZvcmNlKCB0aGlzLm9iamVjdDEudmFsdWVSYW5nZS5tYXgsIHRoaXMub2JqZWN0Mi52YWx1ZVJhbmdlLm1heCxcclxuICAgICAgdGhpcy5zbmFwVG9HcmlkKCB0aGlzLm9iamVjdDEuY29uc3RhbnRSYWRpdXMgKiAyICsgdGhpcy5taW5TZXBhcmF0aW9uQmV0d2Vlbk9iamVjdHMgKSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNdWx0aXBsZSBmdW5jdGlvbnMgaW4gdGhlIG1vZGVsIG5lZWQgdG8gYXNzdW1lIHRoaXMsIHNvIHRoZXNlIGFzc2VydGlvbnMgYXJlIGZhY3RvcmVkIG91dC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGFzc2VydE9iamVjdHNIYXZlU2FtZVJhbmdlKCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5vYmplY3QxLnZhbHVlUHJvcGVydHkucmFuZ2UubWluID09PSB0aGlzLm9iamVjdDIudmFsdWVQcm9wZXJ0eS5yYW5nZS5taW4sICdyYW5nZSBtaW4gc2hvdWxkIGJlIHRoZSBzYW1lJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5vYmplY3QxLnZhbHVlUHJvcGVydHkucmFuZ2UubWF4ID09PSB0aGlzLm9iamVjdDIudmFsdWVQcm9wZXJ0eS5yYW5nZS5tYXgsICdyYW5nZSBtYXggc2hvdWxkIGJlIHRoZSBzYW1lJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBtaW5pbXVtIHBvc3NpYmxlIHNlcGFyYXRpb24gYmV0d2VlbiB0aGUgb2JqZWN0cycgY2VudGVycyBnaXZlbiBhIGRlZmluZWQgdmFsdWUgZm9yIGVhY2ggb2YgdGhlaXJcclxuICAgKiBtYWluIHByb3BlcnRpZXMuXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSB2YWx1ZSAtIHRoZSBvYmplY3QncyBtYXNzIG9yIGNoYXJnZVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBvYmplY3RzJyBjZW50ZXJzXHJcbiAgICovXHJcbiAgZ2V0TWluRGlzdGFuY2UoIHZhbHVlICkge1xyXG5cclxuICAgIC8vIGNhbGN1bGF0ZSByYWRpdXMgZm9yIG1hc3NlcyBhbmQgY2hhcmdlcyBhdCBtYXhpbXVtIG1hc3MvY2hhcmdlXHJcbiAgICBjb25zdCBtaW5SYWRpdXMgPSB0aGlzLm9iamVjdDEuY2FsY3VsYXRlUmFkaXVzKCB2YWx1ZSApO1xyXG4gICAgcmV0dXJuICggMiAqIG1pblJhZGl1cyApICsgdGhpcy5taW5TZXBhcmF0aW9uQmV0d2Vlbk9iamVjdHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIZWxwZXIgZnVuY3Rpb24gdG8gY2FsY3VsYXRlIHRoZSBmb3JjZSB3aXRoaW4gdGhlIG1vZGVsXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSB2MSAtIHRoZSBmaXJzdCBvYmplY3QncyBtYXNzIG9yIGNoYXJnZVxyXG4gICAqIEBwYXJhbSAge251bWJlcn0gdjIgLSB0aGUgc2Vjb25kIG9iamVjdCdzIG1hc3Mgb3IgY2hhcmdlXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBkaXN0YW5jZSAtIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBvYmplY3RzJyBjZW50ZXJzXHJcbiAgICogQHJldHVybnMge251bWJlcn0gdGhlIGZvcmNlIGJldHdlZW4gdGhlIHR3byBvYmplY3RzXHJcbiAgICovXHJcbiAgY2FsY3VsYXRlRm9yY2UoIHYxLCB2MiwgZGlzdGFuY2UgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkaXN0YW5jZSA+IDAsICdtdXN0IGhhdmUgbm9uIHplcm8gZGlzdGFuY2UgYmV0d2VlbiBvYmplY3RzJyApO1xyXG4gICAgcmV0dXJuIHRoaXMuZm9yY2VDb25zdGFudCAqIHYxICogdjIgLyAoIGRpc3RhbmNlICogZGlzdGFuY2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHN1bSBvZiB0aGUgcmFkaWkgb2YgdGhlIHR3byBzcGhlcmljYWwgb2JqZWN0cyBpbiB0aGlzIHNpbSwgcGx1cyB0aGUgbW9kZWwncyBtaW4gc2VwYXJhdGlvbiBiZXR3ZWVuXHJcbiAgICogdGhlIHR3byBvYmplY3RzLiAgVGhpcyBpcyB1c2VkIHRocm91Z2hvdXQgdGhlIG1vZGVsLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0U3VtUmFkaXVzV2l0aFNlcGFyYXRpb24oKSB7XHJcbiAgICBjb25zdCBkaXN0YW5jZVN1bSA9IHRoaXMub2JqZWN0MS5yYWRpdXNQcm9wZXJ0eS5nZXQoKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2JqZWN0Mi5yYWRpdXNQcm9wZXJ0eS5nZXQoKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWluU2VwYXJhdGlvbkJldHdlZW5PYmplY3RzO1xyXG4gICAgcmV0dXJuIHRoaXMuc25hcFRvR3JpZCggZGlzdGFuY2VTdW0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgYWJzb2x1dGUgbWF4aW11bSBob3Jpem9udGFsIHBvc2l0aW9uIGZvciBhbiBvYmplY3QsIHJlbGF0aXZlIHRvIHRoZSBvYmplY3QncyBjZW50ZXIuXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSAge0lTTENPYmplY3R9IG9iamVjdFxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0T2JqZWN0TWF4UG9zaXRpb24oIG9iamVjdCApIHtcclxuXHJcbiAgICBjb25zdCBzdW1SYWRpdXMgPSB0aGlzLmdldFN1bVJhZGl1c1dpdGhTZXBhcmF0aW9uKCk7XHJcbiAgICBsZXQgbWF4WDtcclxuICAgIGlmICggb2JqZWN0ID09PSB0aGlzLm9iamVjdDEgKSB7XHJcblxyXG4gICAgICAvLyB0aGUgbWF4IHZhbHVlIGZvciB0aGUgbGVmdCBvYmplY3QgaXMgdGhlIHBvc2l0aW9uIG9mIHRoZSByaWdodCBvYmplY3QgbWluaXVzIHRoZSBzdW0gb2YgcmFkaWlcclxuICAgICAgbWF4WCA9IHRoaXMub2JqZWN0Mi5wb3NpdGlvblByb3BlcnR5LmdldCgpIC0gc3VtUmFkaXVzO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIG9iamVjdCA9PT0gdGhpcy5vYmplY3QyICkge1xyXG5cclxuICAgICAgLy8gdGhlIG1heCB2YWx1ZSBmb3IgdGhlIHJpZ2h0IG9iamVjdCBpcyB0aGUgcmlnaHQgZWRnZSBtaW51cyB0aGUgcHVsbGVyIHdpZHRoIGFuZCB0aGUgcmFkaXVzIG9mIHRoZSBvYmplY3RcclxuICAgICAgbWF4WCA9IHRoaXMucmlnaHRPYmplY3RCb3VuZGFyeTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5zbmFwVG9HcmlkKCBtYXhYICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGFic29sdXRlIG1pbmltdW0gaG9yaXpvbnRhbCBwb3NpdGlvbiBmb3IgYW4gb2JqZWN0LlxyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcGFyYW0gIHtJU0xDT2JqZWN0fSBvYmplY3RcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldE9iamVjdE1pblBvc2l0aW9uKCBvYmplY3QgKSB7XHJcblxyXG4gICAgY29uc3Qgc3VtUmFkaXVzID0gdGhpcy5nZXRTdW1SYWRpdXNXaXRoU2VwYXJhdGlvbigpO1xyXG4gICAgbGV0IG1pblg7XHJcbiAgICBpZiAoIG9iamVjdCA9PT0gdGhpcy5vYmplY3QxICkge1xyXG5cclxuICAgICAgLy8gdGhlIG1pbiB2YWx1ZSBmb3IgdGhlIGxlZnQgb2JqZWN0IGlzIHRoZSBsZWZ0IGVkZ2UgcGx1cyB0aGUgcHVsbGVyIHdpZHRoIGFuZCB0aGUgcmFkaXVzIG9mIHRoZSBvYmplY3RcclxuICAgICAgbWluWCA9IHRoaXMubGVmdE9iamVjdEJvdW5kYXJ5O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIG9iamVjdCA9PT0gdGhpcy5vYmplY3QyICkge1xyXG5cclxuICAgICAgLy8gbWluIHZhbHVlIGZvciB0aGUgcmlnaHQgb2JqZWN0IGlzIHRoZSBwb3NpdGlvbiBvZiB0aGUgbGVmdCBvYmplY3QgcGx1cyB0aGUgc3VtIG9mIHJhZGlpIGJldHdlZW4gdGhlIHR3b1xyXG4gICAgICAvLyBvYmplY3QgcGx1cyB0aGUgbWluIGRpc3RhbmNlXHJcbiAgICAgIG1pblggPSB0aGlzLm9iamVjdDEucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSArIHN1bVJhZGl1cztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5zbmFwVG9HcmlkKCBtaW5YICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgd2hldGhlciBvciBub3QgdGhlIHBvc2l0aW9uIG9mIGEgbWFzcyB3YXMgbW9zdCByZWNlbnRseSBjaGFuZ2VkIGJhc2VkIG9uIHRoZSBvdGhlciBwdXNoaW5nIGl0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIG1hc3NXYXNQdXNoZWQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wdXNoZWRPYmplY3RFbnVtUHJvcGVydHkudmFsdWUgIT09IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJZiB0aGlzIG1vZGVsIGNvbnN0cmFpbnMgdGhlIG9iamVjdHMgdG8gYSBncmlkLCB0aGlzIHNuYXBzIHRoZSBwb3NpdGlvbiB0byB0aGUgbmVhcmVzdCBzcG90IGluIHRoZSBncmlkLlxyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IHBvc2l0aW9uXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBzbmFwVG9HcmlkKCBwb3NpdGlvbiApIHtcclxuICAgIGxldCBzbmFwcGVkUG9zaXRpb24gPSBwb3NpdGlvbjtcclxuICAgIGNvbnN0IG51bURlY2ltYWxQbGFjZXMgPSBVdGlscy5udW1iZXJPZkRlY2ltYWxQbGFjZXMoIHRoaXMuc25hcE9iamVjdHNUb05lYXJlc3QgKTtcclxuICAgIGlmICggdGhpcy5zbmFwT2JqZWN0c1RvTmVhcmVzdCApIHtcclxuICAgICAgc25hcHBlZFBvc2l0aW9uID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIHBvc2l0aW9uIC8gdGhpcy5zbmFwT2JqZWN0c1RvTmVhcmVzdCApICogdGhpcy5zbmFwT2JqZWN0c1RvTmVhcmVzdDtcclxuICAgICAgc25hcHBlZFBvc2l0aW9uID0gVXRpbHMudG9GaXhlZE51bWJlciggc25hcHBlZFBvc2l0aW9uLCBudW1EZWNpbWFsUGxhY2VzICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbm93IG1ha2Ugc3VyZSB0aGF0IHRoZSBzbmFwcGVkIHBvc2l0aW9uIGlzIHdpdGhpbiB0aGUgbGVmdCBhbmQgcmlnaHQgYm91bmRhcmllcyBmb3IgdGhpcyBtb2RlbFxyXG4gICAgc25hcHBlZFBvc2l0aW9uID0gTWF0aC5taW4oIHNuYXBwZWRQb3NpdGlvbiwgdGhpcy5yaWdodE9iamVjdEJvdW5kYXJ5ICk7XHJcbiAgICBzbmFwcGVkUG9zaXRpb24gPSBNYXRoLm1heCggc25hcHBlZFBvc2l0aW9uLCB0aGlzLmxlZnRPYmplY3RCb3VuZGFyeSApO1xyXG4gICAgcmV0dXJuIHNuYXBwZWRQb3NpdGlvbjtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuc2hvd0ZvcmNlVmFsdWVzUHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICAvLyBpZiB0aGUgcG9zaXRpb24gb2Ygb2JqZWN0MiBpcyBlcXVhbCB0byBvYmplY3QxJ3MgaW5pdGlhbCBwb3NpdGlvbiwgYW4gZXJyb3Igd2lsbCByZXN1bHQgd2hlbiB3ZVxyXG4gICAgLy8gcmVzZXQgb2JqZWN0MSdzIHBvc2l0aW9uLiBUaHVzLCB3ZSBuZWVkIHRvIGNoZWNrIGZvciB0aGF0IG9uZSBlZGdlIGNhc2UgcHJpb3IgdG8gcmVzZXRcclxuICAgIGlmICggdGhpcy5vYmplY3QyLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgPT09IHRoaXMub2JqZWN0MS5wb3NpdGlvblByb3BlcnR5LmluaXRpYWxWYWx1ZSApIHtcclxuICAgICAgdGhpcy5vYmplY3QyLnJlc2V0KCk7XHJcbiAgICAgIHRoaXMub2JqZWN0MS5yZXNldCgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMub2JqZWN0MS5yZXNldCgpO1xyXG4gICAgICB0aGlzLm9iamVjdDIucmVzZXQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGlzIG5lZWRzIHRvIGJlIHJlc2V0IGFmdGVyIHRoZSBvYmplY3RzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyYXZpdHktZm9yY2UtbGFiLWJhc2ljcy9pc3N1ZXMvMTMyXHJcbiAgICB0aGlzLnB1c2hlZE9iamVjdEVudW1Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxuaW52ZXJzZVNxdWFyZUxhd0NvbW1vbi5yZWdpc3RlciggJ0lTTENNb2RlbCcsIElTTENNb2RlbCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgSVNMQ01vZGVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFl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