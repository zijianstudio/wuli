// Copyright 2023, University of Colorado Boulder

/**
 * Node that represents a single cell in the nuclide chart.
 *
 * @author Luisa Vargas
 */

import { Text, Color, Rectangle, RectangleOptions } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import DecayType from '../../common/view/DecayType.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BANConstants from '../../common/BANConstants.js';

type SelfOptions = {
  cellTextFontSize: number;
};

type NuclideChartCellOptions = SelfOptions & RectangleOptions;

class NuclideChartCell extends Rectangle {

  private readonly labelText: Text;
  public readonly protonNumber: number;
  public readonly neutronNumber: number;
  public readonly decayType: string;

  public constructor( cellLength: number, elementSymbol: string, protonNumber: number, neutronNumber: number,
                      decayType: string, providedOptions: NuclideChartCellOptions ) {

    const options = optionize<NuclideChartCellOptions, SelfOptions, RectangleOptions>()( {
      stroke: Color.GRAY,
      lineWidth: BANConstants.NUCLIDE_CHART_CELL_LINE_WIDTH,
      fill: Color.GRAY
    }, providedOptions );

    super( 0, 0, cellLength, cellLength, 0, 0, options );

    // labels the cell with the elementSymbol
    this.labelText = new Text( elementSymbol, {
      fontSize: options.cellTextFontSize,
      center: this.center,
      fill: options.fill === DecayType.ALPHA_DECAY.colorProperty.value ||
            options.fill === DecayType.BETA_MINUS_DECAY.colorProperty.value ?
            Color.BLACK : Color.WHITE,
      maxWidth: cellLength * 0.75
    } );
    this.labelText.visible = false;
    this.addChild( this.labelText );

    this.protonNumber = protonNumber;
    this.neutronNumber = neutronNumber;
    this.decayType = decayType;
  }

  // show the label text when highlighting the cell
  public setHighlighted( highlighted: boolean ): void {
    this.labelText.visible = highlighted;
  }

  // make cell more opaque to de-emphasize the cell
  public makeOpaque( protonDelta: number, neutronDelta: number ): void {
    this.opacity = protonDelta > 2 || neutronDelta > 2 ? 0.65 : 1;
  }
}

buildANucleus.register( 'NuclideChartCell', NuclideChartCell );
export default NuclideChartCell;