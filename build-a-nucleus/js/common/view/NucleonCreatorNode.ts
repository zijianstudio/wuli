// Copyright 2022-2023, University of Colorado Boulder

/**
 * Creates Particle's when pressed down on.
 *
 * @author Luisa Vargas
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { DragListener, Node } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import BANScreenView from './BANScreenView.js';
import ParticleNode from '../../../../shred/js/view/ParticleNode.js';
import ParticleType from './ParticleType.js';
import Particle from '../../../../shred/js/model/Particle.js';
import BANModel from '../model/BANModel.js';
import BANConstants from '../BANConstants.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import Vector2 from '../../../../dot/js/Vector2.js';

class NucleonCreatorNode<T extends ParticleAtom> extends Node {

  public constructor( particleType: ParticleType, screenView: BANScreenView<BANModel<T>>, particleViewPositionVector: Vector2 ) {
    super();

    const targetNode = new ParticleNode( particleType.name.toLowerCase(), BANConstants.PARTICLE_RADIUS );
    this.addChild( targetNode );
    this.touchArea = this.localBounds.dilated( 10 );

    this.addInputListener( DragListener.createForwardingListener( event => {

      // We want this relative to the screen view, so it is guaranteed to be the proper view coordinates.
      const viewPosition = screenView.globalToLocalPoint( event.pointer.point );
      const particle = new Particle( particleType.name.toLowerCase(), {
        maxZLayer: BANConstants.NUMBER_OF_NUCLEON_LAYERS - 1
      } );
      particle.animationVelocityProperty.value = BANConstants.PARTICLE_ANIMATION_SPEED;

      // Once we have the number's bounds, we set the position so that our pointer is in the middle of the drag target.
      particle.setPositionAndDestination(
        viewPosition.minus( particleViewPositionVector ).minus( particle.positionProperty.value )
      );

      // Create and start dragging the new particle
      screenView.addAndDragParticle( event, particle );
    } ) );
  }
}

buildANucleus.register( 'NucleonCreatorNode', NucleonCreatorNode );
export default NucleonCreatorNode;