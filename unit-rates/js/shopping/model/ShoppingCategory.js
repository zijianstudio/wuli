// Copyright 2016-2023, University of Colorado Boulder

/**
 * A category in the 'Shopping' screen. A category is a group of related scenes.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import merge from '../../../../phet-core/js/merge.js';
import URQueryParameters from '../../common/URQueryParameters.js';
import unitRates from '../../unitRates.js';

export default class ShoppingCategory {

  /**
   * @param {HTMLImageElement} image - image used to represent the category
   * @param {ShoppingScene[]} shoppingScenes - scenes in the category
   * @param {Object} [options]
   */
  constructor( image, shoppingScenes, options ) {

    assert && assert( shoppingScenes.length > 0, 'at least 1 ShoppingScene is required' );

    options = merge( {

      // index of the scene that is initially selected, randomly chosen
      shoppingSceneIndex: URQueryParameters.randomEnabled ? dotRandom.nextIntBetween( 0, shoppingScenes.length - 1 ) : 0
    }, options );

    // validate options
    assert && assert( options.shoppingSceneIndex >= 0 && options.shoppingSceneIndex < shoppingScenes.length,
      `invalid shoppingSceneIndex: ${options.shoppingSceneIndex}` );

    // @public (read-only)
    this.image = image;
    this.shoppingScenes = shoppingScenes;
    this.shoppingSceneProperty = new Property( shoppingScenes[ options.shoppingSceneIndex ] );
  }

  // @public
  reset() {

    // Reset all scenes
    this.shoppingScenes.forEach( shoppingScene => shoppingScene.reset() );

    this.shoppingSceneProperty.reset();
  }

  /**
   * Updates time-dependent parts of the model.
   * @param {number} dt - time since the previous step, in seconds
   * @public
   */
  step( dt ) {

    // step the selected scene
    this.shoppingSceneProperty.value.step( dt );
  }
}

unitRates.register( 'ShoppingCategory', ShoppingCategory );