// Copyright 2018-2023, University of Colorado Boulder

/**
 * Strings for mathematical symbols, with markup for RichText.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import MathSymbolFont from '../../../scenery-phet/js/MathSymbolFont.js';
import graphingLines from '../graphingLines.js';
import GraphingLinesStrings from '../GraphingLinesStrings.js';

const GLSymbols = {
  b: MathSymbolFont.getRichTextMarkup( GraphingLinesStrings.symbol.intercept ),
  m: MathSymbolFont.getRichTextMarkup( GraphingLinesStrings.symbol.slope ),
  x: MathSymbolFont.getRichTextMarkup( GraphingLinesStrings.symbol.x ),
  y: MathSymbolFont.getRichTextMarkup( GraphingLinesStrings.symbol.y )
};

graphingLines.register( 'GLSymbols', GLSymbols );

export default GLSymbols;