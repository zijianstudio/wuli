// Copyright 2015-2022, University of Colorado Boulder

/**
 * A Scenery node that depicts a hopper, a pyramidal shape container
 *
 * @author Martin Veillette (Berea College)
 */

import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { LinearGradient, Node, Path } from '../../../../scenery/js/imports.js';
import plinkoProbability from '../../plinkoProbability.js';
class Hopper extends Node {
  /**
   * Constructor for hopper
   * @param {Property.<number>} numberOfRowsProperty
   * @param {Object} [options]
   */
  constructor(numberOfRowsProperty, options) {
    super();
    options = merge({
      topWidth: 70,
      bottomWidth: 45,
      hopperThickness: 28,
      rimThickness: 3,
      hopperFill: 'black',
      hopperHighLightFill: 'rgb(136,136,136)',
      rimFill: 'red',
      rimHighLightFill: 'rgb(255,255,255)'
    }, options);
    const extraSpace = 12;

    // create horizontal gradients for the hopper and the rim
    const hopperRectangleGradient = new LinearGradient(-options.topWidth / 2, 0, options.topWidth / 2, 0).addColorStop(0, options.hopperFill).addColorStop(0.47, options.hopperHighLightFill).addColorStop(1, options.hopperFill);
    const rimRectangleGradient = new LinearGradient(-options.bottomWidth / 2, 0, options.bottomWidth / 2, 0).addColorStop(0, options.rimFill).addColorStop(0.47, options.rimHighLightFill).addColorStop(1, options.rimFill);

    // present for the lifetime of the simulation
    numberOfRowsProperty.link(numberOfRows => {
      this.removeAllChildren();
      // create the truncated pyramidal shape of the hopper
      const hopperShape = new Shape();

      // create a small rim at the bottom the hopper
      const rimShape = new Shape();
      const bottomWidth = options.bottomWidth * 11 / (5 + Math.min(6, numberOfRows));
      hopperShape.moveTo(0, 0).lineTo(-bottomWidth / 2, 0).lineTo(-bottomWidth / 2 - extraSpace, -options.hopperThickness).lineTo(bottomWidth / 2 + extraSpace, -options.hopperThickness).lineTo(bottomWidth / 2, 0).close();
      rimShape.moveTo(0, 0).lineTo(-bottomWidth / 2, 0).lineTo(-bottomWidth / 2, options.rimThickness).lineTo(bottomWidth / 2, options.rimThickness).lineTo(bottomWidth / 2, 0).close();

      // add the hopper and the rim.
      const hopperPath = new Path(hopperShape, {
        fill: hopperRectangleGradient
      });
      const rimPath = new Path(rimShape, {
        fill: rimRectangleGradient
      });
      this.addChild(hopperPath);
      this.addChild(rimPath);
    });
    // pass options through to the parent class.
    this.mutate(options);
  }
}
plinkoProbability.register('Hopper', Hopper);
export default Hopper;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIm1lcmdlIiwiTGluZWFyR3JhZGllbnQiLCJOb2RlIiwiUGF0aCIsInBsaW5rb1Byb2JhYmlsaXR5IiwiSG9wcGVyIiwiY29uc3RydWN0b3IiLCJudW1iZXJPZlJvd3NQcm9wZXJ0eSIsIm9wdGlvbnMiLCJ0b3BXaWR0aCIsImJvdHRvbVdpZHRoIiwiaG9wcGVyVGhpY2tuZXNzIiwicmltVGhpY2tuZXNzIiwiaG9wcGVyRmlsbCIsImhvcHBlckhpZ2hMaWdodEZpbGwiLCJyaW1GaWxsIiwicmltSGlnaExpZ2h0RmlsbCIsImV4dHJhU3BhY2UiLCJob3BwZXJSZWN0YW5nbGVHcmFkaWVudCIsImFkZENvbG9yU3RvcCIsInJpbVJlY3RhbmdsZUdyYWRpZW50IiwibGluayIsIm51bWJlck9mUm93cyIsInJlbW92ZUFsbENoaWxkcmVuIiwiaG9wcGVyU2hhcGUiLCJyaW1TaGFwZSIsIk1hdGgiLCJtaW4iLCJtb3ZlVG8iLCJsaW5lVG8iLCJjbG9zZSIsImhvcHBlclBhdGgiLCJmaWxsIiwicmltUGF0aCIsImFkZENoaWxkIiwibXV0YXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJIb3BwZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBTY2VuZXJ5IG5vZGUgdGhhdCBkZXBpY3RzIGEgaG9wcGVyLCBhIHB5cmFtaWRhbCBzaGFwZSBjb250YWluZXJcclxuICpcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlIChCZXJlYSBDb2xsZWdlKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IExpbmVhckdyYWRpZW50LCBOb2RlLCBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHBsaW5rb1Byb2JhYmlsaXR5IGZyb20gJy4uLy4uL3BsaW5rb1Byb2JhYmlsaXR5LmpzJztcclxuXHJcbmNsYXNzIEhvcHBlciBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yIGZvciBob3BwZXJcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxudW1iZXI+fSBudW1iZXJPZlJvd3NQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbnVtYmVyT2ZSb3dzUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgdG9wV2lkdGg6IDcwLFxyXG4gICAgICBib3R0b21XaWR0aDogNDUsXHJcbiAgICAgIGhvcHBlclRoaWNrbmVzczogMjgsXHJcbiAgICAgIHJpbVRoaWNrbmVzczogMyxcclxuICAgICAgaG9wcGVyRmlsbDogJ2JsYWNrJyxcclxuICAgICAgaG9wcGVySGlnaExpZ2h0RmlsbDogJ3JnYigxMzYsMTM2LDEzNiknLFxyXG4gICAgICByaW1GaWxsOiAncmVkJyxcclxuICAgICAgcmltSGlnaExpZ2h0RmlsbDogJ3JnYigyNTUsMjU1LDI1NSknXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgZXh0cmFTcGFjZSA9IDEyO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBob3Jpem9udGFsIGdyYWRpZW50cyBmb3IgdGhlIGhvcHBlciBhbmQgdGhlIHJpbVxyXG4gICAgY29uc3QgaG9wcGVyUmVjdGFuZ2xlR3JhZGllbnQgPSBuZXcgTGluZWFyR3JhZGllbnQoIC1vcHRpb25zLnRvcFdpZHRoIC8gMiwgMCwgb3B0aW9ucy50b3BXaWR0aCAvIDIsIDAgKS5hZGRDb2xvclN0b3AoIDAsIG9wdGlvbnMuaG9wcGVyRmlsbCApLmFkZENvbG9yU3RvcCggMC40Nywgb3B0aW9ucy5ob3BwZXJIaWdoTGlnaHRGaWxsICkuYWRkQ29sb3JTdG9wKCAxLCBvcHRpb25zLmhvcHBlckZpbGwgKTtcclxuICAgIGNvbnN0IHJpbVJlY3RhbmdsZUdyYWRpZW50ID0gbmV3IExpbmVhckdyYWRpZW50KCAtb3B0aW9ucy5ib3R0b21XaWR0aCAvIDIsIDAsIG9wdGlvbnMuYm90dG9tV2lkdGggLyAyLCAwICkuYWRkQ29sb3JTdG9wKCAwLCBvcHRpb25zLnJpbUZpbGwgKS5hZGRDb2xvclN0b3AoIDAuNDcsIG9wdGlvbnMucmltSGlnaExpZ2h0RmlsbCApLmFkZENvbG9yU3RvcCggMSwgb3B0aW9ucy5yaW1GaWxsICk7XHJcblxyXG5cclxuICAgIC8vIHByZXNlbnQgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltdWxhdGlvblxyXG4gICAgbnVtYmVyT2ZSb3dzUHJvcGVydHkubGluayggbnVtYmVyT2ZSb3dzID0+IHtcclxuICAgICAgdGhpcy5yZW1vdmVBbGxDaGlsZHJlbigpO1xyXG4gICAgICAvLyBjcmVhdGUgdGhlIHRydW5jYXRlZCBweXJhbWlkYWwgc2hhcGUgb2YgdGhlIGhvcHBlclxyXG4gICAgICBjb25zdCBob3BwZXJTaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG5cclxuICAgICAgLy8gY3JlYXRlIGEgc21hbGwgcmltIGF0IHRoZSBib3R0b20gdGhlIGhvcHBlclxyXG4gICAgICBjb25zdCByaW1TaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG5cclxuICAgICAgY29uc3QgYm90dG9tV2lkdGggPSBvcHRpb25zLmJvdHRvbVdpZHRoICogMTEgLyAoIDUgKyBNYXRoLm1pbiggNiwgbnVtYmVyT2ZSb3dzICkgKTtcclxuICAgICAgaG9wcGVyU2hhcGUubW92ZVRvKCAwLCAwIClcclxuICAgICAgICAubGluZVRvKCAtYm90dG9tV2lkdGggLyAyLCAwIClcclxuICAgICAgICAubGluZVRvKCAtYm90dG9tV2lkdGggLyAyIC0gZXh0cmFTcGFjZSwgLW9wdGlvbnMuaG9wcGVyVGhpY2tuZXNzIClcclxuICAgICAgICAubGluZVRvKCBib3R0b21XaWR0aCAvIDIgKyBleHRyYVNwYWNlLCAtb3B0aW9ucy5ob3BwZXJUaGlja25lc3MgKVxyXG4gICAgICAgIC5saW5lVG8oIGJvdHRvbVdpZHRoIC8gMiwgMCApXHJcbiAgICAgICAgLmNsb3NlKCk7XHJcblxyXG4gICAgICByaW1TaGFwZS5tb3ZlVG8oIDAsIDAgKVxyXG4gICAgICAgIC5saW5lVG8oIC1ib3R0b21XaWR0aCAvIDIsIDAgKVxyXG4gICAgICAgIC5saW5lVG8oIC1ib3R0b21XaWR0aCAvIDIsIG9wdGlvbnMucmltVGhpY2tuZXNzIClcclxuICAgICAgICAubGluZVRvKCBib3R0b21XaWR0aCAvIDIsIG9wdGlvbnMucmltVGhpY2tuZXNzIClcclxuICAgICAgICAubGluZVRvKCBib3R0b21XaWR0aCAvIDIsIDAgKVxyXG4gICAgICAgIC5jbG9zZSgpO1xyXG5cclxuICAgICAgLy8gYWRkIHRoZSBob3BwZXIgYW5kIHRoZSByaW0uXHJcbiAgICAgIGNvbnN0IGhvcHBlclBhdGggPSBuZXcgUGF0aCggaG9wcGVyU2hhcGUsIHsgZmlsbDogaG9wcGVyUmVjdGFuZ2xlR3JhZGllbnQgfSApO1xyXG4gICAgICBjb25zdCByaW1QYXRoID0gbmV3IFBhdGgoIHJpbVNoYXBlLCB7IGZpbGw6IHJpbVJlY3RhbmdsZUdyYWRpZW50IH0gKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggaG9wcGVyUGF0aCApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCByaW1QYXRoICk7XHJcblxyXG4gICAgfSApO1xyXG4gICAgLy8gcGFzcyBvcHRpb25zIHRocm91Z2ggdG8gdGhlIHBhcmVudCBjbGFzcy5cclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5wbGlua29Qcm9iYWJpbGl0eS5yZWdpc3RlciggJ0hvcHBlcicsIEhvcHBlciAp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