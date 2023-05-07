// Copyright 2021-2023, University of Colorado Boulder

/**
 * SolutionDerivedProperties models the Properties of a solution that are derived from pH and volume, including
 * concentration (mol/L), quantity (mol), and numbers of particles. This class is separated from the solution
 * model so that it can be used in different solution models via composition.
 *
 * This sim has different solution models because:
 * - Different screens have different needs, and there is no solution base class that is appropriate for all screens.
 *   Macro and Micro screens have a solute, with pH and total volume being DerivedProperties. My Solution
 *   screen has no solute, and pH and totalVolume are not derived.
 * - For PhET-iO, these Properties should appear only in the screens for which they are relevant; that is, the
 *   Micro and My Solution screens.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import PHModel from './PHModel.js';
import phScale from '../../phScale.js';
import { ConcentrationValue, PHValue } from './PHModel.js';
import LinkableReadOnlyProperty from '../../../../axon/js/LinkableReadOnlyProperty.js';

type SelfOptions = EmptySelfOptions;

type SolutionDerivedPropertiesOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class SolutionDerivedProperties {

  // The concentration (mol/L) of H2O, H3O+, and OH- in the solution
  public readonly concentrationH2OProperty: LinkableReadOnlyProperty<ConcentrationValue>;
  public readonly concentrationH3OProperty: LinkableReadOnlyProperty<ConcentrationValue>;
  public readonly concentrationOHProperty: LinkableReadOnlyProperty<ConcentrationValue>;

  // The quantity (mol) of H2O, H3O+, and OH- in the solution
  public readonly quantityH2OProperty: LinkableReadOnlyProperty<number>;
  public readonly quantityH3OProperty: LinkableReadOnlyProperty<number>;
  public readonly quantityOHProperty: LinkableReadOnlyProperty<number>;

  // The number of H2O, H3O+, and OH- particles in the solution
  public readonly particleCountH2OProperty: LinkableReadOnlyProperty<number>;
  public readonly particleCountH3OProperty: LinkableReadOnlyProperty<number>;
  public readonly particleCountOHProperty: LinkableReadOnlyProperty<number>;

  public constructor( pHProperty: TReadOnlyProperty<PHValue>,
                      totalVolumeProperty: TReadOnlyProperty<number>,
                      providedOptions: SolutionDerivedPropertiesOptions ) {

    const options = providedOptions;

    this.concentrationH2OProperty = new DerivedProperty(
      [ totalVolumeProperty ],
      totalVolume => PHModel.volumeToConcentrationH20( totalVolume ), {
        tandem: options.tandem.createTandem( 'concentrationH2OProperty' ),
        phetioValueType: NullableIO( NumberIO ),
        units: 'mol/L',
        phetioDocumentation: 'concentration of H<sub>2</sub>O in the solution',
        phetioHighFrequency: true
      } );

    this.concentrationH3OProperty = new DerivedProperty(
      [ pHProperty ],
      pH => PHModel.pHToConcentrationH3O( pH ), {
        tandem: options.tandem.createTandem( 'concentrationH3OProperty' ),
        phetioValueType: NullableIO( NumberIO ),
        units: 'mol/L',
        phetioDocumentation: 'concentration of H<sub>3</sub>O<sup>+</sup> in the solution',
        phetioHighFrequency: true
      } );

    this.concentrationOHProperty = new DerivedProperty(
      [ pHProperty ],
      pH => PHModel.pHToConcentrationOH( pH ), {
        tandem: options.tandem.createTandem( 'concentrationOHProperty' ),
        phetioValueType: NullableIO( NumberIO ),
        units: 'mol/L',
        phetioDocumentation: 'concentration of OH<sup>-</sup> in the solution',
        phetioHighFrequency: true
      } );

    this.quantityH2OProperty = new DerivedProperty(
      [ this.concentrationH2OProperty, totalVolumeProperty ],
      ( concentrationH2O, totalVolume ) => PHModel.computeMoles( concentrationH2O, totalVolume ), {
        tandem: options.tandem.createTandem( 'quantityH2OProperty' ),
        phetioValueType: NumberIO,
        units: 'mol',
        phetioDocumentation: 'quantity of H<sub>2</sub>O in the solution',
        phetioHighFrequency: true
      } );

    this.quantityH3OProperty = new DerivedProperty(
      [ this.concentrationH3OProperty, totalVolumeProperty ],
      ( concentrationH3O, totalVolume ) => PHModel.computeMoles( concentrationH3O, totalVolume ), {
        tandem: options.tandem.createTandem( 'quantityH3OProperty' ),
        phetioValueType: NumberIO,
        units: 'mol',
        phetioDocumentation: 'quantity of H<sub>3</sub>O<sup>+</sup> in the solution',
        phetioHighFrequency: true
      } );

    this.quantityOHProperty = new DerivedProperty(
      [ this.concentrationOHProperty, totalVolumeProperty ],
      ( concentrationOH, totalVolume ) => PHModel.computeMoles( concentrationOH, totalVolume ), {
        tandem: options.tandem.createTandem( 'quantityOHProperty' ),
        phetioValueType: NumberIO,
        units: 'mol',
        phetioDocumentation: 'quantity of OH<sup>-</sup> in the solution',
        phetioHighFrequency: true
      } );

    this.particleCountH2OProperty = new DerivedProperty(
      [ this.concentrationH2OProperty, totalVolumeProperty ],
      ( concentrationH2O, totalVolume ) => PHModel.computeParticleCount( concentrationH2O, totalVolume ), {
        tandem: options.tandem.createTandem( 'particleCountH2OProperty' ),
        phetioValueType: NumberIO,
        phetioDocumentation: 'number of H<sub>2</sub>O molecules in the solution',
        phetioHighFrequency: true
      } );

    this.particleCountH3OProperty = new DerivedProperty(
      [ this.concentrationH3OProperty, totalVolumeProperty ],
      ( concentrationH3O, totalVolume ) => PHModel.computeParticleCount( concentrationH3O, totalVolume ), {
        tandem: options.tandem.createTandem( 'particleCountH3OProperty' ),
        phetioValueType: NumberIO,
        phetioDocumentation: 'number of H<sub>3</sub>O<sup>+</sup> ions in the solution',
        phetioHighFrequency: true
      } );

    this.particleCountOHProperty = new DerivedProperty(
      [ this.concentrationOHProperty, totalVolumeProperty ],
      ( concentrationOH, totalVolume ) => PHModel.computeParticleCount( concentrationOH, totalVolume ), {
        tandem: options.tandem.createTandem( 'particleCountOHProperty' ),
        phetioValueType: NumberIO,
        phetioDocumentation: 'number of OH<sup>-</sup> ions in the solution',
        phetioHighFrequency: true
      } );
  }
}

phScale.register( 'SolutionDerivedProperties', SolutionDerivedProperties );