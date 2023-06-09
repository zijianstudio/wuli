// Copyright 2018-2022, University of Colorado Boulder

/**
 * DiffusionScreen is the 'Diffusion' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import GasPropertiesScreen from '../common/GasPropertiesScreen.js';
import GasPropertiesIconFactory from '../common/view/GasPropertiesIconFactory.js';
import gasProperties from '../gasProperties.js';
import GasPropertiesStrings from '../GasPropertiesStrings.js';
import DiffusionModel from './model/DiffusionModel.js';
import DiffusionScreenView from './view/DiffusionScreenView.js';
export default class DiffusionScreen extends GasPropertiesScreen {
  constructor(tandem) {
    const createModel = () => new DiffusionModel(tandem.createTandem('model'));
    const createView = model => new DiffusionScreenView(model, tandem.createTandem('view'));
    super(createModel, createView, {
      name: GasPropertiesStrings.screen.diffusionStringProperty,
      homeScreenIcon: GasPropertiesIconFactory.createDiffusionScreenIcon(),
      tandem: tandem
    });
  }
}
gasProperties.register('DiffusionScreen', DiffusionScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHYXNQcm9wZXJ0aWVzU2NyZWVuIiwiR2FzUHJvcGVydGllc0ljb25GYWN0b3J5IiwiZ2FzUHJvcGVydGllcyIsIkdhc1Byb3BlcnRpZXNTdHJpbmdzIiwiRGlmZnVzaW9uTW9kZWwiLCJEaWZmdXNpb25TY3JlZW5WaWV3IiwiRGlmZnVzaW9uU2NyZWVuIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJjcmVhdGVNb2RlbCIsImNyZWF0ZVRhbmRlbSIsImNyZWF0ZVZpZXciLCJtb2RlbCIsIm5hbWUiLCJzY3JlZW4iLCJkaWZmdXNpb25TdHJpbmdQcm9wZXJ0eSIsImhvbWVTY3JlZW5JY29uIiwiY3JlYXRlRGlmZnVzaW9uU2NyZWVuSWNvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRGlmZnVzaW9uU2NyZWVuLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERpZmZ1c2lvblNjcmVlbiBpcyB0aGUgJ0RpZmZ1c2lvbicgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBHYXNQcm9wZXJ0aWVzU2NyZWVuIGZyb20gJy4uL2NvbW1vbi9HYXNQcm9wZXJ0aWVzU2NyZWVuLmpzJztcclxuaW1wb3J0IEdhc1Byb3BlcnRpZXNJY29uRmFjdG9yeSBmcm9tICcuLi9jb21tb24vdmlldy9HYXNQcm9wZXJ0aWVzSWNvbkZhY3RvcnkuanMnO1xyXG5pbXBvcnQgZ2FzUHJvcGVydGllcyBmcm9tICcuLi9nYXNQcm9wZXJ0aWVzLmpzJztcclxuaW1wb3J0IEdhc1Byb3BlcnRpZXNTdHJpbmdzIGZyb20gJy4uL0dhc1Byb3BlcnRpZXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IERpZmZ1c2lvbk1vZGVsIGZyb20gJy4vbW9kZWwvRGlmZnVzaW9uTW9kZWwuanMnO1xyXG5pbXBvcnQgRGlmZnVzaW9uU2NyZWVuVmlldyBmcm9tICcuL3ZpZXcvRGlmZnVzaW9uU2NyZWVuVmlldy5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaWZmdXNpb25TY3JlZW4gZXh0ZW5kcyBHYXNQcm9wZXJ0aWVzU2NyZWVuPERpZmZ1c2lvbk1vZGVsLCBEaWZmdXNpb25TY3JlZW5WaWV3PiB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgY29uc3QgY3JlYXRlTW9kZWwgPSAoKSA9PiBuZXcgRGlmZnVzaW9uTW9kZWwoIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb2RlbCcgKSApO1xyXG4gICAgY29uc3QgY3JlYXRlVmlldyA9ICggbW9kZWw6IERpZmZ1c2lvbk1vZGVsICkgPT4gbmV3IERpZmZ1c2lvblNjcmVlblZpZXcoIG1vZGVsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlldycgKSApO1xyXG5cclxuICAgIHN1cGVyKCBjcmVhdGVNb2RlbCwgY3JlYXRlVmlldywge1xyXG4gICAgICBuYW1lOiBHYXNQcm9wZXJ0aWVzU3RyaW5ncy5zY3JlZW4uZGlmZnVzaW9uU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGhvbWVTY3JlZW5JY29uOiBHYXNQcm9wZXJ0aWVzSWNvbkZhY3RvcnkuY3JlYXRlRGlmZnVzaW9uU2NyZWVuSWNvbigpLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZ2FzUHJvcGVydGllcy5yZWdpc3RlciggJ0RpZmZ1c2lvblNjcmVlbicsIERpZmZ1c2lvblNjcmVlbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxtQkFBbUIsTUFBTSxrQ0FBa0M7QUFDbEUsT0FBT0Msd0JBQXdCLE1BQU0sNENBQTRDO0FBQ2pGLE9BQU9DLGFBQWEsTUFBTSxxQkFBcUI7QUFDL0MsT0FBT0Msb0JBQW9CLE1BQU0sNEJBQTRCO0FBQzdELE9BQU9DLGNBQWMsTUFBTSwyQkFBMkI7QUFDdEQsT0FBT0MsbUJBQW1CLE1BQU0sK0JBQStCO0FBRS9ELGVBQWUsTUFBTUMsZUFBZSxTQUFTTixtQkFBbUIsQ0FBc0M7RUFFN0ZPLFdBQVdBLENBQUVDLE1BQWMsRUFBRztJQUVuQyxNQUFNQyxXQUFXLEdBQUdBLENBQUEsS0FBTSxJQUFJTCxjQUFjLENBQUVJLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLE9BQVEsQ0FBRSxDQUFDO0lBQzlFLE1BQU1DLFVBQVUsR0FBS0MsS0FBcUIsSUFBTSxJQUFJUCxtQkFBbUIsQ0FBRU8sS0FBSyxFQUFFSixNQUFNLENBQUNFLFlBQVksQ0FBRSxNQUFPLENBQUUsQ0FBQztJQUUvRyxLQUFLLENBQUVELFdBQVcsRUFBRUUsVUFBVSxFQUFFO01BQzlCRSxJQUFJLEVBQUVWLG9CQUFvQixDQUFDVyxNQUFNLENBQUNDLHVCQUF1QjtNQUN6REMsY0FBYyxFQUFFZix3QkFBd0IsQ0FBQ2dCLHlCQUF5QixDQUFDLENBQUM7TUFDcEVULE1BQU0sRUFBRUE7SUFDVixDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUFOLGFBQWEsQ0FBQ2dCLFFBQVEsQ0FBRSxpQkFBaUIsRUFBRVosZUFBZ0IsQ0FBQyJ9