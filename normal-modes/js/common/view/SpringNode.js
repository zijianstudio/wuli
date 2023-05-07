// Copyright 2020-2022, University of Colorado Boulder

/**
 * SpringNode draws a line between the two masses that its Spring connects.
 *
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import normalModes from '../../normalModes.js';
import NormalModesColors from '../NormalModesColors.js';

class SpringNode extends Node {

  /**
   * @param {Spring} spring
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<boolean>} springsVisibleProperty
   * @param {Tandem} tandem
   */
  constructor( spring, modelViewTransform, springsVisibleProperty, tandem ) {
    super( {
      preventFit: true,
      boundsMethod: 'none',
      pickable: false,
      inputEnabled: false,
      excludeInvisible: true
    } );

    // shape of the spring path
    const springShape = new Shape().moveTo( 0, 0 ).lineTo( 1, 0 );

    // line path that represents a string
    const line = new Path( springShape, {
      preventFit: true,
      boundsMethod: 'none',
      pickable: false,
      inputEnabled: false,
      stroke: NormalModesColors.SPRING_STROKE,
      lineWidth: 5
    } );
    this.addChild( line );

    let currentXScaling = 1;

    // Determines the visibility of the SpringNode. This is done with a Multilink instead of a DerivedProperty
    // so that we don't shadow visibleProperty that is inherited from NodeIO (the IO Type associated with
    // superclass Node).  See https://github.com/phetsims/normal-modes/issues/46.
    // Dispose is unnecessary because the SpringNode and the dependencies exist for the lifetime of the sim.
    Multilink.multilink( [ spring.visibleProperty, springsVisibleProperty ],
      ( springVisible, springsVisible ) => {
        this.visible = ( springVisible && springsVisible );
      } );

    // dispose is unnecessary because the SpringNode and the dependencies exist for the lifetime of the sim
    Multilink.multilink(
      [ spring.leftMass.equilibriumPositionProperty,
        spring.leftMass.displacementProperty,
        spring.rightMass.equilibriumPositionProperty,
        spring.rightMass.displacementProperty
      ], ( leftEquilibriumPosition, leftDisplacement, rightEquilibriumPosition, rightDisplacement ) => {
        if ( this.visible ) {

          const p1 = modelViewTransform.modelToViewPosition( leftEquilibriumPosition.plus( leftDisplacement ) );
          const p2 = modelViewTransform.modelToViewPosition( rightEquilibriumPosition.plus( rightDisplacement ) );
          if ( p1.distance( p2 ) === 0 ) {
            return;
          }

          this.scale( 1 / currentXScaling, 1 );

          currentXScaling = p1.distance( p2 );

          this.translation = p1;
          this.rotation = p2.minus( p1 ).angle;
          this.scale( currentXScaling, 1 );
        }
      } );
  }
}

normalModes.register( 'SpringNode', SpringNode );
export default SpringNode;