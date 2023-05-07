// Copyright 2013-2022, University of Colorado Boulder

/**
 * HCl Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import HorizontalMoleculeNode, { HorizontalMoleculeNodeOptions } from './HorizontalMoleculeNode.js';

type SelfOptions = EmptySelfOptions;
export type HClNodeOptions = SelfOptions & StrictOmit<HorizontalMoleculeNodeOptions, 'direction' | 'overlapPercent'>;

class HClNode extends HorizontalMoleculeNode {

  public constructor( providedOptions?: HClNodeOptions ) {

    const options = optionize<HClNodeOptions, SelfOptions, HorizontalMoleculeNodeOptions>()( {
      direction: 'rightToLeft',
      overlapPercent: 0.5
    }, providedOptions );

    super( [ Element.Cl, Element.H ], options );
  }
}

nitroglycerin.register( 'HClNode', HClNode );
export default HClNode;