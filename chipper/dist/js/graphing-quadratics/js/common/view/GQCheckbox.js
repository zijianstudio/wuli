// Copyright 2018-2023, University of Colorado Boulder

/**
 * GQCheckbox is the base class for a checkbox that is labeled with text, with an optional icon to the right of the text.
 * This provides consistent font and textNode.maxWidth for all checkboxes in the sim, and factory methods for
 * creating each checkbox.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { Circle, HBox, Line, RichText } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GQConstants from '../GQConstants.js';
import GraphingQuadraticsStrings from '../../GraphingQuadraticsStrings.js';
import GQColors from '../GQColors.js';
import GQSymbols from '../GQSymbols.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import Manipulator from '../../../../graphing-lines/js/common/view/manipulator/Manipulator.js';
export default class GQCheckbox extends Checkbox {
  constructor(booleanProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      textFill: 'black',
      textMaxWidth: 180,
      // determined empirically
      font: GQConstants.CHECKBOX_LABEL_FONT
    }, providedOptions);
    const text = new RichText(options.string, {
      fill: options.textFill,
      font: options.font,
      maxWidth: options.textMaxWidth,
      tandem: options.tandem.createTandem('text')
    });
    const content = !options.icon ? text : new HBox({
      align: 'center',
      spacing: 8,
      children: [text, options.icon]
    });
    super(booleanProperty, content, options);
  }

  /**
   * Creates the checkbox for the quadratic term, y = ax^2
   */
  static createQuadraticTermCheckbox(property, tandem) {
    return new GQCheckbox(property, {
      string: `${GQSymbols.y} ${MathSymbols.EQUAL_TO} ${GQSymbols.a}${GQSymbols.xSquared}`,
      // y = ax^2
      textFill: GQColors.QUADRATIC_TERM,
      tandem: tandem,
      phetioDocumentation: 'checkbox that makes the quadratic term (y = ax^2) visible on the graph'
    });
  }

  /**
   * Creates the checkbox for the linear term, y = bx
   */
  static createLinearTermCheckbox(property, tandem) {
    return new GQCheckbox(property, {
      string: `${GQSymbols.y} ${MathSymbols.EQUAL_TO} ${GQSymbols.b}${GQSymbols.x}`,
      // y = bx
      textFill: GQColors.LINEAR_TERM,
      tandem: tandem,
      phetioDocumentation: 'checkbox that makes the linear term (y = bx) visible on the graph'
    });
  }

  /**
   * Creates the checkbox for the constant term, y = c
   */
  static createConstantTermCheckbox(property, tandem) {
    return new GQCheckbox(property, {
      string: `${GQSymbols.y} ${MathSymbols.EQUAL_TO} ${GQSymbols.c}`,
      // y = c
      textFill: GQColors.CONSTANT_TERM,
      tandem: tandem,
      phetioDocumentation: 'checkbox that makes the constant term (y = c) visible on the graph'
    });
  }

  /**
   * Creates the 'Axis of Symmetry' checkbox, with a vertical dashed line for the icon.
   */
  static createAxisOfSymmetryCheckbox(property, tandem) {
    return new GQCheckbox(property, {
      string: GraphingQuadraticsStrings.axisOfSymmetryStringProperty,
      icon: new Line(0, 0, 0, 5 * GQConstants.AXIS_OF_SYMMETRY_LINE_DASH[0], {
        stroke: GQColors.AXIS_OF_SYMMETRY,
        lineWidth: GQConstants.AXIS_OF_SYMMETRY_LINE_WIDTH,
        lineDash: GQConstants.AXIS_OF_SYMMETRY_LINE_DASH
      }),
      tandem: tandem,
      phetioDocumentation: 'checkbox that makes the axis of symmetry visible on the graph'
    });
  }

  /**
   * Creates the 'Coordinates' checkbox.
   */
  static createCoordinatesCheckbox(property, tandem) {
    return new GQCheckbox(property, {
      string: GraphingQuadraticsStrings.coordinatesStringProperty,
      tandem: tandem,
      phetioDocumentation: 'checkbox that makes the (x,y) coordinates visible on points on the graph'
    });
  }

  /**
   * Creates the 'Directrix' checkbox, with a horizontal dashed line for the icon.
   */
  static createDirectrixCheckbox(property, tandem) {
    return new GQCheckbox(property, {
      string: GraphingQuadraticsStrings.directrixStringProperty,
      icon: new Line(0, 0, 5 * GQConstants.DIRECTRIX_LINE_DASH[0], 0, {
        stroke: GQColors.DIRECTRIX,
        lineWidth: GQConstants.DIRECTRIX_LINE_WIDTH,
        lineDash: GQConstants.DIRECTRIX_LINE_DASH
      }),
      tandem: tandem,
      phetioDocumentation: 'checkbox that shows the directrix on the graph'
    });
  }

  /**
   * Creates the 'Equations' checkbox.
   */
  static createEquationsCheckbox(property, tandem) {
    return new GQCheckbox(property, {
      string: GraphingQuadraticsStrings.equationsStringProperty,
      tandem: tandem,
      phetioDocumentation: 'checkbox that shows equations on graphed curves'
    });
  }

  /**
   * Creates the 'Focus' checkbox, with a manipulator icon.
   */
  static createFocusCheckbox(property, tandem) {
    return new GQCheckbox(property, {
      string: GraphingQuadraticsStrings.focusStringProperty,
      icon: Manipulator.createIcon(8, GQColors.FOCUS),
      tandem: tandem,
      phetioDocumentation: 'checkbox that shows the focus on the graph'
    });
  }

  /**
   * Creates the 'Point on Parabola' checkbox, with a manipulator icon.
   */
  static createPointOnParabolaCheckbox(property, tandem) {
    return new GQCheckbox(property, {
      string: GraphingQuadraticsStrings.pointOnParabolaStringProperty,
      icon: Manipulator.createIcon(8, GQColors.POINT_ON_PARABOLA),
      tandem: tandem,
      phetioDocumentation: 'checkbox that shows the point on the parabola on the graph'
    });
  }

  /**
   * Creates the 'Roots' checkbox, with a pair of flat points for the icon.
   */
  static createRootsCheckbox(property, tandem) {
    const circleOptions = {
      radius: 6,
      fill: GQColors.ROOTS
    };
    const icon = new HBox({
      align: 'center',
      spacing: 5,
      children: [new Circle(circleOptions), new Circle(circleOptions)]
    });
    return new GQCheckbox(property, {
      string: GraphingQuadraticsStrings.rootsStringProperty,
      icon: icon,
      tandem: tandem,
      phetioDocumentation: 'checkbox that shows roots on the graph'
    });
  }

  /**
   * Creates the 'Vertex' checkbox, with a flat point for the icon.
   */
  static createVertexPointCheckbox(property, tandem) {
    return new GQCheckbox(property, {
      string: GraphingQuadraticsStrings.vertexStringProperty,
      icon: new Circle(6, {
        fill: GQColors.VERTEX
      }),
      tandem: tandem,
      phetioDocumentation: 'checkbox that shows the vertex on the graph'
    });
  }

  /**
   * Creates the 'Vertex' checkbox, with a manipulator icon.
   */
  static createVertexManipulatorCheckbox(property, tandem) {
    return new GQCheckbox(property, {
      string: GraphingQuadraticsStrings.vertexStringProperty,
      icon: Manipulator.createIcon(8, GQColors.VERTEX),
      tandem: tandem,
      phetioDocumentation: 'checkbox that shows the vertex manipulator on the graph'
    });
  }
}
graphingQuadratics.register('GQCheckbox', GQCheckbox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJDaXJjbGUiLCJIQm94IiwiTGluZSIsIlJpY2hUZXh0IiwiQ2hlY2tib3giLCJncmFwaGluZ1F1YWRyYXRpY3MiLCJHUUNvbnN0YW50cyIsIkdyYXBoaW5nUXVhZHJhdGljc1N0cmluZ3MiLCJHUUNvbG9ycyIsIkdRU3ltYm9scyIsIk1hdGhTeW1ib2xzIiwiTWFuaXB1bGF0b3IiLCJHUUNoZWNrYm94IiwiY29uc3RydWN0b3IiLCJib29sZWFuUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwidGV4dEZpbGwiLCJ0ZXh0TWF4V2lkdGgiLCJmb250IiwiQ0hFQ0tCT1hfTEFCRUxfRk9OVCIsInRleHQiLCJzdHJpbmciLCJmaWxsIiwibWF4V2lkdGgiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJjb250ZW50IiwiaWNvbiIsImFsaWduIiwic3BhY2luZyIsImNoaWxkcmVuIiwiY3JlYXRlUXVhZHJhdGljVGVybUNoZWNrYm94IiwicHJvcGVydHkiLCJ5IiwiRVFVQUxfVE8iLCJhIiwieFNxdWFyZWQiLCJRVUFEUkFUSUNfVEVSTSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJjcmVhdGVMaW5lYXJUZXJtQ2hlY2tib3giLCJiIiwieCIsIkxJTkVBUl9URVJNIiwiY3JlYXRlQ29uc3RhbnRUZXJtQ2hlY2tib3giLCJjIiwiQ09OU1RBTlRfVEVSTSIsImNyZWF0ZUF4aXNPZlN5bW1ldHJ5Q2hlY2tib3giLCJheGlzT2ZTeW1tZXRyeVN0cmluZ1Byb3BlcnR5IiwiQVhJU19PRl9TWU1NRVRSWV9MSU5FX0RBU0giLCJzdHJva2UiLCJBWElTX09GX1NZTU1FVFJZIiwibGluZVdpZHRoIiwiQVhJU19PRl9TWU1NRVRSWV9MSU5FX1dJRFRIIiwibGluZURhc2giLCJjcmVhdGVDb29yZGluYXRlc0NoZWNrYm94IiwiY29vcmRpbmF0ZXNTdHJpbmdQcm9wZXJ0eSIsImNyZWF0ZURpcmVjdHJpeENoZWNrYm94IiwiZGlyZWN0cml4U3RyaW5nUHJvcGVydHkiLCJESVJFQ1RSSVhfTElORV9EQVNIIiwiRElSRUNUUklYIiwiRElSRUNUUklYX0xJTkVfV0lEVEgiLCJjcmVhdGVFcXVhdGlvbnNDaGVja2JveCIsImVxdWF0aW9uc1N0cmluZ1Byb3BlcnR5IiwiY3JlYXRlRm9jdXNDaGVja2JveCIsImZvY3VzU3RyaW5nUHJvcGVydHkiLCJjcmVhdGVJY29uIiwiRk9DVVMiLCJjcmVhdGVQb2ludE9uUGFyYWJvbGFDaGVja2JveCIsInBvaW50T25QYXJhYm9sYVN0cmluZ1Byb3BlcnR5IiwiUE9JTlRfT05fUEFSQUJPTEEiLCJjcmVhdGVSb290c0NoZWNrYm94IiwiY2lyY2xlT3B0aW9ucyIsInJhZGl1cyIsIlJPT1RTIiwicm9vdHNTdHJpbmdQcm9wZXJ0eSIsImNyZWF0ZVZlcnRleFBvaW50Q2hlY2tib3giLCJ2ZXJ0ZXhTdHJpbmdQcm9wZXJ0eSIsIlZFUlRFWCIsImNyZWF0ZVZlcnRleE1hbmlwdWxhdG9yQ2hlY2tib3giLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdRQ2hlY2tib3gudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR1FDaGVja2JveCBpcyB0aGUgYmFzZSBjbGFzcyBmb3IgYSBjaGVja2JveCB0aGF0IGlzIGxhYmVsZWQgd2l0aCB0ZXh0LCB3aXRoIGFuIG9wdGlvbmFsIGljb24gdG8gdGhlIHJpZ2h0IG9mIHRoZSB0ZXh0LlxyXG4gKiBUaGlzIHByb3ZpZGVzIGNvbnNpc3RlbnQgZm9udCBhbmQgdGV4dE5vZGUubWF4V2lkdGggZm9yIGFsbCBjaGVja2JveGVzIGluIHRoZSBzaW0sIGFuZCBmYWN0b3J5IG1ldGhvZHMgZm9yXHJcbiAqIGNyZWF0aW5nIGVhY2ggY2hlY2tib3guXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBIQm94LCBMaW5lLCBOb2RlLCBSaWNoVGV4dCwgVENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IENoZWNrYm94LCB7IENoZWNrYm94T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9DaGVja2JveC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBncmFwaGluZ1F1YWRyYXRpY3MgZnJvbSAnLi4vLi4vZ3JhcGhpbmdRdWFkcmF0aWNzLmpzJztcclxuaW1wb3J0IEdRQ29uc3RhbnRzIGZyb20gJy4uL0dRQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEdyYXBoaW5nUXVhZHJhdGljc1N0cmluZ3MgZnJvbSAnLi4vLi4vR3JhcGhpbmdRdWFkcmF0aWNzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBHUUNvbG9ycyBmcm9tICcuLi9HUUNvbG9ycy5qcyc7XHJcbmltcG9ydCBHUVN5bWJvbHMgZnJvbSAnLi4vR1FTeW1ib2xzLmpzJztcclxuaW1wb3J0IE1hdGhTeW1ib2xzIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYXRoU3ltYm9scy5qcyc7XHJcbmltcG9ydCBNYW5pcHVsYXRvciBmcm9tICcuLi8uLi8uLi8uLi9ncmFwaGluZy1saW5lcy9qcy9jb21tb24vdmlldy9tYW5pcHVsYXRvci9NYW5pcHVsYXRvci5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBzdHJpbmc6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4gfCBzdHJpbmc7IC8vIHJlcXVpcmVkIHN0cmluZyBmb3IgdGV4dFxyXG4gIHRleHRGaWxsPzogVENvbG9yOyAvLyBjb2xvciBvZiB0aGUgdGV4dFxyXG4gIHRleHRNYXhXaWR0aD86IG51bWJlcjsgLy8gbWF4V2lkdGggb2YgdGhlIHRleHRcclxuICBmb250PzogUGhldEZvbnQ7IC8vIGZvbnQgZm9yIHRoZSB0ZXh0XHJcbiAgaWNvbj86IE5vZGU7IC8vIG9wdGlvbmFsIGljb24sIHRvIHRoZSByaWdodCBvZiB0aGUgdGV4dFxyXG59O1xyXG5cclxudHlwZSBHUUNoZWNrYm94T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPENoZWNrYm94T3B0aW9ucywgJ3RhbmRlbScgfCAncGhldGlvRG9jdW1lbnRhdGlvbic+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR1FDaGVja2JveCBleHRlbmRzIENoZWNrYm94IHtcclxuXHJcbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKCBib29sZWFuUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LCBwcm92aWRlZE9wdGlvbnM6IEdRQ2hlY2tib3hPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8R1FDaGVja2JveE9wdGlvbnMsIFN0cmljdE9taXQ8U2VsZk9wdGlvbnMsICdpY29uJz4sIENoZWNrYm94T3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgdGV4dEZpbGw6ICdibGFjaycsXHJcbiAgICAgIHRleHRNYXhXaWR0aDogMTgwLCAvLyBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICAgIGZvbnQ6IEdRQ29uc3RhbnRzLkNIRUNLQk9YX0xBQkVMX0ZPTlRcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHRleHQgPSBuZXcgUmljaFRleHQoIG9wdGlvbnMuc3RyaW5nLCB7XHJcbiAgICAgIGZpbGw6IG9wdGlvbnMudGV4dEZpbGwsXHJcbiAgICAgIGZvbnQ6IG9wdGlvbnMuZm9udCxcclxuICAgICAgbWF4V2lkdGg6IG9wdGlvbnMudGV4dE1heFdpZHRoLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RleHQnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjb250ZW50ID0gKCAhb3B0aW9ucy5pY29uICkgP1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHQgOlxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBIQm94KCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICBzcGFjaW5nOiA4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFsgdGV4dCwgb3B0aW9ucy5pY29uIF1cclxuICAgICAgICAgICAgICAgICAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIGJvb2xlYW5Qcm9wZXJ0eSwgY29udGVudCwgb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgY2hlY2tib3ggZm9yIHRoZSBxdWFkcmF0aWMgdGVybSwgeSA9IGF4XjJcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZVF1YWRyYXRpY1Rlcm1DaGVja2JveCggcHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LCB0YW5kZW06IFRhbmRlbSApOiBHUUNoZWNrYm94IHtcclxuICAgIHJldHVybiBuZXcgR1FDaGVja2JveCggcHJvcGVydHksIHtcclxuICAgICAgc3RyaW5nOiBgJHtHUVN5bWJvbHMueX0gJHtNYXRoU3ltYm9scy5FUVVBTF9UT30gJHtHUVN5bWJvbHMuYX0ke0dRU3ltYm9scy54U3F1YXJlZH1gLCAvLyB5ID0gYXheMlxyXG4gICAgICB0ZXh0RmlsbDogR1FDb2xvcnMuUVVBRFJBVElDX1RFUk0sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnY2hlY2tib3ggdGhhdCBtYWtlcyB0aGUgcXVhZHJhdGljIHRlcm0gKHkgPSBheF4yKSB2aXNpYmxlIG9uIHRoZSBncmFwaCdcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIGNoZWNrYm94IGZvciB0aGUgbGluZWFyIHRlcm0sIHkgPSBieFxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlTGluZWFyVGVybUNoZWNrYm94KCBwcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sIHRhbmRlbTogVGFuZGVtICk6IEdRQ2hlY2tib3gge1xyXG4gICAgcmV0dXJuIG5ldyBHUUNoZWNrYm94KCBwcm9wZXJ0eSwge1xyXG4gICAgICBzdHJpbmc6IGAke0dRU3ltYm9scy55fSAke01hdGhTeW1ib2xzLkVRVUFMX1RPfSAke0dRU3ltYm9scy5ifSR7R1FTeW1ib2xzLnh9YCwgLy8geSA9IGJ4XHJcbiAgICAgIHRleHRGaWxsOiBHUUNvbG9ycy5MSU5FQVJfVEVSTSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdjaGVja2JveCB0aGF0IG1ha2VzIHRoZSBsaW5lYXIgdGVybSAoeSA9IGJ4KSB2aXNpYmxlIG9uIHRoZSBncmFwaCdcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIGNoZWNrYm94IGZvciB0aGUgY29uc3RhbnQgdGVybSwgeSA9IGNcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZUNvbnN0YW50VGVybUNoZWNrYm94KCBwcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sIHRhbmRlbTogVGFuZGVtICk6IEdRQ2hlY2tib3gge1xyXG4gICAgcmV0dXJuIG5ldyBHUUNoZWNrYm94KCBwcm9wZXJ0eSwge1xyXG4gICAgICBzdHJpbmc6IGAke0dRU3ltYm9scy55fSAke01hdGhTeW1ib2xzLkVRVUFMX1RPfSAke0dRU3ltYm9scy5jfWAsIC8vIHkgPSBjXHJcbiAgICAgIHRleHRGaWxsOiBHUUNvbG9ycy5DT05TVEFOVF9URVJNLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ2NoZWNrYm94IHRoYXQgbWFrZXMgdGhlIGNvbnN0YW50IHRlcm0gKHkgPSBjKSB2aXNpYmxlIG9uIHRoZSBncmFwaCdcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlICdBeGlzIG9mIFN5bW1ldHJ5JyBjaGVja2JveCwgd2l0aCBhIHZlcnRpY2FsIGRhc2hlZCBsaW5lIGZvciB0aGUgaWNvbi5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZUF4aXNPZlN5bW1ldHJ5Q2hlY2tib3goIHByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPiwgdGFuZGVtOiBUYW5kZW0gKTogR1FDaGVja2JveCB7XHJcbiAgICByZXR1cm4gbmV3IEdRQ2hlY2tib3goIHByb3BlcnR5LCB7XHJcbiAgICAgIHN0cmluZzogR3JhcGhpbmdRdWFkcmF0aWNzU3RyaW5ncy5heGlzT2ZTeW1tZXRyeVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBpY29uOiBuZXcgTGluZSggMCwgMCwgMCwgNSAqIEdRQ29uc3RhbnRzLkFYSVNfT0ZfU1lNTUVUUllfTElORV9EQVNIWyAwIF0sIHtcclxuICAgICAgICBzdHJva2U6IEdRQ29sb3JzLkFYSVNfT0ZfU1lNTUVUUlksXHJcbiAgICAgICAgbGluZVdpZHRoOiBHUUNvbnN0YW50cy5BWElTX09GX1NZTU1FVFJZX0xJTkVfV0lEVEgsXHJcbiAgICAgICAgbGluZURhc2g6IEdRQ29uc3RhbnRzLkFYSVNfT0ZfU1lNTUVUUllfTElORV9EQVNIXHJcbiAgICAgIH0gKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdjaGVja2JveCB0aGF0IG1ha2VzIHRoZSBheGlzIG9mIHN5bW1ldHJ5IHZpc2libGUgb24gdGhlIGdyYXBoJ1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgJ0Nvb3JkaW5hdGVzJyBjaGVja2JveC5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZUNvb3JkaW5hdGVzQ2hlY2tib3goIHByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPiwgdGFuZGVtOiBUYW5kZW0gKTogR1FDaGVja2JveCB7XHJcbiAgICByZXR1cm4gbmV3IEdRQ2hlY2tib3goIHByb3BlcnR5LCB7XHJcbiAgICAgIHN0cmluZzogR3JhcGhpbmdRdWFkcmF0aWNzU3RyaW5ncy5jb29yZGluYXRlc1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ2NoZWNrYm94IHRoYXQgbWFrZXMgdGhlICh4LHkpIGNvb3JkaW5hdGVzIHZpc2libGUgb24gcG9pbnRzIG9uIHRoZSBncmFwaCdcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlICdEaXJlY3RyaXgnIGNoZWNrYm94LCB3aXRoIGEgaG9yaXpvbnRhbCBkYXNoZWQgbGluZSBmb3IgdGhlIGljb24uXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjcmVhdGVEaXJlY3RyaXhDaGVja2JveCggcHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LCB0YW5kZW06IFRhbmRlbSApOiBHUUNoZWNrYm94IHtcclxuICAgIHJldHVybiBuZXcgR1FDaGVja2JveCggcHJvcGVydHksIHtcclxuICAgICAgc3RyaW5nOiBHcmFwaGluZ1F1YWRyYXRpY3NTdHJpbmdzLmRpcmVjdHJpeFN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBpY29uOiBuZXcgTGluZSggMCwgMCwgNSAqIEdRQ29uc3RhbnRzLkRJUkVDVFJJWF9MSU5FX0RBU0hbIDAgXSwgMCwge1xyXG4gICAgICAgIHN0cm9rZTogR1FDb2xvcnMuRElSRUNUUklYLFxyXG4gICAgICAgIGxpbmVXaWR0aDogR1FDb25zdGFudHMuRElSRUNUUklYX0xJTkVfV0lEVEgsXHJcbiAgICAgICAgbGluZURhc2g6IEdRQ29uc3RhbnRzLkRJUkVDVFJJWF9MSU5FX0RBU0hcclxuICAgICAgfSApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ2NoZWNrYm94IHRoYXQgc2hvd3MgdGhlIGRpcmVjdHJpeCBvbiB0aGUgZ3JhcGgnXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSAnRXF1YXRpb25zJyBjaGVja2JveC5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZUVxdWF0aW9uc0NoZWNrYm94KCBwcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sIHRhbmRlbTogVGFuZGVtICk6IEdRQ2hlY2tib3gge1xyXG4gICAgcmV0dXJuIG5ldyBHUUNoZWNrYm94KCBwcm9wZXJ0eSwge1xyXG4gICAgICBzdHJpbmc6IEdyYXBoaW5nUXVhZHJhdGljc1N0cmluZ3MuZXF1YXRpb25zU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnY2hlY2tib3ggdGhhdCBzaG93cyBlcXVhdGlvbnMgb24gZ3JhcGhlZCBjdXJ2ZXMnXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSAnRm9jdXMnIGNoZWNrYm94LCB3aXRoIGEgbWFuaXB1bGF0b3IgaWNvbi5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZUZvY3VzQ2hlY2tib3goIHByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPiwgdGFuZGVtOiBUYW5kZW0gKTogR1FDaGVja2JveCB7XHJcbiAgICByZXR1cm4gbmV3IEdRQ2hlY2tib3goIHByb3BlcnR5LCB7XHJcbiAgICAgIHN0cmluZzogR3JhcGhpbmdRdWFkcmF0aWNzU3RyaW5ncy5mb2N1c1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBpY29uOiBNYW5pcHVsYXRvci5jcmVhdGVJY29uKCA4LCBHUUNvbG9ycy5GT0NVUyApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ2NoZWNrYm94IHRoYXQgc2hvd3MgdGhlIGZvY3VzIG9uIHRoZSBncmFwaCdcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlICdQb2ludCBvbiBQYXJhYm9sYScgY2hlY2tib3gsIHdpdGggYSBtYW5pcHVsYXRvciBpY29uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlUG9pbnRPblBhcmFib2xhQ2hlY2tib3goIHByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPiwgdGFuZGVtOiBUYW5kZW0gKTogR1FDaGVja2JveCB7XHJcbiAgICByZXR1cm4gbmV3IEdRQ2hlY2tib3goIHByb3BlcnR5LCB7XHJcbiAgICAgIHN0cmluZzogR3JhcGhpbmdRdWFkcmF0aWNzU3RyaW5ncy5wb2ludE9uUGFyYWJvbGFTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgaWNvbjogTWFuaXB1bGF0b3IuY3JlYXRlSWNvbiggOCwgR1FDb2xvcnMuUE9JTlRfT05fUEFSQUJPTEEgKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdjaGVja2JveCB0aGF0IHNob3dzIHRoZSBwb2ludCBvbiB0aGUgcGFyYWJvbGEgb24gdGhlIGdyYXBoJ1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgJ1Jvb3RzJyBjaGVja2JveCwgd2l0aCBhIHBhaXIgb2YgZmxhdCBwb2ludHMgZm9yIHRoZSBpY29uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlUm9vdHNDaGVja2JveCggcHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LCB0YW5kZW06IFRhbmRlbSApOiBHUUNoZWNrYm94IHtcclxuXHJcbiAgICBjb25zdCBjaXJjbGVPcHRpb25zID0ge1xyXG4gICAgICByYWRpdXM6IDYsXHJcbiAgICAgIGZpbGw6IEdRQ29sb3JzLlJPT1RTXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGljb24gPSBuZXcgSEJveCgge1xyXG4gICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgIHNwYWNpbmc6IDUsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IENpcmNsZSggY2lyY2xlT3B0aW9ucyApLFxyXG4gICAgICAgIG5ldyBDaXJjbGUoIGNpcmNsZU9wdGlvbnMgKVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBHUUNoZWNrYm94KCBwcm9wZXJ0eSwge1xyXG4gICAgICBzdHJpbmc6IEdyYXBoaW5nUXVhZHJhdGljc1N0cmluZ3Mucm9vdHNTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgaWNvbjogaWNvbixcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdjaGVja2JveCB0aGF0IHNob3dzIHJvb3RzIG9uIHRoZSBncmFwaCdcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlICdWZXJ0ZXgnIGNoZWNrYm94LCB3aXRoIGEgZmxhdCBwb2ludCBmb3IgdGhlIGljb24uXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjcmVhdGVWZXJ0ZXhQb2ludENoZWNrYm94KCBwcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sIHRhbmRlbTogVGFuZGVtICk6IEdRQ2hlY2tib3gge1xyXG4gICAgcmV0dXJuIG5ldyBHUUNoZWNrYm94KCBwcm9wZXJ0eSwge1xyXG4gICAgICBzdHJpbmc6IEdyYXBoaW5nUXVhZHJhdGljc1N0cmluZ3MudmVydGV4U3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGljb246IG5ldyBDaXJjbGUoIDYsIHsgZmlsbDogR1FDb2xvcnMuVkVSVEVYIH0gKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdjaGVja2JveCB0aGF0IHNob3dzIHRoZSB2ZXJ0ZXggb24gdGhlIGdyYXBoJ1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgJ1ZlcnRleCcgY2hlY2tib3gsIHdpdGggYSBtYW5pcHVsYXRvciBpY29uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlVmVydGV4TWFuaXB1bGF0b3JDaGVja2JveCggcHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LCB0YW5kZW06IFRhbmRlbSApOiBHUUNoZWNrYm94IHtcclxuICAgIHJldHVybiBuZXcgR1FDaGVja2JveCggcHJvcGVydHksIHtcclxuICAgICAgc3RyaW5nOiBHcmFwaGluZ1F1YWRyYXRpY3NTdHJpbmdzLnZlcnRleFN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBpY29uOiBNYW5pcHVsYXRvci5jcmVhdGVJY29uKCA4LCBHUUNvbG9ycy5WRVJURVggKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdjaGVja2JveCB0aGF0IHNob3dzIHRoZSB2ZXJ0ZXggbWFuaXB1bGF0b3Igb24gdGhlIGdyYXBoJ1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZ3JhcGhpbmdRdWFkcmF0aWNzLnJlZ2lzdGVyKCAnR1FDaGVja2JveCcsIEdRQ2hlY2tib3ggKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLFNBQVMsTUFBTSx1Q0FBdUM7QUFHN0QsU0FBU0MsTUFBTSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBUUMsUUFBUSxRQUFnQixtQ0FBbUM7QUFDOUYsT0FBT0MsUUFBUSxNQUEyQixnQ0FBZ0M7QUFFMUUsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBQzVELE9BQU9DLFdBQVcsTUFBTSxtQkFBbUI7QUFDM0MsT0FBT0MseUJBQXlCLE1BQU0sb0NBQW9DO0FBQzFFLE9BQU9DLFFBQVEsTUFBTSxnQkFBZ0I7QUFDckMsT0FBT0MsU0FBUyxNQUFNLGlCQUFpQjtBQUN2QyxPQUFPQyxXQUFXLE1BQU0sNENBQTRDO0FBQ3BFLE9BQU9DLFdBQVcsTUFBTSxzRUFBc0U7QUFjOUYsZUFBZSxNQUFNQyxVQUFVLFNBQVNSLFFBQVEsQ0FBQztFQUVyQ1MsV0FBV0EsQ0FBRUMsZUFBa0MsRUFBRUMsZUFBa0MsRUFBRztJQUU5RixNQUFNQyxPQUFPLEdBQUdqQixTQUFTLENBQXNFLENBQUMsQ0FBRTtNQUVoRztNQUNBa0IsUUFBUSxFQUFFLE9BQU87TUFDakJDLFlBQVksRUFBRSxHQUFHO01BQUU7TUFDbkJDLElBQUksRUFBRWIsV0FBVyxDQUFDYztJQUNwQixDQUFDLEVBQUVMLGVBQWdCLENBQUM7SUFFcEIsTUFBTU0sSUFBSSxHQUFHLElBQUlsQixRQUFRLENBQUVhLE9BQU8sQ0FBQ00sTUFBTSxFQUFFO01BQ3pDQyxJQUFJLEVBQUVQLE9BQU8sQ0FBQ0MsUUFBUTtNQUN0QkUsSUFBSSxFQUFFSCxPQUFPLENBQUNHLElB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