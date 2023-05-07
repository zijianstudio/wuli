// Copyright 2019-2023, University of Colorado Boulder

/**
 * VectorValuesNumberDisplay is a subclass of NumberDisplay for displaying a value that is associated with a Vector.
 * Instances appear in the 'Vector Values' toggle box.
 *
 * Displays a single vector attribute (i.e. magnitude etc.) of a single active vector that is on the specified graph.
 *
 * 'Is a' relationship with NumberDisplay but adds:
 *  - Functionality to change the active vector without having to recreate the number display;
 *    NumberDisplays don't support the ability to change the NumberProperty of the panel.
 *    Recreating new NumberDisplays every time the active vector changes is costly. This creates the number Property
 *    once and derives its value from the attribute of the active vector.
 *
 * This number display exists for the entire sim and is never disposed.
 *
 * @author Brandon Li
 */

import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import vectorAddition from '../../vectorAddition.js';
import Graph from '../model/Graph.js';
import Vector from '../model/Vector.js';
import VectorAdditionConstants from '../VectorAdditionConstants.js';
import VectorQuantities from './VectorQuantities.js';
export default class VectorValuesNumberDisplay extends NumberDisplay {
  /**
   * @param {Graph} graph - the graph that contains the vectors to display
   * @param {VectorQuantities} vectorQuantity - the vector quantity to display
   */
  constructor(graph, vectorQuantity) {
    assert && assert(graph instanceof Graph, `invalid graph: ${graph}`);
    assert && assert(VectorQuantities.enumeration.includes(vectorQuantity), `invalid vectorQuantity: ${vectorQuantity}`);

    //----------------------------------------------------------------------------------------
    // Calculate the range
    //----------------------------------------------------------------------------------------

    // Convenience variables. These are constant for the entire sim.
    const maxMagnitude = graph.graphModelBounds.rightTop.distance(graph.graphModelBounds.leftBottom);
    const graphWidth = graph.graphModelBounds.width;
    const graphHeight = graph.graphModelBounds.height;
    let numberDisplayRange;
    if (vectorQuantity === VectorQuantities.ANGLE) {
      numberDisplayRange = VectorAdditionConstants.ANGLE_RANGE;
    } else if (vectorQuantity === VectorQuantities.MAGNITUDE) {
      numberDisplayRange = new Range(0, maxMagnitude);
    } else if (vectorQuantity === VectorQuantities.X_COMPONENT) {
      numberDisplayRange = new Range(-graphWidth, graphWidth);
    } else if (vectorQuantity === VectorQuantities.Y_COMPONENT) {
      numberDisplayRange = new Range(-graphHeight, graphHeight);
    }

    //----------------------------------------------------------------------------------------
    // Create the number display
    //----------------------------------------------------------------------------------------

    // {Property.<number|null>} the value displayed by NumberDisplay, null if there is no active vector
    const numberDisplayProperty = new Property(null, {
      isValidValue: value => typeof value === 'number' || value === null
    });
    super(numberDisplayProperty, numberDisplayRange, {
      decimalPlaces: VectorAdditionConstants.VECTOR_VALUE_DECIMAL_PLACES
    });

    // @private {VectorQuantities} (final)
    this.vectorQuantity = vectorQuantity;

    //----------------------------------------------------------------------------------------
    // Create links
    //----------------------------------------------------------------------------------------

    // Create function to update the number display value
    const activeVectorComponentsListener = () => {
      numberDisplayProperty.value = this.getNumberDisplayValue(graph.activeVectorProperty.value);
    };

    // Observe when the graph's active vector changes and update the vectorComponents link.
    // unlink is unnecessary, exists for the lifetime of the sim.
    graph.activeVectorProperty.link((activeVector, oldActiveVector) => {
      // unlink the previous link if the old active vector exists
      oldActiveVector && oldActiveVector.vectorComponentsProperty.unlink(activeVectorComponentsListener);

      // Observe when the active vector changes and update the number display value if and only if the active vector
      // exists. unlink is required when active vector changes.
      activeVector && activeVector.vectorComponentsProperty.link(activeVectorComponentsListener);
    });
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert(false, 'VectorValuesNumberDisplay is not intended to be disposed');
  }

  /**
   * Gets the value to display based on the attribute display type and a vector
   * @private
   * @param {Vector|null} activeVector - vector to derive the NumberDisplay value from
   * @returns {number|null} value to display
   */
  getNumberDisplayValue(activeVector) {
    assert && assert(activeVector instanceof Vector || activeVector === null, `invalid activeVector: ${activeVector}`);
    if (!activeVector) {
      return null;
    }
    if (this.vectorQuantity === VectorQuantities.MAGNITUDE) {
      return activeVector.magnitude;
    } else if (this.vectorQuantity === VectorQuantities.ANGLE) {
      return activeVector.angleDegrees;
    } else if (this.vectorQuantity === VectorQuantities.X_COMPONENT) {
      return activeVector.xComponent;
    } else if (this.vectorQuantity === VectorQuantities.Y_COMPONENT) {
      return activeVector.yComponent;
    }
    throw new Error('invalid case for getNumberDisplayValue');
  }
}
vectorAddition.register('VectorValuesNumberDisplay', VectorValuesNumberDisplay);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlJhbmdlIiwiTnVtYmVyRGlzcGxheSIsInZlY3RvckFkZGl0aW9uIiwiR3JhcGgiLCJWZWN0b3IiLCJWZWN0b3JBZGRpdGlvbkNvbnN0YW50cyIsIlZlY3RvclF1YW50aXRpZXMiLCJWZWN0b3JWYWx1ZXNOdW1iZXJEaXNwbGF5IiwiY29uc3RydWN0b3IiLCJncmFwaCIsInZlY3RvclF1YW50aXR5IiwiYXNzZXJ0IiwiZW51bWVyYXRpb24iLCJpbmNsdWRlcyIsIm1heE1hZ25pdHVkZSIsImdyYXBoTW9kZWxCb3VuZHMiLCJyaWdodFRvcCIsImRpc3RhbmNlIiwibGVmdEJvdHRvbSIsImdyYXBoV2lkdGgiLCJ3aWR0aCIsImdyYXBoSGVpZ2h0IiwiaGVpZ2h0IiwibnVtYmVyRGlzcGxheVJhbmdlIiwiQU5HTEUiLCJBTkdMRV9SQU5HRSIsIk1BR05JVFVERSIsIlhfQ09NUE9ORU5UIiwiWV9DT01QT05FTlQiLCJudW1iZXJEaXNwbGF5UHJvcGVydHkiLCJpc1ZhbGlkVmFsdWUiLCJ2YWx1ZSIsImRlY2ltYWxQbGFjZXMiLCJWRUNUT1JfVkFMVUVfREVDSU1BTF9QTEFDRVMiLCJhY3RpdmVWZWN0b3JDb21wb25lbnRzTGlzdGVuZXIiLCJnZXROdW1iZXJEaXNwbGF5VmFsdWUiLCJhY3RpdmVWZWN0b3JQcm9wZXJ0eSIsImxpbmsiLCJhY3RpdmVWZWN0b3IiLCJvbGRBY3RpdmVWZWN0b3IiLCJ2ZWN0b3JDb21wb25lbnRzUHJvcGVydHkiLCJ1bmxpbmsiLCJkaXNwb3NlIiwibWFnbml0dWRlIiwiYW5nbGVEZWdyZWVzIiwieENvbXBvbmVudCIsInlDb21wb25lbnQiLCJFcnJvciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVmVjdG9yVmFsdWVzTnVtYmVyRGlzcGxheS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWZWN0b3JWYWx1ZXNOdW1iZXJEaXNwbGF5IGlzIGEgc3ViY2xhc3Mgb2YgTnVtYmVyRGlzcGxheSBmb3IgZGlzcGxheWluZyBhIHZhbHVlIHRoYXQgaXMgYXNzb2NpYXRlZCB3aXRoIGEgVmVjdG9yLlxyXG4gKiBJbnN0YW5jZXMgYXBwZWFyIGluIHRoZSAnVmVjdG9yIFZhbHVlcycgdG9nZ2xlIGJveC5cclxuICpcclxuICogRGlzcGxheXMgYSBzaW5nbGUgdmVjdG9yIGF0dHJpYnV0ZSAoaS5lLiBtYWduaXR1ZGUgZXRjLikgb2YgYSBzaW5nbGUgYWN0aXZlIHZlY3RvciB0aGF0IGlzIG9uIHRoZSBzcGVjaWZpZWQgZ3JhcGguXHJcbiAqXHJcbiAqICdJcyBhJyByZWxhdGlvbnNoaXAgd2l0aCBOdW1iZXJEaXNwbGF5IGJ1dCBhZGRzOlxyXG4gKiAgLSBGdW5jdGlvbmFsaXR5IHRvIGNoYW5nZSB0aGUgYWN0aXZlIHZlY3RvciB3aXRob3V0IGhhdmluZyB0byByZWNyZWF0ZSB0aGUgbnVtYmVyIGRpc3BsYXk7XHJcbiAqICAgIE51bWJlckRpc3BsYXlzIGRvbid0IHN1cHBvcnQgdGhlIGFiaWxpdHkgdG8gY2hhbmdlIHRoZSBOdW1iZXJQcm9wZXJ0eSBvZiB0aGUgcGFuZWwuXHJcbiAqICAgIFJlY3JlYXRpbmcgbmV3IE51bWJlckRpc3BsYXlzIGV2ZXJ5IHRpbWUgdGhlIGFjdGl2ZSB2ZWN0b3IgY2hhbmdlcyBpcyBjb3N0bHkuIFRoaXMgY3JlYXRlcyB0aGUgbnVtYmVyIFByb3BlcnR5XHJcbiAqICAgIG9uY2UgYW5kIGRlcml2ZXMgaXRzIHZhbHVlIGZyb20gdGhlIGF0dHJpYnV0ZSBvZiB0aGUgYWN0aXZlIHZlY3Rvci5cclxuICpcclxuICogVGhpcyBudW1iZXIgZGlzcGxheSBleGlzdHMgZm9yIHRoZSBlbnRpcmUgc2ltIGFuZCBpcyBuZXZlciBkaXNwb3NlZC5cclxuICpcclxuICogQGF1dGhvciBCcmFuZG9uIExpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IE51bWJlckRpc3BsYXkgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL051bWJlckRpc3BsYXkuanMnO1xyXG5pbXBvcnQgdmVjdG9yQWRkaXRpb24gZnJvbSAnLi4vLi4vdmVjdG9yQWRkaXRpb24uanMnO1xyXG5pbXBvcnQgR3JhcGggZnJvbSAnLi4vbW9kZWwvR3JhcGguanMnO1xyXG5pbXBvcnQgVmVjdG9yIGZyb20gJy4uL21vZGVsL1ZlY3Rvci5qcyc7XHJcbmltcG9ydCBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cyBmcm9tICcuLi9WZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBWZWN0b3JRdWFudGl0aWVzIGZyb20gJy4vVmVjdG9yUXVhbnRpdGllcy5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWZWN0b3JWYWx1ZXNOdW1iZXJEaXNwbGF5IGV4dGVuZHMgTnVtYmVyRGlzcGxheSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7R3JhcGh9IGdyYXBoIC0gdGhlIGdyYXBoIHRoYXQgY29udGFpbnMgdGhlIHZlY3RvcnMgdG8gZGlzcGxheVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yUXVhbnRpdGllc30gdmVjdG9yUXVhbnRpdHkgLSB0aGUgdmVjdG9yIHF1YW50aXR5IHRvIGRpc3BsYXlcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZ3JhcGgsIHZlY3RvclF1YW50aXR5ICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGdyYXBoIGluc3RhbmNlb2YgR3JhcGgsIGBpbnZhbGlkIGdyYXBoOiAke2dyYXBofWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIFZlY3RvclF1YW50aXRpZXMuZW51bWVyYXRpb24uaW5jbHVkZXMoIHZlY3RvclF1YW50aXR5ICksIGBpbnZhbGlkIHZlY3RvclF1YW50aXR5OiAke3ZlY3RvclF1YW50aXR5fWAgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIENhbGN1bGF0ZSB0aGUgcmFuZ2VcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIENvbnZlbmllbmNlIHZhcmlhYmxlcy4gVGhlc2UgYXJlIGNvbnN0YW50IGZvciB0aGUgZW50aXJlIHNpbS5cclxuICAgIGNvbnN0IG1heE1hZ25pdHVkZSA9IGdyYXBoLmdyYXBoTW9kZWxCb3VuZHMucmlnaHRUb3AuZGlzdGFuY2UoIGdyYXBoLmdyYXBoTW9kZWxCb3VuZHMubGVmdEJvdHRvbSApO1xyXG4gICAgY29uc3QgZ3JhcGhXaWR0aCA9IGdyYXBoLmdyYXBoTW9kZWxCb3VuZHMud2lkdGg7XHJcbiAgICBjb25zdCBncmFwaEhlaWdodCA9IGdyYXBoLmdyYXBoTW9kZWxCb3VuZHMuaGVpZ2h0O1xyXG5cclxuICAgIGxldCBudW1iZXJEaXNwbGF5UmFuZ2U7XHJcblxyXG4gICAgaWYgKCB2ZWN0b3JRdWFudGl0eSA9PT0gVmVjdG9yUXVhbnRpdGllcy5BTkdMRSApIHtcclxuICAgICAgbnVtYmVyRGlzcGxheVJhbmdlID0gVmVjdG9yQWRkaXRpb25Db25zdGFudHMuQU5HTEVfUkFOR0U7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdmVjdG9yUXVhbnRpdHkgPT09IFZlY3RvclF1YW50aXRpZXMuTUFHTklUVURFICkge1xyXG4gICAgICBudW1iZXJEaXNwbGF5UmFuZ2UgPSBuZXcgUmFuZ2UoIDAsIG1heE1hZ25pdHVkZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHZlY3RvclF1YW50aXR5ID09PSBWZWN0b3JRdWFudGl0aWVzLlhfQ09NUE9ORU5UICkge1xyXG4gICAgICBudW1iZXJEaXNwbGF5UmFuZ2UgPSBuZXcgUmFuZ2UoIC1ncmFwaFdpZHRoLCBncmFwaFdpZHRoICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdmVjdG9yUXVhbnRpdHkgPT09IFZlY3RvclF1YW50aXRpZXMuWV9DT01QT05FTlQgKSB7XHJcbiAgICAgIG51bWJlckRpc3BsYXlSYW5nZSA9IG5ldyBSYW5nZSggLWdyYXBoSGVpZ2h0LCBncmFwaEhlaWdodCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gQ3JlYXRlIHRoZSBudW1iZXIgZGlzcGxheVxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8ge1Byb3BlcnR5LjxudW1iZXJ8bnVsbD59IHRoZSB2YWx1ZSBkaXNwbGF5ZWQgYnkgTnVtYmVyRGlzcGxheSwgbnVsbCBpZiB0aGVyZSBpcyBubyBhY3RpdmUgdmVjdG9yXHJcbiAgICBjb25zdCBudW1iZXJEaXNwbGF5UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwsIHtcclxuICAgICAgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiAoIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgfHwgdmFsdWUgPT09IG51bGwgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBudW1iZXJEaXNwbGF5UHJvcGVydHksIG51bWJlckRpc3BsYXlSYW5nZSwge1xyXG4gICAgICBkZWNpbWFsUGxhY2VzOiBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5WRUNUT1JfVkFMVUVfREVDSU1BTF9QTEFDRVNcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VmVjdG9yUXVhbnRpdGllc30gKGZpbmFsKVxyXG4gICAgdGhpcy52ZWN0b3JRdWFudGl0eSA9IHZlY3RvclF1YW50aXR5O1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gQ3JlYXRlIGxpbmtzXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBDcmVhdGUgZnVuY3Rpb24gdG8gdXBkYXRlIHRoZSBudW1iZXIgZGlzcGxheSB2YWx1ZVxyXG4gICAgY29uc3QgYWN0aXZlVmVjdG9yQ29tcG9uZW50c0xpc3RlbmVyID0gKCkgPT4ge1xyXG4gICAgICBudW1iZXJEaXNwbGF5UHJvcGVydHkudmFsdWUgPSB0aGlzLmdldE51bWJlckRpc3BsYXlWYWx1ZSggZ3JhcGguYWN0aXZlVmVjdG9yUHJvcGVydHkudmFsdWUgKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gT2JzZXJ2ZSB3aGVuIHRoZSBncmFwaCdzIGFjdGl2ZSB2ZWN0b3IgY2hhbmdlcyBhbmQgdXBkYXRlIHRoZSB2ZWN0b3JDb21wb25lbnRzIGxpbmsuXHJcbiAgICAvLyB1bmxpbmsgaXMgdW5uZWNlc3NhcnksIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0uXHJcbiAgICBncmFwaC5hY3RpdmVWZWN0b3JQcm9wZXJ0eS5saW5rKCAoIGFjdGl2ZVZlY3Rvciwgb2xkQWN0aXZlVmVjdG9yICkgPT4ge1xyXG5cclxuICAgICAgLy8gdW5saW5rIHRoZSBwcmV2aW91cyBsaW5rIGlmIHRoZSBvbGQgYWN0aXZlIHZlY3RvciBleGlzdHNcclxuICAgICAgb2xkQWN0aXZlVmVjdG9yICYmIG9sZEFjdGl2ZVZlY3Rvci52ZWN0b3JDb21wb25lbnRzUHJvcGVydHkudW5saW5rKCBhY3RpdmVWZWN0b3JDb21wb25lbnRzTGlzdGVuZXIgKTtcclxuXHJcbiAgICAgIC8vIE9ic2VydmUgd2hlbiB0aGUgYWN0aXZlIHZlY3RvciBjaGFuZ2VzIGFuZCB1cGRhdGUgdGhlIG51bWJlciBkaXNwbGF5IHZhbHVlIGlmIGFuZCBvbmx5IGlmIHRoZSBhY3RpdmUgdmVjdG9yXHJcbiAgICAgIC8vIGV4aXN0cy4gdW5saW5rIGlzIHJlcXVpcmVkIHdoZW4gYWN0aXZlIHZlY3RvciBjaGFuZ2VzLlxyXG4gICAgICBhY3RpdmVWZWN0b3IgJiYgYWN0aXZlVmVjdG9yLnZlY3RvckNvbXBvbmVudHNQcm9wZXJ0eS5saW5rKCBhY3RpdmVWZWN0b3JDb21wb25lbnRzTGlzdGVuZXIgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdWZWN0b3JWYWx1ZXNOdW1iZXJEaXNwbGF5IGlzIG5vdCBpbnRlbmRlZCB0byBiZSBkaXNwb3NlZCcgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHZhbHVlIHRvIGRpc3BsYXkgYmFzZWQgb24gdGhlIGF0dHJpYnV0ZSBkaXNwbGF5IHR5cGUgYW5kIGEgdmVjdG9yXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcGFyYW0ge1ZlY3RvcnxudWxsfSBhY3RpdmVWZWN0b3IgLSB2ZWN0b3IgdG8gZGVyaXZlIHRoZSBOdW1iZXJEaXNwbGF5IHZhbHVlIGZyb21cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfG51bGx9IHZhbHVlIHRvIGRpc3BsYXlcclxuICAgKi9cclxuICBnZXROdW1iZXJEaXNwbGF5VmFsdWUoIGFjdGl2ZVZlY3RvciApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhY3RpdmVWZWN0b3IgaW5zdGFuY2VvZiBWZWN0b3IgfHwgYWN0aXZlVmVjdG9yID09PSBudWxsLCBgaW52YWxpZCBhY3RpdmVWZWN0b3I6ICR7YWN0aXZlVmVjdG9yfWAgKTtcclxuXHJcbiAgICBpZiAoICFhY3RpdmVWZWN0b3IgKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy52ZWN0b3JRdWFudGl0eSA9PT0gVmVjdG9yUXVhbnRpdGllcy5NQUdOSVRVREUgKSB7XHJcbiAgICAgIHJldHVybiBhY3RpdmVWZWN0b3IubWFnbml0dWRlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMudmVjdG9yUXVhbnRpdHkgPT09IFZlY3RvclF1YW50aXRpZXMuQU5HTEUgKSB7XHJcbiAgICAgIHJldHVybiBhY3RpdmVWZWN0b3IuYW5nbGVEZWdyZWVzO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMudmVjdG9yUXVhbnRpdHkgPT09IFZlY3RvclF1YW50aXRpZXMuWF9DT01QT05FTlQgKSB7XHJcbiAgICAgIHJldHVybiBhY3RpdmVWZWN0b3IueENvbXBvbmVudDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLnZlY3RvclF1YW50aXR5ID09PSBWZWN0b3JRdWFudGl0aWVzLllfQ09NUE9ORU5UICkge1xyXG4gICAgICByZXR1cm4gYWN0aXZlVmVjdG9yLnlDb21wb25lbnQ7XHJcbiAgICB9XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdpbnZhbGlkIGNhc2UgZm9yIGdldE51bWJlckRpc3BsYXlWYWx1ZScgKTtcclxuICB9XHJcbn1cclxuXHJcbnZlY3RvckFkZGl0aW9uLnJlZ2lzdGVyKCAnVmVjdG9yVmFsdWVzTnVtYmVyRGlzcGxheScsIFZlY3RvclZhbHVlc051bWJlckRpc3BsYXkgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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