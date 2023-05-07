// Copyright 2020-2022, University of Colorado Boulder

/**
 * A ZoomButtonGroup that shows magnifying glass icons on the buttons
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Dimension2 from '../../dot/js/Dimension2.js';
import MagnifyingGlassNode from './MagnifyingGlassNode.js';
import MinusNode from './MinusNode.js';
import PhetColorScheme from './PhetColorScheme.js';
import PlusNode from './PlusNode.js';
import sceneryPhet from './sceneryPhet.js';
import ZoomButtonGroup from './ZoomButtonGroup.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
export default class MagnifyingGlassZoomButtonGroup extends ZoomButtonGroup {
  /**
   * @param zoomLevelProperty - smaller value means more zoomed out
   * @param providedOptions
   */
  constructor(zoomLevelProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      magnifyingGlassNodeOptions: {
        glassRadius: 15 // like ZoomButton
      },

      // ZoomButtonGroupOptions
      buttonOptions: {
        baseColor: PhetColorScheme.BUTTON_YELLOW // like ZoomButton
      }
    }, providedOptions);
    const magnifyingGlassRadius = options.magnifyingGlassNodeOptions.glassRadius;

    // options for '+' and '-' signs
    const signOptions = {
      size: new Dimension2(1.3 * magnifyingGlassRadius, magnifyingGlassRadius / 3)
    };

    // magnifying glass with '+'
    const zoomInIcon = new MagnifyingGlassNode(combineOptions({
      icon: new PlusNode(signOptions)
    }, options.magnifyingGlassNodeOptions));

    // magnifying glass with '-'
    const zoomOutIcon = new MagnifyingGlassNode(combineOptions({
      icon: new MinusNode(signOptions)
    }, options.magnifyingGlassNodeOptions));
    super(zoomLevelProperty, zoomInIcon, zoomOutIcon, options);
  }
}
sceneryPhet.register('MagnifyingGlassZoomButtonGroup', MagnifyingGlassZoomButtonGroup);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiTWFnbmlmeWluZ0dsYXNzTm9kZSIsIk1pbnVzTm9kZSIsIlBoZXRDb2xvclNjaGVtZSIsIlBsdXNOb2RlIiwic2NlbmVyeVBoZXQiLCJab29tQnV0dG9uR3JvdXAiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIk1hZ25pZnlpbmdHbGFzc1pvb21CdXR0b25Hcm91cCIsImNvbnN0cnVjdG9yIiwiem9vbUxldmVsUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwibWFnbmlmeWluZ0dsYXNzTm9kZU9wdGlvbnMiLCJnbGFzc1JhZGl1cyIsImJ1dHRvbk9wdGlvbnMiLCJiYXNlQ29sb3IiLCJCVVRUT05fWUVMTE9XIiwibWFnbmlmeWluZ0dsYXNzUmFkaXVzIiwic2lnbk9wdGlvbnMiLCJzaXplIiwiem9vbUluSWNvbiIsImljb24iLCJ6b29tT3V0SWNvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgWm9vbUJ1dHRvbkdyb3VwIHRoYXQgc2hvd3MgbWFnbmlmeWluZyBnbGFzcyBpY29ucyBvbiB0aGUgYnV0dG9uc1xyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBNYWduaWZ5aW5nR2xhc3NOb2RlLCB7IE1hZ25pZnlpbmdHbGFzc05vZGVPcHRpb25zIH0gZnJvbSAnLi9NYWduaWZ5aW5nR2xhc3NOb2RlLmpzJztcclxuaW1wb3J0IE1pbnVzTm9kZSBmcm9tICcuL01pbnVzTm9kZS5qcyc7XHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgUGx1c05vZGUgZnJvbSAnLi9QbHVzTm9kZS5qcyc7XHJcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcclxuaW1wb3J0IFpvb21CdXR0b25Hcm91cCwgeyBab29tQnV0dG9uR3JvdXBPcHRpb25zIH0gZnJvbSAnLi9ab29tQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG5cclxuICAvLyBvcHRpb25zIHByb3BhZ2F0ZWQgdG8gTWFnbmlmeWluZ0dsYXNzTm9kZVxyXG4gIG1hZ25pZnlpbmdHbGFzc05vZGVPcHRpb25zPzogU3RyaWN0T21pdDxNYWduaWZ5aW5nR2xhc3NOb2RlT3B0aW9ucywgJ2ljb24nPjtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIE1hZ25pZnlpbmdHbGFzc1pvb21CdXR0b25Hcm91cE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFpvb21CdXR0b25Hcm91cE9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYWduaWZ5aW5nR2xhc3Nab29tQnV0dG9uR3JvdXAgZXh0ZW5kcyBab29tQnV0dG9uR3JvdXAge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gem9vbUxldmVsUHJvcGVydHkgLSBzbWFsbGVyIHZhbHVlIG1lYW5zIG1vcmUgem9vbWVkIG91dFxyXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHpvb21MZXZlbFByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eSwgcHJvdmlkZWRPcHRpb25zPzogTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPE1hZ25pZnlpbmdHbGFzc1pvb21CdXR0b25Hcm91cE9wdGlvbnMsIFNlbGZPcHRpb25zLCBab29tQnV0dG9uR3JvdXBPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICBtYWduaWZ5aW5nR2xhc3NOb2RlT3B0aW9uczoge1xyXG4gICAgICAgIGdsYXNzUmFkaXVzOiAxNSAvLyBsaWtlIFpvb21CdXR0b25cclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIFpvb21CdXR0b25Hcm91cE9wdGlvbnNcclxuICAgICAgYnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIGJhc2VDb2xvcjogUGhldENvbG9yU2NoZW1lLkJVVFRPTl9ZRUxMT1cgLy8gbGlrZSBab29tQnV0dG9uXHJcbiAgICAgIH1cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IG1hZ25pZnlpbmdHbGFzc1JhZGl1cyA9IG9wdGlvbnMubWFnbmlmeWluZ0dsYXNzTm9kZU9wdGlvbnMuZ2xhc3NSYWRpdXMhO1xyXG5cclxuICAgIC8vIG9wdGlvbnMgZm9yICcrJyBhbmQgJy0nIHNpZ25zXHJcbiAgICBjb25zdCBzaWduT3B0aW9ucyA9IHtcclxuICAgICAgc2l6ZTogbmV3IERpbWVuc2lvbjIoIDEuMyAqIG1hZ25pZnlpbmdHbGFzc1JhZGl1cywgbWFnbmlmeWluZ0dsYXNzUmFkaXVzIC8gMyApXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIG1hZ25pZnlpbmcgZ2xhc3Mgd2l0aCAnKydcclxuICAgIGNvbnN0IHpvb21Jbkljb24gPSBuZXcgTWFnbmlmeWluZ0dsYXNzTm9kZSggY29tYmluZU9wdGlvbnM8TWFnbmlmeWluZ0dsYXNzTm9kZU9wdGlvbnM+KCB7XHJcbiAgICAgIGljb246IG5ldyBQbHVzTm9kZSggc2lnbk9wdGlvbnMgKVxyXG4gICAgfSwgb3B0aW9ucy5tYWduaWZ5aW5nR2xhc3NOb2RlT3B0aW9ucyApICk7XHJcblxyXG4gICAgLy8gbWFnbmlmeWluZyBnbGFzcyB3aXRoICctJ1xyXG4gICAgY29uc3Qgem9vbU91dEljb24gPSBuZXcgTWFnbmlmeWluZ0dsYXNzTm9kZSggY29tYmluZU9wdGlvbnM8TWFnbmlmeWluZ0dsYXNzTm9kZU9wdGlvbnM+KCB7XHJcbiAgICAgIGljb246IG5ldyBNaW51c05vZGUoIHNpZ25PcHRpb25zIClcclxuICAgIH0sIG9wdGlvbnMubWFnbmlmeWluZ0dsYXNzTm9kZU9wdGlvbnMgKSApO1xyXG5cclxuICAgIHN1cGVyKCB6b29tTGV2ZWxQcm9wZXJ0eSwgem9vbUluSWNvbiwgem9vbU91dEljb24sIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwJywgTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUlBLE9BQU9BLFVBQVUsTUFBTSw0QkFBNEI7QUFDbkQsT0FBT0MsbUJBQW1CLE1BQXNDLDBCQUEwQjtBQUMxRixPQUFPQyxTQUFTLE1BQU0sZ0JBQWdCO0FBQ3RDLE9BQU9DLGVBQWUsTUFBTSxzQkFBc0I7QUFDbEQsT0FBT0MsUUFBUSxNQUFNLGVBQWU7QUFDcEMsT0FBT0MsV0FBVyxNQUFNLGtCQUFrQjtBQUMxQyxPQUFPQyxlQUFlLE1BQWtDLHNCQUFzQjtBQUM5RSxPQUFPQyxTQUFTLElBQUlDLGNBQWMsUUFBUSxpQ0FBaUM7QUFVM0UsZUFBZSxNQUFNQyw4QkFBOEIsU0FBU0gsZUFBZSxDQUFDO0VBRTFFO0FBQ0Y7QUFDQTtBQUNBO0VBQ1NJLFdBQVdBLENBQUVDLGlCQUFpQyxFQUFFQyxlQUF1RCxFQUFHO0lBRS9HLE1BQU1DLE9BQU8sR0FBR04sU0FBUyxDQUE2RSxDQUFDLENBQUU7TUFFdkc7TUFDQU8sMEJBQTBCLEVBQUU7UUFDMUJDLFdBQVcsRUFBRSxFQUFFLENBQUM7TUFDbEIsQ0FBQzs7TUFFRDtNQUNBQyxhQUFhLEVBQUU7UUFDYkMsU0FBUyxFQUFFZCxlQUFlLENBQUNlLGFBQWEsQ0FBQztNQUMzQztJQUNGLENBQUMsRUFBRU4sZUFBZ0IsQ0FBQztJQUVwQixNQUFNTyxxQkFBcUIsR0FBR04sT0FBTyxDQUFDQywwQkFBMEIsQ0FBQ0MsV0FBWTs7SUFFN0U7SUFDQSxNQUFNSyxXQUFXLEdBQUc7TUFDbEJDLElBQUksRUFBRSxJQUFJckIsVUFBVSxDQUFFLEdBQUcsR0FBR21CLHFCQUFxQixFQUFFQSxxQkFBcUIsR0FBRyxDQUFFO0lBQy9FLENBQUM7O0lBRUQ7SUFDQSxNQUFNRyxVQUFVLEdBQUcsSUFBSXJCLG1CQUFtQixDQUFFTyxjQUFjLENBQThCO01BQ3RGZSxJQUFJLEVBQUUsSUFBSW5CLFFBQVEsQ0FBRWdCLFdBQVk7SUFDbEMsQ0FBQyxFQUFFUCxPQUFPLENBQUNDLDBCQUEyQixDQUFFLENBQUM7O0lBRXpDO0lBQ0EsTUFBTVUsV0FBVyxHQUFHLElBQUl2QixtQkFBbUIsQ0FBRU8sY0FBYyxDQUE4QjtNQUN2RmUsSUFBSSxFQUFFLElBQUlyQixTQUFTLENBQUVrQixXQUFZO0lBQ25DLENBQUMsRUFBRVAsT0FBTyxDQUFDQywwQkFBMkIsQ0FBRSxDQUFDO0lBRXpDLEtBQUssQ0FBRUgsaUJBQWlCLEVBQUVXLFVBQVUsRUFBRUUsV0FBVyxFQUFFWCxPQUFRLENBQUM7RUFDOUQ7QUFDRjtBQUVBUixXQUFXLENBQUNvQixRQUFRLENBQUUsZ0NBQWdDLEVBQUVoQiw4QkFBK0IsQ0FBQyJ9