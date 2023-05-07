// Copyright 2019-2022, University of Colorado Boulder

/**
 * TemperaturePointController is a Scenery node that looks like a thermometer with a little triangle that pinpoints the
 * position where the temperature and color are sensed, and it also controls points on a number line.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Saurabh Totey
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import LockToNumberLine from '../../../../number-line-common/js/common/model/LockToNumberLine.js';
import NumberLinePoint from '../../../../number-line-common/js/common/model/NumberLinePoint.js';
import PointController from '../../../../number-line-common/js/common/model/PointController.js';
import TemperatureToColorMapper from '../../../../number-line-common/js/explore/model/TemperatureToColorMapper.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color, PaintColorProperty } from '../../../../scenery/js/imports.js';
import numberLineIntegers from '../../numberLineIntegers.js';

// constants
const TEMPERATURE_RANGE_ON_MAP = new Range(-60, 50); // in Celsius, must match range used to make map images

// convenience functions
const celsiusToFahrenheitInteger = temperatureInCelsius => Utils.roundSymmetric(temperatureInCelsius * 9 / 5 + 32);

// color map for obtaining a color given a temperature value, must match algorithm used on maps
const CELSIUS_TEMPERATURE_TO_COLOR_MAPPER = new TemperatureToColorMapper(TEMPERATURE_RANGE_ON_MAP);
class TemperaturePointController extends PointController {
  /**
   * @param {TemperatureSceneModel} sceneModel
   * @param {string} labelText - the text with which this controller will be identified in the view
   * @param {Object} [options]
   * @public
   */
  constructor(sceneModel, labelText, options) {
    options = merge({
      noTemperatureColor: Color.white,
      defaultTemperature: 0,
      // in Celsius, used when no temperature is available from the model
      lockToNumberLine: LockToNumberLine.NEVER,
      bidirectionalAssociation: false
    }, options);
    super(options);

    // @private
    this.sceneModel = sceneModel;

    // @public (read-only) {string} - label for PointControllerNode and number line point
    this.label = labelText;

    // @public (read-only) - whether this point controller is over the map
    this.isOverMapProperty = new BooleanProperty(false);

    // @public (read-only) - timestamp in ms since epoch when this was most recently dropped on map, -1 when not on map
    this.droppedOnMapTimestamp = -1;

    // @public temperatures at the position of the point controller on the map
    this.celsiusTemperatureProperty = new NumberProperty(options.defaultTemperature);
    this.fahrenheitTemperatureProperty = new NumberProperty(celsiusToFahrenheitInteger(options.defaultTemperature));

    // @public - color represented by temperature on map
    this.colorProperty = new PaintColorProperty(options.noTemperatureColor);

    // Update temperature and other state information when moved or when month changes.
    Multilink.multilink([this.positionProperty, sceneModel.monthProperty], position => {
      const temperatureInCelsius = sceneModel.getTemperatureAtPosition(position);
      if (typeof temperatureInCelsius === 'number') {
        // A valid temperature value was returned, update the values presented to the user.
        this.celsiusTemperatureProperty.value = temperatureInCelsius;
        this.fahrenheitTemperatureProperty.value = celsiusToFahrenheitInteger(temperatureInCelsius);
        this.colorProperty.value = CELSIUS_TEMPERATURE_TO_COLOR_MAPPER.mapTemperatureToColor(this.celsiusTemperatureProperty.value);
        this.isOverMapProperty.value = true;
      } else {
        // The provided position isn't over the map, so no temperature value can be obtained.
        this.celsiusTemperatureProperty.value = this.celsiusTemperatureProperty.initialValue;
        this.fahrenheitTemperatureProperty.value = this.fahrenheitTemperatureProperty.initialValue;
        this.colorProperty.value = options.noTemperatureColor;
        this.isOverMapProperty.value = false;
      }
    });

    // Create/remove number line points based on whether we're over the map.
    this.isOverMapProperty.lazyLink(over => {
      if (over && this.isDraggingProperty.value) {
        // state checking
        assert && assert(!this.isControllingNumberLinePoint(), 'should not already have a point');

        // Create new points on each number line.
        this.celsiusNumberLinePoint = new NumberLinePoint(this.sceneModel.celsiusNumberLine, {
          valueProperty: this.celsiusTemperatureProperty,
          colorProperty: this.colorProperty,
          controller: this
        });
        this.fahrenheitNumberLinePoint = new NumberLinePoint(this.sceneModel.fahrenheitNumberLine, {
          valueProperty: this.fahrenheitTemperatureProperty,
          colorProperty: this.colorProperty,
          controller: this
        });
        this.sceneModel.celsiusNumberLine.addPoint(this.celsiusNumberLinePoint);
        this.sceneModel.fahrenheitNumberLine.addPoint(this.fahrenheitNumberLinePoint);
        this.associateWithNumberLinePoint(this.celsiusNumberLinePoint);
        this.associateWithNumberLinePoint(this.fahrenheitNumberLinePoint);
      } else if (!over && this.isControllingNumberLinePoint()) {
        // Remove our points from the number lines.
        this.removeClearAndDisposePoints();
        this.celsiusNumberLinePoint = null;
        this.fahrenheitNumberLinePoint = null;
      }
    });

    // Update the map drop timestamp when dropped.
    this.isDraggingProperty.lazyLink(isDragging => {
      if (isDragging) {
        // The timestamp is set to -1 when not dropped on the map.
        this.droppedOnMapTimestamp = -1;
      } else {
        if (this.isOverMapProperty.value) {
          // This point controller is being dropped on the map, update the timestamp.
          this.droppedOnMapTimestamp = Date.now();
        }
      }

      // Update the dragging state of the number line points if present.
      this.celsiusNumberLinePoint && (this.celsiusNumberLinePoint.isDraggingProperty.value = isDragging);
      this.fahrenheitNumberLinePoint && (this.fahrenheitNumberLinePoint.isDraggingProperty.value = isDragging);
    });
  }

  /**
   * @param {Vector2} proposedPosition
   * @override - necessary because PointController assumes that it is moving parallel to the number line
   *  which is not true for this class
   * @public
   */
  proposePosition(proposedPosition) {
    this.positionProperty.value = proposedPosition;
  }
}
numberLineIntegers.register('TemperaturePointController', TemperaturePointController);
export default TemperaturePointController;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiVXRpbHMiLCJMb2NrVG9OdW1iZXJMaW5lIiwiTnVtYmVyTGluZVBvaW50IiwiUG9pbnRDb250cm9sbGVyIiwiVGVtcGVyYXR1cmVUb0NvbG9yTWFwcGVyIiwibWVyZ2UiLCJDb2xvciIsIlBhaW50Q29sb3JQcm9wZXJ0eSIsIm51bWJlckxpbmVJbnRlZ2VycyIsIlRFTVBFUkFUVVJFX1JBTkdFX09OX01BUCIsImNlbHNpdXNUb0ZhaHJlbmhlaXRJbnRlZ2VyIiwidGVtcGVyYXR1cmVJbkNlbHNpdXMiLCJyb3VuZFN5bW1ldHJpYyIsIkNFTFNJVVNfVEVNUEVSQVRVUkVfVE9fQ09MT1JfTUFQUEVSIiwiVGVtcGVyYXR1cmVQb2ludENvbnRyb2xsZXIiLCJjb25zdHJ1Y3RvciIsInNjZW5lTW9kZWwiLCJsYWJlbFRleHQiLCJvcHRpb25zIiwibm9UZW1wZXJhdHVyZUNvbG9yIiwid2hpdGUiLCJkZWZhdWx0VGVtcGVyYXR1cmUiLCJsb2NrVG9OdW1iZXJMaW5lIiwiTkVWRVIiLCJiaWRpcmVjdGlvbmFsQXNzb2NpYXRpb24iLCJsYWJlbCIsImlzT3Zlck1hcFByb3BlcnR5IiwiZHJvcHBlZE9uTWFwVGltZXN0YW1wIiwiY2Vsc2l1c1RlbXBlcmF0dXJlUHJvcGVydHkiLCJmYWhyZW5oZWl0VGVtcGVyYXR1cmVQcm9wZXJ0eSIsImNvbG9yUHJvcGVydHkiLCJtdWx0aWxpbmsiLCJwb3NpdGlvblByb3BlcnR5IiwibW9udGhQcm9wZXJ0eSIsInBvc2l0aW9uIiwiZ2V0VGVtcGVyYXR1cmVBdFBvc2l0aW9uIiwidmFsdWUiLCJtYXBUZW1wZXJhdHVyZVRvQ29sb3IiLCJpbml0aWFsVmFsdWUiLCJsYXp5TGluayIsIm92ZXIiLCJpc0RyYWdnaW5nUHJvcGVydHkiLCJhc3NlcnQiLCJpc0NvbnRyb2xsaW5nTnVtYmVyTGluZVBvaW50IiwiY2Vsc2l1c051bWJlckxpbmVQb2ludCIsImNlbHNpdXNOdW1iZXJMaW5lIiwidmFsdWVQcm9wZXJ0eSIsImNvbnRyb2xsZXIiLCJmYWhyZW5oZWl0TnVtYmVyTGluZVBvaW50IiwiZmFocmVuaGVpdE51bWJlckxpbmUiLCJhZGRQb2ludCIsImFzc29jaWF0ZVdpdGhOdW1iZXJMaW5lUG9pbnQiLCJyZW1vdmVDbGVhckFuZERpc3Bvc2VQb2ludHMiLCJpc0RyYWdnaW5nIiwiRGF0ZSIsIm5vdyIsInByb3Bvc2VQb3NpdGlvbiIsInByb3Bvc2VkUG9zaXRpb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRlbXBlcmF0dXJlUG9pbnRDb250cm9sbGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRlbXBlcmF0dXJlUG9pbnRDb250cm9sbGVyIGlzIGEgU2NlbmVyeSBub2RlIHRoYXQgbG9va3MgbGlrZSBhIHRoZXJtb21ldGVyIHdpdGggYSBsaXR0bGUgdHJpYW5nbGUgdGhhdCBwaW5wb2ludHMgdGhlXHJcbiAqIHBvc2l0aW9uIHdoZXJlIHRoZSB0ZW1wZXJhdHVyZSBhbmQgY29sb3IgYXJlIHNlbnNlZCwgYW5kIGl0IGFsc28gY29udHJvbHMgcG9pbnRzIG9uIGEgbnVtYmVyIGxpbmUuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgU2F1cmFiaCBUb3RleVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBMb2NrVG9OdW1iZXJMaW5lIGZyb20gJy4uLy4uLy4uLy4uL251bWJlci1saW5lLWNvbW1vbi9qcy9jb21tb24vbW9kZWwvTG9ja1RvTnVtYmVyTGluZS5qcyc7XHJcbmltcG9ydCBOdW1iZXJMaW5lUG9pbnQgZnJvbSAnLi4vLi4vLi4vLi4vbnVtYmVyLWxpbmUtY29tbW9uL2pzL2NvbW1vbi9tb2RlbC9OdW1iZXJMaW5lUG9pbnQuanMnO1xyXG5pbXBvcnQgUG9pbnRDb250cm9sbGVyIGZyb20gJy4uLy4uLy4uLy4uL251bWJlci1saW5lLWNvbW1vbi9qcy9jb21tb24vbW9kZWwvUG9pbnRDb250cm9sbGVyLmpzJztcclxuaW1wb3J0IFRlbXBlcmF0dXJlVG9Db2xvck1hcHBlciBmcm9tICcuLi8uLi8uLi8uLi9udW1iZXItbGluZS1jb21tb24vanMvZXhwbG9yZS9tb2RlbC9UZW1wZXJhdHVyZVRvQ29sb3JNYXBwZXIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIFBhaW50Q29sb3JQcm9wZXJ0eSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBudW1iZXJMaW5lSW50ZWdlcnMgZnJvbSAnLi4vLi4vbnVtYmVyTGluZUludGVnZXJzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBURU1QRVJBVFVSRV9SQU5HRV9PTl9NQVAgPSBuZXcgUmFuZ2UoIC02MCwgNTAgKTsgLy8gaW4gQ2Vsc2l1cywgbXVzdCBtYXRjaCByYW5nZSB1c2VkIHRvIG1ha2UgbWFwIGltYWdlc1xyXG5cclxuLy8gY29udmVuaWVuY2UgZnVuY3Rpb25zXHJcbmNvbnN0IGNlbHNpdXNUb0ZhaHJlbmhlaXRJbnRlZ2VyID0gdGVtcGVyYXR1cmVJbkNlbHNpdXMgPT4gVXRpbHMucm91bmRTeW1tZXRyaWMoIHRlbXBlcmF0dXJlSW5DZWxzaXVzICogOSAvIDUgKyAzMiApO1xyXG5cclxuLy8gY29sb3IgbWFwIGZvciBvYnRhaW5pbmcgYSBjb2xvciBnaXZlbiBhIHRlbXBlcmF0dXJlIHZhbHVlLCBtdXN0IG1hdGNoIGFsZ29yaXRobSB1c2VkIG9uIG1hcHNcclxuY29uc3QgQ0VMU0lVU19URU1QRVJBVFVSRV9UT19DT0xPUl9NQVBQRVIgPSBuZXcgVGVtcGVyYXR1cmVUb0NvbG9yTWFwcGVyKCBURU1QRVJBVFVSRV9SQU5HRV9PTl9NQVAgKTtcclxuXHJcbmNsYXNzIFRlbXBlcmF0dXJlUG9pbnRDb250cm9sbGVyIGV4dGVuZHMgUG9pbnRDb250cm9sbGVyIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtUZW1wZXJhdHVyZVNjZW5lTW9kZWx9IHNjZW5lTW9kZWxcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gbGFiZWxUZXh0IC0gdGhlIHRleHQgd2l0aCB3aGljaCB0aGlzIGNvbnRyb2xsZXIgd2lsbCBiZSBpZGVudGlmaWVkIGluIHRoZSB2aWV3XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc2NlbmVNb2RlbCwgbGFiZWxUZXh0LCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBub1RlbXBlcmF0dXJlQ29sb3I6IENvbG9yLndoaXRlLFxyXG4gICAgICBkZWZhdWx0VGVtcGVyYXR1cmU6IDAsIC8vIGluIENlbHNpdXMsIHVzZWQgd2hlbiBubyB0ZW1wZXJhdHVyZSBpcyBhdmFpbGFibGUgZnJvbSB0aGUgbW9kZWxcclxuICAgICAgbG9ja1RvTnVtYmVyTGluZTogTG9ja1RvTnVtYmVyTGluZS5ORVZFUixcclxuICAgICAgYmlkaXJlY3Rpb25hbEFzc29jaWF0aW9uOiBmYWxzZVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuc2NlbmVNb2RlbCA9IHNjZW5lTW9kZWw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7c3RyaW5nfSAtIGxhYmVsIGZvciBQb2ludENvbnRyb2xsZXJOb2RlIGFuZCBudW1iZXIgbGluZSBwb2ludFxyXG4gICAgdGhpcy5sYWJlbCA9IGxhYmVsVGV4dDtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gd2hldGhlciB0aGlzIHBvaW50IGNvbnRyb2xsZXIgaXMgb3ZlciB0aGUgbWFwXHJcbiAgICB0aGlzLmlzT3Zlck1hcFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gdGltZXN0YW1wIGluIG1zIHNpbmNlIGVwb2NoIHdoZW4gdGhpcyB3YXMgbW9zdCByZWNlbnRseSBkcm9wcGVkIG9uIG1hcCwgLTEgd2hlbiBub3Qgb24gbWFwXHJcbiAgICB0aGlzLmRyb3BwZWRPbk1hcFRpbWVzdGFtcCA9IC0xO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgdGVtcGVyYXR1cmVzIGF0IHRoZSBwb3NpdGlvbiBvZiB0aGUgcG9pbnQgY29udHJvbGxlciBvbiB0aGUgbWFwXHJcbiAgICB0aGlzLmNlbHNpdXNUZW1wZXJhdHVyZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBvcHRpb25zLmRlZmF1bHRUZW1wZXJhdHVyZSApO1xyXG4gICAgdGhpcy5mYWhyZW5oZWl0VGVtcGVyYXR1cmVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggY2Vsc2l1c1RvRmFocmVuaGVpdEludGVnZXIoIG9wdGlvbnMuZGVmYXVsdFRlbXBlcmF0dXJlICkgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gY29sb3IgcmVwcmVzZW50ZWQgYnkgdGVtcGVyYXR1cmUgb24gbWFwXHJcbiAgICB0aGlzLmNvbG9yUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBvcHRpb25zLm5vVGVtcGVyYXR1cmVDb2xvciApO1xyXG5cclxuICAgIC8vIFVwZGF0ZSB0ZW1wZXJhdHVyZSBhbmQgb3RoZXIgc3RhdGUgaW5mb3JtYXRpb24gd2hlbiBtb3ZlZCBvciB3aGVuIG1vbnRoIGNoYW5nZXMuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICBbIHRoaXMucG9zaXRpb25Qcm9wZXJ0eSwgc2NlbmVNb2RlbC5tb250aFByb3BlcnR5IF0sXHJcbiAgICAgIHBvc2l0aW9uID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgdGVtcGVyYXR1cmVJbkNlbHNpdXMgPSBzY2VuZU1vZGVsLmdldFRlbXBlcmF0dXJlQXRQb3NpdGlvbiggcG9zaXRpb24gKTtcclxuXHJcbiAgICAgICAgaWYgKCB0eXBlb2YgdGVtcGVyYXR1cmVJbkNlbHNpdXMgPT09ICdudW1iZXInICkge1xyXG5cclxuICAgICAgICAgIC8vIEEgdmFsaWQgdGVtcGVyYXR1cmUgdmFsdWUgd2FzIHJldHVybmVkLCB1cGRhdGUgdGhlIHZhbHVlcyBwcmVzZW50ZWQgdG8gdGhlIHVzZXIuXHJcbiAgICAgICAgICB0aGlzLmNlbHNpdXNUZW1wZXJhdHVyZVByb3BlcnR5LnZhbHVlID0gdGVtcGVyYXR1cmVJbkNlbHNpdXM7XHJcbiAgICAgICAgICB0aGlzLmZhaHJlbmhlaXRUZW1wZXJhdHVyZVByb3BlcnR5LnZhbHVlID0gY2Vsc2l1c1RvRmFocmVuaGVpdEludGVnZXIoIHRlbXBlcmF0dXJlSW5DZWxzaXVzICk7XHJcbiAgICAgICAgICB0aGlzLmNvbG9yUHJvcGVydHkudmFsdWUgPSBDRUxTSVVTX1RFTVBFUkFUVVJFX1RPX0NPTE9SX01BUFBFUi5tYXBUZW1wZXJhdHVyZVRvQ29sb3IoXHJcbiAgICAgICAgICAgIHRoaXMuY2Vsc2l1c1RlbXBlcmF0dXJlUHJvcGVydHkudmFsdWVcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICB0aGlzLmlzT3Zlck1hcFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gVGhlIHByb3ZpZGVkIHBvc2l0aW9uIGlzbid0IG92ZXIgdGhlIG1hcCwgc28gbm8gdGVtcGVyYXR1cmUgdmFsdWUgY2FuIGJlIG9idGFpbmVkLlxyXG4gICAgICAgICAgdGhpcy5jZWxzaXVzVGVtcGVyYXR1cmVQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuY2Vsc2l1c1RlbXBlcmF0dXJlUHJvcGVydHkuaW5pdGlhbFZhbHVlO1xyXG4gICAgICAgICAgdGhpcy5mYWhyZW5oZWl0VGVtcGVyYXR1cmVQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuZmFocmVuaGVpdFRlbXBlcmF0dXJlUHJvcGVydHkuaW5pdGlhbFZhbHVlO1xyXG4gICAgICAgICAgdGhpcy5jb2xvclByb3BlcnR5LnZhbHVlID0gb3B0aW9ucy5ub1RlbXBlcmF0dXJlQ29sb3I7XHJcbiAgICAgICAgICB0aGlzLmlzT3Zlck1hcFByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIENyZWF0ZS9yZW1vdmUgbnVtYmVyIGxpbmUgcG9pbnRzIGJhc2VkIG9uIHdoZXRoZXIgd2UncmUgb3ZlciB0aGUgbWFwLlxyXG4gICAgdGhpcy5pc092ZXJNYXBQcm9wZXJ0eS5sYXp5TGluayggb3ZlciA9PiB7XHJcbiAgICAgIGlmICggb3ZlciAmJiB0aGlzLmlzRHJhZ2dpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuXHJcbiAgICAgICAgLy8gc3RhdGUgY2hlY2tpbmdcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pc0NvbnRyb2xsaW5nTnVtYmVyTGluZVBvaW50KCksICdzaG91bGQgbm90IGFscmVhZHkgaGF2ZSBhIHBvaW50JyApO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgbmV3IHBvaW50cyBvbiBlYWNoIG51bWJlciBsaW5lLlxyXG4gICAgICAgIHRoaXMuY2Vsc2l1c051bWJlckxpbmVQb2ludCA9IG5ldyBOdW1iZXJMaW5lUG9pbnQoIHRoaXMuc2NlbmVNb2RlbC5jZWxzaXVzTnVtYmVyTGluZSwge1xyXG4gICAgICAgICAgdmFsdWVQcm9wZXJ0eTogdGhpcy5jZWxzaXVzVGVtcGVyYXR1cmVQcm9wZXJ0eSxcclxuICAgICAgICAgIGNvbG9yUHJvcGVydHk6IHRoaXMuY29sb3JQcm9wZXJ0eSxcclxuICAgICAgICAgIGNvbnRyb2xsZXI6IHRoaXNcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgdGhpcy5mYWhyZW5oZWl0TnVtYmVyTGluZVBvaW50ID0gbmV3IE51bWJlckxpbmVQb2ludCggdGhpcy5zY2VuZU1vZGVsLmZhaHJlbmhlaXROdW1iZXJMaW5lLCB7XHJcbiAgICAgICAgICB2YWx1ZVByb3BlcnR5OiB0aGlzLmZhaHJlbmhlaXRUZW1wZXJhdHVyZVByb3BlcnR5LFxyXG4gICAgICAgICAgY29sb3JQcm9wZXJ0eTogdGhpcy5jb2xvclByb3BlcnR5LFxyXG4gICAgICAgICAgY29udHJvbGxlcjogdGhpc1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICB0aGlzLnNjZW5lTW9kZWwuY2Vsc2l1c051bWJlckxpbmUuYWRkUG9pbnQoIHRoaXMuY2Vsc2l1c051bWJlckxpbmVQb2ludCApO1xyXG4gICAgICAgIHRoaXMuc2NlbmVNb2RlbC5mYWhyZW5oZWl0TnVtYmVyTGluZS5hZGRQb2ludCggdGhpcy5mYWhyZW5oZWl0TnVtYmVyTGluZVBvaW50ICk7XHJcbiAgICAgICAgdGhpcy5hc3NvY2lhdGVXaXRoTnVtYmVyTGluZVBvaW50KCB0aGlzLmNlbHNpdXNOdW1iZXJMaW5lUG9pbnQgKTtcclxuICAgICAgICB0aGlzLmFzc29jaWF0ZVdpdGhOdW1iZXJMaW5lUG9pbnQoIHRoaXMuZmFocmVuaGVpdE51bWJlckxpbmVQb2ludCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCAhb3ZlciAmJiB0aGlzLmlzQ29udHJvbGxpbmdOdW1iZXJMaW5lUG9pbnQoKSApIHtcclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIG91ciBwb2ludHMgZnJvbSB0aGUgbnVtYmVyIGxpbmVzLlxyXG4gICAgICAgIHRoaXMucmVtb3ZlQ2xlYXJBbmREaXNwb3NlUG9pbnRzKCk7XHJcbiAgICAgICAgdGhpcy5jZWxzaXVzTnVtYmVyTGluZVBvaW50ID0gbnVsbDtcclxuICAgICAgICB0aGlzLmZhaHJlbmhlaXROdW1iZXJMaW5lUG9pbnQgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBtYXAgZHJvcCB0aW1lc3RhbXAgd2hlbiBkcm9wcGVkLlxyXG4gICAgdGhpcy5pc0RyYWdnaW5nUHJvcGVydHkubGF6eUxpbmsoIGlzRHJhZ2dpbmcgPT4ge1xyXG4gICAgICBpZiAoIGlzRHJhZ2dpbmcgKSB7XHJcblxyXG4gICAgICAgIC8vIFRoZSB0aW1lc3RhbXAgaXMgc2V0IHRvIC0xIHdoZW4gbm90IGRyb3BwZWQgb24gdGhlIG1hcC5cclxuICAgICAgICB0aGlzLmRyb3BwZWRPbk1hcFRpbWVzdGFtcCA9IC0xO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICggdGhpcy5pc092ZXJNYXBQcm9wZXJ0eS52YWx1ZSApIHtcclxuXHJcbiAgICAgICAgICAvLyBUaGlzIHBvaW50IGNvbnRyb2xsZXIgaXMgYmVpbmcgZHJvcHBlZCBvbiB0aGUgbWFwLCB1cGRhdGUgdGhlIHRpbWVzdGFtcC5cclxuICAgICAgICAgIHRoaXMuZHJvcHBlZE9uTWFwVGltZXN0YW1wID0gRGF0ZS5ub3coKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFVwZGF0ZSB0aGUgZHJhZ2dpbmcgc3RhdGUgb2YgdGhlIG51bWJlciBsaW5lIHBvaW50cyBpZiBwcmVzZW50LlxyXG4gICAgICB0aGlzLmNlbHNpdXNOdW1iZXJMaW5lUG9pbnQgJiYgKCB0aGlzLmNlbHNpdXNOdW1iZXJMaW5lUG9pbnQuaXNEcmFnZ2luZ1Byb3BlcnR5LnZhbHVlID0gaXNEcmFnZ2luZyApO1xyXG4gICAgICB0aGlzLmZhaHJlbmhlaXROdW1iZXJMaW5lUG9pbnQgJiYgKCB0aGlzLmZhaHJlbmhlaXROdW1iZXJMaW5lUG9pbnQuaXNEcmFnZ2luZ1Byb3BlcnR5LnZhbHVlID0gaXNEcmFnZ2luZyApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwcm9wb3NlZFBvc2l0aW9uXHJcbiAgICogQG92ZXJyaWRlIC0gbmVjZXNzYXJ5IGJlY2F1c2UgUG9pbnRDb250cm9sbGVyIGFzc3VtZXMgdGhhdCBpdCBpcyBtb3ZpbmcgcGFyYWxsZWwgdG8gdGhlIG51bWJlciBsaW5lXHJcbiAgICogIHdoaWNoIGlzIG5vdCB0cnVlIGZvciB0aGlzIGNsYXNzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHByb3Bvc2VQb3NpdGlvbiggcHJvcG9zZWRQb3NpdGlvbiApIHtcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IHByb3Bvc2VkUG9zaXRpb247XHJcbiAgfVxyXG59XHJcblxyXG5udW1iZXJMaW5lSW50ZWdlcnMucmVnaXN0ZXIoICdUZW1wZXJhdHVyZVBvaW50Q29udHJvbGxlcicsIFRlbXBlcmF0dXJlUG9pbnRDb250cm9sbGVyICk7XHJcbmV4cG9ydCBkZWZhdWx0IFRlbXBlcmF0dXJlUG9pbnRDb250cm9sbGVyO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxjQUFjLE1B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