// Copyright 2017-2022, University of Colorado Boulder

/**
 * Model for one of the spherical draggable charges.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Barlow (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import ISLCObject from '../../../../inverse-square-law-common/js/model/ISLCObject.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color } from '../../../../scenery/js/imports.js';
import coulombsLaw from '../../coulombsLaw.js';
class Charge extends ISLCObject {
  /**
   * @param {number} initialCharge
   * @param {number} initialPosition - only for the x coordinate
   * @param {Range} valueRange - only for the x coordinate
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(initialCharge, initialPosition, valueRange, tandem, options) {
    options = merge({
      constantRadius: 6.75E-3,
      // ensure this is in meters (0.675cm)
      valueUnits: 'C' // coulombs, from units.js
    }, options);
    const constantRadiusProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('constantRadiusProperty')
    });
    const negativeColor = new Color('#00f');
    const positiveColor = new Color('#f00');
    super(initialCharge, initialPosition, valueRange, constantRadiusProperty, () => this.radiusProperty.get(), tandem, options);

    // see ISLCObject
    this.baseColorProperty = new DerivedProperty([this.valueProperty], value => {
      const newBaseColor = value < 0 ? negativeColor : positiveColor;
      return newBaseColor.colorUtilsBrighter(1 - Math.abs(value) / valueRange.max);
    }, {
      tandem: tandem.createTandem('baseColorProperty'),
      phetioValueType: Color.ColorIO
    });
  }
}
coulombsLaw.register('Charge', Charge);
export default Charge;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJJU0xDT2JqZWN0IiwibWVyZ2UiLCJDb2xvciIsImNvdWxvbWJzTGF3IiwiQ2hhcmdlIiwiY29uc3RydWN0b3IiLCJpbml0aWFsQ2hhcmdlIiwiaW5pdGlhbFBvc2l0aW9uIiwidmFsdWVSYW5nZSIsInRhbmRlbSIsIm9wdGlvbnMiLCJjb25zdGFudFJhZGl1cyIsInZhbHVlVW5pdHMiLCJjb25zdGFudFJhZGl1c1Byb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwibmVnYXRpdmVDb2xvciIsInBvc2l0aXZlQ29sb3IiLCJyYWRpdXNQcm9wZXJ0eSIsImdldCIsImJhc2VDb2xvclByb3BlcnR5IiwidmFsdWVQcm9wZXJ0eSIsInZhbHVlIiwibmV3QmFzZUNvbG9yIiwiY29sb3JVdGlsc0JyaWdodGVyIiwiTWF0aCIsImFicyIsIm1heCIsInBoZXRpb1ZhbHVlVHlwZSIsIkNvbG9ySU8iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNoYXJnZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBmb3Igb25lIG9mIHRoZSBzcGhlcmljYWwgZHJhZ2dhYmxlIGNoYXJnZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgQmFybG93IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IElTTENPYmplY3QgZnJvbSAnLi4vLi4vLi4vLi4vaW52ZXJzZS1zcXVhcmUtbGF3LWNvbW1vbi9qcy9tb2RlbC9JU0xDT2JqZWN0LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGNvdWxvbWJzTGF3IGZyb20gJy4uLy4uL2NvdWxvbWJzTGF3LmpzJztcclxuXHJcbmNsYXNzIENoYXJnZSBleHRlbmRzIElTTENPYmplY3Qge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5pdGlhbENoYXJnZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbml0aWFsUG9zaXRpb24gLSBvbmx5IGZvciB0aGUgeCBjb29yZGluYXRlXHJcbiAgICogQHBhcmFtIHtSYW5nZX0gdmFsdWVSYW5nZSAtIG9ubHkgZm9yIHRoZSB4IGNvb3JkaW5hdGVcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBpbml0aWFsQ2hhcmdlLCBpbml0aWFsUG9zaXRpb24sIHZhbHVlUmFuZ2UsIHRhbmRlbSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgY29uc3RhbnRSYWRpdXM6IDYuNzVFLTMsIC8vIGVuc3VyZSB0aGlzIGlzIGluIG1ldGVycyAoMC42NzVjbSlcclxuICAgICAgdmFsdWVVbml0czogJ0MnIC8vIGNvdWxvbWJzLCBmcm9tIHVuaXRzLmpzXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgY29uc3RhbnRSYWRpdXNQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY29uc3RhbnRSYWRpdXNQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IG5lZ2F0aXZlQ29sb3IgPSBuZXcgQ29sb3IoICcjMDBmJyApO1xyXG4gICAgY29uc3QgcG9zaXRpdmVDb2xvciA9IG5ldyBDb2xvciggJyNmMDAnICk7XHJcblxyXG4gICAgc3VwZXIoIGluaXRpYWxDaGFyZ2UsIGluaXRpYWxQb3NpdGlvbiwgdmFsdWVSYW5nZSwgY29uc3RhbnRSYWRpdXNQcm9wZXJ0eSxcclxuICAgICAgKCkgPT4gdGhpcy5yYWRpdXNQcm9wZXJ0eS5nZXQoKSwgdGFuZGVtLCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gc2VlIElTTENPYmplY3RcclxuICAgIHRoaXMuYmFzZUNvbG9yUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMudmFsdWVQcm9wZXJ0eSBdLCB2YWx1ZSA9PiB7XHJcbiAgICAgICAgY29uc3QgbmV3QmFzZUNvbG9yID0gdmFsdWUgPCAwID8gbmVnYXRpdmVDb2xvciA6IHBvc2l0aXZlQ29sb3I7XHJcbiAgICAgICAgcmV0dXJuIG5ld0Jhc2VDb2xvci5jb2xvclV0aWxzQnJpZ2h0ZXIoIDEgLSBNYXRoLmFicyggdmFsdWUgKSAvIHZhbHVlUmFuZ2UubWF4ICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHsgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYmFzZUNvbG9yUHJvcGVydHknICksIHBoZXRpb1ZhbHVlVHlwZTogQ29sb3IuQ29sb3JJTyB9XHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuY291bG9tYnNMYXcucmVnaXN0ZXIoICdDaGFyZ2UnLCBDaGFyZ2UgKTtcclxuZXhwb3J0IGRlZmF1bHQgQ2hhcmdlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxVQUFVLE1BQU0sOERBQThEO0FBQ3JGLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsU0FBU0MsS0FBSyxRQUFRLG1DQUFtQztBQUN6RCxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBRTlDLE1BQU1DLE1BQU0sU0FBU0osVUFBVSxDQUFDO0VBRTlCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VLLFdBQVdBLENBQUVDLGFBQWEsRUFBRUMsZUFBZSxFQUFFQyxVQUFVLEVBQUVDLE1BQU0sRUFBRUMsT0FBTyxFQUFHO0lBRXpFQSxPQUFPLEdBQUdULEtBQUssQ0FBRTtNQUNmVSxjQUFjLEVBQUUsT0FBTztNQUFFO01BQ3pCQyxVQUFVLEVBQUUsR0FBRyxDQUFDO0lBQ2xCLENBQUMsRUFBRUYsT0FBUSxDQUFDO0lBRVosTUFBTUcsc0JBQXNCLEdBQUcsSUFBSWYsZUFBZSxDQUFFLElBQUksRUFBRTtNQUN4RFcsTUFBTSxFQUFFQSxNQUFNLENBQUNLLFlBQVksQ0FBRSx3QkFBeUI7SUFDeEQsQ0FBRSxDQUFDO0lBRUgsTUFBTUMsYUFBYSxHQUFHLElBQUliLEtBQUssQ0FBRSxNQUFPLENBQUM7SUFDekMsTUFBTWMsYUFBYSxHQUFHLElBQUlkLEtBQUssQ0FBRSxNQUFPLENBQUM7SUFFekMsS0FBSyxDQUFFSSxhQUFhLEVBQUVDLGVBQWUsRUFBRUMsVUFBVSxFQUFFSyxzQkFBc0IsRUFDdkUsTUFBTSxJQUFJLENBQUNJLGNBQWMsQ0FBQ0MsR0FBRyxDQUFDLENBQUMsRUFBRVQsTUFBTSxFQUFFQyxPQUFRLENBQUM7O0lBRXBEO0lBQ0EsSUFBSSxDQUFDUyxpQkFBaUIsR0FBRyxJQUFJcEIsZUFBZSxDQUFFLENBQUUsSUFBSSxDQUFDcUIsYUFBYSxDQUFFLEVBQUVDLEtBQUssSUFBSTtNQUMzRSxNQUFNQyxZQUFZLEdBQUdELEtBQUssR0FBRyxDQUFDLEdBQUdOLGFBQWEsR0FBR0MsYUFBYTtNQUM5RCxPQUFPTSxZQUFZLENBQUNDLGtCQUFrQixDQUFFLENBQUMsR0FBR0MsSUFBSSxDQUFDQyxHQUFHLENBQUVKLEtBQU0sQ0FBQyxHQUFHYixVQUFVLENBQUNrQixHQUFJLENBQUM7SUFDbEYsQ0FBQyxFQUNEO01BQUVqQixNQUFNLEVBQUVBLE1BQU0sQ0FBQ0ssWUFBWSxDQUFFLG1CQUFvQixDQUFDO01BQUVhLGVBQWUsRUFBRXpCLEtBQUssQ0FBQzBCO0lBQVEsQ0FDdkYsQ0FBQztFQUNIO0FBQ0Y7QUFFQXpCLFdBQVcsQ0FBQzBCLFFBQVEsQ0FBRSxRQUFRLEVBQUV6QixNQUFPLENBQUM7QUFDeEMsZUFBZUEsTUFBTSJ9