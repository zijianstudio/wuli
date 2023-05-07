// Copyright 2013-2022, University of Colorado Boulder

/**
 * O2 Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import HorizontalMoleculeNode, { HorizontalMoleculeNodeOptions } from './HorizontalMoleculeNode.js';

type SelfOptions = EmptySelfOptions;
export type O2NodeOptions = SelfOptions & HorizontalMoleculeNodeOptions;

export default class O2Node extends HorizontalMoleculeNode {

  public constructor( providedOptions?: O2NodeOptions ) {
    super( [ Element.O, Element.O ], providedOptions );
  }
}

nitroglycerin.register( 'O2Node', O2Node );