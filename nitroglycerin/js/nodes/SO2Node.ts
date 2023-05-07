// Copyright 2013-2022, University of Colorado Boulder

/**
 * SO2 Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { combineOptions, EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import AtomNode, { AtomNodeOptions } from './AtomNode.js';
import MoleculeNode, { MoleculeNodeOptions } from './MoleculeNode.js';

type SelfOptions = EmptySelfOptions;
export type SO2NodeOptions = SelfOptions & MoleculeNodeOptions;

export default class SO2Node extends MoleculeNode {

  public constructor( providedOptions?: SO2NodeOptions ) {

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

    const atomNodes = [ leftNode, centerNode, rightNode ];

    super( atomNodes, providedOptions );
  }
}

nitroglycerin.register( 'SO2Node', SO2Node );