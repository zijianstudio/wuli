// Copyright 2013-2022, University of Colorado Boulder

/**
 * CH4 Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../phet-core/js/merge.js';
import { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import AtomNode from './AtomNode.js';
import MoleculeNode, { MoleculeNodeOptions } from './MoleculeNode.js';

type SelfOptions = EmptySelfOptions;
export type CH4NodeOptions = SelfOptions & MoleculeNodeOptions;

export default class CH4Node extends MoleculeNode {

  public constructor( providedOptions?: CH4NodeOptions ) {

    const atomNodeOptions = providedOptions?.atomNodeOptions;

    // atoms
    const bigNode = new AtomNode( Element.C, atomNodeOptions );
    const smallOffset = 0.165 * bigNode.width;
    const smallTopLeftNode = new AtomNode( Element.H, merge( {
      centerX: bigNode.left + smallOffset,
      centerY: bigNode.top + smallOffset
    }, atomNodeOptions ) );
    const smallTopRightNode = new AtomNode( Element.H, merge( {
      centerX: bigNode.right - smallOffset,
      centerY: smallTopLeftNode.centerY
    }, atomNodeOptions ) );
    const smallBottomLeftNode = new AtomNode( Element.H, merge( {
      centerX: smallTopLeftNode.centerX,
      centerY: bigNode.bottom - smallOffset
    }, atomNodeOptions ) );
    const smallBottomRightNode = new AtomNode( Element.H, merge( {
      centerX: smallTopRightNode.centerX,
      centerY: smallBottomLeftNode.centerY
    }, atomNodeOptions ) );

    const atomNodes = [ smallTopRightNode, smallBottomLeftNode, bigNode, smallTopLeftNode, smallBottomRightNode ];

    super( atomNodes, providedOptions );
  }
}

nitroglycerin.register( 'CH4Node', CH4Node );