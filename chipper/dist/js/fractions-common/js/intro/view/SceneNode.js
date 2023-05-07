// Copyright 2018-2021, University of Colorado Boulder

/**
 * Base type for scene nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Node } from '../../../../scenery/js/imports.js';
import fractionsCommon from '../../fractionsCommon.js';
class SceneNode extends Node {
  /**
   * @param {ContainerSetModel} model
   */
  constructor(model) {
    super();

    // @protected {ContainerSetModel}
    this.model = model;
  }

  /**
   * Steps forward in time.
   * @public
   *
   * @param {number} dt
   */
  step(dt) {
    // Behavior will be added in subtypes
  }
}
fractionsCommon.register('SceneNode', SceneNode);
export default SceneNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb2RlIiwiZnJhY3Rpb25zQ29tbW9uIiwiU2NlbmVOb2RlIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInN0ZXAiLCJkdCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2NlbmVOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJhc2UgdHlwZSBmb3Igc2NlbmUgbm9kZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGZyYWN0aW9uc0NvbW1vbiBmcm9tICcuLi8uLi9mcmFjdGlvbnNDb21tb24uanMnO1xyXG5cclxuY2xhc3MgU2NlbmVOb2RlIGV4dGVuZHMgTm9kZSB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtDb250YWluZXJTZXRNb2RlbH0gbW9kZWxcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwgKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWQge0NvbnRhaW5lclNldE1vZGVsfVxyXG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcHMgZm9yd2FyZCBpbiB0aW1lLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgLy8gQmVoYXZpb3Igd2lsbCBiZSBhZGRlZCBpbiBzdWJ0eXBlc1xyXG4gIH1cclxufVxyXG5cclxuZnJhY3Rpb25zQ29tbW9uLnJlZ2lzdGVyKCAnU2NlbmVOb2RlJywgU2NlbmVOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IFNjZW5lTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsSUFBSSxRQUFRLG1DQUFtQztBQUN4RCxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBRXRELE1BQU1DLFNBQVMsU0FBU0YsSUFBSSxDQUFDO0VBQzNCO0FBQ0Y7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyxLQUFLLEVBQUc7SUFDbkIsS0FBSyxDQUFDLENBQUM7O0lBRVA7SUFDQSxJQUFJLENBQUNBLEtBQUssR0FBR0EsS0FBSztFQUNwQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsSUFBSUEsQ0FBRUMsRUFBRSxFQUFHO0lBQ1Q7RUFBQTtBQUVKO0FBRUFMLGVBQWUsQ0FBQ00sUUFBUSxDQUFFLFdBQVcsRUFBRUwsU0FBVSxDQUFDO0FBQ2xELGVBQWVBLFNBQVMifQ==