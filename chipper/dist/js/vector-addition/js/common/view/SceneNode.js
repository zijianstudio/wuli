// Copyright 2019-2023, University of Colorado Boulder

/**
 * View for a scene node. Scene nodes allow screens to have multiple 'scenes'. For instance, 'Explore 2D' has a polar
 * and a Cartesian 'scene' and 'Explore 1D' has a horizontal and a vertical 'scene'.
 *
 * ## A 'Scene Node' contains:
 *  - a single GraphNode
 *  - a single VectorValuesToggleBox
 *  - Handle z-layering of all vector types (see https://github.com/phetsims/vector-addition/issues/19)
 *  - An option to include an EraserButton
 *  - A method to add a VectorCreatorPanel
 *
 * ## API
 *  - Not required to tell the Scene Node to create the SumVectorNodes and their Components (does this automatically
 *    for each VectorSet in the Graph)
 *  - However, it is required to 'tell' the Scene Node when other Vectors are created (see registerVector()). Once this
 *    is called, the Vector Nodes/Components are made and deleted once the Vector is removed.
 *
 * NOTE: SceneNode will not toggle its visibility based on when the GraphOrientation or the CoordinateSnapMode
 *       changes. This must be done externally.
 *
 * @author Brandon Li
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import merge from '../../../../phet-core/js/merge.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import { Node, SceneryEvent } from '../../../../scenery/js/imports.js';
import vectorAddition from '../../vectorAddition.js';
import Graph from '../model/Graph.js';
import Vector from '../model/Vector.js';
import VectorSet from '../model/VectorSet.js';
import GraphNode from './GraphNode.js';
import VectorAdditionViewProperties from './VectorAdditionViewProperties.js';
import VectorCreatorPanel from './VectorCreatorPanel.js';
import VectorSetNode from './VectorSetNode.js';
import VectorValuesToggleBox from './VectorValuesToggleBox.js';
export default class SceneNode extends Node {
  /**
   * @param {Graph} graph
   * @param {VectorAdditionViewProperties} viewProperties
   * @param {EnumerationProperty.<ComponentVectorStyles>} componentStyleProperty
   * @param {Object} [options] - all options are specific to this class, not passed to superclass
   */
  constructor(graph, viewProperties, componentStyleProperty, options) {
    assert && assert(graph instanceof Graph, `invalid graph: ${graph}`);
    assert && assert(viewProperties instanceof VectorAdditionViewProperties, `invalid viewProperties: ${viewProperties}`);
    assert && assert(componentStyleProperty instanceof EnumerationProperty, `invalid componentStyleProperty: ${componentStyleProperty}`);
    assert && assert(!options || Object.getPrototypeOf(options) === Object.prototype, `Extra prototype on options: ${options}`);

    //========================================================================================

    options = merge({
      // all options are specific to this class
      includeEraser: true,
      // {boolean} Indicates if an EraserButton should be included

      // {Object} Options passed to the VectorValuesToggleBox
      vectorValuesToggleBoxOptions: {
        expandedProperty: viewProperties.vectorValuesExpandedProperty,
        centerX: graph.graphViewBounds.centerX,
        top: 35 // determined empirically
      }
    }, options);
    super();

    //========================================================================================

    // Create one and only GraphNode
    const graphNode = new GraphNode(graph, viewProperties.gridVisibleProperty);

    // Create the one and only 'Vector Values' toggle box
    const vectorValuesToggleBox = new VectorValuesToggleBox(graph, options.vectorValuesToggleBoxOptions);

    //----------------------------------------------------------------------------------------
    // Create containers for each and every type of Vector to handle z-layering of all vector types.

    // @private {Node} parent for all VectorSetNodes
    this.vectorSetNodesParent = new Node();

    // Add the children in the correct z-order
    this.setChildren([graphNode, vectorValuesToggleBox, this.vectorSetNodesParent]);

    // Add an eraser button if necessary
    if (options.includeEraser) {
      const eraserButton = new EraserButton({
        listener: () => {
          this.interruptSubtreeInput(); // cancel all interactions for the scene
          graph.erase();
        },
        right: graph.graphViewBounds.maxX,
        top: graph.graphViewBounds.maxY + 15,
        touchAreaXDilation: 7,
        touchAreaYDilation: 7
      });
      this.addChild(eraserButton);
      eraserButton.moveToBack();

      // Disable the eraser button when the number of vectors on the graph is zero, that is, when all vector sets
      // contain no vectors. This is a bit more complicated than it should be, but it was added late in the
      // development process.
      // unmultilink is unnecessary, exists for the lifetime of the sim.
      const lengthProperties = _.map(graph.vectorSets, vectorSet => vectorSet.vectors.lengthProperty);
      Multilink.multilink(lengthProperties, () => {
        const numberOfVectors = _.sumBy(lengthProperties, lengthProperty => lengthProperty.value);
        eraserButton.enabled = numberOfVectors !== 0;
      });
    }

    // private {VectorSetNode[]} a layer for each VectorSet
    this.vectorSetNodes = [];
    graph.vectorSets.forEach(vectorSet => {
      const vectorSetNode = new VectorSetNode(graph, vectorSet, viewProperties.valuesVisibleProperty, viewProperties.anglesVisibleProperty, componentStyleProperty);
      this.vectorSetNodesParent.addChild(vectorSetNode);
      this.vectorSetNodes.push(vectorSetNode);
    });

    // @protected for layout in subclasses
    this.vectorValuesToggleBox = vectorValuesToggleBox;

    // @private
    this.vectorSets = graph.vectorSets;
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert(false, 'SceneNode is not intended to be disposed');
  }

  /**
   * Gets the VectorSetNode associated with a VectorSet.
   * @private
   * @param {VectorSet} vectorSet
   * @returns {VectorSetNode}
   */
  getVectorSetNode(vectorSet) {
    const index = this.vectorSets.indexOf(vectorSet);
    assert && assert(index !== -1, `vectorSet not found: ${vectorSet}`);
    return this.vectorSetNodes[index];
  }

  /**
   * Registers a Vector, delegates to VectorSetNode.
   * @public
   * @param {Vector} vector - the vector model
   * @param {VectorSet} vectorSet - the VectorSet the vector belongs to
   * @param {SceneryEvent} [forwardingEvent] - see VectorSetNode
   */
  registerVector(vector, vectorSet, forwardingEvent) {
    assert && assert(vector instanceof Vector, `invalid vector: ${vector}`);
    assert && assert(vectorSet instanceof VectorSet, `invalid vectorSet: ${vectorSet}`);
    assert && assert(!forwardingEvent || forwardingEvent instanceof SceneryEvent, `invalid forwardingEvent: ${forwardingEvent}`);

    // Delegate registration to the VectorSetNode
    this.getVectorSetNode(vectorSet).registerVector(vector, forwardingEvent);
  }

  /**
   * Adds a base vector to the scene.  Delegates to VectorSetNode.
   * @protected
   * @param {VectorSet} vectorSet
   * @param {BaseVector} baseVector
   * @param {Property.<boolean>} baseVectorsVisibleProperty
   */
  addBaseVector(vectorSet, baseVector, baseVectorsVisibleProperty) {
    this.getVectorSetNode(vectorSet).addBaseVector(baseVector, baseVectorsVisibleProperty);
  }

  /**
   * Adds a VectorCreatorPanel to the scene.
   * @public
   * @param {VectorCreatorPanel} vectorCreatorPanel
   */
  addVectorCreatorPanel(vectorCreatorPanel) {
    assert && assert(vectorCreatorPanel instanceof VectorCreatorPanel, `invalid vectorCreatorPanel: ${vectorCreatorPanel}`);
    this.addChild(vectorCreatorPanel);
    vectorCreatorPanel.moveToBack();
  }
}
vectorAddition.register('SceneNode', SceneNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblByb3BlcnR5IiwiTXVsdGlsaW5rIiwibWVyZ2UiLCJFcmFzZXJCdXR0b24iLCJOb2RlIiwiU2NlbmVyeUV2ZW50IiwidmVjdG9yQWRkaXRpb24iLCJHcmFwaCIsIlZlY3RvciIsIlZlY3RvclNldCIsIkdyYXBoTm9kZSIsIlZlY3RvckFkZGl0aW9uVmlld1Byb3BlcnRpZXMiLCJWZWN0b3JDcmVhdG9yUGFuZWwiLCJWZWN0b3JTZXROb2RlIiwiVmVjdG9yVmFsdWVzVG9nZ2xlQm94IiwiU2NlbmVOb2RlIiwiY29uc3RydWN0b3IiLCJncmFwaCIsInZpZXdQcm9wZXJ0aWVzIiwiY29tcG9uZW50U3R5bGVQcm9wZXJ0eSIsIm9wdGlvbnMiLCJhc3NlcnQiLCJPYmplY3QiLCJnZXRQcm90b3R5cGVPZiIsInByb3RvdHlwZSIsImluY2x1ZGVFcmFzZXIiLCJ2ZWN0b3JWYWx1ZXNUb2dnbGVCb3hPcHRpb25zIiwiZXhwYW5kZWRQcm9wZXJ0eSIsInZlY3RvclZhbHVlc0V4cGFuZGVkUHJvcGVydHkiLCJjZW50ZXJYIiwiZ3JhcGhWaWV3Qm91bmRzIiwidG9wIiwiZ3JhcGhOb2RlIiwiZ3JpZFZpc2libGVQcm9wZXJ0eSIsInZlY3RvclZhbHVlc1RvZ2dsZUJveCIsInZlY3RvclNldE5vZGVzUGFyZW50Iiwic2V0Q2hpbGRyZW4iLCJlcmFzZXJCdXR0b24iLCJsaXN0ZW5lciIsImludGVycnVwdFN1YnRyZWVJbnB1dCIsImVyYXNlIiwicmlnaHQiLCJtYXhYIiwibWF4WSIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsImFkZENoaWxkIiwibW92ZVRvQmFjayIsImxlbmd0aFByb3BlcnRpZXMiLCJfIiwibWFwIiwidmVjdG9yU2V0cyIsInZlY3RvclNldCIsInZlY3RvcnMiLCJsZW5ndGhQcm9wZXJ0eSIsIm11bHRpbGluayIsIm51bWJlck9mVmVjdG9ycyIsInN1bUJ5IiwidmFsdWUiLCJlbmFibGVkIiwidmVjdG9yU2V0Tm9kZXMiLCJmb3JFYWNoIiwidmVjdG9yU2V0Tm9kZSIsInZhbHVlc1Zpc2libGVQcm9wZXJ0eSIsImFuZ2xlc1Zpc2libGVQcm9wZXJ0eSIsInB1c2giLCJkaXNwb3NlIiwiZ2V0VmVjdG9yU2V0Tm9kZSIsImluZGV4IiwiaW5kZXhPZiIsInJlZ2lzdGVyVmVjdG9yIiwidmVjdG9yIiwiZm9yd2FyZGluZ0V2ZW50IiwiYWRkQmFzZVZlY3RvciIsImJhc2VWZWN0b3IiLCJiYXNlVmVjdG9yc1Zpc2libGVQcm9wZXJ0eSIsImFkZFZlY3RvckNyZWF0b3JQYW5lbCIsInZlY3RvckNyZWF0b3JQYW5lbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2NlbmVOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFZpZXcgZm9yIGEgc2NlbmUgbm9kZS4gU2NlbmUgbm9kZXMgYWxsb3cgc2NyZWVucyB0byBoYXZlIG11bHRpcGxlICdzY2VuZXMnLiBGb3IgaW5zdGFuY2UsICdFeHBsb3JlIDJEJyBoYXMgYSBwb2xhclxyXG4gKiBhbmQgYSBDYXJ0ZXNpYW4gJ3NjZW5lJyBhbmQgJ0V4cGxvcmUgMUQnIGhhcyBhIGhvcml6b250YWwgYW5kIGEgdmVydGljYWwgJ3NjZW5lJy5cclxuICpcclxuICogIyMgQSAnU2NlbmUgTm9kZScgY29udGFpbnM6XHJcbiAqICAtIGEgc2luZ2xlIEdyYXBoTm9kZVxyXG4gKiAgLSBhIHNpbmdsZSBWZWN0b3JWYWx1ZXNUb2dnbGVCb3hcclxuICogIC0gSGFuZGxlIHotbGF5ZXJpbmcgb2YgYWxsIHZlY3RvciB0eXBlcyAoc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy92ZWN0b3ItYWRkaXRpb24vaXNzdWVzLzE5KVxyXG4gKiAgLSBBbiBvcHRpb24gdG8gaW5jbHVkZSBhbiBFcmFzZXJCdXR0b25cclxuICogIC0gQSBtZXRob2QgdG8gYWRkIGEgVmVjdG9yQ3JlYXRvclBhbmVsXHJcbiAqXHJcbiAqICMjIEFQSVxyXG4gKiAgLSBOb3QgcmVxdWlyZWQgdG8gdGVsbCB0aGUgU2NlbmUgTm9kZSB0byBjcmVhdGUgdGhlIFN1bVZlY3Rvck5vZGVzIGFuZCB0aGVpciBDb21wb25lbnRzIChkb2VzIHRoaXMgYXV0b21hdGljYWxseVxyXG4gKiAgICBmb3IgZWFjaCBWZWN0b3JTZXQgaW4gdGhlIEdyYXBoKVxyXG4gKiAgLSBIb3dldmVyLCBpdCBpcyByZXF1aXJlZCB0byAndGVsbCcgdGhlIFNjZW5lIE5vZGUgd2hlbiBvdGhlciBWZWN0b3JzIGFyZSBjcmVhdGVkIChzZWUgcmVnaXN0ZXJWZWN0b3IoKSkuIE9uY2UgdGhpc1xyXG4gKiAgICBpcyBjYWxsZWQsIHRoZSBWZWN0b3IgTm9kZXMvQ29tcG9uZW50cyBhcmUgbWFkZSBhbmQgZGVsZXRlZCBvbmNlIHRoZSBWZWN0b3IgaXMgcmVtb3ZlZC5cclxuICpcclxuICogTk9URTogU2NlbmVOb2RlIHdpbGwgbm90IHRvZ2dsZSBpdHMgdmlzaWJpbGl0eSBiYXNlZCBvbiB3aGVuIHRoZSBHcmFwaE9yaWVudGF0aW9uIG9yIHRoZSBDb29yZGluYXRlU25hcE1vZGVcclxuICogICAgICAgY2hhbmdlcy4gVGhpcyBtdXN0IGJlIGRvbmUgZXh0ZXJuYWxseS5cclxuICpcclxuICogQGF1dGhvciBCcmFuZG9uIExpXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgRXJhc2VyQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL0VyYXNlckJ1dHRvbi5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFNjZW5lcnlFdmVudCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB2ZWN0b3JBZGRpdGlvbiBmcm9tICcuLi8uLi92ZWN0b3JBZGRpdGlvbi5qcyc7XHJcbmltcG9ydCBHcmFwaCBmcm9tICcuLi9tb2RlbC9HcmFwaC5qcyc7XHJcbmltcG9ydCBWZWN0b3IgZnJvbSAnLi4vbW9kZWwvVmVjdG9yLmpzJztcclxuaW1wb3J0IFZlY3RvclNldCBmcm9tICcuLi9tb2RlbC9WZWN0b3JTZXQuanMnO1xyXG5pbXBvcnQgR3JhcGhOb2RlIGZyb20gJy4vR3JhcGhOb2RlLmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uVmlld1Byb3BlcnRpZXMgZnJvbSAnLi9WZWN0b3JBZGRpdGlvblZpZXdQcm9wZXJ0aWVzLmpzJztcclxuaW1wb3J0IFZlY3RvckNyZWF0b3JQYW5lbCBmcm9tICcuL1ZlY3RvckNyZWF0b3JQYW5lbC5qcyc7XHJcbmltcG9ydCBWZWN0b3JTZXROb2RlIGZyb20gJy4vVmVjdG9yU2V0Tm9kZS5qcyc7XHJcbmltcG9ydCBWZWN0b3JWYWx1ZXNUb2dnbGVCb3ggZnJvbSAnLi9WZWN0b3JWYWx1ZXNUb2dnbGVCb3guanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NlbmVOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7R3JhcGh9IGdyYXBoXHJcbiAgICogQHBhcmFtIHtWZWN0b3JBZGRpdGlvblZpZXdQcm9wZXJ0aWVzfSB2aWV3UHJvcGVydGllc1xyXG4gICAqIEBwYXJhbSB7RW51bWVyYXRpb25Qcm9wZXJ0eS48Q29tcG9uZW50VmVjdG9yU3R5bGVzPn0gY29tcG9uZW50U3R5bGVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBhbGwgb3B0aW9ucyBhcmUgc3BlY2lmaWMgdG8gdGhpcyBjbGFzcywgbm90IHBhc3NlZCB0byBzdXBlcmNsYXNzXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGdyYXBoLCB2aWV3UHJvcGVydGllcywgY29tcG9uZW50U3R5bGVQcm9wZXJ0eSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBncmFwaCBpbnN0YW5jZW9mIEdyYXBoLCBgaW52YWxpZCBncmFwaDogJHtncmFwaH1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2aWV3UHJvcGVydGllcyBpbnN0YW5jZW9mIFZlY3RvckFkZGl0aW9uVmlld1Byb3BlcnRpZXMsIGBpbnZhbGlkIHZpZXdQcm9wZXJ0aWVzOiAke3ZpZXdQcm9wZXJ0aWVzfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbXBvbmVudFN0eWxlUHJvcGVydHkgaW5zdGFuY2VvZiBFbnVtZXJhdGlvblByb3BlcnR5LCBgaW52YWxpZCBjb21wb25lbnRTdHlsZVByb3BlcnR5OiAke2NvbXBvbmVudFN0eWxlUHJvcGVydHl9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKCBvcHRpb25zICkgPT09IE9iamVjdC5wcm90b3R5cGUsIGBFeHRyYSBwcm90b3R5cGUgb24gb3B0aW9uczogJHtvcHRpb25zfWAgKTtcclxuXHJcbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIGFsbCBvcHRpb25zIGFyZSBzcGVjaWZpYyB0byB0aGlzIGNsYXNzXHJcbiAgICAgIGluY2x1ZGVFcmFzZXI6IHRydWUsIC8vIHtib29sZWFufSBJbmRpY2F0ZXMgaWYgYW4gRXJhc2VyQnV0dG9uIHNob3VsZCBiZSBpbmNsdWRlZFxyXG5cclxuICAgICAgLy8ge09iamVjdH0gT3B0aW9ucyBwYXNzZWQgdG8gdGhlIFZlY3RvclZhbHVlc1RvZ2dsZUJveFxyXG4gICAgICB2ZWN0b3JWYWx1ZXNUb2dnbGVCb3hPcHRpb25zOiB7XHJcbiAgICAgICAgZXhwYW5kZWRQcm9wZXJ0eTogdmlld1Byb3BlcnRpZXMudmVjdG9yVmFsdWVzRXhwYW5kZWRQcm9wZXJ0eSxcclxuICAgICAgICBjZW50ZXJYOiBncmFwaC5ncmFwaFZpZXdCb3VuZHMuY2VudGVyWCxcclxuICAgICAgICB0b3A6IDM1IC8vIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgICAgfVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICAgLy8gQ3JlYXRlIG9uZSBhbmQgb25seSBHcmFwaE5vZGVcclxuICAgIGNvbnN0IGdyYXBoTm9kZSA9IG5ldyBHcmFwaE5vZGUoIGdyYXBoLCB2aWV3UHJvcGVydGllcy5ncmlkVmlzaWJsZVByb3BlcnR5ICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBvbmUgYW5kIG9ubHkgJ1ZlY3RvciBWYWx1ZXMnIHRvZ2dsZSBib3hcclxuICAgIGNvbnN0IHZlY3RvclZhbHVlc1RvZ2dsZUJveCA9IG5ldyBWZWN0b3JWYWx1ZXNUb2dnbGVCb3goIGdyYXBoLCBvcHRpb25zLnZlY3RvclZhbHVlc1RvZ2dsZUJveE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIENyZWF0ZSBjb250YWluZXJzIGZvciBlYWNoIGFuZCBldmVyeSB0eXBlIG9mIFZlY3RvciB0byBoYW5kbGUgei1sYXllcmluZyBvZiBhbGwgdmVjdG9yIHR5cGVzLlxyXG5cclxuICAgIC8vIEBwcml2YXRlIHtOb2RlfSBwYXJlbnQgZm9yIGFsbCBWZWN0b3JTZXROb2Rlc1xyXG4gICAgdGhpcy52ZWN0b3JTZXROb2Rlc1BhcmVudCA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBjaGlsZHJlbiBpbiB0aGUgY29ycmVjdCB6LW9yZGVyXHJcbiAgICB0aGlzLnNldENoaWxkcmVuKCBbXHJcbiAgICAgIGdyYXBoTm9kZSxcclxuICAgICAgdmVjdG9yVmFsdWVzVG9nZ2xlQm94LFxyXG4gICAgICB0aGlzLnZlY3RvclNldE5vZGVzUGFyZW50XHJcbiAgICBdICk7XHJcblxyXG4gICAgLy8gQWRkIGFuIGVyYXNlciBidXR0b24gaWYgbmVjZXNzYXJ5XHJcbiAgICBpZiAoIG9wdGlvbnMuaW5jbHVkZUVyYXNlciApIHtcclxuXHJcbiAgICAgIGNvbnN0IGVyYXNlckJ1dHRvbiA9IG5ldyBFcmFzZXJCdXR0b24oIHtcclxuICAgICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTsgLy8gY2FuY2VsIGFsbCBpbnRlcmFjdGlvbnMgZm9yIHRoZSBzY2VuZVxyXG4gICAgICAgICAgZ3JhcGguZXJhc2UoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJpZ2h0OiBncmFwaC5ncmFwaFZpZXdCb3VuZHMubWF4WCxcclxuICAgICAgICB0b3A6IGdyYXBoLmdyYXBoVmlld0JvdW5kcy5tYXhZICsgMTUsXHJcbiAgICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiA3LFxyXG4gICAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogN1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIGVyYXNlckJ1dHRvbiApO1xyXG4gICAgICBlcmFzZXJCdXR0b24ubW92ZVRvQmFjaygpO1xyXG5cclxuICAgICAgLy8gRGlzYWJsZSB0aGUgZXJhc2VyIGJ1dHRvbiB3aGVuIHRoZSBudW1iZXIgb2YgdmVjdG9ycyBvbiB0aGUgZ3JhcGggaXMgemVybywgdGhhdCBpcywgd2hlbiBhbGwgdmVjdG9yIHNldHNcclxuICAgICAgLy8gY29udGFpbiBubyB2ZWN0b3JzLiBUaGlzIGlzIGEgYml0IG1vcmUgY29tcGxpY2F0ZWQgdGhhbiBpdCBzaG91bGQgYmUsIGJ1dCBpdCB3YXMgYWRkZWQgbGF0ZSBpbiB0aGVcclxuICAgICAgLy8gZGV2ZWxvcG1lbnQgcHJvY2Vzcy5cclxuICAgICAgLy8gdW5tdWx0aWxpbmsgaXMgdW5uZWNlc3NhcnksIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0uXHJcbiAgICAgIGNvbnN0IGxlbmd0aFByb3BlcnRpZXMgPSBfLm1hcCggZ3JhcGgudmVjdG9yU2V0cywgdmVjdG9yU2V0ID0+IHZlY3RvclNldC52ZWN0b3JzLmxlbmd0aFByb3BlcnR5ICk7XHJcbiAgICAgIE11bHRpbGluay5tdWx0aWxpbmsoIGxlbmd0aFByb3BlcnRpZXMsICgpID0+IHtcclxuICAgICAgICBjb25zdCBudW1iZXJPZlZlY3RvcnMgPSBfLnN1bUJ5KCBsZW5ndGhQcm9wZXJ0aWVzLCBsZW5ndGhQcm9wZXJ0eSA9PiBsZW5ndGhQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgICAgIGVyYXNlckJ1dHRvbi5lbmFibGVkID0gKCBudW1iZXJPZlZlY3RvcnMgIT09IDAgKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHByaXZhdGUge1ZlY3RvclNldE5vZGVbXX0gYSBsYXllciBmb3IgZWFjaCBWZWN0b3JTZXRcclxuICAgIHRoaXMudmVjdG9yU2V0Tm9kZXMgPSBbXTtcclxuICAgIGdyYXBoLnZlY3RvclNldHMuZm9yRWFjaCggdmVjdG9yU2V0ID0+IHtcclxuICAgICAgY29uc3QgdmVjdG9yU2V0Tm9kZSA9IG5ldyBWZWN0b3JTZXROb2RlKCBncmFwaCwgdmVjdG9yU2V0LFxyXG4gICAgICAgIHZpZXdQcm9wZXJ0aWVzLnZhbHVlc1Zpc2libGVQcm9wZXJ0eSwgdmlld1Byb3BlcnRpZXMuYW5nbGVzVmlzaWJsZVByb3BlcnR5LCBjb21wb25lbnRTdHlsZVByb3BlcnR5ICk7XHJcbiAgICAgIHRoaXMudmVjdG9yU2V0Tm9kZXNQYXJlbnQuYWRkQ2hpbGQoIHZlY3RvclNldE5vZGUgKTtcclxuICAgICAgdGhpcy52ZWN0b3JTZXROb2Rlcy5wdXNoKCB2ZWN0b3JTZXROb2RlICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByb3RlY3RlZCBmb3IgbGF5b3V0IGluIHN1YmNsYXNzZXNcclxuICAgIHRoaXMudmVjdG9yVmFsdWVzVG9nZ2xlQm94ID0gdmVjdG9yVmFsdWVzVG9nZ2xlQm94O1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLnZlY3RvclNldHMgPSBncmFwaC52ZWN0b3JTZXRzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ1NjZW5lTm9kZSBpcyBub3QgaW50ZW5kZWQgdG8gYmUgZGlzcG9zZWQnICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBWZWN0b3JTZXROb2RlIGFzc29jaWF0ZWQgd2l0aCBhIFZlY3RvclNldC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yU2V0fSB2ZWN0b3JTZXRcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yU2V0Tm9kZX1cclxuICAgKi9cclxuICBnZXRWZWN0b3JTZXROb2RlKCB2ZWN0b3JTZXQgKSB7XHJcbiAgICBjb25zdCBpbmRleCA9IHRoaXMudmVjdG9yU2V0cy5pbmRleE9mKCB2ZWN0b3JTZXQgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluZGV4ICE9PSAtMSwgYHZlY3RvclNldCBub3QgZm91bmQ6ICR7dmVjdG9yU2V0fWAgKTtcclxuICAgIHJldHVybiB0aGlzLnZlY3RvclNldE5vZGVzWyBpbmRleCBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVnaXN0ZXJzIGEgVmVjdG9yLCBkZWxlZ2F0ZXMgdG8gVmVjdG9yU2V0Tm9kZS5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtWZWN0b3J9IHZlY3RvciAtIHRoZSB2ZWN0b3IgbW9kZWxcclxuICAgKiBAcGFyYW0ge1ZlY3RvclNldH0gdmVjdG9yU2V0IC0gdGhlIFZlY3RvclNldCB0aGUgdmVjdG9yIGJlbG9uZ3MgdG9cclxuICAgKiBAcGFyYW0ge1NjZW5lcnlFdmVudH0gW2ZvcndhcmRpbmdFdmVudF0gLSBzZWUgVmVjdG9yU2V0Tm9kZVxyXG4gICAqL1xyXG4gIHJlZ2lzdGVyVmVjdG9yKCB2ZWN0b3IsIHZlY3RvclNldCwgZm9yd2FyZGluZ0V2ZW50ICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZlY3RvciBpbnN0YW5jZW9mIFZlY3RvciwgYGludmFsaWQgdmVjdG9yOiAke3ZlY3Rvcn1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2ZWN0b3JTZXQgaW5zdGFuY2VvZiBWZWN0b3JTZXQsIGBpbnZhbGlkIHZlY3RvclNldDogJHt2ZWN0b3JTZXR9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIWZvcndhcmRpbmdFdmVudCB8fCBmb3J3YXJkaW5nRXZlbnQgaW5zdGFuY2VvZiBTY2VuZXJ5RXZlbnQsIGBpbnZhbGlkIGZvcndhcmRpbmdFdmVudDogJHtmb3J3YXJkaW5nRXZlbnR9YCApO1xyXG5cclxuICAgIC8vIERlbGVnYXRlIHJlZ2lzdHJhdGlvbiB0byB0aGUgVmVjdG9yU2V0Tm9kZVxyXG4gICAgdGhpcy5nZXRWZWN0b3JTZXROb2RlKCB2ZWN0b3JTZXQgKS5yZWdpc3RlclZlY3RvciggdmVjdG9yLCBmb3J3YXJkaW5nRXZlbnQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBiYXNlIHZlY3RvciB0byB0aGUgc2NlbmUuICBEZWxlZ2F0ZXMgdG8gVmVjdG9yU2V0Tm9kZS5cclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICogQHBhcmFtIHtWZWN0b3JTZXR9IHZlY3RvclNldFxyXG4gICAqIEBwYXJhbSB7QmFzZVZlY3Rvcn0gYmFzZVZlY3RvclxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBiYXNlVmVjdG9yc1Zpc2libGVQcm9wZXJ0eVxyXG4gICAqL1xyXG4gIGFkZEJhc2VWZWN0b3IoIHZlY3RvclNldCwgYmFzZVZlY3RvciwgYmFzZVZlY3RvcnNWaXNpYmxlUHJvcGVydHkgKSB7XHJcbiAgICB0aGlzLmdldFZlY3RvclNldE5vZGUoIHZlY3RvclNldCApLmFkZEJhc2VWZWN0b3IoIGJhc2VWZWN0b3IsIGJhc2VWZWN0b3JzVmlzaWJsZVByb3BlcnR5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGEgVmVjdG9yQ3JlYXRvclBhbmVsIHRvIHRoZSBzY2VuZS5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtWZWN0b3JDcmVhdG9yUGFuZWx9IHZlY3RvckNyZWF0b3JQYW5lbFxyXG4gICAqL1xyXG4gIGFkZFZlY3RvckNyZWF0b3JQYW5lbCggdmVjdG9yQ3JlYXRvclBhbmVsICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmVjdG9yQ3JlYXRvclBhbmVsIGluc3RhbmNlb2YgVmVjdG9yQ3JlYXRvclBhbmVsLCBgaW52YWxpZCB2ZWN0b3JDcmVhdG9yUGFuZWw6ICR7dmVjdG9yQ3JlYXRvclBhbmVsfWAgKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCB2ZWN0b3JDcmVhdG9yUGFuZWwgKTtcclxuICAgIHZlY3RvckNyZWF0b3JQYW5lbC5tb3ZlVG9CYWNrKCk7XHJcbiAgfVxyXG59XHJcblxyXG52ZWN0b3JBZGRpdGlvbi5yZWdpc3RlciggJ1NjZW5lTm9kZScs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