// Copyright 2013-2023, University of Colorado Boulder

/**
 * Control panel for various features related to the graph.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import GridCheckbox from '../../../../scenery-phet/js/GridCheckbox.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import graphingLines from '../../graphingLines.js';
import GraphingLinesStrings from '../../GraphingLinesStrings.js';
import GLColors from '../GLColors.js';
import GLSymbols from '../GLSymbols.js';
import Line from '../model/Line.js';
import GLIconFactory from './GLIconFactory.js';

// constants
// y = x
const Y_EQUALS_X = `${GLSymbols.y} ${MathSymbols.EQUAL_TO} ${GLSymbols.x}`;
// y = -x
const Y_EQUALS_NEGATIVE_X = `${GLSymbols.y} ${MathSymbols.EQUAL_TO} ${MathSymbols.UNARY_MINUS}${GLSymbols.x}`;
export default class GraphControlPanel extends Panel {
  /**
   * @param gridVisibleProperty - is grid visible on the graph?
   * @param slopeToolVisibleProperty - is the slope tool visible on the graphed interactive line?
   * @param standardLines - standard lines (y = x, y = -x) that are available for viewing
   * @param [providedOptions]
   */
  constructor(gridVisibleProperty, slopeToolVisibleProperty, standardLines, providedOptions) {
    const options = optionize()({
      // SelfOptions
      includeStandardLines: true,
      // PanelOptions
      fill: GLColors.CONTROL_PANEL_BACKGROUND,
      stroke: 'black',
      lineWidth: 1,
      xMargin: 20,
      yMargin: 15,
      cornerRadius: 10,
      maxWidth: 400 // determined empirically
    }, providedOptions);

    // private properties for standard-line checkboxes
    const yEqualsXVisibleProperty = new BooleanProperty(standardLines.includes(Line.Y_EQUALS_X_LINE));
    const yEqualsNegativeXVisibleProperty = new BooleanProperty(standardLines.includes(Line.Y_EQUALS_NEGATIVE_X_LINE));

    // checkboxes
    const TEXT_OPTIONS = {
      font: new PhetFont(18),
      maxWidth: 150 // determined empirically
    };

    const ICON_SIZE = 60;
    const ICON_SPACING = 15;

    // 'Slope' checkbox
    const slopeCheckbox = new Checkbox(slopeToolVisibleProperty, new HBox({
      spacing: ICON_SPACING,
      children: [new Text(GraphingLinesStrings.slope, TEXT_OPTIONS), GLIconFactory.createSlopeToolIcon(ICON_SIZE)]
    }));

    // 'y = x' checkbox
    const yEqualsXCheckbox = new Checkbox(yEqualsXVisibleProperty, new HBox({
      spacing: ICON_SPACING,
      children: [new RichText(Y_EQUALS_X, TEXT_OPTIONS), GLIconFactory.createGraphIcon(ICON_SIZE, GLColors.Y_EQUALS_X, -3, -3, 3, 3)]
    }));

    // 'y = -x' checkbox
    const yEqualsNegativeXCheckbox = new Checkbox(yEqualsNegativeXVisibleProperty, new HBox({
      spacing: ICON_SPACING,
      children: [new RichText(Y_EQUALS_NEGATIVE_X, TEXT_OPTIONS), GLIconFactory.createGraphIcon(ICON_SIZE, GLColors.Y_EQUALS_NEGATIVE_X, -3, 3, 3, -3)]
    }));

    // Grid checkbox
    const gridCheckbox = new GridCheckbox(gridVisibleProperty, {
      spacing: 10
    });
    gridCheckbox.touchArea = gridCheckbox.localBounds.dilatedXY(15, 10);

    // vertical layout
    const contentNode = new VBox({
      children: options.includeStandardLines ? [slopeCheckbox, yEqualsXCheckbox, yEqualsNegativeXCheckbox, gridCheckbox] : [slopeCheckbox, gridCheckbox],
      spacing: 20,
      align: 'left'
    });
    super(contentNode, options);
    const setStandardLineVisible = (visible, line) => {
      if (visible && !standardLines.includes(line)) {
        standardLines.add(line);
      } else if (!visible && standardLines.includes(line)) {
        standardLines.remove(line);
      }
    };

    // Add/remove standard line 'y = x'
    // unlink is unnecessary since GraphControlPanel exists for the lifetime of the sim.
    yEqualsXVisibleProperty.link(visible => {
      setStandardLineVisible(visible, Line.Y_EQUALS_X_LINE);
    });

    // Add/remove standard line 'y = -x'
    // unlink is unnecessary since GraphControlPanel exists for the lifetime of the sim.
    yEqualsNegativeXVisibleProperty.link(visible => {
      setStandardLineVisible(visible, Line.Y_EQUALS_NEGATIVE_X_LINE);
    });

    // Select appropriate checkboxes when standard lines are added.
    // removeItemAddedListener is unnecessary since GraphControlPanel exists for the lifetime of the sim.
    standardLines.addItemAddedListener(line => {
      if (line === Line.Y_EQUALS_X_LINE) {
        yEqualsXVisibleProperty.value = true;
      } else if (line === Line.Y_EQUALS_NEGATIVE_X_LINE) {
        yEqualsNegativeXVisibleProperty.value = true;
      }
    });

    // Deselect appropriate checkboxes when standard lines are removed.
    // removeItemRemovedListener is unnecessary since GraphControlPanel exists for the lifetime of the sim.
    standardLines.addItemRemovedListener(line => {
      if (line === Line.Y_EQUALS_X_LINE) {
        yEqualsXVisibleProperty.value = false;
      } else if (line === Line.Y_EQUALS_NEGATIVE_X_LINE) {
        yEqualsNegativeXVisibleProperty.value = false;
      }
    });
  }
}
graphingLines.register('GraphControlPanel', GraphControlPanel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJvcHRpb25pemUiLCJHcmlkQ2hlY2tib3giLCJNYXRoU3ltYm9scyIsIlBoZXRGb250IiwiSEJveCIsIlJpY2hUZXh0IiwiVGV4dCIsIlZCb3giLCJDaGVja2JveCIsIlBhbmVsIiwiZ3JhcGhpbmdMaW5lcyIsIkdyYXBoaW5nTGluZXNTdHJpbmdzIiwiR0xDb2xvcnMiLCJHTFN5bWJvbHMiLCJMaW5lIiwiR0xJY29uRmFjdG9yeSIsIllfRVFVQUxTX1giLCJ5IiwiRVFVQUxfVE8iLCJ4IiwiWV9FUVVBTFNfTkVHQVRJVkVfWCIsIlVOQVJZX01JTlVTIiwiR3JhcGhDb250cm9sUGFuZWwiLCJjb25zdHJ1Y3RvciIsImdyaWRWaXNpYmxlUHJvcGVydHkiLCJzbG9wZVRvb2xWaXNpYmxlUHJvcGVydHkiLCJzdGFuZGFyZExpbmVzIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImluY2x1ZGVTdGFuZGFyZExpbmVzIiwiZmlsbCIsIkNPTlRST0xfUEFORUxfQkFDS0dST1VORCIsInN0cm9rZSIsImxpbmVXaWR0aCIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiY29ybmVyUmFkaXVzIiwibWF4V2lkdGgiLCJ5RXF1YWxzWFZpc2libGVQcm9wZXJ0eSIsImluY2x1ZGVzIiwiWV9FUVVBTFNfWF9MSU5FIiwieUVxdWFsc05lZ2F0aXZlWFZpc2libGVQcm9wZXJ0eSIsIllfRVFVQUxTX05FR0FUSVZFX1hfTElORSIsIlRFWFRfT1BUSU9OUyIsImZvbnQiLCJJQ09OX1NJWkUiLCJJQ09OX1NQQUNJTkciLCJzbG9wZUNoZWNrYm94Iiwic3BhY2luZyIsImNoaWxkcmVuIiwic2xvcGUiLCJjcmVhdGVTbG9wZVRvb2xJY29uIiwieUVxdWFsc1hDaGVja2JveCIsImNyZWF0ZUdyYXBoSWNvbiIsInlFcXVhbHNOZWdhdGl2ZVhDaGVja2JveCIsImdyaWRDaGVja2JveCIsInRvdWNoQXJlYSIsImxvY2FsQm91bmRzIiwiZGlsYXRlZFhZIiwiY29udGVudE5vZGUiLCJhbGlnbiIsInNldFN0YW5kYXJkTGluZVZpc2libGUiLCJ2aXNpYmxlIiwibGluZSIsImFkZCIsInJlbW92ZSIsImxpbmsiLCJhZGRJdGVtQWRkZWRMaXN0ZW5lciIsInZhbHVlIiwiYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR3JhcGhDb250cm9sUGFuZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29udHJvbCBwYW5lbCBmb3IgdmFyaW91cyBmZWF0dXJlcyByZWxhdGVkIHRvIHRoZSBncmFwaC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IHsgT2JzZXJ2YWJsZUFycmF5IH0gZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBHcmlkQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0dyaWRDaGVja2JveC5qcyc7XHJcbmltcG9ydCBNYXRoU3ltYm9scyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWF0aFN5bWJvbHMuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgSEJveCwgUmljaFRleHQsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcclxuaW1wb3J0IFBhbmVsLCB7IFBhbmVsT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBncmFwaGluZ0xpbmVzIGZyb20gJy4uLy4uL2dyYXBoaW5nTGluZXMuanMnO1xyXG5pbXBvcnQgR3JhcGhpbmdMaW5lc1N0cmluZ3MgZnJvbSAnLi4vLi4vR3JhcGhpbmdMaW5lc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgR0xDb2xvcnMgZnJvbSAnLi4vR0xDb2xvcnMuanMnO1xyXG5pbXBvcnQgR0xTeW1ib2xzIGZyb20gJy4uL0dMU3ltYm9scy5qcyc7XHJcbmltcG9ydCBMaW5lIGZyb20gJy4uL21vZGVsL0xpbmUuanMnO1xyXG5pbXBvcnQgR0xJY29uRmFjdG9yeSBmcm9tICcuL0dMSWNvbkZhY3RvcnkuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbi8vIHkgPSB4XHJcbmNvbnN0IFlfRVFVQUxTX1ggPSBgJHtHTFN5bWJvbHMueX0gJHtNYXRoU3ltYm9scy5FUVVBTF9UT30gJHtHTFN5bWJvbHMueH1gO1xyXG4vLyB5ID0gLXhcclxuY29uc3QgWV9FUVVBTFNfTkVHQVRJVkVfWCA9IGAke0dMU3ltYm9scy55fSAke01hdGhTeW1ib2xzLkVRVUFMX1RPfSAke01hdGhTeW1ib2xzLlVOQVJZX01JTlVTfSR7R0xTeW1ib2xzLnh9YDtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgaW5jbHVkZVN0YW5kYXJkTGluZXM/OiBib29sZWFuOyAvLyBpZiB0cnVlLCBpbmNsdWRlcyB2aXNpYmlsaXR5IGNvbnRyb2xzIGZvciAneSA9IHgnIGFuZCAneSA9IC14J1xyXG59O1xyXG5cclxudHlwZSBHcmFwaENvbnRyb2xQYW5lbE9wdGlvbnMgPSBTZWxmT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyYXBoQ29udHJvbFBhbmVsIGV4dGVuZHMgUGFuZWwge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gZ3JpZFZpc2libGVQcm9wZXJ0eSAtIGlzIGdyaWQgdmlzaWJsZSBvbiB0aGUgZ3JhcGg/XHJcbiAgICogQHBhcmFtIHNsb3BlVG9vbFZpc2libGVQcm9wZXJ0eSAtIGlzIHRoZSBzbG9wZSB0b29sIHZpc2libGUgb24gdGhlIGdyYXBoZWQgaW50ZXJhY3RpdmUgbGluZT9cclxuICAgKiBAcGFyYW0gc3RhbmRhcmRMaW5lcyAtIHN0YW5kYXJkIGxpbmVzICh5ID0geCwgeSA9IC14KSB0aGF0IGFyZSBhdmFpbGFibGUgZm9yIHZpZXdpbmdcclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGdyaWRWaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LCBzbG9wZVRvb2xWaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgc3RhbmRhcmRMaW5lczogT2JzZXJ2YWJsZUFycmF5PExpbmU+LCBwcm92aWRlZE9wdGlvbnM/OiBHcmFwaENvbnRyb2xQYW5lbE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxHcmFwaENvbnRyb2xQYW5lbE9wdGlvbnMsIFNlbGZPcHRpb25zLCBQYW5lbE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIGluY2x1ZGVTdGFuZGFyZExpbmVzOiB0cnVlLFxyXG5cclxuICAgICAgLy8gUGFuZWxPcHRpb25zXHJcbiAgICAgIGZpbGw6IEdMQ29sb3JzLkNPTlRST0xfUEFORUxfQkFDS0dST1VORCxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICAgIHhNYXJnaW46IDIwLFxyXG4gICAgICB5TWFyZ2luOiAxNSxcclxuICAgICAgY29ybmVyUmFkaXVzOiAxMCxcclxuICAgICAgbWF4V2lkdGg6IDQwMCAvLyBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBwcml2YXRlIHByb3BlcnRpZXMgZm9yIHN0YW5kYXJkLWxpbmUgY2hlY2tib3hlc1xyXG4gICAgY29uc3QgeUVxdWFsc1hWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBzdGFuZGFyZExpbmVzLmluY2x1ZGVzKCBMaW5lLllfRVFVQUxTX1hfTElORSApICk7XHJcbiAgICBjb25zdCB5RXF1YWxzTmVnYXRpdmVYVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggc3RhbmRhcmRMaW5lcy5pbmNsdWRlcyggTGluZS5ZX0VRVUFMU19ORUdBVElWRV9YX0xJTkUgKSApO1xyXG5cclxuICAgIC8vIGNoZWNrYm94ZXNcclxuICAgIGNvbnN0IFRFWFRfT1BUSU9OUyA9IHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxOCApLFxyXG4gICAgICBtYXhXaWR0aDogMTUwIC8vIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgIH07XHJcbiAgICBjb25zdCBJQ09OX1NJWkUgPSA2MDtcclxuICAgIGNvbnN0IElDT05fU1BBQ0lORyA9IDE1O1xyXG5cclxuICAgIC8vICdTbG9wZScgY2hlY2tib3hcclxuICAgIGNvbnN0IHNsb3BlQ2hlY2tib3ggPSBuZXcgQ2hlY2tib3goIHNsb3BlVG9vbFZpc2libGVQcm9wZXJ0eSwgbmV3IEhCb3goIHtcclxuICAgICAgc3BhY2luZzogSUNPTl9TUEFDSU5HLFxyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIG5ldyBUZXh0KCBHcmFwaGluZ0xpbmVzU3RyaW5ncy5zbG9wZSwgVEVYVF9PUFRJT05TICksXHJcbiAgICAgICAgR0xJY29uRmFjdG9yeS5jcmVhdGVTbG9wZVRvb2xJY29uKCBJQ09OX1NJWkUgKVxyXG4gICAgICBdXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyAneSA9IHgnIGNoZWNrYm94XHJcbiAgICBjb25zdCB5RXF1YWxzWENoZWNrYm94ID0gbmV3IENoZWNrYm94KCB5RXF1YWxzWFZpc2libGVQcm9wZXJ0eSwgbmV3IEhCb3goIHtcclxuICAgICAgc3BhY2luZzogSUNPTl9TUEFDSU5HLFxyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIG5ldyBSaWNoVGV4dCggWV9FUVVBTFNfWCwgVEVYVF9PUFRJT05TICksXHJcbiAgICAgICAgR0xJY29uRmFjdG9yeS5jcmVhdGVHcmFwaEljb24oIElDT05fU0laRSwgR0xDb2xvcnMuWV9FUVVBTFNfWCwgLTMsIC0zLCAzLCAzIClcclxuICAgICAgXVxyXG4gICAgfSApICk7XHJcblxyXG4gICAgLy8gJ3kgPSAteCcgY2hlY2tib3hcclxuICAgIGNvbnN0IHlFcXVhbHNOZWdhdGl2ZVhDaGVja2JveCA9IG5ldyBDaGVja2JveCggeUVxdWFsc05lZ2F0aXZlWFZpc2libGVQcm9wZXJ0eSwgbmV3IEhCb3goIHtcclxuICAgICAgc3BhY2luZzogSUNPTl9TUEFDSU5HLFxyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIG5ldyBSaWNoVGV4dCggWV9FUVVBTFNfTkVHQVRJVkVfWCwgVEVYVF9PUFRJT05TICksXHJcbiAgICAgICAgR0xJY29uRmFjdG9yeS5jcmVhdGVHcmFwaEljb24oIElDT05fU0laRSwgR0xDb2xvcnMuWV9FUVVBTFNfTkVHQVRJVkVfWCwgLTMsIDMsIDMsIC0zIClcclxuICAgICAgXVxyXG4gICAgfSApICk7XHJcblxyXG4gICAgLy8gR3JpZCBjaGVja2JveFxyXG4gICAgY29uc3QgZ3JpZENoZWNrYm94ID0gbmV3IEdyaWRDaGVja2JveCggZ3JpZFZpc2libGVQcm9wZXJ0eSwge1xyXG4gICAgICBzcGFjaW5nOiAxMFxyXG4gICAgfSApO1xyXG4gICAgZ3JpZENoZWNrYm94LnRvdWNoQXJlYSA9IGdyaWRDaGVja2JveC5sb2NhbEJvdW5kcy5kaWxhdGVkWFkoIDE1LCAxMCApO1xyXG5cclxuICAgIC8vIHZlcnRpY2FsIGxheW91dFxyXG4gICAgY29uc3QgY29udGVudE5vZGUgPSBuZXcgVkJveCgge1xyXG4gICAgICBjaGlsZHJlbjogKCBvcHRpb25zLmluY2x1ZGVTdGFuZGFyZExpbmVzICkgP1xyXG4gICAgICAgIFsgc2xvcGVDaGVja2JveCwgeUVxdWFsc1hDaGVja2JveCwgeUVxdWFsc05lZ2F0aXZlWENoZWNrYm94LCBncmlkQ2hlY2tib3ggXSA6XHJcbiAgICAgICAgWyBzbG9wZUNoZWNrYm94LCBncmlkQ2hlY2tib3ggXSxcclxuICAgICAgc3BhY2luZzogMjAsXHJcbiAgICAgIGFsaWduOiAnbGVmdCdcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggY29udGVudE5vZGUsIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBzZXRTdGFuZGFyZExpbmVWaXNpYmxlID0gKCB2aXNpYmxlOiBib29sZWFuLCBsaW5lOiBMaW5lICkgPT4ge1xyXG4gICAgICBpZiAoIHZpc2libGUgJiYgIXN0YW5kYXJkTGluZXMuaW5jbHVkZXMoIGxpbmUgKSApIHtcclxuICAgICAgICBzdGFuZGFyZExpbmVzLmFkZCggbGluZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCAhdmlzaWJsZSAmJiBzdGFuZGFyZExpbmVzLmluY2x1ZGVzKCBsaW5lICkgKSB7XHJcbiAgICAgICAgc3RhbmRhcmRMaW5lcy5yZW1vdmUoIGxpbmUgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBBZGQvcmVtb3ZlIHN0YW5kYXJkIGxpbmUgJ3kgPSB4J1xyXG4gICAgLy8gdW5saW5rIGlzIHVubmVjZXNzYXJ5IHNpbmNlIEdyYXBoQ29udHJvbFBhbmVsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0uXHJcbiAgICB5RXF1YWxzWFZpc2libGVQcm9wZXJ0eS5saW5rKCB2aXNpYmxlID0+IHtcclxuICAgICAgc2V0U3RhbmRhcmRMaW5lVmlzaWJsZSggdmlzaWJsZSwgTGluZS5ZX0VRVUFMU19YX0xJTkUgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGQvcmVtb3ZlIHN0YW5kYXJkIGxpbmUgJ3kgPSAteCdcclxuICAgIC8vIHVubGluayBpcyB1bm5lY2Vzc2FyeSBzaW5jZSBHcmFwaENvbnRyb2xQYW5lbCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltLlxyXG4gICAgeUVxdWFsc05lZ2F0aXZlWFZpc2libGVQcm9wZXJ0eS5saW5rKCB2aXNpYmxlID0+IHtcclxuICAgICAgc2V0U3RhbmRhcmRMaW5lVmlzaWJsZSggdmlzaWJsZSwgTGluZS5ZX0VRVUFMU19ORUdBVElWRV9YX0xJTkUgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTZWxlY3QgYXBwcm9wcmlhdGUgY2hlY2tib3hlcyB3aGVuIHN0YW5kYXJkIGxpbmVzIGFyZSBhZGRlZC5cclxuICAgIC8vIHJlbW92ZUl0ZW1BZGRlZExpc3RlbmVyIGlzIHVubmVjZXNzYXJ5IHNpbmNlIEdyYXBoQ29udHJvbFBhbmVsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0uXHJcbiAgICBzdGFuZGFyZExpbmVzLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCBsaW5lID0+IHtcclxuICAgICAgaWYgKCBsaW5lID09PSBMaW5lLllfRVFVQUxTX1hfTElORSApIHtcclxuICAgICAgICB5RXF1YWxzWFZpc2libGVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGxpbmUgPT09IExpbmUuWV9FUVVBTFNfTkVHQVRJVkVfWF9MSU5FICkge1xyXG4gICAgICAgIHlFcXVhbHNOZWdhdGl2ZVhWaXNpYmxlUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRGVzZWxlY3QgYXBwcm9wcmlhdGUgY2hlY2tib3hlcyB3aGVuIHN0YW5kYXJkIGxpbmVzIGFyZSByZW1vdmVkLlxyXG4gICAgLy8gcmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lciBpcyB1bm5lY2Vzc2FyeSBzaW5jZSBHcmFwaENvbnRyb2xQYW5lbCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltLlxyXG4gICAgc3RhbmRhcmRMaW5lcy5hZGRJdGVtUmVtb3ZlZExpc3RlbmVyKCBsaW5lID0+IHtcclxuICAgICAgaWYgKCBsaW5lID09PSBMaW5lLllfRVFVQUxTX1hfTElORSApIHtcclxuICAgICAgICB5RXF1YWxzWFZpc2libGVQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBsaW5lID09PSBMaW5lLllfRVFVQUxTX05FR0FUSVZFX1hfTElORSApIHtcclxuICAgICAgICB5RXF1YWxzTmVnYXRpdmVYVmlzaWJsZVByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmdyYXBoaW5nTGluZXMucmVnaXN0ZXIoICdHcmFwaENvbnRyb2xQYW5lbCcsIEdyYXBoQ29udHJvbFBhbmVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFHcEUsT0FBT0MsU0FBUyxNQUFNLHVDQUF1QztBQUM3RCxPQUFPQyxZQUFZLE1BQU0sNkNBQTZDO0FBQ3RFLE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLEVBQUVDLFFBQVEsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzlFLE9BQU9DLFFBQVEsTUFBTSxnQ0FBZ0M7QUFDckQsT0FBT0MsS0FBSyxNQUF3Qiw2QkFB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