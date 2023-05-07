// Copyright 2013-2023, University of Colorado Boulder

/**
 * Cuvette is a simple model of a cuvette. A cuvette is a small tube of circular or square cross section,
 * sealed at one end, made of plastic, glass, or fused quartz (for UV light) and designed to hold samples
 * for spectroscopic experiments.
 *
 * In this case, the cuvette is the vessel that holds the solution.
 * It has a fixed height, but a variable width, making it possible to change
 * the path length. Position is fixed.  Origin is at the upper-left corner.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import beersLawLab from '../../beersLawLab.js';
import BLLQueryParameters from '../../common/BLLQueryParameters.js';
import BLLConstants from '../../common/BLLConstants.js';
export default class Cuvette extends PhetioObject {
  // Variable width of the cuvette, in cm

  // When dragging the cuvette, it's width will snap to this interval when the drag ends. 0 causes no snapping.
  // Note that is only consulted at the end of a drag sequence - see CuvetteDragListener. If you change
  // snapIntervalProperty, it will NOT modify the value of widthProperty.
  // See https://github.com/phetsims/beers-law-lab/issues/330.
  // Fixed height of the cuvette, in cm
  constructor(providedOptions) {
    const options = optionize()({
      // SelfOptions
      position: Vector2.ZERO,
      widthRange: new RangeWithValue(0.5, 2.0, 1.0),
      // variable width, cm
      height: 3,
      // fixed height, cm

      // PhetioObjectOptions
      phetioState: false
    }, providedOptions);
    super(options);
    this.position = options.position;
    this.widthProperty = new NumberProperty(options.widthRange.defaultValue, {
      units: 'cm',
      range: options.widthRange,
      tandem: options.tandem.createTandem('widthProperty')
    });
    this.snapIntervalProperty = new NumberProperty(BLLQueryParameters.cuvetteSnapInterval, {
      units: 'cm',
      range: BLLConstants.CUVETTE_SNAP_INTERVAL_RANGE,
      tandem: options.tandem.createTandem('snapIntervalProperty'),
      phetioFeatured: true,
      // Properties associated with query parameters are typically featured
      phetioDocumentation: 'When dragging the cuvette, it\'s width will snap to this interval when the drag ends. Use 0 for no snapping.'
    });
    this.height = options.height;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  reset() {
    this.widthProperty.reset();
  }
}
beersLawLab.register('Cuvette', Cuvette);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlV2l0aFZhbHVlIiwiVmVjdG9yMiIsIm9wdGlvbml6ZSIsIlBoZXRpb09iamVjdCIsImJlZXJzTGF3TGFiIiwiQkxMUXVlcnlQYXJhbWV0ZXJzIiwiQkxMQ29uc3RhbnRzIiwiQ3V2ZXR0ZSIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInBvc2l0aW9uIiwiWkVSTyIsIndpZHRoUmFuZ2UiLCJoZWlnaHQiLCJwaGV0aW9TdGF0ZSIsIndpZHRoUHJvcGVydHkiLCJkZWZhdWx0VmFsdWUiLCJ1bml0cyIsInJhbmdlIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwic25hcEludGVydmFsUHJvcGVydHkiLCJjdXZldHRlU25hcEludGVydmFsIiwiQ1VWRVRURV9TTkFQX0lOVEVSVkFMX1JBTkdFIiwicGhldGlvRmVhdHVyZWQiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiZGlzcG9zZSIsImFzc2VydCIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDdXZldHRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEN1dmV0dGUgaXMgYSBzaW1wbGUgbW9kZWwgb2YgYSBjdXZldHRlLiBBIGN1dmV0dGUgaXMgYSBzbWFsbCB0dWJlIG9mIGNpcmN1bGFyIG9yIHNxdWFyZSBjcm9zcyBzZWN0aW9uLFxyXG4gKiBzZWFsZWQgYXQgb25lIGVuZCwgbWFkZSBvZiBwbGFzdGljLCBnbGFzcywgb3IgZnVzZWQgcXVhcnR6IChmb3IgVVYgbGlnaHQpIGFuZCBkZXNpZ25lZCB0byBob2xkIHNhbXBsZXNcclxuICogZm9yIHNwZWN0cm9zY29waWMgZXhwZXJpbWVudHMuXHJcbiAqXHJcbiAqIEluIHRoaXMgY2FzZSwgdGhlIGN1dmV0dGUgaXMgdGhlIHZlc3NlbCB0aGF0IGhvbGRzIHRoZSBzb2x1dGlvbi5cclxuICogSXQgaGFzIGEgZml4ZWQgaGVpZ2h0LCBidXQgYSB2YXJpYWJsZSB3aWR0aCwgbWFraW5nIGl0IHBvc3NpYmxlIHRvIGNoYW5nZVxyXG4gKiB0aGUgcGF0aCBsZW5ndGguIFBvc2l0aW9uIGlzIGZpeGVkLiAgT3JpZ2luIGlzIGF0IHRoZSB1cHBlci1sZWZ0IGNvcm5lci5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZVdpdGhWYWx1ZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2VXaXRoVmFsdWUuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QsIHsgUGhldGlvT2JqZWN0T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgYmVlcnNMYXdMYWIgZnJvbSAnLi4vLi4vYmVlcnNMYXdMYWIuanMnO1xyXG5pbXBvcnQgQkxMUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uLy4uL2NvbW1vbi9CTExRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgQkxMQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9CTExDb25zdGFudHMuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBwb3NpdGlvbj86IFZlY3RvcjI7XHJcbiAgd2lkdGhSYW5nZT86IFJhbmdlV2l0aFZhbHVlOyAvLyB2YXJpYWJsZSB3aWR0aCwgY21cclxuICBoZWlnaHQ/OiAzOyAvLyBmaXhlZCBoZWlnaHQsIGNtXHJcbn07XHJcblxyXG50eXBlIEN1dmV0dGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8UGhldGlvT2JqZWN0T3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3V2ZXR0ZSBleHRlbmRzIFBoZXRpb09iamVjdCB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBwb3NpdGlvbjogVmVjdG9yMjtcclxuXHJcbiAgLy8gVmFyaWFibGUgd2lkdGggb2YgdGhlIGN1dmV0dGUsIGluIGNtXHJcbiAgcHVibGljIHJlYWRvbmx5IHdpZHRoUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG5cclxuICAvLyBXaGVuIGRyYWdnaW5nIHRoZSBjdXZldHRlLCBpdCdzIHdpZHRoIHdpbGwgc25hcCB0byB0aGlzIGludGVydmFsIHdoZW4gdGhlIGRyYWcgZW5kcy4gMCBjYXVzZXMgbm8gc25hcHBpbmcuXHJcbiAgLy8gTm90ZSB0aGF0IGlzIG9ubHkgY29uc3VsdGVkIGF0IHRoZSBlbmQgb2YgYSBkcmFnIHNlcXVlbmNlIC0gc2VlIEN1dmV0dGVEcmFnTGlzdGVuZXIuIElmIHlvdSBjaGFuZ2VcclxuICAvLyBzbmFwSW50ZXJ2YWxQcm9wZXJ0eSwgaXQgd2lsbCBOT1QgbW9kaWZ5IHRoZSB2YWx1ZSBvZiB3aWR0aFByb3BlcnR5LlxyXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYmVlcnMtbGF3LWxhYi9pc3N1ZXMvMzMwLlxyXG4gIHB1YmxpYyByZWFkb25seSBzbmFwSW50ZXJ2YWxQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XHJcblxyXG4gIC8vIEZpeGVkIGhlaWdodCBvZiB0aGUgY3V2ZXR0ZSwgaW4gY21cclxuICBwdWJsaWMgcmVhZG9ubHkgaGVpZ2h0OiBudW1iZXI7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBDdXZldHRlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEN1dmV0dGVPcHRpb25zLCBTZWxmT3B0aW9ucywgUGhldGlvT2JqZWN0T3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgcG9zaXRpb246IFZlY3RvcjIuWkVSTyxcclxuICAgICAgd2lkdGhSYW5nZTogbmV3IFJhbmdlV2l0aFZhbHVlKCAwLjUsIDIuMCwgMS4wICksIC8vIHZhcmlhYmxlIHdpZHRoLCBjbVxyXG4gICAgICBoZWlnaHQ6IDMsIC8vIGZpeGVkIGhlaWdodCwgY21cclxuXHJcbiAgICAgIC8vIFBoZXRpb09iamVjdE9wdGlvbnNcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMucG9zaXRpb24gPSBvcHRpb25zLnBvc2l0aW9uO1xyXG5cclxuICAgIHRoaXMud2lkdGhQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggb3B0aW9ucy53aWR0aFJhbmdlLmRlZmF1bHRWYWx1ZSwge1xyXG4gICAgICB1bml0czogJ2NtJyxcclxuICAgICAgcmFuZ2U6IG9wdGlvbnMud2lkdGhSYW5nZSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd3aWR0aFByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zbmFwSW50ZXJ2YWxQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggQkxMUXVlcnlQYXJhbWV0ZXJzLmN1dmV0dGVTbmFwSW50ZXJ2YWwsIHtcclxuICAgICAgdW5pdHM6ICdjbScsXHJcbiAgICAgIHJhbmdlOiBCTExDb25zdGFudHMuQ1VWRVRURV9TTkFQX0lOVEVSVkFMX1JBTkdFLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NuYXBJbnRlcnZhbFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9GZWF0dXJlZDogdHJ1ZSwgLy8gUHJvcGVydGllcyBhc3NvY2lhdGVkIHdpdGggcXVlcnkgcGFyYW1ldGVycyBhcmUgdHlwaWNhbGx5IGZlYXR1cmVkXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdXaGVuIGRyYWdnaW5nIHRoZSBjdXZldHRlLCBpdFxcJ3Mgd2lkdGggd2lsbCBzbmFwIHRvIHRoaXMgaW50ZXJ2YWwgd2hlbiB0aGUgZHJhZyBlbmRzLiBVc2UgMCBmb3Igbm8gc25hcHBpbmcuJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQ7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy53aWR0aFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5iZWVyc0xhd0xhYi5yZWdpc3RlciggJ0N1dmV0dGUnLCBDdXZldHRlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsY0FBYyxNQUFNLHNDQUFzQztBQUNqRSxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFFN0QsT0FBT0MsWUFBWSxNQUErQix1Q0FBdUM7QUFDekYsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUM5QyxPQUFPQyxrQkFBa0IsTUFBTSxvQ0FBb0M7QUFDbkUsT0FBT0MsWUFBWSxNQUFNLDhCQUE4QjtBQVV2RCxlQUFlLE1BQU1DLE9BQU8sU0FBU0osWUFBWSxDQUFDO0VBSWhEOztFQUdBO0VBQ0E7RUFDQTtFQUNBO0VBR0E7RUFHT0ssV0FBV0EsQ0FBRUMsZUFBK0IsRUFBRztJQUVwRCxNQUFNQyxPQUFPLEdBQUdSLFNBQVMsQ0FBbUQsQ0FBQyxDQUFFO01BRTdFO01BQ0FTLFFBQVEsRUFBRVYsT0FBTyxDQUFDVyxJQUFJO01BQ3RCQyxVQUFVLEVBQUUsSUFBSWIsY0FBYyxDQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBSSxDQUFDO01BQUU7TUFDakRjLE1BQU0sRUFBRSxDQUFDO01BQUU7O01BRVg7TUFDQUMsV0FBVyxFQUFFO0lBQ2YsQ0FBQyxFQUFFTixlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FBRUMsT0FBUSxDQUFDO0lBRWhCLElBQUksQ0FBQ0MsUUFBUSxHQUFHRCxPQUFPLENBQUNDLFFBQVE7SUFFaEMsSUFBSSxDQUFDSyxhQUFhLEdBQUcsSUFBSWpCLGNBQWMsQ0FBRVcsT0FBTyxDQUFDRyxVQUFVLENBQUNJLFlBQVksRUFBRTtNQUN4RUMsS0FBSyxFQUFFLElBQUk7TUFDWEMsS0FBSyxFQUFFVCxPQUFPLENBQUNHLFVBQVU7TUFDekJPLE1BQU0sRUFBRVYsT0FBTyxDQUFDVSxNQUFNLENBQUNDLFlBQVksQ0FBRSxlQUFnQjtJQUN2RCxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNDLG9CQUFvQixHQUFHLElBQUl2QixjQUFjLENBQUVNLGtCQUFrQixDQUFDa0IsbUJBQW1CLEVBQUU7TUFDdEZMLEtBQUssRUFBRSxJQUFJO01BQ1hDLEtBQUssRUFBRWIsWUFBWSxDQUFDa0IsMkJBQTJCO01BQy9DSixNQUFNLEVBQUVWLE9BQU8sQ0FBQ1UsTUFBTSxDQUFDQyxZQUFZLENBQUUsc0JBQXVCLENBQUM7TUFDN0RJLGNBQWMsRUFBRSxJQUFJO01BQUU7TUFDdEJDLG1CQUFtQixFQUFFO0lBQ3ZCLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ1osTUFBTSxHQUFHSixPQUFPLENBQUNJLE1BQU07RUFDOUI7RUFFZ0JhLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7RUFFT0UsS0FBS0EsQ0FBQSxFQUFTO0lBQ25CLElBQUksQ0FBQ2IsYUFBYSxDQUFDYSxLQUFLLENBQUMsQ0FBQztFQUM1QjtBQUNGO0FBRUF6QixXQUFXLENBQUMwQixRQUFRLENBQUUsU0FBUyxFQUFFdkIsT0FBUSxDQUFDIn0=