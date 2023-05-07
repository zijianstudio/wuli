// Copyright 2020-2022, University of Colorado Boulder

/**
 * EnvironmentModelViewTransform is the model-view transform for the 'environment', the place where bunnies, wolves,
 * food, etc. appear. The model is 3D, the view is 2D, so this deals with the 2D projection of a 3D space.
 *
 * The ground is a trapezoid that rises with constant slope as distance from the 'camera' increases.
 * zNearModel and zFarModel define the front and back of the trapezoid, and methods related to the ground
 * are well-behaved only for z between zNearModel and zFarModel.
 *
 * Model origin and axes:
 * x = 0 is in the middle, positive right
 * y = 0 is at the horizon, positive up
 * z = 0 is at the camera, positive into the screen
 *
 * View origin and axes are typical scenery:
 * x = 0 at upper-left, positive right
 * y = 0 at upper-left, positive down
 *
 * Here are some diagrams (not to scale) that illustrate the model (3D) and view (2D) spaces:
 *
 * Model, viewed from the top:
 *
 *       xMin (-xMax)         xMax
 *          \                  /
 *        ___\________________/_______ z = zFarModel (horizon)
 *            \    ground    /
 *             \ trapezoid  /
 *              \          /
 *        _______\________/___________ z = zNearModel (bottom of view)
 *                \      /
 *                 \    /
 *                  \  /
 *        ___________\/_______________ z = 0 (camera)
 *                  x=0
 *
 * Model, viewed from the side:
 *
 *         camera
 *          z=0    zNearModel  zFarModel
 *           |         |        |
 *        ___|_________|________|_____  y = 0 (horizon)
 *           |         |       /|
 *           |         |      / |
 *           |         |     /  |
 *           |         |    /   |
 *           |         |   /    |
 *           |         |  /     |
 *           |         | /      |
 *        ___|_________|/_______|_____ y = -riseModel (bottom of view)
 *           |         |        |
 *
 * View, 2D projection:
 *
 *      (0,0)
 *        o----------------------------------------------------+
 *        |                                                    |
 *        |                  (0, 0, zFarModel )                |
 *        |-------------------------o--------------------------o (viewSize.width, yHorizonView )
 *        |                                                    |
 *        |                                                    |
 *        |                                                    |
 *        |                                                    |
 *        |                                                    |
 *        |             (0, -riseModel, zNearModel )           |
 *        +-------------------------o--------------------------o
 *                                              (viewSize.width, viewSize.height)
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson (Landscape.java, from which parts of this were adapted)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import naturalSelection from '../../naturalSelection.js';

// scale at zNearModel
const NEAR_SCALE = 1;
assert && assert(NEAR_SCALE > 0 && NEAR_SCALE <= 1, `invalid NEAR_SCALE: ${NEAR_SCALE}`);
export default class EnvironmentModelViewTransform {
  // size of the 2D view, same size as background PNG files

  // horizon distance from the top of the view, determined empirically from background PNG files

  // z coordinate of the ground at the bottom-front of the view, nearest ground point to the camera

  // z coordinate of the ground at the horizon, furthest ground point from the camera

  // rise of the ground from zNearModel to zFarModel

  // common scaling factor used to convert x and y between model and view
  // Multiply for model-to-view, divide for view-to-model.
  // z margin for getRandomGroundPosition, in model coordinates. This keeps bunnies well within the ground trapezoid,
  // and avoids floating-point errors that would have them end up just outside the ground trapezoid.
  static Z_MARGIN_MODEL = 1;
  constructor() {
    this.viewSize = new Dimension2(770, 310);
    this.yHorizonView = 95;
    this.zNearModel = 150;
    this.zFarModel = 300;
    this.riseModel = 100;

    // Ported from Landscape.getFactor in the Java version.
    this.xyScaleFactor = this.zNearModel * (this.viewSize.height - this.yHorizonView) / this.riseModel;
  }
  dispose() {
    assert && assert(false, 'EnvironmentModelViewTransform does not support dispose');
  }

  /**
   * Returns a random position on the ground, in model coordinates.
   * @param xMargin - margin from the left and right edges of the view bounds
   */
  getRandomGroundPosition(xMargin) {
    // Choose a random z coordinate on the ground trapezoid.
    const zModel = dotRandom.nextDoubleBetween(this.zNearModel + EnvironmentModelViewTransform.Z_MARGIN_MODEL, this.zFarModel - EnvironmentModelViewTransform.Z_MARGIN_MODEL);

    // Choose a random x coordinate at the z coordinate.
    const xMinModel = this.getMinimumX(zModel) + xMargin;
    const xMaxModel = this.getMaximumX(zModel) - xMargin;
    const xModel = dotRandom.nextDoubleBetween(xMinModel, xMaxModel);

    // Get the ground y coordinate at the z coordinate.
    const yModel = this.getGroundY(zModel);
    const position = new Vector3(xModel, yModel, zModel);
    assert && assert(this.isGroundPosition(position), `unexpected position: ${position}`);
    return position;
  }

  /**
   * Gets the ground position at specified x and z coordinates, in model coordinates.
   */
  getGroundPosition(xModel, zModel) {
    assert && assert(zModel >= this.zNearModel && zModel <= this.zFarModel, `invalid zModel: ${zModel}`);
    return new Vector3(xModel, this.getGroundY(zModel), zModel);
  }

  /**
   * Gets the ground y at the specified z coordinate, in model coordinates.
   * Adapted from Landscape.getGroundY in the Java version.
   */
  getGroundY(zModel) {
    assert && assert(zModel >= this.zNearModel && zModel <= this.zFarModel, `invalid zModel: ${zModel}`);

    // The slope is constant between near and far planes, so compute the scale accordingly.
    // Flip the sign because the rise is from near to far, and y = 0 is at the far plane, so all ground positions
    // will have y <= 0.
    const scale = -(this.zFarModel - zModel) / (this.zFarModel - this.zNearModel);
    return scale * this.riseModel;
  }

  /**
   * Gets the maximum x value (in model coordinates) for a particular depth.
   * This varies based on depth, since the ground is a trapezoid.
   * Ported from Landscape.getMaximumX in the Java version.
   */
  getMaximumX(zModel) {
    assert && assert(zModel > 0, `invalid zModel: ${zModel}`);
    return zModel * this.viewSize.width * 0.5 / this.xyScaleFactor;
  }

  /**
   * Gets the minimum x value (in model coordinates) for a particular depth. Since x=0 is in the center, xMin === -xMax.
   */
  getMinimumX(zModel) {
    return -this.getMaximumX(zModel);
  }

  /**
   * Gets the minimum z model coordinate for the ground trapezoid.
   */
  getMinimumZ() {
    return this.zNearModel;
  }

  /**
   * Gets the maximum z model coordinate for the ground trapezoid.
   */
  getMaximumZ() {
    return this.zFarModel;
  }

  /**
   * Gets the view scaling factor that corresponds to model z position.
   */
  getViewScale(zModel) {
    assert && assert(zModel > 0, `invalid zModel: ${zModel}`);
    return NEAR_SCALE * this.zNearModel / zModel;
  }

  /**
   * Given a 3D model position, project it into 2D view coordinates and return x.
   * Extracted from Landscape.spriteToScreen in the Java version.
   */
  modelToViewX(position) {
    assert && assert(position.z !== 0, 'z cannot be zero');
    return this.viewSize.width / 2 + position.x / position.z * this.xyScaleFactor;
  }

  /**
   * Given a 3D model position, project it into 2D view coordinates and return y.
   * Extracted from Landscape.spriteToScreen in the Java version.
   */
  modelToViewY(position) {
    assert && assert(position.z !== 0, 'z cannot be zero');
    return this.yHorizonView - position.y / position.z * this.xyScaleFactor;
  }

  /**
   * Given a view y value, return the model z value where the ground has that y height.
   * Ported from Landscape.landscapeYToZ in the Java version.
   */
  viewToModelZ(yView) {
    assert && assert(yView >= this.yHorizonView && yView <= this.viewSize.height, `invalid yView: ${yView}`);
    return this.zNearModel * this.zFarModel * (this.yHorizonView - this.viewSize.height) / (this.zFarModel * (this.yHorizonView - yView) + this.zNearModel * (yView - this.viewSize.height));
  }

  /**
   * Given a view x value and a model z value, return the model x value.
   * Ported from Landscape.landscapeXmodelZToX in the Java version.
   */
  viewToModelX(xView, zModel) {
    return zModel * (xView - this.viewSize.width / 2) / this.xyScaleFactor;
  }

  /**
   * Given view coordinates (x,y), return the ground position in model coordinates.
   */
  viewToModelGroundPosition(xView, yView) {
    assert && assert(xView >= 0 && xView <= this.viewSize.width, `invalid xView: ${xView}`);
    assert && assert(yView >= this.yHorizonView && yView <= this.viewSize.height, `invalid yView: ${yView}`);
    const zModel = this.viewToModelZ(yView);
    const xModel = this.viewToModelX(xView, zModel);
    const yModel = this.getGroundY(zModel);
    return new Vector3(xModel, yModel, zModel);
  }

  /**
   * Turns a view distance (x or y) into a model distance at a specified model z.
   * Ported from Landscape.landscapeDistanceToModel in the Java version.
   */
  viewToModelDistance(distanceView, zModel) {
    return distanceView * zModel / this.xyScaleFactor;
  }

  /**
   * Determines whether the specified position is on the ground trapezoid.
   */
  isGroundPosition(position) {
    // check z first, because the validity of x and y depend on z
    return this.isGroundZ(position) && this.isGroundX(position) && this.isGroundY(position);
  }

  /**
   * Determines whether the specified position has its x coordinate on the ground trapezoid.
   */
  isGroundX(position) {
    return position.x >= this.getMinimumX(position.z) && position.x <= this.getMaximumX(position.z);
  }

  /**
   * Determines whether the specified position has its y coordinate on the ground trapezoid.
   */
  isGroundY(position) {
    return position.y === this.getGroundY(position.z);
  }

  /**
   * Determines whether the specified position has its z coordinate on the ground trapezoid.
   */
  isGroundZ(position) {
    return position.z >= this.zNearModel && position.z <= this.zFarModel;
  }
}
naturalSelection.register('EnvironmentModelViewTransform', EnvironmentModelViewTransform);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiZG90UmFuZG9tIiwiVmVjdG9yMyIsIm5hdHVyYWxTZWxlY3Rpb24iLCJORUFSX1NDQUxFIiwiYXNzZXJ0IiwiRW52aXJvbm1lbnRNb2RlbFZpZXdUcmFuc2Zvcm0iLCJaX01BUkdJTl9NT0RFTCIsImNvbnN0cnVjdG9yIiwidmlld1NpemUiLCJ5SG9yaXpvblZpZXciLCJ6TmVhck1vZGVsIiwiekZhck1vZGVsIiwicmlzZU1vZGVsIiwieHlTY2FsZUZhY3RvciIsImhlaWdodCIsImRpc3Bvc2UiLCJnZXRSYW5kb21Hcm91bmRQb3NpdGlvbiIsInhNYXJnaW4iLCJ6TW9kZWwiLCJuZXh0RG91YmxlQmV0d2VlbiIsInhNaW5Nb2RlbCIsImdldE1pbmltdW1YIiwieE1heE1vZGVsIiwiZ2V0TWF4aW11bVgiLCJ4TW9kZWwiLCJ5TW9kZWwiLCJnZXRHcm91bmRZIiwicG9zaXRpb24iLCJpc0dyb3VuZFBvc2l0aW9uIiwiZ2V0R3JvdW5kUG9zaXRpb24iLCJzY2FsZSIsIndpZHRoIiwiZ2V0TWluaW11bVoiLCJnZXRNYXhpbXVtWiIsImdldFZpZXdTY2FsZSIsIm1vZGVsVG9WaWV3WCIsInoiLCJ4IiwibW9kZWxUb1ZpZXdZIiwieSIsInZpZXdUb01vZGVsWiIsInlWaWV3Iiwidmlld1RvTW9kZWxYIiwieFZpZXciLCJ2aWV3VG9Nb2RlbEdyb3VuZFBvc2l0aW9uIiwidmlld1RvTW9kZWxEaXN0YW5jZSIsImRpc3RhbmNlVmlldyIsImlzR3JvdW5kWiIsImlzR3JvdW5kWCIsImlzR3JvdW5kWSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRW52aXJvbm1lbnRNb2RlbFZpZXdUcmFuc2Zvcm0udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRW52aXJvbm1lbnRNb2RlbFZpZXdUcmFuc2Zvcm0gaXMgdGhlIG1vZGVsLXZpZXcgdHJhbnNmb3JtIGZvciB0aGUgJ2Vudmlyb25tZW50JywgdGhlIHBsYWNlIHdoZXJlIGJ1bm5pZXMsIHdvbHZlcyxcclxuICogZm9vZCwgZXRjLiBhcHBlYXIuIFRoZSBtb2RlbCBpcyAzRCwgdGhlIHZpZXcgaXMgMkQsIHNvIHRoaXMgZGVhbHMgd2l0aCB0aGUgMkQgcHJvamVjdGlvbiBvZiBhIDNEIHNwYWNlLlxyXG4gKlxyXG4gKiBUaGUgZ3JvdW5kIGlzIGEgdHJhcGV6b2lkIHRoYXQgcmlzZXMgd2l0aCBjb25zdGFudCBzbG9wZSBhcyBkaXN0YW5jZSBmcm9tIHRoZSAnY2FtZXJhJyBpbmNyZWFzZXMuXHJcbiAqIHpOZWFyTW9kZWwgYW5kIHpGYXJNb2RlbCBkZWZpbmUgdGhlIGZyb250IGFuZCBiYWNrIG9mIHRoZSB0cmFwZXpvaWQsIGFuZCBtZXRob2RzIHJlbGF0ZWQgdG8gdGhlIGdyb3VuZFxyXG4gKiBhcmUgd2VsbC1iZWhhdmVkIG9ubHkgZm9yIHogYmV0d2VlbiB6TmVhck1vZGVsIGFuZCB6RmFyTW9kZWwuXHJcbiAqXHJcbiAqIE1vZGVsIG9yaWdpbiBhbmQgYXhlczpcclxuICogeCA9IDAgaXMgaW4gdGhlIG1pZGRsZSwgcG9zaXRpdmUgcmlnaHRcclxuICogeSA9IDAgaXMgYXQgdGhlIGhvcml6b24sIHBvc2l0aXZlIHVwXHJcbiAqIHogPSAwIGlzIGF0IHRoZSBjYW1lcmEsIHBvc2l0aXZlIGludG8gdGhlIHNjcmVlblxyXG4gKlxyXG4gKiBWaWV3IG9yaWdpbiBhbmQgYXhlcyBhcmUgdHlwaWNhbCBzY2VuZXJ5OlxyXG4gKiB4ID0gMCBhdCB1cHBlci1sZWZ0LCBwb3NpdGl2ZSByaWdodFxyXG4gKiB5ID0gMCBhdCB1cHBlci1sZWZ0LCBwb3NpdGl2ZSBkb3duXHJcbiAqXHJcbiAqIEhlcmUgYXJlIHNvbWUgZGlhZ3JhbXMgKG5vdCB0byBzY2FsZSkgdGhhdCBpbGx1c3RyYXRlIHRoZSBtb2RlbCAoM0QpIGFuZCB2aWV3ICgyRCkgc3BhY2VzOlxyXG4gKlxyXG4gKiBNb2RlbCwgdmlld2VkIGZyb20gdGhlIHRvcDpcclxuICpcclxuICogICAgICAgeE1pbiAoLXhNYXgpICAgICAgICAgeE1heFxyXG4gKiAgICAgICAgICBcXCAgICAgICAgICAgICAgICAgIC9cclxuICogICAgICAgIF9fX1xcX19fX19fX19fX19fX19fXy9fX19fX19fIHogPSB6RmFyTW9kZWwgKGhvcml6b24pXHJcbiAqICAgICAgICAgICAgXFwgICAgZ3JvdW5kICAgIC9cclxuICogICAgICAgICAgICAgXFwgdHJhcGV6b2lkICAvXHJcbiAqICAgICAgICAgICAgICBcXCAgICAgICAgICAvXHJcbiAqICAgICAgICBfX19fX19fXFxfX19fX19fXy9fX19fX19fX19fXyB6ID0gek5lYXJNb2RlbCAoYm90dG9tIG9mIHZpZXcpXHJcbiAqICAgICAgICAgICAgICAgIFxcICAgICAgL1xyXG4gKiAgICAgICAgICAgICAgICAgXFwgICAgL1xyXG4gKiAgICAgICAgICAgICAgICAgIFxcICAvXHJcbiAqICAgICAgICBfX19fX19fX19fX1xcL19fX19fX19fX19fX19fXyB6ID0gMCAoY2FtZXJhKVxyXG4gKiAgICAgICAgICAgICAgICAgIHg9MFxyXG4gKlxyXG4gKiBNb2RlbCwgdmlld2VkIGZyb20gdGhlIHNpZGU6XHJcbiAqXHJcbiAqICAgICAgICAgY2FtZXJhXHJcbiAqICAgICAgICAgIHo9MCAgICB6TmVhck1vZGVsICB6RmFyTW9kZWxcclxuICogICAgICAgICAgIHwgICAgICAgICB8ICAgICAgICB8XHJcbiAqICAgICAgICBfX198X19fX19fX19ffF9fX19fX19ffF9fX19fICB5ID0gMCAoaG9yaXpvbilcclxuICogICAgICAgICAgIHwgICAgICAgICB8ICAgICAgIC98XHJcbiAqICAgICAgICAgICB8ICAgICAgICAgfCAgICAgIC8gfFxyXG4gKiAgICAgICAgICAgfCAgICAgICAgIHwgICAgIC8gIHxcclxuICogICAgICAgICAgIHwgICAgICAgICB8ICAgIC8gICB8XHJcbiAqICAgICAgICAgICB8ICAgICAgICAgfCAgIC8gICAgfFxyXG4gKiAgICAgICAgICAgfCAgICAgICAgIHwgIC8gICAgIHxcclxuICogICAgICAgICAgIHwgICAgICAgICB8IC8gICAgICB8XHJcbiAqICAgICAgICBfX198X19fX19fX19ffC9fX19fX19ffF9fX19fIHkgPSAtcmlzZU1vZGVsIChib3R0b20gb2YgdmlldylcclxuICogICAgICAgICAgIHwgICAgICAgICB8ICAgICAgICB8XHJcbiAqXHJcbiAqIFZpZXcsIDJEIHByb2plY3Rpb246XHJcbiAqXHJcbiAqICAgICAgKDAsMClcclxuICogICAgICAgIG8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xyXG4gKiAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAqICAgICAgICB8ICAgICAgICAgICAgICAgICAgKDAsIDAsIHpGYXJNb2RlbCApICAgICAgICAgICAgICAgIHxcclxuICogICAgICAgIHwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tby0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tbyAodmlld1NpemUud2lkdGgsIHlIb3Jpem9uVmlldyApXHJcbiAqICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcclxuICogICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAqICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcclxuICogICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgICAgfCAgICAgICAgICAgICAoMCwgLXJpc2VNb2RlbCwgek5lYXJNb2RlbCApICAgICAgICAgICB8XHJcbiAqICAgICAgICArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLW8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLW9cclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHZpZXdTaXplLndpZHRoLCB2aWV3U2l6ZS5oZWlnaHQpXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gKExhbmRzY2FwZS5qYXZhLCBmcm9tIHdoaWNoIHBhcnRzIG9mIHRoaXMgd2VyZSBhZGFwdGVkKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjMuanMnO1xyXG5pbXBvcnQgbmF0dXJhbFNlbGVjdGlvbiBmcm9tICcuLi8uLi9uYXR1cmFsU2VsZWN0aW9uLmpzJztcclxuXHJcbi8vIHNjYWxlIGF0IHpOZWFyTW9kZWxcclxuY29uc3QgTkVBUl9TQ0FMRSA9IDE7XHJcbmFzc2VydCAmJiBhc3NlcnQoIE5FQVJfU0NBTEUgPiAwICYmIE5FQVJfU0NBTEUgPD0gMSwgYGludmFsaWQgTkVBUl9TQ0FMRTogJHtORUFSX1NDQUxFfWAgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVudmlyb25tZW50TW9kZWxWaWV3VHJhbnNmb3JtIHtcclxuXHJcbiAgLy8gc2l6ZSBvZiB0aGUgMkQgdmlldywgc2FtZSBzaXplIGFzIGJhY2tncm91bmQgUE5HIGZpbGVzXHJcbiAgcHVibGljIHJlYWRvbmx5IHZpZXdTaXplOiBEaW1lbnNpb24yO1xyXG5cclxuICAvLyBob3Jpem9uIGRpc3RhbmNlIGZyb20gdGhlIHRvcCBvZiB0aGUgdmlldywgZGV0ZXJtaW5lZCBlbXBpcmljYWxseSBmcm9tIGJhY2tncm91bmQgUE5HIGZpbGVzXHJcbiAgcHVibGljIHJlYWRvbmx5IHlIb3Jpem9uVmlldzogbnVtYmVyO1xyXG5cclxuICAvLyB6IGNvb3JkaW5hdGUgb2YgdGhlIGdyb3VuZCBhdCB0aGUgYm90dG9tLWZyb250IG9mIHRoZSB2aWV3LCBuZWFyZXN0IGdyb3VuZCBwb2ludCB0byB0aGUgY2FtZXJhXHJcbiAgcHJpdmF0ZSByZWFkb25seSB6TmVhck1vZGVsOiBudW1iZXI7XHJcblxyXG4gIC8vIHogY29vcmRpbmF0ZSBvZiB0aGUgZ3JvdW5kIGF0IHRoZSBob3Jpem9uLCBmdXJ0aGVzdCBncm91bmQgcG9pbnQgZnJvbSB0aGUgY2FtZXJhXHJcbiAgcHJpdmF0ZSByZWFkb25seSB6RmFyTW9kZWw6IG51bWJlcjtcclxuXHJcbiAgLy8gcmlzZSBvZiB0aGUgZ3JvdW5kIGZyb20gek5lYXJNb2RlbCB0byB6RmFyTW9kZWxcclxuICBwcml2YXRlIHJlYWRvbmx5IHJpc2VNb2RlbDogbnVtYmVyO1xyXG5cclxuICAvLyBjb21tb24gc2NhbGluZyBmYWN0b3IgdXNlZCB0byBjb252ZXJ0IHggYW5kIHkgYmV0d2VlbiBtb2RlbCBhbmQgdmlld1xyXG4gIC8vIE11bHRpcGx5IGZvciBtb2RlbC10by12aWV3LCBkaXZpZGUgZm9yIHZpZXctdG8tbW9kZWwuXHJcbiAgcHJpdmF0ZSByZWFkb25seSB4eVNjYWxlRmFjdG9yOiBudW1iZXI7XHJcblxyXG4gIC8vIHogbWFyZ2luIGZvciBnZXRSYW5kb21Hcm91bmRQb3NpdGlvbiwgaW4gbW9kZWwgY29vcmRpbmF0ZXMuIFRoaXMga2VlcHMgYnVubmllcyB3ZWxsIHdpdGhpbiB0aGUgZ3JvdW5kIHRyYXBlem9pZCxcclxuICAvLyBhbmQgYXZvaWRzIGZsb2F0aW5nLXBvaW50IGVycm9ycyB0aGF0IHdvdWxkIGhhdmUgdGhlbSBlbmQgdXAganVzdCBvdXRzaWRlIHRoZSBncm91bmQgdHJhcGV6b2lkLlxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgWl9NQVJHSU5fTU9ERUwgPSAxO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgdGhpcy52aWV3U2l6ZSA9IG5ldyBEaW1lbnNpb24yKCA3NzAsIDMxMCApO1xyXG4gICAgdGhpcy55SG9yaXpvblZpZXcgPSA5NTtcclxuICAgIHRoaXMuek5lYXJNb2RlbCA9IDE1MDtcclxuICAgIHRoaXMuekZhck1vZGVsID0gMzAwO1xyXG4gICAgdGhpcy5yaXNlTW9kZWwgPSAxMDA7XHJcblxyXG4gICAgLy8gUG9ydGVkIGZyb20gTGFuZHNjYXBlLmdldEZhY3RvciBpbiB0aGUgSmF2YSB2ZXJzaW9uLlxyXG4gICAgdGhpcy54eVNjYWxlRmFjdG9yID0gdGhpcy56TmVhck1vZGVsICogKCB0aGlzLnZpZXdTaXplLmhlaWdodCAtIHRoaXMueUhvcml6b25WaWV3ICkgLyB0aGlzLnJpc2VNb2RlbDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdFbnZpcm9ubWVudE1vZGVsVmlld1RyYW5zZm9ybSBkb2VzIG5vdCBzdXBwb3J0IGRpc3Bvc2UnICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgcmFuZG9tIHBvc2l0aW9uIG9uIHRoZSBncm91bmQsIGluIG1vZGVsIGNvb3JkaW5hdGVzLlxyXG4gICAqIEBwYXJhbSB4TWFyZ2luIC0gbWFyZ2luIGZyb20gdGhlIGxlZnQgYW5kIHJpZ2h0IGVkZ2VzIG9mIHRoZSB2aWV3IGJvdW5kc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRSYW5kb21Hcm91bmRQb3NpdGlvbiggeE1hcmdpbjogbnVtYmVyICk6IFZlY3RvcjMge1xyXG5cclxuICAgIC8vIENob29zZSBhIHJhbmRvbSB6IGNvb3JkaW5hdGUgb24gdGhlIGdyb3VuZCB0cmFwZXpvaWQuXHJcbiAgICBjb25zdCB6TW9kZWwgPSBkb3RSYW5kb20ubmV4dERvdWJsZUJldHdlZW4oXHJcbiAgICAgIHRoaXMuek5lYXJNb2RlbCArIEVudmlyb25tZW50TW9kZWxWaWV3VHJhbnNmb3JtLlpfTUFSR0lOX01PREVMLFxyXG4gICAgICB0aGlzLnpGYXJNb2RlbCAtIEVudmlyb25tZW50TW9kZWxWaWV3VHJhbnNmb3JtLlpfTUFSR0lOX01PREVMXHJcbiAgICApO1xyXG5cclxuICAgIC8vIENob29zZSBhIHJhbmRvbSB4IGNvb3JkaW5hdGUgYXQgdGhlIHogY29vcmRpbmF0ZS5cclxuICAgIGNvbnN0IHhNaW5Nb2RlbCA9IHRoaXMuZ2V0TWluaW11bVgoIHpNb2RlbCApICsgeE1hcmdpbjtcclxuICAgIGNvbnN0IHhNYXhNb2RlbCA9IHRoaXMuZ2V0TWF4aW11bVgoIHpNb2RlbCApIC0geE1hcmdpbjtcclxuICAgIGNvbnN0IHhNb2RlbCA9IGRvdFJhbmRvbS5uZXh0RG91YmxlQmV0d2VlbiggeE1pbk1vZGVsLCB4TWF4TW9kZWwgKTtcclxuXHJcbiAgICAvLyBHZXQgdGhlIGdyb3VuZCB5IGNvb3JkaW5hdGUgYXQgdGhlIHogY29vcmRpbmF0ZS5cclxuICAgIGNvbnN0IHlNb2RlbCA9IHRoaXMuZ2V0R3JvdW5kWSggek1vZGVsICk7XHJcblxyXG4gICAgY29uc3QgcG9zaXRpb24gPSBuZXcgVmVjdG9yMyggeE1vZGVsLCB5TW9kZWwsIHpNb2RlbCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0dyb3VuZFBvc2l0aW9uKCBwb3NpdGlvbiApLCBgdW5leHBlY3RlZCBwb3NpdGlvbjogJHtwb3NpdGlvbn1gICk7XHJcblxyXG4gICAgcmV0dXJuIHBvc2l0aW9uO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgZ3JvdW5kIHBvc2l0aW9uIGF0IHNwZWNpZmllZCB4IGFuZCB6IGNvb3JkaW5hdGVzLCBpbiBtb2RlbCBjb29yZGluYXRlcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0R3JvdW5kUG9zaXRpb24oIHhNb2RlbDogbnVtYmVyLCB6TW9kZWw6IG51bWJlciApOiBWZWN0b3IzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHpNb2RlbCA+PSB0aGlzLnpOZWFyTW9kZWwgJiYgek1vZGVsIDw9IHRoaXMuekZhck1vZGVsLCBgaW52YWxpZCB6TW9kZWw6ICR7ek1vZGVsfWAgKTtcclxuICAgIHJldHVybiBuZXcgVmVjdG9yMyggeE1vZGVsLCB0aGlzLmdldEdyb3VuZFkoIHpNb2RlbCApLCB6TW9kZWwgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGdyb3VuZCB5IGF0IHRoZSBzcGVjaWZpZWQgeiBjb29yZGluYXRlLCBpbiBtb2RlbCBjb29yZGluYXRlcy5cclxuICAgKiBBZGFwdGVkIGZyb20gTGFuZHNjYXBlLmdldEdyb3VuZFkgaW4gdGhlIEphdmEgdmVyc2lvbi5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0R3JvdW5kWSggek1vZGVsOiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHpNb2RlbCA+PSB0aGlzLnpOZWFyTW9kZWwgJiYgek1vZGVsIDw9IHRoaXMuekZhck1vZGVsLCBgaW52YWxpZCB6TW9kZWw6ICR7ek1vZGVsfWAgKTtcclxuXHJcbiAgICAvLyBUaGUgc2xvcGUgaXMgY29uc3RhbnQgYmV0d2VlbiBuZWFyIGFuZCBmYXIgcGxhbmVzLCBzbyBjb21wdXRlIHRoZSBzY2FsZSBhY2NvcmRpbmdseS5cclxuICAgIC8vIEZsaXAgdGhlIHNpZ24gYmVjYXVzZSB0aGUgcmlzZSBpcyBmcm9tIG5lYXIgdG8gZmFyLCBhbmQgeSA9IDAgaXMgYXQgdGhlIGZhciBwbGFuZSwgc28gYWxsIGdyb3VuZCBwb3NpdGlvbnNcclxuICAgIC8vIHdpbGwgaGF2ZSB5IDw9IDAuXHJcbiAgICBjb25zdCBzY2FsZSA9IC0oIHRoaXMuekZhck1vZGVsIC0gek1vZGVsICkgLyAoIHRoaXMuekZhck1vZGVsIC0gdGhpcy56TmVhck1vZGVsICk7XHJcblxyXG4gICAgcmV0dXJuIHNjYWxlICogdGhpcy5yaXNlTW9kZWw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBtYXhpbXVtIHggdmFsdWUgKGluIG1vZGVsIGNvb3JkaW5hdGVzKSBmb3IgYSBwYXJ0aWN1bGFyIGRlcHRoLlxyXG4gICAqIFRoaXMgdmFyaWVzIGJhc2VkIG9uIGRlcHRoLCBzaW5jZSB0aGUgZ3JvdW5kIGlzIGEgdHJhcGV6b2lkLlxyXG4gICAqIFBvcnRlZCBmcm9tIExhbmRzY2FwZS5nZXRNYXhpbXVtWCBpbiB0aGUgSmF2YSB2ZXJzaW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRNYXhpbXVtWCggek1vZGVsOiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHpNb2RlbCA+IDAsIGBpbnZhbGlkIHpNb2RlbDogJHt6TW9kZWx9YCApO1xyXG4gICAgcmV0dXJuIHpNb2RlbCAqIHRoaXMudmlld1NpemUud2lkdGggKiAwLjUgLyB0aGlzLnh5U2NhbGVGYWN0b3I7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBtaW5pbXVtIHggdmFsdWUgKGluIG1vZGVsIGNvb3JkaW5hdGVzKSBmb3IgYSBwYXJ0aWN1bGFyIGRlcHRoLiBTaW5jZSB4PTAgaXMgaW4gdGhlIGNlbnRlciwgeE1pbiA9PT0gLXhNYXguXHJcbiAgICovXHJcbiAgcHVibGljIGdldE1pbmltdW1YKCB6TW9kZWw6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIC10aGlzLmdldE1heGltdW1YKCB6TW9kZWwgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG1pbmltdW0geiBtb2RlbCBjb29yZGluYXRlIGZvciB0aGUgZ3JvdW5kIHRyYXBlem9pZC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TWluaW11bVooKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLnpOZWFyTW9kZWw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBtYXhpbXVtIHogbW9kZWwgY29vcmRpbmF0ZSBmb3IgdGhlIGdyb3VuZCB0cmFwZXpvaWQuXHJcbiAgICovXHJcbiAgcHVibGljIGdldE1heGltdW1aKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy56RmFyTW9kZWw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB2aWV3IHNjYWxpbmcgZmFjdG9yIHRoYXQgY29ycmVzcG9uZHMgdG8gbW9kZWwgeiBwb3NpdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Vmlld1NjYWxlKCB6TW9kZWw6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggek1vZGVsID4gMCwgYGludmFsaWQgek1vZGVsOiAke3pNb2RlbH1gICk7XHJcbiAgICByZXR1cm4gTkVBUl9TQ0FMRSAqIHRoaXMuek5lYXJNb2RlbCAvIHpNb2RlbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdpdmVuIGEgM0QgbW9kZWwgcG9zaXRpb24sIHByb2plY3QgaXQgaW50byAyRCB2aWV3IGNvb3JkaW5hdGVzIGFuZCByZXR1cm4geC5cclxuICAgKiBFeHRyYWN0ZWQgZnJvbSBMYW5kc2NhcGUuc3ByaXRlVG9TY3JlZW4gaW4gdGhlIEphdmEgdmVyc2lvbi5cclxuICAgKi9cclxuICBwdWJsaWMgbW9kZWxUb1ZpZXdYKCBwb3NpdGlvbjogVmVjdG9yMyApOiBudW1iZXIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcG9zaXRpb24ueiAhPT0gMCwgJ3ogY2Fubm90IGJlIHplcm8nICk7XHJcbiAgICByZXR1cm4gKCB0aGlzLnZpZXdTaXplLndpZHRoIC8gMiApICsgKCBwb3NpdGlvbi54IC8gcG9zaXRpb24ueiApICogdGhpcy54eVNjYWxlRmFjdG9yO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2l2ZW4gYSAzRCBtb2RlbCBwb3NpdGlvbiwgcHJvamVjdCBpdCBpbnRvIDJEIHZpZXcgY29vcmRpbmF0ZXMgYW5kIHJldHVybiB5LlxyXG4gICAqIEV4dHJhY3RlZCBmcm9tIExhbmRzY2FwZS5zcHJpdGVUb1NjcmVlbiBpbiB0aGUgSmF2YSB2ZXJzaW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBtb2RlbFRvVmlld1koIHBvc2l0aW9uOiBWZWN0b3IzICk6IG51bWJlciB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb3NpdGlvbi56ICE9PSAwLCAneiBjYW5ub3QgYmUgemVybycgKTtcclxuICAgIHJldHVybiB0aGlzLnlIb3Jpem9uVmlldyAtICggcG9zaXRpb24ueSAvIHBvc2l0aW9uLnogKSAqIHRoaXMueHlTY2FsZUZhY3RvcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdpdmVuIGEgdmlldyB5IHZhbHVlLCByZXR1cm4gdGhlIG1vZGVsIHogdmFsdWUgd2hlcmUgdGhlIGdyb3VuZCBoYXMgdGhhdCB5IGhlaWdodC5cclxuICAgKiBQb3J0ZWQgZnJvbSBMYW5kc2NhcGUubGFuZHNjYXBlWVRvWiBpbiB0aGUgSmF2YSB2ZXJzaW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB2aWV3VG9Nb2RlbFooIHlWaWV3OiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHlWaWV3ID49IHRoaXMueUhvcml6b25WaWV3ICYmIHlWaWV3IDw9IHRoaXMudmlld1NpemUuaGVpZ2h0LCBgaW52YWxpZCB5VmlldzogJHt5Vmlld31gICk7XHJcbiAgICByZXR1cm4gKCB0aGlzLnpOZWFyTW9kZWwgKiB0aGlzLnpGYXJNb2RlbCAqICggdGhpcy55SG9yaXpvblZpZXcgLSB0aGlzLnZpZXdTaXplLmhlaWdodCApICkgL1xyXG4gICAgICAgICAgICggdGhpcy56RmFyTW9kZWwgKiAoIHRoaXMueUhvcml6b25WaWV3IC0geVZpZXcgKSArIHRoaXMuek5lYXJNb2RlbCAqICggeVZpZXcgLSB0aGlzLnZpZXdTaXplLmhlaWdodCApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiBhIHZpZXcgeCB2YWx1ZSBhbmQgYSBtb2RlbCB6IHZhbHVlLCByZXR1cm4gdGhlIG1vZGVsIHggdmFsdWUuXHJcbiAgICogUG9ydGVkIGZyb20gTGFuZHNjYXBlLmxhbmRzY2FwZVhtb2RlbFpUb1ggaW4gdGhlIEphdmEgdmVyc2lvbi5cclxuICAgKi9cclxuICBwdWJsaWMgdmlld1RvTW9kZWxYKCB4VmlldzogbnVtYmVyLCB6TW9kZWw6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHpNb2RlbCAqICggeFZpZXcgLSB0aGlzLnZpZXdTaXplLndpZHRoIC8gMiApIC8gdGhpcy54eVNjYWxlRmFjdG9yO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2l2ZW4gdmlldyBjb29yZGluYXRlcyAoeCx5KSwgcmV0dXJuIHRoZSBncm91bmQgcG9zaXRpb24gaW4gbW9kZWwgY29vcmRpbmF0ZXMuXHJcbiAgICovXHJcbiAgcHVibGljIHZpZXdUb01vZGVsR3JvdW5kUG9zaXRpb24oIHhWaWV3OiBudW1iZXIsIHlWaWV3OiBudW1iZXIgKTogVmVjdG9yMyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB4VmlldyA+PSAwICYmIHhWaWV3IDw9IHRoaXMudmlld1NpemUud2lkdGgsIGBpbnZhbGlkIHhWaWV3OiAke3hWaWV3fWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHlWaWV3ID49IHRoaXMueUhvcml6b25WaWV3ICYmIHlWaWV3IDw9IHRoaXMudmlld1NpemUuaGVpZ2h0LCBgaW52YWxpZCB5VmlldzogJHt5Vmlld31gICk7XHJcblxyXG4gICAgY29uc3Qgek1vZGVsID0gdGhpcy52aWV3VG9Nb2RlbFooIHlWaWV3ICk7XHJcbiAgICBjb25zdCB4TW9kZWwgPSB0aGlzLnZpZXdUb01vZGVsWCggeFZpZXcsIHpNb2RlbCApO1xyXG4gICAgY29uc3QgeU1vZGVsID0gdGhpcy5nZXRHcm91bmRZKCB6TW9kZWwgKTtcclxuICAgIHJldHVybiBuZXcgVmVjdG9yMyggeE1vZGVsLCB5TW9kZWwsIHpNb2RlbCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHVybnMgYSB2aWV3IGRpc3RhbmNlICh4IG9yIHkpIGludG8gYSBtb2RlbCBkaXN0YW5jZSBhdCBhIHNwZWNpZmllZCBtb2RlbCB6LlxyXG4gICAqIFBvcnRlZCBmcm9tIExhbmRzY2FwZS5sYW5kc2NhcGVEaXN0YW5jZVRvTW9kZWwgaW4gdGhlIEphdmEgdmVyc2lvbi5cclxuICAgKi9cclxuICBwdWJsaWMgdmlld1RvTW9kZWxEaXN0YW5jZSggZGlzdGFuY2VWaWV3OiBudW1iZXIsIHpNb2RlbDogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gZGlzdGFuY2VWaWV3ICogek1vZGVsIC8gdGhpcy54eVNjYWxlRmFjdG9yO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgcG9zaXRpb24gaXMgb24gdGhlIGdyb3VuZCB0cmFwZXpvaWQuXHJcbiAgICovXHJcbiAgcHVibGljIGlzR3JvdW5kUG9zaXRpb24oIHBvc2l0aW9uOiBWZWN0b3IzICk6IGJvb2xlYW4ge1xyXG5cclxuICAgIC8vIGNoZWNrIHogZmlyc3QsIGJlY2F1c2UgdGhlIHZhbGlkaXR5IG9mIHggYW5kIHkgZGVwZW5kIG9uIHpcclxuICAgIHJldHVybiAoIHRoaXMuaXNHcm91bmRaKCBwb3NpdGlvbiApICYmIHRoaXMuaXNHcm91bmRYKCBwb3NpdGlvbiApICYmIHRoaXMuaXNHcm91bmRZKCBwb3NpdGlvbiApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBwb3NpdGlvbiBoYXMgaXRzIHggY29vcmRpbmF0ZSBvbiB0aGUgZ3JvdW5kIHRyYXBlem9pZC5cclxuICAgKi9cclxuICBwcml2YXRlIGlzR3JvdW5kWCggcG9zaXRpb246IFZlY3RvcjMgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gKCBwb3NpdGlvbi54ID49IHRoaXMuZ2V0TWluaW11bVgoIHBvc2l0aW9uLnogKSAmJiBwb3NpdGlvbi54IDw9IHRoaXMuZ2V0TWF4aW11bVgoIHBvc2l0aW9uLnogKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgcG9zaXRpb24gaGFzIGl0cyB5IGNvb3JkaW5hdGUgb24gdGhlIGdyb3VuZCB0cmFwZXpvaWQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBpc0dyb3VuZFkoIHBvc2l0aW9uOiBWZWN0b3IzICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICggcG9zaXRpb24ueSA9PT0gdGhpcy5nZXRHcm91bmRZKCBwb3NpdGlvbi56ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uIGhhcyBpdHMgeiBjb29yZGluYXRlIG9uIHRoZSBncm91bmQgdHJhcGV6b2lkLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgaXNHcm91bmRaKCBwb3NpdGlvbjogVmVjdG9yMyApOiBib29sZWFuIHtcclxuICAgIHJldHVybiAoIHBvc2l0aW9uLnogPj0gdGhpcy56TmVhck1vZGVsICYmIHBvc2l0aW9uLnogPD0gdGhpcy56RmFyTW9kZWwgKTtcclxuICB9XHJcbn1cclxuXHJcbm5hdHVyYWxTZWxlY3Rpb24ucmVnaXN0ZXIoICdFbnZpcm9ubWVudE1vZGVsVmlld1RyYW5zZm9ybScsIEVudmlyb25tZW50TW9kZWxWaWV3VHJhbnNmb3JtICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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