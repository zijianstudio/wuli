// Copyright 2022-2023, University of Colorado Boulder

/**
 * Model class for the 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import BANModel from '../../common/model/BANModel.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import BANConstants from '../../common/BANConstants.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DecayType from '../../common/view/DecayType.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';

class DecayModel extends BANModel<ParticleAtom> {

  // the half-life number
  public halfLifeNumberProperty: TReadOnlyProperty<number>;

  // the decay enabled properties for all five decays
  public protonEmissionEnabledProperty: TReadOnlyProperty<boolean>;
  public neutronEmissionEnabledProperty: TReadOnlyProperty<boolean>;
  public betaMinusDecayEnabledProperty: TReadOnlyProperty<boolean>;
  public betaPlusDecayEnabledProperty: TReadOnlyProperty<boolean>;
  public alphaDecayEnabledProperty: TReadOnlyProperty<boolean>;

  public constructor() {

    const particleAtom = new ParticleAtom();

    // empirically determined, the last nuclide the Decay screen goes up to is Uranium-238 (92 protons and 146 neutrons)
    super( BANConstants.DECAY_MAX_NUMBER_OF_PROTONS, BANConstants.DECAY_MAX_NUMBER_OF_NEUTRONS, particleAtom );

    this.halfLifeNumberProperty = new DerivedProperty(
      [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty, this.doesNuclideExistBooleanProperty, this.isStableBooleanProperty ],
      ( protonCount: number, neutronCount: number, doesNuclideExist: boolean, isStable: boolean ) => {

        let halfLife;

        // a nuclide of 0 protons and 0 neutrons does not exist
        if ( doesNuclideExist && !( protonCount === 0 && neutronCount === 0 ) ) {

          // the nuclide is stable, set the indicator to the maximum half-life number on the half-life number line
          if ( isStable ) {
            halfLife = Math.pow( 10, BANConstants.HALF_LIFE_NUMBER_LINE_END_EXPONENT );
          }

          // the nuclide is unstable and its half-life data is missing, set -1 as the half-life as a placeholder
          else if ( AtomIdentifier.getNuclideHalfLife( protonCount, neutronCount ) === null ) {
            halfLife = -1;
          }

          // the nuclide is unstable and its half-life data is not missing, update its half-life
          else {
            halfLife = AtomIdentifier.getNuclideHalfLife( protonCount, neutronCount )!;
          }
        }

        // the nuclide does not exist
        else {
          halfLife = 0;
        }

        // TODO: is this alright that the halfLife is not correct yet?
        // one of the boolean properties (doesNuclideExist or isStable) is not updated yet but it will be updated soon
        if ( halfLife === undefined ) {
          return 0;
        }
        else {
          return halfLife;
        }
      }
    );

    // function which would return whether a given nuclide (defined by the number of protons and neutrons) has a certain
    // available decay type
    const createDecayEnabledListener = ( protonCount: number, neutronCount: number, decayType: DecayType ): boolean => {
      const decays = AtomIdentifier.getAvailableDecays( protonCount, neutronCount );

      // temporarily disable the beta minus decay for U-237 since that freezes the sim. See https://github.com/phetsims/build-a-nucleus/issues/42.
      if ( protonCount === 92 && neutronCount === 145 && decayType === DecayType.BETA_MINUS_DECAY ) {
        return false;
      }

      return decays.includes( decayType.name );
    };

    // create the decay enabled properties
    this.protonEmissionEnabledProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) =>
        createDecayEnabledListener( protonCount, neutronCount, DecayType.PROTON_EMISSION )
    );
    this.neutronEmissionEnabledProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) =>
        createDecayEnabledListener( protonCount, neutronCount, DecayType.NEUTRON_EMISSION )
    );
    this.betaMinusDecayEnabledProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) =>
        createDecayEnabledListener( protonCount, neutronCount, DecayType.BETA_MINUS_DECAY )
    );
    this.betaPlusDecayEnabledProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) =>
        createDecayEnabledListener( protonCount, neutronCount, DecayType.BETA_PLUS_DECAY )
    );
    this.alphaDecayEnabledProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) =>
        createDecayEnabledListener( protonCount, neutronCount, DecayType.ALPHA_DECAY )
    );
  }

  public override reset(): void {
    super.reset();
  }

  /**
   * @param dt - time step, in seconds
   */
  public override step( dt: number ): void {
    super.step( dt );
  }
}

buildANucleus.register( 'DecayModel', DecayModel );
export default DecayModel;