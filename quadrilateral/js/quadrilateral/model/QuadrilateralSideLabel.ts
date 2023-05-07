// Copyright 2023, University of Colorado Boulder

/**
 * A QuadrilateralSideLabel is assigned to each QuadrilateralSide so that they can be identified.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import quadrilateral from '../../quadrilateral.js';

export default class QuadrilateralSideLabel extends EnumerationValue {
  public static readonly SIDE_AB = new QuadrilateralSideLabel();
  public static readonly SIDE_BC = new QuadrilateralSideLabel();
  public static readonly SIDE_CD = new QuadrilateralSideLabel();
  public static readonly SIDE_DA = new QuadrilateralSideLabel();

  public static readonly enumeration = new Enumeration( QuadrilateralSideLabel );
}

quadrilateral.register( 'QuadrilateralSideLabel', QuadrilateralSideLabel );
