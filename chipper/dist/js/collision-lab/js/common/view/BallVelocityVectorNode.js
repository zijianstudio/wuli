// Copyright 2019-2022, University of Colorado Boulder

/**
 * BallVelocityVectorNode is a BallVectorNode subtype for a single Ball's velocity vector. They appear in all screens
 * of the 'Collision Lab' simulation when the 'Velocity' checkbox is checked.
 *
 * Adds the following functionality to BallVectorNode:
 *   - Adds a circle at the tip of the Vector, with the velocity symbol on top of it. The tip and the symbol are only
 *     visible if and only if the simulation is paused.
 *
 *   - If the tip of the Vector is dragged, the velocity of the Ball changes based on the new components of the
 *     velocity vector. Dragging the dip of the vector indicates that the user is controlling both components of the
 *     Ball's velocity.
 *
 * For the 'Collision Lab' sim, BallVelocityVectorNode are instantiated at the start and are never disposed.
 * See BallVectorNode for more background.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { Circle, Color, DragListener, Text } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import CollisionLabUtils from '../CollisionLabUtils.js';
import Ball from '../model/Ball.js';
import PlayArea from '../model/PlayArea.js';
import BallVectorNode from './BallVectorNode.js';

// constants
const VELOCITY_BOUNDS = new Bounds2(CollisionLabConstants.VELOCITY_RANGE.min, CollisionLabConstants.VELOCITY_RANGE.min, CollisionLabConstants.VELOCITY_RANGE.max, CollisionLabConstants.VELOCITY_RANGE.max);
class BallVelocityVectorNode extends BallVectorNode {
  /**
   * @param {Ball} ball - the ball model.
   * @param {number} dimension - the dimension of the PlayArea.
   * @param {Property.<boolean>} velocityVectorVisibleProperty
   * @param {Property.<boolean>} isPlayingProperty - indicates if the sim is playing.
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor(ball, dimension, velocityVectorVisibleProperty, isPlayingProperty, modelViewTransform, options) {
    assert && assert(ball instanceof Ball, `invalid ball: ${ball}`);
    assert && assert(PlayArea.Dimension.includes(dimension), `invalid dimension: ${dimension}`);
    assert && AssertUtils.assertPropertyOf(velocityVectorVisibleProperty, 'boolean');
    assert && AssertUtils.assertPropertyOf(isPlayingProperty, 'boolean');
    assert && assert(modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}`);
    options = merge({
      // {number} - the radius of the tip-circle, in view coordinates.
      tipCircleRadius: 13,
      // super-class options
      arrowOptions: {
        fill: CollisionLabColors.VELOCITY_VECTOR_FILL,
        stroke: CollisionLabColors.VELOCITY_VECTOR_STROKE
      }
    }, options);
    super(ball.positionProperty, ball.velocityProperty, velocityVectorVisibleProperty, modelViewTransform, options);

    //----------------------------------------------------------------------------------------

    // Create the Text instance that displays the velocity symbol. Position to be updated later.
    const velocitySymbolText = new Text(CollisionLabStrings.symbol.velocity, {
      pickable: false,
      font: CollisionLabConstants.CONTROL_FONT,
      maxWidth: 15 // constrain width for i18n, determined empirically.
    });

    // Create the circle at the tip of the vector. Position to be updated later.
    const tipCircle = new Circle(options.tipCircleRadius, {
      stroke: Color.BLACK,
      cursor: 'pointer'
    });

    // Add the tipCircle and the velocitySymbolText as children of this Node.
    this.addChild(tipCircle);
    this.addChild(velocitySymbolText);

    //----------------------------------------------------------------------------------------

    // Add a DragListener to the Tip Circle. When this happens, the velocity of the Ball changes based on the new
    // components of the velocity vector. Listener never removed since BallVelocityVectorNode are never disposed.
    tipCircle.addInputListener(new DragListener({
      applyOffset: false,
      drag: (event, listener) => {
        // Get the new components of the velocity vector based on where the user dragged the tip. The point is
        // constrained to a max magnitude. See https://github.com/phetsims/collision-lab/issues/102
        const velocity = VELOCITY_BOUNDS.closestPointTo(modelViewTransform.viewToModelDelta(listener.modelPoint));

        // Update the xVelocity of the Ball first.
        ball.setXVelocity(velocity.x);

        // If the dimensional PlayArea is 2D, then update the yVelocity of the Ball as well.
        dimension === PlayArea.Dimension.TWO && ball.setYVelocity(velocity.y);
      },
      // Set the positionUserControlledProperty of the ball and the visibility of the leader-lines when dragging.
      start: (event, listener) => {
        ball.xVelocityUserControlledProperty.value = true;
        dimension === PlayArea.Dimension.TWO && (ball.yVelocityUserControlledProperty.value = true);
      },
      end: () => {
        // Round the velocity vector to match the displayed value on drag-release. See
        // https://github.com/phetsims/collision-lab/issues/136.
        ball.velocityProperty.value = CollisionLabUtils.roundVectorToNearest(ball.velocityProperty.value, 10 ** -CollisionLabConstants.DISPLAY_DECIMAL_PLACES);
        ball.xVelocityUserControlledProperty.value = false;
        dimension === PlayArea.Dimension.TWO && (ball.yVelocityUserControlledProperty.value = false);
      }
    }));

    //----------------------------------------------------------------------------------------

    // Observe when the ballValueProperty changes and update the tip-circle position. Link is never unlinked since
    // BallVectorNodes are never disposed.
    ball.velocityProperty.link(velocity => {
      // Get the position of the tip in view coordinates. This is relative to our origin, which is the tail of the
      // Vector.
      tipCircle.center = modelViewTransform.modelToViewDelta(velocity);
      velocitySymbolText.center = tipCircle.center;
    });

    // Observe when the sim's isPlayingProperty changes and update the visibility of the tip. The tip and the symbol are
    // only visible if and only if the simulation is paused. Link never unlinked BallVectorNodes are never disposed.
    isPlayingProperty.link(isPlaying => {
      tipCircle.visible = !isPlaying;
      velocitySymbolText.visible = !isPlaying;
    });
  }
}
collisionLab.register('BallVelocityVectorNode', BallVelocityVectorNode);
export default BallVelocityVectorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwibWVyZ2UiLCJBc3NlcnRVdGlscyIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJDaXJjbGUiLCJDb2xvciIsIkRyYWdMaXN0ZW5lciIsIlRleHQiLCJjb2xsaXNpb25MYWIiLCJDb2xsaXNpb25MYWJTdHJpbmdzIiwiQ29sbGlzaW9uTGFiQ29sb3JzIiwiQ29sbGlzaW9uTGFiQ29uc3RhbnRzIiwiQ29sbGlzaW9uTGFiVXRpbHMiLCJCYWxsIiwiUGxheUFyZWEiLCJCYWxsVmVjdG9yTm9kZSIsIlZFTE9DSVRZX0JPVU5EUyIsIlZFTE9DSVRZX1JBTkdFIiwibWluIiwibWF4IiwiQmFsbFZlbG9jaXR5VmVjdG9yTm9kZSIsImNvbnN0cnVjdG9yIiwiYmFsbCIsImRpbWVuc2lvbiIsInZlbG9jaXR5VmVjdG9yVmlzaWJsZVByb3BlcnR5IiwiaXNQbGF5aW5nUHJvcGVydHkiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJvcHRpb25zIiwiYXNzZXJ0IiwiRGltZW5zaW9uIiwiaW5jbHVkZXMiLCJhc3NlcnRQcm9wZXJ0eU9mIiwidGlwQ2lyY2xlUmFkaXVzIiwiYXJyb3dPcHRpb25zIiwiZmlsbCIsIlZFTE9DSVRZX1ZFQ1RPUl9GSUxMIiwic3Ryb2tlIiwiVkVMT0NJVFlfVkVDVE9SX1NUUk9LRSIsInBvc2l0aW9uUHJvcGVydHkiLCJ2ZWxvY2l0eVByb3BlcnR5IiwidmVsb2NpdHlTeW1ib2xUZXh0Iiwic3ltYm9sIiwidmVsb2NpdHkiLCJwaWNrYWJsZSIsImZvbnQiLCJDT05UUk9MX0ZPTlQiLCJtYXhXaWR0aCIsInRpcENpcmNsZSIsIkJMQUNLIiwiY3Vyc29yIiwiYWRkQ2hpbGQiLCJhZGRJbnB1dExpc3RlbmVyIiwiYXBwbHlPZmZzZXQiLCJkcmFnIiwiZXZlbnQiLCJsaXN0ZW5lciIsImNsb3Nlc3RQb2ludFRvIiwidmlld1RvTW9kZWxEZWx0YSIsIm1vZGVsUG9pbnQiLCJzZXRYVmVsb2NpdHkiLCJ4IiwiVFdPIiwic2V0WVZlbG9jaXR5IiwieSIsInN0YXJ0IiwieFZlbG9jaXR5VXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsInZhbHVlIiwieVZlbG9jaXR5VXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsImVuZCIsInJvdW5kVmVjdG9yVG9OZWFyZXN0IiwiRElTUExBWV9ERUNJTUFMX1BMQUNFUyIsImxpbmsiLCJjZW50ZXIiLCJtb2RlbFRvVmlld0RlbHRhIiwiaXNQbGF5aW5nIiwidmlzaWJsZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQmFsbFZlbG9jaXR5VmVjdG9yTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCYWxsVmVsb2NpdHlWZWN0b3JOb2RlIGlzIGEgQmFsbFZlY3Rvck5vZGUgc3VidHlwZSBmb3IgYSBzaW5nbGUgQmFsbCdzIHZlbG9jaXR5IHZlY3Rvci4gVGhleSBhcHBlYXIgaW4gYWxsIHNjcmVlbnNcclxuICogb2YgdGhlICdDb2xsaXNpb24gTGFiJyBzaW11bGF0aW9uIHdoZW4gdGhlICdWZWxvY2l0eScgY2hlY2tib3ggaXMgY2hlY2tlZC5cclxuICpcclxuICogQWRkcyB0aGUgZm9sbG93aW5nIGZ1bmN0aW9uYWxpdHkgdG8gQmFsbFZlY3Rvck5vZGU6XHJcbiAqICAgLSBBZGRzIGEgY2lyY2xlIGF0IHRoZSB0aXAgb2YgdGhlIFZlY3Rvciwgd2l0aCB0aGUgdmVsb2NpdHkgc3ltYm9sIG9uIHRvcCBvZiBpdC4gVGhlIHRpcCBhbmQgdGhlIHN5bWJvbCBhcmUgb25seVxyXG4gKiAgICAgdmlzaWJsZSBpZiBhbmQgb25seSBpZiB0aGUgc2ltdWxhdGlvbiBpcyBwYXVzZWQuXHJcbiAqXHJcbiAqICAgLSBJZiB0aGUgdGlwIG9mIHRoZSBWZWN0b3IgaXMgZHJhZ2dlZCwgdGhlIHZlbG9jaXR5IG9mIHRoZSBCYWxsIGNoYW5nZXMgYmFzZWQgb24gdGhlIG5ldyBjb21wb25lbnRzIG9mIHRoZVxyXG4gKiAgICAgdmVsb2NpdHkgdmVjdG9yLiBEcmFnZ2luZyB0aGUgZGlwIG9mIHRoZSB2ZWN0b3IgaW5kaWNhdGVzIHRoYXQgdGhlIHVzZXIgaXMgY29udHJvbGxpbmcgYm90aCBjb21wb25lbnRzIG9mIHRoZVxyXG4gKiAgICAgQmFsbCdzIHZlbG9jaXR5LlxyXG4gKlxyXG4gKiBGb3IgdGhlICdDb2xsaXNpb24gTGFiJyBzaW0sIEJhbGxWZWxvY2l0eVZlY3Rvck5vZGUgYXJlIGluc3RhbnRpYXRlZCBhdCB0aGUgc3RhcnQgYW5kIGFyZSBuZXZlciBkaXNwb3NlZC5cclxuICogU2VlIEJhbGxWZWN0b3JOb2RlIGZvciBtb3JlIGJhY2tncm91bmQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGVcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgQXNzZXJ0VXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9Bc3NlcnRVdGlscy5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBDb2xvciwgRHJhZ0xpc3RlbmVyLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGNvbGxpc2lvbkxhYiBmcm9tICcuLi8uLi9jb2xsaXNpb25MYWIuanMnO1xyXG5pbXBvcnQgQ29sbGlzaW9uTGFiU3RyaW5ncyBmcm9tICcuLi8uLi9Db2xsaXNpb25MYWJTdHJpbmdzLmpzJztcclxuaW1wb3J0IENvbGxpc2lvbkxhYkNvbG9ycyBmcm9tICcuLi9Db2xsaXNpb25MYWJDb2xvcnMuanMnO1xyXG5pbXBvcnQgQ29sbGlzaW9uTGFiQ29uc3RhbnRzIGZyb20gJy4uL0NvbGxpc2lvbkxhYkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJVdGlscyBmcm9tICcuLi9Db2xsaXNpb25MYWJVdGlscy5qcyc7XHJcbmltcG9ydCBCYWxsIGZyb20gJy4uL21vZGVsL0JhbGwuanMnO1xyXG5pbXBvcnQgUGxheUFyZWEgZnJvbSAnLi4vbW9kZWwvUGxheUFyZWEuanMnO1xyXG5pbXBvcnQgQmFsbFZlY3Rvck5vZGUgZnJvbSAnLi9CYWxsVmVjdG9yTm9kZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgVkVMT0NJVFlfQk9VTkRTID0gbmV3IEJvdW5kczIoXHJcbiAgQ29sbGlzaW9uTGFiQ29uc3RhbnRzLlZFTE9DSVRZX1JBTkdFLm1pbixcclxuICBDb2xsaXNpb25MYWJDb25zdGFudHMuVkVMT0NJVFlfUkFOR0UubWluLFxyXG4gIENvbGxpc2lvbkxhYkNvbnN0YW50cy5WRUxPQ0lUWV9SQU5HRS5tYXgsXHJcbiAgQ29sbGlzaW9uTGFiQ29uc3RhbnRzLlZFTE9DSVRZX1JBTkdFLm1heFxyXG4pO1xyXG5cclxuY2xhc3MgQmFsbFZlbG9jaXR5VmVjdG9yTm9kZSBleHRlbmRzIEJhbGxWZWN0b3JOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtCYWxsfSBiYWxsIC0gdGhlIGJhbGwgbW9kZWwuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRpbWVuc2lvbiAtIHRoZSBkaW1lbnNpb24gb2YgdGhlIFBsYXlBcmVhLlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSB2ZWxvY2l0eVZlY3RvclZpc2libGVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBpc1BsYXlpbmdQcm9wZXJ0eSAtIGluZGljYXRlcyBpZiB0aGUgc2ltIGlzIHBsYXlpbmcuXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGJhbGwsIGRpbWVuc2lvbiwgdmVsb2NpdHlWZWN0b3JWaXNpYmxlUHJvcGVydHksIGlzUGxheWluZ1Byb3BlcnR5LCBtb2RlbFZpZXdUcmFuc2Zvcm0sIG9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBiYWxsIGluc3RhbmNlb2YgQmFsbCwgYGludmFsaWQgYmFsbDogJHtiYWxsfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIFBsYXlBcmVhLkRpbWVuc2lvbi5pbmNsdWRlcyggZGltZW5zaW9uICksIGBpbnZhbGlkIGRpbWVuc2lvbjogJHtkaW1lbnNpb259YCApO1xyXG4gICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydFByb3BlcnR5T2YoIHZlbG9jaXR5VmVjdG9yVmlzaWJsZVByb3BlcnR5LCAnYm9vbGVhbicgKTtcclxuICAgIGFzc2VydCAmJiBBc3NlcnRVdGlscy5hc3NlcnRQcm9wZXJ0eU9mKCBpc1BsYXlpbmdQcm9wZXJ0eSwgJ2Jvb2xlYW4nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtb2RlbFZpZXdUcmFuc2Zvcm0gaW5zdGFuY2VvZiBNb2RlbFZpZXdUcmFuc2Zvcm0yLCBgaW52YWxpZCBtb2RlbFZpZXdUcmFuc2Zvcm06ICR7bW9kZWxWaWV3VHJhbnNmb3JtfWAgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ9IC0gdGhlIHJhZGl1cyBvZiB0aGUgdGlwLWNpcmNsZSwgaW4gdmlldyBjb29yZGluYXRlcy5cclxuICAgICAgdGlwQ2lyY2xlUmFkaXVzOiAxMyxcclxuXHJcbiAgICAgIC8vIHN1cGVyLWNsYXNzIG9wdGlvbnNcclxuICAgICAgYXJyb3dPcHRpb25zOiB7XHJcbiAgICAgICAgZmlsbDogQ29sbGlzaW9uTGFiQ29sb3JzLlZFTE9DSVRZX1ZFQ1RPUl9GSUxMLFxyXG4gICAgICAgIHN0cm9rZTogQ29sbGlzaW9uTGFiQ29sb3JzLlZFTE9DSVRZX1ZFQ1RPUl9TVFJPS0VcclxuICAgICAgfVxyXG5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggYmFsbC5wb3NpdGlvblByb3BlcnR5LCBiYWxsLnZlbG9jaXR5UHJvcGVydHksIHZlbG9jaXR5VmVjdG9yVmlzaWJsZVByb3BlcnR5LCBtb2RlbFZpZXdUcmFuc2Zvcm0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIFRleHQgaW5zdGFuY2UgdGhhdCBkaXNwbGF5cyB0aGUgdmVsb2NpdHkgc3ltYm9sLiBQb3NpdGlvbiB0byBiZSB1cGRhdGVkIGxhdGVyLlxyXG4gICAgY29uc3QgdmVsb2NpdHlTeW1ib2xUZXh0ID0gbmV3IFRleHQoIENvbGxpc2lvbkxhYlN0cmluZ3Muc3ltYm9sLnZlbG9jaXR5LCB7XHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgZm9udDogQ29sbGlzaW9uTGFiQ29uc3RhbnRzLkNPTlRST0xfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IDE1IC8vIGNvbnN0cmFpbiB3aWR0aCBmb3IgaTE4biwgZGV0ZXJtaW5lZCBlbXBpcmljYWxseS5cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGNpcmNsZSBhdCB0aGUgdGlwIG9mIHRoZSB2ZWN0b3IuIFBvc2l0aW9uIHRvIGJlIHVwZGF0ZWQgbGF0ZXIuXHJcbiAgICBjb25zdCB0aXBDaXJjbGUgPSBuZXcgQ2lyY2xlKCBvcHRpb25zLnRpcENpcmNsZVJhZGl1cywgeyBzdHJva2U6IENvbG9yLkJMQUNLLCBjdXJzb3I6ICdwb2ludGVyJyB9ICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSB0aXBDaXJjbGUgYW5kIHRoZSB2ZWxvY2l0eVN5bWJvbFRleHQgYXMgY2hpbGRyZW4gb2YgdGhpcyBOb2RlLlxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGlwQ2lyY2xlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB2ZWxvY2l0eVN5bWJvbFRleHQgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBBZGQgYSBEcmFnTGlzdGVuZXIgdG8gdGhlIFRpcCBDaXJjbGUuIFdoZW4gdGhpcyBoYXBwZW5zLCB0aGUgdmVsb2NpdHkgb2YgdGhlIEJhbGwgY2hhbmdlcyBiYXNlZCBvbiB0aGUgbmV3XHJcbiAgICAvLyBjb21wb25lbnRzIG9mIHRoZSB2ZWxvY2l0eSB2ZWN0b3IuIExpc3RlbmVyIG5ldmVyIHJlbW92ZWQgc2luY2UgQmFsbFZlbG9jaXR5VmVjdG9yTm9kZSBhcmUgbmV2ZXIgZGlzcG9zZWQuXHJcbiAgICB0aXBDaXJjbGUuYWRkSW5wdXRMaXN0ZW5lciggbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICBhcHBseU9mZnNldDogZmFsc2UsXHJcbiAgICAgIGRyYWc6ICggZXZlbnQsIGxpc3RlbmVyICkgPT4ge1xyXG5cclxuICAgICAgICAvLyBHZXQgdGhlIG5ldyBjb21wb25lbnRzIG9mIHRoZSB2ZWxvY2l0eSB2ZWN0b3IgYmFzZWQgb24gd2hlcmUgdGhlIHVzZXIgZHJhZ2dlZCB0aGUgdGlwLiBUaGUgcG9pbnQgaXNcclxuICAgICAgICAvLyBjb25zdHJhaW5lZCB0byBhIG1heCBtYWduaXR1ZGUuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY29sbGlzaW9uLWxhYi9pc3N1ZXMvMTAyXHJcbiAgICAgICAgY29uc3QgdmVsb2NpdHkgPSBWRUxPQ0lUWV9CT1VORFMuY2xvc2VzdFBvaW50VG8oIG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbERlbHRhKCBsaXN0ZW5lci5tb2RlbFBvaW50ICkgKTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHRoZSB4VmVsb2NpdHkgb2YgdGhlIEJhbGwgZmlyc3QuXHJcbiAgICAgICAgYmFsbC5zZXRYVmVsb2NpdHkoIHZlbG9jaXR5LnggKTtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIGRpbWVuc2lvbmFsIFBsYXlBcmVhIGlzIDJELCB0aGVuIHVwZGF0ZSB0aGUgeVZlbG9jaXR5IG9mIHRoZSBCYWxsIGFzIHdlbGwuXHJcbiAgICAgICAgKCBkaW1lbnNpb24gPT09IFBsYXlBcmVhLkRpbWVuc2lvbi5UV08gKSAmJiBiYWxsLnNldFlWZWxvY2l0eSggdmVsb2NpdHkueSApO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gU2V0IHRoZSBwb3NpdGlvblVzZXJDb250cm9sbGVkUHJvcGVydHkgb2YgdGhlIGJhbGwgYW5kIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBsZWFkZXItbGluZXMgd2hlbiBkcmFnZ2luZy5cclxuICAgICAgc3RhcnQ6ICggZXZlbnQsIGxpc3RlbmVyICkgPT4ge1xyXG4gICAgICAgIGJhbGwueFZlbG9jaXR5VXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgKCBkaW1lbnNpb24gPT09IFBsYXlBcmVhLkRpbWVuc2lvbi5UV08gKSAmJiAoIGJhbGwueVZlbG9jaXR5VXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWUgKTtcclxuICAgICAgfSxcclxuICAgICAgZW5kOiAoKSA9PiB7XHJcbiAgICAgICAgLy8gUm91bmQgdGhlIHZlbG9jaXR5IHZlY3RvciB0byBtYXRjaCB0aGUgZGlzcGxheWVkIHZhbHVlIG9uIGRyYWctcmVsZWFzZS4gU2VlXHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NvbGxpc2lvbi1sYWIvaXNzdWVzLzEzNi5cclxuICAgICAgICBiYWxsLnZlbG9jaXR5UHJvcGVydHkudmFsdWUgPSBDb2xsaXNpb25MYWJVdGlscy5yb3VuZFZlY3RvclRvTmVhcmVzdCggYmFsbC52ZWxvY2l0eVByb3BlcnR5LnZhbHVlLFxyXG4gICAgICAgICAgMTAgKiogLUNvbGxpc2lvbkxhYkNvbnN0YW50cy5ESVNQTEFZX0RFQ0lNQUxfUExBQ0VTICk7XHJcblxyXG4gICAgICAgIGJhbGwueFZlbG9jaXR5VXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgICggZGltZW5zaW9uID09PSBQbGF5QXJlYS5EaW1lbnNpb24uVFdPICkgJiYgKCBiYWxsLnlWZWxvY2l0eVVzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgPSBmYWxzZSApO1xyXG4gICAgICB9XHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBPYnNlcnZlIHdoZW4gdGhlIGJhbGxWYWx1ZVByb3BlcnR5IGNoYW5nZXMgYW5kIHVwZGF0ZSB0aGUgdGlwLWNpcmNsZSBwb3NpdGlvbi4gTGluayBpcyBuZXZlciB1bmxpbmtlZCBzaW5jZVxyXG4gICAgLy8gQmFsbFZlY3Rvck5vZGVzIGFyZSBuZXZlciBkaXNwb3NlZC5cclxuICAgIGJhbGwudmVsb2NpdHlQcm9wZXJ0eS5saW5rKCB2ZWxvY2l0eSA9PiB7XHJcblxyXG4gICAgICAvLyBHZXQgdGhlIHBvc2l0aW9uIG9mIHRoZSB0aXAgaW4gdmlldyBjb29yZGluYXRlcy4gVGhpcyBpcyByZWxhdGl2ZSB0byBvdXIgb3JpZ2luLCB3aGljaCBpcyB0aGUgdGFpbCBvZiB0aGVcclxuICAgICAgLy8gVmVjdG9yLlxyXG4gICAgICB0aXBDaXJjbGUuY2VudGVyID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGEoIHZlbG9jaXR5ICk7XHJcbiAgICAgIHZlbG9jaXR5U3ltYm9sVGV4dC5jZW50ZXIgPSB0aXBDaXJjbGUuY2VudGVyO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIE9ic2VydmUgd2hlbiB0aGUgc2ltJ3MgaXNQbGF5aW5nUHJvcGVydHkgY2hhbmdlcyBhbmQgdXBkYXRlIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSB0aXAuIFRoZSB0aXAgYW5kIHRoZSBzeW1ib2wgYXJlXHJcbiAgICAvLyBvbmx5IHZpc2libGUgaWYgYW5kIG9ubHkgaWYgdGhlIHNpbXVsYXRpb24gaXMgcGF1c2VkLiBMaW5rIG5ldmVyIHVubGlua2VkIEJhbGxWZWN0b3JOb2RlcyBhcmUgbmV2ZXIgZGlzcG9zZWQuXHJcbiAgICBpc1BsYXlpbmdQcm9wZXJ0eS5saW5rKCBpc1BsYXlpbmcgPT4ge1xyXG4gICAgICB0aXBDaXJjbGUudmlzaWJsZSA9ICFpc1BsYXlpbmc7XHJcbiAgICAgIHZlbG9jaXR5U3ltYm9sVGV4dC52aXNpYmxlID0gIWlzUGxheWluZztcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbGxpc2lvbkxhYi5yZWdpc3RlciggJ0JhbGxWZWxvY2l0eVZlY3Rvck5vZGUnLCBCYWxsVmVsb2NpdHlWZWN0b3JOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IEJhbGxWZWxvY2l0eVZlY3Rvck5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSwwQ0FBMEM7QUFDbEUsT0FBT0MsbUJBQW1CLE1BQU0sdURBQXVEO0FBQ3ZGLFNBQVNDLE1BQU0sRUFBRUMsS0FBSyxFQUFF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