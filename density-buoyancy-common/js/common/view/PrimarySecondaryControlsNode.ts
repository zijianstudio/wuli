// Copyright 2019-2022, University of Colorado Boulder

/**
 * Shows mass/volume controls for a primary and secondary mass.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { Node } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Cuboid from '../model/Cuboid.js';
import BlockControlNode, { BlockControlNodeOptions } from './BlockControlNode.js';
import DensityBuoyancyCommonColors from './DensityBuoyancyCommonColors.js';
import PrimarySecondaryPanelsNode from './PrimarySecondaryPanelsNode.js';

export type PrimarySecondaryControlsNodeOptions = BlockControlNodeOptions & { tandem: Tandem };

export default class PrimarySecondaryControlsNode extends PrimarySecondaryPanelsNode {

  /**
   * @param primaryMass
   * @param secondaryMass
   * @param popupLayer
   * @param options - Applied to each BlockControlNode
   */
  public constructor( primaryMass: Cuboid, secondaryMass: Cuboid, popupLayer: Node, options: PrimarySecondaryControlsNodeOptions ) {

    const tandem = options.tandem;
    const omittedOptions = _.omit( options, [ 'tandem' ] );

    const primaryControlNode = new BlockControlNode( primaryMass, popupLayer, combineOptions<BlockControlNodeOptions>( {
      labelNode: PrimarySecondaryPanelsNode.getPrimaryLabelNode(),
      color: DensityBuoyancyCommonColors.labelAProperty,
      tandem: tandem.createTandem( 'blockAControlPanel' )
    }, omittedOptions ) );

    const secondaryControlNode = new BlockControlNode( secondaryMass, popupLayer, combineOptions<BlockControlNodeOptions>( {
      labelNode: PrimarySecondaryPanelsNode.getSecondaryLabelNode(),
      color: DensityBuoyancyCommonColors.labelBProperty,
      tandem: tandem.createTandem( 'blockBControlPanel' )
    }, omittedOptions ) );

    super(
      new Node( {
        children: [ primaryControlNode ],
        visibleProperty: DerivedProperty.and( [ primaryMass.visibleProperty, primaryControlNode.visibleProperty ] )
      } ),
      new Node( {
        children: [ secondaryControlNode ],
        visibleProperty: DerivedProperty.and( [ secondaryMass.visibleProperty, secondaryControlNode.visibleProperty ] )
      } )
    );
  }
}

densityBuoyancyCommon.register( 'PrimarySecondaryControlsNode', PrimarySecondaryControlsNode );
