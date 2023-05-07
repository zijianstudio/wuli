// Copyright 2016-2023, University of Colorado Boulder

/**
 * Displays a question and associated answer in the Shopping screen.
 * Values are entered via a keypad.
 * Layout is specified in https://github.com/phetsims/unit-rates/issues/152
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { FireListener, HStrut, Line, Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import checkSolidShape from '../../../../sherpa/js/fontawesome-5/checkSolidShape.js';
import editRegularShape from '../../../../sherpa/js/fontawesome-5/editRegularShape.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import URColors from '../../common/URColors.js';
import URConstants from '../../common/URConstants.js';
import URUtils from '../../common/URUtils.js';
import unitRates from '../../unitRates.js';

export default class ShoppingQuestionNode extends Node {

  /**
   * @param {ShoppingQuestion} question - model element for the question
   * @param {Node} questionsPanel - panel that contains the question, for positioning the keypad
   * @param {KeypadLayer} keypadLayer - layer that manages the keypad
   * @param {Object} [options]
   */
  constructor( question, questionsPanel, keypadLayer, options ) {

    options = merge( {
      valueBoxWidth: 70, // {number} width of the value field, height determined by valueFont
      denominatorVisible: false, // {boolean} is the denominator visible before the answer is visible?
      neutralColor: 'black', // {Color|string} color for UI elements that are agnostic about whether the guess is correct
      questionFont: new PhetFont( 14 ), // {Font} font for the question
      valueFont: new PhetFont( 14 ), // {Font} font for the value
      valueYMargin: 1, // {number} vertical margin inside the value box
      xSpacing: 25, // {number} horizontal spacing between UI elements
      ySpacing: 5,  // {number} vertical spacing between UI elements
      fractionYSpacing: 3 // {number} vertical space above and below fraction line
    }, options );

    super();

    // local vars to improve readability
    const answer = question.answer;
    const answerOptions = question.answerOptions;

    // box that is either empty or displays an incorrect value
    const valueBoxWidth = options.valueBoxWidth;
    const valueBoxHeight = new Text( '0', { font: options.valueFont } ).height + ( 2 * options.valueYMargin );
    const valueBox = new Rectangle( 0, 0, valueBoxWidth, valueBoxHeight, {
      stroke: 'black',
      fill: 'white',
      cursor: 'pointer'
    } );
    this.addChild( valueBox );
    valueBox.touchArea = valueBox.localBounds.dilatedXY( 5, 5 );

    // edit button, to the right of the box
    const editButton = new RectangularPushButton( {
      content: new Path( editRegularShape, {
        scale: URConstants.EDIT_ICON_SCALE,
        fill: 'black'
      } ),
      baseColor: URColors.editButton,
      left: valueBox.right + options.xSpacing,
      centerY: valueBox.centerY
    } );
    this.addChild( editButton );
    editButton.touchArea = editButton.localBounds.dilatedXY( 10, 10 );

    // strut to the left of the box, same width as editButton
    // See layout specification in https://github.com/phetsims/unit-rates/issues/152
    const strut = new HStrut( editButton.width, {
      right: valueBox.left - options.xSpacing,
      centerY: valueBox.centerY
    } );
    this.addChild( strut );

    // check mark to right of box, to indicate that the question has been correctly answered
    const checkMarkNode = new Path( checkSolidShape, {
      scale: 0.06,
      fill: URColors.checkMark,
      left: valueBox.right + options.xSpacing,
      centerY: valueBox.centerY,
      visible: false
    } );
    this.addChild( checkMarkNode );

    // the question, centered above the box
    const questionTextNode = new Text( question.questionString, {
      font: options.questionFont,
      centerX: valueBox.centerX,
      bottom: valueBox.top - options.ySpacing,
      maxWidth: 180 // i18n, determined empirically
    } );
    this.addChild( questionTextNode );

    // the user's guess, as entered via the keypad, appears centered in the box
    const guessNode = new Text( '', {
      pickable: false, // so it doesn't interfere with clicking in valueBox to open keypad
      fill: options.neutralColor,
      font: options.valueFont,
      center: valueBox.center,
      maxWidth: 0.8 * valueBoxWidth
    } );
    this.addChild( guessNode );

    // numerator in the revealed answer, replaces the box when the answer is correct
    const numeratorNode = new Text( question.numeratorString, {
      fill: URColors.correctQuestion,
      font: options.valueFont,
      center: valueBox.center,
      visible: false,
      maxWidth: 100 // i18n, determined empirically
    } );
    this.addChild( numeratorNode );

    // fraction line in the revealed answer
    const fractionLineNode = new Line( 0, 0, 1.1 * valueBox.width, 0, {
      stroke: options.neutralColor,
      lineWidth: 1,
      centerX: valueBox.centerX,
      top: valueBox.bottom + options.fractionYSpacing,
      visible: options.denominatorVisible
    } );
    this.addChild( fractionLineNode );

    // denominator in the revealed answer
    const denominatorNode = new Text( question.denominatorString, {
      fill: options.neutralColor,
      font: options.valueFont,
      centerX: valueBox.centerX,
      top: fractionLineNode.bottom + options.fractionYSpacing,
      visible: options.denominatorVisible,
      maxWidth: 100 // i18n, determined empirically
    } );
    this.addChild( denominatorNode );

    this.mutate( options );

    // Update when the guess changes
    const guessObserver = guess => {

      // compare guess to answer using the desired number of decimal places
      const correct = ( guess === answer );

      // update the guess
      if ( guess !== null ) {
        guessNode.string = URUtils.formatNumber( answerOptions.valueFormat, guess, answerOptions.maxDecimals, answerOptions.trimZeros );
        guessNode.fill = correct ? URColors.correctQuestion : URColors.incorrectQuestion;
      }
      else if ( phet.chipper.queryParameters.showAnswers ) {

        // show the answer, if query parameter is set
        guessNode.string = URUtils.formatNumber( answerOptions.valueFormat, answer, answerOptions.maxDecimals, answerOptions.trimZeros );
        guessNode.string = URUtils.formatNumber( answerOptions.valueFormat, answer, answerOptions.maxDecimals, answerOptions.trimZeros );
        guessNode.fill = URColors.showAnswers;
      }
      else {
        guessNode.string = '';
      }
      guessNode.visible = !correct;
      guessNode.center = valueBox.center; // center guess in box

      // update other UI elements
      editButton.visible = !correct;
      valueBox.visible = !correct;
      checkMarkNode.visible = correct;
      numeratorNode.visible = correct;
      fractionLineNode.stroke = denominatorNode.fill = ( correct ? URColors.correctQuestion : options.neutralColor );

      // The denominator is sometimes visible at all times (e.g. for the 'Unit Rate?' question).
      // If it's not visible at all times, make it visible when the answer is revealed.
      if ( !options.denominatorVisible ) {
        fractionLineNode.visible = denominatorNode.visible = correct;
      }
    };
    question.guessProperty.link( guessObserver ); // unlink in dispose

    // highlight the value box to indicate that an edit is in progress
    const onBeginEdit = () => {
      valueBox.fill = URColors.edit;
    };

    // clear highlight to indicate that the edit is completed
    const onEndEdit = () => {
      valueBox.fill = 'white';
    };

    // position the keypad relative to the Questions panel
    const setKeypadPosition = keypad => {
      const questionsPanelBounds = keypad.globalToParentBounds( questionsPanel.localToGlobalBounds( questionsPanel.localBounds ) );
      keypad.right = questionsPanelBounds.left - 10;
      keypad.bottom = questionsPanelBounds.bottom;
    };

    // opens a keypad to edit the user's guess
    const editValue = () => {
      keypadLayer.beginEdit( question.guessProperty, {
        onBeginEdit: onBeginEdit,
        onEndEdit: onEndEdit,
        setKeypadPosition: setKeypadPosition,
        maxDigits: answerOptions.maxDigits,
        maxDecimals: answerOptions.maxDecimals
      } );
    };

    // Press on editButton or in valueBox to begin editing
    editButton.addListener( editValue ); // no removeListener required
    valueBox.addInputListener( new FireListener( { // no removeInputListener required
      fire: editValue
    } ) );

    // @private cleanup that's specific to this Node
    this.disposeShoppingQuestionNode = () => {
      question.guessProperty.unlink( guessObserver );
      editButton.dispose(); // workaround for memory leak https://github.com/phetsims/unit-rates/issues/207
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeShoppingQuestionNode();
    super.dispose();
  }
}

unitRates.register( 'ShoppingQuestionNode', ShoppingQuestionNode );