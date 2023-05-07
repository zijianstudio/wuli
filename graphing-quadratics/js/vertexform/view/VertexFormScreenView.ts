// Copyright 2014-2023, University of Colorado Boulder

/**
 * View for the 'Vertex Form' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import GQScreenView from '../../common/view/GQScreenView.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import VertexFormModel from '../model/VertexFormModel.js';
import VertexFormEquationAccordionBox from './VertexFormEquationAccordionBox.js';
import VertexFormGraphControlPanel from './VertexFormGraphControlPanel.js';
import VertexFormGraphNode from './VertexFormGraphNode.js';
import VertexFormViewProperties from './VertexFormViewProperties.js';

export default class VertexFormScreenView extends GQScreenView {

  public constructor( model: VertexFormModel, tandem: Tandem ) {

    const viewProperties = new VertexFormViewProperties( tandem.createTandem( 'viewProperties' ) );

    super( model,
      viewProperties,
      new VertexFormGraphNode( model, viewProperties, tandem ),
      new VertexFormEquationAccordionBox( model, {
        expandedProperty: viewProperties.equationAccordionBoxExpandedProperty,
        tandem: tandem.createTandem( 'equationAccordionBox' )
      } ),
      new VertexFormGraphControlPanel( viewProperties, tandem.createTandem( 'graphControlPanel' ) ),
      tandem
    );
  }
}

graphingQuadratics.register( 'VertexFormScreenView', VertexFormScreenView );