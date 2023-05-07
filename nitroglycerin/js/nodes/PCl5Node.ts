// Copyright 2013-2022, University of Colorado Boulder

/**
 * PCl5 Molecule
 * Structure has 2 H's on the vertical axis, and 3 H's arranged in a triangle in the horizontal plane.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { combineOptions, EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import AtomNode, { AtomNodeOptions } from './AtomNode.js';
import MoleculeNode, { MoleculeNodeOptions } from './MoleculeNode.js';

type SelfOptions = EmptySelfOptions;
export type PCl5NodeOptions = SelfOptions & MoleculeNodeOptions;

export default class PCl5Node extends MoleculeNode {

  public constructor( providedOptions?: PCl5NodeOptions ) {

    const atomNodeOptions = providedOptions?.atomNodeOptions;

    // atoms
    const centerNode = new AtomNode( Element.P, atomNodeOptions );
    const topNode = new AtomNode( Element.Cl, combineOptions<AtomNodeOptions>( {
      centerX: centerNode.centerX,
      centerY: centerNode.top
    }, atomNodeOptions ) );
    const bottomNode = new AtomNode( Element.Cl, combineOptions<AtomNodeOptions>( {
      centerX: centerNode.centerX,
      centerY: centerNode.bottom
    }, atomNodeOptions ) );
    const rightNode = new AtomNode( Element.Cl, combineOptions<AtomNodeOptions>( {
      centerX: centerNode.right,
      centerY: centerNode.centerY
    }, atomNodeOptions ) );
    const topLeftNode = new AtomNode( Element.Cl, combineOptions<AtomNodeOptions>( {
      centerX: centerNode.left + ( 0.25 * centerNode.width ),
      centerY: centerNode.top + ( 0.25 * centerNode.height )
    }, atomNodeOptions ) );
    const bottomLeftNode = new AtomNode( Element.Cl, combineOptions<AtomNodeOptions>( {
      centerX: centerNode.left + ( 0.1 * centerNode.width ),
      centerY: centerNode.bottom - ( 0.1 * centerNode.height )
    }, atomNodeOptions ) );

    const atomNodes = [ rightNode, bottomNode, topLeftNode, centerNode, topNode, bottomLeftNode ];

    super( atomNodes, providedOptions );
  }
}

nitroglycerin.register( 'PCl5Node', PCl5Node );