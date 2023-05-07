// Copyright 2015-2023, University of Colorado Boulder

/**
 * Node that represents a pie chart with two slice and there labels positioned accordingly
 *
 * @author John Blanco
 * @author Aadish Gupta
 */

import Utils from '../../../../dot/js/Utils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Line, Node, Rectangle, RichText, Text } from '../../../../scenery/js/imports.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Panel from '../../../../sun/js/Panel.js';
import PieChartNode from '../../common/view/PieChartNode.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../../IsotopesAndAtomicMassStrings.js';

// constants
const PIE_CHART_RADIUS = 60;
const FIRST_SLICE_COLOR = ' rgb( 134, 102, 172 ) ';
const SECOND_SLICE_COLOR = ' #d3d3d3';
const TRACE_ABUNDANCE_IN_PIE_CHART = 1E-6; // empirically chosen value used to represent trace abundance in the pie chart

const otherIsotopesPatternString = IsotopesAndAtomicMassStrings.otherIsotopesPattern;
const thisIsotopeString = IsotopesAndAtomicMassStrings.thisIsotope;
const traceString = IsotopesAndAtomicMassStrings.trace;
class TwoItemPieChartNode extends Node {
  /**
   * Constructor for an TwoItemPieChartNode.
   *
   * @param {MakeIsotopesModel} makeIsotopesModel
   */
  constructor(makeIsotopesModel) {
    super();
    const pieChartBoundingRectangle = new Rectangle(150, 0, PIE_CHART_RADIUS * 2, PIE_CHART_RADIUS * 2, 0, 0);

    // default slices and color coding, first slice is for my isotope and second slice is for other isotope
    const slices = [{
      value: 0,
      color: FIRST_SLICE_COLOR,
      stroke: 'black',
      lineWidth: 0.5
    }, {
      value: 0,
      color: SECOND_SLICE_COLOR,
      stroke: 'black',
      lineWidth: 0.5
    }];
    const pieChart = new PieChartNode(slices, PIE_CHART_RADIUS);
    // center point of of bounding rectangle
    pieChart.setCenter(pieChartBoundingRectangle.width / 2 + 150, pieChartBoundingRectangle.height / 2);
    pieChartBoundingRectangle.addChild(pieChart);
    function updatePieChart() {
      const thisIsotopeAbundanceTo6Digits = AtomIdentifier.getNaturalAbundance(makeIsotopesModel.particleAtom, 6);
      const otherIsotopesAbundance = 1 - thisIsotopeAbundanceTo6Digits;

      // set the slice value for the current isotope
      if (thisIsotopeAbundanceTo6Digits === 0 && AtomIdentifier.existsInTraceAmounts(makeIsotopesModel.particleAtom)) {
        slices[0].value = TRACE_ABUNDANCE_IN_PIE_CHART;
      } else {
        slices[0].value = thisIsotopeAbundanceTo6Digits;
      }

      // set up the slice value for all other isotopes
      slices[1].value = otherIsotopesAbundance;

      // update the pie and the labels
      pieChart.setAngleAndValues(Math.PI * 2 * slices[1].value / (slices[0].value + slices[1].value) / 2, slices);
      updateThisIsotopeAbundanceReadout(makeIsotopesModel.particleAtom);
      updateOtherIsotopeLabel(makeIsotopesModel.particleAtom);
    }

    // No call to off() required since this exists for the lifetime of the sim
    makeIsotopesModel.atomReconfigured.addListener(() => {
      updatePieChart();
    });
    pieChartBoundingRectangle.scale(0.6);
    this.addChild(pieChartBoundingRectangle);

    // create the readout that will display the abundance in terms of percentage
    const readoutMyIsotopeAbundanceText = new Text('', {
      font: new PhetFont(14),
      maxWidth: 80
    });
    const thisIsotopeAbundancePanel = new Panel(readoutMyIsotopeAbundanceText, {
      minWidth: 60,
      minHeight: 20,
      resize: true,
      cornerRadius: 5,
      lineWidth: 1.5,
      align: 'center',
      stroke: FIRST_SLICE_COLOR,
      centerY: pieChartBoundingRectangle.centerY
    });
    this.addChild(thisIsotopeAbundancePanel);
    function updateThisIsotopeAbundanceReadout(isotope) {
      const thisIsotopeAbundanceTo6Digits = AtomIdentifier.getNaturalAbundance(isotope, 6);
      const existsInTraceAmounts = AtomIdentifier.existsInTraceAmounts(isotope);
      if (thisIsotopeAbundanceTo6Digits === 0 && existsInTraceAmounts) {
        readoutMyIsotopeAbundanceText.string = traceString;
      } else {
        readoutMyIsotopeAbundanceText.string = `${Utils.toFixedNumber(thisIsotopeAbundanceTo6Digits * 100, 6).toString()}%`;
      }
      thisIsotopeAbundancePanel.centerX = pieChartBoundingRectangle.left - 50; // empirically determined
      thisIsotopeAbundancePanel.centerY = pieChartBoundingRectangle.centerY;
      thisIsotopeLabel.centerX = thisIsotopeAbundancePanel.centerX;
      leftConnectingLine.visible = thisIsotopeAbundanceTo6Digits > 0 || existsInTraceAmounts;
    }
    const thisIsotopeLabel = new Text(thisIsotopeString, {
      font: new PhetFont({
        size: 12
      }),
      fill: 'black',
      maxWidth: 60
    });
    thisIsotopeLabel.bottom = thisIsotopeAbundancePanel.top - 5;
    this.addChild(thisIsotopeLabel);
    const leftConnectingLine = new Line(thisIsotopeAbundancePanel.centerX, thisIsotopeAbundancePanel.centerY, pieChartBoundingRectangle.centerX, pieChartBoundingRectangle.centerY, {
      stroke: FIRST_SLICE_COLOR,
      lineDash: [3, 1]
    });
    this.addChild(leftConnectingLine);
    leftConnectingLine.moveToBack();
    const otherIsotopeLabel = new RichText('', {
      font: new PhetFont({
        size: 12
      }),
      fill: 'black',
      maxWidth: 60,
      align: 'center'
    });

    // Attach otherIsotopeLabel with protonCountProperty to change element name on proton count change
    function updateOtherIsotopeLabel(isotope) {
      const abundanceTo6Digits = AtomIdentifier.getNaturalAbundance(isotope, 6);
      const name = AtomIdentifier.getName(makeIsotopesModel.particleAtom.protonCountProperty.get());
      if (makeIsotopesModel.particleAtom.protonCountProperty.get() > 0 && abundanceTo6Digits < 1) {
        otherIsotopeLabel.string = StringUtils.format(otherIsotopesPatternString, name);
        otherIsotopeLabel.visible = true;
        rightConnectingLine.visible = true;
      } else {
        otherIsotopeLabel.visible = false;
        rightConnectingLine.visible = false;
      }
      otherIsotopeLabel.centerY = pieChartBoundingRectangle.centerY;
      otherIsotopeLabel.left = pieChartBoundingRectangle.right + 10;
      rightConnectingLine.right = otherIsotopeLabel.left;
    }
    this.addChild(otherIsotopeLabel);
    const rightConnectingLine = new Line(pieChartBoundingRectangle.centerX, pieChartBoundingRectangle.centerY, pieChartBoundingRectangle.right + 20, pieChartBoundingRectangle.centerY, {
      stroke: SECOND_SLICE_COLOR,
      lineDash: [3, 1]
    });
    this.addChild(rightConnectingLine);
    rightConnectingLine.moveToBack();

    // do initial update to the pie chart
    updatePieChart();
  }
}
isotopesAndAtomicMass.register('TwoItemPieChartNode', TwoItemPieChartNode);
export default TwoItemPieChartNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlN0cmluZ1V0aWxzIiwiUGhldEZvbnQiLCJMaW5lIiwiTm9kZSIsIlJlY3RhbmdsZSIsIlJpY2hUZXh0IiwiVGV4dCIsIkF0b21JZGVudGlmaWVyIiwiUGFuZWwiLCJQaWVDaGFydE5vZGUiLCJpc290b3Blc0FuZEF0b21pY01hc3MiLCJJc290b3Blc0FuZEF0b21pY01hc3NTdHJpbmdzIiwiUElFX0NIQVJUX1JBRElVUyIsIkZJUlNUX1NMSUNFX0NPTE9SIiwiU0VDT05EX1NMSUNFX0NPTE9SIiwiVFJBQ0VfQUJVTkRBTkNFX0lOX1BJRV9DSEFSVCIsIm90aGVySXNvdG9wZXNQYXR0ZXJuU3RyaW5nIiwib3RoZXJJc290b3Blc1BhdHRlcm4iLCJ0aGlzSXNvdG9wZVN0cmluZyIsInRoaXNJc290b3BlIiwidHJhY2VTdHJpbmciLCJ0cmFjZSIsIlR3b0l0ZW1QaWVDaGFydE5vZGUiLCJjb25zdHJ1Y3RvciIsIm1ha2VJc290b3Blc01vZGVsIiwicGllQ2hhcnRCb3VuZGluZ1JlY3RhbmdsZSIsInNsaWNlcyIsInZhbHVlIiwiY29sb3IiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJwaWVDaGFydCIsInNldENlbnRlciIsIndpZHRoIiwiaGVpZ2h0IiwiYWRkQ2hpbGQiLCJ1cGRhdGVQaWVDaGFydCIsInRoaXNJc290b3BlQWJ1bmRhbmNlVG82RGlnaXRzIiwiZ2V0TmF0dXJhbEFidW5kYW5jZSIsInBhcnRpY2xlQXRvbSIsIm90aGVySXNvdG9wZXNBYnVuZGFuY2UiLCJleGlzdHNJblRyYWNlQW1vdW50cyIsInNldEFuZ2xlQW5kVmFsdWVzIiwiTWF0aCIsIlBJIiwidXBkYXRlVGhpc0lzb3RvcGVBYnVuZGFuY2VSZWFkb3V0IiwidXBkYXRlT3RoZXJJc290b3BlTGFiZWwiLCJhdG9tUmVjb25maWd1cmVkIiwiYWRkTGlzdGVuZXIiLCJzY2FsZSIsInJlYWRvdXRNeUlzb3RvcGVBYnVuZGFuY2VUZXh0IiwiZm9udCIsIm1heFdpZHRoIiwidGhpc0lzb3RvcGVBYnVuZGFuY2VQYW5lbCIsIm1pbldpZHRoIiwibWluSGVpZ2h0IiwicmVzaXplIiwiY29ybmVyUmFkaXVzIiwiYWxpZ24iLCJjZW50ZXJZIiwiaXNvdG9wZSIsInN0cmluZyIsInRvRml4ZWROdW1iZXIiLCJ0b1N0cmluZyIsImNlbnRlclgiLCJsZWZ0IiwidGhpc0lzb3RvcGVMYWJlbCIsImxlZnRDb25uZWN0aW5nTGluZSIsInZpc2libGUiLCJzaXplIiwiZmlsbCIsImJvdHRvbSIsInRvcCIsImxpbmVEYXNoIiwibW92ZVRvQmFjayIsIm90aGVySXNvdG9wZUxhYmVsIiwiYWJ1bmRhbmNlVG82RGlnaXRzIiwibmFtZSIsImdldE5hbWUiLCJwcm90b25Db3VudFByb3BlcnR5IiwiZ2V0IiwiZm9ybWF0IiwicmlnaHRDb25uZWN0aW5nTGluZSIsInJpZ2h0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUd29JdGVtUGllQ2hhcnROb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE5vZGUgdGhhdCByZXByZXNlbnRzIGEgcGllIGNoYXJ0IHdpdGggdHdvIHNsaWNlIGFuZCB0aGVyZSBsYWJlbHMgcG9zaXRpb25lZCBhY2NvcmRpbmdseVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgQWFkaXNoIEd1cHRhXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgTGluZSwgTm9kZSwgUmVjdGFuZ2xlLCBSaWNoVGV4dCwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBdG9tSWRlbnRpZmllciBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy9BdG9tSWRlbnRpZmllci5qcyc7XHJcbmltcG9ydCBQYW5lbCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xyXG5pbXBvcnQgUGllQ2hhcnROb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1BpZUNoYXJ0Tm9kZS5qcyc7XHJcbmltcG9ydCBpc290b3Blc0FuZEF0b21pY01hc3MgZnJvbSAnLi4vLi4vaXNvdG9wZXNBbmRBdG9taWNNYXNzLmpzJztcclxuaW1wb3J0IElzb3RvcGVzQW5kQXRvbWljTWFzc1N0cmluZ3MgZnJvbSAnLi4vLi4vSXNvdG9wZXNBbmRBdG9taWNNYXNzU3RyaW5ncy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgUElFX0NIQVJUX1JBRElVUyA9IDYwO1xyXG5jb25zdCBGSVJTVF9TTElDRV9DT0xPUiA9ICcgcmdiKCAxMzQsIDEwMiwgMTcyICkgJztcclxuY29uc3QgU0VDT05EX1NMSUNFX0NPTE9SID0gJyAjZDNkM2QzJztcclxuY29uc3QgVFJBQ0VfQUJVTkRBTkNFX0lOX1BJRV9DSEFSVCA9IDFFLTY7IC8vIGVtcGlyaWNhbGx5IGNob3NlbiB2YWx1ZSB1c2VkIHRvIHJlcHJlc2VudCB0cmFjZSBhYnVuZGFuY2UgaW4gdGhlIHBpZSBjaGFydFxyXG5cclxuY29uc3Qgb3RoZXJJc290b3Blc1BhdHRlcm5TdHJpbmcgPSBJc290b3Blc0FuZEF0b21pY01hc3NTdHJpbmdzLm90aGVySXNvdG9wZXNQYXR0ZXJuO1xyXG5jb25zdCB0aGlzSXNvdG9wZVN0cmluZyA9IElzb3RvcGVzQW5kQXRvbWljTWFzc1N0cmluZ3MudGhpc0lzb3RvcGU7XHJcbmNvbnN0IHRyYWNlU3RyaW5nID0gSXNvdG9wZXNBbmRBdG9taWNNYXNzU3RyaW5ncy50cmFjZTtcclxuXHJcbmNsYXNzIFR3b0l0ZW1QaWVDaGFydE5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0b3IgZm9yIGFuIFR3b0l0ZW1QaWVDaGFydE5vZGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01ha2VJc290b3Blc01vZGVsfSBtYWtlSXNvdG9wZXNNb2RlbFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtYWtlSXNvdG9wZXNNb2RlbCApIHtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIGNvbnN0IHBpZUNoYXJ0Qm91bmRpbmdSZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCAxNTAsIDAsIFBJRV9DSEFSVF9SQURJVVMgKiAyLCBQSUVfQ0hBUlRfUkFESVVTICogMiwgMCwgMCApO1xyXG5cclxuICAgIC8vIGRlZmF1bHQgc2xpY2VzIGFuZCBjb2xvciBjb2RpbmcsIGZpcnN0IHNsaWNlIGlzIGZvciBteSBpc290b3BlIGFuZCBzZWNvbmQgc2xpY2UgaXMgZm9yIG90aGVyIGlzb3RvcGVcclxuICAgIGNvbnN0IHNsaWNlcyA9IFsgeyB2YWx1ZTogMCwgY29sb3I6IEZJUlNUX1NMSUNFX0NPTE9SLCBzdHJva2U6ICdibGFjaycsIGxpbmVXaWR0aDogMC41IH0sXHJcbiAgICAgIHsgdmFsdWU6IDAsIGNvbG9yOiBTRUNPTkRfU0xJQ0VfQ09MT1IsIHN0cm9rZTogJ2JsYWNrJywgbGluZVdpZHRoOiAwLjUgfVxyXG4gICAgXTtcclxuXHJcbiAgICBjb25zdCBwaWVDaGFydCA9IG5ldyBQaWVDaGFydE5vZGUoIHNsaWNlcywgUElFX0NIQVJUX1JBRElVUyApO1xyXG4gICAgLy8gY2VudGVyIHBvaW50IG9mIG9mIGJvdW5kaW5nIHJlY3RhbmdsZVxyXG4gICAgcGllQ2hhcnQuc2V0Q2VudGVyKCBwaWVDaGFydEJvdW5kaW5nUmVjdGFuZ2xlLndpZHRoIC8gMiArIDE1MCwgcGllQ2hhcnRCb3VuZGluZ1JlY3RhbmdsZS5oZWlnaHQgLyAyICk7XHJcbiAgICBwaWVDaGFydEJvdW5kaW5nUmVjdGFuZ2xlLmFkZENoaWxkKCBwaWVDaGFydCApO1xyXG5cclxuICAgIGZ1bmN0aW9uIHVwZGF0ZVBpZUNoYXJ0KCkge1xyXG4gICAgICBjb25zdCB0aGlzSXNvdG9wZUFidW5kYW5jZVRvNkRpZ2l0cyA9IEF0b21JZGVudGlmaWVyLmdldE5hdHVyYWxBYnVuZGFuY2UoIG1ha2VJc290b3Blc01vZGVsLnBhcnRpY2xlQXRvbSwgNiApO1xyXG4gICAgICBjb25zdCBvdGhlcklzb3RvcGVzQWJ1bmRhbmNlID0gMSAtIHRoaXNJc290b3BlQWJ1bmRhbmNlVG82RGlnaXRzO1xyXG5cclxuICAgICAgLy8gc2V0IHRoZSBzbGljZSB2YWx1ZSBmb3IgdGhlIGN1cnJlbnQgaXNvdG9wZVxyXG4gICAgICBpZiAoIHRoaXNJc290b3BlQWJ1bmRhbmNlVG82RGlnaXRzID09PSAwICYmIEF0b21JZGVudGlmaWVyLmV4aXN0c0luVHJhY2VBbW91bnRzKCBtYWtlSXNvdG9wZXNNb2RlbC5wYXJ0aWNsZUF0b20gKSApIHtcclxuICAgICAgICBzbGljZXNbIDAgXS52YWx1ZSA9IFRSQUNFX0FCVU5EQU5DRV9JTl9QSUVfQ0hBUlQ7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgc2xpY2VzWyAwIF0udmFsdWUgPSB0aGlzSXNvdG9wZUFidW5kYW5jZVRvNkRpZ2l0cztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gc2V0IHVwIHRoZSBzbGljZSB2YWx1ZSBmb3IgYWxsIG90aGVyIGlzb3RvcGVzXHJcbiAgICAgIHNsaWNlc1sgMSBdLnZhbHVlID0gb3RoZXJJc290b3Blc0FidW5kYW5jZTtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSB0aGUgcGllIGFuZCB0aGUgbGFiZWxzXHJcbiAgICAgIHBpZUNoYXJ0LnNldEFuZ2xlQW5kVmFsdWVzKFxyXG4gICAgICAgIE1hdGguUEkgKiAyICogc2xpY2VzWyAxIF0udmFsdWUgLyAoIHNsaWNlc1sgMCBdLnZhbHVlICsgc2xpY2VzWyAxIF0udmFsdWUgKSAvIDIsXHJcbiAgICAgICAgc2xpY2VzXHJcbiAgICAgICk7XHJcbiAgICAgIHVwZGF0ZVRoaXNJc290b3BlQWJ1bmRhbmNlUmVhZG91dCggbWFrZUlzb3RvcGVzTW9kZWwucGFydGljbGVBdG9tICk7XHJcbiAgICAgIHVwZGF0ZU90aGVySXNvdG9wZUxhYmVsKCBtYWtlSXNvdG9wZXNNb2RlbC5wYXJ0aWNsZUF0b20gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBObyBjYWxsIHRvIG9mZigpIHJlcXVpcmVkIHNpbmNlIHRoaXMgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbVxyXG4gICAgbWFrZUlzb3RvcGVzTW9kZWwuYXRvbVJlY29uZmlndXJlZC5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICB1cGRhdGVQaWVDaGFydCgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHBpZUNoYXJ0Qm91bmRpbmdSZWN0YW5nbGUuc2NhbGUoIDAuNiApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcGllQ2hhcnRCb3VuZGluZ1JlY3RhbmdsZSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgcmVhZG91dCB0aGF0IHdpbGwgZGlzcGxheSB0aGUgYWJ1bmRhbmNlIGluIHRlcm1zIG9mIHBlcmNlbnRhZ2VcclxuICAgIGNvbnN0IHJlYWRvdXRNeUlzb3RvcGVBYnVuZGFuY2VUZXh0ID0gbmV3IFRleHQoICcnLCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTQgKSxcclxuICAgICAgbWF4V2lkdGg6IDgwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgdGhpc0lzb3RvcGVBYnVuZGFuY2VQYW5lbCA9IG5ldyBQYW5lbCggcmVhZG91dE15SXNvdG9wZUFidW5kYW5jZVRleHQsIHtcclxuICAgICAgbWluV2lkdGg6IDYwLFxyXG4gICAgICBtaW5IZWlnaHQ6IDIwLFxyXG4gICAgICByZXNpemU6IHRydWUsXHJcbiAgICAgIGNvcm5lclJhZGl1czogNSxcclxuICAgICAgbGluZVdpZHRoOiAxLjUsXHJcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgc3Ryb2tlOiBGSVJTVF9TTElDRV9DT0xPUixcclxuICAgICAgY2VudGVyWTogcGllQ2hhcnRCb3VuZGluZ1JlY3RhbmdsZS5jZW50ZXJZXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpc0lzb3RvcGVBYnVuZGFuY2VQYW5lbCApO1xyXG5cclxuICAgIGZ1bmN0aW9uIHVwZGF0ZVRoaXNJc290b3BlQWJ1bmRhbmNlUmVhZG91dCggaXNvdG9wZSApIHtcclxuICAgICAgY29uc3QgdGhpc0lzb3RvcGVBYnVuZGFuY2VUbzZEaWdpdHMgPSBBdG9tSWRlbnRpZmllci5nZXROYXR1cmFsQWJ1bmRhbmNlKCBpc290b3BlLCA2ICk7XHJcbiAgICAgIGNvbnN0IGV4aXN0c0luVHJhY2VBbW91bnRzID0gQXRvbUlkZW50aWZpZXIuZXhpc3RzSW5UcmFjZUFtb3VudHMoIGlzb3RvcGUgKTtcclxuICAgICAgaWYgKCB0aGlzSXNvdG9wZUFidW5kYW5jZVRvNkRpZ2l0cyA9PT0gMCAmJiBleGlzdHNJblRyYWNlQW1vdW50cyApIHtcclxuICAgICAgICByZWFkb3V0TXlJc290b3BlQWJ1bmRhbmNlVGV4dC5zdHJpbmcgPSB0cmFjZVN0cmluZztcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZWFkb3V0TXlJc290b3BlQWJ1bmRhbmNlVGV4dC5zdHJpbmcgPSBgJHsoIFV0aWxzLnRvRml4ZWROdW1iZXIoIHRoaXNJc290b3BlQWJ1bmRhbmNlVG82RGlnaXRzICogMTAwLCA2ICkgKS50b1N0cmluZygpfSVgO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXNJc290b3BlQWJ1bmRhbmNlUGFuZWwuY2VudGVyWCA9IHBpZUNoYXJ0Qm91bmRpbmdSZWN0YW5nbGUubGVmdCAtIDUwOyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICAgIHRoaXNJc290b3BlQWJ1bmRhbmNlUGFuZWwuY2VudGVyWSA9IHBpZUNoYXJ0Qm91bmRpbmdSZWN0YW5nbGUuY2VudGVyWTtcclxuICAgICAgdGhpc0lzb3RvcGVMYWJlbC5jZW50ZXJYID0gdGhpc0lzb3RvcGVBYnVuZGFuY2VQYW5lbC5jZW50ZXJYO1xyXG4gICAgICBsZWZ0Q29ubmVjdGluZ0xpbmUudmlzaWJsZSA9IHRoaXNJc290b3BlQWJ1bmRhbmNlVG82RGlnaXRzID4gMCB8fCBleGlzdHNJblRyYWNlQW1vdW50cztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0aGlzSXNvdG9wZUxhYmVsID0gbmV3IFRleHQoIHRoaXNJc290b3BlU3RyaW5nLCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAxMiB9ICksXHJcbiAgICAgIGZpbGw6ICdibGFjaycsXHJcbiAgICAgIG1heFdpZHRoOiA2MFxyXG4gICAgfSApO1xyXG4gICAgdGhpc0lzb3RvcGVMYWJlbC5ib3R0b20gPSB0aGlzSXNvdG9wZUFidW5kYW5jZVBhbmVsLnRvcCAtIDU7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzSXNvdG9wZUxhYmVsICk7XHJcblxyXG4gICAgY29uc3QgbGVmdENvbm5lY3RpbmdMaW5lID0gbmV3IExpbmUoIHRoaXNJc290b3BlQWJ1bmRhbmNlUGFuZWwuY2VudGVyWCwgdGhpc0lzb3RvcGVBYnVuZGFuY2VQYW5lbC5jZW50ZXJZLFxyXG4gICAgICBwaWVDaGFydEJvdW5kaW5nUmVjdGFuZ2xlLmNlbnRlclgsIHBpZUNoYXJ0Qm91bmRpbmdSZWN0YW5nbGUuY2VudGVyWSwge1xyXG4gICAgICAgIHN0cm9rZTogRklSU1RfU0xJQ0VfQ09MT1IsXHJcbiAgICAgICAgbGluZURhc2g6IFsgMywgMSBdXHJcbiAgICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGxlZnRDb25uZWN0aW5nTGluZSApO1xyXG4gICAgbGVmdENvbm5lY3RpbmdMaW5lLm1vdmVUb0JhY2soKTtcclxuXHJcbiAgICBjb25zdCBvdGhlcklzb3RvcGVMYWJlbCA9IG5ldyBSaWNoVGV4dCggJycsIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDEyIH0gKSxcclxuICAgICAgZmlsbDogJ2JsYWNrJyxcclxuICAgICAgbWF4V2lkdGg6IDYwLFxyXG4gICAgICBhbGlnbjogJ2NlbnRlcidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBdHRhY2ggb3RoZXJJc290b3BlTGFiZWwgd2l0aCBwcm90b25Db3VudFByb3BlcnR5IHRvIGNoYW5nZSBlbGVtZW50IG5hbWUgb24gcHJvdG9uIGNvdW50IGNoYW5nZVxyXG4gICAgZnVuY3Rpb24gdXBkYXRlT3RoZXJJc290b3BlTGFiZWwoIGlzb3RvcGUgKSB7XHJcbiAgICAgIGNvbnN0IGFidW5kYW5jZVRvNkRpZ2l0cyA9IEF0b21JZGVudGlmaWVyLmdldE5hdHVyYWxBYnVuZGFuY2UoIGlzb3RvcGUsIDYgKTtcclxuICAgICAgY29uc3QgbmFtZSA9IEF0b21JZGVudGlmaWVyLmdldE5hbWUoIG1ha2VJc290b3Blc01vZGVsLnBhcnRpY2xlQXRvbS5wcm90b25Db3VudFByb3BlcnR5LmdldCgpICk7XHJcbiAgICAgIGlmICggbWFrZUlzb3RvcGVzTW9kZWwucGFydGljbGVBdG9tLnByb3RvbkNvdW50UHJvcGVydHkuZ2V0KCkgPiAwICYmIGFidW5kYW5jZVRvNkRpZ2l0cyA8IDEgKSB7XHJcbiAgICAgICAgb3RoZXJJc290b3BlTGFiZWwuc3RyaW5nID0gU3RyaW5nVXRpbHMuZm9ybWF0KCBvdGhlcklzb3RvcGVzUGF0dGVyblN0cmluZywgbmFtZSApO1xyXG4gICAgICAgIG90aGVySXNvdG9wZUxhYmVsLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIHJpZ2h0Q29ubmVjdGluZ0xpbmUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgb3RoZXJJc290b3BlTGFiZWwudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHJpZ2h0Q29ubmVjdGluZ0xpbmUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIG90aGVySXNvdG9wZUxhYmVsLmNlbnRlclkgPSBwaWVDaGFydEJvdW5kaW5nUmVjdGFuZ2xlLmNlbnRlclk7XHJcbiAgICAgIG90aGVySXNvdG9wZUxhYmVsLmxlZnQgPSBwaWVDaGFydEJvdW5kaW5nUmVjdGFuZ2xlLnJpZ2h0ICsgMTA7XHJcbiAgICAgIHJpZ2h0Q29ubmVjdGluZ0xpbmUucmlnaHQgPSBvdGhlcklzb3RvcGVMYWJlbC5sZWZ0O1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIG90aGVySXNvdG9wZUxhYmVsICk7XHJcblxyXG4gICAgY29uc3QgcmlnaHRDb25uZWN0aW5nTGluZSA9IG5ldyBMaW5lKCBwaWVDaGFydEJvdW5kaW5nUmVjdGFuZ2xlLmNlbnRlclgsIHBpZUNoYXJ0Qm91bmRpbmdSZWN0YW5nbGUuY2VudGVyWSxcclxuICAgICAgcGllQ2hhcnRCb3VuZGluZ1JlY3RhbmdsZS5yaWdodCArIDIwLCBwaWVDaGFydEJvdW5kaW5nUmVjdGFuZ2xlLmNlbnRlclksIHtcclxuICAgICAgICBzdHJva2U6IFNFQ09ORF9TTElDRV9DT0xPUixcclxuICAgICAgICBsaW5lRGFzaDogWyAzLCAxIF1cclxuICAgICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcmlnaHRDb25uZWN0aW5nTGluZSApO1xyXG4gICAgcmlnaHRDb25uZWN0aW5nTGluZS5tb3ZlVG9CYWNrKCk7XHJcblxyXG4gICAgLy8gZG8gaW5pdGlhbCB1cGRhdGUgdG8gdGhlIHBpZSBjaGFydFxyXG4gICAgdXBkYXRlUGllQ2hhcnQoKTtcclxuICB9XHJcbn1cclxuXHJcbmlzb3RvcGVzQW5kQXRvbWljTWFzcy5yZWdpc3RlciggJ1R3b0l0ZW1QaWVDaGFydE5vZGUnLCBUd29JdGVtUGllQ2hhcnROb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IFR3b0l0ZW1QaWVDaGFydE5vZGU7Il0sIm1hcHBp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