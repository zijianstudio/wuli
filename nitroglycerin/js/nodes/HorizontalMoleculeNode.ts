// Copyright 2013-2022, University of Colorado Boulder

/**
 * Base class for molecules with N atoms aligned on the horizontal axis, for N > 0.
 * Note that here is technically no such thing as a single-atom molecule,
 * but allowing N=1 simplifies the Equation model.
 *
 * Origin is at geometric center of the node's bounding rectangle.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import optionize from '../../../phet-core/js/optionize.js';
import { Node } from '../../../scenery/js/imports.js';
import nitroglycerin from '../nitroglycerin.js';
import AtomNode from './AtomNode.js';
import Element from '../Element.js';
import MoleculeNode, { MoleculeNodeOptions } from './MoleculeNode.js';

type SelfOptions = {

  // direction of overlap, leftToRight or rightToLeft
  direction?: 'leftToRight' | 'rightToLeft';

  // amount of overlap between atoms
  overlapPercent?: number;
};

export type HorizontalMoleculeNodeOptions = SelfOptions & MoleculeNodeOptions;

export default class HorizontalMoleculeNode extends MoleculeNode {

  protected constructor( elements: Element[], providedOptions?: HorizontalMoleculeNodeOptions ) {

    const options = optionize<HorizontalMoleculeNodeOptions, SelfOptions, MoleculeNodeOptions>()( {
      direction: 'leftToRight',
      overlapPercent: 0.25
    }, providedOptions );

    // Add atoms from left to right, overlapping consistently.
    const atomNodes: AtomNode[] = [];
    let previousNode: Node | null = null;
    elements.forEach( element => {
      const currentNode = new AtomNode( element, options.atomNodeOptions );
      atomNodes.push( currentNode );
      if ( previousNode !== null ) {
        const overlap = ( options.overlapPercent * currentNode.width );
        if ( options.direction === 'leftToRight' ) {
          currentNode.left = previousNode.right - overlap;
        }
        else {
          currentNode.right = previousNode.left + overlap;
        }
      }
      previousNode = currentNode;
    } );

    super( atomNodes, options );
  }
}

nitroglycerin.register( 'HorizontalMoleculeNode', HorizontalMoleculeNode );