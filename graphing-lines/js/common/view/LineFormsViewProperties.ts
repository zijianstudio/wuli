// Copyright 2013-2023, University of Colorado Boulder

/**
 * Properties that are specific to subtypes of LineFormsView as well as graphing-quadratics
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import graphingLines from '../../graphingLines.js';

export default class LineFormsViewProperties {

  // determines whether all lines are visible on the graph
  public readonly linesVisibleProperty: Property<boolean>;

  // determines whether the grid is visible on the graph
  public readonly gridVisibleProperty: Property<boolean>;

  // determines whether the interactive line is visible in the control panel
  public readonly interactiveEquationVisibleProperty: Property<boolean>;

  // determines whether the slope tool is visible on the graph
  public readonly slopeToolVisibleProperty: Property<boolean>;

  public constructor() {
    this.linesVisibleProperty = new BooleanProperty( true );
    this.gridVisibleProperty = new BooleanProperty( true );
    this.interactiveEquationVisibleProperty = new BooleanProperty( true );
    this.slopeToolVisibleProperty = new BooleanProperty( true );
  }

  public reset(): void {
    this.linesVisibleProperty.reset();
    this.gridVisibleProperty.reset();
    this.interactiveEquationVisibleProperty.reset();
    this.slopeToolVisibleProperty.reset();
  }
}

graphingLines.register( 'LineFormsViewProperties', LineFormsViewProperties );