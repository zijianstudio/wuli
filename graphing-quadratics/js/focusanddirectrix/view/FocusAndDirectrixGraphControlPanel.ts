// Copyright 2018-2023, University of Colorado Boulder

/**
 * Panel that contains controls for various features related to the graph on the 'Focus and Directrix' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { HSeparator, VBox } from '../../../../scenery/js/imports.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import GQCheckbox from '../../common/view/GQCheckbox.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import FocusAndDirectrixViewProperties from './FocusAndDirectrixViewProperties.js';

export default class FocusAndDirectrixGraphControlPanel extends Panel {

  public constructor( viewProperties: FocusAndDirectrixViewProperties, tandem: Tandem ) {

    const options = combineOptions<PanelOptions>( {}, GQConstants.PANEL_OPTIONS, {
      tandem: tandem,
      phetioDocumentation: 'panel that contains controls related to the graph'
    } );

    const coordinatesVisibleProperty = viewProperties.coordinatesVisibleProperty!;
    assert && assert( coordinatesVisibleProperty );
    const vertexVisibleProperty = viewProperties.vertexVisibleProperty!;
    assert && assert( vertexVisibleProperty );

    // checkboxes
    const vertexCheckbox = GQCheckbox.createVertexManipulatorCheckbox( vertexVisibleProperty,
      tandem.createTandem( 'vertexCheckbox' ) );
    const focusCheckbox = GQCheckbox.createFocusCheckbox( viewProperties.focusVisibleProperty,
      tandem.createTandem( 'focusCheckbox' ) );
    const directrixCheckbox = GQCheckbox.createDirectrixCheckbox( viewProperties.directrixVisibleProperty,
      tandem.createTandem( 'directrixCheckbox' ) );
    const pointOnParabolaCheckbox = GQCheckbox.createPointOnParabolaCheckbox( viewProperties.pointOnParabolaVisibleProperty,
      tandem.createTandem( 'pointOnParabolaCheckbox' ) );
    const equationsCheckbox = GQCheckbox.createEquationsCheckbox( viewProperties.equationsVisibleProperty,
      tandem.createTandem( 'equationsCheckbox' ) );
    const coordinatesCheckbox = GQCheckbox.createCoordinatesCheckbox( coordinatesVisibleProperty,
      tandem.createTandem( 'coordinatesCheckbox' ) );

    // vertical layout
    const contentNode = new VBox( {
      align: 'left',
      spacing: GQConstants.CHECKBOXES_Y_SPACING,
      children: [
        vertexCheckbox,
        focusCheckbox,
        directrixCheckbox,
        pointOnParabolaCheckbox,
        new HSeparator( { stroke: GQColors.SEPARATOR } ),
        equationsCheckbox,
        coordinatesCheckbox
      ]
    } );

    super( contentNode, options );
  }
}

graphingQuadratics.register( 'FocusAndDirectrixGraphControlPanel', FocusAndDirectrixGraphControlPanel );