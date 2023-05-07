// Copyright 2014-2021, University of Colorado Boulder

/**
 * Photon beam for RGB screen
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { CanvasNode } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import colorVision from '../../colorVision.js';

// If this is set to true, it will show a rectangle around the beam.
// This is useful for getting the placement of the beam correct relative to the
// flashlight image.
const debug = false;
class RGBPhotonBeamNode extends CanvasNode {
  /**
   * @param {PhotonBeam} photonBeam
   * @param {Tandem} tandem
   * @param {Object} [options] (must contain a field canvasBounds to indicate the bounds of the beam)
   */
  constructor(photonBeam, tandem, options) {
    // Export for the sole purpose of having phet-io call invalidatePaint() after load complete
    options.tandem = tandem;
    super(options);

    // @private
    this.beamBounds = options.canvasBounds;
    this.photons = photonBeam.photons;
    this.color = photonBeam.color;
    this.invalidatePaint();

    // TODO: alternatively, use the pattern in TrackNode?
    // In the state wrapper, when the state changes, we must update the skater node
    Tandem.PHET_IO_ENABLED && phet.phetio.phetioEngine.phetioStateEngine.stateSetEmitter.addListener(() => {
      this.invalidatePaint();
    });
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @private
   */
  paintCanvas(context) {
    //If the debug flag is enabled, it will show the bounds of the canvas
    if (debug) {
      context.fillStyle = 'rgba(50,50,50,0.5)';
      context.fillRect(0, 0, this.beamBounds.maxX, this.beamBounds.maxY);
    }
    context.fillStyle = this.color;
    for (let i = 0; i < this.photons.length; i++) {
      // don't draw photons with intensity 0, since these are just used for ensuring the perceived color is black
      if (this.photons[i].intensity !== 0) {
        context.fillRect(this.photons[i].position.x, this.photons[i].position.y, 3, 2);
      }
    }
  }

  // @public
  step(dt) {
    this.invalidatePaint();
  }
}
colorVision.register('RGBPhotonBeamNode', RGBPhotonBeamNode);
export default RGBPhotonBeamNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDYW52YXNOb2RlIiwiVGFuZGVtIiwiY29sb3JWaXNpb24iLCJkZWJ1ZyIsIlJHQlBob3RvbkJlYW1Ob2RlIiwiY29uc3RydWN0b3IiLCJwaG90b25CZWFtIiwidGFuZGVtIiwib3B0aW9ucyIsImJlYW1Cb3VuZHMiLCJjYW52YXNCb3VuZHMiLCJwaG90b25zIiwiY29sb3IiLCJpbnZhbGlkYXRlUGFpbnQiLCJQSEVUX0lPX0VOQUJMRUQiLCJwaGV0IiwicGhldGlvIiwicGhldGlvRW5naW5lIiwicGhldGlvU3RhdGVFbmdpbmUiLCJzdGF0ZVNldEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInBhaW50Q2FudmFzIiwiY29udGV4dCIsImZpbGxTdHlsZSIsImZpbGxSZWN0IiwibWF4WCIsIm1heFkiLCJpIiwibGVuZ3RoIiwiaW50ZW5zaXR5IiwicG9zaXRpb24iLCJ4IiwieSIsInN0ZXAiLCJkdCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUkdCUGhvdG9uQmVhbU5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUGhvdG9uIGJlYW0gZm9yIFJHQiBzY3JlZW5cclxuICpcclxuICogQGF1dGhvciBBYXJvbiBEYXZpcyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgeyBDYW52YXNOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IGNvbG9yVmlzaW9uIGZyb20gJy4uLy4uL2NvbG9yVmlzaW9uLmpzJztcclxuXHJcbi8vIElmIHRoaXMgaXMgc2V0IHRvIHRydWUsIGl0IHdpbGwgc2hvdyBhIHJlY3RhbmdsZSBhcm91bmQgdGhlIGJlYW0uXHJcbi8vIFRoaXMgaXMgdXNlZnVsIGZvciBnZXR0aW5nIHRoZSBwbGFjZW1lbnQgb2YgdGhlIGJlYW0gY29ycmVjdCByZWxhdGl2ZSB0byB0aGVcclxuLy8gZmxhc2hsaWdodCBpbWFnZS5cclxuY29uc3QgZGVidWcgPSBmYWxzZTtcclxuXHJcbmNsYXNzIFJHQlBob3RvbkJlYW1Ob2RlIGV4dGVuZHMgQ2FudmFzTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UGhvdG9uQmVhbX0gcGhvdG9uQmVhbVxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIChtdXN0IGNvbnRhaW4gYSBmaWVsZCBjYW52YXNCb3VuZHMgdG8gaW5kaWNhdGUgdGhlIGJvdW5kcyBvZiB0aGUgYmVhbSlcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcGhvdG9uQmVhbSwgdGFuZGVtLCBvcHRpb25zICkge1xyXG5cclxuICAgIC8vIEV4cG9ydCBmb3IgdGhlIHNvbGUgcHVycG9zZSBvZiBoYXZpbmcgcGhldC1pbyBjYWxsIGludmFsaWRhdGVQYWludCgpIGFmdGVyIGxvYWQgY29tcGxldGVcclxuICAgIG9wdGlvbnMudGFuZGVtID0gdGFuZGVtO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuYmVhbUJvdW5kcyA9IG9wdGlvbnMuY2FudmFzQm91bmRzO1xyXG4gICAgdGhpcy5waG90b25zID0gcGhvdG9uQmVhbS5waG90b25zO1xyXG4gICAgdGhpcy5jb2xvciA9IHBob3RvbkJlYW0uY29sb3I7XHJcblxyXG4gICAgdGhpcy5pbnZhbGlkYXRlUGFpbnQoKTtcclxuXHJcbiAgICAvLyBUT0RPOiBhbHRlcm5hdGl2ZWx5LCB1c2UgdGhlIHBhdHRlcm4gaW4gVHJhY2tOb2RlP1xyXG4gICAgLy8gSW4gdGhlIHN0YXRlIHdyYXBwZXIsIHdoZW4gdGhlIHN0YXRlIGNoYW5nZXMsIHdlIG11c3QgdXBkYXRlIHRoZSBza2F0ZXIgbm9kZVxyXG4gICAgVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCAmJiBwaGV0LnBoZXRpby5waGV0aW9FbmdpbmUucGhldGlvU3RhdGVFbmdpbmUuc3RhdGVTZXRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZVBhaW50KCk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGNvbnRleHRcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHBhaW50Q2FudmFzKCBjb250ZXh0ICkge1xyXG5cclxuICAgIC8vSWYgdGhlIGRlYnVnIGZsYWcgaXMgZW5hYmxlZCwgaXQgd2lsbCBzaG93IHRoZSBib3VuZHMgb2YgdGhlIGNhbnZhc1xyXG4gICAgaWYgKCBkZWJ1ZyApIHtcclxuICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAncmdiYSg1MCw1MCw1MCwwLjUpJztcclxuICAgICAgY29udGV4dC5maWxsUmVjdCggMCwgMCwgdGhpcy5iZWFtQm91bmRzLm1heFgsIHRoaXMuYmVhbUJvdW5kcy5tYXhZICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5waG90b25zLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAvLyBkb24ndCBkcmF3IHBob3RvbnMgd2l0aCBpbnRlbnNpdHkgMCwgc2luY2UgdGhlc2UgYXJlIGp1c3QgdXNlZCBmb3IgZW5zdXJpbmcgdGhlIHBlcmNlaXZlZCBjb2xvciBpcyBibGFja1xyXG4gICAgICBpZiAoIHRoaXMucGhvdG9uc1sgaSBdLmludGVuc2l0eSAhPT0gMCApIHtcclxuICAgICAgICBjb250ZXh0LmZpbGxSZWN0KCB0aGlzLnBob3RvbnNbIGkgXS5wb3NpdGlvbi54LCB0aGlzLnBob3RvbnNbIGkgXS5wb3NpdGlvbi55LCAzLCAyICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBzdGVwKCBkdCApIHtcclxuICAgIHRoaXMuaW52YWxpZGF0ZVBhaW50KCk7XHJcbiAgfVxyXG59XHJcblxyXG5jb2xvclZpc2lvbi5yZWdpc3RlciggJ1JHQlBob3RvbkJlYW1Ob2RlJywgUkdCUGhvdG9uQmVhbU5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFJHQlBob3RvbkJlYW1Ob2RlO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxVQUFVLFFBQVEsbUNBQW1DO0FBQzlELE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjs7QUFFOUM7QUFDQTtBQUNBO0FBQ0EsTUFBTUMsS0FBSyxHQUFHLEtBQUs7QUFFbkIsTUFBTUMsaUJBQWlCLFNBQVNKLFVBQVUsQ0FBQztFQUV6QztBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VLLFdBQVdBLENBQUVDLFVBQVUsRUFBRUMsTUFBTSxFQUFFQyxPQUFPLEVBQUc7SUFFekM7SUFDQUEsT0FBTyxDQUFDRCxNQUFNLEdBQUdBLE1BQU07SUFFdkIsS0FBSyxDQUFFQyxPQUFRLENBQUM7O0lBRWhCO0lBQ0EsSUFBSSxDQUFDQyxVQUFVLEdBQUdELE9BQU8sQ0FBQ0UsWUFBWTtJQUN0QyxJQUFJLENBQUNDLE9BQU8sR0FBR0wsVUFBVSxDQUFDSyxPQUFPO0lBQ2pDLElBQUksQ0FBQ0MsS0FBSyxHQUFHTixVQUFVLENBQUNNLEtBQUs7SUFFN0IsSUFBSSxDQUFDQyxlQUFlLENBQUMsQ0FBQzs7SUFFdEI7SUFDQTtJQUNBWixNQUFNLENBQUNhLGVBQWUsSUFBSUMsSUFBSSxDQUFDQyxNQUFNLENBQUNDLFlBQVksQ0FBQ0MsaUJBQWlCLENBQUNDLGVBQWUsQ0FBQ0MsV0FBVyxDQUFFLE1BQU07TUFDdEcsSUFBSSxDQUFDUCxlQUFlLENBQUMsQ0FBQztJQUN4QixDQUFFLENBQUM7RUFDTDs7RUFHQTtBQUNGO0FBQ0E7QUFDQTtFQUNFUSxXQUFXQSxDQUFFQyxPQUFPLEVBQUc7SUFFckI7SUFDQSxJQUFLbkIsS0FBSyxFQUFHO01BQ1htQixPQUFPLENBQUNDLFNBQVMsR0FBRyxvQkFBb0I7TUFDeENELE9BQU8sQ0FBQ0UsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDZixVQUFVLENBQUNnQixJQUFJLEVBQUUsSUFBSSxDQUFDaEIsVUFBVSxDQUFDaUIsSUFBSyxDQUFDO0lBQ3RFO0lBRUFKLE9BQU8sQ0FBQ0MsU0FBUyxHQUFHLElBQUksQ0FBQ1gsS0FBSztJQUM5QixLQUFNLElBQUllLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNoQixPQUFPLENBQUNpQixNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFHO01BQzlDO01BQ0EsSUFBSyxJQUFJLENBQUNoQixPQUFPLENBQUVnQixDQUFDLENBQUUsQ0FBQ0UsU0FBUyxLQUFLLENBQUMsRUFBRztRQUN2Q1AsT0FBTyxDQUFDRSxRQUFRLENBQUUsSUFBSSxDQUFDYixPQUFPLENBQUVnQixDQUFDLENBQUUsQ0FBQ0csUUFBUSxDQUFDQyxDQUFDLEVBQUUsSUFBSSxDQUFDcEIsT0FBTyxDQUFFZ0IsQ0FBQyxDQUFFLENBQUNHLFFBQVEsQ0FBQ0UsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7TUFDdEY7SUFDRjtFQUNGOztFQUVBO0VBQ0FDLElBQUlBLENBQUVDLEVBQUUsRUFBRztJQUNULElBQUksQ0FBQ3JCLGVBQWUsQ0FBQyxDQUFDO0VBQ3hCO0FBQ0Y7QUFFQVgsV0FBVyxDQUFDaUMsUUFBUSxDQUFFLG1CQUFtQixFQUFFL0IsaUJBQWtCLENBQUM7QUFFOUQsZUFBZUEsaUJBQWlCIn0=