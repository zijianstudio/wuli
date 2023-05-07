// Copyright 2016-2022, University of Colorado Boulder

/**
 * Model for the "Model" screen.
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import GravityAndOrbitsModel from '../common/model/GravityAndOrbitsModel.js';
import gravityAndOrbits from '../gravityAndOrbits.js';
import ModelSceneFactory from './ModelSceneFactory.js';
class ModelModel extends GravityAndOrbitsModel {
  /**
   * @param modelTandem
   * @param viewTandem - needed to create the scene views
   */
  constructor(modelTandem, viewTandem) {
    super(false, model => new ModelSceneFactory(model, modelTandem, viewTandem), 0, false, modelTandem);
  }
}
gravityAndOrbits.register('ModelModel', ModelModel);
export default ModelModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHcmF2aXR5QW5kT3JiaXRzTW9kZWwiLCJncmF2aXR5QW5kT3JiaXRzIiwiTW9kZWxTY2VuZUZhY3RvcnkiLCJNb2RlbE1vZGVsIiwiY29uc3RydWN0b3IiLCJtb2RlbFRhbmRlbSIsInZpZXdUYW5kZW0iLCJtb2RlbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTW9kZWxNb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBmb3IgdGhlIFwiTW9kZWxcIiBzY3JlZW4uXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBHcmF2aXR5QW5kT3JiaXRzTW9kZWwgZnJvbSAnLi4vY29tbW9uL21vZGVsL0dyYXZpdHlBbmRPcmJpdHNNb2RlbC5qcyc7XHJcbmltcG9ydCBncmF2aXR5QW5kT3JiaXRzIGZyb20gJy4uL2dyYXZpdHlBbmRPcmJpdHMuanMnO1xyXG5pbXBvcnQgTW9kZWxTY2VuZUZhY3RvcnkgZnJvbSAnLi9Nb2RlbFNjZW5lRmFjdG9yeS5qcyc7XHJcblxyXG5jbGFzcyBNb2RlbE1vZGVsIGV4dGVuZHMgR3Jhdml0eUFuZE9yYml0c01vZGVsIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIG1vZGVsVGFuZGVtXHJcbiAgICogQHBhcmFtIHZpZXdUYW5kZW0gLSBuZWVkZWQgdG8gY3JlYXRlIHRoZSBzY2VuZSB2aWV3c1xyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWxUYW5kZW06IFRhbmRlbSwgdmlld1RhbmRlbTogVGFuZGVtICkge1xyXG4gICAgc3VwZXIoXHJcbiAgICAgIGZhbHNlLFxyXG4gICAgICBtb2RlbCA9PiBuZXcgTW9kZWxTY2VuZUZhY3RvcnkoIG1vZGVsLCBtb2RlbFRhbmRlbSwgdmlld1RhbmRlbSApLFxyXG4gICAgICAwLFxyXG4gICAgICBmYWxzZSxcclxuICAgICAgbW9kZWxUYW5kZW1cclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmF2aXR5QW5kT3JiaXRzLnJlZ2lzdGVyKCAnTW9kZWxNb2RlbCcsIE1vZGVsTW9kZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgTW9kZWxNb2RlbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLHFCQUFxQixNQUFNLDBDQUEwQztBQUM1RSxPQUFPQyxnQkFBZ0IsTUFBTSx3QkFBd0I7QUFDckQsT0FBT0MsaUJBQWlCLE1BQU0sd0JBQXdCO0FBRXRELE1BQU1DLFVBQVUsU0FBU0gscUJBQXFCLENBQUM7RUFFN0M7QUFDRjtBQUNBO0FBQ0E7RUFDU0ksV0FBV0EsQ0FBRUMsV0FBbUIsRUFBRUMsVUFBa0IsRUFBRztJQUM1RCxLQUFLLENBQ0gsS0FBSyxFQUNMQyxLQUFLLElBQUksSUFBSUwsaUJBQWlCLENBQUVLLEtBQUssRUFBRUYsV0FBVyxFQUFFQyxVQUFXLENBQUMsRUFDaEUsQ0FBQyxFQUNELEtBQUssRUFDTEQsV0FDRixDQUFDO0VBQ0g7QUFDRjtBQUVBSixnQkFBZ0IsQ0FBQ08sUUFBUSxDQUFFLFlBQVksRUFBRUwsVUFBVyxDQUFDO0FBQ3JELGVBQWVBLFVBQVUifQ==