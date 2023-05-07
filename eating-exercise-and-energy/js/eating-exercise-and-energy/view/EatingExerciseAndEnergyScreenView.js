// Copyright 2020-2021, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import EatingExerciseAndEnergyConstants from '../../common/EatingExerciseAndEnergyConstants.js';
import eatingExerciseAndEnergy from '../../eatingExerciseAndEnergy.js';
import EatingExerciseAndEnergyModel from '../model/EatingExerciseAndEnergyModel.js';

class EatingExerciseAndEnergyScreenView extends ScreenView {

  /**
   * @param {EatingExerciseAndEnergyModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {
    assert && assert( model instanceof EatingExerciseAndEnergyModel, 'invalid model' );
    assert && assert( tandem instanceof Tandem, 'invalid tandem' );

    super( {
      tandem: tandem
    } );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - EatingExerciseAndEnergyConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - EatingExerciseAndEnergyConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );
  }

  /**
   * Resets the view.
   * @public
   */
  reset() {
    //TODO
  }

  /**
   * Steps the view.
   * @param {number} dt - time step, in seconds
   * @public
   */
  step( dt ) {
    //TODO
  }
}

eatingExerciseAndEnergy.register( 'EatingExerciseAndEnergyScreenView', EatingExerciseAndEnergyScreenView );
export default EatingExerciseAndEnergyScreenView;