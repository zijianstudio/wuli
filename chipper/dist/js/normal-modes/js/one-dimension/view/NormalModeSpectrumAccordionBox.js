// Copyright 2020-2023, University of Colorado Boulder

/**
 * NormalModesAccordionBox is the accordion box titled 'Normal Mode Spectrum'.
 * It contains amplitude and phase controls for the 1D normal modes.
 *
 * @author Franco Barpp Gomes (UTFPR)
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import { HBox, HStrut, Line, Node, Text, VBox, VStrut } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import VSlider from '../../../../sun/js/VSlider.js';
import NormalModesColors from '../../common/NormalModesColors.js';
import NormalModesConstants from '../../common/NormalModesConstants.js';
import AmplitudeDirectionRadioButtonGroup from '../../common/view/AmplitudeDirectionRadioButtonGroup.js';
import normalModes from '../../normalModes.js';
import NormalModesStrings from '../../NormalModesStrings.js';
import StaticModeGraphCanvasNode from './StaticModeGraphCanvasNode.js';
const amplitudeString = NormalModesStrings.amplitude;
const frequencyString = NormalModesStrings.frequency;
const frequencyRatioOmegaPatternString = NormalModesStrings.frequencyRatioOmegaPattern;
const normalModeSpectrumString = NormalModesStrings.normalModeSpectrum;
const normalModeString = NormalModesStrings.normalMode;
const phaseString = NormalModesStrings.phase;
class NormalModeSpectrumAccordionBox extends AccordionBox {
  /**
   * @param {OneDimensionModel} model
   * @param {Object} [options]
   */
  constructor(model, options) {
    // from Vector Addition
    const PANEL_CORNER_RADIUS = 5;
    const PANEL_X_MARGIN = 10;
    const PANEL_Y_MARGIN = 10;
    options = merge({
      resize: true,
      cornerRadius: PANEL_CORNER_RADIUS,
      contentXMargin: PANEL_X_MARGIN,
      contentYMargin: PANEL_Y_MARGIN,
      contentXSpacing: PANEL_X_MARGIN,
      contentYSpacing: 1,
      buttonXMargin: PANEL_X_MARGIN,
      buttonYMargin: PANEL_Y_MARGIN,
      titleYMargin: PANEL_Y_MARGIN,
      titleXMargin: PANEL_X_MARGIN,
      titleXSpacing: PANEL_X_MARGIN,
      titleAlignX: 'left',
      expandCollapseButtonOptions: {
        sideLength: 22,
        touchAreaXDilation: 6,
        touchAreaYDilation: 6
      },
      titleNode: new Text(normalModeSpectrumString, {
        font: NormalModesConstants.CONTROL_FONT
      }),
      showTitleWhenExpanded: false
    }, options);
    const amplitudeSliders = new Array(NormalModesConstants.MAX_MASSES_PER_ROW);
    const phaseSliders = new Array(NormalModesConstants.MAX_MASSES_PER_ROW);
    const modeLabels = new Array(NormalModesConstants.MAX_MASSES_PER_ROW);
    const frequencyText = new Array(NormalModesConstants.MAX_MASSES_PER_ROW);
    const modeGraphs = new Array(NormalModesConstants.MAX_MASSES_PER_ROW);
    const amplitudeSliderOptions = {
      trackSize: new Dimension2(3, 100),
      thumbSize: new Dimension2(26, 15),
      thumbTouchAreaXDilation: 15,
      thumbTouchAreaYDilation: 15
    };
    const phaseSliderOptions = {
      trackSize: new Dimension2(3, 80),
      thumbSize: new Dimension2(26, 15),
      thumbTouchAreaXDilation: 15,
      thumbTouchAreaYDilation: 15
    };
    for (let i = 0; i < amplitudeSliders.length; i++) {
      const k = NormalModesConstants.SPRING_CONSTANT_VALUE;
      const m = NormalModesConstants.MASSES_MASS_VALUE;
      amplitudeSliders[i] = new VSlider(model.modeAmplitudeProperties[i], new RangeWithValue(NormalModesConstants.MIN_AMPLITUDE, NormalModesConstants.MAX_AMPLITUDE, NormalModesConstants.INITIAL_AMPLITUDE), amplitudeSliderOptions);
      phaseSliders[i] = new VSlider(model.modePhaseProperties[i], new RangeWithValue(NormalModesConstants.MIN_PHASE, NormalModesConstants.MAX_PHASE, NormalModesConstants.INITIAL_PHASE), phaseSliderOptions);
      modeLabels[i] = new Text((i + 1).toString(), {
        font: NormalModesConstants.CONTROL_FONT
      });
      const frequencyRatio = model.modeFrequencyProperties[i].get() / Math.sqrt(k / m);
      frequencyText[i] = new Text(StringUtils.fillIn(frequencyRatioOmegaPatternString, {
        frequencyRatio: Utils.toFixed(frequencyRatio, 2)
      }), {
        font: NormalModesConstants.SMALL_FONT,
        maxWidth: 60
      });
      modeGraphs[i] = new StaticModeGraphCanvasNode(i, model.modeFrequencyProperties[i]);
    }
    const panelColumns = new Array(NormalModesConstants.MAX_MASSES_PER_ROW + 1);
    const normalModeLabel = new Text(normalModeString, {
      font: NormalModesConstants.CONTROL_FONT,
      maxWidth: 120
    });
    const amplitudeLabel = new Text(amplitudeString, {
      font: NormalModesConstants.CONTROL_FONT,
      maxWidth: 120
    });
    const phaseLabel = new Text(phaseString, {
      font: NormalModesConstants.CONTROL_FONT,
      maxWidth: 80
    });
    const piLabel = new Text(MathSymbols.UNARY_PLUS + MathSymbols.PI, {
      font: NormalModesConstants.CONTROL_FONT,
      maxWidth: 30
    });
    const zeroLabel = new Text('0', {
      font: NormalModesConstants.CONTROL_FONT,
      maxWidth: 30
    });
    const negativePiLabel = new Text(MathSymbols.UNARY_MINUS + MathSymbols.PI, {
      font: NormalModesConstants.CONTROL_FONT,
      maxWidth: 30
    });
    const phaseSliderLabels = new VBox({
      children: [piLabel, new VStrut(16),
      // empirically determined
      zeroLabel, new VStrut(15), negativePiLabel],
      align: 'right'
    });
    const phaseBox = new HBox({
      children: [phaseLabel, new HStrut(10), phaseSliderLabels]
    });
    const frequencyLabel = new Text(frequencyString, {
      font: NormalModesConstants.CONTROL_FONT,
      maxWidth: 120
    });
    for (let i = 1; i < panelColumns.length; i++) {
      panelColumns[i] = new VBox({
        spacing: 5,
        align: 'center'
      });
    }
    panelColumns[0] = new Node({
      children: [new Line(0, 0, 10, 10)]
    });
    const lineSeparator = new Line(0, 0, 0, 0, {
      stroke: NormalModesColors.SEPARATOR_STROKE
    });
    const contentNode = new HBox({
      spacing: 9.8,
      align: 'center',
      children: panelColumns.slice(0, model.numberOfMassesProperty.get() + 1)
    });
    const amplitudeDirectionRadioButtonGroup = new AmplitudeDirectionRadioButtonGroup(model.amplitudeDirectionProperty);
    super(contentNode, options);
    let strut;

    // unlink is unnecessary, exists for the lifetime of the sim
    model.phasesVisibleProperty.link(phasesVisibility => {
      for (let i = 1; i < panelColumns.length; ++i) {
        const j = i - 1;
        panelColumns[i].children = phasesVisibility ? [modeGraphs[j], modeLabels[j], amplitudeSliders[j], frequencyText[j], phaseSliders[j]] : [modeGraphs[j], modeLabels[j], amplitudeSliders[j], frequencyText[j]];
      }
      lineSeparator.setY2(panelColumns[1].bounds.height * 0.8);

      // the previous VStrut needs to be disposed
      if (strut && typeof strut.dispose === 'function') {
        strut.dispose();
      }
      strut = new VStrut(panelColumns[1].bounds.height);
      panelColumns[0].children = phasesVisibility ? [strut, normalModeLabel, amplitudeLabel, frequencyLabel, phaseBox] : [strut, normalModeLabel, amplitudeLabel, frequencyLabel];
      normalModeLabel.centerY = modeLabels[0].centerY;
      amplitudeLabel.centerY = amplitudeSliders[0].centerY;
      frequencyLabel.centerY = frequencyText[0].centerY;
      phaseBox.centerY = phaseSliders[0].centerY;
      normalModeLabel.right = panelColumns[0].right;
      amplitudeLabel.right = panelColumns[0].right;
      frequencyLabel.right = panelColumns[0].right;
      phaseBox.right = panelColumns[0].right;
      this.bottom = options.bottom;
    });

    // unlink is unnecessary, exists for the lifetime of the sim
    model.numberOfMassesProperty.link(numberOfMasses => {
      for (let i = 0; i < numberOfMasses; i++) {
        const k = NormalModesConstants.SPRING_CONSTANT_VALUE;
        const m = NormalModesConstants.MASSES_MASS_VALUE;
        const frequencyRatio = model.modeFrequencyProperties[i].get() / Math.sqrt(k / m);
        modeGraphs[i].update();
        frequencyText[i].string = StringUtils.fillIn(frequencyRatioOmegaPatternString, {
          frequencyRatio: Utils.toFixed(frequencyRatio, 2)
        });
      }
      contentNode.children = panelColumns.slice(0, numberOfMasses + 1);
      contentNode.addChild(lineSeparator);
      contentNode.addChild(amplitudeDirectionRadioButtonGroup);

      // needed to center based on the recalculated layout (layout should be a private method, TODO: fix)
      this.layout();
      this.centerX = options.centerX;
    });
  }
}
normalModes.register('NormalModeSpectrumAccordionBox', NormalModeSpectrumAccordionBox);
export default NormalModeSpectrumAccordionBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiUmFuZ2VXaXRoVmFsdWUiLCJVdGlscyIsIm1lcmdlIiwiU3RyaW5nVXRpbHMiLCJNYXRoU3ltYm9scyIsIkhCb3giLCJIU3RydXQiLCJMaW5lIiwiTm9kZSIsIlRleHQiLCJWQm94IiwiVlN0cnV0IiwiQWNjb3JkaW9uQm94IiwiVlNsaWRlciIsIk5vcm1hbE1vZGVzQ29sb3JzIiwiTm9ybWFsTW9kZXNDb25zdGFudHMiLCJBbXBsaXR1ZGVEaXJlY3Rpb25SYWRpb0J1dHRvbkdyb3VwIiwibm9ybWFsTW9kZXMiLCJOb3JtYWxNb2Rlc1N0cmluZ3MiLCJTdGF0aWNNb2RlR3JhcGhDYW52YXNOb2RlIiwiYW1wbGl0dWRlU3RyaW5nIiwiYW1wbGl0dWRlIiwiZnJlcXVlbmN5U3RyaW5nIiwiZnJlcXVlbmN5IiwiZnJlcXVlbmN5UmF0aW9PbWVnYVBhdHRlcm5TdHJpbmciLCJmcmVxdWVuY3lSYXRpb09tZWdhUGF0dGVybiIsIm5vcm1hbE1vZGVTcGVjdHJ1bVN0cmluZyIsIm5vcm1hbE1vZGVTcGVjdHJ1bSIsIm5vcm1hbE1vZGVTdHJpbmciLCJub3JtYWxNb2RlIiwicGhhc2VTdHJpbmciLCJwaGFzZSIsIk5vcm1hbE1vZGVTcGVjdHJ1bUFjY29yZGlvbkJveCIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJvcHRpb25zIiwiUEFORUxfQ09STkVSX1JBRElVUyIsIlBBTkVMX1hfTUFSR0lOIiwiUEFORUxfWV9NQVJHSU4iLCJyZXNpemUiLCJjb3JuZXJSYWRpdXMiLCJjb250ZW50WE1hcmdpbiIsImNvbnRlbnRZTWFyZ2luIiwiY29udGVudFhTcGFjaW5nIiwiY29udGVudFlTcGFjaW5nIiwiYnV0dG9uWE1hcmdpbiIsImJ1dHRvbllNYXJnaW4iLCJ0aXRsZVlNYXJnaW4iLCJ0aXRsZVhNYXJnaW4iLCJ0aXRsZVhTcGFjaW5nIiwidGl0bGVBbGlnblgiLCJleHBhbmRDb2xsYXBzZUJ1dHRvbk9wdGlvbnMiLCJzaWRlTGVuZ3RoIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwidGl0bGVOb2RlIiwiZm9udCIsIkNPTlRST0xfRk9OVCIsInNob3dUaXRsZVdoZW5FeHBhbmRlZCIsImFtcGxpdHVkZVNsaWRlcnMiLCJBcnJheSIsIk1BWF9NQVNTRVNfUEVSX1JPVyIsInBoYXNlU2xpZGVycyIsIm1vZGVMYWJlbHMiLCJmcmVxdWVuY3lUZXh0IiwibW9kZUdyYXBocyIsImFtcGxpdHVkZVNsaWRlck9wdGlvbnMiLCJ0cmFja1NpemUiLCJ0aHVtYlNpemUiLCJ0aHVtYlRvdWNoQXJlYVhEaWxhdGlvbiIsInRodW1iVG91Y2hBcmVhWURpbGF0aW9uIiwicGhhc2VTbGlkZXJPcHRpb25zIiwiaSIsImxlbmd0aCIsImsiLCJTUFJJTkdfQ09OU1RBTlRfVkFMVUUiLCJtIiwiTUFTU0VTX01BU1NfVkFMVUUiLCJtb2RlQW1wbGl0dWRlUHJvcGVydGllcyIsIk1JTl9BTVBMSVRVREUiLCJNQVhfQU1QTElUVURFIiwiSU5JVElBTF9BTVBMSVRVREUiLCJtb2RlUGhhc2VQcm9wZXJ0aWVzIiwiTUlOX1BIQVNFIiwiTUFYX1BIQVNFIiwiSU5JVElBTF9QSEFTRSIsInRvU3RyaW5nIiwiZnJlcXVlbmN5UmF0aW8iLCJtb2RlRnJlcXVlbmN5UHJvcGVydGllcyIsImdldCIsIk1hdGgiLCJzcXJ0IiwiZmlsbEluIiwidG9GaXhlZCIsIlNNQUxMX0ZPTlQiLCJtYXhXaWR0aCIsInBhbmVsQ29sdW1ucyIsIm5vcm1hbE1vZGVMYWJlbCIsImFtcGxpdHVkZUxhYmVsIiwicGhhc2VMYWJlbCIsInBpTGFiZWwiLCJVTkFSWV9QTFVTIiwiUEkiLCJ6ZXJvTGFiZWwiLCJuZWdhdGl2ZVBpTGFiZWwiLCJVTkFSWV9NSU5VUyIsInBoYXNlU2xpZGVyTGFiZWxzIiwiY2hpbGRyZW4iLCJhbGlnbiIsInBoYXNlQm94IiwiZnJlcXVlbmN5TGFiZWwiLCJzcGFjaW5nIiwibGluZVNlcGFyYXRvciIsInN0cm9rZSIsIlNFUEFSQVRPUl9TVFJPS0UiLCJjb250ZW50Tm9kZSIsInNsaWNlIiwibnVtYmVyT2ZNYXNzZXNQcm9wZXJ0eSIsImFtcGxpdHVkZURpcmVjdGlvblJhZGlvQnV0dG9uR3JvdXAiLCJhbXBsaXR1ZGVEaXJlY3Rpb25Qcm9wZXJ0eSIsInN0cnV0IiwicGhhc2VzVmlzaWJsZVByb3BlcnR5IiwibGluayIsInBoYXNlc1Zpc2liaWxpdHkiLCJqIiwic2V0WTIiLCJib3VuZHMiLCJoZWlnaHQiLCJkaXNwb3NlIiwiY2VudGVyWSIsInJpZ2h0IiwiYm90dG9tIiwibnVtYmVyT2ZNYXNzZXMiLCJ1cGRhdGUiLCJzdHJpbmciLCJhZGRDaGlsZCIsImxheW91dCIsImNlbnRlclgiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk5vcm1hbE1vZGVTcGVjdHJ1bUFjY29yZGlvbkJveC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBOb3JtYWxNb2Rlc0FjY29yZGlvbkJveCBpcyB0aGUgYWNjb3JkaW9uIGJveCB0aXRsZWQgJ05vcm1hbCBNb2RlIFNwZWN0cnVtJy5cclxuICogSXQgY29udGFpbnMgYW1wbGl0dWRlIGFuZCBwaGFzZSBjb250cm9scyBmb3IgdGhlIDFEIG5vcm1hbCBtb2Rlcy5cclxuICpcclxuICogQGF1dGhvciBGcmFuY28gQmFycHAgR29tZXMgKFVURlBSKVxyXG4gKiBAYXV0aG9yIFRoaWFnbyBkZSBNZW5kb27Dp2EgTWlsZGVtYmVyZ2VyIChVVEZQUilcclxuICovXHJcblxyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBSYW5nZVdpdGhWYWx1ZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2VXaXRoVmFsdWUuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IHsgSEJveCwgSFN0cnV0LCBMaW5lLCBOb2RlLCBUZXh0LCBWQm94LCBWU3RydXQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQWNjb3JkaW9uQm94IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BY2NvcmRpb25Cb3guanMnO1xyXG5pbXBvcnQgVlNsaWRlciBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvVlNsaWRlci5qcyc7XHJcbmltcG9ydCBOb3JtYWxNb2Rlc0NvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vTm9ybWFsTW9kZXNDb2xvcnMuanMnO1xyXG5pbXBvcnQgTm9ybWFsTW9kZXNDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL05vcm1hbE1vZGVzQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEFtcGxpdHVkZURpcmVjdGlvblJhZGlvQnV0dG9uR3JvdXAgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQW1wbGl0dWRlRGlyZWN0aW9uUmFkaW9CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCBub3JtYWxNb2RlcyBmcm9tICcuLi8uLi9ub3JtYWxNb2Rlcy5qcyc7XHJcbmltcG9ydCBOb3JtYWxNb2Rlc1N0cmluZ3MgZnJvbSAnLi4vLi4vTm9ybWFsTW9kZXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IFN0YXRpY01vZGVHcmFwaENhbnZhc05vZGUgZnJvbSAnLi9TdGF0aWNNb2RlR3JhcGhDYW52YXNOb2RlLmpzJztcclxuXHJcbmNvbnN0IGFtcGxpdHVkZVN0cmluZyA9IE5vcm1hbE1vZGVzU3RyaW5ncy5hbXBsaXR1ZGU7XHJcbmNvbnN0IGZyZXF1ZW5jeVN0cmluZyA9IE5vcm1hbE1vZGVzU3RyaW5ncy5mcmVxdWVuY3k7XHJcbmNvbnN0IGZyZXF1ZW5jeVJhdGlvT21lZ2FQYXR0ZXJuU3RyaW5nID0gTm9ybWFsTW9kZXNTdHJpbmdzLmZyZXF1ZW5jeVJhdGlvT21lZ2FQYXR0ZXJuO1xyXG5jb25zdCBub3JtYWxNb2RlU3BlY3RydW1TdHJpbmcgPSBOb3JtYWxNb2Rlc1N0cmluZ3Mubm9ybWFsTW9kZVNwZWN0cnVtO1xyXG5jb25zdCBub3JtYWxNb2RlU3RyaW5nID0gTm9ybWFsTW9kZXNTdHJpbmdzLm5vcm1hbE1vZGU7XHJcbmNvbnN0IHBoYXNlU3RyaW5nID0gTm9ybWFsTW9kZXNTdHJpbmdzLnBoYXNlO1xyXG5cclxuY2xhc3MgTm9ybWFsTW9kZVNwZWN0cnVtQWNjb3JkaW9uQm94IGV4dGVuZHMgQWNjb3JkaW9uQm94IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPbmVEaW1lbnNpb25Nb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCBvcHRpb25zICkge1xyXG5cclxuICAgIC8vIGZyb20gVmVjdG9yIEFkZGl0aW9uXHJcbiAgICBjb25zdCBQQU5FTF9DT1JORVJfUkFESVVTID0gNTtcclxuICAgIGNvbnN0IFBBTkVMX1hfTUFSR0lOID0gMTA7XHJcbiAgICBjb25zdCBQQU5FTF9ZX01BUkdJTiA9IDEwO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICByZXNpemU6IHRydWUsXHJcblxyXG4gICAgICBjb3JuZXJSYWRpdXM6IFBBTkVMX0NPUk5FUl9SQURJVVMsXHJcbiAgICAgIGNvbnRlbnRYTWFyZ2luOiBQQU5FTF9YX01BUkdJTixcclxuICAgICAgY29udGVudFlNYXJnaW46IFBBTkVMX1lfTUFSR0lOLFxyXG4gICAgICBjb250ZW50WFNwYWNpbmc6IFBBTkVMX1hfTUFSR0lOLFxyXG4gICAgICBjb250ZW50WVNwYWNpbmc6IDEsXHJcbiAgICAgIGJ1dHRvblhNYXJnaW46IFBBTkVMX1hfTUFSR0lOLFxyXG4gICAgICBidXR0b25ZTWFyZ2luOiBQQU5FTF9ZX01BUkdJTixcclxuICAgICAgdGl0bGVZTWFyZ2luOiBQQU5FTF9ZX01BUkdJTixcclxuICAgICAgdGl0bGVYTWFyZ2luOiBQQU5FTF9YX01BUkdJTixcclxuICAgICAgdGl0bGVYU3BhY2luZzogUEFORUxfWF9NQVJHSU4sXHJcbiAgICAgIHRpdGxlQWxpZ25YOiAnbGVmdCcsXHJcbiAgICAgIGV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIHNpZGVMZW5ndGg6IDIyLFxyXG4gICAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogNixcclxuICAgICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDZcclxuICAgICAgfSxcclxuICAgICAgdGl0bGVOb2RlOiBuZXcgVGV4dCggbm9ybWFsTW9kZVNwZWN0cnVtU3RyaW5nLCB7IGZvbnQ6IE5vcm1hbE1vZGVzQ29uc3RhbnRzLkNPTlRST0xfRk9OVCB9ICksXHJcbiAgICAgIHNob3dUaXRsZVdoZW5FeHBhbmRlZDogZmFsc2VcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBhbXBsaXR1ZGVTbGlkZXJzID0gbmV3IEFycmF5KCBOb3JtYWxNb2Rlc0NvbnN0YW50cy5NQVhfTUFTU0VTX1BFUl9ST1cgKTtcclxuICAgIGNvbnN0IHBoYXNlU2xpZGVycyA9IG5ldyBBcnJheSggTm9ybWFsTW9kZXNDb25zdGFudHMuTUFYX01BU1NFU19QRVJfUk9XICk7XHJcbiAgICBjb25zdCBtb2RlTGFiZWxzID0gbmV3IEFycmF5KCBOb3JtYWxNb2Rlc0NvbnN0YW50cy5NQVhfTUFTU0VTX1BFUl9ST1cgKTtcclxuICAgIGNvbnN0IGZyZXF1ZW5jeVRleHQgPSBuZXcgQXJyYXkoIE5vcm1hbE1vZGVzQ29uc3RhbnRzLk1BWF9NQVNTRVNfUEVSX1JPVyApO1xyXG4gICAgY29uc3QgbW9kZUdyYXBocyA9IG5ldyBBcnJheSggTm9ybWFsTW9kZXNDb25zdGFudHMuTUFYX01BU1NFU19QRVJfUk9XICk7XHJcblxyXG4gICAgY29uc3QgYW1wbGl0dWRlU2xpZGVyT3B0aW9ucyA9IHtcclxuICAgICAgdHJhY2tTaXplOiBuZXcgRGltZW5zaW9uMiggMywgMTAwICksXHJcbiAgICAgIHRodW1iU2l6ZTogbmV3IERpbWVuc2lvbjIoIDI2LCAxNSApLFxyXG4gICAgICB0aHVtYlRvdWNoQXJlYVhEaWxhdGlvbjogMTUsXHJcbiAgICAgIHRodW1iVG91Y2hBcmVhWURpbGF0aW9uOiAxNVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBwaGFzZVNsaWRlck9wdGlvbnMgPSB7XHJcbiAgICAgIHRyYWNrU2l6ZTogbmV3IERpbWVuc2lvbjIoIDMsIDgwICksXHJcbiAgICAgIHRodW1iU2l6ZTogbmV3IERpbWVuc2lvbjIoIDI2LCAxNSApLFxyXG4gICAgICB0aHVtYlRvdWNoQXJlYVhEaWxhdGlvbjogMTUsXHJcbiAgICAgIHRodW1iVG91Y2hBcmVhWURpbGF0aW9uOiAxNVxyXG4gICAgfTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhbXBsaXR1ZGVTbGlkZXJzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBrID0gTm9ybWFsTW9kZXNDb25zdGFudHMuU1BSSU5HX0NPTlNUQU5UX1ZBTFVFO1xyXG4gICAgICBjb25zdCBtID0gTm9ybWFsTW9kZXNDb25zdGFudHMuTUFTU0VTX01BU1NfVkFMVUU7XHJcblxyXG4gICAgICBhbXBsaXR1ZGVTbGlkZXJzWyBpIF0gPSBuZXcgVlNsaWRlcihcclxuICAgICAgICBtb2RlbC5tb2RlQW1wbGl0dWRlUHJvcGVydGllc1sgaSBdLFxyXG4gICAgICAgIG5ldyBSYW5nZVdpdGhWYWx1ZSggTm9ybWFsTW9kZXNDb25zdGFudHMuTUlOX0FNUExJVFVERSxcclxuICAgICAgICAgIE5vcm1hbE1vZGVzQ29uc3RhbnRzLk1BWF9BTVBMSVRVREUsXHJcbiAgICAgICAgICBOb3JtYWxNb2Rlc0NvbnN0YW50cy5JTklUSUFMX0FNUExJVFVERSApLFxyXG4gICAgICAgIGFtcGxpdHVkZVNsaWRlck9wdGlvbnNcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHBoYXNlU2xpZGVyc1sgaSBdID0gbmV3IFZTbGlkZXIoXHJcbiAgICAgICAgbW9kZWwubW9kZVBoYXNlUHJvcGVydGllc1sgaSBdLFxyXG4gICAgICAgIG5ldyBSYW5nZVdpdGhWYWx1ZSggTm9ybWFsTW9kZXNDb25zdGFudHMuTUlOX1BIQVNFLFxyXG4gICAgICAgICAgTm9ybWFsTW9kZXNDb25zdGFudHMuTUFYX1BIQVNFLFxyXG4gICAgICAgICAgTm9ybWFsTW9kZXNDb25zdGFudHMuSU5JVElBTF9QSEFTRSApLFxyXG4gICAgICAgIHBoYXNlU2xpZGVyT3B0aW9uc1xyXG4gICAgICApO1xyXG5cclxuICAgICAgbW9kZUxhYmVsc1sgaSBdID0gbmV3IFRleHQoXHJcbiAgICAgICAgKCBpICsgMSApLnRvU3RyaW5nKCksXHJcbiAgICAgICAgeyBmb250OiBOb3JtYWxNb2Rlc0NvbnN0YW50cy5DT05UUk9MX0ZPTlQgfVxyXG4gICAgICApO1xyXG5cclxuICAgICAgY29uc3QgZnJlcXVlbmN5UmF0aW8gPSBtb2RlbC5tb2RlRnJlcXVlbmN5UHJvcGVydGllc1sgaSBdLmdldCgpIC8gTWF0aC5zcXJ0KCBrIC8gbSApO1xyXG4gICAgICBmcmVxdWVuY3lUZXh0WyBpIF0gPSBuZXcgVGV4dChcclxuICAgICAgICBTdHJpbmdVdGlscy5maWxsSW4oIGZyZXF1ZW5jeVJhdGlvT21lZ2FQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgICBmcmVxdWVuY3lSYXRpbzogVXRpbHMudG9GaXhlZCggZnJlcXVlbmN5UmF0aW8sIDIgKVxyXG4gICAgICAgIH0gKSxcclxuICAgICAgICB7IGZvbnQ6IE5vcm1hbE1vZGVzQ29uc3RhbnRzLlNNQUxMX0ZPTlQsIG1heFdpZHRoOiA2MCB9XHJcbiAgICAgICk7XHJcblxyXG4gICAgICBtb2RlR3JhcGhzWyBpIF0gPSBuZXcgU3RhdGljTW9kZUdyYXBoQ2FudmFzTm9kZSggaSwgbW9kZWwubW9kZUZyZXF1ZW5jeVByb3BlcnRpZXNbIGkgXSApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHBhbmVsQ29sdW1ucyA9IG5ldyBBcnJheSggTm9ybWFsTW9kZXNDb25zdGFudHMuTUFYX01BU1NFU19QRVJfUk9XICsgMSApO1xyXG5cclxuICAgIGNvbnN0IG5vcm1hbE1vZGVMYWJlbCA9IG5ldyBUZXh0KFxyXG4gICAgICBub3JtYWxNb2RlU3RyaW5nLFxyXG4gICAgICB7IGZvbnQ6IE5vcm1hbE1vZGVzQ29uc3RhbnRzLkNPTlRST0xfRk9OVCwgbWF4V2lkdGg6IDEyMCB9XHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGFtcGxpdHVkZUxhYmVsID0gbmV3IFRleHQoXHJcbiAgICAgIGFtcGxpdHVkZVN0cmluZyxcclxuICAgICAgeyBmb250OiBOb3JtYWxNb2Rlc0NvbnN0YW50cy5DT05UUk9MX0ZPTlQsIG1heFdpZHRoOiAxMjAgfVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBwaGFzZUxhYmVsID0gbmV3IFRleHQoIHBoYXNlU3RyaW5nLCB7XHJcbiAgICAgIGZvbnQ6IE5vcm1hbE1vZGVzQ29uc3RhbnRzLkNPTlRST0xfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IDgwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgcGlMYWJlbCA9IG5ldyBUZXh0KCBNYXRoU3ltYm9scy5VTkFSWV9QTFVTICsgTWF0aFN5bWJvbHMuUEksIHtcclxuICAgICAgZm9udDogTm9ybWFsTW9kZXNDb25zdGFudHMuQ09OVFJPTF9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogMzBcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHplcm9MYWJlbCA9IG5ldyBUZXh0KCAnMCcsIHsgZm9udDogTm9ybWFsTW9kZXNDb25zdGFudHMuQ09OVFJPTF9GT05ULCBtYXhXaWR0aDogMzAgfSApO1xyXG4gICAgY29uc3QgbmVnYXRpdmVQaUxhYmVsID0gbmV3IFRleHQoIE1hdGhTeW1ib2xzLlVOQVJZX01JTlVTICsgTWF0aFN5bWJvbHMuUEksIHtcclxuICAgICAgZm9udDogTm9ybWFsTW9kZXNDb25zdGFudHMuQ09OVFJPTF9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogMzBcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBwaGFzZVNsaWRlckxhYmVscyA9IG5ldyBWQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHBpTGFiZWwsXHJcbiAgICAgICAgbmV3IFZTdHJ1dCggMTYgKSwgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgICAgIHplcm9MYWJlbCxcclxuICAgICAgICBuZXcgVlN0cnV0KCAxNSApLFxyXG4gICAgICAgIG5lZ2F0aXZlUGlMYWJlbCBdLFxyXG4gICAgICBhbGlnbjogJ3JpZ2h0J1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHBoYXNlQm94ID0gbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgcGhhc2VMYWJlbCxcclxuICAgICAgICBuZXcgSFN0cnV0KCAxMCApLFxyXG4gICAgICAgIHBoYXNlU2xpZGVyTGFiZWxzIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBmcmVxdWVuY3lMYWJlbCA9IG5ldyBUZXh0KFxyXG4gICAgICBmcmVxdWVuY3lTdHJpbmcsXHJcbiAgICAgIHsgZm9udDogTm9ybWFsTW9kZXNDb25zdGFudHMuQ09OVFJPTF9GT05ULCBtYXhXaWR0aDogMTIwIH1cclxuICAgICk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAxOyBpIDwgcGFuZWxDb2x1bW5zLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBwYW5lbENvbHVtbnNbIGkgXSA9IG5ldyBWQm94KCB7XHJcbiAgICAgICAgc3BhY2luZzogNSxcclxuICAgICAgICBhbGlnbjogJ2NlbnRlcidcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHBhbmVsQ29sdW1uc1sgMCBdID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgbmV3IExpbmUoIDAsIDAsIDEwLCAxMCApIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBsaW5lU2VwYXJhdG9yID0gbmV3IExpbmUoIDAsIDAsIDAsIDAsIHtcclxuICAgICAgc3Ryb2tlOiBOb3JtYWxNb2Rlc0NvbG9ycy5TRVBBUkFUT1JfU1RST0tFXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY29udGVudE5vZGUgPSBuZXcgSEJveCgge1xyXG4gICAgICBzcGFjaW5nOiA5LjgsXHJcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgY2hpbGRyZW46IHBhbmVsQ29sdW1ucy5zbGljZSggMCwgbW9kZWwubnVtYmVyT2ZNYXNzZXNQcm9wZXJ0eS5nZXQoKSArIDEgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGFtcGxpdHVkZURpcmVjdGlvblJhZGlvQnV0dG9uR3JvdXAgPSBuZXcgQW1wbGl0dWRlRGlyZWN0aW9uUmFkaW9CdXR0b25Hcm91cCggbW9kZWwuYW1wbGl0dWRlRGlyZWN0aW9uUHJvcGVydHkgKTtcclxuXHJcbiAgICBzdXBlciggY29udGVudE5vZGUsIG9wdGlvbnMgKTtcclxuXHJcbiAgICBsZXQgc3RydXQ7XHJcblxyXG4gICAgLy8gdW5saW5rIGlzIHVubmVjZXNzYXJ5LCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltXHJcbiAgICBtb2RlbC5waGFzZXNWaXNpYmxlUHJvcGVydHkubGluayggcGhhc2VzVmlzaWJpbGl0eSA9PiB7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMTsgaSA8IHBhbmVsQ29sdW1ucy5sZW5ndGg7ICsraSApIHtcclxuICAgICAgICBjb25zdCBqID0gaSAtIDE7XHJcbiAgICAgICAgcGFuZWxDb2x1bW5zWyBpIF0uY2hpbGRyZW4gPSAoIHBoYXNlc1Zpc2liaWxpdHkgKSA/XHJcbiAgICAgICAgICBbIG1vZGVHcmFwaHNbIGogXSwgbW9kZUxhYmVsc1sgaiBdLCBhbXBsaXR1ZGVTbGlkZXJzWyBqIF0sIGZyZXF1ZW5jeVRleHRbIGogXSwgcGhhc2VTbGlkZXJzWyBqIF0gXSA6XHJcbiAgICAgICAgICBbIG1vZGVHcmFwaHNbIGogXSwgbW9kZUxhYmVsc1sgaiBdLCBhbXBsaXR1ZGVTbGlkZXJzWyBqIF0sIGZyZXF1ZW5jeVRleHRbIGogXSBdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBsaW5lU2VwYXJhdG9yLnNldFkyKCBwYW5lbENvbHVtbnNbIDEgXS5ib3VuZHMuaGVpZ2h0ICogMC44ICk7XHJcblxyXG4gICAgICAvLyB0aGUgcHJldmlvdXMgVlN0cnV0IG5lZWRzIHRvIGJlIGRpc3Bvc2VkXHJcbiAgICAgIGlmICggc3RydXQgJiYgdHlwZW9mIHN0cnV0LmRpc3Bvc2UgPT09ICdmdW5jdGlvbicgKSB7XHJcbiAgICAgICAgc3RydXQuZGlzcG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIHN0cnV0ID0gbmV3IFZTdHJ1dCggcGFuZWxDb2x1bW5zWyAxIF0uYm91bmRzLmhlaWdodCApO1xyXG5cclxuICAgICAgcGFuZWxDb2x1bW5zWyAwIF0uY2hpbGRyZW4gPSAoIHBoYXNlc1Zpc2liaWxpdHkgKSA/XHJcbiAgICAgICAgWyBzdHJ1dCwgbm9ybWFsTW9kZUxhYmVsLCBhbXBsaXR1ZGVMYWJlbCwgZnJlcXVlbmN5TGFiZWwsIHBoYXNlQm94IF0gOlxyXG4gICAgICAgIFsgc3RydXQsIG5vcm1hbE1vZGVMYWJlbCwgYW1wbGl0dWRlTGFiZWwsIGZyZXF1ZW5jeUxhYmVsIF07XHJcblxyXG4gICAgICBub3JtYWxNb2RlTGFiZWwuY2VudGVyWSA9IG1vZGVMYWJlbHNbIDAgXS5jZW50ZXJZO1xyXG4gICAgICBhbXBsaXR1ZGVMYWJlbC5jZW50ZXJZID0gYW1wbGl0dWRlU2xpZGVyc1sgMCBdLmNlbnRlclk7XHJcbiAgICAgIGZyZXF1ZW5jeUxhYmVsLmNlbnRlclkgPSBmcmVxdWVuY3lUZXh0WyAwIF0uY2VudGVyWTtcclxuICAgICAgcGhhc2VCb3guY2VudGVyWSA9IHBoYXNlU2xpZGVyc1sgMCBdLmNlbnRlclk7XHJcblxyXG4gICAgICBub3JtYWxNb2RlTGFiZWwucmlnaHQgPSBwYW5lbENvbHVtbnNbIDAgXS5yaWdodDtcclxuICAgICAgYW1wbGl0dWRlTGFiZWwucmlnaHQgPSBwYW5lbENvbHVtbnNbIDAgXS5yaWdodDtcclxuICAgICAgZnJlcXVlbmN5TGFiZWwucmlnaHQgPSBwYW5lbENvbHVtbnNbIDAgXS5yaWdodDtcclxuICAgICAgcGhhc2VCb3gucmlnaHQgPSBwYW5lbENvbHVtbnNbIDAgXS5yaWdodDtcclxuXHJcbiAgICAgIHRoaXMuYm90dG9tID0gb3B0aW9ucy5ib3R0b207XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdW5saW5rIGlzIHVubmVjZXNzYXJ5LCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltXHJcbiAgICBtb2RlbC5udW1iZXJPZk1hc3Nlc1Byb3BlcnR5LmxpbmsoIG51bWJlck9mTWFzc2VzID0+IHtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZNYXNzZXM7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBrID0gTm9ybWFsTW9kZXNDb25zdGFudHMuU1BSSU5HX0NPTlNUQU5UX1ZBTFVFO1xyXG4gICAgICAgIGNvbnN0IG0gPSBOb3JtYWxNb2Rlc0NvbnN0YW50cy5NQVNTRVNfTUFTU19WQUxVRTtcclxuICAgICAgICBjb25zdCBmcmVxdWVuY3lSYXRpbyA9IG1vZGVsLm1vZGVGcmVxdWVuY3lQcm9wZXJ0aWVzWyBpIF0uZ2V0KCkgLyBNYXRoLnNxcnQoIGsgLyBtICk7XHJcblxyXG4gICAgICAgIG1vZGVHcmFwaHNbIGkgXS51cGRhdGUoKTtcclxuICAgICAgICBmcmVxdWVuY3lUZXh0WyBpIF0uc3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCBmcmVxdWVuY3lSYXRpb09tZWdhUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgICAgZnJlcXVlbmN5UmF0aW86IFV0aWxzLnRvRml4ZWQoIGZyZXF1ZW5jeVJhdGlvLCAyIClcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnRlbnROb2RlLmNoaWxkcmVuID0gcGFuZWxDb2x1bW5zLnNsaWNlKCAwLCBudW1iZXJPZk1hc3NlcyArIDEgKTtcclxuICAgICAgY29udGVudE5vZGUuYWRkQ2hpbGQoIGxpbmVTZXBhcmF0b3IgKTtcclxuICAgICAgY29udGVudE5vZGUuYWRkQ2hpbGQoIGFtcGxpdHVkZURpcmVjdGlvblJhZGlvQnV0dG9uR3JvdXAgKTtcclxuXHJcbiAgICAgIC8vIG5lZWRlZCB0byBjZW50ZXIgYmFzZWQgb24gdGhlIHJlY2FsY3VsYXRlZCBsYXlvdXQgKGxheW91dCBzaG91bGQgYmUgYSBwcml2YXRlIG1ldGhvZCwgVE9ETzogZml4KVxyXG4gICAgICB0aGlzLmxheW91dCgpO1xyXG4gICAgICB0aGlzLmNlbnRlclggPSBvcHRpb25zLmNlbnRlclg7XHJcblxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxubm9ybWFsTW9kZXMucmVnaXN0ZXIoICdOb3JtYWxNb2RlU3BlY3RydW1BY2NvcmRpb25Cb3gnLCBOb3JtYWxNb2RlU3BlY3RydW1BY2NvcmRpb25Cb3ggKTtcclxuZXhwb3J0IGRlZmF1bHQgTm9ybWFsTW9kZVNwZWN0cnVtQWNjb3JkaW9uQm94OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxjQUFjLE1BQU0sc0NBQXNDO0FBQ2pFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxXQUFXLE1BQU0sK0NBQStDO0FBQ3ZFLE9BQU9DLFdBQVcsTUFB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