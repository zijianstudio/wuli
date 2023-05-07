// Copyright 2021-2022, University of Colorado Boulder

/**
 * Node for up/down buttons.  Used in the fractions sims to change the number of divisions in a container.  See also UpDownSpinner.
 *
 * TODO: support for press to hold
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Shape } from '../../../../kite/js/imports.js';
import deprecationWarning from '../../../../phet-core/js/deprecationWarning.js';
import InstanceRegistry from '../../../../phet-core/js/documentation/InstanceRegistry.js';
import merge from '../../../../phet-core/js/merge.js';
import sceneryPhet from '../../../../scenery-phet/js/sceneryPhet.js';
import { HBox, Path } from '../../../../scenery/js/imports.js';
import RoundPushButton from '../../../../sun/js/buttons/RoundPushButton.js';

/**
 * @deprecated - Please use NumberPicker or generalize RoundNumberSpinner,
 * see https://github.com/phetsims/fraction-comparison/issues/41
 */
class LeftRightSpinner extends HBox {

  /**
   * @param {Property.<number>} valueProperty
   * @param {Property.<boolean>} leftEnabledProperty
   * @param {Property.<boolean>} rightEnabledProperty
   * @param {Object} [options]
   */
  constructor( valueProperty, leftEnabledProperty, rightEnabledProperty, options ) {
    deprecationWarning( 'Please use NumberPicker or generalize RoundNumberSpinner, see https://github.com/phetsims/fraction-comparison/issues/41' );
    options = merge( {
      spacing: 6
    }, options );

    const shapeWidth = 26;
    const leftShape = new Shape().moveTo( 0, 0 ).lineTo( -10, shapeWidth / 2 ).lineTo( 0, shapeWidth );
    const rightShape = new Shape().moveTo( 0, 0 ).lineTo( 10, shapeWidth / 2 ).lineTo( 0, shapeWidth );

    const leftIcon = new Path( leftShape, { lineWidth: 5, stroke: 'black', lineCap: 'round' } );
    const rightIcon = new Path( rightShape, { lineWidth: 5, stroke: 'black', lineCap: 'round' } );

    const radius = 20;
    const leftButton = new RoundPushButton( {
      content: leftIcon,
      listener: function() {
        valueProperty.set( valueProperty.get() - 1 );
      },
      baseColor: '#7fb539',
      radius: radius,
      touchAreaDilation: 10,
      xContentOffset: -3
    } );
    const leftEnabledPropertyLinkAttribute = enabled => {leftButton.enabled = enabled;};
    leftEnabledProperty.link( leftEnabledPropertyLinkAttribute );

    const rightButton = new RoundPushButton( {
      radius: radius,
      listener: function() {
        valueProperty.set( valueProperty.get() + 1 );
      },
      content: rightIcon,
      touchAreaRadius: 24 * 1.3,
      baseColor: '#7fb539',
      xContentOffset: +3
    } );
    const rightEnabledPropertyLinkAttribute = enabled => {rightButton.enabled = enabled;};
    rightEnabledProperty.link( rightEnabledPropertyLinkAttribute );

    assert && assert( !options.children, 'LeftRightSpinner sets children' );
    options.children = [ leftButton, rightButton ];

    super( options );

    // @private
    this.disposeLeftRightSpinner = function() {
      if ( leftEnabledProperty.hasListener( leftEnabledPropertyLinkAttribute ) ) {
        leftEnabledProperty.unlink( leftEnabledPropertyLinkAttribute );
      }
      if ( rightEnabledProperty.hasListener( rightEnabledPropertyLinkAttribute ) ) {
        rightEnabledProperty.unlink( rightEnabledPropertyLinkAttribute );
      }
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'scenery-phet', 'LeftRightSpinner', this );
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeLeftRightSpinner();
    super.dispose();
  }
}

sceneryPhet.register( 'LeftRightSpinner', LeftRightSpinner );
export default LeftRightSpinner;