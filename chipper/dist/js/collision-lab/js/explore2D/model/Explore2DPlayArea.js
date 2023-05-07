// Copyright 2020, University of Colorado Boulder

/**
 * Explore2DPlayArea is a PlayArea sub-type for the 'Explore 2D' screen.
 *
 * @author Brandon Li
 */

import Range from '../../../../dot/js/Range.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import PlayArea from '../../common/model/PlayArea.js';

// constants
const ELASTICITY_PERCENT_RANGE = CollisionLabConstants.ELASTICITY_PERCENT_RANGE;
const ELASTICITY_PERCENT_INTERVAL = CollisionLabConstants.ELASTICITY_PERCENT_INTERVAL;
class Explore2DPlayArea extends PlayArea {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    super(PlayArea.Dimension.TWO, options);

    //----------------------------------------------------------------------------------------

    assert && this.elasticityPercentProperty.link(elasticityPercent => {
      assert(elasticityPercent !== 0, 'No perfectly inelastic collisions for Explore 2D');
    });

    // @public
    this.enabledElasticityRange = new Range(ELASTICITY_PERCENT_INTERVAL, ELASTICITY_PERCENT_RANGE.max);
    this.elasticityPercentProperty.range = this.enabledElasticityRange;
  }
}
collisionLab.register('Explore2DPlayArea', Explore2DPlayArea);
export default Explore2DPlayArea;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsImNvbGxpc2lvbkxhYiIsIkNvbGxpc2lvbkxhYkNvbnN0YW50cyIsIlBsYXlBcmVhIiwiRUxBU1RJQ0lUWV9QRVJDRU5UX1JBTkdFIiwiRUxBU1RJQ0lUWV9QRVJDRU5UX0lOVEVSVkFMIiwiRXhwbG9yZTJEUGxheUFyZWEiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJEaW1lbnNpb24iLCJUV08iLCJhc3NlcnQiLCJlbGFzdGljaXR5UGVyY2VudFByb3BlcnR5IiwibGluayIsImVsYXN0aWNpdHlQZXJjZW50IiwiZW5hYmxlZEVsYXN0aWNpdHlSYW5nZSIsIm1heCIsInJhbmdlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFeHBsb3JlMkRQbGF5QXJlYS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRXhwbG9yZTJEUGxheUFyZWEgaXMgYSBQbGF5QXJlYSBzdWItdHlwZSBmb3IgdGhlICdFeHBsb3JlIDJEJyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKi9cclxuXHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgY29sbGlzaW9uTGFiIGZyb20gJy4uLy4uL2NvbGxpc2lvbkxhYi5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0NvbGxpc2lvbkxhYkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBQbGF5QXJlYSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvUGxheUFyZWEuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEVMQVNUSUNJVFlfUEVSQ0VOVF9SQU5HRSA9IENvbGxpc2lvbkxhYkNvbnN0YW50cy5FTEFTVElDSVRZX1BFUkNFTlRfUkFOR0U7XHJcbmNvbnN0IEVMQVNUSUNJVFlfUEVSQ0VOVF9JTlRFUlZBTCA9IENvbGxpc2lvbkxhYkNvbnN0YW50cy5FTEFTVElDSVRZX1BFUkNFTlRfSU5URVJWQUw7XHJcblxyXG5jbGFzcyBFeHBsb3JlMkRQbGF5QXJlYSBleHRlbmRzIFBsYXlBcmVhIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCBQbGF5QXJlYS5EaW1lbnNpb24uVFdPLCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgYXNzZXJ0ICYmIHRoaXMuZWxhc3RpY2l0eVBlcmNlbnRQcm9wZXJ0eS5saW5rKCBlbGFzdGljaXR5UGVyY2VudCA9PiB7XHJcbiAgICAgIGFzc2VydCggZWxhc3RpY2l0eVBlcmNlbnQgIT09IDAsICdObyBwZXJmZWN0bHkgaW5lbGFzdGljIGNvbGxpc2lvbnMgZm9yIEV4cGxvcmUgMkQnICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy5lbmFibGVkRWxhc3RpY2l0eVJhbmdlID0gbmV3IFJhbmdlKCBFTEFTVElDSVRZX1BFUkNFTlRfSU5URVJWQUwsIEVMQVNUSUNJVFlfUEVSQ0VOVF9SQU5HRS5tYXggKTtcclxuXHJcbiAgICB0aGlzLmVsYXN0aWNpdHlQZXJjZW50UHJvcGVydHkucmFuZ2UgPSB0aGlzLmVuYWJsZWRFbGFzdGljaXR5UmFuZ2U7XHJcbiAgfVxyXG59XHJcblxyXG5jb2xsaXNpb25MYWIucmVnaXN0ZXIoICdFeHBsb3JlMkRQbGF5QXJlYScsIEV4cGxvcmUyRFBsYXlBcmVhICk7XHJcbmV4cG9ydCBkZWZhdWx0IEV4cGxvcmUyRFBsYXlBcmVhOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFDaEQsT0FBT0MscUJBQXFCLE1BQU0sdUNBQXVDO0FBQ3pFLE9BQU9DLFFBQVEsTUFBTSxnQ0FBZ0M7O0FBRXJEO0FBQ0EsTUFBTUMsd0JBQXdCLEdBQUdGLHFCQUFxQixDQUFDRSx3QkFBd0I7QUFDL0UsTUFBTUMsMkJBQTJCLEdBQUdILHFCQUFxQixDQUFDRywyQkFBMkI7QUFFckYsTUFBTUMsaUJBQWlCLFNBQVNILFFBQVEsQ0FBQztFQUV2QztBQUNGO0FBQ0E7RUFDRUksV0FBV0EsQ0FBRUMsT0FBTyxFQUFHO0lBRXJCLEtBQUssQ0FBRUwsUUFBUSxDQUFDTSxTQUFTLENBQUNDLEdBQUcsRUFBRUYsT0FBUSxDQUFDOztJQUV4Qzs7SUFFQUcsTUFBTSxJQUFJLElBQUksQ0FBQ0MseUJBQXlCLENBQUNDLElBQUksQ0FBRUMsaUJBQWlCLElBQUk7TUFDbEVILE1BQU0sQ0FBRUcsaUJBQWlCLEtBQUssQ0FBQyxFQUFFLGtEQUFtRCxDQUFDO0lBQ3ZGLENBQUUsQ0FBQzs7SUFFSDtJQUNBLElBQUksQ0FBQ0Msc0JBQXNCLEdBQUcsSUFBSWYsS0FBSyxDQUFFSywyQkFBMkIsRUFBRUQsd0JBQXdCLENBQUNZLEdBQUksQ0FBQztJQUVwRyxJQUFJLENBQUNKLHlCQUF5QixDQUFDSyxLQUFLLEdBQUcsSUFBSSxDQUFDRixzQkFBc0I7RUFDcEU7QUFDRjtBQUVBZCxZQUFZLENBQUNpQixRQUFRLENBQUUsbUJBQW1CLEVBQUVaLGlCQUFrQixDQUFDO0FBQy9ELGVBQWVBLGlCQUFpQiJ9