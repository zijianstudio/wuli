// Copyright 2013-2022, University of Colorado Boulder

/**
 * PF3 Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { combineOptions, EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import AtomNode, { AtomNodeOptions } from './AtomNode.js';
import MoleculeNode, { MoleculeNodeOptions } from './MoleculeNode.js';

type SelfOptions = EmptySelfOptions;
export type PF3NodeOptions = SelfOptions & MoleculeNodeOptions;

export default class PF3Node extends MoleculeNode {

  public constructor( providedOptions?: PF3NodeOptions ) {

    const atomNodeOptions = providedOptions?.atomNodeOptions;

    // atoms
    const centerNode = new AtomNode( Element.P, atomNodeOptions );
    const leftNode = new AtomNode( Element.F, combineOptions<AtomNodeOptions>( {
      centerX: centerNode.left,
      centerY: centerNode.bottom - ( 0.25 * centerNode.height )
    }, atomNodeOptions ) );
    const rightNode = new AtomNode( Element.F, combineOptions<AtomNodeOptions>( {
      centerX: centerNode.right,
      centerY: leftNode.centerY
    }, atomNodeOptions ) );
    const bottomNode = new AtomNode( Element.F, combineOptions<AtomNodeOptions>( {
      centerX: centerNode.centerX,
      centerY: centerNode.bottom
    }, atomNodeOptions ) );

    const atomNodes = [ leftNode, rightNode, centerNode, bottomNode ];

    super( atomNodes, providedOptions );
  }
}

nitroglycerin.register( 'PF3Node', PF3Node );