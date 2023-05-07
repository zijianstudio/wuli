// Copyright 2015-2022, University of Colorado Boulder

/**
 * Model for the Explore screen in Make a Ten. Includes the total, cues, and adding in initial numbers.
 *
 * @author Sharfudeen Ashraf
 */

import CountingCommonModel from '../../../../../counting-common/js/common/model/CountingCommonModel.js';
import makeATen from '../../../makeATen.js';
import MakeATenConstants from '../../common/MakeATenConstants.js';
import MakeATenQueryParameters from '../../common/MakeATenQueryParameters.js';
import Cue from './Cue.js';

class MakeATenExploreModel extends CountingCommonModel {
  constructor() {

    super( MakeATenConstants.MAX_SUM );

    // @public {Cue} - Visually indicates numbers can be split (pulled apart)
    this.splitCue = new Cue();

    // @private {Function} - To be called when we need to recalculate the total
    const calculateTotalListener = this.calculateTotal.bind( this );

    this.countingObjects.lengthProperty.link( calculateTotalListener );

    // Listen to number changes of counting objects
    this.countingObjects.addItemAddedListener( countingObject => {
      countingObject.numberValueProperty.link( calculateTotalListener );
    } );
    this.countingObjects.addItemRemovedListener( countingObject => {
      countingObject.numberValueProperty.unlink( calculateTotalListener );
    } );

    this.addInitialNumbers();
  }

  /**
   * Steps forward in time
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {

    // Cap large dt values, which can occur when the tab containing
    // the sim had been hidden and then re-shown
    dt = Math.min( 0.1, dt );

    // Animate fading if necessary
    this.splitCue.step( dt );
  }

  /**
   * Adds any required initial numbers.
   * @private
   */
  addInitialNumbers() {
    // Check for an array of numbers, e.g. ?exploreNumbers=10,51, where 0 indicates none
    this.addMultipleNumbers( MakeATenQueryParameters.exploreNumbers );

    // Attach cues to any available numbers
    this.countingObjects.forEach( countingObject => {
      if ( countingObject.numberValueProperty.value > 1 ) {
        this.splitCue.attachToNumber( countingObject );
      }
    } );
  }

  /**
   * Resets values to their original state
   * @public
   * @override
   */
  reset() {
    super.reset();

    this.splitCue.reset();
    this.addInitialNumbers();
  }
}

makeATen.register( 'MakeATenExploreModel', MakeATenExploreModel );

export default MakeATenExploreModel;