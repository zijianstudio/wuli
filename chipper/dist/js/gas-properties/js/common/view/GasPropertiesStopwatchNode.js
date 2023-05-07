// Copyright 2019-2022, University of Colorado Boulder

/**
 * GasPropertiesStopwatchNode is a specialization of StopwatchNode for this sim, a digital stopwatch.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

// modules
import Range from '../../../../dot/js/Range.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import gasProperties from '../../gasProperties.js';
import GasPropertiesStrings from '../../GasPropertiesStrings.js';
import GasPropertiesColors from '../GasPropertiesColors.js';
import GasPropertiesConstants from '../GasPropertiesConstants.js';
export default class GasPropertiesStopwatchNode extends StopwatchNode {
  constructor(stopwatch, providedOptions) {
    const options = optionize()({
      // StopwatchNodeOptions
      numberDisplayRange: new Range(0, GasPropertiesConstants.MAX_TIME),
      backgroundBaseColor: GasPropertiesColors.stopwatchBackgroundColorProperty,
      numberDisplayOptions: {
        numberFormatter: StopwatchNode.createRichTextNumberFormatter({
          showAsMinutesAndSeconds: false,
          numberOfDecimalPlaces: 1,
          units: GasPropertiesStrings.picosecondsStringProperty
        })
      },
      visiblePropertyOptions: {
        phetioReadOnly: true,
        phetioDocumentation: 'visibility is controlled by the model'
      }
    }, providedOptions);
    super(stopwatch, options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
gasProperties.register('GasPropertiesStopwatchNode', GasPropertiesStopwatchNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIm9wdGlvbml6ZSIsIlN0b3B3YXRjaE5vZGUiLCJnYXNQcm9wZXJ0aWVzIiwiR2FzUHJvcGVydGllc1N0cmluZ3MiLCJHYXNQcm9wZXJ0aWVzQ29sb3JzIiwiR2FzUHJvcGVydGllc0NvbnN0YW50cyIsIkdhc1Byb3BlcnRpZXNTdG9wd2F0Y2hOb2RlIiwiY29uc3RydWN0b3IiLCJzdG9wd2F0Y2giLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwibnVtYmVyRGlzcGxheVJhbmdlIiwiTUFYX1RJTUUiLCJiYWNrZ3JvdW5kQmFzZUNvbG9yIiwic3RvcHdhdGNoQmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJudW1iZXJEaXNwbGF5T3B0aW9ucyIsIm51bWJlckZvcm1hdHRlciIsImNyZWF0ZVJpY2hUZXh0TnVtYmVyRm9ybWF0dGVyIiwic2hvd0FzTWludXRlc0FuZFNlY29uZHMiLCJudW1iZXJPZkRlY2ltYWxQbGFjZXMiLCJ1bml0cyIsInBpY29zZWNvbmRzU3RyaW5nUHJvcGVydHkiLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR2FzUHJvcGVydGllc1N0b3B3YXRjaE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR2FzUHJvcGVydGllc1N0b3B3YXRjaE5vZGUgaXMgYSBzcGVjaWFsaXphdGlvbiBvZiBTdG9wd2F0Y2hOb2RlIGZvciB0aGlzIHNpbSwgYSBkaWdpdGFsIHN0b3B3YXRjaC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG4vLyBtb2R1bGVzXHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFN0b3B3YXRjaCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU3RvcHdhdGNoLmpzJztcclxuaW1wb3J0IFN0b3B3YXRjaE5vZGUsIHsgU3RvcHdhdGNoTm9kZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU3RvcHdhdGNoTm9kZS5qcyc7XHJcbmltcG9ydCBnYXNQcm9wZXJ0aWVzIGZyb20gJy4uLy4uL2dhc1Byb3BlcnRpZXMuanMnO1xyXG5pbXBvcnQgR2FzUHJvcGVydGllc1N0cmluZ3MgZnJvbSAnLi4vLi4vR2FzUHJvcGVydGllc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgR2FzUHJvcGVydGllc0NvbG9ycyBmcm9tICcuLi9HYXNQcm9wZXJ0aWVzQ29sb3JzLmpzJztcclxuaW1wb3J0IEdhc1Byb3BlcnRpZXNDb25zdGFudHMgZnJvbSAnLi4vR2FzUHJvcGVydGllc0NvbnN0YW50cy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgR2FzUHJvcGVydGllc1N0b3B3YXRjaE5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8U3RvcHdhdGNoTm9kZU9wdGlvbnMsICdkcmFnQm91bmRzUHJvcGVydHknIHwgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FzUHJvcGVydGllc1N0b3B3YXRjaE5vZGUgZXh0ZW5kcyBTdG9wd2F0Y2hOb2RlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzdG9wd2F0Y2g6IFN0b3B3YXRjaCwgcHJvdmlkZWRPcHRpb25zOiBHYXNQcm9wZXJ0aWVzU3RvcHdhdGNoTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxHYXNQcm9wZXJ0aWVzU3RvcHdhdGNoTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBTdG9wd2F0Y2hOb2RlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU3RvcHdhdGNoTm9kZU9wdGlvbnNcclxuICAgICAgbnVtYmVyRGlzcGxheVJhbmdlOiBuZXcgUmFuZ2UoIDAsIEdhc1Byb3BlcnRpZXNDb25zdGFudHMuTUFYX1RJTUUgKSxcclxuICAgICAgYmFja2dyb3VuZEJhc2VDb2xvcjogR2FzUHJvcGVydGllc0NvbG9ycy5zdG9wd2F0Y2hCYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSxcclxuICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcclxuICAgICAgICBudW1iZXJGb3JtYXR0ZXI6IFN0b3B3YXRjaE5vZGUuY3JlYXRlUmljaFRleHROdW1iZXJGb3JtYXR0ZXIoIHtcclxuICAgICAgICAgIHNob3dBc01pbnV0ZXNBbmRTZWNvbmRzOiBmYWxzZSxcclxuICAgICAgICAgIG51bWJlck9mRGVjaW1hbFBsYWNlczogMSxcclxuICAgICAgICAgIHVuaXRzOiBHYXNQcm9wZXJ0aWVzU3RyaW5ncy5waWNvc2Vjb25kc1N0cmluZ1Byb3BlcnR5XHJcbiAgICAgICAgfSApXHJcbiAgICAgIH0sXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHtcclxuICAgICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndmlzaWJpbGl0eSBpcyBjb250cm9sbGVkIGJ5IHRoZSBtb2RlbCdcclxuICAgICAgfVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIHN0b3B3YXRjaCwgb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmdhc1Byb3BlcnRpZXMucmVnaXN0ZXIoICdHYXNQcm9wZXJ0aWVzU3RvcHdhdGNoTm9kZScsIEdhc1Byb3BlcnRpZXNTdG9wd2F0Y2hOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsT0FBT0EsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxTQUFTLE1BQTRCLHVDQUF1QztBQUduRixPQUFPQyxhQUFhLE1BQWdDLDhDQUE4QztBQUNsRyxPQUFPQyxhQUFhLE1BQU0sd0JBQXdCO0FBQ2xELE9BQU9DLG9CQUFvQixNQUFNLCtCQUErQjtBQUNoRSxPQUFPQyxtQkFBbUIsTUFBTSwyQkFBMkI7QUFDM0QsT0FBT0Msc0JBQXNCLE1BQU0sOEJBQThCO0FBTWpFLGVBQWUsTUFBTUMsMEJBQTBCLFNBQVNMLGFBQWEsQ0FBQztFQUU3RE0sV0FBV0EsQ0FBRUMsU0FBb0IsRUFBRUMsZUFBa0QsRUFBRztJQUU3RixNQUFNQyxPQUFPLEdBQUdWLFNBQVMsQ0FBdUUsQ0FBQyxDQUFFO01BRWpHO01BQ0FXLGtCQUFrQixFQUFFLElBQUlaLEtBQUssQ0FBRSxDQUFDLEVBQUVNLHNCQUFzQixDQUFDTyxRQUFTLENBQUM7TUFDbkVDLG1CQUFtQixFQUFFVCxtQkFBbUIsQ0FBQ1UsZ0NBQWdDO01BQ3pFQyxvQkFBb0IsRUFBRTtRQUNwQkMsZUFBZSxFQUFFZixhQUFhLENBQUNnQiw2QkFBNkIsQ0FBRTtVQUM1REMsdUJBQXVCLEVBQUUsS0FBSztVQUM5QkMscUJBQXFCLEVBQUUsQ0FBQztVQUN4QkMsS0FBSyxFQUFFakIsb0JBQW9CLENBQUNrQjtRQUM5QixDQUFFO01BQ0osQ0FBQztNQUNEQyxzQkFBc0IsRUFBRTtRQUN0QkMsY0FBYyxFQUFFLElBQUk7UUFDcEJDLG1CQUFtQixFQUFFO01BQ3ZCO0lBQ0YsQ0FBQyxFQUFFZixlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FBRUQsU0FBUyxFQUFFRSxPQUFRLENBQUM7RUFDN0I7RUFFZ0JlLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBdkIsYUFBYSxDQUFDeUIsUUFBUSxDQUFFLDRCQUE0QixFQUFFckIsMEJBQTJCLENBQUMifQ==