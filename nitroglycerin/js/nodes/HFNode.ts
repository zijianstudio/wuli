// Copyright 2013-2022, University of Colorado Boulder

/**
 * HF Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import HorizontalMoleculeNode, { HorizontalMoleculeNodeOptions } from './HorizontalMoleculeNode.js';

type SelfOptions = EmptySelfOptions;
export type HFNodeOptions = SelfOptions & StrictOmit<HorizontalMoleculeNodeOptions, 'direction' | 'overlapPercent'>;

export default class HFNode extends HorizontalMoleculeNode {

  public constructor( providedOptions?: HFNodeOptions ) {

    const options = optionize<HFNodeOptions, SelfOptions, HorizontalMoleculeNodeOptions>()( {
      direction: 'rightToLeft',
      overlapPercent: 0.5
    }, providedOptions );

    super( [ Element.F, Element.H ], options );
  }
}

nitroglycerin.register( 'HFNode', HFNode );