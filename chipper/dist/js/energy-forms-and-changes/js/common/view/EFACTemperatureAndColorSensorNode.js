// Copyright 2018-2023, University of Colorado Boulder

/**
 * A Scenery Node that portrays a thermometer and a triangular indicator of the precise position where the temperature
 * is being sensed. The triangular indicator can be filled with a color to make it more clear what exactly is being
 * measured.
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import TemperatureAndColorSensorNode from '../../../../scenery-phet/js/TemperatureAndColorSensorNode.js';
import { DragListener, Node } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EFACConstants from '../EFACConstants.js';
class EFACTemperatureAndColorSensorNode extends Node {
  /**
   * @param {TemperatureAndColorSensor} temperatureAndColorSensor - model element that measures temperature and color
   * at a position in model space
   * @param {Object} [options]
   */
  constructor(temperatureAndColorSensor, options) {
    options = merge({
      modelViewTransform: ModelViewTransform2.createIdentity(),
      draggable: false,
      dragBounds: Bounds2.EVERYTHING,
      cursor: 'pointer',
      phetioInputEnabledPropertyInstrumented: true,
      // phet-io
      tandem: Tandem.REQUIRED
    }, options);
    super(options);

    // @public (read-only) {TemperatureAndColorSensorNode} - public so getBounds functions can be called
    this.temperatureAndColorSensorNode = new TemperatureAndColorSensorNode(temperatureAndColorSensor.sensedTemperatureProperty, new Range(EFACConstants.WATER_FREEZING_POINT_TEMPERATURE, EFACConstants.OLIVE_OIL_BOILING_POINT_TEMPERATURE), temperatureAndColorSensor.sensedElementColorProperty);
    this.addChild(this.temperatureAndColorSensorNode);

    // move this node when the model element moves
    temperatureAndColorSensor.positionProperty.link(position => {
      this.translation = options.modelViewTransform.modelToViewPosition(position);
    });

    // add a drag handler if needed
    if (options.draggable) {
      this.addInputListener(new DragListener({
        positionProperty: temperatureAndColorSensor.positionProperty,
        transform: options.modelViewTransform,
        dragBoundsProperty: new Property(options.dragBounds.withMaxX(options.dragBounds.right - options.modelViewTransform.viewToModelDeltaX(this.width))),
        attach: true,
        start: () => {
          temperatureAndColorSensor.userControlledProperty.set(true);
        },
        end: () => {
          temperatureAndColorSensor.userControlledProperty.set(false);
        },
        tandem: options.tandem.createTandem('dragListener')
      }));
    }
  }
}
energyFormsAndChanges.register('EFACTemperatureAndColorSensorNode', EFACTemperatureAndColorSensorNode);
export default EFACTemperatureAndColorSensorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkJvdW5kczIiLCJSYW5nZSIsIm1lcmdlIiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIlRlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3JOb2RlIiwiRHJhZ0xpc3RlbmVyIiwiTm9kZSIsIlRhbmRlbSIsImVuZXJneUZvcm1zQW5kQ2hhbmdlcyIsIkVGQUNDb25zdGFudHMiLCJFRkFDVGVtcGVyYXR1cmVBbmRDb2xvclNlbnNvck5vZGUiLCJjb25zdHJ1Y3RvciIsInRlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3IiLCJvcHRpb25zIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiY3JlYXRlSWRlbnRpdHkiLCJkcmFnZ2FibGUiLCJkcmFnQm91bmRzIiwiRVZFUllUSElORyIsImN1cnNvciIsInBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ0ZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yTm9kZSIsInNlbnNlZFRlbXBlcmF0dXJlUHJvcGVydHkiLCJXQVRFUl9GUkVFWklOR19QT0lOVF9URU1QRVJBVFVSRSIsIk9MSVZFX09JTF9CT0lMSU5HX1BPSU5UX1RFTVBFUkFUVVJFIiwic2Vuc2VkRWxlbWVudENvbG9yUHJvcGVydHkiLCJhZGRDaGlsZCIsInBvc2l0aW9uUHJvcGVydHkiLCJsaW5rIiwicG9zaXRpb24iLCJ0cmFuc2xhdGlvbiIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJhZGRJbnB1dExpc3RlbmVyIiwidHJhbnNmb3JtIiwiZHJhZ0JvdW5kc1Byb3BlcnR5Iiwid2l0aE1heFgiLCJyaWdodCIsInZpZXdUb01vZGVsRGVsdGFYIiwid2lkdGgiLCJhdHRhY2giLCJzdGFydCIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJzZXQiLCJlbmQiLCJjcmVhdGVUYW5kZW0iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVGQUNUZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIFNjZW5lcnkgTm9kZSB0aGF0IHBvcnRyYXlzIGEgdGhlcm1vbWV0ZXIgYW5kIGEgdHJpYW5ndWxhciBpbmRpY2F0b3Igb2YgdGhlIHByZWNpc2UgcG9zaXRpb24gd2hlcmUgdGhlIHRlbXBlcmF0dXJlXHJcbiAqIGlzIGJlaW5nIHNlbnNlZC4gVGhlIHRyaWFuZ3VsYXIgaW5kaWNhdG9yIGNhbiBiZSBmaWxsZWQgd2l0aCBhIGNvbG9yIHRvIG1ha2UgaXQgbW9yZSBjbGVhciB3aGF0IGV4YWN0bHkgaXMgYmVpbmdcclxuICogbWVhc3VyZWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBUZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVGVtcGVyYXR1cmVBbmRDb2xvclNlbnNvck5vZGUuanMnO1xyXG5pbXBvcnQgeyBEcmFnTGlzdGVuZXIsIE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIGZyb20gJy4uLy4uL2VuZXJneUZvcm1zQW5kQ2hhbmdlcy5qcyc7XHJcbmltcG9ydCBFRkFDQ29uc3RhbnRzIGZyb20gJy4uL0VGQUNDb25zdGFudHMuanMnO1xyXG5cclxuY2xhc3MgRUZBQ1RlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3JOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VGVtcGVyYXR1cmVBbmRDb2xvclNlbnNvcn0gdGVtcGVyYXR1cmVBbmRDb2xvclNlbnNvciAtIG1vZGVsIGVsZW1lbnQgdGhhdCBtZWFzdXJlcyB0ZW1wZXJhdHVyZSBhbmQgY29sb3JcclxuICAgKiBhdCBhIHBvc2l0aW9uIGluIG1vZGVsIHNwYWNlXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB0ZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yLCBvcHRpb25zICkge1xyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybTogTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVJZGVudGl0eSgpLFxyXG4gICAgICBkcmFnZ2FibGU6IGZhbHNlLFxyXG4gICAgICBkcmFnQm91bmRzOiBCb3VuZHMyLkVWRVJZVEhJTkcsXHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICBwaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZDogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1RlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3JOb2RlfSAtIHB1YmxpYyBzbyBnZXRCb3VuZHMgZnVuY3Rpb25zIGNhbiBiZSBjYWxsZWRcclxuICAgIHRoaXMudGVtcGVyYXR1cmVBbmRDb2xvclNlbnNvck5vZGUgPSBuZXcgVGVtcGVyYXR1cmVBbmRDb2xvclNlbnNvck5vZGUoXHJcbiAgICAgIHRlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3Iuc2Vuc2VkVGVtcGVyYXR1cmVQcm9wZXJ0eSxcclxuICAgICAgbmV3IFJhbmdlKCBFRkFDQ29uc3RhbnRzLldBVEVSX0ZSRUVaSU5HX1BPSU5UX1RFTVBFUkFUVVJFLCBFRkFDQ29uc3RhbnRzLk9MSVZFX09JTF9CT0lMSU5HX1BPSU5UX1RFTVBFUkFUVVJFICksXHJcbiAgICAgIHRlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3Iuc2Vuc2VkRWxlbWVudENvbG9yUHJvcGVydHkgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMudGVtcGVyYXR1cmVBbmRDb2xvclNlbnNvck5vZGUgKTtcclxuXHJcbiAgICAvLyBtb3ZlIHRoaXMgbm9kZSB3aGVuIHRoZSBtb2RlbCBlbGVtZW50IG1vdmVzXHJcbiAgICB0ZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yLnBvc2l0aW9uUHJvcGVydHkubGluayggcG9zaXRpb24gPT4ge1xyXG4gICAgICB0aGlzLnRyYW5zbGF0aW9uID0gb3B0aW9ucy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggcG9zaXRpb24gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBhZGQgYSBkcmFnIGhhbmRsZXIgaWYgbmVlZGVkXHJcbiAgICBpZiAoIG9wdGlvbnMuZHJhZ2dhYmxlICkge1xyXG4gICAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIG5ldyBEcmFnTGlzdGVuZXIoIHtcclxuICAgICAgICBwb3NpdGlvblByb3BlcnR5OiB0ZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yLnBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgICAgdHJhbnNmb3JtOiBvcHRpb25zLm1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgICBkcmFnQm91bmRzUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggb3B0aW9ucy5kcmFnQm91bmRzLndpdGhNYXhYKFxyXG4gICAgICAgICAgb3B0aW9ucy5kcmFnQm91bmRzLnJpZ2h0IC0gb3B0aW9ucy5tb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxEZWx0YVgoIHRoaXMud2lkdGggKVxyXG4gICAgICAgICkgKSxcclxuICAgICAgICBhdHRhY2g6IHRydWUsXHJcbiAgICAgICAgc3RhcnQ6ICgpID0+IHtcclxuICAgICAgICAgIHRlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3IudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVuZDogKCkgPT4ge1xyXG4gICAgICAgICAgdGVtcGVyYXR1cmVBbmRDb2xvclNlbnNvci51c2VyQ29udHJvbGxlZFByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ0xpc3RlbmVyJyApXHJcbiAgICAgIH0gKSApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzLnJlZ2lzdGVyKCAnRUZBQ1RlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3JOb2RlJywgRUZBQ1RlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3JOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IEVGQUNUZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yTm9kZTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxLQUFLLE1B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