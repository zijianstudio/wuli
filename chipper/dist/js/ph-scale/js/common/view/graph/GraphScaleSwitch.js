// Copyright 2020-2022, University of Colorado Boulder

/**
 * GraphScaleSwitch is the control for switching between logarithmic and linear scales.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../../../dot/js/Dimension2.js';
import optionize, { combineOptions } from '../../../../../phet-core/js/optionize.js';
import { Text } from '../../../../../scenery/js/imports.js';
import ABSwitch from '../../../../../sun/js/ABSwitch.js';
import phScale from '../../../phScale.js';
import PhScaleStrings from '../../../PhScaleStrings.js';
import PHScaleConstants from '../../PHScaleConstants.js';
import GraphScale from './GraphScale.js';
export default class GraphScaleSwitch extends ABSwitch {
  constructor(graphScaleProperty, providedOptions) {
    const options = optionize()({
      // ABSwitchOptions
      toggleSwitchOptions: {
        size: new Dimension2(50, 25)
      },
      centerOnSwitch: true,
      phetioDocumentation: 'A/B switch for switching between logarithmic and linear scales'
    }, providedOptions);
    const textOptions = {
      font: PHScaleConstants.AB_SWITCH_FONT,
      maxWidth: 125
    };

    // Logarithmic label
    const logarithmicText = new Text(PhScaleStrings.logarithmicStringProperty, combineOptions({}, textOptions, {
      tandem: options.tandem.createTandem('logarithmicText'),
      phetioVisiblePropertyInstrumented: true
    }));

    // Linear label
    const linearText = new Text(PhScaleStrings.linearStringProperty, combineOptions({}, textOptions, {
      tandem: options.tandem.createTandem('linearText'),
      phetioVisiblePropertyInstrumented: true
    }));
    super(graphScaleProperty, GraphScale.LOGARITHMIC, logarithmicText, GraphScale.LINEAR, linearText, options);
  }
}
phScale.register('GraphScaleSwitch', GraphScaleSwitch);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJUZXh0IiwiQUJTd2l0Y2giLCJwaFNjYWxlIiwiUGhTY2FsZVN0cmluZ3MiLCJQSFNjYWxlQ29uc3RhbnRzIiwiR3JhcGhTY2FsZSIsIkdyYXBoU2NhbGVTd2l0Y2giLCJjb25zdHJ1Y3RvciIsImdyYXBoU2NhbGVQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ0b2dnbGVTd2l0Y2hPcHRpb25zIiwic2l6ZSIsImNlbnRlck9uU3dpdGNoIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInRleHRPcHRpb25zIiwiZm9udCIsIkFCX1NXSVRDSF9GT05UIiwibWF4V2lkdGgiLCJsb2dhcml0aG1pY1RleHQiLCJsb2dhcml0aG1pY1N0cmluZ1Byb3BlcnR5IiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkIiwibGluZWFyVGV4dCIsImxpbmVhclN0cmluZ1Byb3BlcnR5IiwiTE9HQVJJVEhNSUMiLCJMSU5FQVIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdyYXBoU2NhbGVTd2l0Y2gudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR3JhcGhTY2FsZVN3aXRjaCBpcyB0aGUgY29udHJvbCBmb3Igc3dpdGNoaW5nIGJldHdlZW4gbG9nYXJpdGhtaWMgYW5kIGxpbmVhciBzY2FsZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCB7IE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMsIFRleHQsIFRleHRPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEFCU3dpdGNoLCB7IEFCU3dpdGNoT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9BQlN3aXRjaC5qcyc7XHJcbmltcG9ydCBwaFNjYWxlIGZyb20gJy4uLy4uLy4uL3BoU2NhbGUuanMnO1xyXG5pbXBvcnQgUGhTY2FsZVN0cmluZ3MgZnJvbSAnLi4vLi4vLi4vUGhTY2FsZVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgUEhTY2FsZUNvbnN0YW50cyBmcm9tICcuLi8uLi9QSFNjYWxlQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEdyYXBoU2NhbGUgZnJvbSAnLi9HcmFwaFNjYWxlLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBHcmFwaFNjYWxlU3dpdGNoT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxBQlN3aXRjaE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyYXBoU2NhbGVTd2l0Y2ggZXh0ZW5kcyBBQlN3aXRjaDxHcmFwaFNjYWxlPiB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZ3JhcGhTY2FsZVByb3BlcnR5OiBFbnVtZXJhdGlvblByb3BlcnR5PEdyYXBoU2NhbGU+LCBwcm92aWRlZE9wdGlvbnM6IEdyYXBoU2NhbGVTd2l0Y2hPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8R3JhcGhTY2FsZVN3aXRjaE9wdGlvbnMsIFNlbGZPcHRpb25zLCBBQlN3aXRjaE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIEFCU3dpdGNoT3B0aW9uc1xyXG4gICAgICB0b2dnbGVTd2l0Y2hPcHRpb25zOiB7IHNpemU6IG5ldyBEaW1lbnNpb24yKCA1MCwgMjUgKSB9LFxyXG4gICAgICBjZW50ZXJPblN3aXRjaDogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0EvQiBzd2l0Y2ggZm9yIHN3aXRjaGluZyBiZXR3ZWVuIGxvZ2FyaXRobWljIGFuZCBsaW5lYXIgc2NhbGVzJ1xyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgdGV4dE9wdGlvbnMgPSB7XHJcbiAgICAgIGZvbnQ6IFBIU2NhbGVDb25zdGFudHMuQUJfU1dJVENIX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiAxMjVcclxuICAgIH07XHJcblxyXG4gICAgLy8gTG9nYXJpdGhtaWMgbGFiZWxcclxuICAgIGNvbnN0IGxvZ2FyaXRobWljVGV4dCA9IG5ldyBUZXh0KCBQaFNjYWxlU3RyaW5ncy5sb2dhcml0aG1pY1N0cmluZ1Byb3BlcnR5LCBjb21iaW5lT3B0aW9uczxUZXh0T3B0aW9ucz4oXHJcbiAgICAgIHt9LCB0ZXh0T3B0aW9ucywge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbG9nYXJpdGhtaWNUZXh0JyApLFxyXG4gICAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogdHJ1ZVxyXG4gICAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBMaW5lYXIgbGFiZWxcclxuICAgIGNvbnN0IGxpbmVhclRleHQgPSBuZXcgVGV4dCggUGhTY2FsZVN0cmluZ3MubGluZWFyU3RyaW5nUHJvcGVydHksIGNvbWJpbmVPcHRpb25zPFRleHRPcHRpb25zPihcclxuICAgICAge30sIHRleHRPcHRpb25zLCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdsaW5lYXJUZXh0JyApLFxyXG4gICAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogdHJ1ZVxyXG4gICAgICB9ICkgKTtcclxuXHJcbiAgICBzdXBlciggZ3JhcGhTY2FsZVByb3BlcnR5LCBHcmFwaFNjYWxlLkxPR0FSSVRITUlDLCBsb2dhcml0aG1pY1RleHQsIEdyYXBoU2NhbGUuTElORUFSLCBsaW5lYXJUZXh0LCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5waFNjYWxlLnJlZ2lzdGVyKCAnR3JhcGhTY2FsZVN3aXRjaCcsIEdyYXBoU2NhbGVTd2l0Y2ggKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsVUFBVSxNQUFNLHFDQUFxQztBQUM1RCxPQUFPQyxTQUFTLElBQUlDLGNBQWMsUUFBMEIsMENBQTBDO0FBRXRHLFNBQWlDQyxJQUFJLFFBQXFCLHNDQUFzQztBQUNoRyxPQUFPQyxRQUFRLE1BQTJCLG1DQUFtQztBQUM3RSxPQUFPQyxPQUFPLE1BQU0scUJBQXFCO0FBQ3pDLE9BQU9DLGNBQWMsTUFBTSw0QkFBNEI7QUFDdkQsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLFVBQVUsTUFBTSxpQkFBaUI7QUFNeEMsZUFBZSxNQUFNQyxnQkFBZ0IsU0FBU0wsUUFBUSxDQUFhO0VBRTFETSxXQUFXQSxDQUFFQyxrQkFBbUQsRUFBRUMsZUFBd0MsRUFBRztJQUVsSCxNQUFNQyxPQUFPLEdBQUdaLFNBQVMsQ0FBd0QsQ0FBQyxDQUFFO01BRWxGO01BQ0FhLG1CQUFtQixFQUFFO1FBQUVDLElBQUksRUFBRSxJQUFJZixVQUFVLENBQUUsRUFBRSxFQUFFLEVBQUc7TUFBRSxDQUFDO01BQ3ZEZ0IsY0FBYyxFQUFFLElBQUk7TUFDcEJDLG1CQUFtQixFQUFFO0lBQ3ZCLENBQUMsRUFBRUwsZUFBZ0IsQ0FBQztJQUVwQixNQUFNTSxXQUFXLEdBQUc7TUFDbEJDLElBQUksRUFBRVosZ0JBQWdCLENBQUNhLGNBQWM7TUFDckNDLFFBQVEsRUFBRTtJQUNaLENBQUM7O0lBRUQ7SUFDQSxNQUFNQyxlQUFlLEdBQUcsSUFBSW5CLElBQUksQ0FBRUcsY0FBYyxDQUFDaUIseUJBQXlCLEVBQUVyQixjQUFjLENBQ3hGLENBQUMsQ0FBQyxFQUFFZ0IsV0FBVyxFQUFFO01BQ2ZNLE1BQU0sRUFBRVgsT0FBTyxDQUFDVyxNQUFNLENBQUNDLFlBQVksQ0FBRSxpQkFBa0IsQ0FBQztNQUN4REMsaUNBQWlDLEVBQUU7SUFDckMsQ0FBRSxDQUFFLENBQUM7O0lBRVA7SUFDQSxNQUFNQyxVQUFVLEdBQUcsSUFBSXhCLElBQUksQ0FBRUcsY0FBYyxDQUFDc0Isb0JBQW9CLEVBQUUxQixjQUFjLENBQzlFLENBQUMsQ0FBQyxFQUFFZ0IsV0FBVyxFQUFFO01BQ2ZNLE1BQU0sRUFBRVgsT0FBTyxDQUFDVyxNQUFNLENBQUNDLFlBQVksQ0FBRSxZQUFhLENBQUM7TUFDbkRDLGlDQUFpQyxFQUFFO0lBQ3JDLENBQUUsQ0FBRSxDQUFDO0lBRVAsS0FBSyxDQUFFZixrQkFBa0IsRUFBRUgsVUFBVSxDQUFDcUIsV0FBVyxFQUFFUCxlQUFlLEVBQUVkLFVBQVUsQ0FBQ3NCLE1BQU0sRUFBRUgsVUFBVSxFQUFFZCxPQUFRLENBQUM7RUFDOUc7QUFDRjtBQUVBUixPQUFPLENBQUMwQixRQUFRLENBQUUsa0JBQWtCLEVBQUV0QixnQkFBaUIsQ0FBQyJ9