// Copyright 2019-2022, University of Colorado Boulder

/**
 * ComparisonStatementAccordionBox is an accordion box that contains a "comparison statement", which is a mathematical
 * statement comparing up to three values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import NLCConstants from '../../../../number-line-common/js/common/NLCConstants.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import numberLineIntegers from '../../numberLineIntegers.js';
import NumberLineIntegersStrings from '../../NumberLineIntegersStrings.js';
import ComparisonStatementNode from './ComparisonStatementNode.js';

const comparisonStatementString = NumberLineIntegersStrings.comparisonStatement;

// constants
const TITLE_FONT = new PhetFont( 18 );
const COMPARISON_STATEMENT_BOX_WIDTH = 340; // empirically determined to look decent
const DEFAULT_OPTIONS = {
  contentAlign: 'right',
  minWidth: COMPARISON_STATEMENT_BOX_WIDTH,
  maxWidth: COMPARISON_STATEMENT_BOX_WIDTH
};

class ComparisonStatementAccordionBox extends AccordionBox {

  /**
   * @param {NumberLine} numberLine - the number line whose point values are being depicted
   * @param {Object} [options]
   * @public
   */
  constructor( numberLine, options ) {

    // Create the comparison statement node.
    const comparisonStatementNode = new ComparisonStatementNode( numberLine );

    // Embed the comparison statement in an accordion box.
    super( comparisonStatementNode, merge( {}, DEFAULT_OPTIONS, options, NLCConstants.ACCORDION_BOX_COMMON_OPTIONS, {
      titleNode: new Text( comparisonStatementString, {
        font: TITLE_FONT,
        maxWidth: COMPARISON_STATEMENT_BOX_WIDTH * 0.8
      } )
    } ) );

    // @public (read-only) - make the comparison statement node visible to clients
    this.comparisonStatementNode = comparisonStatementNode;
  }

  /**
   * @public
   */
  reset() {
    this.comparisonStatementNode.selectedOperatorProperty.reset();
    this.expandedProperty.reset();
  }
}

numberLineIntegers.register( 'ComparisonStatementAccordionBox', ComparisonStatementAccordionBox );
export default ComparisonStatementAccordionBox;
