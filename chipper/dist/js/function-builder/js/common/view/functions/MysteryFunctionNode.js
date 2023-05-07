// Copyright 2016-2023, University of Colorado Boulder

/**
 * Function for the 'Mystery' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../../phet-core/js/merge.js';
import { Text } from '../../../../../scenery/js/imports.js';
import functionBuilder from '../../../functionBuilder.js';
import FunctionBuilderStrings from '../../../FunctionBuilderStrings.js';
import FBConstants from '../../FBConstants.js';
import MathFunctionNode from './MathFunctionNode.js';
export default class MysteryFunctionNode extends MathFunctionNode {
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
      hiddenFill: null,
      // don't change fill color when identity is hidden
      draggable: false // {boolean} Mystery functions are not draggable
    }, options);

    // Node that is displayed when the function's identity is hidden
    assert && assert(!options.hiddenNode);
    options.hiddenNode = new Text(FunctionBuilderStrings.mysteryCharacterStringProperty, {
      font: FBConstants.MYSTERY_FUNCTION_FONT,
      maxWidth: 0.35 * options.size.width,
      maxHeight: 0.9 * options.size.height
    });
    super(functionInstance, container, builderNode, dragLayer, options);
  }
}
functionBuilder.register('MysteryFunctionNode', MysteryFunctionNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlRleHQiLCJmdW5jdGlvbkJ1aWxkZXIiLCJGdW5jdGlvbkJ1aWxkZXJTdHJpbmdzIiwiRkJDb25zdGFudHMiLCJNYXRoRnVuY3Rpb25Ob2RlIiwiTXlzdGVyeUZ1bmN0aW9uTm9kZSIsImNvbnN0cnVjdG9yIiwiZnVuY3Rpb25JbnN0YW5jZSIsImNvbnRhaW5lciIsImJ1aWxkZXJOb2RlIiwiZHJhZ0xheWVyIiwib3B0aW9ucyIsInNpemUiLCJGVU5DVElPTl9TSVpFIiwiaWRlbnRpdHlWaXNpYmxlIiwiaGlkZGVuRmlsbCIsImRyYWdnYWJsZSIsImFzc2VydCIsImhpZGRlbk5vZGUiLCJteXN0ZXJ5Q2hhcmFjdGVyU3RyaW5nUHJvcGVydHkiLCJmb250IiwiTVlTVEVSWV9GVU5DVElPTl9GT05UIiwibWF4V2lkdGgiLCJ3aWR0aCIsIm1heEhlaWdodCIsImhlaWdodCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTXlzdGVyeUZ1bmN0aW9uTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiBmb3IgdGhlICdNeXN0ZXJ5JyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZnVuY3Rpb25CdWlsZGVyIGZyb20gJy4uLy4uLy4uL2Z1bmN0aW9uQnVpbGRlci5qcyc7XHJcbmltcG9ydCBGdW5jdGlvbkJ1aWxkZXJTdHJpbmdzIGZyb20gJy4uLy4uLy4uL0Z1bmN0aW9uQnVpbGRlclN0cmluZ3MuanMnO1xyXG5pbXBvcnQgRkJDb25zdGFudHMgZnJvbSAnLi4vLi4vRkJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgTWF0aEZ1bmN0aW9uTm9kZSBmcm9tICcuL01hdGhGdW5jdGlvbk5vZGUuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTXlzdGVyeUZ1bmN0aW9uTm9kZSBleHRlbmRzIE1hdGhGdW5jdGlvbk5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge01hdGhGdW5jdGlvbn0gZnVuY3Rpb25JbnN0YW5jZVxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb25Db250YWluZXJ9IGNvbnRhaW5lciAtIGNvbnRhaW5lciBpbiB0aGUgZnVuY3Rpb24gY2Fyb3VzZWxcclxuICAgKiBAcGFyYW0ge0J1aWxkZXJOb2RlfSBidWlsZGVyTm9kZVxyXG4gICAqIEBwYXJhbSB7Tm9kZX0gZHJhZ0xheWVyIC0gcGFyZW50IGZvciB0aGlzIG5vZGUgd2hlbiBpdCdzIGJlaW5nIGRyYWdnZWQgb3IgYW5pbWF0aW5nXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBmdW5jdGlvbkluc3RhbmNlLCBjb250YWluZXIsIGJ1aWxkZXJOb2RlLCBkcmFnTGF5ZXIsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHNpemU6IEZCQ29uc3RhbnRzLkZVTkNUSU9OX1NJWkUsXHJcbiAgICAgIGlkZW50aXR5VmlzaWJsZTogZmFsc2UsIC8vIGZ1bmN0aW9uJ3MgaWRlbnRpdHkgaXMgbm90IGluaXRpYWxseSB2aXNpYmxlXHJcbiAgICAgIGhpZGRlbkZpbGw6IG51bGwsIC8vIGRvbid0IGNoYW5nZSBmaWxsIGNvbG9yIHdoZW4gaWRlbnRpdHkgaXMgaGlkZGVuXHJcbiAgICAgIGRyYWdnYWJsZTogZmFsc2UgLy8ge2Jvb2xlYW59IE15c3RlcnkgZnVuY3Rpb25zIGFyZSBub3QgZHJhZ2dhYmxlXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gTm9kZSB0aGF0IGlzIGRpc3BsYXllZCB3aGVuIHRoZSBmdW5jdGlvbidzIGlkZW50aXR5IGlzIGhpZGRlblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuaGlkZGVuTm9kZSApO1xyXG4gICAgb3B0aW9ucy5oaWRkZW5Ob2RlID0gbmV3IFRleHQoIEZ1bmN0aW9uQnVpbGRlclN0cmluZ3MubXlzdGVyeUNoYXJhY3RlclN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IEZCQ29uc3RhbnRzLk1ZU1RFUllfRlVOQ1RJT05fRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IDAuMzUgKiBvcHRpb25zLnNpemUud2lkdGgsXHJcbiAgICAgIG1heEhlaWdodDogMC45ICogb3B0aW9ucy5zaXplLmhlaWdodFxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBmdW5jdGlvbkluc3RhbmNlLCBjb250YWluZXIsIGJ1aWxkZXJOb2RlLCBkcmFnTGF5ZXIsIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uQnVpbGRlci5yZWdpc3RlciggJ015c3RlcnlGdW5jdGlvbk5vZGUnLCBNeXN0ZXJ5RnVuY3Rpb25Ob2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxzQ0FBc0M7QUFDeEQsU0FBU0MsSUFBSSxRQUFRLHNDQUFzQztBQUMzRCxPQUFPQyxlQUFlLE1BQU0sNkJBQTZCO0FBQ3pELE9BQU9DLHNCQUFzQixNQUFNLG9DQUFvQztBQUN2RSxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLGdCQUFnQixNQUFNLHVCQUF1QjtBQUVwRCxlQUFlLE1BQU1DLG1CQUFtQixTQUFTRCxnQkFBZ0IsQ0FBQztFQUVoRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxXQUFXQSxDQUFFQyxnQkFBZ0IsRUFBRUMsU0FBUyxFQUFFQyxXQUFXLEVBQUVDLFNBQVMsRUFBRUMsT0FBTyxFQUFHO0lBRTFFQSxPQUFPLEdBQUdaLEtBQUssQ0FBRTtNQUNmYSxJQUFJLEVBQUVULFdBQVcsQ0FBQ1UsYUFBYTtNQUMvQkMsZUFBZSxFQUFFLEtBQUs7TUFBRTtNQUN4QkMsVUFBVSxFQUFFLElBQUk7TUFBRTtNQUNsQkMsU0FBUyxFQUFFLEtBQUssQ0FBQztJQUNuQixDQUFDLEVBQUVMLE9BQVEsQ0FBQzs7SUFFWjtJQUNBTSxNQUFNLElBQUlBLE1BQU0sQ0FBRSxDQUFDTixPQUFPLENBQUNPLFVBQVcsQ0FBQztJQUN2Q1AsT0FBTyxDQUFDTyxVQUFVLEdBQUcsSUFBSWxCLElBQUksQ0FBRUUsc0JBQXNCLENBQUNpQiw4QkFBOEIsRUFBRTtNQUNwRkMsSUFBSSxFQUFFakIsV0FBVyxDQUFDa0IscUJBQXFCO01BQ3ZDQyxRQUFRLEVBQUUsSUFBSSxHQUFHWCxPQUFPLENBQUNDLElBQUksQ0FBQ1csS0FBSztNQUNuQ0MsU0FBUyxFQUFFLEdBQUcsR0FBR2IsT0FBTyxDQUFDQyxJQUFJLENBQUNhO0lBQ2hDLENBQUUsQ0FBQztJQUVILEtBQUssQ0FBRWxCLGdCQUFnQixFQUFFQyxTQUFTLEVBQUVDLFdBQVcsRUFBRUMsU0FBUyxFQUFFQyxPQUFRLENBQUM7RUFDdkU7QUFDRjtBQUVBVixlQUFlLENBQUN5QixRQUFRLENBQUUscUJBQXFCLEVBQUVyQixtQkFBb0IsQ0FBQyJ9