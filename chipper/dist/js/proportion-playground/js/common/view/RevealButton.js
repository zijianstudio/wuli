// Copyright 2016-2022, University of Colorado Boulder

/**
 * In the Predict screen, the user can press the RevealButton to show the items.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import { Path } from '../../../../scenery/js/imports.js';
import eyeSlashSolidShape from '../../../../sherpa/js/fontawesome-5/eyeSlashSolidShape.js';
import eyeSolidShape from '../../../../sherpa/js/fontawesome-5/eyeSolidShape.js';
import BooleanRoundToggleButton from '../../../../sun/js/buttons/BooleanRoundToggleButton.js';
import proportionPlayground from '../../proportionPlayground.js';
import ProportionPlaygroundColors from './ProportionPlaygroundColors.js';
class RevealButton extends BooleanRoundToggleButton {
  /**
   * @param {Property.<boolean>} revealingProperty - true if the answer should be shown.
   * @param {Object} [options]
   */
  constructor(revealingProperty, options) {
    const revealedNode = new Path(eyeSolidShape, {
      scale: 0.07,
      fill: 'black'
    });
    const hiddenNode = new Path(eyeSlashSolidShape, {
      scale: 0.07,
      fill: 'black'
    });
    options = merge({
      xMargin: 10,
      yMargin: 10,
      baseColor: ProportionPlaygroundColors.revealButtonProperty
    }, options);
    super(revealingProperty, revealedNode, hiddenNode, options);
  }
}
proportionPlayground.register('RevealButton', RevealButton);
export default RevealButton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlBhdGgiLCJleWVTbGFzaFNvbGlkU2hhcGUiLCJleWVTb2xpZFNoYXBlIiwiQm9vbGVhblJvdW5kVG9nZ2xlQnV0dG9uIiwicHJvcG9ydGlvblBsYXlncm91bmQiLCJQcm9wb3J0aW9uUGxheWdyb3VuZENvbG9ycyIsIlJldmVhbEJ1dHRvbiIsImNvbnN0cnVjdG9yIiwicmV2ZWFsaW5nUHJvcGVydHkiLCJvcHRpb25zIiwicmV2ZWFsZWROb2RlIiwic2NhbGUiLCJmaWxsIiwiaGlkZGVuTm9kZSIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiYmFzZUNvbG9yIiwicmV2ZWFsQnV0dG9uUHJvcGVydHkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJldmVhbEJ1dHRvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBJbiB0aGUgUHJlZGljdCBzY3JlZW4sIHRoZSB1c2VyIGNhbiBwcmVzcyB0aGUgUmV2ZWFsQnV0dG9uIHRvIHNob3cgdGhlIGl0ZW1zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGV5ZVNsYXNoU29saWRTaGFwZSBmcm9tICcuLi8uLi8uLi8uLi9zaGVycGEvanMvZm9udGF3ZXNvbWUtNS9leWVTbGFzaFNvbGlkU2hhcGUuanMnO1xyXG5pbXBvcnQgZXllU29saWRTaGFwZSBmcm9tICcuLi8uLi8uLi8uLi9zaGVycGEvanMvZm9udGF3ZXNvbWUtNS9leWVTb2xpZFNoYXBlLmpzJztcclxuaW1wb3J0IEJvb2xlYW5Sb3VuZFRvZ2dsZUJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9Cb29sZWFuUm91bmRUb2dnbGVCdXR0b24uanMnO1xyXG5pbXBvcnQgcHJvcG9ydGlvblBsYXlncm91bmQgZnJvbSAnLi4vLi4vcHJvcG9ydGlvblBsYXlncm91bmQuanMnO1xyXG5pbXBvcnQgUHJvcG9ydGlvblBsYXlncm91bmRDb2xvcnMgZnJvbSAnLi9Qcm9wb3J0aW9uUGxheWdyb3VuZENvbG9ycy5qcyc7XHJcblxyXG5jbGFzcyBSZXZlYWxCdXR0b24gZXh0ZW5kcyBCb29sZWFuUm91bmRUb2dnbGVCdXR0b24ge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSByZXZlYWxpbmdQcm9wZXJ0eSAtIHRydWUgaWYgdGhlIGFuc3dlciBzaG91bGQgYmUgc2hvd24uXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCByZXZlYWxpbmdQcm9wZXJ0eSwgb3B0aW9ucyApIHtcclxuICAgIGNvbnN0IHJldmVhbGVkTm9kZSA9IG5ldyBQYXRoKCBleWVTb2xpZFNoYXBlLCB7IHNjYWxlOiAwLjA3LCBmaWxsOiAnYmxhY2snIH0gKTtcclxuICAgIGNvbnN0IGhpZGRlbk5vZGUgPSBuZXcgUGF0aCggZXllU2xhc2hTb2xpZFNoYXBlLCB7IHNjYWxlOiAwLjA3LCBmaWxsOiAnYmxhY2snIH0gKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgeE1hcmdpbjogMTAsXHJcbiAgICAgIHlNYXJnaW46IDEwLFxyXG4gICAgICBiYXNlQ29sb3I6IFByb3BvcnRpb25QbGF5Z3JvdW5kQ29sb3JzLnJldmVhbEJ1dHRvblByb3BlcnR5XHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIHJldmVhbGluZ1Byb3BlcnR5LCByZXZlYWxlZE5vZGUsIGhpZGRlbk5vZGUsIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbnByb3BvcnRpb25QbGF5Z3JvdW5kLnJlZ2lzdGVyKCAnUmV2ZWFsQnV0dG9uJywgUmV2ZWFsQnV0dG9uICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSZXZlYWxCdXR0b247Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsU0FBU0MsSUFBSSxRQUFRLG1DQUFtQztBQUN4RCxPQUFPQyxrQkFBa0IsTUFBTSwyREFBMkQ7QUFDMUYsT0FBT0MsYUFBYSxNQUFNLHNEQUFzRDtBQUNoRixPQUFPQyx3QkFBd0IsTUFBTSx3REFBd0Q7QUFDN0YsT0FBT0Msb0JBQW9CLE1BQU0sK0JBQStCO0FBQ2hFLE9BQU9DLDBCQUEwQixNQUFNLGlDQUFpQztBQUV4RSxNQUFNQyxZQUFZLFNBQVNILHdCQUF3QixDQUFDO0VBQ2xEO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VJLFdBQVdBLENBQUVDLGlCQUFpQixFQUFFQyxPQUFPLEVBQUc7SUFDeEMsTUFBTUMsWUFBWSxHQUFHLElBQUlWLElBQUksQ0FBRUUsYUFBYSxFQUFFO01BQUVTLEtBQUssRUFBRSxJQUFJO01BQUVDLElBQUksRUFBRTtJQUFRLENBQUUsQ0FBQztJQUM5RSxNQUFNQyxVQUFVLEdBQUcsSUFBSWIsSUFBSSxDQUFFQyxrQkFBa0IsRUFBRTtNQUFFVSxLQUFLLEVBQUUsSUFBSTtNQUFFQyxJQUFJLEVBQUU7SUFBUSxDQUFFLENBQUM7SUFFakZILE9BQU8sR0FBR1YsS0FBSyxDQUFFO01BQ2ZlLE9BQU8sRUFBRSxFQUFFO01BQ1hDLE9BQU8sRUFBRSxFQUFFO01BQ1hDLFNBQVMsRUFBRVgsMEJBQTBCLENBQUNZO0lBQ3hDLENBQUMsRUFBRVIsT0FBUSxDQUFDO0lBRVosS0FBSyxDQUFFRCxpQkFBaUIsRUFBRUUsWUFBWSxFQUFFRyxVQUFVLEVBQUVKLE9BQVEsQ0FBQztFQUMvRDtBQUNGO0FBRUFMLG9CQUFvQixDQUFDYyxRQUFRLENBQUUsY0FBYyxFQUFFWixZQUFhLENBQUM7QUFFN0QsZUFBZUEsWUFBWSJ9