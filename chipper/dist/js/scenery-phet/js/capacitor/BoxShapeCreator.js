// Copyright 2019-2022, University of Colorado Boulder

/**
 * Creates 2D projections of shapes that are related to the 3D boxes.
 * Shapes are in the view coordinate frame, everything else is in model coordinates.
 * Shapes for all faces corresponds to a box with its origin in the center of the top face.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import { Shape } from '../../../kite/js/imports.js';
import sceneryPhet from '../sceneryPhet.js';
import YawPitchModelViewTransform3 from './YawPitchModelViewTransform3.js';
class BoxShapeCreator {
  /**
   * @param {YawPitchModelViewTransform3} transform
   */
  constructor(transform) {
    assert && assert(transform instanceof YawPitchModelViewTransform3);

    // @public {YawPitchModelViewTransform3}
    this.modelViewTransform = transform;
  }

  /**
   * Top face is a parallelogram.
   * @public
   *
   *    p0 -------------- p1
   *   /                /
   *  /                /
   * p3 --------------p2
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} width
   * @param {number} height
   * @param {number} depth
   * @returns {Shape}
   */
  createTopFace(x, y, z, width, height, depth) {
    // points
    const p0 = this.modelViewTransform.modelToViewXYZ(x - width / 2, y, z + depth / 2);
    const p1 = this.modelViewTransform.modelToViewXYZ(x + width / 2, y, z + depth / 2);
    const p2 = this.modelViewTransform.modelToViewXYZ(x + width / 2, y, z - depth / 2);
    const p3 = this.modelViewTransform.modelToViewXYZ(x - width / 2, y, z - depth / 2);

    // shape
    return this.createFace(p0, p1, p2, p3);
  }

  /**
   * Create the top face of the Box with a Bounds3 object.
   * @public
   *
   * @param {Bounds3} bounds
   * @returns {Shape}
   */
  createTopFaceBounds3(bounds) {
    return this.createTopFace(bounds.minX, bounds.minY, bounds.minZ, bounds.width, bounds.height, bounds.depth);
  }

  /**
   * Front face is a rectangle.
   * @public
   *
   * p0 --------------- p1
   * |                 |
   * |                 |
   * p3 --------------- p2
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} width
   * @param {number} height
   * @param {number} depth
   * @returns {Shape}
   */
  createFrontFace(x, y, z, width, height, depth) {
    // points
    const p0 = this.modelViewTransform.modelToViewXYZ(x - width / 2, y, z - depth / 2);
    const p1 = this.modelViewTransform.modelToViewXYZ(x + width / 2, y, z - depth / 2);
    const p2 = this.modelViewTransform.modelToViewXYZ(x + width / 2, y + height, z - depth / 2);
    const p3 = this.modelViewTransform.modelToViewXYZ(x - width / 2, y + height, z - depth / 2);
    // shape
    return this.createFace(p0, p1, p2, p3);
  }

  /**
   * Create the front face of the box with a Bounds3 object.
   * @public
   *
   * @param {Bounds3} bounds
   * @returns {Shape}
   */
  createFrontFaceBounds3(bounds) {
    return this.createFrontFace(bounds.minX, bounds.minY, bounds.minZ, bounds.width, bounds.height, bounds.depth);
  }

  /**
   * Right-side face is a parallelogram.
   * @public
   *
   *      p1
   *     / |
   *    /  |
   *   /   |
   *  /    p2
   * p0   /
   * |   /
   * |  /
   * | /
   * p3
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} width
   * @param {number} height
   * @param {number} depth
   * @returns {Shape}
   */
  createRightSideFace(x, y, z, width, height, depth) {
    // points
    const p0 = this.modelViewTransform.modelToViewXYZ(x + width / 2, y, z - depth / 2);
    const p1 = this.modelViewTransform.modelToViewXYZ(x + width / 2, y, z + depth / 2);
    const p2 = this.modelViewTransform.modelToViewXYZ(x + width / 2, y + height, z + depth / 2);
    const p3 = this.modelViewTransform.modelToViewXYZ(x + width / 2, y + height, z - depth / 2);
    // path
    return this.createFace(p0, p1, p2, p3);
  }

  /**
   * Create the right face of the box with a Bounds3 object.
   * @public
   *
   * @param {Bounds3} bounds
   * @returns {Shape}
   */
  createRightSideFaceBounds3(bounds) {
    return this.createRightSideFace(bounds.minX, bounds.minY, bounds.minZ, bounds.width, bounds.height, bounds.depth);
  }

  /**
   * A complete box, relative to a specific origin.
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} width
   * @param {number} height
   * @param {number} depth
   * @returns {Shape}
   */
  createBoxShape(x, y, z, width, height, depth) {
    const topShape = this.createTopFace(x, y, z, width, height, depth);
    const frontShape = this.createFrontFace(x, y, z, width, height, depth);
    const sideShape = this.createRightSideFace(x, y, z, width, height, depth);
    return Shape.union([topShape, frontShape, sideShape]);
  }

  /**
   * A face is defined by 4 points, specified in view coordinates.
   * @public
   *
   * @returns {Shape}
   */
  createFace(p0, p1, p2, p3) {
    return new Shape().moveToPoint(p0).lineToPoint(p1).lineToPoint(p2).lineToPoint(p3).close();
  }
}
sceneryPhet.register('BoxShapeCreator', BoxShapeCreator);
export default BoxShapeCreator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsInNjZW5lcnlQaGV0IiwiWWF3UGl0Y2hNb2RlbFZpZXdUcmFuc2Zvcm0zIiwiQm94U2hhcGVDcmVhdG9yIiwiY29uc3RydWN0b3IiLCJ0cmFuc2Zvcm0iLCJhc3NlcnQiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJjcmVhdGVUb3BGYWNlIiwieCIsInkiLCJ6Iiwid2lkdGgiLCJoZWlnaHQiLCJkZXB0aCIsInAwIiwibW9kZWxUb1ZpZXdYWVoiLCJwMSIsInAyIiwicDMiLCJjcmVhdGVGYWNlIiwiY3JlYXRlVG9wRmFjZUJvdW5kczMiLCJib3VuZHMiLCJtaW5YIiwibWluWSIsIm1pbloiLCJjcmVhdGVGcm9udEZhY2UiLCJjcmVhdGVGcm9udEZhY2VCb3VuZHMzIiwiY3JlYXRlUmlnaHRTaWRlRmFjZSIsImNyZWF0ZVJpZ2h0U2lkZUZhY2VCb3VuZHMzIiwiY3JlYXRlQm94U2hhcGUiLCJ0b3BTaGFwZSIsImZyb250U2hhcGUiLCJzaWRlU2hhcGUiLCJ1bmlvbiIsIm1vdmVUb1BvaW50IiwibGluZVRvUG9pbnQiLCJjbG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQm94U2hhcGVDcmVhdG9yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgMkQgcHJvamVjdGlvbnMgb2Ygc2hhcGVzIHRoYXQgYXJlIHJlbGF0ZWQgdG8gdGhlIDNEIGJveGVzLlxyXG4gKiBTaGFwZXMgYXJlIGluIHRoZSB2aWV3IGNvb3JkaW5hdGUgZnJhbWUsIGV2ZXJ5dGhpbmcgZWxzZSBpcyBpbiBtb2RlbCBjb29yZGluYXRlcy5cclxuICogU2hhcGVzIGZvciBhbGwgZmFjZXMgY29ycmVzcG9uZHMgdG8gYSBib3ggd2l0aCBpdHMgb3JpZ2luIGluIHRoZSBjZW50ZXIgb2YgdGhlIHRvcCBmYWNlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBBbmRyZXcgQWRhcmUgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vc2NlbmVyeVBoZXQuanMnO1xyXG5pbXBvcnQgWWF3UGl0Y2hNb2RlbFZpZXdUcmFuc2Zvcm0zIGZyb20gJy4vWWF3UGl0Y2hNb2RlbFZpZXdUcmFuc2Zvcm0zLmpzJztcclxuXHJcbmNsYXNzIEJveFNoYXBlQ3JlYXRvciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7WWF3UGl0Y2hNb2RlbFZpZXdUcmFuc2Zvcm0zfSB0cmFuc2Zvcm1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdHJhbnNmb3JtICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHJhbnNmb3JtIGluc3RhbmNlb2YgWWF3UGl0Y2hNb2RlbFZpZXdUcmFuc2Zvcm0zICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7WWF3UGl0Y2hNb2RlbFZpZXdUcmFuc2Zvcm0zfVxyXG4gICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0gPSB0cmFuc2Zvcm07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUb3AgZmFjZSBpcyBhIHBhcmFsbGVsb2dyYW0uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogICAgcDAgLS0tLS0tLS0tLS0tLS0gcDFcclxuICAgKiAgIC8gICAgICAgICAgICAgICAgL1xyXG4gICAqICAvICAgICAgICAgICAgICAgIC9cclxuICAgKiBwMyAtLS0tLS0tLS0tLS0tLXAyXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRlcHRoXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIGNyZWF0ZVRvcEZhY2UoIHgsIHksIHosIHdpZHRoLCBoZWlnaHQsIGRlcHRoICkge1xyXG4gICAgLy8gcG9pbnRzXHJcbiAgICBjb25zdCBwMCA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WFlaKCB4IC0gKCB3aWR0aCAvIDIgKSwgeSwgeiArICggZGVwdGggLyAyICkgKTtcclxuICAgIGNvbnN0IHAxID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYWVooIHggKyAoIHdpZHRoIC8gMiApLCB5LCB6ICsgKCBkZXB0aCAvIDIgKSApO1xyXG4gICAgY29uc3QgcDIgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1hZWiggeCArICggd2lkdGggLyAyICksIHksIHogLSAoIGRlcHRoIC8gMiApICk7XHJcbiAgICBjb25zdCBwMyA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WFlaKCB4IC0gKCB3aWR0aCAvIDIgKSwgeSwgeiAtICggZGVwdGggLyAyICkgKTtcclxuXHJcbiAgICAvLyBzaGFwZVxyXG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlRmFjZSggcDAsIHAxLCBwMiwgcDMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSB0aGUgdG9wIGZhY2Ugb2YgdGhlIEJveCB3aXRoIGEgQm91bmRzMyBvYmplY3QuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb3VuZHMzfSBib3VuZHNcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgY3JlYXRlVG9wRmFjZUJvdW5kczMoIGJvdW5kcyApIHtcclxuICAgIHJldHVybiB0aGlzLmNyZWF0ZVRvcEZhY2UoIGJvdW5kcy5taW5YLCBib3VuZHMubWluWSwgYm91bmRzLm1pblosIGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCwgYm91bmRzLmRlcHRoICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGcm9udCBmYWNlIGlzIGEgcmVjdGFuZ2xlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIHAwIC0tLS0tLS0tLS0tLS0tLSBwMVxyXG4gICAqIHwgICAgICAgICAgICAgICAgIHxcclxuICAgKiB8ICAgICAgICAgICAgICAgICB8XHJcbiAgICogcDMgLS0tLS0tLS0tLS0tLS0tIHAyXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRlcHRoXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIGNyZWF0ZUZyb250RmFjZSggeCwgeSwgeiwgd2lkdGgsIGhlaWdodCwgZGVwdGggKSB7XHJcbiAgICAvLyBwb2ludHNcclxuICAgIGNvbnN0IHAwID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYWVooIHggLSAoIHdpZHRoIC8gMiApLCB5LCB6IC0gKCBkZXB0aCAvIDIgKSApO1xyXG4gICAgY29uc3QgcDEgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1hZWiggeCArICggd2lkdGggLyAyICksIHksIHogLSAoIGRlcHRoIC8gMiApICk7XHJcbiAgICBjb25zdCBwMiA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WFlaKCB4ICsgKCB3aWR0aCAvIDIgKSwgeSArIGhlaWdodCwgeiAtICggZGVwdGggLyAyICkgKTtcclxuICAgIGNvbnN0IHAzID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYWVooIHggLSAoIHdpZHRoIC8gMiApLCB5ICsgaGVpZ2h0LCB6IC0gKCBkZXB0aCAvIDIgKSApO1xyXG4gICAgLy8gc2hhcGVcclxuICAgIHJldHVybiB0aGlzLmNyZWF0ZUZhY2UoIHAwLCBwMSwgcDIsIHAzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgdGhlIGZyb250IGZhY2Ugb2YgdGhlIGJveCB3aXRoIGEgQm91bmRzMyBvYmplY3QuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb3VuZHMzfSBib3VuZHNcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgY3JlYXRlRnJvbnRGYWNlQm91bmRzMyggYm91bmRzICkge1xyXG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlRnJvbnRGYWNlKCBib3VuZHMubWluWCwgYm91bmRzLm1pblksIGJvdW5kcy5taW5aLCBib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIGJvdW5kcy5kZXB0aCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmlnaHQtc2lkZSBmYWNlIGlzIGEgcGFyYWxsZWxvZ3JhbS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiAgICAgIHAxXHJcbiAgICogICAgIC8gfFxyXG4gICAqICAgIC8gIHxcclxuICAgKiAgIC8gICB8XHJcbiAgICogIC8gICAgcDJcclxuICAgKiBwMCAgIC9cclxuICAgKiB8ICAgL1xyXG4gICAqIHwgIC9cclxuICAgKiB8IC9cclxuICAgKiBwM1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB6XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkZXB0aFxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKi9cclxuICBjcmVhdGVSaWdodFNpZGVGYWNlKCB4LCB5LCB6LCB3aWR0aCwgaGVpZ2h0LCBkZXB0aCApIHtcclxuICAgIC8vIHBvaW50c1xyXG4gICAgY29uc3QgcDAgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1hZWiggeCArICggd2lkdGggLyAyICksIHksIHogLSAoIGRlcHRoIC8gMiApICk7XHJcbiAgICBjb25zdCBwMSA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WFlaKCB4ICsgKCB3aWR0aCAvIDIgKSwgeSwgeiArICggZGVwdGggLyAyICkgKTtcclxuICAgIGNvbnN0IHAyID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYWVooIHggKyAoIHdpZHRoIC8gMiApLCB5ICsgaGVpZ2h0LCB6ICsgKCBkZXB0aCAvIDIgKSApO1xyXG4gICAgY29uc3QgcDMgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1hZWiggeCArICggd2lkdGggLyAyICksIHkgKyBoZWlnaHQsIHogLSAoIGRlcHRoIC8gMiApICk7XHJcbiAgICAvLyBwYXRoXHJcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVGYWNlKCBwMCwgcDEsIHAyLCBwMyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIHRoZSByaWdodCBmYWNlIG9mIHRoZSBib3ggd2l0aCBhIEJvdW5kczMgb2JqZWN0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Qm91bmRzM30gYm91bmRzXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIGNyZWF0ZVJpZ2h0U2lkZUZhY2VCb3VuZHMzKCBib3VuZHMgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVSaWdodFNpZGVGYWNlKCBib3VuZHMubWluWCwgYm91bmRzLm1pblksIGJvdW5kcy5taW5aLCBib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIGJvdW5kcy5kZXB0aCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBjb21wbGV0ZSBib3gsIHJlbGF0aXZlIHRvIGEgc3BlY2lmaWMgb3JpZ2luLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gelxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGVwdGhcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgY3JlYXRlQm94U2hhcGUoIHgsIHksIHosIHdpZHRoLCBoZWlnaHQsIGRlcHRoICkge1xyXG4gICAgY29uc3QgdG9wU2hhcGUgPSB0aGlzLmNyZWF0ZVRvcEZhY2UoIHgsIHksIHosIHdpZHRoLCBoZWlnaHQsIGRlcHRoICk7XHJcbiAgICBjb25zdCBmcm9udFNoYXBlID0gdGhpcy5jcmVhdGVGcm9udEZhY2UoIHgsIHksIHosIHdpZHRoLCBoZWlnaHQsIGRlcHRoICk7XHJcbiAgICBjb25zdCBzaWRlU2hhcGUgPSB0aGlzLmNyZWF0ZVJpZ2h0U2lkZUZhY2UoIHgsIHksIHosIHdpZHRoLCBoZWlnaHQsIGRlcHRoICk7XHJcbiAgICByZXR1cm4gU2hhcGUudW5pb24oIFsgdG9wU2hhcGUsIGZyb250U2hhcGUsIHNpZGVTaGFwZSBdICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBIGZhY2UgaXMgZGVmaW5lZCBieSA0IHBvaW50cywgc3BlY2lmaWVkIGluIHZpZXcgY29vcmRpbmF0ZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqL1xyXG4gIGNyZWF0ZUZhY2UoIHAwLCBwMSwgcDIsIHAzICkge1xyXG4gICAgcmV0dXJuIG5ldyBTaGFwZSgpXHJcbiAgICAgIC5tb3ZlVG9Qb2ludCggcDAgKVxyXG4gICAgICAubGluZVRvUG9pbnQoIHAxIClcclxuICAgICAgLmxpbmVUb1BvaW50KCBwMiApXHJcbiAgICAgIC5saW5lVG9Qb2ludCggcDMgKVxyXG4gICAgICAuY2xvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnQm94U2hhcGVDcmVhdG9yJywgQm94U2hhcGVDcmVhdG9yICk7XHJcbmV4cG9ydCBkZWZhdWx0IEJveFNoYXBlQ3JlYXRvcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxLQUFLLFFBQVEsNkJBQTZCO0FBQ25ELE9BQU9DLFdBQVcsTUFBTSxtQkFBbUI7QUFDM0MsT0FBT0MsMkJBQTJCLE1BQU0sa0NBQWtDO0FBRTFFLE1BQU1DLGVBQWUsQ0FBQztFQUVwQjtBQUNGO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsU0FBUyxFQUFHO0lBQ3ZCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUQsU0FBUyxZQUFZSCwyQkFBNEIsQ0FBQzs7SUFFcEU7SUFDQSxJQUFJLENBQUNLLGtCQUFrQixHQUFHRixTQUFTO0VBQ3JDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUcsYUFBYUEsQ0FBRUMsQ0FBQyxFQUFFQyxDQUFDLEVBQUVDLENBQUMsRUFBRUMsS0FBSyxFQUFFQyxNQUFNLEVBQUVDLEtBQUssRUFBRztJQUM3QztJQUNBLE1BQU1DLEVBQUUsR0FBRyxJQUFJLENBQUNSLGtCQUFrQixDQUFDUyxjQUFjLENBQUVQLENBQUMsR0FBS0csS0FBSyxHQUFHLENBQUcsRUFBRUYsQ0FBQyxFQUFF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