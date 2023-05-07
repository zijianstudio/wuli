// Copyright 2014-2022, University of Colorado Boulder

/**
 * Magnet model for the 'Faradays Law' simulation.
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

// modules
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawConstants from '../FaradaysLawConstants.js';
import OrientationEnum from './OrientationEnum.js';

class Magnet {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // @public {number} - width of the magnet
    this.width = FaradaysLawConstants.MAGNET_WIDTH;

    // @public {number} - height of the magnet
    this.height = FaradaysLawConstants.MAGNET_HEIGHT;

    // @public - position of the magnet
    this.positionProperty = new Vector2Property( new Vector2( 647, 200 ), {
      tandem: tandem.createTandem( 'positionProperty' ),
      phetioDocumentation: 'The position of the center of the bar magnet in view coordinates',
      phetioHighFrequency: true
    } );

    // @public {BooleanProperty} - true if the magnet is flipped
    this.orientationProperty = new EnumerationDeprecatedProperty( OrientationEnum, OrientationEnum.NS, {
      tandem: tandem.createTandem( 'orientationProperty' ),
      phetioDocumentation: 'The direction the bar magnet is oriented'
    } );

    // @public {BooleanProperty} - show field lines for magnet
    this.fieldLinesVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'fieldLinesVisibleProperty' ),
      phetioDocumentation: 'True if the field lines are visible'
    } );

    // @public {BooleanProperty} - whether the user is currently dragging the magnet
    this.isDraggingProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isDraggingProperty' )
    } );
  }

  /**
   * Get the bounds of the magnet
   * @returns {Bounds2}
   * @public
   */
  getBounds() {
    const currentPosition = this.positionProperty.value;
    return new Bounds2(
      currentPosition.x - this.width / 2,
      currentPosition.y - this.height / 2,
      currentPosition.x + this.width / 2,
      currentPosition.y + this.height / 2
    );
  }

  /**
   * Restore the initial conditions
   * @public
   */
  reset() {
    this.positionProperty.reset();
    this.orientationProperty.reset();
    this.fieldLinesVisibleProperty.reset();
  }
}

faradaysLaw.register( 'Magnet', Magnet );
export default Magnet;