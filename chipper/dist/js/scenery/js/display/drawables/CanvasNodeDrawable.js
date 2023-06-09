// Copyright 2016-2022, University of Colorado Boulder

/**
 * Canvas drawable for CanvasNode. A generated CanvasSelfDrawable whose purpose will be drawing our CanvasNode.
 * One of these drawables will be created for each displayed instance of a CanvasNode.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Poolable from '../../../../phet-core/js/Poolable.js';
import { CanvasSelfDrawable, scenery } from '../../imports.js';
const emptyArray = []; // constant, used for line-dash

class CanvasNodeDrawable extends CanvasSelfDrawable {
  /**
   * Paints this drawable to a Canvas (the wrapper contains both a Canvas reference and its drawing context).
   * @public
   *
   * Assumes that the Canvas's context is already in the proper local coordinate frame for the node, and that any
   * other required effects (opacity, clipping, etc.) have already been prepared.
   *
   * This is part of the CanvasSelfDrawable API required to be implemented for subtypes.
   *
   * @param {CanvasContextWrapper} wrapper - Contains the Canvas and its drawing context
   * @param {Node} node - Our node that is being drawn
   * @param {Matrix3} matrix - The transformation matrix applied for this node's coordinate system.
   */
  paintCanvas(wrapper, node, matrix) {
    assert && assert(!node.selfBounds.isEmpty(), `${'CanvasNode should not be used with an empty canvasBounds. ' + 'Please set canvasBounds (or use setCanvasBounds()) on '}${node.constructor.name}`);
    if (!node.selfBounds.isEmpty()) {
      const context = wrapper.context;
      context.save();

      // set back to Canvas default styles
      // TODO: are these necessary, or can we drop them for performance?
      context.fillStyle = 'black';
      context.strokeStyle = 'black';
      context.lineWidth = 1;
      context.lineCap = 'butt';
      context.lineJoin = 'miter';
      context.lineDash = emptyArray;
      context.lineDashOffset = 0;
      context.miterLimit = 10;
      node.paintCanvas(context);
      context.restore();
    }
  }
}
scenery.register('CanvasNodeDrawable', CanvasNodeDrawable);
Poolable.mixInto(CanvasNodeDrawable);
export default CanvasNodeDrawable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQb29sYWJsZSIsIkNhbnZhc1NlbGZEcmF3YWJsZSIsInNjZW5lcnkiLCJlbXB0eUFycmF5IiwiQ2FudmFzTm9kZURyYXdhYmxlIiwicGFpbnRDYW52YXMiLCJ3cmFwcGVyIiwibm9kZSIsIm1hdHJpeCIsImFzc2VydCIsInNlbGZCb3VuZHMiLCJpc0VtcHR5IiwiY29uc3RydWN0b3IiLCJuYW1lIiwiY29udGV4dCIsInNhdmUiLCJmaWxsU3R5bGUiLCJzdHJva2VTdHlsZSIsImxpbmVXaWR0aCIsImxpbmVDYXAiLCJsaW5lSm9pbiIsImxpbmVEYXNoIiwibGluZURhc2hPZmZzZXQiLCJtaXRlckxpbWl0IiwicmVzdG9yZSIsInJlZ2lzdGVyIiwibWl4SW50byJdLCJzb3VyY2VzIjpbIkNhbnZhc05vZGVEcmF3YWJsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDYW52YXMgZHJhd2FibGUgZm9yIENhbnZhc05vZGUuIEEgZ2VuZXJhdGVkIENhbnZhc1NlbGZEcmF3YWJsZSB3aG9zZSBwdXJwb3NlIHdpbGwgYmUgZHJhd2luZyBvdXIgQ2FudmFzTm9kZS5cclxuICogT25lIG9mIHRoZXNlIGRyYXdhYmxlcyB3aWxsIGJlIGNyZWF0ZWQgZm9yIGVhY2ggZGlzcGxheWVkIGluc3RhbmNlIG9mIGEgQ2FudmFzTm9kZS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xyXG5pbXBvcnQgeyBDYW52YXNTZWxmRHJhd2FibGUsIHNjZW5lcnkgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcclxuXHJcbmNvbnN0IGVtcHR5QXJyYXkgPSBbXTsgLy8gY29uc3RhbnQsIHVzZWQgZm9yIGxpbmUtZGFzaFxyXG5cclxuY2xhc3MgQ2FudmFzTm9kZURyYXdhYmxlIGV4dGVuZHMgQ2FudmFzU2VsZkRyYXdhYmxlIHtcclxuICAvKipcclxuICAgKiBQYWludHMgdGhpcyBkcmF3YWJsZSB0byBhIENhbnZhcyAodGhlIHdyYXBwZXIgY29udGFpbnMgYm90aCBhIENhbnZhcyByZWZlcmVuY2UgYW5kIGl0cyBkcmF3aW5nIGNvbnRleHQpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEFzc3VtZXMgdGhhdCB0aGUgQ2FudmFzJ3MgY29udGV4dCBpcyBhbHJlYWR5IGluIHRoZSBwcm9wZXIgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSBmb3IgdGhlIG5vZGUsIGFuZCB0aGF0IGFueVxyXG4gICAqIG90aGVyIHJlcXVpcmVkIGVmZmVjdHMgKG9wYWNpdHksIGNsaXBwaW5nLCBldGMuKSBoYXZlIGFscmVhZHkgYmVlbiBwcmVwYXJlZC5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgcGFydCBvZiB0aGUgQ2FudmFzU2VsZkRyYXdhYmxlIEFQSSByZXF1aXJlZCB0byBiZSBpbXBsZW1lbnRlZCBmb3Igc3VidHlwZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0NhbnZhc0NvbnRleHRXcmFwcGVyfSB3cmFwcGVyIC0gQ29udGFpbnMgdGhlIENhbnZhcyBhbmQgaXRzIGRyYXdpbmcgY29udGV4dFxyXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZSAtIE91ciBub2RlIHRoYXQgaXMgYmVpbmcgZHJhd25cclxuICAgKiBAcGFyYW0ge01hdHJpeDN9IG1hdHJpeCAtIFRoZSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggYXBwbGllZCBmb3IgdGhpcyBub2RlJ3MgY29vcmRpbmF0ZSBzeXN0ZW0uXHJcbiAgICovXHJcbiAgcGFpbnRDYW52YXMoIHdyYXBwZXIsIG5vZGUsIG1hdHJpeCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFub2RlLnNlbGZCb3VuZHMuaXNFbXB0eSgpLCBgJHsnQ2FudmFzTm9kZSBzaG91bGQgbm90IGJlIHVzZWQgd2l0aCBhbiBlbXB0eSBjYW52YXNCb3VuZHMuICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQbGVhc2Ugc2V0IGNhbnZhc0JvdW5kcyAob3IgdXNlIHNldENhbnZhc0JvdW5kcygpKSBvbiAnfSR7bm9kZS5jb25zdHJ1Y3Rvci5uYW1lfWAgKTtcclxuXHJcbiAgICBpZiAoICFub2RlLnNlbGZCb3VuZHMuaXNFbXB0eSgpICkge1xyXG4gICAgICBjb25zdCBjb250ZXh0ID0gd3JhcHBlci5jb250ZXh0O1xyXG4gICAgICBjb250ZXh0LnNhdmUoKTtcclxuXHJcbiAgICAgIC8vIHNldCBiYWNrIHRvIENhbnZhcyBkZWZhdWx0IHN0eWxlc1xyXG4gICAgICAvLyBUT0RPOiBhcmUgdGhlc2UgbmVjZXNzYXJ5LCBvciBjYW4gd2UgZHJvcCB0aGVtIGZvciBwZXJmb3JtYW5jZT9cclxuICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAnYmxhY2snO1xyXG4gICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcclxuICAgICAgY29udGV4dC5saW5lV2lkdGggPSAxO1xyXG4gICAgICBjb250ZXh0LmxpbmVDYXAgPSAnYnV0dCc7XHJcbiAgICAgIGNvbnRleHQubGluZUpvaW4gPSAnbWl0ZXInO1xyXG4gICAgICBjb250ZXh0LmxpbmVEYXNoID0gZW1wdHlBcnJheTtcclxuICAgICAgY29udGV4dC5saW5lRGFzaE9mZnNldCA9IDA7XHJcbiAgICAgIGNvbnRleHQubWl0ZXJMaW1pdCA9IDEwO1xyXG5cclxuICAgICAgbm9kZS5wYWludENhbnZhcyggY29udGV4dCApO1xyXG5cclxuICAgICAgY29udGV4dC5yZXN0b3JlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnQ2FudmFzTm9kZURyYXdhYmxlJywgQ2FudmFzTm9kZURyYXdhYmxlICk7XHJcblxyXG5Qb29sYWJsZS5taXhJbnRvKCBDYW52YXNOb2RlRHJhd2FibGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IENhbnZhc05vZGVEcmF3YWJsZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sc0NBQXNDO0FBQzNELFNBQVNDLGtCQUFrQixFQUFFQyxPQUFPLFFBQVEsa0JBQWtCO0FBRTlELE1BQU1DLFVBQVUsR0FBRyxFQUFFLENBQUMsQ0FBQzs7QUFFdkIsTUFBTUMsa0JBQWtCLFNBQVNILGtCQUFrQixDQUFDO0VBQ2xEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VJLFdBQVdBLENBQUVDLE9BQU8sRUFBRUMsSUFBSSxFQUFFQyxNQUFNLEVBQUc7SUFDbkNDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUNGLElBQUksQ0FBQ0csVUFBVSxDQUFDQyxPQUFPLENBQUMsQ0FBQyxFQUFHLEdBQUUsNERBQTRELEdBQzVELHdEQUF5RCxHQUFFSixJQUFJLENBQUNLLFdBQVcsQ0FBQ0MsSUFBSyxFQUFFLENBQUM7SUFFckksSUFBSyxDQUFDTixJQUFJLENBQUNHLFVBQVUsQ0FBQ0MsT0FBTyxDQUFDLENBQUMsRUFBRztNQUNoQyxNQUFNRyxPQUFPLEdBQUdSLE9BQU8sQ0FBQ1EsT0FBTztNQUMvQkEsT0FBTyxDQUFDQyxJQUFJLENBQUMsQ0FBQzs7TUFFZDtNQUNBO01BQ0FELE9BQU8sQ0FBQ0UsU0FBUyxHQUFHLE9BQU87TUFDM0JGLE9BQU8sQ0FBQ0csV0FBVyxHQUFHLE9BQU87TUFDN0JILE9BQU8sQ0FBQ0ksU0FBUyxHQUFHLENBQUM7TUFDckJKLE9BQU8sQ0FBQ0ssT0FBTyxHQUFHLE1BQU07TUFDeEJMLE9BQU8sQ0FBQ00sUUFBUSxHQUFHLE9BQU87TUFDMUJOLE9BQU8sQ0FBQ08sUUFBUSxHQUFHbEIsVUFBVTtNQUM3QlcsT0FBTyxDQUFDUSxjQUFjLEdBQUcsQ0FBQztNQUMxQlIsT0FBTyxDQUFDUyxVQUFVLEdBQUcsRUFBRTtNQUV2QmhCLElBQUksQ0FBQ0YsV0FBVyxDQUFFUyxPQUFRLENBQUM7TUFFM0JBLE9BQU8sQ0FBQ1UsT0FBTyxDQUFDLENBQUM7SUFDbkI7RUFDRjtBQUNGO0FBRUF0QixPQUFPLENBQUN1QixRQUFRLENBQUUsb0JBQW9CLEVBQUVyQixrQkFBbUIsQ0FBQztBQUU1REosUUFBUSxDQUFDMEIsT0FBTyxDQUFFdEIsa0JBQW1CLENBQUM7QUFFdEMsZUFBZUEsa0JBQWtCIn0=