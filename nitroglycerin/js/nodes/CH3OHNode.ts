// Copyright 2013-2022, University of Colorado Boulder

/**
 * CH3OH Molecule
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
export type CH3OHNodeOptions = SelfOptions & MoleculeNodeOptions;

export default class CH3OHNode extends MoleculeNode {

  public constructor( providedOptions?: CH3OHNodeOptions ) {

    const atomNodeOptions = providedOptions?.atomNodeOptions;

    // atoms
    const leftNode = new AtomNode( Element.C, atomNodeOptions );
    const smallTopNode = new AtomNode( Element.H, merge( {
      centerX: leftNode.centerX,
      centerY: leftNode.top
    }, atomNodeOptions ) );
    const smallBottomNode = new AtomNode( Element.H, merge( {
      centerX: smallTopNode.centerX,
      centerY: leftNode.bottom
    }, atomNodeOptions ) );
    const smallLeftNode = new AtomNode( Element.H, merge( {
      centerX: leftNode.left,
      centerY: leftNode.centerY
    }, atomNodeOptions ) );
    const rightNode = new AtomNode( Element.O, merge( {
      centerX: leftNode.right + ( 0.25 * leftNode.width ),
      centerY: leftNode.centerY
    }, atomNodeOptions ) );
    const smallRightNode = new AtomNode( Element.H, merge( {
      centerX: rightNode.right,
      centerY: rightNode.centerY
    }, atomNodeOptions ) );

    const atomNodes = [ smallBottomNode, smallTopNode, leftNode, smallLeftNode, smallRightNode, rightNode ];

    super( atomNodes, providedOptions );
  }
}

nitroglycerin.register( 'CH3OHNode', CH3OHNode );