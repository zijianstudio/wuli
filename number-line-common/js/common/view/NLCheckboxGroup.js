// Copyright 2021, University of Colorado Boulder

/**
 * NLCheckboxGroup is a convenience class for creating a group of checkboxes.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import { VBox } from '../../../../scenery/js/imports.js';
import numberLineCommon from '../../numberLineCommon.js';
import NLCConstants from '../NLCConstants.js';

class NLCheckboxGroup extends VBox {

  /**
   * @param {Checkbox[]} checkboxes
   * @param {Object} [options]
   */
  constructor( checkboxes, options ) {

    assert && assert( options === undefined || options.children === undefined, 'children should not be specified' );

    options = merge( {
      children: checkboxes,
      spacing: 12,
      align: 'left',
      left: NLCConstants.SCREEN_VIEW_X_MARGIN,
      top: NLCConstants.SCREEN_VIEW_Y_MARGIN
    }, options );

    super( options );
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert( false, 'NLCheckboxGroup does not support dispose' );
  }
}

numberLineCommon.register( 'NLCheckboxGroup', NLCheckboxGroup );
export default NLCheckboxGroup;