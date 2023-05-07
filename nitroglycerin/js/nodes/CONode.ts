// Copyright 2013-2022, University of Colorado Boulder

/**
 * CO Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import HorizontalMoleculeNode, { HorizontalMoleculeNodeOptions } from './HorizontalMoleculeNode.js';

type SelfOptions = EmptySelfOptions;
export type CONodeOptions = SelfOptions & HorizontalMoleculeNodeOptions;

class CONode extends HorizontalMoleculeNode {

  public constructor( providedOptions?: CONodeOptions ) {
    super( [ Element.C, Element.O ], providedOptions );
  }
}

nitroglycerin.register( 'CONode', CONode );
export default CONode;