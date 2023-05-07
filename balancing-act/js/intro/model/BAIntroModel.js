// Copyright 2013-2021, University of Colorado Boulder

/**
 * Primary model class for the intro screen in the balancing act simulation.
 * This model depicts a plank on a fulcrum with a few masses that the user can
 * put on and remove from the plank.
 *
 * @author John Blanco
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import balancingAct from '../../balancingAct.js';
import BalanceModel from '../../common/model/BalanceModel.js';
import FireExtinguisher from '../../common/model/masses/FireExtinguisher.js';
import SmallTrashCan from '../../common/model/masses/SmallTrashCan.js';

class BAIntroModel extends BalanceModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    super( tandem );

    // Add the initial masses and save their initial positions.
    this.addMass( new FireExtinguisher( new Vector2( 2.7, 0 ), false, { tandem: tandem.createTandem( 'fireExtinguisher1' ) } ) );
    this.addMass( new FireExtinguisher( new Vector2( 3.2, 0 ), false, { tandem: tandem.createTandem( 'fireExtinguisher2' ) } ) );
    this.addMass( new SmallTrashCan( new Vector2( 3.7, 0 ), false, { tandem: tandem.createTandem( 'smallTrashCan' ) } ) );
  }

  /**
   * @public
   */
  reset() {
    this.massList.forEach( mass => {
      mass.positionProperty.reset();
      mass.rotationAngleProperty.reset();
    } );
    super.reset();
  }
}

balancingAct.register( 'BAIntroModel', BAIntroModel );

export default BAIntroModel;