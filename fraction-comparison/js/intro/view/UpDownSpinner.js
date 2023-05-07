// Copyright 2021-2022, University of Colorado Boulder

/**
 * Node for up/down buttons.  Used in the Fractions sims to increase/decrease numerator/denominator.  See also LeftRightSpinner.
 *
 * TODO support for press to hold
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Shape } from '../../../../kite/js/imports.js';
import deprecationWarning from '../../../../phet-core/js/deprecationWarning.js';
import InstanceRegistry from '../../../../phet-core/js/documentation/InstanceRegistry.js';
import merge from '../../../../phet-core/js/merge.js';
import sceneryPhet from '../../../../scenery-phet/js/sceneryPhet.js';
import { Path, VBox } from '../../../../scenery/js/imports.js';
import RoundPushButton from '../../../../sun/js/buttons/RoundPushButton.js';

/**
 * @deprecated - Please use NumberPicker or generalize RoundNumberSpinner, see https://github.com/phetsims/fraction-comparison/issues/41
 */
class UpDownSpinner extends VBox {

  /**
   *
   * @param {Property.<number>} valueProperty
   * @param {Property.<boolean>} upEnabledProperty
   * @param {Property.<boolean>} downEnabledProperty
   * @param {Object} [options]
   */
  constructor( valueProperty, upEnabledProperty, downEnabledProperty, options ) {
    deprecationWarning( 'Please use NumberPicker or generalize RoundNumberSpinner, see https://github.com/phetsims/fraction-comparison/issues/41' );
    options = merge( {
      spacing: 6
    }, options );

    const shapeWidth = 26;
    const upShape = new Shape().moveTo( 0, 0 ).lineTo( shapeWidth / 2, -10 ).lineTo( shapeWidth, 0 );
    const downShape = new Shape().moveTo( 0, 0 ).lineTo( shapeWidth / 2, 10 ).lineTo( shapeWidth, 0 );

    const upIcon = new Path( upShape, { lineWidth: 5, stroke: 'black', lineCap: 'round' } );
    const downIcon = new Path( downShape, { lineWidth: 5, stroke: 'black', lineCap: 'round' } );

    const radius = 20;
    const upButton = new RoundPushButton( {
      content: upIcon,
      listener: function() {
        valueProperty.set( valueProperty.get() + 1 );
      },
      radius: radius,
      touchAreaDilation: 5,
      baseColor: '#fefd53',
      yContentOffset: -3
    } );
    const upEnabledPropertyLinkAttribute = enabled => {upButton.enabled = enabled;};
    upEnabledProperty.link( upEnabledPropertyLinkAttribute );

    const downButton = new RoundPushButton( {
      content: downIcon,
      listener: function() {
        valueProperty.set( valueProperty.get() - 1 );
      },
      radius: radius,
      touchAreaDilation: 5,
      baseColor: '#fefd53',
      yContentOffset: +3
    } );
    const downEnabledPropertyLinkAttribute = enabled => {downButton.enabled = enabled;};
    downEnabledProperty.link( downEnabledPropertyLinkAttribute );

    assert && assert( !options.children, 'UpDownSpinner sets children' );
    options.children = [ upButton, downButton ];

    super( options );

    // @private
    this.disposeUpDownSpinner = function() {
      if ( upEnabledProperty.hasListener( upEnabledPropertyLinkAttribute ) ) {
        upEnabledProperty.unlink( upEnabledPropertyLinkAttribute );
      }
      if ( downEnabledProperty.hasListener( downEnabledPropertyLinkAttribute ) ) {
        downEnabledProperty.unlink( downEnabledPropertyLinkAttribute );
      }
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'scenery-phet', 'UpDownSpinner', this );
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeUpDownSpinner();
    super.dispose();
  }
}

sceneryPhet.register( 'UpDownSpinner', UpDownSpinner );
export default UpDownSpinner;