// Copyright 2014-2020, University of Colorado Boulder

/**
 *
 * @author Martin Veillette (Berea College)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import leastSquaresRegression from '../leastSquaresRegression.js';
import LeastSquaresRegressionConstants from './LeastSquaresRegressionConstants.js';
import LeastSquaresRegressionModel from './model/LeastSquaresRegressionModel.js';
import LeastSquaresRegressionScreenView from './view/LeastSquaresRegressionScreenView.js';

class LeastSquaresRegressionScreen extends Screen {
  constructor() {
    super(
      () => new LeastSquaresRegressionModel(),
      model => new LeastSquaresRegressionScreenView( model ),
      { backgroundColorProperty: new Property( LeastSquaresRegressionConstants.BACKGROUND_COLOR ) }
    );
  }
}

leastSquaresRegression.register( 'LeastSquaresRegressionScreen', LeastSquaresRegressionScreen );
export default LeastSquaresRegressionScreen;