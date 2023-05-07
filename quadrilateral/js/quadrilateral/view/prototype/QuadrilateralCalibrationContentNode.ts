// Copyright 2021-2023, University of Colorado Boulder

/**
 * The contents of a Dialog that will support calibrating a device to the simulation. The device is feeding
 * physical values measured by sensors. Those need to be mapped to model coordinates in the sim. We calibrate
 * by asking the user to set their device as large as they can make it. From the largest device values, we can
 * create a linear mapping to model coordinates.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../../dot/js/Bounds2.js';
import Utils from '../../../../../dot/js/Utils.js';
import quadrilateral from '../../../quadrilateral.js';
import { Circle, Line, Rectangle, Text, VBox, VBoxOptions } from '../../../../../scenery/js/imports.js';
import optionize, { EmptySelfOptions } from '../../../../../phet-core/js/optionize.js';
import QuadrilateralConstants from '../../../QuadrilateralConstants.js';
import TangibleConnectionModel from '../../model/prototype/TangibleConnectionModel.js';

// not translatable because this is a prototype feature.
const calibrationHintText = 'Extend your connected device to the maximum limits and then close this dialog box.';

// We are going to draw circles representing the vertex positions in the dialog, this is their shared radius.
const VERTEX_VIEW_RADIUS = 5;

export default class QuadrilateralCalibrationContentNode extends VBox {
  public constructor( tangibleConnectionModel: TangibleConnectionModel, providedOptions?: VBoxOptions ) {

    const options = optionize<VBoxOptions, EmptySelfOptions>()( {
      align: 'center'
    }, providedOptions );

    const calibrateHintText = new Text( calibrationHintText, QuadrilateralConstants.SCREEN_TEXT_OPTIONS );

    // create a square shape to display the values provided by the quadrilateral model
    const viewBounds = new Bounds2( 0, 0, 300, 300 );
    const calibrationRectangle = new Rectangle( viewBounds, {
      stroke: 'grey'
    } );

    // vertices
    const vertexACircle = new Circle( VERTEX_VIEW_RADIUS, {
      center: viewBounds.leftTop
    } );
    const vertexBCircle = new Circle( VERTEX_VIEW_RADIUS, {
      center: viewBounds.rightTop
    } );
    const vertexCCircle = new Circle( VERTEX_VIEW_RADIUS, {
      center: viewBounds.rightBottom
    } );
    const vertexDCircle = new Circle( VERTEX_VIEW_RADIUS, {
      center: viewBounds.leftBottom
    } );
    calibrationRectangle.children = [ vertexACircle, vertexBCircle, vertexCCircle, vertexDCircle ];

    // display of coordinates
    const dimensionLineOptions = { stroke: 'grey' };
    const heightTickLine = new Line( 0, 0, 0, 300, dimensionLineOptions );
    const bottomTickLine = new Line( 0, 0, 10, 0, dimensionLineOptions );
    const topTickLine = new Line( 0, 0, 10, 0, dimensionLineOptions );
    const leftSideLengthText = new Text( 'null', QuadrilateralConstants.SCREEN_TEXT_OPTIONS );
    leftSideLengthText.rotation = -Math.PI / 2;

    bottomTickLine.centerTop = heightTickLine.centerBottom;
    topTickLine.centerBottom = heightTickLine.centerTop;
    heightTickLine.rightCenter = calibrationRectangle.leftCenter.minusXY( 15, 0 );
    leftSideLengthText.rightCenter = heightTickLine.leftCenter;

    heightTickLine.children = [ bottomTickLine, topTickLine, leftSideLengthText ];

    calibrationRectangle.addChild( heightTickLine );

    options.children = [
      calibrateHintText,
      calibrationRectangle
    ];
    super( options );

    // display device value as sides change
    tangibleConnectionModel.physicalModelBoundsProperty.link( physicalModelBounds => {
      if ( physicalModelBounds !== null ) {
        leftSideLengthText.string = Utils.toFixed( physicalModelBounds.height, 2 );
      }
    } );
  }
}

quadrilateral.register( 'QuadrilateralCalibrationContentNode', QuadrilateralCalibrationContentNode );
