// Copyright 2017-2022, University of Colorado Boulder

/**
 * The 'Mystery' screen in 'Function Builder: Basics'.
 * This screen differs significantly from the Mystery screen in Function Builder.
 * Instead of numeric cards and functions, this Mystery screen uses pattern (image) cards and functions.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import FBColors from '../../../function-builder/js/common/FBColors.js';
import FBIconFactory from '../../../function-builder/js/common/view/FBIconFactory.js';
import FunctionBuilderStrings from '../../../function-builder/js/FunctionBuilderStrings.js';
import Screen from '../../../joist/js/Screen.js';
import functionBuilderBasics from '../functionBuilderBasics.js';
import FBBMysteryModel from './model/FBBMysteryModel.js';
import FBBMysteryScreenView from './view/FBBMysteryScreenView.js';
export default class FBBMysteryScreen extends Screen {
  constructor(tandem) {
    const options = {
      // ScreenOptions
      name: FunctionBuilderStrings.screen.mysteryStringProperty,
      backgroundColorProperty: new Property(FBColors.MYSTERY_SCREEN_BACKGROUND),
      homeScreenIcon: FBIconFactory.createMysteryScreenIcon({
        functionFill: 'white',
        questionMarkFill: 'red'
      }),
      tandem: tandem
    };
    super(() => new FBBMysteryModel(), model => new FBBMysteryScreenView(model), options);
  }
}
functionBuilderBasics.register('FBBMysteryScreen', FBBMysteryScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkZCQ29sb3JzIiwiRkJJY29uRmFjdG9yeSIsIkZ1bmN0aW9uQnVpbGRlclN0cmluZ3MiLCJTY3JlZW4iLCJmdW5jdGlvbkJ1aWxkZXJCYXNpY3MiLCJGQkJNeXN0ZXJ5TW9kZWwiLCJGQkJNeXN0ZXJ5U2NyZWVuVmlldyIsIkZCQk15c3RlcnlTY3JlZW4iLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsIm9wdGlvbnMiLCJuYW1lIiwic2NyZWVuIiwibXlzdGVyeVN0cmluZ1Byb3BlcnR5IiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJNWVNURVJZX1NDUkVFTl9CQUNLR1JPVU5EIiwiaG9tZVNjcmVlbkljb24iLCJjcmVhdGVNeXN0ZXJ5U2NyZWVuSWNvbiIsImZ1bmN0aW9uRmlsbCIsInF1ZXN0aW9uTWFya0ZpbGwiLCJtb2RlbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRkJCTXlzdGVyeVNjcmVlbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgJ015c3RlcnknIHNjcmVlbiBpbiAnRnVuY3Rpb24gQnVpbGRlcjogQmFzaWNzJy5cclxuICogVGhpcyBzY3JlZW4gZGlmZmVycyBzaWduaWZpY2FudGx5IGZyb20gdGhlIE15c3Rlcnkgc2NyZWVuIGluIEZ1bmN0aW9uIEJ1aWxkZXIuXHJcbiAqIEluc3RlYWQgb2YgbnVtZXJpYyBjYXJkcyBhbmQgZnVuY3Rpb25zLCB0aGlzIE15c3Rlcnkgc2NyZWVuIHVzZXMgcGF0dGVybiAoaW1hZ2UpIGNhcmRzIGFuZCBmdW5jdGlvbnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRkJDb2xvcnMgZnJvbSAnLi4vLi4vLi4vZnVuY3Rpb24tYnVpbGRlci9qcy9jb21tb24vRkJDb2xvcnMuanMnO1xyXG5pbXBvcnQgRkJJY29uRmFjdG9yeSBmcm9tICcuLi8uLi8uLi9mdW5jdGlvbi1idWlsZGVyL2pzL2NvbW1vbi92aWV3L0ZCSWNvbkZhY3RvcnkuanMnO1xyXG5pbXBvcnQgRnVuY3Rpb25CdWlsZGVyU3RyaW5ncyBmcm9tICcuLi8uLi8uLi9mdW5jdGlvbi1idWlsZGVyL2pzL0Z1bmN0aW9uQnVpbGRlclN0cmluZ3MuanMnO1xyXG5pbXBvcnQgU2NyZWVuIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbi5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBmdW5jdGlvbkJ1aWxkZXJCYXNpY3MgZnJvbSAnLi4vZnVuY3Rpb25CdWlsZGVyQmFzaWNzLmpzJztcclxuaW1wb3J0IEZCQk15c3RlcnlNb2RlbCBmcm9tICcuL21vZGVsL0ZCQk15c3RlcnlNb2RlbC5qcyc7XHJcbmltcG9ydCBGQkJNeXN0ZXJ5U2NyZWVuVmlldyBmcm9tICcuL3ZpZXcvRkJCTXlzdGVyeVNjcmVlblZpZXcuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRkJCTXlzdGVyeVNjcmVlbiBleHRlbmRzIFNjcmVlbjxGQkJNeXN0ZXJ5TW9kZWwsIEZCQk15c3RlcnlTY3JlZW5WaWV3PiB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcclxuXHJcbiAgICAgIC8vIFNjcmVlbk9wdGlvbnNcclxuICAgICAgbmFtZTogRnVuY3Rpb25CdWlsZGVyU3RyaW5ncy5zY3JlZW4ubXlzdGVyeVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBGQkNvbG9ycy5NWVNURVJZX1NDUkVFTl9CQUNLR1JPVU5EICksXHJcbiAgICAgIGhvbWVTY3JlZW5JY29uOiBGQkljb25GYWN0b3J5LmNyZWF0ZU15c3RlcnlTY3JlZW5JY29uKCB7XHJcbiAgICAgICAgZnVuY3Rpb25GaWxsOiAnd2hpdGUnLFxyXG4gICAgICAgIHF1ZXN0aW9uTWFya0ZpbGw6ICdyZWQnXHJcbiAgICAgIH0gKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH07XHJcblxyXG4gICAgc3VwZXIoXHJcbiAgICAgICgpID0+IG5ldyBGQkJNeXN0ZXJ5TW9kZWwoKSxcclxuICAgICAgbW9kZWwgPT4gbmV3IEZCQk15c3RlcnlTY3JlZW5WaWV3KCBtb2RlbCApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb25CdWlsZGVyQmFzaWNzLnJlZ2lzdGVyKCAnRkJCTXlzdGVyeVNjcmVlbicsIEZCQk15c3RlcnlTY3JlZW4gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSw4QkFBOEI7QUFDbkQsT0FBT0MsUUFBUSxNQUFNLGlEQUFpRDtBQUN0RSxPQUFPQyxhQUFhLE1BQU0sMkRBQTJEO0FBQ3JGLE9BQU9DLHNCQUFzQixNQUFNLHdEQUF3RDtBQUMzRixPQUFPQyxNQUFNLE1BQU0sNkJBQTZCO0FBRWhELE9BQU9DLHFCQUFxQixNQUFNLDZCQUE2QjtBQUMvRCxPQUFPQyxlQUFlLE1BQU0sNEJBQTRCO0FBQ3hELE9BQU9DLG9CQUFvQixNQUFNLGdDQUFnQztBQUVqRSxlQUFlLE1BQU1DLGdCQUFnQixTQUFTSixNQUFNLENBQXdDO0VBRW5GSyxXQUFXQSxDQUFFQyxNQUFjLEVBQUc7SUFFbkMsTUFBTUMsT0FBTyxHQUFHO01BRWQ7TUFDQUMsSUFBSSxFQUFFVCxzQkFBc0IsQ0FBQ1UsTUFBTSxDQUFDQyxxQkFBcUI7TUFDekRDLHVCQUF1QixFQUFFLElBQUlmLFFBQVEsQ0FBRUMsUUFBUSxDQUFDZSx5QkFBMEIsQ0FBQztNQUMzRUMsY0FBYyxFQUFFZixhQUFhLENBQUNnQix1QkFBdUIsQ0FBRTtRQUNyREMsWUFBWSxFQUFFLE9BQU87UUFDckJDLGdCQUFnQixFQUFFO01BQ3BCLENBQUUsQ0FBQztNQUNIVixNQUFNLEVBQUVBO0lBQ1YsQ0FBQztJQUVELEtBQUssQ0FDSCxNQUFNLElBQUlKLGVBQWUsQ0FBQyxDQUFDLEVBQzNCZSxLQUFLLElBQUksSUFBSWQsb0JBQW9CLENBQUVjLEtBQU0sQ0FBQyxFQUMxQ1YsT0FDRixDQUFDO0VBQ0g7QUFDRjtBQUVBTixxQkFBcUIsQ0FBQ2lCLFFBQVEsQ0FBRSxrQkFBa0IsRUFBRWQsZ0JBQWlCLENBQUMifQ==