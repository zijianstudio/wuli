// Copyright 2018-2023, University of Colorado Boulder

/**
 * A model for Energy Skate Park that can have tracks that are draggable and attachable. Doesn't have a set of
 * premade tracks, but allows user to build them from scratch from a set of short tracks each with a few draggable
 * control points.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import EnergySkateParkModel from '../../common/model/EnergySkateParkModel.js';
import Track from '../../common/model/Track.js';
import energySkatePark from '../../energySkatePark.js';
class EnergySkateParkPlaygroundModel extends EnergySkateParkModel {
  /**
   * @param {EnergySkateParkPreferencesModel} preferencesModel
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(preferencesModel, tandem, options) {
    if (options) {
      assert && assert(options.tracksDraggable === undefined, 'for playground models, tracks are draggable');
      assert && assert(options.tracksConfigurable === undefined, 'for playground models, track control points can be dragged');
    }
    options = merge({
      tracksDraggable: true,
      tracksConfigurable: true
    }, options);
    super(preferencesModel, tandem, options);
  }

  /**
   * Create a new fully interactive Track which can be used to create custom Tracks. Generally  used when
   * user drags a new Track from  the toolbox.
   * @public
   *
   * @param {Object} [options] - options passed along to the Track
   * @returns {Track}
   */
  createDraggableTrack(options) {
    options = merge({
      // options passed along to ControlPoints of this Track
      controlPointOptions: null,
      // options passed along to the Track
      trackOptions: null
    }, options);
    const controlPoints = [this.controlPointGroup.createNextElement(-1, 0, options.controlPointOptions), this.controlPointGroup.createNextElement(0, 0, options.controlPointOptions), this.controlPointGroup.createNextElement(1, 0, options.controlPointOptions)];
    return this.trackGroup.createNextElement(controlPoints, [], merge({}, Track.FULLY_INTERACTIVE_OPTIONS, options.trackOptions));
  }

  /**
   * Clear all tracks from the model.
   * @public
   */
  clearTracks() {
    this.tracks.clear();
    this.trackGroup.clear();
    this.controlPointGroup.clear();

    // If the skater was on a track, then he should fall off, see #97
    if (this.skater.trackProperty.value) {
      this.skater.trackProperty.value = null;
    }
  }

  /**
   * Reset the model.
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.clearTracks();
  }
}
energySkatePark.register('EnergySkateParkPlaygroundModel', EnergySkateParkPlaygroundModel);
export default EnergySkateParkPlaygroundModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkVuZXJneVNrYXRlUGFya01vZGVsIiwiVHJhY2siLCJlbmVyZ3lTa2F0ZVBhcmsiLCJFbmVyZ3lTa2F0ZVBhcmtQbGF5Z3JvdW5kTW9kZWwiLCJjb25zdHJ1Y3RvciIsInByZWZlcmVuY2VzTW9kZWwiLCJ0YW5kZW0iLCJvcHRpb25zIiwiYXNzZXJ0IiwidHJhY2tzRHJhZ2dhYmxlIiwidW5kZWZpbmVkIiwidHJhY2tzQ29uZmlndXJhYmxlIiwiY3JlYXRlRHJhZ2dhYmxlVHJhY2siLCJjb250cm9sUG9pbnRPcHRpb25zIiwidHJhY2tPcHRpb25zIiwiY29udHJvbFBvaW50cyIsImNvbnRyb2xQb2ludEdyb3VwIiwiY3JlYXRlTmV4dEVsZW1lbnQiLCJ0cmFja0dyb3VwIiwiRlVMTFlfSU5URVJBQ1RJVkVfT1BUSU9OUyIsImNsZWFyVHJhY2tzIiwidHJhY2tzIiwiY2xlYXIiLCJza2F0ZXIiLCJ0cmFja1Byb3BlcnR5IiwidmFsdWUiLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRW5lcmd5U2thdGVQYXJrUGxheWdyb3VuZE1vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgbW9kZWwgZm9yIEVuZXJneSBTa2F0ZSBQYXJrIHRoYXQgY2FuIGhhdmUgdHJhY2tzIHRoYXQgYXJlIGRyYWdnYWJsZSBhbmQgYXR0YWNoYWJsZS4gRG9lc24ndCBoYXZlIGEgc2V0IG9mXHJcbiAqIHByZW1hZGUgdHJhY2tzLCBidXQgYWxsb3dzIHVzZXIgdG8gYnVpbGQgdGhlbSBmcm9tIHNjcmF0Y2ggZnJvbSBhIHNldCBvZiBzaG9ydCB0cmFja3MgZWFjaCB3aXRoIGEgZmV3IGRyYWdnYWJsZVxyXG4gKiBjb250cm9sIHBvaW50cy5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBFbmVyZ3lTa2F0ZVBhcmtNb2RlbCBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRW5lcmd5U2thdGVQYXJrTW9kZWwuanMnO1xyXG5pbXBvcnQgVHJhY2sgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1RyYWNrLmpzJztcclxuaW1wb3J0IGVuZXJneVNrYXRlUGFyayBmcm9tICcuLi8uLi9lbmVyZ3lTa2F0ZVBhcmsuanMnO1xyXG5cclxuY2xhc3MgRW5lcmd5U2thdGVQYXJrUGxheWdyb3VuZE1vZGVsIGV4dGVuZHMgRW5lcmd5U2thdGVQYXJrTW9kZWwge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0VuZXJneVNrYXRlUGFya1ByZWZlcmVuY2VzTW9kZWx9IHByZWZlcmVuY2VzTW9kZWxcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBwcmVmZXJlbmNlc01vZGVsLCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcbiAgICBpZiAoIG9wdGlvbnMgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMudHJhY2tzRHJhZ2dhYmxlID09PSB1bmRlZmluZWQsICdmb3IgcGxheWdyb3VuZCBtb2RlbHMsIHRyYWNrcyBhcmUgZHJhZ2dhYmxlJyApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnRyYWNrc0NvbmZpZ3VyYWJsZSA9PT0gdW5kZWZpbmVkLCAnZm9yIHBsYXlncm91bmQgbW9kZWxzLCB0cmFjayBjb250cm9sIHBvaW50cyBjYW4gYmUgZHJhZ2dlZCcgKTtcclxuICAgIH1cclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgdHJhY2tzRHJhZ2dhYmxlOiB0cnVlLFxyXG4gICAgICB0cmFja3NDb25maWd1cmFibGU6IHRydWVcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggcHJlZmVyZW5jZXNNb2RlbCwgdGFuZGVtLCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYSBuZXcgZnVsbHkgaW50ZXJhY3RpdmUgVHJhY2sgd2hpY2ggY2FuIGJlIHVzZWQgdG8gY3JlYXRlIGN1c3RvbSBUcmFja3MuIEdlbmVyYWxseSAgdXNlZCB3aGVuXHJcbiAgICogdXNlciBkcmFncyBhIG5ldyBUcmFjayBmcm9tICB0aGUgdG9vbGJveC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gb3B0aW9ucyBwYXNzZWQgYWxvbmcgdG8gdGhlIFRyYWNrXHJcbiAgICogQHJldHVybnMge1RyYWNrfVxyXG4gICAqL1xyXG4gIGNyZWF0ZURyYWdnYWJsZVRyYWNrKCBvcHRpb25zICkge1xyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBvcHRpb25zIHBhc3NlZCBhbG9uZyB0byBDb250cm9sUG9pbnRzIG9mIHRoaXMgVHJhY2tcclxuICAgICAgY29udHJvbFBvaW50T3B0aW9uczogbnVsbCxcclxuXHJcbiAgICAgIC8vIG9wdGlvbnMgcGFzc2VkIGFsb25nIHRvIHRoZSBUcmFja1xyXG4gICAgICB0cmFja09wdGlvbnM6IG51bGxcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBjb250cm9sUG9pbnRzID0gW1xyXG4gICAgICB0aGlzLmNvbnRyb2xQb2ludEdyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCAtMSwgMCwgb3B0aW9ucy5jb250cm9sUG9pbnRPcHRpb25zICksXHJcbiAgICAgIHRoaXMuY29udHJvbFBvaW50R3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoIDAsIDAsIG9wdGlvbnMuY29udHJvbFBvaW50T3B0aW9ucyApLFxyXG4gICAgICB0aGlzLmNvbnRyb2xQb2ludEdyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCAxLCAwLCBvcHRpb25zLmNvbnRyb2xQb2ludE9wdGlvbnMgKVxyXG4gICAgXTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy50cmFja0dyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCBjb250cm9sUG9pbnRzLCBbXSwgbWVyZ2UoXHJcbiAgICAgICAge30sXHJcbiAgICAgICAgVHJhY2suRlVMTFlfSU5URVJBQ1RJVkVfT1BUSU9OUyxcclxuICAgICAgICBvcHRpb25zLnRyYWNrT3B0aW9uc1xyXG4gICAgICApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYXIgYWxsIHRyYWNrcyBmcm9tIHRoZSBtb2RlbC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY2xlYXJUcmFja3MoKSB7XHJcblxyXG4gICAgdGhpcy50cmFja3MuY2xlYXIoKTtcclxuICAgIHRoaXMudHJhY2tHcm91cC5jbGVhcigpO1xyXG4gICAgdGhpcy5jb250cm9sUG9pbnRHcm91cC5jbGVhcigpO1xyXG5cclxuICAgIC8vIElmIHRoZSBza2F0ZXIgd2FzIG9uIGEgdHJhY2ssIHRoZW4gaGUgc2hvdWxkIGZhbGwgb2ZmLCBzZWUgIzk3XHJcbiAgICBpZiAoIHRoaXMuc2thdGVyLnRyYWNrUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHRoaXMuc2thdGVyLnRyYWNrUHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgdGhlIG1vZGVsLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcbiAgICB0aGlzLmNsZWFyVHJhY2tzKCk7XHJcbiAgfVxyXG59XHJcblxyXG5lbmVyZ3lTa2F0ZVBhcmsucmVnaXN0ZXIoICdFbmVyZ3lTa2F0ZVBhcmtQbGF5Z3JvdW5kTW9kZWwnLCBFbmVyZ3lTa2F0ZVBhcmtQbGF5Z3JvdW5kTW9kZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgRW5lcmd5U2thdGVQYXJrUGxheWdyb3VuZE1vZGVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxvQkFBb0IsTUFBTSw0Q0FBNEM7QUFDN0UsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBRXRELE1BQU1DLDhCQUE4QixTQUFTSCxvQkFBb0IsQ0FBQztFQUVoRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VJLFdBQVdBLENBQUVDLGdCQUFnQixFQUFFQyxNQUFNLEVBQUVDLE9BQU8sRUFBRztJQUMvQyxJQUFLQSxPQUFPLEVBQUc7TUFDYkMsTUFBTSxJQUFJQSxNQUFNLENBQUVELE9BQU8sQ0FBQ0UsZUFBZSxLQUFLQyxTQUFTLEVBQUUsNkNBQThDLENBQUM7TUFDeEdGLE1BQU0sSUFBSUEsTUFBTSxDQUFFRCxPQUFPLENBQUNJLGtCQUFrQixLQUFLRCxTQUFTLEVBQUUsNERBQTZELENBQUM7SUFDNUg7SUFFQUgsT0FBTyxHQUFHUixLQUFLLENBQUU7TUFDZlUsZUFBZSxFQUFFLElBQUk7TUFDckJFLGtCQUFrQixFQUFFO0lBQ3RCLENBQUMsRUFBRUosT0FBUSxDQUFDO0lBRVosS0FBSyxDQUFFRixnQkFBZ0IsRUFBRUMsTUFBTSxFQUFFQyxPQUFRLENBQUM7RUFDNUM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSyxvQkFBb0JBLENBQUVMLE9BQU8sRUFBRztJQUM5QkEsT0FBTyxHQUFHUixLQUFLLENBQUU7TUFFZjtNQUNBYyxtQkFBbUIsRUFBRSxJQUFJO01BRXpCO01BQ0FDLFlBQVksRUFBRTtJQUNoQixDQUFDLEVBQUVQLE9BQVEsQ0FBQztJQUVaLE1BQU1RLGFBQWEsR0FBRyxDQUNwQixJQUFJLENBQUNDLGlCQUFpQixDQUFDQyxpQkFBaUIsQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUVWLE9BQU8sQ0FBQ00sbUJBQW9CLENBQUMsRUFDOUUsSUFBSSxDQUFDRyxpQkFBaUIsQ0FBQ0MsaUJBQWlCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRVYsT0FBTyxDQUFDTSxtQkFBb0IsQ0FBQyxFQUM3RSxJQUFJLENBQUNHLGlCQUFpQixDQUFDQyxpQkFBaUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFVixPQUFPLENBQUNNLG1CQUFvQixDQUFDLENBQzlFO0lBRUQsT0FBTyxJQUFJLENBQUNLLFVBQVUsQ0FBQ0QsaUJBQWlCLENBQUVGLGFBQWEsRUFBRSxFQUFFLEVBQUVoQixLQUFLLENBQzlELENBQUMsQ0FBQyxFQUNGRSxLQUFLLENBQUNrQix5QkFBeUIsRUFDL0JaLE9BQU8sQ0FBQ08sWUFDVixDQUNGLENBQUM7RUFDSDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFTSxXQUFXQSxDQUFBLEVBQUc7SUFFWixJQUFJLENBQUNDLE1BQU0sQ0FBQ0MsS0FBSyxDQUFDLENBQUM7SUFDbkIsSUFBSSxDQUFDSixVQUFVLENBQUNJLEtBQUssQ0FBQyxDQUFDO0lBQ3ZCLElBQUksQ0FBQ04saUJBQWlCLENBQUNNLEtBQUssQ0FBQyxDQUFDOztJQUU5QjtJQUNBLElBQUssSUFBSSxDQUFDQyxNQUFNLENBQUNDLGFBQWEsQ0FBQ0MsS0FBSyxFQUFHO01BQ3JDLElBQUksQ0FBQ0YsTUFBTSxDQUFDQyxhQUFhLENBQUNDLEtBQUssR0FBRyxJQUFJO0lBQ3hDO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxLQUFLQSxDQUFBLEVBQUc7SUFDTixLQUFLLENBQUNBLEtBQUssQ0FBQyxDQUFDO0lBQ2IsSUFBSSxDQUFDTixXQUFXLENBQUMsQ0FBQztFQUNwQjtBQUNGO0FBRUFsQixlQUFlLENBQUN5QixRQUFRLENBQUUsZ0NBQWdDLEVBQUV4Qiw4QkFBK0IsQ0FBQztBQUM1RixlQUFlQSw4QkFBOEIifQ==