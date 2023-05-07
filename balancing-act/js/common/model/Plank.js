// Copyright 2013-2022, University of Colorado Boulder

/**
 * This is the model for the plank upon which masses can be placed.
 *
 * @author John Blanco
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ObjectLiteralIO from '../../../../tandem/js/types/ObjectLiteralIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import balancingAct from '../../balancingAct.js';
import BASharedConstants from '../BASharedConstants.js';
import ColumnState from './ColumnState.js';
import MassForceVector from './MassForceVector.js';

// constants
const PLANK_LENGTH = 4.5;// meters
const PLANK_THICKNESS = 0.05; // meters
const PLANK_MASS = 75; // kg
const INTER_SNAP_TO_MARKER_DISTANCE = 0.25; // meters
const NUM_SNAP_TO_POSITIONS = Math.floor( PLANK_LENGTH / INTER_SNAP_TO_MARKER_DISTANCE - 1 );
const MOMENT_OF_INERTIA = PLANK_MASS * ( ( PLANK_LENGTH * PLANK_LENGTH ) + ( PLANK_THICKNESS * PLANK_THICKNESS ) ) / 12;

class Plank {

  /**
   * @param position {Vector2} Initial position of the horizontal center, vertical bottom
   * @param pivotPoint {Vector2} Point around which the plank will pivot
   * @param columnState {Property} Property that indicates current state of support columns.
   * @param userControlledMasses {Array} Masses being controlled by the user, used to update active drop positions.
   * @param {Tandem} tandem
   */
  constructor( position, pivotPoint, columnState, userControlledMasses, tandem ) {
    this.userControlledMasses = userControlledMasses;

    // @public (read-only)
    this.tiltAngleProperty = new NumberProperty( 0, {
      phetioDocumentation: 'Angle of the plank with respect to the ground.  A value of 0 indicates a level plank, ' +
                           'positive is tilted left, negative to the right.',
      units: 'radians',
      tandem: tandem.createTandem( 'tiltAngleProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true
    } );

    // @public (read-only) - Point where the bottom center of the plank is currently positioned. If the plank is sitting
    // on top of the fulcrum, this point will be the same as the pivot point.  When the pivot point is above the plank,
    // as is generally done in this simulation in order to make the plank rebalance if nothing is on it, this position
    // will be different.
    this.bottomCenterPositionProperty = new Property( position );

    // @public (read-only) - Externally visible observable lists.
    this.massesOnSurface = createObservableArray();
    this.forceVectors = createObservableArray();
    this.activeDropPositions = createObservableArray(); // Positions where user-controlled masses would land if dropped, in meters from center.

    // @public (read-only) {Vector2} Other external visible attributes.
    this.pivotPoint = pivotPoint;

    // @public (read-only) - Map of masses to distance from the plank's center.
    this.massDistancePairs = [];

    // @private - signify in the data stream when masses are placed and removed
    this.massDroppedOnPlankEmitter = new Emitter( {
      tandem: tandem.createTandem( 'massDroppedOnPlankEmitter' ),
      parameters: [
        { name: 'phetioID', phetioType: StringIO },
        { name: 'mass', phetioType: NumberIO },
        { name: 'distance', phetioType: NumberIO },
        { name: 'fullState', phetioType: Plank.PlankIO } ]
    } );

    // @private - signify in the data stream when masses are placed and removed
    this.massRemovedFromPlankEmitter = new Emitter( {
      tandem: tandem.createTandem( 'massRemovedFromPlankEmitter' ),
      parameters: [
        { name: 'phetioID', phetioType: StringIO },
        { name: 'mass', phetioType: NumberIO },
        { name: 'distance', phetioType: NumberIO },
        { name: 'fullState', phetioType: Plank.PlankIO } ]
    } );

    // Variables that need to be retained for dynamic behavior, but are not intended to be accessed externally.
    this.columnState = columnState;
    this.angularVelocity = 0;
    this.currentNetTorque = 0;

    // @public (read-only) - Calculate the max angle at which the plank can tilt before hitting the ground.  NOTE: This
    // assumes a small distance between the pivot point and the bottom of the plank.  If this assumption changes, or if
    // the fulcrum becomes movable, the way this is done will need to change.
    this.maxTiltAngle = Math.asin( position.y / ( PLANK_LENGTH / 2 ) );

    // Unrotated shape of the plank
    this.unrotatedShape = Shape.rect( position.x - PLANK_LENGTH / 2, position.y, PLANK_LENGTH, PLANK_THICKNESS );

    // Listen to the support column property.  The plank goes to the level position whenever there are two columns
    // present, and into a tilted position when only one is present.
    columnState.link( newColumnState => {
      if ( newColumnState === ColumnState.SINGLE_COLUMN ) {
        this.forceToMaxAndStill();
      }
      else if ( newColumnState === ColumnState.DOUBLE_COLUMNS ) {
        this.forceToLevelAndStill();
      }
    } );

    // Listen for when masses are added to the plank and add a listener that removes that mass if the user picks is up.
    this.massesOnSurface.addItemAddedListener( addedMass => {

      // Add a listener that will remove this mass from the surface when the user picks it up.
      const userControlledListener = userControlled => {
        if ( userControlled ) {
          this.removeMassFromSurface( addedMass );
        }
      };
      addedMass.userControlledProperty.link( userControlledListener );

      // Remove the listener when the mass is removed.
      const self = this;
      this.massesOnSurface.addItemRemovedListener( function massRemovalListener( removedMass ) {
        if ( removedMass === addedMass ) {
          removedMass.userControlledProperty.unlink( userControlledListener );
          self.massesOnSurface.removeItemRemovedListener( massRemovalListener );
        }
      } );
    } );
  }

  /**
   * @param {number} dt
   * @public
   */
  step( dt ) {
    let angularAcceleration;
    this.updateNetTorque();

    // Update the angular acceleration and velocity.  There is some thresholding here to prevent the plank from
    // oscillating forever with small values, since this can cause odd-looking movements of the planks and masses.  The
    // thresholds were empirically determined.
    angularAcceleration = this.currentNetTorque / MOMENT_OF_INERTIA;
    angularAcceleration = Math.abs( angularAcceleration ) > 0.00001 ? angularAcceleration : 0;
    this.angularVelocity += angularAcceleration;
    this.angularVelocity = Math.abs( this.angularVelocity ) > 0.00001 ? this.angularVelocity : 0;

    // Update the angle of the plank's tilt based on the angular velocity.
    const previousTiltAngle = this.tiltAngleProperty.get();
    let newTiltAngle = this.tiltAngleProperty.get() + this.angularVelocity * dt;
    if ( Math.abs( newTiltAngle ) > this.maxTiltAngle ) {

      // Limit the angle when one end is touching the ground.
      newTiltAngle = this.maxTiltAngle * ( this.tiltAngleProperty.get() < 0 ? -1 : 1 );
      this.angularVelocity = 0;
    }
    else if ( Math.abs( newTiltAngle ) < 0.0001 ) {

      // Below a certain threshold just force the tilt angle to be zero so that it appears perfectly level.
      newTiltAngle = 0;
    }
    this.tiltAngleProperty.set( newTiltAngle );

    // Update the shape of the plank and the positions of the masses on the surface, but only if the tilt angle has
    // changed.
    if ( this.tiltAngleProperty.get() !== previousTiltAngle ) {
      this.updatePlank();
      this.updateMassPositions();
    }

    // Simulate friction by slowing down the rotation a little.
    this.angularVelocity *= 0.91;

    // Update the active drop positions.
    const tempDropPositions = [];
    this.userControlledMasses.forEach( userControlledMass => {
      if ( this.isPointAbovePlank( userControlledMass.getMiddlePoint() ) ) {
        const closestOpenPosition = this.getOpenMassDroppedPosition( userControlledMass.positionProperty.get() );
        if ( closestOpenPosition ) {
          const plankSurfaceCenter = this.getPlankSurfaceCenter();
          const distanceFromCenter = closestOpenPosition.distance( plankSurfaceCenter ) * ( closestOpenPosition.x < 0 ? -1 : 1 );
          tempDropPositions.push( distanceFromCenter );
        }
      }
    } );
    const copyOfActiveDropPositions = this.activeDropPositions.slice( 0 );
    // Remove newly inactive drop positions.
    copyOfActiveDropPositions.forEach( activeDropPositions => {
      if ( tempDropPositions.indexOf( activeDropPositions ) < 0 ) {
        this.activeDropPositions.remove( activeDropPositions );
      }
    } );
    // Add any new active drop positions.
    tempDropPositions.forEach( dropPosition => {
      if ( !this.activeDropPositions.includes( dropPosition ) ) {
        this.activeDropPositions.add( dropPosition );
      }
    } );
  }

  /**
   * Add a mass to the surface of the plank, chooses a position below the mass.
   * @param {Mass} mass
   * @returns {boolean}
   * @public
   */
  addMassToSurface( mass ) {
    let massAdded = false;
    const closestOpenPosition = this.getOpenMassDroppedPosition( mass.positionProperty.get() );
    if ( this.isPointAbovePlank( mass.getMiddlePoint() ) && closestOpenPosition !== null ) {
      mass.positionProperty.set( closestOpenPosition );
      mass.onPlankProperty.set( true );

      const result = {
        mass: mass,
        distance: this.getPlankSurfaceCenter().distance( mass.positionProperty.get() ) *
                  ( mass.positionProperty.get().x > this.getPlankSurfaceCenter().x ? 1 : -1 )
      };
      this.massDistancePairs.push( result );

      this.massDroppedOnPlankEmitter.emit( mass.tandem.phetioID, mass.massValue, result.distance, this );

      // Add the force vector for this mass.
      this.forceVectors.push( new MassForceVector( mass ) );

      // Final steps.
      this.massesOnSurface.push( mass );
      this.updateMassPositions();
      this.updateNetTorque();
      massAdded = true;
    }

    return massAdded;
  }

  /**
   * Indicates all of the masses that are currently on the plank
   * @returns {Object}
   * @private
   */
  toStateObject() {
    return {
      massDistancePairs: this.massDistancePairs.map( massDistancePair => {
        return {
          name: massDistancePair.mass.tandem.phetioID,
          mass: massDistancePair.mass.massValue,
          distance: massDistancePair.distance
        };
      } )
    };
  }

  /**
   * Add a mass to the specified position on the plank.
   * @param {Mass} mass
   * @param {number} distanceFromCenter
   * @public
   */
  addMassToSurfaceAt( mass, distanceFromCenter ) {
    if ( Math.abs( distanceFromCenter ) > PLANK_LENGTH / 2 ) {
      throw new Error( 'Warning: Attempt to add mass at invalid distance from center' );
    }
    const vectorToPosition = this.getPlankSurfaceCenter().plus(
      Vector2.createPolar( distanceFromCenter, this.tiltAngleProperty.get() )
    );

    // Set the position of the mass to be just above the plank at the
    // appropriate distance so that it will drop to the correct place.
    mass.positionProperty.set( new Vector2( vectorToPosition.x, vectorToPosition.y + 0.01 ) );
    assert && assert( this.isPointAbovePlank( mass.positionProperty.get() ) );  // Need to fix this if mass isn't above the surface.
    this.addMassToSurface( mass );
  }

  /**
   * @private
   */
  updateMassPositions() {
    this.massesOnSurface.forEach( mass => {

      // Compute the vector from the center of the plank's surface to the bottom of the mass, in meters.
      const vectorFromCenterToMass = new Vector2(
        this.getMassDistanceFromCenter( mass ), 0 ).rotated( this.tiltAngleProperty.get()
      );

      // Set the position and rotation of the mass.
      mass.rotationAngleProperty.set( this.tiltAngleProperty.get() );
      mass.positionProperty.set( this.getPlankSurfaceCenter().plus( vectorFromCenterToMass ) );
    } );

    // Update the force vectors from the masses.  This mostly just moves
    // them to the correct positions.
    this.forceVectors.forEach( forceVectors => {
      forceVectors.update();
    } );
  }

  /**
   * @param {Mass} mass
   * @public
   */
  removeMassFromSurface( mass ) {

    // Remove the mass.
    this.massesOnSurface.remove( mass );

    // Remove the mass-distance pair for this mass.
    for ( let i = 0; i < this.massDistancePairs.length; i++ ) {
      if ( this.massDistancePairs[ i ].mass === mass ) {

        const distance = this.massDistancePairs[ i ].distance;
        this.massDistancePairs.splice( i, 1 );
        this.massRemovedFromPlankEmitter.emit( mass.tandem.phetioID, mass.massValue, distance, this );

        break;
      }
    }

    // Reset the attributes of the mass that may have been affected by being on the plank.
    mass.rotationAngleProperty.set( 0 );
    mass.onPlankProperty.set( false );

    // Remove the force vector associated with this mass.
    for ( let j = 0; j < this.forceVectors.length; j++ ) {
      if ( this.forceVectors.get( j ).mass === mass ) {
        this.forceVectors.remove( this.forceVectors.get( j ) );
        break;
      }
    }

    // Update the torque, since the removal of the mass undoubtedly changed it.
    this.updateNetTorque();
  }

  /**
   * @public
   */
  removeAllMasses() {
    const copyOfMassesArray = this.massesOnSurface.slice( 0 );
    copyOfMassesArray.forEach( mass => {
      this.removeMassFromSurface( mass );
    } );
  }

  /**
   * @param {Mass} mass
   * @returns {number}
   * @public
   */
  getMassDistanceFromCenter( mass ) {
    for ( let i = 0; i < this.massDistancePairs.length; i++ ) {
      if ( this.massDistancePairs[ i ].mass === mass ) {
        return this.massDistancePairs[ i ].distance;
      }
    }
    return 0;
  }

  /**
   * @private
   */
  updatePlank() {
    if ( this.pivotPoint.y < this.unrotatedShape.minY ) {
      throw new Error( 'Pivot point cannot be below the plank.' );
    }
    let attachmentBarVector = new Vector2( 0, this.unrotatedShape.bounds.y - this.pivotPoint.y );
    attachmentBarVector = attachmentBarVector.rotated( this.tiltAngleProperty.get() );
    this.bottomCenterPositionProperty.set( this.pivotPoint.plus( attachmentBarVector ) );
  }

  /**
   * Find the best open position for a mass that was dropped at the given point.  Returns null if no nearby open
   * position is available.
   * @param {Vector2} position
   * @returns {Vector2|null}
   * @private
   */
  getOpenMassDroppedPosition( position ) {
    let closestOpenPosition = null;
    const validMassPositions = this.getSnapToPositions();
    if ( NUM_SNAP_TO_POSITIONS % 2 === 1 ) {

      // Remove the position at the center of the plank from the set of candidates, since we don't want to allow users
      // to place things there.
      validMassPositions.splice( NUM_SNAP_TO_POSITIONS / 2, 1 );
    }

    let candidateOpenPositions = [];

    validMassPositions.forEach( validPosition => {
      let occupiedOrTooFar = false;
      if ( Math.abs( validPosition.x - position.x ) > INTER_SNAP_TO_MARKER_DISTANCE * 2 ) {
        occupiedOrTooFar = true;
      }
      for ( let i = 0; i < this.massesOnSurface.length && !occupiedOrTooFar; i++ ) {
        if ( this.massesOnSurface.get( i ).positionProperty.get().distance( validPosition ) < INTER_SNAP_TO_MARKER_DISTANCE / 10 ) {
          occupiedOrTooFar = true;
        }
      }
      if ( !occupiedOrTooFar ) {
        candidateOpenPositions.push( validPosition );
      }
    } );

    // Sort through the positions and eliminate those that are already occupied or too far away.
    const copyOfCandidatePositions = candidateOpenPositions.slice( 0 );
    for ( let i = 0; i < copyOfCandidatePositions.length; i++ ) {
      for ( let j = 0; j < this.massesOnSurface.length; j++ ) {
        if ( this.massesOnSurface.get( j ).positionProperty.get().distance( copyOfCandidatePositions[ i ] ) < INTER_SNAP_TO_MARKER_DISTANCE / 10 ) {
          // This position is already occupied.
          candidateOpenPositions = _.without( candidateOpenPositions, this.massesOnSurface[ j ] );
        }
      }
    }

    // Find the closest of the open positions.
    candidateOpenPositions.forEach( candidateOpenPosition => {

      // Must be a reasonable distance away in the horizontal direction so that objects don't appear to fall sideways.
      if ( Math.abs( candidateOpenPosition.x - position.x ) <= INTER_SNAP_TO_MARKER_DISTANCE ) {
        // This position is a potential candidate.  Is it better than what was already found?
        if ( closestOpenPosition === null || candidateOpenPosition.distance( position ) < closestOpenPosition.distance( position ) ) {
          closestOpenPosition = candidateOpenPosition;
        }
      }
    } );
    return closestOpenPosition;
  }

  /**
   * Force the plank back to the level position.  This is generally done when the two support columns are put into
   * place.
   * @private
   */
  forceToLevelAndStill() {
    this.forceAngle( 0.0 );
  }

  /**
   * Force the plank to the max tilted position.  This is generally done when the single big support column is put into
   * place.
   * @private
   */
  forceToMaxAndStill() {
    this.forceAngle( this.maxTiltAngle );
  }

  /**
   * @param {number} angle
   * @private
   */
  forceAngle( angle ) {
    this.angularVelocity = 0;
    this.tiltAngleProperty.set( angle );
    this.updatePlank();
    this.updateMassPositions();
  }

  /**
   * Obtain the absolute position (in meters) of the center surface (top) of the plank
   * @returns {Vector2}
   * @public
   */
  getPlankSurfaceCenter() {

    // Start at the absolute position of the attachment point, and add the relative position of the top of the plank,
    // accounting for its rotation angle.
    return this.bottomCenterPositionProperty.get().plus(
      Vector2.createPolar( PLANK_THICKNESS, this.tiltAngleProperty.get() + Math.PI / 2 )
    );
  }

  /**
   * Obtain the Y value for the surface of the plank for the specified X value.  Does not check for valid x value.
   * @param {number} xValue
   * @returns {number}
   * @private
   */
  getSurfaceYValue( xValue ) {

    // Solve the linear equation for the line that represents the surface of the plank.
    const m = Math.tan( this.tiltAngleProperty.get() );
    const plankSurfaceCenter = this.getPlankSurfaceCenter();
    const b = plankSurfaceCenter.y - m * plankSurfaceCenter.x;
    // Does NOT check if the xValue range is valid.
    return m * xValue + b;
  }

  /**
   * @param {Vector2} p
   * @returns {boolean}
   * @private
   */
  isPointAbovePlank( p ) {
    const plankSpan = PLANK_LENGTH * Math.cos( this.tiltAngleProperty.get() );
    const surfaceCenter = this.getPlankSurfaceCenter();
    return p.x >= surfaceCenter.x - ( plankSpan / 2 ) && p.x <= surfaceCenter.x + ( plankSpan / 2 ) && p.y > this.getSurfaceYValue( p.x );
  }

  /**
   * Returns true if the masses and distances on the plank work out such that the plank is balanced, even if it is not
   * yet in the level position. This does NOT pay attention to support columns.
   * @public
   */
  isBalanced() {
    let unCompensatedTorque = 0;
    this.massesOnSurface.forEach( mass => {
      unCompensatedTorque += mass.massValue * this.getMassDistanceFromCenter( mass );
    } );

    // Account for floating point error, just make sure it is close enough.
    return Math.abs( unCompensatedTorque ) < BASharedConstants.COMPARISON_TOLERANCE;
  }

  /**
   * @private
   */
  updateNetTorque() {
    this.currentNetTorque = 0;
    if ( this.columnState.value === ColumnState.NO_COLUMNS ) {

      // Add the torque due to the masses on the surface of the plank.
      this.currentNetTorque += this.getTorqueDueToMasses();

      // Add in torque due to plank.
      this.currentNetTorque += ( this.pivotPoint.x - this.bottomCenterPositionProperty.get().x ) * PLANK_MASS;
    }
  }

  /**
   * @returns {number}
   * @public
   */
  getTorqueDueToMasses() {
    let torque = 0;
    this.massesOnSurface.forEach( mass => {
      torque += this.pivotPoint.x - mass.positionProperty.get().x * mass.massValue;
    } );
    return torque;
  }

  /**
   * @returns {Vector2[]}
   * @private
   */
  getSnapToPositions() {
    const snapToPositions = new Array( NUM_SNAP_TO_POSITIONS );
    const rotationTransform = Matrix3.rotationAround(
      this.tiltAngleProperty.get(),
      this.pivotPoint.x,
      this.pivotPoint.y
    );
    const unrotatedY = this.unrotatedShape.bounds.maxY;
    const unrotatedMinX = this.unrotatedShape.bounds.minX;
    for ( let i = 0; i < NUM_SNAP_TO_POSITIONS; i++ ) {
      const unrotatedPoint = new Vector2( unrotatedMinX + ( i + 1 ) * INTER_SNAP_TO_MARKER_DISTANCE, unrotatedY );
      snapToPositions[ i ] = rotationTransform.timesVector2( unrotatedPoint );
    }

    return snapToPositions;
  }
}

// static constants
Plank.LENGTH = PLANK_LENGTH;
Plank.THICKNESS = PLANK_THICKNESS;
Plank.INTER_SNAP_TO_MARKER_DISTANCE = INTER_SNAP_TO_MARKER_DISTANCE;
Plank.NUM_SNAP_TO_POSITIONS = NUM_SNAP_TO_POSITIONS;
Plank.MAX_VALID_MASS_DISTANCE_FROM_CENTER = ( NUM_SNAP_TO_POSITIONS - 1 ) * INTER_SNAP_TO_MARKER_DISTANCE / 2;

Plank.PlankIO = new IOType( 'PlankIO', {
  valueType: Plank,
  stateSchema: {
    massDistancePairs: ArrayIO( ObjectLiteralIO ) // TODO https://github.com/phetsims/balancing-act/issues/130 more specific schema
  },
  toStateObject: plank => plank.toStateObject()
} );

balancingAct.register( 'Plank', Plank );

export default Plank;
