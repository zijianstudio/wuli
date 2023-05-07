// Copyright 2013-2023, University of Colorado Boulder

/**
 * Model for 'Place the Points' challenges.
 * This is a specialization of 'Graph the Line' challenge.
 * In this challenge, the user is given an equation and must place 3 points on a graph to make the line.
 * If the 3 points do not form a line, the guess line will be null.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../../dot/js/Range.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Line from '../../common/model/Line.js';
import graphingLines from '../../graphingLines.js';
import LineGameConstants from '../LineGameConstants.js';
import PlaceThePointsNode from '../view/PlaceThePointsNode.js'; // eslint-disable-line no-view-imported-from-model
import GraphTheLine from './GraphTheLine.js';
import ManipulationMode from './ManipulationMode.js';
import NotALine from './NotALine.js';
import EquationForm from './EquationForm.js';
import LineGameModel from './LineGameModel.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import Property from '../../../../axon/js/Property.js';

export default class PlaceThePoints extends GraphTheLine {

  // 3 points that the user can place
  public readonly p1Property: Property<Vector2>;
  public readonly p2Property: Property<Vector2>;
  public readonly p3Property: Property<Vector2>;

  /**
   * @param description - brief description of the challenge, visible in dev versions
   * @param answer - the correct answer
   * @param equationForm - specifies the form of the equation
   * @param xRange - range of the graph's x-axis
   * @param yRange - range of the graph's y-axis
   */
  public constructor( description: string, answer: Line, equationForm: EquationForm, xRange: Range, yRange: Range ) {

    super( description, answer, equationForm, ManipulationMode.THREE_POINTS, xRange, yRange );

    // The initial points do not form a line.
    this.p1Property = new Vector2Property( new Vector2( -3, 2 ) );
    this.p2Property = new Vector2Property( new Vector2( 0, 0 ) );
    this.p3Property = new Vector2Property( new Vector2( 3, 2 ) );

    // Update the guess when the points change.
    // unmultilink unnecessary because PlaceThePoints owns these Properties.
    Multilink.multilink(
      [ this.p1Property, this.p2Property, this.p3Property ],
      ( p1, p2, p3 ) => {
        const line = new Line( p1.x, p1.y, p2.x, p2.y, LineGameConstants.GUESS_COLOR );
        if ( line.onLinePoint( p3 ) ) {
          // all 3 points are on a line
          this.guessProperty.value = line;
        }
        else {
          // the 3 points don't form a line
          this.guessProperty.value = new NotALine();
        }
      } );
  }

  public override reset(): void {
    this.p1Property.reset();
    this.p2Property.reset();
    this.p3Property.reset();
    super.reset();
  }

  /**
   * Creates the view for this challenge.
   */
  public override createView( model: LineGameModel, challengeSize: Dimension2, audioPlayer: GameAudioPlayer ): PlaceThePointsNode {
    return new PlaceThePointsNode( this, model, challengeSize, audioPlayer );
  }
}

graphingLines.register( 'PlaceThePoints', PlaceThePoints );