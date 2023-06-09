// Copyright 2023, University of Colorado Boulder

/**
 * For completely blank lines in RichText
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Pool from '../../../../phet-core/js/Pool.js';
import { Node, RichTextCleanable, scenery } from '../../imports.js';
class RichTextVerticalSpacer extends RichTextCleanable(Node) {
  constructor(height) {
    super();
    this.initialize(height);
  }
  initialize(height) {
    this.localBounds = new Bounds2(0, 0, 0, height);
    return this;
  }
  freeToPool() {
    RichTextVerticalSpacer.pool.freeToPool(this);
  }
  static pool = new Pool(RichTextVerticalSpacer);
}
scenery.register('RichTextVerticalSpacer', RichTextVerticalSpacer);
export default RichTextVerticalSpacer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiUG9vbCIsIk5vZGUiLCJSaWNoVGV4dENsZWFuYWJsZSIsInNjZW5lcnkiLCJSaWNoVGV4dFZlcnRpY2FsU3BhY2VyIiwiY29uc3RydWN0b3IiLCJoZWlnaHQiLCJpbml0aWFsaXplIiwibG9jYWxCb3VuZHMiLCJmcmVlVG9Qb29sIiwicG9vbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUmljaFRleHRWZXJ0aWNhbFNwYWNlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRm9yIGNvbXBsZXRlbHkgYmxhbmsgbGluZXMgaW4gUmljaFRleHRcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgUG9vbCwgeyBUUG9vbGFibGUgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbC5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFJpY2hUZXh0Q2xlYW5hYmxlLCBzY2VuZXJ5IH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XHJcblxyXG5jbGFzcyBSaWNoVGV4dFZlcnRpY2FsU3BhY2VyIGV4dGVuZHMgUmljaFRleHRDbGVhbmFibGUoIE5vZGUgKSBpbXBsZW1lbnRzIFRQb29sYWJsZSB7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBoZWlnaHQ6IG51bWJlciApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgdGhpcy5pbml0aWFsaXplKCBoZWlnaHQgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBpbml0aWFsaXplKCBoZWlnaHQ6IG51bWJlciApOiB0aGlzIHtcclxuXHJcbiAgICB0aGlzLmxvY2FsQm91bmRzID0gbmV3IEJvdW5kczIoIDAsIDAsIDAsIGhlaWdodCApO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGZyZWVUb1Bvb2woKTogdm9pZCB7XHJcbiAgICBSaWNoVGV4dFZlcnRpY2FsU3BhY2VyLnBvb2wuZnJlZVRvUG9vbCggdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBwb29sID0gbmV3IFBvb2woIFJpY2hUZXh0VmVydGljYWxTcGFjZXIgKTtcclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ1JpY2hUZXh0VmVydGljYWxTcGFjZXInLCBSaWNoVGV4dFZlcnRpY2FsU3BhY2VyICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSaWNoVGV4dFZlcnRpY2FsU3BhY2VyO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLElBQUksTUFBcUIsa0NBQWtDO0FBQ2xFLFNBQVNDLElBQUksRUFBRUMsaUJBQWlCLEVBQUVDLE9BQU8sUUFBUSxrQkFBa0I7QUFFbkUsTUFBTUMsc0JBQXNCLFNBQVNGLGlCQUFpQixDQUFFRCxJQUFLLENBQUMsQ0FBc0I7RUFDM0VJLFdBQVdBLENBQUVDLE1BQWMsRUFBRztJQUNuQyxLQUFLLENBQUMsQ0FBQztJQUVQLElBQUksQ0FBQ0MsVUFBVSxDQUFFRCxNQUFPLENBQUM7RUFDM0I7RUFFT0MsVUFBVUEsQ0FBRUQsTUFBYyxFQUFTO0lBRXhDLElBQUksQ0FBQ0UsV0FBVyxHQUFHLElBQUlULE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRU8sTUFBTyxDQUFDO0lBRWpELE9BQU8sSUFBSTtFQUNiO0VBRU9HLFVBQVVBLENBQUEsRUFBUztJQUN4Qkwsc0JBQXNCLENBQUNNLElBQUksQ0FBQ0QsVUFBVSxDQUFFLElBQUssQ0FBQztFQUNoRDtFQUVBLE9BQXVCQyxJQUFJLEdBQUcsSUFBSVYsSUFBSSxDQUFFSSxzQkFBdUIsQ0FBQztBQUNsRTtBQUVBRCxPQUFPLENBQUNRLFFBQVEsQ0FBRSx3QkFBd0IsRUFBRVAsc0JBQXVCLENBQUM7QUFFcEUsZUFBZUEsc0JBQXNCIn0=