// Copyright 2013-2022, University of Colorado Boulder

/**
 * Atoms look like shaded spheres.
 * Origin is at geometric center of bounding rectangle.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import ShadedSphereNode, { ShadedSphereNodeOptions } from '../../../scenery-phet/js/ShadedSphereNode.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';

// constants
const RATE_OF_CHANGE = 0.75; // >0 and <1, increase this to make small atoms appear smaller
const MAX_RADIUS = Element.P.covalentRadius; // not actually the maximum, but this is a constant from the previous version
const MODEL_TO_VIEW_SCALE = 0.11;

type SelfOptions = EmptySelfOptions;
export type AtomNodeOptions = SelfOptions & ShadedSphereNodeOptions;

export default class AtomNode extends ShadedSphereNode {

  public constructor( element: Element, providedOptions?: AtomNodeOptions ) {

    const options = optionize<AtomNodeOptions, SelfOptions, ShadedSphereNodeOptions>()( {
      mainColor: element.color
    }, providedOptions );

    super( 2 * scaleRadius( element.covalentRadius ), options );
  }
}

/*
 * There is a large difference between the radii of the smallest and largest atoms.
 * This function adjusts scaling so that the difference is still noticeable, but not as large.
 */
function scaleRadius( radius: number ): number {
  const adjustedRadius = ( MAX_RADIUS - RATE_OF_CHANGE * ( MAX_RADIUS - radius ) );
  return MODEL_TO_VIEW_SCALE * adjustedRadius;
}

nitroglycerin.register( 'AtomNode', AtomNode );