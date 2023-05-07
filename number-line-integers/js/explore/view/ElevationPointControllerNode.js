// Copyright 2019-2023, University of Colorado Boulder

/**
 * a Scenery node that is used to control point positions in the "Elevation" scene of the Number Line Integers sim
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Saurabh Totey
 */

import Multilink from '../../../../axon/js/Multilink.js';
import { Shape } from '../../../../kite/js/imports.js';
import PointControllerNode from '../../../../number-line-common/js/common/view/PointControllerNode.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Text } from '../../../../scenery/js/imports.js';
import NLIConstants from '../../common/NLIConstants.js';
import numberLineIntegers from '../../numberLineIntegers.js';
import NumberLineIntegersStrings from '../../NumberLineIntegersStrings.js';

// constants
const IMAGE_DILATION = 20;
const DISTANCE_TEXT_MAX_WIDTH = 250;

const amountAboveSeaLevelString = NumberLineIntegersStrings.amountAboveSeaLevel;
const amountBelowSeaLevelString = NumberLineIntegersStrings.amountBelowSeaLevel;
const seaLevelString = NumberLineIntegersStrings.seaLevel;

class ElevationPointControllerNode extends PointControllerNode {

  /**
   * @param {ElevationPointController} pointController
   * @param {Image[]} imageList - an array of images used to depict this node
   * @param {number} seaLevel - the y value in view coordinates of the sea level
   * @param {Vector2[]} textOffsets - the offsets for the centerLeft positions of the absolute value texts relative to the image rightCenter
   * @param {Object} [options]
   * @public
   */
  constructor( pointController, imageList, seaLevel, textOffsets, options ) {

    assert && assert( !options || !options.node, 'options should not include a node for this constructor' );

    // dilates each image's touch area
    imageList.forEach( image => { image.touchArea = image.localBounds.dilated( IMAGE_DILATION ); } );

    // Create a node with all the images that will be used to depict this elevatable item.
    const compositeImageNode = new Node( { children: imageList } );

    options = merge( {

      // Pass in the parent node that includes all images as the mode that will control the point.
      node: compositeImageNode,

      // {function} - A function that takes a position and a currently selected image index and returns the index
      // of the image that should be visible.  This enabled fairly complex appearance changes to the point controller
      // node.
      imageSelectionFunction: ( position, currentlySelectedImageIndex ) => {
        return currentlySelectedImageIndex;
      }

    }, options );

    let textOffset;

    // Update the visibility of the images as the position changes.
    pointController.positionProperty.link( position => {
      const currentlySelectedImageIndex = _.findIndex( imageList, image => image.visible );
      const selectedImageIndex = options.imageSelectionFunction( position, currentlySelectedImageIndex );
      imageList.forEach( ( image, index ) => {
        image.visible = selectedImageIndex === index;
      } );
      textOffset = textOffsets[ selectedImageIndex ];
    } );

    super( pointController, options );

    // handling of what the point controller does when the absolute value checkbox is checked
    const absoluteValueLine = new Path( null, { stroke: pointController.color, lineWidth: 2 } );
    const distanceText = new Text( '', {
      font: new PhetFont( 18 ),
      fill: pointController.color,
      maxWidth: DISTANCE_TEXT_MAX_WIDTH
    } );
    const distanceLabel = new BackgroundNode( distanceText, NLIConstants.LABEL_BACKGROUND_OPTIONS );
    this.addChild( absoluteValueLine );
    this.addChild( distanceLabel );
    absoluteValueLine.moveToBack();
    const numberLine = pointController.numberLines[ 0 ];

    // Update the absolute value representation and associated text. There is no need to unlink this since the
    // elevation point controllers don't come and go.
    Multilink.multilink(
      [ numberLine.showAbsoluteValuesProperty, pointController.positionProperty ],
      showAbsoluteValues => {
        if ( showAbsoluteValues
             && pointController.overElevationAreaProperty.value
             && pointController.isControllingNumberLinePoint() ) {

          absoluteValueLine.shape = new Shape()
            .moveTo( compositeImageNode.x, compositeImageNode.y )
            .lineTo( compositeImageNode.x, seaLevel );

          const value = pointController.numberLinePoints.get( 0 ).valueProperty.value;
          let seaLevelText = seaLevelString;
          if ( value < 0 ) {
            seaLevelText = StringUtils.fillIn( amountBelowSeaLevelString, { value: Math.abs( value ) } );
          }
          else if ( value > 0 ) {
            seaLevelText = StringUtils.fillIn( amountAboveSeaLevelString, { value: value } );
          }
          distanceText.string = seaLevelText;
          distanceLabel.visible = true;
          distanceLabel.leftCenter = compositeImageNode.rightCenter.plus( textOffset );
        }
        else {
          absoluteValueLine.shape = null;
          distanceLabel.visible = false;
        }
      } );
  }
}

numberLineIntegers.register( 'ElevationPointControllerNode', ElevationPointControllerNode );
export default ElevationPointControllerNode;
