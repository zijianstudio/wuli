// Copyright 2022-2023, University of Colorado Boulder

/**
 * A node that looks like a CardNode that creates a CardNode when pressed. (A card factor)
 *
 * Supports creating both a SymbolCardNode and a NumberCardNode, as well as handling the creator-pattern drag forwarding.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { DragListener, Node, PressListenerEvent } from '../../../../scenery/js/imports.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import SymbolCardNode, { SymbolCardNodeOptions } from './SymbolCardNode.js';
import LabScreenView from './LabScreenView.js';
import Easing from '../../../../twixt/js/Easing.js';
import Animation from '../../../../twixt/js/Animation.js';
import CardNode from './CardNode.js';
import TProperty from '../../../../axon/js/TProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import NumberCardNode, { NumberCardNodeOptions } from './NumberCardNode.js';
import NumberSuiteCommonPreferences from '../../common/model/NumberSuiteCommonPreferences.js';
import CountingCommonConstants from '../../../../counting-common/js/common/CountingCommonConstants.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import SymbolType from './SymbolType.js';

type SelfOptions = {
  symbolType?: SymbolType | null;
  number?: number | null;
};
export type CardNodeOptions = SelfOptions;

class CardCreatorNode extends Node {

  public constructor( screenView: LabScreenView<NumberSuiteCommonPreferences>,
                      contentToCountPropertyMap: Map<SymbolType | number, TProperty<number>>,
                      options: CardNodeOptions ) {
    super();

    let iconNode: Node;
    const iconOptions = {
      includeDragListener: false,
      dragBoundsProperty: screenView.symbolCardBoundsProperty,
      homePosition: Vector2.ZERO
    };

    if ( options.symbolType ) {
      assert && assert( !options.number, 'symbolType and number cannot both be provided' );

      iconNode = new SymbolCardNode( combineOptions<SymbolCardNodeOptions>( {
        symbolType: options.symbolType
      }, iconOptions ) );
    }
    else {
      assert && assert( options.number, 'symbolType or number must be provided' );

      iconNode = new NumberCardNode( combineOptions<NumberCardNodeOptions>( {
        number: options.number!
      }, iconOptions ) );
    }

    iconNode.addInputListener( DragListener.createForwardingListener( ( event: PressListenerEvent ) => {

      let cardNode: CardNode;
      let countProperty: TProperty<number>;

      const dropListener = () => {
        const homeNodeBounds = options.symbolType ? screenView.symbolCardCreatorPanel.bounds : screenView.numberCardCreatorCarousel.bounds;

        if ( cardNode.bounds.intersectsBounds( homeNodeBounds ) ) {
          cardNode.inputEnabled = false;

          // Calculate the icon's origin.
          const trail = screenView.getUniqueLeafTrailTo( iconNode ).slice( 1 );
          const globalOrigin = trail.localToGlobalPoint( iconNode.localBounds.center );

          // If returning to a different page, clamp destination at edge.
          if ( globalOrigin.x < homeNodeBounds.left ) {
            globalOrigin.x = homeNodeBounds.left;
          }
          else if ( globalOrigin.x > homeNodeBounds.right ) {
            globalOrigin.x = homeNodeBounds.right;
          }

          const distance = cardNode.positionProperty.value.distance( globalOrigin );
          const duration =
            CountingCommonConstants.ANIMATION_TIME_RANGE.constrainValue( distance / CountingCommonConstants.ANIMATION_SPEED );

          cardNode.animation = new Animation( {
            duration: duration,
            targets: [ {
              property: cardNode.positionProperty,
              easing: Easing.CUBIC_IN_OUT,
              to: globalOrigin
            } ]
          } );

          cardNode.animation.finishEmitter.addListener( () => {
            screenView.pieceLayer.removeChild( cardNode );
            cardNode.dispose();
            countProperty!.value--;
          } );
          cardNode.animation.start();
        }
      };

      const cardNodeOptions = {
        dropListener: dropListener
      };

      if ( options.symbolType ) {
        assert && assert( !options.number, 'symbolType and number cannot both be provided' );

        countProperty = contentToCountPropertyMap.get( options.symbolType )!;
        assert && assert( countProperty, 'countProperty for inequality symbol not found: ' + options.symbolType );

        cardNode = new SymbolCardNode( combineOptions<SymbolCardNodeOptions>( {
          symbolType: options.symbolType,
          dragBoundsProperty: screenView.symbolCardBoundsProperty
        }, cardNodeOptions ) );
      }
      else {
        assert && assert( options.number, 'symbolType or number must be provided' );

        countProperty = contentToCountPropertyMap.get( options.number! )!;

        cardNode = new NumberCardNode( combineOptions<NumberCardNodeOptions>( {
          number: options.number!,
          dragBoundsProperty: screenView.numberCardBoundsProperty
        }, cardNodeOptions ) );
      }

      countProperty.value++;

      screenView.pieceLayer.addChild( cardNode );
      cardNode.positionProperty.value = screenView.globalToLocalPoint( event.pointer.point ).minus( cardNode.localBounds.centerBottom.minusXY( 0, 15 ) );
      cardNode.dragListener!.press( event, cardNode );
    } ) );

    this.addChild( iconNode );
  }
}

numberSuiteCommon.register( 'CardCreatorNode', CardCreatorNode );
export default CardCreatorNode;