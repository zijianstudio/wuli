// Copyright 2013-2023, University of Colorado Boulder

/**
 * Drag listener for an arbitrary point (Vector2).
 * Used exclusively in 'Place the Points' game challenges.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../../dot/js/Range.js';
import Utils from '../../../../../dot/js/Utils.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../../phetcommon/js/view/ModelViewTransform2.js';
import { DragListener, Node } from '../../../../../scenery/js/imports.js';
import graphingLines from '../../../graphingLines.js';
import GLColors from '../../GLColors.js';
import Manipulator from './Manipulator.js';

export default class PointManipulator extends Manipulator {

  private readonly disposePointManipulator: () => void;

  public constructor( radius: number,
                      pointProperty: Property<Vector2>,
                      otherPointProperties: TReadOnlyProperty<Vector2>[], // points that pointProperty cannot be on
                      xRange: Range,
                      yRange: Range,
                      modelViewTransform: ModelViewTransform2 ) {

    super( radius, GLColors.POINT, { haloAlpha: GLColors.HALO_ALPHA.point } );

    // move the manipulator to match the point
    const lineObserver = ( point: Vector2 ) => {
      this.translation = modelViewTransform.modelToViewPosition( point );
    };
    pointProperty.link( lineObserver ); // unlink in dispose

    this.addInputListener( new PointDragListener( this, pointProperty, otherPointProperties, xRange, yRange, modelViewTransform ) );

    this.disposePointManipulator = () => {
      pointProperty.unlink( lineObserver );
    };
  }

  public override dispose(): void {
    this.disposePointManipulator();
    super.dispose();
  }
}

/**
 * Drag listener for an arbitrary point.
 */
class PointDragListener extends DragListener {

  public constructor( targetNode: Node,
                      pointProperty: Property<Vector2>,
                      otherPointProperties: TReadOnlyProperty<Vector2>[],
                      xRange: Range,
                      yRange: Range,
                      modelViewTransform: ModelViewTransform2 ) {

    let startOffset: Vector2; // where the drag started, relative to the slope manipulator, in parent view coordinates

    super( {

      allowTouchSnag: true,

      // note where the drag started
      start: event => {
        const position = modelViewTransform.modelToViewPosition( pointProperty.value );
        startOffset = targetNode.globalToParentPoint( event.pointer.point ).minus( position );
      },

      drag: event => {

        const parentPoint = targetNode.globalToParentPoint( event.pointer.point ).minus( startOffset );
        const position = modelViewTransform.viewToModelPosition( parentPoint );

        // constrain to range, snap to grid
        const x = Utils.roundSymmetric( Utils.clamp( position.x, xRange.min, xRange.max ) );
        const y = Utils.roundSymmetric( Utils.clamp( position.y, yRange.min, yRange.max ) );
        const p = new Vector2( x, y );

        // is this point the same as one of the others?
        let same = false;
        for ( let i = 0; i < otherPointProperties.length; i++ ) {
          if ( p.equals( otherPointProperties[ i ].value ) ) {
            same = true;
            break;
          }
        }

        // if the point is unique, set it
        if ( !same ) {
          pointProperty.value = p;
        }
      }
    } );
  }
}

graphingLines.register( 'PointManipulator', PointManipulator );