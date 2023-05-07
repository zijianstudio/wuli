// Copyright 2020-2022, University of Colorado Boulder

/**
 * BunnySpriteImage is a specialization of OrganismSpriteImage for bunnies that adds hit testing.
 * Hit testing based on pixels in the associated image, instead of the image bounds, makes it easier
 * to select a specific bunny in a large group.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import naturalSelection from '../../../naturalSelection.js';
import OrganismSpriteImage from './OrganismSpriteImage.js';
export default class BunnySpriteImage extends OrganismSpriteImage {
  constructor(image) {
    super(image, {
      pickable: true,
      hitTestPixels: true
    });
  }
}
naturalSelection.register('BunnySpriteImage', BunnySpriteImage);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJuYXR1cmFsU2VsZWN0aW9uIiwiT3JnYW5pc21TcHJpdGVJbWFnZSIsIkJ1bm55U3ByaXRlSW1hZ2UiLCJjb25zdHJ1Y3RvciIsImltYWdlIiwicGlja2FibGUiLCJoaXRUZXN0UGl4ZWxzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCdW5ueVNwcml0ZUltYWdlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJ1bm55U3ByaXRlSW1hZ2UgaXMgYSBzcGVjaWFsaXphdGlvbiBvZiBPcmdhbmlzbVNwcml0ZUltYWdlIGZvciBidW5uaWVzIHRoYXQgYWRkcyBoaXQgdGVzdGluZy5cclxuICogSGl0IHRlc3RpbmcgYmFzZWQgb24gcGl4ZWxzIGluIHRoZSBhc3NvY2lhdGVkIGltYWdlLCBpbnN0ZWFkIG9mIHRoZSBpbWFnZSBib3VuZHMsIG1ha2VzIGl0IGVhc2llclxyXG4gKiB0byBzZWxlY3QgYSBzcGVjaWZpYyBidW5ueSBpbiBhIGxhcmdlIGdyb3VwLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBuYXR1cmFsU2VsZWN0aW9uIGZyb20gJy4uLy4uLy4uL25hdHVyYWxTZWxlY3Rpb24uanMnO1xyXG5pbXBvcnQgT3JnYW5pc21TcHJpdGVJbWFnZSBmcm9tICcuL09yZ2FuaXNtU3ByaXRlSW1hZ2UuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnVubnlTcHJpdGVJbWFnZSBleHRlbmRzIE9yZ2FuaXNtU3ByaXRlSW1hZ2Uge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGltYWdlOiBIVE1MSW1hZ2VFbGVtZW50ICkge1xyXG4gICAgc3VwZXIoIGltYWdlLCB7XHJcbiAgICAgIHBpY2thYmxlOiB0cnVlLFxyXG4gICAgICBoaXRUZXN0UGl4ZWxzOiB0cnVlXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5uYXR1cmFsU2VsZWN0aW9uLnJlZ2lzdGVyKCAnQnVubnlTcHJpdGVJbWFnZScsIEJ1bm55U3ByaXRlSW1hZ2UgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGdCQUFnQixNQUFNLDhCQUE4QjtBQUMzRCxPQUFPQyxtQkFBbUIsTUFBTSwwQkFBMEI7QUFFMUQsZUFBZSxNQUFNQyxnQkFBZ0IsU0FBU0QsbUJBQW1CLENBQUM7RUFFekRFLFdBQVdBLENBQUVDLEtBQXVCLEVBQUc7SUFDNUMsS0FBSyxDQUFFQSxLQUFLLEVBQUU7TUFDWkMsUUFBUSxFQUFFLElBQUk7TUFDZEMsYUFBYSxFQUFFO0lBQ2pCLENBQUUsQ0FBQztFQUNMO0FBQ0Y7QUFFQU4sZ0JBQWdCLENBQUNPLFFBQVEsQ0FBRSxrQkFBa0IsRUFBRUwsZ0JBQWlCLENBQUMifQ==