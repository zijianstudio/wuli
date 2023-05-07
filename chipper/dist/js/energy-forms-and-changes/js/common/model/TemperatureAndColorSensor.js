// Copyright 2014-2022, University of Colorado Boulder

/**
 * a model element that senses the temperature and color of the model at its current position, and can be moved around
 *
 * @author John Blanco
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EFACConstants from '../EFACConstants.js';
import UserMovableModelElement from './UserMovableModelElement.js';
class TemperatureAndColorSensor extends UserMovableModelElement {
  /**
   * @param {EFACIntroModel} model
   * @param {Vector2} initialPosition
   * @param {boolean} initiallyActive
   * @param {Object} [options]
   */
  constructor(model, initialPosition, initiallyActive, options) {
    options = merge({
      tandem: Tandem.REQUIRED,
      positionPropertyOptions: {
        phetioDocumentation: 'the position of the tip of the thermometer\'s color sensor'
      },
      phetioDocumentation: 'thermometer that can sense the temperature, color, and phet-io ID of an element'
    }, options);
    super(initialPosition, options);

    // @private
    this.model = model;

    // @public (read-only) {NumberProperty}
    this.sensedTemperatureProperty = new NumberProperty(EFACConstants.ROOM_TEMPERATURE, {
      range: new Range(EFACConstants.WATER_FREEZING_POINT_TEMPERATURE, 700),
      // in kelvin, empirically determined max
      units: 'K',
      tandem: options.tandem.createTandem('sensedTemperatureProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the temperature of the sensed element'
    });

    // @public (read-only) {Property.<Color>}
    this.sensedElementColorProperty = new Property(EFACConstants.TEMPERATURE_SENSOR_INACTIVE_COLOR, {
      phetioValueType: Color.ColorIO,
      tandem: options.tandem.createTandem('sensedElementColorProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'the color of the sensed element'
    });
    this.sensedElementNameProperty = new StringProperty('', {
      tandem: options.tandem.createTandem('sensedElementNameProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'the phet-io ID of the sensed element'
    });

    // @public (read-only) {BooleanProperty} - used to control visibility in the view
    this.activeProperty = new BooleanProperty(initiallyActive, {
      tandem: options.tandem.createTandem('activeProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'whether the thermometer is active. thermometers are active when not in the storage ' + 'area, regardless of whether the sim is paused'
    });
  }

  /**
   * @public
   */
  step() {
    if (this.activeProperty.value) {
      this.model.updateTemperatureAndColorAndNameAtPosition(this.positionProperty.value, this.sensedTemperatureProperty, this.sensedElementColorProperty, this.sensedElementNameProperty);
    } else {
      this.sensedTemperatureProperty.reset();
      this.sensedElementColorProperty.reset();
      this.sensedElementNameProperty.reset();
    }
  }

  /**
   * @public
   */
  reset() {
    this.sensedTemperatureProperty.reset();
    this.sensedElementColorProperty.reset();
    this.sensedElementNameProperty.reset();
    this.activeProperty.reset();
  }
}
energyFormsAndChanges.register('TemperatureAndColorSensor', TemperatureAndColorSensor);
export default TemperatureAndColorSensor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiU3RyaW5nUHJvcGVydHkiLCJSYW5nZSIsIm1lcmdlIiwiQ29sb3IiLCJUYW5kZW0iLCJlbmVyZ3lGb3Jtc0FuZENoYW5nZXMiLCJFRkFDQ29uc3RhbnRzIiwiVXNlck1vdmFibGVNb2RlbEVsZW1lbnQiLCJUZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsImluaXRpYWxQb3NpdGlvbiIsImluaXRpYWxseUFjdGl2ZSIsIm9wdGlvbnMiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInBvc2l0aW9uUHJvcGVydHlPcHRpb25zIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInNlbnNlZFRlbXBlcmF0dXJlUHJvcGVydHkiLCJST09NX1RFTVBFUkFUVVJFIiwicmFuZ2UiLCJXQVRFUl9GUkVFWklOR19QT0lOVF9URU1QRVJBVFVSRSIsInVuaXRzIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9IaWdoRnJlcXVlbmN5Iiwic2Vuc2VkRWxlbWVudENvbG9yUHJvcGVydHkiLCJURU1QRVJBVFVSRV9TRU5TT1JfSU5BQ1RJVkVfQ09MT1IiLCJwaGV0aW9WYWx1ZVR5cGUiLCJDb2xvcklPIiwic2Vuc2VkRWxlbWVudE5hbWVQcm9wZXJ0eSIsImFjdGl2ZVByb3BlcnR5Iiwic3RlcCIsInZhbHVlIiwidXBkYXRlVGVtcGVyYXR1cmVBbmRDb2xvckFuZE5hbWVBdFBvc2l0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIGEgbW9kZWwgZWxlbWVudCB0aGF0IHNlbnNlcyB0aGUgdGVtcGVyYXR1cmUgYW5kIGNvbG9yIG9mIHRoZSBtb2RlbCBhdCBpdHMgY3VycmVudCBwb3NpdGlvbiwgYW5kIGNhbiBiZSBtb3ZlZCBhcm91bmRcclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvU3RyaW5nUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IGVuZXJneUZvcm1zQW5kQ2hhbmdlcyBmcm9tICcuLi8uLi9lbmVyZ3lGb3Jtc0FuZENoYW5nZXMuanMnO1xyXG5pbXBvcnQgRUZBQ0NvbnN0YW50cyBmcm9tICcuLi9FRkFDQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFVzZXJNb3ZhYmxlTW9kZWxFbGVtZW50IGZyb20gJy4vVXNlck1vdmFibGVNb2RlbEVsZW1lbnQuanMnO1xyXG5cclxuY2xhc3MgVGVtcGVyYXR1cmVBbmRDb2xvclNlbnNvciBleHRlbmRzIFVzZXJNb3ZhYmxlTW9kZWxFbGVtZW50IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtFRkFDSW50cm9Nb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGluaXRpYWxQb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaW5pdGlhbGx5QWN0aXZlXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgaW5pdGlhbFBvc2l0aW9uLCBpbml0aWFsbHlBY3RpdmUsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxyXG4gICAgICBwb3NpdGlvblByb3BlcnR5T3B0aW9uczoge1xyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0aGUgcG9zaXRpb24gb2YgdGhlIHRpcCBvZiB0aGUgdGhlcm1vbWV0ZXJcXCdzIGNvbG9yIHNlbnNvcidcclxuICAgICAgfSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZXJtb21ldGVyIHRoYXQgY2FuIHNlbnNlIHRoZSB0ZW1wZXJhdHVyZSwgY29sb3IsIGFuZCBwaGV0LWlvIElEIG9mIGFuIGVsZW1lbnQnXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIGluaXRpYWxQb3NpdGlvbiwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7TnVtYmVyUHJvcGVydHl9XHJcbiAgICB0aGlzLnNlbnNlZFRlbXBlcmF0dXJlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIEVGQUNDb25zdGFudHMuUk9PTV9URU1QRVJBVFVSRSwge1xyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCBFRkFDQ29uc3RhbnRzLldBVEVSX0ZSRUVaSU5HX1BPSU5UX1RFTVBFUkFUVVJFLCA3MDAgKSwgLy8gaW4ga2VsdmluLCBlbXBpcmljYWxseSBkZXRlcm1pbmVkIG1heFxyXG4gICAgICB1bml0czogJ0snLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NlbnNlZFRlbXBlcmF0dXJlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndGhlIHRlbXBlcmF0dXJlIG9mIHRoZSBzZW5zZWQgZWxlbWVudCdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtQcm9wZXJ0eS48Q29sb3I+fVxyXG4gICAgdGhpcy5zZW5zZWRFbGVtZW50Q29sb3JQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggRUZBQ0NvbnN0YW50cy5URU1QRVJBVFVSRV9TRU5TT1JfSU5BQ1RJVkVfQ09MT1IsIHtcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBDb2xvci5Db2xvcklPLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NlbnNlZEVsZW1lbnRDb2xvclByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBjb2xvciBvZiB0aGUgc2Vuc2VkIGVsZW1lbnQnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zZW5zZWRFbGVtZW50TmFtZVByb3BlcnR5ID0gbmV3IFN0cmluZ1Byb3BlcnR5KCAnJywge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NlbnNlZEVsZW1lbnROYW1lUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndGhlIHBoZXQtaW8gSUQgb2YgdGhlIHNlbnNlZCBlbGVtZW50J1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge0Jvb2xlYW5Qcm9wZXJ0eX0gLSB1c2VkIHRvIGNvbnRyb2wgdmlzaWJpbGl0eSBpbiB0aGUgdmlld1xyXG4gICAgdGhpcy5hY3RpdmVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGluaXRpYWxseUFjdGl2ZSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FjdGl2ZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3doZXRoZXIgdGhlIHRoZXJtb21ldGVyIGlzIGFjdGl2ZS4gdGhlcm1vbWV0ZXJzIGFyZSBhY3RpdmUgd2hlbiBub3QgaW4gdGhlIHN0b3JhZ2UgJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICdhcmVhLCByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIHNpbSBpcyBwYXVzZWQnXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcCgpIHtcclxuICAgIGlmICggdGhpcy5hY3RpdmVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgdGhpcy5tb2RlbC51cGRhdGVUZW1wZXJhdHVyZUFuZENvbG9yQW5kTmFtZUF0UG9zaXRpb24oXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLFxyXG4gICAgICAgIHRoaXMuc2Vuc2VkVGVtcGVyYXR1cmVQcm9wZXJ0eSxcclxuICAgICAgICB0aGlzLnNlbnNlZEVsZW1lbnRDb2xvclByb3BlcnR5LFxyXG4gICAgICAgIHRoaXMuc2Vuc2VkRWxlbWVudE5hbWVQcm9wZXJ0eVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuc2Vuc2VkVGVtcGVyYXR1cmVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICB0aGlzLnNlbnNlZEVsZW1lbnRDb2xvclByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICAgIHRoaXMuc2Vuc2VkRWxlbWVudE5hbWVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5zZW5zZWRUZW1wZXJhdHVyZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNlbnNlZEVsZW1lbnRDb2xvclByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNlbnNlZEVsZW1lbnROYW1lUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuYWN0aXZlUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcbn1cclxuXHJcbmVuZXJneUZvcm1zQW5kQ2hhbmdlcy5yZWdpc3RlciggJ1RlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3InLCBUZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yICk7XHJcbmV4cG9ydCBkZWZhdWx0IFRlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3I7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxLQUFLLFFBQVEsbUNBQW1DO0FBQ3pELE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDO0FBQ2xFLE9BQU9DLGFBQWEsTUFBTSxxQkFBcUI7QUFDL0MsT0FBT0MsdUJBQXVCLE1BQU0sOEJBQThCO0FB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