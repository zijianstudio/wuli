// Copyright 2013-2023, University of Colorado Boulder

/**
 * Challenge graph with manipulators for 2 points, (x1,y1) and (x2,y2), of the guess line.
 * The answer line is initially hidden.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import X1Y1Manipulator from '../../common/view/manipulator/X1Y1Manipulator.js';
import X2Y2Manipulator from '../../common/view/manipulator/X2Y2Manipulator.js';
import Line from '../../common/model/Line.js';
import graphingLines from '../../graphingLines.js';
import LineGameConstants from '../LineGameConstants.js';
import ChallengeGraphNode from './ChallengeGraphNode.js';
import NotALine from '../model/NotALine.js';
import GraphTheLine from '../model/GraphTheLine.js';

export default class GraphTwoPointsNode extends ChallengeGraphNode {

  private readonly disposeGraphTwoPointsNode: () => void;

  public constructor( challenge: GraphTheLine ) {

    super( challenge );

    this.setGuessLineVisible( true );

    const manipulatorRadius = challenge.modelViewTransform.modelToViewDeltaX( LineGameConstants.MANIPULATOR_RADIUS );

    // @ts-expect-error guessProperty is Property<Line | NotALine>
    const x1y1Manipulator = new X1Y1Manipulator( manipulatorRadius, challenge.guessProperty,
      new Property( challenge.graph.xRange ), new Property( challenge.graph.yRange ), challenge.modelViewTransform, false /* constantSlope */ );

    // @ts-expect-error guessProperty is Property<Line | NotALine>
    const x2y2Manipulator = new X2Y2Manipulator( manipulatorRadius, challenge.guessProperty,
      new Property( challenge.graph.xRange ), new Property( challenge.graph.yRange ), challenge.modelViewTransform );

    // Rendering order
    this.addChild( x1y1Manipulator );
    this.addChild( x2y2Manipulator );

    // Sync with the guess by moving the manipulators.
    const guessObserver = ( line: Line | NotALine ) => {
      assert && assert( line instanceof Line ); // eslint-disable-line no-simple-type-checking-assertions
      if ( line instanceof Line ) {
        x1y1Manipulator.translation = challenge.modelViewTransform.modelToViewXY( line.x1, line.y1 );
        x2y2Manipulator.translation = challenge.modelViewTransform.modelToViewXY( line.x2, line.y2 );
      }
    };
    challenge.guessProperty.link( guessObserver ); // unlink in dispose

    this.disposeGraphTwoPointsNode = () => {
      x1y1Manipulator.dispose();
      x2y2Manipulator.dispose();
      challenge.guessProperty.unlink( guessObserver );
    };
  }

  public override dispose(): void {
    this.disposeGraphTwoPointsNode();
    super.dispose();
  }
}

graphingLines.register( 'GraphTwoPointsNode', GraphTwoPointsNode );