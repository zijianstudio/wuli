// Copyright 2013-2020, University of Colorado Boulder

/**
 * The 'Intro' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import fractionComparison from '../fractionComparison.js';
import IntroModel from './model/IntroModel.js';
import IntroView from './view/IntroView.js';

class IntroScreen extends Screen {
  constructor() {
    super(
      () => new IntroModel(),
      model => new IntroView( model, ModelViewTransform2.createIdentity() ),
      { backgroundColorProperty: new Property( '#e1f1f1' ) }
    );
  }
}

fractionComparison.register( 'IntroScreen', IntroScreen );
export default IntroScreen;