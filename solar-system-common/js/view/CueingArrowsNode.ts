// Copyright 2023, University of Colorado Boulder

/**
 * CueingArrowsNode is the cueing arrows used to indicate that something can be dragged in some direction.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Agustín Vallejo
 */

import { NodeTranslationOptions, Path, PathOptions } from '../../../scenery/js/imports.js';
import ArrowShape from '../../../scenery-phet/js/ArrowShape.js';
import { Shape } from '../../../kite/js/imports.js';
import optionize from '../../../phet-core/js/optionize.js';
import PickOptional from '../../../phet-core/js/types/PickOptional.js';
import solarSystemCommon from '../solarSystemCommon.js';

type SelfOptions = {
  length?: number;
  bodyRadius?: number;
};

type CueingArrowsNodeOptions = SelfOptions &
  PickOptional<PathOptions, 'fill' | 'stroke' | 'scale' | 'visibleProperty'> &
  NodeTranslationOptions;

export default class CueingArrowsNode extends Path {

  public constructor( providedOptions?: CueingArrowsNodeOptions ) {

    const options = optionize<CueingArrowsNodeOptions, SelfOptions, PathOptions>()( {

      // CueingArrowsNodeOptions
      bodyRadius: 10,
      length: 15,
      rotation: Math.PI / 4,

      // PathOptions
      fill: 'rgb( 0, 200, 0 )',
      stroke: 'black'

    }, providedOptions );

    super( createArrowsShape( options.bodyRadius, options.length ), options );

    this.localBoundsProperty.link( localBounds => {
      this.touchArea = localBounds.dilated( 5 );
      this.mouseArea = localBounds.dilated( 3 );
    } );
  }
}

//REVIEW: This looks somewhat copied from CueingArrowsNode in geometric-optics. Can we factor out cue arrow shape
//REVIEW: creation to somewhere in common code, instead of copying?
const ARROW_SHAPE_OPTIONS = {
  doubleHead: false,
  headWidth: 12,
  headHeight: 8,
  tailWidth: 3
};

function createArrowsShape( radius: number, length: number ): Shape {
  radius += 5;
  const leftArrowShape = new ArrowShape( -radius, 0, -radius - length, 0, ARROW_SHAPE_OPTIONS );
  const downArrowShape = new ArrowShape( 0, -radius, 0, -radius - length, ARROW_SHAPE_OPTIONS );
  const upArrowShape = new ArrowShape( 0, radius, 0, radius + length, ARROW_SHAPE_OPTIONS );
  const rightArrowShape = new ArrowShape( radius, 0, radius + length, 0, ARROW_SHAPE_OPTIONS );
  const shape = Shape.union( [ leftArrowShape, downArrowShape, upArrowShape, rightArrowShape ] );
  return shape;
}

solarSystemCommon.register( 'CueingArrowsNode', CueingArrowsNode );