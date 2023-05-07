// Copyright 2019-2022, University of Colorado Boulder

/**
 * The 3D view for a VerticalCylinder.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import TriangleArrayWriter from '../../../../mobius/js/TriangleArrayWriter.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import MassView, { TAG_OFFSET } from './MassView.js';

// constants
const segments = 64;
const numElements = 12 * segments;
export default class VerticalCylinderView extends MassView {
  constructor(verticalCylinder) {
    const positionArray = new Float32Array(numElements * 3);
    const normalArray = new Float32Array(numElements * 3);
    const uvArray = new Float32Array(numElements * 2);
    VerticalCylinderView.updateArrays(positionArray, normalArray, uvArray, verticalCylinder.radiusProperty.value, verticalCylinder.heightProperty.value);
    const verticalCylinderGeometry = new THREE.BufferGeometry();
    verticalCylinderGeometry.addAttribute('position', new THREE.BufferAttribute(positionArray, 3));
    verticalCylinderGeometry.addAttribute('normal', new THREE.BufferAttribute(normalArray, 3));
    verticalCylinderGeometry.addAttribute('uv', new THREE.BufferAttribute(uvArray, 2));
    super(verticalCylinder, verticalCylinderGeometry);
    const positionTag = () => {
      const radius = verticalCylinder.radiusProperty.value;
      const height = verticalCylinder.heightProperty.value;
      this.tagOffsetProperty.value = new Vector3(-radius + TAG_OFFSET, height / 2 - this.tagHeight - TAG_OFFSET, radius);
    };
    positionTag();
    this.verticalCylinder = verticalCylinder;
    this.verticalCylinderGeometry = verticalCylinderGeometry;
    this.updateListener = () => {
      positionTag();
      VerticalCylinderView.updateArrays(verticalCylinderGeometry.attributes.position.array, null, verticalCylinderGeometry.attributes.uv.array, verticalCylinder.radiusProperty.value, verticalCylinder.heightProperty.value);
      verticalCylinderGeometry.attributes.position.needsUpdate = true;
      verticalCylinderGeometry.attributes.uv.needsUpdate = true;
      verticalCylinderGeometry.computeBoundingSphere();
    };
    this.verticalCylinder.radiusProperty.lazyLink(this.updateListener);
    this.verticalCylinder.heightProperty.lazyLink(this.updateListener);
  }

  /**
   * Releases references.
   */
  dispose() {
    this.verticalCylinder.radiusProperty.unlink(this.updateListener);
    this.verticalCylinder.heightProperty.unlink(this.updateListener);
    this.verticalCylinderGeometry.dispose();
    super.dispose();
  }

  /**
   * Updates provided geometry arrays given the specific size.
   *
   * @param positionArray
   * @param normalArray
   * @param uvArray
   * @param radius
   * @param height
   * @param offset - How many vertices have been specified so far?
   * @param offsetPosition - How to transform all of the points
   * @returns - The offset after the specified vertices have been written
   */
  static updateArrays(positionArray, normalArray, uvArray, radius, height, offset = 0, offsetPosition = Vector3.ZERO) {
    const writer = new TriangleArrayWriter(positionArray, normalArray, uvArray, offset, offsetPosition);
    const baseY = -height / 2;
    const topY = height / 2;
    const du = 5 * 2 * Math.PI * radius;
    const dv = 2.5 * height;
    const dvCap = 2.5 * radius;
    const vMin = 0.5 - dv;
    const vMax = 0.5 + dv;
    const vCapMin = 0.5 - dvCap;
    const vCapMax = 0.5 + dvCap;
    const TWO_PI = 2 * Math.PI;
    const HALF_PI = 0.5 * Math.PI;
    for (let i = 0; i < segments; i++) {
      const ratio0 = i / segments;
      const ratio1 = (i + 1) / segments;
      const theta0 = TWO_PI * ratio0 - HALF_PI;
      const theta1 = TWO_PI * ratio1 - HALF_PI;

      // Normals
      const nx0 = Math.cos(theta0);
      const nx1 = Math.cos(theta1);
      const nz0 = Math.sin(theta0);
      const nz1 = Math.sin(theta1);

      // Positions
      const x0 = radius * nx0;
      const x1 = radius * nx1;
      const z0 = radius * nz0;
      const z1 = radius * nz1;

      // Base
      writer.position(0, baseY, 0);
      writer.position(x0, baseY, z0);
      writer.position(x1, baseY, z1);
      writer.normal(0, -1, 0);
      writer.normal(0, -1, 0);
      writer.normal(0, -1, 0);
      writer.uv(0.5, vCapMax);
      writer.uv(du * (ratio0 - 0.5), vCapMin);
      writer.uv(du * (ratio1 - 0.5), vCapMin);

      // Side
      writer.position(x0, baseY, z0);
      writer.position(x0, topY, z0);
      writer.position(x1, baseY, z1);
      writer.position(x1, baseY, z1);
      writer.position(x0, topY, z0);
      writer.position(x1, topY, z1);
      writer.normal(nx0, 0, nz0);
      writer.normal(nx0, 0, nz0);
      writer.normal(nx1, 0, nz1);
      writer.normal(nx1, 0, nz1);
      writer.normal(nx0, 0, nz0);
      writer.normal(nx1, 0, nz1);
      writer.uv(du * (ratio0 - 0.5), vMin);
      writer.uv(du * (ratio0 - 0.5), vMax);
      writer.uv(du * (ratio1 - 0.5), vMin);
      writer.uv(du * (ratio1 - 0.5), vMin);
      writer.uv(du * (ratio0 - 0.5), vMax);
      writer.uv(du * (ratio1 - 0.5), vMax);

      // Top
      writer.position(0, topY, 0);
      writer.position(x1, topY, z1);
      writer.position(x0, topY, z0);
      writer.normal(0, 1, 0);
      writer.normal(0, 1, 0);
      writer.normal(0, 1, 0);
      writer.uv(0.5, vCapMax);
      writer.uv(du * (ratio1 - 0.5), vCapMin);
      writer.uv(du * (ratio0 - 0.5), vCapMin);
    }
    return writer.getOffset();
  }
}
densityBuoyancyCommon.register('VerticalCylinderView', VerticalCylinderView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IzIiwiVHJpYW5nbGVBcnJheVdyaXRlciIsImRlbnNpdHlCdW95YW5jeUNvbW1vbiIsIk1hc3NWaWV3IiwiVEFHX09GRlNFVCIsInNlZ21lbnRzIiwibnVtRWxlbWVudHMiLCJWZXJ0aWNhbEN5bGluZGVyVmlldyIsImNvbnN0cnVjdG9yIiwidmVydGljYWxDeWxpbmRlciIsInBvc2l0aW9uQXJyYXkiLCJGbG9hdDMyQXJyYXkiLCJub3JtYWxBcnJheSIsInV2QXJyYXkiLCJ1cGRhdGVBcnJheXMiLCJyYWRpdXNQcm9wZXJ0eSIsInZhbHVlIiwiaGVpZ2h0UHJvcGVydHkiLCJ2ZXJ0aWNhbEN5bGluZGVyR2VvbWV0cnkiLCJUSFJFRSIsIkJ1ZmZlckdlb21ldHJ5IiwiYWRkQXR0cmlidXRlIiwiQnVmZmVyQXR0cmlidXRlIiwicG9zaXRpb25UYWciLCJyYWRpdXMiLCJoZWlnaHQiLCJ0YWdPZmZzZXRQcm9wZXJ0eSIsInRhZ0hlaWdodCIsInVwZGF0ZUxpc3RlbmVyIiwiYXR0cmlidXRlcyIsInBvc2l0aW9uIiwiYXJyYXkiLCJ1diIsIm5lZWRzVXBkYXRlIiwiY29tcHV0ZUJvdW5kaW5nU3BoZXJlIiwibGF6eUxpbmsiLCJkaXNwb3NlIiwidW5saW5rIiwib2Zmc2V0Iiwib2Zmc2V0UG9zaXRpb24iLCJaRVJPIiwid3JpdGVyIiwiYmFzZVkiLCJ0b3BZIiwiZHUiLCJNYXRoIiwiUEkiLCJkdiIsImR2Q2FwIiwidk1pbiIsInZNYXgiLCJ2Q2FwTWluIiwidkNhcE1heCIsIlRXT19QSSIsIkhBTEZfUEkiLCJpIiwicmF0aW8wIiwicmF0aW8xIiwidGhldGEwIiwidGhldGExIiwibngwIiwiY29zIiwibngxIiwibnowIiwic2luIiwibnoxIiwieDAiLCJ4MSIsInowIiwiejEiLCJub3JtYWwiLCJnZXRPZmZzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlZlcnRpY2FsQ3lsaW5kZXJWaWV3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSAzRCB2aWV3IGZvciBhIFZlcnRpY2FsQ3lsaW5kZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMy5qcyc7XHJcbmltcG9ydCBUcmlhbmdsZUFycmF5V3JpdGVyIGZyb20gJy4uLy4uLy4uLy4uL21vYml1cy9qcy9UcmlhbmdsZUFycmF5V3JpdGVyLmpzJztcclxuaW1wb3J0IGRlbnNpdHlCdW95YW5jeUNvbW1vbiBmcm9tICcuLi8uLi9kZW5zaXR5QnVveWFuY3lDb21tb24uanMnO1xyXG5pbXBvcnQgVmVydGljYWxDeWxpbmRlciBmcm9tICcuLi9tb2RlbC9WZXJ0aWNhbEN5bGluZGVyLmpzJztcclxuaW1wb3J0IE1hc3NWaWV3LCB7IFRBR19PRkZTRVQgfSBmcm9tICcuL01hc3NWaWV3LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBzZWdtZW50cyA9IDY0O1xyXG5jb25zdCBudW1FbGVtZW50cyA9IDEyICogc2VnbWVudHM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWZXJ0aWNhbEN5bGluZGVyVmlldyBleHRlbmRzIE1hc3NWaWV3IHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IHZlcnRpY2FsQ3lsaW5kZXI6IFZlcnRpY2FsQ3lsaW5kZXI7XHJcbiAgcHJpdmF0ZSByZWFkb25seSB2ZXJ0aWNhbEN5bGluZGVyR2VvbWV0cnk6IFRIUkVFLkJ1ZmZlckdlb21ldHJ5O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdXBkYXRlTGlzdGVuZXI6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdmVydGljYWxDeWxpbmRlcjogVmVydGljYWxDeWxpbmRlciApIHtcclxuXHJcbiAgICBjb25zdCBwb3NpdGlvbkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheSggbnVtRWxlbWVudHMgKiAzICk7XHJcbiAgICBjb25zdCBub3JtYWxBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoIG51bUVsZW1lbnRzICogMyApO1xyXG4gICAgY29uc3QgdXZBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoIG51bUVsZW1lbnRzICogMiApO1xyXG5cclxuICAgIFZlcnRpY2FsQ3lsaW5kZXJWaWV3LnVwZGF0ZUFycmF5cyggcG9zaXRpb25BcnJheSwgbm9ybWFsQXJyYXksIHV2QXJyYXksIHZlcnRpY2FsQ3lsaW5kZXIucmFkaXVzUHJvcGVydHkudmFsdWUsIHZlcnRpY2FsQ3lsaW5kZXIuaGVpZ2h0UHJvcGVydHkudmFsdWUgKTtcclxuXHJcbiAgICBjb25zdCB2ZXJ0aWNhbEN5bGluZGVyR2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIHZlcnRpY2FsQ3lsaW5kZXJHZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICdwb3NpdGlvbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHBvc2l0aW9uQXJyYXksIDMgKSApO1xyXG4gICAgdmVydGljYWxDeWxpbmRlckdlb21ldHJ5LmFkZEF0dHJpYnV0ZSggJ25vcm1hbCcsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIG5vcm1hbEFycmF5LCAzICkgKTtcclxuICAgIHZlcnRpY2FsQ3lsaW5kZXJHZW9tZXRyeS5hZGRBdHRyaWJ1dGUoICd1dicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUoIHV2QXJyYXksIDIgKSApO1xyXG5cclxuICAgIHN1cGVyKCB2ZXJ0aWNhbEN5bGluZGVyLCB2ZXJ0aWNhbEN5bGluZGVyR2VvbWV0cnkgKTtcclxuXHJcbiAgICBjb25zdCBwb3NpdGlvblRhZyA9ICgpID0+IHtcclxuICAgICAgY29uc3QgcmFkaXVzID0gdmVydGljYWxDeWxpbmRlci5yYWRpdXNQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgY29uc3QgaGVpZ2h0ID0gdmVydGljYWxDeWxpbmRlci5oZWlnaHRQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgdGhpcy50YWdPZmZzZXRQcm9wZXJ0eS52YWx1ZSA9IG5ldyBWZWN0b3IzKCAtcmFkaXVzICsgVEFHX09GRlNFVCwgaGVpZ2h0IC8gMiAtIHRoaXMudGFnSGVpZ2h0ISAtIFRBR19PRkZTRVQsIHJhZGl1cyApO1xyXG4gICAgfTtcclxuICAgIHBvc2l0aW9uVGFnKCk7XHJcblxyXG4gICAgdGhpcy52ZXJ0aWNhbEN5bGluZGVyID0gdmVydGljYWxDeWxpbmRlcjtcclxuICAgIHRoaXMudmVydGljYWxDeWxpbmRlckdlb21ldHJ5ID0gdmVydGljYWxDeWxpbmRlckdlb21ldHJ5O1xyXG4gICAgdGhpcy51cGRhdGVMaXN0ZW5lciA9ICgpID0+IHtcclxuICAgICAgcG9zaXRpb25UYWcoKTtcclxuICAgICAgVmVydGljYWxDeWxpbmRlclZpZXcudXBkYXRlQXJyYXlzKCB2ZXJ0aWNhbEN5bGluZGVyR2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbi5hcnJheSBhcyBGbG9hdDMyQXJyYXksIG51bGwsIHZlcnRpY2FsQ3lsaW5kZXJHZW9tZXRyeS5hdHRyaWJ1dGVzLnV2LmFycmF5IGFzIEZsb2F0MzJBcnJheSwgdmVydGljYWxDeWxpbmRlci5yYWRpdXNQcm9wZXJ0eS52YWx1ZSwgdmVydGljYWxDeWxpbmRlci5oZWlnaHRQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgICB2ZXJ0aWNhbEN5bGluZGVyR2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbi5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICAgIHZlcnRpY2FsQ3lsaW5kZXJHZW9tZXRyeS5hdHRyaWJ1dGVzLnV2Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgICAgdmVydGljYWxDeWxpbmRlckdlb21ldHJ5LmNvbXB1dGVCb3VuZGluZ1NwaGVyZSgpO1xyXG4gICAgfTtcclxuICAgIHRoaXMudmVydGljYWxDeWxpbmRlci5yYWRpdXNQcm9wZXJ0eS5sYXp5TGluayggdGhpcy51cGRhdGVMaXN0ZW5lciApO1xyXG4gICAgdGhpcy52ZXJ0aWNhbEN5bGluZGVyLmhlaWdodFByb3BlcnR5LmxhenlMaW5rKCB0aGlzLnVwZGF0ZUxpc3RlbmVyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy52ZXJ0aWNhbEN5bGluZGVyLnJhZGl1c1Byb3BlcnR5LnVubGluayggdGhpcy51cGRhdGVMaXN0ZW5lciApO1xyXG4gICAgdGhpcy52ZXJ0aWNhbEN5bGluZGVyLmhlaWdodFByb3BlcnR5LnVubGluayggdGhpcy51cGRhdGVMaXN0ZW5lciApO1xyXG4gICAgdGhpcy52ZXJ0aWNhbEN5bGluZGVyR2VvbWV0cnkuZGlzcG9zZSgpO1xyXG5cclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgcHJvdmlkZWQgZ2VvbWV0cnkgYXJyYXlzIGdpdmVuIHRoZSBzcGVjaWZpYyBzaXplLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHBvc2l0aW9uQXJyYXlcclxuICAgKiBAcGFyYW0gbm9ybWFsQXJyYXlcclxuICAgKiBAcGFyYW0gdXZBcnJheVxyXG4gICAqIEBwYXJhbSByYWRpdXNcclxuICAgKiBAcGFyYW0gaGVpZ2h0XHJcbiAgICogQHBhcmFtIG9mZnNldCAtIEhvdyBtYW55IHZlcnRpY2VzIGhhdmUgYmVlbiBzcGVjaWZpZWQgc28gZmFyP1xyXG4gICAqIEBwYXJhbSBvZmZzZXRQb3NpdGlvbiAtIEhvdyB0byB0cmFuc2Zvcm0gYWxsIG9mIHRoZSBwb2ludHNcclxuICAgKiBAcmV0dXJucyAtIFRoZSBvZmZzZXQgYWZ0ZXIgdGhlIHNwZWNpZmllZCB2ZXJ0aWNlcyBoYXZlIGJlZW4gd3JpdHRlblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgdXBkYXRlQXJyYXlzKCBwb3NpdGlvbkFycmF5OiBGbG9hdDMyQXJyYXkgfCBudWxsLCBub3JtYWxBcnJheTogRmxvYXQzMkFycmF5IHwgbnVsbCwgdXZBcnJheTogRmxvYXQzMkFycmF5IHwgbnVsbCwgcmFkaXVzOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBvZmZzZXQgPSAwLCBvZmZzZXRQb3NpdGlvbjogVmVjdG9yMyA9IFZlY3RvcjMuWkVSTyApOiBudW1iZXIge1xyXG4gICAgY29uc3Qgd3JpdGVyID0gbmV3IFRyaWFuZ2xlQXJyYXlXcml0ZXIoIHBvc2l0aW9uQXJyYXksIG5vcm1hbEFycmF5LCB1dkFycmF5LCBvZmZzZXQsIG9mZnNldFBvc2l0aW9uICk7XHJcblxyXG4gICAgY29uc3QgYmFzZVkgPSAtaGVpZ2h0IC8gMjtcclxuICAgIGNvbnN0IHRvcFkgPSBoZWlnaHQgLyAyO1xyXG5cclxuICAgIGNvbnN0IGR1ID0gNSAqIDIgKiBNYXRoLlBJICogcmFkaXVzO1xyXG4gICAgY29uc3QgZHYgPSAyLjUgKiBoZWlnaHQ7XHJcbiAgICBjb25zdCBkdkNhcCA9IDIuNSAqIHJhZGl1cztcclxuICAgIGNvbnN0IHZNaW4gPSAwLjUgLSBkdjtcclxuICAgIGNvbnN0IHZNYXggPSAwLjUgKyBkdjtcclxuICAgIGNvbnN0IHZDYXBNaW4gPSAwLjUgLSBkdkNhcDtcclxuICAgIGNvbnN0IHZDYXBNYXggPSAwLjUgKyBkdkNhcDtcclxuXHJcbiAgICBjb25zdCBUV09fUEkgPSAyICogTWF0aC5QSTtcclxuICAgIGNvbnN0IEhBTEZfUEkgPSAwLjUgKiBNYXRoLlBJO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHNlZ21lbnRzOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHJhdGlvMCA9IGkgLyBzZWdtZW50cztcclxuICAgICAgY29uc3QgcmF0aW8xID0gKCBpICsgMSApIC8gc2VnbWVudHM7XHJcbiAgICAgIGNvbnN0IHRoZXRhMCA9IFRXT19QSSAqIHJhdGlvMCAtIEhBTEZfUEk7XHJcbiAgICAgIGNvbnN0IHRoZXRhMSA9IFRXT19QSSAqIHJhdGlvMSAtIEhBTEZfUEk7XHJcblxyXG4gICAgICAvLyBOb3JtYWxzXHJcbiAgICAgIGNvbnN0IG54MCA9IE1hdGguY29zKCB0aGV0YTAgKTtcclxuICAgICAgY29uc3QgbngxID0gTWF0aC5jb3MoIHRoZXRhMSApO1xyXG4gICAgICBjb25zdCBuejAgPSBNYXRoLnNpbiggdGhldGEwICk7XHJcbiAgICAgIGNvbnN0IG56MSA9IE1hdGguc2luKCB0aGV0YTEgKTtcclxuXHJcbiAgICAgIC8vIFBvc2l0aW9uc1xyXG4gICAgICBjb25zdCB4MCA9IHJhZGl1cyAqIG54MDtcclxuICAgICAgY29uc3QgeDEgPSByYWRpdXMgKiBueDE7XHJcbiAgICAgIGNvbnN0IHowID0gcmFkaXVzICogbnowO1xyXG4gICAgICBjb25zdCB6MSA9IHJhZGl1cyAqIG56MTtcclxuXHJcbiAgICAgIC8vIEJhc2VcclxuICAgICAgd3JpdGVyLnBvc2l0aW9uKCAwLCBiYXNlWSwgMCApO1xyXG4gICAgICB3cml0ZXIucG9zaXRpb24oIHgwLCBiYXNlWSwgejAgKTtcclxuICAgICAgd3JpdGVyLnBvc2l0aW9uKCB4MSwgYmFzZVksIHoxICk7XHJcbiAgICAgIHdyaXRlci5ub3JtYWwoIDAsIC0xLCAwICk7XHJcbiAgICAgIHdyaXRlci5ub3JtYWwoIDAsIC0xLCAwICk7XHJcbiAgICAgIHdyaXRlci5ub3JtYWwoIDAsIC0xLCAwICk7XHJcbiAgICAgIHdyaXRlci51diggMC41LCB2Q2FwTWF4ICk7XHJcbiAgICAgIHdyaXRlci51diggZHUgKiAoIHJhdGlvMCAtIDAuNSApLCB2Q2FwTWluICk7XHJcbiAgICAgIHdyaXRlci51diggZHUgKiAoIHJhdGlvMSAtIDAuNSApLCB2Q2FwTWluICk7XHJcblxyXG4gICAgICAvLyBTaWRlXHJcbiAgICAgIHdyaXRlci5wb3NpdGlvbiggeDAsIGJhc2VZLCB6MCApO1xyXG4gICAgICB3cml0ZXIucG9zaXRpb24oIHgwLCB0b3BZLCB6MCApO1xyXG4gICAgICB3cml0ZXIucG9zaXRpb24oIHgxLCBiYXNlWSwgejEgKTtcclxuICAgICAgd3JpdGVyLnBvc2l0aW9uKCB4MSwgYmFzZVksIHoxICk7XHJcbiAgICAgIHdyaXRlci5wb3NpdGlvbiggeDAsIHRvcFksIHowICk7XHJcbiAgICAgIHdyaXRlci5wb3NpdGlvbiggeDEsIHRvcFksIHoxICk7XHJcbiAgICAgIHdyaXRlci5ub3JtYWwoIG54MCwgMCwgbnowICk7XHJcbiAgICAgIHdyaXRlci5ub3JtYWwoIG54MCwgMCwgbnowICk7XHJcbiAgICAgIHdyaXRlci5ub3JtYWwoIG54MSwgMCwgbnoxICk7XHJcbiAgICAgIHdyaXRlci5ub3JtYWwoIG54MSwgMCwgbnoxICk7XHJcbiAgICAgIHdyaXRlci5ub3JtYWwoIG54MCwgMCwgbnowICk7XHJcbiAgICAgIHdyaXRlci5ub3JtYWwoIG54MSwgMCwgbnoxICk7XHJcbiAgICAgIHdyaXRlci51diggZHUgKiAoIHJhdGlvMCAtIDAuNSApLCB2TWluICk7XHJcbiAgICAgIHdyaXRlci51diggZHUgKiAoIHJhdGlvMCAtIDAuNSApLCB2TWF4ICk7XHJcbiAgICAgIHdyaXRlci51diggZHUgKiAoIHJhdGlvMSAtIDAuNSApLCB2TWluICk7XHJcbiAgICAgIHdyaXRlci51diggZHUgKiAoIHJhdGlvMSAtIDAuNSApLCB2TWluICk7XHJcbiAgICAgIHdyaXRlci51diggZHUgKiAoIHJhdGlvMCAtIDAuNSApLCB2TWF4ICk7XHJcbiAgICAgIHdyaXRlci51diggZHUgKiAoIHJhdGlvMSAtIDAuNSApLCB2TWF4ICk7XHJcblxyXG4gICAgICAvLyBUb3BcclxuICAgICAgd3JpdGVyLnBvc2l0aW9uKCAwLCB0b3BZLCAwICk7XHJcbiAgICAgIHdyaXRlci5wb3NpdGlvbiggeDEsIHRvcFksIHoxICk7XHJcbiAgICAgIHdyaXRlci5wb3NpdGlvbiggeDAsIHRvcFksIHowICk7XHJcbiAgICAgIHdyaXRlci5ub3JtYWwoIDAsIDEsIDAgKTtcclxuICAgICAgd3JpdGVyLm5vcm1hbCggMCwgMSwgMCApO1xyXG4gICAgICB3cml0ZXIubm9ybWFsKCAwLCAxLCAwICk7XHJcbiAgICAgIHdyaXRlci51diggMC41LCB2Q2FwTWF4ICk7XHJcbiAgICAgIHdyaXRlci51diggZHUgKiAoIHJhdGlvMSAtIDAuNSApLCB2Q2FwTWluICk7XHJcbiAgICAgIHdyaXRlci51diggZHUgKiAoIHJhdGlvMCAtIDAuNSApLCB2Q2FwTWluICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHdyaXRlci5nZXRPZmZzZXQoKTtcclxuICB9XHJcbn1cclxuXHJcbmRlbnNpdHlCdW95YW5jeUNvbW1vbi5yZWdpc3RlciggJ1ZlcnRpY2FsQ3lsaW5kZXJWaWV3JywgVmVydGljYWxDeWxpbmRlclZpZXcgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsbUJBQW1CLE1BQU0sOENBQThDO0FBQzlFLE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQztBQUVsRSxPQUFPQyxRQUFRLElBQUlDLFVBQVUsUUFBUSxlQUFlOztBQUVwRDtBQUNBLE1BQU1DLFFBQVEsR0FBRyxFQUFFO0FBQ25CLE1BQU1DLFdBQVcsR0FBRyxFQUFFLEdBQUdELFFBQVE7QUFFakMsZUFBZSxNQUFNRSxvQkFBb0IsU0FBU0osUUFBUSxDQUFDO0VBTWxESyxXQUFXQSxDQUFFQyxnQkFBa0MsRUFBRztJQUV2RCxNQUFNQyxhQUFhLEdBQUcsSUFBSUMsWUFBWSxDQUFFTCxXQUFXLEdBQUcsQ0FBRSxDQUFDO0lBQ3pELE1BQU1NLFdBQVcsR0FBRyxJQUFJRCxZQUFZLENBQUVMLFdBQVcsR0FBRyxDQUFFLENBQUM7SUFDdkQsTUFBTU8sT0FBTyxHQUFHLElBQUlGLFlBQVksQ0FBRUwsV0FBVyxHQUFHLENBQUUsQ0FBQztJQUVuREMsb0JBQW9CLENBQUNPLFlBQVksQ0FBRUosYUFB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