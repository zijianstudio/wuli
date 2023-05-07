// Copyright 2013-2023, University of Colorado Boulder

/**
 * Model for the 'Point-Slope' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../../dot/js/Range.js';
import Property from '../../../../axon/js/Property.js';
import GLColors from '../../common/GLColors.js';
import Line from '../../common/model/Line.js';
import LineFormsModel from '../../common/model/LineFormsModel.js';
import graphingLines from '../../graphingLines.js';
import PointSlopeParameterRange from './PointSlopeParameterRange.js';
import Tandem from '../../../../tandem/js/Tandem.js';

export default class PointSlopeModel extends LineFormsModel {

  // Ranges of the point
  public readonly x1RangeProperty: Property<Range>;
  public readonly y1RangeProperty: Property<Range>;

  // Ranges of the slope = rise / run
  public readonly riseRangeProperty: Property<Range>;
  public readonly runRangeProperty: Property<Range>;

  public constructor( tandem: Tandem, providedInteractiveLine?: Line, providedParameterRange?: PointSlopeParameterRange ) {

    const interactiveLine = providedInteractiveLine || Line.createPointSlope( 1, 2, 3, 4, GLColors.INTERACTIVE_LINE );
    const parameterRange = providedParameterRange || new PointSlopeParameterRange();

    super( interactiveLine, tandem );

    this.x1RangeProperty = new Property( this.graph.xRange );
    this.y1RangeProperty = new Property( this.graph.yRange );
    this.riseRangeProperty = new Property( this.graph.yRange );
    this.runRangeProperty = new Property( this.graph.xRange );

    // Dynamically adjust ranges so that variables are constrained to the bounds of the graph.
    // unlink unnecessary because PointSlopeModel exists for the lifetime of the sim.
    this.interactiveLineProperty.link( line => {
      this.x1RangeProperty.value = parameterRange.x1( line, this.graph );
      this.y1RangeProperty.value = parameterRange.y1( line, this.graph );
      this.riseRangeProperty.value = parameterRange.rise( line, this.graph );
      this.runRangeProperty.value = parameterRange.run( line, this.graph );
    } );
  }
}

graphingLines.register( 'PointSlopeModel', PointSlopeModel );