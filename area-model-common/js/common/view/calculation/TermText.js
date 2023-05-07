// Copyright 2018-2023, University of Colorado Boulder

/**
 * A poolable RichText for a Term with a colorProperty fill.
 *
 * This is pooled for performance, as recreating the view structure had unacceptable performance/GC characteristics.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ReadOnlyProperty from '../../../../../axon/js/ReadOnlyProperty.js';
import Poolable from '../../../../../phet-core/js/Poolable.js';
import { RichText } from '../../../../../scenery/js/imports.js';
import areaModelCommon from '../../../areaModelCommon.js';
import AreaModelCommonConstants from '../../AreaModelCommonConstants.js';
import Term from '../../model/Term.js';
import TermList from '../../model/TermList.js';

class TermText extends RichText {
  /**
   * @param {TermList|Term} term
   * @param {Property.<Color>} colorProperty
   * @param {boolean} excludeSign
   */
  constructor( term, colorProperty, excludeSign ) {
    super( ' ', {
      font: AreaModelCommonConstants.CALCULATION_TERM_FONT,

      // pdom
      tagName: 'mn',
      pdomNamespace: 'http://www.w3.org/1998/Math/MathML'
    } );

    this.initialize( term, colorProperty, excludeSign );

  }

  /**
   * @public
   *
   * @param {TermList|Term} term
   * @param {Property.<Color>} colorProperty
   * @param {boolean} excludeSign
   */
  initialize( term, colorProperty, excludeSign ) {
    assert && assert( term instanceof Term || term instanceof TermList );
    assert && assert( colorProperty instanceof ReadOnlyProperty );
    assert && assert( typeof excludeSign === 'boolean' || excludeSign === undefined );

    const text = excludeSign ? term.toNoSignRichString() : term.toRichString( false );

    // @public {string}
    this.accessibleText = text;

    this.mutate( {
      string: text,
      fill: colorProperty,
      innerContent: text
    } );
  }

  /**
   * Clears the state of this node (releasing references) so it can be freed to the pool (and potentially GC'ed).
   * @public
   */
  clean() {
    this.fill = null;
    this.freeToPool();
  }
}

areaModelCommon.register( 'TermText', TermText );

Poolable.mixInto( TermText );

export default TermText;