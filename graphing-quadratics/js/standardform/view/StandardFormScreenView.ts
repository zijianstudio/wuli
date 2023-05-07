// Copyright 2014-2023, University of Colorado Boulder

/**
 * View for the 'Standard Form' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import GQScreenView from '../../common/view/GQScreenView.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import StandardFormModel from '../model/StandardFormModel.js';
import StandardFormEquationAccordionBox from './StandardFormEquationAccordionBox.js';
import StandardFormGraphControlPanel from './StandardFormGraphControlPanel.js';
import StandardFormGraphNode from './StandardFormGraphNode.js';
import StandardFormViewProperties from './StandardFormViewProperties.js';

export default class StandardFormScreenView extends GQScreenView {

  public constructor( model: StandardFormModel, tandem: Tandem ) {

    const viewProperties = new StandardFormViewProperties( tandem.createTandem( 'viewProperties' ) );

    super( model,
      viewProperties,
      new StandardFormGraphNode( model, viewProperties, tandem ),
      new StandardFormEquationAccordionBox( model, {
        expandedProperty: viewProperties.equationAccordionBoxExpandedProperty,
        tandem: tandem.createTandem( 'equationAccordionBox' )
      } ),
      new StandardFormGraphControlPanel( viewProperties, tandem.createTandem( 'graphControlPanel' ) ),
      tandem
    );
  }
}

graphingQuadratics.register( 'StandardFormScreenView', StandardFormScreenView );