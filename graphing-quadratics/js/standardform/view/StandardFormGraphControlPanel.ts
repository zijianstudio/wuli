// Copyright 2018-2023, University of Colorado Boulder

/**
 * Panel that contains controls for various features related to the graph on the 'Standard Form' screen.
 *
 * @author Andrea Lin
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
import StandardFormViewProperties from './StandardFormViewProperties.js';

export default class StandardFormGraphControlPanel extends Panel {

  public constructor( viewProperties: StandardFormViewProperties, tandem: Tandem ) {

    const options = combineOptions<PanelOptions>( {}, GQConstants.PANEL_OPTIONS, {
      tandem: tandem,
      phetioDocumentation: 'panel that contains controls related to the graph'
    } );

    const axisOfSymmetryVisibleProperty = viewProperties.axisOfSymmetryVisibleProperty!;
    assert && assert( axisOfSymmetryVisibleProperty );
    const coordinatesVisibleProperty = viewProperties.coordinatesVisibleProperty!;
    assert && assert( coordinatesVisibleProperty );
    const vertexVisibleProperty = viewProperties.vertexVisibleProperty!;
    assert && assert( vertexVisibleProperty );

    // checkboxes
    const vertexCheckbox = GQCheckbox.createVertexPointCheckbox( vertexVisibleProperty,
      tandem.createTandem( 'vertexCheckbox' ) );
    const axisOfSymmetryCheckbox = GQCheckbox.createAxisOfSymmetryCheckbox(
      axisOfSymmetryVisibleProperty, tandem.createTandem( 'axisOfSymmetryCheckbox' ) );
    const rootsCheckbox = GQCheckbox.createRootsCheckbox( viewProperties.rootsVisibleProperty,
      tandem.createTandem( 'rootsCheckbox' ) );
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
        axisOfSymmetryCheckbox,
        rootsCheckbox,
        new HSeparator( { stroke: GQColors.SEPARATOR } ),
        equationsCheckbox,
        coordinatesCheckbox
      ]
    } );

    super( contentNode, options );
  }
}

graphingQuadratics.register( 'StandardFormGraphControlPanel', StandardFormGraphControlPanel );