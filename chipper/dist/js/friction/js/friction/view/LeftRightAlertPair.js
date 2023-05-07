// Copyright 2018-2021, University of Colorado Boulder

/**
 * Data structure type that keeps track of when the book has moved both left and right
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import DirectionEnum from '../../../../scenery-phet/js/accessibility/describers/DirectionEnum.js';
import friction from '../../friction.js';
class LeftRightAlertPair {
  constructor() {
    // @public
    this.left = false;
    this.right = false;
  }

  /**
   * @public
   */
  reset() {
    this.left = false;
    this.right = false;
  }

  /**
   * @public
   * @returns {boolean}
   */
  bothAlerted() {
    return this.left && this.right;
  }

  /**
   * Update the values of this type based on the directions moved by the book
   * @public
   * @param {DirectionEnum} direction - possible key (same as values) of DirectionEnum.
   */
  updateFromDirection(direction) {
    if (direction === DirectionEnum.LEFT) {
      this.left = true;
    }
    if (direction === DirectionEnum.RIGHT) {
      this.right = true;
    }
  }
}
friction.register('LeftRightAlertPair', LeftRightAlertPair);
export default LeftRightAlertPair;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaXJlY3Rpb25FbnVtIiwiZnJpY3Rpb24iLCJMZWZ0UmlnaHRBbGVydFBhaXIiLCJjb25zdHJ1Y3RvciIsImxlZnQiLCJyaWdodCIsInJlc2V0IiwiYm90aEFsZXJ0ZWQiLCJ1cGRhdGVGcm9tRGlyZWN0aW9uIiwiZGlyZWN0aW9uIiwiTEVGVCIsIlJJR0hUIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMZWZ0UmlnaHRBbGVydFBhaXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGF0YSBzdHJ1Y3R1cmUgdHlwZSB0aGF0IGtlZXBzIHRyYWNrIG9mIHdoZW4gdGhlIGJvb2sgaGFzIG1vdmVkIGJvdGggbGVmdCBhbmQgcmlnaHRcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEaXJlY3Rpb25FbnVtIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9hY2Nlc3NpYmlsaXR5L2Rlc2NyaWJlcnMvRGlyZWN0aW9uRW51bS5qcyc7XHJcbmltcG9ydCBmcmljdGlvbiBmcm9tICcuLi8uLi9mcmljdGlvbi5qcyc7XHJcblxyXG5jbGFzcyBMZWZ0UmlnaHRBbGVydFBhaXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMubGVmdCA9IGZhbHNlO1xyXG4gICAgdGhpcy5yaWdodCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5sZWZ0ID0gZmFsc2U7XHJcbiAgICB0aGlzLnJpZ2h0ID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgYm90aEFsZXJ0ZWQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5sZWZ0ICYmIHRoaXMucmlnaHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIHZhbHVlcyBvZiB0aGlzIHR5cGUgYmFzZWQgb24gdGhlIGRpcmVjdGlvbnMgbW92ZWQgYnkgdGhlIGJvb2tcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtEaXJlY3Rpb25FbnVtfSBkaXJlY3Rpb24gLSBwb3NzaWJsZSBrZXkgKHNhbWUgYXMgdmFsdWVzKSBvZiBEaXJlY3Rpb25FbnVtLlxyXG4gICAqL1xyXG4gIHVwZGF0ZUZyb21EaXJlY3Rpb24oIGRpcmVjdGlvbiApIHtcclxuICAgIGlmICggZGlyZWN0aW9uID09PSBEaXJlY3Rpb25FbnVtLkxFRlQgKSB7XHJcbiAgICAgIHRoaXMubGVmdCA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBpZiAoIGRpcmVjdGlvbiA9PT0gRGlyZWN0aW9uRW51bS5SSUdIVCApIHtcclxuICAgICAgdGhpcy5yaWdodCA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mcmljdGlvbi5yZWdpc3RlciggJ0xlZnRSaWdodEFsZXJ0UGFpcicsIExlZnRSaWdodEFsZXJ0UGFpciApO1xyXG5leHBvcnQgZGVmYXVsdCBMZWZ0UmlnaHRBbGVydFBhaXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxhQUFhLE1BQU0sdUVBQXVFO0FBQ2pHLE9BQU9DLFFBQVEsTUFBTSxtQkFBbUI7QUFFeEMsTUFBTUMsa0JBQWtCLENBQUM7RUFDdkJDLFdBQVdBLENBQUEsRUFBRztJQUVaO0lBQ0EsSUFBSSxDQUFDQyxJQUFJLEdBQUcsS0FBSztJQUNqQixJQUFJLENBQUNDLEtBQUssR0FBRyxLQUFLO0VBQ3BCOztFQUVBO0FBQ0Y7QUFDQTtFQUNFQyxLQUFLQSxDQUFBLEVBQUc7SUFDTixJQUFJLENBQUNGLElBQUksR0FBRyxLQUFLO0lBQ2pCLElBQUksQ0FBQ0MsS0FBSyxHQUFHLEtBQUs7RUFDcEI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRUUsV0FBV0EsQ0FBQSxFQUFHO0lBQ1osT0FBTyxJQUFJLENBQUNILElBQUksSUFBSSxJQUFJLENBQUNDLEtBQUs7RUFDaEM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxtQkFBbUJBLENBQUVDLFNBQVMsRUFBRztJQUMvQixJQUFLQSxTQUFTLEtBQUtULGFBQWEsQ0FBQ1UsSUFBSSxFQUFHO01BQ3RDLElBQUksQ0FBQ04sSUFBSSxHQUFHLElBQUk7SUFDbEI7SUFDQSxJQUFLSyxTQUFTLEtBQUtULGFBQWEsQ0FBQ1csS0FBSyxFQUFHO01BQ3ZDLElBQUksQ0FBQ04sS0FBSyxHQUFHLElBQUk7SUFDbkI7RUFDRjtBQUNGO0FBRUFKLFFBQVEsQ0FBQ1csUUFBUSxDQUFFLG9CQUFvQixFQUFFVixrQkFBbUIsQ0FBQztBQUM3RCxlQUFlQSxrQkFBa0IifQ==