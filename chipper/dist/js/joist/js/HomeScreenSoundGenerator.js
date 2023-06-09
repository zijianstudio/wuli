// Copyright 2020-2022, University of Colorado Boulder

/**
 * HomeScreenSoundGenerator is responsible for generating sounds that are associated with the home screen, such as the
 * sound for switching between screen icons and the sound for returning to the home screen from a sim screen.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import MultiClip from '../../tambo/js/sound-generators/MultiClip.js';
import screenSelectionHomeV3_mp3 from '../sounds/screenSelectionHomeV3_mp3.js';
import switchingScreenSelectorIcons003_mp3 from '../sounds/switchingScreenSelectorIcons003_mp3.js';
import joist from './joist.js';
import Enumeration from '../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../phet-core/js/EnumerationValue.js';
class SoundType extends EnumerationValue {
  static HOME_SCREEN_SELECTED = new SoundType();
  static DIFFERENT_ICON_SELECTED = new SoundType();
  static enumeration = new Enumeration(SoundType);
}
class HomeScreenSoundGenerator extends MultiClip {
  constructor(homeScreenModel, providedOptions) {
    // create the map of home screen actions to sounds
    const valuesToSoundsMap = new Map([[SoundType.HOME_SCREEN_SELECTED, screenSelectionHomeV3_mp3], [SoundType.DIFFERENT_ICON_SELECTED, switchingScreenSelectorIcons003_mp3]]);
    super(valuesToSoundsMap, providedOptions);
    homeScreenModel.screenProperty.lazyLink(screen => {
      if (screen.model === homeScreenModel) {
        this.playAssociatedSound(SoundType.HOME_SCREEN_SELECTED);
      }
    });

    // play the sound when the user selects a different icon on the home screen
    homeScreenModel.selectedScreenProperty.lazyLink(() => {
      if (homeScreenModel.screenProperty.value.model === homeScreenModel) {
        this.playAssociatedSound(SoundType.DIFFERENT_ICON_SELECTED);
      }
    });
  }
}
joist.register('HomeScreenSoundGenerator', HomeScreenSoundGenerator);
export default HomeScreenSoundGenerator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aUNsaXAiLCJzY3JlZW5TZWxlY3Rpb25Ib21lVjNfbXAzIiwic3dpdGNoaW5nU2NyZWVuU2VsZWN0b3JJY29uczAwM19tcDMiLCJqb2lzdCIsIkVudW1lcmF0aW9uIiwiRW51bWVyYXRpb25WYWx1ZSIsIlNvdW5kVHlwZSIsIkhPTUVfU0NSRUVOX1NFTEVDVEVEIiwiRElGRkVSRU5UX0lDT05fU0VMRUNURUQiLCJlbnVtZXJhdGlvbiIsIkhvbWVTY3JlZW5Tb3VuZEdlbmVyYXRvciIsImNvbnN0cnVjdG9yIiwiaG9tZVNjcmVlbk1vZGVsIiwicHJvdmlkZWRPcHRpb25zIiwidmFsdWVzVG9Tb3VuZHNNYXAiLCJNYXAiLCJzY3JlZW5Qcm9wZXJ0eSIsImxhenlMaW5rIiwic2NyZWVuIiwibW9kZWwiLCJwbGF5QXNzb2NpYXRlZFNvdW5kIiwic2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eSIsInZhbHVlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJIb21lU2NyZWVuU291bmRHZW5lcmF0b3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSG9tZVNjcmVlblNvdW5kR2VuZXJhdG9yIGlzIHJlc3BvbnNpYmxlIGZvciBnZW5lcmF0aW5nIHNvdW5kcyB0aGF0IGFyZSBhc3NvY2lhdGVkIHdpdGggdGhlIGhvbWUgc2NyZWVuLCBzdWNoIGFzIHRoZVxyXG4gKiBzb3VuZCBmb3Igc3dpdGNoaW5nIGJldHdlZW4gc2NyZWVuIGljb25zIGFuZCB0aGUgc291bmQgZm9yIHJldHVybmluZyB0byB0aGUgaG9tZSBzY3JlZW4gZnJvbSBhIHNpbSBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IE11bHRpQ2xpcCwgeyBNdWx0aUNsaXBPcHRpb25zIH0gZnJvbSAnLi4vLi4vdGFtYm8vanMvc291bmQtZ2VuZXJhdG9ycy9NdWx0aUNsaXAuanMnO1xyXG5pbXBvcnQgc2NyZWVuU2VsZWN0aW9uSG9tZVYzX21wMyBmcm9tICcuLi9zb3VuZHMvc2NyZWVuU2VsZWN0aW9uSG9tZVYzX21wMy5qcyc7XHJcbmltcG9ydCBzd2l0Y2hpbmdTY3JlZW5TZWxlY3Rvckljb25zMDAzX21wMyBmcm9tICcuLi9zb3VuZHMvc3dpdGNoaW5nU2NyZWVuU2VsZWN0b3JJY29uczAwM19tcDMuanMnO1xyXG5pbXBvcnQgam9pc3QgZnJvbSAnLi9qb2lzdC5qcyc7XHJcbmltcG9ydCBIb21lU2NyZWVuTW9kZWwgZnJvbSAnLi9Ib21lU2NyZWVuTW9kZWwuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uVmFsdWUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uVmFsdWUuanMnO1xyXG5cclxuY2xhc3MgU291bmRUeXBlIGV4dGVuZHMgRW51bWVyYXRpb25WYWx1ZSB7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBIT01FX1NDUkVFTl9TRUxFQ1RFRCA9IG5ldyBTb3VuZFR5cGUoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IERJRkZFUkVOVF9JQ09OX1NFTEVDVEVEID0gbmV3IFNvdW5kVHlwZSgpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIFNvdW5kVHlwZSApO1xyXG59XHJcblxyXG5jbGFzcyBIb21lU2NyZWVuU291bmRHZW5lcmF0b3IgZXh0ZW5kcyBNdWx0aUNsaXA8U291bmRUeXBlPiB7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBob21lU2NyZWVuTW9kZWw6IEhvbWVTY3JlZW5Nb2RlbCwgcHJvdmlkZWRPcHRpb25zPzogTXVsdGlDbGlwT3B0aW9ucyApIHtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIG1hcCBvZiBob21lIHNjcmVlbiBhY3Rpb25zIHRvIHNvdW5kc1xyXG4gICAgY29uc3QgdmFsdWVzVG9Tb3VuZHNNYXAgPSBuZXcgTWFwKCBbXHJcbiAgICAgIFsgU291bmRUeXBlLkhPTUVfU0NSRUVOX1NFTEVDVEVELCBzY3JlZW5TZWxlY3Rpb25Ib21lVjNfbXAzIF0sXHJcbiAgICAgIFsgU291bmRUeXBlLkRJRkZFUkVOVF9JQ09OX1NFTEVDVEVELCBzd2l0Y2hpbmdTY3JlZW5TZWxlY3Rvckljb25zMDAzX21wMyBdXHJcbiAgICBdICk7XHJcblxyXG4gICAgc3VwZXIoIHZhbHVlc1RvU291bmRzTWFwLCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBob21lU2NyZWVuTW9kZWwuc2NyZWVuUHJvcGVydHkubGF6eUxpbmsoIHNjcmVlbiA9PiB7XHJcbiAgICAgIGlmICggc2NyZWVuLm1vZGVsID09PSBob21lU2NyZWVuTW9kZWwgKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5QXNzb2NpYXRlZFNvdW5kKCBTb3VuZFR5cGUuSE9NRV9TQ1JFRU5fU0VMRUNURUQgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHBsYXkgdGhlIHNvdW5kIHdoZW4gdGhlIHVzZXIgc2VsZWN0cyBhIGRpZmZlcmVudCBpY29uIG9uIHRoZSBob21lIHNjcmVlblxyXG4gICAgaG9tZVNjcmVlbk1vZGVsLnNlbGVjdGVkU2NyZWVuUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcclxuICAgICAgaWYgKCBob21lU2NyZWVuTW9kZWwuc2NyZWVuUHJvcGVydHkudmFsdWUubW9kZWwgPT09IGhvbWVTY3JlZW5Nb2RlbCApIHtcclxuICAgICAgICB0aGlzLnBsYXlBc3NvY2lhdGVkU291bmQoIFNvdW5kVHlwZS5ESUZGRVJFTlRfSUNPTl9TRUxFQ1RFRCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5qb2lzdC5yZWdpc3RlciggJ0hvbWVTY3JlZW5Tb3VuZEdlbmVyYXRvcicsIEhvbWVTY3JlZW5Tb3VuZEdlbmVyYXRvciApO1xyXG5leHBvcnQgZGVmYXVsdCBIb21lU2NyZWVuU291bmRHZW5lcmF0b3I7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUE0Qiw4Q0FBOEM7QUFDMUYsT0FBT0MseUJBQXlCLE1BQU0sd0NBQXdDO0FBQzlFLE9BQU9DLG1DQUFtQyxNQUFNLGtEQUFrRDtBQUNsRyxPQUFPQyxLQUFLLE1BQU0sWUFBWTtBQUU5QixPQUFPQyxXQUFXLE1BQU0sbUNBQW1DO0FBQzNELE9BQU9DLGdCQUFnQixNQUFNLHdDQUF3QztBQUVyRSxNQUFNQyxTQUFTLFNBQVNELGdCQUFnQixDQUFDO0VBQ3ZDLE9BQXVCRSxvQkFBb0IsR0FBRyxJQUFJRCxTQUFTLENBQUMsQ0FBQztFQUM3RCxPQUF1QkUsdUJBQXVCLEdBQUcsSUFBSUYsU0FBUyxDQUFDLENBQUM7RUFDaEUsT0FBdUJHLFdBQVcsR0FBRyxJQUFJTCxXQUFXLENBQUVFLFNBQVUsQ0FBQztBQUNuRTtBQUVBLE1BQU1JLHdCQUF3QixTQUFTVixTQUFTLENBQVk7RUFDbkRXLFdBQVdBLENBQUVDLGVBQWdDLEVBQUVDLGVBQWtDLEVBQUc7SUFFekY7SUFDQSxNQUFNQyxpQkFBaUIsR0FBRyxJQUFJQyxHQUFHLENBQUUsQ0FDakMsQ0FBRVQsU0FBUyxDQUFDQyxvQkFBb0IsRUFBRU4seUJBQXlCLENBQUUsRUFDN0QsQ0FBRUssU0FBUyxDQUFDRSx1QkFBdUIsRUFBRU4sbUNBQW1DLENBQUUsQ0FDMUUsQ0FBQztJQUVILEtBQUssQ0FBRVksaUJBQWlCLEVBQUVELGVBQWdCLENBQUM7SUFFM0NELGVBQWUsQ0FBQ0ksY0FBYyxDQUFDQyxRQUFRLENBQUVDLE1BQU0sSUFBSTtNQUNqRCxJQUFLQSxNQUFNLENBQUNDLEtBQUssS0FBS1AsZUFBZSxFQUFHO1FBQ3RDLElBQUksQ0FBQ1EsbUJBQW1CLENBQUVkLFNBQVMsQ0FBQ0Msb0JBQXFCLENBQUM7TUFDNUQ7SUFDRixDQUFFLENBQUM7O0lBRUg7SUFDQUssZUFBZSxDQUFDUyxzQkFBc0IsQ0FBQ0osUUFBUSxDQUFFLE1BQU07TUFDckQsSUFBS0wsZUFBZSxDQUFDSSxjQUFjLENBQUNNLEtBQUssQ0FBQ0gsS0FBSyxLQUFLUCxlQUFlLEVBQUc7UUFDcEUsSUFBSSxDQUFDUSxtQkFBbUIsQ0FBRWQsU0FBUyxDQUFDRSx1QkFBd0IsQ0FBQztNQUMvRDtJQUNGLENBQUUsQ0FBQztFQUNMO0FBQ0Y7QUFFQUwsS0FBSyxDQUFDb0IsUUFBUSxDQUFFLDBCQUEwQixFQUFFYix3QkFBeUIsQ0FBQztBQUN0RSxlQUFlQSx3QkFBd0IifQ==