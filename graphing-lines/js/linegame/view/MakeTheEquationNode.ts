// Copyright 2013-2023, University of Colorado Boulder

/**
 * View for 'Make the Equation' challenges.
 * User manipulates an equation on the right, graph is displayed on the left.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import { Color, Node, Text } from '../../../../scenery/js/imports.js';
import GLConstants from '../../common/GLConstants.js';
import graphingLines from '../../graphingLines.js';
import GraphingLinesStrings from '../../GraphingLinesStrings.js';
import PointSlopeEquationNode from '../../pointslope/view/PointSlopeEquationNode.js';
import SlopeInterceptEquationNode from '../../slopeintercept/view/SlopeInterceptEquationNode.js';
import LineGameConstants from '../LineGameConstants.js';
import EquationForm from '../model/EquationForm.js';
import ManipulationMode from '../model/ManipulationMode.js';
import PlayState from '../model/PlayState.js';
import ChallengeGraphNode from './ChallengeGraphNode.js';
import ChallengeNode from './ChallengeNode.js';
import EquationBoxNode from './EquationBoxNode.js';
import Line from '../../common/model/Line.js';
import LineGameModel from '../model/LineGameModel.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import Graph from '../../common/model/Graph.js';
import MakeTheEquation from '../model/MakeTheEquation.js';

export default class MakeTheEquationNode extends ChallengeNode {

  private readonly disposeMakeTheEquationNode: () => void;

  public constructor( challenge: MakeTheEquation, model: LineGameModel, challengeSize: Dimension2, audioPlayer: GameAudioPlayer ) {

    super( challenge, model, challengeSize, audioPlayer );

    const boxSize = new Dimension2( 0.4 * challengeSize.width, 0.3 * challengeSize.height );

    // title, possibly scaled for i18n
    const titleNode = new Text( challenge.title, {
      font: LineGameConstants.TITLE_FONT,
      fill: LineGameConstants.TITLE_COLOR,
      maxWidth: boxSize.width
    } );

    // Answer
    const answerBoxNode = new EquationBoxNode( GraphingLinesStrings.aCorrectEquation, challenge.answer.color, boxSize,
      ChallengeNode.createEquationNode( new Property( challenge.answer ), challenge.equationForm, {
        fontSize: LineGameConstants.STATIC_EQUATION_FONT_SIZE
      } ) );
    answerBoxNode.visible = false;

    // Guess
    // @ts-expect-error guessProperty is Property<Line | NotALine>
    const guessColor: Color | string = challenge.guessProperty.value.color;
    // @ts-expect-error guessProperty is Property<Line | NotALine>
    const guessEquationNode = createInteractiveEquationNode( challenge.equationForm, challenge.manipulationMode, challenge.guessProperty, challenge.graph,
      GLConstants.INTERACTIVE_EQUATION_FONT_SIZE, guessColor );
    const guessBoxNode = new EquationBoxNode( GraphingLinesStrings.yourEquation, guessColor, boxSize, guessEquationNode );

    // Graph
    const graphNode = new ChallengeGraphNode( challenge, { answerLineVisible: true } );

    // rendering order
    this.subtypeParent.addChild( titleNode );
    this.subtypeParent.addChild( graphNode );
    this.subtypeParent.addChild( answerBoxNode );
    this.subtypeParent.addChild( guessBoxNode );

    // layout
    {
      // graphNode is positioned automatically based on modelViewTransform's origin offset.

      // left align the title and boxes, centered in space to left of graph
      guessBoxNode.centerX = challenge.modelViewTransform.modelToViewX( challenge.graph.xRange.min ) / 2;
      answerBoxNode.left = guessBoxNode.left;
      titleNode.left = guessBoxNode.left;

      // stack title and boxes vertically, title top-aligned with graph's grid
      const ySpacing = 30;
      titleNode.top = challenge.modelViewTransform.modelToViewY( challenge.graph.yRange.max );
      guessBoxNode.top = titleNode.bottom + ySpacing;
      answerBoxNode.top = guessBoxNode.bottom + ySpacing;

      // face centered below boxes, bottom-aligned with buttons
      this.faceNode.centerX = guessBoxNode.centerX;
      this.faceNode.bottom = this.buttonsParent.bottom;
    }

    // To reduce brain damage during development, show the answer equation in translucent gray.
    if ( phet.chipper.queryParameters.showAnswers ) {
      const devAnswerNode = ChallengeNode.createEquationNode( new Property( challenge.answer ), challenge.equationForm, {
        fontSize: 14,
        maxWidth: boxSize.width
      } );
      devAnswerNode.left = answerBoxNode.left;
      devAnswerNode.centerY = answerBoxNode.centerY;
      this.addChild( devAnswerNode );
      devAnswerNode.moveToBack();
    }

    // Update visibility of the correct/incorrect icons.
    const updateIcons = () => {
      const playState = model.playStateProperty.value;
      answerBoxNode.setCorrectIconVisible( playState === PlayState.NEXT );
      guessBoxNode.setCorrectIconVisible( playState === PlayState.NEXT && challenge.isCorrect() );
      guessBoxNode.setIncorrectIconVisible( playState === PlayState.NEXT && !challenge.isCorrect() );
    };

    // sync with guess
    const guessObserver = () => updateIcons();
    challenge.guessProperty.link( guessObserver ); // unlink in dispose

    // sync with game state
    const playStateObserver = ( playState: PlayState ) => {

      // No-op if dispose has been called, see https://github.com/phetsims/graphing-lines/issues/133
      if ( !this.isDisposed ) {

        // states in which the equation is interactive
        guessBoxNode.pickable = (
          playState === PlayState.FIRST_CHECK ||
          playState === PlayState.SECOND_CHECK ||
          playState === PlayState.TRY_AGAIN ||
          ( playState === PlayState.NEXT && !challenge.isCorrect() )
        );

        // Graph the guess line at the end of the challenge.
        graphNode.setGuessLineVisible( playState === PlayState.NEXT );

        // show stuff when the user got the challenge wrong
        if ( playState === PlayState.NEXT && !challenge.isCorrect() ) {
          answerBoxNode.setVisible( true );
          graphNode.setAnswerPointVisible( true );
          graphNode.setGuessPointVisible( true );
          graphNode.setSlopeToolVisible( true );
        }

        // visibility of correct/incorrect icons
        updateIcons();
      }
    };
    model.playStateProperty.link( playStateObserver ); // unlink in dispose

    this.disposeMakeTheEquationNode = () => {
      challenge.guessProperty.unlink( guessObserver );
      model.playStateProperty.unlink( playStateObserver );
      guessEquationNode.dispose();
      graphNode.dispose();
    };
  }

  public override dispose(): void {
    this.disposeMakeTheEquationNode();
    super.dispose();
  }
}

/**
 * Creates an interactive equation.
 */
function createInteractiveEquationNode( equationForm: EquationForm,
                                        manipulationMode: ManipulationMode,
                                        lineProperty: Property<Line>, graph: Graph, fontSize: number,
                                        staticColor: Color | string ): Node {
  let interactivePoint;
  let interactiveSlope;
  let interactiveIntercept;
  if ( equationForm === EquationForm.SLOPE_INTERCEPT ) {
    interactiveSlope = ( manipulationMode === ManipulationMode.SLOPE ) || ( manipulationMode === ManipulationMode.SLOPE_INTERCEPT );
    interactiveIntercept = ( manipulationMode === ManipulationMode.INTERCEPT ) || ( manipulationMode === ManipulationMode.SLOPE_INTERCEPT );
    return new SlopeInterceptEquationNode( lineProperty, {
      interactiveSlope: interactiveSlope,
      interactiveIntercept: interactiveIntercept,
      riseRangeProperty: new Property( graph.yRange ),
      runRangeProperty: new Property( graph.xRange ),
      yInterceptRangeProperty: new Property( graph.yRange ),
      fontSize: fontSize,
      staticColor: staticColor
    } );
  }
  else if ( equationForm === EquationForm.POINT_SLOPE ) {
    interactivePoint = ( manipulationMode === ManipulationMode.POINT ) || ( manipulationMode === ManipulationMode.POINT_SLOPE );
    interactiveSlope = ( manipulationMode === ManipulationMode.SLOPE ) || ( manipulationMode === ManipulationMode.POINT_SLOPE );
    return new PointSlopeEquationNode( lineProperty, {
      interactivePoint: interactivePoint,
      interactiveSlope: interactiveSlope,
      x1RangeProperty: new Property( graph.xRange ),
      y1RangeProperty: new Property( graph.yRange ),
      riseRangeProperty: new Property( graph.yRange ),
      runRangeProperty: new Property( graph.xRange ),
      fontSize: fontSize,
      staticColor: staticColor
    } );
  }
  else {
    throw new Error( `unsupported equation form: ${equationForm.name}` );
  }
}

graphingLines.register( 'MakeTheEquationNode', MakeTheEquationNode );