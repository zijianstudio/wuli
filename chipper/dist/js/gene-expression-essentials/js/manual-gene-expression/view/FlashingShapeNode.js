// Copyright 2015-2022, University of Colorado Boulder

/**
 * Node that has a shape and that can be set up to flash in a number of different ways.
 *
 * @author Sharfudeen Ashraf
 * @author John Blanco
 * @author Aadish Gupta
 */

import merge from '../../../../phet-core/js/merge.js';
import { Color, Node, Path } from '../../../../scenery/js/imports.js';
import geneExpressionEssentials from '../../geneExpressionEssentials.js';
import FlashController from './FlashController.js';

// constants
const INVISIBLE_COLOR = new Color(0, 0, 0, 0);
class FlashingShapeNode extends Node {
  /**
   * @param {Shape} shape
   * @param {Color} flashColor
   * @param {Object} [options]
   */
  constructor(shape, flashColor, options) {
    options = merge({
      onTime: 350,
      offTime: 350,
      numFlashes: 4,
      visibleAtStart: false,
      visibleAtEnd: true
    }, options);
    super();
    const flashingNode = new Path(shape, {
      fill: options.visibleAtStart ? flashColor : INVISIBLE_COLOR
    });
    this.addChild(flashingNode);
    this.flashController = new FlashController(flashingNode, INVISIBLE_COLOR, flashColor, options);
  }

  /**
   * @public
   */
  startFlashing() {
    this.flashController.restart();
  }

  /**
   * @public
   */
  forceFlashOff() {
    this.flashController.forceFlashOff();
  }
}
geneExpressionEssentials.register('FlashingShapeNode', FlashingShapeNode);
export default FlashingShapeNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkNvbG9yIiwiTm9kZSIsIlBhdGgiLCJnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMiLCJGbGFzaENvbnRyb2xsZXIiLCJJTlZJU0lCTEVfQ09MT1IiLCJGbGFzaGluZ1NoYXBlTm9kZSIsImNvbnN0cnVjdG9yIiwic2hhcGUiLCJmbGFzaENvbG9yIiwib3B0aW9ucyIsIm9uVGltZSIsIm9mZlRpbWUiLCJudW1GbGFzaGVzIiwidmlzaWJsZUF0U3RhcnQiLCJ2aXNpYmxlQXRFbmQiLCJmbGFzaGluZ05vZGUiLCJmaWxsIiwiYWRkQ2hpbGQiLCJmbGFzaENvbnRyb2xsZXIiLCJzdGFydEZsYXNoaW5nIiwicmVzdGFydCIsImZvcmNlRmxhc2hPZmYiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkZsYXNoaW5nU2hhcGVOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE5vZGUgdGhhdCBoYXMgYSBzaGFwZSBhbmQgdGhhdCBjYW4gYmUgc2V0IHVwIHRvIGZsYXNoIGluIGEgbnVtYmVyIG9mIGRpZmZlcmVudCB3YXlzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBBYWRpc2ggR3VwdGFcclxuICovXHJcblxyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIE5vZGUsIFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIGZyb20gJy4uLy4uL2dlbmVFeHByZXNzaW9uRXNzZW50aWFscy5qcyc7XHJcbmltcG9ydCBGbGFzaENvbnRyb2xsZXIgZnJvbSAnLi9GbGFzaENvbnRyb2xsZXIuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IElOVklTSUJMRV9DT0xPUiA9IG5ldyBDb2xvciggMCwgMCwgMCwgMCApO1xyXG5cclxuY2xhc3MgRmxhc2hpbmdTaGFwZU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcclxuICAgKiBAcGFyYW0ge0NvbG9yfSBmbGFzaENvbG9yXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBzaGFwZSwgZmxhc2hDb2xvciwgb3B0aW9ucyApIHtcclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBvblRpbWU6IDM1MCxcclxuICAgICAgb2ZmVGltZTogMzUwLFxyXG4gICAgICBudW1GbGFzaGVzOiA0LFxyXG4gICAgICB2aXNpYmxlQXRTdGFydDogZmFsc2UsXHJcbiAgICAgIHZpc2libGVBdEVuZDogdHJ1ZVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgY29uc3QgZmxhc2hpbmdOb2RlID0gbmV3IFBhdGgoIHNoYXBlLCB7XHJcbiAgICAgIGZpbGw6IG9wdGlvbnMudmlzaWJsZUF0U3RhcnQgPyBmbGFzaENvbG9yIDogSU5WSVNJQkxFX0NPTE9SXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBmbGFzaGluZ05vZGUgKTtcclxuICAgIHRoaXMuZmxhc2hDb250cm9sbGVyID0gbmV3IEZsYXNoQ29udHJvbGxlciggZmxhc2hpbmdOb2RlLCBJTlZJU0lCTEVfQ09MT1IsIGZsYXNoQ29sb3IsIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGFydEZsYXNoaW5nKCkge1xyXG4gICAgdGhpcy5mbGFzaENvbnRyb2xsZXIucmVzdGFydCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGZvcmNlRmxhc2hPZmYoKSB7XHJcbiAgICB0aGlzLmZsYXNoQ29udHJvbGxlci5mb3JjZUZsYXNoT2ZmKCk7XHJcbiAgfVxyXG59XHJcblxyXG5nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMucmVnaXN0ZXIoICdGbGFzaGluZ1NoYXBlTm9kZScsIEZsYXNoaW5nU2hhcGVOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBGbGFzaGluZ1NoYXBlTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDckUsT0FBT0Msd0JBQXdCLE1BQU0sbUNBQW1DO0FBQ3hFLE9BQU9DLGVBQWUsTUFBTSxzQkFBc0I7O0FBRWxEO0FBQ0EsTUFBTUMsZUFBZSxHQUFHLElBQUlMLEtBQUssQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7QUFFL0MsTUFBTU0saUJBQWlCLFNBQVNMLElBQUksQ0FBQztFQUVuQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VNLFdBQVdBLENBQUVDLEtBQUssRUFBRUMsVUFBVSxFQUFFQyxPQUFPLEVBQUc7SUFDeENBLE9BQU8sR0FBR1gsS0FBSyxDQUFFO01BQ2ZZLE1BQU0sRUFBRSxHQUFHO01BQ1hDLE9BQU8sRUFBRSxHQUFHO01BQ1pDLFVBQVUsRUFBRSxDQUFDO01BQ2JDLGNBQWMsRUFBRSxLQUFLO01BQ3JCQyxZQUFZLEVBQUU7SUFDaEIsQ0FBQyxFQUFFTCxPQUFRLENBQUM7SUFFWixLQUFLLENBQUMsQ0FBQztJQUVQLE1BQU1NLFlBQVksR0FBRyxJQUFJZCxJQUFJLENBQUVNLEtBQUssRUFBRTtNQUNwQ1MsSUFBSSxFQUFFUCxPQUFPLENBQUNJLGNBQWMsR0FBR0wsVUFBVSxHQUFHSjtJQUM5QyxDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNhLFFBQVEsQ0FBRUYsWUFBYSxDQUFDO0lBQzdCLElBQUksQ0FBQ0csZUFBZSxHQUFHLElBQUlmLGVBQWUsQ0FBRVksWUFBWSxFQUFFWCxlQUFlLEVBQUVJLFVBQVUsRUFBRUMsT0FBUSxDQUFDO0VBQ2xHOztFQUVBO0FBQ0Y7QUFDQTtFQUNFVSxhQUFhQSxDQUFBLEVBQUc7SUFDZCxJQUFJLENBQUNELGVBQWUsQ0FBQ0UsT0FBTyxDQUFDLENBQUM7RUFDaEM7O0VBRUE7QUFDRjtBQUNBO0VBQ0VDLGFBQWFBLENBQUEsRUFBRztJQUNkLElBQUksQ0FBQ0gsZUFBZSxDQUFDRyxhQUFhLENBQUMsQ0FBQztFQUN0QztBQUNGO0FBRUFuQix3QkFBd0IsQ0FBQ29CLFFBQVEsQ0FBRSxtQkFBbUIsRUFBRWpCLGlCQUFrQixDQUFDO0FBRTNFLGVBQWVBLGlCQUFpQiJ9