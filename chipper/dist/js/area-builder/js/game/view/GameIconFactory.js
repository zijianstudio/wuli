// Copyright 2014-2021, University of Colorado Boulder

/**
 * Static factory for creating the number-on-a-grid icons used in the level selection screen of the Area Builder game.
 *
 * @author John Blanco
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../../common/AreaBuilderSharedConstants.js';
import GridIcon from '../../common/view/GridIcon.js';

// constants
const NUM_COLUMNS = 8;
const NUM_ROWS = 9;
const CELL_LENGTH = 3;
const GRID_ICON_OPTIONS = {
  gridStroke: '#dddddd',
  gridLineWidth: 0.25,
  shapeLineWidth: 0.25
};

/**
 * Static object, not meant to be instantiated.
 */
const GameIconFactory = {
  createIcon(level) {
    let color;
    let occupiedCells;
    switch (level) {
      case 1:
        color = AreaBuilderSharedConstants.ORANGISH_COLOR;
        occupiedCells = [new Vector2(4, 1), new Vector2(3, 2), new Vector2(4, 2), new Vector2(4, 3), new Vector2(4, 4), new Vector2(4, 5), new Vector2(4, 6), new Vector2(3, 7), new Vector2(4, 7), new Vector2(5, 7)];
        break;
      case 2:
        color = AreaBuilderSharedConstants.ORANGE_BROWN_COLOR;
        occupiedCells = [new Vector2(2, 1), new Vector2(3, 1), new Vector2(4, 1), new Vector2(5, 1), new Vector2(2, 2), new Vector2(5, 2), new Vector2(5, 3), new Vector2(2, 4), new Vector2(3, 4), new Vector2(4, 4), new Vector2(5, 4), new Vector2(2, 5), new Vector2(2, 6), new Vector2(2, 7), new Vector2(3, 7), new Vector2(4, 7), new Vector2(5, 7)];
        break;
      case 3:
        color = AreaBuilderSharedConstants.GREENISH_COLOR;
        occupiedCells = [new Vector2(2, 1), new Vector2(3, 1), new Vector2(4, 1), new Vector2(5, 1), new Vector2(5, 2), new Vector2(5, 3), new Vector2(3, 4), new Vector2(4, 4), new Vector2(5, 4), new Vector2(5, 5), new Vector2(5, 6), new Vector2(2, 7), new Vector2(3, 7), new Vector2(4, 7), new Vector2(5, 7)];
        break;
      case 4:
        color = AreaBuilderSharedConstants.DARK_GREEN_COLOR;
        occupiedCells = [new Vector2(5, 1), new Vector2(2, 2), new Vector2(5, 2), new Vector2(2, 3), new Vector2(5, 3), new Vector2(2, 4), new Vector2(5, 4), new Vector2(2, 5), new Vector2(3, 5), new Vector2(4, 5), new Vector2(5, 5), new Vector2(6, 5), new Vector2(5, 6), new Vector2(5, 7)];
        break;
      case 5:
        color = AreaBuilderSharedConstants.PURPLISH_COLOR;
        occupiedCells = [new Vector2(2, 1), new Vector2(3, 1), new Vector2(4, 1), new Vector2(5, 1), new Vector2(2, 2), new Vector2(2, 3), new Vector2(2, 4), new Vector2(3, 4), new Vector2(4, 4), new Vector2(5, 4), new Vector2(5, 5), new Vector2(5, 6), new Vector2(2, 7), new Vector2(3, 7), new Vector2(4, 7), new Vector2(5, 7)];
        break;
      case 6:
        color = AreaBuilderSharedConstants.PINKISH_COLOR;
        occupiedCells = [new Vector2(2, 1), new Vector2(3, 1), new Vector2(4, 1), new Vector2(5, 1), new Vector2(2, 2), new Vector2(2, 3), new Vector2(2, 4), new Vector2(3, 4), new Vector2(4, 4), new Vector2(5, 4), new Vector2(2, 5), new Vector2(5, 5), new Vector2(2, 6), new Vector2(5, 6), new Vector2(2, 7), new Vector2(3, 7), new Vector2(4, 7), new Vector2(5, 7)];
        break;
      default:
        throw new Error(`Unsupported game level: ${level}`);
    }
    return new GridIcon(NUM_COLUMNS, NUM_ROWS, CELL_LENGTH, color, occupiedCells, GRID_ICON_OPTIONS);
  }
};
areaBuilder.register('GameIconFactory', GameIconFactory);
export default GameIconFactory;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiYXJlYUJ1aWxkZXIiLCJBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cyIsIkdyaWRJY29uIiwiTlVNX0NPTFVNTlMiLCJOVU1fUk9XUyIsIkNFTExfTEVOR1RIIiwiR1JJRF9JQ09OX09QVElPTlMiLCJncmlkU3Ryb2tlIiwiZ3JpZExpbmVXaWR0aCIsInNoYXBlTGluZVdpZHRoIiwiR2FtZUljb25GYWN0b3J5IiwiY3JlYXRlSWNvbiIsImxldmVsIiwiY29sb3IiLCJvY2N1cGllZENlbGxzIiwiT1JBTkdJU0hfQ09MT1IiLCJPUkFOR0VfQlJPV05fQ09MT1IiLCJHUkVFTklTSF9DT0xPUiIsIkRBUktfR1JFRU5fQ09MT1IiLCJQVVJQTElTSF9DT0xPUiIsIlBJTktJU0hfQ09MT1IiLCJFcnJvciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR2FtZUljb25GYWN0b3J5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFN0YXRpYyBmYWN0b3J5IGZvciBjcmVhdGluZyB0aGUgbnVtYmVyLW9uLWEtZ3JpZCBpY29ucyB1c2VkIGluIHRoZSBsZXZlbCBzZWxlY3Rpb24gc2NyZWVuIG9mIHRoZSBBcmVhIEJ1aWxkZXIgZ2FtZS5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IGFyZWFCdWlsZGVyIGZyb20gJy4uLy4uL2FyZWFCdWlsZGVyLmpzJztcclxuaW1wb3J0IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9BcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBHcmlkSWNvbiBmcm9tICcuLi8uLi9jb21tb24vdmlldy9HcmlkSWNvbi5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTlVNX0NPTFVNTlMgPSA4O1xyXG5jb25zdCBOVU1fUk9XUyA9IDk7XHJcbmNvbnN0IENFTExfTEVOR1RIID0gMztcclxuY29uc3QgR1JJRF9JQ09OX09QVElPTlMgPSB7XHJcbiAgZ3JpZFN0cm9rZTogJyNkZGRkZGQnLFxyXG4gIGdyaWRMaW5lV2lkdGg6IDAuMjUsXHJcbiAgc2hhcGVMaW5lV2lkdGg6IDAuMjVcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTdGF0aWMgb2JqZWN0LCBub3QgbWVhbnQgdG8gYmUgaW5zdGFudGlhdGVkLlxyXG4gKi9cclxuY29uc3QgR2FtZUljb25GYWN0b3J5ID0ge1xyXG4gIGNyZWF0ZUljb24oIGxldmVsICkge1xyXG4gICAgbGV0IGNvbG9yO1xyXG4gICAgbGV0IG9jY3VwaWVkQ2VsbHM7XHJcbiAgICBzd2l0Y2goIGxldmVsICkge1xyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgY29sb3IgPSBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5PUkFOR0lTSF9DT0xPUjtcclxuICAgICAgICBvY2N1cGllZENlbGxzID0gW1xyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDQsIDEgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAzLCAyICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNCwgMiApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDQsIDMgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA0LCA0ICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNCwgNSApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDQsIDYgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAzLCA3ICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNCwgNyApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDUsIDcgKVxyXG4gICAgICAgIF07XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIDI6XHJcbiAgICAgICAgY29sb3IgPSBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5PUkFOR0VfQlJPV05fQ09MT1I7XHJcbiAgICAgICAgb2NjdXBpZWRDZWxscyA9IFtcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAyLCAxICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMywgMSApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDQsIDEgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCAxICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMiwgMiApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDUsIDIgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCAzICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMiwgNCApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDMsIDQgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA0LCA0ICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNSwgNCApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDIsIDUgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAyLCA2ICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMiwgNyApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDMsIDcgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA0LCA3ICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNSwgNyApXHJcbiAgICAgICAgXTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgMzpcclxuICAgICAgICBjb2xvciA9IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLkdSRUVOSVNIX0NPTE9SO1xyXG4gICAgICAgIG9jY3VwaWVkQ2VsbHMgPSBbXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMiwgMSApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDMsIDEgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA0LCAxICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNSwgMSApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDUsIDIgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCAzICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMywgNCApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDQsIDQgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCA0ICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNSwgNSApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDUsIDYgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAyLCA3ICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMywgNyApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDQsIDcgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCA3IClcclxuICAgICAgICBdO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSA0OlxyXG4gICAgICAgIGNvbG9yID0gQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuREFSS19HUkVFTl9DT0xPUjtcclxuICAgICAgICBvY2N1cGllZENlbGxzID0gW1xyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDUsIDEgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAyLCAyICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNSwgMiApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDIsIDMgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCAzICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMiwgNCApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDUsIDQgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAyLCA1ICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMywgNSApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDQsIDUgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCA1ICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNiwgNSApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDUsIDYgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCA3IClcclxuICAgICAgICBdO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSA1OlxyXG4gICAgICAgIGNvbG9yID0gQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuUFVSUExJU0hfQ09MT1I7XHJcbiAgICAgICAgb2NjdXBpZWRDZWxscyA9IFtcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAyLCAxICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMywgMSApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDQsIDEgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCAxICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMiwgMiApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDIsIDMgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAyLCA0ICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMywgNCApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDQsIDQgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCA0ICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNSwgNSApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDUsIDYgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAyLCA3ICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMywgNyApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDQsIDcgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCA3IClcclxuICAgICAgICBdO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSA2OlxyXG4gICAgICAgIGNvbG9yID0gQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuUElOS0lTSF9DT0xPUjtcclxuICAgICAgICBvY2N1cGllZENlbGxzID0gW1xyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDIsIDEgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAzLCAxICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNCwgMSApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDUsIDEgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAyLCAyICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMiwgMyApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDIsIDQgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAzLCA0ICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNCwgNCApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDUsIDQgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAyLCA1ICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNSwgNSApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDIsIDYgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCA2ICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMiwgNyApLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDMsIDcgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA0LCA3ICksXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNSwgNyApXHJcbiAgICAgICAgXTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgVW5zdXBwb3J0ZWQgZ2FtZSBsZXZlbDogJHtsZXZlbH1gICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IEdyaWRJY29uKCBOVU1fQ09MVU1OUywgTlVNX1JPV1MsIENFTExfTEVOR1RILCBjb2xvciwgb2NjdXBpZWRDZWxscywgR1JJRF9JQ09OX09QVElPTlMgKTtcclxuICB9XHJcbn07XHJcblxyXG5hcmVhQnVpbGRlci5yZWdpc3RlciggJ0dhbWVJY29uRmFjdG9yeScsIEdhbWVJY29uRmFjdG9yeSApO1xyXG5leHBvcnQgZGVmYXVsdCBHYW1lSWNvbkZhY3Rvcnk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUM5QyxPQUFPQywwQkFBMEIsTUFBTSw0Q0FBNEM7QUFDbkYsT0FBT0MsUUFBUSxNQUFNLCtCQUErQjs7QUFFcEQ7QUFDQSxNQUFNQyxXQUFXLEdBQUcsQ0FBQztBQUNyQixNQUFNQyxRQUFRLEdBQUcsQ0FBQztBQUNsQixNQUFNQyxXQUFXLEdBQUcsQ0FBQztBQUNyQixNQUFNQyxpQkFBaUIsR0FBRztFQUN4QkMsVUFBVSxFQUFFLFNBQVM7RUFDckJDLGFBQWEsRUFBRSxJQUFJO0VBQ25CQyxjQUFjLEVBQUU7QUFDbEIsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxNQUFNQyxlQUFlLEdBQUc7RUFDdEJDLFVBQVVBLENBQUVDLEtBQUssRUFBRztJQUNsQixJQUFJQyxLQUFLO0lBQ1QsSUFBSUMsYUFBYTtJQUNqQixRQUFRRixLQUFLO01BQ1gsS0FBSyxDQUFDO1FBQ0pDLEtBQUssR0FBR1osMEJBQTBCLENBQUNjLGNBQWM7UUFDakRELGFBQWEsR0FBRyxDQUNkLElBQUlmLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQ3BCO1FBQ0Q7TUFFRixLQUFLLENBQUM7UUFDSmMsS0FBSyxHQUFHWiwwQkFBMEIsQ0FBQ2Usa0JBQWtCO1FBQ3JERixhQUFhLEdBQUcsQ0FDZCxJQUFJZixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUNwQjtRQUNEO01BRUYsS0FBSyxDQUFDO1FBQ0pjLEtBQUssR0FBR1osMEJBQTBCLENBQUNnQixjQUFjO1FBQ2pESCxhQUFhLEdBQUcsQ0FDZCxJQUFJZixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUNwQjtRQUNEO01BRUYsS0FBSyxDQUFDO1FBQ0pjLEtBQUssR0FBR1osMEJBQTBCLENBQUNpQixnQkFBZ0I7UUFDbkRKLGFBQWEsR0FBRyxDQUNkLElBQUlmLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQ3BCO1FBQ0Q7TUFFRixLQUFLLENBQUM7UUFDSmMsS0FBSyxHQUFHWiwwQkFBMEIsQ0FBQ2tCLGNBQWM7UUFDakRMLGFBQWEsR0FBRyxDQUNkLElBQUlmLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQ3BCO1FBQ0Q7TUFFRixLQUFLLENBQUM7UUFDSmMsS0FBSyxHQUFHWiwwQkFBMEIsQ0FBQ21CLGFBQWE7UUFDaEROLGFBQWEsR0FBRyxDQUNkLElBQUlmLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLEVBQ25CLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQ3BCO1FBQ0Q7TUFFRjtRQUNFLE1BQU0sSUFBSXNCLEtBQUssQ0FBRywyQkFBMEJULEtBQU0sRUFBRSxDQUFDO0lBQ3pEO0lBQ0EsT0FBTyxJQUFJVixRQUFRLENBQUVDLFdBQVcsRUFBRUMsUUFBUSxFQUFFQyxXQUFXLEVBQUVRLEtBQUssRUFBRUMsYUFBYSxFQUFFUixpQkFBa0IsQ0FBQztFQUNwRztBQUNGLENBQUM7QUFFRE4sV0FBVyxDQUFDc0IsUUFBUSxDQUFFLGlCQUFpQixFQUFFWixlQUFnQixDQUFDO0FBQzFELGVBQWVBLGVBQWUifQ==