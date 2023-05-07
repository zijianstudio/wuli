// Copyright 2014-2022, University of Colorado Boulder

/**
 * View for the electric potential Grid Node that displays a two dimensional grid of rectangles that represent the
 * electric potential field, rendering in WebGL.
 *
 * Relies on storing floating-point data for current potential in a texture, and displays this texture with the needed
 * color mapping. In order to update, we actually have two textures that alternate being the previous texture
 * (reference for before a change) and the current texture (rendered into, combines the last texture and any changes).
 *
 * Every frame, we do one "compute" draw call per changed particle (adding the deltas in potential for its movement/
 * addition/removal), and then one "display" draw call that will render the potential data into our visual display.
 * The compute draws switch back and forth between two textures with a framebuffer, e.g.:
 * - Textures A and B are blank.
 * - We render ( A + changes for particle change 1 ) into B
 * - We render ( B + changes for particle change 2 ) into A
 * - We render ( A + changes for particle change 3 ) into B
 * - We render ( B + changes for particle change 4 ) into A
 * - Display colorized contents of A (it was the last one with all data)
 * - We render ( A + changes for particle change 5 ) into B
 * - Display colorized contents of B (it was the last one with all data)
 * - etc.
 *
 * Additionally, we request the WebGL extension OES_texture_float so that we can make these textures store floating-point
 * values instead of unsigned integers.
 *
 * Things are slightly complicated by the fact that the framebuffer textures need to have power-of-2 dimensions, so our
 * textures are frequently bigger (and only part of the texture is shown). We still keep things 1-to-1 as far as pixels
 * are concerned.
 *
 * @author Martin Veillette (Berea College)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ObservableArrayDef from '../../../../axon/js/ObservableArrayDef.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import { ShaderProgram, Utils, WebGLNode } from '../../../../scenery/js/imports.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsColors from '../ChargesAndFieldsColors.js';
import ChargeTracker from './ChargeTracker.js';

// integer constants for our shader
const TYPE_ADD = 0;
const TYPE_REMOVE = 1;
const TYPE_MOVE = 2;

// persistent matrices/arrays so we minimize the number of created objects during rendering
const scratchProjectionMatrix = new Matrix3();
const scratchInverseMatrix = new Matrix3();
const scratchFloatArray = new Float32Array(9);
class ElectricPotentialWebGLNode extends WebGLNode {
  /**
   * @param {ObservableArrayDef.<ChargedParticle>} chargedParticles - only chargedParticles that active are in this array
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<boolean>} isVisibleProperty
   */
  constructor(chargedParticles, modelViewTransform, isVisibleProperty) {
    assert && assert(ObservableArrayDef.isObservableArray(chargedParticles), 'invalid chargedParticles');
    super(ElectricPotentialPainter, {
      layerSplit: true // ensure we're on our own layer
    });

    this.chargedParticles = chargedParticles;
    this.modelViewTransform = modelViewTransform;
    this.isVisibleProperty = isVisibleProperty;

    // Invalidate paint on a bunch of changes
    const invalidateSelfListener = this.invalidatePaint.bind(this);
    ChargesAndFieldsColors.electricPotentialGridZeroProperty.link(invalidateSelfListener);
    ChargesAndFieldsColors.electricPotentialGridSaturationPositiveProperty.link(invalidateSelfListener);
    ChargesAndFieldsColors.electricPotentialGridSaturationNegativeProperty.link(invalidateSelfListener);
    isVisibleProperty.link(invalidateSelfListener); // visibility change

    // particle added
    chargedParticles.addItemAddedListener(particle => particle.positionProperty.link(invalidateSelfListener));

    // particle removed
    chargedParticles.addItemRemovedListener(particle => {
      invalidateSelfListener();
      particle.positionProperty.unlink(invalidateSelfListener);
    });

    // visibility change
    this.disposeElectricPotentialWebGLNode = () => isVisibleProperty.unlink(invalidateSelfListener);
  }

  /**
   * Detection for support, because iOS Safari 8 doesn't support rendering to a float texture, AND doesn't support
   * classic detection via an extension (OES_texture_float works).
   * @public
   */
  static supportsRenderingToFloatTexture() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    gl.getExtension('OES_texture_float');
    const framebuffer = gl.createFramebuffer();
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 128, 128, 0, gl.RGB, gl.FLOAT, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  }

  /**
   * Releases references
   * @public
   */
  dispose() {
    this.disposeElectricPotentialWebGLNode();
  }
}
chargesAndFields.register('ElectricPotentialWebGLNode', ElectricPotentialWebGLNode);
class ElectricPotentialPainter {
  /**
   * @param {WebGLRenderingContext} gl
   * @param {WaveWebGLNode} node
   */
  constructor(gl, node) {
    this.gl = gl;
    this.node = node;
    this.chargeTracker = new ChargeTracker(node.chargedParticles);

    // we will need this extension
    gl.getExtension('OES_texture_float');

    // the framebuffer we'll be drawing into (with either of the two textures)
    this.framebuffer = gl.createFramebuffer();

    // the two textures we'll be switching between
    this.currentTexture = gl.createTexture();
    this.previousTexture = gl.createTexture();
    this.sizeTexture(this.currentTexture);
    this.sizeTexture(this.previousTexture);

    // shader meant to clear a texture (renders solid black everywhere)
    this.clearShaderProgram = new ShaderProgram(gl, [
    // vertex shader
    'attribute vec3 aPosition;', 'void main() {', '  gl_Position = vec4( aPosition, 1 );', '}'].join('\n'), [
    // fragment shader
    'precision mediump float;', 'void main() {', '  gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );', '}'].join('\n'), {
      attributes: ['aPosition'],
      uniforms: []
    });

    // shader for the "compute" step, that adds a texture lookup + change to the other texture
    this.computeShaderProgram = new ShaderProgram(gl, [
    // vertex shader
    'attribute vec3 aPosition;',
    // vertex attribute
    'varying vec2 vPosition;', 'void main() {', '  vPosition = aPosition.xy;', '  gl_Position = vec4( aPosition, 1 );', '}'].join('\n'), [
    // fragment shader
    'precision mediump float;', 'varying vec2 vPosition;', 'uniform sampler2D uTexture;',
    // our other texture (that we read from)
    'uniform float uCharge;', 'uniform vec2 uOldPosition;', 'uniform vec2 uNewPosition;', 'uniform int uType;',
    // see types at the top of the file
    'uniform vec2 uCanvasSize;',
    // dimensions of the Canvas
    'uniform vec2 uTextureSize;',
    // dimensions of the texture that covers the Canvas
    'uniform mat3 uMatrixInverse;',
    // matrix to transform from normalized-device-coordinates to the model
    'const float kConstant = 9.0;', 'void main() {',
    // homogeneous model-view transformation
    '  vec2 modelPosition = ( uMatrixInverse * vec3( vPosition, 1 ) ).xy;',
    // look up the value before our change (vPosition NDC => [0,1] => scaled to match the part of the texture)
    '  float oldValue = texture2D( uTexture, ( vPosition * 0.5 + 0.5 ) * uCanvasSize / uTextureSize ).x;', '  float change = 0.0;',
    // if applicable, add the particle's contribution in the new position
    `  if ( uType == ${TYPE_ADD} || uType == ${TYPE_MOVE} ) {`, '    change += uCharge * kConstant / length( modelPosition - uNewPosition );', '  }',
    // if applicable, remove the particle's contribution in the old position
    `  if ( uType == ${TYPE_REMOVE} || uType == ${TYPE_MOVE} ) {`, '    change -= uCharge * kConstant / length( modelPosition - uOldPosition );', '  }',
    // stuff the result in the x coordinate
    '  gl_FragColor = vec4( oldValue + change, 0.0, 0.0, 1.0 );', '}'].join('\n'), {
      attributes: ['aPosition'],
      uniforms: ['uTexture', 'uCanvasSize', 'uTextureSize', 'uCharge', 'uOldPosition', 'uNewPosition', 'uType', 'uMatrixInverse']
    });

    // shader for the "display" step, that colorizes the latest potential data
    this.displayShaderProgram = new ShaderProgram(gl, [
    // vertex shader
    'attribute vec3 aPosition;',
    // vertex attribute
    'varying vec2 texCoord;', 'void main() {', '  texCoord = aPosition.xy * 0.5 + 0.5;', '  gl_Position = vec4( aPosition, 1 );', '}'].join('\n'), [
    // fragment shader
    'precision mediump float;', 'varying vec2 texCoord;', 'uniform sampler2D uTexture;',
    // the texture that contains our floating-point potential data
    'uniform vec2 uScale;',
    // how to scale our texture lookup
    'uniform vec3 uZeroColor;', 'uniform vec3 uPositiveColor;', 'uniform vec3 uNegativeColor;', 'void main() {', '  float value = texture2D( uTexture, texCoord * uScale ).x;',
    // rules to color pulled from ChangesAndFieldsScreenView
    '  if ( value > 0.0 ) {', '    value = min( value / 40.0, 1.0 );',
    // clamp to [0,1]
    '    gl_FragColor = vec4( uPositiveColor * value + uZeroColor * ( 1.0 - value ), 1.0 );', '  } else {', '    value = min( -value / 40.0, 1.0 );',
    // clamp to [0,1]
    '    gl_FragColor = vec4( uNegativeColor * value + uZeroColor * ( 1.0 - value ), 1.0 );', '  }', '}'].join('\n'), {
      attributes: ['aPosition'],
      uniforms: ['uTexture', 'uScale', 'uZeroColor', 'uPositiveColor', 'uNegativeColor']
    });

    // we only need one vertex buffer with the same contents for all three shaders!
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, +1, +1, -1, +1, +1]), gl.STATIC_DRAW);
  }

  /**
   * Resizes a texture to be able to cover the canvas area, and sets drawable properties for the size
   * @private
   *
   * @param {WebGLTexture} texture
   */
  sizeTexture(texture) {
    const gl = this.gl;
    const width = gl.canvas.width;
    const height = gl.canvas.height;
    const powerOf2Width = Utils.toPowerOf2(width);
    const powerOf2Height = Utils.toPowerOf2(height);
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.textureWidth = powerOf2Width;
    this.textureHeight = powerOf2Height;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, powerOf2Width, powerOf2Height, 0, gl.RGB, gl.FLOAT, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  /**
   * @public
   *
   * @param {Matrix3} modelViewMatrix
   * @param {Matrix3} projectionMatrix
   * @returns {number} - WebGLNode.PAINTED_NOTHING or WebGLNode.PAINTED_SOMETHING.
   */
  paint(modelViewMatrix, projectionMatrix) {
    const gl = this.gl;
    const clearShaderProgram = this.clearShaderProgram;
    const computeShaderProgram = this.computeShaderProgram;
    const displayShaderProgram = this.displayShaderProgram;

    // If we're not visible, clear everything and exit. Our layerSplit above guarantees this won't clear other
    // node's renderings.
    if (!this.node.isVisibleProperty.get()) {
      return WebGLNode.PAINTED_NOTHING;
    }

    // If our dimensions changed, resize our textures and reinitialize all of our potentials.
    if (this.canvasWidth !== gl.canvas.width || this.canvasHeight !== gl.canvas.height) {
      this.sizeTexture(this.currentTexture);
      this.sizeTexture(this.previousTexture);
      this.chargeTracker.rebuild();

      // clears the buffer to be used
      clearShaderProgram.use();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.previousTexture, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.vertexAttribPointer(computeShaderProgram.attributeLocations.aPosition, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      clearShaderProgram.unuse();
    }

    /*---------------------------------------------------------------------------*
     * Compute steps
     *----------------------------------------------------------------------------*/

    computeShaderProgram.use();
    gl.uniform2f(computeShaderProgram.uniformLocations.uCanvasSize, this.canvasWidth, this.canvasHeight);
    gl.uniform2f(computeShaderProgram.uniformLocations.uTextureSize, this.textureWidth, this.textureHeight);
    const matrixInverse = scratchInverseMatrix;
    const projectionMatrixInverse = scratchProjectionMatrix.set(projectionMatrix).invert();
    matrixInverse.set(this.node.modelViewTransform.getInverse()).multiplyMatrix(modelViewMatrix.inverted().multiplyMatrix(projectionMatrixInverse));
    gl.uniformMatrix3fv(computeShaderProgram.uniformLocations.uMatrixInverse, false, matrixInverse.copyToArray(scratchFloatArray));

    // do a draw call for each particle change
    for (let i = 0; i < this.chargeTracker.queue.length; i++) {
      const item = this.chargeTracker.queue[i];

      // make future rendering output into currentTexture
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.currentTexture, 0);

      // use our vertex buffer to say where to render (two triangles covering the screen)
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.vertexAttribPointer(computeShaderProgram.attributeLocations.aPosition, 2, gl.FLOAT, false, 0, 0);

      // make previous data from the other texture available to the shader
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.previousTexture);
      gl.uniform1i(computeShaderProgram.uniformLocations.uTexture, 0);

      // make the positions available to the shader
      gl.uniform1f(computeShaderProgram.uniformLocations.uCharge, item.charge);
      if (item.oldPosition) {
        gl.uniform2f(computeShaderProgram.uniformLocations.uOldPosition, item.oldPosition.x, item.oldPosition.y);
      } else {
        gl.uniform2f(computeShaderProgram.uniformLocations.uOldPosition, 0, 0);
      }
      if (item.newPosition) {
        gl.uniform2f(computeShaderProgram.uniformLocations.uNewPosition, item.newPosition.x, item.newPosition.y);
      } else {
        gl.uniform2f(computeShaderProgram.uniformLocations.uNewPosition, 0, 0);
      }

      // tell the shader the type of change we are making
      const type = item.oldPosition ? item.newPosition ? TYPE_MOVE : TYPE_REMOVE : TYPE_ADD;
      gl.uniform1i(computeShaderProgram.uniformLocations.uType, type);
      // console.log( type );

      // actually draw it
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      // make future rendering output go into our visual display
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      // swap buffers (since currentTexture now has the most up-to-date info, we'll want to use it for reading)
      const tmp = this.currentTexture;
      this.currentTexture = this.previousTexture;
      this.previousTexture = tmp;
    }
    computeShaderProgram.unuse();

    /*---------------------------------------------------------------------------*
     * Display step
     *----------------------------------------------------------------------------*/

    displayShaderProgram.use();

    // tell the shader our colors / scale
    const zeroColor = ChargesAndFieldsColors.electricPotentialGridZeroProperty.get();
    const positiveColor = ChargesAndFieldsColors.electricPotentialGridSaturationPositiveProperty.get();
    const negativeColor = ChargesAndFieldsColors.electricPotentialGridSaturationNegativeProperty.get();
    gl.uniform3f(displayShaderProgram.uniformLocations.uZeroColor, zeroColor.red / 255, zeroColor.green / 255, zeroColor.blue / 255);
    gl.uniform3f(displayShaderProgram.uniformLocations.uPositiveColor, positiveColor.red / 255, positiveColor.green / 255, positiveColor.blue / 255);
    gl.uniform3f(displayShaderProgram.uniformLocations.uNegativeColor, negativeColor.red / 255, negativeColor.green / 255, negativeColor.blue / 255);
    gl.uniform2f(displayShaderProgram.uniformLocations.uScale, this.canvasWidth / this.textureWidth, this.canvasHeight / this.textureHeight);

    // data to draw 2 triangles that cover the screen
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(displayShaderProgram.attributeLocations.aPosition, 2, gl.FLOAT, false, 0, 0);

    // read from the most up-to-date texture (our potential data)
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.previousTexture);
    gl.uniform1i(displayShaderProgram.uniformLocations.uTexture, 0);

    // actually draw it
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // release the texture
    gl.bindTexture(gl.TEXTURE_2D, null);
    displayShaderProgram.unuse();
    this.chargeTracker.clear();
    return WebGLNode.PAINTED_SOMETHING;
  }

  /**
   * Releases references
   * @public
   */
  dispose() {
    const gl = this.gl;

    // clears all of our resources
    this.computeShaderProgram.dispose();
    this.displayShaderProgram.dispose();
    this.clearShaderProgram.dispose();
    gl.deleteTexture(this.currentTexture);
    gl.deleteTexture(this.previousTexture);
    gl.deleteBuffer(this.vertexBuffer);
    gl.deleteFramebuffer(this.framebuffer);
    this.computeShaderProgram = null;
    this.displayShaderProgram = null;
    this.clearShaderProgram = null;
    this.chargeTracker.dispose();
  }
}
export default ElectricPotentialWebGLNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYnNlcnZhYmxlQXJyYXlEZWYiLCJNYXRyaXgzIiwiU2hhZGVyUHJvZ3JhbSIsIlV0aWxzIiwiV2ViR0xOb2RlIiwiY2hhcmdlc0FuZEZpZWxkcyIsIkNoYXJnZXNBbmRGaWVsZHNDb2xvcnMiLCJDaGFyZ2VUcmFja2VyIiwiVFlQRV9BREQiLCJUWVBFX1JFTU9WRSIsIlRZUEVfTU9WRSIsInNjcmF0Y2hQcm9qZWN0aW9uTWF0cml4Iiwic2NyYXRjaEludmVyc2VNYXRyaXgiLCJzY3JhdGNoRmxvYXRBcnJheSIsIkZsb2F0MzJBcnJheSIsIkVsZWN0cmljUG90ZW50aWFsV2ViR0xOb2RlIiwiY29uc3RydWN0b3IiLCJjaGFyZ2VkUGFydGljbGVzIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiaXNWaXNpYmxlUHJvcGVydHkiLCJhc3NlcnQiLCJpc09ic2VydmFibGVBcnJheSIsIkVsZWN0cmljUG90ZW50aWFsUGFpbnRlciIsImxheWVyU3BsaXQiLCJpbnZhbGlkYXRlU2VsZkxpc3RlbmVyIiwiaW52YWxpZGF0ZVBhaW50IiwiYmluZCIsImVsZWN0cmljUG90ZW50aWFsR3JpZFplcm9Qcm9wZXJ0eSIsImxpbmsiLCJlbGVjdHJpY1BvdGVudGlhbEdyaWRTYXR1cmF0aW9uUG9zaXRpdmVQcm9wZXJ0eSIsImVsZWN0cmljUG90ZW50aWFsR3JpZFNhdHVyYXRpb25OZWdhdGl2ZVByb3BlcnR5IiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJwYXJ0aWNsZSIsInBvc2l0aW9uUHJvcGVydHkiLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwidW5saW5rIiwiZGlzcG9zZUVsZWN0cmljUG90ZW50aWFsV2ViR0xOb2RlIiwic3VwcG9ydHNSZW5kZXJpbmdUb0Zsb2F0VGV4dHVyZSIsImNhbnZhcyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImdsIiwiZ2V0Q29udGV4dCIsImdldEV4dGVuc2lvbiIsImZyYW1lYnVmZmVyIiwiY3JlYXRlRnJhbWVidWZmZXIiLCJ0ZXh0dXJlIiwiY3JlYXRlVGV4dHVyZSIsImJpbmRUZXh0dXJlIiwiVEVYVFVSRV8yRCIsInRleFBhcmFtZXRlcmkiLCJURVhUVVJFX01BR19GSUxURVIiLCJORUFSRVNUIiwiVEVYVFVSRV9NSU5fRklMVEVSIiwidGV4SW1hZ2UyRCIsIlJHQiIsIkZMT0FUIiwiYmluZEZyYW1lYnVmZmVyIiwiRlJBTUVCVUZGRVIiLCJmcmFtZWJ1ZmZlclRleHR1cmUyRCIsIkNPTE9SX0FUVEFDSE1FTlQwIiwiY2hlY2tGcmFtZWJ1ZmZlclN0YXR1cyIsIkZSQU1FQlVGRkVSX0NPTVBMRVRFIiwiZGlzcG9zZSIsInJlZ2lzdGVyIiwibm9kZSIsImNoYXJnZVRyYWNrZXIiLCJjdXJyZW50VGV4dHVyZSIsInByZXZpb3VzVGV4dHVyZSIsInNpemVUZXh0dXJlIiwiY2xlYXJTaGFkZXJQcm9ncmFtIiwiam9pbiIsImF0dHJpYnV0ZXMiLCJ1bmlmb3JtcyIsImNvbXB1dGVTaGFkZXJQcm9ncmFtIiwiZGlzcGxheVNoYWRlclByb2dyYW0iLCJ2ZXJ0ZXhCdWZmZXIiLCJjcmVhdGVCdWZmZXIiLCJiaW5kQnVmZmVyIiwiQVJSQVlfQlVGRkVSIiwiYnVmZmVyRGF0YSIsIlNUQVRJQ19EUkFXIiwid2lkdGgiLCJoZWlnaHQiLCJwb3dlck9mMldpZHRoIiwidG9Qb3dlck9mMiIsInBvd2VyT2YySGVpZ2h0IiwiY2FudmFzV2lkdGgiLCJjYW52YXNIZWlnaHQiLCJ0ZXh0dXJlV2lkdGgiLCJ0ZXh0dXJlSGVpZ2h0IiwicGFpbnQiLCJtb2RlbFZpZXdNYXRyaXgiLCJwcm9qZWN0aW9uTWF0cml4IiwiZ2V0IiwiUEFJTlRFRF9OT1RISU5HIiwicmVidWlsZCIsInVzZSIsInZlcnRleEF0dHJpYlBvaW50ZXIiLCJhdHRyaWJ1dGVMb2NhdGlvbnMiLCJhUG9zaXRpb24iLCJkcmF3QXJyYXlzIiwiVFJJQU5HTEVfU1RSSVAiLCJ1bnVzZSIsInVuaWZvcm0yZiIsInVuaWZvcm1Mb2NhdGlvbnMiLCJ1Q2FudmFzU2l6ZSIsInVUZXh0dXJlU2l6ZSIsIm1hdHJpeEludmVyc2UiLCJwcm9qZWN0aW9uTWF0cml4SW52ZXJzZSIsInNldCIsImludmVydCIsImdldEludmVyc2UiLCJtdWx0aXBseU1hdHJpeCIsImludmVydGVkIiwidW5pZm9ybU1hdHJpeDNmdiIsInVNYXRyaXhJbnZlcnNlIiwiY29weVRvQXJyYXkiLCJpIiwicXVldWUiLCJsZW5ndGgiLCJpdGVtIiwiYWN0aXZlVGV4dHVyZSIsIlRFWFRVUkUwIiwidW5pZm9ybTFpIiwidVRleHR1cmUiLCJ1bmlmb3JtMWYiLCJ1Q2hhcmdlIiwiY2hhcmdlIiwib2xkUG9zaXRpb24iLCJ1T2xkUG9zaXRpb24iLCJ4IiwieSIsIm5ld1Bvc2l0aW9uIiwidU5ld1Bvc2l0aW9uIiwidHlwZSIsInVUeXBlIiwidG1wIiwiemVyb0NvbG9yIiwicG9zaXRpdmVDb2xvciIsIm5lZ2F0aXZlQ29sb3IiLCJ1bmlmb3JtM2YiLCJ1WmVyb0NvbG9yIiwicmVkIiwiZ3JlZW4iLCJibHVlIiwidVBvc2l0aXZlQ29sb3IiLCJ1TmVnYXRpdmVDb2xvciIsInVTY2FsZSIsImNsZWFyIiwiUEFJTlRFRF9TT01FVEhJTkciLCJkZWxldGVUZXh0dXJlIiwiZGVsZXRlQnVmZmVyIiwiZGVsZXRlRnJhbWVidWZmZXIiXSwic291cmNlcyI6WyJFbGVjdHJpY1BvdGVudGlhbFdlYkdMTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciB0aGUgZWxlY3RyaWMgcG90ZW50aWFsIEdyaWQgTm9kZSB0aGF0IGRpc3BsYXlzIGEgdHdvIGRpbWVuc2lvbmFsIGdyaWQgb2YgcmVjdGFuZ2xlcyB0aGF0IHJlcHJlc2VudCB0aGVcclxuICogZWxlY3RyaWMgcG90ZW50aWFsIGZpZWxkLCByZW5kZXJpbmcgaW4gV2ViR0wuXHJcbiAqXHJcbiAqIFJlbGllcyBvbiBzdG9yaW5nIGZsb2F0aW5nLXBvaW50IGRhdGEgZm9yIGN1cnJlbnQgcG90ZW50aWFsIGluIGEgdGV4dHVyZSwgYW5kIGRpc3BsYXlzIHRoaXMgdGV4dHVyZSB3aXRoIHRoZSBuZWVkZWRcclxuICogY29sb3IgbWFwcGluZy4gSW4gb3JkZXIgdG8gdXBkYXRlLCB3ZSBhY3R1YWxseSBoYXZlIHR3byB0ZXh0dXJlcyB0aGF0IGFsdGVybmF0ZSBiZWluZyB0aGUgcHJldmlvdXMgdGV4dHVyZVxyXG4gKiAocmVmZXJlbmNlIGZvciBiZWZvcmUgYSBjaGFuZ2UpIGFuZCB0aGUgY3VycmVudCB0ZXh0dXJlIChyZW5kZXJlZCBpbnRvLCBjb21iaW5lcyB0aGUgbGFzdCB0ZXh0dXJlIGFuZCBhbnkgY2hhbmdlcykuXHJcbiAqXHJcbiAqIEV2ZXJ5IGZyYW1lLCB3ZSBkbyBvbmUgXCJjb21wdXRlXCIgZHJhdyBjYWxsIHBlciBjaGFuZ2VkIHBhcnRpY2xlIChhZGRpbmcgdGhlIGRlbHRhcyBpbiBwb3RlbnRpYWwgZm9yIGl0cyBtb3ZlbWVudC9cclxuICogYWRkaXRpb24vcmVtb3ZhbCksIGFuZCB0aGVuIG9uZSBcImRpc3BsYXlcIiBkcmF3IGNhbGwgdGhhdCB3aWxsIHJlbmRlciB0aGUgcG90ZW50aWFsIGRhdGEgaW50byBvdXIgdmlzdWFsIGRpc3BsYXkuXHJcbiAqIFRoZSBjb21wdXRlIGRyYXdzIHN3aXRjaCBiYWNrIGFuZCBmb3J0aCBiZXR3ZWVuIHR3byB0ZXh0dXJlcyB3aXRoIGEgZnJhbWVidWZmZXIsIGUuZy46XHJcbiAqIC0gVGV4dHVyZXMgQSBhbmQgQiBhcmUgYmxhbmsuXHJcbiAqIC0gV2UgcmVuZGVyICggQSArIGNoYW5nZXMgZm9yIHBhcnRpY2xlIGNoYW5nZSAxICkgaW50byBCXHJcbiAqIC0gV2UgcmVuZGVyICggQiArIGNoYW5nZXMgZm9yIHBhcnRpY2xlIGNoYW5nZSAyICkgaW50byBBXHJcbiAqIC0gV2UgcmVuZGVyICggQSArIGNoYW5nZXMgZm9yIHBhcnRpY2xlIGNoYW5nZSAzICkgaW50byBCXHJcbiAqIC0gV2UgcmVuZGVyICggQiArIGNoYW5nZXMgZm9yIHBhcnRpY2xlIGNoYW5nZSA0ICkgaW50byBBXHJcbiAqIC0gRGlzcGxheSBjb2xvcml6ZWQgY29udGVudHMgb2YgQSAoaXQgd2FzIHRoZSBsYXN0IG9uZSB3aXRoIGFsbCBkYXRhKVxyXG4gKiAtIFdlIHJlbmRlciAoIEEgKyBjaGFuZ2VzIGZvciBwYXJ0aWNsZSBjaGFuZ2UgNSApIGludG8gQlxyXG4gKiAtIERpc3BsYXkgY29sb3JpemVkIGNvbnRlbnRzIG9mIEIgKGl0IHdhcyB0aGUgbGFzdCBvbmUgd2l0aCBhbGwgZGF0YSlcclxuICogLSBldGMuXHJcbiAqXHJcbiAqIEFkZGl0aW9uYWxseSwgd2UgcmVxdWVzdCB0aGUgV2ViR0wgZXh0ZW5zaW9uIE9FU190ZXh0dXJlX2Zsb2F0IHNvIHRoYXQgd2UgY2FuIG1ha2UgdGhlc2UgdGV4dHVyZXMgc3RvcmUgZmxvYXRpbmctcG9pbnRcclxuICogdmFsdWVzIGluc3RlYWQgb2YgdW5zaWduZWQgaW50ZWdlcnMuXHJcbiAqXHJcbiAqIFRoaW5ncyBhcmUgc2xpZ2h0bHkgY29tcGxpY2F0ZWQgYnkgdGhlIGZhY3QgdGhhdCB0aGUgZnJhbWVidWZmZXIgdGV4dHVyZXMgbmVlZCB0byBoYXZlIHBvd2VyLW9mLTIgZGltZW5zaW9ucywgc28gb3VyXHJcbiAqIHRleHR1cmVzIGFyZSBmcmVxdWVudGx5IGJpZ2dlciAoYW5kIG9ubHkgcGFydCBvZiB0aGUgdGV4dHVyZSBpcyBzaG93bikuIFdlIHN0aWxsIGtlZXAgdGhpbmdzIDEtdG8tMSBhcyBmYXIgYXMgcGl4ZWxzXHJcbiAqIGFyZSBjb25jZXJuZWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgTWFydGluIFZlaWxsZXR0ZSAoQmVyZWEgQ29sbGVnZSlcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBPYnNlcnZhYmxlQXJyYXlEZWYgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9PYnNlcnZhYmxlQXJyYXlEZWYuanMnO1xyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCB7IFNoYWRlclByb2dyYW0sIFV0aWxzLCBXZWJHTE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY2hhcmdlc0FuZEZpZWxkcyBmcm9tICcuLi8uLi9jaGFyZ2VzQW5kRmllbGRzLmpzJztcclxuaW1wb3J0IENoYXJnZXNBbmRGaWVsZHNDb2xvcnMgZnJvbSAnLi4vQ2hhcmdlc0FuZEZpZWxkc0NvbG9ycy5qcyc7XHJcbmltcG9ydCBDaGFyZ2VUcmFja2VyIGZyb20gJy4vQ2hhcmdlVHJhY2tlci5qcyc7XHJcblxyXG4vLyBpbnRlZ2VyIGNvbnN0YW50cyBmb3Igb3VyIHNoYWRlclxyXG5jb25zdCBUWVBFX0FERCA9IDA7XHJcbmNvbnN0IFRZUEVfUkVNT1ZFID0gMTtcclxuY29uc3QgVFlQRV9NT1ZFID0gMjtcclxuXHJcbi8vIHBlcnNpc3RlbnQgbWF0cmljZXMvYXJyYXlzIHNvIHdlIG1pbmltaXplIHRoZSBudW1iZXIgb2YgY3JlYXRlZCBvYmplY3RzIGR1cmluZyByZW5kZXJpbmdcclxuY29uc3Qgc2NyYXRjaFByb2plY3Rpb25NYXRyaXggPSBuZXcgTWF0cml4MygpO1xyXG5jb25zdCBzY3JhdGNoSW52ZXJzZU1hdHJpeCA9IG5ldyBNYXRyaXgzKCk7XHJcbmNvbnN0IHNjcmF0Y2hGbG9hdEFycmF5ID0gbmV3IEZsb2F0MzJBcnJheSggOSApO1xyXG5cclxuY2xhc3MgRWxlY3RyaWNQb3RlbnRpYWxXZWJHTE5vZGUgZXh0ZW5kcyBXZWJHTE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09ic2VydmFibGVBcnJheURlZi48Q2hhcmdlZFBhcnRpY2xlPn0gY2hhcmdlZFBhcnRpY2xlcyAtIG9ubHkgY2hhcmdlZFBhcnRpY2xlcyB0aGF0IGFjdGl2ZSBhcmUgaW4gdGhpcyBhcnJheVxyXG4gICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGlzVmlzaWJsZVByb3BlcnR5XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNoYXJnZWRQYXJ0aWNsZXMsIG1vZGVsVmlld1RyYW5zZm9ybSwgaXNWaXNpYmxlUHJvcGVydHkgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBPYnNlcnZhYmxlQXJyYXlEZWYuaXNPYnNlcnZhYmxlQXJyYXkoIGNoYXJnZWRQYXJ0aWNsZXMgKSwgJ2ludmFsaWQgY2hhcmdlZFBhcnRpY2xlcycgKTtcclxuXHJcbiAgICBzdXBlciggRWxlY3RyaWNQb3RlbnRpYWxQYWludGVyLCB7XHJcbiAgICAgIGxheWVyU3BsaXQ6IHRydWUgLy8gZW5zdXJlIHdlJ3JlIG9uIG91ciBvd24gbGF5ZXJcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmNoYXJnZWRQYXJ0aWNsZXMgPSBjaGFyZ2VkUGFydGljbGVzO1xyXG4gICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0gPSBtb2RlbFZpZXdUcmFuc2Zvcm07XHJcbiAgICB0aGlzLmlzVmlzaWJsZVByb3BlcnR5ID0gaXNWaXNpYmxlUHJvcGVydHk7XHJcblxyXG4gICAgLy8gSW52YWxpZGF0ZSBwYWludCBvbiBhIGJ1bmNoIG9mIGNoYW5nZXNcclxuICAgIGNvbnN0IGludmFsaWRhdGVTZWxmTGlzdGVuZXIgPSB0aGlzLmludmFsaWRhdGVQYWludC5iaW5kKCB0aGlzICk7XHJcbiAgICBDaGFyZ2VzQW5kRmllbGRzQ29sb3JzLmVsZWN0cmljUG90ZW50aWFsR3JpZFplcm9Qcm9wZXJ0eS5saW5rKCBpbnZhbGlkYXRlU2VsZkxpc3RlbmVyICk7XHJcbiAgICBDaGFyZ2VzQW5kRmllbGRzQ29sb3JzLmVsZWN0cmljUG90ZW50aWFsR3JpZFNhdHVyYXRpb25Qb3NpdGl2ZVByb3BlcnR5LmxpbmsoIGludmFsaWRhdGVTZWxmTGlzdGVuZXIgKTtcclxuICAgIENoYXJnZXNBbmRGaWVsZHNDb2xvcnMuZWxlY3RyaWNQb3RlbnRpYWxHcmlkU2F0dXJhdGlvbk5lZ2F0aXZlUHJvcGVydHkubGluayggaW52YWxpZGF0ZVNlbGZMaXN0ZW5lciApO1xyXG4gICAgaXNWaXNpYmxlUHJvcGVydHkubGluayggaW52YWxpZGF0ZVNlbGZMaXN0ZW5lciApOyAvLyB2aXNpYmlsaXR5IGNoYW5nZVxyXG5cclxuICAgIC8vIHBhcnRpY2xlIGFkZGVkXHJcbiAgICBjaGFyZ2VkUGFydGljbGVzLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCBwYXJ0aWNsZSA9PiBwYXJ0aWNsZS5wb3NpdGlvblByb3BlcnR5LmxpbmsoIGludmFsaWRhdGVTZWxmTGlzdGVuZXIgKSApO1xyXG5cclxuICAgIC8vIHBhcnRpY2xlIHJlbW92ZWRcclxuICAgIGNoYXJnZWRQYXJ0aWNsZXMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggcGFydGljbGUgPT4ge1xyXG4gICAgICBpbnZhbGlkYXRlU2VsZkxpc3RlbmVyKCk7XHJcbiAgICAgIHBhcnRpY2xlLnBvc2l0aW9uUHJvcGVydHkudW5saW5rKCBpbnZhbGlkYXRlU2VsZkxpc3RlbmVyICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdmlzaWJpbGl0eSBjaGFuZ2VcclxuICAgIHRoaXMuZGlzcG9zZUVsZWN0cmljUG90ZW50aWFsV2ViR0xOb2RlID0gKCkgPT4gaXNWaXNpYmxlUHJvcGVydHkudW5saW5rKCBpbnZhbGlkYXRlU2VsZkxpc3RlbmVyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlY3Rpb24gZm9yIHN1cHBvcnQsIGJlY2F1c2UgaU9TIFNhZmFyaSA4IGRvZXNuJ3Qgc3VwcG9ydCByZW5kZXJpbmcgdG8gYSBmbG9hdCB0ZXh0dXJlLCBBTkQgZG9lc24ndCBzdXBwb3J0XHJcbiAgICogY2xhc3NpYyBkZXRlY3Rpb24gdmlhIGFuIGV4dGVuc2lvbiAoT0VTX3RleHR1cmVfZmxvYXQgd29ya3MpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGF0aWMgc3VwcG9ydHNSZW5kZXJpbmdUb0Zsb2F0VGV4dHVyZSgpIHtcclxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XHJcbiAgICBjb25zdCBnbCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnd2ViZ2wnICkgfHwgY2FudmFzLmdldENvbnRleHQoICdleHBlcmltZW50YWwtd2ViZ2wnICk7XHJcbiAgICBnbC5nZXRFeHRlbnNpb24oICdPRVNfdGV4dHVyZV9mbG9hdCcgKTtcclxuICAgIGNvbnN0IGZyYW1lYnVmZmVyID0gZ2wuY3JlYXRlRnJhbWVidWZmZXIoKTtcclxuICAgIGNvbnN0IHRleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XHJcbiAgICBnbC5iaW5kVGV4dHVyZSggZ2wuVEVYVFVSRV8yRCwgdGV4dHVyZSApO1xyXG4gICAgZ2wudGV4UGFyYW1ldGVyaSggZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5ORUFSRVNUICk7XHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKCBnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QgKTtcclxuICAgIGdsLnRleEltYWdlMkQoIGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQiwgMTI4LCAxMjgsIDAsIGdsLlJHQiwgZ2wuRkxPQVQsIG51bGwgKTtcclxuICAgIGdsLmJpbmRUZXh0dXJlKCBnbC5URVhUVVJFXzJELCBudWxsICk7XHJcbiAgICBnbC5iaW5kRnJhbWVidWZmZXIoIGdsLkZSQU1FQlVGRkVSLCBmcmFtZWJ1ZmZlciApO1xyXG4gICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoIGdsLkZSQU1FQlVGRkVSLCBnbC5DT0xPUl9BVFRBQ0hNRU5UMCwgZ2wuVEVYVFVSRV8yRCwgdGV4dHVyZSwgMCApO1xyXG4gICAgcmV0dXJuIGdsLmNoZWNrRnJhbWVidWZmZXJTdGF0dXMoIGdsLkZSQU1FQlVGRkVSICkgPT09IGdsLkZSQU1FQlVGRkVSX0NPTVBMRVRFO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5kaXNwb3NlRWxlY3RyaWNQb3RlbnRpYWxXZWJHTE5vZGUoKTtcclxuICB9XHJcbn1cclxuXHJcbmNoYXJnZXNBbmRGaWVsZHMucmVnaXN0ZXIoICdFbGVjdHJpY1BvdGVudGlhbFdlYkdMTm9kZScsIEVsZWN0cmljUG90ZW50aWFsV2ViR0xOb2RlICk7XHJcblxyXG5jbGFzcyBFbGVjdHJpY1BvdGVudGlhbFBhaW50ZXIge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2xcclxuICAgKiBAcGFyYW0ge1dhdmVXZWJHTE5vZGV9IG5vZGVcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZ2wsIG5vZGUgKSB7XHJcbiAgICB0aGlzLmdsID0gZ2w7XHJcbiAgICB0aGlzLm5vZGUgPSBub2RlO1xyXG5cclxuICAgIHRoaXMuY2hhcmdlVHJhY2tlciA9IG5ldyBDaGFyZ2VUcmFja2VyKCBub2RlLmNoYXJnZWRQYXJ0aWNsZXMgKTtcclxuXHJcbiAgICAvLyB3ZSB3aWxsIG5lZWQgdGhpcyBleHRlbnNpb25cclxuICAgIGdsLmdldEV4dGVuc2lvbiggJ09FU190ZXh0dXJlX2Zsb2F0JyApO1xyXG5cclxuICAgIC8vIHRoZSBmcmFtZWJ1ZmZlciB3ZSdsbCBiZSBkcmF3aW5nIGludG8gKHdpdGggZWl0aGVyIG9mIHRoZSB0d28gdGV4dHVyZXMpXHJcbiAgICB0aGlzLmZyYW1lYnVmZmVyID0gZ2wuY3JlYXRlRnJhbWVidWZmZXIoKTtcclxuXHJcbiAgICAvLyB0aGUgdHdvIHRleHR1cmVzIHdlJ2xsIGJlIHN3aXRjaGluZyBiZXR3ZWVuXHJcbiAgICB0aGlzLmN1cnJlbnRUZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xyXG4gICAgdGhpcy5wcmV2aW91c1RleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XHJcbiAgICB0aGlzLnNpemVUZXh0dXJlKCB0aGlzLmN1cnJlbnRUZXh0dXJlICk7XHJcbiAgICB0aGlzLnNpemVUZXh0dXJlKCB0aGlzLnByZXZpb3VzVGV4dHVyZSApO1xyXG5cclxuICAgIC8vIHNoYWRlciBtZWFudCB0byBjbGVhciBhIHRleHR1cmUgKHJlbmRlcnMgc29saWQgYmxhY2sgZXZlcnl3aGVyZSlcclxuICAgIHRoaXMuY2xlYXJTaGFkZXJQcm9ncmFtID0gbmV3IFNoYWRlclByb2dyYW0oIGdsLCBbXHJcbiAgICAgIC8vIHZlcnRleCBzaGFkZXJcclxuICAgICAgJ2F0dHJpYnV0ZSB2ZWMzIGFQb3NpdGlvbjsnLFxyXG4gICAgICAndm9pZCBtYWluKCkgeycsXHJcbiAgICAgICcgIGdsX1Bvc2l0aW9uID0gdmVjNCggYVBvc2l0aW9uLCAxICk7JyxcclxuICAgICAgJ30nXHJcbiAgICBdLmpvaW4oICdcXG4nICksIFtcclxuICAgICAgLy8gZnJhZ21lbnQgc2hhZGVyXHJcbiAgICAgICdwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDsnLFxyXG4gICAgICAndm9pZCBtYWluKCkgeycsXHJcbiAgICAgICcgIGdsX0ZyYWdDb2xvciA9IHZlYzQoIDAuMCwgMC4wLCAwLjAsIDEuMCApOycsXHJcbiAgICAgICd9J1xyXG4gICAgXS5qb2luKCAnXFxuJyApLCB7XHJcbiAgICAgIGF0dHJpYnV0ZXM6IFsgJ2FQb3NpdGlvbicgXSxcclxuICAgICAgdW5pZm9ybXM6IFtdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gc2hhZGVyIGZvciB0aGUgXCJjb21wdXRlXCIgc3RlcCwgdGhhdCBhZGRzIGEgdGV4dHVyZSBsb29rdXAgKyBjaGFuZ2UgdG8gdGhlIG90aGVyIHRleHR1cmVcclxuICAgIHRoaXMuY29tcHV0ZVNoYWRlclByb2dyYW0gPSBuZXcgU2hhZGVyUHJvZ3JhbSggZ2wsIFtcclxuICAgICAgLy8gdmVydGV4IHNoYWRlclxyXG4gICAgICAnYXR0cmlidXRlIHZlYzMgYVBvc2l0aW9uOycsIC8vIHZlcnRleCBhdHRyaWJ1dGVcclxuICAgICAgJ3ZhcnlpbmcgdmVjMiB2UG9zaXRpb247JyxcclxuICAgICAgJ3ZvaWQgbWFpbigpIHsnLFxyXG4gICAgICAnICB2UG9zaXRpb24gPSBhUG9zaXRpb24ueHk7JyxcclxuICAgICAgJyAgZ2xfUG9zaXRpb24gPSB2ZWM0KCBhUG9zaXRpb24sIDEgKTsnLFxyXG4gICAgICAnfSdcclxuICAgIF0uam9pbiggJ1xcbicgKSwgW1xyXG4gICAgICAvLyBmcmFnbWVudCBzaGFkZXJcclxuICAgICAgJ3ByZWNpc2lvbiBtZWRpdW1wIGZsb2F0OycsXHJcbiAgICAgICd2YXJ5aW5nIHZlYzIgdlBvc2l0aW9uOycsXHJcbiAgICAgICd1bmlmb3JtIHNhbXBsZXIyRCB1VGV4dHVyZTsnLCAvLyBvdXIgb3RoZXIgdGV4dHVyZSAodGhhdCB3ZSByZWFkIGZyb20pXHJcbiAgICAgICd1bmlmb3JtIGZsb2F0IHVDaGFyZ2U7JyxcclxuICAgICAgJ3VuaWZvcm0gdmVjMiB1T2xkUG9zaXRpb247JyxcclxuICAgICAgJ3VuaWZvcm0gdmVjMiB1TmV3UG9zaXRpb247JyxcclxuICAgICAgJ3VuaWZvcm0gaW50IHVUeXBlOycsIC8vIHNlZSB0eXBlcyBhdCB0aGUgdG9wIG9mIHRoZSBmaWxlXHJcbiAgICAgICd1bmlmb3JtIHZlYzIgdUNhbnZhc1NpemU7JywgLy8gZGltZW5zaW9ucyBvZiB0aGUgQ2FudmFzXHJcbiAgICAgICd1bmlmb3JtIHZlYzIgdVRleHR1cmVTaXplOycsIC8vIGRpbWVuc2lvbnMgb2YgdGhlIHRleHR1cmUgdGhhdCBjb3ZlcnMgdGhlIENhbnZhc1xyXG4gICAgICAndW5pZm9ybSBtYXQzIHVNYXRyaXhJbnZlcnNlOycsIC8vIG1hdHJpeCB0byB0cmFuc2Zvcm0gZnJvbSBub3JtYWxpemVkLWRldmljZS1jb29yZGluYXRlcyB0byB0aGUgbW9kZWxcclxuICAgICAgJ2NvbnN0IGZsb2F0IGtDb25zdGFudCA9IDkuMDsnLFxyXG4gICAgICAndm9pZCBtYWluKCkgeycsXHJcbiAgICAgIC8vIGhvbW9nZW5lb3VzIG1vZGVsLXZpZXcgdHJhbnNmb3JtYXRpb25cclxuICAgICAgJyAgdmVjMiBtb2RlbFBvc2l0aW9uID0gKCB1TWF0cml4SW52ZXJzZSAqIHZlYzMoIHZQb3NpdGlvbiwgMSApICkueHk7JyxcclxuICAgICAgLy8gbG9vayB1cCB0aGUgdmFsdWUgYmVmb3JlIG91ciBjaGFuZ2UgKHZQb3NpdGlvbiBOREMgPT4gWzAsMV0gPT4gc2NhbGVkIHRvIG1hdGNoIHRoZSBwYXJ0IG9mIHRoZSB0ZXh0dXJlKVxyXG4gICAgICAnICBmbG9hdCBvbGRWYWx1ZSA9IHRleHR1cmUyRCggdVRleHR1cmUsICggdlBvc2l0aW9uICogMC41ICsgMC41ICkgKiB1Q2FudmFzU2l6ZSAvIHVUZXh0dXJlU2l6ZSApLng7JyxcclxuICAgICAgJyAgZmxvYXQgY2hhbmdlID0gMC4wOycsXHJcbiAgICAgIC8vIGlmIGFwcGxpY2FibGUsIGFkZCB0aGUgcGFydGljbGUncyBjb250cmlidXRpb24gaW4gdGhlIG5ldyBwb3NpdGlvblxyXG4gICAgICBgICBpZiAoIHVUeXBlID09ICR7VFlQRV9BRER9IHx8IHVUeXBlID09ICR7VFlQRV9NT1ZFfSApIHtgLFxyXG4gICAgICAnICAgIGNoYW5nZSArPSB1Q2hhcmdlICoga0NvbnN0YW50IC8gbGVuZ3RoKCBtb2RlbFBvc2l0aW9uIC0gdU5ld1Bvc2l0aW9uICk7JyxcclxuICAgICAgJyAgfScsXHJcbiAgICAgIC8vIGlmIGFwcGxpY2FibGUsIHJlbW92ZSB0aGUgcGFydGljbGUncyBjb250cmlidXRpb24gaW4gdGhlIG9sZCBwb3NpdGlvblxyXG4gICAgICBgICBpZiAoIHVUeXBlID09ICR7VFlQRV9SRU1PVkV9IHx8IHVUeXBlID09ICR7VFlQRV9NT1ZFfSApIHtgLFxyXG4gICAgICAnICAgIGNoYW5nZSAtPSB1Q2hhcmdlICoga0NvbnN0YW50IC8gbGVuZ3RoKCBtb2RlbFBvc2l0aW9uIC0gdU9sZFBvc2l0aW9uICk7JyxcclxuICAgICAgJyAgfScsXHJcbiAgICAgIC8vIHN0dWZmIHRoZSByZXN1bHQgaW4gdGhlIHggY29vcmRpbmF0ZVxyXG4gICAgICAnICBnbF9GcmFnQ29sb3IgPSB2ZWM0KCBvbGRWYWx1ZSArIGNoYW5nZSwgMC4wLCAwLjAsIDEuMCApOycsXHJcbiAgICAgICd9J1xyXG4gICAgXS5qb2luKCAnXFxuJyApLCB7XHJcbiAgICAgIGF0dHJpYnV0ZXM6IFsgJ2FQb3NpdGlvbicgXSxcclxuICAgICAgdW5pZm9ybXM6IFsgJ3VUZXh0dXJlJywgJ3VDYW52YXNTaXplJywgJ3VUZXh0dXJlU2l6ZScsICd1Q2hhcmdlJywgJ3VPbGRQb3NpdGlvbicsICd1TmV3UG9zaXRpb24nLCAndVR5cGUnLCAndU1hdHJpeEludmVyc2UnIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBzaGFkZXIgZm9yIHRoZSBcImRpc3BsYXlcIiBzdGVwLCB0aGF0IGNvbG9yaXplcyB0aGUgbGF0ZXN0IHBvdGVudGlhbCBkYXRhXHJcbiAgICB0aGlzLmRpc3BsYXlTaGFkZXJQcm9ncmFtID0gbmV3IFNoYWRlclByb2dyYW0oIGdsLCBbXHJcbiAgICAgIC8vIHZlcnRleCBzaGFkZXJcclxuICAgICAgJ2F0dHJpYnV0ZSB2ZWMzIGFQb3NpdGlvbjsnLCAvLyB2ZXJ0ZXggYXR0cmlidXRlXHJcbiAgICAgICd2YXJ5aW5nIHZlYzIgdGV4Q29vcmQ7JyxcclxuICAgICAgJ3ZvaWQgbWFpbigpIHsnLFxyXG4gICAgICAnICB0ZXhDb29yZCA9IGFQb3NpdGlvbi54eSAqIDAuNSArIDAuNTsnLFxyXG4gICAgICAnICBnbF9Qb3NpdGlvbiA9IHZlYzQoIGFQb3NpdGlvbiwgMSApOycsXHJcbiAgICAgICd9J1xyXG4gICAgXS5qb2luKCAnXFxuJyApLCBbXHJcbiAgICAgIC8vIGZyYWdtZW50IHNoYWRlclxyXG4gICAgICAncHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7JyxcclxuICAgICAgJ3ZhcnlpbmcgdmVjMiB0ZXhDb29yZDsnLFxyXG4gICAgICAndW5pZm9ybSBzYW1wbGVyMkQgdVRleHR1cmU7JywgLy8gdGhlIHRleHR1cmUgdGhhdCBjb250YWlucyBvdXIgZmxvYXRpbmctcG9pbnQgcG90ZW50aWFsIGRhdGFcclxuICAgICAgJ3VuaWZvcm0gdmVjMiB1U2NhbGU7JywgLy8gaG93IHRvIHNjYWxlIG91ciB0ZXh0dXJlIGxvb2t1cFxyXG4gICAgICAndW5pZm9ybSB2ZWMzIHVaZXJvQ29sb3I7JyxcclxuICAgICAgJ3VuaWZvcm0gdmVjMyB1UG9zaXRpdmVDb2xvcjsnLFxyXG4gICAgICAndW5pZm9ybSB2ZWMzIHVOZWdhdGl2ZUNvbG9yOycsXHJcbiAgICAgICd2b2lkIG1haW4oKSB7JyxcclxuICAgICAgJyAgZmxvYXQgdmFsdWUgPSB0ZXh0dXJlMkQoIHVUZXh0dXJlLCB0ZXhDb29yZCAqIHVTY2FsZSApLng7JyxcclxuICAgICAgLy8gcnVsZXMgdG8gY29sb3IgcHVsbGVkIGZyb20gQ2hhbmdlc0FuZEZpZWxkc1NjcmVlblZpZXdcclxuICAgICAgJyAgaWYgKCB2YWx1ZSA+IDAuMCApIHsnLFxyXG4gICAgICAnICAgIHZhbHVlID0gbWluKCB2YWx1ZSAvIDQwLjAsIDEuMCApOycsIC8vIGNsYW1wIHRvIFswLDFdXHJcbiAgICAgICcgICAgZ2xfRnJhZ0NvbG9yID0gdmVjNCggdVBvc2l0aXZlQ29sb3IgKiB2YWx1ZSArIHVaZXJvQ29sb3IgKiAoIDEuMCAtIHZhbHVlICksIDEuMCApOycsXHJcbiAgICAgICcgIH0gZWxzZSB7JyxcclxuICAgICAgJyAgICB2YWx1ZSA9IG1pbiggLXZhbHVlIC8gNDAuMCwgMS4wICk7JywgLy8gY2xhbXAgdG8gWzAsMV1cclxuICAgICAgJyAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KCB1TmVnYXRpdmVDb2xvciAqIHZhbHVlICsgdVplcm9Db2xvciAqICggMS4wIC0gdmFsdWUgKSwgMS4wICk7JyxcclxuICAgICAgJyAgfScsXHJcbiAgICAgICd9J1xyXG4gICAgXS5qb2luKCAnXFxuJyApLCB7XHJcbiAgICAgIGF0dHJpYnV0ZXM6IFsgJ2FQb3NpdGlvbicgXSxcclxuICAgICAgdW5pZm9ybXM6IFsgJ3VUZXh0dXJlJywgJ3VTY2FsZScsICd1WmVyb0NvbG9yJywgJ3VQb3NpdGl2ZUNvbG9yJywgJ3VOZWdhdGl2ZUNvbG9yJyBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gd2Ugb25seSBuZWVkIG9uZSB2ZXJ0ZXggYnVmZmVyIHdpdGggdGhlIHNhbWUgY29udGVudHMgZm9yIGFsbCB0aHJlZSBzaGFkZXJzIVxyXG4gICAgdGhpcy52ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuICAgIGdsLmJpbmRCdWZmZXIoIGdsLkFSUkFZX0JVRkZFUiwgdGhpcy52ZXJ0ZXhCdWZmZXIgKTtcclxuICAgIGdsLmJ1ZmZlckRhdGEoIGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSggW1xyXG4gICAgICAtMSwgLTEsXHJcbiAgICAgIC0xLCArMSxcclxuICAgICAgKzEsIC0xLFxyXG4gICAgICArMSwgKzFcclxuICAgIF0gKSwgZ2wuU1RBVElDX0RSQVcgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2l6ZXMgYSB0ZXh0dXJlIHRvIGJlIGFibGUgdG8gY292ZXIgdGhlIGNhbnZhcyBhcmVhLCBhbmQgc2V0cyBkcmF3YWJsZSBwcm9wZXJ0aWVzIGZvciB0aGUgc2l6ZVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1dlYkdMVGV4dHVyZX0gdGV4dHVyZVxyXG4gICAqL1xyXG4gIHNpemVUZXh0dXJlKCB0ZXh0dXJlICkge1xyXG4gICAgY29uc3QgZ2wgPSB0aGlzLmdsO1xyXG4gICAgY29uc3Qgd2lkdGggPSBnbC5jYW52YXMud2lkdGg7XHJcbiAgICBjb25zdCBoZWlnaHQgPSBnbC5jYW52YXMuaGVpZ2h0O1xyXG4gICAgY29uc3QgcG93ZXJPZjJXaWR0aCA9IFV0aWxzLnRvUG93ZXJPZjIoIHdpZHRoICk7XHJcbiAgICBjb25zdCBwb3dlck9mMkhlaWdodCA9IFV0aWxzLnRvUG93ZXJPZjIoIGhlaWdodCApO1xyXG4gICAgdGhpcy5jYW52YXNXaWR0aCA9IHdpZHRoO1xyXG4gICAgdGhpcy5jYW52YXNIZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICB0aGlzLnRleHR1cmVXaWR0aCA9IHBvd2VyT2YyV2lkdGg7XHJcbiAgICB0aGlzLnRleHR1cmVIZWlnaHQgPSBwb3dlck9mMkhlaWdodDtcclxuXHJcbiAgICBnbC5iaW5kVGV4dHVyZSggZ2wuVEVYVFVSRV8yRCwgdGV4dHVyZSApO1xyXG4gICAgZ2wudGV4UGFyYW1ldGVyaSggZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5ORUFSRVNUICk7XHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKCBnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QgKTtcclxuICAgIGdsLnRleEltYWdlMkQoIGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQiwgcG93ZXJPZjJXaWR0aCwgcG93ZXJPZjJIZWlnaHQsIDAsIGdsLlJHQiwgZ2wuRkxPQVQsIG51bGwgKTtcclxuICAgIGdsLmJpbmRUZXh0dXJlKCBnbC5URVhUVVJFXzJELCBudWxsICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01hdHJpeDN9IG1vZGVsVmlld01hdHJpeFxyXG4gICAqIEBwYXJhbSB7TWF0cml4M30gcHJvamVjdGlvbk1hdHJpeFxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gV2ViR0xOb2RlLlBBSU5URURfTk9USElORyBvciBXZWJHTE5vZGUuUEFJTlRFRF9TT01FVEhJTkcuXHJcbiAgICovXHJcbiAgcGFpbnQoIG1vZGVsVmlld01hdHJpeCwgcHJvamVjdGlvbk1hdHJpeCApIHtcclxuICAgIGNvbnN0IGdsID0gdGhpcy5nbDtcclxuICAgIGNvbnN0IGNsZWFyU2hhZGVyUHJvZ3JhbSA9IHRoaXMuY2xlYXJTaGFkZXJQcm9ncmFtO1xyXG4gICAgY29uc3QgY29tcHV0ZVNoYWRlclByb2dyYW0gPSB0aGlzLmNvbXB1dGVTaGFkZXJQcm9ncmFtO1xyXG4gICAgY29uc3QgZGlzcGxheVNoYWRlclByb2dyYW0gPSB0aGlzLmRpc3BsYXlTaGFkZXJQcm9ncmFtO1xyXG5cclxuICAgIC8vIElmIHdlJ3JlIG5vdCB2aXNpYmxlLCBjbGVhciBldmVyeXRoaW5nIGFuZCBleGl0LiBPdXIgbGF5ZXJTcGxpdCBhYm92ZSBndWFyYW50ZWVzIHRoaXMgd29uJ3QgY2xlYXIgb3RoZXJcclxuICAgIC8vIG5vZGUncyByZW5kZXJpbmdzLlxyXG4gICAgaWYgKCAhdGhpcy5ub2RlLmlzVmlzaWJsZVByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICByZXR1cm4gV2ViR0xOb2RlLlBBSU5URURfTk9USElORztcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBvdXIgZGltZW5zaW9ucyBjaGFuZ2VkLCByZXNpemUgb3VyIHRleHR1cmVzIGFuZCByZWluaXRpYWxpemUgYWxsIG9mIG91ciBwb3RlbnRpYWxzLlxyXG4gICAgaWYgKCB0aGlzLmNhbnZhc1dpZHRoICE9PSBnbC5jYW52YXMud2lkdGggfHwgdGhpcy5jYW52YXNIZWlnaHQgIT09IGdsLmNhbnZhcy5oZWlnaHQgKSB7XHJcbiAgICAgIHRoaXMuc2l6ZVRleHR1cmUoIHRoaXMuY3VycmVudFRleHR1cmUgKTtcclxuICAgICAgdGhpcy5zaXplVGV4dHVyZSggdGhpcy5wcmV2aW91c1RleHR1cmUgKTtcclxuICAgICAgdGhpcy5jaGFyZ2VUcmFja2VyLnJlYnVpbGQoKTtcclxuXHJcbiAgICAgIC8vIGNsZWFycyB0aGUgYnVmZmVyIHRvIGJlIHVzZWRcclxuICAgICAgY2xlYXJTaGFkZXJQcm9ncmFtLnVzZSgpO1xyXG4gICAgICBnbC5iaW5kRnJhbWVidWZmZXIoIGdsLkZSQU1FQlVGRkVSLCB0aGlzLmZyYW1lYnVmZmVyICk7XHJcbiAgICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKCBnbC5GUkFNRUJVRkZFUiwgZ2wuQ09MT1JfQVRUQUNITUVOVDAsIGdsLlRFWFRVUkVfMkQsIHRoaXMucHJldmlvdXNUZXh0dXJlLCAwICk7XHJcblxyXG4gICAgICBnbC5iaW5kQnVmZmVyKCBnbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGV4QnVmZmVyICk7XHJcbiAgICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoIGNvbXB1dGVTaGFkZXJQcm9ncmFtLmF0dHJpYnV0ZUxvY2F0aW9ucy5hUG9zaXRpb24sIDIsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCApO1xyXG5cclxuICAgICAgZ2wuZHJhd0FycmF5cyggZ2wuVFJJQU5HTEVfU1RSSVAsIDAsIDQgKTtcclxuICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKCBnbC5GUkFNRUJVRkZFUiwgbnVsbCApO1xyXG4gICAgICBjbGVhclNoYWRlclByb2dyYW0udW51c2UoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgICAqIENvbXB1dGUgc3RlcHNcclxuICAgICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gICAgY29tcHV0ZVNoYWRlclByb2dyYW0udXNlKCk7XHJcblxyXG4gICAgZ2wudW5pZm9ybTJmKCBjb21wdXRlU2hhZGVyUHJvZ3JhbS51bmlmb3JtTG9jYXRpb25zLnVDYW52YXNTaXplLCB0aGlzLmNhbnZhc1dpZHRoLCB0aGlzLmNhbnZhc0hlaWdodCApO1xyXG4gICAgZ2wudW5pZm9ybTJmKCBjb21wdXRlU2hhZGVyUHJvZ3JhbS51bmlmb3JtTG9jYXRpb25zLnVUZXh0dXJlU2l6ZSwgdGhpcy50ZXh0dXJlV2lkdGgsIHRoaXMudGV4dHVyZUhlaWdodCApO1xyXG5cclxuICAgIGNvbnN0IG1hdHJpeEludmVyc2UgPSBzY3JhdGNoSW52ZXJzZU1hdHJpeDtcclxuICAgIGNvbnN0IHByb2plY3Rpb25NYXRyaXhJbnZlcnNlID0gc2NyYXRjaFByb2plY3Rpb25NYXRyaXguc2V0KCBwcm9qZWN0aW9uTWF0cml4ICkuaW52ZXJ0KCk7XHJcbiAgICBtYXRyaXhJbnZlcnNlLnNldCggdGhpcy5ub2RlLm1vZGVsVmlld1RyYW5zZm9ybS5nZXRJbnZlcnNlKCkgKS5tdWx0aXBseU1hdHJpeCggbW9kZWxWaWV3TWF0cml4LmludmVydGVkKCkubXVsdGlwbHlNYXRyaXgoIHByb2plY3Rpb25NYXRyaXhJbnZlcnNlICkgKTtcclxuICAgIGdsLnVuaWZvcm1NYXRyaXgzZnYoIGNvbXB1dGVTaGFkZXJQcm9ncmFtLnVuaWZvcm1Mb2NhdGlvbnMudU1hdHJpeEludmVyc2UsIGZhbHNlLCBtYXRyaXhJbnZlcnNlLmNvcHlUb0FycmF5KCBzY3JhdGNoRmxvYXRBcnJheSApICk7XHJcblxyXG4gICAgLy8gZG8gYSBkcmF3IGNhbGwgZm9yIGVhY2ggcGFydGljbGUgY2hhbmdlXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmNoYXJnZVRyYWNrZXIucXVldWUubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmNoYXJnZVRyYWNrZXIucXVldWVbIGkgXTtcclxuXHJcbiAgICAgIC8vIG1ha2UgZnV0dXJlIHJlbmRlcmluZyBvdXRwdXQgaW50byBjdXJyZW50VGV4dHVyZVxyXG4gICAgICBnbC5iaW5kRnJhbWVidWZmZXIoIGdsLkZSQU1FQlVGRkVSLCB0aGlzLmZyYW1lYnVmZmVyICk7XHJcbiAgICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKCBnbC5GUkFNRUJVRkZFUiwgZ2wuQ09MT1JfQVRUQUNITUVOVDAsIGdsLlRFWFRVUkVfMkQsIHRoaXMuY3VycmVudFRleHR1cmUsIDAgKTtcclxuXHJcbiAgICAgIC8vIHVzZSBvdXIgdmVydGV4IGJ1ZmZlciB0byBzYXkgd2hlcmUgdG8gcmVuZGVyICh0d28gdHJpYW5nbGVzIGNvdmVyaW5nIHRoZSBzY3JlZW4pXHJcbiAgICAgIGdsLmJpbmRCdWZmZXIoIGdsLkFSUkFZX0JVRkZFUiwgdGhpcy52ZXJ0ZXhCdWZmZXIgKTtcclxuICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlciggY29tcHV0ZVNoYWRlclByb2dyYW0uYXR0cmlidXRlTG9jYXRpb25zLmFQb3NpdGlvbiwgMiwgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwICk7XHJcblxyXG4gICAgICAvLyBtYWtlIHByZXZpb3VzIGRhdGEgZnJvbSB0aGUgb3RoZXIgdGV4dHVyZSBhdmFpbGFibGUgdG8gdGhlIHNoYWRlclxyXG4gICAgICBnbC5hY3RpdmVUZXh0dXJlKCBnbC5URVhUVVJFMCApO1xyXG4gICAgICBnbC5iaW5kVGV4dHVyZSggZ2wuVEVYVFVSRV8yRCwgdGhpcy5wcmV2aW91c1RleHR1cmUgKTtcclxuICAgICAgZ2wudW5pZm9ybTFpKCBjb21wdXRlU2hhZGVyUHJvZ3JhbS51bmlmb3JtTG9jYXRpb25zLnVUZXh0dXJlLCAwICk7XHJcblxyXG4gICAgICAvLyBtYWtlIHRoZSBwb3NpdGlvbnMgYXZhaWxhYmxlIHRvIHRoZSBzaGFkZXJcclxuICAgICAgZ2wudW5pZm9ybTFmKCBjb21wdXRlU2hhZGVyUHJvZ3JhbS51bmlmb3JtTG9jYXRpb25zLnVDaGFyZ2UsIGl0ZW0uY2hhcmdlICk7XHJcbiAgICAgIGlmICggaXRlbS5vbGRQb3NpdGlvbiApIHtcclxuICAgICAgICBnbC51bmlmb3JtMmYoIGNvbXB1dGVTaGFkZXJQcm9ncmFtLnVuaWZvcm1Mb2NhdGlvbnMudU9sZFBvc2l0aW9uLCBpdGVtLm9sZFBvc2l0aW9uLngsIGl0ZW0ub2xkUG9zaXRpb24ueSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGdsLnVuaWZvcm0yZiggY29tcHV0ZVNoYWRlclByb2dyYW0udW5pZm9ybUxvY2F0aW9ucy51T2xkUG9zaXRpb24sIDAsIDAgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIGl0ZW0ubmV3UG9zaXRpb24gKSB7XHJcbiAgICAgICAgZ2wudW5pZm9ybTJmKCBjb21wdXRlU2hhZGVyUHJvZ3JhbS51bmlmb3JtTG9jYXRpb25zLnVOZXdQb3NpdGlvbiwgaXRlbS5uZXdQb3NpdGlvbi54LCBpdGVtLm5ld1Bvc2l0aW9uLnkgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBnbC51bmlmb3JtMmYoIGNvbXB1dGVTaGFkZXJQcm9ncmFtLnVuaWZvcm1Mb2NhdGlvbnMudU5ld1Bvc2l0aW9uLCAwLCAwICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHRlbGwgdGhlIHNoYWRlciB0aGUgdHlwZSBvZiBjaGFuZ2Ugd2UgYXJlIG1ha2luZ1xyXG4gICAgICBjb25zdCB0eXBlID0gaXRlbS5vbGRQb3NpdGlvbiA/ICggaXRlbS5uZXdQb3NpdGlvbiA/IFRZUEVfTU9WRSA6IFRZUEVfUkVNT1ZFICkgOiBUWVBFX0FERDtcclxuICAgICAgZ2wudW5pZm9ybTFpKCBjb21wdXRlU2hhZGVyUHJvZ3JhbS51bmlmb3JtTG9jYXRpb25zLnVUeXBlLCB0eXBlICk7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKCB0eXBlICk7XHJcblxyXG4gICAgICAvLyBhY3R1YWxseSBkcmF3IGl0XHJcbiAgICAgIGdsLmRyYXdBcnJheXMoIGdsLlRSSUFOR0xFX1NUUklQLCAwLCA0ICk7XHJcbiAgICAgIC8vIG1ha2UgZnV0dXJlIHJlbmRlcmluZyBvdXRwdXQgZ28gaW50byBvdXIgdmlzdWFsIGRpc3BsYXlcclxuICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKCBnbC5GUkFNRUJVRkZFUiwgbnVsbCApO1xyXG5cclxuICAgICAgLy8gc3dhcCBidWZmZXJzIChzaW5jZSBjdXJyZW50VGV4dHVyZSBub3cgaGFzIHRoZSBtb3N0IHVwLXRvLWRhdGUgaW5mbywgd2UnbGwgd2FudCB0byB1c2UgaXQgZm9yIHJlYWRpbmcpXHJcbiAgICAgIGNvbnN0IHRtcCA9IHRoaXMuY3VycmVudFRleHR1cmU7XHJcbiAgICAgIHRoaXMuY3VycmVudFRleHR1cmUgPSB0aGlzLnByZXZpb3VzVGV4dHVyZTtcclxuICAgICAgdGhpcy5wcmV2aW91c1RleHR1cmUgPSB0bXA7XHJcbiAgICB9XHJcblxyXG4gICAgY29tcHV0ZVNoYWRlclByb2dyYW0udW51c2UoKTtcclxuXHJcbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgICAqIERpc3BsYXkgc3RlcFxyXG4gICAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgICBkaXNwbGF5U2hhZGVyUHJvZ3JhbS51c2UoKTtcclxuXHJcbiAgICAvLyB0ZWxsIHRoZSBzaGFkZXIgb3VyIGNvbG9ycyAvIHNjYWxlXHJcbiAgICBjb25zdCB6ZXJvQ29sb3IgPSBDaGFyZ2VzQW5kRmllbGRzQ29sb3JzLmVsZWN0cmljUG90ZW50aWFsR3JpZFplcm9Qcm9wZXJ0eS5nZXQoKTtcclxuICAgIGNvbnN0IHBvc2l0aXZlQ29sb3IgPSBDaGFyZ2VzQW5kRmllbGRzQ29sb3JzLmVsZWN0cmljUG90ZW50aWFsR3JpZFNhdHVyYXRpb25Qb3NpdGl2ZVByb3BlcnR5LmdldCgpO1xyXG4gICAgY29uc3QgbmVnYXRpdmVDb2xvciA9IENoYXJnZXNBbmRGaWVsZHNDb2xvcnMuZWxlY3RyaWNQb3RlbnRpYWxHcmlkU2F0dXJhdGlvbk5lZ2F0aXZlUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBnbC51bmlmb3JtM2YoIGRpc3BsYXlTaGFkZXJQcm9ncmFtLnVuaWZvcm1Mb2NhdGlvbnMudVplcm9Db2xvciwgemVyb0NvbG9yLnJlZCAvIDI1NSwgemVyb0NvbG9yLmdyZWVuIC8gMjU1LCB6ZXJvQ29sb3IuYmx1ZSAvIDI1NSApO1xyXG4gICAgZ2wudW5pZm9ybTNmKCBkaXNwbGF5U2hhZGVyUHJvZ3JhbS51bmlmb3JtTG9jYXRpb25zLnVQb3NpdGl2ZUNvbG9yLCBwb3NpdGl2ZUNvbG9yLnJlZCAvIDI1NSwgcG9zaXRpdmVDb2xvci5ncmVlbiAvIDI1NSwgcG9zaXRpdmVDb2xvci5ibHVlIC8gMjU1ICk7XHJcbiAgICBnbC51bmlmb3JtM2YoIGRpc3BsYXlTaGFkZXJQcm9ncmFtLnVuaWZvcm1Mb2NhdGlvbnMudU5lZ2F0aXZlQ29sb3IsIG5lZ2F0aXZlQ29sb3IucmVkIC8gMjU1LCBuZWdhdGl2ZUNvbG9yLmdyZWVuIC8gMjU1LCBuZWdhdGl2ZUNvbG9yLmJsdWUgLyAyNTUgKTtcclxuICAgIGdsLnVuaWZvcm0yZiggZGlzcGxheVNoYWRlclByb2dyYW0udW5pZm9ybUxvY2F0aW9ucy51U2NhbGUsIHRoaXMuY2FudmFzV2lkdGggLyB0aGlzLnRleHR1cmVXaWR0aCwgdGhpcy5jYW52YXNIZWlnaHQgLyB0aGlzLnRleHR1cmVIZWlnaHQgKTtcclxuXHJcbiAgICAvLyBkYXRhIHRvIGRyYXcgMiB0cmlhbmdsZXMgdGhhdCBjb3ZlciB0aGUgc2NyZWVuXHJcbiAgICBnbC5iaW5kQnVmZmVyKCBnbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGV4QnVmZmVyICk7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKCBkaXNwbGF5U2hhZGVyUHJvZ3JhbS5hdHRyaWJ1dGVMb2NhdGlvbnMuYVBvc2l0aW9uLCAyLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDAgKTtcclxuXHJcbiAgICAvLyByZWFkIGZyb20gdGhlIG1vc3QgdXAtdG8tZGF0ZSB0ZXh0dXJlIChvdXIgcG90ZW50aWFsIGRhdGEpXHJcbiAgICBnbC5hY3RpdmVUZXh0dXJlKCBnbC5URVhUVVJFMCApO1xyXG4gICAgZ2wuYmluZFRleHR1cmUoIGdsLlRFWFRVUkVfMkQsIHRoaXMucHJldmlvdXNUZXh0dXJlICk7XHJcbiAgICBnbC51bmlmb3JtMWkoIGRpc3BsYXlTaGFkZXJQcm9ncmFtLnVuaWZvcm1Mb2NhdGlvbnMudVRleHR1cmUsIDAgKTtcclxuXHJcbiAgICAvLyBhY3R1YWxseSBkcmF3IGl0XHJcbiAgICBnbC5kcmF3QXJyYXlzKCBnbC5UUklBTkdMRV9TVFJJUCwgMCwgNCApO1xyXG5cclxuICAgIC8vIHJlbGVhc2UgdGhlIHRleHR1cmVcclxuICAgIGdsLmJpbmRUZXh0dXJlKCBnbC5URVhUVVJFXzJELCBudWxsICk7XHJcblxyXG4gICAgZGlzcGxheVNoYWRlclByb2dyYW0udW51c2UoKTtcclxuXHJcbiAgICB0aGlzLmNoYXJnZVRyYWNrZXIuY2xlYXIoKTtcclxuXHJcbiAgICByZXR1cm4gV2ViR0xOb2RlLlBBSU5URURfU09NRVRISU5HO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgY29uc3QgZ2wgPSB0aGlzLmdsO1xyXG5cclxuICAgIC8vIGNsZWFycyBhbGwgb2Ygb3VyIHJlc291cmNlc1xyXG4gICAgdGhpcy5jb21wdXRlU2hhZGVyUHJvZ3JhbS5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmRpc3BsYXlTaGFkZXJQcm9ncmFtLmRpc3Bvc2UoKTtcclxuICAgIHRoaXMuY2xlYXJTaGFkZXJQcm9ncmFtLmRpc3Bvc2UoKTtcclxuICAgIGdsLmRlbGV0ZVRleHR1cmUoIHRoaXMuY3VycmVudFRleHR1cmUgKTtcclxuICAgIGdsLmRlbGV0ZVRleHR1cmUoIHRoaXMucHJldmlvdXNUZXh0dXJlICk7XHJcbiAgICBnbC5kZWxldGVCdWZmZXIoIHRoaXMudmVydGV4QnVmZmVyICk7XHJcbiAgICBnbC5kZWxldGVGcmFtZWJ1ZmZlciggdGhpcy5mcmFtZWJ1ZmZlciApO1xyXG5cclxuICAgIHRoaXMuY29tcHV0ZVNoYWRlclByb2dyYW0gPSBudWxsO1xyXG4gICAgdGhpcy5kaXNwbGF5U2hhZGVyUHJvZ3JhbSA9IG51bGw7XHJcbiAgICB0aGlzLmNsZWFyU2hhZGVyUHJvZ3JhbSA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5jaGFyZ2VUcmFja2VyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEVsZWN0cmljUG90ZW50aWFsV2ViR0xOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0Esa0JBQWtCLE1BQU0sMkNBQTJDO0FBQzFFLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsU0FBU0MsYUFBYSxFQUFFQyxLQUFLLEVBQUVDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDbkYsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHNCQUFzQixNQUFNLDhCQUE4QjtBQUNqRSxPQUFPQyxhQUFhLE1BQU0sb0JBQW9COztBQUU5QztBQUNBLE1BQU1DLFFBQVEsR0FBRyxDQUFDO0FBQ2xCLE1BQU1DLFdBQVcsR0FBRyxDQUFDO0FBQ3JCLE1BQU1DLFNBQVMsR0FBRyxDQUFDOztBQUVuQjtBQUNBLE1BQU1DLHVCQUF1QixHQUFHLElBQUlWLE9BQU8sQ0FBQyxDQUFDO0FBQzdDLE1BQU1XLG9CQUFvQixHQUFHLElBQUlYLE9BQU8sQ0FBQyxDQUFDO0FBQzFDLE1BQU1ZLGlCQUFpQixHQUFHLElBQUlDLFlBQVksQ0FBRSxDQUFFLENBQUM7QUFFL0MsTUFBTUMsMEJBQTBCLFNBQVNYLFNBQVMsQ0FBQztFQUVqRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VZLFdBQVdBLENBQUVD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