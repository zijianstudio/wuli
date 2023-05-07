// Copyright 2020-2021, University of Colorado Boulder

/**
 * Explore2DControlPanel is a CollisionLabControlPanel sub-type for the 'Explore 2D' screen, which appears on the
 * upper-right corner of the screen.
 *
 * It adds a 'Path' Checkbox to allow the user to toggle the visibility of Ball and Center of Mass paths. The 'Path'
 * checkbox is inserted right below the 'Values' checkbox of the super-class. All other configurations and options
 * are the same.
 *
 * @author Brandon Li
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabControlPanel from '../../common/view/CollisionLabControlPanel.js';
import CollisionLabViewProperties from '../../common/view/CollisionLabViewProperties.js';
class Explore2DControlPanel extends CollisionLabControlPanel {
  /**
   * @param {CollisionLabViewProperties} viewProperties
   * @param {Property.<boolean>} centerOfMassVisibleProperty
   * @param {Property.<boolean>} pathsVisibleProperty
   * @param {Property.<boolean>} reflectingBorderProperty
   * @param {Property.<number>} elasticityPercentProperty
   * @param {Range} enabledElasticityRange
   * @param {Property.<boolean>} ballsConstantSizeProperty
   * @param {Object} [options]
   */
  constructor(viewProperties, centerOfMassVisibleProperty, pathsVisibleProperty, reflectingBorderProperty, elasticityPercentProperty, enabledElasticityRange, ballsConstantSizeProperty, options) {
    assert && assert(viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}`);
    assert && AssertUtils.assertPropertyOf(centerOfMassVisibleProperty, 'boolean');
    assert && AssertUtils.assertPropertyOf(reflectingBorderProperty, 'boolean');
    assert && AssertUtils.assertPropertyOf(elasticityPercentProperty, 'number');
    assert && AssertUtils.assertPropertyOf(ballsConstantSizeProperty, 'boolean');
    options = merge({
      elasticityNumberControlOptions: {
        trackHeight: 3
      }
    }, options);
    assert && assert(!options.elasticityNumberControlOptions.enabledRangeProperty, 'Explore2DControlPanel sets enabledRangeProperty');
    options.elasticityNumberControlOptions.enabledRangeProperty = new Property(enabledElasticityRange);
    super(viewProperties, centerOfMassVisibleProperty, pathsVisibleProperty, reflectingBorderProperty, elasticityPercentProperty, ballsConstantSizeProperty, options);
  }
}
collisionLab.register('Explore2DControlPanel', Explore2DControlPanel);
export default Explore2DControlPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIm1lcmdlIiwiQXNzZXJ0VXRpbHMiLCJjb2xsaXNpb25MYWIiLCJDb2xsaXNpb25MYWJDb250cm9sUGFuZWwiLCJDb2xsaXNpb25MYWJWaWV3UHJvcGVydGllcyIsIkV4cGxvcmUyRENvbnRyb2xQYW5lbCIsImNvbnN0cnVjdG9yIiwidmlld1Byb3BlcnRpZXMiLCJjZW50ZXJPZk1hc3NWaXNpYmxlUHJvcGVydHkiLCJwYXRoc1Zpc2libGVQcm9wZXJ0eSIsInJlZmxlY3RpbmdCb3JkZXJQcm9wZXJ0eSIsImVsYXN0aWNpdHlQZXJjZW50UHJvcGVydHkiLCJlbmFibGVkRWxhc3RpY2l0eVJhbmdlIiwiYmFsbHNDb25zdGFudFNpemVQcm9wZXJ0eSIsIm9wdGlvbnMiLCJhc3NlcnQiLCJhc3NlcnRQcm9wZXJ0eU9mIiwiZWxhc3RpY2l0eU51bWJlckNvbnRyb2xPcHRpb25zIiwidHJhY2tIZWlnaHQiLCJlbmFibGVkUmFuZ2VQcm9wZXJ0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRXhwbG9yZTJEQ29udHJvbFBhbmVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEV4cGxvcmUyRENvbnRyb2xQYW5lbCBpcyBhIENvbGxpc2lvbkxhYkNvbnRyb2xQYW5lbCBzdWItdHlwZSBmb3IgdGhlICdFeHBsb3JlIDJEJyBzY3JlZW4sIHdoaWNoIGFwcGVhcnMgb24gdGhlXHJcbiAqIHVwcGVyLXJpZ2h0IGNvcm5lciBvZiB0aGUgc2NyZWVuLlxyXG4gKlxyXG4gKiBJdCBhZGRzIGEgJ1BhdGgnIENoZWNrYm94IHRvIGFsbG93IHRoZSB1c2VyIHRvIHRvZ2dsZSB0aGUgdmlzaWJpbGl0eSBvZiBCYWxsIGFuZCBDZW50ZXIgb2YgTWFzcyBwYXRocy4gVGhlICdQYXRoJ1xyXG4gKiBjaGVja2JveCBpcyBpbnNlcnRlZCByaWdodCBiZWxvdyB0aGUgJ1ZhbHVlcycgY2hlY2tib3ggb2YgdGhlIHN1cGVyLWNsYXNzLiBBbGwgb3RoZXIgY29uZmlndXJhdGlvbnMgYW5kIG9wdGlvbnNcclxuICogYXJlIHRoZSBzYW1lLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEJyYW5kb24gTGlcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgQXNzZXJ0VXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9Bc3NlcnRVdGlscy5qcyc7XHJcbmltcG9ydCBjb2xsaXNpb25MYWIgZnJvbSAnLi4vLi4vY29sbGlzaW9uTGFiLmpzJztcclxuaW1wb3J0IENvbGxpc2lvbkxhYkNvbnRyb2xQYW5lbCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9Db2xsaXNpb25MYWJDb250cm9sUGFuZWwuanMnO1xyXG5pbXBvcnQgQ29sbGlzaW9uTGFiVmlld1Byb3BlcnRpZXMgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQ29sbGlzaW9uTGFiVmlld1Byb3BlcnRpZXMuanMnO1xyXG5cclxuY2xhc3MgRXhwbG9yZTJEQ29udHJvbFBhbmVsIGV4dGVuZHMgQ29sbGlzaW9uTGFiQ29udHJvbFBhbmVsIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtDb2xsaXNpb25MYWJWaWV3UHJvcGVydGllc30gdmlld1Byb3BlcnRpZXNcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gY2VudGVyT2ZNYXNzVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHBhdGhzVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHJlZmxlY3RpbmdCb3JkZXJQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IGVsYXN0aWNpdHlQZXJjZW50UHJvcGVydHlcclxuICAgKiBAcGFyYW0ge1JhbmdlfSBlbmFibGVkRWxhc3RpY2l0eVJhbmdlXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGJhbGxzQ29uc3RhbnRTaXplUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHZpZXdQcm9wZXJ0aWVzLFxyXG4gICAgICAgICAgICAgICBjZW50ZXJPZk1hc3NWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgICAgICAgICAgIHBhdGhzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICAgICAgICAgICByZWZsZWN0aW5nQm9yZGVyUHJvcGVydHksXHJcbiAgICAgICAgICAgICAgIGVsYXN0aWNpdHlQZXJjZW50UHJvcGVydHksXHJcbiAgICAgICAgICAgICAgIGVuYWJsZWRFbGFzdGljaXR5UmFuZ2UsXHJcbiAgICAgICAgICAgICAgIGJhbGxzQ29uc3RhbnRTaXplUHJvcGVydHksXHJcbiAgICAgICAgICAgICAgIG9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2aWV3UHJvcGVydGllcyBpbnN0YW5jZW9mIENvbGxpc2lvbkxhYlZpZXdQcm9wZXJ0aWVzLCBgaW52YWxpZCB2aWV3UHJvcGVydGllczogJHt2aWV3UHJvcGVydGllc31gICk7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UHJvcGVydHlPZiggY2VudGVyT2ZNYXNzVmlzaWJsZVByb3BlcnR5LCAnYm9vbGVhbicgKTtcclxuICAgIGFzc2VydCAmJiBBc3NlcnRVdGlscy5hc3NlcnRQcm9wZXJ0eU9mKCByZWZsZWN0aW5nQm9yZGVyUHJvcGVydHksICdib29sZWFuJyApO1xyXG4gICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydFByb3BlcnR5T2YoIGVsYXN0aWNpdHlQZXJjZW50UHJvcGVydHksICdudW1iZXInICk7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UHJvcGVydHlPZiggYmFsbHNDb25zdGFudFNpemVQcm9wZXJ0eSwgJ2Jvb2xlYW4nICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICBlbGFzdGljaXR5TnVtYmVyQ29udHJvbE9wdGlvbnM6IHtcclxuICAgICAgICB0cmFja0hlaWdodDogM1xyXG4gICAgICB9XHJcblxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmVsYXN0aWNpdHlOdW1iZXJDb250cm9sT3B0aW9ucy5lbmFibGVkUmFuZ2VQcm9wZXJ0eSwgJ0V4cGxvcmUyRENvbnRyb2xQYW5lbCBzZXRzIGVuYWJsZWRSYW5nZVByb3BlcnR5JyApO1xyXG4gICAgb3B0aW9ucy5lbGFzdGljaXR5TnVtYmVyQ29udHJvbE9wdGlvbnMuZW5hYmxlZFJhbmdlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGVuYWJsZWRFbGFzdGljaXR5UmFuZ2UgKTtcclxuXHJcbiAgICBzdXBlciggdmlld1Byb3BlcnRpZXMsXHJcbiAgICAgIGNlbnRlck9mTWFzc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgcGF0aHNWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHJlZmxlY3RpbmdCb3JkZXJQcm9wZXJ0eSxcclxuICAgICAgZWxhc3RpY2l0eVBlcmNlbnRQcm9wZXJ0eSxcclxuICAgICAgYmFsbHNDb25zdGFudFNpemVQcm9wZXJ0eSxcclxuICAgICAgb3B0aW9ucyApO1xyXG5cclxuICB9XHJcbn1cclxuXHJcbmNvbGxpc2lvbkxhYi5yZWdpc3RlciggJ0V4cGxvcmUyRENvbnRyb2xQYW5lbCcsIEV4cGxvcmUyRENvbnRyb2xQYW5lbCApO1xyXG5leHBvcnQgZGVmYXVsdCBFeHBsb3JlMkRDb250cm9sUGFuZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsV0FBVyxNQUFNLDBDQUEwQztBQUNsRSxPQUFPQyxZQUFZLE1BQU0sdUJBQXVCO0FBQ2hELE9BQU9DLHdCQUF3QixNQUFNLCtDQUErQztBQUNwRixPQUFPQywwQkFBMEIsTUFBTSxpREFBaUQ7QUFFeEYsTUFBTUMscUJBQXFCLFNBQVNGLHdCQUF3QixDQUFDO0VBRTNEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VHLFdBQVdBLENBQUVDLGNBQWMsRUFDZEMsMkJBQTJCLEVBQzNCQyxvQkFBb0IsRUFDcEJDLHdCQUF3QixFQUN4QkMseUJBQXlCLEVBQ3pCQyxzQkFBc0IsRUFDdEJDLHlCQUF5QixFQUN6QkMsT0FBTyxFQUFHO0lBQ3JCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRVIsY0FBYyxZQUFZSCwwQkFBMEIsRUFBRywyQkFBMEJHLGNBQWUsRUFBRSxDQUFDO0lBQ3JIUSxNQUFNLElBQUlkLFdBQVcsQ0FBQ2UsZ0JBQWdCLENBQUVSLDJCQUEyQixFQUFFLFNBQVUsQ0FBQztJQUNoRk8sTUFBTSxJQUFJZCxXQUFXLENBQUNlLGdCQUFnQixDQUFFTix3QkFBd0IsRUFBRSxTQUFVLENBQUM7SUFDN0VLLE1BQU0sSUFBSWQsV0FBVyxDQUFDZSxnQkFBZ0IsQ0FBRUwseUJBQXlCLEVBQUUsUUFBUyxDQUFDO0lBQzdFSSxNQUFNLElBQUlkLFdBQVcsQ0FBQ2UsZ0JBQWdCLENBQUVILHlCQUF5QixFQUFFLFNBQVUsQ0FBQztJQUU5RUMsT0FBTyxHQUFHZCxLQUFLLENBQUU7TUFFZmlCLDhCQUE4QixFQUFFO1FBQzlCQyxXQUFXLEVBQUU7TUFDZjtJQUVGLENBQUMsRUFBRUosT0FBUSxDQUFDO0lBRVpDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUNELE9BQU8sQ0FBQ0csOEJBQThCLENBQUNFLG9CQUFvQixFQUFFLGlEQUFrRCxDQUFDO0lBQ25JTCxPQUFPLENBQUNHLDhCQUE4QixDQUFDRSxvQkFBb0IsR0FBRyxJQUFJcEIsUUFBUSxDQUFFYSxzQkFBdUIsQ0FBQztJQUVwRyxLQUFLLENBQUVMLGNBQWMsRUFDbkJDLDJCQUEyQixFQUMzQkMsb0JBQW9CLEVBQ3BCQyx3QkFBd0IsRUFDeEJDLHlCQUF5QixFQUN6QkUseUJBQXlCLEVBQ3pCQyxPQUFRLENBQUM7RUFFYjtBQUNGO0FBRUFaLFlBQVksQ0FBQ2tCLFFBQVEsQ0FBRSx1QkFBdUIsRUFBRWYscUJBQXNCLENBQUM7QUFDdkUsZUFBZUEscUJBQXFCIn0=