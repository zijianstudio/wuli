// Copyright 2019-2022, University of Colorado Boulder

/**
 * CancelMutationButton is the button that appears in the 'Mutation Coming' alert, used to cancel a mutation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import { Path } from '../../../../scenery/js/imports.js';
import timesCircleRegularShape from '../../../../sherpa/js/fontawesome-5/timesCircleRegularShape.js';
import RoundPushButton from '../../../../sun/js/buttons/RoundPushButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import naturalSelection from '../../naturalSelection.js';
export default class CancelMutationButton extends RoundPushButton {
  constructor(providedOptions) {
    // red 'x' inside a circle
    const content = new Path(timesCircleRegularShape, {
      fill: PhetColorScheme.RED_COLORBLIND,
      scale: 0.035,
      cursor: 'pointer'
    });
    const options = optionize()({
      // RoundPushButtonOptions
      content: content,
      xMargin: 0,
      yMargin: 0,
      baseColor: 'transparent',
      // so we see only the icon
      touchAreaDilation: 8,
      mouseAreaDilation: 4,
      tandem: Tandem.OPTIONAL // because we don't want to instrument this button
    }, providedOptions);
    super(options);
  }
}
naturalSelection.register('CancelMutationButton', CancelMutationButton);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJQaGV0Q29sb3JTY2hlbWUiLCJQYXRoIiwidGltZXNDaXJjbGVSZWd1bGFyU2hhcGUiLCJSb3VuZFB1c2hCdXR0b24iLCJUYW5kZW0iLCJuYXR1cmFsU2VsZWN0aW9uIiwiQ2FuY2VsTXV0YXRpb25CdXR0b24iLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsImNvbnRlbnQiLCJmaWxsIiwiUkVEX0NPTE9SQkxJTkQiLCJzY2FsZSIsImN1cnNvciIsIm9wdGlvbnMiLCJ4TWFyZ2luIiwieU1hcmdpbiIsImJhc2VDb2xvciIsInRvdWNoQXJlYURpbGF0aW9uIiwibW91c2VBcmVhRGlsYXRpb24iLCJ0YW5kZW0iLCJPUFRJT05BTCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2FuY2VsTXV0YXRpb25CdXR0b24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ2FuY2VsTXV0YXRpb25CdXR0b24gaXMgdGhlIGJ1dHRvbiB0aGF0IGFwcGVhcnMgaW4gdGhlICdNdXRhdGlvbiBDb21pbmcnIGFsZXJ0LCB1c2VkIHRvIGNhbmNlbCBhIG11dGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgeyBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHRpbWVzQ2lyY2xlUmVndWxhclNoYXBlIGZyb20gJy4uLy4uLy4uLy4uL3NoZXJwYS9qcy9mb250YXdlc29tZS01L3RpbWVzQ2lyY2xlUmVndWxhclNoYXBlLmpzJztcclxuaW1wb3J0IFJvdW5kUHVzaEJ1dHRvbiwgeyBSb3VuZFB1c2hCdXR0b25PcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUm91bmRQdXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IG5hdHVyYWxTZWxlY3Rpb24gZnJvbSAnLi4vLi4vbmF0dXJhbFNlbGVjdGlvbi5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgQ2FuY2VsTXV0YXRpb25CdXR0b25PcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8Um91bmRQdXNoQnV0dG9uT3B0aW9ucywgJ2xpc3RlbmVyJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDYW5jZWxNdXRhdGlvbkJ1dHRvbiBleHRlbmRzIFJvdW5kUHVzaEJ1dHRvbiB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBDYW5jZWxNdXRhdGlvbkJ1dHRvbk9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gcmVkICd4JyBpbnNpZGUgYSBjaXJjbGVcclxuICAgIGNvbnN0IGNvbnRlbnQgPSBuZXcgUGF0aCggdGltZXNDaXJjbGVSZWd1bGFyU2hhcGUsIHtcclxuICAgICAgZmlsbDogUGhldENvbG9yU2NoZW1lLlJFRF9DT0xPUkJMSU5ELFxyXG4gICAgICBzY2FsZTogMC4wMzUsXHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDYW5jZWxNdXRhdGlvbkJ1dHRvbk9wdGlvbnMsIFNlbGZPcHRpb25zLCBSb3VuZFB1c2hCdXR0b25PcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBSb3VuZFB1c2hCdXR0b25PcHRpb25zXHJcbiAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXHJcbiAgICAgIHhNYXJnaW46IDAsXHJcbiAgICAgIHlNYXJnaW46IDAsXHJcbiAgICAgIGJhc2VDb2xvcjogJ3RyYW5zcGFyZW50JywgLy8gc28gd2Ugc2VlIG9ubHkgdGhlIGljb25cclxuICAgICAgdG91Y2hBcmVhRGlsYXRpb246IDgsXHJcbiAgICAgIG1vdXNlQXJlYURpbGF0aW9uOiA0LFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRJT05BTCAvLyBiZWNhdXNlIHdlIGRvbid0IHdhbnQgdG8gaW5zdHJ1bWVudCB0aGlzIGJ1dHRvblxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbm5hdHVyYWxTZWxlY3Rpb24ucmVnaXN0ZXIoICdDYW5jZWxNdXRhdGlvbkJ1dHRvbicsIENhbmNlbE11dGF0aW9uQnV0dG9uICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBNEIsdUNBQXVDO0FBRW5GLE9BQU9DLGVBQWUsTUFBTSxnREFBZ0Q7QUFDNUUsU0FBU0MsSUFBSSxRQUFRLG1DQUFtQztBQUN4RCxPQUFPQyx1QkFBdUIsTUFBTSxnRUFBZ0U7QUFDcEcsT0FBT0MsZUFBZSxNQUFrQywrQ0FBK0M7QUFDdkcsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFNeEQsZUFBZSxNQUFNQyxvQkFBb0IsU0FBU0gsZUFBZSxDQUFDO0VBRXpESSxXQUFXQSxDQUFFQyxlQUE0QyxFQUFHO0lBRWpFO0lBQ0EsTUFBTUMsT0FBTyxHQUFHLElBQUlSLElBQUksQ0FBRUMsdUJBQXVCLEVBQUU7TUFDakRRLElBQUksRUFBRVYsZUFBZSxDQUFDVyxjQUFjO01BQ3BDQyxLQUFLLEVBQUUsS0FBSztNQUNaQyxNQUFNLEVBQUU7SUFDVixDQUFFLENBQUM7SUFFSCxNQUFNQyxPQUFPLEdBQUdmLFNBQVMsQ0FBbUUsQ0FBQyxDQUFFO01BRTdGO01BQ0FVLE9BQU8sRUFBRUEsT0FBTztNQUNoQk0sT0FBTyxFQUFFLENBQUM7TUFDVkMsT0FBTyxFQUFFLENBQUM7TUFDVkMsU0FBUyxFQUFFLGFBQWE7TUFBRTtNQUMxQkMsaUJBQWlCLEVBQUUsQ0FBQztNQUNwQkMsaUJBQWlCLEVBQUUsQ0FBQztNQUNwQkMsTUFBTSxFQUFFaEIsTUFBTSxDQUFDaUIsUUFBUSxDQUFDO0lBQzFCLENBQUMsRUFBRWIsZUFBZ0IsQ0FBQztJQUVwQixLQUFLLENBQUVNLE9BQVEsQ0FBQztFQUNsQjtBQUNGO0FBRUFULGdCQUFnQixDQUFDaUIsUUFBUSxDQUFFLHNCQUFzQixFQUFFaEIsb0JBQXFCLENBQUMifQ==