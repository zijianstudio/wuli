// Copyright 2016-2022, University of Colorado Boulder

/**
 * Triangle indicators used in the paint gradient and apple graph.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { Path } from '../../../../scenery/js/imports.js';
import proportionPlayground from '../../proportionPlayground.js';
import Side from '../model/Side.js';

// constants
const TRIANGLE_LENGTH = 17;
const TRIANGLE_ALTITUDE = 10;
const LEFT_TRIANGLE_SHAPE = new Shape().moveTo(0, 0).lineTo(TRIANGLE_ALTITUDE, TRIANGLE_LENGTH / 2).lineTo(0, TRIANGLE_LENGTH).lineTo(0, 0);
const RIGHT_TRIANGLE_SHAPE = LEFT_TRIANGLE_SHAPE.transformed(Matrix3.scaling(-1, 1));
class TriangleNode extends Path {
  /**
   * @param {Side} side - Side.LEFT or Side.RIGHT
   * @param {Object} [options]
   */
  constructor(side, options) {
    assert && assert(Side.includes(side), 'Side should be Side.LEFT or Side.RIGHT');

    // defaults
    options = merge({
      stroke: 'black',
      lineWidth: 1
    }, options);
    super(side === Side.LEFT ? LEFT_TRIANGLE_SHAPE : RIGHT_TRIANGLE_SHAPE, options);
  }
}
proportionPlayground.register('TriangleNode', TriangleNode);
export default TriangleNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRyaXgzIiwiU2hhcGUiLCJtZXJnZSIsIlBhdGgiLCJwcm9wb3J0aW9uUGxheWdyb3VuZCIsIlNpZGUiLCJUUklBTkdMRV9MRU5HVEgiLCJUUklBTkdMRV9BTFRJVFVERSIsIkxFRlRfVFJJQU5HTEVfU0hBUEUiLCJtb3ZlVG8iLCJsaW5lVG8iLCJSSUdIVF9UUklBTkdMRV9TSEFQRSIsInRyYW5zZm9ybWVkIiwic2NhbGluZyIsIlRyaWFuZ2xlTm9kZSIsImNvbnN0cnVjdG9yIiwic2lkZSIsIm9wdGlvbnMiLCJhc3NlcnQiLCJpbmNsdWRlcyIsInN0cm9rZSIsImxpbmVXaWR0aCIsIkxFRlQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRyaWFuZ2xlTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUcmlhbmdsZSBpbmRpY2F0b3JzIHVzZWQgaW4gdGhlIHBhaW50IGdyYWRpZW50IGFuZCBhcHBsZSBncmFwaC5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgcHJvcG9ydGlvblBsYXlncm91bmQgZnJvbSAnLi4vLi4vcHJvcG9ydGlvblBsYXlncm91bmQuanMnO1xyXG5pbXBvcnQgU2lkZSBmcm9tICcuLi9tb2RlbC9TaWRlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBUUklBTkdMRV9MRU5HVEggPSAxNztcclxuY29uc3QgVFJJQU5HTEVfQUxUSVRVREUgPSAxMDtcclxuY29uc3QgTEVGVF9UUklBTkdMRV9TSEFQRSA9IG5ldyBTaGFwZSgpLm1vdmVUbyggMCwgMCApXHJcbiAgLmxpbmVUbyggVFJJQU5HTEVfQUxUSVRVREUsIFRSSUFOR0xFX0xFTkdUSCAvIDIgKVxyXG4gIC5saW5lVG8oIDAsIFRSSUFOR0xFX0xFTkdUSCApXHJcbiAgLmxpbmVUbyggMCwgMCApO1xyXG5jb25zdCBSSUdIVF9UUklBTkdMRV9TSEFQRSA9IExFRlRfVFJJQU5HTEVfU0hBUEUudHJhbnNmb3JtZWQoIE1hdHJpeDMuc2NhbGluZyggLTEsIDEgKSApO1xyXG5cclxuY2xhc3MgVHJpYW5nbGVOb2RlIGV4dGVuZHMgUGF0aCB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtTaWRlfSBzaWRlIC0gU2lkZS5MRUZUIG9yIFNpZGUuUklHSFRcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHNpZGUsIG9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBTaWRlLmluY2x1ZGVzKCBzaWRlICksICdTaWRlIHNob3VsZCBiZSBTaWRlLkxFRlQgb3IgU2lkZS5SSUdIVCcgKTtcclxuXHJcbiAgICAvLyBkZWZhdWx0c1xyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgbGluZVdpZHRoOiAxXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIHNpZGUgPT09IFNpZGUuTEVGVCA/IExFRlRfVFJJQU5HTEVfU0hBUEUgOiBSSUdIVF9UUklBTkdMRV9TSEFQRSwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxucHJvcG9ydGlvblBsYXlncm91bmQucmVnaXN0ZXIoICdUcmlhbmdsZU5vZGUnLCBUcmlhbmdsZU5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRyaWFuZ2xlTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsU0FBU0MsSUFBSSxRQUFRLG1DQUFtQztBQUN4RCxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7QUFDaEUsT0FBT0MsSUFBSSxNQUFNLGtCQUFrQjs7QUFFbkM7QUFDQSxNQUFNQyxlQUFlLEdBQUcsRUFBRTtBQUMxQixNQUFNQyxpQkFBaUIsR0FBRyxFQUFFO0FBQzVCLE1BQU1DLG1CQUFtQixHQUFHLElBQUlQLEtBQUssQ0FBQyxDQUFDLENBQUNRLE1BQU0sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQ25EQyxNQUFNLENBQUVILGlCQUFpQixFQUFFRCxlQUFlLEdBQUcsQ0FBRSxDQUFDLENBQ2hESSxNQUFNLENBQUUsQ0FBQyxFQUFFSixlQUFnQixDQUFDLENBQzVCSSxNQUFNLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztBQUNqQixNQUFNQyxvQkFBb0IsR0FBR0gsbUJBQW1CLENBQUNJLFdBQVcsQ0FBRVosT0FBTyxDQUFDYSxPQUFPLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBRSxDQUFFLENBQUM7QUFFeEYsTUFBTUMsWUFBWSxTQUFTWCxJQUFJLENBQUM7RUFDOUI7QUFDRjtBQUNBO0FBQ0E7RUFDRVksV0FBV0EsQ0FBRUMsSUFBSSxFQUFFQyxPQUFPLEVBQUc7SUFDM0JDLE1BQU0sSUFBSUEsTUFBTSxDQUFFYixJQUFJLENBQUNjLFFBQVEsQ0FBRUgsSUFBSyxDQUFDLEVBQUUsd0NBQXlDLENBQUM7O0lBRW5GO0lBQ0FDLE9BQU8sR0FBR2YsS0FBSyxDQUFFO01BQ2ZrQixNQUFNLEVBQUUsT0FBTztNQUNmQyxTQUFTLEVBQUU7SUFDYixDQUFDLEVBQUVKLE9BQVEsQ0FBQztJQUVaLEtBQUssQ0FBRUQsSUFBSSxLQUFLWCxJQUFJLENBQUNpQixJQUFJLEdBQUdkLG1CQUFtQixHQUFHRyxvQkFBb0IsRUFBRU0sT0FBUSxDQUFDO0VBQ25GO0FBQ0Y7QUFFQWIsb0JBQW9CLENBQUNtQixRQUFRLENBQUUsY0FBYyxFQUFFVCxZQUFhLENBQUM7QUFFN0QsZUFBZUEsWUFBWSJ9