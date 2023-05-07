// Copyright 2018-2022, University of Colorado Boulder

/**
 * Demonstrates using a class with inheritance
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import { Node, NodeOptions, Text } from '../../../../scenery/js/imports.js';
import wilder from '../../wilder.js';

class WilderNode extends Node {
  public constructor( providedOptions?: NodeOptions ) {
    const options = optionize<NodeOptions, EmptySelfOptions, NodeOptions>()( {
      children: [ new Text( 'hello wilder' ) ]
    }, providedOptions );
    super( options );
  }

  /**
   * Rotates the node by PI, demonstrates a class method.
   */
  public flipOver(): void {
    this.rotate( Math.PI );
  }
}

wilder.register( 'WilderNode', WilderNode );
export default WilderNode;