// Copyright 2016-2021, University of Colorado Boulder

/**
 * base type for a Scenery Node that moves as the associated model element moves and and fades in and out as the opacity
 * Property changes
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import { Node } from '../../../../scenery/js/imports.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
class MoveFadeModelElementNode extends Node {
  /**
   * @param {PositionableFadableModelElement} modelElement
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Tandem} tandem
   */
  constructor(modelElement, modelViewTransform, tandem) {
    super({
      tandem: tandem,
      phetioInputEnabledPropertyInstrumented: true,
      inputEnabledPropertyOptions: {
        phetioFeatured: false // see exceptions in the overrides
      },

      visiblePropertyOptions: {
        phetioReadOnly: true
      }
    });

    // update our position as the model element moves
    modelElement.positionProperty.link(offset => {
      this.setTranslation(modelViewTransform.modelToViewPosition(offset));
    });

    // update our opacity as the model element fades in and out
    modelElement.opacityProperty.link(opacity => {
      this.opacity = opacity;
    });

    // update the visibility as the model element's visibility changes
    modelElement.visibleProperty.link(visible => {
      this.visible = visible;
    });
  }
}
energyFormsAndChanges.register('MoveFadeModelElementNode', MoveFadeModelElementNode);
export default MoveFadeModelElementNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb2RlIiwiZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIiwiTW92ZUZhZGVNb2RlbEVsZW1lbnROb2RlIiwiY29uc3RydWN0b3IiLCJtb2RlbEVsZW1lbnQiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJ0YW5kZW0iLCJwaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsImlucHV0RW5hYmxlZFByb3BlcnR5T3B0aW9ucyIsInBoZXRpb0ZlYXR1cmVkIiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb1JlYWRPbmx5IiwicG9zaXRpb25Qcm9wZXJ0eSIsImxpbmsiLCJvZmZzZXQiLCJzZXRUcmFuc2xhdGlvbiIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJvcGFjaXR5UHJvcGVydHkiLCJvcGFjaXR5IiwidmlzaWJsZVByb3BlcnR5IiwidmlzaWJsZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTW92ZUZhZGVNb2RlbEVsZW1lbnROb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIGJhc2UgdHlwZSBmb3IgYSBTY2VuZXJ5IE5vZGUgdGhhdCBtb3ZlcyBhcyB0aGUgYXNzb2NpYXRlZCBtb2RlbCBlbGVtZW50IG1vdmVzIGFuZCBhbmQgZmFkZXMgaW4gYW5kIG91dCBhcyB0aGUgb3BhY2l0eVxyXG4gKiBQcm9wZXJ0eSBjaGFuZ2VzXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBBbmRyZXcgQWRhcmVcclxuICovXHJcblxyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGVuZXJneUZvcm1zQW5kQ2hhbmdlcyBmcm9tICcuLi8uLi9lbmVyZ3lGb3Jtc0FuZENoYW5nZXMuanMnO1xyXG5cclxuY2xhc3MgTW92ZUZhZGVNb2RlbEVsZW1lbnROb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UG9zaXRpb25hYmxlRmFkYWJsZU1vZGVsRWxlbWVudH0gbW9kZWxFbGVtZW50XHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsRWxlbWVudCwgbW9kZWxWaWV3VHJhbnNmb3JtLCB0YW5kZW0gKSB7XHJcbiAgICBzdXBlcigge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbSxcclxuICAgICAgcGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQ6IHRydWUsXHJcbiAgICAgIGlucHV0RW5hYmxlZFByb3BlcnR5T3B0aW9uczoge1xyXG4gICAgICAgIHBoZXRpb0ZlYXR1cmVkOiBmYWxzZSAvLyBzZWUgZXhjZXB0aW9ucyBpbiB0aGUgb3ZlcnJpZGVzXHJcbiAgICAgIH0sXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHtcclxuICAgICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIG91ciBwb3NpdGlvbiBhcyB0aGUgbW9kZWwgZWxlbWVudCBtb3Zlc1xyXG4gICAgbW9kZWxFbGVtZW50LnBvc2l0aW9uUHJvcGVydHkubGluayggb2Zmc2V0ID0+IHtcclxuICAgICAgdGhpcy5zZXRUcmFuc2xhdGlvbiggbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIG9mZnNldCApICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIG91ciBvcGFjaXR5IGFzIHRoZSBtb2RlbCBlbGVtZW50IGZhZGVzIGluIGFuZCBvdXRcclxuICAgIG1vZGVsRWxlbWVudC5vcGFjaXR5UHJvcGVydHkubGluayggb3BhY2l0eSA9PiB7XHJcbiAgICAgIHRoaXMub3BhY2l0eSA9IG9wYWNpdHk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSB2aXNpYmlsaXR5IGFzIHRoZSBtb2RlbCBlbGVtZW50J3MgdmlzaWJpbGl0eSBjaGFuZ2VzXHJcbiAgICBtb2RlbEVsZW1lbnQudmlzaWJsZVByb3BlcnR5LmxpbmsoIHZpc2libGUgPT4ge1xyXG4gICAgICB0aGlzLnZpc2libGUgPSB2aXNpYmxlO1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzLnJlZ2lzdGVyKCAnTW92ZUZhZGVNb2RlbEVsZW1lbnROb2RlJywgTW92ZUZhZGVNb2RlbEVsZW1lbnROb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IE1vdmVGYWRlTW9kZWxFbGVtZW50Tm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLElBQUksUUFBUSxtQ0FBbUM7QUFDeEQsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDO0FBRWxFLE1BQU1DLHdCQUF3QixTQUFTRixJQUFJLENBQUM7RUFFMUM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyxZQUFZLEVBQUVDLGtCQUFrQixFQUFFQyxNQUFNLEVBQUc7SUFDdEQsS0FBSyxDQUFFO01BQ0xBLE1BQU0sRUFBRUEsTUFBTTtNQUNkQyxzQ0FBc0MsRUFBRSxJQUFJO01BQzVDQywyQkFBMkIsRUFBRTtRQUMzQkMsY0FBYyxFQUFFLEtBQUssQ0FBQztNQUN4QixDQUFDOztNQUNEQyxzQkFBc0IsRUFBRTtRQUN0QkMsY0FBYyxFQUFFO01BQ2xCO0lBQ0YsQ0FBRSxDQUFDOztJQUVIO0lBQ0FQLFlBQVksQ0FBQ1EsZ0JBQWdCLENBQUNDLElBQUksQ0FBRUMsTUFBTSxJQUFJO01BQzVDLElBQUksQ0FBQ0MsY0FBYyxDQUFFVixrQkFBa0IsQ0FBQ1csbUJBQW1CLENBQUVGLE1BQU8sQ0FBRSxDQUFDO0lBQ3pFLENBQUUsQ0FBQzs7SUFFSDtJQUNBVixZQUFZLENBQUNhLGVBQWUsQ0FBQ0osSUFBSSxDQUFFSyxPQUFPLElBQUk7TUFDNUMsSUFBSSxDQUFDQSxPQUFPLEdBQUdBLE9BQU87SUFDeEIsQ0FBRSxDQUFDOztJQUVIO0lBQ0FkLFlBQVksQ0FBQ2UsZUFBZSxDQUFDTixJQUFJLENBQUVPLE9BQU8sSUFBSTtNQUM1QyxJQUFJLENBQUNBLE9BQU8sR0FBR0EsT0FBTztJQUN4QixDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUFuQixxQkFBcUIsQ0FBQ29CLFFBQVEsQ0FBRSwwQkFBMEIsRUFBRW5CLHdCQUF5QixDQUFDO0FBQ3RGLGVBQWVBLHdCQUF3QiJ9