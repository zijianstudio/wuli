// Copyright 2013-2022, University of Colorado Boulder

/**
 * Faucet that drains solution from the beaker.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import FaucetNode, { FaucetNodeOptions } from '../../../../scenery-phet/js/FaucetNode.js';
import phScale from '../../phScale.js';
import PHScaleConstants from '../PHScaleConstants.js';
import Faucet from '../model/Faucet.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { EmptySelfOptions, optionize4 } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';

// constants
const SCALE = 0.6;

type SelfOptions = EmptySelfOptions;

type DrainFaucetNodeOptions = SelfOptions & PickRequired<FaucetNodeOptions, 'tandem'>;

export default class DrainFaucetNode extends FaucetNode {

  public constructor( faucet: Faucet, modelViewTransform: ModelViewTransform2, providedOptions: DrainFaucetNodeOptions ) {

    const horizontalPipeLength = Math.abs( modelViewTransform.modelToViewX( faucet.position.x - faucet.pipeMinX ) ) / SCALE;

    const options = optionize4<DrainFaucetNodeOptions, SelfOptions, FaucetNodeOptions>()( {},
      PHScaleConstants.FAUCET_OPTIONS, {

        // FaucetNodeOptions
        horizontalPipeLength: horizontalPipeLength,
        verticalPipeLength: 5
      }, providedOptions );

    super( faucet.maxFlowRate, faucet.flowRateProperty, faucet.enabledProperty, options );

    this.translation = modelViewTransform.modelToViewPosition( faucet.position );
    this.setScaleMagnitude( -SCALE, SCALE ); // reflect horizontally
  }
}

phScale.register( 'DrainFaucetNode', DrainFaucetNode );