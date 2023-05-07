// Copyright 2022-2023, University of Colorado Boulder

/**
 * AreaUnderCurveScrubberNode is a subclass of ScrubberNode. In addition to setting the appropriate colors for
 * the scrubber, it adds a horizontal 'accumulation line' from x=0 to the x position of the scrubber.
 *
 * @author Martin Veillette
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { Line } from '../../../../scenery/js/imports.js';
import calculusGrapher from '../../calculusGrapher.js';
import ScrubberNode from './ScrubberNode.js';
import CalculusGrapherColors from '../CalculusGrapherColors.js';
export default class AreaUnderCurveScrubberNode extends ScrubberNode {
  constructor(areaUnderCurveScrubber, chartTransform, providedOptions) {
    const options = optionize()({
      // ScrubberNodeOptions
      handleColor: areaUnderCurveScrubber.colorProperty,
      lineStroke: areaUnderCurveScrubber.colorProperty
    }, providedOptions);
    super(areaUnderCurveScrubber, chartTransform, options);

    // Horizontal 'accumulation line' that extends from x=0 to the drag handle's position
    const accumulationLine = new Line(0, 0, this.handleNode.centerX, 0, {
      stroke: areaUnderCurveScrubber.colorProperty,
      lineWidth: 3,
      pickable: false // optimization, see https://github.com/phetsims/calculus-grapher/issues/210
    });

    this.addChild(accumulationLine);
    accumulationLine.moveToBack();

    // Resizes the horizontal line to match the drag handle's x position.
    this.handleNode.boundsProperty.link(() => {
      accumulationLine.x2 = this.handleNode.centerX;
      accumulationLine.centerY = this.handleNode.centerY;
    });
  }

  /**
   * Creates an icon for the area-under-curve scrubber.
   */
  static createIcon() {
    return ScrubberNode.createIcon(CalculusGrapherColors.integralCurveStrokeProperty);
  }
}
calculusGrapher.register('AreaUnderCurveScrubberNode', AreaUnderCurveScrubberNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJMaW5lIiwiY2FsY3VsdXNHcmFwaGVyIiwiU2NydWJiZXJOb2RlIiwiQ2FsY3VsdXNHcmFwaGVyQ29sb3JzIiwiQXJlYVVuZGVyQ3VydmVTY3J1YmJlck5vZGUiLCJjb25zdHJ1Y3RvciIsImFyZWFVbmRlckN1cnZlU2NydWJiZXIiLCJjaGFydFRyYW5zZm9ybSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJoYW5kbGVDb2xvciIsImNvbG9yUHJvcGVydHkiLCJsaW5lU3Ryb2tlIiwiYWNjdW11bGF0aW9uTGluZSIsImhhbmRsZU5vZGUiLCJjZW50ZXJYIiwic3Ryb2tlIiwibGluZVdpZHRoIiwicGlja2FibGUiLCJhZGRDaGlsZCIsIm1vdmVUb0JhY2siLCJib3VuZHNQcm9wZXJ0eSIsImxpbmsiLCJ4MiIsImNlbnRlclkiLCJjcmVhdGVJY29uIiwiaW50ZWdyYWxDdXJ2ZVN0cm9rZVByb3BlcnR5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBcmVhVW5kZXJDdXJ2ZVNjcnViYmVyTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBcmVhVW5kZXJDdXJ2ZVNjcnViYmVyTm9kZSBpcyBhIHN1YmNsYXNzIG9mIFNjcnViYmVyTm9kZS4gSW4gYWRkaXRpb24gdG8gc2V0dGluZyB0aGUgYXBwcm9wcmlhdGUgY29sb3JzIGZvclxyXG4gKiB0aGUgc2NydWJiZXIsIGl0IGFkZHMgYSBob3Jpem9udGFsICdhY2N1bXVsYXRpb24gbGluZScgZnJvbSB4PTAgdG8gdGhlIHggcG9zaXRpb24gb2YgdGhlIHNjcnViYmVyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGVcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQ2hhcnRUcmFuc2Zvcm0gZnJvbSAnLi4vLi4vLi4vLi4vYmFtYm9vL2pzL0NoYXJ0VHJhbnNmb3JtLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCB7IExpbmUsIE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY2FsY3VsdXNHcmFwaGVyIGZyb20gJy4uLy4uL2NhbGN1bHVzR3JhcGhlci5qcyc7XHJcbmltcG9ydCBTY3J1YmJlck5vZGUsIHsgU2NydWJiZXJOb2RlT3B0aW9ucyB9IGZyb20gJy4vU2NydWJiZXJOb2RlLmpzJztcclxuaW1wb3J0IEFyZWFVbmRlckN1cnZlU2NydWJiZXIgZnJvbSAnLi4vbW9kZWwvQXJlYVVuZGVyQ3VydmVTY3J1YmJlci5qcyc7XHJcbmltcG9ydCBDYWxjdWx1c0dyYXBoZXJDb2xvcnMgZnJvbSAnLi4vQ2FsY3VsdXNHcmFwaGVyQ29sb3JzLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBBcmVhVW5kZXJDdXJ2ZVNjcnViYmVyTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmXHJcbiAgUGlja1JlcXVpcmVkPFNjcnViYmVyTm9kZU9wdGlvbnMsICdsaW5lVG9wJyB8ICdsaW5lQm90dG9tJyB8ICd0YW5kZW0nIHwgJ3Zpc2libGVQcm9wZXJ0eSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXJlYVVuZGVyQ3VydmVTY3J1YmJlck5vZGUgZXh0ZW5kcyBTY3J1YmJlck5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGFyZWFVbmRlckN1cnZlU2NydWJiZXI6IEFyZWFVbmRlckN1cnZlU2NydWJiZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBjaGFydFRyYW5zZm9ybTogQ2hhcnRUcmFuc2Zvcm0sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IEFyZWFVbmRlckN1cnZlU2NydWJiZXJOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEFyZWFVbmRlckN1cnZlU2NydWJiZXJOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIFNjcnViYmVyTm9kZU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNjcnViYmVyTm9kZU9wdGlvbnNcclxuICAgICAgaGFuZGxlQ29sb3I6IGFyZWFVbmRlckN1cnZlU2NydWJiZXIuY29sb3JQcm9wZXJ0eSxcclxuICAgICAgbGluZVN0cm9rZTogYXJlYVVuZGVyQ3VydmVTY3J1YmJlci5jb2xvclByb3BlcnR5XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggYXJlYVVuZGVyQ3VydmVTY3J1YmJlciwgY2hhcnRUcmFuc2Zvcm0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBIb3Jpem9udGFsICdhY2N1bXVsYXRpb24gbGluZScgdGhhdCBleHRlbmRzIGZyb20geD0wIHRvIHRoZSBkcmFnIGhhbmRsZSdzIHBvc2l0aW9uXHJcbiAgICBjb25zdCBhY2N1bXVsYXRpb25MaW5lID0gbmV3IExpbmUoIDAsIDAsIHRoaXMuaGFuZGxlTm9kZS5jZW50ZXJYLCAwLCB7XHJcbiAgICAgIHN0cm9rZTogYXJlYVVuZGVyQ3VydmVTY3J1YmJlci5jb2xvclByb3BlcnR5LFxyXG4gICAgICBsaW5lV2lkdGg6IDMsXHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZSAvLyBvcHRpbWl6YXRpb24sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2FsY3VsdXMtZ3JhcGhlci9pc3N1ZXMvMjEwXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBhY2N1bXVsYXRpb25MaW5lICk7XHJcbiAgICBhY2N1bXVsYXRpb25MaW5lLm1vdmVUb0JhY2soKTtcclxuXHJcbiAgICAvLyBSZXNpemVzIHRoZSBob3Jpem9udGFsIGxpbmUgdG8gbWF0Y2ggdGhlIGRyYWcgaGFuZGxlJ3MgeCBwb3NpdGlvbi5cclxuICAgIHRoaXMuaGFuZGxlTm9kZS5ib3VuZHNQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgIGFjY3VtdWxhdGlvbkxpbmUueDIgPSB0aGlzLmhhbmRsZU5vZGUuY2VudGVyWDtcclxuICAgICAgYWNjdW11bGF0aW9uTGluZS5jZW50ZXJZID0gdGhpcy5oYW5kbGVOb2RlLmNlbnRlclk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGFuIGljb24gZm9yIHRoZSBhcmVhLXVuZGVyLWN1cnZlIHNjcnViYmVyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgb3ZlcnJpZGUgY3JlYXRlSWNvbigpOiBOb2RlIHtcclxuICAgIHJldHVybiBTY3J1YmJlck5vZGUuY3JlYXRlSWNvbiggQ2FsY3VsdXNHcmFwaGVyQ29sb3JzLmludGVncmFsQ3VydmVTdHJva2VQcm9wZXJ0eSApO1xyXG4gIH1cclxufVxyXG5cclxuY2FsY3VsdXNHcmFwaGVyLnJlZ2lzdGVyKCAnQXJlYVVuZGVyQ3VydmVTY3J1YmJlck5vZGUnLCBBcmVhVW5kZXJDdXJ2ZVNjcnViYmVyTm9kZSApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLFNBQVMsTUFBNEIsdUNBQXVDO0FBRW5GLFNBQVNDLElBQUksUUFBYyxtQ0FBbUM7QUFDOUQsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyxZQUFZLE1BQStCLG1CQUFtQjtBQUVyRSxPQUFPQyxxQkFBcUIsTUFBTSw2QkFBNkI7QUFPL0QsZUFBZSxNQUFNQywwQkFBMEIsU0FBU0YsWUFBWSxDQUFDO0VBRTVERyxXQUFXQSxDQUFFQyxzQkFBOEMsRUFDOUNDLGNBQThCLEVBQzlCQyxlQUFrRCxFQUFHO0lBRXZFLE1BQU1DLE9BQU8sR0FBR1YsU0FBUyxDQUFzRSxDQUFDLENBQUU7TUFFaEc7TUFDQVcsV0FBVyxFQUFFSixzQkFBc0IsQ0FBQ0ssYUFBYTtNQUNqREMsVUFBVSxFQUFFTixzQkFBc0IsQ0FBQ0s7SUFDckMsQ0FBQyxFQUFFSCxlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FBRUYsc0JBQXNCLEVBQUVDLGNBQWMsRUFBRUUsT0FBUSxDQUFDOztJQUV4RDtJQUNBLE1BQU1JLGdCQUFnQixHQUFHLElBQUliLElBQUksQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQ2MsVUFBVSxDQUFDQyxPQUFPLEVBQUUsQ0FBQyxFQUFFO01BQ25FQyxNQUFNLEVBQUVWLHNCQUFzQixDQUFDSyxhQUFhO01BQzVDTSxTQUFTLEVBQUUsQ0FBQztNQUNaQyxRQUFRLEVBQUUsS0FBSyxDQUFDO0lBQ2xCLENBQUUsQ0FBQzs7SUFDSCxJQUFJLENBQUNDLFFBQVEsQ0FBRU4sZ0JBQWlCLENBQUM7SUFDakNBLGdCQUFnQixDQUFDTyxVQUFVLENBQUMsQ0FBQzs7SUFFN0I7SUFDQSxJQUFJLENBQUNOLFVBQVUsQ0FBQ08sY0FBYyxDQUFDQyxJQUFJLENBQUUsTUFBTTtNQUN6Q1QsZ0JBQWdCLENBQUNVLEVBQUUsR0FBRyxJQUFJLENBQUNULFVBQVUsQ0FBQ0MsT0FBTztNQUM3Q0YsZ0JBQWdCLENBQUNXLE9BQU8sR0FBRyxJQUFJLENBQUNWLFVBQVUsQ0FBQ1UsT0FBTztJQUNwRCxDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7RUFDRSxPQUF1QkMsVUFBVUEsQ0FBQSxFQUFTO0lBQ3hDLE9BQU92QixZQUFZLENBQUN1QixVQUFVLENBQUV0QixxQkFBcUIsQ0FBQ3VCLDJCQUE0QixDQUFDO0VBQ3JGO0FBQ0Y7QUFFQXpCLGVBQWUsQ0FBQzBCLFFBQVEsQ0FBRSw0QkFBNEIsRUFBRXZCLDBCQUEyQixDQUFDIn0=