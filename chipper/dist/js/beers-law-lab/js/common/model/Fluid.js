// Copyright 2013-2022, University of Colorado Boulder

/**
 * Fluid is the base class model for all fluids.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import beersLawLab from '../../beersLawLab.js';
export default class Fluid {
  constructor(color) {
    this.colorProperty = new Property(color);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }
  reset() {
    this.colorProperty.reset();
  }
}
beersLawLab.register('Fluid', Fluid);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsImJlZXJzTGF3TGFiIiwiRmx1aWQiLCJjb25zdHJ1Y3RvciIsImNvbG9yIiwiY29sb3JQcm9wZXJ0eSIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRmx1aWQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRmx1aWQgaXMgdGhlIGJhc2UgY2xhc3MgbW9kZWwgZm9yIGFsbCBmbHVpZHMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBiZWVyc0xhd0xhYiBmcm9tICcuLi8uLi9iZWVyc0xhd0xhYi5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGbHVpZCB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBjb2xvclByb3BlcnR5OiBQcm9wZXJ0eTxDb2xvcj47XHJcblxyXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvciggY29sb3I6IENvbG9yICkge1xyXG4gICAgdGhpcy5jb2xvclByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBjb2xvciApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMuY29sb3JQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxuYmVlcnNMYXdMYWIucmVnaXN0ZXIoICdGbHVpZCcsIEZsdWlkICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxpQ0FBaUM7QUFFdEQsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUU5QyxlQUFlLE1BQU1DLEtBQUssQ0FBQztFQUlmQyxXQUFXQSxDQUFFQyxLQUFZLEVBQUc7SUFDcEMsSUFBSSxDQUFDQyxhQUFhLEdBQUcsSUFBSUwsUUFBUSxDQUFFSSxLQUFNLENBQUM7RUFDNUM7RUFFT0UsT0FBT0EsQ0FBQSxFQUFTO0lBQ3JCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7RUFDM0Y7RUFFT0MsS0FBS0EsQ0FBQSxFQUFTO0lBQ25CLElBQUksQ0FBQ0gsYUFBYSxDQUFDRyxLQUFLLENBQUMsQ0FBQztFQUM1QjtBQUNGO0FBRUFQLFdBQVcsQ0FBQ1EsUUFBUSxDQUFFLE9BQU8sRUFBRVAsS0FBTSxDQUFDIn0=