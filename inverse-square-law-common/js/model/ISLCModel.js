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
  constructor( forceConstant, object1, object2, positionRange, tandem, options ) {

    options = merge( {
      snapObjectsToNearest: null, // {number|null} if defined, objects will snap to nearest value in model coordinates
      minSeparationBetweenObjects: 0.1 // in meters
    }, options );

    assert && assert( object1.positionProperty.units === object2.positionProperty.units, 'units should be the same' );

    // @public (read-only)
    this.leftObjectBoundary = positionRange.min;
    this.rightObjectBoundary = positionRange.max;

    // @public {Property.<boolean>} - whether to display the force values
    this.showForceValuesProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'showForceValuesProperty' ),
      phetioDocumentation: 'Whether the force values should be displayed'
    } );

    // @public
    this.object1 = object1;
    this.object2 = object2;

    // set the appropriate enum reference to each object.
    object1.enum = ISLCObjectEnum.OBJECT_ONE;
    object2.enum = ISLCObjectEnum.OBJECT_TWO;

    // @public
    // {Property.<ISLCObjectEnum|null>} - needed for adjusting alerts when an object moves as a result of a radius increase
    this.pushedObjectEnumProperty = new Property( null );

    // @private
    this.snapObjectsToNearest = options.snapObjectsToNearest;
    this.minSeparationBetweenObjects = options.minSeparationBetweenObjects;
    this.forceConstant = forceConstant;

    // @public - emits an event when the model is updated by step
    this.stepEmitter = new Emitter();

    // @public {Property.<number>} - calculates the force based on changes to values and positions
    // objects are never destroyed, so forceProperty does not require disposal
    this.forceProperty = new DerivedProperty( [
      this.object1.valueProperty, // see valueProperty in ISLCObject.js
      this.object2.valueProperty,
      this.object1.positionProperty,
      this.object2.positionProperty
    ], ( v1, v2, x1, x2 ) => this.calculateForce( v1, v2, Math.abs( x2 - x1 ) ), {
      phetioValueType: NumberIO,
      tandem: tandem.createTandem( 'forceProperty' ),
      units: 'N',
      phetioDocumentation: 'The force of one object on the other (in Newtons)'
    } );

    // @private {Property.<number>} - The distance between the two objects. Added for PhET-iO.
    this.separationProperty = new DerivedProperty( [
      this.object1.positionProperty,
      this.object2.positionProperty
    ], ( p1, p2 ) => Math.abs( p2 - p1 ), {
      phetioValueType: NumberIO,
      tandem: tandem.createTandem( 'separationProperty' ),
      units: object1.positionProperty.units,
      phetioDocumentation: 'The distance between the two objects\' centers'
    } );

    const updateRange = object => {
      const maxPosition = this.getObjectMaxPosition( object );
      const minPosition = this.getObjectMinPosition( object );

      object.enabledRangeProperty.set( new Range( minPosition, maxPosition ) );
    };

    // pdom - necessary to reset the enabledRangeProperty to prevent object overlap, disposal not necessary
    // We need to update the available range for each object when the either's radius or position changes.
    Multilink.multilink( [ object1.positionProperty, object2.positionProperty ], () => {
      updateRange( object1 );
      updateRange( object2 );
    } );

    // when sim is reset, we only reset the position properties of each object to their initial values
    // thus, there is no need to dispose of the listeners below
    this.object1.radiusProperty.link( () => {
      this.object1.radiusLastChanged = true;
      this.object2.radiusLastChanged = false;

      // update range if radius changed with "constant radius" setting (which didn't trigger other model updates)
      updateRange( object1 );
      updateRange( object2 );
    } );

    this.object2.radiusProperty.link( () => {
      this.object2.radiusLastChanged = true;
      this.object1.radiusLastChanged = false;

      // update range if radius changed with "constant radius" setting (which didn't trigger other model updates)
      updateRange( object2 );
      updateRange( object1 );
    } );

    // wire up logic to update the state of the pushedObjectEnumProperty
    const createPushedPositionListener = objectEnum => {
      return () => {

        // This conditional should only be hit if the mass has changed in addition to the position. Since the object's
        // valueProperty would be set in the previous frame, and then this frame's step function would update the
        // position.
        if ( this.object1.valueChangedSinceLastStep || this.object2.valueChangedSinceLastStep ) {
          this.pushedObjectEnumProperty.value = objectEnum;
        }
        else {
          this.pushedObjectEnumProperty.value = null;
        }
      };
    };

    // lazy link so we don't have a strange initial condition even though we haven't moved the pushers.
    object1.positionProperty.lazyLink( createPushedPositionListener( ISLCObjectEnum.OBJECT_ONE ) );
    object2.positionProperty.lazyLink( createPushedPositionListener( ISLCObjectEnum.OBJECT_TWO ) );

    // when the mass is lessened, there is no way that pushed an object, so set to null
    const massChangedListener = ( newMass, oldMass ) => {
      if ( oldMass > newMass ) {
        this.pushedObjectEnumProperty.value = null;
      }
    };
    object1.valueProperty.link( massChangedListener );
    object2.valueProperty.link( massChangedListener );

    // reset after step is complete.
    this.stepEmitter.addListener( () => {
      this.object1.onStepEnd();
      this.object2.onStepEnd();
    } );
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
    const maxPositionObject1 = this.getObjectMaxPosition( this.object1 );

    // bounds for the right object are the right edge of object 1 plus half the separation distance and the right edge
    const minPositionObject2 = this.getObjectMinPosition( this.object2 );
    const maxPositionObject2 = maxX;

    // make sure that the objects don't go beyond the boundaries
    positionObject1 = Math.max( minPositionObject1, positionObject1 );
    positionObject2 = Math.min( positionObject2, maxPositionObject2 );

    // make sure objects don't overlap
    positionObject1 = Math.min( positionObject1, maxPositionObject1 );
    positionObject2 = Math.max( minPositionObject2, positionObject2 );

    // if objects are limited to a certain precision, round position values to that precision
    positionObject1 = this.snapToGrid( positionObject1 );
    positionObject2 = this.snapToGrid( positionObject2 );

    if ( this.object1.isDraggingProperty.get() ) {
      this.object1.positionProperty.set( positionObject1 );
    }
    else if ( this.object2.isDraggingProperty.get() ) {
      this.object2.positionProperty.set( positionObject2 );
    }
    else {

      // neither object is dragging, radius must have changed
      if ( this.object1.radiusLastChanged ) {
        if ( this.object2.positionProperty.get() < maxX ) {

          // only set if it is different
          if ( positionObject2 !== this.object2.positionProperty.get() ) {

            // object2 is not at the edge update its position
            this.object2.positionProperty.set( positionObject2 );
            this.object2.positionChangedFromSecondarySourceEmitter.emit( OBJECT_ONE );
          }
        }
        else {

          // only set if it is different
          if ( positionObject1 !== this.object1.positionProperty.get() ) {

            // object2 is at the edge update object1 position
            this.object1.positionProperty.set( positionObject1 );
            this.object1.positionChangedFromSecondarySourceEmitter.emit( OBJECT_ONE );
          }
        }
      }
      else if ( this.object2.radiusLastChanged ) {
        if ( this.object1.positionProperty.get() > minX ) {

          // only set if it is different
          if ( positionObject1 !== this.object1.positionProperty.get() ) {

            // object1 is not at boundary, update position
            this.object1.positionProperty.set( positionObject1 );
            this.object1.positionChangedFromSecondarySourceEmitter.emit( OBJECT_TWO );
          }
        }
        else {

          // only set if it is different
          if ( positionObject2 !== this.object2.positionProperty.get() ) {

            this.object2.positionProperty.set( positionObject2 );
            this.object2.positionChangedFromSecondarySourceEmitter.emit( OBJECT_TWO );
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
    const maxDistance = Math.abs( this.rightObjectBoundary - this.leftObjectBoundary );

    // Since we're checking for magnitude, negative values for charges will need
    // to be set to zero.
    const minValue = this.object1.valueRange.min < 0 ? 0 : this.object1.valueRange.min;

    // ensure we always return a positive force value or zero
    return Math.abs( this.calculateForce( minValue, minValue, maxDistance ) );
  }

  /**
   * Get the minimum possible force. Unlike getMinForceMagnitude, this function can return a negative value.
   * @public
   * @returns {number} the smallest possible force magnitude
   */
  getMinForce() {
    this.assertObjectsHaveSameRange();
    const maxDistance = Math.abs( this.rightObjectBoundary - this.leftObjectBoundary );

    const minValue = this.object1.valueRange.min;

    // ensure we always return a positive force value or zero
    return Math.abs( this.calculateForce( minValue, minValue, maxDistance ) );
  }

  /**
   * Helper function to for accessing and mapping force ranges in the inheriting sims' views
   *
   * @public
   * @returns {number} the largest possible force magnitude
   */
  getMaxForce() {
    this.assertObjectsHaveSameRange();
    return Math.abs( this.calculateForce( this.object1.valueRange.max, this.object2.valueRange.max,
      this.snapToGrid( this.object1.constantRadius * 2 + this.minSeparationBetweenObjects ) ) );
  }

  /**
   * Multiple functions in the model need to assume this, so these assertions are factored out.
   * @private
   */
  assertObjectsHaveSameRange() {
    assert && assert( this.object1.valueProperty.range.min === this.object2.valueProperty.range.min, 'range min should be the same' );
    assert && assert( this.object1.valueProperty.range.max === this.object2.valueProperty.range.max, 'range max should be the same' );
  }

  /**
   * Get the minimum possible separation between the objects' centers given a defined value for each of their
   * main properties.
   *
   * @public
   * @param  {number} value - the object's mass or charge
   * @returns {number} the distance between the objects' centers
   */
  getMinDistance( value ) {

    // calculate radius for masses and charges at maximum mass/charge
    const minRadius = this.object1.calculateRadius( value );
    return ( 2 * minRadius ) + this.minSeparationBetweenObjects;
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
  calculateForce( v1, v2, distance ) {
    assert && assert( distance > 0, 'must have non zero distance between objects' );
    return this.forceConstant * v1 * v2 / ( distance * distance );
  }

  /**
   * Returns the sum of the radii of the two spherical objects in this sim, plus the model's min separation between
   * the two objects.  This is used throughout the model.
   *
   * @public
   * @returns {number}
   */
  getSumRadiusWithSeparation() {
    const distanceSum = this.object1.radiusProperty.get() +
                        this.object2.radiusProperty.get() +
                        this.minSeparationBetweenObjects;
    return this.snapToGrid( distanceSum );
  }

  /**
   * Get the absolute maximum horizontal position for an object, relative to the object's center.
   *
   * @private
   * @param  {ISLCObject} object
   * @returns {number}
   */
  getObjectMaxPosition( object ) {

    const sumRadius = this.getSumRadiusWithSeparation();
    let maxX;
    if ( object === this.object1 ) {

      // the max value for the left object is the position of the right object minius the sum of radii
      maxX = this.object2.positionProperty.get() - sumRadius;
    }
    else if ( object === this.object2 ) {

      // the max value for the right object is the right edge minus the puller width and the radius of the object
      maxX = this.rightObjectBoundary;
    }

    return this.snapToGrid( maxX );
  }

  /**
   * Get the absolute minimum horizontal position for an object.
   *
   * @private
   * @param  {ISLCObject} object
   * @returns {number}
   */
  getObjectMinPosition( object ) {

    const sumRadius = this.getSumRadiusWithSeparation();
    let minX;
    if ( object === this.object1 ) {

      // the min value for the left object is the left edge plus the puller width and the radius of the object
      minX = this.leftObjectBoundary;
    }
    else if ( object === this.object2 ) {

      // min value for the right object is the position of the left object plus the sum of radii between the two
      // object plus the min distance
      minX = this.object1.positionProperty.get() + sumRadius;
    }

    return this.snapToGrid( minX );
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
  snapToGrid( position ) {
    let snappedPosition = position;
    const numDecimalPlaces = Utils.numberOfDecimalPlaces( this.snapObjectsToNearest );
    if ( this.snapObjectsToNearest ) {
      snappedPosition = Utils.roundSymmetric( position / this.snapObjectsToNearest ) * this.snapObjectsToNearest;
      snappedPosition = Utils.toFixedNumber( snappedPosition, numDecimalPlaces );
    }

    // now make sure that the snapped position is within the left and right boundaries for this model
    snappedPosition = Math.min( snappedPosition, this.rightObjectBoundary );
    snappedPosition = Math.max( snappedPosition, this.leftObjectBoundary );
    return snappedPosition;
  }

  // @public
  reset() {
    this.showForceValuesProperty.reset();

    // if the position of object2 is equal to object1's initial position, an error will result when we
    // reset object1's position. Thus, we need to check for that one edge case prior to reset
    if ( this.object2.positionProperty.get() === this.object1.positionProperty.initialValue ) {
      this.object2.reset();
      this.object1.reset();
    }
    else {
      this.object1.reset();
      this.object2.reset();
    }

    // This needs to be reset after the objects, see https://github.com/phetsims/gravity-force-lab-basics/issues/132
    this.pushedObjectEnumProperty.reset();
  }
}

inverseSquareLawCommon.register( 'ISLCModel', ISLCModel );

export default ISLCModel;