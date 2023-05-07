// Copyright 2013-2022, University of Colorado Boulder

/**
 * S Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import HorizontalMoleculeNode, { HorizontalMoleculeNodeOptions } from './HorizontalMoleculeNode.js';

type SelfOptions = EmptySelfOptions;
export type SNodeOptions = SelfOptions & HorizontalMoleculeNodeOptions;

export default class SNode extends HorizontalMoleculeNode {

  public constructor( providedOptions?: SNodeOptions ) {
    super( [ Element.S ], providedOptions );
  }
}

nitroglycerin.register( 'SNode', SNode );