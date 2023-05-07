// Copyright 2016-2022, University of Colorado Boulder

/**
 * Indicates the portion of the target material that is shown in the exploded view.
 *
 * @author Dave Schmitz (Schmitzware)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import rutherfordScattering from '../../rutherfordScattering.js';

// constants
const BACK_DEPTH = 4;
const BACK_OFFSET = 0.10;
const BOX_SIZE = new Dimension2(10, 10);
class TinyBox extends Node {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      fill: 'black',
      stroke: 'white',
      lineWidth: 1
    }, options);
    const topNode = new Path(new Shape().moveTo(BACK_OFFSET * BOX_SIZE.width, 0).lineTo((1 - BACK_OFFSET) * BOX_SIZE.width, 0).lineTo(BOX_SIZE.width, BACK_DEPTH).lineTo(0, BACK_DEPTH).close(), options);
    assert && assert(!options.children, 'additional children not supported');
    options.children = [topNode];
    super(options);
  }
}
rutherfordScattering.register('TinyBox', TinyBox);
export default TinyBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiU2hhcGUiLCJtZXJnZSIsIk5vZGUiLCJQYXRoIiwicnV0aGVyZm9yZFNjYXR0ZXJpbmciLCJCQUNLX0RFUFRIIiwiQkFDS19PRkZTRVQiLCJCT1hfU0laRSIsIlRpbnlCb3giLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJmaWxsIiwic3Ryb2tlIiwibGluZVdpZHRoIiwidG9wTm9kZSIsIm1vdmVUbyIsIndpZHRoIiwibGluZVRvIiwiY2xvc2UiLCJhc3NlcnQiLCJjaGlsZHJlbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVGlueUJveC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBJbmRpY2F0ZXMgdGhlIHBvcnRpb24gb2YgdGhlIHRhcmdldCBtYXRlcmlhbCB0aGF0IGlzIHNob3duIGluIHRoZSBleHBsb2RlZCB2aWV3LlxyXG4gKlxyXG4gKiBAYXV0aG9yIERhdmUgU2NobWl0eiAoU2NobWl0endhcmUpXHJcbiAqL1xyXG5cclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHJ1dGhlcmZvcmRTY2F0dGVyaW5nIGZyb20gJy4uLy4uL3J1dGhlcmZvcmRTY2F0dGVyaW5nLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBCQUNLX0RFUFRIID0gNDtcclxuY29uc3QgQkFDS19PRkZTRVQgPSAwLjEwO1xyXG5jb25zdCBCT1hfU0laRSA9IG5ldyBEaW1lbnNpb24yKCAxMCwgMTAgKTtcclxuXHJcbmNsYXNzIFRpbnlCb3ggZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBmaWxsOiAnYmxhY2snLFxyXG4gICAgICBzdHJva2U6ICd3aGl0ZScsXHJcbiAgICAgIGxpbmVXaWR0aDogMVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHRvcE5vZGUgPSBuZXcgUGF0aCggbmV3IFNoYXBlKClcclxuICAgICAgLm1vdmVUbyggQkFDS19PRkZTRVQgKiBCT1hfU0laRS53aWR0aCwgMCApXHJcbiAgICAgIC5saW5lVG8oICggMSAtIEJBQ0tfT0ZGU0VUICkgKiBCT1hfU0laRS53aWR0aCwgMCApXHJcbiAgICAgIC5saW5lVG8oIEJPWF9TSVpFLndpZHRoLCBCQUNLX0RFUFRIIClcclxuICAgICAgLmxpbmVUbyggMCwgQkFDS19ERVBUSCApXHJcbiAgICAgIC5jbG9zZSgpLCBvcHRpb25zICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuY2hpbGRyZW4sICdhZGRpdGlvbmFsIGNoaWxkcmVuIG5vdCBzdXBwb3J0ZWQnICk7XHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyB0b3BOb2RlIF07XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbnJ1dGhlcmZvcmRTY2F0dGVyaW5nLnJlZ2lzdGVyKCAnVGlueUJveCcsIFRpbnlCb3ggKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRpbnlCb3g7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM5RCxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7O0FBRWhFO0FBQ0EsTUFBTUMsVUFBVSxHQUFHLENBQUM7QUFDcEIsTUFBTUMsV0FBVyxHQUFHLElBQUk7QUFDeEIsTUFBTUMsUUFBUSxHQUFHLElBQUlSLFVBQVUsQ0FBRSxFQUFFLEVBQUUsRUFBRyxDQUFDO0FBRXpDLE1BQU1TLE9BQU8sU0FBU04sSUFBSSxDQUFDO0VBRXpCO0FBQ0Y7QUFDQTtFQUNFTyxXQUFXQSxDQUFFQyxPQUFPLEVBQUc7SUFFckJBLE9BQU8sR0FBR1QsS0FBSyxDQUFFO01BQ2ZVLElBQUksRUFBRSxPQUFPO01BQ2JDLE1BQU0sRUFBRSxPQUFPO01BQ2ZDLFNBQVMsRUFBRTtJQUNiLENBQUMsRUFBRUgsT0FBUSxDQUFDO0lBRVosTUFBTUksT0FBTyxHQUFHLElBQUlYLElBQUksQ0FBRSxJQUFJSCxLQUFLLENBQUMsQ0FBQyxDQUNsQ2UsTUFBTSxDQUFFVCxXQUFXLEdBQUdDLFFBQVEsQ0FBQ1MsS0FBSyxFQUFFLENBQUUsQ0FBQyxDQUN6Q0MsTUFBTSxDQUFFLENBQUUsQ0FBQyxHQUFHWCxXQUFXLElBQUtDLFFBQVEsQ0FBQ1MsS0FBSyxFQUFFLENBQUUsQ0FBQyxDQUNqREMsTUFBTSxDQUFFVixRQUFRLENBQUNTLEtBQUssRUFBRVgsVUFBVyxDQUFDLENBQ3BDWSxNQUFNLENBQUUsQ0FBQyxFQUFFWixVQUFXLENBQUMsQ0FDdkJhLEtBQUssQ0FBQyxDQUFDLEVBQUVSLE9BQVEsQ0FBQztJQUVyQlMsTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQ1QsT0FBTyxDQUFDVSxRQUFRLEVBQUUsbUNBQW9DLENBQUM7SUFDMUVWLE9BQU8sQ0FBQ1UsUUFBUSxHQUFHLENBQUVOLE9BQU8sQ0FBRTtJQUU5QixLQUFLLENBQUVKLE9BQVEsQ0FBQztFQUNsQjtBQUNGO0FBRUFOLG9CQUFvQixDQUFDaUIsUUFBUSxDQUFFLFNBQVMsRUFBRWIsT0FBUSxDQUFDO0FBRW5ELGVBQWVBLE9BQU8ifQ==