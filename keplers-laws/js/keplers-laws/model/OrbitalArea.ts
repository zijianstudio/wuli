// Copyright 2023, University of Colorado Boulder

/**
 *
 * @author Agustín Vallejo
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import keplersLaws from '../../keplersLaws.js';

export default class OrbitalArea {
  public dotPosition = Vector2.ZERO; // Position of the dot in the orbital area
  public startPosition = Vector2.ZERO; // Start position of the orbital area
  public endPosition = Vector2.ZERO; // End position of the orbital area
  public startAngle = 0;
  public endAngle = 0;
  public completion = 0; // Proportional completion of the orbital area
  public sweptArea = 0;
  public insideProperty = new BooleanProperty( false );
  public alreadyEntered = false;
  public active = false;
  public resetted = true;

  public constructor() {
    // noop
  }

  public reset(): void {
    this.dotPosition = Vector2.ZERO;
    this.startPosition = Vector2.ZERO;
    this.endPosition = Vector2.ZERO;
    this.startAngle = 0;
    this.endAngle = 0;
    this.completion = 0;
    this.sweptArea = 0;
    this.insideProperty.reset();
    this.alreadyEntered = false;
    this.active = false;
    this.resetted = true;
  }
}

keplersLaws.register( 'OrbitalArea', OrbitalArea );