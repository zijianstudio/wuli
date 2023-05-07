// Copyright 2013-2022, University of Colorado Boulder

/**
 * CS2 Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import HorizontalMoleculeNode, { HorizontalMoleculeNodeOptions } from './HorizontalMoleculeNode.js';

type SelfOptions = EmptySelfOptions;
export type CS2NodeOptions = SelfOptions & HorizontalMoleculeNodeOptions;

export default class CS2Node extends HorizontalMoleculeNode {

  public constructor( providedOptions?: CS2NodeOptions ) {
    super( [ Element.S, Element.C, Element.S ], providedOptions );
  }
}

nitroglycerin.register( 'CS2Node', CS2Node );