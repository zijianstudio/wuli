// Copyright 2023, University of Colorado Boulder

/**
 * PointSlopeEquationAccordionBox is the equation accordion box for the 'Point-Slope' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import EquationAccordionBox from '../../common/view/EquationAccordionBox.js';
import graphingLines from '../../graphingLines.js';
import PointSlopeModel from '../model/PointSlopeModel.js';
import PointSlopeEquationNode from './PointSlopeEquationNode.js';

export default class PointSlopeEquationAccordionBox extends EquationAccordionBox {

  public constructor( model: PointSlopeModel, expandedProperty: Property<boolean>, tandem: Tandem ) {
    super(
      // title
      PointSlopeEquationNode.createGeneralFormNode(),

      // interactive equation
      new PointSlopeEquationNode( model.interactiveLineProperty, {
        x1RangeProperty: model.x1RangeProperty,
        y1RangeProperty: model.y1RangeProperty,
        riseRangeProperty: model.riseRangeProperty,
        runRangeProperty: model.runRangeProperty,
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

graphingLines.register( 'PointSlopeEquationAccordionBox', PointSlopeEquationAccordionBox );