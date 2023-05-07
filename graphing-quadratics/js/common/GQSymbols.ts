// Copyright 2018-2023, University of Colorado Boulder

/**
 * Strings for mathematical symbols, with markup for RichText.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import MathSymbolFont from '../../../scenery-phet/js/MathSymbolFont.js';
import graphingQuadratics from '../graphingQuadratics.js';
import GraphingQuadraticsStrings from '../GraphingQuadraticsStrings.js';

const x = MathSymbolFont.getRichTextMarkup( GraphingQuadraticsStrings.x );

const GQSymbols = {
  a: MathSymbolFont.getRichTextMarkup( GraphingQuadraticsStrings.a ),
  b: MathSymbolFont.getRichTextMarkup( GraphingQuadraticsStrings.b ),
  c: MathSymbolFont.getRichTextMarkup( GraphingQuadraticsStrings.c ),
  h: MathSymbolFont.getRichTextMarkup( GraphingQuadraticsStrings.h ),
  k: MathSymbolFont.getRichTextMarkup( GraphingQuadraticsStrings.k ),
  p: MathSymbolFont.getRichTextMarkup( GraphingQuadraticsStrings.p ),
  x: x,
  xSquared: `${x}<sup>2</sup>`,
  y: MathSymbolFont.getRichTextMarkup( GraphingQuadraticsStrings.y )
};

graphingQuadratics.register( 'GQSymbols', GQSymbols );
export default GQSymbols;