// Copyright 2013-2023, University of Colorado Boulder

/**
 * Base class for game challenges.
 * In all challenges, the user is trying to match a given line.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import Graph from '../../common/model/Graph.js';
import Line from '../../common/model/Line.js';
import PointTool from '../../common/model/PointTool.js';
import graphingLines from '../../graphingLines.js';
import GraphingLinesStrings from '../../GraphingLinesStrings.js';
import LineGameConstants from '../LineGameConstants.js';
import ChallengeNode from '../view/ChallengeNode.js'; // eslint-disable-line no-view-imported-from-model
import EquationForm from './EquationForm.js';
import LineGameModel from './LineGameModel.js';
import ManipulationMode from './ManipulationMode.js';
import NotALine from './NotALine.js';

export default abstract class Challenge {

  // The user's current guess, NotALine if it's not a valid line. We're not using null for "not a line" because
  // we want to know that the user's guess has changed, so a new object instance is required to trigger notifications.
  // See also NotALine.ts.
  public readonly guessProperty: Property<Line | NotALine>;

  // title that is visible to the user
  public readonly title: string;

  // brief description of the challenge, visible in dev versions
  public readonly description: string;

  // the correct answer
  public readonly answer: Line;

  // form of the equation for the challenge
  public readonly equationForm: EquationForm;

  // indicates which properties of a line the user is able to change
  public readonly manipulationMode: ManipulationMode;

  public answerVisible: boolean;

  // model-view transform, created in the model because each challenge subclass may have its own transform
  public readonly modelViewTransform: ModelViewTransform2;

  public readonly graph: Graph;
  public readonly pointTool1: PointTool;
  public readonly pointTool2: PointTool;

  public constructor( title: string, description: string, answer: Line, equationForm: EquationForm,
                      manipulationMode: ManipulationMode, xRange: Range, yRange: Range ) {

    this.guessProperty = new Property( createInitialGuess( answer, manipulationMode, xRange, yRange ) );

    this.title = title;
    this.description = description;
    this.answer = answer.withColor( LineGameConstants.ANSWER_COLOR );
    this.equationForm = equationForm;
    this.manipulationMode = manipulationMode;

    this.answerVisible = false;

    const modelViewTransformScale = LineGameConstants.GRAPH_WIDTH / xRange.getLength(); // view units / model units
    this.modelViewTransform = ModelViewTransform2.createOffsetXYScaleMapping(
      LineGameConstants.ORIGIN_OFFSET, modelViewTransformScale, -modelViewTransformScale ); // graph on right, y inverted

    this.graph = new Graph( xRange, yRange );

    this.pointTool1 = new PointTool( new Vector2( 1.5, -10.5 ), 'up', this.graph.lines, new Bounds2( -15, -11, 11, 13 ) );
    this.pointTool2 = new PointTool( new Vector2( 7, -13 ), 'down', this.graph.lines, new Bounds2( -15, -14, 11, 11 ) );

    // When the guess changes, update the lines that are 'seen' by the point tools.
    // unlink unnecessary because Challenge owns this Property.
    this.guessProperty.link( this.updateGraphLines.bind( this ) );
  }

  /**
   * Creates the view component for the challenge.
   * @param model - the game model
   * @param challengeSize - dimensions of the view rectangle that is available for rendering the challenge
   * @param audioPlayer - the audio player, for providing audio feedback during game play
   */
  public abstract createView( model: LineGameModel, challengeSize: Dimension2, audioPlayer: GameAudioPlayer ): ChallengeNode;

  /**
   * Updates the collection of lines that are 'seen' by the point tools.
   */
  protected abstract updateGraphLines(): void;

  // Resets the challenge
  public reset(): void {
    this.guessProperty.reset();
    this.pointTool1.reset();
    this.pointTool2.reset();
    this.setAnswerVisible( false );
  }

  // Visibility of the answer affects what is 'seen' by the point tools.
  public setAnswerVisible( visible: boolean ): void {
    this.answerVisible = visible;
    this.updateGraphLines();
  }

  // True if the guess and answer are descriptions of the same line.
  public isCorrect(): boolean {
    const guess = this.guessProperty.value; // {Line | NotALine}
    return ( guess instanceof Line ) && this.answer.same( guess );
  }

  // For debugging, do not rely on format.
  public toString(): string {
    return `${this.constructor.name}[` +
           ` title=${this.title
           } answer=${this.answer.toString()
           } equationForm=${this.equationForm.name
           } manipulationMode=${this.manipulationMode
           } ]`;
  }

  /*
   * Creates a standard title for the challenge, based on what the user can manipulate.
   */
  protected static createTitle( defaultTitle: string, manipulationMode: ManipulationMode ): string {
    if ( manipulationMode === ManipulationMode.SLOPE ) {
      return GraphingLinesStrings.setTheSlope;
    }
    else if ( manipulationMode === ManipulationMode.INTERCEPT ) {
      return GraphingLinesStrings.setTheYIntercept;
    }
    else if ( manipulationMode === ManipulationMode.POINT ) {
      return GraphingLinesStrings.setThePoint;
    }
    else if ( manipulationMode === ManipulationMode.THREE_POINTS ) {
      return GraphingLinesStrings.putPointsOnLine;
    }
    else {
      return defaultTitle;
    }
  }
}

/*
 * Creates an initial guess, based on the answer and what the user can manipulate.
 */
function createInitialGuess( answer: Line, manipulationMode: ManipulationMode, xRange: Range, yRange: Range ): Line | NotALine {
  if ( manipulationMode === ManipulationMode.SLOPE ) {
    // slope is variable, so use the answer's point
    return Line.createPointSlope( answer.x1, answer.y1, ( answer.y1 === yRange.max ? -1 : 1 ),
      ( answer.x1 === xRange.max ? -1 : 1 ), LineGameConstants.GUESS_COLOR );
  }
  else if ( manipulationMode === ManipulationMode.INTERCEPT ) {
    // intercept is variable, so use the answer's slope
    return Line.createSlopeIntercept( answer.rise, answer.run, 0, LineGameConstants.GUESS_COLOR );
  }
  else if ( manipulationMode === ManipulationMode.POINT ) {
    // point is variable, so use the answer's slope
    return Line.createPointSlope( 0, 0, answer.rise, answer.run, LineGameConstants.GUESS_COLOR );
  }
  else if ( manipulationMode === ManipulationMode.THREE_POINTS ) {
    return new NotALine(); // the 3 points don't form a line
  }
  else {
    // in all other cases, use the standard line y=x
    return Line.Y_EQUALS_X_LINE.withColor( LineGameConstants.GUESS_COLOR );
  }
}

graphingLines.register( 'Challenge', Challenge );