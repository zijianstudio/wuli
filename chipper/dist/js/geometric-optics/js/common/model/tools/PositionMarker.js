// Copyright 2022, University of Colorado Boulder

/**
 * PositionMarker is used to mark an arbitrary position.
 * See https://github.com/phetsims/geometric-optics/issues/355
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import geometricOptics from '../../../geometricOptics.js';
import GOTool from './GOTool.js';
export default class PositionMarker extends GOTool {
  // fill and stroke for the marker

  constructor(providedOptions) {
    super(providedOptions);
    this.fill = providedOptions.fill;
    this.stroke = providedOptions.stroke;
  }
}
geometricOptics.register('PositionMarker', PositionMarker);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZW9tZXRyaWNPcHRpY3MiLCJHT1Rvb2wiLCJQb3NpdGlvbk1hcmtlciIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwiZmlsbCIsInN0cm9rZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUG9zaXRpb25NYXJrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBvc2l0aW9uTWFya2VyIGlzIHVzZWQgdG8gbWFyayBhbiBhcmJpdHJhcnkgcG9zaXRpb24uXHJcbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ2VvbWV0cmljLW9wdGljcy9pc3N1ZXMvMzU1XHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IGdlb21ldHJpY09wdGljcyBmcm9tICcuLi8uLi8uLi9nZW9tZXRyaWNPcHRpY3MuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgeyBUQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgR09Ub29sLCB7IEdPVG9vbE9wdGlvbnMgfSBmcm9tICcuL0dPVG9vbC5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGZpbGw6IFRDb2xvcjtcclxuICBzdHJva2U6IFRDb2xvcjtcclxufTtcclxuXHJcbnR5cGUgUG9zaXRpb25NYXJrZXJPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8R09Ub29sT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9zaXRpb25NYXJrZXIgZXh0ZW5kcyBHT1Rvb2wge1xyXG5cclxuICAvLyBmaWxsIGFuZCBzdHJva2UgZm9yIHRoZSBtYXJrZXJcclxuICBwdWJsaWMgcmVhZG9ubHkgZmlsbDogVENvbG9yO1xyXG4gIHB1YmxpYyByZWFkb25seSBzdHJva2U6IFRDb2xvcjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM6IFBvc2l0aW9uTWFya2VyT3B0aW9ucyApIHtcclxuXHJcbiAgICBzdXBlciggcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5maWxsID0gcHJvdmlkZWRPcHRpb25zLmZpbGw7XHJcbiAgICB0aGlzLnN0cm9rZSA9IHByb3ZpZGVkT3B0aW9ucy5zdHJva2U7XHJcbiAgfVxyXG59XHJcblxyXG5nZW9tZXRyaWNPcHRpY3MucmVnaXN0ZXIoICdQb3NpdGlvbk1hcmtlcicsIFBvc2l0aW9uTWFya2VyICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLDZCQUE2QjtBQUd6RCxPQUFPQyxNQUFNLE1BQXlCLGFBQWE7QUFTbkQsZUFBZSxNQUFNQyxjQUFjLFNBQVNELE1BQU0sQ0FBQztFQUVqRDs7RUFJT0UsV0FBV0EsQ0FBRUMsZUFBc0MsRUFBRztJQUUzRCxLQUFLLENBQUVBLGVBQWdCLENBQUM7SUFFeEIsSUFBSSxDQUFDQyxJQUFJLEdBQUdELGVBQWUsQ0FBQ0MsSUFBSTtJQUNoQyxJQUFJLENBQUNDLE1BQU0sR0FBR0YsZUFBZSxDQUFDRSxNQUFNO0VBQ3RDO0FBQ0Y7QUFFQU4sZUFBZSxDQUFDTyxRQUFRLENBQUUsZ0JBQWdCLEVBQUVMLGNBQWUsQ0FBQyJ9