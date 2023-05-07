// Copyright 2020-2022, University of Colorado Boulder

/**
 * NormalModesAccordionBox is the accordion box titled 'Normal Modes'. It shows a plot for each normal mode.
 *
 * @author Franco Barpp Gomes (UTFPR)
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import merge from '../../../../phet-core/js/merge.js';
import { HBox, HStrut, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import NormalModesConstants from '../../common/NormalModesConstants.js';
import normalModes from '../../normalModes.js';
import NormalModesStrings from '../../NormalModesStrings.js';
import ModeGraphCanvasNode from './ModeGraphCanvasNode.js';

const normalModesTitleString = NormalModesStrings[ 'normal-modes' ].title;

class NormalModesAccordionBox extends AccordionBox {

  /**
   * @param {OneDimensionModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    // from Vector Addition
    const PANEL_CORNER_RADIUS = 5;
    const PANEL_X_MARGIN = 7;
    const PANEL_Y_MARGIN = 8;

    const titleNode = new Text( normalModesTitleString, { font: NormalModesConstants.CONTROL_FONT } );

    options = merge( {
      resize: true,

      cornerRadius: PANEL_CORNER_RADIUS,
      contentXMargin: 15,
      contentYMargin: PANEL_Y_MARGIN,
      contentXSpacing: PANEL_X_MARGIN,
      contentYSpacing: 1,
      buttonXMargin: PANEL_X_MARGIN,
      buttonYMargin: PANEL_Y_MARGIN,
      titleYMargin: PANEL_Y_MARGIN,
      titleXMargin: PANEL_X_MARGIN,
      titleXSpacing: PANEL_X_MARGIN,
      titleAlignX: 'center',
      expandCollapseButtonOptions: {
        sideLength: 18,
        touchAreaXDilation: 6,
        touchAreaYDilation: 6
      },

      titleNode: titleNode,
      showTitleWhenExpanded: true

    }, options );

    const normalModeGraphs = new Array( NormalModesConstants.MAX_MASSES_PER_ROW );
    const normalModeGraphsAndNumbers = new Array( NormalModesConstants.MAX_MASSES_PER_ROW );

    for ( let i = 0; i < normalModeGraphs.length; i++ ) {
      normalModeGraphs[ i ] = new ModeGraphCanvasNode( model, i );
      const normalModeNumber = new Text( i + 1, { font: NormalModesConstants.MODE_NUMBER_FONT } );
      normalModeGraphsAndNumbers[ i ] = new HBox( {
        spacing: 7,
        children: [ normalModeNumber, normalModeGraphs[ i ] ]
      } );

      // dispose is unnecessary, exists for the lifetime of the sim
      Multilink.multilink(
        [ model.timeProperty, model.modeAmplitudeProperties[ i ], model.modePhaseProperties[ i ] ],
        ( time, amplitude, phase ) => {
          normalModeGraphs[ i ].update();
        } );
    }

    const avoidResize = new HStrut( normalModeGraphsAndNumbers[ normalModeGraphsAndNumbers.length - 1 ].width );

    const graphContainer = new VBox( {
      spacing: 9,
      align: 'right',
      children: normalModeGraphsAndNumbers
    } );

    super( graphContainer, options );

    // dispose is unnecessary, exists for the lifetime of the sim
    model.numberOfMassesProperty.link( numberOfMasses => {
      graphContainer.children = normalModeGraphsAndNumbers.slice( 0, numberOfMasses );
      graphContainer.addChild( avoidResize );
      normalModeGraphs.forEach( graph => graph.update() );
      this.layout();
    } );
  }
}

normalModes.register( 'NormalModesAccordionBox', NormalModesAccordionBox );
export default NormalModesAccordionBox;