// Copyright 2013-2022, University of Colorado Boulder

/**
 * H2O Molecule
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
export type H2ONodeOptions = SelfOptions & MoleculeNodeOptions;

class H2ONode extends MoleculeNode {

  public constructor( providedOptions?: H2ONodeOptions ) {

    const atomNodeOptions = providedOptions?.atomNodeOptions;

    // atoms
    const bigNode = new AtomNode( Element.O, atomNodeOptions );
    const smallLeftNode = new AtomNode( Element.H, merge( {
      centerX: bigNode.left,
      centerY: bigNode.bottom - ( 0.25 * bigNode.height )
    }, atomNodeOptions ) );
    const smallRightNode = new AtomNode( Element.H, merge( {
      centerX: bigNode.right,
      centerY: smallLeftNode.centerY
    }, atomNodeOptions ) );

    const atomNodes = [ bigNode, smallLeftNode, smallRightNode ];

    super( atomNodes, providedOptions );
  }
}

nitroglycerin.register( 'H2ONode', H2ONode );
export default H2ONode;