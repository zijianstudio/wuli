// Copyright 2021-2023, University of Colorado Boulder

/**
 * LensScreen is the 'Lens' screen.
 *
 * @author Martin Veillette
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import GOColors from '../common/GOColors.js';
import geometricOptics from '../geometricOptics.js';
import GeometricOpticsStrings from '../GeometricOpticsStrings.js';
import LensModel from './model/LensModel.js';
import LensNode from './view/LensNode.js';
import LensScreenView from './view/LensScreenView.js';
import optionize from '../../../phet-core/js/optionize.js';
export default class LensScreen extends Screen {
  constructor(providedOptions) {
    const options = optionize()({
      // Screen options
      name: GeometricOpticsStrings.screen.lensStringProperty,
      homeScreenIcon: createScreenIcon(),
      backgroundColorProperty: GOColors.screenBackgroundColorProperty
    }, providedOptions);
    super(() => new LensModel({
      tandem: options.tandem.createTandem('model')
    }), model => new LensScreenView(model, {
      isBasicsVersion: options.isBasicsVersion,
      tandem: options.tandem.createTandem('view')
    }), options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
function createScreenIcon() {
  return new ScreenIcon(LensNode.createIconNode('convex'), {
    fill: GOColors.screenBackgroundColorProperty
  });
}
geometricOptics.register('LensScreen', LensScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW4iLCJTY3JlZW5JY29uIiwiR09Db2xvcnMiLCJnZW9tZXRyaWNPcHRpY3MiLCJHZW9tZXRyaWNPcHRpY3NTdHJpbmdzIiwiTGVuc01vZGVsIiwiTGVuc05vZGUiLCJMZW5zU2NyZWVuVmlldyIsIm9wdGlvbml6ZSIsIkxlbnNTY3JlZW4iLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJuYW1lIiwic2NyZWVuIiwibGVuc1N0cmluZ1Byb3BlcnR5IiwiaG9tZVNjcmVlbkljb24iLCJjcmVhdGVTY3JlZW5JY29uIiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJzY3JlZW5CYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsIm1vZGVsIiwiaXNCYXNpY3NWZXJzaW9uIiwiZGlzcG9zZSIsImFzc2VydCIsImNyZWF0ZUljb25Ob2RlIiwiZmlsbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTGVuc1NjcmVlbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBMZW5zU2NyZWVuIGlzIHRoZSAnTGVucycgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGVcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgU2NyZWVuLCB7IFNjcmVlbk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IEdPQ29sb3JzIGZyb20gJy4uL2NvbW1vbi9HT0NvbG9ycy5qcyc7XHJcbmltcG9ydCBnZW9tZXRyaWNPcHRpY3MgZnJvbSAnLi4vZ2VvbWV0cmljT3B0aWNzLmpzJztcclxuaW1wb3J0IEdlb21ldHJpY09wdGljc1N0cmluZ3MgZnJvbSAnLi4vR2VvbWV0cmljT3B0aWNzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBMZW5zTW9kZWwgZnJvbSAnLi9tb2RlbC9MZW5zTW9kZWwuanMnO1xyXG5pbXBvcnQgTGVuc05vZGUgZnJvbSAnLi92aWV3L0xlbnNOb2RlLmpzJztcclxuaW1wb3J0IExlbnNTY3JlZW5WaWV3IGZyb20gJy4vdmlldy9MZW5zU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCB7IEdPU2ltT3B0aW9ucyB9IGZyb20gJy4uL0dPU2ltLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBQaWNrUmVxdWlyZWQ8R09TaW1PcHRpb25zLCAnaXNCYXNpY3NWZXJzaW9uJz47XHJcblxyXG50eXBlIExlbnNTY3JlZW5PcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8U2NyZWVuT3B0aW9ucywgJ3RhbmRlbScgfCAnY3JlYXRlS2V5Ym9hcmRIZWxwTm9kZSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGVuc1NjcmVlbiBleHRlbmRzIFNjcmVlbjxMZW5zTW9kZWwsIExlbnNTY3JlZW5WaWV3PiB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBMZW5zU2NyZWVuT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPExlbnNTY3JlZW5PcHRpb25zLCBTZWxmT3B0aW9ucywgU2NyZWVuT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2NyZWVuIG9wdGlvbnNcclxuICAgICAgbmFtZTogR2VvbWV0cmljT3B0aWNzU3RyaW5ncy5zY3JlZW4ubGVuc1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBob21lU2NyZWVuSWNvbjogY3JlYXRlU2NyZWVuSWNvbigpLFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogR09Db2xvcnMuc2NyZWVuQmFja2dyb3VuZENvbG9yUHJvcGVydHlcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKFxyXG4gICAgICAoKSA9PiBuZXcgTGVuc01vZGVsKCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb2RlbCcgKVxyXG4gICAgICB9ICksXHJcbiAgICAgIG1vZGVsID0+IG5ldyBMZW5zU2NyZWVuVmlldyggbW9kZWwsIHtcclxuICAgICAgICBpc0Jhc2ljc1ZlcnNpb246IG9wdGlvbnMuaXNCYXNpY3NWZXJzaW9uLFxyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlldycgKVxyXG4gICAgICB9ICksXHJcbiAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlU2NyZWVuSWNvbigpOiBTY3JlZW5JY29uIHtcclxuICByZXR1cm4gbmV3IFNjcmVlbkljb24oIExlbnNOb2RlLmNyZWF0ZUljb25Ob2RlKCAnY29udmV4JyApLCB7XHJcbiAgICBmaWxsOiBHT0NvbG9ycy5zY3JlZW5CYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eVxyXG4gIH0gKTtcclxufVxyXG5cclxuZ2VvbWV0cmljT3B0aWNzLnJlZ2lzdGVyKCAnTGVuc1NjcmVlbicsIExlbnNTY3JlZW4gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxNQUFNLE1BQXlCLDZCQUE2QjtBQUNuRSxPQUFPQyxVQUFVLE1BQU0saUNBQWlDO0FBQ3hELE9BQU9DLFFBQVEsTUFBTSx1QkFBdUI7QUFDNUMsT0FBT0MsZUFBZSxNQUFNLHVCQUF1QjtBQUNuRCxPQUFPQyxzQkFBc0IsTUFBTSw4QkFBOEI7QUFDakUsT0FBT0MsU0FBUyxNQUFNLHNCQUFzQjtBQUM1QyxPQUFPQyxRQUFRLE1BQU0sb0JBQW9CO0FBQ3pDLE9BQU9DLGNBQWMsTUFBTSwwQkFBMEI7QUFDckQsT0FBT0MsU0FBUyxNQUFNLG9DQUFvQztBQVExRCxlQUFlLE1BQU1DLFVBQVUsU0FBU1QsTUFBTSxDQUE0QjtFQUVqRVUsV0FBV0EsQ0FBRUMsZUFBa0MsRUFBRztJQUV2RCxNQUFNQyxPQUFPLEdBQUdKLFNBQVMsQ0FBZ0QsQ0FBQyxDQUFFO01BRTFFO01BQ0FLLElBQUksRUFBRVQsc0JBQXNCLENBQUNVLE1BQU0sQ0FBQ0Msa0JBQWtCO01BQ3REQyxjQUFjLEVBQUVDLGdCQUFnQixDQUFDLENBQUM7TUFDbENDLHVCQUF1QixFQUFFaEIsUUFBUSxDQUFDaUI7SUFDcEMsQ0FBQyxFQUFFUixlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FDSCxNQUFNLElBQUlOLFNBQVMsQ0FBRTtNQUNuQmUsTUFBTSxFQUFFUixPQUFPLENBQUNRLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLE9BQVE7SUFDL0MsQ0FBRSxDQUFDLEVBQ0hDLEtBQUssSUFBSSxJQUFJZixjQUFjLENBQUVlLEtBQUssRUFBRTtNQUNsQ0MsZUFBZSxFQUFFWCxPQUFPLENBQUNXLGVBQWU7TUFDeENILE1BQU0sRUFBRVIsT0FBTyxDQUFDUSxNQUFNLENBQUNDLFlBQVksQ0FBRSxNQUFPO0lBQzlDLENBQUUsQ0FBQyxFQUNIVCxPQUNGLENBQUM7RUFDSDtFQUVnQlksT0FBT0EsQ0FBQSxFQUFTO0lBQzlCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7SUFDekYsS0FBSyxDQUFDRCxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUEsU0FBU1AsZ0JBQWdCQSxDQUFBLEVBQWU7RUFDdEMsT0FBTyxJQUFJaEIsVUFBVSxDQUFFSyxRQUFRLENBQUNvQixjQUFjLENBQUUsUUFBUyxDQUFDLEVBQUU7SUFDMURDLElBQUksRUFBRXpCLFFBQVEsQ0FBQ2lCO0VBQ2pCLENBQUUsQ0FBQztBQUNMO0FBRUFoQixlQUFlLENBQUN5QixRQUFRLENBQUUsWUFBWSxFQUFFbkIsVUFBVyxDQUFDIn0=