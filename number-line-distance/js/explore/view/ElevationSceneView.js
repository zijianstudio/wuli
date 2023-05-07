// Copyright 2020-2022, University of Colorado Boulder

/**
 * 'Elevation' scene view for the explore screen
 *
 * @author Saurabh Totey
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import birdInAir_png from '../../../../number-line-common/images/birdInAir_png.js';
import birdInWater_png from '../../../../number-line-common/images/birdInWater_png.js';
import fishInAir_png from '../../../../number-line-common/images/fishInAir_png.js';
import fishInWater_png from '../../../../number-line-common/images/fishInWater_png.js';
import { Image, Node, Rectangle } from '../../../../scenery/js/imports.js';
import elevationBackground_png from '../../../images/elevationBackground_png.js';
import numberLineDistance from '../../numberLineDistance.js';
import NumberLineDistanceStrings from '../../NumberLineDistanceStrings.js';
import ElevationPointControllerNode from './ElevationPointControllerNode.js';
import NLDSceneView from './NLDSceneView.js';

const fishString = NumberLineDistanceStrings.fish;
const birdString = NumberLineDistanceStrings.bird;
const elevationSceneAbsoluteDistanceTemplateString = NumberLineDistanceStrings.elevationSceneAbsoluteDistanceTemplate;
const elevationSceneDirectedPositiveDistanceTemplateString = NumberLineDistanceStrings.elevationSceneDirectedPositiveDistanceTemplate;
const elevationSceneDirectedNegativeDistanceTemplateString = NumberLineDistanceStrings.elevationSceneDirectedNegativeDistanceTemplate;
const metersSymbol = NumberLineDistanceStrings.symbol.meters;
const meterString = NumberLineDistanceStrings.meter;
const metersString = NumberLineDistanceStrings.meters;

class ElevationSceneView extends NLDSceneView {

  /**
   * @param {ElevationSceneModel} model
   */
  constructor( model ) {
    super(
      model,
      {
        pointControllerRepresentationOne: new Image( birdInAir_png, { center: new Vector2( 0, -10 ), maxWidth: 35 } ),
        pointControllerRepresentationTwo: new Image( fishInWater_png, { center: Vector2.ZERO, maxWidth: 35 } ),
        distanceDescriptionStrings: {
          absoluteDistanceDescriptionTemplate: elevationSceneAbsoluteDistanceTemplateString,
          directedPositiveDistanceDescriptionTemplate: elevationSceneDirectedPositiveDistanceTemplateString,
          directedNegativeDistanceDescriptionTemplate: elevationSceneDirectedNegativeDistanceTemplateString,
          singularUnits: meterString,
          pluralUnits: metersString,
          getPrimaryPointControllerLabel: isPrimaryNodeSwapped => isPrimaryNodeSwapped ? fishString : birdString,
          getSecondaryPointControllerLabel: isPrimaryNodeSwapped => isPrimaryNodeSwapped ? birdString : fishString
        },
        distanceShadedNumberLineNodeOptions: {
          unitsString: metersSymbol,
          distanceTextPadding: 54 // determined empirically; see https://github.com/phetsims/number-line-distance/issues/67
        }
      }
    );

    // Add background image and water rectangle. Water rectangle is on top of everything so that point controllers
    // appear 'submerged' in water because they are layered beneath the rectangle.
    this.addChild( new Image(
      elevationBackground_png,
      {
        x: model.elevationAreaBounds.minX,
        y: model.elevationAreaBounds.minY,
        maxWidth: model.elevationAreaBounds.width,
        maxHeight: model.elevationAreaBounds.height
      }
    ) );
    const waterRectangle = new Rectangle(
      model.elevationAreaBounds.minX,
      model.elevationAreaBounds.minY + model.elevationAreaBounds.height / 2,
      model.elevationAreaBounds.width,
      model.elevationAreaBounds.height / 2,
      { fill: '#97C4F2', opacity: 0.3 }
    );
    this.addChild( waterRectangle );

    const seaLevel = model.numberLine.valueToModelPosition( 0 ).y;

    // point controllers
    const pointControllerNodeLayer = new Node( {
      children: [
        new ElevationPointControllerNode(
          model.pointControllerOne,
          seaLevel,
          new Image( birdInWater_png, { center: Vector2.ZERO, maxWidth: 65 } ),
          new Image( birdInAir_png, { center: new Vector2( 0, -10 ), maxWidth: 60 } )
        ),
        new ElevationPointControllerNode(
          model.pointControllerTwo,
          seaLevel,
          new Image( fishInWater_png, { center: Vector2.ZERO, maxWidth: 60 } ),
          new Image( fishInAir_png, { center: Vector2.ZERO, maxWidth: 60 } )
        )
      ]
    } );
    this.addChild( pointControllerNodeLayer );

    waterRectangle.moveToFront();
  }

}

numberLineDistance.register( 'ElevationSceneView', ElevationSceneView );
export default ElevationSceneView;
