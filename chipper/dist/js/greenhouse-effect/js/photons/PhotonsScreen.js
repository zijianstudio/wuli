// Copyright 2021-2023, University of Colorado Boulder

/**
 * @author John Blanco
 */

import Screen from '../../../joist/js/Screen.js';
import GreenhouseEffectColors from '../common/GreenhouseEffectColors.js';
import GreenhouseEffectConstants from '../common/GreenhouseEffectConstants.js';
import GreenhouseEffectIconFactory from '../common/view/GreenhouseEffectIconFactory.js';
import GreenhouseEffectKeyboardHelpContent from '../common/view/GreenhouseEffectKeyboardHelpContent.js';
import greenhouseEffect from '../greenhouseEffect.js';
import GreenhouseEffectStrings from '../GreenhouseEffectStrings.js';
import PhotonsModel from './model/PhotonsModel.js';
import PhotonsScreenView from './view/PhotonsScreenView.js';
class PhotonsScreen extends Screen {
  constructor(tandem) {
    const options = {
      backgroundColorProperty: GreenhouseEffectColors.screenBackgroundColorProperty,
      homeScreenIcon: GreenhouseEffectIconFactory.createPhotonsHomeScreenIcon(),
      maxDT: GreenhouseEffectConstants.MAX_DT,
      tandem: tandem,
      name: GreenhouseEffectStrings.screen.photonsStringProperty,
      descriptionContent: GreenhouseEffectStrings.a11y.photons.homeScreenDescriptionStringProperty,
      createKeyboardHelpNode: () => new GreenhouseEffectKeyboardHelpContent({
        includeFluxMeterHelp: true
      })
    };
    super(() => new PhotonsModel(tandem.createTandem('model')), model => new PhotonsScreenView(model, tandem.createTandem('view')), options);
  }
}
greenhouseEffect.register('PhotonsScreen', PhotonsScreen);
export default PhotonsScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW4iLCJHcmVlbmhvdXNlRWZmZWN0Q29sb3JzIiwiR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cyIsIkdyZWVuaG91c2VFZmZlY3RJY29uRmFjdG9yeSIsIkdyZWVuaG91c2VFZmZlY3RLZXlib2FyZEhlbHBDb250ZW50IiwiZ3JlZW5ob3VzZUVmZmVjdCIsIkdyZWVuaG91c2VFZmZlY3RTdHJpbmdzIiwiUGhvdG9uc01vZGVsIiwiUGhvdG9uc1NjcmVlblZpZXciLCJQaG90b25zU2NyZWVuIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJvcHRpb25zIiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJzY3JlZW5CYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsImhvbWVTY3JlZW5JY29uIiwiY3JlYXRlUGhvdG9uc0hvbWVTY3JlZW5JY29uIiwibWF4RFQiLCJNQVhfRFQiLCJuYW1lIiwic2NyZWVuIiwicGhvdG9uc1N0cmluZ1Byb3BlcnR5IiwiZGVzY3JpcHRpb25Db250ZW50IiwiYTExeSIsInBob3RvbnMiLCJob21lU2NyZWVuRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSIsImNyZWF0ZUtleWJvYXJkSGVscE5vZGUiLCJpbmNsdWRlRmx1eE1ldGVySGVscCIsImNyZWF0ZVRhbmRlbSIsIm1vZGVsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQaG90b25zU2NyZWVuLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgU2NyZWVuIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbi5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBHcmVlbmhvdXNlRWZmZWN0Q29sb3JzIGZyb20gJy4uL2NvbW1vbi9HcmVlbmhvdXNlRWZmZWN0Q29sb3JzLmpzJztcclxuaW1wb3J0IEdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMgZnJvbSAnLi4vY29tbW9uL0dyZWVuaG91c2VFZmZlY3RDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdEljb25GYWN0b3J5IGZyb20gJy4uL2NvbW1vbi92aWV3L0dyZWVuaG91c2VFZmZlY3RJY29uRmFjdG9yeS5qcyc7XHJcbmltcG9ydCBHcmVlbmhvdXNlRWZmZWN0S2V5Ym9hcmRIZWxwQ29udGVudCBmcm9tICcuLi9jb21tb24vdmlldy9HcmVlbmhvdXNlRWZmZWN0S2V5Ym9hcmRIZWxwQ29udGVudC5qcyc7XHJcbmltcG9ydCBncmVlbmhvdXNlRWZmZWN0IGZyb20gJy4uL2dyZWVuaG91c2VFZmZlY3QuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MgZnJvbSAnLi4vR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuanMnO1xyXG5pbXBvcnQgUGhvdG9uc01vZGVsIGZyb20gJy4vbW9kZWwvUGhvdG9uc01vZGVsLmpzJztcclxuaW1wb3J0IFBob3RvbnNTY3JlZW5WaWV3IGZyb20gJy4vdmlldy9QaG90b25zU2NyZWVuVmlldy5qcyc7XHJcblxyXG5jbGFzcyBQaG90b25zU2NyZWVuIGV4dGVuZHMgU2NyZWVuPFBob3RvbnNNb2RlbCwgUGhvdG9uc1NjcmVlblZpZXc+IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0ge1xyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogR3JlZW5ob3VzZUVmZmVjdENvbG9ycy5zY3JlZW5CYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSxcclxuICAgICAgaG9tZVNjcmVlbkljb246IEdyZWVuaG91c2VFZmZlY3RJY29uRmFjdG9yeS5jcmVhdGVQaG90b25zSG9tZVNjcmVlbkljb24oKSxcclxuICAgICAgbWF4RFQ6IEdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMuTUFYX0RULFxyXG4gICAgICB0YW5kZW06IHRhbmRlbSxcclxuICAgICAgbmFtZTogR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3Muc2NyZWVuLnBob3RvbnNTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgZGVzY3JpcHRpb25Db250ZW50OiBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnBob3RvbnMuaG9tZVNjcmVlbkRlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGNyZWF0ZUtleWJvYXJkSGVscE5vZGU6ICgpID0+IG5ldyBHcmVlbmhvdXNlRWZmZWN0S2V5Ym9hcmRIZWxwQ29udGVudCggeyBpbmNsdWRlRmx1eE1ldGVySGVscDogdHJ1ZSB9IClcclxuICAgIH07XHJcblxyXG4gICAgc3VwZXIoXHJcbiAgICAgICgpID0+IG5ldyBQaG90b25zTW9kZWwoIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb2RlbCcgKSApLFxyXG4gICAgICBtb2RlbCA9PiBuZXcgUGhvdG9uc1NjcmVlblZpZXcoIG1vZGVsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlldycgKSApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuZ3JlZW5ob3VzZUVmZmVjdC5yZWdpc3RlciggJ1Bob3RvbnNTY3JlZW4nLCBQaG90b25zU2NyZWVuICk7XHJcbmV4cG9ydCBkZWZhdWx0IFBob3RvbnNTY3JlZW47Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLDZCQUE2QjtBQUVoRCxPQUFPQyxzQkFBc0IsTUFBTSxxQ0FBcUM7QUFDeEUsT0FBT0MseUJBQXlCLE1BQU0sd0NBQXdDO0FBQzlFLE9BQU9DLDJCQUEyQixNQUFNLCtDQUErQztBQUN2RixPQUFPQyxtQ0FBbUMsTUFBTSx1REFBdUQ7QUFDdkcsT0FBT0MsZ0JBQWdCLE1BQU0sd0JBQXdCO0FBQ3JELE9BQU9DLHVCQUF1QixNQUFNLCtCQUErQjtBQUNuRSxPQUFPQyxZQUFZLE1BQU0seUJBQXlCO0FBQ2xELE9BQU9DLGlCQUFpQixNQUFNLDZCQUE2QjtBQUUzRCxNQUFNQyxhQUFhLFNBQVNULE1BQU0sQ0FBa0M7RUFFM0RVLFdBQVdBLENBQUVDLE1BQWMsRUFBRztJQUVuQyxNQUFNQyxPQUFPLEdBQUc7TUFDZEMsdUJBQXVCLEVBQUVaLHNCQUFzQixDQUFDYSw2QkFBNkI7TUFDN0VDLGNBQWMsRUFBRVosMkJBQTJCLENBQUNhLDJCQUEyQixDQUFDLENBQUM7TUFDekVDLEtBQUssRUFBRWYseUJBQXlCLENBQUNnQixNQUFNO01BQ3ZDUCxNQUFNLEVBQUVBLE1BQU07TUFDZFEsSUFBSSxFQUFFYix1QkFBdUIsQ0FBQ2MsTUFBTSxDQUFDQyxxQkFBcUI7TUFDMURDLGtCQUFrQixFQUFFaEIsdUJBQXVCLENBQUNpQixJQUFJLENBQUNDLE9BQU8sQ0FBQ0MsbUNBQW1DO01BQzVGQyxzQkFBc0IsRUFBRUEsQ0FBQSxLQUFNLElBQUl0QixtQ0FBbUMsQ0FBRTtRQUFFdUIsb0JBQW9CLEVBQUU7TUFBSyxDQUFFO0lBQ3hHLENBQUM7SUFFRCxLQUFLLENBQ0gsTUFBTSxJQUFJcEIsWUFBWSxDQUFFSSxNQUFNLENBQUNpQixZQUFZLENBQUUsT0FBUSxDQUFFLENBQUMsRUFDeERDLEtBQUssSUFBSSxJQUFJckIsaUJBQWlCLENBQUVxQixLQUFLLEVBQUVsQixNQUFNLENBQUNpQixZQUFZLENBQUUsTUFBTyxDQUFFLENBQUMsRUFDdEVoQixPQUNGLENBQUM7RUFDSDtBQUNGO0FBRUFQLGdCQUFnQixDQUFDeUIsUUFBUSxDQUFFLGVBQWUsRUFBRXJCLGFBQWMsQ0FBQztBQUMzRCxlQUFlQSxhQUFhIn0=