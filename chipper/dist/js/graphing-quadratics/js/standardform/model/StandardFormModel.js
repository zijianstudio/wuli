// Copyright 2014-2023, University of Colorado Boulder

/**
 * Model for the 'Standard Form' screen.
 * Standard form of the quadratic equation is: y = ax^2 + bx + c
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import merge from '../../../../phet-core/js/merge.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import GQModel from '../../common/model/GQModel.js';
import Quadratic from '../../common/model/Quadratic.js';
import graphingQuadratics from '../../graphingQuadratics.js';

// constants
const A_RANGE = new RangeWithValue(-6, 6, 1); // a coefficient
const B_RANGE = new RangeWithValue(-6, 6, 0); // b coefficient
const C_RANGE = new RangeWithValue(-6, 6, 0); // c constant

export default class StandardFormModel extends GQModel {
  // Coefficients for standard form: y = ax^2 + bx + c

  constructor(tandem, providedOptions) {
    const options = optionize()({
      // SelfOptions
      numberType: 'Integer'
    }, providedOptions);

    // Options for all NumberProperty instances
    const numberPropertyOptions = {
      numberType: options.numberType
    };

    // a
    const aProperty = new NumberProperty(A_RANGE.defaultValue, merge({
      range: A_RANGE,
      tandem: tandem.createTandem('aProperty'),
      phetioDocumentation: StringUtils.fillIn(GQConstants.VALUE_DOC, {
        symbol: 'a'
      })
    }, numberPropertyOptions));
    phet.log && aProperty.link(a => {
      phet.log(`a=${a}`);
    });

    // b
    const bProperty = new NumberProperty(B_RANGE.defaultValue, merge({
      range: B_RANGE,
      tandem: tandem.createTandem('bProperty'),
      phetioDocumentation: StringUtils.fillIn(GQConstants.VALUE_DOC, {
        symbol: 'b'
      })
    }, numberPropertyOptions));
    phet.log && bProperty.link(b => {
      phet.log(`b=${b}`);
    });

    // c
    const cProperty = new NumberProperty(C_RANGE.defaultValue, merge({
      range: C_RANGE,
      tandem: tandem.createTandem('cProperty'),
      phetioDocumentation: StringUtils.fillIn(GQConstants.VALUE_DOC, {
        symbol: 'c'
      })
    }, numberPropertyOptions));
    phet.log && cProperty.link(c => {
      phet.log(`c=${c}`);
    });

    // {DerivedProperty.<Quadratic>}
    const quadraticProperty = new DerivedProperty([aProperty, bProperty, cProperty], (a, b, c) => new Quadratic(a, b, c, {
      color: GQColors.EXPLORE_INTERACTIVE_CURVE
    }), {
      tandem: tandem.createTandem('quadraticProperty'),
      phetioValueType: Quadratic.QuadraticIO,
      phetioDocumentation: 'the interactive quadratic, derived from a, b, and c'
    });
    phet.log && quadraticProperty.link(quadratic => {
      phet.log(`quadratic: y = ${quadratic.a} x^2 + ${quadratic.b} x + ${quadratic.c}`);
    });
    super(quadraticProperty, tandem);
    this.aProperty = aProperty;
    this.bProperty = bProperty;
    this.cProperty = cProperty;
  }
  reset() {
    this.aProperty.reset();
    this.bProperty.reset();
    this.cProperty.reset();
    super.reset();
  }
}
graphingQuadratics.register('StandardFormModel', StandardFormModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlV2l0aFZhbHVlIiwibWVyZ2UiLCJvcHRpb25pemUiLCJTdHJpbmdVdGlscyIsIkdRQ29sb3JzIiwiR1FDb25zdGFudHMiLCJHUU1vZGVsIiwiUXVhZHJhdGljIiwiZ3JhcGhpbmdRdWFkcmF0aWNzIiwiQV9SQU5HRSIsIkJfUkFOR0UiLCJDX1JBTkdFIiwiU3RhbmRhcmRGb3JtTW9kZWwiLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJudW1iZXJUeXBlIiwibnVtYmVyUHJvcGVydHlPcHRpb25zIiwiYVByb3BlcnR5IiwiZGVmYXVsdFZhbHVlIiwicmFuZ2UiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiZmlsbEluIiwiVkFMVUVfRE9DIiwic3ltYm9sIiwicGhldCIsImxvZyIsImxpbmsiLCJhIiwiYlByb3BlcnR5IiwiYiIsImNQcm9wZXJ0eSIsImMiLCJxdWFkcmF0aWNQcm9wZXJ0eSIsImNvbG9yIiwiRVhQTE9SRV9JTlRFUkFDVElWRV9DVVJWRSIsInBoZXRpb1ZhbHVlVHlwZSIsIlF1YWRyYXRpY0lPIiwicXVhZHJhdGljIiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN0YW5kYXJkRm9ybU1vZGVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIGZvciB0aGUgJ1N0YW5kYXJkIEZvcm0nIHNjcmVlbi5cclxuICogU3RhbmRhcmQgZm9ybSBvZiB0aGUgcXVhZHJhdGljIGVxdWF0aW9uIGlzOiB5ID0gYXheMiArIGJ4ICsgY1xyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHksIHsgTnVtYmVyUHJvcGVydHlPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZVdpdGhWYWx1ZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2VXaXRoVmFsdWUuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tPcHRpb25hbCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja09wdGlvbmFsLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBHUUNvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vR1FDb2xvcnMuanMnO1xyXG5pbXBvcnQgR1FDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0dRQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEdRTW9kZWwgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0dRTW9kZWwuanMnO1xyXG5pbXBvcnQgUXVhZHJhdGljIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9RdWFkcmF0aWMuanMnO1xyXG5pbXBvcnQgZ3JhcGhpbmdRdWFkcmF0aWNzIGZyb20gJy4uLy4uL2dyYXBoaW5nUXVhZHJhdGljcy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQV9SQU5HRSA9IG5ldyBSYW5nZVdpdGhWYWx1ZSggLTYsIDYsIDEgKTsgLy8gYSBjb2VmZmljaWVudFxyXG5jb25zdCBCX1JBTkdFID0gbmV3IFJhbmdlV2l0aFZhbHVlKCAtNiwgNiwgMCApOyAvLyBiIGNvZWZmaWNpZW50XHJcbmNvbnN0IENfUkFOR0UgPSBuZXcgUmFuZ2VXaXRoVmFsdWUoIC02LCA2LCAwICk7IC8vIGMgY29uc3RhbnRcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBQaWNrT3B0aW9uYWw8TnVtYmVyUHJvcGVydHlPcHRpb25zLCAnbnVtYmVyVHlwZSc+O1xyXG5cclxudHlwZSBTdGFuZGFyZEZvcm1Nb2RlbE9wdGlvbnMgPSBTZWxmT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YW5kYXJkRm9ybU1vZGVsIGV4dGVuZHMgR1FNb2RlbCB7XHJcblxyXG4gIC8vIENvZWZmaWNpZW50cyBmb3Igc3RhbmRhcmQgZm9ybTogeSA9IGF4XjIgKyBieCArIGNcclxuICBwdWJsaWMgcmVhZG9ubHkgYVByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuICBwdWJsaWMgcmVhZG9ubHkgYlByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuICBwdWJsaWMgcmVhZG9ubHkgY1Byb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0YW5kZW06IFRhbmRlbSwgcHJvdmlkZWRPcHRpb25zPzogU3RhbmRhcmRGb3JtTW9kZWxPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U3RhbmRhcmRGb3JtTW9kZWxPcHRpb25zLCBTZWxmT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgbnVtYmVyVHlwZTogJ0ludGVnZXInXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBPcHRpb25zIGZvciBhbGwgTnVtYmVyUHJvcGVydHkgaW5zdGFuY2VzXHJcbiAgICBjb25zdCBudW1iZXJQcm9wZXJ0eU9wdGlvbnMgPSB7XHJcbiAgICAgIG51bWJlclR5cGU6IG9wdGlvbnMubnVtYmVyVHlwZVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBhXHJcbiAgICBjb25zdCBhUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIEFfUkFOR0UuZGVmYXVsdFZhbHVlLCBtZXJnZSgge1xyXG4gICAgICByYW5nZTogQV9SQU5HRSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiBTdHJpbmdVdGlscy5maWxsSW4oIEdRQ29uc3RhbnRzLlZBTFVFX0RPQywgeyBzeW1ib2w6ICdhJyB9IClcclxuICAgIH0sIG51bWJlclByb3BlcnR5T3B0aW9ucyApICk7XHJcbiAgICBwaGV0LmxvZyAmJiBhUHJvcGVydHkubGluayggYSA9PiB7IHBoZXQubG9nKCBgYT0ke2F9YCApOyB9ICk7XHJcblxyXG4gICAgLy8gYlxyXG4gICAgY29uc3QgYlByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBCX1JBTkdFLmRlZmF1bHRWYWx1ZSwgbWVyZ2UoIHtcclxuICAgICAgcmFuZ2U6IEJfUkFOR0UsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2JQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogU3RyaW5nVXRpbHMuZmlsbEluKCBHUUNvbnN0YW50cy5WQUxVRV9ET0MsIHsgc3ltYm9sOiAnYicgfSApXHJcbiAgICB9LCBudW1iZXJQcm9wZXJ0eU9wdGlvbnMgKSApO1xyXG4gICAgcGhldC5sb2cgJiYgYlByb3BlcnR5LmxpbmsoIGIgPT4geyBwaGV0LmxvZyggYGI9JHtifWAgKTsgfSApO1xyXG5cclxuICAgIC8vIGNcclxuICAgIGNvbnN0IGNQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggQ19SQU5HRS5kZWZhdWx0VmFsdWUsIG1lcmdlKCB7XHJcbiAgICAgIHJhbmdlOiBDX1JBTkdFLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246IFN0cmluZ1V0aWxzLmZpbGxJbiggR1FDb25zdGFudHMuVkFMVUVfRE9DLCB7IHN5bWJvbDogJ2MnIH0gKVxyXG4gICAgfSwgbnVtYmVyUHJvcGVydHlPcHRpb25zICkgKTtcclxuICAgIHBoZXQubG9nICYmIGNQcm9wZXJ0eS5saW5rKCBjID0+IHsgcGhldC5sb2coIGBjPSR7Y31gICk7IH0gKTtcclxuXHJcbiAgICAvLyB7RGVyaXZlZFByb3BlcnR5LjxRdWFkcmF0aWM+fVxyXG4gICAgY29uc3QgcXVhZHJhdGljUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIGFQcm9wZXJ0eSwgYlByb3BlcnR5LCBjUHJvcGVydHkgXSxcclxuICAgICAgKCBhLCBiLCBjICkgPT4gbmV3IFF1YWRyYXRpYyggYSwgYiwgYywgeyBjb2xvcjogR1FDb2xvcnMuRVhQTE9SRV9JTlRFUkFDVElWRV9DVVJWRSB9ICksIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdxdWFkcmF0aWNQcm9wZXJ0eScgKSxcclxuICAgICAgICBwaGV0aW9WYWx1ZVR5cGU6IFF1YWRyYXRpYy5RdWFkcmF0aWNJTyxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndGhlIGludGVyYWN0aXZlIHF1YWRyYXRpYywgZGVyaXZlZCBmcm9tIGEsIGIsIGFuZCBjJ1xyXG4gICAgICB9ICk7XHJcbiAgICBwaGV0LmxvZyAmJiBxdWFkcmF0aWNQcm9wZXJ0eS5saW5rKCBxdWFkcmF0aWMgPT4ge1xyXG4gICAgICBwaGV0LmxvZyggYHF1YWRyYXRpYzogeSA9ICR7cXVhZHJhdGljLmF9IHheMiArICR7cXVhZHJhdGljLmJ9IHggKyAke3F1YWRyYXRpYy5jfWAgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggcXVhZHJhdGljUHJvcGVydHksIHRhbmRlbSApO1xyXG5cclxuICAgIHRoaXMuYVByb3BlcnR5ID0gYVByb3BlcnR5O1xyXG4gICAgdGhpcy5iUHJvcGVydHkgPSBiUHJvcGVydHk7XHJcbiAgICB0aGlzLmNQcm9wZXJ0eSA9IGNQcm9wZXJ0eTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMuYVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmJQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5jUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmFwaGluZ1F1YWRyYXRpY3MucmVnaXN0ZXIoICdTdGFuZGFyZEZvcm1Nb2RlbCcsIFN0YW5kYXJkRm9ybU1vZGVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxjQUFjLE1BQWlDLHVDQUF1QztBQUM3RixPQUFPQyxjQUFjLE1BQU0sc0NBQXNDO0FBQ2pFLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsU0FBUyxNQUFNLHVDQUF1QztBQUU3RCxPQUFPQyxXQUFXLE1BQU0sK0NBQStDO0FBRXZFLE9BQU9DLFFBQVEsTUFBTSwwQkFBMEI7QUFDL0MsT0FBT0MsV0FBVyxNQUFNLDZCQUE2QjtBQUNyRCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCOztBQUU1RDtBQUNBLE1BQU1DLE9BQU8sR0FBRyxJQUFJVCxjQUFjLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDLENBQUM7QUFDaEQsTUFBTVUsT0FBTyxHQUFHLElBQUlWLGNB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