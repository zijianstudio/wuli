// Copyright 2013-2023, University of Colorado Boulder

/**
 * Challenge graph with manipulators for point (x1,y1) and slope of the guess line.
 * The answer line is initially hidden.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import SlopeManipulator from '../../common/view/manipulator/SlopeManipulator.js';
import X1Y1Manipulator from '../../common/view/manipulator/X1Y1Manipulator.js';
import graphingLines from '../../graphingLines.js';
import PointSlopeParameterRange from '../../pointslope/model/PointSlopeParameterRange.js';
import LineGameConstants from '../LineGameConstants.js';
import ManipulationMode from '../model/ManipulationMode.js';
import ChallengeGraphNode from './ChallengeGraphNode.js';
import GraphTheLine from '../model/GraphTheLine.js';
import NotALine from '../model/NotALine.js';
import Line from '../../common/model/Line.js';

export default class GraphPointSlopeNode extends ChallengeGraphNode {

  private readonly disposeGraphPointSlopeNode: () => void;

  public constructor( challenge: GraphTheLine ) {

    super( challenge );

    this.setGuessLineVisible( true );

    // dynamic ranges
    const pointSlopeParameterRange = new PointSlopeParameterRange();
    const x1RangeProperty = new Property( challenge.graph.xRange );
    const y1RangeProperty = new Property( challenge.graph.yRange );
    // @ts-expect-error guessProperty is Property<Line | NotALine>
    const riseRangeProperty = new Property( pointSlopeParameterRange.rise( challenge.guessProperty.value, challenge.graph ) );
    // @ts-expect-error guessProperty is Property<Line | NotALine>
    const runRangeProperty = new Property( pointSlopeParameterRange.run( challenge.guessProperty.value, challenge.graph ) );

    const manipulatorRadius = challenge.modelViewTransform.modelToViewDeltaX( LineGameConstants.MANIPULATOR_RADIUS );

    // point manipulator
    // @ts-expect-error guessProperty is Property<Line | NotALine>
    const pointManipulator = new X1Y1Manipulator( manipulatorRadius, challenge.guessProperty, x1RangeProperty, y1RangeProperty, challenge.modelViewTransform, true /* constantSlope */ );
    const pointIsVariable = ( challenge.manipulationMode === ManipulationMode.POINT || challenge.manipulationMode === ManipulationMode.POINT_SLOPE );
    if ( pointIsVariable ) {
      this.addChild( pointManipulator );
    }

    // slope manipulator
    // @ts-expect-error guessProperty is Property<Line | NotALine>
    const slopeManipulator = new SlopeManipulator( manipulatorRadius, challenge.guessProperty, riseRangeProperty, runRangeProperty, challenge.modelViewTransform );
    const slopeIsVariable = ( challenge.manipulationMode === ManipulationMode.SLOPE || challenge.manipulationMode === ManipulationMode.POINT_SLOPE );
    if ( slopeIsVariable ) {
      this.addChild( slopeManipulator );
    }

    // Sync with the guess
    const guessObserver = ( line: Line | NotALine ) => {
      assert && assert( line instanceof Line ); // eslint-disable-line no-simple-type-checking-assertions
      if ( line instanceof Line ) {

        // move the manipulators
        pointManipulator.translation = challenge.modelViewTransform.modelToViewXY( line.x1, line.y1 );
        slopeManipulator.translation = challenge.modelViewTransform.modelToViewXY( line.x2, line.y2 );

        // adjust ranges
        if ( challenge.manipulationMode === ManipulationMode.POINT_SLOPE ) {
          x1RangeProperty.value = pointSlopeParameterRange.x1( line, challenge.graph );
          y1RangeProperty.value = pointSlopeParameterRange.y1( line, challenge.graph );
          riseRangeProperty.value = pointSlopeParameterRange.rise( line, challenge.graph );
          runRangeProperty.value = pointSlopeParameterRange.run( line, challenge.graph );
        }
      }
    };
    challenge.guessProperty.link( guessObserver ); // unlink in dispose

    this.disposeGraphPointSlopeNode = () => {
      pointManipulator.dispose();
      slopeManipulator.dispose();
      challenge.guessProperty.unlink( guessObserver );
    };
  }

  public override dispose(): void {
    this.disposeGraphPointSlopeNode();
    super.dispose();
  }
}

graphingLines.register( 'GraphPointSlopeNode', GraphPointSlopeNode );