// Copyright 2013-2023, University of Colorado Boulder

/**
 * An immutable permutation that can permute an array
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import dot from './dot.js';
import Utils from './Utils.js';
class Permutation {
  /**
   * Creates a permutation that will rearrange a list so that newList[i] = oldList[permutation[i]]
   */
  constructor(indices) {
    this.indices = indices;
  }
  size() {
    return this.indices.length;
  }

  /**
   * Applies the permutation, returning either a new array or number (whatever was provided).
   */
  apply(arrayOrInt) {
    if (typeof arrayOrInt === 'number') {
      // @ts-expect-error
      return this.indices[arrayOrInt];
    } else {
      if (arrayOrInt.length !== this.size()) {
        throw new Error(`Permutation length ${this.size()} not equal to list length ${arrayOrInt.length}`);
      }

      // permute it as an array
      const result = new Array(arrayOrInt.length);
      for (let i = 0; i < arrayOrInt.length; i++) {
        result[i] = arrayOrInt[this.indices[i]];
      }
      // @ts-expect-error
      return result;
    }
  }

  /**
   * Creates a new permutation that is the inverse of this.
   */
  inverted() {
    const newPermutation = new Array(this.size());
    for (let i = 0; i < this.size(); i++) {
      newPermutation[this.indices[i]] = i;
    }
    return new Permutation(newPermutation);
  }
  withIndicesPermuted(indices) {
    const result = [];
    Permutation.forEachPermutation(indices, integers => {
      const oldIndices = this.indices;
      const newPermutation = oldIndices.slice(0);
      for (let i = 0; i < indices.length; i++) {
        newPermutation[indices[i]] = oldIndices[integers[i]];
      }
      result.push(new Permutation(newPermutation));
    });
    return result;
  }
  toString() {
    return `P[${this.indices.join(', ')}]`;
  }
  equals(permutation) {
    return this.indices.length === permutation.indices.length && _.isEqual(this.indices, permutation.indices);
  }

  /**
   * Creates an identity permutation of a given size.
   */
  static identity(size) {
    assert && assert(size >= 0);
    const indices = new Array(size);
    for (let i = 0; i < size; i++) {
      indices[i] = i;
    }
    return new Permutation(indices);
  }

  /**
   * Lists all permutations that have a given size
   */
  static permutations(size) {
    const result = [];
    Permutation.forEachPermutation(Utils.rangeInclusive(0, size - 1), integers => {
      result.push(new Permutation(integers.slice()));
    });
    return result;
  }

  /**
   * Calls a callback on every single possible permutation of the given Array
   *
   * @param array
   * @param callback - Called on each permuted version of the array possible
   */
  static forEachPermutation(array, callback) {
    recursiveForEachPermutation(array, [], callback);
  }
  static permutationsOf(array) {
    const results = [];
    Permutation.forEachPermutation(array, result => {
      results.push(result.slice());
    });
    return results;
  }
}
dot.register('Permutation', Permutation);

/**
 * Call our function with each permutation of the provided list PREFIXED by prefix, in lexicographic order
 *
 * @param array   List to generate permutations of
 * @param prefix   Elements that should be inserted at the front of each list before each call
 * @param callback Function to call
 */
function recursiveForEachPermutation(array, prefix, callback) {
  if (array.length === 0) {
    callback(prefix);
  } else {
    for (let i = 0; i < array.length; i++) {
      const element = array[i];

      // remove the element from the array
      const nextArray = array.slice(0);
      nextArray.splice(i, 1);

      // add it into the prefix
      const nextPrefix = prefix.slice(0);
      nextPrefix.push(element);
      recursiveForEachPermutation(nextArray, nextPrefix, callback);
    }
  }
}
export default Permutation;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3QiLCJVdGlscyIsIlBlcm11dGF0aW9uIiwiY29uc3RydWN0b3IiLCJpbmRpY2VzIiwic2l6ZSIsImxlbmd0aCIsImFwcGx5IiwiYXJyYXlPckludCIsIkVycm9yIiwicmVzdWx0IiwiQXJyYXkiLCJpIiwiaW52ZXJ0ZWQiLCJuZXdQZXJtdXRhdGlvbiIsIndpdGhJbmRpY2VzUGVybXV0ZWQiLCJmb3JFYWNoUGVybXV0YXRpb24iLCJpbnRlZ2VycyIsIm9sZEluZGljZXMiLCJzbGljZSIsInB1c2giLCJ0b1N0cmluZyIsImpvaW4iLCJlcXVhbHMiLCJwZXJtdXRhdGlvbiIsIl8iLCJpc0VxdWFsIiwiaWRlbnRpdHkiLCJhc3NlcnQiLCJwZXJtdXRhdGlvbnMiLCJyYW5nZUluY2x1c2l2ZSIsImFycmF5IiwiY2FsbGJhY2siLCJyZWN1cnNpdmVGb3JFYWNoUGVybXV0YXRpb24iLCJwZXJtdXRhdGlvbnNPZiIsInJlc3VsdHMiLCJyZWdpc3RlciIsInByZWZpeCIsImVsZW1lbnQiLCJuZXh0QXJyYXkiLCJzcGxpY2UiLCJuZXh0UHJlZml4Il0sInNvdXJjZXMiOlsiUGVybXV0YXRpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQW4gaW1tdXRhYmxlIHBlcm11dGF0aW9uIHRoYXQgY2FuIHBlcm11dGUgYW4gYXJyYXlcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi9VdGlscy5qcyc7XHJcblxyXG5jbGFzcyBQZXJtdXRhdGlvbiB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBpbmRpY2VzOiBudW1iZXJbXTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIHBlcm11dGF0aW9uIHRoYXQgd2lsbCByZWFycmFuZ2UgYSBsaXN0IHNvIHRoYXQgbmV3TGlzdFtpXSA9IG9sZExpc3RbcGVybXV0YXRpb25baV1dXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBpbmRpY2VzOiBudW1iZXJbXSApIHtcclxuICAgIHRoaXMuaW5kaWNlcyA9IGluZGljZXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2l6ZSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuaW5kaWNlcy5sZW5ndGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBsaWVzIHRoZSBwZXJtdXRhdGlvbiwgcmV0dXJuaW5nIGVpdGhlciBhIG5ldyBhcnJheSBvciBudW1iZXIgKHdoYXRldmVyIHdhcyBwcm92aWRlZCkuXHJcbiAgICovXHJcbiAgcHVibGljIGFwcGx5PEUsIFQgZXh0ZW5kcyBFW10gfCBudW1iZXI+KCBhcnJheU9ySW50OiBUICk6IFQgZXh0ZW5kcyBFW10gPyBudW1iZXJbXSA6IG51bWJlciB7XHJcbiAgICBpZiAoIHR5cGVvZiBhcnJheU9ySW50ID09PSAnbnVtYmVyJyApIHtcclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICByZXR1cm4gdGhpcy5pbmRpY2VzWyBhcnJheU9ySW50IF07XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgaWYgKCBhcnJheU9ySW50Lmxlbmd0aCAhPT0gdGhpcy5zaXplKCkgKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgUGVybXV0YXRpb24gbGVuZ3RoICR7dGhpcy5zaXplKCl9IG5vdCBlcXVhbCB0byBsaXN0IGxlbmd0aCAke2FycmF5T3JJbnQubGVuZ3RofWAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcGVybXV0ZSBpdCBhcyBhbiBhcnJheVxyXG4gICAgICBjb25zdCByZXN1bHQ6IEVbXSA9IG5ldyBBcnJheSggYXJyYXlPckludC5sZW5ndGggKTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYXJyYXlPckludC5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICByZXN1bHRbIGkgXSA9IGFycmF5T3JJbnRbIHRoaXMuaW5kaWNlc1sgaSBdIF07XHJcbiAgICAgIH1cclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBwZXJtdXRhdGlvbiB0aGF0IGlzIHRoZSBpbnZlcnNlIG9mIHRoaXMuXHJcbiAgICovXHJcbiAgcHVibGljIGludmVydGVkKCk6IFBlcm11dGF0aW9uIHtcclxuICAgIGNvbnN0IG5ld1Blcm11dGF0aW9uID0gbmV3IEFycmF5KCB0aGlzLnNpemUoKSApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zaXplKCk7IGkrKyApIHtcclxuICAgICAgbmV3UGVybXV0YXRpb25bIHRoaXMuaW5kaWNlc1sgaSBdIF0gPSBpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBQZXJtdXRhdGlvbiggbmV3UGVybXV0YXRpb24gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB3aXRoSW5kaWNlc1Blcm11dGVkKCBpbmRpY2VzOiBudW1iZXJbXSApOiBQZXJtdXRhdGlvbltdIHtcclxuICAgIGNvbnN0IHJlc3VsdDogUGVybXV0YXRpb25bXSA9IFtdO1xyXG4gICAgUGVybXV0YXRpb24uZm9yRWFjaFBlcm11dGF0aW9uKCBpbmRpY2VzLCBpbnRlZ2VycyA9PiB7XHJcbiAgICAgIGNvbnN0IG9sZEluZGljZXMgPSB0aGlzLmluZGljZXM7XHJcbiAgICAgIGNvbnN0IG5ld1Blcm11dGF0aW9uID0gb2xkSW5kaWNlcy5zbGljZSggMCApO1xyXG5cclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgaW5kaWNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBuZXdQZXJtdXRhdGlvblsgaW5kaWNlc1sgaSBdIF0gPSBvbGRJbmRpY2VzWyBpbnRlZ2Vyc1sgaSBdIF07XHJcbiAgICAgIH1cclxuICAgICAgcmVzdWx0LnB1c2goIG5ldyBQZXJtdXRhdGlvbiggbmV3UGVybXV0YXRpb24gKSApO1xyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGBQWyR7dGhpcy5pbmRpY2VzLmpvaW4oICcsICcgKX1dYDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBlcXVhbHMoIHBlcm11dGF0aW9uOiBQZXJtdXRhdGlvbiApOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmluZGljZXMubGVuZ3RoID09PSBwZXJtdXRhdGlvbi5pbmRpY2VzLmxlbmd0aCAmJiBfLmlzRXF1YWwoIHRoaXMuaW5kaWNlcywgcGVybXV0YXRpb24uaW5kaWNlcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbiBpZGVudGl0eSBwZXJtdXRhdGlvbiBvZiBhIGdpdmVuIHNpemUuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBpZGVudGl0eSggc2l6ZTogbnVtYmVyICk6IFBlcm11dGF0aW9uIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNpemUgPj0gMCApO1xyXG4gICAgY29uc3QgaW5kaWNlcyA9IG5ldyBBcnJheSggc2l6ZSApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrICkge1xyXG4gICAgICBpbmRpY2VzWyBpIF0gPSBpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBQZXJtdXRhdGlvbiggaW5kaWNlcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTGlzdHMgYWxsIHBlcm11dGF0aW9ucyB0aGF0IGhhdmUgYSBnaXZlbiBzaXplXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBwZXJtdXRhdGlvbnMoIHNpemU6IG51bWJlciApOiBQZXJtdXRhdGlvbltdIHtcclxuICAgIGNvbnN0IHJlc3VsdDogUGVybXV0YXRpb25bXSA9IFtdO1xyXG4gICAgUGVybXV0YXRpb24uZm9yRWFjaFBlcm11dGF0aW9uKCBVdGlscy5yYW5nZUluY2x1c2l2ZSggMCwgc2l6ZSAtIDEgKSwgaW50ZWdlcnMgPT4ge1xyXG4gICAgICByZXN1bHQucHVzaCggbmV3IFBlcm11dGF0aW9uKCBpbnRlZ2Vycy5zbGljZSgpICkgKTtcclxuICAgIH0gKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxscyBhIGNhbGxiYWNrIG9uIGV2ZXJ5IHNpbmdsZSBwb3NzaWJsZSBwZXJtdXRhdGlvbiBvZiB0aGUgZ2l2ZW4gQXJyYXlcclxuICAgKlxyXG4gICAqIEBwYXJhbSBhcnJheVxyXG4gICAqIEBwYXJhbSBjYWxsYmFjayAtIENhbGxlZCBvbiBlYWNoIHBlcm11dGVkIHZlcnNpb24gb2YgdGhlIGFycmF5IHBvc3NpYmxlXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBmb3JFYWNoUGVybXV0YXRpb248VD4oIGFycmF5OiBUW10sIGNhbGxiYWNrOiAoIGFycmF5OiByZWFkb25seSBUW10gKSA9PiB2b2lkICk6IHZvaWQge1xyXG4gICAgcmVjdXJzaXZlRm9yRWFjaFBlcm11dGF0aW9uKCBhcnJheSwgW10sIGNhbGxiYWNrICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIHBlcm11dGF0aW9uc09mPFQ+KCBhcnJheTogVFtdICk6IFRbXVtdIHtcclxuICAgIGNvbnN0IHJlc3VsdHM6IFRbXVtdID0gW107XHJcbiAgICBQZXJtdXRhdGlvbi5mb3JFYWNoUGVybXV0YXRpb24oIGFycmF5LCByZXN1bHQgPT4ge1xyXG4gICAgICByZXN1bHRzLnB1c2goIHJlc3VsdC5zbGljZSgpICk7XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4gcmVzdWx0cztcclxuICB9XHJcbn1cclxuXHJcbmRvdC5yZWdpc3RlciggJ1Blcm11dGF0aW9uJywgUGVybXV0YXRpb24gKTtcclxuXHJcbi8qKlxyXG4gKiBDYWxsIG91ciBmdW5jdGlvbiB3aXRoIGVhY2ggcGVybXV0YXRpb24gb2YgdGhlIHByb3ZpZGVkIGxpc3QgUFJFRklYRUQgYnkgcHJlZml4LCBpbiBsZXhpY29ncmFwaGljIG9yZGVyXHJcbiAqXHJcbiAqIEBwYXJhbSBhcnJheSAgIExpc3QgdG8gZ2VuZXJhdGUgcGVybXV0YXRpb25zIG9mXHJcbiAqIEBwYXJhbSBwcmVmaXggICBFbGVtZW50cyB0aGF0IHNob3VsZCBiZSBpbnNlcnRlZCBhdCB0aGUgZnJvbnQgb2YgZWFjaCBsaXN0IGJlZm9yZSBlYWNoIGNhbGxcclxuICogQHBhcmFtIGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGNhbGxcclxuICovXHJcbmZ1bmN0aW9uIHJlY3Vyc2l2ZUZvckVhY2hQZXJtdXRhdGlvbjxUPiggYXJyYXk6IFRbXSwgcHJlZml4OiBUW10sIGNhbGxiYWNrOiAoIGFycmF5OiByZWFkb25seSBUW10gKSA9PiB2b2lkICk6IHZvaWQge1xyXG4gIGlmICggYXJyYXkubGVuZ3RoID09PSAwICkge1xyXG4gICAgY2FsbGJhY2soIHByZWZpeCApO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBlbGVtZW50ID0gYXJyYXlbIGkgXTtcclxuXHJcbiAgICAgIC8vIHJlbW92ZSB0aGUgZWxlbWVudCBmcm9tIHRoZSBhcnJheVxyXG4gICAgICBjb25zdCBuZXh0QXJyYXkgPSBhcnJheS5zbGljZSggMCApO1xyXG4gICAgICBuZXh0QXJyYXkuc3BsaWNlKCBpLCAxICk7XHJcblxyXG4gICAgICAvLyBhZGQgaXQgaW50byB0aGUgcHJlZml4XHJcbiAgICAgIGNvbnN0IG5leHRQcmVmaXggPSBwcmVmaXguc2xpY2UoIDAgKTtcclxuICAgICAgbmV4dFByZWZpeC5wdXNoKCBlbGVtZW50ICk7XHJcblxyXG4gICAgICByZWN1cnNpdmVGb3JFYWNoUGVybXV0YXRpb24oIG5leHRBcnJheSwgbmV4dFByZWZpeCwgY2FsbGJhY2sgKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBlcm11dGF0aW9uOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxHQUFHLE1BQU0sVUFBVTtBQUMxQixPQUFPQyxLQUFLLE1BQU0sWUFBWTtBQUU5QixNQUFNQyxXQUFXLENBQUM7RUFJaEI7QUFDRjtBQUNBO0VBQ1NDLFdBQVdBLENBQUVDLE9BQWlCLEVBQUc7SUFDdEMsSUFBSSxDQUFDQSxPQUFPLEdBQUdBLE9BQU87RUFDeEI7RUFFT0MsSUFBSUEsQ0FBQSxFQUFXO0lBQ3BCLE9BQU8sSUFBSSxDQUFDRCxPQUFPLENBQUNFLE1BQU07RUFDNUI7O0VBRUE7QUFDRjtBQUNBO0VBQ1NDLEtBQUtBLENBQTZCQyxVQUFhLEVBQXNDO0lBQzFGLElBQUssT0FBT0EsVUFBVSxLQUFLLFFBQVEsRUFBRztNQUNwQztNQUNBLE9BQU8sSUFBSSxDQUFDSixPQUFPLENBQUVJLFVBQVUsQ0FBRTtJQUNuQyxDQUFDLE1BQ0k7TUFDSCxJQUFLQSxVQUFVLENBQUNGLE1BQU0sS0FBSyxJQUFJLENBQUNELElBQUksQ0FBQyxDQUFDLEVBQUc7UUFDdkMsTUFBTSxJQUFJSSxLQUFLLENBQUcsc0JBQXFCLElBQUksQ0FBQ0osSUFBSSxDQUFDLENBQUUsNkJBQTRCRyxVQUFVLENBQUNGLE1BQU8sRUFBRSxDQUFDO01BQ3RHOztNQUVBO01BQ0EsTUFBTUksTUFBVyxHQUFHLElBQUlDLEtBQUssQ0FBRUgsVUFBVSxDQUFDRixNQUFPLENBQUM7TUFDbEQsS0FBTSxJQUFJTSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdKLFVBQVUsQ0FBQ0YsTUFBTSxFQUFFTSxDQUFDLEVBQUUsRUFBRztRQUM1Q0YsTUFBTSxDQUFFRSxDQUFDLENBQUUsR0FBR0osVUFBVSxDQUFFLElBQUksQ0FBQ0osT0FBTyxDQUFFUSxDQUFDLENBQUUsQ0FBRTtNQUMvQztNQUNBO01BQ0EsT0FBT0YsTUFBTTtJQUNmO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0VBQ1NHLFFBQVFBLENBQUEsRUFBZ0I7SUFDN0IsTUFBTUMsY0FBYyxHQUFHLElBQUlILEtBQUssQ0FBRSxJQUFJLENBQUNOLElBQUksQ0FBQyxDQUFFLENBQUM7SUFDL0MsS0FBTSxJQUFJTyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDUCxJQUFJLENBQUMsQ0FBQyxFQUFFTyxDQUFDLEVBQUUsRUFBRztNQUN0Q0UsY0FBYyxDQUFFLElBQUksQ0FBQ1YsT0FBTyxDQUFFUSxDQUFDLENBQUUsQ0FBRSxHQUFHQSxDQUFDO0lBQ3pDO0lBQ0EsT0FBTyxJQUFJVixXQUFXLENBQUVZLGNBQWUsQ0FBQztFQUMxQztFQUVPQyxtQkFBbUJBLENBQUVYLE9BQWlCLEVBQWtCO0lBQzdELE1BQU1NLE1BQXFCLEdBQUcsRUFBRTtJQUNoQ1IsV0FBVyxDQUFDYyxrQkFBa0IsQ0FBRVosT0FBTyxFQUFFYSxRQUFRLElBQUk7TUFDbkQsTUFBTUMsVUFBVSxHQUFHLElBQUksQ0FBQ2QsT0FBTztNQUMvQixNQUFNVSxjQUFjLEdBQUdJLFVBQVUsQ0FBQ0MsS0FBSyxDQUFFLENBQUUsQ0FBQztNQUU1QyxLQUFNLElBQUlQLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR1IsT0FBTyxDQUFDRSxNQUFNLEVBQUVNLENBQUMsRUFBRSxFQUFHO1FBQ3pDRSxjQUFjLENBQUVWLE9BQU8sQ0FBRVEsQ0FBQyxDQUFFLENBQUUsR0FBR00sVUFBVSxDQUFFRCxRQUFRLENBQUVMLENBQUMsQ0FBRSxDQUFFO01BQzlEO01BQ0FGLE1BQU0sQ0FBQ1UsSUFBSSxDQUFFLElBQUlsQixXQUFXLENBQUVZLGNBQWUsQ0FBRSxDQUFDO0lBQ2xELENBQUUsQ0FBQztJQUNILE9BQU9KLE1BQU07RUFDZjtFQUVPVyxRQUFRQSxDQUFBLEVBQVc7SUFDeEIsT0FBUSxLQUFJLElBQUksQ0FBQ2pCLE9BQU8sQ0FBQ2tCLElBQUksQ0FBRSxJQUFLLENBQUUsR0FBRTtFQUMxQztFQUVPQyxNQUFNQSxDQUFFQyxXQUF3QixFQUFZO0lBQ2pELE9BQU8sSUFBSSxDQUFDcEIsT0FBTyxDQUFDRSxNQUFNLEtBQUtrQixXQUFXLENBQUNwQixPQUFPLENBQUNFLE1BQU0sSUFBSW1CLENBQUMsQ0FBQ0MsT0FBTyxDQUFFLElBQUksQ0FBQ3RCLE9BQU8sRUFBRW9CLFdBQVcsQ0FBQ3BCLE9BQVEsQ0FBQztFQUM3Rzs7RUFFQTtBQUNGO0FBQ0E7RUFDRSxPQUFjdUIsUUFBUUEsQ0FBRXRCLElBQVksRUFBZ0I7SUFDbER1QixNQUFNLElBQUlBLE1BQU0sQ0FBRXZCLElBQUksSUFBSSxDQUFFLENBQUM7SUFDN0IsTUFBTUQsT0FBTyxHQUFHLElBQUlPLEtBQUssQ0FBRU4sSUFBSyxDQUFDO0lBQ2pDLEtBQU0sSUFBSU8sQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHUCxJQUFJLEVBQUVPLENBQUMsRUFBRSxFQUFHO01BQy9CUixPQUFPLENBQUVRLENBQUMsQ0FBRSxHQUFHQSxDQUFDO0lBQ2xCO0lBQ0EsT0FBTyxJQUFJVixXQUFXLENBQUVFLE9BQVEsQ0FBQztFQUNuQzs7RUFFQTtBQUNGO0FBQ0E7RUFDRSxPQUFjeUIsWUFBWUEsQ0FBRXhCLElBQVksRUFBa0I7SUFDeEQsTUFBTUssTUFBcUIsR0FBRyxFQUFFO0lBQ2hDUixXQUFXLENBQUNjLGtCQUFrQixDQUFFZixLQUFLLENBQUM2QixjQUFjLENBQUUsQ0FBQyxFQUFFekIsSUFBSSxHQUFHLENBQUUsQ0FBQyxFQUFFWSxRQUFRLElBQUk7TUFDL0VQLE1BQU0sQ0FBQ1UsSUFBSSxDQUFFLElBQUlsQixXQUFXLENBQUVlLFFBQVEsQ0FBQ0UsS0FBSyxDQUFDLENBQUUsQ0FBRSxDQUFDO0lBQ3BELENBQUUsQ0FBQztJQUNILE9BQU9ULE1BQU07RUFDZjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFjTSxrQkFBa0JBLENBQUtlLEtBQVUsRUFBRUMsUUFBeUMsRUFBUztJQUNqR0MsMkJBQTJCLENBQUVGLEtBQUssRUFBRSxFQUFFLEVBQUVDLFFBQVMsQ0FBQztFQUNwRDtFQUVBLE9BQWNFLGNBQWNBLENBQUtILEtBQVUsRUFBVTtJQUNuRCxNQUFNSSxPQUFjLEdBQUcsRUFBRTtJQUN6QmpDLFdBQVcsQ0FBQ2Msa0JBQWtCLENBQUVlLEtBQUssRUFBRXJCLE1BQU0sSUFBSTtNQUMvQ3lCLE9BQU8sQ0FBQ2YsSUFBSSxDQUFFVixNQUFNLENBQUNTLEtBQUssQ0FBQyxDQUFFLENBQUM7SUFDaEMsQ0FBRSxDQUFDO0lBQ0gsT0FBT2dCLE9BQU87RUFDaEI7QUFDRjtBQUVBbkMsR0FBRyxDQUFDb0MsUUFBUSxDQUFFLGFBQWEsRUFBRWxDLFdBQVksQ0FBQzs7QUFFMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTK0IsMkJBQTJCQSxDQUFLRixLQUFVLEVBQUVNLE1BQVcsRUFBRUwsUUFBeUMsRUFBUztFQUNsSCxJQUFLRCxLQUFLLENBQUN6QixNQUFNLEtBQUssQ0FBQyxFQUFHO0lBQ3hCMEIsUUFBUSxDQUFFSyxNQUFPLENBQUM7RUFDcEIsQ0FBQyxNQUNJO0lBQ0gsS0FBTSxJQUFJekIsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHbUIsS0FBSyxDQUFDekIsTUFBTSxFQUFFTSxDQUFDLEVBQUUsRUFBRztNQUN2QyxNQUFNMEIsT0FBTyxHQUFHUCxLQUFLLENBQUVuQixDQUFDLENBQUU7O01BRTFCO01BQ0EsTUFBTTJCLFNBQVMsR0FBR1IsS0FBSyxDQUFDWixLQUFLLENBQUUsQ0FBRSxDQUFDO01BQ2xDb0IsU0FBUyxDQUFDQyxNQUFNLENBQUU1QixDQUFDLEVBQUUsQ0FBRSxDQUFDOztNQUV4QjtNQUNBLE1BQU02QixVQUFVLEdBQUdKLE1BQU0sQ0FBQ2xCLEtBQUssQ0FBRSxDQUFFLENBQUM7TUFDcENzQixVQUFVLENBQUNyQixJQUFJLENBQUVrQixPQUFRLENBQUM7TUFFMUJMLDJCQUEyQixDQUFFTSxTQUFTLEVBQUVFLFVBQVUsRUFBRVQsUUFBUyxDQUFDO0lBQ2hFO0VBQ0Y7QUFDRjtBQUVBLGVBQWU5QixXQUFXIn0=