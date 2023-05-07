// Copyright 2014-2022, University of Colorado Boulder

/**
 * This file contains the code used to generate the screen icons that need to be produced in code in order to look half
 * decent.
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Screen from '../../../../joist/js/Screen.js';
import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import { Color, HBox, LinearGradient, Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../AreaBuilderSharedConstants.js';
import GridIcon from './GridIcon.js';

// constants
const NAV_BAR_ICON_SIZE = Screen.MINIMUM_NAVBAR_ICON_SIZE;
const GRID_STROKE = null;
const SHAPE_LINE_WIDTH = 1;
const GRID_OPTIONS = {
  backgroundStroke: 'black',
  backgroundLineWidth: 0.5,
  gridStroke: GRID_STROKE,
  shapeLineWidth: SHAPE_LINE_WIDTH
};

function createBucketIcon( options ) {
  const icon = new Node();
  const ellipseXRadius = NAV_BAR_ICON_SIZE.width * 0.125;
  const ellipseYRadius = ellipseXRadius * 0.3;
  const bucketDepth = ellipseXRadius * 0.75;
  const bodyShape = new Shape()
    .moveTo( -ellipseXRadius, 0 )
    .lineTo( -ellipseXRadius * 0.75, bucketDepth )
    .quadraticCurveTo( 0, bucketDepth + ellipseYRadius, ellipseXRadius * 0.75, bucketDepth )
    .lineTo( ellipseXRadius, 0 )
    .close();
  icon.addChild( new Path( bodyShape, { fill: 'blue', stroke: 'blue', lineWidth: 0.5 } ) );
  icon.addChild( new Path( Shape.ellipse( 0, 0, ellipseXRadius, ellipseYRadius ), {
    fill: new LinearGradient( -ellipseXRadius, 0, ellipseXRadius, 0 ).addColorStop( 0, '#333333' ).addColorStop( 1, '#999999' )
  } ) );

  icon.mutate( options );
  return icon;
}

/**
 * Static object, not meant to be instantiated.
 */
const AreaBuilderIconFactory = {
  createExploreScreenNavBarIcon() {

    // root node
    const icon = new Node();

    // background
    icon.addChild( new Rectangle( 0, 0, NAV_BAR_ICON_SIZE.width, NAV_BAR_ICON_SIZE.height, 0, 0, {
      fill: AreaBuilderSharedConstants.BACKGROUND_COLOR
    } ) );

    // left shape placement board and shapes
    const unitSquareLength = 15;
    const leftBoard = new GridIcon( 4, 4, unitSquareLength, AreaBuilderSharedConstants.GREENISH_COLOR, [
      new Vector2( 1, 1 ), new Vector2( 2, 1 ), new Vector2( 1, 2 )
    ], merge( { left: NAV_BAR_ICON_SIZE.width * 0.05, top: NAV_BAR_ICON_SIZE.height * 0.1 }, GRID_OPTIONS ) );
    icon.addChild( leftBoard );

    // right shape placement board and shapes
    const rightBoard = new GridIcon( 4, 4, unitSquareLength, AreaBuilderSharedConstants.PURPLISH_COLOR, [
      new Vector2( 1, 1 ), new Vector2( 2, 1 )
    ], merge( { right: NAV_BAR_ICON_SIZE.width * 0.95, top: NAV_BAR_ICON_SIZE.height * 0.1 }, GRID_OPTIONS ) );
    icon.addChild( rightBoard );

    // left bucket
    icon.addChild( createBucketIcon( { centerX: leftBoard.centerX, top: leftBoard.bottom + 2 } ) );

    // right bucket
    icon.addChild( createBucketIcon( { centerX: rightBoard.centerX, top: rightBoard.bottom + 2 } ) );

    return new ScreenIcon( icon, {
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 1
    } );
  },

  createGameScreenNavBarIcon() {

    // root node
    const icon = new Node();

    // background
    icon.addChild( new Rectangle( 0, 0, NAV_BAR_ICON_SIZE.width, NAV_BAR_ICON_SIZE.height, 0, 0, {
      fill: AreaBuilderSharedConstants.BACKGROUND_COLOR
    } ) );

    // shape placement board and shapes
    const unitSquareLength = 12;
    const shapePlacementBoard = new GridIcon( 4, 4, unitSquareLength, AreaBuilderSharedConstants.GREENISH_COLOR, [
      new Vector2( 1, 1 ), new Vector2( 2, 1 ), new Vector2( 2, 2 )
    ], merge( { left: NAV_BAR_ICON_SIZE.width * 0.075, top: NAV_BAR_ICON_SIZE.height * 0.1 }, GRID_OPTIONS ) );
    icon.addChild( shapePlacementBoard );

    // smiley face
    icon.addChild( new FaceNode( NAV_BAR_ICON_SIZE.width * 0.35, {
      left: shapePlacementBoard.right + 4,
      centerY: shapePlacementBoard.centerY
    } ) );

    // shape carousel
    const shapeCarousel = new Rectangle( 0, 0, NAV_BAR_ICON_SIZE.width * 0.5, NAV_BAR_ICON_SIZE.height * 0.25, 1, 1, {
      fill: AreaBuilderSharedConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      stroke: 'black',
      lineWidth: 0.5,
      top: shapePlacementBoard.bottom + 8,
      centerX: NAV_BAR_ICON_SIZE.width / 2
    } );
    icon.addChild( shapeCarousel );

    // shapes on the shape carousel
    const shapeFill = AreaBuilderSharedConstants.GREENISH_COLOR;
    const shapeStroke = new Color( shapeFill ).colorUtilsDarker( AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR );
    const shapes = new HBox( {
      children: [
        new Rectangle( 0, 0, unitSquareLength, unitSquareLength, 0, 0, {
          fill: shapeFill,
          stroke: shapeStroke
        } ),
        new HBox( {
          children: [
            new Rectangle( 0, 0, unitSquareLength, unitSquareLength, 0, 0, {
              fill: shapeFill,
              stroke: shapeStroke
            } ),
            new Rectangle( 0, 0, unitSquareLength, unitSquareLength, 0, 0, {
              fill: shapeFill,
              stroke: shapeStroke
            } )
          ], spacing: 0
        } ) ],
      spacing: 2,
      centerX: shapeCarousel.width / 2,
      centerY: shapeCarousel.height / 2
    } );

    shapeCarousel.addChild( shapes );

    return new ScreenIcon( icon, {
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 1
    } );
  }
};

areaBuilder.register( 'AreaBuilderIconFactory', AreaBuilderIconFactory );
export default AreaBuilderIconFactory;