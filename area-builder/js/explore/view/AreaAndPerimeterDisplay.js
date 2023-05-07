// Copyright 2014-2023, University of Colorado Boulder

/**
 * An accordion box that displays the area and perimeter of shape that may change dynamically.
 *
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderStrings from '../../AreaBuilderStrings.js';

const areaString = AreaBuilderStrings.area;
const perimeterString = AreaBuilderStrings.perimeter;
const valuesString = AreaBuilderStrings.values;

// constants
const DISPLAY_FONT = new PhetFont( 14 );
const MAX_CONTENT_WIDTH = 200; // empirically determined, supports translation
const MAX_TITLE_WIDTH = 190; // empirically determined, supports translation

class AreaAndPerimeterDisplay extends AccordionBox {

  /**
   * @param {Property.<Object>} areaAndPerimeterProperty - An object containing values for area and perimeter
   * @param {Color} areaTextColor
   * @param {Color} perimeterTextColor
   * @param {Object} [options]
   */
  constructor( areaAndPerimeterProperty, areaTextColor, perimeterTextColor, options ) {

    options = merge( {
      maxWidth: Number.POSITIVE_INFINITY,
      cornerRadius: 3,
      titleNode: new Text( valuesString, { font: DISPLAY_FONT, maxWidth: MAX_TITLE_WIDTH } ),
      titleAlignX: 'left',
      contentAlign: 'left',
      fill: 'white',
      showTitleWhenExpanded: false,
      contentXMargin: 8,
      contentYMargin: 4,
      expandCollapseButtonOptions: {
        touchAreaXDilation: 10,
        touchAreaYDilation: 10
      }
    }, options );

    const contentNode = new Node();
    const areaCaption = new Text( areaString, { font: DISPLAY_FONT } );
    const perimeterCaption = new Text( perimeterString, { font: DISPLAY_FONT } );
    const tempTwoDigitString = new Text( '999', { font: DISPLAY_FONT } );
    const areaReadout = new Text( '', { font: DISPLAY_FONT, fill: areaTextColor } );
    const perimeterReadout = new Text( '', { font: DISPLAY_FONT, fill: perimeterTextColor } );

    contentNode.addChild( areaCaption );
    perimeterCaption.left = areaCaption.left;
    perimeterCaption.top = areaCaption.bottom + 5;
    contentNode.addChild( perimeterCaption );
    contentNode.addChild( areaReadout );
    contentNode.addChild( perimeterReadout );
    const readoutsRightEdge = Math.max( perimeterCaption.right, areaCaption.right ) + 8 + tempTwoDigitString.width;

    areaAndPerimeterProperty.link( areaAndPerimeter => {
      areaReadout.string = areaAndPerimeter.area;
      areaReadout.bottom = areaCaption.bottom;
      areaReadout.right = readoutsRightEdge;
      perimeterReadout.string = areaAndPerimeter.perimeter;
      perimeterReadout.bottom = perimeterCaption.bottom;
      perimeterReadout.right = readoutsRightEdge;
    } );

    // in support of translation, scale the content node if it's too big
    if ( contentNode.width > MAX_CONTENT_WIDTH ) {
      contentNode.scale( MAX_CONTENT_WIDTH / contentNode.width );
    }

    super( contentNode, options );
  }
}

areaBuilder.register( 'AreaAndPerimeterDisplay', AreaAndPerimeterDisplay );
export default AreaAndPerimeterDisplay;