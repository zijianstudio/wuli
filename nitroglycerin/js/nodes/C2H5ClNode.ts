// Copyright 2013-2022, University of Colorado Boulder

/**
 * C2H5Cl Molecule
 * Structure is similar to C2H6, but with Cl replacing one of the H's.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { combineOptions, EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import AtomNode, { AtomNodeOptions } from './AtomNode.js';
import MoleculeNode, { MoleculeNodeOptions } from './MoleculeNode.js';

type SelfOptions = EmptySelfOptions;
export type C2H5ClNodeOptions = SelfOptions & MoleculeNodeOptions;

export default class C2H5ClNode extends MoleculeNode {

  public constructor( providedOptions?: C2H5ClNodeOptions ) {

    const atomNodeOptions = providedOptions?.atomNodeOptions;

    // atoms
    const leftNode = new AtomNode( Element.C, atomNodeOptions );
    const centerNode = new AtomNode( Element.C, combineOptions<AtomNodeOptions>( {
      centerX: leftNode.right + ( 0.25 * leftNode.width ),
      centerY: leftNode.centerY
    }, atomNodeOptions ) );
    const smallTopLeftNode = new AtomNode( Element.H, combineOptions<AtomNodeOptions>( {
      centerX: leftNode.centerX,
      centerY: leftNode.top
    }, atomNodeOptions ) );
    const smallBottomLeftNode = new AtomNode( Element.H, combineOptions<AtomNodeOptions>( {
      centerX: smallTopLeftNode.centerX,
      centerY: leftNode.bottom
    }, atomNodeOptions ) );
    const smallLeftNode = new AtomNode( Element.H, combineOptions<AtomNodeOptions>( {
      centerX: leftNode.left,
      centerY: leftNode.centerY
    }, atomNodeOptions ) );
    const smallTopRightNode = new AtomNode( Element.H, combineOptions<AtomNodeOptions>( {
      centerX: centerNode.centerX,
      centerY: centerNode.top
    }, atomNodeOptions ) );
    const smallBottomRightNode = new AtomNode( Element.H, combineOptions<AtomNodeOptions>( {
      centerX: centerNode.centerX,
      centerY: centerNode.bottom
    }, atomNodeOptions ) );
    const rightNode = new AtomNode( Element.Cl, combineOptions<AtomNodeOptions>( {
      left: centerNode.centerX + ( 0.11 * leftNode.width ),
      centerY: centerNode.centerY
    }, atomNodeOptions ) );

    const atomNodes = [
      smallBottomRightNode, smallTopRightNode, centerNode, rightNode,
      smallLeftNode, leftNode, smallBottomLeftNode, smallTopLeftNode
    ];

    super( atomNodes, providedOptions );
  }
}

nitroglycerin.register( 'C2H5ClNode', C2H5ClNode );