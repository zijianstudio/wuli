// Copyright 2015-2023, University of Colorado Boulder

/**
 * ExperimentPredictionSwitch is an AB switch that determines whether we are viewing an experiment or a predictive model.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
import ModelsOfTheHydrogenAtomStrings from '../../ModelsOfTheHydrogenAtomStrings.js';
import MOTHAColors from '../MOTHAColors.js';
export default class ExperimentPredictionSwitch extends ABSwitch {
  constructor(modelModeProperty, providedOptions) {
    const options = optionize()({
      centerOnSwitch: true,
      toggleSwitchOptions: {
        size: new Dimension2(50, 25)
      }
    }, providedOptions);
    const labelOptions = {
      font: new PhetFont({
        size: 16,
        weight: 'bold'
      }),
      fill: MOTHAColors.switchTextFillProperty,
      maxWidth: 100
    };
    const experimentText = new Text(ModelsOfTheHydrogenAtomStrings.experimentStringProperty, optionize()({
      tandem: options.tandem.createTandem('experimentText')
    }, labelOptions));
    const predictionText = new Text(ModelsOfTheHydrogenAtomStrings.predictionStringProperty, optionize()({
      tandem: options.tandem.createTandem('predictionText')
    }, labelOptions));
    super(modelModeProperty, 'experiment', experimentText, 'prediction', predictionText, options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
modelsOfTheHydrogenAtom.register('ExperimentPredictionSwitch', ExperimentPredictionSwitch);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwib3B0aW9uaXplIiwiUGhldEZvbnQiLCJUZXh0IiwiQUJTd2l0Y2giLCJtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSIsIk1vZGVsc09mVGhlSHlkcm9nZW5BdG9tU3RyaW5ncyIsIk1PVEhBQ29sb3JzIiwiRXhwZXJpbWVudFByZWRpY3Rpb25Td2l0Y2giLCJjb25zdHJ1Y3RvciIsIm1vZGVsTW9kZVByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImNlbnRlck9uU3dpdGNoIiwidG9nZ2xlU3dpdGNoT3B0aW9ucyIsInNpemUiLCJsYWJlbE9wdGlvbnMiLCJmb250Iiwid2VpZ2h0IiwiZmlsbCIsInN3aXRjaFRleHRGaWxsUHJvcGVydHkiLCJtYXhXaWR0aCIsImV4cGVyaW1lbnRUZXh0IiwiZXhwZXJpbWVudFN0cmluZ1Byb3BlcnR5IiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwicHJlZGljdGlvblRleHQiLCJwcmVkaWN0aW9uU3RyaW5nUHJvcGVydHkiLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFeHBlcmltZW50UHJlZGljdGlvblN3aXRjaC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBFeHBlcmltZW50UHJlZGljdGlvblN3aXRjaCBpcyBhbiBBQiBzd2l0Y2ggdGhhdCBkZXRlcm1pbmVzIHdoZXRoZXIgd2UgYXJlIHZpZXdpbmcgYW4gZXhwZXJpbWVudCBvciBhIHByZWRpY3RpdmUgbW9kZWwuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMsIFRleHQsIFRleHRPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEFCU3dpdGNoLCB7IEFCU3dpdGNoT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BQlN3aXRjaC5qcyc7XHJcbmltcG9ydCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSBmcm9tICcuLi8uLi9tb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbS5qcyc7XHJcbmltcG9ydCBNb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbVN0cmluZ3MgZnJvbSAnLi4vLi4vTW9kZWxzT2ZUaGVIeWRyb2dlbkF0b21TdHJpbmdzLmpzJztcclxuaW1wb3J0IE1PVEhBQ29sb3JzIGZyb20gJy4uL01PVEhBQ29sb3JzLmpzJztcclxuaW1wb3J0IHsgTW9kZWxNb2RlIH0gZnJvbSAnLi4vbW9kZWwvTW9kZWxNb2RlLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIEV4cGVyaW1lbnRQcmVkaWN0aW9uU3dpdGNoT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxBQlN3aXRjaE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4cGVyaW1lbnRQcmVkaWN0aW9uU3dpdGNoIGV4dGVuZHMgQUJTd2l0Y2g8TW9kZWxNb2RlPiB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWxNb2RlUHJvcGVydHk6IFByb3BlcnR5PE1vZGVsTW9kZT4sIHByb3ZpZGVkT3B0aW9uczogRXhwZXJpbWVudFByZWRpY3Rpb25Td2l0Y2hPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8RXhwZXJpbWVudFByZWRpY3Rpb25Td2l0Y2hPcHRpb25zLCBTZWxmT3B0aW9ucywgQUJTd2l0Y2hPcHRpb25zPigpKCB7XHJcbiAgICAgIGNlbnRlck9uU3dpdGNoOiB0cnVlLFxyXG4gICAgICB0b2dnbGVTd2l0Y2hPcHRpb25zOiB7IHNpemU6IG5ldyBEaW1lbnNpb24yKCA1MCwgMjUgKSB9XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBsYWJlbE9wdGlvbnMgPSB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAxNiwgd2VpZ2h0OiAnYm9sZCcgfSApLFxyXG4gICAgICBmaWxsOiBNT1RIQUNvbG9ycy5zd2l0Y2hUZXh0RmlsbFByb3BlcnR5LFxyXG4gICAgICBtYXhXaWR0aDogMTAwXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGV4cGVyaW1lbnRUZXh0ID0gbmV3IFRleHQoIE1vZGVsc09mVGhlSHlkcm9nZW5BdG9tU3RyaW5ncy5leHBlcmltZW50U3RyaW5nUHJvcGVydHksXHJcbiAgICAgIG9wdGlvbml6ZTxUZXh0T3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucywgVGV4dE9wdGlvbnM+KCkoIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2V4cGVyaW1lbnRUZXh0JyApXHJcbiAgICAgIH0sIGxhYmVsT3B0aW9ucyApICk7XHJcblxyXG4gICAgY29uc3QgcHJlZGljdGlvblRleHQgPSBuZXcgVGV4dCggTW9kZWxzT2ZUaGVIeWRyb2dlbkF0b21TdHJpbmdzLnByZWRpY3Rpb25TdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgb3B0aW9uaXplPFRleHRPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zLCBUZXh0T3B0aW9ucz4oKSgge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncHJlZGljdGlvblRleHQnIClcclxuICAgICAgfSwgbGFiZWxPcHRpb25zICkgKTtcclxuXHJcbiAgICBzdXBlciggbW9kZWxNb2RlUHJvcGVydHksICdleHBlcmltZW50JywgZXhwZXJpbWVudFRleHQsICdwcmVkaWN0aW9uJywgcHJlZGljdGlvblRleHQsIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5tb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbS5yZWdpc3RlciggJ0V4cGVyaW1lbnRQcmVkaWN0aW9uU3dpdGNoJywgRXhwZXJpbWVudFByZWRpY3Rpb25Td2l0Y2ggKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxTQUFTLE1BQTRCLHVDQUF1QztBQUVuRixPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQWlDQyxJQUFJLFFBQXFCLG1DQUFtQztBQUM3RixPQUFPQyxRQUFRLE1BQTJCLGdDQUFnQztBQUMxRSxPQUFPQyx1QkFBdUIsTUFBTSxrQ0FBa0M7QUFDdEUsT0FBT0MsOEJBQThCLE1BQU0seUNBQXlDO0FBQ3BGLE9BQU9DLFdBQVcsTUFBTSxtQkFBbUI7QUFRM0MsZUFBZSxNQUFNQywwQkFBMEIsU0FBU0osUUFBUSxDQUFZO0VBRW5FSyxXQUFXQSxDQUFFQyxpQkFBc0MsRUFBRUMsZUFBa0QsRUFBRztJQUUvRyxNQUFNQyxPQUFPLEdBQUdYLFNBQVMsQ0FBa0UsQ0FBQyxDQUFFO01BQzVGWSxjQUFjLEVBQUUsSUFBSTtNQUNwQkMsbUJBQW1CLEVBQUU7UUFBRUMsSUFBSSxFQUFFLElBQUlmLFVBQVUsQ0FBRSxFQUFFLEVBQUUsRUFBRztNQUFFO0lBQ3hELENBQUMsRUFBRVcsZUFBZ0IsQ0FBQztJQUVwQixNQUFNSyxZQUFZLEdBQUc7TUFDbkJDLElBQUksRUFBRSxJQUFJZixRQUFRLENBQUU7UUFBRWEsSUFBSSxFQUFFLEVBQUU7UUFBRUcsTUFBTSxFQUFFO01BQU8sQ0FBRSxDQUFDO01BQ2xEQyxJQUFJLEVBQUVaLFdBQVcsQ0FBQ2Esc0JBQXNCO01BQ3hDQyxRQUFRLEVBQUU7SUFDWixDQUFDO0lBRUQsTUFBTUMsY0FBYyxHQUFHLElBQUluQixJQUFJLENBQUVHLDhCQUE4QixDQUFDaUIsd0JBQXdCLEVBQ3RGdEIsU0FBUyxDQUE2QyxDQUFDLENBQUU7TUFDdkR1QixNQUFNLEVBQUVaLE9BQU8sQ0FBQ1ksTUFBTSxDQUFDQyxZQUFZLENBQUUsZ0JBQWlCO0lBQ3hELENBQUMsRUFBRVQsWUFBYSxDQUFFLENBQUM7SUFFckIsTUFBTVUsY0FBYyxHQUFHLElBQUl2QixJQUFJLENBQUVHLDhCQUE4QixDQUFDcUIsd0JBQXdCLEVBQ3RGMUIsU0FBUyxDQUE2QyxDQUFDLENBQUU7TUFDdkR1QixNQUFNLEVBQUVaLE9BQU8sQ0FBQ1ksTUFBTSxDQUFDQyxZQUFZLENBQUUsZ0JBQWlCO0lBQ3hELENBQUMsRUFBRVQsWUFBYSxDQUFFLENBQUM7SUFFckIsS0FBSyxDQUFFTixpQkFBaUIsRUFBRSxZQUFZLEVBQUVZLGNBQWMsRUFBRSxZQUFZLEVBQUVJLGNBQWMsRUFBRWQsT0FBUSxDQUFDO0VBQ2pHO0VBRWdCZ0IsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7SUFDekYsS0FBSyxDQUFDRCxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUF2Qix1QkFBdUIsQ0FBQ3lCLFFBQVEsQ0FBRSw0QkFBNEIsRUFBRXRCLDBCQUEyQixDQUFDIn0=