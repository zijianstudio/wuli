// Copyright 2013-2022, University of Colorado Boulder

/**
 * This type represents a mystery mass in the view.
 *
 * @author John Blanco
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Rectangle, Text } from '../../../../scenery/js/imports.js';
import balancingAct from '../../balancingAct.js';
import ImageMassNode from './ImageMassNode.js';

// constants
const INSET_PROPORTION = 0.25;
class MysteryMassNode extends ImageMassNode {
  /**
   * @param {Mass} mass
   * @param {ModelViewTransform2} modelViewTransform
   * @param {boolean} isLabeled
   * @param {Property} massLabelVisibleProperty
   * @param {boolean} draggable
   * @param {EnumerationDeprecatedProperty.<ColumnState>} columnStateProperty
   */
  constructor(mass, modelViewTransform, isLabeled, massLabelVisibleProperty, draggable, columnStateProperty) {
    super(mass, modelViewTransform, isLabeled, massLabelVisibleProperty, draggable, columnStateProperty);
    const inset = this.imageNode.width * INSET_PROPORTION;

    // Create the label.
    const labelText = new Text(mass.labelText, {
      font: new PhetFont({
        size: 12,
        weight: 'bold'
      })
    });
    const dimension = Math.max(labelText.width, labelText.height);
    const label = new Rectangle(0, 0, dimension, dimension, 3, 3, {
      fill: 'white',
      stroke: 'black',
      lineWidth: 1
    });
    label.addChild(labelText.mutate({
      centerX: label.centerX,
      centerY: label.centerY
    }));

    // Scale the label to fit.
    const widthScale = (this.imageNode.width - 2 * inset) / label.width;
    const heightScale = (this.imageNode.height - 2 * inset) / label.height;
    label.scale(Math.min(widthScale, heightScale));

    // Position the label on the image.  TWEAK WARNING - These labels are
    // positioned a little below the center because it looked better on the
    // initial set of mystery masses.  May require adjustment if the artwork
    // for the mystery masses changes.
    label.centerX = this.imageNode.centerX;
    label.centerY = this.imageNode.centerY + this.imageNode.height * 0.2;

    // Add the label as a child.
    this.addChild(label);
  }
}
balancingAct.register('MysteryMassNode', MysteryMassNode);
export default MysteryMassNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0Rm9udCIsIlJlY3RhbmdsZSIsIlRleHQiLCJiYWxhbmNpbmdBY3QiLCJJbWFnZU1hc3NOb2RlIiwiSU5TRVRfUFJPUE9SVElPTiIsIk15c3RlcnlNYXNzTm9kZSIsImNvbnN0cnVjdG9yIiwibWFzcyIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImlzTGFiZWxlZCIsIm1hc3NMYWJlbFZpc2libGVQcm9wZXJ0eSIsImRyYWdnYWJsZSIsImNvbHVtblN0YXRlUHJvcGVydHkiLCJpbnNldCIsImltYWdlTm9kZSIsIndpZHRoIiwibGFiZWxUZXh0IiwiZm9udCIsInNpemUiLCJ3ZWlnaHQiLCJkaW1lbnNpb24iLCJNYXRoIiwibWF4IiwiaGVpZ2h0IiwibGFiZWwiLCJmaWxsIiwic3Ryb2tlIiwibGluZVdpZHRoIiwiYWRkQ2hpbGQiLCJtdXRhdGUiLCJjZW50ZXJYIiwiY2VudGVyWSIsIndpZHRoU2NhbGUiLCJoZWlnaHRTY2FsZSIsInNjYWxlIiwibWluIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNeXN0ZXJ5TWFzc05vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhpcyB0eXBlIHJlcHJlc2VudHMgYSBteXN0ZXJ5IG1hc3MgaW4gdGhlIHZpZXcuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgUmVjdGFuZ2xlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGJhbGFuY2luZ0FjdCBmcm9tICcuLi8uLi9iYWxhbmNpbmdBY3QuanMnO1xyXG5pbXBvcnQgSW1hZ2VNYXNzTm9kZSBmcm9tICcuL0ltYWdlTWFzc05vZGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IElOU0VUX1BST1BPUlRJT04gPSAwLjI1O1xyXG5cclxuY2xhc3MgTXlzdGVyeU1hc3NOb2RlIGV4dGVuZHMgSW1hZ2VNYXNzTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TWFzc30gbWFzc1xyXG4gICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0xhYmVsZWRcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5fSBtYXNzTGFiZWxWaXNpYmxlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGRyYWdnYWJsZVxyXG4gICAqIEBwYXJhbSB7RW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkuPENvbHVtblN0YXRlPn0gY29sdW1uU3RhdGVQcm9wZXJ0eVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtYXNzLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIGlzTGFiZWxlZCwgbWFzc0xhYmVsVmlzaWJsZVByb3BlcnR5LCBkcmFnZ2FibGUsIGNvbHVtblN0YXRlUHJvcGVydHkgKSB7XHJcbiAgICBzdXBlciggbWFzcywgbW9kZWxWaWV3VHJhbnNmb3JtLCBpc0xhYmVsZWQsIG1hc3NMYWJlbFZpc2libGVQcm9wZXJ0eSwgZHJhZ2dhYmxlLCBjb2x1bW5TdGF0ZVByb3BlcnR5ICk7XHJcbiAgICBjb25zdCBpbnNldCA9IHRoaXMuaW1hZ2VOb2RlLndpZHRoICogSU5TRVRfUFJPUE9SVElPTjtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGxhYmVsLlxyXG4gICAgY29uc3QgbGFiZWxUZXh0ID0gbmV3IFRleHQoIG1hc3MubGFiZWxUZXh0LCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAxMiwgd2VpZ2h0OiAnYm9sZCcgfSApIH0gKTtcclxuICAgIGNvbnN0IGRpbWVuc2lvbiA9IE1hdGgubWF4KCBsYWJlbFRleHQud2lkdGgsIGxhYmVsVGV4dC5oZWlnaHQgKTtcclxuICAgIGNvbnN0IGxhYmVsID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgZGltZW5zaW9uLCBkaW1lbnNpb24sIDMsIDMsXHJcbiAgICAgIHtcclxuICAgICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgICBsaW5lV2lkdGg6IDFcclxuICAgICAgfSApO1xyXG4gICAgbGFiZWwuYWRkQ2hpbGQoIGxhYmVsVGV4dC5tdXRhdGUoIHsgY2VudGVyWDogbGFiZWwuY2VudGVyWCwgY2VudGVyWTogbGFiZWwuY2VudGVyWSB9ICkgKTtcclxuXHJcbiAgICAvLyBTY2FsZSB0aGUgbGFiZWwgdG8gZml0LlxyXG4gICAgY29uc3Qgd2lkdGhTY2FsZSA9ICggdGhpcy5pbWFnZU5vZGUud2lkdGggLSAoIDIgKiBpbnNldCApICkgLyBsYWJlbC53aWR0aDtcclxuICAgIGNvbnN0IGhlaWdodFNjYWxlID0gKCB0aGlzLmltYWdlTm9kZS5oZWlnaHQgLSAoIDIgKiBpbnNldCApICkgLyBsYWJlbC5oZWlnaHQ7XHJcbiAgICBsYWJlbC5zY2FsZSggTWF0aC5taW4oIHdpZHRoU2NhbGUsIGhlaWdodFNjYWxlICkgKTtcclxuXHJcbiAgICAvLyBQb3NpdGlvbiB0aGUgbGFiZWwgb24gdGhlIGltYWdlLiAgVFdFQUsgV0FSTklORyAtIFRoZXNlIGxhYmVscyBhcmVcclxuICAgIC8vIHBvc2l0aW9uZWQgYSBsaXR0bGUgYmVsb3cgdGhlIGNlbnRlciBiZWNhdXNlIGl0IGxvb2tlZCBiZXR0ZXIgb24gdGhlXHJcbiAgICAvLyBpbml0aWFsIHNldCBvZiBteXN0ZXJ5IG1hc3Nlcy4gIE1heSByZXF1aXJlIGFkanVzdG1lbnQgaWYgdGhlIGFydHdvcmtcclxuICAgIC8vIGZvciB0aGUgbXlzdGVyeSBtYXNzZXMgY2hhbmdlcy5cclxuICAgIGxhYmVsLmNlbnRlclggPSB0aGlzLmltYWdlTm9kZS5jZW50ZXJYO1xyXG4gICAgbGFiZWwuY2VudGVyWSA9IHRoaXMuaW1hZ2VOb2RlLmNlbnRlclkgKyB0aGlzLmltYWdlTm9kZS5oZWlnaHQgKiAwLjI7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBsYWJlbCBhcyBhIGNoaWxkLlxyXG4gICAgdGhpcy5hZGRDaGlsZCggbGFiZWwgKTtcclxuICB9XHJcbn1cclxuXHJcbmJhbGFuY2luZ0FjdC5yZWdpc3RlciggJ015c3RlcnlNYXNzTm9kZScsIE15c3RlcnlNYXNzTm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTXlzdGVyeU1hc3NOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLFNBQVMsRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUNuRSxPQUFPQyxZQUFZLE1BQU0sdUJBQXVCO0FBQ2hELE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7O0FBRTlDO0FBQ0EsTUFBTUMsZ0JBQWdCLEdBQUcsSUFBSTtBQUU3QixNQUFNQyxlQUFlLFNBQVNGLGFBQWEsQ0FBQztFQUUxQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VHLFdBQVdBLENBQUVDLElBQUksRUFBRUMsa0JBQWtCLEVBQUVDLFNBQVMsRUFBRUMsd0JBQXdCLEVBQUVDLFNBQVMsRUFBRUMsbUJBQW1CLEVBQUc7SUFDM0csS0FBSyxDQUFFTCxJQUFJLEVBQUVDLGtCQUFrQixFQUFFQyxTQUFTLEVBQUVDLHdCQUF3QixFQUFFQyxTQUFTLEVBQUVDLG1CQUFvQixDQUFDO0lBQ3RHLE1BQU1DLEtBQUssR0FBRyxJQUFJLENBQUNDLFNBQVMsQ0FBQ0MsS0FBSyxHQUFHWCxnQkFBZ0I7O0lBRXJEO0lBQ0EsTUFBTVksU0FBUyxHQUFHLElBQUlmLElBQUksQ0FBRU0sSUFBSSxDQUFDUyxTQUFTLEVBQUU7TUFBRUMsSUFBSSxFQUFFLElBQUlsQixRQUFRLENBQUU7UUFBRW1CLElBQUksRUFBRSxFQUFFO1FBQUVDLE1BQU0sRUFBRTtNQUFPLENBQUU7SUFBRSxDQUFFLENBQUM7SUFDcEcsTUFBTUMsU0FBUyxHQUFHQyxJQUFJLENBQUNDLEdBQUcsQ0FBRU4sU0FBUyxDQUFDRCxLQUFLLEVBQUVDLFNBQVMsQ0FBQ08sTUFBTyxDQUFDO0lBQy9ELE1BQU1DLEtBQUssR0FBRyxJQUFJeEIsU0FBUyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVvQixTQUFTLEVBQUVBLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUMzRDtNQUNFSyxJQUFJLEVBQUUsT0FBTztNQUNiQyxNQUFNLEVBQUUsT0FBTztNQUNmQyxTQUFTLEVBQUU7SUFDYixDQUFFLENBQUM7SUFDTEgsS0FBSyxDQUFDSSxRQUFRLENBQUVaLFNBQVMsQ0FBQ2EsTUFBTSxDQUFFO01BQUVDLE9BQU8sRUFBRU4sS0FBSyxDQUFDTSxPQUFPO01BQUVDLE9BQU8sRUFBRVAsS0FBSyxDQUFDTztJQUFRLENBQUUsQ0FBRSxDQUFDOztJQUV4RjtJQUNBLE1BQU1DLFVBQVUsR0FBRyxDQUFFLElBQUksQ0FBQ2xCLFNBQVMsQ0FBQ0MsS0FBSyxHQUFLLENBQUMsR0FBR0YsS0FBTyxJQUFLVyxLQUFLLENBQUNULEtBQUs7SUFDekUsTUFBTWtCLFdBQVcsR0FBRyxDQUFFLElBQUksQ0FBQ25CLFNBQVMsQ0FBQ1MsTUFBTSxHQUFLLENBQUMsR0FBR1YsS0FBTyxJQUFLVyxLQUFLLENBQUNELE1BQU07SUFDNUVDLEtBQUssQ0FBQ1UsS0FBSyxDQUFFYixJQUFJLENBQUNjLEdBQUcsQ0FBRUgsVUFBVSxFQUFFQyxXQUFZLENBQUUsQ0FBQzs7SUFFbEQ7SUFDQTtJQUNBO0lBQ0E7SUFDQVQsS0FBSyxDQUFDTSxPQUFPLEdBQUcsSUFBSSxDQUFDaEIsU0FBUyxDQUFDZ0IsT0FBTztJQUN0Q04sS0FBSyxDQUFDTyxPQUFPLEdBQUcsSUFBSSxDQUFDakIsU0FBUyxDQUFDaUIsT0FBTyxHQUFHLElBQUksQ0FBQ2pCLFNBQVMsQ0FBQ1MsTUFBTSxHQUFHLEdBQUc7O0lBRXBFO0lBQ0EsSUFBSSxDQUFDSyxRQUFRLENBQUVKLEtBQU0sQ0FBQztFQUN4QjtBQUNGO0FBRUF0QixZQUFZLENBQUNrQyxRQUFRLENBQUUsaUJBQWlCLEVBQUUvQixlQUFnQixDQUFDO0FBRTNELGVBQWVBLGVBQWUifQ==