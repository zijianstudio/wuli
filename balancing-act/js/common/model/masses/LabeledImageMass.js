// Copyright 2013-2021, University of Colorado Boulder

/**
 * This is an extension of the ImageMass type that adds a textual label.  This
 * was created in support of a request to label the mystery masses with
 * translatable labels.
 *
 * @author John Blanco
 */

import balancingAct from '../../../balancingAct.js';
import ImageMass from '../ImageMass.js';

class LabeledImageMass extends ImageMass {

  /**
   * @param {Vector2} initialPosition
   * @param {Object} config - configuration information for the labeled image mass
   */
  constructor( initialPosition, config ) {
    super( config.massValue, config.image, config.height, initialPosition, config.isMystery, config );
    this.labelText = config.labelText;
  }
}

balancingAct.register( 'LabeledImageMass', LabeledImageMass );

export default LabeledImageMass;