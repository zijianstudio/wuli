// Copyright 2019-2023, University of Colorado Boulder

/**
 * ComponentVector is the model of a component vector. It is a vector (not a scalar) that describes the x or y
 * component of some parent vector.  For instance, if parent vector 'a' is <5, 6>, then its x component vector
 * is <5, 0>, and its y component vector is <0, 6>.
 *
 * ComponentVectors are not interactive.
 *
 * 'Is a' relationship with RootVector but adds the following functionality:
 *    - Updates its tail position/components based on a parent vector's changing tail/tip
 *    - Updates its tail position based on the component style Property
 *
 * Positioning for the x and y components are slightly different. Label content for component vectors are unique.
 *
 * @author Brandon Li
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import vectorAddition from '../../vectorAddition.js';
import VectorAdditionConstants from '../VectorAdditionConstants.js';
import ComponentVectorStyles from './ComponentVectorStyles.js';
import ComponentVectorTypes from './ComponentVectorTypes.js';
import RootVector from './RootVector.js';

// constants
const COMPONENT_VECTOR_SYMBOL = null; // Component vectors don't have a symbol

export default class ComponentVector extends RootVector {
  /**
   * @param {Vector} parentVector - the vector that this component vector is associated with
   * @param {EnumerationProperty.<ComponentVectorStyles>} componentStyleProperty
   * @param {Property.<Vector|null>} activeVectorProperty - which vector is active (selected)
   * @param {EnumerationProperty} componentType - type of component vector (x or y), see ComponentVectorTypes
   */
  constructor(parentVector, componentStyleProperty, activeVectorProperty, componentType) {
    assert && assert(componentStyleProperty instanceof EnumerationProperty && ComponentVectorStyles.enumeration.includes(componentStyleProperty.value), `invalid componentStyleProperty: ${componentStyleProperty}`);
    assert && assert(activeVectorProperty instanceof Property, `invalid activeVectorProperty: ${activeVectorProperty}`);
    assert && assert(ComponentVectorTypes.enumeration.includes(componentType), `invalid componentType: ${componentType}`);
    super(parentVector.tail, Vector2.ZERO, parentVector.vectorColorPalette, COMPONENT_VECTOR_SYMBOL);

    // @public (read-only) {Enumeration} componentType - type of component vector (x or y)
    this.componentType = componentType;

    // @public (read-only) {BooleanProperty} isOnGraphProperty - matches the parent. When the parent is on the graph,
    //                                                           the component is also on the graph (and vise versa).
    this.isOnGraphProperty = parentVector.isOnGraphProperty;

    // @public (read-only) {Vector} parentVector - the parent vector for this component vector
    this.parentVector = parentVector;

    // @public (read-only) {DerivedProperty.<boolean>} isParentVectorActiveProperty - determines if the parent
    // vector is active. Must be disposed on dispose.
    this.isParentVectorActiveProperty = new DerivedProperty([activeVectorProperty], activeVector => !!activeVector && activeVector === parentVector, {
      valueType: 'boolean'
    });

    // @private references to constructor args
    this.componentStyleProperty = componentStyleProperty;

    // @private offsets from axes in PROJECTION style.
    // These are managed by the VectorSet and set via setProjectionOffsets.
    // See https://github.com/phetsims/vector-addition/issues/225
    this.projectionXOffset = 0;
    this.projectionYOffset = 0;

    // Observe when the component style changes and/or when the parent vector's tip/tail changes. When
    // the parent changes or when the component style changes, the component vector also changes.
    // unmultilink is required on dispose.
    const updateComponentMultilink = Multilink.multilink([componentStyleProperty, parentVector.tailPositionProperty, parentVector.tipPositionProperty], () => this.updateComponent());

    // @private {function} disposeComponentVector - disposes the component vector. Called in the dispose method.
    this.disposeComponentVector = () => {
      Multilink.unmultilink(updateComponentMultilink);
      this.isParentVectorActiveProperty.dispose();
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposeComponentVector();
  }

  /**
   * Sets the offset from the x and y axis that is used for PROJECTION style.
   * See https://github.com/phetsims/vector-addition/issues/225.
   * @param projectionXOffset - x offset, in model coordinates
   * @param projectionYOffset - y offset, in model coordinates
   * @public
   */
  setProjectionOffsets(projectionXOffset, projectionYOffset) {
    this.projectionXOffset = projectionXOffset;
    this.projectionYOffset = projectionYOffset;
    this.updateComponent();
  }

  /**
   * Updates the component vector's tail/tip/components to match the component style and correct components to match
   * the parent vector's tail/tip.
   * @private
   */
  updateComponent() {
    const componentStyle = this.componentStyleProperty.value;
    const parentTail = this.parentVector.tailPositionProperty.value;
    const parentTip = this.parentVector.tipPositionProperty.value;
    if (this.componentType === ComponentVectorTypes.X_COMPONENT) {
      //----------------------------------------------------------------------------------------
      // Update the x component vector
      //----------------------------------------------------------------------------------------

      // Triangle and Parallelogram results in the same x component vector
      if (componentStyle === ComponentVectorStyles.TRIANGLE || componentStyle === ComponentVectorStyles.PARALLELOGRAM) {
        // Shared tail position as parent
        this.tail = parentTail;

        // Tip is at the parent's tip x and at the parent's tail y.
        this.setTipXY(parentTip.x, parentTail.y);
      } else if (componentStyle === ComponentVectorStyles.PROJECTION) {
        // From parent tailX to parent tipX. However its y value is 0 since it is on the x-axis
        this.setTailXY(parentTail.x, this.projectionYOffset);
        this.setTipXY(parentTip.x, this.projectionYOffset);
      }
    } else if (this.componentType === ComponentVectorTypes.Y_COMPONENT) {
      //----------------------------------------------------------------------------------------
      // Update the y component vector
      //----------------------------------------------------------------------------------------

      if (componentStyle === ComponentVectorStyles.TRIANGLE) {
        // Shared tip position as the parent
        this.tip = parentTip;

        // Tail is at the parent's tip x and at the parent's tail y.
        this.setTailXY(parentTip.x, parentTail.y);
      } else if (componentStyle === ComponentVectorStyles.PARALLELOGRAM) {
        // Shared tail position as parent
        this.tail = parentTail;

        // Tip is at the parents tailX and at the parents tipY
        this.setTipXY(parentTail.x, parentTip.y);
      } else if (componentStyle === ComponentVectorStyles.PROJECTION) {
        // Same tailY, however its x value is 0 since it is on the y-axis
        this.setTailXY(this.projectionXOffset, parentTail.y);
        this.setTipXY(this.projectionXOffset, parentTip.y);
      }
    }
  }

  /**
   * Gets the label content information to be displayed on the vector.
   * See RootVector.getLabelContent for details.
   * @override
   * @public
   * @param {boolean} valuesVisible - whether the values are visible
   * @returns {Object} see RootVector.getLabelContent
   */
  getLabelContent(valuesVisible) {
    // Get the component vector's value (a scalar, possibly negative)
    let value = this.componentType === ComponentVectorTypes.X_COMPONENT ? this.vectorComponents.x : this.vectorComponents.y;

    // Round the value
    value = Utils.toFixed(value, VectorAdditionConstants.VECTOR_VALUE_DECIMAL_PLACES);

    // Component vectors only show their values if and only if the values are visible and if the component isn't 0
    if (!valuesVisible || value === 0) {
      value = null;
    }
    return {
      coefficient: null,
      // component vectors never have a coefficient
      symbol: null,
      // component vectors never have a symbol
      includeAbsoluteValueBars: false,
      value: value
    };
  }

  /*------------------------------------------------------------------------------------*
   * Convenience methods (provides access to information about the private parentVector)
   *------------------------------------------------------------------------------------*/

  /**
   * Gets the mid-point of the component vector
   * @public
   * @returns {Vector2}
   */
  get midPoint() {
    return this.vectorComponents.timesScalar(0.5).plus(this.tail);
  }

  /**
   * Gets the parent vector's tail position
   * @public
   * @returns {Vector2}
   */
  get parentTail() {
    return this.parentVector.tail;
  }

  /**
   * Gets the parent vector's tip position
   * @public
   * @returns {Vector2}
   */
  get parentTip() {
    return this.parentVector.tip;
  }

  /**
   * Gets the parent vector's mid-point position
   * @public
   * @returns {Vector2}
   */
  get parentMidPoint() {
    return this.parentVector.vectorComponents.timesScalar(0.5).plus(this.parentVector.tail);
  }
}
vectorAddition.register('ComponentVector', ComponentVector);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJFbnVtZXJhdGlvblByb3BlcnR5IiwiTXVsdGlsaW5rIiwiUHJvcGVydHkiLCJVdGlscyIsIlZlY3RvcjIiLCJ2ZWN0b3JBZGRpdGlvbiIsIlZlY3RvckFkZGl0aW9uQ29uc3RhbnRzIiwiQ29tcG9uZW50VmVjdG9yU3R5bGVzIiwiQ29tcG9uZW50VmVjdG9yVHlwZXMiLCJSb290VmVjdG9yIiwiQ09NUE9ORU5UX1ZFQ1RPUl9TWU1CT0wiLCJDb21wb25lbnRWZWN0b3IiLCJjb25zdHJ1Y3RvciIsInBhcmVudFZlY3RvciIsImNvbXBvbmVudFN0eWxlUHJvcGVydHkiLCJhY3RpdmVWZWN0b3JQcm9wZXJ0eSIsImNvbXBvbmVudFR5cGUiLCJhc3NlcnQiLCJlbnVtZXJhdGlvbiIsImluY2x1ZGVzIiwidmFsdWUiLCJ0YWlsIiwiWkVSTyIsInZlY3RvckNvbG9yUGFsZXR0ZSIsImlzT25HcmFwaFByb3BlcnR5IiwiaXNQYXJlbnRWZWN0b3JBY3RpdmVQcm9wZXJ0eSIsImFjdGl2ZVZlY3RvciIsInZhbHVlVHlwZSIsInByb2plY3Rpb25YT2Zmc2V0IiwicHJvamVjdGlvbllPZmZzZXQiLCJ1cGRhdGVDb21wb25lbnRNdWx0aWxpbmsiLCJtdWx0aWxpbmsiLCJ0YWlsUG9zaXRpb25Qcm9wZXJ0eSIsInRpcFBvc2l0aW9uUHJvcGVydHkiLCJ1cGRhdGVDb21wb25lbnQiLCJkaXNwb3NlQ29tcG9uZW50VmVjdG9yIiwidW5tdWx0aWxpbmsiLCJkaXNwb3NlIiwic2V0UHJvamVjdGlvbk9mZnNldHMiLCJjb21wb25lbnRTdHlsZSIsInBhcmVudFRhaWwiLCJwYXJlbnRUaXAiLCJYX0NPTVBPTkVOVCIsIlRSSUFOR0xFIiwiUEFSQUxMRUxPR1JBTSIsInNldFRpcFhZIiwieCIsInkiLCJQUk9KRUNUSU9OIiwic2V0VGFpbFhZIiwiWV9DT01QT05FTlQiLCJ0aXAiLCJnZXRMYWJlbENvbnRlbnQiLCJ2YWx1ZXNWaXNpYmxlIiwidmVjdG9yQ29tcG9uZW50cyIsInRvRml4ZWQiLCJWRUNUT1JfVkFMVUVfREVDSU1BTF9QTEFDRVMiLCJjb2VmZmljaWVudCIsInN5bWJvbCIsImluY2x1ZGVBYnNvbHV0ZVZhbHVlQmFycyIsIm1pZFBvaW50IiwidGltZXNTY2FsYXIiLCJwbHVzIiwicGFyZW50TWlkUG9pbnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvbXBvbmVudFZlY3Rvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb21wb25lbnRWZWN0b3IgaXMgdGhlIG1vZGVsIG9mIGEgY29tcG9uZW50IHZlY3Rvci4gSXQgaXMgYSB2ZWN0b3IgKG5vdCBhIHNjYWxhcikgdGhhdCBkZXNjcmliZXMgdGhlIHggb3IgeVxyXG4gKiBjb21wb25lbnQgb2Ygc29tZSBwYXJlbnQgdmVjdG9yLiAgRm9yIGluc3RhbmNlLCBpZiBwYXJlbnQgdmVjdG9yICdhJyBpcyA8NSwgNj4sIHRoZW4gaXRzIHggY29tcG9uZW50IHZlY3RvclxyXG4gKiBpcyA8NSwgMD4sIGFuZCBpdHMgeSBjb21wb25lbnQgdmVjdG9yIGlzIDwwLCA2Pi5cclxuICpcclxuICogQ29tcG9uZW50VmVjdG9ycyBhcmUgbm90IGludGVyYWN0aXZlLlxyXG4gKlxyXG4gKiAnSXMgYScgcmVsYXRpb25zaGlwIHdpdGggUm9vdFZlY3RvciBidXQgYWRkcyB0aGUgZm9sbG93aW5nIGZ1bmN0aW9uYWxpdHk6XHJcbiAqICAgIC0gVXBkYXRlcyBpdHMgdGFpbCBwb3NpdGlvbi9jb21wb25lbnRzIGJhc2VkIG9uIGEgcGFyZW50IHZlY3RvcidzIGNoYW5naW5nIHRhaWwvdGlwXHJcbiAqICAgIC0gVXBkYXRlcyBpdHMgdGFpbCBwb3NpdGlvbiBiYXNlZCBvbiB0aGUgY29tcG9uZW50IHN0eWxlIFByb3BlcnR5XHJcbiAqXHJcbiAqIFBvc2l0aW9uaW5nIGZvciB0aGUgeCBhbmQgeSBjb21wb25lbnRzIGFyZSBzbGlnaHRseSBkaWZmZXJlbnQuIExhYmVsIGNvbnRlbnQgZm9yIGNvbXBvbmVudCB2ZWN0b3JzIGFyZSB1bmlxdWUuXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgdmVjdG9yQWRkaXRpb24gZnJvbSAnLi4vLi4vdmVjdG9yQWRkaXRpb24uanMnO1xyXG5pbXBvcnQgVmVjdG9yQWRkaXRpb25Db25zdGFudHMgZnJvbSAnLi4vVmVjdG9yQWRkaXRpb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgQ29tcG9uZW50VmVjdG9yU3R5bGVzIGZyb20gJy4vQ29tcG9uZW50VmVjdG9yU3R5bGVzLmpzJztcclxuaW1wb3J0IENvbXBvbmVudFZlY3RvclR5cGVzIGZyb20gJy4vQ29tcG9uZW50VmVjdG9yVHlwZXMuanMnO1xyXG5pbXBvcnQgUm9vdFZlY3RvciBmcm9tICcuL1Jvb3RWZWN0b3IuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IENPTVBPTkVOVF9WRUNUT1JfU1lNQk9MID0gbnVsbDsgLy8gQ29tcG9uZW50IHZlY3RvcnMgZG9uJ3QgaGF2ZSBhIHN5bWJvbFxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tcG9uZW50VmVjdG9yIGV4dGVuZHMgUm9vdFZlY3RvciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yfSBwYXJlbnRWZWN0b3IgLSB0aGUgdmVjdG9yIHRoYXQgdGhpcyBjb21wb25lbnQgdmVjdG9yIGlzIGFzc29jaWF0ZWQgd2l0aFxyXG4gICAqIEBwYXJhbSB7RW51bWVyYXRpb25Qcm9wZXJ0eS48Q29tcG9uZW50VmVjdG9yU3R5bGVzPn0gY29tcG9uZW50U3R5bGVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPFZlY3RvcnxudWxsPn0gYWN0aXZlVmVjdG9yUHJvcGVydHkgLSB3aGljaCB2ZWN0b3IgaXMgYWN0aXZlIChzZWxlY3RlZClcclxuICAgKiBAcGFyYW0ge0VudW1lcmF0aW9uUHJvcGVydHl9IGNvbXBvbmVudFR5cGUgLSB0eXBlIG9mIGNvbXBvbmVudCB2ZWN0b3IgKHggb3IgeSksIHNlZSBDb21wb25lbnRWZWN0b3JUeXBlc1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBwYXJlbnRWZWN0b3IsIGNvbXBvbmVudFN0eWxlUHJvcGVydHksIGFjdGl2ZVZlY3RvclByb3BlcnR5LCBjb21wb25lbnRUeXBlICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbXBvbmVudFN0eWxlUHJvcGVydHkgaW5zdGFuY2VvZiBFbnVtZXJhdGlvblByb3BlcnR5ICYmIENvbXBvbmVudFZlY3RvclN0eWxlcy5lbnVtZXJhdGlvbi5pbmNsdWRlcyggY29tcG9uZW50U3R5bGVQcm9wZXJ0eS52YWx1ZSApLFxyXG4gICAgICBgaW52YWxpZCBjb21wb25lbnRTdHlsZVByb3BlcnR5OiAke2NvbXBvbmVudFN0eWxlUHJvcGVydHl9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYWN0aXZlVmVjdG9yUHJvcGVydHkgaW5zdGFuY2VvZiBQcm9wZXJ0eSwgYGludmFsaWQgYWN0aXZlVmVjdG9yUHJvcGVydHk6ICR7YWN0aXZlVmVjdG9yUHJvcGVydHl9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQ29tcG9uZW50VmVjdG9yVHlwZXMuZW51bWVyYXRpb24uaW5jbHVkZXMoIGNvbXBvbmVudFR5cGUgKSwgYGludmFsaWQgY29tcG9uZW50VHlwZTogJHtjb21wb25lbnRUeXBlfWAgKTtcclxuXHJcbiAgICBzdXBlciggcGFyZW50VmVjdG9yLnRhaWwsIFZlY3RvcjIuWkVSTywgcGFyZW50VmVjdG9yLnZlY3RvckNvbG9yUGFsZXR0ZSwgQ09NUE9ORU5UX1ZFQ1RPUl9TWU1CT0wgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtFbnVtZXJhdGlvbn0gY29tcG9uZW50VHlwZSAtIHR5cGUgb2YgY29tcG9uZW50IHZlY3RvciAoeCBvciB5KVxyXG4gICAgdGhpcy5jb21wb25lbnRUeXBlID0gY29tcG9uZW50VHlwZTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtCb29sZWFuUHJvcGVydHl9IGlzT25HcmFwaFByb3BlcnR5IC0gbWF0Y2hlcyB0aGUgcGFyZW50LiBXaGVuIHRoZSBwYXJlbnQgaXMgb24gdGhlIGdyYXBoLFxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBjb21wb25lbnQgaXMgYWxzbyBvbiB0aGUgZ3JhcGggKGFuZCB2aXNlIHZlcnNhKS5cclxuICAgIHRoaXMuaXNPbkdyYXBoUHJvcGVydHkgPSBwYXJlbnRWZWN0b3IuaXNPbkdyYXBoUHJvcGVydHk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7VmVjdG9yfSBwYXJlbnRWZWN0b3IgLSB0aGUgcGFyZW50IHZlY3RvciBmb3IgdGhpcyBjb21wb25lbnQgdmVjdG9yXHJcbiAgICB0aGlzLnBhcmVudFZlY3RvciA9IHBhcmVudFZlY3RvcjtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtEZXJpdmVkUHJvcGVydHkuPGJvb2xlYW4+fSBpc1BhcmVudFZlY3RvckFjdGl2ZVByb3BlcnR5IC0gZGV0ZXJtaW5lcyBpZiB0aGUgcGFyZW50XHJcbiAgICAvLyB2ZWN0b3IgaXMgYWN0aXZlLiBNdXN0IGJlIGRpc3Bvc2VkIG9uIGRpc3Bvc2UuXHJcbiAgICB0aGlzLmlzUGFyZW50VmVjdG9yQWN0aXZlUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIGFjdGl2ZVZlY3RvclByb3BlcnR5IF0sXHJcbiAgICAgIGFjdGl2ZVZlY3RvciA9PiAoICEhYWN0aXZlVmVjdG9yICYmICggYWN0aXZlVmVjdG9yID09PSBwYXJlbnRWZWN0b3IgKSApLFxyXG4gICAgICB7IHZhbHVlVHlwZTogJ2Jvb2xlYW4nIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgcmVmZXJlbmNlcyB0byBjb25zdHJ1Y3RvciBhcmdzXHJcbiAgICB0aGlzLmNvbXBvbmVudFN0eWxlUHJvcGVydHkgPSBjb21wb25lbnRTdHlsZVByb3BlcnR5O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIG9mZnNldHMgZnJvbSBheGVzIGluIFBST0pFQ1RJT04gc3R5bGUuXHJcbiAgICAvLyBUaGVzZSBhcmUgbWFuYWdlZCBieSB0aGUgVmVjdG9yU2V0IGFuZCBzZXQgdmlhIHNldFByb2plY3Rpb25PZmZzZXRzLlxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy92ZWN0b3ItYWRkaXRpb24vaXNzdWVzLzIyNVxyXG4gICAgdGhpcy5wcm9qZWN0aW9uWE9mZnNldCA9IDA7XHJcbiAgICB0aGlzLnByb2plY3Rpb25ZT2Zmc2V0ID0gMDtcclxuXHJcbiAgICAvLyBPYnNlcnZlIHdoZW4gdGhlIGNvbXBvbmVudCBzdHlsZSBjaGFuZ2VzIGFuZC9vciB3aGVuIHRoZSBwYXJlbnQgdmVjdG9yJ3MgdGlwL3RhaWwgY2hhbmdlcy4gV2hlblxyXG4gICAgLy8gdGhlIHBhcmVudCBjaGFuZ2VzIG9yIHdoZW4gdGhlIGNvbXBvbmVudCBzdHlsZSBjaGFuZ2VzLCB0aGUgY29tcG9uZW50IHZlY3RvciBhbHNvIGNoYW5nZXMuXHJcbiAgICAvLyB1bm11bHRpbGluayBpcyByZXF1aXJlZCBvbiBkaXNwb3NlLlxyXG4gICAgY29uc3QgdXBkYXRlQ29tcG9uZW50TXVsdGlsaW5rID0gTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgWyBjb21wb25lbnRTdHlsZVByb3BlcnR5LCBwYXJlbnRWZWN0b3IudGFpbFBvc2l0aW9uUHJvcGVydHksIHBhcmVudFZlY3Rvci50aXBQb3NpdGlvblByb3BlcnR5IF0sXHJcbiAgICAgICgpID0+IHRoaXMudXBkYXRlQ29tcG9uZW50KClcclxuICAgICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Z1bmN0aW9ufSBkaXNwb3NlQ29tcG9uZW50VmVjdG9yIC0gZGlzcG9zZXMgdGhlIGNvbXBvbmVudCB2ZWN0b3IuIENhbGxlZCBpbiB0aGUgZGlzcG9zZSBtZXRob2QuXHJcbiAgICB0aGlzLmRpc3Bvc2VDb21wb25lbnRWZWN0b3IgPSAoKSA9PiB7XHJcbiAgICAgIE11bHRpbGluay51bm11bHRpbGluayggdXBkYXRlQ29tcG9uZW50TXVsdGlsaW5rICk7XHJcbiAgICAgIHRoaXMuaXNQYXJlbnRWZWN0b3JBY3RpdmVQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLmRpc3Bvc2VDb21wb25lbnRWZWN0b3IoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIG9mZnNldCBmcm9tIHRoZSB4IGFuZCB5IGF4aXMgdGhhdCBpcyB1c2VkIGZvciBQUk9KRUNUSU9OIHN0eWxlLlxyXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdmVjdG9yLWFkZGl0aW9uL2lzc3Vlcy8yMjUuXHJcbiAgICogQHBhcmFtIHByb2plY3Rpb25YT2Zmc2V0IC0geCBvZmZzZXQsIGluIG1vZGVsIGNvb3JkaW5hdGVzXHJcbiAgICogQHBhcmFtIHByb2plY3Rpb25ZT2Zmc2V0IC0geSBvZmZzZXQsIGluIG1vZGVsIGNvb3JkaW5hdGVzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFByb2plY3Rpb25PZmZzZXRzKCBwcm9qZWN0aW9uWE9mZnNldCwgcHJvamVjdGlvbllPZmZzZXQgKSB7XHJcbiAgICB0aGlzLnByb2plY3Rpb25YT2Zmc2V0ID0gcHJvamVjdGlvblhPZmZzZXQ7XHJcbiAgICB0aGlzLnByb2plY3Rpb25ZT2Zmc2V0ID0gcHJvamVjdGlvbllPZmZzZXQ7XHJcbiAgICB0aGlzLnVwZGF0ZUNvbXBvbmVudCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgY29tcG9uZW50IHZlY3RvcidzIHRhaWwvdGlwL2NvbXBvbmVudHMgdG8gbWF0Y2ggdGhlIGNvbXBvbmVudCBzdHlsZSBhbmQgY29ycmVjdCBjb21wb25lbnRzIHRvIG1hdGNoXHJcbiAgICogdGhlIHBhcmVudCB2ZWN0b3IncyB0YWlsL3RpcC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZUNvbXBvbmVudCgpIHtcclxuXHJcbiAgICBjb25zdCBjb21wb25lbnRTdHlsZSA9IHRoaXMuY29tcG9uZW50U3R5bGVQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGNvbnN0IHBhcmVudFRhaWwgPSB0aGlzLnBhcmVudFZlY3Rvci50YWlsUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuICAgIGNvbnN0IHBhcmVudFRpcCA9IHRoaXMucGFyZW50VmVjdG9yLnRpcFBvc2l0aW9uUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgaWYgKCB0aGlzLmNvbXBvbmVudFR5cGUgPT09IENvbXBvbmVudFZlY3RvclR5cGVzLlhfQ09NUE9ORU5UICkge1xyXG5cclxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgIC8vIFVwZGF0ZSB0aGUgeCBjb21wb25lbnQgdmVjdG9yXHJcbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgLy8gVHJpYW5nbGUgYW5kIFBhcmFsbGVsb2dyYW0gcmVzdWx0cyBpbiB0aGUgc2FtZSB4IGNvbXBvbmVudCB2ZWN0b3JcclxuICAgICAgaWYgKCBjb21wb25lbnRTdHlsZSA9PT0gQ29tcG9uZW50VmVjdG9yU3R5bGVzLlRSSUFOR0xFIHx8IGNvbXBvbmVudFN0eWxlID09PSBDb21wb25lbnRWZWN0b3JTdHlsZXMuUEFSQUxMRUxPR1JBTSApIHtcclxuXHJcbiAgICAgICAgLy8gU2hhcmVkIHRhaWwgcG9zaXRpb24gYXMgcGFyZW50XHJcbiAgICAgICAgdGhpcy50YWlsID0gcGFyZW50VGFpbDtcclxuXHJcbiAgICAgICAgLy8gVGlwIGlzIGF0IHRoZSBwYXJlbnQncyB0aXAgeCBhbmQgYXQgdGhlIHBhcmVudCdzIHRhaWwgeS5cclxuICAgICAgICB0aGlzLnNldFRpcFhZKCBwYXJlbnRUaXAueCwgcGFyZW50VGFpbC55ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGNvbXBvbmVudFN0eWxlID09PSBDb21wb25lbnRWZWN0b3JTdHlsZXMuUFJPSkVDVElPTiApIHtcclxuXHJcbiAgICAgICAgLy8gRnJvbSBwYXJlbnQgdGFpbFggdG8gcGFyZW50IHRpcFguIEhvd2V2ZXIgaXRzIHkgdmFsdWUgaXMgMCBzaW5jZSBpdCBpcyBvbiB0aGUgeC1heGlzXHJcbiAgICAgICAgdGhpcy5zZXRUYWlsWFkoIHBhcmVudFRhaWwueCwgdGhpcy5wcm9qZWN0aW9uWU9mZnNldCApO1xyXG4gICAgICAgIHRoaXMuc2V0VGlwWFkoIHBhcmVudFRpcC54LCB0aGlzLnByb2plY3Rpb25ZT2Zmc2V0ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5jb21wb25lbnRUeXBlID09PSBDb21wb25lbnRWZWN0b3JUeXBlcy5ZX0NPTVBPTkVOVCApIHtcclxuXHJcbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAvLyBVcGRhdGUgdGhlIHkgY29tcG9uZW50IHZlY3RvclxyXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgIGlmICggY29tcG9uZW50U3R5bGUgPT09IENvbXBvbmVudFZlY3RvclN0eWxlcy5UUklBTkdMRSApIHtcclxuXHJcbiAgICAgICAgLy8gU2hhcmVkIHRpcCBwb3NpdGlvbiBhcyB0aGUgcGFyZW50XHJcbiAgICAgICAgdGhpcy50aXAgPSBwYXJlbnRUaXA7XHJcblxyXG4gICAgICAgIC8vIFRhaWwgaXMgYXQgdGhlIHBhcmVudCdzIHRpcCB4IGFuZCBhdCB0aGUgcGFyZW50J3MgdGFpbCB5LlxyXG4gICAgICAgIHRoaXMuc2V0VGFpbFhZKCBwYXJlbnRUaXAueCwgcGFyZW50VGFpbC55ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGNvbXBvbmVudFN0eWxlID09PSBDb21wb25lbnRWZWN0b3JTdHlsZXMuUEFSQUxMRUxPR1JBTSApIHtcclxuXHJcbiAgICAgICAgLy8gU2hhcmVkIHRhaWwgcG9zaXRpb24gYXMgcGFyZW50XHJcbiAgICAgICAgdGhpcy50YWlsID0gcGFyZW50VGFpbDtcclxuXHJcbiAgICAgICAgLy8gVGlwIGlzIGF0IHRoZSBwYXJlbnRzIHRhaWxYIGFuZCBhdCB0aGUgcGFyZW50cyB0aXBZXHJcbiAgICAgICAgdGhpcy5zZXRUaXBYWSggcGFyZW50VGFpbC54LCBwYXJlbnRUaXAueSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBjb21wb25lbnRTdHlsZSA9PT0gQ29tcG9uZW50VmVjdG9yU3R5bGVzLlBST0pFQ1RJT04gKSB7XHJcblxyXG4gICAgICAgIC8vIFNhbWUgdGFpbFksIGhvd2V2ZXIgaXRzIHggdmFsdWUgaXMgMCBzaW5jZSBpdCBpcyBvbiB0aGUgeS1heGlzXHJcbiAgICAgICAgdGhpcy5zZXRUYWlsWFkoIHRoaXMucHJvamVjdGlvblhPZmZzZXQsIHBhcmVudFRhaWwueSApO1xyXG4gICAgICAgIHRoaXMuc2V0VGlwWFkoIHRoaXMucHJvamVjdGlvblhPZmZzZXQsIHBhcmVudFRpcC55ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGxhYmVsIGNvbnRlbnQgaW5mb3JtYXRpb24gdG8gYmUgZGlzcGxheWVkIG9uIHRoZSB2ZWN0b3IuXHJcbiAgICogU2VlIFJvb3RWZWN0b3IuZ2V0TGFiZWxDb250ZW50IGZvciBkZXRhaWxzLlxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZhbHVlc1Zpc2libGUgLSB3aGV0aGVyIHRoZSB2YWx1ZXMgYXJlIHZpc2libGVcclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBzZWUgUm9vdFZlY3Rvci5nZXRMYWJlbENvbnRlbnRcclxuICAgKi9cclxuICBnZXRMYWJlbENvbnRlbnQoIHZhbHVlc1Zpc2libGUgKSB7XHJcblxyXG4gICAgLy8gR2V0IHRoZSBjb21wb25lbnQgdmVjdG9yJ3MgdmFsdWUgKGEgc2NhbGFyLCBwb3NzaWJseSBuZWdhdGl2ZSlcclxuICAgIGxldCB2YWx1ZSA9ICggdGhpcy5jb21wb25lbnRUeXBlID09PSBDb21wb25lbnRWZWN0b3JUeXBlcy5YX0NPTVBPTkVOVCApID9cclxuICAgICAgICAgICAgICAgIHRoaXMudmVjdG9yQ29tcG9uZW50cy54IDpcclxuICAgICAgICAgICAgICAgIHRoaXMudmVjdG9yQ29tcG9uZW50cy55O1xyXG5cclxuICAgIC8vIFJvdW5kIHRoZSB2YWx1ZVxyXG4gICAgdmFsdWUgPSBVdGlscy50b0ZpeGVkKCB2YWx1ZSwgVmVjdG9yQWRkaXRpb25Db25zdGFudHMuVkVDVE9SX1ZBTFVFX0RFQ0lNQUxfUExBQ0VTICk7XHJcblxyXG4gICAgLy8gQ29tcG9uZW50IHZlY3RvcnMgb25seSBzaG93IHRoZWlyIHZhbHVlcyBpZiBhbmQgb25seSBpZiB0aGUgdmFsdWVzIGFyZSB2aXNpYmxlIGFuZCBpZiB0aGUgY29tcG9uZW50IGlzbid0IDBcclxuICAgIGlmICggIXZhbHVlc1Zpc2libGUgfHwgdmFsdWUgPT09IDAgKSB7XHJcbiAgICAgIHZhbHVlID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb2VmZmljaWVudDogbnVsbCwgLy8gY29tcG9uZW50IHZlY3RvcnMgbmV2ZXIgaGF2ZSBhIGNvZWZmaWNpZW50XHJcbiAgICAgIHN5bWJvbDogbnVsbCwgLy8gY29tcG9uZW50IHZlY3RvcnMgbmV2ZXIgaGF2ZSBhIHN5bWJvbFxyXG4gICAgICBpbmNsdWRlQWJzb2x1dGVWYWx1ZUJhcnM6IGZhbHNlLFxyXG4gICAgICB2YWx1ZTogdmFsdWVcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgKiBDb252ZW5pZW5jZSBtZXRob2RzIChwcm92aWRlcyBhY2Nlc3MgdG8gaW5mb3JtYXRpb24gYWJvdXQgdGhlIHByaXZhdGUgcGFyZW50VmVjdG9yKVxyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgbWlkLXBvaW50IG9mIHRoZSBjb21wb25lbnQgdmVjdG9yXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIGdldCBtaWRQb2ludCgpIHsgcmV0dXJuIHRoaXMudmVjdG9yQ29tcG9uZW50cy50aW1lc1NjYWxhciggMC41ICkucGx1cyggdGhpcy50YWlsICk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgcGFyZW50IHZlY3RvcidzIHRhaWwgcG9zaXRpb25cclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICovXHJcbiAgZ2V0IHBhcmVudFRhaWwoKSB7IHJldHVybiB0aGlzLnBhcmVudFZlY3Rvci50YWlsOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHBhcmVudCB2ZWN0b3IncyB0aXAgcG9zaXRpb25cclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICovXHJcbiAgZ2V0IHBhcmVudFRpcCgpIHsgcmV0dXJuIHRoaXMucGFyZW50VmVjdG9yLnRpcDsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBwYXJlbnQgdmVjdG9yJ3MgbWlkLXBvaW50IHBvc2l0aW9uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIGdldCBwYXJlbnRNaWRQb2ludCgpIHtcclxuICAgIHJldHVybiB0aGlzLnBhcmVudFZlY3Rvci52ZWN0b3JDb21wb25lbnRzLnRpbWVzU2NhbGFyKCAwLjUgKS5wbHVzKCB0aGlzLnBhcmVudFZlY3Rvci50YWlsICk7XHJcbiAgfVxyXG59XHJcblxyXG52ZWN0b3JBZGRpdGlv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