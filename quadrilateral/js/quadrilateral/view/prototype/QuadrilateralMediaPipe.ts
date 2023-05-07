// Copyright 2022-2023, University of Colorado Boulder

/**
 * A prototype application of MediaPipe in quadrilateral. See https://github.com/phetsims/tangible.
 *
 * We might share this on the accessibility prototypes page, but this will not be a production feature.
 *
 * This feature uses camera input to control the quadrilateral shape by moving your fingers.
 * - QuadrilateralVertex A is controlled by left index finger.
 * - QuadrilateralVertex B is controlled by right index finger.
 * - QuadrilateralVertex C is controlled by right thumb.
 * - QuadrilateralVertex D is controlled by left thumb.
 *
 * Hold these fingers up in front of the camera to form a square like shape (pinching gesture), then move them around
 * to change the quadrilateral shape in the simulation.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../../../quadrilateral.js';
import MediaPipe, { HandLandmarks } from '../../../../../tangible/js/mediaPipe/MediaPipe.js';
import QuadrilateralModel from '../../model/QuadrilateralModel.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import QuadrilateralShapeModel, { VertexLabelToProposedPositionMap } from '../../model/QuadrilateralShapeModel.js';
import MediaPipeQueryParameters from '../../../../../tangible/js/mediaPipe/MediaPipeQueryParameters.js';
import QuadrilateralTangibleController from './QuadrilateralTangibleController.js';
import QuadrilateralVertexLabel from '../../model/QuadrilateralVertexLabel.js';

// aspect ratio of the video stream to map camera coordinates to sim model coordinates
const streamDimension2 = MediaPipe.videoStreamDimension2;
const MEDIA_PIPE_ASPECT_RATIO = streamDimension2.width / streamDimension2.height;

// Indices of the thumb and index finger from HandLandmarks of MediaPipe, according to that project
// https://google.github.io/mediapipe/solutions/hands.html#hand-landmark-model
const THUMB_TIP_INDEX = 4;
const INDEX_TIP_INDEX = 8;

type ThumbAndIndexPositions = {
  thumbPosition: Vector2;
  indexPosition: Vector2;
};

if ( MediaPipeQueryParameters.cameraInput === 'hands' ) {
  MediaPipe.initialize();
}

// A reusable map that has proposed vertex positions, to avoid lots of garbage.
const labelToProposedPositionMap: VertexLabelToProposedPositionMap = new Map();

export default class QuadrilateralMediaPipe extends MediaPipe {
  private readonly quadrilateralShapeModel: QuadrilateralShapeModel;
  private readonly tangibleController: QuadrilateralTangibleController;

  public constructor( model: QuadrilateralModel, tangibleController: QuadrilateralTangibleController ) {
    assert && assert( MediaPipeQueryParameters.cameraInput === 'hands', 'MediaPipe can only be used when requested.' );
    super();
    this.quadrilateralShapeModel = model.quadrilateralShapeModel;
    this.tangibleController = tangibleController;

    // So that there is a mapping from tangible space to simulation model space
    model.tangibleConnectionModel.setPhysicalToVirtualTransform( MEDIA_PIPE_ASPECT_RATIO, 1 );

    // effectively connected to a device with this prototype
    model.tangibleConnectionModel.connectedToDeviceProperty.value = true;
  }

  /**
   * In the animation frame, get the most recent results from camera input. Use that data to update QuadrilateralVertex positions
   * in the simulation.
   */
  public step( dt: number ): void {
    const results = MediaPipe.resultsProperty.value;

    // no work if no hands detected
    if ( results ) {
      const landmarks = results.multiHandLandmarks;

      // checking for two hands to form the quadrilateral with index/thumb fingers
      if ( landmarks.length === 2 ) {

        // get the thumb and index positions from each hand
        const firstHandPositions = this.getThumbAndIndexPositions( landmarks[ 0 ] );
        const secondHandPositions = this.getThumbAndIndexPositions( landmarks[ 1 ] );

        // sort to determine which one is left/right
        const sortedPositions = this.sortHandedness( [ firstHandPositions, secondHandPositions ] );
        const leftHandPositions = sortedPositions[ 0 ];
        const rightHandPositions = sortedPositions[ 1 ];

        // package and attempt to update shape
        labelToProposedPositionMap.set( QuadrilateralVertexLabel.VERTEX_A, leftHandPositions.indexPosition );
        labelToProposedPositionMap.set( QuadrilateralVertexLabel.VERTEX_B, rightHandPositions.indexPosition );
        labelToProposedPositionMap.set( QuadrilateralVertexLabel.VERTEX_C, rightHandPositions.thumbPosition );
        labelToProposedPositionMap.set( QuadrilateralVertexLabel.VERTEX_D, leftHandPositions.thumbPosition );

        this.tangibleController.setPositionsFromAbsolutePositionData( labelToProposedPositionMap );
      }
    }
  }

  /**
   * Returns the position of the thumb and index position in the camera view, provided the data of a HandLandmarks.
   */
  private getThumbAndIndexPositions( handLandmarks: HandLandmarks ): ThumbAndIndexPositions {
    const thumbHandPoint = handLandmarks[ THUMB_TIP_INDEX ];
    const indexHandPoint = handLandmarks[ INDEX_TIP_INDEX ];

    return {
      thumbPosition: new Vector2( ( 1 - thumbHandPoint.x ) * MEDIA_PIPE_ASPECT_RATIO, ( 1 - thumbHandPoint.y ) ),
      indexPosition: new Vector2( ( 1 - indexHandPoint.x ) * MEDIA_PIPE_ASPECT_RATIO, ( 1 - indexHandPoint.y ) )
    };
  }

  /**
   * Sorts the ThumbAndIndexPositions to determine which set is the right hand vs left hand.
   */
  private sortHandedness( handPositions: ThumbAndIndexPositions[] ): ThumbAndIndexPositions[] {
    assert && assert( handPositions.length === 2, 'must have 2 thumbs' );
    return handPositions[ 0 ].thumbPosition.x <= handPositions[ 1 ].thumbPosition.x ? handPositions : handPositions.reverse();
  }
}

quadrilateral.register( 'QuadrilateralMediaPipe', QuadrilateralMediaPipe );
