// Copyright 2022, University of Colorado Boulder

/**
 * Individual chocolate bars in the paper (upper) representation.
 * These chocolate bars are draggable therefore their position, and parentPlate are important.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 *
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import meanShareAndBalance from '../../meanShareAndBalance.js';
// Total number of chocolate bars allocated, for debugging
let count = 0;
export default class ChocolateBar {
  // For debugging
  index = count++;
  constructor(providedOptions) {
    // REVIEW: Should these be phet-io instrumented?  Perhaps yes, but with phetioState: false and phetioReadonly: false?
    this.isActiveProperty = new BooleanProperty(providedOptions.isActive, {
      // phet-io
      tandem: providedOptions.tandem.createTandem('isActiveProperty'),
      phetioReadOnly: true
    });
    this.parentPlateProperty = new Property(providedOptions.plate, {
      // phet-io
      tandem: providedOptions.tandem.createTandem('parentPlateProperty'),
      phetioReadOnly: true,
      phetioValueType: ReferenceIO(IOType.ObjectIO)
    });

    // REVIEW: These may need phetioState: true
    this.positionProperty = new Property(providedOptions.position);
    this.stateProperty = new Property('plate');
  }
  reset() {
    this.positionProperty.reset();
    this.stateProperty.reset();
    this.parentPlateProperty.reset();
    this.isActiveProperty.reset();
  }
}
meanShareAndBalance.register('ChocolateBar', ChocolateBar);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJQcm9wZXJ0eSIsIklPVHlwZSIsIlJlZmVyZW5jZUlPIiwibWVhblNoYXJlQW5kQmFsYW5jZSIsImNvdW50IiwiQ2hvY29sYXRlQmFyIiwiaW5kZXgiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsImlzQWN0aXZlUHJvcGVydHkiLCJpc0FjdGl2ZSIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1JlYWRPbmx5IiwicGFyZW50UGxhdGVQcm9wZXJ0eSIsInBsYXRlIiwicGhldGlvVmFsdWVUeXBlIiwiT2JqZWN0SU8iLCJwb3NpdGlvblByb3BlcnR5IiwicG9zaXRpb24iLCJzdGF0ZVByb3BlcnR5IiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNob2NvbGF0ZUJhci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSW5kaXZpZHVhbCBjaG9jb2xhdGUgYmFycyBpbiB0aGUgcGFwZXIgKHVwcGVyKSByZXByZXNlbnRhdGlvbi5cclxuICogVGhlc2UgY2hvY29sYXRlIGJhcnMgYXJlIGRyYWdnYWJsZSB0aGVyZWZvcmUgdGhlaXIgcG9zaXRpb24sIGFuZCBwYXJlbnRQbGF0ZSBhcmUgaW1wb3J0YW50LlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcmxhIFNjaHVseiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICpcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBSZWZlcmVuY2VJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvUmVmZXJlbmNlSU8uanMnO1xyXG5pbXBvcnQgbWVhblNoYXJlQW5kQmFsYW5jZSBmcm9tICcuLi8uLi9tZWFuU2hhcmVBbmRCYWxhbmNlLmpzJztcclxuaW1wb3J0IFBsYXRlIGZyb20gJy4vUGxhdGUuanMnO1xyXG5cclxudHlwZSBDaG9jb2xhdGVCYXJPcHRpb25zID0ge1xyXG4gIGlzQWN0aXZlOiBib29sZWFuO1xyXG4gIHBsYXRlOiBQbGF0ZTtcclxuICBwb3NpdGlvbjogVmVjdG9yMjtcclxuICB0YW5kZW06IFRhbmRlbTtcclxufTtcclxuXHJcbnR5cGUgU3RhdGVUeXBlID0gJ3BsYXRlJyB8ICdkcmFnZ2luZycgfCAnYW5pbWF0aW5nJztcclxuXHJcbi8vIFRvdGFsIG51bWJlciBvZiBjaG9jb2xhdGUgYmFycyBhbGxvY2F0ZWQsIGZvciBkZWJ1Z2dpbmdcclxubGV0IGNvdW50ID0gMDtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENob2NvbGF0ZUJhciB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBpc0FjdGl2ZVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgcGFyZW50UGxhdGVQcm9wZXJ0eTogUHJvcGVydHk8UGxhdGU+O1xyXG4gIHB1YmxpYyByZWFkb25seSBwb3NpdGlvblByb3BlcnR5OiBQcm9wZXJ0eTxWZWN0b3IyPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgc3RhdGVQcm9wZXJ0eTogUHJvcGVydHk8U3RhdGVUeXBlPjtcclxuXHJcbiAgLy8gRm9yIGRlYnVnZ2luZ1xyXG4gIHB1YmxpYyByZWFkb25seSBpbmRleCA9IGNvdW50Kys7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBDaG9jb2xhdGVCYXJPcHRpb25zICkge1xyXG5cclxuICAgIC8vIFJFVklFVzogU2hvdWxkIHRoZXNlIGJlIHBoZXQtaW8gaW5zdHJ1bWVudGVkPyAgUGVyaGFwcyB5ZXMsIGJ1dCB3aXRoIHBoZXRpb1N0YXRlOiBmYWxzZSBhbmQgcGhldGlvUmVhZG9ubHk6IGZhbHNlP1xyXG4gICAgdGhpcy5pc0FjdGl2ZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggcHJvdmlkZWRPcHRpb25zLmlzQWN0aXZlLCB7XHJcblxyXG4gICAgICAvLyBwaGV0LWlvXHJcbiAgICAgIHRhbmRlbTogcHJvdmlkZWRPcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdpc0FjdGl2ZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMucGFyZW50UGxhdGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggcHJvdmlkZWRPcHRpb25zLnBsYXRlLCB7XHJcblxyXG4gICAgICAvLyBwaGV0LWlvXHJcbiAgICAgIHRhbmRlbTogcHJvdmlkZWRPcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwYXJlbnRQbGF0ZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBSZWZlcmVuY2VJTyggSU9UeXBlLk9iamVjdElPIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBSRVZJRVc6IFRoZXNlIG1heSBuZWVkIHBoZXRpb1N0YXRlOiB0cnVlXHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHByb3ZpZGVkT3B0aW9ucy5wb3NpdGlvbiApO1xyXG4gICAgdGhpcy5zdGF0ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5PFN0YXRlVHlwZT4oICdwbGF0ZScgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zdGF0ZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnBhcmVudFBsYXRlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuaXNBY3RpdmVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxubWVhblNoYXJlQW5kQmFsYW5jZS5yZWdpc3RlciggJ0Nob2NvbGF0ZUJhcicsIENob2NvbGF0ZUJhciApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFHdEQsT0FBT0MsTUFBTSxNQUFNLHVDQUF1QztBQUMxRCxPQUFPQyxXQUFXLE1BQU0sNENBQTRDO0FBQ3BFLE9BQU9DLG1CQUFtQixNQUFNLDhCQUE4QjtBQVk5RDtBQUNBLElBQUlDLEtBQUssR0FBRyxDQUFDO0FBRWIsZUFBZSxNQUFNQyxZQUFZLENBQUM7RUFPaEM7RUFDZ0JDLEtBQUssR0FBR0YsS0FBSyxFQUFFO0VBRXhCRyxXQUFXQSxDQUFFQyxlQUFvQyxFQUFHO0lBRXpEO0lBQ0EsSUFBSSxDQUFDQyxnQkFBZ0IsR0FBRyxJQUFJVixlQUFlLENBQUVTLGVBQWUsQ0FBQ0UsUUFBUSxFQUFFO01BRXJFO01BQ0FDLE1BQU0sRUFBRUgsZUFBZSxDQUFDRyxNQUFNLENBQUNDLFlBQVksQ0FBRSxrQkFBbUIsQ0FBQztNQUNqRUMsY0FBYyxFQUFFO0lBQ2xCLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0MsbUJBQW1CLEdBQUcsSUFBSWQsUUFBUSxDQUFFUSxlQUFlLENBQUNPLEtBQUssRUFBRTtNQUU5RDtNQUNBSixNQUFNLEVBQUVILGVBQWUsQ0FBQ0csTUFBTSxDQUFDQyxZQUFZLENBQUUscUJBQXNCLENBQUM7TUFDcEVDLGNBQWMsRUFBRSxJQUFJO01BQ3BCRyxlQUFlLEVBQUVkLFdBQVcsQ0FBRUQsTUFBTSxDQUFDZ0IsUUFBUztJQUNoRCxDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNDLGdCQUFnQixHQUFHLElBQUlsQixRQUFRLENBQUVRLGVBQWUsQ0FBQ1csUUFBUyxDQUFDO0lBQ2hFLElBQUksQ0FBQ0MsYUFBYSxHQUFHLElBQUlwQixRQUFRLENBQWEsT0FBUSxDQUFDO0VBQ3pEO0VBRU9xQixLQUFLQSxDQUFBLEVBQVM7SUFDbkIsSUFBSSxDQUFDSCxnQkFBZ0IsQ0FBQ0csS0FBSyxDQUFDLENBQUM7SUFDN0IsSUFBSSxDQUFDRCxhQUFhLENBQUNDLEtBQUssQ0FBQyxDQUFDO0lBQzFCLElBQUksQ0FBQ1AsbUJBQW1CLENBQUNPLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLElBQUksQ0FBQ1osZ0JBQWdCLENBQUNZLEtBQUssQ0FBQyxDQUFDO0VBQy9CO0FBQ0Y7QUFFQWxCLG1CQUFtQixDQUFDbUIsUUFBUSxDQUFFLGNBQWMsRUFBRWpCLFlBQWEsQ0FBQyJ9