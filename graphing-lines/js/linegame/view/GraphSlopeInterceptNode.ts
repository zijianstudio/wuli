// Copyright 2013-2023, University of Colorado Boulder

/**
 * Challenge graph with manipulators for slope and y-intercept of the guess line.
 * The answer line is initially hidden.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import SlopeManipulator from '../../common/view/manipulator/SlopeManipulator.js';
import YInterceptManipulator from '../../common/view/manipulator/YInterceptManipulator.js';
import graphingLines from '../../graphingLines.js';
import SlopeInterceptParameterRange from '../../slopeintercept/model/SlopeInterceptParameterRange.js';
import LineGameConstants from '../LineGameConstants.js';
import ManipulationMode from '../model/ManipulationMode.js';
import ChallengeGraphNode from './ChallengeGraphNode.js';
import GraphTheLine from '../model/GraphTheLine.js';
import NotALine from '../model/NotALine.js';
import Line from '../../common/model/Line.js';

export default class GraphSlopeInterceptNode extends ChallengeGraphNode {

  private readonly disposeGraphSlopeInterceptNode: () => void;

  public constructor( challenge: GraphTheLine ) {

    super( challenge );

    this.setGuessLineVisible( true );

    // dynamic ranges
    const parameterRange = new SlopeInterceptParameterRange();
    // @ts-expect-error guessProperty is Property<Line | NotALine>
    const riseRangeProperty = new Property( parameterRange.rise( challenge.guessProperty.value, challenge.graph ) );
    // @ts-expect-error guessProperty is Property<Line | NotALine>
    const runRangeProperty = new Property( parameterRange.run( challenge.guessProperty.value, challenge.graph ) );
    const y1RangeProperty = new Property( challenge.graph.yRange );

    const manipulatorRadius = challenge.modelViewTransform.modelToViewDeltaX( LineGameConstants.MANIPULATOR_RADIUS );

    // intercept manipulator
    // @ts-expect-error guessProperty is Property<Line | NotALine>
    const yInterceptManipulator = new YInterceptManipulator( manipulatorRadius, challenge.guessProperty, y1RangeProperty, challenge.modelViewTransform );
    const interceptIsVariable = ( challenge.manipulationMode === ManipulationMode.INTERCEPT || challenge.manipulationMode === ManipulationMode.SLOPE_INTERCEPT );
    if ( interceptIsVariable ) {
      this.addChild( yInterceptManipulator );
    }

    // slope manipulator
    // @ts-expect-error guessProperty is Property<Line | NotALine>
    const slopeManipulator = new SlopeManipulator( manipulatorRadius, challenge.guessProperty, riseRangeProperty, runRangeProperty, challenge.modelViewTransform );
    const slopeIsVariable = ( challenge.manipulationMode === ManipulationMode.SLOPE || challenge.manipulationMode === ManipulationMode.SLOPE_INTERCEPT );
    if ( slopeIsVariable ) {
      this.addChild( slopeManipulator );
    }

    // Sync with the guess
    const guessObserver = ( line: Line | NotALine ) => {
      assert && assert( line instanceof Line ); // eslint-disable-line no-simple-type-checking-assertions
      if ( line instanceof Line ) {

        // move the manipulators
        slopeManipulator.translation = challenge.modelViewTransform.modelToViewXY( line.x2, line.y2 );
        yInterceptManipulator.translation = challenge.modelViewTransform.modelToViewXY( line.x1, line.y1 );

        // adjust ranges
        if ( challenge.manipulationMode === ManipulationMode.SLOPE_INTERCEPT ) {
          riseRangeProperty.value = parameterRange.rise( line, challenge.graph );
          y1RangeProperty.value = parameterRange.y1( line, challenge.graph );
        }
      }
    };
    challenge.guessProperty.link( guessObserver ); // unlink in dispose

    this.disposeGraphSlopeInterceptNode = () => {
      yInterceptManipulator.dispose();
      slopeManipulator.dispose();
      challenge.guessProperty.unlink( guessObserver );
    };
  }

  public override dispose(): void {
    this.disposeGraphSlopeInterceptNode();
    super.dispose();
  }
}

graphingLines.register( 'GraphSlopeInterceptNode', GraphSlopeInterceptNode );