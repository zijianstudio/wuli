// Copyright 2021-2023, University of Colorado Boulder

/**
 * WavePacketLengthToolNode is the tool for measuring the length (wavelength or period) of a wave packet
 * in the 'Wave Packet' screen. Origin is at the tip of the caliper's left jaw.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import FMWColors from '../../common/FMWColors.js';
import FMWSymbols from '../../common/FMWSymbols.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import WavePacketMeasurementToolNode from './WavePacketMeasurementToolNode.js';
export default class WavePacketLengthToolNode extends WavePacketMeasurementToolNode {
  /**
   * @param {Property.<number>} lengthProperty
   * @param {ChartTransform} chartTransform
   * @param {EnumerationProperty.<Domain>} domainProperty
   * @param {Object} [options]
   */
  constructor(lengthProperty, chartTransform, domainProperty, options) {
    options = merge({
      calipersNodeOptions: {
        pathOptions: {
          fill: FMWColors.wavePacketLengthToolFillProperty
        }
      }
    }, options);
    const spaceSymbolStringProperty = new DerivedProperty([FMWSymbols.lambdaStringProperty], lambda => `${lambda}<sub>1</sub>`);
    const timeSymbolStringProperty = new DerivedProperty([FMWSymbols.TStringProperty], T => `${T}<sub>1</sub>`);
    super(lengthProperty, chartTransform, domainProperty, spaceSymbolStringProperty, timeSymbolStringProperty, options);
  }
}
fourierMakingWaves.register('WavePacketLengthToolNode', WavePacketLengthToolNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJtZXJnZSIsIkZNV0NvbG9ycyIsIkZNV1N5bWJvbHMiLCJmb3VyaWVyTWFraW5nV2F2ZXMiLCJXYXZlUGFja2V0TWVhc3VyZW1lbnRUb29sTm9kZSIsIldhdmVQYWNrZXRMZW5ndGhUb29sTm9kZSIsImNvbnN0cnVjdG9yIiwibGVuZ3RoUHJvcGVydHkiLCJjaGFydFRyYW5zZm9ybSIsImRvbWFpblByb3BlcnR5Iiwib3B0aW9ucyIsImNhbGlwZXJzTm9kZU9wdGlvbnMiLCJwYXRoT3B0aW9ucyIsImZpbGwiLCJ3YXZlUGFja2V0TGVuZ3RoVG9vbEZpbGxQcm9wZXJ0eSIsInNwYWNlU3ltYm9sU3RyaW5nUHJvcGVydHkiLCJsYW1iZGFTdHJpbmdQcm9wZXJ0eSIsImxhbWJkYSIsInRpbWVTeW1ib2xTdHJpbmdQcm9wZXJ0eSIsIlRTdHJpbmdQcm9wZXJ0eSIsIlQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIldhdmVQYWNrZXRMZW5ndGhUb29sTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBXYXZlUGFja2V0TGVuZ3RoVG9vbE5vZGUgaXMgdGhlIHRvb2wgZm9yIG1lYXN1cmluZyB0aGUgbGVuZ3RoICh3YXZlbGVuZ3RoIG9yIHBlcmlvZCkgb2YgYSB3YXZlIHBhY2tldFxyXG4gKiBpbiB0aGUgJ1dhdmUgUGFja2V0JyBzY3JlZW4uIE9yaWdpbiBpcyBhdCB0aGUgdGlwIG9mIHRoZSBjYWxpcGVyJ3MgbGVmdCBqYXcuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgRk1XQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi9GTVdDb2xvcnMuanMnO1xyXG5pbXBvcnQgRk1XU3ltYm9scyBmcm9tICcuLi8uLi9jb21tb24vRk1XU3ltYm9scy5qcyc7XHJcbmltcG9ydCBmb3VyaWVyTWFraW5nV2F2ZXMgZnJvbSAnLi4vLi4vZm91cmllck1ha2luZ1dhdmVzLmpzJztcclxuaW1wb3J0IFdhdmVQYWNrZXRNZWFzdXJlbWVudFRvb2xOb2RlIGZyb20gJy4vV2F2ZVBhY2tldE1lYXN1cmVtZW50VG9vbE5vZGUuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2F2ZVBhY2tldExlbmd0aFRvb2xOb2RlIGV4dGVuZHMgV2F2ZVBhY2tldE1lYXN1cmVtZW50VG9vbE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxudW1iZXI+fSBsZW5ndGhQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7Q2hhcnRUcmFuc2Zvcm19IGNoYXJ0VHJhbnNmb3JtXHJcbiAgICogQHBhcmFtIHtFbnVtZXJhdGlvblByb3BlcnR5LjxEb21haW4+fSBkb21haW5Qcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbGVuZ3RoUHJvcGVydHksIGNoYXJ0VHJhbnNmb3JtLCBkb21haW5Qcm9wZXJ0eSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgY2FsaXBlcnNOb2RlT3B0aW9uczoge1xyXG4gICAgICAgIHBhdGhPcHRpb25zOiB7XHJcbiAgICAgICAgICBmaWxsOiBGTVdDb2xvcnMud2F2ZVBhY2tldExlbmd0aFRvb2xGaWxsUHJvcGVydHlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBzcGFjZVN5bWJvbFN0cmluZ1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBGTVdTeW1ib2xzLmxhbWJkYVN0cmluZ1Byb3BlcnR5IF0sXHJcbiAgICAgIGxhbWJkYSA9PiBgJHtsYW1iZGF9PHN1Yj4xPC9zdWI+YCApO1xyXG5cclxuICAgIGNvbnN0IHRpbWVTeW1ib2xTdHJpbmdQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgRk1XU3ltYm9scy5UU3RyaW5nUHJvcGVydHkgXSxcclxuICAgICAgVCA9PiBgJHtUfTxzdWI+MTwvc3ViPmAgKTtcclxuXHJcbiAgICBzdXBlciggbGVuZ3RoUHJvcGVydHksIGNoYXJ0VHJhbnNmb3JtLCBkb21haW5Qcm9wZXJ0eSwgc3BhY2VTeW1ib2xTdHJpbmdQcm9wZXJ0eSwgdGltZVN5bWJvbFN0cmluZ1Byb3BlcnR5LCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5mb3VyaWVyTWFraW5nV2F2ZXMucmVnaXN0ZXIoICdXYXZlUGFja2V0TGVuZ3RoVG9vbE5vZGUnLCBXYXZlUGFja2V0TGVuZ3RoVG9vbE5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsU0FBUyxNQUFNLDJCQUEyQjtBQUNqRCxPQUFPQyxVQUFVLE1BQU0sNEJBQTRCO0FBQ25ELE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUM1RCxPQUFPQyw2QkFBNkIsTUFBTSxvQ0FBb0M7QUFFOUUsZUFBZSxNQUFNQyx3QkFBd0IsU0FBU0QsNkJBQTZCLENBQUM7RUFFbEY7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLFdBQVdBLENBQUVDLGNBQWMsRUFBRUMsY0FBYyxFQUFFQyxjQUFjLEVBQUVDLE9BQU8sRUFBRztJQUVyRUEsT0FBTyxHQUFHVixLQUFLLENBQUU7TUFDZlcsbUJBQW1CLEVBQUU7UUFDbkJDLFdBQVcsRUFBRTtVQUNYQyxJQUFJLEVBQUVaLFNBQVMsQ0FBQ2E7UUFDbEI7TUFDRjtJQUNGLENBQUMsRUFBRUosT0FBUSxDQUFDO0lBRVosTUFBTUsseUJBQXlCLEdBQUcsSUFBSWhCLGVBQWUsQ0FBRSxDQUFFRyxVQUFVLENBQUNjLG9CQUFvQixDQUFFLEVBQ3hGQyxNQUFNLElBQUssR0FBRUEsTUFBTyxjQUFjLENBQUM7SUFFckMsTUFBTUMsd0JBQXdCLEdBQUcsSUFBSW5CLGVBQWUsQ0FBRSxDQUFFRyxVQUFVLENBQUNpQixlQUFlLENBQUUsRUFDbEZDLENBQUMsSUFBSyxHQUFFQSxDQUFFLGNBQWMsQ0FBQztJQUUzQixLQUFLLENBQUViLGNBQWMsRUFBRUMsY0FBYyxFQUFFQyxjQUFjLEVBQUVNLHlCQUF5QixFQUFFRyx3QkFBd0IsRUFBRVIsT0FBUSxDQUFDO0VBQ3ZIO0FBQ0Y7QUFFQVAsa0JBQWtCLENBQUNrQixRQUFRLENBQUUsMEJBQTBCLEVBQUVoQix3QkFBeUIsQ0FBQyJ9