// Copyright 2015-2022, University of Colorado Boulder

/**
 * ProbeNode is a physical-looking probe with a handle and a circular sensor region. It is used in simulations like
 * Bending Light and Beer's Law Lab to show how much light is being received. It is typically connected to a body
 * with readouts via a wire. The origin is in the center of the sensor.
 *
 * This code was generalized from Bending Light, see https://github.com/phetsims/bending-light/issues/165
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Ray2 from '../../dot/js/Ray2.js';
import Vector2 from '../../dot/js/Vector2.js';
import { EllipticalArc, Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { optionize3 } from '../../phet-core/js/optionize.js';
import { Circle, Line, LinearGradient, Node, PaintColorProperty, Path, RadialGradient } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';

// options for ProbeNode.glass

// options for ProbeNode.crosshairs

// type of SelfOptions.sensorTypeFunction

// options that are specific to ProbeNode

const DEFAULT_OPTIONS = {
  radius: 50,
  innerRadius: 35,
  handleWidth: 50,
  handleHeight: 30,
  handleCornerRadius: 10,
  lightAngle: 1.35 * Math.PI,
  color: '#008541',
  // darkish green
  sensorTypeFunction: glass()
};
assert && Object.freeze(DEFAULT_OPTIONS);
export default class ProbeNode extends Node {
  // Colors used to create gradients

  static DEFAULT_PROBE_NODE_OPTIONS = DEFAULT_OPTIONS;
  static glass = glass;
  static crosshairs = crosshairs;
  constructor(providedOptions) {
    const options = optionize3()({}, DEFAULT_OPTIONS, providedOptions);
    super();

    // To improve readability
    const radius = options.radius;

    // y coordinate of the bottom of the handle, relative to the origin (center of the sensor)
    const handleBottom = radius + options.handleHeight;

    // Constants that determine the outer Shape of the probe
    const arcExtent = 0.8;
    const handleWidth = options.handleWidth;
    const innerRadius = Math.min(options.innerRadius, options.radius);
    const cornerRadius = options.handleCornerRadius;
    const neckCornerRadius = 10;

    // We must know where the elliptical arc begins, so create an explicit EllipticalArc for that
    // Note: This elliptical arc must match the ellipticalArc call below
    const ellipticalArcStart = new EllipticalArc(new Vector2(0, 0), radius, radius, 0, Math.PI * arcExtent, Math.PI * (1 - arcExtent), false).start;

    // Creates the Shape for the outside edge of the probe, circular at top with handle at the bottom.
    function createOuterProbeShape() {
      return new Shape()

      // start in the bottom center
      .moveTo(0, handleBottom)

      // Kite Shape automatically lineTo's to the first point of an arc, so no need to lineTo ourselves
      .arc(-handleWidth / 2 + cornerRadius, handleBottom - cornerRadius, cornerRadius, Math.PI / 2, Math.PI, false).lineTo(-handleWidth / 2, radius + neckCornerRadius).quadraticCurveTo(-handleWidth / 2, radius, ellipticalArcStart.x, ellipticalArcStart.y)

      // Top arc
      // Note: his elliptical arc must match the EllipticalArc above
      .ellipticalArc(0, 0, radius, radius, 0, Math.PI * arcExtent, Math.PI * (1 - arcExtent), false).quadraticCurveTo(handleWidth / 2, radius, +handleWidth / 2, radius + neckCornerRadius).arc(handleWidth / 2 - cornerRadius, handleBottom - cornerRadius, cornerRadius, 0, Math.PI / 2, false).close();
    }

    // Start with the outer Shape of the probe, and cut out the sensor area.
    const probeShape = createOuterProbeShape().moveTo(innerRadius, 0).arc(0, 0, innerRadius, Math.PI * 2, 0, true).close();

    // The light angle is variable so that you can create a probe node that is pointing up or to the side
    const lightAngle = options.lightAngle;
    const center = probeShape.bounds.center;
    const v1 = Vector2.createPolar(1, lightAngle);
    const intersections = probeShape.intersection(new Ray2(center, v1));

    // take last intersection or zero point, see https://github.com/phetsims/scenery-phet/issues/294
    const lastIntersection = intersections[intersections.length - 1];
    const lastIntersectionPoint = lastIntersection ? lastIntersection.point : Vector2.ZERO;
    const gradientSource = lastIntersectionPoint.plus(v1.timesScalar(1));
    const v2 = Vector2.createPolar(1, lightAngle + Math.PI);
    const intersections2 = probeShape.intersection(new Ray2(center, v2));

    // take last intersection or zero point, see https://github.com/phetsims/scenery-phet/issues/294
    const lastIntersection2 = intersections2[intersections2.length - 1];
    const lastIntersectionPoint2 = lastIntersection2 ? lastIntersection2.point : Vector2.ZERO;
    const gradientDestination = lastIntersectionPoint2.plus(v2.timesScalar(1));
    this.brighter5Property = new PaintColorProperty(options.color, {
      luminanceFactor: 0.5
    });
    this.brighter4Property = new PaintColorProperty(options.color, {
      luminanceFactor: 0.4
    });
    this.brighter3Property = new PaintColorProperty(options.color, {
      luminanceFactor: 0.3
    });
    this.brighter2Property = new PaintColorProperty(options.color, {
      luminanceFactor: 0.2
    });
    this.darker2Property = new PaintColorProperty(options.color, {
      luminanceFactor: -0.2
    });
    this.darker3Property = new PaintColorProperty(options.color, {
      luminanceFactor: -0.3
    });

    // The main path of the probe
    const mainPath = new Path(probeShape, {
      stroke: new LinearGradient(gradientSource.x, gradientSource.y, gradientDestination.x, gradientDestination.y).addColorStop(0.0, this.brighter2Property) // highlight
      .addColorStop(1.0, this.darker2Property),
      // shadow
      fill: new LinearGradient(gradientSource.x, gradientSource.y, gradientDestination.x, gradientDestination.y).addColorStop(0.0, this.brighter5Property) // highlight
      .addColorStop(0.03, this.brighter4Property).addColorStop(0.07, this.brighter4Property).addColorStop(0.11, this.brighter2Property).addColorStop(0.3, options.color).addColorStop(0.8, this.darker2Property) // shadows
      .addColorStop(1.0, this.darker3Property),
      lineWidth: 2
    });

    // The front flat "surface" of the probe, makes it look 3d by giving the probe a beveled appearance and putting
    // a shiny glare on the top edge.
    const frontPath = new Path(probeShape, {
      fill: options.color,
      // y scale is an empirical function of handle height, to keep bevel at bottom of handle from changing size
      scale: new Vector2(0.9, 0.93 + 0.01 * options.handleHeight / DEFAULT_OPTIONS.handleHeight),
      centerX: mainPath.centerX,
      stroke: new DerivedProperty([this.brighter3Property], color => {
        return color.withAlpha(0.5);
      }),
      lineWidth: 1.2,
      y: 2 // Shift it down a bit to make the face look a bit more 3d
    });

    const children = [];
    if (options.sensorTypeFunction) {
      children.push(options.sensorTypeFunction(radius));
    }
    children.push(mainPath, frontPath);

    // Allow the client to add child nodes
    options.children = children.concat(options.children || []);

    // Allow the client to override mouse and touch area, but fall back to the outline
    const outline = createOuterProbeShape();
    options.mouseArea = options.mouseArea || outline;
    options.touchArea = options.touchArea || outline;
    this.mutate(options);

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('scenery-phet', 'ProbeNode', this);
  }
  dispose() {
    this.brighter5Property.dispose();
    this.brighter4Property.dispose();
    this.brighter3Property.dispose();
    this.brighter2Property.dispose();
    this.darker2Property.dispose();
    this.darker3Property.dispose();
    super.dispose();
  }
}

/**
 * Creates a value for options.sensorTypeFunction. Shows a shiny reflective interior in the sensor area.
 */
function glass(providedOptions) {
  const options = optionize()({
    centerColor: 'white',
    middleColor: '#E6F5FF',
    // light blue
    edgeColor: '#C2E7FF' // slightly darker blue, like glass
  }, providedOptions);
  return radius => {
    return new Circle(radius, {
      fill: new RadialGradient(-radius * 0.15, -radius * 0.15, 0, -radius * 0.15, -radius * 0.20, radius * 0.60).addColorStop(0, options.centerColor).addColorStop(0.4, options.middleColor).addColorStop(1, options.edgeColor)
    });
  };
}

/**
 * Creates a value for options.sensorTypeFunction. Shows a crosshairs in the sensor area.
 */
function crosshairs(providedOptions) {
  const options = optionize()({
    stroke: 'black',
    lineWidth: 3,
    intersectionRadius: 8
  }, providedOptions);
  return radius => {
    const lineOptions = {
      stroke: options.stroke,
      lineWidth: options.lineWidth
    };
    return new Node({
      children: [new Line(-radius, 0, -options.intersectionRadius, 0, lineOptions), new Line(+radius, 0, +options.intersectionRadius, 0, lineOptions), new Line(0, -radius, 0, -options.intersectionRadius, lineOptions), new Line(0, +radius, 0, +options.intersectionRadius, lineOptions)]
    });
  };
}
sceneryPhet.register('ProbeNode', ProbeNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJSYXkyIiwiVmVjdG9yMiIsIkVsbGlwdGljYWxBcmMiLCJTaGFwZSIsIkluc3RhbmNlUmVnaXN0cnkiLCJvcHRpb25pemUiLCJvcHRpb25pemUzIiwiQ2lyY2xlIiwiTGluZSIsIkxpbmVhckdyYWRpZW50IiwiTm9kZSIsIlBhaW50Q29sb3JQcm9wZXJ0eSIsIlBhdGgiLCJSYWRpYWxHcmFkaWVudCIsInNjZW5lcnlQaGV0IiwiREVGQVVMVF9PUFRJT05TIiwicmFkaXVzIiwiaW5uZXJSYWRpdXMiLCJoYW5kbGVXaWR0aCIsImhhbmRsZUhlaWdodCIsImhhbmRsZUNvcm5lclJhZGl1cyIsImxpZ2h0QW5nbGUiLCJNYXRoIiwiUEkiLCJjb2xvciIsInNlbnNvclR5cGVGdW5jdGlvbiIsImdsYXNzIiwiYXNzZXJ0IiwiT2JqZWN0IiwiZnJlZXplIiwiUHJvYmVOb2RlIiwiREVGQVVMVF9QUk9CRV9OT0RFX09QVElPTlMiLCJjcm9zc2hhaXJzIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiaGFuZGxlQm90dG9tIiwiYXJjRXh0ZW50IiwibWluIiwiY29ybmVyUmFkaXVzIiwibmVja0Nvcm5lclJhZGl1cyIsImVsbGlwdGljYWxBcmNTdGFydCIsInN0YXJ0IiwiY3JlYXRlT3V0ZXJQcm9iZVNoYXBlIiwibW92ZVRvIiwiYXJjIiwibGluZVRvIiwicXVhZHJhdGljQ3VydmVUbyIsIngiLCJ5IiwiZWxsaXB0aWNhbEFyYyIsImNsb3NlIiwicHJvYmVTaGFwZSIsImNlbnRlciIsImJvdW5kcyIsInYxIiwiY3JlYXRlUG9sYXIiLCJpbnRlcnNlY3Rpb25zIiwiaW50ZXJzZWN0aW9uIiwibGFzdEludGVyc2VjdGlvbiIsImxlbmd0aCIsImxhc3RJbnRlcnNlY3Rpb25Qb2ludCIsInBvaW50IiwiWkVSTyIsImdyYWRpZW50U291cmNlIiwicGx1cyIsInRpbWVzU2NhbGFyIiwidjIiLCJpbnRlcnNlY3Rpb25zMiIsImxhc3RJbnRlcnNlY3Rpb24yIiwibGFzdEludGVyc2VjdGlvblBvaW50MiIsImdyYWRpZW50RGVzdGluYXRpb24iLCJicmlnaHRlcjVQcm9wZXJ0eSIsImx1bWluYW5jZUZhY3RvciIsImJyaWdodGVyNFByb3BlcnR5IiwiYnJpZ2h0ZXIzUHJvcGVydHkiLCJicmlnaHRlcjJQcm9wZXJ0eSIsImRhcmtlcjJQcm9wZXJ0eSIsImRhcmtlcjNQcm9wZXJ0eSIsIm1haW5QYXRoIiwic3Ryb2tlIiwiYWRkQ29sb3JTdG9wIiwiZmlsbCIsImxpbmVXaWR0aCIsImZyb250UGF0aCIsInNjYWxlIiwiY2VudGVyWCIsIndpdGhBbHBoYSIsImNoaWxkcmVuIiwicHVzaCIsImNvbmNhdCIsIm91dGxpbmUiLCJtb3VzZUFyZWEiLCJ0b3VjaEFyZWEiLCJtdXRhdGUiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsImRpc3Bvc2UiLCJjZW50ZXJDb2xvciIsIm1pZGRsZUNvbG9yIiwiZWRnZUNvbG9yIiwiaW50ZXJzZWN0aW9uUmFkaXVzIiwibGluZU9wdGlvbnMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlByb2JlTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQcm9iZU5vZGUgaXMgYSBwaHlzaWNhbC1sb29raW5nIHByb2JlIHdpdGggYSBoYW5kbGUgYW5kIGEgY2lyY3VsYXIgc2Vuc29yIHJlZ2lvbi4gSXQgaXMgdXNlZCBpbiBzaW11bGF0aW9ucyBsaWtlXHJcbiAqIEJlbmRpbmcgTGlnaHQgYW5kIEJlZXIncyBMYXcgTGFiIHRvIHNob3cgaG93IG11Y2ggbGlnaHQgaXMgYmVpbmcgcmVjZWl2ZWQuIEl0IGlzIHR5cGljYWxseSBjb25uZWN0ZWQgdG8gYSBib2R5XHJcbiAqIHdpdGggcmVhZG91dHMgdmlhIGEgd2lyZS4gVGhlIG9yaWdpbiBpcyBpbiB0aGUgY2VudGVyIG9mIHRoZSBzZW5zb3IuXHJcbiAqXHJcbiAqIFRoaXMgY29kZSB3YXMgZ2VuZXJhbGl6ZWQgZnJvbSBCZW5kaW5nIExpZ2h0LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2JlbmRpbmctbGlnaHQvaXNzdWVzLzE2NVxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENoYW5kcmFzaGVrYXIgQmVtYWdvbmkgKEFjdHVhbCBDb25jZXB0cylcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFJheTIgZnJvbSAnLi4vLi4vZG90L2pzL1JheTIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IEVsbGlwdGljYWxBcmMsIFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucywgb3B0aW9uaXplMyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgeyBDaXJjbGUsIFRDb2xvciwgTGluZSwgTGluZWFyR3JhZGllbnQsIE5vZGUsIE5vZGVPcHRpb25zLCBQYWludENvbG9yUHJvcGVydHksIFBhdGgsIFJhZGlhbEdyYWRpZW50IH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xyXG5cclxuLy8gb3B0aW9ucyBmb3IgUHJvYmVOb2RlLmdsYXNzXHJcbnR5cGUgR2xhc3NPcHRpb25zID0ge1xyXG4gIGNlbnRlckNvbG9yPzogVENvbG9yO1xyXG4gIG1pZGRsZUNvbG9yPzogVENvbG9yO1xyXG4gIGVkZ2VDb2xvcj86IFRDb2xvcjtcclxufTtcclxuXHJcbi8vIG9wdGlvbnMgZm9yIFByb2JlTm9kZS5jcm9zc2hhaXJzXHJcbnR5cGUgQ3Jvc3NoYWlyc09wdGlvbnMgPSB7XHJcbiAgc3Ryb2tlPzogVENvbG9yO1xyXG4gIGxpbmVXaWR0aD86IG51bWJlcjtcclxuICBpbnRlcnNlY3Rpb25SYWRpdXM/OiBudW1iZXI7IC8vIFRoZSBhbW91bnQgb2YgYmxhbmsgc3BhY2UgdmlzaWJsZSBhdCB0aGUgaW50ZXJzZWN0aW9uIG9mIHRoZSAyIGNyb3NzaGFpcnMgbGluZXNcclxufTtcclxuXHJcbi8vIHR5cGUgb2YgU2VsZk9wdGlvbnMuc2Vuc29yVHlwZUZ1bmN0aW9uXHJcbnR5cGUgU2Vuc29yVHlwZUZ1bmN0aW9uID0gKCByYWRpdXM6IG51bWJlciApID0+IE5vZGU7XHJcblxyXG4vLyBvcHRpb25zIHRoYXQgYXJlIHNwZWNpZmljIHRvIFByb2JlTm9kZVxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIHJhZGl1cz86IG51bWJlcjtcclxuICBpbm5lclJhZGl1cz86IG51bWJlcjtcclxuICBoYW5kbGVXaWR0aD86IG51bWJlcjtcclxuICBoYW5kbGVIZWlnaHQ/OiBudW1iZXI7XHJcbiAgaGFuZGxlQ29ybmVyUmFkaXVzPzogbnVtYmVyO1xyXG5cclxuICAvKipcclxuICAgKiBpbiByYWRpYW5zLCB0aGUgYW5nbGUgb2YgdGhlIGluY29taW5nIGxpZ2h0LiAgMCBpcyBmcm9tIHRoZSByaWdodCwgUEkvMiBmcm9tIHRoZSBib3R0b20sIFBJIGZyb20gdGhlIGxlZnQsIGV0Yy5cclxuICAgKiBUaGUgZGVmYXVsdCBpcyBmcm9tIHRoZSB1cHBlci1sZWZ0LiAgR2VuZXJhbGx5LCBpdCBpcyBkaWZmaWN1bHQgdG8ga25vdyB0aGUgZ2xvYmFsIHJvdGF0aW9uIG9mIHRoZSBQcm9iZU5vZGVcclxuICAgKiBhbmQgYXV0b21hdGljYWxseSB1cGRhdGUgdGhlIGxpZ2h0QW5nbGUgd2hlbiB0aGUgZ2xvYmFsIHJvdGF0aW9uIGNoYW5nZXMsIHNvIHRoaXMgaXMgdXAgdG8gdGhlIGRldmVsb3BlclxyXG4gICAqIHRvIHNldCBwcm9wZXJseS4gIFRoZSBsaWdodCBpbiBQaEVUIHNpbXVsYXRpb25zIG9mdGVuIGNvbWVzIGZyb20gdGhlIHRvcC1sZWZ0LCBzbyBwbGVhc2Ugc2V0IHRoaXMgdmFsdWVcclxuICAgKiBhY2NvcmRpbmdseSBkZXBlbmRpbmcgb24gdGhlIGNvbnRleHQgb2YgaG93IHRoZSBwcm9iZSBpcyBlbWJlZGRlZCBpbiB0aGUgc2ltdWxhdGlvbi5cclxuICAgKi9cclxuICBsaWdodEFuZ2xlPzogbnVtYmVyO1xyXG4gIGNvbG9yPzogVENvbG9yO1xyXG5cclxuICAvLyBEZXRlcm1pbmVzIHdoYXQgaXMgZGlzcGxheWVkIGluIHRoZSBzZW5zb3IgYXJlYSwgdGhlIGNpcmN1bGFyIGN1dC1vdXQgcGFydCBvZiB0aGUgUHJvYmVOb2RlLlxyXG4gIC8vIFNldCB0aGlzIHRvIG51bGwgdG8gZGlzcGxheSBub3RoaW5nIGluIHRoZSBzZW5zb3IuXHJcbiAgc2Vuc29yVHlwZUZ1bmN0aW9uPzogU2Vuc29yVHlwZUZ1bmN0aW9uIHwgbnVsbDtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFByb2JlTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE5vZGVPcHRpb25zO1xyXG5cclxuY29uc3QgREVGQVVMVF9PUFRJT05TOiBSZXF1aXJlZDxTZWxmT3B0aW9ucz4gPSB7XHJcbiAgcmFkaXVzOiA1MCxcclxuICBpbm5lclJhZGl1czogMzUsXHJcbiAgaGFuZGxlV2lkdGg6IDUwLFxyXG4gIGhhbmRsZUhlaWdodDogMzAsXHJcbiAgaGFuZGxlQ29ybmVyUmFkaXVzOiAxMCxcclxuICBsaWdodEFuZ2xlOiAxLjM1ICogTWF0aC5QSSxcclxuICBjb2xvcjogJyMwMDg1NDEnLCAvLyBkYXJraXNoIGdyZWVuXHJcbiAgc2Vuc29yVHlwZUZ1bmN0aW9uOiBnbGFzcygpXHJcbn07XHJcbmFzc2VydCAmJiBPYmplY3QuZnJlZXplKCBERUZBVUxUX09QVElPTlMgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByb2JlTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvLyBDb2xvcnMgdXNlZCB0byBjcmVhdGUgZ3JhZGllbnRzXHJcbiAgcHJpdmF0ZSByZWFkb25seSBicmlnaHRlcjVQcm9wZXJ0eTogUGFpbnRDb2xvclByb3BlcnR5O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgYnJpZ2h0ZXI0UHJvcGVydHk6IFBhaW50Q29sb3JQcm9wZXJ0eTtcclxuICBwcml2YXRlIHJlYWRvbmx5IGJyaWdodGVyM1Byb3BlcnR5OiBQYWludENvbG9yUHJvcGVydHk7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBicmlnaHRlcjJQcm9wZXJ0eTogUGFpbnRDb2xvclByb3BlcnR5O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGFya2VyM1Byb3BlcnR5OiBQYWludENvbG9yUHJvcGVydHk7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBkYXJrZXIyUHJvcGVydHk6IFBhaW50Q29sb3JQcm9wZXJ0eTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBERUZBVUxUX1BST0JFX05PREVfT1BUSU9OUyA9IERFRkFVTFRfT1BUSU9OUztcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGdsYXNzID0gZ2xhc3M7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBjcm9zc2hhaXJzID0gY3Jvc3NoYWlycztcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBQcm9iZU5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemUzPFByb2JlTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge30sIERFRkFVTFRfT1BUSU9OUywgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBUbyBpbXByb3ZlIHJlYWRhYmlsaXR5XHJcbiAgICBjb25zdCByYWRpdXMgPSBvcHRpb25zLnJhZGl1cztcclxuXHJcbiAgICAvLyB5IGNvb3JkaW5hdGUgb2YgdGhlIGJvdHRvbSBvZiB0aGUgaGFuZGxlLCByZWxhdGl2ZSB0byB0aGUgb3JpZ2luIChjZW50ZXIgb2YgdGhlIHNlbnNvcilcclxuICAgIGNvbnN0IGhhbmRsZUJvdHRvbSA9IHJhZGl1cyArIG9wdGlvbnMuaGFuZGxlSGVpZ2h0O1xyXG5cclxuICAgIC8vIENvbnN0YW50cyB0aGF0IGRldGVybWluZSB0aGUgb3V0ZXIgU2hhcGUgb2YgdGhlIHByb2JlXHJcbiAgICBjb25zdCBhcmNFeHRlbnQgPSAwLjg7XHJcbiAgICBjb25zdCBoYW5kbGVXaWR0aCA9IG9wdGlvbnMuaGFuZGxlV2lkdGg7XHJcbiAgICBjb25zdCBpbm5lclJhZGl1cyA9IE1hdGgubWluKCBvcHRpb25zLmlubmVyUmFkaXVzLCBvcHRpb25zLnJhZGl1cyApO1xyXG4gICAgY29uc3QgY29ybmVyUmFkaXVzID0gb3B0aW9ucy5oYW5kbGVDb3JuZXJSYWRpdXM7XHJcbiAgICBjb25zdCBuZWNrQ29ybmVyUmFkaXVzID0gMTA7XHJcblxyXG4gICAgLy8gV2UgbXVzdCBrbm93IHdoZXJlIHRoZSBlbGxpcHRpY2FsIGFyYyBiZWdpbnMsIHNvIGNyZWF0ZSBhbiBleHBsaWNpdCBFbGxpcHRpY2FsQXJjIGZvciB0aGF0XHJcbiAgICAvLyBOb3RlOiBUaGlzIGVsbGlwdGljYWwgYXJjIG11c3QgbWF0Y2ggdGhlIGVsbGlwdGljYWxBcmMgY2FsbCBiZWxvd1xyXG4gICAgY29uc3QgZWxsaXB0aWNhbEFyY1N0YXJ0ID0gbmV3IEVsbGlwdGljYWxBcmMoIG5ldyBWZWN0b3IyKCAwLCAwICksIHJhZGl1cywgcmFkaXVzLCAwLCBNYXRoLlBJICogYXJjRXh0ZW50LCBNYXRoLlBJICogKCAxIC0gYXJjRXh0ZW50ICksIGZhbHNlICkuc3RhcnQ7XHJcblxyXG4gICAgLy8gQ3JlYXRlcyB0aGUgU2hhcGUgZm9yIHRoZSBvdXRzaWRlIGVkZ2Ugb2YgdGhlIHByb2JlLCBjaXJjdWxhciBhdCB0b3Agd2l0aCBoYW5kbGUgYXQgdGhlIGJvdHRvbS5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZU91dGVyUHJvYmVTaGFwZSgpOiBTaGFwZSB7XHJcbiAgICAgIHJldHVybiBuZXcgU2hhcGUoKVxyXG5cclxuICAgICAgICAvLyBzdGFydCBpbiB0aGUgYm90dG9tIGNlbnRlclxyXG4gICAgICAgIC5tb3ZlVG8oIDAsIGhhbmRsZUJvdHRvbSApXHJcblxyXG4gICAgICAgIC8vIEtpdGUgU2hhcGUgYXV0b21hdGljYWxseSBsaW5lVG8ncyB0byB0aGUgZmlyc3QgcG9pbnQgb2YgYW4gYXJjLCBzbyBubyBuZWVkIHRvIGxpbmVUbyBvdXJzZWx2ZXNcclxuICAgICAgICAuYXJjKCAtaGFuZGxlV2lkdGggLyAyICsgY29ybmVyUmFkaXVzLCBoYW5kbGVCb3R0b20gLSBjb3JuZXJSYWRpdXMsIGNvcm5lclJhZGl1cywgTWF0aC5QSSAvIDIsIE1hdGguUEksIGZhbHNlIClcclxuICAgICAgICAubGluZVRvKCAtaGFuZGxlV2lkdGggLyAyLCByYWRpdXMgKyBuZWNrQ29ybmVyUmFkaXVzIClcclxuICAgICAgICAucXVhZHJhdGljQ3VydmVUbyggLWhhbmRsZVdpZHRoIC8gMiwgcmFkaXVzLCBlbGxpcHRpY2FsQXJjU3RhcnQueCwgZWxsaXB0aWNhbEFyY1N0YXJ0LnkgKVxyXG5cclxuICAgICAgICAvLyBUb3AgYXJjXHJcbiAgICAgICAgLy8gTm90ZTogaGlzIGVsbGlwdGljYWwgYXJjIG11c3QgbWF0Y2ggdGhlIEVsbGlwdGljYWxBcmMgYWJvdmVcclxuICAgICAgICAuZWxsaXB0aWNhbEFyYyggMCwgMCwgcmFkaXVzLCByYWRpdXMsIDAsIE1hdGguUEkgKiBhcmNFeHRlbnQsIE1hdGguUEkgKiAoIDEgLSBhcmNFeHRlbnQgKSwgZmFsc2UgKVxyXG5cclxuICAgICAgICAucXVhZHJhdGljQ3VydmVUbyggaGFuZGxlV2lkdGggLyAyLCByYWRpdXMsICtoYW5kbGVXaWR0aCAvIDIsIHJhZGl1cyArIG5lY2tDb3JuZXJSYWRpdXMgKVxyXG4gICAgICAgIC5hcmMoIGhhbmRsZVdpZHRoIC8gMiAtIGNvcm5lclJhZGl1cywgaGFuZGxlQm90dG9tIC0gY29ybmVyUmFkaXVzLCBjb3JuZXJSYWRpdXMsIDAsIE1hdGguUEkgLyAyLCBmYWxzZSApXHJcblxyXG4gICAgICAgIC5jbG9zZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFN0YXJ0IHdpdGggdGhlIG91dGVyIFNoYXBlIG9mIHRoZSBwcm9iZSwgYW5kIGN1dCBvdXQgdGhlIHNlbnNvciBhcmVhLlxyXG4gICAgY29uc3QgcHJvYmVTaGFwZSA9IGNyZWF0ZU91dGVyUHJvYmVTaGFwZSgpXHJcbiAgICAgIC5tb3ZlVG8oIGlubmVyUmFkaXVzLCAwIClcclxuICAgICAgLmFyYyggMCwgMCwgaW5uZXJSYWRpdXMsIE1hdGguUEkgKiAyLCAwLCB0cnVlIClcclxuICAgICAgLmNsb3NlKCk7XHJcblxyXG4gICAgLy8gVGhlIGxpZ2h0IGFuZ2xlIGlzIHZhcmlhYmxlIHNvIHRoYXQgeW91IGNhbiBjcmVhdGUgYSBwcm9iZSBub2RlIHRoYXQgaXMgcG9pbnRpbmcgdXAgb3IgdG8gdGhlIHNpZGVcclxuICAgIGNvbnN0IGxpZ2h0QW5nbGUgPSBvcHRpb25zLmxpZ2h0QW5nbGU7XHJcblxyXG4gICAgY29uc3QgY2VudGVyID0gcHJvYmVTaGFwZS5ib3VuZHMuY2VudGVyO1xyXG4gICAgY29uc3QgdjEgPSBWZWN0b3IyLmNyZWF0ZVBvbGFyKCAxLCBsaWdodEFuZ2xlICk7XHJcbiAgICBjb25zdCBpbnRlcnNlY3Rpb25zID0gcHJvYmVTaGFwZS5pbnRlcnNlY3Rpb24oIG5ldyBSYXkyKCBjZW50ZXIsIHYxICkgKTtcclxuXHJcbiAgICAvLyB0YWtlIGxhc3QgaW50ZXJzZWN0aW9uIG9yIHplcm8gcG9pbnQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy8yOTRcclxuICAgIGNvbnN0IGxhc3RJbnRlcnNlY3Rpb24gPSBpbnRlcnNlY3Rpb25zWyBpbnRlcnNlY3Rpb25zLmxlbmd0aCAtIDEgXTtcclxuICAgIGNvbnN0IGxhc3RJbnRlcnNlY3Rpb25Qb2ludCA9IGxhc3RJbnRlcnNlY3Rpb24gPyBsYXN0SW50ZXJzZWN0aW9uLnBvaW50IDogVmVjdG9yMi5aRVJPO1xyXG4gICAgY29uc3QgZ3JhZGllbnRTb3VyY2UgPSBsYXN0SW50ZXJzZWN0aW9uUG9pbnQucGx1cyggdjEudGltZXNTY2FsYXIoIDEgKSApO1xyXG5cclxuICAgIGNvbnN0IHYyID0gVmVjdG9yMi5jcmVhdGVQb2xhciggMSwgbGlnaHRBbmdsZSArIE1hdGguUEkgKTtcclxuICAgIGNvbnN0IGludGVyc2VjdGlvbnMyID0gcHJvYmVTaGFwZS5pbnRlcnNlY3Rpb24oIG5ldyBSYXkyKCBjZW50ZXIsIHYyICkgKTtcclxuXHJcbiAgICAvLyB0YWtlIGxhc3QgaW50ZXJzZWN0aW9uIG9yIHplcm8gcG9pbnQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy8yOTRcclxuICAgIGNvbnN0IGxhc3RJbnRlcnNlY3Rpb24yID0gaW50ZXJzZWN0aW9uczJbIGludGVyc2VjdGlvbnMyLmxlbmd0aCAtIDEgXTtcclxuICAgIGNvbnN0IGxhc3RJbnRlcnNlY3Rpb25Qb2ludDIgPSBsYXN0SW50ZXJzZWN0aW9uMiA/IGxhc3RJbnRlcnNlY3Rpb24yLnBvaW50IDogVmVjdG9yMi5aRVJPO1xyXG4gICAgY29uc3QgZ3JhZGllbnREZXN0aW5hdGlvbiA9IGxhc3RJbnRlcnNlY3Rpb25Qb2ludDIucGx1cyggdjIudGltZXNTY2FsYXIoIDEgKSApO1xyXG5cclxuICAgIHRoaXMuYnJpZ2h0ZXI1UHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBvcHRpb25zLmNvbG9yLCB7IGx1bWluYW5jZUZhY3RvcjogMC41IH0gKTtcclxuICAgIHRoaXMuYnJpZ2h0ZXI0UHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBvcHRpb25zLmNvbG9yLCB7IGx1bWluYW5jZUZhY3RvcjogMC40IH0gKTtcclxuICAgIHRoaXMuYnJpZ2h0ZXIzUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBvcHRpb25zLmNvbG9yLCB7IGx1bWluYW5jZUZhY3RvcjogMC4zIH0gKTtcclxuICAgIHRoaXMuYnJpZ2h0ZXIyUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBvcHRpb25zLmNvbG9yLCB7IGx1bWluYW5jZUZhY3RvcjogMC4yIH0gKTtcclxuICAgIHRoaXMuZGFya2VyMlByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggb3B0aW9ucy5jb2xvciwgeyBsdW1pbmFuY2VGYWN0b3I6IC0wLjIgfSApO1xyXG4gICAgdGhpcy5kYXJrZXIzUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBvcHRpb25zLmNvbG9yLCB7IGx1bWluYW5jZUZhY3RvcjogLTAuMyB9ICk7XHJcblxyXG4gICAgLy8gVGhlIG1haW4gcGF0aCBvZiB0aGUgcHJvYmVcclxuICAgIGNvbnN0IG1haW5QYXRoID0gbmV3IFBhdGgoIHByb2JlU2hhcGUsIHtcclxuICAgICAgc3Ryb2tlOiBuZXcgTGluZWFyR3JhZGllbnQoIGdyYWRpZW50U291cmNlLngsIGdyYWRpZW50U291cmNlLnksIGdyYWRpZW50RGVzdGluYXRpb24ueCwgZ3JhZGllbnREZXN0aW5hdGlvbi55IClcclxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjAsIHRoaXMuYnJpZ2h0ZXIyUHJvcGVydHkgKSAvLyBoaWdobGlnaHRcclxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAxLjAsIHRoaXMuZGFya2VyMlByb3BlcnR5ICksIC8vIHNoYWRvd1xyXG4gICAgICBmaWxsOiBuZXcgTGluZWFyR3JhZGllbnQoIGdyYWRpZW50U291cmNlLngsIGdyYWRpZW50U291cmNlLnksIGdyYWRpZW50RGVzdGluYXRpb24ueCwgZ3JhZGllbnREZXN0aW5hdGlvbi55IClcclxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjAsIHRoaXMuYnJpZ2h0ZXI1UHJvcGVydHkgKSAvLyBoaWdobGlnaHRcclxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjAzLCB0aGlzLmJyaWdodGVyNFByb3BlcnR5IClcclxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjA3LCB0aGlzLmJyaWdodGVyNFByb3BlcnR5IClcclxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjExLCB0aGlzLmJyaWdodGVyMlByb3BlcnR5IClcclxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjMsIG9wdGlvbnMuY29sb3IgKVxyXG4gICAgICAgIC5hZGRDb2xvclN0b3AoIDAuOCwgdGhpcy5kYXJrZXIyUHJvcGVydHkgKSAvLyBzaGFkb3dzXHJcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMS4wLCB0aGlzLmRhcmtlcjNQcm9wZXJ0eSApLFxyXG4gICAgICBsaW5lV2lkdGg6IDJcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBUaGUgZnJvbnQgZmxhdCBcInN1cmZhY2VcIiBvZiB0aGUgcHJvYmUsIG1ha2VzIGl0IGxvb2sgM2QgYnkgZ2l2aW5nIHRoZSBwcm9iZSBhIGJldmVsZWQgYXBwZWFyYW5jZSBhbmQgcHV0dGluZ1xyXG4gICAgLy8gYSBzaGlueSBnbGFyZSBvbiB0aGUgdG9wIGVkZ2UuXHJcbiAgICBjb25zdCBmcm9udFBhdGggPSBuZXcgUGF0aCggcHJvYmVTaGFwZSwge1xyXG4gICAgICBmaWxsOiBvcHRpb25zLmNvbG9yLFxyXG5cclxuICAgICAgLy8geSBzY2FsZSBpcyBhbiBlbXBpcmljYWwgZnVuY3Rpb24gb2YgaGFuZGxlIGhlaWdodCwgdG8ga2VlcCBiZXZlbCBhdCBib3R0b20gb2YgaGFuZGxlIGZyb20gY2hhbmdpbmcgc2l6ZVxyXG4gICAgICBzY2FsZTogbmV3IFZlY3RvcjIoIDAuOSwgMC45MyArICggMC4wMSAqIG9wdGlvbnMuaGFuZGxlSGVpZ2h0IC8gREVGQVVMVF9PUFRJT05TLmhhbmRsZUhlaWdodCApICksXHJcbiAgICAgIGNlbnRlclg6IG1haW5QYXRoLmNlbnRlclgsXHJcbiAgICAgIHN0cm9rZTogbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLmJyaWdodGVyM1Byb3BlcnR5IF0sICggY29sb3IgPT4ge1xyXG4gICAgICAgIHJldHVybiBjb2xvci53aXRoQWxwaGEoIDAuNSApO1xyXG4gICAgICB9ICkgKSxcclxuICAgICAgbGluZVdpZHRoOiAxLjIsXHJcbiAgICAgIHk6IDIgLy8gU2hpZnQgaXQgZG93biBhIGJpdCB0byBtYWtlIHRoZSBmYWNlIGxvb2sgYSBiaXQgbW9yZSAzZFxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGNoaWxkcmVuID0gW107XHJcbiAgICBpZiAoIG9wdGlvbnMuc2Vuc29yVHlwZUZ1bmN0aW9uICkge1xyXG4gICAgICBjaGlsZHJlbi5wdXNoKCBvcHRpb25zLnNlbnNvclR5cGVGdW5jdGlvbiggcmFkaXVzICkgKTtcclxuICAgIH1cclxuICAgIGNoaWxkcmVuLnB1c2goXHJcbiAgICAgIG1haW5QYXRoLFxyXG4gICAgICBmcm9udFBhdGhcclxuICAgICk7XHJcblxyXG4gICAgLy8gQWxsb3cgdGhlIGNsaWVudCB0byBhZGQgY2hpbGQgbm9kZXNcclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBjaGlsZHJlbi5jb25jYXQoIG9wdGlvbnMuY2hpbGRyZW4gfHwgW10gKTtcclxuXHJcbiAgICAvLyBBbGxvdyB0aGUgY2xpZW50IHRvIG92ZXJyaWRlIG1vdXNlIGFuZCB0b3VjaCBhcmVhLCBidXQgZmFsbCBiYWNrIHRvIHRoZSBvdXRsaW5lXHJcbiAgICBjb25zdCBvdXRsaW5lID0gY3JlYXRlT3V0ZXJQcm9iZVNoYXBlKCk7XHJcbiAgICBvcHRpb25zLm1vdXNlQXJlYSA9IG9wdGlvbnMubW91c2VBcmVhIHx8IG91dGxpbmU7XHJcbiAgICBvcHRpb25zLnRvdWNoQXJlYSA9IG9wdGlvbnMudG91Y2hBcmVhIHx8IG91dGxpbmU7XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcclxuICAgIGFzc2VydCAmJiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3NjZW5lcnktcGhldCcsICdQcm9iZU5vZGUnLCB0aGlzICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuYnJpZ2h0ZXI1UHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5icmlnaHRlcjRQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmJyaWdodGVyM1Byb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHRoaXMuYnJpZ2h0ZXIyUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5kYXJrZXIyUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5kYXJrZXIzUHJvcGVydHkuZGlzcG9zZSgpO1xyXG5cclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgdmFsdWUgZm9yIG9wdGlvbnMuc2Vuc29yVHlwZUZ1bmN0aW9uLiBTaG93cyBhIHNoaW55IHJlZmxlY3RpdmUgaW50ZXJpb3IgaW4gdGhlIHNlbnNvciBhcmVhLlxyXG4gKi9cclxuZnVuY3Rpb24gZ2xhc3MoIHByb3ZpZGVkT3B0aW9ucz86IEdsYXNzT3B0aW9ucyApOiBTZW5zb3JUeXBlRnVuY3Rpb24ge1xyXG5cclxuICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEdsYXNzT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucywgR2xhc3NPcHRpb25zPigpKCB7XHJcbiAgICBjZW50ZXJDb2xvcjogJ3doaXRlJyxcclxuICAgIG1pZGRsZUNvbG9yOiAnI0U2RjVGRicsIC8vIGxpZ2h0IGJsdWVcclxuICAgIGVkZ2VDb2xvcjogJyNDMkU3RkYnIC8vIHNsaWdodGx5IGRhcmtlciBibHVlLCBsaWtlIGdsYXNzXHJcbiAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gIHJldHVybiAoIHJhZGl1czogbnVtYmVyICk6IE5vZGUgPT4ge1xyXG4gICAgcmV0dXJuIG5ldyBDaXJjbGUoIHJhZGl1cywge1xyXG4gICAgICBmaWxsOiBuZXcgUmFkaWFsR3JhZGllbnQoIC1yYWRpdXMgKiAwLjE1LCAtcmFkaXVzICogMC4xNSwgMCwgLXJhZGl1cyAqIDAuMTUsIC1yYWRpdXMgKiAwLjIwLCByYWRpdXMgKiAwLjYwIClcclxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLCBvcHRpb25zLmNlbnRlckNvbG9yIClcclxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjQsIG9wdGlvbnMubWlkZGxlQ29sb3IgKVxyXG4gICAgICAgIC5hZGRDb2xvclN0b3AoIDEsIG9wdGlvbnMuZWRnZUNvbG9yIClcclxuICAgIH0gKTtcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIHZhbHVlIGZvciBvcHRpb25zLnNlbnNvclR5cGVGdW5jdGlvbi4gU2hvd3MgYSBjcm9zc2hhaXJzIGluIHRoZSBzZW5zb3IgYXJlYS5cclxuICovXHJcbmZ1bmN0aW9uIGNyb3NzaGFpcnMoIHByb3ZpZGVkT3B0aW9ucz86IENyb3NzaGFpcnNPcHRpb25zICk6IFNlbnNvclR5cGVGdW5jdGlvbiB7XHJcblxyXG4gIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Q3Jvc3NoYWlyc09wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMsIENyb3NzaGFpcnNPcHRpb25zPigpKCB7XHJcbiAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICBsaW5lV2lkdGg6IDMsXHJcbiAgICBpbnRlcnNlY3Rpb25SYWRpdXM6IDhcclxuICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgcmV0dXJuICggcmFkaXVzOiBudW1iZXIgKTogTm9kZSA9PiB7XHJcbiAgICBjb25zdCBsaW5lT3B0aW9ucyA9IHsgc3Ryb2tlOiBvcHRpb25zLnN0cm9rZSwgbGluZVdpZHRoOiBvcHRpb25zLmxpbmVXaWR0aCB9O1xyXG4gICAgcmV0dXJuIG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IExpbmUoIC1yYWRpdXMsIDAsIC1vcHRpb25zLmludGVyc2VjdGlvblJhZGl1cywgMCwgbGluZU9wdGlvbnMgKSxcclxuICAgICAgICBuZXcgTGluZSggK3JhZGl1cywgMCwgK29wdGlvbnMuaW50ZXJzZWN0aW9uUmFkaXVzLCAwLCBsaW5lT3B0aW9ucyApLFxyXG4gICAgICAgIG5ldyBMaW5lKCAwLCAtcmFkaXVzLCAwLCAtb3B0aW9ucy5pbnRlcnNlY3Rpb25SYWRpdXMsIGxpbmVPcHRpb25zICksXHJcbiAgICAgICAgbmV3IExpbmUoIDAsICtyYWRpdXMsIDAsICtvcHRpb25zLmludGVyc2VjdGlvblJhZGl1cywgbGluZU9wdGlvbnMgKSBdXHJcbiAgICB9ICk7XHJcbiAgfTtcclxufVxyXG5cclxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdQcm9iZU5vZGUnLCBQcm9iZU5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLGtDQUFrQztBQUM5RCxP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