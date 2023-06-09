// Copyright 2019-2022, University of Colorado Boulder

/**
 * DiffusionContainerNode is the view of the container in the 'Diffusion' screen.
 * This container has a fixed width and a removable vertical divider.
 * Do not transform this Node! It's origin must be at the origin of the view coordinate frame.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import GasPropertiesColors from '../../common/GasPropertiesColors.js';
import gasProperties from '../../gasProperties.js';
import DividerNode from './DividerNode.js';
export default class DiffusionContainerNode extends Node {
  constructor(container, modelViewTransform, providedOptions) {
    const options = optionize()({
      // empty because we're setting options.children below
    }, providedOptions);

    // Expand the container bounds to account for wall thickness.
    const viewBounds = modelViewTransform.modelToViewBounds(container.bounds).dilated(modelViewTransform.modelToViewDeltaX(container.wallThickness / 2));

    // Outside border of the container
    const borderNode = new Rectangle(viewBounds, {
      stroke: GasPropertiesColors.containerBoundsStrokeProperty,
      lineWidth: modelViewTransform.modelToViewDeltaX(container.wallThickness)
    });

    // Vertical divider
    const viewDividerThickness = modelViewTransform.modelToViewDeltaX(container.dividerThickness);
    const dividerNode = new DividerNode(container.hasDividerProperty, {
      length: modelViewTransform.modelToViewDeltaY(container.height),
      solidLineWidth: viewDividerThickness,
      dashedLineWidth: viewDividerThickness / 2,
      centerX: modelViewTransform.modelToViewX(container.dividerX),
      bottom: modelViewTransform.modelToViewY(container.position.y),
      tandem: options.tandem.createTandem('dividerNode')
    });
    options.children = [dividerNode, borderNode];
    super(options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
gasProperties.register('DiffusionContainerNode', DiffusionContainerNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiR2FzUHJvcGVydGllc0NvbG9ycyIsImdhc1Byb3BlcnRpZXMiLCJEaXZpZGVyTm9kZSIsIkRpZmZ1c2lvbkNvbnRhaW5lck5vZGUiLCJjb25zdHJ1Y3RvciIsImNvbnRhaW5lciIsIm1vZGVsVmlld1RyYW5zZm9ybSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ2aWV3Qm91bmRzIiwibW9kZWxUb1ZpZXdCb3VuZHMiLCJib3VuZHMiLCJkaWxhdGVkIiwibW9kZWxUb1ZpZXdEZWx0YVgiLCJ3YWxsVGhpY2tuZXNzIiwiYm9yZGVyTm9kZSIsInN0cm9rZSIsImNvbnRhaW5lckJvdW5kc1N0cm9rZVByb3BlcnR5IiwibGluZVdpZHRoIiwidmlld0RpdmlkZXJUaGlja25lc3MiLCJkaXZpZGVyVGhpY2tuZXNzIiwiZGl2aWRlck5vZGUiLCJoYXNEaXZpZGVyUHJvcGVydHkiLCJsZW5ndGgiLCJtb2RlbFRvVmlld0RlbHRhWSIsImhlaWdodCIsInNvbGlkTGluZVdpZHRoIiwiZGFzaGVkTGluZVdpZHRoIiwiY2VudGVyWCIsIm1vZGVsVG9WaWV3WCIsImRpdmlkZXJYIiwiYm90dG9tIiwibW9kZWxUb1ZpZXdZIiwicG9zaXRpb24iLCJ5IiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiY2hpbGRyZW4iLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEaWZmdXNpb25Db250YWluZXJOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERpZmZ1c2lvbkNvbnRhaW5lck5vZGUgaXMgdGhlIHZpZXcgb2YgdGhlIGNvbnRhaW5lciBpbiB0aGUgJ0RpZmZ1c2lvbicgc2NyZWVuLlxyXG4gKiBUaGlzIGNvbnRhaW5lciBoYXMgYSBmaXhlZCB3aWR0aCBhbmQgYSByZW1vdmFibGUgdmVydGljYWwgZGl2aWRlci5cclxuICogRG8gbm90IHRyYW5zZm9ybSB0aGlzIE5vZGUhIEl0J3Mgb3JpZ2luIG11c3QgYmUgYXQgdGhlIG9yaWdpbiBvZiB0aGUgdmlldyBjb29yZGluYXRlIGZyYW1lLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIE5vZGVPcHRpb25zLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgR2FzUHJvcGVydGllc0NvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vR2FzUHJvcGVydGllc0NvbG9ycy5qcyc7XHJcbmltcG9ydCBnYXNQcm9wZXJ0aWVzIGZyb20gJy4uLy4uL2dhc1Byb3BlcnRpZXMuanMnO1xyXG5pbXBvcnQgRGlmZnVzaW9uQ29udGFpbmVyIGZyb20gJy4uL21vZGVsL0RpZmZ1c2lvbkNvbnRhaW5lci5qcyc7XHJcbmltcG9ydCBEaXZpZGVyTm9kZSBmcm9tICcuL0RpdmlkZXJOb2RlLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBEaWZmdXNpb25Db250YWluZXJOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPE5vZGVPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaWZmdXNpb25Db250YWluZXJOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY29udGFpbmVyOiBEaWZmdXNpb25Db250YWluZXIsIG1vZGVsVmlld1RyYW5zZm9ybTogTW9kZWxWaWV3VHJhbnNmb3JtMiwgcHJvdmlkZWRPcHRpb25zOiBEaWZmdXNpb25Db250YWluZXJOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPERpZmZ1c2lvbkNvbnRhaW5lck5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcclxuICAgICAgLy8gZW1wdHkgYmVjYXVzZSB3ZSdyZSBzZXR0aW5nIG9wdGlvbnMuY2hpbGRyZW4gYmVsb3dcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEV4cGFuZCB0aGUgY29udGFpbmVyIGJvdW5kcyB0byBhY2NvdW50IGZvciB3YWxsIHRoaWNrbmVzcy5cclxuICAgIGNvbnN0IHZpZXdCb3VuZHMgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdCb3VuZHMoIGNvbnRhaW5lci5ib3VuZHMgKVxyXG4gICAgICAuZGlsYXRlZCggbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBjb250YWluZXIud2FsbFRoaWNrbmVzcyAvIDIgKSApO1xyXG5cclxuICAgIC8vIE91dHNpZGUgYm9yZGVyIG9mIHRoZSBjb250YWluZXJcclxuICAgIGNvbnN0IGJvcmRlck5vZGUgPSBuZXcgUmVjdGFuZ2xlKCB2aWV3Qm91bmRzLCB7XHJcbiAgICAgIHN0cm9rZTogR2FzUHJvcGVydGllc0NvbG9ycy5jb250YWluZXJCb3VuZHNTdHJva2VQcm9wZXJ0eSxcclxuICAgICAgbGluZVdpZHRoOiBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVgoIGNvbnRhaW5lci53YWxsVGhpY2tuZXNzIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBWZXJ0aWNhbCBkaXZpZGVyXHJcbiAgICBjb25zdCB2aWV3RGl2aWRlclRoaWNrbmVzcyA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWCggY29udGFpbmVyLmRpdmlkZXJUaGlja25lc3MgKTtcclxuICAgIGNvbnN0IGRpdmlkZXJOb2RlID0gbmV3IERpdmlkZXJOb2RlKCBjb250YWluZXIuaGFzRGl2aWRlclByb3BlcnR5LCB7XHJcbiAgICAgIGxlbmd0aDogbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFZKCBjb250YWluZXIuaGVpZ2h0ICksXHJcbiAgICAgIHNvbGlkTGluZVdpZHRoOiB2aWV3RGl2aWRlclRoaWNrbmVzcyxcclxuICAgICAgZGFzaGVkTGluZVdpZHRoOiB2aWV3RGl2aWRlclRoaWNrbmVzcyAvIDIsXHJcbiAgICAgIGNlbnRlclg6IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIGNvbnRhaW5lci5kaXZpZGVyWCApLFxyXG4gICAgICBib3R0b206IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIGNvbnRhaW5lci5wb3NpdGlvbi55ICksXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZGl2aWRlck5vZGUnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBkaXZpZGVyTm9kZSwgYm9yZGVyTm9kZSBdO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuZ2FzUHJvcGVydGllcy5yZWdpc3RlciggJ0RpZmZ1c2lvbkNvbnRhaW5lck5vZGUnLCBEaWZmdXNpb25Db250YWluZXJOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQTRCLHVDQUF1QztBQUduRixTQUFTQyxJQUFJLEVBQWVDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDaEYsT0FBT0MsbUJBQW1CLE1BQU0scUNBQXFDO0FBQ3JFLE9BQU9DLGFBQWEsTUFBTSx3QkFBd0I7QUFFbEQsT0FBT0MsV0FBVyxNQUFNLGtCQUFrQjtBQU0xQyxlQUFlLE1BQU1DLHNCQUFzQixTQUFTTCxJQUFJLENBQUM7RUFFaERNLFdBQVdBLENBQUVDLFNBQTZCLEVBQUVDLGtCQUF1QyxFQUFFQyxlQUE4QyxFQUFHO0lBRTNJLE1BQU1DLE9BQU8sR0FBR1gsU0FBUyxDQUEwRCxDQUFDLENBQUU7TUFDcEY7SUFBQSxDQUNELEVBQUVVLGVBQWdCLENBQUM7O0lBRXBCO0lBQ0EsTUFBTUUsVUFBVSxHQUFHSCxrQkFBa0IsQ0FBQ0ksaUJBQWlCLENBQUVMLFNBQVMsQ0FBQ00sTUFBTyxDQUFDLENBQ3hFQyxPQUFPLENBQUVOLGtCQUFrQixDQUFDTyxpQkFBaUIsQ0FBRVIsU0FBUyxDQUFDUyxhQUFhLEdBQUcsQ0FBRSxDQUFFLENBQUM7O0lBRWpGO0lBQ0EsTUFBTUMsVUFBVSxHQUFHLElBQUloQixTQUFTLENBQUVVLFVBQVUsRUFBRTtNQUM1Q08sTUFBTSxFQUFFaEIsbUJBQW1CLENBQUNpQiw2QkFBNkI7TUFDekRDLFNBQVMsRUFBRVosa0JBQWtCLENBQUNPLGlCQUFpQixDQUFFUixTQUFTLENBQUNTLGFBQWM7SUFDM0UsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTUssb0JBQW9CLEdBQUdiLGtCQUFrQixDQUFDTyxpQkFBaUIsQ0FBRVIsU0FBUyxDQUFDZSxnQkFBaUIsQ0FBQztJQUMvRixNQUFNQyxXQUFXLEdBQUcsSUFBSW5CLFdBQVcsQ0FBRUcsU0FBUyxDQUFDaUIsa0JBQWtCLEVBQUU7TUFDakVDLE1BQU0sRUFBRWpCLGtCQUFrQixDQUFDa0IsaUJBQWlCLENBQUVuQixTQUFTLENBQUNvQixNQUFPLENBQUM7TUFDaEVDLGNBQWMsRUFBRVAsb0JBQW9CO01BQ3BDUSxlQUFlLEVBQUVSLG9CQUFvQixHQUFHLENBQUM7TUFDekNTLE9BQU8sRUFBRXRCLGtCQUFrQixDQUFDdUIsWUFBWSxDQUFFeEIsU0FBUyxDQUFDeUIsUUFBUyxDQUFDO01BQzlEQyxNQUFNLEVBQUV6QixrQkFBa0IsQ0FBQzBCLFlBQVksQ0FBRTNCLFNBQVMsQ0FBQzRCLFFBQVEsQ0FBQ0MsQ0FBRSxDQUFDO01BQy9EQyxNQUFNLEVBQUUzQixPQUFPLENBQUMyQixNQUFNLENBQUNDLFlBQVksQ0FBRSxhQUFjO0lBQ3JELENBQUUsQ0FBQztJQUVINUIsT0FBTyxDQUFDNkIsUUFBUSxHQUFHLENBQUVoQixXQUFXLEVBQUVOLFVBQVUsQ0FBRTtJQUU5QyxLQUFLLENBQUVQLE9BQVEsQ0FBQztFQUNsQjtFQUVnQjhCLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBckMsYUFBYSxDQUFDdUMsUUFBUSxDQUFFLHdCQUF3QixFQUFFckMsc0JBQXVCLENBQUMifQ==