// Copyright 2016-2023, University of Colorado Boulder

/**
 * Displays a double number line in an accordion box, with a marker editor, undo button and eraser button.
 * Responsibilities include:
 * - creation of markers, based on contents of the marker editor
 * - a single level of undo for markers
 * - position and animation of the marker editor
 * - position and visibility of the undo button
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import { Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import undoSolidShape from '../../../../sherpa/js/fontawesome-5/undoSolidShape.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
import Marker from '../model/Marker.js';
import URColors from '../URColors.js';
import URConstants from '../URConstants.js';
import DoubleNumberLineNode from './DoubleNumberLineNode.js';
import MarkerEditorNode from './MarkerEditorNode.js';
export default class DoubleNumberLineAccordionBox extends AccordionBox {
  /**
   * @param {DoubleNumberLine} doubleNumberLine
   * @param {MarkerEditor} markerEditor
   * @param {Node} keypadLayer - layer in which the (modal) keypad will be displayed
   * @param {Object} [options]
   */
  constructor(doubleNumberLine, markerEditor, keypadLayer, options) {
    options = merge({}, URConstants.ACCORDION_BOX_OPTIONS, {
      // DoubleNumberLineAccordionBox options
      titleString: UnitRatesStrings.doubleNumberLineStringProperty,
      // title displayed next to the expand/collapse button
      keypadPosition: 'below',
      // {string} whether the keypad is 'above' or 'below' the double number line

      // DoubleNumberLineNode options
      axisViewLength: 1000,
      // {number} view length of doubleNumberLine's range
      indicatorXProperty: null,
      // {Property.<number>|null} position of the indicator, in view coordinates. null means no indicator.
      indicatorColor: 'green' // {Color|string} color of the indicator
    }, options);

    // An invisible rectangle that has the same bounds as the accordion box. Used to position the keypad.
    // Dimensions will be set after calling super.  This was added so when converting to an ES6 class, because
    // we can't use this before super.  See https://github.com/phetsims/tasks/issues/1026#issuecomment-594357784
    const thisBoundsNode = new Rectangle(0, 0, 1, 1, {
      visible: false,
      pickable: false
    });

    // title on the accordion box
    assert && assert(!options.titleNode, 'creates its own title node');
    options.titleNode = new Text(options.titleString, {
      font: URConstants.ACCORDION_BOX_TITLE_FONT,
      maxWidth: 300 // i18n, determined empirically
    });

    // double number line
    const doubleNumberLineNode = new DoubleNumberLineNode(doubleNumberLine, {
      axisViewLength: options.axisViewLength,
      numeratorOptions: doubleNumberLine.numeratorOptions,
      denominatorOptions: doubleNumberLine.denominatorOptions,
      indicatorXProperty: options.indicatorXProperty,
      indicatorColor: options.indicatorColor
    });

    // home positions for marker editor and undo button, to left of axes
    const markerEditorNodeHomeX = doubleNumberLineNode.left - 28;
    const undoButtonHomePosition = new Vector2(markerEditorNodeHomeX, doubleNumberLineNode.centerY);

    // when the marker editor exceeds the range of the axes, move it to the right of the axes
    const markerEditorNodeOutOfRangeX = doubleNumberLineNode.x + doubleNumberLineNode.outOfRangeXOffset;

    // marker editor
    const markerEditorNode = new MarkerEditorNode(markerEditor, thisBoundsNode, keypadLayer, {
      numeratorOptions: doubleNumberLine.numeratorOptions,
      denominatorOptions: doubleNumberLine.denominatorOptions,
      keypadPosition: options.keypadPosition,
      x: markerEditorNodeHomeX,
      centerY: doubleNumberLineNode.centerY
    });

    // The undo button is overloaded (bad design, imo), and can apply to either the marker editor or a marker.
    // This flag indicates whether the undo button applies to the editor (true) or a marker (false).
    let undoAppliesToEditor = true;

    // Pressing the undo button moves the marker edit back to its home position,
    // or removes the marker that was most recently added using the editor.
    const undoButton = new RectangularPushButton({
      content: new Path(undoSolidShape, {
        scale: 0.03,
        // to approximately match height of marker editor buttons, determined empirically
        fill: 'black'
      }),
      visible: false,
      baseColor: URColors.undoButton,
      listener: () => {
        if (undoAppliesToEditor) {
          markerEditor.reset();
        } else {
          doubleNumberLine.undo();
        }
      },
      center: undoButtonHomePosition
    });
    undoButton.touchArea = undoButton.localBounds.dilatedXY(5, 5);

    // Pressing the eraser button erases all 'erasable' markers from the double number line.
    const eraserButton = new EraserButton({
      scale: 0.92,
      // to approximately match height of marker editor buttons, determined empirically
      baseColor: URColors.eraserButton,
      listener: () => doubleNumberLine.erase(),
      right: doubleNumberLineNode.right,
      bottom: markerEditorNode.bottom
    });
    eraserButton.touchArea = eraserButton.localBounds.dilatedXY(5, 5);

    // assemble the content for the accordion box
    const contentNode = new Node({
      children: [doubleNumberLineNode, undoButton, markerEditorNode, eraserButton]
    });
    super(contentNode, options);

    // Adjust rectangle to match accordion box size.
    thisBoundsNode.setRectBounds(this.localBounds);
    this.addChild(thisBoundsNode);
    thisBoundsNode.moveToBack();

    // {Animation|null} animation for marker editor
    let markerEditorAnimation = null;

    // if false, move the marker editor immediately instead of animating.
    // Used to set the editor's initial position on startup.
    let markerEditorAnimationEnabled = false;

    // Observe marker editor, to position the editor and create markers.
    const markerEditorObserver = () => {
      // local vars to improve readability
      const numerator = markerEditor.numeratorProperty.value;
      const denominator = markerEditor.denominatorProperty.value;
      const maxNumerator = doubleNumberLine.getMaxNumerator();
      const maxDenominator = doubleNumberLine.getMaxDenominator();
      const axisViewLength = doubleNumberLineNode.axisViewLength;

      // {number} destination for horizontal animation of marker editor, null indicates that no animation is required
      let destinationX = null;

      // if the marker has both a numerator and denominator...
      if (numerator !== null && denominator !== null) {
        if (denominator <= maxDenominator) {
          // create a marker
          const isMajor = doubleNumberLine.isMajorMarker(numerator, denominator);
          const marker = new Marker(numerator, denominator, 'editor', {
            isMajor: isMajor,
            color: isMajor ? URColors.majorMarker : URColors.minorMarker
          });

          // Return the marker editor to its home position.
          // Do this before adding the marker so that the undo button is associated with the marker.
          markerEditor.reset();

          // add marker to double number line
          if (doubleNumberLine.addMarker(marker)) {
            // allow the new marker to be undone
            doubleNumberLine.undoMarkerProperty.value = marker;
          }
        } else {
          // marker is out of range, move editor to right of axis arrows
          destinationX = markerEditorNodeOutOfRangeX;

          // undo button is visible to left of axes
          if (undoAppliesToEditor) {
            undoButton.center = undoButtonHomePosition;
            undoButton.visible = true;
          }
        }
      } else {
        // marker is not fully specified

        // undo marker is lost when we start using the editor
        if (doubleNumberLine.undoMarkerProperty.value) {
          doubleNumberLine.undoMarkerProperty.value = null;
        }
        if (numerator === null && denominator === null) {
          // both values are empty, move marker editor back to home position
          destinationX = markerEditorNodeHomeX;

          // hide undo button
          undoButton.center = undoButtonHomePosition;
          undoButton.visible = false;
        } else {
          // one of the 2 values is filled in

          if (numerator !== null) {
            // numerator is filled in
            if (numerator > maxNumerator) {
              // move marker editor to right of axis arrows
              destinationX = markerEditorNodeOutOfRangeX;
            } else {
              // move marker editor to position of numerator
              destinationX = doubleNumberLineNode.x + doubleNumberLine.modelToViewNumerator(numerator, axisViewLength);
            }
          } else {
            assert && assert(denominator !== null, 'expected a valid denominator');

            // denominator is filled in
            if (denominator > maxDenominator) {
              // move marker editor to right of axis arrows
              destinationX = markerEditorNodeOutOfRangeX;
            } else {
              // move marker editor to position of denominator
              destinationX = doubleNumberLineNode.x + doubleNumberLine.modelToViewDenominator(denominator, axisViewLength);
            }
          }

          // undo button is visible to left of axes
          undoButton.center = undoButtonHomePosition;
          undoButton.visible = true;
        }
      }

      // if we need to move the marker editor...
      if (destinationX !== null) {
        if (!markerEditorAnimationEnabled) {
          // no animation, move immediately
          markerEditorNode.x = destinationX;
        } else {
          // stop any animation that is in progress
          markerEditorAnimation && markerEditorAnimation.stop();
          markerEditorAnimation = new Animation({
            duration: 0.002 * Math.abs(destinationX - markerEditorNode.x),
            // 2ms per 1 unit of distance
            easing: Easing.QUADRATIC_IN_OUT,
            object: markerEditorNode,
            attribute: 'x',
            to: destinationX
          });
          markerEditorAnimation.startEmitter.addListener(function startListener() {
            markerEditorNode.pickable = false;
            markerEditorAnimation.startEmitter.removeListener(startListener);
            markerEditorAnimation.endedEmitter.addListener(function endedListener() {
              markerEditorNode.pickable = true;
              markerEditorAnimation.endedEmitter.removeListener(endedListener);
            });
          });
          markerEditorAnimation.start();
        }
      }
    };
    markerEditor.numeratorProperty.link(markerEditorObserver); // unlink in dispose
    markerEditor.denominatorProperty.link(markerEditorObserver); // unlink in dispose
    markerEditorAnimationEnabled = true;

    // Observe the 'undo' marker. One level of undo is supported, and the undo button is overloaded.
    // As soon as you enter a value using the marker editor, you lose the ability to undo the previous marker.
    const undoMarkerObserver = marker => {
      if (marker) {
        // associate the undo button with the marker
        undoAppliesToEditor = false;

        // Position the undo button below the undoable marker
        undoButton.centerX = doubleNumberLine.modelToViewDenominator(marker.denominatorProperty.value, doubleNumberLineNode.axisViewLength);
        undoButton.bottom = markerEditorNode.bottom;
        undoButton.visible = true;
      } else {
        // associate the undo button with the editor
        undoAppliesToEditor = true;

        // Move the undo button to its home position, invisible if the marker editor contains no values
        undoButton.center = undoButtonHomePosition;
        undoButton.visible = !markerEditor.isEmpty();
      }
    };
    doubleNumberLine.undoMarkerProperty.link(undoMarkerObserver); // unlink in dispose

    // @private
    this.disposeDoubleNumberLineAccordionBox = () => {
      // model cleanup
      doubleNumberLine.undoMarkerProperty.unlink(undoMarkerObserver);
      markerEditor.numeratorProperty.unlink(markerEditorObserver);
      markerEditor.denominatorProperty.unlink(markerEditorObserver);

      // view cleanup
      markerEditorAnimation && markerEditorAnimation.stop();
      markerEditorNode.dispose();
      doubleNumberLineNode.dispose();
      eraserButton.dispose(); // workaround for memory leak https://github.com/phetsims/unit-rates/issues/207
      undoButton.dispose(); // workaround for memory leak https://github.com/phetsims/unit-rates/issues/207
    };

    // @private required by prototype functions
    this.doubleNumberLineNode = doubleNumberLineNode;
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeDoubleNumberLineAccordionBox();
    super.dispose();
  }

  /**
   * Gets the origin of the double number line's origin in the global view coordinate frame.
   * This is used to line up other things (like the race track in 'Racing Lab' screen) with the double number line.
   * @returns {Vector2}
   * @public
   */
  getGlobalOrigin() {
    return this.doubleNumberLineNode.parentToGlobalPoint(new Vector2(this.doubleNumberLineNode.x, this.doubleNumberLineNode.y));
  }
}
unitRates.register('DoubleNumberLineAccordionBox', DoubleNumberLineAccordionBox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwibWVyZ2UiLCJFcmFzZXJCdXR0b24iLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsIlRleHQiLCJ1bmRvU29saWRTaGFwZSIsIkFjY29yZGlvbkJveCIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIkFuaW1hdGlvbiIsIkVhc2luZyIsInVuaXRSYXRlcyIsIlVuaXRSYXRlc1N0cmluZ3MiLCJNYXJrZXIiLCJVUkNvbG9ycyIsIlVSQ29uc3RhbnRzIiwiRG91YmxlTnVtYmVyTGluZU5vZGUiLCJNYXJrZXJFZGl0b3JOb2RlIiwiRG91YmxlTnVtYmVyTGluZUFjY29yZGlvbkJveCIsImNvbnN0cnVjdG9yIiwiZG91YmxlTnVtYmVyTGluZSIsIm1hcmtlckVkaXRvciIsImtleXBhZExheWVyIiwib3B0aW9ucyIsIkFDQ09SRElPTl9CT1hfT1BUSU9OUyIsInRpdGxlU3RyaW5nIiwiZG91YmxlTnVtYmVyTGluZVN0cmluZ1Byb3BlcnR5Iiwia2V5cGFkUG9zaXRpb24iLCJheGlzVmlld0xlbmd0aCIsImluZGljYXRvclhQcm9wZXJ0eSIsImluZGljYXRvckNvbG9yIiwidGhpc0JvdW5kc05vZGUiLCJ2aXNpYmxlIiwicGlja2FibGUiLCJhc3NlcnQiLCJ0aXRsZU5vZGUiLCJmb250IiwiQUNDT1JESU9OX0JPWF9USVRMRV9GT05UIiwibWF4V2lkdGgiLCJkb3VibGVOdW1iZXJMaW5lTm9kZSIsIm51bWVyYXRvck9wdGlvbnMiLCJkZW5vbWluYXRvck9wdGlvbnMiLCJtYXJrZXJFZGl0b3JOb2RlSG9tZVgiLCJsZWZ0IiwidW5kb0J1dHRvbkhvbWVQb3NpdGlvbiIsImNlbnRlclkiLCJtYXJrZXJFZGl0b3JOb2RlT3V0T2ZSYW5nZVgiLCJ4Iiwib3V0T2ZSYW5nZVhPZmZzZXQiLCJtYXJrZXJFZGl0b3JOb2RlIiwidW5kb0FwcGxpZXNUb0VkaXRvciIsInVuZG9CdXR0b24iLCJjb250ZW50Iiwic2NhbGUiLCJmaWxsIiwiYmFzZUNvbG9yIiwibGlzdGVuZXIiLCJyZXNldCIsInVuZG8iLCJjZW50ZXIiLCJ0b3VjaEFyZWEiLCJsb2NhbEJvdW5kcyIsImRpbGF0ZWRYWSIsImVyYXNlckJ1dHRvbiIsImVyYXNlIiwicmlnaHQiLCJib3R0b20iLCJjb250ZW50Tm9kZSIsImNoaWxkcmVuIiwic2V0UmVjdEJvdW5kcyIsImFkZENoaWxkIiwibW92ZVRvQmFjayIsIm1hcmtlckVkaXRvckFuaW1hdGlvbiIsIm1hcmtlckVkaXRvckFuaW1hdGlvbkVuYWJsZWQiLCJtYXJrZXJFZGl0b3JPYnNlcnZlciIsIm51bWVyYXRvciIsIm51bWVyYXRvclByb3BlcnR5IiwidmFsdWUiLCJkZW5vbWluYXRvciIsImRlbm9taW5hdG9yUHJvcGVydHkiLCJtYXhOdW1lcmF0b3IiLCJnZXRNYXhOdW1lcmF0b3IiLCJtYXhEZW5vbWluYXRvciIsImdldE1heERlbm9taW5hdG9yIiwiZGVzdGluYXRpb25YIiwiaXNNYWpvciIsImlzTWFqb3JNYXJrZXIiLCJtYXJrZXIiLCJjb2xvciIsIm1ham9yTWFya2VyIiwibWlub3JNYXJrZXIiLCJhZGRNYXJrZXIiLCJ1bmRvTWFya2VyUHJvcGVydHkiLCJtb2RlbFRvVmlld051bWVyYXRvciIsIm1vZGVsVG9WaWV3RGVub21pbmF0b3IiLCJzdG9wIiwiZHVyYXRpb24iLCJNYXRoIiwiYWJzIiwiZWFzaW5nIiwiUVVBRFJBVElDX0lOX09VVCIsIm9iamVjdCIsImF0dHJpYnV0ZSIsInRvIiwic3RhcnRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJzdGFydExpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJlbmRlZEVtaXR0ZXIiLCJlbmRlZExpc3RlbmVyIiwic3RhcnQiLCJsaW5rIiwidW5kb01hcmtlck9ic2VydmVyIiwiY2VudGVyWCIsImlzRW1wdHkiLCJkaXNwb3NlRG91YmxlTnVtYmVyTGluZUFjY29yZGlvbkJveCIsInVubGluayIsImRpc3Bvc2UiLCJnZXRHbG9iYWxPcmlnaW4iLCJwYXJlbnRUb0dsb2JhbFBvaW50IiwieSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRG91YmxlTnVtYmVyTGluZUFjY29yZGlvbkJveC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEaXNwbGF5cyBhIGRvdWJsZSBudW1iZXIgbGluZSBpbiBhbiBhY2NvcmRpb24gYm94LCB3aXRoIGEgbWFya2VyIGVkaXRvciwgdW5kbyBidXR0b24gYW5kIGVyYXNlciBidXR0b24uXHJcbiAqIFJlc3BvbnNpYmlsaXRpZXMgaW5jbHVkZTpcclxuICogLSBjcmVhdGlvbiBvZiBtYXJrZXJzLCBiYXNlZCBvbiBjb250ZW50cyBvZiB0aGUgbWFya2VyIGVkaXRvclxyXG4gKiAtIGEgc2luZ2xlIGxldmVsIG9mIHVuZG8gZm9yIG1hcmtlcnNcclxuICogLSBwb3NpdGlvbiBhbmQgYW5pbWF0aW9uIG9mIHRoZSBtYXJrZXIgZWRpdG9yXHJcbiAqIC0gcG9zaXRpb24gYW5kIHZpc2liaWxpdHkgb2YgdGhlIHVuZG8gYnV0dG9uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEVyYXNlckJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9FcmFzZXJCdXR0b24uanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBQYXRoLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgdW5kb1NvbGlkU2hhcGUgZnJvbSAnLi4vLi4vLi4vLi4vc2hlcnBhL2pzL2ZvbnRhd2Vzb21lLTUvdW5kb1NvbGlkU2hhcGUuanMnO1xyXG5pbXBvcnQgQWNjb3JkaW9uQm94IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BY2NvcmRpb25Cb3guanMnO1xyXG5pbXBvcnQgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBBbmltYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvQW5pbWF0aW9uLmpzJztcclxuaW1wb3J0IEVhc2luZyBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9FYXNpbmcuanMnO1xyXG5pbXBvcnQgdW5pdFJhdGVzIGZyb20gJy4uLy4uL3VuaXRSYXRlcy5qcyc7XHJcbmltcG9ydCBVbml0UmF0ZXNTdHJpbmdzIGZyb20gJy4uLy4uL1VuaXRSYXRlc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgTWFya2VyIGZyb20gJy4uL21vZGVsL01hcmtlci5qcyc7XHJcbmltcG9ydCBVUkNvbG9ycyBmcm9tICcuLi9VUkNvbG9ycy5qcyc7XHJcbmltcG9ydCBVUkNvbnN0YW50cyBmcm9tICcuLi9VUkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBEb3VibGVOdW1iZXJMaW5lTm9kZSBmcm9tICcuL0RvdWJsZU51bWJlckxpbmVOb2RlLmpzJztcclxuaW1wb3J0IE1hcmtlckVkaXRvck5vZGUgZnJvbSAnLi9NYXJrZXJFZGl0b3JOb2RlLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERvdWJsZU51bWJlckxpbmVBY2NvcmRpb25Cb3ggZXh0ZW5kcyBBY2NvcmRpb25Cb3gge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0RvdWJsZU51bWJlckxpbmV9IGRvdWJsZU51bWJlckxpbmVcclxuICAgKiBAcGFyYW0ge01hcmtlckVkaXRvcn0gbWFya2VyRWRpdG9yXHJcbiAgICogQHBhcmFtIHtOb2RlfSBrZXlwYWRMYXllciAtIGxheWVyIGluIHdoaWNoIHRoZSAobW9kYWwpIGtleXBhZCB3aWxsIGJlIGRpc3BsYXllZFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZG91YmxlTnVtYmVyTGluZSwgbWFya2VyRWRpdG9yLCBrZXlwYWRMYXllciwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHt9LCBVUkNvbnN0YW50cy5BQ0NPUkRJT05fQk9YX09QVElPTlMsIHtcclxuXHJcbiAgICAgIC8vIERvdWJsZU51bWJlckxpbmVBY2NvcmRpb25Cb3ggb3B0aW9uc1xyXG4gICAgICB0aXRsZVN0cmluZzogVW5pdFJhdGVzU3RyaW5ncy5kb3VibGVOdW1iZXJMaW5lU3RyaW5nUHJvcGVydHksIC8vIHRpdGxlIGRpc3BsYXllZCBuZXh0IHRvIHRoZSBleHBhbmQvY29sbGFwc2UgYnV0dG9uXHJcbiAgICAgIGtleXBhZFBvc2l0aW9uOiAnYmVsb3cnLCAvLyB7c3RyaW5nfSB3aGV0aGVyIHRoZSBrZXlwYWQgaXMgJ2Fib3ZlJyBvciAnYmVsb3cnIHRoZSBkb3VibGUgbnVtYmVyIGxpbmVcclxuXHJcbiAgICAgIC8vIERvdWJsZU51bWJlckxpbmVOb2RlIG9wdGlvbnNcclxuICAgICAgYXhpc1ZpZXdMZW5ndGg6IDEwMDAsIC8vIHtudW1iZXJ9IHZpZXcgbGVuZ3RoIG9mIGRvdWJsZU51bWJlckxpbmUncyByYW5nZVxyXG4gICAgICBpbmRpY2F0b3JYUHJvcGVydHk6IG51bGwsIC8vIHtQcm9wZXJ0eS48bnVtYmVyPnxudWxsfSBwb3NpdGlvbiBvZiB0aGUgaW5kaWNhdG9yLCBpbiB2aWV3IGNvb3JkaW5hdGVzLiBudWxsIG1lYW5zIG5vIGluZGljYXRvci5cclxuICAgICAgaW5kaWNhdG9yQ29sb3I6ICdncmVlbicgLy8ge0NvbG9yfHN0cmluZ30gY29sb3Igb2YgdGhlIGluZGljYXRvclxyXG5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBBbiBpbnZpc2libGUgcmVjdGFuZ2xlIHRoYXQgaGFzIHRoZSBzYW1lIGJvdW5kcyBhcyB0aGUgYWNjb3JkaW9uIGJveC4gVXNlZCB0byBwb3NpdGlvbiB0aGUga2V5cGFkLlxyXG4gICAgLy8gRGltZW5zaW9ucyB3aWxsIGJlIHNldCBhZnRlciBjYWxsaW5nIHN1cGVyLiAgVGhpcyB3YXMgYWRkZWQgc28gd2hlbiBjb252ZXJ0aW5nIHRvIGFuIEVTNiBjbGFzcywgYmVjYXVzZVxyXG4gICAgLy8gd2UgY2FuJ3QgdXNlIHRoaXMgYmVmb3JlIHN1cGVyLiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YXNrcy9pc3N1ZXMvMTAyNiNpc3N1ZWNvbW1lbnQtNTk0MzU3Nzg0XHJcbiAgICBjb25zdCB0aGlzQm91bmRzTm9kZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEsIDEsIHtcclxuICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHRpdGxlIG9uIHRoZSBhY2NvcmRpb24gYm94XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy50aXRsZU5vZGUsICdjcmVhdGVzIGl0cyBvd24gdGl0bGUgbm9kZScgKTtcclxuICAgIG9wdGlvbnMudGl0bGVOb2RlID0gbmV3IFRleHQoIG9wdGlvbnMudGl0bGVTdHJpbmcsIHtcclxuICAgICAgZm9udDogVVJDb25zdGFudHMuQUNDT1JESU9OX0JPWF9USVRMRV9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogMzAwIC8vIGkxOG4sIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBkb3VibGUgbnVtYmVyIGxpbmVcclxuICAgIGNvbnN0IGRvdWJsZU51bWJlckxpbmVOb2RlID0gbmV3IERvdWJsZU51bWJlckxpbmVOb2RlKCBkb3VibGVOdW1iZXJMaW5lLCB7XHJcbiAgICAgIGF4aXNWaWV3TGVuZ3RoOiBvcHRpb25zLmF4aXNWaWV3TGVuZ3RoLFxyXG4gICAgICBudW1lcmF0b3JPcHRpb25zOiBkb3VibGVOdW1iZXJMaW5lLm51bWVyYXRvck9wdGlvbnMsXHJcbiAgICAgIGRlbm9taW5hdG9yT3B0aW9uczogZG91YmxlTnVtYmVyTGluZS5kZW5vbWluYXRvck9wdGlvbnMsXHJcbiAgICAgIGluZGljYXRvclhQcm9wZXJ0eTogb3B0aW9ucy5pbmRpY2F0b3JYUHJvcGVydHksXHJcbiAgICAgIGluZGljYXRvckNvbG9yOiBvcHRpb25zLmluZGljYXRvckNvbG9yXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gaG9tZSBwb3NpdGlvbnMgZm9yIG1hcmtlciBlZGl0b3IgYW5kIHVuZG8gYnV0dG9uLCB0byBsZWZ0IG9mIGF4ZXNcclxuICAgIGNvbnN0IG1hcmtlckVkaXRvck5vZGVIb21lWCA9IGRvdWJsZU51bWJlckxpbmVOb2RlLmxlZnQgLSAyODtcclxuICAgIGNvbnN0IHVuZG9CdXR0b25Ib21lUG9zaXRpb24gPSBuZXcgVmVjdG9yMiggbWFya2VyRWRpdG9yTm9kZUhvbWVYLCBkb3VibGVOdW1iZXJMaW5lTm9kZS5jZW50ZXJZICk7XHJcblxyXG4gICAgLy8gd2hlbiB0aGUgbWFya2VyIGVkaXRvciBleGNlZWRzIHRoZSByYW5nZSBvZiB0aGUgYXhlcywgbW92ZSBpdCB0byB0aGUgcmlnaHQgb2YgdGhlIGF4ZXNcclxuICAgIGNvbnN0IG1hcmtlckVkaXRvck5vZGVPdXRPZlJhbmdlWCA9IGRvdWJsZU51bWJlckxpbmVOb2RlLnggKyBkb3VibGVOdW1iZXJMaW5lTm9kZS5vdXRPZlJhbmdlWE9mZnNldDtcclxuXHJcbiAgICAvLyBtYXJrZXIgZWRpdG9yXHJcbiAgICBjb25zdCBtYXJrZXJFZGl0b3JOb2RlID0gbmV3IE1hcmtlckVkaXRvck5vZGUoIG1hcmtlckVkaXRvciwgdGhpc0JvdW5kc05vZGUsIGtleXBhZExheWVyLCB7XHJcbiAgICAgIG51bWVyYXRvck9wdGlvbnM6IGRvdWJsZU51bWJlckxpbmUubnVtZXJhdG9yT3B0aW9ucyxcclxuICAgICAgZGVub21pbmF0b3JPcHRpb25zOiBkb3VibGVOdW1iZXJMaW5lLmRlbm9taW5hdG9yT3B0aW9ucyxcclxuICAgICAga2V5cGFkUG9zaXRpb246IG9wdGlvbnMua2V5cGFkUG9zaXRpb24sXHJcbiAgICAgIHg6IG1hcmtlckVkaXRvck5vZGVIb21lWCxcclxuICAgICAgY2VudGVyWTogZG91YmxlTnVtYmVyTGluZU5vZGUuY2VudGVyWVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRoZSB1bmRvIGJ1dHRvbiBpcyBvdmVybG9hZGVkIChiYWQgZGVzaWduLCBpbW8pLCBhbmQgY2FuIGFwcGx5IHRvIGVpdGhlciB0aGUgbWFya2VyIGVkaXRvciBvciBhIG1hcmtlci5cclxuICAgIC8vIFRoaXMgZmxhZyBpbmRpY2F0ZXMgd2hldGhlciB0aGUgdW5kbyBidXR0b24gYXBwbGllcyB0byB0aGUgZWRpdG9yICh0cnVlKSBvciBhIG1hcmtlciAoZmFsc2UpLlxyXG4gICAgbGV0IHVuZG9BcHBsaWVzVG9FZGl0b3IgPSB0cnVlO1xyXG5cclxuICAgIC8vIFByZXNzaW5nIHRoZSB1bmRvIGJ1dHRvbiBtb3ZlcyB0aGUgbWFya2VyIGVkaXQgYmFjayB0byBpdHMgaG9tZSBwb3NpdGlvbixcclxuICAgIC8vIG9yIHJlbW92ZXMgdGhlIG1hcmtlciB0aGF0IHdhcyBtb3N0IHJlY2VudGx5IGFkZGVkIHVzaW5nIHRoZSBlZGl0b3IuXHJcbiAgICBjb25zdCB1bmRvQnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xyXG4gICAgICBjb250ZW50OiBuZXcgUGF0aCggdW5kb1NvbGlkU2hhcGUsIHtcclxuICAgICAgICBzY2FsZTogMC4wMywgLy8gdG8gYXBwcm94aW1hdGVseSBtYXRjaCBoZWlnaHQgb2YgbWFya2VyIGVkaXRvciBidXR0b25zLCBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICAgICAgZmlsbDogJ2JsYWNrJ1xyXG4gICAgICB9ICksXHJcbiAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICBiYXNlQ29sb3I6IFVSQ29sb3JzLnVuZG9CdXR0b24sXHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCB1bmRvQXBwbGllc1RvRWRpdG9yICkge1xyXG4gICAgICAgICAgbWFya2VyRWRpdG9yLnJlc2V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgZG91YmxlTnVtYmVyTGluZS51bmRvKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBjZW50ZXI6IHVuZG9CdXR0b25Ib21lUG9zaXRpb25cclxuICAgIH0gKTtcclxuICAgIHVuZG9CdXR0b24udG91Y2hBcmVhID0gdW5kb0J1dHRvbi5sb2NhbEJvdW5kcy5kaWxhdGVkWFkoIDUsIDUgKTtcclxuXHJcbiAgICAvLyBQcmVzc2luZyB0aGUgZXJhc2VyIGJ1dHRvbiBlcmFzZXMgYWxsICdlcmFzYWJsZScgbWFya2VycyBmcm9tIHRoZSBkb3VibGUgbnVtYmVyIGxpbmUuXHJcbiAgICBjb25zdCBlcmFzZXJCdXR0b24gPSBuZXcgRXJhc2VyQnV0dG9uKCB7XHJcbiAgICAgIHNjYWxlOiAwLjkyLCAvLyB0byBhcHByb3hpbWF0ZWx5IG1hdGNoIGhlaWdodCBvZiBtYXJrZXIgZWRpdG9yIGJ1dHRvbnMsIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgICAgYmFzZUNvbG9yOiBVUkNvbG9ycy5lcmFzZXJCdXR0b24sXHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiBkb3VibGVOdW1iZXJMaW5lLmVyYXNlKCksXHJcbiAgICAgIHJpZ2h0OiBkb3VibGVOdW1iZXJMaW5lTm9kZS5yaWdodCxcclxuICAgICAgYm90dG9tOiBtYXJrZXJFZGl0b3JOb2RlLmJvdHRvbVxyXG4gICAgfSApO1xyXG4gICAgZXJhc2VyQnV0dG9uLnRvdWNoQXJlYSA9IGVyYXNlckJ1dHRvbi5sb2NhbEJvdW5kcy5kaWxhdGVkWFkoIDUsIDUgKTtcclxuXHJcbiAgICAvLyBhc3NlbWJsZSB0aGUgY29udGVudCBmb3IgdGhlIGFjY29yZGlvbiBib3hcclxuICAgIGNvbnN0IGNvbnRlbnROb2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgZG91YmxlTnVtYmVyTGluZU5vZGUsIHVuZG9CdXR0b24sIG1hcmtlckVkaXRvck5vZGUsIGVyYXNlckJ1dHRvbiBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIGNvbnRlbnROb2RlLCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQWRqdXN0IHJlY3RhbmdsZSB0byBtYXRjaCBhY2NvcmRpb24gYm94IHNpemUuXHJcbiAgICB0aGlzQm91bmRzTm9kZS5zZXRSZWN0Qm91bmRzKCB0aGlzLmxvY2FsQm91bmRzICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzQm91bmRzTm9kZSApO1xyXG4gICAgdGhpc0JvdW5kc05vZGUubW92ZVRvQmFjaygpO1xyXG5cclxuICAgIC8vIHtBbmltYXRpb258bnVsbH0gYW5pbWF0aW9uIGZvciBtYXJrZXIgZWRpdG9yXHJcbiAgICBsZXQgbWFya2VyRWRpdG9yQW5pbWF0aW9uID0gbnVsbDtcclxuXHJcbiAgICAvLyBpZiBmYWxzZSwgbW92ZSB0aGUgbWFya2VyIGVkaXRvciBpbW1lZGlhdGVseSBpbnN0ZWFkIG9mIGFuaW1hdGluZy5cclxuICAgIC8vIFVzZWQgdG8gc2V0IHRoZSBlZGl0b3IncyBpbml0aWFsIHBvc2l0aW9uIG9uIHN0YXJ0dXAuXHJcbiAgICBsZXQgbWFya2VyRWRpdG9yQW5pbWF0aW9uRW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIE9ic2VydmUgbWFya2VyIGVkaXRvciwgdG8gcG9zaXRpb24gdGhlIGVkaXRvciBhbmQgY3JlYXRlIG1hcmtlcnMuXHJcbiAgICBjb25zdCBtYXJrZXJFZGl0b3JPYnNlcnZlciA9ICgpID0+IHtcclxuXHJcbiAgICAgIC8vIGxvY2FsIHZhcnMgdG8gaW1wcm92ZSByZWFkYWJpbGl0eVxyXG4gICAgICBjb25zdCBudW1lcmF0b3IgPSBtYXJrZXJFZGl0b3IubnVtZXJhdG9yUHJvcGVydHkudmFsdWU7XHJcbiAgICAgIGNvbnN0IGRlbm9taW5hdG9yID0gbWFya2VyRWRpdG9yLmRlbm9taW5hdG9yUHJvcGVydHkudmFsdWU7XHJcbiAgICAgIGNvbnN0IG1heE51bWVyYXRvciA9IGRvdWJsZU51bWJlckxpbmUuZ2V0TWF4TnVtZXJhdG9yKCk7XHJcbiAgICAgIGNvbnN0IG1heERlbm9taW5hdG9yID0gZG91YmxlTnVtYmVyTGluZS5nZXRNYXhEZW5vbWluYXRvcigpO1xyXG4gICAgICBjb25zdCBheGlzVmlld0xlbmd0aCA9IGRvdWJsZU51bWJlckxpbmVOb2RlLmF4aXNWaWV3TGVuZ3RoO1xyXG5cclxuICAgICAgLy8ge251bWJlcn0gZGVzdGluYXRpb24gZm9yIGhvcml6b250YWwgYW5pbWF0aW9uIG9mIG1hcmtlciBlZGl0b3IsIG51bGwgaW5kaWNhdGVzIHRoYXQgbm8gYW5pbWF0aW9uIGlzIHJlcXVpcmVkXHJcbiAgICAgIGxldCBkZXN0aW5hdGlvblggPSBudWxsO1xyXG5cclxuICAgICAgLy8gaWYgdGhlIG1hcmtlciBoYXMgYm90aCBhIG51bWVyYXRvciBhbmQgZGVub21pbmF0b3IuLi5cclxuICAgICAgaWYgKCBudW1lcmF0b3IgIT09IG51bGwgJiYgZGVub21pbmF0b3IgIT09IG51bGwgKSB7XHJcblxyXG4gICAgICAgIGlmICggZGVub21pbmF0b3IgPD0gbWF4RGVub21pbmF0b3IgKSB7XHJcblxyXG4gICAgICAgICAgLy8gY3JlYXRlIGEgbWFya2VyXHJcbiAgICAgICAgICBjb25zdCBpc01ham9yID0gZG91YmxlTnVtYmVyTGluZS5pc01ham9yTWFya2VyKCBudW1lcmF0b3IsIGRlbm9taW5hdG9yICk7XHJcbiAgICAgICAgICBjb25zdCBtYXJrZXIgPSBuZXcgTWFya2VyKCBudW1lcmF0b3IsIGRlbm9taW5hdG9yLCAnZWRpdG9yJywge1xyXG4gICAgICAgICAgICBpc01ham9yOiBpc01ham9yLFxyXG4gICAgICAgICAgICBjb2xvcjogaXNNYWpvciA/IFVSQ29sb3JzLm1ham9yTWFya2VyIDogVVJDb2xvcnMubWlub3JNYXJrZXJcclxuICAgICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgICAvLyBSZXR1cm4gdGhlIG1hcmtlciBlZGl0b3IgdG8gaXRzIGhvbWUgcG9zaXRpb24uXHJcbiAgICAgICAgICAvLyBEbyB0aGlzIGJlZm9yZSBhZGRpbmcgdGhlIG1hcmtlciBzbyB0aGF0IHRoZSB1bmRvIGJ1dHRvbiBpcyBhc3NvY2lhdGVkIHdpdGggdGhlIG1hcmtlci5cclxuICAgICAgICAgIG1hcmtlckVkaXRvci5yZXNldCgpO1xyXG5cclxuICAgICAgICAgIC8vIGFkZCBtYXJrZXIgdG8gZG91YmxlIG51bWJlciBsaW5lXHJcbiAgICAgICAgICBpZiAoIGRvdWJsZU51bWJlckxpbmUuYWRkTWFya2VyKCBtYXJrZXIgKSApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGFsbG93IHRoZSBuZXcgbWFya2VyIHRvIGJlIHVuZG9uZVxyXG4gICAgICAgICAgICBkb3VibGVOdW1iZXJMaW5lLnVuZG9NYXJrZXJQcm9wZXJ0eS52YWx1ZSA9IG1hcmtlcjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gbWFya2VyIGlzIG91dCBvZiByYW5nZSwgbW92ZSBlZGl0b3IgdG8gcmlnaHQgb2YgYXhpcyBhcnJvd3NcclxuICAgICAgICAgIGRlc3RpbmF0aW9uWCA9IG1hcmtlckVkaXRvck5vZGVPdXRPZlJhbmdlWDtcclxuXHJcbiAgICAgICAgICAvLyB1bmRvIGJ1dHRvbiBpcyB2aXNpYmxlIHRvIGxlZnQgb2YgYXhlc1xyXG4gICAgICAgICAgaWYgKCB1bmRvQXBwbGllc1RvRWRpdG9yICkge1xyXG4gICAgICAgICAgICB1bmRvQnV0dG9uLmNlbnRlciA9IHVuZG9CdXR0b25Ib21lUG9zaXRpb247XHJcbiAgICAgICAgICAgIHVuZG9CdXR0b24udmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgeyAvLyBtYXJrZXIgaXMgbm90IGZ1bGx5IHNwZWNpZmllZFxyXG5cclxuICAgICAgICAvLyB1bmRvIG1hcmtlciBpcyBsb3N0IHdoZW4gd2Ugc3RhcnQgdXNpbmcgdGhlIGVkaXRvclxyXG4gICAgICAgIGlmICggZG91YmxlTnVtYmVyTGluZS51bmRvTWFya2VyUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICBkb3VibGVOdW1iZXJMaW5lLnVuZG9NYXJrZXJQcm9wZXJ0eS52YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIG51bWVyYXRvciA9PT0gbnVsbCAmJiBkZW5vbWluYXRvciA9PT0gbnVsbCApIHtcclxuXHJcbiAgICAgICAgICAvLyBib3RoIHZhbHVlcyBhcmUgZW1wdHksIG1vdmUgbWFya2VyIGVkaXRvciBiYWNrIHRvIGhvbWUgcG9zaXRpb25cclxuICAgICAgICAgIGRlc3RpbmF0aW9uWCA9IG1hcmtlckVkaXRvck5vZGVIb21lWDtcclxuXHJcbiAgICAgICAgICAvLyBoaWRlIHVuZG8gYnV0dG9uXHJcbiAgICAgICAgICB1bmRvQnV0dG9uLmNlbnRlciA9IHVuZG9CdXR0b25Ib21lUG9zaXRpb247XHJcbiAgICAgICAgICB1bmRvQnV0dG9uLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7IC8vIG9uZSBvZiB0aGUgMiB2YWx1ZXMgaXMgZmlsbGVkIGluXHJcblxyXG4gICAgICAgICAgaWYgKCBudW1lcmF0b3IgIT09IG51bGwgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBudW1lcmF0b3IgaXMgZmlsbGVkIGluXHJcbiAgICAgICAgICAgIGlmICggbnVtZXJhdG9yID4gbWF4TnVtZXJhdG9yICkge1xyXG5cclxuICAgICAgICAgICAgICAvLyBtb3ZlIG1hcmtlciBlZGl0b3IgdG8gcmlnaHQgb2YgYXhpcyBhcnJvd3NcclxuICAgICAgICAgICAgICBkZXN0aW5hdGlvblggPSBtYXJrZXJFZGl0b3JOb2RlT3V0T2ZSYW5nZVg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIG1vdmUgbWFya2VyIGVkaXRvciB0byBwb3NpdGlvbiBvZiBudW1lcmF0b3JcclxuICAgICAgICAgICAgICBkZXN0aW5hdGlvblggPSBkb3VibGVOdW1iZXJMaW5lTm9kZS54ICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3VibGVOdW1iZXJMaW5lLm1vZGVsVG9WaWV3TnVtZXJhdG9yKCBudW1lcmF0b3IsIGF4aXNWaWV3TGVuZ3RoICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkZW5vbWluYXRvciAhPT0gbnVsbCwgJ2V4cGVjdGVkIGEgdmFsaWQgZGVub21pbmF0b3InICk7XHJcblxyXG4gICAgICAgICAgICAvLyBkZW5vbWluYXRvciBpcyBmaWxsZWQgaW5cclxuICAgICAgICAgICAgaWYgKCBkZW5vbWluYXRvciA+IG1heERlbm9taW5hdG9yICkge1xyXG5cclxuICAgICAgICAgICAgICAvLyBtb3ZlIG1hcmtlciBlZGl0b3IgdG8gcmlnaHQgb2YgYXhpcyBhcnJvd3NcclxuICAgICAgICAgICAgICBkZXN0aW5hdGlvblggPSBtYXJrZXJFZGl0b3JOb2RlT3V0T2ZSYW5nZVg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIG1vdmUgbWFya2VyIGVkaXRvciB0byBwb3NpdGlvbiBvZiBkZW5vbWluYXRvclxyXG4gICAgICAgICAgICAgIGRlc3RpbmF0aW9uWCA9IGRvdWJsZU51bWJlckxpbmVOb2RlLnggK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvdWJsZU51bWJlckxpbmUubW9kZWxUb1ZpZXdEZW5vbWluYXRvciggZGVub21pbmF0b3IsIGF4aXNWaWV3TGVuZ3RoICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyB1bmRvIGJ1dHRvbiBpcyB2aXNpYmxlIHRvIGxlZnQgb2YgYXhlc1xyXG4gICAgICAgICAgdW5kb0J1dHRvbi5jZW50ZXIgPSB1bmRvQnV0dG9uSG9tZVBvc2l0aW9uO1xyXG4gICAgICAgICAgdW5kb0J1dHRvbi52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGlmIHdlIG5lZWQgdG8gbW92ZSB0aGUgbWFya2VyIGVkaXRvci4uLlxyXG4gICAgICBpZiAoIGRlc3RpbmF0aW9uWCAhPT0gbnVsbCApIHtcclxuXHJcbiAgICAgICAgaWYgKCAhbWFya2VyRWRpdG9yQW5pbWF0aW9uRW5hYmxlZCApIHtcclxuXHJcbiAgICAgICAgICAvLyBubyBhbmltYXRpb24sIG1vdmUgaW1tZWRpYXRlbHlcclxuICAgICAgICAgIG1hcmtlckVkaXRvck5vZGUueCA9IGRlc3RpbmF0aW9uWDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gc3RvcCBhbnkgYW5pbWF0aW9uIHRoYXQgaXMgaW4gcHJvZ3Jlc3NcclxuICAgICAgICAgIG1hcmtlckVkaXRvckFuaW1hdGlvbiAmJiBtYXJrZXJFZGl0b3JBbmltYXRpb24uc3RvcCgpO1xyXG5cclxuICAgICAgICAgIG1hcmtlckVkaXRvckFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oIHtcclxuICAgICAgICAgICAgZHVyYXRpb246IDAuMDAyICogTWF0aC5hYnMoIGRlc3RpbmF0aW9uWCAtIG1hcmtlckVkaXRvck5vZGUueCApLCAvLyAybXMgcGVyIDEgdW5pdCBvZiBkaXN0YW5jZVxyXG4gICAgICAgICAgICBlYXNpbmc6IEVhc2luZy5RVUFEUkFUSUNfSU5fT1VULFxyXG4gICAgICAgICAgICBvYmplY3Q6IG1hcmtlckVkaXRvck5vZGUsXHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZTogJ3gnLFxyXG4gICAgICAgICAgICB0bzogZGVzdGluYXRpb25YXHJcbiAgICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgICAgbWFya2VyRWRpdG9yQW5pbWF0aW9uLnN0YXJ0RW1pdHRlci5hZGRMaXN0ZW5lciggZnVuY3Rpb24gc3RhcnRMaXN0ZW5lcigpIHtcclxuICAgICAgICAgICAgbWFya2VyRWRpdG9yTm9kZS5waWNrYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBtYXJrZXJFZGl0b3JBbmltYXRpb24uc3RhcnRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBzdGFydExpc3RlbmVyICk7XHJcbiAgICAgICAgICAgIG1hcmtlckVkaXRvckFuaW1hdGlvbi5lbmRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGZ1bmN0aW9uIGVuZGVkTGlzdGVuZXIoKSB7XHJcbiAgICAgICAgICAgICAgbWFya2VyRWRpdG9yTm9kZS5waWNrYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgbWFya2VyRWRpdG9yQW5pbWF0aW9uLmVuZGVkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggZW5kZWRMaXN0ZW5lciApO1xyXG4gICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgICAgbWFya2VyRWRpdG9yQW5pbWF0aW9uLnN0YXJ0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgbWFya2VyRWRpdG9yLm51bWVyYXRvclByb3BlcnR5LmxpbmsoIG1hcmtlckVkaXRvck9ic2VydmVyICk7IC8vIHVubGluayBpbiBkaXNwb3NlXHJcbiAgICBtYXJrZXJFZGl0b3IuZGVub21pbmF0b3JQcm9wZXJ0eS5saW5rKCBtYXJrZXJFZGl0b3JPYnNlcnZlciApOyAvLyB1bmxpbmsgaW4gZGlzcG9zZVxyXG4gICAgbWFya2VyRWRpdG9yQW5pbWF0aW9uRW5hYmxlZCA9IHRydWU7XHJcblxyXG4gICAgLy8gT2JzZXJ2ZSB0aGUgJ3VuZG8nIG1hcmtlci4gT25lIGxldmVsIG9mIHVuZG8gaXMgc3VwcG9ydGVkLCBhbmQgdGhlIHVuZG8gYnV0dG9uIGlzIG92ZXJsb2FkZWQuXHJcbiAgICAvLyBBcyBzb29uIGFzIHlvdSBlbnRlciBhIHZhbHVlIHVzaW5nIHRoZSBtYXJrZXIgZWRpdG9yLCB5b3UgbG9zZSB0aGUgYWJpbGl0eSB0byB1bmRvIHRoZSBwcmV2aW91cyBtYXJrZXIuXHJcbiAgICBjb25zdCB1bmRvTWFya2VyT2JzZXJ2ZXIgPSBtYXJrZXIgPT4ge1xyXG4gICAgICBpZiAoIG1hcmtlciApIHtcclxuXHJcbiAgICAgICAgLy8gYXNzb2NpYXRlIHRoZSB1bmRvIGJ1dHRvbiB3aXRoIHRoZSBtYXJrZXJcclxuICAgICAgICB1bmRvQXBwbGllc1RvRWRpdG9yID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIFBvc2l0aW9uIHRoZSB1bmRvIGJ1dHRvbiBiZWxvdyB0aGUgdW5kb2FibGUgbWFya2VyXHJcbiAgICAgICAgdW5kb0J1dHRvbi5jZW50ZXJYID0gZG91YmxlTnVtYmVyTGluZS5tb2RlbFRvVmlld0Rlbm9taW5hdG9yKCBtYXJrZXIuZGVub21pbmF0b3JQcm9wZXJ0eS52YWx1ZSwgZG91YmxlTnVtYmVyTGluZU5vZGUuYXhpc1ZpZXdMZW5ndGggKTtcclxuICAgICAgICB1bmRvQnV0dG9uLmJvdHRvbSA9IG1hcmtlckVkaXRvck5vZGUuYm90dG9tO1xyXG4gICAgICAgIHVuZG9CdXR0b24udmlzaWJsZSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIGFzc29jaWF0ZSB0aGUgdW5kbyBidXR0b24gd2l0aCB0aGUgZWRpdG9yXHJcbiAgICAgICAgdW5kb0FwcGxpZXNUb0VkaXRvciA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIE1vdmUgdGhlIHVuZG8gYnV0dG9uIHRvIGl0cyBob21lIHBvc2l0aW9uLCBpbnZpc2libGUgaWYgdGhlIG1hcmtlciBlZGl0b3IgY29udGFpbnMgbm8gdmFsdWVzXHJcbiAgICAgICAgdW5kb0J1dHRvbi5jZW50ZXIgPSB1bmRvQnV0dG9uSG9tZVBvc2l0aW9uO1xyXG4gICAgICAgIHVuZG9CdXR0b24udmlzaWJsZSA9ICFtYXJrZXJFZGl0b3IuaXNFbXB0eSgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgZG91YmxlTnVtYmVyTGluZS51bmRvTWFya2VyUHJvcGVydHkubGluayggdW5kb01hcmtlck9ic2VydmVyICk7IC8vIHVubGluayBpbiBkaXNwb3NlXHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZGlzcG9zZURvdWJsZU51bWJlckxpbmVBY2NvcmRpb25Cb3ggPSAoKSA9PiB7XHJcblxyXG4gICAgICAvLyBtb2RlbCBjbGVhbnVwXHJcbiAgICAgIGRvdWJsZU51bWJlckxpbmUudW5kb01hcmtlclByb3BlcnR5LnVubGluayggdW5kb01hcmtlck9ic2VydmVyICk7XHJcbiAgICAgIG1hcmtlckVkaXRvci5udW1lcmF0b3JQcm9wZXJ0eS51bmxpbmsoIG1hcmtlckVkaXRvck9ic2VydmVyICk7XHJcbiAgICAgIG1hcmtlckVkaXRvci5kZW5vbWluYXRvclByb3BlcnR5LnVubGluayggbWFya2VyRWRpdG9yT2JzZXJ2ZXIgKTtcclxuXHJcbiAgICAgIC8vIHZpZXcgY2xlYW51cFxyXG4gICAgICBtYXJrZXJFZGl0b3JBbmltYXRpb24gJiYgbWFya2VyRWRpdG9yQW5pbWF0aW9uLnN0b3AoKTtcclxuICAgICAgbWFya2VyRWRpdG9yTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgIGRvdWJsZU51bWJlckxpbmVOb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgZXJhc2VyQnV0dG9uLmRpc3Bvc2UoKTsgLy8gd29ya2Fyb3VuZCBmb3IgbWVtb3J5IGxlYWsgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3VuaXQtcmF0ZXMvaXNzdWVzLzIwN1xyXG4gICAgICB1bmRvQnV0dG9uLmRpc3Bvc2UoKTsgLy8gd29ya2Fyb3VuZCBmb3IgbWVtb3J5IGxlYWsgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3VuaXQtcmF0ZXMvaXNzdWVzLzIwN1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSByZXF1aXJlZCBieSBwcm90b3R5cGUgZnVuY3Rpb25zXHJcbiAgICB0aGlzLmRvdWJsZU51bWJlckxpbmVOb2RlID0gZG91YmxlTnVtYmVyTGluZU5vZGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuZGlzcG9zZURvdWJsZU51bWJlckxpbmVBY2NvcmRpb25Cb3goKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG9yaWdpbiBvZiB0aGUgZG91YmxlIG51bWJlciBsaW5lJ3Mgb3JpZ2luIGluIHRoZSBnbG9iYWwgdmlldyBjb29yZGluYXRlIGZyYW1lLlxyXG4gICAqIFRoaXMgaXMgdXNlZCB0byBsaW5lIHVwIG90aGVyIHRoaW5ncyAobGlrZSB0aGUgcmFjZSB0cmFjayBpbiAnUmFjaW5nIExhYicgc2NyZWVuKSB3aXRoIHRoZSBkb3VibGUgbnVtYmVyIGxpbmUuXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldEdsb2JhbE9yaWdpbigpIHtcclxuICAgIHJldHVybiB0aGlzLmRvdWJsZU51bWJlckxpbmVOb2RlLnBhcmVudFRvR2xvYmFsUG9pbnQoIG5ldyBWZWN0b3IyKCB0aGlzLmRvdWJsZU51bWJlckxpbmVOb2RlLngsIHRoaXMuZG91YmxlTnVtYmVyTGluZU5vZGUueSApICk7XHJcbiAgfVxyXG59XHJcblxyXG51bml0UmF0ZXMucmVnaXN0ZXIoICdEb3VibGVOdW1iZXJMaW5lQWNjb3JkaW9uQm94JywgRG91YmxlTnVtYmVyTGluZUFjY29yZGlvbkJveCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFlBQVksTUFBTSxxREFBcUQ7QUFDOUUsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUMvRSxPQUFPQyxjQUFjLE1BQU0sdURBQXVEO0FBQ2xGLE9BQU9DLFlBQVksTUFBTSxvQ0FBb0M7QUFDN0QsT0FBT0MscUJBQXFCLE1BQU0scURBQXFEO0FBQ3ZGLE9BQU9DLFNBQVMsTUFBTSxtQ0FBbUM7QUFDekQsT0FBT0MsTUFBTSxNQUFNLGdDQUFnQztBQUNuRCxPQUFPQyxTQUFTLE1BQU0sb0JBQW9CO0FBQzFDLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyxNQUFNLE1BQU0sb0JBQW9CO0FBQ3ZDLE9BQU9DLFFBQVEsTUFBTSxnQkFBZ0I7QUFDckMsT0FBT0MsV0FBVyxNQUFNLG1CQUFtQjtBQUMzQyxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFDNUQsT0FBT0MsZ0JBQWdCLE1BQU0sdUJBQXVCO0FBRXBELGVBQWUsTUFBTUMsNEJBQTRCLFNBQVNYLFlBQVksQ0FBQztFQUVyRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVksV0FBV0EsQ0FBRUMsZ0JBQWdCLEVBQUVDLFlBQVksRUFBRUMsV0FBVyxFQUFFQyxPQUFPLEVBQUc7SUFFbEVBLE9BQU8sR0FBR3ZCLEtBQUssQ0FBRSxDQUFDLENBQUMsRUFBRWUsV0FBVyxDQUFDUyxxQkFBcUIsRUFBRTtNQUV0RDtNQUNBQyxXQUFXLEVBQUViLGdCQUFnQixDQUFDYyw4QkFBOEI7TUFBRTtNQUM5REMs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