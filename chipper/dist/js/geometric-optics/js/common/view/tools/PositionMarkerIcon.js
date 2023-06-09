// Copyright 2022, University of Colorado Boulder

/**
 * PositionMarkerIcon is a position-marker icon that appears in the toolbox. It is associated with a specific
 * position-marker Node, and forwards events to that Node.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import geometricOptics from '../../../geometricOptics.js';
import MapMarkerNode from '../MapMarkerNode.js';
import GOToolIcon from './GOToolIcon.js';
export default class PositionMarkerIcon extends GOToolIcon {
  /**
   * @param positionMarker - model element
   * @param positionMarkerNode - view element
   * @param zoomTransformProperty - model-view transform that the user controls by zooming in/out
   */
  constructor(positionMarker, positionMarkerNode, zoomTransformProperty) {
    // GOToolIconOptions
    const options = {
      touchAreaDilationX: 5,
      touchAreaDilationY: 5,
      mouseAreaDilationX: 5,
      mouseAreaDilationY: 5
    };
    const contentNode = new MapMarkerNode({
      fill: positionMarker.fill,
      stroke: positionMarker.stroke,
      scale: 0.8 // slightly smaller for toolbox icon
    });

    const pointerPositionToToolPosition = pointerPosition => {
      const zoomTransform = zoomTransformProperty.value;
      const viewPosition = positionMarkerNode.globalToParentPoint(pointerPosition);
      const x = viewPosition.x;
      const y = viewPosition.y - positionMarkerNode.height;
      return zoomTransform.viewToModelXY(x, y);
    };
    super(contentNode, positionMarker, positionMarkerNode, zoomTransformProperty, pointerPositionToToolPosition, options);
  }
}
geometricOptics.register('PositionMarkerIcon', PositionMarkerIcon);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZW9tZXRyaWNPcHRpY3MiLCJNYXBNYXJrZXJOb2RlIiwiR09Ub29sSWNvbiIsIlBvc2l0aW9uTWFya2VySWNvbiIsImNvbnN0cnVjdG9yIiwicG9zaXRpb25NYXJrZXIiLCJwb3NpdGlvbk1hcmtlck5vZGUiLCJ6b29tVHJhbnNmb3JtUHJvcGVydHkiLCJvcHRpb25zIiwidG91Y2hBcmVhRGlsYXRpb25YIiwidG91Y2hBcmVhRGlsYXRpb25ZIiwibW91c2VBcmVhRGlsYXRpb25YIiwibW91c2VBcmVhRGlsYXRpb25ZIiwiY29udGVudE5vZGUiLCJmaWxsIiwic3Ryb2tlIiwic2NhbGUiLCJwb2ludGVyUG9zaXRpb25Ub1Rvb2xQb3NpdGlvbiIsInBvaW50ZXJQb3NpdGlvbiIsInpvb21UcmFuc2Zvcm0iLCJ2YWx1ZSIsInZpZXdQb3NpdGlvbiIsImdsb2JhbFRvUGFyZW50UG9pbnQiLCJ4IiwieSIsImhlaWdodCIsInZpZXdUb01vZGVsWFkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBvc2l0aW9uTWFya2VySWNvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUG9zaXRpb25NYXJrZXJJY29uIGlzIGEgcG9zaXRpb24tbWFya2VyIGljb24gdGhhdCBhcHBlYXJzIGluIHRoZSB0b29sYm94LiBJdCBpcyBhc3NvY2lhdGVkIHdpdGggYSBzcGVjaWZpY1xyXG4gKiBwb3NpdGlvbi1tYXJrZXIgTm9kZSwgYW5kIGZvcndhcmRzIGV2ZW50cyB0byB0aGF0IE5vZGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IGdlb21ldHJpY09wdGljcyBmcm9tICcuLi8uLi8uLi9nZW9tZXRyaWNPcHRpY3MuanMnO1xyXG5pbXBvcnQgUG9zaXRpb25NYXJrZXJOb2RlIGZyb20gJy4vUG9zaXRpb25NYXJrZXJOb2RlLmpzJztcclxuaW1wb3J0IE1hcE1hcmtlck5vZGUgZnJvbSAnLi4vTWFwTWFya2VyTm9kZS5qcyc7XHJcbmltcG9ydCBHT1Rvb2xJY29uIGZyb20gJy4vR09Ub29sSWNvbi5qcyc7XHJcbmltcG9ydCBQb3NpdGlvbk1hcmtlciBmcm9tICcuLi8uLi9tb2RlbC90b29scy9Qb3NpdGlvbk1hcmtlci5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb3NpdGlvbk1hcmtlckljb24gZXh0ZW5kcyBHT1Rvb2xJY29uIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHBvc2l0aW9uTWFya2VyIC0gbW9kZWwgZWxlbWVudFxyXG4gICAqIEBwYXJhbSBwb3NpdGlvbk1hcmtlck5vZGUgLSB2aWV3IGVsZW1lbnRcclxuICAgKiBAcGFyYW0gem9vbVRyYW5zZm9ybVByb3BlcnR5IC0gbW9kZWwtdmlldyB0cmFuc2Zvcm0gdGhhdCB0aGUgdXNlciBjb250cm9scyBieSB6b29taW5nIGluL291dFxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcG9zaXRpb25NYXJrZXI6IFBvc2l0aW9uTWFya2VyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25NYXJrZXJOb2RlOiBQb3NpdGlvbk1hcmtlck5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICB6b29tVHJhbnNmb3JtUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PE1vZGVsVmlld1RyYW5zZm9ybTI+ICkge1xyXG5cclxuICAgIC8vIEdPVG9vbEljb25PcHRpb25zXHJcbiAgICBjb25zdCBvcHRpb25zID0ge1xyXG4gICAgICB0b3VjaEFyZWFEaWxhdGlvblg6IDUsXHJcbiAgICAgIHRvdWNoQXJlYURpbGF0aW9uWTogNSxcclxuICAgICAgbW91c2VBcmVhRGlsYXRpb25YOiA1LFxyXG4gICAgICBtb3VzZUFyZWFEaWxhdGlvblk6IDVcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgY29udGVudE5vZGUgPSBuZXcgTWFwTWFya2VyTm9kZSgge1xyXG4gICAgICBmaWxsOiBwb3NpdGlvbk1hcmtlci5maWxsLFxyXG4gICAgICBzdHJva2U6IHBvc2l0aW9uTWFya2VyLnN0cm9rZSxcclxuICAgICAgc2NhbGU6IDAuOCAvLyBzbGlnaHRseSBzbWFsbGVyIGZvciB0b29sYm94IGljb25cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBwb2ludGVyUG9zaXRpb25Ub1Rvb2xQb3NpdGlvbiA9ICggcG9pbnRlclBvc2l0aW9uOiBWZWN0b3IyICkgPT4ge1xyXG4gICAgICBjb25zdCB6b29tVHJhbnNmb3JtID0gem9vbVRyYW5zZm9ybVByb3BlcnR5LnZhbHVlO1xyXG4gICAgICBjb25zdCB2aWV3UG9zaXRpb24gPSBwb3NpdGlvbk1hcmtlck5vZGUuZ2xvYmFsVG9QYXJlbnRQb2ludCggcG9pbnRlclBvc2l0aW9uICk7XHJcbiAgICAgIGNvbnN0IHggPSB2aWV3UG9zaXRpb24ueDtcclxuICAgICAgY29uc3QgeSA9IHZpZXdQb3NpdGlvbi55IC0gcG9zaXRpb25NYXJrZXJOb2RlLmhlaWdodDtcclxuICAgICAgcmV0dXJuIHpvb21UcmFuc2Zvcm0udmlld1RvTW9kZWxYWSggeCwgeSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBzdXBlciggY29udGVudE5vZGUsIHBvc2l0aW9uTWFya2VyLCBwb3NpdGlvbk1hcmtlck5vZGUsIHpvb21UcmFuc2Zvcm1Qcm9wZXJ0eSwgcG9pbnRlclBvc2l0aW9uVG9Ub29sUG9zaXRpb24sXHJcbiAgICAgIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmdlb21ldHJpY09wdGljcy5yZWdpc3RlciggJ1Bvc2l0aW9uTWFya2VySWNvbicsIFBvc2l0aW9uTWFya2VySWNvbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUtBLE9BQU9BLGVBQWUsTUFBTSw2QkFBNkI7QUFFekQsT0FBT0MsYUFBYSxNQUFNLHFCQUFxQjtBQUMvQyxPQUFPQyxVQUFVLE1BQU0saUJBQWlCO0FBR3hDLGVBQWUsTUFBTUMsa0JBQWtCLFNBQVNELFVBQVUsQ0FBQztFQUV6RDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ1NFLFdBQVdBLENBQUVDLGNBQThCLEVBQzlCQyxrQkFBc0MsRUFDdENDLHFCQUE2RCxFQUFHO0lBRWxGO0lBQ0EsTUFBTUMsT0FBTyxHQUFHO01BQ2RDLGtCQUFrQixFQUFFLENBQUM7TUFDckJDLGtCQUFrQixFQUFFLENBQUM7TUFDckJDLGtCQUFrQixFQUFFLENBQUM7TUFDckJDLGtCQUFrQixFQUFFO0lBQ3RCLENBQUM7SUFFRCxNQUFNQyxXQUFXLEdBQUcsSUFBSVosYUFBYSxDQUFFO01BQ3JDYSxJQUFJLEVBQUVULGNBQWMsQ0FBQ1MsSUFBSTtNQUN6QkMsTUFBTSxFQUFFVixjQUFjLENBQUNVLE1BQU07TUFDN0JDLEtBQUssRUFBRSxHQUFHLENBQUM7SUFDYixDQUFFLENBQUM7O0lBRUgsTUFBTUMsNkJBQTZCLEdBQUtDLGVBQXdCLElBQU07TUFDcEUsTUFBTUMsYUFBYSxHQUFHWixxQkFBcUIsQ0FBQ2EsS0FBSztNQUNqRCxNQUFNQyxZQUFZLEdBQUdmLGtCQUFrQixDQUFDZ0IsbUJBQW1CLENBQUVKLGVBQWdCLENBQUM7TUFDOUUsTUFBTUssQ0FBQyxHQUFHRixZQUFZLENBQUNFLENBQUM7TUFDeEIsTUFBTUMsQ0FBQyxHQUFHSCxZQUFZLENBQUNHLENBQUMsR0FBR2xCLGtCQUFrQixDQUFDbUIsTUFBTTtNQUNwRCxPQUFPTixhQUFhLENBQUNPLGFBQWEsQ0FBRUgsQ0FBQyxFQUFFQyxDQUFFLENBQUM7SUFDNUMsQ0FBQztJQUVELEtBQUssQ0FBRVgsV0FBVyxFQUFFUixjQUFjLEVBQUVDLGtCQUFrQixFQUFFQyxxQkFBcUIsRUFBRVUsNkJBQTZCLEVBQzFHVCxPQUFRLENBQUM7RUFDYjtBQUNGO0FBRUFSLGVBQWUsQ0FBQzJCLFFBQVEsQ0FBRSxvQkFBb0IsRUFBRXhCLGtCQUFtQixDQUFDIn0=