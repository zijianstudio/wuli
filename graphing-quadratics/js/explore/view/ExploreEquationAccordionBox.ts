// Copyright 2018-2023, University of Colorado Boulder

/**
 * Equation accordion box in the 'Explore' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import GQEquationAccordionBox, { GQEquationAccordionBoxOptions } from '../../common/view/GQEquationAccordionBox.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import StandardFormEquationNode from '../../standardform/view/StandardFormEquationNode.js';
import ExploreInteractiveEquationNode from './ExploreInteractiveEquationNode.js';
import ExploreModel from '../model/ExploreModel.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';

type SelfOptions = EmptySelfOptions;

type ExploreEquationAccordionBoxOptions = SelfOptions &
  PickRequired<GQEquationAccordionBoxOptions, 'tandem' | 'expandedProperty'>;

export default class ExploreEquationAccordionBox extends GQEquationAccordionBox {

  public constructor( model: ExploreModel, providedOptions: ExploreEquationAccordionBoxOptions ) {

    const options = optionize<ExploreEquationAccordionBoxOptions, SelfOptions, GQEquationAccordionBoxOptions>()( {

      // GQEquationAccordionBoxOptions
      titleNode: new StandardFormEquationNode( providedOptions.tandem.createTandem( 'titleNode' ) )
    }, providedOptions );

    const interactiveEquationNode = new ExploreInteractiveEquationNode(
      model.aProperty, model.bProperty, model.cProperty, {
        tandem: options.tandem.createTandem( 'interactiveEquationNode' ),
        phetioDocumentation: 'the interactive equation in this accordion box'
      } );

    super( model, interactiveEquationNode, options );
  }
}

graphingQuadratics.register( 'ExploreEquationAccordionBox', ExploreEquationAccordionBox );