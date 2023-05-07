// Copyright 2018-2022, University of Colorado Boulder

/**
 * ScreenView for the Intro Screen of Energy Skate Park.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import EnergySkateParkTrackSetScreenView from '../../common/view/EnergySkateParkTrackSetScreenView.js';
import energySkatePark from '../../energySkatePark.js';
class IntroScreenView extends EnergySkateParkTrackSetScreenView {
  /**
   * @param {EnergySkateParkFullTrackSetModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    super(model, tandem, {
      controlPanelOptions: {
        showMassControls: true,
        gravityControlsOptions: {
          includeGravityNumberControl: false,
          includeGravitySlider: true
        },
        visibilityControlsOptions: {
          showStickToTrackCheckbox: true,
          showSkaterPathCheckbox: true
        }
      }
    });
  }
}
energySkatePark.register('IntroScreenView', IntroScreenView);
export default IntroScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbmVyZ3lTa2F0ZVBhcmtUcmFja1NldFNjcmVlblZpZXciLCJlbmVyZ3lTa2F0ZVBhcmsiLCJJbnRyb1NjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwidGFuZGVtIiwiY29udHJvbFBhbmVsT3B0aW9ucyIsInNob3dNYXNzQ29udHJvbHMiLCJncmF2aXR5Q29udHJvbHNPcHRpb25zIiwiaW5jbHVkZUdyYXZpdHlOdW1iZXJDb250cm9sIiwiaW5jbHVkZUdyYXZpdHlTbGlkZXIiLCJ2aXNpYmlsaXR5Q29udHJvbHNPcHRpb25zIiwic2hvd1N0aWNrVG9UcmFja0NoZWNrYm94Iiwic2hvd1NrYXRlclBhdGhDaGVja2JveCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSW50cm9TY3JlZW5WaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNjcmVlblZpZXcgZm9yIHRoZSBJbnRybyBTY3JlZW4gb2YgRW5lcmd5IFNrYXRlIFBhcmsuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbmVyZ3lTa2F0ZVBhcmtUcmFja1NldFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvRW5lcmd5U2thdGVQYXJrVHJhY2tTZXRTY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IGVuZXJneVNrYXRlUGFyayBmcm9tICcuLi8uLi9lbmVyZ3lTa2F0ZVBhcmsuanMnO1xyXG5cclxuY2xhc3MgSW50cm9TY3JlZW5WaWV3IGV4dGVuZHMgRW5lcmd5U2thdGVQYXJrVHJhY2tTZXRTY3JlZW5WaWV3IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtFbmVyZ3lTa2F0ZVBhcmtGdWxsVHJhY2tTZXRNb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCB0YW5kZW0gKSB7XHJcbiAgICBzdXBlciggbW9kZWwsIHRhbmRlbSwge1xyXG4gICAgICBjb250cm9sUGFuZWxPcHRpb25zOiB7XHJcbiAgICAgICAgc2hvd01hc3NDb250cm9sczogdHJ1ZSxcclxuICAgICAgICBncmF2aXR5Q29udHJvbHNPcHRpb25zOiB7XHJcbiAgICAgICAgICBpbmNsdWRlR3Jhdml0eU51bWJlckNvbnRyb2w6IGZhbHNlLFxyXG4gICAgICAgICAgaW5jbHVkZUdyYXZpdHlTbGlkZXI6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHZpc2liaWxpdHlDb250cm9sc09wdGlvbnM6IHtcclxuICAgICAgICAgIHNob3dTdGlja1RvVHJhY2tDaGVja2JveDogdHJ1ZSxcclxuICAgICAgICAgIHNob3dTa2F0ZXJQYXRoQ2hlY2tib3g6IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmVuZXJneVNrYXRlUGFyay5yZWdpc3RlciggJ0ludHJvU2NyZWVuVmlldycsIEludHJvU2NyZWVuVmlldyApO1xyXG5leHBvcnQgZGVmYXVsdCBJbnRyb1NjcmVlblZpZXc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGlDQUFpQyxNQUFNLHdEQUF3RDtBQUN0RyxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBRXRELE1BQU1DLGVBQWUsU0FBU0YsaUNBQWlDLENBQUM7RUFFOUQ7QUFDRjtBQUNBO0FBQ0E7RUFDRUcsV0FBV0EsQ0FBRUMsS0FBSyxFQUFFQyxNQUFNLEVBQUc7SUFDM0IsS0FBSyxDQUFFRCxLQUFLLEVBQUVDLE1BQU0sRUFBRTtNQUNwQkMsbUJBQW1CLEVBQUU7UUFDbkJDLGdCQUFnQixFQUFFLElBQUk7UUFDdEJDLHNCQUFzQixFQUFFO1VBQ3RCQywyQkFBMkIsRUFBRSxLQUFLO1VBQ2xDQyxvQkFBb0IsRUFBRTtRQUN4QixDQUFDO1FBQ0RDLHlCQUF5QixFQUFFO1VBQ3pCQyx3QkFBd0IsRUFBRSxJQUFJO1VBQzlCQyxzQkFBc0IsRUFBRTtRQUMxQjtNQUNGO0lBQ0YsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBWixlQUFlLENBQUNhLFFBQVEsQ0FBRSxpQkFBaUIsRUFBRVosZUFBZ0IsQ0FBQztBQUM5RCxlQUFlQSxlQUFlIn0=