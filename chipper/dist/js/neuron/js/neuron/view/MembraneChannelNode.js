// Copyright 2014-2022, University of Colorado Boulder
/**
 * Node that represents a membrane channel in the view, currently used only for drawing Membrane channel legends
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Circle, Color, Node, Path } from '../../../../scenery/js/imports.js';
import neuron from '../../neuron.js';
class MembraneChannelNode extends Node {
  /**
   * @param {MembraneChannel} membraneChannelModel
   * @param {ModelViewTransform2D} mvt
   */
  constructor(membraneChannelModel, mvt) {
    super({});
    this.membraneChannelModel = membraneChannelModel;
    this.mvt = mvt;

    /**
     *  @private
     *  @param {Dimension2D} size
     *  @param {Color} color
     */
    function createEdgeNode(size, color) {
      const shape = new Shape();
      const width = size.width;
      const height = size.height;
      shape.moveTo(-width / 2, height / 4);
      shape.cubicCurveTo(-width / 2, height / 2, width / 2, height / 2, width / 2, height / 4);
      shape.lineTo(width / 2, -height / 4);
      shape.cubicCurveTo(width / 2, -height / 2, -width / 2, -height / 2, -width / 2, -height / 4);
      shape.close();
      return new Path(shape, {
        fill: color,
        stroke: color.colorUtilsDarker(0.3),
        lineWidth: 0.4
      });
    }
    let stringShape;
    let channelPath;

    // Create the channel representation.
    const channel = new Path(new Shape(), {
      fill: membraneChannelModel.getChannelColor(),
      lineWidth: 0
    });

    // Skip bounds computation to improve performance
    channel.computeShapeBounds = () => new Bounds2(0, 0, 0, 0);

    // Create the edge representations.
    const edgeNodeWidth = (membraneChannelModel.overallSize.width - membraneChannelModel.channelSize.width) / 2;
    const edgeNodeHeight = membraneChannelModel.overallSize.height;
    const transformedEdgeNodeSize = new Dimension2(Math.abs(mvt.modelToViewDeltaX(edgeNodeWidth)), Math.abs(mvt.modelToViewDeltaY(edgeNodeHeight)));
    const leftEdgeNode = createEdgeNode(transformedEdgeNodeSize, membraneChannelModel.getEdgeColor());
    const rightEdgeNode = createEdgeNode(transformedEdgeNodeSize, membraneChannelModel.getEdgeColor());

    // Create the layers for the channel the edges.  This makes offsets and rotations easier.  See addToCanvas on why
    // node layer is an instance member.
    this.channelLayer = new Node();
    this.addChild(this.channelLayer);
    this.channelLayer.addChild(channel);
    this.edgeLayer = new Node();
    this.addChild(this.edgeLayer);
    this.edgeLayer.addChild(leftEdgeNode);
    this.edgeLayer.addChild(rightEdgeNode);

    // gets created and updated only if channel has InactivationGate
    let inactivationGateBallNode;
    let inactivationGateString;
    const edgeColor = membraneChannelModel.getEdgeColor().colorUtilsDarker(0.3);
    if (membraneChannelModel.getHasInactivationGate()) {
      // Add the ball and string that make up the inactivation gate.
      inactivationGateString = new Path(new Shape(), {
        lineWidth: 0.5,
        stroke: Color.BLACK
      });

      // Skip bounds computation to improve performance
      inactivationGateString.computeShapeBounds = () => new Bounds2(0, 0, 0, 0);
      this.channelLayer.addChild(inactivationGateString);
      const ballDiameter = mvt.modelToViewDeltaX(membraneChannelModel.getChannelSize().width);

      // inactivationBallShape is always a circle, so use the optimized version.
      inactivationGateBallNode = new Circle(ballDiameter / 2, {
        fill: edgeColor,
        lineWidth: 0.5,
        stroke: edgeColor
      });
      this.edgeLayer.addChild(inactivationGateBallNode);
    }

    //private
    function updateRepresentation() {
      // Set the channel width as a function of the openness of the membrane channel.
      const channelWidth = membraneChannelModel.getChannelSize().width * membraneChannelModel.getOpenness();
      const channelSize = new Dimension2(channelWidth, membraneChannelModel.getChannelSize().height);
      const transformedChannelSize = new Dimension2(Math.abs(mvt.modelToViewDeltaX(channelSize.width)), Math.abs(mvt.modelToViewDeltaY(channelSize.height)));

      // Make the node a bit bigger than the channel so that the edges can be placed over it with no gaps.
      const oversizeFactor = 1.2; // was 1.1 in Java

      const width = transformedChannelSize.width * oversizeFactor;
      const height = transformedChannelSize.height * oversizeFactor;
      const edgeNodeBounds = leftEdgeNode.getBounds();
      const edgeWidth = edgeNodeBounds.width; // Assume both edges are the same size.

      channelPath = new Shape();
      channelPath.moveTo(0, 0);
      channelPath.quadraticCurveTo((width + edgeWidth) / 2, height / 8, width + edgeWidth, 0);
      channelPath.lineTo(width + edgeWidth, height);
      channelPath.quadraticCurveTo((width + edgeWidth) / 2, height * 7 / 8, 0, height);
      channelPath.close();
      channel.setShape(channelPath);

      /*
       The Java Version uses computed bounds which is a bit expensive, the current x and y coordinates of the channel
       is manually calculated. This allows for providing a customized computedBounds function.
       Kept this code for reference. Ashraf
       var channelBounds = channel.getBounds();
       channel.x = -channelBounds.width / 2;
       channel.y = -channelBounds.height / 2;
       */

      channel.x = -(width + edgeWidth) / 2;
      channel.y = -height / 2;
      leftEdgeNode.x = -transformedChannelSize.width / 2 - edgeNodeBounds.width / 2;
      leftEdgeNode.y = 0;
      rightEdgeNode.x = transformedChannelSize.width / 2 + edgeNodeBounds.width / 2;
      rightEdgeNode.y = 0;

      // If this membrane channel has an inactivation gate, update it.
      if (membraneChannelModel.getHasInactivationGate()) {
        const transformedOverallSize = new Dimension2(mvt.modelToViewDeltaX(membraneChannelModel.getOverallSize().width), mvt.modelToViewDeltaY(membraneChannelModel.getOverallSize().height));

        // Position the ball portion of the inactivation gate.
        const channelEdgeConnectionPoint = new Vector2(leftEdgeNode.centerX, leftEdgeNode.getBounds().getMaxY());
        const channelCenterBottomPoint = new Vector2(0, transformedChannelSize.height / 2);
        const angle = -Math.PI / 2 * (1 - membraneChannelModel.getInactivationAmount());
        const radius = (1 - membraneChannelModel.getInactivationAmount()) * transformedOverallSize.width / 2 + membraneChannelModel.getInactivationAmount() * channelEdgeConnectionPoint.distance(channelCenterBottomPoint);
        const ballPosition = new Vector2(channelEdgeConnectionPoint.x + Math.cos(angle) * radius, channelEdgeConnectionPoint.y - Math.sin(angle) * radius);
        inactivationGateBallNode.x = ballPosition.x;
        inactivationGateBallNode.y = ballPosition.y;

        // Redraw the "string" (actually a strand of protein in real life)
        // that connects the ball to the gate.
        const ballConnectionPoint = new Vector2(inactivationGateBallNode.x, inactivationGateBallNode.y);
        const connectorLength = channelCenterBottomPoint.distance(ballConnectionPoint);
        stringShape = new Shape().moveTo(channelEdgeConnectionPoint.x, channelEdgeConnectionPoint.y).cubicCurveTo(channelEdgeConnectionPoint.x + connectorLength * 0.25, channelEdgeConnectionPoint.y + connectorLength * 0.5, ballConnectionPoint.x - connectorLength * 0.75, ballConnectionPoint.y - connectorLength * 0.5, ballConnectionPoint.x, ballConnectionPoint.y);
        inactivationGateString.setShape(stringShape);
      }
    }
    const updatePosition = () => {
      this.channelLayer.translate(mvt.modelToViewPosition(membraneChannelModel.getCenterPosition()));
      this.edgeLayer.translate(mvt.modelToViewPosition(membraneChannelModel.getCenterPosition()));
    };
    const updateRotation = () => {
      // Rotate based on the model element's orientation (the Java Version rotates and then translates, here the
      // transformation order is reversed - Ashraf).
      this.channelLayer.setRotation(-membraneChannelModel.rotationalAngle + Math.PI / 2);
      this.edgeLayer.setRotation(-membraneChannelModel.rotationalAngle + Math.PI / 2);
    };

    // Update the representation and position.
    updateRepresentation();
    updatePosition();
    updateRotation();
  }

  /**
   * Add this node to the two specified parent nodes.  This is done in order to achieve a better layering effect that
   * allows particles to look more like they are moving through the channel.  It is not absolutely necessary to use
   * this method for this node - it can be added to the canvas like any other PNode, it just won't have the layering.
   * @public
   */
  addToCanvas(channelLayer, edgeLayer) {
    channelLayer.addChild(this.channelLayer);
    edgeLayer.addChild(this.edgeLayer); //Membrane channel maintains its own layer of 2 edge nodes
  }

  // @public
  removeFromCanvas(channelLayer, edgeLayer) {
    channelLayer.removeChild(this.channelLayer);
    edgeLayer.removeChild(this.edgeLayer);
  }
}
neuron.register('MembraneChannelNode', MembraneChannelNode);
export default MembraneChannelNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiRGltZW5zaW9uMiIsIlZlY3RvcjIiLCJTaGFwZSIsIkNpcmNsZSIsIkNvbG9yIiwiTm9kZSIsIlBhdGgiLCJuZXVyb24iLCJNZW1icmFuZUNoYW5uZWxOb2RlIiwiY29uc3RydWN0b3IiLCJtZW1icmFuZUNoYW5uZWxNb2RlbCIsIm12dCIsImNyZWF0ZUVkZ2VOb2RlIiwic2l6ZSIsImNvbG9yIiwic2hhcGUiLCJ3aWR0aCIsImhlaWdodCIsIm1vdmVUbyIsImN1YmljQ3VydmVUbyIsImxpbmVUbyIsImNsb3NlIiwiZmlsbCIsInN0cm9rZSIsImNvbG9yVXRpbHNEYXJrZXIiLCJsaW5lV2lkdGgiLCJzdHJpbmdTaGFwZSIsImNoYW5uZWxQYXRoIiwiY2hhbm5lbCIsImdldENoYW5uZWxDb2xvciIsImNvbXB1dGVTaGFwZUJvdW5kcyIsImVkZ2VOb2RlV2lkdGgiLCJvdmVyYWxsU2l6ZSIsImNoYW5uZWxTaXplIiwiZWRnZU5vZGVIZWlnaHQiLCJ0cmFuc2Zvcm1lZEVkZ2VOb2RlU2l6ZSIsIk1hdGgiLCJhYnMiLCJtb2RlbFRvVmlld0RlbHRhWCIsIm1vZGVsVG9WaWV3RGVsdGFZIiwibGVmdEVkZ2VOb2RlIiwiZ2V0RWRnZUNvbG9yIiwicmlnaHRFZGdlTm9kZSIsImNoYW5uZWxMYXllciIsImFkZENoaWxkIiwiZWRnZUxheWVyIiwiaW5hY3RpdmF0aW9uR2F0ZUJhbGxOb2RlIiwiaW5hY3RpdmF0aW9uR2F0ZVN0cmluZyIsImVkZ2VDb2xvciIsImdldEhhc0luYWN0aXZhdGlvbkdhdGUiLCJCTEFDSyIsImJhbGxEaWFtZXRlciIsImdldENoYW5uZWxTaXplIiwidXBkYXRlUmVwcmVzZW50YXRpb24iLCJjaGFubmVsV2lkdGgiLCJnZXRPcGVubmVzcyIsInRyYW5zZm9ybWVkQ2hhbm5lbFNpemUiLCJvdmVyc2l6ZUZhY3RvciIsImVkZ2VOb2RlQm91bmRzIiwiZ2V0Qm91bmRzIiwiZWRnZVdpZHRoIiwicXVhZHJhdGljQ3VydmVUbyIsInNldFNoYXBlIiwieCIsInkiLCJ0cmFuc2Zvcm1lZE92ZXJhbGxTaXplIiwiZ2V0T3ZlcmFsbFNpemUiLCJjaGFubmVsRWRnZUNvbm5lY3Rpb25Qb2ludCIsImNlbnRlclgiLCJnZXRNYXhZIiwiY2hhbm5lbENlbnRlckJvdHRvbVBvaW50IiwiYW5nbGUiLCJQSSIsImdldEluYWN0aXZhdGlvbkFtb3VudCIsInJhZGl1cyIsImRpc3RhbmNlIiwiYmFsbFBvc2l0aW9uIiwiY29zIiwic2luIiwiYmFsbENvbm5lY3Rpb25Qb2ludCIsImNvbm5lY3Rvckxlbmd0aCIsInVwZGF0ZVBvc2l0aW9uIiwidHJhbnNsYXRlIiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsImdldENlbnRlclBvc2l0aW9uIiwidXBkYXRlUm90YXRpb24iLCJzZXRSb3RhdGlvbiIsInJvdGF0aW9uYWxBbmdsZSIsImFkZFRvQ2FudmFzIiwicmVtb3ZlRnJvbUNhbnZhcyIsInJlbW92ZUNoaWxkIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNZW1icmFuZUNoYW5uZWxOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vKipcclxuICogTm9kZSB0aGF0IHJlcHJlc2VudHMgYSBtZW1icmFuZSBjaGFubmVsIGluIHRoZSB2aWV3LCBjdXJyZW50bHkgdXNlZCBvbmx5IGZvciBkcmF3aW5nIE1lbWJyYW5lIGNoYW5uZWwgbGVnZW5kc1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgU2hhcmZ1ZGVlbiBBc2hyYWYgKGZvciBHaGVudCBVbml2ZXJzaXR5KVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBDb2xvciwgTm9kZSwgUGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBuZXVyb24gZnJvbSAnLi4vLi4vbmV1cm9uLmpzJztcclxuXHJcbmNsYXNzIE1lbWJyYW5lQ2hhbm5lbE5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNZW1icmFuZUNoYW5uZWx9IG1lbWJyYW5lQ2hhbm5lbE1vZGVsXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yRH0gbXZ0XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1lbWJyYW5lQ2hhbm5lbE1vZGVsLCBtdnQgKSB7XHJcbiAgICBzdXBlcigge30gKTtcclxuICAgIHRoaXMubWVtYnJhbmVDaGFubmVsTW9kZWwgPSBtZW1icmFuZUNoYW5uZWxNb2RlbDtcclxuICAgIHRoaXMubXZ0ID0gbXZ0O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogIEBwcml2YXRlXHJcbiAgICAgKiAgQHBhcmFtIHtEaW1lbnNpb24yRH0gc2l6ZVxyXG4gICAgICogIEBwYXJhbSB7Q29sb3J9IGNvbG9yXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUVkZ2VOb2RlKCBzaXplLCBjb2xvciApIHtcclxuICAgICAgY29uc3Qgc2hhcGUgPSBuZXcgU2hhcGUoKTtcclxuICAgICAgY29uc3Qgd2lkdGggPSBzaXplLndpZHRoO1xyXG4gICAgICBjb25zdCBoZWlnaHQgPSBzaXplLmhlaWdodDtcclxuXHJcbiAgICAgIHNoYXBlLm1vdmVUbyggLXdpZHRoIC8gMiwgaGVpZ2h0IC8gNCApO1xyXG4gICAgICBzaGFwZS5jdWJpY0N1cnZlVG8oIC13aWR0aCAvIDIsIGhlaWdodCAvIDIsIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMiwgd2lkdGggLyAyLCBoZWlnaHQgLyA0ICk7XHJcbiAgICAgIHNoYXBlLmxpbmVUbyggd2lkdGggLyAyLCAtaGVpZ2h0IC8gNCApO1xyXG4gICAgICBzaGFwZS5jdWJpY0N1cnZlVG8oIHdpZHRoIC8gMiwgLWhlaWdodCAvIDIsIC13aWR0aCAvIDIsIC1oZWlnaHQgLyAyLCAtd2lkdGggLyAyLCAtaGVpZ2h0IC8gNCApO1xyXG4gICAgICBzaGFwZS5jbG9zZSgpO1xyXG5cclxuICAgICAgcmV0dXJuIG5ldyBQYXRoKCBzaGFwZSwgeyBmaWxsOiBjb2xvciwgc3Ryb2tlOiBjb2xvci5jb2xvclV0aWxzRGFya2VyKCAwLjMgKSwgbGluZVdpZHRoOiAwLjQgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBzdHJpbmdTaGFwZTtcclxuICAgIGxldCBjaGFubmVsUGF0aDtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGNoYW5uZWwgcmVwcmVzZW50YXRpb24uXHJcbiAgICBjb25zdCBjaGFubmVsID0gbmV3IFBhdGgoIG5ldyBTaGFwZSgpLCB7IGZpbGw6IG1lbWJyYW5lQ2hhbm5lbE1vZGVsLmdldENoYW5uZWxDb2xvcigpLCBsaW5lV2lkdGg6IDAgfSApO1xyXG5cclxuICAgIC8vIFNraXAgYm91bmRzIGNvbXB1dGF0aW9uIHRvIGltcHJvdmUgcGVyZm9ybWFuY2VcclxuICAgIGNoYW5uZWwuY29tcHV0ZVNoYXBlQm91bmRzID0gKCkgPT4gbmV3IEJvdW5kczIoIDAsIDAsIDAsIDAgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGVkZ2UgcmVwcmVzZW50YXRpb25zLlxyXG4gICAgY29uc3QgZWRnZU5vZGVXaWR0aCA9ICggbWVtYnJhbmVDaGFubmVsTW9kZWwub3ZlcmFsbFNpemUud2lkdGggLSBtZW1icmFuZUNoYW5uZWxNb2RlbC5jaGFubmVsU2l6ZS53aWR0aCApIC8gMjtcclxuICAgIGNvbnN0IGVkZ2VOb2RlSGVpZ2h0ID0gbWVtYnJhbmVDaGFubmVsTW9kZWwub3ZlcmFsbFNpemUuaGVpZ2h0O1xyXG4gICAgY29uc3QgdHJhbnNmb3JtZWRFZGdlTm9kZVNpemUgPSBuZXcgRGltZW5zaW9uMiggTWF0aC5hYnMoIG12dC5tb2RlbFRvVmlld0RlbHRhWCggZWRnZU5vZGVXaWR0aCApICksIE1hdGguYWJzKCBtdnQubW9kZWxUb1ZpZXdEZWx0YVkoIGVkZ2VOb2RlSGVpZ2h0ICkgKSApO1xyXG4gICAgY29uc3QgbGVmdEVkZ2VOb2RlID0gY3JlYXRlRWRnZU5vZGUoIHRyYW5zZm9ybWVkRWRnZU5vZGVTaXplLCBtZW1icmFuZUNoYW5uZWxNb2RlbC5nZXRFZGdlQ29sb3IoKSApO1xyXG4gICAgY29uc3QgcmlnaHRFZGdlTm9kZSA9IGNyZWF0ZUVkZ2VOb2RlKCB0cmFuc2Zvcm1lZEVkZ2VOb2RlU2l6ZSwgbWVtYnJhbmVDaGFubmVsTW9kZWwuZ2V0RWRnZUNvbG9yKCkgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGxheWVycyBmb3IgdGhlIGNoYW5uZWwgdGhlIGVkZ2VzLiAgVGhpcyBtYWtlcyBvZmZzZXRzIGFuZCByb3RhdGlvbnMgZWFzaWVyLiAgU2VlIGFkZFRvQ2FudmFzIG9uIHdoeVxyXG4gICAgLy8gbm9kZSBsYXllciBpcyBhbiBpbnN0YW5jZSBtZW1iZXIuXHJcbiAgICB0aGlzLmNoYW5uZWxMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmNoYW5uZWxMYXllciApO1xyXG4gICAgdGhpcy5jaGFubmVsTGF5ZXIuYWRkQ2hpbGQoIGNoYW5uZWwgKTtcclxuICAgIHRoaXMuZWRnZUxheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuZWRnZUxheWVyICk7XHJcbiAgICB0aGlzLmVkZ2VMYXllci5hZGRDaGlsZCggbGVmdEVkZ2VOb2RlICk7XHJcbiAgICB0aGlzLmVkZ2VMYXllci5hZGRDaGlsZCggcmlnaHRFZGdlTm9kZSApO1xyXG5cclxuICAgIC8vIGdldHMgY3JlYXRlZCBhbmQgdXBkYXRlZCBvbmx5IGlmIGNoYW5uZWwgaGFzIEluYWN0aXZhdGlvbkdhdGVcclxuICAgIGxldCBpbmFjdGl2YXRpb25HYXRlQmFsbE5vZGU7XHJcbiAgICBsZXQgaW5hY3RpdmF0aW9uR2F0ZVN0cmluZztcclxuICAgIGNvbnN0IGVkZ2VDb2xvciA9IG1lbWJyYW5lQ2hhbm5lbE1vZGVsLmdldEVkZ2VDb2xvcigpLmNvbG9yVXRpbHNEYXJrZXIoIDAuMyApO1xyXG5cclxuICAgIGlmICggbWVtYnJhbmVDaGFubmVsTW9kZWwuZ2V0SGFzSW5hY3RpdmF0aW9uR2F0ZSgpICkge1xyXG5cclxuICAgICAgLy8gQWRkIHRoZSBiYWxsIGFuZCBzdHJpbmcgdGhhdCBtYWtlIHVwIHRoZSBpbmFjdGl2YXRpb24gZ2F0ZS5cclxuICAgICAgaW5hY3RpdmF0aW9uR2F0ZVN0cmluZyA9IG5ldyBQYXRoKCBuZXcgU2hhcGUoKSwgeyBsaW5lV2lkdGg6IDAuNSwgc3Ryb2tlOiBDb2xvci5CTEFDSyB9ICk7XHJcblxyXG4gICAgICAvLyBTa2lwIGJvdW5kcyBjb21wdXRhdGlvbiB0byBpbXByb3ZlIHBlcmZvcm1hbmNlXHJcbiAgICAgIGluYWN0aXZhdGlvbkdhdGVTdHJpbmcuY29tcHV0ZVNoYXBlQm91bmRzID0gKCkgPT4gbmV3IEJvdW5kczIoIDAsIDAsIDAsIDAgKTtcclxuICAgICAgdGhpcy5jaGFubmVsTGF5ZXIuYWRkQ2hpbGQoIGluYWN0aXZhdGlvbkdhdGVTdHJpbmcgKTtcclxuXHJcbiAgICAgIGNvbnN0IGJhbGxEaWFtZXRlciA9IG12dC5tb2RlbFRvVmlld0RlbHRhWCggbWVtYnJhbmVDaGFubmVsTW9kZWwuZ2V0Q2hhbm5lbFNpemUoKS53aWR0aCApO1xyXG5cclxuICAgICAgLy8gaW5hY3RpdmF0aW9uQmFsbFNoYXBlIGlzIGFsd2F5cyBhIGNpcmNsZSwgc28gdXNlIHRoZSBvcHRpbWl6ZWQgdmVyc2lvbi5cclxuICAgICAgaW5hY3RpdmF0aW9uR2F0ZUJhbGxOb2RlID0gbmV3IENpcmNsZSggYmFsbERpYW1ldGVyIC8gMiwgeyBmaWxsOiBlZGdlQ29sb3IsIGxpbmVXaWR0aDogMC41LCBzdHJva2U6IGVkZ2VDb2xvciB9ICk7XHJcbiAgICAgIHRoaXMuZWRnZUxheWVyLmFkZENoaWxkKCBpbmFjdGl2YXRpb25HYXRlQmFsbE5vZGUgKTtcclxuICAgIH1cclxuXHJcbiAgICAvL3ByaXZhdGVcclxuICAgIGZ1bmN0aW9uIHVwZGF0ZVJlcHJlc2VudGF0aW9uKCkge1xyXG5cclxuICAgICAgLy8gU2V0IHRoZSBjaGFubmVsIHdpZHRoIGFzIGEgZnVuY3Rpb24gb2YgdGhlIG9wZW5uZXNzIG9mIHRoZSBtZW1icmFuZSBjaGFubmVsLlxyXG4gICAgICBjb25zdCBjaGFubmVsV2lkdGggPSBtZW1icmFuZUNoYW5uZWxNb2RlbC5nZXRDaGFubmVsU2l6ZSgpLndpZHRoICogbWVtYnJhbmVDaGFubmVsTW9kZWwuZ2V0T3Blbm5lc3MoKTtcclxuICAgICAgY29uc3QgY2hhbm5lbFNpemUgPSBuZXcgRGltZW5zaW9uMiggY2hhbm5lbFdpZHRoLCBtZW1icmFuZUNoYW5uZWxNb2RlbC5nZXRDaGFubmVsU2l6ZSgpLmhlaWdodCApO1xyXG4gICAgICBjb25zdCB0cmFuc2Zvcm1lZENoYW5uZWxTaXplID0gbmV3IERpbWVuc2lvbjIoIE1hdGguYWJzKCBtdnQubW9kZWxUb1ZpZXdEZWx0YVgoIGNoYW5uZWxTaXplLndpZHRoICkgKSwgTWF0aC5hYnMoIG12dC5tb2RlbFRvVmlld0RlbHRhWSggY2hhbm5lbFNpemUuaGVpZ2h0ICkgKSApO1xyXG5cclxuICAgICAgLy8gTWFrZSB0aGUgbm9kZSBhIGJpdCBiaWdnZXIgdGhhbiB0aGUgY2hhbm5lbCBzbyB0aGF0IHRoZSBlZGdlcyBjYW4gYmUgcGxhY2VkIG92ZXIgaXQgd2l0aCBubyBnYXBzLlxyXG4gICAgICBjb25zdCBvdmVyc2l6ZUZhY3RvciA9IDEuMjsgLy8gd2FzIDEuMSBpbiBKYXZhXHJcblxyXG4gICAgICBjb25zdCB3aWR0aCA9IHRyYW5zZm9ybWVkQ2hhbm5lbFNpemUud2lkdGggKiBvdmVyc2l6ZUZhY3RvcjtcclxuICAgICAgY29uc3QgaGVpZ2h0ID0gdHJhbnNmb3JtZWRDaGFubmVsU2l6ZS5oZWlnaHQgKiBvdmVyc2l6ZUZhY3RvcjtcclxuICAgICAgY29uc3QgZWRnZU5vZGVCb3VuZHMgPSBsZWZ0RWRnZU5vZGUuZ2V0Qm91bmRzKCk7XHJcbiAgICAgIGNvbnN0IGVkZ2VXaWR0aCA9IGVkZ2VOb2RlQm91bmRzLndpZHRoOyAvLyBBc3N1bWUgYm90aCBlZGdlcyBhcmUgdGhlIHNhbWUgc2l6ZS5cclxuXHJcbiAgICAgIGNoYW5uZWxQYXRoID0gbmV3IFNoYXBlKCk7XHJcbiAgICAgIGNoYW5uZWxQYXRoLm1vdmVUbyggMCwgMCApO1xyXG4gICAgICBjaGFubmVsUGF0aC5xdWFkcmF0aWNDdXJ2ZVRvKCAoIHdpZHRoICsgZWRnZVdpZHRoICkgLyAyLCBoZWlnaHQgLyA4LCB3aWR0aCArIGVkZ2VXaWR0aCwgMCApO1xyXG4gICAgICBjaGFubmVsUGF0aC5saW5lVG8oIHdpZHRoICsgZWRnZVdpZHRoLCBoZWlnaHQgKTtcclxuICAgICAgY2hhbm5lbFBhdGgucXVhZHJhdGljQ3VydmVUbyggKCB3aWR0aCArIGVkZ2VXaWR0aCApIC8gMiwgaGVpZ2h0ICogNyAvIDgsIDAsIGhlaWdodCApO1xyXG4gICAgICBjaGFubmVsUGF0aC5jbG9zZSgpO1xyXG4gICAgICBjaGFubmVsLnNldFNoYXBlKCBjaGFubmVsUGF0aCApO1xyXG5cclxuICAgICAgLypcclxuICAgICAgIFRoZSBKYXZhIFZlcnNpb24gdXNlcyBjb21wdXRlZCBib3VuZHMgd2hpY2ggaXMgYSBiaXQgZXhwZW5zaXZlLCB0aGUgY3VycmVudCB4IGFuZCB5IGNvb3JkaW5hdGVzIG9mIHRoZSBjaGFubmVsXHJcbiAgICAgICBpcyBtYW51YWxseSBjYWxjdWxhdGVkLiBUaGlzIGFsbG93cyBmb3IgcHJvdmlkaW5nIGEgY3VzdG9taXplZCBjb21wdXRlZEJvdW5kcyBmdW5jdGlvbi5cclxuICAgICAgIEtlcHQgdGhpcyBjb2RlIGZvciByZWZlcmVuY2UuIEFzaHJhZlxyXG4gICAgICAgdmFyIGNoYW5uZWxCb3VuZHMgPSBjaGFubmVsLmdldEJvdW5kcygpO1xyXG4gICAgICAgY2hhbm5lbC54ID0gLWNoYW5uZWxCb3VuZHMud2lkdGggLyAyO1xyXG4gICAgICAgY2hhbm5lbC55ID0gLWNoYW5uZWxCb3VuZHMuaGVpZ2h0IC8gMjtcclxuICAgICAgICovXHJcblxyXG4gICAgICBjaGFubmVsLnggPSAtKCB3aWR0aCArIGVkZ2VXaWR0aCApIC8gMjtcclxuICAgICAgY2hhbm5lbC55ID0gLWhlaWdodCAvIDI7XHJcblxyXG4gICAgICBsZWZ0RWRnZU5vZGUueCA9IC10cmFuc2Zvcm1lZENoYW5uZWxTaXplLndpZHRoIC8gMiAtIGVkZ2VOb2RlQm91bmRzLndpZHRoIC8gMjtcclxuICAgICAgbGVmdEVkZ2VOb2RlLnkgPSAwO1xyXG4gICAgICByaWdodEVkZ2VOb2RlLnggPSB0cmFuc2Zvcm1lZENoYW5uZWxTaXplLndpZHRoIC8gMiArIGVkZ2VOb2RlQm91bmRzLndpZHRoIC8gMjtcclxuICAgICAgcmlnaHRFZGdlTm9kZS55ID0gMDtcclxuXHJcbiAgICAgIC8vIElmIHRoaXMgbWVtYnJhbmUgY2hhbm5lbCBoYXMgYW4gaW5hY3RpdmF0aW9uIGdhdGUsIHVwZGF0ZSBpdC5cclxuICAgICAgaWYgKCBtZW1icmFuZUNoYW5uZWxNb2RlbC5nZXRIYXNJbmFjdGl2YXRpb25HYXRlKCkgKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkT3ZlcmFsbFNpemUgPVxyXG4gICAgICAgICAgbmV3IERpbWVuc2lvbjIoIG12dC5tb2RlbFRvVmlld0RlbHRhWCggbWVtYnJhbmVDaGFubmVsTW9kZWwuZ2V0T3ZlcmFsbFNpemUoKS53aWR0aCApLFxyXG4gICAgICAgICAgICBtdnQubW9kZWxUb1ZpZXdEZWx0YVkoIG1lbWJyYW5lQ2hhbm5lbE1vZGVsLmdldE92ZXJhbGxTaXplKCkuaGVpZ2h0ICkgKTtcclxuXHJcbiAgICAgICAgLy8gUG9zaXRpb24gdGhlIGJhbGwgcG9ydGlvbiBvZiB0aGUgaW5hY3RpdmF0aW9uIGdhdGUuXHJcbiAgICAgICAgY29uc3QgY2hhbm5lbEVkZ2VDb25uZWN0aW9uUG9pbnQgPSBuZXcgVmVjdG9yMiggbGVmdEVkZ2VOb2RlLmNlbnRlclgsXHJcbiAgICAgICAgICBsZWZ0RWRnZU5vZGUuZ2V0Qm91bmRzKCkuZ2V0TWF4WSgpICk7XHJcbiAgICAgICAgY29uc3QgY2hhbm5lbENlbnRlckJvdHRvbVBvaW50ID0gbmV3IFZlY3RvcjIoIDAsIHRyYW5zZm9ybWVkQ2hhbm5lbFNpemUuaGVpZ2h0IC8gMiApO1xyXG4gICAgICAgIGNvbnN0IGFuZ2xlID0gLU1hdGguUEkgLyAyICogKCAxIC0gbWVtYnJhbmVDaGFubmVsTW9kZWwuZ2V0SW5hY3RpdmF0aW9uQW1vdW50KCkgKTtcclxuICAgICAgICBjb25zdCByYWRpdXMgPSAoIDEgLSBtZW1icmFuZUNoYW5uZWxNb2RlbC5nZXRJbmFjdGl2YXRpb25BbW91bnQoKSApICogdHJhbnNmb3JtZWRPdmVyYWxsU2l6ZS53aWR0aCAvIDIgKyBtZW1icmFuZUNoYW5uZWxNb2RlbC5nZXRJbmFjdGl2YXRpb25BbW91bnQoKSAqIGNoYW5uZWxFZGdlQ29ubmVjdGlvblBvaW50LmRpc3RhbmNlKCBjaGFubmVsQ2VudGVyQm90dG9tUG9pbnQgKTtcclxuXHJcbiAgICAgICAgY29uc3QgYmFsbFBvc2l0aW9uID0gbmV3IFZlY3RvcjIoIGNoYW5uZWxFZGdlQ29ubmVjdGlvblBvaW50LnggKyBNYXRoLmNvcyggYW5nbGUgKSAqIHJhZGl1cyxcclxuICAgICAgICAgIGNoYW5uZWxFZGdlQ29ubmVjdGlvblBvaW50LnkgLSBNYXRoLnNpbiggYW5nbGUgKSAqIHJhZGl1cyApO1xyXG4gICAgICAgIGluYWN0aXZhdGlvbkdhdGVCYWxsTm9kZS54ID0gYmFsbFBvc2l0aW9uLng7XHJcbiAgICAgICAgaW5hY3RpdmF0aW9uR2F0ZUJhbGxOb2RlLnkgPSBiYWxsUG9zaXRpb24ueTtcclxuXHJcbiAgICAgICAgLy8gUmVkcmF3IHRoZSBcInN0cmluZ1wiIChhY3R1YWxseSBhIHN0cmFuZCBvZiBwcm90ZWluIGluIHJlYWwgbGlmZSlcclxuICAgICAgICAvLyB0aGF0IGNvbm5lY3RzIHRoZSBiYWxsIHRvIHRoZSBnYXRlLlxyXG4gICAgICAgIGNvbnN0IGJhbGxDb25uZWN0aW9uUG9pbnQgPSBuZXcgVmVjdG9yMiggaW5hY3RpdmF0aW9uR2F0ZUJhbGxOb2RlLngsIGluYWN0aXZhdGlvbkdhdGVCYWxsTm9kZS55ICk7XHJcblxyXG4gICAgICAgIGNvbnN0IGNvbm5lY3Rvckxlbmd0aCA9IGNoYW5uZWxDZW50ZXJCb3R0b21Qb2ludC5kaXN0YW5jZSggYmFsbENvbm5lY3Rpb25Qb2ludCApO1xyXG4gICAgICAgIHN0cmluZ1NoYXBlID0gbmV3IFNoYXBlKCkubW92ZVRvKCBjaGFubmVsRWRnZUNvbm5lY3Rpb25Qb2ludC54LCBjaGFubmVsRWRnZUNvbm5lY3Rpb25Qb2ludC55IClcclxuICAgICAgICAgIC5jdWJpY0N1cnZlVG8oIGNoYW5uZWxFZGdlQ29ubmVjdGlvblBvaW50LnggKyBjb25uZWN0b3JMZW5ndGggKiAwLjI1LFxyXG4gICAgICAgICAgICBjaGFubmVsRWRnZUNvbm5lY3Rpb25Qb2ludC55ICsgY29ubmVjdG9yTGVuZ3RoICogMC41LCBiYWxsQ29ubmVjdGlvblBvaW50LnggLSBjb25uZWN0b3JMZW5ndGggKiAwLjc1LFxyXG4gICAgICAgICAgICBiYWxsQ29ubmVjdGlvblBvaW50LnkgLSBjb25uZWN0b3JMZW5ndGggKiAwLjUsIGJhbGxDb25uZWN0aW9uUG9pbnQueCwgYmFsbENvbm5lY3Rpb25Qb2ludC55ICk7XHJcbiAgICAgICAgaW5hY3RpdmF0aW9uR2F0ZVN0cmluZy5zZXRTaGFwZSggc3RyaW5nU2hhcGUgKTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB1cGRhdGVQb3NpdGlvbiA9ICgpID0+IHtcclxuICAgICAgdGhpcy5jaGFubmVsTGF5ZXIudHJhbnNsYXRlKCBtdnQubW9kZWxUb1ZpZXdQb3NpdGlvbiggbWVtYnJhbmVDaGFubmVsTW9kZWwuZ2V0Q2VudGVyUG9zaXRpb24oKSApICk7XHJcbiAgICAgIHRoaXMuZWRnZUxheWVyLnRyYW5zbGF0ZSggbXZ0Lm1vZGVsVG9WaWV3UG9zaXRpb24oIG1lbWJyYW5lQ2hhbm5lbE1vZGVsLmdldENlbnRlclBvc2l0aW9uKCkgKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCB1cGRhdGVSb3RhdGlvbiA9ICgpID0+IHtcclxuICAgICAgLy8gUm90YXRlIGJhc2VkIG9uIHRoZSBtb2RlbCBlbGVtZW50J3Mgb3JpZW50YXRpb24gKHRoZSBKYXZhIFZlcnNpb24gcm90YXRlcyBhbmQgdGhlbiB0cmFuc2xhdGVzLCBoZXJlIHRoZVxyXG4gICAgICAvLyB0cmFuc2Zvcm1hdGlvbiBvcmRlciBpcyByZXZlcnNlZCAtIEFzaHJhZikuXHJcbiAgICAgIHRoaXMuY2hhbm5lbExheWVyLnNldFJvdGF0aW9uKCAtbWVtYnJhbmVDaGFubmVsTW9kZWwucm90YXRpb25hbEFuZ2xlICsgTWF0aC5QSSAvIDIgKTtcclxuICAgICAgdGhpcy5lZGdlTGF5ZXIuc2V0Um90YXRpb24oIC1tZW1icmFuZUNoYW5uZWxNb2RlbC5yb3RhdGlvbmFsQW5nbGUgKyBNYXRoLlBJIC8gMiApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIHJlcHJlc2VudGF0aW9uIGFuZCBwb3NpdGlvbi5cclxuICAgIHVwZGF0ZVJlcHJlc2VudGF0aW9uKCk7XHJcbiAgICB1cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgdXBkYXRlUm90YXRpb24oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCB0aGlzIG5vZGUgdG8gdGhlIHR3byBzcGVjaWZpZWQgcGFyZW50IG5vZGVzLiAgVGhpcyBpcyBkb25lIGluIG9yZGVyIHRvIGFjaGlldmUgYSBiZXR0ZXIgbGF5ZXJpbmcgZWZmZWN0IHRoYXRcclxuICAgKiBhbGxvd3MgcGFydGljbGVzIHRvIGxvb2sgbW9yZSBsaWtlIHRoZXkgYXJlIG1vdmluZyB0aHJvdWdoIHRoZSBjaGFubmVsLiAgSXQgaXMgbm90IGFic29sdXRlbHkgbmVjZXNzYXJ5IHRvIHVzZVxyXG4gICAqIHRoaXMgbWV0aG9kIGZvciB0aGlzIG5vZGUgLSBpdCBjYW4gYmUgYWRkZWQgdG8gdGhlIGNhbnZhcyBsaWtlIGFueSBvdGhlciBQTm9kZSwgaXQganVzdCB3b24ndCBoYXZlIHRoZSBsYXllcmluZy5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYWRkVG9DYW52YXMoIGNoYW5uZWxMYXllciwgZWRnZUxheWVyICkge1xyXG4gICAgY2hhbm5lbExheWVyLmFkZENoaWxkKCB0aGlzLmNoYW5uZWxMYXllciApO1xyXG4gICAgZWRnZUxheWVyLmFkZENoaWxkKCB0aGlzLmVkZ2VMYXllciApOy8vTWVtYnJhbmUgY2hhbm5lbCBtYWludGFpbnMgaXRzIG93biBsYXllciBvZiAyIGVkZ2Ugbm9kZXNcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICByZW1vdmVGcm9tQ2FudmFzKCBjaGFubmVsTGF5ZXIsIGVkZ2VMYXllciApIHtcclxuICAgIGNoYW5uZWxMYXllci5yZW1vdmVDaGlsZCggdGhpcy5jaGFubmVsTGF5ZXIgKTtcclxuICAgIGVkZ2VMYXllci5yZW1vdmVDaGlsZCggdGhpcy5lZGdlTGF5ZXIgKTtcclxuICB9XHJcbn1cclxuXHJcbm5ldXJvbi5yZWdpc3RlciggJ01lbWJyYW5lQ2hhbm5lbE5vZGUnLCBNZW1icmFuZUNoYW5uZWxOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNZW1icmFuZUNoYW5uZWxOb2RlO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsVUFBVSxN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