// Copyright 2014-2021, University of Colorado Boulder

/**
 * View of the angle (sector and arc) between two bonds. The sector is the filled-in area between two bonds, and the
 * arc is the line along the edge of the sector.
 *
 * This is an efficient but WebGL-specific implementation of the bond angles that can't be used with the Canvas fallback.
 *
 * NOTE: This does NOT include the text readout for the label
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import moleculeShapes from '../../../moleculeShapes.js';
import MoleculeShapesGlobals from '../../MoleculeShapesGlobals.js';
import MoleculeShapesColors from '../MoleculeShapesColors.js';
import BondAngleView from './BondAngleView.js';
import LocalGeometry from './LocalGeometry.js';
import LocalPool from './LocalPool.js';
const RADIAL_VERTEX_COUNT = 24; // how many vertices to use along the view

/*---------------------------------------------------------------------------*
 * Geometry for the sector and arc
 *----------------------------------------------------------------------------*/

/*
 * Since we use a custom vertex shader for properly positioning and transforming our vertices, we ship our vertices
 * over in a non-standard coordinate system:
 * x: in the range [0,1], like a polar angle but scaled so 0 is at one bond direction and 1 is at the other bond direction.
 * y: the distance from the central atom (allows us to change the radius if needed)
 * z: ignored
 */

function createSectorGeometry() {
  const geometry = new THREE.Geometry();

  // first vertex (0) at the center
  geometry.vertices.push(new THREE.Vector3(0, 0, 0));

  // the rest of the vertices (1 to RADIAL_VERTEX_COUNT) are radial
  for (let i = 0; i < RADIAL_VERTEX_COUNT; i++) {
    const ratio = i / (RADIAL_VERTEX_COUNT - 1); // from 0 to 1
    geometry.vertices.push(new THREE.Vector3(ratio, BondAngleView.radius, 0));
  }

  // faces (1 less than the number of radial vertices)
  for (let j = 0; j < RADIAL_VERTEX_COUNT - 1; j++) {
    // we use a fan approach, first vertex is always the first (center) vertex, the other two are radial
    geometry.faces.push(new THREE.Face3(0, j + 1, j + 2));
  }
  return geometry;
}
function createArcGeometry() {
  const geometry = new THREE.Geometry();

  // radial vertices only
  for (let i = 0; i < RADIAL_VERTEX_COUNT; i++) {
    const ratio = i / (RADIAL_VERTEX_COUNT - 1); // from 0 to 1
    geometry.vertices.push(new THREE.Vector3(ratio, BondAngleView.radius, 0));
  }
  return geometry;
}

// handles to get renderer-specific copies of the geometry
const localSectorGeometry = new LocalGeometry(createSectorGeometry());
const localArcGeometry = new LocalGeometry(createArcGeometry());

/*---------------------------------------------------------------------------*
 * GLSL Shader for the sector and arc
 *----------------------------------------------------------------------------*/

/*
 * We use a vertex shader that allows us to modify the bond angle's start and end points in a much faster way
 * (by changing uniforms) rather than recomputing all of the points on the CPU and shipping that to the GPU every
 * frame.
 *
 * midpointUnit is a unit vector from the center of the atom to the midpoint of the bond view's arc, and planarUnit
 * is a unit vector perpendicular to midpointUnit such that they both form a basis for the plane of our view.
 */
const vertexShader = ['uniform float angle;', 'uniform vec3 midpointUnit;', 'uniform vec3 planarUnit;', 'void main() {',
// Since our X coordinate is from [0,1], we map it to [-angle/2, angle/2] so that the midpoint (0.5) maps to
// an angle of 0.
'  float theta = ( position.x - 0.5 ) * angle;',
// Use our basis vectors to compute the point
'  vec3 point = position.y * ( cos( theta ) * midpointUnit + sin( theta ) * planarUnit );',
// Standard THREE.js uniforms provided to transform the point into the correct place
'  gl_Position = projectionMatrix * modelViewMatrix * vec4( point, 1.0 );', '}'].join('\n');
const fragmentShader = ['uniform float opacity;', 'uniform vec3 color;', 'void main() {', '  gl_FragColor = vec4( color, opacity );', '}'].join('\n');

// "prototype" uniforms object. Deep copies will be made for each view since they need to change independently.
// This uses three.js's uniform format and types, see https://github.com/mrdoob/three.js/wiki/Uniforms-types
const uniforms = {
  opacity: {
    type: 'f',
    value: 0.5
  },
  color: {
    type: '3f',
    value: [1, 1, 1]
  },
  angle: {
    type: 'f',
    value: Math.PI / 2
  },
  midpointUnit: {
    type: '3f',
    value: [0, 1, 0]
  },
  planarUnit: {
    type: '3f',
    value: [1, 0, 0]
  }
};
class BondAngleWebGLView extends BondAngleView {
  /**
   * @param {THREE.Renderer} renderer
   */
  constructor(renderer) {
    assert && assert(MoleculeShapesGlobals.useWebGLProperty.value);
    super();
    this.renderer = renderer; // @private {THREE.Renderer}
    this.arcGeometry = localArcGeometry.get(renderer); // @private {THREE.Geometry}
    this.sectorGeometry = localSectorGeometry.get(renderer); // @private {THREE.Geometry}

    // @private {THREE.ShaderMaterial} - We require one material per view so we can change the uniforms independently.
    this.sectorMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      // render in three.js' transparency pass
      depthWrite: false,
      // don't write depth values, so we don't cause other transparent objects to render
      uniforms: JSON.parse(JSON.stringify(uniforms)) // cheap deep copy
    });
    // set and update our color
    this.sweepColorListener = color => {
      this.sectorMaterial.uniforms.color.value = [color.r / 255, color.g / 255, color.b / 255];
    };
    MoleculeShapesColors.bondAngleSweepProperty.link(this.sweepColorListener);

    // @private {THREE.ShaderMaterial} - We require one material per view so we can change the uniforms independently
    // NOTE: we don't seem to be able to use the same material for rendering both the sector and arc
    this.arcMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      // render in three.js' transparency pass
      depthWrite: false,
      // don't write depth values, so we don't cause other transparent objects to render
      uniforms: JSON.parse(JSON.stringify(uniforms)) // cheap deep copy
    });
    // set and update our color
    this.arcColorListener = color => {
      this.arcMaterial.uniforms.color.value = [color.r / 255, color.g / 255, color.b / 255];
    };
    MoleculeShapesColors.bondAngleArcProperty.link(this.arcColorListener);
    this.sectorView = new THREE.Mesh(this.sectorGeometry, this.sectorMaterial); // @private {THREE.Mesh}
    this.arcView = new THREE.Line(this.arcGeometry, this.arcMaterial); // @private {THREE.Mesh}

    // render the bond angle views on top of everything (but still depth-testing), with arcs on top
    this.sectorView.renderDepth = 10;
    this.arcView.renderDepth = 11;
    this.add(this.sectorView);
    this.add(this.arcView);
  }

  /*
   * @override
   * @public
   *
   * @param {MoleculeShapesScreenView} screenView - Some screen-space information and transformations are needed
   * @param {Property.<boolean>} showBondAnglesProperty
   * @param {Molecule} molecule
   * @param {PairGroup} aGroup
   * @param {PairGroup} bGroup
   * @param {LabelWebGLView|LabelFallbackNode} label
   */
  initialize(screenView, showBondAnglesProperty, molecule, aGroup, bGroup, label) {
    super.initialize(screenView, showBondAnglesProperty, molecule, aGroup, bGroup, label);
    return this;
  }

  /**
   * Disposes this, so it goes to the pool and can be re-initialized.
   * @override
   * @public
   */
  dispose() {
    super.dispose();
    BondAngleWebGLView.pool.put(this, this.renderer);
  }

  /**
   * @override
   * @public
   *
   * @param {Vector3} lastMidpoint - The midpoint of the last frame's bond angle arc, used to stabilize bond angles
   *                                 that are around ~180 degrees.
   * @param {Vector3} localCameraOrientation - A unit vector in the molecule's local coordiante space pointing
   *                                           to the camera.
   */
  updateView(lastMidpoint, localCameraOrientation) {
    super.updateView(lastMidpoint, localCameraOrientation);
    this.sectorMaterial.uniforms.opacity.value = this.viewOpacity * 0.5;
    this.arcMaterial.uniforms.opacity.value = this.viewOpacity * 0.7;
    this.sectorMaterial.uniforms.angle.value = this.viewAngle;
    this.arcMaterial.uniforms.angle.value = this.viewAngle;

    // vector uniforms in three.js use arrays
    const midpointUnitArray = [this.midpointUnit.x, this.midpointUnit.y, this.midpointUnit.z];
    const planarUnitArray = [this.planarUnit.x, this.planarUnit.y, this.planarUnit.z];
    this.sectorMaterial.uniforms.midpointUnit.value = midpointUnitArray;
    this.arcMaterial.uniforms.midpointUnit.value = midpointUnitArray;
    this.sectorMaterial.uniforms.planarUnit.value = planarUnitArray;
    this.arcMaterial.uniforms.planarUnit.value = planarUnitArray;
  }
}

// @private {LocalPool}
BondAngleWebGLView.pool = new LocalPool('BondAngleWebGLView', renderer => new BondAngleWebGLView(renderer));
moleculeShapes.register('BondAngleWebGLView', BondAngleWebGLView);
export default BondAngleWebGLView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtb2xlY3VsZVNoYXBlcyIsIk1vbGVjdWxlU2hhcGVzR2xvYmFscyIsIk1vbGVjdWxlU2hhcGVzQ29sb3JzIiwiQm9uZEFuZ2xlVmlldyIsIkxvY2FsR2VvbWV0cnkiLCJMb2NhbFBvb2wiLCJSQURJQUxfVkVSVEVYX0NPVU5UIiwiY3JlYXRlU2VjdG9yR2VvbWV0cnkiLCJnZW9tZXRyeSIsIlRIUkVFIiwiR2VvbWV0cnkiLCJ2ZXJ0aWNlcyIsInB1c2giLCJWZWN0b3IzIiwiaSIsInJhdGlvIiwicmFkaXVzIiwiaiIsImZhY2VzIiwiRmFjZTMiLCJjcmVhdGVBcmNHZW9tZXRyeSIsImxvY2FsU2VjdG9yR2VvbWV0cnkiLCJsb2NhbEFyY0dlb21ldHJ5IiwidmVydGV4U2hhZGVyIiwiam9pbiIsImZyYWdtZW50U2hhZGVyIiwidW5pZm9ybXMiLCJvcGFjaXR5IiwidHlwZSIsInZhbHVlIiwiY29sb3IiLCJhbmdsZSIsIk1hdGgiLCJQSSIsIm1pZHBvaW50VW5pdCIsInBsYW5hclVuaXQiLCJCb25kQW5nbGVXZWJHTFZpZXciLCJjb25zdHJ1Y3RvciIsInJlbmRlcmVyIiwiYXNzZXJ0IiwidXNlV2ViR0xQcm9wZXJ0eSIsImFyY0dlb21ldHJ5IiwiZ2V0Iiwic2VjdG9yR2VvbWV0cnkiLCJzZWN0b3JNYXRlcmlhbCIsIlNoYWRlck1hdGVyaWFsIiwic2lkZSIsIkRvdWJsZVNpZGUiLCJ0cmFuc3BhcmVudCIsImRlcHRoV3JpdGUiLCJKU09OIiwicGFyc2UiLCJzdHJpbmdpZnkiLCJzd2VlcENvbG9yTGlzdGVuZXIiLCJyIiwiZyIsImIiLCJib25kQW5nbGVTd2VlcFByb3BlcnR5IiwibGluayIsImFyY01hdGVyaWFsIiwiYXJjQ29sb3JMaXN0ZW5lciIsImJvbmRBbmdsZUFyY1Byb3BlcnR5Iiwic2VjdG9yVmlldyIsIk1lc2giLCJhcmNWaWV3IiwiTGluZSIsInJlbmRlckRlcHRoIiwiYWRkIiwiaW5pdGlhbGl6ZSIsInNjcmVlblZpZXciLCJzaG93Qm9uZEFuZ2xlc1Byb3BlcnR5IiwibW9sZWN1bGUiLCJhR3JvdXAiLCJiR3JvdXAiLCJsYWJlbCIsImRpc3Bvc2UiLCJwb29sIiwicHV0IiwidXBkYXRlVmlldyIsImxhc3RNaWRwb2ludCIsImxvY2FsQ2FtZXJhT3JpZW50YXRpb24iLCJ2aWV3T3BhY2l0eSIsInZpZXdBbmdsZSIsIm1pZHBvaW50VW5pdEFycmF5IiwieCIsInkiLCJ6IiwicGxhbmFyVW5pdEFycmF5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCb25kQW5nbGVXZWJHTFZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldyBvZiB0aGUgYW5nbGUgKHNlY3RvciBhbmQgYXJjKSBiZXR3ZWVuIHR3byBib25kcy4gVGhlIHNlY3RvciBpcyB0aGUgZmlsbGVkLWluIGFyZWEgYmV0d2VlbiB0d28gYm9uZHMsIGFuZCB0aGVcclxuICogYXJjIGlzIHRoZSBsaW5lIGFsb25nIHRoZSBlZGdlIG9mIHRoZSBzZWN0b3IuXHJcbiAqXHJcbiAqIFRoaXMgaXMgYW4gZWZmaWNpZW50IGJ1dCBXZWJHTC1zcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgYm9uZCBhbmdsZXMgdGhhdCBjYW4ndCBiZSB1c2VkIHdpdGggdGhlIENhbnZhcyBmYWxsYmFjay5cclxuICpcclxuICogTk9URTogVGhpcyBkb2VzIE5PVCBpbmNsdWRlIHRoZSB0ZXh0IHJlYWRvdXQgZm9yIHRoZSBsYWJlbFxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IG1vbGVjdWxlU2hhcGVzIGZyb20gJy4uLy4uLy4uL21vbGVjdWxlU2hhcGVzLmpzJztcclxuaW1wb3J0IE1vbGVjdWxlU2hhcGVzR2xvYmFscyBmcm9tICcuLi8uLi9Nb2xlY3VsZVNoYXBlc0dsb2JhbHMuanMnO1xyXG5pbXBvcnQgTW9sZWN1bGVTaGFwZXNDb2xvcnMgZnJvbSAnLi4vTW9sZWN1bGVTaGFwZXNDb2xvcnMuanMnO1xyXG5pbXBvcnQgQm9uZEFuZ2xlVmlldyBmcm9tICcuL0JvbmRBbmdsZVZpZXcuanMnO1xyXG5pbXBvcnQgTG9jYWxHZW9tZXRyeSBmcm9tICcuL0xvY2FsR2VvbWV0cnkuanMnO1xyXG5pbXBvcnQgTG9jYWxQb29sIGZyb20gJy4vTG9jYWxQb29sLmpzJztcclxuXHJcbmNvbnN0IFJBRElBTF9WRVJURVhfQ09VTlQgPSAyNDsgLy8gaG93IG1hbnkgdmVydGljZXMgdG8gdXNlIGFsb25nIHRoZSB2aWV3XHJcblxyXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICogR2VvbWV0cnkgZm9yIHRoZSBzZWN0b3IgYW5kIGFyY1xyXG4gKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuLypcclxuICogU2luY2Ugd2UgdXNlIGEgY3VzdG9tIHZlcnRleCBzaGFkZXIgZm9yIHByb3Blcmx5IHBvc2l0aW9uaW5nIGFuZCB0cmFuc2Zvcm1pbmcgb3VyIHZlcnRpY2VzLCB3ZSBzaGlwIG91ciB2ZXJ0aWNlc1xyXG4gKiBvdmVyIGluIGEgbm9uLXN0YW5kYXJkIGNvb3JkaW5hdGUgc3lzdGVtOlxyXG4gKiB4OiBpbiB0aGUgcmFuZ2UgWzAsMV0sIGxpa2UgYSBwb2xhciBhbmdsZSBidXQgc2NhbGVkIHNvIDAgaXMgYXQgb25lIGJvbmQgZGlyZWN0aW9uIGFuZCAxIGlzIGF0IHRoZSBvdGhlciBib25kIGRpcmVjdGlvbi5cclxuICogeTogdGhlIGRpc3RhbmNlIGZyb20gdGhlIGNlbnRyYWwgYXRvbSAoYWxsb3dzIHVzIHRvIGNoYW5nZSB0aGUgcmFkaXVzIGlmIG5lZWRlZClcclxuICogejogaWdub3JlZFxyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVNlY3Rvckdlb21ldHJ5KCkge1xyXG4gIGNvbnN0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcblxyXG4gIC8vIGZpcnN0IHZlcnRleCAoMCkgYXQgdGhlIGNlbnRlclxyXG4gIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKCAwLCAwLCAwICkgKTtcclxuXHJcbiAgLy8gdGhlIHJlc3Qgb2YgdGhlIHZlcnRpY2VzICgxIHRvIFJBRElBTF9WRVJURVhfQ09VTlQpIGFyZSByYWRpYWxcclxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBSQURJQUxfVkVSVEVYX0NPVU5UOyBpKysgKSB7XHJcbiAgICBjb25zdCByYXRpbyA9IGkgLyAoIFJBRElBTF9WRVJURVhfQ09VTlQgLSAxICk7IC8vIGZyb20gMCB0byAxXHJcbiAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKCBuZXcgVEhSRUUuVmVjdG9yMyggcmF0aW8sIEJvbmRBbmdsZVZpZXcucmFkaXVzLCAwICkgKTtcclxuICB9XHJcblxyXG4gIC8vIGZhY2VzICgxIGxlc3MgdGhhbiB0aGUgbnVtYmVyIG9mIHJhZGlhbCB2ZXJ0aWNlcylcclxuICBmb3IgKCBsZXQgaiA9IDA7IGogPCBSQURJQUxfVkVSVEVYX0NPVU5UIC0gMTsgaisrICkge1xyXG4gICAgLy8gd2UgdXNlIGEgZmFuIGFwcHJvYWNoLCBmaXJzdCB2ZXJ0ZXggaXMgYWx3YXlzIHRoZSBmaXJzdCAoY2VudGVyKSB2ZXJ0ZXgsIHRoZSBvdGhlciB0d28gYXJlIHJhZGlhbFxyXG4gICAgZ2VvbWV0cnkuZmFjZXMucHVzaCggbmV3IFRIUkVFLkZhY2UzKCAwLCBqICsgMSwgaiArIDIgKSApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGdlb21ldHJ5O1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVBcmNHZW9tZXRyeSgpIHtcclxuICBjb25zdCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xyXG5cclxuICAvLyByYWRpYWwgdmVydGljZXMgb25seVxyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IFJBRElBTF9WRVJURVhfQ09VTlQ7IGkrKyApIHtcclxuICAgIGNvbnN0IHJhdGlvID0gaSAvICggUkFESUFMX1ZFUlRFWF9DT1VOVCAtIDEgKTsgLy8gZnJvbSAwIHRvIDFcclxuICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKCByYXRpbywgQm9uZEFuZ2xlVmlldy5yYWRpdXMsIDAgKSApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGdlb21ldHJ5O1xyXG59XHJcblxyXG4vLyBoYW5kbGVzIHRvIGdldCByZW5kZXJlci1zcGVjaWZpYyBjb3BpZXMgb2YgdGhlIGdlb21ldHJ5XHJcbmNvbnN0IGxvY2FsU2VjdG9yR2VvbWV0cnkgPSBuZXcgTG9jYWxHZW9tZXRyeSggY3JlYXRlU2VjdG9yR2VvbWV0cnkoKSApO1xyXG5jb25zdCBsb2NhbEFyY0dlb21ldHJ5ID0gbmV3IExvY2FsR2VvbWV0cnkoIGNyZWF0ZUFyY0dlb21ldHJ5KCkgKTtcclxuXHJcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gKiBHTFNMIFNoYWRlciBmb3IgdGhlIHNlY3RvciBhbmQgYXJjXHJcbiAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4vKlxyXG4gKiBXZSB1c2UgYSB2ZXJ0ZXggc2hhZGVyIHRoYXQgYWxsb3dzIHVzIHRvIG1vZGlmeSB0aGUgYm9uZCBhbmdsZSdzIHN0YXJ0IGFuZCBlbmQgcG9pbnRzIGluIGEgbXVjaCBmYXN0ZXIgd2F5XHJcbiAqIChieSBjaGFuZ2luZyB1bmlmb3JtcykgcmF0aGVyIHRoYW4gcmVjb21wdXRpbmcgYWxsIG9mIHRoZSBwb2ludHMgb24gdGhlIENQVSBhbmQgc2hpcHBpbmcgdGhhdCB0byB0aGUgR1BVIGV2ZXJ5XHJcbiAqIGZyYW1lLlxyXG4gKlxyXG4gKiBtaWRwb2ludFVuaXQgaXMgYSB1bml0IHZlY3RvciBmcm9tIHRoZSBjZW50ZXIgb2YgdGhlIGF0b20gdG8gdGhlIG1pZHBvaW50IG9mIHRoZSBib25kIHZpZXcncyBhcmMsIGFuZCBwbGFuYXJVbml0XHJcbiAqIGlzIGEgdW5pdCB2ZWN0b3IgcGVycGVuZGljdWxhciB0byBtaWRwb2ludFVuaXQgc3VjaCB0aGF0IHRoZXkgYm90aCBmb3JtIGEgYmFzaXMgZm9yIHRoZSBwbGFuZSBvZiBvdXIgdmlldy5cclxuICovXHJcbmNvbnN0IHZlcnRleFNoYWRlciA9IFtcclxuICAndW5pZm9ybSBmbG9hdCBhbmdsZTsnLFxyXG4gICd1bmlmb3JtIHZlYzMgbWlkcG9pbnRVbml0OycsXHJcbiAgJ3VuaWZvcm0gdmVjMyBwbGFuYXJVbml0OycsXHJcblxyXG4gICd2b2lkIG1haW4oKSB7JyxcclxuICAvLyBTaW5jZSBvdXIgWCBjb29yZGluYXRlIGlzIGZyb20gWzAsMV0sIHdlIG1hcCBpdCB0byBbLWFuZ2xlLzIsIGFuZ2xlLzJdIHNvIHRoYXQgdGhlIG1pZHBvaW50ICgwLjUpIG1hcHMgdG9cclxuICAvLyBhbiBhbmdsZSBvZiAwLlxyXG4gICcgIGZsb2F0IHRoZXRhID0gKCBwb3NpdGlvbi54IC0gMC41ICkgKiBhbmdsZTsnLFxyXG4gIC8vIFVzZSBvdXIgYmFzaXMgdmVjdG9ycyB0byBjb21wdXRlIHRoZSBwb2ludFxyXG4gICcgIHZlYzMgcG9pbnQgPSBwb3NpdGlvbi55ICogKCBjb3MoIHRoZXRhICkgKiBtaWRwb2ludFVuaXQgKyBzaW4oIHRoZXRhICkgKiBwbGFuYXJVbml0ICk7JyxcclxuICAvLyBTdGFuZGFyZCBUSFJFRS5qcyB1bmlmb3JtcyBwcm92aWRlZCB0byB0cmFuc2Zvcm0gdGhlIHBvaW50IGludG8gdGhlIGNvcnJlY3QgcGxhY2VcclxuICAnICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KCBwb2ludCwgMS4wICk7JyxcclxuICAnfSdcclxuXS5qb2luKCAnXFxuJyApO1xyXG5cclxuY29uc3QgZnJhZ21lbnRTaGFkZXIgPSBbXHJcbiAgJ3VuaWZvcm0gZmxvYXQgb3BhY2l0eTsnLFxyXG4gICd1bmlmb3JtIHZlYzMgY29sb3I7JyxcclxuXHJcbiAgJ3ZvaWQgbWFpbigpIHsnLFxyXG4gICcgIGdsX0ZyYWdDb2xvciA9IHZlYzQoIGNvbG9yLCBvcGFjaXR5ICk7JyxcclxuICAnfSdcclxuXS5qb2luKCAnXFxuJyApO1xyXG5cclxuLy8gXCJwcm90b3R5cGVcIiB1bmlmb3JtcyBvYmplY3QuIERlZXAgY29waWVzIHdpbGwgYmUgbWFkZSBmb3IgZWFjaCB2aWV3IHNpbmNlIHRoZXkgbmVlZCB0byBjaGFuZ2UgaW5kZXBlbmRlbnRseS5cclxuLy8gVGhpcyB1c2VzIHRocmVlLmpzJ3MgdW5pZm9ybSBmb3JtYXQgYW5kIHR5cGVzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy93aWtpL1VuaWZvcm1zLXR5cGVzXHJcbmNvbnN0IHVuaWZvcm1zID0ge1xyXG4gIG9wYWNpdHk6IHtcclxuICAgIHR5cGU6ICdmJyxcclxuICAgIHZhbHVlOiAwLjVcclxuICB9LFxyXG4gIGNvbG9yOiB7XHJcbiAgICB0eXBlOiAnM2YnLFxyXG4gICAgdmFsdWU6IFsgMSwgMSwgMSBdXHJcbiAgfSxcclxuICBhbmdsZToge1xyXG4gICAgdHlwZTogJ2YnLFxyXG4gICAgdmFsdWU6IE1hdGguUEkgLyAyXHJcbiAgfSxcclxuICBtaWRwb2ludFVuaXQ6IHtcclxuICAgIHR5cGU6ICczZicsXHJcbiAgICB2YWx1ZTogWyAwLCAxLCAwIF1cclxuICB9LFxyXG4gIHBsYW5hclVuaXQ6IHtcclxuICAgIHR5cGU6ICczZicsXHJcbiAgICB2YWx1ZTogWyAxLCAwLCAwIF1cclxuICB9XHJcbn07XHJcblxyXG5jbGFzcyBCb25kQW5nbGVXZWJHTFZpZXcgZXh0ZW5kcyBCb25kQW5nbGVWaWV3IHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge1RIUkVFLlJlbmRlcmVyfSByZW5kZXJlclxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCByZW5kZXJlciApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIE1vbGVjdWxlU2hhcGVzR2xvYmFscy51c2VXZWJHTFByb3BlcnR5LnZhbHVlICk7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIHRoaXMucmVuZGVyZXIgPSByZW5kZXJlcjsgLy8gQHByaXZhdGUge1RIUkVFLlJlbmRlcmVyfVxyXG4gICAgdGhpcy5hcmNHZW9tZXRyeSA9IGxvY2FsQXJjR2VvbWV0cnkuZ2V0KCByZW5kZXJlciApOyAvLyBAcHJpdmF0ZSB7VEhSRUUuR2VvbWV0cnl9XHJcbiAgICB0aGlzLnNlY3Rvckdlb21ldHJ5ID0gbG9jYWxTZWN0b3JHZW9tZXRyeS5nZXQoIHJlbmRlcmVyICk7IC8vIEBwcml2YXRlIHtUSFJFRS5HZW9tZXRyeX1cclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VEhSRUUuU2hhZGVyTWF0ZXJpYWx9IC0gV2UgcmVxdWlyZSBvbmUgbWF0ZXJpYWwgcGVyIHZpZXcgc28gd2UgY2FuIGNoYW5nZSB0aGUgdW5pZm9ybXMgaW5kZXBlbmRlbnRseS5cclxuICAgIHRoaXMuc2VjdG9yTWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoIHtcclxuICAgICAgdmVydGV4U2hhZGVyOiB2ZXJ0ZXhTaGFkZXIsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBmcmFnbWVudFNoYWRlcixcclxuICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZSxcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsIC8vIHJlbmRlciBpbiB0aHJlZS5qcycgdHJhbnNwYXJlbmN5IHBhc3NcclxuICAgICAgZGVwdGhXcml0ZTogZmFsc2UsIC8vIGRvbid0IHdyaXRlIGRlcHRoIHZhbHVlcywgc28gd2UgZG9uJ3QgY2F1c2Ugb3RoZXIgdHJhbnNwYXJlbnQgb2JqZWN0cyB0byByZW5kZXJcclxuICAgICAgdW5pZm9ybXM6IEpTT04ucGFyc2UoIEpTT04uc3RyaW5naWZ5KCB1bmlmb3JtcyApICkgLy8gY2hlYXAgZGVlcCBjb3B5XHJcbiAgICB9ICk7XHJcbiAgICAvLyBzZXQgYW5kIHVwZGF0ZSBvdXIgY29sb3JcclxuICAgIHRoaXMuc3dlZXBDb2xvckxpc3RlbmVyID0gY29sb3IgPT4ge1xyXG4gICAgICB0aGlzLnNlY3Rvck1hdGVyaWFsLnVuaWZvcm1zLmNvbG9yLnZhbHVlID0gWyBjb2xvci5yIC8gMjU1LCBjb2xvci5nIC8gMjU1LCBjb2xvci5iIC8gMjU1IF07XHJcbiAgICB9O1xyXG4gICAgTW9sZWN1bGVTaGFwZXNDb2xvcnMuYm9uZEFuZ2xlU3dlZXBQcm9wZXJ0eS5saW5rKCB0aGlzLnN3ZWVwQ29sb3JMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtUSFJFRS5TaGFkZXJNYXRlcmlhbH0gLSBXZSByZXF1aXJlIG9uZSBtYXRlcmlhbCBwZXIgdmlldyBzbyB3ZSBjYW4gY2hhbmdlIHRoZSB1bmlmb3JtcyBpbmRlcGVuZGVudGx5XHJcbiAgICAvLyBOT1RFOiB3ZSBkb24ndCBzZWVtIHRvIGJlIGFibGUgdG8gdXNlIHRoZSBzYW1lIG1hdGVyaWFsIGZvciByZW5kZXJpbmcgYm90aCB0aGUgc2VjdG9yIGFuZCBhcmNcclxuICAgIHRoaXMuYXJjTWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoIHtcclxuICAgICAgdmVydGV4U2hhZGVyOiB2ZXJ0ZXhTaGFkZXIsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBmcmFnbWVudFNoYWRlcixcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsIC8vIHJlbmRlciBpbiB0aHJlZS5qcycgdHJhbnNwYXJlbmN5IHBhc3NcclxuICAgICAgZGVwdGhXcml0ZTogZmFsc2UsIC8vIGRvbid0IHdyaXRlIGRlcHRoIHZhbHVlcywgc28gd2UgZG9uJ3QgY2F1c2Ugb3RoZXIgdHJhbnNwYXJlbnQgb2JqZWN0cyB0byByZW5kZXJcclxuICAgICAgdW5pZm9ybXM6IEpTT04ucGFyc2UoIEpTT04uc3RyaW5naWZ5KCB1bmlmb3JtcyApICkgLy8gY2hlYXAgZGVlcCBjb3B5XHJcbiAgICB9ICk7XHJcbiAgICAvLyBzZXQgYW5kIHVwZGF0ZSBvdXIgY29sb3JcclxuICAgIHRoaXMuYXJjQ29sb3JMaXN0ZW5lciA9IGNvbG9yID0+IHtcclxuICAgICAgdGhpcy5hcmNNYXRlcmlhbC51bmlmb3Jtcy5jb2xvci52YWx1ZSA9IFsgY29sb3IuciAvIDI1NSwgY29sb3IuZyAvIDI1NSwgY29sb3IuYiAvIDI1NSBdO1xyXG4gICAgfTtcclxuICAgIE1vbGVjdWxlU2hhcGVzQ29sb3JzLmJvbmRBbmdsZUFyY1Byb3BlcnR5LmxpbmsoIHRoaXMuYXJjQ29sb3JMaXN0ZW5lciApO1xyXG5cclxuICAgIHRoaXMuc2VjdG9yVmlldyA9IG5ldyBUSFJFRS5NZXNoKCB0aGlzLnNlY3Rvckdlb21ldHJ5LCB0aGlzLnNlY3Rvck1hdGVyaWFsICk7IC8vIEBwcml2YXRlIHtUSFJFRS5NZXNofVxyXG4gICAgdGhpcy5hcmNWaWV3ID0gbmV3IFRIUkVFLkxpbmUoIHRoaXMuYXJjR2VvbWV0cnksIHRoaXMuYXJjTWF0ZXJpYWwgKTsgLy8gQHByaXZhdGUge1RIUkVFLk1lc2h9XHJcblxyXG4gICAgLy8gcmVuZGVyIHRoZSBib25kIGFuZ2xlIHZpZXdzIG9uIHRvcCBvZiBldmVyeXRoaW5nIChidXQgc3RpbGwgZGVwdGgtdGVzdGluZyksIHdpdGggYXJjcyBvbiB0b3BcclxuICAgIHRoaXMuc2VjdG9yVmlldy5yZW5kZXJEZXB0aCA9IDEwO1xyXG4gICAgdGhpcy5hcmNWaWV3LnJlbmRlckRlcHRoID0gMTE7XHJcblxyXG4gICAgdGhpcy5hZGQoIHRoaXMuc2VjdG9yVmlldyApO1xyXG4gICAgdGhpcy5hZGQoIHRoaXMuYXJjVmlldyApO1xyXG4gIH1cclxuXHJcbiAgLypcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01vbGVjdWxlU2hhcGVzU2NyZWVuVmlld30gc2NyZWVuVmlldyAtIFNvbWUgc2NyZWVuLXNwYWNlIGluZm9ybWF0aW9uIGFuZCB0cmFuc2Zvcm1hdGlvbnMgYXJlIG5lZWRlZFxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBzaG93Qm9uZEFuZ2xlc1Byb3BlcnR5XHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZX0gbW9sZWN1bGVcclxuICAgKiBAcGFyYW0ge1BhaXJHcm91cH0gYUdyb3VwXHJcbiAgICogQHBhcmFtIHtQYWlyR3JvdXB9IGJHcm91cFxyXG4gICAqIEBwYXJhbSB7TGFiZWxXZWJHTFZpZXd8TGFiZWxGYWxsYmFja05vZGV9IGxhYmVsXHJcbiAgICovXHJcbiAgaW5pdGlhbGl6ZSggc2NyZWVuVmlldywgc2hvd0JvbmRBbmdsZXNQcm9wZXJ0eSwgbW9sZWN1bGUsIGFHcm91cCwgYkdyb3VwLCBsYWJlbCApIHtcclxuICAgIHN1cGVyLmluaXRpYWxpemUoIHNjcmVlblZpZXcsIHNob3dCb25kQW5nbGVzUHJvcGVydHksIG1vbGVjdWxlLCBhR3JvdXAsIGJHcm91cCwgbGFiZWwgKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpc3Bvc2VzIHRoaXMsIHNvIGl0IGdvZXMgdG8gdGhlIHBvb2wgYW5kIGNhbiBiZSByZS1pbml0aWFsaXplZC5cclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuXHJcbiAgICBCb25kQW5nbGVXZWJHTFZpZXcucG9vbC5wdXQoIHRoaXMsIHRoaXMucmVuZGVyZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yM30gbGFzdE1pZHBvaW50IC0gVGhlIG1pZHBvaW50IG9mIHRoZSBsYXN0IGZyYW1lJ3MgYm9uZCBhbmdsZSBhcmMsIHVzZWQgdG8gc3RhYmlsaXplIGJvbmQgYW5nbGVzXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0IGFyZSBhcm91bmQgfjE4MCBkZWdyZWVzLlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yM30gbG9jYWxDYW1lcmFPcmllbnRhdGlvbiAtIEEgdW5pdCB2ZWN0b3IgaW4gdGhlIG1vbGVjdWxlJ3MgbG9jYWwgY29vcmRpYW50ZSBzcGFjZSBwb2ludGluZ1xyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIHRoZSBjYW1lcmEuXHJcbiAgICovXHJcbiAgdXBkYXRlVmlldyggbGFzdE1pZHBvaW50LCBsb2NhbENhbWVyYU9yaWVudGF0aW9uICkge1xyXG4gICAgc3VwZXIudXBkYXRlVmlldyggbGFzdE1pZHBvaW50LCBsb2NhbENhbWVyYU9yaWVudGF0aW9uICk7XHJcblxyXG4gICAgdGhpcy5zZWN0b3JNYXRlcmlhbC51bmlmb3Jtcy5vcGFjaXR5LnZhbHVlID0gdGhpcy52aWV3T3BhY2l0eSAqIDAuNTtcclxuICAgIHRoaXMuYXJjTWF0ZXJpYWwudW5pZm9ybXMub3BhY2l0eS52YWx1ZSA9IHRoaXMudmlld09wYWNpdHkgKiAwLjc7XHJcblxyXG4gICAgdGhpcy5zZWN0b3JNYXRlcmlhbC51bmlmb3Jtcy5hbmdsZS52YWx1ZSA9IHRoaXMudmlld0FuZ2xlO1xyXG4gICAgdGhpcy5hcmNNYXRlcmlhbC51bmlmb3Jtcy5hbmdsZS52YWx1ZSA9IHRoaXMudmlld0FuZ2xlO1xyXG5cclxuICAgIC8vIHZlY3RvciB1bmlmb3JtcyBpbiB0aHJlZS5qcyB1c2UgYXJyYXlzXHJcbiAgICBjb25zdCBtaWRwb2ludFVuaXRBcnJheSA9IFsgdGhpcy5taWRwb2ludFVuaXQueCwgdGhpcy5taWRwb2ludFVuaXQueSwgdGhpcy5taWRwb2ludFVuaXQueiBdO1xyXG4gICAgY29uc3QgcGxhbmFyVW5pdEFycmF5ID0gWyB0aGlzLnBsYW5hclVuaXQueCwgdGhpcy5wbGFuYXJVbml0LnksIHRoaXMucGxhbmFyVW5pdC56IF07XHJcblxyXG4gICAgdGhpcy5zZWN0b3JNYXRlcmlhbC51bmlmb3Jtcy5taWRwb2ludFVuaXQudmFsdWUgPSBtaWRwb2ludFVuaXRBcnJheTtcclxuICAgIHRoaXMuYXJjTWF0ZXJpYWwudW5pZm9ybXMubWlkcG9pbnRVbml0LnZhbHVlID0gbWlkcG9pbnRVbml0QXJyYXk7XHJcblxyXG4gICAgdGhpcy5zZWN0b3JNYXRlcmlhbC51bmlmb3Jtcy5wbGFuYXJVbml0LnZhbHVlID0gcGxhbmFyVW5pdEFycmF5O1xyXG4gICAgdGhpcy5hcmNNYXRlcmlhbC51bmlmb3Jtcy5wbGFuYXJVbml0LnZhbHVlID0gcGxhbmFyVW5pdEFycmF5O1xyXG4gIH1cclxufVxyXG5cclxuLy8gQHByaXZhdGUge0xvY2FsUG9vbH1cclxuQm9uZEFuZ2xlV2ViR0xWaWV3LnBvb2wgPSBuZXcgTG9jYWxQb29sKCAnQm9uZEFuZ2xlV2ViR0xWaWV3JywgcmVuZGVyZXIgPT4gbmV3IEJvbmRBbmdsZVdlYkdMVmlldyggcmVuZGVyZXIgKSApO1xyXG5cclxubW9sZWN1bGVTaGFwZXMucmVnaXN0ZXIoICdCb25kQW5nbGVXZWJHTFZpZXcnLCBCb25kQW5nbGVXZWJHTFZpZXcgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJvbmRBbmdsZVdlYkdMVmlldztcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0sNEJBQTRCO0FBQ3ZELE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQztBQUNsRSxPQUFPQyxvQkFBb0IsTUFBTSw0QkFBNEI7QUFDN0Qs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