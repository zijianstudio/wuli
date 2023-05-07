// Copyright 2022, University of Colorado Boulder

/**
 * MoleculeNode is the base class for all molecules.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import optionize from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import { Node, NodeOptions } from '../../../scenery/js/imports.js';
import AtomNode, { AtomNodeOptions } from './AtomNode.js';
import nitroglycerin from '../nitroglycerin.js';

type SelfOptions = {

  // This is not used in MoleculeNode, but is used in every concrete class that extends MoleculeNode.
  atomNodeOptions?: AtomNodeOptions;
};

export type MoleculeNodeOptions = SelfOptions & StrictOmit<NodeOptions, 'children'>;

export default class MoleculeNode extends Node {

  protected constructor( atomNodes: AtomNode[], providedOptions?: MoleculeNodeOptions ) {

    const options = optionize<MoleculeNodeOptions, StrictOmit<SelfOptions, 'atomNodeOptions'>, NodeOptions>()( {
      children: [ new Node( {
        children: atomNodes,
        center: Vector2.ZERO // origin at geometric center
      } ) ]
    }, providedOptions );

    super( options );
  }
}

nitroglycerin.register( 'MoleculeNode', MoleculeNode );