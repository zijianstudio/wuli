// Copyright 2018-2020, University of Colorado Boulder

/**
 * Type used to create auditory description related strings associated with the two ISLCObject instances and their state.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Michael Barlow (PhET Interactive Simulations)
 */

import inverseSquareLawCommon from '../../inverseSquareLawCommon.js';

class ISLCObjectDescriber {
  constructor( model, object, objectLabel ) {
    this.model = model;
    this.object = object;
    this.label = objectLabel;
  }
}

inverseSquareLawCommon.register( 'ISLCObjectDescriber', ISLCObjectDescriber );
export default ISLCObjectDescriber;