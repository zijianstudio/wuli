// Copyright 2020-2022, University of Colorado Boulder

/**
 * Enumeration of the possible 'types' of columns in the BallValuesPanel at the bottom of all screens. This Enumeration
 * is solely used within the view hierarchy. Each 'type' maps to a class that determines if and how a Ball could be
 * edited by the Keypad. See BallValuesPanel.js, BallValuesPanelColumnNode.js, and BallValuesPanelNumberDisplay.js for
 * full context.
 *
 * @author Brandon Li
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import BallUtils from '../model/BallUtils.js';

// @private
class BallValuesPanelColumnType {
  /**
   * @param {function(ball: Ball):Property.<number>|null} createDisplayProperty - Function that gets a Property that is
   *   displayed in the NumberDisplays in the column. Null means that there is no Property displayed. This function is
   *   called ONCE at the start of the sim.
   *
   * @param {Object|null} editConfig - contains information on how a Ball is edited if a NumberDisplay in this
   *                                   column 'type' is pressed. Null means the column is not editable in any way.
   *                                   The object contains:
   * {
   *
   *    // Function that edits a value of a Ball via Keypad.
   *    editValue: {function(ball: Ball, value: number)},
   *
   *    // Gets the range in which the value can be edited.
   *    getEditingRange: {function(ball: Ball):Range},
   *
   *    // The unit associated with the column type.
   *    editingUnit: {string},
   *
   *    // Function that gets the getUserControlledProperty of a Ball associated with this column type.
   *    getUserControlledProperty: {function(ball: Ball):Property.<boolean>}
   *
   * }
   */
  constructor(createDisplayProperty, editConfig) {
    // @public (read-only) {Object|null}
    this.editConfig = editConfig;

    // @public (read-only) {function|null}
    this.createDisplayProperty = createDisplayProperty;
  }
}
const BallValuesPanelColumnTypes = EnumerationDeprecated.byMap({
  // Column of Ball Icons. For displaying purposes only.
  BALL_ICONS: new BallValuesPanelColumnType(null, null),
  // Column of mass NumberDisplays. Editable by the user.
  MASS: new BallValuesPanelColumnType(_.property('massProperty'), {
    editValue: (ball, mass) => {
      ball.massProperty.value = mass;
    },
    getEditingRange: () => CollisionLabConstants.MASS_RANGE,
    editingUnit: CollisionLabStrings.units.kilograms,
    getUserControlledProperty: _.property('massUserControlledProperty')
  }),
  // Column of sliders to change the Mass of a Ball. Only shown when 'More Data' is unchecked.
  MASS_SLIDERS: new BallValuesPanelColumnType(_.property('massProperty'), {
    editValue: (ball, mass) => {
      ball.massProperty.value = mass;
    },
    getEditingRange: () => CollisionLabConstants.MASS_RANGE,
    editingUnit: CollisionLabStrings.units.kilograms,
    getUserControlledProperty: _.property('massUserControlledProperty')
  }),
  // Column of x-position NumberDisplays. Editable by the user.
  X_POSITION: new BallValuesPanelColumnType(ball => new DerivedProperty([ball.positionProperty], _.property('x')), {
    editValue: (ball, xPosition) => ball.setXPosition(xPosition),
    getEditingRange: ball => BallUtils.getKeypadXPositionRange(ball),
    editingUnit: CollisionLabStrings.units.meters,
    getUserControlledProperty: _.property('xPositionUserControlledProperty')
  }),
  // Column of y-position NumberDisplays. Editable by the user and shown for 2D screens only.
  Y_POSITION: new BallValuesPanelColumnType(ball => new DerivedProperty([ball.positionProperty], _.property('y')), {
    editValue: (ball, yPosition) => ball.setYPosition(yPosition),
    getEditingRange: ball => BallUtils.getKeypadYPositionRange(ball),
    editingUnit: CollisionLabStrings.units.meters,
    getUserControlledProperty: _.property('yPositionUserControlledProperty')
  }),
  // Column of x-velocity NumberDisplays. Editable by the user.
  X_VELOCITY: new BallValuesPanelColumnType(ball => new DerivedProperty([ball.velocityProperty], _.property('x')), {
    editValue: (ball, xVelocity) => ball.setXVelocity(xVelocity),
    getEditingRange: () => CollisionLabConstants.VELOCITY_RANGE,
    editingUnit: CollisionLabStrings.units.metersPerSecond,
    getUserControlledProperty: _.property('xVelocityUserControlledProperty')
  }),
  // Column of y-velocity NumberDisplays. Editable by the user and shown for 2D screens only.
  Y_VELOCITY: new BallValuesPanelColumnType(ball => new DerivedProperty([ball.velocityProperty], _.property('y')), {
    editValue: (ball, yVelocity) => ball.setYVelocity(yVelocity),
    getEditingRange: () => CollisionLabConstants.VELOCITY_RANGE,
    editingUnit: CollisionLabStrings.units.metersPerSecond,
    getUserControlledProperty: _.property('yVelocityUserControlledProperty')
  }),
  // Column of x-momentum NumberDisplays. NOT editable by the user.
  X_MOMENTUM: new BallValuesPanelColumnType(ball => new DerivedProperty([ball.momentumProperty], _.property('x')), null),
  // Column of y-momentum NumberDisplays. NOT editable by the user and shown for 2D screens only.
  Y_MOMENTUM: new BallValuesPanelColumnType(ball => new DerivedProperty([ball.momentumProperty], _.property('y')), null)
});
collisionLab.register('BallValuesPanelColumnTypes', BallValuesPanelColumnTypes);
export default BallValuesPanelColumnTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJFbnVtZXJhdGlvbkRlcHJlY2F0ZWQiLCJjb2xsaXNpb25MYWIiLCJDb2xsaXNpb25MYWJTdHJpbmdzIiwiQ29sbGlzaW9uTGFiQ29uc3RhbnRzIiwiQmFsbFV0aWxzIiwiQmFsbFZhbHVlc1BhbmVsQ29sdW1uVHlwZSIsImNvbnN0cnVjdG9yIiwiY3JlYXRlRGlzcGxheVByb3BlcnR5IiwiZWRpdENvbmZpZyIsIkJhbGxWYWx1ZXNQYW5lbENvbHVtblR5cGVzIiwiYnlNYXAiLCJCQUxMX0lDT05TIiwiTUFTUyIsIl8iLCJwcm9wZXJ0eSIsImVkaXRWYWx1ZSIsImJhbGwiLCJtYXNzIiwibWFzc1Byb3BlcnR5IiwidmFsdWUiLCJnZXRFZGl0aW5nUmFuZ2UiLCJNQVNTX1JBTkdFIiwiZWRpdGluZ1VuaXQiLCJ1bml0cyIsImtpbG9ncmFtcyIsImdldFVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJNQVNTX1NMSURFUlMiLCJYX1BPU0lUSU9OIiwicG9zaXRpb25Qcm9wZXJ0eSIsInhQb3NpdGlvbiIsInNldFhQb3NpdGlvbiIsImdldEtleXBhZFhQb3NpdGlvblJhbmdlIiwibWV0ZXJzIiwiWV9QT1NJVElPTiIsInlQb3NpdGlvbiIsInNldFlQb3NpdGlvbiIsImdldEtleXBhZFlQb3NpdGlvblJhbmdlIiwiWF9WRUxPQ0lUWSIsInZlbG9jaXR5UHJvcGVydHkiLCJ4VmVsb2NpdHkiLCJzZXRYVmVsb2NpdHkiLCJWRUxPQ0lUWV9SQU5HRSIsIm1ldGVyc1BlclNlY29uZCIsIllfVkVMT0NJVFkiLCJ5VmVsb2NpdHkiLCJzZXRZVmVsb2NpdHkiLCJYX01PTUVOVFVNIiwibW9tZW50dW1Qcm9wZXJ0eSIsIllfTU9NRU5UVU0iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJhbGxWYWx1ZXNQYW5lbENvbHVtblR5cGVzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEVudW1lcmF0aW9uIG9mIHRoZSBwb3NzaWJsZSAndHlwZXMnIG9mIGNvbHVtbnMgaW4gdGhlIEJhbGxWYWx1ZXNQYW5lbCBhdCB0aGUgYm90dG9tIG9mIGFsbCBzY3JlZW5zLiBUaGlzIEVudW1lcmF0aW9uXHJcbiAqIGlzIHNvbGVseSB1c2VkIHdpdGhpbiB0aGUgdmlldyBoaWVyYXJjaHkuIEVhY2ggJ3R5cGUnIG1hcHMgdG8gYSBjbGFzcyB0aGF0IGRldGVybWluZXMgaWYgYW5kIGhvdyBhIEJhbGwgY291bGQgYmVcclxuICogZWRpdGVkIGJ5IHRoZSBLZXlwYWQuIFNlZSBCYWxsVmFsdWVzUGFuZWwuanMsIEJhbGxWYWx1ZXNQYW5lbENvbHVtbk5vZGUuanMsIGFuZCBCYWxsVmFsdWVzUGFuZWxOdW1iZXJEaXNwbGF5LmpzIGZvclxyXG4gKiBmdWxsIGNvbnRleHQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25EZXByZWNhdGVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbkRlcHJlY2F0ZWQuanMnO1xyXG5pbXBvcnQgY29sbGlzaW9uTGFiIGZyb20gJy4uLy4uL2NvbGxpc2lvbkxhYi5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJTdHJpbmdzIGZyb20gJy4uLy4uL0NvbGxpc2lvbkxhYlN0cmluZ3MuanMnO1xyXG5pbXBvcnQgQ29sbGlzaW9uTGFiQ29uc3RhbnRzIGZyb20gJy4uL0NvbGxpc2lvbkxhYkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBCYWxsVXRpbHMgZnJvbSAnLi4vbW9kZWwvQmFsbFV0aWxzLmpzJztcclxuXHJcbi8vIEBwcml2YXRlXHJcbmNsYXNzIEJhbGxWYWx1ZXNQYW5lbENvbHVtblR5cGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKGJhbGw6IEJhbGwpOlByb3BlcnR5LjxudW1iZXI+fG51bGx9IGNyZWF0ZURpc3BsYXlQcm9wZXJ0eSAtIEZ1bmN0aW9uIHRoYXQgZ2V0cyBhIFByb3BlcnR5IHRoYXQgaXNcclxuICAgKiAgIGRpc3BsYXllZCBpbiB0aGUgTnVtYmVyRGlzcGxheXMgaW4gdGhlIGNvbHVtbi4gTnVsbCBtZWFucyB0aGF0IHRoZXJlIGlzIG5vIFByb3BlcnR5IGRpc3BsYXllZC4gVGhpcyBmdW5jdGlvbiBpc1xyXG4gICAqICAgY2FsbGVkIE9OQ0UgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzaW0uXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdHxudWxsfSBlZGl0Q29uZmlnIC0gY29udGFpbnMgaW5mb3JtYXRpb24gb24gaG93IGEgQmFsbCBpcyBlZGl0ZWQgaWYgYSBOdW1iZXJEaXNwbGF5IGluIHRoaXNcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uICd0eXBlJyBpcyBwcmVzc2VkLiBOdWxsIG1lYW5zIHRoZSBjb2x1bW4gaXMgbm90IGVkaXRhYmxlIGluIGFueSB3YXkuXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRoZSBvYmplY3QgY29udGFpbnM6XHJcbiAgICoge1xyXG4gICAqXHJcbiAgICogICAgLy8gRnVuY3Rpb24gdGhhdCBlZGl0cyBhIHZhbHVlIG9mIGEgQmFsbCB2aWEgS2V5cGFkLlxyXG4gICAqICAgIGVkaXRWYWx1ZToge2Z1bmN0aW9uKGJhbGw6IEJhbGwsIHZhbHVlOiBudW1iZXIpfSxcclxuICAgKlxyXG4gICAqICAgIC8vIEdldHMgdGhlIHJhbmdlIGluIHdoaWNoIHRoZSB2YWx1ZSBjYW4gYmUgZWRpdGVkLlxyXG4gICAqICAgIGdldEVkaXRpbmdSYW5nZToge2Z1bmN0aW9uKGJhbGw6IEJhbGwpOlJhbmdlfSxcclxuICAgKlxyXG4gICAqICAgIC8vIFRoZSB1bml0IGFzc29jaWF0ZWQgd2l0aCB0aGUgY29sdW1uIHR5cGUuXHJcbiAgICogICAgZWRpdGluZ1VuaXQ6IHtzdHJpbmd9LFxyXG4gICAqXHJcbiAgICogICAgLy8gRnVuY3Rpb24gdGhhdCBnZXRzIHRoZSBnZXRVc2VyQ29udHJvbGxlZFByb3BlcnR5IG9mIGEgQmFsbCBhc3NvY2lhdGVkIHdpdGggdGhpcyBjb2x1bW4gdHlwZS5cclxuICAgKiAgICBnZXRVc2VyQ29udHJvbGxlZFByb3BlcnR5OiB7ZnVuY3Rpb24oYmFsbDogQmFsbCk6UHJvcGVydHkuPGJvb2xlYW4+fVxyXG4gICAqXHJcbiAgICogfVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjcmVhdGVEaXNwbGF5UHJvcGVydHksIGVkaXRDb25maWcgKSB7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7T2JqZWN0fG51bGx9XHJcbiAgICB0aGlzLmVkaXRDb25maWcgPSBlZGl0Q29uZmlnO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge2Z1bmN0aW9ufG51bGx9XHJcbiAgICB0aGlzLmNyZWF0ZURpc3BsYXlQcm9wZXJ0eSA9IGNyZWF0ZURpc3BsYXlQcm9wZXJ0eTtcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IEJhbGxWYWx1ZXNQYW5lbENvbHVtblR5cGVzID0gRW51bWVyYXRpb25EZXByZWNhdGVkLmJ5TWFwKCB7XHJcblxyXG4gIC8vIENvbHVtbiBvZiBCYWxsIEljb25zLiBGb3IgZGlzcGxheWluZyBwdXJwb3NlcyBvbmx5LlxyXG4gIEJBTExfSUNPTlM6IG5ldyBCYWxsVmFsdWVzUGFuZWxDb2x1bW5UeXBlKCBudWxsLCBudWxsICksXHJcblxyXG4gIC8vIENvbHVtbiBvZiBtYXNzIE51bWJlckRpc3BsYXlzLiBFZGl0YWJsZSBieSB0aGUgdXNlci5cclxuICBNQVNTOiBuZXcgQmFsbFZhbHVlc1BhbmVsQ29sdW1uVHlwZSggXy5wcm9wZXJ0eSggJ21hc3NQcm9wZXJ0eScgKSwge1xyXG4gICAgZWRpdFZhbHVlOiAoIGJhbGwsIG1hc3MgKSA9PiB7IGJhbGwubWFzc1Byb3BlcnR5LnZhbHVlID0gbWFzczsgfSxcclxuICAgIGdldEVkaXRpbmdSYW5nZTogKCkgPT4gQ29sbGlzaW9uTGFiQ29uc3RhbnRzLk1BU1NfUkFOR0UsXHJcbiAgICBlZGl0aW5nVW5pdDogQ29sbGlzaW9uTGFiU3RyaW5ncy51bml0cy5raWxvZ3JhbXMsXHJcbiAgICBnZXRVc2VyQ29udHJvbGxlZFByb3BlcnR5OiBfLnByb3BlcnR5KCAnbWFzc1VzZXJDb250cm9sbGVkUHJvcGVydHknIClcclxuICB9ICksXHJcblxyXG4gIC8vIENvbHVtbiBvZiBzbGlkZXJzIHRvIGNoYW5nZSB0aGUgTWFzcyBvZiBhIEJhbGwuIE9ubHkgc2hvd24gd2hlbiAnTW9yZSBEYXRhJyBpcyB1bmNoZWNrZWQuXHJcbiAgTUFTU19TTElERVJTOiBuZXcgQmFsbFZhbHVlc1BhbmVsQ29sdW1uVHlwZSggXy5wcm9wZXJ0eSggJ21hc3NQcm9wZXJ0eScgKSwge1xyXG4gICAgZWRpdFZhbHVlOiAoIGJhbGwsIG1hc3MgKSA9PiB7IGJhbGwubWFzc1Byb3BlcnR5LnZhbHVlID0gbWFzczsgfSxcclxuICAgIGdldEVkaXRpbmdSYW5nZTogKCkgPT4gQ29sbGlzaW9uTGFiQ29uc3RhbnRzLk1BU1NfUkFOR0UsXHJcbiAgICBlZGl0aW5nVW5pdDogQ29sbGlzaW9uTGFiU3RyaW5ncy51bml0cy5raWxvZ3JhbXMsXHJcbiAgICBnZXRVc2VyQ29udHJvbGxlZFByb3BlcnR5OiBfLnByb3BlcnR5KCAnbWFzc1VzZXJDb250cm9sbGVkUHJvcGVydHknIClcclxuICB9ICksXHJcblxyXG4gIC8vIENvbHVtbiBvZiB4LXBvc2l0aW9uIE51bWJlckRpc3BsYXlzLiBFZGl0YWJsZSBieSB0aGUgdXNlci5cclxuICBYX1BPU0lUSU9OOiBuZXcgQmFsbFZhbHVlc1BhbmVsQ29sdW1uVHlwZSggYmFsbCA9PiBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIGJhbGwucG9zaXRpb25Qcm9wZXJ0eSBdLCBfLnByb3BlcnR5KCAneCcgKSApLCB7XHJcbiAgICBlZGl0VmFsdWU6ICggYmFsbCwgeFBvc2l0aW9uICkgPT4gYmFsbC5zZXRYUG9zaXRpb24oIHhQb3NpdGlvbiApLFxyXG4gICAgZ2V0RWRpdGluZ1JhbmdlOiBiYWxsID0+IEJhbGxVdGlscy5nZXRLZXlwYWRYUG9zaXRpb25SYW5nZSggYmFsbCApLFxyXG4gICAgZWRpdGluZ1VuaXQ6IENvbGxpc2lvbkxhYlN0cmluZ3MudW5pdHMubWV0ZXJzLFxyXG4gICAgZ2V0VXNlckNvbnRyb2xsZWRQcm9wZXJ0eTogXy5wcm9wZXJ0eSggJ3hQb3NpdGlvblVzZXJDb250cm9sbGVkUHJvcGVydHknIClcclxuICB9ICksXHJcblxyXG4gIC8vIENvbHVtbiBvZiB5LXBvc2l0aW9uIE51bWJlckRpc3BsYXlzLiBFZGl0YWJsZSBieSB0aGUgdXNlciBhbmQgc2hvd24gZm9yIDJEIHNjcmVlbnMgb25seS5cclxuICBZX1BPU0lUSU9OOiBuZXcgQmFsbFZhbHVlc1BhbmVsQ29sdW1uVHlwZSggYmFsbCA9PiBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIGJhbGwucG9zaXRpb25Qcm9wZXJ0eSBdLCBfLnByb3BlcnR5KCAneScgKSApLCB7XHJcbiAgICBlZGl0VmFsdWU6ICggYmFsbCwgeVBvc2l0aW9uICkgPT4gYmFsbC5zZXRZUG9zaXRpb24oIHlQb3NpdGlvbiApLFxyXG4gICAgZ2V0RWRpdGluZ1JhbmdlOiBiYWxsID0+IEJhbGxVdGlscy5nZXRLZXlwYWRZUG9zaXRpb25SYW5nZSggYmFsbCApLFxyXG4gICAgZWRpdGluZ1VuaXQ6IENvbGxpc2lvbkxhYlN0cmluZ3MudW5pdHMubWV0ZXJzLFxyXG4gICAgZ2V0VXNlckNvbnRyb2xsZWRQcm9wZXJ0eTogXy5wcm9wZXJ0eSggJ3lQb3NpdGlvblVzZXJDb250cm9sbGVkUHJvcGVydHknIClcclxuICB9ICksXHJcblxyXG4gIC8vIENvbHVtbiBvZiB4LXZlbG9jaXR5IE51bWJlckRpc3BsYXlzLiBFZGl0YWJsZSBieSB0aGUgdXNlci5cclxuICBYX1ZFTE9DSVRZOiBuZXcgQmFsbFZhbHVlc1BhbmVsQ29sdW1uVHlwZSggYmFsbCA9PiBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIGJhbGwudmVsb2NpdHlQcm9wZXJ0eSBdLCBfLnByb3BlcnR5KCAneCcgKSApLCB7XHJcbiAgICBlZGl0VmFsdWU6ICggYmFsbCwgeFZlbG9jaXR5ICkgPT4gYmFsbC5zZXRYVmVsb2NpdHkoIHhWZWxvY2l0eSApLFxyXG4gICAgZ2V0RWRpdGluZ1JhbmdlOiAoKSA9PiBDb2xsaXNpb25MYWJDb25zdGFudHMuVkVMT0NJVFlfUkFOR0UsXHJcbiAgICBlZGl0aW5nVW5pdDogQ29sbGlzaW9uTGFiU3RyaW5ncy51bml0cy5tZXRlcnNQZXJTZWNvbmQsXHJcbiAgICBnZXRVc2VyQ29udHJvbGxlZFByb3BlcnR5OiBfLnByb3BlcnR5KCAneFZlbG9jaXR5VXNlckNvbnRyb2xsZWRQcm9wZXJ0eScgKVxyXG4gIH0gKSxcclxuXHJcbiAgLy8gQ29sdW1uIG9mIHktdmVsb2NpdHkgTnVtYmVyRGlzcGxheXMuIEVkaXRhYmxlIGJ5IHRoZSB1c2VyIGFuZCBzaG93biBmb3IgMkQgc2NyZWVucyBvbmx5LlxyXG4gIFlfVkVMT0NJVFk6IG5ldyBCYWxsVmFsdWVzUGFuZWxDb2x1bW5UeXBlKCBiYWxsID0+IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgYmFsbC52ZWxvY2l0eVByb3BlcnR5IF0sIF8ucHJvcGVydHkoICd5JyApICksIHtcclxuICAgIGVkaXRWYWx1ZTogKCBiYWxsLCB5VmVsb2NpdHkgKSA9PiBiYWxsLnNldFlWZWxvY2l0eSggeVZlbG9jaXR5ICksXHJcbiAgICBnZXRFZGl0aW5nUmFuZ2U6ICgpID0+IENvbGxpc2lvbkxhYkNvbnN0YW50cy5WRUxPQ0lUWV9SQU5HRSxcclxuICAgIGVkaXRpbmdVbml0OiBDb2xsaXNpb25MYWJTdHJpbmdzLnVuaXRzLm1ldGVyc1BlclNlY29uZCxcclxuICAgIGdldFVzZXJDb250cm9sbGVkUHJvcGVydHk6IF8ucHJvcGVydHkoICd5VmVsb2NpdHlVc2VyQ29udHJvbGxlZFByb3BlcnR5JyApXHJcbiAgfSApLFxyXG5cclxuICAvLyBDb2x1bW4gb2YgeC1tb21lbnR1bSBOdW1iZXJEaXNwbGF5cy4gTk9UIGVkaXRhYmxlIGJ5IHRoZSB1c2VyLlxyXG4gIFhfTU9NRU5UVU06IG5ldyBCYWxsVmFsdWVzUGFuZWxDb2x1bW5UeXBlKCBiYWxsID0+IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgYmFsbC5tb21lbnR1bVByb3BlcnR5IF0sIF8ucHJvcGVydHkoICd4JyApICksIG51bGwgKSxcclxuXHJcbiAgLy8gQ29sdW1uIG9mIHktbW9tZW50dW0gTnVtYmVyRGlzcGxheXMuIE5PVCBlZGl0YWJsZSBieSB0aGUgdXNlciBhbmQgc2hvd24gZm9yIDJEIHNjcmVlbnMgb25seS5cclxuICBZX01PTUVOVFVNOiBuZXcgQmFsbFZhbHVlc1BhbmVsQ29sdW1uVHlwZSggYmFsbCA9PiBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIGJhbGwubW9tZW50dW1Qcm9wZXJ0eSBdLCBfLnByb3BlcnR5KCAneScgKSApLCBudWxsIClcclxuXHJcbn0gKTtcclxuXHJcbmNvbGxpc2lvbkxhYi5yZWdpc3RlciggJ0JhbGxWYWx1ZXNQYW5lbENvbHVtblR5cGVzJywgQmFsbFZhbHVlc1BhbmVsQ29sdW1uVHlwZXMgKTtcclxuZXhwb3J0IGRlZmF1bHQgQmFsbFZhbHVlc1BhbmVsQ29sdW1uVHlwZXM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MscUJBQXFCLE1BQU0sbURBQW1EO0FBQ3JGLE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFDaEQsT0FBT0MsbUJBQW1CLE1BQU0sOEJBQThCO0FBQzlELE9BQU9DLHFCQUFxQixNQUFNLDZCQUE2QjtBQUMvRCxPQUFP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