// Copyright 2019-2023, University of Colorado Boulder

/**
 * Encapsulates the main three.js primitives needed for a stage (scene/camera/renderer).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../axon/js/Property.js';
import TinyEmitter from '../../axon/js/TinyEmitter.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Ray3 from '../../dot/js/Ray3.js';
import Vector2 from '../../dot/js/Vector2.js';
import Vector3 from '../../dot/js/Vector3.js';
import optionize from '../../phet-core/js/optionize.js';
import ContextLossFailureDialog from '../../scenery-phet/js/ContextLossFailureDialog.js';
import { Color } from '../../scenery/js/imports.js';
import MobiusQueryParameters from './MobiusQueryParameters.js';
import ThreeUtils from './ThreeUtils.js';
import mobius from './mobius.js';
// hard-coded gamma (assuming the exponential part of the sRGB curve as a simplification)
const GAMMA = 2.2;
const INVERSE_GAMMA = 1 / GAMMA;
export default class ThreeStage {
  // Scale applied to interaction that isn't directly tied to screen coordinates (rotation), updated in layout

  constructor(providedOptions) {
    const options = optionize()({
      backgroundProperty: new Property(Color.BLACK),
      cameraPosition: new Vector3(0, 0, 10)
    }, providedOptions);
    this.activeScale = 1;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.threeScene = new THREE.Scene();

    // will set the projection parameters on layout
    this.threeCamera = new THREE.PerspectiveCamera();

    // near/far clipping planes
    this.threeCamera.near = 1;
    this.threeCamera.far = 100;
    try {
      this.threeRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: phet.chipper.queryParameters.preserveDrawingBuffer
      });
    } catch (e) {
      // For https://github.com/phetsims/density/issues/105, we'll need to generate the full API without WebGL
      console.log(e);
      this.threeRenderer = null;
    }
    this.threeRenderer && this.threeRenderer.setPixelRatio(window.devicePixelRatio || 1);

    // Dialog shown on context loss, constructed lazily because Dialog requires sim bounds during construction
    this.contextLossDialog = null;

    // In the event of a context loss, we'll just show a dialog. See https://github.com/phetsims/molecule-shapes/issues/100
    this.threeRenderer && this.threeRenderer.context.canvas.addEventListener('webglcontextlost', event => {
      this.showContextLossDialog();
    });

    // For https://github.com/phetsims/density/issues/100, we'll also allow context-restore, and will auto-hide the dialog
    this.threeRenderer && this.threeRenderer.context.canvas.addEventListener('webglcontextrestored', event => {
      this.contextLossDialog.hideWithoutReload();
    });
    this.backgroundProperty = options.backgroundProperty;
    this.colorListener = color => {
      this.threeRenderer && this.threeRenderer.setClearColor(color.toNumber(), color.alpha);
    };
    this.backgroundProperty.link(this.colorListener);
    this.threeCamera.position.copy(ThreeUtils.vectorToThree(options.cameraPosition)); // sets the camera's position

    this.dimensionsChangedEmitter = new TinyEmitter();
  }

  /**
   * Returns a Canvas containing the displayed content in this scene.
   */
  renderToCanvas(supersampleMultiplier = 1, backingMultiplier = 1) {
    assert && assert(Number.isInteger(supersampleMultiplier));
    const canvasWidth = Math.ceil(this.canvasWidth * backingMultiplier);
    const canvasHeight = Math.ceil(this.canvasHeight * backingMultiplier);
    const width = canvasWidth * supersampleMultiplier;
    const height = canvasHeight * supersampleMultiplier;
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // We need to still be able to run things without the threeRenderer, fail as gracefully as possible,
    // see https://github.com/phetsims/density/issues/105
    if (this.threeRenderer) {
      // This WebGL workaround is so we can avoid the preserveDrawingBuffer setting that would impact performance.
      // We render to a framebuffer and extract the pixel data directly, since we can't create another renderer and
      // share the view (three.js constraint).

      // set up a framebuffer (target is three.js terminology) to render into
      const target = new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat
      });

      // render our screen content into the framebuffer
      this.render(target);

      // set up a buffer for pixel data, in the exact typed formats we will need
      const buffer = new window.ArrayBuffer(width * height * 4);
      const pixels = new window.Uint8Array(buffer);

      // read the pixel data into the buffer
      const gl = this.threeRenderer.getContext();
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      let imageDataBuffer;
      if (supersampleMultiplier === 1) {
        imageDataBuffer = new window.Uint8ClampedArray(buffer);
      } else {
        imageDataBuffer = new window.Uint8ClampedArray(canvasWidth * canvasHeight * 4);
        const squaredSupersampleInverse = 1 / (supersampleMultiplier * supersampleMultiplier);

        // NOTE: duplication exists here to maintain both optimized code-paths. No if-else inside.
        if (MobiusQueryParameters.mobiusCanvasSkipGamma) {
          for (let x = 0; x < canvasWidth; x++) {
            const xBlock = x * supersampleMultiplier;
            for (let y = 0; y < canvasHeight; y++) {
              const yBlock = y * supersampleMultiplier;
              const outputIndex = (x + y * canvasWidth) * 4;

              // Optimized version of Color.supersampleBlend, inlined
              let premultipliedRed = 0;
              let premultipliedGreen = 0;
              let premultipliedBlue = 0;
              let alpha = 0;
              for (let i = 0; i < supersampleMultiplier; i++) {
                for (let j = 0; j < supersampleMultiplier; j++) {
                  const inputIndex = (xBlock + i + (yBlock + j) * width) * 4;
                  const pixelAlpha = pixels[inputIndex + 3];
                  premultipliedRed += pixels[inputIndex + 0] * pixelAlpha;
                  premultipliedGreen += pixels[inputIndex + 1] * pixelAlpha;
                  premultipliedBlue += pixels[inputIndex + 2] * pixelAlpha;
                  alpha += pixelAlpha;
                }
              }
              if (alpha === 0) {
                imageDataBuffer[outputIndex + 0] = 0;
                imageDataBuffer[outputIndex + 1] = 0;
                imageDataBuffer[outputIndex + 2] = 0;
                imageDataBuffer[outputIndex + 3] = 0;
              } else {
                imageDataBuffer[outputIndex + 0] = Math.floor(premultipliedRed / alpha);
                imageDataBuffer[outputIndex + 1] = Math.floor(premultipliedGreen / alpha);
                imageDataBuffer[outputIndex + 2] = Math.floor(premultipliedBlue / alpha);
                imageDataBuffer[outputIndex + 3] = Math.floor(alpha * squaredSupersampleInverse);
              }
            }
          }
        } else {
          for (let x = 0; x < canvasWidth; x++) {
            const xBlock = x * supersampleMultiplier;
            for (let y = 0; y < canvasHeight; y++) {
              const yBlock = y * supersampleMultiplier;
              const outputIndex = (x + y * canvasWidth) * 4;

              // Optimized version of Color.supersampleBlend, inlined
              let linearPremultipliedRed = 0;
              let linearPremultipliedGreen = 0;
              let linearPremultipliedBlue = 0;
              let linearAlpha = 0;
              for (let i = 0; i < supersampleMultiplier; i++) {
                for (let j = 0; j < supersampleMultiplier; j++) {
                  const inputIndex = (xBlock + i + (yBlock + j) * width) * 4;
                  const alpha = Math.pow(pixels[inputIndex + 3], GAMMA);
                  linearPremultipliedRed += Math.pow(pixels[inputIndex + 0], GAMMA) * alpha;
                  linearPremultipliedGreen += Math.pow(pixels[inputIndex + 1], GAMMA) * alpha;
                  linearPremultipliedBlue += Math.pow(pixels[inputIndex + 2], GAMMA) * alpha;
                  linearAlpha += alpha;
                }
              }
              if (linearAlpha === 0) {
                imageDataBuffer[outputIndex + 0] = 0;
                imageDataBuffer[outputIndex + 1] = 0;
                imageDataBuffer[outputIndex + 2] = 0;
                imageDataBuffer[outputIndex + 3] = 0;
              } else {
                imageDataBuffer[outputIndex + 0] = Math.floor(Math.pow(linearPremultipliedRed / linearAlpha, INVERSE_GAMMA));
                imageDataBuffer[outputIndex + 1] = Math.floor(Math.pow(linearPremultipliedGreen / linearAlpha, INVERSE_GAMMA));
                imageDataBuffer[outputIndex + 2] = Math.floor(Math.pow(linearPremultipliedBlue / linearAlpha, INVERSE_GAMMA));
                imageDataBuffer[outputIndex + 3] = Math.floor(Math.pow(linearAlpha * squaredSupersampleInverse, INVERSE_GAMMA));
              }
            }
          }
        }
      }

      // fill the canvas with the pixel data
      const context = canvas.getContext('2d');
      const imageData = context.createImageData(canvasWidth, canvasHeight);
      imageData.data.set(imageDataBuffer);
      context.putImageData(imageData, 0, 0);
      target.dispose();
    }
    return canvas;
  }
  showContextLossDialog() {
    if (!this.contextLossDialog) {
      this.contextLossDialog = new ContextLossFailureDialog();
    }
    this.contextLossDialog.show();
  }

  /**
   * Returns a three.js Raycaster meant for ray operations.
   */
  getRaycasterFromScreenPoint(screenPoint) {
    assert && assert(screenPoint && screenPoint.isFinite());

    // normalized device coordinates
    const ndcX = 2 * screenPoint.x / this.canvasWidth - 1;
    const ndcY = 2 * (1 - screenPoint.y / this.canvasHeight) - 1;
    const mousePoint = new THREE.Vector3(ndcX, ndcY, 0);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mousePoint, this.threeCamera);
    return raycaster;
  }

  /**
   * Projects a 3d point in the global coordinate frame to one within the 2d global coordinate frame.
   */
  projectPoint(point) {
    const threePoint = ThreeUtils.vectorToThree(point);
    threePoint.project(this.threeCamera); // global to NDC

    // Potential fix for https://github.com/phetsims/molecule-shapes/issues/145.
    // The THREE.Vector3.project( THREE.Camera ) is giving is nonsense near startup. Longer-term could identify.
    if (!isFinite(threePoint.x)) {
      threePoint.x = 0;
    }
    if (!isFinite(threePoint.y)) {
      threePoint.y = 0;
    }
    return new Vector2((threePoint.x + 1) * this.canvasWidth / 2, (-threePoint.y + 1) * this.canvasHeight / 2);
  }

  /**
   * Given a screen point, returns a 3D ray representing the camera's position and direction that point would be in the
   * 3D scene.
   */
  getRayFromScreenPoint(screenPoint) {
    const threeRay = this.getRaycasterFromScreenPoint(screenPoint).ray;
    return new Ray3(ThreeUtils.threeToVector(threeRay.origin), ThreeUtils.threeToVector(threeRay.direction).normalize());
  }
  setDimensions(width, height) {
    assert && assert(width % 1 === 0);
    assert && assert(height % 1 === 0);
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.threeCamera.updateProjectionMatrix();
    this.threeRenderer && this.threeRenderer.setSize(this.canvasWidth, this.canvasHeight);
    this.dimensionsChangedEmitter.emit();
  }

  /**
   * Adjusts the camera's view offsets so that it displays the camera's main output within the specified cameraBounds.
   * This is a generalization of the isometric FOV computation, as it also supports other combinations such as properly
   * handling pan/zoom. See https://github.com/phetsims/density/issues/50
   */
  adjustViewOffset(cameraBounds) {
    assert && assert(Math.abs(this.threeCamera.aspect - cameraBounds.width / cameraBounds.height) < 1e-5, 'Camera aspect should match cameraBounds');

    // We essentially reverse some of the computation being done by PerspectiveCamera's updateProjectionMatrix(), so
    // that we can do computations within that coordinate frame. The specific code needed to handle this is in
    // https://github.com/mrdoob/three.js/blob/d39d82999f0ac5cdd1b4eb9f4aba3f9626f32ab6/src/cameras/PerspectiveCamera.js#L179-L196

    // What we essentially want to do is take our "layout bounds + fov + zoom" combination to determine what the bounds
    // of this ends up being in the projection frustum's near plane.
    // https://stackoverflow.com/questions/58615238/opengl-perspective-projection-how-to-define-left-and-right is
    // supremely helpful to visualize this. Then we'd want to adjust the bounds in the near plane with a linear
    // relationship. In the normal global coordinate space, we have "cameraBounds" => (0,0,canvasWidth,canvasHeight).
    // The center of cameraBounds gets mapped to (0,0) in the near plane (since it's where the camera is pointing),
    // and cameraBounds maps to a centered rectangle determined by (-halfWidth,-halfHeight,halfWidth,halfHeight).
    // We then want to map our actual canvas (0,0,canvasWidth,canvasHeight) into the near plane, and THEN we compute
    // what threeCamera.setViewOffset call will adjust the near plane coordinates to what we need (since there isn't
    // a more direct way).
    // Additionally, note that the "top" is positive in the near-plane coordinate frame, whereas it's negative in
    // Scenery/global coordinates.

    // Get the basic half width/height of the projection on the near-clip plane. We'll be adjusting in this coordinate
    // frame below. These determine the original rectangle of our ideal camera's space in the near-plane coordinates.
    const halfHeight = this.threeCamera.near * Math.tan(Math.PI / 360 * this.threeCamera.fov) / this.threeCamera.zoom;
    const halfWidth = this.threeCamera.aspect * halfHeight;

    // Our Canvas's bounds, adjusted so that the origin is the cameraBounds center.
    const implicitBounds = new Bounds2(0, 0, this.canvasWidth, this.canvasHeight).shifted(cameraBounds.center.negated());

    // Derivation for adjusted width/height from PerspectiveCamera projection setup
    // width *= view.width / fullWidth
    // newWidth = 2 * halfWidth * this.canvasWidth / adjustedFullWidth
    // adjustedFullWidth * newWidth = 2 * halfWidth * this.canvasWidth;
    // adjustedFullWidth = 2 * halfWidth * this.canvasWidth / newWidth;
    // newWidth = 2 * halfWidth * this.canvasWidth / cameraBounds.width;
    // adjustedFullWidth = 2 * halfWidth * this.canvasWidth / ( 2 * halfWidth * this.canvasWidth / cameraBounds.width );
    // adjustedFullWidth = cameraBounds.width;
    const adjustedFullWidth = cameraBounds.width;
    const adjustedFullHeight = cameraBounds.height;
    const oldLeft = -halfWidth;
    const oldTop = halfHeight;

    // -0.5 * cameraBounds.width ==> [left] -halfWidth
    const newLeft = implicitBounds.left * halfWidth / (0.5 * cameraBounds.width);

    // -0.5 * cameraBounds.height ==> [top] halfHeight
    const newTop = -implicitBounds.top * halfHeight / (0.5 * cameraBounds.height);

    // Derivation from PerspectiveCamera projection setup
    // left += view.offsetX * width / fullWidth;
    // newLeft = oldLeft + offsetX * ( 2 * halfWidth ) / adjustedFullWidth
    // newLeft - oldLeft = offsetX * ( 2 * halfWidth ) / adjustedFullWidth
    // ( newLeft - oldLeft ) * adjustedFullWidth / ( 2 * halfWidth ) = offsetX
    const offsetX = (newLeft - oldLeft) * adjustedFullWidth / (2 * halfWidth);

    // Derivation from PerspectiveCamera projection setup
    // top -= offsetY * height / adjustedFullHeight;
    // newTop = oldTop - offsetY * ( 2 * halfHeight ) / adjustedFullHeight;
    // offsetY * ( 2 * halfHeight ) / adjustedFullHeight = oldTop - newTop;
    // offsetY = ( oldTop - newTop ) * adjustedFullHeight / ( 2 * halfHeight );
    const offsetY = (oldTop - newTop) * adjustedFullHeight / (2 * halfHeight);
    this.threeCamera.setViewOffset(adjustedFullWidth, adjustedFullHeight, offsetX, offsetY, this.canvasWidth, this.canvasHeight);

    // The setViewOffset call weirdly mucks with with the aspect ratio, so we need to fix it afterward.
    this.threeCamera.aspect = cameraBounds.width / cameraBounds.height;

    // This forces a recomputation, as we've changed the inputs.
    this.threeCamera.updateProjectionMatrix();
  }
  get width() {
    return this.canvasWidth;
  }
  get height() {
    return this.canvasHeight;
  }

  /**
   * Renders the simulation to a specific rendering target
   *
   * @param target - undefined for the default target
   */
  render(target) {
    // render the 3D scene first
    if (this.threeRenderer) {
      this.threeRenderer.setRenderTarget(target || null);
      this.threeRenderer.render(this.threeScene, this.threeCamera);
      this.threeRenderer.autoClear = false;
    }
  }

  /**
   * Releases references.
   */
  dispose() {
    this.threeRenderer && this.threeRenderer.dispose();

    // @ts-expect-error
    this.threeScene.dispose();
    this.backgroundProperty.unlink(this.colorListener);
  }

  /**
   * It's a bit tricky, since if we are vertically-constrained, we don't need to adjust the camera's FOV (since the
   * width of the scene will scale proportionally to the scale we display our contents at). It's only when our view
   * is horizontally-constrained where we have to account for the changed aspect ratio, and adjust the FOV so that
   * the content shows up at a scale of "sy / sx" compared to the normal case. Note that sx === sy is where our
   * layout bounds fit perfectly in the window, so we don't really have a constraint.
   * Most of the complexity here is that threeCamera.fov is in degrees, and our ideal vertically-constrained FOV is
   * 50 (so there's conversion factors in place).
   */
  static computeIsometricFOV(fov, canvasWidth, canvasHeight, layoutWidth, layoutHeight) {
    const sx = canvasWidth / layoutWidth;
    const sy = canvasHeight / layoutHeight;
    return sx > sy ? fov : Math.atan(Math.tan(fov * Math.PI / 360) * sy / sx) * 360 / Math.PI;
  }
}
mobius.register('ThreeStage', ThreeStage);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlRpbnlFbWl0dGVyIiwiQm91bmRzMiIsIlJheTMiLCJWZWN0b3IyIiwiVmVjdG9yMyIsIm9wdGlvbml6ZSIsIkNvbnRleHRMb3NzRmFpbHVyZURpYWxvZyIsIkNvbG9yIiwiTW9iaXVzUXVlcnlQYXJhbWV0ZXJzIiwiVGhyZWVVdGlscyIsIm1vYml1cyIsIkdBTU1BIiwiSU5WRVJTRV9HQU1NQSIsIlRocmVlU3RhZ2UiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJiYWNrZ3JvdW5kUHJvcGVydHkiLCJCTEFDSyIsImNhbWVyYVBvc2l0aW9uIiwiYWN0aXZlU2NhbGUiLCJjYW52YXNXaWR0aCIsImNhbnZhc0hlaWdodCIsInRocmVlU2NlbmUiLCJUSFJFRSIsIlNjZW5lIiwidGhyZWVDYW1lcmEiLCJQZXJzcGVjdGl2ZUNhbWVyYSIsIm5lYXIiLCJmYXIiLCJ0aHJlZVJlbmRlcmVyIiwiV2ViR0xSZW5kZXJlciIsImFudGlhbGlhcyIsImFscGhhIiwicHJlc2VydmVEcmF3aW5nQnVmZmVyIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJlIiwiY29uc29sZSIsImxvZyIsInNldFBpeGVsUmF0aW8iLCJ3aW5kb3ciLCJkZXZpY2VQaXhlbFJhdGlvIiwiY29udGV4dExvc3NEaWFsb2ciLCJjb250ZXh0IiwiY2FudmFzIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50Iiwic2hvd0NvbnRleHRMb3NzRGlhbG9nIiwiaGlkZVdpdGhvdXRSZWxvYWQiLCJjb2xvckxpc3RlbmVyIiwiY29sb3IiLCJzZXRDbGVhckNvbG9yIiwidG9OdW1iZXIiLCJsaW5rIiwicG9zaXRpb24iLCJjb3B5IiwidmVjdG9yVG9UaHJlZSIsImRpbWVuc2lvbnNDaGFuZ2VkRW1pdHRlciIsInJlbmRlclRvQ2FudmFzIiwic3VwZXJzYW1wbGVNdWx0aXBsaWVyIiwiYmFja2luZ011bHRpcGxpZXIiLCJhc3NlcnQiLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJNYXRoIiwiY2VpbCIsIndpZHRoIiwiaGVpZ2h0IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwidGFyZ2V0IiwiV2ViR0xSZW5kZXJUYXJnZXQiLCJtaW5GaWx0ZXIiLCJMaW5lYXJGaWx0ZXIiLCJtYWdGaWx0ZXIiLCJOZWFyZXN0RmlsdGVyIiwiZm9ybWF0IiwiUkdCQUZvcm1hdCIsInJlbmRlciIsImJ1ZmZlciIsIkFycmF5QnVmZmVyIiwicGl4ZWxzIiwiVWludDhBcnJheSIsImdsIiwiZ2V0Q29udGV4dCIsInJlYWRQaXhlbHMiLCJSR0JBIiwiVU5TSUdORURfQllURSIsImltYWdlRGF0YUJ1ZmZlciIsIlVpbnQ4Q2xhbXBlZEFycmF5Iiwic3F1YXJlZFN1cGVyc2FtcGxlSW52ZXJzZSIsIm1vYml1c0NhbnZhc1NraXBHYW1tYSIsIngiLCJ4QmxvY2siLCJ5IiwieUJsb2NrIiwib3V0cHV0SW5kZXgiLCJwcmVtdWx0aXBsaWVkUmVkIiwicHJlbXVsdGlwbGllZEdyZWVuIiwicHJlbXVsdGlwbGllZEJsdWUiLCJpIiwiaiIsImlucHV0SW5kZXgiLCJwaXhlbEFscGhhIiwiZmxvb3IiLCJsaW5lYXJQcmVtdWx0aXBsaWVkUmVkIiwibGluZWFyUHJlbXVsdGlwbGllZEdyZWVuIiwibGluZWFyUHJlbXVsdGlwbGllZEJsdWUiLCJsaW5lYXJBbHBoYSIsInBvdyIsImltYWdlRGF0YSIsImNyZWF0ZUltYWdlRGF0YSIsImRhdGEiLCJzZXQiLCJwdXRJbWFnZURhdGEiLCJkaXNwb3NlIiwic2hvdyIsImdldFJheWNhc3RlckZyb21TY3JlZW5Qb2ludCIsInNjcmVlblBvaW50IiwiaXNGaW5pdGUiLCJuZGNYIiwibmRjWSIsIm1vdXNlUG9pbnQiLCJyYXljYXN0ZXIiLCJSYXljYXN0ZXIiLCJzZXRGcm9tQ2FtZXJhIiwicHJvamVjdFBvaW50IiwicG9pbnQiLCJ0aHJlZVBvaW50IiwicHJvamVjdCIsImdldFJheUZyb21TY3JlZW5Qb2ludCIsInRocmVlUmF5IiwicmF5IiwidGhyZWVUb1ZlY3RvciIsIm9yaWdpbiIsImRpcmVjdGlvbiIsIm5vcm1hbGl6ZSIsInNldERpbWVuc2lvbnMiLCJ1cGRhdGVQcm9qZWN0aW9uTWF0cml4Iiwic2V0U2l6ZSIsImVtaXQiLCJhZGp1c3RWaWV3T2Zmc2V0IiwiY2FtZXJhQm91bmRzIiwiYWJzIiwiYXNwZWN0IiwiaGFsZkhlaWdodCIsInRhbiIsIlBJIiwiZm92Iiwiem9vbSIsImhhbGZXaWR0aCIsImltcGxpY2l0Qm91bmRzIiwic2hpZnRlZCIsImNlbnRlciIsIm5lZ2F0ZWQiLCJhZGp1c3RlZEZ1bGxXaWR0aCIsImFkanVzdGVkRnVsbEhlaWdodCIsIm9sZExlZnQiLCJvbGRUb3AiLCJuZXdMZWZ0IiwibGVmdCIsIm5ld1RvcCIsInRvcCIsIm9mZnNldFgiLCJvZmZzZXRZIiwic2V0Vmlld09mZnNldCIsInNldFJlbmRlclRhcmdldCIsImF1dG9DbGVhciIsInVubGluayIsImNvbXB1dGVJc29tZXRyaWNGT1YiLCJsYXlvdXRXaWR0aCIsImxheW91dEhlaWdodCIsInN4Iiwic3kiLCJhdGFuIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUaHJlZVN0YWdlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEVuY2Fwc3VsYXRlcyB0aGUgbWFpbiB0aHJlZS5qcyBwcmltaXRpdmVzIG5lZWRlZCBmb3IgYSBzdGFnZSAoc2NlbmUvY2FtZXJhL3JlbmRlcmVyKS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRpbnlFbWl0dGVyIGZyb20gJy4uLy4uL2F4b24vanMvVGlueUVtaXR0ZXIuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBSYXkzIGZyb20gJy4uLy4uL2RvdC9qcy9SYXkzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuLi8uLi9kb3QvanMvVmVjdG9yMy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBDb250ZXh0TG9zc0ZhaWx1cmVEaWFsb2cgZnJvbSAnLi4vLi4vc2NlbmVyeS1waGV0L2pzL0NvbnRleHRMb3NzRmFpbHVyZURpYWxvZy5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IE1vYml1c1F1ZXJ5UGFyYW1ldGVycyBmcm9tICcuL01vYml1c1F1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBUaHJlZVV0aWxzIGZyb20gJy4vVGhyZWVVdGlscy5qcyc7XHJcbmltcG9ydCBtb2JpdXMgZnJvbSAnLi9tb2JpdXMuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBURW1pdHRlciBmcm9tICcuLi8uLi9heG9uL2pzL1RFbWl0dGVyLmpzJztcclxuXHJcbi8vIGhhcmQtY29kZWQgZ2FtbWEgKGFzc3VtaW5nIHRoZSBleHBvbmVudGlhbCBwYXJ0IG9mIHRoZSBzUkdCIGN1cnZlIGFzIGEgc2ltcGxpZmljYXRpb24pXHJcbmNvbnN0IEdBTU1BID0gMi4yO1xyXG5jb25zdCBJTlZFUlNFX0dBTU1BID0gMSAvIEdBTU1BO1xyXG5cclxuZXhwb3J0IHR5cGUgVGhyZWVTdGFnZU9wdGlvbnMgPSB7XHJcbiAgYmFja2dyb3VuZFByb3BlcnR5PzogVFJlYWRPbmx5UHJvcGVydHk8Q29sb3I+O1xyXG5cclxuICAvLyBUaGUgaW5pdGlhbCBjYW1lcmEgcG9zaXRpb25cclxuICBjYW1lcmFQb3NpdGlvbj86IFZlY3RvcjM7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaHJlZVN0YWdlIHtcclxuXHJcbiAgLy8gU2NhbGUgYXBwbGllZCB0byBpbnRlcmFjdGlvbiB0aGF0IGlzbid0IGRpcmVjdGx5IHRpZWQgdG8gc2NyZWVuIGNvb3JkaW5hdGVzIChyb3RhdGlvbiksIHVwZGF0ZWQgaW4gbGF5b3V0XHJcbiAgcHVibGljIGFjdGl2ZVNjYWxlOiBudW1iZXI7XHJcblxyXG4gIHB1YmxpYyBjYW52YXNXaWR0aDogbnVtYmVyO1xyXG4gIHB1YmxpYyBjYW52YXNIZWlnaHQ6IG51bWJlcjtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IHRocmVlU2NlbmU6IFRIUkVFLlNjZW5lO1xyXG4gIHB1YmxpYyByZWFkb25seSB0aHJlZUNhbWVyYTogVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmE7XHJcbiAgcHVibGljIHRocmVlUmVuZGVyZXI6IFRIUkVFLldlYkdMUmVuZGVyZXIgfCBudWxsO1xyXG5cclxuICBwcml2YXRlIGNvbnRleHRMb3NzRGlhbG9nOiBDb250ZXh0TG9zc0ZhaWx1cmVEaWFsb2cgfCBudWxsO1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGJhY2tncm91bmRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Q29sb3I+O1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGNvbG9yTGlzdGVuZXI6ICggYzogQ29sb3IgKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgZGltZW5zaW9uc0NoYW5nZWRFbWl0dGVyOiBURW1pdHRlcjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBUaHJlZVN0YWdlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFRocmVlU3RhZ2VPcHRpb25zLCBUaHJlZVN0YWdlT3B0aW9ucz4oKSgge1xyXG4gICAgICBiYWNrZ3JvdW5kUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggQ29sb3IuQkxBQ0sgKSxcclxuICAgICAgY2FtZXJhUG9zaXRpb246IG5ldyBWZWN0b3IzKCAwLCAwLCAxMCApXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmFjdGl2ZVNjYWxlID0gMTtcclxuICAgIHRoaXMuY2FudmFzV2lkdGggPSAwO1xyXG4gICAgdGhpcy5jYW52YXNIZWlnaHQgPSAwO1xyXG4gICAgdGhpcy50aHJlZVNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcblxyXG4gICAgLy8gd2lsbCBzZXQgdGhlIHByb2plY3Rpb24gcGFyYW1ldGVycyBvbiBsYXlvdXRcclxuICAgIHRoaXMudGhyZWVDYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoKTtcclxuXHJcbiAgICAvLyBuZWFyL2ZhciBjbGlwcGluZyBwbGFuZXNcclxuICAgIHRoaXMudGhyZWVDYW1lcmEubmVhciA9IDE7XHJcbiAgICB0aGlzLnRocmVlQ2FtZXJhLmZhciA9IDEwMDtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICB0aGlzLnRocmVlUmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigge1xyXG4gICAgICAgIGFudGlhbGlhczogdHJ1ZSxcclxuICAgICAgICBhbHBoYTogdHJ1ZSxcclxuICAgICAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMucHJlc2VydmVEcmF3aW5nQnVmZmVyXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGNhdGNoKCBlICkge1xyXG4gICAgICAvLyBGb3IgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RlbnNpdHkvaXNzdWVzLzEwNSwgd2UnbGwgbmVlZCB0byBnZW5lcmF0ZSB0aGUgZnVsbCBBUEkgd2l0aG91dCBXZWJHTFxyXG4gICAgICBjb25zb2xlLmxvZyggZSApO1xyXG4gICAgICB0aGlzLnRocmVlUmVuZGVyZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgdGhpcy50aHJlZVJlbmRlcmVyICYmIHRoaXMudGhyZWVSZW5kZXJlci5zZXRQaXhlbFJhdGlvKCB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxICk7XHJcblxyXG4gICAgLy8gRGlhbG9nIHNob3duIG9uIGNvbnRleHQgbG9zcywgY29uc3RydWN0ZWQgbGF6aWx5IGJlY2F1c2UgRGlhbG9nIHJlcXVpcmVzIHNpbSBib3VuZHMgZHVyaW5nIGNvbnN0cnVjdGlvblxyXG4gICAgdGhpcy5jb250ZXh0TG9zc0RpYWxvZyA9IG51bGw7XHJcblxyXG4gICAgLy8gSW4gdGhlIGV2ZW50IG9mIGEgY29udGV4dCBsb3NzLCB3ZSdsbCBqdXN0IHNob3cgYSBkaWFsb2cuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbW9sZWN1bGUtc2hhcGVzL2lzc3Vlcy8xMDBcclxuICAgIHRoaXMudGhyZWVSZW5kZXJlciAmJiB0aGlzLnRocmVlUmVuZGVyZXIuY29udGV4dC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lciggJ3dlYmdsY29udGV4dGxvc3QnLCBldmVudCA9PiB7XHJcbiAgICAgIHRoaXMuc2hvd0NvbnRleHRMb3NzRGlhbG9nKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9kZW5zaXR5L2lzc3Vlcy8xMDAsIHdlJ2xsIGFsc28gYWxsb3cgY29udGV4dC1yZXN0b3JlLCBhbmQgd2lsbCBhdXRvLWhpZGUgdGhlIGRpYWxvZ1xyXG4gICAgdGhpcy50aHJlZVJlbmRlcmVyICYmIHRoaXMudGhyZWVSZW5kZXJlci5jb250ZXh0LmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCAnd2ViZ2xjb250ZXh0cmVzdG9yZWQnLCBldmVudCA9PiB7XHJcbiAgICAgIHRoaXMuY29udGV4dExvc3NEaWFsb2chLmhpZGVXaXRob3V0UmVsb2FkKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5iYWNrZ3JvdW5kUHJvcGVydHkgPSBvcHRpb25zLmJhY2tncm91bmRQcm9wZXJ0eTtcclxuXHJcbiAgICB0aGlzLmNvbG9yTGlzdGVuZXIgPSBjb2xvciA9PiB7XHJcbiAgICAgIHRoaXMudGhyZWVSZW5kZXJlciAmJiB0aGlzLnRocmVlUmVuZGVyZXIuc2V0Q2xlYXJDb2xvciggY29sb3IudG9OdW1iZXIoKSwgY29sb3IuYWxwaGEgKTtcclxuICAgIH07XHJcbiAgICB0aGlzLmJhY2tncm91bmRQcm9wZXJ0eS5saW5rKCB0aGlzLmNvbG9yTGlzdGVuZXIgKTtcclxuXHJcbiAgICB0aGlzLnRocmVlQ2FtZXJhLnBvc2l0aW9uLmNvcHkoIFRocmVlVXRpbHMudmVjdG9yVG9UaHJlZSggb3B0aW9ucy5jYW1lcmFQb3NpdGlvbiApICk7IC8vIHNldHMgdGhlIGNhbWVyYSdzIHBvc2l0aW9uXHJcblxyXG4gICAgdGhpcy5kaW1lbnNpb25zQ2hhbmdlZEVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBDYW52YXMgY29udGFpbmluZyB0aGUgZGlzcGxheWVkIGNvbnRlbnQgaW4gdGhpcyBzY2VuZS5cclxuICAgKi9cclxuICBwdWJsaWMgcmVuZGVyVG9DYW52YXMoIHN1cGVyc2FtcGxlTXVsdGlwbGllciA9IDEsIGJhY2tpbmdNdWx0aXBsaWVyID0gMSApOiBIVE1MQ2FudmFzRWxlbWVudCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBzdXBlcnNhbXBsZU11bHRpcGxpZXIgKSApO1xyXG5cclxuICAgIGNvbnN0IGNhbnZhc1dpZHRoID0gTWF0aC5jZWlsKCB0aGlzLmNhbnZhc1dpZHRoICogYmFja2luZ011bHRpcGxpZXIgKTtcclxuICAgIGNvbnN0IGNhbnZhc0hlaWdodCA9IE1hdGguY2VpbCggdGhpcy5jYW52YXNIZWlnaHQgKiBiYWNraW5nTXVsdGlwbGllciApO1xyXG5cclxuICAgIGNvbnN0IHdpZHRoID0gY2FudmFzV2lkdGggKiBzdXBlcnNhbXBsZU11bHRpcGxpZXI7XHJcbiAgICBjb25zdCBoZWlnaHQgPSBjYW52YXNIZWlnaHQgKiBzdXBlcnNhbXBsZU11bHRpcGxpZXI7XHJcblxyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhc1dpZHRoO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IGNhbnZhc0hlaWdodDtcclxuXHJcbiAgICAvLyBXZSBuZWVkIHRvIHN0aWxsIGJlIGFibGUgdG8gcnVuIHRoaW5ncyB3aXRob3V0IHRoZSB0aHJlZVJlbmRlcmVyLCBmYWlsIGFzIGdyYWNlZnVsbHkgYXMgcG9zc2libGUsXHJcbiAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RlbnNpdHkvaXNzdWVzLzEwNVxyXG4gICAgaWYgKCB0aGlzLnRocmVlUmVuZGVyZXIgKSB7XHJcbiAgICAgIC8vIFRoaXMgV2ViR0wgd29ya2Fyb3VuZCBpcyBzbyB3ZSBjYW4gYXZvaWQgdGhlIHByZXNlcnZlRHJhd2luZ0J1ZmZlciBzZXR0aW5nIHRoYXQgd291bGQgaW1wYWN0IHBlcmZvcm1hbmNlLlxyXG4gICAgICAvLyBXZSByZW5kZXIgdG8gYSBmcmFtZWJ1ZmZlciBhbmQgZXh0cmFjdCB0aGUgcGl4ZWwgZGF0YSBkaXJlY3RseSwgc2luY2Ugd2UgY2FuJ3QgY3JlYXRlIGFub3RoZXIgcmVuZGVyZXIgYW5kXHJcbiAgICAgIC8vIHNoYXJlIHRoZSB2aWV3ICh0aHJlZS5qcyBjb25zdHJhaW50KS5cclxuXHJcbiAgICAgIC8vIHNldCB1cCBhIGZyYW1lYnVmZmVyICh0YXJnZXQgaXMgdGhyZWUuanMgdGVybWlub2xvZ3kpIHRvIHJlbmRlciBpbnRvXHJcbiAgICAgIGNvbnN0IHRhcmdldCA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlclRhcmdldCggd2lkdGgsIGhlaWdodCwge1xyXG4gICAgICAgIG1pbkZpbHRlcjogVEhSRUUuTGluZWFyRmlsdGVyLFxyXG4gICAgICAgIG1hZ0ZpbHRlcjogVEhSRUUuTmVhcmVzdEZpbHRlcixcclxuICAgICAgICBmb3JtYXQ6IFRIUkVFLlJHQkFGb3JtYXRcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gcmVuZGVyIG91ciBzY3JlZW4gY29udGVudCBpbnRvIHRoZSBmcmFtZWJ1ZmZlclxyXG4gICAgICB0aGlzLnJlbmRlciggdGFyZ2V0ICk7XHJcblxyXG4gICAgICAvLyBzZXQgdXAgYSBidWZmZXIgZm9yIHBpeGVsIGRhdGEsIGluIHRoZSBleGFjdCB0eXBlZCBmb3JtYXRzIHdlIHdpbGwgbmVlZFxyXG4gICAgICBjb25zdCBidWZmZXIgPSBuZXcgd2luZG93LkFycmF5QnVmZmVyKCB3aWR0aCAqIGhlaWdodCAqIDQgKTtcclxuICAgICAgY29uc3QgcGl4ZWxzID0gbmV3IHdpbmRvdy5VaW50OEFycmF5KCBidWZmZXIgKTtcclxuXHJcbiAgICAgIC8vIHJlYWQgdGhlIHBpeGVsIGRhdGEgaW50byB0aGUgYnVmZmVyXHJcbiAgICAgIGNvbnN0IGdsID0gdGhpcy50aHJlZVJlbmRlcmVyLmdldENvbnRleHQoKTtcclxuICAgICAgZ2wucmVhZFBpeGVscyggMCwgMCwgd2lkdGgsIGhlaWdodCwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgcGl4ZWxzICk7XHJcblxyXG4gICAgICBsZXQgaW1hZ2VEYXRhQnVmZmVyO1xyXG4gICAgICBpZiAoIHN1cGVyc2FtcGxlTXVsdGlwbGllciA9PT0gMSApIHtcclxuICAgICAgICBpbWFnZURhdGFCdWZmZXIgPSBuZXcgd2luZG93LlVpbnQ4Q2xhbXBlZEFycmF5KCBidWZmZXIgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBpbWFnZURhdGFCdWZmZXIgPSBuZXcgd2luZG93LlVpbnQ4Q2xhbXBlZEFycmF5KCBjYW52YXNXaWR0aCAqIGNhbnZhc0hlaWdodCAqIDQgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc3F1YXJlZFN1cGVyc2FtcGxlSW52ZXJzZSA9IDEgLyAoIHN1cGVyc2FtcGxlTXVsdGlwbGllciAqIHN1cGVyc2FtcGxlTXVsdGlwbGllciApO1xyXG5cclxuICAgICAgICAvLyBOT1RFOiBkdXBsaWNhdGlvbiBleGlzdHMgaGVyZSB0byBtYWludGFpbiBib3RoIG9wdGltaXplZCBjb2RlLXBhdGhzLiBObyBpZi1lbHNlIGluc2lkZS5cclxuICAgICAgICBpZiAoIE1vYml1c1F1ZXJ5UGFyYW1ldGVycy5tb2JpdXNDYW52YXNTa2lwR2FtbWEgKSB7XHJcbiAgICAgICAgICBmb3IgKCBsZXQgeCA9IDA7IHggPCBjYW52YXNXaWR0aDsgeCsrICkge1xyXG4gICAgICAgICAgICBjb25zdCB4QmxvY2sgPSB4ICogc3VwZXJzYW1wbGVNdWx0aXBsaWVyO1xyXG4gICAgICAgICAgICBmb3IgKCBsZXQgeSA9IDA7IHkgPCBjYW52YXNIZWlnaHQ7IHkrKyApIHtcclxuICAgICAgICAgICAgICBjb25zdCB5QmxvY2sgPSB5ICogc3VwZXJzYW1wbGVNdWx0aXBsaWVyO1xyXG4gICAgICAgICAgICAgIGNvbnN0IG91dHB1dEluZGV4ID0gKCB4ICsgeSAqIGNhbnZhc1dpZHRoICkgKiA0O1xyXG5cclxuICAgICAgICAgICAgICAvLyBPcHRpbWl6ZWQgdmVyc2lvbiBvZiBDb2xvci5zdXBlcnNhbXBsZUJsZW5kLCBpbmxpbmVkXHJcbiAgICAgICAgICAgICAgbGV0IHByZW11bHRpcGxpZWRSZWQgPSAwO1xyXG4gICAgICAgICAgICAgIGxldCBwcmVtdWx0aXBsaWVkR3JlZW4gPSAwO1xyXG4gICAgICAgICAgICAgIGxldCBwcmVtdWx0aXBsaWVkQmx1ZSA9IDA7XHJcbiAgICAgICAgICAgICAgbGV0IGFscGhhID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3VwZXJzYW1wbGVNdWx0aXBsaWVyOyBpKysgKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBzdXBlcnNhbXBsZU11bHRpcGxpZXI7IGorKyApIHtcclxuICAgICAgICAgICAgICAgICAgY29uc3QgaW5wdXRJbmRleCA9ICggeEJsb2NrICsgaSArICggeUJsb2NrICsgaiApICogd2lkdGggKSAqIDQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICBjb25zdCBwaXhlbEFscGhhID0gcGl4ZWxzWyBpbnB1dEluZGV4ICsgMyBdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgcHJlbXVsdGlwbGllZFJlZCArPSBwaXhlbHNbIGlucHV0SW5kZXggKyAwIF0gKiBwaXhlbEFscGhhO1xyXG4gICAgICAgICAgICAgICAgICBwcmVtdWx0aXBsaWVkR3JlZW4gKz0gcGl4ZWxzWyBpbnB1dEluZGV4ICsgMSBdICogcGl4ZWxBbHBoYTtcclxuICAgICAgICAgICAgICAgICAgcHJlbXVsdGlwbGllZEJsdWUgKz0gcGl4ZWxzWyBpbnB1dEluZGV4ICsgMiBdICogcGl4ZWxBbHBoYTtcclxuICAgICAgICAgICAgICAgICAgYWxwaGEgKz0gcGl4ZWxBbHBoYTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGlmICggYWxwaGEgPT09IDAgKSB7XHJcbiAgICAgICAgICAgICAgICBpbWFnZURhdGFCdWZmZXJbIG91dHB1dEluZGV4ICsgMCBdID0gMDtcclxuICAgICAgICAgICAgICAgIGltYWdlRGF0YUJ1ZmZlclsgb3V0cHV0SW5kZXggKyAxIF0gPSAwO1xyXG4gICAgICAgICAgICAgICAgaW1hZ2VEYXRhQnVmZmVyWyBvdXRwdXRJbmRleCArIDIgXSA9IDA7XHJcbiAgICAgICAgICAgICAgICBpbWFnZURhdGFCdWZmZXJbIG91dHB1dEluZGV4ICsgMyBdID0gMDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpbWFnZURhdGFCdWZmZXJbIG91dHB1dEluZGV4ICsgMCBdID0gTWF0aC5mbG9vciggcHJlbXVsdGlwbGllZFJlZCAvIGFscGhhICk7XHJcbiAgICAgICAgICAgICAgICBpbWFnZURhdGFCdWZmZXJbIG91dHB1dEluZGV4ICsgMSBdID0gTWF0aC5mbG9vciggcHJlbXVsdGlwbGllZEdyZWVuIC8gYWxwaGEgKTtcclxuICAgICAgICAgICAgICAgIGltYWdlRGF0YUJ1ZmZlclsgb3V0cHV0SW5kZXggKyAyIF0gPSBNYXRoLmZsb29yKCBwcmVtdWx0aXBsaWVkQmx1ZSAvIGFscGhhICk7XHJcbiAgICAgICAgICAgICAgICBpbWFnZURhdGFCdWZmZXJbIG91dHB1dEluZGV4ICsgMyBdID0gTWF0aC5mbG9vciggYWxwaGEgKiBzcXVhcmVkU3VwZXJzYW1wbGVJbnZlcnNlICk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgZm9yICggbGV0IHggPSAwOyB4IDwgY2FudmFzV2lkdGg7IHgrKyApIHtcclxuICAgICAgICAgICAgY29uc3QgeEJsb2NrID0geCAqIHN1cGVyc2FtcGxlTXVsdGlwbGllcjtcclxuICAgICAgICAgICAgZm9yICggbGV0IHkgPSAwOyB5IDwgY2FudmFzSGVpZ2h0OyB5KysgKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgeUJsb2NrID0geSAqIHN1cGVyc2FtcGxlTXVsdGlwbGllcjtcclxuICAgICAgICAgICAgICBjb25zdCBvdXRwdXRJbmRleCA9ICggeCArIHkgKiBjYW52YXNXaWR0aCApICogNDtcclxuXHJcbiAgICAgICAgICAgICAgLy8gT3B0aW1pemVkIHZlcnNpb24gb2YgQ29sb3Iuc3VwZXJzYW1wbGVCbGVuZCwgaW5saW5lZFxyXG4gICAgICAgICAgICAgIGxldCBsaW5lYXJQcmVtdWx0aXBsaWVkUmVkID0gMDtcclxuICAgICAgICAgICAgICBsZXQgbGluZWFyUHJlbXVsdGlwbGllZEdyZWVuID0gMDtcclxuICAgICAgICAgICAgICBsZXQgbGluZWFyUHJlbXVsdGlwbGllZEJsdWUgPSAwO1xyXG4gICAgICAgICAgICAgIGxldCBsaW5lYXJBbHBoYSA9IDA7XHJcblxyXG4gICAgICAgICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN1cGVyc2FtcGxlTXVsdGlwbGllcjsgaSsrICkge1xyXG4gICAgICAgICAgICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgc3VwZXJzYW1wbGVNdWx0aXBsaWVyOyBqKysgKSB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0SW5kZXggPSAoIHhCbG9jayArIGkgKyAoIHlCbG9jayArIGogKSAqIHdpZHRoICkgKiA0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgY29uc3QgYWxwaGEgPSBNYXRoLnBvdyggcGl4ZWxzWyBpbnB1dEluZGV4ICsgMyBdLCBHQU1NQSApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgbGluZWFyUHJlbXVsdGlwbGllZFJlZCArPSBNYXRoLnBvdyggcGl4ZWxzWyBpbnB1dEluZGV4ICsgMCBdLCBHQU1NQSApICogYWxwaGE7XHJcbiAgICAgICAgICAgICAgICAgIGxpbmVhclByZW11bHRpcGxpZWRHcmVlbiArPSBNYXRoLnBvdyggcGl4ZWxzWyBpbnB1dEluZGV4ICsgMSBdLCBHQU1NQSApICogYWxwaGE7XHJcbiAgICAgICAgICAgICAgICAgIGxpbmVhclByZW11bHRpcGxpZWRCbHVlICs9IE1hdGgucG93KCBwaXhlbHNbIGlucHV0SW5kZXggKyAyIF0sIEdBTU1BICkgKiBhbHBoYTtcclxuICAgICAgICAgICAgICAgICAgbGluZWFyQWxwaGEgKz0gYWxwaGE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAoIGxpbmVhckFscGhhID09PSAwICkge1xyXG4gICAgICAgICAgICAgICAgaW1hZ2VEYXRhQnVmZmVyWyBvdXRwdXRJbmRleCArIDAgXSA9IDA7XHJcbiAgICAgICAgICAgICAgICBpbWFnZURhdGFCdWZmZXJbIG91dHB1dEluZGV4ICsgMSBdID0gMDtcclxuICAgICAgICAgICAgICAgIGltYWdlRGF0YUJ1ZmZlclsgb3V0cHV0SW5kZXggKyAyIF0gPSAwO1xyXG4gICAgICAgICAgICAgICAgaW1hZ2VEYXRhQnVmZmVyWyBvdXRwdXRJbmRleCArIDMgXSA9IDA7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaW1hZ2VEYXRhQnVmZmVyWyBvdXRwdXRJbmRleCArIDAgXSA9IE1hdGguZmxvb3IoIE1hdGgucG93KCBsaW5lYXJQcmVtdWx0aXBsaWVkUmVkIC8gbGluZWFyQWxwaGEsIElOVkVSU0VfR0FNTUEgKSApO1xyXG4gICAgICAgICAgICAgICAgaW1hZ2VEYXRhQnVmZmVyWyBvdXRwdXRJbmRleCArIDEgXSA9IE1hdGguZmxvb3IoIE1hdGgucG93KCBsaW5lYXJQcmVtdWx0aXBsaWVkR3JlZW4gLyBsaW5lYXJBbHBoYSwgSU5WRVJTRV9HQU1NQSApICk7XHJcbiAgICAgICAgICAgICAgICBpbWFnZURhdGFCdWZmZXJbIG91dHB1dEluZGV4ICsgMiBdID0gTWF0aC5mbG9vciggTWF0aC5wb3coIGxpbmVhclByZW11bHRpcGxpZWRCbHVlIC8gbGluZWFyQWxwaGEsIElOVkVSU0VfR0FNTUEgKSApO1xyXG4gICAgICAgICAgICAgICAgaW1hZ2VEYXRhQnVmZmVyWyBvdXRwdXRJbmRleCArIDMgXSA9IE1hdGguZmxvb3IoIE1hdGgucG93KCBsaW5lYXJBbHBoYSAqIHNxdWFyZWRTdXBlcnNhbXBsZUludmVyc2UsIElOVkVSU0VfR0FNTUEgKSApO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gZmlsbCB0aGUgY2FudmFzIHdpdGggdGhlIHBpeGVsIGRhdGFcclxuICAgICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICkhO1xyXG4gICAgICBjb25zdCBpbWFnZURhdGEgPSBjb250ZXh0LmNyZWF0ZUltYWdlRGF0YSggY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCApO1xyXG4gICAgICBpbWFnZURhdGEuZGF0YS5zZXQoIGltYWdlRGF0YUJ1ZmZlciApO1xyXG4gICAgICBjb250ZXh0LnB1dEltYWdlRGF0YSggaW1hZ2VEYXRhLCAwLCAwICk7XHJcblxyXG4gICAgICB0YXJnZXQuZGlzcG9zZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjYW52YXM7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNob3dDb250ZXh0TG9zc0RpYWxvZygpOiB2b2lkIHtcclxuICAgIGlmICggIXRoaXMuY29udGV4dExvc3NEaWFsb2cgKSB7XHJcbiAgICAgIHRoaXMuY29udGV4dExvc3NEaWFsb2cgPSBuZXcgQ29udGV4dExvc3NGYWlsdXJlRGlhbG9nKCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmNvbnRleHRMb3NzRGlhbG9nLnNob3coKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSB0aHJlZS5qcyBSYXljYXN0ZXIgbWVhbnQgZm9yIHJheSBvcGVyYXRpb25zLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0UmF5Y2FzdGVyRnJvbVNjcmVlblBvaW50KCBzY3JlZW5Qb2ludDogVmVjdG9yMiApOiBUSFJFRS5SYXljYXN0ZXIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2NyZWVuUG9pbnQgJiYgc2NyZWVuUG9pbnQuaXNGaW5pdGUoKSApO1xyXG5cclxuICAgIC8vIG5vcm1hbGl6ZWQgZGV2aWNlIGNvb3JkaW5hdGVzXHJcbiAgICBjb25zdCBuZGNYID0gMiAqIHNjcmVlblBvaW50LnggLyB0aGlzLmNhbnZhc1dpZHRoIC0gMTtcclxuICAgIGNvbnN0IG5kY1kgPSAyICogKCAxIC0gKCBzY3JlZW5Qb2ludC55IC8gdGhpcy5jYW52YXNIZWlnaHQgKSApIC0gMTtcclxuXHJcbiAgICBjb25zdCBtb3VzZVBvaW50ID0gbmV3IFRIUkVFLlZlY3RvcjMoIG5kY1gsIG5kY1ksIDAgKTtcclxuICAgIGNvbnN0IHJheWNhc3RlciA9IG5ldyBUSFJFRS5SYXljYXN0ZXIoKTtcclxuICAgIHJheWNhc3Rlci5zZXRGcm9tQ2FtZXJhKCBtb3VzZVBvaW50LCB0aGlzLnRocmVlQ2FtZXJhICk7XHJcbiAgICByZXR1cm4gcmF5Y2FzdGVyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUHJvamVjdHMgYSAzZCBwb2ludCBpbiB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUgdG8gb25lIHdpdGhpbiB0aGUgMmQgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAgICovXHJcbiAgcHVibGljIHByb2plY3RQb2ludCggcG9pbnQ6IFZlY3RvcjMgKTogVmVjdG9yMiB7XHJcbiAgICBjb25zdCB0aHJlZVBvaW50ID0gVGhyZWVVdGlscy52ZWN0b3JUb1RocmVlKCBwb2ludCApO1xyXG4gICAgdGhyZWVQb2ludC5wcm9qZWN0KCB0aGlzLnRocmVlQ2FtZXJhICk7IC8vIGdsb2JhbCB0byBORENcclxuXHJcbiAgICAvLyBQb3RlbnRpYWwgZml4IGZvciBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbW9sZWN1bGUtc2hhcGVzL2lzc3Vlcy8xNDUuXHJcbiAgICAvLyBUaGUgVEhSRUUuVmVjdG9yMy5wcm9qZWN0KCBUSFJFRS5DYW1lcmEgKSBpcyBnaXZpbmcgaXMgbm9uc2Vuc2UgbmVhciBzdGFydHVwLiBMb25nZXItdGVybSBjb3VsZCBpZGVudGlmeS5cclxuICAgIGlmICggIWlzRmluaXRlKCB0aHJlZVBvaW50LnggKSApIHtcclxuICAgICAgdGhyZWVQb2ludC54ID0gMDtcclxuICAgIH1cclxuICAgIGlmICggIWlzRmluaXRlKCB0aHJlZVBvaW50LnkgKSApIHtcclxuICAgICAgdGhyZWVQb2ludC55ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoXHJcbiAgICAgICggdGhyZWVQb2ludC54ICsgMSApICogdGhpcy5jYW52YXNXaWR0aCAvIDIsXHJcbiAgICAgICggLXRocmVlUG9pbnQueSArIDEgKSAqIHRoaXMuY2FudmFzSGVpZ2h0IC8gMlxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdpdmVuIGEgc2NyZWVuIHBvaW50LCByZXR1cm5zIGEgM0QgcmF5IHJlcHJlc2VudGluZyB0aGUgY2FtZXJhJ3MgcG9zaXRpb24gYW5kIGRpcmVjdGlvbiB0aGF0IHBvaW50IHdvdWxkIGJlIGluIHRoZVxyXG4gICAqIDNEIHNjZW5lLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRSYXlGcm9tU2NyZWVuUG9pbnQoIHNjcmVlblBvaW50OiBWZWN0b3IyICk6IFJheTMge1xyXG4gICAgY29uc3QgdGhyZWVSYXkgPSB0aGlzLmdldFJheWNhc3RlckZyb21TY3JlZW5Qb2ludCggc2NyZWVuUG9pbnQgKS5yYXk7XHJcbiAgICByZXR1cm4gbmV3IFJheTMoIFRocmVlVXRpbHMudGhyZWVUb1ZlY3RvciggdGhyZWVSYXkub3JpZ2luICksIFRocmVlVXRpbHMudGhyZWVUb1ZlY3RvciggdGhyZWVSYXkuZGlyZWN0aW9uICkubm9ybWFsaXplKCkgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXREaW1lbnNpb25zKCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHdpZHRoICUgMSA9PT0gMCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaGVpZ2h0ICUgMSA9PT0gMCApO1xyXG5cclxuICAgIHRoaXMuY2FudmFzV2lkdGggPSB3aWR0aDtcclxuICAgIHRoaXMuY2FudmFzSGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgIHRoaXMudGhyZWVDYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xyXG4gICAgdGhpcy50aHJlZVJlbmRlcmVyICYmIHRoaXMudGhyZWVSZW5kZXJlci5zZXRTaXplKCB0aGlzLmNhbnZhc1dpZHRoLCB0aGlzLmNhbnZhc0hlaWdodCApO1xyXG5cclxuICAgIHRoaXMuZGltZW5zaW9uc0NoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkanVzdHMgdGhlIGNhbWVyYSdzIHZpZXcgb2Zmc2V0cyBzbyB0aGF0IGl0IGRpc3BsYXlzIHRoZSBjYW1lcmEncyBtYWluIG91dHB1dCB3aXRoaW4gdGhlIHNwZWNpZmllZCBjYW1lcmFCb3VuZHMuXHJcbiAgICogVGhpcyBpcyBhIGdlbmVyYWxpemF0aW9uIG9mIHRoZSBpc29tZXRyaWMgRk9WIGNvbXB1dGF0aW9uLCBhcyBpdCBhbHNvIHN1cHBvcnRzIG90aGVyIGNvbWJpbmF0aW9ucyBzdWNoIGFzIHByb3Blcmx5XHJcbiAgICogaGFuZGxpbmcgcGFuL3pvb20uIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZGVuc2l0eS9pc3N1ZXMvNTBcclxuICAgKi9cclxuICBwdWJsaWMgYWRqdXN0Vmlld09mZnNldCggY2FtZXJhQm91bmRzOiBCb3VuZHMyICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTWF0aC5hYnMoIHRoaXMudGhyZWVDYW1lcmEuYXNwZWN0IC0gY2FtZXJhQm91bmRzLndpZHRoIC8gY2FtZXJhQm91bmRzLmhlaWdodCApIDwgMWUtNSwgJ0NhbWVyYSBhc3BlY3Qgc2hvdWxkIG1hdGNoIGNhbWVyYUJvdW5kcycgKTtcclxuXHJcbiAgICAvLyBXZSBlc3NlbnRpYWxseSByZXZlcnNlIHNvbWUgb2YgdGhlIGNvbXB1dGF0aW9uIGJlaW5nIGRvbmUgYnkgUGVyc3BlY3RpdmVDYW1lcmEncyB1cGRhdGVQcm9qZWN0aW9uTWF0cml4KCksIHNvXHJcbiAgICAvLyB0aGF0IHdlIGNhbiBkbyBjb21wdXRhdGlvbnMgd2l0aGluIHRoYXQgY29vcmRpbmF0ZSBmcmFtZS4gVGhlIHNwZWNpZmljIGNvZGUgbmVlZGVkIHRvIGhhbmRsZSB0aGlzIGlzIGluXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbXJkb29iL3RocmVlLmpzL2Jsb2IvZDM5ZDgyOTk5ZjBhYzVjZGQxYjRlYjlmNGFiYTNmOTYyNmYzMmFiNi9zcmMvY2FtZXJhcy9QZXJzcGVjdGl2ZUNhbWVyYS5qcyNMMTc5LUwxOTZcclxuXHJcbiAgICAvLyBXaGF0IHdlIGVzc2VudGlhbGx5IHdhbnQgdG8gZG8gaXMgdGFrZSBvdXIgXCJsYXlvdXQgYm91bmRzICsgZm92ICsgem9vbVwiIGNvbWJpbmF0aW9uIHRvIGRldGVybWluZSB3aGF0IHRoZSBib3VuZHNcclxuICAgIC8vIG9mIHRoaXMgZW5kcyB1cCBiZWluZyBpbiB0aGUgcHJvamVjdGlvbiBmcnVzdHVtJ3MgbmVhciBwbGFuZS5cclxuICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU4NjE1MjM4L29wZW5nbC1wZXJzcGVjdGl2ZS1wcm9qZWN0aW9uLWhvdy10by1kZWZpbmUtbGVmdC1hbmQtcmlnaHQgaXNcclxuICAgIC8vIHN1cHJlbWVseSBoZWxwZnVsIHRvIHZpc3VhbGl6ZSB0aGlzLiBUaGVuIHdlJ2Qgd2FudCB0byBhZGp1c3QgdGhlIGJvdW5kcyBpbiB0aGUgbmVhciBwbGFuZSB3aXRoIGEgbGluZWFyXHJcbiAgICAvLyByZWxhdGlvbnNoaXAuIEluIHRoZSBub3JtYWwgZ2xvYmFsIGNvb3JkaW5hdGUgc3BhY2UsIHdlIGhhdmUgXCJjYW1lcmFCb3VuZHNcIiA9PiAoMCwwLGNhbnZhc1dpZHRoLGNhbnZhc0hlaWdodCkuXHJcbiAgICAvLyBUaGUgY2VudGVyIG9mIGNhbWVyYUJvdW5kcyBnZXRzIG1hcHBlZCB0byAoMCwwKSBpbiB0aGUgbmVhciBwbGFuZSAoc2luY2UgaXQncyB3aGVyZSB0aGUgY2FtZXJhIGlzIHBvaW50aW5nKSxcclxuICAgIC8vIGFuZCBjYW1lcmFCb3VuZHMgbWFwcyB0byBhIGNlbnRlcmVkIHJlY3RhbmdsZSBkZXRlcm1pbmVkIGJ5ICgtaGFsZldpZHRoLC1oYWxmSGVpZ2h0LGhhbGZXaWR0aCxoYWxmSGVpZ2h0KS5cclxuICAgIC8vIFdlIHRoZW4gd2FudCB0byBtYXAgb3VyIGFjdHVhbCBjYW52YXMgKDAsMCxjYW52YXNXaWR0aCxjYW52YXNIZWlnaHQpIGludG8gdGhlIG5lYXIgcGxhbmUsIGFuZCBUSEVOIHdlIGNvbXB1dGVcclxuICAgIC8vIHdoYXQgdGhyZWVDYW1lcmEuc2V0Vmlld09mZnNldCBjYWxsIHdpbGwgYWRqdXN0IHRoZSBuZWFyIHBsYW5lIGNvb3JkaW5hdGVzIHRvIHdoYXQgd2UgbmVlZCAoc2luY2UgdGhlcmUgaXNuJ3RcclxuICAgIC8vIGEgbW9yZSBkaXJlY3Qgd2F5KS5cclxuICAgIC8vIEFkZGl0aW9uYWxseSwgbm90ZSB0aGF0IHRoZSBcInRvcFwiIGlzIHBvc2l0aXZlIGluIHRoZSBuZWFyLXBsYW5lIGNvb3JkaW5hdGUgZnJhbWUsIHdoZXJlYXMgaXQncyBuZWdhdGl2ZSBpblxyXG4gICAgLy8gU2NlbmVyeS9nbG9iYWwgY29vcmRpbmF0ZXMuXHJcblxyXG4gICAgLy8gR2V0IHRoZSBiYXNpYyBoYWxmIHdpZHRoL2hlaWdodCBvZiB0aGUgcHJvamVjdGlvbiBvbiB0aGUgbmVhci1jbGlwIHBsYW5lLiBXZSdsbCBiZSBhZGp1c3RpbmcgaW4gdGhpcyBjb29yZGluYXRlXHJcbiAgICAvLyBmcmFtZSBiZWxvdy4gVGhlc2UgZGV0ZXJtaW5lIHRoZSBvcmlnaW5hbCByZWN0YW5nbGUgb2Ygb3VyIGlkZWFsIGNhbWVyYSdzIHNwYWNlIGluIHRoZSBuZWFyLXBsYW5lIGNvb3JkaW5hdGVzLlxyXG4gICAgY29uc3QgaGFsZkhlaWdodCA9IHRoaXMudGhyZWVDYW1lcmEubmVhciAqIE1hdGgudGFuKCAoIE1hdGguUEkgLyAzNjAgKSAqIHRoaXMudGhyZWVDYW1lcmEuZm92ICkgLyB0aGlzLnRocmVlQ2FtZXJhLnpvb207XHJcbiAgICBjb25zdCBoYWxmV2lkdGggPSB0aGlzLnRocmVlQ2FtZXJhLmFzcGVjdCAqIGhhbGZIZWlnaHQ7XHJcblxyXG4gICAgLy8gT3VyIENhbnZhcydzIGJvdW5kcywgYWRqdXN0ZWQgc28gdGhhdCB0aGUgb3JpZ2luIGlzIHRoZSBjYW1lcmFCb3VuZHMgY2VudGVyLlxyXG4gICAgY29uc3QgaW1wbGljaXRCb3VuZHMgPSBuZXcgQm91bmRzMiggMCwgMCwgdGhpcy5jYW52YXNXaWR0aCwgdGhpcy5jYW52YXNIZWlnaHQgKS5zaGlmdGVkKCBjYW1lcmFCb3VuZHMuY2VudGVyLm5lZ2F0ZWQoKSApO1xyXG5cclxuICAgIC8vIERlcml2YXRpb24gZm9yIGFkanVzdGVkIHdpZHRoL2hlaWdodCBmcm9tIFBlcnNwZWN0aXZlQ2FtZXJhIHByb2plY3Rpb24gc2V0dXBcclxuICAgIC8vIHdpZHRoICo9IHZpZXcud2lkdGggLyBmdWxsV2lkdGhcclxuICAgIC8vIG5ld1dpZHRoID0gMiAqIGhhbGZXaWR0aCAqIHRoaXMuY2FudmFzV2lkdGggLyBhZGp1c3RlZEZ1bGxXaWR0aFxyXG4gICAgLy8gYWRqdXN0ZWRGdWxsV2lkdGggKiBuZXdXaWR0aCA9IDIgKiBoYWxmV2lkdGggKiB0aGlzLmNhbnZhc1dpZHRoO1xyXG4gICAgLy8gYWRqdXN0ZWRGdWxsV2lkdGggPSAyICogaGFsZldpZHRoICogdGhpcy5jYW52YXNXaWR0aCAvIG5ld1dpZHRoO1xyXG4gICAgLy8gbmV3V2lkdGggPSAyICogaGFsZldpZHRoICogdGhpcy5jYW52YXNXaWR0aCAvIGNhbWVyYUJvdW5kcy53aWR0aDtcclxuICAgIC8vIGFkanVzdGVkRnVsbFdpZHRoID0gMiAqIGhhbGZXaWR0aCAqIHRoaXMuY2FudmFzV2lkdGggLyAoIDIgKiBoYWxmV2lkdGggKiB0aGlzLmNhbnZhc1dpZHRoIC8gY2FtZXJhQm91bmRzLndpZHRoICk7XHJcbiAgICAvLyBhZGp1c3RlZEZ1bGxXaWR0aCA9IGNhbWVyYUJvdW5kcy53aWR0aDtcclxuICAgIGNvbnN0IGFkanVzdGVkRnVsbFdpZHRoID0gY2FtZXJhQm91bmRzLndpZHRoO1xyXG4gICAgY29uc3QgYWRqdXN0ZWRGdWxsSGVpZ2h0ID0gY2FtZXJhQm91bmRzLmhlaWdodDtcclxuXHJcbiAgICBjb25zdCBvbGRMZWZ0ID0gLWhhbGZXaWR0aDtcclxuICAgIGNvbnN0IG9sZFRvcCA9IGhhbGZIZWlnaHQ7XHJcblxyXG4gICAgLy8gLTAuNSAqIGNhbWVyYUJvdW5kcy53aWR0aCA9PT4gW2xlZnRdIC1oYWxmV2lkdGhcclxuICAgIGNvbnN0IG5ld0xlZnQgPSBpbXBsaWNpdEJvdW5kcy5sZWZ0ICogaGFsZldpZHRoIC8gKCAwLjUgKiBjYW1lcmFCb3VuZHMud2lkdGggKTtcclxuXHJcbiAgICAvLyAtMC41ICogY2FtZXJhQm91bmRzLmhlaWdodCA9PT4gW3RvcF0gaGFsZkhlaWdodFxyXG4gICAgY29uc3QgbmV3VG9wID0gLWltcGxpY2l0Qm91bmRzLnRvcCAqIGhhbGZIZWlnaHQgLyAoIDAuNSAqIGNhbWVyYUJvdW5kcy5oZWlnaHQgKTtcclxuXHJcbiAgICAvLyBEZXJpdmF0aW9uIGZyb20gUGVyc3BlY3RpdmVDYW1lcmEgcHJvamVjdGlvbiBzZXR1cFxyXG4gICAgLy8gbGVmdCArPSB2aWV3Lm9mZnNldFggKiB3aWR0aCAvIGZ1bGxXaWR0aDtcclxuICAgIC8vIG5ld0xlZnQgPSBvbGRMZWZ0ICsgb2Zmc2V0WCAqICggMiAqIGhhbGZXaWR0aCApIC8gYWRqdXN0ZWRGdWxsV2lkdGhcclxuICAgIC8vIG5ld0xlZnQgLSBvbGRMZWZ0ID0gb2Zmc2V0WCAqICggMiAqIGhhbGZXaWR0aCApIC8gYWRqdXN0ZWRGdWxsV2lkdGhcclxuICAgIC8vICggbmV3TGVmdCAtIG9sZExlZnQgKSAqIGFkanVzdGVkRnVsbFdpZHRoIC8gKCAyICogaGFsZldpZHRoICkgPSBvZmZzZXRYXHJcbiAgICBjb25zdCBvZmZzZXRYID0gKCBuZXdMZWZ0IC0gb2xkTGVmdCApICogYWRqdXN0ZWRGdWxsV2lkdGggLyAoIDIgKiBoYWxmV2lkdGggKTtcclxuXHJcbiAgICAvLyBEZXJpdmF0aW9uIGZyb20gUGVyc3BlY3RpdmVDYW1lcmEgcHJvamVjdGlvbiBzZXR1cFxyXG4gICAgLy8gdG9wIC09IG9mZnNldFkgKiBoZWlnaHQgLyBhZGp1c3RlZEZ1bGxIZWlnaHQ7XHJcbiAgICAvLyBuZXdUb3AgPSBvbGRUb3AgLSBvZmZzZXRZICogKCAyICogaGFsZkhlaWdodCApIC8gYWRqdXN0ZWRGdWxsSGVpZ2h0O1xyXG4gICAgLy8gb2Zmc2V0WSAqICggMiAqIGhhbGZIZWlnaHQgKSAvIGFkanVzdGVkRnVsbEhlaWdodCA9IG9sZFRvcCAtIG5ld1RvcDtcclxuICAgIC8vIG9mZnNldFkgPSAoIG9sZFRvcCAtIG5ld1RvcCApICogYWRqdXN0ZWRGdWxsSGVpZ2h0IC8gKCAyICogaGFsZkhlaWdodCApO1xyXG4gICAgY29uc3Qgb2Zmc2V0WSA9ICggb2xkVG9wIC0gbmV3VG9wICkgKiBhZGp1c3RlZEZ1bGxIZWlnaHQgLyAoIDIgKiBoYWxmSGVpZ2h0ICk7XHJcblxyXG4gICAgdGhpcy50aHJlZUNhbWVyYS5zZXRWaWV3T2Zmc2V0KCBhZGp1c3RlZEZ1bGxXaWR0aCwgYWRqdXN0ZWRGdWxsSGVpZ2h0LCBvZmZzZXRYLCBvZmZzZXRZLCB0aGlzLmNhbnZhc1dpZHRoLCB0aGlzLmNhbnZhc0hlaWdodCApO1xyXG5cclxuICAgIC8vIFRoZSBzZXRWaWV3T2Zmc2V0IGNhbGwgd2VpcmRseSBtdWNrcyB3aXRoIHdpdGggdGhlIGFzcGVjdCByYXRpbywgc28gd2UgbmVlZCB0byBmaXggaXQgYWZ0ZXJ3YXJkLlxyXG4gICAgdGhpcy50aHJlZUNhbWVyYS5hc3BlY3QgPSBjYW1lcmFCb3VuZHMud2lkdGggLyBjYW1lcmFCb3VuZHMuaGVpZ2h0O1xyXG5cclxuICAgIC8vIFRoaXMgZm9yY2VzIGEgcmVjb21wdXRhdGlvbiwgYXMgd2UndmUgY2hhbmdlZCB0aGUgaW5wdXRzLlxyXG4gICAgdGhpcy50aHJlZUNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHdpZHRoKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5jYW52YXNXaWR0aDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgaGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5jYW52YXNIZWlnaHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW5kZXJzIHRoZSBzaW11bGF0aW9uIHRvIGEgc3BlY2lmaWMgcmVuZGVyaW5nIHRhcmdldFxyXG4gICAqXHJcbiAgICogQHBhcmFtIHRhcmdldCAtIHVuZGVmaW5lZCBmb3IgdGhlIGRlZmF1bHQgdGFyZ2V0XHJcbiAgICovXHJcbiAgcHVibGljIHJlbmRlciggdGFyZ2V0OiBUSFJFRS5XZWJHTFJlbmRlclRhcmdldCB8IHVuZGVmaW5lZCApOiB2b2lkIHtcclxuICAgIC8vIHJlbmRlciB0aGUgM0Qgc2NlbmUgZmlyc3RcclxuICAgIGlmICggdGhpcy50aHJlZVJlbmRlcmVyICkge1xyXG4gICAgICB0aGlzLnRocmVlUmVuZGVyZXIuc2V0UmVuZGVyVGFyZ2V0KCB0YXJnZXQgfHwgbnVsbCApO1xyXG4gICAgICB0aGlzLnRocmVlUmVuZGVyZXIucmVuZGVyKCB0aGlzLnRocmVlU2NlbmUsIHRoaXMudGhyZWVDYW1lcmEgKTtcclxuICAgICAgdGhpcy50aHJlZVJlbmRlcmVyLmF1dG9DbGVhciA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlcy5cclxuICAgKi9cclxuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMudGhyZWVSZW5kZXJlciAmJiB0aGlzLnRocmVlUmVuZGVyZXIuZGlzcG9zZSgpO1xyXG5cclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgIHRoaXMudGhyZWVTY2VuZS5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmJhY2tncm91bmRQcm9wZXJ0eS51bmxpbmsoIHRoaXMuY29sb3JMaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSXQncyBhIGJpdCB0cmlja3ksIHNpbmNlIGlmIHdlIGFyZSB2ZXJ0aWNhbGx5LWNvbnN0cmFpbmVkLCB3ZSBkb24ndCBuZWVkIHRvIGFkanVzdCB0aGUgY2FtZXJhJ3MgRk9WIChzaW5jZSB0aGVcclxuICAgKiB3aWR0aCBvZiB0aGUgc2NlbmUgd2lsbCBzY2FsZSBwcm9wb3J0aW9uYWxseSB0byB0aGUgc2NhbGUgd2UgZGlzcGxheSBvdXIgY29udGVudHMgYXQpLiBJdCdzIG9ubHkgd2hlbiBvdXIgdmlld1xyXG4gICAqIGlzIGhvcml6b250YWxseS1jb25zdHJhaW5lZCB3aGVyZSB3ZSBoYXZlIHRvIGFjY291bnQgZm9yIHRoZSBjaGFuZ2VkIGFzcGVjdCByYXRpbywgYW5kIGFkanVzdCB0aGUgRk9WIHNvIHRoYXRcclxuICAgKiB0aGUgY29udGVudCBzaG93cyB1cCBhdCBhIHNjYWxlIG9mIFwic3kgLyBzeFwiIGNvbXBhcmVkIHRvIHRoZSBub3JtYWwgY2FzZS4gTm90ZSB0aGF0IHN4ID09PSBzeSBpcyB3aGVyZSBvdXJcclxuICAgKiBsYXlvdXQgYm91bmRzIGZpdCBwZXJmZWN0bHkgaW4gdGhlIHdpbmRvdywgc28gd2UgZG9uJ3QgcmVhbGx5IGhhdmUgYSBjb25zdHJhaW50LlxyXG4gICAqIE1vc3Qgb2YgdGhlIGNvbXBsZXhpdHkgaGVyZSBpcyB0aGF0IHRocmVlQ2FtZXJhLmZvdiBpcyBpbiBkZWdyZWVzLCBhbmQgb3VyIGlkZWFsIHZlcnRpY2FsbHktY29uc3RyYWluZWQgRk9WIGlzXHJcbiAgICogNTAgKHNvIHRoZXJlJ3MgY29udmVyc2lvbiBmYWN0b3JzIGluIHBsYWNlKS5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGNvbXB1dGVJc29tZXRyaWNGT1YoIGZvdjogbnVtYmVyLCBjYW52YXNXaWR0aDogbnVtYmVyLCBjYW52YXNIZWlnaHQ6IG51bWJlciwgbGF5b3V0V2lkdGg6IG51bWJlciwgbGF5b3V0SGVpZ2h0OiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IHN4ID0gY2FudmFzV2lkdGggLyBsYXlvdXRXaWR0aDtcclxuICAgIGNvbnN0IHN5ID0gY2FudmFzSGVpZ2h0IC8gbGF5b3V0SGVpZ2h0O1xyXG5cclxuICAgIHJldHVybiBzeCA+IHN5ID8gZm92IDogTWF0aC5hdGFuKCBNYXRoLnRhbiggZm92ICogTWF0aC5QSSAvIDM2MCApICogc3kgLyBzeCApICogMzYwIC8gTWF0aC5QSTtcclxuICB9XHJcbn1cclxuXHJcbm1vYml1cy5yZWdpc3RlciggJ1RocmVlU3RhZ2UnLCBUaHJlZVN0YWdlICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sMkJBQTJCO0FBQ2hELE9BQU9DLFdBQVcsTUFBTSw4QkFBOEI7QUFDdEQsT0FBT0MsT0FBTyxNQUFNLHlCQUF5QjtBQUM3QyxPQUFPQyxJQUFJLE1BQU0sc0JBQXNCO0FBQ3ZDLE9BQU9DLE9BQU8sTUFBTSx5QkFBeUI7QUFDN0MsT0FBT0MsT0FBTyxNQUFNLHlCQUF5QjtBQUM3QyxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLHdCQUF3QixNQUFNLG1EQUFtRDtBQUN4RixTQUFTQyxLQUFLLFFBQVEsNkJBQTZCO0FBQ25ELE9BQU9DLHFCQUFxQixNQUFNLDRCQUE0QjtBQUM5RCxPQUFPQyxVQUFVLE1BQU0saUJBQWlCO0FBQ3hDLE9BQU9DLE1BQU0sTUFBTSxhQUFhO0FBSWhDO0FBQ0EsTUFBTUMsS0FBSyxHQUFHLEdBQUc7QUFDakIsTUFBTUMsYUFBYSxHQUFHLENBQUMsR0FBR0QsS0FBSztBQVMvQixlQUFlLE1BQU1FLFVBQVUsQ0FBQztFQUU5Qjs7RUFrQk9DLFdBQVdBLENBQUVDLGVBQW1DLEVBQUc7SUFFeEQsTUFBTUMsT0FBTyxHQUFHWCxTQUFTLENBQXVDLENBQUMsQ0FBRTtNQUNqRVksa0JBQWtCLEVBQUUsSUFBSWxCLFFBQVEsQ0FBRVEsS0FBSyxDQUFDVyxLQUFNLENBQUM7TUFDL0NDLGNBQWMsRUFBRSxJQUFJZixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFHO0lBQ3hDLENBQUMsRUFBRVcsZUFBZ0IsQ0FBQztJQUVwQixJQUFJLENBQUNLLFdBQVcsR0FBRyxDQUFDO0lBQ3BCLElBQUksQ0FBQ0MsV0FBVyxHQUFHLENBQUM7SUFDcEIsSUFBSSxDQUFDQyxZQUFZLEdBQUcsQ0FBQztJQUNyQixJQUFJLENBQUNDLFVBQVUsR0FBRyxJQUFJQyxLQUFLLENBQUNDLEtBQUssQ0FBQyxDQUFDOztJQUVuQztJQUNBLElBQUksQ0FBQ0MsV0FBVyxHQUFHLElBQUlGLEtBQUssQ0FBQ0csaUJBQWlCLENBQUMsQ0FBQzs7SUFFaEQ7SUFDQSxJQUFJLENBQUNELFdBQVcsQ0FBQ0UsSUFBSSxHQUFHLENBQUM7SUFDekIsSUFBSSxDQUFDRixXQUFXLENBQUNHLEdBQUcsR0FBRyxHQUFHO0lBRTFCLElBQUk7TUFDRixJQUFJLENBQUNDLGFBQWEsR0FBRyxJQUFJTixLQUFLLENBQUNPLGFBQWEsQ0FBRTtRQUM1Q0MsU0FBUyxFQUFFLElBQUk7UUFDZkMsS0FBSyxFQUFFLElBQUk7UUFDWEMscUJBQXFCLEVBQUVDLElBQUksQ0FBQ0MsT0FBTyxDQUFDQyxlQUFlLENBQUNIO01BQ3RELENBQUUsQ0FBQztJQUNMLENBQUMsQ0FDRCxPQUFPSSxDQUFDLEVBQUc7TUFDVDtNQUNBQyxPQUFPLENBQUNDLEdBQUcsQ0FBRUYsQ0FBRSxDQUFDO01BQ2hCLElBQUksQ0FBQ1IsYUFBYSxHQUFHLElBQUk7SUFDM0I7SUFDQSxJQUFJLENBQUNBLGFBQWEsSUFBSSxJQUFJLENBQUNBLGFBQWEsQ0FBQ1csYUFBYSxDQUFFQyxNQUFNLENBQUNDLGdCQUFnQixJQUFJLENBQUUsQ0FBQzs7SUFFdEY7SUFDQSxJQUFJLENBQUNDLGlCQUFpQixHQUFHLElBQUk7O0lBRTdCO0lBQ0EsSUFBSSxDQUFDZCxhQUFhLElBQUksSUFBSSxDQUFDQSxhQUFhLENBQUNlLE9BQU8sQ0FBQ0MsTUFBTSxDQUFDQyxnQkFBZ0IsQ0FBRSxrQkFBa0IsRUFBRUMsS0FBSyxJQUFJO01BQ3JHLElBQUksQ0FBQ0MscUJBQXFCLENBQUMsQ0FBQztJQUM5QixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNuQixhQUFhLElBQUksSUFBSSxDQUFDQSxhQUFhLENBQUNlLE9BQU8sQ0FBQ0MsTUFBTSxDQUFDQyxnQkFBZ0IsQ0FBRSxzQkFBc0IsRUFBRUMsS0FBSyxJQUFJO01BQ3pHLElBQUksQ0FBQ0osaUJBQWlCLENBQUVNLGlCQUFpQixDQUFDLENBQUM7SUFDN0MsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDakMsa0JBQWtCLEdBQUdELE9BQU8sQ0FBQ0Msa0JBQWtCO0lBRXBELElBQUksQ0FBQ2tDLGFBQWEsR0FBR0MsS0FBSyxJQUFJO01BQzVCLElBQUksQ0FBQ3RCLGFBQWEsSUFBSSxJQUFJLENBQUNBLGFBQWEsQ0FBQ3VCLGFBQWEsQ0FBRUQsS0FBSyxDQUFDRSxRQUFRLENBQUMsQ0FBQyxFQUFFRixLQUFLLENBQUNuQixLQUFNLENBQUM7SUFDekYsQ0FBQztJQUNELElBQUksQ0FBQ2hCLGtCQUFrQixDQUFDc0MsSUFBSSxDQUFFLElBQUksQ0FBQ0osYUFBYyxDQUFDO0lBRWxELElBQUksQ0FBQ3pCLFdBQVcsQ0FBQzhCLFFBQVEsQ0FBQ0MsSUFBSSxDQUFFaEQsVUFBVSxDQUFDaUQsYUFBYSxDQUFFMUMsT0FBTyxDQUFDRyxjQUFlLENBQUUsQ0FBQyxDQUFDLENBQUM7O0lBRXRGLElBQUksQ0FBQ3dDLHdCQUF3QixHQUFHLElBQUkzRCxXQUFXLENBQUMsQ0FBQztFQUNuRDs7RUFFQTtBQUNGO0FBQ0E7RUFDUzRELGNBQWNBLENBQUVDLHFCQUFxQixHQUFHLENBQUMsRUFBRUMsaUJBQWlCLEdBQUcsQ0FBQyxFQUFzQjtJQUMzRkMsTUFBTSxJQUFJQSxNQUFNLENBQUVDLE1BQU0sQ0FBQ0MsU0FBUyxDQUFFSixxQkFBc0IsQ0FBRSxDQUFDO0lBRTdELE1BQU14QyxXQUFXLEdBQUc2QyxJQUFJLENBQUNDLElBQUksQ0FBRSxJQUFJLENBQUM5QyxXQUFXLEdBQUd5QyxpQkFBa0IsQ0FBQztJQUNyRSxNQUFNeEMsWUFBWSxHQUFHNEMsSUFBSSxDQUFDQyxJQUFJLENBQUUsSUFBSSxDQUFDN0MsWUFBWSxHQUFHd0MsaUJBQWtCLENBQUM7SUFFdkUsTUFBTU0sS0FBSyxHQUFHL0MsV0FBVyxHQUFHd0MscUJBQXFCO0lBQ2pELE1BQU1RLE1BQU0sR0FBRy9DLFlBQVksR0FBR3VDLHFCQUFxQjtJQUVuRCxNQUFNZixNQUFNLEdBQUd3QixRQUFRLENBQUNDLGFBQWEsQ0FBRSxRQUFTLENBQUM7SUFDakR6QixNQUFNLENBQUNzQixLQUFLLEdBQUcvQyxXQUFXO0lBQzFCeUIsTUFBTSxDQUFDdUIsTUFBTSxHQUFHL0MsWUFBWTs7SUFFNUI7SUFDQTtJQUNBLElBQUssSUFBSSxDQUFDUSxhQUFhLEVBQUc7TUFDeEI7TUFDQTtNQUNBOztNQUVBO01BQ0EsTUFBTTBDLE1BQU0sR0FBRyxJQUFJaEQsS0FBSyxDQUFDaUQsaUJBQWlCLENBQUVMLEtBQUssRUFBRUMsTUFBTSxFQUFFO1FBQ3pESyxTQUFTLEVBQUVsRCxLQUFLLENBQUNtRCxZQUFZO1FBQzdCQyxTQUFTLEVBQUVwRCxLQUFLLENBQUNxRCxhQUFhO1FBQzlCQyxNQUFNLEVBQUV0RCxLQUFLLENBQUN1RDtNQUNoQixDQUFFLENBQUM7O01BRUg7TUFDQSxJQUFJLENBQUNDLE1BQU0sQ0FBRVIsTUFBTyxDQUFDOztNQUVyQjtNQUNBLE1BQU1TLE1BQU0sR0FBRyxJQUFJdkMsTUFBTSxDQUFDd0MsV0FBVyxDQUFFZCxLQUFLLEdBQUdDLE1BQU0sR0FBRyxDQUFFLENBQUM7TUFDM0QsTUFBTWMsTUFBTSxHQUFHLElBQUl6QyxNQUFNLENBQUMwQyxVQUFVLENBQUVILE1BQU8sQ0FBQzs7TUFFOUM7TUFDQSxNQUFNSSxFQUFFLEdBQUcsSUFBSSxDQUFDdkQsYUFBYSxDQUFDd0QsVUFBVSxDQUFDLENBQUM7TUFDMUNELEVBQUUsQ0FBQ0UsVUFBVSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVuQixLQUFLLEVBQUVDLE1BQU0sRUFBRWdCLEVBQUUsQ0FBQ0csSUFBSSxFQUFFSCxFQUFFLENBQUNJLGFBQWEsRUFBRU4sTUFBTyxDQUFDO01BRXZFLElBQUlPLGVBQWU7TUFDbkIsSUFBSzdCLHFCQUFxQixLQUFLLENBQUMsRUFBRztRQUNqQzZCLGVBQWUsR0FBRyxJQUFJaEQsTUFBTSxDQUFDaUQsaUJBQWlCLENBQUVWLE1BQU8sQ0FBQztNQUMxRCxDQUFDLE1BQ0k7UUFDSFMsZUFBZSxHQUFHLElBQUloRCxNQUFNLENBQUNpRCxpQkFBaUIsQ0FBRXRFLFdBQVcsR0FBR0MsWUFBWSxHQUFHLENBQUUsQ0FBQztRQUVoRixNQUFNc0UseUJBQXlCLEdBQUcsQ0FBQyxJQUFLL0IscUJBQXFCLEdBQUdBLHFCQUFxQixDQUFFOztRQUV2RjtRQUNBLElBQUtyRCxxQkFBcUIsQ0FBQ3FGLHFCQUFxQixFQUFHO1VBQ2pELEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHekUsV0FBVyxFQUFFeUUsQ0FBQyxFQUFFLEVBQUc7WUFDdEMsTUFBTUMsTUFBTSxHQUFHRCxDQUFDLEdBQUdqQyxxQkFBcUI7WUFDeEMsS0FBTSxJQUFJbUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHMUUsWUFBWSxFQUFFMEUsQ0FBQyxFQUFFLEVBQUc7Y0FDdkMsTUFBTUMsTUFBTSxHQUFHRCxDQUFDLEdBQUduQyxxQkFBcUI7Y0FDeEMsTUFBTXFDLFdBQVcsR0FBRyxDQUFFSixDQUFDLEdBQUdFLENBQUMsR0FBRzNFLFdBQVcsSUFBSyxDQUFDOztjQUUvQztjQUNBLElBQUk4RSxnQkFBZ0IsR0FBRyxDQUFDO2NBQ3hCLElBQUlDLGtCQUFrQixHQUFHLENBQUM7Y0FDMUIsSUFBSUMsaUJBQWlCLEdBQUcsQ0FBQztjQUN6QixJQUFJcEUsS0FBSyxHQUFHLENBQUM7Y0FFYixLQUFNLElBQUlxRSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUd6QyxxQkFBcUIsRUFBRXlDLENBQUMsRUFBRSxFQUFHO2dCQUNoRCxLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRzFDLHFCQUFxQixFQUFFMEMsQ0FBQyxFQUFFLEVBQUc7a0JBQ2hELE1BQU1DLFVBQVUsR0FBRyxDQUFFVCxNQUFNLEdBQUdPLENBQUMsR0FBRyxDQUFFTCxNQUFNLEdBQUdNLENBQUMsSUFBS25DLEtBQUssSUFBSyxDQUFDO2tCQUU5RCxNQUFNcUMsVUFBVSxHQUFHdEIsTUFBTSxDQUFFcUIsVUFBVSxHQUFHLENBQUMsQ0FBRTtrQkFFM0NMLGdCQUFnQixJQUFJaEIsTUFBTSxDQUFFcUIsVUFBVSxHQUFHLENBQUMsQ0FBRSxHQUFHQyxVQUFVO2tCQUN6REwsa0JBQWtCLElBQUlqQixNQUFNLENBQUVxQixVQUFVLEdBQUcsQ0FBQyxDQUFFLEdBQUdDLFVBQVU7a0JBQzNESixpQkFBaUIsSUFBSWxCLE1BQU0sQ0FBRXFCLFVBQVUsR0FBRyxDQUFDLENBQUUsR0FBR0MsVUFBVTtrQkFDMUR4RSxLQUFLLElBQUl3RSxVQUFVO2dCQUNyQjtjQUNGO2NBRUEsSUFBS3hFLEtBQUssS0FBSyxDQUFDLEVBQUc7Z0JBQ2pCeUQsZUFBZSxDQUFFUSxXQUFXLEdBQUcsQ0FBQyxDQUFFLEdBQUcsQ0FBQztnQkFDdENSLGVBQWUsQ0FBRVEsV0FBVyxHQUFHLENBQUMsQ0FBRSxHQUFHLENBQUM7Z0JBQ3RDUixlQUFlLENBQUVRLFdBQVcsR0FBRyxDQUFDLENBQUUsR0FBRyxDQUFDO2dCQUN0Q1IsZUFBZSxDQUFFUSxXQUFXLEdBQUcsQ0FBQyxDQUFFLEdBQUcsQ0FBQztjQUN4QyxDQUFDLE1BQ0k7Z0JBQ0hSLGVBQWUsQ0FBRVEsV0FBVyxHQUFHLENBQUMsQ0FBRSxHQUFHaEMsSUFBSSxDQUFDd0MsS0FBSyxDQUFFUCxnQkFBZ0IsR0FBR2xFLEtBQU0sQ0FBQztnQkFDM0V5RCxlQUFlLENBQUVRLFdBQVcsR0FBRyxDQUFDLENBQUUsR0FBR2hDLElBQUksQ0FBQ3dDLEtBQUssQ0FBRU4sa0JBQWtCLEdBQUduRSxLQUFNLENBQUM7Z0JBQzdFeUQsZUFBZSxDQUFFUSxXQUFXLEdBQUcsQ0FBQyxDQUFFLEdBQUdoQyxJQUFJLENBQUN3QyxLQUFLLENBQUVMLGlCQUFpQixHQUFHcEUsS0FBTSxDQUFDO2dCQUM1RXlELGVBQWUsQ0FBRVEsV0FBVyxHQUFHLENBQUMsQ0FBRSxHQUFHaEMsSUFBSSxDQUFDd0MsS0FBSyxDQUFFekUsS0FBSyxHQUFHMkQseUJBQTBCLENBQUM7Y0FDdEY7WUFDRjtVQUNGO1FBQ0YsQ0FBQyxNQUNJO1VBQ0gsS0FBTSxJQUFJRSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUd6RSxXQUFXLEVBQUV5RSxDQUFDLEVBQUUsRUFBRztZQUN0QyxNQUFNQyxNQUFNLEdBQUdELENBQUMsR0FBR2pDLHFCQUFxQjtZQUN4QyxLQUFNLElBQUltQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcxRSxZQUFZLEVBQUUwRSxDQUFDLEVBQUUsRUFBRztjQUN2QyxNQUFNQyxNQUFNLEdBQUdELENBQUMsR0FBR25DLHFCQUFxQjtjQUN4QyxNQUFNcUMsV0FBVyxHQUFHLENBQUVKLENBQUMsR0FBR0UsQ0FBQyxHQUFHM0UsV0FBVyxJQUFLLENBQUM7O2NBRS9DO2NBQ0EsSUFBSXNGLHNCQUFzQixHQUFHLENBQUM7Y0FDOUIsSUFBSUMsd0JBQXdCLEdBQUcsQ0FBQztjQUNoQyxJQUFJQyx1QkFBdUIsR0FBRyxDQUFDO2NBQy9CLElBQUlDLFdBQVcsR0FBRyxDQUFDO2NBRW5CLEtBQU0sSUFBSVIsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHekMscUJBQXFCLEVBQUV5QyxDQUFDLEVBQUUsRUFBRztnQkFDaEQsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcxQyxxQkFBcUIsRUFBRTBDLENBQUMsRUFBRSxFQUFHO2tCQUNoRCxNQUFNQyxVQUFVLEdBQUcsQ0FBRVQsTUFBTSxHQUFHTyxDQUFDLEdBQUcsQ0FBRUwsTUFBTSxHQUFHTSxDQUFDLElBQUtuQyxLQUFLLElBQUssQ0FBQztrQkFFOUQsTUFBTW5DLEtBQUssR0FBR2lDLElBQUksQ0FBQzZDLEdBQUcsQ0FBRTVCLE1BQU0sQ0FBRXFCLFVBQVUsR0FBRyxDQUFDLENBQUUsRUFBRTdGLEtBQU0sQ0FBQztrQkFFekRnRyxzQkFBc0IsSUFBSXpDLElBQUksQ0FBQzZDLEdBQUcsQ0FBRTVCLE1BQU0sQ0FBRXFCLFVBQVUsR0FBRyxDQUFDLENBQUUsRUFBRTdGLEtBQU0sQ0FBQyxHQUFHc0IsS0FBSztrQkFDN0UyRSx3QkFBd0IsSUFBSTFDLElBQUksQ0FBQzZDLEdBQUcsQ0FBRTVCLE1BQU0sQ0FBRXFCLFVBQVUsR0FBRyxDQUFDLENBQUUsRUFBRTdGLEtBQU0sQ0FBQyxHQUFHc0IsS0FBSztrQkFDL0U0RSx1QkFBdUIsSUFBSTNDLElBQUksQ0FBQzZDLEdBQUcsQ0FBRTVCLE1BQU0sQ0FBRXFCLFVBQVUsR0FBRyxDQUFDLENBQUUsRUFBRTdGLEtBQU0sQ0FBQyxHQUFHc0IsS0FBSztrQkFDOUU2RSxXQUFXLElBQUk3RSxLQUFLO2dCQUN0QjtjQUNGO2NBRUEsSUFBSzZFLFdBQVcsS0FBSyxDQUFDLEVBQUc7Z0JBQ3ZCcEIsZUFBZSxDQUFFUSxXQUFXLEdBQUcsQ0FBQyxDQUFFLEdBQUcsQ0FBQztnQkFDdENSLGVBQWUsQ0FBRVEsV0FBVyxHQUFHLENBQUMsQ0FBRSxHQUFHLENBQUM7Z0JBQ3RDUixlQUFlLENBQUVRLFdBQVcsR0FBRyxDQUFDLENBQUUsR0FBRyxDQUFDO2dCQUN0Q1IsZUFBZSxDQUFFUSxXQUFXLEdBQUcsQ0FBQyxDQUFFLEdBQUcsQ0FBQztjQUN4QyxDQUFDLE1BQ0k7Z0JBQ0hSLGVBQWUsQ0FBRVEsV0FBVyxHQUFHLENBQUMsQ0FBRSxHQUFHaEMsSUFBSSxDQUFDd0MsS0FBSyxDQUFFeEMsSUFBSSxDQUFDNkMsR0FBRyxDQUFFSixzQkFBc0IsR0FBR0csV0FBVyxFQUFFbEcsYUFBYyxDQUFFLENBQUM7Z0JBQ2xIOEUsZUFBZSxDQUFFUSxXQUFXLEdBQUcsQ0FBQyxDQUFFLEdBQUdoQyxJQUFJLENBQUN3QyxLQUFLLENBQUV4QyxJQUFJLENBQUM2QyxHQUFHLENBQUVILHdCQUF3QixHQUFHRSxXQUFXLEVBQUVsRyxhQUFjLENBQUUsQ0FBQztnQkFDcEg4RSxlQUFlLENBQUVRLFdBQVcsR0FBRyxDQUFDLENBQUUsR0FBR2hDLElBQUksQ0FBQ3dDLEtBQUssQ0FBRXhDLElBQUksQ0FBQzZDLEdBQUcsQ0FBRUYsdUJBQXVCLEdBQUdDLFdBQVcsRUFBRWxHLGFBQWMsQ0FBRSxDQUFDO2dCQUNuSDhFLGVBQWUsQ0FBRVEsV0FBVyxHQUFHLENBQUMsQ0FBRSxHQUFHaEMsSUFBSSxDQUFDd0MsS0FBSyxDQUFFeEMsSUFBSSxDQUFDNkMsR0FBRyxDQUFFRCxXQUFXLEdBQUdsQix5QkFBeUIsRUFBRWhGLGFBQWMsQ0FBRSxDQUFDO2NBQ3ZIO1lBQ0Y7VUFDRjtRQUNGO01BQ0Y7O01BRUE7TUFDQSxNQUFNaUMsT0FBTyxHQUFHQyxNQUFNLENBQUN3QyxVQUFVLENBQUUsSUFBSyxDQUFFO01BQzFDLE1BQU0wQixTQUFTLEdBQUduRSxPQUFPLENBQUNvRSxlQUFlLENBQUU1RixXQUFXLEVBQUVDLFlBQWEsQ0FBQztNQUN0RTBGLFNBQVMsQ0FBQ0UsSUFBSSxDQUFDQyxHQUFHLENBQUV6QixlQUFnQixDQUFDO01BQ3JDN0MsT0FBTyxDQUFDdUUsWUFBWSxDQUFFSixTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztNQUV2Q3hDLE1BQU0sQ0FBQzZDLE9BQU8sQ0FBQyxDQUFDO0lBQ2xCO0lBRUEsT0FBT3ZFLE1BQU07RUFDZjtFQUVRRyxxQkFBcUJBLENBQUEsRUFBUztJQUNwQyxJQUFLLENBQUMsSUFBSSxDQUFDTCxpQkFBaUIsRUFBRztNQUM3QixJQUFJLENBQUNBLGlCQUFpQixHQUFHLElBQUl0Qyx3QkFBd0IsQ0FBQyxDQUFDO0lBQ3pEO0lBQ0EsSUFBSSxDQUFDc0MsaUJBQWlCLENBQUMwRSxJQUFJLENBQUMsQ0FBQztFQUMvQjs7RUFFQTtBQUNGO0FBQ0E7RUFDVUMsMkJBQTJCQSxDQUFFQyxXQUFvQixFQUFvQjtJQUMzRXpELE1BQU0sSUFBSUEsTUFBTSxDQUFFeUQsV0FBVyxJQUFJQSxXQUFXLENBQUNDLFFBQVEsQ0FBQyxDQUFFLENBQUM7O0lBRXpEO0lBQ0EsTUFBTUMsSUFBSSxHQUFHLENBQUMsR0FBR0YsV0FBVyxDQUFDMUIsQ0FBQyxHQUFHLElBQUksQ0FBQ3pFLFdBQVcsR0FBRyxDQUFDO0lBQ3JELE1BQU1zRyxJQUFJLEdBQUcsQ0FBQyxJQUFLLENBQUMsR0FBS0gsV0FBVyxDQUFDeEIsQ0FBQyxHQUFHLElBQUksQ0FBQzFFLFlBQWMsQ0FBRSxHQUFHLENBQUM7SUFFbEUsTUFBTXNHLFVBQVUsR0FBRyxJQUFJcEcsS0FBSyxDQUFDcEIsT0FBTyxDQUFFc0gsSUFBSSxFQUFFQyxJQUFJLEVBQUUsQ0FBRSxDQUFDO0lBQ3JELE1BQU1FLFNBQVMsR0FBRyxJQUFJckcsS0FBSyxDQUFDc0csU0FBUyxDQUFDLENBQUM7SUFDdkNELFNBQVMsQ0FBQ0UsYUFBYSxDQUFFSCxVQUFVLEVBQUUsSUFBSSxDQUFDbEcsV0FBWSxDQUFDO0lBQ3ZELE9BQU9tRyxTQUFTO0VBQ2xCOztFQUVBO0FBQ0Y7QUFDQTtFQUNTRyxZQUFZQSxDQUFFQyxLQUFjLEVBQVk7SUFDN0MsTUFBTUMsVUFBVSxHQUFHekgsVUFBVSxDQUFDaUQsYUFBYSxDQUFFdUUsS0FBTSxDQUFDO0lBQ3BEQyxVQUFVLENBQUNDLE9BQU8sQ0FBRSxJQUFJLENBQUN6RyxXQUFZLENBQUMsQ0FBQyxDQUFDOztJQUV4QztJQUNBO0lBQ0EsSUFBSyxDQUFDK0YsUUFBUSxDQUFFUyxVQUFVLENBQUNwQyxDQUFFLENBQUMsRUFBRztNQUMvQm9DLFVBQVUsQ0FBQ3BDLENBQUMsR0FBRyxDQUFDO0lBQ2xCO0lBQ0EsSUFBSyxDQUFDMkIsUUFBUSxDQUFFUyxVQUFVLENBQUNsQyxDQUFFLENBQUMsRUFBRztNQUMvQmtDLFVBQVUsQ0FBQ2xDLENBQUMsR0FBRyxDQUFDO0lBQ2xCO0lBRUEsT0FBTyxJQUFJN0YsT0FBTyxDQUNoQixDQUFFK0gsVUFBVSxDQUFDcEMsQ0FBQyxHQUFHLENBQUMsSUFBSyxJQUFJLENBQUN6RSxXQUFXLEdBQUcsQ0FBQyxFQUMzQyxDQUFFLENBQUM2RyxVQUFVLENBQUNsQyxDQUFDLEdBQUcsQ0FBQyxJQUFLLElBQUksQ0FBQzFFLFlBQVksR0FBRyxDQUM5QyxDQUFDO0VBQ0g7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDUzhHLHFCQUFxQkEsQ0FBRVosV0FBb0IsRUFBUztJQUN6RCxNQUFNYSxRQUFRLEdBQUcsSUFBSSxDQUFDZCwyQkFBMkIsQ0FBRUMsV0FBWSxDQUFDLENBQUNjLEdBQUc7SUFDcEUsT0FBTyxJQUFJcEksSUFBSSxDQUFFTyxVQUFVLENBQUM4SCxhQUFhLENBQUVGLFFBQVEsQ0FBQ0csTUFBTyxDQUFDLEVBQUUvSCxVQUFVLENBQUM4SCxhQUFhLENBQUVGLFFBQVEsQ0FBQ0ksU0FBVSxDQUFDLENBQUNDLFNBQVMsQ0FBQyxDQUFFLENBQUM7RUFDNUg7RUFFT0MsYUFBYUEsQ0FBRXZFLEtBQWEsRUFBRUMsTUFBYyxFQUFTO0lBQzFETixNQUFNLElBQUlBLE1BQU0sQ0FBRUssS0FBSyxHQUFHLENBQUMsS0FBSyxDQUFFLENBQUM7SUFDbkNMLE1BQU0sSUFBSUEsTUFBTSxDQUFFTSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUUsQ0FBQztJQUVwQyxJQUFJLENBQUNoRCxXQUFXLEdBQUcrQyxLQUFLO0lBQ3hCLElBQUksQ0FBQzlDLFlBQVksR0FBRytDLE1BQU07SUFFMUIsSUFBSSxDQUFDM0MsV0FBVyxDQUFDa0gsc0JBQXNCLENBQUMsQ0FBQztJQUN6QyxJQUFJLENBQUM5RyxhQUFhLElBQUksSUFBSSxDQUFDQSxhQUFhLENBQUMrRyxPQUFPLENBQUUsSUFBSSxDQUFDeEgsV0FBVyxFQUFFLElBQUksQ0FBQ0MsWUFBYSxDQUFDO0lBRXZGLElBQUksQ0FBQ3FDLHdCQUF3QixDQUFDbUYsSUFBSSxDQUFDLENBQUM7RUFDdEM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNTQyxnQkFBZ0JBLENBQUVDLFlBQXFCLEVBQVM7SUFDckRqRixNQUFNLElBQUlBLE1BQU0sQ0FBRUcsSUFBSSxDQUFDK0UsR0FBRyxDQUFFLElBQUksQ0FBQ3ZILFdBQVcsQ0FBQ3dILE1BQU0sR0FBR0YsWUFBWSxDQUFDNUUsS0FBSyxHQUFHNEUsWUFBWSxDQUFDM0UsTUFBTyxDQUFDLEdBQUcsSUFBSSxFQUFFLHlDQUEwQyxDQUFDOztJQUVwSjtJQUNBO0lBQ0E7O0lBRUE7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBOztJQUVBO0lBQ0E7SUFDQSxNQUFNOEUsVUFBVSxHQUFHLElBQUksQ0FBQ3pILFdBQVcsQ0FBQ0UsSUFBSSxHQUFHc0MsSUFBSSxDQUFDa0YsR0FBRyxDQUFJbEYsSUFBSSxDQUFDbUYsRUFBRSxHQUFHLEdBQUcsR0FBSyxJQUFJLENBQUMzSCxXQUFXLENBQUM0SCxHQUFJLENBQUMsR0FBRyxJQUFJLENBQUM1SCxXQUFXLENBQUM2SCxJQUFJO0lBQ3ZILE1BQU1DLFNBQVMsR0FBRyxJQUFJLENBQUM5SCxXQUFXLENBQUN3SCxNQUFNLEdBQUdDLFVBQVU7O0lBRXREO0lBQ0EsTUFBTU0sY0FBYyxHQUFHLElBQUl4SixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUNvQixXQUFXLEVBQUUsSUFBSSxDQUFDQyxZQUFhLENBQUMsQ0FBQ29JLE9BQU8sQ0FBRVYsWUFBWSxDQUFDVyxNQUFNLENBQUNDLE9BQU8sQ0FBQyxDQUFFLENBQUM7O0lBRXhIO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxNQUFNQyxpQkFBaUIsR0FBR2IsWUFBWSxDQUFDNUUsS0FBSztJQUM1QyxNQUFNMEYsa0JBQWtCLEdBQUdkLFlBQVksQ0FBQzNFLE1BQU07SUFFOUMsTUFBTTBGLE9BQU8sR0FBRyxDQUFDUCxTQUFTO0lBQzFCLE1BQU1RLE1BQU0sR0FBR2IsVUFBVTs7SUFFekI7SUFDQSxNQUFNYyxPQUFPLEdBQUdSLGNBQWMsQ0FBQ1MsSUFBSSxHQUFHVixTQUFTLElBQUssR0FBRyxHQUFHUixZQUFZLENBQUM1RSxLQUFLLENBQUU7O0lBRTlFO0lBQ0EsTUFBTStGLE1BQU0sR0FBRyxDQUFDVixjQUFjLENBQUNXLEdBQUcsR0FBR2pCLFVBQVUsSUFBSyxHQUFHLEdBQUdILFlBQVksQ0FBQzNFLE1BQU0sQ0FBRTs7SUFFL0U7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBLE1BQU1nRyxPQUFPLEdBQUcsQ0FBRUosT0FBTyxHQUFHRixPQUFPLElBQUtGLGlCQUFpQixJQUFLLENBQUMsR0FBR0wsU0FBUyxDQUFFOztJQUU3RTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0EsTUFBTWMsT0FBTyxHQUFHLENBQUVOLE1BQU0sR0FBR0csTUFBTSxJQUFLTCxrQkFBa0IsSUFBSyxDQUFDLEdBQUdYLFVBQVUsQ0FBRTtJQUU3RSxJQUFJLENBQUN6SCxXQUFXLENBQUM2SSxhQUFhLENBQUVWLGlCQUFpQixFQUFFQyxrQkFBa0IsRUFBRU8sT0FBTyxFQUFFQyxPQUFPLEVBQUUsSUFBSSxDQUFDakosV0FBVyxFQUFFLElBQUksQ0FBQ0MsWUFBYSxDQUFDOztJQUU5SDtJQUNBLElBQUksQ0FBQ0ksV0FBVyxDQUFDd0gsTUFBTSxHQUFHRixZQUFZLENBQUM1RSxLQUFLLEdBQUc0RSxZQUFZLENBQUMzRSxNQUFNOztJQUVsRTtJQUNBLElBQUksQ0FBQzNDLFdBQVcsQ0FBQ2tILHNCQUFzQixDQUFDLENBQUM7RUFDM0M7RUFFQSxJQUFXeEUsS0FBS0EsQ0FBQSxFQUFXO0lBQ3pCLE9BQU8sSUFBSSxDQUFDL0MsV0FBVztFQUN6QjtFQUVBLElBQVdnRCxNQUFNQSxDQUFBLEVBQVc7SUFDMUIsT0FBTyxJQUFJLENBQUMvQyxZQUFZO0VBQzFCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDUzBELE1BQU1BLENBQUVSLE1BQTJDLEVBQVM7SUFDakU7SUFDQSxJQUFLLElBQUksQ0FBQzFDLGFBQWEsRUFBRztNQUN4QixJQUFJLENBQUNBLGFBQWEsQ0FBQzBJLGVBQWUsQ0FBRWhHLE1BQU0sSUFBSSxJQUFLLENBQUM7TUFDcEQsSUFBSSxDQUFDMUMsYUFBYSxDQUFDa0QsTUFBTSxDQUFFLElBQUksQ0FBQ3pELFVBQVUsRUFBRSxJQUFJLENBQUNHLFdBQVksQ0FBQztNQUM5RCxJQUFJLENBQUNJLGFBQWEsQ0FBQzJJLFNBQVMsR0FBRyxLQUFLO0lBQ3RDO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0VBQ1NwRCxPQUFPQSxDQUFBLEVBQVM7SUFDckIsSUFBSSxDQUFDdkYsYUFBYSxJQUFJLElBQUksQ0FBQ0EsYUFBYSxDQUFDdUYsT0FBTyxDQUFDLENBQUM7O0lBRWxEO0lBQ0EsSUFBSSxDQUFDOUYsVUFBVSxDQUFDOEYsT0FBTyxDQUFDLENBQUM7SUFDekIsSUFBSSxDQUFDcEcsa0JBQWtCLENBQUN5SixNQUFNLENBQUUsSUFBSSxDQUFDdkgsYUFBYyxDQUFDO0VBQ3REOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQWN3SCxtQkFBbUJBLENBQUVyQixHQUFXLEVBQUVqSSxXQUFtQixFQUFFQyxZQUFvQixFQUFFc0osV0FBbUIsRUFBRUMsWUFBb0IsRUFBVztJQUM3SSxNQUFNQyxFQUFFLEdBQUd6SixXQUFXLEdBQUd1SixXQUFXO0lBQ3BDLE1BQU1HLEVBQUUsR0FBR3pKLFlBQVksR0FBR3VKLFlBQVk7SUFFdEMsT0FBT0MsRUFBRSxHQUFHQyxFQUFFLEdBQUd6QixHQUFHLEdBQUdwRixJQUFJLENBQUM4RyxJQUFJLENBQUU5RyxJQUFJLENBQUNrRixHQUFHLENBQUVFLEdBQUcsR0FBR3BGLElBQUksQ0FBQ21GLEVBQUUsR0FBRyxHQUFJLENBQUMsR0FBRzBCLEVBQUUsR0FBR0QsRUFBRyxDQUFDLEdBQUcsR0FBRyxHQUFHNUcsSUFBSSxDQUFDbUYsRUFBRTtFQUMvRjtBQUNGO0FBRUEzSSxNQUFNLENBQUN1SyxRQUFRLENBQUUsWUFBWSxFQUFFcEssVUFBVyxDQUFDIn0=