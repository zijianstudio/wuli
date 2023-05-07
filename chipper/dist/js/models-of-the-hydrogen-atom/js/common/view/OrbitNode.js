// Copyright 2022, University of Colorado Boulder

/**
 * OrbitNode draws one electron orbit for the Bohr and de Broglie models.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Shape } from '../../../../kite/js/imports.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { Path } from '../../../../scenery/js/imports.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
import MOTHAColors from '../MOTHAColors.js';
// PathOptions not supported

export default class OrbitNode extends Path {
  /**
   * @param radius - in view coordinates
   * @param [providedOptions]
   */
  constructor(radius, providedOptions) {
    const options = optionize()({
      // SelfOptions
      yScale: 1,
      // PathOptions
      stroke: MOTHAColors.orbitStrokeProperty,
      lineWidth: 1,
      lineDash: [3, 3]
    }, providedOptions);
    assert && assert(options.yScale > 0 && options.yScale <= 1);
    const shape = Shape.ellipse(0, 0, radius, radius * options.yScale, 0);
    super(shape, options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
modelsOfTheHydrogenAtom.register('OrbitNode', OrbitNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIm9wdGlvbml6ZSIsIlBhdGgiLCJtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSIsIk1PVEhBQ29sb3JzIiwiT3JiaXROb2RlIiwiY29uc3RydWN0b3IiLCJyYWRpdXMiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwieVNjYWxlIiwic3Ryb2tlIiwib3JiaXRTdHJva2VQcm9wZXJ0eSIsImxpbmVXaWR0aCIsImxpbmVEYXNoIiwiYXNzZXJ0Iiwic2hhcGUiLCJlbGxpcHNlIiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiT3JiaXROb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBPcmJpdE5vZGUgZHJhd3Mgb25lIGVsZWN0cm9uIG9yYml0IGZvciB0aGUgQm9ociBhbmQgZGUgQnJvZ2xpZSBtb2RlbHMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgeyBQYXRoLCBQYXRoT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSBmcm9tICcuLi8uLi9tb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbS5qcyc7XHJcbmltcG9ydCBNT1RIQUNvbG9ycyBmcm9tICcuLi9NT1RIQUNvbG9ycy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG5cclxuICAvLyBJbiAyRCwgYW4gb3JiaXQgaXMgYSBjaXJjbGUuIEluIDNELCBhbiBvcmJpdCBpcyBhbiBlbGxpcHNlLCBmb3Jlc2hvcnRlbmVkIGluIHRoZSB5IGRpbWVuc2lvbi5cclxuICAvLyBCZWNhdXNlIHdlJ3JlIG9ubHkgdXNlIDNEIHZpZXdpbmcgYW5nbGVzIHRoYXQgYXJlIHJvdGF0aW9ucyBhYm91dCB0aGUgeC1heGlzLCB3ZSBjYW4gZ2V0IGF3YXlcclxuICAvLyB3aXRoIHNpbXBseSBzY2FsaW5nIHRoZSB5IGRpbWVuc2lvbiB0byBjcmVhdGUgdGhlIGVsbGlwc2UuIFNvLi4uXHJcbiAgLy8gVG8gY3JlYXRlIGEgMkQgb3JiaXQsIHNldCB0aGlzIHZhbHVlIHRvIDEuXHJcbiAgLy8gVG8gY3JlYXRlIGEgM0Qgb3JiaXQsIHNldCB0aGlzIHRvIGEgdmFsdWUgaW4gdGhlIHJhbmdlICgwLDEpIGV4Y2x1c2l2ZS5cclxuICB5U2NhbGU/OiBudW1iZXI7XHJcbn07XHJcblxyXG50eXBlIE9yYml0Tm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9uczsgLy8gUGF0aE9wdGlvbnMgbm90IHN1cHBvcnRlZFxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3JiaXROb2RlIGV4dGVuZHMgUGF0aCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSByYWRpdXMgLSBpbiB2aWV3IGNvb3JkaW5hdGVzXHJcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCByYWRpdXM6IG51bWJlciwgcHJvdmlkZWRPcHRpb25zPzogT3JiaXROb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPE9yYml0Tm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBQYXRoT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgeVNjYWxlOiAxLFxyXG5cclxuICAgICAgLy8gUGF0aE9wdGlvbnNcclxuICAgICAgc3Ryb2tlOiBNT1RIQUNvbG9ycy5vcmJpdFN0cm9rZVByb3BlcnR5LFxyXG4gICAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICAgIGxpbmVEYXNoOiBbIDMsIDMgXVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy55U2NhbGUgPiAwICYmIG9wdGlvbnMueVNjYWxlIDw9IDEgKTtcclxuXHJcbiAgICBjb25zdCBzaGFwZSA9IFNoYXBlLmVsbGlwc2UoIDAsIDAsIHJhZGl1cywgcmFkaXVzICogb3B0aW9ucy55U2NhbGUsIDAgKTtcclxuXHJcbiAgICBzdXBlciggc2hhcGUsIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5tb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbS5yZWdpc3RlciggJ09yYml0Tm9kZScsIE9yYml0Tm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFDN0QsU0FBU0MsSUFBSSxRQUFxQixtQ0FBbUM7QUFDckUsT0FBT0MsdUJBQXVCLE1BQU0sa0NBQWtDO0FBQ3RFLE9BQU9DLFdBQVcsTUFBTSxtQkFBbUI7QUFZTjs7QUFFckMsZUFBZSxNQUFNQyxTQUFTLFNBQVNILElBQUksQ0FBQztFQUUxQztBQUNGO0FBQ0E7QUFDQTtFQUNTSSxXQUFXQSxDQUFFQyxNQUFjLEVBQUVDLGVBQWtDLEVBQUc7SUFFdkUsTUFBTUMsT0FBTyxHQUFHUixTQUFTLENBQTZDLENBQUMsQ0FBRTtNQUV2RTtNQUNBUyxNQUFNLEVBQUUsQ0FBQztNQUVUO01BQ0FDLE1BQU0sRUFBRVAsV0FBVyxDQUFDUSxtQkFBbUI7TUFDdkNDLFNBQVMsRUFBRSxDQUFDO01BQ1pDLFFBQVEsRUFBRSxDQUFFLENBQUMsRUFBRSxDQUFDO0lBQ2xCLENBQUMsRUFBRU4sZUFBZ0IsQ0FBQztJQUVwQk8sTUFBTSxJQUFJQSxNQUFNLENBQUVOLE9BQU8sQ0FBQ0MsTUFBTSxHQUFHLENBQUMsSUFBSUQsT0FBTyxDQUFDQyxNQUFNLElBQUksQ0FBRSxDQUFDO0lBRTdELE1BQU1NLEtBQUssR0FBR2hCLEtBQUssQ0FBQ2lCLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFVixNQUFNLEVBQUVBLE1BQU0sR0FBR0UsT0FBTyxDQUFDQyxNQUFNLEVBQUUsQ0FBRSxDQUFDO0lBRXZFLEtBQUssQ0FBRU0sS0FBSyxFQUFFUCxPQUFRLENBQUM7RUFDekI7RUFFZ0JTLE9BQU9BLENBQUEsRUFBUztJQUM5QkgsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0csT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBZix1QkFBdUIsQ0FBQ2dCLFFBQVEsQ0FBRSxXQUFXLEVBQUVkLFNBQVUsQ0FBQyJ9