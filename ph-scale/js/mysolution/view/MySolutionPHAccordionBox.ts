// Copyright 2022-2023, University of Colorado Boulder

/**
 * MySolutionPHAccordionBox is the pH accordion box (aka meter) for the 'My Solution' screen.
 * It allows the user to change the pH via a spinner.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import PHAccordionBox, { PHAccordionBoxOptions } from '../../common/view/PHAccordionBox.js';
import phScale from '../../phScale.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import Property from '../../../../axon/js/Property.js';
import { PHSpinnerNode } from './PHSpinnerNode.js';

type SelfOptions = EmptySelfOptions;

type MySolutionPHAccordionBoxOptions = SelfOptions & PickRequired<PHAccordionBoxOptions, 'tandem'>;

export default class MySolutionPHAccordionBox extends PHAccordionBox {

  /**
   * @param pHProperty - pH of the solution
   * @param probeYOffset - distance from top of meter to tip of probe, in view coordinate frame
   * @param [providedOptions]
   */
  public constructor( pHProperty: Property<number>, probeYOffset: number, providedOptions: MySolutionPHAccordionBoxOptions ) {

    const contentNode = new PHSpinnerNode( pHProperty, {
      tandem: providedOptions.tandem.createTandem( 'spinner' )
    } );

    super( contentNode, probeYOffset, providedOptions );

    this.addLinkedElement( pHProperty, {
      tandem: providedOptions.tandem.createTandem( pHProperty.tandem.name )
    } );
  }
}

phScale.register( 'MySolutionPHAccordionBox', MySolutionPHAccordionBox );