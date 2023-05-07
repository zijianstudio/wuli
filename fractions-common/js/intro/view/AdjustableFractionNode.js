// Copyright 2018-2022, University of Colorado Boulder

/**
 * Displays a fraction with up/down spinners for both the numerator and denominator.
 *
 * @author Michael Moorer (Berea College)
 * @author Vincent Davis (Berea College)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import PropertyFractionNode from '../../../../scenery-phet/js/PropertyFractionNode.js';
import { HBox, VBox } from '../../../../scenery/js/imports.js';
import fractionsCommon from '../../fractionsCommon.js';
import RoundNumberSpinner from './RoundNumberSpinner.js';

class AdjustableFractionNode extends HBox {
  /**
   * @param {NumberProperty} numeratorProperty
   * @param {NumberProperty} denominatorProperty
   * @param {NumberProperty} containerCountProperty
   * @param {Object} [options]
   */
  constructor( numeratorProperty, denominatorProperty, containerCountProperty, options ) {
    options = merge( {
      // {PropertyFractionNode.DisplayType}
      type: PropertyFractionNode.DisplayType.IMPROPER,

      // {boolean} - If false, the spinners will be to the left
      spinnersOnRight: true
    }, options );

    // convenience variable
    const properties = [ numeratorProperty, denominatorProperty, containerCountProperty ];

    const fractionNode = new PropertyFractionNode( numeratorProperty, denominatorProperty, {
      type: options.type,
      scale: 3,

      maxNumerator: numeratorProperty.range.max,
      maxDenominator: denominatorProperty.range.max
    } );

    const spinnersNode = new VBox( {
      spacing: 30,
      children: [
        // Numerator
        new RoundNumberSpinner(
          numeratorProperty,
          new DerivedProperty( properties, ( numerator, denominator, containerCount ) => {
            return ( numerator + 1 ) / denominator <= containerCount;
          } ),
          new DerivedProperty( properties, ( numerator, denominator, containerCount ) => {
            return ( numerator - 1 ) >= 0;
          } )
        ),
        // Denominator
        new RoundNumberSpinner(
          denominatorProperty,
          new DerivedProperty( properties, ( numerator, denominator, containerCount ) => {
            return ( denominator + 1 ) <= denominatorProperty.range.max;
          } ),
          new DerivedProperty( properties, ( numerator, denominator, containerCount ) => {
            return ( denominator - 1 ) >= denominatorProperty.range.min && numerator / ( denominator - 1 ) <= containerCount;
          } )
        )
      ]
    } );

    super( merge( {
      spacing: 10,
      children: options.spinnersOnRight ? [
        fractionNode,
        spinnersNode
      ] : [
        spinnersNode,
        fractionNode
      ]
    }, options ) );
  }
}

fractionsCommon.register( 'AdjustableFractionNode', AdjustableFractionNode );
export default AdjustableFractionNode;