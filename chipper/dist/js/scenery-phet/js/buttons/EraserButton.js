// Copyright 2014-2022, University of Colorado Boulder

/**
 * Button with an eraser icon.
 *
 * @author John Blanco
 */

import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Image } from '../../../scenery/js/imports.js';
import RectangularPushButton from '../../../sun/js/buttons/RectangularPushButton.js';
import eraser_png from '../../images/eraser_png.js';
import PhetColorScheme from '../PhetColorScheme.js';
import sceneryPhet from '../sceneryPhet.js';
export default class EraserButton extends RectangularPushButton {
  constructor(providedOptions) {
    const options = optionize()({
      // SelfOptions
      iconWidth: 20,
      // RectangularPushButtonOptions
      baseColor: PhetColorScheme.BUTTON_YELLOW
    }, providedOptions);

    // eraser icon
    options.content = new Image(eraser_png);
    options.content.scale(options.iconWidth / options.content.width);
    super(options);

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('scenery-phet', 'EraserButton', this);
  }
}
sceneryPhet.register('EraserButton', EraserButton);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiSW1hZ2UiLCJSZWN0YW5ndWxhclB1c2hCdXR0b24iLCJlcmFzZXJfcG5nIiwiUGhldENvbG9yU2NoZW1lIiwic2NlbmVyeVBoZXQiLCJFcmFzZXJCdXR0b24iLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJpY29uV2lkdGgiLCJiYXNlQ29sb3IiLCJCVVRUT05fWUVMTE9XIiwiY29udGVudCIsInNjYWxlIiwid2lkdGgiLCJhc3NlcnQiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRXJhc2VyQnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJ1dHRvbiB3aXRoIGFuIGVyYXNlciBpY29uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLCB7IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgZXJhc2VyX3BuZyBmcm9tICcuLi8uLi9pbWFnZXMvZXJhc2VyX3BuZy5qcyc7XHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vUGhldENvbG9yU2NoZW1lLmpzJztcclxuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4uL3NjZW5lcnlQaGV0LmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgaWNvbldpZHRoPzogbnVtYmVyOyAvLyB3aWR0aCBvZiBlcmFzZXIgaWNvbiwgdXNlZCBmb3Igc2NhbGluZywgdGhlIGFzcGVjdCByYXRpbyB3aWxsIGRldGVybWluZSBoZWlnaHRcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIEVyYXNlckJ1dHRvbk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8UmVjdGFuZ3VsYXJQdXNoQnV0dG9uT3B0aW9ucywgJ2NvbnRlbnQnPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVyYXNlckJ1dHRvbiBleHRlbmRzIFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogRXJhc2VyQnV0dG9uT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEVyYXNlckJ1dHRvbk9wdGlvbnMsIFNlbGZPcHRpb25zLCBSZWN0YW5ndWxhclB1c2hCdXR0b25PcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICBpY29uV2lkdGg6IDIwLFxyXG5cclxuICAgICAgLy8gUmVjdGFuZ3VsYXJQdXNoQnV0dG9uT3B0aW9uc1xyXG4gICAgICBiYXNlQ29sb3I6IFBoZXRDb2xvclNjaGVtZS5CVVRUT05fWUVMTE9XXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBlcmFzZXIgaWNvblxyXG4gICAgb3B0aW9ucy5jb250ZW50ID0gbmV3IEltYWdlKCBlcmFzZXJfcG5nICk7XHJcbiAgICBvcHRpb25zLmNvbnRlbnQuc2NhbGUoIG9wdGlvbnMuaWNvbldpZHRoIC8gb3B0aW9ucy5jb250ZW50LndpZHRoICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcclxuICAgIGFzc2VydCAmJiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3NjZW5lcnktcGhldCcsICdFcmFzZXJCdXR0b24nLCB0aGlzICk7XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0VyYXNlckJ1dHRvbicsIEVyYXNlckJ1dHRvbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxnQkFBZ0IsTUFBTSx5REFBeUQ7QUFFdEYsT0FBT0MsU0FBUyxNQUFNLG9DQUFvQztBQUMxRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLHFCQUFxQixNQUF3QyxrREFBa0Q7QUFDdEgsT0FBT0MsVUFBVSxNQUFNLDRCQUE0QjtBQUNuRCxPQUFPQyxlQUFlLE1BQU0sdUJBQXVCO0FBQ25ELE9BQU9DLFdBQVcsTUFBTSxtQkFBbUI7QUFRM0MsZUFBZSxNQUFNQyxZQUFZLFNBQVNKLHFCQUFxQixDQUFDO0VBRXZESyxXQUFXQSxDQUFFQyxlQUFxQyxFQUFHO0lBRTFELE1BQU1DLE9BQU8sR0FBR1QsU0FBUyxDQUFpRSxDQUFDLENBQUU7TUFFM0Y7TUFDQVUsU0FBUyxFQUFFLEVBQUU7TUFFYjtNQUNBQyxTQUFTLEVBQUVQLGVBQWUsQ0FBQ1E7SUFDN0IsQ0FBQyxFQUFFSixlQUFnQixDQUFDOztJQUVwQjtJQUNBQyxPQUFPLENBQUNJLE9BQU8sR0FBRyxJQUFJWixLQUFLLENBQUVFLFVBQVcsQ0FBQztJQUN6Q00sT0FBTyxDQUFDSSxPQUFPLENBQUNDLEtBQUssQ0FBRUwsT0FBTyxDQUFDQyxTQUFTLEdBQUdELE9BQU8sQ0FBQ0ksT0FBTyxDQUFDRSxLQUFNLENBQUM7SUFFbEUsS0FBSyxDQUFFTixPQUFRLENBQUM7O0lBRWhCO0lBQ0FPLE1BQU0sSUFBSUMsSUFBSSxDQUFDQyxPQUFPLENBQUNDLGVBQWUsQ0FBQ0MsTUFBTSxJQUFJckIsZ0JBQWdCLENBQUNzQixlQUFlLENBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxJQUFLLENBQUM7RUFDM0g7QUFDRjtBQUVBaEIsV0FBVyxDQUFDaUIsUUFBUSxDQUFFLGNBQWMsRUFBRWhCLFlBQWEsQ0FBQyJ9