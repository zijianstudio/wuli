// Copyright 2018-2021, University of Colorado Boulder

/**
 * A Node that holds the Voltmeter and the Voltmeter wires. This is handy for phet-io because we want both of these
 * child nodes to be controlled in the same way (with visibility, opacity etc).
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import { Node } from '../../../../scenery/js/imports.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawConstants from '../FaradaysLawConstants.js';
import VoltmeterNode from './VoltmeterNode.js';
import VoltmeterWiresNode from './VoltmeterWiresNode.js';

class VoltmeterAndWiresNode extends Node {

  /**
   * @param {NumberProperty} needleAngleProperty - angle of needle in voltmeter
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( needleAngleProperty, tandem, options ) {

    options = merge( {
      tandem: tandem,
      phetioDocumentation: 'The voltmeter and its connecting wires'
    }, options );

    super( options );

    // pass an unmodified tandem in so that the VoltmeterNode's children look the this types children.
    const voltmeterNode = new VoltmeterNode( needleAngleProperty, tandem );
    const voltmeterWiresNode = new VoltmeterWiresNode( voltmeterNode );
    voltmeterNode.center = FaradaysLawConstants.VOLTMETER_POSITION;

    this.children = [ voltmeterNode, voltmeterWiresNode ];
  }
}

faradaysLaw.register( 'VoltmeterAndWiresNode', VoltmeterAndWiresNode );
export default VoltmeterAndWiresNode;