// Copyright 2013-2022, University of Colorado Boulder

/**
 * View for magnifier's target, this includes the dashed traces up to the magnified view
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { Shape } from '../../../../../kite/js/imports.js';
import merge from '../../../../../phet-core/js/merge.js';
import { Node, Path, Rectangle } from '../../../../../scenery/js/imports.js';
import friction from '../../../friction.js';
class MagnifierTargetNode extends Node {
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number} cornerRadius - corner radius for the rectangle (in X and Y)
   * @param {Vector2} leftAnchor - point on the magnifier to draw the left dashed line to
   * @param {Vector2} rightAnchor - point on the magnifier to draw the right dashed line to
   * @param {Object} [options]
   */
  constructor(x, y, width, height, cornerRadius, leftAnchor, rightAnchor, options) {
    options = merge({
      stroke: 'black'
    }, options);
    super();
    const rectangle = new Rectangle(0, 0, width, height, cornerRadius, cornerRadius, {
      stroke: options.stroke,
      lineWidth: 1
    });
    this.addChild(rectangle);
    const pathLeft = new Path(new Shape().moveToPoint(leftAnchor).lineTo(x - width / 2, y), {
      stroke: options.stroke,
      lineDash: [10, 10]
    });
    this.addChild(pathLeft);
    const pathRight = new Path(new Shape().moveToPoint(rightAnchor).lineTo(x + width / 2, y), {
      stroke: options.stroke,
      lineDash: [10, 10]
    });
    this.addChild(pathRight);
    rectangle.setTranslation(x - width / 2, y - height / 2);
  }
}
friction.register('MagnifierTargetNode', MagnifierTargetNode);
export default MagnifierTargetNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIm1lcmdlIiwiTm9kZSIsIlBhdGgiLCJSZWN0YW5nbGUiLCJmcmljdGlvbiIsIk1hZ25pZmllclRhcmdldE5vZGUiLCJjb25zdHJ1Y3RvciIsIngiLCJ5Iiwid2lkdGgiLCJoZWlnaHQiLCJjb3JuZXJSYWRpdXMiLCJsZWZ0QW5jaG9yIiwicmlnaHRBbmNob3IiLCJvcHRpb25zIiwic3Ryb2tlIiwicmVjdGFuZ2xlIiwibGluZVdpZHRoIiwiYWRkQ2hpbGQiLCJwYXRoTGVmdCIsIm1vdmVUb1BvaW50IiwibGluZVRvIiwibGluZURhc2giLCJwYXRoUmlnaHQiLCJzZXRUcmFuc2xhdGlvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTWFnbmlmaWVyVGFyZ2V0Tm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciBtYWduaWZpZXIncyB0YXJnZXQsIHRoaXMgaW5jbHVkZXMgdGhlIGRhc2hlZCB0cmFjZXMgdXAgdG8gdGhlIG1hZ25pZmllZCB2aWV3XHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmV5IFplbGVua292IChNbGVhcm5lcilcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFBhdGgsIFJlY3RhbmdsZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBmcmljdGlvbiBmcm9tICcuLi8uLi8uLi9mcmljdGlvbi5qcyc7XHJcblxyXG5jbGFzcyBNYWduaWZpZXJUYXJnZXROb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvcm5lclJhZGl1cyAtIGNvcm5lciByYWRpdXMgZm9yIHRoZSByZWN0YW5nbGUgKGluIFggYW5kIFkpXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBsZWZ0QW5jaG9yIC0gcG9pbnQgb24gdGhlIG1hZ25pZmllciB0byBkcmF3IHRoZSBsZWZ0IGRhc2hlZCBsaW5lIHRvXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSByaWdodEFuY2hvciAtIHBvaW50IG9uIHRoZSBtYWduaWZpZXIgdG8gZHJhdyB0aGUgcmlnaHQgZGFzaGVkIGxpbmUgdG9cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHgsIHksIHdpZHRoLCBoZWlnaHQsIGNvcm5lclJhZGl1cywgbGVmdEFuY2hvciwgcmlnaHRBbmNob3IsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJ1xyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgY29uc3QgcmVjdGFuZ2xlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgd2lkdGgsIGhlaWdodCwgY29ybmVyUmFkaXVzLCBjb3JuZXJSYWRpdXMsIHtcclxuICAgICAgc3Ryb2tlOiBvcHRpb25zLnN0cm9rZSxcclxuICAgICAgbGluZVdpZHRoOiAxXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCByZWN0YW5nbGUgKTtcclxuICAgIGNvbnN0IHBhdGhMZWZ0ID0gbmV3IFBhdGgoIG5ldyBTaGFwZSgpXHJcbiAgICAgIC5tb3ZlVG9Qb2ludCggbGVmdEFuY2hvciApXHJcbiAgICAgIC5saW5lVG8oIHggLSB3aWR0aCAvIDIsIHkgKSwge1xyXG4gICAgICBzdHJva2U6IG9wdGlvbnMuc3Ryb2tlLFxyXG4gICAgICBsaW5lRGFzaDogWyAxMCwgMTAgXVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcGF0aExlZnQgKTtcclxuICAgIGNvbnN0IHBhdGhSaWdodCA9IG5ldyBQYXRoKCBuZXcgU2hhcGUoKVxyXG4gICAgICAubW92ZVRvUG9pbnQoIHJpZ2h0QW5jaG9yIClcclxuICAgICAgLmxpbmVUbyggeCArIHdpZHRoIC8gMiwgeSApLCB7XHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5zdHJva2UsXHJcbiAgICAgIGxpbmVEYXNoOiBbIDEwLCAxMCBdXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBwYXRoUmlnaHQgKTtcclxuXHJcbiAgICByZWN0YW5nbGUuc2V0VHJhbnNsYXRpb24oIHggLSB3aWR0aCAvIDIsIHkgLSBoZWlnaHQgLyAyICk7XHJcbiAgfVxyXG59XHJcblxyXG5mcmljdGlvbi5yZWdpc3RlciggJ01hZ25pZmllclRhcmdldE5vZGUnLCBNYWduaWZpZXJUYXJnZXROb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNYWduaWZpZXJUYXJnZXROb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxLQUFLLFFBQVEsbUNBQW1DO0FBQ3pELE9BQU9DLEtBQUssTUFBTSxzQ0FBc0M7QUFDeEQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsUUFBUSxzQ0FBc0M7QUFDNUUsT0FBT0MsUUFBUSxNQUFNLHNCQUFzQjtBQUUzQyxNQUFNQyxtQkFBbUIsU0FBU0osSUFBSSxDQUFDO0VBRXJDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VLLFdBQVdBLENBQUVDLENBQUMsRUFBRUMsQ0FBQyxFQUFFQyxLQUFLLEVBQUVDLE1BQU0sRUFBRUMsWUFBWSxFQUFFQyxVQUFVLEVBQUVDLFdBQVcsRUFBRUMsT0FBTyxFQUFHO0lBRWpGQSxPQUFPLEdBQUdkLEtBQUssQ0FBRTtNQUNmZSxNQUFNLEVBQUU7SUFDVixDQUFDLEVBQUVELE9BQVEsQ0FBQztJQUVaLEtBQUssQ0FBQyxDQUFDO0lBRVAsTUFBTUUsU0FBUyxHQUFHLElBQUliLFNBQVMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFTSxLQUFLLEVBQUVDLE1BQU0sRUFBRUMsWUFBWSxFQUFFQSxZQUFZLEVBQUU7TUFDaEZJLE1BQU0sRUFBRUQsT0FBTyxDQUFDQyxNQUFNO01BQ3RCRSxTQUFTLEVBQUU7SUFDYixDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNDLFFBQVEsQ0FBRUYsU0FBVSxDQUFDO0lBQzFCLE1BQU1HLFFBQVEsR0FBRyxJQUFJakIsSUFBSSxDQUFFLElBQUlILEtBQUssQ0FBQyxDQUFDLENBQ25DcUIsV0FBVyxDQUFFUixVQUFXLENBQUMsQ0FDekJTLE1BQU0sQ0FBRWQsQ0FBQyxHQUFHRSxLQUFLLEdBQUcsQ0FBQyxFQUFFRCxDQUFFLENBQUMsRUFBRTtNQUM3Qk8sTUFBTSxFQUFFRCxPQUFPLENBQUNDLE1BQU07TUFDdEJPLFFBQVEsRUFBRSxDQUFFLEVBQUUsRUFBRSxFQUFFO0lBQ3BCLENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ0osUUFBUSxDQUFFQyxRQUFTLENBQUM7SUFDekIsTUFBTUksU0FBUyxHQUFHLElBQUlyQixJQUFJLENBQUUsSUFBSUgsS0FBSyxDQUFDLENBQUMsQ0FDcENxQixXQUFXLENBQUVQLFdBQVksQ0FBQyxDQUMxQlEsTUFBTSxDQUFFZCxDQUFDLEdBQUdFLEtBQUssR0FBRyxDQUFDLEVBQUVELENBQUUsQ0FBQyxFQUFFO01BQzdCTyxNQUFNLEVBQUVELE9BQU8sQ0FBQ0MsTUFBTTtNQUN0Qk8sUUFBUSxFQUFFLENBQUUsRUFBRSxFQUFFLEVBQUU7SUFDcEIsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDSixRQUFRLENBQUVLLFNBQVUsQ0FBQztJQUUxQlAsU0FBUyxDQUFDUSxjQUFjLENBQUVqQixDQUFDLEdBQUdFLEtBQUssR0FBRyxDQUFDLEVBQUVELENBQUMsR0FBR0UsTUFBTSxHQUFHLENBQUUsQ0FBQztFQUMzRDtBQUNGO0FBRUFOLFFBQVEsQ0FBQ3FCLFFBQVEsQ0FBRSxxQkFBcUIsRUFBRXBCLG1CQUFvQixDQUFDO0FBRS9ELGVBQWVBLG1CQUFtQiJ9