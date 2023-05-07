// Copyright 2022, University of Colorado Boulder

/**
 * Mass shape for the Buoyancy Shapes screen. In the common model because some phet-io hackery is needed.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

export class MassShape extends EnumerationValue {
  public static readonly BLOCK = new MassShape();
  public static readonly ELLIPSOID = new MassShape();
  public static readonly VERTICAL_CYLINDER = new MassShape();
  public static readonly HORIZONTAL_CYLINDER = new MassShape();
  public static readonly CONE = new MassShape();
  public static readonly INVERTED_CONE = new MassShape();

  public static readonly enumeration = new Enumeration( MassShape, {
    phetioDocumentation: 'Shape of the mass'
  } );
}

densityBuoyancyCommon.register( 'MassShape', MassShape );
