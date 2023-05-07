// Copyright 2020-2022, University of Colorado Boulder

/**
 * A subtype of ScreenView that has a primary/secondary mass (with visibility controls for the second mass)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import BlocksRadioButtonGroup from './BlocksRadioButtonGroup.js';
import DensityBuoyancyScreenView from './DensityBuoyancyScreenView.js';
import TwoBlockMode from '../model/TwoBlockMode.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Node } from '../../../../scenery/js/imports.js';
import DensityBuoyancyModel from '../model/DensityBuoyancyModel.js';

export default abstract class SecondaryMassScreenView<Model extends DensityBuoyancyModel> extends DensityBuoyancyScreenView<Model> {

  protected abstract rightBox: Node;
  private blocksRadioButtonGroup?: Node;

  /**
   * Adding the second-mass control.
   */
  protected addSecondMassControl( modeProperty: Property<TwoBlockMode> ): void {
    assert && assert( this.rightBox, 'SecondaryMassScreenView requires a this.rightBox be defined to add this control' );

    this.blocksRadioButtonGroup = new BlocksRadioButtonGroup( modeProperty, {
      tandem: this.tandem.createTandem( 'blocksRadioButtonGroup' )
    } );

    this.addChild( this.blocksRadioButtonGroup );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.rightBox.transformEmitter.addListener( () => this.positionSecondMassControl() );
    this.transformEmitter.addListener( () => this.positionSecondMassControl() );
  }

  /**
   * Positions the second-mass control.
   */
  private positionSecondMassControl(): void {
    this.blocksRadioButtonGroup!.bottom = this.modelToViewPoint( new Vector3(
      0,
      this.model.poolBounds.minY,
      this.model.poolBounds.maxZ
    ) ).y;
    this.blocksRadioButtonGroup!.left = this.rightBox.left;
  }

  public override layout( viewBounds: Bounds2 ): void {
    super.layout( viewBounds );

    // If the simulation was not able to load for WebGL, bail out
    if ( !this.sceneNode ) {
      return;
    }

    this.positionSecondMassControl();
  }
}

densityBuoyancyCommon.register( 'SecondaryMassScreenView', SecondaryMassScreenView );
