// Copyright 2014-2022, University of Colorado Boulder

/**
 * View representation of a cylinder used within the Estimation simulation.
 * The cylinder is defined by a position, size, and color.  Some of these
 * attributes may change.
 */

import { Shape } from '../../../../kite/js/imports.js';
import { Color, LinearGradient, Node, Path } from '../../../../scenery/js/imports.js';
import estimation from '../../estimation.js';
import CylinderModel from '../model/CylinderModel.js';

class CylinderView extends Node {

  /**
   * @param {CylinderModel} cylinderModel
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor( cylinderModel, modelViewTransform ) {
    super();
    const side = new Path( null, { fill: cylinderModel.color, stroke: ( cylinderModel.showOutline ? 'white' : null ) } );
    this.addChild( side );
    const top = new Path( null, { fill: cylinderModel.color, stroke: ( cylinderModel.showOutline ? 'white' : null ) } );
    this.addChild( top );

    const updatePosition = () => {
      const transformedPosition = modelViewTransform.modelToViewPosition( cylinderModel.positionProperty.value );
      // Position is defined as the bottom left in this sim.
      this.left = transformedPosition.x;
      this.bottom = transformedPosition.y;
    };

    const baseColor = cylinderModel.color instanceof Color ? cylinderModel.color : new Color( cylinderModel.color );

    // Hook up the update functions
    cylinderModel.sizeProperty.link( () => {
      const ellipseWidth = modelViewTransform.modelToViewDeltaX( cylinderModel.sizeProperty.value.width );
      const ellipseHeight = -modelViewTransform.modelToViewDeltaY( cylinderModel.sizeProperty.value.width ) * Math.sin( CylinderModel.PERSPECTIVE_TILT );
      const cylinderHeight = -modelViewTransform.modelToViewDeltaY( cylinderModel.sizeProperty.value.height );
      top.setShape( Shape.ellipse( 0, 0, ellipseWidth / 2, ellipseHeight / 2 ) );
      const shape = new Shape();
      shape.moveTo( -ellipseWidth / 2, 0 )
        .lineTo( -ellipseWidth / 2, cylinderHeight )
        .ellipticalArc( 0, 0, ellipseWidth / 2, ellipseHeight / 2, 0, Math.PI, 0, true )
        .lineTo( ellipseWidth / 2, 0 )
        .ellipticalArc( 0, cylinderHeight, ellipseWidth / 2, ellipseHeight / 2, 0, 0, Math.PI, false )
        .close();
      side.setShape( shape );
      side.fill = new LinearGradient( -ellipseWidth / 2, 0, ellipseWidth / 2, 0 ).addColorStop( 0, baseColor.colorUtilsDarker( 0.5 ) ).addColorStop( 0.5, baseColor.colorUtilsBrighter( 0.5 ) ).addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );
      updatePosition();
    } );
    cylinderModel.positionProperty.link( updatePosition );
    cylinderModel.visibleProperty.link( visible => {
      this.visible = visible;
    } );
  }
}

estimation.register( 'CylinderView', CylinderView );

export default CylinderView;