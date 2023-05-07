// Copyright 2013-2023, University of Colorado Boulder

/**
 * Model for the 'Slope-Intercept' screen.
 * This is a specialization of the Point-Slope model.
 * x1 is fixed at zero, so that y1 is synonymous with y-intercept.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import GLColors from '../../common/GLColors.js';
import Line from '../../common/model/Line.js';
import graphingLines from '../../graphingLines.js';
import PointSlopeModel from '../../pointslope/model/PointSlopeModel.js';
import SlopeInterceptParameterRange from './SlopeInterceptParameterRange.js';

export default class SlopeInterceptModel extends PointSlopeModel {
  public constructor( tandem: Tandem ) {
    super( tandem, Line.createSlopeIntercept( 2, 3, 1, GLColors.INTERACTIVE_LINE ), new SlopeInterceptParameterRange() );
  }
}

graphingLines.register( 'SlopeInterceptModel', SlopeInterceptModel );