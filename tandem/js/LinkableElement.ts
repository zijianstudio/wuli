// Copyright 2023, University of Colorado Boulder
import PhetioObject from './PhetioObject.js';

/**
 * When linking a PhET-iO Element via PhetioObject.addLinkedElement it uses this type.
 * @see PhetioObject.addLinkedElement
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
type LinkableElement = Pick<PhetioObject, 'phetioFeatured' | 'isPhetioInstrumented'>;
export default LinkableElement;