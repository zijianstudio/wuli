// Copyright 2017-2023, University of Colorado Boulder

/**
 * A 1-dimensional section of either the width or height.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import validate from '../../../../axon/js/validate.js';
import Range from '../../../../dot/js/Range.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import areaModelCommon from '../../areaModelCommon.js';
import Term from './Term.js';
class Partition {
  /**
   * @param {Orientation} orientation
   * @param {Property.<Color>} colorProperty
   */
  constructor(orientation, colorProperty) {
    validate(orientation, {
      validValues: Orientation.enumeration.values
    });
    assert && assert(colorProperty instanceof ReadOnlyProperty);

    // @public {Property.<Term|null>} - Null indicates the size is not defined.
    this.sizeProperty = new Property(null, {
      valueComparisonStrategy: 'equalsFunction',
      isValidValue: Term.isTermOrNull
    });

    // @public {Orientation} - an intrinsic property of the Partition
    this.orientation = orientation;

    // @public {Property.<Color>}
    this.colorProperty = colorProperty;

    // @public {Property.<boolean>} - Owned property, does not need to be disposed.
    this.visibleProperty = new BooleanProperty(true);

    // @public {Property.<Range|null>} - The contained 'section' of the full available model area. Should be null when
    // coordinates can't be computed. For generic partitions, it will be from 0 to 1. For proportional partitions, it
    // will be from 0 to its maximum size. Owned property, does not need to be disposed.
    this.coordinateRangeProperty = new Property(null, {
      valueComparisonStrategy: 'equalsFunction',
      isValidValue: value => value === null || value instanceof Range
    });
  }

  /**
   * Returns whether this partition is defined, i.e. "is shown in the area, and has a size"
   * @public
   *
   * @returns {boolean}
   */
  isDefined() {
    return this.visibleProperty.value && this.sizeProperty.value !== null;
  }
}
areaModelCommon.register('Partition', Partition);
export default Partition;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlJlYWRPbmx5UHJvcGVydHkiLCJ2YWxpZGF0ZSIsIlJhbmdlIiwiT3JpZW50YXRpb24iLCJhcmVhTW9kZWxDb21tb24iLCJUZXJtIiwiUGFydGl0aW9uIiwiY29uc3RydWN0b3IiLCJvcmllbnRhdGlvbiIsImNvbG9yUHJvcGVydHkiLCJ2YWxpZFZhbHVlcyIsImVudW1lcmF0aW9uIiwidmFsdWVzIiwiYXNzZXJ0Iiwic2l6ZVByb3BlcnR5IiwidmFsdWVDb21wYXJpc29uU3RyYXRlZ3kiLCJpc1ZhbGlkVmFsdWUiLCJpc1Rlcm1Pck51bGwiLCJ2aXNpYmxlUHJvcGVydHkiLCJjb29yZGluYXRlUmFuZ2VQcm9wZXJ0eSIsInZhbHVlIiwiaXNEZWZpbmVkIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQYXJ0aXRpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSAxLWRpbWVuc2lvbmFsIHNlY3Rpb24gb2YgZWl0aGVyIHRoZSB3aWR0aCBvciBoZWlnaHQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1JlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgdmFsaWRhdGUgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy92YWxpZGF0ZS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcclxuaW1wb3J0IGFyZWFNb2RlbENvbW1vbiBmcm9tICcuLi8uLi9hcmVhTW9kZWxDb21tb24uanMnO1xyXG5pbXBvcnQgVGVybSBmcm9tICcuL1Rlcm0uanMnO1xyXG5cclxuY2xhc3MgUGFydGl0aW9uIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge09yaWVudGF0aW9ufSBvcmllbnRhdGlvblxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPENvbG9yPn0gY29sb3JQcm9wZXJ0eVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBvcmllbnRhdGlvbiwgY29sb3JQcm9wZXJ0eSApIHtcclxuICAgIHZhbGlkYXRlKCBvcmllbnRhdGlvbiwgeyB2YWxpZFZhbHVlczogT3JpZW50YXRpb24uZW51bWVyYXRpb24udmFsdWVzIH0gKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbG9yUHJvcGVydHkgaW5zdGFuY2VvZiBSZWFkT25seVByb3BlcnR5ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPFRlcm18bnVsbD59IC0gTnVsbCBpbmRpY2F0ZXMgdGhlIHNpemUgaXMgbm90IGRlZmluZWQuXHJcbiAgICB0aGlzLnNpemVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbnVsbCwge1xyXG4gICAgICB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTogJ2VxdWFsc0Z1bmN0aW9uJyxcclxuICAgICAgaXNWYWxpZFZhbHVlOiBUZXJtLmlzVGVybU9yTnVsbFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge09yaWVudGF0aW9ufSAtIGFuIGludHJpbnNpYyBwcm9wZXJ0eSBvZiB0aGUgUGFydGl0aW9uXHJcbiAgICB0aGlzLm9yaWVudGF0aW9uID0gb3JpZW50YXRpb247XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPENvbG9yPn1cclxuICAgIHRoaXMuY29sb3JQcm9wZXJ0eSA9IGNvbG9yUHJvcGVydHk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSAtIE93bmVkIHByb3BlcnR5LCBkb2VzIG5vdCBuZWVkIHRvIGJlIGRpc3Bvc2VkLlxyXG4gICAgdGhpcy52aXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPFJhbmdlfG51bGw+fSAtIFRoZSBjb250YWluZWQgJ3NlY3Rpb24nIG9mIHRoZSBmdWxsIGF2YWlsYWJsZSBtb2RlbCBhcmVhLiBTaG91bGQgYmUgbnVsbCB3aGVuXHJcbiAgICAvLyBjb29yZGluYXRlcyBjYW4ndCBiZSBjb21wdXRlZC4gRm9yIGdlbmVyaWMgcGFydGl0aW9ucywgaXQgd2lsbCBiZSBmcm9tIDAgdG8gMS4gRm9yIHByb3BvcnRpb25hbCBwYXJ0aXRpb25zLCBpdFxyXG4gICAgLy8gd2lsbCBiZSBmcm9tIDAgdG8gaXRzIG1heGltdW0gc2l6ZS4gT3duZWQgcHJvcGVydHksIGRvZXMgbm90IG5lZWQgdG8gYmUgZGlzcG9zZWQuXHJcbiAgICB0aGlzLmNvb3JkaW5hdGVSYW5nZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBudWxsLCB7XHJcbiAgICAgIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5OiAnZXF1YWxzRnVuY3Rpb24nLFxyXG4gICAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IHZhbHVlID09PSBudWxsIHx8IHZhbHVlIGluc3RhbmNlb2YgUmFuZ2VcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciB0aGlzIHBhcnRpdGlvbiBpcyBkZWZpbmVkLCBpLmUuIFwiaXMgc2hvd24gaW4gdGhlIGFyZWEsIGFuZCBoYXMgYSBzaXplXCJcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpc0RlZmluZWQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy52aXNpYmxlUHJvcGVydHkudmFsdWUgJiYgdGhpcy5zaXplUHJvcGVydHkudmFsdWUgIT09IG51bGw7XHJcbiAgfVxyXG59XHJcblxyXG5hcmVhTW9kZWxDb21tb24ucmVnaXN0ZXIoICdQYXJ0aXRpb24nLCBQYXJ0aXRpb24gKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBhcnRpdGlvbjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLGdCQUFnQixNQUFNLHlDQUF5QztBQUN0RSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLElBQUksTUFBTSxXQUFXO0FBRTVCLE1BQU1DLFNBQVMsQ0FBQztFQUNkO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLFdBQVcsRUFBRUMsYUFBYSxFQUFHO0lBQ3hDUixRQUFRLENBQUVPLFdBQVcsRUFBRTtNQUFFRSxXQUFXLEVBQUVQLFdBQVcsQ0FBQ1EsV0FBVyxDQUFDQztJQUFPLENBQUUsQ0FBQztJQUN4RUMsTUFBTSxJQUFJQSxNQUFNLENBQUVKLGFBQWEsWUFBWVQsZ0JBQWlCLENBQUM7O0lBRTdEO0lBQ0EsSUFBSSxDQUFDYyxZQUFZLEdBQUcsSUFBSWYsUUFBUSxDQUFFLElBQUksRUFBRTtNQUN0Q2dCLHVCQUF1QixFQUFFLGdCQUFnQjtNQUN6Q0MsWUFBWSxFQUFFWCxJQUFJLENBQUNZO0lBQ3JCLENBQUUsQ0FBQzs7SUFFSDtJQUNBLElBQUksQ0FBQ1QsV0FBVyxHQUFHQSxXQUFXOztJQUU5QjtJQUNBLElBQUksQ0FBQ0MsYUFBYSxHQUFHQSxhQUFhOztJQUVsQztJQUNBLElBQUksQ0FBQ1MsZUFBZSxHQUFHLElBQUlwQixlQUFlLENBQUUsSUFBSyxDQUFDOztJQUVsRDtJQUNBO0lBQ0E7SUFDQSxJQUFJLENBQUNxQix1QkFBdUIsR0FBRyxJQUFJcEIsUUFBUSxDQUFFLElBQUksRUFBRTtNQUNqRGdCLHVCQUF1QixFQUFFLGdCQUFnQjtNQUN6Q0MsWUFBWSxFQUFFSSxLQUFLLElBQUlBLEtBQUssS0FBSyxJQUFJLElBQUlBLEtBQUssWUFBWWxCO0lBQzVELENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFbUIsU0FBU0EsQ0FBQSxFQUFHO0lBQ1YsT0FBTyxJQUFJLENBQUNILGVBQWUsQ0FBQ0UsS0FBSyxJQUFJLElBQUksQ0FBQ04sWUFBWSxDQUFDTSxLQUFLLEtBQUssSUFBSTtFQUN2RTtBQUNGO0FBRUFoQixlQUFlLENBQUNrQixRQUFRLENBQUUsV0FBVyxFQUFFaEIsU0FBVSxDQUFDO0FBRWxELGVBQWVBLFNBQVMifQ==