// Copyright 2013-2022, University of Colorado Boulder

/**
 * Displays a volume value, with an left-pointing arrow to the left of the value.
 * The origin is at the tip of the arrowhead.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, NodeOptions, Path, Text } from '../../../../scenery/js/imports.js';
import phScale from '../../phScale.js';
import PhScaleStrings from '../../PhScaleStrings.js';
import Beaker from '../model/Beaker.js';
import PHScaleConstants from '../PHScaleConstants.js';

// constants
const ARROW_SIZE = new Dimension2( 21, 28 );
const VALUE_FONT = new PhetFont( { size: 24, weight: 'bold' } );

type SelfOptions = EmptySelfOptions;

type VolumeIndicatorNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'>;

export default class VolumeIndicatorNode extends Node {

  public constructor( totalVolumeProperty: TReadOnlyProperty<number>,
                      beaker: Beaker,
                      modelViewTransform: ModelViewTransform2,
                      providedOptions: VolumeIndicatorNodeOptions ) {

    const options = optionize<VolumeIndicatorNodeOptions, SelfOptions, NodeOptions>()( {

      // NodeOptions
      phetioDocumentation: 'indicates the volume of the solution in the beaker'
    }, providedOptions );

    // arrow head that points to the left
    const arrowHeadShape = new Shape()
      .moveTo( 0, 0 )
      .lineTo( ARROW_SIZE.width, ARROW_SIZE.height / 2 )
      .lineTo( ARROW_SIZE.width, -ARROW_SIZE.height / 2 )
      .close();
    const arrowHead = new Path( arrowHeadShape, { fill: 'black' } );

    const valueStringProperty = new DerivedProperty(
      [ PhScaleStrings.pattern[ '0value' ][ '1unitsStringProperty' ], totalVolumeProperty, PhScaleStrings.units.litersStringProperty ],
      ( pattern, totalVolume, litersString ) =>
        StringUtils.format( pattern, Utils.toFixed( totalVolume, PHScaleConstants.VOLUME_DECIMAL_PLACES ), litersString )
    );

    // volume value
    const valueText = new Text( valueStringProperty, {
      font: VALUE_FONT,
      left: arrowHead.right + 3,
      maxWidth: 75
    } );

    options.children = [ valueText, arrowHead ];

    super( options );

    // x position
    this.left = modelViewTransform.modelToViewX( beaker.right ) + 3;

    valueText.boundsProperty.link( bounds => {
      valueText.centerY = arrowHead.centerY;
    } );

    // update position of the indicator
    totalVolumeProperty.link( totalVolume => {
      const solutionHeight = Utils.linear( 0, beaker.volume, 0, beaker.size.height, totalVolume );
      this.y = modelViewTransform.modelToViewY( beaker.position.y - solutionHeight );
    } );
  }
}

phScale.register( 'VolumeIndicatorNode', VolumeIndicatorNode );