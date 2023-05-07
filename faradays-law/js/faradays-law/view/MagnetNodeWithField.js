// Copyright 2014-2022, University of Colorado Boulder

/**
 * Magnet Node with field lines, draggable.
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import GrabDragInteraction from '../../../../scenery-phet/js/accessibility/GrabDragInteraction.js';
import { animatedPanZoomSingleton, DragListener, FocusHighlightFromNode, InteractiveHighlightingNode, KeyboardUtils, Node } from '../../../../scenery/js/imports.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import grabMagnet_mp3 from '../../../sounds/grabMagnet_mp3.js';
import releaseMagnet_mp3 from '../../../sounds/releaseMagnet_mp3.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawStrings from '../../FaradaysLawStrings.js';
import FaradaysLawAlertManager from './FaradaysLawAlertManager.js';
import FaradaysLawKeyboardDragListener from './FaradaysLawKeyboardDragListener.js';
import JumpMagnitudeArrowNode from './JumpMagnitudeArrowNode.js';
import MagnetAutoSlideKeyboardListener from './MagnetAutoSlideKeyboardListener.js';
import MagnetDescriber from './MagnetDescriber.js';
import MagnetDescriptionNode from './MagnetDescriptionNode.js';
import MagnetFieldLines from './MagnetFieldLines.js';
import MagnetMovementArrowsNode from './MagnetMovementArrowsNode.js';
import MagnetNode from './MagnetNode.js';
import MagnetRegionManager from './MagnetRegionManager.js';

// constants
const barMagnetString = FaradaysLawStrings.a11y.barMagnet;
const GRAB_RELEASE_SOUND_LEVEL = 0.2; // empirically determined

/**
 * @param {FaradaysLawModel} model
 * @param {Tandem} tandem
 * @constructor
 */
class MagnetNodeWithField extends Node {

  /**
   * @param {FaradaysLawModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super();

    const self = this;

    // magnet
    this.magnetNode = createMagnetNode( model.magnet );

    // field lines
    this.addChild( new MagnetFieldLines( model.magnet, tandem.createTandem( 'fieldLinesNode' ) ) );

    // pdom
    // create the focus highlight to pass as an option
    const draggableNodeFocusHighlight = new FocusHighlightFromNode( this.magnetNode ); // overridden once the draggableNode is fully constructed

    // the draggable container for the magnet and arrows
    const draggableNode = new InteractiveHighlightingNode( {
      cursor: 'pointer',

      // The parent (MagnetNodeWithField) isn't instrumented, and this is the interactive node, so instrument this as
      // the "parent" magnet instances, see https://github.com/phetsims/faradays-law/issues/116.
      // NOTE: this assumes that tandem is not passed into a mutate or Node.call() in the MagnetNodeWithField type.
      tandem: tandem,
      phetioDocumentation: 'The draggable container for the magnet and arrows',

      // pdom
      tagName: 'div',
      ariaRole: 'application',
      focusable: true,
      innerContent: barMagnetString,
      focusHighlightLayerable: true,
      focusHighlight: draggableNodeFocusHighlight
    } );

    this.addChild( draggableNode );
    this.addChild( draggableNodeFocusHighlight );

    // add the magnet to the draggable node
    draggableNode.addChild( this.magnetNode );

    // add the hint that will provide a clue to the user about how the magnet can be moved
    this.addChild( new MagnetMovementArrowsNode(
      new Dimension2( this.magnetNode.width, this.magnetNode.height ), {
        visibleProperty: model.magnetArrowsVisibleProperty
      }
    ) );

    // magnet slide target - a node to indicate the future position when sliding the magnet
    this.magnetSlideTargetNode = createMagnetNode( model.magnet );
    this.addChild( this.magnetSlideTargetNode );
    this.magnetSlideTargetNode.opacity = 0.5;
    this.magnetSlideTargetNode.visible = false;

    // pdom descriptions - generates text content and alerts for magnet interactions
    const regionManager = new MagnetRegionManager( model );
    const describer = new MagnetDescriber( model, regionManager, tandem );
    const alertManager = new FaradaysLawAlertManager( this, describer );

    // sound generation
    const grabMagnetSoundPlayer = new SoundClip( grabMagnet_mp3, {
      initialOutputLevel: GRAB_RELEASE_SOUND_LEVEL
    } );
    soundManager.addSoundGenerator( grabMagnetSoundPlayer );
    const releaseMagnetSoundPlayer = new SoundClip( releaseMagnet_mp3, {
      initialOutputLevel: GRAB_RELEASE_SOUND_LEVEL
    } );
    soundManager.addSoundGenerator( releaseMagnetSoundPlayer );

    // handler
    let magnetOffset = null; // {Vector2|null}
    const dragListener = new DragListener( {

      tandem: tandem.createTandem( 'dragListener' ),
      phetioDocumentation: 'Emits events when dragged by the user',

      // When dragging across it in a mobile device, pick it up
      allowTouchSnag: true,

      start( event ) {
        model.magnet.isDraggingProperty.set( true );
        magnetOffset = self.globalToParentPoint( event.pointer.point ).minus( self.translation );
      },

      // Translate on drag events
      drag( event ) {
        model.magnetArrowsVisibleProperty.set( false );
        const parentPoint = self.globalToParentPoint( event.pointer.point );
        const desiredPosition = parentPoint.minus( magnetOffset );
        model.moveMagnetToPosition( desiredPosition );
      },

      end() {
        model.magnet.isDraggingProperty.set( false );
        alertManager.movementEndAlert();
      }
    } );
    draggableNode.addInputListener( dragListener );

    model.magnet.positionProperty.linkAttribute( this, 'translation' );

    // @private - drag handler for keyboard navigation
    const keyboardDragListener = new FaradaysLawKeyboardDragListener( model, regionManager, alertManager, {
      tandem: tandem.createTandem( 'keyboardDragListener' )
    } );

    // arrows displayed before initiating the sliding/jumping movement
    const leftJumpArrows = new JumpMagnitudeArrowNode( 'left' );
    const rightJumpArrows = new JumpMagnitudeArrowNode( 'right' );
    leftJumpArrows.setKeyPositions( this.magnetNode.bounds );
    rightJumpArrows.setKeyPositions( this.magnetNode.bounds );
    this.addChild( leftJumpArrows );
    this.addChild( rightJumpArrows );

    // handler for jump/slide interactions
    const magnetJumpKeyboardListener = new MagnetAutoSlideKeyboardListener( model, {
      onKeyDown( event ) {
        const domEvent = event.domEvent;

        // event.code is the unique value of the key pressed
        // we want to ensure that we're only listening for the 1,2, and 3 keys
        if ( KeyboardUtils.isAnyKeyEvent( domEvent, [ KeyboardUtils.KEY_1, KeyboardUtils.KEY_2, KeyboardUtils.KEY_3 ] ) &&
             !isKeyModified( domEvent ) ) {

          self.magnetSlideTargetNode.visible = true;
          model.magnetArrowsVisibleProperty.set( false );

          const magnitude = KeyboardUtils.getNumberFromCode( domEvent );
          assert && assert( typeof magnitude === 'number', 'should be a number' );

          if ( model.magnet.positionProperty.get().x < magnetJumpKeyboardListener.slideTargetPositionProperty.value.x ) {
            rightJumpArrows.showCue( magnitude );
          }
          else {
            leftJumpArrows.showCue( magnitude );
          }
        }

        if ( magnetJumpKeyboardListener.isAnimatingProperty.get() ) {
          regionManager.stopMagnetAnimationWithKeyboard();
        }
      },
      onKeyUp( event ) {
        if ( KeyboardUtils.isNumberKey( event.domEvent ) ) {
          self.magnetSlideTargetNode.visible = false;
        }
        rightJumpArrows.hideCue();
        leftJumpArrows.hideCue();
      }
    } );

    // flag that tracks whether the magnet has been dragged since initial load or since a reset
    let magnetDragged = false;
    model.magnet.positionProperty.lazyLink( () => {
      if ( !model.resetInProgressProperty.value ) {
        magnetDragged = true;
      }
    } );

    // listener to watch for when this node gets focus through the keyboard nav system
    const focusListener = {
      focus: () => {

        // Turn off the movement hint when this item gets focus.
        model.magnetArrowsVisibleProperty.set( false );
      }
    };

    // Set up keyboard grab/drag interaction.  Note that, while GrabDragInteraction supports management of the drag cue,
    // this capability is not used here, and the drag cue is managed elsewhere.  That's because the drag cue (the four
    // arrows) needed to be visible at times that were not entirely under the control of GrabDragInteraction.
    const grabDragInteraction = new GrabDragInteraction( draggableNode, keyboardDragListener, {
      objectToGrabString: barMagnetString,
      listenersForDragState: [ magnetJumpKeyboardListener ],
      listenersForGrabState: [ focusListener ],
      grabCueOptions: {

        // position the grab cue directly above the magnet and centered
        centerX: 0,
        bottom: -this.magnetNode.height * 0.7
      },
      onGrab: () => {
        if ( !magnetDragged ) {
          model.magnetArrowsVisibleProperty.set( true );
        }
        grabMagnetSoundPlayer.play();
      },
      onRelease: () => {
        self.magnetSlideTargetNode.visible = false;
        rightJumpArrows.hideCue();
        leftJumpArrows.hideCue();
        magnetJumpKeyboardListener.released();
        releaseMagnetSoundPlayer.play();
      },
      tandem: tandem.createTandem( 'grabDragInteraction' )
    } );

    // listener to position the target node
    const setSlideTargetNodeCenter = position => {
      this.magnetSlideTargetNode.center = this.parentToLocalPoint( position );
    };

    // observers
    model.magnet.orientationProperty.link( () => {
      this.magnetNode.detach();
      this.magnetNode = createMagnetNode( model.magnet );
      draggableNode.addChild( this.magnetNode );

      // ensure poles on the slide target magnet match that of the original
      this.magnetSlideTargetNode.detach();
      this.magnetSlideTargetNode = createMagnetNode( model.magnet );
      this.addChild( this.magnetSlideTargetNode );
      this.magnetSlideTargetNode.opacity = 0.5;
      this.magnetSlideTargetNode.visible = false;
      setSlideTargetNodeCenter( magnetJumpKeyboardListener.slideTargetPositionProperty.get() );
    } );

    magnetJumpKeyboardListener.slideTargetPositionProperty.link( setSlideTargetNodeCenter );

    const pdomNode = new MagnetDescriptionNode( model, describer );
    this.addChild( pdomNode );

    model.magnet.orientationProperty.lazyLink( orientation => {
      alertManager.flipMagnetAlert( orientation );
    } );

    // @a11y
    magnetJumpKeyboardListener.isAnimatingProperty.link( isAnimating => {
      regionManager.setMagnetIsAnimating( isAnimating );
    } );

    // while the magnet is being moved from the MagnetAutoSlideKeyboardListener,
    // make sure that it remains within the displayed bounds with the pan and zoom
    // feature
    model.magnet.positionProperty.link( position => {
      if ( magnetJumpKeyboardListener.isAnimatingProperty.get() ) {
        animatedPanZoomSingleton.listener.panToNode( draggableNode );
      }
    } );

    this.regionManager = regionManager;

    // monitor the model for a reset, perform any local resetting that is necessary
    model.resetInProgressProperty.lazyLink( resetInProgress => {
      if ( resetInProgress ) {
        magnetDragged = false;
        grabDragInteraction.reset();
      }
    } );
  }
}

/**
 * Creates the magnet node
 * @param {Magnet} magnet
 * @returns {MagnetNode}
 */
const createMagnetNode = magnet => {
  return new MagnetNode( magnet.orientationProperty.get(), {
    width: magnet.width,
    height: magnet.height,
    showArrows: true
  } );
};

/**
 * Helper function to check a DOM event for whether the key is modified.  This does not check for all modifier keys,
 * just the ones that we care about for magnet node manipulation.
 * @returns {boolean}
 */
const isKeyModified = domEvent => {
  return domEvent.getModifierState( 'Control' ) || domEvent.getModifierState( 'Alt' );
};

faradaysLaw.register( 'MagnetNodeWithField', MagnetNodeWithField );
export default MagnetNodeWithField;