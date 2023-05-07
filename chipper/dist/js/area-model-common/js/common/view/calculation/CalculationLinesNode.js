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
  constructor(model) {
    super();

    // @private {Node}
    this.box = new VBox({
      spacing: 1
    });
    this.addChild(this.box);
    if (!AreaModelCommonQueryParameters.rawMath) {
      this.pdomNamespace = 'http://www.w3.org/1998/Math/MathML';
      this.tagName = 'math';
      this.box.pdomNamespace = 'http://www.w3.org/1998/Math/MathML';
      this.box.tagName = 'mtable';
    }

    // @public {Property.<boolean>} - Whether there are previous/next lines (when in line-by-line mode)
    this.previousEnabledProperty = new BooleanProperty(false);
    this.nextEnabledProperty = new BooleanProperty(false);

    // @public {Property.<Array.<CalculationLine>>} - All of our "current" lines
    this.calculationLinesProperty = new Property([]);

    // @public {Emitter} - Fired whenever the displayed appearance has updated.
    this.displayUpdatedEmitter = new Emitter();

    // @private {AreaModelCommonModel}
    this.model = model;

    // @private {boolean} - Whether the actual CalculationLinesNode need updating.
    this.linesDirty = true;

    // @private {boolean} - Whether the display of the lines (index/visibility change) needs updating.
    this.displayDirty = true;

    // @private {Property.<number>} - The current index (for whatever area)
    this.areaIndexProperty = new DynamicProperty(model.currentAreaProperty, {
      derive: 'calculationIndexProperty',
      bidirectional: true
    });

    // @private {Property.<number|null>} - The effective current index (for whatever area) that we will use for display
    this.effectiveIndexProperty = new DerivedProperty([this.areaIndexProperty, model.areaCalculationChoiceProperty], (index, choice) => choice === AreaCalculationChoice.LINE_BY_LINE ? index : null);
    const setLinesDirty = () => {
      this.linesDirty = true;
    };
    const setDisplayDirty = () => {
      this.displayDirty = true;
    };

    // Listen for changes that would make the display need an update
    model.areaCalculationChoiceProperty.lazyLink(setDisplayDirty);
    this.areaIndexProperty.lazyLink(setDisplayDirty);

    // Listen for changes that would make everything need an update
    model.currentAreaProperty.link((newArea, oldArea) => {
      if (oldArea) {
        oldArea.allPartitions.forEach(partition => {
          partition.sizeProperty.unlink(setLinesDirty);
          partition.visibleProperty.unlink(setLinesDirty);
        });
      }
      newArea.allPartitions.forEach(partition => {
        partition.sizeProperty.lazyLink(setLinesDirty);
        partition.visibleProperty.lazyLink(setLinesDirty);
      });
      setLinesDirty();
      this.update();
    });
  }

  /**
   * Called whenever the calculation may need an update.
   * @public
   */
  update() {
    // Don't update anything if things are hidden
    if (this.model.areaCalculationChoiceProperty.value === AreaCalculationChoice.HIDDEN) {
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
    if (activeLine.previousLine) {
      this.areaIndexProperty.value = activeLine.previousLine.index;
    }
  }

  /**
   * Moves the display to the next line.
   * @public
   */
  moveToNextLine() {
    const activeLine = this.getActiveLine();
    if (activeLine.nextLine) {
      this.areaIndexProperty.value = activeLine.nextLine.index;
    }
  }

  /**
   * Removes and disposes children.
   * @private
   */
  wipe() {
    while (this.box.children.length) {
      this.box.children[0].dispose();
    }
  }

  /**
   * Update the internally-stored calculation lines.
   * @private
   */
  updateLines() {
    if (!this.linesDirty) {
      return;
    }

    // As a sanity check, just remove all children here (so we don't leak things)
    this.wipe();

    // Release line references that we had before
    this.calculationLinesProperty.value.forEach(calculationLine => {
      calculationLine.dispose();
    });

    // Create new lines
    this.calculationLinesProperty.value = CalculationLinesNode.createLines(this.model.currentAreaProperty.value, this.effectiveIndexProperty, this.model.allowExponents, this.model.isProportional);
    this.linesDirty = false;
    this.displayDirty = true;
  }

  /**
   * Update the display of the calculation lines.
   * @private
   */
  updateDisplay() {
    if (!this.displayDirty) {
      return;
    }

    // As a sanity check, just remove all children here (so we don't leak things)
    this.wipe();
    let displayedLines = this.calculationLinesProperty.value;

    // If we are in line-by-line mode, display adjacent lines
    if (this.model.areaCalculationChoiceProperty.value === AreaCalculationChoice.LINE_BY_LINE) {
      const activeLine = this.getActiveLine();
      displayedLines = activeLine.getAdjacentLines();
      this.previousEnabledProperty.value = !!activeLine.previousLine;
      this.nextEnabledProperty.value = !!activeLine.nextLine;
    } else {
      this.previousEnabledProperty.value = false;
      this.nextEnabledProperty.value = false;
    }
    this.box.children = displayedLines.map((line, index) => {
      const lineNode = new Node({
        children: [line.node]
      });
      if (AreaModelCommonQueryParameters.rawMath) {
        lineNode.tagName = 'span';
        lineNode.innerContent = line.node.accessibleText;
        lineNode.containerTagName = 'span';
        line.node.pdomVisible = false;
      } else {
        lineNode.pdomNamespace = 'http://www.w3.org/1998/Math/MathML';
        lineNode.tagName = 'mtr';
      }
      if (index > 0) {
        if (AreaModelCommonQueryParameters.rawMath) {
          lineNode.labelTagName = 'span';
          lineNode.labelContent = betweenCalculationLinesString;
        } else {
          lineNode.insertChild(0, new Node({
            // pdom
            tagName: 'mtext',
            pdomNamespace: 'http://www.w3.org/1998/Math/MathML',
            innerContent: betweenCalculationLinesString
          }));
        }
      }
      return lineNode;
    });
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
    let activeLine = _.find(this.calculationLinesProperty.value, line => line.isActiveProperty.value) || null;

    // If no line is currently active (maybe it was removed?), switch to the next-best line
    if (!activeLine) {
      let nextBestLine = null;
      const lastIndex = this.areaIndexProperty.value;
      this.calculationLinesProperty.value.forEach(calculationLine => {
        if (calculationLine.index <= lastIndex) {
          nextBestLine = calculationLine;
        }
      });

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
  static createLines(area, activeIndexProperty, allowExponents, isProportional) {
    // Whether there are ANY shown partitions for a given orientation
    const horizontalEmpty = area.getDefinedPartitions(Orientation.HORIZONTAL).length === 0;
    const verticalEmpty = area.getDefinedPartitions(Orientation.VERTICAL).length === 0;

    // If both are empty, show a question mark
    if (horizontalEmpty && verticalEmpty) {
      return [new QuestionMarkLine(area, activeIndexProperty, allowExponents, isProportional)];
    }
    // If only one is empty, show boxes
    else if (horizontalEmpty || verticalEmpty) {
      return [new TotalsLine(area, activeIndexProperty, allowExponents, isProportional)];
    }
    const horizontalTermList = area.getTermList(Orientation.HORIZONTAL);
    const verticalTermList = area.getTermList(Orientation.VERTICAL);
    const horizontalTerms = horizontalTermList.terms;
    const verticalTerms = verticalTermList.terms;

    // The total/sum for each orientation
    const horizontalPolynomial = area.totalProperties.horizontal.value;
    const verticalPolynomial = area.totalProperties.vertical.value;

    // E.g. for ( 2 ) * ( 3 + x ), the result will be the terms 6 and 2x.
    const multipliedTermList = new TermList(_.flatten(verticalTerms.map(verticalTerm => horizontalTerms.map(horizontalTerm => horizontalTerm.times(verticalTerm)))));
    const orderedTermList = multipliedTermList.orderedByExponent();
    const totalPolynomial = area.totalAreaProperty.value;

    // Logic for what calculation lines are needed
    const needsExpansion = !allowExponents && (!horizontalTermList.equals(horizontalPolynomial) || !verticalTermList.equals(verticalPolynomial));
    const needsDistribution = horizontalTermList.terms.length !== 1 || verticalTermList.terms.length !== 1;
    const needsMultiplied = needsDistribution && !multipliedTermList.equals(totalPolynomial);
    const needsOrdered = needsMultiplied && !orderedTermList.equals(multipliedTermList) && !(orderedTermList.equals(totalPolynomial) && (!allowExponents || !orderedTermList.hasNegativeTerm()));
    const needsMinuses = needsMultiplied && allowExponents && orderedTermList.hasNegativeTerm() && !orderedTermList.equals(totalPolynomial);

    // Add the actual lines
    const lines = [];
    // e.g. ( -x + x^2 )( x^2 - x ) <--- example used for everything except the ExpansionLine
    lines.push(new TotalsLine(area, activeIndexProperty, allowExponents, isProportional));
    if (needsExpansion) {
      // e.g. ( -5 + 2 )( 7 + 3 ) <---- if we have a proportional one where Totals Line is e.g. -3 * 10
      lines.push(new ExpandedLine(horizontalTerms, verticalTerms, area, activeIndexProperty, allowExponents, isProportional));
    }
    if (needsDistribution) {
      // e.g. (-x)(x^2) + (-x)(-x) + (x^2)(x^2) + (x^2)(-x)
      lines.push(new DistributionLine(horizontalTerms, verticalTerms, area, activeIndexProperty, allowExponents, isProportional));
    }
    if (needsMultiplied) {
      // e.g. (-x^3) + x^2 + x^4 + (-x^3)
      lines.push(new MultipliedLine(multipliedTermList, area, activeIndexProperty, allowExponents, isProportional));
    }
    if (needsOrdered) {
      // e.g. x^4 + (-x^3) + (-x^3) + x^2
      lines.push(new OrderedLine(orderedTermList, area, activeIndexProperty, allowExponents, isProportional));
    }
    if (needsMinuses) {
      // e.g. x^4 - x^3 - x^3 + x^2
      lines.push(new MinusesLine(orderedTermList, area, activeIndexProperty, allowExponents, isProportional));
    }
    // e.g. x^4 - 2x^3 + x^2
    lines.push(new SumLine(area, activeIndexProperty, allowExponents, isProportional));

    // Link the lines together, so it is easy to traverse
    for (let i = 1; i < lines.length; i++) {
      lines[i - 1].nextLine = lines[i];
      lines[i].previousLine = lines[i - 1];
    }
    return lines;
  }
}
areaModelCommon.register('CalculationLinesNode', CalculationLinesNode);
export default CalculationLinesNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJEeW5hbWljUHJvcGVydHkiLCJFbWl0dGVyIiwiUHJvcGVydHkiLCJPcmllbnRhdGlvbiIsIk5vZGUiLCJWQm94IiwiYXJlYU1vZGVsQ29tbW9uIiwiQXJlYU1vZGVsQ29tbW9uU3RyaW5ncyIsIkFyZWFNb2RlbENvbW1vblF1ZXJ5UGFyYW1ldGVycyIsIkFyZWFDYWxjdWxhdGlvbkNob2ljZSIsIlRlcm1MaXN0IiwiRGlzdHJpYnV0aW9uTGluZSIsIkV4cGFuZGVkTGluZSIsIk1pbnVzZXNMaW5lIiwiTXVsdGlwbGllZExpbmUiLCJPcmRlcmVkTGluZSIsIlF1ZXN0aW9uTWFya0xpbmUiLCJTdW1MaW5lIiwiVG90YWxzTGluZSIsImJldHdlZW5DYWxjdWxhdGlvbkxpbmVzU3RyaW5nIiwiYTExeSIsImJldHdlZW5DYWxjdWxhdGlvbkxpbmVzIiwiQ2FsY3VsYXRpb25MaW5lc05vZGUiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwiYm94Iiwic3BhY2luZyIsImFkZENoaWxkIiwicmF3TWF0aCIsInBkb21OYW1lc3BhY2UiLCJ0YWdOYW1lIiwicHJldmlvdXNFbmFibGVkUHJvcGVydHkiLCJuZXh0RW5hYmxlZFByb3BlcnR5IiwiY2FsY3VsYXRpb25MaW5lc1Byb3BlcnR5IiwiZGlzcGxheVVwZGF0ZWRFbWl0dGVyIiwibGluZXNEaXJ0eSIsImRpc3BsYXlEaXJ0eSIsImFyZWFJbmRleFByb3BlcnR5IiwiY3VycmVudEFyZWFQcm9wZXJ0eSIsImRlcml2ZSIsImJpZGlyZWN0aW9uYWwiLCJlZmZlY3RpdmVJbmRleFByb3BlcnR5IiwiYXJlYUNhbGN1bGF0aW9uQ2hvaWNlUHJvcGVydHkiLCJpbmRleCIsImNob2ljZSIsIkxJTkVfQllfTElORSIsInNldExpbmVzRGlydHkiLCJzZXREaXNwbGF5RGlydHkiLCJsYXp5TGluayIsImxpbmsiLCJuZXdBcmVhIiwib2xkQXJlYSIsImFsbFBhcnRpdGlvbnMiLCJmb3JFYWNoIiwicGFydGl0aW9uIiwic2l6ZVByb3BlcnR5IiwidW5saW5rIiwidmlzaWJsZVByb3BlcnR5IiwidXBkYXRlIiwidmFsdWUiLCJISURERU4iLCJ1cGRhdGVMaW5lcyIsInVwZGF0ZURpc3BsYXkiLCJtb3ZlVG9QcmV2aW91c0xpbmUiLCJhY3RpdmVMaW5lIiwiZ2V0QWN0aXZlTGluZSIsInByZXZpb3VzTGluZSIsIm1vdmVUb05leHRMaW5lIiwibmV4dExpbmUiLCJ3aXBlIiwiY2hpbGRyZW4iLCJsZW5ndGgiLCJkaXNwb3NlIiwiY2FsY3VsYXRpb25MaW5lIiwiY3JlYXRlTGluZXMiLCJhbGxvd0V4cG9uZW50cyIsImlzUHJvcG9ydGlvbmFsIiwiZGlzcGxheWVkTGluZXMiLCJnZXRBZGphY2VudExpbmVzIiwibWFwIiwibGluZSIsImxpbmVOb2RlIiwibm9kZSIsImlubmVyQ29udGVudCIsImFjY2Vzc2libGVUZXh0IiwiY29udGFpbmVyVGFnTmFtZSIsInBkb21WaXNpYmxlIiwibGFiZWxUYWdOYW1lIiwibGFiZWxDb250ZW50IiwiaW5zZXJ0Q2hpbGQiLCJlbWl0IiwiXyIsImZpbmQiLCJpc0FjdGl2ZVByb3BlcnR5IiwibmV4dEJlc3RMaW5lIiwibGFzdEluZGV4IiwiYXJlYSIsImFjdGl2ZUluZGV4UHJvcGVydHkiLCJob3Jpem9udGFsRW1wdHkiLCJnZXREZWZpbmVkUGFydGl0aW9ucyIsIkhPUklaT05UQUwiLCJ2ZXJ0aWNhbEVtcHR5IiwiVkVSVElDQUwiLCJob3Jpem9udGFsVGVybUxpc3QiLCJnZXRUZXJtTGlzdCIsInZlcnRpY2FsVGVybUxpc3QiLCJob3Jpem9udGFsVGVybXMiLCJ0ZXJtcyIsInZlcnRpY2FsVGVybXMiLCJob3Jpem9udGFsUG9seW5vbWlhbCIsInRvdGFsUHJvcGVydGllcyIsImhvcml6b250YWwiLCJ2ZXJ0aWNhbFBvbHlub21pYWwiLCJ2ZXJ0aWNhbCIsIm11bHRpcGxpZWRUZXJtTGlzdCIsImZsYXR0ZW4iLCJ2ZXJ0aWNhbFRlcm0iLCJob3Jpem9udGFsVGVybSIsInRpbWVzIiwib3JkZXJlZFRlcm1MaXN0Iiwib3JkZXJlZEJ5RXhwb25lbnQiLCJ0b3RhbFBvbHlub21pYWwiLCJ0b3RhbEFyZWFQcm9wZXJ0eSIsIm5lZWRzRXhwYW5zaW9uIiwiZXF1YWxzIiwibmVlZHNEaXN0cmlidXRpb24iLCJuZWVkc011bHRpcGxpZWQiLCJuZWVkc09yZGVyZWQiLCJoYXNOZWdhdGl2ZVRlcm0iLCJuZWVkc01pbnVzZXMiLCJsaW5lcyIsInB1c2giLCJpIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDYWxjdWxhdGlvbkxpbmVzTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBIYW5kbGluZyBmb3IgY3JlYXRpbmcgYWxsIGNhbGN1bGF0aW9uIGxpbmVzIGZvciBhIGdpdmVuIGFyZWEvZXRjLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRHluYW1pY1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvRHluYW1pY1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBhcmVhTW9kZWxDb21tb24gZnJvbSAnLi4vLi4vLi4vYXJlYU1vZGVsQ29tbW9uLmpzJztcclxuaW1wb3J0IEFyZWFNb2RlbENvbW1vblN0cmluZ3MgZnJvbSAnLi4vLi4vLi4vQXJlYU1vZGVsQ29tbW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBBcmVhTW9kZWxDb21tb25RdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vLi4vQXJlYU1vZGVsQ29tbW9uUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IEFyZWFDYWxjdWxhdGlvbkNob2ljZSBmcm9tICcuLi8uLi9tb2RlbC9BcmVhQ2FsY3VsYXRpb25DaG9pY2UuanMnO1xyXG5pbXBvcnQgVGVybUxpc3QgZnJvbSAnLi4vLi4vbW9kZWwvVGVybUxpc3QuanMnO1xyXG5pbXBvcnQgRGlzdHJpYnV0aW9uTGluZSBmcm9tICcuL0Rpc3RyaWJ1dGlvbkxpbmUuanMnO1xyXG5pbXBvcnQgRXhwYW5kZWRMaW5lIGZyb20gJy4vRXhwYW5kZWRMaW5lLmpzJztcclxuaW1wb3J0IE1pbnVzZXNMaW5lIGZyb20gJy4vTWludXNlc0xpbmUuanMnO1xyXG5pbXBvcnQgTXVsdGlwbGllZExpbmUgZnJvbSAnLi9NdWx0aXBsaWVkTGluZS5qcyc7XHJcbmltcG9ydCBPcmRlcmVkTGluZSBmcm9tICcuL09yZGVyZWRMaW5lLmpzJztcclxuaW1wb3J0IFF1ZXN0aW9uTWFya0xpbmUgZnJvbSAnLi9RdWVzdGlvbk1hcmtMaW5lLmpzJztcclxuaW1wb3J0IFN1bUxpbmUgZnJvbSAnLi9TdW1MaW5lLmpzJztcclxuaW1wb3J0IFRvdGFsc0xpbmUgZnJvbSAnLi9Ub3RhbHNMaW5lLmpzJztcclxuXHJcbmNvbnN0IGJldHdlZW5DYWxjdWxhdGlvbkxpbmVzU3RyaW5nID0gQXJlYU1vZGVsQ29tbW9uU3RyaW5ncy5hMTF5LmJldHdlZW5DYWxjdWxhdGlvbkxpbmVzO1xyXG5cclxuY2xhc3MgQ2FsY3VsYXRpb25MaW5lc05vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge0FyZWFNb2RlbENvbW1vbk1vZGVsfSBtb2RlbFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCApIHtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtOb2RlfVxyXG4gICAgdGhpcy5ib3ggPSBuZXcgVkJveCgge1xyXG4gICAgICBzcGFjaW5nOiAxXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmJveCApO1xyXG5cclxuICAgIGlmICggIUFyZWFNb2RlbENvbW1vblF1ZXJ5UGFyYW1ldGVycy5yYXdNYXRoICkge1xyXG4gICAgICB0aGlzLnBkb21OYW1lc3BhY2UgPSAnaHR0cDovL3d3dy53My5vcmcvMTk5OC9NYXRoL01hdGhNTCc7XHJcbiAgICAgIHRoaXMudGFnTmFtZSA9ICdtYXRoJztcclxuXHJcbiAgICAgIHRoaXMuYm94LnBkb21OYW1lc3BhY2UgPSAnaHR0cDovL3d3dy53My5vcmcvMTk5OC9NYXRoL01hdGhNTCc7XHJcbiAgICAgIHRoaXMuYm94LnRhZ05hbWUgPSAnbXRhYmxlJztcclxuICAgIH1cclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IC0gV2hldGhlciB0aGVyZSBhcmUgcHJldmlvdXMvbmV4dCBsaW5lcyAod2hlbiBpbiBsaW5lLWJ5LWxpbmUgbW9kZSlcclxuICAgIHRoaXMucHJldmlvdXNFbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG4gICAgdGhpcy5uZXh0RW5hYmxlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48QXJyYXkuPENhbGN1bGF0aW9uTGluZT4+fSAtIEFsbCBvZiBvdXIgXCJjdXJyZW50XCIgbGluZXNcclxuICAgIHRoaXMuY2FsY3VsYXRpb25MaW5lc1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBbXSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0VtaXR0ZXJ9IC0gRmlyZWQgd2hlbmV2ZXIgdGhlIGRpc3BsYXllZCBhcHBlYXJhbmNlIGhhcyB1cGRhdGVkLlxyXG4gICAgdGhpcy5kaXNwbGF5VXBkYXRlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBcmVhTW9kZWxDb21tb25Nb2RlbH1cclxuICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoZSBhY3R1YWwgQ2FsY3VsYXRpb25MaW5lc05vZGUgbmVlZCB1cGRhdGluZy5cclxuICAgIHRoaXMubGluZXNEaXJ0eSA9IHRydWU7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gV2hldGhlciB0aGUgZGlzcGxheSBvZiB0aGUgbGluZXMgKGluZGV4L3Zpc2liaWxpdHkgY2hhbmdlKSBuZWVkcyB1cGRhdGluZy5cclxuICAgIHRoaXMuZGlzcGxheURpcnR5ID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7UHJvcGVydHkuPG51bWJlcj59IC0gVGhlIGN1cnJlbnQgaW5kZXggKGZvciB3aGF0ZXZlciBhcmVhKVxyXG4gICAgdGhpcy5hcmVhSW5kZXhQcm9wZXJ0eSA9IG5ldyBEeW5hbWljUHJvcGVydHkoIG1vZGVsLmN1cnJlbnRBcmVhUHJvcGVydHksIHtcclxuICAgICAgZGVyaXZlOiAnY2FsY3VsYXRpb25JbmRleFByb3BlcnR5JyxcclxuICAgICAgYmlkaXJlY3Rpb25hbDogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtQcm9wZXJ0eS48bnVtYmVyfG51bGw+fSAtIFRoZSBlZmZlY3RpdmUgY3VycmVudCBpbmRleCAoZm9yIHdoYXRldmVyIGFyZWEpIHRoYXQgd2Ugd2lsbCB1c2UgZm9yIGRpc3BsYXlcclxuICAgIHRoaXMuZWZmZWN0aXZlSW5kZXhQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgdGhpcy5hcmVhSW5kZXhQcm9wZXJ0eSwgbW9kZWwuYXJlYUNhbGN1bGF0aW9uQ2hvaWNlUHJvcGVydHkgXSxcclxuICAgICAgKCBpbmRleCwgY2hvaWNlICkgPT4gY2hvaWNlID09PSBBcmVhQ2FsY3VsYXRpb25DaG9pY2UuTElORV9CWV9MSU5FID8gaW5kZXggOiBudWxsICk7XHJcblxyXG4gICAgY29uc3Qgc2V0TGluZXNEaXJ0eSA9ICgpID0+IHsgdGhpcy5saW5lc0RpcnR5ID0gdHJ1ZTsgfTtcclxuICAgIGNvbnN0IHNldERpc3BsYXlEaXJ0eSA9ICgpID0+IHsgdGhpcy5kaXNwbGF5RGlydHkgPSB0cnVlOyB9O1xyXG5cclxuICAgIC8vIExpc3RlbiBmb3IgY2hhbmdlcyB0aGF0IHdvdWxkIG1ha2UgdGhlIGRpc3BsYXkgbmVlZCBhbiB1cGRhdGVcclxuICAgIG1vZGVsLmFyZWFDYWxjdWxhdGlvbkNob2ljZVByb3BlcnR5LmxhenlMaW5rKCBzZXREaXNwbGF5RGlydHkgKTtcclxuICAgIHRoaXMuYXJlYUluZGV4UHJvcGVydHkubGF6eUxpbmsoIHNldERpc3BsYXlEaXJ0eSApO1xyXG5cclxuICAgIC8vIExpc3RlbiBmb3IgY2hhbmdlcyB0aGF0IHdvdWxkIG1ha2UgZXZlcnl0aGluZyBuZWVkIGFuIHVwZGF0ZVxyXG4gICAgbW9kZWwuY3VycmVudEFyZWFQcm9wZXJ0eS5saW5rKCAoIG5ld0FyZWEsIG9sZEFyZWEgKSA9PiB7XHJcbiAgICAgIGlmICggb2xkQXJlYSApIHtcclxuICAgICAgICBvbGRBcmVhLmFsbFBhcnRpdGlvbnMuZm9yRWFjaCggcGFydGl0aW9uID0+IHtcclxuICAgICAgICAgIHBhcnRpdGlvbi5zaXplUHJvcGVydHkudW5saW5rKCBzZXRMaW5lc0RpcnR5ICk7XHJcbiAgICAgICAgICBwYXJ0aXRpb24udmlzaWJsZVByb3BlcnR5LnVubGluayggc2V0TGluZXNEaXJ0eSApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgbmV3QXJlYS5hbGxQYXJ0aXRpb25zLmZvckVhY2goIHBhcnRpdGlvbiA9PiB7XHJcbiAgICAgICAgcGFydGl0aW9uLnNpemVQcm9wZXJ0eS5sYXp5TGluayggc2V0TGluZXNEaXJ0eSApO1xyXG4gICAgICAgIHBhcnRpdGlvbi52aXNpYmxlUHJvcGVydHkubGF6eUxpbmsoIHNldExpbmVzRGlydHkgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgc2V0TGluZXNEaXJ0eSgpO1xyXG5cclxuICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuZXZlciB0aGUgY2FsY3VsYXRpb24gbWF5IG5lZWQgYW4gdXBkYXRlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICB1cGRhdGUoKSB7XHJcbiAgICAvLyBEb24ndCB1cGRhdGUgYW55dGhpbmcgaWYgdGhpbmdzIGFyZSBoaWRkZW5cclxuICAgIGlmICggdGhpcy5tb2RlbC5hcmVhQ2FsY3VsYXRpb25DaG9pY2VQcm9wZXJ0eS52YWx1ZSA9PT0gQXJlYUNhbGN1bGF0aW9uQ2hvaWNlLkhJRERFTiApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudXBkYXRlTGluZXMoKTtcclxuICAgIHRoaXMudXBkYXRlRGlzcGxheSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZXMgdGhlIGRpc3BsYXkgdG8gdGhlIHByZXZpb3VzIGxpbmUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIG1vdmVUb1ByZXZpb3VzTGluZSgpIHtcclxuICAgIGNvbnN0IGFjdGl2ZUxpbmUgPSB0aGlzLmdldEFjdGl2ZUxpbmUoKTtcclxuICAgIGlmICggYWN0aXZlTGluZS5wcmV2aW91c0xpbmUgKSB7XHJcbiAgICAgIHRoaXMuYXJlYUluZGV4UHJvcGVydHkudmFsdWUgPSBhY3RpdmVMaW5lLnByZXZpb3VzTGluZS5pbmRleDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmVzIHRoZSBkaXNwbGF5IHRvIHRoZSBuZXh0IGxpbmUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIG1vdmVUb05leHRMaW5lKCkge1xyXG4gICAgY29uc3QgYWN0aXZlTGluZSA9IHRoaXMuZ2V0QWN0aXZlTGluZSgpO1xyXG4gICAgaWYgKCBhY3RpdmVMaW5lLm5leHRMaW5lICkge1xyXG4gICAgICB0aGlzLmFyZWFJbmRleFByb3BlcnR5LnZhbHVlID0gYWN0aXZlTGluZS5uZXh0TGluZS5pbmRleDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYW5kIGRpc3Bvc2VzIGNoaWxkcmVuLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgd2lwZSgpIHtcclxuICAgIHdoaWxlICggdGhpcy5ib3guY2hpbGRyZW4ubGVuZ3RoICkge1xyXG4gICAgICB0aGlzLmJveC5jaGlsZHJlblsgMCBdLmRpc3Bvc2UoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgaW50ZXJuYWxseS1zdG9yZWQgY2FsY3VsYXRpb24gbGluZXMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVMaW5lcygpIHtcclxuICAgIGlmICggIXRoaXMubGluZXNEaXJ0eSApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFzIGEgc2FuaXR5IGNoZWNrLCBqdXN0IHJlbW92ZSBhbGwgY2hpbGRyZW4gaGVyZSAoc28gd2UgZG9uJ3QgbGVhayB0aGluZ3MpXHJcbiAgICB0aGlzLndpcGUoKTtcclxuXHJcbiAgICAvLyBSZWxlYXNlIGxpbmUgcmVmZXJlbmNlcyB0aGF0IHdlIGhhZCBiZWZvcmVcclxuICAgIHRoaXMuY2FsY3VsYXRpb25MaW5lc1Byb3BlcnR5LnZhbHVlLmZvckVhY2goIGNhbGN1bGF0aW9uTGluZSA9PiB7XHJcbiAgICAgIGNhbGN1bGF0aW9uTGluZS5kaXNwb3NlKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIG5ldyBsaW5lc1xyXG4gICAgdGhpcy5jYWxjdWxhdGlvbkxpbmVzUHJvcGVydHkudmFsdWUgPSBDYWxjdWxhdGlvbkxpbmVzTm9kZS5jcmVhdGVMaW5lcyhcclxuICAgICAgdGhpcy5tb2RlbC5jdXJyZW50QXJlYVByb3BlcnR5LnZhbHVlLFxyXG4gICAgICB0aGlzLmVmZmVjdGl2ZUluZGV4UHJvcGVydHksXHJcbiAgICAgIHRoaXMubW9kZWwuYWxsb3dFeHBvbmVudHMsXHJcbiAgICAgIHRoaXMubW9kZWwuaXNQcm9wb3J0aW9uYWxcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5saW5lc0RpcnR5ID0gZmFsc2U7XHJcbiAgICB0aGlzLmRpc3BsYXlEaXJ0eSA9IHRydWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIGRpc3BsYXkgb2YgdGhlIGNhbGN1bGF0aW9uIGxpbmVzLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlRGlzcGxheSgpIHtcclxuICAgIGlmICggIXRoaXMuZGlzcGxheURpcnR5ICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQXMgYSBzYW5pdHkgY2hlY2ssIGp1c3QgcmVtb3ZlIGFsbCBjaGlsZHJlbiBoZXJlIChzbyB3ZSBkb24ndCBsZWFrIHRoaW5ncylcclxuICAgIHRoaXMud2lwZSgpO1xyXG5cclxuICAgIGxldCBkaXNwbGF5ZWRMaW5lcyA9IHRoaXMuY2FsY3VsYXRpb25MaW5lc1Byb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIC8vIElmIHdlIGFyZSBpbiBsaW5lLWJ5LWxpbmUgbW9kZSwgZGlzcGxheSBhZGphY2VudCBsaW5lc1xyXG4gICAgaWYgKCB0aGlzLm1vZGVsLmFyZWFDYWxjdWxhdGlvbkNob2ljZVByb3BlcnR5LnZhbHVlID09PSBBcmVhQ2FsY3VsYXRpb25DaG9pY2UuTElORV9CWV9MSU5FICkge1xyXG5cclxuICAgICAgY29uc3QgYWN0aXZlTGluZSA9IHRoaXMuZ2V0QWN0aXZlTGluZSgpO1xyXG4gICAgICBkaXNwbGF5ZWRMaW5lcyA9IGFjdGl2ZUxpbmUuZ2V0QWRqYWNlbnRMaW5lcygpO1xyXG5cclxuICAgICAgdGhpcy5wcmV2aW91c0VuYWJsZWRQcm9wZXJ0eS52YWx1ZSA9ICEhYWN0aXZlTGluZS5wcmV2aW91c0xpbmU7XHJcbiAgICAgIHRoaXMubmV4dEVuYWJsZWRQcm9wZXJ0eS52YWx1ZSA9ICEhYWN0aXZlTGluZS5uZXh0TGluZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnByZXZpb3VzRW5hYmxlZFByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgIHRoaXMubmV4dEVuYWJsZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYm94LmNoaWxkcmVuID0gZGlzcGxheWVkTGluZXMubWFwKCAoIGxpbmUsIGluZGV4ICkgPT4ge1xyXG4gICAgICBjb25zdCBsaW5lTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgIGxpbmUubm9kZVxyXG4gICAgICAgIF1cclxuICAgICAgfSApO1xyXG4gICAgICBpZiAoIEFyZWFNb2RlbENvbW1vblF1ZXJ5UGFyYW1ldGVycy5yYXdNYXRoICkge1xyXG4gICAgICAgIGxpbmVOb2RlLnRhZ05hbWUgPSAnc3Bhbic7XHJcbiAgICAgICAgbGluZU5vZGUuaW5uZXJDb250ZW50ID0gbGluZS5ub2RlLmFjY2Vzc2libGVUZXh0O1xyXG4gICAgICAgIGxpbmVOb2RlLmNvbnRhaW5lclRhZ05hbWUgPSAnc3Bhbic7XHJcbiAgICAgICAgbGluZS5ub2RlLnBkb21WaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgbGluZU5vZGUucGRvbU5hbWVzcGFjZSA9ICdodHRwOi8vd3d3LnczLm9yZy8xOTk4L01hdGgvTWF0aE1MJztcclxuICAgICAgICBsaW5lTm9kZS50YWdOYW1lID0gJ210cic7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBpbmRleCA+IDAgKSB7XHJcbiAgICAgICAgaWYgKCBBcmVhTW9kZWxDb21tb25RdWVyeVBhcmFtZXRlcnMucmF3TWF0aCApIHtcclxuICAgICAgICAgIGxpbmVOb2RlLmxhYmVsVGFnTmFtZSA9ICdzcGFuJztcclxuICAgICAgICAgIGxpbmVOb2RlLmxhYmVsQ29udGVudCA9IGJldHdlZW5DYWxjdWxhdGlvbkxpbmVzU3RyaW5nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGxpbmVOb2RlLmluc2VydENoaWxkKCAwLCBuZXcgTm9kZSgge1xyXG5cclxuICAgICAgICAgICAgLy8gcGRvbVxyXG4gICAgICAgICAgICB0YWdOYW1lOiAnbXRleHQnLFxyXG4gICAgICAgICAgICBwZG9tTmFtZXNwYWNlOiAnaHR0cDovL3d3dy53My5vcmcvMTk5OC9NYXRoL01hdGhNTCcsXHJcbiAgICAgICAgICAgIGlubmVyQ29udGVudDogYmV0d2VlbkNhbGN1bGF0aW9uTGluZXNTdHJpbmdcclxuICAgICAgICAgIH0gKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbGluZU5vZGU7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5kaXNwbGF5RGlydHkgPSBmYWxzZTtcclxuICAgIHRoaXMuZGlzcGxheVVwZGF0ZWRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGZpcnN0IGFjdGl2ZSBsaW5lLCBvciBudWxsIG90aGVyd2lzZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge0NhbGN1bGF0aW9uTGluZXxudWxsfVxyXG4gICAqL1xyXG4gIGdldEFjdGl2ZUxpbmUoKSB7XHJcbiAgICBsZXQgYWN0aXZlTGluZSA9IF8uZmluZCggdGhpcy5jYWxjdWxhdGlvbkxpbmVzUHJvcGVydHkudmFsdWUsIGxpbmUgPT4gbGluZS5pc0FjdGl2ZVByb3BlcnR5LnZhbHVlICkgfHwgbnVsbDtcclxuXHJcbiAgICAvLyBJZiBubyBsaW5lIGlzIGN1cnJlbnRseSBhY3RpdmUgKG1heWJlIGl0IHdhcyByZW1vdmVkPyksIHN3aXRjaCB0byB0aGUgbmV4dC1iZXN0IGxpbmVcclxuICAgIGlmICggIWFjdGl2ZUxpbmUgKSB7XHJcbiAgICAgIGxldCBuZXh0QmVzdExpbmUgPSBudWxsO1xyXG4gICAgICBjb25zdCBsYXN0SW5kZXggPSB0aGlzLmFyZWFJbmRleFByb3BlcnR5LnZhbHVlO1xyXG4gICAgICB0aGlzLmNhbGN1bGF0aW9uTGluZXNQcm9wZXJ0eS52YWx1ZS5mb3JFYWNoKCBjYWxjdWxhdGlvbkxpbmUgPT4ge1xyXG4gICAgICAgIGlmICggY2FsY3VsYXRpb25MaW5lLmluZGV4IDw9IGxhc3RJbmRleCApIHtcclxuICAgICAgICAgIG5leHRCZXN0TGluZSA9IGNhbGN1bGF0aW9uTGluZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSB0aGUgaW5kZXggcHJvcGVydHkgdG8gcG9pbnQgdG8gdGhlIGNvcnJlY3QgbGluZVxyXG4gICAgICB0aGlzLmFyZWFJbmRleFByb3BlcnR5LnZhbHVlID0gbmV4dEJlc3RMaW5lLmluZGV4O1xyXG4gICAgICBhY3RpdmVMaW5lID0gbmV4dEJlc3RMaW5lO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhY3RpdmVMaW5lO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbiBhcnJheSBvZiBjYWxjdWxhdGlvbiBsaW5lcy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtBcmVhfSBhcmVhXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48bnVtYmVyfG51bGw+fSBhY3RpdmVJbmRleFByb3BlcnR5IC0gbnVsbCB3aGVuIGFsbCBsaW5lcyBzaG91bGQgYmUgYWN0aXZlXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBhbGxvd0V4cG9uZW50cyAtIFdoZXRoZXIgZXhwb25lbnRzIChwb3dlcnMgb2YgeCkgYXJlIGFsbG93ZWRcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzUHJvcG9ydGlvbmFsIC0gV2hldGhlciB0aGUgYXJlYSBpcyBzaG93biBhcyBwcm9wb3J0aW9uYWwgKGluc3RlYWQgb2YgZ2VuZXJpYylcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPENhbGN1bGF0aW9uTGluZT59XHJcbiAgICovXHJcbiAgc3RhdGljIGNyZWF0ZUxpbmVzKCBhcmVhLCBhY3RpdmVJbmRleFByb3BlcnR5LCBhbGxvd0V4cG9uZW50cywgaXNQcm9wb3J0aW9uYWwgKSB7XHJcbiAgICAvLyBXaGV0aGVyIHRoZXJlIGFyZSBBTlkgc2hvd24gcGFydGl0aW9ucyBmb3IgYSBnaXZlbiBvcmllbnRhdGlvblxyXG4gICAgY29uc3QgaG9yaXpvbnRhbEVtcHR5ID0gYXJlYS5nZXREZWZpbmVkUGFydGl0aW9ucyggT3JpZW50YXRpb24uSE9SSVpPTlRBTCApLmxlbmd0aCA9PT0gMDtcclxuICAgIGNvbnN0IHZlcnRpY2FsRW1wdHkgPSBhcmVhLmdldERlZmluZWRQYXJ0aXRpb25zKCBPcmllbnRhdGlvbi5WRVJUSUNBTCApLmxlbmd0aCA9PT0gMDtcclxuXHJcbiAgICAvLyBJZiBib3RoIGFyZSBlbXB0eSwgc2hvdyBhIHF1ZXN0aW9uIG1hcmtcclxuICAgIGlmICggaG9yaXpvbnRhbEVtcHR5ICYmIHZlcnRpY2FsRW1wdHkgKSB7XHJcbiAgICAgIHJldHVybiBbIG5ldyBRdWVzdGlvbk1hcmtMaW5lKCBhcmVhLCBhY3RpdmVJbmRleFByb3BlcnR5LCBhbGxvd0V4cG9uZW50cywgaXNQcm9wb3J0aW9uYWwgKSBdO1xyXG4gICAgfVxyXG4gICAgLy8gSWYgb25seSBvbmUgaXMgZW1wdHksIHNob3cgYm94ZXNcclxuICAgIGVsc2UgaWYgKCBob3Jpem9udGFsRW1wdHkgfHwgdmVydGljYWxFbXB0eSApIHtcclxuICAgICAgcmV0dXJuIFsgbmV3IFRvdGFsc0xpbmUoIGFyZWEsIGFjdGl2ZUluZGV4UHJvcGVydHksIGFsbG93RXhwb25lbnRzLCBpc1Byb3BvcnRpb25hbCApIF07XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaG9yaXpvbnRhbFRlcm1MaXN0ID0gYXJlYS5nZXRUZXJtTGlzdCggT3JpZW50YXRpb24uSE9SSVpPTlRBTCApO1xyXG4gICAgY29uc3QgdmVydGljYWxUZXJtTGlzdCA9IGFyZWEuZ2V0VGVybUxpc3QoIE9yaWVudGF0aW9uLlZFUlRJQ0FMICk7XHJcblxyXG4gICAgY29uc3QgaG9yaXpvbnRhbFRlcm1zID0gaG9yaXpvbnRhbFRlcm1MaXN0LnRlcm1zO1xyXG4gICAgY29uc3QgdmVydGljYWxUZXJtcyA9IHZlcnRpY2FsVGVybUxpc3QudGVybXM7XHJcblxyXG4gICAgLy8gVGhlIHRvdGFsL3N1bSBmb3IgZWFjaCBvcmllbnRhdGlvblxyXG4gICAgY29uc3QgaG9yaXpvbnRhbFBvbHlub21pYWwgPSBhcmVhLnRvdGFsUHJvcGVydGllcy5ob3Jpem9udGFsLnZhbHVlO1xyXG4gICAgY29uc3QgdmVydGljYWxQb2x5bm9taWFsID0gYXJlYS50b3RhbFByb3BlcnRpZXMudmVydGljYWwudmFsdWU7XHJcblxyXG4gICAgLy8gRS5nLiBmb3IgKCAyICkgKiAoIDMgKyB4ICksIHRoZSByZXN1bHQgd2lsbCBiZSB0aGUgdGVybXMgNiBhbmQgMnguXHJcbiAgICBjb25zdCBtdWx0aXBsaWVkVGVybUxpc3QgPSBuZXcgVGVybUxpc3QoIF8uZmxhdHRlbiggdmVydGljYWxUZXJtcy5tYXAoIHZlcnRpY2FsVGVybSA9PiBob3Jpem9udGFsVGVybXMubWFwKCBob3Jpem9udGFsVGVybSA9PiBob3Jpem9udGFsVGVybS50aW1lcyggdmVydGljYWxUZXJtICkgKSApICkgKTtcclxuICAgIGNvbnN0IG9yZGVyZWRUZXJtTGlzdCA9IG11bHRpcGxpZWRUZXJtTGlzdC5vcmRlcmVkQnlFeHBvbmVudCgpO1xyXG4gICAgY29uc3QgdG90YWxQb2x5bm9taWFsID0gYXJlYS50b3RhbEFyZWFQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAvLyBMb2dpYyBmb3Igd2hhdCBjYWxjdWxhdGlvbiBsaW5lcyBhcmUgbmVlZGVkXHJcbiAgICBjb25zdCBuZWVkc0V4cGFuc2lvbiA9ICFhbGxvd0V4cG9uZW50cyAmJiAoICFob3Jpem9udGFsVGVybUxpc3QuZXF1YWxzKCBob3Jpem9udGFsUG9seW5vbWlhbCApIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICF2ZXJ0aWNhbFRlcm1MaXN0LmVxdWFscyggdmVydGljYWxQb2x5bm9taWFsICkgKTtcclxuICAgIGNvbnN0IG5lZWRzRGlzdHJpYnV0aW9uID0gaG9yaXpvbnRhbFRlcm1MaXN0LnRlcm1zLmxlbmd0aCAhPT0gMSB8fCB2ZXJ0aWNhbFRlcm1MaXN0LnRlcm1zLmxlbmd0aCAhPT0gMTtcclxuICAgIGNvbnN0IG5lZWRzTXVsdGlwbGllZCA9IG5lZWRzRGlzdHJpYnV0aW9uICYmICFtdWx0aXBsaWVkVGVybUxpc3QuZXF1YWxzKCB0b3RhbFBvbHlub21pYWwgKTtcclxuICAgIGNvbnN0IG5lZWRzT3JkZXJlZCA9IG5lZWRzTXVsdGlwbGllZCAmJiAhb3JkZXJlZFRlcm1MaXN0LmVxdWFscyggbXVsdGlwbGllZFRlcm1MaXN0ICkgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICEoIG9yZGVyZWRUZXJtTGlzdC5lcXVhbHMoIHRvdGFsUG9seW5vbWlhbCApICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAoICFhbGxvd0V4cG9uZW50cyB8fCAhb3JkZXJlZFRlcm1MaXN0Lmhhc05lZ2F0aXZlVGVybSgpICkgKTtcclxuICAgIGNvbnN0IG5lZWRzTWludXNlcyA9IG5lZWRzTXVsdGlwbGllZCAmJiBhbGxvd0V4cG9uZW50cyAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXJlZFRlcm1MaXN0Lmhhc05lZ2F0aXZlVGVybSgpICYmICFvcmRlcmVkVGVybUxpc3QuZXF1YWxzKCB0b3RhbFBvbHlub21pYWwgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGFjdHVhbCBsaW5lc1xyXG4gICAgY29uc3QgbGluZXMgPSBbXTtcclxuICAgIC8vIGUuZy4gKCAteCArIHheMiApKCB4XjIgLSB4ICkgPC0tLSBleGFtcGxlIHVzZWQgZm9yIGV2ZXJ5dGhpbmcgZXhjZXB0IHRoZSBFeHBhbnNpb25MaW5lXHJcbiAgICBsaW5lcy5wdXNoKCBuZXcgVG90YWxzTGluZSggYXJlYSwgYWN0aXZlSW5kZXhQcm9wZXJ0eSwgYWxsb3dFeHBvbmVudHMsIGlzUHJvcG9ydGlvbmFsICkgKTtcclxuICAgIGlmICggbmVlZHNFeHBhbnNpb24gKSB7XHJcbiAgICAgIC8vIGUuZy4gKCAtNSArIDIgKSggNyArIDMgKSA8LS0tLSBpZiB3ZSBoYXZlIGEgcHJvcG9ydGlvbmFsIG9uZSB3aGVyZSBUb3RhbHMgTGluZSBpcyBlLmcuIC0zICogMTBcclxuICAgICAgbGluZXMucHVzaCggbmV3IEV4cGFuZGVkTGluZSggaG9yaXpvbnRhbFRlcm1zLCB2ZXJ0aWNhbFRlcm1zLCBhcmVhLCBhY3RpdmVJbmRleFByb3BlcnR5LCBhbGxvd0V4cG9uZW50cywgaXNQcm9wb3J0aW9uYWwgKSApO1xyXG4gICAgfVxyXG4gICAgaWYgKCBuZWVkc0Rpc3RyaWJ1dGlvbiApIHtcclxuICAgICAgLy8gZS5nLiAoLXgpKHheMikgKyAoLXgpKC14KSArICh4XjIpKHheMikgKyAoeF4yKSgteClcclxuICAgICAgbGluZXMucHVzaCggbmV3IERpc3RyaWJ1dGlvbkxpbmUoIGhvcml6b250YWxUZXJtcywgdmVydGljYWxUZXJtcywgYXJlYSwgYWN0aXZlSW5kZXhQcm9wZXJ0eSwgYWxsb3dFeHBvbmVudHMsIGlzUHJvcG9ydGlvbmFsICkgKTtcclxuICAgIH1cclxuICAgIGlmICggbmVlZHNNdWx0aXBsaWVkICkge1xyXG4gICAgICAvLyBlLmcuICgteF4zKSArIHheMiArIHheNCArICgteF4zKVxyXG4gICAgICBsaW5lcy5wdXNoKCBuZXcgTXVsdGlwbGllZExpbmUoIG11bHRpcGxpZWRUZXJtTGlzdCwgYXJlYSwgYWN0aXZlSW5kZXhQcm9wZXJ0eSwgYWxsb3dFeHBvbmVudHMsIGlzUHJvcG9ydGlvbmFsICkgKTtcclxuICAgIH1cclxuICAgIGlmICggbmVlZHNPcmRlcmVkICkge1xyXG4gICAgICAvLyBlLmcuIHheNCArICgteF4zKSArICgteF4zKSArIHheMlxyXG4gICAgICBsaW5lcy5wdXNoKCBuZXcgT3JkZXJlZExpbmUoIG9yZGVyZWRUZXJtTGlzdCwgYXJlYSwgYWN0aXZlSW5kZXhQcm9wZXJ0eSwgYWxsb3dFeHBvbmVudHMsIGlzUHJvcG9ydGlvbmFsICkgKTtcclxuICAgIH1cclxuICAgIGlmICggbmVlZHNNaW51c2VzICkge1xyXG4gICAgICAvLyBlLmcuIHheNCAtIHheMyAtIHheMyArIHheMlxyXG4gICAgICBsaW5lcy5wdXNoKCBuZXcgTWludXNlc0xpbmUoIG9yZGVyZWRUZXJtTGlzdCwgYXJlYSwgYWN0aXZlSW5kZXhQcm9wZXJ0eSwgYWxsb3dFeHBvbmVudHMsIGlzUHJvcG9ydGlvbmFsICkgKTtcclxuICAgIH1cclxuICAgIC8vIGUuZy4geF40IC0gMnheMyArIHheMlxyXG4gICAgbGluZXMucHVzaCggbmV3IFN1bUxpbmUoIGFyZWEsIGFjdGl2ZUluZGV4UHJvcGVydHksIGFsbG93RXhwb25lbnRzLCBpc1Byb3BvcnRpb25hbCApICk7XHJcblxyXG4gICAgLy8gTGluayB0aGUgbGluZXMgdG9nZXRoZXIsIHNvIGl0IGlzIGVhc3kgdG8gdHJhdmVyc2VcclxuICAgIGZvciAoIGxldCBpID0gMTsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBsaW5lc1sgaSAtIDEgXS5uZXh0TGluZSA9IGxpbmVzWyBpIF07XHJcbiAgICAgIGxpbmVzWyBpIF0ucHJldmlvdXNMaW5lID0gbGluZXNbIGkgLSAxIF07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGxpbmVzO1xyXG4gIH1cclxufVxyXG5cclxuYXJlYU1vZGVsQ29tbW9uLnJlZ2lzdGVyKCAnQ2FsY3VsYXRpb25MaW5lc05vZGUnLCBDYWxjdWxhdGlvbkxpbmVzTm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2FsY3VsYXRpb25MaW5lc05vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSwyQ0FBMkM7QUFDdkUsT0FBT0MsZUFBZSxNQUFNLDJDQUEyQztBQUN2RSxPQUFPQyxlQUFlLE1BQU0sMkNBQTJDO0FBQ3ZFLE9BQU9DLE9BQU8sTUFBTSxtQ0FBbUM7QUFDdkQsT0FBT0MsUUFBUSxNQUFNLG9DQUFvQztBQUN6RCxPQUFPQyxXQUFXLE1BQU0sNENBQTRDO0FBQ3BFLFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFRLHNDQUFzQztBQUNqRSxPQUFPQyxlQUFlLE1BQU0sNkJBQTZCO0FBQ3pELE9BQU9DLHNCQUFzQixNQUFNLG9DQUFvQztBQUN2RSxPQUFPQyw4QkFBOEIsTUFBTSx5Q0FBeUM7QUFDcEYsT0FBT0MscUJBQXFCLE1BQU0sc0NBQXNDO0FBQ3hFLE9BQU9DLFFBQVEsTUFBTSx5QkFBeUI7QUFDOUMsT0FBT0MsZ0JBQWdCLE1BQU0sdUJBQXVCO0FBQ3BELE9BQU9DLFlBQVksTUFBTSxtQkFBbUI7QUFDNUMsT0FBT0MsV0FBVyxNQUFNLGtCQUFrQjtBQUMxQyxPQUFPQyxjQUFjLE1BQU0scUJBQXFCO0FBQ2hELE9BQU9DLFdBQVcsTUFBTSxrQkFBa0I7QUFDMUMs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