// Copyright 2023, University of Colorado Boulder

/**
 * EnergyLevelType identifies constant conditions for the energy levels.
 *
 * @author Luisa Vargas
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import buildANucleus from '../../buildANucleus.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';

class EnergyLevelType extends EnumerationValue {

  public static readonly NONE = new EnergyLevelType( 0, 0, 0 );

  public static readonly FIRST = new EnergyLevelType( 1, 0, 3 );

  public static readonly SECOND = new EnergyLevelType( 2, 0, 9 );

  public static readonly enumeration = new Enumeration( EnergyLevelType );

  public readonly yPosition: number;
  public readonly xPosition: number;
  public readonly fullPlusOneCount: number;

  public constructor( yPosition: number, xPosition: number, fullPlusOneCount: number ) {
    super();

    this.yPosition = yPosition;
    this.fullPlusOneCount = fullPlusOneCount;
    this.xPosition = xPosition;
  }
}

buildANucleus.register( 'EnergyLevelType', EnergyLevelType );
export default EnergyLevelType;