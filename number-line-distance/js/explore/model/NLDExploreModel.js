// Copyright 2020-2022, University of Colorado Boulder

/**
 * Main model for the 'Explore' screen. This model holds all the scene models.
 *
 * @author Saurabh Totey
 */

import Property from '../../../../axon/js/Property.js';
import numberLineDistance from '../../numberLineDistance.js';
import DistanceSceneModel from './DistanceSceneModel.js';
import ElevationSceneModel from './ElevationSceneModel.js';
import TemperatureSceneModel from './TemperatureSceneModel.js';

class NLDExploreModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // @public the instance for the model of the 'Distance' scene
    this.distanceSceneModel = new DistanceSceneModel( tandem );

    // @public the instance for the model of the 'Temperature' scene
    this.temperatureSceneModel = new TemperatureSceneModel( tandem );

    // @public the instance for the model of the 'Elevation' scene
    this.elevationSceneModel = new ElevationSceneModel( tandem );

    // @public {Property.<AbstractNLDBaseModel>} the currently selected scene model for the explore screen
    this.selectedSceneModelProperty = new Property( this.distanceSceneModel, {
      validValues: [ this.distanceSceneModel, this.temperatureSceneModel, this.elevationSceneModel ]
    } );
  }

  /**
   * Resets the model.
   * @public
   */
  reset() {
    this.selectedSceneModelProperty.reset();
    this.distanceSceneModel.reset();
    this.temperatureSceneModel.reset();
    this.elevationSceneModel.reset();
  }

}

numberLineDistance.register( 'NLDExploreModel', NLDExploreModel );
export default NLDExploreModel;
