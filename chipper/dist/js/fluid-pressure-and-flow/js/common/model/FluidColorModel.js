// Copyright 2014-2021, University of Colorado Boulder

/**
 * Change fluid color when fluid density changes. For a given density the fluid color is got by linearly interpolating
 * the RGB values between min (gas) and max (honey).
 *
 * @author Vasily Shakhov (Mlearner)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import { Color } from '../../../../scenery/js/imports.js';
import fluidPressureAndFlow from '../../fluidPressureAndFlow.js';
import Constants from '../Constants.js';

// Color constants, from the Java version
const GAS_COLOR = new Color(149, 142, 139);
const WATER_COLOR = new Color(20, 244, 255);
const HONEY_COLOR = new Color(255, 191, 0);
class FluidColorModel {
  /**
   * @param {Property.<number>} fluidDensityProperty
   * @param {Range} fluidDensityRange
   */
  constructor(fluidDensityProperty, fluidDensityRange) {
    this.fluidDensityProperty = fluidDensityProperty;
    this.getRedLow = new LinearFunction(fluidDensityRange.min, Constants.WATER_DENSITY, GAS_COLOR.red, WATER_COLOR.red); // @private
    this.getGreenLow = new LinearFunction(fluidDensityRange.min, Constants.WATER_DENSITY, GAS_COLOR.green, WATER_COLOR.green); // @private
    this.getBlueLow = new LinearFunction(fluidDensityRange.min, Constants.WATER_DENSITY, GAS_COLOR.blue, WATER_COLOR.blue); // @private

    this.getRedHigh = new LinearFunction(Constants.WATER_DENSITY, fluidDensityRange.max, WATER_COLOR.red, HONEY_COLOR.red); // @private
    this.getGreenHigh = new LinearFunction(Constants.WATER_DENSITY, fluidDensityRange.max, WATER_COLOR.green, HONEY_COLOR.green); // @private
    this.getBlueHigh = new LinearFunction(Constants.WATER_DENSITY, fluidDensityRange.max, WATER_COLOR.blue, HONEY_COLOR.blue); // @private

    // @public (read-only)
    this.colorProperty = new Property(WATER_COLOR);

    // @private indicates whether fluid density changed since the previous step
    this.densityChanged = false; //TODO rename fluidDensityChanged

    fluidDensityProperty.link(() => {
      this.densityChanged = true;
    });
  }

  /**
   * @public
   */
  reset() {
    this.colorProperty.reset();
  }

  /**
   * @public
   */
  step() {
    if (this.densityChanged) {
      const density = this.fluidDensityProperty.get();
      if (density < Constants.WATER_DENSITY) {
        this.colorProperty.value = new Color(this.getRedLow.evaluate(density), this.getGreenLow.evaluate(density), this.getBlueLow.evaluate(density));
      } else {
        this.colorProperty.value = new Color(this.getRedHigh.evaluate(density), this.getGreenHigh.evaluate(density), this.getBlueHigh.evaluate(density));
      }
      this.densityChanged = false;
    }
  }
}
fluidPressureAndFlow.register('FluidColorModel', FluidColorModel);
export default FluidColorModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkxpbmVhckZ1bmN0aW9uIiwiQ29sb3IiLCJmbHVpZFByZXNzdXJlQW5kRmxvdyIsIkNvbnN0YW50cyIsIkdBU19DT0xPUiIsIldBVEVSX0NPTE9SIiwiSE9ORVlfQ09MT1IiLCJGbHVpZENvbG9yTW9kZWwiLCJjb25zdHJ1Y3RvciIsImZsdWlkRGVuc2l0eVByb3BlcnR5IiwiZmx1aWREZW5zaXR5UmFuZ2UiLCJnZXRSZWRMb3ciLCJtaW4iLCJXQVRFUl9ERU5TSVRZIiwicmVkIiwiZ2V0R3JlZW5Mb3ciLCJncmVlbiIsImdldEJsdWVMb3ciLCJibHVlIiwiZ2V0UmVkSGlnaCIsIm1heCIsImdldEdyZWVuSGlnaCIsImdldEJsdWVIaWdoIiwiY29sb3JQcm9wZXJ0eSIsImRlbnNpdHlDaGFuZ2VkIiwibGluayIsInJlc2V0Iiwic3RlcCIsImRlbnNpdHkiLCJnZXQiLCJ2YWx1ZSIsImV2YWx1YXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGbHVpZENvbG9yTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ2hhbmdlIGZsdWlkIGNvbG9yIHdoZW4gZmx1aWQgZGVuc2l0eSBjaGFuZ2VzLiBGb3IgYSBnaXZlbiBkZW5zaXR5IHRoZSBmbHVpZCBjb2xvciBpcyBnb3QgYnkgbGluZWFybHkgaW50ZXJwb2xhdGluZ1xyXG4gKiB0aGUgUkdCIHZhbHVlcyBiZXR3ZWVuIG1pbiAoZ2FzKSBhbmQgbWF4IChob25leSkuXHJcbiAqXHJcbiAqIEBhdXRob3IgVmFzaWx5IFNoYWtob3YgKE1sZWFybmVyKVxyXG4gKiBAYXV0aG9yIFNpZGRoYXJ0aGEgQ2hpbnRoYXBhbGx5IChBY3R1YWwgQ29uY2VwdHMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTGluZWFyRnVuY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0xpbmVhckZ1bmN0aW9uLmpzJztcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZmx1aWRQcmVzc3VyZUFuZEZsb3cgZnJvbSAnLi4vLi4vZmx1aWRQcmVzc3VyZUFuZEZsb3cuanMnO1xyXG5pbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4uL0NvbnN0YW50cy5qcyc7XHJcblxyXG4vLyBDb2xvciBjb25zdGFudHMsIGZyb20gdGhlIEphdmEgdmVyc2lvblxyXG5jb25zdCBHQVNfQ09MT1IgPSBuZXcgQ29sb3IoIDE0OSwgMTQyLCAxMzkgKTtcclxuY29uc3QgV0FURVJfQ09MT1IgPSBuZXcgQ29sb3IoIDIwLCAyNDQsIDI1NSApO1xyXG5jb25zdCBIT05FWV9DT0xPUiA9IG5ldyBDb2xvciggMjU1LCAxOTEsIDAgKTtcclxuXHJcbmNsYXNzIEZsdWlkQ29sb3JNb2RlbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IGZsdWlkRGVuc2l0eVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtSYW5nZX0gZmx1aWREZW5zaXR5UmFuZ2VcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZmx1aWREZW5zaXR5UHJvcGVydHksIGZsdWlkRGVuc2l0eVJhbmdlICkge1xyXG5cclxuICAgIHRoaXMuZmx1aWREZW5zaXR5UHJvcGVydHkgPSBmbHVpZERlbnNpdHlQcm9wZXJ0eTtcclxuXHJcbiAgICB0aGlzLmdldFJlZExvdyA9IG5ldyBMaW5lYXJGdW5jdGlvbiggZmx1aWREZW5zaXR5UmFuZ2UubWluLCBDb25zdGFudHMuV0FURVJfREVOU0lUWSwgR0FTX0NPTE9SLnJlZCxcclxuICAgICAgV0FURVJfQ09MT1IucmVkICk7IC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmdldEdyZWVuTG93ID0gbmV3IExpbmVhckZ1bmN0aW9uKCBmbHVpZERlbnNpdHlSYW5nZS5taW4sIENvbnN0YW50cy5XQVRFUl9ERU5TSVRZLCBHQVNfQ09MT1IuZ3JlZW4sXHJcbiAgICAgIFdBVEVSX0NPTE9SLmdyZWVuICk7IC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmdldEJsdWVMb3cgPSBuZXcgTGluZWFyRnVuY3Rpb24oIGZsdWlkRGVuc2l0eVJhbmdlLm1pbiwgQ29uc3RhbnRzLldBVEVSX0RFTlNJVFksIEdBU19DT0xPUi5ibHVlLFxyXG4gICAgICBXQVRFUl9DT0xPUi5ibHVlICk7IC8vIEBwcml2YXRlXHJcblxyXG4gICAgdGhpcy5nZXRSZWRIaWdoID0gbmV3IExpbmVhckZ1bmN0aW9uKCBDb25zdGFudHMuV0FURVJfREVOU0lUWSwgZmx1aWREZW5zaXR5UmFuZ2UubWF4LCBXQVRFUl9DT0xPUi5yZWQsXHJcbiAgICAgIEhPTkVZX0NPTE9SLnJlZCApOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5nZXRHcmVlbkhpZ2ggPSBuZXcgTGluZWFyRnVuY3Rpb24oIENvbnN0YW50cy5XQVRFUl9ERU5TSVRZLCBmbHVpZERlbnNpdHlSYW5nZS5tYXgsXHJcbiAgICAgIFdBVEVSX0NPTE9SLmdyZWVuLCBIT05FWV9DT0xPUi5ncmVlbiApOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5nZXRCbHVlSGlnaCA9IG5ldyBMaW5lYXJGdW5jdGlvbiggQ29uc3RhbnRzLldBVEVSX0RFTlNJVFksIGZsdWlkRGVuc2l0eVJhbmdlLm1heCwgV0FURVJfQ09MT1IuYmx1ZSxcclxuICAgICAgSE9ORVlfQ09MT1IuYmx1ZSApOyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSlcclxuICAgIHRoaXMuY29sb3JQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggV0FURVJfQ09MT1IgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSBpbmRpY2F0ZXMgd2hldGhlciBmbHVpZCBkZW5zaXR5IGNoYW5nZWQgc2luY2UgdGhlIHByZXZpb3VzIHN0ZXBcclxuICAgIHRoaXMuZGVuc2l0eUNoYW5nZWQgPSBmYWxzZTsgLy9UT0RPIHJlbmFtZSBmbHVpZERlbnNpdHlDaGFuZ2VkXHJcblxyXG4gICAgZmx1aWREZW5zaXR5UHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICB0aGlzLmRlbnNpdHlDaGFuZ2VkID0gdHJ1ZTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuY29sb3JQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoKSB7XHJcbiAgICBpZiAoIHRoaXMuZGVuc2l0eUNoYW5nZWQgKSB7XHJcbiAgICAgIGNvbnN0IGRlbnNpdHkgPSB0aGlzLmZsdWlkRGVuc2l0eVByb3BlcnR5LmdldCgpO1xyXG4gICAgICBpZiAoIGRlbnNpdHkgPCBDb25zdGFudHMuV0FURVJfREVOU0lUWSApIHtcclxuICAgICAgICB0aGlzLmNvbG9yUHJvcGVydHkudmFsdWUgPSBuZXcgQ29sb3IoIHRoaXMuZ2V0UmVkTG93LmV2YWx1YXRlKCBkZW5zaXR5ICksIHRoaXMuZ2V0R3JlZW5Mb3cuZXZhbHVhdGUoIGRlbnNpdHkgKSwgdGhpcy5nZXRCbHVlTG93LmV2YWx1YXRlKCBkZW5zaXR5ICkgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmNvbG9yUHJvcGVydHkudmFsdWUgPSBuZXcgQ29sb3IoIHRoaXMuZ2V0UmVkSGlnaC5ldmFsdWF0ZSggZGVuc2l0eSApLCB0aGlzLmdldEdyZWVuSGlnaC5ldmFsdWF0ZSggZGVuc2l0eSApLCB0aGlzLmdldEJsdWVIaWdoLmV2YWx1YXRlKCBkZW5zaXR5ICkgKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmRlbnNpdHlDaGFuZ2VkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mbHVpZFByZXNzdXJlQW5kRmxvdy5yZWdpc3RlciggJ0ZsdWlkQ29sb3JNb2RlbCcsIEZsdWlkQ29sb3JNb2RlbCApO1xyXG5leHBvcnQgZGVmYXVsdCBGbHVpZENvbG9yTW9kZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLGNBQWMsTUFBTSxzQ0FBc0M7QUFDakUsU0FBU0MsS0FBSyxRQUFRLG1DQUFtQztBQUN6RCxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7QUFDaEUsT0FBT0MsU0FBUyxNQUFNLGlCQUFpQjs7QUFFdkM7QUFDQSxNQUFNQyxTQUFTLEdBQUcsSUFBSUgsS0FBSyxDQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBSSxDQUFDO0FBQzVDLE1BQU1JLFdBQVcsR0FBRyxJQUFJSixLQUFLLENBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFJLENBQUM7QUFDN0MsTUFBTUssV0FBVyxHQUFHLElBQUlMLEtBQUssQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUUsQ0FBQztBQUU1QyxNQUFNTSxlQUFlLENBQUM7RUFFcEI7QUFDRjtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsb0JBQW9CLEVBQUVDLGlCQUFpQixFQUFHO0lBRXJELElBQUksQ0FBQ0Qsb0JBQW9CLEdBQUdBLG9CQUFvQjtJQUVoRCxJQUFJLENBQUNFLFNBQVMsR0FBRyxJQUFJWCxjQUFjLENBQUVVLGlCQUFpQixDQUFDRSxHQUFHLEVBQUVULFNBQVMsQ0FBQ1UsYUFBYSxFQUFFVCxTQUFTLENBQUNVLEdBQUcsRUFDaEdULFdBQVcsQ0FBQ1MsR0FBSSxDQUFDLENBQUMsQ0FBQztJQUNyQixJQUFJLENBQUNDLFdBQVcsR0FBRyxJQUFJZixjQUFjLENBQUVVLGlCQUFpQixDQUFDRSxHQUFHLEVBQUVULFNBQVMsQ0FBQ1UsYUFBYSxFQUFFVCxTQUFTLENBQUNZLEtB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