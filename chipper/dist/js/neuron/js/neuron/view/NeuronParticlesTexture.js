// Copyright 2014-2021, University of Colorado Boulder

/**
 * creates particles on a canvas that can used for rendering as a texture using WebGL
 *
 * @author Sharfudeen Ashraf (for Ghent University)
 * @author John Blanco
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Color } from '../../../../scenery/js/imports.js';
import neuron from '../../neuron.js';
import NeuronConstants from '../common/NeuronConstants.js';
import ParticleType from '../model/ParticleType.js';

// constants
const CANVAS_LENGTH = 128; // width and height of the canvas, must be a power of 2 so that mipmapping can be used
const MARGIN = CANVAS_LENGTH * 0.1; // space around the particles
const STROKE_WIDTH = CANVAS_LENGTH / 32;
const PRINT_DATA_URL_OF_SPRITE_SHEET = false; // very useful for debugging issues with the sprite sheet texture

class NeuronParticlesTexture {
  /**
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor(modelViewTransform) {
    this.modelViewTransform = modelViewTransform; // @private

    // create the canvas upon which the particle images will be drawn
    this.canvas = document.createElement('canvas');
    this.canvas.width = CANVAS_LENGTH;
    this.canvas.height = CANVAS_LENGTH;
    this.canvasContext = this.canvas.getContext('2d');

    // create the particle images on the canvas
    this.createParticleImages(this.canvasContext);

    // for debugging
    if (PRINT_DATA_URL_OF_SPRITE_SHEET) {
      console.log(`this.canvas..toDataURL() = ${this.canvas.toDataURL()}`);
    }
  }

  /**
   * Draw the particles on the provided canvas.
   * @param {Canvas.context} context
   * @private
   */
  createParticleImages(context) {
    // clear the canvas
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // initialize some of the attributes that are shared by all particles
    context.strokeStyle = Color.BLACK.getCanvasStyle();
    context.lineWidth = STROKE_WIDTH;
    context.lineJoin = 'round';
    let particlePos;

    // create the image for sodium ions
    const sodiumParticleRadius = (CANVAS_LENGTH / 2 - 2 * MARGIN) / 2;
    context.fillStyle = NeuronConstants.SODIUM_COLOR.getCanvasStyle();
    context.beginPath();
    particlePos = this.getTilePosition(ParticleType.SODIUM_ION, particlePos);
    context.arc(particlePos.x, particlePos.y, sodiumParticleRadius, 0, 2 * Math.PI, false);
    context.fill();
    context.stroke();

    // create the image for potassium ions
    const potassiumParticleWidth = CANVAS_LENGTH / 2 - 2 * MARGIN;
    particlePos = this.getTilePosition(ParticleType.POTASSIUM_ION, particlePos);
    const x = particlePos.x;
    const y = particlePos.y;
    context.fillStyle = NeuronConstants.POTASSIUM_COLOR.getCanvasStyle();
    context.beginPath();
    context.moveTo(x - potassiumParticleWidth / 2, y);
    context.lineTo(x, y - potassiumParticleWidth / 2);
    context.lineTo(x + potassiumParticleWidth / 2, y);
    context.lineTo(x, y + potassiumParticleWidth / 2);
    context.closePath();
    context.fill();
    context.stroke();
  }

  /**
   * calculates the center position of the tile for the given type
   * @param {ParticleType} particleType
   * @private
   */
  getTilePosition(particleType) {
    // allocate a vector if none was provided
    const posVector = new Vector2(CANVAS_LENGTH / 4, CANVAS_LENGTH / 4);
    if (particleType === ParticleType.POTASSIUM_ION) {
      //The Potassium Tiles are arranged after Sodium
      posVector.y = posVector.y + CANVAS_LENGTH / 2;
    }
    return posVector;
  }

  /**
   * get the tile's normalized texture coordinates
   * @param {ParticleType} particleType
   * @returns {Bounds2}
   * @public
   */
  getTexCoords(particleType) {
    const coords = new Bounds2(0, 0, 0, 0);
    const tileCenterPosition = this.getTilePosition(particleType);
    const tileRadius = CANVAS_LENGTH / 4;

    // Set the normalized bounds within the texture for the requested particle type.
    coords.setMinX((tileCenterPosition.x - tileRadius) / this.canvas.width);
    coords.setMinY((tileCenterPosition.y - tileRadius) / this.canvas.height);
    coords.setMaxX((tileCenterPosition.x + tileRadius) / this.canvas.width);
    coords.setMaxY((tileCenterPosition.y + tileRadius) / this.canvas.height);
    return coords;
  }
}
neuron.register('NeuronParticlesTexture', NeuronParticlesTexture);
export default NeuronParticlesTexture;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVmVjdG9yMiIsIkNvbG9yIiwibmV1cm9uIiwiTmV1cm9uQ29uc3RhbnRzIiwiUGFydGljbGVUeXBlIiwiQ0FOVkFTX0xFTkdUSCIsIk1BUkdJTiIsIlNUUk9LRV9XSURUSCIsIlBSSU5UX0RBVEFfVVJMX09GX1NQUklURV9TSEVFVCIsIk5ldXJvblBhcnRpY2xlc1RleHR1cmUiLCJjb25zdHJ1Y3RvciIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImNhbnZhcyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsIndpZHRoIiwiaGVpZ2h0IiwiY2FudmFzQ29udGV4dCIsImdldENvbnRleHQiLCJjcmVhdGVQYXJ0aWNsZUltYWdlcyIsImNvbnNvbGUiLCJsb2ciLCJ0b0RhdGFVUkwiLCJjb250ZXh0IiwiY2xlYXJSZWN0Iiwic3Ryb2tlU3R5bGUiLCJCTEFDSyIsImdldENhbnZhc1N0eWxlIiwibGluZVdpZHRoIiwibGluZUpvaW4iLCJwYXJ0aWNsZVBvcyIsInNvZGl1bVBhcnRpY2xlUmFkaXVzIiwiZmlsbFN0eWxlIiwiU09ESVVNX0NPTE9SIiwiYmVnaW5QYXRoIiwiZ2V0VGlsZVBvc2l0aW9uIiwiU09ESVVNX0lPTiIsImFyYyIsIngiLCJ5IiwiTWF0aCIsIlBJIiwiZmlsbCIsInN0cm9rZSIsInBvdGFzc2l1bVBhcnRpY2xlV2lkdGgiLCJQT1RBU1NJVU1fSU9OIiwiUE9UQVNTSVVNX0NPTE9SIiwibW92ZVRvIiwibGluZVRvIiwiY2xvc2VQYXRoIiwicGFydGljbGVUeXBlIiwicG9zVmVjdG9yIiwiZ2V0VGV4Q29vcmRzIiwiY29vcmRzIiwidGlsZUNlbnRlclBvc2l0aW9uIiwidGlsZVJhZGl1cyIsInNldE1pblgiLCJzZXRNaW5ZIiwic2V0TWF4WCIsInNldE1heFkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk5ldXJvblBhcnRpY2xlc1RleHR1cmUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogY3JlYXRlcyBwYXJ0aWNsZXMgb24gYSBjYW52YXMgdGhhdCBjYW4gdXNlZCBmb3IgcmVuZGVyaW5nIGFzIGEgdGV4dHVyZSB1c2luZyBXZWJHTFxyXG4gKlxyXG4gKiBAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmIChmb3IgR2hlbnQgVW5pdmVyc2l0eSlcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBuZXVyb24gZnJvbSAnLi4vLi4vbmV1cm9uLmpzJztcclxuaW1wb3J0IE5ldXJvbkNvbnN0YW50cyBmcm9tICcuLi9jb21tb24vTmV1cm9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFBhcnRpY2xlVHlwZSBmcm9tICcuLi9tb2RlbC9QYXJ0aWNsZVR5cGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IENBTlZBU19MRU5HVEggPSAxMjg7IC8vIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIGNhbnZhcywgbXVzdCBiZSBhIHBvd2VyIG9mIDIgc28gdGhhdCBtaXBtYXBwaW5nIGNhbiBiZSB1c2VkXHJcbmNvbnN0IE1BUkdJTiA9IENBTlZBU19MRU5HVEggKiAwLjE7IC8vIHNwYWNlIGFyb3VuZCB0aGUgcGFydGljbGVzXHJcbmNvbnN0IFNUUk9LRV9XSURUSCA9IENBTlZBU19MRU5HVEggLyAzMjtcclxuY29uc3QgUFJJTlRfREFUQV9VUkxfT0ZfU1BSSVRFX1NIRUVUID0gZmFsc2U7IC8vIHZlcnkgdXNlZnVsIGZvciBkZWJ1Z2dpbmcgaXNzdWVzIHdpdGggdGhlIHNwcml0ZSBzaGVldCB0ZXh0dXJlXHJcblxyXG5jbGFzcyBOZXVyb25QYXJ0aWNsZXNUZXh0dXJlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWxWaWV3VHJhbnNmb3JtICkge1xyXG4gICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0gPSBtb2RlbFZpZXdUcmFuc2Zvcm07IC8vIEBwcml2YXRlXHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSBjYW52YXMgdXBvbiB3aGljaCB0aGUgcGFydGljbGUgaW1hZ2VzIHdpbGwgYmUgZHJhd25cclxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICAgIHRoaXMuY2FudmFzLndpZHRoID0gQ0FOVkFTX0xFTkdUSDtcclxuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IENBTlZBU19MRU5HVEg7XHJcbiAgICB0aGlzLmNhbnZhc0NvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSBwYXJ0aWNsZSBpbWFnZXMgb24gdGhlIGNhbnZhc1xyXG4gICAgdGhpcy5jcmVhdGVQYXJ0aWNsZUltYWdlcyggdGhpcy5jYW52YXNDb250ZXh0ICk7XHJcblxyXG4gICAgLy8gZm9yIGRlYnVnZ2luZ1xyXG4gICAgaWYgKCBQUklOVF9EQVRBX1VSTF9PRl9TUFJJVEVfU0hFRVQgKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCBgdGhpcy5jYW52YXMuLnRvRGF0YVVSTCgpID0gJHt0aGlzLmNhbnZhcy50b0RhdGFVUkwoKX1gICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEcmF3IHRoZSBwYXJ0aWNsZXMgb24gdGhlIHByb3ZpZGVkIGNhbnZhcy5cclxuICAgKiBAcGFyYW0ge0NhbnZhcy5jb250ZXh0fSBjb250ZXh0XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBjcmVhdGVQYXJ0aWNsZUltYWdlcyggY29udGV4dCApIHtcclxuXHJcbiAgICAvLyBjbGVhciB0aGUgY2FudmFzXHJcbiAgICB0aGlzLmNhbnZhc0NvbnRleHQuY2xlYXJSZWN0KCAwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0ICk7XHJcblxyXG4gICAgLy8gaW5pdGlhbGl6ZSBzb21lIG9mIHRoZSBhdHRyaWJ1dGVzIHRoYXQgYXJlIHNoYXJlZCBieSBhbGwgcGFydGljbGVzXHJcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gQ29sb3IuQkxBQ0suZ2V0Q2FudmFzU3R5bGUoKTtcclxuICAgIGNvbnRleHQubGluZVdpZHRoID0gU1RST0tFX1dJRFRIO1xyXG4gICAgY29udGV4dC5saW5lSm9pbiA9ICdyb3VuZCc7XHJcblxyXG4gICAgbGV0IHBhcnRpY2xlUG9zO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgaW1hZ2UgZm9yIHNvZGl1bSBpb25zXHJcbiAgICBjb25zdCBzb2RpdW1QYXJ0aWNsZVJhZGl1cyA9ICggQ0FOVkFTX0xFTkdUSCAvIDIgLSAyICogTUFSR0lOICkgLyAyO1xyXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBOZXVyb25Db25zdGFudHMuU09ESVVNX0NPTE9SLmdldENhbnZhc1N0eWxlKCk7XHJcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgcGFydGljbGVQb3MgPSB0aGlzLmdldFRpbGVQb3NpdGlvbiggUGFydGljbGVUeXBlLlNPRElVTV9JT04sIHBhcnRpY2xlUG9zICk7XHJcbiAgICBjb250ZXh0LmFyYyggcGFydGljbGVQb3MueCwgcGFydGljbGVQb3MueSwgc29kaXVtUGFydGljbGVSYWRpdXMsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSApO1xyXG4gICAgY29udGV4dC5maWxsKCk7XHJcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgaW1hZ2UgZm9yIHBvdGFzc2l1bSBpb25zXHJcbiAgICBjb25zdCBwb3Rhc3NpdW1QYXJ0aWNsZVdpZHRoID0gQ0FOVkFTX0xFTkdUSCAvIDIgLSAyICogTUFSR0lOO1xyXG4gICAgcGFydGljbGVQb3MgPSB0aGlzLmdldFRpbGVQb3NpdGlvbiggUGFydGljbGVUeXBlLlBPVEFTU0lVTV9JT04sIHBhcnRpY2xlUG9zICk7XHJcbiAgICBjb25zdCB4ID0gcGFydGljbGVQb3MueDtcclxuICAgIGNvbnN0IHkgPSBwYXJ0aWNsZVBvcy55O1xyXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBOZXVyb25Db25zdGFudHMuUE9UQVNTSVVNX0NPTE9SLmdldENhbnZhc1N0eWxlKCk7XHJcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgY29udGV4dC5tb3ZlVG8oIHggLSBwb3Rhc3NpdW1QYXJ0aWNsZVdpZHRoIC8gMiwgeSApO1xyXG4gICAgY29udGV4dC5saW5lVG8oIHgsIHkgLSBwb3Rhc3NpdW1QYXJ0aWNsZVdpZHRoIC8gMiApO1xyXG4gICAgY29udGV4dC5saW5lVG8oIHggKyBwb3Rhc3NpdW1QYXJ0aWNsZVdpZHRoIC8gMiwgeSApO1xyXG4gICAgY29udGV4dC5saW5lVG8oIHgsIHkgKyBwb3Rhc3NpdW1QYXJ0aWNsZVdpZHRoIC8gMiApO1xyXG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcclxuICAgIGNvbnRleHQuZmlsbCgpO1xyXG4gICAgY29udGV4dC5zdHJva2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGNhbGN1bGF0ZXMgdGhlIGNlbnRlciBwb3NpdGlvbiBvZiB0aGUgdGlsZSBmb3IgdGhlIGdpdmVuIHR5cGVcclxuICAgKiBAcGFyYW0ge1BhcnRpY2xlVHlwZX0gcGFydGljbGVUeXBlXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXRUaWxlUG9zaXRpb24oIHBhcnRpY2xlVHlwZSApIHtcclxuXHJcbiAgICAvLyBhbGxvY2F0ZSBhIHZlY3RvciBpZiBub25lIHdhcyBwcm92aWRlZFxyXG4gICAgY29uc3QgcG9zVmVjdG9yID0gbmV3IFZlY3RvcjIoIENBTlZBU19MRU5HVEggLyA0LCBDQU5WQVNfTEVOR1RIIC8gNCApO1xyXG5cclxuICAgIGlmICggcGFydGljbGVUeXBlID09PSBQYXJ0aWNsZVR5cGUuUE9UQVNTSVVNX0lPTiApIHtcclxuICAgICAgLy9UaGUgUG90YXNzaXVtIFRpbGVzIGFyZSBhcnJhbmdlZCBhZnRlciBTb2RpdW1cclxuICAgICAgcG9zVmVjdG9yLnkgPSBwb3NWZWN0b3IueSArIENBTlZBU19MRU5HVEggLyAyO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwb3NWZWN0b3I7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBnZXQgdGhlIHRpbGUncyBub3JtYWxpemVkIHRleHR1cmUgY29vcmRpbmF0ZXNcclxuICAgKiBAcGFyYW0ge1BhcnRpY2xlVHlwZX0gcGFydGljbGVUeXBlXHJcbiAgICogQHJldHVybnMge0JvdW5kczJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFRleENvb3JkcyggcGFydGljbGVUeXBlICkge1xyXG4gICAgY29uc3QgY29vcmRzID0gbmV3IEJvdW5kczIoIDAsIDAsIDAsIDAgKTtcclxuICAgIGNvbnN0IHRpbGVDZW50ZXJQb3NpdGlvbiA9IHRoaXMuZ2V0VGlsZVBvc2l0aW9uKCBwYXJ0aWNsZVR5cGUgKTtcclxuICAgIGNvbnN0IHRpbGVSYWRpdXMgPSBDQU5WQVNfTEVOR1RIIC8gNDtcclxuXHJcbiAgICAvLyBTZXQgdGhlIG5vcm1hbGl6ZWQgYm91bmRzIHdpdGhpbiB0aGUgdGV4dHVyZSBmb3IgdGhlIHJlcXVlc3RlZCBwYXJ0aWNsZSB0eXBlLlxyXG4gICAgY29vcmRzLnNldE1pblgoICggdGlsZUNlbnRlclBvc2l0aW9uLnggLSB0aWxlUmFkaXVzICkgLyB0aGlzLmNhbnZhcy53aWR0aCApO1xyXG4gICAgY29vcmRzLnNldE1pblkoICggdGlsZUNlbnRlclBvc2l0aW9uLnkgLSB0aWxlUmFkaXVzICkgLyB0aGlzLmNhbnZhcy5oZWlnaHQgKTtcclxuICAgIGNvb3Jkcy5zZXRNYXhYKCAoIHRpbGVDZW50ZXJQb3NpdGlvbi54ICsgdGlsZVJhZGl1cyApIC8gdGhpcy5jYW52YXMud2lkdGggKTtcclxuICAgIGNvb3Jkcy5zZXRNYXhZKCAoIHRpbGVDZW50ZXJQb3NpdGlvbi55ICsgdGlsZVJhZGl1cyApIC8gdGhpcy5jYW52YXMuaGVpZ2h0ICk7XHJcblxyXG4gICAgcmV0dXJuIGNvb3JkcztcclxuICB9XHJcbn1cclxuXHJcbm5ldXJvbi5yZWdpc3RlciggJ05ldXJvblBhcnRpY2xlc1RleHR1cmUnLCBOZXVyb25QYXJ0aWNsZXNUZXh0dXJlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBOZXVyb25QYXJ0aWNsZXNUZXh0dXJlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxTQUFTQyxLQUFLLFFBQVEsbUNBQW1DO0FBQ3pELE9BQU9DLE1BQU0sTUFBTSxpQkFBaUI7QUFDcEMsT0FBT0MsZUFBZSxNQUFNLDhCQUE4QjtBQUMxRCxPQUFPQyxZQUFZLE1BQU0sMEJBQTBCOztBQUVuRDtBQUNBLE1BQU1DLGFBQWEsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUMzQixNQUFNQyxNQUFNLEdBQUdELGFBQWEsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNwQyxNQUFNRSxZQUFZLEdBQUdGLGFBQWEsR0FBRyxFQUFFO0FBQ3ZDLE1BQU1HLDhCQUE4QixHQUFHLEtBQUssQ0FBQyxDQUFDOztBQUU5QyxNQUFNQyxzQkFBc0IsQ0FBQztFQUUzQjtBQUNGO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsa0JBQWtCLEVBQUc7SUFDaEMsSUFBSSxDQUFDQSxrQkFBa0IsR0FBR0Esa0JBQWtCLENBQUMsQ0FBQzs7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