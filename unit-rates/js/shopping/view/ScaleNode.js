// Copyright 2017-2023, University of Colorado Boulder

/**
 * View of the scale, with display for cost and (optionally) quantity.
 * Origin is at the center of the top surface.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { Circle, HBox, Line, LinearGradient, Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import URColors from '../../common/URColors.js';
import URUtils from '../../common/URUtils.js';
import ValueNode from '../../common/view/ValueNode.js';
import ValuePanel from '../../common/view/ValuePanel.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
import CostNode from './CostNode.js';

// constants
const PANEL_WIDTH = 132;
const PANEL_MIN_HEIGHT = 32;
const DISPLAY_X_MARGIN = 25;
const DISPLAY_Y_MARGIN = 7;

export default class ScaleNode extends Node {
  /**
   * @param {Scale} scale
   * @param {Object} [options]
   */
  constructor( scale, options ) {

    options = merge( {
      costExpandedProperty: null, // {Property.<boolean>|null} null indicates that cost display is not collapsible
      extraCostDecimalVisible: false, // {boolean} does the scale show a 3rd decimal place for cost?
      quantityIsDisplayed: false // {boolean} does the scale show quantity?
    }, options );

    // round platter on top, origin at center ---------------------------------------------------

    const topThickness = 8;
    const topRadiusX = 0.5 * scale.width;
    const topRadiusY = 0.5 * scale.depth;
    const topFaceShape = new Shape()
      .ellipse( 0, 0, topRadiusX, topRadiusY, 0 );
    const topSideShape = new Shape()
      .moveTo( -topRadiusX, 0 )
      .lineTo( -topRadiusX, topThickness )
      .ellipticalArc( 0, topThickness, topRadiusX, topRadiusY, 0, Math.PI, 0, true )
      .lineTo( topRadiusX, 0 )
      .close();

    const topFaceNode = new Path( topFaceShape, {
      fill: new LinearGradient( -topRadiusX / 2, -topRadiusX / 2, topRadiusX / 2, topRadiusX / 2 )
        .addColorStop( 0, URColors.scaleTopLight )
        .addColorStop( 0.5, URColors.scaleTopDark )
        .addColorStop( 1, URColors.scaleTopLight ),
      stroke: 'black'
    } );
    const topSideNode = new Path( topSideShape, {
      fill: 'rgb( 140, 140, 140 )',
      stroke: 'black'
    } );
    const topNode = new Node( {
      children: [ topSideNode, topFaceNode ]
    } );

    // shadow under the top platter
    const shadowNode = new Path( topFaceShape, {
      fill: 'rgb( 100, 100, 100 )',
      opacity: 0.2,
      y: topFaceNode.y + ( 2 * topThickness )
    } );

    // body of the scale ---------------------------------------------------------------------

    // scale.width is the width at the midpoint of the scale's top face, compute the foreground and background widths
    const foregroundWidth = scale.width + scale.perspectiveXOffset;
    const backgroundWidth = scale.width - scale.perspectiveXOffset;

    // draw top face clockwise, starting at front-left corner, in pseudo-3D using parallel perspective
    const bodyShape = new Shape()
      .moveTo( 0, 0 )
      .lineTo( scale.perspectiveXOffset, -scale.depth )
      .lineTo( scale.perspectiveXOffset + backgroundWidth, -scale.depth )
      .lineTo( foregroundWidth, 0 );

    // add front face
    bodyShape.rect( 0, 0, scale.width + scale.perspectiveXOffset, scale.height );

    // origin at center of top face
    const bodyNode = new Path( bodyShape, {
      fill: URColors.scaleBody,
      stroke: 'black',
      lineJoin: 'round',
      centerX: topNode.centerX,
      centerY: topNode.centerY + scale.depth
    } );

    // display on front of the scale ---------------------------------------------------------------------

    // display background
    const displayBackgroundNode = new Rectangle( 0, 0, foregroundWidth - ( 2 * DISPLAY_X_MARGIN ), scale.height - ( 2 * DISPLAY_Y_MARGIN ), {
      fill: 'black',
      cornerRadius: 4,
      left: bodyNode.left + DISPLAY_X_MARGIN,
      bottom: bodyNode.bottom - DISPLAY_Y_MARGIN
    } );

    // Nodes that make up the numeric display on the scale
    const displayChildren = [];

    // dispose required
    const costNode = new CostNode( scale.costProperty, {
      extraDecimalVisible: options.extraCostDecimalVisible,
      maxWidth: 90 // i18n, determined empirically
    } );

    // dispose required
    const costPanel = new ValuePanel( costNode, {
      panelWidth: PANEL_WIDTH,
      panelMinHeight: PANEL_MIN_HEIGHT,
      expandedProperty: options.costExpandedProperty,
      titleString: UnitRatesStrings.cost
    } );
    displayChildren.push( costPanel );

    // optional quantity display
    let quantityNode = null;
    let quantityPanel = null;
    if ( options.quantityIsDisplayed ) {

      // dispose required
      quantityNode = new ValueNode( scale.quantityProperty, {
        valueToString: value => quantityToString( value, scale.quantityUnits )
      } );

      // dispose required
      quantityPanel = new ValuePanel( quantityNode, {
        panelWidth: PANEL_WIDTH,
        panelMinHeight: PANEL_MIN_HEIGHT
      } );
      displayChildren.push( quantityPanel );
    }

    // Assemble the display
    const displayNode = new Node( {
      children: [
        displayBackgroundNode,
        new HBox( {
          children: displayChildren,
          align: 'center',
          spacing: 8,
          center: displayBackgroundNode.center
        } ) ]
    } );

    // put all of the above pieces together ---------------------------------------------------------------------

    // This type does not propagate options to the supertype because the model determines position.
    super( {
      children: [ bodyNode, shadowNode, topNode, displayNode ]
    } );

    // red dot at origin, red line at drag threshold
    if ( phet.chipper.queryParameters.dev ) {
      this.addChild( new Circle( 2, { fill: 'red' } ) );
      const lineY = scale.yAboveScale - scale.position.y;
      this.addChild( new Line( -foregroundWidth / 2, lineY, foregroundWidth / 2, lineY, { stroke: 'red' } ) );
    }

    // move to model position
    this.translation = scale.position;

    // @private
    this.disposeScaleNode = () => {
      costNode.dispose();
      costPanel.dispose();
      quantityNode && quantityNode.dispose();
      quantityPanel && quantityPanel.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeScaleNode();
    super.dispose();
  }
}

/**
 * Converts a quantity to a string with units, e.g. 10.5 -> '10.5 lb'
 * @param {number} quantity
 * @param {string} units
 * @returns {string}
 */
function quantityToString( quantity, units ) {
  return StringUtils.format( UnitRatesStrings.pattern_0value_1units,
    URUtils.numberToString( quantity, 1 /* maxDecimals */, false /* trimZeros */ ), units );
}

unitRates.register( 'ScaleNode', ScaleNode );