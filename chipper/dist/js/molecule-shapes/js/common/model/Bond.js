// Copyright 2013-2021, University of Colorado Boulder

/**
 * Molecular bond between two items (representing atoms). Polymorphic, as the bond can reference any arbitrary type of
 * objects.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import moleculeShapes from '../../moleculeShapes.js';
class Bond {
  /**
   * The two ends of the bond (a,b) should be of the same (arbitrary) type, noted as {*} in the documentation.
   *
   * @param {*} a
   * @param {*} b
   * @param {number} order - The order of the bond.
   * @param {number} length - The length of the bond (in angstroms), or 0
   */
  constructor(a, b, order, length) {
    this.a = a; // @public {*}
    this.b = b; // @public {*}
    this.order = order; // @public {number}
    this.length = length; // @public {number}
  }

  /**
   * For debugging aid.
   * @private
   */
  toString() {
    return `{${this.a.toString()} => ${this.b.toString()}}`;
  }

  /**
   * Whether this bond contains the atom-like object as one of its ends.
   * @public
   *
   * @param {*} atom
   * @returns {boolean}
   */
  contains(atom) {
    return this.a === atom || this.b === atom;
  }

  /**
   * Assuming that this bond contains the atom-like object, return the other end of the bond.
   * @public
   *
   * @param {*} atom
   * @returns {*}
   */
  getOtherAtom(atom) {
    assert && assert(this.contains(atom));
    return this.a === atom ? this.b : this.a;
  }

  /**
   * @public
   *
   * @param {Array.<*>} atoms
   * @returns {Object}
   */
  toStateObject(atoms) {
    return {
      a: atoms.indexOf(this.a),
      b: atoms.indexOf(this.b),
      order: this.order,
      length: this.length
    };
  }

  /**
   * @public
   *
   * @param {Object} obj
   * @param {Array.<*>} atoms
   * @returns {Bond}
   */
  static fromStateObject(obj, atoms) {
    return new Bond(atoms[obj.a], atoms[obj.b], obj.order, obj.length);
  }
}

// @public {IOType}
Bond.BondIO = new IOType('BondIO', {
  valueType: Bond,
  stateSchema: {
    a: NumberIO,
    b: NumberIO,
    order: NumberIO,
    length: NumberIO
  }
});
moleculeShapes.register('Bond', Bond);
export default Bond;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJT1R5cGUiLCJOdW1iZXJJTyIsIm1vbGVjdWxlU2hhcGVzIiwiQm9uZCIsImNvbnN0cnVjdG9yIiwiYSIsImIiLCJvcmRlciIsImxlbmd0aCIsInRvU3RyaW5nIiwiY29udGFpbnMiLCJhdG9tIiwiZ2V0T3RoZXJBdG9tIiwiYXNzZXJ0IiwidG9TdGF0ZU9iamVjdCIsImF0b21zIiwiaW5kZXhPZiIsImZyb21TdGF0ZU9iamVjdCIsIm9iaiIsIkJvbmRJTyIsInZhbHVlVHlwZSIsInN0YXRlU2NoZW1hIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCb25kLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vbGVjdWxhciBib25kIGJldHdlZW4gdHdvIGl0ZW1zIChyZXByZXNlbnRpbmcgYXRvbXMpLiBQb2x5bW9ycGhpYywgYXMgdGhlIGJvbmQgY2FuIHJlZmVyZW5jZSBhbnkgYXJiaXRyYXJ5IHR5cGUgb2ZcclxuICogb2JqZWN0cy5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBOdW1iZXJJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVtYmVySU8uanMnO1xyXG5pbXBvcnQgbW9sZWN1bGVTaGFwZXMgZnJvbSAnLi4vLi4vbW9sZWN1bGVTaGFwZXMuanMnO1xyXG5cclxuY2xhc3MgQm9uZCB7XHJcbiAgLyoqXHJcbiAgICogVGhlIHR3byBlbmRzIG9mIHRoZSBib25kIChhLGIpIHNob3VsZCBiZSBvZiB0aGUgc2FtZSAoYXJiaXRyYXJ5KSB0eXBlLCBub3RlZCBhcyB7Kn0gaW4gdGhlIGRvY3VtZW50YXRpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0geyp9IGFcclxuICAgKiBAcGFyYW0geyp9IGJcclxuICAgKiBAcGFyYW0ge251bWJlcn0gb3JkZXIgLSBUaGUgb3JkZXIgb2YgdGhlIGJvbmQuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aCAtIFRoZSBsZW5ndGggb2YgdGhlIGJvbmQgKGluIGFuZ3N0cm9tcyksIG9yIDBcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggYSwgYiwgb3JkZXIsIGxlbmd0aCApIHtcclxuICAgIHRoaXMuYSA9IGE7IC8vIEBwdWJsaWMgeyp9XHJcbiAgICB0aGlzLmIgPSBiOyAvLyBAcHVibGljIHsqfVxyXG4gICAgdGhpcy5vcmRlciA9IG9yZGVyOyAvLyBAcHVibGljIHtudW1iZXJ9XHJcbiAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDsgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRm9yIGRlYnVnZ2luZyBhaWQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB0b1N0cmluZygpIHtcclxuICAgIHJldHVybiBgeyR7dGhpcy5hLnRvU3RyaW5nKCl9ID0+ICR7dGhpcy5iLnRvU3RyaW5nKCl9fWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHRoaXMgYm9uZCBjb250YWlucyB0aGUgYXRvbS1saWtlIG9iamVjdCBhcyBvbmUgb2YgaXRzIGVuZHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHsqfSBhdG9tXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgY29udGFpbnMoIGF0b20gKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hID09PSBhdG9tIHx8IHRoaXMuYiA9PT0gYXRvbTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFzc3VtaW5nIHRoYXQgdGhpcyBib25kIGNvbnRhaW5zIHRoZSBhdG9tLWxpa2Ugb2JqZWN0LCByZXR1cm4gdGhlIG90aGVyIGVuZCBvZiB0aGUgYm9uZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0geyp9IGF0b21cclxuICAgKiBAcmV0dXJucyB7Kn1cclxuICAgKi9cclxuICBnZXRPdGhlckF0b20oIGF0b20gKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmNvbnRhaW5zKCBhdG9tICkgKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5hID09PSBhdG9tID8gdGhpcy5iIDogdGhpcy5hO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcnJheS48Kj59IGF0b21zXHJcbiAgICogQHJldHVybnMge09iamVjdH1cclxuICAgKi9cclxuICB0b1N0YXRlT2JqZWN0KCBhdG9tcyApIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGE6IGF0b21zLmluZGV4T2YoIHRoaXMuYSApLFxyXG4gICAgICBiOiBhdG9tcy5pbmRleE9mKCB0aGlzLmIgKSxcclxuICAgICAgb3JkZXI6IHRoaXMub3JkZXIsXHJcbiAgICAgIGxlbmd0aDogdGhpcy5sZW5ndGhcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqXHJcbiAgICogQHBhcmFtIHtBcnJheS48Kj59IGF0b21zXHJcbiAgICogQHJldHVybnMge0JvbmR9XHJcbiAgICovXHJcbiAgc3RhdGljIGZyb21TdGF0ZU9iamVjdCggb2JqLCBhdG9tcyApIHtcclxuICAgIHJldHVybiBuZXcgQm9uZCggYXRvbXNbIG9iai5hIF0sIGF0b21zWyBvYmouYiBdLCBvYmoub3JkZXIsIG9iai5sZW5ndGggKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEBwdWJsaWMge0lPVHlwZX1cclxuQm9uZC5Cb25kSU8gPSBuZXcgSU9UeXBlKCAnQm9uZElPJywge1xyXG4gIHZhbHVlVHlwZTogQm9uZCxcclxuICBzdGF0ZVNjaGVtYToge1xyXG4gICAgYTogTnVtYmVySU8sXHJcbiAgICBiOiBOdW1iZXJJTyxcclxuICAgIG9yZGVyOiBOdW1iZXJJTyxcclxuICAgIGxlbmd0aDogTnVtYmVySU9cclxuICB9XHJcbn0gKTtcclxuXHJcbm1vbGVjdWxlU2hhcGVzLnJlZ2lzdGVyKCAnQm9uZCcsIEJvbmQgKTtcclxuZXhwb3J0IGRlZmF1bHQgQm9uZDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxNQUFNLE1BQU0sdUNBQXVDO0FBQzFELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0MsY0FBYyxNQUFNLHlCQUF5QjtBQUVwRCxNQUFNQyxJQUFJLENBQUM7RUFDVDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLENBQUMsRUFBRUMsQ0FBQyxFQUFFQyxLQUFLLEVBQUVDLE1BQU0sRUFBRztJQUNqQyxJQUFJLENBQUNILENBQUMsR0FBR0EsQ0FBQyxDQUFDLENBQUM7SUFDWixJQUFJLENBQUNDLENBQUMsR0FBR0EsQ0FBQyxDQUFDLENBQUM7SUFDWixJQUFJLENBQUNDLEtBQUssR0FBR0EsS0FBSyxDQUFDLENBQUM7SUFDcEIsSUFBSSxDQUFDQyxNQUFNLEdBQUdBLE1BQU0sQ0FBQyxDQUFDO0VBQ3hCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VDLFFBQVFBLENBQUEsRUFBRztJQUNULE9BQVEsSUFBRyxJQUFJLENBQUNKLENBQUMsQ0FBQ0ksUUFBUSxDQUFDLENBQUUsT0FBTSxJQUFJLENBQUNILENBQUMsQ0FBQ0csUUFBUSxDQUFDLENBQUUsR0FBRTtFQUN6RDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxRQUFRQSxDQUFFQyxJQUFJLEVBQUc7SUFDZixPQUFPLElBQUksQ0FBQ04sQ0FBQyxLQUFLTSxJQUFJLElBQUksSUFBSSxDQUFDTCxDQUFDLEtBQUtLLElBQUk7RUFDM0M7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsWUFBWUEsQ0FBRUQsSUFBSSxFQUFHO0lBQ25CRSxNQUFNLElBQUlBLE1BQU0sQ0FBRSxJQUFJLENBQUNILFFBQVEsQ0FBRUMsSUFBSyxDQUFFLENBQUM7SUFFekMsT0FBTyxJQUFJLENBQUNOLENBQUMsS0FBS00sSUFBSSxHQUFHLElBQUksQ0FBQ0wsQ0FBQyxHQUFHLElBQUksQ0FBQ0QsQ0FBQztFQUMxQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVMsYUFBYUEsQ0FBRUMsS0FBSyxFQUFHO0lBQ3JCLE9BQU87TUFDTFYsQ0FBQyxFQUFFVSxLQUFLLENBQUNDLE9BQU8sQ0FBRSxJQUFJLENBQUNYLENBQUUsQ0FBQztNQUMxQkMsQ0FBQyxFQUFFUyxLQUFLLENBQUNDLE9BQU8sQ0FBRSxJQUFJLENBQUNWLENBQUUsQ0FBQztNQUMxQkMsS0FBSyxFQUFFLElBQUksQ0FBQ0EsS0FBSztNQUNqQkMsTUFBTSxFQUFFLElBQUksQ0FBQ0E7SUFDZixDQUFDO0VBQ0g7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFPUyxlQUFlQSxDQUFFQyxHQUFHLEVBQUVILEtBQUssRUFBRztJQUNuQyxPQUFPLElBQUlaLElBQUksQ0FBRVksS0FBSyxDQUFFRyxHQUFHLENBQUNiLENBQUMsQ0FBRSxFQUFFVSxLQUFLLENBQUVHLEdBQUcsQ0FBQ1osQ0FBQyxDQUFFLEVBQUVZLEdBQUcsQ0FBQ1gsS0FBSyxFQUFFVyxHQUFHLENBQUNWLE1BQU8sQ0FBQztFQUMxRTtBQUNGOztBQUVBO0FBQ0FMLElBQUksQ0FBQ2dCLE1BQU0sR0FBRyxJQUFJbkIsTUFBTSxDQUFFLFFBQVEsRUFBRTtFQUNsQ29CLFNBQVMsRUFBRWpCLElBQUk7RUFDZmtCLFdBQVcsRUFBRTtJQUNYaEIsQ0FBQyxFQUFFSixRQUFRO0lBQ1hLLENBQUMsRUFBRUwsUUFBUTtJQUNYTSxLQUFLLEVBQUVOLFFBQVE7SUFDZk8sTUFBTSxFQUFFUDtFQUNWO0FBQ0YsQ0FBRSxDQUFDO0FBRUhDLGNBQWMsQ0FBQ29CLFFBQVEsQ0FBRSxNQUFNLEVBQUVuQixJQUFLLENBQUM7QUFDdkMsZUFBZUEsSUFBSSJ9