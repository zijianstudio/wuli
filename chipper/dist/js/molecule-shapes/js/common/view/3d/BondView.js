// Copyright 2014-2021, University of Colorado Boulder

/**
 * View of a {Bond} bond {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../../dot/js/Vector3.js';
import moleculeShapes from '../../../moleculeShapes.js';
import MoleculeShapesGlobals from '../../MoleculeShapesGlobals.js';
import MoleculeShapesColors from '../MoleculeShapesColors.js';
import LocalGeometry from './LocalGeometry.js';
import LocalMaterial from './LocalMaterial.js';
const NUM_RADIAL_SAMPLES = MoleculeShapesGlobals.useWebGLProperty.value ? 32 : 8;
const NUM_AXIAL_SAMPLES = MoleculeShapesGlobals.useWebGLProperty.value ? 1 : 8;
const globalBondGeometry = new THREE.CylinderGeometry(1, 1, 1, NUM_RADIAL_SAMPLES, NUM_AXIAL_SAMPLES, false); // 1 radius, 1 height, 32 segments, open-ended

// renderer-local access
const localBondGeometry = new LocalGeometry(globalBondGeometry);
const localBondMaterial = new LocalMaterial(new THREE.MeshLambertMaterial({
  overdraw: MoleculeShapesGlobals.useWebGLProperty.value ? 0 : 0.5 // amount to extend polygons when using Canvas to avoid cracks
}), {
  color: MoleculeShapesColors.bondProperty
});
class BondView extends THREE.Object3D {
  /*
   * @param {THREE.Renderer} renderer
   * @param {Bond.<PairGroup>} bond
   * @param {Property.<Vector3>} aPositionProperty - position of one end of the bond
   * @param {Property.<Vector3>} bPositionProperty - position of the other end of the bond
   * @param {number} bondRadius - in display units
   * @param {number|null} maxLength - in display units
   */
  constructor(renderer, bond, aPositionProperty, bPositionProperty, bondRadius, maxLength) {
    super();
    this.aMaterial = localBondMaterial.get(renderer); // @private {THREE.Material}
    this.bMaterial = localBondMaterial.get(renderer); // @private {THREE.Material}
    this.bondGeometry = localBondGeometry.get(renderer); // @private {THREE.Geometry}

    this.bond = bond; // @public {Bond.<PairGroup>}
    this.aPositionProperty = aPositionProperty; // @private {Property.<Vector3>}
    this.bPositionProperty = bPositionProperty; // @private {Property.<Vector3>}
    this.bondOrder = bond.order; // @public {number}
    this.bondRadius = bondRadius; // @public {number}
    this.maxLength = maxLength; // @private {number}

    this.aBonds = []; // @private {Array.<THREE.Mesh>}
    this.bBonds = []; // @private {Array.<THREE.Mesh>}

    for (let i = 0; i < this.bondOrder; i++) {
      // they will have unit height and unit radius. We will scale, rotate and translate them later
      this.aBonds.push(new THREE.Mesh(this.bondGeometry, this.aMaterial));
      this.bBonds.push(new THREE.Mesh(this.bondGeometry, this.bMaterial));
    }

    // bind won't work
    _.each(this.aBonds, bond => {
      this.add(bond);
    });
    _.each(this.bBonds, bond => {
      this.add(bond);
    });
  }

  /**
   * Updates the BondView's appearance.
   * @public
   *
   * @param {THREE.Vector3} cameraPosition - The position of the camera in the molecule's local coordinate frame.
   */
  updateView(cameraPosition) {
    // extract our start and end
    const start = this.aPositionProperty.value;
    const end = this.bPositionProperty.value;

    // unit vector point in the direction of the end from the start
    const towardsEnd = end.minus(start).normalized();

    // calculate the length of the bond. sometimes it can be length-limited, and we push the bond towards B
    const distance = start.distance(end);
    let length;
    let overLength = 0;
    if (this.maxLength !== null && distance > this.maxLength) {
      // our bond would be too long
      length = this.maxLength;
      overLength = distance - this.maxLength;
    } else {
      length = distance;
    }

    // find the center of our bond. we add in the "over" length if necessary to offset the bond from between A and B
    const bondCenter = start.times(0.5).plus(end.times(0.5)).plus(towardsEnd.times(overLength / 2));

    // get a unit vector perpendicular to the bond direction and camera direction
    const perpendicular = bondCenter.minus(end).normalized().cross(bondCenter.minus(cameraPosition).normalized()).normalized();

    /*
     * Compute offsets from the "central" bond position, for showing double and triple bonds.
     * The offsets are basically the relative positions of the 1/2/3 cylinders that are displayed as a bond.
     */
    let offsets;

    // how far bonds are apart. constant refined for visual appearance. triple-bonds aren't wider than atoms, most notably
    const bondSeparation = this.bondRadius * (12 / 5);
    switch (this.bondOrder) {
      case 1:
        offsets = [new Vector3(0, 0, 0)];
        break;
      case 2:
        offsets = [perpendicular.times(bondSeparation / 2), perpendicular.times(-bondSeparation / 2)];
        break;
      case 3:
        offsets = [Vector3.ZERO, perpendicular.times(bondSeparation), perpendicular.times(-bondSeparation)];
        break;
      default:
        throw new Error(`bad bond order: ${this.bondOrder}`);
    }

    // since we need to support two different colors (A-colored and B-colored), we need to compute the offsets from the bond center for each
    const colorOffset = towardsEnd.times(length / 4);
    const threeZUnit = new THREE.Vector3(0, 1, 0);
    const threeTowardsEnd = new THREE.Vector3().copy(towardsEnd);
    for (let i = 0; i < this.bondOrder; i++) {
      const aTranslation = bondCenter.plus(offsets[i]).minus(colorOffset);
      const bTranslation = bondCenter.plus(offsets[i]).plus(colorOffset);
      this.aBonds[i].position.set(aTranslation.x, aTranslation.y, aTranslation.z);
      this.bBonds[i].position.set(bTranslation.x, bTranslation.y, bTranslation.z);
      this.aBonds[i].quaternion.setFromUnitVectors(threeZUnit, threeTowardsEnd);
      this.bBonds[i].quaternion.setFromUnitVectors(threeZUnit, threeTowardsEnd);
      this.aBonds[i].scale.x = this.aBonds[i].scale.z = this.bondRadius;
      this.bBonds[i].scale.x = this.bBonds[i].scale.z = this.bondRadius;
      this.aBonds[i].scale.y = this.bBonds[i].scale.y = length / 2;
      this.aBonds[i].updateMatrix();
      this.bBonds[i].updateMatrix();
    }
  }
}
moleculeShapes.register('BondView', BondView);
export default BondView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IzIiwibW9sZWN1bGVTaGFwZXMiLCJNb2xlY3VsZVNoYXBlc0dsb2JhbHMiLCJNb2xlY3VsZVNoYXBlc0NvbG9ycyIsIkxvY2FsR2VvbWV0cnkiLCJMb2NhbE1hdGVyaWFsIiwiTlVNX1JBRElBTF9TQU1QTEVTIiwidXNlV2ViR0xQcm9wZXJ0eSIsInZhbHVlIiwiTlVNX0FYSUFMX1NBTVBMRVMiLCJnbG9iYWxCb25kR2VvbWV0cnkiLCJUSFJFRSIsIkN5bGluZGVyR2VvbWV0cnkiLCJsb2NhbEJvbmRHZW9tZXRyeSIsImxvY2FsQm9uZE1hdGVyaWFsIiwiTWVzaExhbWJlcnRNYXRlcmlhbCIsIm92ZXJkcmF3IiwiY29sb3IiLCJib25kUHJvcGVydHkiLCJCb25kVmlldyIsIk9iamVjdDNEIiwiY29uc3RydWN0b3IiLCJyZW5kZXJlciIsImJvbmQiLCJhUG9zaXRpb25Qcm9wZXJ0eSIsImJQb3NpdGlvblByb3BlcnR5IiwiYm9uZFJhZGl1cyIsIm1heExlbmd0aCIsImFNYXRlcmlhbCIsImdldCIsImJNYXRlcmlhbCIsImJvbmRHZW9tZXRyeSIsImJvbmRPcmRlciIsIm9yZGVyIiwiYUJvbmRzIiwiYkJvbmRzIiwiaSIsInB1c2giLCJNZXNoIiwiXyIsImVhY2giLCJhZGQiLCJ1cGRhdGVWaWV3IiwiY2FtZXJhUG9zaXRpb24iLCJzdGFydCIsImVuZCIsInRvd2FyZHNFbmQiLCJtaW51cyIsIm5vcm1hbGl6ZWQiLCJkaXN0YW5jZSIsImxlbmd0aCIsIm92ZXJMZW5ndGgiLCJib25kQ2VudGVyIiwidGltZXMiLCJwbHVzIiwicGVycGVuZGljdWxhciIsImNyb3NzIiwib2Zmc2V0cyIsImJvbmRTZXBhcmF0aW9uIiwiWkVSTyIsIkVycm9yIiwiY29sb3JPZmZzZXQiLCJ0aHJlZVpVbml0IiwidGhyZWVUb3dhcmRzRW5kIiwiY29weSIsImFUcmFuc2xhdGlvbiIsImJUcmFuc2xhdGlvbiIsInBvc2l0aW9uIiwic2V0IiwieCIsInkiLCJ6IiwicXVhdGVybmlvbiIsInNldEZyb21Vbml0VmVjdG9ycyIsInNjYWxlIiwidXBkYXRlTWF0cml4IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCb25kVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IG9mIGEge0JvbmR9IGJvbmQge1RIUkVFLk9iamVjdDNEfVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjMuanMnO1xyXG5pbXBvcnQgbW9sZWN1bGVTaGFwZXMgZnJvbSAnLi4vLi4vLi4vbW9sZWN1bGVTaGFwZXMuanMnO1xyXG5pbXBvcnQgTW9sZWN1bGVTaGFwZXNHbG9iYWxzIGZyb20gJy4uLy4uL01vbGVjdWxlU2hhcGVzR2xvYmFscy5qcyc7XHJcbmltcG9ydCBNb2xlY3VsZVNoYXBlc0NvbG9ycyBmcm9tICcuLi9Nb2xlY3VsZVNoYXBlc0NvbG9ycy5qcyc7XHJcbmltcG9ydCBMb2NhbEdlb21ldHJ5IGZyb20gJy4vTG9jYWxHZW9tZXRyeS5qcyc7XHJcbmltcG9ydCBMb2NhbE1hdGVyaWFsIGZyb20gJy4vTG9jYWxNYXRlcmlhbC5qcyc7XHJcblxyXG5jb25zdCBOVU1fUkFESUFMX1NBTVBMRVMgPSBNb2xlY3VsZVNoYXBlc0dsb2JhbHMudXNlV2ViR0xQcm9wZXJ0eS52YWx1ZSA/IDMyIDogODtcclxuY29uc3QgTlVNX0FYSUFMX1NBTVBMRVMgPSBNb2xlY3VsZVNoYXBlc0dsb2JhbHMudXNlV2ViR0xQcm9wZXJ0eS52YWx1ZSA/IDEgOiA4O1xyXG5jb25zdCBnbG9iYWxCb25kR2VvbWV0cnkgPSBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeSggMSwgMSwgMSwgTlVNX1JBRElBTF9TQU1QTEVTLCBOVU1fQVhJQUxfU0FNUExFUywgZmFsc2UgKTsgLy8gMSByYWRpdXMsIDEgaGVpZ2h0LCAzMiBzZWdtZW50cywgb3Blbi1lbmRlZFxyXG5cclxuLy8gcmVuZGVyZXItbG9jYWwgYWNjZXNzXHJcbmNvbnN0IGxvY2FsQm9uZEdlb21ldHJ5ID0gbmV3IExvY2FsR2VvbWV0cnkoIGdsb2JhbEJvbmRHZW9tZXRyeSApO1xyXG5jb25zdCBsb2NhbEJvbmRNYXRlcmlhbCA9IG5ldyBMb2NhbE1hdGVyaWFsKCBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCgge1xyXG4gIG92ZXJkcmF3OiBNb2xlY3VsZVNoYXBlc0dsb2JhbHMudXNlV2ViR0xQcm9wZXJ0eS52YWx1ZSA/IDAgOiAwLjUgLy8gYW1vdW50IHRvIGV4dGVuZCBwb2x5Z29ucyB3aGVuIHVzaW5nIENhbnZhcyB0byBhdm9pZCBjcmFja3NcclxufSApLCB7XHJcbiAgY29sb3I6IE1vbGVjdWxlU2hhcGVzQ29sb3JzLmJvbmRQcm9wZXJ0eVxyXG59ICk7XHJcblxyXG5jbGFzcyBCb25kVmlldyBleHRlbmRzIFRIUkVFLk9iamVjdDNEIHtcclxuICAvKlxyXG4gICAqIEBwYXJhbSB7VEhSRUUuUmVuZGVyZXJ9IHJlbmRlcmVyXHJcbiAgICogQHBhcmFtIHtCb25kLjxQYWlyR3JvdXA+fSBib25kXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48VmVjdG9yMz59IGFQb3NpdGlvblByb3BlcnR5IC0gcG9zaXRpb24gb2Ygb25lIGVuZCBvZiB0aGUgYm9uZFxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPFZlY3RvcjM+fSBiUG9zaXRpb25Qcm9wZXJ0eSAtIHBvc2l0aW9uIG9mIHRoZSBvdGhlciBlbmQgb2YgdGhlIGJvbmRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYm9uZFJhZGl1cyAtIGluIGRpc3BsYXkgdW5pdHNcclxuICAgKiBAcGFyYW0ge251bWJlcnxudWxsfSBtYXhMZW5ndGggLSBpbiBkaXNwbGF5IHVuaXRzXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHJlbmRlcmVyLCBib25kLCBhUG9zaXRpb25Qcm9wZXJ0eSwgYlBvc2l0aW9uUHJvcGVydHksIGJvbmRSYWRpdXMsIG1heExlbmd0aCApIHtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIHRoaXMuYU1hdGVyaWFsID0gbG9jYWxCb25kTWF0ZXJpYWwuZ2V0KCByZW5kZXJlciApOyAvLyBAcHJpdmF0ZSB7VEhSRUUuTWF0ZXJpYWx9XHJcbiAgICB0aGlzLmJNYXRlcmlhbCA9IGxvY2FsQm9uZE1hdGVyaWFsLmdldCggcmVuZGVyZXIgKTsgLy8gQHByaXZhdGUge1RIUkVFLk1hdGVyaWFsfVxyXG4gICAgdGhpcy5ib25kR2VvbWV0cnkgPSBsb2NhbEJvbmRHZW9tZXRyeS5nZXQoIHJlbmRlcmVyICk7IC8vIEBwcml2YXRlIHtUSFJFRS5HZW9tZXRyeX1cclxuXHJcbiAgICB0aGlzLmJvbmQgPSBib25kOyAvLyBAcHVibGljIHtCb25kLjxQYWlyR3JvdXA+fVxyXG4gICAgdGhpcy5hUG9zaXRpb25Qcm9wZXJ0eSA9IGFQb3NpdGlvblByb3BlcnR5OyAvLyBAcHJpdmF0ZSB7UHJvcGVydHkuPFZlY3RvcjM+fVxyXG4gICAgdGhpcy5iUG9zaXRpb25Qcm9wZXJ0eSA9IGJQb3NpdGlvblByb3BlcnR5OyAvLyBAcHJpdmF0ZSB7UHJvcGVydHkuPFZlY3RvcjM+fVxyXG4gICAgdGhpcy5ib25kT3JkZXIgPSBib25kLm9yZGVyOyAvLyBAcHVibGljIHtudW1iZXJ9XHJcbiAgICB0aGlzLmJvbmRSYWRpdXMgPSBib25kUmFkaXVzOyAvLyBAcHVibGljIHtudW1iZXJ9XHJcbiAgICB0aGlzLm1heExlbmd0aCA9IG1heExlbmd0aDsgLy8gQHByaXZhdGUge251bWJlcn1cclxuXHJcbiAgICB0aGlzLmFCb25kcyA9IFtdOyAvLyBAcHJpdmF0ZSB7QXJyYXkuPFRIUkVFLk1lc2g+fVxyXG4gICAgdGhpcy5iQm9uZHMgPSBbXTsgLy8gQHByaXZhdGUge0FycmF5LjxUSFJFRS5NZXNoPn1cclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmJvbmRPcmRlcjsgaSsrICkge1xyXG4gICAgICAvLyB0aGV5IHdpbGwgaGF2ZSB1bml0IGhlaWdodCBhbmQgdW5pdCByYWRpdXMuIFdlIHdpbGwgc2NhbGUsIHJvdGF0ZSBhbmQgdHJhbnNsYXRlIHRoZW0gbGF0ZXJcclxuICAgICAgdGhpcy5hQm9uZHMucHVzaCggbmV3IFRIUkVFLk1lc2goIHRoaXMuYm9uZEdlb21ldHJ5LCB0aGlzLmFNYXRlcmlhbCApICk7XHJcbiAgICAgIHRoaXMuYkJvbmRzLnB1c2goIG5ldyBUSFJFRS5NZXNoKCB0aGlzLmJvbmRHZW9tZXRyeSwgdGhpcy5iTWF0ZXJpYWwgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGJpbmQgd29uJ3Qgd29ya1xyXG4gICAgXy5lYWNoKCB0aGlzLmFCb25kcywgYm9uZCA9PiB7IHRoaXMuYWRkKCBib25kICk7IH0gKTtcclxuICAgIF8uZWFjaCggdGhpcy5iQm9uZHMsIGJvbmQgPT4geyB0aGlzLmFkZCggYm9uZCApOyB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSBCb25kVmlldydzIGFwcGVhcmFuY2UuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUSFJFRS5WZWN0b3IzfSBjYW1lcmFQb3NpdGlvbiAtIFRoZSBwb3NpdGlvbiBvZiB0aGUgY2FtZXJhIGluIHRoZSBtb2xlY3VsZSdzIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAgICovXHJcbiAgdXBkYXRlVmlldyggY2FtZXJhUG9zaXRpb24gKSB7XHJcbiAgICAvLyBleHRyYWN0IG91ciBzdGFydCBhbmQgZW5kXHJcbiAgICBjb25zdCBzdGFydCA9IHRoaXMuYVBvc2l0aW9uUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBlbmQgPSB0aGlzLmJQb3NpdGlvblByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIC8vIHVuaXQgdmVjdG9yIHBvaW50IGluIHRoZSBkaXJlY3Rpb24gb2YgdGhlIGVuZCBmcm9tIHRoZSBzdGFydFxyXG4gICAgY29uc3QgdG93YXJkc0VuZCA9IGVuZC5taW51cyggc3RhcnQgKS5ub3JtYWxpemVkKCk7XHJcblxyXG4gICAgLy8gY2FsY3VsYXRlIHRoZSBsZW5ndGggb2YgdGhlIGJvbmQuIHNvbWV0aW1lcyBpdCBjYW4gYmUgbGVuZ3RoLWxpbWl0ZWQsIGFuZCB3ZSBwdXNoIHRoZSBib25kIHRvd2FyZHMgQlxyXG4gICAgY29uc3QgZGlzdGFuY2UgPSBzdGFydC5kaXN0YW5jZSggZW5kICk7XHJcbiAgICBsZXQgbGVuZ3RoO1xyXG4gICAgbGV0IG92ZXJMZW5ndGggPSAwO1xyXG4gICAgaWYgKCB0aGlzLm1heExlbmd0aCAhPT0gbnVsbCAmJiBkaXN0YW5jZSA+IHRoaXMubWF4TGVuZ3RoICkge1xyXG4gICAgICAvLyBvdXIgYm9uZCB3b3VsZCBiZSB0b28gbG9uZ1xyXG4gICAgICBsZW5ndGggPSB0aGlzLm1heExlbmd0aDtcclxuICAgICAgb3Zlckxlbmd0aCA9IGRpc3RhbmNlIC0gdGhpcy5tYXhMZW5ndGg7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgbGVuZ3RoID0gZGlzdGFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZmluZCB0aGUgY2VudGVyIG9mIG91ciBib25kLiB3ZSBhZGQgaW4gdGhlIFwib3ZlclwiIGxlbmd0aCBpZiBuZWNlc3NhcnkgdG8gb2Zmc2V0IHRoZSBib25kIGZyb20gYmV0d2VlbiBBIGFuZCBCXHJcbiAgICBjb25zdCBib25kQ2VudGVyID0gKCBzdGFydC50aW1lcyggMC41ICkucGx1cyggZW5kLnRpbWVzKCAwLjUgKSApICkucGx1cyggdG93YXJkc0VuZC50aW1lcyggb3Zlckxlbmd0aCAvIDIgKSApO1xyXG5cclxuICAgIC8vIGdldCBhIHVuaXQgdmVjdG9yIHBlcnBlbmRpY3VsYXIgdG8gdGhlIGJvbmQgZGlyZWN0aW9uIGFuZCBjYW1lcmEgZGlyZWN0aW9uXHJcbiAgICBjb25zdCBwZXJwZW5kaWN1bGFyID0gYm9uZENlbnRlci5taW51cyggZW5kICkubm9ybWFsaXplZCgpLmNyb3NzKCBib25kQ2VudGVyLm1pbnVzKCBjYW1lcmFQb3NpdGlvbiApLm5vcm1hbGl6ZWQoKSApLm5vcm1hbGl6ZWQoKTtcclxuXHJcbiAgICAvKlxyXG4gICAgICogQ29tcHV0ZSBvZmZzZXRzIGZyb20gdGhlIFwiY2VudHJhbFwiIGJvbmQgcG9zaXRpb24sIGZvciBzaG93aW5nIGRvdWJsZSBhbmQgdHJpcGxlIGJvbmRzLlxyXG4gICAgICogVGhlIG9mZnNldHMgYXJlIGJhc2ljYWxseSB0aGUgcmVsYXRpdmUgcG9zaXRpb25zIG9mIHRoZSAxLzIvMyBjeWxpbmRlcnMgdGhhdCBhcmUgZGlzcGxheWVkIGFzIGEgYm9uZC5cclxuICAgICAqL1xyXG4gICAgbGV0IG9mZnNldHM7XHJcblxyXG4gICAgLy8gaG93IGZhciBib25kcyBhcmUgYXBhcnQuIGNvbnN0YW50IHJlZmluZWQgZm9yIHZpc3VhbCBhcHBlYXJhbmNlLiB0cmlwbGUtYm9uZHMgYXJlbid0IHdpZGVyIHRoYW4gYXRvbXMsIG1vc3Qgbm90YWJseVxyXG4gICAgY29uc3QgYm9uZFNlcGFyYXRpb24gPSB0aGlzLmJvbmRSYWRpdXMgKiAoIDEyIC8gNSApO1xyXG4gICAgc3dpdGNoKCB0aGlzLmJvbmRPcmRlciApIHtcclxuICAgICAgY2FzZSAxOlxyXG4gICAgICAgIG9mZnNldHMgPSBbIG5ldyBWZWN0b3IzKCAwLCAwLCAwICkgXTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAyOlxyXG4gICAgICAgIG9mZnNldHMgPSBbIHBlcnBlbmRpY3VsYXIudGltZXMoIGJvbmRTZXBhcmF0aW9uIC8gMiApLCBwZXJwZW5kaWN1bGFyLnRpbWVzKCAtYm9uZFNlcGFyYXRpb24gLyAyICkgXTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAzOlxyXG4gICAgICAgIG9mZnNldHMgPSBbIFZlY3RvcjMuWkVSTywgcGVycGVuZGljdWxhci50aW1lcyggYm9uZFNlcGFyYXRpb24gKSwgcGVycGVuZGljdWxhci50aW1lcyggLWJvbmRTZXBhcmF0aW9uICkgXTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBiYWQgYm9uZCBvcmRlcjogJHt0aGlzLmJvbmRPcmRlcn1gICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2luY2Ugd2UgbmVlZCB0byBzdXBwb3J0IHR3byBkaWZmZXJlbnQgY29sb3JzIChBLWNvbG9yZWQgYW5kIEItY29sb3JlZCksIHdlIG5lZWQgdG8gY29tcHV0ZSB0aGUgb2Zmc2V0cyBmcm9tIHRoZSBib25kIGNlbnRlciBmb3IgZWFjaFxyXG4gICAgY29uc3QgY29sb3JPZmZzZXQgPSB0b3dhcmRzRW5kLnRpbWVzKCBsZW5ndGggLyA0ICk7XHJcbiAgICBjb25zdCB0aHJlZVpVbml0ID0gbmV3IFRIUkVFLlZlY3RvcjMoIDAsIDEsIDAgKTtcclxuICAgIGNvbnN0IHRocmVlVG93YXJkc0VuZCA9IG5ldyBUSFJFRS5WZWN0b3IzKCkuY29weSggdG93YXJkc0VuZCApO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuYm9uZE9yZGVyOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGFUcmFuc2xhdGlvbiA9IGJvbmRDZW50ZXIucGx1cyggb2Zmc2V0c1sgaSBdICkubWludXMoIGNvbG9yT2Zmc2V0ICk7XHJcbiAgICAgIGNvbnN0IGJUcmFuc2xhdGlvbiA9IGJvbmRDZW50ZXIucGx1cyggb2Zmc2V0c1sgaSBdICkucGx1cyggY29sb3JPZmZzZXQgKTtcclxuXHJcbiAgICAgIHRoaXMuYUJvbmRzWyBpIF0ucG9zaXRpb24uc2V0KCBhVHJhbnNsYXRpb24ueCwgYVRyYW5zbGF0aW9uLnksIGFUcmFuc2xhdGlvbi56ICk7XHJcbiAgICAgIHRoaXMuYkJvbmRzWyBpIF0ucG9zaXRpb24uc2V0KCBiVHJhbnNsYXRpb24ueCwgYlRyYW5zbGF0aW9uLnksIGJUcmFuc2xhdGlvbi56ICk7XHJcblxyXG4gICAgICB0aGlzLmFCb25kc1sgaSBdLnF1YXRlcm5pb24uc2V0RnJvbVVuaXRWZWN0b3JzKCB0aHJlZVpVbml0LCB0aHJlZVRvd2FyZHNFbmQgKTtcclxuICAgICAgdGhpcy5iQm9uZHNbIGkgXS5xdWF0ZXJuaW9uLnNldEZyb21Vbml0VmVjdG9ycyggdGhyZWVaVW5pdCwgdGhyZWVUb3dhcmRzRW5kICk7XHJcblxyXG4gICAgICB0aGlzLmFCb25kc1sgaSBdLnNjYWxlLnggPSB0aGlzLmFCb25kc1sgaSBdLnNjYWxlLnogPSB0aGlzLmJvbmRSYWRpdXM7XHJcbiAgICAgIHRoaXMuYkJvbmRzWyBpIF0uc2NhbGUueCA9IHRoaXMuYkJvbmRzWyBpIF0uc2NhbGUueiA9IHRoaXMuYm9uZFJhZGl1cztcclxuXHJcbiAgICAgIHRoaXMuYUJvbmRzWyBpIF0uc2NhbGUueSA9IHRoaXMuYkJvbmRzWyBpIF0uc2NhbGUueSA9IGxlbmd0aCAvIDI7XHJcblxyXG4gICAgICB0aGlzLmFCb25kc1sgaSBdLnVwZGF0ZU1hdHJpeCgpO1xyXG4gICAgICB0aGlzLmJCb25kc1sgaSBdLnVwZGF0ZU1hdHJpeCgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxubW9sZWN1bGVTaGFwZXMucmVnaXN0ZXIoICdCb25kVmlldycsIEJvbmRWaWV3ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBCb25kVmlldztcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSxrQ0FBa0M7QUFDdEQsT0FBT0MsY0FBYyxNQUFNLDRCQUE0QjtBQUN2RCxPQUFPQyxxQkFBcUIsTUFBTSxnQ0FBZ0M7QUFDbEUsT0FBT0Msb0JBQW9CLE1BQU0sNEJBQTRCO0FBQzdELE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFDOUMsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUU5QyxNQUFNQyxr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