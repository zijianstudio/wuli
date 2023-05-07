// Copyright 2013-2023, University of Colorado Boulder

/**
 * Text node that stays synchronized with a dynamic value. This is used in interactive equations,
 * to keep non-interactive parts of the equation synchronized with the model.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text, TextOptions } from '../../../../scenery/js/imports.js';
import graphingLines from '../../graphingLines.js';

type SelfOptions = {
  decimalPlaces?: number;
  absoluteValue?: boolean; // whether to display the absolute value of valueProperty
};

export type DynamicValueNodeOptions = SelfOptions & TextOptions;

export default class DynamicValueNode extends Text {

  private readonly disposeDynamicValueNode: () => void;

  public constructor( valueProperty: TReadOnlyProperty<number>, providedOptions?: DynamicValueNodeOptions ) {

    const options = optionize<DynamicValueNodeOptions, SelfOptions, TextOptions>()( {

      // SelfOptions
      decimalPlaces: 0,
      absoluteValue: false,

      // TextOptions
      fill: 'black',
      font: new PhetFont( 12 )
    }, providedOptions );

    super( '', options );

    const valueObserver = ( value: number ) => {
      this.string = Utils.toFixed( ( options.absoluteValue ) ? Math.abs( value ) : value, options.decimalPlaces );
    };
    valueProperty.link( valueObserver ); // unlink in dispose

    this.disposeDynamicValueNode = () => {
      valueProperty.unlink( valueObserver );
    };
  }

  public override dispose(): void {
    this.disposeDynamicValueNode();
    super.dispose();
  }
}

graphingLines.register( 'DynamicValueNode', DynamicValueNode );