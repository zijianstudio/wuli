// Copyright 2023, University of Colorado Boulder

/**
 * SlopeInterceptEquationAccordionBox is the equation accordion box for the 'Slope-Intercept' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import EquationAccordionBox from '../../common/view/EquationAccordionBox.js';
import graphingLines from '../../graphingLines.js';
import SlopeInterceptModel from '../model/SlopeInterceptModel.js';
import SlopeInterceptEquationNode from './SlopeInterceptEquationNode.js';

export default class SlopeInterceptEquationAccordionBox extends EquationAccordionBox {

  public constructor( model: SlopeInterceptModel, expandedProperty: Property<boolean>, tandem: Tandem ) {
    super(
      // title
      SlopeInterceptEquationNode.createGeneralFormNode(),

      // interactive equation
      new SlopeInterceptEquationNode( model.interactiveLineProperty, {
        riseRangeProperty: model.riseRangeProperty,
        runRangeProperty: model.runRangeProperty,
        yInterceptRangeProperty: model.y1RangeProperty,
        maxWidth: 400
      } ),

      // Properties
      model.interactiveLineProperty,
      model.savedLines,
      expandedProperty,

      // phet-io
      tandem
    );
  }
}

graphingLines.register( 'SlopeInterceptEquationAccordionBox', SlopeInterceptEquationAccordionBox );