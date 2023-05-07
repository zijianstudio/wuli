// Copyright 2017-2023, University of Colorado Boulder

/**
 * A 2-dimensional section of area defined by a horizontal and vertical pair of partitions.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import areaModelCommon from '../../areaModelCommon.js';
import Term from './Term.js';
class PartitionedArea {
  /**
   * @param {OrientationPair.<Partition>} partitions
   */
  constructor(partitions) {
    // @public {OrientationPair.<Partition>}
    this.partitions = partitions;

    // @public {Property.<Term|null>} - Area may not be defined if the size of a partition is not defined.
    this.areaProperty = new Property(null, {
      valueComparisonStrategy: 'equalsFunction',
      isValidValue: Term.isTermOrNull
    });

    // @public {Property.<boolean>}
    this.visibleProperty = DerivedProperty.and([partitions.horizontal.visibleProperty, partitions.vertical.visibleProperty]);
  }

  /**
   * Cleans up references.
   * @public
   */
  dispose() {
    this.visibleProperty.dispose();
    this.areaProperty.dispose();
  }
}
areaModelCommon.register('PartitionedArea', PartitionedArea);
export default PartitionedArea;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsImFyZWFNb2RlbENvbW1vbiIsIlRlcm0iLCJQYXJ0aXRpb25lZEFyZWEiLCJjb25zdHJ1Y3RvciIsInBhcnRpdGlvbnMiLCJhcmVhUHJvcGVydHkiLCJ2YWx1ZUNvbXBhcmlzb25TdHJhdGVneSIsImlzVmFsaWRWYWx1ZSIsImlzVGVybU9yTnVsbCIsInZpc2libGVQcm9wZXJ0eSIsImFuZCIsImhvcml6b250YWwiLCJ2ZXJ0aWNhbCIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBhcnRpdGlvbmVkQXJlYS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIDItZGltZW5zaW9uYWwgc2VjdGlvbiBvZiBhcmVhIGRlZmluZWQgYnkgYSBob3Jpem9udGFsIGFuZCB2ZXJ0aWNhbCBwYWlyIG9mIHBhcnRpdGlvbnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgYXJlYU1vZGVsQ29tbW9uIGZyb20gJy4uLy4uL2FyZWFNb2RlbENvbW1vbi5qcyc7XHJcbmltcG9ydCBUZXJtIGZyb20gJy4vVGVybS5qcyc7XHJcblxyXG5jbGFzcyBQYXJ0aXRpb25lZEFyZWEge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T3JpZW50YXRpb25QYWlyLjxQYXJ0aXRpb24+fSBwYXJ0aXRpb25zXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHBhcnRpdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7T3JpZW50YXRpb25QYWlyLjxQYXJ0aXRpb24+fVxyXG4gICAgdGhpcy5wYXJ0aXRpb25zID0gcGFydGl0aW9ucztcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48VGVybXxudWxsPn0gLSBBcmVhIG1heSBub3QgYmUgZGVmaW5lZCBpZiB0aGUgc2l6ZSBvZiBhIHBhcnRpdGlvbiBpcyBub3QgZGVmaW5lZC5cclxuICAgIHRoaXMuYXJlYVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBudWxsLCB7XHJcbiAgICAgIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5OiAnZXF1YWxzRnVuY3Rpb24nLFxyXG4gICAgICBpc1ZhbGlkVmFsdWU6IFRlcm0uaXNUZXJtT3JOdWxsXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fVxyXG4gICAgdGhpcy52aXNpYmxlUHJvcGVydHkgPSBEZXJpdmVkUHJvcGVydHkuYW5kKCBbXHJcbiAgICAgIHBhcnRpdGlvbnMuaG9yaXpvbnRhbC52aXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHBhcnRpdGlvbnMudmVydGljYWwudmlzaWJsZVByb3BlcnR5XHJcbiAgICBdICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDbGVhbnMgdXAgcmVmZXJlbmNlcy5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMudmlzaWJsZVByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHRoaXMuYXJlYVByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmFyZWFNb2RlbENvbW1vbi5yZWdpc3RlciggJ1BhcnRpdGlvbmVkQXJlYScsIFBhcnRpdGlvbmVkQXJlYSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGFydGl0aW9uZWRBcmVhOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyxJQUFJLE1BQU0sV0FBVztBQUU1QixNQUFNQyxlQUFlLENBQUM7RUFDcEI7QUFDRjtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLFVBQVUsRUFBRztJQUV4QjtJQUNBLElBQUksQ0FBQ0EsVUFBVSxHQUFHQSxVQUFVOztJQUU1QjtJQUNBLElBQUksQ0FBQ0MsWUFBWSxHQUFHLElBQUlOLFFBQVEsQ0FBRSxJQUFJLEVBQUU7TUFDdENPLHVCQUF1QixFQUFFLGdCQUFnQjtNQUN6Q0MsWUFBWSxFQUFFTixJQUFJLENBQUNPO0lBQ3JCLENBQUUsQ0FBQzs7SUFFSDtJQUNBLElBQUksQ0FBQ0MsZUFBZSxHQUFHWCxlQUFlLENBQUNZLEdBQUcsQ0FBRSxDQUMxQ04sVUFBVSxDQUFDTyxVQUFVLENBQUNGLGVBQWUsRUFDckNMLFVBQVUsQ0FBQ1EsUUFBUSxDQUFDSCxlQUFlLENBQ25DLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFSSxPQUFPQSxDQUFBLEVBQUc7SUFDUixJQUFJLENBQUNKLGVBQWUsQ0FBQ0ksT0FBTyxDQUFDLENBQUM7SUFDOUIsSUFBSSxDQUFDUixZQUFZLENBQUNRLE9BQU8sQ0FBQyxDQUFDO0VBQzdCO0FBQ0Y7QUFFQWIsZUFBZSxDQUFDYyxRQUFRLENBQUUsaUJBQWlCLEVBQUVaLGVBQWdCLENBQUM7QUFFOUQsZUFBZUEsZUFBZSJ9