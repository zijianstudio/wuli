// Copyright 2022-2023, University of Colorado Boulder

/**
 * CalculusGrapherSimulationPreferencesNode is the user interface for sim-specific preferences, accessed via the
 * Simulation tab of the Preferences dialog. These preferences are global, and affect all screens.
 *
 * The Preferences dialog is created on demand by joist, using a PhetioCapsule. So this class must implement dispose,
 * and all children that have tandems or link to String Properties must be disposed.
 *
 * @author Martin Veillette
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { VBox } from '../../../../../scenery/js/imports.js';
import calculusGrapher from '../../../calculusGrapher.js';
import CalculusGrapherPreferences from '../../model/CalculusGrapherPreferences.js';
import DiscontinuitiesControl from './DiscontinuitiesControl.js';
import ValuesControl from './ValuesControl.js';
import NotationControl from './NotationControl.js';
import VariableControl from './VariableControl.js';
import PredictControl from './PredictControl.js';
export default class CalculusGrapherSimulationPreferencesNode extends VBox {
  constructor(tandem) {
    // Controls in the order that they appear in the Simulation tab, from top-to-bottom.
    const controls = [
    // Variable
    new VariableControl(CalculusGrapherPreferences.functionVariableProperty, tandem.createTandem('variableControl')),
    // Notation
    new NotationControl(CalculusGrapherPreferences.derivativeNotationProperty, tandem.createTandem('notationControl')),
    // Discontinuities
    new DiscontinuitiesControl(CalculusGrapherPreferences.connectDiscontinuitiesProperty, tandem.createTandem('discontinuitiesControl')),
    // Values
    new ValuesControl(CalculusGrapherPreferences.valuesVisibleProperty, tandem.createTandem('valuesControl')),
    // Predict
    new PredictControl(CalculusGrapherPreferences.predictPreferenceEnabledProperty, tandem.createTandem('predictControl'))];
    super({
      children: controls,
      align: 'left',
      spacing: 30,
      phetioVisiblePropertyInstrumented: false,
      tandem: tandem
    });
    this.disposeCalculusGrapherPreferencesNode = () => {
      controls.forEach(control => control.dispose());
    };
  }
  dispose() {
    this.disposeCalculusGrapherPreferencesNode();
    super.dispose();
  }
}
calculusGrapher.register('CalculusGrapherSimulationPreferencesNode', CalculusGrapherSimulationPreferencesNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWQm94IiwiY2FsY3VsdXNHcmFwaGVyIiwiQ2FsY3VsdXNHcmFwaGVyUHJlZmVyZW5jZXMiLCJEaXNjb250aW51aXRpZXNDb250cm9sIiwiVmFsdWVzQ29udHJvbCIsIk5vdGF0aW9uQ29udHJvbCIsIlZhcmlhYmxlQ29udHJvbCIsIlByZWRpY3RDb250cm9sIiwiQ2FsY3VsdXNHcmFwaGVyU2ltdWxhdGlvblByZWZlcmVuY2VzTm9kZSIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwiY29udHJvbHMiLCJmdW5jdGlvblZhcmlhYmxlUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJkZXJpdmF0aXZlTm90YXRpb25Qcm9wZXJ0eSIsImNvbm5lY3REaXNjb250aW51aXRpZXNQcm9wZXJ0eSIsInZhbHVlc1Zpc2libGVQcm9wZXJ0eSIsInByZWRpY3RQcmVmZXJlbmNlRW5hYmxlZFByb3BlcnR5IiwiY2hpbGRyZW4iLCJhbGlnbiIsInNwYWNpbmciLCJwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJkaXNwb3NlQ2FsY3VsdXNHcmFwaGVyUHJlZmVyZW5jZXNOb2RlIiwiZm9yRWFjaCIsImNvbnRyb2wiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDYWxjdWx1c0dyYXBoZXJTaW11bGF0aW9uUHJlZmVyZW5jZXNOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENhbGN1bHVzR3JhcGhlclNpbXVsYXRpb25QcmVmZXJlbmNlc05vZGUgaXMgdGhlIHVzZXIgaW50ZXJmYWNlIGZvciBzaW0tc3BlY2lmaWMgcHJlZmVyZW5jZXMsIGFjY2Vzc2VkIHZpYSB0aGVcclxuICogU2ltdWxhdGlvbiB0YWIgb2YgdGhlIFByZWZlcmVuY2VzIGRpYWxvZy4gVGhlc2UgcHJlZmVyZW5jZXMgYXJlIGdsb2JhbCwgYW5kIGFmZmVjdCBhbGwgc2NyZWVucy5cclxuICpcclxuICogVGhlIFByZWZlcmVuY2VzIGRpYWxvZyBpcyBjcmVhdGVkIG9uIGRlbWFuZCBieSBqb2lzdCwgdXNpbmcgYSBQaGV0aW9DYXBzdWxlLiBTbyB0aGlzIGNsYXNzIG11c3QgaW1wbGVtZW50IGRpc3Bvc2UsXHJcbiAqIGFuZCBhbGwgY2hpbGRyZW4gdGhhdCBoYXZlIHRhbmRlbXMgb3IgbGluayB0byBTdHJpbmcgUHJvcGVydGllcyBtdXN0IGJlIGRpc3Bvc2VkLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGVcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgeyBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGNhbGN1bHVzR3JhcGhlciBmcm9tICcuLi8uLi8uLi9jYWxjdWx1c0dyYXBoZXIuanMnO1xyXG5pbXBvcnQgQ2FsY3VsdXNHcmFwaGVyUHJlZmVyZW5jZXMgZnJvbSAnLi4vLi4vbW9kZWwvQ2FsY3VsdXNHcmFwaGVyUHJlZmVyZW5jZXMuanMnO1xyXG5pbXBvcnQgRGlzY29udGludWl0aWVzQ29udHJvbCBmcm9tICcuL0Rpc2NvbnRpbnVpdGllc0NvbnRyb2wuanMnO1xyXG5pbXBvcnQgVmFsdWVzQ29udHJvbCBmcm9tICcuL1ZhbHVlc0NvbnRyb2wuanMnO1xyXG5pbXBvcnQgTm90YXRpb25Db250cm9sIGZyb20gJy4vTm90YXRpb25Db250cm9sLmpzJztcclxuaW1wb3J0IFZhcmlhYmxlQ29udHJvbCBmcm9tICcuL1ZhcmlhYmxlQ29udHJvbC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBQcmVkaWN0Q29udHJvbCBmcm9tICcuL1ByZWRpY3RDb250cm9sLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENhbGN1bHVzR3JhcGhlclNpbXVsYXRpb25QcmVmZXJlbmNlc05vZGUgZXh0ZW5kcyBWQm94IHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlQ2FsY3VsdXNHcmFwaGVyUHJlZmVyZW5jZXNOb2RlOiAoKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIC8vIENvbnRyb2xzIGluIHRoZSBvcmRlciB0aGF0IHRoZXkgYXBwZWFyIGluIHRoZSBTaW11bGF0aW9uIHRhYiwgZnJvbSB0b3AtdG8tYm90dG9tLlxyXG4gICAgY29uc3QgY29udHJvbHMgPSBbXHJcblxyXG4gICAgICAvLyBWYXJpYWJsZVxyXG4gICAgICBuZXcgVmFyaWFibGVDb250cm9sKCBDYWxjdWx1c0dyYXBoZXJQcmVmZXJlbmNlcy5mdW5jdGlvblZhcmlhYmxlUHJvcGVydHksXHJcbiAgICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZhcmlhYmxlQ29udHJvbCcgKSApLFxyXG5cclxuICAgICAgLy8gTm90YXRpb25cclxuICAgICAgbmV3IE5vdGF0aW9uQ29udHJvbCggQ2FsY3VsdXNHcmFwaGVyUHJlZmVyZW5jZXMuZGVyaXZhdGl2ZU5vdGF0aW9uUHJvcGVydHksXHJcbiAgICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ25vdGF0aW9uQ29udHJvbCcgKSApLFxyXG5cclxuICAgICAgLy8gRGlzY29udGludWl0aWVzXHJcbiAgICAgIG5ldyBEaXNjb250aW51aXRpZXNDb250cm9sKCBDYWxjdWx1c0dyYXBoZXJQcmVmZXJlbmNlcy5jb25uZWN0RGlzY29udGludWl0aWVzUHJvcGVydHksXHJcbiAgICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Rpc2NvbnRpbnVpdGllc0NvbnRyb2wnICkgKSxcclxuXHJcbiAgICAgIC8vIFZhbHVlc1xyXG4gICAgICBuZXcgVmFsdWVzQ29udHJvbCggQ2FsY3VsdXNHcmFwaGVyUHJlZmVyZW5jZXMudmFsdWVzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2YWx1ZXNDb250cm9sJyApICksXHJcblxyXG4gICAgICAvLyBQcmVkaWN0XHJcbiAgICAgIG5ldyBQcmVkaWN0Q29udHJvbCggQ2FsY3VsdXNHcmFwaGVyUHJlZmVyZW5jZXMucHJlZGljdFByZWZlcmVuY2VFbmFibGVkUHJvcGVydHksXHJcbiAgICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ByZWRpY3RDb250cm9sJyApIClcclxuICAgIF07XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgY2hpbGRyZW46IGNvbnRyb2xzLFxyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICBzcGFjaW5nOiAzMCxcclxuICAgICAgcGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkOiBmYWxzZSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VDYWxjdWx1c0dyYXBoZXJQcmVmZXJlbmNlc05vZGUgPSAoKTogdm9pZCA9PiB7XHJcbiAgICAgIGNvbnRyb2xzLmZvckVhY2goIGNvbnRyb2wgPT4gY29udHJvbC5kaXNwb3NlKCkgKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcG9zZUNhbGN1bHVzR3JhcGhlclByZWZlcmVuY2VzTm9kZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuY2FsY3VsdXNHcmFwaGVyLnJlZ2lzdGVyKCAnQ2FsY3VsdXNHcmFwaGVyU2ltdWxhdGlvblByZWZlcmVuY2VzTm9kZScsIENhbGN1bHVzR3JhcGhlclNpbXVsYXRpb25QcmVmZXJlbmNlc05vZGUgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxJQUFJLFFBQVEsc0NBQXNDO0FBQzNELE9BQU9DLGVBQWUsTUFBTSw2QkFBNkI7QUFDekQsT0FBT0MsMEJBQTBCLE1BQU0sMkNBQTJDO0FBQ2xGLE9BQU9DLHNCQUFzQixNQUFNLDZCQUE2QjtBQUNoRSxPQUFPQyxhQUFhLE1BQU0sb0JBQW9CO0FBQzlDLE9BQU9DLGVBQWUsTUFBTSxzQkFBc0I7QUFDbEQsT0FBT0MsZUFBZSxNQUFNLHNCQUFzQjtBQUVsRCxPQUFPQyxjQUFjLE1BQU0scUJBQXFCO0FBRWhELGVBQWUsTUFBTUMsd0NBQXdDLFNBQVNSLElBQUksQ0FBQztFQUlsRVMsV0FBV0EsQ0FBRUMsTUFBYyxFQUFHO0lBRW5DO0lBQ0EsTUFBTUMsUUFBUSxHQUFHO0lBRWY7SUFDQSxJQUFJTCxlQUFlLENBQUVKLDBCQUEwQixDQUFDVSx3QkFBd0IsRUFDdEVGLE1BQU0sQ0FBQ0csWUFBWSxDQUFFLGlCQUFrQixDQUFFLENBQUM7SUFFNUM7SUFDQSxJQUFJUixlQUFlLENBQUVILDBCQUEwQixDQUFDWSwwQkFBMEIsRUFDeEVKLE1BQU0sQ0FBQ0csWUFBWSxDQUFFLGlCQUFrQixDQUFFLENBQUM7SUFFNUM7SUFDQSxJQUFJVixzQkFBc0IsQ0FBRUQsMEJBQTBCLENBQUNhLDhCQUE4QixFQUNuRkwsTUFBTSxDQUFDRyxZQUFZLENBQUUsd0JBQXlCLENBQUUsQ0FBQztJQUVuRDtJQUNBLElBQUlULGFBQWEsQ0FBRUYsMEJBQTBCLENBQUNjLHFCQUFxQixFQUNqRU4sTUFBTSxDQUFDRyxZQUFZLENBQUUsZUFBZ0IsQ0FBRSxDQUFDO0lBRTFDO0lBQ0EsSUFBSU4sY0FBYyxDQUFFTCwwQkFBMEIsQ0FBQ2UsZ0NBQWdDLEVBQzdFUCxNQUFNLENBQUNHLFlBQVksQ0FBRSxnQkFBaUIsQ0FBRSxDQUFDLENBQzVDO0lBRUQsS0FBSyxDQUFFO01BQ0xLLFFBQVEsRUFBRVAsUUFBUTtNQUNsQlEsS0FBSyxFQUFFLE1BQU07TUFDYkMsT0FBTyxFQUFFLEVBQUU7TUFDWEMsaUNBQWlDLEVBQUUsS0FBSztNQUN4Q1gsTUFBTSxFQUFFQTtJQUNWLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ1kscUNBQXFDLEdBQUcsTUFBWTtNQUN2RFgsUUFBUSxDQUFDWSxPQUFPLENBQUVDLE9BQU8sSUFBSUEsT0FBTyxDQUFDQyxPQUFPLENBQUMsQ0FBRSxDQUFDO0lBQ2xELENBQUM7RUFDSDtFQUVnQkEsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCLElBQUksQ0FBQ0gscUNBQXFDLENBQUMsQ0FBQztJQUM1QyxLQUFLLENBQUNHLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQXhCLGVBQWUsQ0FBQ3lCLFFBQVEsQ0FBRSwwQ0FBMEMsRUFBRWxCLHdDQUF5QyxDQUFDIn0=