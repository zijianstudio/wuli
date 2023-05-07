// Copyright 2013-2022, University of Colorado Boulder

/**
 * Container for all components related to the graph feature.
 * It has an expand/collapse bar at the top of it, and can switch between 'concentration' and 'quantity'.
 * Logarithmic graph is the standard scale. Interactivity and a linear scale are optional.
 * Origin is at top-left of the expand/collapse bar.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';
import { Line, Node } from '../../../../../scenery/js/imports.js';
import phScale from '../../../phScale.js';
import GraphControlPanel from './GraphControlPanel.js';
import GraphScale from './GraphScale.js';
import GraphScaleSwitch from './GraphScaleSwitch.js';
import GraphUnits from './GraphUnits.js';
import LinearGraphNode from './LinearGraphNode.js';
import LogarithmicGraphNode from './LogarithmicGraphNode.js';
import optionize from '../../../../../phet-core/js/optionize.js';
export default class GraphNode extends Node {
  constructor(totalVolumeProperty, derivedProperties, providedOptions) {
    const options = optionize()({
      logScaleHeight: 500,
      linearScaleHeight: 500,
      units: GraphUnits.MOLES_PER_LITER,
      hasLinearFeature: false,
      graphScale: GraphScale.LOGARITHMIC
    }, providedOptions);
    super();
    const pdomOrder = [];

    // whether the graph is expanded or collapsed
    const expandedProperty = new BooleanProperty(true, {
      tandem: options.tandem.createTandem('expandedProperty')
    });

    // units used for the graph
    const graphUnitsProperty = new EnumerationProperty(options.units, {
      tandem: options.tandem.createTandem('graphUnitsProperty')
    });

    // control panel above the graph
    const graphControlPanel = new GraphControlPanel(graphUnitsProperty, expandedProperty, {
      tandem: options.tandem.createTandem('graphControlPanel')
    });
    this.addChild(graphControlPanel);
    pdomOrder.push(graphControlPanel);

    // vertical line that connects bottom of graphControlPanel to top of graph
    const lineToPanel = new Line(0, 0, 0, 75, {
      stroke: 'black'
    });
    graphControlPanel.visibleProperty.lazyLink(() => {
      lineToPanel.visible = graphControlPanel.visible;
    });

    // logarithmic graph
    const logarithmicGraphNode = new LogarithmicGraphNode(totalVolumeProperty, derivedProperties, graphUnitsProperty, {
      pHProperty: options.pHProperty,
      scaleHeight: options.logScaleHeight,
      centerX: lineToPanel.centerX,
      y: 30,
      // y, not top
      tandem: options.tandem.createTandem('logarithmicGraphNode')
    });

    // parent for things whose visibility will be controlled by expandProperty
    const parentNode = new Node({
      children: [lineToPanel, logarithmicGraphNode],
      centerX: graphControlPanel.centerX,
      y: graphControlPanel.bottom // y, not top
    });

    this.addChild(parentNode);

    // controls the visibility of parentNode
    expandedProperty.link(expanded => {
      parentNode.visible = expanded;
    });

    // optional linear graph
    let linearGraphNode;
    let graphScaleProperty;
    if (options.hasLinearFeature) {
      // scale (log, linear) of the graph
      graphScaleProperty = new EnumerationProperty(options.graphScale, {
        tandem: options.tandem.createTandem('graphScaleProperty')
      });

      // linear graph
      linearGraphNode = new LinearGraphNode(derivedProperties, graphUnitsProperty, {
        scaleHeight: options.linearScaleHeight,
        y: logarithmicGraphNode.y,
        // y, not top
        centerX: logarithmicGraphNode.centerX,
        tandem: options.tandem.createTandem('linearGraphNode')
      });

      // scale switch (Logarithmic vs Linear)
      const graphScaleSwitch = new GraphScaleSwitch(graphScaleProperty, {
        tandem: options.tandem.createTandem('graphScaleSwitch')
      });
      graphScaleSwitch.boundsProperty.link(bounds => {
        graphScaleSwitch.centerX = lineToPanel.centerX;
        graphScaleSwitch.top = linearGraphNode.bottom + 15;
      });
      pdomOrder.push(graphScaleSwitch);
      pdomOrder.push(linearGraphNode);

      // vertical line that connects bottom of graph to top of scale switch
      const lineToSwitchNode = new Line(0, 0, 0, 200, {
        stroke: 'black',
        centerX: lineToPanel.centerX,
        bottom: graphScaleSwitch.top + 1
      });
      graphScaleSwitch.visibleProperty.lazyLink(() => {
        lineToSwitchNode.visible = graphScaleSwitch.visible;
      });

      // add everything to parentNode, since their visibility is controlled by expandedProperty
      parentNode.addChild(lineToSwitchNode);
      lineToSwitchNode.moveToBack();
      parentNode.addChild(linearGraphNode);
      parentNode.addChild(graphScaleSwitch);

      // handle scale changes
      graphScaleProperty.link(graphScale => {
        logarithmicGraphNode.visible = graphScale === GraphScale.LOGARITHMIC;
        linearGraphNode.visible = graphScale === GraphScale.LINEAR;
      });
    }
    pdomOrder.push(logarithmicGraphNode);
    this.mutate(options);
    this.resetGraphNode = () => {
      expandedProperty.reset();
      graphUnitsProperty.reset();
      graphScaleProperty && graphScaleProperty.reset();
      linearGraphNode && linearGraphNode.reset();
    };

    // Link to concentration Properties, see https://github.com/phetsims/ph-scale/issues/125
    this.addLinkedElement(derivedProperties.concentrationH2OProperty, {
      tandem: options.tandem.createTandem('concentrationH2OProperty')
    });
    this.addLinkedElement(derivedProperties.concentrationH3OProperty, {
      tandem: options.tandem.createTandem('concentrationH3OProperty')
    });
    this.addLinkedElement(derivedProperties.concentrationOHProperty, {
      tandem: options.tandem.createTandem('concentrationOHProperty')
    });

    // Link to quantity Properties, see https://github.com/phetsims/ph-scale/issues/125
    this.addLinkedElement(derivedProperties.quantityH2OProperty, {
      tandem: options.tandem.createTandem('quantityH2OProperty')
    });
    this.addLinkedElement(derivedProperties.quantityH3OProperty, {
      tandem: options.tandem.createTandem('quantityH3OProperty')
    });
    this.addLinkedElement(derivedProperties.quantityOHProperty, {
      tandem: options.tandem.createTandem('quantityOHProperty')
    });

    // keyboard traversal order, see https://github.com/phetsims/ph-scale/issues/249
    this.pdomOrder = pdomOrder;
  }
  reset() {
    this.resetGraphNode();
  }
}
phScale.register('GraphNode', GraphNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbnVtZXJhdGlvblByb3BlcnR5IiwiTGluZSIsIk5vZGUiLCJwaFNjYWxlIiwiR3JhcGhDb250cm9sUGFuZWwiLCJHcmFwaFNjYWxlIiwiR3JhcGhTY2FsZVN3aXRjaCIsIkdyYXBoVW5pdHMiLCJMaW5lYXJHcmFwaE5vZGUiLCJMb2dhcml0aG1pY0dyYXBoTm9kZSIsIm9wdGlvbml6ZSIsIkdyYXBoTm9kZSIsImNvbnN0cnVjdG9yIiwidG90YWxWb2x1bWVQcm9wZXJ0eSIsImRlcml2ZWRQcm9wZXJ0aWVzIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImxvZ1NjYWxlSGVpZ2h0IiwibGluZWFyU2NhbGVIZWlnaHQiLCJ1bml0cyIsIk1PTEVTX1BFUl9MSVRFUiIsImhhc0xpbmVhckZlYXR1cmUiLCJncmFwaFNjYWxlIiwiTE9HQVJJVEhNSUMiLCJwZG9tT3JkZXIiLCJleHBhbmRlZFByb3BlcnR5IiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiZ3JhcGhVbml0c1Byb3BlcnR5IiwiZ3JhcGhDb250cm9sUGFuZWwiLCJhZGRDaGlsZCIsInB1c2giLCJsaW5lVG9QYW5lbCIsInN0cm9rZSIsInZpc2libGVQcm9wZXJ0eSIsImxhenlMaW5rIiwidmlzaWJsZSIsImxvZ2FyaXRobWljR3JhcGhOb2RlIiwicEhQcm9wZXJ0eSIsInNjYWxlSGVpZ2h0IiwiY2VudGVyWCIsInkiLCJwYXJlbnROb2RlIiwiY2hpbGRyZW4iLCJib3R0b20iLCJsaW5rIiwiZXhwYW5kZWQiLCJsaW5lYXJHcmFwaE5vZGUiLCJncmFwaFNjYWxlUHJvcGVydHkiLCJncmFwaFNjYWxlU3dpdGNoIiwiYm91bmRzUHJvcGVydHkiLCJib3VuZHMiLCJ0b3AiLCJsaW5lVG9Td2l0Y2hOb2RlIiwibW92ZVRvQmFjayIsIkxJTkVBUiIsIm11dGF0ZSIsInJlc2V0R3JhcGhOb2RlIiwicmVzZXQiLCJhZGRMaW5rZWRFbGVtZW50IiwiY29uY2VudHJhdGlvbkgyT1Byb3BlcnR5IiwiY29uY2VudHJhdGlvbkgzT1Byb3BlcnR5IiwiY29uY2VudHJhdGlvbk9IUHJvcGVydHkiLCJxdWFudGl0eUgyT1Byb3BlcnR5IiwicXVhbnRpdHlIM09Qcm9wZXJ0eSIsInF1YW50aXR5T0hQcm9wZXJ0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR3JhcGhOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbnRhaW5lciBmb3IgYWxsIGNvbXBvbmVudHMgcmVsYXRlZCB0byB0aGUgZ3JhcGggZmVhdHVyZS5cclxuICogSXQgaGFzIGFuIGV4cGFuZC9jb2xsYXBzZSBiYXIgYXQgdGhlIHRvcCBvZiBpdCwgYW5kIGNhbiBzd2l0Y2ggYmV0d2VlbiAnY29uY2VudHJhdGlvbicgYW5kICdxdWFudGl0eScuXHJcbiAqIExvZ2FyaXRobWljIGdyYXBoIGlzIHRoZSBzdGFuZGFyZCBzY2FsZS4gSW50ZXJhY3Rpdml0eSBhbmQgYSBsaW5lYXIgc2NhbGUgYXJlIG9wdGlvbmFsLlxyXG4gKiBPcmlnaW4gaXMgYXQgdG9wLWxlZnQgb2YgdGhlIGV4cGFuZC9jb2xsYXBzZSBiYXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IExpbmUsIE5vZGUsIE5vZGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHBoU2NhbGUgZnJvbSAnLi4vLi4vLi4vcGhTY2FsZS5qcyc7XHJcbmltcG9ydCBTb2x1dGlvbkRlcml2ZWRQcm9wZXJ0aWVzIGZyb20gJy4uLy4uL21vZGVsL1NvbHV0aW9uRGVyaXZlZFByb3BlcnRpZXMuanMnO1xyXG5pbXBvcnQgR3JhcGhDb250cm9sUGFuZWwgZnJvbSAnLi9HcmFwaENvbnRyb2xQYW5lbC5qcyc7XHJcbmltcG9ydCBHcmFwaFNjYWxlIGZyb20gJy4vR3JhcGhTY2FsZS5qcyc7XHJcbmltcG9ydCBHcmFwaFNjYWxlU3dpdGNoIGZyb20gJy4vR3JhcGhTY2FsZVN3aXRjaC5qcyc7XHJcbmltcG9ydCBHcmFwaFVuaXRzIGZyb20gJy4vR3JhcGhVbml0cy5qcyc7XHJcbmltcG9ydCBMaW5lYXJHcmFwaE5vZGUgZnJvbSAnLi9MaW5lYXJHcmFwaE5vZGUuanMnO1xyXG5pbXBvcnQgTG9nYXJpdGhtaWNHcmFwaE5vZGUsIHsgTG9nYXJpdGhtaWNHcmFwaE5vZGVPcHRpb25zIH0gZnJvbSAnLi9Mb2dhcml0aG1pY0dyYXBoTm9kZS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgbG9nU2NhbGVIZWlnaHQ/OiBudW1iZXI7XHJcbiAgbGluZWFyU2NhbGVIZWlnaHQ/OiBudW1iZXI7XHJcbiAgdW5pdHM/OiBHcmFwaFVuaXRzOyAvLyBpbml0aWFsIHN0YXRlIG9mIHRoZSB1bml0cyBzd2l0Y2hcclxuICBoYXNMaW5lYXJGZWF0dXJlPzogYm9vbGVhbjsgLy8gYWRkIHRoZSBsaW5lYXIgZ3JhcGggZmVhdHVyZT9cclxuICBncmFwaFNjYWxlPzogR3JhcGhTY2FsZTsgLy8gaW5pdGlhbCBzdGF0ZSBvZiB0aGUgc2NhbGUgc3dpdGNoLCBtZWFuaW5nZnVsIG9ubHkgaWYgaGFzTGluZWFyRmVhdHVyZSA9PT0gdHJ1ZVxyXG59ICYgUGlja1JlcXVpcmVkPExvZ2FyaXRobWljR3JhcGhOb2RlT3B0aW9ucywgJ3BIUHJvcGVydHknPjtcclxuXHJcbnR5cGUgR3JhcGhOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPE5vZGVPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmFwaE5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSByZXNldEdyYXBoTm9kZTogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0b3RhbFZvbHVtZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgZGVyaXZlZFByb3BlcnRpZXM6IFNvbHV0aW9uRGVyaXZlZFByb3BlcnRpZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IEdyYXBoTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxHcmFwaE5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcclxuICAgICAgbG9nU2NhbGVIZWlnaHQ6IDUwMCxcclxuICAgICAgbGluZWFyU2NhbGVIZWlnaHQ6IDUwMCxcclxuICAgICAgdW5pdHM6IEdyYXBoVW5pdHMuTU9MRVNfUEVSX0xJVEVSLFxyXG4gICAgICBoYXNMaW5lYXJGZWF0dXJlOiBmYWxzZSxcclxuICAgICAgZ3JhcGhTY2FsZTogR3JhcGhTY2FsZS5MT0dBUklUSE1JQ1xyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICBjb25zdCBwZG9tT3JkZXIgPSBbXTtcclxuXHJcbiAgICAvLyB3aGV0aGVyIHRoZSBncmFwaCBpcyBleHBhbmRlZCBvciBjb2xsYXBzZWRcclxuICAgIGNvbnN0IGV4cGFuZGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZXhwYW5kZWRQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHVuaXRzIHVzZWQgZm9yIHRoZSBncmFwaFxyXG4gICAgY29uc3QgZ3JhcGhVbml0c1Byb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uUHJvcGVydHkoIG9wdGlvbnMudW5pdHMsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdncmFwaFVuaXRzUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjb250cm9sIHBhbmVsIGFib3ZlIHRoZSBncmFwaFxyXG4gICAgY29uc3QgZ3JhcGhDb250cm9sUGFuZWwgPSBuZXcgR3JhcGhDb250cm9sUGFuZWwoIGdyYXBoVW5pdHNQcm9wZXJ0eSwgZXhwYW5kZWRQcm9wZXJ0eSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2dyYXBoQ29udHJvbFBhbmVsJyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBncmFwaENvbnRyb2xQYW5lbCApO1xyXG4gICAgcGRvbU9yZGVyLnB1c2goIGdyYXBoQ29udHJvbFBhbmVsICk7XHJcblxyXG4gICAgLy8gdmVydGljYWwgbGluZSB0aGF0IGNvbm5lY3RzIGJvdHRvbSBvZiBncmFwaENvbnRyb2xQYW5lbCB0byB0b3Agb2YgZ3JhcGhcclxuICAgIGNvbnN0IGxpbmVUb1BhbmVsID0gbmV3IExpbmUoIDAsIDAsIDAsIDc1LCB7IHN0cm9rZTogJ2JsYWNrJyB9ICk7XHJcbiAgICBncmFwaENvbnRyb2xQYW5lbC52aXNpYmxlUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcclxuICAgICAgbGluZVRvUGFuZWwudmlzaWJsZSA9IGdyYXBoQ29udHJvbFBhbmVsLnZpc2libGU7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gbG9nYXJpdGhtaWMgZ3JhcGhcclxuICAgIGNvbnN0IGxvZ2FyaXRobWljR3JhcGhOb2RlID0gbmV3IExvZ2FyaXRobWljR3JhcGhOb2RlKCB0b3RhbFZvbHVtZVByb3BlcnR5LCBkZXJpdmVkUHJvcGVydGllcywgZ3JhcGhVbml0c1Byb3BlcnR5LCB7XHJcbiAgICAgIHBIUHJvcGVydHk6IG9wdGlvbnMucEhQcm9wZXJ0eSxcclxuICAgICAgc2NhbGVIZWlnaHQ6IG9wdGlvbnMubG9nU2NhbGVIZWlnaHQsXHJcbiAgICAgIGNlbnRlclg6IGxpbmVUb1BhbmVsLmNlbnRlclgsXHJcbiAgICAgIHk6IDMwLCAvLyB5LCBub3QgdG9wXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbG9nYXJpdGhtaWNHcmFwaE5vZGUnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBwYXJlbnQgZm9yIHRoaW5ncyB3aG9zZSB2aXNpYmlsaXR5IHdpbGwgYmUgY29udHJvbGxlZCBieSBleHBhbmRQcm9wZXJ0eVxyXG4gICAgY29uc3QgcGFyZW50Tm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIGxpbmVUb1BhbmVsLCBsb2dhcml0aG1pY0dyYXBoTm9kZSBdLFxyXG4gICAgICBjZW50ZXJYOiBncmFwaENvbnRyb2xQYW5lbC5jZW50ZXJYLFxyXG4gICAgICB5OiBncmFwaENvbnRyb2xQYW5lbC5ib3R0b20gLy8geSwgbm90IHRvcFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcGFyZW50Tm9kZSApO1xyXG5cclxuICAgIC8vIGNvbnRyb2xzIHRoZSB2aXNpYmlsaXR5IG9mIHBhcmVudE5vZGVcclxuICAgIGV4cGFuZGVkUHJvcGVydHkubGluayggZXhwYW5kZWQgPT4ge1xyXG4gICAgICBwYXJlbnROb2RlLnZpc2libGUgPSBleHBhbmRlZDtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBvcHRpb25hbCBsaW5lYXIgZ3JhcGhcclxuICAgIGxldCBsaW5lYXJHcmFwaE5vZGU6IExpbmVhckdyYXBoTm9kZTtcclxuICAgIGxldCBncmFwaFNjYWxlUHJvcGVydHk6IEVudW1lcmF0aW9uUHJvcGVydHk8R3JhcGhTY2FsZT47XHJcbiAgICBpZiAoIG9wdGlvbnMuaGFzTGluZWFyRmVhdHVyZSApIHtcclxuXHJcbiAgICAgIC8vIHNjYWxlIChsb2csIGxpbmVhcikgb2YgdGhlIGdyYXBoXHJcbiAgICAgIGdyYXBoU2NhbGVQcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvblByb3BlcnR5KCBvcHRpb25zLmdyYXBoU2NhbGUsIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2dyYXBoU2NhbGVQcm9wZXJ0eScgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBsaW5lYXIgZ3JhcGhcclxuICAgICAgbGluZWFyR3JhcGhOb2RlID0gbmV3IExpbmVhckdyYXBoTm9kZSggZGVyaXZlZFByb3BlcnRpZXMsIGdyYXBoVW5pdHNQcm9wZXJ0eSwge1xyXG4gICAgICAgIHNjYWxlSGVpZ2h0OiBvcHRpb25zLmxpbmVhclNjYWxlSGVpZ2h0LFxyXG4gICAgICAgIHk6IGxvZ2FyaXRobWljR3JhcGhOb2RlLnksIC8vIHksIG5vdCB0b3BcclxuICAgICAgICBjZW50ZXJYOiBsb2dhcml0aG1pY0dyYXBoTm9kZS5jZW50ZXJYLFxyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGluZWFyR3JhcGhOb2RlJyApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIHNjYWxlIHN3aXRjaCAoTG9nYXJpdGhtaWMgdnMgTGluZWFyKVxyXG4gICAgICBjb25zdCBncmFwaFNjYWxlU3dpdGNoID0gbmV3IEdyYXBoU2NhbGVTd2l0Y2goIGdyYXBoU2NhbGVQcm9wZXJ0eSwge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZ3JhcGhTY2FsZVN3aXRjaCcgKVxyXG4gICAgICB9ICk7XHJcbiAgICAgIGdyYXBoU2NhbGVTd2l0Y2guYm91bmRzUHJvcGVydHkubGluayggYm91bmRzID0+IHtcclxuICAgICAgICBncmFwaFNjYWxlU3dpdGNoLmNlbnRlclggPSBsaW5lVG9QYW5lbC5jZW50ZXJYO1xyXG4gICAgICAgIGdyYXBoU2NhbGVTd2l0Y2gudG9wID0gbGluZWFyR3JhcGhOb2RlLmJvdHRvbSArIDE1O1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHBkb21PcmRlci5wdXNoKCBncmFwaFNjYWxlU3dpdGNoICk7XHJcbiAgICAgIHBkb21PcmRlci5wdXNoKCBsaW5lYXJHcmFwaE5vZGUgKTtcclxuXHJcbiAgICAgIC8vIHZlcnRpY2FsIGxpbmUgdGhhdCBjb25uZWN0cyBib3R0b20gb2YgZ3JhcGggdG8gdG9wIG9mIHNjYWxlIHN3aXRjaFxyXG4gICAgICBjb25zdCBsaW5lVG9Td2l0Y2hOb2RlID0gbmV3IExpbmUoIDAsIDAsIDAsIDIwMCwge1xyXG4gICAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgICBjZW50ZXJYOiBsaW5lVG9QYW5lbC5jZW50ZXJYLFxyXG4gICAgICAgIGJvdHRvbTogZ3JhcGhTY2FsZVN3aXRjaC50b3AgKyAxXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGdyYXBoU2NhbGVTd2l0Y2gudmlzaWJsZVByb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XHJcbiAgICAgICAgbGluZVRvU3dpdGNoTm9kZS52aXNpYmxlID0gZ3JhcGhTY2FsZVN3aXRjaC52aXNpYmxlO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBhZGQgZXZlcnl0aGluZyB0byBwYXJlbnROb2RlLCBzaW5jZSB0aGVpciB2aXNpYmlsaXR5IGlzIGNvbnRyb2xsZWQgYnkgZXhwYW5kZWRQcm9wZXJ0eVxyXG4gICAgICBwYXJlbnROb2RlLmFkZENoaWxkKCBsaW5lVG9Td2l0Y2hOb2RlICk7XHJcbiAgICAgIGxpbmVUb1N3aXRjaE5vZGUubW92ZVRvQmFjaygpO1xyXG4gICAgICBwYXJlbnROb2RlLmFkZENoaWxkKCBsaW5lYXJHcmFwaE5vZGUgKTtcclxuICAgICAgcGFyZW50Tm9kZS5hZGRDaGlsZCggZ3JhcGhTY2FsZVN3aXRjaCApO1xyXG5cclxuICAgICAgLy8gaGFuZGxlIHNjYWxlIGNoYW5nZXNcclxuICAgICAgZ3JhcGhTY2FsZVByb3BlcnR5LmxpbmsoIGdyYXBoU2NhbGUgPT4ge1xyXG4gICAgICAgIGxvZ2FyaXRobWljR3JhcGhOb2RlLnZpc2libGUgPSAoIGdyYXBoU2NhbGUgPT09IEdyYXBoU2NhbGUuTE9HQVJJVEhNSUMgKTtcclxuICAgICAgICBsaW5lYXJHcmFwaE5vZGUudmlzaWJsZSA9ICggZ3JhcGhTY2FsZSA9PT0gR3JhcGhTY2FsZS5MSU5FQVIgKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgcGRvbU9yZGVyLnB1c2goIGxvZ2FyaXRobWljR3JhcGhOb2RlICk7XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnJlc2V0R3JhcGhOb2RlID0gKCkgPT4ge1xyXG4gICAgICBleHBhbmRlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICAgIGdyYXBoVW5pdHNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICBncmFwaFNjYWxlUHJvcGVydHkgJiYgZ3JhcGhTY2FsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICAgIGxpbmVhckdyYXBoTm9kZSAmJiBsaW5lYXJHcmFwaE5vZGUucmVzZXQoKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gTGluayB0byBjb25jZW50cmF0aW9uIFByb3BlcnRpZXMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGgtc2NhbGUvaXNzdWVzLzEyNVxyXG4gICAgdGhpcy5hZGRMaW5rZWRFbGVtZW50KCBkZXJpdmVkUHJvcGVydGllcy5jb25jZW50cmF0aW9uSDJPUHJvcGVydHksIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb25jZW50cmF0aW9uSDJPUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkTGlua2VkRWxlbWVudCggZGVyaXZlZFByb3BlcnRpZXMuY29uY2VudHJhdGlvbkgzT1Byb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnY29uY2VudHJhdGlvbkgzT1Byb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZExpbmtlZEVsZW1lbnQoIGRlcml2ZWRQcm9wZXJ0aWVzLmNvbmNlbnRyYXRpb25PSFByb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnY29uY2VudHJhdGlvbk9IUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBMaW5rIHRvIHF1YW50aXR5IFByb3BlcnRpZXMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGgtc2NhbGUvaXNzdWVzLzEyNVxyXG4gICAgdGhpcy5hZGRMaW5rZWRFbGVtZW50KCBkZXJpdmVkUHJvcGVydGllcy5xdWFudGl0eUgyT1Byb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncXVhbnRpdHlIMk9Qcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRMaW5rZWRFbGVtZW50KCBkZXJpdmVkUHJvcGVydGllcy5xdWFudGl0eUgzT1Byb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncXVhbnRpdHlIM09Qcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRMaW5rZWRFbGVtZW50KCBkZXJpdmVkUHJvcGVydGllcy5xdWFudGl0eU9IUHJvcGVydHksIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdxdWFudGl0eU9IUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBrZXlib2FyZCB0cmF2ZXJzYWwgb3JkZXIsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGgtc2NhbGUvaXNzdWVzLzI0OVxyXG4gICAgdGhpcy5wZG9tT3JkZXIgPSBwZG9tT3JkZXI7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnJlc2V0R3JhcGhOb2RlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5waFNjYWxlLnJlZ2lzdGVyKCAnR3JhcGhOb2RlJywgR3JhcGhOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSwyQ0FBMkM7QUFDdkUsT0FBT0MsbUJBQW1CLE1BQU0sK0NBQStDO0FBQy9FLFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFxQixzQ0FBc0M7QUFDOUUsT0FBT0MsT0FBTyxNQUFNLHFCQUFxQjtBQUV6QyxPQUFPQyxpQkFBaUIsTUFBTSx3QkFBd0I7QUFDdEQsT0FBT0MsVUFBVSxNQUFNLGlCQUFpQjtBQUN4QyxPQUFPQyxnQkFBZ0IsTUFBTSx1QkFBdUI7QUFDcEQsT0FBT0MsVUFBVSxNQUFNLGlCQUFpQjtBQUN4QyxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBQ2xELE9BQU9DLG9CQUFvQixNQUF1QywyQkFBMkI7QUFHN0YsT0FBT0MsU0FBUyxNQUFNLDBDQUEwQztBQVloRSxlQUFlLE1BQU1DLFNBQVMsU0FBU1QsSUFBSSxDQUFDO0VBSW5DVSxXQUFXQSxDQUFF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