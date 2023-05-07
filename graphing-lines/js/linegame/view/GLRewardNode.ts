// Copyright 2013-2023, University of Colorado Boulder

/**
 * GLRewardNode is the reward that is displayed when a game is completed with a perfect score.
 * Various images (based on game level) move from top to bottom in the play area.
 * Run with the 'reward' query parameter to show the reward at the end of every game, regardless of score.
 *
 * Here's what you'll see at each level:
 *
 * Level 1 = equations
 * Level 2 = graphs
 * Level 3 = point tools
 * Level 4 = smiley faces
 * Level 5 = paper airplanes
 * Level 6 = all of the above
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import PaperAirplaneNode from '../../../../scenery-phet/js/PaperAirplaneNode.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import { Color, Node } from '../../../../scenery/js/imports.js';
import RewardNode from '../../../../vegas/js/RewardNode.js';
import GLConstants from '../../common/GLConstants.js';
import Line from '../../common/model/Line.js';
import GLIconFactory from '../../common/view/GLIconFactory.js';
import PointToolBodyNode from '../../common/view/PointToolBodyNode.js';
import PointToolProbeNode from '../../common/view/PointToolProbeNode.js';
import graphingLines from '../../graphingLines.js';
import PointSlopeEquationNode from '../../pointslope/view/PointSlopeEquationNode.js';
import SlopeInterceptEquationNode from '../../slopeintercept/view/SlopeInterceptEquationNode.js';

// constants
const NUMBER_OF_NODES = 150;
const NODE_COLORS = [ 'yellow', PhetColorScheme.RED_COLORBLIND, 'orange', 'magenta', 'cyan', 'green' ];
const EQUATION_FONT_SIZE = 24;
const GRAPH_WIDTH = 60;
const FACE_DIAMETER = 60;
const AIRPLANE_SCALE = 1.76;

export default class GLRewardNode extends RewardNode {

  public constructor( rewardNodes: Node[] ) {
    super( { nodes: rewardNodes } );
  }

  /**
   * Creates a set of equations nodes.
   */
  public static createEquationNodes(): Node[] {
    return RewardNode.createRandomNodes( createNodes( createEquationNode, NODE_COLORS ), NUMBER_OF_NODES );
  }

  /**
   * Creates a set of equations graph.
   */
  public static createGraphNodes(): Node[] {
    return RewardNode.createRandomNodes( createNodes( createGraphNode, NODE_COLORS ), NUMBER_OF_NODES );
  }

  /**
   * Creates a set of 'point tool' nodes.
   */
  public static createPointToolNodes(): Node[] {
    return RewardNode.createRandomNodes( createNodes( createPointToolNode, NODE_COLORS ), NUMBER_OF_NODES );
  }

  /**
   * Creates a set of 'smiley face' nodes.
   */
  public static createSmileyFaceNodes(): Node[] {
    return RewardNode.createRandomNodes( createNodes( createFaceNode, NODE_COLORS ), NUMBER_OF_NODES );
  }

  /**
   * Creates a set of paper airplane nodes, similar to the PhET logo.
   */
  public static createPaperAirplaneNodes(): Node[] {
    return RewardNode.createRandomNodes( createNodes( createPaperAirplaneNode, NODE_COLORS ), NUMBER_OF_NODES );
  }

  /**
   * Creates an assortment of nodes, using all of the above types.
   */
  public static createAssortedNodes(): Node[] {
    const nodes = createNodes( createEquationNode, NODE_COLORS )
      .concat( createNodes( createGraphNode, NODE_COLORS ) )
      .concat( createNodes( createPointToolNode, NODE_COLORS ) )
      .concat( createNodes( createFaceNode, NODE_COLORS ) )
      .concat( createNodes( createPaperAirplaneNode, NODE_COLORS ) );
    return RewardNode.createRandomNodes( nodes, NUMBER_OF_NODES );
  }
}

//-----------------------------------------------------------------------------------------------
// Misc. utility functions
//-----------------------------------------------------------------------------------------------

function getRandomX(): number {
  return getRandomNonZeroInteger( GLConstants.X_AXIS_RANGE.min, GLConstants.X_AXIS_RANGE.max );
}

function getRandomY(): number {
  return getRandomNonZeroInteger( GLConstants.Y_AXIS_RANGE.min, GLConstants.Y_AXIS_RANGE.max );
}

function getRandomNonZeroInteger( min: number, max: number ): number {
  let i = Utils.roundSymmetric( min + ( dotRandom.nextDouble() * ( max - min ) ) );
  if ( i === 0 ) { i = 1; }
  return i;
}

//-----------------------------------------------------------------------------------------------
// Functions that create specific types of nodes.
// All of these function must have a {Color|String} color parameter.
//-----------------------------------------------------------------------------------------------

// Creates a random equation with the specified color.
function createEquationNode( color: Color | string ): Node {
  let node;
  if ( dotRandom.nextDouble() < 0.5 ) {
    node = SlopeInterceptEquationNode.createDynamicLabel(
      new Property( Line.createSlopeIntercept( getRandomY(), getRandomX(), getRandomY(), color ) ), {
        fontSize: EQUATION_FONT_SIZE
      } );
  }
  else {
    node = PointSlopeEquationNode.createDynamicLabel(
      new Property( Line.createPointSlope( getRandomX(), getRandomY(), getRandomX(), getRandomY(), color ) ), {
        fontSize: EQUATION_FONT_SIZE
      } );
  }
  return node;
}

// Creates a random graph with the specified color.
function createGraphNode( color: Color | string ): Node {
  let node;
  if ( dotRandom.nextDouble() < 0.5 ) {
    node = GLIconFactory.createGraphIcon( GRAPH_WIDTH, color, -3, -3, 3, 3 ); // y = +x
  }
  else {
    node = GLIconFactory.createGraphIcon( GRAPH_WIDTH, color, -3, 3, 3, -3 ); // y = -x
  }
  return node;
}

/**
 * Creates a random point tool with the specified color.
 * This does not use PointToolNode because it has too many model dependencies.
 */
function createPointToolNode( color: Color | string ): Node {
  const coordinatesProperty = new Vector2Property( new Vector2( getRandomX(), getRandomY() ) );
  const bodyNode = new PointToolBodyNode( coordinatesProperty, {
    backgroundFill: color
  } );
  const probeNode = new PointToolProbeNode( {
    centerX: 0.25 * bodyNode.width,
    top: bodyNode.bottom - 2 // overlap
  } );
  return new Node( { children: [ probeNode, bodyNode ] } );
}

// Creates a smiley face with the specified color.
function createFaceNode( color: Color | string ): Node {
  return new FaceNode( FACE_DIAMETER, { headFill: color } );
}

// Creates a paper airplane with the specified color.
function createPaperAirplaneNode( color: Color | string ): Node {
  return new PaperAirplaneNode( { fill: color, scale: AIRPLANE_SCALE } ); // width of around 60px
}

/**
 * Creates an array of nodes for a specified array of colors.
 * The functions above serve as the creationFunction argument.
 */
function createNodes( creationFunction: ( color: Color | string ) => Node, colors: Array<Color | string> ): Node[] {
  return colors.map( color => creationFunction( color ) );
}

graphingLines.register( 'GLRewardNode', GLRewardNode );