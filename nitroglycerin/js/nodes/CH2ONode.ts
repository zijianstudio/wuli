// Copyright 2013-2022, University of Colorado Boulder

/**
 * CH2O Molecule
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
export type CH2ONodeOptions = SelfOptions & MoleculeNodeOptions;

export default class CH2ONode extends MoleculeNode {

  public constructor( providedOptions?: CH2ONodeOptions ) {

    const atomNodeOptions = providedOptions?.atomNodeOptions;

    // atoms
    const leftNode = new AtomNode( Element.C, atomNodeOptions );
    const smallOffset = 0.165 * leftNode.width;
    const rightNode = new AtomNode( Element.O, merge( {
      centerX: leftNode.right + ( 0.25 * leftNode.width ),
      centerY: leftNode.centerY
    }, atomNodeOptions ) );
    const smallTopNode = new AtomNode( Element.H, merge( {
      centerX: leftNode.left + smallOffset,
      centerY: leftNode.top + smallOffset
    }, atomNodeOptions ) );
    const smallBottomNode = new AtomNode( Element.H, merge( {
      centerX: smallTopNode.centerX,
      centerY: leftNode.bottom - smallOffset
    }, atomNodeOptions ) );

    const atomNodes = [ smallTopNode, leftNode, rightNode, smallBottomNode ];

    super( atomNodes, providedOptions );
  }
}

nitroglycerin.register( 'CH2ONode', CH2ONode );