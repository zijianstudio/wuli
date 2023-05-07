// Copyright 2013-2023, University of Colorado Boulder

/**
 * Model for the 'Slope' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../../dot/js/Range.js';
import Property from '../../../../axon/js/Property.js';
import GLColors from '../../common/GLColors.js';
import Line from '../../common/model/Line.js';
import LineFormsModel from '../../common/model/LineFormsModel.js';
import graphingLines from '../../graphingLines.js';
import SlopeParameterRange from './SlopeParameterRange.js';
import Tandem from '../../../../tandem/js/Tandem.js';

export default class SlopeModel extends LineFormsModel {

  // Ranges of the points that define a line
  public readonly x1RangeProperty: Property<Range>;
  public readonly y1RangeProperty: Property<Range>;
  public readonly x2RangeProperty: Property<Range>;
  public readonly y2RangeProperty: Property<Range>;

  public constructor( tandem: Tandem ) {

    super( new Line( 1, 2, 3, 4, GLColors.INTERACTIVE_LINE ), tandem );

    this.x1RangeProperty = new Property( this.graph.xRange );
    this.y1RangeProperty = new Property( this.graph.yRange );
    this.x2RangeProperty = new Property( this.graph.xRange );
    this.y2RangeProperty = new Property( this.graph.yRange );

    // Dynamically adjust ranges so that variables are constrained to the bounds of the graph.
    // unlink unnecessary because SlopeModel exists for the lifetime of the sim.
    const parameterRange = new SlopeParameterRange();
    this.interactiveLineProperty.link( line => {
      this.x1RangeProperty.value = parameterRange.x1( line, this.graph );
      this.y1RangeProperty.value = parameterRange.y1( line, this.graph );
      this.x2RangeProperty.value = parameterRange.x2( line, this.graph );
      this.y2RangeProperty.value = parameterRange.y2( line, this.graph );
    } );
  }
}

graphingLines.register( 'SlopeModel', SlopeModel );