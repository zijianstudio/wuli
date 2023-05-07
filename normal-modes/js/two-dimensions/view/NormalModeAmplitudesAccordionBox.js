// Copyright 2020-2022, University of Colorado Boulder

/**
 * NormalModeAmplitudesAccordionBox is the accordion box titled 'Normal Mode Amplitudes'. It displays an NxN grid.
 *
 * @author Franco Barpp Gomes (UTFPR)
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color, HBox, Rectangle, Text } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import AmplitudeDirection from '../../common/model/AmplitudeDirection.js';
import NormalModesConstants from '../../common/NormalModesConstants.js';
import AmplitudeDirectionRadioButtonGroup from '../../common/view/AmplitudeDirectionRadioButtonGroup.js';
import normalModes from '../../normalModes.js';
import NormalModesStrings from '../../NormalModesStrings.js';
import AmplitudeSelectorRectangle from './AmplitudeSelectorRectangle.js';

const normalModeAmplitudesString = NormalModesStrings.normalModeAmplitudes;

// constants
const PANEL_REAL_SIZE = 270;
const RECT_GRID_UNITS = 5;
const PADDING_GRID_UNITS = 1;

class NormalModeAmplitudesAccordionBox extends AccordionBox {

  /**
   * @param {TwoDimensionsModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    options = merge( {
      resize: true,
      cornerRadius: 5,
      contentXMargin: 8,
      contentYSpacing: 2,
      buttonXMargin: 6,
      buttonYMargin: 10,
      titleXSpacing: 10,
      titleAlignX: 'left',
      expandCollapseButtonOptions: {
        sideLength: 22,
        touchAreaXDilation: 6,
        touchAreaYDilation: 6
      },

      titleNode: new Text( normalModeAmplitudesString, { font: NormalModesConstants.CONTROL_FONT } )
    }, options );

    const amplitudeDirectionRadioButtonGroup = new AmplitudeDirectionRadioButtonGroup( model.amplitudeDirectionProperty );

    // dispose is unnecessary, exists for the lifetime of the sim
    const axisAmplitudesProperty = new DerivedProperty( [ model.amplitudeDirectionProperty ],
      amplitudeDirection => {
        return ( amplitudeDirection === AmplitudeDirection.VERTICAL )
               ? model.modeYAmplitudeProperties
               : model.modeXAmplitudeProperties;
      } );

    // dispose is unnecessary, exists for the lifetime of the sim
    const gridToRealSizeRatioProperty = new DerivedProperty( [ model.numberOfMassesProperty ], numberOfMasses => {
      return PANEL_REAL_SIZE / ( RECT_GRID_UNITS * numberOfMasses + PADDING_GRID_UNITS * ( numberOfMasses - 1 ) );
    } );

    const selectorRectanglesLength = NormalModesConstants.MAX_MASSES_PER_ROW ** 2;
    const selectorRectangles = new Array( selectorRectanglesLength );

    const selectorRectangleOptions = {
      rectGridSize: RECT_GRID_UNITS,
      paddingGridSize: PADDING_GRID_UNITS,
      backgroundRect: {
        fill: Color.toColor( options.fill ).colorUtilsBrighter( 0.6 )
      }
    };

    for ( let i = 0; i < selectorRectanglesLength; i++ ) {
      const row = Math.trunc( i / NormalModesConstants.MAX_MASSES_PER_ROW );
      const col = i % NormalModesConstants.MAX_MASSES_PER_ROW;

      selectorRectangles[ i ] = new AmplitudeSelectorRectangle( model, row, col, axisAmplitudesProperty,
        model.maxAmplitudeProperty, gridToRealSizeRatioProperty, selectorRectangleOptions );
    }

    const selectorBox = new Rectangle( {
      children: selectorRectangles,
      rectHeight: PANEL_REAL_SIZE,
      rectWidth: PANEL_REAL_SIZE
    } );

    const contentNode = new HBox( {
      spacing: 8,
      align: 'center',
      children: [ amplitudeDirectionRadioButtonGroup, selectorBox ]
    } );

    super( contentNode, options );
  }
}

normalModes.register( 'NormalModeAmplitudesAccordionBox', NormalModeAmplitudesAccordionBox );
export default NormalModeAmplitudesAccordionBox;