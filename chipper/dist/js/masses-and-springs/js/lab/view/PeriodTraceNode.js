// Copyright 2018-2022, University of Colorado Boulder

/**
 * View for period trace of mass oscillation.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Color, Node, Path } from '../../../../scenery/js/imports.js';
import massesAndSprings from '../../massesAndSprings.js';

// constants
const X_OFFSET = 10;
const FADE_OUT_SPEED = 1; // the speed at which the trace fades out.

class PeriodTraceNode extends Node {
  /**
   * @param {PeriodTrace} periodTrace
   * @param {ModelViewTransform2} modelViewTransform
   *
   */
  constructor(periodTrace, modelViewTransform) {
    super();

    // @public {PeriodTrace} Model element for the period trace
    this.periodTrace = periodTrace;

    // @public {Shape}
    this.shape = new Shape();

    // @private {number} The opacity of the trace (not using Node opacity for performance reasons)
    this.colorAlpha = 1;

    // @private {Property.<Color>}
    this.traceColorProperty = new Property(new Color('black'));

    // @private {ModelViewTransForm}
    this.modelViewTransform = modelViewTransform;
    this.originalX = this.modelViewTransform.modelToViewX(periodTrace.spring.positionProperty.value.x - 0.2);
    this.middleX = this.originalX + X_OFFSET;
    this.lastX = this.originalX + 2 * X_OFFSET;
    this.path = new Path(null, {
      stroke: this.traceColorProperty,
      lineWidth: 2.5
    });
    this.addChild(this.path);
    this.periodTrace.stateProperty.link(state => {
      if (state === 1) {
        this.traceColorProperty.value = this.traceColorProperty.value.withAlpha(1);
        this.colorAlpha = 1;
      }
    });
  }

  /**
   * @param {number} dt
   * @param {Property.<boolean>} playingProperty: whether the sim is playing or not
   * @public
   */
  step(dt, playingProperty) {
    const spring = this.periodTrace.spring;
    const mass = spring.massAttachedProperty.value;

    // The period trace should only be drawn when a mass is oscillating on a spring and its checkbox is toggled on.
    if (mass && !mass.userControlledProperty.value && spring.periodTraceVisibilityProperty.value && !(mass.verticalVelocityProperty.value === 0)) {
      // Responsible for fading the period trace.We want to fade only when the sim is playing and
      // the state is either 4 or when the trace has begun fading already.
      if ((this.periodTrace.stateProperty.value === 4 || this.colorAlpha !== 1) && playingProperty.value) {
        this.fade(dt);
      }

      // Responsible for drawing the period trace based on the state of the trace.
      const modelViewTransform = this.modelViewTransform;
      if (mass && !mass.userControlledProperty.value) {
        // Transforming our model positions into view positions.
        const massEquilibrium = spring.massEquilibriumYPositionProperty.value;
        const equilibriumYPosition = modelViewTransform.modelToViewY(massEquilibrium);
        const firstPeakYPosition = modelViewTransform.modelToViewY(massEquilibrium + this.periodTrace.firstPeakY);
        const secondPeakYPosition = modelViewTransform.modelToViewY(massEquilibrium + this.periodTrace.secondPeakY);
        const currentYPosition = modelViewTransform.modelToViewY(massEquilibrium + spring.massEquilibriumDisplacementProperty.value);
        this.shape = new Shape();
        const state = this.periodTrace.stateProperty.value; // 0 to 4
        if (state === 0) {
          this.visible = false;
        } else {
          this.visible = spring.periodTraceVisibilityProperty.value;

          // sets our initial position
          this.shape.moveTo(this.originalX, equilibriumYPosition);

          // draws a line from our current position to a new position, then sets our current position to the new position
          this.shape.verticalLineTo(state === 1 ? currentYPosition : firstPeakYPosition);
          if (state > 1) {
            // first connector
            this.shape.horizontalLineTo(this.middleX);

            // second line
            this.shape.verticalLineTo(state === 2 ? currentYPosition : secondPeakYPosition + this.path.lineWidth / 2);
            if (state > 2) {
              // second connector
              this.shape.horizontalLineTo(this.lastX);

              // third line
              this.shape.verticalLineTo(state === 3 ? currentYPosition : equilibriumYPosition - this.path.lineWidth / 2);
            }
          }

          // Thin the line width once it reaches a certain threshold at a rate of delta.
          // Variables are extracted for readability.
          const delta = 0.025; // Rate at which the line is being thinned. Empirically determined.
          const maxLineWidth = 2.5; // Maximum line width of the trace.
          const minLineWidth = 0.5; // Minimum line width of the trace.

          this.path.lineWidth = this.periodTrace.thresholdReached ? this.path.lineWidth - delta : maxLineWidth;
          if (this.path.lineWidth <= minLineWidth) {
            this.path.lineWidth = minLineWidth;
          }
          this.path.setShape(this.shape);
        }
      }
    }

    // Responsible for restarting the period trace.
    else {
      this.visible = false;
      this.periodTrace.onFaded();
    }
  }

  /**
   * Fades the period trace.
   * @param {number} dt
   *
   * @private
   */
  fade(dt) {
    this.colorAlpha = Math.max(0, this.colorAlpha - FADE_OUT_SPEED * dt);
    this.traceColorProperty.value = this.traceColorProperty.value.withAlpha(this.colorAlpha);
    if (this.colorAlpha === 0) {
      this.periodTrace.onFaded();
      this.traceColorProperty.value = this.traceColorProperty.value.withAlpha(1);
      this.colorAlpha = 1;
    }
  }
}
massesAndSprings.register('PeriodTraceNode', PeriodTraceNode);
export default PeriodTraceNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNoYXBlIiwiQ29sb3IiLCJOb2RlIiwiUGF0aCIsIm1hc3Nlc0FuZFNwcmluZ3MiLCJYX09GRlNFVCIsIkZBREVfT1VUX1NQRUVEIiwiUGVyaW9kVHJhY2VOb2RlIiwiY29uc3RydWN0b3IiLCJwZXJpb2RUcmFjZSIsIm1vZGVsVmlld1RyYW5zZm9ybSIsInNoYXBlIiwiY29sb3JBbHBoYSIsInRyYWNlQ29sb3JQcm9wZXJ0eSIsIm9yaWdpbmFsWCIsIm1vZGVsVG9WaWV3WCIsInNwcmluZyIsInBvc2l0aW9uUHJvcGVydHkiLCJ2YWx1ZSIsIngiLCJtaWRkbGVYIiwibGFzdFgiLCJwYXRoIiwic3Ryb2tlIiwibGluZVdpZHRoIiwiYWRkQ2hpbGQiLCJzdGF0ZVByb3BlcnR5IiwibGluayIsInN0YXRlIiwid2l0aEFscGhhIiwic3RlcCIsImR0IiwicGxheWluZ1Byb3BlcnR5IiwibWFzcyIsIm1hc3NBdHRhY2hlZFByb3BlcnR5IiwidXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsInBlcmlvZFRyYWNlVmlzaWJpbGl0eVByb3BlcnR5IiwidmVydGljYWxWZWxvY2l0eVByb3BlcnR5IiwiZmFkZSIsIm1hc3NFcXVpbGlicml1bSIsIm1hc3NFcXVpbGlicml1bVlQb3NpdGlvblByb3BlcnR5IiwiZXF1aWxpYnJpdW1ZUG9zaXRpb24iLCJtb2RlbFRvVmlld1kiLCJmaXJzdFBlYWtZUG9zaXRpb24iLCJmaXJzdFBlYWtZIiwic2Vjb25kUGVha1lQb3NpdGlvbiIsInNlY29uZFBlYWtZIiwiY3VycmVudFlQb3NpdGlvbiIsIm1hc3NFcXVpbGlicml1bURpc3BsYWNlbWVudFByb3BlcnR5IiwidmlzaWJsZSIsIm1vdmVUbyIsInZlcnRpY2FsTGluZVRvIiwiaG9yaXpvbnRhbExpbmVUbyIsImRlbHRhIiwibWF4TGluZVdpZHRoIiwibWluTGluZVdpZHRoIiwidGhyZXNob2xkUmVhY2hlZCIsInNldFNoYXBlIiwib25GYWRlZCIsIk1hdGgiLCJtYXgiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBlcmlvZFRyYWNlTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciBwZXJpb2QgdHJhY2Ugb2YgbWFzcyBvc2NpbGxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBEZW56ZWxsIEJhcm5ldHQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBOb2RlLCBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1hc3Nlc0FuZFNwcmluZ3MgZnJvbSAnLi4vLi4vbWFzc2VzQW5kU3ByaW5ncy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgWF9PRkZTRVQgPSAxMDtcclxuY29uc3QgRkFERV9PVVRfU1BFRUQgPSAxOyAvLyB0aGUgc3BlZWQgYXQgd2hpY2ggdGhlIHRyYWNlIGZhZGVzIG91dC5cclxuXHJcbmNsYXNzIFBlcmlvZFRyYWNlTm9kZSBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UGVyaW9kVHJhY2V9IHBlcmlvZFRyYWNlXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBwZXJpb2RUcmFjZSwgbW9kZWxWaWV3VHJhbnNmb3JtICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQZXJpb2RUcmFjZX0gTW9kZWwgZWxlbWVudCBmb3IgdGhlIHBlcmlvZCB0cmFjZVxyXG4gICAgdGhpcy5wZXJpb2RUcmFjZSA9IHBlcmlvZFRyYWNlO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1NoYXBlfVxyXG4gICAgdGhpcy5zaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IFRoZSBvcGFjaXR5IG9mIHRoZSB0cmFjZSAobm90IHVzaW5nIE5vZGUgb3BhY2l0eSBmb3IgcGVyZm9ybWFuY2UgcmVhc29ucylcclxuICAgIHRoaXMuY29sb3JBbHBoYSA9IDE7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1Byb3BlcnR5LjxDb2xvcj59XHJcbiAgICB0aGlzLnRyYWNlQ29sb3JQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbmV3IENvbG9yKCAnYmxhY2snICkgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7TW9kZWxWaWV3VHJhbnNGb3JtfVxyXG4gICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0gPSBtb2RlbFZpZXdUcmFuc2Zvcm07XHJcblxyXG4gICAgdGhpcy5vcmlnaW5hbFggPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIHBlcmlvZFRyYWNlLnNwcmluZy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnggLSAwLjIgKTtcclxuICAgIHRoaXMubWlkZGxlWCA9IHRoaXMub3JpZ2luYWxYICsgWF9PRkZTRVQ7XHJcbiAgICB0aGlzLmxhc3RYID0gdGhpcy5vcmlnaW5hbFggKyAyICogWF9PRkZTRVQ7XHJcblxyXG4gICAgdGhpcy5wYXRoID0gbmV3IFBhdGgoIG51bGwsIHsgc3Ryb2tlOiB0aGlzLnRyYWNlQ29sb3JQcm9wZXJ0eSwgbGluZVdpZHRoOiAyLjUgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5wYXRoICk7XHJcbiAgICB0aGlzLnBlcmlvZFRyYWNlLnN0YXRlUHJvcGVydHkubGluayggc3RhdGUgPT4ge1xyXG4gICAgICBpZiAoIHN0YXRlID09PSAxICkge1xyXG4gICAgICAgIHRoaXMudHJhY2VDb2xvclByb3BlcnR5LnZhbHVlID0gdGhpcy50cmFjZUNvbG9yUHJvcGVydHkudmFsdWUud2l0aEFscGhhKCAxICk7XHJcbiAgICAgICAgdGhpcy5jb2xvckFscGhhID0gMTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBwbGF5aW5nUHJvcGVydHk6IHdoZXRoZXIgdGhlIHNpbSBpcyBwbGF5aW5nIG9yIG5vdFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCwgcGxheWluZ1Byb3BlcnR5ICkge1xyXG4gICAgY29uc3Qgc3ByaW5nID0gdGhpcy5wZXJpb2RUcmFjZS5zcHJpbmc7XHJcbiAgICBjb25zdCBtYXNzID0gc3ByaW5nLm1hc3NBdHRhY2hlZFByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIC8vIFRoZSBwZXJpb2QgdHJhY2Ugc2hvdWxkIG9ubHkgYmUgZHJhd24gd2hlbiBhIG1hc3MgaXMgb3NjaWxsYXRpbmcgb24gYSBzcHJpbmcgYW5kIGl0cyBjaGVja2JveCBpcyB0b2dnbGVkIG9uLlxyXG4gICAgaWYgKCBtYXNzICYmICFtYXNzLnVzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgJiZcclxuICAgICAgICAgc3ByaW5nLnBlcmlvZFRyYWNlVmlzaWJpbGl0eVByb3BlcnR5LnZhbHVlICYmXHJcbiAgICAgICAgICEoIG1hc3MudmVydGljYWxWZWxvY2l0eVByb3BlcnR5LnZhbHVlID09PSAwICkgKSB7XHJcblxyXG4gICAgICAvLyBSZXNwb25zaWJsZSBmb3IgZmFkaW5nIHRoZSBwZXJpb2QgdHJhY2UuV2Ugd2FudCB0byBmYWRlIG9ubHkgd2hlbiB0aGUgc2ltIGlzIHBsYXlpbmcgYW5kXHJcbiAgICAgIC8vIHRoZSBzdGF0ZSBpcyBlaXRoZXIgNCBvciB3aGVuIHRoZSB0cmFjZSBoYXMgYmVndW4gZmFkaW5nIGFscmVhZHkuXHJcbiAgICAgIGlmICggKCB0aGlzLnBlcmlvZFRyYWNlLnN0YXRlUHJvcGVydHkudmFsdWUgPT09IDQgfHwgdGhpcy5jb2xvckFscGhhICE9PSAxICkgJiYgcGxheWluZ1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIHRoaXMuZmFkZSggZHQgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUmVzcG9uc2libGUgZm9yIGRyYXdpbmcgdGhlIHBlcmlvZCB0cmFjZSBiYXNlZCBvbiB0aGUgc3RhdGUgb2YgdGhlIHRyYWNlLlxyXG4gICAgICBjb25zdCBtb2RlbFZpZXdUcmFuc2Zvcm0gPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybTtcclxuICAgICAgaWYgKCBtYXNzICYmICFtYXNzLnVzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgKSB7XHJcblxyXG4gICAgICAgIC8vIFRyYW5zZm9ybWluZyBvdXIgbW9kZWwgcG9zaXRpb25zIGludG8gdmlldyBwb3NpdGlvbnMuXHJcbiAgICAgICAgY29uc3QgbWFzc0VxdWlsaWJyaXVtID0gc3ByaW5nLm1hc3NFcXVpbGlicml1bVlQb3NpdGlvblByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgIGNvbnN0IGVxdWlsaWJyaXVtWVBvc2l0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggbWFzc0VxdWlsaWJyaXVtICk7XHJcbiAgICAgICAgY29uc3QgZmlyc3RQZWFrWVBvc2l0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggbWFzc0VxdWlsaWJyaXVtICsgdGhpcy5wZXJpb2RUcmFjZS5maXJzdFBlYWtZICk7XHJcbiAgICAgICAgY29uc3Qgc2Vjb25kUGVha1lQb3NpdGlvbiA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIG1hc3NFcXVpbGlicml1bSArIHRoaXMucGVyaW9kVHJhY2Uuc2Vjb25kUGVha1kgKTtcclxuICAgICAgICBjb25zdCBjdXJyZW50WVBvc2l0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggbWFzc0VxdWlsaWJyaXVtICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ByaW5nLm1hc3NFcXVpbGlicml1bURpc3BsYWNlbWVudFByb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgICAgIHRoaXMuc2hhcGUgPSBuZXcgU2hhcGUoKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLnBlcmlvZFRyYWNlLnN0YXRlUHJvcGVydHkudmFsdWU7IC8vIDAgdG8gNFxyXG4gICAgICAgIGlmICggc3RhdGUgPT09IDAgKSB7XHJcbiAgICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnZpc2libGUgPSBzcHJpbmcucGVyaW9kVHJhY2VWaXNpYmlsaXR5UHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgICAgICAgLy8gc2V0cyBvdXIgaW5pdGlhbCBwb3NpdGlvblxyXG4gICAgICAgICAgdGhpcy5zaGFwZS5tb3ZlVG8oIHRoaXMub3JpZ2luYWxYLCBlcXVpbGlicml1bVlQb3NpdGlvbiApO1xyXG5cclxuICAgICAgICAgIC8vIGRyYXdzIGEgbGluZSBmcm9tIG91ciBjdXJyZW50IHBvc2l0aW9uIHRvIGEgbmV3IHBvc2l0aW9uLCB0aGVuIHNldHMgb3VyIGN1cnJlbnQgcG9zaXRpb24gdG8gdGhlIG5ldyBwb3NpdGlvblxyXG4gICAgICAgICAgdGhpcy5zaGFwZS52ZXJ0aWNhbExpbmVUbyggc3RhdGUgPT09IDEgPyBjdXJyZW50WVBvc2l0aW9uIDogZmlyc3RQZWFrWVBvc2l0aW9uICk7XHJcbiAgICAgICAgICBpZiAoIHN0YXRlID4gMSApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGZpcnN0IGNvbm5lY3RvclxyXG4gICAgICAgICAgICB0aGlzLnNoYXBlLmhvcml6b250YWxMaW5lVG8oIHRoaXMubWlkZGxlWCApO1xyXG5cclxuICAgICAgICAgICAgLy8gc2Vjb25kIGxpbmVcclxuICAgICAgICAgICAgdGhpcy5zaGFwZS52ZXJ0aWNhbExpbmVUbyggc3RhdGUgPT09IDIgPyBjdXJyZW50WVBvc2l0aW9uIDogc2Vjb25kUGVha1lQb3NpdGlvbiArIHRoaXMucGF0aC5saW5lV2lkdGggLyAyICk7XHJcbiAgICAgICAgICAgIGlmICggc3RhdGUgPiAyICkge1xyXG5cclxuICAgICAgICAgICAgICAvLyBzZWNvbmQgY29ubmVjdG9yXHJcbiAgICAgICAgICAgICAgdGhpcy5zaGFwZS5ob3Jpem9udGFsTGluZVRvKCB0aGlzLmxhc3RYICk7XHJcblxyXG4gICAgICAgICAgICAgIC8vIHRoaXJkIGxpbmVcclxuICAgICAgICAgICAgICB0aGlzLnNoYXBlLnZlcnRpY2FsTGluZVRvKCBzdGF0ZSA9PT0gMyA/IGN1cnJlbnRZUG9zaXRpb24gOiBlcXVpbGlicml1bVlQb3NpdGlvbiAtIHRoaXMucGF0aC5saW5lV2lkdGggLyAyICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBUaGluIHRoZSBsaW5lIHdpZHRoIG9uY2UgaXQgcmVhY2hlcyBhIGNlcnRhaW4gdGhyZXNob2xkIGF0IGEgcmF0ZSBvZiBkZWx0YS5cclxuICAgICAgICAgIC8vIFZhcmlhYmxlcyBhcmUgZXh0cmFjdGVkIGZvciByZWFkYWJpbGl0eS5cclxuICAgICAgICAgIGNvbnN0IGRlbHRhID0gMC4wMjU7ICAgICAgICAgIC8vIFJhdGUgYXQgd2hpY2ggdGhlIGxpbmUgaXMgYmVpbmcgdGhpbm5lZC4gRW1waXJpY2FsbHkgZGV0ZXJtaW5lZC5cclxuICAgICAgICAgIGNvbnN0IG1heExpbmVXaWR0aCA9IDIuNTsgICAgIC8vIE1heGltdW0gbGluZSB3aWR0aCBvZiB0aGUgdHJhY2UuXHJcbiAgICAgICAgICBjb25zdCBtaW5MaW5lV2lkdGggPSAwLjU7ICAgICAvLyBNaW5pbXVtIGxpbmUgd2lkdGggb2YgdGhlIHRyYWNlLlxyXG5cclxuICAgICAgICAgIHRoaXMucGF0aC5saW5lV2lkdGggPSB0aGlzLnBlcmlvZFRyYWNlLnRocmVzaG9sZFJlYWNoZWQgPyAoIHRoaXMucGF0aC5saW5lV2lkdGggLSBkZWx0YSApIDogbWF4TGluZVdpZHRoO1xyXG4gICAgICAgICAgaWYgKCB0aGlzLnBhdGgubGluZVdpZHRoIDw9IG1pbkxpbmVXaWR0aCApIHtcclxuICAgICAgICAgICAgdGhpcy5wYXRoLmxpbmVXaWR0aCA9IG1pbkxpbmVXaWR0aDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMucGF0aC5zZXRTaGFwZSggdGhpcy5zaGFwZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlc3BvbnNpYmxlIGZvciByZXN0YXJ0aW5nIHRoZSBwZXJpb2QgdHJhY2UuXHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIHRoaXMucGVyaW9kVHJhY2Uub25GYWRlZCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmFkZXMgdGhlIHBlcmlvZCB0cmFjZS5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZmFkZSggZHQgKSB7XHJcbiAgICB0aGlzLmNvbG9yQWxwaGEgPSBNYXRoLm1heCggMCwgdGhpcy5jb2xvckFscGhhIC0gRkFERV9PVVRfU1BFRUQgKiBkdCApO1xyXG4gICAgdGhpcy50cmFjZUNvbG9yUHJvcGVydHkudmFsdWUgPSB0aGlzLnRyYWNlQ29sb3JQcm9wZXJ0eS52YWx1ZS53aXRoQWxwaGEoIHRoaXMuY29sb3JBbHBoYSApO1xyXG5cclxuICAgIGlmICggdGhpcy5jb2xvckFscGhhID09PSAwICkge1xyXG4gICAgICB0aGlzLnBlcmlvZFRyYWNlLm9uRmFkZWQoKTtcclxuICAgICAgdGhpcy50cmFjZUNvbG9yUHJvcGVydHkudmFsdWUgPSB0aGlzLnRyYWNlQ29sb3JQcm9wZXJ0eS52YWx1ZS53aXRoQWxwaGEoIDEgKTtcclxuICAgICAgdGhpcy5jb2xvckFscGhhID0gMTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbm1hc3Nlc0FuZFNwcmluZ3MucmVnaXN0ZXIoICdQZXJpb2RUcmFjZU5vZGUnLCBQZXJpb2RUcmFjZU5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBlcmlvZFRyYWNlTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELFNBQVNDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3JFLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjs7QUFFeEQ7QUFDQSxNQUFNQyxRQUFRLEdBQUcsRUFBRTtBQUNuQixNQUFNQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRTFCLE1BQU1DLGVBQWUsU0FBU0wsSUFBSSxDQUFDO0VBQ2pDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRU0sV0FBV0EsQ0FBRUMsV0FBVyxFQUFFQyxrQkFBa0IsRUFBRztJQUM3QyxLQUFLLENBQUMsQ0FBQzs7SUFFUDtJQUNBLElBQUksQ0FBQ0QsV0FBVyxHQUFHQSxXQUFXOztJQUU5QjtJQUNBLElBQUksQ0FBQ0UsS0FBSyxHQUFHLElBQUlYLEtBQUssQ0FBQyxDQUFDOztJQUV4QjtJQUNBLElBQUksQ0FBQ1ksVUFBVSxHQUFHLENBQUM7O0lBRW5CO0lBQ0EsSUFBSSxDQUFDQyxrQkFBa0IsR0FBRyxJQUFJZCxRQUFRLENBQUUsSUFBSUUsS0FBSyxDQUFFLE9BQVEsQ0FBRSxDQUFDOztJQUU5RDtJQUNBLElBQUksQ0FBQ1Ms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