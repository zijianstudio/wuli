// Copyright 2020-2022, University of Colorado Boulder

/**
 * NaturalSelectionTimeControlNode is the time control for this sim. It has a play/pause button and a fast-forward
 * button. To make the sim run faster, press and hold the fast-forward button.  It has nothing in common with PhET's
 * standard TimeControlNode other than a PlayPauseButton, so it does not extend TimeControlNode.
 * See https://github.com/phetsims/natural-selection/issues/179 for some design history.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import PlayPauseButton from '../../../../scenery-phet/js/buttons/PlayPauseButton.js';
import { HBox, SceneryConstants } from '../../../../scenery/js/imports.js';
import naturalSelection from '../../naturalSelection.js';
import FastForwardButton from './FastForwardButton.js';

// constants
const PLAY_BUTTON_RADIUS = 20;
const FAST_FORWARD_BUTTON_RADIUS = 16;
export default class NaturalSelectionTimeControlNode extends HBox {
  constructor(isPlayingProperty, timeSpeedProperty, providedOptions) {
    const options = optionize()({
      // HBoxOptions
      spacing: 10,
      disabledOpacity: SceneryConstants.DISABLED_OPACITY,
      phetioEnabledPropertyInstrumented: true // opt into default PhET-iO instrumented enabledProperty
    }, providedOptions);
    const playPauseButton = new PlayPauseButton(isPlayingProperty, {
      radius: PLAY_BUTTON_RADIUS,
      tandem: options.tandem.createTandem('playPauseButton')
    });
    const fastForwardButton = new FastForwardButton(timeSpeedProperty, {
      radius: FAST_FORWARD_BUTTON_RADIUS,
      touchAreaDilation: PLAY_BUTTON_RADIUS - FAST_FORWARD_BUTTON_RADIUS,
      tandem: options.tandem.createTandem('fastForwardButton')
    });
    options.children = [playPauseButton, fastForwardButton];
    super(options);

    // Save state of whether the sim is playing, so it can be restored when fast-forward is released.
    // This value does not need to be captured in the PhET-iO state because it is driven by the buttonModel.downProperty
    // which is not captured in the PhET-iO state, and hence will be overwritten on next down.
    let isPlayingSaved = isPlayingProperty.value;

    // unlink is not necessary.
    fastForwardButton.fastForwardButtonModel.downProperty.link(down => {
      playPauseButton.enabled = !down;
      if (down) {
        // Disable playPauseButton when fastForwardButton is pressed.
        playPauseButton.enabled = false;
        isPlayingSaved = isPlayingProperty.value;
        isPlayingProperty.value = true;
      } else {
        // Restore state of playPauseButton when fastForwardButton is released.
        playPauseButton.enabled = true;

        // But when playing back states, the ground truth is specified by the state and should not be overwritten by this listener
        if (!phet.joist.sim.isSettingPhetioStateProperty.value) {
          isPlayingProperty.value = isPlayingSaved;
        }
      }
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
naturalSelection.register('NaturalSelectionTimeControlNode', NaturalSelectionTimeControlNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJQbGF5UGF1c2VCdXR0b24iLCJIQm94IiwiU2NlbmVyeUNvbnN0YW50cyIsIm5hdHVyYWxTZWxlY3Rpb24iLCJGYXN0Rm9yd2FyZEJ1dHRvbiIsIlBMQVlfQlVUVE9OX1JBRElVUyIsIkZBU1RfRk9SV0FSRF9CVVRUT05fUkFESVVTIiwiTmF0dXJhbFNlbGVjdGlvblRpbWVDb250cm9sTm9kZSIsImNvbnN0cnVjdG9yIiwiaXNQbGF5aW5nUHJvcGVydHkiLCJ0aW1lU3BlZWRQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJzcGFjaW5nIiwiZGlzYWJsZWRPcGFjaXR5IiwiRElTQUJMRURfT1BBQ0lUWSIsInBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsInBsYXlQYXVzZUJ1dHRvbiIsInJhZGl1cyIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImZhc3RGb3J3YXJkQnV0dG9uIiwidG91Y2hBcmVhRGlsYXRpb24iLCJjaGlsZHJlbiIsImlzUGxheWluZ1NhdmVkIiwidmFsdWUiLCJmYXN0Rm9yd2FyZEJ1dHRvbk1vZGVsIiwiZG93blByb3BlcnR5IiwibGluayIsImRvd24iLCJlbmFibGVkIiwicGhldCIsImpvaXN0Iiwic2ltIiwiaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk5hdHVyYWxTZWxlY3Rpb25UaW1lQ29udHJvbE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTmF0dXJhbFNlbGVjdGlvblRpbWVDb250cm9sTm9kZSBpcyB0aGUgdGltZSBjb250cm9sIGZvciB0aGlzIHNpbS4gSXQgaGFzIGEgcGxheS9wYXVzZSBidXR0b24gYW5kIGEgZmFzdC1mb3J3YXJkXHJcbiAqIGJ1dHRvbi4gVG8gbWFrZSB0aGUgc2ltIHJ1biBmYXN0ZXIsIHByZXNzIGFuZCBob2xkIHRoZSBmYXN0LWZvcndhcmQgYnV0dG9uLiAgSXQgaGFzIG5vdGhpbmcgaW4gY29tbW9uIHdpdGggUGhFVCdzXHJcbiAqIHN0YW5kYXJkIFRpbWVDb250cm9sTm9kZSBvdGhlciB0aGFuIGEgUGxheVBhdXNlQnV0dG9uLCBzbyBpdCBkb2VzIG5vdCBleHRlbmQgVGltZUNvbnRyb2xOb2RlLlxyXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL25hdHVyYWwtc2VsZWN0aW9uL2lzc3Vlcy8xNzkgZm9yIHNvbWUgZGVzaWduIGhpc3RvcnkuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFBsYXlQYXVzZUJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9QbGF5UGF1c2VCdXR0b24uanMnO1xyXG5pbXBvcnQgVGltZVNwZWVkIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9UaW1lU3BlZWQuanMnO1xyXG5pbXBvcnQgeyBIQm94LCBIQm94T3B0aW9ucywgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucywgU2NlbmVyeUNvbnN0YW50cyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBuYXR1cmFsU2VsZWN0aW9uIGZyb20gJy4uLy4uL25hdHVyYWxTZWxlY3Rpb24uanMnO1xyXG5pbXBvcnQgRmFzdEZvcndhcmRCdXR0b24gZnJvbSAnLi9GYXN0Rm9yd2FyZEJ1dHRvbi5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgUExBWV9CVVRUT05fUkFESVVTID0gMjA7XHJcbmNvbnN0IEZBU1RfRk9SV0FSRF9CVVRUT05fUkFESVVTID0gMTY7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgTmF0dXJhbFNlbGVjdGlvblRpbWVDb250cm9sTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8SEJveE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5hdHVyYWxTZWxlY3Rpb25UaW1lQ29udHJvbE5vZGUgZXh0ZW5kcyBIQm94IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBpc1BsYXlpbmdQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sIHRpbWVTcGVlZFByb3BlcnR5OiBFbnVtZXJhdGlvblByb3BlcnR5PFRpbWVTcGVlZD4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IE5hdHVyYWxTZWxlY3Rpb25UaW1lQ29udHJvbE5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TmF0dXJhbFNlbGVjdGlvblRpbWVDb250cm9sTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBIQm94T3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gSEJveE9wdGlvbnNcclxuICAgICAgc3BhY2luZzogMTAsXHJcbiAgICAgIGRpc2FibGVkT3BhY2l0eTogU2NlbmVyeUNvbnN0YW50cy5ESVNBQkxFRF9PUEFDSVRZLFxyXG4gICAgICBwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQ6IHRydWUgLy8gb3B0IGludG8gZGVmYXVsdCBQaEVULWlPIGluc3RydW1lbnRlZCBlbmFibGVkUHJvcGVydHlcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHBsYXlQYXVzZUJ1dHRvbiA9IG5ldyBQbGF5UGF1c2VCdXR0b24oIGlzUGxheWluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIHJhZGl1czogUExBWV9CVVRUT05fUkFESVVTLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BsYXlQYXVzZUJ1dHRvbicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGZhc3RGb3J3YXJkQnV0dG9uID0gbmV3IEZhc3RGb3J3YXJkQnV0dG9uKCB0aW1lU3BlZWRQcm9wZXJ0eSwge1xyXG4gICAgICByYWRpdXM6IEZBU1RfRk9SV0FSRF9CVVRUT05fUkFESVVTLFxyXG4gICAgICB0b3VjaEFyZWFEaWxhdGlvbjogUExBWV9CVVRUT05fUkFESVVTIC0gRkFTVF9GT1JXQVJEX0JVVFRPTl9SQURJVVMsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZmFzdEZvcndhcmRCdXR0b24nIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBwbGF5UGF1c2VCdXR0b24sIGZhc3RGb3J3YXJkQnV0dG9uIF07XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBTYXZlIHN0YXRlIG9mIHdoZXRoZXIgdGhlIHNpbSBpcyBwbGF5aW5nLCBzbyBpdCBjYW4gYmUgcmVzdG9yZWQgd2hlbiBmYXN0LWZvcndhcmQgaXMgcmVsZWFzZWQuXHJcbiAgICAvLyBUaGlzIHZhbHVlIGRvZXMgbm90IG5lZWQgdG8gYmUgY2FwdHVyZWQgaW4gdGhlIFBoRVQtaU8gc3RhdGUgYmVjYXVzZSBpdCBpcyBkcml2ZW4gYnkgdGhlIGJ1dHRvbk1vZGVsLmRvd25Qcm9wZXJ0eVxyXG4gICAgLy8gd2hpY2ggaXMgbm90IGNhcHR1cmVkIGluIHRoZSBQaEVULWlPIHN0YXRlLCBhbmQgaGVuY2Ugd2lsbCBiZSBvdmVyd3JpdHRlbiBvbiBuZXh0IGRvd24uXHJcbiAgICBsZXQgaXNQbGF5aW5nU2F2ZWQgPSBpc1BsYXlpbmdQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAvLyB1bmxpbmsgaXMgbm90IG5lY2Vzc2FyeS5cclxuICAgIGZhc3RGb3J3YXJkQnV0dG9uLmZhc3RGb3J3YXJkQnV0dG9uTW9kZWwuZG93blByb3BlcnR5LmxpbmsoIGRvd24gPT4ge1xyXG4gICAgICBwbGF5UGF1c2VCdXR0b24uZW5hYmxlZCA9ICFkb3duO1xyXG4gICAgICBpZiAoIGRvd24gKSB7XHJcblxyXG4gICAgICAgIC8vIERpc2FibGUgcGxheVBhdXNlQnV0dG9uIHdoZW4gZmFzdEZvcndhcmRCdXR0b24gaXMgcHJlc3NlZC5cclxuICAgICAgICBwbGF5UGF1c2VCdXR0b24uZW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGlzUGxheWluZ1NhdmVkID0gaXNQbGF5aW5nUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgaXNQbGF5aW5nUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBSZXN0b3JlIHN0YXRlIG9mIHBsYXlQYXVzZUJ1dHRvbiB3aGVuIGZhc3RGb3J3YXJkQnV0dG9uIGlzIHJlbGVhc2VkLlxyXG4gICAgICAgIHBsYXlQYXVzZUJ1dHRvbi5lbmFibGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gQnV0IHdoZW4gcGxheWluZyBiYWNrIHN0YXRlcywgdGhlIGdyb3VuZCB0cnV0aCBpcyBzcGVjaWZpZWQgYnkgdGhlIHN0YXRlIGFuZCBzaG91bGQgbm90IGJlIG92ZXJ3cml0dGVuIGJ5IHRoaXMgbGlzdGVuZXJcclxuICAgICAgICBpZiAoICFwaGV0LmpvaXN0LnNpbS5pc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgICAgaXNQbGF5aW5nUHJvcGVydHkudmFsdWUgPSBpc1BsYXlpbmdTYXZlZDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5uYXR1cmFsU2VsZWN0aW9uLnJlZ2lzdGVyKCAnTmF0dXJhbFNlbGVjdGlvblRpbWVDb250cm9sTm9kZScsIE5hdHVyYWxTZWxlY3Rpb25UaW1lQ29udHJvbE5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBSUEsT0FBT0EsU0FBUyxNQUE0Qix1Q0FBdUM7QUFFbkYsT0FBT0MsZUFBZSxNQUFNLHdEQUF3RDtBQUVwRixTQUFTQyxJQUFJLEVBQXVDQyxnQkFBZ0IsUUFBUSxtQ0FBbUM7QUFDL0csT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLGlCQUFpQixNQUFNLHdCQUF3Qjs7QUFFdEQ7QUFDQSxNQUFNQyxrQkFBa0IsR0FBRyxFQUFFO0FBQzdCLE1BQU1DLDBCQUEwQixHQUFHLEVBQUU7QUFNckMsZUFBZSxNQUFNQywrQkFBK0IsU0FBU04sSUFBSSxDQUFDO0VBRXpETyxXQUFXQSxDQUFFQyxpQkFBb0MsRUFBRUMsaUJBQWlELEVBQ3ZGQyxlQUF1RCxFQUFHO0lBRTVFLE1BQU1DLE9BQU8sR0FBR2IsU0FBUyxDQUFtRSxDQUFDLENBQUU7TUFFN0Y7TUFDQWMsT0FBTyxFQUFFLEVBQUU7TUFDWEMsZUFBZSxFQUFFWixnQkFBZ0IsQ0FBQ2EsZ0JBQWdCO01BQ2xEQyxpQ0FBaUMsRUFBRSxJQUFJLENBQUM7SUFDMUMsQ0FBQyxFQUFFTCxlQUFnQixDQUFDO0lBRXBCLE1BQU1NLGVBQWUsR0FBRyxJQUFJakIsZUFBZSxDQUFFUyxpQkFBaUIsRUFBRTtNQUM5RFMsTUFBTSxFQUFFYixrQkFBa0I7TUFDMUJjLE1BQU0sRUFBRVAsT0FBTyxDQUFDTyxNQUFNLENBQUNDLFlBQVksQ0FBRSxpQkFBa0I7SUFDekQsQ0FBRSxDQUFDO0lBRUgsTUFBTUMsaUJBQWlCLEdBQUcsSUFBSWpCLGlCQUFpQixDQUFFTSxpQkFBaUIsRUFBRTtNQUNsRVEsTUFBTSxFQUFFWiwwQkFBMEI7TUFDbENnQixpQkFBaUIsRUFBRWpCLGtCQUFrQixHQUFHQywwQkFBMEI7TUFDbEVhLE1BQU0sRUFBRVAsT0FBTyxDQUFDTyxNQUFNLENBQUNDLFlBQVksQ0FBRSxtQkFBb0I7SUFDM0QsQ0FBRSxDQUFDO0lBRUhSLE9BQU8sQ0FBQ1csUUFBUSxHQUFHLENBQUVOLGVBQWUsRUFBRUksaUJBQWlCLENBQUU7SUFFekQsS0FBSyxDQUFFVCxPQUFRLENBQUM7O0lBRWhCO0lBQ0E7SUFDQTtJQUNBLElBQUlZLGNBQWMsR0FBR2YsaUJBQWlCLENBQUNnQixLQUFLOztJQUU1QztJQUNBSixpQkFBaUIsQ0FBQ0ssc0JBQXNCLENBQUNDLFlBQVksQ0FBQ0MsSUFBSSxDQUFFQyxJQUFJLElBQUk7TUFDbEVaLGVBQWUsQ0FBQ2EsT0FBTyxHQUFHLENBQUNELElBQUk7TUFDL0IsSUFBS0EsSUFBSSxFQUFHO1FBRVY7UUFDQVosZUFBZSxDQUFDYSxPQUFPLEdBQUcsS0FBSztRQUMvQk4sY0FBYyxHQUFHZixpQkFBaUIsQ0FBQ2dCLEtBQUs7UUFDeENoQixpQkFBaUIsQ0FBQ2dCLEtBQUssR0FBRyxJQUFJO01BQ2hDLENBQUMsTUFDSTtRQUVIO1FBQ0FSLGVBQWUsQ0FBQ2EsT0FBTyxHQUFHLElBQUk7O1FBRTlCO1FBQ0EsSUFBSyxDQUFDQyxJQUFJLENBQUNDLEtBQUssQ0FBQ0MsR0FBRyxDQUFDQyw0QkFBNEIsQ0FBQ1QsS0FBSyxFQUFHO1VBQ3hEaEIsaUJBQWlCLENBQUNnQixLQUFLLEdBQUdELGNBQWM7UUFDMUM7TUFDRjtJQUNGLENBQUUsQ0FBQztFQUNMO0VBRWdCVyxPQUFPQSxDQUFBLEVBQVM7SUFDOUJDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLEtBQUssRUFBRSw4REFBK0QsQ0FBQztJQUN6RixLQUFLLENBQUNELE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQWhDLGdCQUFnQixDQUFDa0MsUUFBUSxDQUFFLGlDQUFpQyxFQUFFOUIsK0JBQWdDLENBQUMifQ==