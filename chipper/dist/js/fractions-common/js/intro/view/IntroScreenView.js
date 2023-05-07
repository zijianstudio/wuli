// Copyright 2018-2022, University of Colorado Boulder

/**
 * ScreenView for intro screens.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import MixedFractionNode from '../../../../scenery-phet/js/MixedFractionNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PropertyFractionNode from '../../../../scenery-phet/js/PropertyFractionNode.js';
import { AlignBox, HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import FractionsCommonGlobals from '../../common/FractionsCommonGlobals.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../fractionsCommon.js';
import FractionsCommonStrings from '../../FractionsCommonStrings.js';
import Container from '../model/Container.js';
import CakeContainerNode from './cake/CakeContainerNode.js';
import ContainerSetScreenView from './ContainerSetScreenView.js';
import MaxNode from './MaxNode.js';
import NumberLineNode from './numberline/NumberLineNode.js';
const equationString = FractionsCommonStrings.equation;
const mixedNumberString = FractionsCommonStrings.mixedNumber;

// constants
const MARGIN = FractionsCommonConstants.PANEL_MARGIN;
class IntroScreenView extends ContainerSetScreenView {
  /**
   * @param {IntroModel} model
   */
  constructor(model) {
    super(model);

    // "Max" panel
    const maxPanel = new Panel(new AlignBox(new MaxNode(model.containerCountProperty), {
      group: this.topAlignGroup
    }), {
      fill: FractionsCommonColors.introPanelBackgroundProperty,
      xMargin: 16,
      yMargin: 10,
      right: this.layoutBounds.right - MARGIN,
      top: this.layoutBounds.top + MARGIN
    });
    this.insertChild(0, maxPanel);
    if (model.allowMixedNumbers) {
      // Use a "weaker" / grayer color when showing 0/x
      const partialFractionColorProperty = new DerivedProperty([model.numeratorProperty, model.denominatorProperty, FractionsCommonColors.mixedFractionStrongProperty, FractionsCommonColors.mixedFractionWeakProperty], (numerator, denominator, strongColor, weakColor) => {
        return numerator % denominator === 0 ? weakColor : strongColor;
      });

      // Separate options/fraction created since we need to grab the "maximum" bounds to do proper layout. Can't use
      // "starting" bounds, since it's at 0 and would be smaller.
      const fractionNodeOptions = {
        type: PropertyFractionNode.DisplayType.MIXED,
        simplify: true,
        maxWhole: model.containerCountProperty.range.max,
        maxNumerator: model.denominatorProperty.range.max - 1,
        maxDenominator: model.denominatorProperty.range.max,
        wholeFill: FractionsCommonColors.mixedFractionStrongProperty,
        numeratorFill: partialFractionColorProperty,
        denominatorFill: partialFractionColorProperty,
        separatorFill: partialFractionColorProperty,
        // Node options
        scale: 2
      };
      const maxMixedFractionNodeBounds = new MixedFractionNode(merge({}, fractionNodeOptions, {
        whole: 0,
        numerator: 0,
        denominator: 0,
        simplify: false
      })).bounds;

      // @private {Node}
      this.mixedFractionNode = new AlignBox(new PropertyFractionNode(model.numeratorProperty, model.denominatorProperty, fractionNodeOptions), {
        alignBounds: maxMixedFractionNodeBounds,
        xAlign: 'right'
      });
      model.showMixedNumbersProperty.linkAttribute(this.mixedFractionNode, 'visible');
      const label = new Text(mixedNumberString, {
        font: new PhetFont(26),
        maxWidth: 270
      });
      const showMixedCheckbox = new Checkbox(model.showMixedNumbersProperty, label, {
        boxWidth: 30,
        right: this.layoutBounds.right - MARGIN,
        bottom: this.resetAllButton.top - 40
      });
      showMixedCheckbox.touchArea = showMixedCheckbox.localBounds.dilated(18);

      // Options for the "Equation" accordion box (bottom-left)
      const equationScale = 1.5;
      const equationLeftOptions = {
        type: PropertyFractionNode.DisplayType.MIXED,
        simplify: true,
        showZeroImproperFraction: false,
        maxWhole: model.containerCountProperty.range.max,
        maxNumerator: model.denominatorProperty.range.max - 1,
        maxDenominator: model.denominatorProperty.range.max,
        wholeFill: FractionsCommonColors.mixedFractionStrongProperty,
        numeratorFill: FractionsCommonColors.mixedFractionStrongProperty,
        denominatorFill: FractionsCommonColors.mixedFractionStrongProperty,
        separatorFill: FractionsCommonColors.mixedFractionStrongProperty,
        scale: equationScale
      };
      const equationRightOptions = {
        type: PropertyFractionNode.DisplayType.IMPROPER,
        maxNumerator: model.denominatorProperty.range.max * model.containerCountProperty.range.max,
        maxDenominator: model.denominatorProperty.range.max,
        scale: equationScale
      };
      const equationBoxContent = new HBox({
        spacing: 10,
        children: [new AlignBox(new PropertyFractionNode(model.numeratorProperty, model.denominatorProperty, equationLeftOptions), {
          alignBounds: new MixedFractionNode(merge({}, equationLeftOptions, {
            whole: 0,
            numerator: 0,
            denominator: 0,
            simplify: false
          })).bounds,
          xAlign: 'right'
        }), new Text(MathSymbols.EQUAL_TO, {
          font: new PhetFont(30 * equationScale)
        }), new PropertyFractionNode(model.numeratorProperty, model.denominatorProperty, equationRightOptions)]
      });
      const equationBox = new AccordionBox(equationBoxContent, {
        titleNode: new Text(equationString, {
          font: new PhetFont(20),
          maxWidth: 200
        }),
        showTitleWhenExpanded: false,
        bottom: this.layoutBounds.bottom - MARGIN,
        left: this.layoutBounds.left + 50,
        fill: 'white',
        expandedProperty: model.mixedNumbersBoxExpandedProperty,
        expandCollapseButtonOptions: {
          touchAreaXDilation: 15,
          touchAreaYDilation: 15
        }
      });
      model.showMixedNumbersProperty.linkAttribute(equationBox, 'visible');
      this.children = [this.mixedFractionNode, showMixedCheckbox, equationBox, ...this.children];
    }

    // layout
    const centerY = this.layoutBounds.centerY - 30;
    this.adjustableFractionNode.right = this.layoutBounds.right - MARGIN;
    this.adjustableFractionNode.centerY = centerY;
    if (this.mixedFractionNode) {
      this.mixedFractionNode.left = this.layoutBounds.left + MARGIN;
      this.mixedFractionNode.centerY = centerY;
    }
    this.representationPanel.top = this.layoutBounds.top + MARGIN;
    const left = this.model.allowMixedNumbers ? this.mixedFractionNode.right : this.layoutBounds.left;
    const right = this.adjustableFractionNode.left;
    const centerX = (left + right) / 2;
    this.representationPanel.centerX = centerX;
    this.viewContainer.x = centerX;
    this.viewContainer.y = centerY;
    this.bucketContainer.centerX = centerX;
    this.bucketContainer.bottom = this.layoutBounds.bottom - MARGIN;
  }

  /**
   * Returns a number line node with the given (unchanging) attributes.
   * @private
   *
   * @param {number} numerator
   * @param {number} denominator
   * @param {number} wholes
   * @returns {Node}
   */
  static createStaticNumberLine(numerator, denominator, wholes) {
    return new NumberLineNode(new NumberProperty(numerator, {
      range: new Range(0, numerator)
    }), new NumberProperty(denominator, {
      range: new Range(1, denominator)
    }), new NumberProperty(wholes, {
      range: new Range(0, wholes)
    }));
  }

  /**
   * Creates the icon for the unmixed intro screens.
   * @public
   *
   * @returns {Node}
   */
  static createUnmixedScreenIcon() {
    const container = new Container();
    container.addCells(4);
    _.times(3, () => {
      container.getNextEmptyCell().setFilled(true);
    });
    const cakeNode = new CakeContainerNode(container);
    const numberLineNode = IntroScreenView.createStaticNumberLine(3, 4, 1);
    return FractionsCommonGlobals.wrapIcon(new HBox({
      spacing: 30,
      children: [cakeNode, numberLineNode],
      scale: 1.3
    }), FractionsCommonColors.introScreenBackgroundProperty);
  }

  /**
   * Creates the thumbnail for the unmixed intro screens.
   * @public
   *
   * @returns {Node}
   */
  static createUnmixedScreenThumbnail() {
    const container = new Container();
    container.addCells(4);
    _.times(3, () => {
      container.getNextEmptyCell().setFilled(true);
    });
    const cakeNode = new CakeContainerNode(container, {
      scale: 2.5
    });
    return FractionsCommonGlobals.wrapIcon(cakeNode, FractionsCommonColors.introScreenBackgroundProperty);
  }

  /**
   * Creates the icon for the mixed intro screens.
   * @public
   *
   * @returns {Node}
   */
  static createMixedScreenIcon() {
    const fractionNode = new MixedFractionNode({
      whole: 2,
      numerator: 1,
      denominator: 2,
      scale: 2.4
    });
    const numberLineNode = IntroScreenView.createStaticNumberLine(5, 2, 3);
    return FractionsCommonGlobals.wrapIcon(new VBox({
      spacing: 15,
      children: [fractionNode, numberLineNode],
      scale: 1
    }), FractionsCommonColors.introScreenBackgroundProperty);
  }

  /**
   * Creates the thumbnail for the mixed intro screens.
   * @public
   *
   * @returns {Node}
   */
  static createMixedScreenThumbnail() {
    const numberLineNode = IntroScreenView.createStaticNumberLine(3, 2, 2);
    numberLineNode.scale(1.5);
    return FractionsCommonGlobals.wrapIcon(numberLineNode, FractionsCommonColors.introScreenBackgroundProperty);
  }
}
fractionsCommon.register('IntroScreenView', IntroScreenView);
export default IntroScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwibWVyZ2UiLCJNYXRoU3ltYm9scyIsIk1peGVkRnJhY3Rpb25Ob2RlIiwiUGhldEZvbnQiLCJQcm9wZXJ0eUZyYWN0aW9uTm9kZSIsIkFsaWduQm94IiwiSEJveCIsIlRleHQiLCJWQm94IiwiQWNjb3JkaW9uQm94IiwiQ2hlY2tib3giLCJQYW5lbCIsIkZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cyIsIkZyYWN0aW9uc0NvbW1vbkdsb2JhbHMiLCJGcmFjdGlvbnNDb21tb25Db2xvcnMiLCJmcmFjdGlvbnNDb21tb24iLCJGcmFjdGlvbnNDb21tb25TdHJpbmdzIiwiQ29udGFpbmVyIiwiQ2FrZUNvbnRhaW5lck5vZGUiLCJDb250YWluZXJTZXRTY3JlZW5WaWV3IiwiTWF4Tm9kZSIsIk51bWJlckxpbmVOb2RlIiwiZXF1YXRpb25TdHJpbmciLCJlcXVhdGlvbiIsIm1peGVkTnVtYmVyU3RyaW5nIiwibWl4ZWROdW1iZXIiLCJNQVJHSU4iLCJQQU5FTF9NQVJHSU4iLCJJbnRyb1NjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwibWF4UGFuZWwiLCJjb250YWluZXJDb3VudFByb3BlcnR5IiwiZ3JvdXAiLCJ0b3BBbGlnbkdyb3VwIiwiZmlsbCIsImludHJvUGFuZWxCYWNrZ3JvdW5kUHJvcGVydHkiLCJ4TWFyZ2luIiwieU1hcmdpbiIsInJpZ2h0IiwibGF5b3V0Qm91bmRzIiwidG9wIiwiaW5zZXJ0Q2hpbGQiLCJhbGxvd01peGVkTnVtYmVycyIsInBhcnRpYWxGcmFjdGlvbkNvbG9yUHJvcGVydHkiLCJudW1lcmF0b3JQcm9wZXJ0eSIsImRlbm9taW5hdG9yUHJvcGVydHkiLCJtaXhlZEZyYWN0aW9uU3Ryb25nUHJvcGVydHkiLCJtaXhlZEZyYWN0aW9uV2Vha1Byb3BlcnR5IiwibnVtZXJhdG9yIiwiZGVub21pbmF0b3IiLCJzdHJvbmdDb2xvciIsIndlYWtDb2xvciIsImZyYWN0aW9uTm9kZU9wdGlvbnMiLCJ0eXBlIiwiRGlzcGxheVR5cGUiLCJNSVhFRCIsInNpbXBsaWZ5IiwibWF4V2hvbGUiLCJyYW5nZSIsIm1heCIsIm1heE51bWVyYXRvciIsIm1heERlbm9taW5hdG9yIiwid2hvbGVGaWxsIiwibnVtZXJhdG9yRmlsbCIsImRlbm9taW5hdG9yRmlsbCIsInNlcGFyYXRvckZpbGwiLCJzY2FsZSIsIm1heE1peGVkRnJhY3Rpb25Ob2RlQm91bmRzIiwid2hvbGUiLCJib3VuZHMiLCJtaXhlZEZyYWN0aW9uTm9kZSIsImFsaWduQm91bmRzIiwieEFsaWduIiwic2hvd01peGVkTnVtYmVyc1Byb3BlcnR5IiwibGlua0F0dHJpYnV0ZSIsImxhYmVsIiwiZm9udCIsIm1heFdpZHRoIiwic2hvd01peGVkQ2hlY2tib3giLCJib3hXaWR0aCIsImJvdHRvbSIsInJlc2V0QWxsQnV0dG9uIiwidG91Y2hBcmVhIiwibG9jYWxCb3VuZHMiLCJkaWxhdGVkIiwiZXF1YXRpb25TY2FsZSIsImVxdWF0aW9uTGVmdE9wdGlvbnMiLCJzaG93WmVyb0ltcHJvcGVyRnJhY3Rpb24iLCJlcXVhdGlvblJpZ2h0T3B0aW9ucyIsIklNUFJPUEVSIiwiZXF1YXRpb25Cb3hDb250ZW50Iiwic3BhY2luZyIsImNoaWxkcmVuIiwiRVFVQUxfVE8iLCJlcXVhdGlvbkJveCIsInRpdGxlTm9kZSIsInNob3dUaXRsZVdoZW5FeHBhbmRlZCIsImxlZnQiLCJleHBhbmRlZFByb3BlcnR5IiwibWl4ZWROdW1iZXJzQm94RXhwYW5kZWRQcm9wZXJ0eSIsImV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9ucyIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsImNlbnRlclkiLCJhZGp1c3RhYmxlRnJhY3Rpb25Ob2RlIiwicmVwcmVzZW50YXRpb25QYW5lbCIsImNlbnRlclgiLCJ2aWV3Q29udGFpbmVyIiwieCIsInkiLCJidWNrZXRDb250YWluZXIiLCJjcmVhdGVTdGF0aWNOdW1iZXJMaW5lIiwid2hvbGVzIiwiY3JlYXRlVW5taXhlZFNjcmVlbkljb24iLCJjb250YWluZXIiLCJhZGRDZWxscyIsIl8iLCJ0aW1lcyIsImdldE5leHRFbXB0eUNlbGwiLCJzZXRGaWxsZWQiLCJjYWtlTm9kZSIsIm51bWJlckxpbmVOb2RlIiwid3JhcEljb24iLCJpbnRyb1NjcmVlbkJhY2tncm91bmRQcm9wZXJ0eSIsImNyZWF0ZVVubWl4ZWRTY3JlZW5UaHVtYm5haWwiLCJjcmVhdGVNaXhlZFNjcmVlbkljb24iLCJmcmFjdGlvbk5vZGUiLCJjcmVhdGVNaXhlZFNjcmVlblRodW1ibmFpbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSW50cm9TY3JlZW5WaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNjcmVlblZpZXcgZm9yIGludHJvIHNjcmVlbnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBNYXRoU3ltYm9scyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWF0aFN5bWJvbHMuanMnO1xyXG5pbXBvcnQgTWl4ZWRGcmFjdGlvbk5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01peGVkRnJhY3Rpb25Ob2RlLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eUZyYWN0aW9uTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUHJvcGVydHlGcmFjdGlvbk5vZGUuanMnO1xyXG5pbXBvcnQgeyBBbGlnbkJveCwgSEJveCwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBY2NvcmRpb25Cb3ggZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0FjY29yZGlvbkJveC5qcyc7XHJcbmltcG9ydCBDaGVja2JveCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ2hlY2tib3guanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uc0NvbW1vbkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uc0NvbW1vbkdsb2JhbHMgZnJvbSAnLi4vLi4vY29tbW9uL0ZyYWN0aW9uc0NvbW1vbkdsb2JhbHMuanMnO1xyXG5pbXBvcnQgRnJhY3Rpb25zQ29tbW9uQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0ZyYWN0aW9uc0NvbW1vbkNvbG9ycy5qcyc7XHJcbmltcG9ydCBmcmFjdGlvbnNDb21tb24gZnJvbSAnLi4vLi4vZnJhY3Rpb25zQ29tbW9uLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uc0NvbW1vblN0cmluZ3MgZnJvbSAnLi4vLi4vRnJhY3Rpb25zQ29tbW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBDb250YWluZXIgZnJvbSAnLi4vbW9kZWwvQ29udGFpbmVyLmpzJztcclxuaW1wb3J0IENha2VDb250YWluZXJOb2RlIGZyb20gJy4vY2FrZS9DYWtlQ29udGFpbmVyTm9kZS5qcyc7XHJcbmltcG9ydCBDb250YWluZXJTZXRTY3JlZW5WaWV3IGZyb20gJy4vQ29udGFpbmVyU2V0U2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBNYXhOb2RlIGZyb20gJy4vTWF4Tm9kZS5qcyc7XHJcbmltcG9ydCBOdW1iZXJMaW5lTm9kZSBmcm9tICcuL251bWJlcmxpbmUvTnVtYmVyTGluZU5vZGUuanMnO1xyXG5cclxuY29uc3QgZXF1YXRpb25TdHJpbmcgPSBGcmFjdGlvbnNDb21tb25TdHJpbmdzLmVxdWF0aW9uO1xyXG5jb25zdCBtaXhlZE51bWJlclN0cmluZyA9IEZyYWN0aW9uc0NvbW1vblN0cmluZ3MubWl4ZWROdW1iZXI7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTUFSR0lOID0gRnJhY3Rpb25zQ29tbW9uQ29uc3RhbnRzLlBBTkVMX01BUkdJTjtcclxuXHJcbmNsYXNzIEludHJvU2NyZWVuVmlldyBleHRlbmRzIENvbnRhaW5lclNldFNjcmVlblZpZXcge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7SW50cm9Nb2RlbH0gbW9kZWxcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwgKSB7XHJcbiAgICBzdXBlciggbW9kZWwgKTtcclxuXHJcbiAgICAvLyBcIk1heFwiIHBhbmVsXHJcbiAgICBjb25zdCBtYXhQYW5lbCA9IG5ldyBQYW5lbCggbmV3IEFsaWduQm94KCBuZXcgTWF4Tm9kZSggbW9kZWwuY29udGFpbmVyQ291bnRQcm9wZXJ0eSApLCB7XHJcbiAgICAgIGdyb3VwOiB0aGlzLnRvcEFsaWduR3JvdXBcclxuICAgIH0gKSwge1xyXG4gICAgICBmaWxsOiBGcmFjdGlvbnNDb21tb25Db2xvcnMuaW50cm9QYW5lbEJhY2tncm91bmRQcm9wZXJ0eSxcclxuICAgICAgeE1hcmdpbjogMTYsXHJcbiAgICAgIHlNYXJnaW46IDEwLFxyXG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMucmlnaHQgLSBNQVJHSU4sXHJcbiAgICAgIHRvcDogdGhpcy5sYXlvdXRCb3VuZHMudG9wICsgTUFSR0lOXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmluc2VydENoaWxkKCAwLCBtYXhQYW5lbCApO1xyXG5cclxuICAgIGlmICggbW9kZWwuYWxsb3dNaXhlZE51bWJlcnMgKSB7XHJcblxyXG4gICAgICAvLyBVc2UgYSBcIndlYWtlclwiIC8gZ3JheWVyIGNvbG9yIHdoZW4gc2hvd2luZyAwL3hcclxuICAgICAgY29uc3QgcGFydGlhbEZyYWN0aW9uQ29sb3JQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFtcclxuICAgICAgICBtb2RlbC5udW1lcmF0b3JQcm9wZXJ0eSxcclxuICAgICAgICBtb2RlbC5kZW5vbWluYXRvclByb3BlcnR5LFxyXG4gICAgICAgIEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5taXhlZEZyYWN0aW9uU3Ryb25nUHJvcGVydHksXHJcbiAgICAgICAgRnJhY3Rpb25zQ29tbW9uQ29sb3JzLm1peGVkRnJhY3Rpb25XZWFrUHJvcGVydHlcclxuICAgICAgXSwgKCBudW1lcmF0b3IsIGRlbm9taW5hdG9yLCBzdHJvbmdDb2xvciwgd2Vha0NvbG9yICkgPT4ge1xyXG4gICAgICAgIHJldHVybiBudW1lcmF0b3IgJSBkZW5vbWluYXRvciA9PT0gMCA/IHdlYWtDb2xvciA6IHN0cm9uZ0NvbG9yO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBTZXBhcmF0ZSBvcHRpb25zL2ZyYWN0aW9uIGNyZWF0ZWQgc2luY2Ugd2UgbmVlZCB0byBncmFiIHRoZSBcIm1heGltdW1cIiBib3VuZHMgdG8gZG8gcHJvcGVyIGxheW91dC4gQ2FuJ3QgdXNlXHJcbiAgICAgIC8vIFwic3RhcnRpbmdcIiBib3VuZHMsIHNpbmNlIGl0J3MgYXQgMCBhbmQgd291bGQgYmUgc21hbGxlci5cclxuICAgICAgY29uc3QgZnJhY3Rpb25Ob2RlT3B0aW9ucyA9IHtcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eUZyYWN0aW9uTm9kZS5EaXNwbGF5VHlwZS5NSVhFRCxcclxuICAgICAgICBzaW1wbGlmeTogdHJ1ZSxcclxuXHJcbiAgICAgICAgbWF4V2hvbGU6IG1vZGVsLmNvbnRhaW5lckNvdW50UHJvcGVydHkucmFuZ2UubWF4LFxyXG4gICAgICAgIG1heE51bWVyYXRvcjogbW9kZWwuZGVub21pbmF0b3JQcm9wZXJ0eS5yYW5nZS5tYXggLSAxLFxyXG4gICAgICAgIG1heERlbm9taW5hdG9yOiBtb2RlbC5kZW5vbWluYXRvclByb3BlcnR5LnJhbmdlLm1heCxcclxuXHJcbiAgICAgICAgd2hvbGVGaWxsOiBGcmFjdGlvbnNDb21tb25Db2xvcnMubWl4ZWRGcmFjdGlvblN0cm9uZ1Byb3BlcnR5LFxyXG4gICAgICAgIG51bWVyYXRvckZpbGw6IHBhcnRpYWxGcmFjdGlvbkNvbG9yUHJvcGVydHksXHJcbiAgICAgICAgZGVub21pbmF0b3JGaWxsOiBwYXJ0aWFsRnJhY3Rpb25Db2xvclByb3BlcnR5LFxyXG4gICAgICAgIHNlcGFyYXRvckZpbGw6IHBhcnRpYWxGcmFjdGlvbkNvbG9yUHJvcGVydHksXHJcblxyXG4gICAgICAgIC8vIE5vZGUgb3B0aW9uc1xyXG4gICAgICAgIHNjYWxlOiAyXHJcbiAgICAgIH07XHJcbiAgICAgIGNvbnN0IG1heE1peGVkRnJhY3Rpb25Ob2RlQm91bmRzID0gbmV3IE1peGVkRnJhY3Rpb25Ob2RlKCBtZXJnZSgge30sIGZyYWN0aW9uTm9kZU9wdGlvbnMsIHtcclxuICAgICAgICB3aG9sZTogMCxcclxuICAgICAgICBudW1lcmF0b3I6IDAsXHJcbiAgICAgICAgZGVub21pbmF0b3I6IDAsXHJcbiAgICAgICAgc2ltcGxpZnk6IGZhbHNlXHJcbiAgICAgIH0gKSApLmJvdW5kcztcclxuXHJcbiAgICAgIC8vIEBwcml2YXRlIHtOb2RlfVxyXG4gICAgICB0aGlzLm1peGVkRnJhY3Rpb25Ob2RlID0gbmV3IEFsaWduQm94KCBuZXcgUHJvcGVydHlGcmFjdGlvbk5vZGUoIG1vZGVsLm51bWVyYXRvclByb3BlcnR5LCBtb2RlbC5kZW5vbWluYXRvclByb3BlcnR5LCBmcmFjdGlvbk5vZGVPcHRpb25zICksIHtcclxuICAgICAgICBhbGlnbkJvdW5kczogbWF4TWl4ZWRGcmFjdGlvbk5vZGVCb3VuZHMsXHJcbiAgICAgICAgeEFsaWduOiAncmlnaHQnXHJcbiAgICAgIH0gKTtcclxuICAgICAgbW9kZWwuc2hvd01peGVkTnVtYmVyc1Byb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIHRoaXMubWl4ZWRGcmFjdGlvbk5vZGUsICd2aXNpYmxlJyApO1xyXG5cclxuICAgICAgY29uc3QgbGFiZWwgPSBuZXcgVGV4dCggbWl4ZWROdW1iZXJTdHJpbmcsIHtcclxuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDI2ICksXHJcbiAgICAgICAgbWF4V2lkdGg6IDI3MFxyXG4gICAgICB9ICk7XHJcbiAgICAgIGNvbnN0IHNob3dNaXhlZENoZWNrYm94ID0gbmV3IENoZWNrYm94KCBtb2RlbC5zaG93TWl4ZWROdW1iZXJzUHJvcGVydHksIGxhYmVsLCB7XHJcbiAgICAgICAgYm94V2lkdGg6IDMwLFxyXG4gICAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5yaWdodCAtIE1BUkdJTixcclxuICAgICAgICBib3R0b206IHRoaXMucmVzZXRBbGxCdXR0b24udG9wIC0gNDBcclxuICAgICAgfSApO1xyXG4gICAgICBzaG93TWl4ZWRDaGVja2JveC50b3VjaEFyZWEgPSBzaG93TWl4ZWRDaGVja2JveC5sb2NhbEJvdW5kcy5kaWxhdGVkKCAxOCApO1xyXG5cclxuICAgICAgLy8gT3B0aW9ucyBmb3IgdGhlIFwiRXF1YXRpb25cIiBhY2NvcmRpb24gYm94IChib3R0b20tbGVmdClcclxuICAgICAgY29uc3QgZXF1YXRpb25TY2FsZSA9IDEuNTtcclxuICAgICAgY29uc3QgZXF1YXRpb25MZWZ0T3B0aW9ucyA9IHtcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eUZyYWN0aW9uTm9kZS5EaXNwbGF5VHlwZS5NSVhFRCxcclxuICAgICAgICBzaW1wbGlmeTogdHJ1ZSxcclxuICAgICAgICBzaG93WmVyb0ltcHJvcGVyRnJhY3Rpb246IGZhbHNlLFxyXG5cclxuICAgICAgICBtYXhXaG9sZTogbW9kZWwuY29udGFpbmVyQ291bnRQcm9wZXJ0eS5yYW5nZS5tYXgsXHJcbiAgICAgICAgbWF4TnVtZXJhdG9yOiBtb2RlbC5kZW5vbWluYXRvclByb3BlcnR5LnJhbmdlLm1heCAtIDEsXHJcbiAgICAgICAgbWF4RGVub21pbmF0b3I6IG1vZGVsLmRlbm9taW5hdG9yUHJvcGVydHkucmFuZ2UubWF4LFxyXG5cclxuICAgICAgICB3aG9sZUZpbGw6IEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5taXhlZEZyYWN0aW9uU3Ryb25nUHJvcGVydHksXHJcbiAgICAgICAgbnVtZXJhdG9yRmlsbDogRnJhY3Rpb25zQ29tbW9uQ29sb3JzLm1peGVkRnJhY3Rpb25TdHJvbmdQcm9wZXJ0eSxcclxuICAgICAgICBkZW5vbWluYXRvckZpbGw6IEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5taXhlZEZyYWN0aW9uU3Ryb25nUHJvcGVydHksXHJcbiAgICAgICAgc2VwYXJhdG9yRmlsbDogRnJhY3Rpb25zQ29tbW9uQ29sb3JzLm1peGVkRnJhY3Rpb25TdHJvbmdQcm9wZXJ0eSxcclxuXHJcbiAgICAgICAgc2NhbGU6IGVxdWF0aW9uU2NhbGVcclxuICAgICAgfTtcclxuICAgICAgY29uc3QgZXF1YXRpb25SaWdodE9wdGlvbnMgPSB7XHJcbiAgICAgICAgdHlwZTogUHJvcGVydHlGcmFjdGlvbk5vZGUuRGlzcGxheVR5cGUuSU1QUk9QRVIsXHJcblxyXG4gICAgICAgIG1heE51bWVyYXRvcjogbW9kZWwuZGVub21pbmF0b3JQcm9wZXJ0eS5yYW5nZS5tYXggKiBtb2RlbC5jb250YWluZXJDb3VudFByb3BlcnR5LnJhbmdlLm1heCxcclxuICAgICAgICBtYXhEZW5vbWluYXRvcjogbW9kZWwuZGVub21pbmF0b3JQcm9wZXJ0eS5yYW5nZS5tYXgsXHJcblxyXG4gICAgICAgIHNjYWxlOiBlcXVhdGlvblNjYWxlXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBjb25zdCBlcXVhdGlvbkJveENvbnRlbnQgPSBuZXcgSEJveCgge1xyXG4gICAgICAgIHNwYWNpbmc6IDEwLFxyXG4gICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICBuZXcgQWxpZ25Cb3goIG5ldyBQcm9wZXJ0eUZyYWN0aW9uTm9kZSggbW9kZWwubnVtZXJhdG9yUHJvcGVydHksIG1vZGVsLmRlbm9taW5hdG9yUHJvcGVydHksIGVxdWF0aW9uTGVmdE9wdGlvbnMgKSwge1xyXG4gICAgICAgICAgICBhbGlnbkJvdW5kczogbmV3IE1peGVkRnJhY3Rpb25Ob2RlKCBtZXJnZSgge30sIGVxdWF0aW9uTGVmdE9wdGlvbnMsIHtcclxuICAgICAgICAgICAgICB3aG9sZTogMCxcclxuICAgICAgICAgICAgICBudW1lcmF0b3I6IDAsXHJcbiAgICAgICAgICAgICAgZGVub21pbmF0b3I6IDAsXHJcbiAgICAgICAgICAgICAgc2ltcGxpZnk6IGZhbHNlXHJcbiAgICAgICAgICAgIH0gKSApLmJvdW5kcyxcclxuICAgICAgICAgICAgeEFsaWduOiAncmlnaHQnXHJcbiAgICAgICAgICB9ICksXHJcbiAgICAgICAgICBuZXcgVGV4dCggTWF0aFN5bWJvbHMuRVFVQUxfVE8sIHsgZm9udDogbmV3IFBoZXRGb250KCAzMCAqIGVxdWF0aW9uU2NhbGUgKSB9ICksXHJcbiAgICAgICAgICBuZXcgUHJvcGVydHlGcmFjdGlvbk5vZGUoIG1vZGVsLm51bWVyYXRvclByb3BlcnR5LCBtb2RlbC5kZW5vbWluYXRvclByb3BlcnR5LCBlcXVhdGlvblJpZ2h0T3B0aW9ucyApXHJcbiAgICAgICAgXVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBjb25zdCBlcXVhdGlvbkJveCA9IG5ldyBBY2NvcmRpb25Cb3goIGVxdWF0aW9uQm94Q29udGVudCwge1xyXG4gICAgICAgIHRpdGxlTm9kZTogbmV3IFRleHQoIGVxdWF0aW9uU3RyaW5nLCB7XHJcbiAgICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDIwICksXHJcbiAgICAgICAgICBtYXhXaWR0aDogMjAwXHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIHNob3dUaXRsZVdoZW5FeHBhbmRlZDogZmFsc2UsXHJcbiAgICAgICAgYm90dG9tOiB0aGlzLmxheW91dEJvdW5kcy5ib3R0b20gLSBNQVJHSU4sXHJcbiAgICAgICAgbGVmdDogdGhpcy5sYXlvdXRCb3VuZHMubGVmdCArIDUwLFxyXG4gICAgICAgIGZpbGw6ICd3aGl0ZScsXHJcbiAgICAgICAgZXhwYW5kZWRQcm9wZXJ0eTogbW9kZWwubWl4ZWROdW1iZXJzQm94RXhwYW5kZWRQcm9wZXJ0eSxcclxuICAgICAgICBleHBhbmRDb2xsYXBzZUJ1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogMTUsXHJcbiAgICAgICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDE1XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICAgIG1vZGVsLnNob3dNaXhlZE51bWJlcnNQcm9wZXJ0eS5saW5rQXR0cmlidXRlKCBlcXVhdGlvbkJveCwgJ3Zpc2libGUnICk7XHJcblxyXG4gICAgICB0aGlzLmNoaWxkcmVuID0gW1xyXG4gICAgICAgIHRoaXMubWl4ZWRGcmFjdGlvbk5vZGUsXHJcbiAgICAgICAgc2hvd01peGVkQ2hlY2tib3gsXHJcbiAgICAgICAgZXF1YXRpb25Cb3gsXHJcbiAgICAgICAgLi4udGhpcy5jaGlsZHJlblxyXG4gICAgICBdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGxheW91dFxyXG4gICAgY29uc3QgY2VudGVyWSA9IHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlclkgLSAzMDtcclxuICAgIHRoaXMuYWRqdXN0YWJsZUZyYWN0aW9uTm9kZS5yaWdodCA9IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gTUFSR0lOO1xyXG4gICAgdGhpcy5hZGp1c3RhYmxlRnJhY3Rpb25Ob2RlLmNlbnRlclkgPSBjZW50ZXJZO1xyXG4gICAgaWYgKCB0aGlzLm1peGVkRnJhY3Rpb25Ob2RlICkge1xyXG4gICAgICB0aGlzLm1peGVkRnJhY3Rpb25Ob2RlLmxlZnQgPSB0aGlzLmxheW91dEJvdW5kcy5sZWZ0ICsgTUFSR0lOO1xyXG4gICAgICB0aGlzLm1peGVkRnJhY3Rpb25Ob2RlLmNlbnRlclkgPSBjZW50ZXJZO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmVwcmVzZW50YXRpb25QYW5lbC50b3AgPSB0aGlzLmxheW91dEJvdW5kcy50b3AgKyBNQVJHSU47XHJcbiAgICBjb25zdCBsZWZ0ID0gdGhpcy5tb2RlbC5hbGxvd01peGVkTnVtYmVycyA/IHRoaXMubWl4ZWRGcmFjdGlvbk5vZGUucmlnaHQgOiB0aGlzLmxheW91dEJvdW5kcy5sZWZ0O1xyXG4gICAgY29uc3QgcmlnaHQgPSB0aGlzLmFkanVzdGFibGVGcmFjdGlvbk5vZGUubGVmdDtcclxuICAgIGNvbnN0IGNlbnRlclggPSAoIGxlZnQgKyByaWdodCApIC8gMjtcclxuICAgIHRoaXMucmVwcmVzZW50YXRpb25QYW5lbC5jZW50ZXJYID0gY2VudGVyWDtcclxuICAgIHRoaXMudmlld0NvbnRhaW5lci54ID0gY2VudGVyWDtcclxuICAgIHRoaXMudmlld0NvbnRhaW5lci55ID0gY2VudGVyWTtcclxuICAgIHRoaXMuYnVja2V0Q29udGFpbmVyLmNlbnRlclggPSBjZW50ZXJYO1xyXG4gICAgdGhpcy5idWNrZXRDb250YWluZXIuYm90dG9tID0gdGhpcy5sYXlvdXRCb3VuZHMuYm90dG9tIC0gTUFSR0lOO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG51bWJlciBsaW5lIG5vZGUgd2l0aCB0aGUgZ2l2ZW4gKHVuY2hhbmdpbmcpIGF0dHJpYnV0ZXMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1lcmF0b3JcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGVub21pbmF0b3JcclxuICAgKiBAcGFyYW0ge251bWJlcn0gd2hvbGVzXHJcbiAgICogQHJldHVybnMge05vZGV9XHJcbiAgICovXHJcbiAgc3RhdGljIGNyZWF0ZVN0YXRpY051bWJlckxpbmUoIG51bWVyYXRvciwgZGVub21pbmF0b3IsIHdob2xlcyApIHtcclxuICAgIHJldHVybiBuZXcgTnVtYmVyTGluZU5vZGUoXHJcbiAgICAgIG5ldyBOdW1iZXJQcm9wZXJ0eSggbnVtZXJhdG9yLCB7IHJhbmdlOiBuZXcgUmFuZ2UoIDAsIG51bWVyYXRvciApIH0gKSxcclxuICAgICAgbmV3IE51bWJlclByb3BlcnR5KCBkZW5vbWluYXRvciwgeyByYW5nZTogbmV3IFJhbmdlKCAxLCBkZW5vbWluYXRvciApIH0gKSxcclxuICAgICAgbmV3IE51bWJlclByb3BlcnR5KCB3aG9sZXMsIHsgcmFuZ2U6IG5ldyBSYW5nZSggMCwgd2hvbGVzICkgfSApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgaWNvbiBmb3IgdGhlIHVubWl4ZWQgaW50cm8gc2NyZWVucy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Tm9kZX1cclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlVW5taXhlZFNjcmVlbkljb24oKSB7XHJcbiAgICBjb25zdCBjb250YWluZXIgPSBuZXcgQ29udGFpbmVyKCk7XHJcblxyXG4gICAgY29udGFpbmVyLmFkZENlbGxzKCA0ICk7XHJcbiAgICBfLnRpbWVzKCAzLCAoKSA9PiB7XHJcbiAgICAgIGNvbnRhaW5lci5nZXROZXh0RW1wdHlDZWxsKCkuc2V0RmlsbGVkKCB0cnVlICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY2FrZU5vZGUgPSBuZXcgQ2FrZUNvbnRhaW5lck5vZGUoIGNvbnRhaW5lciApO1xyXG5cclxuICAgIGNvbnN0IG51bWJlckxpbmVOb2RlID0gSW50cm9TY3JlZW5WaWV3LmNyZWF0ZVN0YXRpY051bWJlckxpbmUoIDMsIDQsIDEgKTtcclxuXHJcbiAgICByZXR1cm4gRnJhY3Rpb25zQ29tbW9uR2xvYmFscy53cmFwSWNvbiggbmV3IEhCb3goIHtcclxuICAgICAgc3BhY2luZzogMzAsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgY2FrZU5vZGUsXHJcbiAgICAgICAgbnVtYmVyTGluZU5vZGVcclxuICAgICAgXSxcclxuICAgICAgc2NhbGU6IDEuM1xyXG4gICAgfSApLCBGcmFjdGlvbnNDb21tb25Db2xvcnMuaW50cm9TY3JlZW5CYWNrZ3JvdW5kUHJvcGVydHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIHRodW1ibmFpbCBmb3IgdGhlIHVubWl4ZWQgaW50cm8gc2NyZWVucy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Tm9kZX1cclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlVW5taXhlZFNjcmVlblRodW1ibmFpbCgpIHtcclxuICAgIGNvbnN0IGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcclxuXHJcbiAgICBjb250YWluZXIuYWRkQ2VsbHMoIDQgKTtcclxuICAgIF8udGltZXMoIDMsICgpID0+IHtcclxuICAgICAgY29udGFpbmVyLmdldE5leHRFbXB0eUNlbGwoKS5zZXRGaWxsZWQoIHRydWUgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjYWtlTm9kZSA9IG5ldyBDYWtlQ29udGFpbmVyTm9kZSggY29udGFpbmVyLCB7XHJcbiAgICAgIHNjYWxlOiAyLjVcclxuICAgIH0gKTtcclxuXHJcbiAgICByZXR1cm4gRnJhY3Rpb25zQ29tbW9uR2xvYmFscy53cmFwSWNvbiggY2FrZU5vZGUsIEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5pbnRyb1NjcmVlbkJhY2tncm91bmRQcm9wZXJ0eSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgaWNvbiBmb3IgdGhlIG1peGVkIGludHJvIHNjcmVlbnMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge05vZGV9XHJcbiAgICovXHJcbiAgc3RhdGljIGNyZWF0ZU1peGVkU2NyZWVuSWNvbigpIHtcclxuICAgIGNvbnN0IGZyYWN0aW9uTm9kZSA9IG5ldyBNaXhlZEZyYWN0aW9uTm9kZSgge1xyXG4gICAgICB3aG9sZTogMixcclxuICAgICAgbnVtZXJhdG9yOiAxLFxyXG4gICAgICBkZW5vbWluYXRvcjogMixcclxuICAgICAgc2NhbGU6IDIuNFxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IG51bWJlckxpbmVOb2RlID0gSW50cm9TY3JlZW5WaWV3LmNyZWF0ZVN0YXRpY051bWJlckxpbmUoIDUsIDIsIDMgKTtcclxuXHJcbiAgICByZXR1cm4gRnJhY3Rpb25zQ29tbW9uR2xvYmFscy53cmFwSWNvbiggbmV3IFZCb3goIHtcclxuICAgICAgc3BhY2luZzogMTUsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgZnJhY3Rpb25Ob2RlLFxyXG4gICAgICAgIG51bWJlckxpbmVOb2RlXHJcbiAgICAgIF0sXHJcbiAgICAgIHNjYWxlOiAxXHJcbiAgICB9ICksIEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5pbnRyb1NjcmVlbkJhY2tncm91bmRQcm9wZXJ0eSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgdGh1bWJuYWlsIGZvciB0aGUgbWl4ZWQgaW50cm8gc2NyZWVucy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Tm9kZX1cclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlTWl4ZWRTY3JlZW5UaHVtYm5haWwoKSB7XHJcbiAgICBjb25zdCBudW1iZXJMaW5lTm9kZSA9IEludHJvU2NyZWVuVmlldy5jcmVhdGVTdGF0aWNOdW1iZXJMaW5lKCAzLCAyLCAyICk7XHJcbiAgICBudW1iZXJMaW5lTm9kZS5zY2FsZSggMS41ICk7XHJcblxyXG4gICAgcmV0dXJuIEZyYWN0aW9uc0NvbW1vbkdsb2JhbHMud3JhcEljb24oIG51bWJlckxpbmVOb2RlLCBGcmFjdGlvbnNDb21tb25Db2xvcnMuaW50cm9TY3JlZW5CYWNrZ3JvdW5kUHJvcGVydHkgKTtcclxuICB9XHJcblxyXG59XHJcblxyXG5mcmFjdGlvbnNDb21tb24ucmVnaXN0ZXIoICdJbnRyb1NjcmVlblZpZXcnLCBJbnRyb1NjcmVlblZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgSW50cm9TY3JlZW5WaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsT0FBT0MsaUJBQWlCLE1BQU0sa0RBQWtEO0FBQ2hGLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0Msb0JBQW9CLE1BQU0scURBQXFEO0FBQ3RGLFNBQVNDLFFBQVEsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDOUUsT0FBT0MsWUFBWSxNQUFNLG9DQUFvQztBQUM3RCxPQUFPQyxRQUFRLE1BQU0sZ0NBQWdDO0FBQ3JELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0Msd0JBQXdCLE1BQU0sMENBQTBDO0FBQy9FLE9BQU9DLHNCQUFzQixNQUFNLHdDQUF3QztBQUMzRSxPQUFPQyxxQkFBcUIsTUFBTSw0Q0FBNEM7QUFDOUUsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyxzQkFBc0IsTUFBTSxpQ0FBaUM7QUFDcEUsT0FBT0MsU0FBUyxNQUFNLHVCQUF1QjtBQUM3QyxPQUFPQyxpQkFBaUIs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