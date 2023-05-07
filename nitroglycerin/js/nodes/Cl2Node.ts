// Copyright 2013-2022, University of Colorado Boulder

/**
 * Cl2 Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import HorizontalMoleculeNode, { HorizontalMoleculeNodeOptions } from './HorizontalMoleculeNode.js';

type SelfOptions = EmptySelfOptions;
export type Cl2NodeOptions = SelfOptions & HorizontalMoleculeNodeOptions;

export default class Cl2Node extends HorizontalMoleculeNode {

  public constructor( providedOptions?: Cl2NodeOptions ) {
    super( [ Element.Cl, Element.Cl ], providedOptions );
  }
}

nitroglycerin.register( 'Cl2Node', Cl2Node );