// Copyright 2019-2023, University of Colorado Boulder

/**
 * IntroScreen is the 'Intro' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { HBox, Image } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import bunnyBrownFurStraightEarsShortTeeth_png from '../../images/bunnyBrownFurStraightEarsShortTeeth_png.js';
import bunnyWhiteFurStraightEarsShortTeeth_png from '../../images/bunnyWhiteFurStraightEarsShortTeeth_png.js';
import NaturalSelectionColors from '../common/NaturalSelectionColors.js';
import naturalSelection from '../naturalSelection.js';
import NaturalSelectionStrings from '../NaturalSelectionStrings.js';
import IntroModel from './model/IntroModel.js';
import IntroScreenView from './view/IntroScreenView.js';
export default class IntroScreen extends Screen {
  constructor(tandem) {
    const options = {
      // Screen options
      name: NaturalSelectionStrings.screen.introStringProperty,
      homeScreenIcon: createScreenIcon(),
      backgroundColorProperty: new Property(NaturalSelectionColors.SCREEN_VIEW_BACKGROUND, {
        tandem: Tandem.OPT_OUT
      }),
      // phet-io
      tandem: tandem
    };
    super(() => new IntroModel(tandem.createTandem('model')), model => new IntroScreenView(model, tandem.createTandem('view')), options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}

/**
 * Creates the icon for this screen.
 */
function createScreenIcon() {
  return new ScreenIcon(new HBox({
    spacing: 20,
    children: [new Image(bunnyBrownFurStraightEarsShortTeeth_png), new Image(bunnyWhiteFurStraightEarsShortTeeth_png)]
  }), {
    fill: NaturalSelectionColors.SCREEN_VIEW_BACKGROUND
  });
}
naturalSelection.register('IntroScreen', IntroScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlNjcmVlbkljb24iLCJIQm94IiwiSW1hZ2UiLCJUYW5kZW0iLCJidW5ueUJyb3duRnVyU3RyYWlnaHRFYXJzU2hvcnRUZWV0aF9wbmciLCJidW5ueVdoaXRlRnVyU3RyYWlnaHRFYXJzU2hvcnRUZWV0aF9wbmciLCJOYXR1cmFsU2VsZWN0aW9uQ29sb3JzIiwibmF0dXJhbFNlbGVjdGlvbiIsIk5hdHVyYWxTZWxlY3Rpb25TdHJpbmdzIiwiSW50cm9Nb2RlbCIsIkludHJvU2NyZWVuVmlldyIsIkludHJvU2NyZWVuIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJvcHRpb25zIiwibmFtZSIsInNjcmVlbiIsImludHJvU3RyaW5nUHJvcGVydHkiLCJob21lU2NyZWVuSWNvbiIsImNyZWF0ZVNjcmVlbkljb24iLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsIlNDUkVFTl9WSUVXX0JBQ0tHUk9VTkQiLCJPUFRfT1VUIiwiY3JlYXRlVGFuZGVtIiwibW9kZWwiLCJkaXNwb3NlIiwiYXNzZXJ0Iiwic3BhY2luZyIsImNoaWxkcmVuIiwiZmlsbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSW50cm9TY3JlZW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSW50cm9TY3JlZW4gaXMgdGhlICdJbnRybycgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IHsgSEJveCwgSW1hZ2UgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgYnVubnlCcm93bkZ1clN0cmFpZ2h0RWFyc1Nob3J0VGVldGhfcG5nIGZyb20gJy4uLy4uL2ltYWdlcy9idW5ueUJyb3duRnVyU3RyYWlnaHRFYXJzU2hvcnRUZWV0aF9wbmcuanMnO1xyXG5pbXBvcnQgYnVubnlXaGl0ZUZ1clN0cmFpZ2h0RWFyc1Nob3J0VGVldGhfcG5nIGZyb20gJy4uLy4uL2ltYWdlcy9idW5ueVdoaXRlRnVyU3RyYWlnaHRFYXJzU2hvcnRUZWV0aF9wbmcuanMnO1xyXG5pbXBvcnQgTmF0dXJhbFNlbGVjdGlvbkNvbG9ycyBmcm9tICcuLi9jb21tb24vTmF0dXJhbFNlbGVjdGlvbkNvbG9ycy5qcyc7XHJcbmltcG9ydCBuYXR1cmFsU2VsZWN0aW9uIGZyb20gJy4uL25hdHVyYWxTZWxlY3Rpb24uanMnO1xyXG5pbXBvcnQgTmF0dXJhbFNlbGVjdGlvblN0cmluZ3MgZnJvbSAnLi4vTmF0dXJhbFNlbGVjdGlvblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgSW50cm9Nb2RlbCBmcm9tICcuL21vZGVsL0ludHJvTW9kZWwuanMnO1xyXG5pbXBvcnQgSW50cm9TY3JlZW5WaWV3IGZyb20gJy4vdmlldy9JbnRyb1NjcmVlblZpZXcuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50cm9TY3JlZW4gZXh0ZW5kcyBTY3JlZW48SW50cm9Nb2RlbCwgSW50cm9TY3JlZW5WaWV3PiB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcclxuXHJcbiAgICAgIC8vIFNjcmVlbiBvcHRpb25zXHJcbiAgICAgIG5hbWU6IE5hdHVyYWxTZWxlY3Rpb25TdHJpbmdzLnNjcmVlbi5pbnRyb1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBob21lU2NyZWVuSWNvbjogY3JlYXRlU2NyZWVuSWNvbigpLFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBOYXR1cmFsU2VsZWN0aW9uQ29sb3JzLlNDUkVFTl9WSUVXX0JBQ0tHUk9VTkQsIHtcclxuICAgICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICAgIH0gKSxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH07XHJcblxyXG4gICAgc3VwZXIoXHJcbiAgICAgICgpID0+IG5ldyBJbnRyb01vZGVsKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbW9kZWwnICkgKSxcclxuICAgICAgbW9kZWwgPT4gbmV3IEludHJvU2NyZWVuVmlldyggbW9kZWwsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2aWV3JyApICksXHJcbiAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgdGhlIGljb24gZm9yIHRoaXMgc2NyZWVuLlxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlU2NyZWVuSWNvbigpOiBTY3JlZW5JY29uIHtcclxuICByZXR1cm4gbmV3IFNjcmVlbkljb24oIG5ldyBIQm94KCB7XHJcbiAgICBzcGFjaW5nOiAyMCxcclxuICAgIGNoaWxkcmVuOiBbIG5ldyBJbWFnZSggYnVubnlCcm93bkZ1clN0cmFpZ2h0RWFyc1Nob3J0VGVldGhfcG5nICksIG5ldyBJbWFnZSggYnVubnlXaGl0ZUZ1clN0cmFpZ2h0RWFyc1Nob3J0VGVldGhfcG5nICkgXVxyXG4gIH0gKSwge1xyXG4gICAgZmlsbDogTmF0dXJhbFNlbGVjdGlvbkNvbG9ycy5TQ1JFRU5fVklFV19CQUNLR1JPVU5EXHJcbiAgfSApO1xyXG59XHJcblxyXG5uYXR1cmFsU2VsZWN0aW9uLnJlZ2lzdGVyKCAnSW50cm9TY3JlZW4nLCBJbnRyb1NjcmVlbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLE1BQU0sTUFBTSw2QkFBNkI7QUFDaEQsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxTQUFTQyxJQUFJLEVBQUVDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDNUQsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyx1Q0FBdUMsTUFBTSx5REFBeUQ7QUFDN0csT0FBT0MsdUNBQXVDLE1BQU0seURBQXlEO0FBQzdHLE9BQU9DLHNCQUFzQixNQUFNLHFDQUFxQztBQUN4RSxPQUFPQyxnQkFBZ0IsTUFBTSx3QkFBd0I7QUFDckQsT0FBT0MsdUJBQXVCLE1BQU0sK0JBQStCO0FBQ25FLE9BQU9DLFVBQVUsTUFBTSx1QkFBdUI7QUFDOUMsT0FBT0MsZUFBZSxNQUFNLDJCQUEyQjtBQUV2RCxlQUFlLE1BQU1DLFdBQVcsU0FBU1osTUFBTSxDQUE4QjtFQUVwRWEsV0FBV0EsQ0FBRUMsTUFBYyxFQUFHO0lBRW5DLE1BQU1DLE9BQU8sR0FBRztNQUVkO01BQ0FDLElBQUksRUFBRVAsdUJBQXVCLENBQUNRLE1BQU0sQ0FBQ0MsbUJBQW1CO01BQ3hEQyxjQUFjLEVBQUVDLGdCQUFnQixDQUFDLENBQUM7TUFDbENDLHVCQUF1QixFQUFFLElBQUl0QixRQUFRLENBQUVRLHNCQUFzQixDQUFDZSxzQkFBc0IsRUFBRTtRQUNwRlIsTUFBTSxFQUFFVixNQUFNLENBQUNtQjtNQUNqQixDQUFFLENBQUM7TUFFSDtNQUNBVCxNQUFNLEVBQUVBO0lBQ1YsQ0FBQztJQUVELEtBQUssQ0FDSCxNQUFNLElBQUlKLFVBQVUsQ0FBRUksTUFBTSxDQUFDVSxZQUFZLENBQUUsT0FBUSxDQUFFLENBQUMsRUFDdERDLEtBQUssSUFBSSxJQUFJZCxlQUFlLENBQUVjLEtBQUssRUFBRVgsTUFBTSxDQUFDVSxZQUFZLENBQUUsTUFBTyxDQUFFLENBQUMsRUFDcEVULE9BQ0YsQ0FBQztFQUNIO0VBRWdCVyxPQUFPQSxDQUFBLEVBQVM7SUFDOUJDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLEtBQUssRUFBRSw4REFBK0QsQ0FBQztJQUN6RixLQUFLLENBQUNELE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBU04sZ0JBQWdCQSxDQUFBLEVBQWU7RUFDdEMsT0FBTyxJQUFJbkIsVUFBVSxDQUFFLElBQUlDLElBQUksQ0FBRTtJQUMvQjBCLE9BQU8sRUFBRSxFQUFFO0lBQ1hDLFFBQVEsRUFBRSxDQUFFLElBQUkxQixLQUFLLENBQUVFLHVDQUF3QyxDQUFDLEVBQUUsSUFBSUYsS0FBSyxDQUFFRyx1Q0FBd0MsQ0FBQztFQUN4SCxDQUFFLENBQUMsRUFBRTtJQUNId0IsSUFBSSxFQUFFdkIsc0JBQXNCLENBQUNlO0VBQy9CLENBQUUsQ0FBQztBQUNMO0FBRUFkLGdCQUFnQixDQUFDdUIsUUFBUSxDQUFFLGFBQWEsRUFBRW5CLFdBQVksQ0FBQyJ9