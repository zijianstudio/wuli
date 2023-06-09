// Copyright 2015-2022, University of Colorado Boulder

/**
 * Model of a system with 1 spring, pulled by a robotic arm.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { combineOptions } from '../../../../phet-core/js/optionize.js';
import hookesLaw from '../../hookesLaw.js';
import RoboticArm from './RoboticArm.js';
import Spring from './Spring.js';
export default class SingleSpringSystem {
  // arm, left end attached to spring

  constructor(providedOptions) {
    const options = providedOptions;

    //------------------------------------------------
    // Components of the system

    this.spring = new Spring(combineOptions({
      tandem: options.tandem.createTandem('spring')
    }, options.springOptions));
    assert && assert(this.spring.displacementProperty.value === 0); // spring is at equilibrium

    this.roboticArm = new RoboticArm({
      left: this.spring.rightProperty.value,
      right: this.spring.rightProperty.value + this.spring.lengthProperty.value,
      tandem: options.tandem.createTandem('roboticArm')
    });

    //------------------------------------------------
    // Property observers

    // Connect arm to spring.
    this.spring.rightProperty.link(right => {
      this.roboticArm.leftProperty.value = right;
    });

    // Robotic arm sets displacement of spring.
    this.roboticArm.leftProperty.link(left => {
      this.spring.displacementProperty.value = left - this.spring.equilibriumXProperty.value;
    });

    //------------------------------------------------
    // Check for conditions supported by the general Spring model that aren't allowed by this system

    this.spring.leftProperty.lazyLink(left => {
      throw new Error(`Left end of spring must remain fixed, left=${left}`);
    });
    this.spring.equilibriumXProperty.lazyLink(equilibriumX => {
      throw new Error(`Equilibrium position must remain fixed, equilibriumX=${equilibriumX}`);
    });
  }
  reset() {
    this.spring.reset();
    this.roboticArm.reset();
  }
}
hookesLaw.register('SingleSpringSystem', SingleSpringSystem);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb21iaW5lT3B0aW9ucyIsImhvb2tlc0xhdyIsIlJvYm90aWNBcm0iLCJTcHJpbmciLCJTaW5nbGVTcHJpbmdTeXN0ZW0iLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJzcHJpbmciLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJzcHJpbmdPcHRpb25zIiwiYXNzZXJ0IiwiZGlzcGxhY2VtZW50UHJvcGVydHkiLCJ2YWx1ZSIsInJvYm90aWNBcm0iLCJsZWZ0IiwicmlnaHRQcm9wZXJ0eSIsInJpZ2h0IiwibGVuZ3RoUHJvcGVydHkiLCJsaW5rIiwibGVmdFByb3BlcnR5IiwiZXF1aWxpYnJpdW1YUHJvcGVydHkiLCJsYXp5TGluayIsIkVycm9yIiwiZXF1aWxpYnJpdW1YIiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNpbmdsZVNwcmluZ1N5c3RlbS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBvZiBhIHN5c3RlbSB3aXRoIDEgc3ByaW5nLCBwdWxsZWQgYnkgYSByb2JvdGljIGFybS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCB7IFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IGhvb2tlc0xhdyBmcm9tICcuLi8uLi9ob29rZXNMYXcuanMnO1xyXG5pbXBvcnQgUm9ib3RpY0FybSBmcm9tICcuL1JvYm90aWNBcm0uanMnO1xyXG5pbXBvcnQgU3ByaW5nLCB7IFNwcmluZ09wdGlvbnMgfSBmcm9tICcuL1NwcmluZy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIHNwcmluZ09wdGlvbnM/OiBTdHJpY3RPbWl0PFNwcmluZ09wdGlvbnMsICd0YW5kZW0nPjsgLy8gb3B0aW9ucyBmb3IgdGhlIFNwcmluZyBpbiB0aGlzIHN5c3RlbVxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgU2luZ2xlU3ByaW5nU3lzdGVtT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPFBoZXRpb09iamVjdE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpbmdsZVNwcmluZ1N5c3RlbSB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBzcHJpbmc6IFNwcmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgcm9ib3RpY0FybTogUm9ib3RpY0FybTsgLy8gYXJtLCBsZWZ0IGVuZCBhdHRhY2hlZCB0byBzcHJpbmdcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM6IFNpbmdsZVNwcmluZ1N5c3RlbU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IHByb3ZpZGVkT3B0aW9ucztcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gQ29tcG9uZW50cyBvZiB0aGUgc3lzdGVtXHJcblxyXG4gICAgdGhpcy5zcHJpbmcgPSBuZXcgU3ByaW5nKCBjb21iaW5lT3B0aW9uczxTcHJpbmdPcHRpb25zPigge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NwcmluZycgKVxyXG4gICAgfSwgb3B0aW9ucy5zcHJpbmdPcHRpb25zICkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuc3ByaW5nLmRpc3BsYWNlbWVudFByb3BlcnR5LnZhbHVlID09PSAwICk7IC8vIHNwcmluZyBpcyBhdCBlcXVpbGlicml1bVxyXG5cclxuICAgIHRoaXMucm9ib3RpY0FybSA9IG5ldyBSb2JvdGljQXJtKCB7XHJcbiAgICAgIGxlZnQ6IHRoaXMuc3ByaW5nLnJpZ2h0UHJvcGVydHkudmFsdWUsXHJcbiAgICAgIHJpZ2h0OiB0aGlzLnNwcmluZy5yaWdodFByb3BlcnR5LnZhbHVlICsgdGhpcy5zcHJpbmcubGVuZ3RoUHJvcGVydHkudmFsdWUsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncm9ib3RpY0FybScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBQcm9wZXJ0eSBvYnNlcnZlcnNcclxuXHJcbiAgICAvLyBDb25uZWN0IGFybSB0byBzcHJpbmcuXHJcbiAgICB0aGlzLnNwcmluZy5yaWdodFByb3BlcnR5LmxpbmsoIHJpZ2h0ID0+IHtcclxuICAgICAgdGhpcy5yb2JvdGljQXJtLmxlZnRQcm9wZXJ0eS52YWx1ZSA9IHJpZ2h0O1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFJvYm90aWMgYXJtIHNldHMgZGlzcGxhY2VtZW50IG9mIHNwcmluZy5cclxuICAgIHRoaXMucm9ib3RpY0FybS5sZWZ0UHJvcGVydHkubGluayggbGVmdCA9PiB7XHJcbiAgICAgIHRoaXMuc3ByaW5nLmRpc3BsYWNlbWVudFByb3BlcnR5LnZhbHVlID0gKCBsZWZ0IC0gdGhpcy5zcHJpbmcuZXF1aWxpYnJpdW1YUHJvcGVydHkudmFsdWUgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gQ2hlY2sgZm9yIGNvbmRpdGlvbnMgc3VwcG9ydGVkIGJ5IHRoZSBnZW5lcmFsIFNwcmluZyBtb2RlbCB0aGF0IGFyZW4ndCBhbGxvd2VkIGJ5IHRoaXMgc3lzdGVtXHJcblxyXG4gICAgdGhpcy5zcHJpbmcubGVmdFByb3BlcnR5LmxhenlMaW5rKCBsZWZ0ID0+IHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgTGVmdCBlbmQgb2Ygc3ByaW5nIG11c3QgcmVtYWluIGZpeGVkLCBsZWZ0PSR7bGVmdH1gICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zcHJpbmcuZXF1aWxpYnJpdW1YUHJvcGVydHkubGF6eUxpbmsoIGVxdWlsaWJyaXVtWCA9PiB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggYEVxdWlsaWJyaXVtIHBvc2l0aW9uIG11c3QgcmVtYWluIGZpeGVkLCBlcXVpbGlicml1bVg9JHtlcXVpbGlicml1bVh9YCApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5zcHJpbmcucmVzZXQoKTtcclxuICAgIHRoaXMucm9ib3RpY0FybS5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxuaG9va2VzTGF3LnJlZ2lzdGVyKCAnU2luZ2xlU3ByaW5nU3lzdGVtJywgU2luZ2xlU3ByaW5nU3lzdGVtICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLGNBQWMsUUFBUSx1Q0FBdUM7QUFJdEUsT0FBT0MsU0FBUyxNQUFNLG9CQUFvQjtBQUMxQyxPQUFPQyxVQUFVLE1BQU0saUJBQWlCO0FBQ3hDLE9BQU9DLE1BQU0sTUFBeUIsYUFBYTtBQVFuRCxlQUFlLE1BQU1DLGtCQUFrQixDQUFDO0VBR0U7O0VBRWpDQyxXQUFXQSxDQUFFQyxlQUEwQyxFQUFHO0lBRS9ELE1BQU1DLE9BQU8sR0FBR0QsZUFBZTs7SUFFL0I7SUFDQTs7SUFFQSxJQUFJLENBQUNFLE1BQU0sR0FBRyxJQUFJTCxNQUFNLENBQUVILGNBQWMsQ0FBaUI7TUFDdkRTLE1BQU0sRUFBRUYsT0FBTyxDQUFDRSxNQUFNLENBQUNDLFlBQVksQ0FBRSxRQUFTO0lBQ2hELENBQUMsRUFBRUgsT0FBTyxDQUFDSSxhQUFjLENBQUUsQ0FBQztJQUM1QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsSUFBSSxDQUFDSixNQUFNLENBQUNLLG9CQUFvQixDQUFDQyxLQUFLLEtBQUssQ0FBRSxDQUFDLENBQUMsQ0FBQzs7SUFFbEUsSUFBSSxDQUFDQyxVQUFVLEdBQUcsSUFBSWIsVUFBVSxDQUFFO01BQ2hDYyxJQUFJLEVBQUUsSUFBSSxDQUFDUixNQUFNLENBQUNTLGFBQWEsQ0FBQ0gsS0FBSztNQUNyQ0ksS0FBSyxFQUFFLElBQUksQ0FBQ1YsTUFBTSxDQUFDUyxhQUFhLENBQUNILEtBQUssR0FBRyxJQUFJLENBQUNOLE1BQU0sQ0FBQ1csY0FBYyxDQUFDTCxLQUFLO01BQ3pFTCxNQUFNLEVBQUVGLE9BQU8sQ0FBQ0UsTUFBTSxDQUFDQyxZQUFZLENBQUUsWUFBYTtJQUNwRCxDQUFFLENBQUM7O0lBRUg7SUFDQTs7SUFFQTtJQUNBLElBQUksQ0FBQ0YsTUFBTSxDQUFDUyxhQUFhLENBQUNHLElBQUksQ0FBRUYsS0FBSyxJQUFJO01BQ3ZDLElBQUksQ0FBQ0gsVUFBVSxDQUFDTSxZQUFZLENBQUNQLEtBQUssR0FBR0ksS0FBSztJQUM1QyxDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNILFVBQVUsQ0FBQ00sWUFBWSxDQUFDRCxJQUFJLENBQUVKLElBQUksSUFBSTtNQUN6QyxJQUFJLENBQUNSLE1BQU0sQ0FBQ0ssb0JBQW9CLENBQUNDLEtBQUssR0FBS0UsSUFBSSxHQUFHLElBQUksQ0FBQ1IsTUFBTSxDQUFDYyxvQkFBb0IsQ0FBQ1IsS0FBTztJQUM1RixDQUFFLENBQUM7O0lBRUg7SUFDQTs7SUFFQSxJQUFJLENBQUNOLE1BQU0sQ0FBQ2EsWUFBWSxDQUFDRSxRQUFRLENBQUVQLElBQUksSUFBSTtNQUN6QyxNQUFNLElBQUlRLEtBQUssQ0FBRyw4Q0FBNkNSLElBQUssRUFBRSxDQUFDO0lBQ3pFLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ1IsTUFBTSxDQUFDYyxvQkFBb0IsQ0FBQ0MsUUFBUSxDQUFFRSxZQUFZLElBQUk7TUFDekQsTUFBTSxJQUFJRCxLQUFLLENBQUcsd0RBQXVEQyxZQUFhLEVBQUUsQ0FBQztJQUMzRixDQUFFLENBQUM7RUFDTDtFQUVPQyxLQUFLQSxDQUFBLEVBQVM7SUFDbkIsSUFBSSxDQUFDbEIsTUFBTSxDQUFDa0IsS0FBSyxDQUFDLENBQUM7SUFDbkIsSUFBSSxDQUFDWCxVQUFVLENBQUNXLEtBQUssQ0FBQyxDQUFDO0VBQ3pCO0FBQ0Y7QUFFQXpCLFNBQVMsQ0FBQzBCLFFBQVEsQ0FBRSxvQkFBb0IsRUFBRXZCLGtCQUFtQixDQUFDIn0=