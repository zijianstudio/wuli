// Copyright 2016-2022, University of Colorado Boulder

/**
 * Dialog that displays the 'Out of balls!' message.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import Dialog from '../../../../sun/js/Dialog.js';
import plinkoProbability from '../../plinkoProbability.js';
import PlinkoProbabilityStrings from '../../PlinkoProbabilityStrings.js';
class OutOfBallsDialog extends Dialog {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      xSpacing: 45,
      topMargin: 33,
      bottomMargin: 33
    }, options);
    const messageNode = new Text(PlinkoProbabilityStrings.outOfBalls, {
      font: new PhetFont(33),
      maxWidth: 350
    });
    super(messageNode, options);
  }
}
plinkoProbability.register('OutOfBallsDialog', OutOfBallsDialog);
export default OutOfBallsDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlBoZXRGb250IiwiVGV4dCIsIkRpYWxvZyIsInBsaW5rb1Byb2JhYmlsaXR5IiwiUGxpbmtvUHJvYmFiaWxpdHlTdHJpbmdzIiwiT3V0T2ZCYWxsc0RpYWxvZyIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsInhTcGFjaW5nIiwidG9wTWFyZ2luIiwiYm90dG9tTWFyZ2luIiwibWVzc2FnZU5vZGUiLCJvdXRPZkJhbGxzIiwiZm9udCIsIm1heFdpZHRoIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJPdXRPZkJhbGxzRGlhbG9nLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERpYWxvZyB0aGF0IGRpc3BsYXlzIHRoZSAnT3V0IG9mIGJhbGxzIScgbWVzc2FnZS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgRGlhbG9nIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9EaWFsb2cuanMnO1xyXG5pbXBvcnQgcGxpbmtvUHJvYmFiaWxpdHkgZnJvbSAnLi4vLi4vcGxpbmtvUHJvYmFiaWxpdHkuanMnO1xyXG5pbXBvcnQgUGxpbmtvUHJvYmFiaWxpdHlTdHJpbmdzIGZyb20gJy4uLy4uL1BsaW5rb1Byb2JhYmlsaXR5U3RyaW5ncy5qcyc7XHJcblxyXG5jbGFzcyBPdXRPZkJhbGxzRGlhbG9nIGV4dGVuZHMgRGlhbG9nIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICB4U3BhY2luZzogNDUsXHJcbiAgICAgIHRvcE1hcmdpbjogMzMsXHJcbiAgICAgIGJvdHRvbU1hcmdpbjogMzNcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBtZXNzYWdlTm9kZSA9IG5ldyBUZXh0KCBQbGlua29Qcm9iYWJpbGl0eVN0cmluZ3Mub3V0T2ZCYWxscywge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDMzICksXHJcbiAgICAgIG1heFdpZHRoOiAzNTBcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggbWVzc2FnZU5vZGUsIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbnBsaW5rb1Byb2JhYmlsaXR5LnJlZ2lzdGVyKCAnT3V0T2ZCYWxsc0RpYWxvZycsIE91dE9mQmFsbHNEaWFsb2cgKTtcclxuZXhwb3J0IGRlZmF1bHQgT3V0T2ZCYWxsc0RpYWxvZzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksUUFBUSxtQ0FBbUM7QUFDeEQsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyxpQkFBaUIsTUFBTSw0QkFBNEI7QUFDMUQsT0FBT0Msd0JBQXdCLE1BQU0sbUNBQW1DO0FBRXhFLE1BQU1DLGdCQUFnQixTQUFTSCxNQUFNLENBQUM7RUFFcEM7QUFDRjtBQUNBO0VBQ0VJLFdBQVdBLENBQUVDLE9BQU8sRUFBRztJQUVyQkEsT0FBTyxHQUFHUixLQUFLLENBQUU7TUFDZlMsUUFBUSxFQUFFLEVBQUU7TUFDWkMsU0FBUyxFQUFFLEVBQUU7TUFDYkMsWUFBWSxFQUFFO0lBQ2hCLENBQUMsRUFBRUgsT0FBUSxDQUFDO0lBRVosTUFBTUksV0FBVyxHQUFHLElBQUlWLElBQUksQ0FBRUcsd0JBQXdCLENBQUNRLFVBQVUsRUFBRTtNQUNqRUMsSUFBSSxFQUFFLElBQUliLFFBQVEsQ0FBRSxFQUFHLENBQUM7TUFDeEJjLFFBQVEsRUFBRTtJQUNaLENBQUUsQ0FBQztJQUVILEtBQUssQ0FBRUgsV0FBVyxFQUFFSixPQUFRLENBQUM7RUFDL0I7QUFDRjtBQUVBSixpQkFBaUIsQ0FBQ1ksUUFBUSxDQUFFLGtCQUFrQixFQUFFVixnQkFBaUIsQ0FBQztBQUNsRSxlQUFlQSxnQkFBZ0IifQ==