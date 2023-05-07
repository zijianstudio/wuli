// Copyright 2013-2022, University of Colorado Boulder

/**
 * PCl3 Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { combineOptions, EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import AtomNode, { AtomNodeOptions } from './AtomNode.js';
import MoleculeNode, { MoleculeNodeOptions } from './MoleculeNode.js';

type SelfOptions = EmptySelfOptions;
export type PCl3NodeOptions = SelfOptions & MoleculeNodeOptions;

export default class PCl3Node extends MoleculeNode {

  public constructor( providedOptions?: PCl3NodeOptions ) {

    const atomNodeOptions = providedOptions?.atomNodeOptions;

    // atoms
    const centerNode = new AtomNode( Element.P, atomNodeOptions );
    const leftNode = new AtomNode( Element.Cl, combineOptions<AtomNodeOptions>( {
      centerX: centerNode.left,
      centerY: centerNode.bottom - ( 0.25 * centerNode.height )
    }, atomNodeOptions ) );
    const rightNode = new AtomNode( Element.Cl, combineOptions<AtomNodeOptions>( {
      centerX: centerNode.right,
      centerY: leftNode.centerY
    }, atomNodeOptions ) );
    const bottomNode = new AtomNode( Element.Cl, combineOptions<AtomNodeOptions>( {
      centerX: centerNode.centerX,
      centerY: centerNode.bottom
    }, atomNodeOptions ) );

    const atomNodes = [ leftNode, rightNode, centerNode, bottomNode ];

    super( atomNodes, providedOptions );
  }
}

nitroglycerin.register( 'PCl3Node', PCl3Node );