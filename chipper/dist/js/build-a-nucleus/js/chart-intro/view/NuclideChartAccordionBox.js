// Copyright 2023, University of Colorado Boulder

import AccordionBox from '../../../../sun/js/AccordionBox.js';
import buildANucleus from '../../buildANucleus.js';
import NuclideChartAndNumberLines from './NuclideChartAndNumberLines.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import { Color, HBox, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import NuclideChartLegendNode from './NuclideChartLegendNode.js';
import BANConstants from '../../common/BANConstants.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import Range from '../../../../dot/js/Range.js';
import FocusedNuclideChartNode from './FocusedNuclideChartNode.js';

/**
 * Node that holds Nuclide Chart and Zoom-in nuclide chart view.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

class NuclideChartAccordionBox extends AccordionBox {
  constructor(protonCountProperty, neutronCountProperty, minWidth, selectedNuclideChartProperty) {
    const getChartTransform = scaleFactor => new ChartTransform({
      viewWidth: BANConstants.CHART_MAX_NUMBER_OF_NEUTRONS * scaleFactor,
      modelXRange: new Range(BANConstants.DEFAULT_INITIAL_NEUTRON_COUNT, BANConstants.CHART_MAX_NUMBER_OF_NEUTRONS),
      viewHeight: BANConstants.CHART_MAX_NUMBER_OF_PROTONS * scaleFactor,
      modelYRange: new Range(BANConstants.DEFAULT_INITIAL_PROTON_COUNT, BANConstants.CHART_MAX_NUMBER_OF_PROTONS)
    });
    const partialChartTransform = getChartTransform(20);
    const focusedChartTransform = getChartTransform(10);
    const nuclideChartAndNumberLines = new NuclideChartAndNumberLines(protonCountProperty, neutronCountProperty, partialChartTransform);
    const focusedNuclideChartNode = new FocusedNuclideChartNode(protonCountProperty, neutronCountProperty, focusedChartTransform);
    const nuclideChartLegendNode = new NuclideChartLegendNode();
    const zoomInChart = new Rectangle(0, 0, 100, 100, {
      stroke: Color.BLACK,
      layoutOptions: {
        topMargin: 3
      }
    });
    selectedNuclideChartProperty.link(selectedNuclideChart => {
      zoomInChart.visible = selectedNuclideChart === 'zoom';
      focusedNuclideChartNode.visible = selectedNuclideChart === 'zoom';
      nuclideChartAndNumberLines.visible = selectedNuclideChart === 'partial';
    });
    const chartsHBox = new HBox({
      children: [zoomInChart, nuclideChartAndNumberLines, focusedNuclideChartNode],
      spacing: 10,
      align: 'top',
      excludeInvisibleChildrenFromBounds: true,
      minContentHeight: 270
    });
    const contentVBox = new VBox({
      children: [chartsHBox, nuclideChartLegendNode],
      spacing: 10,
      excludeInvisibleChildrenFromBounds: true
    });
    super(contentVBox, {
      titleNode: new Text(BuildANucleusStrings.partialNuclideChart, {
        font: BANConstants.REGULAR_FONT,
        maxWidth: 200
      }),
      fill: Color.white,
      minWidth: minWidth,
      contentYSpacing: 0,
      buttonXMargin: 10,
      buttonYMargin: 10,
      expandCollapseButtonOptions: {
        sideLength: 18
      },
      titleAlignX: 'left',
      stroke: BANConstants.PANEL_STROKE,
      cornerRadius: BANConstants.PANEL_CORNER_RADIUS
    });
  }
}
buildANucleus.register('NuclideChartAccordionBox', NuclideChartAccordionBox);
export default NuclideChartAccordionBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBY2NvcmRpb25Cb3giLCJidWlsZEFOdWNsZXVzIiwiTnVjbGlkZUNoYXJ0QW5kTnVtYmVyTGluZXMiLCJCdWlsZEFOdWNsZXVzU3RyaW5ncyIsIkNvbG9yIiwiSEJveCIsIlJlY3RhbmdsZSIsIlRleHQiLCJWQm94IiwiTnVjbGlkZUNoYXJ0TGVnZW5kTm9kZSIsIkJBTkNvbnN0YW50cyIsIkNoYXJ0VHJhbnNmb3JtIiwiUmFuZ2UiLCJGb2N1c2VkTnVjbGlkZUNoYXJ0Tm9kZSIsIk51Y2xpZGVDaGFydEFjY29yZGlvbkJveCIsImNvbnN0cnVjdG9yIiwicHJvdG9uQ291bnRQcm9wZXJ0eSIsIm5ldXRyb25Db3VudFByb3BlcnR5IiwibWluV2lkdGgiLCJzZWxlY3RlZE51Y2xpZGVDaGFydFByb3BlcnR5IiwiZ2V0Q2hhcnRUcmFuc2Zvcm0iLCJzY2FsZUZhY3RvciIsInZpZXdXaWR0aCIsIkNIQVJUX01BWF9OVU1CRVJfT0ZfTkVVVFJPTlMiLCJtb2RlbFhSYW5nZSIsIkRFRkFVTFRfSU5JVElBTF9ORVVUUk9OX0NPVU5UIiwidmlld0hlaWdodCIsIkNIQVJUX01BWF9OVU1CRVJfT0ZfUFJPVE9OUyIsIm1vZGVsWVJhbmdlIiwiREVGQVVMVF9JTklUSUFMX1BST1RPTl9DT1VOVCIsInBhcnRpYWxDaGFydFRyYW5zZm9ybSIsImZvY3VzZWRDaGFydFRyYW5zZm9ybSIsIm51Y2xpZGVDaGFydEFuZE51bWJlckxpbmVzIiwiZm9jdXNlZE51Y2xpZGVDaGFydE5vZGUiLCJudWNsaWRlQ2hhcnRMZWdlbmROb2RlIiwiem9vbUluQ2hhcnQiLCJzdHJva2UiLCJCTEFDSyIsImxheW91dE9wdGlvbnMiLCJ0b3BNYXJnaW4iLCJsaW5rIiwic2VsZWN0ZWROdWNsaWRlQ2hhcnQiLCJ2aXNpYmxlIiwiY2hhcnRzSEJveCIsImNoaWxkcmVuIiwic3BhY2luZyIsImFsaWduIiwiZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyIsIm1pbkNvbnRlbnRIZWlnaHQiLCJjb250ZW50VkJveCIsInRpdGxlTm9kZSIsInBhcnRpYWxOdWNsaWRlQ2hhcnQiLCJmb250IiwiUkVHVUxBUl9GT05UIiwibWF4V2lkdGgiLCJmaWxsIiwid2hpdGUiLCJjb250ZW50WVNwYWNpbmciLCJidXR0b25YTWFyZ2luIiwiYnV0dG9uWU1hcmdpbiIsImV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9ucyIsInNpZGVMZW5ndGgiLCJ0aXRsZUFsaWduWCIsIlBBTkVMX1NUUk9LRSIsImNvcm5lclJhZGl1cyIsIlBBTkVMX0NPUk5FUl9SQURJVVMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk51Y2xpZGVDaGFydEFjY29yZGlvbkJveC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBBY2NvcmRpb25Cb3ggZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0FjY29yZGlvbkJveC5qcyc7XHJcbmltcG9ydCBidWlsZEFOdWNsZXVzIGZyb20gJy4uLy4uL2J1aWxkQU51Y2xldXMuanMnO1xyXG5pbXBvcnQgTnVjbGlkZUNoYXJ0QW5kTnVtYmVyTGluZXMgZnJvbSAnLi9OdWNsaWRlQ2hhcnRBbmROdW1iZXJMaW5lcy5qcyc7XHJcbmltcG9ydCBCdWlsZEFOdWNsZXVzU3RyaW5ncyBmcm9tICcuLi8uLi9CdWlsZEFOdWNsZXVzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBIQm94LCBSZWN0YW5nbGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgTnVjbGlkZUNoYXJ0TGVnZW5kTm9kZSBmcm9tICcuL051Y2xpZGVDaGFydExlZ2VuZE5vZGUuanMnO1xyXG5pbXBvcnQgeyBTZWxlY3RlZENoYXJ0VHlwZSB9IGZyb20gJy4uL21vZGVsL0NoYXJ0SW50cm9Nb2RlbC5qcyc7XHJcbmltcG9ydCBCQU5Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0JBTkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBDaGFydFRyYW5zZm9ybSBmcm9tICcuLi8uLi8uLi8uLi9iYW1ib28vanMvQ2hhcnRUcmFuc2Zvcm0uanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IEZvY3VzZWROdWNsaWRlQ2hhcnROb2RlIGZyb20gJy4vRm9jdXNlZE51Y2xpZGVDaGFydE5vZGUuanMnO1xyXG5cclxuLyoqXHJcbiAqIE5vZGUgdGhhdCBob2xkcyBOdWNsaWRlIENoYXJ0IGFuZCBab29tLWluIG51Y2xpZGUgY2hhcnQgdmlldy5cclxuICpcclxuICogQGF1dGhvciBMdWlzYSBWYXJnYXNcclxuICogQGF1dGhvciBNYXJsYSBTY2h1bHogKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuY2xhc3MgTnVjbGlkZUNoYXJ0QWNjb3JkaW9uQm94IGV4dGVuZHMgQWNjb3JkaW9uQm94IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm90b25Db3VudFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LCBuZXV0cm9uQ291bnRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPixcclxuICAgICAgICAgICAgICAgICAgICAgIG1pbldpZHRoOiBudW1iZXIsIHNlbGVjdGVkTnVjbGlkZUNoYXJ0UHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFNlbGVjdGVkQ2hhcnRUeXBlPiApIHtcclxuXHJcbiAgICBjb25zdCBnZXRDaGFydFRyYW5zZm9ybSA9ICggc2NhbGVGYWN0b3I6IG51bWJlciApID0+IG5ldyBDaGFydFRyYW5zZm9ybSgge1xyXG4gICAgICB2aWV3V2lkdGg6IEJBTkNvbnN0YW50cy5DSEFSVF9NQVhfTlVNQkVSX09GX05FVVRST05TICogc2NhbGVGYWN0b3IsXHJcbiAgICAgIG1vZGVsWFJhbmdlOiBuZXcgUmFuZ2UoIEJBTkNvbnN0YW50cy5ERUZBVUxUX0lOSVRJQUxfTkVVVFJPTl9DT1VOVCwgQkFOQ29uc3RhbnRzLkNIQVJUX01BWF9OVU1CRVJfT0ZfTkVVVFJPTlMgKSxcclxuICAgICAgdmlld0hlaWdodDogQkFOQ29uc3RhbnRzLkNIQVJUX01BWF9OVU1CRVJfT0ZfUFJPVE9OUyAqIHNjYWxlRmFjdG9yLFxyXG4gICAgICBtb2RlbFlSYW5nZTogbmV3IFJhbmdlKCBCQU5Db25zdGFudHMuREVGQVVMVF9JTklUSUFMX1BST1RPTl9DT1VOVCwgQkFOQ29uc3RhbnRzLkNIQVJUX01BWF9OVU1CRVJfT0ZfUFJPVE9OUyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgcGFydGlhbENoYXJ0VHJhbnNmb3JtID0gZ2V0Q2hhcnRUcmFuc2Zvcm0oIDIwICk7XHJcbiAgICBjb25zdCBmb2N1c2VkQ2hhcnRUcmFuc2Zvcm0gPSBnZXRDaGFydFRyYW5zZm9ybSggMTAgKTtcclxuXHJcbiAgICBjb25zdCBudWNsaWRlQ2hhcnRBbmROdW1iZXJMaW5lcyA9IG5ldyBOdWNsaWRlQ2hhcnRBbmROdW1iZXJMaW5lcyggcHJvdG9uQ291bnRQcm9wZXJ0eSwgbmV1dHJvbkNvdW50UHJvcGVydHksXHJcbiAgICAgIHBhcnRpYWxDaGFydFRyYW5zZm9ybSApO1xyXG5cclxuICAgIGNvbnN0IGZvY3VzZWROdWNsaWRlQ2hhcnROb2RlID0gbmV3IEZvY3VzZWROdWNsaWRlQ2hhcnROb2RlKCBwcm90b25Db3VudFByb3BlcnR5LCBuZXV0cm9uQ291bnRQcm9wZXJ0eSxcclxuICAgICAgZm9jdXNlZENoYXJ0VHJhbnNmb3JtICk7XHJcbiAgICBjb25zdCBudWNsaWRlQ2hhcnRMZWdlbmROb2RlID0gbmV3IE51Y2xpZGVDaGFydExlZ2VuZE5vZGUoKTtcclxuXHJcbiAgICBjb25zdCB6b29tSW5DaGFydCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwMCwgMTAwLCB7XHJcbiAgICAgIHN0cm9rZTogQ29sb3IuQkxBQ0ssXHJcbiAgICAgIGxheW91dE9wdGlvbnM6IHtcclxuICAgICAgICB0b3BNYXJnaW46IDNcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgc2VsZWN0ZWROdWNsaWRlQ2hhcnRQcm9wZXJ0eS5saW5rKCBzZWxlY3RlZE51Y2xpZGVDaGFydCA9PiB7XHJcbiAgICAgIHpvb21JbkNoYXJ0LnZpc2libGUgPSBzZWxlY3RlZE51Y2xpZGVDaGFydCA9PT0gJ3pvb20nO1xyXG4gICAgICBmb2N1c2VkTnVjbGlkZUNoYXJ0Tm9kZS52aXNpYmxlID0gc2VsZWN0ZWROdWNsaWRlQ2hhcnQgPT09ICd6b29tJztcclxuICAgICAgbnVjbGlkZUNoYXJ0QW5kTnVtYmVyTGluZXMudmlzaWJsZSA9IHNlbGVjdGVkTnVjbGlkZUNoYXJ0ID09PSAncGFydGlhbCc7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY2hhcnRzSEJveCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgem9vbUluQ2hhcnQsXHJcbiAgICAgICAgbnVjbGlkZUNoYXJ0QW5kTnVtYmVyTGluZXMsXHJcbiAgICAgICAgZm9jdXNlZE51Y2xpZGVDaGFydE5vZGVcclxuICAgICAgXSxcclxuICAgICAgc3BhY2luZzogMTAsXHJcbiAgICAgIGFsaWduOiAndG9wJyxcclxuICAgICAgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kczogdHJ1ZSxcclxuICAgICAgbWluQ29udGVudEhlaWdodDogMjcwXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBjb250ZW50VkJveCA9IG5ldyBWQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgY2hhcnRzSEJveCxcclxuICAgICAgICBudWNsaWRlQ2hhcnRMZWdlbmROb2RlXHJcbiAgICAgIF0sXHJcbiAgICAgIHNwYWNpbmc6IDEwLFxyXG4gICAgICBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzOiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIGNvbnRlbnRWQm94LCB7XHJcbiAgICAgIHRpdGxlTm9kZTogbmV3IFRleHQoIEJ1aWxkQU51Y2xldXNTdHJpbmdzLnBhcnRpYWxOdWNsaWRlQ2hhcnQsIHtcclxuICAgICAgICBmb250OiBCQU5Db25zdGFudHMuUkVHVUxBUl9GT05ULFxyXG4gICAgICAgIG1heFdpZHRoOiAyMDBcclxuICAgICAgfSApLFxyXG4gICAgICBmaWxsOiBDb2xvci53aGl0ZSxcclxuICAgICAgbWluV2lkdGg6IG1pbldpZHRoLFxyXG4gICAgICBjb250ZW50WVNwYWNpbmc6IDAsXHJcbiAgICAgIGJ1dHRvblhNYXJnaW46IDEwLFxyXG4gICAgICBidXR0b25ZTWFyZ2luOiAxMCxcclxuICAgICAgZXhwYW5kQ29sbGFwc2VCdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgc2lkZUxlbmd0aDogMThcclxuICAgICAgfSxcclxuICAgICAgdGl0bGVBbGlnblg6ICdsZWZ0JyxcclxuICAgICAgc3Ryb2tlOiBCQU5Db25zdGFudHMuUEFORUxfU1RST0tFLFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IEJBTkNvbnN0YW50cy5QQU5FTF9DT1JORVJfUkFESVVTXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5idWlsZEFOdWNsZXVzLnJlZ2lzdGVyKCAnTnVjbGlkZUNoYXJ0QWNjb3JkaW9uQm94JywgTnVjbGlkZUNoYXJ0QWNjb3JkaW9uQm94ICk7XHJcbmV4cG9ydCBkZWZhdWx0IE51Y2xpZGVDaGFydEFjY29yZGlvbkJveDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUdBLE9BQU9BLFlBQVksTUFBTSxvQ0FBb0M7QUFDN0QsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUNsRCxPQUFPQywwQkFBMEIsTUFBTSxpQ0FBaUM7QUFDeEUsT0FBT0Msb0JBQW9CLE1B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