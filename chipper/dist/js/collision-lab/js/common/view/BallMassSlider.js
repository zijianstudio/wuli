// Copyright 2020, University of Colorado Boulder

/**
 * BallMassSlider is a HSlider sub-type that appears in the BallValuesPanel when 'More Data' is off. It allows the user
 * to laterally manipulate the mass of a Ball. The color of the slider-thumb is based on the color of the Ball.
 *
 * The BallMassSlider should be disposed if the Ball is removed from the PlayArea.
 *
 * @author Brandon Li
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import HSlider from '../../../../sun/js/HSlider.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from '../model/Ball.js';
class BallMassSlider extends HSlider {
  /**
   * @param {Ball} ball
   * @param {BallSystem} ballSystem
   * @param {Object} [options]
   */
  constructor(ball, ballSystem, options) {
    assert && assert(ball instanceof Ball, `invalid Ball: ${ball}`);
    options = merge({
      // super-class options
      trackSize: new Dimension2(180, 0.5),
      thumbSize: new Dimension2(12, 22),
      thumbFill: CollisionLabColors.BALL_COLORS[ball.index - 1],
      thumbFillHighlighted: CollisionLabColors.BALL_COLORS[ball.index - 1].colorUtilsBrighter(0.5),
      thumbTouchAreaXDilation: 7,
      thumbTouchAreaYDilation: 1
    }, options);

    //----------------------------------------------------------------------------------------

    assert && assert(!options.startDrag, 'BallMassSlider sets startDrag.');
    assert && assert(!options.drag, 'BallMassSlider sets drag.');
    assert && assert(!options.endDrag, 'BallMassSlider sets endDrag.');

    // Set the massUserControlledProperty of the Ball to true when dragging. See
    // https://github.com/phetsims/collision-lab/issues/76
    options.startDrag = () => {
      ball.massUserControlledProperty.value = true;
    };
    options.endDrag = () => {
      ballSystem.bumpBallAwayFromOthers(ball);
      ball.massUserControlledProperty.value = false;
    };

    //----------------------------------------------------------------------------------------

    super(ball.massProperty, CollisionLabConstants.MASS_RANGE, options);
  }
}
collisionLab.register('BallMassSlider', BallMassSlider);
export default BallMassSlider;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwibWVyZ2UiLCJIU2xpZGVyIiwiY29sbGlzaW9uTGFiIiwiQ29sbGlzaW9uTGFiQ29sb3JzIiwiQ29sbGlzaW9uTGFiQ29uc3RhbnRzIiwiQmFsbCIsIkJhbGxNYXNzU2xpZGVyIiwiY29uc3RydWN0b3IiLCJiYWxsIiwiYmFsbFN5c3RlbSIsIm9wdGlvbnMiLCJhc3NlcnQiLCJ0cmFja1NpemUiLCJ0aHVtYlNpemUiLCJ0aHVtYkZpbGwiLCJCQUxMX0NPTE9SUyIsImluZGV4IiwidGh1bWJGaWxsSGlnaGxpZ2h0ZWQiLCJjb2xvclV0aWxzQnJpZ2h0ZXIiLCJ0aHVtYlRvdWNoQXJlYVhEaWxhdGlvbiIsInRodW1iVG91Y2hBcmVhWURpbGF0aW9uIiwic3RhcnREcmFnIiwiZHJhZyIsImVuZERyYWciLCJtYXNzVXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsInZhbHVlIiwiYnVtcEJhbGxBd2F5RnJvbU90aGVycyIsIm1hc3NQcm9wZXJ0eSIsIk1BU1NfUkFOR0UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJhbGxNYXNzU2xpZGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCYWxsTWFzc1NsaWRlciBpcyBhIEhTbGlkZXIgc3ViLXR5cGUgdGhhdCBhcHBlYXJzIGluIHRoZSBCYWxsVmFsdWVzUGFuZWwgd2hlbiAnTW9yZSBEYXRhJyBpcyBvZmYuIEl0IGFsbG93cyB0aGUgdXNlclxyXG4gKiB0byBsYXRlcmFsbHkgbWFuaXB1bGF0ZSB0aGUgbWFzcyBvZiBhIEJhbGwuIFRoZSBjb2xvciBvZiB0aGUgc2xpZGVyLXRodW1iIGlzIGJhc2VkIG9uIHRoZSBjb2xvciBvZiB0aGUgQmFsbC5cclxuICpcclxuICogVGhlIEJhbGxNYXNzU2xpZGVyIHNob3VsZCBiZSBkaXNwb3NlZCBpZiB0aGUgQmFsbCBpcyByZW1vdmVkIGZyb20gdGhlIFBsYXlBcmVhLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEJyYW5kb24gTGlcclxuICovXHJcblxyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgSFNsaWRlciBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvSFNsaWRlci5qcyc7XHJcbmltcG9ydCBjb2xsaXNpb25MYWIgZnJvbSAnLi4vLi4vY29sbGlzaW9uTGFiLmpzJztcclxuaW1wb3J0IENvbGxpc2lvbkxhYkNvbG9ycyBmcm9tICcuLi9Db2xsaXNpb25MYWJDb2xvcnMuanMnO1xyXG5pbXBvcnQgQ29sbGlzaW9uTGFiQ29uc3RhbnRzIGZyb20gJy4uL0NvbGxpc2lvbkxhYkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBCYWxsIGZyb20gJy4uL21vZGVsL0JhbGwuanMnO1xyXG5cclxuY2xhc3MgQmFsbE1hc3NTbGlkZXIgZXh0ZW5kcyBIU2xpZGVyIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtCYWxsfSBiYWxsXHJcbiAgICogQHBhcmFtIHtCYWxsU3lzdGVtfSBiYWxsU3lzdGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBiYWxsLCBiYWxsU3lzdGVtLCBvcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmFsbCBpbnN0YW5jZW9mIEJhbGwsIGBpbnZhbGlkIEJhbGw6ICR7YmFsbH1gICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBzdXBlci1jbGFzcyBvcHRpb25zXHJcbiAgICAgIHRyYWNrU2l6ZTogbmV3IERpbWVuc2lvbjIoIDE4MCwgMC41ICksXHJcbiAgICAgIHRodW1iU2l6ZTogbmV3IERpbWVuc2lvbjIoIDEyLCAyMiApLFxyXG4gICAgICB0aHVtYkZpbGw6IENvbGxpc2lvbkxhYkNvbG9ycy5CQUxMX0NPTE9SU1sgYmFsbC5pbmRleCAtIDEgXSxcclxuICAgICAgdGh1bWJGaWxsSGlnaGxpZ2h0ZWQ6IENvbGxpc2lvbkxhYkNvbG9ycy5CQUxMX0NPTE9SU1sgYmFsbC5pbmRleCAtIDEgXS5jb2xvclV0aWxzQnJpZ2h0ZXIoIDAuNSApLFxyXG4gICAgICB0aHVtYlRvdWNoQXJlYVhEaWxhdGlvbjogNyxcclxuICAgICAgdGh1bWJUb3VjaEFyZWFZRGlsYXRpb246IDFcclxuXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuc3RhcnREcmFnLCAnQmFsbE1hc3NTbGlkZXIgc2V0cyBzdGFydERyYWcuJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuZHJhZywgJ0JhbGxNYXNzU2xpZGVyIHNldHMgZHJhZy4nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5lbmREcmFnLCAnQmFsbE1hc3NTbGlkZXIgc2V0cyBlbmREcmFnLicgKTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIG1hc3NVc2VyQ29udHJvbGxlZFByb3BlcnR5IG9mIHRoZSBCYWxsIHRvIHRydWUgd2hlbiBkcmFnZ2luZy4gU2VlXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY29sbGlzaW9uLWxhYi9pc3N1ZXMvNzZcclxuICAgIG9wdGlvbnMuc3RhcnREcmFnID0gKCkgPT4geyBiYWxsLm1hc3NVc2VyQ29udHJvbGxlZFByb3BlcnR5LnZhbHVlID0gdHJ1ZTsgfTtcclxuICAgIG9wdGlvbnMuZW5kRHJhZyA9ICgpID0+IHtcclxuICAgICAgYmFsbFN5c3RlbS5idW1wQmFsbEF3YXlGcm9tT3RoZXJzKCBiYWxsICk7XHJcbiAgICAgIGJhbGwubWFzc1VzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc3VwZXIoIGJhbGwubWFzc1Byb3BlcnR5LCBDb2xsaXNpb25MYWJDb25zdGFudHMuTUFTU19SQU5HRSwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuY29sbGlzaW9uTGFiLnJlZ2lzdGVyKCAnQmFsbE1hc3NTbGlkZXInLCBCYWxsTWFzc1NsaWRlciApO1xyXG5leHBvcnQgZGVmYXVsdCBCYWxsTWFzc1NsaWRlcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsWUFBWSxNQUFNLHVCQUF1QjtBQUNoRCxPQUFPQyxrQkFBa0IsTUFBTSwwQkFBMEI7QUFDekQsT0FBT0MscUJBQXFCLE1BQU0sNkJBQTZCO0FBQy9ELE9BQU9DLElBQUksTUFBTSxrQkFBa0I7QUFFbkMsTUFBTUMsY0FBYyxTQUFTTCxPQUFPLENBQUM7RUFFbkM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFTSxXQUFXQSxDQUFFQyxJQUFJLEVBQUVDLFVBQVUsRUFBRUMsT0FBTyxFQUFHO0lBQ3ZDQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUgsSUFBSSxZQUFZSCxJQUFJLEVBQUcsaUJBQWdCRyxJQUFLLEVBQUUsQ0FBQztJQUVqRUUsT0FBTyxHQUFHVixLQUFLLENBQUU7TUFFZjtNQUNBWSxTQUFTLEVBQUUsSUFBSWIsVUFBVSxDQUFFLEdBQUcsRUFBRSxHQUFJLENBQUM7TUFDckNjLFNBQVMsRUFBRSxJQUFJZCxVQUFVLENBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQztNQUNuQ2UsU0FBUyxFQUFFWCxrQkFBa0IsQ0FBQ1ksV0FBVyxDQUFFUCxJQUFJLENBQUNRLEtBQUssR0FBRyxDQUFDLENBQUU7TUFDM0RDLG9CQUFvQixFQUFFZCxrQkFBa0IsQ0FBQ1ksV0FBVyxDQUFFUCxJQUFJLENBQUNRLEtBQUssR0FBRyxDQUFDLENBQUUsQ0FBQ0Usa0JBQWtCLENBQUUsR0FBSSxDQUFDO01BQ2hHQyx1QkFBdUIsRUFBRSxDQUFDO01BQzFCQyx1QkFBdUIsRUFBRTtJQUUzQixDQUFDLEVBQUVWLE9BQVEsQ0FBQzs7SUFFWjs7SUFFQUMsTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQ0QsT0FBTyxDQUFDVyxTQUFTLEVBQUUsZ0NBQWlDLENBQUM7SUFDeEVWLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUNELE9BQU8sQ0FBQ1ksSUFBSSxFQUFFLDJCQUE0QixDQUFDO0lBQzlEWCxNQUFNLElBQUlBLE1BQU0sQ0FBRSxDQUFDRCxPQUFPLENBQUNhLE9BQU8sRUFBRSw4QkFBK0IsQ0FBQzs7SUFFcEU7SUFDQTtJQUNBYixPQUFPLENBQUNXLFNBQVMsR0FBRyxNQUFNO01BQUViLElBQUksQ0FBQ2dCLDBCQUEwQixDQUFDQyxLQUFLLEdBQUcsSUFBSTtJQUFFLENBQUM7SUFDM0VmLE9BQU8sQ0FBQ2EsT0FBTyxHQUFHLE1BQU07TUFDdEJkLFVBQVUsQ0FBQ2lCLHNCQUFzQixDQUFFbEIsSUFBSyxDQUFDO01BQ3pDQSxJQUFJLENBQUNnQiwwQkFBMEIsQ0FBQ0MsS0FBSyxHQUFHLEtBQUs7SUFDL0MsQ0FBQzs7SUFFRDs7SUFFQSxLQUFLLENBQUVqQixJQUFJLENBQUNtQixZQUFZLEVBQUV2QixxQkFBcUIsQ0FBQ3dCLFVBQVUsRUFBRWxCLE9BQVEsQ0FBQztFQUN2RTtBQUNGO0FBRUFSLFlBQVksQ0FBQzJCLFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRXZCLGNBQWUsQ0FBQztBQUN6RCxlQUFlQSxjQUFjIn0=