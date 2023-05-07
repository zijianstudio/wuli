// Copyright 2018-2023, University of Colorado Boulder

/**
 * Displays 'NO REAL ROOTS', used when a quadratic has no real roots.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GraphingQuadraticsStrings from '../../GraphingQuadraticsStrings.js';

// const
const Y_OFFSET = 2; // min offset from vertex, determined empirically

export default class NoRealRootsNode extends Node {
  constructor(rootsVisibleProperty, vertexVisibleProperty, coordinatesVisibleProperty, quadraticProperty, modelViewTransform, tandem) {
    const options = {
      maxWidth: 200,
      // determined empirically
      tandem: tandem,
      phetioDocumentation: 'displays NO REAL ROOTS when the interactive quadratic has no real roots'
    };
    const textNode = new Text(GraphingQuadraticsStrings.noRealRoots, {
      font: GQConstants.NO_REAL_ROOTS_FONT,
      fill: 'white'
    });
    const backgroundNode = new Rectangle(textNode.bounds.dilatedXY(5, 1), {
      fill: GQColors.ROOTS,
      opacity: 0.75,
      cornerRadius: 4,
      center: textNode.center
    });
    options.children = [backgroundNode, textNode];

    // visibility of this Node
    options.visibleProperty = new DerivedProperty([rootsVisibleProperty, quadraticProperty], (rootsVisible, quadratic) => rootsVisible &&
    // the Roots checkbox is checked
    !!(quadratic.roots && quadratic.roots.length === 0),
    // the interactive quadratic has no roots
    {
      tandem: tandem.createTandem('visibleProperty'),
      phetioValueType: BooleanIO
    });
    super(options);

    // Part of the graph where 'NO REAL ROOTS' may overlap with vertex coordinates, when 'NO REAL ROOTS' is
    // typically centered at the origin. Width is based on maxWidth, height was determined empirically.
    // See https://github.com/phetsims/graphing-quadratics/issues/88
    const maxWidth = options.maxWidth;
    assert && assert(maxWidth !== null && maxWidth !== undefined);
    const vertexOverlapBounds = new Bounds2(modelViewTransform.viewToModelDeltaX(-0.6 * maxWidth), -Y_OFFSET, modelViewTransform.viewToModelDeltaX(0.6 * maxWidth), Y_OFFSET);

    // The center of this Node, typically at the origin, except when that would overlap the vertex's coordinates.
    // In that case, position above or below the x axis, depending on which way the parabola opens.
    // See https://github.com/phetsims/graphing-quadratics/issues/88
    const centerProperty = new DerivedProperty([vertexVisibleProperty, coordinatesVisibleProperty, quadraticProperty], (vertexVisible, coordinatesVisible, quadratic) => {
      if (vertexVisible &&
      // the Vertex checkbox is checked
      coordinatesVisible &&
      // the Coordinates checkbox is checked
      quadratic.roots && quadratic.roots.length === 0 &&
      // no roots
      // vertex is in a position where its coordinates will overlap
      quadratic.vertex && vertexOverlapBounds.containsPoint(quadratic.vertex)) {
        // center above or below the x axis, y offset determined empirically
        const y = quadratic.vertex.y + (quadratic.a > 0 ? -Y_OFFSET : Y_OFFSET);
        return modelViewTransform.modelToViewXY(0, y);
      } else {
        // center at the origin
        return modelViewTransform.modelToViewXY(0, 0);
      }
    });
    centerProperty.linkAttribute(this, 'center');
  }
}
graphingQuadratics.register('NoRealRootsNode', NoRealRootsNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJCb3VuZHMyIiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJCb29sZWFuSU8iLCJHUUNvbG9ycyIsIkdRQ29uc3RhbnRzIiwiZ3JhcGhpbmdRdWFkcmF0aWNzIiwiR3JhcGhpbmdRdWFkcmF0aWNzU3RyaW5ncyIsIllfT0ZGU0VUIiwiTm9SZWFsUm9vdHNOb2RlIiwiY29uc3RydWN0b3IiLCJyb290c1Zpc2libGVQcm9wZXJ0eSIsInZlcnRleFZpc2libGVQcm9wZXJ0eSIsImNvb3JkaW5hdGVzVmlzaWJsZVByb3BlcnR5IiwicXVhZHJhdGljUHJvcGVydHkiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJ0YW5kZW0iLCJvcHRpb25zIiwibWF4V2lkdGgiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwidGV4dE5vZGUiLCJub1JlYWxSb290cyIsImZvbnQiLCJOT19SRUFMX1JPT1RTX0ZPTlQiLCJmaWxsIiwiYmFja2dyb3VuZE5vZGUiLCJib3VuZHMiLCJkaWxhdGVkWFkiLCJST09UUyIsIm9wYWNpdHkiLCJjb3JuZXJSYWRpdXMiLCJjZW50ZXIiLCJjaGlsZHJlbiIsInZpc2libGVQcm9wZXJ0eSIsInJvb3RzVmlzaWJsZSIsInF1YWRyYXRpYyIsInJvb3RzIiwibGVuZ3RoIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvVmFsdWVUeXBlIiwiYXNzZXJ0IiwidW5kZWZpbmVkIiwidmVydGV4T3ZlcmxhcEJvdW5kcyIsInZpZXdUb01vZGVsRGVsdGFYIiwiY2VudGVyUHJvcGVydHkiLCJ2ZXJ0ZXhWaXNpYmxlIiwiY29vcmRpbmF0ZXNWaXNpYmxlIiwidmVydGV4IiwiY29udGFpbnNQb2ludCIsInkiLCJhIiwibW9kZWxUb1ZpZXdYWSIsImxpbmtBdHRyaWJ1dGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk5vUmVhbFJvb3RzTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEaXNwbGF5cyAnTk8gUkVBTCBST09UUycsIHVzZWQgd2hlbiBhIHF1YWRyYXRpYyBoYXMgbm8gcmVhbCByb290cy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgTm9kZU9wdGlvbnMsIFJlY3RhbmdsZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBCb29sZWFuSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0Jvb2xlYW5JTy5qcyc7XHJcbmltcG9ydCBHUUNvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vR1FDb2xvcnMuanMnO1xyXG5pbXBvcnQgR1FDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0dRQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFF1YWRyYXRpYyBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvUXVhZHJhdGljLmpzJztcclxuaW1wb3J0IGdyYXBoaW5nUXVhZHJhdGljcyBmcm9tICcuLi8uLi9ncmFwaGluZ1F1YWRyYXRpY3MuanMnO1xyXG5pbXBvcnQgR3JhcGhpbmdRdWFkcmF0aWNzU3RyaW5ncyBmcm9tICcuLi8uLi9HcmFwaGluZ1F1YWRyYXRpY3NTdHJpbmdzLmpzJztcclxuXHJcbi8vIGNvbnN0XHJcbmNvbnN0IFlfT0ZGU0VUID0gMjsgLy8gbWluIG9mZnNldCBmcm9tIHZlcnRleCwgZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTm9SZWFsUm9vdHNOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggcm9vdHNWaXNpYmxlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgdmVydGV4VmlzaWJsZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzVmlzaWJsZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgIHF1YWRyYXRpY1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxRdWFkcmF0aWM+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9uczogTm9kZU9wdGlvbnMgPSB7XHJcbiAgICAgIG1heFdpZHRoOiAyMDAsIC8vIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdkaXNwbGF5cyBOTyBSRUFMIFJPT1RTIHdoZW4gdGhlIGludGVyYWN0aXZlIHF1YWRyYXRpYyBoYXMgbm8gcmVhbCByb290cydcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgdGV4dE5vZGUgPSBuZXcgVGV4dCggR3JhcGhpbmdRdWFkcmF0aWNzU3RyaW5ncy5ub1JlYWxSb290cywge1xyXG4gICAgICBmb250OiBHUUNvbnN0YW50cy5OT19SRUFMX1JPT1RTX0ZPTlQsXHJcbiAgICAgIGZpbGw6ICd3aGl0ZSdcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kTm9kZSA9IG5ldyBSZWN0YW5nbGUoIHRleHROb2RlLmJvdW5kcy5kaWxhdGVkWFkoIDUsIDEgKSwge1xyXG4gICAgICBmaWxsOiBHUUNvbG9ycy5ST09UUyxcclxuICAgICAgb3BhY2l0eTogMC43NSxcclxuICAgICAgY29ybmVyUmFkaXVzOiA0LFxyXG4gICAgICBjZW50ZXI6IHRleHROb2RlLmNlbnRlclxyXG4gICAgfSApO1xyXG5cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIGJhY2tncm91bmROb2RlLCB0ZXh0Tm9kZSBdO1xyXG5cclxuICAgIC8vIHZpc2liaWxpdHkgb2YgdGhpcyBOb2RlXHJcbiAgICBvcHRpb25zLnZpc2libGVQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgcm9vdHNWaXNpYmxlUHJvcGVydHksIHF1YWRyYXRpY1Byb3BlcnR5IF0sXHJcbiAgICAgICggcm9vdHNWaXNpYmxlLCBxdWFkcmF0aWMgKSA9PlxyXG4gICAgICAgIHJvb3RzVmlzaWJsZSAmJiAvLyB0aGUgUm9vdHMgY2hlY2tib3ggaXMgY2hlY2tlZFxyXG4gICAgICAgICEhKCBxdWFkcmF0aWMucm9vdHMgJiYgcXVhZHJhdGljLnJvb3RzLmxlbmd0aCA9PT0gMCApLCAvLyB0aGUgaW50ZXJhY3RpdmUgcXVhZHJhdGljIGhhcyBubyByb290c1xyXG4gICAgICB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlzaWJsZVByb3BlcnR5JyApLFxyXG4gICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogQm9vbGVhbklPXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFBhcnQgb2YgdGhlIGdyYXBoIHdoZXJlICdOTyBSRUFMIFJPT1RTJyBtYXkgb3ZlcmxhcCB3aXRoIHZlcnRleCBjb29yZGluYXRlcywgd2hlbiAnTk8gUkVBTCBST09UUycgaXNcclxuICAgIC8vIHR5cGljYWxseSBjZW50ZXJlZCBhdCB0aGUgb3JpZ2luLiBXaWR0aCBpcyBiYXNlZCBvbiBtYXhXaWR0aCwgaGVpZ2h0IHdhcyBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5LlxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9ncmFwaGluZy1xdWFkcmF0aWNzL2lzc3Vlcy84OFxyXG4gICAgY29uc3QgbWF4V2lkdGggPSBvcHRpb25zLm1heFdpZHRoITtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1heFdpZHRoICE9PSBudWxsICYmIG1heFdpZHRoICE9PSB1bmRlZmluZWQgKTtcclxuICAgIGNvbnN0IHZlcnRleE92ZXJsYXBCb3VuZHMgPSBuZXcgQm91bmRzMihcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsRGVsdGFYKCAtMC42ICogbWF4V2lkdGggKSwgLVlfT0ZGU0VULFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxEZWx0YVgoIDAuNiAqIG1heFdpZHRoICksIFlfT0ZGU0VUICk7XHJcblxyXG4gICAgLy8gVGhlIGNlbnRlciBvZiB0aGlzIE5vZGUsIHR5cGljYWxseSBhdCB0aGUgb3JpZ2luLCBleGNlcHQgd2hlbiB0aGF0IHdvdWxkIG92ZXJsYXAgdGhlIHZlcnRleCdzIGNvb3JkaW5hdGVzLlxyXG4gICAgLy8gSW4gdGhhdCBjYXNlLCBwb3NpdGlvbiBhYm92ZSBvciBiZWxvdyB0aGUgeCBheGlzLCBkZXBlbmRpbmcgb24gd2hpY2ggd2F5IHRoZSBwYXJhYm9sYSBvcGVucy5cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ3JhcGhpbmctcXVhZHJhdGljcy9pc3N1ZXMvODhcclxuICAgIGNvbnN0IGNlbnRlclByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyB2ZXJ0ZXhWaXNpYmxlUHJvcGVydHksIGNvb3JkaW5hdGVzVmlzaWJsZVByb3BlcnR5LCBxdWFkcmF0aWNQcm9wZXJ0eSBdLFxyXG4gICAgICAoIHZlcnRleFZpc2libGUsIGNvb3JkaW5hdGVzVmlzaWJsZSwgcXVhZHJhdGljICkgPT4ge1xyXG4gICAgICAgIGlmICggdmVydGV4VmlzaWJsZSAmJiAvLyB0aGUgVmVydGV4IGNoZWNrYm94IGlzIGNoZWNrZWRcclxuICAgICAgICAgICAgIGNvb3JkaW5hdGVzVmlzaWJsZSAmJiAvLyB0aGUgQ29vcmRpbmF0ZXMgY2hlY2tib3ggaXMgY2hlY2tlZFxyXG4gICAgICAgICAgICAgKCBxdWFkcmF0aWMucm9vdHMgJiYgcXVhZHJhdGljLnJvb3RzLmxlbmd0aCA9PT0gMCApICYmIC8vIG5vIHJvb3RzXHJcbiAgICAgICAgICAgICAvLyB2ZXJ0ZXggaXMgaW4gYSBwb3NpdGlvbiB3aGVyZSBpdHMgY29vcmRpbmF0ZXMgd2lsbCBvdmVybGFwXHJcbiAgICAgICAgICAgICAoIHF1YWRyYXRpYy52ZXJ0ZXggJiYgdmVydGV4T3ZlcmxhcEJvdW5kcy5jb250YWluc1BvaW50KCBxdWFkcmF0aWMudmVydGV4ICkgKSApIHtcclxuICAgICAgICAgIC8vIGNlbnRlciBhYm92ZSBvciBiZWxvdyB0aGUgeCBheGlzLCB5IG9mZnNldCBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICAgICAgICBjb25zdCB5ID0gcXVhZHJhdGljLnZlcnRleC55ICsgKCBxdWFkcmF0aWMuYSA+IDAgPyAtWV9PRkZTRVQgOiBZX09GRlNFVCApO1xyXG4gICAgICAgICAgcmV0dXJuIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1hZKCAwLCB5ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgLy8gY2VudGVyIGF0IHRoZSBvcmlnaW5cclxuICAgICAgICAgIHJldHVybiBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYWSggMCwgMCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIGNlbnRlclByb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIHRoaXMsICdjZW50ZXInICk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmFwaGluZ1F1YWRyYXRpY3MucmVnaXN0ZXIoICdOb1JlYWxSb290c05vZGUnLCBOb1JlYWxSb290c05vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUVwRSxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBRW5ELFNBQVNDLElBQUksRUFBZUMsU0FBUyxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBRXRGLE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsT0FBT0MsUUFBUSxNQUFNLDBCQUEwQjtBQUMvQyxPQUFPQyxXQUFXLE1BQU0sNkJBQTZCO0FBRXJELE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUM1RCxPQUFPQyx5QkFBeUIsTUFBTSxvQ0FBb0M7O0FBRTFFO0FBQ0EsTUFBTUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDOztBQUVwQixlQUFlLE1BQU1DLGVBQWUsU0FBU1QsSUFBSSxDQUFDO0VBRXpDVSxXQUFXQSxDQUFFQyxvQkFBZ0QsRUFDaERDLHFCQUFpRCxFQUNqREMsMEJBQXNELEVBQ3REQyxpQkFBK0MsRUFDL0NDLGtCQUF1QyxFQUN2Q0MsTUFBYyxFQUFHO0lBRW5DLE1BQU1DLE9BQW9CLEdBQUc7TUFDM0JDLFFBQVEsRUFBRSxHQUFHO01BQUU7TUFDZkYsTUFBTSxFQUFFQSxNQUFNO01BQ2RHLG1CQUFtQixFQUFFO0lBQ3ZCLENBQUM7SUFFRCxNQUFNQyxRQUFRLEdBQUcsSUFBSWxCLElBQUksQ0FB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