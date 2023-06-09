// Copyright 2018-2022, University of Colorado Boulder

/**
 * A ToggleNode that shows something different for each scene.  All SceneToggleNodes in this sim exist for the lifetime
 * of the sim and doesn't require disposal.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import ToggleNode from '../../../../sun/js/ToggleNode.js';
import waveInterference from '../../waveInterference.js';
class SceneToggleNode extends ToggleNode {
  constructor(model, sceneToNode, options) {
    const toElement = scene => ({
      value: scene,
      createNode: tandem => sceneToNode(scene)
    });
    super(model.sceneProperty, model.scenes.map(toElement), options);
  }
}
waveInterference.register('SceneToggleNode', SceneToggleNode);
export default SceneToggleNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUb2dnbGVOb2RlIiwid2F2ZUludGVyZmVyZW5jZSIsIlNjZW5lVG9nZ2xlTm9kZSIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJzY2VuZVRvTm9kZSIsIm9wdGlvbnMiLCJ0b0VsZW1lbnQiLCJzY2VuZSIsInZhbHVlIiwiY3JlYXRlTm9kZSIsInRhbmRlbSIsInNjZW5lUHJvcGVydHkiLCJzY2VuZXMiLCJtYXAiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNjZW5lVG9nZ2xlTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIFRvZ2dsZU5vZGUgdGhhdCBzaG93cyBzb21ldGhpbmcgZGlmZmVyZW50IGZvciBlYWNoIHNjZW5lLiAgQWxsIFNjZW5lVG9nZ2xlTm9kZXMgaW4gdGhpcyBzaW0gZXhpc3QgZm9yIHRoZSBsaWZldGltZVxyXG4gKiBvZiB0aGUgc2ltIGFuZCBkb2Vzbid0IHJlcXVpcmUgZGlzcG9zYWwuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRvZ2dsZU5vZGUsIHsgVG9nZ2xlTm9kZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvVG9nZ2xlTm9kZS5qcyc7XHJcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgd2F2ZUludGVyZmVyZW5jZSBmcm9tICcuLi8uLi93YXZlSW50ZXJmZXJlbmNlLmpzJztcclxuaW1wb3J0IFdhdmVzTW9kZWwgZnJvbSAnLi4vLi4vd2F2ZXMvbW9kZWwvV2F2ZXNNb2RlbC5qcyc7XHJcbmltcG9ydCBTY2VuZSBmcm9tICcuLi9tb2RlbC9TY2VuZS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcblxyXG5jbGFzcyBTY2VuZVRvZ2dsZU5vZGUgZXh0ZW5kcyBUb2dnbGVOb2RlPFNjZW5lPiB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IFdhdmVzTW9kZWwsIHNjZW5lVG9Ob2RlOiAoIHNjZW5lOiBTY2VuZSApID0+IE5vZGUsIG9wdGlvbnM/OiBUb2dnbGVOb2RlT3B0aW9ucyApIHtcclxuICAgIGNvbnN0IHRvRWxlbWVudCA9ICggc2NlbmU6IFNjZW5lICkgPT4gKCB7IHZhbHVlOiBzY2VuZSwgY3JlYXRlTm9kZTogKCB0YW5kZW06IFRhbmRlbSApID0+IHNjZW5lVG9Ob2RlKCBzY2VuZSApIH0gKTtcclxuICAgIHN1cGVyKCBtb2RlbC5zY2VuZVByb3BlcnR5LCBtb2RlbC5zY2VuZXMubWFwKCB0b0VsZW1lbnQgKSwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxud2F2ZUludGVyZmVyZW5jZS5yZWdpc3RlciggJ1NjZW5lVG9nZ2xlTm9kZScsIFNjZW5lVG9nZ2xlTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBTY2VuZVRvZ2dsZU5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUE2QixrQ0FBa0M7QUFFaEYsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBS3hELE1BQU1DLGVBQWUsU0FBU0YsVUFBVSxDQUFRO0VBRXZDRyxXQUFXQSxDQUFFQyxLQUFpQixFQUFFQyxXQUFxQyxFQUFFQyxPQUEyQixFQUFHO0lBQzFHLE1BQU1DLFNBQVMsR0FBS0MsS0FBWSxLQUFRO01BQUVDLEtBQUssRUFBRUQsS0FBSztNQUFFRSxVQUFVLEVBQUlDLE1BQWMsSUFBTU4sV0FBVyxDQUFFRyxLQUFNO0lBQUUsQ0FBQyxDQUFFO0lBQ2xILEtBQUssQ0FBRUosS0FBSyxDQUFDUSxhQUFhLEVBQUVSLEtBQUssQ0FBQ1MsTUFBTSxDQUFDQyxHQUFHLENBQUVQLFNBQVUsQ0FBQyxFQUFFRCxPQUFRLENBQUM7RUFDdEU7QUFDRjtBQUVBTCxnQkFBZ0IsQ0FBQ2MsUUFBUSxDQUFFLGlCQUFpQixFQUFFYixlQUFnQixDQUFDO0FBQy9ELGVBQWVBLGVBQWUifQ==