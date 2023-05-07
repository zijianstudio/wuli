// Copyright 2013-2022, University of Colorado Boulder

/**
 * C Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import HorizontalMoleculeNode, { HorizontalMoleculeNodeOptions } from './HorizontalMoleculeNode.js';

type SelfOptions = EmptySelfOptions;
export type CNodeOptions = SelfOptions & HorizontalMoleculeNodeOptions;

export default class CNode extends HorizontalMoleculeNode {

  public constructor( providedOptions?: CNodeOptions ) {
    super( [ Element.C ], providedOptions );
  }
}

nitroglycerin.register( 'CNode', CNode );