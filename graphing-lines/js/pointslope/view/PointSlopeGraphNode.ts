// Copyright 2013-2023, University of Colorado Boulder

/**
 * Graph that provides direct manipulation of a line in point-slope form.
 * Extends the base type by adding manipulators for point and slope.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import LineFormsGraphNode from '../../common/view/LineFormsGraphNode.js';
import SlopeManipulator from '../../common/view/manipulator/SlopeManipulator.js';
import X1Y1Manipulator from '../../common/view/manipulator/X1Y1Manipulator.js';
import graphingLines from '../../graphingLines.js';
import PointSlopeEquationNode from './PointSlopeEquationNode.js';
import PointSlopeModel from '../model/PointSlopeModel.js';
import LineFormsViewProperties from '../../common/view/LineFormsViewProperties.js';

export default class PointSlopeGraphNode extends LineFormsGraphNode {

  public constructor( model: PointSlopeModel, viewProperties: LineFormsViewProperties ) {

    super( model, viewProperties, PointSlopeEquationNode.createDynamicLabel );

    const manipulatorRadius = model.modelViewTransform.modelToViewDeltaX( model.manipulatorRadius );

    // (x1,y1) point manipulator
    const x1y1Manipulator = new X1Y1Manipulator(
      manipulatorRadius, model.interactiveLineProperty, model.x1RangeProperty, model.y1RangeProperty, model.modelViewTransform, true /* constantSlope */ );

    // slope manipulator
    const slopeManipulator = new SlopeManipulator(
      manipulatorRadius, model.interactiveLineProperty, model.riseRangeProperty, model.runRangeProperty, model.modelViewTransform );

    // rendering order
    this.addChild( x1y1Manipulator );
    this.addChild( slopeManipulator );

    // visibility of manipulators
    // unlink unnecessary because PointSlopeGraphNode exists for the lifetime of the sim.
    viewProperties.linesVisibleProperty.link( linesVisible => {
      x1y1Manipulator.visible = slopeManipulator.visible = linesVisible;
    } );
  }
}

graphingLines.register( 'PointSlopeGraphNode', PointSlopeGraphNode );