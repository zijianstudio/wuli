// Copyright 2023, University of Colorado Boulder

import CAVObjectNode, { CAVObjectNodeOptions } from './CAVObjectNode.js';
import centerAndVariability from '../../centerAndVariability.js';
import SoccerBall from '../model/SoccerBall.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import TProperty from '../../../../axon/js/TProperty.js';
import { DragListener, Image, Node } from '../../../../scenery/js/imports.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import { AnimationMode } from '../model/AnimationMode.js';
import CAVObjectType from '../model/CAVObjectType.js';
import ballDark_png from '../../../images/ballDark_png.js';
import ball_png from '../../../images/ball_png.js';
import Vector2 from '../../../../dot/js/Vector2.js';

export default class SoccerBallNode extends CAVObjectNode {

  public constructor( soccerBall: SoccerBall, isSceneVisibleProperty: TReadOnlyProperty<boolean>, isShowingPlayAreaMedianProperty: TReadOnlyProperty<boolean>,
                      modelViewTransform: ModelViewTransform2, objectNodesInputEnabledProperty: TProperty<boolean>,
                      options: CAVObjectNodeOptions ) {

    const viewRadius = modelViewTransform.modelToViewDeltaX( CAVObjectType.SOCCER_BALL.radius );

    super( soccerBall, isShowingPlayAreaMedianProperty, modelViewTransform, CAVObjectType.SOCCER_BALL.radius, options );

    // The dark soccer ball is used for when a ball has input disabled.
    const soccerBallNode = new Image( ball_png );
    const soccerBallDarkNode = new Image( ballDark_png );
    const soccerBallNodes = new Node( {
      children: [ soccerBallNode, soccerBallDarkNode ],

      // if the child node is non-square, it should still fit within specified dimensions. Note: this does not change the
      // aspect ratio.
      maxWidth: viewRadius * 2,
      maxHeight: viewRadius * 2,

      // Center the nested Node for compatibility with DragListener
      center: Vector2.ZERO
    } );

    // only setup input-related things if dragging is enabled
    const dragListener = new DragListener( {
      tandem: options.tandem.createTandem( 'dragListener' ),
      positionProperty: soccerBall.dragPositionProperty,
      transform: modelViewTransform,
      start: () => {

        // if the user presses an object that's animating, allow it to keep animating up in the stack
        soccerBall.dragStartedEmitter.emit();
      },
      drag: () => {
        soccerBall.animation && soccerBall.animation.stop();
      }
    } );

    // pan and zoom - In order to move the CAVObjectNode to a new position the pointer has to move more than half the
    // unit model length. When the CAVObjectNode is near the edge of the screen while zoomed in, the pointer doesn't
    // have enough space to move that far. If we make sure that bounds surrounding the CAVObjectNode have a width
    // of 2 model units the pointer will always have enough space to drag the CAVObjectNode to a new position.
    // See https://github.com/phetsims/center-and-variability/issues/88
    dragListener.createPanTargetBounds = () => {
      const modelPosition = soccerBall.positionProperty.value;
      const modelBounds = new Bounds2( modelPosition.x - 1, modelPosition.y - 1, modelPosition.x + 1, modelPosition.y + 1 );
      const viewBounds = modelViewTransform.modelToViewBounds( modelBounds );
      return this.parentToGlobalBounds( viewBounds );
    };

    this.addInputListener( dragListener );
    this.touchArea = this.localBounds.dilatedX( 5 );

    // For PhET-iO, allow clients to shut off interactivity via this Property.
    const selfInputEnabledProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'selfInputEnabledProperty' )
    } );

    // Prevent dragging or interaction while the object does not have a value (when it is not in the play area yet),
    // when it is animating, if input for this individual node is disabled, or if input for all of the object nodes
    // ahs been disabled
    Multilink.multilink(
      [ soccerBall.animationModeProperty, soccerBall.valueProperty, selfInputEnabledProperty, objectNodesInputEnabledProperty ],
      ( mode, value, selfInputEnabled, objectsInputEnabled ) => {
        const inputEnabled = value !== null && mode === AnimationMode.NONE && selfInputEnabled && objectsInputEnabled;

        // if input is disabled and the ball is in the play area, show the darker version
        const showDisabledSoccerBall = !inputEnabled && value !== null;
        soccerBallDarkNode.visible = showDisabledSoccerBall;
        soccerBallNode.visible = !showDisabledSoccerBall;

        this.inputEnabled = inputEnabled;
      } );

    this.addChild( soccerBallNodes );

    // Data point should be visible if the soccer ball is active AND if the scene is visible.
    Multilink.multilink( [ soccerBall.isActiveProperty, isSceneVisibleProperty ], ( isActive, isSceneVisible ) => {
      this.visible = isActive && isSceneVisible;
    } );

    // show or hide the median highlight
    Multilink.multilink(
      [ soccerBall.isMedianObjectProperty, isShowingPlayAreaMedianProperty, soccerBall.isShowingAnimationHighlightProperty ],
      ( isMedianObject, isShowingPlayAreaMedian, isShowingAnimationHighlight ) => {
        this.medianHighlight.visible = isShowingPlayAreaMedian && isMedianObject;

        // Median highlights should be in front in z-ordering. Rather than accomplishing this via a different layer,
        // move this to the front when it is visible.
        if ( this.medianHighlight.visible ) {
          this.moveToFront();
        }
      } );
  }
}

centerAndVariability.register( 'SoccerBallNode', SoccerBallNode );