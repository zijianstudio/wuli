// Copyright 2013-2022, University of Colorado Boulder

/**
 * PH3 Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { combineOptions, EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import AtomNode, { AtomNodeOptions } from './AtomNode.js';
import MoleculeNode, { MoleculeNodeOptions } from './MoleculeNode.js';

type SelfOptions = EmptySelfOptions;
export type PH3NodeOptions = SelfOptions & MoleculeNodeOptions;

export default class PH3Node extends MoleculeNode {

  public constructor( providedOptions?: PH3NodeOptions ) {

    const atomNodeOptions = providedOptions?.atomNodeOptions;

    // atoms
    const bigNode = new AtomNode( Element.P, atomNodeOptions );
    const smallLeftNode = new AtomNode( Element.H, combineOptions<AtomNodeOptions>( {
      centerX: bigNode.left,
      centerY: bigNode.bottom - ( 0.25 * bigNode.height )
    }, atomNodeOptions ) );
    const smallRightNode = new AtomNode( Element.H, combineOptions<AtomNodeOptions>( {
      centerX: bigNode.right,
      centerY: smallLeftNode.centerY
    }, atomNodeOptions ) );
    const smallBottomNode = new AtomNode( Element.H, combineOptions<AtomNodeOptions>( {
      centerX: bigNode.centerX,
      centerY: bigNode.bottom
    }, atomNodeOptions ) );

    const atomNodes = [ smallLeftNode, smallRightNode, bigNode, smallBottomNode ];

    super( atomNodes, providedOptions );
  }
}

nitroglycerin.register( 'PH3Node', PH3Node );