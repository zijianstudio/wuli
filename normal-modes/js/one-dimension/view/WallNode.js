// Copyright 2020-2022, University of Colorado Boulder

/**
 * WallNode is the view for the stationary masses at each end in the 'One Dimension' Screen.
 *
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import NormalModesColors from '../../common/NormalModesColors.js';
import normalModes from '../../normalModes.js';

class WallNode extends Node {

  /**
   * @param {Mass} mass
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Tandem} tandem
   */
  constructor( mass, modelViewTransform, tandem ) {
    super( { cursor: 'pointer' } );

    const rect = new Rectangle( merge( {
      boundsMethod: 'unstroked',
      lineWidth: 2,
      rectWidth: 6,
      rectHeight: 80,
      cornerRadius: 2
    }, NormalModesColors.WALL_COLORS ) );
    this.addChild( rect );

    // dispose is unnecessary, the WallNode and the dependencies exist for the lifetime of the sim
    Multilink.multilink(
      [ mass.equilibriumPositionProperty, mass.displacementProperty ],
      ( massPosition, massDisplacement ) => {
        this.translation = modelViewTransform.modelToViewPosition( massPosition.plus( massDisplacement ) )
          .subtract( new Vector2( rect.rectWidth / 2, rect.rectHeight / 2 ) );
      } );
  }
}

normalModes.register( 'WallNode', WallNode );
export default WallNode;