// Copyright 2022-2023, University of Colorado Boulder

/**
 * Draggable node that shows a single number on a card.  The number can change if the corresponding ball is dragged.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import centerAndVariability from '../../centerAndVariability.js';
import { DragListener, Node, NodeOptions, Rectangle, Text } from '../../../../scenery/js/imports.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import SoccerBall from '../../common/model/SoccerBall.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Animation from '../../../../twixt/js/Animation.js';
import Range from '../../../../dot/js/Range.js';
import Easing from '../../../../twixt/js/Easing.js';
import CardModel from '../model/CardModel.js';
import Emitter from '../../../../axon/js/Emitter.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import TEmitter from '../../../../axon/js/TEmitter.js';

type SelfOptions = EmptySelfOptions;
export type CardNodeOptions = SelfOptions & NodeOptions & PickRequired<NodeOptions, 'tandem'>;

export default class CardNode extends Node {
  public readonly positionProperty: Vector2Property;
  public readonly dragListener: DragListener;

  // Emit how far the card has been dragged for purposes of hiding the drag indicator arrow when the user
  // has dragged a sufficient amount
  public readonly dragDistanceEmitter: TEmitter<[ number ]> = new Emitter<[ number ]>( {
    parameters: [ { valueType: 'number' } ]
  } );

  public readonly soccerBall: SoccerBall;
  public animation: Animation | null = null;
  private animationTo: Vector2 | null = null;

  public static readonly CARD_WIDTH = 43;

  public constructor( cardModel: CardModel, position: Vector2, getDragRange: () => Range, providedOptions: CardNodeOptions ) {

    const cornerRadius = 10;
    const rectangle = new Rectangle( 0, 0, CardNode.CARD_WIDTH, CardNode.CARD_WIDTH, cornerRadius, cornerRadius, {
      stroke: 'black',
      lineWidth: 1,
      fill: 'white'
    } );
    const text = new Text( '', {
      font: new PhetFont( 24 )
    } );

    const options = optionize<CardNodeOptions, SelfOptions, NodeOptions>()( {
      children: [ rectangle, text ],
      cursor: 'pointer',
      phetioDynamicElement: true
    }, providedOptions );

    super( options );

    cardModel.soccerBall.valueProperty.link( value => {
      text.string = value === null ? '' : value + '';
      text.center = rectangle.center;
      this.visible = value !== null;
    } );

    this.positionProperty = new Vector2Property( position, {
      tandem: options.tandem.createTandem( 'positionProperty' ),
      valueComparisonStrategy: 'equalsFunction'
    } );

    this.soccerBall = cardModel.soccerBall;

    this.positionProperty.link( position => {
      const range = getDragRange();
      this.translation = new Vector2( range.constrainValue( position.x ), 0 );
    } );

    this.dragListener = new DragListener( {
      tandem: options.tandem.createTandem( 'dragListener' ),
      positionProperty: this.positionProperty,
      start: () => {
        this.moveToFront();
      },
      // TODO-UX: This emits for dragging the leftmost card to the left, see https://github.com/phetsims/center-and-variability/issues/111
      drag: ( event, listener ) => this.dragDistanceEmitter.emit( Math.abs( listener.modelDelta.x ) )
    } );
    this.addInputListener( this.dragListener );

    this.soccerBall.dragStartedEmitter.addListener( () => this.moveToFront() );
  }

  public animateTo( destination: Vector2, duration: number, callback = _.noop ): void {

    if ( this.animation ) {

      assert && assert( !!this.animationTo, 'animationTo should be defined when animation is defined' );

      if ( destination.equals( this.animationTo! ) ) {

        // Already moving to the desired destination.
        // TODO: should this callback be called from the finishEmitter of the existing animation?
        callback();
        return;
      }
      else {
        this.animation.stop();
      }
    }
    else {
      if ( destination.equals( this.positionProperty.value ) ) {

        // Already at the desired destination.
        callback();
        return;
      }
    }

    this.animation = new Animation( {
      duration: duration,
      targets: [ {
        property: this.positionProperty,
        to: destination,
        easing: Easing.QUADRATIC_IN_OUT
      } ]
    } );
    this.animationTo = destination;

    this.animation.endedEmitter.addListener( () => {
      callback();
      this.animation = null;
      this.animationTo = null;
    } );

    this.animation.start();
  }
}

centerAndVariability.register( 'CardNode', CardNode );