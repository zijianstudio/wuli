// Copyright 2023, University of Colorado Boulder

/**
 * TODO Describe this class and its responsibilities.
 *
 * @author Zijian Wang
 */

import relativity from '../../relativity.js';
export default class RelativityModel {
  constructor(providedOptions) {
    //TODO
    this.coord1 = 1;
    this.coord2 = 1;
  }

  /**
   * Resets the model.
   */
  reset() {
    //TODO
  }

  /**
   * Steps the model.
   * @param dt - time step, in seconds
   */
  step(dt) {
    //console.log("model dt"); works
  }
}
relativity.register('RelativityModel', RelativityModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJyZWxhdGl2aXR5IiwiUmVsYXRpdml0eU1vZGVsIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJjb29yZDEiLCJjb29yZDIiLCJyZXNldCIsInN0ZXAiLCJkdCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUmVsYXRpdml0eU1vZGVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUT0RPIERlc2NyaWJlIHRoaXMgY2xhc3MgYW5kIGl0cyByZXNwb25zaWJpbGl0aWVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFppamlhbiBXYW5nXHJcbiAqL1xyXG5cclxuaW1wb3J0IHJlbGF0aXZpdHkgZnJvbSAnLi4vLi4vcmVsYXRpdml0eS5qcyc7XHJcbmltcG9ydCB7IFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFRNb2RlbCBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9UTW9kZWwuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICAvL1RPRE8gYWRkIG9wdGlvbnMgdGhhdCBhcmUgc3BlY2lmaWMgdG8gUmVsYXRpdml0eU1vZGVsIGhlcmVcclxufTtcclxuXHJcbnR5cGUgUmVsYXRpdml0eU1vZGVsT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPFBoZXRpb09iamVjdE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbGF0aXZpdHlNb2RlbCBpbXBsZW1lbnRzIFRNb2RlbCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBSZWxhdGl2aXR5TW9kZWxPcHRpb25zICkge1xyXG4gICAgLy9UT0RPXHJcbiAgICB0aGlzLmNvb3JkMSA9IDE7XHJcbiAgICB0aGlzLmNvb3JkMiA9IDE7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhlIG1vZGVsLlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIC8vVE9ET1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcHMgdGhlIG1vZGVsLlxyXG4gICAqIEBwYXJhbSBkdCAtIHRpbWUgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgLy9jb25zb2xlLmxvZyhcIm1vZGVsIGR0XCIpOyB3b3Jrc1xyXG4gIH1cclxufVxyXG5cclxucmVsYXRpdml0eS5yZWdpc3RlciggJ1JlbGF0aXZpdHlNb2RlbCcsIFJlbGF0aXZpdHlNb2RlbCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQU0scUJBQXFCO0FBVzVDLGVBQWUsTUFBTUMsZUFBZSxDQUFtQjtFQUU5Q0MsV0FBV0EsQ0FBRUMsZUFBdUMsRUFBRztJQUM1RDtJQUNBLElBQUksQ0FBQ0MsTUFBTSxHQUFHLENBQUM7SUFDZixJQUFJLENBQUNDLE1BQU0sR0FBRyxDQUFDO0VBQ2pCOztFQUVBO0FBQ0Y7QUFDQTtFQUNTQyxLQUFLQSxDQUFBLEVBQVM7SUFDbkI7RUFBQTs7RUFHRjtBQUNGO0FBQ0E7QUFDQTtFQUNTQyxJQUFJQSxDQUFFQyxFQUFVLEVBQVM7SUFDOUI7RUFBQTtBQUVKO0FBRUFSLFVBQVUsQ0FBQ1MsUUFBUSxDQUFFLGlCQUFpQixFQUFFUixlQUFnQixDQUFDIn0=