// Copyright 2015-2022, University of Colorado Boulder

/**
 * Hinge for the robotic arm. This is the red piece that the pincers are connected to.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { Circle, Node, Path } from '../../../../scenery/js/imports.js';
import hookesLaw from '../../hookesLaw.js';
import HookesLawColors from '../HookesLawColors.js';

// constants
const BODY_SIZE = new Dimension2(9, 40);
const PIVOT_SIZE = new Dimension2(26, 25);
const SCREW_RADIUS = 3;
export default class HingeNode extends Node {
  constructor(providedOptions) {
    const options = optionize()({
      // because we're setting options.children below
    }, providedOptions);

    // piece that the pincers pivot in, shape described clockwise from upper-left
    const pivotNode = new Path(new Shape().moveTo(0, -0.25 * PIVOT_SIZE.height).lineTo(PIVOT_SIZE.width, -0.5 * PIVOT_SIZE.height).lineTo(PIVOT_SIZE.width, 0.5 * PIVOT_SIZE.height).lineTo(0, 0.25 * PIVOT_SIZE.height).close(), {
      fill: HookesLawColors.HINGE,
      stroke: 'black'
    });

    // pin at the pivot point
    const pinNode = new Circle(SCREW_RADIUS, {
      fill: 'white',
      stroke: 'black',
      centerX: pivotNode.left + 10,
      centerY: pivotNode.centerY
    });

    // center of the pin
    const pinCenterNode = new Circle(0.45 * SCREW_RADIUS, {
      fill: 'black',
      center: pinNode.center
    });

    // body of the hinge, shape described clockwise from top of arc
    const theta = Math.atan(0.5 * BODY_SIZE.height / BODY_SIZE.width);
    const radius = 0.5 * BODY_SIZE.height / Math.sin(theta);
    const bodyNode = new Path(new Shape().arc(0, 0, radius, -theta, theta).lineTo(0, 0.5 * BODY_SIZE.height).lineTo(0, -0.5 * BODY_SIZE.height).close(), {
      fill: HookesLawColors.HINGE,
      stroke: 'black',
      left: pivotNode.right - 1,
      centerY: pivotNode.centerY
    });

    // specular highlight on the body
    const highlightNode = new Path(new Shape().arc(0, 4, 6, -0.75 * Math.PI, -0.25 * Math.PI).arc(0, -4, 6, 0.25 * Math.PI, 0.75 * Math.PI).close(), {
      fill: 'white',
      left: bodyNode.left + 3,
      top: bodyNode.top + 3,
      scale: 0.85
    });
    options.children = [pivotNode, pinNode, pinCenterNode, bodyNode, highlightNode];
    super(options);
  }
}
hookesLaw.register('HingeNode', HingeNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiU2hhcGUiLCJvcHRpb25pemUiLCJDaXJjbGUiLCJOb2RlIiwiUGF0aCIsImhvb2tlc0xhdyIsIkhvb2tlc0xhd0NvbG9ycyIsIkJPRFlfU0laRSIsIlBJVk9UX1NJWkUiLCJTQ1JFV19SQURJVVMiLCJIaW5nZU5vZGUiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJwaXZvdE5vZGUiLCJtb3ZlVG8iLCJoZWlnaHQiLCJsaW5lVG8iLCJ3aWR0aCIsImNsb3NlIiwiZmlsbCIsIkhJTkdFIiwic3Ryb2tlIiwicGluTm9kZSIsImNlbnRlclgiLCJsZWZ0IiwiY2VudGVyWSIsInBpbkNlbnRlck5vZGUiLCJjZW50ZXIiLCJ0aGV0YSIsIk1hdGgiLCJhdGFuIiwicmFkaXVzIiwic2luIiwiYm9keU5vZGUiLCJhcmMiLCJyaWdodCIsImhpZ2hsaWdodE5vZGUiLCJQSSIsInRvcCIsInNjYWxlIiwiY2hpbGRyZW4iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkhpbmdlTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBIaW5nZSBmb3IgdGhlIHJvYm90aWMgYXJtLiBUaGlzIGlzIHRoZSByZWQgcGllY2UgdGhhdCB0aGUgcGluY2VycyBhcmUgY29ubmVjdGVkIHRvLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBOb2RlLCBOb2RlT3B0aW9ucywgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucywgUGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBob29rZXNMYXcgZnJvbSAnLi4vLi4vaG9va2VzTGF3LmpzJztcclxuaW1wb3J0IEhvb2tlc0xhd0NvbG9ycyBmcm9tICcuLi9Ib29rZXNMYXdDb2xvcnMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEJPRFlfU0laRSA9IG5ldyBEaW1lbnNpb24yKCA5LCA0MCApO1xyXG5jb25zdCBQSVZPVF9TSVpFID0gbmV3IERpbWVuc2lvbjIoIDI2LCAyNSApO1xyXG5jb25zdCBTQ1JFV19SQURJVVMgPSAzO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIEhpbmdlTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIaW5nZU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBIaW5nZU5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8SGluZ2VOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XHJcbiAgICAgIC8vIGJlY2F1c2Ugd2UncmUgc2V0dGluZyBvcHRpb25zLmNoaWxkcmVuIGJlbG93XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBwaWVjZSB0aGF0IHRoZSBwaW5jZXJzIHBpdm90IGluLCBzaGFwZSBkZXNjcmliZWQgY2xvY2t3aXNlIGZyb20gdXBwZXItbGVmdFxyXG4gICAgY29uc3QgcGl2b3ROb2RlID0gbmV3IFBhdGgoIG5ldyBTaGFwZSgpXHJcbiAgICAgIC5tb3ZlVG8oIDAsIC0wLjI1ICogUElWT1RfU0laRS5oZWlnaHQgKVxyXG4gICAgICAubGluZVRvKCBQSVZPVF9TSVpFLndpZHRoLCAtMC41ICogUElWT1RfU0laRS5oZWlnaHQgKVxyXG4gICAgICAubGluZVRvKCBQSVZPVF9TSVpFLndpZHRoLCAwLjUgKiBQSVZPVF9TSVpFLmhlaWdodCApXHJcbiAgICAgIC5saW5lVG8oIDAsIDAuMjUgKiBQSVZPVF9TSVpFLmhlaWdodCApXHJcbiAgICAgIC5jbG9zZSgpLCB7XHJcbiAgICAgIGZpbGw6IEhvb2tlc0xhd0NvbG9ycy5ISU5HRSxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcGluIGF0IHRoZSBwaXZvdCBwb2ludFxyXG4gICAgY29uc3QgcGluTm9kZSA9IG5ldyBDaXJjbGUoIFNDUkVXX1JBRElVUywge1xyXG4gICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGNlbnRlclg6IHBpdm90Tm9kZS5sZWZ0ICsgMTAsXHJcbiAgICAgIGNlbnRlclk6IHBpdm90Tm9kZS5jZW50ZXJZXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gY2VudGVyIG9mIHRoZSBwaW5cclxuICAgIGNvbnN0IHBpbkNlbnRlck5vZGUgPSBuZXcgQ2lyY2xlKCAwLjQ1ICogU0NSRVdfUkFESVVTLCB7XHJcbiAgICAgIGZpbGw6ICdibGFjaycsXHJcbiAgICAgIGNlbnRlcjogcGluTm9kZS5jZW50ZXJcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBib2R5IG9mIHRoZSBoaW5nZSwgc2hhcGUgZGVzY3JpYmVkIGNsb2Nrd2lzZSBmcm9tIHRvcCBvZiBhcmNcclxuICAgIGNvbnN0IHRoZXRhID0gTWF0aC5hdGFuKCAoIDAuNSAqIEJPRFlfU0laRS5oZWlnaHQgKSAvIEJPRFlfU0laRS53aWR0aCApO1xyXG4gICAgY29uc3QgcmFkaXVzID0gKCAwLjUgKiBCT0RZX1NJWkUuaGVpZ2h0ICkgLyBNYXRoLnNpbiggdGhldGEgKTtcclxuICAgIGNvbnN0IGJvZHlOb2RlID0gbmV3IFBhdGgoIG5ldyBTaGFwZSgpXHJcbiAgICAgIC5hcmMoIDAsIDAsIHJhZGl1cywgLXRoZXRhLCB0aGV0YSApXHJcbiAgICAgIC5saW5lVG8oIDAsIDAuNSAqIEJPRFlfU0laRS5oZWlnaHQgKVxyXG4gICAgICAubGluZVRvKCAwLCAtMC41ICogQk9EWV9TSVpFLmhlaWdodCApXHJcbiAgICAgIC5jbG9zZSgpLCB7XHJcbiAgICAgIGZpbGw6IEhvb2tlc0xhd0NvbG9ycy5ISU5HRSxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBsZWZ0OiBwaXZvdE5vZGUucmlnaHQgLSAxLFxyXG4gICAgICBjZW50ZXJZOiBwaXZvdE5vZGUuY2VudGVyWVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHNwZWN1bGFyIGhpZ2hsaWdodCBvbiB0aGUgYm9keVxyXG4gICAgY29uc3QgaGlnaGxpZ2h0Tm9kZSA9IG5ldyBQYXRoKCBuZXcgU2hhcGUoKVxyXG4gICAgICAuYXJjKCAwLCA0LCA2LCAtMC43NSAqIE1hdGguUEksIC0wLjI1ICogTWF0aC5QSSApXHJcbiAgICAgIC5hcmMoIDAsIC00LCA2LCAwLjI1ICogTWF0aC5QSSwgMC43NSAqIE1hdGguUEkgKVxyXG4gICAgICAuY2xvc2UoKSwge1xyXG4gICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICBsZWZ0OiBib2R5Tm9kZS5sZWZ0ICsgMyxcclxuICAgICAgdG9wOiBib2R5Tm9kZS50b3AgKyAzLFxyXG4gICAgICBzY2FsZTogMC44NVxyXG4gICAgfSApO1xyXG5cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIHBpdm90Tm9kZSwgcGluTm9kZSwgcGluQ2VudGVyTm9kZSwgYm9keU5vZGUsIGhpZ2hsaWdodE5vZGUgXTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuaG9va2VzTGF3LnJlZ2lzdGVyKCAnSGluZ2VOb2RlJywgSGluZ2VOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxTQUFTLE1BQTRCLHVDQUF1QztBQUNuRixTQUFTQyxNQUFNLEVBQUVDLElBQUksRUFBdUNDLElBQUksUUFBUSxtQ0FBbUM7QUFDM0csT0FBT0MsU0FBUyxNQUFNLG9CQUFvQjtBQUMxQyxPQUFPQyxlQUFlLE1BQU0sdUJBQXVCOztBQUVuRDtBQUNBLE1BQU1DLFNBQVMsR0FBRyxJQUFJUixVQUFVLENBQUUsQ0FBQyxFQUFFLEVBQUcsQ0FBQztBQUN6QyxNQUFNUyxVQUFVLEdBQUcsSUFBSVQsVUFBVSxDQUFFLEVBQUUsRUFBRSxFQUFHLENBQUM7QUFDM0MsTUFBTVUsWUFBWSxHQUFHLENBQUM7QUFNdEIsZUFBZSxNQUFNQyxTQUFTLFNBQVNQLElBQUksQ0FBQztFQUVuQ1EsV0FBV0EsQ0FBRUMsZUFBa0MsRUFBRztJQUV2RCxNQUFNQyxPQUFPLEdBQUdaLFNBQVMsQ0FBNkMsQ0FBQyxDQUFFO01BQ3ZFO0lBQUEsQ0FDRCxFQUFFVyxlQUFnQixDQUFDOztJQUVwQjtJQUNBLE1BQU1FLFNBQVMsR0FBRyxJQUFJVixJQUFJLENBQUUsSUFBSUosS0FBSyxDQUFDLENBQUMsQ0FDcENlLE1BQU0sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUdQLFVBQVUsQ0FBQ1EsTUFBTyxDQUFDLENBQ3RDQyxNQUFNLENBQUVULFVBQVUsQ0FBQ1UsS0FBSyxFQUFFLENBQUMsR0FBRyxHQUFHVixVQUFVLENBQUNRLE1BQU8sQ0FBQyxDQUNwREMsTUFBTSxDQUFFVCxVQUFVLENBQUNVLEtBQUssRUFBRSxHQUFHLEdBQUdWLFVBQVUsQ0FBQ1EsTUFBTyxDQUFDLENBQ25EQyxNQUFNLENBQUUsQ0FBQyxF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