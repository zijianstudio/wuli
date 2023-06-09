// Copyright 2018-2022, University of Colorado Boulder

/**
 * Displays the color perceived by the viewer in a set of cartoon-like 'thought bubbles'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { Path } from '../../../../scenery/js/imports.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import colorVision from '../../colorVision.js';
import PerceivedColorSoundGenerator from './PerceivedColorSoundGenerator.js';
class PerceivedColorNode extends Path {
  /**
   * @param {Property.<Color>} perceivedColorProperty
   * @param {Property.<boolean>} simPlayingProperty
   * @param {Object} [options]
   */
  constructor(perceivedColorProperty, simPlayingProperty, options) {
    options = merge({
      lineWidth: 0.5,
      stroke: '#c0b9b9' // gray
    }, options);

    // four thought bubbles, described from largest to smallest
    const shape = new Shape().ellipse(0, 0, 90, 45, 0).newSubpath().ellipse(-130, 45, 30, 15, 0).newSubpath().ellipse(-158, 105, 24, 12, 0).newSubpath().ellipse(-170, 160, 14, 7, 0);
    super(shape, options);
    perceivedColorProperty.linkAttribute(this, 'fill');

    // sound generation
    soundManager.addSoundGenerator(new PerceivedColorSoundGenerator(perceivedColorProperty, {
      initialOutputLevel: 0.1,
      enableControlProperties: [simPlayingProperty]
    }), {
      associatedViewNode: this
    });
  }
}
colorVision.register('PerceivedColorNode', PerceivedColorNode);
export default PerceivedColorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIm1lcmdlIiwiUGF0aCIsInNvdW5kTWFuYWdlciIsImNvbG9yVmlzaW9uIiwiUGVyY2VpdmVkQ29sb3JTb3VuZEdlbmVyYXRvciIsIlBlcmNlaXZlZENvbG9yTm9kZSIsImNvbnN0cnVjdG9yIiwicGVyY2VpdmVkQ29sb3JQcm9wZXJ0eSIsInNpbVBsYXlpbmdQcm9wZXJ0eSIsIm9wdGlvbnMiLCJsaW5lV2lkdGgiLCJzdHJva2UiLCJzaGFwZSIsImVsbGlwc2UiLCJuZXdTdWJwYXRoIiwibGlua0F0dHJpYnV0ZSIsImFkZFNvdW5kR2VuZXJhdG9yIiwiaW5pdGlhbE91dHB1dExldmVsIiwiZW5hYmxlQ29udHJvbFByb3BlcnRpZXMiLCJhc3NvY2lhdGVkVmlld05vZGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBlcmNlaXZlZENvbG9yTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEaXNwbGF5cyB0aGUgY29sb3IgcGVyY2VpdmVkIGJ5IHRoZSB2aWV3ZXIgaW4gYSBzZXQgb2YgY2FydG9vbi1saWtlICd0aG91Z2h0IGJ1YmJsZXMnLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgc291bmRNYW5hZ2VyIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kTWFuYWdlci5qcyc7XHJcbmltcG9ydCBjb2xvclZpc2lvbiBmcm9tICcuLi8uLi9jb2xvclZpc2lvbi5qcyc7XHJcbmltcG9ydCBQZXJjZWl2ZWRDb2xvclNvdW5kR2VuZXJhdG9yIGZyb20gJy4vUGVyY2VpdmVkQ29sb3JTb3VuZEdlbmVyYXRvci5qcyc7XHJcblxyXG5jbGFzcyBQZXJjZWl2ZWRDb2xvck5vZGUgZXh0ZW5kcyBQYXRoIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Q29sb3I+fSBwZXJjZWl2ZWRDb2xvclByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHNpbVBsYXlpbmdQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcGVyY2VpdmVkQ29sb3JQcm9wZXJ0eSwgc2ltUGxheWluZ1Byb3BlcnR5LCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBsaW5lV2lkdGg6IDAuNSxcclxuICAgICAgc3Ryb2tlOiAnI2MwYjliOScgLy8gZ3JheVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIGZvdXIgdGhvdWdodCBidWJibGVzLCBkZXNjcmliZWQgZnJvbSBsYXJnZXN0IHRvIHNtYWxsZXN0XHJcbiAgICBjb25zdCBzaGFwZSA9IG5ldyBTaGFwZSgpXHJcbiAgICAgIC5lbGxpcHNlKCAwLCAwLCA5MCwgNDUsIDAgKVxyXG4gICAgICAubmV3U3VicGF0aCgpXHJcbiAgICAgIC5lbGxpcHNlKCAtMTMwLCA0NSwgMzAsIDE1LCAwIClcclxuICAgICAgLm5ld1N1YnBhdGgoKVxyXG4gICAgICAuZWxsaXBzZSggLTE1OCwgMTA1LCAyNCwgMTIsIDAgKVxyXG4gICAgICAubmV3U3VicGF0aCgpXHJcbiAgICAgIC5lbGxpcHNlKCAtMTcwLCAxNjAsIDE0LCA3LCAwICk7XHJcblxyXG4gICAgc3VwZXIoIHNoYXBlLCBvcHRpb25zICk7XHJcblxyXG4gICAgcGVyY2VpdmVkQ29sb3JQcm9wZXJ0eS5saW5rQXR0cmlidXRlKCB0aGlzLCAnZmlsbCcgKTtcclxuXHJcbiAgICAvLyBzb3VuZCBnZW5lcmF0aW9uXHJcbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoXHJcbiAgICAgIG5ldyBQZXJjZWl2ZWRDb2xvclNvdW5kR2VuZXJhdG9yKCBwZXJjZWl2ZWRDb2xvclByb3BlcnR5LCB7XHJcbiAgICAgICAgaW5pdGlhbE91dHB1dExldmVsOiAwLjEsXHJcbiAgICAgICAgZW5hYmxlQ29udHJvbFByb3BlcnRpZXM6IFsgc2ltUGxheWluZ1Byb3BlcnR5IF1cclxuICAgICAgfSApLFxyXG4gICAgICB7IGFzc29jaWF0ZWRWaWV3Tm9kZTogdGhpcyB9XHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuY29sb3JWaXNpb24ucmVnaXN0ZXIoICdQZXJjZWl2ZWRDb2xvck5vZGUnLCBQZXJjZWl2ZWRDb2xvck5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBlcmNlaXZlZENvbG9yTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLElBQUksUUFBUSxtQ0FBbUM7QUFDeEQsT0FBT0MsWUFBWSxNQUFNLHNDQUFzQztBQUMvRCxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLDRCQUE0QixNQUFNLG1DQUFtQztBQUU1RSxNQUFNQyxrQkFBa0IsU0FBU0osSUFBSSxDQUFDO0VBRXBDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUssV0FBV0EsQ0FBRUMsc0JBQXNCLEVBQUVDLGtCQUFrQixFQUFFQyxPQUFPLEVBQUc7SUFFakVBLE9BQU8sR0FBR1QsS0FBSyxDQUFFO01BQ2ZVLFNBQVMsRUFBRSxHQUFHO01BQ2RDLE1BQU0sRUFBRSxTQUFTLENBQUM7SUFDcEIsQ0FBQyxFQUFFRixPQUFRLENBQUM7O0lBRVo7SUFDQSxNQUFNRyxLQUFLLEdBQUcsSUFBSWIsS0FBSyxDQUFDLENBQUMsQ0FDdEJjLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxDQUFDLENBQzFCQyxVQUFVLENBQUMsQ0FBQyxDQUNaRCxPQUFPLENBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxDQUFDLENBQzlCQyxVQUFVLENBQUMsQ0FBQyxDQUNaRCxPQUFPLENBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxDQUFDLENBQy9CQyxVQUFVLENBQUMsQ0FBQyxDQUNaRCxPQUFPLENBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0lBRWpDLEtBQUssQ0FBRUQsS0FBSyxFQUFFSCxPQUFRLENBQUM7SUFFdkJGLHNCQUFzQixDQUFDUSxhQUFhLENBQUUsSUFBSSxFQUFFLE1BQU8sQ0FBQzs7SUFFcEQ7SUFDQWIsWUFBWSxDQUFDYyxpQkFBaUIsQ0FDNUIsSUFBSVosNEJBQTRCLENBQUVHLHNCQUFzQixFQUFFO01BQ3hEVSxrQkFBa0IsRUFBRSxHQUFHO01BQ3ZCQyx1QkFBdUIsRUFBRSxDQUFFVixrQkFBa0I7SUFDL0MsQ0FBRSxDQUFDLEVBQ0g7TUFBRVcsa0JBQWtCLEVBQUU7SUFBSyxDQUM3QixDQUFDO0VBQ0g7QUFDRjtBQUVBaEIsV0FBVyxDQUFDaUIsUUFBUSxDQUFFLG9CQUFvQixFQUFFZixrQkFBbUIsQ0FBQztBQUVoRSxlQUFlQSxrQkFBa0IifQ==