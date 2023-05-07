// Copyright 2019-2021, University of Colorado Boulder

/**
 * Provides the transforms between model and view 3D-coordinate systems. In both coordinate systems, +x is to the right,
 * +y is down, +z is away from the viewer. Sign of rotation angles is specified using the right-hand rule.
 *
 * +y
 * ^    +z
 * |   /
 * |  /
 * | /
 * +-------> +x
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import Matrix3 from '../../../dot/js/Matrix3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector3 from '../../../dot/js/Vector3.js';
import merge from '../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import sceneryPhet from '../sceneryPhet.js';

// Scratch variable for performance
// @private
const scratchVector2 = new Vector2(0, 0);
const scratchVector3 = new Vector3(0, 0, 0);
class YawPitchModelViewTransform3 {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      scale: 12000,
      // scale for mapping from model to view (x and y scale are identical)
      pitch: 30 * Math.PI / 180,
      // rotation about the horizontal (x) axis, sign determined using the right-hand rule (radians)
      yaw: -45 * Math.PI / 180 // rotation about the vertical (y) axis, sign determined using the right-hand rule (radians)
    }, options);

    // @private {ModelViewTransform2}
    this.modelToViewTransform2D = new ModelViewTransform2(Matrix3.scaling(options.scale));

    // @private {number}
    this.pitch = options.pitch;

    // @public {number} (read-only)
    this.yaw = options.yaw;
  }

  //----------------------------------------------------------------------------
  // Model-to-view transforms
  //----------------------------------------------------------------------------

  /**
   * Maps a point from 3D model coordinates to 2D view coordinates.
   * @public
   *
   * @param {Vector3} modelPoint
   * @returns {Vector2}
   */
  modelToViewPosition(modelPoint) {
    assert && assert(modelPoint instanceof Vector3, `modelPoint must be of type Vector3. Received ${modelPoint}`);
    scratchVector2.setPolar(modelPoint.z * Math.sin(this.pitch), this.yaw);
    scratchVector2.addXY(modelPoint.x, modelPoint.y);
    return this.modelToViewTransform2D.transformPosition2(scratchVector2);
  }

  /**
   * Maps a point from 3D model coordinates to 2D view coordinates.
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Vector2}
   */
  modelToViewXYZ(x, y, z) {
    return this.modelToViewPosition(scratchVector3.setXYZ(x, y, z));
  }

  /**
   * Maps a delta from 3D model coordinates to 2D view coordinates.
   * @public
   *
   * @param {Vector3} delta
   * @returns {Vector2}
   */
  modelToViewDelta(delta) {
    const origin = this.modelToViewPosition(scratchVector3.setXYZ(0, 0, 0));
    return this.modelToViewPosition(delta).minus(origin);
  }

  /**
   * Maps a delta from 3D model coordinates to 2D view coordinates.
   * @public
   *
   * @param {number} xDelta
   * @param {number} yDelta
   * @param {number} zDelta
   * @returns {Vector2}
   */
  modelToViewDeltaXYZ(xDelta, yDelta, zDelta) {
    return this.modelToViewDelta(new Vector3(xDelta, yDelta, zDelta));
  }

  /**
   * Model shapes are all in the 2D xy plane, and have no depth.
   * @public
   *
   * @param {Shape} modelShape
   * @returns {Shape}
   */
  modelToViewShape(modelShape) {
    return this.modelToViewTransform2D.transformShape(modelShape);
  }

  /**
   * Bounds are all in the 2D xy plane, and have no depth.
   * @public
   *
   * @param  {Bounds2} modelBounds
   * @returns {Bounds2}
   */
  modelToViewBounds(modelBounds) {
    return this.modelToViewTransform2D.transformBounds2(modelBounds);
  }

  //----------------------------------------------------------------------------
  // View-to-model transforms
  //----------------------------------------------------------------------------

  /**
   * Maps a point from 2D view coordinates to 3D model coordinates. The z coordinate will be zero.
   * This is different than the inverse of modelToViewPosition.
   * @public
   *
   * @param {Vector2} viewPoint
   * @returns {Vector3}
   */
  viewToModelPosition(viewPoint) {
    return this.modelToViewTransform2D.inversePosition2(viewPoint).toVector3();
  }

  /**
   * Maps a point from 2D view coordinates to 3D model coordinates. The z coordinate will be zero.
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @returns {Vector3}
   */
  viewToModelXY(x, y) {
    return this.viewToModelPosition(scratchVector2.setXY(x, y));
  }

  /**
   * Maps a delta from 2D view coordinates to 3D model coordinates. The z coordinate will be zero.
   * @public
   *
   * @param {Vector2} delta
   * @returns {Vector3}
   */
  viewToModelDelta(delta) {
    const origin = this.viewToModelPosition(scratchVector2.setXY(0, 0));
    return this.viewToModelPosition(delta).minus(origin);
  }

  /**
   * Maps a delta from 2D view coordinates to 3D model coordinates. The z coordinate will be zero.
   * @public
   *
   * @param {number} xDelta
   * @param {number} yDelta
   * @returns {Vector3}
   */
  viewToModelDeltaXY(xDelta, yDelta) {
    return this.viewToModelDelta(new Vector2(xDelta, yDelta));
  }

  /**
   * Model shapes are all in the 2D xy plane, and have no depth.
   * @public
   *
   * @param {Shape} viewShape
   * @returns {Shape}
   */
  viewToModelShape(viewShape) {
    return this.modelToViewTransform2D.inverseShape(viewShape);
  }

  /**
   * Transforms 2D view bounds to 2D model bounds since bounds have no depth.
   * @public
   *
   * @param {Bounds2} viewBounds
   * @returns {Bounds2}
   */
  viewToModelBounds(viewBounds) {
    return this.modelToViewTransform2D.inverseBounds2(viewBounds);
  }
}
sceneryPhet.register('YawPitchModelViewTransform3', YawPitchModelViewTransform3);
export default YawPitchModelViewTransform3;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRyaXgzIiwiVmVjdG9yMiIsIlZlY3RvcjMiLCJtZXJnZSIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJzY2VuZXJ5UGhldCIsInNjcmF0Y2hWZWN0b3IyIiwic2NyYXRjaFZlY3RvcjMiLCJZYXdQaXRjaE1vZGVsVmlld1RyYW5zZm9ybTMiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJzY2FsZSIsInBpdGNoIiwiTWF0aCIsIlBJIiwieWF3IiwibW9kZWxUb1ZpZXdUcmFuc2Zvcm0yRCIsInNjYWxpbmciLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwibW9kZWxQb2ludCIsImFzc2VydCIsInNldFBvbGFyIiwieiIsInNpbiIsImFkZFhZIiwieCIsInkiLCJ0cmFuc2Zvcm1Qb3NpdGlvbjIiLCJtb2RlbFRvVmlld1hZWiIsInNldFhZWiIsIm1vZGVsVG9WaWV3RGVsdGEiLCJkZWx0YSIsIm9yaWdpbiIsIm1pbnVzIiwibW9kZWxUb1ZpZXdEZWx0YVhZWiIsInhEZWx0YSIsInlEZWx0YSIsInpEZWx0YSIsIm1vZGVsVG9WaWV3U2hhcGUiLCJtb2RlbFNoYXBlIiwidHJhbnNmb3JtU2hhcGUiLCJtb2RlbFRvVmlld0JvdW5kcyIsIm1vZGVsQm91bmRzIiwidHJhbnNmb3JtQm91bmRzMiIsInZpZXdUb01vZGVsUG9zaXRpb24iLCJ2aWV3UG9pbnQiLCJpbnZlcnNlUG9zaXRpb24yIiwidG9WZWN0b3IzIiwidmlld1RvTW9kZWxYWSIsInNldFhZIiwidmlld1RvTW9kZWxEZWx0YSIsInZpZXdUb01vZGVsRGVsdGFYWSIsInZpZXdUb01vZGVsU2hhcGUiLCJ2aWV3U2hhcGUiLCJpbnZlcnNlU2hhcGUiLCJ2aWV3VG9Nb2RlbEJvdW5kcyIsInZpZXdCb3VuZHMiLCJpbnZlcnNlQm91bmRzMiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiWWF3UGl0Y2hNb2RlbFZpZXdUcmFuc2Zvcm0zLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFByb3ZpZGVzIHRoZSB0cmFuc2Zvcm1zIGJldHdlZW4gbW9kZWwgYW5kIHZpZXcgM0QtY29vcmRpbmF0ZSBzeXN0ZW1zLiBJbiBib3RoIGNvb3JkaW5hdGUgc3lzdGVtcywgK3ggaXMgdG8gdGhlIHJpZ2h0LFxyXG4gKiAreSBpcyBkb3duLCAreiBpcyBhd2F5IGZyb20gdGhlIHZpZXdlci4gU2lnbiBvZiByb3RhdGlvbiBhbmdsZXMgaXMgc3BlY2lmaWVkIHVzaW5nIHRoZSByaWdodC1oYW5kIHJ1bGUuXHJcbiAqXHJcbiAqICt5XHJcbiAqIF4gICAgK3pcclxuICogfCAgIC9cclxuICogfCAgL1xyXG4gKiB8IC9cclxuICogKy0tLS0tLS0+ICt4XHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEFuZHJldyBBZGFyZSAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vc2NlbmVyeVBoZXQuanMnO1xyXG5cclxuLy8gU2NyYXRjaCB2YXJpYWJsZSBmb3IgcGVyZm9ybWFuY2VcclxuLy8gQHByaXZhdGVcclxuY29uc3Qgc2NyYXRjaFZlY3RvcjIgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG5jb25zdCBzY3JhdGNoVmVjdG9yMyA9IG5ldyBWZWN0b3IzKCAwLCAwLCAwICk7XHJcblxyXG5jbGFzcyBZYXdQaXRjaE1vZGVsVmlld1RyYW5zZm9ybTMge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHNjYWxlOiAxMjAwMCwgLy8gc2NhbGUgZm9yIG1hcHBpbmcgZnJvbSBtb2RlbCB0byB2aWV3ICh4IGFuZCB5IHNjYWxlIGFyZSBpZGVudGljYWwpXHJcbiAgICAgIHBpdGNoOiAzMCAqIE1hdGguUEkgLyAxODAsIC8vIHJvdGF0aW9uIGFib3V0IHRoZSBob3Jpem9udGFsICh4KSBheGlzLCBzaWduIGRldGVybWluZWQgdXNpbmcgdGhlIHJpZ2h0LWhhbmQgcnVsZSAocmFkaWFucylcclxuICAgICAgeWF3OiAtNDUgKiBNYXRoLlBJIC8gMTgwIC8vIHJvdGF0aW9uIGFib3V0IHRoZSB2ZXJ0aWNhbCAoeSkgYXhpcywgc2lnbiBkZXRlcm1pbmVkIHVzaW5nIHRoZSByaWdodC1oYW5kIHJ1bGUgKHJhZGlhbnMpXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge01vZGVsVmlld1RyYW5zZm9ybTJ9XHJcbiAgICB0aGlzLm1vZGVsVG9WaWV3VHJhbnNmb3JtMkQgPSBuZXcgTW9kZWxWaWV3VHJhbnNmb3JtMiggTWF0cml4My5zY2FsaW5nKCBvcHRpb25zLnNjYWxlICkgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfVxyXG4gICAgdGhpcy5waXRjaCA9IG9wdGlvbnMucGl0Y2g7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAocmVhZC1vbmx5KVxyXG4gICAgdGhpcy55YXcgPSBvcHRpb25zLnlhdztcclxuICB9XHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIE1vZGVsLXRvLXZpZXcgdHJhbnNmb3Jtc1xyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAvKipcclxuICAgKiBNYXBzIGEgcG9pbnQgZnJvbSAzRCBtb2RlbCBjb29yZGluYXRlcyB0byAyRCB2aWV3IGNvb3JkaW5hdGVzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yM30gbW9kZWxQb2ludFxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIG1vZGVsVG9WaWV3UG9zaXRpb24oIG1vZGVsUG9pbnQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtb2RlbFBvaW50IGluc3RhbmNlb2YgVmVjdG9yMywgYG1vZGVsUG9pbnQgbXVzdCBiZSBvZiB0eXBlIFZlY3RvcjMuIFJlY2VpdmVkICR7bW9kZWxQb2ludH1gICk7XHJcbiAgICBzY3JhdGNoVmVjdG9yMi5zZXRQb2xhciggbW9kZWxQb2ludC56ICogTWF0aC5zaW4oIHRoaXMucGl0Y2ggKSwgdGhpcy55YXcgKTtcclxuICAgIHNjcmF0Y2hWZWN0b3IyLmFkZFhZKCBtb2RlbFBvaW50LngsIG1vZGVsUG9pbnQueSApO1xyXG4gICAgcmV0dXJuIHRoaXMubW9kZWxUb1ZpZXdUcmFuc2Zvcm0yRC50cmFuc2Zvcm1Qb3NpdGlvbjIoIHNjcmF0Y2hWZWN0b3IyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXBzIGEgcG9pbnQgZnJvbSAzRCBtb2RlbCBjb29yZGluYXRlcyB0byAyRCB2aWV3IGNvb3JkaW5hdGVzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gelxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIG1vZGVsVG9WaWV3WFlaKCB4LCB5LCB6ICkge1xyXG4gICAgcmV0dXJuIHRoaXMubW9kZWxUb1ZpZXdQb3NpdGlvbiggc2NyYXRjaFZlY3RvcjMuc2V0WFlaKCB4LCB5LCB6ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcHMgYSBkZWx0YSBmcm9tIDNEIG1vZGVsIGNvb3JkaW5hdGVzIHRvIDJEIHZpZXcgY29vcmRpbmF0ZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IzfSBkZWx0YVxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIG1vZGVsVG9WaWV3RGVsdGEoIGRlbHRhICkge1xyXG4gICAgY29uc3Qgb3JpZ2luID0gdGhpcy5tb2RlbFRvVmlld1Bvc2l0aW9uKCBzY3JhdGNoVmVjdG9yMy5zZXRYWVooIDAsIDAsIDAgKSApO1xyXG4gICAgcmV0dXJuIHRoaXMubW9kZWxUb1ZpZXdQb3NpdGlvbiggZGVsdGEgKS5taW51cyggb3JpZ2luICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXBzIGEgZGVsdGEgZnJvbSAzRCBtb2RlbCBjb29yZGluYXRlcyB0byAyRCB2aWV3IGNvb3JkaW5hdGVzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4RGVsdGFcclxuICAgKiBAcGFyYW0ge251bWJlcn0geURlbHRhXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpEZWx0YVxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIG1vZGVsVG9WaWV3RGVsdGFYWVooIHhEZWx0YSwgeURlbHRhLCB6RGVsdGEgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2RlbFRvVmlld0RlbHRhKCBuZXcgVmVjdG9yMyggeERlbHRhLCB5RGVsdGEsIHpEZWx0YSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb2RlbCBzaGFwZXMgYXJlIGFsbCBpbiB0aGUgMkQgeHkgcGxhbmUsIGFuZCBoYXZlIG5vIGRlcHRoLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2hhcGV9IG1vZGVsU2hhcGVcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgbW9kZWxUb1ZpZXdTaGFwZSggbW9kZWxTaGFwZSApIHtcclxuICAgIHJldHVybiB0aGlzLm1vZGVsVG9WaWV3VHJhbnNmb3JtMkQudHJhbnNmb3JtU2hhcGUoIG1vZGVsU2hhcGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEJvdW5kcyBhcmUgYWxsIGluIHRoZSAyRCB4eSBwbGFuZSwgYW5kIGhhdmUgbm8gZGVwdGguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtICB7Qm91bmRzMn0gbW9kZWxCb3VuZHNcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzMn1cclxuICAgKi9cclxuICBtb2RlbFRvVmlld0JvdW5kcyggbW9kZWxCb3VuZHMgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2RlbFRvVmlld1RyYW5zZm9ybTJELnRyYW5zZm9ybUJvdW5kczIoIG1vZGVsQm91bmRzICk7XHJcbiAgfVxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBWaWV3LXRvLW1vZGVsIHRyYW5zZm9ybXNcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFwcyBhIHBvaW50IGZyb20gMkQgdmlldyBjb29yZGluYXRlcyB0byAzRCBtb2RlbCBjb29yZGluYXRlcy4gVGhlIHogY29vcmRpbmF0ZSB3aWxsIGJlIHplcm8uXHJcbiAgICogVGhpcyBpcyBkaWZmZXJlbnQgdGhhbiB0aGUgaW52ZXJzZSBvZiBtb2RlbFRvVmlld1Bvc2l0aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gdmlld1BvaW50XHJcbiAgICogQHJldHVybnMge1ZlY3RvcjN9XHJcbiAgICovXHJcbiAgdmlld1RvTW9kZWxQb3NpdGlvbiggdmlld1BvaW50ICkge1xyXG4gICAgcmV0dXJuIHRoaXMubW9kZWxUb1ZpZXdUcmFuc2Zvcm0yRC5pbnZlcnNlUG9zaXRpb24yKCB2aWV3UG9pbnQgKS50b1ZlY3RvcjMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcHMgYSBwb2ludCBmcm9tIDJEIHZpZXcgY29vcmRpbmF0ZXMgdG8gM0QgbW9kZWwgY29vcmRpbmF0ZXMuIFRoZSB6IGNvb3JkaW5hdGUgd2lsbCBiZSB6ZXJvLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yM31cclxuICAgKi9cclxuICB2aWV3VG9Nb2RlbFhZKCB4LCB5ICkge1xyXG4gICAgcmV0dXJuIHRoaXMudmlld1RvTW9kZWxQb3NpdGlvbiggc2NyYXRjaFZlY3RvcjIuc2V0WFkoIHgsIHkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFwcyBhIGRlbHRhIGZyb20gMkQgdmlldyBjb29yZGluYXRlcyB0byAzRCBtb2RlbCBjb29yZGluYXRlcy4gVGhlIHogY29vcmRpbmF0ZSB3aWxsIGJlIHplcm8uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBkZWx0YVxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IzfVxyXG4gICAqL1xyXG4gIHZpZXdUb01vZGVsRGVsdGEoIGRlbHRhICkge1xyXG4gICAgY29uc3Qgb3JpZ2luID0gdGhpcy52aWV3VG9Nb2RlbFBvc2l0aW9uKCBzY3JhdGNoVmVjdG9yMi5zZXRYWSggMCwgMCApICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMudmlld1RvTW9kZWxQb3NpdGlvbiggZGVsdGEgKS5taW51cyggb3JpZ2luICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXBzIGEgZGVsdGEgZnJvbSAyRCB2aWV3IGNvb3JkaW5hdGVzIHRvIDNEIG1vZGVsIGNvb3JkaW5hdGVzLiBUaGUgeiBjb29yZGluYXRlIHdpbGwgYmUgemVyby5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geERlbHRhXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlEZWx0YVxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IzfVxyXG4gICAqL1xyXG4gIHZpZXdUb01vZGVsRGVsdGFYWSggeERlbHRhLCB5RGVsdGEgKSB7XHJcbiAgICByZXR1cm4gdGhpcy52aWV3VG9Nb2RlbERlbHRhKCBuZXcgVmVjdG9yMiggeERlbHRhLCB5RGVsdGEgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW9kZWwgc2hhcGVzIGFyZSBhbGwgaW4gdGhlIDJEIHh5IHBsYW5lLCBhbmQgaGF2ZSBubyBkZXB0aC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NoYXBlfSB2aWV3U2hhcGVcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgdmlld1RvTW9kZWxTaGFwZSggdmlld1NoYXBlICkge1xyXG4gICAgcmV0dXJuIHRoaXMubW9kZWxUb1ZpZXdUcmFuc2Zvcm0yRC5pbnZlcnNlU2hhcGUoIHZpZXdTaGFwZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJhbnNmb3JtcyAyRCB2aWV3IGJvdW5kcyB0byAyRCBtb2RlbCBib3VuZHMgc2luY2UgYm91bmRzIGhhdmUgbm8gZGVwdGguXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb3VuZHMyfSB2aWV3Qm91bmRzXHJcbiAgICogQHJldHVybnMge0JvdW5kczJ9XHJcbiAgICovXHJcbiAgdmlld1RvTW9kZWxCb3VuZHMoIHZpZXdCb3VuZHMgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2RlbFRvVmlld1RyYW5zZm9ybTJELmludmVyc2VCb3VuZHMyKCB2aWV3Qm91bmRzICk7XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ1lhd1BpdGNoTW9kZWxWaWV3VHJhbnNmb3JtMycsIFlhd1BpdGNoTW9kZWxWaWV3VHJhbnNmb3JtMyApO1xyXG5leHBvcnQgZGVmYXVsdCBZYXdQaXRjaE1vZGVsVmlld1RyYW5zZm9ybTM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsS0FBSyxNQUFNLGdDQUFnQztBQUNsRCxPQUFPQyxtQkFBbUIsTUFBTSxvREFBb0Q7QUFDcEYsT0FBT0MsV0FBVyxNQUFNLG1CQUFtQjs7QUFFM0M7QUFDQTtBQUNBLE1BQU1DLGNBQWMsR0FBRyxJQUFJTCxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztBQUMxQyxNQUFNTSxjQUFjLEdBQUcsSUFBSUwsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0FBRTdDLE1BQU1NLDJCQUEyQixDQUFDO0VBRWhDO0FBQ0Y7QUFDQTtFQUNFQyxXQUFX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