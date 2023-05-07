// Copyright 2021-2023, University of Colorado Boulder

/**
 * FMWQueryParameters defines query parameters that are specific to this simulation.
 * Run with ?log to print these all query parameters and their values to the browser console at startup.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Utils from '../../../dot/js/Utils.js';
import logGlobal from '../../../phet-core/js/logGlobal.js';
import getGameLevelsSchema from '../../../vegas/js/getGameLevelsSchema.js';
import fourierMakingWaves from '../fourierMakingWaves.js';
import FMWConstants from './FMWConstants.js';
const FMWQueryParameters = QueryStringMachine.getAll({
  //------------------------------------------------------------------------------------------------------------------
  // Public-facing query parameters
  //------------------------------------------------------------------------------------------------------------------

  // The score (number of points) required to see the reward in the Wave Game screen.
  rewardScore: {
    public: true,
    type: 'number',
    defaultValue: 5,
    isValidValue: value => value > 0 && Number.isInteger(value)
  },
  // The levels to show in the Wave Game screen.
  gameLevels: getGameLevelsSchema(FMWConstants.NUMBER_OF_GAME_LEVELS),
  //------------------------------------------------------------------------------------------------------------------
  // Internal query parameters
  //------------------------------------------------------------------------------------------------------------------

  // Shows the reward after any correct answer, for testing the Wave Game reward.
  // For internal use only, not public facing.
  showReward: {
    type: 'flag'
  },
  // Seeds the game with a specific first challenge in level 5. This is useful for reproducing and testing specific
  // challenges. You must provide amplitude values for all 11 harmonics, including the zero values.
  // Example: answer5=0,0.5,0,1,0,0,0,0,0,0,0
  // For internal use only, not public facing.
  answer5: {
    type: 'array',
    isValidValue: array => array === null || array.length === FMWConstants.MAX_HARMONICS,
    elementSchema: {
      type: 'number',
      isValidValue: amplitude => amplitude >= -FMWConstants.MAX_AMPLITUDE && amplitude <= FMWConstants.MAX_AMPLITUDE && Utils.numberOfDecimalPlaces(amplitude) <= FMWConstants.WAVE_GAME_AMPLITUDE_DECIMAL_PLACES
    },
    defaultValue: null
  },
  // Shows the origin (as a red dot) and the drag bounds (as a red rectangle) for measurement tools.
  // For internal use only, not public facing.
  debugTools: {
    type: 'flag'
  },
  // Adds keyboard navigation support for AmplitudeNumberDisplay, the readouts above the amplitude sliders.
  // See https://github.com/phetsims/fourier-making-waves/issues/206
  focusableAmplitudeNumberDisplay: {
    type: 'flag'
  }
});
fourierMakingWaves.register('FMWQueryParameters', FMWQueryParameters);

// Log query parameters
logGlobal('phet.chipper.queryParameters');
logGlobal('phet.preloads.phetio.queryParameters');
logGlobal('phet.fourierMakingWaves.FMWQueryParameters');
export default FMWQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsImxvZ0dsb2JhbCIsImdldEdhbWVMZXZlbHNTY2hlbWEiLCJmb3VyaWVyTWFraW5nV2F2ZXMiLCJGTVdDb25zdGFudHMiLCJGTVdRdWVyeVBhcmFtZXRlcnMiLCJRdWVyeVN0cmluZ01hY2hpbmUiLCJnZXRBbGwiLCJyZXdhcmRTY29yZSIsInB1YmxpYyIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJpc1ZhbGlkVmFsdWUiLCJ2YWx1ZSIsIk51bWJlciIsImlzSW50ZWdlciIsImdhbWVMZXZlbHMiLCJOVU1CRVJfT0ZfR0FNRV9MRVZFTFMiLCJzaG93UmV3YXJkIiwiYW5zd2VyNSIsImFycmF5IiwibGVuZ3RoIiwiTUFYX0hBUk1PTklDUyIsImVsZW1lbnRTY2hlbWEiLCJhbXBsaXR1ZGUiLCJNQVhfQU1QTElUVURFIiwibnVtYmVyT2ZEZWNpbWFsUGxhY2VzIiwiV0FWRV9HQU1FX0FNUExJVFVERV9ERUNJTUFMX1BMQUNFUyIsImRlYnVnVG9vbHMiLCJmb2N1c2FibGVBbXBsaXR1ZGVOdW1iZXJEaXNwbGF5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGTVdRdWVyeVBhcmFtZXRlcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRk1XUXVlcnlQYXJhbWV0ZXJzIGRlZmluZXMgcXVlcnkgcGFyYW1ldGVycyB0aGF0IGFyZSBzcGVjaWZpYyB0byB0aGlzIHNpbXVsYXRpb24uXHJcbiAqIFJ1biB3aXRoID9sb2cgdG8gcHJpbnQgdGhlc2UgYWxsIHF1ZXJ5IHBhcmFtZXRlcnMgYW5kIHRoZWlyIHZhbHVlcyB0byB0aGUgYnJvd3NlciBjb25zb2xlIGF0IHN0YXJ0dXAuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBsb2dHbG9iYWwgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2xvZ0dsb2JhbC5qcyc7XHJcbmltcG9ydCBnZXRHYW1lTGV2ZWxzU2NoZW1hIGZyb20gJy4uLy4uLy4uL3ZlZ2FzL2pzL2dldEdhbWVMZXZlbHNTY2hlbWEuanMnO1xyXG5pbXBvcnQgZm91cmllck1ha2luZ1dhdmVzIGZyb20gJy4uL2ZvdXJpZXJNYWtpbmdXYXZlcy5qcyc7XHJcbmltcG9ydCBGTVdDb25zdGFudHMgZnJvbSAnLi9GTVdDb25zdGFudHMuanMnO1xyXG5cclxuY29uc3QgRk1XUXVlcnlQYXJhbWV0ZXJzID0gUXVlcnlTdHJpbmdNYWNoaW5lLmdldEFsbCgge1xyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIFB1YmxpYy1mYWNpbmcgcXVlcnkgcGFyYW1ldGVyc1xyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIC8vIFRoZSBzY29yZSAobnVtYmVyIG9mIHBvaW50cykgcmVxdWlyZWQgdG8gc2VlIHRoZSByZXdhcmQgaW4gdGhlIFdhdmUgR2FtZSBzY3JlZW4uXHJcbiAgcmV3YXJkU2NvcmU6IHtcclxuICAgIHB1YmxpYzogdHJ1ZSxcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiA1LFxyXG4gICAgaXNWYWxpZFZhbHVlOiAoIHZhbHVlOiBudW1iZXIgKSA9PiAoIHZhbHVlID4gMCApICYmIE51bWJlci5pc0ludGVnZXIoIHZhbHVlIClcclxuICB9LFxyXG5cclxuICAvLyBUaGUgbGV2ZWxzIHRvIHNob3cgaW4gdGhlIFdhdmUgR2FtZSBzY3JlZW4uXHJcbiAgZ2FtZUxldmVsczogZ2V0R2FtZUxldmVsc1NjaGVtYSggRk1XQ29uc3RhbnRzLk5VTUJFUl9PRl9HQU1FX0xFVkVMUyApLFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIEludGVybmFsIHF1ZXJ5IHBhcmFtZXRlcnNcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAvLyBTaG93cyB0aGUgcmV3YXJkIGFmdGVyIGFueSBjb3JyZWN0IGFuc3dlciwgZm9yIHRlc3RpbmcgdGhlIFdhdmUgR2FtZSByZXdhcmQuXHJcbiAgLy8gRm9yIGludGVybmFsIHVzZSBvbmx5LCBub3QgcHVibGljIGZhY2luZy5cclxuICBzaG93UmV3YXJkOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAvLyBTZWVkcyB0aGUgZ2FtZSB3aXRoIGEgc3BlY2lmaWMgZmlyc3QgY2hhbGxlbmdlIGluIGxldmVsIDUuIFRoaXMgaXMgdXNlZnVsIGZvciByZXByb2R1Y2luZyBhbmQgdGVzdGluZyBzcGVjaWZpY1xyXG4gIC8vIGNoYWxsZW5nZXMuIFlvdSBtdXN0IHByb3ZpZGUgYW1wbGl0dWRlIHZhbHVlcyBmb3IgYWxsIDExIGhhcm1vbmljcywgaW5jbHVkaW5nIHRoZSB6ZXJvIHZhbHVlcy5cclxuICAvLyBFeGFtcGxlOiBhbnN3ZXI1PTAsMC41LDAsMSwwLDAsMCwwLDAsMCwwXHJcbiAgLy8gRm9yIGludGVybmFsIHVzZSBvbmx5LCBub3QgcHVibGljIGZhY2luZy5cclxuICBhbnN3ZXI1OiB7XHJcbiAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgaXNWYWxpZFZhbHVlOiAoIGFycmF5OiBudW1iZXJbXSApID0+ICggYXJyYXkgPT09IG51bGwgKSB8fCAoIGFycmF5Lmxlbmd0aCA9PT0gRk1XQ29uc3RhbnRzLk1BWF9IQVJNT05JQ1MgKSxcclxuICAgIGVsZW1lbnRTY2hlbWE6IHtcclxuICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgIGlzVmFsaWRWYWx1ZTogKCBhbXBsaXR1ZGU6IG51bWJlciApID0+XHJcbiAgICAgICAgKCBhbXBsaXR1ZGUgPj0gLUZNV0NvbnN0YW50cy5NQVhfQU1QTElUVURFICYmIGFtcGxpdHVkZSA8PSBGTVdDb25zdGFudHMuTUFYX0FNUExJVFVERSApICYmXHJcbiAgICAgICAgKCBVdGlscy5udW1iZXJPZkRlY2ltYWxQbGFjZXMoIGFtcGxpdHVkZSApIDw9IEZNV0NvbnN0YW50cy5XQVZFX0dBTUVfQU1QTElUVURFX0RFQ0lNQUxfUExBQ0VTIClcclxuICAgIH0sXHJcbiAgICBkZWZhdWx0VmFsdWU6IG51bGxcclxuICB9LFxyXG5cclxuICAvLyBTaG93cyB0aGUgb3JpZ2luIChhcyBhIHJlZCBkb3QpIGFuZCB0aGUgZHJhZyBib3VuZHMgKGFzIGEgcmVkIHJlY3RhbmdsZSkgZm9yIG1lYXN1cmVtZW50IHRvb2xzLlxyXG4gIC8vIEZvciBpbnRlcm5hbCB1c2Ugb25seSwgbm90IHB1YmxpYyBmYWNpbmcuXHJcbiAgZGVidWdUb29sczoge1xyXG4gICAgdHlwZTogJ2ZsYWcnXHJcbiAgfSxcclxuXHJcbiAgLy8gQWRkcyBrZXlib2FyZCBuYXZpZ2F0aW9uIHN1cHBvcnQgZm9yIEFtcGxpdHVkZU51bWJlckRpc3BsYXksIHRoZSByZWFkb3V0cyBhYm92ZSB0aGUgYW1wbGl0dWRlIHNsaWRlcnMuXHJcbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mb3VyaWVyLW1ha2luZy13YXZlcy9pc3N1ZXMvMjA2XHJcbiAgZm9jdXNhYmxlQW1wbGl0dWRlTnVtYmVyRGlzcGxheToge1xyXG4gICAgdHlwZTogJ2ZsYWcnXHJcbiAgfVxyXG59ICk7XHJcblxyXG5mb3VyaWVyTWFraW5nV2F2ZXMucmVnaXN0ZXIoICdGTVdRdWVyeVBhcmFtZXRlcnMnLCBGTVdRdWVyeVBhcmFtZXRlcnMgKTtcclxuXHJcbi8vIExvZyBxdWVyeSBwYXJhbWV0ZXJzXHJcbmxvZ0dsb2JhbCggJ3BoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMnICk7XHJcbmxvZ0dsb2JhbCggJ3BoZXQucHJlbG9hZHMucGhldGlvLnF1ZXJ5UGFyYW1ldGVycycgKTtcclxubG9nR2xvYmFsKCAncGhldC5mb3VyaWVyTWFraW5nV2F2ZXMuRk1XUXVlcnlQYXJhbWV0ZXJzJyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRk1XUXVlcnlQYXJhbWV0ZXJzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSwwQkFBMEI7QUFDNUMsT0FBT0MsU0FBUyxNQUFNLG9DQUFvQztBQUMxRCxPQUFPQyxtQkFBbUIsTUFBTSwwQ0FBMEM7QUFDMUUsT0FBT0Msa0JBQWtCLE1BQU0sMEJBQTBCO0FBQ3pELE9BQU9DLFlBQVksTUFBTSxtQkFBbUI7QUFFNUMsTUFBTUMsa0JBQWtCLEdBQUdDLGtCQUFrQixDQUFDQyxNQUFNLENBQUU7RUFFcEQ7RUFDQTtFQUNBOztFQUVBO0VBQ0FDLFdBQVcsRUFBRTtJQUNYQyxNQUFNLEVBQUUsSUFBSTtJQUNaQyxJQUFJLEVBQUUsUUFBUTtJQUNkQyxZQUFZLEVBQUUsQ0FBQztJQUNmQyxZQUFZLEVBQUlDLEtBQWEsSUFBUUEsS0FBSyxHQUFHLENBQUMsSUFBTUMsTUFBTSxDQUFDQyxTQUFTLENBQUVGLEtBQU07RUFDOUUsQ0FBQztFQUVEO0VBQ0FHLFVBQVUsRUFBRWQsbUJBQW1CLENBQUVFLFlBQVksQ0FBQ2EscUJBQXNCLENBQUM7RUFFckU7RUFDQTtFQUNBOztFQUVBO0VBQ0E7RUFDQUMsVUFBVSxFQUFFO0lBQUVSLElBQUksRUFBRTtFQUFPLENBQUM7RUFFNUI7RUFDQTtFQUNBO0VBQ0E7RUFDQVMsT0FBTyxFQUFFO0lBQ1BULElBQUksRUFBRSxPQUFPO0lBQ2JFLFlBQVksRUFBSVEsS0FBZSxJQUFRQSxLQUFLLEtBQUssSUFBSSxJQUFRQSxLQUFLLENBQUNDLE1BQU0sS0FBS2pCLFlBQVksQ0FBQ2tCLGFBQWU7SUFDMUdDLGFBQWEsRUFBRTtNQUNiYixJQUFJLEVBQUUsUUFBUTtNQUNkRSxZQUFZLEVBQUlZLFNBQWlCLElBQzdCQSxTQUFTLElBQUksQ0FBQ3BCLFlBQVksQ0FBQ3FCLGFBQWEsSUFBSUQsU0FBUyxJQUFJcEIsWUFBWSxDQUFDcUIsYUFBYSxJQUNuRnpCLEtBQUssQ0FBQzBCLHFCQUFxQixDQUFFRixTQUFVLENBQUMsSUFBSXBCLFlBQVksQ0FBQ3VCO0lBQy9ELENBQUM7SUFDRGhCLFlBQVksRUFBRTtFQUNoQixDQUFDO0VBRUQ7RUFDQTtFQUNBaUIsVUFBVSxFQUFFO0lBQ1ZsQixJQUFJLEVBQUU7RUFDUixDQUFDO0VBRUQ7RUFDQTtFQUNBbUIsK0JBQStCLEVBQUU7SUFDL0JuQixJQUFJLEVBQUU7RUFDUjtBQUNGLENBQUUsQ0FBQztBQUVIUCxrQkFBa0IsQ0FBQzJCLFFBQVEsQ0FBRSxvQkFBb0IsRUFBRXpCLGtCQUFtQixDQUFDOztBQUV2RTtBQUNBSixTQUFTLENBQUUsOEJBQStCLENBQUM7QUFDM0NBLFNBQVMsQ0FBRSxzQ0FBdUMsQ0FBQztBQUNuREEsU0FBUyxDQUFFLDRDQUE2QyxDQUFDO0FBRXpELGVBQWVJLGtCQUFrQiJ9