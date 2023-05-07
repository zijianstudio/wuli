// Copyright 2023, University of Colorado Boulder

/**
 * GraphSetsAnimator handles the animation between 2 GraphSets. The animation consists of a sequence of 3 steps:
 * (1) Fade out nodes that are not included in the new GraphSet.
 * (2) Move nodes to their new positions
 * (3) Fade in nodes that are new to the new GraphSet.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import calculusGrapher from '../../calculusGrapher.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
const STEPPER = null; // step method must be called by the client
const OPACITY_DURATION = 0.5; // duration of opacity animation, in seconds
const TRANSLATION_DURATION = 0.5; // duration of translation animation, in seconds
const TINY_DURATION = 0.001;
export default class GraphSetsAnimator {
  // For animating opacity of a Node

  // For animating translation, this is the percentage of distance between a start point and end point

  // Animation for each piece of the animation sequence. These are null when animation is not running.

  // The Animation instance that is currently running, and should therefore be advanced by the step method.

  constructor(tandem) {
    this.fadeOutOpacityProperty = new NumberProperty(1, {
      isValidValue: opacity => opacity >= 0 && opacity <= 1
    });
    this.fadeInOpacityProperty = new NumberProperty(0, {
      isValidValue: opacity => opacity >= 0 && opacity <= 1
    });
    this.percentDistanceProperty = new NumberProperty(0, {
      isValidValue: opacity => opacity >= 0 && opacity <= 1
    });
    this.fadeOutAnimation = null;
    this.fadeInAnimation = null;
    this.translationAnimation = null;
    this.activeAnimation = null;
  }

  /**
   * Switches between 2 graph sets.
   * @param graphSetNode - parent Node for the GraphNodes
   * @param oldGraphNodes - the current children of graphSetNode, null if it has no children
   * @param newGraphNodes - the new children of graphSetNode
   * @param chartRectangleHeight - the height of one GraphNode's ChartRectangle
   * @param ySpacing - the vertical spacing between GraphNode instances
   */
  changeGraphSets(graphSetNode, oldGraphNodes, newGraphNodes, chartRectangleHeight, ySpacing) {
    // Stop any animations that are in progress.
    this.fadeOutAnimation && this.fadeOutAnimation.stop();
    this.fadeInAnimation && this.fadeInAnimation.stop();
    this.translationAnimation && this.translationAnimation.stop();

    // Compute positions for GraphNodes in the new set. They are in top-to-bottom order.
    const x = newGraphNodes[0].x;
    const yEndCoordinates = [0];
    for (let i = 1; i < newGraphNodes.length; i++) {
      yEndCoordinates.push(yEndCoordinates[i - 1] + chartRectangleHeight + ySpacing);
    }

    // Move immediately to the new state if:
    // there are no old GraphNodes, an animation was in progress, or we're restoring PhET-iO state.
    if (!oldGraphNodes || this.activeAnimation || phet.joist.sim.isSettingPhetioStateProperty.value) {
      this.activeAnimation = null;

      // Add the new set of GraphNodes to the scene graph.
      graphSetNode.children = newGraphNodes;

      // Move the new set of GraphNodes to their new positions, and make them all fully opaque.
      for (let i = 0; i < newGraphNodes.length; i++) {
        newGraphNodes[i].x = x;
        newGraphNodes[i].y = yEndCoordinates[i];
        newGraphNodes[i].opacity = 1;
      }
    } else {
      //------------------------------------------------------------------------------------------------------------
      // Fade out GraphNodes that are being added (in oldGraphNodes, but not in newGraphNodes).
      //------------------------------------------------------------------------------------------------------------

      const graphNodesToRemove = oldGraphNodes.filter(graphNode => !newGraphNodes.includes(graphNode));
      this.fadeOutOpacityProperty.unlinkAll();
      this.fadeOutOpacityProperty.lazyLink(opacity => {
        graphNodesToRemove.forEach(graphNode => graphNode.setOpacity(opacity));
      });
      this.fadeOutAnimation = new Animation({
        stepEmitter: STEPPER,
        duration: graphNodesToRemove.length > 0 ? OPACITY_DURATION : TINY_DURATION,
        targets: [{
          property: this.fadeOutOpacityProperty,
          easing: Easing.LINEAR,
          from: 1,
          to: 0
        }]
      });
      this.fadeOutAnimation.startEmitter.addListener(() => {
        this.activeAnimation = this.fadeOutAnimation;
      });
      this.fadeOutAnimation.finishEmitter.addListener(() => {
        graphNodesToRemove.forEach(node => graphSetNode.removeChild(node));
        this.activeAnimation = null;
        this.fadeOutAnimation = null;
        this.fadeOutOpacityProperty.unlinkAll();
        assert && assert(this.translationAnimation);
        this.translationAnimation.start();
      });

      //------------------------------------------------------------------------------------------------------------
      // Translate GraphNodes to their new positions. Note that this includes GraphNodes that are new to
      // the GraphSet, and will not be visible until fadeInAnimation runs.
      //------------------------------------------------------------------------------------------------------------

      const yStartCoordinates = newGraphNodes.map(graphNode => graphNode.y);
      assert && assert(yStartCoordinates.length === yEndCoordinates.length);
      this.percentDistanceProperty.unlinkAll();
      this.percentDistanceProperty.lazyLink(percentDistance => {
        for (let i = 0; i < newGraphNodes.length; i++) {
          const graphNode = newGraphNodes[i];
          const yStart = yStartCoordinates[i];
          const yEnd = yEndCoordinates[newGraphNodes.indexOf(graphNode)];
          graphNode.x = x;
          graphNode.y = yStart + percentDistance * (yEnd - yStart);
        }
      });
      this.translationAnimation = new Animation({
        stepEmitter: STEPPER,
        duration: newGraphNodes.length > 0 ? TRANSLATION_DURATION : TINY_DURATION,
        targets: [{
          property: this.percentDistanceProperty,
          easing: Easing.LINEAR,
          from: 0,
          to: 1
        }]
      });
      this.translationAnimation.startEmitter.addListener(() => {
        this.activeAnimation = this.translationAnimation;
      });
      this.translationAnimation.finishEmitter.addListener(() => {
        this.activeAnimation = null;
        this.translationAnimation = null;
        this.percentDistanceProperty.unlinkAll();
        assert && assert(this.fadeInAnimation);
        this.fadeInAnimation.start();
      });

      //------------------------------------------------------------------------------------------------------------
      // Fade in GraphNodes that are being added (in newGraphNodes, but not in oldGraphNodes).
      //------------------------------------------------------------------------------------------------------------

      const graphNodesToAdd = newGraphNodes.filter(graphNode => !oldGraphNodes.includes(graphNode));
      this.fadeInOpacityProperty.unlinkAll();
      this.fadeInOpacityProperty.link(opacity => {
        graphNodesToAdd.forEach(graphNode => graphNode.setOpacity(opacity));
      });
      this.fadeInAnimation = new Animation({
        stepEmitter: STEPPER,
        duration: graphNodesToAdd.length > 0 ? OPACITY_DURATION : TINY_DURATION,
        targets: [{
          property: this.fadeInOpacityProperty,
          easing: Easing.LINEAR,
          from: 0,
          to: 1
        }]
      });
      this.fadeInAnimation.startEmitter.addListener(() => {
        graphNodesToAdd.forEach(graphNode => graphSetNode.addChild(graphNode));
        this.activeAnimation = this.fadeInAnimation;
      });
      this.fadeInAnimation.finishEmitter.addListener(() => {
        assert && assert(_.every(newGraphNodes, graphNode => graphSetNode.hasChild(graphNode)));
        assert && assert(_.every(newGraphNodes, graphNode => graphNode.opacity === 1));
        this.activeAnimation = null;
        this.fadeInAnimation = null;
        this.fadeInOpacityProperty.unlinkAll();
      });

      // ... and away we go.
      this.fadeOutAnimation.start();
    }
  }
  step(dt) {
    this.activeAnimation && this.activeAnimation.step(dt);
  }
}
calculusGrapher.register('GraphSetsAnimator', GraphSetsAnimator);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjYWxjdWx1c0dyYXBoZXIiLCJOdW1iZXJQcm9wZXJ0eSIsIkFuaW1hdGlvbiIsIkVhc2luZyIsIlNURVBQRVIiLCJPUEFDSVRZX0RVUkFUSU9OIiwiVFJBTlNMQVRJT05fRFVSQVRJT04iLCJUSU5ZX0RVUkFUSU9OIiwiR3JhcGhTZXRzQW5pbWF0b3IiLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsImZhZGVPdXRPcGFjaXR5UHJvcGVydHkiLCJpc1ZhbGlkVmFsdWUiLCJvcGFjaXR5IiwiZmFkZUluT3BhY2l0eVByb3BlcnR5IiwicGVyY2VudERpc3RhbmNlUHJvcGVydHkiLCJmYWRlT3V0QW5pbWF0aW9uIiwiZmFkZUluQW5pbWF0aW9uIiwidHJhbnNsYXRpb25BbmltYXRpb24iLCJhY3RpdmVBbmltYXRpb24iLCJjaGFuZ2VHcmFwaFNldHMiLCJncmFwaFNldE5vZGUiLCJvbGRHcmFwaE5vZGVzIiwibmV3R3JhcGhOb2RlcyIsImNoYXJ0UmVjdGFuZ2xlSGVpZ2h0IiwieVNwYWNpbmciLCJzdG9wIiwieCIsInlFbmRDb29yZGluYXRlcyIsImkiLCJsZW5ndGgiLCJwdXNoIiwicGhldCIsImpvaXN0Iiwic2ltIiwiaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSIsInZhbHVlIiwiY2hpbGRyZW4iLCJ5IiwiZ3JhcGhOb2Rlc1RvUmVtb3ZlIiwiZmlsdGVyIiwiZ3JhcGhOb2RlIiwiaW5jbHVkZXMiLCJ1bmxpbmtBbGwiLCJsYXp5TGluayIsImZvckVhY2giLCJzZXRPcGFjaXR5Iiwic3RlcEVtaXR0ZXIiLCJkdXJhdGlvbiIsInRhcmdldHMiLCJwcm9wZXJ0eSIsImVhc2luZyIsIkxJTkVBUiIsImZyb20iLCJ0byIsInN0YXJ0RW1pdHRlciIsImFkZExpc3RlbmVyIiwiZmluaXNoRW1pdHRlciIsIm5vZGUiLCJyZW1vdmVDaGlsZCIsImFzc2VydCIsInN0YXJ0IiwieVN0YXJ0Q29vcmRpbmF0ZXMiLCJtYXAiLCJwZXJjZW50RGlzdGFuY2UiLCJ5U3RhcnQiLCJ5RW5kIiwiaW5kZXhPZiIsImdyYXBoTm9kZXNUb0FkZCIsImxpbmsiLCJhZGRDaGlsZCIsIl8iLCJldmVyeSIsImhhc0NoaWxkIiwic3RlcCIsImR0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHcmFwaFNldHNBbmltYXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR3JhcGhTZXRzQW5pbWF0b3IgaGFuZGxlcyB0aGUgYW5pbWF0aW9uIGJldHdlZW4gMiBHcmFwaFNldHMuIFRoZSBhbmltYXRpb24gY29uc2lzdHMgb2YgYSBzZXF1ZW5jZSBvZiAzIHN0ZXBzOlxyXG4gKiAoMSkgRmFkZSBvdXQgbm9kZXMgdGhhdCBhcmUgbm90IGluY2x1ZGVkIGluIHRoZSBuZXcgR3JhcGhTZXQuXHJcbiAqICgyKSBNb3ZlIG5vZGVzIHRvIHRoZWlyIG5ldyBwb3NpdGlvbnNcclxuICogKDMpIEZhZGUgaW4gbm9kZXMgdGhhdCBhcmUgbmV3IHRvIHRoZSBuZXcgR3JhcGhTZXQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IGNhbGN1bHVzR3JhcGhlciBmcm9tICcuLi8uLi9jYWxjdWx1c0dyYXBoZXIuanMnO1xyXG5pbXBvcnQgR3JhcGhOb2RlIGZyb20gJy4vR3JhcGhOb2RlLmpzJztcclxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IEFuaW1hdGlvbiBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9BbmltYXRpb24uanMnO1xyXG5pbXBvcnQgRWFzaW5nIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0Vhc2luZy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcblxyXG5jb25zdCBTVEVQUEVSID0gbnVsbDsgLy8gc3RlcCBtZXRob2QgbXVzdCBiZSBjYWxsZWQgYnkgdGhlIGNsaWVudFxyXG5jb25zdCBPUEFDSVRZX0RVUkFUSU9OID0gMC41OyAvLyBkdXJhdGlvbiBvZiBvcGFjaXR5IGFuaW1hdGlvbiwgaW4gc2Vjb25kc1xyXG5jb25zdCBUUkFOU0xBVElPTl9EVVJBVElPTiA9IDAuNTsgLy8gZHVyYXRpb24gb2YgdHJhbnNsYXRpb24gYW5pbWF0aW9uLCBpbiBzZWNvbmRzXHJcbmNvbnN0IFRJTllfRFVSQVRJT04gPSAwLjAwMTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyYXBoU2V0c0FuaW1hdG9yIHtcclxuXHJcbiAgLy8gRm9yIGFuaW1hdGluZyBvcGFjaXR5IG9mIGEgTm9kZVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZmFkZU91dE9wYWNpdHlQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBmYWRlSW5PcGFjaXR5UHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG5cclxuICAvLyBGb3IgYW5pbWF0aW5nIHRyYW5zbGF0aW9uLCB0aGlzIGlzIHRoZSBwZXJjZW50YWdlIG9mIGRpc3RhbmNlIGJldHdlZW4gYSBzdGFydCBwb2ludCBhbmQgZW5kIHBvaW50XHJcbiAgcHJpdmF0ZSByZWFkb25seSBwZXJjZW50RGlzdGFuY2VQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XHJcblxyXG4gIC8vIEFuaW1hdGlvbiBmb3IgZWFjaCBwaWVjZSBvZiB0aGUgYW5pbWF0aW9uIHNlcXVlbmNlLiBUaGVzZSBhcmUgbnVsbCB3aGVuIGFuaW1hdGlvbiBpcyBub3QgcnVubmluZy5cclxuICBwcml2YXRlIGZhZGVPdXRBbmltYXRpb246IEFuaW1hdGlvbiB8IG51bGw7XHJcbiAgcHJpdmF0ZSBmYWRlSW5BbmltYXRpb246IEFuaW1hdGlvbiB8IG51bGw7XHJcbiAgcHJpdmF0ZSB0cmFuc2xhdGlvbkFuaW1hdGlvbjogQW5pbWF0aW9uIHwgbnVsbDtcclxuXHJcbiAgLy8gVGhlIEFuaW1hdGlvbiBpbnN0YW5jZSB0aGF0IGlzIGN1cnJlbnRseSBydW5uaW5nLCBhbmQgc2hvdWxkIHRoZXJlZm9yZSBiZSBhZHZhbmNlZCBieSB0aGUgc3RlcCBtZXRob2QuXHJcbiAgcHJpdmF0ZSBhY3RpdmVBbmltYXRpb246IEFuaW1hdGlvbiB8IG51bGw7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgdGhpcy5mYWRlT3V0T3BhY2l0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxLCB7XHJcbiAgICAgIGlzVmFsaWRWYWx1ZTogb3BhY2l0eSA9PiAoIG9wYWNpdHkgPj0gMCAmJiBvcGFjaXR5IDw9IDEgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZmFkZUluT3BhY2l0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIGlzVmFsaWRWYWx1ZTogb3BhY2l0eSA9PiAoIG9wYWNpdHkgPj0gMCAmJiBvcGFjaXR5IDw9IDEgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMucGVyY2VudERpc3RhbmNlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgaXNWYWxpZFZhbHVlOiBvcGFjaXR5ID0+ICggb3BhY2l0eSA+PSAwICYmIG9wYWNpdHkgPD0gMSApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5mYWRlT3V0QW5pbWF0aW9uID0gbnVsbDtcclxuICAgIHRoaXMuZmFkZUluQW5pbWF0aW9uID0gbnVsbDtcclxuICAgIHRoaXMudHJhbnNsYXRpb25BbmltYXRpb24gPSBudWxsO1xyXG4gICAgdGhpcy5hY3RpdmVBbmltYXRpb24gPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3dpdGNoZXMgYmV0d2VlbiAyIGdyYXBoIHNldHMuXHJcbiAgICogQHBhcmFtIGdyYXBoU2V0Tm9kZSAtIHBhcmVudCBOb2RlIGZvciB0aGUgR3JhcGhOb2Rlc1xyXG4gICAqIEBwYXJhbSBvbGRHcmFwaE5vZGVzIC0gdGhlIGN1cnJlbnQgY2hpbGRyZW4gb2YgZ3JhcGhTZXROb2RlLCBudWxsIGlmIGl0IGhhcyBubyBjaGlsZHJlblxyXG4gICAqIEBwYXJhbSBuZXdHcmFwaE5vZGVzIC0gdGhlIG5ldyBjaGlsZHJlbiBvZiBncmFwaFNldE5vZGVcclxuICAgKiBAcGFyYW0gY2hhcnRSZWN0YW5nbGVIZWlnaHQgLSB0aGUgaGVpZ2h0IG9mIG9uZSBHcmFwaE5vZGUncyBDaGFydFJlY3RhbmdsZVxyXG4gICAqIEBwYXJhbSB5U3BhY2luZyAtIHRoZSB2ZXJ0aWNhbCBzcGFjaW5nIGJldHdlZW4gR3JhcGhOb2RlIGluc3RhbmNlc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBjaGFuZ2VHcmFwaFNldHMoIGdyYXBoU2V0Tm9kZTogTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRHcmFwaE5vZGVzOiBHcmFwaE5vZGVbXSB8IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3R3JhcGhOb2RlczogR3JhcGhOb2RlW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRSZWN0YW5nbGVIZWlnaHQ6IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB5U3BhY2luZzogbnVtYmVyICk6IHZvaWQge1xyXG5cclxuICAgIC8vIFN0b3AgYW55IGFuaW1hdGlvbnMgdGhhdCBhcmUgaW4gcHJvZ3Jlc3MuXHJcbiAgICB0aGlzLmZhZGVPdXRBbmltYXRpb24gJiYgdGhpcy5mYWRlT3V0QW5pbWF0aW9uLnN0b3AoKTtcclxuICAgIHRoaXMuZmFkZUluQW5pbWF0aW9uICYmIHRoaXMuZmFkZUluQW5pbWF0aW9uLnN0b3AoKTtcclxuICAgIHRoaXMudHJhbnNsYXRpb25BbmltYXRpb24gJiYgdGhpcy50cmFuc2xhdGlvbkFuaW1hdGlvbi5zdG9wKCk7XHJcblxyXG4gICAgLy8gQ29tcHV0ZSBwb3NpdGlvbnMgZm9yIEdyYXBoTm9kZXMgaW4gdGhlIG5ldyBzZXQuIFRoZXkgYXJlIGluIHRvcC10by1ib3R0b20gb3JkZXIuXHJcbiAgICBjb25zdCB4ID0gbmV3R3JhcGhOb2Rlc1sgMCBdLng7XHJcbiAgICBjb25zdCB5RW5kQ29vcmRpbmF0ZXMgPSBbIDAgXTtcclxuICAgIGZvciAoIGxldCBpID0gMTsgaSA8IG5ld0dyYXBoTm9kZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHlFbmRDb29yZGluYXRlcy5wdXNoKCB5RW5kQ29vcmRpbmF0ZXNbIGkgLSAxIF0gKyBjaGFydFJlY3RhbmdsZUhlaWdodCArIHlTcGFjaW5nICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTW92ZSBpbW1lZGlhdGVseSB0byB0aGUgbmV3IHN0YXRlIGlmOlxyXG4gICAgLy8gdGhlcmUgYXJlIG5vIG9sZCBHcmFwaE5vZGVzLCBhbiBhbmltYXRpb24gd2FzIGluIHByb2dyZXNzLCBvciB3ZSdyZSByZXN0b3JpbmcgUGhFVC1pTyBzdGF0ZS5cclxuICAgIGlmICggIW9sZEdyYXBoTm9kZXMgfHwgdGhpcy5hY3RpdmVBbmltYXRpb24gfHwgcGhldC5qb2lzdC5zaW0uaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eS52YWx1ZSApIHtcclxuXHJcbiAgICAgIHRoaXMuYWN0aXZlQW5pbWF0aW9uID0gbnVsbDtcclxuXHJcbiAgICAgIC8vIEFkZCB0aGUgbmV3IHNldCBvZiBHcmFwaE5vZGVzIHRvIHRoZSBzY2VuZSBncmFwaC5cclxuICAgICAgZ3JhcGhTZXROb2RlLmNoaWxkcmVuID0gbmV3R3JhcGhOb2RlcztcclxuXHJcbiAgICAgIC8vIE1vdmUgdGhlIG5ldyBzZXQgb2YgR3JhcGhOb2RlcyB0byB0aGVpciBuZXcgcG9zaXRpb25zLCBhbmQgbWFrZSB0aGVtIGFsbCBmdWxseSBvcGFxdWUuXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG5ld0dyYXBoTm9kZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgbmV3R3JhcGhOb2Rlc1sgaSBdLnggPSB4O1xyXG4gICAgICAgIG5ld0dyYXBoTm9kZXNbIGkgXS55ID0geUVuZENvb3JkaW5hdGVzWyBpIF07XHJcbiAgICAgICAgbmV3R3JhcGhOb2Rlc1sgaSBdLm9wYWNpdHkgPSAxO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgIC8vIEZhZGUgb3V0IEdyYXBoTm9kZXMgdGhhdCBhcmUgYmVpbmcgYWRkZWQgKGluIG9sZEdyYXBoTm9kZXMsIGJ1dCBub3QgaW4gbmV3R3JhcGhOb2RlcykuXHJcbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICBjb25zdCBncmFwaE5vZGVzVG9SZW1vdmUgPSBvbGRHcmFwaE5vZGVzLmZpbHRlciggZ3JhcGhOb2RlID0+ICFuZXdHcmFwaE5vZGVzLmluY2x1ZGVzKCBncmFwaE5vZGUgKSApO1xyXG5cclxuICAgICAgdGhpcy5mYWRlT3V0T3BhY2l0eVByb3BlcnR5LnVubGlua0FsbCgpO1xyXG4gICAgICB0aGlzLmZhZGVPdXRPcGFjaXR5UHJvcGVydHkubGF6eUxpbmsoIG9wYWNpdHkgPT4ge1xyXG4gICAgICAgIGdyYXBoTm9kZXNUb1JlbW92ZS5mb3JFYWNoKCBncmFwaE5vZGUgPT4gZ3JhcGhOb2RlLnNldE9wYWNpdHkoIG9wYWNpdHkgKSApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICB0aGlzLmZhZGVPdXRBbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgICAgc3RlcEVtaXR0ZXI6IFNURVBQRVIsXHJcbiAgICAgICAgZHVyYXRpb246ICggZ3JhcGhOb2Rlc1RvUmVtb3ZlLmxlbmd0aCA+IDAgKSA/IE9QQUNJVFlfRFVSQVRJT04gOiBUSU5ZX0RVUkFUSU9OLFxyXG4gICAgICAgIHRhcmdldHM6IFsge1xyXG4gICAgICAgICAgcHJvcGVydHk6IHRoaXMuZmFkZU91dE9wYWNpdHlQcm9wZXJ0eSxcclxuICAgICAgICAgIGVhc2luZzogRWFzaW5nLkxJTkVBUixcclxuICAgICAgICAgIGZyb206IDEsXHJcbiAgICAgICAgICB0bzogMFxyXG4gICAgICAgIH0gXVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICB0aGlzLmZhZGVPdXRBbmltYXRpb24uc3RhcnRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVBbmltYXRpb24gPSB0aGlzLmZhZGVPdXRBbmltYXRpb247XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHRoaXMuZmFkZU91dEFuaW1hdGlvbi5maW5pc2hFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgICAgZ3JhcGhOb2Rlc1RvUmVtb3ZlLmZvckVhY2goIG5vZGUgPT4gZ3JhcGhTZXROb2RlLnJlbW92ZUNoaWxkKCBub2RlICkgKTtcclxuICAgICAgICB0aGlzLmFjdGl2ZUFuaW1hdGlvbiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5mYWRlT3V0QW5pbWF0aW9uID0gbnVsbDtcclxuICAgICAgICB0aGlzLmZhZGVPdXRPcGFjaXR5UHJvcGVydHkudW5saW5rQWxsKCk7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy50cmFuc2xhdGlvbkFuaW1hdGlvbiApO1xyXG4gICAgICAgIHRoaXMudHJhbnNsYXRpb25BbmltYXRpb24hLnN0YXJ0KCk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgIC8vIFRyYW5zbGF0ZSBHcmFwaE5vZGVzIHRvIHRoZWlyIG5ldyBwb3NpdGlvbnMuIE5vdGUgdGhhdCB0aGlzIGluY2x1ZGVzIEdyYXBoTm9kZXMgdGhhdCBhcmUgbmV3IHRvXHJcbiAgICAgIC8vIHRoZSBHcmFwaFNldCwgYW5kIHdpbGwgbm90IGJlIHZpc2libGUgdW50aWwgZmFkZUluQW5pbWF0aW9uIHJ1bnMuXHJcbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICBjb25zdCB5U3RhcnRDb29yZGluYXRlcyA9IG5ld0dyYXBoTm9kZXMubWFwKCBncmFwaE5vZGUgPT4gZ3JhcGhOb2RlLnkgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggeVN0YXJ0Q29vcmRpbmF0ZXMubGVuZ3RoID09PSB5RW5kQ29vcmRpbmF0ZXMubGVuZ3RoICk7XHJcblxyXG4gICAgICB0aGlzLnBlcmNlbnREaXN0YW5jZVByb3BlcnR5LnVubGlua0FsbCgpO1xyXG4gICAgICB0aGlzLnBlcmNlbnREaXN0YW5jZVByb3BlcnR5LmxhenlMaW5rKCBwZXJjZW50RGlzdGFuY2UgPT4ge1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG5ld0dyYXBoTm9kZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgICBjb25zdCBncmFwaE5vZGUgPSBuZXdHcmFwaE5vZGVzWyBpIF07XHJcbiAgICAgICAgICBjb25zdCB5U3RhcnQgPSB5U3RhcnRDb29yZGluYXRlc1sgaSBdO1xyXG4gICAgICAgICAgY29uc3QgeUVuZCA9IHlFbmRDb29yZGluYXRlc1sgbmV3R3JhcGhOb2Rlcy5pbmRleE9mKCBncmFwaE5vZGUgKSBdO1xyXG4gICAgICAgICAgZ3JhcGhOb2RlLnggPSB4O1xyXG4gICAgICAgICAgZ3JhcGhOb2RlLnkgPSB5U3RhcnQgKyBwZXJjZW50RGlzdGFuY2UgKiAoIHlFbmQgLSB5U3RhcnQgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHRoaXMudHJhbnNsYXRpb25BbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgICAgc3RlcEVtaXR0ZXI6IFNURVBQRVIsXHJcbiAgICAgICAgZHVyYXRpb246ICggbmV3R3JhcGhOb2Rlcy5sZW5ndGggPiAwICkgPyBUUkFOU0xBVElPTl9EVVJBVElPTiA6IFRJTllfRFVSQVRJT04sXHJcbiAgICAgICAgdGFyZ2V0czogWyB7XHJcbiAgICAgICAgICBwcm9wZXJ0eTogdGhpcy5wZXJjZW50RGlzdGFuY2VQcm9wZXJ0eSxcclxuICAgICAgICAgIGVhc2luZzogRWFzaW5nLkxJTkVBUixcclxuICAgICAgICAgIGZyb206IDAsXHJcbiAgICAgICAgICB0bzogMVxyXG4gICAgICAgIH0gXVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICB0aGlzLnRyYW5zbGF0aW9uQW5pbWF0aW9uLnN0YXJ0RW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlQW5pbWF0aW9uID0gdGhpcy50cmFuc2xhdGlvbkFuaW1hdGlvbjtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgdGhpcy50cmFuc2xhdGlvbkFuaW1hdGlvbi5maW5pc2hFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVBbmltYXRpb24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMudHJhbnNsYXRpb25BbmltYXRpb24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMucGVyY2VudERpc3RhbmNlUHJvcGVydHkudW5saW5rQWxsKCk7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5mYWRlSW5BbmltYXRpb24gKTtcclxuICAgICAgICB0aGlzLmZhZGVJbkFuaW1hdGlvbiEuc3RhcnQoKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgLy8gRmFkZSBpbiBHcmFwaE5vZGVzIHRoYXQgYXJlIGJlaW5nIGFkZGVkIChpbiBuZXdHcmFwaE5vZGVzLCBidXQgbm90IGluIG9sZEdyYXBoTm9kZXMpLlxyXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgY29uc3QgZ3JhcGhOb2Rlc1RvQWRkID0gbmV3R3JhcGhOb2Rlcy5maWx0ZXIoIGdyYXBoTm9kZSA9PiAhb2xkR3JhcGhOb2Rlcy5pbmNsdWRlcyggZ3JhcGhOb2RlICkgKTtcclxuXHJcbiAgICAgIHRoaXMuZmFkZUluT3BhY2l0eVByb3BlcnR5LnVubGlua0FsbCgpO1xyXG4gICAgICB0aGlzLmZhZGVJbk9wYWNpdHlQcm9wZXJ0eS5saW5rKCBvcGFjaXR5ID0+IHtcclxuICAgICAgICBncmFwaE5vZGVzVG9BZGQuZm9yRWFjaCggZ3JhcGhOb2RlID0+IGdyYXBoTm9kZS5zZXRPcGFjaXR5KCBvcGFjaXR5ICkgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgdGhpcy5mYWRlSW5BbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgICAgc3RlcEVtaXR0ZXI6IFNURVBQRVIsXHJcbiAgICAgICAgZHVyYXRpb246ICggZ3JhcGhOb2Rlc1RvQWRkLmxlbmd0aCA+IDAgKSA/IE9QQUNJVFlfRFVSQVRJT04gOiBUSU5ZX0RVUkFUSU9OLFxyXG4gICAgICAgIHRhcmdldHM6IFsge1xyXG4gICAgICAgICAgcHJvcGVydHk6IHRoaXMuZmFkZUluT3BhY2l0eVByb3BlcnR5LFxyXG4gICAgICAgICAgZWFzaW5nOiBFYXNpbmcuTElORUFSLFxyXG4gICAgICAgICAgZnJvbTogMCxcclxuICAgICAgICAgIHRvOiAxXHJcbiAgICAgICAgfSBdXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHRoaXMuZmFkZUluQW5pbWF0aW9uLnN0YXJ0RW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgIGdyYXBoTm9kZXNUb0FkZC5mb3JFYWNoKCBncmFwaE5vZGUgPT4gZ3JhcGhTZXROb2RlLmFkZENoaWxkKCBncmFwaE5vZGUgKSApO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlQW5pbWF0aW9uID0gdGhpcy5mYWRlSW5BbmltYXRpb247XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHRoaXMuZmFkZUluQW5pbWF0aW9uLmZpbmlzaEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmV2ZXJ5KCBuZXdHcmFwaE5vZGVzLCBncmFwaE5vZGUgPT4gZ3JhcGhTZXROb2RlLmhhc0NoaWxkKCBncmFwaE5vZGUgKSApICk7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggXy5ldmVyeSggbmV3R3JhcGhOb2RlcywgZ3JhcGhOb2RlID0+ICggZ3JhcGhOb2RlLm9wYWNpdHkgPT09IDEgKSApICk7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVBbmltYXRpb24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuZmFkZUluQW5pbWF0aW9uID0gbnVsbDtcclxuICAgICAgICB0aGlzLmZhZGVJbk9wYWNpdHlQcm9wZXJ0eS51bmxpbmtBbGwoKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gLi4uIGFuZCBhd2F5IHdlIGdvLlxyXG4gICAgICB0aGlzLmZhZGVPdXRBbmltYXRpb24uc3RhcnQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgdGhpcy5hY3RpdmVBbmltYXRpb24gJiYgdGhpcy5hY3RpdmVBbmltYXRpb24uc3RlcCggZHQgKTtcclxuICB9XHJcbn1cclxuXHJcbmNhbGN1bHVzR3JhcGhlci5yZWdpc3RlciggJ0dyYXBoU2V0c0FuaW1hdG9yJywgR3JhcGhTZXRzQW5pbWF0b3IgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLDBCQUEwQjtBQUd0RCxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLFNBQVMsTUFBTSxtQ0FBbUM7QUFDekQsT0FBT0MsTUFBTSxNQUFNLGdDQUFnQztBQUduRCxNQUFNQyxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDdEIsTUFBTUMsZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDOUIsTUFBTUMsb0JBQW9CLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDbEMsTUFBTUMsYUFBYSxHQUFHLEtBQUs7QUFFM0IsZUFBZSxNQUFNQyxpQkFBaUIsQ0FBQztFQUVyQzs7RUFJQTs7RUFHQTs7RUFLQTs7RUFHT0MsV0FBV0EsQ0FBRUMsTUFBYyxFQUFHO0lBRW5DLElBQUksQ0FBQ0Msc0JBQXNCLEdBQUcsSUFBSVYsY0FBYyxDQUFFLENBQUMsRUFBRTtNQUNuRFcsWUFBWSxFQUFFQyxPQUFPLElBQU1BLE9BQU8sSUFBSSxDQUFDLElBQUlBLE9BQU8sSUFBSTtJQUN4RCxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNDLHFCQUFxQixHQUFHLElBQUliLGNBQWMsQ0FBRSxDQUFDLEVBQUU7TUFDbERX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