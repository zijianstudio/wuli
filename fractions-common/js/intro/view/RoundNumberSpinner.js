// Copyright 2018-2022, University of Colorado Boulder

/**
 * Displays an up/down control for incrementing/decrementing a Property
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { VBox } from '../../../../scenery/js/imports.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import RoundArrowButton from '../../common/view/RoundArrowButton.js';
import fractionsCommon from '../../fractionsCommon.js';

class RoundNumberSpinner extends VBox {
  /**
   * @param {Property.<number>} numberProperty
   * @param {ReadOnlyProperty.<boolean>} increaseEnabledProperty
   * @param {ReadOnlyProperty.<boolean>} decreaseEnabledProperty
   * @param {Object} [options]
   */
  constructor( numberProperty, increaseEnabledProperty, decreaseEnabledProperty, options ) {
    assert && assert( numberProperty instanceof Property );
    assert && assert( increaseEnabledProperty instanceof ReadOnlyProperty );
    assert && assert( decreaseEnabledProperty instanceof ReadOnlyProperty );

    options = merge( {
      baseColor: FractionsCommonColors.yellowRoundArrowButtonProperty,
      rotation: 0,
      spacing: 3,
      longTouchDilation: 12,
      sideTouchDilation: 12,
      touchRadius: 10
    }, options );

    super( options );

    // @private {RoundArrowButton}
    this.increaseButton = new RoundArrowButton( {
      rotation: -options.rotation,
      baseColor: options.baseColor,
      arrowRotation: options.rotation,
      enabledProperty: increaseEnabledProperty,
      listener: () => {
        if ( increaseEnabledProperty.value ) {
          numberProperty.value++;
        }
      }
    } );

    // @private {RoundArrowButton}
    this.decreaseButton = new RoundArrowButton( {
      rotation: -options.rotation,
      baseColor: options.baseColor,
      arrowRotation: Math.PI + options.rotation,
      enabledProperty: decreaseEnabledProperty,
      listener: () => {
        if ( decreaseEnabledProperty.value ) {
          numberProperty.value--;
        }
      }
    } );

    const rotationMatrix = Matrix3.rotation2( options.rotation );

    this.increaseButton.touchArea = Shape.boundsOffsetWithRadii( this.increaseButton.localBounds, {
      left: options.sideTouchDilation,
      right: options.sideTouchDilation,
      top: options.longTouchDilation,
      bottom: options.spacing / 2
    }, {
      topLeft: options.touchRadius,
      topRight: options.touchRadius
    } ).transformed( rotationMatrix );

    this.decreaseButton.touchArea = Shape.boundsOffsetWithRadii( this.decreaseButton.localBounds, {
      left: options.sideTouchDilation,
      right: options.sideTouchDilation,
      top: options.spacing / 2,
      bottom: options.longTouchDilation
    }, {
      bottomLeft: options.touchRadius,
      bottomRight: options.touchRadius
    } ).transformed( rotationMatrix );

    this.children = [
      this.increaseButton,
      this.decreaseButton
    ];
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.increaseButton.dispose();
    this.decreaseButton.dispose();

    super.dispose();
  }
}

fractionsCommon.register( 'RoundNumberSpinner', RoundNumberSpinner );
export default RoundNumberSpinner;