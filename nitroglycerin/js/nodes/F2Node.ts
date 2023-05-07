// Copyright 2013-2022, University of Colorado Boulder

/**
 * F2 Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import HorizontalMoleculeNode, { HorizontalMoleculeNodeOptions } from './HorizontalMoleculeNode.js';

type SelfOptions = EmptySelfOptions;
export type F2NodeOptions = SelfOptions & HorizontalMoleculeNodeOptions;

export default class F2Node extends HorizontalMoleculeNode {

  public constructor( providedOptions?: F2NodeOptions ) {
    super( [ Element.F, Element.F ], providedOptions );
  }
}

nitroglycerin.register( 'F2Node', F2Node );