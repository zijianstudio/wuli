// Copyright 2022, University of Colorado Boulder

/**
 * icon node for the 'Stats' screen
 * @author Andrea Lin (PhET Interactive Simulations)
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import Screen from '../../../../joist/js/Screen.js';
import { Rectangle } from '../../../../scenery/js/imports.js';
import { LinearGradient } from '../../../../scenery/js/imports.js';
import projectileMotion from '../../projectileMotion.js';

// constants
const SCREEN_ICON_SIZE = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE;
const NAV_ICON_SIZE = Screen.MINIMUM_NAVBAR_ICON_SIZE;
class StatsIconNode extends Rectangle {
  constructor(type) {
    super(0, 0, 0, 0);
    let width;
    let height;
    const rectWidthFactor = 0.2;
    const rectHeights = [0.45, 0.65, 0.3];
    const gradientColor1 = '#990000';
    const gradientColor2 = '#ff0000';
    if (type === 'nav') {
      width = NAV_ICON_SIZE.width;
      height = NAV_ICON_SIZE.height;
      for (let i = 0; i < rectHeights.length; i++) {
        const rectHeight = rectHeights[i] * height;
        const statBar = new Rectangle((0.5 - (i - 0.5) * rectWidthFactor) * width, height - rectHeight, rectWidthFactor * width, rectHeight, {
          fill: new LinearGradient(0, height, 0, height - rectHeight).addColorStop(0, gradientColor1).addColorStop(1, gradientColor2)
        });
        this.addChild(statBar);
      }
    } else {
      width = SCREEN_ICON_SIZE.width;
      height = SCREEN_ICON_SIZE.height;
      for (let i = 0; i < rectHeights.length; i++) {
        const rectHeight = rectHeights[i] * height;
        const statBar = new Rectangle((0.5 - (i - 0.5) * rectWidthFactor) * width, height - rectHeight, rectWidthFactor * width, rectHeight, {
          fill: new LinearGradient(0, height, 0, height - rectHeight).addColorStop(0, gradientColor1).addColorStop(1, gradientColor2)
        });
        this.addChild(statBar);
      }
    }

    // create the background
    const backgroundFill = new LinearGradient(0, 0, 0, height).addColorStop(0, '#02ace4').addColorStop(1, '#cfecfc');
    this.mutate({
      fill: backgroundFill
    });
    this.setRectWidth(width);
    this.setRectHeight(height);
  }
}
projectileMotion.register('StatsIconNode', StatsIconNode);
export default StatsIconNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW4iLCJSZWN0YW5nbGUiLCJMaW5lYXJHcmFkaWVudCIsInByb2plY3RpbGVNb3Rpb24iLCJTQ1JFRU5fSUNPTl9TSVpFIiwiTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUiLCJOQVZfSUNPTl9TSVpFIiwiTUlOSU1VTV9OQVZCQVJfSUNPTl9TSVpFIiwiU3RhdHNJY29uTm9kZSIsImNvbnN0cnVjdG9yIiwidHlwZSIsIndpZHRoIiwiaGVpZ2h0IiwicmVjdFdpZHRoRmFjdG9yIiwicmVjdEhlaWdodHMiLCJncmFkaWVudENvbG9yMSIsImdyYWRpZW50Q29sb3IyIiwiaSIsImxlbmd0aCIsInJlY3RIZWlnaHQiLCJzdGF0QmFyIiwiZmlsbCIsImFkZENvbG9yU3RvcCIsImFkZENoaWxkIiwiYmFja2dyb3VuZEZpbGwiLCJtdXRhdGUiLCJzZXRSZWN0V2lkdGgiLCJzZXRSZWN0SGVpZ2h0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTdGF0c0ljb25Ob2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBpY29uIG5vZGUgZm9yIHRoZSAnU3RhdHMnIHNjcmVlblxyXG4gKiBAYXV0aG9yIEFuZHJlYSBMaW4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgTWF0dGhldyBCbGFja21hbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgU2NyZWVuIGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbi5qcyc7XHJcbmltcG9ydCB7IE5vZGVPcHRpb25zLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgeyBMaW5lYXJHcmFkaWVudCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBwcm9qZWN0aWxlTW90aW9uIGZyb20gJy4uLy4uL3Byb2plY3RpbGVNb3Rpb24uanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFNDUkVFTl9JQ09OX1NJWkUgPSBTY3JlZW4uTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkU7XHJcbmNvbnN0IE5BVl9JQ09OX1NJWkUgPSBTY3JlZW4uTUlOSU1VTV9OQVZCQVJfSUNPTl9TSVpFO1xyXG5cclxuY2xhc3MgU3RhdHNJY29uTm9kZSBleHRlbmRzIFJlY3RhbmdsZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdHlwZTogJ25hdicgfCAnc2NyZWVuJyApIHtcclxuICAgIHN1cGVyKCAwLCAwLCAwLCAwICk7XHJcblxyXG4gICAgbGV0IHdpZHRoO1xyXG4gICAgbGV0IGhlaWdodDtcclxuXHJcbiAgICBjb25zdCByZWN0V2lkdGhGYWN0b3IgPSAwLjI7XHJcbiAgICBjb25zdCByZWN0SGVpZ2h0cyA9IFsgMC40NSwgMC42NSwgMC4zIF07XHJcbiAgICBjb25zdCBncmFkaWVudENvbG9yMSA9ICcjOTkwMDAwJztcclxuICAgIGNvbnN0IGdyYWRpZW50Q29sb3IyID0gJyNmZjAwMDAnO1xyXG5cclxuICAgIGlmICggdHlwZSA9PT0gJ25hdicgKSB7XHJcbiAgICAgIHdpZHRoID0gTkFWX0lDT05fU0laRS53aWR0aDtcclxuICAgICAgaGVpZ2h0ID0gTkFWX0lDT05fU0laRS5oZWlnaHQ7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHJlY3RIZWlnaHRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IHJlY3RIZWlnaHQgPSByZWN0SGVpZ2h0c1sgaSBdICogaGVpZ2h0O1xyXG4gICAgICAgIGNvbnN0IHN0YXRCYXIgPSBuZXcgUmVjdGFuZ2xlKFxyXG4gICAgICAgICAgKCAwLjUgLSAoIGkgLSAwLjUgKSAqIHJlY3RXaWR0aEZhY3RvciApICogd2lkdGgsXHJcbiAgICAgICAgICBoZWlnaHQgLSByZWN0SGVpZ2h0LFxyXG4gICAgICAgICAgcmVjdFdpZHRoRmFjdG9yICogd2lkdGgsXHJcbiAgICAgICAgICByZWN0SGVpZ2h0LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBmaWxsOiBuZXcgTGluZWFyR3JhZGllbnQoIDAsIGhlaWdodCwgMCwgaGVpZ2h0IC0gcmVjdEhlaWdodCApXHJcbiAgICAgICAgICAgICAgLmFkZENvbG9yU3RvcCggMCwgZ3JhZGllbnRDb2xvcjEgKVxyXG4gICAgICAgICAgICAgIC5hZGRDb2xvclN0b3AoIDEsIGdyYWRpZW50Q29sb3IyIClcclxuICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoIHN0YXRCYXIgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHdpZHRoID0gU0NSRUVOX0lDT05fU0laRS53aWR0aDtcclxuICAgICAgaGVpZ2h0ID0gU0NSRUVOX0lDT05fU0laRS5oZWlnaHQ7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHJlY3RIZWlnaHRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IHJlY3RIZWlnaHQgPSByZWN0SGVpZ2h0c1sgaSBdICogaGVpZ2h0O1xyXG4gICAgICAgIGNvbnN0IHN0YXRCYXIgPSBuZXcgUmVjdGFuZ2xlKFxyXG4gICAgICAgICAgKCAwLjUgLSAoIGkgLSAwLjUgKSAqIHJlY3RXaWR0aEZhY3RvciApICogd2lkdGgsXHJcbiAgICAgICAgICBoZWlnaHQgLSByZWN0SGVpZ2h0LFxyXG4gICAgICAgICAgcmVjdFdpZHRoRmFjdG9yICogd2lkdGgsXHJcbiAgICAgICAgICByZWN0SGVpZ2h0LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBmaWxsOiBuZXcgTGluZWFyR3JhZGllbnQoIDAsIGhlaWdodCwgMCwgaGVpZ2h0IC0gcmVjdEhlaWdodCApXHJcbiAgICAgICAgICAgICAgLmFkZENvbG9yU3RvcCggMCwgZ3JhZGllbnRDb2xvcjEgKVxyXG4gICAgICAgICAgICAgIC5hZGRDb2xvclN0b3AoIDEsIGdyYWRpZW50Q29sb3IyIClcclxuICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoIHN0YXRCYXIgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgYmFja2dyb3VuZFxyXG4gICAgY29uc3QgYmFja2dyb3VuZEZpbGwgPSBuZXcgTGluZWFyR3JhZGllbnQoIDAsIDAsIDAsIGhlaWdodCApXHJcbiAgICAgIC5hZGRDb2xvclN0b3AoIDAsICcjMDJhY2U0JyApXHJcbiAgICAgIC5hZGRDb2xvclN0b3AoIDEsICcjY2ZlY2ZjJyApO1xyXG4gICAgdGhpcy5tdXRhdGUoIHsgZmlsbDogYmFja2dyb3VuZEZpbGwgfSBhcyBOb2RlT3B0aW9ucyApO1xyXG4gICAgdGhpcy5zZXRSZWN0V2lkdGgoIHdpZHRoICk7XHJcbiAgICB0aGlzLnNldFJlY3RIZWlnaHQoIGhlaWdodCApO1xyXG4gIH1cclxufVxyXG5cclxucHJvamVjdGlsZU1vdGlvbi5yZWdpc3RlciggJ1N0YXRzSWNvbk5vZGUnLCBTdGF0c0ljb25Ob2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTdGF0c0ljb25Ob2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxNQUFNLE1BQU0sZ0NBQWdDO0FBQ25ELFNBQXNCQyxTQUFTLFFBQVEsbUNBQW1DO0FBQzFFLFNBQVNDLGNBQWMsUUFBUSxtQ0FBbUM7QUFDbEUsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCOztBQUV4RDtBQUNBLE1BQU1DLGdCQUFnQixHQUFHSixNQUFNLENBQUNLLDZCQUE2QjtBQUM3RCxNQUFNQyxhQUFhLEdBQUdOLE1BQU0sQ0FBQ08sd0JBQXdCO0FBRXJELE1BQU1DLGFBQWEsU0FBU1AsU0FBUyxDQUFDO0VBRTdCUSxX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