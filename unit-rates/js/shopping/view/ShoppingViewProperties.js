// Copyright 2016-2023, University of Colorado Boulder

/**
 * The union of view Properties used in the 'Shopping' and 'Shopping Lab' screens.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import unitRates from '../../unitRates.js';

export default class ShoppingViewProperties {

  constructor() {

    // @public is the 'Double Number Line' accordion box expanded?
    this.doubleNumberLineExpandedProperty = new BooleanProperty( true );

    // @public is the 'Questions' accordion box expanded?
    this.questionsExpandedProperty = new BooleanProperty( true );

    // @public is the cost display expanded on the scale?
    this.scaleCostExpandedProperty = new BooleanProperty( true );

    // @public is the 'Rate' accordion box expanded?
    this.rateExpandedProperty = new BooleanProperty( true );
  }

  // @public
  reset() {
    this.doubleNumberLineExpandedProperty.reset();
    this.questionsExpandedProperty.reset();
    this.scaleCostExpandedProperty.reset();
    this.rateExpandedProperty.reset();
  }
}

unitRates.register( 'ShoppingViewProperties', ShoppingViewProperties );