// Copyright 2019-2022, University of Colorado Boulder

/**
 * CenterOfMassNode is an indicator at the bottom of the container that indicates where the centerX of mass is for
 * one particle species. The indicator is color-coded to the particle color.
 * Do not transform this Node! It's origin must be at the origin of the view coordinate frame.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import GasPropertiesColors from '../../common/GasPropertiesColors.js';
import gasProperties from '../../gasProperties.js';
export default class CenterOfMassNode extends Node {
  /**
   * @param centerOfMassProperty - centerX of mass, in pm
   * @param centerY - centerY of the indicator, in pm
   * @param modelViewTransform
   * @param fill
   * @param providedOptions
   */
  constructor(centerOfMassProperty, centerY, modelViewTransform, fill, providedOptions) {
    const options = optionize()({
      // empty because we're setting options.children below
    }, providedOptions);
    const rectangle = new Rectangle(0, 0, 5, 30, {
      fill: fill,
      stroke: GasPropertiesColors.centerOfMassStrokeProperty
    });
    options.children = [rectangle];
    super(options);
    centerOfMassProperty.link(centerX => {
      if (centerX === null) {
        rectangle.visible = false;
      } else {
        rectangle.visible = true;
        this.center = modelViewTransform.modelToViewXY(centerX, centerY);
      }
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
gasProperties.register('CenterOfMassNode', CenterOfMassNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiR2FzUHJvcGVydGllc0NvbG9ycyIsImdhc1Byb3BlcnRpZXMiLCJDZW50ZXJPZk1hc3NOb2RlIiwiY29uc3RydWN0b3IiLCJjZW50ZXJPZk1hc3NQcm9wZXJ0eSIsImNlbnRlclkiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJmaWxsIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInJlY3RhbmdsZSIsInN0cm9rZSIsImNlbnRlck9mTWFzc1N0cm9rZVByb3BlcnR5IiwiY2hpbGRyZW4iLCJsaW5rIiwiY2VudGVyWCIsInZpc2libGUiLCJjZW50ZXIiLCJtb2RlbFRvVmlld1hZIiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2VudGVyT2ZNYXNzTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDZW50ZXJPZk1hc3NOb2RlIGlzIGFuIGluZGljYXRvciBhdCB0aGUgYm90dG9tIG9mIHRoZSBjb250YWluZXIgdGhhdCBpbmRpY2F0ZXMgd2hlcmUgdGhlIGNlbnRlclggb2YgbWFzcyBpcyBmb3JcclxuICogb25lIHBhcnRpY2xlIHNwZWNpZXMuIFRoZSBpbmRpY2F0b3IgaXMgY29sb3ItY29kZWQgdG8gdGhlIHBhcnRpY2xlIGNvbG9yLlxyXG4gKiBEbyBub3QgdHJhbnNmb3JtIHRoaXMgTm9kZSEgSXQncyBvcmlnaW4gbXVzdCBiZSBhdCB0aGUgb3JpZ2luIG9mIHRoZSB2aWV3IGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBOb2RlT3B0aW9ucywgUmVjdGFuZ2xlLCBUQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgR2FzUHJvcGVydGllc0NvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vR2FzUHJvcGVydGllc0NvbG9ycy5qcyc7XHJcbmltcG9ydCBnYXNQcm9wZXJ0aWVzIGZyb20gJy4uLy4uL2dhc1Byb3BlcnRpZXMuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIENlbnRlck9mTWFzc05vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8Tm9kZU9wdGlvbnMsICd0YW5kZW0nIHwgJ3Zpc2libGVQcm9wZXJ0eSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2VudGVyT2ZNYXNzTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gY2VudGVyT2ZNYXNzUHJvcGVydHkgLSBjZW50ZXJYIG9mIG1hc3MsIGluIHBtXHJcbiAgICogQHBhcmFtIGNlbnRlclkgLSBjZW50ZXJZIG9mIHRoZSBpbmRpY2F0b3IsIGluIHBtXHJcbiAgICogQHBhcmFtIG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqIEBwYXJhbSBmaWxsXHJcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY2VudGVyT2ZNYXNzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlciB8IG51bGw+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgY2VudGVyWTogbnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgZmlsbDogVENvbG9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zOiBDZW50ZXJPZk1hc3NOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPENlbnRlck9mTWFzc05vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcclxuICAgICAgLy8gZW1wdHkgYmVjYXVzZSB3ZSdyZSBzZXR0aW5nIG9wdGlvbnMuY2hpbGRyZW4gYmVsb3dcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHJlY3RhbmdsZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDUsIDMwLCB7XHJcbiAgICAgIGZpbGw6IGZpbGwsXHJcbiAgICAgIHN0cm9rZTogR2FzUHJvcGVydGllc0NvbG9ycy5jZW50ZXJPZk1hc3NTdHJva2VQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIHJlY3RhbmdsZSBdO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgY2VudGVyT2ZNYXNzUHJvcGVydHkubGluayggY2VudGVyWCA9PiB7XHJcbiAgICAgIGlmICggY2VudGVyWCA9PT0gbnVsbCApIHtcclxuICAgICAgICByZWN0YW5nbGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJlY3RhbmdsZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmNlbnRlciA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1hZKCBjZW50ZXJYLCBjZW50ZXJZICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5nYXNQcm9wZXJ0aWVzLnJlZ2lzdGVyKCAnQ2VudGVyT2ZNYXNzTm9kZScsIENlbnRlck9mTWFzc05vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLFNBQVMsTUFBNEIsdUNBQXVDO0FBR25GLFNBQVNDLElBQUksRUFBZUMsU0FBUyxRQUFnQixtQ0FBbUM7QUFDeEYsT0FBT0MsbUJBQW1CLE1BQU0scUNBQXFDO0FBQ3JFLE9BQU9DLGFBQWEsTUFBTSx3QkFBd0I7QUFNbEQsZUFBZSxNQUFNQyxnQkFBZ0IsU0FBU0osSUFBSSxDQUFDO0VBRWpEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NLLFdBQVdBLENBQUVDLG9CQUFzRCxFQUN0REMsT0FBZSxFQUNmQyxrQkFBdUMsRUFDdkNDLElBQVksRUFDWkMsZUFBd0MsRUFBRztJQUU3RCxNQUFNQyxPQUFPLEdBQUdaLFNBQVMsQ0FBb0QsQ0FBQyxDQUFFO01BQzlFO0lBQUEsQ0FDRCxFQUFFVyxlQUFnQixDQUFDO0lBRXBCLE1BQU1FLFNBQVMsR0FBRyxJQUFJWCxTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFO01BQzVDUSxJQUFJLEVBQUVBLElBQUk7TUFDVkksTUFBTSxFQUFFWCxtQkFBbUIsQ0FBQ1k7SUFDOUIsQ0FBRSxDQUFDO0lBRUhILE9BQU8sQ0FBQ0ksUUFBUSxHQUFHLENBQUVILFNBQVMsQ0FBRTtJQUVoQyxLQUFLLENBQUVELE9BQVEsQ0FBQztJQUVoQkwsb0JBQW9CLENBQUNVLElBQUksQ0FBRUMsT0FBTyxJQUFJO01BQ3BDLElBQUtBLE9BQU8sS0FBSyxJQUFJLEVBQUc7UUFDdEJMLFNBQVMsQ0FBQ00sT0FBTyxHQUFHLEtBQUs7TUFDM0IsQ0FBQyxNQUNJO1FBQ0hOLFNBQVMsQ0FBQ00sT0FBTyxHQUFHLElBQUk7UUFDeEIsSUFBSSxDQUFDQyxNQUFNLEdBQUdYLGtCQUFrQixDQUFDWSxhQUFhLENBQUVILE9BQU8sRUFBRVYsT0FBUSxDQUFDO01BQ3BFO0lBQ0YsQ0FBRSxDQUFDO0VBQ0w7RUFFZ0JjLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBbEIsYUFBYSxDQUFDb0IsUUFBUSxDQUFFLGtCQUFrQixFQUFFbkIsZ0JBQWlCLENBQUMifQ==