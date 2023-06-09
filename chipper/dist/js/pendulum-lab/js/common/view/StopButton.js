// Copyright 2017-2020, University of Colorado Boulder

/**
 * Stop button node in 'Pendulum Lab' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

import merge from '../../../../phet-core/js/merge.js';
import StopSignNode from '../../../../scenery-phet/js/StopSignNode.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import pendulumLab from '../../pendulumLab.js';
class StopButton extends RectangularPushButton {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    super(merge({
      xMargin: 7,
      yMargin: 3,
      touchAreaXDilation: 6,
      touchAreaYDilation: 6,
      baseColor: 'rgb( 231, 232, 233 )',
      content: new StopSignNode({
        scale: 0.4
      })
    }, options));
  }
}
pendulumLab.register('StopButton', StopButton);
export default StopButton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlN0b3BTaWduTm9kZSIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsInBlbmR1bHVtTGFiIiwiU3RvcEJ1dHRvbiIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwiYmFzZUNvbG9yIiwiY29udGVudCIsInNjYWxlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTdG9wQnV0dG9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFN0b3AgYnV0dG9uIG5vZGUgaW4gJ1BlbmR1bHVtIExhYicgc2ltdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBBbmRyZXkgWmVsZW5rb3YgKE1sZWFybmVyKVxyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgU3RvcFNpZ25Ob2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TdG9wU2lnbk5vZGUuanMnO1xyXG5pbXBvcnQgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBwZW5kdWx1bUxhYiBmcm9tICcuLi8uLi9wZW5kdWx1bUxhYi5qcyc7XHJcblxyXG5jbGFzcyBTdG9wQnV0dG9uIGV4dGVuZHMgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcbiAgICBzdXBlciggbWVyZ2UoIHtcclxuICAgICAgeE1hcmdpbjogNyxcclxuICAgICAgeU1hcmdpbjogMyxcclxuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiA2LFxyXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDYsXHJcbiAgICAgIGJhc2VDb2xvcjogJ3JnYiggMjMxLCAyMzIsIDIzMyApJyxcclxuICAgICAgY29udGVudDogbmV3IFN0b3BTaWduTm9kZSgge1xyXG4gICAgICAgIHNjYWxlOiAwLjRcclxuICAgICAgfSApXHJcbiAgICB9LCBvcHRpb25zICkgKTtcclxuICB9XHJcbn1cclxuXHJcbnBlbmR1bHVtTGFiLnJlZ2lzdGVyKCAnU3RvcEJ1dHRvbicsIFN0b3BCdXR0b24gKTtcclxuZXhwb3J0IGRlZmF1bHQgU3RvcEJ1dHRvbjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxZQUFZLE1BQU0sNkNBQTZDO0FBQ3RFLE9BQU9DLHFCQUFxQixNQUFNLHFEQUFxRDtBQUN2RixPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBRTlDLE1BQU1DLFVBQVUsU0FBU0YscUJBQXFCLENBQUM7RUFDN0M7QUFDRjtBQUNBO0VBQ0VHLFdBQVdBLENBQUVDLE9BQU8sRUFBRztJQUNyQixLQUFLLENBQUVOLEtBQUssQ0FBRTtNQUNaTyxPQUFPLEVBQUUsQ0FBQztNQUNWQyxPQUFPLEVBQUUsQ0FBQztNQUNWQyxrQkFBa0IsRUFBRSxDQUFDO01BQ3JCQyxrQkFBa0IsRUFBRSxDQUFDO01BQ3JCQyxTQUFTLEVBQUUsc0JBQXNCO01BQ2pDQyxPQUFPLEVBQUUsSUFBSVgsWUFBWSxDQUFFO1FBQ3pCWSxLQUFLLEVBQUU7TUFDVCxDQUFFO0lBQ0osQ0FBQyxFQUFFUCxPQUFRLENBQUUsQ0FBQztFQUNoQjtBQUNGO0FBRUFILFdBQVcsQ0FBQ1csUUFBUSxDQUFFLFlBQVksRUFBRVYsVUFBVyxDQUFDO0FBQ2hELGVBQWVBLFVBQVUifQ==