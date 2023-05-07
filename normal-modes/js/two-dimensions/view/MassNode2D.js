// Copyright 2020-2022, University of Colorado Boulder

/**
 * Subclass of MassNode. It adds its drag listener and a circle. It also rotates the arrows created in MassNode.
 *
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 * @author Franco Barpp Gomes (UTFPR)
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Circle, DragListener } from '../../../../scenery/js/imports.js';
import NormalModesColors from '../../common/NormalModesColors.js';
import MassNode from '../../common/view/MassNode.js';
import normalModes from '../../normalModes.js';

class MassNode2D extends MassNode {

  /**
   * @param {Mass} mass
   * @param {ModelViewTransform2} modelViewTransform
   * @param {TwoDimensionsModel} model
   * @param {Bounds2} dragBounds
   * @param {Tandem} tandem
   */
  constructor( mass, modelViewTransform, model, dragBounds, tandem ) {

    super( mass, modelViewTransform, tandem );

    const circle = new Circle( merge( {
      radius: this.size / 2,
      boundsMethod: 'unstroked',
      lineWidth: 4
    }, NormalModesColors.MASS_COLORS ) );

    this.addChild( circle );

    const rotationPoint = new Vector2( 0, 0 );
    for ( const arrow in this.arrows ) {
      this.arrows[ arrow ].rotateAround( rotationPoint, Math.PI / 4 );
    }

    const startCallback = ( event, listener ) => {
      model.draggingMassIndexesProperty.set( model.getMassIndexes( mass ) );
    };

    const dragCallback = ( event, listener ) => {
      model.arrowsVisibleProperty.set( false );
      mass.displacementProperty.set( listener.modelPoint.minus( mass.equilibriumPositionProperty.get() ) );
    };

    const endCallback = ( event, listener ) => {
      !dragListener.interrupted && model.draggingMassIndexesProperty.set( null );
      model.computeModeAmplitudesAndPhases();
    };

    const overUpCallback = isOver => {
      this.arrows.top.visible = isOver;
      this.arrows.bottom.visible = isOver;
      this.arrows.left.visible = isOver;
      this.arrows.right.visible = isOver;
    };

    const dragListener = new DragListener( {
      applyOffset: true,
      start: startCallback,
      drag: dragCallback,
      end: endCallback,
      transform: modelViewTransform,
      dragBoundsProperty: new Property( dragBounds )
    } );
    this.addInputListener( dragListener );

    const callback = overUpCallback.bind( this );
    // unlink is unnecessary, the MassNode2D and the dependency exists for the lifetime of the sim
    model.arrowsVisibleProperty.link( arrowsVisible => {
      if ( arrowsVisible ) {
        // unlink is needed when the arrows become invisible
        dragListener.isOverProperty.link( callback );
      }
      else {
        this.arrows.top.visible = false;
        this.arrows.bottom.visible = false;
        this.arrows.left.visible = false;
        this.arrows.right.visible = false;
        if ( dragListener.isOverProperty.hasListener( callback ) ) {
          dragListener.isOverProperty.unlink( callback );
        }
      }
    } );

    //TODO https://github.com/phetsims/normal-modes/issues/78, workaround for lack of multitouch support
    // If the mass associated with this Node is not the one being dragged, then cancel any drag related
    // to this Node that may be in progress.
    model.draggingMassIndexesProperty.link( draggingMassIndexes => {
      if ( draggingMassIndexes ) {
        const massIndexes = model.getMassIndexes( mass ); // {i:number, j:number}
        if ( !( draggingMassIndexes.i === massIndexes.i && draggingMassIndexes.j === massIndexes.j ) ) {
          this.interruptSubtreeInput();
        }
      }
    } );
  }
}

normalModes.register( 'MassNode2D', MassNode2D );
export default MassNode2D;