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
    this.selectedSceneProperty = new EnumerationDeprecatedProperty(NLIScene, NLIScene.ELEVATION);

    // @public (read-only) {ElevationSceneModel} - model instance for the "Elevation" scene
    this.elevationSceneModel = new ElevationSceneModel();

    // @public (read-only) {BankSceneModel} - model instance for the "Bank" scene
    this.bankSceneModel = new BankSceneModel();

    // @public (read-only) {TemperatureSceneModel} - model instance for the "Temperature" scene
    this.temperatureSceneModel = new TemperatureSceneModel();

    // @private {SceneModel[]} - all of the scene models in an array for convenience
    this.sceneModels = [this.elevationSceneModel, this.bankSceneModel, this.temperatureSceneModel];
  }

  /**
   * Restore initial state.
   * @public
   */
  reset() {
    this.selectedSceneProperty.reset();
    this.sceneModels.forEach(sceneModel => {
      sceneModel.reset();
    });
  }
}
numberLineIntegers.register('NLIExploreModel', NLIExploreModel);
export default NLIExploreModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSIsIm51bWJlckxpbmVJbnRlZ2VycyIsIkJhbmtTY2VuZU1vZGVsIiwiRWxldmF0aW9uU2NlbmVNb2RlbCIsIk5MSVNjZW5lIiwiVGVtcGVyYXR1cmVTY2VuZU1vZGVsIiwiTkxJRXhwbG9yZU1vZGVsIiwiY29uc3RydWN0b3IiLCJzZWxlY3RlZFNjZW5lUHJvcGVydHkiLCJFTEVWQVRJT04iLCJlbGV2YXRpb25TY2VuZU1vZGVsIiwiYmFua1NjZW5lTW9kZWwiLCJ0ZW1wZXJhdHVyZVNjZW5lTW9kZWwiLCJzY2VuZU1vZGVscyIsInJlc2V0IiwiZm9yRWFjaCIsInNjZW5lTW9kZWwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk5MSUV4cGxvcmVNb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IG51bWJlckxpbmVJbnRlZ2VycyBmcm9tICcuLi8uLi9udW1iZXJMaW5lSW50ZWdlcnMuanMnO1xyXG5pbXBvcnQgQmFua1NjZW5lTW9kZWwgZnJvbSAnLi9CYW5rU2NlbmVNb2RlbC5qcyc7XHJcbmltcG9ydCBFbGV2YXRpb25TY2VuZU1vZGVsIGZyb20gJy4vRWxldmF0aW9uU2NlbmVNb2RlbC5qcyc7XHJcbmltcG9ydCBOTElTY2VuZSBmcm9tICcuL05MSVNjZW5lLmpzJztcclxuaW1wb3J0IFRlbXBlcmF0dXJlU2NlbmVNb2RlbCBmcm9tICcuL1RlbXBlcmF0dXJlU2NlbmVNb2RlbC5qcyc7XHJcblxyXG5jbGFzcyBOTElFeHBsb3JlTW9kZWwge1xyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPE5MSVNjZW5lPn0gLSBjdXJyZW50bHkgc2VsZWN0ZWQgc2NlbmVcclxuICAgIHRoaXMuc2VsZWN0ZWRTY2VuZVByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5KCBOTElTY2VuZSwgTkxJU2NlbmUuRUxFVkFUSU9OICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7RWxldmF0aW9uU2NlbmVNb2RlbH0gLSBtb2RlbCBpbnN0YW5jZSBmb3IgdGhlIFwiRWxldmF0aW9uXCIgc2NlbmVcclxuICAgIHRoaXMuZWxldmF0aW9uU2NlbmVNb2RlbCA9IG5ldyBFbGV2YXRpb25TY2VuZU1vZGVsKCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7QmFua1NjZW5lTW9kZWx9IC0gbW9kZWwgaW5zdGFuY2UgZm9yIHRoZSBcIkJhbmtcIiBzY2VuZVxyXG4gICAgdGhpcy5iYW5rU2NlbmVNb2RlbCA9IG5ldyBCYW5rU2NlbmVNb2RlbCgpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1RlbXBlcmF0dXJlU2NlbmVNb2RlbH0gLSBtb2RlbCBpbnN0YW5jZSBmb3IgdGhlIFwiVGVtcGVyYXR1cmVcIiBzY2VuZVxyXG4gICAgdGhpcy50ZW1wZXJhdHVyZVNjZW5lTW9kZWwgPSBuZXcgVGVtcGVyYXR1cmVTY2VuZU1vZGVsKCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1NjZW5lTW9kZWxbXX0gLSBhbGwgb2YgdGhlIHNjZW5lIG1vZGVscyBpbiBhbiBhcnJheSBmb3IgY29udmVuaWVuY2VcclxuICAgIHRoaXMuc2NlbmVNb2RlbHMgPSBbXHJcbiAgICAgIHRoaXMuZWxldmF0aW9uU2NlbmVNb2RlbCxcclxuICAgICAgdGhpcy5iYW5rU2NlbmVNb2RlbCxcclxuICAgICAgdGhpcy50ZW1wZXJhdHVyZVNjZW5lTW9kZWxcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXN0b3JlIGluaXRpYWwgc3RhdGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5zZWxlY3RlZFNjZW5lUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc2NlbmVNb2RlbHMuZm9yRWFjaCggc2NlbmVNb2RlbCA9PiB7XHJcbiAgICAgIHNjZW5lTW9kZWwucmVzZXQoKTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbm51bWJlckxpbmVJbnRlZ2Vycy5yZWdpc3RlciggJ05MSUV4cGxvcmVNb2RlbCcsIE5MSUV4cGxvcmVNb2RlbCApO1xyXG5leHBvcnQgZGVmYXVsdCBOTElFeHBsb3JlTW9kZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsNkJBQTZCLE1BQU0sc0RBQXNEO0FBQ2hHLE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUM1RCxPQUFPQyxjQUFjLE1BQU0scUJBQXFCO0FBQ2hELE9BQU9DLG1CQUFtQixNQUFNLDBCQUEwQjtBQUMxRCxPQUFPQyxRQUFRLE1BQU0sZUFBZTtBQUNwQyxPQUFPQyxxQkFBcUIsTUFBTSw0QkFBNEI7QUFFOUQsTUFBTUMsZUFBZSxDQUFDO0VBRXBCO0FBQ0Y7QUFDQTtFQUNFQyxXQUFXQSxDQUFBLEVBQUc7SUFFWjtJQUNBLElBQUksQ0FBQ0MscUJBQXFCLEdBQUcsSUFBSVIsNkJBQTZCLENBQUVJLFFBQVEsRUFBRUEsUUFBUSxDQUFDSyxTQUFVLENBQUM7O0lBRTlGO0lBQ0EsSUFBSSxDQUFDQyxtQkFBbUIsR0FBRyxJQUFJUCxtQkFBbUIsQ0FBQyxDQUFDOztJQUVwRDtJQUNBLElBQUksQ0FBQ1EsY0FBYyxHQUFHLElBQUlULGNBQWMsQ0FBQyxDQUFDOztJQUUxQztJQUNBLElBQUksQ0FBQ1UscUJBQXFCLEdBQUcsSUFBSVAscUJBQXFCLENBQUMsQ0FBQzs7SUFFeEQ7SUFDQSxJQUFJLENBQUNRLFdBQVcsR0FBRyxDQUNqQixJQUFJLENBQUNILG1CQUFtQixFQUN4QixJQUFJLENBQUNDLGNBQWMsRUFDbkIsSUFBSSxDQUFDQyxxQkFBcUIsQ0FDM0I7RUFDSDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFRSxLQUFLQSxDQUFBLEVBQUc7SUFDTixJQUFJLENBQUNOLHFCQUFxQixDQUFDTSxLQUFLLENBQUMsQ0FBQztJQUNsQyxJQUFJLENBQUNELFdBQVcsQ0FBQ0UsT0FBTyxDQUFFQyxVQUFVLElBQUk7TUFDdENBLFVBQVUsQ0FBQ0YsS0FBSyxDQUFDLENBQUM7SUFDcEIsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBYixrQkFBa0IsQ0FBQ2dCLFFBQVEsQ0FBRSxpQkFBaUIsRUFBRVgsZUFBZ0IsQ0FBQztBQUNqRSxlQUFlQSxlQUFlIn0=