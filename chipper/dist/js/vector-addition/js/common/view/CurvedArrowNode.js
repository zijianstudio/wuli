// Copyright 2019-2023, University of Colorado Boulder

/**
 * View for an arrow that is curved. Used in various other views throughout the sim.
 *
 * A solution using `SCENERY-PHET/CurvedArrowShape` was investigated, but it was inappropriate for use in this sim.
 * See https://github.com/phetsims/vector-addition/blob/master/doc/images/CurvedArrowNode-notes.png for an explanation.
 *
 * ## Other functionality:
 *  - The Arrowhead turns invisible when the angle becomes too small (i.e. the triangle is larger than the arc)
 *  - The arrow is assumed to start at 0 rad.
 *  - Contains methods to change the radius
 *  - Contains methods to change the angle
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color, Node, Path } from '../../../../scenery/js/imports.js';
import vectorAddition from '../../vectorAddition.js';
export default class CurvedArrowNode extends Node {
  /**
   * @param {number} radius - the radius of curved arrow.
   * @param {number} angle - the end angle (in radians) of the curved arrow. The arrow is assumed to start at 0
   *                         radians.
   * @param {Object} [options]
   */
  constructor(radius, angle, options) {
    assert && assert(typeof radius === 'number' && radius > 0, `invalid radius: ${radius}`);
    assert && assert(typeof angle === 'number', `invalid angle: ${angle}`);
    assert && assert(!options || Object.getPrototypeOf(options) === Object.prototype, `Extra prototype on options: ${options}`);
    options = merge({
      arrowheadWidth: 8,
      // {number} the arrowhead width (before rotation)
      arrowheadHeight: 6,
      // {number} the arrowhead height (before rotation)

      // options passed to the Path that creates the arrow's curved tail (arc)
      arcOptions: {
        stroke: Color.BLACK,
        lineWidth: 1.2
      },
      // options passed to the Path that creates the arrow's head
      arrowOptions: {
        fill: Color.BLACK
      }
    }, options);

    //----------------------------------------------------------------------------------------

    // Create the path for the arc. Set to an arbitrary shape for now. To be updated later.
    const arcPath = new Path(new Shape(), options.arcOptions);

    //----------------------------------------------------------------------------------------
    // Arrowhead triangle Path

    // Create the arrowhead shape of the arc
    const arrowheadShape = new Shape();

    // Create the triangle. Define the triangle as a triangle that is upright and the midpoint of its base as (0, 0)
    arrowheadShape.moveTo(0, 0).lineTo(-options.arrowheadWidth / 2, 0).lineTo(options.arrowheadWidth / 2, 0).lineTo(0, -options.arrowheadHeight).lineTo(-options.arrowheadWidth / 2, 0).close();

    // Create the path for the arrow head. To be translated/rotated later
    const arrowheadPath = new Path(arrowheadShape, options.arrowOptions);

    //----------------------------------------------------------------------------------------

    super({
      children: [arcPath, arrowheadPath]
    });

    // @private {number} radius
    this.radius = radius;

    // @public (read-only) angle
    this.angle = angle;

    //----------------------------------------------------------------------------------------

    // @private {function} updateArrowNode - function that updates the arrow node when the angle / radius changes
    this.updateArrowNode = () => {
      //----------------------------------------------------------------------------------------
      // See https://github.com/phetsims/vector-addition/blob/master/doc/images/angle-calculations.png
      // for an annotated drawing of how the subtended angle and the corrected angle are calculated
      //----------------------------------------------------------------------------------------

      // The arrowhead subtended angle is defined as the angle between the vector from the center to the tip of the
      // arrow and the vector of the center to first point the arc and the triangle intersect
      const arrowheadSubtendedAngle = Math.asin(options.arrowheadHeight / this.radius);

      // Flag that indicates if the arc is anticlockwise (measured from positive x-axis) or clockwise.
      const isAnticlockwise = this.angle >= 0;

      // The corrected angle is the angle that is between the vector that goes from the center to the first point the
      // arc and the triangle intersect and the vector along the baseline (x-axis). This is used instead to create a
      // more accurate angle excluding the size of the triangle. Again, look at the drawing above.
      const correctedAngle = isAnticlockwise ? this.angle - arrowheadSubtendedAngle : this.angle + arrowheadSubtendedAngle;

      // Change the arrowhead visibility to false when the angle is too small relative to the subtended angle and true
      // otherwise
      arrowheadPath.visible = Math.abs(this.angle) > arrowheadSubtendedAngle;

      // Create the arc shape
      const arcShape = new Shape().arcPoint(Vector2.ZERO, this.radius, 0, arrowheadPath.visible ? -correctedAngle : -this.angle, isAnticlockwise);
      arcPath.setShape(arcShape);
      if (arrowheadPath.visible) {
        // Adjust the position and angle of arrowhead. Rotate the arrowhead from the tip into the correct position
        // from the original angle
        arrowheadPath.setRotation(isAnticlockwise ? -this.angle : -this.angle + Math.PI);

        // Translate the tip of the arrowhead to the tip of the arc.
        arrowheadPath.setTranslation(Math.cos(arrowheadPath.visible ? correctedAngle : this.angle) * this.radius, -Math.sin(arrowheadPath.visible ? correctedAngle : this.angle) * this.radius);
      }
    };
    this.updateArrowNode();
  }

  /**
   * Sets the angle of the arc.
   * @public
   * @param {number} angle - the end angle (in radians) of the curved arrow. The arrow is assumed to start at 0 radians.
   */
  setAngle(angle) {
    assert && assert(typeof angle === 'number', `invalid angle: ${angle}`);
    this.angle = angle;
    this.updateArrowNode();
  }

  /**
   * Sets the radius of the arc.
   * @public
   * @param {number} radius - the radius of curved arrow.
   */
  setRadius(radius) {
    assert && assert(typeof radius === 'number' && radius > 0, `invalid radius: ${radius}`);
    this.radius = radius;
    this.updateArrowNode();
  }
}
vectorAddition.register('CurvedArrowNode', CurvedArrowNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU2hhcGUiLCJtZXJnZSIsIkNvbG9yIiwiTm9kZSIsIlBhdGgiLCJ2ZWN0b3JBZGRpdGlvbiIsIkN1cnZlZEFycm93Tm9kZSIsImNvbnN0cnVjdG9yIiwicmFkaXVzIiwiYW5nbGUiLCJvcHRpb25zIiwiYXNzZXJ0IiwiT2JqZWN0IiwiZ2V0UHJvdG90eXBlT2YiLCJwcm90b3R5cGUiLCJhcnJvd2hlYWRXaWR0aCIsImFycm93aGVhZEhlaWdodCIsImFyY09wdGlvbnMiLCJzdHJva2UiLCJCTEFDSyIsImxpbmVXaWR0aCIsImFycm93T3B0aW9ucyIsImZpbGwiLCJhcmNQYXRoIiwiYXJyb3doZWFkU2hhcGUiLCJtb3ZlVG8iLCJsaW5lVG8iLCJjbG9zZSIsImFycm93aGVhZFBhdGgiLCJjaGlsZHJlbiIsInVwZGF0ZUFycm93Tm9kZSIsImFycm93aGVhZFN1YnRlbmRlZEFuZ2xlIiwiTWF0aCIsImFzaW4iLCJpc0FudGljbG9ja3dpc2UiLCJjb3JyZWN0ZWRBbmdsZSIsInZpc2libGUiLCJhYnMiLCJhcmNTaGFwZSIsImFyY1BvaW50IiwiWkVSTyIsInNldFNoYXBlIiwic2V0Um90YXRpb24iLCJQSSIsInNldFRyYW5zbGF0aW9uIiwiY29zIiwic2luIiwic2V0QW5nbGUiLCJzZXRSYWRpdXMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkN1cnZlZEFycm93Tm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciBhbiBhcnJvdyB0aGF0IGlzIGN1cnZlZC4gVXNlZCBpbiB2YXJpb3VzIG90aGVyIHZpZXdzIHRocm91Z2hvdXQgdGhlIHNpbS5cclxuICpcclxuICogQSBzb2x1dGlvbiB1c2luZyBgU0NFTkVSWS1QSEVUL0N1cnZlZEFycm93U2hhcGVgIHdhcyBpbnZlc3RpZ2F0ZWQsIGJ1dCBpdCB3YXMgaW5hcHByb3ByaWF0ZSBmb3IgdXNlIGluIHRoaXMgc2ltLlxyXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZlY3Rvci1hZGRpdGlvbi9ibG9iL21hc3Rlci9kb2MvaW1hZ2VzL0N1cnZlZEFycm93Tm9kZS1ub3Rlcy5wbmcgZm9yIGFuIGV4cGxhbmF0aW9uLlxyXG4gKlxyXG4gKiAjIyBPdGhlciBmdW5jdGlvbmFsaXR5OlxyXG4gKiAgLSBUaGUgQXJyb3doZWFkIHR1cm5zIGludmlzaWJsZSB3aGVuIHRoZSBhbmdsZSBiZWNvbWVzIHRvbyBzbWFsbCAoaS5lLiB0aGUgdHJpYW5nbGUgaXMgbGFyZ2VyIHRoYW4gdGhlIGFyYylcclxuICogIC0gVGhlIGFycm93IGlzIGFzc3VtZWQgdG8gc3RhcnQgYXQgMCByYWQuXHJcbiAqICAtIENvbnRhaW5zIG1ldGhvZHMgdG8gY2hhbmdlIHRoZSByYWRpdXNcclxuICogIC0gQ29udGFpbnMgbWV0aG9kcyB0byBjaGFuZ2UgdGhlIGFuZ2xlXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIE5vZGUsIFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgdmVjdG9yQWRkaXRpb24gZnJvbSAnLi4vLi4vdmVjdG9yQWRkaXRpb24uanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3VydmVkQXJyb3dOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXMgLSB0aGUgcmFkaXVzIG9mIGN1cnZlZCBhcnJvdy5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSB0aGUgZW5kIGFuZ2xlIChpbiByYWRpYW5zKSBvZiB0aGUgY3VydmVkIGFycm93LiBUaGUgYXJyb3cgaXMgYXNzdW1lZCB0byBzdGFydCBhdCAwXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgcmFkaWFucy5cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHJhZGl1cywgYW5nbGUsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHJhZGl1cyA9PT0gJ251bWJlcicgJiYgcmFkaXVzID4gMCwgYGludmFsaWQgcmFkaXVzOiAke3JhZGl1c31gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgYW5nbGUgPT09ICdudW1iZXInLCBgaW52YWxpZCBhbmdsZTogJHthbmdsZX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIG9wdGlvbnMgKSA9PT0gT2JqZWN0LnByb3RvdHlwZSxcclxuICAgICAgYEV4dHJhIHByb3RvdHlwZSBvbiBvcHRpb25zOiAke29wdGlvbnN9YCApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgYXJyb3doZWFkV2lkdGg6IDgsICAvLyB7bnVtYmVyfSB0aGUgYXJyb3doZWFkIHdpZHRoIChiZWZvcmUgcm90YXRpb24pXHJcbiAgICAgIGFycm93aGVhZEhlaWdodDogNiwgLy8ge251bWJlcn0gdGhlIGFycm93aGVhZCBoZWlnaHQgKGJlZm9yZSByb3RhdGlvbilcclxuXHJcbiAgICAgIC8vIG9wdGlvbnMgcGFzc2VkIHRvIHRoZSBQYXRoIHRoYXQgY3JlYXRlcyB0aGUgYXJyb3cncyBjdXJ2ZWQgdGFpbCAoYXJjKVxyXG4gICAgICBhcmNPcHRpb25zOiB7XHJcbiAgICAgICAgc3Ryb2tlOiBDb2xvci5CTEFDSyxcclxuICAgICAgICBsaW5lV2lkdGg6IDEuMlxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gb3B0aW9ucyBwYXNzZWQgdG8gdGhlIFBhdGggdGhhdCBjcmVhdGVzIHRoZSBhcnJvdydzIGhlYWRcclxuICAgICAgYXJyb3dPcHRpb25zOiB7XHJcbiAgICAgICAgZmlsbDogQ29sb3IuQkxBQ0tcclxuICAgICAgfVxyXG5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIHBhdGggZm9yIHRoZSBhcmMuIFNldCB0byBhbiBhcmJpdHJhcnkgc2hhcGUgZm9yIG5vdy4gVG8gYmUgdXBkYXRlZCBsYXRlci5cclxuICAgIGNvbnN0IGFyY1BhdGggPSBuZXcgUGF0aCggbmV3IFNoYXBlKCksIG9wdGlvbnMuYXJjT3B0aW9ucyApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gQXJyb3doZWFkIHRyaWFuZ2xlIFBhdGhcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGFycm93aGVhZCBzaGFwZSBvZiB0aGUgYXJjXHJcbiAgICBjb25zdCBhcnJvd2hlYWRTaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgdHJpYW5nbGUuIERlZmluZSB0aGUgdHJpYW5nbGUgYXMgYSB0cmlhbmdsZSB0aGF0IGlzIHVwcmlnaHQgYW5kIHRoZSBtaWRwb2ludCBvZiBpdHMgYmFzZSBhcyAoMCwgMClcclxuICAgIGFycm93aGVhZFNoYXBlLm1vdmVUbyggMCwgMCApXHJcbiAgICAgIC5saW5lVG8oIC1vcHRpb25zLmFycm93aGVhZFdpZHRoIC8gMiwgMCApXHJcbiAgICAgIC5saW5lVG8oIG9wdGlvbnMuYXJyb3doZWFkV2lkdGggLyAyLCAwIClcclxuICAgICAgLmxpbmVUbyggMCwgLW9wdGlvbnMuYXJyb3doZWFkSGVpZ2h0IClcclxuICAgICAgLmxpbmVUbyggLW9wdGlvbnMuYXJyb3doZWFkV2lkdGggLyAyLCAwIClcclxuICAgICAgLmNsb3NlKCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBwYXRoIGZvciB0aGUgYXJyb3cgaGVhZC4gVG8gYmUgdHJhbnNsYXRlZC9yb3RhdGVkIGxhdGVyXHJcbiAgICBjb25zdCBhcnJvd2hlYWRQYXRoID0gbmV3IFBhdGgoIGFycm93aGVhZFNoYXBlLCBvcHRpb25zLmFycm93T3B0aW9ucyApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHN1cGVyKCB7IGNoaWxkcmVuOiBbIGFyY1BhdGgsIGFycm93aGVhZFBhdGggXSB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gcmFkaXVzXHJcbiAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIGFuZ2xlXHJcbiAgICB0aGlzLmFuZ2xlID0gYW5nbGU7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Z1bmN0aW9ufSB1cGRhdGVBcnJvd05vZGUgLSBmdW5jdGlvbiB0aGF0IHVwZGF0ZXMgdGhlIGFycm93IG5vZGUgd2hlbiB0aGUgYW5nbGUgLyByYWRpdXMgY2hhbmdlc1xyXG4gICAgdGhpcy51cGRhdGVBcnJvd05vZGUgPSAoKSA9PiB7XHJcblxyXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy92ZWN0b3ItYWRkaXRpb24vYmxvYi9tYXN0ZXIvZG9jL2ltYWdlcy9hbmdsZS1jYWxjdWxhdGlvbnMucG5nXHJcbiAgICAgIC8vIGZvciBhbiBhbm5vdGF0ZWQgZHJhd2luZyBvZiBob3cgdGhlIHN1YnRlbmRlZCBhbmdsZSBhbmQgdGhlIGNvcnJlY3RlZCBhbmdsZSBhcmUgY2FsY3VsYXRlZFxyXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgIC8vIFRoZSBhcnJvd2hlYWQgc3VidGVuZGVkIGFuZ2xlIGlzIGRlZmluZWQgYXMgdGhlIGFuZ2xlIGJldHdlZW4gdGhlIHZlY3RvciBmcm9tIHRoZSBjZW50ZXIgdG8gdGhlIHRpcCBvZiB0aGVcclxuICAgICAgLy8gYXJyb3cgYW5kIHRoZSB2ZWN0b3Igb2YgdGhlIGNlbnRlciB0byBmaXJzdCBwb2ludCB0aGUgYXJjIGFuZCB0aGUgdHJpYW5nbGUgaW50ZXJzZWN0XHJcbiAgICAgIGNvbnN0IGFycm93aGVhZFN1YnRlbmRlZEFuZ2xlID0gTWF0aC5hc2luKCBvcHRpb25zLmFycm93aGVhZEhlaWdodCAvIHRoaXMucmFkaXVzICk7XHJcblxyXG4gICAgICAvLyBGbGFnIHRoYXQgaW5kaWNhdGVzIGlmIHRoZSBhcmMgaXMgYW50aWNsb2Nrd2lzZSAobWVhc3VyZWQgZnJvbSBwb3NpdGl2ZSB4LWF4aXMpIG9yIGNsb2Nrd2lzZS5cclxuICAgICAgY29uc3QgaXNBbnRpY2xvY2t3aXNlID0gdGhpcy5hbmdsZSA+PSAwO1xyXG5cclxuICAgICAgLy8gVGhlIGNvcnJlY3RlZCBhbmdsZSBpcyB0aGUgYW5nbGUgdGhhdCBpcyBiZXR3ZWVuIHRoZSB2ZWN0b3IgdGhhdCBnb2VzIGZyb20gdGhlIGNlbnRlciB0byB0aGUgZmlyc3QgcG9pbnQgdGhlXHJcbiAgICAgIC8vIGFyYyBhbmQgdGhlIHRyaWFuZ2xlIGludGVyc2VjdCBhbmQgdGhlIHZlY3RvciBhbG9uZyB0aGUgYmFzZWxpbmUgKHgtYXhpcykuIFRoaXMgaXMgdXNlZCBpbnN0ZWFkIHRvIGNyZWF0ZSBhXHJcbiAgICAgIC8vIG1vcmUgYWNjdXJhdGUgYW5nbGUgZXhjbHVkaW5nIHRoZSBzaXplIG9mIHRoZSB0cmlhbmdsZS4gQWdhaW4sIGxvb2sgYXQgdGhlIGRyYXdpbmcgYWJvdmUuXHJcbiAgICAgIGNvbnN0IGNvcnJlY3RlZEFuZ2xlID0gaXNBbnRpY2xvY2t3aXNlID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFuZ2xlIC0gYXJyb3doZWFkU3VidGVuZGVkQW5nbGUgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYW5nbGUgKyBhcnJvd2hlYWRTdWJ0ZW5kZWRBbmdsZTtcclxuXHJcbiAgICAgIC8vIENoYW5nZSB0aGUgYXJyb3doZWFkIHZpc2liaWxpdHkgdG8gZmFsc2Ugd2hlbiB0aGUgYW5nbGUgaXMgdG9vIHNtYWxsIHJlbGF0aXZlIHRvIHRoZSBzdWJ0ZW5kZWQgYW5nbGUgYW5kIHRydWVcclxuICAgICAgLy8gb3RoZXJ3aXNlXHJcbiAgICAgIGFycm93aGVhZFBhdGgudmlzaWJsZSA9IE1hdGguYWJzKCB0aGlzLmFuZ2xlICkgPiBhcnJvd2hlYWRTdWJ0ZW5kZWRBbmdsZTtcclxuXHJcbiAgICAgIC8vIENyZWF0ZSB0aGUgYXJjIHNoYXBlXHJcbiAgICAgIGNvbnN0IGFyY1NoYXBlID0gbmV3IFNoYXBlKCkuYXJjUG9pbnQoIFZlY3RvcjIuWkVSTyxcclxuICAgICAgICB0aGlzLnJhZGl1cyxcclxuICAgICAgICAwLFxyXG4gICAgICAgIGFycm93aGVhZFBhdGgudmlzaWJsZSA/IC1jb3JyZWN0ZWRBbmdsZSA6IC10aGlzLmFuZ2xlLCBpc0FudGljbG9ja3dpc2UgKTtcclxuICAgICAgYXJjUGF0aC5zZXRTaGFwZSggYXJjU2hhcGUgKTtcclxuXHJcbiAgICAgIGlmICggYXJyb3doZWFkUGF0aC52aXNpYmxlICkge1xyXG5cclxuICAgICAgICAvLyBBZGp1c3QgdGhlIHBvc2l0aW9uIGFuZCBhbmdsZSBvZiBhcnJvd2hlYWQuIFJvdGF0ZSB0aGUgYXJyb3doZWFkIGZyb20gdGhlIHRpcCBpbnRvIHRoZSBjb3JyZWN0IHBvc2l0aW9uXHJcbiAgICAgICAgLy8gZnJvbSB0aGUgb3JpZ2luYWwgYW5nbGVcclxuICAgICAgICBhcnJvd2hlYWRQYXRoLnNldFJvdGF0aW9uKCBpc0FudGljbG9ja3dpc2UgPyAtdGhpcy5hbmdsZSA6IC10aGlzLmFuZ2xlICsgTWF0aC5QSSApO1xyXG5cclxuICAgICAgICAvLyBUcmFuc2xhdGUgdGhlIHRpcCBvZiB0aGUgYXJyb3doZWFkIHRvIHRoZSB0aXAgb2YgdGhlIGFyYy5cclxuICAgICAgICBhcnJvd2hlYWRQYXRoLnNldFRyYW5zbGF0aW9uKFxyXG4gICAgICAgICAgTWF0aC5jb3MoIGFycm93aGVhZFBhdGgudmlzaWJsZSA/IGNvcnJlY3RlZEFuZ2xlIDogdGhpcy5hbmdsZSApICogdGhpcy5yYWRpdXMsXHJcbiAgICAgICAgICAtTWF0aC5zaW4oIGFycm93aGVhZFBhdGgudmlzaWJsZSA/IGNvcnJlY3RlZEFuZ2xlIDogdGhpcy5hbmdsZSApICogdGhpcy5yYWRpdXNcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhpcy51cGRhdGVBcnJvd05vZGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGFuZ2xlIG9mIHRoZSBhcmMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIHRoZSBlbmQgYW5nbGUgKGluIHJhZGlhbnMpIG9mIHRoZSBjdXJ2ZWQgYXJyb3cuIFRoZSBhcnJvdyBpcyBhc3N1bWVkIHRvIHN0YXJ0IGF0IDAgcmFkaWFucy5cclxuICAgKi9cclxuICBzZXRBbmdsZSggYW5nbGUgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgYW5nbGUgPT09ICdudW1iZXInLCBgaW52YWxpZCBhbmdsZTogJHthbmdsZX1gICk7XHJcblxyXG4gICAgdGhpcy5hbmdsZSA9IGFuZ2xlO1xyXG4gICAgdGhpcy51cGRhdGVBcnJvd05vZGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHJhZGl1cyBvZiB0aGUgYXJjLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzIC0gdGhlIHJhZGl1cyBvZiBjdXJ2ZWQgYXJyb3cuXHJcbiAgICovXHJcbiAgc2V0UmFkaXVzKCByYWRpdXMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgcmFkaXVzID09PSAnbnVtYmVyJyAmJiByYWRpdXMgPiAwLCBgaW52YWxpZCByYWRpdXM6ICR7cmFkaXVzfWAgKTtcclxuXHJcbiAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuICAgIHRoaXMudXBkYXRlQXJyb3dOb2RlKCk7XHJcbiAgfVxyXG59XHJcblxyXG52ZWN0b3JBZGRpdGlvbi5yZWdpc3RlciggJ0N1cnZlZEFycm93Tm9kZScsIEN1cnZlZEFycm93Tm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxLQUFLLEVB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