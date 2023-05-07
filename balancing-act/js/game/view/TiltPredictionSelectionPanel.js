// Copyright 2014-2022, University of Colorado Boulder

/**
 * Node that defines a single panel for use on the tilt prediction selector node.
 */

import { DownUpListener, Image, Node, Rectangle } from '../../../../scenery/js/imports.js';
import balancingAct from '../../balancingAct.js';

// constants, collected here for easy appearance tweaking.
const PANEL_WIDTH = 170; // In screen coords, fairly close to pixels.  Empirically determined.
const NON_HIGHLIGHT_COLOR = 'black';
const NON_HIGHLIGHT_LINE_WIDTH = 1;
const HOVER_LINE_WIDTH = 2;
const SELECTED_HIGHLIGHT_COLOR = 'rgb( 255, 215, 0 )';
const SELECTED_HIGHLIGHT_LINE_WIDTH = 6;
const CORRECT_ANSWER_HIGHLIGHT_COLOR = 'rgb( 0, 255, 0 )';
const INVISIBLE_COLOR = 'rgba( 0, 0, 0, 0 )';

class TiltPredictionSelectionPanel extends Node {

  /**
   * @param image
   * @param correspondingPrediction
   * @param tiltPredictionProperty
   * @param gameStateProperty
   */
  constructor( image, correspondingPrediction, tiltPredictionProperty, gameStateProperty ) {
    super();
    const self = this;

    // Add the image.
    const imagePanel = new Image( image, { cursor: 'pointer' } );
    imagePanel.scale( PANEL_WIDTH / imagePanel.width );
    this.addChild( imagePanel );

    // Define a function for updating the highlight state
    function updateHighlightState() {
      if ( tiltPredictionProperty.value === correspondingPrediction ) {
        self.thinOutline.stroke = INVISIBLE_COLOR;
        if ( gameStateProperty.value === 'displayingCorrectAnswer' ) {
          self.thickOutline.stroke = CORRECT_ANSWER_HIGHLIGHT_COLOR;
        }
        else {
          self.thickOutline.stroke = SELECTED_HIGHLIGHT_COLOR;
        }
      }
      else {
        self.thickOutline.stroke = INVISIBLE_COLOR;
        self.thinOutline.stroke = NON_HIGHLIGHT_COLOR;
        if ( self.mouseOver ) {
          self.thinOutline.lineWidth = HOVER_LINE_WIDTH;
        }
        else {
          self.thinOutline.lineWidth = NON_HIGHLIGHT_LINE_WIDTH;
        }
      }
    }

    // Set up mouse listener that watches to see if the user has selected this option.
    this.addInputListener( new DownUpListener( { up: event => { tiltPredictionProperty.value = correspondingPrediction; } } ) );

    // Set up a hover listener to update hover highlight.
    this.mouseOver = false;
    this.addInputListener(
      {
        over: () => {
          this.mouseOver = true;
          updateHighlightState();
        },
        out: () => {
          this.mouseOver = false;
          updateHighlightState();
        }
      } );

    // Add the outline around the panel, which will be changed to depict the
    // user's selection and the correct answer.
    this.thinOutline = Rectangle.bounds( imagePanel.bounds,
      {
        stroke: NON_HIGHLIGHT_COLOR,
        lineWidth: NON_HIGHLIGHT_LINE_WIDTH
      } );
    this.addChild( this.thinOutline );
    this.thickOutline = Rectangle.bounds( imagePanel.bounds,
      {
        stroke: INVISIBLE_COLOR,
        lineWidth: SELECTED_HIGHLIGHT_LINE_WIDTH
      } );
    this.addChild( this.thickOutline );

    // Add listener for changes to the tilt prediction.
    tiltPredictionProperty.link( predictionValue => {
      // Turn the highlight on or off.
      updateHighlightState();
    } );

    // Add listener for changes to the game state.
    gameStateProperty.link( gameState => {
      updateHighlightState();
    } );
  }
}

balancingAct.register( 'TiltPredictionSelectionPanel', TiltPredictionSelectionPanel );

export default TiltPredictionSelectionPanel;