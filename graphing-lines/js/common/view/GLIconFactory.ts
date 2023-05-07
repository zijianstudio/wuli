// Copyright 2013-2023, University of Colorado Boulder

/**
 * Factory for creating icons that appear in this sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import { Shape } from '../../../../kite/js/imports.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import FaceWithPointsNode from '../../../../scenery-phet/js/FaceWithPointsNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Line as SceneryLine, Node, Path, TColor } from '../../../../scenery/js/imports.js';
import graphingLines from '../../graphingLines.js';
import GLColors from '../GLColors.js';
import Graph from '../model/Graph.js';
import Line from '../model/Line.js';
import DimensionalArrowNode from './DimensionalArrowNode.js';
import GraphNode from './GraphNode.js';
import Manipulator from './manipulator/Manipulator.js';
import SlopeToolNode from './SlopeToolNode.js';

// constants
const scenery = {
  Line: SceneryLine
};
const SCREEN_ICON_BASE_SIZE = new Dimension2( 548, 373 );
const ARROW_NODE_OPTIONS = { doubleHead: true, stroke: 'black', lineWidth: 18, headWidth: 30, headHeight: 30 };
const DIMENSIONAL_ARROW_NODE_OPTIONS = {
  stroke: GLColors.SLOPE_TOOL_DIMENSIONAL_LINES,
  lineWidth: 18,
  arrowTipSize: new Dimension2( 55, 45 ),
  delimitersVisible: false,
  lineCap: 'round',
  lineJoin: 'round'
};
const MANIPULATOR_RADIUS = 40;

const GLIconFactory = {

  // Creates the icon for the 'Slope' screen. Positions and sizes are 'eye balled'.
  createSlopeScreenIcon(): ScreenIcon {
    const lineNode = new ArrowNode( 0.25 * SCREEN_ICON_BASE_SIZE.width, SCREEN_ICON_BASE_SIZE.height, 0.75 * SCREEN_ICON_BASE_SIZE.width, 0, ARROW_NODE_OPTIONS );
    const riseNode = new DimensionalArrowNode( 0, 0.65 * SCREEN_ICON_BASE_SIZE.height, 0, 0, DIMENSIONAL_ARROW_NODE_OPTIONS );
    const runNode = new DimensionalArrowNode( 0, 0, 0.36 * SCREEN_ICON_BASE_SIZE.width, 0, DIMENSIONAL_ARROW_NODE_OPTIONS );
    const iconNode = new Node( { children: [ lineNode, riseNode, runNode ] } );
    riseNode.centerX = lineNode.left + 10;
    riseNode.bottom = lineNode.bottom - ( 0.2 * lineNode.height );
    runNode.left = riseNode.centerX;
    runNode.centerY = riseNode.top - 5;
    return new ScreenIcon( iconNode, { maxIconWidthProportion: 1, maxIconHeightProportion: 1 } );
  },

  // Creates the icon for the 'Slope-Intercept' screen. Positions and sizes are 'eye balled'.
  createSlopeInterceptScreenIcon(): ScreenIcon {
    const lineNode = new ArrowNode( 0.1 * SCREEN_ICON_BASE_SIZE.width, SCREEN_ICON_BASE_SIZE.height, 0.9 * SCREEN_ICON_BASE_SIZE.width, 0, ARROW_NODE_OPTIONS );
    const axisNode = new scenery.Line( 0, -0.05 * SCREEN_ICON_BASE_SIZE.height, 0, 1.05 * SCREEN_ICON_BASE_SIZE.height, {
      stroke: 'rgb(134,134,134)',
      lineWidth: 10
    } );
    const riseNode = new DimensionalArrowNode( 0, 0.5 * SCREEN_ICON_BASE_SIZE.height, 0, 0, DIMENSIONAL_ARROW_NODE_OPTIONS );
    const runNode = new DimensionalArrowNode( 0, 0, 0.45 * SCREEN_ICON_BASE_SIZE.width, 0, DIMENSIONAL_ARROW_NODE_OPTIONS );
    const interceptNode = Manipulator.createIcon( MANIPULATOR_RADIUS, GLColors.INTERCEPT );
    const iconNode = new Node( { children: [ axisNode, lineNode, riseNode, runNode, interceptNode ] } );
    axisNode.centerX = 0.35 * SCREEN_ICON_BASE_SIZE.width;
    riseNode.centerX = axisNode.left - 60;
    riseNode.bottom = lineNode.bottom - ( 0.3 * lineNode.height );
    runNode.left = riseNode.centerX;
    runNode.centerY = riseNode.top - 5;
    interceptNode.centerX = 0.35 * SCREEN_ICON_BASE_SIZE.width;
    interceptNode.centerY = 0.68 * SCREEN_ICON_BASE_SIZE.height;
    return new ScreenIcon( iconNode, { maxIconWidthProportion: 1, maxIconHeightProportion: 1 } );
  },

  // Creates the icon for the 'Point-Slope' screen. Positions and sizes are 'eye balled'.
  createPointSlopeScreenIcon(): ScreenIcon {
    const lineNode = new ArrowNode( 0, 0.75 * SCREEN_ICON_BASE_SIZE.height, SCREEN_ICON_BASE_SIZE.width, 0.25 * SCREEN_ICON_BASE_SIZE.height, ARROW_NODE_OPTIONS );
    const riseNode = new DimensionalArrowNode( 0, 0.37 * SCREEN_ICON_BASE_SIZE.height, 0, 0, DIMENSIONAL_ARROW_NODE_OPTIONS );
    const runNode = new DimensionalArrowNode( 0, 0, 0.54 * SCREEN_ICON_BASE_SIZE.width, 0, DIMENSIONAL_ARROW_NODE_OPTIONS );
    const pointNode = Manipulator.createIcon( MANIPULATOR_RADIUS, GLColors.INTERCEPT );
    const slopeNode = Manipulator.createIcon( MANIPULATOR_RADIUS, GLColors.SLOPE );
    const iconNode = new Node( { children: [ lineNode, riseNode, runNode, pointNode, slopeNode ] } );
    riseNode.centerX = 0.2 * SCREEN_ICON_BASE_SIZE.width;
    riseNode.bottom = lineNode.bottom - ( 0.4 * lineNode.height );
    runNode.left = riseNode.centerX;
    runNode.centerY = riseNode.top - 5;
    pointNode.centerX = 0.32 * SCREEN_ICON_BASE_SIZE.width;
    pointNode.centerY = 0.58 * SCREEN_ICON_BASE_SIZE.height;
    slopeNode.centerX = 0.75 * SCREEN_ICON_BASE_SIZE.width;
    slopeNode.centerY = 0.36 * SCREEN_ICON_BASE_SIZE.height;
    return new ScreenIcon( iconNode, { maxIconWidthProportion: 1, maxIconHeightProportion: 1 } );
  },

  // Creates the icon for the 'Line Game' screen
  createGameScreenIcon(): ScreenIcon {
    const faceNode = new FaceWithPointsNode( {
      faceDiameter: 75,
      pointsFont: new PhetFont( { size: 24, weight: 'bold' } ),
      pointsAlignment: 'rightCenter',
      points: 2
    } );
    return new ScreenIcon( faceNode, { maxIconWidthProportion: 0.65 } );
  },

  // Creates an icon for the slope-tool feature
  createSlopeToolIcon( width: number ): Node {

    const parentNode = new Node();

    // slope tool
    const slopeToolNode = new SlopeToolNode( new Property( Line.createSlopeIntercept( 1, 2, 0 ) ),
      ModelViewTransform2.createOffsetXYScaleMapping( Vector2.ZERO, 26, -26 ) );
    parentNode.addChild( slopeToolNode );

    // dashed line where the line would be, tweaked visually
    const lineNode = new Path( Shape.lineSegment( slopeToolNode.left + ( 0.4 * slopeToolNode.width ), slopeToolNode.bottom,
        slopeToolNode.right, slopeToolNode.top + ( 0.5 * slopeToolNode.height ) ),
      {
        lineWidth: 1,
        lineDash: [ 6, 6 ],
        stroke: 'black'
      } );
    parentNode.addChild( lineNode );

    parentNode.scale( width / parentNode.width );
    return parentNode;
  },

  // Creates an icon that shows a line on a graph.
  createGraphIcon( width: number, color: TColor, x1: number, y1: number, x2: number, y2: number ): Node {
    const axisRange = new Range( -3, 3 );
    const graph = new Graph( axisRange, axisRange );
    const modelViewTransform = ModelViewTransform2.createOffsetXYScaleMapping( new Vector2( 0, 0 ), 15, -15 );
    const graphNode = new GraphNode( graph, modelViewTransform );
    const p1 = modelViewTransform.modelToViewXY( x1, y1 );
    const p2 = modelViewTransform.modelToViewXY( x2, y2 );
    graphNode.addChild( new Path( Shape.lineSegment( p1.x, p1.y, p2.x, p2.y ), {
      stroke: color, lineWidth: 5
    } ) );
    graphNode.scale( width / graphNode.width );
    return graphNode;
  }
};

graphingLines.register( 'GLIconFactory', GLIconFactory );

export default GLIconFactory;