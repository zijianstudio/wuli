// Copyright 2018-2023, University of Colorado Boulder

/**
 * Displays an up/down control for handling the maximum number of "containers"
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { AlignBox, HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import fractionsCommon from '../../fractionsCommon.js';
import FractionsCommonStrings from '../../FractionsCommonStrings.js';
import RoundNumberSpinner from './RoundNumberSpinner.js';

const representationMaxString = FractionsCommonStrings.representationMax;

class MaxNode extends VBox {
  /**
   * @param {Property.<number>} containerCountProperty
   * @param {Object} [options]
   */
  constructor( containerCountProperty, options ) {
    super();

    options = merge( {
      spacing: 5
    }, options );

    const maxText = new Text( representationMaxString, {
      font: new PhetFont( 24 ),
      maxWidth: 100
    } );
    const readoutText = new Text( '', { font: new PhetFont( 34 ) } );

    // Figure out what the largest bounds are for the readout
    const maxReadoutBounds = Bounds2.NOTHING.copy();
    for ( let n = 1; n <= containerCountProperty.range.max; n++ ) {
      readoutText.string = n;
      maxReadoutBounds.includeBounds( readoutText.bounds );
    }

    // Now update the readout text
    containerCountProperty.link( count => {
      readoutText.string = count;
    } );

    this.children = [
      maxText,
      new HBox( {
        spacing: 5,
        children: [
          new AlignBox( readoutText, {
            alignBounds: maxReadoutBounds
          } ),
          new RoundNumberSpinner(
            containerCountProperty,
            new DerivedProperty( [ containerCountProperty ], value => value < containerCountProperty.range.max ),
            new DerivedProperty( [ containerCountProperty ], value => value > containerCountProperty.range.min )
          )
        ]
      } )
    ];

    this.mutate( options );
  }
}

fractionsCommon.register( 'MaxNode', MaxNode );
export default MaxNode;