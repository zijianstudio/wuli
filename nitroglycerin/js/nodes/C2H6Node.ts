// Copyright 2013-2022, University of Colorado Boulder

/**
 * C2H6 Molecule
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
export type C2H6NodeOptions = SelfOptions & MoleculeNodeOptions;

export default class C2H6Node extends MoleculeNode {

  public constructor( providedOptions?: C2H6NodeOptions ) {

    const atomNodeOptions = providedOptions?.atomNodeOptions;

    // atoms
    const leftNode = new AtomNode( Element.C, atomNodeOptions );
    const rightNode = new AtomNode( Element.C, merge( {
      centerX: leftNode.right + ( 0.25 * leftNode.width ),
      centerY: leftNode.centerY
    }, atomNodeOptions ) );
    const smallTopLeftNode = new AtomNode( Element.H, merge( {
      centerX: leftNode.centerX,
      centerY: leftNode.top
    }, atomNodeOptions ) );
    const smallBottomLeftNode = new AtomNode( Element.H, merge( {
      centerX: smallTopLeftNode.centerX,
      centerY: leftNode.bottom
    }, atomNodeOptions ) );
    const smallLeftNode = new AtomNode( Element.H, merge( {
      centerX: leftNode.left,
      centerY: leftNode.centerY
    }, atomNodeOptions ) );
    const smallTopRightNode = new AtomNode( Element.H, merge( {
      centerX: rightNode.centerX,
      centerY: rightNode.top
    }, atomNodeOptions ) );
    const smallBottomRightNode = new AtomNode( Element.H, merge( {
      centerX: rightNode.centerX,
      centerY: rightNode.bottom
    }, atomNodeOptions ) );
    const smallRightNode = new AtomNode( Element.H, merge( {
      centerX: rightNode.right,
      centerY: rightNode.centerY
    }, atomNodeOptions ) );

    const atomNodes = [
      smallBottomRightNode, smallTopRightNode, rightNode, smallRightNode,
      smallLeftNode, leftNode, smallBottomLeftNode, smallTopLeftNode
    ];

    super( atomNodes, providedOptions );
  }
}

nitroglycerin.register( 'C2H6Node', C2H6Node );