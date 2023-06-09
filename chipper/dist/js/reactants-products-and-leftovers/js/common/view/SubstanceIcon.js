// Copyright 2014-2023, University of Colorado Boulder

/**
 * Displays a Substance's icon, which may change dynamically.
 *
 * VERY IMPORTANT NOTES!
 *
 * Scenery is a DAG and allows one instance of a Node to appear in the scenegraph in
 * multiple places, with 2 caveats: (1) a Node cannot be a sibling of itself, and (2)
 * transforming a node will do so everywhere that it appears. Because an icon can
 * appear in multiple places in the view, this type provides a convenient way to
 * wrap an icon, so that we don't accidentally make it a sibling of itself, or
 * attempt to position it.  It also ensures that the icon's origin (0,0) is at the
 * center of its bounds, which we take advantage of in layout code.
 *
 * Substances typically have a lifetime that is longer than this node.
 * When this node is disposed of, the icon needs to be explicitly removed from its parent.
 * This is because scenery nodes keep a reference to their parent. If we don't explicitly
 * remove the icon from the scene graph, then all of its ancestors will be retained,
 * creating a memory leak.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { Node } from '../../../../scenery/js/imports.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
export default class SubstanceIcon extends Node {
  constructor(iconProperty, providedOptions) {
    const options = optionize()({}, providedOptions);

    // Add a wrapper, so that we can keep the icon centered and not run afoul of scenery DAG feature.
    const wrapperNode = new Node();
    const iconPropertyObserver = icon => {
      wrapperNode.removeAllChildren();
      wrapperNode.addChild(icon); // icon must be removed in dispose, since scenery children keep a reference to their parents
      wrapperNode.center = Vector2.ZERO;
    };
    iconProperty.link(iconPropertyObserver); // must be unlinked in dispose

    options.children = [wrapperNode];
    super(options);
    this.disposeSubstanceIcon = () => {
      if (iconProperty.hasListener(iconPropertyObserver)) {
        iconProperty.unlink(iconPropertyObserver);
      }
      wrapperNode.removeAllChildren(); // to disconnect from icon
    };
  }

  dispose() {
    this.disposeSubstanceIcon();
    super.dispose();
  }
}
reactantsProductsAndLeftovers.register('SubstanceIcon', SubstanceIcon);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwib3B0aW9uaXplIiwiTm9kZSIsInJlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzIiwiU3Vic3RhbmNlSWNvbiIsImNvbnN0cnVjdG9yIiwiaWNvblByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIndyYXBwZXJOb2RlIiwiaWNvblByb3BlcnR5T2JzZXJ2ZXIiLCJpY29uIiwicmVtb3ZlQWxsQ2hpbGRyZW4iLCJhZGRDaGlsZCIsImNlbnRlciIsIlpFUk8iLCJsaW5rIiwiY2hpbGRyZW4iLCJkaXNwb3NlU3Vic3RhbmNlSWNvbiIsImhhc0xpc3RlbmVyIiwidW5saW5rIiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3Vic3RhbmNlSWNvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEaXNwbGF5cyBhIFN1YnN0YW5jZSdzIGljb24sIHdoaWNoIG1heSBjaGFuZ2UgZHluYW1pY2FsbHkuXHJcbiAqXHJcbiAqIFZFUlkgSU1QT1JUQU5UIE5PVEVTIVxyXG4gKlxyXG4gKiBTY2VuZXJ5IGlzIGEgREFHIGFuZCBhbGxvd3Mgb25lIGluc3RhbmNlIG9mIGEgTm9kZSB0byBhcHBlYXIgaW4gdGhlIHNjZW5lZ3JhcGggaW5cclxuICogbXVsdGlwbGUgcGxhY2VzLCB3aXRoIDIgY2F2ZWF0czogKDEpIGEgTm9kZSBjYW5ub3QgYmUgYSBzaWJsaW5nIG9mIGl0c2VsZiwgYW5kICgyKVxyXG4gKiB0cmFuc2Zvcm1pbmcgYSBub2RlIHdpbGwgZG8gc28gZXZlcnl3aGVyZSB0aGF0IGl0IGFwcGVhcnMuIEJlY2F1c2UgYW4gaWNvbiBjYW5cclxuICogYXBwZWFyIGluIG11bHRpcGxlIHBsYWNlcyBpbiB0aGUgdmlldywgdGhpcyB0eXBlIHByb3ZpZGVzIGEgY29udmVuaWVudCB3YXkgdG9cclxuICogd3JhcCBhbiBpY29uLCBzbyB0aGF0IHdlIGRvbid0IGFjY2lkZW50YWxseSBtYWtlIGl0IGEgc2libGluZyBvZiBpdHNlbGYsIG9yXHJcbiAqIGF0dGVtcHQgdG8gcG9zaXRpb24gaXQuICBJdCBhbHNvIGVuc3VyZXMgdGhhdCB0aGUgaWNvbidzIG9yaWdpbiAoMCwwKSBpcyBhdCB0aGVcclxuICogY2VudGVyIG9mIGl0cyBib3VuZHMsIHdoaWNoIHdlIHRha2UgYWR2YW50YWdlIG9mIGluIGxheW91dCBjb2RlLlxyXG4gKlxyXG4gKiBTdWJzdGFuY2VzIHR5cGljYWxseSBoYXZlIGEgbGlmZXRpbWUgdGhhdCBpcyBsb25nZXIgdGhhbiB0aGlzIG5vZGUuXHJcbiAqIFdoZW4gdGhpcyBub2RlIGlzIGRpc3Bvc2VkIG9mLCB0aGUgaWNvbiBuZWVkcyB0byBiZSBleHBsaWNpdGx5IHJlbW92ZWQgZnJvbSBpdHMgcGFyZW50LlxyXG4gKiBUaGlzIGlzIGJlY2F1c2Ugc2NlbmVyeSBub2RlcyBrZWVwIGEgcmVmZXJlbmNlIHRvIHRoZWlyIHBhcmVudC4gSWYgd2UgZG9uJ3QgZXhwbGljaXRseVxyXG4gKiByZW1vdmUgdGhlIGljb24gZnJvbSB0aGUgc2NlbmUgZ3JhcGgsIHRoZW4gYWxsIG9mIGl0cyBhbmNlc3RvcnMgd2lsbCBiZSByZXRhaW5lZCxcclxuICogY3JlYXRpbmcgYSBtZW1vcnkgbGVhay5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIE5vZGVPcHRpb25zLCBOb2RlVHJhbnNsYXRpb25PcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHJlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzIGZyb20gJy4uLy4uL3JlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBTdWJzdGFuY2VJY29uT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN1YnN0YW5jZUljb24gZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlU3Vic3RhbmNlSWNvbjogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBpY29uUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PE5vZGU+LCBwcm92aWRlZE9wdGlvbnM/OiBTdWJzdGFuY2VJY29uT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFN1YnN0YW5jZUljb25PcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHt9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBBZGQgYSB3cmFwcGVyLCBzbyB0aGF0IHdlIGNhbiBrZWVwIHRoZSBpY29uIGNlbnRlcmVkIGFuZCBub3QgcnVuIGFmb3VsIG9mIHNjZW5lcnkgREFHIGZlYXR1cmUuXHJcbiAgICBjb25zdCB3cmFwcGVyTm9kZSA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgY29uc3QgaWNvblByb3BlcnR5T2JzZXJ2ZXIgPSAoIGljb246IE5vZGUgKSA9PiB7XHJcbiAgICAgIHdyYXBwZXJOb2RlLnJlbW92ZUFsbENoaWxkcmVuKCk7XHJcbiAgICAgIHdyYXBwZXJOb2RlLmFkZENoaWxkKCBpY29uICk7IC8vIGljb24gbXVzdCBiZSByZW1vdmVkIGluIGRpc3Bvc2UsIHNpbmNlIHNjZW5lcnkgY2hpbGRyZW4ga2VlcCBhIHJlZmVyZW5jZSB0byB0aGVpciBwYXJlbnRzXHJcbiAgICAgIHdyYXBwZXJOb2RlLmNlbnRlciA9IFZlY3RvcjIuWkVSTztcclxuICAgIH07XHJcbiAgICBpY29uUHJvcGVydHkubGluayggaWNvblByb3BlcnR5T2JzZXJ2ZXIgKTsgLy8gbXVzdCBiZSB1bmxpbmtlZCBpbiBkaXNwb3NlXHJcblxyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgd3JhcHBlck5vZGUgXTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZVN1YnN0YW5jZUljb24gPSAoKSA9PiB7XHJcbiAgICAgIGlmICggaWNvblByb3BlcnR5Lmhhc0xpc3RlbmVyKCBpY29uUHJvcGVydHlPYnNlcnZlciApICkge1xyXG4gICAgICAgIGljb25Qcm9wZXJ0eS51bmxpbmsoIGljb25Qcm9wZXJ0eU9ic2VydmVyICk7XHJcbiAgICAgIH1cclxuICAgICAgd3JhcHBlck5vZGUucmVtb3ZlQWxsQ2hpbGRyZW4oKTsgLy8gdG8gZGlzY29ubmVjdCBmcm9tIGljb25cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcG9zZVN1YnN0YW5jZUljb24oKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbnJlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzLnJlZ2lzdGVyKCAnU3Vic3RhbmNlSWNvbicsIFN1YnN0YW5jZUljb24gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFNBQVMsTUFBNEIsdUNBQXVDO0FBQ25GLFNBQVNDLElBQUksUUFBNkMsbUNBQW1DO0FBQzdGLE9BQU9DLDZCQUE2QixNQUFNLHdDQUF3QztBQU1sRixlQUFlLE1BQU1DLGFBQWEsU0FBU0YsSUFBSSxDQUFDO0VBSXZDRyxXQUFXQSxDQUFFQyxZQUFxQyxFQUFFQyxlQUFzQyxFQUFHO0lBRWxHLE1BQU1DLE9BQU8sR0FBR1AsU0FBUyxDQUFpRCxDQUFDLENBQUUsQ0FBQyxDQUFDLEVBQUVNLGVBQWdCLENBQUM7O0lBRWxHO0lBQ0EsTUFBTUUsV0FBVyxHQUFHLElBQUlQLElBQUksQ0FBQyxDQUFDO0lBRTlCLE1BQU1RLG9CQUFvQixHQUFLQyxJQUFVLElBQU07TUFDN0NGLFdBQVcsQ0FBQ0csaUJBQWlCLENBQUMsQ0FBQztNQUMvQkgsV0FBVyxDQUFDSSxRQUFRLENBQUVGLElBQUssQ0FBQyxDQUFDLENBQUM7TUFDOUJGLFdBQVcsQ0FBQ0ssTUFBTSxHQUFHZCxPQUFPLENBQUNlLElBQUk7SUFDbkMsQ0FBQztJQUNEVCxZQUFZLENBQUNVLElBQUksQ0FBRU4sb0JBQXFCLENBQUMsQ0FBQyxDQUFDOztJQUUzQ0YsT0FBTyxDQUFDUyxRQUFRLEdBQUcsQ0FBRVIsV0FBVyxDQUFFO0lBRWxDLEtBQUssQ0FBRUQsT0FBUSxDQUFDO0lBRWhCLElBQUksQ0FBQ1Usb0JBQW9CLEdBQUcsTUFBTTtNQUNoQyxJQUFLWixZQUFZLENBQUNhLFdBQVcsQ0FBRVQsb0JBQXFCLENBQUMsRUFBRztRQUN0REosWUFBWSxDQUFDYyxNQUFNLENBQUVWLG9CQUFxQixDQUFDO01BQzdDO01BQ0FELFdBQVcsQ0FBQ0csaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkMsQ0FBQztFQUNIOztFQUVnQlMsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCLElBQUksQ0FBQ0gsb0JBQW9CLENBQUMsQ0FBQztJQUMzQixLQUFLLENBQUNHLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQWxCLDZCQUE2QixDQUFDbUIsUUFBUSxDQUFFLGVBQWUsRUFBRWxCLGFBQWMsQ0FBQyJ9