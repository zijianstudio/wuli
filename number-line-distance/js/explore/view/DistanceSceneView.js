// Copyright 2020-2022, University of Colorado Boulder

/**
 * 'Distance' scene view for the explore screen
 *
 * @author Saurabh Totey
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Image, Node, Text } from '../../../../scenery/js/imports.js';
import fireHydrant_png from '../../../images/fireHydrant_png.js';
import sidewalk_png from '../../../images/sidewalk_png.js';
import house_png from '../../../mipmaps/house_png.js';
import person_png from '../../../mipmaps/person_png.js';
import numberLineDistance from '../../numberLineDistance.js';
import NumberLineDistanceStrings from '../../NumberLineDistanceStrings.js';
import DistancePointControllerNode from './DistancePointControllerNode.js';
import NLDSceneView from './NLDSceneView.js';

const eastString = NumberLineDistanceStrings.symbol.east;
const westString = NumberLineDistanceStrings.symbol.west;
const houseString = NumberLineDistanceStrings.house;
const personString = NumberLineDistanceStrings.person;
const distanceSceneAbsoluteDistanceTemplateString = NumberLineDistanceStrings.distanceSceneAbsoluteDistanceTemplate;
const distanceSceneDirectedPositiveDistanceTemplateString = NumberLineDistanceStrings.distanceSceneDirectedPositiveDistanceTemplate;
const distanceSceneDirectedNegativeDistanceTemplateString = NumberLineDistanceStrings.distanceSceneDirectedNegativeDistanceTemplate;
const metersSymbol = NumberLineDistanceStrings.symbol.meters;
const meterString = NumberLineDistanceStrings.meter;
const metersString = NumberLineDistanceStrings.meters;

const DIRECTION_INDICATOR_FONT = new PhetFont( 25 );
const DIRECTION_INDICATOR_MAX_WIDTH = 50;

class DistanceSceneView extends NLDSceneView {

  /**
   * @param {DistanceSceneModel} model
   */
  constructor( model ) {

    // Create the representations for the person and the house in the area that they can be swapped.
    // scales were empirically determined
    const houseRepresentation = new Image( house_png, { scale: 0.15 } );
    const personRepresentation = new Image( person_png, { scale: 0.1 } );
    const smallestWidth = Math.min( houseRepresentation.getImageWidth(), personRepresentation.getImageWidth() );
    houseRepresentation.maxWidth = smallestWidth;
    personRepresentation.maxWidth = smallestWidth;

    super(
      model,
      {
        pointControllerRepresentationOne: houseRepresentation,
        pointControllerRepresentationTwo: personRepresentation,
        distanceDescriptionStrings: {
          absoluteDistanceDescriptionTemplate: distanceSceneAbsoluteDistanceTemplateString,
          directedPositiveDistanceDescriptionTemplate: distanceSceneDirectedPositiveDistanceTemplateString,
          directedNegativeDistanceDescriptionTemplate: distanceSceneDirectedNegativeDistanceTemplateString,
          singularUnits: meterString,
          pluralUnits: metersString,
          getPrimaryPointControllerLabel: isPrimaryNodeSwapped => isPrimaryNodeSwapped ? personString : houseString,
          getSecondaryPointControllerLabel: isPrimaryNodeSwapped => isPrimaryNodeSwapped ? houseString : personString
        },
        distanceShadedNumberLineNodeOptions: { unitsString: metersSymbol }
      }
    );

    // image that represents the plane where the person and the house lie
    const sidewalkImage = new Image( sidewalk_png );
    sidewalkImage.scale( model.sidewalkBounds.width / sidewalkImage.width, model.sidewalkBounds.height / sidewalkImage.height );
    sidewalkImage.center = model.sidewalkBounds.center;
    this.addChild( sidewalkImage );

    // fire hydrant that sits at the 0 location of the number line
    // offset and scale empirically determined
    this.addChild( new Image(
      fireHydrant_png,
      {
        centerX: model.sidewalkBounds.center.x,
        bottom: model.sidewalkBounds.center.y - 5,
        scale: 0.15
      }
    ) );

    // Point controllers that are in different parent nodes so that the person is always on top of the house in terms of
    // layering. The mouse area dilation for the personPointControllerImage is for #38.
    // the image scales and dilations are empirically determined
    const personPointControllerImage = new Image( person_png, { scale: 0.22 } );
    personPointControllerImage.mouseArea = personPointControllerImage.localBounds.dilated(
      5 / personPointControllerImage.getScaleVector().x
    );
    const housePointControllerImage = new Image( house_png, { scale: 0.2 } );
    const pointControllersLayer = new Node();
    pointControllersLayer.addChild( new Node( {
      children: [
        new DistancePointControllerNode(
          model.pointControllerOne,
          housePointControllerImage
        )
      ]
    } ) );
    pointControllersLayer.addChild( new Node( {
      children: [
        new DistancePointControllerNode(
          model.pointControllerTwo,
          personPointControllerImage
        )
      ]
    } ) );
    this.addChild( pointControllersLayer );

    // symbols at edges of number line denoting east and west
    const textOffsetFromNumberLine =
      this.numberLineNode.options.displayedRangeInset + this.numberLineNode.options.arrowSize + 15; // empirically determined
    const range = model.numberLine.displayedRangeProperty.value;
    const eastSymbolText = new Text( eastString, {
      font: DIRECTION_INDICATOR_FONT,
      center: model.numberLine.valueToModelPosition( range.max ).plusXY( textOffsetFromNumberLine, 0 ),
      maxWidth: DIRECTION_INDICATOR_MAX_WIDTH
    } );
    const westSymbolText = new Text( westString, {
      font: DIRECTION_INDICATOR_FONT,
      center: model.numberLine.valueToModelPosition( range.min ).plusXY( -textOffsetFromNumberLine, 0 ),
      maxWidth: DIRECTION_INDICATOR_MAX_WIDTH
    } );
    this.addChild( eastSymbolText );
    this.addChild( westSymbolText );
    eastSymbolText.moveToBack();
    westSymbolText.moveToBack();
  }

}

numberLineDistance.register( 'DistanceSceneView', DistanceSceneView );
export default DistanceSceneView;
