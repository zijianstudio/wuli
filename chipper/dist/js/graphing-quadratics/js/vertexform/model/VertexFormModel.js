// Copyright 2014-2023, University of Colorado Boulder

/**
 * Model for the 'Vertex Form' screen.
 * Vertex form of the quadratic equation is: y = a(x - h)^2 + k
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import GQModel from '../../common/model/GQModel.js';
import Quadratic from '../../common/model/Quadratic.js';
import graphingQuadratics from '../../graphingQuadratics.js';

// constants
const A_RANGE = new RangeWithValue(-6, 6, 1); // a coefficient
const H_RANGE = new RangeWithValue(-9, 9, 0); // h coefficient
const K_RANGE = new RangeWithValue(-9, 9, 0); // k coefficient

export default class VertexFormModel extends GQModel {
  // Coefficients of vertex form: y = a(x - h)^2 + k

  constructor(tandem) {
    // a
    const aProperty = new NumberProperty(A_RANGE.defaultValue, {
      numberType: 'Integer',
      range: A_RANGE,
      tandem: tandem.createTandem('aProperty'),
      phetioDocumentation: StringUtils.fillIn(GQConstants.VALUE_DOC, {
        symbol: 'a'
      })
    });
    phet.log && aProperty.link(a => {
      phet.log(`a=${a}`);
    });

    // h
    const hProperty = new NumberProperty(H_RANGE.defaultValue, {
      numberType: 'Integer',
      range: H_RANGE,
      tandem: tandem.createTandem('hProperty'),
      phetioDocumentation: StringUtils.fillIn(GQConstants.VALUE_DOC, {
        symbol: 'h'
      })
    });
    phet.log && hProperty.link(h => {
      phet.log(`h=${h}`);
    });

    // k
    const kProperty = new NumberProperty(K_RANGE.defaultValue, {
      numberType: 'Integer',
      range: K_RANGE,
      tandem: tandem.createTandem('kProperty'),
      phetioDocumentation: StringUtils.fillIn(GQConstants.VALUE_DOC, {
        symbol: 'k'
      })
    });
    phet.log && kProperty.link(k => {
      phet.log(`k=${k}`);
    });
    const quadraticProperty = new DerivedProperty([aProperty, hProperty, kProperty], (a, h, k) => Quadratic.createFromVertexForm(a, h, k, {
      color: GQColors.VERTEX_FORM_INTERACTIVE_CURVE
    }), {
      tandem: tandem.createTandem('quadraticProperty'),
      phetioDocumentation: 'the interactive quadratic, derived from a, h, and k',
      phetioValueType: Quadratic.QuadraticIO
    });
    phet.log && quadraticProperty.link(quadratic => {
      phet.log(`quadratic: y = ${quadratic.a} (x - ${quadratic.h})^2 + ${quadratic.k}`);
    });
    super(quadraticProperty, tandem);
    this.aProperty = aProperty;
    this.hProperty = hProperty;
    this.kProperty = kProperty;
  }
  reset() {
    this.aProperty.reset();
    this.hProperty.reset();
    this.kProperty.reset();
    super.reset();
  }
}
graphingQuadratics.register('VertexFormModel', VertexFormModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlV2l0aFZhbHVlIiwiU3RyaW5nVXRpbHMiLCJHUUNvbG9ycyIsIkdRQ29uc3RhbnRzIiwiR1FNb2RlbCIsIlF1YWRyYXRpYyIsImdyYXBoaW5nUXVhZHJhdGljcyIsIkFfUkFOR0UiLCJIX1JBTkdFIiwiS19SQU5HRSIsIlZlcnRleEZvcm1Nb2RlbCIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwiYVByb3BlcnR5IiwiZGVmYXVsdFZhbHVlIiwibnVtYmVyVHlwZSIsInJhbmdlIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsImZpbGxJbiIsIlZBTFVFX0RPQyIsInN5bWJvbCIsInBoZXQiLCJsb2ciLCJsaW5rIiwiYSIsImhQcm9wZXJ0eSIsImgiLCJrUHJvcGVydHkiLCJrIiwicXVhZHJhdGljUHJvcGVydHkiLCJjcmVhdGVGcm9tVmVydGV4Rm9ybSIsImNvbG9yIiwiVkVSVEVYX0ZPUk1fSU5URVJBQ1RJVkVfQ1VSVkUiLCJwaGV0aW9WYWx1ZVR5cGUiLCJRdWFkcmF0aWNJTyIsInF1YWRyYXRpYyIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJWZXJ0ZXhGb3JtTW9kZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgZm9yIHRoZSAnVmVydGV4IEZvcm0nIHNjcmVlbi5cclxuICogVmVydGV4IGZvcm0gb2YgdGhlIHF1YWRyYXRpYyBlcXVhdGlvbiBpczogeSA9IGEoeCAtIGgpXjIgKyBrXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFJhbmdlV2l0aFZhbHVlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZVdpdGhWYWx1ZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgR1FDb2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL0dRQ29sb3JzLmpzJztcclxuaW1wb3J0IEdRQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9HUUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBHUU1vZGVsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9HUU1vZGVsLmpzJztcclxuaW1wb3J0IFF1YWRyYXRpYyBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvUXVhZHJhdGljLmpzJztcclxuaW1wb3J0IGdyYXBoaW5nUXVhZHJhdGljcyBmcm9tICcuLi8uLi9ncmFwaGluZ1F1YWRyYXRpY3MuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEFfUkFOR0UgPSBuZXcgUmFuZ2VXaXRoVmFsdWUoIC02LCA2LCAxICk7IC8vIGEgY29lZmZpY2llbnRcclxuY29uc3QgSF9SQU5HRSA9IG5ldyBSYW5nZVdpdGhWYWx1ZSggLTksIDksIDAgKTsgLy8gaCBjb2VmZmljaWVudFxyXG5jb25zdCBLX1JBTkdFID0gbmV3IFJhbmdlV2l0aFZhbHVlKCAtOSwgOSwgMCApOyAvLyBrIGNvZWZmaWNpZW50XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWZXJ0ZXhGb3JtTW9kZWwgZXh0ZW5kcyBHUU1vZGVsIHtcclxuXHJcbiAgLy8gQ29lZmZpY2llbnRzIG9mIHZlcnRleCBmb3JtOiB5ID0gYSh4IC0gaCleMiArIGtcclxuICBwdWJsaWMgcmVhZG9ubHkgYVByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuICBwdWJsaWMgcmVhZG9ubHkgaFByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuICBwdWJsaWMgcmVhZG9ubHkga1Byb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICAvLyBhXHJcbiAgICBjb25zdCBhUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIEFfUkFOR0UuZGVmYXVsdFZhbHVlLCB7XHJcbiAgICAgIG51bWJlclR5cGU6ICdJbnRlZ2VyJyxcclxuICAgICAgcmFuZ2U6IEFfUkFOR0UsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogU3RyaW5nVXRpbHMuZmlsbEluKCBHUUNvbnN0YW50cy5WQUxVRV9ET0MsIHsgc3ltYm9sOiAnYScgfSApXHJcbiAgICB9ICk7XHJcbiAgICBwaGV0LmxvZyAmJiBhUHJvcGVydHkubGluayggYSA9PiB7IHBoZXQubG9nKCBgYT0ke2F9YCApOyB9ICk7XHJcblxyXG4gICAgLy8gaFxyXG4gICAgY29uc3QgaFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBIX1JBTkdFLmRlZmF1bHRWYWx1ZSwge1xyXG4gICAgICBudW1iZXJUeXBlOiAnSW50ZWdlcicsXHJcbiAgICAgIHJhbmdlOiBIX1JBTkdFLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdoUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246IFN0cmluZ1V0aWxzLmZpbGxJbiggR1FDb25zdGFudHMuVkFMVUVfRE9DLCB7IHN5bWJvbDogJ2gnIH0gKVxyXG4gICAgfSApO1xyXG4gICAgcGhldC5sb2cgJiYgaFByb3BlcnR5LmxpbmsoIGggPT4geyBwaGV0LmxvZyggYGg9JHtofWAgKTsgfSApO1xyXG5cclxuICAgIC8vIGtcclxuICAgIGNvbnN0IGtQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggS19SQU5HRS5kZWZhdWx0VmFsdWUsIHtcclxuICAgICAgbnVtYmVyVHlwZTogJ0ludGVnZXInLFxyXG4gICAgICByYW5nZTogS19SQU5HRSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAna1Byb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiBTdHJpbmdVdGlscy5maWxsSW4oIEdRQ29uc3RhbnRzLlZBTFVFX0RPQywgeyBzeW1ib2w6ICdrJyB9IClcclxuICAgIH0gKTtcclxuICAgIHBoZXQubG9nICYmIGtQcm9wZXJ0eS5saW5rKCBrID0+IHsgcGhldC5sb2coIGBrPSR7a31gICk7IH0gKTtcclxuXHJcbiAgICBjb25zdCBxdWFkcmF0aWNQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgYVByb3BlcnR5LCBoUHJvcGVydHksIGtQcm9wZXJ0eSBdLFxyXG4gICAgICAoIGEsIGgsIGsgKSA9PiBRdWFkcmF0aWMuY3JlYXRlRnJvbVZlcnRleEZvcm0oIGEsIGgsIGssIHtcclxuICAgICAgICBjb2xvcjogR1FDb2xvcnMuVkVSVEVYX0ZPUk1fSU5URVJBQ1RJVkVfQ1VSVkVcclxuICAgICAgfSApLCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncXVhZHJhdGljUHJvcGVydHknICksXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBpbnRlcmFjdGl2ZSBxdWFkcmF0aWMsIGRlcml2ZWQgZnJvbSBhLCBoLCBhbmQgaycsXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBRdWFkcmF0aWMuUXVhZHJhdGljSU9cclxuICAgICAgfSApO1xyXG4gICAgcGhldC5sb2cgJiYgcXVhZHJhdGljUHJvcGVydHkubGluayggcXVhZHJhdGljID0+IHtcclxuICAgICAgcGhldC5sb2coIGBxdWFkcmF0aWM6IHkgPSAke3F1YWRyYXRpYy5hfSAoeCAtICR7cXVhZHJhdGljLmh9KV4yICsgJHtxdWFkcmF0aWMua31gICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIHF1YWRyYXRpY1Byb3BlcnR5LCB0YW5kZW0gKTtcclxuXHJcbiAgICB0aGlzLmFQcm9wZXJ0eSA9IGFQcm9wZXJ0eTtcclxuICAgIHRoaXMuaFByb3BlcnR5ID0gaFByb3BlcnR5O1xyXG4gICAgdGhpcy5rUHJvcGVydHkgPSBrUHJvcGVydHk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLmFQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5oUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMua1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICBzdXBlci5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxuZ3JhcGhpbmdRdWFkcmF0aWNzLnJlZ2lzdGVyKCAnVmVydGV4Rm9ybU1vZGVsJywgVmVydGV4Rm9ybU1vZGVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLGNBQWMsTUFBTSxzQ0FBc0M7QUFDakUsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUV2RSxPQUFPQyxRQUFRLE1BQU0sMEJBQTBCO0FBQy9DLE9BQU9DLFdBQVcsTUFBTSw2QkFBNkI7QUFDckQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2Qjs7QUFFNUQ7QUFDQSxNQUFNQyxPQUFPLEdBQUcsSUFBSVAsY0FBYyxDQUFFLENBQUMs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