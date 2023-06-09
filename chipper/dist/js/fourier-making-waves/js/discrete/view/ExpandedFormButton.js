// Copyright 2020-2023, University of Colorado Boulder

/**
 * ExpandedFormButton is the push button used to open the 'Expanded Form' dialog. It appear next to the equation
 * about the Sum chart in the 'Discrete' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import { Color, Path } from '../../../../scenery/js/imports.js';
import eyeSolidShape from '../../../../sherpa/js/fontawesome-5/eyeSolidShape.js';
import RoundPushButton from '../../../../sun/js/buttons/RoundPushButton.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
export default class ExpandedFormButton extends RoundPushButton {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      // RoundPushButton options
      baseColor: Color.grayColor(238),
      xMargin: 10,
      yMargin: 10,
      touchAreaDilation: 15
    }, options);
    assert && assert(!options.content, 'RoundPushButton sets content');
    options.content = new Path(eyeSolidShape, {
      scale: 0.072,
      fill: 'black'
    });
    super(options);

    // Interrupt interaction when visibility changes.
    this.visibleProperty.link(() => this.interruptSubtreeInput());
  }
}
fourierMakingWaves.register('ExpandedFormButton', ExpandedFormButton);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkNvbG9yIiwiUGF0aCIsImV5ZVNvbGlkU2hhcGUiLCJSb3VuZFB1c2hCdXR0b24iLCJmb3VyaWVyTWFraW5nV2F2ZXMiLCJFeHBhbmRlZEZvcm1CdXR0b24iLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJiYXNlQ29sb3IiLCJncmF5Q29sb3IiLCJ4TWFyZ2luIiwieU1hcmdpbiIsInRvdWNoQXJlYURpbGF0aW9uIiwiYXNzZXJ0IiwiY29udGVudCIsInNjYWxlIiwiZmlsbCIsInZpc2libGVQcm9wZXJ0eSIsImxpbmsiLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkV4cGFuZGVkRm9ybUJ1dHRvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBFeHBhbmRlZEZvcm1CdXR0b24gaXMgdGhlIHB1c2ggYnV0dG9uIHVzZWQgdG8gb3BlbiB0aGUgJ0V4cGFuZGVkIEZvcm0nIGRpYWxvZy4gSXQgYXBwZWFyIG5leHQgdG8gdGhlIGVxdWF0aW9uXHJcbiAqIGFib3V0IHRoZSBTdW0gY2hhcnQgaW4gdGhlICdEaXNjcmV0ZScgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgUGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBleWVTb2xpZFNoYXBlIGZyb20gJy4uLy4uLy4uLy4uL3NoZXJwYS9qcy9mb250YXdlc29tZS01L2V5ZVNvbGlkU2hhcGUuanMnO1xyXG5pbXBvcnQgUm91bmRQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JvdW5kUHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBmb3VyaWVyTWFraW5nV2F2ZXMgZnJvbSAnLi4vLi4vZm91cmllck1ha2luZ1dhdmVzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4cGFuZGVkRm9ybUJ1dHRvbiBleHRlbmRzIFJvdW5kUHVzaEJ1dHRvbiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIFJvdW5kUHVzaEJ1dHRvbiBvcHRpb25zXHJcbiAgICAgIGJhc2VDb2xvcjogQ29sb3IuZ3JheUNvbG9yKCAyMzggKSxcclxuICAgICAgeE1hcmdpbjogMTAsXHJcbiAgICAgIHlNYXJnaW46IDEwLFxyXG4gICAgICB0b3VjaEFyZWFEaWxhdGlvbjogMTVcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5jb250ZW50LCAnUm91bmRQdXNoQnV0dG9uIHNldHMgY29udGVudCcgKTtcclxuICAgIG9wdGlvbnMuY29udGVudCA9IG5ldyBQYXRoKCBleWVTb2xpZFNoYXBlLCB7XHJcbiAgICAgIHNjYWxlOiAwLjA3MixcclxuICAgICAgZmlsbDogJ2JsYWNrJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gSW50ZXJydXB0IGludGVyYWN0aW9uIHdoZW4gdmlzaWJpbGl0eSBjaGFuZ2VzLlxyXG4gICAgdGhpcy52aXNpYmxlUHJvcGVydHkubGluayggKCkgPT4gdGhpcy5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKSApO1xyXG4gIH1cclxufVxyXG5cclxuZm91cmllck1ha2luZ1dhdmVzLnJlZ2lzdGVyKCAnRXhwYW5kZWRGb3JtQnV0dG9uJywgRXhwYW5kZWRGb3JtQnV0dG9uICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxLQUFLLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDL0QsT0FBT0MsYUFBYSxNQUFNLHNEQUFzRDtBQUNoRixPQUFPQyxlQUFlLE1BQU0sK0NBQStDO0FBQzNFLE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUU1RCxlQUFlLE1BQU1DLGtCQUFrQixTQUFTRixlQUFlLENBQUM7RUFFOUQ7QUFDRjtBQUNBO0VBQ0VHLFdBQVdBLENBQUVDLE9BQU8sRUFBRztJQUVyQkEsT0FBTyxHQUFHUixLQUFLLENBQUU7TUFFZjtNQUNBUyxTQUFTLEVBQUVSLEtBQUssQ0FBQ1MsU0FBUyxDQUFFLEdBQUksQ0FBQztNQUNqQ0MsT0FBTyxFQUFFLEVBQUU7TUFDWEMsT0FBTyxFQUFFLEVBQUU7TUFDWEMsaUJBQWlCLEVBQUU7SUFDckIsQ0FBQyxFQUFFTCxPQUFRLENBQUM7SUFFWk0sTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQ04sT0FBTyxDQUFDTyxPQUFPLEVBQUUsOEJBQStCLENBQUM7SUFDcEVQLE9BQU8sQ0FBQ08sT0FBTyxHQUFHLElBQUliLElBQUksQ0FBRUMsYUFBYSxFQUFFO01BQ3pDYSxLQUFLLEVBQUUsS0FBSztNQUNaQyxJQUFJLEVBQUU7SUFDUixDQUFFLENBQUM7SUFFSCxLQUFLLENBQUVULE9BQVEsQ0FBQzs7SUFFaEI7SUFDQSxJQUFJLENBQUNVLGVBQWUsQ0FBQ0MsSUFBSSxDQUFFLE1BQU0sSUFBSSxDQUFDQyxxQkFBcUIsQ0FBQyxDQUFFLENBQUM7RUFDakU7QUFDRjtBQUVBZixrQkFBa0IsQ0FBQ2dCLFFBQVEsQ0FBRSxvQkFBb0IsRUFBRWYsa0JBQW1CLENBQUMifQ==