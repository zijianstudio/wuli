// Copyright 2015-2022, University of Colorado Boulder

/**
 * View-specific properties for the "Systems" screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import HookesLawQueryParameters from '../../common/HookesLawQueryParameters.js';
import ViewProperties from '../../common/view/ViewProperties.js';
import hookesLaw from '../../hookesLaw.js';
import SpringForceRepresentation from './SpringForceRepresentation.js';
import SystemType from './SystemType.js';
export default class SystemsViewProperties extends ViewProperties {
  // which system is visible

  // is the spring force vector visible?

  // how spring force is represented

  constructor(tandem) {
    super(tandem);
    this.systemTypeProperty = new EnumerationProperty(SystemType.PARALLEL, {
      tandem: tandem.createTandem('systemTypeProperty')
    });
    this.springForceVectorVisibleProperty = new BooleanProperty(HookesLawQueryParameters.checkAll, {
      tandem: tandem.createTandem('springForceVectorVisibleProperty')
    });
    this.springForceRepresentationProperty = new EnumerationProperty(SpringForceRepresentation.TOTAL, {
      tandem: tandem.createTandem('springForceRepresentationProperty')
    });
  }
  reset() {
    this.systemTypeProperty.reset();
    this.springForceVectorVisibleProperty.reset();
    this.springForceRepresentationProperty.reset();
    super.reset();
  }
}
hookesLaw.register('SystemsViewProperties', SystemsViewProperties);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbnVtZXJhdGlvblByb3BlcnR5IiwiSG9va2VzTGF3UXVlcnlQYXJhbWV0ZXJzIiwiVmlld1Byb3BlcnRpZXMiLCJob29rZXNMYXciLCJTcHJpbmdGb3JjZVJlcHJlc2VudGF0aW9uIiwiU3lzdGVtVHlwZSIsIlN5c3RlbXNWaWV3UHJvcGVydGllcyIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwic3lzdGVtVHlwZVByb3BlcnR5IiwiUEFSQUxMRUwiLCJjcmVhdGVUYW5kZW0iLCJzcHJpbmdGb3JjZVZlY3RvclZpc2libGVQcm9wZXJ0eSIsImNoZWNrQWxsIiwic3ByaW5nRm9yY2VSZXByZXNlbnRhdGlvblByb3BlcnR5IiwiVE9UQUwiLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3lzdGVtc1ZpZXdQcm9wZXJ0aWVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFZpZXctc3BlY2lmaWMgcHJvcGVydGllcyBmb3IgdGhlIFwiU3lzdGVtc1wiIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgSG9va2VzTGF3UXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uLy4uL2NvbW1vbi9Ib29rZXNMYXdRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgVmlld1Byb3BlcnRpZXMgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvVmlld1Byb3BlcnRpZXMuanMnO1xyXG5pbXBvcnQgaG9va2VzTGF3IGZyb20gJy4uLy4uL2hvb2tlc0xhdy5qcyc7XHJcbmltcG9ydCBTcHJpbmdGb3JjZVJlcHJlc2VudGF0aW9uIGZyb20gJy4vU3ByaW5nRm9yY2VSZXByZXNlbnRhdGlvbi5qcyc7XHJcbmltcG9ydCBTeXN0ZW1UeXBlIGZyb20gJy4vU3lzdGVtVHlwZS5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTeXN0ZW1zVmlld1Byb3BlcnRpZXMgZXh0ZW5kcyBWaWV3UHJvcGVydGllcyB7XHJcblxyXG4gIC8vIHdoaWNoIHN5c3RlbSBpcyB2aXNpYmxlXHJcbiAgcHVibGljIHJlYWRvbmx5IHN5c3RlbVR5cGVQcm9wZXJ0eTogRW51bWVyYXRpb25Qcm9wZXJ0eTxTeXN0ZW1UeXBlPjtcclxuXHJcbiAgLy8gaXMgdGhlIHNwcmluZyBmb3JjZSB2ZWN0b3IgdmlzaWJsZT9cclxuICBwdWJsaWMgcmVhZG9ubHkgc3ByaW5nRm9yY2VWZWN0b3JWaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICAvLyBob3cgc3ByaW5nIGZvcmNlIGlzIHJlcHJlc2VudGVkXHJcbiAgcHVibGljIHJlYWRvbmx5IHNwcmluZ0ZvcmNlUmVwcmVzZW50YXRpb25Qcm9wZXJ0eTogRW51bWVyYXRpb25Qcm9wZXJ0eTxTcHJpbmdGb3JjZVJlcHJlc2VudGF0aW9uPjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICBzdXBlciggdGFuZGVtICk7XHJcblxyXG4gICAgdGhpcy5zeXN0ZW1UeXBlUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25Qcm9wZXJ0eSggU3lzdGVtVHlwZS5QQVJBTExFTCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzeXN0ZW1UeXBlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnNwcmluZ0ZvcmNlVmVjdG9yVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggSG9va2VzTGF3UXVlcnlQYXJhbWV0ZXJzLmNoZWNrQWxsLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NwcmluZ0ZvcmNlVmVjdG9yVmlzaWJsZVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zcHJpbmdGb3JjZVJlcHJlc2VudGF0aW9uUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25Qcm9wZXJ0eSggU3ByaW5nRm9yY2VSZXByZXNlbnRhdGlvbi5UT1RBTCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzcHJpbmdGb3JjZVJlcHJlc2VudGF0aW9uUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMuc3lzdGVtVHlwZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNwcmluZ0ZvcmNlVmVjdG9yVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNwcmluZ0ZvcmNlUmVwcmVzZW50YXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuICB9XHJcbn1cclxuXHJcbmhvb2tlc0xhdy5yZWdpc3RlciggJ1N5c3RlbXNWaWV3UHJvcGVydGllcycsIFN5c3RlbXNWaWV3UHJvcGVydGllcyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLG1CQUFtQixNQUFNLDRDQUE0QztBQUc1RSxPQUFPQyx3QkFBd0IsTUFBTSwwQ0FBMEM7QUFDL0UsT0FBT0MsY0FBYyxNQUFNLHFDQUFxQztBQUNoRSxPQUFPQyxTQUFTLE1BQU0sb0JBQW9CO0FBQzFDLE9BQU9DLHlCQUF5QixNQUFNLGdDQUFnQztBQUN0RSxPQUFPQyxVQUFVLE1BQU0saUJBQWlCO0FBRXhDLGVBQWUsTUFBTUMscUJBQXFCLFNBQVNKLGNBQWMsQ0FBQztFQUVoRTs7RUFHQTs7RUFHQTs7RUFHT0ssV0FBV0EsQ0FBRUMsTUFBYyxFQUFHO0lBRW5DLEtBQUssQ0FBRUEsTUFBTyxDQUFDO0lBRWYsSUFBSSxDQUFDQyxrQkFBa0IsR0FBRyxJQUFJVCxtQkFBbUIsQ0FBRUssVUFBVSxDQUFDSyxRQUFRLEVBQUU7TUFDdEVGLE1BQU0sRUFBRUEsTUFBTSxDQUFDRyxZQUFZLENBQUUsb0JBQXFCO0lBQ3BELENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0MsZ0NBQWdDLEdBQUcsSUFBSWIsZUFBZSxDQUFFRSx3QkFBd0IsQ0FBQ1ksUUFBUSxFQUFFO01BQzlGTCxNQUFNLEVBQUVBLE1BQU0sQ0FBQ0csWUFBWSxDQUFFLGtDQUFtQztJQUNsRSxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNHLGlDQUFpQyxHQUFHLElBQUlkLG1CQUFtQixDQUFFSSx5QkFBeUIsQ0FBQ1csS0FBSyxFQUFFO01BQ2pHUCxNQUFNLEVBQUVBLE1BQU0sQ0FBQ0csWUFBWSxDQUFFLG1DQUFvQztJQUNuRSxDQUFFLENBQUM7RUFDTDtFQUVnQkssS0FBS0EsQ0FBQSxFQUFTO0lBQzVCLElBQUksQ0FBQ1Asa0JBQWtCLENBQUNPLEtBQUssQ0FBQyxDQUFDO0lBQy9CLElBQUksQ0FBQ0osZ0NBQWdDLENBQUNJLEtBQUssQ0FBQyxDQUFDO0lBQzdDLElBQUksQ0FBQ0YsaUNBQWlDLENBQUNFLEtBQUssQ0FBQyxDQUFDO0lBQzlDLEtBQUssQ0FBQ0EsS0FBSyxDQUFDLENBQUM7RUFDZjtBQUNGO0FBRUFiLFNBQVMsQ0FBQ2MsUUFBUSxDQUFFLHVCQUF1QixFQUFFWCxxQkFBc0IsQ0FBQyJ9