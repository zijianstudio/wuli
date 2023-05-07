// Copyright 2013-2022, University of Colorado Boulder

/**
 * The draggable container node for horizontal bars
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import { Line, Node, Rectangle } from '../../../../scenery/js/imports.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import fractionComparison from '../../fractionComparison.js';
import NodeDragHandler from './NodeDragHandler.js';

class HorizontalBarContainerNode extends Node {

  /**
   * @param {FractionModel} fractionModel
   * @param {string} color
   * @param {Property.<string>} stateProperty - see docs in FractionModel
   * @param {Property.<string>} animatingProperty
   * @param {Property.<number>} divisionsProperty - see docs in FractionModel
   * @param {boolean} interactive
   * @param {function} startPositionFunction - a function taking args (width,height) to compute the start center of the node
   * @param {function} comparePositionFunction - a function taking args (width,height) to compute the center position of the node when compared
   * @param {Object} [options]
   */
  constructor( fractionModel, color, stateProperty, animatingProperty, divisionsProperty, interactive, startPositionFunction, comparePositionFunction, options ) {
    const fractionProperty = fractionModel.fractionProperty;

    options = merge( { cursor: 'pointer' }, options );

    super();

    this.stateProperty = stateProperty;
    this.animatingProperty = animatingProperty;

    const border = new Rectangle( 0, 0, 180, 100, { stroke: 'black', lineWidth: 1 } );
    this.addChild( border );

    this.contents = new Rectangle( 0, 0, fractionProperty.get() * 180, 100, {
      fill: color,
      stroke: 'black',
      lineWidth: 1
    } );

    fractionProperty.link( value => {
      this.contents.setRectWidth( value * 180 );
    } );
    this.addChild( this.contents );

    //Solid lines to show pieces
    const pieceDivisions = new Node();
    Multilink.multilink( [ fractionModel.numeratorProperty, fractionModel.denominatorProperty ],
      ( numerator, denominator ) => {
        const children = [];
        for ( let i = 1; i < numerator; i++ ) {
          const x = i * 180 / denominator;
          children.push( new Line( x, 0, x, 100, { stroke: 'black', lineWidth: 1 } ) );
        }
        pieceDivisions.children = children;

      } );
    this.addChild( pieceDivisions );

    //Dotted lines to show user-selected divisions
    const divisionsNode = new Node();
    divisionsProperty.link( divisions => {
      const children = [];
      for ( let i = 1; i < divisions; i++ ) {
        children.push( new Line( i * 180 / divisions, 0, i * 180 / divisions, 100, {
          stroke: 'gray',
          lineDash: [ 5, 4 ],
          lineWidth: 1.5
        } ) );
      }
      divisionsNode.children = children;
    } );
    this.addChild( divisionsNode );

    //Only show the separator lines if the user is not dragging/comparing the object (i.e. it is at its start position)
    if ( interactive ) {
      this.stateProperty.link( state => {
        divisionsNode.visible = ( state === 'start' );
      } );
    }

    //For the "left behind" pieces, show semi-transparent so it gives the impression that it is just a "shadow", see #19
    if ( !interactive ) {
      this.opacity = 0.6;
    }

    this.mutate( options );
    this.startPosition = startPositionFunction( this.width, this.height );
    this.comparePosition = comparePositionFunction( this.width, this.height );

    this.center = this.startPosition;
    if ( interactive ) {
      this.addInputListener( new NodeDragHandler( this, {
        startDrag: () => {
          this.stateProperty.set( 'dragging' );
        },
        endDrag: () => {
          //Move to the start position or compare position, whichever is closer.
          const center = this.center;
          const distToStart = this.startPosition.distance( center );
          const distToCompare = this.comparePosition.distance( center );

          if ( distToStart < distToCompare ) {
            this.animateToStart();
          }
          else {
            this.animateToComparison();
          }
        }
      } ) );
    }
  }

  /**
   * @public
   */
  animateToComparison() {
    this.animatingProperty.value = true;
    const positionProperty = new Property( this.center );
    const animation = new Animation( {
      duration: 0.5,
      targets: [ {
        property: positionProperty,
        easing: Easing.CUBIC_IN_OUT,
        to: this.comparePosition
      } ]
    } );
    const listener = position => {
      this.center = position;
    };
    positionProperty.link( listener );
    animation.finishEmitter.addListener( () => {
      this.animatingProperty.value = false;
      positionProperty.unlink( listener );
      positionProperty.dispose();
    } );
    animation.start();
    this.stateProperty.set( 'compare' );
  }

  /**
   * @public
   */
  animateToStart() {
    this.animatingProperty.value = true;
    const positionProperty = new Property( this.center );
    const animation = new Animation( {
      duration: 0.5,
      targets: [ {
        property: positionProperty,
        easing: Easing.CUBIC_IN_OUT,
        to: this.startPosition
      } ]
    } );
    const listener = position => {
      this.center = position;
    };
    positionProperty.link( listener );
    animation.finishEmitter.addListener( () => {
      this.animatingProperty.value = false;
      positionProperty.unlink( listener );
      positionProperty.dispose();
    } );
    animation.start();
    this.stateProperty.set( 'start' );
  }
}

fractionComparison.register( 'HorizontalBarContainerNode', HorizontalBarContainerNode );

export default HorizontalBarContainerNode;
