// Copyright 2019-2023, University of Colorado Boulder

/**
 * A Property that is based on the step-based interpolation between a current and previous value.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
export default class InterpolatedProperty extends Property {
  constructor(initialValue, providedConfig) {
    const config = optionize()({
      phetioOuterType: InterpolatedProperty.InterpolatedPropertyIO
    }, providedConfig);
    super(initialValue, config);
    this.interpolate = config.interpolate;
    this.currentValue = initialValue;
    this.previousValue = initialValue;
    this.ratio = 0;
  }

  /**
   * Sets the next value to be used (will NOT change the value of this Property).
   */
  setNextValue(value) {
    this.previousValue = this.currentValue;
    this.currentValue = value;
  }

  /**
   * Sets the ratio to use for interpolated values (WILL change the value of this Property generally).
   */
  setRatio(ratio) {
    this.ratio = ratio;
    this.value = this.interpolate(this.previousValue, this.currentValue, this.ratio);
  }

  /**
   * Resets the Property to its initial state.
   */
  reset() {
    super.reset();
    this.currentValue = this.value;
    this.previousValue = this.value;
    this.ratio = 0;
  }

  /**
   * Interpolation for numbers.
   */
  static interpolateNumber(a, b, ratio) {
    return a + (b - a) * ratio;
  }

  /**
   * Interpolation for Vector2.
   */
  static interpolateVector2(a, b, ratio) {
    return a.blend(b, ratio);
  }

  /**
   * Interpolation for Vector3.
   */
  static interpolateVector3(a, b, ratio) {
    return a.blend(b, ratio);
  }
  static InterpolatedPropertyIO = parameterType => {
    assert && assert(parameterType, 'InterpolatedPropertyIO needs parameterType');
    if (!cache.has(parameterType)) {
      const PropertyIOImpl = Property.PropertyIO(parameterType);
      const ioType = new IOType(`InterpolatedPropertyIO<${parameterType.typeName}>`, {
        valueType: InterpolatedProperty,
        supertype: PropertyIOImpl,
        parameterTypes: [parameterType],
        documentation: 'Extends PropertyIO to interpolation (with a current/previous value, and a ratio between the two)',
        toStateObject: interpolatedProperty => {
          const parentStateObject = PropertyIOImpl.toStateObject(interpolatedProperty);
          parentStateObject.currentValue = parameterType.toStateObject(interpolatedProperty.currentValue);
          parentStateObject.previousValue = parameterType.toStateObject(interpolatedProperty.previousValue);
          parentStateObject.ratio = interpolatedProperty.ratio;
          return parentStateObject;
        },
        applyState: (interpolatedProperty, stateObject) => {
          PropertyIOImpl.applyState(interpolatedProperty, stateObject);
          interpolatedProperty.currentValue = parameterType.fromStateObject(stateObject.currentValue);
          interpolatedProperty.previousValue = parameterType.fromStateObject(stateObject.previousValue);
          interpolatedProperty.ratio = stateObject.ratio;
        },
        stateSchema: {
          currentValue: parameterType,
          previousValue: parameterType,
          ratio: NumberIO
        }
      });
      cache.set(parameterType, ioType);
    }
    return cache.get(parameterType);
  };
}

// {Map.<IOType, IOType>} - Cache each parameterized PropertyIO based on
// the parameter type, so that it is only created once
const cache = new Map();
densityBuoyancyCommon.register('InterpolatedProperty', InterpolatedProperty);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIm9wdGlvbml6ZSIsIklPVHlwZSIsIk51bWJlcklPIiwiZGVuc2l0eUJ1b3lhbmN5Q29tbW9uIiwiSW50ZXJwb2xhdGVkUHJvcGVydHkiLCJjb25zdHJ1Y3RvciIsImluaXRpYWxWYWx1ZSIsInByb3ZpZGVkQ29uZmlnIiwiY29uZmlnIiwicGhldGlvT3V0ZXJUeXBlIiwiSW50ZXJwb2xhdGVkUHJvcGVydHlJTyIsImludGVycG9sYXRlIiwiY3VycmVudFZhbHVlIiwicHJldmlvdXNWYWx1ZSIsInJhdGlvIiwic2V0TmV4dFZhbHVlIiwidmFsdWUiLCJzZXRSYXRpbyIsInJlc2V0IiwiaW50ZXJwb2xhdGVOdW1iZXIiLCJhIiwiYiIsImludGVycG9sYXRlVmVjdG9yMiIsImJsZW5kIiwiaW50ZXJwb2xhdGVWZWN0b3IzIiwicGFyYW1ldGVyVHlwZSIsImFzc2VydCIsImNhY2hlIiwiaGFzIiwiUHJvcGVydHlJT0ltcGwiLCJQcm9wZXJ0eUlPIiwiaW9UeXBlIiwidHlwZU5hbWUiLCJ2YWx1ZVR5cGUiLCJzdXBlcnR5cGUiLCJwYXJhbWV0ZXJUeXBlcyIsImRvY3VtZW50YXRpb24iLCJ0b1N0YXRlT2JqZWN0IiwiaW50ZXJwb2xhdGVkUHJvcGVydHkiLCJwYXJlbnRTdGF0ZU9iamVjdCIsImFwcGx5U3RhdGUiLCJzdGF0ZU9iamVjdCIsImZyb21TdGF0ZU9iamVjdCIsInN0YXRlU2NoZW1hIiwic2V0IiwiZ2V0IiwiTWFwIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbnRlcnBvbGF0ZWRQcm9wZXJ0eS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIFByb3BlcnR5IHRoYXQgaXMgYmFzZWQgb24gdGhlIHN0ZXAtYmFzZWQgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIGEgY3VycmVudCBhbmQgcHJldmlvdXMgdmFsdWUuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHksIHsgUHJvcGVydHlPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IFJlYWRPbmx5UHJvcGVydHlTdGF0ZSB9IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjMuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBkZW5zaXR5QnVveWFuY3lDb21tb24gZnJvbSAnLi4vLi4vZGVuc2l0eUJ1b3lhbmN5Q29tbW9uLmpzJztcclxuXHJcbnR5cGUgSW50ZXJwb2xhdGU8VD4gPSAoIGE6IFQsIGI6IFQsIHJhdGlvOiBudW1iZXIgKSA9PiBUO1xyXG50eXBlIFNlbGZPcHRpb25zPFQ+ID0ge1xyXG4gIGludGVycG9sYXRlOiBJbnRlcnBvbGF0ZTxUPjtcclxufTtcclxuZXhwb3J0IHR5cGUgSW50ZXJwb2xhdGVkUHJvcGVydHlPcHRpb25zPFQ+ID0gU2VsZk9wdGlvbnM8VD4gJiBQcm9wZXJ0eU9wdGlvbnM8VD47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlcnBvbGF0ZWRQcm9wZXJ0eTxUPiBleHRlbmRzIFByb3BlcnR5PFQ+IHtcclxuXHJcbiAgcHVibGljIGN1cnJlbnRWYWx1ZTogVDtcclxuICBwdWJsaWMgcHJldmlvdXNWYWx1ZTogVDtcclxuICBwdWJsaWMgcmF0aW86IG51bWJlcjtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBpbnRlcnBvbGF0ZTogSW50ZXJwb2xhdGU8VD47XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggaW5pdGlhbFZhbHVlOiBULCBwcm92aWRlZENvbmZpZzogSW50ZXJwb2xhdGVkUHJvcGVydHlPcHRpb25zPFQ+ICkge1xyXG5cclxuICAgIGNvbnN0IGNvbmZpZyA9IG9wdGlvbml6ZTxJbnRlcnBvbGF0ZWRQcm9wZXJ0eU9wdGlvbnM8VD4sIFNlbGZPcHRpb25zPFQ+LCBQcm9wZXJ0eU9wdGlvbnM8VD4+KCkoIHtcclxuICAgICAgcGhldGlvT3V0ZXJUeXBlOiBJbnRlcnBvbGF0ZWRQcm9wZXJ0eS5JbnRlcnBvbGF0ZWRQcm9wZXJ0eUlPXHJcbiAgICB9LCBwcm92aWRlZENvbmZpZyApO1xyXG5cclxuICAgIHN1cGVyKCBpbml0aWFsVmFsdWUsIGNvbmZpZyApO1xyXG5cclxuICAgIHRoaXMuaW50ZXJwb2xhdGUgPSBjb25maWcuaW50ZXJwb2xhdGU7XHJcblxyXG4gICAgdGhpcy5jdXJyZW50VmFsdWUgPSBpbml0aWFsVmFsdWU7XHJcbiAgICB0aGlzLnByZXZpb3VzVmFsdWUgPSBpbml0aWFsVmFsdWU7XHJcblxyXG4gICAgdGhpcy5yYXRpbyA9IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBuZXh0IHZhbHVlIHRvIGJlIHVzZWQgKHdpbGwgTk9UIGNoYW5nZSB0aGUgdmFsdWUgb2YgdGhpcyBQcm9wZXJ0eSkuXHJcbiAgICovXHJcbiAgcHVibGljIHNldE5leHRWYWx1ZSggdmFsdWU6IFQgKTogdm9pZCB7XHJcbiAgICB0aGlzLnByZXZpb3VzVmFsdWUgPSB0aGlzLmN1cnJlbnRWYWx1ZTtcclxuICAgIHRoaXMuY3VycmVudFZhbHVlID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSByYXRpbyB0byB1c2UgZm9yIGludGVycG9sYXRlZCB2YWx1ZXMgKFdJTEwgY2hhbmdlIHRoZSB2YWx1ZSBvZiB0aGlzIFByb3BlcnR5IGdlbmVyYWxseSkuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFJhdGlvKCByYXRpbzogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgdGhpcy5yYXRpbyA9IHJhdGlvO1xyXG5cclxuICAgIHRoaXMudmFsdWUgPSB0aGlzLmludGVycG9sYXRlKCB0aGlzLnByZXZpb3VzVmFsdWUsIHRoaXMuY3VycmVudFZhbHVlLCB0aGlzLnJhdGlvICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhlIFByb3BlcnR5IHRvIGl0cyBpbml0aWFsIHN0YXRlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSByZXNldCgpOiB2b2lkIHtcclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcblxyXG4gICAgdGhpcy5jdXJyZW50VmFsdWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgdGhpcy5wcmV2aW91c1ZhbHVlID0gdGhpcy52YWx1ZTtcclxuICAgIHRoaXMucmF0aW8gPSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW50ZXJwb2xhdGlvbiBmb3IgbnVtYmVycy5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGludGVycG9sYXRlTnVtYmVyKCBhOiBudW1iZXIsIGI6IG51bWJlciwgcmF0aW86IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIGEgKyAoIGIgLSBhICkgKiByYXRpbztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVycG9sYXRpb24gZm9yIFZlY3RvcjIuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBpbnRlcnBvbGF0ZVZlY3RvcjIoIGE6IFZlY3RvcjIsIGI6IFZlY3RvcjIsIHJhdGlvOiBudW1iZXIgKTogVmVjdG9yMiB7XHJcbiAgICByZXR1cm4gYS5ibGVuZCggYiwgcmF0aW8gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVycG9sYXRpb24gZm9yIFZlY3RvcjMuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBpbnRlcnBvbGF0ZVZlY3RvcjMoIGE6IFZlY3RvcjMsIGI6IFZlY3RvcjMsIHJhdGlvOiBudW1iZXIgKTogVmVjdG9yMyB7XHJcbiAgICByZXR1cm4gYS5ibGVuZCggYiwgcmF0aW8gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSW50ZXJwb2xhdGVkUHJvcGVydHlJTyA9ICggcGFyYW1ldGVyVHlwZTogSU9UeXBlICk6IElPVHlwZSA9PiB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwYXJhbWV0ZXJUeXBlLCAnSW50ZXJwb2xhdGVkUHJvcGVydHlJTyBuZWVkcyBwYXJhbWV0ZXJUeXBlJyApO1xyXG5cclxuICAgIGlmICggIWNhY2hlLmhhcyggcGFyYW1ldGVyVHlwZSApICkge1xyXG4gICAgICBjb25zdCBQcm9wZXJ0eUlPSW1wbCA9IFByb3BlcnR5LlByb3BlcnR5SU8oIHBhcmFtZXRlclR5cGUgKTtcclxuXHJcbiAgICAgIGNvbnN0IGlvVHlwZSA9IG5ldyBJT1R5cGUoIGBJbnRlcnBvbGF0ZWRQcm9wZXJ0eUlPPCR7cGFyYW1ldGVyVHlwZS50eXBlTmFtZX0+YCwge1xyXG4gICAgICAgIHZhbHVlVHlwZTogSW50ZXJwb2xhdGVkUHJvcGVydHksXHJcbiAgICAgICAgc3VwZXJ0eXBlOiBQcm9wZXJ0eUlPSW1wbCxcclxuICAgICAgICBwYXJhbWV0ZXJUeXBlczogWyBwYXJhbWV0ZXJUeXBlIF0sXHJcbiAgICAgICAgZG9jdW1lbnRhdGlvbjogJ0V4dGVuZHMgUHJvcGVydHlJTyB0byBpbnRlcnBvbGF0aW9uICh3aXRoIGEgY3VycmVudC9wcmV2aW91cyB2YWx1ZSwgYW5kIGEgcmF0aW8gYmV0d2VlbiB0aGUgdHdvKScsXHJcbiAgICAgICAgdG9TdGF0ZU9iamVjdDogKCBpbnRlcnBvbGF0ZWRQcm9wZXJ0eTogSW50ZXJwb2xhdGVkUHJvcGVydHk8SW50ZW50aW9uYWxBbnk+ICk6IEludGVycG9sYXRlZFByb3BlcnR5SU9TdGF0ZU9iamVjdCA9PiB7XHJcblxyXG4gICAgICAgICAgY29uc3QgcGFyZW50U3RhdGVPYmplY3QgPSBQcm9wZXJ0eUlPSW1wbC50b1N0YXRlT2JqZWN0KCBpbnRlcnBvbGF0ZWRQcm9wZXJ0eSApO1xyXG5cclxuICAgICAgICAgIHBhcmVudFN0YXRlT2JqZWN0LmN1cnJlbnRWYWx1ZSA9IHBhcmFtZXRlclR5cGUudG9TdGF0ZU9iamVjdCggaW50ZXJwb2xhdGVkUHJvcGVydHkuY3VycmVudFZhbHVlICk7XHJcbiAgICAgICAgICBwYXJlbnRTdGF0ZU9iamVjdC5wcmV2aW91c1ZhbHVlID0gcGFyYW1ldGVyVHlwZS50b1N0YXRlT2JqZWN0KCBpbnRlcnBvbGF0ZWRQcm9wZXJ0eS5wcmV2aW91c1ZhbHVlICk7XHJcbiAgICAgICAgICBwYXJlbnRTdGF0ZU9iamVjdC5yYXRpbyA9IGludGVycG9sYXRlZFByb3BlcnR5LnJhdGlvO1xyXG5cclxuICAgICAgICAgIHJldHVybiBwYXJlbnRTdGF0ZU9iamVjdDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFwcGx5U3RhdGU6ICggaW50ZXJwb2xhdGVkUHJvcGVydHk6IEludGVycG9sYXRlZFByb3BlcnR5PEludGVudGlvbmFsQW55Piwgc3RhdGVPYmplY3Q6IEludGVycG9sYXRlZFByb3BlcnR5SU9TdGF0ZU9iamVjdCApID0+IHtcclxuICAgICAgICAgIFByb3BlcnR5SU9JbXBsLmFwcGx5U3RhdGUoIGludGVycG9sYXRlZFByb3BlcnR5LCBzdGF0ZU9iamVjdCApO1xyXG4gICAgICAgICAgaW50ZXJwb2xhdGVkUHJvcGVydHkuY3VycmVudFZhbHVlID0gcGFyYW1ldGVyVHlwZS5mcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0LmN1cnJlbnRWYWx1ZSApO1xyXG4gICAgICAgICAgaW50ZXJwb2xhdGVkUHJvcGVydHkucHJldmlvdXNWYWx1ZSA9IHBhcmFtZXRlclR5cGUuZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdC5wcmV2aW91c1ZhbHVlICk7XHJcbiAgICAgICAgICBpbnRlcnBvbGF0ZWRQcm9wZXJ0eS5yYXRpbyA9IHN0YXRlT2JqZWN0LnJhdGlvO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3RhdGVTY2hlbWE6IHtcclxuICAgICAgICAgIGN1cnJlbnRWYWx1ZTogcGFyYW1ldGVyVHlwZSxcclxuICAgICAgICAgIHByZXZpb3VzVmFsdWU6IHBhcmFtZXRlclR5cGUsXHJcbiAgICAgICAgICByYXRpbzogTnVtYmVySU9cclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGNhY2hlLnNldCggcGFyYW1ldGVyVHlwZSwgaW9UeXBlICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNhY2hlLmdldCggcGFyYW1ldGVyVHlwZSApITtcclxuICB9O1xyXG59XHJcblxyXG4vLyB7TWFwLjxJT1R5cGUsIElPVHlwZT59IC0gQ2FjaGUgZWFjaCBwYXJhbWV0ZXJpemVkIFByb3BlcnR5SU8gYmFzZWQgb25cclxuLy8gdGhlIHBhcmFtZXRlciB0eXBlLCBzbyB0aGF0IGl0IGlzIG9ubHkgY3JlYXRlZCBvbmNlXHJcbmNvbnN0IGNhY2hlID0gbmV3IE1hcDxJT1R5cGUsIElPVHlwZT4oKTtcclxuXHJcbmV4cG9ydCB0eXBlIEludGVycG9sYXRlZFByb3BlcnR5SU9TdGF0ZU9iamVjdCA9IFJlYWRPbmx5UHJvcGVydHlTdGF0ZTxJbnRlbnRpb25hbEFueT4gJiB7XHJcbiAgY3VycmVudFZhbHVlOiBJbnRlbnRpb25hbEFueTtcclxuICBwcmV2aW91c1ZhbHVlOiBJbnRlbnRpb25hbEFueTtcclxuICByYXRpbzogbnVtYmVyO1xyXG59O1xyXG5cclxuZGVuc2l0eUJ1b3lhbmN5Q29tbW9uLnJlZ2lzdGVyKCAnSW50ZXJwb2xhdGVkUHJvcGVydHknLCBJbnRlcnBvbGF0ZWRQcm9wZXJ0eSApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUEyQixpQ0FBaUM7QUFJM0UsT0FBT0MsU0FBUyxNQUFNLHVDQUF1QztBQUU3RCxPQUFPQyxNQUFNLE1BQU0sdUNBQXVDO0FBQzFELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDO0FBUWxFLGVBQWUsTUFBTUMsb0JBQW9CLFNBQVlMLFFBQVEsQ0FBSTtFQVF4RE0sV0FBV0EsQ0FBRUMsWUFBZSxFQUFFQyxjQUE4QyxFQUFHO0lBRXBGLE1BQU1DLE1BQU0sR0FBR1IsU0FBUyxDQUFxRSxDQUFDLENBQUU7TUFDOUZTLGVBQWUsRUFBRUwsb0JBQW9CLENBQUNNO0lBQ3hDLENBQUMsRUFBRUgsY0FBZSxDQUFDO0lBRW5CLEtBQUssQ0FBRUQsWUFBWSxFQUFFRSxNQUFPLENBQUM7SUFFN0IsSUFBSSxDQUFDRyxXQUFXLEdBQUdILE1BQU0sQ0FBQ0csV0FBVztJQUVyQyxJQUFJLENBQUNDLFlBQVksR0FBR04sWUFBWTtJQUNoQyxJQUFJLENBQUNPLGFBQWEsR0FBR1AsWUFBWTtJQUVqQyxJQUFJLENBQUNRLEtBQUssR0FBRyxDQUFDO0VBQ2hCOztFQUVBO0FBQ0Y7QUFDQTtFQUNTQyxZQUFZQSxDQUFFQyxLQUFRLEVBQVM7SUFDcEMsSUFBSSxDQUFDSCxhQUFhLEdBQUcsSUFBSSxDQUFDRCxZQUFZO0lBQ3RDLElBQUksQ0FBQ0EsWUFBWSxHQUFHSSxLQUFLO0VBQzNCOztFQUVBO0FBQ0Y7QUFDQTtFQUNTQyxRQUFRQSxDQUFFSCxLQUFhLEVBQVM7SUFDckMsSUFBSSxDQUFDQSxLQUFLLEdBQUdBLEtBQUs7SUFFbEIsSUFBSSxDQUFDRSxLQUFLLEdBQUcsSUFBSSxDQUFD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