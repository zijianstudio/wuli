// Copyright 2013-2023, University of Colorado Boulder

/**
 * Scenery node for the skater, which is draggable.
 *
 * Converted to composition instead of inheritance for SkaterNode to work around updateSVGFragment problem, see #123
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import { Circle, DragListener, Image, Node } from '../../../../scenery/js/imports.js';
import skater1_set1_left_png from '../../../images/skater1_set1_left_png.js';
import skater1_set1_right_png from '../../../images/skater1_set1_right_png.js';
import energySkatePark from '../../energySkatePark.js';
import Skater from '../model/Skater.js';
import SkaterImages from './SkaterImages.js';

class SkaterNode extends Node {

  /**
   * SkaterNode constructor.
   *
   * @param {Skater} skater
   * @param {EnergySkateParkScreenView} view
   * @param {BooleanProperty} userControlledProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {function(Vector2, Track[]):Object} getClosestTrackAndPositionAndParameter - gets the closest track
   *                                            properties, used when the skater is being dragged close to the track.
   *                                            See EnergySkateParkModel.getClosestTrackAndPositionAndParameter
   * @param {function} getPhysicalTracks - function that returns the physical tracks in the model, so the skater can try
   *                                       to attach to them while dragging
   * @param {Tandem} tandem
   */
  constructor( skater, view, userControlledProperty, modelViewTransform, getClosestTrackAndPositionAndParameter, getPhysicalTracks, tandem ) {
    super( {

      // rendering the skater with canvas makes it move smoothly around the screen edges in iOS Safari, see
      // https://github.com/phetsims/energy-skate-park/issues/42
      renderer: 'canvas',

      // prevent fitted blocks for the Skater to improve performance, see #213
      preventFit: true,
      tandem: tandem
    } );

    // @private {Image} - left and right Images for the skater
    const leftSkaterImageNode = new Image( skater1_set1_left_png, {
      cursor: 'pointer',
      tandem: tandem.createTandem( 'leftSkaterImageNode' )
    } );
    const rightSkaterImageNode = new Image( skater1_set1_right_png, {
      cursor: 'pointer',
      tandem: tandem.createTandem( 'rightSkaterImageNode' )
    } );
    this.children = [ leftSkaterImageNode, rightSkaterImageNode ];

    // Show a red dot in the bottom center as the important particle model coordinate
    const circle = new Circle( 8, { fill: 'red' } );
    this.addChild( circle );

    // @public - One of SkaterImages.SkaterImageSet, with images for left and right motion. Controls the skater
    // character.
    this.skaterImageSetProperty = new Property( SkaterImages.SKATER_CHARACTER_SETS[ 0 ].imageSet1 );

    let imageWidth;
    let imageHeight;

    // @private {Skater}
    this.skater = skater;

    this.skaterImageSetProperty.link( skaterImage => {
      leftSkaterImageNode.image = skaterImage.leftImage;
      rightSkaterImageNode.image = skaterImage.rightImage;

      imageWidth = leftSkaterImageNode.width;
      imageHeight = leftSkaterImageNode.height;

      circle.x = imageWidth / 2;
      circle.y = imageHeight;

      // image dimensions might have changed, update matrix (which horizontally centers the image around the position)
      this.skater.updatedEmitter.emit();
    } );

    skater.directionProperty.link( direction => {
      leftSkaterImageNode.visible = direction === Skater.Direction.LEFT;
      rightSkaterImageNode.visible = direction === Skater.Direction.RIGHT;
    } );


    // @private - Map from mass(kg) to the amount to scale the image
    const centerMassValue = skater.massRange.getCenter();
    const massToScale = new LinearFunction( centerMassValue, skater.massRange.max, 0.46, 0.614 );

    // make the SkaterNode invisible  until the first update so it isn't displayed in the wrong location before
    // the matrix is set on the first update
    this.visible = false;

    // Update the position and angle.  Normally the angle would only change if the position has also changed, so no need
    // for a duplicate callback there.
    this.skater.updatedEmitter.addListener( () => {

      // update visibility on first model update
      if ( !this.visible ) {
        this.visible = true;
      }

      const mass = skater.massProperty.value;
      const position = skater.positionProperty.value;
      const angle = skater.angleProperty.value;

      const view = modelViewTransform.modelToViewPosition( position );

      // Translate to the desired position
      const matrix = Matrix3.translation( view.x, view.y );

      // Rotate about the pivot (bottom center of the skater)
      const rotationMatrix = Matrix3.rotation2( angle );
      matrix.multiplyMatrix( rotationMatrix );
      rotationMatrix.freeToPool();

      const scale = massToScale.evaluate( mass );
      const scalingMatrix = Matrix3.scaling( scale );
      matrix.multiplyMatrix( scalingMatrix );
      scalingMatrix.freeToPool();

      // Inverting the scale of the red circle so it always stays the same size
      circle.setRadius( 3.5 / scale );

      // Think of it as a multiplying the Vector2 to the right, so this step happens first actually.  Use it to center
      // the registration point
      const translation = Matrix3.translation( -imageWidth / 2, -imageHeight );
      matrix.multiplyMatrix( translation );
      translation.freeToPool();

      this.setMatrix( matrix );

    } );

    let targetTrack = null;

    let targetU = null;

    const dragSkater = event => {
      const globalPoint = this.globalToParentPoint( event.pointer.point );
      let position = modelViewTransform.viewToModelPosition( globalPoint );

      // make sure it is within the visible bounds
      position = view.availableModelBounds.getClosestPoint( position.x, position.y, position );

      // PERFORMANCE/ALLOCATION: lots of unnecessary allocations and computation here, biggest improvement could be
      // to use binary search for position on the track
      const closestTrackAndPositionAndParameter = getClosestTrackAndPositionAndParameter( position, getPhysicalTracks() );
      let closeEnough = false;
      if ( closestTrackAndPositionAndParameter && closestTrackAndPositionAndParameter.track && closestTrackAndPositionAndParameter.track.isParameterInBounds( closestTrackAndPositionAndParameter.parametricPosition ) ) {
        const closestPoint = closestTrackAndPositionAndParameter.point;
        const distance = closestPoint.distance( position );
        if ( distance < 0.5 ) {
          position = closestPoint;
          targetTrack = closestTrackAndPositionAndParameter.track;
          targetU = closestTrackAndPositionAndParameter.parametricPosition;

          // Choose the right side of the track, i.e. the side of the track that would have the skater upside up
          const normal = targetTrack.getUnitNormalVector( targetU );
          skater.onTopSideOfTrackProperty.value = normal.y > 0;

          skater.angleProperty.value = targetTrack.getViewAngleAt( targetU ) + ( skater.onTopSideOfTrackProperty.value ? 0 : Math.PI );

          closeEnough = true;
        }
      }
      if ( !closeEnough ) {
        targetTrack = null;
        targetU = null;

        // make skater upright if not near the track
        skater.angleProperty.value = 0;
        skater.onTopSideOfTrackProperty.value = true;

        skater.positionProperty.value = position;
      }

      else {
        skater.positionProperty.value = targetTrack.getPoint( targetU );
      }

      skater.updateEnergy();
      skater.updatedEmitter.emit();
    };

    // @private - for interruption, see interruptDrag
    this.dragHandler = new DragListener( {
      tandem: tandem.createTandem( 'dragListener' ),
      start: event => {
        userControlledProperty.set( true );
        skater.draggingProperty.value = true;

        // Clear thermal energy whenever skater is grabbed, see #32
        skater.thermalEnergyProperty.value = 0;

        // Jump to the input position when dragged
        dragSkater( event );
      },

      drag: dragSkater,

      end: () => {

        // Record the state of the skater for "return skater"
        skater.released( targetTrack, targetU );

        userControlledProperty.set( false );
      }
    } );
    this.addInputListener( this.dragHandler );
  }

  /**
   * If dragging, interrupt and release the Skater.
   * @public
   */
  interruptDrag() {
    if ( this.dragHandler.isPressed ) {
      this.dragHandler.interrupt();
    }
  }
}

energySkatePark.register( 'SkaterNode', SkaterNode );
export default SkaterNode;