// Copyright 2013-2023, University of Colorado Boulder

/**
 * Data structure for a control point, which will define the shape of a Track. The ControlPoint may be draggable
 * by the user, and dragging the control point will update the shape of the Track.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import energySkatePark from '../../energySkatePark.js';

class ControlPoint extends PhetioObject {

  /**
   * @param {number} x
   * @param {number} y
   * @param {Object} [options]
   */
  constructor( x, y, options ) {
    options = merge( {

      // {boolean} - if true, this control point will be displayed on the track
      visible: true,

      // {boolean} - can this control point specifically be dragged? If true, the control point is draggable,
      // changes opacity on over, and supports track splitting at the ControlPoint
      interactive: true,

      // {Bounds2|null} - if specified, the ControlPoint will also be constrained to these bounds during dragging, or
      // when the track is bumped above ground, in model coordinates
      limitBounds: null,

      tandem: Tandem.REQUIRED,
      phetioType: ControlPoint.ControlPointIO,
      phetioState: PhetioObject.DEFAULT_OPTIONS.phetioState
    }, options );
    const tandem = options.tandem;

    super( options );

    // @public (read-only) {Bounds2|null} - see option for information
    this.limitBounds = options.limitBounds;

    // @public (read-only) {boolean} - see options for information
    this.interactive = options.interactive;

    // @public (read-only) {boolean} - true if the ControlPoint is intended to be displayed visually
    this.visible = options.visible;

    // @public - where it would be if it hadn't snapped to another point during dragging
    this.sourcePositionProperty = new Vector2Property( new Vector2( x, y ), {
      tandem: tandem.createTandem( 'sourcePositionProperty' ),
      phetioState: options.phetioState // in state only if containing Track is
    } );

    // @public {ControlPoint} - Another ControlPoint that this ControlPoint is going to 'snap' to if released.
    this.snapTargetProperty = new Property( null, {
      tandem: tandem.createTandem( 'snapTargetProperty' ),
      phetioValueType: NullableIO( ControlPoint.ControlPointIO ),
      phetioState: options.phetioState // in state only if containing Track is
    } );

    // Where it is shown on the screen.  Same as sourcePosition (if not snapped) or snapTarget.position (if snapped).
    // Snapping means temporarily connecting to an adjacent open point before the tracks are joined, to indicate that a
    // connection is possible
    // @public {Vector2}
    this.positionProperty = new DerivedProperty( [ this.sourcePositionProperty, this.snapTargetProperty ],
      ( sourcePosition, snapTarget ) => snapTarget ? snapTarget.positionProperty.value : sourcePosition, {
        tandem: tandem.createTandem( 'positionProperty' ),
        phetioValueType: Vector2.Vector2IO,
        phetioState: options.phetioState
      } );

    // @public {BooleanProperty} - whether the control point is currently being dragged
    this.draggingProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'draggingProperty' ),
      phetioState: options.phetioState
    } );

    // @private
    this.disposeControlPoint = () => {
      this.positionProperty.dispose();
      this.sourcePositionProperty.dispose();
      this.snapTargetProperty.dispose();
      this.draggingProperty.dispose();
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposeControlPoint();
    super.dispose();
  }

  /**
   * Reset to initial state.
   * @public
   */
  reset() {
    this.sourcePositionProperty.reset();
    this.snapTargetProperty.reset();
    this.draggingProperty.reset();
  }

  /**
   * Create a new control point, identical to this one.
   * TODO: https://github.com/phetsims/energy-skate-park/issues/123 is this reversed?  Maybe call on the model
   * @public
   *
   * @param {EnergySkateParkModel} model
   * @returns {ControlPoint}
   */
  copy( model ) {
    return model.controlPointGroup.createNextElement( this.positionProperty.value.x, this.positionProperty.value.y );
  }
}

ControlPoint.ControlPointIO = new IOType( 'ControlPointIO', {
  valueType: ControlPoint,
  documentation: 'A control point that can manipulate the track.',
  toStateObject: controlPoint => {
    return { x: controlPoint.positionProperty.value.x, y: controlPoint.positionProperty.value.y };
  },
  stateSchema: {
    x: NumberIO,
    y: NumberIO
  },
  stateObjectToCreateElementArguments: stateObject => {
    assert && assert( typeof stateObject.x === 'number' );
    return [ stateObject.x, stateObject.y ];
  }
} );

energySkatePark.register( 'ControlPoint', ControlPoint );
export default ControlPoint;