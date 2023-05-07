// Copyright 2014-2022, University of Colorado Boulder

/**
 * Thermometer node, see https://github.com/phetsims/scenery-phet/issues/43
 *
 * @author Aaron Davis
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import LinearFunction from '../../dot/js/LinearFunction.js';
import Range from '../../dot/js/Range.js';
import Utils from '../../dot/js/Utils.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import { LinearGradient, Node, Path, Rectangle } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import NullableIO from '../../tandem/js/types/NullableIO.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import sceneryPhet from './sceneryPhet.js';
import ShadedSphereNode from './ShadedSphereNode.js';
const FLUID_OVERLAP = 1; // overlap of fluid in tube and bulb, to hide seam

// center of the bulb is at (0,0), let the client code move to the correct position
const BULB_CENTER_X = 0;
const BULB_CENTER_Y = 0;
export default class ThermometerNode extends Node {
  /**
   * @param temperatureProperty - null means there is no temperature to measure, treated as minTemperature
   * @param minTemperature
   * @param maxTemperature
   * @param [providedOptions?]
   */
  constructor(temperatureProperty, minTemperature, maxTemperature, providedOptions) {
    const options = optionize()({
      bulbDiameter: 50,
      tubeWidth: 30,
      tubeHeight: 100,
      lineWidth: 4,
      outlineStroke: 'black',
      tickSpacing: 15,
      tickSpacingTemperature: null,
      majorTickLength: 15,
      minorTickLength: 7.5,
      glassThickness: 4,
      zeroLevel: 'bulbCenter',
      backgroundFill: null,
      // all the default colors are shades of red
      fluidMainColor: '#850e0e',
      fluidHighlightColor: '#ff7575',
      fluidRightSideColor: '#c41515',
      tandem: Tandem.OPTIONAL
    }, providedOptions);
    super();
    const thermometerRange = new Range(minTemperature, maxTemperature);

    // Create a shaded sphere to act as the bulb fluid
    const bulbFluidDiameter = options.bulbDiameter - options.glassThickness - options.lineWidth / 2;
    const bulbFluidNode = new ShadedSphereNode(bulbFluidDiameter, {
      centerX: BULB_CENTER_X,
      centerY: BULB_CENTER_Y,
      mainColor: options.fluidMainColor,
      highlightColor: options.fluidHighlightColor,
      highlightXOffset: -0.2,
      highlightYOffset: 0.2,
      rotation: Math.PI / 2
    });

    // Angles for the outline of the bulb
    const bulbStartAngle = -Math.acos(options.tubeWidth / options.bulbDiameter);
    const bulbEndAngle = Math.PI - bulbStartAngle;

    // Create the outline for the thermometer, starting with the bulb
    const tubeTopRadius = options.tubeWidth / 2;
    const straightTubeHeight = options.tubeHeight - tubeTopRadius;
    const straightTubeTop = BULB_CENTER_Y - options.bulbDiameter / 2 - straightTubeHeight;
    const straightTubeLeft = BULB_CENTER_X - options.tubeWidth / 2;
    const outlineShape = new Shape().arc(BULB_CENTER_X, BULB_CENTER_Y, options.bulbDiameter / 2, bulbStartAngle, bulbEndAngle) // bulb at bottom
    .arc(BULB_CENTER_X, straightTubeTop, tubeTopRadius, Math.PI, 0) // rounded top of tube
    .close();
    const outlineNode = new Path(outlineShape, {
      stroke: options.outlineStroke,
      lineWidth: options.lineWidth
    });
    assert && assert(outlineNode.height === options.tubeHeight + options.bulbDiameter + options.lineWidth); // see scenery-phet#136

    const tubeFluidWidth = options.tubeWidth - options.glassThickness - options.lineWidth / 2;
    const tubeFluidRadius = tubeFluidWidth / 2;
    const clipBulbRadius = (options.bulbDiameter - options.glassThickness - options.lineWidth / 2) / 2;
    const clipStartAngle = -Math.acos(tubeFluidRadius / clipBulbRadius);
    const clipEndAngle = Math.PI - clipStartAngle;
    const tubeFluidBottom = bulbFluidDiameter / 2 * Math.sin(clipEndAngle);
    const tubeFluidLeft = -tubeFluidRadius;

    // Clip area for the fluid in the tube, round at the top
    const fluidClipArea = new Shape().moveTo(tubeFluidLeft, tubeFluidBottom + FLUID_OVERLAP).arc(BULB_CENTER_X, straightTubeTop, tubeFluidRadius, Math.PI, 0) // round top
    .lineTo(-tubeFluidLeft, tubeFluidBottom + FLUID_OVERLAP).close();

    // Clip the top of the bulb so it's flat where it connects to the tube
    const bulbFluidClipArea = Shape.rectangle(tubeFluidBottom, BULB_CENTER_Y - options.bulbDiameter / 2, options.bulbDiameter, options.bulbDiameter);
    bulbFluidNode.setClipArea(bulbFluidClipArea);

    // Gradient for fluid in tube
    const tubeFluidGradient = new LinearGradient(tubeFluidLeft, 0, tubeFluidLeft + tubeFluidWidth, 0).addColorStop(0, options.fluidMainColor).addColorStop(0.4, options.fluidHighlightColor).addColorStop(0.5, options.fluidHighlightColor).addColorStop(1, options.fluidMainColor);

    // Fluid in the tube (correct size set later)
    const tubeFluidNode = new Rectangle(0, 0, tubeFluidWidth, 0, {
      fill: tubeFluidGradient,
      clipArea: fluidClipArea
    });

    // override tick spacing options when using tickSpacingTemperature
    let offset = options.tickSpacing; // distance between position of minTemp and first tick
    let minorOffset = 0; // bool (as number) indicating where first minor tick is placed
    if (options.tickSpacingTemperature !== null) {
      const scaleTempY = (options.tubeHeight + options.lineWidth) / (maxTemperature - minTemperature);
      const offsetTemp = options.tickSpacingTemperature - minTemperature % options.tickSpacingTemperature;
      offset = offsetTemp * scaleTempY;
      minorOffset = (minTemperature + offsetTemp) % (options.tickSpacingTemperature * 2) % 2;
      options.tickSpacing = options.tickSpacingTemperature * scaleTempY;
    }

    // tick marks, from bottom up, alternating major and minor ticks
    for (let i = 0; i * options.tickSpacing + offset <= options.tubeHeight - tubeTopRadius / 3; i++) {
      outlineShape.moveTo(straightTubeLeft, tubeFluidBottom - i * options.tickSpacing - offset);
      outlineShape.horizontalLineTo(straightTubeLeft + (i % 2 === minorOffset ? options.minorTickLength : options.majorTickLength));
    }

    // Background inside the tube
    if (options.backgroundFill) {
      this.addChild(new Path(outlineShape, {
        fill: options.backgroundFill
      }));
    }

    // Add other nodes after optional background
    this.addChild(tubeFluidNode);
    this.addChild(bulbFluidNode);
    this.addChild(outlineNode);

    // Temperature determines the height of the fluid in the tube
    const maxFluidHeight = new Path(fluidClipArea).height;
    let minFluidHeight;
    if (options.zeroLevel === 'bulbCenter') {
      minFluidHeight = 0;
    } else if (options.zeroLevel === 'bulbTop') {
      minFluidHeight = -tubeFluidBottom;
    } else {
      throw new Error(`Invalid zeroLevel: ${options.zeroLevel}`);
    }
    this.temperatureLinearFunction = new LinearFunction(minTemperature, maxTemperature, minFluidHeight, maxFluidHeight + minFluidHeight);
    const temperaturePropertyObserver = temperature => {
      const fluidHeight = this.temperatureToYPos(temperature);
      tubeFluidNode.visible = fluidHeight > 0;
      tubeFluidNode.setRect(tubeFluidLeft, tubeFluidBottom - fluidHeight + minFluidHeight, tubeFluidWidth, fluidHeight + FLUID_OVERLAP);
    };
    temperatureProperty.link(temperaturePropertyObserver);
    const percentProperty = new DerivedProperty([temperatureProperty], temp => {
      return temp === null ? 0 : thermometerRange.getNormalizedValue(Utils.clamp(temp, thermometerRange.min, thermometerRange.max)) * 100;
    }, {
      tandem: options.tandem.createTandem('percentProperty'),
      phetioDocumentation: 'the percentage of the thermometer that is filled by the current temperature. If temperature is null, then percent will be 0',
      phetioValueType: NullableIO(NumberIO)
    });
    this.mutate(options);
    this.disposeThermometerNode = () => {
      if (temperatureProperty.hasListener(temperaturePropertyObserver)) {
        temperatureProperty.unlink(temperaturePropertyObserver);
      }
      percentProperty.dispose();
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('scenery-phet', 'ThermometerNode', this);
  }
  dispose() {
    this.disposeThermometerNode();
    super.dispose();
  }

  /**
   * Get y position at temperature to allow accurate tick placement
   * @param temperature - temperature at which to find y position, null is treated as the provided minTemperature
   */
  temperatureToYPos(temperature) {
    // treat null as zero - this is a "legacy requirement", needed by the States of Matter sims
    const compensatedTemperature = temperature === null ? 0 : temperature;
    return this.temperatureLinearFunction.evaluate(compensatedTemperature);
  }

  /**
   * Get temperature at y position to allow temperature thumb mapping
   * @param y - y position on thermometer node
   */
  yPosToTemperature(y) {
    return this.temperatureLinearFunction.inverse(y);
  }
}
sceneryPhet.register('ThermometerNode', ThermometerNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJMaW5lYXJGdW5jdGlvbiIsIlJhbmdlIiwiVXRpbHMiLCJTaGFwZSIsIkluc3RhbmNlUmVnaXN0cnkiLCJvcHRpb25pemUiLCJMaW5lYXJHcmFkaWVudCIsIk5vZGUiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiVGFuZGVtIiwiTnVsbGFibGVJTyIsIk51bWJlcklPIiwic2NlbmVyeVBoZXQiLCJTaGFkZWRTcGhlcmVOb2RlIiwiRkxVSURfT1ZFUkxBUCIsIkJVTEJfQ0VOVEVSX1giLCJCVUxCX0NFTlRFUl9ZIiwiVGhlcm1vbWV0ZXJOb2RlIiwiY29uc3RydWN0b3IiLCJ0ZW1wZXJhdHVyZVByb3BlcnR5IiwibWluVGVtcGVyYXR1cmUiLCJtYXhUZW1wZXJhdHVyZSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJidWxiRGlhbWV0ZXIiLCJ0dWJlV2lkdGgiLCJ0dWJlSGVpZ2h0IiwibGluZVdpZHRoIiwib3V0bGluZVN0cm9rZSIsInRpY2tTcGFjaW5nIiwidGlja1NwYWNpbmdUZW1wZXJhdHVyZSIsIm1ham9yVGlja0xlbmd0aCIsIm1pbm9yVGlja0xlbmd0aCIsImdsYXNzVGhpY2tuZXNzIiwiemVyb0xldmVsIiwiYmFja2dyb3VuZEZpbGwiLCJmbHVpZE1haW5Db2xvciIsImZsdWlkSGlnaGxpZ2h0Q29sb3IiLCJmbHVpZFJpZ2h0U2lkZUNvbG9yIiwidGFuZGVtIiwiT1BUSU9OQUwiLCJ0aGVybW9tZXRlclJhbmdlIiwiYnVsYkZsdWlkRGlhbWV0ZXIiLCJidWxiRmx1aWROb2RlIiwiY2VudGVyWCIsImNlbnRlclkiLCJtYWluQ29sb3IiLCJoaWdobGlnaHRDb2xvciIsImhpZ2hsaWdodFhPZmZzZXQiLCJoaWdobGlnaHRZT2Zmc2V0Iiwicm90YXRpb24iLCJNYXRoIiwiUEkiLCJidWxiU3RhcnRBbmdsZSIsImFjb3MiLCJidWxiRW5kQW5nbGUiLCJ0dWJlVG9wUmFkaXVzIiwic3RyYWlnaHRUdWJlSGVpZ2h0Iiwic3RyYWlnaHRUdWJlVG9wIiwic3RyYWlnaHRUdWJlTGVmdCIsIm91dGxpbmVTaGFwZSIsImFyYyIsImNsb3NlIiwib3V0bGluZU5vZGUiLCJzdHJva2UiLCJhc3NlcnQiLCJoZWlnaHQiLCJ0dWJlRmx1aWRXaWR0aCIsInR1YmVGbHVpZFJhZGl1cyIsImNsaXBCdWxiUmFkaXVzIiwiY2xpcFN0YXJ0QW5nbGUiLCJjbGlwRW5kQW5nbGUiLCJ0dWJlRmx1aWRCb3R0b20iLCJzaW4iLCJ0dWJlRmx1aWRMZWZ0IiwiZmx1aWRDbGlwQXJlYSIsIm1vdmVUbyIsImxpbmVUbyIsImJ1bGJGbHVpZENsaXBBcmVhIiwicmVjdGFuZ2xlIiwic2V0Q2xpcEFyZWEiLCJ0dWJlRmx1aWRHcmFkaWVudCIsImFkZENvbG9yU3RvcCIsInR1YmVGbHVpZE5vZGUiLCJmaWxsIiwiY2xpcEFyZWEiLCJvZmZzZXQiLCJtaW5vck9mZnNldCIsInNjYWxlVGVtcFkiLCJvZmZzZXRUZW1wIiwiaSIsImhvcml6b250YWxMaW5lVG8iLCJhZGRDaGlsZCIsIm1heEZsdWlkSGVpZ2h0IiwibWluRmx1aWRIZWlnaHQiLCJFcnJvciIsInRlbXBlcmF0dXJlTGluZWFyRnVuY3Rpb24iLCJ0ZW1wZXJhdHVyZVByb3BlcnR5T2JzZXJ2ZXIiLCJ0ZW1wZXJhdHVyZSIsImZsdWlkSGVpZ2h0IiwidGVtcGVyYXR1cmVUb1lQb3MiLCJ2aXNpYmxlIiwic2V0UmVjdCIsImxpbmsiLCJwZXJjZW50UHJvcGVydHkiLCJ0ZW1wIiwiZ2V0Tm9ybWFsaXplZFZhbHVlIiwiY2xhbXAiLCJtaW4iLCJtYXgiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwicGhldGlvVmFsdWVUeXBlIiwibXV0YXRlIiwiZGlzcG9zZVRoZXJtb21ldGVyTm9kZSIsImhhc0xpc3RlbmVyIiwidW5saW5rIiwiZGlzcG9zZSIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiYmluZGVyIiwicmVnaXN0ZXJEYXRhVVJMIiwiY29tcGVuc2F0ZWRUZW1wZXJhdHVyZSIsImV2YWx1YXRlIiwieVBvc1RvVGVtcGVyYXR1cmUiLCJ5IiwiaW52ZXJzZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVGhlcm1vbWV0ZXJOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZXJtb21ldGVyIG5vZGUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy80M1xyXG4gKlxyXG4gKiBAYXV0aG9yIEFhcm9uIERhdmlzXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IExpbmVhckZ1bmN0aW9uIGZyb20gJy4uLy4uL2RvdC9qcy9MaW5lYXJGdW5jdGlvbi5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHsgTGluZWFyR3JhZGllbnQsIE5vZGUsIE5vZGVPcHRpb25zLCBQYXRoLCBSZWN0YW5nbGUsIFRDb2xvciB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBOdWxsYWJsZUlPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdWxsYWJsZUlPLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcclxuaW1wb3J0IFNoYWRlZFNwaGVyZU5vZGUgZnJvbSAnLi9TaGFkZWRTcGhlcmVOb2RlLmpzJztcclxuXHJcbmNvbnN0IEZMVUlEX09WRVJMQVAgPSAxOyAvLyBvdmVybGFwIG9mIGZsdWlkIGluIHR1YmUgYW5kIGJ1bGIsIHRvIGhpZGUgc2VhbVxyXG5cclxuLy8gY2VudGVyIG9mIHRoZSBidWxiIGlzIGF0ICgwLDApLCBsZXQgdGhlIGNsaWVudCBjb2RlIG1vdmUgdG8gdGhlIGNvcnJlY3QgcG9zaXRpb25cclxuY29uc3QgQlVMQl9DRU5URVJfWCA9IDA7XHJcbmNvbnN0IEJVTEJfQ0VOVEVSX1kgPSAwO1xyXG5cclxudHlwZSBaZXJvTGV2ZWwgPSAnYnVsYkNlbnRlcicgfCAnYnVsYlRvcCc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGJ1bGJEaWFtZXRlcj86IG51bWJlcjtcclxuICB0dWJlV2lkdGg/OiBudW1iZXI7XHJcbiAgdHViZUhlaWdodD86IG51bWJlcjtcclxuICBsaW5lV2lkdGg/OiBudW1iZXI7XHJcbiAgb3V0bGluZVN0cm9rZT86IFRDb2xvcjtcclxuICB0aWNrU3BhY2luZz86IG51bWJlcjtcclxuXHJcbiAgLy8gb3ZlcnJpZGVzIHRpY2tTcGFjaW5nIHRvIHNwYWNlIHRpY2tzIGJ5IHVuaXRzIG9mIHRlbXBlcmF0dXJlXHJcbiAgdGlja1NwYWNpbmdUZW1wZXJhdHVyZT86IG51bWJlciB8IG51bGw7XHJcbiAgbWFqb3JUaWNrTGVuZ3RoPzogbnVtYmVyO1xyXG4gIG1pbm9yVGlja0xlbmd0aD86IG51bWJlcjtcclxuXHJcbiAgLy8gc3BhY2UgYmV0d2VlbiB0aGUgdGhlcm1vbWV0ZXIgb3V0bGluZSBhbmQgdGhlIGZsdWlkIGluc2lkZSBpdFxyXG4gIGdsYXNzVGhpY2tuZXNzPzogbnVtYmVyO1xyXG5cclxuICAvLyBkZWZpbmVzIHdoZXJlIGxldmVsIGlzIGF0IHRlbXBlcmF0dXJlIHplcm8gLSAnYnVsYkNlbnRlcicgb3IgJ2J1bGJUb3AnXHJcbiAgemVyb0xldmVsPzogWmVyb0xldmVsO1xyXG5cclxuICAvLyBsZWF2ZSBhcyBudWxsIHRvIGhhdmUgYSB0cmFuc3BhcmVudCBiYWNrZ3JvdW5kLiBJZiBhIGNvbG9yIGlzIGdpdmVuLCB0aGVuIGFuIGV4dHJhIFJlY3RhbmdsZSBpcyBjcmVhdGVkIGZvciB0aGUgYmFja2dyb3VuZFxyXG4gIGJhY2tncm91bmRGaWxsPzogVENvbG9yO1xyXG5cclxuICAvLyB0aGUgbWFpbiBjb2xvciBvZiB0aGUgYnVsYiBmbHVpZCwgYW5kIHRoZSBsZWZ0IHNpZGUgb2YgdGhlIHR1YmUgZ3JhZGllbnRcclxuICBmbHVpZE1haW5Db2xvcj86IFRDb2xvcjtcclxuXHJcbiAgLy8gdGhlIGhpZ2hsaWdodCBjb2xvciBvZiB0aGUgYnVsYiBmbHVpZCBhbmQgdGhlIG1pZGRsZSBvZiB0aGUgdHViZSBncmFkaWVudFxyXG4gIGZsdWlkSGlnaGxpZ2h0Q29sb3I/OiBUQ29sb3I7XHJcblxyXG4gIC8vIHRoZSByaWdodCBzaWRlIG9mIHRoZSB0dWJlIGdyYWRpZW50LCBub3QgdXNlZCBjdXJyZW50bHlcclxuICBmbHVpZFJpZ2h0U2lkZUNvbG9yPzogVENvbG9yO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgVGhlcm1vbWV0ZXJOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZU9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaGVybW9tZXRlck5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICBwcml2YXRlIHJlYWRvbmx5IHRlbXBlcmF0dXJlTGluZWFyRnVuY3Rpb246IExpbmVhckZ1bmN0aW9uO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVRoZXJtb21ldGVyTm9kZTogKCkgPT4gdm9pZDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHRlbXBlcmF0dXJlUHJvcGVydHkgLSBudWxsIG1lYW5zIHRoZXJlIGlzIG5vIHRlbXBlcmF0dXJlIHRvIG1lYXN1cmUsIHRyZWF0ZWQgYXMgbWluVGVtcGVyYXR1cmVcclxuICAgKiBAcGFyYW0gbWluVGVtcGVyYXR1cmVcclxuICAgKiBAcGFyYW0gbWF4VGVtcGVyYXR1cmVcclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9ucz9dXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0ZW1wZXJhdHVyZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXIgfCBudWxsPiwgbWluVGVtcGVyYXR1cmU6IG51bWJlciwgbWF4VGVtcGVyYXR1cmU6IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IFRoZXJtb21ldGVyTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxUaGVybW9tZXRlck5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcclxuICAgICAgYnVsYkRpYW1ldGVyOiA1MCxcclxuICAgICAgdHViZVdpZHRoOiAzMCxcclxuICAgICAgdHViZUhlaWdodDogMTAwLFxyXG4gICAgICBsaW5lV2lkdGg6IDQsXHJcbiAgICAgIG91dGxpbmVTdHJva2U6ICdibGFjaycsXHJcbiAgICAgIHRpY2tTcGFjaW5nOiAxNSxcclxuICAgICAgdGlja1NwYWNpbmdUZW1wZXJhdHVyZTogbnVsbCxcclxuICAgICAgbWFqb3JUaWNrTGVuZ3RoOiAxNSxcclxuICAgICAgbWlub3JUaWNrTGVuZ3RoOiA3LjUsXHJcbiAgICAgIGdsYXNzVGhpY2tuZXNzOiA0LFxyXG4gICAgICB6ZXJvTGV2ZWw6ICdidWxiQ2VudGVyJyxcclxuICAgICAgYmFja2dyb3VuZEZpbGw6IG51bGwsXHJcblxyXG4gICAgICAvLyBhbGwgdGhlIGRlZmF1bHQgY29sb3JzIGFyZSBzaGFkZXMgb2YgcmVkXHJcbiAgICAgIGZsdWlkTWFpbkNvbG9yOiAnIzg1MGUwZScsXHJcbiAgICAgIGZsdWlkSGlnaGxpZ2h0Q29sb3I6ICcjZmY3NTc1JyxcclxuICAgICAgZmx1aWRSaWdodFNpZGVDb2xvcjogJyNjNDE1MTUnLFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRJT05BTFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICBjb25zdCB0aGVybW9tZXRlclJhbmdlID0gbmV3IFJhbmdlKCBtaW5UZW1wZXJhdHVyZSwgbWF4VGVtcGVyYXR1cmUgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBzaGFkZWQgc3BoZXJlIHRvIGFjdCBhcyB0aGUgYnVsYiBmbHVpZFxyXG4gICAgY29uc3QgYnVsYkZsdWlkRGlhbWV0ZXIgPSBvcHRpb25zLmJ1bGJEaWFtZXRlciAtIG9wdGlvbnMuZ2xhc3NUaGlja25lc3MgLSBvcHRpb25zLmxpbmVXaWR0aCAvIDI7XHJcbiAgICBjb25zdCBidWxiRmx1aWROb2RlID0gbmV3IFNoYWRlZFNwaGVyZU5vZGUoIGJ1bGJGbHVpZERpYW1ldGVyLCB7XHJcbiAgICAgIGNlbnRlclg6IEJVTEJfQ0VOVEVSX1gsXHJcbiAgICAgIGNlbnRlclk6IEJVTEJfQ0VOVEVSX1ksXHJcbiAgICAgIG1haW5Db2xvcjogb3B0aW9ucy5mbHVpZE1haW5Db2xvcixcclxuICAgICAgaGlnaGxpZ2h0Q29sb3I6IG9wdGlvbnMuZmx1aWRIaWdobGlnaHRDb2xvcixcclxuICAgICAgaGlnaGxpZ2h0WE9mZnNldDogLTAuMixcclxuICAgICAgaGlnaGxpZ2h0WU9mZnNldDogMC4yLFxyXG4gICAgICByb3RhdGlvbjogTWF0aC5QSSAvIDJcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBbmdsZXMgZm9yIHRoZSBvdXRsaW5lIG9mIHRoZSBidWxiXHJcbiAgICBjb25zdCBidWxiU3RhcnRBbmdsZSA9IC1NYXRoLmFjb3MoIG9wdGlvbnMudHViZVdpZHRoIC8gb3B0aW9ucy5idWxiRGlhbWV0ZXIgKTtcclxuICAgIGNvbnN0IGJ1bGJFbmRBbmdsZSA9IE1hdGguUEkgLSBidWxiU3RhcnRBbmdsZTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIG91dGxpbmUgZm9yIHRoZSB0aGVybW9tZXRlciwgc3RhcnRpbmcgd2l0aCB0aGUgYnVsYlxyXG4gICAgY29uc3QgdHViZVRvcFJhZGl1cyA9IG9wdGlvbnMudHViZVdpZHRoIC8gMjtcclxuICAgIGNvbnN0IHN0cmFpZ2h0VHViZUhlaWdodCA9IG9wdGlvbnMudHViZUhlaWdodCAtIHR1YmVUb3BSYWRpdXM7XHJcbiAgICBjb25zdCBzdHJhaWdodFR1YmVUb3AgPSBCVUxCX0NFTlRFUl9ZIC0gKCBvcHRpb25zLmJ1bGJEaWFtZXRlciAvIDIgKSAtIHN0cmFpZ2h0VHViZUhlaWdodDtcclxuICAgIGNvbnN0IHN0cmFpZ2h0VHViZUxlZnQgPSBCVUxCX0NFTlRFUl9YIC0gKCBvcHRpb25zLnR1YmVXaWR0aCAvIDIgKTtcclxuXHJcbiAgICBjb25zdCBvdXRsaW5lU2hhcGUgPSBuZXcgU2hhcGUoKVxyXG4gICAgICAuYXJjKCBCVUxCX0NFTlRFUl9YLCBCVUxCX0NFTlRFUl9ZLCBvcHRpb25zLmJ1bGJEaWFtZXRlciAvIDIsIGJ1bGJTdGFydEFuZ2xlLCBidWxiRW5kQW5nbGUgKSAvLyBidWxiIGF0IGJvdHRvbVxyXG4gICAgICAuYXJjKCBCVUxCX0NFTlRFUl9YLCBzdHJhaWdodFR1YmVUb3AsIHR1YmVUb3BSYWRpdXMsIE1hdGguUEksIDAgKSAvLyByb3VuZGVkIHRvcCBvZiB0dWJlXHJcbiAgICAgIC5jbG9zZSgpO1xyXG5cclxuICAgIGNvbnN0IG91dGxpbmVOb2RlID0gbmV3IFBhdGgoIG91dGxpbmVTaGFwZSwge1xyXG4gICAgICBzdHJva2U6IG9wdGlvbnMub3V0bGluZVN0cm9rZSxcclxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmxpbmVXaWR0aFxyXG4gICAgfSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3V0bGluZU5vZGUuaGVpZ2h0ID09PSBvcHRpb25zLnR1YmVIZWlnaHQgKyBvcHRpb25zLmJ1bGJEaWFtZXRlciArIG9wdGlvbnMubGluZVdpZHRoICk7IC8vIHNlZSBzY2VuZXJ5LXBoZXQjMTM2XHJcblxyXG4gICAgY29uc3QgdHViZUZsdWlkV2lkdGggPSBvcHRpb25zLnR1YmVXaWR0aCAtIG9wdGlvbnMuZ2xhc3NUaGlja25lc3MgLSBvcHRpb25zLmxpbmVXaWR0aCAvIDI7XHJcbiAgICBjb25zdCB0dWJlRmx1aWRSYWRpdXMgPSB0dWJlRmx1aWRXaWR0aCAvIDI7XHJcbiAgICBjb25zdCBjbGlwQnVsYlJhZGl1cyA9ICggb3B0aW9ucy5idWxiRGlhbWV0ZXIgLSBvcHRpb25zLmdsYXNzVGhpY2tuZXNzIC0gb3B0aW9ucy5saW5lV2lkdGggLyAyICkgLyAyO1xyXG4gICAgY29uc3QgY2xpcFN0YXJ0QW5nbGUgPSAtTWF0aC5hY29zKCB0dWJlRmx1aWRSYWRpdXMgLyBjbGlwQnVsYlJhZGl1cyApO1xyXG4gICAgY29uc3QgY2xpcEVuZEFuZ2xlID0gTWF0aC5QSSAtIGNsaXBTdGFydEFuZ2xlO1xyXG4gICAgY29uc3QgdHViZUZsdWlkQm90dG9tID0gKCBidWxiRmx1aWREaWFtZXRlciAvIDIgKSAqIE1hdGguc2luKCBjbGlwRW5kQW5nbGUgKTtcclxuICAgIGNvbnN0IHR1YmVGbHVpZExlZnQgPSAtdHViZUZsdWlkUmFkaXVzO1xyXG5cclxuICAgIC8vIENsaXAgYXJlYSBmb3IgdGhlIGZsdWlkIGluIHRoZSB0dWJlLCByb3VuZCBhdCB0aGUgdG9wXHJcbiAgICBjb25zdCBmbHVpZENsaXBBcmVhID0gbmV3IFNoYXBlKClcclxuICAgICAgLm1vdmVUbyggdHViZUZsdWlkTGVmdCwgdHViZUZsdWlkQm90dG9tICsgRkxVSURfT1ZFUkxBUCApXHJcbiAgICAgIC5hcmMoIEJVTEJfQ0VOVEVSX1gsIHN0cmFpZ2h0VHViZVRvcCwgdHViZUZsdWlkUmFkaXVzLCBNYXRoLlBJLCAwICkgLy8gcm91bmQgdG9wXHJcbiAgICAgIC5saW5lVG8oIC10dWJlRmx1aWRMZWZ0LCB0dWJlRmx1aWRCb3R0b20gKyBGTFVJRF9PVkVSTEFQIClcclxuICAgICAgLmNsb3NlKCk7XHJcblxyXG4gICAgLy8gQ2xpcCB0aGUgdG9wIG9mIHRoZSBidWxiIHNvIGl0J3MgZmxhdCB3aGVyZSBpdCBjb25uZWN0cyB0byB0aGUgdHViZVxyXG4gICAgY29uc3QgYnVsYkZsdWlkQ2xpcEFyZWEgPSBTaGFwZS5yZWN0YW5nbGUoXHJcbiAgICAgIHR1YmVGbHVpZEJvdHRvbSxcclxuICAgICAgQlVMQl9DRU5URVJfWSAtIG9wdGlvbnMuYnVsYkRpYW1ldGVyIC8gMixcclxuICAgICAgb3B0aW9ucy5idWxiRGlhbWV0ZXIsXHJcbiAgICAgIG9wdGlvbnMuYnVsYkRpYW1ldGVyXHJcbiAgICApO1xyXG4gICAgYnVsYkZsdWlkTm9kZS5zZXRDbGlwQXJlYSggYnVsYkZsdWlkQ2xpcEFyZWEgKTtcclxuXHJcbiAgICAvLyBHcmFkaWVudCBmb3IgZmx1aWQgaW4gdHViZVxyXG4gICAgY29uc3QgdHViZUZsdWlkR3JhZGllbnQgPSBuZXcgTGluZWFyR3JhZGllbnQoIHR1YmVGbHVpZExlZnQsIDAsIHR1YmVGbHVpZExlZnQgKyB0dWJlRmx1aWRXaWR0aCwgMCApXHJcbiAgICAgIC5hZGRDb2xvclN0b3AoIDAsIG9wdGlvbnMuZmx1aWRNYWluQ29sb3IgKVxyXG4gICAgICAuYWRkQ29sb3JTdG9wKCAwLjQsIG9wdGlvbnMuZmx1aWRIaWdobGlnaHRDb2xvciApXHJcbiAgICAgIC5hZGRDb2xvclN0b3AoIDAuNSwgb3B0aW9ucy5mbHVpZEhpZ2hsaWdodENvbG9yIClcclxuICAgICAgLmFkZENvbG9yU3RvcCggMSwgb3B0aW9ucy5mbHVpZE1haW5Db2xvciApO1xyXG5cclxuICAgIC8vIEZsdWlkIGluIHRoZSB0dWJlIChjb3JyZWN0IHNpemUgc2V0IGxhdGVyKVxyXG4gICAgY29uc3QgdHViZUZsdWlkTm9kZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIHR1YmVGbHVpZFdpZHRoLCAwLCB7XHJcbiAgICAgIGZpbGw6IHR1YmVGbHVpZEdyYWRpZW50LFxyXG4gICAgICBjbGlwQXJlYTogZmx1aWRDbGlwQXJlYVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIG92ZXJyaWRlIHRpY2sgc3BhY2luZyBvcHRpb25zIHdoZW4gdXNpbmcgdGlja1NwYWNpbmdUZW1wZXJhdHVyZVxyXG4gICAgbGV0IG9mZnNldCA9IG9wdGlvbnMudGlja1NwYWNpbmc7IC8vIGRpc3RhbmNlIGJldHdlZW4gcG9zaXRpb24gb2YgbWluVGVtcCBhbmQgZmlyc3QgdGlja1xyXG4gICAgbGV0IG1pbm9yT2Zmc2V0ID0gMDsgLy8gYm9vbCAoYXMgbnVtYmVyKSBpbmRpY2F0aW5nIHdoZXJlIGZpcnN0IG1pbm9yIHRpY2sgaXMgcGxhY2VkXHJcbiAgICBpZiAoIG9wdGlvbnMudGlja1NwYWNpbmdUZW1wZXJhdHVyZSAhPT0gbnVsbCApIHtcclxuICAgICAgY29uc3Qgc2NhbGVUZW1wWSA9ICggb3B0aW9ucy50dWJlSGVpZ2h0ICsgb3B0aW9ucy5saW5lV2lkdGggKSAvICggbWF4VGVtcGVyYXR1cmUgLSBtaW5UZW1wZXJhdHVyZSApO1xyXG4gICAgICBjb25zdCBvZmZzZXRUZW1wID0gb3B0aW9ucy50aWNrU3BhY2luZ1RlbXBlcmF0dXJlIC0gKCBtaW5UZW1wZXJhdHVyZSAlIG9wdGlvbnMudGlja1NwYWNpbmdUZW1wZXJhdHVyZSApO1xyXG4gICAgICBvZmZzZXQgPSBvZmZzZXRUZW1wICogc2NhbGVUZW1wWTtcclxuICAgICAgbWlub3JPZmZzZXQgPSAoICggbWluVGVtcGVyYXR1cmUgKyBvZmZzZXRUZW1wICkgJSAoIG9wdGlvbnMudGlja1NwYWNpbmdUZW1wZXJhdHVyZSAqIDIgKSApICUgMjtcclxuICAgICAgb3B0aW9ucy50aWNrU3BhY2luZyA9IG9wdGlvbnMudGlja1NwYWNpbmdUZW1wZXJhdHVyZSAqIHNjYWxlVGVtcFk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGljayBtYXJrcywgZnJvbSBib3R0b20gdXAsIGFsdGVybmF0aW5nIG1ham9yIGFuZCBtaW5vciB0aWNrc1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpICogb3B0aW9ucy50aWNrU3BhY2luZyArIG9mZnNldCA8PSBvcHRpb25zLnR1YmVIZWlnaHQgLSAoIHR1YmVUb3BSYWRpdXMgLyAzICk7IGkrKyApIHtcclxuICAgICAgb3V0bGluZVNoYXBlLm1vdmVUbyhcclxuICAgICAgICBzdHJhaWdodFR1YmVMZWZ0LFxyXG4gICAgICAgIHR1YmVGbHVpZEJvdHRvbSAtICggaSAqIG9wdGlvbnMudGlja1NwYWNpbmcgKSAtIG9mZnNldFxyXG4gICAgICApO1xyXG4gICAgICBvdXRsaW5lU2hhcGUuaG9yaXpvbnRhbExpbmVUbyhcclxuICAgICAgICBzdHJhaWdodFR1YmVMZWZ0ICsgKCAoIGkgJSAyID09PSBtaW5vck9mZnNldCApID8gb3B0aW9ucy5taW5vclRpY2tMZW5ndGggOiBvcHRpb25zLm1ham9yVGlja0xlbmd0aCApXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQmFja2dyb3VuZCBpbnNpZGUgdGhlIHR1YmVcclxuICAgIGlmICggb3B0aW9ucy5iYWNrZ3JvdW5kRmlsbCApIHtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggbmV3IFBhdGgoIG91dGxpbmVTaGFwZSwgeyBmaWxsOiBvcHRpb25zLmJhY2tncm91bmRGaWxsIH0gKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCBvdGhlciBub2RlcyBhZnRlciBvcHRpb25hbCBiYWNrZ3JvdW5kXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0dWJlRmx1aWROb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBidWxiRmx1aWROb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBvdXRsaW5lTm9kZSApO1xyXG5cclxuICAgIC8vIFRlbXBlcmF0dXJlIGRldGVybWluZXMgdGhlIGhlaWdodCBvZiB0aGUgZmx1aWQgaW4gdGhlIHR1YmVcclxuICAgIGNvbnN0IG1heEZsdWlkSGVpZ2h0ID0gbmV3IFBhdGgoIGZsdWlkQ2xpcEFyZWEgKS5oZWlnaHQ7XHJcblxyXG4gICAgbGV0IG1pbkZsdWlkSGVpZ2h0OiBudW1iZXI7XHJcbiAgICBpZiAoIG9wdGlvbnMuemVyb0xldmVsID09PSAnYnVsYkNlbnRlcicgKSB7XHJcbiAgICAgIG1pbkZsdWlkSGVpZ2h0ID0gMDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBvcHRpb25zLnplcm9MZXZlbCA9PT0gJ2J1bGJUb3AnICkge1xyXG4gICAgICBtaW5GbHVpZEhlaWdodCA9IC10dWJlRmx1aWRCb3R0b207XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgSW52YWxpZCB6ZXJvTGV2ZWw6ICR7b3B0aW9ucy56ZXJvTGV2ZWx9YCApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudGVtcGVyYXR1cmVMaW5lYXJGdW5jdGlvbiA9IG5ldyBMaW5lYXJGdW5jdGlvbihcclxuICAgICAgbWluVGVtcGVyYXR1cmUsXHJcbiAgICAgIG1heFRlbXBlcmF0dXJlLFxyXG4gICAgICBtaW5GbHVpZEhlaWdodCxcclxuICAgICAgbWF4Rmx1aWRIZWlnaHQgKyBtaW5GbHVpZEhlaWdodFxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCB0ZW1wZXJhdHVyZVByb3BlcnR5T2JzZXJ2ZXIgPSAoIHRlbXBlcmF0dXJlOiBudW1iZXIgfCBudWxsICk6IHZvaWQgPT4ge1xyXG4gICAgICBjb25zdCBmbHVpZEhlaWdodCA9IHRoaXMudGVtcGVyYXR1cmVUb1lQb3MoIHRlbXBlcmF0dXJlICk7XHJcbiAgICAgIHR1YmVGbHVpZE5vZGUudmlzaWJsZSA9ICggZmx1aWRIZWlnaHQgPiAwICk7XHJcbiAgICAgIHR1YmVGbHVpZE5vZGUuc2V0UmVjdChcclxuICAgICAgICB0dWJlRmx1aWRMZWZ0LFxyXG4gICAgICAgIHR1YmVGbHVpZEJvdHRvbSAtIGZsdWlkSGVpZ2h0ICsgbWluRmx1aWRIZWlnaHQsXHJcbiAgICAgICAgdHViZUZsdWlkV2lkdGgsXHJcbiAgICAgICAgZmx1aWRIZWlnaHQgKyBGTFVJRF9PVkVSTEFQXHJcbiAgICAgICk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRlbXBlcmF0dXJlUHJvcGVydHkubGluayggdGVtcGVyYXR1cmVQcm9wZXJ0eU9ic2VydmVyICk7XHJcblxyXG4gICAgY29uc3QgcGVyY2VudFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0ZW1wZXJhdHVyZVByb3BlcnR5IF0sIHRlbXAgPT4ge1xyXG4gICAgICByZXR1cm4gdGVtcCA9PT0gbnVsbCA/IDAgOlxyXG4gICAgICAgICAgICAgdGhlcm1vbWV0ZXJSYW5nZS5nZXROb3JtYWxpemVkVmFsdWUoIFV0aWxzLmNsYW1wKCB0ZW1wLCB0aGVybW9tZXRlclJhbmdlLm1pbiwgdGhlcm1vbWV0ZXJSYW5nZS5tYXggKSApICogMTAwO1xyXG4gICAgfSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BlcmNlbnRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBwZXJjZW50YWdlIG9mIHRoZSB0aGVybW9tZXRlciB0aGF0IGlzIGZpbGxlZCBieSB0aGUgY3VycmVudCB0ZW1wZXJhdHVyZS4gSWYgdGVtcGVyYXR1cmUgaXMgbnVsbCwgdGhlbiBwZXJjZW50IHdpbGwgYmUgMCcsXHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogTnVsbGFibGVJTyggTnVtYmVySU8gKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlVGhlcm1vbWV0ZXJOb2RlID0gKCkgPT4ge1xyXG4gICAgICBpZiAoIHRlbXBlcmF0dXJlUHJvcGVydHkuaGFzTGlzdGVuZXIoIHRlbXBlcmF0dXJlUHJvcGVydHlPYnNlcnZlciApICkge1xyXG4gICAgICAgIHRlbXBlcmF0dXJlUHJvcGVydHkudW5saW5rKCB0ZW1wZXJhdHVyZVByb3BlcnR5T2JzZXJ2ZXIgKTtcclxuICAgICAgfVxyXG4gICAgICBwZXJjZW50UHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcclxuICAgIGFzc2VydCAmJiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3NjZW5lcnktcGhldCcsICdUaGVybW9tZXRlck5vZGUnLCB0aGlzICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcG9zZVRoZXJtb21ldGVyTm9kZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHkgcG9zaXRpb24gYXQgdGVtcGVyYXR1cmUgdG8gYWxsb3cgYWNjdXJhdGUgdGljayBwbGFjZW1lbnRcclxuICAgKiBAcGFyYW0gdGVtcGVyYXR1cmUgLSB0ZW1wZXJhdHVyZSBhdCB3aGljaCB0byBmaW5kIHkgcG9zaXRpb24sIG51bGwgaXMgdHJlYXRlZCBhcyB0aGUgcHJvdmlkZWQgbWluVGVtcGVyYXR1cmVcclxuICAgKi9cclxuICBwdWJsaWMgdGVtcGVyYXR1cmVUb1lQb3MoIHRlbXBlcmF0dXJlOiBudW1iZXIgfCBudWxsICk6IG51bWJlciB7XHJcblxyXG4gICAgLy8gdHJlYXQgbnVsbCBhcyB6ZXJvIC0gdGhpcyBpcyBhIFwibGVnYWN5IHJlcXVpcmVtZW50XCIsIG5lZWRlZCBieSB0aGUgU3RhdGVzIG9mIE1hdHRlciBzaW1zXHJcbiAgICBjb25zdCBjb21wZW5zYXRlZFRlbXBlcmF0dXJlID0gdGVtcGVyYXR1cmUgPT09IG51bGwgPyAwIDogdGVtcGVyYXR1cmU7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMudGVtcGVyYXR1cmVMaW5lYXJGdW5jdGlvbi5ldmFsdWF0ZSggY29tcGVuc2F0ZWRUZW1wZXJhdHVyZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRlbXBlcmF0dXJlIGF0IHkgcG9zaXRpb24gdG8gYWxsb3cgdGVtcGVyYXR1cmUgdGh1bWIgbWFwcGluZ1xyXG4gICAqIEBwYXJhbSB5IC0geSBwb3NpdGlvbiBvbiB0aGVybW9tZXRlciBub2RlXHJcbiAgICovXHJcbiAgcHVibGljIHlQb3NUb1RlbXBlcmF0dXJlKCB5OiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLnRlbXBlcmF0dXJlTGluZWFyRnVuY3Rpb24uaW52ZXJzZSggeSApO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdUaGVybW9tZXRlck5vZGUnLCBUaGVybW9tZXRlck5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSxrQ0FBa0M7QUFFOUQsT0FBT0MsY0FBYyxNQUFNLGdDQUFnQztBQUMzRCxPQUFPQyxLQUFLLE1BQU0sdUJBQXVCO0FBQ3pDLE9BQU9DLEtBQUssTUFBTSx1QkFBdUI7QUFDekMsU0FBU0MsS0FBSyxRQUFR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