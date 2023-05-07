// Copyright 2013-2022, University of Colorado Boulder

/**
 * Solution that appears in the beaker.
 * Origin is at bottom center of beaker.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { Color, Rectangle } from '../../../../scenery/js/imports.js';
import phScale from '../../phScale.js';
import Beaker from '../model/Beaker.js';
import PHScaleConstants from '../PHScaleConstants.js';

export default class SolutionNode extends Rectangle {

  public constructor( solutionVolumeProperty: TReadOnlyProperty<number>,
                      solutionColorProperty: TReadOnlyProperty<Color>,
                      beaker: Beaker,
                      modelViewTransform: ModelViewTransform2 ) {

    // PhET-iO: do not instrument. See https://github.com/phetsims/ph-scale/issues/108

    super( 0, 0, 1, 1 ); // correct size will be set below

    // Update the color of the solution, accounting for saturation.
    solutionColorProperty.link( color => {
      this.fill = color;
      this.stroke = color.darkerColor();
    } );

    // Update the amount of stuff in the beaker, based on solution total volume.
    const viewPosition = modelViewTransform.modelToViewPosition( beaker.position );
    const viewWidth = modelViewTransform.modelToViewDeltaX( beaker.size.width );
    solutionVolumeProperty.link( solutionVolume => {
      assert && assert( solutionVolume >= 0 );

      // min non-zero volume, so that the solution is visible to the user and detectable by the concentration probe
      if ( solutionVolume !== 0 && solutionVolume < PHScaleConstants.MIN_SOLUTION_VOLUME ) {
        solutionVolume = PHScaleConstants.MIN_SOLUTION_VOLUME;
      }

      // determine dimensions in model coordinates
      const solutionHeight = Utils.linear( 0, beaker.volume, 0, beaker.size.height, solutionVolume ); // solutionVolume -> height

      // convert to view coordinates and create shape
      const viewHeight = modelViewTransform.modelToViewDeltaY( solutionHeight );

      // shape
      this.setRect( viewPosition.x - ( viewWidth / 2 ), viewPosition.y - viewHeight, viewWidth, viewHeight );
    } );
  }
}

phScale.register( 'SolutionNode', SolutionNode );