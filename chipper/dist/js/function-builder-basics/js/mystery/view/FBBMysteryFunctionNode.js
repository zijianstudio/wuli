// Copyright 2017-2022, University of Colorado Boulder

/**
 * Function for the 'Mystery' screen in 'Function Builder: Basics'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import FBConstants from '../../../../function-builder/js/common/FBConstants.js';
import ImageFunctionNode from '../../../../function-builder/js/common/view/functions/ImageFunctionNode.js';
import FunctionBuilderStrings from '../../../../function-builder/js/FunctionBuilderStrings.js';
import merge from '../../../../phet-core/js/merge.js';
import { Text } from '../../../../scenery/js/imports.js';
import functionBuilderBasics from '../../functionBuilderBasics.js';
class FBBMysteryFunctionNode extends ImageFunctionNode {
  /**
   * @param {MathFunction} functionInstance
   * @param {FunctionContainer} container - container in the function carousel
   * @param {BuilderNode} builderNode
   * @param {Node} dragLayer - parent for this node when it's being dragged or animating
   * @param {Object} [options]
   */
  constructor(functionInstance, container, builderNode, dragLayer, options) {
    options = merge({
      size: FBConstants.FUNCTION_SIZE,
      identityVisible: false,
      // function's identity is not initially visible
      draggable: false,
      // {boolean} Mystery functions are not draggable
      hiddenFill: 'white' // {Color|string} fill when identity is hidden
    }, options);

    // Node that is displayed when the function's identity is hidden
    assert && assert(!options.hiddenNode);
    options.hiddenNode = new Text(FunctionBuilderStrings.mysteryCharacter, {
      font: FBConstants.MYSTERY_FUNCTION_FONT,
      maxWidth: 0.35 * options.size.width,
      maxHeight: 0.9 * options.size.height
    });
    super(functionInstance, container, builderNode, dragLayer, options);

    // @private
    this.hiddenNode = options.hiddenNode;
  }

  /**
   * Sets the color of the question mark.
   * @param {Color|string} color
   * @public
   */
  setQuestionMarkColor(color) {
    this.hiddenNode.fill = color;
  }
}
functionBuilderBasics.register('FBBMysteryFunctionNode', FBBMysteryFunctionNode);
export default FBBMysteryFunctionNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGQkNvbnN0YW50cyIsIkltYWdlRnVuY3Rpb25Ob2RlIiwiRnVuY3Rpb25CdWlsZGVyU3RyaW5ncyIsIm1lcmdlIiwiVGV4dCIsImZ1bmN0aW9uQnVpbGRlckJhc2ljcyIsIkZCQk15c3RlcnlGdW5jdGlvbk5vZGUiLCJjb25zdHJ1Y3RvciIsImZ1bmN0aW9uSW5zdGFuY2UiLCJjb250YWluZXIiLCJidWlsZGVyTm9kZSIsImRyYWdMYXllciIsIm9wdGlvbnMiLCJzaXplIiwiRlVOQ1RJT05fU0laRSIsImlkZW50aXR5VmlzaWJsZSIsImRyYWdnYWJsZSIsImhpZGRlbkZpbGwiLCJhc3NlcnQiLCJoaWRkZW5Ob2RlIiwibXlzdGVyeUNoYXJhY3RlciIsImZvbnQiLCJNWVNURVJZX0ZVTkNUSU9OX0ZPTlQiLCJtYXhXaWR0aCIsIndpZHRoIiwibWF4SGVpZ2h0IiwiaGVpZ2h0Iiwic2V0UXVlc3Rpb25NYXJrQ29sb3IiLCJjb2xvciIsImZpbGwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkZCQk15c3RlcnlGdW5jdGlvbk5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRnVuY3Rpb24gZm9yIHRoZSAnTXlzdGVyeScgc2NyZWVuIGluICdGdW5jdGlvbiBCdWlsZGVyOiBCYXNpY3MnLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBGQkNvbnN0YW50cyBmcm9tICcuLi8uLi8uLi8uLi9mdW5jdGlvbi1idWlsZGVyL2pzL2NvbW1vbi9GQkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBJbWFnZUZ1bmN0aW9uTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9mdW5jdGlvbi1idWlsZGVyL2pzL2NvbW1vbi92aWV3L2Z1bmN0aW9ucy9JbWFnZUZ1bmN0aW9uTm9kZS5qcyc7XHJcbmltcG9ydCBGdW5jdGlvbkJ1aWxkZXJTdHJpbmdzIGZyb20gJy4uLy4uLy4uLy4uL2Z1bmN0aW9uLWJ1aWxkZXIvanMvRnVuY3Rpb25CdWlsZGVyU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGZ1bmN0aW9uQnVpbGRlckJhc2ljcyBmcm9tICcuLi8uLi9mdW5jdGlvbkJ1aWxkZXJCYXNpY3MuanMnO1xyXG5cclxuY2xhc3MgRkJCTXlzdGVyeUZ1bmN0aW9uTm9kZSBleHRlbmRzIEltYWdlRnVuY3Rpb25Ob2RlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge01hdGhGdW5jdGlvbn0gZnVuY3Rpb25JbnN0YW5jZVxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb25Db250YWluZXJ9IGNvbnRhaW5lciAtIGNvbnRhaW5lciBpbiB0aGUgZnVuY3Rpb24gY2Fyb3VzZWxcclxuICAgKiBAcGFyYW0ge0J1aWxkZXJOb2RlfSBidWlsZGVyTm9kZVxyXG4gICAqIEBwYXJhbSB7Tm9kZX0gZHJhZ0xheWVyIC0gcGFyZW50IGZvciB0aGlzIG5vZGUgd2hlbiBpdCdzIGJlaW5nIGRyYWdnZWQgb3IgYW5pbWF0aW5nXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBmdW5jdGlvbkluc3RhbmNlLCBjb250YWluZXIsIGJ1aWxkZXJOb2RlLCBkcmFnTGF5ZXIsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHNpemU6IEZCQ29uc3RhbnRzLkZVTkNUSU9OX1NJWkUsXHJcbiAgICAgIGlkZW50aXR5VmlzaWJsZTogZmFsc2UsIC8vIGZ1bmN0aW9uJ3MgaWRlbnRpdHkgaXMgbm90IGluaXRpYWxseSB2aXNpYmxlXHJcbiAgICAgIGRyYWdnYWJsZTogZmFsc2UsIC8vIHtib29sZWFufSBNeXN0ZXJ5IGZ1bmN0aW9ucyBhcmUgbm90IGRyYWdnYWJsZVxyXG4gICAgICBoaWRkZW5GaWxsOiAnd2hpdGUnIC8vIHtDb2xvcnxzdHJpbmd9IGZpbGwgd2hlbiBpZGVudGl0eSBpcyBoaWRkZW5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBOb2RlIHRoYXQgaXMgZGlzcGxheWVkIHdoZW4gdGhlIGZ1bmN0aW9uJ3MgaWRlbnRpdHkgaXMgaGlkZGVuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5oaWRkZW5Ob2RlICk7XHJcbiAgICBvcHRpb25zLmhpZGRlbk5vZGUgPSBuZXcgVGV4dCggRnVuY3Rpb25CdWlsZGVyU3RyaW5ncy5teXN0ZXJ5Q2hhcmFjdGVyLCB7XHJcbiAgICAgIGZvbnQ6IEZCQ29uc3RhbnRzLk1ZU1RFUllfRlVOQ1RJT05fRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IDAuMzUgKiBvcHRpb25zLnNpemUud2lkdGgsXHJcbiAgICAgIG1heEhlaWdodDogMC45ICogb3B0aW9ucy5zaXplLmhlaWdodFxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBmdW5jdGlvbkluc3RhbmNlLCBjb250YWluZXIsIGJ1aWxkZXJOb2RlLCBkcmFnTGF5ZXIsIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5oaWRkZW5Ob2RlID0gb3B0aW9ucy5oaWRkZW5Ob2RlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgY29sb3Igb2YgdGhlIHF1ZXN0aW9uIG1hcmsuXHJcbiAgICogQHBhcmFtIHtDb2xvcnxzdHJpbmd9IGNvbG9yXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFF1ZXN0aW9uTWFya0NvbG9yKCBjb2xvciApIHtcclxuICAgIHRoaXMuaGlkZGVuTm9kZS5maWxsID0gY29sb3I7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbkJ1aWxkZXJCYXNpY3MucmVnaXN0ZXIoICdGQkJNeXN0ZXJ5RnVuY3Rpb25Ob2RlJywgRkJCTXlzdGVyeUZ1bmN0aW9uTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBGQkJNeXN0ZXJ5RnVuY3Rpb25Ob2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxXQUFXLE1BQU0sdURBQXVEO0FBQy9FLE9BQU9DLGlCQUFpQixNQUFNLDRFQUE0RTtBQUMxRyxPQUFPQyxzQkFBc0IsTUFBTSwyREFBMkQ7QUFDOUYsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hELE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQztBQUVsRSxNQUFNQyxzQkFBc0IsU0FBU0wsaUJBQWlCLENBQUM7RUFDckQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU0sV0FBV0EsQ0FBRUMsZ0JBQWdCLEVBQUVDLFNBQVMsRUFBRUMsV0FBVyxFQUFFQyxTQUFTLEVBQUVDLE9BQU8sRUFBRztJQUUxRUEsT0FBTyxHQUFHVCxLQUFLLENBQUU7TUFDZlUsSUFBSSxFQUFFYixXQUFXLENBQUNjLGFBQWE7TUFDL0JDLGVBQWUsRUFBRSxLQUFLO01BQUU7TUFDeEJDLFNBQVMsRUFBRSxLQUFLO01BQUU7TUFDbEJDLFVBQVUsRUFBRSxPQUFPLENBQUM7SUFDdEIsQ0FBQyxFQUFFTCxPQUFRLENBQUM7O0lBRVo7SUFDQU0sTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQ04sT0FBTyxDQUFDTyxVQUFXLENBQUM7SUFDdkNQLE9BQU8sQ0FBQ08sVUFBVSxHQUFHLElBQUlmLElBQUksQ0FBRUYsc0JBQXNCLENBQUNrQixnQkFBZ0IsRUFBRTtNQUN0RUMsSUFBSSxFQUFFckIsV0FBVyxDQUFDc0IscUJBQXFCO01BQ3ZDQyxRQUFRLEVBQUUsSUFBSSxHQUFHWCxPQUFPLENBQUNDLElBQUksQ0FBQ1csS0FBSztNQUNuQ0MsU0FBUyxFQUFFLEdBQUcsR0FBR2IsT0FBTyxDQUFDQyxJQUFJLENBQUNhO0lBQ2hDLENBQUUsQ0FBQztJQUVILEtBQUssQ0FBRWxCLGdCQUFnQixFQUFFQyxTQUFTLEVBQUVDLFdBQVcsRUFBRUMsU0FBUyxFQUFFQyxPQUFRLENBQUM7O0lBRXJFO0lBQ0EsSUFBSSxDQUFDTyxVQUFVLEdBQUdQLE9BQU8sQ0FBQ08sVUFBVTtFQUN0Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VRLG9CQUFvQkEsQ0FBRUMsS0FBSyxFQUFHO0lBQzVCLElBQUksQ0FBQ1QsVUFBVSxDQUFDVSxJQUFJLEdBQUdELEtBQUs7RUFDOUI7QUFDRjtBQUVBdkIscUJBQXFCLENBQUN5QixRQUFRLENBQUUsd0JBQXdCLEVBQUV4QixzQkFBdUIsQ0FBQztBQUNsRixlQUFlQSxzQkFBc0IifQ==