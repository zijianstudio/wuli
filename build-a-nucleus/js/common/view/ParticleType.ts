// Copyright 2022-2023, University of Colorado Boulder

/**
 * ParticleType identifies the particle types and their colors.
 *
 * @author Luisa Vargas
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import buildANucleus from '../../buildANucleus.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import { ProfileColorProperty } from '../../../../scenery/js/imports.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANColors from '../BANColors.js';

class ParticleType extends EnumerationValue {

  public static readonly PROTON = new ParticleType( BuildANucleusStrings.proton, BANColors.protonColorProperty );

  public static readonly NEUTRON = new ParticleType( BuildANucleusStrings.neutronUppercase, BANColors.neutronColorProperty );

  public static readonly ELECTRON = new ParticleType( BuildANucleusStrings.electron, BANColors.electronColorProperty );

  public static readonly POSITRON = new ParticleType( BuildANucleusStrings.positron, BANColors.positronColorProperty );

  public static readonly enumeration = new Enumeration( ParticleType );

  public readonly label: string;
  public readonly colorProperty: ProfileColorProperty;

  public constructor( label: string, colorProperty: ProfileColorProperty ) {
    super();

    this.label = label;
    this.colorProperty = colorProperty;

  }
}

buildANucleus.register( 'ParticleType', ParticleType );
export default ParticleType;