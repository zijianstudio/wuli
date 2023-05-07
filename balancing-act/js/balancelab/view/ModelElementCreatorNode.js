// Copyright 2013-2023, University of Colorado Boulder

/**
 * Base type for the Scenery nodes that appear in the view, generally in some sort of toolbox, and that can be clicked
 * on by the user in order to add model elements to the model.
 *
 * @author John Blanco
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { DragListener, Node, Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import balancingAct from '../../balancingAct.js';

// constants
const CAPTION_OFFSET_FROM_SELECTION_NODE = 4;
const LABEL_FONT = new PhetFont( 14 );
const MAX_CAPTION_WIDTH_PROPORTION = 1.5; // max width for for the caption as a proportion of the creator node

class ModelElementCreatorNode extends Node {

  /**
   * @param {BasicBalanceScreenView} screenView
   * @param {Object} [options]
   */
  constructor( screenView, options ) {
    options = merge( {
      cursor: 'pointer',
      tandem: Tandem.REQUIRED
    }, options );
    super( options );
    const self = this;

    // Element in the model that is being moved by the user.  Only non-null if the user performed some action that
    // caused this to be created, such as clicking on this node.
    this.modelElement = null;

    // Offset used when adding an element to the model.  This is useful in making sure that the newly created object
    // isn't positioned in, shall we say, an awkward position with respect to the mouse.
    this.positioningOffset = Vector2.ZERO;

    // Function for translating click and touch events to model coordinates.
    const modelViewTransform = screenView.modelViewTransform;
    const eventToModelPosition = pointerPosition => {
      return modelViewTransform.viewToModelPosition(
        screenView.globalToLocalPoint( pointerPosition ).plus( self.positioningOffset )
      );
    };

    // Create an input listener that will add the model element to the model and then forward events to the view node
    // that is created as a result.
    this.addInputListener( DragListener.createForwardingListener(
      event => {

        // Determine the initial position where this element should move to after it's created based on the position of
        // the pointer event.
        const initialPosition = eventToModelPosition( event.pointer.point );

        // Create a new mass and add it to the model.  This will cause a view node to be created in the view.
        this.modelElement = this.addElementToModel( initialPosition );

        // Get the view node that should have appeared in the view so that events can be forwarded to its drag handler.
        const modelElementNode = screenView.getNodeForMass( this.modelElement );
        assert && assert( modelElementNode, 'unable to find view node for model element' );

        modelElementNode.dragHandler.press( event, modelElementNode );
      },
      {
        allowTouchSnag: true,
        tandem: options.tandem.createTandem( 'dragListener' )
      }
    ) );
  }

  /**
   * Method overridden by subclasses to add the element that they represent to the model.
   * @public
   */
  addElementToModel() {
    throw new Error( 'addElementToModel should be implemented in descendant classes.' );
  }

  /**
   * @param selectionNode
   * @public
   */
  setSelectionNode( selectionNode ) {
    if ( this.selectionNode ) {
      throw new Error( 'Can\'t set selectionNode more than once.' );
    }
    this.selectionNode = selectionNode;
    this.addChild( selectionNode );
    this.updateLayout();
  }

  /**
   * @param {String} captionText
   * @protected
   */
  setCaption( captionText ) {
    this.caption = new Text( captionText, { font: LABEL_FONT } );
    this.addChild( this.caption );
    this.updateLayout();
  }

  /**
   * @private
   */
  updateLayout() {

    // This only does something if both the element node and the caption are set.
    if ( this.caption && this.selectionNode ) {
      this.caption.maxWidth = this.selectionNode.width * MAX_CAPTION_WIDTH_PROPORTION;
      this.caption.centerX = this.selectionNode.centerX;
      this.caption.top = this.selectionNode.bottom + CAPTION_OFFSET_FROM_SELECTION_NODE;
    }
  }
}

balancingAct.register( 'ModelElementCreatorNode', ModelElementCreatorNode );

export default ModelElementCreatorNode;
