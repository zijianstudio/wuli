// Copyright 2014-2020, University of Colorado Boulder


import Property from '../../../../axon/js/Property.js';
import EstimationConstants from '../../common/EstimationConstants.js';
import estimation from '../../estimation.js';
import CubeExplorationMode from './CubeExplorationMode.js';
import CylinderExplorationMode from './CylinderExplorationMode.js';
import LineExplorationMode from './LineExplorationMode.js';
import RectangleExplorationMode from './RectangleExplorationMode.js';

class ExploreModel {

  constructor() {

    // Externally visible properties.
    this.estimationModeProperty = new Property( 'lines' ); // Valid values are 'lines', 'rectangles', 'cubes', and 'cylinders'.
    this.estimationRangeProperty = new Property( EstimationConstants.RANGE_1_TO_10 );
    this.offsetIntoRangeProperty = new Property( 0 ); // Amount of offset into the current range
    this.comparisonTypeProperty = new Property( 'discrete' ); // Valid values are 'discrete' or 'continuous'.

    // The following property should only be observed outside of this model, never set.
    this.estimateProperty = new Property( 1 ); // Estimated quantity of reference objects to fill the compare object

    // Hook up internal property dependencies.
    this.estimationRangeProperty.link( range => {
      this.offsetIntoRangeProperty.value = 0;
      this.estimateProperty.value = range.min;
    } );

    // to calculate the user's estimate, linearly map offset from  0-1 to  estimationRange.min-estimationRange.max, and
    // then make it an integer
    this.offsetIntoRangeProperty.link( offset => {
      this.estimateProperty.value = Math.floor( offset * this.estimationRangeProperty.value.max - this.estimationRangeProperty.value.min * ( offset - 1 ) );
    } );

    // Create the various modes that the user can explore.
    this.modes = {
      lines: new LineExplorationMode( this.estimationModeProperty ),
      rectangles: new RectangleExplorationMode( this.estimationModeProperty ),
      cubes: new CubeExplorationMode( this.estimationModeProperty ),
      cylinders: new CylinderExplorationMode( this.estimationModeProperty, this.cylinders )
    };

    this.estimationModeProperty.link( ( newMode, oldMode ) => {

      // Store the range associated with current mode.  It is necessary to
      // do this in order to restore it, since ranges are not mutually
      // exclusive.
      if ( oldMode ) {
        this.modes[ oldMode ].selectedRange = this.estimationRangeProperty.value;
        this.modes[ oldMode ].offsetIntoRange = this.offsetIntoRangeProperty.value;
      }

      // Restore the estimate for this mode.
      this.estimationRangeProperty.value = this.modes[ newMode ].selectedRange;
      this.offsetIntoRangeProperty.value = this.modes[ newMode ].offsetIntoRange;

      // Restore the comparison type.
      this.comparisonTypeProperty.value = this.modes[ newMode ].continuousOrDiscreteProperty.value;
    } );

    this.estimateProperty.link( estimate => {
      // Propagate changes from the UI into the active mode.
      this.modes[ this.estimationModeProperty.value ].estimateProperty.value = estimate;
    } );

    this.comparisonTypeProperty.link( discreteOrContinuous => {
      // Propagate changes from the UI into the active mode.
      this.modes[ this.estimationModeProperty.value ].continuousOrDiscreteProperty.value = discreteOrContinuous;
    } );
  }

  // TODO: Visibility annotations should be checked and updated, see https://github.com/phetsims/estimation/issues/9

  // @public
  reset() {
    this.estimationModeProperty.reset();
    this.estimationRangeProperty.reset();
    this.offsetIntoRangeProperty.reset();
    this.comparisonTypeProperty.reset();
    for ( const mode in this.modes ) {
      this.modes[ mode ].reset();
    }
  }

  // @public
  newReferenceObject() {
    this.estimationRangeProperty.reset();
    this.offsetIntoRangeProperty.reset();
    this.modes[ this.estimationModeProperty.value ].newReferenceObject();
  }
}

estimation.register( 'ExploreModel', ExploreModel );

export default ExploreModel;