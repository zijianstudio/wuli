// Copyright 2013-2022, University of Colorado Boulder

/**
 * The level indicator shows triangles to the left and right of the plank to
 * help indicate whether the plank is at exactly 0 degrees.
 *
 * @author John Blanco
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import Transform3 from '../../../../dot/js/Transform3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import balancingAct from '../../balancingAct.js';
import Plank from '../model/Plank.js';

// constants
const PLANK_TO_INDICATOR_SPACING = 5;
const LEVEL_FILL_COLOR = 'rgb( 173, 255, 47 )';
const NON_LEVEL_FILL_COLOR = 'rgb( 230, 230, 230 )';

class LevelIndicatorNode extends Node {

  /**
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Plank} plank
   */
  constructor( modelViewTransform, plank ) {
    super();

    // Positions for left and right edge
    const leftEdgeOfPlank = modelViewTransform.modelToViewPosition( new Vector2(
      plank.pivotPoint.x - Plank.LENGTH / 2,
      plank.getPlankSurfaceCenter().y
    ) );
    const rightEdgeOfPlank = modelViewTransform.modelToViewPosition( new Vector2(
      plank.pivotPoint.x + Plank.LENGTH / 2,
      plank.getPlankSurfaceCenter().y
    ) );

    // Draw a sort of arrow head shape.
    const leftIndicatorShape = new Shape().moveTo( 0, 0 ).lineTo( -25, -10 ).lineTo( -20, 0 ).lineTo( -25, 10 ).close();

    //Create paths for left and right side
    const leftLevelIndicatorNode = new Path( leftIndicatorShape,
      {
        stroke: 'black',
        right: leftEdgeOfPlank.x - PLANK_TO_INDICATOR_SPACING,
        centerY: leftEdgeOfPlank.y
      } );
    this.addChild( leftLevelIndicatorNode );

    const reflectTransform = new Transform3( Matrix3.scaling( -1, 1 ) );
    const rightIndicatorShape = reflectTransform.transformShape( leftIndicatorShape );
    const rightLevelIndicatorNode = new Path( rightIndicatorShape,
      {
        stroke: 'black',
        left: rightEdgeOfPlank.x + PLANK_TO_INDICATOR_SPACING,
        centerY: rightEdgeOfPlank.y
      } );
    this.addChild( rightLevelIndicatorNode );

    //Highlight if the plank is level
    plank.tiltAngleProperty.link( tiltAngle => {
      if ( Math.abs( tiltAngle ) < Math.PI / 1000 ) {
        leftLevelIndicatorNode.fill = LEVEL_FILL_COLOR;
        rightLevelIndicatorNode.fill = LEVEL_FILL_COLOR;
      }
      else {
        leftLevelIndicatorNode.fill = NON_LEVEL_FILL_COLOR;
        rightLevelIndicatorNode.fill = NON_LEVEL_FILL_COLOR;
      }
    } );
  }
}

balancingAct.register( 'LevelIndicatorNode', LevelIndicatorNode );

export default LevelIndicatorNode;
