// Copyright 2018-2023, University of Colorado Boulder

/**
 * Displays '(x, y)' coordinates.  If the coordinates are null, this displays '(?, ?)'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import BackgroundNode, { BackgroundNodeOptions } from '../../../../scenery-phet/js/BackgroundNode.js';
import { TColor, Text } from '../../../../scenery/js/imports.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GraphingQuadraticsStrings from '../../GraphingQuadraticsStrings.js';
import GQConstants from '../GQConstants.js';

type SelfOptions = {
  decimals: number;
  foregroundColor: TColor;
  backgroundColor: TColor;
};

type CoordinatesNodeOptions = SelfOptions &
  PickRequired<BackgroundNodeOptions, 'visibleProperty' | 'tandem' | 'phetioDocumentation'>;

export default class CoordinatesNode extends BackgroundNode {

  public constructor( coordinatesProperty: TReadOnlyProperty<Vector2 | null>, providedOptions: CoordinatesNodeOptions ) {

    const options = optionize<CoordinatesNodeOptions, SelfOptions, BackgroundNodeOptions>()( {

      // BackgroundNodeOptions
      xMargin: 4,
      yMargin: 2,
      rectangleOptions: {
        cornerRadius: 4,
        fill: providedOptions.backgroundColor
      },
      maxWidth: 100 // determined empirically
    }, providedOptions );

    const stringProperty = new DerivedProperty(
      [ coordinatesProperty, GraphingQuadraticsStrings.coordinateUnknownStringProperty ],
      ( coordinates, coordinateUnknownString ) => {
        const x = coordinates ? Utils.toFixedNumber( coordinates.x, options.decimals ) : coordinateUnknownString;
        const y = coordinates ? Utils.toFixedNumber( coordinates.y, options.decimals ) : coordinateUnknownString;
        return `(${x}, ${y})`;
      } );

    const text = new Text( stringProperty, {
      font: GQConstants.COORDINATES_FONT,
      fill: options.foregroundColor
    } );

    super( text, options );
  }
}

graphingQuadratics.register( 'CoordinatesNode', CoordinatesNode );