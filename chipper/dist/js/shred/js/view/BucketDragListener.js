// Copyright 2015-2021, University of Colorado Boulder

/**
 * A drag listener specifically tailored for the particle buckets. This listener extracts a particle from a bucket and
 * manages it as though the user had clicked directly on the particle. This exists to make it easier for the users to
 * get particles out of the buckets when using a touch-based device.
 *
 * @author John Blanco
 */

import merge from '../../../phet-core/js/merge.js';
import { DragListener } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import shred from '../shred.js';
class BucketDragListener extends DragListener {
  /**
   * @param {Bucket} bucket
   * @param {BucketFront} bucketView
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   * @constructor
   */
  constructor(bucket, bucketView, modelViewTransform, options) {
    options = merge({
      tandem: Tandem.REQUIRED
    }, options);

    // closure for converting a point in local coordinate frame to model coordinates
    const localViewToModel = point => {
      // Note: The following transform works, but it is a bit obscure, and relies on the topology of the scene graph.
      // JB, SR, and JO discussed potentially better ways to do it but didn't come up with anything at the time. If
      // this code is leveraged, this transform should be revisited for potential improvement.
      return modelViewTransform.viewToModelPosition(bucketView.getParents()[0].globalToLocalPoint(point));
    };
    let activeParticle = null;
    const inputListenerOptions = {
      tandem: options.tandem,
      start: event => {
        const positionInModelSpace = localViewToModel(event.pointer.point);
        activeParticle = bucket.extractClosestParticle(positionInModelSpace);
        if (activeParticle !== null) {
          activeParticle.setPositionAndDestination(positionInModelSpace);
        }
      },
      drag: event => {
        if (activeParticle !== null) {
          activeParticle.setPositionAndDestination(localViewToModel(event.pointer.point));
        }
      },
      end: () => {
        if (activeParticle !== null) {
          activeParticle.userControlledProperty.set(false);
          activeParticle = null;
        }
      }
    };
    super(inputListenerOptions);
  }
}
shred.register('BucketDragListener', BucketDragListener);
export default BucketDragListener;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkRyYWdMaXN0ZW5lciIsIlRhbmRlbSIsInNocmVkIiwiQnVja2V0RHJhZ0xpc3RlbmVyIiwiY29uc3RydWN0b3IiLCJidWNrZXQiLCJidWNrZXRWaWV3IiwibW9kZWxWaWV3VHJhbnNmb3JtIiwib3B0aW9ucyIsInRhbmRlbSIsIlJFUVVJUkVEIiwibG9jYWxWaWV3VG9Nb2RlbCIsInBvaW50Iiwidmlld1RvTW9kZWxQb3NpdGlvbiIsImdldFBhcmVudHMiLCJnbG9iYWxUb0xvY2FsUG9pbnQiLCJhY3RpdmVQYXJ0aWNsZSIsImlucHV0TGlzdGVuZXJPcHRpb25zIiwic3RhcnQiLCJldmVudCIsInBvc2l0aW9uSW5Nb2RlbFNwYWNlIiwicG9pbnRlciIsImV4dHJhY3RDbG9zZXN0UGFydGljbGUiLCJzZXRQb3NpdGlvbkFuZERlc3RpbmF0aW9uIiwiZHJhZyIsImVuZCIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJ1Y2tldERyYWdMaXN0ZW5lci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIGRyYWcgbGlzdGVuZXIgc3BlY2lmaWNhbGx5IHRhaWxvcmVkIGZvciB0aGUgcGFydGljbGUgYnVja2V0cy4gVGhpcyBsaXN0ZW5lciBleHRyYWN0cyBhIHBhcnRpY2xlIGZyb20gYSBidWNrZXQgYW5kXHJcbiAqIG1hbmFnZXMgaXQgYXMgdGhvdWdoIHRoZSB1c2VyIGhhZCBjbGlja2VkIGRpcmVjdGx5IG9uIHRoZSBwYXJ0aWNsZS4gVGhpcyBleGlzdHMgdG8gbWFrZSBpdCBlYXNpZXIgZm9yIHRoZSB1c2VycyB0b1xyXG4gKiBnZXQgcGFydGljbGVzIG91dCBvZiB0aGUgYnVja2V0cyB3aGVuIHVzaW5nIGEgdG91Y2gtYmFzZWQgZGV2aWNlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IERyYWdMaXN0ZW5lciB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBzaHJlZCBmcm9tICcuLi9zaHJlZC5qcyc7XHJcblxyXG5jbGFzcyBCdWNrZXREcmFnTGlzdGVuZXIgZXh0ZW5kcyBEcmFnTGlzdGVuZXIge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0J1Y2tldH0gYnVja2V0XHJcbiAgICogQHBhcmFtIHtCdWNrZXRGcm9udH0gYnVja2V0Vmlld1xyXG4gICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqIEBjb25zdHJ1Y3RvclxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBidWNrZXQsIGJ1Y2tldFZpZXcsIG1vZGVsVmlld1RyYW5zZm9ybSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBjbG9zdXJlIGZvciBjb252ZXJ0aW5nIGEgcG9pbnQgaW4gbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSB0byBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAgY29uc3QgbG9jYWxWaWV3VG9Nb2RlbCA9IHBvaW50ID0+IHtcclxuXHJcbiAgICAgIC8vIE5vdGU6IFRoZSBmb2xsb3dpbmcgdHJhbnNmb3JtIHdvcmtzLCBidXQgaXQgaXMgYSBiaXQgb2JzY3VyZSwgYW5kIHJlbGllcyBvbiB0aGUgdG9wb2xvZ3kgb2YgdGhlIHNjZW5lIGdyYXBoLlxyXG4gICAgICAvLyBKQiwgU1IsIGFuZCBKTyBkaXNjdXNzZWQgcG90ZW50aWFsbHkgYmV0dGVyIHdheXMgdG8gZG8gaXQgYnV0IGRpZG4ndCBjb21lIHVwIHdpdGggYW55dGhpbmcgYXQgdGhlIHRpbWUuIElmXHJcbiAgICAgIC8vIHRoaXMgY29kZSBpcyBsZXZlcmFnZWQsIHRoaXMgdHJhbnNmb3JtIHNob3VsZCBiZSByZXZpc2l0ZWQgZm9yIHBvdGVudGlhbCBpbXByb3ZlbWVudC5cclxuICAgICAgcmV0dXJuIG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbFBvc2l0aW9uKFxyXG4gICAgICAgIGJ1Y2tldFZpZXcuZ2V0UGFyZW50cygpWyAwIF0uZ2xvYmFsVG9Mb2NhbFBvaW50KCBwb2ludCApXHJcbiAgICAgICk7XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBhY3RpdmVQYXJ0aWNsZSA9IG51bGw7XHJcbiAgICBjb25zdCBpbnB1dExpc3RlbmVyT3B0aW9ucyA9IHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbSxcclxuICAgICAgc3RhcnQ6IGV2ZW50ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgcG9zaXRpb25Jbk1vZGVsU3BhY2UgPSBsb2NhbFZpZXdUb01vZGVsKCBldmVudC5wb2ludGVyLnBvaW50ICk7XHJcblxyXG4gICAgICAgIGFjdGl2ZVBhcnRpY2xlID0gYnVja2V0LmV4dHJhY3RDbG9zZXN0UGFydGljbGUoIHBvc2l0aW9uSW5Nb2RlbFNwYWNlICk7XHJcbiAgICAgICAgaWYgKCBhY3RpdmVQYXJ0aWNsZSAhPT0gbnVsbCApIHtcclxuICAgICAgICAgIGFjdGl2ZVBhcnRpY2xlLnNldFBvc2l0aW9uQW5kRGVzdGluYXRpb24oIHBvc2l0aW9uSW5Nb2RlbFNwYWNlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgZHJhZzogZXZlbnQgPT4ge1xyXG4gICAgICAgIGlmICggYWN0aXZlUGFydGljbGUgIT09IG51bGwgKSB7XHJcbiAgICAgICAgICBhY3RpdmVQYXJ0aWNsZS5zZXRQb3NpdGlvbkFuZERlc3RpbmF0aW9uKCBsb2NhbFZpZXdUb01vZGVsKCBldmVudC5wb2ludGVyLnBvaW50ICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBlbmQ6ICgpID0+IHtcclxuICAgICAgICBpZiAoIGFjdGl2ZVBhcnRpY2xlICE9PSBudWxsICkge1xyXG4gICAgICAgICAgYWN0aXZlUGFydGljbGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICAgICAgICBhY3RpdmVQYXJ0aWNsZSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHN1cGVyKCBpbnB1dExpc3RlbmVyT3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuc2hyZWQucmVnaXN0ZXIoICdCdWNrZXREcmFnTGlzdGVuZXInLCBCdWNrZXREcmFnTGlzdGVuZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgQnVja2V0RHJhZ0xpc3RlbmVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLGdDQUFnQztBQUNsRCxTQUFTQyxZQUFZLFFBQVEsZ0NBQWdDO0FBQzdELE9BQU9DLE1BQU0sTUFBTSw4QkFBOEI7QUFDakQsT0FBT0MsS0FBSyxNQUFNLGFBQWE7QUFFL0IsTUFBTUMsa0JBQWtCLFNBQVNILFlBQVksQ0FBQztFQUU1QztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSSxXQUFXQSxDQUFFQyxNQUFNLEVBQUVDLFVBQVUsRUFBRUMsa0JBQWtCLEVBQUVDLE9BQU8sRUFBRztJQUU3REEsT0FBTyxHQUFHVCxLQUFLLENBQUU7TUFDZlUsTUFBTSxFQUFFUixNQUFNLENBQUNTO0lBQ2pCLENBQUMsRUFBRUYsT0FBUSxDQUFDOztJQUVaO0lBQ0EsTUFBTUcsZ0JBQWdCLEdBQUdDLEtBQUssSUFBSTtNQUVoQztNQUNBO01BQ0E7TUFDQSxPQUFPTCxrQkFBa0IsQ0FBQ00sbUJBQW1CLENBQzNDUCxVQUFVLENBQUNRLFVBQVUsQ0FBQyxDQUFDLENBQUUsQ0FBQyxDQUFFLENBQUNDLGtCQUFrQixDQUFFSCxLQUFNLENBQ3pELENBQUM7SUFDSCxDQUFDO0lBRUQsSUFBSUksY0FBYyxHQUFHLElBQUk7SUFDekIsTUFBTUMsb0JBQW9CLEdBQUc7TUFDM0JSLE1BQU0sRUFBRUQsT0FBTyxDQUFDQyxNQUFNO01BQ3RCUyxLQUFLLEVBQUVDLEtBQUssSUFBSTtRQUVkLE1BQU1DLG9CQUFvQixHQUFHVCxnQkFBZ0IsQ0FBRVEsS0FBSyxDQUFDRSxPQUFPLENBQUNULEtBQU0sQ0FBQztRQUVwRUksY0FBYyxHQUFHWCxNQUFNLENBQUNpQixzQkFBc0IsQ0FBRUYsb0JBQXFCLENBQUM7UUFDdEUsSUFBS0osY0FBYyxLQUFLLElBQUksRUFBRztVQUM3QkEsY0FBYyxDQUFDTyx5QkFBeUIsQ0FBRUgsb0JBQXFCLENBQUM7UUFDbEU7TUFDRixDQUFDO01BRURJLElBQUksRUFBRUwsS0FBSyxJQUFJO1FBQ2IsSUFBS0gsY0FBYyxLQUFLLElBQUksRUFBRztVQUM3QkEsY0FBYyxDQUFDTyx5QkFBeUIsQ0FBRVosZ0JBQWdCLENBQUVRLEtBQUssQ0FBQ0UsT0FBTyxDQUFDVCxLQUFNLENBQUUsQ0FBQztRQUNyRjtNQUNGLENBQUM7TUFFRGEsR0FBRyxFQUFFQSxDQUFBLEtBQU07UUFDVCxJQUFLVCxjQUFjLEtBQUssSUFBSSxFQUFHO1VBQzdCQSxjQUFjLENBQUNVLHNCQUFzQixDQUFDQyxHQUFHLENBQUUsS0FBTSxDQUFDO1VBQ2xEWCxjQUFjLEdBQUcsSUFBSTtRQUN2QjtNQUNGO0lBQ0YsQ0FBQztJQUVELEtBQUssQ0FBRUMsb0JBQXFCLENBQUM7RUFDL0I7QUFDRjtBQUVBZixLQUFLLENBQUMwQixRQUFRLENBQUUsb0JBQW9CLEVBQUV6QixrQkFBbUIsQ0FBQztBQUMxRCxlQUFlQSxrQkFBa0IifQ==