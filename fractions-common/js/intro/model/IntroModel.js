// Copyright 2018-2020, University of Colorado Boulder

/**
 * Full model for the "Intro" simulation
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import fractionsCommon from '../../fractionsCommon.js';
import ContainerSetModel from './ContainerSetModel.js';

class IntroModel extends ContainerSetModel {
  /**
   * @param {boolean} allowMixedNumbers
   * @param {Object} [options]
   */
  constructor( allowMixedNumbers, options ) {
    options = merge( {
      maxContainers: allowMixedNumbers ? 4 : 6
    }, options );

    super( options );

    // @public {boolean} - Whether to allow the display of the fraction as a mixed number
    this.allowMixedNumbers = allowMixedNumbers;

    // @public {Property.<boolean>} - Whether to show mixed numbers or not
    this.showMixedNumbersProperty = new BooleanProperty( false );

    // @public {Property.<boolean>} - Whether the accordion box showing a mixed-number equivalence is expanded.
    this.mixedNumbersBoxExpandedProperty = new BooleanProperty( true );
  }

  /**
   * Resets the model.
   * @public
   * @override
   */
  reset() {
    this.showMixedNumbersProperty.reset();
    this.mixedNumbersBoxExpandedProperty.reset();

    super.reset();
  }
}

fractionsCommon.register( 'IntroModel', IntroModel );
export default IntroModel;