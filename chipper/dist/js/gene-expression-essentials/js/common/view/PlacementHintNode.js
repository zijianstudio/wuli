// Copyright 2015-2022, University of Colorado Boulder

/**
 * Class for displaying placement hints, which let the user know where various things (e.g. biomolecules) can and should
 * be placed.
 *
 * @author Sharfudeen Ashraf
 * @author John Blanco
 * @author Aadish Gupta
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { Color, Node, Path } from '../../../../scenery/js/imports.js';
import geneExpressionEssentials from '../../geneExpressionEssentials.js';

// constants
const HINT_STROKE_COLOR = new Color(0, 0, 0, 100); // Somewhat transparent stroke.
const HINT_STROKE = {
  lineJoin: 'bevel',
  lineDash: [5, 5],
  stroke: HINT_STROKE_COLOR
};
class PlacementHintNode extends Node {
  /**
   * @param {ModelViewTransform2} modelViewTransform
   * @param {PlacementHint} placementHint
   */
  constructor(modelViewTransform, placementHint) {
    super();

    // Create a transparent color based on the base color of the molecule.
    const transparentColor = new Color(placementHint.getBaseColor().getRed(), placementHint.getBaseColor().getGreen(), placementHint.getBaseColor().getBlue(), 0.4);

    // create a transform that will be used to scale but not translate the placement hint's shape
    const scaleOnlyTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(Vector2.ZERO, Vector2.ZERO, modelViewTransform.getMatrix().getScaleVector().x);
    const pathStyleOptions = merge(HINT_STROKE, {
      lineWidth: 2,
      lineDash: [5, 5],
      fill: transparentColor,
      boundsMethod: 'unstroked'
    });
    const path = new Path(new Shape(), pathStyleOptions);
    this.addChild(path);
    const handlePositionChanged = position => {
      this.setTranslation(modelViewTransform.modelToViewPosition(position));
    };
    placementHint.positionProperty.link(handlePositionChanged);
    function handleShapeChanged(shape) {
      path.setShape(scaleOnlyTransform.modelToViewShape(shape));
    }

    // Update the shape whenever it changes.
    placementHint.shapeProperty.link(handleShapeChanged);
    function handleActiveChanged(hintActive) {
      path.visible = hintActive;
    }

    // Listen to the property that indicates whether the hint is active and only be visible when it is.
    placementHint.activeProperty.link(handleActiveChanged);
    this.disposePlacementHintNode = () => {
      placementHint.positionProperty.unlink(handlePositionChanged);
      placementHint.shapeProperty.unlink(handleShapeChanged);
      placementHint.activeProperty.unlink(handleActiveChanged);
    };
  }

  /**
   * @private
   */
  dispose() {
    this.disposePlacementHintNode();
    super.dispose();
  }
}
geneExpressionEssentials.register('PlacementHintNode', PlacementHintNode);
export default PlacementHintNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU2hhcGUiLCJtZXJnZSIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJDb2xvciIsIk5vZGUiLCJQYXRoIiwiZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIiwiSElOVF9TVFJPS0VfQ09MT1IiLCJISU5UX1NUUk9LRSIsImxpbmVKb2luIiwibGluZURhc2giLCJzdHJva2UiLCJQbGFjZW1lbnRIaW50Tm9kZSIsImNvbnN0cnVjdG9yIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwicGxhY2VtZW50SGludCIsInRyYW5zcGFyZW50Q29sb3IiLCJnZXRCYXNlQ29sb3IiLCJnZXRSZWQiLCJnZXRHcmVlbiIsImdldEJsdWUiLCJzY2FsZU9ubHlUcmFuc2Zvcm0iLCJjcmVhdGVTaW5nbGVQb2ludFNjYWxlSW52ZXJ0ZWRZTWFwcGluZyIsIlpFUk8iLCJnZXRNYXRyaXgiLCJnZXRTY2FsZVZlY3RvciIsIngiLCJwYXRoU3R5bGVPcHRpb25zIiwibGluZVdpZHRoIiwiZmlsbCIsImJvdW5kc01ldGhvZCIsInBhdGgiLCJhZGRDaGlsZCIsImhhbmRsZVBvc2l0aW9uQ2hhbmdlZCIsInBvc2l0aW9uIiwic2V0VHJhbnNsYXRpb24iLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsImxpbmsiLCJoYW5kbGVTaGFwZUNoYW5nZWQiLCJzaGFwZSIsInNldFNoYXBlIiwibW9kZWxUb1ZpZXdTaGFwZSIsInNoYXBlUHJvcGVydHkiLCJoYW5kbGVBY3RpdmVDaGFuZ2VkIiwiaGludEFjdGl2ZSIsInZpc2libGUiLCJhY3RpdmVQcm9wZXJ0eSIsImRpc3Bvc2VQbGFjZW1lbnRIaW50Tm9kZSIsInVubGluayIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBsYWNlbWVudEhpbnROb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENsYXNzIGZvciBkaXNwbGF5aW5nIHBsYWNlbWVudCBoaW50cywgd2hpY2ggbGV0IHRoZSB1c2VyIGtub3cgd2hlcmUgdmFyaW91cyB0aGluZ3MgKGUuZy4gYmlvbW9sZWN1bGVzKSBjYW4gYW5kIHNob3VsZFxyXG4gKiBiZSBwbGFjZWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2hhcmZ1ZGVlbiBBc2hyYWZcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIEFhZGlzaCBHdXB0YVxyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgTm9kZSwgUGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMgZnJvbSAnLi4vLi4vZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBISU5UX1NUUk9LRV9DT0xPUiA9IG5ldyBDb2xvciggMCwgMCwgMCwgMTAwICk7IC8vIFNvbWV3aGF0IHRyYW5zcGFyZW50IHN0cm9rZS5cclxuY29uc3QgSElOVF9TVFJPS0UgPSB7IGxpbmVKb2luOiAnYmV2ZWwnLCBsaW5lRGFzaDogWyA1LCA1IF0sIHN0cm9rZTogSElOVF9TVFJPS0VfQ09MT1IgfTtcclxuXHJcbmNsYXNzIFBsYWNlbWVudEhpbnROb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICogQHBhcmFtIHtQbGFjZW1lbnRIaW50fSBwbGFjZW1lbnRIaW50XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsVmlld1RyYW5zZm9ybSwgcGxhY2VtZW50SGludCApIHtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIHRyYW5zcGFyZW50IGNvbG9yIGJhc2VkIG9uIHRoZSBiYXNlIGNvbG9yIG9mIHRoZSBtb2xlY3VsZS5cclxuICAgIGNvbnN0IHRyYW5zcGFyZW50Q29sb3IgPSBuZXcgQ29sb3IoXHJcbiAgICAgIHBsYWNlbWVudEhpbnQuZ2V0QmFzZUNvbG9yKCkuZ2V0UmVkKCksXHJcbiAgICAgIHBsYWNlbWVudEhpbnQuZ2V0QmFzZUNvbG9yKCkuZ2V0R3JlZW4oKSxcclxuICAgICAgcGxhY2VtZW50SGludC5nZXRCYXNlQ29sb3IoKS5nZXRCbHVlKCksXHJcbiAgICAgIDAuNFxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYSB0cmFuc2Zvcm0gdGhhdCB3aWxsIGJlIHVzZWQgdG8gc2NhbGUgYnV0IG5vdCB0cmFuc2xhdGUgdGhlIHBsYWNlbWVudCBoaW50J3Mgc2hhcGVcclxuICAgIGNvbnN0IHNjYWxlT25seVRyYW5zZm9ybSA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmcoXHJcbiAgICAgIFZlY3RvcjIuWkVSTyxcclxuICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0uZ2V0TWF0cml4KCkuZ2V0U2NhbGVWZWN0b3IoKS54XHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHBhdGhTdHlsZU9wdGlvbnMgPSBtZXJnZSggSElOVF9TVFJPS0UsIHtcclxuICAgICAgbGluZVdpZHRoOiAyLFxyXG4gICAgICBsaW5lRGFzaDogWyA1LCA1IF0sXHJcbiAgICAgIGZpbGw6IHRyYW5zcGFyZW50Q29sb3IsXHJcbiAgICAgIGJvdW5kc01ldGhvZDogJ3Vuc3Ryb2tlZCdcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBwYXRoID0gbmV3IFBhdGgoIG5ldyBTaGFwZSgpLCBwYXRoU3R5bGVPcHRpb25zICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBwYXRoICk7XHJcblxyXG4gICAgY29uc3QgaGFuZGxlUG9zaXRpb25DaGFuZ2VkID0gcG9zaXRpb24gPT4ge1xyXG4gICAgICB0aGlzLnNldFRyYW5zbGF0aW9uKCBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggcG9zaXRpb24gKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBwbGFjZW1lbnRIaW50LnBvc2l0aW9uUHJvcGVydHkubGluayggaGFuZGxlUG9zaXRpb25DaGFuZ2VkICk7XHJcblxyXG4gICAgZnVuY3Rpb24gaGFuZGxlU2hhcGVDaGFuZ2VkKCBzaGFwZSApIHtcclxuICAgICAgcGF0aC5zZXRTaGFwZSggc2NhbGVPbmx5VHJhbnNmb3JtLm1vZGVsVG9WaWV3U2hhcGUoIHNoYXBlICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIHNoYXBlIHdoZW5ldmVyIGl0IGNoYW5nZXMuXHJcbiAgICBwbGFjZW1lbnRIaW50LnNoYXBlUHJvcGVydHkubGluayggaGFuZGxlU2hhcGVDaGFuZ2VkICk7XHJcblxyXG4gICAgZnVuY3Rpb24gaGFuZGxlQWN0aXZlQ2hhbmdlZCggaGludEFjdGl2ZSApIHtcclxuICAgICAgcGF0aC52aXNpYmxlID0gaGludEFjdGl2ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMaXN0ZW4gdG8gdGhlIHByb3BlcnR5IHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgdGhlIGhpbnQgaXMgYWN0aXZlIGFuZCBvbmx5IGJlIHZpc2libGUgd2hlbiBpdCBpcy5cclxuICAgIHBsYWNlbWVudEhpbnQuYWN0aXZlUHJvcGVydHkubGluayggaGFuZGxlQWN0aXZlQ2hhbmdlZCApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZVBsYWNlbWVudEhpbnROb2RlID0gKCkgPT4ge1xyXG4gICAgICBwbGFjZW1lbnRIaW50LnBvc2l0aW9uUHJvcGVydHkudW5saW5rKCBoYW5kbGVQb3NpdGlvbkNoYW5nZWQgKTtcclxuICAgICAgcGxhY2VtZW50SGludC5zaGFwZVByb3BlcnR5LnVubGluayggaGFuZGxlU2hhcGVDaGFuZ2VkICk7XHJcbiAgICAgIHBsYWNlbWVudEhpbnQuYWN0aXZlUHJvcGVydHkudW5saW5rKCBoYW5kbGVBY3RpdmVDaGFuZ2VkICk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5kaXNwb3NlUGxhY2VtZW50SGludE5vZGUoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmdlbmVFeHByZXNzaW9uRXNzZW50aWFscy5yZWdpc3RlciggJ1BsYWNlbWVudEhpbnROb2RlJywgUGxhY2VtZW50SGludE5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBsYWNlbWVudEhpbnROb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxtQkFBbUIsTUFBTSx1REFBdUQ7QUFDdkYsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDckUsT0FBT0Msd0JBQXdCLE1BQU0sbUNBQW1DOztBQUV4RTtBQUNBLE1BQU1DLGlCQUFpQixHQUFHLElBQUlKLEtBQUssQ0FBRSxDQUFDLEVB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