// Copyright 2016-2022, University of Colorado Boulder

/**
 * Class that represents a pie chart portraying the proportion of the various isotopes in the test chamber.
 *
 * @author Aadish Gupta
 *
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Circle, Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Panel from '../../../../sun/js/Panel.js';
import PieChartNode from '../../common/view/PieChartNode.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';

// constants
const PIE_CHART_RADIUS = 40;
const OVERALL_HEIGHT = 120;
const READOUT_FONT = new PhetFont(18);
const SIZE = new Dimension2(90, 20);
const CHEMICAL_SYMBOL_FONT = new PhetFont(16);
const SUPERSCRIPT_SUBSCRIPT_FONT = new PhetFont(14);
const NUMBER_DECIMALS = 4;

/**
 * Utility function to create a node which represents a chemical symbol, including the mass number(in front of the
 * chemical symbol and partially above it) and the atomic number (in front of the chemical symbol and partially below it).
 *
 * @param {NumberAtom} isotopeConfig
 */

function chemSymbolWithNumbersNode(isotopeConfig) {
  const node = new Node();
  const symbol = new Text(AtomIdentifier.getSymbol(isotopeConfig.protonCountProperty.get()), {
    font: CHEMICAL_SYMBOL_FONT,
    centerX: 0,
    centerY: 0
  });
  node.addChild(symbol);
  const massNumber = new Text(isotopeConfig.massNumberProperty.get(), {
    font: SUPERSCRIPT_SUBSCRIPT_FONT,
    centerY: symbol.top
  });
  massNumber.right = symbol.left;
  node.addChild(massNumber);
  const atomicNumber = new Text(isotopeConfig.protonCountProperty.get(), {
    font: SUPERSCRIPT_SUBSCRIPT_FONT,
    centerY: symbol.bottom
  });
  atomicNumber.right = symbol.left;
  node.addChild(atomicNumber);
  return node;
}

/**
 * @param {NumberAtom} isotopeConfig
 * @param {number} isotopePercentage
 * @param {boolean} labelOnLeft
 * @param {number} numberOfDecimals
 */
function sliceLabelNode(isotopeConfig, isotopePercentage, labelOnLeft, numberOfDecimals) {
  const node = new Node();

  // The "unconstrained position" is the position where this label would be placed if it didn't need to sit within the
  // upper and lower bounds of the pie chart and didn't have to worry about avoiding overlap with other labels.
  // It is used for arbitrating how labels move when handling overlap.
  node.unconstrainedPos = new Vector2(0, 0);
  node.labelOnLeft = labelOnLeft;
  const symbol = chemSymbolWithNumbersNode(isotopeConfig);
  node.addChild(symbol);
  const readoutText = new Text(`${Utils.toFixedNumber(isotopePercentage, numberOfDecimals)}%`, {
    font: READOUT_FONT,
    maxWidth: 0.9 * SIZE.width,
    maxHeight: 0.9 * SIZE.height
  });
  const readoutPanel = new Panel(readoutText, {
    minWidth: SIZE.width,
    minHeight: SIZE.height,
    resize: false,
    cornerRadius: 2,
    lineWidth: 1,
    align: 'center',
    fill: 'white'
  });
  readoutText.centerX = SIZE.width / 2;
  node.addChild(readoutPanel);

  // Make the two portions of the label line up on the horizontal axis
  if (symbol.height > readoutPanel.height) {
    readoutPanel.centerY = symbol.centerY;
  } else {
    symbol.centerY = readoutPanel.centerY;
  }

  // Position the elements of the overall label.
  if (labelOnLeft) {
    readoutPanel.left = symbol.right + 5;
    readoutText.centerX = readoutPanel.width / 2;
  } else {
    symbol.left = readoutPanel.right + 5;
  }
  return node;
}
class IsotopeProportionsPieChart extends Node {
  /**
   * @param {MixIsotopesModel} model
   */
  constructor(model) {
    super();
    this.model = model;
    this.labelLayer = new Node();
    this.addChild(this.labelLayer);
    this.pieChartBoundingRectangle = new Rectangle(-OVERALL_HEIGHT / 2, -OVERALL_HEIGHT / 2, OVERALL_HEIGHT, OVERALL_HEIGHT, 0, 0);
    this.emptyCircle = new Circle(PIE_CHART_RADIUS, {
      stroke: 'black',
      lineDash: [3, 1]
    });
    this.emptyCircle.centerX = 0;
    this.emptyCircle.centerY = 0;
    this.pieChartBoundingRectangle.addChild(this.emptyCircle);

    // default slices this will be updated based on possible isotopes
    this.slices = [];
    this.sliceLabels = [];
    this.pieChart = new PieChartNode(this.slices, PIE_CHART_RADIUS);
    this.pieChartBoundingRectangle.addChild(this.pieChart);
    this.addChild(this.pieChartBoundingRectangle);
  }

  /**
   * Update the complete node based on isotopeCount
   * @public
   */
  update() {
    if (this.model.testChamber.isotopeCountProperty.get() > 0) {
      this.emptyCircle.setVisible(false);
      this.updatePieChart();
      this.pieChart.setVisible(true);
      this.labelLayer.setVisible(true);
    } else {
      this.emptyCircle.setVisible(true);
      this.pieChart.setVisible(false);
      this.labelLayer.setVisible(false);
    }
  }

  /**
   * Update the pie chart
   * @public
   */
  updatePieChart() {
    this.slices = [];
    let i = 0;
    this.model.possibleIsotopesProperty.get().forEach(isotope => {
      const value = this.model.testChamber.getIsotopeCount(isotope);
      const color = this.model.getColorForIsotope(isotope);
      this.slices[i] = {
        value: value,
        color: color,
        stroke: 'black',
        lineWidth: 0.5
      };
      i += 1;
    });
    const lightestIsotopeProportion = this.slices[0].value / this.model.testChamber.isotopeCountProperty.get();
    this.pieChart.setAngleAndValues(Math.PI - lightestIsotopeProportion * Math.PI, this.slices);
    this.updateLabels(this.model.possibleIsotopesProperty.get());
  }

  /**
   * @param {Array.<Object>} possibleIsotopes
   * @private
   */
  updateLabels(possibleIsotopes) {
    this.labelLayer.removeAllChildren();
    this.sliceLabels = [];
    let i = 0;
    possibleIsotopes.forEach(isotope => {
      let proportion;
      if (this.model.showingNaturesMixProperty.get()) {
        proportion = AtomIdentifier.getNaturalAbundance(isotope, NUMBER_DECIMALS + 2); // 2 more digits since % is used
      } else {
        proportion = this.model.testChamber.getIsotopeProportion(isotope);
      }
      const centerEdgeOfPieSlice = this.pieChart.getCenterEdgePtForSlice(i);
      if (centerEdgeOfPieSlice) {
        const labelOnLeft = centerEdgeOfPieSlice.x <= this.pieChart.centerXCord;
        const numberOfDecimals = this.model.showingNaturesMixProperty.get() ? NUMBER_DECIMALS : 1;
        const labelNode = sliceLabelNode(isotope, proportion * 100, labelOnLeft, numberOfDecimals);

        // Determine the "unconstrained" target position for the label, meaning a position that is directly out from
        // the edge of the slice, but may be above or below the edges of the pie chart.
        const posVector = centerEdgeOfPieSlice;
        const positionVector = posVector.times(1.6); // empirically determined for positioning
        labelNode.unconstrainedPos.x = positionVector.x;
        labelNode.unconstrainedPos.y = positionVector.y;

        // Constrain the position so that no part of the label goes above or below the upper and lower edges
        // of the pie chart.
        const minY = -OVERALL_HEIGHT / 2 + labelNode.height / 2;
        const maxY = OVERALL_HEIGHT / 2 - labelNode.height / 2;
        const xSign = labelOnLeft ? -1 : 1;
        if (positionVector.y < minY) {
          positionVector.x = xSign * Math.sqrt(positionVector.magnitudeSquared - minY * minY);
          positionVector.y = minY;
        } else if (positionVector.y > maxY) {
          positionVector.x = xSign * Math.sqrt(positionVector.magnitudeSquared - maxY * maxY);
          positionVector.y = maxY;
        }
        labelNode.unconstrainedPos.x = positionVector.x;

        // Position the label.
        if (labelOnLeft) {
          labelNode.centerX = positionVector.x - labelNode.width / 2;
          labelNode.centerY = positionVector.y;
        } else {
          labelNode.centerX = positionVector.x + labelNode.width / 2;
          labelNode.centerY = positionVector.y;
        }
        this.labelLayer.addChild(labelNode);
        this.sliceLabels.push(labelNode);
      }
      i = i + 1;
    });
    this.adjustLabelPositionsForOverlap(this.sliceLabels, -OVERALL_HEIGHT / 2, OVERALL_HEIGHT / 2);

    // The labels should now be all in reasonable positions, so draw a line from the edge of the label to the pie
    // slice to which it corresponds.
    let j = 0;
    let k = 0;
    possibleIsotopes.forEach(isotope => {
      const sliceConnectPt = this.pieChart.getCenterEdgePtForSlice(j);
      if (sliceConnectPt) {
        const label = this.sliceLabels[k];
        const labelConnectPt = new Vector2(0, 0);
        if (label.centerX > this.pieChart.centerX) {
          // Label is on right, so connect point should be on left.
          labelConnectPt.x = label.left;
          labelConnectPt.y = label.centerY;
        } else {
          // Label is on left, so connect point should be on right.
          labelConnectPt.x = label.right;
          labelConnectPt.y = label.centerY;
        }
        // Find a point that is straight out from the center of the pie chart above the point that connects to the
        // slice. Note that these calculations assume that the center of the pie chart is at (0,0).
        const connectingLineShape = new Shape().moveTo(sliceConnectPt.x, sliceConnectPt.y);
        if (sliceConnectPt.y > OVERALL_HEIGHT * 0.25 || sliceConnectPt.y < -OVERALL_HEIGHT * 0.25) {
          // Add a "bend point" so that the line doesn't go under the pie chart.
          const additionalLength = OVERALL_HEIGHT / (PIE_CHART_RADIUS * 2) - 1;
          const scaleFactor = 1 - Math.min(Math.abs(sliceConnectPt.x) / (PIE_CHART_RADIUS / 2.0), 1);
          connectingLineShape.lineTo(sliceConnectPt.x * (1 + additionalLength * scaleFactor), sliceConnectPt.y * (1 + additionalLength * scaleFactor));
        }
        connectingLineShape.lineTo(labelConnectPt.x, labelConnectPt.y);
        this.labelLayer.addChild(new Path(connectingLineShape, {
          stroke: 'black',
          lineWidth: 1
        }));
        k = k + 1;
      }
      j = j + 1;
    });
  }

  /**
   * @param {Array.<Object>} sliceLabels
   * @param {number} minY
   * @param {number} maxY
   * @private
   */
  adjustLabelPositionsForOverlap(sliceLabels, minY, maxY) {
    const rotationIncrement = Math.PI / 200; // Empirically chosen.
    for (let i = 1; i < 50; i++) {
      // Number of iterations empirically chosen.
      let overlapDetected = false;
      sliceLabels.forEach(label => {
        let moveUp = false;
        let moveDown = false;
        for (let j = 0; j < sliceLabels.length; j++) {
          const comparisonLabel = sliceLabels[j];
          if (label === comparisonLabel) {
            // Same label, so ignore.
            continue;
          }
          if (label.bounds.intersectsBounds(comparisonLabel.bounds)) {
            // These labels overlap.
            overlapDetected = true;
            if (label.unconstrainedPos.y > comparisonLabel.unconstrainedPos.y && label.bottom < maxY) {
              moveUp = true;
            } else if (label.unconstrainedPos.y < comparisonLabel.unconstrainedPos.y && label.top > minY) {
              moveDown = true;
            }
          }
        }

        // Adjust this label's position based upon any overlap that was detected.  The general idea is this: if there
        // is overlap in both directions, don't move.  If there is only overlap with a label that has a higher
        // unconstrained position, move down.  If there is only overlap with a label with a lower unconstrained
        // position, move down.
        let posVector;
        if (moveUp && !moveDown) {
          if (label.labelOnLeft) {
            posVector = new Vector2(label.right, label.centerY + label.height / 2);
            posVector.rotate(-rotationIncrement);
            label.centerX = posVector.x - label.width / 2;
            label.centerY = posVector.y - label.height / 2;
          } else {
            posVector = new Vector2(label.centerX, label.centerY + label.height / 2);
            posVector.rotate(rotationIncrement);
            label.centerX = posVector.x;
            label.centerY = posVector.y - label.height / 2;
          }
        } else if (moveDown && !moveUp) {
          if (label.labelOnLeft) {
            posVector = new Vector2(label.right, label.centerY + label.height / 2);
            posVector.rotate(rotationIncrement);
            label.centerX = posVector.x - label.width / 2;
            label.centerY = posVector.y - label.height / 2;
          } else {
            posVector = new Vector2(label.centerX, label.centerY + label.height / 2);
            posVector.rotate(-rotationIncrement);
            label.centerX = posVector.x;
            label.centerY = posVector.y - label.height / 2;
          }
        }
      });
      if (!overlapDetected) {
        // No overlap was detected for any of the labels, so we're done.
        break;
      }
    }
  }
}
isotopesAndAtomicMass.register('IsotopeProportionsPieChart', IsotopeProportionsPieChart);
export default IsotopeProportionsPieChart;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiVXRpbHMiLCJWZWN0b3IyIiwiU2hhcGUiLCJQaGV0Rm9udCIsIkNpcmNsZSIsIk5vZGUiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiVGV4dCIsIkF0b21JZGVudGlmaWVyIiwiUGFuZWwiLCJQaWVDaGFydE5vZGUiLCJpc290b3Blc0FuZEF0b21pY01hc3MiLCJQSUVfQ0hBUlRfUkFESVVTIiwiT1ZFUkFMTF9IRUlHSFQiLCJSRUFET1VUX0ZPTlQiLCJTSVpFIiwiQ0hFTUlDQUxfU1lNQk9MX0ZPTlQiLCJTVVBFUlNDUklQVF9TVUJTQ1JJUFRfRk9OVCIsIk5VTUJFUl9ERUNJTUFMUyIsImNoZW1TeW1ib2xXaXRoTnVtYmVyc05vZGUiLCJpc290b3BlQ29uZmlnIiwibm9kZSIsInN5bWJvbCIsImdldFN5bWJvbCIsInByb3RvbkNvdW50UHJvcGVydHkiLCJnZXQiLCJmb250IiwiY2VudGVyWCIsImNlbnRlclkiLCJhZGRDaGlsZCIsIm1hc3NOdW1iZXIiLCJtYXNzTnVtYmVyUHJvcGVydHkiLCJ0b3AiLCJyaWdodCIsImxlZnQiLCJhdG9taWNOdW1iZXIiLCJib3R0b20iLCJzbGljZUxhYmVsTm9kZSIsImlzb3RvcGVQZXJjZW50YWdlIiwibGFiZWxPbkxlZnQiLCJudW1iZXJPZkRlY2ltYWxzIiwidW5jb25zdHJhaW5lZFBvcyIsInJlYWRvdXRUZXh0IiwidG9GaXhlZE51bWJlciIsIm1heFdpZHRoIiwid2lkdGgiLCJtYXhIZWlnaHQiLCJoZWlnaHQiLCJyZWFkb3V0UGFuZWwiLCJtaW5XaWR0aCIsIm1pbkhlaWdodCIsInJlc2l6ZSIsImNvcm5lclJhZGl1cyIsImxpbmVXaWR0aCIsImFsaWduIiwiZmlsbCIsIklzb3RvcGVQcm9wb3J0aW9uc1BpZUNoYXJ0IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsImxhYmVsTGF5ZXIiLCJwaWVDaGFydEJvdW5kaW5nUmVjdGFuZ2xlIiwiZW1wdHlDaXJjbGUiLCJzdHJva2UiLCJsaW5lRGFzaCIsInNsaWNlcyIsInNsaWNlTGFiZWxzIiwicGllQ2hhcnQiLCJ1cGRhdGUiLCJ0ZXN0Q2hhbWJlciIsImlzb3RvcGVDb3VudFByb3BlcnR5Iiwic2V0VmlzaWJsZSIsInVwZGF0ZVBpZUNoYXJ0IiwiaSIsInBvc3NpYmxlSXNvdG9wZXNQcm9wZXJ0eSIsImZvckVhY2giLCJpc290b3BlIiwidmFsdWUiLCJnZXRJc290b3BlQ291bnQiLCJjb2xvciIsImdldENvbG9yRm9ySXNvdG9wZSIsImxpZ2h0ZXN0SXNvdG9wZVByb3BvcnRpb24iLCJzZXRBbmdsZUFuZFZhbHVlcyIsIk1hdGgiLCJQSSIsInVwZGF0ZUxhYmVscyIsInBvc3NpYmxlSXNvdG9wZXMiLCJyZW1vdmVBbGxDaGlsZHJlbiIsInByb3BvcnRpb24iLCJzaG93aW5nTmF0dXJlc01peFByb3BlcnR5IiwiZ2V0TmF0dXJhbEFidW5kYW5jZSIsImdldElzb3RvcGVQcm9wb3J0aW9uIiwiY2VudGVyRWRnZU9mUGllU2xpY2UiLCJnZXRDZW50ZXJFZGdlUHRGb3JTbGljZSIsIngiLCJjZW50ZXJYQ29yZCIsImxhYmVsTm9kZSIsInBvc1ZlY3RvciIsInBvc2l0aW9uVmVjdG9yIiwidGltZXMiLCJ5IiwibWluWSIsIm1heFkiLCJ4U2lnbiIsInNxcnQiLCJtYWduaXR1ZGVTcXVhcmVkIiwicHVzaCIsImFkanVzdExhYmVsUG9zaXRpb25zRm9yT3ZlcmxhcCIsImoiLCJrIiwic2xpY2VDb25uZWN0UHQiLCJsYWJlbCIsImxhYmVsQ29ubmVjdFB0IiwiY29ubmVjdGluZ0xpbmVTaGFwZSIsIm1vdmVUbyIsImFkZGl0aW9uYWxMZW5ndGgiLCJzY2FsZUZhY3RvciIsIm1pbiIsImFicyIsImxpbmVUbyIsInJvdGF0aW9uSW5jcmVtZW50Iiwib3ZlcmxhcERldGVjdGVkIiwibW92ZVVwIiwibW92ZURvd24iLCJsZW5ndGgiLCJjb21wYXJpc29uTGFiZWwiLCJib3VuZHMiLCJpbnRlcnNlY3RzQm91bmRzIiwicm90YXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJc290b3BlUHJvcG9ydGlvbnNQaWVDaGFydC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDbGFzcyB0aGF0IHJlcHJlc2VudHMgYSBwaWUgY2hhcnQgcG9ydHJheWluZyB0aGUgcHJvcG9ydGlvbiBvZiB0aGUgdmFyaW91cyBpc290b3BlcyBpbiB0aGUgdGVzdCBjaGFtYmVyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEFhZGlzaCBHdXB0YVxyXG4gKlxyXG4gKi9cclxuXHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBOb2RlLCBQYXRoLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQXRvbUlkZW50aWZpZXIgZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvQXRvbUlkZW50aWZpZXIuanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IFBpZUNoYXJ0Tm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9QaWVDaGFydE5vZGUuanMnO1xyXG5pbXBvcnQgaXNvdG9wZXNBbmRBdG9taWNNYXNzIGZyb20gJy4uLy4uL2lzb3RvcGVzQW5kQXRvbWljTWFzcy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgUElFX0NIQVJUX1JBRElVUyA9IDQwO1xyXG5jb25zdCBPVkVSQUxMX0hFSUdIVCA9IDEyMDtcclxuY29uc3QgUkVBRE9VVF9GT05UID0gbmV3IFBoZXRGb250KCAxOCApO1xyXG5jb25zdCBTSVpFID0gbmV3IERpbWVuc2lvbjIoIDkwLCAyMCApO1xyXG5jb25zdCBDSEVNSUNBTF9TWU1CT0xfRk9OVCA9IG5ldyBQaGV0Rm9udCggMTYgKTtcclxuY29uc3QgU1VQRVJTQ1JJUFRfU1VCU0NSSVBUX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDE0ICk7XHJcbmNvbnN0IE5VTUJFUl9ERUNJTUFMUyA9IDQ7XHJcblxyXG4vKipcclxuICogVXRpbGl0eSBmdW5jdGlvbiB0byBjcmVhdGUgYSBub2RlIHdoaWNoIHJlcHJlc2VudHMgYSBjaGVtaWNhbCBzeW1ib2wsIGluY2x1ZGluZyB0aGUgbWFzcyBudW1iZXIoaW4gZnJvbnQgb2YgdGhlXHJcbiAqIGNoZW1pY2FsIHN5bWJvbCBhbmQgcGFydGlhbGx5IGFib3ZlIGl0KSBhbmQgdGhlIGF0b21pYyBudW1iZXIgKGluIGZyb250IG9mIHRoZSBjaGVtaWNhbCBzeW1ib2wgYW5kIHBhcnRpYWxseSBiZWxvdyBpdCkuXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyQXRvbX0gaXNvdG9wZUNvbmZpZ1xyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIGNoZW1TeW1ib2xXaXRoTnVtYmVyc05vZGUoIGlzb3RvcGVDb25maWcgKSB7XHJcbiAgY29uc3Qgbm9kZSA9IG5ldyBOb2RlKCk7XHJcblxyXG4gIGNvbnN0IHN5bWJvbCA9IG5ldyBUZXh0KCBBdG9tSWRlbnRpZmllci5nZXRTeW1ib2woIGlzb3RvcGVDb25maWcucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSApLCB7XHJcbiAgICBmb250OiBDSEVNSUNBTF9TWU1CT0xfRk9OVCxcclxuICAgIGNlbnRlclg6IDAsXHJcbiAgICBjZW50ZXJZOiAwXHJcbiAgfSApO1xyXG4gIG5vZGUuYWRkQ2hpbGQoIHN5bWJvbCApO1xyXG5cclxuICBjb25zdCBtYXNzTnVtYmVyID0gbmV3IFRleHQoIGlzb3RvcGVDb25maWcubWFzc051bWJlclByb3BlcnR5LmdldCgpLCB7XHJcbiAgICBmb250OiBTVVBFUlNDUklQVF9TVUJTQ1JJUFRfRk9OVCxcclxuICAgIGNlbnRlclk6IHN5bWJvbC50b3BcclxuICB9ICk7XHJcbiAgbWFzc051bWJlci5yaWdodCA9IHN5bWJvbC5sZWZ0O1xyXG4gIG5vZGUuYWRkQ2hpbGQoIG1hc3NOdW1iZXIgKTtcclxuXHJcbiAgY29uc3QgYXRvbWljTnVtYmVyID0gbmV3IFRleHQoIGlzb3RvcGVDb25maWcucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSwge1xyXG4gICAgZm9udDogU1VQRVJTQ1JJUFRfU1VCU0NSSVBUX0ZPTlQsXHJcbiAgICBjZW50ZXJZOiBzeW1ib2wuYm90dG9tXHJcbiAgfSApO1xyXG4gIGF0b21pY051bWJlci5yaWdodCA9IHN5bWJvbC5sZWZ0O1xyXG4gIG5vZGUuYWRkQ2hpbGQoIGF0b21pY051bWJlciApO1xyXG5cclxuICByZXR1cm4gbm9kZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7TnVtYmVyQXRvbX0gaXNvdG9wZUNvbmZpZ1xyXG4gKiBAcGFyYW0ge251bWJlcn0gaXNvdG9wZVBlcmNlbnRhZ2VcclxuICogQHBhcmFtIHtib29sZWFufSBsYWJlbE9uTGVmdFxyXG4gKiBAcGFyYW0ge251bWJlcn0gbnVtYmVyT2ZEZWNpbWFsc1xyXG4gKi9cclxuZnVuY3Rpb24gc2xpY2VMYWJlbE5vZGUoIGlzb3RvcGVDb25maWcsIGlzb3RvcGVQZXJjZW50YWdlLCBsYWJlbE9uTGVmdCwgbnVtYmVyT2ZEZWNpbWFscyApIHtcclxuICBjb25zdCBub2RlID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgLy8gVGhlIFwidW5jb25zdHJhaW5lZCBwb3NpdGlvblwiIGlzIHRoZSBwb3NpdGlvbiB3aGVyZSB0aGlzIGxhYmVsIHdvdWxkIGJlIHBsYWNlZCBpZiBpdCBkaWRuJ3QgbmVlZCB0byBzaXQgd2l0aGluIHRoZVxyXG4gIC8vIHVwcGVyIGFuZCBsb3dlciBib3VuZHMgb2YgdGhlIHBpZSBjaGFydCBhbmQgZGlkbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgYXZvaWRpbmcgb3ZlcmxhcCB3aXRoIG90aGVyIGxhYmVscy5cclxuICAvLyBJdCBpcyB1c2VkIGZvciBhcmJpdHJhdGluZyBob3cgbGFiZWxzIG1vdmUgd2hlbiBoYW5kbGluZyBvdmVybGFwLlxyXG4gIG5vZGUudW5jb25zdHJhaW5lZFBvcyA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcblxyXG4gIG5vZGUubGFiZWxPbkxlZnQgPSBsYWJlbE9uTGVmdDtcclxuICBjb25zdCBzeW1ib2wgPSBjaGVtU3ltYm9sV2l0aE51bWJlcnNOb2RlKCBpc290b3BlQ29uZmlnICk7XHJcbiAgbm9kZS5hZGRDaGlsZCggc3ltYm9sICk7XHJcblxyXG4gIGNvbnN0IHJlYWRvdXRUZXh0ID0gbmV3IFRleHQoIGAke1V0aWxzLnRvRml4ZWROdW1iZXIoIGlzb3RvcGVQZXJjZW50YWdlLCBudW1iZXJPZkRlY2ltYWxzICl9JWAsIHtcclxuICAgIGZvbnQ6IFJFQURPVVRfRk9OVCxcclxuICAgIG1heFdpZHRoOiAwLjkgKiBTSVpFLndpZHRoLFxyXG4gICAgbWF4SGVpZ2h0OiAwLjkgKiBTSVpFLmhlaWdodFxyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgcmVhZG91dFBhbmVsID0gbmV3IFBhbmVsKCByZWFkb3V0VGV4dCwge1xyXG4gICAgbWluV2lkdGg6IFNJWkUud2lkdGgsXHJcbiAgICBtaW5IZWlnaHQ6IFNJWkUuaGVpZ2h0LFxyXG4gICAgcmVzaXplOiBmYWxzZSxcclxuICAgIGNvcm5lclJhZGl1czogMixcclxuICAgIGxpbmVXaWR0aDogMSxcclxuICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgIGZpbGw6ICd3aGl0ZSdcclxuICB9ICk7XHJcbiAgcmVhZG91dFRleHQuY2VudGVyWCA9IFNJWkUud2lkdGggLyAyO1xyXG4gIG5vZGUuYWRkQ2hpbGQoIHJlYWRvdXRQYW5lbCApO1xyXG5cclxuICAvLyBNYWtlIHRoZSB0d28gcG9ydGlvbnMgb2YgdGhlIGxhYmVsIGxpbmUgdXAgb24gdGhlIGhvcml6b250YWwgYXhpc1xyXG4gIGlmICggc3ltYm9sLmhlaWdodCA+IHJlYWRvdXRQYW5lbC5oZWlnaHQgKSB7XHJcbiAgICByZWFkb3V0UGFuZWwuY2VudGVyWSA9IHN5bWJvbC5jZW50ZXJZO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIHN5bWJvbC5jZW50ZXJZID0gcmVhZG91dFBhbmVsLmNlbnRlclk7XHJcbiAgfVxyXG5cclxuICAvLyBQb3NpdGlvbiB0aGUgZWxlbWVudHMgb2YgdGhlIG92ZXJhbGwgbGFiZWwuXHJcbiAgaWYgKCBsYWJlbE9uTGVmdCApIHtcclxuICAgIHJlYWRvdXRQYW5lbC5sZWZ0ID0gc3ltYm9sLnJpZ2h0ICsgNTtcclxuICAgIHJlYWRvdXRUZXh0LmNlbnRlclggPSByZWFkb3V0UGFuZWwud2lkdGggLyAyO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIHN5bWJvbC5sZWZ0ID0gcmVhZG91dFBhbmVsLnJpZ2h0ICsgNTtcclxuICB9XHJcbiAgcmV0dXJuIG5vZGU7XHJcbn1cclxuXHJcbmNsYXNzIElzb3RvcGVQcm9wb3J0aW9uc1BpZUNoYXJ0IGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TWl4SXNvdG9wZXNNb2RlbH0gbW9kZWxcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwgKSB7XHJcbiAgICBzdXBlcigpO1xyXG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG4gICAgdGhpcy5sYWJlbExheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMubGFiZWxMYXllciApO1xyXG4gICAgdGhpcy5waWVDaGFydEJvdW5kaW5nUmVjdGFuZ2xlID0gbmV3IFJlY3RhbmdsZSggLU9WRVJBTExfSEVJR0hUIC8gMiwgLU9WRVJBTExfSEVJR0hUIC8gMixcclxuICAgICAgT1ZFUkFMTF9IRUlHSFQsIE9WRVJBTExfSEVJR0hULCAwLCAwICk7XHJcbiAgICB0aGlzLmVtcHR5Q2lyY2xlID0gbmV3IENpcmNsZSggUElFX0NIQVJUX1JBRElVUywgeyBzdHJva2U6ICdibGFjaycsIGxpbmVEYXNoOiBbIDMsIDEgXSB9ICk7XHJcbiAgICB0aGlzLmVtcHR5Q2lyY2xlLmNlbnRlclggPSAwO1xyXG4gICAgdGhpcy5lbXB0eUNpcmNsZS5jZW50ZXJZID0gMDtcclxuICAgIHRoaXMucGllQ2hhcnRCb3VuZGluZ1JlY3RhbmdsZS5hZGRDaGlsZCggdGhpcy5lbXB0eUNpcmNsZSApO1xyXG5cclxuICAgIC8vIGRlZmF1bHQgc2xpY2VzIHRoaXMgd2lsbCBiZSB1cGRhdGVkIGJhc2VkIG9uIHBvc3NpYmxlIGlzb3RvcGVzXHJcbiAgICB0aGlzLnNsaWNlcyA9IFtdO1xyXG4gICAgdGhpcy5zbGljZUxhYmVscyA9IFtdO1xyXG4gICAgdGhpcy5waWVDaGFydCA9IG5ldyBQaWVDaGFydE5vZGUoIHRoaXMuc2xpY2VzLCBQSUVfQ0hBUlRfUkFESVVTICk7XHJcbiAgICB0aGlzLnBpZUNoYXJ0Qm91bmRpbmdSZWN0YW5nbGUuYWRkQ2hpbGQoIHRoaXMucGllQ2hhcnQgKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnBpZUNoYXJ0Qm91bmRpbmdSZWN0YW5nbGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgY29tcGxldGUgbm9kZSBiYXNlZCBvbiBpc290b3BlQ291bnRcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgaWYgKCB0aGlzLm1vZGVsLnRlc3RDaGFtYmVyLmlzb3RvcGVDb3VudFByb3BlcnR5LmdldCgpID4gMCApIHtcclxuICAgICAgdGhpcy5lbXB0eUNpcmNsZS5zZXRWaXNpYmxlKCBmYWxzZSApO1xyXG4gICAgICB0aGlzLnVwZGF0ZVBpZUNoYXJ0KCk7XHJcbiAgICAgIHRoaXMucGllQ2hhcnQuc2V0VmlzaWJsZSggdHJ1ZSApO1xyXG4gICAgICB0aGlzLmxhYmVsTGF5ZXIuc2V0VmlzaWJsZSggdHJ1ZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuZW1wdHlDaXJjbGUuc2V0VmlzaWJsZSggdHJ1ZSApO1xyXG4gICAgICB0aGlzLnBpZUNoYXJ0LnNldFZpc2libGUoIGZhbHNlICk7XHJcbiAgICAgIHRoaXMubGFiZWxMYXllci5zZXRWaXNpYmxlKCBmYWxzZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSBwaWUgY2hhcnRcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdXBkYXRlUGllQ2hhcnQoKSB7XHJcbiAgICB0aGlzLnNsaWNlcyA9IFtdO1xyXG4gICAgbGV0IGkgPSAwO1xyXG4gICAgdGhpcy5tb2RlbC5wb3NzaWJsZUlzb3RvcGVzUHJvcGVydHkuZ2V0KCkuZm9yRWFjaCggaXNvdG9wZSA9PiB7XHJcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5tb2RlbC50ZXN0Q2hhbWJlci5nZXRJc290b3BlQ291bnQoIGlzb3RvcGUgKTtcclxuICAgICAgY29uc3QgY29sb3IgPSB0aGlzLm1vZGVsLmdldENvbG9yRm9ySXNvdG9wZSggaXNvdG9wZSApO1xyXG4gICAgICB0aGlzLnNsaWNlc1sgaSBdID0geyB2YWx1ZTogdmFsdWUsIGNvbG9yOiBjb2xvciwgc3Ryb2tlOiAnYmxhY2snLCBsaW5lV2lkdGg6IDAuNSB9O1xyXG4gICAgICBpICs9IDE7XHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBsaWdodGVzdElzb3RvcGVQcm9wb3J0aW9uID0gdGhpcy5zbGljZXNbIDAgXS52YWx1ZSAvIHRoaXMubW9kZWwudGVzdENoYW1iZXIuaXNvdG9wZUNvdW50UHJvcGVydHkuZ2V0KCk7XHJcbiAgICB0aGlzLnBpZUNoYXJ0LnNldEFuZ2xlQW5kVmFsdWVzKCBNYXRoLlBJIC0gKCBsaWdodGVzdElzb3RvcGVQcm9wb3J0aW9uICogTWF0aC5QSSApLCB0aGlzLnNsaWNlcyApO1xyXG4gICAgdGhpcy51cGRhdGVMYWJlbHMoIHRoaXMubW9kZWwucG9zc2libGVJc290b3Blc1Byb3BlcnR5LmdldCgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0FycmF5LjxPYmplY3Q+fSBwb3NzaWJsZUlzb3RvcGVzXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVMYWJlbHMoIHBvc3NpYmxlSXNvdG9wZXMgKSB7XHJcbiAgICB0aGlzLmxhYmVsTGF5ZXIucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcclxuICAgIHRoaXMuc2xpY2VMYWJlbHMgPSBbXTtcclxuICAgIGxldCBpID0gMDtcclxuICAgIHBvc3NpYmxlSXNvdG9wZXMuZm9yRWFjaCggaXNvdG9wZSA9PiB7XHJcbiAgICAgIGxldCBwcm9wb3J0aW9uO1xyXG4gICAgICBpZiAoIHRoaXMubW9kZWwuc2hvd2luZ05hdHVyZXNNaXhQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICBwcm9wb3J0aW9uID0gQXRvbUlkZW50aWZpZXIuZ2V0TmF0dXJhbEFidW5kYW5jZSggaXNvdG9wZSwgTlVNQkVSX0RFQ0lNQUxTICsgMiApOyAvLyAyIG1vcmUgZGlnaXRzIHNpbmNlICUgaXMgdXNlZFxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHByb3BvcnRpb24gPSB0aGlzLm1vZGVsLnRlc3RDaGFtYmVyLmdldElzb3RvcGVQcm9wb3J0aW9uKCBpc290b3BlICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGNlbnRlckVkZ2VPZlBpZVNsaWNlID0gdGhpcy5waWVDaGFydC5nZXRDZW50ZXJFZGdlUHRGb3JTbGljZSggaSApO1xyXG4gICAgICBpZiAoIGNlbnRlckVkZ2VPZlBpZVNsaWNlICkge1xyXG4gICAgICAgIGNvbnN0IGxhYmVsT25MZWZ0ID0gY2VudGVyRWRnZU9mUGllU2xpY2UueCA8PSB0aGlzLnBpZUNoYXJ0LmNlbnRlclhDb3JkO1xyXG4gICAgICAgIGNvbnN0IG51bWJlck9mRGVjaW1hbHMgPSB0aGlzLm1vZGVsLnNob3dpbmdOYXR1cmVzTWl4UHJvcGVydHkuZ2V0KCkgPyBOVU1CRVJfREVDSU1BTFMgOiAxO1xyXG4gICAgICAgIGNvbnN0IGxhYmVsTm9kZSA9IHNsaWNlTGFiZWxOb2RlKCBpc290b3BlLCBwcm9wb3J0aW9uICogMTAwLCBsYWJlbE9uTGVmdCwgbnVtYmVyT2ZEZWNpbWFscyApO1xyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgdGhlIFwidW5jb25zdHJhaW5lZFwiIHRhcmdldCBwb3NpdGlvbiBmb3IgdGhlIGxhYmVsLCBtZWFuaW5nIGEgcG9zaXRpb24gdGhhdCBpcyBkaXJlY3RseSBvdXQgZnJvbVxyXG4gICAgICAgIC8vIHRoZSBlZGdlIG9mIHRoZSBzbGljZSwgYnV0IG1heSBiZSBhYm92ZSBvciBiZWxvdyB0aGUgZWRnZXMgb2YgdGhlIHBpZSBjaGFydC5cclxuICAgICAgICBjb25zdCBwb3NWZWN0b3IgPSBjZW50ZXJFZGdlT2ZQaWVTbGljZTtcclxuICAgICAgICBjb25zdCBwb3NpdGlvblZlY3RvciA9IHBvc1ZlY3Rvci50aW1lcyggMS42ICk7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWQgZm9yIHBvc2l0aW9uaW5nXHJcbiAgICAgICAgbGFiZWxOb2RlLnVuY29uc3RyYWluZWRQb3MueCA9IHBvc2l0aW9uVmVjdG9yLng7XHJcbiAgICAgICAgbGFiZWxOb2RlLnVuY29uc3RyYWluZWRQb3MueSA9IHBvc2l0aW9uVmVjdG9yLnk7XHJcblxyXG4gICAgICAgIC8vIENvbnN0cmFpbiB0aGUgcG9zaXRpb24gc28gdGhhdCBubyBwYXJ0IG9mIHRoZSBsYWJlbCBnb2VzIGFib3ZlIG9yIGJlbG93IHRoZSB1cHBlciBhbmQgbG93ZXIgZWRnZXNcclxuICAgICAgICAvLyBvZiB0aGUgcGllIGNoYXJ0LlxyXG4gICAgICAgIGNvbnN0IG1pblkgPSAtT1ZFUkFMTF9IRUlHSFQgLyAyICsgbGFiZWxOb2RlLmhlaWdodCAvIDI7XHJcbiAgICAgICAgY29uc3QgbWF4WSA9IE9WRVJBTExfSEVJR0hUIC8gMiAtIGxhYmVsTm9kZS5oZWlnaHQgLyAyO1xyXG4gICAgICAgIGNvbnN0IHhTaWduID0gbGFiZWxPbkxlZnQgPyAtMSA6IDE7XHJcbiAgICAgICAgaWYgKCBwb3NpdGlvblZlY3Rvci55IDwgbWluWSApIHtcclxuICAgICAgICAgIHBvc2l0aW9uVmVjdG9yLnggPSB4U2lnbiAqIE1hdGguc3FydCggcG9zaXRpb25WZWN0b3IubWFnbml0dWRlU3F1YXJlZCAtIG1pblkgKiBtaW5ZICk7XHJcbiAgICAgICAgICBwb3NpdGlvblZlY3Rvci55ID0gbWluWTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIHBvc2l0aW9uVmVjdG9yLnkgPiBtYXhZICkge1xyXG4gICAgICAgICAgcG9zaXRpb25WZWN0b3IueCA9IHhTaWduICogTWF0aC5zcXJ0KCBwb3NpdGlvblZlY3Rvci5tYWduaXR1ZGVTcXVhcmVkIC0gbWF4WSAqIG1heFkgKTtcclxuICAgICAgICAgIHBvc2l0aW9uVmVjdG9yLnkgPSBtYXhZO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsYWJlbE5vZGUudW5jb25zdHJhaW5lZFBvcy54ID0gcG9zaXRpb25WZWN0b3IueDtcclxuXHJcbiAgICAgICAgLy8gUG9zaXRpb24gdGhlIGxhYmVsLlxyXG4gICAgICAgIGlmICggbGFiZWxPbkxlZnQgKSB7XHJcbiAgICAgICAgICBsYWJlbE5vZGUuY2VudGVyWCA9IHBvc2l0aW9uVmVjdG9yLnggLSBsYWJlbE5vZGUud2lkdGggLyAyO1xyXG4gICAgICAgICAgbGFiZWxOb2RlLmNlbnRlclkgPSBwb3NpdGlvblZlY3Rvci55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGxhYmVsTm9kZS5jZW50ZXJYID0gcG9zaXRpb25WZWN0b3IueCArIGxhYmVsTm9kZS53aWR0aCAvIDI7XHJcbiAgICAgICAgICBsYWJlbE5vZGUuY2VudGVyWSA9IHBvc2l0aW9uVmVjdG9yLnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubGFiZWxMYXllci5hZGRDaGlsZCggbGFiZWxOb2RlICk7XHJcbiAgICAgICAgdGhpcy5zbGljZUxhYmVscy5wdXNoKCBsYWJlbE5vZGUgKTtcclxuICAgICAgfVxyXG4gICAgICBpID0gaSArIDE7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkanVzdExhYmVsUG9zaXRpb25zRm9yT3ZlcmxhcCggdGhpcy5zbGljZUxhYmVscywgLU9WRVJBTExfSEVJR0hUIC8gMiwgT1ZFUkFMTF9IRUlHSFQgLyAyICk7XHJcblxyXG4gICAgLy8gVGhlIGxhYmVscyBzaG91bGQgbm93IGJlIGFsbCBpbiByZWFzb25hYmxlIHBvc2l0aW9ucywgc28gZHJhdyBhIGxpbmUgZnJvbSB0aGUgZWRnZSBvZiB0aGUgbGFiZWwgdG8gdGhlIHBpZVxyXG4gICAgLy8gc2xpY2UgdG8gd2hpY2ggaXQgY29ycmVzcG9uZHMuXHJcbiAgICBsZXQgaiA9IDA7XHJcbiAgICBsZXQgayA9IDA7XHJcbiAgICBwb3NzaWJsZUlzb3RvcGVzLmZvckVhY2goIGlzb3RvcGUgPT4ge1xyXG4gICAgICBjb25zdCBzbGljZUNvbm5lY3RQdCA9IHRoaXMucGllQ2hhcnQuZ2V0Q2VudGVyRWRnZVB0Rm9yU2xpY2UoIGogKTtcclxuICAgICAgaWYgKCBzbGljZUNvbm5lY3RQdCApIHtcclxuICAgICAgICBjb25zdCBsYWJlbCA9IHRoaXMuc2xpY2VMYWJlbHNbIGsgXTtcclxuICAgICAgICBjb25zdCBsYWJlbENvbm5lY3RQdCA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbiAgICAgICAgaWYgKCBsYWJlbC5jZW50ZXJYID4gdGhpcy5waWVDaGFydC5jZW50ZXJYICkge1xyXG4gICAgICAgICAgLy8gTGFiZWwgaXMgb24gcmlnaHQsIHNvIGNvbm5lY3QgcG9pbnQgc2hvdWxkIGJlIG9uIGxlZnQuXHJcbiAgICAgICAgICBsYWJlbENvbm5lY3RQdC54ID0gbGFiZWwubGVmdDtcclxuICAgICAgICAgIGxhYmVsQ29ubmVjdFB0LnkgPSBsYWJlbC5jZW50ZXJZO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIC8vIExhYmVsIGlzIG9uIGxlZnQsIHNvIGNvbm5lY3QgcG9pbnQgc2hvdWxkIGJlIG9uIHJpZ2h0LlxyXG4gICAgICAgICAgbGFiZWxDb25uZWN0UHQueCA9IGxhYmVsLnJpZ2h0O1xyXG4gICAgICAgICAgbGFiZWxDb25uZWN0UHQueSA9IGxhYmVsLmNlbnRlclk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEZpbmQgYSBwb2ludCB0aGF0IGlzIHN0cmFpZ2h0IG91dCBmcm9tIHRoZSBjZW50ZXIgb2YgdGhlIHBpZSBjaGFydCBhYm92ZSB0aGUgcG9pbnQgdGhhdCBjb25uZWN0cyB0byB0aGVcclxuICAgICAgICAvLyBzbGljZS4gTm90ZSB0aGF0IHRoZXNlIGNhbGN1bGF0aW9ucyBhc3N1bWUgdGhhdCB0aGUgY2VudGVyIG9mIHRoZSBwaWUgY2hhcnQgaXMgYXQgKDAsMCkuXHJcbiAgICAgICAgY29uc3QgY29ubmVjdGluZ0xpbmVTaGFwZSA9IG5ldyBTaGFwZSgpLm1vdmVUbyggc2xpY2VDb25uZWN0UHQueCwgc2xpY2VDb25uZWN0UHQueSApO1xyXG4gICAgICAgIGlmICggc2xpY2VDb25uZWN0UHQueSA+IE9WRVJBTExfSEVJR0hUICogMC4yNSB8fCBzbGljZUNvbm5lY3RQdC55IDwgLU9WRVJBTExfSEVJR0hUICogMC4yNSApIHtcclxuICAgICAgICAgIC8vIEFkZCBhIFwiYmVuZCBwb2ludFwiIHNvIHRoYXQgdGhlIGxpbmUgZG9lc24ndCBnbyB1bmRlciB0aGUgcGllIGNoYXJ0LlxyXG4gICAgICAgICAgY29uc3QgYWRkaXRpb25hbExlbmd0aCA9IE9WRVJBTExfSEVJR0hUIC8gKCBQSUVfQ0hBUlRfUkFESVVTICogMiApIC0gMTtcclxuICAgICAgICAgIGNvbnN0IHNjYWxlRmFjdG9yID0gMSAtIE1hdGgubWluKCBNYXRoLmFicyggc2xpY2VDb25uZWN0UHQueCApIC8gKCBQSUVfQ0hBUlRfUkFESVVTIC8gMi4wICksIDEgKTtcclxuICAgICAgICAgIGNvbm5lY3RpbmdMaW5lU2hhcGUubGluZVRvKCBzbGljZUNvbm5lY3RQdC54ICogKCAxICsgYWRkaXRpb25hbExlbmd0aCAqIHNjYWxlRmFjdG9yICksXHJcbiAgICAgICAgICAgIHNsaWNlQ29ubmVjdFB0LnkgKiAoIDEgKyBhZGRpdGlvbmFsTGVuZ3RoICogc2NhbGVGYWN0b3IgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25uZWN0aW5nTGluZVNoYXBlLmxpbmVUbyggbGFiZWxDb25uZWN0UHQueCwgbGFiZWxDb25uZWN0UHQueSApO1xyXG4gICAgICAgIHRoaXMubGFiZWxMYXllci5hZGRDaGlsZCggbmV3IFBhdGgoIGNvbm5lY3RpbmdMaW5lU2hhcGUsIHtcclxuICAgICAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgICAgIGxpbmVXaWR0aDogMVxyXG4gICAgICAgIH0gKSApO1xyXG4gICAgICAgIGsgPSBrICsgMTtcclxuICAgICAgfVxyXG4gICAgICBqID0gaiArIDE7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0FycmF5LjxPYmplY3Q+fSBzbGljZUxhYmVsc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtaW5ZXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1heFlcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGFkanVzdExhYmVsUG9zaXRpb25zRm9yT3ZlcmxhcCggc2xpY2VMYWJlbHMsIG1pblksIG1heFkgKSB7XHJcbiAgICBjb25zdCByb3RhdGlvbkluY3JlbWVudCA9IE1hdGguUEkgLyAyMDA7IC8vIEVtcGlyaWNhbGx5IGNob3Nlbi5cclxuICAgIGZvciAoIGxldCBpID0gMTsgaSA8IDUwOyBpKysgKSB7IC8vIE51bWJlciBvZiBpdGVyYXRpb25zIGVtcGlyaWNhbGx5IGNob3Nlbi5cclxuICAgICAgbGV0IG92ZXJsYXBEZXRlY3RlZCA9IGZhbHNlO1xyXG4gICAgICBzbGljZUxhYmVscy5mb3JFYWNoKCBsYWJlbCA9PiB7XHJcbiAgICAgICAgbGV0IG1vdmVVcCA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBtb3ZlRG93biA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHNsaWNlTGFiZWxzLmxlbmd0aDsgaisrICkge1xyXG4gICAgICAgICAgY29uc3QgY29tcGFyaXNvbkxhYmVsID0gc2xpY2VMYWJlbHNbIGogXTtcclxuICAgICAgICAgIGlmICggbGFiZWwgPT09IGNvbXBhcmlzb25MYWJlbCApIHtcclxuICAgICAgICAgICAgLy8gU2FtZSBsYWJlbCwgc28gaWdub3JlLlxyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICggbGFiZWwuYm91bmRzLmludGVyc2VjdHNCb3VuZHMoIGNvbXBhcmlzb25MYWJlbC5ib3VuZHMgKSApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZXNlIGxhYmVscyBvdmVybGFwLlxyXG4gICAgICAgICAgICBvdmVybGFwRGV0ZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAoIGxhYmVsLnVuY29uc3RyYWluZWRQb3MueSA+IGNvbXBhcmlzb25MYWJlbC51bmNvbnN0cmFpbmVkUG9zLnkgJiYgbGFiZWwuYm90dG9tIDwgbWF4WSApIHtcclxuICAgICAgICAgICAgICBtb3ZlVXAgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCBsYWJlbC51bmNvbnN0cmFpbmVkUG9zLnkgPCBjb21wYXJpc29uTGFiZWwudW5jb25zdHJhaW5lZFBvcy55ICYmIGxhYmVsLnRvcCA+IG1pblkgKSB7XHJcbiAgICAgICAgICAgICAgbW92ZURvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBZGp1c3QgdGhpcyBsYWJlbCdzIHBvc2l0aW9uIGJhc2VkIHVwb24gYW55IG92ZXJsYXAgdGhhdCB3YXMgZGV0ZWN0ZWQuICBUaGUgZ2VuZXJhbCBpZGVhIGlzIHRoaXM6IGlmIHRoZXJlXHJcbiAgICAgICAgLy8gaXMgb3ZlcmxhcCBpbiBib3RoIGRpcmVjdGlvbnMsIGRvbid0IG1vdmUuICBJZiB0aGVyZSBpcyBvbmx5IG92ZXJsYXAgd2l0aCBhIGxhYmVsIHRoYXQgaGFzIGEgaGlnaGVyXHJcbiAgICAgICAgLy8gdW5jb25zdHJhaW5lZCBwb3NpdGlvbiwgbW92ZSBkb3duLiAgSWYgdGhlcmUgaXMgb25seSBvdmVybGFwIHdpdGggYSBsYWJlbCB3aXRoIGEgbG93ZXIgdW5jb25zdHJhaW5lZFxyXG4gICAgICAgIC8vIHBvc2l0aW9uLCBtb3ZlIGRvd24uXHJcbiAgICAgICAgbGV0IHBvc1ZlY3RvcjtcclxuICAgICAgICBpZiAoIG1vdmVVcCAmJiAhbW92ZURvd24gKSB7XHJcbiAgICAgICAgICBpZiAoIGxhYmVsLmxhYmVsT25MZWZ0ICkge1xyXG4gICAgICAgICAgICBwb3NWZWN0b3IgPSBuZXcgVmVjdG9yMiggbGFiZWwucmlnaHQsIGxhYmVsLmNlbnRlclkgKyBsYWJlbC5oZWlnaHQgLyAyICk7XHJcbiAgICAgICAgICAgIHBvc1ZlY3Rvci5yb3RhdGUoIC1yb3RhdGlvbkluY3JlbWVudCApO1xyXG4gICAgICAgICAgICBsYWJlbC5jZW50ZXJYID0gcG9zVmVjdG9yLnggLSBsYWJlbC53aWR0aCAvIDI7XHJcbiAgICAgICAgICAgIGxhYmVsLmNlbnRlclkgPSBwb3NWZWN0b3IueSAtIGxhYmVsLmhlaWdodCAvIDI7XHJcblxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHBvc1ZlY3RvciA9IG5ldyBWZWN0b3IyKCBsYWJlbC5jZW50ZXJYLCBsYWJlbC5jZW50ZXJZICsgbGFiZWwuaGVpZ2h0IC8gMiApO1xyXG4gICAgICAgICAgICBwb3NWZWN0b3Iucm90YXRlKCByb3RhdGlvbkluY3JlbWVudCApO1xyXG4gICAgICAgICAgICBsYWJlbC5jZW50ZXJYID0gcG9zVmVjdG9yLng7XHJcbiAgICAgICAgICAgIGxhYmVsLmNlbnRlclkgPSBwb3NWZWN0b3IueSAtIGxhYmVsLmhlaWdodCAvIDI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBtb3ZlRG93biAmJiAhbW92ZVVwICkge1xyXG4gICAgICAgICAgaWYgKCBsYWJlbC5sYWJlbE9uTGVmdCApIHtcclxuICAgICAgICAgICAgcG9zVmVjdG9yID0gbmV3IFZlY3RvcjIoIGxhYmVsLnJpZ2h0LCBsYWJlbC5jZW50ZXJZICsgbGFiZWwuaGVpZ2h0IC8gMiApO1xyXG4gICAgICAgICAgICBwb3NWZWN0b3Iucm90YXRlKCByb3RhdGlvbkluY3JlbWVudCApO1xyXG4gICAgICAgICAgICBsYWJlbC5jZW50ZXJYID0gcG9zVmVjdG9yLnggLSBsYWJlbC53aWR0aCAvIDI7XHJcbiAgICAgICAgICAgIGxhYmVsLmNlbnRlclkgPSBwb3NWZWN0b3IueSAtIGxhYmVsLmhlaWdodCAvIDI7XHJcblxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHBvc1ZlY3RvciA9IG5ldyBWZWN0b3IyKCBsYWJlbC5jZW50ZXJYLCBsYWJlbC5jZW50ZXJZICsgbGFiZWwuaGVpZ2h0IC8gMiApO1xyXG4gICAgICAgICAgICBwb3NWZWN0b3Iucm90YXRlKCAtcm90YXRpb25JbmNyZW1lbnQgKTtcclxuICAgICAgICAgICAgbGFiZWwuY2VudGVyWCA9IHBvc1ZlY3Rvci54O1xyXG4gICAgICAgICAgICBsYWJlbC5jZW50ZXJZID0gcG9zVmVjdG9yLnkgLSBsYWJlbC5oZWlnaHQgLyAyO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgICBpZiAoICFvdmVybGFwRGV0ZWN0ZWQgKSB7XHJcblxyXG4gICAgICAgIC8vIE5vIG92ZXJsYXAgd2FzIGRldGVjdGVkIGZvciBhbnkgb2YgdGhlIGxhYmVscywgc28gd2UncmUgZG9uZS5cclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuaXNvdG9wZXNBbmRBdG9taWNNYXNzLnJlZ2lzdGVyKCAnSXNvdG9wZVByb3BvcnRpb25zUGllQ2hhcnQnLCBJc290b3BlUHJvcG9ydGlvbnNQaWVDaGFydCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgSXNvdG9wZVByb3BvcnRpb25zUGllQ2hhcnQ7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxNQUFNLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDdkYsT0FBT0MsY0FBYyxNQUFNLHdDQUF3QztBQUNuRSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLFlBQVksTUFBTSxtQ0FBbUM7QUFDNUQsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDOztBQUVsRTtBQUNBLE1BQU1DLGdCQUFnQixHQUFHLEVBQUU7QUFDM0IsTUFBTUMsY0FBYyxHQUFHLEdBQUc7QUFDMUIsTUFBTUMsWUFBWSxHQUFHLElBQUlaLFFBQVEsQ0FBRSxFQUFHLENBQUM7QUFDdkMsTUFBTWEsSUFBSSxH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