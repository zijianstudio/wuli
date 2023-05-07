// Copyright 2022-2023, University of Colorado Boulder

/**
 * Screen for the "Variability" screen
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize from '../../../phet-core/js/optionize.js';
import CAVColors from '../common/CAVColors.js';
import { Image } from '../../../scenery/js/imports.js';
import centerAndVariability from '../centerAndVariability.js';
import VariabilityModel from './model/VariabilityModel.js';
import CAVScreen from '../common/CAVScreen.js';
import VariabilityScreenView from './view/VariabilityScreenView.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import CenterAndVariabilityStrings from '../CenterAndVariabilityStrings.js';
import variabilityScreenIcon_png from '../../images/variabilityScreenIcon_png.js';
export default class VariabilityScreen extends CAVScreen {
  constructor(providedOptions) {
    const options = optionize()({
      name: CenterAndVariabilityStrings.screen.variabilityStringProperty,
      homeScreenIcon: new ScreenIcon(new Image(variabilityScreenIcon_png), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      backgroundColorProperty: CAVColors.screenBackgroundColorProperty
    }, providedOptions);
    super(() => new VariabilityModel({
      tandem: options.tandem.createTandem('model'),
      instrumentMeanPredictionProperty: true
    }), model => new VariabilityScreenView(model, {
      tandem: options.tandem.createTandem('view')
    }), options);
  }
}
centerAndVariability.register('VariabilityScreen', VariabilityScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJDQVZDb2xvcnMiLCJJbWFnZSIsImNlbnRlckFuZFZhcmlhYmlsaXR5IiwiVmFyaWFiaWxpdHlNb2RlbCIsIkNBVlNjcmVlbiIsIlZhcmlhYmlsaXR5U2NyZWVuVmlldyIsIlNjcmVlbkljb24iLCJDZW50ZXJBbmRWYXJpYWJpbGl0eVN0cmluZ3MiLCJ2YXJpYWJpbGl0eVNjcmVlbkljb25fcG5nIiwiVmFyaWFiaWxpdHlTY3JlZW4iLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJuYW1lIiwic2NyZWVuIiwidmFyaWFiaWxpdHlTdHJpbmdQcm9wZXJ0eSIsImhvbWVTY3JlZW5JY29uIiwibWF4SWNvbldpZHRoUHJvcG9ydGlvbiIsIm1heEljb25IZWlnaHRQcm9wb3J0aW9uIiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJzY3JlZW5CYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImluc3RydW1lbnRNZWFuUHJlZGljdGlvblByb3BlcnR5IiwibW9kZWwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlZhcmlhYmlsaXR5U2NyZWVuLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNjcmVlbiBmb3IgdGhlIFwiVmFyaWFiaWxpdHlcIiBzY3JlZW5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgQ0FWQ29sb3JzIGZyb20gJy4uL2NvbW1vbi9DQVZDb2xvcnMuanMnO1xyXG5pbXBvcnQgeyBJbWFnZSB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBjZW50ZXJBbmRWYXJpYWJpbGl0eSBmcm9tICcuLi9jZW50ZXJBbmRWYXJpYWJpbGl0eS5qcyc7XHJcbmltcG9ydCBWYXJpYWJpbGl0eU1vZGVsIGZyb20gJy4vbW9kZWwvVmFyaWFiaWxpdHlNb2RlbC5qcyc7XHJcbmltcG9ydCBDQVZTY3JlZW4sIHsgQ0FWU2NyZWVuT3B0aW9ucyB9IGZyb20gJy4uL2NvbW1vbi9DQVZTY3JlZW4uanMnO1xyXG5pbXBvcnQgVmFyaWFiaWxpdHlTY3JlZW5WaWV3IGZyb20gJy4vdmlldy9WYXJpYWJpbGl0eVNjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IENlbnRlckFuZFZhcmlhYmlsaXR5U3RyaW5ncyBmcm9tICcuLi9DZW50ZXJBbmRWYXJpYWJpbGl0eVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgdmFyaWFiaWxpdHlTY3JlZW5JY29uX3BuZyBmcm9tICcuLi8uLi9pbWFnZXMvdmFyaWFiaWxpdHlTY3JlZW5JY29uX3BuZy5qcyc7XHJcblxyXG50eXBlIFZhcmlhYmlsaXR5U2NyZWVuT3B0aW9ucyA9IENBVlNjcmVlbk9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWYXJpYWJpbGl0eVNjcmVlbiBleHRlbmRzIENBVlNjcmVlbjxWYXJpYWJpbGl0eU1vZGVsLCBWYXJpYWJpbGl0eVNjcmVlblZpZXc+IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM6IFZhcmlhYmlsaXR5U2NyZWVuT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFZhcmlhYmlsaXR5U2NyZWVuT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucywgQ0FWU2NyZWVuT3B0aW9ucz4oKSgge1xyXG4gICAgICBuYW1lOiBDZW50ZXJBbmRWYXJpYWJpbGl0eVN0cmluZ3Muc2NyZWVuLnZhcmlhYmlsaXR5U3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGhvbWVTY3JlZW5JY29uOiBuZXcgU2NyZWVuSWNvbiggbmV3IEltYWdlKCB2YXJpYWJpbGl0eVNjcmVlbkljb25fcG5nICksIHtcclxuICAgICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICAgIG1heEljb25IZWlnaHRQcm9wb3J0aW9uOiAxXHJcbiAgICAgIH0gKSxcclxuICAgICAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IENBVkNvbG9ycy5zY3JlZW5CYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoXHJcbiAgICAgICgpID0+IG5ldyBWYXJpYWJpbGl0eU1vZGVsKCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb2RlbCcgKSxcclxuICAgICAgICBpbnN0cnVtZW50TWVhblByZWRpY3Rpb25Qcm9wZXJ0eTogdHJ1ZVxyXG4gICAgICB9ICksXHJcbiAgICAgICggbW9kZWw6IFZhcmlhYmlsaXR5TW9kZWwgKSA9PiBuZXcgVmFyaWFiaWxpdHlTY3JlZW5WaWV3KCBtb2RlbCwgeyB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZpZXcnICkgfSApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuY2VudGVyQW5kVmFyaWFiaWxpdHkucmVnaXN0ZXIoICdWYXJpYWJpbGl0eVNjcmVlbicsIFZhcmlhYmlsaXR5U2NyZWVuICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUE0QixvQ0FBb0M7QUFDaEYsT0FBT0MsU0FBUyxNQUFNLHdCQUF3QjtBQUM5QyxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLG9CQUFvQixNQUFNLDRCQUE0QjtBQUM3RCxPQUFPQyxnQkFBZ0IsTUFBTSw2QkFBNkI7QUFDMUQsT0FBT0MsU0FBUyxNQUE0Qix3QkFBd0I7QUFDcEUsT0FBT0MscUJBQXFCLE1BQU0saUNBQWlDO0FBQ25FLE9BQU9DLFVBQVUsTUFBTSxpQ0FBaUM7QUFDeEQsT0FBT0MsMkJBQTJCLE1BQU0sbUNBQW1DO0FBQzNFLE9BQU9DLHlCQUF5QixNQUFNLDJDQUEyQztBQUlqRixlQUFlLE1BQU1DLGlCQUFpQixTQUFTTCxTQUFTLENBQTBDO0VBRXpGTSxXQUFXQSxDQUFFQyxlQUF5QyxFQUFHO0lBRTlELE1BQU1DLE9BQU8sR0FBR2IsU0FBUyxDQUErRCxDQUFDLENBQUU7TUFDekZjLElBQUksRUFBRU4sMkJBQTJCLENBQUNPLE1BQU0sQ0FBQ0MseUJBQXlCO01BQ2xFQyxjQUFjLEVBQUUsSUFBSVYsVUFBVSxDQUFFLElBQUlMLEtBQUssQ0FBRU8seUJBQTBCLENBQUMsRUFBRTtRQUN0RVMsc0JBQXNCLEVBQUUsQ0FBQztRQUN6QkMsdUJBQXVCLEVBQUU7TUFDM0IsQ0FBRSxDQUFDO01BQ0hDLHVCQUF1QixFQUFFbkIsU0FBUyxDQUFDb0I7SUFDckMsQ0FBQyxFQUFFVCxlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FDSCxNQUFNLElBQUlSLGdCQUFnQixDQUFFO01BQzFCa0IsTUFBTSxFQUFFVCxPQUFPLENBQUNTLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLE9BQVEsQ0FBQztNQUM5Q0MsZ0NBQWdDLEVBQUU7SUFDcEMsQ0FBRSxDQUFDLEVBQ0RDLEtBQXVCLElBQU0sSUFBSW5CLHFCQUFxQixDQUFFbUIsS0FBSyxFQUFFO01BQUVILE1BQU0sRUFBRVQsT0FBTyxDQUFDUyxNQUFNLENBQUNDLFlBQVksQ0FBRSxNQUFPO0lBQUUsQ0FBRSxDQUFDLEVBQ3BIVixPQUNGLENBQUM7RUFDSDtBQUNGO0FBRUFWLG9CQUFvQixDQUFDdUIsUUFBUSxDQUFFLG1CQUFtQixFQUFFaEIsaUJBQWtCLENBQUMifQ==