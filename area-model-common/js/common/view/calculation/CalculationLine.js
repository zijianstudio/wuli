// Copyright 2018-2023, University of Colorado Boulder

/**
 * A single calculation line (for the display of the calculation panel/box)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import areaModelCommon from '../../../areaModelCommon.js';
import AreaModelCommonConstants from '../../AreaModelCommonConstants.js';
import OrientationPair from '../../model/OrientationPair.js';
import AreaModelCommonColors from '../AreaModelCommonColors.js';
import CalculationGroup from './CalculationGroup.js';
import Minus from './Minus.js';
import MultiplyX from './MultiplyX.js';
import Parentheses from './Parentheses.js';
import PlaceholderBox from './PlaceholderBox.js';
import Plus from './Plus.js';
import QuestionMark from './QuestionMark.js';
import TermText from './TermText.js';

class CalculationLine {
  /**
   * @param {number} index
   * @param {OrientationPair.<Property.<Color>>} colorProperties
   * @param {Property.<number|null>} activeIndexProperty
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed
   * @param {boolean} isProportional - Whether the area is shown as proportional (instead of generic)
   */
  constructor( index, colorProperties, activeIndexProperty, allowExponents, isProportional ) {
    assert && assert( typeof index === 'number' );

    // @public {Node|null} - The {Node}, if provided, should have a `node.clean()` method to release references
    // (usually freeing it to a pool) and a `node.accessibleText` {string} representing the description of the line.
    // Filled in later, should be non-null outside CalculationLine usage.
    this.node = null;

    // @public {number}
    this.index = index;

    // @public {CalculationLine|null} - Linked-list support for easy traversal through lines
    this.previousLine = null;
    this.nextLine = null;

    // @private {boolean}
    this.allowExponents = allowExponents;
    this.isProportional = isProportional;

    // @private {Property.<boolean>}
    this.isActiveProperty = new DerivedProperty( [ activeIndexProperty ], activeIndex => activeIndex === null || activeIndex === index );

    // @private {Property.<Color>}
    this.baseColorProperty = new DerivedProperty( [
      this.isActiveProperty,
      AreaModelCommonColors.calculationActiveProperty,
      AreaModelCommonColors.calculationInactiveProperty
    ], ( isActive, activeColor, inactiveColor ) => isActive ? activeColor : inactiveColor, {
      valueComparisonStrategy: 'equalsFunction'
    } );

    // @private {OrientationPair.<Property.<Color>>}
    this.orientedColorProperties = OrientationPair.create( orientation => new DerivedProperty( [
      this.isActiveProperty,
      colorProperties.get( orientation ),
      AreaModelCommonColors.calculationInactiveProperty
    ], ( isActive, activeColor, inactiveColor ) => isActive ? activeColor : inactiveColor, {
      valueComparisonStrategy: 'equalsFunction'
    } ) );
  }

  /**
   * Creates a TermText with the baseColor.
   * @public
   *
   * @param {TermList|Term} term
   * @param {boolean} excludeSign
   * @returns {TermText}
   */
  baseTermText( term, excludeSign ) {
    assert && assert( typeof excludeSign === 'boolean' );

    return TermText.createFromPool( term, this.baseColorProperty, excludeSign );
  }

  /**
   * Creates a TermText with the color of a specific orientation.
   * @public
   *
   * @param {Orientation} orientation
   * @param {TermList|Term} term
   * @returns {TermText}
   */
  orientedTermText( orientation, term ) {
    return TermText.createFromPool( term, this.orientedColorProperties.get( orientation ), false );
  }

  /**
   * Creates a PlaceholderBox with the color of a specific orientation.
   * @public
   *
   * @param {Orientation} orientation
   * @returns {PlaceholderBox}
   */
  orientedPlaceholderBox( orientation ) {
    return PlaceholderBox.createFromPool( this.orientedColorProperties.get( orientation ), this.allowExponents );
  }

  /**
   * Creates a MultiplyX with the specified content.
   * @public
   *
   * @param {Node} leftContent
   * @param {Node} rightContent
   * @returns {MultiplyX}
   */
  multiplyX( leftContent, rightContent ) {
    return MultiplyX.createFromPool( leftContent, rightContent, this.baseColorProperty );
  }

  /**
   * Creates a Parentheses with the specified content.
   * @public
   *
   * @param {Node} content
   * @returns {Parentheses}
   */
  parentheses( content ) {
    return Parentheses.createFromPool( content, this.baseColorProperty );
  }

  /**
   * Creates a QuestionMark
   * @public
   *
   * @returns {QuestionMark}
   */
  questionMark() {
    return QuestionMark.createFromPool( this.baseColorProperty );
  }

  /**
   * Creates a Plus
   * @public
   *
   * @returns {Plus}
   */
  plus() {
    return Plus.createFromPool( this.baseColorProperty );
  }

  /**
   * Creates a Minus
   * @public
   *
   * @returns {Minus}
   */
  minus() {
    return Minus.createFromPool( this.baseColorProperty );
  }

  /**
   * Creates a calculation group.
   * @public
   *
   * @param {Array.<Node>} nodes
   * @param {number} spacing
   * @returns {Parentheses}
   */
  group( nodes, spacing ) {
    return CalculationGroup.createFromPool( nodes, spacing );
  }

  /**
   * Returns the grouping of all nodes provided, with plusses in-between each node.
   * @public
   *
   * @param {Array.<Node>} nodes
   * @returns {Node}
   */
  sumGroup( nodes ) {
    return this.group( _.flatten( nodes.map( ( node, index ) => index > 0 ? [ this.plus(), node ] : [ node ] ) ), AreaModelCommonConstants.CALCULATION_OP_PADDING );
  }

  /**
   * Returns a grouping of all (oriented) terms provided, with plusses in-between each term.
   * @public
   *
   * @param {Array.<Term>} terms
   * @param {Orientation} orientation
   * @returns {Node}
   */
  sumOrientedTerms( terms, orientation ) {
    return this.sumGroup( terms.map( term => this.orientedTermText( orientation, term ) ) );
  }

  /**
   * Returns a grouping of all (non-oriented) terms, with plusses/minuses in-between each term (depending on the sign)
   * @public
   *
   * @param {Array.<Term>} terms
   * @returns {Node}
   */
  sumOrDifferenceOfTerms( terms ) {
    return this.group( _.flatten( terms.map( ( term, index ) => {
      const result = [];

      if ( index > 0 ) {
        result.push( term.coefficient >= 0 ? this.plus() : this.minus() );
      }

      result.push( this.baseTermText( term, index > 0 ) );

      return result;
    } ) ), AreaModelCommonConstants.CALCULATION_OP_PADDING );
  }

  /**
   * Returns a grouping of all (oriented) terms provided, with plusses in-between each term (negative grouped in
   * parentheses).
   * @public
   *
   * @param {Array.<Term>} terms
   * @returns {Node}
   */
  sumWithNegativeParens( terms ) {
    return this.sumGroup( terms.map( term => {
      let text = this.baseTermText( term, false );
      if ( term.coefficient < 0 ) {
        text = this.parentheses( text );
      }
      return text;
    } ) );
  }

  /**
   * Returns an array with this lines (and any previous/next lines) in the correct order (up to 3 lines).
   * @public
   *
   * @returns {Array.<CalculationLine>}
   */
  getAdjacentLines() {
    const result = [];
    if ( this.previousLine ) {
      result.push( this.previousLine );
    }
    result.push( this );
    if ( this.nextLine ) {
      result.push( this.nextLine );
    }
    return result;
  }

  /**
   * Removes external references.
   * @public
   */
  dispose() {
    this.node.clean();

    this.orientedColorProperties.horizontal.dispose();
    this.orientedColorProperties.vertical.dispose();
    this.baseColorProperty.dispose();
    this.isActiveProperty.dispose();
  }

}

// @public {number} - Calculation line indices. Each individual type of line will have an index value in the order
// it would show up in the calculation panel. This index is used to determine what the "active" line is (for the
// line-by-line view), so that when updating the calculation it can attempt to stay on the same active line.
CalculationLine.TOTALS_LINE_INDEX = 0;
CalculationLine.EXPANDED_LINE_INDEX = 1;
CalculationLine.DISTRIBUTION_LINE_INDEX = 2;
CalculationLine.MULTIPLIED_LINE_INDEX = 3;
CalculationLine.ORDERED_LINE_INDEX = 4;
CalculationLine.MINUSES_LINE_INDEX = 5;
CalculationLine.SUM_LINE_INDEX = 6;

areaModelCommon.register( 'CalculationLine', CalculationLine );

export default CalculationLine;