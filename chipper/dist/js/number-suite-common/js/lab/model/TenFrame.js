// Copyright 2019-2023, University of Colorado Boulder

/**
 * The model for a DraggableTenFrameNode
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Vector2Property from '../../../../dot/js/Vector2Property.js';
import TenFrameNode from '../../common/view/TenFrameNode.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import CountingCommonConstants from '../../../../counting-common/js/common/CountingCommonConstants.js';
import Disposable from '../../../../axon/js/Disposable.js';

// constants
const SQUARE_SIDE_LENGTH = 60;
const LINE_WIDTH = 1;
const NUMBER_OF_SPOTS = 10;
const PUSH_AWAY_MARGIN = 10;
class TenFrame extends Disposable {
  // the side length of the squares that make up the ten frame
  static SQUARE_SIDE_LENGTH = SQUARE_SIDE_LENGTH;
  constructor(initialPosition) {
    super();
    this.countingObjects = createObservableArray();
    this.spotCenters = TenFrameNode.getSpotCenters({
      sideLength: SQUARE_SIDE_LENGTH,
      lineWidth: LINE_WIDTH
    });
    this.localBounds = TenFrameNode.getTenFramePath({
      sideLength: SQUARE_SIDE_LENGTH,
      lineWidth: LINE_WIDTH
    }).localBounds;
    this.positionProperty = new Vector2Property(initialPosition);
    this.scaleProperty = new NumberProperty(1, {
      range: new Range(0, 1)
    });
    this.originBounds = new Bounds2(0, 0, 0, 0);
  }
  isFull() {
    return this.countingObjects.length === NUMBER_OF_SPOTS;
  }
  addCountingObject(countingObject) {
    assert && assert(!this.containsCountingObject(countingObject));
    assert && assert(this.countingObjects.length < NUMBER_OF_SPOTS, 'cannot add countingObject to full tenFrame');
    this.countingObjects.add(countingObject);
  }

  /**
   * Sends the provided countingObject outside the nearest border of this ten frame
   */
  pushAwayCountingObject(countingObject, countingAreaBounds) {
    assert && assert(this.isCountingObjectOnTopOf(countingObject), 'attempted to push away countingObject that was not over ten frame');

    // Bounds of this tenFrame in countingArea view coords, offset to the center of the provided countingObject.
    const tenFrameBounds = this.localBounds.shifted(this.positionProperty.value)

    // BIG NOTE HERE: We want to compare based on the visual center, so shift the whole tenFrame to account for it.
    // When trying to instead handle this by shifting the countingObject position, there were too many cases to
    // adjust for each potential destination (or MK isn't talented enough to figure out how).
    .shiftedXY(-countingObject.localBounds.center.x, -countingObject.localBounds.center.y);
    const countingObjectBounds = countingObject.localBounds;
    const countingObjectCenter = countingObjectBounds.center;

    // Adjust bounds based on the actual bounds of the provided countingObject, plus a bit of a margin.
    const containingBounds = new Bounds2(tenFrameBounds.minX, tenFrameBounds.minY, tenFrameBounds.maxX, tenFrameBounds.maxY).dilatedXY(countingObjectBounds.width / 2 + PUSH_AWAY_MARGIN, countingObjectBounds.height / 2 + PUSH_AWAY_MARGIN);
    const countingAreaBoundsErodedHalfOfCountingObject = countingAreaBounds.erodedXY(countingObjectBounds.width / 2, countingObjectBounds.height / 2);

    // find the shortest distance to the edge of the tenFrame
    const countingObjectCenterPosition = countingObject.positionProperty.value;

    // Get a list of all possible destinations, which will always be in cardinal direction, because of Euclidean geometry.
    const potentialDestinations = this.getCardinalPointsFromBounds(countingObjectCenterPosition, containingBounds);

    // sort it by distance, smallest first
    const sorted = _.sortBy(potentialDestinations, a => a.distance(countingObjectCenterPosition));

    // iterate through the other three to see which are in bounds
    for (let i = 0; i < sorted.length; i++) {
      const potentialDestination = sorted[i];

      // BIG NOTE HERE: add back the center for comparison to ensure that the bounds works as expected. Shrugging over here. . .
      if (countingAreaBoundsErodedHalfOfCountingObject.containsPoint(potentialDestination.plus(countingObjectCenter))) {
        // send the countingObject to the closest destination
        countingObject.setConstrainedDestination(countingAreaBounds, potentialDestination, true);
        break; // we found our next closest point
      }
    }
  }

  // Too manual and unhelpful to put in Bounds2 directly
  getCardinalPointsFromBounds(point, bounds) {
    return [new Vector2(bounds.minX, point.y), new Vector2(bounds.maxX, point.y), new Vector2(point.x, bounds.minY), new Vector2(point.x, bounds.maxY)];
  }
  removeCountingObject() {
    this.countingObjects.pop();
  }
  containsCountingObject(countingObject) {
    return this.countingObjects.includes(countingObject);
  }

  /**
   * Is the center of the provided countingObject over this tenFrame.
   */
  isCountingObjectOnTopOf(countingObject) {
    // bounds of this tenFrame with respect to the center of the provided countingObject
    const globalBounds = this.localBounds.shifted(this.positionProperty.value).shiftedXY(-countingObject.localBounds.center.x, -countingObject.localBounds.center.y);
    const countingObjectPosition = countingObject.positionProperty.value;
    return globalBounds.containsPoint(countingObjectPosition);
  }

  /**
   * Determine how this ten frame's origin can be placed in the provided bounds.
   */
  getOriginBounds(viewBounds) {
    this.originBounds.minX = viewBounds.left - this.localBounds.left;
    this.originBounds.minY = viewBounds.top - this.localBounds.top;
    this.originBounds.maxX = viewBounds.right - this.localBounds.right;
    this.originBounds.maxY = viewBounds.bottom - this.localBounds.bottom;
    return this.originBounds.erode(CountingCommonConstants.COUNTING_AREA_MARGIN);
  }

  /**
   * If this ten frame outside the available view bounds, move in inside those bounds. Also move any countingObjects
   * that it contains.
   */
  setConstrainedDestination(viewBounds, newDestination) {
    const originBounds = this.getOriginBounds(viewBounds);
    this.positionProperty.value = originBounds.closestPointTo(newDestination);
    this.countingObjects.forEach(countingObject => {
      countingObject.setDestination(this.getCountingObjectSpot(countingObject), false);
    });
  }

  /**
   * Calculates the position of the given paper number in the ten frame based on its index in the array
   */
  getCountingObjectSpot(countingObject) {
    const countingObjectSpotLocalPosition = this.spotCenters[this.countingObjects.indexOf(countingObject)];
    const countingObjectSpotCenter = this.positionProperty.value.plus(countingObjectSpotLocalPosition);
    const countingObjectOffset = countingObject.localBounds.center;
    return countingObjectSpotCenter.minus(countingObjectOffset);
  }
  dispose() {
    this.countingObjects.dispose();
    this.positionProperty.dispose();
    this.scaleProperty.dispose();
    super.dispose();
  }
}
numberSuiteCommon.register('TenFrame', TenFrame);
export default TenFrame;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyUHJvcGVydHkiLCJUZW5GcmFtZU5vZGUiLCJudW1iZXJTdWl0ZUNvbW1vbiIsIlZlY3RvcjIiLCJCb3VuZHMyIiwiUmFuZ2UiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJOdW1iZXJQcm9wZXJ0eSIsIkNvdW50aW5nQ29tbW9uQ29uc3RhbnRzIiwiRGlzcG9zYWJsZSIsIlNRVUFSRV9TSURFX0xFTkdUSCIsIkxJTkVfV0lEVEgiLCJOVU1CRVJfT0ZfU1BPVFMiLCJQVVNIX0FXQVlfTUFSR0lOIiwiVGVuRnJhbWUiLCJjb25zdHJ1Y3RvciIsImluaXRpYWxQb3NpdGlvbiIsImNvdW50aW5nT2JqZWN0cyIsInNwb3RDZW50ZXJzIiwiZ2V0U3BvdENlbnRlcnMiLCJzaWRlTGVuZ3RoIiwibGluZVdpZHRoIiwibG9jYWxCb3VuZHMiLCJnZXRUZW5GcmFtZVBhdGgiLCJwb3NpdGlvblByb3BlcnR5Iiwic2NhbGVQcm9wZXJ0eSIsInJhbmdlIiwib3JpZ2luQm91bmRzIiwiaXNGdWxsIiwibGVuZ3RoIiwiYWRkQ291bnRpbmdPYmplY3QiLCJjb3VudGluZ09iamVjdCIsImFzc2VydCIsImNvbnRhaW5zQ291bnRpbmdPYmplY3QiLCJhZGQiLCJwdXNoQXdheUNvdW50aW5nT2JqZWN0IiwiY291bnRpbmdBcmVhQm91bmRzIiwiaXNDb3VudGluZ09iamVjdE9uVG9wT2YiLCJ0ZW5GcmFtZUJvdW5kcyIsInNoaWZ0ZWQiLCJ2YWx1ZSIsInNoaWZ0ZWRYWSIsImNlbnRlciIsIngiLCJ5IiwiY291bnRpbmdPYmplY3RCb3VuZHMiLCJjb3VudGluZ09iamVjdENlbnRlciIsImNvbnRhaW5pbmdCb3VuZHMiLCJtaW5YIiwibWluWSIsIm1heFgiLCJtYXhZIiwiZGlsYXRlZFhZIiwid2lkdGgiLCJoZWlnaHQiLCJjb3VudGluZ0FyZWFCb3VuZHNFcm9kZWRIYWxmT2ZDb3VudGluZ09iamVjdCIsImVyb2RlZFhZIiwiY291bnRpbmdPYmplY3RDZW50ZXJQb3NpdGlvbiIsInBvdGVudGlhbERlc3RpbmF0aW9ucyIsImdldENhcmRpbmFsUG9pbnRzRnJvbUJvdW5kcyIsInNvcnRlZCIsIl8iLCJzb3J0QnkiLCJhIiwiZGlzdGFuY2UiLCJpIiwicG90ZW50aWFsRGVzdGluYXRpb24iLCJjb250YWluc1BvaW50IiwicGx1cyIsInNldENvbnN0cmFpbmVkRGVzdGluYXRpb24iLCJwb2ludCIsImJvdW5kcyIsInJlbW92ZUNvdW50aW5nT2JqZWN0IiwicG9wIiwiaW5jbHVkZXMiLCJnbG9iYWxCb3VuZHMiLCJjb3VudGluZ09iamVjdFBvc2l0aW9uIiwiZ2V0T3JpZ2luQm91bmRzIiwidmlld0JvdW5kcyIsImxlZnQiLCJ0b3AiLCJyaWdodCIsImJvdHRvbSIsImVyb2RlIiwiQ09VTlRJTkdfQVJFQV9NQVJHSU4iLCJuZXdEZXN0aW5hdGlvbiIsImNsb3Nlc3RQb2ludFRvIiwiZm9yRWFjaCIsInNldERlc3RpbmF0aW9uIiwiZ2V0Q291bnRpbmdPYmplY3RTcG90IiwiY291bnRpbmdPYmplY3RTcG90TG9jYWxQb3NpdGlvbiIsImluZGV4T2YiLCJjb3VudGluZ09iamVjdFNwb3RDZW50ZXIiLCJjb3VudGluZ09iamVjdE9mZnNldCIsIm1pbnVzIiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVGVuRnJhbWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlIG1vZGVsIGZvciBhIERyYWdnYWJsZVRlbkZyYW1lTm9kZVxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRlbkZyYW1lTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9UZW5GcmFtZU5vZGUuanMnO1xyXG5pbXBvcnQgbnVtYmVyU3VpdGVDb21tb24gZnJvbSAnLi4vLi4vbnVtYmVyU3VpdGVDb21tb24uanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXksIHsgT2JzZXJ2YWJsZUFycmF5IH0gZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgQ291bnRpbmdPYmplY3QgZnJvbSAnLi4vLi4vLi4vLi4vY291bnRpbmctY29tbW9uL2pzL2NvbW1vbi9tb2RlbC9Db3VudGluZ09iamVjdC5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IENvdW50aW5nQ29tbW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL2NvdW50aW5nLWNvbW1vbi9qcy9jb21tb24vQ291bnRpbmdDb21tb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgRGlzcG9zYWJsZSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rpc3Bvc2FibGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFNRVUFSRV9TSURFX0xFTkdUSCA9IDYwO1xyXG5jb25zdCBMSU5FX1dJRFRIID0gMTtcclxuY29uc3QgTlVNQkVSX09GX1NQT1RTID0gMTA7XHJcbmNvbnN0IFBVU0hfQVdBWV9NQVJHSU4gPSAxMDtcclxuXHJcbmNsYXNzIFRlbkZyYW1lIGV4dGVuZHMgRGlzcG9zYWJsZSB7XHJcbiAgcHVibGljIHJlYWRvbmx5IGNvdW50aW5nT2JqZWN0czogT2JzZXJ2YWJsZUFycmF5PENvdW50aW5nT2JqZWN0PjtcclxuICBwdWJsaWMgcmVhZG9ubHkgc3BvdENlbnRlcnM6IFZlY3RvcjJbXTtcclxuICBwdWJsaWMgcmVhZG9ubHkgcG9zaXRpb25Qcm9wZXJ0eTogVmVjdG9yMlByb3BlcnR5O1xyXG4gIHB1YmxpYyByZWFkb25seSBzY2FsZVByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuICBwdWJsaWMgcmVhZG9ubHkgbG9jYWxCb3VuZHM6IEJvdW5kczI7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBvcmlnaW5Cb3VuZHM6IEJvdW5kczI7XHJcblxyXG4gIC8vIHRoZSBzaWRlIGxlbmd0aCBvZiB0aGUgc3F1YXJlcyB0aGF0IG1ha2UgdXAgdGhlIHRlbiBmcmFtZVxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU1FVQVJFX1NJREVfTEVOR1RIID0gU1FVQVJFX1NJREVfTEVOR1RIO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGluaXRpYWxQb3NpdGlvbjogVmVjdG9yMiApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgdGhpcy5jb3VudGluZ09iamVjdHMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTtcclxuXHJcbiAgICB0aGlzLnNwb3RDZW50ZXJzID0gVGVuRnJhbWVOb2RlLmdldFNwb3RDZW50ZXJzKCB7XHJcbiAgICAgIHNpZGVMZW5ndGg6IFNRVUFSRV9TSURFX0xFTkdUSCxcclxuICAgICAgbGluZVdpZHRoOiBMSU5FX1dJRFRIXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5sb2NhbEJvdW5kcyA9IFRlbkZyYW1lTm9kZS5nZXRUZW5GcmFtZVBhdGgoIHtcclxuICAgICAgc2lkZUxlbmd0aDogU1FVQVJFX1NJREVfTEVOR1RILFxyXG4gICAgICBsaW5lV2lkdGg6IExJTkVfV0lEVEhcclxuICAgIH0gKS5sb2NhbEJvdW5kcztcclxuXHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBpbml0aWFsUG9zaXRpb24gKTtcclxuICAgIHRoaXMuc2NhbGVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMSwge1xyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCAxIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm9yaWdpbkJvdW5kcyA9IG5ldyBCb3VuZHMyKCAwLCAwLCAwLCAwICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaXNGdWxsKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuY291bnRpbmdPYmplY3RzLmxlbmd0aCA9PT0gTlVNQkVSX09GX1NQT1RTO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGFkZENvdW50aW5nT2JqZWN0KCBjb3VudGluZ09iamVjdDogQ291bnRpbmdPYmplY3QgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5jb250YWluc0NvdW50aW5nT2JqZWN0KCBjb3VudGluZ09iamVjdCApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmNvdW50aW5nT2JqZWN0cy5sZW5ndGggPCBOVU1CRVJfT0ZfU1BPVFMsICdjYW5ub3QgYWRkIGNvdW50aW5nT2JqZWN0IHRvIGZ1bGwgdGVuRnJhbWUnICk7XHJcbiAgICB0aGlzLmNvdW50aW5nT2JqZWN0cy5hZGQoIGNvdW50aW5nT2JqZWN0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZW5kcyB0aGUgcHJvdmlkZWQgY291bnRpbmdPYmplY3Qgb3V0c2lkZSB0aGUgbmVhcmVzdCBib3JkZXIgb2YgdGhpcyB0ZW4gZnJhbWVcclxuICAgKi9cclxuICBwdWJsaWMgcHVzaEF3YXlDb3VudGluZ09iamVjdCggY291bnRpbmdPYmplY3Q6IENvdW50aW5nT2JqZWN0LCBjb3VudGluZ0FyZWFCb3VuZHM6IEJvdW5kczIgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzQ291bnRpbmdPYmplY3RPblRvcE9mKCBjb3VudGluZ09iamVjdCApLFxyXG4gICAgICAnYXR0ZW1wdGVkIHRvIHB1c2ggYXdheSBjb3VudGluZ09iamVjdCB0aGF0IHdhcyBub3Qgb3ZlciB0ZW4gZnJhbWUnICk7XHJcblxyXG4gICAgLy8gQm91bmRzIG9mIHRoaXMgdGVuRnJhbWUgaW4gY291bnRpbmdBcmVhIHZpZXcgY29vcmRzLCBvZmZzZXQgdG8gdGhlIGNlbnRlciBvZiB0aGUgcHJvdmlkZWQgY291bnRpbmdPYmplY3QuXHJcbiAgICBjb25zdCB0ZW5GcmFtZUJvdW5kcyA9IHRoaXMubG9jYWxCb3VuZHMuc2hpZnRlZCggdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlIClcclxuXHJcbiAgICAgIC8vIEJJRyBOT1RFIEhFUkU6IFdlIHdhbnQgdG8gY29tcGFyZSBiYXNlZCBvbiB0aGUgdmlzdWFsIGNlbnRlciwgc28gc2hpZnQgdGhlIHdob2xlIHRlbkZyYW1lIHRvIGFjY291bnQgZm9yIGl0LlxyXG4gICAgICAvLyBXaGVuIHRyeWluZyB0byBpbnN0ZWFkIGhhbmRsZSB0aGlzIGJ5IHNoaWZ0aW5nIHRoZSBjb3VudGluZ09iamVjdCBwb3NpdGlvbiwgdGhlcmUgd2VyZSB0b28gbWFueSBjYXNlcyB0b1xyXG4gICAgICAvLyBhZGp1c3QgZm9yIGVhY2ggcG90ZW50aWFsIGRlc3RpbmF0aW9uIChvciBNSyBpc24ndCB0YWxlbnRlZCBlbm91Z2ggdG8gZmlndXJlIG91dCBob3cpLlxyXG4gICAgICAuc2hpZnRlZFhZKCAtY291bnRpbmdPYmplY3QubG9jYWxCb3VuZHMuY2VudGVyLngsIC1jb3VudGluZ09iamVjdC5sb2NhbEJvdW5kcy5jZW50ZXIueSApO1xyXG5cclxuICAgIGNvbnN0IGNvdW50aW5nT2JqZWN0Qm91bmRzID0gY291bnRpbmdPYmplY3QubG9jYWxCb3VuZHM7XHJcbiAgICBjb25zdCBjb3VudGluZ09iamVjdENlbnRlciA9IGNvdW50aW5nT2JqZWN0Qm91bmRzLmNlbnRlcjtcclxuXHJcbiAgICAvLyBBZGp1c3QgYm91bmRzIGJhc2VkIG9uIHRoZSBhY3R1YWwgYm91bmRzIG9mIHRoZSBwcm92aWRlZCBjb3VudGluZ09iamVjdCwgcGx1cyBhIGJpdCBvZiBhIG1hcmdpbi5cclxuICAgIGNvbnN0IGNvbnRhaW5pbmdCb3VuZHMgPSBuZXcgQm91bmRzMiggdGVuRnJhbWVCb3VuZHMubWluWCwgdGVuRnJhbWVCb3VuZHMubWluWSwgdGVuRnJhbWVCb3VuZHMubWF4WCwgdGVuRnJhbWVCb3VuZHMubWF4WSApXHJcbiAgICAgIC5kaWxhdGVkWFkoIGNvdW50aW5nT2JqZWN0Qm91bmRzLndpZHRoIC8gMiArIFBVU0hfQVdBWV9NQVJHSU4sIGNvdW50aW5nT2JqZWN0Qm91bmRzLmhlaWdodCAvIDIgKyBQVVNIX0FXQVlfTUFSR0lOICk7XHJcblxyXG4gICAgY29uc3QgY291bnRpbmdBcmVhQm91bmRzRXJvZGVkSGFsZk9mQ291bnRpbmdPYmplY3QgPSBjb3VudGluZ0FyZWFCb3VuZHMuZXJvZGVkWFkoIGNvdW50aW5nT2JqZWN0Qm91bmRzLndpZHRoIC8gMiwgY291bnRpbmdPYmplY3RCb3VuZHMuaGVpZ2h0IC8gMiApO1xyXG5cclxuICAgIC8vIGZpbmQgdGhlIHNob3J0ZXN0IGRpc3RhbmNlIHRvIHRoZSBlZGdlIG9mIHRoZSB0ZW5GcmFtZVxyXG4gICAgY29uc3QgY291bnRpbmdPYmplY3RDZW50ZXJQb3NpdGlvbiA9IGNvdW50aW5nT2JqZWN0LnBvc2l0aW9uUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgLy8gR2V0IGEgbGlzdCBvZiBhbGwgcG9zc2libGUgZGVzdGluYXRpb25zLCB3aGljaCB3aWxsIGFsd2F5cyBiZSBpbiBjYXJkaW5hbCBkaXJlY3Rpb24sIGJlY2F1c2Ugb2YgRXVjbGlkZWFuIGdlb21ldHJ5LlxyXG4gICAgY29uc3QgcG90ZW50aWFsRGVzdGluYXRpb25zID0gdGhpcy5nZXRDYXJkaW5hbFBvaW50c0Zyb21Cb3VuZHMoIGNvdW50aW5nT2JqZWN0Q2VudGVyUG9zaXRpb24sIGNvbnRhaW5pbmdCb3VuZHMgKTtcclxuXHJcbiAgICAvLyBzb3J0IGl0IGJ5IGRpc3RhbmNlLCBzbWFsbGVzdCBmaXJzdFxyXG4gICAgY29uc3Qgc29ydGVkID0gXy5zb3J0QnkoIHBvdGVudGlhbERlc3RpbmF0aW9ucywgYSA9PiBhLmRpc3RhbmNlKCBjb3VudGluZ09iamVjdENlbnRlclBvc2l0aW9uICkgKTtcclxuXHJcbiAgICAvLyBpdGVyYXRlIHRocm91Z2ggdGhlIG90aGVyIHRocmVlIHRvIHNlZSB3aGljaCBhcmUgaW4gYm91bmRzXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzb3J0ZWQubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHBvdGVudGlhbERlc3RpbmF0aW9uID0gc29ydGVkWyBpIF07XHJcblxyXG4gICAgICAvLyBCSUcgTk9URSBIRVJFOiBhZGQgYmFjayB0aGUgY2VudGVyIGZvciBjb21wYXJpc29uIHRvIGVuc3VyZSB0aGF0IHRoZSBib3VuZHMgd29ya3MgYXMgZXhwZWN0ZWQuIFNocnVnZ2luZyBvdmVyIGhlcmUuIC4gLlxyXG4gICAgICBpZiAoIGNvdW50aW5nQXJlYUJvdW5kc0Vyb2RlZEhhbGZPZkNvdW50aW5nT2JqZWN0LmNvbnRhaW5zUG9pbnQoIHBvdGVudGlhbERlc3RpbmF0aW9uLnBsdXMoIGNvdW50aW5nT2JqZWN0Q2VudGVyICkgKSApIHtcclxuXHJcbiAgICAgICAgLy8gc2VuZCB0aGUgY291bnRpbmdPYmplY3QgdG8gdGhlIGNsb3Nlc3QgZGVzdGluYXRpb25cclxuICAgICAgICBjb3VudGluZ09iamVjdC5zZXRDb25zdHJhaW5lZERlc3RpbmF0aW9uKCBjb3VudGluZ0FyZWFCb3VuZHMsIHBvdGVudGlhbERlc3RpbmF0aW9uLCB0cnVlICk7XHJcbiAgICAgICAgYnJlYWs7IC8vIHdlIGZvdW5kIG91ciBuZXh0IGNsb3Nlc3QgcG9pbnRcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVG9vIG1hbnVhbCBhbmQgdW5oZWxwZnVsIHRvIHB1dCBpbiBCb3VuZHMyIGRpcmVjdGx5XHJcbiAgcHJpdmF0ZSBnZXRDYXJkaW5hbFBvaW50c0Zyb21Cb3VuZHMoIHBvaW50OiBWZWN0b3IyLCBib3VuZHM6IEJvdW5kczIgKTogWyBWZWN0b3IyLCBWZWN0b3IyLCBWZWN0b3IyLCBWZWN0b3IyIF0ge1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgbmV3IFZlY3RvcjIoIGJvdW5kcy5taW5YLCBwb2ludC55ICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCBib3VuZHMubWF4WCwgcG9pbnQueSApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggcG9pbnQueCwgYm91bmRzLm1pblkgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIHBvaW50LngsIGJvdW5kcy5tYXhZIClcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVtb3ZlQ291bnRpbmdPYmplY3QoKTogdm9pZCB7XHJcbiAgICB0aGlzLmNvdW50aW5nT2JqZWN0cy5wb3AoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjb250YWluc0NvdW50aW5nT2JqZWN0KCBjb3VudGluZ09iamVjdDogQ291bnRpbmdPYmplY3QgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5jb3VudGluZ09iamVjdHMuaW5jbHVkZXMoIGNvdW50aW5nT2JqZWN0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJcyB0aGUgY2VudGVyIG9mIHRoZSBwcm92aWRlZCBjb3VudGluZ09iamVjdCBvdmVyIHRoaXMgdGVuRnJhbWUuXHJcbiAgICovXHJcbiAgcHVibGljIGlzQ291bnRpbmdPYmplY3RPblRvcE9mKCBjb3VudGluZ09iamVjdDogQ291bnRpbmdPYmplY3QgKTogYm9vbGVhbiB7XHJcblxyXG4gICAgLy8gYm91bmRzIG9mIHRoaXMgdGVuRnJhbWUgd2l0aCByZXNwZWN0IHRvIHRoZSBjZW50ZXIgb2YgdGhlIHByb3ZpZGVkIGNvdW50aW5nT2JqZWN0XHJcbiAgICBjb25zdCBnbG9iYWxCb3VuZHMgPSB0aGlzLmxvY2FsQm91bmRzLnNoaWZ0ZWQoIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApXHJcbiAgICAgIC5zaGlmdGVkWFkoIC1jb3VudGluZ09iamVjdC5sb2NhbEJvdW5kcy5jZW50ZXIueCwgLWNvdW50aW5nT2JqZWN0LmxvY2FsQm91bmRzLmNlbnRlci55ICk7XHJcbiAgICBjb25zdCBjb3VudGluZ09iamVjdFBvc2l0aW9uID0gY291bnRpbmdPYmplY3QucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICByZXR1cm4gZ2xvYmFsQm91bmRzLmNvbnRhaW5zUG9pbnQoIGNvdW50aW5nT2JqZWN0UG9zaXRpb24gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZSBob3cgdGhpcyB0ZW4gZnJhbWUncyBvcmlnaW4gY2FuIGJlIHBsYWNlZCBpbiB0aGUgcHJvdmlkZWQgYm91bmRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRPcmlnaW5Cb3VuZHMoIHZpZXdCb3VuZHM6IEJvdW5kczIgKTogQm91bmRzMiB7XHJcbiAgICB0aGlzLm9yaWdpbkJvdW5kcy5taW5YID0gdmlld0JvdW5kcy5sZWZ0IC0gdGhpcy5sb2NhbEJvdW5kcy5sZWZ0O1xyXG4gICAgdGhpcy5vcmlnaW5Cb3VuZHMubWluWSA9IHZpZXdCb3VuZHMudG9wIC0gdGhpcy5sb2NhbEJvdW5kcy50b3A7XHJcbiAgICB0aGlzLm9yaWdpbkJvdW5kcy5tYXhYID0gdmlld0JvdW5kcy5yaWdodCAtIHRoaXMubG9jYWxCb3VuZHMucmlnaHQ7XHJcbiAgICB0aGlzLm9yaWdpbkJvdW5kcy5tYXhZID0gdmlld0JvdW5kcy5ib3R0b20gLSB0aGlzLmxvY2FsQm91bmRzLmJvdHRvbTtcclxuICAgIHJldHVybiB0aGlzLm9yaWdpbkJvdW5kcy5lcm9kZSggQ291bnRpbmdDb21tb25Db25zdGFudHMuQ09VTlRJTkdfQVJFQV9NQVJHSU4gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElmIHRoaXMgdGVuIGZyYW1lIG91dHNpZGUgdGhlIGF2YWlsYWJsZSB2aWV3IGJvdW5kcywgbW92ZSBpbiBpbnNpZGUgdGhvc2UgYm91bmRzLiBBbHNvIG1vdmUgYW55IGNvdW50aW5nT2JqZWN0c1xyXG4gICAqIHRoYXQgaXQgY29udGFpbnMuXHJcbiAgICovXHJcbiAgcHVibGljIHNldENvbnN0cmFpbmVkRGVzdGluYXRpb24oIHZpZXdCb3VuZHM6IEJvdW5kczIsIG5ld0Rlc3RpbmF0aW9uOiBWZWN0b3IyICk6IHZvaWQge1xyXG4gICAgY29uc3Qgb3JpZ2luQm91bmRzID0gdGhpcy5nZXRPcmlnaW5Cb3VuZHMoIHZpZXdCb3VuZHMgKTtcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IG9yaWdpbkJvdW5kcy5jbG9zZXN0UG9pbnRUbyggbmV3RGVzdGluYXRpb24gKTtcclxuXHJcbiAgICB0aGlzLmNvdW50aW5nT2JqZWN0cy5mb3JFYWNoKCBjb3VudGluZ09iamVjdCA9PiB7XHJcbiAgICAgIGNvdW50aW5nT2JqZWN0LnNldERlc3RpbmF0aW9uKCB0aGlzLmdldENvdW50aW5nT2JqZWN0U3BvdCggY291bnRpbmdPYmplY3QgKSwgZmFsc2UgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGN1bGF0ZXMgdGhlIHBvc2l0aW9uIG9mIHRoZSBnaXZlbiBwYXBlciBudW1iZXIgaW4gdGhlIHRlbiBmcmFtZSBiYXNlZCBvbiBpdHMgaW5kZXggaW4gdGhlIGFycmF5XHJcbiAgICovXHJcbiAgcHVibGljIGdldENvdW50aW5nT2JqZWN0U3BvdCggY291bnRpbmdPYmplY3Q6IENvdW50aW5nT2JqZWN0ICk6IFZlY3RvcjIge1xyXG4gICAgY29uc3QgY291bnRpbmdPYmplY3RTcG90TG9jYWxQb3NpdGlvbiA9IHRoaXMuc3BvdENlbnRlcnNbIHRoaXMuY291bnRpbmdPYmplY3RzLmluZGV4T2YoIGNvdW50aW5nT2JqZWN0ICkgXTtcclxuICAgIGNvbnN0IGNvdW50aW5nT2JqZWN0U3BvdENlbnRlciA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzKCBjb3VudGluZ09iamVjdFNwb3RMb2NhbFBvc2l0aW9uICk7XHJcblxyXG4gICAgY29uc3QgY291bnRpbmdPYmplY3RPZmZzZXQgPSBjb3VudGluZ09iamVjdC5sb2NhbEJvdW5kcy5jZW50ZXI7XHJcbiAgICByZXR1cm4gY291bnRpbmdPYmplY3RTcG90Q2VudGVyLm1pbnVzKCBjb3VudGluZ09iamVjdE9mZnNldCApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmNvdW50aW5nT2JqZWN0cy5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5zY2FsZVByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbm51bWJlclN1aXRlQ29tbW9uLnJlZ2lzdGVyKCAnVGVuRnJhbWUnLCBUZW5GcmFtZSApO1xyXG5leHBvcnQgZGVmYXVsdCBUZW5GcmFtZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHVDQUF1QztBQUNuRSxPQUFPQyxZQUFZLE1BQU0sbUNBQW1DO0FBQzVELE9BQU9DLGlCQUFpQixNQUFNLDRCQUE0QjtBQUMxRCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxxQkFBcUIsTUFBMkIsOENBQThDO0FBRXJHLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsdUJBQXVCLE1BQU0sa0VBQWtFO0FBQ3RHLE9BQU9DLFVBQVUsTUFBTSxtQ0FBbUM7O0FBRTFEO0FBQ0EsTUFB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