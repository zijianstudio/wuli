// Copyright 2013-2022, University of Colorado Boulder

/**
 * SO3 Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import AtomNode, { AtomNodeOptions } from './AtomNode.js';
import MoleculeNode, { MoleculeNodeOptions } from './MoleculeNode.js';
import { combineOptions, EmptySelfOptions } from '../../../phet-core/js/optionize.js';

type SelfOptions = EmptySelfOptions;
export type SO3NodeOptions = SelfOptions & MoleculeNodeOptions;

export default class SO3Node extends MoleculeNode {

  public constructor( providedOptions?: SO3NodeOptions ) {

    const atomNodeOptions = providedOptions?.atomNodeOptions;

    // atoms
    const centerNode = new AtomNode( Element.S, atomNodeOptions );
    const leftNode = new AtomNode( Element.O, combineOptions<AtomNodeOptions>( {
      centerX: centerNode.left,
      centerY: centerNode.centerY + ( 0.2 * centerNode.height )
    }, atomNodeOptions ) );
    const rightNode = new AtomNode( Element.O, combineOptions<AtomNodeOptions>( {
      centerX: centerNode.right,
      centerY: centerNode.centerY + ( 0.2 * centerNode.height )
    }, atomNodeOptions ) );
    const topNode = new AtomNode( Element.O, combineOptions<AtomNodeOptions>( {
      centerX: centerNode.centerX + ( 0.08 * centerNode.width ),
      centerY: centerNode.left + ( 0.08 * centerNode.height )
    }, atomNodeOptions ) );

    const atomNodes = [ topNode, leftNode, centerNode, rightNode ];

    super( atomNodes, providedOptions );
  }
}

nitroglycerin.register( 'SO3Node', SO3Node );