// Copyright 2016-2023, University of Colorado Boulder

/**
 * Maker editor, used to manually enter markers on the double number line.
 * Values are entered via a keypad.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { FireListener, Line, Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import editRegularShape from '../../../../sherpa/js/fontawesome-5/editRegularShape.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import unitRates from '../../unitRates.js';
import URColors from '../URColors.js';
import URConstants from '../URConstants.js';
import URUtils from '../URUtils.js';

// constants
const KEYPAD_POSITION_VALUES = [ 'above', 'below' ];
const SHARED_OPTIONS = {
  maxDigits: 4, // {number} maximum number of digits that can be entered via keypad
  maxDecimals: 1, // {number} maximum number of decimal places that can be entered via keypad
  trimZeros: false // {boolean} whether to trim trailing zeros from decimal places
};

export default class MarkerEditorNode extends Node {

  /**
   * @param {MarkerEditor} markerEditor
   * @param {Node} doubleNumberLinePanel - panel that contains the double number line, for positioning the keypad
   * @param {KeypadLayer} keypadLayer - layer that manages the keypad
   * @param {Object} [options]
   */
  constructor( markerEditor, doubleNumberLinePanel, keypadLayer, options ) {

    options = merge( {
      lineLength: URConstants.MAJOR_MARKER_LENGTH, // {number} length of the vertical line between numerator and denominator values
      valueBoxWidth: 55, // {number} width of the value field, height determined by valueFont
      valueFont: new PhetFont( 12 ), // {Font} font for the value
      valueColor: 'black', // {Color|string} color of the value
      zeroIsValid: false, // {boolean} zero is not a valid value for markers
      valueXMargin: 5, // {number} horizontal margin inside the value box
      valueYMargin: URConstants.MARKER_Y_SPACING, // {number} vertical margin inside the value box
      ySpacing: 3,  // {number} vertical spacing between UI elements
      keypadPosition: 'below', // {string} 'above' or 'below' doubleNumberLinePanel
      numeratorOptions: null, // {*} options specific to the rate's numerator, see below
      denominatorOptions: null // {*} options specific to the rate's denominator, see below
    }, options );

    const numeratorOptions = merge( {}, SHARED_OPTIONS, options.numeratorOptions );

    const denominatorOptions = merge( {}, SHARED_OPTIONS, options.denominatorOptions );

    assert && assert( _.includes( KEYPAD_POSITION_VALUES, options.keypadPosition ),
      `invalid keypadPosition: ${options.keypadPosition}` );

    super();

    // vertical line
    const verticalLine = new Line( 0, 0, 0, options.lineLength, {
      stroke: 'black'
    } );
    this.addChild( verticalLine );

    // common to both value boxes
    const valueBoxWidth = options.valueBoxWidth;
    const valueBoxHeight = new Text( '0', { font: options.valueFont } ).height + ( 2 * options.valueYMargin );
    const valueBoxOptions = {
      stroke: 'black',
      fill: 'white',
      cursor: 'pointer'
    };

    // box for the numerator
    const numeratorBox = new Rectangle( 0, 0, valueBoxWidth, valueBoxHeight,
      merge( {}, valueBoxOptions, {
        centerX: verticalLine.centerX,
        bottom: verticalLine.top
      } ) );
    this.addChild( numeratorBox );

    // box for the denominator
    const denominatorBox = new Rectangle( 0, 0, valueBoxWidth, valueBoxHeight,
      merge( {}, valueBoxOptions, {
        centerX: verticalLine.centerX,
        top: verticalLine.bottom
      } ) );
    this.addChild( denominatorBox );

    // numerator value
    const numeratorNode = new Text( '', {
      pickable: false, // so it doesn't interfere with clicking in numeratorBox to open keypad
      fill: options.neutralColor,
      font: options.valueFont,
      center: numeratorBox.center
    } );
    this.addChild( numeratorNode );

    // denominator value
    const denominatorNode = new Text( '', {
      pickable: false, // so it doesn't interfere with clicking in denominatorBox to open keypad
      fill: options.neutralColor,
      font: options.valueFont,
      center: denominatorBox.center
    } );
    this.addChild( denominatorNode );

    // edit button for the numerator
    const numeratorEditButton = new RectangularPushButton( {
      content: new Path( editRegularShape, {
        scale: URConstants.EDIT_ICON_SCALE,
        fill: 'black'
      } ),
      baseColor: URColors.editButton,
      centerX: verticalLine.centerX,
      bottom: numeratorBox.top - options.ySpacing
    } );
    this.addChild( numeratorEditButton );
    numeratorEditButton.touchArea = numeratorEditButton.localBounds.dilatedXY( 10, 0 );

    // edit button for the denominator
    const denominatorEditButton = new RectangularPushButton( {
      content: new Path( editRegularShape, {
        scale: URConstants.EDIT_ICON_SCALE,
        fill: 'black'
      } ),
      baseColor: URColors.editButton,
      centerX: verticalLine.centerX,
      top: denominatorBox.bottom + options.ySpacing
    } );
    this.addChild( denominatorEditButton );
    denominatorEditButton.touchArea = denominatorEditButton.localBounds.dilatedXY( 10, 0 );

    this.mutate( options );

    // Sets the position of the keypad
    const setKeypadPosition = keypad => {

      // This algorithm assumes that both buttons have the same centerX,
      // so either button can be used for horizontal positioning.
      assert && assert( numeratorEditButton.centerX === denominatorEditButton.centerX );

      // position the keypad relative to edit button and double number line panel
      const doubleNumberLinePanelBounds =
        keypad.globalToParentBounds( doubleNumberLinePanel.localToGlobalBounds( doubleNumberLinePanel.localBounds ) );
      const editButtonBounds =
        keypad.globalToParentBounds( numeratorEditButton.localToGlobalBounds( numeratorEditButton.localBounds ) );

      // Try to horizontally center the keypad on the edit button,
      // but don't let it go past the ends of the double number line panel.
      keypad.centerX = editButtonBounds.centerX;
      if ( keypad.left < doubleNumberLinePanelBounds.left ) {
        keypad.left = doubleNumberLinePanelBounds.left;
      }
      else if ( keypad.right > doubleNumberLinePanelBounds.right ) {
        keypad.right = doubleNumberLinePanelBounds.right;
      }

      // Put the key pad above or below the double number line panel.
      if ( options.keypadPosition === 'above' ) {
        keypad.bottom = doubleNumberLinePanelBounds.top - 10;
      }
      else { // 'below'
        keypad.top = doubleNumberLinePanelBounds.bottom + 10;
      }
    };

    // opens a keypad for editing the numerator
    const editNumerator = () => {
      keypadLayer.beginEdit( markerEditor.numeratorProperty, {
        onBeginEdit: () => { numeratorBox.fill = URColors.edit; },
        onEndEdit: () => { numeratorBox.fill = 'white'; },
        setKeypadPosition: setKeypadPosition,
        maxDigits: numeratorOptions.maxDigits,
        maxDecimals: numeratorOptions.maxDecimals,
        zeroIsValid: options.zeroIsValid
      } );
    };

    // opens a keypad for editing the denominator
    const editDenominator = () => {
      keypadLayer.beginEdit( markerEditor.denominatorProperty, {
        onBeginEdit: () => { denominatorBox.fill = URColors.edit; },
        onEndEdit: () => { denominatorBox.fill = 'white'; },
        setKeypadPosition: setKeypadPosition,
        maxDigits: denominatorOptions.maxDigits,
        maxDecimals: denominatorOptions.maxDecimals,
        zeroIsValid: options.zeroIsValid
      } );
    };

    // Press on an edit button or box to begin editing
    numeratorEditButton.addListener( editNumerator ); // no removeListener required
    numeratorBox.addInputListener( new FireListener( { // no removeInputListener required
      fire: editNumerator
    } ) );
    denominatorEditButton.addListener( editDenominator ); // no removeListener required
    denominatorBox.addInputListener( new FireListener( { // no removeInputListener required
      fire: editDenominator
    } ) );

    // Observe edits to the numerator
    const numeratorObserver = numerator => {
      assert && assert( !isNaN( numerator ), `invalid numerator: ${numerator}` );

      // update the numerator
      if ( numerator ) {
        numeratorNode.string = URUtils.numberToString( numerator, numeratorOptions.maxDecimals, numeratorOptions.trimZeros );
      }
      else {
        numeratorNode.string = '';
      }
      numeratorNode.fill = options.valueColor;
      numeratorNode.center = numeratorBox.center;

      // show the corresponding denominator
      if ( phet.chipper.queryParameters.showAnswers && !markerEditor.denominatorProperty.value ) {
        if ( numerator ) {
          const denominator = markerEditor.numeratorProperty.value / markerEditor.unitRateProperty.value;
          denominatorNode.string = URUtils.numberToString( denominator, denominatorOptions.maxDecimals, denominatorOptions.trimZeros );
        }
        else {
          denominatorNode.string = '';
        }
        denominatorNode.fill = URColors.showAnswers;
        denominatorNode.center = denominatorBox.center;
      }
    };
    markerEditor.numeratorProperty.link( numeratorObserver ); // unlink in dispose

    // Observe edits to the denominator
    const denominatorObserver = denominator => {
      assert && assert( !isNaN( denominator ), `invalid denominator: ${denominator}` );

      // update the denominator
      if ( denominator ) {
        denominatorNode.string = URUtils.numberToString( denominator, denominatorOptions.maxDecimals, denominatorOptions.trimZeros );
      }
      else {
        denominatorNode.string = '';
      }
      denominatorNode.fill = options.valueColor;
      denominatorNode.center = denominatorBox.center;

      // show the corresponding numerator
      if ( phet.chipper.queryParameters.showAnswers && !markerEditor.numeratorProperty.value ) {
        if ( denominator ) {
          const numerator = markerEditor.denominatorProperty.value * markerEditor.unitRateProperty.value;
          numeratorNode.string = URUtils.numberToString( numerator, numeratorOptions.maxDecimals, numeratorOptions.trimZeros );
        }
        else {
          numeratorNode.string = '';
        }
        numeratorNode.fill = URColors.showAnswers;
        numeratorNode.center = numeratorBox.center;
      }
    };
    markerEditor.denominatorProperty.link( denominatorObserver ); // unlink in dispose

    // @private
    this.disposeMarkerEditorNode = () => {
      markerEditor.numeratorProperty.unlink( numeratorObserver );
      markerEditor.denominatorProperty.unlink( denominatorObserver );
      numeratorEditButton.dispose(); // workaround for memory leak https://github.com/phetsims/unit-rates/issues/207
      denominatorEditButton.dispose(); // workaround for memory leak https://github.com/phetsims/unit-rates/issues/207
    };

    // @private fields required by prototype functions
    this.numeratorNode = numeratorNode;
    this.denominatorNode = denominatorNode;
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeMarkerEditorNode();
    super.dispose();
  }
}

unitRates.register( 'MarkerEditorNode', MarkerEditorNode );