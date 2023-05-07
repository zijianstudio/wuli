// Copyright 2014-2021, University of Colorado Boulder

/**
 * Multiplication table header cell.
 *
 * @author Andrey Zelenkov (MLearner)
 */

import merge from '../../../../../phet-core/js/merge.js';
import arithmetic from '../../../arithmetic.js';
import AbstractCell from './AbstractCell.js';

// constants
const NORMAL_COLOR_BACKGROUND = 'rgb(220,60,33)'; // background normal color
const SELECT_COLOR_BACKGROUND = 'rgb(0,0,128)'; // background select color
const NORMAL_COLOR_TEXT = 'white'; // text normal color
const SELECT_COLOR_TEXT = 'rgb(255,253,56)'; // text select color

class MultiplicationTableHeaderCell extends AbstractCell {
  /**
   * @param {Text} contentText - Text label for button.
   * @param {Object} backgroundOptions - Background options for button.
   * @param {Object} textOptions - Text options for button.
   *
   */
  constructor(contentText, backgroundOptions, textOptions) {
    backgroundOptions = merge({
      fill: NORMAL_COLOR_BACKGROUND
    }, backgroundOptions);
    super(backgroundOptions, textOptions);
    this.setText(contentText);
  }

  // @public
  setSelected() {
    this.setBackgroundFill(SELECT_COLOR_BACKGROUND);
    this.setTextFill(SELECT_COLOR_TEXT);
  }

  // @public
  setNormal() {
    this.setBackgroundFill(NORMAL_COLOR_BACKGROUND);
    this.setTextFill(NORMAL_COLOR_TEXT);
  }
}
arithmetic.register('MultiplicationTableHeaderCell', MultiplicationTableHeaderCell);
export default MultiplicationTableHeaderCell;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsImFyaXRobWV0aWMiLCJBYnN0cmFjdENlbGwiLCJOT1JNQUxfQ09MT1JfQkFDS0dST1VORCIsIlNFTEVDVF9DT0xPUl9CQUNLR1JPVU5EIiwiTk9STUFMX0NPTE9SX1RFWFQiLCJTRUxFQ1RfQ09MT1JfVEVYVCIsIk11bHRpcGxpY2F0aW9uVGFibGVIZWFkZXJDZWxsIiwiY29uc3RydWN0b3IiLCJjb250ZW50VGV4dCIsImJhY2tncm91bmRPcHRpb25zIiwidGV4dE9wdGlvbnMiLCJmaWxsIiwic2V0VGV4dCIsInNldFNlbGVjdGVkIiwic2V0QmFja2dyb3VuZEZpbGwiLCJzZXRUZXh0RmlsbCIsInNldE5vcm1hbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTXVsdGlwbGljYXRpb25UYWJsZUhlYWRlckNlbGwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTXVsdGlwbGljYXRpb24gdGFibGUgaGVhZGVyIGNlbGwuXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmV5IFplbGVua292IChNTGVhcm5lcilcclxuICovXHJcblxyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IGFyaXRobWV0aWMgZnJvbSAnLi4vLi4vLi4vYXJpdGhtZXRpYy5qcyc7XHJcbmltcG9ydCBBYnN0cmFjdENlbGwgZnJvbSAnLi9BYnN0cmFjdENlbGwuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE5PUk1BTF9DT0xPUl9CQUNLR1JPVU5EID0gJ3JnYigyMjAsNjAsMzMpJzsgLy8gYmFja2dyb3VuZCBub3JtYWwgY29sb3JcclxuY29uc3QgU0VMRUNUX0NPTE9SX0JBQ0tHUk9VTkQgPSAncmdiKDAsMCwxMjgpJzsgLy8gYmFja2dyb3VuZCBzZWxlY3QgY29sb3JcclxuY29uc3QgTk9STUFMX0NPTE9SX1RFWFQgPSAnd2hpdGUnOyAvLyB0ZXh0IG5vcm1hbCBjb2xvclxyXG5jb25zdCBTRUxFQ1RfQ09MT1JfVEVYVCA9ICdyZ2IoMjU1LDI1Myw1NiknOyAvLyB0ZXh0IHNlbGVjdCBjb2xvclxyXG5cclxuY2xhc3MgTXVsdGlwbGljYXRpb25UYWJsZUhlYWRlckNlbGwgZXh0ZW5kcyBBYnN0cmFjdENlbGwge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1RleHR9IGNvbnRlbnRUZXh0IC0gVGV4dCBsYWJlbCBmb3IgYnV0dG9uLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBiYWNrZ3JvdW5kT3B0aW9ucyAtIEJhY2tncm91bmQgb3B0aW9ucyBmb3IgYnV0dG9uLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB0ZXh0T3B0aW9ucyAtIFRleHQgb3B0aW9ucyBmb3IgYnV0dG9uLlxyXG4gICAqXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNvbnRlbnRUZXh0LCBiYWNrZ3JvdW5kT3B0aW9ucywgdGV4dE9wdGlvbnMgKSB7XHJcbiAgICBiYWNrZ3JvdW5kT3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGZpbGw6IE5PUk1BTF9DT0xPUl9CQUNLR1JPVU5EXHJcbiAgICB9LCBiYWNrZ3JvdW5kT3B0aW9ucyApO1xyXG4gICAgc3VwZXIoIGJhY2tncm91bmRPcHRpb25zLCB0ZXh0T3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuc2V0VGV4dCggY29udGVudFRleHQgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBzZXRTZWxlY3RlZCgpIHtcclxuICAgIHRoaXMuc2V0QmFja2dyb3VuZEZpbGwoIFNFTEVDVF9DT0xPUl9CQUNLR1JPVU5EICk7XHJcbiAgICB0aGlzLnNldFRleHRGaWxsKCBTRUxFQ1RfQ09MT1JfVEVYVCApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHNldE5vcm1hbCgpIHtcclxuICAgIHRoaXMuc2V0QmFja2dyb3VuZEZpbGwoIE5PUk1BTF9DT0xPUl9CQUNLR1JPVU5EICk7XHJcbiAgICB0aGlzLnNldFRleHRGaWxsKCBOT1JNQUxfQ09MT1JfVEVYVCApO1xyXG4gIH1cclxufVxyXG5cclxuYXJpdGhtZXRpYy5yZWdpc3RlciggJ011bHRpcGxpY2F0aW9uVGFibGVIZWFkZXJDZWxsJywgTXVsdGlwbGljYXRpb25UYWJsZUhlYWRlckNlbGwgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE11bHRpcGxpY2F0aW9uVGFibGVIZWFkZXJDZWxsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sc0NBQXNDO0FBQ3hELE9BQU9DLFVBQVUsTUFBTSx3QkFBd0I7QUFDL0MsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjs7QUFFNUM7QUFDQSxNQUFNQyx1QkFBdUIsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ2xELE1BQU1DLHVCQUF1QixHQUFHLGNBQWMsQ0FBQyxDQUFDO0FBQ2hELE1BQU1DLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxDQUFDO0FBQ25DLE1BQU1DLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDLENBQUM7O0FBRTdDLE1BQU1DLDZCQUE2QixTQUFTTCxZQUFZLENBQUM7RUFFdkQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VNLFdBQVdBLENBQUVDLFdBQVcsRUFBRUMsaUJBQWlCLEVBQUVDLFdBQVcsRUFBRztJQUN6REQsaUJBQWlCLEdBQUdWLEtBQUssQ0FBRTtNQUN6QlksSUFBSSxFQUFFVDtJQUNSLENBQUMsRUFBRU8saUJBQWtCLENBQUM7SUFDdEIsS0FBSyxDQUFFQSxpQkFBaUIsRUFBRUMsV0FBWSxDQUFDO0lBRXZDLElBQUksQ0FBQ0UsT0FBTyxDQUFFSixXQUFZLENBQUM7RUFDN0I7O0VBRUE7RUFDQUssV0FBV0EsQ0FBQSxFQUFHO0lBQ1osSUFBSSxDQUFDQyxpQkFBaUIsQ0FBRVgsdUJBQXdCLENBQUM7SUFDakQsSUFBSSxDQUFDWSxXQUFXLENBQUVWLGlCQUFrQixDQUFDO0VBQ3ZDOztFQUVBO0VBQ0FXLFNBQVNBLENBQUEsRUFBRztJQUNWLElBQUksQ0FBQ0YsaUJBQWlCLENBQUVaLHVCQUF3QixDQUFDO0lBQ2pELElBQUksQ0FBQ2EsV0FBVyxDQUFFWCxpQkFBa0IsQ0FBQztFQUN2QztBQUNGO0FBRUFKLFVBQVUsQ0FBQ2lCLFFBQVEsQ0FBRSwrQkFBK0IsRUFBRVgsNkJBQThCLENBQUM7QUFFckYsZUFBZUEsNkJBQTZCIn0=