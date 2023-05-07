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
  constructor( doubleNumberLine, markerEditor, keypadLayer, options ) {

    options = merge( {}, URConstants.ACCORDION_BOX_OPTIONS, {

      // DoubleNumberLineAccordionBox options
      titleString: UnitRatesStrings.doubleNumberLineStringProperty, // title displayed next to the expand/collapse button
      keypadPosition: 'below', // {string} whether the keypad is 'above' or 'below' the double number line

      // DoubleNumberLineNode options
      axisViewLength: 1000, // {number} view length of doubleNumberLine's range
      indicatorXProperty: null, // {Property.<number>|null} position of the indicator, in view coordinates. null means no indicator.
      indicatorColor: 'green' // {Color|string} color of the indicator

    }, options );

    // An invisible rectangle that has the same bounds as the accordion box. Used to position the keypad.
    // Dimensions will be set after calling super.  This was added so when converting to an ES6 class, because
    // we can't use this before super.  See https://github.com/phetsims/tasks/issues/1026#issuecomment-594357784
    const thisBoundsNode = new Rectangle( 0, 0, 1, 1, {
      visible: false,
      pickable: false
    } );

    // title on the accordion box
    assert && assert( !options.titleNode, 'creates its own title node' );
    options.titleNode = new Text( options.titleString, {
      font: URConstants.ACCORDION_BOX_TITLE_FONT,
      maxWidth: 300 // i18n, determined empirically
    } );

    // double number line
    const doubleNumberLineNode = new DoubleNumberLineNode( doubleNumberLine, {
      axisViewLength: options.axisViewLength,
      numeratorOptions: doubleNumberLine.numeratorOptions,
      denominatorOptions: doubleNumberLine.denominatorOptions,
      indicatorXProperty: options.indicatorXProperty,
      indicatorColor: options.indicatorColor
    } );

    // home positions for marker editor and undo button, to left of axes
    const markerEditorNodeHomeX = doubleNumberLineNode.left - 28;
    const undoButtonHomePosition = new Vector2( markerEditorNodeHomeX, doubleNumberLineNode.centerY );

    // when the marker editor exceeds the range of the axes, move it to the right of the axes
    const markerEditorNodeOutOfRangeX = doubleNumberLineNode.x + doubleNumberLineNode.outOfRangeXOffset;

    // marker editor
    const markerEditorNode = new MarkerEditorNode( markerEditor, thisBoundsNode, keypadLayer, {
      numeratorOptions: doubleNumberLine.numeratorOptions,
      denominatorOptions: doubleNumberLine.denominatorOptions,
      keypadPosition: options.keypadPosition,
      x: markerEditorNodeHomeX,
      centerY: doubleNumberLineNode.centerY
    } );

    // The undo button is overloaded (bad design, imo), and can apply to either the marker editor or a marker.
    // This flag indicates whether the undo button applies to the editor (true) or a marker (false).
    let undoAppliesToEditor = true;

    // Pressing the undo button moves the marker edit back to its home position,
    // or removes the marker that was most recently added using the editor.
    const undoButton = new RectangularPushButton( {
      content: new Path( undoSolidShape, {
        scale: 0.03, // to approximately match height of marker editor buttons, determined empirically
        fill: 'black'
      } ),
      visible: false,
      baseColor: URColors.undoButton,
      listener: () => {
        if ( undoAppliesToEditor ) {
          markerEditor.reset();
        }
        else {
          doubleNumberLine.undo();
        }
      },
      center: undoButtonHomePosition
    } );
    undoButton.touchArea = undoButton.localBounds.dilatedXY( 5, 5 );

    // Pressing the eraser button erases all 'erasable' markers from the double number line.
    const eraserButton = new EraserButton( {
      scale: 0.92, // to approximately match height of marker editor buttons, determined empirically
      baseColor: URColors.eraserButton,
      listener: () => doubleNumberLine.erase(),
      right: doubleNumberLineNode.right,
      bottom: markerEditorNode.bottom
    } );
    eraserButton.touchArea = eraserButton.localBounds.dilatedXY( 5, 5 );

    // assemble the content for the accordion box
    const contentNode = new Node( {
      children: [ doubleNumberLineNode, undoButton, markerEditorNode, eraserButton ]
    } );

    super( contentNode, options );

    // Adjust rectangle to match accordion box size.
    thisBoundsNode.setRectBounds( this.localBounds );
    this.addChild( thisBoundsNode );
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
      if ( numerator !== null && denominator !== null ) {

        if ( denominator <= maxDenominator ) {

          // create a marker
          const isMajor = doubleNumberLine.isMajorMarker( numerator, denominator );
          const marker = new Marker( numerator, denominator, 'editor', {
            isMajor: isMajor,
            color: isMajor ? URColors.majorMarker : URColors.minorMarker
          } );

          // Return the marker editor to its home position.
          // Do this before adding the marker so that the undo button is associated with the marker.
          markerEditor.reset();

          // add marker to double number line
          if ( doubleNumberLine.addMarker( marker ) ) {

            // allow the new marker to be undone
            doubleNumberLine.undoMarkerProperty.value = marker;
          }
        }
        else {

          // marker is out of range, move editor to right of axis arrows
          destinationX = markerEditorNodeOutOfRangeX;

          // undo button is visible to left of axes
          if ( undoAppliesToEditor ) {
            undoButton.center = undoButtonHomePosition;
            undoButton.visible = true;
          }
        }
      }
      else { // marker is not fully specified

        // undo marker is lost when we start using the editor
        if ( doubleNumberLine.undoMarkerProperty.value ) {
          doubleNumberLine.undoMarkerProperty.value = null;
        }

        if ( numerator === null && denominator === null ) {

          // both values are empty, move marker editor back to home position
          destinationX = markerEditorNodeHomeX;

          // hide undo button
          undoButton.center = undoButtonHomePosition;
          undoButton.visible = false;
        }
        else { // one of the 2 values is filled in

          if ( numerator !== null ) {

            // numerator is filled in
            if ( numerator > maxNumerator ) {

              // move marker editor to right of axis arrows
              destinationX = markerEditorNodeOutOfRangeX;
            }
            else {

              // move marker editor to position of numerator
              destinationX = doubleNumberLineNode.x +
                             doubleNumberLine.modelToViewNumerator( numerator, axisViewLength );
            }
          }
          else {
            assert && assert( denominator !== null, 'expected a valid denominator' );

            // denominator is filled in
            if ( denominator > maxDenominator ) {

              // move marker editor to right of axis arrows
              destinationX = markerEditorNodeOutOfRangeX;
            }
            else {

              // move marker editor to position of denominator
              destinationX = doubleNumberLineNode.x +
                             doubleNumberLine.modelToViewDenominator( denominator, axisViewLength );
            }
          }

          // undo button is visible to left of axes
          undoButton.center = undoButtonHomePosition;
          undoButton.visible = true;
        }
      }

      // if we need to move the marker editor...
      if ( destinationX !== null ) {

        if ( !markerEditorAnimationEnabled ) {

          // no animation, move immediately
          markerEditorNode.x = destinationX;
        }
        else {

          // stop any animation that is in progress
          markerEditorAnimation && markerEditorAnimation.stop();

          markerEditorAnimation = new Animation( {
            duration: 0.002 * Math.abs( destinationX - markerEditorNode.x ), // 2ms per 1 unit of distance
            easing: Easing.QUADRATIC_IN_OUT,
            object: markerEditorNode,
            attribute: 'x',
            to: destinationX
          } );

          markerEditorAnimation.startEmitter.addListener( function startListener() {
            markerEditorNode.pickable = false;
            markerEditorAnimation.startEmitter.removeListener( startListener );
            markerEditorAnimation.endedEmitter.addListener( function endedListener() {
              markerEditorNode.pickable = true;
              markerEditorAnimation.endedEmitter.removeListener( endedListener );
            } );
          } );

          markerEditorAnimation.start();
        }
      }
    };
    markerEditor.numeratorProperty.link( markerEditorObserver ); // unlink in dispose
    markerEditor.denominatorProperty.link( markerEditorObserver ); // unlink in dispose
    markerEditorAnimationEnabled = true;

    // Observe the 'undo' marker. One level of undo is supported, and the undo button is overloaded.
    // As soon as you enter a value using the marker editor, you lose the ability to undo the previous marker.
    const undoMarkerObserver = marker => {
      if ( marker ) {

        // associate the undo button with the marker
        undoAppliesToEditor = false;

        // Position the undo button below the undoable marker
        undoButton.centerX = doubleNumberLine.modelToViewDenominator( marker.denominatorProperty.value, doubleNumberLineNode.axisViewLength );
        undoButton.bottom = markerEditorNode.bottom;
        undoButton.visible = true;
      }
      else {

        // associate the undo button with the editor
        undoAppliesToEditor = true;

        // Move the undo button to its home position, invisible if the marker editor contains no values
        undoButton.center = undoButtonHomePosition;
        undoButton.visible = !markerEditor.isEmpty();
      }
    };
    doubleNumberLine.undoMarkerProperty.link( undoMarkerObserver ); // unlink in dispose

    // @private
    this.disposeDoubleNumberLineAccordionBox = () => {

      // model cleanup
      doubleNumberLine.undoMarkerProperty.unlink( undoMarkerObserver );
      markerEditor.numeratorProperty.unlink( markerEditorObserver );
      markerEditor.denominatorProperty.unlink( markerEditorObserver );

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
    return this.doubleNumberLineNode.parentToGlobalPoint( new Vector2( this.doubleNumberLineNode.x, this.doubleNumberLineNode.y ) );
  }
}

unitRates.register( 'DoubleNumberLineAccordionBox', DoubleNumberLineAccordionBox );