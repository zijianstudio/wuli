// Copyright 2020-2022, University of Colorado Boulder

/**
 * A custom slider thumb (that appears like our wavelength sliders) with a thin line on the actual slider track.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Shape } from '../../../../kite/js/imports.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { TPaint, Line, Node, NodeOptions, Path } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

type SelfOptions = {
  thumbFill?: TPaint;
  thumbStroke?: TPaint;

  mainHeight?: number;
  taperHeight?: number;
  thumbWidth?: number;
  lineHeight?: number;
  touchXDilation?: number;
  touchYDilation?: number;
};
export type PrecisionSliderThumbOptions = NodeOptions & SelfOptions;

export default class PrecisionSliderThumb extends Node {
  public constructor( providedOptions?: PrecisionSliderThumbOptions ) {
    const options = optionize<PrecisionSliderThumbOptions, SelfOptions, NodeOptions>()( {
      thumbFill: '#eee',
      thumbStroke: '#000',
      mainHeight: 15,
      taperHeight: 5,
      thumbWidth: 15,
      lineHeight: 5,
      touchXDilation: 5,
      touchYDilation: 10
    }, providedOptions );

    const precisionLine = new Line( 0, -options.lineHeight / 2, 0, options.lineHeight / 2, {
      stroke: options.thumbStroke
    } );

    const thumbShape = new Shape().moveTo( 0, options.lineHeight / 2 )
      .lineToRelative( options.thumbWidth / 2, options.taperHeight )
      .lineToRelative( 0, options.mainHeight )
      .lineToRelative( -options.thumbWidth, 0 )
      .lineToRelative( 0, -options.mainHeight )
      .close();

    const thumbPath = new Path( thumbShape, {
      fill: options.thumbFill,
      stroke: options.thumbStroke
    } );

    options.children = [
      precisionLine,
      thumbPath
    ];

    super( options );

    this.touchArea = this.localBounds.dilatedXY( options.touchXDilation, options.touchYDilation );
  }
}

densityBuoyancyCommon.register( 'PrecisionSliderThumb', PrecisionSliderThumb );
