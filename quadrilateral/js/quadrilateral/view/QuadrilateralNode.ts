// Copyright 2021-2023, University of Colorado Boulder

/**
 * The view component for the quadrilateral shape, including labels and markers.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import { KeyboardListener, Node, NodeOptions, TPaint, Voicing, VoicingOptions } from '../../../../scenery/js/imports.js';
import quadrilateral from '../../quadrilateral.js';
import QuadrilateralStrings from '../../QuadrilateralStrings.js';
import QuadrilateralSideNode from './QuadrilateralSideNode.js';
import QuadrilateralVertexNode from './QuadrilateralVertexNode.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import QuadrilateralShapeModel from '../model/QuadrilateralShapeModel.js';
import QuadrilateralModel from '../model/QuadrilateralModel.js';
import CornerGuideNode from './CornerGuideNode.js';
import QuadrilateralColors from '../../QuadrilateralColors.js';
import RightAngleIndicatorNode from './RightAngleIndicatorNode.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import QuadrilateralDescriber from './QuadrilateralDescriber.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Multilink from '../../../../axon/js/Multilink.js';

// constants
const cornerAStringProperty = QuadrilateralStrings.a11y.cornerAStringProperty;
const cornerBStringProperty = QuadrilateralStrings.a11y.cornerBStringProperty;
const cornerCStringProperty = QuadrilateralStrings.a11y.cornerCStringProperty;
const cornerDStringProperty = QuadrilateralStrings.a11y.cornerDStringProperty;
const sideABStringProperty = QuadrilateralStrings.a11y.sideABStringProperty;
const sideBCStringProperty = QuadrilateralStrings.a11y.sideBCStringProperty;
const sideCDStringProperty = QuadrilateralStrings.a11y.sideCDStringProperty;
const sideDAStringProperty = QuadrilateralStrings.a11y.sideDAStringProperty;
const vertexAStringProperty = QuadrilateralStrings.vertexAStringProperty;
const vertexBStringProperty = QuadrilateralStrings.vertexBStringProperty;
const vertexCStringProperty = QuadrilateralStrings.vertexCStringProperty;
const vertexDStringProperty = QuadrilateralStrings.vertexDStringProperty;

// in seconds,
const SHAPE_FILL_TIME = 0.35;

type SelfOptions = EmptySelfOptions;
type ParentOptions = NodeOptions & VoicingOptions;
type QuadrilateralNodeOptions = SelfOptions & StrictOmit<ParentOptions, 'interactiveHighlight'> & PickRequired<ParentOptions, 'tandem'>;

export default class QuadrilateralNode extends Voicing( Node ) {
  private readonly model: QuadrilateralModel;
  private readonly quadrilateralShapeModel: QuadrilateralShapeModel;
  private readonly scratchShapeModel: QuadrilateralShapeModel;
  private readonly modelViewTransform: ModelViewTransform2;

  private readonly vertexNodes: readonly QuadrilateralVertexNode[];
  private readonly sideNodes: readonly QuadrilateralSideNode[];

  private remainingTimeForShapeChangeFill: number;
  private activeFill: TPaint | null;

  public constructor( quadrilateralModel: QuadrilateralModel, modelViewTransform: ModelViewTransform2, layoutBounds: Bounds2, quadrilateralDescriber: QuadrilateralDescriber, providedOptions: QuadrilateralNodeOptions ) {

    const options = optionize<QuadrilateralNodeOptions, SelfOptions, ParentOptions>()( {

      // This Node is composed with Voicing so that we can call the voicingSpeak* functions through it. But we do not
      // want it to use the default InteractiveHighlight, QuadrilateralVertexNode/QuadrilateralSideNode are independently interactive.
      interactiveHighlight: 'invisible',

      // To stop parts of the UI from jostling around as this Node moves, see
      // https://github.com/phetsims/quadrilateral/issues/432
      preventFit: true
    }, providedOptions );

    super( options );

    this.remainingTimeForShapeChangeFill = 0;
    this.activeFill = null;

    this.model = quadrilateralModel;
    this.quadrilateralShapeModel = this.model.quadrilateralShapeModel;
    this.scratchShapeModel = this.model.quadrilateralTestShapeModel;
    this.modelViewTransform = modelViewTransform;

    // for readability
    const vertexA = this.quadrilateralShapeModel.vertexA;
    const vertexB = this.quadrilateralShapeModel.vertexB;
    const vertexC = this.quadrilateralShapeModel.vertexC;
    const vertexD = this.quadrilateralShapeModel.vertexD;

    const vertexANode = new QuadrilateralVertexNode( vertexA, vertexAStringProperty, quadrilateralModel, quadrilateralDescriber.vertexADescriber, modelViewTransform, {
      nameResponse: cornerAStringProperty,

      // Other vertices do not have a name response to reduce verbosity.
      voicingHintResponse: QuadrilateralStrings.a11y.voicing.vertexHintResponseStringProperty,

      // phet-io
      tandem: providedOptions.tandem.createTandem( 'vertexANode' )
    } );

    const vertexBNode = new QuadrilateralVertexNode( vertexB, vertexBStringProperty, quadrilateralModel, quadrilateralDescriber.vertexBDescriber, modelViewTransform, {
      nameResponse: cornerBStringProperty,

      // phet-io
      tandem: providedOptions.tandem.createTandem( 'vertexBNode' )
    } );

    const vertexCNode = new QuadrilateralVertexNode( vertexC, vertexCStringProperty, quadrilateralModel, quadrilateralDescriber.vertexCDescriber, modelViewTransform, {
      nameResponse: cornerCStringProperty,

      // phet-io
      tandem: providedOptions.tandem.createTandem( 'vertexCNode' )
    } );

    const vertexDNode = new QuadrilateralVertexNode( vertexD, vertexDStringProperty, quadrilateralModel, quadrilateralDescriber.vertexDDescriber, modelViewTransform, {
      nameResponse: cornerDStringProperty,

      // phet-io
      tandem: providedOptions.tandem.createTandem( 'vertexDNode' )
    } );

    const sideABNode = new QuadrilateralSideNode( quadrilateralModel, this.model.quadrilateralShapeModel.sideAB, this.model.quadrilateralTestShapeModel.sideAB, quadrilateralDescriber.sideABDescriber, modelViewTransform, {
      nameResponse: sideABStringProperty,

      // Other sides do not have a hint response to reduce verbosity
      voicingHintResponse: QuadrilateralStrings.a11y.voicing.sideHintResponseStringProperty,
      tandem: providedOptions.tandem.createTandem( 'sideABNode' )
    } );
    const sideBCNode = new QuadrilateralSideNode( quadrilateralModel, this.model.quadrilateralShapeModel.sideBC, this.model.quadrilateralTestShapeModel.sideBC, quadrilateralDescriber.sideBCDescriber, modelViewTransform, {
      nameResponse: sideBCStringProperty,
      tandem: providedOptions.tandem.createTandem( 'sideBCNode' )
    } );
    const sideCDNode = new QuadrilateralSideNode( quadrilateralModel, this.model.quadrilateralShapeModel.sideCD, this.model.quadrilateralTestShapeModel.sideCD, quadrilateralDescriber.sideCDDescriber, modelViewTransform, {
      nameResponse: sideCDStringProperty,
      tandem: providedOptions.tandem.createTandem( 'sideCDNode' )
    } );
    const sideDANode = new QuadrilateralSideNode( quadrilateralModel, this.model.quadrilateralShapeModel.sideDA, this.model.quadrilateralTestShapeModel.sideDA, quadrilateralDescriber.sideDADescriber, modelViewTransform, {
      nameResponse: sideDAStringProperty,
      tandem: providedOptions.tandem.createTandem( 'sideDANode' )
    } );

    // angle guides
    const markersVisibleProperty = this.model.visibilityModel.markersVisibleProperty;
    const vertexACornerGuideNode = new CornerGuideNode( vertexA, vertexB, markersVisibleProperty, this.model.quadrilateralShapeModel, modelViewTransform );
    const vertexBCornerGuideNode = new CornerGuideNode( vertexB, vertexC, markersVisibleProperty, this.model.quadrilateralShapeModel, modelViewTransform );
    const vertexCCornerGuideNode = new CornerGuideNode( vertexC, vertexD, markersVisibleProperty, this.model.quadrilateralShapeModel, modelViewTransform );
    const vertexDCornerGuideNode = new CornerGuideNode( vertexD, vertexA, markersVisibleProperty, this.model.quadrilateralShapeModel, modelViewTransform );

    // right angle indicators, visible when a vertex has a right angle
    const vertexARightAngleIndicator = new RightAngleIndicatorNode( vertexA, vertexB, vertexD, markersVisibleProperty, this.model.quadrilateralShapeModel, modelViewTransform );
    const vertexBRightAngleIndicator = new RightAngleIndicatorNode( vertexB, vertexC, vertexA, markersVisibleProperty, this.model.quadrilateralShapeModel, modelViewTransform );
    const vertexCRightAngleIndicator = new RightAngleIndicatorNode( vertexC, vertexD, vertexB, markersVisibleProperty, this.model.quadrilateralShapeModel, modelViewTransform );
    const vertexDRightAngleIndicator = new RightAngleIndicatorNode( vertexD, vertexA, vertexC, markersVisibleProperty, this.model.quadrilateralShapeModel, modelViewTransform );

    //---------------------------------------------------------------------------------------------------------------
    // rendering order
    //---------------------------------------------------------------------------------------------------------------
    this.addChild( sideABNode );
    this.addChild( sideBCNode );
    this.addChild( sideCDNode );
    this.addChild( sideDANode );

    // guide nodes should not be occluded by sides
    this.addChild( vertexACornerGuideNode );
    this.addChild( vertexBCornerGuideNode );
    this.addChild( vertexCCornerGuideNode );
    this.addChild( vertexDCornerGuideNode );

    // angle indicators should not be occluded by sides
    this.addChild( vertexARightAngleIndicator );
    this.addChild( vertexBRightAngleIndicator );
    this.addChild( vertexCRightAngleIndicator );
    this.addChild( vertexDRightAngleIndicator );

    this.addChild( vertexANode );
    this.addChild( vertexBNode );
    this.addChild( vertexCNode );
    this.addChild( vertexDNode );

    //---------------------------------------------------------------------------------------------------------------
    // input listeners
    //---------------------------------------------------------------------------------------------------------------

    // When the shift key is down, Vertices snap to finer intervals
    this.addInputListener( new KeyboardListener( {

      // TODO: Should only have to supply 'shift' instead of both - See https://github.com/phetsims/scenery/issues/1520
      keys: [ 'shiftLeft', 'shiftRight' ],

      // Need to allow other keys to be down to fire this listener or else it does not release on shift + tab
      // when shift is released before the tab key. Would be ideal if KeyboardListener supported this better.
      // See https://github.com/phetsims/quadrilateral/issues/388
      allowOtherKeys: true,

      listenerFireTrigger: 'both',
      callback: ( event, listener ) => {
        this.model.minorIntervalsFromGlobalKeyProperty.value = listener.keysDown;
      },
      cancel: listener => {

        // not locking until next press
        this.model.minorIntervalsFromGlobalKeyProperty.value = false;
      },
      global: true
    } ) );

    // Global key listeners
    this.addInputListener( new KeyboardListener( {
      keys: [ 'alt+shift+r', 'alt+c' ],
      global: true,
      callback: ( event, listener ) => {
        const keysPressed = listener.keysPressed;

        if ( keysPressed === 'alt+c' ) {

          // command to check shape, Voicing the current shape name or its Properties depending on name visibility
          this.voicingUtterance.alert = quadrilateralDescriber.getCheckShapeDescription();
          Voicing.alertUtterance( this.voicingUtterance );
        }
        else if ( keysPressed === 'alt+shift+r' ) {

          // command to reset shape
          this.quadrilateralShapeModel.isolatedReset();
          this.voicingUtterance.alert = QuadrilateralDescriber.RESET_SHAPE_RESPONSE_PACKET;
          Voicing.alertUtterance( this.voicingUtterance );
        }
      }
    } ) );

    this.vertexNodes = [ vertexANode, vertexBNode, vertexCNode, vertexDNode ];
    this.sideNodes = [ sideABNode, sideBCNode, sideCDNode, sideDANode ];

    // reset the timer so that we change the color for a short period when we become a named shape
    this.quadrilateralShapeModel.shapeNameProperty.link( shapeName => {
      if ( shapeName !== null ) {
        this.remainingTimeForShapeChangeFill = SHAPE_FILL_TIME;
      }
    } );

    // make adjacent sides non-interactive when a QuadrilateralSide is pressed to avoid buggy multitouch cases
    this.makeAdjacentSidesNonInteractiveWhenPressed( sideABNode, sideCDNode, sideDANode, sideBCNode );
    this.makeAdjacentSidesNonInteractiveWhenPressed( sideDANode, sideBCNode, sideABNode, sideCDNode );

    //---------------------------------------------------------------------------------------------------------------
    // traversal order - requested in https://github.com/phetsims/quadrilateral/issues/289.
    //---------------------------------------------------------------------------------------------------------------
    this.pdomOrder = [
      vertexANode,
      sideABNode,
      vertexBNode,
      sideBCNode,
      vertexCNode,
      sideCDNode,
      vertexDNode,
      sideDANode
    ];
  }

  /**
   * Step this Node. When a new shape is detected, the color of the quadrilateral will change momentarily. Step
   * supports changing the color for a brief period of time.
   */
  public step( dt: number ): void {
    const previousActiveFill = this.activeFill;
    if ( this.remainingTimeForShapeChangeFill > 0 ) {
      this.activeFill = QuadrilateralColors.quadrilateralNamedShapeColorProperty;
    }
    else {
      this.activeFill = QuadrilateralColors.quadrilateralShapeColorProperty;
    }

    this.remainingTimeForShapeChangeFill = Math.max( 0, this.remainingTimeForShapeChangeFill - dt );

    if ( previousActiveFill !== this.activeFill ) {
      this.updateFills();
    }
  }

  /**
   * When a side becomes pressed, its adjacent sides become non-interactive to prevent buggy multitouch interaction
   * cases.
   */
  private makeAdjacentSidesNonInteractiveWhenPressed( firstOppositeSideNode: QuadrilateralSideNode, secondOppositeSideNode: QuadrilateralSideNode, firstAdjacentSideNode: QuadrilateralSideNode, secondAdjacentSideNode: QuadrilateralSideNode ): void {
    const firstOppositeSide = firstOppositeSideNode.side;
    const secondOppositeSide = secondOppositeSideNode.side;
    Multilink.multilink( [ firstOppositeSide.isPressedProperty, secondOppositeSide.isPressedProperty ], ( firstOppositeSidePressed, secondOppositeSidePressed ) => {
      const interactive = !firstOppositeSidePressed && !secondOppositeSidePressed;
      firstAdjacentSideNode.inputEnabled = interactive;
      secondAdjacentSideNode.inputEnabled = interactive;
    } );
  }

  /**
   * Update fills for the paintables of this Node. Colors will change momentarily when a new shape is detected.
   */
  private updateFills(): void {
    this.vertexNodes.forEach( vertexNode => { vertexNode.paintableNode.fill = this.activeFill; } );
    this.sideNodes.forEach( sideNode => { sideNode.paintableNode.fill = this.activeFill; } );
  }
}

quadrilateral.register( 'QuadrilateralNode', QuadrilateralNode );
