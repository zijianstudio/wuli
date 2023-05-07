// Copyright 2020-2022, University of Colorado Boulder

/**
 * View for a single Vector that appears in the 'Momenta Diagram' accordion box at the bottom-right of each screen. This
 * view is intended to be used for both the Momenta Vectors of the Balls and the total Momenta Vector.
 *
 * Responsible for:
 *  - Keeping the updating an ArrowNode based on the MomentaDiagramVector's tail and tip.
 *  - Labeling the ArrowNode, usually with the index of the Ball but can be the 'total' string for the total Momenta
 *    Vector Node. The positioning is also handled.
 *
 * MomentaDiagramVectorNode is NOT responsible for updating its visibility. MomentaDiagramVectorNodes are created for
 * each prepopulatedBall, which are never disposed. Thus, MomentaDiagramVectorNodes are never disposed.
 *
 * @author Brandon Li
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import MomentaDiagramVector from '../model/MomentaDiagramVector.js';
import PlayArea from '../model/PlayArea.js';
class MomentaDiagramVectorNode extends Node {
  /**
   * @param {MomentaDiagramVector} momentaDiagramVector
   * @param {string|number} label - what to label the MomentaDiagramVectorNode. Usually, this is the Balls index.
   * @param {ReadOnlyProperty.<ModelViewTransform2>} modelViewTransformProperty - for the MomentaDiagramAccordionBox
   * @param {Object} [options]
   */
  constructor(momentaDiagramVector, label, modelViewTransformProperty, options) {
    assert && assert(momentaDiagramVector instanceof MomentaDiagramVector, `invalid momentaDiagramVector: ${momentaDiagramVector}`);
    assert && assert(typeof label === 'number' || typeof label === 'string', `invalid label: ${label}`);
    assert && AssertUtils.assertAbstractPropertyOf(modelViewTransformProperty, ModelViewTransform2);
    options = merge({
      // {number} - the dimension of the Screen that contains the MomentaDiagram
      dimension: PlayArea.Dimension.TWO,
      // {boolean} - indicates if this vector Node represents the total Momenta Vector.
      isTotalMomentaVector: false,
      // {number} - margin between the label and the arrow, in view coordinates.
      labelArrowMargin: 2,
      // {Object} - passed to the ArrowNode instance.
      arrowOptions: merge({
        fill: CollisionLabColors.MOMENTUM_VECTOR_FILL,
        stroke: CollisionLabColors.MOMENTUM_VECTOR_STROKE
      }, CollisionLabConstants.ARROW_OPTIONS),
      // {Object} - passed to the Text instance for the label.
      textOptions: {
        font: new PhetFont({
          size: 14,
          weight: 500
        }),
        maxWidth: 30 // constrain width for i18n, determined empirically.
      }
    }, options);
    super(options);

    //----------------------------------------------------------------------------------------

    // Create the ArrowNode that represents the Vector. Initialized at 0 for now. To be updated below.
    const arrowNode = new ArrowNode(0, 0, 0, 0, options.arrowOptions);

    // Create a label for the vector that is displayed 'next' to the arrow. Positioning handled later.
    const labelNode = new Text(label, options.textOptions);

    // Set the children of this Node in the correct rendering order.
    this.children = [arrowNode, labelNode];

    //----------------------------------------------------------------------------------------

    // Observe changes to the tail/tip of the Momenta Vector, or when the modelViewTransformProperty changes,
    // and mirror the positioning of the arrow and label in the view.
    Multilink.multilink([momentaDiagramVector.tailPositionProperty, momentaDiagramVector.tipPositionProperty, modelViewTransformProperty], (tailPosition, tipPosition, modelViewTransform) => {
      // Only display the Vector and its label if the momentaDiagramVector has a magnitude that isn't effectively 0.
      arrowNode.visible = momentaDiagramVector.magnitude > CollisionLabConstants.ZERO_THRESHOLD;
      labelNode.visible = arrowNode.visible;
      if (!arrowNode.visible) {
        /** exit **/
        return;
      }

      // Get the position of the tail, center, and tip in view coordinates.
      const tailViewPosition = modelViewTransform.modelToViewPosition(tailPosition);
      const tipViewPosition = modelViewTransform.modelToViewPosition(tipPosition);
      const centerViewPosition = modelViewTransform.modelToViewPosition(momentaDiagramVector.center);

      // Update the positioning of the ArrowNode to match the MomentaDiagramVector.
      arrowNode.setTailAndTip(tailViewPosition.x, tailViewPosition.y, tipViewPosition.x, tipViewPosition.y);

      //----------------------------------------------------------------------------------------

      // Compute the adjusted offset of the label in view coordinates. It adds extra offset to consider the size
      // of the label.
      const adjustedOffset = options.labelArrowMargin + Math.max(labelNode.height, labelNode.width) / 2;

      // Position the Label, which depends on the dimension and whether or not this the total momenta Vector.
      if (options.dimension === PlayArea.Dimension.TWO) {
        // Determine how the label should be positioned based on the type of Momenta Vector and what quadrant it's in.
        const yFlip = momentaDiagramVector.componentsProperty.value.y < 0 ? Math.PI : 0;
        const offsetAngleAdjustment = yFlip + (options.isTotalMomentaVector ? Math.PI / 2 : -Math.PI / 2);

        // Create an offset that is perpendicular to the vector. The angle is negative since the y-axis is inverted.
        const offset = Vector2.createPolar(adjustedOffset, -(momentaDiagramVector.angle + offsetAngleAdjustment));

        // Position the label.
        labelNode.center = centerViewPosition.plus(offset);
      } else if (options.isTotalMomentaVector) {
        // Position the label below the Momenta Vector.
        labelNode.centerTop = centerViewPosition.plusXY(0, adjustedOffset * 0.5);
      } else {
        // Position the label which depends on the sign of the x-component of the Momenta Vector.
        labelNode.center = tipViewPosition.plusXY(Math.sign(momentaDiagramVector.componentsProperty.value.x) * adjustedOffset, 0);
      }
    });
  }
}
collisionLab.register('MomentaDiagramVectorNode', MomentaDiagramVectorNode);
export default MomentaDiagramVectorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJWZWN0b3IyIiwibWVyZ2UiLCJBc3NlcnRVdGlscyIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJBcnJvd05vZGUiLCJQaGV0Rm9udCIsIk5vZGUiLCJUZXh0IiwiY29sbGlzaW9uTGFiIiwiQ29sbGlzaW9uTGFiQ29sb3JzIiwiQ29sbGlzaW9uTGFiQ29uc3RhbnRzIiwiTW9tZW50YURpYWdyYW1WZWN0b3IiLCJQbGF5QXJlYSIsIk1vbWVudGFEaWFncmFtVmVjdG9yTm9kZSIsImNvbnN0cnVjdG9yIiwibW9tZW50YURpYWdyYW1WZWN0b3IiLCJsYWJlbCIsIm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5Iiwib3B0aW9ucyIsImFzc2VydCIsImFzc2VydEFic3RyYWN0UHJvcGVydHlPZiIsImRpbWVuc2lvbiIsIkRpbWVuc2lvbiIsIlRXTyIsImlzVG90YWxNb21lbnRhVmVjdG9yIiwibGFiZWxBcnJvd01hcmdpbiIsImFycm93T3B0aW9ucyIsImZpbGwiLCJNT01FTlRVTV9WRUNUT1JfRklMTCIsInN0cm9rZSIsIk1PTUVOVFVNX1ZFQ1RPUl9TVFJPS0UiLCJBUlJPV19PUFRJT05TIiwidGV4dE9wdGlvbnMiLCJmb250Iiwic2l6ZSIsIndlaWdodCIsIm1heFdpZHRoIiwiYXJyb3dOb2RlIiwibGFiZWxOb2RlIiwiY2hpbGRyZW4iLCJtdWx0aWxpbmsiLCJ0YWlsUG9zaXRpb25Qcm9wZXJ0eSIsInRpcFBvc2l0aW9uUHJvcGVydHkiLCJ0YWlsUG9zaXRpb24iLCJ0aXBQb3NpdGlvbiIsIm1vZGVsVmlld1RyYW5zZm9ybSIsInZpc2libGUiLCJtYWduaXR1ZGUiLCJaRVJPX1RIUkVTSE9MRCIsInRhaWxWaWV3UG9zaXRpb24iLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwidGlwVmlld1Bvc2l0aW9uIiwiY2VudGVyVmlld1Bvc2l0aW9uIiwiY2VudGVyIiwic2V0VGFpbEFuZFRpcCIsIngiLCJ5IiwiYWRqdXN0ZWRPZmZzZXQiLCJNYXRoIiwibWF4IiwiaGVpZ2h0Iiwid2lkdGgiLCJ5RmxpcCIsImNvbXBvbmVudHNQcm9wZXJ0eSIsInZhbHVlIiwiUEkiLCJvZmZzZXRBbmdsZUFkanVzdG1lbnQiLCJvZmZzZXQiLCJjcmVhdGVQb2xhciIsImFuZ2xlIiwicGx1cyIsImNlbnRlclRvcCIsInBsdXNYWSIsInNpZ24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1vbWVudGFEaWFncmFtVmVjdG9yTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciBhIHNpbmdsZSBWZWN0b3IgdGhhdCBhcHBlYXJzIGluIHRoZSAnTW9tZW50YSBEaWFncmFtJyBhY2NvcmRpb24gYm94IGF0IHRoZSBib3R0b20tcmlnaHQgb2YgZWFjaCBzY3JlZW4uIFRoaXNcclxuICogdmlldyBpcyBpbnRlbmRlZCB0byBiZSB1c2VkIGZvciBib3RoIHRoZSBNb21lbnRhIFZlY3RvcnMgb2YgdGhlIEJhbGxzIGFuZCB0aGUgdG90YWwgTW9tZW50YSBWZWN0b3IuXHJcbiAqXHJcbiAqIFJlc3BvbnNpYmxlIGZvcjpcclxuICogIC0gS2VlcGluZyB0aGUgdXBkYXRpbmcgYW4gQXJyb3dOb2RlIGJhc2VkIG9uIHRoZSBNb21lbnRhRGlhZ3JhbVZlY3RvcidzIHRhaWwgYW5kIHRpcC5cclxuICogIC0gTGFiZWxpbmcgdGhlIEFycm93Tm9kZSwgdXN1YWxseSB3aXRoIHRoZSBpbmRleCBvZiB0aGUgQmFsbCBidXQgY2FuIGJlIHRoZSAndG90YWwnIHN0cmluZyBmb3IgdGhlIHRvdGFsIE1vbWVudGFcclxuICogICAgVmVjdG9yIE5vZGUuIFRoZSBwb3NpdGlvbmluZyBpcyBhbHNvIGhhbmRsZWQuXHJcbiAqXHJcbiAqIE1vbWVudGFEaWFncmFtVmVjdG9yTm9kZSBpcyBOT1QgcmVzcG9uc2libGUgZm9yIHVwZGF0aW5nIGl0cyB2aXNpYmlsaXR5LiBNb21lbnRhRGlhZ3JhbVZlY3Rvck5vZGVzIGFyZSBjcmVhdGVkIGZvclxyXG4gKiBlYWNoIHByZXBvcHVsYXRlZEJhbGwsIHdoaWNoIGFyZSBuZXZlciBkaXNwb3NlZC4gVGh1cywgTW9tZW50YURpYWdyYW1WZWN0b3JOb2RlcyBhcmUgbmV2ZXIgZGlzcG9zZWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKi9cclxuXHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgQXNzZXJ0VXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9Bc3NlcnRVdGlscy5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IEFycm93Tm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvQXJyb3dOb2RlLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY29sbGlzaW9uTGFiIGZyb20gJy4uLy4uL2NvbGxpc2lvbkxhYi5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJDb2xvcnMgZnJvbSAnLi4vQ29sbGlzaW9uTGFiQ29sb3JzLmpzJztcclxuaW1wb3J0IENvbGxpc2lvbkxhYkNvbnN0YW50cyBmcm9tICcuLi9Db2xsaXNpb25MYWJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgTW9tZW50YURpYWdyYW1WZWN0b3IgZnJvbSAnLi4vbW9kZWwvTW9tZW50YURpYWdyYW1WZWN0b3IuanMnO1xyXG5pbXBvcnQgUGxheUFyZWEgZnJvbSAnLi4vbW9kZWwvUGxheUFyZWEuanMnO1xyXG5cclxuY2xhc3MgTW9tZW50YURpYWdyYW1WZWN0b3JOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TW9tZW50YURpYWdyYW1WZWN0b3J9IG1vbWVudGFEaWFncmFtVmVjdG9yXHJcbiAgICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBsYWJlbCAtIHdoYXQgdG8gbGFiZWwgdGhlIE1vbWVudGFEaWFncmFtVmVjdG9yTm9kZS4gVXN1YWxseSwgdGhpcyBpcyB0aGUgQmFsbHMgaW5kZXguXHJcbiAgICogQHBhcmFtIHtSZWFkT25seVByb3BlcnR5LjxNb2RlbFZpZXdUcmFuc2Zvcm0yPn0gbW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkgLSBmb3IgdGhlIE1vbWVudGFEaWFncmFtQWNjb3JkaW9uQm94XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb21lbnRhRGlhZ3JhbVZlY3RvciwgbGFiZWwsIG1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5LCBvcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbW9tZW50YURpYWdyYW1WZWN0b3IgaW5zdGFuY2VvZiBNb21lbnRhRGlhZ3JhbVZlY3RvciwgYGludmFsaWQgbW9tZW50YURpYWdyYW1WZWN0b3I6ICR7bW9tZW50YURpYWdyYW1WZWN0b3J9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGxhYmVsID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgbGFiZWwgPT09ICdzdHJpbmcnLCBgaW52YWxpZCBsYWJlbDogJHtsYWJlbH1gICk7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0QWJzdHJhY3RQcm9wZXJ0eU9mKCBtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSwgTW9kZWxWaWV3VHJhbnNmb3JtMiApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8ge251bWJlcn0gLSB0aGUgZGltZW5zaW9uIG9mIHRoZSBTY3JlZW4gdGhhdCBjb250YWlucyB0aGUgTW9tZW50YURpYWdyYW1cclxuICAgICAgZGltZW5zaW9uOiBQbGF5QXJlYS5EaW1lbnNpb24uVFdPLFxyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IC0gaW5kaWNhdGVzIGlmIHRoaXMgdmVjdG9yIE5vZGUgcmVwcmVzZW50cyB0aGUgdG90YWwgTW9tZW50YSBWZWN0b3IuXHJcbiAgICAgIGlzVG90YWxNb21lbnRhVmVjdG9yOiBmYWxzZSxcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ9IC0gbWFyZ2luIGJldHdlZW4gdGhlIGxhYmVsIGFuZCB0aGUgYXJyb3csIGluIHZpZXcgY29vcmRpbmF0ZXMuXHJcbiAgICAgIGxhYmVsQXJyb3dNYXJnaW46IDIsXHJcblxyXG4gICAgICAvLyB7T2JqZWN0fSAtIHBhc3NlZCB0byB0aGUgQXJyb3dOb2RlIGluc3RhbmNlLlxyXG4gICAgICBhcnJvd09wdGlvbnM6IG1lcmdlKCB7XHJcbiAgICAgICAgZmlsbDogQ29sbGlzaW9uTGFiQ29sb3JzLk1PTUVOVFVNX1ZFQ1RPUl9GSUxMLFxyXG4gICAgICAgIHN0cm9rZTogQ29sbGlzaW9uTGFiQ29sb3JzLk1PTUVOVFVNX1ZFQ1RPUl9TVFJPS0VcclxuICAgICAgfSwgQ29sbGlzaW9uTGFiQ29uc3RhbnRzLkFSUk9XX09QVElPTlMgKSxcclxuXHJcbiAgICAgIC8vIHtPYmplY3R9IC0gcGFzc2VkIHRvIHRoZSBUZXh0IGluc3RhbmNlIGZvciB0aGUgbGFiZWwuXHJcbiAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDE0LCB3ZWlnaHQ6IDUwMCB9ICksXHJcbiAgICAgICAgbWF4V2lkdGg6IDMwIC8vIGNvbnN0cmFpbiB3aWR0aCBmb3IgaTE4biwgZGV0ZXJtaW5lZCBlbXBpcmljYWxseS5cclxuICAgICAgfVxyXG5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgQXJyb3dOb2RlIHRoYXQgcmVwcmVzZW50cyB0aGUgVmVjdG9yLiBJbml0aWFsaXplZCBhdCAwIGZvciBub3cuIFRvIGJlIHVwZGF0ZWQgYmVsb3cuXHJcbiAgICBjb25zdCBhcnJvd05vZGUgPSBuZXcgQXJyb3dOb2RlKCAwLCAwLCAwLCAwLCBvcHRpb25zLmFycm93T3B0aW9ucyApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIGxhYmVsIGZvciB0aGUgdmVjdG9yIHRoYXQgaXMgZGlzcGxheWVkICduZXh0JyB0byB0aGUgYXJyb3cuIFBvc2l0aW9uaW5nIGhhbmRsZWQgbGF0ZXIuXHJcbiAgICBjb25zdCBsYWJlbE5vZGUgPSBuZXcgVGV4dCggbGFiZWwsIG9wdGlvbnMudGV4dE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIGNoaWxkcmVuIG9mIHRoaXMgTm9kZSBpbiB0aGUgY29ycmVjdCByZW5kZXJpbmcgb3JkZXIuXHJcbiAgICB0aGlzLmNoaWxkcmVuID0gW1xyXG4gICAgICBhcnJvd05vZGUsXHJcbiAgICAgIGxhYmVsTm9kZVxyXG4gICAgXTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBPYnNlcnZlIGNoYW5nZXMgdG8gdGhlIHRhaWwvdGlwIG9mIHRoZSBNb21lbnRhIFZlY3Rvciwgb3Igd2hlbiB0aGUgbW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkgY2hhbmdlcyxcclxuICAgIC8vIGFuZCBtaXJyb3IgdGhlIHBvc2l0aW9uaW5nIG9mIHRoZSBhcnJvdyBhbmQgbGFiZWwgaW4gdGhlIHZpZXcuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIG1vbWVudGFEaWFncmFtVmVjdG9yLnRhaWxQb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBtb21lbnRhRGlhZ3JhbVZlY3Rvci50aXBQb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSBdLCAoIHRhaWxQb3NpdGlvbiwgdGlwUG9zaXRpb24sIG1vZGVsVmlld1RyYW5zZm9ybSApID0+IHtcclxuXHJcbiAgICAgIC8vIE9ubHkgZGlzcGxheSB0aGUgVmVjdG9yIGFuZCBpdHMgbGFiZWwgaWYgdGhlIG1vbWVudGFEaWFncmFtVmVjdG9yIGhhcyBhIG1hZ25pdHVkZSB0aGF0IGlzbid0IGVmZmVjdGl2ZWx5IDAuXHJcbiAgICAgIGFycm93Tm9kZS52aXNpYmxlID0gKCBtb21lbnRhRGlhZ3JhbVZlY3Rvci5tYWduaXR1ZGUgPiBDb2xsaXNpb25MYWJDb25zdGFudHMuWkVST19USFJFU0hPTEQgKTtcclxuICAgICAgbGFiZWxOb2RlLnZpc2libGUgPSBhcnJvd05vZGUudmlzaWJsZTtcclxuICAgICAgaWYgKCAhYXJyb3dOb2RlLnZpc2libGUgKSB7IC8qKiBleGl0ICoqL1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gR2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgdGFpbCwgY2VudGVyLCBhbmQgdGlwIGluIHZpZXcgY29vcmRpbmF0ZXMuXHJcbiAgICAgIGNvbnN0IHRhaWxWaWV3UG9zaXRpb24gPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggdGFpbFBvc2l0aW9uICk7XHJcbiAgICAgIGNvbnN0IHRpcFZpZXdQb3NpdGlvbiA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCB0aXBQb3NpdGlvbiApO1xyXG4gICAgICBjb25zdCBjZW50ZXJWaWV3UG9zaXRpb24gPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggbW9tZW50YURpYWdyYW1WZWN0b3IuY2VudGVyICk7XHJcblxyXG4gICAgICAvLyBVcGRhdGUgdGhlIHBvc2l0aW9uaW5nIG9mIHRoZSBBcnJvd05vZGUgdG8gbWF0Y2ggdGhlIE1vbWVudGFEaWFncmFtVmVjdG9yLlxyXG4gICAgICBhcnJvd05vZGUuc2V0VGFpbEFuZFRpcCggdGFpbFZpZXdQb3NpdGlvbi54LCB0YWlsVmlld1Bvc2l0aW9uLnksIHRpcFZpZXdQb3NpdGlvbi54LCB0aXBWaWV3UG9zaXRpb24ueSApO1xyXG5cclxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAvLyBDb21wdXRlIHRoZSBhZGp1c3RlZCBvZmZzZXQgb2YgdGhlIGxhYmVsIGluIHZpZXcgY29vcmRpbmF0ZXMuIEl0IGFkZHMgZXh0cmEgb2Zmc2V0IHRvIGNvbnNpZGVyIHRoZSBzaXplXHJcbiAgICAgIC8vIG9mIHRoZSBsYWJlbC5cclxuICAgICAgY29uc3QgYWRqdXN0ZWRPZmZzZXQgPSBvcHRpb25zLmxhYmVsQXJyb3dNYXJnaW4gKyBNYXRoLm1heCggbGFiZWxOb2RlLmhlaWdodCwgbGFiZWxOb2RlLndpZHRoICkgLyAyO1xyXG5cclxuICAgICAgLy8gUG9zaXRpb24gdGhlIExhYmVsLCB3aGljaCBkZXBlbmRzIG9uIHRoZSBkaW1lbnNpb24gYW5kIHdoZXRoZXIgb3Igbm90IHRoaXMgdGhlIHRvdGFsIG1vbWVudGEgVmVjdG9yLlxyXG4gICAgICBpZiAoIG9wdGlvbnMuZGltZW5zaW9uID09PSBQbGF5QXJlYS5EaW1lbnNpb24uVFdPICkge1xyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgaG93IHRoZSBsYWJlbCBzaG91bGQgYmUgcG9zaXRpb25lZCBiYXNlZCBvbiB0aGUgdHlwZSBvZiBNb21lbnRhIFZlY3RvciBhbmQgd2hhdCBxdWFkcmFudCBpdCdzIGluLlxyXG4gICAgICAgIGNvbnN0IHlGbGlwID0gKCBtb21lbnRhRGlhZ3JhbVZlY3Rvci5jb21wb25lbnRzUHJvcGVydHkudmFsdWUueSA8IDAgKSA/IE1hdGguUEkgOiAwO1xyXG4gICAgICAgIGNvbnN0IG9mZnNldEFuZ2xlQWRqdXN0bWVudCA9IHlGbGlwICsgKCBvcHRpb25zLmlzVG90YWxNb21lbnRhVmVjdG9yID8gTWF0aC5QSSAvIDIgOiAtTWF0aC5QSSAvIDIgKTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGFuIG9mZnNldCB0aGF0IGlzIHBlcnBlbmRpY3VsYXIgdG8gdGhlIHZlY3Rvci4gVGhlIGFuZ2xlIGlzIG5lZ2F0aXZlIHNpbmNlIHRoZSB5LWF4aXMgaXMgaW52ZXJ0ZWQuXHJcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gVmVjdG9yMi5jcmVhdGVQb2xhciggYWRqdXN0ZWRPZmZzZXQsIC0oIG1vbWVudGFEaWFncmFtVmVjdG9yLmFuZ2xlICsgb2Zmc2V0QW5nbGVBZGp1c3RtZW50ICkgKTtcclxuXHJcbiAgICAgICAgLy8gUG9zaXRpb24gdGhlIGxhYmVsLlxyXG4gICAgICAgIGxhYmVsTm9kZS5jZW50ZXIgPSBjZW50ZXJWaWV3UG9zaXRpb24ucGx1cyggb2Zmc2V0ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIG9wdGlvbnMuaXNUb3RhbE1vbWVudGFWZWN0b3IgKSB7XHJcblxyXG4gICAgICAgIC8vIFBvc2l0aW9uIHRoZSBsYWJlbCBiZWxvdyB0aGUgTW9tZW50YSBWZWN0b3IuXHJcbiAgICAgICAgbGFiZWxOb2RlLmNlbnRlclRvcCA9IGNlbnRlclZpZXdQb3NpdGlvbi5wbHVzWFkoIDAsIGFkanVzdGVkT2Zmc2V0ICogMC41ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIFBvc2l0aW9uIHRoZSBsYWJlbCB3aGljaCBkZXBlbmRzIG9uIHRoZSBzaWduIG9mIHRoZSB4LWNvbXBvbmVudCBvZiB0aGUgTW9tZW50YSBWZWN0b3IuXHJcbiAgICAgICAgbGFiZWxOb2RlLmNlbnRlciA9IHRpcFZpZXdQb3NpdGlvbi5wbHVzWFkoIE1hdGguc2lnbiggbW9tZW50YURpYWdyYW1WZWN0b3IuY29tcG9uZW50c1Byb3BlcnR5LnZhbHVlLnggKSAqIGFkanVzdGVkT2Zmc2V0LCAwICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbGxpc2lvbkxhYi5yZWdpc3RlciggJ01vbWVudGFEaWFncmFtVmVjdG9yTm9kZScsIE1vbWVudGFEaWFncmFtVmVjdG9yTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBNb21lbnRhRGlhZ3JhbVZlY3Rvck5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSwwQ0FBMEM7QUFDbEUsT0FBT0MsbUJBQW1CLE1BQU0sdURBQXVEO0FBQ3ZGLE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDOUQsT0FBT0MsWUFBWSxNQUFNLHVCQUF1QjtBQUNoRCxPQUFPQyxrQkFBa0IsTUFBTSwwQkFBMEI7QUFDekQsT0FBT0MscUJBQXFCLE1BQU0s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