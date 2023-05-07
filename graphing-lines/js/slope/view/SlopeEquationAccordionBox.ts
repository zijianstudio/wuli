// Copyright 2023, University of Colorado Boulder

/**
 * SlopeEquationAccordionBox is the equation accordion box for the 'Slope' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import EquationAccordionBox from '../../common/view/EquationAccordionBox.js';
import graphingLines from '../../graphingLines.js';
import SlopeModel from '../model/SlopeModel.js';
import SlopeEquationNode from './SlopeEquationNode.js';

export default class SlopeEquationAccordionBox extends EquationAccordionBox {

  public constructor( model: SlopeModel, expandedProperty: Property<boolean>, tandem: Tandem ) {
    super(
      // title
      SlopeEquationNode.createGeneralFormNode(),

      // interactive equation
      new SlopeEquationNode( model.interactiveLineProperty, {
        x1RangeProperty: model.x1RangeProperty,
        y1RangeProperty: model.y1RangeProperty,
        x2RangeProperty: model.x2RangeProperty,
        y2RangeProperty: model.y2RangeProperty,
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

graphingLines.register( 'SlopeEquationAccordionBox', SlopeEquationAccordionBox );