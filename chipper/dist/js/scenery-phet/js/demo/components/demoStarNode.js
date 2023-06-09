// Copyright 2022, University of Colorado Boulder

/**
 * Demo for StarNode
 */

import StarNode from '../../StarNode.js';
import { Node } from '../../../../scenery/js/imports.js';
import Range from '../../../../dot/js/Range.js';
import Property from '../../../../axon/js/Property.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
export default function demoStarNode(layoutBounds) {
  const starValueProperty = new Property(1);
  const starSlider = new HSlider(starValueProperty, new Range(0, 1), {
    thumbSize: new Dimension2(25, 50),
    thumbFillHighlighted: 'yellow',
    thumbFill: 'rgb(220,220,0)',
    thumbCenterLineStroke: 'black'
  });
  const starNodeContainer = new Node({
    children: [new StarNode()],
    top: starSlider.bottom + 30,
    right: starSlider.right
  });

  /*
   * Fill up a star by creating new StarNodes dynamically.
   * Shouldn't be a problem for sims since stars are relatively static.
   * Stars should be rewritten if they need to support smooth dynamic filling (may require mutable kite paths).
   */
  starValueProperty.link(value => {
    starNodeContainer.children = [new StarNode({
      value: value,
      starShapeOptions: {
        outerRadius: 30,
        innerRadius: 15
      }
    })];
  });
  return new Node({
    children: [starNodeContainer, starSlider],
    center: layoutBounds.center
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdGFyTm9kZSIsIk5vZGUiLCJSYW5nZSIsIlByb3BlcnR5IiwiSFNsaWRlciIsIkRpbWVuc2lvbjIiLCJkZW1vU3Rhck5vZGUiLCJsYXlvdXRCb3VuZHMiLCJzdGFyVmFsdWVQcm9wZXJ0eSIsInN0YXJTbGlkZXIiLCJ0aHVtYlNpemUiLCJ0aHVtYkZpbGxIaWdobGlnaHRlZCIsInRodW1iRmlsbCIsInRodW1iQ2VudGVyTGluZVN0cm9rZSIsInN0YXJOb2RlQ29udGFpbmVyIiwiY2hpbGRyZW4iLCJ0b3AiLCJib3R0b20iLCJyaWdodCIsImxpbmsiLCJ2YWx1ZSIsInN0YXJTaGFwZU9wdGlvbnMiLCJvdXRlclJhZGl1cyIsImlubmVyUmFkaXVzIiwiY2VudGVyIl0sInNvdXJjZXMiOlsiZGVtb1N0YXJOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEZW1vIGZvciBTdGFyTm9kZVxyXG4gKi9cclxuXHJcbmltcG9ydCBTdGFyTm9kZSBmcm9tICcuLi8uLi9TdGFyTm9kZS5qcyc7XHJcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBIU2xpZGVyIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9IU2xpZGVyLmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb1N0YXJOb2RlKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XHJcblxyXG4gIGNvbnN0IHN0YXJWYWx1ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAxICk7XHJcblxyXG4gIGNvbnN0IHN0YXJTbGlkZXIgPSBuZXcgSFNsaWRlciggc3RhclZhbHVlUHJvcGVydHksIG5ldyBSYW5nZSggMCwgMSApLCB7XHJcbiAgICB0aHVtYlNpemU6IG5ldyBEaW1lbnNpb24yKCAyNSwgNTAgKSxcclxuICAgIHRodW1iRmlsbEhpZ2hsaWdodGVkOiAneWVsbG93JyxcclxuICAgIHRodW1iRmlsbDogJ3JnYigyMjAsMjIwLDApJyxcclxuICAgIHRodW1iQ2VudGVyTGluZVN0cm9rZTogJ2JsYWNrJ1xyXG4gIH0gKTtcclxuXHJcbiAgY29uc3Qgc3Rhck5vZGVDb250YWluZXIgPSBuZXcgTm9kZSgge1xyXG4gICAgY2hpbGRyZW46IFsgbmV3IFN0YXJOb2RlKCkgXSxcclxuICAgIHRvcDogc3RhclNsaWRlci5ib3R0b20gKyAzMCxcclxuICAgIHJpZ2h0OiBzdGFyU2xpZGVyLnJpZ2h0XHJcbiAgfSApO1xyXG5cclxuICAvKlxyXG4gICAqIEZpbGwgdXAgYSBzdGFyIGJ5IGNyZWF0aW5nIG5ldyBTdGFyTm9kZXMgZHluYW1pY2FsbHkuXHJcbiAgICogU2hvdWxkbid0IGJlIGEgcHJvYmxlbSBmb3Igc2ltcyBzaW5jZSBzdGFycyBhcmUgcmVsYXRpdmVseSBzdGF0aWMuXHJcbiAgICogU3RhcnMgc2hvdWxkIGJlIHJld3JpdHRlbiBpZiB0aGV5IG5lZWQgdG8gc3VwcG9ydCBzbW9vdGggZHluYW1pYyBmaWxsaW5nIChtYXkgcmVxdWlyZSBtdXRhYmxlIGtpdGUgcGF0aHMpLlxyXG4gICAqL1xyXG4gIHN0YXJWYWx1ZVByb3BlcnR5LmxpbmsoIHZhbHVlID0+IHtcclxuICAgIHN0YXJOb2RlQ29udGFpbmVyLmNoaWxkcmVuID0gW1xyXG4gICAgICBuZXcgU3Rhck5vZGUoIHtcclxuICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgc3RhclNoYXBlT3B0aW9uczoge1xyXG4gICAgICAgICAgb3V0ZXJSYWRpdXM6IDMwLFxyXG4gICAgICAgICAgaW5uZXJSYWRpdXM6IDE1XHJcbiAgICAgICAgfVxyXG4gICAgICB9IClcclxuICAgIF07XHJcbiAgfSApO1xyXG5cclxuICByZXR1cm4gbmV3IE5vZGUoIHtcclxuICAgIGNoaWxkcmVuOiBbIHN0YXJOb2RlQ29udGFpbmVyLCBzdGFyU2xpZGVyIF0sXHJcbiAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcclxuICB9ICk7XHJcbn0iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sbUJBQW1CO0FBQ3hDLFNBQVNDLElBQUksUUFBUSxtQ0FBbUM7QUFFeEQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUV6RCxlQUFlLFNBQVNDLFlBQVlBLENBQUVDLFlBQXFCLEVBQVM7RUFFbEUsTUFBTUMsaUJBQWlCLEdBQUcsSUFBSUwsUUFBUSxDQUFFLENBQUUsQ0FBQztFQUUzQyxNQUFNTSxVQUFVLEdBQUcsSUFBSUwsT0FBTyxDQUFFSSxpQkFBaUIsRUFBRSxJQUFJTixLQUFLLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUFFO0lBQ3BFUSxTQUFTLEVBQUUsSUFBSUwsVUFBVSxDQUFFLEVBQUUsRUFBRSxFQUFHLENBQUM7SUFDbkNNLG9CQUFvQixFQUFFLFFBQVE7SUFDOUJDLFNBQVMsRUFBRSxnQkFBZ0I7SUFDM0JDLHFCQUFxQixFQUFFO0VBQ3pCLENBQUUsQ0FBQztFQUVILE1BQU1DLGlCQUFpQixHQUFHLElBQUliLElBQUksQ0FBRTtJQUNsQ2MsUUFBUSxFQUFFLENBQUUsSUFBSWYsUUFBUSxDQUFDLENBQUMsQ0FBRTtJQUM1QmdCLEdBQUcsRUFBRVAsVUFBVSxDQUFDUSxNQUFNLEdBQUcsRUFBRTtJQUMzQkMsS0FBSyxFQUFFVCxVQUFVLENBQUNTO0VBQ3BCLENBQUUsQ0FBQzs7RUFFSDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VWLGlCQUFpQixDQUFDVyxJQUFJLENBQUVDLEtBQUssSUFBSTtJQUMvQk4saUJBQWlCLENBQUNDLFFBQVEsR0FBRyxDQUMzQixJQUFJZixRQUFRLENBQUU7TUFDWm9CLEtBQUssRUFBRUEsS0FBSztNQUNaQyxnQkFBZ0IsRUFBRTtRQUNoQkMsV0FBVyxFQUFFLEVBQUU7UUFDZkMsV0FBVyxFQUFFO01BQ2Y7SUFDRixDQUFFLENBQUMsQ0FDSjtFQUNILENBQUUsQ0FBQztFQUVILE9BQU8sSUFBSXRCLElBQUksQ0FBRTtJQUNmYyxRQUFRLEVBQUUsQ0FBRUQsaUJBQWlCLEVBQUVMLFVBQVUsQ0FBRTtJQUMzQ2UsTUFBTSxFQUFFakIsWUFBWSxDQUFDaUI7RUFDdkIsQ0FBRSxDQUFDO0FBQ0wifQ==