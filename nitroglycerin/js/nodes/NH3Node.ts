// Copyright 2013-2022, University of Colorado Boulder

/**
 * NH3 Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { combineOptions, EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import AtomNode, { AtomNodeOptions } from './AtomNode.js';
import MoleculeNode, { MoleculeNodeOptions } from './MoleculeNode.js';

type SelfOptions = EmptySelfOptions;
export type NH3NodeOptions = SelfOptions & MoleculeNodeOptions;

export default class NH3Node extends MoleculeNode {

  public constructor( providedOptions?: NH3NodeOptions ) {

    const atomNodeOptions = providedOptions?.atomNodeOptions;

    // atoms
    const bigNode = new AtomNode( Element.N, atomNodeOptions );
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

nitroglycerin.register( 'NH3Node', NH3Node );