// Copyright 2021-2023, University of Colorado Boulder

/**
 * WidthIndicatorPlot plots a general width on a chart, using dimensional arrows.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, RichText } from '../../../../scenery/js/imports.js';
import FMWColors from '../../common/FMWColors.js';
import FMWSymbols from '../../common/FMWSymbols.js';
import Domain from '../../common/model/Domain.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import HorizontalDimensionalArrowsNode from './HorizontalDimensionalArrowsNode.js';
export default class WidthIndicatorPlot extends Node {
  /**
   * @param {ChartTransform} chartTransform - transform for the chart that renders this plot
   * @param {ReadOnlyProperty.<number>} widthProperty - width of the indicator, in model coordinates
   * @param {ReadOnlyProperty.<Vector2>} positionProperty - position of the indicator, in model coordinates
   * @param {EnumerationProperty.<Domain>} domainProperty - the Domain, space or time
   * @param {TReadOnlyProperty.<string>} spaceSymbolStringProperty - symbol for the space Domain
   * @param {TReadOnlyProperty.<string>} timeSymbolStringProperty - symbol for the time Domain
   * @param {Object} [options]
   */
  constructor(chartTransform, widthProperty, positionProperty, domainProperty, spaceSymbolStringProperty, timeSymbolStringProperty, options) {
    assert && assert(chartTransform instanceof ChartTransform);
    assert && AssertUtils.assertAbstractPropertyOf(widthProperty, 'number');
    assert && AssertUtils.assertAbstractPropertyOf(positionProperty, Vector2);
    assert && assert(domainProperty instanceof EnumerationProperty);
    options = merge({
      // HorizontalDimensionalArrowsNode options
      dimensionalArrowsNodeOptions: {
        color: FMWColors.widthIndicatorsColorProperty
      },
      // RichText options
      richTextOptions: {
        font: new PhetFont(16),
        stroke: FMWColors.widthIndicatorsColorProperty,
        maxWidth: 150
      }
    }, options);

    // Dimensional arrows
    const dimensionalArrowsNode = new HorizontalDimensionalArrowsNode(options.dimensionalArrowsNodeOptions);
    const labelStringProperty = new DerivedProperty([domainProperty, FMWSymbols.sigmaStringProperty, spaceSymbolStringProperty, timeSymbolStringProperty], (domain, sigma, spaceSymbol, timeSymbol) => {
      const waveNumberSymbol = domain === Domain.SPACE ? spaceSymbol : timeSymbol;
      return `2${sigma}<sub>${waveNumberSymbol}</sub>`;
    });

    // Label on a translucent background that resizes to fit the label.
    const labelNode = new RichText(labelStringProperty, options.richTextOptions);
    const backgroundNode = new BackgroundNode(labelNode, {
      xMargin: 5,
      rectangleOptions: {
        cornerRadius: 2
      }
    });
    assert && assert(!options.children, 'DimensionalArrowsNode sets children');
    options = merge({
      children: [dimensionalArrowsNode, backgroundNode]
    }, options);
    super(options);

    // Center the label BELOW the dimensional arrows, so that it doesn't get clipped by the charts.
    function updateLabelPosition() {
      backgroundNode.centerX = dimensionalArrowsNode.centerX;
      backgroundNode.top = dimensionalArrowsNode.bottom;
    }
    backgroundNode.boundsProperty.link(bounds => updateLabelPosition());

    // Resize the dimensional arrows, and center them on the position.
    function updateDimensionalArrows() {
      const viewWidth = chartTransform.modelToViewDeltaX(widthProperty.value);
      dimensionalArrowsNode.setLine(0, viewWidth);
      dimensionalArrowsNode.center = chartTransform.modelToViewPosition(positionProperty.value);
      updateLabelPosition();
    }
    chartTransform.changedEmitter.addListener(updateDimensionalArrows);
    widthProperty.link(updateDimensionalArrows);
    positionProperty.link(updateDimensionalArrows);
  }
}
fourierMakingWaves.register('WidthIndicatorPlot', WidthIndicatorPlot);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJFbnVtZXJhdGlvblByb3BlcnR5IiwiQ2hhcnRUcmFuc2Zvcm0iLCJWZWN0b3IyIiwibWVyZ2UiLCJBc3NlcnRVdGlscyIsIkJhY2tncm91bmROb2RlIiwiUGhldEZvbnQiLCJOb2RlIiwiUmljaFRleHQiLCJGTVdDb2xvcnMiLCJGTVdTeW1ib2xzIiwiRG9tYWluIiwiZm91cmllck1ha2luZ1dhdmVzIiwiSG9yaXpvbnRhbERpbWVuc2lvbmFsQXJyb3dzTm9kZSIsIldpZHRoSW5kaWNhdG9yUGxvdCIsImNvbnN0cnVjdG9yIiwiY2hhcnRUcmFuc2Zvcm0iLCJ3aWR0aFByb3BlcnR5IiwicG9zaXRpb25Qcm9wZXJ0eSIsImRvbWFpblByb3BlcnR5Iiwic3BhY2VTeW1ib2xTdHJpbmdQcm9wZXJ0eSIsInRpbWVTeW1ib2xTdHJpbmdQcm9wZXJ0eSIsIm9wdGlvbnMiLCJhc3NlcnQiLCJhc3NlcnRBYnN0cmFjdFByb3BlcnR5T2YiLCJkaW1lbnNpb25hbEFycm93c05vZGVPcHRpb25zIiwiY29sb3IiLCJ3aWR0aEluZGljYXRvcnNDb2xvclByb3BlcnR5IiwicmljaFRleHRPcHRpb25zIiwiZm9udCIsInN0cm9rZSIsIm1heFdpZHRoIiwiZGltZW5zaW9uYWxBcnJvd3NOb2RlIiwibGFiZWxTdHJpbmdQcm9wZXJ0eSIsInNpZ21hU3RyaW5nUHJvcGVydHkiLCJkb21haW4iLCJzaWdtYSIsInNwYWNlU3ltYm9sIiwidGltZVN5bWJvbCIsIndhdmVOdW1iZXJTeW1ib2wiLCJTUEFDRSIsImxhYmVsTm9kZSIsImJhY2tncm91bmROb2RlIiwieE1hcmdpbiIsInJlY3RhbmdsZU9wdGlvbnMiLCJjb3JuZXJSYWRpdXMiLCJjaGlsZHJlbiIsInVwZGF0ZUxhYmVsUG9zaXRpb24iLCJjZW50ZXJYIiwidG9wIiwiYm90dG9tIiwiYm91bmRzUHJvcGVydHkiLCJsaW5rIiwiYm91bmRzIiwidXBkYXRlRGltZW5zaW9uYWxBcnJvd3MiLCJ2aWV3V2lkdGgiLCJtb2RlbFRvVmlld0RlbHRhWCIsInZhbHVlIiwic2V0TGluZSIsImNlbnRlciIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJjaGFuZ2VkRW1pdHRlciIsImFkZExpc3RlbmVyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJXaWR0aEluZGljYXRvclBsb3QuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogV2lkdGhJbmRpY2F0b3JQbG90IHBsb3RzIGEgZ2VuZXJhbCB3aWR0aCBvbiBhIGNoYXJ0LCB1c2luZyBkaW1lbnNpb25hbCBhcnJvd3MuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBDaGFydFRyYW5zZm9ybSBmcm9tICcuLi8uLi8uLi8uLi9iYW1ib28vanMvQ2hhcnRUcmFuc2Zvcm0uanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgQXNzZXJ0VXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9Bc3NlcnRVdGlscy5qcyc7XHJcbmltcG9ydCBCYWNrZ3JvdW5kTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvQmFja2dyb3VuZE5vZGUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUmljaFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgRk1XQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi9GTVdDb2xvcnMuanMnO1xyXG5pbXBvcnQgRk1XU3ltYm9scyBmcm9tICcuLi8uLi9jb21tb24vRk1XU3ltYm9scy5qcyc7XHJcbmltcG9ydCBEb21haW4gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0RvbWFpbi5qcyc7XHJcbmltcG9ydCBmb3VyaWVyTWFraW5nV2F2ZXMgZnJvbSAnLi4vLi4vZm91cmllck1ha2luZ1dhdmVzLmpzJztcclxuaW1wb3J0IEhvcml6b250YWxEaW1lbnNpb25hbEFycm93c05vZGUgZnJvbSAnLi9Ib3Jpem9udGFsRGltZW5zaW9uYWxBcnJvd3NOb2RlLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdpZHRoSW5kaWNhdG9yUGxvdCBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0NoYXJ0VHJhbnNmb3JtfSBjaGFydFRyYW5zZm9ybSAtIHRyYW5zZm9ybSBmb3IgdGhlIGNoYXJ0IHRoYXQgcmVuZGVycyB0aGlzIHBsb3RcclxuICAgKiBAcGFyYW0ge1JlYWRPbmx5UHJvcGVydHkuPG51bWJlcj59IHdpZHRoUHJvcGVydHkgLSB3aWR0aCBvZiB0aGUgaW5kaWNhdG9yLCBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAqIEBwYXJhbSB7UmVhZE9ubHlQcm9wZXJ0eS48VmVjdG9yMj59IHBvc2l0aW9uUHJvcGVydHkgLSBwb3NpdGlvbiBvZiB0aGUgaW5kaWNhdG9yLCBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAqIEBwYXJhbSB7RW51bWVyYXRpb25Qcm9wZXJ0eS48RG9tYWluPn0gZG9tYWluUHJvcGVydHkgLSB0aGUgRG9tYWluLCBzcGFjZSBvciB0aW1lXHJcbiAgICogQHBhcmFtIHtUUmVhZE9ubHlQcm9wZXJ0eS48c3RyaW5nPn0gc3BhY2VTeW1ib2xTdHJpbmdQcm9wZXJ0eSAtIHN5bWJvbCBmb3IgdGhlIHNwYWNlIERvbWFpblxyXG4gICAqIEBwYXJhbSB7VFJlYWRPbmx5UHJvcGVydHkuPHN0cmluZz59IHRpbWVTeW1ib2xTdHJpbmdQcm9wZXJ0eSAtIHN5bWJvbCBmb3IgdGhlIHRpbWUgRG9tYWluXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjaGFydFRyYW5zZm9ybSwgd2lkdGhQcm9wZXJ0eSwgcG9zaXRpb25Qcm9wZXJ0eSwgZG9tYWluUHJvcGVydHksXHJcbiAgICAgICAgICAgICAgIHNwYWNlU3ltYm9sU3RyaW5nUHJvcGVydHksIHRpbWVTeW1ib2xTdHJpbmdQcm9wZXJ0eSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjaGFydFRyYW5zZm9ybSBpbnN0YW5jZW9mIENoYXJ0VHJhbnNmb3JtICk7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0QWJzdHJhY3RQcm9wZXJ0eU9mKCB3aWR0aFByb3BlcnR5LCAnbnVtYmVyJyApO1xyXG4gICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydEFic3RyYWN0UHJvcGVydHlPZiggcG9zaXRpb25Qcm9wZXJ0eSwgVmVjdG9yMiApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZG9tYWluUHJvcGVydHkgaW5zdGFuY2VvZiBFbnVtZXJhdGlvblByb3BlcnR5ICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBIb3Jpem9udGFsRGltZW5zaW9uYWxBcnJvd3NOb2RlIG9wdGlvbnNcclxuICAgICAgZGltZW5zaW9uYWxBcnJvd3NOb2RlT3B0aW9uczoge1xyXG4gICAgICAgIGNvbG9yOiBGTVdDb2xvcnMud2lkdGhJbmRpY2F0b3JzQ29sb3JQcm9wZXJ0eVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gUmljaFRleHQgb3B0aW9uc1xyXG4gICAgICByaWNoVGV4dE9wdGlvbnM6IHtcclxuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE2ICksXHJcbiAgICAgICAgc3Ryb2tlOiBGTVdDb2xvcnMud2lkdGhJbmRpY2F0b3JzQ29sb3JQcm9wZXJ0eSxcclxuICAgICAgICBtYXhXaWR0aDogMTUwXHJcbiAgICAgIH1cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBEaW1lbnNpb25hbCBhcnJvd3NcclxuICAgIGNvbnN0IGRpbWVuc2lvbmFsQXJyb3dzTm9kZSA9IG5ldyBIb3Jpem9udGFsRGltZW5zaW9uYWxBcnJvd3NOb2RlKCBvcHRpb25zLmRpbWVuc2lvbmFsQXJyb3dzTm9kZU9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBsYWJlbFN0cmluZ1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyBkb21haW5Qcm9wZXJ0eSwgRk1XU3ltYm9scy5zaWdtYVN0cmluZ1Byb3BlcnR5LCBzcGFjZVN5bWJvbFN0cmluZ1Byb3BlcnR5LCB0aW1lU3ltYm9sU3RyaW5nUHJvcGVydHkgXSxcclxuICAgICAgKCBkb21haW4sIHNpZ21hLCBzcGFjZVN5bWJvbCwgdGltZVN5bWJvbCApID0+IHtcclxuICAgICAgICBjb25zdCB3YXZlTnVtYmVyU3ltYm9sID0gKCBkb21haW4gPT09IERvbWFpbi5TUEFDRSApID8gc3BhY2VTeW1ib2wgOiB0aW1lU3ltYm9sO1xyXG4gICAgICAgIHJldHVybiBgMiR7c2lnbWF9PHN1Yj4ke3dhdmVOdW1iZXJTeW1ib2x9PC9zdWI+YDtcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIExhYmVsIG9uIGEgdHJhbnNsdWNlbnQgYmFja2dyb3VuZCB0aGF0IHJlc2l6ZXMgdG8gZml0IHRoZSBsYWJlbC5cclxuICAgIGNvbnN0IGxhYmVsTm9kZSA9IG5ldyBSaWNoVGV4dCggbGFiZWxTdHJpbmdQcm9wZXJ0eSwgb3B0aW9ucy5yaWNoVGV4dE9wdGlvbnMgKTtcclxuICAgIGNvbnN0IGJhY2tncm91bmROb2RlID0gbmV3IEJhY2tncm91bmROb2RlKCBsYWJlbE5vZGUsIHtcclxuICAgICAgeE1hcmdpbjogNSxcclxuICAgICAgcmVjdGFuZ2xlT3B0aW9uczoge1xyXG4gICAgICAgIGNvcm5lclJhZGl1czogMlxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuY2hpbGRyZW4sICdEaW1lbnNpb25hbEFycm93c05vZGUgc2V0cyBjaGlsZHJlbicgKTtcclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBjaGlsZHJlbjogWyBkaW1lbnNpb25hbEFycm93c05vZGUsIGJhY2tncm91bmROb2RlIF1cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIENlbnRlciB0aGUgbGFiZWwgQkVMT1cgdGhlIGRpbWVuc2lvbmFsIGFycm93cywgc28gdGhhdCBpdCBkb2Vzbid0IGdldCBjbGlwcGVkIGJ5IHRoZSBjaGFydHMuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVMYWJlbFBvc2l0aW9uKCkge1xyXG4gICAgICBiYWNrZ3JvdW5kTm9kZS5jZW50ZXJYID0gZGltZW5zaW9uYWxBcnJvd3NOb2RlLmNlbnRlclg7XHJcbiAgICAgIGJhY2tncm91bmROb2RlLnRvcCA9IGRpbWVuc2lvbmFsQXJyb3dzTm9kZS5ib3R0b207XHJcbiAgICB9XHJcblxyXG4gICAgYmFja2dyb3VuZE5vZGUuYm91bmRzUHJvcGVydHkubGluayggYm91bmRzID0+IHVwZGF0ZUxhYmVsUG9zaXRpb24oKSApO1xyXG5cclxuICAgIC8vIFJlc2l6ZSB0aGUgZGltZW5zaW9uYWwgYXJyb3dzLCBhbmQgY2VudGVyIHRoZW0gb24gdGhlIHBvc2l0aW9uLlxyXG4gICAgZnVuY3Rpb24gdXBkYXRlRGltZW5zaW9uYWxBcnJvd3MoKSB7XHJcbiAgICAgIGNvbnN0IHZpZXdXaWR0aCA9IGNoYXJ0VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCB3aWR0aFByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgIGRpbWVuc2lvbmFsQXJyb3dzTm9kZS5zZXRMaW5lKCAwLCB2aWV3V2lkdGggKTtcclxuICAgICAgZGltZW5zaW9uYWxBcnJvd3NOb2RlLmNlbnRlciA9IGNoYXJ0VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgdXBkYXRlTGFiZWxQb3NpdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIGNoYXJ0VHJhbnNmb3JtLmNoYW5nZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB1cGRhdGVEaW1lbnNpb25hbEFycm93cyApO1xyXG4gICAgd2lkdGhQcm9wZXJ0eS5saW5rKCB1cGRhdGVEaW1lbnNpb25hbEFycm93cyApO1xyXG4gICAgcG9zaXRpb25Qcm9wZXJ0eS5saW5rKCB1cGRhdGVEaW1lbnNpb25hbEFycm93cyApO1xyXG4gIH1cclxufVxyXG5cclxuZm91cmllck1ha2luZ1dhdmVzLnJlZ2lzdGVyKCAnV2lkdGhJbmRpY2F0b3JQbG90JywgV2lkdGhJbmRpY2F0b3JQbG90ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsbUJBQW1CLE1BQU0sNENBQTRDO0FBQzVFLE9BQU9DLGNBQWMsTUFBTSx5Q0FBeUM7QUFDcEUsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSwwQ0FBMEM7QUFDbEUsT0FBT0MsY0FBYyxNQUFNLCtDQUErQztBQUMxRSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksRUFBRUMsUUFBUSxRQUFR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