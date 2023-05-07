// Copyright 2013-2023, University of Colorado Boulder

/**
 * Model for 'Make the Equation' challenges.
 * In this challenge, the user is given a graphed line and must make the equation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../../dot/js/Range.js';
import graphingLines from '../../graphingLines.js';
import GraphingLinesStrings from '../../GraphingLinesStrings.js';
import MakeTheEquationNode from '../view/MakeTheEquationNode.js'; // eslint-disable-line no-view-imported-from-model
import Challenge from './Challenge.js';
import Line from '../../common/model/Line.js';
import EquationForm from './EquationForm.js';
import ManipulationMode from './ManipulationMode.js';
import LineGameModel from './LineGameModel.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';

export default class MakeTheEquation extends Challenge {

  /**
   * @param description - brief description of the challenge, visible in dev versions
   * @param answer - the correct answer
   * @param equationForm - specifies the form of the equation
   * @param manipulationMode - indicates which properties of a line the user is able to change
   * @param xRange - range of the graph's x-axis
   * @param yRange - range of the graph's y-axis
   */
  public constructor( description: string, answer: Line, equationForm: EquationForm,
                      manipulationMode: ManipulationMode, xRange: Range, yRange: Range ) {
    super(
      Challenge.createTitle( GraphingLinesStrings.makeTheEquation, manipulationMode ),
      description,
      answer,
      equationForm,
      manipulationMode,
      xRange,
      yRange
    );
  }

  /**
   * Creates the view for this challenge.
   */
  public override createView( model: LineGameModel, challengeSize: Dimension2, audioPlayer: GameAudioPlayer ): MakeTheEquationNode {
    return new MakeTheEquationNode( this, model, challengeSize, audioPlayer );
  }

  /**
   * Updates the collection of lines that are 'seen' by the point tools.
   * Order is important here! See https://github.com/phetsims/graphing-lines/issues/89
   */
  protected override updateGraphLines(): void {
    this.graph.lines.clear();
    this.graph.lines.push( this.answer );

    // Account for guesses that might be NotALine (not a valid line).
    const guess = this.guessProperty.value;
    if ( this.answerVisible && guess instanceof Line ) {
      this.graph.lines.push( guess );
    }
  }
}

graphingLines.register( 'MakeTheEquation', MakeTheEquation );