// Copyright 2013-2023, University of Colorado Boulder

/**
 * View for the 'Slope-Intercept' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import GraphControlPanel from '../../common/view/GraphControlPanel.js';
import LineFormsScreenView from '../../common/view/LineFormsScreenView.js';
import LineFormsViewProperties from '../../common/view/LineFormsViewProperties.js';
import graphingLines from '../../graphingLines.js';
import SlopeInterceptModel from '../model/SlopeInterceptModel.js';
import SlopeInterceptGraphNode from './SlopeInterceptGraphNode.js';
import SlopeInterceptEquationAccordionBox from './SlopeInterceptEquationAccordionBox.js';

export default class SlopeInterceptScreenView extends LineFormsScreenView {

  public constructor( model: SlopeInterceptModel, tandem: Tandem ) {

    const viewProperties = new LineFormsViewProperties();

    const graphNode = new SlopeInterceptGraphNode( model, viewProperties );

    const graphControlPanel = new GraphControlPanel( viewProperties.gridVisibleProperty,
      viewProperties.slopeToolVisibleProperty, model.standardLines );

    const equationAccordionBox = new SlopeInterceptEquationAccordionBox( model,
      viewProperties.interactiveEquationVisibleProperty, tandem.createTandem( 'equationAccordionBox' ) );

    super( model, viewProperties, graphNode, graphControlPanel, equationAccordionBox, tandem );
  }
}

graphingLines.register( 'SlopeInterceptScreenView', SlopeInterceptScreenView );