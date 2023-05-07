// Copyright 2014-2023, University of Colorado Boulder

/**
 * The scenery node that shows a control point on a track, and allows the user to drag it or click on it for more
 * options.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import { Circle, DragListener, Rectangle } from '../../../../scenery/js/imports.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkQueryParameters from '../EnergySkateParkQueryParameters.js';
import ControlPointUI from './ControlPointUI.js';
import { Shape } from '../../../../kite/js/imports.js';
class ControlPointNode extends Circle {
  /**
   * @param {TrackNode} trackNode
   * @param {TrackDragHandler|null} trackDragHandler - so dragging a ControlPointNode can initiate dragging a track
   * @param {number} i
   * @param {boolean} isEndPoint
   * @param {Tandem} tandem
   */
  constructor(trackNode, trackDragHandler, i, isEndPoint, tandem) {
    const track = trackNode.track;
    const model = trackNode.model;
    const modelViewTransform = trackNode.modelViewTransform;
    const availableBoundsProperty = trackNode.availableBoundsProperty;
    const controlPointUIShownEmitter = new Emitter();
    const controlPoint = track.controlPoints[i];

    // Default colors for the control point fill and highlight
    const fill = 'red';
    const highlightedFill = '#c90606';

    // When mousing over the control point, highlight it like a button, to hint that it can be pressed to show the
    // cut/delete buttons, see #234
    const opacity = 0.7;
    const highlightedOpacity = 0.85;
    super(17, {
      pickable: true,
      opacity: opacity,
      stroke: 'black',
      lineWidth: 2,
      fill: fill,
      cursor: 'pointer',
      translation: modelViewTransform.modelToViewPosition(controlPoint.positionProperty.value),
      tandem: tandem,
      visiblePropertyOptions: {
        phetioState: false
      }
    });

    // Show a dotted line for the exterior track points, which can be connected to other track
    if (track.attachable) {
      if (i === 0 || i === track.controlPoints.length - 1) {
        this.lineDash = [4, 5];
      }
    }
    this.boundsRectangle = null;
    if (controlPoint.limitBounds) {
      this.boundsRectangle = new Rectangle(modelViewTransform.modelToViewBounds(controlPoint.limitBounds), 3, 3, {
        stroke: 'black',
        lineDash: [4, 5]
      });
      const boundsVisibilityListener = dragging => {
        this.boundsRectangle.visible = EnergySkateParkQueryParameters.showPointBounds || dragging;
      };
      controlPoint.draggingProperty.link(boundsVisibilityListener);
    }
    controlPoint.positionProperty.link(position => {
      this.translation = modelViewTransform.modelToViewPosition(position);
    });

    // if the ControlPoint is 'interactive' it supports dragging and potentially track splitting
    let dragListener = null; // potential reference for disposal
    if (controlPoint.interactive) {
      let dragEvents = 0;
      let lastControlPointUI = null;
      dragListener = new DragListener({
        tandem: tandem.createTandem('dragListener'),
        allowTouchSnag: true,
        start: event => {
          model.userControlledPropertySet.trackControlledProperty.set(true);

          // Move the track to the front when it starts dragging, see #296
          // The track is in a layer of tracks (without other nodes) so moving it to the front will work perfectly
          trackNode.moveToFront();

          // If control point dragged out of the control panel, translate the entire track, see #130
          if (!track.physicalProperty.value || !track.droppedProperty.value && track.draggable) {
            // save drag handler so we can end the drag if we need to after forwarding
            if (track.dragSource === null) {
              track.dragSource = dragListener;
            }
            return;
          }
          controlPoint.draggingProperty.value = true;
          track.draggingProperty.value = true;
          dragEvents = 0;

          // when a control point moves, any additional heuristics to correct energy for premade tracks no longer apply
          track.slopeToGround = false;
        },
        drag: event => {
          // Check whether the model contains a track so that input listeners for detached elements can't create bugs, see #230
          if (!model.containsTrack(track)) {
            return;
          }

          // If control point dragged out of the control panel, translate the entire track, see #130
          if (!track.physicalProperty.value || !track.droppedProperty.value && track.draggable) {
            // Only drag a track if nothing else was dragging the track (which caused a flicker), see #282
            if (track.dragSource === dragListener) {
              trackDragHandler && trackDragHandler.trackDragged(event);
            }
            return;
          }
          dragEvents++;
          controlPoint.draggingProperty.value = true;
          track.draggingProperty.value = true;
          const globalPoint = this.globalToParentPoint(event.pointer.point);

          // trigger reconstruction of the track shape based on the control points
          let pt = modelViewTransform.viewToModelPosition(globalPoint);

          // Constrain the control points to remain in y>0, see #71
          pt.y = Math.max(pt.y, 0);

          // Constrain the control point to the limited bounds, this should be more more strict than
          // availableBoundsProperty so this is done first to avoid multiple checks
          const dragBounds = controlPoint.limitBounds || availableBoundsProperty.value;
          if (dragBounds) {
            pt = dragBounds.closestPointTo(pt);
          }
          if (assert && availableBoundsProperty.value) {
            assert(availableBoundsProperty.value.containsPoint(pt), 'point should be in sim bounds, are your limiting bounds correct?');
          }
          controlPoint.sourcePositionProperty.value = pt;
          if (isEndPoint) {
            // If one of the control points is close enough to link to another track, do so
            const tracks = model.getPhysicalTracks();
            let bestDistance = Number.POSITIVE_INFINITY;
            let bestMatch = null;
            for (let i = 0; i < tracks.length; i++) {
              const t = tracks[i];
              if (t !== track) {
                // don't match inner points
                const otherPoints = [t.controlPoints[0], t.controlPoints[t.controlPoints.length - 1]];
                for (let k = 0; k < otherPoints.length; k++) {
                  const otherPoint = otherPoints[k];
                  const distance = controlPoint.sourcePositionProperty.value.distance(otherPoint.positionProperty.value);
                  if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = otherPoint;
                  }
                }
              }
            }
            controlPoint.snapTargetProperty.value = bestDistance !== null && bestDistance < 1 ? bestMatch : null;
          }

          // When one control point dragged, update the track and the node shape
          track.updateSplines();
          trackNode.updateTrackShape();
          model.trackModified(track);
        },
        end: event => {
          // Check whether the model contains a track so that input listeners for detached elements can't create bugs, see #230
          if (!model.containsTrack(track)) {
            return;
          }
          model.userControlledPropertySet.trackControlledProperty.set(false);

          // If control point dragged out of the control panel, translate the entire track, see #130
          if (!track.physicalProperty.value || !track.droppedProperty.value && track.draggable) {
            // Only drop a track if nothing else was dragging the track (which caused a flicker), see #282
            if (track.dragSource === dragListener) {
              trackDragHandler && trackDragHandler.trackDragEnded(event);
            }
            return;
          }
          if (isEndPoint && controlPoint.snapTargetProperty.value) {
            model.joinTracks(track);
          } else {
            track.smoothPointOfHighestCurvature([i]);
            model.trackModified(track);
          }

          // The above steps can dispose a track.  If so, do not try to modify the track further, see https://github.com/phetsims/energy-skate-park-basics/issues/396
          if (track.isDisposed) {
            return;
          }
          track.bumpAboveGround();
          controlPoint.draggingProperty.value = false;
          track.draggingProperty.value = false;

          // Show the 'control point editing' ui, but only if the user didn't drag the control point.
          // Threshold at a few drag events in case the user didn't mean to drag it but accidentally moved it a few pixels.
          // Make sure the track hasn't recently detached (was seen twice in ?fuzz&fuzzRate=100 testing)
          if (track.splittable) {
            if (dragEvents <= 3 && trackNode.parents.length > 0) {
              controlPointUIShownEmitter.emit();
              lastControlPointUI && lastControlPointUI.dispose();
              lastControlPointUI = new ControlPointUI(model, track, i, modelViewTransform, trackNode.parents[0], tandem.createTandem('controlPointUI'));

              // If the track was removed, get rid of the buttons
              const removalListener = () => {
                lastControlPointUI && lastControlPointUI.dispose();
                lastControlPointUI = null;
              };
              track.removeEmitter.addListener(removalListener);

              // If the track has translated, hide the buttons, see #272
              track.translatedEmitter.addListener(removalListener);
              trackNode.parents[0].addChild(lastControlPointUI);
            }
          }
          if (EnergySkateParkQueryParameters.testTrackIndex > 0) {
            console.log(track.getDebugString());
          }
        }
      });
      dragListener.over = () => {
        if (track.physicalProperty.value && !track.draggingProperty.value) {
          this.opacity = highlightedOpacity;
          this.fill = highlightedFill;
        }
      };
      dragListener.out = () => {
        this.opacity = opacity;
        this.fill = fill;
      };
      this.addInputListener(dragListener);
    }
    this.touchArea = Shape.circle(0, 0, 25);

    // @private
    this.disposeControlPointNode = () => {
      dragListener && dragListener.dispose();
    };
  }

  /**
   * Make eligible for garbage collection.
   * @public
   */
  dispose() {
    this.disposeControlPointNode();
    super.dispose();
  }
}
energySkatePark.register('ControlPointNode', ControlPointNode);
export default ControlPointNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwiQ2lyY2xlIiwiRHJhZ0xpc3RlbmVyIiwiUmVjdGFuZ2xlIiwiZW5lcmd5U2thdGVQYXJrIiwiRW5lcmd5U2thdGVQYXJrUXVlcnlQYXJhbWV0ZXJzIiwiQ29udHJvbFBvaW50VUkiLCJTaGFwZSIsIkNvbnRyb2xQb2ludE5vZGUiLCJjb25zdHJ1Y3RvciIsInRyYWNrTm9kZSIsInRyYWNrRHJhZ0hhbmRsZXIiLCJpIiwiaXNFbmRQb2ludCIsInRhbmRlbSIsInRyYWNrIiwibW9kZWwiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJhdmFpbGFibGVCb3VuZHNQcm9wZXJ0eSIsImNvbnRyb2xQb2ludFVJU2hvd25FbWl0dGVyIiwiY29udHJvbFBvaW50IiwiY29udHJvbFBvaW50cyIsImZpbGwiLCJoaWdobGlnaHRlZEZpbGwiLCJvcGFjaXR5IiwiaGlnaGxpZ2h0ZWRPcGFjaXR5IiwicGlja2FibGUiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJjdXJzb3IiLCJ0cmFuc2xhdGlvbiIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJwb3NpdGlvblByb3BlcnR5IiwidmFsdWUiLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwicGhldGlvU3RhdGUiLCJhdHRhY2hhYmxlIiwibGVuZ3RoIiwibGluZURhc2giLCJib3VuZHNSZWN0YW5nbGUiLCJsaW1pdEJvdW5kcyIsIm1vZGVsVG9WaWV3Qm91bmRzIiwiYm91bmRzVmlzaWJpbGl0eUxpc3RlbmVyIiwiZHJhZ2dpbmciLCJ2aXNpYmxlIiwic2hvd1BvaW50Qm91bmRzIiwiZHJhZ2dpbmdQcm9wZXJ0eSIsImxpbmsiLCJwb3NpdGlvbiIsImRyYWdMaXN0ZW5lciIsImludGVyYWN0aXZlIiwiZHJhZ0V2ZW50cyIsImxhc3RDb250cm9sUG9pbnRVSSIsImNyZWF0ZVRhbmRlbSIsImFsbG93VG91Y2hTbmFnIiwic3RhcnQiLCJldmVudCIsInVzZXJDb250cm9sbGVkUHJvcGVydHlTZXQiLCJ0cmFja0NvbnRyb2xsZWRQcm9wZXJ0eSIsInNldCIsIm1vdmVUb0Zyb250IiwicGh5c2ljYWxQcm9wZXJ0eSIsImRyb3BwZWRQcm9wZXJ0eSIsImRyYWdnYWJsZSIsImRyYWdTb3VyY2UiLCJzbG9wZVRvR3JvdW5kIiwiZHJhZyIsImNvbnRhaW5zVHJhY2siLCJ0cmFja0RyYWdnZWQiLCJnbG9iYWxQb2ludCIsImdsb2JhbFRvUGFyZW50UG9pbnQiLCJwb2ludGVyIiwicG9pbnQiLCJwdCIsInZpZXdUb01vZGVsUG9zaXRpb24iLCJ5IiwiTWF0aCIsIm1heCIsImRyYWdCb3VuZHMiLCJjbG9zZXN0UG9pbnRUbyIsImFzc2VydCIsImNvbnRhaW5zUG9pbnQiLCJzb3VyY2VQb3NpdGlvblByb3BlcnR5IiwidHJhY2tzIiwiZ2V0UGh5c2ljYWxUcmFja3MiLCJiZXN0RGlzdGFuY2UiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsImJlc3RNYXRjaCIsInQiLCJvdGhlclBvaW50cyIsImsiLCJvdGhlclBvaW50IiwiZGlzdGFuY2UiLCJzbmFwVGFyZ2V0UHJvcGVydHkiLCJ1cGRhdGVTcGxpbmVzIiwidXBkYXRlVHJhY2tTaGFwZSIsInRyYWNrTW9kaWZpZWQiLCJlbmQiLCJ0cmFja0RyYWdFbmRlZCIsImpvaW5UcmFja3MiLCJzbW9vdGhQb2ludE9mSGlnaGVzdEN1cnZhdHVyZSIsImlzRGlzcG9zZWQiLCJidW1wQWJvdmVHcm91bmQiLCJzcGxpdHRhYmxlIiwicGFyZW50cyIsImVtaXQiLCJkaXNwb3NlIiwicmVtb3ZhbExpc3RlbmVyIiwicmVtb3ZlRW1pdHRlciIsImFkZExpc3RlbmVyIiwidHJhbnNsYXRlZEVtaXR0ZXIiLCJhZGRDaGlsZCIsInRlc3RUcmFja0luZGV4IiwiY29uc29sZSIsImxvZyIsImdldERlYnVnU3RyaW5nIiwib3ZlciIsIm91dCIsImFkZElucHV0TGlzdGVuZXIiLCJ0b3VjaEFyZWEiLCJjaXJjbGUiLCJkaXNwb3NlQ29udHJvbFBvaW50Tm9kZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ29udHJvbFBvaW50Tm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgc2NlbmVyeSBub2RlIHRoYXQgc2hvd3MgYSBjb250cm9sIHBvaW50IG9uIGEgdHJhY2ssIGFuZCBhbGxvd3MgdGhlIHVzZXIgdG8gZHJhZyBpdCBvciBjbGljayBvbiBpdCBmb3IgbW9yZVxyXG4gKiBvcHRpb25zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCB7IENpcmNsZSwgRHJhZ0xpc3RlbmVyLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZW5lcmd5U2thdGVQYXJrIGZyb20gJy4uLy4uL2VuZXJneVNrYXRlUGFyay5qcyc7XHJcbmltcG9ydCBFbmVyZ3lTa2F0ZVBhcmtRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vRW5lcmd5U2thdGVQYXJrUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IENvbnRyb2xQb2ludFVJIGZyb20gJy4vQ29udHJvbFBvaW50VUkuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcblxyXG5jbGFzcyBDb250cm9sUG9pbnROb2RlIGV4dGVuZHMgQ2lyY2xlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtUcmFja05vZGV9IHRyYWNrTm9kZVxyXG4gICAqIEBwYXJhbSB7VHJhY2tEcmFnSGFuZGxlcnxudWxsfSB0cmFja0RyYWdIYW5kbGVyIC0gc28gZHJhZ2dpbmcgYSBDb250cm9sUG9pbnROb2RlIGNhbiBpbml0aWF0ZSBkcmFnZ2luZyBhIHRyYWNrXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGlcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzRW5kUG9pbnRcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRyYWNrTm9kZSwgdHJhY2tEcmFnSGFuZGxlciwgaSwgaXNFbmRQb2ludCwgdGFuZGVtICkge1xyXG4gICAgY29uc3QgdHJhY2sgPSB0cmFja05vZGUudHJhY2s7XHJcbiAgICBjb25zdCBtb2RlbCA9IHRyYWNrTm9kZS5tb2RlbDtcclxuICAgIGNvbnN0IG1vZGVsVmlld1RyYW5zZm9ybSA9IHRyYWNrTm9kZS5tb2RlbFZpZXdUcmFuc2Zvcm07XHJcbiAgICBjb25zdCBhdmFpbGFibGVCb3VuZHNQcm9wZXJ0eSA9IHRyYWNrTm9kZS5hdmFpbGFibGVCb3VuZHNQcm9wZXJ0eTtcclxuICAgIGNvbnN0IGNvbnRyb2xQb2ludFVJU2hvd25FbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgICBjb25zdCBjb250cm9sUG9pbnQgPSB0cmFjay5jb250cm9sUG9pbnRzWyBpIF07XHJcblxyXG4gICAgLy8gRGVmYXVsdCBjb2xvcnMgZm9yIHRoZSBjb250cm9sIHBvaW50IGZpbGwgYW5kIGhpZ2hsaWdodFxyXG4gICAgY29uc3QgZmlsbCA9ICdyZWQnO1xyXG4gICAgY29uc3QgaGlnaGxpZ2h0ZWRGaWxsID0gJyNjOTA2MDYnO1xyXG5cclxuICAgIC8vIFdoZW4gbW91c2luZyBvdmVyIHRoZSBjb250cm9sIHBvaW50LCBoaWdobGlnaHQgaXQgbGlrZSBhIGJ1dHRvbiwgdG8gaGludCB0aGF0IGl0IGNhbiBiZSBwcmVzc2VkIHRvIHNob3cgdGhlXHJcbiAgICAvLyBjdXQvZGVsZXRlIGJ1dHRvbnMsIHNlZSAjMjM0XHJcbiAgICBjb25zdCBvcGFjaXR5ID0gMC43O1xyXG4gICAgY29uc3QgaGlnaGxpZ2h0ZWRPcGFjaXR5ID0gMC44NTtcclxuXHJcbiAgICBzdXBlciggMTcsIHtcclxuICAgICAgcGlja2FibGU6IHRydWUsXHJcbiAgICAgIG9wYWNpdHk6IG9wYWNpdHksXHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgbGluZVdpZHRoOiAyLFxyXG4gICAgICBmaWxsOiBmaWxsLFxyXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgdHJhbnNsYXRpb246IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBjb250cm9sUG9pbnQucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbSxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9TdGF0ZTogZmFsc2UgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFNob3cgYSBkb3R0ZWQgbGluZSBmb3IgdGhlIGV4dGVyaW9yIHRyYWNrIHBvaW50cywgd2hpY2ggY2FuIGJlIGNvbm5lY3RlZCB0byBvdGhlciB0cmFja1xyXG4gICAgaWYgKCB0cmFjay5hdHRhY2hhYmxlICkge1xyXG4gICAgICBpZiAoIGkgPT09IDAgfHwgaSA9PT0gdHJhY2suY29udHJvbFBvaW50cy5sZW5ndGggLSAxICkge1xyXG4gICAgICAgIHRoaXMubGluZURhc2ggPSBbIDQsIDUgXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYm91bmRzUmVjdGFuZ2xlID0gbnVsbDtcclxuICAgIGlmICggY29udHJvbFBvaW50LmxpbWl0Qm91bmRzICkge1xyXG5cclxuICAgICAgdGhpcy5ib3VuZHNSZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdCb3VuZHMoIGNvbnRyb2xQb2ludC5saW1pdEJvdW5kcyApLCAzLCAzLCB7XHJcbiAgICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICAgIGxpbmVEYXNoOiBbIDQsIDUgXVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBjb25zdCBib3VuZHNWaXNpYmlsaXR5TGlzdGVuZXIgPSBkcmFnZ2luZyA9PiB7XHJcbiAgICAgICAgdGhpcy5ib3VuZHNSZWN0YW5nbGUudmlzaWJsZSA9IEVuZXJneVNrYXRlUGFya1F1ZXJ5UGFyYW1ldGVycy5zaG93UG9pbnRCb3VuZHMgfHwgZHJhZ2dpbmc7XHJcbiAgICAgIH07XHJcbiAgICAgIGNvbnRyb2xQb2ludC5kcmFnZ2luZ1Byb3BlcnR5LmxpbmsoIGJvdW5kc1Zpc2liaWxpdHlMaXN0ZW5lciApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnRyb2xQb2ludC5wb3NpdGlvblByb3BlcnR5LmxpbmsoIHBvc2l0aW9uID0+IHtcclxuICAgICAgdGhpcy50cmFuc2xhdGlvbiA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBwb3NpdGlvbiApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGlmIHRoZSBDb250cm9sUG9pbnQgaXMgJ2ludGVyYWN0aXZlJyBpdCBzdXBwb3J0cyBkcmFnZ2luZyBhbmQgcG90ZW50aWFsbHkgdHJhY2sgc3BsaXR0aW5nXHJcbiAgICBsZXQgZHJhZ0xpc3RlbmVyID0gbnVsbDsgLy8gcG90ZW50aWFsIHJlZmVyZW5jZSBmb3IgZGlzcG9zYWxcclxuICAgIGlmICggY29udHJvbFBvaW50LmludGVyYWN0aXZlICkge1xyXG4gICAgICBsZXQgZHJhZ0V2ZW50cyA9IDA7XHJcbiAgICAgIGxldCBsYXN0Q29udHJvbFBvaW50VUkgPSBudWxsO1xyXG4gICAgICBkcmFnTGlzdGVuZXIgPSBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ0xpc3RlbmVyJyApLFxyXG4gICAgICAgIGFsbG93VG91Y2hTbmFnOiB0cnVlLFxyXG4gICAgICAgIHN0YXJ0OiBldmVudCA9PiB7XHJcblxyXG4gICAgICAgICAgbW9kZWwudXNlckNvbnRyb2xsZWRQcm9wZXJ0eVNldC50cmFja0NvbnRyb2xsZWRQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuXHJcbiAgICAgICAgICAvLyBNb3ZlIHRoZSB0cmFjayB0byB0aGUgZnJvbnQgd2hlbiBpdCBzdGFydHMgZHJhZ2dpbmcsIHNlZSAjMjk2XHJcbiAgICAgICAgICAvLyBUaGUgdHJhY2sgaXMgaW4gYSBsYXllciBvZiB0cmFja3MgKHdpdGhvdXQgb3RoZXIgbm9kZXMpIHNvIG1vdmluZyBpdCB0byB0aGUgZnJvbnQgd2lsbCB3b3JrIHBlcmZlY3RseVxyXG4gICAgICAgICAgdHJhY2tOb2RlLm1vdmVUb0Zyb250KCk7XHJcblxyXG4gICAgICAgICAgLy8gSWYgY29udHJvbCBwb2ludCBkcmFnZ2VkIG91dCBvZiB0aGUgY29udHJvbCBwYW5lbCwgdHJhbnNsYXRlIHRoZSBlbnRpcmUgdHJhY2ssIHNlZSAjMTMwXHJcbiAgICAgICAgICBpZiAoICF0cmFjay5waHlzaWNhbFByb3BlcnR5LnZhbHVlIHx8ICggIXRyYWNrLmRyb3BwZWRQcm9wZXJ0eS52YWx1ZSAmJiB0cmFjay5kcmFnZ2FibGUgKSApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHNhdmUgZHJhZyBoYW5kbGVyIHNvIHdlIGNhbiBlbmQgdGhlIGRyYWcgaWYgd2UgbmVlZCB0byBhZnRlciBmb3J3YXJkaW5nXHJcbiAgICAgICAgICAgIGlmICggdHJhY2suZHJhZ1NvdXJjZSA9PT0gbnVsbCApIHtcclxuICAgICAgICAgICAgICB0cmFjay5kcmFnU291cmNlID0gZHJhZ0xpc3RlbmVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnRyb2xQb2ludC5kcmFnZ2luZ1Byb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICAgICAgICAgIHRyYWNrLmRyYWdnaW5nUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICAgICAgZHJhZ0V2ZW50cyA9IDA7XHJcblxyXG4gICAgICAgICAgLy8gd2hlbiBhIGNvbnRyb2wgcG9pbnQgbW92ZXMsIGFueSBhZGRpdGlvbmFsIGhldXJpc3RpY3MgdG8gY29ycmVjdCBlbmVyZ3kgZm9yIHByZW1hZGUgdHJhY2tzIG5vIGxvbmdlciBhcHBseVxyXG4gICAgICAgICAgdHJhY2suc2xvcGVUb0dyb3VuZCA9IGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZHJhZzogZXZlbnQgPT4ge1xyXG5cclxuICAgICAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIG1vZGVsIGNvbnRhaW5zIGEgdHJhY2sgc28gdGhhdCBpbnB1dCBsaXN0ZW5lcnMgZm9yIGRldGFjaGVkIGVsZW1lbnRzIGNhbid0IGNyZWF0ZSBidWdzLCBzZWUgIzIzMFxyXG4gICAgICAgICAgaWYgKCAhbW9kZWwuY29udGFpbnNUcmFjayggdHJhY2sgKSApIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgICAgLy8gSWYgY29udHJvbCBwb2ludCBkcmFnZ2VkIG91dCBvZiB0aGUgY29udHJvbCBwYW5lbCwgdHJhbnNsYXRlIHRoZSBlbnRpcmUgdHJhY2ssIHNlZSAjMTMwXHJcbiAgICAgICAgICBpZiAoICF0cmFjay5waHlzaWNhbFByb3BlcnR5LnZhbHVlIHx8ICggIXRyYWNrLmRyb3BwZWRQcm9wZXJ0eS52YWx1ZSAmJiB0cmFjay5kcmFnZ2FibGUgKSApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIE9ubHkgZHJhZyBhIHRyYWNrIGlmIG5vdGhpbmcgZWxzZSB3YXMgZHJhZ2dpbmcgdGhlIHRyYWNrICh3aGljaCBjYXVzZWQgYSBmbGlja2VyKSwgc2VlICMyODJcclxuICAgICAgICAgICAgaWYgKCB0cmFjay5kcmFnU291cmNlID09PSBkcmFnTGlzdGVuZXIgKSB7XHJcbiAgICAgICAgICAgICAgdHJhY2tEcmFnSGFuZGxlciAmJiB0cmFja0RyYWdIYW5kbGVyLnRyYWNrRHJhZ2dlZCggZXZlbnQgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBkcmFnRXZlbnRzKys7XHJcbiAgICAgICAgICBjb250cm9sUG9pbnQuZHJhZ2dpbmdQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgICB0cmFjay5kcmFnZ2luZ1Byb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICAgICAgICAgIGNvbnN0IGdsb2JhbFBvaW50ID0gdGhpcy5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICk7XHJcblxyXG4gICAgICAgICAgLy8gdHJpZ2dlciByZWNvbnN0cnVjdGlvbiBvZiB0aGUgdHJhY2sgc2hhcGUgYmFzZWQgb24gdGhlIGNvbnRyb2wgcG9pbnRzXHJcbiAgICAgICAgICBsZXQgcHQgPSBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxQb3NpdGlvbiggZ2xvYmFsUG9pbnQgKTtcclxuXHJcbiAgICAgICAgICAvLyBDb25zdHJhaW4gdGhlIGNvbnRyb2wgcG9pbnRzIHRvIHJlbWFpbiBpbiB5PjAsIHNlZSAjNzFcclxuICAgICAgICAgIHB0LnkgPSBNYXRoLm1heCggcHQueSwgMCApO1xyXG5cclxuICAgICAgICAgIC8vIENvbnN0cmFpbiB0aGUgY29udHJvbCBwb2ludCB0byB0aGUgbGltaXRlZCBib3VuZHMsIHRoaXMgc2hvdWxkIGJlIG1vcmUgbW9yZSBzdHJpY3QgdGhhblxyXG4gICAgICAgICAgLy8gYXZhaWxhYmxlQm91bmRzUHJvcGVydHkgc28gdGhpcyBpcyBkb25lIGZpcnN0IHRvIGF2b2lkIG11bHRpcGxlIGNoZWNrc1xyXG4gICAgICAgICAgY29uc3QgZHJhZ0JvdW5kcyA9IGNvbnRyb2xQb2ludC5saW1pdEJvdW5kcyB8fCBhdmFpbGFibGVCb3VuZHNQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICAgIGlmICggZHJhZ0JvdW5kcyApIHtcclxuICAgICAgICAgICAgcHQgPSBkcmFnQm91bmRzLmNsb3Nlc3RQb2ludFRvKCBwdCApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICggYXNzZXJ0ICYmIGF2YWlsYWJsZUJvdW5kc1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgICAgICBhc3NlcnQoIGF2YWlsYWJsZUJvdW5kc1Byb3BlcnR5LnZhbHVlLmNvbnRhaW5zUG9pbnQoIHB0ICksXHJcbiAgICAgICAgICAgICAgJ3BvaW50IHNob3VsZCBiZSBpbiBzaW0gYm91bmRzLCBhcmUgeW91ciBsaW1pdGluZyBib3VuZHMgY29ycmVjdD8nICk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29udHJvbFBvaW50LnNvdXJjZVBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBwdDtcclxuXHJcbiAgICAgICAgICBpZiAoIGlzRW5kUG9pbnQgKSB7XHJcbiAgICAgICAgICAgIC8vIElmIG9uZSBvZiB0aGUgY29udHJvbCBwb2ludHMgaXMgY2xvc2UgZW5vdWdoIHRvIGxpbmsgdG8gYW5vdGhlciB0cmFjaywgZG8gc29cclxuICAgICAgICAgICAgY29uc3QgdHJhY2tzID0gbW9kZWwuZ2V0UGh5c2ljYWxUcmFja3MoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBiZXN0RGlzdGFuY2UgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICAgICAgICAgIGxldCBiZXN0TWF0Y2ggPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdHJhY2tzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHQgPSB0cmFja3NbIGkgXTtcclxuICAgICAgICAgICAgICBpZiAoIHQgIT09IHRyYWNrICkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGRvbid0IG1hdGNoIGlubmVyIHBvaW50c1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgb3RoZXJQb2ludHMgPSBbIHQuY29udHJvbFBvaW50c1sgMCBdLCB0LmNvbnRyb2xQb2ludHNbIHQuY29udHJvbFBvaW50cy5sZW5ndGggLSAxIF0gXTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKCBsZXQgayA9IDA7IGsgPCBvdGhlclBvaW50cy5sZW5ndGg7IGsrKyApIHtcclxuICAgICAgICAgICAgICAgICAgY29uc3Qgb3RoZXJQb2ludCA9IG90aGVyUG9pbnRzWyBrIF07XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gY29udHJvbFBvaW50LnNvdXJjZVBvc2l0aW9uUHJvcGVydHkudmFsdWUuZGlzdGFuY2UoIG90aGVyUG9pbnQucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgaWYgKCBkaXN0YW5jZSA8IGJlc3REaXN0YW5jZSApIHtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0RGlzdGFuY2UgPSBkaXN0YW5jZTtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2ggPSBvdGhlclBvaW50O1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb250cm9sUG9pbnQuc25hcFRhcmdldFByb3BlcnR5LnZhbHVlID0gKCBiZXN0RGlzdGFuY2UgIT09IG51bGwgJiYgYmVzdERpc3RhbmNlIDwgMSApID8gYmVzdE1hdGNoIDogbnVsbDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBXaGVuIG9uZSBjb250cm9sIHBvaW50IGRyYWdnZWQsIHVwZGF0ZSB0aGUgdHJhY2sgYW5kIHRoZSBub2RlIHNoYXBlXHJcbiAgICAgICAgICB0cmFjay51cGRhdGVTcGxpbmVzKCk7XHJcbiAgICAgICAgICB0cmFja05vZGUudXBkYXRlVHJhY2tTaGFwZSgpO1xyXG4gICAgICAgICAgbW9kZWwudHJhY2tNb2RpZmllZCggdHJhY2sgKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVuZDogZXZlbnQgPT4ge1xyXG5cclxuICAgICAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIG1vZGVsIGNvbnRhaW5zIGEgdHJhY2sgc28gdGhhdCBpbnB1dCBsaXN0ZW5lcnMgZm9yIGRldGFjaGVkIGVsZW1lbnRzIGNhbid0IGNyZWF0ZSBidWdzLCBzZWUgIzIzMFxyXG4gICAgICAgICAgaWYgKCAhbW9kZWwuY29udGFpbnNUcmFjayggdHJhY2sgKSApIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgICAgbW9kZWwudXNlckNvbnRyb2xsZWRQcm9wZXJ0eVNldC50cmFja0NvbnRyb2xsZWRQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcblxyXG4gICAgICAgICAgLy8gSWYgY29udHJvbCBwb2ludCBkcmFnZ2VkIG91dCBvZiB0aGUgY29udHJvbCBwYW5lbCwgdHJhbnNsYXRlIHRoZSBlbnRpcmUgdHJhY2ssIHNlZSAjMTMwXHJcbiAgICAgICAgICBpZiAoICF0cmFjay5waHlzaWNhbFByb3BlcnR5LnZhbHVlIHx8ICggIXRyYWNrLmRyb3BwZWRQcm9wZXJ0eS52YWx1ZSAmJiB0cmFjay5kcmFnZ2FibGUgKSApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIE9ubHkgZHJvcCBhIHRyYWNrIGlmIG5vdGhpbmcgZWxzZSB3YXMgZHJhZ2dpbmcgdGhlIHRyYWNrICh3aGljaCBjYXVzZWQgYSBmbGlja2VyKSwgc2VlICMyODJcclxuICAgICAgICAgICAgaWYgKCB0cmFjay5kcmFnU291cmNlID09PSBkcmFnTGlzdGVuZXIgKSB7XHJcbiAgICAgICAgICAgICAgdHJhY2tEcmFnSGFuZGxlciAmJiB0cmFja0RyYWdIYW5kbGVyLnRyYWNrRHJhZ0VuZGVkKCBldmVudCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICggaXNFbmRQb2ludCAmJiBjb250cm9sUG9pbnQuc25hcFRhcmdldFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgICAgICBtb2RlbC5qb2luVHJhY2tzKCB0cmFjayApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRyYWNrLnNtb290aFBvaW50T2ZIaWdoZXN0Q3VydmF0dXJlKCBbIGkgXSApO1xyXG4gICAgICAgICAgICBtb2RlbC50cmFja01vZGlmaWVkKCB0cmFjayApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIFRoZSBhYm92ZSBzdGVwcyBjYW4gZGlzcG9zZSBhIHRyYWNrLiAgSWYgc28sIGRvIG5vdCB0cnkgdG8gbW9kaWZ5IHRoZSB0cmFjayBmdXJ0aGVyLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VuZXJneS1za2F0ZS1wYXJrLWJhc2ljcy9pc3N1ZXMvMzk2XHJcbiAgICAgICAgICBpZiAoIHRyYWNrLmlzRGlzcG9zZWQgKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICAgIHRyYWNrLmJ1bXBBYm92ZUdyb3VuZCgpO1xyXG4gICAgICAgICAgY29udHJvbFBvaW50LmRyYWdnaW5nUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICAgIHRyYWNrLmRyYWdnaW5nUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAvLyBTaG93IHRoZSAnY29udHJvbCBwb2ludCBlZGl0aW5nJyB1aSwgYnV0IG9ubHkgaWYgdGhlIHVzZXIgZGlkbid0IGRyYWcgdGhlIGNvbnRyb2wgcG9pbnQuXHJcbiAgICAgICAgICAvLyBUaHJlc2hvbGQgYXQgYSBmZXcgZHJhZyBldmVudHMgaW4gY2FzZSB0aGUgdXNlciBkaWRuJ3QgbWVhbiB0byBkcmFnIGl0IGJ1dCBhY2NpZGVudGFsbHkgbW92ZWQgaXQgYSBmZXcgcGl4ZWxzLlxyXG4gICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSB0cmFjayBoYXNuJ3QgcmVjZW50bHkgZGV0YWNoZWQgKHdhcyBzZWVuIHR3aWNlIGluID9mdXp6JmZ1enpSYXRlPTEwMCB0ZXN0aW5nKVxyXG4gICAgICAgICAgaWYgKCB0cmFjay5zcGxpdHRhYmxlICkge1xyXG4gICAgICAgICAgICBpZiAoIGRyYWdFdmVudHMgPD0gMyAmJiB0cmFja05vZGUucGFyZW50cy5sZW5ndGggPiAwICkge1xyXG4gICAgICAgICAgICAgIGNvbnRyb2xQb2ludFVJU2hvd25FbWl0dGVyLmVtaXQoKTtcclxuXHJcbiAgICAgICAgICAgICAgbGFzdENvbnRyb2xQb2ludFVJICYmIGxhc3RDb250cm9sUG9pbnRVSS5kaXNwb3NlKCk7XHJcblxyXG4gICAgICAgICAgICAgIGxhc3RDb250cm9sUG9pbnRVSSA9IG5ldyBDb250cm9sUG9pbnRVSShcclxuICAgICAgICAgICAgICAgIG1vZGVsLFxyXG4gICAgICAgICAgICAgICAgdHJhY2ssXHJcbiAgICAgICAgICAgICAgICBpLFxyXG4gICAgICAgICAgICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICAgICAgICAgICAgdHJhY2tOb2RlLnBhcmVudHNbIDAgXSxcclxuICAgICAgICAgICAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb250cm9sUG9pbnRVSScgKVxyXG4gICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgIC8vIElmIHRoZSB0cmFjayB3YXMgcmVtb3ZlZCwgZ2V0IHJpZCBvZiB0aGUgYnV0dG9uc1xyXG4gICAgICAgICAgICAgIGNvbnN0IHJlbW92YWxMaXN0ZW5lciA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxhc3RDb250cm9sUG9pbnRVSSAmJiBsYXN0Q29udHJvbFBvaW50VUkuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgbGFzdENvbnRyb2xQb2ludFVJID0gbnVsbDtcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIHRyYWNrLnJlbW92ZUVtaXR0ZXIuYWRkTGlzdGVuZXIoIHJlbW92YWxMaXN0ZW5lciApO1xyXG5cclxuICAgICAgICAgICAgICAvLyBJZiB0aGUgdHJhY2sgaGFzIHRyYW5zbGF0ZWQsIGhpZGUgdGhlIGJ1dHRvbnMsIHNlZSAjMjcyXHJcbiAgICAgICAgICAgICAgdHJhY2sudHJhbnNsYXRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHJlbW92YWxMaXN0ZW5lciApO1xyXG5cclxuICAgICAgICAgICAgICB0cmFja05vZGUucGFyZW50c1sgMCBdLmFkZENoaWxkKCBsYXN0Q29udHJvbFBvaW50VUkgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoIEVuZXJneVNrYXRlUGFya1F1ZXJ5UGFyYW1ldGVycy50ZXN0VHJhY2tJbmRleCA+IDAgKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCB0cmFjay5nZXREZWJ1Z1N0cmluZygpICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICAgIGRyYWdMaXN0ZW5lci5vdmVyID0gKCkgPT4ge1xyXG4gICAgICAgIGlmICggdHJhY2sucGh5c2ljYWxQcm9wZXJ0eS52YWx1ZSAmJiAhdHJhY2suZHJhZ2dpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICAgIHRoaXMub3BhY2l0eSA9IGhpZ2hsaWdodGVkT3BhY2l0eTtcclxuICAgICAgICAgIHRoaXMuZmlsbCA9IGhpZ2hsaWdodGVkRmlsbDtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIGRyYWdMaXN0ZW5lci5vdXQgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5vcGFjaXR5ID0gb3BhY2l0eTtcclxuICAgICAgICB0aGlzLmZpbGwgPSBmaWxsO1xyXG4gICAgICB9O1xyXG4gICAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIGRyYWdMaXN0ZW5lciApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudG91Y2hBcmVhID0gU2hhcGUuY2lyY2xlKCAwLCAwLCAyNSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmRpc3Bvc2VDb250cm9sUG9pbnROb2RlID0gKCkgPT4ge1xyXG4gICAgICBkcmFnTGlzdGVuZXIgJiYgZHJhZ0xpc3RlbmVyLmRpc3Bvc2UoKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYWtlIGVsaWdpYmxlIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLmRpc3Bvc2VDb250cm9sUG9pbnROb2RlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5lbmVyZ3lTa2F0ZVBhcmsucmVnaXN0ZXIoICdDb250cm9sUG9pbnROb2RlJywgQ29udHJvbFBvaW50Tm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBDb250cm9sUG9pbnROb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSxnQ0FBZ0M7QUFDcEQsU0FBU0MsTUFBTSxFQUFFQyxZQUFZLEVBQUVDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDbkYsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyw4QkFBOEIsTUFBTSxzQ0FBc0M7QUFDakYsT0FBT0MsY0FBYyxNQUFNLHFCQUFxQjtBQUNoRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBRXRELE1BQU1DLGdCQUFnQixTQUFTUCxNQUFNLENBQUM7RUFFcEM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVEsV0FBV0EsQ0FBRUMsU0FBUyxFQUFFQyxnQkFBZ0IsRUFBRUMsQ0FBQyxFQUFFQyxVQUFVLEVBQUVDLE1BQU0sRUFBRztJQUNoRSxNQUFNQyxLQUFLLEdBQUdMLFNBQVMsQ0FBQ0ssS0FBSztJQUM3QixNQUFNQyxLQUFLLEdBQUdOLFNBQVMsQ0FBQ00sS0FBSztJQUM3QixNQUFNQyxrQkFBa0IsR0FBR1AsU0FBUyxDQUFDTyxrQkFBa0I7SUFDdkQsTUFBTUMsdUJBQXVCLEdBQUdSLFNBQVMsQ0FBQ1EsdUJBQXVC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