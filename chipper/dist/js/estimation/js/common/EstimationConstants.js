// Copyright 2014-2020, University of Colorado Boulder

import Bounds2 from '../../../dot/js/Bounds2.js';
import Range from '../../../dot/js/Range.js';
import estimation from '../estimation.js';
const EstimationConstants = {
  LAYOUT_BOUNDS: new Bounds2(0, 0, 768, 504),
  RANGE_1_TO_10: new Range(1, 10),
  RANGE_10_TO_100: new Range(10, 100),
  RANGE_100_TO_1000: new Range(100, 1000),
  REFERENCE_OBJECT_COLOR: 'blue',
  COMPARISON_OBJECT_COLOR: '#ff6633',
  // Proportion of depth (z dimension) projected into the 2D representation.
  DEPTH_PROJECTION_PROPORTION: 0.3,
  // Angle of depth projection for cubes, in radians
  CUBE_PROJECTION_ANGLE: Math.PI / 4
};
estimation.register('EstimationConstants', EstimationConstants);
export default EstimationConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiUmFuZ2UiLCJlc3RpbWF0aW9uIiwiRXN0aW1hdGlvbkNvbnN0YW50cyIsIkxBWU9VVF9CT1VORFMiLCJSQU5HRV8xX1RPXzEwIiwiUkFOR0VfMTBfVE9fMTAwIiwiUkFOR0VfMTAwX1RPXzEwMDAiLCJSRUZFUkVOQ0VfT0JKRUNUX0NPTE9SIiwiQ09NUEFSSVNPTl9PQkpFQ1RfQ09MT1IiLCJERVBUSF9QUk9KRUNUSU9OX1BST1BPUlRJT04iLCJDVUJFX1BST0pFQ1RJT05fQU5HTEUiLCJNYXRoIiwiUEkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVzdGltYXRpb25Db25zdGFudHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IGVzdGltYXRpb24gZnJvbSAnLi4vZXN0aW1hdGlvbi5qcyc7XHJcblxyXG5jb25zdCBFc3RpbWF0aW9uQ29uc3RhbnRzID0ge1xyXG5cclxuICBMQVlPVVRfQk9VTkRTOiBuZXcgQm91bmRzMiggMCwgMCwgNzY4LCA1MDQgKSxcclxuXHJcbiAgUkFOR0VfMV9UT18xMDogbmV3IFJhbmdlKCAxLCAxMCApLFxyXG4gIFJBTkdFXzEwX1RPXzEwMDogbmV3IFJhbmdlKCAxMCwgMTAwICksXHJcbiAgUkFOR0VfMTAwX1RPXzEwMDA6IG5ldyBSYW5nZSggMTAwLCAxMDAwICksXHJcbiAgUkVGRVJFTkNFX09CSkVDVF9DT0xPUjogJ2JsdWUnLFxyXG4gIENPTVBBUklTT05fT0JKRUNUX0NPTE9SOiAnI2ZmNjYzMycsXHJcblxyXG4gIC8vIFByb3BvcnRpb24gb2YgZGVwdGggKHogZGltZW5zaW9uKSBwcm9qZWN0ZWQgaW50byB0aGUgMkQgcmVwcmVzZW50YXRpb24uXHJcbiAgREVQVEhfUFJPSkVDVElPTl9QUk9QT1JUSU9OOiAwLjMsXHJcblxyXG4gIC8vIEFuZ2xlIG9mIGRlcHRoIHByb2plY3Rpb24gZm9yIGN1YmVzLCBpbiByYWRpYW5zXHJcbiAgQ1VCRV9QUk9KRUNUSU9OX0FOR0xFOiBNYXRoLlBJIC8gNFxyXG59O1xyXG5cclxuZXN0aW1hdGlvbi5yZWdpc3RlciggJ0VzdGltYXRpb25Db25zdGFudHMnLCBFc3RpbWF0aW9uQ29uc3RhbnRzICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBFc3RpbWF0aW9uQ29uc3RhbnRzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBR0EsT0FBT0EsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxLQUFLLE1BQU0sMEJBQTBCO0FBQzVDLE9BQU9DLFVBQVUsTUFBTSxrQkFBa0I7QUFFekMsTUFBTUMsbUJBQW1CLEdBQUc7RUFFMUJDLGFBQWEsRUFBRSxJQUFJSixPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBSSxDQUFDO0VBRTVDSyxhQUFhLEVBQUUsSUFBSUosS0FBSyxDQUFFLENBQUMsRUFBRSxFQUFHLENBQUM7RUFDakNLLGVBQWUsRUFBRSxJQUFJTCxLQUFLLENBQUUsRUFBRSxFQUFFLEdBQUksQ0FBQztFQUNyQ00saUJBQWlCLEVBQUUsSUFBSU4sS0FBSyxDQUFFLEdBQUcsRUFBRSxJQUFLLENBQUM7RUFDekNPLHNCQUFzQixFQUFFLE1BQU07RUFDOUJDLHVCQUF1QixFQUFFLFNBQVM7RUFFbEM7RUFDQUMsMkJBQTJCLEVBQUUsR0FBRztFQUVoQztFQUNBQyxxQkFBcUIsRUFBRUMsSUFBSSxDQUFDQyxFQUFFLEdBQUc7QUFDbkMsQ0FBQztBQUVEWCxVQUFVLENBQUNZLFFBQVEsQ0FBRSxxQkFBcUIsRUFBRVgsbUJBQW9CLENBQUM7QUFFakUsZUFBZUEsbUJBQW1CIn0=