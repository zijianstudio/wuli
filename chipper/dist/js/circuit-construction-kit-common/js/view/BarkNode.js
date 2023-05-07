// Copyright 2020-2022, University of Colorado Boulder

/**
 * Speech bubble with "!!!" shown when the dog barks.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import { HBox, Node, Path } from '../../../scenery/js/imports.js';
import commentSolidShape from '../../../sherpa/js/fontawesome-5/commentSolidShape.js';
import exclamationSolidShape from '../../../sherpa/js/fontawesome-5/exclamationSolidShape.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
export default class BarkNode extends Node {
  /**
   * @param [providedOptions]
   */
  constructor(providedOptions) {
    super();
    this.addChild(new Path(commentSolidShape, {
      fill: 'white',
      stroke: 'black',
      lineWidth: 1.5 * 15,
      scale: new Vector2(-1, 1)
    }));
    const mainScale = new Vector2(0.9, 0.9);
    const rotation = Math.PI * 2 / 20;
    const a = new Path(exclamationSolidShape, {
      fill: 'black',
      scale: mainScale.timesScalar(0.8),
      rotation: -rotation
    });
    const b = new Path(exclamationSolidShape, {
      fill: 'black',
      scale: mainScale
    });
    const c = new Path(exclamationSolidShape, {
      fill: 'black',
      scale: mainScale.timesScalar(0.8),
      rotation: rotation
    });
    this.addChild(new HBox({
      scale: 0.5,
      children: [a, b, c],
      align: 'bottom',
      spacing: 60,
      center: this.center.plusXY(0, -3)
    }));
    this.mutate(providedOptions);
  }
}
circuitConstructionKitCommon.register('BarkNode', BarkNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiSEJveCIsIk5vZGUiLCJQYXRoIiwiY29tbWVudFNvbGlkU2hhcGUiLCJleGNsYW1hdGlvblNvbGlkU2hhcGUiLCJjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIiwiQmFya05vZGUiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsImFkZENoaWxkIiwiZmlsbCIsInN0cm9rZSIsImxpbmVXaWR0aCIsInNjYWxlIiwibWFpblNjYWxlIiwicm90YXRpb24iLCJNYXRoIiwiUEkiLCJhIiwidGltZXNTY2FsYXIiLCJiIiwiYyIsImNoaWxkcmVuIiwiYWxpZ24iLCJzcGFjaW5nIiwiY2VudGVyIiwicGx1c1hZIiwibXV0YXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCYXJrTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTcGVlY2ggYnViYmxlIHdpdGggXCIhISFcIiBzaG93biB3aGVuIHRoZSBkb2cgYmFya3MuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBIQm94LCBOb2RlLCBOb2RlT3B0aW9ucywgUGF0aCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBjb21tZW50U29saWRTaGFwZSBmcm9tICcuLi8uLi8uLi9zaGVycGEvanMvZm9udGF3ZXNvbWUtNS9jb21tZW50U29saWRTaGFwZS5qcyc7XHJcbmltcG9ydCBleGNsYW1hdGlvblNvbGlkU2hhcGUgZnJvbSAnLi4vLi4vLi4vc2hlcnBhL2pzL2ZvbnRhd2Vzb21lLTUvZXhjbGFtYXRpb25Tb2xpZFNoYXBlLmpzJztcclxuaW1wb3J0IGNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24gZnJvbSAnLi4vY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYXJrTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IE5vZGVPcHRpb25zICkge1xyXG4gICAgc3VwZXIoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBQYXRoKCBjb21tZW50U29saWRTaGFwZSwge1xyXG4gICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGxpbmVXaWR0aDogMS41ICogMTUsXHJcbiAgICAgIHNjYWxlOiBuZXcgVmVjdG9yMiggLTEsIDEgKVxyXG4gICAgfSApICk7XHJcbiAgICBjb25zdCBtYWluU2NhbGUgPSBuZXcgVmVjdG9yMiggMC45LCAwLjkgKTtcclxuICAgIGNvbnN0IHJvdGF0aW9uID0gTWF0aC5QSSAqIDIgLyAyMDtcclxuICAgIGNvbnN0IGEgPSBuZXcgUGF0aCggZXhjbGFtYXRpb25Tb2xpZFNoYXBlLCB7XHJcbiAgICAgIGZpbGw6ICdibGFjaycsXHJcbiAgICAgIHNjYWxlOiBtYWluU2NhbGUudGltZXNTY2FsYXIoIDAuOCApLFxyXG4gICAgICByb3RhdGlvbjogLXJvdGF0aW9uXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgYiA9IG5ldyBQYXRoKCBleGNsYW1hdGlvblNvbGlkU2hhcGUsIHtcclxuICAgICAgZmlsbDogJ2JsYWNrJyxcclxuICAgICAgc2NhbGU6IG1haW5TY2FsZVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGMgPSBuZXcgUGF0aCggZXhjbGFtYXRpb25Tb2xpZFNoYXBlLCB7XHJcbiAgICAgIGZpbGw6ICdibGFjaycsXHJcbiAgICAgIHNjYWxlOiBtYWluU2NhbGUudGltZXNTY2FsYXIoIDAuOCApLFxyXG4gICAgICByb3RhdGlvbjogcm90YXRpb25cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBIQm94KCB7XHJcbiAgICAgIHNjYWxlOiAwLjUsXHJcbiAgICAgIGNoaWxkcmVuOiBbIGEsIGIsIGMgXSxcclxuICAgICAgYWxpZ246ICdib3R0b20nLFxyXG4gICAgICBzcGFjaW5nOiA2MCxcclxuICAgICAgY2VudGVyOiB0aGlzLmNlbnRlci5wbHVzWFkoIDAsIC0zIClcclxuICAgIH0gKSApO1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24ucmVnaXN0ZXIoICdCYXJrTm9kZScsIEJhcmtOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQWVDLElBQUksUUFBUSxnQ0FBZ0M7QUFDOUUsT0FBT0MsaUJBQWlCLE1BQU0sdURBQXVEO0FBQ3JGLE9BQU9DLHFCQUFxQixNQUFNLDJEQUEyRDtBQUM3RixPQUFPQyw0QkFBNEIsTUFBTSxvQ0FBb0M7QUFFN0UsZUFBZSxNQUFNQyxRQUFRLFNBQVNMLElBQUksQ0FBQztFQUV6QztBQUNGO0FBQ0E7RUFDU00sV0FBV0EsQ0FBRUMsZUFBNkIsRUFBRztJQUNsRCxLQUFLLENBQUMsQ0FBQztJQUNQLElBQUksQ0FBQ0MsUUFBUSxDQUFFLElBQUlQLElBQUksQ0FBRUMsaUJBQWlCLEVBQUU7TUFDMUNPLElBQUksRUFBRSxPQUFPO01BQ2JDLE1BQU0sRUFBRSxPQUFPO01BQ2ZDLFNBQVMsRUFBRSxHQUFHLEdBQUcsRUFBRTtNQUNuQkMsS0FBSyxFQUFFLElBQUlkLE9BQU8sQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFFO0lBQzVCLENBQUUsQ0FBRSxDQUFDO0lBQ0wsTUFBTWUsU0FBUyxHQUFHLElBQUlmLE9BQU8sQ0FBRSxHQUFHLEVBQUUsR0FBSSxDQUFDO0lBQ3pDLE1BQU1nQixRQUFRLEdBQUdDLElBQUksQ0FBQ0MsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFO0lBQ2pDLE1BQU1DLENBQUMsR0FBRyxJQUFJaEIsSUFBSSxDQUFFRSxxQkFBcUIsRUFBRTtNQUN6Q00sSUFBSSxFQUFFLE9BQU87TUFDYkcsS0FBSyxFQUFFQyxTQUFTLENBQUNLLFdBQVcsQ0FBRSxHQUFJLENBQUM7TUFDbkNKLFFBQVEsRUFBRSxDQUFDQTtJQUNiLENBQUUsQ0FBQztJQUVILE1BQU1LLENBQUMsR0FBRyxJQUFJbEIsSUFBSSxDQUFFRSxxQkFBcUIsRUFBRTtNQUN6Q00sSUFBSSxFQUFFLE9BQU87TUFDYkcsS0FBSyxFQUFFQztJQUNULENBQUUsQ0FBQztJQUVILE1BQU1PLENBQUMsR0FBRyxJQUFJbkIsSUFBSSxDQUFFRSxxQkFBcUIsRUFBRTtNQUN6Q00sSUFBSSxFQUFFLE9BQU87TUFDYkcsS0FBSyxFQUFFQyxTQUFTLENBQUNLLFdBQVcsQ0FBRSxHQUFJLENBQUM7TUFDbkNKLFFBQVEsRUFBRUE7SUFDWixDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNOLFFBQVEsQ0FBRSxJQUFJVCxJQUFJLENBQUU7TUFDdkJhLEtBQUssRUFBRSxHQUFHO01BQ1ZTLFFBQVEsRUFBRSxDQUFFSixDQUFDLEVBQUVFLENBQUMsRUFBRUMsQ0FBQyxDQUFFO01BQ3JCRSxLQUFLLEVBQUUsUUFBUTtNQUNmQyxPQUFPLEVBQUUsRUFBRTtNQUNYQyxNQUFNLEVBQUUsSUFBSSxDQUFDQSxNQUFNLENBQUNDLE1BQU0sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFO0lBQ3BDLENBQUUsQ0FBRSxDQUFDO0lBRUwsSUFBSSxDQUFDQyxNQUFNLENBQUVuQixlQUFnQixDQUFDO0VBQ2hDO0FBQ0Y7QUFFQUgsNEJBQTRCLENBQUN1QixRQUFRLENBQUUsVUFBVSxFQUFFdEIsUUFBUyxDQUFDIn0=