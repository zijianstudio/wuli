// Copyright 2015-2023, University of Colorado Boulder

/**
 * Scene for the 'Patterns' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import beaker_png from '../../../images/cards/beaker_png.js';
import butterfly_png from '../../../images/cards/butterfly_png.js';
import cherries_png from '../../../images/cards/cherries_png.js';
import circle_png from '../../../images/cards/circle_png.js';
import feet_png from '../../../images/cards/feet_png.js';
import planet_png from '../../../images/cards/planet_png.js';
import rectangle_png from '../../../images/cards/rectangle_png.js';
import snowflake_png from '../../../images/cards/snowflake_png.js';
import star_png from '../../../images/cards/star_png.js';
import stickFigure_png from '../../../images/cards/stickFigure_png.js';
import sun_png from '../../../images/cards/sun_png.js';
import triangle_png from '../../../images/cards/triangle_png.js';
import FBConstants from '../../common/FBConstants.js';
import Builder from '../../common/model/builder/Builder.js';
import FunctionCreator from '../../common/model/functions/FunctionCreator.js';
import Scene from '../../common/model/Scene.js';
import FBIconFactory from '../../common/view/FBIconFactory.js'; // eslint-disable-line no-view-imported-from-model
import functionBuilder from '../../functionBuilder.js';
import Erase from './functions/Erase.js';
import Grayscale from './functions/Grayscale.js';
import Identity from './functions/Identity.js';
import InvertRGB from './functions/InvertRGB.js';
import Mirror from './functions/Mirror.js';
import MysteryA from './functions/MysteryA.js';
import MysteryB from './functions/MysteryB.js';
import MysteryC from './functions/MysteryC.js';
import Rotate180 from './functions/Rotate180.js';
import Rotate90 from './functions/Rotate90.js';
import Shrink from './functions/Shrink.js';
import Warhol from './functions/Warhol.js';
export default class PatternsScene extends Scene {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      numberOfSlots: 1,
      // number of slots in the builder
      numberOfEachCard: 1,
      // number of instances of each card type
      numberOfEachFunction: 1 // number of instances of each function type
    }, options);
    assert && assert(!options.iconNode);
    options.iconNode = FBIconFactory.createSceneIcon(options.numberOfSlots);

    // {HTMLImageElement[]} images for the input cards, in the order that they appear in the carousel
    const cardContent = [feet_png, snowflake_png, butterfly_png, stickFigure_png, planet_png, sun_png, beaker_png, cherries_png, rectangle_png, circle_png, triangle_png, star_png];

    // All card images must have even dimensions, so that functions exhibit symmetry where expected, and to prevent anti-aliasing artifacts.
    // See https://github.com/phetsims/function-builder/issues/109 and https://github.com/phetsims/function-builder-basics/issues/18
    assert && cardContent.forEach(image => {
      assert(image.width % 2 === 0 && image.height % 2 === 0, `dimensions must be even! width=${image.width}, height=${image.height}`);
    });

    // {FunctionCreator[]} function creators, in the order that functions appear in the carousel
    const functionCreators = [new FunctionCreator(Mirror), new FunctionCreator(Rotate90), new FunctionCreator(Grayscale), new FunctionCreator(Rotate180), new FunctionCreator(Identity), new FunctionCreator(InvertRGB), new FunctionCreator(Erase), new FunctionCreator(Shrink), new FunctionCreator(Warhol), new FunctionCreator(MysteryA), new FunctionCreator(MysteryB), new FunctionCreator(MysteryC)];

    // builder
    const builderWidth = Scene.computeBuilderWidth(options.numberOfSlots);
    const builderX = FBConstants.SCREEN_VIEW_LAYOUT_BOUNDS.width / 2 - builderWidth / 2;
    const builder = new Builder({
      numberOfSlots: options.numberOfSlots,
      width: builderWidth,
      position: new Vector2(builderX, FBConstants.BUILDER_Y)
    });
    super(cardContent, functionCreators, builder, options);
  }
}
functionBuilder.register('PatternsScene', PatternsScene);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwibWVyZ2UiLCJiZWFrZXJfcG5nIiwiYnV0dGVyZmx5X3BuZyIsImNoZXJyaWVzX3BuZyIsImNpcmNsZV9wbmciLCJmZWV0X3BuZyIsInBsYW5ldF9wbmciLCJyZWN0YW5nbGVfcG5nIiwic25vd2ZsYWtlX3BuZyIsInN0YXJfcG5nIiwic3RpY2tGaWd1cmVfcG5nIiwic3VuX3BuZyIsInRyaWFuZ2xlX3BuZyIsIkZCQ29uc3RhbnRzIiwiQnVpbGRlciIsIkZ1bmN0aW9uQ3JlYXRvciIsIlNjZW5lIiwiRkJJY29uRmFjdG9yeSIsImZ1bmN0aW9uQnVpbGRlciIsIkVyYXNlIiwiR3JheXNjYWxlIiwiSWRlbnRpdHkiLCJJbnZlcnRSR0IiLCJNaXJyb3IiLCJNeXN0ZXJ5QSIsIk15c3RlcnlCIiwiTXlzdGVyeUMiLCJSb3RhdGUxODAiLCJSb3RhdGU5MCIsIlNocmluayIsIldhcmhvbCIsIlBhdHRlcm5zU2NlbmUiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJudW1iZXJPZlNsb3RzIiwibnVtYmVyT2ZFYWNoQ2FyZCIsIm51bWJlck9mRWFjaEZ1bmN0aW9uIiwiYXNzZXJ0IiwiaWNvbk5vZGUiLCJjcmVhdGVTY2VuZUljb24iLCJjYXJkQ29udGVudCIsImZvckVhY2giLCJpbWFnZSIsIndpZHRoIiwiaGVpZ2h0IiwiZnVuY3Rpb25DcmVhdG9ycyIsImJ1aWxkZXJXaWR0aCIsImNvbXB1dGVCdWlsZGVyV2lkdGgiLCJidWlsZGVyWCIsIlNDUkVFTl9WSUVXX0xBWU9VVF9CT1VORFMiLCJidWlsZGVyIiwicG9zaXRpb24iLCJCVUlMREVSX1kiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBhdHRlcm5zU2NlbmUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2NlbmUgZm9yIHRoZSAnUGF0dGVybnMnIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgYmVha2VyX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvY2FyZHMvYmVha2VyX3BuZy5qcyc7XHJcbmltcG9ydCBidXR0ZXJmbHlfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9jYXJkcy9idXR0ZXJmbHlfcG5nLmpzJztcclxuaW1wb3J0IGNoZXJyaWVzX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvY2FyZHMvY2hlcnJpZXNfcG5nLmpzJztcclxuaW1wb3J0IGNpcmNsZV9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2NhcmRzL2NpcmNsZV9wbmcuanMnO1xyXG5pbXBvcnQgZmVldF9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2NhcmRzL2ZlZXRfcG5nLmpzJztcclxuaW1wb3J0IHBsYW5ldF9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2NhcmRzL3BsYW5ldF9wbmcuanMnO1xyXG5pbXBvcnQgcmVjdGFuZ2xlX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvY2FyZHMvcmVjdGFuZ2xlX3BuZy5qcyc7XHJcbmltcG9ydCBzbm93Zmxha2VfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9jYXJkcy9zbm93Zmxha2VfcG5nLmpzJztcclxuaW1wb3J0IHN0YXJfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9jYXJkcy9zdGFyX3BuZy5qcyc7XHJcbmltcG9ydCBzdGlja0ZpZ3VyZV9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2NhcmRzL3N0aWNrRmlndXJlX3BuZy5qcyc7XHJcbmltcG9ydCBzdW5fcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9jYXJkcy9zdW5fcG5nLmpzJztcclxuaW1wb3J0IHRyaWFuZ2xlX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvY2FyZHMvdHJpYW5nbGVfcG5nLmpzJztcclxuaW1wb3J0IEZCQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9GQkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBCdWlsZGVyIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9idWlsZGVyL0J1aWxkZXIuanMnO1xyXG5pbXBvcnQgRnVuY3Rpb25DcmVhdG9yIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9mdW5jdGlvbnMvRnVuY3Rpb25DcmVhdG9yLmpzJztcclxuaW1wb3J0IFNjZW5lIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9TY2VuZS5qcyc7XHJcbmltcG9ydCBGQkljb25GYWN0b3J5IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0ZCSWNvbkZhY3RvcnkuanMnOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZpZXctaW1wb3J0ZWQtZnJvbS1tb2RlbFxyXG5pbXBvcnQgZnVuY3Rpb25CdWlsZGVyIGZyb20gJy4uLy4uL2Z1bmN0aW9uQnVpbGRlci5qcyc7XHJcbmltcG9ydCBFcmFzZSBmcm9tICcuL2Z1bmN0aW9ucy9FcmFzZS5qcyc7XHJcbmltcG9ydCBHcmF5c2NhbGUgZnJvbSAnLi9mdW5jdGlvbnMvR3JheXNjYWxlLmpzJztcclxuaW1wb3J0IElkZW50aXR5IGZyb20gJy4vZnVuY3Rpb25zL0lkZW50aXR5LmpzJztcclxuaW1wb3J0IEludmVydFJHQiBmcm9tICcuL2Z1bmN0aW9ucy9JbnZlcnRSR0IuanMnO1xyXG5pbXBvcnQgTWlycm9yIGZyb20gJy4vZnVuY3Rpb25zL01pcnJvci5qcyc7XHJcbmltcG9ydCBNeXN0ZXJ5QSBmcm9tICcuL2Z1bmN0aW9ucy9NeXN0ZXJ5QS5qcyc7XHJcbmltcG9ydCBNeXN0ZXJ5QiBmcm9tICcuL2Z1bmN0aW9ucy9NeXN0ZXJ5Qi5qcyc7XHJcbmltcG9ydCBNeXN0ZXJ5QyBmcm9tICcuL2Z1bmN0aW9ucy9NeXN0ZXJ5Qy5qcyc7XHJcbmltcG9ydCBSb3RhdGUxODAgZnJvbSAnLi9mdW5jdGlvbnMvUm90YXRlMTgwLmpzJztcclxuaW1wb3J0IFJvdGF0ZTkwIGZyb20gJy4vZnVuY3Rpb25zL1JvdGF0ZTkwLmpzJztcclxuaW1wb3J0IFNocmluayBmcm9tICcuL2Z1bmN0aW9ucy9TaHJpbmsuanMnO1xyXG5pbXBvcnQgV2FyaG9sIGZyb20gJy4vZnVuY3Rpb25zL1dhcmhvbC5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXR0ZXJuc1NjZW5lIGV4dGVuZHMgU2NlbmUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIG51bWJlck9mU2xvdHM6IDEsIC8vIG51bWJlciBvZiBzbG90cyBpbiB0aGUgYnVpbGRlclxyXG4gICAgICBudW1iZXJPZkVhY2hDYXJkOiAxLCAvLyBudW1iZXIgb2YgaW5zdGFuY2VzIG9mIGVhY2ggY2FyZCB0eXBlXHJcbiAgICAgIG51bWJlck9mRWFjaEZ1bmN0aW9uOiAxIC8vIG51bWJlciBvZiBpbnN0YW5jZXMgb2YgZWFjaCBmdW5jdGlvbiB0eXBlXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuaWNvbk5vZGUgKTtcclxuICAgIG9wdGlvbnMuaWNvbk5vZGUgPSBGQkljb25GYWN0b3J5LmNyZWF0ZVNjZW5lSWNvbiggb3B0aW9ucy5udW1iZXJPZlNsb3RzICk7XHJcblxyXG4gICAgLy8ge0hUTUxJbWFnZUVsZW1lbnRbXX0gaW1hZ2VzIGZvciB0aGUgaW5wdXQgY2FyZHMsIGluIHRoZSBvcmRlciB0aGF0IHRoZXkgYXBwZWFyIGluIHRoZSBjYXJvdXNlbFxyXG4gICAgY29uc3QgY2FyZENvbnRlbnQgPSBbXHJcbiAgICAgIGZlZXRfcG5nLFxyXG4gICAgICBzbm93Zmxha2VfcG5nLFxyXG4gICAgICBidXR0ZXJmbHlfcG5nLFxyXG4gICAgICBzdGlja0ZpZ3VyZV9wbmcsXHJcbiAgICAgIHBsYW5ldF9wbmcsXHJcbiAgICAgIHN1bl9wbmcsXHJcbiAgICAgIGJlYWtlcl9wbmcsXHJcbiAgICAgIGNoZXJyaWVzX3BuZyxcclxuICAgICAgcmVjdGFuZ2xlX3BuZyxcclxuICAgICAgY2lyY2xlX3BuZyxcclxuICAgICAgdHJpYW5nbGVfcG5nLFxyXG4gICAgICBzdGFyX3BuZ1xyXG4gICAgXTtcclxuXHJcbiAgICAvLyBBbGwgY2FyZCBpbWFnZXMgbXVzdCBoYXZlIGV2ZW4gZGltZW5zaW9ucywgc28gdGhhdCBmdW5jdGlvbnMgZXhoaWJpdCBzeW1tZXRyeSB3aGVyZSBleHBlY3RlZCwgYW5kIHRvIHByZXZlbnQgYW50aS1hbGlhc2luZyBhcnRpZmFjdHMuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2Z1bmN0aW9uLWJ1aWxkZXIvaXNzdWVzLzEwOSBhbmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2Z1bmN0aW9uLWJ1aWxkZXItYmFzaWNzL2lzc3Vlcy8xOFxyXG4gICAgYXNzZXJ0ICYmIGNhcmRDb250ZW50LmZvckVhY2goIGltYWdlID0+IHtcclxuICAgICAgYXNzZXJ0KCAoIGltYWdlLndpZHRoICUgMiA9PT0gMCAmJiBpbWFnZS5oZWlnaHQgJSAyID09PSAwICksIGBkaW1lbnNpb25zIG11c3QgYmUgZXZlbiEgd2lkdGg9JHtpbWFnZS53aWR0aH0sIGhlaWdodD0ke2ltYWdlLmhlaWdodH1gICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8ge0Z1bmN0aW9uQ3JlYXRvcltdfSBmdW5jdGlvbiBjcmVhdG9ycywgaW4gdGhlIG9yZGVyIHRoYXQgZnVuY3Rpb25zIGFwcGVhciBpbiB0aGUgY2Fyb3VzZWxcclxuICAgIGNvbnN0IGZ1bmN0aW9uQ3JlYXRvcnMgPSBbXHJcbiAgICAgIG5ldyBGdW5jdGlvbkNyZWF0b3IoIE1pcnJvciApLFxyXG4gICAgICBuZXcgRnVuY3Rpb25DcmVhdG9yKCBSb3RhdGU5MCApLFxyXG4gICAgICBuZXcgRnVuY3Rpb25DcmVhdG9yKCBHcmF5c2NhbGUgKSxcclxuICAgICAgbmV3IEZ1bmN0aW9uQ3JlYXRvciggUm90YXRlMTgwICksXHJcbiAgICAgIG5ldyBGdW5jdGlvbkNyZWF0b3IoIElkZW50aXR5ICksXHJcbiAgICAgIG5ldyBGdW5jdGlvbkNyZWF0b3IoIEludmVydFJHQiApLFxyXG4gICAgICBuZXcgRnVuY3Rpb25DcmVhdG9yKCBFcmFzZSApLFxyXG4gICAgICBuZXcgRnVuY3Rpb25DcmVhdG9yKCBTaHJpbmsgKSxcclxuICAgICAgbmV3IEZ1bmN0aW9uQ3JlYXRvciggV2FyaG9sICksXHJcbiAgICAgIG5ldyBGdW5jdGlvbkNyZWF0b3IoIE15c3RlcnlBICksXHJcbiAgICAgIG5ldyBGdW5jdGlvbkNyZWF0b3IoIE15c3RlcnlCICksXHJcbiAgICAgIG5ldyBGdW5jdGlvbkNyZWF0b3IoIE15c3RlcnlDIClcclxuICAgIF07XHJcblxyXG4gICAgLy8gYnVpbGRlclxyXG4gICAgY29uc3QgYnVpbGRlcldpZHRoID0gU2NlbmUuY29tcHV0ZUJ1aWxkZXJXaWR0aCggb3B0aW9ucy5udW1iZXJPZlNsb3RzICk7XHJcbiAgICBjb25zdCBidWlsZGVyWCA9ICggRkJDb25zdGFudHMuU0NSRUVOX1ZJRVdfTEFZT1VUX0JPVU5EUy53aWR0aCAvIDIgKSAtICggYnVpbGRlcldpZHRoIC8gMiApO1xyXG4gICAgY29uc3QgYnVpbGRlciA9IG5ldyBCdWlsZGVyKCB7XHJcbiAgICAgIG51bWJlck9mU2xvdHM6IG9wdGlvbnMubnVtYmVyT2ZTbG90cyxcclxuICAgICAgd2lkdGg6IGJ1aWxkZXJXaWR0aCxcclxuICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IyKCBidWlsZGVyWCwgRkJDb25zdGFudHMuQlVJTERFUl9ZIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggY2FyZENvbnRlbnQsIGZ1bmN0aW9uQ3JlYXRvcnMsIGJ1aWxkZXIsIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uQnVpbGRlci5yZWdpc3RlciggJ1BhdHRlcm5zU2NlbmUnLCBQYXR0ZXJuc1NjZW5lICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxVQUFVLE1BQU0scUNBQXFDO0FBQzVELE9BQU9DLGFBQWEsTUFBTSx3Q0FBd0M7QUFDbEUsT0FBT0MsWUFBWSxNQUFNLHVDQUF1QztBQUNoRSxPQUFPQyxVQUFVLE1BQU0scUNBQXFDO0FBQzVELE9BQU9DLFFBQVEsTUFBTSxtQ0FBbUM7QUFDeEQsT0FBT0MsVUFBVSxNQUFNLHFDQUFxQztBQUM1RCxPQUFPQyxhQUFhLE1BQU0sd0NBQXdDO0FBQ2xFLE9BQU9DLGFBQWEsTUFBTSx3Q0FBd0M7QUFDbEUsT0FBT0MsUUFBUSxNQUFNLG1DQUFtQztBQUN4RCxPQUFPQyxlQUFlLE1BQU0sMENBQTBDO0FBQ3RFLE9BQU9DLE9BQU8sTUFBTSxrQ0FBa0M7QUFDdEQsT0FBT0MsWUFBWSxNQUFNLHVDQUF1QztBQUNoRSxPQUFPQyxXQUFXLE1BQU0sNkJBQTZCO0FBQ3JELE9BQU9DLE9BQU8sTUFBTSx1Q0FBdUM7QUFDM0QsT0FBT0MsZUFBZSxNQUFNLGlEQUFpRDtBQUM3RSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLGFBQWEsTUFBTSxvQ0FBb0MsQ0FBQyxDQUFDO0FBQ2hFLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLHNCQUFzQjtBQUN4QyxPQUFPQyxTQUFTLE1BQU0sMEJBQTBCO0FBQ2hELE9BQU9DLFFBQVEsTUFBTSx5QkFBeUI7QUFDOUMsT0FBT0MsU0FBUyxNQUFNLDBCQUEwQjtBQUNoRCxPQUFPQyxNQUFN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