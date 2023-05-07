// Copyright 2013-2022, University of Colorado Boulder

/**
 * C2H2 Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import HorizontalMoleculeNode, { HorizontalMoleculeNodeOptions } from './HorizontalMoleculeNode.js';

type SelfOptions = EmptySelfOptions;
export type C2H2NodeOptions = SelfOptions & StrictOmit<HorizontalMoleculeNodeOptions, 'overlapPercent'>;

export default class C2H2Node extends HorizontalMoleculeNode {

  public constructor( providedOptions?: C2H2NodeOptions ) {
    super(
      [ Element.H, Element.C, Element.C, Element.H ],
      optionize<C2H2NodeOptions, SelfOptions, HorizontalMoleculeNodeOptions>()( {
        overlapPercent: 0.35
      }, providedOptions )
    );
  }
}

nitroglycerin.register( 'C2H2Node', C2H2Node );