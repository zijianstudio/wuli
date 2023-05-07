// Copyright 2020-2022, University of Colorado Boulder

/**
 * MassNode is a base class for MassNode1D and MassNode2D, as its drag listeners differ.
 *
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 * @author Franco Barpp Gomes (UTFPR)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { Node } from '../../../../scenery/js/imports.js';
import normalModes from '../../normalModes.js';
import NormalModesColors from '../NormalModesColors.js';

class MassNode extends Node {

  /**
   * @param {Mass} mass
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Tandem} tandem
   */
  constructor( mass, modelViewTransform, tandem ) {
    super( { cursor: 'pointer' } );

    // TODO https://github.com/phetsims/normal-modes/issues/38 magic number
    this.size = 20;

    // dispose is unnecessary, the MassNode and the dependencies exist for the lifetime of the sim
    Multilink.multilink( [ mass.equilibriumPositionProperty, mass.displacementProperty ],
      ( massPosition, massDisplacement ) => {
        this.translation = modelViewTransform.modelToViewPosition( massPosition.plus( massDisplacement ) );
      } );

    // TODO https://github.com/phetsims/normal-modes/issues/38 magic numbers
    const arrowOptions = merge( {
      boundsMethod: 'unstroked',
      lineWidth: 2,
      tailWidth: 10,
      headWidth: 20,
      headHeight: 16,
      visible: false,
      excludeInvisible: true
    }, NormalModesColors.ARROW_COLORS );

    const arrowSize = 23;

    // @public {Object}
    this.arrows = {
      left: new ArrowNode( -this.size / 2, 0, -this.size / 2 - arrowSize, 0, arrowOptions ),
      right: new ArrowNode( this.size / 2, 0, this.size / 2 + arrowSize, 0, arrowOptions ),

      top: new ArrowNode( 0, -this.size / 2, 0, -this.size / 2 - arrowSize, arrowOptions ),
      bottom: new ArrowNode( 0, this.size / 2, 0, this.size / 2 + arrowSize, arrowOptions )
    };

    this.addChild( this.arrows.left );
    this.addChild( this.arrows.top );
    this.addChild( this.arrows.right );
    this.addChild( this.arrows.bottom );

    mass.visibleProperty.linkAttribute( this, 'visible' );
  }
}

normalModes.register( 'MassNode', MassNode );
export default MassNode;