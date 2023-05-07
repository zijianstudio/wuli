// Copyright 2018-2022, University of Colorado Boulder

/**
 * For the water scene, shows one hose for each wave generator, each with its own on/off button. This implementation is
 * trivial and doesn't add state or methods, it simplifies readability at the call site, so we keep it as a convenience
 * constructor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import FaucetNode from '../../../../scenery-phet/js/FaucetNode.js';
import waveInterference from '../../waveInterference.js';
import WaveGeneratorNode from './WaveGeneratorNode.js';

// constants
// how far the water drops have to fall, tuned so the water drop initially peeks out from the faucet (by less
// than one frame)
const FAUCET_VERTICAL_OFFSET = -110;
class WaterWaveGeneratorNode extends WaveGeneratorNode {
  constructor(waterScene, waveAreaNode, isPrimarySource) {
    const faucetNode = new FaucetNode(
    // This value for maxFlowRate is irrelevant because we use our own faucet water emitting model,
    // but must be nonzero to prevent a divide by zero problem
    1,
    // Flow rate is managed by this simulation and not depicted by the FaucetNode
    new NumberProperty(0),
    // Faucet is enabled but not interactive
    new BooleanProperty(true), {
      interactiveProperty: new BooleanProperty(false),
      // Adjusted based on the dimension of the faucet image to align with the horizontal water drop position.
      // The vertical offset is adjusted with FAUCET_VERTICAL_OFFSET
      x: waterScene.getWaterDropX(),
      scale: 0.25,
      horizontalPipeLength: 1600,
      // Long enough that it still shows even for extreme aspect ratios

      // Overcome a flickering problems, see https://github.com/phetsims/wave-interference/issues/187
      rasterizeHorizontalPipeNode: true
    });
    super(waterScene, waveAreaNode, 62, isPrimarySource, faucetNode, FAUCET_VERTICAL_OFFSET, -7, true);
  }
}
waveInterference.register('WaterWaveGeneratorNode', WaterWaveGeneratorNode);
export default WaterWaveGeneratorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIkZhdWNldE5vZGUiLCJ3YXZlSW50ZXJmZXJlbmNlIiwiV2F2ZUdlbmVyYXRvck5vZGUiLCJGQVVDRVRfVkVSVElDQUxfT0ZGU0VUIiwiV2F0ZXJXYXZlR2VuZXJhdG9yTm9kZSIsImNvbnN0cnVjdG9yIiwid2F0ZXJTY2VuZSIsIndhdmVBcmVhTm9kZSIsImlzUHJpbWFyeVNvdXJjZSIsImZhdWNldE5vZGUiLCJpbnRlcmFjdGl2ZVByb3BlcnR5IiwieCIsImdldFdhdGVyRHJvcFgiLCJzY2FsZSIsImhvcml6b250YWxQaXBlTGVuZ3RoIiwicmFzdGVyaXplSG9yaXpvbnRhbFBpcGVOb2RlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJXYXRlcldhdmVHZW5lcmF0b3JOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEZvciB0aGUgd2F0ZXIgc2NlbmUsIHNob3dzIG9uZSBob3NlIGZvciBlYWNoIHdhdmUgZ2VuZXJhdG9yLCBlYWNoIHdpdGggaXRzIG93biBvbi9vZmYgYnV0dG9uLiBUaGlzIGltcGxlbWVudGF0aW9uIGlzXHJcbiAqIHRyaXZpYWwgYW5kIGRvZXNuJ3QgYWRkIHN0YXRlIG9yIG1ldGhvZHMsIGl0IHNpbXBsaWZpZXMgcmVhZGFiaWxpdHkgYXQgdGhlIGNhbGwgc2l0ZSwgc28gd2Uga2VlcCBpdCBhcyBhIGNvbnZlbmllbmNlXHJcbiAqIGNvbnN0cnVjdG9yLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBGYXVjZXROb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9GYXVjZXROb2RlLmpzJztcclxuaW1wb3J0IHdhdmVJbnRlcmZlcmVuY2UgZnJvbSAnLi4vLi4vd2F2ZUludGVyZmVyZW5jZS5qcyc7XHJcbmltcG9ydCBXYXRlclNjZW5lIGZyb20gJy4uL21vZGVsL1dhdGVyU2NlbmUuanMnO1xyXG5pbXBvcnQgV2F2ZUFyZWFOb2RlIGZyb20gJy4vV2F2ZUFyZWFOb2RlLmpzJztcclxuaW1wb3J0IFdhdmVHZW5lcmF0b3JOb2RlIGZyb20gJy4vV2F2ZUdlbmVyYXRvck5vZGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbi8vIGhvdyBmYXIgdGhlIHdhdGVyIGRyb3BzIGhhdmUgdG8gZmFsbCwgdHVuZWQgc28gdGhlIHdhdGVyIGRyb3AgaW5pdGlhbGx5IHBlZWtzIG91dCBmcm9tIHRoZSBmYXVjZXQgKGJ5IGxlc3NcclxuLy8gdGhhbiBvbmUgZnJhbWUpXHJcbmNvbnN0IEZBVUNFVF9WRVJUSUNBTF9PRkZTRVQgPSAtMTEwO1xyXG5cclxuY2xhc3MgV2F0ZXJXYXZlR2VuZXJhdG9yTm9kZSBleHRlbmRzIFdhdmVHZW5lcmF0b3JOb2RlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB3YXRlclNjZW5lOiBXYXRlclNjZW5lLCB3YXZlQXJlYU5vZGU6IFdhdmVBcmVhTm9kZSwgaXNQcmltYXJ5U291cmNlOiBib29sZWFuICkge1xyXG5cclxuICAgIGNvbnN0IGZhdWNldE5vZGUgPSBuZXcgRmF1Y2V0Tm9kZShcclxuICAgICAgLy8gVGhpcyB2YWx1ZSBmb3IgbWF4Rmxvd1JhdGUgaXMgaXJyZWxldmFudCBiZWNhdXNlIHdlIHVzZSBvdXIgb3duIGZhdWNldCB3YXRlciBlbWl0dGluZyBtb2RlbCxcclxuICAgICAgLy8gYnV0IG11c3QgYmUgbm9uemVybyB0byBwcmV2ZW50IGEgZGl2aWRlIGJ5IHplcm8gcHJvYmxlbVxyXG4gICAgICAxLFxyXG5cclxuICAgICAgLy8gRmxvdyByYXRlIGlzIG1hbmFnZWQgYnkgdGhpcyBzaW11bGF0aW9uIGFuZCBub3QgZGVwaWN0ZWQgYnkgdGhlIEZhdWNldE5vZGVcclxuICAgICAgbmV3IE51bWJlclByb3BlcnR5KCAwICksXHJcblxyXG4gICAgICAvLyBGYXVjZXQgaXMgZW5hYmxlZCBidXQgbm90IGludGVyYWN0aXZlXHJcbiAgICAgIG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKSwge1xyXG4gICAgICAgIGludGVyYWN0aXZlUHJvcGVydHk6IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICksXHJcblxyXG4gICAgICAgIC8vIEFkanVzdGVkIGJhc2VkIG9uIHRoZSBkaW1lbnNpb24gb2YgdGhlIGZhdWNldCBpbWFnZSB0byBhbGlnbiB3aXRoIHRoZSBob3Jpem9udGFsIHdhdGVyIGRyb3AgcG9zaXRpb24uXHJcbiAgICAgICAgLy8gVGhlIHZlcnRpY2FsIG9mZnNldCBpcyBhZGp1c3RlZCB3aXRoIEZBVUNFVF9WRVJUSUNBTF9PRkZTRVRcclxuICAgICAgICB4OiB3YXRlclNjZW5lLmdldFdhdGVyRHJvcFgoKSxcclxuICAgICAgICBzY2FsZTogMC4yNSxcclxuICAgICAgICBob3Jpem9udGFsUGlwZUxlbmd0aDogMTYwMCwgLy8gTG9uZyBlbm91Z2ggdGhhdCBpdCBzdGlsbCBzaG93cyBldmVuIGZvciBleHRyZW1lIGFzcGVjdCByYXRpb3NcclxuXHJcbiAgICAgICAgLy8gT3ZlcmNvbWUgYSBmbGlja2VyaW5nIHByb2JsZW1zLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3dhdmUtaW50ZXJmZXJlbmNlL2lzc3Vlcy8xODdcclxuICAgICAgICByYXN0ZXJpemVIb3Jpem9udGFsUGlwZU5vZGU6IHRydWVcclxuICAgICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCB3YXRlclNjZW5lLCB3YXZlQXJlYU5vZGUsIDYyLCBpc1ByaW1hcnlTb3VyY2UsIGZhdWNldE5vZGUsIEZBVUNFVF9WRVJUSUNBTF9PRkZTRVQsIC03LCB0cnVlICk7XHJcbiAgfVxyXG59XHJcblxyXG53YXZlSW50ZXJmZXJlbmNlLnJlZ2lzdGVyKCAnV2F0ZXJXYXZlR2VuZXJhdG9yTm9kZScsIFdhdGVyV2F2ZUdlbmVyYXRvck5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgV2F0ZXJXYXZlR2VuZXJhdG9yTm9kZTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsVUFBVSxNQUFNLDJDQUEyQztBQUNsRSxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFHeEQsT0FBT0MsaUJBQWlCLE1BQU0sd0JBQXdCOztBQUV0RDtBQUNBO0FBQ0E7QUFDQSxNQUFNQyxzQkFBc0IsR0FBRyxDQUFDLEdBQUc7QUFFbkMsTUFBTUMsc0JBQXNCLFNBQVNGLGlCQUFpQixDQUFDO0VBRTlDRyxXQUFXQSxDQUFFQyxVQUFzQixFQUFFQyxZQUEwQixFQUFFQyxlQUF3QixFQUFHO0lBRWpHLE1BQU1DLFVBQVUsR0FBRyxJQUFJVCxVQUFVO0lBQy9CO0lBQ0E7SUFDQSxDQUFDO0lBRUQ7SUFDQSxJQUFJRCxjQUFjLENBQUUsQ0FBRSxDQUFDO0lBRXZCO0lBQ0EsSUFBSUQsZUFBZSxDQUFFLElBQUssQ0FBQyxFQUFFO01BQzNCWSxtQkFBbUIsRUFBRSxJQUFJWixlQUFlLENBQUUsS0FBTSxDQUFDO01BRWpEO01BQ0E7TUFDQWEsQ0FBQyxFQUFFTCxVQUFVLENBQUNNLGFBQWEsQ0FBQyxDQUFDO01BQzdCQyxLQUFLLEVBQUUsSUFBSTtNQUNYQyxvQkFBb0IsRUFBRSxJQUFJO01BQUU7O01BRTVCO01BQ0FDLDJCQUEyQixFQUFFO0lBQy9CLENBQUUsQ0FBQztJQUVMLEtBQUssQ0FBRVQsVUFBVSxFQUFFQyxZQUFZLEVBQUUsRUFBRSxFQUFFQyxlQUFlLEVBQUVDLFVBQVUsRUFBRU4sc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSyxDQUFDO0VBQ3RHO0FBQ0Y7QUFFQUYsZ0JBQWdCLENBQUNlLFFBQVEsQ0FBRSx3QkFBd0IsRUFBRVosc0JBQXVCLENBQUM7QUFDN0UsZUFBZUEsc0JBQXNCIn0=