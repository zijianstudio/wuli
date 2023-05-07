// Copyright 2018-2023, University of Colorado Boulder

/**
 * View for the 'Explore' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import GQScreenView from '../../common/view/GQScreenView.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import ExploreModel from '../model/ExploreModel.js';
import ExploreEquationAccordionBox from './ExploreEquationAccordionBox.js';
import ExploreGraphNode from './ExploreGraphNode.js';
import ExploreViewProperties from './ExploreViewProperties.js';
import QuadraticTermsAccordionBox from './QuadraticTermsAccordionBox.js';

export default class ExploreScreenView extends GQScreenView {

  public constructor( model: ExploreModel, tandem: Tandem ) {

    const viewProperties = new ExploreViewProperties( tandem.createTandem( 'viewProperties' ) );

    super( model,
      viewProperties,
      new ExploreGraphNode( model, viewProperties ), // do not instrument for PhET-iO
      new ExploreEquationAccordionBox( model, {
        expandedProperty: viewProperties.equationAccordionBoxExpandedProperty,
        tandem: tandem.createTandem( 'equationAccordionBox' )
      } ),
      new QuadraticTermsAccordionBox( viewProperties, {
        expandedProperty: viewProperties.quadraticTermsAccordionBoxExpandedProperty,
        tandem: tandem.createTandem( 'quadraticTermsAccordionBox' )
      } ),
      tandem
    );
  }
}

graphingQuadratics.register( 'ExploreScreenView', ExploreScreenView );