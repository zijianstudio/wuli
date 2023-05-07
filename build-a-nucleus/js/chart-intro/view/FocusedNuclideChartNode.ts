// Copyright 2023, University of Colorado Boulder

/**
 * Node that focuses on current nuclide in NuclideChartNode.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import NuclideChartNode from './NuclideChartNode.js';
import buildANucleus from '../../buildANucleus.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import BANConstants from '../../common/BANConstants.js';
import Property from '../../../../axon/js/Property.js';
import { Color, Rectangle } from '../../../../scenery/js/imports.js';
import Multilink from '../../../../axon/js/Multilink.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Vector2 from '../../../../dot/js/Vector2.js';

const HIGHLIGHT_RECTANGLE_LINE_WIDTH = 1.5;

class FocusedNuclideChartNode extends NuclideChartNode {

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      chartTransform: ChartTransform ) {
    super( protonCountProperty, neutronCountProperty, chartTransform, { cellTextFontSize: 6, arrowSymbol: false } );

    // keep track of the current center of the highlight rectangle
    const viewHighlightRectangleCenterProperty = new Property(
      chartTransform.modelToViewXY( 1 + BANConstants.X_SHIFT_HIGHLIGHT_RECTANGLE, 1 + BANConstants.Y_SHIFT_HIGHLIGHT_RECTANGLE ) );
    const nuclideChartBounds = this.bounds.copy();
    const backgroundRectangle = new Rectangle( this.bounds.dilated( 2 ), { stroke: 'white' } );

    // create and add a box around current nuclide
    const squareLength = chartTransform.modelToViewDeltaX( 5 );
    const highlightRectangle = new Rectangle( 0, 0,
      squareLength, squareLength, { stroke: Color.BLACK, lineWidth: HIGHLIGHT_RECTANGLE_LINE_WIDTH } );
    this.addChild( highlightRectangle );

    // update the box position to current nuclide
    Multilink.multilink( [ protonCountProperty, neutronCountProperty ], ( protonCount, neutronCount ) => {
      const cellX = neutronCount;
      const cellY = protonCount;
      if ( AtomIdentifier.doesExist( protonCount, neutronCount ) ) {

        // constrain the bounds of the highlightRectangle
        const constrainedCenter = chartTransform.modelToViewXY( cellX + BANConstants.X_SHIFT_HIGHLIGHT_RECTANGLE,
          cellY + BANConstants.Y_SHIFT_HIGHLIGHT_RECTANGLE );
        viewHighlightRectangleCenterProperty.value = new Vector2( constrainedCenter.x, constrainedCenter.y );
      }
    } );

    this.addChild( backgroundRectangle );
    const updateHighlightRectangleCenter = () => {
      highlightRectangle.center = viewHighlightRectangleCenterProperty.value;
      if ( highlightRectangle.left < nuclideChartBounds.left ) {
        highlightRectangle.left = nuclideChartBounds.left - ( HIGHLIGHT_RECTANGLE_LINE_WIDTH - BANConstants.NUCLIDE_CHART_CELL_LINE_WIDTH ) / 2;
      }
      if ( highlightRectangle.right > nuclideChartBounds.right ) {

        highlightRectangle.right = nuclideChartBounds.right + ( HIGHLIGHT_RECTANGLE_LINE_WIDTH - BANConstants.NUCLIDE_CHART_CELL_LINE_WIDTH ) / 2;
      }
      if ( highlightRectangle.top < nuclideChartBounds.top ) {
        highlightRectangle.top = nuclideChartBounds.top - ( HIGHLIGHT_RECTANGLE_LINE_WIDTH - BANConstants.NUCLIDE_CHART_CELL_LINE_WIDTH ) / 2;
      }
      if ( highlightRectangle.bottom > nuclideChartBounds.bottom ) {
        highlightRectangle.bottom = nuclideChartBounds.bottom + ( HIGHLIGHT_RECTANGLE_LINE_WIDTH - BANConstants.NUCLIDE_CHART_CELL_LINE_WIDTH ) / 2;
      }

      // make opaque any cells too far away from the center of the highlight rectangle
      this.cells.forEach( nuclideChartCellRow => {
        nuclideChartCellRow.forEach( nuclideChartCell => {
          if ( nuclideChartCell ) {
            const protonDelta = Math.abs( chartTransform.viewToModelY( highlightRectangle.center.y )
                                          - BANConstants.Y_SHIFT_HIGHLIGHT_RECTANGLE - nuclideChartCell?.protonNumber );
            const neutronDelta = Math.abs( chartTransform.viewToModelX( highlightRectangle.center.x )
                                           - BANConstants.X_SHIFT_HIGHLIGHT_RECTANGLE - nuclideChartCell?.neutronNumber );
            nuclideChartCell?.makeOpaque( protonDelta, neutronDelta );
          }
        } );
      } );
    };

    // update the center of the highLightRectangle
    viewHighlightRectangleCenterProperty.link( updateHighlightRectangleCenter );
  }
}

buildANucleus.register( 'FocusedNuclideChartNode', FocusedNuclideChartNode );
export default FocusedNuclideChartNode;