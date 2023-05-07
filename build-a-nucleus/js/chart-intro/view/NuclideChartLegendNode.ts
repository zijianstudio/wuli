// Copyright 2023, University of Colorado Boulder

/**
 * Node that represents the legend of the nuclide chart, square boxes with different background colors for each decay type.
 *
 * @author Luisa Vargas
 */

import { GridBox, HBox, Node, ProfileColorProperty, Rectangle, RichText } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import BANColors from '../../common/BANColors.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import DecayType from '../../common/view/DecayType.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';

// constants
const LEGEND_FONT = new PhetFont( 12 );
const LEGEND_KEY_BOX_SIZE = 14;

class NuclideChartLegendNode extends Node {

  public constructor() {
    super();

    // create a legend item which consists of a box with the legend color and the string of the decay type to its right
    const createLegendItem = ( decayTypeText: string, decayTypeColor: ProfileColorProperty ): HBox => {
      return new HBox( {
        children: [
          new Rectangle( {
            rectSize: new Dimension2( LEGEND_KEY_BOX_SIZE, LEGEND_KEY_BOX_SIZE ),
            fill: decayTypeColor,
            stroke: BANColors.nuclideChartBorderColorProperty
          } ),
          new RichText( decayTypeText, { font: LEGEND_FONT } )
        ],
        spacing: 5
        // TODO: add maxWidth
      } );
    };

    // to store all legend items
    const decayHBoxes = [];
    const stableHBox = createLegendItem( BuildANucleusStrings.stable, BANColors.stableColorProperty );
    decayHBoxes.push( stableHBox );

    // create the legend item for each decay type in a grid box
    DecayType.enumeration.values.forEach( decayType => {
      decayHBoxes.push( createLegendItem( decayType.label, decayType.colorProperty ) );
    } );
    const legendGridBox = new GridBox( {
      children: decayHBoxes,
      autoColumns: 2,
      ySpacing: 5,
      xSpacing: 80,
      xAlign: 'left'
    } );
    this.addChild( legendGridBox );

  }
}

buildANucleus.register( 'NuclideChartLegendNode', NuclideChartLegendNode );
export default NuclideChartLegendNode;