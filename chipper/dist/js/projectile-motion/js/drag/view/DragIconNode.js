// Copyright 2017-2022, University of Colorado Boulder

/**
 * icon node for the 'Drag' screen
 * @author Andrea Lin (PhET Interactive Simulations)
 */

import Screen from '../../../../joist/js/Screen.js';
import { LinearGradient, Rectangle } from '../../../../scenery/js/imports.js';
import ProjectileObjectViewFactory from '../../common/view/ProjectileObjectViewFactory.js';
import projectileMotion from '../../projectileMotion.js';

// constants
const WIDTH = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width;
const HEIGHT = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height;
class DragIconNode extends Rectangle {
  /**
   */
  constructor() {
    // create the background
    const backgroundFill = new LinearGradient(0, 0, 0, HEIGHT).addColorStop(0, '#02ace4').addColorStop(1, '#cfecfc');
    super(0, 0, WIDTH, HEIGHT, {
      fill: backgroundFill
    });
    const diameter = HEIGHT / 4;
    const inset = diameter * 0.7;

    // the three projectile object shapes
    const teardrop = ProjectileObjectViewFactory.createCustom(diameter, 0.04);
    teardrop.left = 10; // empirically determined
    teardrop.y = HEIGHT / 2;
    this.addChild(teardrop);
    const circle = ProjectileObjectViewFactory.createCustom(diameter, 0.47);
    circle.left = teardrop.children[0].right + inset; // gets the shape, without the strut
    circle.y = teardrop.y;
    this.addChild(circle);
    const almostSemiCircle = ProjectileObjectViewFactory.createCustom(diameter, 1);
    almostSemiCircle.left = circle.right + inset;
    almostSemiCircle.y = teardrop.y;
    this.addChild(almostSemiCircle);
  }
}
projectileMotion.register('DragIconNode', DragIconNode);
export default DragIconNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW4iLCJMaW5lYXJHcmFkaWVudCIsIlJlY3RhbmdsZSIsIlByb2plY3RpbGVPYmplY3RWaWV3RmFjdG9yeSIsInByb2plY3RpbGVNb3Rpb24iLCJXSURUSCIsIk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFIiwid2lkdGgiLCJIRUlHSFQiLCJoZWlnaHQiLCJEcmFnSWNvbk5vZGUiLCJjb25zdHJ1Y3RvciIsImJhY2tncm91bmRGaWxsIiwiYWRkQ29sb3JTdG9wIiwiZmlsbCIsImRpYW1ldGVyIiwiaW5zZXQiLCJ0ZWFyZHJvcCIsImNyZWF0ZUN1c3RvbSIsImxlZnQiLCJ5IiwiYWRkQ2hpbGQiLCJjaXJjbGUiLCJjaGlsZHJlbiIsInJpZ2h0IiwiYWxtb3N0U2VtaUNpcmNsZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRHJhZ0ljb25Ob2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIGljb24gbm9kZSBmb3IgdGhlICdEcmFnJyBzY3JlZW5cclxuICogQGF1dGhvciBBbmRyZWEgTGluIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTY3JlZW4gZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuLmpzJztcclxuaW1wb3J0IHsgTGluZWFyR3JhZGllbnQsIFJlY3RhbmdsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQcm9qZWN0aWxlT2JqZWN0Vmlld0ZhY3RvcnkgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvUHJvamVjdGlsZU9iamVjdFZpZXdGYWN0b3J5LmpzJztcclxuaW1wb3J0IHByb2plY3RpbGVNb3Rpb24gZnJvbSAnLi4vLi4vcHJvamVjdGlsZU1vdGlvbi5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgV0lEVEggPSBTY3JlZW4uTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUud2lkdGg7XHJcbmNvbnN0IEhFSUdIVCA9IFNjcmVlbi5NSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRS5oZWlnaHQ7XHJcblxyXG5jbGFzcyBEcmFnSWNvbk5vZGUgZXh0ZW5kcyBSZWN0YW5nbGUge1xyXG4gIC8qKlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIGJhY2tncm91bmRcclxuICAgIGNvbnN0IGJhY2tncm91bmRGaWxsID0gbmV3IExpbmVhckdyYWRpZW50KCAwLCAwLCAwLCBIRUlHSFQgKS5hZGRDb2xvclN0b3AoIDAsICcjMDJhY2U0JyApLmFkZENvbG9yU3RvcCggMSwgJyNjZmVjZmMnICk7XHJcbiAgICBzdXBlciggMCwgMCwgV0lEVEgsIEhFSUdIVCwgeyBmaWxsOiBiYWNrZ3JvdW5kRmlsbCB9ICk7XHJcblxyXG4gICAgY29uc3QgZGlhbWV0ZXIgPSBIRUlHSFQgLyA0O1xyXG4gICAgY29uc3QgaW5zZXQgPSBkaWFtZXRlciAqIDAuNztcclxuXHJcbiAgICAvLyB0aGUgdGhyZWUgcHJvamVjdGlsZSBvYmplY3Qgc2hhcGVzXHJcbiAgICBjb25zdCB0ZWFyZHJvcCA9IFByb2plY3RpbGVPYmplY3RWaWV3RmFjdG9yeS5jcmVhdGVDdXN0b20oIGRpYW1ldGVyLCAwLjA0ICk7XHJcbiAgICB0ZWFyZHJvcC5sZWZ0ID0gMTA7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuICAgIHRlYXJkcm9wLnkgPSBIRUlHSFQgLyAyO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGVhcmRyb3AgKTtcclxuXHJcbiAgICBjb25zdCBjaXJjbGUgPSBQcm9qZWN0aWxlT2JqZWN0Vmlld0ZhY3RvcnkuY3JlYXRlQ3VzdG9tKCBkaWFtZXRlciwgMC40NyApO1xyXG4gICAgY2lyY2xlLmxlZnQgPSB0ZWFyZHJvcC5jaGlsZHJlblsgMCBdLnJpZ2h0ICsgaW5zZXQ7IC8vIGdldHMgdGhlIHNoYXBlLCB3aXRob3V0IHRoZSBzdHJ1dFxyXG4gICAgY2lyY2xlLnkgPSB0ZWFyZHJvcC55O1xyXG4gICAgdGhpcy5hZGRDaGlsZCggY2lyY2xlICk7XHJcblxyXG4gICAgY29uc3QgYWxtb3N0U2VtaUNpcmNsZSA9IFByb2plY3RpbGVPYmplY3RWaWV3RmFjdG9yeS5jcmVhdGVDdXN0b20oIGRpYW1ldGVyLCAxICk7XHJcbiAgICBhbG1vc3RTZW1pQ2lyY2xlLmxlZnQgPSBjaXJjbGUucmlnaHQgKyBpbnNldDtcclxuICAgIGFsbW9zdFNlbWlDaXJjbGUueSA9IHRlYXJkcm9wLnk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBhbG1vc3RTZW1pQ2lyY2xlICk7XHJcblxyXG4gIH1cclxufVxyXG5cclxucHJvamVjdGlsZU1vdGlvbi5yZWdpc3RlciggJ0RyYWdJY29uTm9kZScsIERyYWdJY29uTm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRHJhZ0ljb25Ob2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLGdDQUFnQztBQUNuRCxTQUFTQyxjQUFjLEVBQUVDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDN0UsT0FBT0MsMkJBQTJCLE1BQU0sa0RBQWtEO0FBQzFGLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjs7QUFFeEQ7QUFDQSxNQUFNQyxLQUFLLEdBQUdMLE1BQU0sQ0FBQ00sNkJBQTZCLENBQUNDLEtBQUs7QUFDeEQsTUFBTUMsTUFBTSxHQUFHUixNQUFNLENBQUNNLDZCQUE2QixDQUFDRyxNQUFNO0FBRTFELE1BQU1DLFlBQVksU0FBU1IsU0FBUyxDQUFDO0VBQ25DO0FBQ0Y7RUFDU1MsV0FBV0EsQ0FBQSxFQUFHO0lBRW5CO0lBQ0EsTUFBTUMsY0FBYyxHQUFHLElBQUlYLGNBQWMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRU8sTUFBTyxDQUFDLENBQUNLLFlBQVksQ0FBRSxDQUFDLEVBQUUsU0FBVSxDQUFDLENBQUNBLFlBQVksQ0FBRSxDQUFDLEVBQUUsU0FBVSxDQUFDO0lBQ3RILEtBQUssQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFUixLQUFLLEVBQUVHLE1BQU0sRUFBRTtNQUFFTSxJQUFJLEVBQUVGO0lBQWUsQ0FBRSxDQUFDO0lBRXRELE1BQU1HLFFBQVEsR0FBR1AsTUFBTSxHQUFHLENBQUM7SUFDM0IsTUFBTVEsS0FBSyxHQUFHRCxRQUFRLEdBQUcsR0FBRzs7SUFFNUI7SUFDQSxNQUFNRSxRQUFRLEdBQUdkLDJCQUEyQixDQUFDZSxZQUFZLENBQUVILFFBQVEsRUFBRSxJQUFLLENBQUM7SUFDM0VFLFFBQVEsQ0FBQ0UsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ3BCRixRQUFRLENBQUNHLENBQUMsR0FBR1osTUFBTSxHQUFHLENBQUM7SUFDdkIsSUFBSSxDQUFDYSxRQUFRLENBQUVKLFFBQVMsQ0FBQztJQUV6QixNQUFNSyxNQUFNLEdBQUduQiwyQkFBMkIsQ0FBQ2UsWUFBWSxDQUFFSCxRQUFRLEVBQUUsSUFBSyxDQUFDO0lBQ3pFTyxNQUFNLENBQUNILElBQUksR0FBR0YsUUFBUSxDQUFDTSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUNDLEtBQUssR0FBR1IsS0FBSyxDQUFDLENBQUM7SUFDcERNLE1BQU0sQ0FBQ0YsQ0FBQyxHQUFHSCxRQUFRLENBQUNHLENBQUM7SUFDckIsSUFBSSxDQUFDQyxRQUFRLENBQUVDLE1BQU8sQ0FBQztJQUV2QixNQUFNRyxnQkFBZ0IsR0FBR3RCLDJCQUEyQixDQUFDZSxZQUFZLENBQUVILFFBQVEsRUFBRSxDQUFFLENBQUM7SUFDaEZVLGdCQUFnQixDQUFDTixJQUFJLEdBQUdHLE1BQU0sQ0FBQ0UsS0FBSyxHQUFHUixLQUFLO0lBQzVDUyxnQkFBZ0IsQ0FBQ0wsQ0FBQyxHQUFHSCxRQUFRLENBQUNHLENBQUM7SUFDL0IsSUFBSSxDQUFDQyxRQUFRLENBQUVJLGdCQUFpQixDQUFDO0VBRW5DO0FBQ0Y7QUFFQXJCLGdCQUFnQixDQUFDc0IsUUFBUSxDQUFFLGNBQWMsRUFBRWhCLFlBQWEsQ0FBQztBQUV6RCxlQUFlQSxZQUFZIn0=