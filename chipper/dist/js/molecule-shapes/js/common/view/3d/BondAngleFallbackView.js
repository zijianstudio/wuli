// Copyright 2014-2021, University of Colorado Boulder

/**
 * View of the angle (sector and line) between two bonds, written in three.js so it can be displayed with Canvas instead
 * of WebGL (works for both). Less efficient that BondAngleWebGLView, since we need to update the vertices on the CPU
 * and push them over to the GPU.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import moleculeShapes from '../../../moleculeShapes.js';
import MoleculeShapesGlobals from '../../MoleculeShapesGlobals.js';
import MoleculeShapesColors from '../MoleculeShapesColors.js';
import BondAngleView from './BondAngleView.js';
import LocalPool from './LocalPool.js';
const NUM_VERTICES = 24; // number of radial vertices along the edge

function createArcGeometry(vertices) {
  const geometry = new THREE.Geometry();
  for (let i = 0; i < vertices.length; i++) {
    geometry.vertices.push(vertices[i]);
  }
  geometry.dynamic = true; // so we can be updated

  return geometry;
}
function createSectorGeometry(vertices) {
  const geometry = new THREE.Geometry();

  // center
  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  for (let i = 0; i < vertices.length; i++) {
    // unclear whether concat would be supported
    geometry.vertices.push(vertices[i]);
  }
  // faces
  for (let j = 0; j < vertices.length - 1; j++) {
    geometry.faces.push(new THREE.Face3(0, j + 1, j + 2));
  }
  geometry.dynamic = true; // so we can be updated

  return geometry;
}
class BondAngleFallbackView extends BondAngleView {
  /**
   * @param {THREE.Renderer} renderer
   */
  constructor(renderer) {
    super();
    this.renderer = renderer; // @public {THREE.Renderer}

    // @private {Array.<THREE.Vector3>} shared vertex array between both geometries
    this.arcVertices = [];
    for (let i = 0; i < NUM_VERTICES; i++) {
      this.arcVertices.push(new THREE.Vector3());
    }

    // geometries on each instance, since we need to modify them directly
    this.arcGeometry = createArcGeometry(this.arcVertices); // @private {THREE.Geometry}
    this.sectorGeometry = createSectorGeometry(this.arcVertices); // @private {THREE.Geometry}

    // @private {THREE.MeshBasicMaterial}
    this.sectorMaterial = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      // don't write depth values, so we don't cause other transparent objects to render
      overdraw: MoleculeShapesGlobals.useWebGLProperty.value ? 0 : 0.1 // amount to extend polygons when using Canvas to avoid cracks
    });

    MoleculeShapesGlobals.linkColor(this.sectorMaterial, MoleculeShapesColors.bondAngleSweepProperty);

    // @private {THREE.MeshBasicMaterial}
    this.arcMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.7,
      depthWrite: false // don't write depth values, so we don't cause other transparent objects to render
    });

    MoleculeShapesGlobals.linkColor(this.arcMaterial, MoleculeShapesColors.bondAngleArcProperty);
    this.sectorView = new THREE.Mesh(this.sectorGeometry, this.sectorMaterial); // @private {THREE.Mesh}
    this.arcView = new THREE.Line(this.arcGeometry, this.arcMaterial); // @private {THREE.Mesh}

    // render the bond angle views on top of everything (but still depth-testing), with arcs on top
    this.sectorView.renderDepth = 10;
    this.arcView.renderDepth = 11;
    this.add(this.sectorView);
    this.add(this.arcView);
  }

  /*
   * @public
   * @override
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
   * Disposes so that it can be initialized later. Puts it in the pool.
   * @override
   * @public
   */
  dispose() {
    super.dispose();
    BondAngleFallbackView.pool.put(this, this.renderer);
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
    this.sectorMaterial.opacity = this.viewOpacity / 2;
    this.arcMaterial.opacity = this.viewOpacity * 0.7;

    // update the vertices based on our GLSL shader
    for (let i = 0; i < NUM_VERTICES; i++) {
      const ratio = i / (NUM_VERTICES - 1); // zero to 1

      // map our midpoint to theta=0
      const theta = (ratio - 0.5) * this.viewAngle;

      // use our basis vectors to compute the point
      const position = this.midpointUnit.times(Math.cos(theta)).plus(this.planarUnit.times(Math.sin(theta))).times(BondAngleView.radius);
      const vertex = this.arcVertices[i];
      vertex.x = position.x;
      vertex.y = position.y;
      vertex.z = position.z;
    }

    // let three.js know that the vertices need to be updated
    this.arcGeometry.verticesNeedUpdate = true;
    this.sectorGeometry.verticesNeedUpdate = true;
  }
}

// @private {LocalPool}
BondAngleFallbackView.pool = new LocalPool('BondAngleFallbackView', renderer => new BondAngleFallbackView(renderer));
moleculeShapes.register('BondAngleFallbackView', BondAngleFallbackView);
export default BondAngleFallbackView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtb2xlY3VsZVNoYXBlcyIsIk1vbGVjdWxlU2hhcGVzR2xvYmFscyIsIk1vbGVjdWxlU2hhcGVzQ29sb3JzIiwiQm9uZEFuZ2xlVmlldyIsIkxvY2FsUG9vbCIsIk5VTV9WRVJUSUNFUyIsImNyZWF0ZUFyY0dlb21ldHJ5IiwidmVydGljZXMiLCJnZW9tZXRyeSIsIlRIUkVFIiwiR2VvbWV0cnkiLCJpIiwibGVuZ3RoIiwicHVzaCIsImR5bmFtaWMiLCJjcmVhdGVTZWN0b3JHZW9tZXRyeSIsIlZlY3RvcjMiLCJqIiwiZmFjZXMiLCJGYWNlMyIsIkJvbmRBbmdsZUZhbGxiYWNrVmlldyIsImNvbnN0cnVjdG9yIiwicmVuZGVyZXIiLCJhcmNWZXJ0aWNlcyIsImFyY0dlb21ldHJ5Iiwic2VjdG9yR2VvbWV0cnkiLCJzZWN0b3JNYXRlcmlhbCIsIk1lc2hCYXNpY01hdGVyaWFsIiwic2lkZSIsIkRvdWJsZVNpZGUiLCJ0cmFuc3BhcmVudCIsIm9wYWNpdHkiLCJkZXB0aFdyaXRlIiwib3ZlcmRyYXciLCJ1c2VXZWJHTFByb3BlcnR5IiwidmFsdWUiLCJsaW5rQ29sb3IiLCJib25kQW5nbGVTd2VlcFByb3BlcnR5IiwiYXJjTWF0ZXJpYWwiLCJMaW5lQmFzaWNNYXRlcmlhbCIsImJvbmRBbmdsZUFyY1Byb3BlcnR5Iiwic2VjdG9yVmlldyIsIk1lc2giLCJhcmNWaWV3IiwiTGluZSIsInJlbmRlckRlcHRoIiwiYWRkIiwiaW5pdGlhbGl6ZSIsInNjcmVlblZpZXciLCJzaG93Qm9uZEFuZ2xlc1Byb3BlcnR5IiwibW9sZWN1bGUiLCJhR3JvdXAiLCJiR3JvdXAiLCJsYWJlbCIsImRpc3Bvc2UiLCJwb29sIiwicHV0IiwidXBkYXRlVmlldyIsImxhc3RNaWRwb2ludCIsImxvY2FsQ2FtZXJhT3JpZW50YXRpb24iLCJ2aWV3T3BhY2l0eSIsInJhdGlvIiwidGhldGEiLCJ2aWV3QW5nbGUiLCJwb3NpdGlvbiIsIm1pZHBvaW50VW5pdCIsInRpbWVzIiwiTWF0aCIsImNvcyIsInBsdXMiLCJwbGFuYXJVbml0Iiwic2luIiwicmFkaXVzIiwidmVydGV4IiwieCIsInkiLCJ6IiwidmVydGljZXNOZWVkVXBkYXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCb25kQW5nbGVGYWxsYmFja1ZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldyBvZiB0aGUgYW5nbGUgKHNlY3RvciBhbmQgbGluZSkgYmV0d2VlbiB0d28gYm9uZHMsIHdyaXR0ZW4gaW4gdGhyZWUuanMgc28gaXQgY2FuIGJlIGRpc3BsYXllZCB3aXRoIENhbnZhcyBpbnN0ZWFkXHJcbiAqIG9mIFdlYkdMICh3b3JrcyBmb3IgYm90aCkuIExlc3MgZWZmaWNpZW50IHRoYXQgQm9uZEFuZ2xlV2ViR0xWaWV3LCBzaW5jZSB3ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgdmVydGljZXMgb24gdGhlIENQVVxyXG4gKiBhbmQgcHVzaCB0aGVtIG92ZXIgdG8gdGhlIEdQVS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBtb2xlY3VsZVNoYXBlcyBmcm9tICcuLi8uLi8uLi9tb2xlY3VsZVNoYXBlcy5qcyc7XHJcbmltcG9ydCBNb2xlY3VsZVNoYXBlc0dsb2JhbHMgZnJvbSAnLi4vLi4vTW9sZWN1bGVTaGFwZXNHbG9iYWxzLmpzJztcclxuaW1wb3J0IE1vbGVjdWxlU2hhcGVzQ29sb3JzIGZyb20gJy4uL01vbGVjdWxlU2hhcGVzQ29sb3JzLmpzJztcclxuaW1wb3J0IEJvbmRBbmdsZVZpZXcgZnJvbSAnLi9Cb25kQW5nbGVWaWV3LmpzJztcclxuaW1wb3J0IExvY2FsUG9vbCBmcm9tICcuL0xvY2FsUG9vbC5qcyc7XHJcblxyXG5jb25zdCBOVU1fVkVSVElDRVMgPSAyNDsgLy8gbnVtYmVyIG9mIHJhZGlhbCB2ZXJ0aWNlcyBhbG9uZyB0aGUgZWRnZVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlQXJjR2VvbWV0cnkoIHZlcnRpY2VzICkge1xyXG4gIGNvbnN0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XHJcblxyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgZ2VvbWV0cnkudmVydGljZXMucHVzaCggdmVydGljZXNbIGkgXSApO1xyXG4gIH1cclxuICBnZW9tZXRyeS5keW5hbWljID0gdHJ1ZTsgLy8gc28gd2UgY2FuIGJlIHVwZGF0ZWRcclxuXHJcbiAgcmV0dXJuIGdlb21ldHJ5O1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVTZWN0b3JHZW9tZXRyeSggdmVydGljZXMgKSB7XHJcbiAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcclxuXHJcbiAgLy8gY2VudGVyXHJcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoIDAsIDAsIDAgKSApO1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgLy8gdW5jbGVhciB3aGV0aGVyIGNvbmNhdCB3b3VsZCBiZSBzdXBwb3J0ZWRcclxuICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2goIHZlcnRpY2VzWyBpIF0gKTtcclxuICB9XHJcbiAgLy8gZmFjZXNcclxuICBmb3IgKCBsZXQgaiA9IDA7IGogPCB2ZXJ0aWNlcy5sZW5ndGggLSAxOyBqKysgKSB7XHJcbiAgICBnZW9tZXRyeS5mYWNlcy5wdXNoKCBuZXcgVEhSRUUuRmFjZTMoIDAsIGogKyAxLCBqICsgMiApICk7XHJcbiAgfVxyXG4gIGdlb21ldHJ5LmR5bmFtaWMgPSB0cnVlOyAvLyBzbyB3ZSBjYW4gYmUgdXBkYXRlZFxyXG5cclxuICByZXR1cm4gZ2VvbWV0cnk7XHJcbn1cclxuXHJcbmNsYXNzIEJvbmRBbmdsZUZhbGxiYWNrVmlldyBleHRlbmRzIEJvbmRBbmdsZVZpZXcge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VEhSRUUuUmVuZGVyZXJ9IHJlbmRlcmVyXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHJlbmRlcmVyICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICB0aGlzLnJlbmRlcmVyID0gcmVuZGVyZXI7IC8vIEBwdWJsaWMge1RIUkVFLlJlbmRlcmVyfVxyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBcnJheS48VEhSRUUuVmVjdG9yMz59IHNoYXJlZCB2ZXJ0ZXggYXJyYXkgYmV0d2VlbiBib3RoIGdlb21ldHJpZXNcclxuICAgIHRoaXMuYXJjVmVydGljZXMgPSBbXTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IE5VTV9WRVJUSUNFUzsgaSsrICkge1xyXG4gICAgICB0aGlzLmFyY1ZlcnRpY2VzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKCkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBnZW9tZXRyaWVzIG9uIGVhY2ggaW5zdGFuY2UsIHNpbmNlIHdlIG5lZWQgdG8gbW9kaWZ5IHRoZW0gZGlyZWN0bHlcclxuICAgIHRoaXMuYXJjR2VvbWV0cnkgPSBjcmVhdGVBcmNHZW9tZXRyeSggdGhpcy5hcmNWZXJ0aWNlcyApOyAvLyBAcHJpdmF0ZSB7VEhSRUUuR2VvbWV0cnl9XHJcbiAgICB0aGlzLnNlY3Rvckdlb21ldHJ5ID0gY3JlYXRlU2VjdG9yR2VvbWV0cnkoIHRoaXMuYXJjVmVydGljZXMgKTsgLy8gQHByaXZhdGUge1RIUkVFLkdlb21ldHJ5fVxyXG5cclxuICAgIC8vIEBwcml2YXRlIHtUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbH1cclxuICAgIHRoaXMuc2VjdG9yTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoIHtcclxuICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZSxcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXHJcbiAgICAgIG9wYWNpdHk6IDAuNSxcclxuICAgICAgZGVwdGhXcml0ZTogZmFsc2UsIC8vIGRvbid0IHdyaXRlIGRlcHRoIHZhbHVlcywgc28gd2UgZG9uJ3QgY2F1c2Ugb3RoZXIgdHJhbnNwYXJlbnQgb2JqZWN0cyB0byByZW5kZXJcclxuICAgICAgb3ZlcmRyYXc6IE1vbGVjdWxlU2hhcGVzR2xvYmFscy51c2VXZWJHTFByb3BlcnR5LnZhbHVlID8gMCA6IDAuMSAvLyBhbW91bnQgdG8gZXh0ZW5kIHBvbHlnb25zIHdoZW4gdXNpbmcgQ2FudmFzIHRvIGF2b2lkIGNyYWNrc1xyXG4gICAgfSApO1xyXG4gICAgTW9sZWN1bGVTaGFwZXNHbG9iYWxzLmxpbmtDb2xvciggdGhpcy5zZWN0b3JNYXRlcmlhbCwgTW9sZWN1bGVTaGFwZXNDb2xvcnMuYm9uZEFuZ2xlU3dlZXBQcm9wZXJ0eSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbH1cclxuICAgIHRoaXMuYXJjTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoIHtcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXHJcbiAgICAgIG9wYWNpdHk6IDAuNyxcclxuICAgICAgZGVwdGhXcml0ZTogZmFsc2UgLy8gZG9uJ3Qgd3JpdGUgZGVwdGggdmFsdWVzLCBzbyB3ZSBkb24ndCBjYXVzZSBvdGhlciB0cmFuc3BhcmVudCBvYmplY3RzIHRvIHJlbmRlclxyXG4gICAgfSApO1xyXG4gICAgTW9sZWN1bGVTaGFwZXNHbG9iYWxzLmxpbmtDb2xvciggdGhpcy5hcmNNYXRlcmlhbCwgTW9sZWN1bGVTaGFwZXNDb2xvcnMuYm9uZEFuZ2xlQXJjUHJvcGVydHkgKTtcclxuXHJcbiAgICB0aGlzLnNlY3RvclZpZXcgPSBuZXcgVEhSRUUuTWVzaCggdGhpcy5zZWN0b3JHZW9tZXRyeSwgdGhpcy5zZWN0b3JNYXRlcmlhbCApOyAvLyBAcHJpdmF0ZSB7VEhSRUUuTWVzaH1cclxuICAgIHRoaXMuYXJjVmlldyA9IG5ldyBUSFJFRS5MaW5lKCB0aGlzLmFyY0dlb21ldHJ5LCB0aGlzLmFyY01hdGVyaWFsICk7IC8vIEBwcml2YXRlIHtUSFJFRS5NZXNofVxyXG5cclxuICAgIC8vIHJlbmRlciB0aGUgYm9uZCBhbmdsZSB2aWV3cyBvbiB0b3Agb2YgZXZlcnl0aGluZyAoYnV0IHN0aWxsIGRlcHRoLXRlc3RpbmcpLCB3aXRoIGFyY3Mgb24gdG9wXHJcbiAgICB0aGlzLnNlY3RvclZpZXcucmVuZGVyRGVwdGggPSAxMDtcclxuICAgIHRoaXMuYXJjVmlldy5yZW5kZXJEZXB0aCA9IDExO1xyXG5cclxuICAgIHRoaXMuYWRkKCB0aGlzLnNlY3RvclZpZXcgKTtcclxuICAgIHRoaXMuYWRkKCB0aGlzLmFyY1ZpZXcgKTtcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZVNoYXBlc1NjcmVlblZpZXd9IHNjcmVlblZpZXcgLSBTb21lIHNjcmVlbi1zcGFjZSBpbmZvcm1hdGlvbiBhbmQgdHJhbnNmb3JtYXRpb25zIGFyZSBuZWVkZWRcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gc2hvd0JvbmRBbmdsZXNQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7TW9sZWN1bGV9IG1vbGVjdWxlXHJcbiAgICogQHBhcmFtIHtQYWlyR3JvdXB9IGFHcm91cFxyXG4gICAqIEBwYXJhbSB7UGFpckdyb3VwfSBiR3JvdXBcclxuICAgKiBAcGFyYW0ge0xhYmVsV2ViR0xWaWV3fExhYmVsRmFsbGJhY2tOb2RlfSBsYWJlbFxyXG4gICAqL1xyXG4gIGluaXRpYWxpemUoIHNjcmVlblZpZXcsIHNob3dCb25kQW5nbGVzUHJvcGVydHksIG1vbGVjdWxlLCBhR3JvdXAsIGJHcm91cCwgbGFiZWwgKSB7XHJcbiAgICBzdXBlci5pbml0aWFsaXplKCBzY3JlZW5WaWV3LCBzaG93Qm9uZEFuZ2xlc1Byb3BlcnR5LCBtb2xlY3VsZSwgYUdyb3VwLCBiR3JvdXAsIGxhYmVsICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNwb3NlcyBzbyB0aGF0IGl0IGNhbiBiZSBpbml0aWFsaXplZCBsYXRlci4gUHV0cyBpdCBpbiB0aGUgcG9vbC5cclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuXHJcbiAgICBCb25kQW5nbGVGYWxsYmFja1ZpZXcucG9vbC5wdXQoIHRoaXMsIHRoaXMucmVuZGVyZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yM30gbGFzdE1pZHBvaW50IC0gVGhlIG1pZHBvaW50IG9mIHRoZSBsYXN0IGZyYW1lJ3MgYm9uZCBhbmdsZSBhcmMsIHVzZWQgdG8gc3RhYmlsaXplIGJvbmQgYW5nbGVzXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0IGFyZSBhcm91bmQgfjE4MCBkZWdyZWVzLlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yM30gbG9jYWxDYW1lcmFPcmllbnRhdGlvbiAtIEEgdW5pdCB2ZWN0b3IgaW4gdGhlIG1vbGVjdWxlJ3MgbG9jYWwgY29vcmRpYW50ZSBzcGFjZSBwb2ludGluZ1xyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIHRoZSBjYW1lcmEuXHJcbiAgICovXHJcbiAgdXBkYXRlVmlldyggbGFzdE1pZHBvaW50LCBsb2NhbENhbWVyYU9yaWVudGF0aW9uICkge1xyXG4gICAgc3VwZXIudXBkYXRlVmlldyggbGFzdE1pZHBvaW50LCBsb2NhbENhbWVyYU9yaWVudGF0aW9uICk7XHJcblxyXG4gICAgdGhpcy5zZWN0b3JNYXRlcmlhbC5vcGFjaXR5ID0gdGhpcy52aWV3T3BhY2l0eSAvIDI7XHJcbiAgICB0aGlzLmFyY01hdGVyaWFsLm9wYWNpdHkgPSB0aGlzLnZpZXdPcGFjaXR5ICogMC43O1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgdmVydGljZXMgYmFzZWQgb24gb3VyIEdMU0wgc2hhZGVyXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBOVU1fVkVSVElDRVM7IGkrKyApIHtcclxuICAgICAgY29uc3QgcmF0aW8gPSBpIC8gKCBOVU1fVkVSVElDRVMgLSAxICk7IC8vIHplcm8gdG8gMVxyXG5cclxuICAgICAgLy8gbWFwIG91ciBtaWRwb2ludCB0byB0aGV0YT0wXHJcbiAgICAgIGNvbnN0IHRoZXRhID0gKCByYXRpbyAtIDAuNSApICogdGhpcy52aWV3QW5nbGU7XHJcblxyXG4gICAgICAvLyB1c2Ugb3VyIGJhc2lzIHZlY3RvcnMgdG8gY29tcHV0ZSB0aGUgcG9pbnRcclxuICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLm1pZHBvaW50VW5pdC50aW1lcyggTWF0aC5jb3MoIHRoZXRhICkgKS5wbHVzKCB0aGlzLnBsYW5hclVuaXQudGltZXMoIE1hdGguc2luKCB0aGV0YSApICkgKS50aW1lcyggQm9uZEFuZ2xlVmlldy5yYWRpdXMgKTtcclxuXHJcbiAgICAgIGNvbnN0IHZlcnRleCA9IHRoaXMuYXJjVmVydGljZXNbIGkgXTtcclxuICAgICAgdmVydGV4LnggPSBwb3NpdGlvbi54O1xyXG4gICAgICB2ZXJ0ZXgueSA9IHBvc2l0aW9uLnk7XHJcbiAgICAgIHZlcnRleC56ID0gcG9zaXRpb24uejtcclxuICAgIH1cclxuXHJcbiAgICAvLyBsZXQgdGhyZWUuanMga25vdyB0aGF0IHRoZSB2ZXJ0aWNlcyBuZWVkIHRvIGJlIHVwZGF0ZWRcclxuICAgIHRoaXMuYXJjR2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRoaXMuc2VjdG9yR2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuICB9XHJcblxyXG59XHJcblxyXG4vLyBAcHJpdmF0ZSB7TG9jYWxQb29sfVxyXG5Cb25kQW5nbGVGYWxsYmFja1ZpZXcucG9vbCA9IG5ldyBMb2NhbFBvb2woICdCb25kQW5nbGVGYWxsYmFja1ZpZXcnLCByZW5kZXJlciA9PiBuZXcgQm9uZEFuZ2xlRmFsbGJhY2tWaWV3KCByZW5kZXJlciApICk7XHJcblxyXG5tb2xlY3VsZVNoYXBlcy5yZWdpc3RlciggJ0JvbmRBbmdsZUZhbGxiYWNrVmlldycsIEJvbmRBbmdsZUZhbGxiYWNrVmlldyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQm9uZEFuZ2xlRmFsbGJhY2tWaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLDRCQUE0QjtBQUN2RCxPQUFPQyxxQkFBcUIsTUFBTSxnQ0FBZ0M7QUFDbEUsT0FBT0Msb0JBQW9CLE1BQU0sNEJBQTRCO0FBQzdELE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFDOUMsT0FBT0MsU0FBUyxNQUFNLGdCQUFnQjtBQUV0QyxNQUFNQyxZQUFZLEdBQUcsRUFBRSxDQUFDLENBQUM7O0FBRXpCLFNBQVNDLGlCQUFpQkEsQ0FBRUMsUUFBUSxFQUFHO0VBQ3JDLE1BQU1DLFFBQVEsR0FBRyxJQUFJQyxLQUFLLENBQUNDLFFBQVEsQ0FBQyxDQUFDO0VBRXJDLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHSixRQUFRLENBQUNLLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUc7SUFDMUNILFFBQVEsQ0FBQ0QsUUFBUSxDQUFDTSxJQUFJLENBQUVOLFFBQVEsQ0FBRUksQ0FBQyxDQUFHLENBQUM7RUFDekM7RUFDQUgsUUFBUSxDQUFDTSxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUM7O0VBRXpCLE9BQU9OLFFBQVE7QUFDakI7QUFFQSxTQUFTTyxvQkFBb0JBLENBQUVSLFFBQVEsRUFBRztFQUN4QyxNQUFN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