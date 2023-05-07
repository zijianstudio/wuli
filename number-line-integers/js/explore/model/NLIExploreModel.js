// Copyright 2019-2022, University of Colorado Boulder

/**
 * @author John Blanco (PhET Interactive Simulations)
 */

import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import numberLineIntegers from '../../numberLineIntegers.js';
import BankSceneModel from './BankSceneModel.js';
import ElevationSceneModel from './ElevationSceneModel.js';
import NLIScene from './NLIScene.js';
import TemperatureSceneModel from './TemperatureSceneModel.js';

class NLIExploreModel {

  /**
   * @public
   */
  constructor() {

    // @public {Property.<NLIScene>} - currently selected scene
    this.selectedSceneProperty = new EnumerationDeprecatedProperty( NLIScene, NLIScene.ELEVATION );

    // @public (read-only) {ElevationSceneModel} - model instance for the "Elevation" scene
    this.elevationSceneModel = new ElevationSceneModel();

    // @public (read-only) {BankSceneModel} - model instance for the "Bank" scene
    this.bankSceneModel = new BankSceneModel();

    // @public (read-only) {TemperatureSceneModel} - model instance for the "Temperature" scene
    this.temperatureSceneModel = new TemperatureSceneModel();

    // @private {SceneModel[]} - all of the scene models in an array for convenience
    this.sceneModels = [
      this.elevationSceneModel,
      this.bankSceneModel,
      this.temperatureSceneModel
    ];
  }

  /**
   * Restore initial state.
   * @public
   */
  reset() {
    this.selectedSceneProperty.reset();
    this.sceneModels.forEach( sceneModel => {
      sceneModel.reset();
    } );
  }
}

numberLineIntegers.register( 'NLIExploreModel', NLIExploreModel );
export default NLIExploreModel;