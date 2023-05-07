  // Copyright 2013-2022, University of Colorado Boulder

/**
 * Faucet that dispenses water (the solvent).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { combineOptions, EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import FaucetNode, { FaucetNodeOptions } from '../../../../scenery-phet/js/FaucetNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, NodeOptions, Text } from '../../../../scenery/js/imports.js';
import phScale from '../../phScale.js';
import Water from '../model/Water.js';
import PHScaleConstants from '../PHScaleConstants.js';
import Faucet from '../model/Faucet.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';

// constants
const SCALE = 0.6;

type SelfOptions = EmptySelfOptions;

type WaterFaucetNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'>;

export default class WaterFaucetNode extends Node {

  public constructor( faucet: Faucet, modelViewTransform: ModelViewTransform2, providedOptions: WaterFaucetNodeOptions ) {

    const options = optionize<WaterFaucetNodeOptions, SelfOptions, NodeOptions>()( {
      // Empty optionize call is needed because we're setting options.children below.
    }, providedOptions );

    const horizontalPipeLength = Math.abs( modelViewTransform.modelToViewX( faucet.position.x - faucet.pipeMinX ) ) / SCALE;

    const faucetNode = new FaucetNode( faucet.maxFlowRate, faucet.flowRateProperty, faucet.enabledProperty,
      combineOptions<FaucetNodeOptions>( {}, PHScaleConstants.FAUCET_OPTIONS, {
        horizontalPipeLength: horizontalPipeLength,
        verticalPipeLength: 20,
        tandem: options.tandem.createTandem( 'faucetNode' )
      } ) );
    faucetNode.translation = modelViewTransform.modelToViewPosition( faucet.position );
    faucetNode.setScaleMagnitude( -SCALE, SCALE ); // reflect horizontally

    // decorate the faucet with 'Water' label
    const waterText = new Text( Water.nameProperty, {
      font: new PhetFont( 28 ),
      maxWidth: 85,
      left: faucetNode.left + 115,
      bottom: faucetNode.centerY - 40,
      tandem: options.tandem.createTandem( 'waterText' ),
      phetioVisiblePropertyInstrumented: true
    } );

    options.children = [ faucetNode, waterText ];

    super( options );
  }
}

phScale.register( 'WaterFaucetNode', WaterFaucetNode );