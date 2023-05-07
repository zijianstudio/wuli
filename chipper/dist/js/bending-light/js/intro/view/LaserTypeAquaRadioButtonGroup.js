// Copyright 2015-2022, University of Colorado Boulder

/**
 * In the intro screen, these radio buttons choose between "Ray" and "Wave" representations.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text, VBox } from '../../../../scenery/js/imports.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import BendingLightStrings from '../../BendingLightStrings.js';
import bendingLight from '../../bendingLight.js';
import LaserViewEnum from '../../common/model/LaserViewEnum.js';
const rayStringProperty = BendingLightStrings.rayStringProperty;
const waveStringProperty = BendingLightStrings.waveStringProperty;
class LaserTypeAquaRadioButtonGroup extends VBox {
  constructor(laserTypeProperty) {
    const radioButtonOptions = {
      radius: 6,
      font: new PhetFont(12)
    };
    const createButtonTextNode = text => new Text(text, {
      maxWidth: 120,
      // measured empirically to ensure no overlap with the laser at any angle
      font: new PhetFont(12)
    });
    const rayButton = new AquaRadioButton(laserTypeProperty, LaserViewEnum.RAY, createButtonTextNode(rayStringProperty), radioButtonOptions);
    const waveButton = new AquaRadioButton(laserTypeProperty, LaserViewEnum.WAVE, createButtonTextNode(waveStringProperty), radioButtonOptions);
    const spacing = 10;
    const dilation = spacing / 2;

    // Use the same touch area width for each button, even if the texts are different widths
    const union = rayButton.localBounds.union(waveButton.localBounds);
    rayButton.touchArea = union.dilated(dilation);
    waveButton.touchArea = union.dilated(dilation);
    super({
      spacing: spacing,
      align: 'left',
      children: [rayButton, waveButton]
    });
  }
}
bendingLight.register('LaserTypeAquaRadioButtonGroup', LaserTypeAquaRadioButtonGroup);
export default LaserTypeAquaRadioButtonGroup;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0Rm9udCIsIlRleHQiLCJWQm94IiwiQXF1YVJhZGlvQnV0dG9uIiwiQmVuZGluZ0xpZ2h0U3RyaW5ncyIsImJlbmRpbmdMaWdodCIsIkxhc2VyVmlld0VudW0iLCJyYXlTdHJpbmdQcm9wZXJ0eSIsIndhdmVTdHJpbmdQcm9wZXJ0eSIsIkxhc2VyVHlwZUFxdWFSYWRpb0J1dHRvbkdyb3VwIiwiY29uc3RydWN0b3IiLCJsYXNlclR5cGVQcm9wZXJ0eSIsInJhZGlvQnV0dG9uT3B0aW9ucyIsInJhZGl1cyIsImZvbnQiLCJjcmVhdGVCdXR0b25UZXh0Tm9kZSIsInRleHQiLCJtYXhXaWR0aCIsInJheUJ1dHRvbiIsIlJBWSIsIndhdmVCdXR0b24iLCJXQVZFIiwic3BhY2luZyIsImRpbGF0aW9uIiwidW5pb24iLCJsb2NhbEJvdW5kcyIsInRvdWNoQXJlYSIsImRpbGF0ZWQiLCJhbGlnbiIsImNoaWxkcmVuIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMYXNlclR5cGVBcXVhUmFkaW9CdXR0b25Hcm91cC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBJbiB0aGUgaW50cm8gc2NyZWVuLCB0aGVzZSByYWRpbyBidXR0b25zIGNob29zZSBiZXR3ZWVuIFwiUmF5XCIgYW5kIFwiV2F2ZVwiIHJlcHJlc2VudGF0aW9ucy5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBcXVhUmFkaW9CdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0FxdWFSYWRpb0J1dHRvbi5qcyc7XHJcbmltcG9ydCBCZW5kaW5nTGlnaHRTdHJpbmdzIGZyb20gJy4uLy4uL0JlbmRpbmdMaWdodFN0cmluZ3MuanMnO1xyXG5pbXBvcnQgYmVuZGluZ0xpZ2h0IGZyb20gJy4uLy4uL2JlbmRpbmdMaWdodC5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IExhc2VyVmlld0VudW0gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0xhc2VyVmlld0VudW0uanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcblxyXG5jb25zdCByYXlTdHJpbmdQcm9wZXJ0eSA9IEJlbmRpbmdMaWdodFN0cmluZ3MucmF5U3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHdhdmVTdHJpbmdQcm9wZXJ0eSA9IEJlbmRpbmdMaWdodFN0cmluZ3Mud2F2ZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuY2xhc3MgTGFzZXJUeXBlQXF1YVJhZGlvQnV0dG9uR3JvdXAgZXh0ZW5kcyBWQm94IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsYXNlclR5cGVQcm9wZXJ0eTogUHJvcGVydHk8TGFzZXJWaWV3RW51bT4gKSB7XHJcbiAgICBjb25zdCByYWRpb0J1dHRvbk9wdGlvbnMgPSB7XHJcbiAgICAgIHJhZGl1czogNixcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxMiApXHJcbiAgICB9O1xyXG4gICAgY29uc3QgY3JlYXRlQnV0dG9uVGV4dE5vZGUgPSAoIHRleHQ6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4gKSA9PiBuZXcgVGV4dCggdGV4dCwge1xyXG4gICAgICBtYXhXaWR0aDogMTIwLCAvLyBtZWFzdXJlZCBlbXBpcmljYWxseSB0byBlbnN1cmUgbm8gb3ZlcmxhcCB3aXRoIHRoZSBsYXNlciBhdCBhbnkgYW5nbGVcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxMiApXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCByYXlCdXR0b24gPSBuZXcgQXF1YVJhZGlvQnV0dG9uKFxyXG4gICAgICBsYXNlclR5cGVQcm9wZXJ0eSxcclxuICAgICAgTGFzZXJWaWV3RW51bS5SQVksXHJcbiAgICAgIGNyZWF0ZUJ1dHRvblRleHROb2RlKCByYXlTdHJpbmdQcm9wZXJ0eSApLFxyXG4gICAgICByYWRpb0J1dHRvbk9wdGlvbnNcclxuICAgICk7XHJcbiAgICBjb25zdCB3YXZlQnV0dG9uID0gbmV3IEFxdWFSYWRpb0J1dHRvbihcclxuICAgICAgbGFzZXJUeXBlUHJvcGVydHksXHJcbiAgICAgIExhc2VyVmlld0VudW0uV0FWRSxcclxuICAgICAgY3JlYXRlQnV0dG9uVGV4dE5vZGUoIHdhdmVTdHJpbmdQcm9wZXJ0eSApLFxyXG4gICAgICByYWRpb0J1dHRvbk9wdGlvbnNcclxuICAgICk7XHJcbiAgICBjb25zdCBzcGFjaW5nID0gMTA7XHJcbiAgICBjb25zdCBkaWxhdGlvbiA9IHNwYWNpbmcgLyAyO1xyXG5cclxuICAgIC8vIFVzZSB0aGUgc2FtZSB0b3VjaCBhcmVhIHdpZHRoIGZvciBlYWNoIGJ1dHRvbiwgZXZlbiBpZiB0aGUgdGV4dHMgYXJlIGRpZmZlcmVudCB3aWR0aHNcclxuICAgIGNvbnN0IHVuaW9uID0gcmF5QnV0dG9uLmxvY2FsQm91bmRzLnVuaW9uKCB3YXZlQnV0dG9uLmxvY2FsQm91bmRzICk7XHJcbiAgICByYXlCdXR0b24udG91Y2hBcmVhID0gdW5pb24uZGlsYXRlZCggZGlsYXRpb24gKTtcclxuICAgIHdhdmVCdXR0b24udG91Y2hBcmVhID0gdW5pb24uZGlsYXRlZCggZGlsYXRpb24gKTtcclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHNwYWNpbmc6IHNwYWNpbmcsXHJcbiAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgIGNoaWxkcmVuOiBbIHJheUJ1dHRvbiwgd2F2ZUJ1dHRvbiBdXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5iZW5kaW5nTGlnaHQucmVnaXN0ZXIoICdMYXNlclR5cGVBcXVhUmFkaW9CdXR0b25Hcm91cCcsIExhc2VyVHlwZUFxdWFSYWRpb0J1dHRvbkdyb3VwICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBMYXNlclR5cGVBcXVhUmFkaW9CdXR0b25Hcm91cDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDOUQsT0FBT0MsZUFBZSxNQUFNLHVDQUF1QztBQUNuRSxPQUFPQyxtQkFBbUIsTUFBTSw4QkFBOEI7QUFDOUQsT0FBT0MsWUFBWSxNQUFNLHVCQUF1QjtBQUVoRCxPQUFPQyxhQUFhLE1BQU0scUNBQXFDO0FBRy9ELE1BQU1DLGlCQUFpQixHQUFHSCxtQkFBbUIsQ0FBQ0csaUJBQWlCO0FBQy9ELE1BQU1DLGtCQUFrQixHQUFHSixtQkFBbUIsQ0FBQ0ksa0JBQWtCO0FBRWpFLE1BQU1DLDZCQUE2QixTQUFTUCxJQUFJLENBQUM7RUFFeENRLFdBQVdBLENBQUVDLGlCQUEwQyxFQUFHO0lBQy9ELE1BQU1DLGtCQUFrQixHQUFHO01BQ3pCQyxNQUFNLEVBQUUsQ0FBQztNQUNUQyxJQUFJLEVBQUUsSUFBSWQsUUFBUSxDQUFFLEVBQUc7SUFDekIsQ0FBQztJQUNELE1BQU1lLG9CQUFvQixHQUFLQyxJQUErQixJQUFNLElBQUlmLElBQUksQ0FBRWUsSUFBSSxFQUFFO01BQ2xGQyxRQUFRLEVBQUUsR0FBRztNQUFFO01BQ2ZILElBQUksRUFBRSxJQUFJZCxRQUFRLENBQUUsRUFBRztJQUN6QixDQUFFLENBQUM7SUFDSCxNQUFNa0IsU0FBUyxHQUFHLElBQUlmLGVBQWUsQ0FDbkNRLGlCQUFpQixFQUNqQkwsYUFBYSxDQUFDYSxHQUFHLEVBQ2pCSixvQkFBb0IsQ0FBRVIsaUJBQWtCLENBQUMsRUFDekNLLGtCQUNGLENBQUM7SUFDRCxNQUFNUSxVQUFVLEdBQUcsSUFBSWpCLGVBQWUsQ0FDcENRLGlCQUFpQixFQUNqQkwsYUFBYSxDQUFDZSxJQUFJLEVBQ2xCTixvQkFBb0IsQ0FBRVAsa0JBQW1CLENBQUMsRUFDMUNJLGtCQUNGLENBQUM7SUFDRCxNQUFNVSxPQUFPLEdBQUcsRUFBRTtJQUNsQixNQUFNQyxRQUFRLEdBQUdELE9BQU8sR0FBRyxDQUFDOztJQUU1QjtJQUNBLE1BQU1FLEtBQUssR0FBR04sU0FBUyxDQUFDTyxXQUFXLENBQUNELEtBQUssQ0FBRUosVUFBVSxDQUFDSyxXQUFZLENBQUM7SUFDbkVQLFNBQVMsQ0FBQ1EsU0FBUyxHQUFHRixLQUFLLENBQUNHLE9BQU8sQ0FBRUosUUFBUyxDQUFDO0lBQy9DSCxVQUFVLENBQUNNLFNBQVMsR0FBR0YsS0FBSyxDQUFDRyxPQUFPLENBQUVKLFFBQVMsQ0FBQztJQUNoRCxLQUFLLENBQUU7TUFDTEQsT0FBTyxFQUFFQSxPQUFPO01BQ2hCTSxLQUFLLEVBQUUsTUFBTTtNQUNiQyxRQUFRLEVBQUUsQ0FBRVgsU0FBUyxFQUFFRSxVQUFVO0lBQ25DLENBQUUsQ0FBQztFQUNMO0FBQ0Y7QUFFQWYsWUFBWSxDQUFDeUIsUUFBUSxDQUFFLCtCQUErQixFQUFFckIsNkJBQThCLENBQUM7QUFFdkYsZUFBZUEsNkJBQTZCIn0=