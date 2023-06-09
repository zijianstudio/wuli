// Copyright 2016-2022, University of Colorado Boulder

/**
 * Property whose value must be true or false. Truthy/falsy values are invalid.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../phet-core/js/optionize.js';
import BooleanIO from '../../tandem/js/types/BooleanIO.js';
import axon from './axon.js';
import Property from './Property.js';

// client cannot specify superclass options that are controlled by BooleanProperty

export default class BooleanProperty extends Property {
  constructor(value, providedOptions) {
    // Fill in superclass options that are controlled by BooleanProperty.
    const options = optionize()({
      valueType: 'boolean',
      phetioValueType: BooleanIO
    }, providedOptions);
    super(value, options);
  }
  toggle() {
    this.value = !this.value;
  }
}
axon.register('BooleanProperty', BooleanProperty);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJCb29sZWFuSU8iLCJheG9uIiwiUHJvcGVydHkiLCJCb29sZWFuUHJvcGVydHkiLCJjb25zdHJ1Y3RvciIsInZhbHVlIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInZhbHVlVHlwZSIsInBoZXRpb1ZhbHVlVHlwZSIsInRvZ2dsZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQm9vbGVhblByb3BlcnR5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFByb3BlcnR5IHdob3NlIHZhbHVlIG11c3QgYmUgdHJ1ZSBvciBmYWxzZS4gVHJ1dGh5L2ZhbHN5IHZhbHVlcyBhcmUgaW52YWxpZC5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgQm9vbGVhbklPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9Cb29sZWFuSU8uanMnO1xyXG5pbXBvcnQgYXhvbiBmcm9tICcuL2F4b24uanMnO1xyXG5pbXBvcnQgUHJvcGVydHksIHsgUHJvcGVydHlPcHRpb25zIH0gZnJvbSAnLi9Qcm9wZXJ0eS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbi8vIGNsaWVudCBjYW5ub3Qgc3BlY2lmeSBzdXBlcmNsYXNzIG9wdGlvbnMgdGhhdCBhcmUgY29udHJvbGxlZCBieSBCb29sZWFuUHJvcGVydHlcclxuZXhwb3J0IHR5cGUgQm9vbGVhblByb3BlcnR5T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxQcm9wZXJ0eU9wdGlvbnM8Ym9vbGVhbj4sICdpc1ZhbGlkVmFsdWUnIHwgJ3ZhbHVlVHlwZScgfCAncGhldGlvVmFsdWVUeXBlJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCb29sZWFuUHJvcGVydHkgZXh0ZW5kcyBQcm9wZXJ0eTxib29sZWFuPiB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdmFsdWU6IGJvb2xlYW4sIHByb3ZpZGVkT3B0aW9ucz86IEJvb2xlYW5Qcm9wZXJ0eU9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gRmlsbCBpbiBzdXBlcmNsYXNzIG9wdGlvbnMgdGhhdCBhcmUgY29udHJvbGxlZCBieSBCb29sZWFuUHJvcGVydHkuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEJvb2xlYW5Qcm9wZXJ0eU9wdGlvbnMsIFNlbGZPcHRpb25zLCBQcm9wZXJ0eU9wdGlvbnM8Ym9vbGVhbj4+KCkoIHtcclxuICAgICAgdmFsdWVUeXBlOiAnYm9vbGVhbicsXHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogQm9vbGVhbklPXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggdmFsdWUsIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB0b2dnbGUoKTogdm9pZCB7XHJcbiAgICB0aGlzLnZhbHVlID0gIXRoaXMudmFsdWU7XHJcbiAgfVxyXG59XHJcblxyXG5heG9uLnJlZ2lzdGVyKCAnQm9vbGVhblByb3BlcnR5JywgQm9vbGVhblByb3BlcnR5ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUE0QixpQ0FBaUM7QUFFN0UsT0FBT0MsU0FBUyxNQUFNLG9DQUFvQztBQUMxRCxPQUFPQyxJQUFJLE1BQU0sV0FBVztBQUM1QixPQUFPQyxRQUFRLE1BQTJCLGVBQWU7O0FBSXpEOztBQUdBLGVBQWUsTUFBTUMsZUFBZSxTQUFTRCxRQUFRLENBQVU7RUFFdERFLFdBQVdBLENBQUVDLEtBQWMsRUFBRUMsZUFBd0MsRUFBRztJQUU3RTtJQUNBLE1BQU1DLE9BQU8sR0FBR1IsU0FBUyxDQUFnRSxDQUFDLENBQUU7TUFDMUZTLFNBQVMsRUFBRSxTQUFTO01BQ3BCQyxlQUFlLEVBQUVUO0lBQ25CLENBQUMsRUFBRU0sZUFBZ0IsQ0FBQztJQUVwQixLQUFLLENBQUVELEtBQUssRUFBRUUsT0FBUSxDQUFDO0VBQ3pCO0VBRU9HLE1BQU1BLENBQUEsRUFBUztJQUNwQixJQUFJLENBQUNMLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQ0EsS0FBSztFQUMxQjtBQUNGO0FBRUFKLElBQUksQ0FBQ1UsUUFBUSxDQUFFLGlCQUFpQixFQUFFUixlQUFnQixDQUFDIn0=