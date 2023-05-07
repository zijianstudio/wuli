// Copyright 2014-2022, University of Colorado Boulder

/**
 * Base class for a node that looks like a window and provides the user with feedback about what they have entered
 * during the challenge.
 *
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import areaBuilder from '../../areaBuilder.js';

// constants
const X_MARGIN = 8;
const TITLE_FONT = new PhetFont( { size: 20, weight: 'bold' } );
const NORMAL_TEXT_FONT = new PhetFont( { size: 18 } );
const CORRECT_ANSWER_BACKGROUND_COLOR = 'white';
const INCORRECT_ANSWER_BACKGROUND_COLOR = PhetColorScheme.PHET_LOGO_YELLOW;

class FeedbackWindow extends Panel {

  /**
   * Constructor for the window that shows the user what they built.  It is constructed with no contents, and the
   * contents are added later when the build spec is set.
   *
   * @param {string} title
   * @param {number} maxWidth
   * @param {Object} [options]
   */
  constructor( title, maxWidth, options ) {

    options = merge( {
      fill: INCORRECT_ANSWER_BACKGROUND_COLOR,
      stroke: 'black',
      xMargin: X_MARGIN
    }, options );

    const contentNode = new Node();

    // @protected subclasses will do layout relative to this.titleNode
    const titleNode = new Text( title, { font: TITLE_FONT } );
    titleNode.scale( Math.min( ( maxWidth - 2 * X_MARGIN ) / titleNode.width, 1 ) );
    titleNode.top = 5;
    contentNode.addChild( titleNode );

    // Invoke super constructor - called here because content with no bounds doesn't work.  This does not pass through
    // position options - that needs to be handled in descendant classes.
    super( contentNode, options );

    // @protected subclasses will addChild and removeChild
    this.contentNode = contentNode;

    // @protected subclasses will do layout relative to this.titleNode
    this.titleNode = titleNode;
  }

  /**
   * Set the background color of this window based on whether or not the information being displayed is the correct
   * answer.
   *
   * @param userAnswerIsCorrect
   * @public
   */
  setColorBasedOnAnswerCorrectness( userAnswerIsCorrect ) {
    this.setFill( userAnswerIsCorrect ? CORRECT_ANSWER_BACKGROUND_COLOR : INCORRECT_ANSWER_BACKGROUND_COLOR );
  }
}

// @protected for use by subclasses
FeedbackWindow.X_MARGIN = X_MARGIN; // Must be visible to subtypes so that max width can be calculated and, if necessary, scaled.
FeedbackWindow.NORMAL_TEXT_FONT = NORMAL_TEXT_FONT; // Font used in this window for text that is not the title.

areaBuilder.register( 'FeedbackWindow', FeedbackWindow );
export default FeedbackWindow;