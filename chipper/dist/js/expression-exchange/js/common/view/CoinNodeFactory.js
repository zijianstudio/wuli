// Copyright 2016-2022, University of Colorado Boulder

/**
 * static object that provides functions for creating nodes that represent the coins used in the simulation
 * @author John Blanco
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Circle, Color, Image, Path } from '../../../../scenery/js/imports.js';
import coinX_png from '../../../images/coinX_png.js';
import coinXBack_png from '../../../images/coinXBack_png.js';
import coinXSquared_png from '../../../images/coinXSquared_png.js';
import coinXSquaredBack_png from '../../../images/coinXSquaredBack_png.js';
import coinXSquaredYSquared_png from '../../../images/coinXSquaredYSquared_png.js';
import coinXSquaredYSquaredBack_png from '../../../images/coinXSquaredYSquaredBack_png.js';
import coinXY_png from '../../../images/coinXY_png.js';
import coinXYBack_png from '../../../images/coinXYBack_png.js';
import coinY_png from '../../../images/coinY_png.js';
import coinYBack_png from '../../../images/coinYBack_png.js';
import coinYSquared_png from '../../../images/coinYSquared_png.js';
import coinYSquaredBack_png from '../../../images/coinYSquaredBack_png.js';
import coinZ_png from '../../../images/coinZ_png.js';
import coinZBack_png from '../../../images/coinZBack_png.js';
import expressionExchange from '../../expressionExchange.js';
import EESharedConstants from '../EESharedConstants.js';
import CoinTermTypeID from '../enum/CoinTermTypeID.js';

// constants
const COIN_EDGE_DARKENING_AMOUNT = 0.25;
const COIN_EDGE_STROKE = 0.5;

// maps for coin images (front and back)
const coinFrontImages = {};
coinFrontImages[CoinTermTypeID.X] = coinX_png;
coinFrontImages[CoinTermTypeID.Y] = coinY_png;
coinFrontImages[CoinTermTypeID.Z] = coinZ_png;
coinFrontImages[CoinTermTypeID.X_TIMES_Y] = coinXY_png;
coinFrontImages[CoinTermTypeID.X_SQUARED] = coinXSquared_png;
coinFrontImages[CoinTermTypeID.Y_SQUARED] = coinYSquared_png;
coinFrontImages[CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED] = coinXSquaredYSquared_png;
const coinBackImages = {};
coinBackImages[CoinTermTypeID.X] = coinXBack_png;
coinBackImages[CoinTermTypeID.Y] = coinYBack_png;
coinBackImages[CoinTermTypeID.Z] = coinZBack_png;
coinBackImages[CoinTermTypeID.X_TIMES_Y] = coinXYBack_png;
coinBackImages[CoinTermTypeID.X_SQUARED] = coinXSquaredBack_png;
coinBackImages[CoinTermTypeID.Y_SQUARED] = coinYSquaredBack_png;
coinBackImages[CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED] = coinXSquaredYSquaredBack_png;

// convenience function for drawing round coin shapes
function createRoundCoinIcon(outerCircleRadius, outerCircleColor, innerCircleRadius, innerCircleColor) {
  const outerCircle = new Circle(outerCircleRadius, {
    fill: outerCircleColor,
    stroke: outerCircleColor.colorUtilsDarker(COIN_EDGE_DARKENING_AMOUNT),
    lineWidth: COIN_EDGE_STROKE
  });
  if (innerCircleRadius) {
    outerCircle.addChild(new Circle(innerCircleRadius, {
      fill: innerCircleColor,
      stroke: outerCircleColor.colorUtilsDarker(COIN_EDGE_DARKENING_AMOUNT),
      lineWidth: COIN_EDGE_STROKE
    }));
  }
  return outerCircle;
}

// convenience function for drawing hexagonal coin shapes
function createHexagonalCoinIcon(outerMaxRadius, outerCircleColor, innerCircleRadius, innerCircleColor) {
  const outerShape = new Shape();
  const vector = Vector2.createPolar(outerMaxRadius, Math.PI * -0.25); // angle empirically determined to match coin image
  outerShape.moveToPoint(vector);
  _.times(6, () => {
    vector.rotate(Math.PI / 3);
    outerShape.lineTo(vector.x, vector.y);
  });
  outerShape.close();
  const hexagonalCoinNode = new Path(outerShape, {
    fill: outerCircleColor,
    stroke: outerCircleColor.colorUtilsDarker(COIN_EDGE_DARKENING_AMOUNT),
    lineWidth: COIN_EDGE_STROKE
  });
  if (innerCircleRadius) {
    hexagonalCoinNode.addChild(new Circle(innerCircleRadius, {
      fill: innerCircleColor,
      stroke: outerCircleColor.colorUtilsDarker(COIN_EDGE_DARKENING_AMOUNT),
      lineWidth: COIN_EDGE_STROKE
    }));
  }
  return hexagonalCoinNode;
}

/**
 * static factory object used to create nodes that represent coins
 * @public
 */
const CoinNodeFactory = {
  /**
   * function to create a node that can be used to represents the front of the provided coin type
   * @param {CoinTermTypeID} coinTermTypeID
   * @param {number} radius
   * @param {boolean} isFront - controls whether the image is the front of back of the coin
   * @returns {Node}
   * @public
   */
  createImageNode(coinTermTypeID, radius, isFront) {
    const imageMap = isFront ? coinFrontImages : coinBackImages;
    const imageNode = new Image(imageMap[coinTermTypeID]);

    // scale so that the image node has the specified radius
    imageNode.scale(radius * 2 / imageNode.width);
    return imageNode;
  },
  /**
   * function to create the node that represents the icon for a coin
   * @returns {Node}
   * @param {CoinTermTypeID} coinTermTypeID
   * @param {number} radius
   * @param {Object} [options]
   */
  createIconNode(coinTermTypeID, radius, options) {
    options = options || {};
    let iconNode = null;
    switch (coinTermTypeID) {
      case CoinTermTypeID.X:
        iconNode = createRoundCoinIcon(radius, new Color(222, 117, 96));
        break;
      case CoinTermTypeID.Y:
        iconNode = createRoundCoinIcon(radius, new Color(189, 189, 191));
        break;
      case CoinTermTypeID.Z:
        iconNode = createRoundCoinIcon(radius, new Color(238, 203, 24), radius / 4, new Color(EESharedConstants.CONTROL_PANEL_BACKGROUND_COLOR));
        break;
      case CoinTermTypeID.X_TIMES_Y:
        iconNode = createRoundCoinIcon(radius, new Color(204, 180, 45), radius * 0.7, new Color(238, 238, 240));
        break;
      case CoinTermTypeID.X_SQUARED:
        iconNode = createRoundCoinIcon(radius, new Color(217, 115, 93), radius * 0.8, new Color(170, 84, 65));
        break;
      case CoinTermTypeID.Y_SQUARED:
        iconNode = createRoundCoinIcon(radius, new Color(221, 219, 219), radius * 0.7, new Color(206, 180, 44));
        break;
      case CoinTermTypeID.X_SQUARED_TIMES_Y_SQUARED:
        iconNode = createHexagonalCoinIcon(radius, new Color(206, 180, 44), radius * 0.7, new Color(225, 191, 46));
        break;
      case CoinTermTypeID.CONSTANT:
        // this should never be depicted as a coin, so add something garish so that we'll notice if it is
        iconNode = new Circle(radius, {
          fill: 'pink',
          stroke: 'red'
        });
        break;
      default:
        assert && assert(false, 'unknown coin term type');
    }
    iconNode.mutate(options);
    return iconNode;
  }
};
expressionExchange.register('CoinNodeFactory', CoinNodeFactory);
export default CoinNodeFactory;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU2hhcGUiLCJDaXJjbGUiLCJDb2xvciIsIkltYWdlIiwiUGF0aCIsImNvaW5YX3BuZyIsImNvaW5YQmFja19wbmciLCJjb2luWFNxdWFyZWRfcG5nIiwiY29pblhTcXVhcmVkQmFja19wbmciLCJjb2luWFNxdWFyZWRZU3F1YXJlZF9wbmciLCJjb2luWFNxdWFyZWRZU3F1YXJlZEJhY2tfcG5nIiwiY29pblhZX3BuZyIsImNvaW5YWUJhY2tfcG5nIiwiY29pbllfcG5nIiwiY29pbllCYWNrX3BuZyIsImNvaW5ZU3F1YXJlZF9wbmciLCJjb2luWVNxdWFyZWRCYWNrX3BuZyIsImNvaW5aX3BuZyIsImNvaW5aQmFja19wbmciLCJleHByZXNzaW9uRXhjaGFuZ2UiLCJFRVNoYXJlZENvbnN0YW50cyIsIkNvaW5UZXJtVHlwZUlEIiwiQ09JTl9FREdFX0RBUktFTklOR19BTU9VTlQiLCJDT0lOX0VER0VfU1RST0tFIiwiY29pbkZyb250SW1hZ2VzIiwiWCIsIlkiLCJaIiwiWF9USU1FU19ZIiwiWF9TUVVBUkVEIiwiWV9TUVVBUkVEIiwiWF9TUVVBUkVEX1RJTUVTX1lfU1FVQVJFRCIsImNvaW5CYWNrSW1hZ2VzIiwiY3JlYXRlUm91bmRDb2luSWNvbiIsIm91dGVyQ2lyY2xlUmFkaXVzIiwib3V0ZXJDaXJjbGVDb2xvciIsImlubmVyQ2lyY2xlUmFkaXVzIiwiaW5uZXJDaXJjbGVDb2xvciIsIm91dGVyQ2lyY2xlIiwiZmlsbCIsInN0cm9rZSIsImNvbG9yVXRpbHNEYXJrZXIiLCJsaW5lV2lkdGgiLCJhZGRDaGlsZCIsImNyZWF0ZUhleGFnb25hbENvaW5JY29uIiwib3V0ZXJNYXhSYWRpdXMiLCJvdXRlclNoYXBlIiwidmVjdG9yIiwiY3JlYXRlUG9sYXIiLCJNYXRoIiwiUEkiLCJtb3ZlVG9Qb2ludCIsIl8iLCJ0aW1lcyIsInJvdGF0ZSIsImxpbmVUbyIsIngiLCJ5IiwiY2xvc2UiLCJoZXhhZ29uYWxDb2luTm9kZSIsIkNvaW5Ob2RlRmFjdG9yeSIsImNyZWF0ZUltYWdlTm9kZSIsImNvaW5UZXJtVHlwZUlEIiwicmFkaXVzIiwiaXNGcm9udCIsImltYWdlTWFwIiwiaW1hZ2VOb2RlIiwic2NhbGUiLCJ3aWR0aCIsImNyZWF0ZUljb25Ob2RlIiwib3B0aW9ucyIsImljb25Ob2RlIiwiQ09OVFJPTF9QQU5FTF9CQUNLR1JPVU5EX0NPTE9SIiwiQ09OU1RBTlQiLCJhc3NlcnQiLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvaW5Ob2RlRmFjdG9yeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBzdGF0aWMgb2JqZWN0IHRoYXQgcHJvdmlkZXMgZnVuY3Rpb25zIGZvciBjcmVhdGluZyBub2RlcyB0aGF0IHJlcHJlc2VudCB0aGUgY29pbnMgdXNlZCBpbiB0aGUgc2ltdWxhdGlvblxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB7IENpcmNsZSwgQ29sb3IsIEltYWdlLCBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGNvaW5YX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvY29pblhfcG5nLmpzJztcclxuaW1wb3J0IGNvaW5YQmFja19wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2NvaW5YQmFja19wbmcuanMnO1xyXG5pbXBvcnQgY29pblhTcXVhcmVkX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvY29pblhTcXVhcmVkX3BuZy5qcyc7XHJcbmltcG9ydCBjb2luWFNxdWFyZWRCYWNrX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvY29pblhTcXVhcmVkQmFja19wbmcuanMnO1xyXG5pbXBvcnQgY29pblhTcXVhcmVkWVNxdWFyZWRfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9jb2luWFNxdWFyZWRZU3F1YXJlZF9wbmcuanMnO1xyXG5pbXBvcnQgY29pblhTcXVhcmVkWVNxdWFyZWRCYWNrX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvY29pblhTcXVhcmVkWVNxdWFyZWRCYWNrX3BuZy5qcyc7XHJcbmltcG9ydCBjb2luWFlfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9jb2luWFlfcG5nLmpzJztcclxuaW1wb3J0IGNvaW5YWUJhY2tfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9jb2luWFlCYWNrX3BuZy5qcyc7XHJcbmltcG9ydCBjb2luWV9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2NvaW5ZX3BuZy5qcyc7XHJcbmltcG9ydCBjb2luWUJhY2tfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9jb2luWUJhY2tfcG5nLmpzJztcclxuaW1wb3J0IGNvaW5ZU3F1YXJlZF9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2NvaW5ZU3F1YXJlZF9wbmcuanMnO1xyXG5pbXBvcnQgY29pbllTcXVhcmVkQmFja19wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2NvaW5ZU3F1YXJlZEJhY2tfcG5nLmpzJztcclxuaW1wb3J0IGNvaW5aX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvY29pblpfcG5nLmpzJztcclxuaW1wb3J0IGNvaW5aQmFja19wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2NvaW5aQmFja19wbmcuanMnO1xyXG5pbXBvcnQgZXhwcmVzc2lvbkV4Y2hhbmdlIGZyb20gJy4uLy4uL2V4cHJlc3Npb25FeGNoYW5nZS5qcyc7XHJcbmltcG9ydCBFRVNoYXJlZENvbnN0YW50cyBmcm9tICcuLi9FRVNoYXJlZENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBDb2luVGVybVR5cGVJRCBmcm9tICcuLi9lbnVtL0NvaW5UZXJtVHlwZUlELmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBDT0lOX0VER0VfREFSS0VOSU5HX0FNT1VOVCA9IDAuMjU7XHJcbmNvbnN0IENPSU5fRURHRV9TVFJPS0UgPSAwLjU7XHJcblxyXG4vLyBtYXBzIGZvciBjb2luIGltYWdlcyAoZnJvbnQgYW5kIGJhY2spXHJcbmNvbnN0IGNvaW5Gcm9udEltYWdlcyA9IHt9O1xyXG5jb2luRnJvbnRJbWFnZXNbIENvaW5UZXJtVHlwZUlELlggXSA9IGNvaW5YX3BuZztcclxuY29pbkZyb250SW1hZ2VzWyBDb2luVGVybVR5cGVJRC5ZIF0gPSBjb2luWV9wbmc7XHJcbmNvaW5Gcm9udEltYWdlc1sgQ29pblRlcm1UeXBlSUQuWiBdID0gY29pblpfcG5nO1xyXG5jb2luRnJvbnRJbWFnZXNbIENvaW5UZXJtVHlwZUlELlhfVElNRVNfWSBdID0gY29pblhZX3BuZztcclxuY29pbkZyb250SW1hZ2VzWyBDb2luVGVybVR5cGVJRC5YX1NRVUFSRUQgXSA9IGNvaW5YU3F1YXJlZF9wbmc7XHJcbmNvaW5Gcm9udEltYWdlc1sgQ29pblRlcm1UeXBlSUQuWV9TUVVBUkVEIF0gPSBjb2luWVNxdWFyZWRfcG5nO1xyXG5jb2luRnJvbnRJbWFnZXNbIENvaW5UZXJtVHlwZUlELlhfU1FVQVJFRF9USU1FU19ZX1NRVUFSRUQgXSA9IGNvaW5YU3F1YXJlZFlTcXVhcmVkX3BuZztcclxuY29uc3QgY29pbkJhY2tJbWFnZXMgPSB7fTtcclxuY29pbkJhY2tJbWFnZXNbIENvaW5UZXJtVHlwZUlELlggXSA9IGNvaW5YQmFja19wbmc7XHJcbmNvaW5CYWNrSW1hZ2VzWyBDb2luVGVybVR5cGVJRC5ZIF0gPSBjb2luWUJhY2tfcG5nO1xyXG5jb2luQmFja0ltYWdlc1sgQ29pblRlcm1UeXBlSUQuWiBdID0gY29pblpCYWNrX3BuZztcclxuY29pbkJhY2tJbWFnZXNbIENvaW5UZXJtVHlwZUlELlhfVElNRVNfWSBdID0gY29pblhZQmFja19wbmc7XHJcbmNvaW5CYWNrSW1hZ2VzWyBDb2luVGVybVR5cGVJRC5YX1NRVUFSRUQgXSA9IGNvaW5YU3F1YXJlZEJhY2tfcG5nO1xyXG5jb2luQmFja0ltYWdlc1sgQ29pblRlcm1UeXBlSUQuWV9TUVVBUkVEIF0gPSBjb2luWVNxdWFyZWRCYWNrX3BuZztcclxuY29pbkJhY2tJbWFnZXNbIENvaW5UZXJtVHlwZUlELlhfU1FVQVJFRF9USU1FU19ZX1NRVUFSRUQgXSA9IGNvaW5YU3F1YXJlZFlTcXVhcmVkQmFja19wbmc7XHJcblxyXG4vLyBjb252ZW5pZW5jZSBmdW5jdGlvbiBmb3IgZHJhd2luZyByb3VuZCBjb2luIHNoYXBlc1xyXG5mdW5jdGlvbiBjcmVhdGVSb3VuZENvaW5JY29uKCBvdXRlckNpcmNsZVJhZGl1cywgb3V0ZXJDaXJjbGVDb2xvciwgaW5uZXJDaXJjbGVSYWRpdXMsIGlubmVyQ2lyY2xlQ29sb3IgKSB7XHJcblxyXG4gIGNvbnN0IG91dGVyQ2lyY2xlID0gbmV3IENpcmNsZSggb3V0ZXJDaXJjbGVSYWRpdXMsIHtcclxuICAgIGZpbGw6IG91dGVyQ2lyY2xlQ29sb3IsXHJcbiAgICBzdHJva2U6IG91dGVyQ2lyY2xlQ29sb3IuY29sb3JVdGlsc0RhcmtlciggQ09JTl9FREdFX0RBUktFTklOR19BTU9VTlQgKSxcclxuICAgIGxpbmVXaWR0aDogQ09JTl9FREdFX1NUUk9LRVxyXG4gIH0gKTtcclxuXHJcbiAgaWYgKCBpbm5lckNpcmNsZVJhZGl1cyApIHtcclxuICAgIG91dGVyQ2lyY2xlLmFkZENoaWxkKCBuZXcgQ2lyY2xlKCBpbm5lckNpcmNsZVJhZGl1cywge1xyXG4gICAgICBmaWxsOiBpbm5lckNpcmNsZUNvbG9yLFxyXG4gICAgICBzdHJva2U6IG91dGVyQ2lyY2xlQ29sb3IuY29sb3JVdGlsc0RhcmtlciggQ09JTl9FREdFX0RBUktFTklOR19BTU9VTlQgKSxcclxuICAgICAgbGluZVdpZHRoOiBDT0lOX0VER0VfU1RST0tFXHJcbiAgICB9ICkgKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBvdXRlckNpcmNsZTtcclxufVxyXG5cclxuLy8gY29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIGRyYXdpbmcgaGV4YWdvbmFsIGNvaW4gc2hhcGVzXHJcbmZ1bmN0aW9uIGNyZWF0ZUhleGFnb25hbENvaW5JY29uKCBvdXRlck1heFJhZGl1cywgb3V0ZXJDaXJjbGVDb2xvciwgaW5uZXJDaXJjbGVSYWRpdXMsIGlubmVyQ2lyY2xlQ29sb3IgKSB7XHJcblxyXG4gIGNvbnN0IG91dGVyU2hhcGUgPSBuZXcgU2hhcGUoKTtcclxuICBjb25zdCB2ZWN0b3IgPSBWZWN0b3IyLmNyZWF0ZVBvbGFyKCBvdXRlck1heFJhZGl1cywgTWF0aC5QSSAqIC0wLjI1ICk7IC8vIGFuZ2xlIGVtcGlyaWNhbGx5IGRldGVybWluZWQgdG8gbWF0Y2ggY29pbiBpbWFnZVxyXG4gIG91dGVyU2hhcGUubW92ZVRvUG9pbnQoIHZlY3RvciApO1xyXG5cclxuICBfLnRpbWVzKCA2LCAoKSA9PiB7XHJcbiAgICB2ZWN0b3Iucm90YXRlKCBNYXRoLlBJIC8gMyApO1xyXG4gICAgb3V0ZXJTaGFwZS5saW5lVG8oIHZlY3Rvci54LCB2ZWN0b3IueSApO1xyXG4gIH0gKTtcclxuICBvdXRlclNoYXBlLmNsb3NlKCk7XHJcblxyXG4gIGNvbnN0IGhleGFnb25hbENvaW5Ob2RlID0gbmV3IFBhdGgoIG91dGVyU2hhcGUsIHtcclxuICAgIGZpbGw6IG91dGVyQ2lyY2xlQ29sb3IsXHJcbiAgICBzdHJva2U6IG91dGVyQ2lyY2xlQ29sb3IuY29sb3JVdGlsc0RhcmtlciggQ09JTl9FREdFX0RBUktFTklOR19BTU9VTlQgKSxcclxuICAgIGxpbmVXaWR0aDogQ09JTl9FREdFX1NUUk9LRVxyXG4gIH0gKTtcclxuXHJcbiAgaWYgKCBpbm5lckNpcmNsZVJhZGl1cyApIHtcclxuICAgIGhleGFnb25hbENvaW5Ob2RlLmFkZENoaWxkKCBuZXcgQ2lyY2xlKCBpbm5lckNpcmNsZVJhZGl1cywge1xyXG4gICAgICBmaWxsOiBpbm5lckNpcmNsZUNvbG9yLFxyXG4gICAgICBzdHJva2U6IG91dGVyQ2lyY2xlQ29sb3IuY29sb3JVdGlsc0RhcmtlciggQ09JTl9FREdFX0RBUktFTklOR19BTU9VTlQgKSxcclxuICAgICAgbGluZVdpZHRoOiBDT0lOX0VER0VfU1RST0tFXHJcbiAgICB9ICkgKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBoZXhhZ29uYWxDb2luTm9kZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIHN0YXRpYyBmYWN0b3J5IG9iamVjdCB1c2VkIHRvIGNyZWF0ZSBub2RlcyB0aGF0IHJlcHJlc2VudCBjb2luc1xyXG4gKiBAcHVibGljXHJcbiAqL1xyXG5jb25zdCBDb2luTm9kZUZhY3RvcnkgPSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIG5vZGUgdGhhdCBjYW4gYmUgdXNlZCB0byByZXByZXNlbnRzIHRoZSBmcm9udCBvZiB0aGUgcHJvdmlkZWQgY29pbiB0eXBlXHJcbiAgICogQHBhcmFtIHtDb2luVGVybVR5cGVJRH0gY29pblRlcm1UeXBlSURcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0Zyb250IC0gY29udHJvbHMgd2hldGhlciB0aGUgaW1hZ2UgaXMgdGhlIGZyb250IG9mIGJhY2sgb2YgdGhlIGNvaW5cclxuICAgKiBAcmV0dXJucyB7Tm9kZX1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY3JlYXRlSW1hZ2VOb2RlKCBjb2luVGVybVR5cGVJRCwgcmFkaXVzLCBpc0Zyb250ICkge1xyXG5cclxuICAgIGNvbnN0IGltYWdlTWFwID0gaXNGcm9udCA/IGNvaW5Gcm9udEltYWdlcyA6IGNvaW5CYWNrSW1hZ2VzO1xyXG4gICAgY29uc3QgaW1hZ2VOb2RlID0gbmV3IEltYWdlKCBpbWFnZU1hcFsgY29pblRlcm1UeXBlSUQgXSApO1xyXG5cclxuICAgIC8vIHNjYWxlIHNvIHRoYXQgdGhlIGltYWdlIG5vZGUgaGFzIHRoZSBzcGVjaWZpZWQgcmFkaXVzXHJcbiAgICBpbWFnZU5vZGUuc2NhbGUoIHJhZGl1cyAqIDIgLyBpbWFnZU5vZGUud2lkdGggKTtcclxuXHJcbiAgICByZXR1cm4gaW1hZ2VOb2RlO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIGZ1bmN0aW9uIHRvIGNyZWF0ZSB0aGUgbm9kZSB0aGF0IHJlcHJlc2VudHMgdGhlIGljb24gZm9yIGEgY29pblxyXG4gICAqIEByZXR1cm5zIHtOb2RlfVxyXG4gICAqIEBwYXJhbSB7Q29pblRlcm1UeXBlSUR9IGNvaW5UZXJtVHlwZUlEXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1c1xyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjcmVhdGVJY29uTm9kZSggY29pblRlcm1UeXBlSUQsIHJhZGl1cywgb3B0aW9ucyApIHtcclxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xyXG5cclxuICAgIGxldCBpY29uTm9kZSA9IG51bGw7XHJcblxyXG4gICAgc3dpdGNoKCBjb2luVGVybVR5cGVJRCApIHtcclxuXHJcbiAgICAgIGNhc2UgQ29pblRlcm1UeXBlSUQuWDpcclxuICAgICAgICBpY29uTm9kZSA9IGNyZWF0ZVJvdW5kQ29pbkljb24oIHJhZGl1cywgbmV3IENvbG9yKCAyMjIsIDExNywgOTYgKSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSBDb2luVGVybVR5cGVJRC5ZOlxyXG4gICAgICAgIGljb25Ob2RlID0gY3JlYXRlUm91bmRDb2luSWNvbiggcmFkaXVzLCBuZXcgQ29sb3IoIDE4OSwgMTg5LCAxOTEgKSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSBDb2luVGVybVR5cGVJRC5aOlxyXG4gICAgICAgIGljb25Ob2RlID0gY3JlYXRlUm91bmRDb2luSWNvbihcclxuICAgICAgICAgIHJhZGl1cyxcclxuICAgICAgICAgIG5ldyBDb2xvciggMjM4LCAyMDMsIDI0ICksXHJcbiAgICAgICAgICByYWRpdXMgLyA0LFxyXG4gICAgICAgICAgbmV3IENvbG9yKCBFRVNoYXJlZENvbnN0YW50cy5DT05UUk9MX1BBTkVMX0JBQ0tHUk9VTkRfQ09MT1IgKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIENvaW5UZXJtVHlwZUlELlhfVElNRVNfWTpcclxuICAgICAgICBpY29uTm9kZSA9IGNyZWF0ZVJvdW5kQ29pbkljb24oXHJcbiAgICAgICAgICByYWRpdXMsXHJcbiAgICAgICAgICBuZXcgQ29sb3IoIDIwNCwgMTgwLCA0NSApLFxyXG4gICAgICAgICAgcmFkaXVzICogMC43LFxyXG4gICAgICAgICAgbmV3IENvbG9yKCAyMzgsIDIzOCwgMjQwIClcclxuICAgICAgICApO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSBDb2luVGVybVR5cGVJRC5YX1NRVUFSRUQ6XHJcbiAgICAgICAgaWNvbk5vZGUgPSBjcmVhdGVSb3VuZENvaW5JY29uKFxyXG4gICAgICAgICAgcmFkaXVzLFxyXG4gICAgICAgICAgbmV3IENvbG9yKCAyMTcsIDExNSwgOTMgKSxcclxuICAgICAgICAgIHJhZGl1cyAqIDAuOCxcclxuICAgICAgICAgIG5ldyBDb2xvciggMTcwLCA4NCwgNjUgKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIENvaW5UZXJtVHlwZUlELllfU1FVQVJFRDpcclxuICAgICAgICBpY29uTm9kZSA9IGNyZWF0ZVJvdW5kQ29pbkljb24oXHJcbiAgICAgICAgICByYWRpdXMsXHJcbiAgICAgICAgICBuZXcgQ29sb3IoIDIyMSwgMjE5LCAyMTkgKSxcclxuICAgICAgICAgIHJhZGl1cyAqIDAuNyxcclxuICAgICAgICAgIG5ldyBDb2xvciggMjA2LCAxODAsIDQ0IClcclxuICAgICAgICApO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSBDb2luVGVybVR5cGVJRC5YX1NRVUFSRURfVElNRVNfWV9TUVVBUkVEOlxyXG4gICAgICAgIGljb25Ob2RlID0gY3JlYXRlSGV4YWdvbmFsQ29pbkljb24oXHJcbiAgICAgICAgICByYWRpdXMsXHJcbiAgICAgICAgICBuZXcgQ29sb3IoIDIwNiwgMTgwLCA0NCApLFxyXG4gICAgICAgICAgcmFkaXVzICogMC43LFxyXG4gICAgICAgICAgbmV3IENvbG9yKCAyMjUsIDE5MSwgNDYgKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIENvaW5UZXJtVHlwZUlELkNPTlNUQU5UOlxyXG4gICAgICAgIC8vIHRoaXMgc2hvdWxkIG5ldmVyIGJlIGRlcGljdGVkIGFzIGEgY29pbiwgc28gYWRkIHNvbWV0aGluZyBnYXJpc2ggc28gdGhhdCB3ZSdsbCBub3RpY2UgaWYgaXQgaXNcclxuICAgICAgICBpY29uTm9kZSA9IG5ldyBDaXJjbGUoIHJhZGl1cywgeyBmaWxsOiAncGluaycsIHN0cm9rZTogJ3JlZCcgfSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ3Vua25vd24gY29pbiB0ZXJtIHR5cGUnICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWNvbk5vZGUubXV0YXRlKCBvcHRpb25zICk7XHJcbiAgICByZXR1cm4gaWNvbk5vZGU7XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwcmVzc2lvbkV4Y2hhbmdlLnJlZ2lzdGVyKCAnQ29pbk5vZGVGYWN0b3J5JywgQ29pbk5vZGVGYWN0b3J5ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDb2luTm9kZUZhY3Rvcnk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsU0FBU0MsTUFBTSxFQUFFQyxLQUFLLEVBQUVDLEtBQUssRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM5RSxPQUFPQyxTQUFTLE1BQU0sOEJBQThCO0FBQ3BELE9BQU9DLGFBQWEsTUFBTSxrQ0FBa0M7QUFDNUQsT0FBT0MsZ0JBQWdCLE1BQU0scUNBQXFDO0FBQ2xFLE9BQU9DLG9CQUFvQixNQUFNLHlDQUF5QztBQUMxRSxPQUFPQyx3QkFBd0IsTUFBTSw2Q0FBNkM7QUFDbEYsT0FBT0MsNEJBQTRCLE1BQU0saURBQWlEO0FBQzFGLE9BQU9DLFVBQVUsTUFBTSwrQkFBK0I7QUFDdEQsT0FBT0MsY0FBYyxNQUFNLG1DQUFtQztBQUM5RCxPQUFPQyxTQUFTLE1BQU0sOEJBQThCO0FBQ3BELE9BQU9DLGFBQWEsTUFBTSxrQ0FBa0M7QUFDNUQsT0FBT0MsZ0JBQWdCLE1BQU0scUNBQXFDO0FBQ2xFLE9BQU9DLG9CQUFvQixNQUFNLHlDQUF5QztBQUMxRSxPQUFPQyxTQUFTLE1BQU0sOEJBQThCO0FBQ3BELE9BQU9DLGFBQWEsTUFBTSxrQ0FBa0M7QUFDNUQsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBQzVELE9BQU9DLGlCQUFpQixNQUFNLHlCQUF5QjtBQUN2RCxPQUFPQyxjQUFjLE1BQU0sMkJBQTJCOztBQUV0RDtBQUNBLE1BQU1DLDBCQUEwQixHQUFHLElBQUk7QUFDdkMsTUFBTUMsZ0JBQWdCLEdBQUcsR0FBRzs7QUFFNUI7QUFDQSxNQUFNQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO0FBQzFCQSxlQUFlLENBQUVILGNBQWMsQ0FBQ0ksQ0FBQyxDQUFFLEdBQUdwQixTQUFTO0FBQy9DbUIsZUFBZSxDQUFFSCxjQUFjLENBQUNLLENBQUMsQ0FBRSxHQUFHYixTQUFTO0FBQy9DVyxlQUFlLENBQUVILGNBQWMsQ0FBQ00sQ0FBQyxDQUFFLEdBQUdWLFNBQVM7QUFDL0NPLGVBQWUsQ0FBRUgsY0FBYyxDQUFDTyxTQUFTLENBQUUsR0FBR2pCLFVBQVU7QUFDeERhLGVBQWUsQ0FBRUgsY0FBYyxDQUFDUSxTQUFTLENBQUUsR0FBR3RCLGdCQUFnQjtBQUM5RGlCLGVBQWUsQ0FBRUgsY0FBYyxDQUFDUyxTQUFTLENBQUUsR0FBR2YsZ0JBQWdCO0FBQzlEUyxlQUFlLENBQUVILGNBQWMsQ0FBQ1UseUJBQXlCLENBQUUsR0FBR3RCLHdCQUF3QjtBQUN0RixNQUFNdUIsY0FBYyxHQUFHLENBQUMsQ0FBQztBQUN6QkEsY0FBYyxDQUFFWCxjQUFjLENBQUNJLENBQUMsQ0FBRSxHQUFHbkIsYUFBYTtBQUNsRDBCLGNBQWMsQ0FBRVgsY0FBYyxDQUFDSyxDQUFDLENBQUUsR0FBR1osYUFBYTtBQUNsRGtCLGNBQWMsQ0FBRVgsY0FBYyxDQUFDTSxDQUFDLENBQUUsR0FBR1QsYUFBYTtBQUNsRGMsY0FBYyxDQUFFWCxjQUFjLENBQUNPLFNBQVMsQ0FBRSxHQUFHaEIsY0FBYztBQUMzRG9CLGNBQWMsQ0FBRVgsY0FBYyxDQUFDUSxTQUFTLENBQUUsR0FBR3JCLG9CQUFvQjtBQUNqRXdCLGNBQWMsQ0FBRVgsY0FBYyxDQUFDUyxTQUFTLENBQUUsR0FBR2Qsb0JBQW9CO0FBQ2pFZ0IsY0FBYyxDQUFFWCxjQUFjLENBQUNVLHlCQUF5QixDQUFFLEdBQUdyQiw0QkFBNEI7O0FBRXpGO0FBQ0EsU0FBU3VCLG1CQUFtQkEsQ0FBRUMsaUJBQWlCLEVBQUVDLGdCQUFnQixFQUFFQyxpQkFBaUIsRUFBRUMsZ0JBQWdCLEVBQUc7RUFFdkcsTUFBTUMsV0FBVyxHQUFHLElBQUlyQyxNQUFNLENBQUVpQyxpQkFBaUIsRUFBRTtJQUNqREssSUFBSSxFQUFFSixnQkFBZ0I7SUFDdEJLLE1BQU0sRUFBRUwsZ0JBQWdCLENBQUNNLGdCQUFnQixDQUFFbkIsMEJBQTJCLENBQUM7SUFDdkVvQixTQUFTLEVBQUVuQjtFQUNiLENBQUUsQ0FBQztFQUVILElBQUthLGlCQUFpQixFQUFHO0lBQ3ZCRSxXQUFXLENBQUNLLFFBQVEsQ0FBRSxJQUFJMUMsTUFBTSxDQUFFbUMsaUJBQWlCLEVBQUU7TUFDbkRHLElBQUksRUFBRUYsZ0JBQWdCO01BQ3RCRyxNQUFNLEVBQUVMLGdCQUFnQixDQUFDTSxnQkFBZ0IsQ0FBRW5CLDBCQUEyQixDQUFDO01BQ3ZFb0IsU0FBUyxFQUFFbkI7SUFDYixDQUFFLENBQUUsQ0FBQztFQUNQO0VBRUEsT0FBT2UsV0FBVztBQUNwQjs7QUFFQTtBQUNBLFNBQVNNLHVCQUF1QkEsQ0FBRUMsY0FBYyxFQUFFVixnQkFBZ0IsRUFBRUMsaUJBQWlCLEVBQUVDLGdCQUFnQixFQUFHO0VBRXhHLE1BQU1TLFVBQVUsR0FBRyxJQUFJOUMsS0FBSyxDQUFDLENBQUM7RUFDOUIsTUFBTStDLE1BQU0sR0FBR2hELE9BQU8sQ0FBQ2lELFdBQVcsQ0FBRUgsY0FBYyxFQUFFSSxJQUFJLENBQUNDLEVBQUUsR0FBRyxDQUFDLElBQUssQ0FBQyxDQUFDLENBQUM7RUFDdkVKLFVBQVUsQ0FBQ0ssV0FBVyxDQUFFSixNQUFPLENBQUM7RUFFaENLLENBQUMsQ0FBQ0MsS0FBSyxDQUFFLENBQUMsRUFBRSxNQUFNO0lBQ2hCTixNQUFNLENBQUNPLE1BQU0sQ0FBRUwsSUFBSSxDQUFDQyxFQUFFLEdBQUcsQ0FBRSxDQUFDO0lBQzVCSixVQUFVLENBQUNTLE1BQU0sQ0FBRVIsTUFBTSxDQUFDUyxDQUFDLEVBQUVULE1BQU0sQ0FBQ1UsQ0FBRSxDQUFDO0VBQ3pDLENBQUUsQ0FBQztFQUNIWCxVQUFVLENBQUNZLEtBQUssQ0FBQyxDQUFDO0VBRWxCLE1BQU1DLGlCQUFpQixHQUFHLElBQUl2RCxJQUFJLENBQUUwQyxVQUFVLEVBQUU7SUFDOUNQLElBQUksRUFBRUosZ0JBQWdCO0lBQ3RCSyxNQUFNLEVBQUVMLGdCQUFnQixDQUFDTSxnQkFBZ0IsQ0FBRW5CLDBCQUEyQixDQUFDO0lBQ3ZFb0IsU0FBUyxFQUFFbkI7RUFDYixDQUFFLENBQUM7RUFFSCxJQUFLYSxpQkFBaUIsRUFBRztJQUN2QnVCLGlCQUFpQixDQUFDaEIsUUFBUSxDQUFFLElBQUkxQyxNQUFNLENBQUVtQyxpQkFBaUIsRUFBRTtNQUN6REcsSUFBSSxFQUFFRixnQkFBZ0I7TUFDdEJHLE1BQU0sRUFBRUwsZ0JBQWdCLENBQUNNLGdCQUFnQixDQUFFbkIsMEJBQTJCLENBQUM7TUFDdkVvQixTQUFTLEVBQUVuQjtJQUNiLENBQUUsQ0FBRSxDQUFDO0VBQ1A7RUFFQSxPQUFPb0MsaUJBQWlCO0FBQzFCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTUMsZUFBZSxHQUFHO0VBRXRCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsZUFBZUEsQ0FBRUMsY0FBYyxFQUFFQyxNQUFNLEVBQUVDLE9BQU8sRUFBRztJQUVqRCxNQUFNQyxRQUFRLEdBQUdELE9BQU8sR0FBR3hDLGVBQWUsR0FBR1EsY0FBYztJQUMzRCxNQUFNa0MsU0FBUyxHQUFHLElBQUkvRCxLQUFLLENBQUU4RCxRQUFRLENBQUVILGNBQWMsQ0FBRyxDQUFDOztJQUV6RDtJQUNBSSxTQUFTLENBQUNDLEtBQUssQ0FBRUosTUFBTSxHQUFHLENBQUMsR0FBR0csU0FBUyxDQUFDRSxLQUFNLENBQUM7SUFFL0MsT0FBT0YsU0FBUztFQUNsQixDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUcsY0FBY0EsQ0FBRVAsY0FBYyxFQUFFQyxNQUFNLEVBQUVPLE9BQU8sRUFBRztJQUNoREEsT0FBTyxHQUFHQSxPQUFPLElBQUksQ0FBQyxDQUFDO0lBRXZCLElBQUlDLFFBQVEsR0FBRyxJQUFJO0lBRW5CLFFBQVFULGNBQWM7TUFFcEIsS0FBS3pDLGNBQWMsQ0FBQ0ksQ0FBQztRQUNuQjhDLFFBQVEsR0FBR3RDLG1CQUFtQixDQUFFOEIsTUFBTSxFQUFFLElBQUk3RCxLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFHLENBQUUsQ0FBQztRQUNuRTtNQUVGLEtBQUttQixjQUFjLENBQUNLLENBQUM7UUFDbkI2QyxRQUFRLEdBQUd0QyxtQkFBbUIsQ0FBRThCLE1BQU0sRUFBRSxJQUFJN0QsS0FBSyxDQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBSSxDQUFFLENBQUM7UUFDcEU7TUFFRixLQUFLbUIsY0FBYyxDQUFDTSxDQUFDO1FBQ25CNEMsUUFBUSxHQUFHdEMsbUJBQW1CLENBQzVCOEIsTUFBTSxFQUNOLElBQUk3RCxLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFHLENBQUMsRUFDekI2RCxNQUFNLEdBQUcsQ0FBQyxFQUNWLElBQUk3RCxLQUFLLENBQUVrQixpQkFBaUIsQ0FBQ29ELDhCQUErQixDQUM5RCxDQUFDO1FBQ0Q7TUFFRixLQUFLbkQsY0FBYyxDQUFDTyxTQUFTO1FBQzNCMkMsUUFBUSxHQUFHdEMsbUJBQW1CLENBQzVCOEIsTUFBTSxFQUNOLElBQUk3RCxLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFHLENBQUMsRUFDekI2RCxNQUFNLEdBQUcsR0FBRyxFQUNaLElBQUk3RCxLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFJLENBQzNCLENBQUM7UUFDRDtNQUVGLEtBQUttQixjQUFjLENBQUNRLFNBQVM7UUFDM0IwQyxRQUFRLEdBQUd0QyxtQkFBbUIsQ0FDNUI4QixNQUFNLEVBQ04sSUFBSTdELEtBQUssQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUcsQ0FBQyxFQUN6QjZELE1BQU0sR0FBRyxHQUFHLEVBQ1osSUFBSTdELEtBQUssQ0FBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUcsQ0FDekIsQ0FBQztRQUNEO01BRUYsS0FBS21CLGNBQWMsQ0FBQ1MsU0FBUztRQUMzQnlDLFFBQVEsR0FBR3RDLG1CQUFtQixDQUM1QjhCLE1BQU0sRUFDTixJQUFJN0QsS0FBSyxDQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBSSxDQUFDLEVBQzFCNkQsTUFBTSxHQUFHLEdBQUcsRUFDWixJQUFJN0QsS0FBSyxDQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRyxDQUMxQixDQUFDO1FBQ0Q7TUFFRixLQUFLbUIsY0FBYyxDQUFDVSx5QkFBeUI7UUFDM0N3QyxRQUFRLEdBQUczQix1QkFBdUIsQ0FDaENtQixNQUFNLEVBQ04sSUFBSTdELEtBQUssQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUcsQ0FBQyxFQUN6QjZELE1BQU0sR0FBRyxHQUFHLEVBQ1osSUFBSTdELEtBQUssQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUcsQ0FDMUIsQ0FBQztRQUNEO01BRUYsS0FBS21CLGNBQWMsQ0FBQ29ELFFBQVE7UUFDMUI7UUFDQUYsUUFBUSxHQUFHLElBQUl0RSxNQUFNLENBQUU4RCxNQUFNLEVBQUU7VUFBRXhCLElBQUksRUFBRSxNQUFNO1VBQUVDLE1BQU0sRUFBRTtRQUFNLENBQUUsQ0FBQztRQUNoRTtNQUVGO1FBQ0VrQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsd0JBQXlCLENBQUM7SUFDdkQ7SUFFQUgsUUFBUSxDQUFDSSxNQUFNLENBQUVMLE9BQVEsQ0FBQztJQUMxQixPQUFPQyxRQUFRO0VBQ2pCO0FBQ0YsQ0FBQztBQUVEcEQsa0JBQWtCLENBQUN5RCxRQUFRLENBQUUsaUJBQWlCLEVBQUVoQixlQUFnQixDQUFDO0FBRWpFLGVBQWVBLGVBQWUifQ==