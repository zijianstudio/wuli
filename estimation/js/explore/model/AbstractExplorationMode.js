// Copyright 2014-2020, University of Colorado Boulder

/**
 * Base class for the various modes that the user can select in the "Explore"
 * screen.
 *
 * TODO: There are several things in the descendant classes that can be pulled into this class,
 * such as the function to set the initial and new reference objects.  I just didn't want to
 * take the time when doing early proof of concept to do this.
 */

import Property from '../../../../axon/js/Property.js';
import EstimationConstants from '../../common/EstimationConstants.js';
import estimation from '../../estimation.js';

class AbstractExplorationMode {

  constructor( selectedModeProperty, modeName ) {
    this.selectedModeProperty = selectedModeProperty;
    this.modeName = modeName;

    // Properties that are part of the public API.
    this.estimateProperty = new Property( 1 );
    this.continuousOrDiscreteProperty = new Property( 'discrete' );

    // Storage for this mode's estimate parameters for when the mode is
    // inactive. Necessary because the ranges overlap.
    this.selectedRange = EstimationConstants.RANGE_1_TO_10;
    this.offsetIntoRange = 0;

    // Every mode has the following objects.  Descendant classes should populate.
    this.referenceObject = null;
    this.compareObject = null;
    this.continuousSizableObject = null;
    this.discreteObjectList = [];
  }

  // TODO: Visibility annotations should be checked and updated, see https://github.com/phetsims/estimation/issues/9

  // @public
  createNewReferenceObject() {
    throw new Error( 'createNewReferenceObject must be overridden in descendant class' );
  }

  // @public
  updateDiscreteObjectVisibility( modeName ) {
    throw new Error( 'updateDiscreteObjectVisibility must be overridden in descendant class' );
  }

  // @public
  updateContinuousObjectSize() {
    throw new Error( 'updateContinuousObjectSize must be overridden in descendant class' );
  }

  // @public
  setInitialReferenceObject() {
    throw new Error( 'setInitialReferenceObject must be overridden in descendant class' );
  }

  // @public
  updateObjectVisibility() {
    const selectedMode = this.selectedModeProperty.value;
    this.referenceObject.visibleProperty.value = selectedMode === this.modeName;
    this.compareObject.visibleProperty.value = selectedMode === this.modeName;
    this.continuousSizableObject.visibleProperty.value = selectedMode === this.modeName && this.continuousOrDiscreteProperty.value === 'continuous';
    this.updateDiscreteObjectVisibility( selectedMode, this.estimateProperty.value );
  }

  /**
   * Must be called by descendant classes to complete initialization.
   * @public
   */
  hookUpVisibilityUpdates() {
    this.selectedModeProperty.link( this.updateObjectVisibility.bind( this ) );
    this.continuousOrDiscreteProperty.link( this.updateObjectVisibility.bind( this ) );
    this.estimateProperty.link( this.updateObjectVisibility.bind( this ) );
    this.estimateProperty.link( this.updateContinuousObjectSize.bind( this ) );
  }

  /**
   * restore initial state
   * @public
   */
  reset() {
    this.continuousOrDiscreteProperty.reset();
    this.estimateProperty.reset();
    this.selectedRange = EstimationConstants.RANGE_1_TO_10;
    this.offsetIntoRange = 0;
    this.setInitialReferenceObject();
  }
}

estimation.register( 'AbstractExplorationMode', AbstractExplorationMode );

export default AbstractExplorationMode;