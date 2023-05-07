// Copyright 2018-2023, University of Colorado Boulder

/**
 * Displays the roots of a quadratic as non-interactive points with coordinate labels.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { Node } from '../../../../scenery/js/imports.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import PointNode from './PointNode.js';

// constants
const COORDINATES_X_SPACING = 15; // between root point and its coordinates display

export default class RootsNode extends Node {
  constructor(quadraticProperty, graph, modelViewTransform, rootsVisibleProperty, coordinatesVisibleProperty, tandem) {
    const options = {
      tandem: tandem,
      phetioDocumentation: 'displays the roots of the interactive quadratic'
    };

    // {DerivedProperty.<Vector2|null>} coordinates for the quadratic's left root
    const leftCoordinatesProperty = new DerivedProperty([quadraticProperty], quadratic => {
      if (!quadratic.roots || quadratic.roots.length === 0) {
        // no roots
        return null;
      } else {
        return quadratic.roots[0];
      }
    }, {
      tandem: tandem.createTandem('leftCoordinatesProperty'),
      phetioValueType: NullableIO(Vector2.Vector2IO),
      phetioDocumentation: 'coordinates displayed on the left root, ' + 'identical to rightCoordinatesProperty if there is one root, ' + 'null if there are no roots or if all points are roots'
    });

    // {DerivedProperty.<Vector2|null>} coordinates for the quadratic's right root
    const rightCoordinatesProperty = new DerivedProperty([quadraticProperty], quadratic => {
      if (!quadratic.roots || quadratic.roots.length === 0) {
        // no roots
        return null;
      } else if (quadratic.roots.length === 1) {
        // 1 root, shared by leftCoordinatesProperty and rightCoordinatesProperty
        return quadratic.roots[0];
      } else {
        // 2 roots
        assert && assert(quadratic.roots.length === 2, `expected 2 roots, found ${quadratic.roots.length}`);
        return quadratic.roots[1];
      }
    }, {
      tandem: tandem.createTandem('rightCoordinatesProperty'),
      phetioValueType: NullableIO(Vector2.Vector2IO),
      phetioDocumentation: 'coordinates displayed on the right root, ' + 'identical to leftCoordinatesProperty if there is one root, ' + 'null if there are no roots or if all points are roots'
    });

    // options common to both PointNode instances
    const pointNodeOptions = {
      radius: modelViewTransform.modelToViewDeltaX(GQConstants.POINT_RADIUS),
      coordinatesForegroundColor: 'white',
      coordinatesBackgroundColor: GQColors.ROOTS,
      coordinatesDecimals: GQConstants.ROOTS_DECIMALS,
      x: modelViewTransform.modelToViewX(graph.xRange.getCenter()),
      y: modelViewTransform.modelToViewY(graph.yRange.getCenter())
    };

    // left root
    const leftRootNode = new PointNode(leftCoordinatesProperty, coordinatesVisibleProperty, combineOptions({}, pointNodeOptions, {
      // Coordinates to the left of the point
      layoutCoordinates: (coordinatesNode, pointNode) => {
        coordinatesNode.right = pointNode.left - COORDINATES_X_SPACING;
        coordinatesNode.centerY = pointNode.centerY;
      },
      tandem: tandem.createTandem('leftRootNode'),
      phetioDocumentation: 'the left root'
    }));

    // right root
    const rightRootNode = new PointNode(rightCoordinatesProperty, coordinatesVisibleProperty, combineOptions({}, pointNodeOptions, {
      // Coordinates to the right of the point
      layoutCoordinates: (coordinatesNode, pointNode) => {
        coordinatesNode.left = pointNode.right + COORDINATES_X_SPACING;
        coordinatesNode.centerY = pointNode.centerY;
      },
      tandem: tandem.createTandem('rightRootNode'),
      phetioDocumentation: 'the right root'
    }));
    options.children = [leftRootNode, rightRootNode];

    // visibility of this Node
    options.visibleProperty = new DerivedProperty([rootsVisibleProperty, quadraticProperty], (rootsVisible, quadratic) => rootsVisible &&
    // the Roots checkbox is checked
    !!quadratic.roots &&
    // it is not the case that all points on the quadratic are roots
    quadratic.roots.length !== 0,
    // there is at least one root
    {
      tandem: tandem.createTandem('visibleProperty'),
      phetioValueType: BooleanIO
    });
    super(options);
    quadraticProperty.link(quadratic => {
      // start with both roots invisible, make visible the ones that are needed
      leftRootNode.visible = false;
      rightRootNode.visible = false;
      const roots = quadratic.roots;
      if (roots && roots.length !== 0) {
        assert && assert(roots.length === 1 || roots.length === 2, `unexpected number of roots: ${roots.length}`);
        const leftRoot = roots[0];
        leftRootNode.translation = modelViewTransform.modelToViewPosition(leftRoot);
        leftRootNode.visible = graph.contains(leftRoot);
        if (roots.length === 2) {
          const rightRoot = roots[1];
          assert && assert(leftRoot.x < rightRoot.x, `unexpected order of roots: ${roots}`);
          rightRootNode.translation = modelViewTransform.modelToViewPosition(rightRoot);
          rightRootNode.visible = graph.contains(rightRoot);
        }
      }
    });
  }
}
graphingQuadratics.register('RootsNode', RootsNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJWZWN0b3IyIiwiY29tYmluZU9wdGlvbnMiLCJOb2RlIiwiQm9vbGVhbklPIiwiTnVsbGFibGVJTyIsIkdRQ29sb3JzIiwiR1FDb25zdGFudHMiLCJncmFwaGluZ1F1YWRyYXRpY3MiLCJQb2ludE5vZGUiLCJDT09SRElOQVRFU19YX1NQQUNJTkciLCJSb290c05vZGUiLCJjb25zdHJ1Y3RvciIsInF1YWRyYXRpY1Byb3BlcnR5IiwiZ3JhcGgiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJyb290c1Zpc2libGVQcm9wZXJ0eSIsImNvb3JkaW5hdGVzVmlzaWJsZVByb3BlcnR5IiwidGFuZGVtIiwib3B0aW9ucyIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJsZWZ0Q29vcmRpbmF0ZXNQcm9wZXJ0eSIsInF1YWRyYXRpYyIsInJvb3RzIiwibGVuZ3RoIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvVmFsdWVUeXBlIiwiVmVjdG9yMklPIiwicmlnaHRDb29yZGluYXRlc1Byb3BlcnR5IiwiYXNzZXJ0IiwicG9pbnROb2RlT3B0aW9ucyIsInJhZGl1cyIsIm1vZGVsVG9WaWV3RGVsdGFYIiwiUE9JTlRfUkFESVVTIiwiY29vcmRpbmF0ZXNGb3JlZ3JvdW5kQ29sb3IiLCJjb29yZGluYXRlc0JhY2tncm91bmRDb2xvciIsIlJPT1RTIiwiY29vcmRpbmF0ZXNEZWNpbWFscyIsIlJPT1RTX0RFQ0lNQUxTIiwieCIsIm1vZGVsVG9WaWV3WCIsInhSYW5nZSIsImdldENlbnRlciIsInkiLCJtb2RlbFRvVmlld1kiLCJ5UmFuZ2UiLCJsZWZ0Um9vdE5vZGUiLCJsYXlvdXRDb29yZGluYXRlcyIsImNvb3JkaW5hdGVzTm9kZSIsInBvaW50Tm9kZSIsInJpZ2h0IiwibGVmdCIsImNlbnRlclkiLCJyaWdodFJvb3ROb2RlIiwiY2hpbGRyZW4iLCJ2aXNpYmxlUHJvcGVydHkiLCJyb290c1Zpc2libGUiLCJsaW5rIiwidmlzaWJsZSIsImxlZnRSb290IiwidHJhbnNsYXRpb24iLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwiY29udGFpbnMiLCJyaWdodFJvb3QiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJvb3RzTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEaXNwbGF5cyB0aGUgcm9vdHMgb2YgYSBxdWFkcmF0aWMgYXMgbm9uLWludGVyYWN0aXZlIHBvaW50cyB3aXRoIGNvb3JkaW5hdGUgbGFiZWxzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IEdyYXBoIGZyb20gJy4uLy4uLy4uLy4uL2dyYXBoaW5nLWxpbmVzL2pzL2NvbW1vbi9tb2RlbC9HcmFwaC5qcyc7XHJcbmltcG9ydCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgTm9kZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQm9vbGVhbklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9Cb29sZWFuSU8uanMnO1xyXG5pbXBvcnQgTnVsbGFibGVJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVsbGFibGVJTy5qcyc7XHJcbmltcG9ydCBHUUNvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vR1FDb2xvcnMuanMnO1xyXG5pbXBvcnQgR1FDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0dRQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFF1YWRyYXRpYyBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvUXVhZHJhdGljLmpzJztcclxuaW1wb3J0IGdyYXBoaW5nUXVhZHJhdGljcyBmcm9tICcuLi8uLi9ncmFwaGluZ1F1YWRyYXRpY3MuanMnO1xyXG5pbXBvcnQgUG9pbnROb2RlLCB7IFBvaW50Tm9kZU9wdGlvbnMgfSBmcm9tICcuL1BvaW50Tm9kZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQ09PUkRJTkFURVNfWF9TUEFDSU5HID0gMTU7IC8vIGJldHdlZW4gcm9vdCBwb2ludCBhbmQgaXRzIGNvb3JkaW5hdGVzIGRpc3BsYXlcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvb3RzTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHF1YWRyYXRpY1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxRdWFkcmF0aWM+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhcGg6IEdyYXBoLCBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIsXHJcbiAgICAgICAgICAgICAgICAgICAgICByb290c1Zpc2libGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlc1Zpc2libGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zOiBOb2RlT3B0aW9ucyA9IHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdkaXNwbGF5cyB0aGUgcm9vdHMgb2YgdGhlIGludGVyYWN0aXZlIHF1YWRyYXRpYydcclxuICAgIH07XHJcblxyXG4gICAgLy8ge0Rlcml2ZWRQcm9wZXJ0eS48VmVjdG9yMnxudWxsPn0gY29vcmRpbmF0ZXMgZm9yIHRoZSBxdWFkcmF0aWMncyBsZWZ0IHJvb3RcclxuICAgIGNvbnN0IGxlZnRDb29yZGluYXRlc1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBxdWFkcmF0aWNQcm9wZXJ0eSBdLFxyXG4gICAgICBxdWFkcmF0aWMgPT4ge1xyXG4gICAgICAgIGlmICggIXF1YWRyYXRpYy5yb290cyB8fCBxdWFkcmF0aWMucm9vdHMubGVuZ3RoID09PSAwICkge1xyXG5cclxuICAgICAgICAgIC8vIG5vIHJvb3RzXHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gcXVhZHJhdGljLnJvb3RzWyAwIF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGVmdENvb3JkaW5hdGVzUHJvcGVydHknICksXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdWxsYWJsZUlPKCBWZWN0b3IyLlZlY3RvcjJJTyApLFxyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdjb29yZGluYXRlcyBkaXNwbGF5ZWQgb24gdGhlIGxlZnQgcm9vdCwgJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lkZW50aWNhbCB0byByaWdodENvb3JkaW5hdGVzUHJvcGVydHkgaWYgdGhlcmUgaXMgb25lIHJvb3QsICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICdudWxsIGlmIHRoZXJlIGFyZSBubyByb290cyBvciBpZiBhbGwgcG9pbnRzIGFyZSByb290cydcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIHtEZXJpdmVkUHJvcGVydHkuPFZlY3RvcjJ8bnVsbD59IGNvb3JkaW5hdGVzIGZvciB0aGUgcXVhZHJhdGljJ3MgcmlnaHQgcm9vdFxyXG4gICAgY29uc3QgcmlnaHRDb29yZGluYXRlc1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBxdWFkcmF0aWNQcm9wZXJ0eSBdLFxyXG4gICAgICBxdWFkcmF0aWMgPT4ge1xyXG4gICAgICAgIGlmICggIXF1YWRyYXRpYy5yb290cyB8fCBxdWFkcmF0aWMucm9vdHMubGVuZ3RoID09PSAwICkge1xyXG5cclxuICAgICAgICAgIC8vIG5vIHJvb3RzXHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIHF1YWRyYXRpYy5yb290cy5sZW5ndGggPT09IDEgKSB7XHJcblxyXG4gICAgICAgICAgLy8gMSByb290LCBzaGFyZWQgYnkgbGVmdENvb3JkaW5hdGVzUHJvcGVydHkgYW5kIHJpZ2h0Q29vcmRpbmF0ZXNQcm9wZXJ0eVxyXG4gICAgICAgICAgcmV0dXJuIHF1YWRyYXRpYy5yb290c1sgMCBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyAyIHJvb3RzXHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBxdWFkcmF0aWMucm9vdHMubGVuZ3RoID09PSAyLCBgZXhwZWN0ZWQgMiByb290cywgZm91bmQgJHtxdWFkcmF0aWMucm9vdHMubGVuZ3RofWAgKTtcclxuICAgICAgICAgIHJldHVybiBxdWFkcmF0aWMucm9vdHNbIDEgXTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyaWdodENvb3JkaW5hdGVzUHJvcGVydHknICksXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdWxsYWJsZUlPKCBWZWN0b3IyLlZlY3RvcjJJTyApLFxyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdjb29yZGluYXRlcyBkaXNwbGF5ZWQgb24gdGhlIHJpZ2h0IHJvb3QsICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpZGVudGljYWwgdG8gbGVmdENvb3JkaW5hdGVzUHJvcGVydHkgaWYgdGhlcmUgaXMgb25lIHJvb3QsICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICdudWxsIGlmIHRoZXJlIGFyZSBubyByb290cyBvciBpZiBhbGwgcG9pbnRzIGFyZSByb290cydcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIG9wdGlvbnMgY29tbW9uIHRvIGJvdGggUG9pbnROb2RlIGluc3RhbmNlc1xyXG4gICAgY29uc3QgcG9pbnROb2RlT3B0aW9ucyA9IHtcclxuICAgICAgcmFkaXVzOiBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVgoIEdRQ29uc3RhbnRzLlBPSU5UX1JBRElVUyApLFxyXG4gICAgICBjb29yZGluYXRlc0ZvcmVncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgY29vcmRpbmF0ZXNCYWNrZ3JvdW5kQ29sb3I6IEdRQ29sb3JzLlJPT1RTLFxyXG4gICAgICBjb29yZGluYXRlc0RlY2ltYWxzOiBHUUNvbnN0YW50cy5ST09UU19ERUNJTUFMUyxcclxuICAgICAgeDogbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggZ3JhcGgueFJhbmdlLmdldENlbnRlcigpICksXHJcbiAgICAgIHk6IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIGdyYXBoLnlSYW5nZS5nZXRDZW50ZXIoKSApXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGxlZnQgcm9vdFxyXG4gICAgY29uc3QgbGVmdFJvb3ROb2RlID0gbmV3IFBvaW50Tm9kZSggbGVmdENvb3JkaW5hdGVzUHJvcGVydHksIGNvb3JkaW5hdGVzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICBjb21iaW5lT3B0aW9uczxQb2ludE5vZGVPcHRpb25zPigge30sIHBvaW50Tm9kZU9wdGlvbnMsIHtcclxuXHJcbiAgICAgICAgLy8gQ29vcmRpbmF0ZXMgdG8gdGhlIGxlZnQgb2YgdGhlIHBvaW50XHJcbiAgICAgICAgbGF5b3V0Q29vcmRpbmF0ZXM6ICggY29vcmRpbmF0ZXNOb2RlLCBwb2ludE5vZGUgKSA9PiB7XHJcbiAgICAgICAgICBjb29yZGluYXRlc05vZGUucmlnaHQgPSBwb2ludE5vZGUubGVmdCAtIENPT1JESU5BVEVTX1hfU1BBQ0lORztcclxuICAgICAgICAgIGNvb3JkaW5hdGVzTm9kZS5jZW50ZXJZID0gcG9pbnROb2RlLmNlbnRlclk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsZWZ0Um9vdE5vZGUnICksXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBsZWZ0IHJvb3QnXHJcbiAgICAgIH0gKSApO1xyXG5cclxuICAgIC8vIHJpZ2h0IHJvb3RcclxuICAgIGNvbnN0IHJpZ2h0Um9vdE5vZGUgPSBuZXcgUG9pbnROb2RlKCByaWdodENvb3JkaW5hdGVzUHJvcGVydHksIGNvb3JkaW5hdGVzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICBjb21iaW5lT3B0aW9uczxQb2ludE5vZGVPcHRpb25zPigge30sIHBvaW50Tm9kZU9wdGlvbnMsIHtcclxuXHJcbiAgICAgICAgLy8gQ29vcmRpbmF0ZXMgdG8gdGhlIHJpZ2h0IG9mIHRoZSBwb2ludFxyXG4gICAgICAgIGxheW91dENvb3JkaW5hdGVzOiAoIGNvb3JkaW5hdGVzTm9kZSwgcG9pbnROb2RlICkgPT4ge1xyXG4gICAgICAgICAgY29vcmRpbmF0ZXNOb2RlLmxlZnQgPSBwb2ludE5vZGUucmlnaHQgKyBDT09SRElOQVRFU19YX1NQQUNJTkc7XHJcbiAgICAgICAgICBjb29yZGluYXRlc05vZGUuY2VudGVyWSA9IHBvaW50Tm9kZS5jZW50ZXJZO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmlnaHRSb290Tm9kZScgKSxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndGhlIHJpZ2h0IHJvb3QnXHJcbiAgICAgIH0gKSApO1xyXG5cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIGxlZnRSb290Tm9kZSwgcmlnaHRSb290Tm9kZSBdO1xyXG5cclxuICAgIC8vIHZpc2liaWxpdHkgb2YgdGhpcyBOb2RlXHJcbiAgICBvcHRpb25zLnZpc2libGVQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgcm9vdHNWaXNpYmxlUHJvcGVydHksIHF1YWRyYXRpY1Byb3BlcnR5IF0sXHJcbiAgICAgICggcm9vdHNWaXNpYmxlLCBxdWFkcmF0aWMgKSA9PlxyXG4gICAgICAgIHJvb3RzVmlzaWJsZSAmJiAgLy8gdGhlIFJvb3RzIGNoZWNrYm94IGlzIGNoZWNrZWRcclxuICAgICAgICAhIXF1YWRyYXRpYy5yb290cyAmJiAvLyBpdCBpcyBub3QgdGhlIGNhc2UgdGhhdCBhbGwgcG9pbnRzIG9uIHRoZSBxdWFkcmF0aWMgYXJlIHJvb3RzXHJcbiAgICAgICAgcXVhZHJhdGljLnJvb3RzLmxlbmd0aCAhPT0gMCwgLy8gdGhlcmUgaXMgYXQgbGVhc3Qgb25lIHJvb3RcclxuICAgICAge1xyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Zpc2libGVQcm9wZXJ0eScgKSxcclxuICAgICAgICBwaGV0aW9WYWx1ZVR5cGU6IEJvb2xlYW5JT1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICBxdWFkcmF0aWNQcm9wZXJ0eS5saW5rKCBxdWFkcmF0aWMgPT4ge1xyXG5cclxuICAgICAgLy8gc3RhcnQgd2l0aCBib3RoIHJvb3RzIGludmlzaWJsZSwgbWFrZSB2aXNpYmxlIHRoZSBvbmVzIHRoYXQgYXJlIG5lZWRlZFxyXG4gICAgICBsZWZ0Um9vdE5vZGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICByaWdodFJvb3ROb2RlLnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgICAgIGNvbnN0IHJvb3RzID0gcXVhZHJhdGljLnJvb3RzO1xyXG5cclxuICAgICAgaWYgKCByb290cyAmJiByb290cy5sZW5ndGggIT09IDAgKSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcm9vdHMubGVuZ3RoID09PSAxIHx8IHJvb3RzLmxlbmd0aCA9PT0gMiwgYHVuZXhwZWN0ZWQgbnVtYmVyIG9mIHJvb3RzOiAke3Jvb3RzLmxlbmd0aH1gICk7XHJcblxyXG4gICAgICAgIGNvbnN0IGxlZnRSb290ID0gcm9vdHNbIDAgXTtcclxuICAgICAgICBsZWZ0Um9vdE5vZGUudHJhbnNsYXRpb24gPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggbGVmdFJvb3QgKTtcclxuICAgICAgICBsZWZ0Um9vdE5vZGUudmlzaWJsZSA9IGdyYXBoLmNvbnRhaW5zKCBsZWZ0Um9vdCApO1xyXG5cclxuICAgICAgICBpZiAoIHJvb3RzLmxlbmd0aCA9PT0gMiApIHtcclxuICAgICAgICAgIGNvbnN0IHJpZ2h0Um9vdCA9IHJvb3RzWyAxIF07XHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsZWZ0Um9vdC54IDwgcmlnaHRSb290LngsIGB1bmV4cGVjdGVkIG9yZGVyIG9mIHJvb3RzOiAke3Jvb3RzfWAgKTtcclxuICAgICAgICAgIHJpZ2h0Um9vdE5vZGUudHJhbnNsYXRpb24gPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggcmlnaHRSb290ICk7XHJcbiAgICAgICAgICByaWdodFJvb3ROb2RlLnZpc2libGUgPSBncmFwaC5jb250YWlucyggcmlnaHRSb290ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmFwaGluZ1F1YWRyYXRpY3MucmVnaXN0ZXIoICdSb290c05vZGUnLCBSb290c05vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUVwRSxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBRW5ELFNBQVNDLGNBQWMsUUFBUSx1Q0FBdUM7QUFFdEUsU0FBU0MsSUFBSSxRQUFxQixtQ0FBbUM7QUFFckUsT0FBT0MsU0FBUyxNQUFNLDBDQUEwQztBQUNoRSxPQUFPQyxVQUFVLE1BQU0sMkNBQTJDO0FBQ2xFLE9BQU9DLFFBQVEsTUFBTSwwQkFBMEI7QUFDL0MsT0FBT0MsV0FBVyxNQUFNLDZCQUE2QjtBQUVyRCxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0MsU0FBUyxNQUE0QixnQkFBZ0I7O0FBRTVEO0FBQ0EsTUFBTUMscUJBQXFCLEdBQUcsRUFBRSxDQUFDLENBQUM7O0FBRWxDLGVBQWUsTUFBTUMsU0FBUyxTQUFTUixJQUFJLENBQUM7RUFFbkNTLFdBQVdBLENBQUVDLGlCQUErQyxFQUMvQ0MsS0FBWSxFQUFFQyxrQkFBdUMsRUFDckRDLG9CQUFnRCxFQUNoREMsMEJBQXNELEVBQ3REQyxNQUFjLEVBQUc7SUFFbkMsTUFBTUMsT0FBb0IsR0FBRztNQUMzQkQsTUFBTSxFQUFFQSxNQUFNO01BQ2RFLG1CQUFtQixFQUFFO0lBQ3ZCLENBQUM7O0lBRUQ7SUFDQSxNQUFNQyx1QkFBdUIsR0FBRyxJQUFJckIsZUFBZSxDQUFFLENBQUVhLGlCQUFpQixDQUFFLEVBQ3hFUyxTQUFTLElBQUk7TUFDWCxJQUFLLENBQUNBLFNBQVMsQ0FBQ0MsS0FBSyxJQUFJRCxTQUFTLENBQUNDLEtBQUssQ0FBQ0MsTUFBTSxLQUFLLENBQUMsRUFBRztRQUV0RDtRQUNBLE9BQU8sSUFBSTtNQUNiLENBQUMsTUFDSTtRQUNILE9BQU9GLFNBQVMsQ0FBQ0MsS0FBSyxDQUFFLENBQUMsQ0FBRTtNQUM3QjtJQUNGLENBQUMsRUFBRTtNQUNETCxNQUFNLEVBQUVBLE1BQU0sQ0FBQ08sWUFBWSxDQUFFLHlCQUEwQixDQUFDO01BQ3hEQyxlQUFlLEVBQUVyQixVQUFVLENBQUVKLE9BQU8sQ0FBQzBCLFNBQVUsQ0FBQztNQUNoRFAsbUJBQW1CLEVBQUUsMENBQTBDLEdBQzFDLDhEQUE4RCxHQUM5RDtJQUN2QixDQUFFLENBQUM7O0lBRUw7SUFDQSxNQUFNUSx3QkFBd0IsR0FBRyxJQUFJNUIsZUFBZSxDQUFFLENBQUVhLGlCQUFpQixDQUFFLEVBQ3pFUyxTQUFTLElBQUk7TUFDWCxJQUFLLENBQUNBLFNBQVMsQ0FBQ0MsS0FBSyxJQUFJRCxTQUFTLENBQUNDLEtBQUssQ0FBQ0MsTUFBTSxLQUFLLENBQUMsRUFBRztRQUV0RDtRQUNBLE9BQU8sSUFBSTtNQUNiLENBQUMsTUFDSSxJQUFLRixTQUFTLENBQUNDLEtBQUssQ0FBQ0MsTUFBTSxLQUFLLENBQUMsRUFBRztRQUV2QztRQUNBLE9BQU9GLFNBQVMsQ0FBQ0MsS0FBSyxDQUFFLENBQUMsQ0FBRTtNQUM3QixDQUFDLE1BQ0k7UUFFSDtRQUNBTSxNQUFNLElBQUlBLE1BQU0sQ0FBRVAsU0FBUyxDQUFDQyxLQUFLLENBQUNDLE1BQU0sS0FBSyxDQUFDLEVBQUcsMkJBQTBCRixTQUFTLENBQUNDLEtBQUssQ0FBQ0MsTUFBTyxFQUFFLENBQUM7UUFDckcsT0FBT0YsU0FBUyxDQUFDQyxLQUFLLENBQUUsQ0FBQyxDQUFFO01BQzdCO0lBQ0YsQ0FBQyxFQUFFO01BQ0RMLE1BQU0sRUFBRUEsTUFBTSxDQUFDTyxZQUFZLENBQUUsMEJBQTJCLENBQUM7TUFDekRDLGVBQWUsRUFBRXJCLFVBQVUsQ0FBRUosT0FBTyxDQUFDMEIsU0FBVSxDQUFDO01BQ2hEUCxtQkFBbUIsRUFBRSwyQ0FBMkMsR0FDM0MsNkRBQTZELEdBQzdEO0lBQ3ZCLENBQUUsQ0FBQzs7SUFFTDtJQUNBLE1BQU1VLGdCQUFnQixHQUFHO01BQ3ZCQyxNQUFNLEVBQUVoQixrQkFBa0IsQ0FBQ2lCLGlCQUFpQixDQUFFekIsV0FBVyxDQUFDMEIsWUFBYSxDQUFDO01BQ3hFQywwQkFBMEIsRUFBRSxPQUFPO01BQ25DQywwQkFBMEIsRUFBRTdCLFFBQVEsQ0FBQzhCLEtBQUs7TUFDMUNDLG1CQUFtQixFQUFFOUIsV0FBVyxDQUFDK0IsY0FBYztNQUMvQ0MsQ0FBQyxFQUFFeEIsa0JBQWtCLENBQUN5QixZQUFZLENBQUUxQixLQUFLLENBQUMyQixNQUFNLENBQUNDLFNBQVMsQ0FBQyxDQUFFLENBQUM7TUFDOURDLENBQUMsRUFBRTVCLGtCQUFrQixDQUFDNkIsWUFBWSxDQUFFOUIsS0FBSyxDQUFDK0IsTUFBTSxDQUFDSCxTQUFTLENBQUMsQ0FBRTtJQUMvRCxDQUFDOztJQUVEO0lBQ0EsTUFBTUksWUFBWSxHQUFHLElBQUlyQyxTQUFTLENBQUVZLHVCQUF1QixFQUFFSiwwQkFBMEIsRUFDckZmLGNBQWMsQ0FBb0IsQ0FBQyxDQUFDLEVBQUU0QixnQkFBZ0IsRUFBRTtNQUV0RDtNQUNBaUIsaUJBQWlCLEVBQUVBLENBQUVDLGVBQWUsRUFBRUMsU0FBUyxLQUFNO1FBQ25ERCxlQUFlLENBQUNFLEtBQUssR0FBR0QsU0FBUyxDQUFDRSxJQUFJLEdBQUd6QyxxQkFBcUI7UUFDOURzQyxlQUFlLENBQUNJLE9BQU8sR0FBR0gsU0FBUyxDQUFDRyxPQUFPO01BQzdDLENBQUM7TUFDRGxDLE1BQU0sRUFBRUEsTUFBTSxDQUFDTyxZQUFZLENBQUUsY0FBZSxDQUFDO01BQzdDTCxtQkFBbUIsRUFBRTtJQUN2QixDQUFFLENBQUUsQ0FBQzs7SUFFUDtJQUNBLE1BQU1pQyxhQUFhLEdBQUcsSUFBSTVDLFNBQVMsQ0FBRW1CLHdCQUF3QixFQUFFWCwwQkFBMEIsRUFDdkZmLGNBQWMsQ0FBb0IsQ0FBQyxDQUFDLEVBQUU0QixnQkFBZ0IsRUFBRTtNQUV0RDtNQUNBaUIsaUJBQWlCLEVBQUVBLENBQUVDLGVBQWUsRUFBRUMsU0FBUyxLQUFNO1FBQ25ERCxlQUFlLENBQUNHLElBQUksR0FBR0YsU0FBUyxDQUFDQyxLQUFLLEdBQUd4QyxxQkFBcUI7UUFDOURzQyxlQUFlLENBQUNJLE9BQU8sR0FBR0gsU0FBUyxDQUFDRyxPQUFPO01BQzdDLENBQUM7TUFDRGxDLE1BQU0sRUFBRUEsTUFBTSxDQUFDTyxZQUFZLENBQUUsZUFBZ0IsQ0FBQztNQUM5Q0wsbUJBQW1CLEVBQUU7SUFDdkIsQ0FBRSxDQUFFLENBQUM7SUFFUEQsT0FBTyxDQUFDbUMsUUFBUSxHQUFHLENBQUVSLFlBQVksRUFBRU8sYUFBYSxDQUFFOztJQUVsRDtJQUNBbEMsT0FBTyxDQUFDb0MsZUFBZSxHQUFHLElBQUl2RCxlQUFlLENBQzNDLENBQUVnQixvQkFBb0IsRUFBRUgsaUJBQWlCLENBQUUsRUFDM0MsQ0FBRTJDLFlBQVksRUFBRWxDLFNBQVMsS0FDdkJrQyxZQUFZO0lBQUs7SUFDakIsQ0FBQyxDQUFDbEMsU0FBUyxDQUFDQyxLQUFLO0lBQUk7SUFDckJELFNBQVMsQ0FBQ0MsS0FBSyxDQUFDQyxNQUFNLEtBQUssQ0FBQztJQUFFO0lBQ2hDO01BQ0VOLE1BQU0sRUFBRUEsTUFBTSxDQUFDTyxZQUFZLENBQUUsaUJBQWtCLENBQUM7TUFDaERDLGVBQWUsRUFBRXRCO0lBQ25CLENBQUUsQ0FBQztJQUVMLEtBQUssQ0FBRWUsT0FBUSxDQUFDO0lBRWhCTixpQkFBaUIsQ0FBQzRDLElBQUksQ0FBRW5DLFNBQVMsSUFBSTtNQUVuQztNQUNBd0IsWUFBWSxDQUFDWSxPQUFPLEdBQUcsS0FBSztNQUM1QkwsYUFBYSxDQUFDSyxPQUFPLEdBQUcsS0FBSztNQUU3QixNQUFNbkMsS0FBSyxHQUFHRCxTQUFTLENBQUNDLEtBQUs7TUFFN0IsSUFBS0EsS0FBSyxJQUFJQSxLQUFLLENBQUNDLE1BQU0sS0FBSyxDQUFDLEVBQUc7UUFDakNLLE1BQU0sSUFBSUEsTUFBTSxDQUFFTixLQUFLLENBQUNDLE1BQU0sS0FBSyxDQUFDLElBQUlELEtBQUssQ0FBQ0MsTUFBTSxLQUFLLENBQUMsRUFBRywrQkFBOEJELEtBQUssQ0FBQ0MsTUFBTyxFQUFFLENBQUM7UUFFM0csTUFBTW1DLFFBQVEsR0FBR3BDLEtBQUssQ0FBRSxDQUFDLENBQUU7UUFDM0J1QixZQUFZLENBQUNjLFdBQVcsR0FBRzdDLGtCQUFrQixDQUFDOEMsbUJBQW1CLENBQUVGLFFBQVMsQ0FBQztRQUM3RWIsWUFBWSxDQUFDWSxPQUFPLEdBQUc1QyxLQUFLLENBQUNnRCxRQUFRLENBQUVILFFBQVMsQ0FBQztRQUVqRCxJQUFLcEMsS0FBSyxDQUFDQyxNQUFNLEtBQUssQ0FBQyxFQUFHO1VBQ3hCLE1BQU11QyxTQUFTLEdBQUd4QyxLQUFLLENBQUUsQ0FBQyxDQUFFO1VBQzVCTSxNQUFNLElBQUlBLE1BQU0sQ0FBRThCLFFBQVEsQ0FBQ3BCLENBQUMsR0FBR3dCLFNBQVMsQ0FBQ3hCLENBQUMsRUFBRyw4QkFBNkJoQixLQUFNLEVBQUUsQ0FBQztVQUNuRjhCLGFBQWEsQ0FBQ08sV0FBVyxHQUFHN0Msa0JBQWtCLENBQUM4QyxtQkFBbUIsQ0FBRUUsU0FBVSxDQUFDO1VBQy9FVixhQUFhLENBQUNLLE9BQU8sR0FBRzVDLEtBQUssQ0FBQ2dELFFBQVEsQ0FBRUMsU0FBVSxDQUFDO1FBQ3JEO01BQ0Y7SUFDRixDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUF2RCxrQkFBa0IsQ0FBQ3dELFFBQVEsQ0FBRSxXQUFXLEVBQUVyRCxTQUFVLENBQUMifQ==