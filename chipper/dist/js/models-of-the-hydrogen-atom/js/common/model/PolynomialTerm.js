// Copyright 2022, University of Colorado Boulder

//TODO is this used?
/**
 * PolynomialTerm is a minimal/incomplete implementation of a polynomial term, as needed for solving
 * associated Legendre polynomials. See solveAssociatedLegendrePolynomial.ts
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
export default class PolynomialTerm {
  static ZERO = new PolynomialTerm(0, 0);
  constructor(coefficient, power) {
    assert && assert(Number.isInteger(coefficient));
    assert && assert(Number.isInteger(power) && power >= 0);
    this.coefficient = coefficient;
    this.power = power;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }
  evaluate(x) {
    return Math.pow(x, this.power) * this.coefficient;
  }
  derive(iterations) {
    assert && assert(Number.isInteger(iterations));
    let term = this.deriveThis();
    for (let i = 0; i < iterations - 1; i++) {
      term = term.deriveThis();
    }
    return term;
  }
  deriveThis() {
    if (this.power === 0) {
      return PolynomialTerm.ZERO;
    } else {
      return new PolynomialTerm(this.power - 1, this.coefficient * this.power);
    }
  }
}
modelsOfTheHydrogenAtom.register('PolynomialTerm', PolynomialTerm);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSIsIlBvbHlub21pYWxUZXJtIiwiWkVSTyIsImNvbnN0cnVjdG9yIiwiY29lZmZpY2llbnQiLCJwb3dlciIsImFzc2VydCIsIk51bWJlciIsImlzSW50ZWdlciIsImRpc3Bvc2UiLCJldmFsdWF0ZSIsIngiLCJNYXRoIiwicG93IiwiZGVyaXZlIiwiaXRlcmF0aW9ucyIsInRlcm0iLCJkZXJpdmVUaGlzIiwiaSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUG9seW5vbWlhbFRlcm0udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLy9UT0RPIGlzIHRoaXMgdXNlZD9cclxuLyoqXHJcbiAqIFBvbHlub21pYWxUZXJtIGlzIGEgbWluaW1hbC9pbmNvbXBsZXRlIGltcGxlbWVudGF0aW9uIG9mIGEgcG9seW5vbWlhbCB0ZXJtLCBhcyBuZWVkZWQgZm9yIHNvbHZpbmdcclxuICogYXNzb2NpYXRlZCBMZWdlbmRyZSBwb2x5bm9taWFscy4gU2VlIHNvbHZlQXNzb2NpYXRlZExlZ2VuZHJlUG9seW5vbWlhbC50c1xyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSBmcm9tICcuLi8uLi9tb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbS5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb2x5bm9taWFsVGVybSB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBjb2VmZmljaWVudDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBwb3dlcjogbnVtYmVyO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgWkVSTyA9IG5ldyBQb2x5bm9taWFsVGVybSggMCwgMCApO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGNvZWZmaWNpZW50OiBudW1iZXIsIHBvd2VyOiBudW1iZXIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBjb2VmZmljaWVudCApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBwb3dlciApICYmIHBvd2VyID49IDAgKTtcclxuXHJcbiAgICB0aGlzLmNvZWZmaWNpZW50ID0gY29lZmZpY2llbnQ7XHJcbiAgICB0aGlzLnBvd2VyID0gcG93ZXI7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGV2YWx1YXRlKCB4OiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBNYXRoLnBvdyggeCwgdGhpcy5wb3dlciApICogdGhpcy5jb2VmZmljaWVudDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkZXJpdmUoIGl0ZXJhdGlvbnM6IG51bWJlciApOiBQb2x5bm9taWFsVGVybSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBpdGVyYXRpb25zICkgKTtcclxuXHJcbiAgICBsZXQgdGVybSA9IHRoaXMuZGVyaXZlVGhpcygpO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgaXRlcmF0aW9ucyAtIDE7IGkrKyApIHtcclxuICAgICAgdGVybSA9IHRlcm0uZGVyaXZlVGhpcygpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRlcm07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRlcml2ZVRoaXMoKTogUG9seW5vbWlhbFRlcm0ge1xyXG4gICAgaWYgKCB0aGlzLnBvd2VyID09PSAwICkge1xyXG4gICAgICByZXR1cm4gUG9seW5vbWlhbFRlcm0uWkVSTztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gbmV3IFBvbHlub21pYWxUZXJtKCB0aGlzLnBvd2VyIC0gMSwgdGhpcy5jb2VmZmljaWVudCAqIHRoaXMucG93ZXIgKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbm1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLnJlZ2lzdGVyKCAnUG9seW5vbWlhbFRlcm0nLCBQb2x5bm9taWFsVGVybSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsdUJBQXVCLE1BQU0sa0NBQWtDO0FBRXRFLGVBQWUsTUFBTUMsY0FBYyxDQUFDO0VBSWxDLE9BQXVCQyxJQUFJLEdBQUcsSUFBSUQsY0FBYyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7RUFFakRFLFdBQVdBLENBQUVDLFdBQW1CLEVBQUVDLEtBQWEsRUFBRztJQUN2REMsTUFBTSxJQUFJQSxNQUFNLENBQUVDLE1BQU0sQ0FBQ0MsU0FBUyxDQUFFSixXQUFZLENBQUUsQ0FBQztJQUNuREUsTUFBTSxJQUFJQSxNQUFNLENBQUVDLE1BQU0sQ0FBQ0MsU0FBUyxDQUFFSCxLQUFNLENBQUMsSUFBSUEsS0FBSyxJQUFJLENBQUUsQ0FBQztJQUUzRCxJQUFJLENBQUNELFdBQVcsR0FBR0EsV0FBVztJQUM5QixJQUFJLENBQUNDLEtBQUssR0FBR0EsS0FBSztFQUNwQjtFQUVPSSxPQUFPQSxDQUFBLEVBQVM7SUFDckJILE1BQU0sSUFBSUEsTUFBTSxDQUFFLEtBQUssRUFBRSw4REFBK0QsQ0FBQztFQUMzRjtFQUVPSSxRQUFRQSxDQUFFQyxDQUFTLEVBQVc7SUFDbkMsT0FBT0MsSUFBSSxDQUFDQyxHQUFHLENBQUVGLENBQUMsRUFBRSxJQUFJLENBQUNOLEtBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQ0QsV0FBVztFQUNyRDtFQUVPVSxNQUFNQSxDQUFFQyxVQUFrQixFQUFtQjtJQUNsRFQsTUFBTSxJQUFJQSxNQUFNLENBQUVDLE1BQU0sQ0FBQ0MsU0FBUyxDQUFFTyxVQUFXLENBQUUsQ0FBQztJQUVsRCxJQUFJQyxJQUFJLEdBQUcsSUFBSSxDQUFDQyxVQUFVLENBQUMsQ0FBQztJQUM1QixLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0gsVUFBVSxHQUFHLENBQUMsRUFBRUcsQ0FBQyxFQUFFLEVBQUc7TUFDekNGLElBQUksR0FBR0EsSUFBSSxDQUFDQyxVQUFVLENBQUMsQ0FBQztJQUMxQjtJQUNBLE9BQU9ELElBQUk7RUFDYjtFQUVRQyxVQUFVQSxDQUFBLEVBQW1CO0lBQ25DLElBQUssSUFBSSxDQUFDWixLQUFLLEtBQUssQ0FBQyxFQUFHO01BQ3RCLE9BQU9KLGNBQWMsQ0FBQ0MsSUFBSTtJQUM1QixDQUFDLE1BQ0k7TUFDSCxPQUFPLElBQUlELGNBQWMsQ0FBRSxJQUFJLENBQUNJLEtBQUssR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDRCxXQUFXLEdBQUcsSUFBSSxDQUFDQyxLQUFNLENBQUM7SUFDNUU7RUFDRjtBQUNGO0FBRUFMLHVCQUF1QixDQUFDbUIsUUFBUSxDQUFFLGdCQUFnQixFQUFFbEIsY0FBZSxDQUFDIn0=