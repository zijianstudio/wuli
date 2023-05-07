// Copyright 2018-2023, University of Colorado Boulder

/**
 * View-specific Properties and properties for the 'Vertex Form' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import GQViewProperties from '../../common/view/GQViewProperties.js';
import graphingQuadratics from '../../graphingQuadratics.js';
export default class VertexFormViewProperties extends GQViewProperties {
  constructor(tandem) {
    super({
      equationForm: 'vertex',
      vertexVisible: true,
      axisOfSymmetryVisible: false,
      coordinatesVisible: true,
      tandem: tandem
    });
  }
}
graphingQuadratics.register('VertexFormViewProperties', VertexFormViewProperties);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHUVZpZXdQcm9wZXJ0aWVzIiwiZ3JhcGhpbmdRdWFkcmF0aWNzIiwiVmVydGV4Rm9ybVZpZXdQcm9wZXJ0aWVzIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJlcXVhdGlvbkZvcm0iLCJ2ZXJ0ZXhWaXNpYmxlIiwiYXhpc09mU3ltbWV0cnlWaXNpYmxlIiwiY29vcmRpbmF0ZXNWaXNpYmxlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJWZXJ0ZXhGb3JtVmlld1Byb3BlcnRpZXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldy1zcGVjaWZpYyBQcm9wZXJ0aWVzIGFuZCBwcm9wZXJ0aWVzIGZvciB0aGUgJ1ZlcnRleCBGb3JtJyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEdRVmlld1Byb3BlcnRpZXMgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvR1FWaWV3UHJvcGVydGllcy5qcyc7XHJcbmltcG9ydCBncmFwaGluZ1F1YWRyYXRpY3MgZnJvbSAnLi4vLi4vZ3JhcGhpbmdRdWFkcmF0aWNzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZlcnRleEZvcm1WaWV3UHJvcGVydGllcyBleHRlbmRzIEdRVmlld1Byb3BlcnRpZXMge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhbmRlbTogVGFuZGVtICkge1xyXG4gICAgc3VwZXIoIHtcclxuICAgICAgZXF1YXRpb25Gb3JtOiAndmVydGV4JyxcclxuICAgICAgdmVydGV4VmlzaWJsZTogdHJ1ZSxcclxuICAgICAgYXhpc09mU3ltbWV0cnlWaXNpYmxlOiBmYWxzZSxcclxuICAgICAgY29vcmRpbmF0ZXNWaXNpYmxlOiB0cnVlLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZ3JhcGhpbmdRdWFkcmF0aWNzLnJlZ2lzdGVyKCAnVmVydGV4Rm9ybVZpZXdQcm9wZXJ0aWVzJywgVmVydGV4Rm9ybVZpZXdQcm9wZXJ0aWVzICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLGdCQUFnQixNQUFNLHVDQUF1QztBQUNwRSxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFFNUQsZUFBZSxNQUFNQyx3QkFBd0IsU0FBU0YsZ0JBQWdCLENBQUM7RUFFOURHLFdBQVdBLENBQUVDLE1BQWMsRUFBRztJQUNuQyxLQUFLLENBQUU7TUFDTEMsWUFBWSxFQUFFLFFBQVE7TUFDdEJDLGFBQWEsRUFBRSxJQUFJO01BQ25CQyxxQkFBcUIsRUFBRSxLQUFLO01BQzVCQyxrQkFBa0IsRUFBRSxJQUFJO01BQ3hCSixNQUFNLEVBQUVBO0lBQ1YsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBSCxrQkFBa0IsQ0FBQ1EsUUFBUSxDQUFFLDBCQUEwQixFQUFFUCx3QkFBeUIsQ0FBQyJ9