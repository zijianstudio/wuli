// Copyright 2018-2022, University of Colorado Boulder

/**
 * The 'Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import Range from '../../../dot/js/Range.js';
import square_png from '../../../equality-explorer/images/square_png.js';
import EqualityExplorerColors from '../../../equality-explorer/js/common/EqualityExplorerColors.js';
import EqualityExplorerScreen from '../../../equality-explorer/js/common/EqualityExplorerScreen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import optionize from '../../../phet-core/js/optionize.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { HBox, Image, Text } from '../../../scenery/js/imports.js';
import NumberPicker from '../../../sun/js/NumberPicker.js';
import equalityExplorerBasics from '../equalityExplorerBasics.js';
import EqualityExplorerBasicsStrings from '../EqualityExplorerBasicsStrings.js';
import LabModel from './model/LabModel.js';
import LabScreenView from './view/LabScreenView.js';

// constants
const BACKGROUND_COLOR = EqualityExplorerColors.BASICS_SCREEN_BACKGROUND;
export default class LabScreen extends EqualityExplorerScreen {
  constructor(providedOptions) {
    const options = optionize()({
      // EqualityExplorerScreenOptions
      name: EqualityExplorerBasicsStrings.screen.labStringProperty,
      backgroundColorProperty: new Property(BACKGROUND_COLOR),
      homeScreenIcon: createScreenIcon()
    }, providedOptions);
    super(() => new LabModel(options.tandem.createTandem('model')), model => new LabScreenView(model, options.tandem.createTandem('view')), options);
  }
}

/**
 * Creates the icon for this screen: square = picker
 */
function createScreenIcon() {
  const squareNode = new Image(square_png, {
    scale: 0.75
  });
  const equalsText = new Text(MathSymbols.EQUAL_TO, {
    font: new PhetFont({
      size: 30,
      weight: 'bold'
    })
  });
  const pickerNode = new NumberPicker(new Property(7), new Property(new Range(0, 10)), {
    color: 'black'
  });
  const iconNode = new HBox({
    spacing: 5,
    children: [squareNode, equalsText, pickerNode]
  });
  return new ScreenIcon(iconNode, {
    maxIconWidthProportion: 0.8,
    fill: BACKGROUND_COLOR
  });
}
equalityExplorerBasics.register('LabScreen', LabScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlJhbmdlIiwic3F1YXJlX3BuZyIsIkVxdWFsaXR5RXhwbG9yZXJDb2xvcnMiLCJFcXVhbGl0eUV4cGxvcmVyU2NyZWVuIiwiU2NyZWVuSWNvbiIsIm9wdGlvbml6ZSIsIk1hdGhTeW1ib2xzIiwiUGhldEZvbnQiLCJIQm94IiwiSW1hZ2UiLCJUZXh0IiwiTnVtYmVyUGlja2VyIiwiZXF1YWxpdHlFeHBsb3JlckJhc2ljcyIsIkVxdWFsaXR5RXhwbG9yZXJCYXNpY3NTdHJpbmdzIiwiTGFiTW9kZWwiLCJMYWJTY3JlZW5WaWV3IiwiQkFDS0dST1VORF9DT0xPUiIsIkJBU0lDU19TQ1JFRU5fQkFDS0dST1VORCIsIkxhYlNjcmVlbiIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIm5hbWUiLCJzY3JlZW4iLCJsYWJTdHJpbmdQcm9wZXJ0eSIsImJhY2tncm91bmRDb2xvclByb3BlcnR5IiwiaG9tZVNjcmVlbkljb24iLCJjcmVhdGVTY3JlZW5JY29uIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwibW9kZWwiLCJzcXVhcmVOb2RlIiwic2NhbGUiLCJlcXVhbHNUZXh0IiwiRVFVQUxfVE8iLCJmb250Iiwic2l6ZSIsIndlaWdodCIsInBpY2tlck5vZGUiLCJjb2xvciIsImljb25Ob2RlIiwic3BhY2luZyIsImNoaWxkcmVuIiwibWF4SWNvbldpZHRoUHJvcG9ydGlvbiIsImZpbGwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxhYlNjcmVlbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgJ0xhYicgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBzcXVhcmVfcG5nIGZyb20gJy4uLy4uLy4uL2VxdWFsaXR5LWV4cGxvcmVyL2ltYWdlcy9zcXVhcmVfcG5nLmpzJztcclxuaW1wb3J0IEVxdWFsaXR5RXhwbG9yZXJDb2xvcnMgZnJvbSAnLi4vLi4vLi4vZXF1YWxpdHktZXhwbG9yZXIvanMvY29tbW9uL0VxdWFsaXR5RXhwbG9yZXJDb2xvcnMuanMnO1xyXG5pbXBvcnQgRXF1YWxpdHlFeHBsb3JlclNjcmVlbiwgeyBFcXVhbGl0eUV4cGxvcmVyU2NyZWVuT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL2VxdWFsaXR5LWV4cGxvcmVyL2pzL2NvbW1vbi9FcXVhbGl0eUV4cGxvcmVyU2NyZWVuLmpzJztcclxuaW1wb3J0IFNjcmVlbkljb24gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuSWNvbi5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IEhCb3gsIEltYWdlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IE51bWJlclBpY2tlciBmcm9tICcuLi8uLi8uLi9zdW4vanMvTnVtYmVyUGlja2VyLmpzJztcclxuaW1wb3J0IGVxdWFsaXR5RXhwbG9yZXJCYXNpY3MgZnJvbSAnLi4vZXF1YWxpdHlFeHBsb3JlckJhc2ljcy5qcyc7XHJcbmltcG9ydCBFcXVhbGl0eUV4cGxvcmVyQmFzaWNzU3RyaW5ncyBmcm9tICcuLi9FcXVhbGl0eUV4cGxvcmVyQmFzaWNzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBMYWJNb2RlbCBmcm9tICcuL21vZGVsL0xhYk1vZGVsLmpzJztcclxuaW1wb3J0IExhYlNjcmVlblZpZXcgZnJvbSAnLi92aWV3L0xhYlNjcmVlblZpZXcuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEJBQ0tHUk9VTkRfQ09MT1IgPSBFcXVhbGl0eUV4cGxvcmVyQ29sb3JzLkJBU0lDU19TQ1JFRU5fQkFDS0dST1VORDtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBMYWJTY3JlZW5PcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8RXF1YWxpdHlFeHBsb3JlclNjcmVlbk9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExhYlNjcmVlbiBleHRlbmRzIEVxdWFsaXR5RXhwbG9yZXJTY3JlZW48TGFiTW9kZWwsIExhYlNjcmVlblZpZXc+IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM6IExhYlNjcmVlbk9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxMYWJTY3JlZW5PcHRpb25zLCBTZWxmT3B0aW9ucywgRXF1YWxpdHlFeHBsb3JlclNjcmVlbk9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIEVxdWFsaXR5RXhwbG9yZXJTY3JlZW5PcHRpb25zXHJcbiAgICAgIG5hbWU6IEVxdWFsaXR5RXhwbG9yZXJCYXNpY3NTdHJpbmdzLnNjcmVlbi5sYWJTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggQkFDS0dST1VORF9DT0xPUiApLFxyXG4gICAgICBob21lU2NyZWVuSWNvbjogY3JlYXRlU2NyZWVuSWNvbigpXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgKCkgPT4gbmV3IExhYk1vZGVsKCBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb2RlbCcgKSApLFxyXG4gICAgICBtb2RlbCA9PiBuZXcgTGFiU2NyZWVuVmlldyggbW9kZWwsIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZpZXcnICkgKSxcclxuICAgICAgb3B0aW9uc1xyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIHRoZSBpY29uIGZvciB0aGlzIHNjcmVlbjogc3F1YXJlID0gcGlja2VyXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVTY3JlZW5JY29uKCk6IFNjcmVlbkljb24ge1xyXG5cclxuICBjb25zdCBzcXVhcmVOb2RlID0gbmV3IEltYWdlKCBzcXVhcmVfcG5nLCB7XHJcbiAgICBzY2FsZTogMC43NVxyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgZXF1YWxzVGV4dCA9IG5ldyBUZXh0KCBNYXRoU3ltYm9scy5FUVVBTF9UTywge1xyXG4gICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDMwLCB3ZWlnaHQ6ICdib2xkJyB9IClcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IHBpY2tlck5vZGUgPSBuZXcgTnVtYmVyUGlja2VyKCBuZXcgUHJvcGVydHkoIDcgKSwgbmV3IFByb3BlcnR5KCBuZXcgUmFuZ2UoIDAsIDEwICkgKSwge1xyXG4gICAgY29sb3I6ICdibGFjaydcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IGljb25Ob2RlID0gbmV3IEhCb3goIHtcclxuICAgIHNwYWNpbmc6IDUsXHJcbiAgICBjaGlsZHJlbjogWyBzcXVhcmVOb2RlLCBlcXVhbHNUZXh0LCBwaWNrZXJOb2RlIF1cclxuICB9ICk7XHJcblxyXG4gIHJldHVybiBuZXcgU2NyZWVuSWNvbiggaWNvbk5vZGUsIHtcclxuICAgIG1heEljb25XaWR0aFByb3BvcnRpb246IDAuOCxcclxuICAgIGZpbGw6IEJBQ0tHUk9VTkRfQ09MT1JcclxuICB9ICk7XHJcbn1cclxuXHJcbmVxdWFsaXR5RXhwbG9yZXJCYXNpY3MucmVnaXN0ZXIoICdMYWJTY3JlZW4nLCBMYWJTY3JlZW4gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLDhCQUE4QjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sMEJBQTBCO0FBQzVDLE9BQU9DLFVBQVUsTUFBTSxpREFBaUQ7QUFDeEUsT0FBT0Msc0JBQXNCLE1BQU0sZ0VBQWdFO0FBQ25HLE9BQU9DLHNCQUFzQixNQUF5QyxnRUFBZ0U7QUFDdEksT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxPQUFPQyxTQUFTLE1BQTRCLG9DQUFvQztBQUVoRixPQUFPQyxXQUFXLE1BQU0seUNBQXlDO0FBQ2pFLE9BQU9DLFFBQVEsTUFBTSxzQ0FBc0M7QUFDM0QsU0FBU0MsSUFBSSxFQUFFQyxLQUFLLEVBQUVDLElBQUksUUFBUSxnQ0FBZ0M7QUFDbEUsT0FBT0MsWUFBWSxNQUFNLGlDQUFpQztBQUMxRCxPQUFPQyxzQkFBc0IsTUFBTSw4QkFBOEI7QUFDakUsT0FBT0MsNkJBQTZCLE1BQU0scUNBQXFDO0FBQy9FLE9BQU9DLFFBQVEsTUFBTSxxQkFBcUI7QUFDMUMsT0FBT0MsYUFBYSxNQUFNLHlCQUF5Qjs7QUFFbkQ7QUFDQSxNQUFNQyxnQkFBZ0IsR0FBR2Qsc0JBQXNCLENBQUNlLHdCQUF3QjtBQU14RSxlQUFlLE1BQU1DLFNBQVMsU0FBU2Ysc0JBQXNCLENBQTBCO0VBRTlFZ0IsV0FBV0EsQ0FBRUMsZUFBaUMsRUFBRztJQUV0RCxNQUFNQyxPQUFPLEdBQUdoQixTQUFTLENBQStELENBQUMsQ0FBRTtNQUV6RjtNQUNBaUIsSUFBSSxFQUFFVCw2QkFBNkIsQ0FBQ1UsTUFBTSxDQUFDQyxpQkFBaUI7TUFDNURDLHVCQUF1QixFQUFFLElBQUkxQixRQUFRLENBQUVpQixnQkFBaUIsQ0FBQztNQUN6RFUsY0FBYyxFQUFFQyxnQkFBZ0IsQ0FBQztJQUNuQyxDQUFDLEVBQUVQLGVBQWdCLENBQUM7SUFFcEIsS0FBSyxDQUNILE1BQU0sSUFBSU4sUUFBUSxDQUFFTyxPQUFPLENBQUNPLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLE9BQVEsQ0FBRSxDQUFDLEVBQzVEQyxLQUFLLElBQUksSUFBSWYsYUFBYSxDQUFFZSxLQUFLLEVBQUVULE9BQU8sQ0FBQ08sTUFBTSxDQUFDQyxZQUFZLENBQUUsTUFBTyxDQUFFLENBQUMsRUFDMUVSLE9BQ0YsQ0FBQztFQUNIO0FBQ0Y7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBU00sZ0JBQWdCQSxDQUFBLEVBQWU7RUFFdEMsTUFBTUksVUFBVSxHQUFHLElBQUl0QixLQUFLLENBQUVSLFVBQVUsRUFBRTtJQUN4QytCLEtBQUssRUFBRTtFQUNULENBQUUsQ0FBQztFQUVILE1BQU1DLFVBQVUsR0FBRyxJQUFJdkIsSUFBSSxDQUFFSixXQUFXLENBQUM0QixRQUFRLEVBQUU7SUFDakRDLElBQUksRUFBRSxJQUFJNUIsUUFBUSxDQUFFO01BQUU2QixJQUFJLEVBQUUsRUFBRTtNQUFFQyxNQUFNLEVBQUU7SUFBTyxDQUFFO0VBQ25ELENBQUUsQ0FBQztFQUVILE1BQU1DLFVBQVUsR0FBRyxJQUFJM0IsWUFBWSxDQUFFLElBQUlaLFFBQVEsQ0FBRSxDQUFFLENBQUMsRUFBRSxJQUFJQSxRQUFRLENBQUUsSUFBSUMsS0FBSyxDQUFFLENBQUMsRUFBRSxFQUFHLENBQUUsQ0FBQyxFQUFFO0lBQzFGdUMsS0FBSyxFQUFFO0VBQ1QsQ0FBRSxDQUFDO0VBRUgsTUFBTUMsUUFBUSxHQUFHLElBQUloQyxJQUFJLENBQUU7SUFDekJpQyxPQUFPLEVBQUUsQ0FBQztJQUNWQyxRQUFRLEVBQUUsQ0FBRVgsVUFBVSxFQUFFRSxVQUFVLEVBQUVLLFVBQVU7RUFDaEQsQ0FBRSxDQUFDO0VBRUgsT0FBTyxJQUFJbEMsVUFBVSxDQUFFb0MsUUFBUSxFQUFFO0lBQy9CRyxzQkFBc0IsRUFBRSxHQUFHO0lBQzNCQyxJQUFJLEVBQUU1QjtFQUNSLENBQUUsQ0FBQztBQUNMO0FBRUFKLHNCQUFzQixDQUFDaUMsUUFBUSxDQUFFLFdBQVcsRUFBRTNCLFNBQVUsQ0FBQyJ9