// Copyright 2018-2023, University of Colorado Boulder

/**
 * Standard form equation, y = ax^2 + bx + c, with coefficients that can be changed via sliders.
 * The slider for coefficient 'a' has a quadratic taper (since it's modifying a quadratic term), while
 * the other sliders are linear.
 *
 * @author Andrea Lin
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import { Node, RichText } from '../../../../scenery/js/imports.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import GQSymbols from '../../common/GQSymbols.js';
import LinearSlider from '../../common/view/LinearSlider.js';
import QuadraticSlider from '../../common/view/QuadraticSlider.js';
import graphingQuadratics from '../../graphingQuadratics.js';
export default class ExploreInteractiveEquationNode extends Node {
  /**
   * Constructor parameters are coefficients of the standard form: y = ax^2 + bx + c
   */
  constructor(aProperty, bProperty, cProperty, providedOptions) {
    const options = optionize()({}, providedOptions);

    // equation
    const equationNode = new EquationNode(aProperty, bProperty, cProperty, options.tandem.createTandem('equationNode'));

    // coefficient controls (labeled sliders)
    const aSlider = new QuadraticSlider(GQSymbols.a, aProperty, {
      interval: GQConstants.EXPLORE_INTERVAL_A,
      snapToZeroEpsilon: GQConstants.EXPLORE_SNAP_TO_ZERO_EPSILON_A,
      labelColor: GQColors.EXPLORE_A,
      tandem: options.tandem.createTandem('aSlider'),
      phetioDocumentation: StringUtils.fillIn(GQConstants.SLIDER_DOC, {
        symbol: 'a'
      })
    });
    const bSlider = new LinearSlider(GQSymbols.b, bProperty, {
      interval: GQConstants.EXPLORE_INTERVAL_B,
      labelColor: GQColors.EXPLORE_B,
      tandem: options.tandem.createTandem('bSlider'),
      phetioDocumentation: StringUtils.fillIn(GQConstants.SLIDER_DOC, {
        symbol: 'b'
      })
    });
    const cSlider = new LinearSlider(GQSymbols.c, cProperty, {
      interval: GQConstants.EXPLORE_INTERVAL_C,
      labelColor: GQColors.EXPLORE_C,
      tandem: options.tandem.createTandem('cSlider'),
      phetioDocumentation: StringUtils.fillIn(GQConstants.SLIDER_DOC, {
        symbol: 'c'
      })
    });
    options.children = [equationNode, aSlider, bSlider, cSlider];
    super(options);

    // horizontally align sliders under their associated values in the equation
    const ySpacing = 3;
    aSlider.x = this.globalToLocalBounds(equationNode.aGlobalBounds).centerX;
    aSlider.top = equationNode.bottom + ySpacing;
    bSlider.x = this.globalToLocalBounds(equationNode.bGlobalBounds).centerX;
    bSlider.top = equationNode.bottom + ySpacing;
    cSlider.x = this.globalToLocalBounds(equationNode.cGlobalBounds).centerX;
    cSlider.top = equationNode.bottom + ySpacing;
  }
}

/**
 * The equation that appears above the sliders.
 */
class EquationNode extends Node {
  constructor(aProperty, bProperty, cProperty, tandem) {
    const options = {
      tandem: tandem,
      phetioDocumentation: 'the equation that changes as the sliders are adjusted'
    };

    // options for parts of the equation
    const equationOptions = {
      font: GQConstants.INTERACTIVE_EQUATION_FONT
    };
    const xyOptions = merge({}, equationOptions, {
      maxWidth: 20 // determined empirically
    });

    // y
    const yNode = new RichText(GQSymbols.y, xyOptions);

    // =
    const equalsNode = new RichText(MathSymbols.EQUAL_TO, equationOptions);

    // a value
    const aNode = new NumberDisplay(aProperty, aProperty.range, merge({}, GQConstants.NUMBER_DISPLAY_OPTIONS, {
      textOptions: {
        fill: GQColors.EXPLORE_A
      },
      decimalPlaces: GQConstants.EXPLORE_DECIMALS_A
    }));

    // x^2
    const xSquaredNode = new RichText(GQSymbols.xSquared, xyOptions);

    // + 
    const plusNode = new RichText(MathSymbols.PLUS, equationOptions);

    // b value
    const bNode = new NumberDisplay(bProperty, bProperty.range, merge({}, GQConstants.NUMBER_DISPLAY_OPTIONS, {
      textOptions: {
        fill: GQColors.EXPLORE_B
      },
      decimalPlaces: GQConstants.EXPLORE_DECIMALS_B
    }));

    // x
    const xNode = new RichText(GQSymbols.x, xyOptions);

    // +
    const anotherPlusNode = new RichText(MathSymbols.PLUS, equationOptions);

    // c value
    const cNode = new NumberDisplay(cProperty, bProperty.range, merge({}, GQConstants.NUMBER_DISPLAY_OPTIONS, {
      textOptions: {
        fill: GQColors.EXPLORE_C
      },
      decimalPlaces: GQConstants.EXPLORE_DECIMALS_C
    }));

    // y = ax^2 + bx + c
    options.children = [yNode, equalsNode, aNode, xSquaredNode, plusNode, xNode, bNode, anotherPlusNode, cNode];

    // layout
    equalsNode.left = yNode.right + GQConstants.EQUATION_OPERATOR_SPACING;
    aNode.left = equalsNode.right + GQConstants.EQUATION_OPERATOR_SPACING;
    xSquaredNode.left = aNode.right + GQConstants.EQUATION_TERM_SPACING;
    plusNode.left = xSquaredNode.right + GQConstants.EQUATION_OPERATOR_SPACING;
    bNode.left = plusNode.right + GQConstants.EQUATION_OPERATOR_SPACING;
    xNode.left = bNode.right + GQConstants.EQUATION_TERM_SPACING;
    anotherPlusNode.left = xNode.right + GQConstants.EQUATION_OPERATOR_SPACING;
    cNode.left = anotherPlusNode.right + GQConstants.EQUATION_OPERATOR_SPACING;
    aNode.bottom = equalsNode.bottom;
    bNode.bottom = equalsNode.bottom;
    cNode.bottom = equalsNode.bottom;
    super(options);
    this.aNode = aNode;
    this.bNode = bNode;
    this.cNode = cNode;
  }

  // Gets the global bounds of a, b, c, used for layout
  get aGlobalBounds() {
    return this.aNode.getGlobalBounds();
  }
  get bGlobalBounds() {
    return this.bNode.getGlobalBounds();
  }
  get cGlobalBounds() {
    return this.cNode.getGlobalBounds();
  }
}
graphingQuadratics.register('ExploreInteractiveEquationNode', ExploreInteractiveEquationNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIm9wdGlvbml6ZSIsIlN0cmluZ1V0aWxzIiwiTWF0aFN5bWJvbHMiLCJOdW1iZXJEaXNwbGF5IiwiTm9kZSIsIlJpY2hUZXh0IiwiR1FDb2xvcnMiLCJHUUNvbnN0YW50cyIsIkdRU3ltYm9scyIsIkxpbmVhclNsaWRlciIsIlF1YWRyYXRpY1NsaWRlciIsImdyYXBoaW5nUXVhZHJhdGljcyIsIkV4cGxvcmVJbnRlcmFjdGl2ZUVxdWF0aW9uTm9kZSIsImNvbnN0cnVjdG9yIiwiYVByb3BlcnR5IiwiYlByb3BlcnR5IiwiY1Byb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImVxdWF0aW9uTm9kZSIsIkVxdWF0aW9uTm9kZSIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImFTbGlkZXIiLCJhIiwiaW50ZXJ2YWwiLCJFWFBMT1JFX0lOVEVSVkFMX0EiLCJzbmFwVG9aZXJvRXBzaWxvbiIsIkVYUExPUkVfU05BUF9UT19aRVJPX0VQU0lMT05fQSIsImxhYmVsQ29sb3IiLCJFWFBMT1JFX0EiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiZmlsbEluIiwiU0xJREVSX0RPQyIsInN5bWJvbCIsImJTbGlkZXIiLCJiIiwiRVhQTE9SRV9JTlRFUlZBTF9CIiwiRVhQTE9SRV9CIiwiY1NsaWRlciIsImMiLCJFWFBMT1JFX0lOVEVSVkFMX0MiLCJFWFBMT1JFX0MiLCJjaGlsZHJlbiIsInlTcGFjaW5nIiwieCIsImdsb2JhbFRvTG9jYWxCb3VuZHMiLCJhR2xvYmFsQm91bmRzIiwiY2VudGVyWCIsInRvcCIsImJvdHRvbSIsImJHbG9iYWxCb3VuZHMiLCJjR2xvYmFsQm91bmRzIiwiZXF1YXRpb25PcHRpb25zIiwiZm9udCIsIklOVEVSQUNUSVZFX0VRVUFUSU9OX0ZPTlQiLCJ4eU9wdGlvbnMiLCJtYXhXaWR0aCIsInlOb2RlIiwieSIsImVxdWFsc05vZGUiLCJFUVVBTF9UTyIsImFOb2RlIiwicmFuZ2UiLCJOVU1CRVJfRElTUExBWV9PUFRJT05TIiwidGV4dE9wdGlvbnMiLCJmaWxsIiwiZGVjaW1hbFBsYWNlcyIsIkVYUExPUkVfREVDSU1BTFNfQSIsInhTcXVhcmVkTm9kZSIsInhTcXVhcmVkIiwicGx1c05vZGUiLCJQTFVTIiwiYk5vZGUiLCJFWFBMT1JFX0RFQ0lNQUxTX0IiLCJ4Tm9kZSIsImFub3RoZXJQbHVzTm9kZSIsImNOb2RlIiwiRVhQTE9SRV9ERUNJTUFMU19DIiwibGVmdCIsInJpZ2h0IiwiRVFVQVRJT05fT1BFUkFUT1JfU1BBQ0lORyIsIkVRVUFUSU9OX1RFUk1fU1BBQ0lORyIsImdldEdsb2JhbEJvdW5kcyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRXhwbG9yZUludGVyYWN0aXZlRXF1YXRpb25Ob2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFN0YW5kYXJkIGZvcm0gZXF1YXRpb24sIHkgPSBheF4yICsgYnggKyBjLCB3aXRoIGNvZWZmaWNpZW50cyB0aGF0IGNhbiBiZSBjaGFuZ2VkIHZpYSBzbGlkZXJzLlxyXG4gKiBUaGUgc2xpZGVyIGZvciBjb2VmZmljaWVudCAnYScgaGFzIGEgcXVhZHJhdGljIHRhcGVyIChzaW5jZSBpdCdzIG1vZGlmeWluZyBhIHF1YWRyYXRpYyB0ZXJtKSwgd2hpbGVcclxuICogdGhlIG90aGVyIHNsaWRlcnMgYXJlIGxpbmVhci5cclxuICpcclxuICogQGF1dGhvciBBbmRyZWEgTGluXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBNYXRoU3ltYm9scyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWF0aFN5bWJvbHMuanMnO1xyXG5pbXBvcnQgTnVtYmVyRGlzcGxheSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTnVtYmVyRGlzcGxheS5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIE5vZGVPcHRpb25zLCBSaWNoVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBHUUNvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vR1FDb2xvcnMuanMnO1xyXG5pbXBvcnQgR1FDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0dRQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEdRU3ltYm9scyBmcm9tICcuLi8uLi9jb21tb24vR1FTeW1ib2xzLmpzJztcclxuaW1wb3J0IExpbmVhclNsaWRlciBmcm9tICcuLi8uLi9jb21tb24vdmlldy9MaW5lYXJTbGlkZXIuanMnO1xyXG5pbXBvcnQgUXVhZHJhdGljU2xpZGVyIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1F1YWRyYXRpY1NsaWRlci5qcyc7XHJcbmltcG9ydCBncmFwaGluZ1F1YWRyYXRpY3MgZnJvbSAnLi4vLi4vZ3JhcGhpbmdRdWFkcmF0aWNzLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBFeHBsb3JlSW50ZXJhY3RpdmVFcXVhdGlvbk5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8Tm9kZU9wdGlvbnMsICd0YW5kZW0nIHwgJ3BoZXRpb0RvY3VtZW50YXRpb24nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4cGxvcmVJbnRlcmFjdGl2ZUVxdWF0aW9uTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3RvciBwYXJhbWV0ZXJzIGFyZSBjb2VmZmljaWVudHMgb2YgdGhlIHN0YW5kYXJkIGZvcm06IHkgPSBheF4yICsgYnggKyBjXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBhUHJvcGVydHk6IE51bWJlclByb3BlcnR5LCBiUHJvcGVydHk6IE51bWJlclByb3BlcnR5LCBjUHJvcGVydHk6IE51bWJlclByb3BlcnR5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zOiBFeHBsb3JlSW50ZXJhY3RpdmVFcXVhdGlvbk5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8RXhwbG9yZUludGVyYWN0aXZlRXF1YXRpb25Ob2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7fSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gZXF1YXRpb25cclxuICAgIGNvbnN0IGVxdWF0aW9uTm9kZSA9IG5ldyBFcXVhdGlvbk5vZGUoIGFQcm9wZXJ0eSwgYlByb3BlcnR5LCBjUHJvcGVydHksIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VxdWF0aW9uTm9kZScgKSApO1xyXG5cclxuICAgIC8vIGNvZWZmaWNpZW50IGNvbnRyb2xzIChsYWJlbGVkIHNsaWRlcnMpXHJcbiAgICBjb25zdCBhU2xpZGVyID0gbmV3IFF1YWRyYXRpY1NsaWRlciggR1FTeW1ib2xzLmEsIGFQcm9wZXJ0eSwge1xyXG4gICAgICBpbnRlcnZhbDogR1FDb25zdGFudHMuRVhQTE9SRV9JTlRFUlZBTF9BLFxyXG4gICAgICBzbmFwVG9aZXJvRXBzaWxvbjogR1FDb25zdGFudHMuRVhQTE9SRV9TTkFQX1RPX1pFUk9fRVBTSUxPTl9BLFxyXG4gICAgICBsYWJlbENvbG9yOiBHUUNvbG9ycy5FWFBMT1JFX0EsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYVNsaWRlcicgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogU3RyaW5nVXRpbHMuZmlsbEluKCBHUUNvbnN0YW50cy5TTElERVJfRE9DLCB7IHN5bWJvbDogJ2EnIH0gKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgYlNsaWRlciA9IG5ldyBMaW5lYXJTbGlkZXIoIEdRU3ltYm9scy5iLCBiUHJvcGVydHksIHtcclxuICAgICAgaW50ZXJ2YWw6IEdRQ29uc3RhbnRzLkVYUExPUkVfSU5URVJWQUxfQixcclxuICAgICAgbGFiZWxDb2xvcjogR1FDb2xvcnMuRVhQTE9SRV9CLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2JTbGlkZXInICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246IFN0cmluZ1V0aWxzLmZpbGxJbiggR1FDb25zdGFudHMuU0xJREVSX0RPQywgeyBzeW1ib2w6ICdiJyB9IClcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGNTbGlkZXIgPSBuZXcgTGluZWFyU2xpZGVyKCBHUVN5bWJvbHMuYywgY1Byb3BlcnR5LCB7XHJcbiAgICAgIGludGVydmFsOiBHUUNvbnN0YW50cy5FWFBMT1JFX0lOVEVSVkFMX0MsXHJcbiAgICAgIGxhYmVsQ29sb3I6IEdRQ29sb3JzLkVYUExPUkVfQyxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjU2xpZGVyJyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiBTdHJpbmdVdGlscy5maWxsSW4oIEdRQ29uc3RhbnRzLlNMSURFUl9ET0MsIHsgc3ltYm9sOiAnYycgfSApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgZXF1YXRpb25Ob2RlLCBhU2xpZGVyLCBiU2xpZGVyLCBjU2xpZGVyIF07XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBob3Jpem9udGFsbHkgYWxpZ24gc2xpZGVycyB1bmRlciB0aGVpciBhc3NvY2lhdGVkIHZhbHVlcyBpbiB0aGUgZXF1YXRpb25cclxuICAgIGNvbnN0IHlTcGFjaW5nID0gMztcclxuICAgIGFTbGlkZXIueCA9IHRoaXMuZ2xvYmFsVG9Mb2NhbEJvdW5kcyggZXF1YXRpb25Ob2RlLmFHbG9iYWxCb3VuZHMgKS5jZW50ZXJYO1xyXG4gICAgYVNsaWRlci50b3AgPSBlcXVhdGlvbk5vZGUuYm90dG9tICsgeVNwYWNpbmc7XHJcbiAgICBiU2xpZGVyLnggPSB0aGlzLmdsb2JhbFRvTG9jYWxCb3VuZHMoIGVxdWF0aW9uTm9kZS5iR2xvYmFsQm91bmRzICkuY2VudGVyWDtcclxuICAgIGJTbGlkZXIudG9wID0gZXF1YXRpb25Ob2RlLmJvdHRvbSArIHlTcGFjaW5nO1xyXG4gICAgY1NsaWRlci54ID0gdGhpcy5nbG9iYWxUb0xvY2FsQm91bmRzKCBlcXVhdGlvbk5vZGUuY0dsb2JhbEJvdW5kcyApLmNlbnRlclg7XHJcbiAgICBjU2xpZGVyLnRvcCA9IGVxdWF0aW9uTm9kZS5ib3R0b20gKyB5U3BhY2luZztcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGUgZXF1YXRpb24gdGhhdCBhcHBlYXJzIGFib3ZlIHRoZSBzbGlkZXJzLlxyXG4gKi9cclxuY2xhc3MgRXF1YXRpb25Ob2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgYU5vZGU6IE5vZGU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBiTm9kZTogTm9kZTtcclxuICBwcml2YXRlIHJlYWRvbmx5IGNOb2RlOiBOb2RlO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGFQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHksIGJQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHksIGNQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHksIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnM6IE5vZGVPcHRpb25zID0ge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBlcXVhdGlvbiB0aGF0IGNoYW5nZXMgYXMgdGhlIHNsaWRlcnMgYXJlIGFkanVzdGVkJ1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBvcHRpb25zIGZvciBwYXJ0cyBvZiB0aGUgZXF1YXRpb25cclxuICAgIGNvbnN0IGVxdWF0aW9uT3B0aW9ucyA9IHtcclxuICAgICAgZm9udDogR1FDb25zdGFudHMuSU5URVJBQ1RJVkVfRVFVQVRJT05fRk9OVFxyXG4gICAgfTtcclxuICAgIGNvbnN0IHh5T3B0aW9ucyA9IG1lcmdlKCB7fSwgZXF1YXRpb25PcHRpb25zLCB7XHJcbiAgICAgIG1heFdpZHRoOiAyMCAvLyBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8geVxyXG4gICAgY29uc3QgeU5vZGUgPSBuZXcgUmljaFRleHQoIEdRU3ltYm9scy55LCB4eU9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyA9XHJcbiAgICBjb25zdCBlcXVhbHNOb2RlID0gbmV3IFJpY2hUZXh0KCBNYXRoU3ltYm9scy5FUVVBTF9UTywgZXF1YXRpb25PcHRpb25zICk7XHJcblxyXG4gICAgLy8gYSB2YWx1ZVxyXG4gICAgY29uc3QgYU5vZGUgPSBuZXcgTnVtYmVyRGlzcGxheSggYVByb3BlcnR5LCBhUHJvcGVydHkucmFuZ2UsXHJcbiAgICAgIG1lcmdlKCB7fSwgR1FDb25zdGFudHMuTlVNQkVSX0RJU1BMQVlfT1BUSU9OUywge1xyXG4gICAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgICBmaWxsOiBHUUNvbG9ycy5FWFBMT1JFX0FcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlY2ltYWxQbGFjZXM6IEdRQ29uc3RhbnRzLkVYUExPUkVfREVDSU1BTFNfQVxyXG4gICAgICB9ICkgKTtcclxuXHJcbiAgICAvLyB4XjJcclxuICAgIGNvbnN0IHhTcXVhcmVkTm9kZSA9IG5ldyBSaWNoVGV4dCggR1FTeW1ib2xzLnhTcXVhcmVkLCB4eU9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyArIFxyXG4gICAgY29uc3QgcGx1c05vZGUgPSBuZXcgUmljaFRleHQoIE1hdGhTeW1ib2xzLlBMVVMsIGVxdWF0aW9uT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIGIgdmFsdWVcclxuICAgIGNvbnN0IGJOb2RlID0gbmV3IE51bWJlckRpc3BsYXkoIGJQcm9wZXJ0eSwgYlByb3BlcnR5LnJhbmdlLFxyXG4gICAgICBtZXJnZSgge30sIEdRQ29uc3RhbnRzLk5VTUJFUl9ESVNQTEFZX09QVElPTlMsIHtcclxuICAgICAgICB0ZXh0T3B0aW9uczoge1xyXG4gICAgICAgICAgZmlsbDogR1FDb2xvcnMuRVhQTE9SRV9CXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZWNpbWFsUGxhY2VzOiBHUUNvbnN0YW50cy5FWFBMT1JFX0RFQ0lNQUxTX0JcclxuICAgICAgfSApICk7XHJcblxyXG4gICAgLy8geFxyXG4gICAgY29uc3QgeE5vZGUgPSBuZXcgUmljaFRleHQoIEdRU3ltYm9scy54LCB4eU9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyArXHJcbiAgICBjb25zdCBhbm90aGVyUGx1c05vZGUgPSBuZXcgUmljaFRleHQoIE1hdGhTeW1ib2xzLlBMVVMsIGVxdWF0aW9uT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIGMgdmFsdWVcclxuICAgIGNvbnN0IGNOb2RlID0gbmV3IE51bWJlckRpc3BsYXkoIGNQcm9wZXJ0eSwgYlByb3BlcnR5LnJhbmdlLFxyXG4gICAgICBtZXJnZSgge30sIEdRQ29uc3RhbnRzLk5VTUJFUl9ESVNQTEFZX09QVElPTlMsIHtcclxuICAgICAgICB0ZXh0T3B0aW9uczoge1xyXG4gICAgICAgICAgZmlsbDogR1FDb2xvcnMuRVhQTE9SRV9DXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZWNpbWFsUGxhY2VzOiBHUUNvbnN0YW50cy5FWFBMT1JFX0RFQ0lNQUxTX0NcclxuICAgICAgfSApICk7XHJcblxyXG4gICAgLy8geSA9IGF4XjIgKyBieCArIGNcclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbXHJcbiAgICAgIHlOb2RlLCBlcXVhbHNOb2RlLCBhTm9kZSwgeFNxdWFyZWROb2RlLCBwbHVzTm9kZSxcclxuICAgICAgeE5vZGUsIGJOb2RlLCBhbm90aGVyUGx1c05vZGUsIGNOb2RlXHJcbiAgICBdO1xyXG5cclxuICAgIC8vIGxheW91dFxyXG4gICAgZXF1YWxzTm9kZS5sZWZ0ID0geU5vZGUucmlnaHQgKyBHUUNvbnN0YW50cy5FUVVBVElPTl9PUEVSQVRPUl9TUEFDSU5HO1xyXG4gICAgYU5vZGUubGVmdCA9IGVxdWFsc05vZGUucmlnaHQgKyBHUUNvbnN0YW50cy5FUVVBVElPTl9PUEVSQVRPUl9TUEFDSU5HO1xyXG4gICAgeFNxdWFyZWROb2RlLmxlZnQgPSBhTm9kZS5yaWdodCArIEdRQ29uc3RhbnRzLkVRVUFUSU9OX1RFUk1fU1BBQ0lORztcclxuICAgIHBsdXNOb2RlLmxlZnQgPSB4U3F1YXJlZE5vZGUucmlnaHQgKyBHUUNvbnN0YW50cy5FUVVBVElPTl9PUEVSQVRPUl9TUEFDSU5HO1xyXG4gICAgYk5vZGUubGVmdCA9IHBsdXNOb2RlLnJpZ2h0ICsgR1FDb25zdGFudHMuRVFVQVRJT05fT1BFUkFUT1JfU1BBQ0lORztcclxuICAgIHhOb2RlLmxlZnQgPSBiTm9kZS5yaWdodCArIEdRQ29uc3RhbnRzLkVRVUFUSU9OX1RFUk1fU1BBQ0lORztcclxuICAgIGFub3RoZXJQbHVzTm9kZS5sZWZ0ID0geE5vZGUucmlnaHQgKyBHUUNvbnN0YW50cy5FUVVBVElPTl9PUEVSQVRPUl9TUEFDSU5HO1xyXG4gICAgY05vZGUubGVmdCA9IGFub3RoZXJQbHVzTm9kZS5yaWdodCArIEdRQ29uc3RhbnRzLkVRVUFUSU9OX09QRVJBVE9SX1NQQUNJTkc7XHJcbiAgICBhTm9kZS5ib3R0b20gPSBlcXVhbHNOb2RlLmJvdHRvbTtcclxuICAgIGJOb2RlLmJvdHRvbSA9IGVxdWFsc05vZGUuYm90dG9tO1xyXG4gICAgY05vZGUuYm90dG9tID0gZXF1YWxzTm9kZS5ib3R0b207XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmFOb2RlID0gYU5vZGU7XHJcbiAgICB0aGlzLmJOb2RlID0gYk5vZGU7XHJcbiAgICB0aGlzLmNOb2RlID0gY05vZGU7XHJcbiAgfVxyXG5cclxuICAvLyBHZXRzIHRoZSBnbG9iYWwgYm91bmRzIG9mIGEsIGIsIGMsIHVzZWQgZm9yIGxheW91dFxyXG4gIHB1YmxpYyBnZXQgYUdsb2JhbEJvdW5kcygpOiBCb3VuZHMyIHtcclxuICAgIHJldHVybiB0aGlzLmFOb2RlLmdldEdsb2JhbEJvdW5kcygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBiR2xvYmFsQm91bmRzKCk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIHRoaXMuYk5vZGUuZ2V0R2xvYmFsQm91bmRzKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGNHbG9iYWxCb3VuZHMoKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gdGhpcy5jTm9kZS5nZXRHbG9iYWxCb3VuZHMoKTtcclxuICB9XHJcbn1cclxuXHJcbmdyYXBoaW5nUXVhZHJhdGljcy5yZWdpc3RlciggJ0V4cGxvcmVJbnRlcmFjdGl2ZUVxdWF0aW9uTm9kZScsIEV4cGxvcmVJbnRlcmFjdGl2ZUVx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