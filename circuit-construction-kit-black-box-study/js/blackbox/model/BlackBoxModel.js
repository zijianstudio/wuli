// Copyright 2016-2020, University of Colorado Boulder

/**
 * This model is solely responsible for choosing between different scenes, one for each black box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import StringProperty from '../../../../axon/js/StringProperty.js';
import circuitConstructionKitBlackBoxStudy from '../../circuitConstructionKitBlackBoxStudy.js';

class BlackBoxModel {
  constructor() {

    // @public - indicates which scene is selected: warmup/scene0-scene14
    this.sceneProperty = new StringProperty( 'warmup' );
  }
}

circuitConstructionKitBlackBoxStudy.register( 'BlackBoxModel', BlackBoxModel );
export default BlackBoxModel;