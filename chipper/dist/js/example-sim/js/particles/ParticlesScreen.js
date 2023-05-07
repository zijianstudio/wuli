// Copyright 2021-2022, University of Colorado Boulder

/**
 * ParticlesScreen is the top-level component for the 'Particles' screen.  It creates the model and view.
 *
 * This screen was inspired by Alberto, a member of the PhET Google Group. He had written a particle simulation
 * in p5.js, and was interested in how it could be ported to PhET libraries.
 * See https://groups.google.com/g/developing-interactive-simulations-in-html5/c/nrBahpJjAf0
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import merge from '../../../phet-core/js/merge.js';
import ShadedSphereNode from '../../../scenery-phet/js/ShadedSphereNode.js';
import ExampleSimConstants from '../common/ExampleSimConstants.js';
import exampleSim from '../exampleSim.js';
import ExampleSimStrings from '../ExampleSimStrings.js';
import ParticlesModel from './model/ParticlesModel.js';
import ParticlesScreenView from './view/ParticlesScreenView.js';

// constants
const BACKGROUND_COLOR_PROPERTY = new Property('black');
class ParticlesScreen extends Screen {
  constructor() {
    const options = merge({
      name: ExampleSimStrings.screen.particlesStringProperty,
      homeScreenIcon: createScreenIcon()
    }, ExampleSimConstants.SCREEN_OPTIONS);
    super(() => new ParticlesModel(), model => new ParticlesScreenView(model), options);
  }
}

/**
 * Creates the icon for this screen. This will be used for the home screen and navigation bar.
 * Always use ScreenIcon for screen icons.
 * @returns {ScreenIcon}
 */
function createScreenIcon() {
  const iconNode = new ShadedSphereNode(100, {
    mainColor: ExampleSimConstants.PARTICLE_COLOR
  });
  return new ScreenIcon(iconNode, {
    fill: BACKGROUND_COLOR_PROPERTY
  });
}
exampleSim.register('ParticlesScreen', ParticlesScreen);
export default ParticlesScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlNjcmVlbkljb24iLCJtZXJnZSIsIlNoYWRlZFNwaGVyZU5vZGUiLCJFeGFtcGxlU2ltQ29uc3RhbnRzIiwiZXhhbXBsZVNpbSIsIkV4YW1wbGVTaW1TdHJpbmdzIiwiUGFydGljbGVzTW9kZWwiLCJQYXJ0aWNsZXNTY3JlZW5WaWV3IiwiQkFDS0dST1VORF9DT0xPUl9QUk9QRVJUWSIsIlBhcnRpY2xlc1NjcmVlbiIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsIm5hbWUiLCJzY3JlZW4iLCJwYXJ0aWNsZXNTdHJpbmdQcm9wZXJ0eSIsImhvbWVTY3JlZW5JY29uIiwiY3JlYXRlU2NyZWVuSWNvbiIsIlNDUkVFTl9PUFRJT05TIiwibW9kZWwiLCJpY29uTm9kZSIsIm1haW5Db2xvciIsIlBBUlRJQ0xFX0NPTE9SIiwiZmlsbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGFydGljbGVzU2NyZWVuLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBhcnRpY2xlc1NjcmVlbiBpcyB0aGUgdG9wLWxldmVsIGNvbXBvbmVudCBmb3IgdGhlICdQYXJ0aWNsZXMnIHNjcmVlbi4gIEl0IGNyZWF0ZXMgdGhlIG1vZGVsIGFuZCB2aWV3LlxyXG4gKlxyXG4gKiBUaGlzIHNjcmVlbiB3YXMgaW5zcGlyZWQgYnkgQWxiZXJ0bywgYSBtZW1iZXIgb2YgdGhlIFBoRVQgR29vZ2xlIEdyb3VwLiBIZSBoYWQgd3JpdHRlbiBhIHBhcnRpY2xlIHNpbXVsYXRpb25cclxuICogaW4gcDUuanMsIGFuZCB3YXMgaW50ZXJlc3RlZCBpbiBob3cgaXQgY291bGQgYmUgcG9ydGVkIHRvIFBoRVQgbGlicmFyaWVzLlxyXG4gKiBTZWUgaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9nL2RldmVsb3BpbmctaW50ZXJhY3RpdmUtc2ltdWxhdGlvbnMtaW4taHRtbDUvYy9uckJhaHBKakFmMFxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBTaGFkZWRTcGhlcmVOb2RlIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TaGFkZWRTcGhlcmVOb2RlLmpzJztcclxuaW1wb3J0IEV4YW1wbGVTaW1Db25zdGFudHMgZnJvbSAnLi4vY29tbW9uL0V4YW1wbGVTaW1Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgZXhhbXBsZVNpbSBmcm9tICcuLi9leGFtcGxlU2ltLmpzJztcclxuaW1wb3J0IEV4YW1wbGVTaW1TdHJpbmdzIGZyb20gJy4uL0V4YW1wbGVTaW1TdHJpbmdzLmpzJztcclxuaW1wb3J0IFBhcnRpY2xlc01vZGVsIGZyb20gJy4vbW9kZWwvUGFydGljbGVzTW9kZWwuanMnO1xyXG5pbXBvcnQgUGFydGljbGVzU2NyZWVuVmlldyBmcm9tICcuL3ZpZXcvUGFydGljbGVzU2NyZWVuVmlldy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQkFDS0dST1VORF9DT0xPUl9QUk9QRVJUWSA9IG5ldyBQcm9wZXJ0eSggJ2JsYWNrJyApO1xyXG5cclxuY2xhc3MgUGFydGljbGVzU2NyZWVuIGV4dGVuZHMgU2NyZWVuIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIG5hbWU6IEV4YW1wbGVTaW1TdHJpbmdzLnNjcmVlbi5wYXJ0aWNsZXNTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgaG9tZVNjcmVlbkljb246IGNyZWF0ZVNjcmVlbkljb24oKVxyXG4gICAgfSwgRXhhbXBsZVNpbUNvbnN0YW50cy5TQ1JFRU5fT1BUSU9OUyApO1xyXG5cclxuICAgIHN1cGVyKFxyXG4gICAgICAoKSA9PiBuZXcgUGFydGljbGVzTW9kZWwoKSxcclxuICAgICAgbW9kZWwgPT4gbmV3IFBhcnRpY2xlc1NjcmVlblZpZXcoIG1vZGVsICksXHJcbiAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyB0aGUgaWNvbiBmb3IgdGhpcyBzY3JlZW4uIFRoaXMgd2lsbCBiZSB1c2VkIGZvciB0aGUgaG9tZSBzY3JlZW4gYW5kIG5hdmlnYXRpb24gYmFyLlxyXG4gKiBBbHdheXMgdXNlIFNjcmVlbkljb24gZm9yIHNjcmVlbiBpY29ucy5cclxuICogQHJldHVybnMge1NjcmVlbkljb259XHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVTY3JlZW5JY29uKCkge1xyXG4gIGNvbnN0IGljb25Ob2RlID0gbmV3IFNoYWRlZFNwaGVyZU5vZGUoIDEwMCwge1xyXG4gICAgbWFpbkNvbG9yOiBFeGFtcGxlU2ltQ29uc3RhbnRzLlBBUlRJQ0xFX0NPTE9SXHJcbiAgfSApO1xyXG4gIHJldHVybiBuZXcgU2NyZWVuSWNvbiggaWNvbk5vZGUsIHtcclxuICAgIGZpbGw6IEJBQ0tHUk9VTkRfQ09MT1JfUFJPUEVSVFlcclxuICB9ICk7XHJcbn1cclxuXHJcbmV4YW1wbGVTaW0ucmVnaXN0ZXIoICdQYXJ0aWNsZXNTY3JlZW4nLCBQYXJ0aWNsZXNTY3JlZW4gKTtcclxuZXhwb3J0IGRlZmF1bHQgUGFydGljbGVzU2NyZWVuOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSw4QkFBOEI7QUFDbkQsT0FBT0MsTUFBTSxNQUFNLDZCQUE2QjtBQUNoRCxPQUFPQyxVQUFVLE1BQU0saUNBQWlDO0FBQ3hELE9BQU9DLEtBQUssTUFBTSxnQ0FBZ0M7QUFDbEQsT0FBT0MsZ0JBQWdCLE1BQU0sOENBQThDO0FBQzNFLE9BQU9DLG1CQUFtQixNQUFNLGtDQUFrQztBQUNsRSxPQUFPQyxVQUFVLE1BQU0sa0JBQWtCO0FBQ3pDLE9BQU9DLGlCQUFpQixNQUFNLHlCQUF5QjtBQUN2RCxPQUFPQyxjQUFjLE1BQU0sMkJBQTJCO0FBQ3RELE9BQU9DLG1CQUFtQixNQUFNLCtCQUErQjs7QUFFL0Q7QUFDQSxNQUFNQyx5QkFBeUIsR0FBRyxJQUFJVixRQUFRLENBQUUsT0FBUSxDQUFDO0FBRXpELE1BQU1XLGVBQWUsU0FBU1YsTUFBTSxDQUFDO0VBRW5DVyxXQUFXQSxDQUFBLEVBQUc7SUFFWixNQUFNQyxPQUFPLEdBQUdWLEtBQUssQ0FBRTtNQUNyQlcsSUFBSSxFQUFFUCxpQkFBaUIsQ0FBQ1EsTUFBTSxDQUFDQyx1QkFBdUI7TUFDdERDLGNBQWMsRUFBRUMsZ0JBQWdCLENBQUM7SUFDbkMsQ0FBQyxFQUFFYixtQkFBbUIsQ0FBQ2MsY0FBZSxDQUFDO0lBRXZDLEtBQUssQ0FDSCxNQUFNLElBQUlYLGNBQWMsQ0FBQyxDQUFDLEVBQzFCWSxLQUFLLElBQUksSUFBSVgsbUJBQW1CLENBQUVXLEtBQU0sQ0FBQyxFQUN6Q1AsT0FDRixDQUFDO0VBQ0g7QUFDRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0ssZ0JBQWdCQSxDQUFBLEVBQUc7RUFDMUIsTUFBTUcsUUFBUSxHQUFHLElBQUlqQixnQkFBZ0IsQ0FBRSxHQUFHLEVBQUU7SUFDMUNrQixTQUFTLEVBQUVqQixtQkFBbUIsQ0FBQ2tCO0VBQ2pDLENBQUUsQ0FBQztFQUNILE9BQU8sSUFBSXJCLFVBQVUsQ0FBRW1CLFFBQVEsRUFBRTtJQUMvQkcsSUFBSSxFQUFFZDtFQUNSLENBQUUsQ0FBQztBQUNMO0FBRUFKLFVBQVUsQ0FBQ21CLFFBQVEsQ0FBRSxpQkFBaUIsRUFBRWQsZUFBZ0IsQ0FBQztBQUN6RCxlQUFlQSxlQUFlIn0=