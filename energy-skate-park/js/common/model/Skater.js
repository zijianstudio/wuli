// Copyright 2013-2022, University of Colorado Boulder

/**
 * Model for the skater in Energy Skate Park, including position, velocity, energy, etc..
 * All units are in meters.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import merge from '../../../../phet-core/js/merge.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkConstants from '../EnergySkateParkConstants.js';
import SkaterMasses from '../SkaterMasses.js';
import Track from './Track.js';

class Skater {

  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( tandem, options ) {
    options = merge( {

      // {number} - initial mass for the Skater, in kg
      defaultMass: SkaterMasses.SKATER_1_MASS,

      // {Range} - range for the Skater mass, in kg
      massRange: SkaterMasses.MASS_RANGE,

      // {Range} - Range for the reference height, in meters
      referenceHeightRange: EnergySkateParkConstants.REFERENCE_HEIGHT_RANGE
    }, options );

    assert && assert( options.referenceHeightRange.min === 0, 'reference height range needs to start from ground' );

    // @private {Range}
    this.massRange = options.massRange;

    // @public - The track the skater is on, or null if free-falling
    this.trackProperty = new Property( null, {
      tandem: tandem.createTandem( 'trackProperty' ),
      phetioValueType: NullableIO( ReferenceIO( Track.TrackIO ) )
    } );

    // @public {number} - Parameter along the parametric spline, unitless since it is in parametric space
    this.parametricPositionProperty = new Property( 0, {
      tandem: tandem.createTandem( 'parametricPositionProperty' ),
      phetioValueType: NullableIO( NumberIO )
    } );

    // @public {number} - Speed along the parametric spline dimension, formally 'u dot', indicating speed and direction
    // (+/-) along the track spline in meters per second.  Not technically the derivative of 'u' since it is the
    // euclidean speed.
    this.parametricSpeedProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'parametricSpeedProperty' ),
      phetioReadOnly: true
    } );

    // @public - True if the skater is pointing up on the track, false if attached to underside of track
    this.onTopSideOfTrackProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'onTopSideOfTrackProperty' )
    } );

    // @public {number} - Gravity magnitude, without direction, which is easier to set with controls (like sliders) because
    // conceptual minimum value is less than maximum value.
    this.gravityMagnitudeProperty = new NumberProperty( 9.8, {
      tandem: tandem.createTandem( 'gravityMagnitudeProperty' ),
      units: 'm/s/s',
      range: new Range( Math.abs( EnergySkateParkConstants.MIN_GRAVITY ), Math.abs( EnergySkateParkConstants.MAX_GRAVITY ) )
    } );

    // @public {number} - Gravity magnitude and sign
    this.gravityProperty = new DerivedProperty( [ this.gravityMagnitudeProperty ], gravity => {
      const gravityWithSign = -gravity;
      assert && assert( gravityWithSign <= 0, 'this sim only supports negative or 0 gravity' );
      return gravityWithSign;
    }, {
      units: 'm/s/s',
      range: new Range( EnergySkateParkConstants.MAX_GRAVITY, EnergySkateParkConstants.MIN_GRAVITY ) // MAX_GRAVITY < MIN_GRAVITY due to sign
    } );

    // @public {number} - reference height for potential energy, 0 is at the ground
    this.referenceHeightProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'referenceHeightProperty' ),
      units: 'm',
      range: options.referenceHeightRange
    } );

    // @public {Vector2} - the position of the skater
    this.positionProperty = new Vector2Property( new Vector2( 3.5, 0 ), {
      tandem: tandem.createTandem( 'positionProperty' )
    } );

    // @private {number} - Start in the middle of the mass PhysicalControl range
    this.massProperty = new NumberProperty( options.defaultMass, {
      range: options.massRange,
      tandem: tandem.createTandem( 'massProperty' ),
      units: 'kg'
    } );

    // @public {string} - Which way the skater is facing, right or left.  Coded as strings instead of boolean in case
    // we add other states later like 'forward'
    this.directionProperty = new EnumerationDeprecatedProperty( Skater.Direction, Skater.Direction.LEFT, {
      tandem: tandem.createTandem( 'directionProperty' )
    } );

    // @public {Vector2}
    this.velocityProperty = new Vector2Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'velocityProperty' )
    } );

    // @public {boolean} - True if the user is dragging the skater with a pointer
    this.draggingProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'draggingProperty' )
    } );

    // @public {number} - Energies are in Joules
    this.kineticEnergyProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'kineticEnergyProperty' ),
      units: 'J',
      J: true
    } );

    // @public {number}
    this.potentialEnergyProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'potentialEnergyProperty' ),
      units: 'J',
      phetioReadOnly: true
    } );

    // @public {number}
    this.thermalEnergyProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'thermalEnergyProperty' ),
      units: 'J',
      phetioReadOnly: true
    } );

    // @public {number}
    this.totalEnergyProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'totalEnergyProperty' ),
      units: 'J',
      phetioReadOnly: true
    } );

    // @public {number} - The skater's angle (about the pivot point at the bottom center), in radians
    this.angleProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'angleProperty' ),
      units: 'radians',
      phetioReadOnly: true
    } );

    // @public {Vector2} - Returns to this point when pressing "return skater"
    this.startingPositionProperty = new Vector2Property( new Vector2( 3.5, 0 ), {
      tandem: tandem.createTandem( 'startingPositionProperty' )
    } );

    // @public {number} - Returns to this parametric position along the track when pressing "return skater"
    this.startingUProperty = new Property( 0, {
      tandem: tandem.createTandem( 'startingUProperty' ),
      phetioValueType: NullableIO( NumberIO )
    } );

    // @private {boolean} - Tracks whether or not the skater is above or below the track when it is released
    this.startingUpProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'startingUpProperty' )
    } );

    // @public {Property.<Track|null>} - Returns to this track when pressing "return skater"
    this.startingTrackProperty = new Property( null, {
      valueType: [ null, Track ]
    } );

    // @public {Vector2} - Position of the skater's head, for positioning the pie chart.
    this.headPositionProperty = new Vector2Property( this.getHeadPosition(), {
      tandem: tandem.createTandem( 'headPositionProperty' ),
      phetioReadOnly: true
    } );

    // @public
    this.updatedEmitter = new Emitter();
    this.energyChangedEmitter = new Emitter();

    // @public - emits an event when the skater is returned to a previous position
    this.returnedEmitter = new Emitter();

    // @public {number}
    this.speedProperty = new DerivedProperty( [ this.velocityProperty ], velocity => velocity.magnitude, {
      tandem: tandem.createTandem( 'speedProperty' ),
      units: 'm/s',
      phetioValueType: NumberIO
    } );

    // Derived - Zero the kinetic energy when draggingDerived, see #22
    this.draggingProperty.link( dragging => {
      if ( dragging ) {
        this.velocityProperty.value = new Vector2( 0, 0 );
      }
    } );

    this.parametricSpeedProperty.link( parametricSpeed => {

      // Require the skater to overcome a speed threshold so he won't toggle back and forth rapidly at the bottom of a
      // well with friction, see #51
      const speedThreshold = 0.01;

      if ( parametricSpeed > speedThreshold ) {
        this.directionProperty.value = this.onTopSideOfTrackProperty.value ? Skater.Direction.RIGHT : Skater.Direction.LEFT;
      }
      else if ( parametricSpeed < -speedThreshold ) {
        this.directionProperty.value = this.onTopSideOfTrackProperty.value ? Skater.Direction.LEFT : Skater.Direction.RIGHT;
      }
      else {
        // Keep the same direction
      }
    } );

    // @public - Boolean flag that indicates whether the skater has moved from his initial position, and hence can be 'returned',
    // For making the 'return skater' button enabled/disabled
    // If this is a performance concern, perhaps it could just be dropped as a feature
    this.movedProperty = new DerivedProperty( [ this.positionProperty, this.startingPositionProperty, this.draggingProperty ],
      ( x, x0, dragging ) => {
        return !dragging && ( x.x !== x0.x || x.y !== x0.y );
      }, {
        tandem: tandem.createTandem( 'movedProperty' ),
        phetioValueType: BooleanIO
      } );

    // update energies whenever mass, gravity, or height changes so that energy distribution updates while the sim is paused
    Multilink.multilink( [ this.massProperty, this.referenceHeightProperty, this.gravityProperty ], ( mass, referenceHeight, gravity ) => {
      this.updateEnergy();
    } );

    this.updateEnergy();

    this.updatedEmitter.addListener( () => {
      this.updateHeadPosition();
    } );

    // @public - Enable the "Clear Thermal" buttons but only if the thermal energy exceeds a tiny threshold, so there
    // aren't visual "false positives", see #306
    this.allowClearingThermalEnergyProperty = new DerivedProperty( [ this.thermalEnergyProperty ],
      thermalEnergy => {
        return thermalEnergy > 1E-2;
      }, {
        tandem: tandem.createTandem( 'allowClearingThermalEnergyProperty' ),
        phetioValueType: BooleanIO
      } );

    // In the state wrapper, when the state changes, we must update the skater node
    Tandem.PHET_IO_ENABLED && phet.phetio.phetioEngine.phetioStateEngine.stateSetEmitter.addListener( () => {
      this.updatedEmitter.emit();
    } );
  }

  // Get the vector from feet to head, so that when tracks are joined we can make sure he is still pointing up
  // @public
  get upVector() { return this.headPositionProperty.value.minus( this.positionProperty.value ); }

  /**
   * Zero the thermal energy, and update energy distribution accordingly.
   * @public
   */
  clearThermal() {
    this.thermalEnergyProperty.value = 0.0;
    this.updateEnergy();
  }

  /**
   * Fully reset this skater.
   * @public
   */
  reset() {
    this.resetEverythingExceptGravityMassAndReferenceHeight();

    this.referenceHeightProperty.reset();
    this.massProperty.reset();
    this.gravityMagnitudeProperty.reset();

    this.updateEnergy();

    // Notify the graphics to re-render.  See #223
    this.updatedEmitter.emit();
  }

  /**
   * Move the skater to her initial position, but leave the reference height, friction, and mass, and
   * gravity the same, see #237 and #188
   * @public
   */
  resetPosition() {
    this.resetEverythingExceptGravityMassAndReferenceHeight();

    // Notify the graphics to re-render.  See #223
    this.updateEnergy();
    this.updatedEmitter.emit();
  }

  /**
   * Reset all Properties of the Skater except for reference height and mass. Useful when resetting skater position
   * only, but reused in a few places when resetting Skater (to be surrounded by resetting mass or reference height).
   * After calling this, be sure to signify updates with this.updateEnergy() and this.updatedEmitter.emit().
   * @private
   */
  resetEverythingExceptGravityMassAndReferenceHeight() {
    // set the angle to zero first so that the optimization for SkaterNode.updatePosition is maintained, without
    // showing the skater at the wrong angle
    this.angleProperty.value = 0;

    this.trackProperty.reset();
    this.parametricPositionProperty.reset();
    this.parametricSpeedProperty.reset();
    this.onTopSideOfTrackProperty.reset();
    this.positionProperty.reset();
    this.directionProperty.reset();
    this.velocityProperty.reset();
    this.draggingProperty.reset();
    this.kineticEnergyProperty.reset();
    this.potentialEnergyProperty.reset();
    this.thermalEnergyProperty.reset();
    this.totalEnergyProperty.reset();
    this.angleProperty.reset();
    this.startingPositionProperty.reset();
    this.startingUProperty.reset();
    this.startingUpProperty.reset();
    this.startingTrackProperty.reset();
    this.headPositionProperty.reset();
  }

  /**
   * Return the skater to the last position it was released by the user (or its starting position), including the
   * position on a track (if any).
   * @public
   */
  returnSkater() {

    // If the user is on the same track as where he began (and the track hasn't changed), remain on the track,
    // see #143 and #144
    if ( this.startingTrackProperty.value && this.trackProperty.value === this.startingTrackProperty.value && _.isEqual( this.trackProperty.value.copyControlPointSources(), this.startingTrackControlPointSources ) ) {
      this.parametricPositionProperty.value = this.startingUProperty.value;
      this.angleProperty.value = this.startingAngle;
      this.onTopSideOfTrackProperty.value = this.startingUpProperty.value;
      this.parametricSpeedProperty.value = 0;
    }
    else {
      this.trackProperty.value = null;
      this.angleProperty.value = this.startingAngle;
    }
    this.positionProperty.set( this.startingPositionProperty.value.copy() );
    this.velocityProperty.value = new Vector2( 0, 0 );
    this.clearThermal();
    this.updateEnergy();
    this.updatedEmitter.emit();

    this.returnedEmitter.emit();
  }

  /**
   * Update the energies as a batch. This is an explicit method instead of linked to all dependencies so that it can
   * be called in a controlled fashion when multiple dependencies have changed, for performance.
   * @public
   */
  updateEnergy() {
    this.kineticEnergyProperty.value = 0.5 * this.massProperty.value * this.velocityProperty.value.magnitudeSquared;
    this.potentialEnergyProperty.value = -this.massProperty.value * ( this.positionProperty.value.y - this.referenceHeightProperty.value ) * this.gravityProperty.value;
    this.totalEnergyProperty.value = this.kineticEnergyProperty.value + this.potentialEnergyProperty.value + this.thermalEnergyProperty.value;

    // Signal that energies have changed for coarse-grained listeners like PieChartNode that should not get updated
    // 3-4 times per times step
    this.energyChangedEmitter.emit();
  }

  /**
   * Get the position of the skater head from the "point" mass, taking into account the size of the skater
   * from its mass value.
   * @public
   *
   * @returns {Vector2}
   */
  getHeadPosition() {

    // Center pie chart over skater's head not his feet so it doesn't look awkward when skating in a parabola
    // Note this has been tuned independently of SkaterNode.massToScale, which also accounts for the image dimensions
    const skaterHeight = Utils.linear( this.massRange.min, this.massRange.max, 1.65, 2.4, this.massProperty.value );

    const vectorX = skaterHeight * Math.cos( this.angleProperty.value - Math.PI / 2 );
    const vectorY = skaterHeight * Math.sin( this.angleProperty.value - Math.PI / 2 );

    return new Vector2( this.positionProperty.value.x + vectorX, this.positionProperty.value.y - vectorY );
  }

  /**
   * Update the head position for showing the pie chart. Doesn't depend on "up" because it already depends on the
   * angle of the skater. Would be better if headPosition were a derived property, but created too many allocations,
   * see #50
   *
   * @private
   */
  updateHeadPosition() {
    const headPosition = this.getHeadPosition();

    // Manually trigger notifications to avoid allocations, see #50
    this.headPositionProperty.value.x = headPosition.x;
    this.headPositionProperty.value.y = headPosition.y;
    this.headPositionProperty.notifyListenersStatic();
  }

  /**
   * If the skater is released, store the initial conditions for when the skater is returned.
   * @private
   *
   * @param {Track} targetTrack - The track to start on (if any)
   * @param {number} targetU - The parametric position along the track to start on (if any)
   */
  released( targetTrack, targetU ) {
    this.draggingProperty.value = false;
    this.velocityProperty.value = new Vector2( 0, 0 );
    this.parametricSpeedProperty.value = 0;
    this.trackProperty.value = targetTrack;
    this.parametricPositionProperty.value = targetU;
    if ( targetTrack ) {
      this.positionProperty.value = targetTrack.getPoint( this.parametricPositionProperty.value );
    }
    this.startingPositionProperty.value = this.positionProperty.value.copy();
    this.startingUProperty.value = targetU;
    this.startingUpProperty.value = this.onTopSideOfTrackProperty.value;
    this.startingTrackProperty.value = targetTrack;

    // Record the starting track control points to make sure the track hasn't changed during return this.
    this.startingTrackControlPointSources = targetTrack ? targetTrack.copyControlPointSources() : [];
    this.startingAngle = this.angleProperty.value;

    // Update the energy on skater release so it won't try to move to a different height to make up for the delta
    this.updateEnergy();
    this.updatedEmitter.emit();
  }
}

// @public {EnumerationDeprecated}
// @static
Skater.Direction = EnumerationDeprecated.byKeys( [ 'LEFT', 'RIGHT' ] );

energySkatePark.register( 'Skater', Skater );
export default Skater;