// Copyright 2013-2021, University of Colorado Boulder

/**
 * Node that represents a set of position markers that collectively enumerate
 * the various snap-to positions on the plank.
 */

import { Node } from '../../../../scenery/js/imports.js';
import balancingAct from '../../balancingAct.js';
import Plank from '../model/Plank.js';
import PositionMarkerNode from './PositionMarkerNode.js';

class PositionMarkerSetNode extends Node {

  /**
   * @param {Plank} plank
   * @param {ModelViewTransform2} modelViewTransform
   * @param {BooleanProperty} visibleProperty
   */
  constructor( plank, modelViewTransform, visibleProperty ) {
    super();

    // Add the individual position markers.
    const numTickMarks = Plank.LENGTH / Plank.INTER_SNAP_TO_MARKER_DISTANCE - 1;
    const interMarkerDistance = modelViewTransform.modelToViewDeltaX( Plank.INTER_SNAP_TO_MARKER_DISTANCE );
    for ( let i = 0; i < numTickMarks; i++ ) {
      const label = Math.abs( i - Math.floor( numTickMarks / 2 ) );
      if ( label !== 0 ) {
        this.addChild( new PositionMarkerNode( label, { centerX: i * interMarkerDistance } ) );
      }
    }

    // Observe visibility.
    visibleProperty.link( visible => {
      this.visible = visible;
    } );

    // Set initial position.
    const topCenter = modelViewTransform.modelToViewPosition( plank.bottomCenterPositionProperty.get() );
    this.top = topCenter.y;
    this.centerX = topCenter.x;

    // Rotate with the plank.
    let rotationAngle = 0;
    const rotationPoint = modelViewTransform.modelToViewPosition( plank.pivotPoint );
    plank.tiltAngleProperty.link( angle => {
      const deltaAngle = rotationAngle - angle;
      rotationAngle = angle;
      this.rotateAround( rotationPoint, deltaAngle );
    } );
  }
}

balancingAct.register( 'PositionMarkerSetNode', PositionMarkerSetNode );

export default PositionMarkerSetNode;
