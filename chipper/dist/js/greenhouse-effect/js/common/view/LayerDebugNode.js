// Copyright 2021-2022, University of Colorado Boulder

/**
 * Node that represents a layer that absorbs and emits energy.  This is generally for debugging the behavior of the
 * model.
 *
 * TODO: Once the "real" node for these layers has been created, this may become obsolete.
 *
 * @author John Blanco
 */

import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import { Color, Line, Node } from '../../../../scenery/js/imports.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import EnergyAbsorbingEmittingLayer from '../model/EnergyAbsorbingEmittingLayer.js';
class LayerDebugNode extends Node {
  /**
   * @param layerModel
   * @param modelViewTransform
   * @param [providedOptions]
   */
  constructor(layerModel, modelViewTransform, providedOptions) {
    const options = optionize()({
      lineOptions: {
        stroke: Color.BLACK,
        lineWidth: 4
      }
    }, providedOptions);
    const centerY = modelViewTransform.modelToViewY(layerModel.altitude);
    const widthInView = modelViewTransform.modelToViewDeltaX(EnergyAbsorbingEmittingLayer.WIDTH);
    const line = new Line(0, centerY, widthInView, centerY, options.lineOptions);
    const numberDisplay = new NumberDisplay(layerModel.temperatureProperty, new Range(0, 700), {
      centerY: line.centerY,
      right: widthInView - 20,
      numberFormatter: number => `${Utils.toFixed(number, 2)} ${MathSymbols.DEGREES}K`
    });

    // supertype constructor
    super(combineOptions({
      children: [line, numberDisplay]
    }, options));
  }
}
greenhouseEffect.register('LayerDebugNode', LayerDebugNode);
export default LayerDebugNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIlV0aWxzIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJNYXRoU3ltYm9scyIsIk51bWJlckRpc3BsYXkiLCJDb2xvciIsIkxpbmUiLCJOb2RlIiwiZ3JlZW5ob3VzZUVmZmVjdCIsIkVuZXJneUFic29yYmluZ0VtaXR0aW5nTGF5ZXIiLCJMYXllckRlYnVnTm9kZSIsImNvbnN0cnVjdG9yIiwibGF5ZXJNb2RlbCIsIm1vZGVsVmlld1RyYW5zZm9ybSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJsaW5lT3B0aW9ucyIsInN0cm9rZSIsIkJMQUNLIiwibGluZVdpZHRoIiwiY2VudGVyWSIsIm1vZGVsVG9WaWV3WSIsImFsdGl0dWRlIiwid2lkdGhJblZpZXciLCJtb2RlbFRvVmlld0RlbHRhWCIsIldJRFRIIiwibGluZSIsIm51bWJlckRpc3BsYXkiLCJ0ZW1wZXJhdHVyZVByb3BlcnR5IiwicmlnaHQiLCJudW1iZXJGb3JtYXR0ZXIiLCJudW1iZXIiLCJ0b0ZpeGVkIiwiREVHUkVFUyIsImNoaWxkcmVuIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMYXllckRlYnVnTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBOb2RlIHRoYXQgcmVwcmVzZW50cyBhIGxheWVyIHRoYXQgYWJzb3JicyBhbmQgZW1pdHMgZW5lcmd5LiAgVGhpcyBpcyBnZW5lcmFsbHkgZm9yIGRlYnVnZ2luZyB0aGUgYmVoYXZpb3Igb2YgdGhlXHJcbiAqIG1vZGVsLlxyXG4gKlxyXG4gKiBUT0RPOiBPbmNlIHRoZSBcInJlYWxcIiBub2RlIGZvciB0aGVzZSBsYXllcnMgaGFzIGJlZW4gY3JlYXRlZCwgdGhpcyBtYXkgYmVjb21lIG9ic29sZXRlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IE1hdGhTeW1ib2xzIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYXRoU3ltYm9scy5qcyc7XHJcbmltcG9ydCBOdW1iZXJEaXNwbGF5IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9OdW1iZXJEaXNwbGF5LmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIExpbmUsIE5vZGUsIE5vZGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGdyZWVuaG91c2VFZmZlY3QgZnJvbSAnLi4vLi4vZ3JlZW5ob3VzZUVmZmVjdC5qcyc7XHJcbmltcG9ydCBFbmVyZ3lBYnNvcmJpbmdFbWl0dGluZ0xheWVyIGZyb20gJy4uL21vZGVsL0VuZXJneUFic29yYmluZ0VtaXR0aW5nTGF5ZXIuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBsaW5lT3B0aW9ucz86IHtcclxuICAgIHN0cm9rZT86IENvbG9yO1xyXG4gICAgbGluZVdpZHRoPzogbnVtYmVyO1xyXG4gIH07XHJcbn07XHJcbmV4cG9ydCB0eXBlIExheWVyRGVidWdOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZU9wdGlvbnM7XHJcblxyXG5jbGFzcyBMYXllckRlYnVnTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gbGF5ZXJNb2RlbFxyXG4gICAqIEBwYXJhbSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxheWVyTW9kZWw6IEVuZXJneUFic29yYmluZ0VtaXR0aW5nTGF5ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBMYXllckRlYnVnTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxMYXllckRlYnVnTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG4gICAgICBsaW5lT3B0aW9uczoge1xyXG4gICAgICAgIHN0cm9rZTogQ29sb3IuQkxBQ0ssXHJcbiAgICAgICAgbGluZVdpZHRoOiA0XHJcbiAgICAgIH1cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IGNlbnRlclkgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBsYXllck1vZGVsLmFsdGl0dWRlICk7XHJcbiAgICBjb25zdCB3aWR0aEluVmlldyA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWCggRW5lcmd5QWJzb3JiaW5nRW1pdHRpbmdMYXllci5XSURUSCApO1xyXG4gICAgY29uc3QgbGluZSA9IG5ldyBMaW5lKCAwLCBjZW50ZXJZLCB3aWR0aEluVmlldywgY2VudGVyWSwgb3B0aW9ucy5saW5lT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IG51bWJlckRpc3BsYXkgPSBuZXcgTnVtYmVyRGlzcGxheSggbGF5ZXJNb2RlbC50ZW1wZXJhdHVyZVByb3BlcnR5LCBuZXcgUmFuZ2UoIDAsIDcwMCApLCB7XHJcbiAgICAgIGNlbnRlclk6IGxpbmUuY2VudGVyWSxcclxuICAgICAgcmlnaHQ6IHdpZHRoSW5WaWV3IC0gMjAsXHJcbiAgICAgIG51bWJlckZvcm1hdHRlcjogKCBudW1iZXI6IG51bWJlciApID0+IGAke1V0aWxzLnRvRml4ZWQoIG51bWJlciwgMiApfSAke01hdGhTeW1ib2xzLkRFR1JFRVN9S2BcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBzdXBlcnR5cGUgY29uc3RydWN0b3JcclxuICAgIHN1cGVyKCBjb21iaW5lT3B0aW9uczxMYXllckRlYnVnTm9kZU9wdGlvbnM+KCB7IGNoaWxkcmVuOiBbIGxpbmUsIG51bWJlckRpc3BsYXkgXSB9LCBvcHRpb25zICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmdyZWVuaG91c2VFZmZlY3QucmVnaXN0ZXIoICdMYXllckRlYnVnTm9kZScsIExheWVyRGVidWdOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBMYXllckRlYnVnTm9kZTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxTQUFTLElBQUlDLGNBQWMsUUFBUSx1Q0FBdUM7QUFFakYsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxPQUFPQyxhQUFhLE1BQU0sOENBQThDO0FBQ3hFLFNBQVNDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQXFCLG1DQUFtQztBQUNsRixPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0MsNEJBQTRCLE1BQU0sMENBQTBDO0FBVW5GLE1BQU1DLGNBQWMsU0FBU0gsSUFBSSxDQUFDO0VBRWhDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDU0ksV0FBV0EsQ0FBRUMsVUFBd0MsRUFDeENDLGtCQUF1QyxFQUN2Q0MsZUFBdUMsRUFBRztJQUU1RCxNQUFNQyxPQUFPLEdBQUdkLFNBQVMsQ0FBa0QsQ0FBQyxDQUFFO01BQzVFZSxXQUFXLEVBQUU7UUFDWEMsTUFBTSxFQUFFWixLQUFLLENBQUNhLEtBQUs7UUFDbkJDLFNBQVMsRUFBRTtNQUNiO0lBQ0YsQ0FBQyxFQUFFTCxlQUFnQixDQUFDO0lBRXBCLE1BQU1NLE9BQU8sR0FBR1Asa0JBQWtCLENBQUNRLFlBQVksQ0FBRVQsVUFBVSxDQUFDVSxRQUFTLENBQUM7SUFDdEUsTUFBTUMsV0FBVyxHQUFHVixrQkFBa0IsQ0FBQ1csaUJBQWlCLENBQUVmLDRCQUE0QixDQUFDZ0IsS0FBTSxDQUFDO0lBQzlGLE1BQU1DLElBQUksR0FBRyxJQUFJcEIsSUFBSSxDQUFFLENBQUMsRUFBRWMsT0FBTyxFQUFFRyxXQUFXLEVBQUVILE9BQU8sRUFBRUwsT0FBTyxDQUFDQyxXQUFZLENBQUM7SUFFOUUsTUFBTVcsYUFBYSxHQUFHLElBQUl2QixhQUFhLENBQUVRLFVBQVUsQ0FBQ2dCLG1CQUFtQixFQUFFLElBQUk3QixLQUFLLENBQUUsQ0FBQyxFQUFFLEdBQUksQ0FBQyxFQUFFO01BQzVGcUIsT0FBTyxFQUFFTSxJQUFJLENBQUNOLE9BQU87TUFDckJTLEtBQUssRUFBRU4sV0FBVyxHQUFHLEVBQUU7TUFDdkJPLGVBQWUsRUFBSUMsTUFBYyxJQUFPLEdBQUUvQixLQUFLLENBQUNnQyxPQUFPLENBQUVELE1BQU0sRUFBRSxDQUFFLENBQUUsSUFBRzVCLFdBQVcsQ0FBQzhCLE9BQVE7SUFDOUYsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsS0FBSyxDQUFFL0IsY0FBYyxDQUF5QjtNQUFFZ0MsUUFBUSxFQUFFLENBQUVSLElBQUksRUFBRUMsYUFBYTtJQUFHLENBQUMsRUFBRVosT0FBUSxDQUFFLENBQUM7RUFDbEc7QUFDRjtBQUVBUCxnQkFBZ0IsQ0FBQzJCLFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRXpCLGNBQWUsQ0FBQztBQUU3RCxlQUFlQSxjQUFjIn0=