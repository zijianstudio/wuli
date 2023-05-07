// Copyright 2016-2020, University of Colorado Boulder

/**
 * Model for the terms in the addition "leftTerm + rightTerm =".
 *
 * @author Sharfudeen Ashraf
 */

import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Property from '../../../../../axon/js/Property.js';
import makeATen from '../../../makeATen.js';
import ActiveTerm from '../../adding/model/ActiveTerm.js';

class AdditionTerms {
  constructor() {
    // @public {NumberProperty} - The left-hand term for the addition.
    this.leftTermProperty = new NumberProperty( 0 );

    // @public {NumberProperty} - The left-hand term for the addition.
    this.rightTermProperty = new NumberProperty( 0 );

    // @public {Property.<ActiveTerm>} - The active term being edited (left, right or none basically)
    this.activeTermProperty = new Property( ActiveTerm.NONE );
  }

  /**
   * Returns whether both of the terms have non-zero values (and are not being edited).
   * @public
   *
   * @returns {boolean}
   */
  hasBothTerms() {
    return this.activeTermProperty.value === ActiveTerm.NONE && this.leftTermProperty.value > 0 && this.rightTermProperty.value > 0;
  }

  /**
   * Reset all of the terms
   * @public
   */
  reset() {
    this.leftTermProperty.reset();
    this.rightTermProperty.reset();
    this.activeTermProperty.reset();
  }
}

makeATen.register( 'AdditionTerms', AdditionTerms );

export default AdditionTerms;