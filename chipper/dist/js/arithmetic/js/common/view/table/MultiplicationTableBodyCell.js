// Copyright 2014-2021, University of Colorado Boulder

/**
 * This Scenery node represents one cell in the body (as opposed to the headers) of the multiplication table.
 *
 * @author Andrey Zelenkov (MLearner)
 * @author John Blanco
 */

import merge from '../../../../../phet-core/js/merge.js';
import arithmetic from '../../../arithmetic.js';
import AbstractCell from './AbstractCell.js';

// constants
const HOVER_COLOR = 'rgb(238,253,77)';
const NORMAL_COLOR = 'rgb(50,70,255)';
const SELECT_COLOR = 'rgb(77,0,153)';
class MultiplicationTableBodyCell extends AbstractCell {
  /**
   * @param {Text} contentText - Text label for button.
   * @param {Object} backgroundOptions - Background options for button.
   */
  constructor(contentText, backgroundOptions) {
    backgroundOptions = merge({
      fill: NORMAL_COLOR
    }, backgroundOptions);
    super(backgroundOptions, {
      initiallyVisible: false
    });
    this.setText(contentText);
  }

  // @public - set cell into the state that indicates that the user is hovering over it
  setHover() {
    this.setBackgroundFill(HOVER_COLOR);
  }

  // @public - set cell to normal, default appearance state
  setNormal() {
    this.setBackgroundFill(NORMAL_COLOR);
  }

  // @public - set cell to the selected state
  setSelected() {
    this.setBackgroundFill(SELECT_COLOR);
  }
}
arithmetic.register('MultiplicationTableBodyCell', MultiplicationTableBodyCell);
export default MultiplicationTableBodyCell;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsImFyaXRobWV0aWMiLCJBYnN0cmFjdENlbGwiLCJIT1ZFUl9DT0xPUiIsIk5PUk1BTF9DT0xPUiIsIlNFTEVDVF9DT0xPUiIsIk11bHRpcGxpY2F0aW9uVGFibGVCb2R5Q2VsbCIsImNvbnN0cnVjdG9yIiwiY29udGVudFRleHQiLCJiYWNrZ3JvdW5kT3B0aW9ucyIsImZpbGwiLCJpbml0aWFsbHlWaXNpYmxlIiwic2V0VGV4dCIsInNldEhvdmVyIiwic2V0QmFja2dyb3VuZEZpbGwiLCJzZXROb3JtYWwiLCJzZXRTZWxlY3RlZCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTXVsdGlwbGljYXRpb25UYWJsZUJvZHlDZWxsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoaXMgU2NlbmVyeSBub2RlIHJlcHJlc2VudHMgb25lIGNlbGwgaW4gdGhlIGJvZHkgKGFzIG9wcG9zZWQgdG8gdGhlIGhlYWRlcnMpIG9mIHRoZSBtdWx0aXBsaWNhdGlvbiB0YWJsZS5cclxuICpcclxuICogQGF1dGhvciBBbmRyZXkgWmVsZW5rb3YgKE1MZWFybmVyKVxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBhcml0aG1ldGljIGZyb20gJy4uLy4uLy4uL2FyaXRobWV0aWMuanMnO1xyXG5pbXBvcnQgQWJzdHJhY3RDZWxsIGZyb20gJy4vQWJzdHJhY3RDZWxsLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBIT1ZFUl9DT0xPUiA9ICdyZ2IoMjM4LDI1Myw3NyknO1xyXG5jb25zdCBOT1JNQUxfQ09MT1IgPSAncmdiKDUwLDcwLDI1NSknO1xyXG5jb25zdCBTRUxFQ1RfQ09MT1IgPSAncmdiKDc3LDAsMTUzKSc7XHJcblxyXG5jbGFzcyBNdWx0aXBsaWNhdGlvblRhYmxlQm9keUNlbGwgZXh0ZW5kcyBBYnN0cmFjdENlbGwge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1RleHR9IGNvbnRlbnRUZXh0IC0gVGV4dCBsYWJlbCBmb3IgYnV0dG9uLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBiYWNrZ3JvdW5kT3B0aW9ucyAtIEJhY2tncm91bmQgb3B0aW9ucyBmb3IgYnV0dG9uLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjb250ZW50VGV4dCwgYmFja2dyb3VuZE9wdGlvbnMgKSB7XHJcbiAgICBiYWNrZ3JvdW5kT3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGZpbGw6IE5PUk1BTF9DT0xPUlxyXG4gICAgfSwgYmFja2dyb3VuZE9wdGlvbnMgKTtcclxuICAgIHN1cGVyKCBiYWNrZ3JvdW5kT3B0aW9ucywgeyBpbml0aWFsbHlWaXNpYmxlOiBmYWxzZSB9ICk7XHJcblxyXG4gICAgdGhpcy5zZXRUZXh0KCBjb250ZW50VGV4dCApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpYyAtIHNldCBjZWxsIGludG8gdGhlIHN0YXRlIHRoYXQgaW5kaWNhdGVzIHRoYXQgdGhlIHVzZXIgaXMgaG92ZXJpbmcgb3ZlciBpdFxyXG4gIHNldEhvdmVyKCkge1xyXG4gICAgdGhpcy5zZXRCYWNrZ3JvdW5kRmlsbCggSE9WRVJfQ09MT1IgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWMgLSBzZXQgY2VsbCB0byBub3JtYWwsIGRlZmF1bHQgYXBwZWFyYW5jZSBzdGF0ZVxyXG4gIHNldE5vcm1hbCgpIHtcclxuICAgIHRoaXMuc2V0QmFja2dyb3VuZEZpbGwoIE5PUk1BTF9DT0xPUiApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpYyAtIHNldCBjZWxsIHRvIHRoZSBzZWxlY3RlZCBzdGF0ZVxyXG4gIHNldFNlbGVjdGVkKCkge1xyXG4gICAgdGhpcy5zZXRCYWNrZ3JvdW5kRmlsbCggU0VMRUNUX0NPTE9SICk7XHJcbiAgfVxyXG59XHJcblxyXG5hcml0aG1ldGljLnJlZ2lzdGVyKCAnTXVsdGlwbGljYXRpb25UYWJsZUJvZHlDZWxsJywgTXVsdGlwbGljYXRpb25UYWJsZUJvZHlDZWxsICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNdWx0aXBsaWNhdGlvblRhYmxlQm9keUNlbGw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLHNDQUFzQztBQUN4RCxPQUFPQyxVQUFVLE1BQU0sd0JBQXdCO0FBQy9DLE9BQU9DLFlBQVksTUFBTSxtQkFBbUI7O0FBRTVDO0FBQ0EsTUFBTUMsV0FBVyxHQUFHLGlCQUFpQjtBQUNyQyxNQUFNQyxZQUFZLEdBQUcsZ0JBQWdCO0FBQ3JDLE1BQU1DLFlBQVksR0FBRyxlQUFlO0FBRXBDLE1BQU1DLDJCQUEyQixTQUFTSixZQUFZLENBQUM7RUFFckQ7QUFDRjtBQUNBO0FBQ0E7RUFDRUssV0FBV0EsQ0FBRUMsV0FBVyxFQUFFQyxpQkFBaUIsRUFBRztJQUM1Q0EsaUJBQWlCLEdBQUdULEtBQUssQ0FBRTtNQUN6QlUsSUFBSSxFQUFFTjtJQUNSLENBQUMsRUFBRUssaUJBQWtCLENBQUM7SUFDdEIsS0FBSyxDQUFFQSxpQkFBaUIsRUFBRTtNQUFFRSxnQkFBZ0IsRUFBRTtJQUFNLENBQUUsQ0FBQztJQUV2RCxJQUFJLENBQUNDLE9BQU8sQ0FBRUosV0FBWSxDQUFDO0VBQzdCOztFQUVBO0VBQ0FLLFFBQVFBLENBQUEsRUFBRztJQUNULElBQUksQ0FBQ0MsaUJBQWlCLENBQUVYLFdBQVksQ0FBQztFQUN2Qzs7RUFFQTtFQUNBWSxTQUFTQSxDQUFBLEVBQUc7SUFDVixJQUFJLENBQUNELGlCQUFpQixDQUFFVixZQUFhLENBQUM7RUFDeEM7O0VBRUE7RUFDQVksV0FBV0EsQ0FBQSxFQUFHO0lBQ1osSUFBSSxDQUFDRixpQkFBaUIsQ0FBRVQsWUFBYSxDQUFDO0VBQ3hDO0FBQ0Y7QUFFQUosVUFBVSxDQUFDZ0IsUUFBUSxDQUFFLDZCQUE2QixFQUFFWCwyQkFBNEIsQ0FBQztBQUVqRixlQUFlQSwyQkFBMkIifQ==