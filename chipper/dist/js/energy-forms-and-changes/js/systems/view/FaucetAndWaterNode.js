// Copyright 2016-2020, University of Colorado Boulder

/**
 * a scenery node that represents a faucet from which water flows
 *
 * @author John Blanco
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import FaucetNode from '../../../../scenery-phet/js/FaucetNode.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunkLayer from '../../common/view/EnergyChunkLayer.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import FaucetAndWater from '../model/FaucetAndWater.js';
import FallingWaterCanvasNode from './FallingWaterCanvasNode.js';
import MoveFadeModelElementNode from './MoveFadeModelElementNode.js';

// constants
const FAUCET_NODE_HORIZONTAL_LENGTH = 1400; // empirically determined to be long enough that end is generally not seen

class FaucetAndWaterNode extends MoveFadeModelElementNode {
  /**
   * @param {FaucetAndWater} faucet EnergySource
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Tandem} tandem
   */
  constructor(faucet, energyChunksVisibleProperty, modelViewTransform, tandem) {
    super(faucet, modelViewTransform, tandem);
    const fallingWaterOrigin = modelViewTransform.modelToViewDelta(FaucetAndWater.OFFSET_FROM_CENTER_TO_WATER_ORIGIN);

    // create the falling water drops and set position to its model offset
    this.fallingWaterCanvasNode = new FallingWaterCanvasNode(faucet.waterDrops, modelViewTransform, {
      canvasBounds: new Bounds2(-modelViewTransform.modelToViewDeltaX(FaucetAndWater.MAX_WATER_WIDTH), 0, modelViewTransform.modelToViewDeltaX(FaucetAndWater.MAX_WATER_WIDTH), EFACConstants.SCREEN_LAYOUT_BOUNDS.maxY),
      x: fallingWaterOrigin.x,
      y: fallingWaterOrigin.y
    });
    const faucetHeadOrigin = modelViewTransform.modelToViewDelta(FaucetAndWater.OFFSET_FROM_CENTER_TO_FAUCET_HEAD);
    const maxFlowProportion = 1.0;

    // create a mapping between the slider position and the flow proportion that prevents very small values
    this.faucetSettingProperty = new NumberProperty(0, {
      range: new Range(0, 1),
      tandem: tandem.createTandem('faucetSettingProperty')
    });
    this.faucetSettingProperty.link(setting => {
      const mappedSetting = setting === 0 ? 0 : 0.25 + setting * 0.75;
      faucet.flowProportionProperty.set(mappedSetting);
    });

    // create the faucet and set position to its model offset
    const faucetNode = new FaucetNode(maxFlowProportion, this.faucetSettingProperty, faucet.activeProperty, {
      horizontalPipeLength: FAUCET_NODE_HORIZONTAL_LENGTH,
      verticalPipeLength: 40,
      scale: 0.45,
      x: faucetHeadOrigin.x,
      y: faucetHeadOrigin.y,
      closeOnRelease: false,
      shooterOptions: {
        touchAreaXDilation: 77,
        touchAreaYDilation: 100
      },
      tandem: tandem.createTandem('faucetNode')
    });

    // create the energy chunk layer
    const energyChunkLayer = new EnergyChunkLayer(faucet.energyChunkList, modelViewTransform, {
      parentPositionProperty: faucet.positionProperty
    });
    this.addChild(this.fallingWaterCanvasNode);
    this.addChild(energyChunkLayer);
    this.addChild(faucetNode);

    // reset the valve when the faucet is deactivated
    faucet.activeProperty.link(active => {
      if (!active) {
        this.faucetSettingProperty.reset();
      }
    });
  }

  /**
   * @public
   * @param {number} dt - the change in time
   */
  step(dt) {
    this.fallingWaterCanvasNode.step(dt);
  }
}
energyFormsAndChanges.register('FaucetAndWaterNode', FaucetAndWaterNode);
export default FaucetAndWaterNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIkJvdW5kczIiLCJSYW5nZSIsIkZhdWNldE5vZGUiLCJFRkFDQ29uc3RhbnRzIiwiRW5lcmd5Q2h1bmtMYXllciIsImVuZXJneUZvcm1zQW5kQ2hhbmdlcyIsIkZhdWNldEFuZFdhdGVyIiwiRmFsbGluZ1dhdGVyQ2FudmFzTm9kZSIsIk1vdmVGYWRlTW9kZWxFbGVtZW50Tm9kZSIsIkZBVUNFVF9OT0RFX0hPUklaT05UQUxfTEVOR1RIIiwiRmF1Y2V0QW5kV2F0ZXJOb2RlIiwiY29uc3RydWN0b3IiLCJmYXVjZXQiLCJlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHkiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJ0YW5kZW0iLCJmYWxsaW5nV2F0ZXJPcmlnaW4iLCJtb2RlbFRvVmlld0RlbHRhIiwiT0ZGU0VUX0ZST01fQ0VOVEVSX1RPX1dBVEVSX09SSUdJTiIsImZhbGxpbmdXYXRlckNhbnZhc05vZGUiLCJ3YXRlckRyb3BzIiwiY2FudmFzQm91bmRzIiwibW9kZWxUb1ZpZXdEZWx0YVgiLCJNQVhfV0FURVJfV0lEVEgiLCJTQ1JFRU5fTEFZT1VUX0JPVU5EUyIsIm1heFkiLCJ4IiwieSIsImZhdWNldEhlYWRPcmlnaW4iLCJPRkZTRVRfRlJPTV9DRU5URVJfVE9fRkFVQ0VUX0hFQUQiLCJtYXhGbG93UHJvcG9ydGlvbiIsImZhdWNldFNldHRpbmdQcm9wZXJ0eSIsInJhbmdlIiwiY3JlYXRlVGFuZGVtIiwibGluayIsInNldHRpbmciLCJtYXBwZWRTZXR0aW5nIiwiZmxvd1Byb3BvcnRpb25Qcm9wZXJ0eSIsInNldCIsImZhdWNldE5vZGUiLCJhY3RpdmVQcm9wZXJ0eSIsImhvcml6b250YWxQaXBlTGVuZ3RoIiwidmVydGljYWxQaXBlTGVuZ3RoIiwic2NhbGUiLCJjbG9zZU9uUmVsZWFzZSIsInNob290ZXJPcHRpb25zIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwiZW5lcmd5Q2h1bmtMYXllciIsImVuZXJneUNodW5rTGlzdCIsInBhcmVudFBvc2l0aW9uUHJvcGVydHkiLCJwb3NpdGlvblByb3BlcnR5IiwiYWRkQ2hpbGQiLCJhY3RpdmUiLCJyZXNldCIsInN0ZXAiLCJkdCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRmF1Y2V0QW5kV2F0ZXJOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIGEgc2NlbmVyeSBub2RlIHRoYXQgcmVwcmVzZW50cyBhIGZhdWNldCBmcm9tIHdoaWNoIHdhdGVyIGZsb3dzXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IEZhdWNldE5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0ZhdWNldE5vZGUuanMnO1xyXG5pbXBvcnQgRUZBQ0NvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vRUZBQ0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBFbmVyZ3lDaHVua0xheWVyIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0VuZXJneUNodW5rTGF5ZXIuanMnO1xyXG5pbXBvcnQgZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIGZyb20gJy4uLy4uL2VuZXJneUZvcm1zQW5kQ2hhbmdlcy5qcyc7XHJcbmltcG9ydCBGYXVjZXRBbmRXYXRlciBmcm9tICcuLi9tb2RlbC9GYXVjZXRBbmRXYXRlci5qcyc7XHJcbmltcG9ydCBGYWxsaW5nV2F0ZXJDYW52YXNOb2RlIGZyb20gJy4vRmFsbGluZ1dhdGVyQ2FudmFzTm9kZS5qcyc7XHJcbmltcG9ydCBNb3ZlRmFkZU1vZGVsRWxlbWVudE5vZGUgZnJvbSAnLi9Nb3ZlRmFkZU1vZGVsRWxlbWVudE5vZGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEZBVUNFVF9OT0RFX0hPUklaT05UQUxfTEVOR1RIID0gMTQwMDsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byBiZSBsb25nIGVub3VnaCB0aGF0IGVuZCBpcyBnZW5lcmFsbHkgbm90IHNlZW5cclxuXHJcbmNsYXNzIEZhdWNldEFuZFdhdGVyTm9kZSBleHRlbmRzIE1vdmVGYWRlTW9kZWxFbGVtZW50Tm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RmF1Y2V0QW5kV2F0ZXJ9IGZhdWNldCBFbmVyZ3lTb3VyY2VcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGZhdWNldCwgZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHRhbmRlbSApIHtcclxuICAgIHN1cGVyKCBmYXVjZXQsIG1vZGVsVmlld1RyYW5zZm9ybSwgdGFuZGVtICk7XHJcblxyXG4gICAgY29uc3QgZmFsbGluZ1dhdGVyT3JpZ2luID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGEoIEZhdWNldEFuZFdhdGVyLk9GRlNFVF9GUk9NX0NFTlRFUl9UT19XQVRFUl9PUklHSU4gKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIGZhbGxpbmcgd2F0ZXIgZHJvcHMgYW5kIHNldCBwb3NpdGlvbiB0byBpdHMgbW9kZWwgb2Zmc2V0XHJcbiAgICB0aGlzLmZhbGxpbmdXYXRlckNhbnZhc05vZGUgPSBuZXcgRmFsbGluZ1dhdGVyQ2FudmFzTm9kZShcclxuICAgICAgZmF1Y2V0LndhdGVyRHJvcHMsXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAge1xyXG4gICAgICAgIGNhbnZhc0JvdW5kczogbmV3IEJvdW5kczIoXHJcbiAgICAgICAgICAtbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBGYXVjZXRBbmRXYXRlci5NQVhfV0FURVJfV0lEVEggKSxcclxuICAgICAgICAgIDAsXHJcbiAgICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVgoIEZhdWNldEFuZFdhdGVyLk1BWF9XQVRFUl9XSURUSCApLFxyXG4gICAgICAgICAgRUZBQ0NvbnN0YW50cy5TQ1JFRU5fTEFZT1VUX0JPVU5EUy5tYXhZXHJcbiAgICAgICAgKSxcclxuICAgICAgICB4OiBmYWxsaW5nV2F0ZXJPcmlnaW4ueCxcclxuICAgICAgICB5OiBmYWxsaW5nV2F0ZXJPcmlnaW4ueVxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGZhdWNldEhlYWRPcmlnaW4gPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YSggRmF1Y2V0QW5kV2F0ZXIuT0ZGU0VUX0ZST01fQ0VOVEVSX1RPX0ZBVUNFVF9IRUFEICk7XHJcbiAgICBjb25zdCBtYXhGbG93UHJvcG9ydGlvbiA9IDEuMDtcclxuXHJcbiAgICAvLyBjcmVhdGUgYSBtYXBwaW5nIGJldHdlZW4gdGhlIHNsaWRlciBwb3NpdGlvbiBhbmQgdGhlIGZsb3cgcHJvcG9ydGlvbiB0aGF0IHByZXZlbnRzIHZlcnkgc21hbGwgdmFsdWVzXHJcbiAgICB0aGlzLmZhdWNldFNldHRpbmdQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCAxICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZhdWNldFNldHRpbmdQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5mYXVjZXRTZXR0aW5nUHJvcGVydHkubGluayggc2V0dGluZyA9PiB7XHJcbiAgICAgIGNvbnN0IG1hcHBlZFNldHRpbmcgPSBzZXR0aW5nID09PSAwID8gMCA6IDAuMjUgKyAoIHNldHRpbmcgKiAwLjc1ICk7XHJcbiAgICAgIGZhdWNldC5mbG93UHJvcG9ydGlvblByb3BlcnR5LnNldCggbWFwcGVkU2V0dGluZyApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgZmF1Y2V0IGFuZCBzZXQgcG9zaXRpb24gdG8gaXRzIG1vZGVsIG9mZnNldFxyXG4gICAgY29uc3QgZmF1Y2V0Tm9kZSA9IG5ldyBGYXVjZXROb2RlKCBtYXhGbG93UHJvcG9ydGlvbiwgdGhpcy5mYXVjZXRTZXR0aW5nUHJvcGVydHksIGZhdWNldC5hY3RpdmVQcm9wZXJ0eSwge1xyXG4gICAgICBob3Jpem9udGFsUGlwZUxlbmd0aDogRkFVQ0VUX05PREVfSE9SSVpPTlRBTF9MRU5HVEgsXHJcbiAgICAgIHZlcnRpY2FsUGlwZUxlbmd0aDogNDAsXHJcbiAgICAgIHNjYWxlOiAwLjQ1LFxyXG4gICAgICB4OiBmYXVjZXRIZWFkT3JpZ2luLngsXHJcbiAgICAgIHk6IGZhdWNldEhlYWRPcmlnaW4ueSxcclxuICAgICAgY2xvc2VPblJlbGVhc2U6IGZhbHNlLFxyXG4gICAgICBzaG9vdGVyT3B0aW9uczoge1xyXG4gICAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogNzcsXHJcbiAgICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiAxMDBcclxuICAgICAgfSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZmF1Y2V0Tm9kZScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgZW5lcmd5IGNodW5rIGxheWVyXHJcbiAgICBjb25zdCBlbmVyZ3lDaHVua0xheWVyID0gbmV3IEVuZXJneUNodW5rTGF5ZXIoIGZhdWNldC5lbmVyZ3lDaHVua0xpc3QsIG1vZGVsVmlld1RyYW5zZm9ybSwge1xyXG4gICAgICBwYXJlbnRQb3NpdGlvblByb3BlcnR5OiBmYXVjZXQucG9zaXRpb25Qcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuZmFsbGluZ1dhdGVyQ2FudmFzTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZW5lcmd5Q2h1bmtMYXllciApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZmF1Y2V0Tm9kZSApO1xyXG5cclxuICAgIC8vIHJlc2V0IHRoZSB2YWx2ZSB3aGVuIHRoZSBmYXVjZXQgaXMgZGVhY3RpdmF0ZWRcclxuICAgIGZhdWNldC5hY3RpdmVQcm9wZXJ0eS5saW5rKCBhY3RpdmUgPT4ge1xyXG4gICAgICBpZiAoICFhY3RpdmUgKSB7XHJcbiAgICAgICAgdGhpcy5mYXVjZXRTZXR0aW5nUHJvcGVydHkucmVzZXQoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIHRoZSBjaGFuZ2UgaW4gdGltZVxyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgdGhpcy5mYWxsaW5nV2F0ZXJDYW52YXNOb2RlLnN0ZXAoIGR0ICk7XHJcbiAgfVxyXG59XHJcblxyXG5lbmVyZ3lGb3Jtc0FuZENoYW5nZXMucmVnaXN0ZXIoICdGYXVjZXRBbmRXYXRlck5vZGUnLCBGYXVjZXRBbmRXYXRlck5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgRmF1Y2V0QW5kV2F0ZXJOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGNB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