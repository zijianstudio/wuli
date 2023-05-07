// Copyright 2021-2023, University of Colorado Boulder

/**
 * A view component for one of the vertices of the Quadrilateral.
 *
 * @author Jesse Greenberg
 */

import { Circle, DragListener, KeyboardDragListener, Path, SceneryEvent, Text } from '../../../../scenery/js/imports.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import QuadrilateralVertex from '../model/QuadrilateralVertex.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import QuadrilateralModel from '../model/QuadrilateralModel.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import QuadrilateralVertexDescriber from './QuadrilateralVertexDescriber.js';
import { Shape } from '../../../../kite/js/imports.js';
import QuadrilateralConstants from '../../QuadrilateralConstants.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import grabHighPitch_mp3 from '../../../sounds/grabHighPitch_mp3.js';
import boundaryReached_mp3 from '../../../../tambo/sounds/boundaryReached_mp3.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import quadrilateral from '../../quadrilateral.js';
import QuadrilateralMovableNode, { QuadrilateralMovableNodeOptions } from './QuadrilateralMovableNode.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import { VertexLabelToProposedPositionMap } from '../model/QuadrilateralShapeModel.js';

// constants
const LABEL_TEXT_FONT = new PhetFont( { size: 16, weight: 'bold' } );

type SelfOptions = EmptySelfOptions;
type VertexNodeOptions = SelfOptions & StrictOmit<QuadrilateralMovableNodeOptions, 'grabbedSound'>;

// Reusable map that saves proposed vertex positions, to avoid excessive garbage.
const scratchLabelToPositionMap: VertexLabelToProposedPositionMap = new Map();

export default class QuadrilateralVertexNode extends QuadrilateralMovableNode {
  private readonly quadrilateralModel: QuadrilateralModel;
  private readonly vertex: QuadrilateralVertex;

  public constructor( vertex: QuadrilateralVertex, vertexLabel: TReadOnlyProperty<string>, quadrilateralModel: QuadrilateralModel, vertexDescriber: QuadrilateralVertexDescriber, modelViewTransform: ModelViewTransform2, providedOptions?: VertexNodeOptions ) {

    const options = optionize<VertexNodeOptions, SelfOptions, QuadrilateralMovableNodeOptions>()( {
      grabbedSound: grabHighPitch_mp3
    }, providedOptions );

    const viewRadius = modelViewTransform.modelToViewBounds( vertex.modelBoundsProperty.value ).width / 2;
    const circle = new Circle( viewRadius );
    super( vertex, modelViewTransform, circle, options );

    this.vertex = vertex;
    this.quadrilateralModel = quadrilateralModel;

    const vertexLabelText = new Text( vertexLabel, {
      font: LABEL_TEXT_FONT,
      visibleProperty: quadrilateralModel.visibilityModel.vertexLabelsVisibleProperty,

      // i18n
      maxWidth: 12 // by inspection
    } );
    this.addChild( vertexLabelText );

    // Add hatch marks to make it easier to align a vertex with the background grid
    const hatchMarkShape = new Shape();
    let angle = 0;
    while ( angle <= 2 * Math.PI ) {
      hatchMarkShape.moveTo( Math.cos( angle ) * viewRadius * 3 / 4, Math.sin( angle ) * viewRadius * 3 / 4 );
      hatchMarkShape.lineTo( Math.cos( angle ) * viewRadius, Math.sin( angle ) * viewRadius );
      angle += Math.PI / 2;
    }

    const hatchMarkPath = new Path( hatchMarkShape, {
      stroke: 'black',

      // hatch marks are used to align with grid, so they are only visible when grid is visible
      visibleProperty: quadrilateralModel.visibilityModel.gridVisibleProperty
    } );
    this.addChild( hatchMarkPath );

    quadrilateralModel.visibilityModel.gridVisibleProperty.link( visible => {
      hatchMarkPath.visible = visible;
    } );

    // Expand the pointer areas a bit so that it is difficult to accidentally pick up a side when near the vertex edge
    this.touchArea = Shape.circle( viewRadius + QuadrilateralConstants.POINTER_AREA_DILATION );
    this.mouseArea = this.touchArea;

    vertex.positionProperty.link( position => {
      this.center = modelViewTransform.modelToViewPosition( position );
    } );

    // dynamic string layout
    vertexLabelText.boundsProperty.link( () => {
      vertexLabelText.center = circle.center;
    } );

    const keyboardDragListener = new KeyboardDragListener( {
      dragDelta: this.largeViewDragDelta,
      shiftDragDelta: this.smallViewDragDelta,

      transform: modelViewTransform,
      drag: ( modelDelta: Vector2 ) => {
        const proposedPosition = quadrilateralModel.getClosestGridPositionInDirection( vertex.positionProperty.value, modelDelta );

        // constrain to model bounds
        const inBoundsPosition = quadrilateralModel.vertexDragBounds.closestPointTo( proposedPosition );
        const isAgainstBounds = !inBoundsPosition.equals( proposedPosition );

        scratchLabelToPositionMap.clear();
        scratchLabelToPositionMap.set( vertex.vertexLabel, inBoundsPosition );
        const isPositionAllowed = quadrilateralModel.areVertexPositionsAllowed( scratchLabelToPositionMap );
        if ( isPositionAllowed ) {

          // only update and trigger a new Voicing response if the position has changed.
          if ( !vertex.positionProperty.value.equals( inBoundsPosition ) ) {
            vertex.voicingObjectResponseDirty = true;
            vertex.positionProperty.value = inBoundsPosition;
          }
        }

        this.updateBlockedState( !isPositionAllowed, isAgainstBounds );
      },

      moveOnHoldDelay: 750,
      moveOnHoldInterval: 50,

      tandem: providedOptions?.tandem.createTandem( 'keyboardDragListener' )
    } );
    this.addInputListener( keyboardDragListener );

    // Position on drag start, in model coordinate frame.
    let startPosition: Vector2;
    const dragListener = new DragListener( {
      transform: modelViewTransform,
      start: event => {
        const pointerPoint = event.pointer.point;
        const parentPoint = this.globalToParentPoint( pointerPoint );
        startPosition = modelViewTransform.viewToModelPosition( parentPoint );
      },
      drag: ( event: SceneryEvent, listener: DragListener ) => {
        const pointerPoint = event.pointer.point;
        const parentPoint = this.globalToParentPoint( pointerPoint );
        const modelPoint = modelViewTransform.viewToModelPosition( parentPoint );

        // constrain to model bounds
        const inBoundsPosition = quadrilateralModel.vertexDragBounds.closestPointTo( modelPoint );
        const isAgainstBounds = !inBoundsPosition.equals( modelPoint );

        // constrain to the allowable positions in the model along the grid
        // const constrainedPosition = quadrilateralModel.getClosestGridPosition( inBoundsPosition );
        const constrainedPosition = quadrilateralModel.getClosestGridPositionAlongDiagonal( vertex.positionProperty.value, inBoundsPosition );

        scratchLabelToPositionMap.clear();
        scratchLabelToPositionMap.set( vertex.vertexLabel, constrainedPosition );
        const isPositionAllowed = quadrilateralModel.areVertexPositionsAllowed( scratchLabelToPositionMap );

        if ( isPositionAllowed ) {
          vertex.positionProperty.value = constrainedPosition;
        }

        this.updateBlockedState( !isPositionAllowed, isAgainstBounds );
      },
      end: event => {

        // event may be null if interupted or cancelled
        if ( event ) {
          const pointerPoint = event.pointer.point;
          const parentPoint = this.globalToParentPoint( pointerPoint );
          const endPosition = modelViewTransform.viewToModelPosition( parentPoint );

          if ( startPosition.equals( endPosition ) ) {
            this.voicingSpeakFullResponse();
          }
        }
      },

      tandem: providedOptions?.tandem.createTandem( 'dragListener' )
    } );
    this.addInputListener( dragListener );

    // notify when this vertex is pressed
    dragListener.isPressedProperty.link( isPressed => vertex.isPressedProperty.set( isPressed ) );

    // I am not sure if the isPressedProperty should be set here, but it may not be necessary. It should probably be set by the
    // KeyboardDragListener on start/end drag, or the KeyboardDRagListener should
    // have its own isPressedProperty to match the API of the DragListener.
    this.addInputListener( {
      focus: () => {
        vertex.isPressedProperty.value = true;
      },
      blur: () => {
        vertex.isPressedProperty.value = false;
      }
    } );

    // sound - when the QuadrilateralVertex becomes blocked because of collision with model bounds, play a unique sound
    const blockedByBoundsSoundClip = new SoundClip( boundaryReached_mp3, {
      initialOutputLevel: 1.0
    } );
    soundManager.addSoundGenerator( blockedByBoundsSoundClip );
    vertex.numberOfConstrainingEdgesProperty.link( ( constrainingEdges, oldConstrainingEdges ) => {
      if ( oldConstrainingEdges !== null && constrainingEdges > oldConstrainingEdges ) {
        blockedByBoundsSoundClip.play();
        this.voicingSpeakResponse( {
          contextResponse: vertexDescriber.getBlockedByEdgeResponse(),
          utterance: this.blockedUtterance
        } );
      }
    } );

    // voicing
    quadrilateralModel.quadrilateralShapeModel.shapeChangedEmitter.addListener( () => {
      this.voicingObjectResponse = vertexDescriber.getVertexObjectResponse();
    } );

    // when corner guides are visible more information is also included in the object response
    quadrilateralModel.visibilityModel.markersVisibleProperty.link( visible => {
      this.voicingObjectResponse = vertexDescriber.getVertexObjectResponse();
    } );
  }
}

quadrilateral.register( 'QuadrilateralVertexNode', QuadrilateralVertexNode );