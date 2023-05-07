// Copyright 2013-2022, University of Colorado Boulder

/**
 * Base class for PNodes that create masses in the model when clicked upon.
 *
 * @author John Blanco
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import balancingAct from '../../balancingAct.js';
import BalancingActStrings from '../../BalancingActStrings.js';
import ModelElementCreatorNode from './ModelElementCreatorNode.js';

const kgString = BalancingActStrings.kg;
const pattern0Value1UnitsString = BalancingActStrings.pattern0Value1Units;

class MassCreatorNode extends ModelElementCreatorNode {

  /**
   * @param {BasicBalanceScreenView} screenView
   * @param {number} massValue
   * @param {boolean} showMassLabel
   * @param {Object} [options]
   */
  constructor( screenView, massValue, showMassLabel, options ) {
    super( screenView, options );
    if ( showMassLabel ) {
      this.setCaption( StringUtils.format( pattern0Value1UnitsString, massValue, kgString ) );
    }
  }
}

balancingAct.register( 'MassCreatorNode', MassCreatorNode );

export default MassCreatorNode;