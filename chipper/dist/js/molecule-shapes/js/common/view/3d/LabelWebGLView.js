// Copyright 2014-2022, University of Colorado Boulder

/**
 * Label (text) of the angle between two bonds. We restrict the possible input strings to the form '123.4°' or '12.3°'
 * to make the layout faster (no need to change the geometry vertices, just UVs) and simpler.
 *
 * At a high level, we create a texture (image) with the glyphs we will need positioned evenly-spaced on it. We
 * specify constant geometry positions for each character (there are 6 for '123.4°'), since we have no need to change
 * the positions of those due to our format string restrictions (for '12.3°', we simply don't display the first
 * character, e.g. 'X12.3°'). We update the UV coordinates for each character's position to correspond to the position
 * inside the texture where the desired glyph is.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../../dot/js/Bounds2.js';
import Matrix3 from '../../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import { Shape } from '../../../../../kite/js/imports.js';
import { Utils } from '../../../../../scenery/js/imports.js';
import moleculeShapes from '../../../moleculeShapes.js';
import MoleculeShapesGlobals from '../../MoleculeShapesGlobals.js';
import MoleculeShapesColors from '../MoleculeShapesColors.js';
import LocalTexture from './LocalTexture.js';

// grab our font data from the global namespace
const liberationSansRegularSubset = phet.liberationSansRegularSubsetNumericDegrees;
assert && assert(liberationSansRegularSubset);

/*---------------------------------------------------------------------------*
 * Glyph texture setup
 *----------------------------------------------------------------------------*/

const glyphs = {};
let maxWidth;
let maxHeight;
let canvas;
// initializes the above variables with a texture image and data to reference where glyphs are in that texture
(function setupTexture() {
  const padding = 4; // padding between glyphs in the texture, and between glyphs and the outside
  let numGlyphs = 0; // auto-detect number of glyphs, so we can space the glyphs out in the texture
  const glyphScale = 130; // 65 * powers of 2 seems to fill out the power-of-2 texture wasting less space
  const scaleMatrix = Matrix3.scaling(glyphScale);
  let key;

  // compute maxBounds, set glyphs[key].{shape,advance}
  const maxBounds = Bounds2.NOTHING.copy();
  for (key in liberationSansRegularSubset) {
    numGlyphs++;
    const fontGlyph = liberationSansRegularSubset[key];
    const shape = new Shape(fontGlyph.path).transformed(scaleMatrix);
    maxBounds.includeBounds(shape.bounds);
    glyphs[key] = {
      advance: fontGlyph.x_advance * glyphScale,
      shape: shape
    };
  }

  // export maximum dimensions needed for layer layout
  maxWidth = maxBounds.width;
  maxHeight = maxBounds.height;

  // set up Canvas and dimensions (padding between all glyphs and around the outside, rounded out to powers of 2)
  canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const canvasWidth = Utils.toPowerOf2((numGlyphs + 1) * padding + numGlyphs * maxWidth);
  const canvasHeight = Utils.toPowerOf2(2 * padding + maxHeight);
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // draw the glyphs into the texture, while recording their coordinate bounds in UV space (0 to 1)
  let n = 0;
  for (key in liberationSansRegularSubset) {
    // X,Y offset of the glyph's 0,0 registration point
    const xOffset = (n + 1) * padding + n * maxWidth - maxBounds.minX;
    const yOffset = padding + maxHeight - maxBounds.maxY;
    context.setTransform(1, 0, 0, 1, xOffset, yOffset);
    // Bounds in the texture are offset from the X,Y. We scale to [0,1] since that's how texture coordinates are handled
    glyphs[key].bounds = new Bounds2((xOffset + maxBounds.minX) / canvasWidth, (yOffset + maxBounds.minY) / canvasHeight, (xOffset + maxBounds.maxX) / canvasWidth, (yOffset + maxBounds.maxY) / canvasHeight);
    // draw it in white over transparency
    context.fillStyle = 'white';
    context.beginPath();
    glyphs[key].shape.writeToContext(context);
    context.fill();
    glyphs[key].xOffset = xOffset;
    glyphs[key].yOffset = yOffset;
    n++;
  }
})();

// renderer-local access
const localTexture = new LocalTexture(() => {
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearMipMapLinearFilter; // ensure we have the best-quality mip-mapping
  return texture;
});

// metrics data for proper centering and layout
const FORMAT_STRING = '000.0°';
const shortXOffset = glyphs['0'].advance;
const shortWidth = 3 * glyphs['0'].advance + glyphs['.'].advance + glyphs['°'].advance;
const longWidth = glyphs['0'].advance + shortWidth;

/*---------------------------------------------------------------------------*
 * Text shader
 *----------------------------------------------------------------------------*/

const vertexShader = ['varying vec2 vUv;', 'void main() {', '  vUv = uv;', '  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );', '}'].join('\n');

// custom fragment shader that rescales the text to increase contrast, and allows color and opacity controls
const fragmentShader = ['varying vec2 vUv;', 'uniform sampler2D map;', 'uniform float opacity;', 'uniform vec3 color;', 'const float scaleCenter = 0.4;', 'void main() {', '  vec4 texLookup = texture2D( map, vUv );', '  float rescaled = ( texLookup.r - scaleCenter ) * 2.0 + scaleCenter;', '  gl_FragColor = vec4( color, opacity * clamp( rescaled, 0.0, 1.0 ) );', '}'].join('\n');

// This uses three.js's uniform format and types, see https://github.com/mrdoob/three.js/wiki/Uniforms-types
const materialUniforms = {
  map: {
    type: 't',
    value: null // stub value, will be filled in
  },

  opacity: {
    type: 'f',
    value: 0
  },
  color: {
    type: '3f'
  }
};
class LabelWebGLView extends THREE.Mesh {
  /*
   * @param {THREE.Renderer} renderer
   */
  constructor(renderer) {
    const uvs = [];
    const texture = localTexture.get(renderer);
    const geometry = new THREE.Geometry();
    let x = 0; // accumulated X offset of previous character places

    for (let i = 0; i < FORMAT_STRING.length; i++) {
      // vertices for the bounds of the character
      geometry.vertices.push(new THREE.Vector3(x, 0, 0));
      geometry.vertices.push(new THREE.Vector3(x + maxWidth, 0, 0));
      geometry.vertices.push(new THREE.Vector3(x + maxWidth, maxHeight, 0));
      geometry.vertices.push(new THREE.Vector3(x + 0, maxHeight, 0));
      x += glyphs[FORMAT_STRING[i]].advance;

      // push UV placeholders for each corner
      uvs.push(new THREE.Vector3());
      uvs.push(new THREE.Vector3());
      uvs.push(new THREE.Vector3());
      uvs.push(new THREE.Vector3());

      // two faces to make up the quad for the character
      const offset = 4 * i;
      geometry.faces.push(new THREE.Face3(offset, offset + 1, offset + 2));
      geometry.faceVertexUvs[0].push([uvs[offset], uvs[offset + 1], uvs[offset + 2]]);
      geometry.faces.push(new THREE.Face3(offset, offset + 2, offset + 3));
      geometry.faceVertexUvs[0].push([uvs[offset], uvs[offset + 2], uvs[offset + 3]]);
    }
    geometry.dynamic = true; // tells three.js that we will change things
    geometry.uvsNeedUpdate = true; // will need when we change UVs
    // @private {Object} - cheap deep copy
    const specificMaterialUniforms = JSON.parse(JSON.stringify(materialUniforms));
    specificMaterialUniforms.map.value = texture;
    MoleculeShapesColors.bondAngleReadoutProperty.link(color => {
      specificMaterialUniforms.color.value = [color.r / 255, color.g / 255, color.b / 255]; // uniforms use number arrays
    });

    const material = MoleculeShapesGlobals.useWebGLProperty.value ? new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: specificMaterialUniforms
    }) : new THREE.MeshBasicMaterial({
      // NOTE: not great Canvas appearance. May have performance penalties
      side: THREE.DoubleSide,
      transparent: true,
      map: texture
    });
    super(geometry, material);
    this.uvs = uvs; // @private {Array.<THREE.Vector3>} - stores the texture coordinates used for drawing

    // @private {Object} - cheap deep copy
    this.materialUniforms = specificMaterialUniforms;
    this.unsetLabel();
  }

  /*
   * Displays and positions the label, and sets its text.
   * Same as API for LabelFallbackNode
   * @public
   *
   * @param {string} string
   * @param {number} brightness - In range [0,1]
   * @param {Vector2} centerScreenPoint - The center of the central atom in screen coordinates
   * @param {Vector2} midScreenPoint - The midpoint of the bond-angle arc in screen coordinates
   * @param {number} layoutScale - The ScreenView's layout scale
   */
  setLabel(string, brightness, centerScreenPoint, midScreenPoint, layoutScale) {
    assert && assert(string.length === 5 || string.length === 6);
    this.setString(string);
    this.materialUniforms.opacity.value = brightness;
    const scale = layoutScale * 0.13; // tuned constant to match the desired "font size" of the label
    this.scale.x = this.scale.y = this.scale.z = scale;
    const xCentering = string.length === 6 ? -longWidth / 2 : -shortXOffset - shortWidth / 2;
    const yCentering = -maxHeight / 2;

    // we position based on our upper-left origin
    const offset = midScreenPoint.minus(centerScreenPoint);
    // Mutably construct offset amount. Magic number vector is tuned to correspond well with the extra horizontal
    // and vertical spacing needed (if it wasn't applied, our text would be centered on the actual arc instead of
    // being pushed farther away).
    const offsetAmount = offset.normalized().componentMultiply(new Vector2(0.38, 0.2)).magnitude;
    this.position.x = midScreenPoint.x + offset.x * offsetAmount + xCentering * scale;
    this.position.y = midScreenPoint.y + offset.y * offsetAmount + yCentering * scale;
  }

  /*
   * Makes the label invisible
   * Same as API for LabelFallbackNode
   * @public
   */
  unsetLabel() {
    this.materialUniforms.opacity.value = 0;
  }

  /**
   * Sets the UV coordinates to display the requested string
   * @private
   *
   * @param {string} string
   */
  setString(string) {
    let idx = 0;
    if (string.length === 6) {
      this.setGlyph(0, string[idx++]);
    } else {
      this.unsetGlyph(0);
    }
    this.setGlyph(1, string[idx++]);
    this.setGlyph(2, string[idx++]);
    this.setGlyph(3, string[idx++]);
    this.setGlyph(4, string[idx++]);
    this.setGlyph(5, string[idx++]);
  }

  /**
   * Sets the UV coordinates for a single glyph, 0-indexed
   * @private
   *
   * @param {number} index
   * @param {string} string
   */
  setGlyph(index, string) {
    assert && assert(glyphs[string]);
    const glyph = glyphs[string];
    const minU = glyph.bounds.minX;
    const maxU = glyph.bounds.maxX;
    const minV = 1 - glyph.bounds.maxY;
    const maxV = 1 - glyph.bounds.minY;
    this.setUVs(index, minU, minV, maxU, maxV);
  }

  /**
   * Makes the character at the index invisible.
   * @private
   *
   * @param {number} index
   */
  unsetGlyph(index) {
    // set all texture coordinates to 0, so it will display nothing
    this.setUVs(index, 0, 0, 0, 0);
  }

  /**
   * Sets UVs for a specific character.
   * @private
   *
   * @param {number} index
   * @param {number} minU
   * @param {number} minV
   * @param {number} maxU
   * @param {number} maxV
   */
  setUVs(index, minU, minV, maxU, maxV) {
    const offset = index * 4;
    this.uvs[offset].x = minU;
    this.uvs[offset].y = maxV;
    this.uvs[offset + 1].x = maxU;
    this.uvs[offset + 1].y = maxV;
    this.uvs[offset + 2].x = maxU;
    this.uvs[offset + 2].y = minV;
    this.uvs[offset + 3].x = minU;
    this.uvs[offset + 3].y = minV;
    this.geometry.uvsNeedUpdate = true; // will need when we change UVs
  }
}

moleculeShapes.register('LabelWebGLView', LabelWebGLView);
export default LabelWebGLView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiTWF0cml4MyIsIlZlY3RvcjIiLCJTaGFwZSIsIlV0aWxzIiwibW9sZWN1bGVTaGFwZXMiLCJNb2xlY3VsZVNoYXBlc0dsb2JhbHMiLCJNb2xlY3VsZVNoYXBlc0NvbG9ycyIsIkxvY2FsVGV4dHVyZSIsImxpYmVyYXRpb25TYW5zUmVndWxhclN1YnNldCIsInBoZXQiLCJsaWJlcmF0aW9uU2Fuc1JlZ3VsYXJTdWJzZXROdW1lcmljRGVncmVlcyIsImFzc2VydCIsImdseXBocyIsIm1heFdpZHRoIiwibWF4SGVpZ2h0IiwiY2FudmFzIiwic2V0dXBUZXh0dXJlIiwicGFkZGluZyIsIm51bUdseXBocyIsImdseXBoU2NhbGUiLCJzY2FsZU1hdHJpeCIsInNjYWxpbmciLCJrZXkiLCJtYXhCb3VuZHMiLCJOT1RISU5HIiwiY29weSIsImZvbnRHbHlwaCIsInNoYXBlIiwicGF0aCIsInRyYW5zZm9ybWVkIiwiaW5jbHVkZUJvdW5kcyIsImJvdW5kcyIsImFkdmFuY2UiLCJ4X2FkdmFuY2UiLCJ3aWR0aCIsImhlaWdodCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImNvbnRleHQiLCJnZXRDb250ZXh0IiwiY2FudmFzV2lkdGgiLCJ0b1Bvd2VyT2YyIiwiY2FudmFzSGVpZ2h0IiwibiIsInhPZmZzZXQiLCJtaW5YIiwieU9mZnNldCIsIm1heFkiLCJzZXRUcmFuc2Zvcm0iLCJtaW5ZIiwibWF4WCIsImZpbGxTdHlsZSIsImJlZ2luUGF0aCIsIndyaXRlVG9Db250ZXh0IiwiZmlsbCIsImxvY2FsVGV4dHVyZSIsInRleHR1cmUiLCJUSFJFRSIsIlRleHR1cmUiLCJuZWVkc1VwZGF0ZSIsIm1pbkZpbHRlciIsIkxpbmVhck1pcE1hcExpbmVhckZpbHRlciIsIkZPUk1BVF9TVFJJTkciLCJzaG9ydFhPZmZzZXQiLCJzaG9ydFdpZHRoIiwibG9uZ1dpZHRoIiwidmVydGV4U2hhZGVyIiwiam9pbiIsImZyYWdtZW50U2hhZGVyIiwibWF0ZXJpYWxVbmlmb3JtcyIsIm1hcCIsInR5cGUiLCJ2YWx1ZSIsIm9wYWNpdHkiLCJjb2xvciIsIkxhYmVsV2ViR0xWaWV3IiwiTWVzaCIsImNvbnN0cnVjdG9yIiwicmVuZGVyZXIiLCJ1dnMiLCJnZXQiLCJnZW9tZXRyeSIsIkdlb21ldHJ5IiwieCIsImkiLCJsZW5ndGgiLCJ2ZXJ0aWNlcyIsInB1c2giLCJWZWN0b3IzIiwib2Zmc2V0IiwiZmFjZXMiLCJGYWNlMyIsImZhY2VWZXJ0ZXhVdnMiLCJkeW5hbWljIiwidXZzTmVlZFVwZGF0ZSIsInNwZWNpZmljTWF0ZXJpYWxVbmlmb3JtcyIsIkpTT04iLCJwYXJzZSIsInN0cmluZ2lmeSIsImJvbmRBbmdsZVJlYWRvdXRQcm9wZXJ0eSIsImxpbmsiLCJyIiwiZyIsImIiLCJtYXRlcmlhbCIsInVzZVdlYkdMUHJvcGVydHkiLCJTaGFkZXJNYXRlcmlhbCIsInNpZGUiLCJEb3VibGVTaWRlIiwidHJhbnNwYXJlbnQiLCJ1bmlmb3JtcyIsIk1lc2hCYXNpY01hdGVyaWFsIiwidW5zZXRMYWJlbCIsInNldExhYmVsIiwic3RyaW5nIiwiYnJpZ2h0bmVzcyIsImNlbnRlclNjcmVlblBvaW50IiwibWlkU2NyZWVuUG9pbnQiLCJsYXlvdXRTY2FsZSIsInNldFN0cmluZyIsInNjYWxlIiwieSIsInoiLCJ4Q2VudGVyaW5nIiwieUNlbnRlcmluZyIsIm1pbnVzIiwib2Zmc2V0QW1vdW50Iiwibm9ybWFsaXplZCIsImNvbXBvbmVudE11bHRpcGx5IiwibWFnbml0dWRlIiwicG9zaXRpb24iLCJpZHgiLCJzZXRHbHlwaCIsInVuc2V0R2x5cGgiLCJpbmRleCIsImdseXBoIiwibWluVSIsIm1heFUiLCJtaW5WIiwibWF4ViIsInNldFVWcyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTGFiZWxXZWJHTFZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTGFiZWwgKHRleHQpIG9mIHRoZSBhbmdsZSBiZXR3ZWVuIHR3byBib25kcy4gV2UgcmVzdHJpY3QgdGhlIHBvc3NpYmxlIGlucHV0IHN0cmluZ3MgdG8gdGhlIGZvcm0gJzEyMy40wrAnIG9yICcxMi4zwrAnXHJcbiAqIHRvIG1ha2UgdGhlIGxheW91dCBmYXN0ZXIgKG5vIG5lZWQgdG8gY2hhbmdlIHRoZSBnZW9tZXRyeSB2ZXJ0aWNlcywganVzdCBVVnMpIGFuZCBzaW1wbGVyLlxyXG4gKlxyXG4gKiBBdCBhIGhpZ2ggbGV2ZWwsIHdlIGNyZWF0ZSBhIHRleHR1cmUgKGltYWdlKSB3aXRoIHRoZSBnbHlwaHMgd2Ugd2lsbCBuZWVkIHBvc2l0aW9uZWQgZXZlbmx5LXNwYWNlZCBvbiBpdC4gV2VcclxuICogc3BlY2lmeSBjb25zdGFudCBnZW9tZXRyeSBwb3NpdGlvbnMgZm9yIGVhY2ggY2hhcmFjdGVyICh0aGVyZSBhcmUgNiBmb3IgJzEyMy40wrAnKSwgc2luY2Ugd2UgaGF2ZSBubyBuZWVkIHRvIGNoYW5nZVxyXG4gKiB0aGUgcG9zaXRpb25zIG9mIHRob3NlIGR1ZSB0byBvdXIgZm9ybWF0IHN0cmluZyByZXN0cmljdGlvbnMgKGZvciAnMTIuM8KwJywgd2Ugc2ltcGx5IGRvbid0IGRpc3BsYXkgdGhlIGZpcnN0XHJcbiAqIGNoYXJhY3RlciwgZS5nLiAnWDEyLjPCsCcpLiBXZSB1cGRhdGUgdGhlIFVWIGNvb3JkaW5hdGVzIGZvciBlYWNoIGNoYXJhY3RlcidzIHBvc2l0aW9uIHRvIGNvcnJlc3BvbmQgdG8gdGhlIHBvc2l0aW9uXHJcbiAqIGluc2lkZSB0aGUgdGV4dHVyZSB3aGVyZSB0aGUgZGVzaXJlZCBnbHlwaCBpcy5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHsgVXRpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbW9sZWN1bGVTaGFwZXMgZnJvbSAnLi4vLi4vLi4vbW9sZWN1bGVTaGFwZXMuanMnO1xyXG5pbXBvcnQgTW9sZWN1bGVTaGFwZXNHbG9iYWxzIGZyb20gJy4uLy4uL01vbGVjdWxlU2hhcGVzR2xvYmFscy5qcyc7XHJcbmltcG9ydCBNb2xlY3VsZVNoYXBlc0NvbG9ycyBmcm9tICcuLi9Nb2xlY3VsZVNoYXBlc0NvbG9ycy5qcyc7XHJcbmltcG9ydCBMb2NhbFRleHR1cmUgZnJvbSAnLi9Mb2NhbFRleHR1cmUuanMnO1xyXG5cclxuLy8gZ3JhYiBvdXIgZm9udCBkYXRhIGZyb20gdGhlIGdsb2JhbCBuYW1lc3BhY2VcclxuY29uc3QgbGliZXJhdGlvblNhbnNSZWd1bGFyU3Vic2V0ID0gcGhldC5saWJlcmF0aW9uU2Fuc1JlZ3VsYXJTdWJzZXROdW1lcmljRGVncmVlcztcclxuYXNzZXJ0ICYmIGFzc2VydCggbGliZXJhdGlvblNhbnNSZWd1bGFyU3Vic2V0ICk7XHJcblxyXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICogR2x5cGggdGV4dHVyZSBzZXR1cFxyXG4gKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuY29uc3QgZ2x5cGhzID0ge307XHJcbmxldCBtYXhXaWR0aDtcclxubGV0IG1heEhlaWdodDtcclxubGV0IGNhbnZhcztcclxuLy8gaW5pdGlhbGl6ZXMgdGhlIGFib3ZlIHZhcmlhYmxlcyB3aXRoIGEgdGV4dHVyZSBpbWFnZSBhbmQgZGF0YSB0byByZWZlcmVuY2Ugd2hlcmUgZ2x5cGhzIGFyZSBpbiB0aGF0IHRleHR1cmVcclxuKCBmdW5jdGlvbiBzZXR1cFRleHR1cmUoKSB7XHJcbiAgY29uc3QgcGFkZGluZyA9IDQ7IC8vIHBhZGRpbmcgYmV0d2VlbiBnbHlwaHMgaW4gdGhlIHRleHR1cmUsIGFuZCBiZXR3ZWVuIGdseXBocyBhbmQgdGhlIG91dHNpZGVcclxuICBsZXQgbnVtR2x5cGhzID0gMDsgLy8gYXV0by1kZXRlY3QgbnVtYmVyIG9mIGdseXBocywgc28gd2UgY2FuIHNwYWNlIHRoZSBnbHlwaHMgb3V0IGluIHRoZSB0ZXh0dXJlXHJcbiAgY29uc3QgZ2x5cGhTY2FsZSA9IDEzMDsgLy8gNjUgKiBwb3dlcnMgb2YgMiBzZWVtcyB0byBmaWxsIG91dCB0aGUgcG93ZXItb2YtMiB0ZXh0dXJlIHdhc3RpbmcgbGVzcyBzcGFjZVxyXG4gIGNvbnN0IHNjYWxlTWF0cml4ID0gTWF0cml4My5zY2FsaW5nKCBnbHlwaFNjYWxlICk7XHJcbiAgbGV0IGtleTtcclxuXHJcbiAgLy8gY29tcHV0ZSBtYXhCb3VuZHMsIHNldCBnbHlwaHNba2V5XS57c2hhcGUsYWR2YW5jZX1cclxuICBjb25zdCBtYXhCb3VuZHMgPSBCb3VuZHMyLk5PVEhJTkcuY29weSgpO1xyXG4gIGZvciAoIGtleSBpbiBsaWJlcmF0aW9uU2Fuc1JlZ3VsYXJTdWJzZXQgKSB7XHJcbiAgICBudW1HbHlwaHMrKztcclxuXHJcbiAgICBjb25zdCBmb250R2x5cGggPSBsaWJlcmF0aW9uU2Fuc1JlZ3VsYXJTdWJzZXRbIGtleSBdO1xyXG4gICAgY29uc3Qgc2hhcGUgPSBuZXcgU2hhcGUoIGZvbnRHbHlwaC5wYXRoICkudHJhbnNmb3JtZWQoIHNjYWxlTWF0cml4ICk7XHJcbiAgICBtYXhCb3VuZHMuaW5jbHVkZUJvdW5kcyggc2hhcGUuYm91bmRzICk7XHJcblxyXG4gICAgZ2x5cGhzWyBrZXkgXSA9IHtcclxuICAgICAgYWR2YW5jZTogZm9udEdseXBoLnhfYWR2YW5jZSAqIGdseXBoU2NhbGUsXHJcbiAgICAgIHNoYXBlOiBzaGFwZVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIGV4cG9ydCBtYXhpbXVtIGRpbWVuc2lvbnMgbmVlZGVkIGZvciBsYXllciBsYXlvdXRcclxuICBtYXhXaWR0aCA9IG1heEJvdW5kcy53aWR0aDtcclxuICBtYXhIZWlnaHQgPSBtYXhCb3VuZHMuaGVpZ2h0O1xyXG5cclxuICAvLyBzZXQgdXAgQ2FudmFzIGFuZCBkaW1lbnNpb25zIChwYWRkaW5nIGJldHdlZW4gYWxsIGdseXBocyBhbmQgYXJvdW5kIHRoZSBvdXRzaWRlLCByb3VuZGVkIG91dCB0byBwb3dlcnMgb2YgMilcclxuICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApO1xyXG4gIGNvbnN0IGNhbnZhc1dpZHRoID0gVXRpbHMudG9Qb3dlck9mMiggKCBudW1HbHlwaHMgKyAxICkgKiBwYWRkaW5nICsgbnVtR2x5cGhzICogbWF4V2lkdGggKTtcclxuICBjb25zdCBjYW52YXNIZWlnaHQgPSBVdGlscy50b1Bvd2VyT2YyKCAyICogcGFkZGluZyArIG1heEhlaWdodCApO1xyXG4gIGNhbnZhcy53aWR0aCA9IGNhbnZhc1dpZHRoO1xyXG4gIGNhbnZhcy5oZWlnaHQgPSBjYW52YXNIZWlnaHQ7XHJcblxyXG4gIC8vIGRyYXcgdGhlIGdseXBocyBpbnRvIHRoZSB0ZXh0dXJlLCB3aGlsZSByZWNvcmRpbmcgdGhlaXIgY29vcmRpbmF0ZSBib3VuZHMgaW4gVVYgc3BhY2UgKDAgdG8gMSlcclxuICBsZXQgbiA9IDA7XHJcbiAgZm9yICgga2V5IGluIGxpYmVyYXRpb25TYW5zUmVndWxhclN1YnNldCApIHtcclxuICAgIC8vIFgsWSBvZmZzZXQgb2YgdGhlIGdseXBoJ3MgMCwwIHJlZ2lzdHJhdGlvbiBwb2ludFxyXG4gICAgY29uc3QgeE9mZnNldCA9ICggbiArIDEgKSAqIHBhZGRpbmcgKyBuICogbWF4V2lkdGggLSBtYXhCb3VuZHMubWluWDtcclxuICAgIGNvbnN0IHlPZmZzZXQgPSBwYWRkaW5nICsgbWF4SGVpZ2h0IC0gbWF4Qm91bmRzLm1heFk7XHJcbiAgICBjb250ZXh0LnNldFRyYW5zZm9ybSggMSwgMCwgMCwgMSwgeE9mZnNldCwgeU9mZnNldCApO1xyXG4gICAgLy8gQm91bmRzIGluIHRoZSB0ZXh0dXJlIGFyZSBvZmZzZXQgZnJvbSB0aGUgWCxZLiBXZSBzY2FsZSB0byBbMCwxXSBzaW5jZSB0aGF0J3MgaG93IHRleHR1cmUgY29vcmRpbmF0ZXMgYXJlIGhhbmRsZWRcclxuICAgIGdseXBoc1sga2V5IF0uYm91bmRzID0gbmV3IEJvdW5kczIoICggeE9mZnNldCArIG1heEJvdW5kcy5taW5YICkgLyBjYW52YXNXaWR0aCxcclxuICAgICAgKCB5T2Zmc2V0ICsgbWF4Qm91bmRzLm1pblkgKSAvIGNhbnZhc0hlaWdodCxcclxuICAgICAgKCB4T2Zmc2V0ICsgbWF4Qm91bmRzLm1heFggKSAvIGNhbnZhc1dpZHRoLFxyXG4gICAgICAoIHlPZmZzZXQgKyBtYXhCb3VuZHMubWF4WSApIC8gY2FudmFzSGVpZ2h0ICk7XHJcbiAgICAvLyBkcmF3IGl0IGluIHdoaXRlIG92ZXIgdHJhbnNwYXJlbmN5XHJcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XHJcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgZ2x5cGhzWyBrZXkgXS5zaGFwZS53cml0ZVRvQ29udGV4dCggY29udGV4dCApO1xyXG4gICAgY29udGV4dC5maWxsKCk7XHJcblxyXG4gICAgZ2x5cGhzWyBrZXkgXS54T2Zmc2V0ID0geE9mZnNldDtcclxuICAgIGdseXBoc1sga2V5IF0ueU9mZnNldCA9IHlPZmZzZXQ7XHJcbiAgICBuKys7XHJcbiAgfVxyXG59ICkoKTtcclxuXHJcbi8vIHJlbmRlcmVyLWxvY2FsIGFjY2Vzc1xyXG5jb25zdCBsb2NhbFRleHR1cmUgPSBuZXcgTG9jYWxUZXh0dXJlKCAoKSA9PiB7XHJcbiAgY29uc3QgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKCBjYW52YXMgKTtcclxuICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgdGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJNaXBNYXBMaW5lYXJGaWx0ZXI7IC8vIGVuc3VyZSB3ZSBoYXZlIHRoZSBiZXN0LXF1YWxpdHkgbWlwLW1hcHBpbmdcclxuICByZXR1cm4gdGV4dHVyZTtcclxufSApO1xyXG5cclxuLy8gbWV0cmljcyBkYXRhIGZvciBwcm9wZXIgY2VudGVyaW5nIGFuZCBsYXlvdXRcclxuY29uc3QgRk9STUFUX1NUUklORyA9ICcwMDAuMMKwJztcclxuY29uc3Qgc2hvcnRYT2Zmc2V0ID0gZ2x5cGhzWyAnMCcgXS5hZHZhbmNlO1xyXG5jb25zdCBzaG9ydFdpZHRoID0gMyAqIGdseXBoc1sgJzAnIF0uYWR2YW5jZSArIGdseXBoc1sgJy4nIF0uYWR2YW5jZSArIGdseXBoc1sgJ8KwJyBdLmFkdmFuY2U7XHJcbmNvbnN0IGxvbmdXaWR0aCA9IGdseXBoc1sgJzAnIF0uYWR2YW5jZSArIHNob3J0V2lkdGg7XHJcblxyXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICogVGV4dCBzaGFkZXJcclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbmNvbnN0IHZlcnRleFNoYWRlciA9IFtcclxuICAndmFyeWluZyB2ZWMyIHZVdjsnLFxyXG5cclxuICAndm9pZCBtYWluKCkgeycsXHJcbiAgJyAgdlV2ID0gdXY7JyxcclxuICAnICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KCBwb3NpdGlvbiwgMS4wICk7JyxcclxuICAnfSdcclxuXS5qb2luKCAnXFxuJyApO1xyXG5cclxuLy8gY3VzdG9tIGZyYWdtZW50IHNoYWRlciB0aGF0IHJlc2NhbGVzIHRoZSB0ZXh0IHRvIGluY3JlYXNlIGNvbnRyYXN0LCBhbmQgYWxsb3dzIGNvbG9yIGFuZCBvcGFjaXR5IGNvbnRyb2xzXHJcbmNvbnN0IGZyYWdtZW50U2hhZGVyID0gW1xyXG4gICd2YXJ5aW5nIHZlYzIgdlV2OycsXHJcbiAgJ3VuaWZvcm0gc2FtcGxlcjJEIG1hcDsnLFxyXG4gICd1bmlmb3JtIGZsb2F0IG9wYWNpdHk7JyxcclxuICAndW5pZm9ybSB2ZWMzIGNvbG9yOycsXHJcbiAgJ2NvbnN0IGZsb2F0IHNjYWxlQ2VudGVyID0gMC40OycsXHJcblxyXG4gICd2b2lkIG1haW4oKSB7JyxcclxuICAnICB2ZWM0IHRleExvb2t1cCA9IHRleHR1cmUyRCggbWFwLCB2VXYgKTsnLFxyXG4gICcgIGZsb2F0IHJlc2NhbGVkID0gKCB0ZXhMb29rdXAuciAtIHNjYWxlQ2VudGVyICkgKiAyLjAgKyBzY2FsZUNlbnRlcjsnLFxyXG4gICcgIGdsX0ZyYWdDb2xvciA9IHZlYzQoIGNvbG9yLCBvcGFjaXR5ICogY2xhbXAoIHJlc2NhbGVkLCAwLjAsIDEuMCApICk7JyxcclxuICAnfSdcclxuXS5qb2luKCAnXFxuJyApO1xyXG5cclxuLy8gVGhpcyB1c2VzIHRocmVlLmpzJ3MgdW5pZm9ybSBmb3JtYXQgYW5kIHR5cGVzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy93aWtpL1VuaWZvcm1zLXR5cGVzXHJcbmNvbnN0IG1hdGVyaWFsVW5pZm9ybXMgPSB7XHJcbiAgbWFwOiB7XHJcbiAgICB0eXBlOiAndCcsXHJcbiAgICB2YWx1ZTogbnVsbCAvLyBzdHViIHZhbHVlLCB3aWxsIGJlIGZpbGxlZCBpblxyXG4gIH0sXHJcbiAgb3BhY2l0eToge1xyXG4gICAgdHlwZTogJ2YnLFxyXG4gICAgdmFsdWU6IDBcclxuICB9LFxyXG4gIGNvbG9yOiB7XHJcbiAgICB0eXBlOiAnM2YnXHJcbiAgfVxyXG59O1xyXG5cclxuY2xhc3MgTGFiZWxXZWJHTFZpZXcgZXh0ZW5kcyBUSFJFRS5NZXNoIHtcclxuICAvKlxyXG4gICAqIEBwYXJhbSB7VEhSRUUuUmVuZGVyZXJ9IHJlbmRlcmVyXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHJlbmRlcmVyICkge1xyXG5cclxuICAgIGNvbnN0IHV2cyA9IFtdO1xyXG5cclxuICAgIGNvbnN0IHRleHR1cmUgPSBsb2NhbFRleHR1cmUuZ2V0KCByZW5kZXJlciApO1xyXG5cclxuICAgIGNvbnN0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcbiAgICBsZXQgeCA9IDA7IC8vIGFjY3VtdWxhdGVkIFggb2Zmc2V0IG9mIHByZXZpb3VzIGNoYXJhY3RlciBwbGFjZXNcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBGT1JNQVRfU1RSSU5HLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAvLyB2ZXJ0aWNlcyBmb3IgdGhlIGJvdW5kcyBvZiB0aGUgY2hhcmFjdGVyXHJcbiAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKCB4LCAwLCAwICkgKTtcclxuICAgICAgZ2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoIHggKyBtYXhXaWR0aCwgMCwgMCApICk7XHJcbiAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKCB4ICsgbWF4V2lkdGgsIG1heEhlaWdodCwgMCApICk7XHJcbiAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKCB4ICsgMCwgbWF4SGVpZ2h0LCAwICkgKTtcclxuICAgICAgeCArPSBnbHlwaHNbIEZPUk1BVF9TVFJJTkdbIGkgXSBdLmFkdmFuY2U7XHJcblxyXG4gICAgICAvLyBwdXNoIFVWIHBsYWNlaG9sZGVycyBmb3IgZWFjaCBjb3JuZXJcclxuICAgICAgdXZzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKCkgKTtcclxuICAgICAgdXZzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKCkgKTtcclxuICAgICAgdXZzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKCkgKTtcclxuICAgICAgdXZzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKCkgKTtcclxuXHJcbiAgICAgIC8vIHR3byBmYWNlcyB0byBtYWtlIHVwIHRoZSBxdWFkIGZvciB0aGUgY2hhcmFjdGVyXHJcbiAgICAgIGNvbnN0IG9mZnNldCA9IDQgKiBpO1xyXG4gICAgICBnZW9tZXRyeS5mYWNlcy5wdXNoKCBuZXcgVEhSRUUuRmFjZTMoIG9mZnNldCwgb2Zmc2V0ICsgMSwgb2Zmc2V0ICsgMiApICk7XHJcbiAgICAgIGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbIDAgXS5wdXNoKCBbIHV2c1sgb2Zmc2V0IF0sIHV2c1sgb2Zmc2V0ICsgMSBdLCB1dnNbIG9mZnNldCArIDIgXSBdICk7XHJcbiAgICAgIGdlb21ldHJ5LmZhY2VzLnB1c2goIG5ldyBUSFJFRS5GYWNlMyggb2Zmc2V0LCBvZmZzZXQgKyAyLCBvZmZzZXQgKyAzICkgKTtcclxuICAgICAgZ2VvbWV0cnkuZmFjZVZlcnRleFV2c1sgMCBdLnB1c2goIFsgdXZzWyBvZmZzZXQgXSwgdXZzWyBvZmZzZXQgKyAyIF0sIHV2c1sgb2Zmc2V0ICsgMyBdIF0gKTtcclxuICAgIH1cclxuXHJcbiAgICBnZW9tZXRyeS5keW5hbWljID0gdHJ1ZTsgLy8gdGVsbHMgdGhyZWUuanMgdGhhdCB3ZSB3aWxsIGNoYW5nZSB0aGluZ3NcclxuICAgIGdlb21ldHJ5LnV2c05lZWRVcGRhdGUgPSB0cnVlOyAvLyB3aWxsIG5lZWQgd2hlbiB3ZSBjaGFuZ2UgVVZzXHJcbiAgICAvLyBAcHJpdmF0ZSB7T2JqZWN0fSAtIGNoZWFwIGRlZXAgY29weVxyXG4gICAgY29uc3Qgc3BlY2lmaWNNYXRlcmlhbFVuaWZvcm1zID0gSlNPTi5wYXJzZSggSlNPTi5zdHJpbmdpZnkoIG1hdGVyaWFsVW5pZm9ybXMgKSApO1xyXG4gICAgc3BlY2lmaWNNYXRlcmlhbFVuaWZvcm1zLm1hcC52YWx1ZSA9IHRleHR1cmU7XHJcblxyXG4gICAgTW9sZWN1bGVTaGFwZXNDb2xvcnMuYm9uZEFuZ2xlUmVhZG91dFByb3BlcnR5LmxpbmsoIGNvbG9yID0+IHtcclxuICAgICAgc3BlY2lmaWNNYXRlcmlhbFVuaWZvcm1zLmNvbG9yLnZhbHVlID0gWyBjb2xvci5yIC8gMjU1LCBjb2xvci5nIC8gMjU1LCBjb2xvci5iIC8gMjU1IF07IC8vIHVuaWZvcm1zIHVzZSBudW1iZXIgYXJyYXlzXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbWF0ZXJpYWwgPSBNb2xlY3VsZVNoYXBlc0dsb2JhbHMudXNlV2ViR0xQcm9wZXJ0eS52YWx1ZSA/IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCgge1xyXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IHZlcnRleFNoYWRlcixcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IGZyYWdtZW50U2hhZGVyLFxyXG4gICAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlLFxyXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcclxuICAgICAgdW5pZm9ybXM6IHNwZWNpZmljTWF0ZXJpYWxVbmlmb3Jtc1xyXG4gICAgfSApIDogbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKCB7IC8vIE5PVEU6IG5vdCBncmVhdCBDYW52YXMgYXBwZWFyYW5jZS4gTWF5IGhhdmUgcGVyZm9ybWFuY2UgcGVuYWx0aWVzXHJcbiAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXHJcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxyXG4gICAgICBtYXA6IHRleHR1cmVcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggZ2VvbWV0cnksIG1hdGVyaWFsICk7XHJcblxyXG4gICAgdGhpcy51dnMgPSB1dnM7IC8vIEBwcml2YXRlIHtBcnJheS48VEhSRUUuVmVjdG9yMz59IC0gc3RvcmVzIHRoZSB0ZXh0dXJlIGNvb3JkaW5hdGVzIHVzZWQgZm9yIGRyYXdpbmdcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7T2JqZWN0fSAtIGNoZWFwIGRlZXAgY29weVxyXG4gICAgdGhpcy5tYXRlcmlhbFVuaWZvcm1zID0gc3BlY2lmaWNNYXRlcmlhbFVuaWZvcm1zO1xyXG5cclxuICAgIHRoaXMudW5zZXRMYWJlbCgpO1xyXG4gIH1cclxuXHJcbiAgLypcclxuICAgKiBEaXNwbGF5cyBhbmQgcG9zaXRpb25zIHRoZSBsYWJlbCwgYW5kIHNldHMgaXRzIHRleHQuXHJcbiAgICogU2FtZSBhcyBBUEkgZm9yIExhYmVsRmFsbGJhY2tOb2RlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZ1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBicmlnaHRuZXNzIC0gSW4gcmFuZ2UgWzAsMV1cclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGNlbnRlclNjcmVlblBvaW50IC0gVGhlIGNlbnRlciBvZiB0aGUgY2VudHJhbCBhdG9tIGluIHNjcmVlbiBjb29yZGluYXRlc1xyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gbWlkU2NyZWVuUG9pbnQgLSBUaGUgbWlkcG9pbnQgb2YgdGhlIGJvbmQtYW5nbGUgYXJjIGluIHNjcmVlbiBjb29yZGluYXRlc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsYXlvdXRTY2FsZSAtIFRoZSBTY3JlZW5WaWV3J3MgbGF5b3V0IHNjYWxlXHJcbiAgICovXHJcbiAgc2V0TGFiZWwoIHN0cmluZywgYnJpZ2h0bmVzcywgY2VudGVyU2NyZWVuUG9pbnQsIG1pZFNjcmVlblBvaW50LCBsYXlvdXRTY2FsZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHN0cmluZy5sZW5ndGggPT09IDUgfHwgc3RyaW5nLmxlbmd0aCA9PT0gNiApO1xyXG5cclxuICAgIHRoaXMuc2V0U3RyaW5nKCBzdHJpbmcgKTtcclxuICAgIHRoaXMubWF0ZXJpYWxVbmlmb3Jtcy5vcGFjaXR5LnZhbHVlID0gYnJpZ2h0bmVzcztcclxuXHJcbiAgICBjb25zdCBzY2FsZSA9IGxheW91dFNjYWxlICogMC4xMzsgLy8gdHVuZWQgY29uc3RhbnQgdG8gbWF0Y2ggdGhlIGRlc2lyZWQgXCJmb250IHNpemVcIiBvZiB0aGUgbGFiZWxcclxuICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NhbGUueSA9IHRoaXMuc2NhbGUueiA9IHNjYWxlO1xyXG5cclxuICAgIGNvbnN0IHhDZW50ZXJpbmcgPSBzdHJpbmcubGVuZ3RoID09PSA2ID8gLWxvbmdXaWR0aCAvIDIgOiAtc2hvcnRYT2Zmc2V0IC0gc2hvcnRXaWR0aCAvIDI7XHJcbiAgICBjb25zdCB5Q2VudGVyaW5nID0gLW1heEhlaWdodCAvIDI7XHJcblxyXG4gICAgLy8gd2UgcG9zaXRpb24gYmFzZWQgb24gb3VyIHVwcGVyLWxlZnQgb3JpZ2luXHJcbiAgICBjb25zdCBvZmZzZXQgPSBtaWRTY3JlZW5Qb2ludC5taW51cyggY2VudGVyU2NyZWVuUG9pbnQgKTtcclxuICAgIC8vIE11dGFibHkgY29uc3RydWN0IG9mZnNldCBhbW91bnQuIE1hZ2ljIG51bWJlciB2ZWN0b3IgaXMgdHVuZWQgdG8gY29ycmVzcG9uZCB3ZWxsIHdpdGggdGhlIGV4dHJhIGhvcml6b250YWxcclxuICAgIC8vIGFuZCB2ZXJ0aWNhbCBzcGFjaW5nIG5lZWRlZCAoaWYgaXQgd2Fzbid0IGFwcGxpZWQsIG91ciB0ZXh0IHdvdWxkIGJlIGNlbnRlcmVkIG9uIHRoZSBhY3R1YWwgYXJjIGluc3RlYWQgb2ZcclxuICAgIC8vIGJlaW5nIHB1c2hlZCBmYXJ0aGVyIGF3YXkpLlxyXG4gICAgY29uc3Qgb2Zmc2V0QW1vdW50ID0gb2Zmc2V0Lm5vcm1hbGl6ZWQoKS5jb21wb25lbnRNdWx0aXBseSggbmV3IFZlY3RvcjIoIDAuMzgsIDAuMiApICkubWFnbml0dWRlO1xyXG4gICAgdGhpcy5wb3NpdGlvbi54ID0gbWlkU2NyZWVuUG9pbnQueCArIG9mZnNldC54ICogb2Zmc2V0QW1vdW50ICsgeENlbnRlcmluZyAqIHNjYWxlO1xyXG4gICAgdGhpcy5wb3NpdGlvbi55ID0gbWlkU2NyZWVuUG9pbnQueSArIG9mZnNldC55ICogb2Zmc2V0QW1vdW50ICsgeUNlbnRlcmluZyAqIHNjYWxlO1xyXG4gIH1cclxuXHJcbiAgLypcclxuICAgKiBNYWtlcyB0aGUgbGFiZWwgaW52aXNpYmxlXHJcbiAgICogU2FtZSBhcyBBUEkgZm9yIExhYmVsRmFsbGJhY2tOb2RlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHVuc2V0TGFiZWwoKSB7XHJcbiAgICB0aGlzLm1hdGVyaWFsVW5pZm9ybXMub3BhY2l0eS52YWx1ZSA9IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBVViBjb29yZGluYXRlcyB0byBkaXNwbGF5IHRoZSByZXF1ZXN0ZWQgc3RyaW5nXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmdcclxuICAgKi9cclxuICBzZXRTdHJpbmcoIHN0cmluZyApIHtcclxuICAgIGxldCBpZHggPSAwO1xyXG4gICAgaWYgKCBzdHJpbmcubGVuZ3RoID09PSA2ICkge1xyXG4gICAgICB0aGlzLnNldEdseXBoKCAwLCBzdHJpbmdbIGlkeCsrIF0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnVuc2V0R2x5cGgoIDAgKTtcclxuICAgIH1cclxuICAgIHRoaXMuc2V0R2x5cGgoIDEsIHN0cmluZ1sgaWR4KysgXSApO1xyXG4gICAgdGhpcy5zZXRHbHlwaCggMiwgc3RyaW5nWyBpZHgrKyBdICk7XHJcbiAgICB0aGlzLnNldEdseXBoKCAzLCBzdHJpbmdbIGlkeCsrIF0gKTtcclxuICAgIHRoaXMuc2V0R2x5cGgoIDQsIHN0cmluZ1sgaWR4KysgXSApO1xyXG4gICAgdGhpcy5zZXRHbHlwaCggNSwgc3RyaW5nWyBpZHgrKyBdICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBVViBjb29yZGluYXRlcyBmb3IgYSBzaW5nbGUgZ2x5cGgsIDAtaW5kZXhlZFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nXHJcbiAgICovXHJcbiAgc2V0R2x5cGgoIGluZGV4LCBzdHJpbmcgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBnbHlwaHNbIHN0cmluZyBdICk7XHJcblxyXG4gICAgY29uc3QgZ2x5cGggPSBnbHlwaHNbIHN0cmluZyBdO1xyXG4gICAgY29uc3QgbWluVSA9IGdseXBoLmJvdW5kcy5taW5YO1xyXG4gICAgY29uc3QgbWF4VSA9IGdseXBoLmJvdW5kcy5tYXhYO1xyXG4gICAgY29uc3QgbWluViA9IDEgLSBnbHlwaC5ib3VuZHMubWF4WTtcclxuICAgIGNvbnN0IG1heFYgPSAxIC0gZ2x5cGguYm91bmRzLm1pblk7XHJcblxyXG4gICAgdGhpcy5zZXRVVnMoIGluZGV4LCBtaW5VLCBtaW5WLCBtYXhVLCBtYXhWICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYWtlcyB0aGUgY2hhcmFjdGVyIGF0IHRoZSBpbmRleCBpbnZpc2libGUuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxyXG4gICAqL1xyXG4gIHVuc2V0R2x5cGgoIGluZGV4ICkge1xyXG4gICAgLy8gc2V0IGFsbCB0ZXh0dXJlIGNvb3JkaW5hdGVzIHRvIDAsIHNvIGl0IHdpbGwgZGlzcGxheSBub3RoaW5nXHJcbiAgICB0aGlzLnNldFVWcyggaW5kZXgsIDAsIDAsIDAsIDAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgVVZzIGZvciBhIHNwZWNpZmljIGNoYXJhY3Rlci5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1pblVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWluVlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhVXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1heFZcclxuICAgKi9cclxuICBzZXRVVnMoIGluZGV4LCBtaW5VLCBtaW5WLCBtYXhVLCBtYXhWICkge1xyXG4gICAgY29uc3Qgb2Zmc2V0ID0gaW5kZXggKiA0O1xyXG5cclxuICAgIHRoaXMudXZzWyBvZmZzZXQgXS54ID0gbWluVTtcclxuICAgIHRoaXMudXZzWyBvZmZzZXQgXS55ID0gbWF4VjtcclxuICAgIHRoaXMudXZzWyBvZmZzZXQgKyAxIF0ueCA9IG1heFU7XHJcbiAgICB0aGlzLnV2c1sgb2Zmc2V0ICsgMSBdLnkgPSBtYXhWO1xyXG4gICAgdGhpcy51dnNbIG9mZnNldCArIDIgXS54ID0gbWF4VTtcclxuICAgIHRoaXMudXZzWyBvZmZzZXQgKyAyIF0ueSA9IG1pblY7XHJcbiAgICB0aGlzLnV2c1sgb2Zmc2V0ICsgMyBdLnggPSBtaW5VO1xyXG4gICAgdGhpcy51dnNbIG9mZnNldCArIDMgXS55ID0gbWluVjtcclxuICAgIHRoaXMuZ2VvbWV0cnkudXZzTmVlZFVwZGF0ZSA9IHRydWU7IC8vIHdpbGwgbmVlZCB3aGVuIHdlIGNoYW5nZSBVVnNcclxuICB9XHJcbn1cclxuXHJcbm1vbGVjdWxlU2hhcGVzLnJlZ2lzdGVyKCAnTGFiZWxXZWJHTFZpZXcnLCBMYWJlbFdlYkdMVmlldyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTGFiZWxXZWJHTFZpZXc7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztB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