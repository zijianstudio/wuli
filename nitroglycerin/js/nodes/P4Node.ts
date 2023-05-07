// Copyright 2013-2022, University of Colorado Boulder

/**
 * P4 Molecule
 * Structure is tetrahedral
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { combineOptions, EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import AtomNode, { AtomNodeOptions } from './AtomNode.js';
import MoleculeNode, { MoleculeNodeOptions } from './MoleculeNode.js';

type SelfOptions = EmptySelfOptions;
export type P4NodeOptions = SelfOptions & MoleculeNodeOptions;

export default class P4Node extends MoleculeNode {

  public constructor( providedOptions?: P4NodeOptions ) {

    const atomNodeOptions = providedOptions?.atomNodeOptions;

    // atoms
    const topNode = new AtomNode( Element.P, atomNodeOptions );
    const bottomLeftNode = new AtomNode( Element.P, combineOptions<AtomNodeOptions>( {
      centerX: topNode.left + ( 0.3 * topNode.width ),
      centerY: topNode.bottom + ( 0.2 * topNode.width )
    }, atomNodeOptions ) );
    const bottomRightNode = new AtomNode( Element.P, combineOptions<AtomNodeOptions>( {
      centerX: topNode.right,
      centerY: topNode.bottom
    }, atomNodeOptions ) );
    const bottomBackNode = new AtomNode( Element.P, combineOptions<AtomNodeOptions>( {
      centerX: topNode.left,
      centerY: topNode.centerY + ( 0.2 * topNode.height )
    }, atomNodeOptions ) );

    const atomNodes = [ bottomBackNode, bottomRightNode, bottomLeftNode, topNode ];

    super( atomNodes, providedOptions );
  }
}

nitroglycerin.register( 'P4Node', P4Node );