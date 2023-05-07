// Copyright 2020-2022, University of Colorado Boulder

/**
 * Subclass of MassNode. It adds its drag listener and a rectangle.
 *
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 * @author Franco Barpp Gomes (UTFPR)
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { DragListener, Rectangle } from '../../../../scenery/js/imports.js';
import AmplitudeDirection from '../../common/model/AmplitudeDirection.js';
import NormalModesColors from '../../common/NormalModesColors.js';
import MassNode from '../../common/view/MassNode.js';
import normalModes from '../../normalModes.js';

class MassNode1D extends MassNode {

  /**
   * @param {Mass} mass
   * @param {ModelViewTransform2} modelViewTransform
   * @param {OneDimensionModel} model
   * @param {Bounds2} dragBounds
   * @param {Tandem} tandem
   */
  constructor( mass, modelViewTransform, model, dragBounds, tandem ) {

    super( mass, modelViewTransform, tandem );

    const rect = new Rectangle( merge( {
      boundsMethod: 'unstroked',
      lineWidth: 4,
      rectWidth: this.size,
      rectHeight: this.size,
      centerX: 0,
      centerY: 0
    }, NormalModesColors.MASS_COLORS ) );

    this.addChild( rect );

    const startCallback = ( event, listener ) => {
      model.draggingMassIndexProperty.set( model.masses.indexOf( mass ) );
    };

    const dragCallback = ( event, listener ) => {
      model.arrowsVisibleProperty.set( false );
      const point = listener.modelPoint.minus( mass.equilibriumPositionProperty.get() );
      if ( model.amplitudeDirectionProperty.get() === AmplitudeDirection.HORIZONTAL ) {
        const oldY = mass.displacementProperty.get().y;
        mass.displacementProperty.set( new Vector2( point.x, oldY ) );
      }
      else {
        const oldX = mass.displacementProperty.get().x;
        mass.displacementProperty.set( new Vector2( oldX, point.y ) );
      }
    };

    const endCallback = ( event, listener ) => {
      !dragListener.interrupted && model.draggingMassIndexProperty.set( -1 );
      model.computeModeAmplitudesAndPhases();
    };

    const overUpCallback = isOver => {
      const amplitudeDirection = model.amplitudeDirectionProperty.get();
      if ( amplitudeDirection === AmplitudeDirection.VERTICAL ) {
        this.arrows.top.visible = isOver;
        this.arrows.bottom.visible = isOver;
      }
      else {
        this.arrows.left.visible = isOver;
        this.arrows.right.visible = isOver;
      }
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
    // unlink is unnecessary, the MassNode1D and the dependency exists for the lifetime of the sim
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
    model.draggingMassIndexProperty.link( draggingMassIndex => {
      if ( draggingMassIndex !== model.masses.indexOf( mass ) ) {
        this.interruptSubtreeInput();
      }
    } );
  }
}

normalModes.register( 'MassNode1D', MassNode1D );
export default MassNode1D;