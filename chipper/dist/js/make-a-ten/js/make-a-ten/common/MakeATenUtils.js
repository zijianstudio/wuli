// Copyright 2015-2022, University of Colorado Boulder

/**
 * Utility methods for Make a Ten
 *
 * @author Sharfudeen Ashraf
 */

import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import { Image, Node, Rectangle } from '../../../../scenery/js/imports.js';
import makeATen from '../../makeATen.js';
const MakeATenUtils = {
  /**
   * Creates an icon using an image over a background fill.
   * @public
   *
   * @param {HTMLImageElement} image
   * @param {scenery.fill} backgroundFill
   * @returns {Node}
   */
  createIconWithBackgroundColor(image, backgroundFill) {
    const imageNode = new Image(image);
    return new ScreenIcon(new Node({
      children: [new Rectangle(0, 0, imageNode.imageWidth, imageNode.imageHeight, {
        fill: backgroundFill
      }), imageNode]
    }), {
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 1
    });
  }
};
makeATen.register('MakeATenUtils', MakeATenUtils);
export default MakeATenUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW5JY29uIiwiSW1hZ2UiLCJOb2RlIiwiUmVjdGFuZ2xlIiwibWFrZUFUZW4iLCJNYWtlQVRlblV0aWxzIiwiY3JlYXRlSWNvbldpdGhCYWNrZ3JvdW5kQ29sb3IiLCJpbWFnZSIsImJhY2tncm91bmRGaWxsIiwiaW1hZ2VOb2RlIiwiY2hpbGRyZW4iLCJpbWFnZVdpZHRoIiwiaW1hZ2VIZWlnaHQiLCJmaWxsIiwibWF4SWNvbldpZHRoUHJvcG9ydGlvbiIsIm1heEljb25IZWlnaHRQcm9wb3J0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNYWtlQVRlblV0aWxzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFV0aWxpdHkgbWV0aG9kcyBmb3IgTWFrZSBhIFRlblxyXG4gKlxyXG4gKiBAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmXHJcbiAqL1xyXG5cclxuaW1wb3J0IFNjcmVlbkljb24gZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuSWNvbi5qcyc7XHJcbmltcG9ydCB7IEltYWdlLCBOb2RlLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWFrZUFUZW4gZnJvbSAnLi4vLi4vbWFrZUFUZW4uanMnO1xyXG5cclxuY29uc3QgTWFrZUFUZW5VdGlscyA9IHtcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGFuIGljb24gdXNpbmcgYW4gaW1hZ2Ugb3ZlciBhIGJhY2tncm91bmQgZmlsbC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0hUTUxJbWFnZUVsZW1lbnR9IGltYWdlXHJcbiAgICogQHBhcmFtIHtzY2VuZXJ5LmZpbGx9IGJhY2tncm91bmRGaWxsXHJcbiAgICogQHJldHVybnMge05vZGV9XHJcbiAgICovXHJcbiAgY3JlYXRlSWNvbldpdGhCYWNrZ3JvdW5kQ29sb3IoIGltYWdlLCBiYWNrZ3JvdW5kRmlsbCApIHtcclxuICAgIGNvbnN0IGltYWdlTm9kZSA9IG5ldyBJbWFnZSggaW1hZ2UgKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFNjcmVlbkljb24oIG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IFJlY3RhbmdsZSggMCwgMCwgaW1hZ2VOb2RlLmltYWdlV2lkdGgsIGltYWdlTm9kZS5pbWFnZUhlaWdodCwge1xyXG4gICAgICAgICAgZmlsbDogYmFja2dyb3VuZEZpbGxcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgaW1hZ2VOb2RlXHJcbiAgICAgIF1cclxuICAgIH0gKSwge1xyXG4gICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICBtYXhJY29uSGVpZ2h0UHJvcG9ydGlvbjogMVxyXG4gICAgfSApO1xyXG4gIH1cclxufTtcclxuXHJcbm1ha2VBVGVuLnJlZ2lzdGVyKCAnTWFrZUFUZW5VdGlscycsIE1ha2VBVGVuVXRpbHMgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1ha2VBVGVuVXRpbHM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBTSxvQ0FBb0M7QUFDM0QsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDMUUsT0FBT0MsUUFBUSxNQUFNLG1CQUFtQjtBQUV4QyxNQUFNQyxhQUFhLEdBQUc7RUFDcEI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyw2QkFBNkJBLENBQUVDLEtBQUssRUFBRUMsY0FBYyxFQUFHO0lBQ3JELE1BQU1DLFNBQVMsR0FBRyxJQUFJUixLQUFLLENBQUVNLEtBQU0sQ0FBQztJQUVwQyxPQUFPLElBQUlQLFVBQVUsQ0FBRSxJQUFJRSxJQUFJLENBQUU7TUFDL0JRLFFBQVEsRUFBRSxDQUNSLElBQUlQLFNBQVMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFTSxTQUFTLENBQUNFLFVBQVUsRUFBRUYsU0FBUyxDQUFDRyxXQUFXLEVBQUU7UUFDaEVDLElBQUksRUFBRUw7TUFDUixDQUFFLENBQUMsRUFDSEMsU0FBUztJQUViLENBQUUsQ0FBQyxFQUFFO01BQ0hLLHNCQUFzQixFQUFFLENBQUM7TUFDekJDLHVCQUF1QixFQUFFO0lBQzNCLENBQUUsQ0FBQztFQUNMO0FBQ0YsQ0FBQztBQUVEWCxRQUFRLENBQUNZLFFBQVEsQ0FBRSxlQUFlLEVBQUVYLGFBQWMsQ0FBQztBQUVuRCxlQUFlQSxhQUFhIn0=