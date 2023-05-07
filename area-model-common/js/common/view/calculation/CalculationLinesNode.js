// Copyright 2018-2022, University of Colorado Boulder

/**
 * Handling for creating all calculation lines for a given area/etc.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../../axon/js/DynamicProperty.js';
import Emitter from '../../../../../axon/js/Emitter.js';
import Property from '../../../../../axon/js/Property.js';
import Orientation from '../../../../../phet-core/js/Orientation.js';
import { Node, VBox } from '../../../../../scenery/js/imports.js';
import areaModelCommon from '../../../areaModelCommon.js';
import AreaModelCommonStrings from '../../../AreaModelCommonStrings.js';
import AreaModelCommonQueryParameters from '../../AreaModelCommonQueryParameters.js';
import AreaCalculationChoice from '../../model/AreaCalculationChoice.js';
import TermList from '../../model/TermList.js';
import DistributionLine from './DistributionLine.js';
import ExpandedLine from './ExpandedLine.js';
import MinusesLine from './MinusesLine.js';
import MultipliedLine from './MultipliedLine.js';
import OrderedLine from './OrderedLine.js';
import QuestionMarkLine from './QuestionMarkLine.js';
import SumLine from './SumLine.js';
import TotalsLine from './TotalsLine.js';

const betweenCalculationLinesString = AreaModelCommonStrings.a11y.betweenCalculationLines;

class CalculationLinesNode extends Node {
  /**
   * @param {AreaModelCommonModel} model
   */
  constructor( model ) {

    super();

    // @private {Node}
    this.box = new VBox( {
      spacing: 1
    } );
    this.addChild( this.box );

    if ( !AreaModelCommonQueryParameters.rawMath ) {
      this.pdomNamespace = 'http://www.w3.org/1998/Math/MathML';
      this.tagName = 'math';

      this.box.pdomNamespace = 'http://www.w3.org/1998/Math/MathML';
      this.box.tagName = 'mtable';
    }

    // @public {Property.<boolean>} - Whether there are previous/next lines (when in line-by-line mode)
    this.previousEnabledProperty = new BooleanProperty( false );
    this.nextEnabledProperty = new BooleanProperty( false );

    // @public {Property.<Array.<CalculationLine>>} - All of our "current" lines
    this.calculationLinesProperty = new Property( [] );

    // @public {Emitter} - Fired whenever the displayed appearance has updated.
    this.displayUpdatedEmitter = new Emitter();

    // @private {AreaModelCommonModel}
    this.model = model;

    // @private {boolean} - Whether the actual CalculationLinesNode need updating.
    this.linesDirty = true;

    // @private {boolean} - Whether the display of the lines (index/visibility change) needs updating.
    this.displayDirty = true;

    // @private {Property.<number>} - The current index (for whatever area)
    this.areaIndexProperty = new DynamicProperty( model.currentAreaProperty, {
      derive: 'calculationIndexProperty',
      bidirectional: true
    } );

    // @private {Property.<number|null>} - The effective current index (for whatever area) that we will use for display
    this.effectiveIndexProperty = new DerivedProperty(
      [ this.areaIndexProperty, model.areaCalculationChoiceProperty ],
      ( index, choice ) => choice === AreaCalculationChoice.LINE_BY_LINE ? index : null );

    const setLinesDirty = () => { this.linesDirty = true; };
    const setDisplayDirty = () => { this.displayDirty = true; };

    // Listen for changes that would make the display need an update
    model.areaCalculationChoiceProperty.lazyLink( setDisplayDirty );
    this.areaIndexProperty.lazyLink( setDisplayDirty );

    // Listen for changes that would make everything need an update
    model.currentAreaProperty.link( ( newArea, oldArea ) => {
      if ( oldArea ) {
        oldArea.allPartitions.forEach( partition => {
          partition.sizeProperty.unlink( setLinesDirty );
          partition.visibleProperty.unlink( setLinesDirty );
        } );
      }

      newArea.allPartitions.forEach( partition => {
        partition.sizeProperty.lazyLink( setLinesDirty );
        partition.visibleProperty.lazyLink( setLinesDirty );
      } );

      setLinesDirty();

      this.update();
    } );
  }

  /**
   * Called whenever the calculation may need an update.
   * @public
   */
  update() {
    // Don't update anything if things are hidden
    if ( this.model.areaCalculationChoiceProperty.value === AreaCalculationChoice.HIDDEN ) {
      return;
    }

    this.updateLines();
    this.updateDisplay();
  }

  /**
   * Moves the display to the previous line.
   * @public
   */
  moveToPreviousLine() {
    const activeLine = this.getActiveLine();
    if ( activeLine.previousLine ) {
      this.areaIndexProperty.value = activeLine.previousLine.index;
    }
  }

  /**
   * Moves the display to the next line.
   * @public
   */
  moveToNextLine() {
    const activeLine = this.getActiveLine();
    if ( activeLine.nextLine ) {
      this.areaIndexProperty.value = activeLine.nextLine.index;
    }
  }

  /**
   * Removes and disposes children.
   * @private
   */
  wipe() {
    while ( this.box.children.length ) {
      this.box.children[ 0 ].dispose();
    }
  }

  /**
   * Update the internally-stored calculation lines.
   * @private
   */
  updateLines() {
    if ( !this.linesDirty ) {
      return;
    }

    // As a sanity check, just remove all children here (so we don't leak things)
    this.wipe();

    // Release line references that we had before
    this.calculationLinesProperty.value.forEach( calculationLine => {
      calculationLine.dispose();
    } );

    // Create new lines
    this.calculationLinesProperty.value = CalculationLinesNode.createLines(
      this.model.currentAreaProperty.value,
      this.effectiveIndexProperty,
      this.model.allowExponents,
      this.model.isProportional
    );

    this.linesDirty = false;
    this.displayDirty = true;
  }

  /**
   * Update the display of the calculation lines.
   * @private
   */
  updateDisplay() {
    if ( !this.displayDirty ) {
      return;
    }

    // As a sanity check, just remove all children here (so we don't leak things)
    this.wipe();

    let displayedLines = this.calculationLinesProperty.value;

    // If we are in line-by-line mode, display adjacent lines
    if ( this.model.areaCalculationChoiceProperty.value === AreaCalculationChoice.LINE_BY_LINE ) {

      const activeLine = this.getActiveLine();
      displayedLines = activeLine.getAdjacentLines();

      this.previousEnabledProperty.value = !!activeLine.previousLine;
      this.nextEnabledProperty.value = !!activeLine.nextLine;
    }
    else {
      this.previousEnabledProperty.value = false;
      this.nextEnabledProperty.value = false;
    }

    this.box.children = displayedLines.map( ( line, index ) => {
      const lineNode = new Node( {
        children: [
          line.node
        ]
      } );
      if ( AreaModelCommonQueryParameters.rawMath ) {
        lineNode.tagName = 'span';
        lineNode.innerContent = line.node.accessibleText;
        lineNode.containerTagName = 'span';
        line.node.pdomVisible = false;
      }
      else {
        lineNode.pdomNamespace = 'http://www.w3.org/1998/Math/MathML';
        lineNode.tagName = 'mtr';
      }
      if ( index > 0 ) {
        if ( AreaModelCommonQueryParameters.rawMath ) {
          lineNode.labelTagName = 'span';
          lineNode.labelContent = betweenCalculationLinesString;
        }
        else {
          lineNode.insertChild( 0, new Node( {

            // pdom
            tagName: 'mtext',
            pdomNamespace: 'http://www.w3.org/1998/Math/MathML',
            innerContent: betweenCalculationLinesString
          } ) );
        }
      }
      return lineNode;
    } );

    this.displayDirty = false;
    this.displayUpdatedEmitter.emit();
  }

  /**
   * Returns the first active line, or null otherwise.
   * @private
   *
   * @returns {CalculationLine|null}
   */
  getActiveLine() {
    let activeLine = _.find( this.calculationLinesProperty.value, line => line.isActiveProperty.value ) || null;

    // If no line is currently active (maybe it was removed?), switch to the next-best line
    if ( !activeLine ) {
      let nextBestLine = null;
      const lastIndex = this.areaIndexProperty.value;
      this.calculationLinesProperty.value.forEach( calculationLine => {
        if ( calculationLine.index <= lastIndex ) {
          nextBestLine = calculationLine;
        }
      } );

      // Update the index property to point to the correct line
      this.areaIndexProperty.value = nextBestLine.index;
      activeLine = nextBestLine;
    }

    return activeLine;
  }

  /**
   * Creates an array of calculation lines.
   * @private
   *
   * @param {Area} area
   * @param {Property.<number|null>} activeIndexProperty - null when all lines should be active
   * @param {boolean} allowExponents - Whether exponents (powers of x) are allowed
   * @param {boolean} isProportional - Whether the area is shown as proportional (instead of generic)
   * @returns {Array.<CalculationLine>}
   */
  static createLines( area, activeIndexProperty, allowExponents, isProportional ) {
    // Whether there are ANY shown partitions for a given orientation
    const horizontalEmpty = area.getDefinedPartitions( Orientation.HORIZONTAL ).length === 0;
    const verticalEmpty = area.getDefinedPartitions( Orientation.VERTICAL ).length === 0;

    // If both are empty, show a question mark
    if ( horizontalEmpty && verticalEmpty ) {
      return [ new QuestionMarkLine( area, activeIndexProperty, allowExponents, isProportional ) ];
    }
    // If only one is empty, show boxes
    else if ( horizontalEmpty || verticalEmpty ) {
      return [ new TotalsLine( area, activeIndexProperty, allowExponents, isProportional ) ];
    }

    const horizontalTermList = area.getTermList( Orientation.HORIZONTAL );
    const verticalTermList = area.getTermList( Orientation.VERTICAL );

    const horizontalTerms = horizontalTermList.terms;
    const verticalTerms = verticalTermList.terms;

    // The total/sum for each orientation
    const horizontalPolynomial = area.totalProperties.horizontal.value;
    const verticalPolynomial = area.totalProperties.vertical.value;

    // E.g. for ( 2 ) * ( 3 + x ), the result will be the terms 6 and 2x.
    const multipliedTermList = new TermList( _.flatten( verticalTerms.map( verticalTerm => horizontalTerms.map( horizontalTerm => horizontalTerm.times( verticalTerm ) ) ) ) );
    const orderedTermList = multipliedTermList.orderedByExponent();
    const totalPolynomial = area.totalAreaProperty.value;

    // Logic for what calculation lines are needed
    const needsExpansion = !allowExponents && ( !horizontalTermList.equals( horizontalPolynomial ) ||
                                                !verticalTermList.equals( verticalPolynomial ) );
    const needsDistribution = horizontalTermList.terms.length !== 1 || verticalTermList.terms.length !== 1;
    const needsMultiplied = needsDistribution && !multipliedTermList.equals( totalPolynomial );
    const needsOrdered = needsMultiplied && !orderedTermList.equals( multipliedTermList ) &&
                         !( orderedTermList.equals( totalPolynomial ) &&
                         ( !allowExponents || !orderedTermList.hasNegativeTerm() ) );
    const needsMinuses = needsMultiplied && allowExponents &&
                         orderedTermList.hasNegativeTerm() && !orderedTermList.equals( totalPolynomial );

    // Add the actual lines
    const lines = [];
    // e.g. ( -x + x^2 )( x^2 - x ) <--- example used for everything except the ExpansionLine
    lines.push( new TotalsLine( area, activeIndexProperty, allowExponents, isProportional ) );
    if ( needsExpansion ) {
      // e.g. ( -5 + 2 )( 7 + 3 ) <---- if we have a proportional one where Totals Line is e.g. -3 * 10
      lines.push( new ExpandedLine( horizontalTerms, verticalTerms, area, activeIndexProperty, allowExponents, isProportional ) );
    }
    if ( needsDistribution ) {
      // e.g. (-x)(x^2) + (-x)(-x) + (x^2)(x^2) + (x^2)(-x)
      lines.push( new DistributionLine( horizontalTerms, verticalTerms, area, activeIndexProperty, allowExponents, isProportional ) );
    }
    if ( needsMultiplied ) {
      // e.g. (-x^3) + x^2 + x^4 + (-x^3)
      lines.push( new MultipliedLine( multipliedTermList, area, activeIndexProperty, allowExponents, isProportional ) );
    }
    if ( needsOrdered ) {
      // e.g. x^4 + (-x^3) + (-x^3) + x^2
      lines.push( new OrderedLine( orderedTermList, area, activeIndexProperty, allowExponents, isProportional ) );
    }
    if ( needsMinuses ) {
      // e.g. x^4 - x^3 - x^3 + x^2
      lines.push( new MinusesLine( orderedTermList, area, activeIndexProperty, allowExponents, isProportional ) );
    }
    // e.g. x^4 - 2x^3 + x^2
    lines.push( new SumLine( area, activeIndexProperty, allowExponents, isProportional ) );

    // Link the lines together, so it is easy to traverse
    for ( let i = 1; i < lines.length; i++ ) {
      lines[ i - 1 ].nextLine = lines[ i ];
      lines[ i ].previousLine = lines[ i - 1 ];
    }

    return lines;
  }
}

areaModelCommon.register( 'CalculationLinesNode', CalculationLinesNode );

export default CalculationLinesNode;