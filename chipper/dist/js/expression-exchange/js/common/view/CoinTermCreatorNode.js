// Copyright 2016-2022, University of Colorado Boulder

/**
 * a UI component that is used to create coin terms when clicked upon
 *
 * This is generally used in a carousel or other "creator box".  There are a few sim-specific items currently used, but
 * this could probably be generalized fairly easily so that it could be reused in similar situations.  My (jbphet)
 * initial thoughts are that we would need to decide whether to extract much of the functionality into a base class
 * and derive subclasses to handle sim-specific behavior, or have some sort of options that could make it work in all
 * cases.
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { DragListener, Node } from '../../../../scenery/js/imports.js';
import expressionExchange from '../../expressionExchange.js';
import CoinTermTypeID from '../enum/CoinTermTypeID.js';
import ConstantCoinTermNode from './ConstantCoinTermNode.js';
import VariableCoinTermNode from './VariableCoinTermNode.js';

// constants
const STAGGER_OFFSET = 3; // in screen coordinates, empirically determined for optimal look

class CoinTermCreatorNode extends Node {
  /**
   * @param {ExpressionManipulationModel} expressionManipulationModel - model where coin terms are to be added
   * @param {ExpressionManipulationView} expressionManipulationView - view where coin term nodes will be shown
   * @param {CoinTermTypeID} typeID - type of coin term to create
   * @param {function} coinTermCreatorFunction - function( {CoinTermTypeID}, options ) : {CoinTerm} - creates the coin
   * term model elements that are added to the model, also used for creating "dummy" instances to associate with the
   * view nodes that collectively comprise the constructed creator node
   * @param {Object} [options]
   */
  constructor(expressionManipulationModel, expressionManipulationView, typeID, coinTermCreatorFunction, options) {
    options = merge({
      dragBounds: Bounds2.EVERYTHING,
      // initial count of the coin term that will be created, can be negative
      createdCoinTermInitialCount: 1,
      // flag that controls whether created coin term can be decomposed
      createdCoinTermDecomposable: true,
      // property that controls the number of creator nodes to show as a stack
      numberToShowProperty: new Property(1),
      // the maximum number of this coin term that will be shown
      maxNumberShown: 1,
      // controls whether the coin term(s) that comprise this node should be on backgrounds that look like cards
      onCard: false
    }, options);
    super({
      cursor: 'pointer'
    });
    const self = this;

    // @public (read-only) {number} - initial count of the coin term created by this creator node, a.k.a. the coefficient
    this.createdCoinTermInitialCount = options.createdCoinTermInitialCount;
    this.typeID = typeID; // @public (read-only) {CoinTermID}

    // add the individual coin term node(s)
    const coinTermNodes = [];
    _.times(options.maxNumberShown, index => {
      let coinTermNode;
      const coinTermNodeOptions = {
        addDragHandler: false,
        x: index * STAGGER_OFFSET,
        y: index * STAGGER_OFFSET
      };
      const dummyCoinTerm = coinTermCreatorFunction(typeID, {
        initialPosition: Vector2.ZERO,
        initialCount: options.createdCoinTermInitialCount,
        initiallyOnCard: options.onCard
      });
      if (typeID === CoinTermTypeID.CONSTANT) {
        coinTermNode = new ConstantCoinTermNode(dummyCoinTerm, expressionManipulationModel.viewModeProperty, coinTermNodeOptions);
      } else {
        coinTermNode = new VariableCoinTermNode(dummyCoinTerm, expressionManipulationModel.viewModeProperty, expressionManipulationModel.showCoinValuesProperty, expressionManipulationModel.showVariableValuesProperty, expressionManipulationModel.showAllCoefficientsProperty, coinTermNodeOptions);
      }
      this.addChild(coinTermNode);
      coinTermNodes.push(coinTermNode);
    });

    // create a listener that changes the visibility of individual nodes as the number to show changes
    function numberToShowListener(numberToShow) {
      self.pickable = numberToShow > 0;
      coinTermNodes.forEach((coinTermNode, index) => {
        coinTermNode.visible = index < numberToShow;
      });
      if (numberToShow === 0) {
        // show a faded version of the first node
        coinTermNodes[0].opacity = 0.4;
        coinTermNodes[0].visible = true;
      } else {
        coinTermNodes[0].opacity = 1;
      }
    }

    // control the visibility of the individual coin term nodes
    options.numberToShowProperty.link(numberToShowListener);

    // Add the listener that will allow the user to click on this node and create a new coin term, and then position it
    // in the model.  This works by forwarding the events it receives to the node that gets created in the view.
    this.addInputListener(DragListener.createForwardingListener(event => {
      // Determine the origin position of the new element based on where the creator node is.  This is done so that
      // the position to which this element will return when it is "put away" will match the position of this creator
      // node.
      const originPosition = expressionManipulationView.globalToLocalPoint(this.localToGlobalPoint(Vector2.ZERO));

      // Determine the initial position where this element should move to after it's created based on the position of
      // the pointer event.
      const initialPosition = expressionManipulationView.globalToLocalPoint(event.pointer.point);

      // create and add the new coin term to the model, which result in a node being created in the view
      const createdCoinTerm = coinTermCreatorFunction(typeID, {
        initialPosition: originPosition,
        initialCount: options.createdCoinTermInitialCount,
        decomposable: options.createdCoinTermDecomposable,
        initiallyOnCard: options.onCard
      });
      createdCoinTerm.setPositionAndDestination(initialPosition);
      expressionManipulationModel.addCoinTerm(createdCoinTerm);

      // get the view node that should have appeared in the view so that events can be forwarded to its drag handler
      const createdCoinTermView = expressionManipulationView.getViewForCoinTerm(createdCoinTerm);
      assert && assert(createdCoinTermView, 'unable to find coin term view');
      if (createdCoinTermView) {
        // forward the event to the view node's drag handler
        createdCoinTermView.dragHandler.press(event, createdCoinTermView);
      }
    }, {
      allowTouchSnag: true
    }));

    // dispose function
    this.disposeCoinTermCreatorNode = function () {
      coinTermNodes.forEach(coinTermNode => {
        coinTermNode.dispose();
      });
      options.numberToShowProperty.unlink(numberToShowListener);
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposeCoinTermCreatorNode();
    super.dispose();
  }
}
expressionExchange.register('CoinTermCreatorNode', CoinTermCreatorNode);
export default CoinTermCreatorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkJvdW5kczIiLCJWZWN0b3IyIiwibWVyZ2UiLCJEcmFnTGlzdGVuZXIiLCJOb2RlIiwiZXhwcmVzc2lvbkV4Y2hhbmdlIiwiQ29pblRlcm1UeXBlSUQiLCJDb25zdGFudENvaW5UZXJtTm9kZSIsIlZhcmlhYmxlQ29pblRlcm1Ob2RlIiwiU1RBR0dFUl9PRkZTRVQiLCJDb2luVGVybUNyZWF0b3JOb2RlIiwiY29uc3RydWN0b3IiLCJleHByZXNzaW9uTWFuaXB1bGF0aW9uTW9kZWwiLCJleHByZXNzaW9uTWFuaXB1bGF0aW9uVmlldyIsInR5cGVJRCIsImNvaW5UZXJtQ3JlYXRvckZ1bmN0aW9uIiwib3B0aW9ucyIsImRyYWdCb3VuZHMiLCJFVkVSWVRISU5HIiwiY3JlYXRlZENvaW5UZXJtSW5pdGlhbENvdW50IiwiY3JlYXRlZENvaW5UZXJtRGVjb21wb3NhYmxlIiwibnVtYmVyVG9TaG93UHJvcGVydHkiLCJtYXhOdW1iZXJTaG93biIsIm9uQ2FyZCIsImN1cnNvciIsInNlbGYiLCJjb2luVGVybU5vZGVzIiwiXyIsInRpbWVzIiwiaW5kZXgiLCJjb2luVGVybU5vZGUiLCJjb2luVGVybU5vZGVPcHRpb25zIiwiYWRkRHJhZ0hhbmRsZXIiLCJ4IiwieSIsImR1bW15Q29pblRlcm0iLCJpbml0aWFsUG9zaXRpb24iLCJaRVJPIiwiaW5pdGlhbENvdW50IiwiaW5pdGlhbGx5T25DYXJkIiwiQ09OU1RBTlQiLCJ2aWV3TW9kZVByb3BlcnR5Iiwic2hvd0NvaW5WYWx1ZXNQcm9wZXJ0eSIsInNob3dWYXJpYWJsZVZhbHVlc1Byb3BlcnR5Iiwic2hvd0FsbENvZWZmaWNpZW50c1Byb3BlcnR5IiwiYWRkQ2hpbGQiLCJwdXNoIiwibnVtYmVyVG9TaG93TGlzdGVuZXIiLCJudW1iZXJUb1Nob3ciLCJwaWNrYWJsZSIsImZvckVhY2giLCJ2aXNpYmxlIiwib3BhY2l0eSIsImxpbmsiLCJhZGRJbnB1dExpc3RlbmVyIiwiY3JlYXRlRm9yd2FyZGluZ0xpc3RlbmVyIiwiZXZlbnQiLCJvcmlnaW5Qb3NpdGlvbiIsImdsb2JhbFRvTG9jYWxQb2ludCIsImxvY2FsVG9HbG9iYWxQb2ludCIsInBvaW50ZXIiLCJwb2ludCIsImNyZWF0ZWRDb2luVGVybSIsImRlY29tcG9zYWJsZSIsInNldFBvc2l0aW9uQW5kRGVzdGluYXRpb24iLCJhZGRDb2luVGVybSIsImNyZWF0ZWRDb2luVGVybVZpZXciLCJnZXRWaWV3Rm9yQ29pblRlcm0iLCJhc3NlcnQiLCJkcmFnSGFuZGxlciIsInByZXNzIiwiYWxsb3dUb3VjaFNuYWciLCJkaXNwb3NlQ29pblRlcm1DcmVhdG9yTm9kZSIsImRpc3Bvc2UiLCJ1bmxpbmsiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvaW5UZXJtQ3JlYXRvck5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogYSBVSSBjb21wb25lbnQgdGhhdCBpcyB1c2VkIHRvIGNyZWF0ZSBjb2luIHRlcm1zIHdoZW4gY2xpY2tlZCB1cG9uXHJcbiAqXHJcbiAqIFRoaXMgaXMgZ2VuZXJhbGx5IHVzZWQgaW4gYSBjYXJvdXNlbCBvciBvdGhlciBcImNyZWF0b3IgYm94XCIuICBUaGVyZSBhcmUgYSBmZXcgc2ltLXNwZWNpZmljIGl0ZW1zIGN1cnJlbnRseSB1c2VkLCBidXRcclxuICogdGhpcyBjb3VsZCBwcm9iYWJseSBiZSBnZW5lcmFsaXplZCBmYWlybHkgZWFzaWx5IHNvIHRoYXQgaXQgY291bGQgYmUgcmV1c2VkIGluIHNpbWlsYXIgc2l0dWF0aW9ucy4gIE15IChqYnBoZXQpXHJcbiAqIGluaXRpYWwgdGhvdWdodHMgYXJlIHRoYXQgd2Ugd291bGQgbmVlZCB0byBkZWNpZGUgd2hldGhlciB0byBleHRyYWN0IG11Y2ggb2YgdGhlIGZ1bmN0aW9uYWxpdHkgaW50byBhIGJhc2UgY2xhc3NcclxuICogYW5kIGRlcml2ZSBzdWJjbGFzc2VzIHRvIGhhbmRsZSBzaW0tc3BlY2lmaWMgYmVoYXZpb3IsIG9yIGhhdmUgc29tZSBzb3J0IG9mIG9wdGlvbnMgdGhhdCBjb3VsZCBtYWtlIGl0IHdvcmsgaW4gYWxsXHJcbiAqIGNhc2VzLlxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBEcmFnTGlzdGVuZXIsIE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZXhwcmVzc2lvbkV4Y2hhbmdlIGZyb20gJy4uLy4uL2V4cHJlc3Npb25FeGNoYW5nZS5qcyc7XHJcbmltcG9ydCBDb2luVGVybVR5cGVJRCBmcm9tICcuLi9lbnVtL0NvaW5UZXJtVHlwZUlELmpzJztcclxuaW1wb3J0IENvbnN0YW50Q29pblRlcm1Ob2RlIGZyb20gJy4vQ29uc3RhbnRDb2luVGVybU5vZGUuanMnO1xyXG5pbXBvcnQgVmFyaWFibGVDb2luVGVybU5vZGUgZnJvbSAnLi9WYXJpYWJsZUNvaW5UZXJtTm9kZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgU1RBR0dFUl9PRkZTRVQgPSAzOyAvLyBpbiBzY3JlZW4gY29vcmRpbmF0ZXMsIGVtcGlyaWNhbGx5IGRldGVybWluZWQgZm9yIG9wdGltYWwgbG9va1xyXG5cclxuY2xhc3MgQ29pblRlcm1DcmVhdG9yTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0V4cHJlc3Npb25NYW5pcHVsYXRpb25Nb2RlbH0gZXhwcmVzc2lvbk1hbmlwdWxhdGlvbk1vZGVsIC0gbW9kZWwgd2hlcmUgY29pbiB0ZXJtcyBhcmUgdG8gYmUgYWRkZWRcclxuICAgKiBAcGFyYW0ge0V4cHJlc3Npb25NYW5pcHVsYXRpb25WaWV3fSBleHByZXNzaW9uTWFuaXB1bGF0aW9uVmlldyAtIHZpZXcgd2hlcmUgY29pbiB0ZXJtIG5vZGVzIHdpbGwgYmUgc2hvd25cclxuICAgKiBAcGFyYW0ge0NvaW5UZXJtVHlwZUlEfSB0eXBlSUQgLSB0eXBlIG9mIGNvaW4gdGVybSB0byBjcmVhdGVcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjb2luVGVybUNyZWF0b3JGdW5jdGlvbiAtIGZ1bmN0aW9uKCB7Q29pblRlcm1UeXBlSUR9LCBvcHRpb25zICkgOiB7Q29pblRlcm19IC0gY3JlYXRlcyB0aGUgY29pblxyXG4gICAqIHRlcm0gbW9kZWwgZWxlbWVudHMgdGhhdCBhcmUgYWRkZWQgdG8gdGhlIG1vZGVsLCBhbHNvIHVzZWQgZm9yIGNyZWF0aW5nIFwiZHVtbXlcIiBpbnN0YW5jZXMgdG8gYXNzb2NpYXRlIHdpdGggdGhlXHJcbiAgICogdmlldyBub2RlcyB0aGF0IGNvbGxlY3RpdmVseSBjb21wcmlzZSB0aGUgY29uc3RydWN0ZWQgY3JlYXRvciBub2RlXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBleHByZXNzaW9uTWFuaXB1bGF0aW9uTW9kZWwsIGV4cHJlc3Npb25NYW5pcHVsYXRpb25WaWV3LCB0eXBlSUQsIGNvaW5UZXJtQ3JlYXRvckZ1bmN0aW9uLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgZHJhZ0JvdW5kczogQm91bmRzMi5FVkVSWVRISU5HLFxyXG5cclxuICAgICAgLy8gaW5pdGlhbCBjb3VudCBvZiB0aGUgY29pbiB0ZXJtIHRoYXQgd2lsbCBiZSBjcmVhdGVkLCBjYW4gYmUgbmVnYXRpdmVcclxuICAgICAgY3JlYXRlZENvaW5UZXJtSW5pdGlhbENvdW50OiAxLFxyXG5cclxuICAgICAgLy8gZmxhZyB0aGF0IGNvbnRyb2xzIHdoZXRoZXIgY3JlYXRlZCBjb2luIHRlcm0gY2FuIGJlIGRlY29tcG9zZWRcclxuICAgICAgY3JlYXRlZENvaW5UZXJtRGVjb21wb3NhYmxlOiB0cnVlLFxyXG5cclxuICAgICAgLy8gcHJvcGVydHkgdGhhdCBjb250cm9scyB0aGUgbnVtYmVyIG9mIGNyZWF0b3Igbm9kZXMgdG8gc2hvdyBhcyBhIHN0YWNrXHJcbiAgICAgIG51bWJlclRvU2hvd1Byb3BlcnR5OiBuZXcgUHJvcGVydHkoIDEgKSxcclxuXHJcbiAgICAgIC8vIHRoZSBtYXhpbXVtIG51bWJlciBvZiB0aGlzIGNvaW4gdGVybSB0aGF0IHdpbGwgYmUgc2hvd25cclxuICAgICAgbWF4TnVtYmVyU2hvd246IDEsXHJcblxyXG4gICAgICAvLyBjb250cm9scyB3aGV0aGVyIHRoZSBjb2luIHRlcm0ocykgdGhhdCBjb21wcmlzZSB0aGlzIG5vZGUgc2hvdWxkIGJlIG9uIGJhY2tncm91bmRzIHRoYXQgbG9vayBsaWtlIGNhcmRzXHJcbiAgICAgIG9uQ2FyZDogZmFsc2VcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggeyBjdXJzb3I6ICdwb2ludGVyJyB9ICk7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtudW1iZXJ9IC0gaW5pdGlhbCBjb3VudCBvZiB0aGUgY29pbiB0ZXJtIGNyZWF0ZWQgYnkgdGhpcyBjcmVhdG9yIG5vZGUsIGEuay5hLiB0aGUgY29lZmZpY2llbnRcclxuICAgIHRoaXMuY3JlYXRlZENvaW5UZXJtSW5pdGlhbENvdW50ID0gb3B0aW9ucy5jcmVhdGVkQ29pblRlcm1Jbml0aWFsQ291bnQ7XHJcblxyXG4gICAgdGhpcy50eXBlSUQgPSB0eXBlSUQ7IC8vIEBwdWJsaWMgKHJlYWQtb25seSkge0NvaW5UZXJtSUR9XHJcblxyXG4gICAgLy8gYWRkIHRoZSBpbmRpdmlkdWFsIGNvaW4gdGVybSBub2RlKHMpXHJcbiAgICBjb25zdCBjb2luVGVybU5vZGVzID0gW107XHJcbiAgICBfLnRpbWVzKCBvcHRpb25zLm1heE51bWJlclNob3duLCBpbmRleCA9PiB7XHJcbiAgICAgIGxldCBjb2luVGVybU5vZGU7XHJcbiAgICAgIGNvbnN0IGNvaW5UZXJtTm9kZU9wdGlvbnMgPSB7XHJcbiAgICAgICAgYWRkRHJhZ0hhbmRsZXI6IGZhbHNlLFxyXG4gICAgICAgIHg6IGluZGV4ICogU1RBR0dFUl9PRkZTRVQsXHJcbiAgICAgICAgeTogaW5kZXggKiBTVEFHR0VSX09GRlNFVFxyXG4gICAgICB9O1xyXG4gICAgICBjb25zdCBkdW1teUNvaW5UZXJtID0gY29pblRlcm1DcmVhdG9yRnVuY3Rpb24oIHR5cGVJRCwge1xyXG4gICAgICAgIGluaXRpYWxQb3NpdGlvbjogVmVjdG9yMi5aRVJPLFxyXG4gICAgICAgIGluaXRpYWxDb3VudDogb3B0aW9ucy5jcmVhdGVkQ29pblRlcm1Jbml0aWFsQ291bnQsXHJcbiAgICAgICAgaW5pdGlhbGx5T25DYXJkOiBvcHRpb25zLm9uQ2FyZFxyXG4gICAgICB9ICk7XHJcbiAgICAgIGlmICggdHlwZUlEID09PSBDb2luVGVybVR5cGVJRC5DT05TVEFOVCApIHtcclxuICAgICAgICBjb2luVGVybU5vZGUgPSBuZXcgQ29uc3RhbnRDb2luVGVybU5vZGUoXHJcbiAgICAgICAgICBkdW1teUNvaW5UZXJtLFxyXG4gICAgICAgICAgZXhwcmVzc2lvbk1hbmlwdWxhdGlvbk1vZGVsLnZpZXdNb2RlUHJvcGVydHksXHJcbiAgICAgICAgICBjb2luVGVybU5vZGVPcHRpb25zXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBjb2luVGVybU5vZGUgPSBuZXcgVmFyaWFibGVDb2luVGVybU5vZGUoXHJcbiAgICAgICAgICBkdW1teUNvaW5UZXJtLFxyXG4gICAgICAgICAgZXhwcmVzc2lvbk1hbmlwdWxhdGlvbk1vZGVsLnZpZXdNb2RlUHJvcGVydHksXHJcbiAgICAgICAgICBleHByZXNzaW9uTWFuaXB1bGF0aW9uTW9kZWwuc2hvd0NvaW5WYWx1ZXNQcm9wZXJ0eSxcclxuICAgICAgICAgIGV4cHJlc3Npb25NYW5pcHVsYXRpb25Nb2RlbC5zaG93VmFyaWFibGVWYWx1ZXNQcm9wZXJ0eSxcclxuICAgICAgICAgIGV4cHJlc3Npb25NYW5pcHVsYXRpb25Nb2RlbC5zaG93QWxsQ29lZmZpY2llbnRzUHJvcGVydHksXHJcbiAgICAgICAgICBjb2luVGVybU5vZGVPcHRpb25zXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmFkZENoaWxkKCBjb2luVGVybU5vZGUgKTtcclxuICAgICAgY29pblRlcm1Ob2Rlcy5wdXNoKCBjb2luVGVybU5vZGUgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYSBsaXN0ZW5lciB0aGF0IGNoYW5nZXMgdGhlIHZpc2liaWxpdHkgb2YgaW5kaXZpZHVhbCBub2RlcyBhcyB0aGUgbnVtYmVyIHRvIHNob3cgY2hhbmdlc1xyXG4gICAgZnVuY3Rpb24gbnVtYmVyVG9TaG93TGlzdGVuZXIoIG51bWJlclRvU2hvdyApIHtcclxuXHJcbiAgICAgIHNlbGYucGlja2FibGUgPSBudW1iZXJUb1Nob3cgPiAwO1xyXG5cclxuICAgICAgY29pblRlcm1Ob2Rlcy5mb3JFYWNoKCAoIGNvaW5UZXJtTm9kZSwgaW5kZXggKSA9PiB7XHJcbiAgICAgICAgY29pblRlcm1Ob2RlLnZpc2libGUgPSBpbmRleCA8IG51bWJlclRvU2hvdztcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgaWYgKCBudW1iZXJUb1Nob3cgPT09IDAgKSB7XHJcblxyXG4gICAgICAgIC8vIHNob3cgYSBmYWRlZCB2ZXJzaW9uIG9mIHRoZSBmaXJzdCBub2RlXHJcbiAgICAgICAgY29pblRlcm1Ob2Rlc1sgMCBdLm9wYWNpdHkgPSAwLjQ7XHJcbiAgICAgICAgY29pblRlcm1Ob2Rlc1sgMCBdLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGNvaW5UZXJtTm9kZXNbIDAgXS5vcGFjaXR5ID0gMTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNvbnRyb2wgdGhlIHZpc2liaWxpdHkgb2YgdGhlIGluZGl2aWR1YWwgY29pbiB0ZXJtIG5vZGVzXHJcbiAgICBvcHRpb25zLm51bWJlclRvU2hvd1Byb3BlcnR5LmxpbmsoIG51bWJlclRvU2hvd0xpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBsaXN0ZW5lciB0aGF0IHdpbGwgYWxsb3cgdGhlIHVzZXIgdG8gY2xpY2sgb24gdGhpcyBub2RlIGFuZCBjcmVhdGUgYSBuZXcgY29pbiB0ZXJtLCBhbmQgdGhlbiBwb3NpdGlvbiBpdFxyXG4gICAgLy8gaW4gdGhlIG1vZGVsLiAgVGhpcyB3b3JrcyBieSBmb3J3YXJkaW5nIHRoZSBldmVudHMgaXQgcmVjZWl2ZXMgdG8gdGhlIG5vZGUgdGhhdCBnZXRzIGNyZWF0ZWQgaW4gdGhlIHZpZXcuXHJcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIERyYWdMaXN0ZW5lci5jcmVhdGVGb3J3YXJkaW5nTGlzdGVuZXIoIGV2ZW50ID0+IHtcclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBvcmlnaW4gcG9zaXRpb24gb2YgdGhlIG5ldyBlbGVtZW50IGJhc2VkIG9uIHdoZXJlIHRoZSBjcmVhdG9yIG5vZGUgaXMuICBUaGlzIGlzIGRvbmUgc28gdGhhdFxyXG4gICAgICAgIC8vIHRoZSBwb3NpdGlvbiB0byB3aGljaCB0aGlzIGVsZW1lbnQgd2lsbCByZXR1cm4gd2hlbiBpdCBpcyBcInB1dCBhd2F5XCIgd2lsbCBtYXRjaCB0aGUgcG9zaXRpb24gb2YgdGhpcyBjcmVhdG9yXHJcbiAgICAgICAgLy8gbm9kZS5cclxuICAgICAgICBjb25zdCBvcmlnaW5Qb3NpdGlvbiA9IGV4cHJlc3Npb25NYW5pcHVsYXRpb25WaWV3Lmdsb2JhbFRvTG9jYWxQb2ludCggdGhpcy5sb2NhbFRvR2xvYmFsUG9pbnQoIFZlY3RvcjIuWkVSTyApICk7XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSB0aGUgaW5pdGlhbCBwb3NpdGlvbiB3aGVyZSB0aGlzIGVsZW1lbnQgc2hvdWxkIG1vdmUgdG8gYWZ0ZXIgaXQncyBjcmVhdGVkIGJhc2VkIG9uIHRoZSBwb3NpdGlvbiBvZlxyXG4gICAgICAgIC8vIHRoZSBwb2ludGVyIGV2ZW50LlxyXG4gICAgICAgIGNvbnN0IGluaXRpYWxQb3NpdGlvbiA9IGV4cHJlc3Npb25NYW5pcHVsYXRpb25WaWV3Lmdsb2JhbFRvTG9jYWxQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApO1xyXG5cclxuICAgICAgICAvLyBjcmVhdGUgYW5kIGFkZCB0aGUgbmV3IGNvaW4gdGVybSB0byB0aGUgbW9kZWwsIHdoaWNoIHJlc3VsdCBpbiBhIG5vZGUgYmVpbmcgY3JlYXRlZCBpbiB0aGUgdmlld1xyXG4gICAgICAgIGNvbnN0IGNyZWF0ZWRDb2luVGVybSA9IGNvaW5UZXJtQ3JlYXRvckZ1bmN0aW9uKCB0eXBlSUQsIHtcclxuICAgICAgICAgIGluaXRpYWxQb3NpdGlvbjogb3JpZ2luUG9zaXRpb24sXHJcbiAgICAgICAgICBpbml0aWFsQ291bnQ6IG9wdGlvbnMuY3JlYXRlZENvaW5UZXJtSW5pdGlhbENvdW50LFxyXG4gICAgICAgICAgZGVjb21wb3NhYmxlOiBvcHRpb25zLmNyZWF0ZWRDb2luVGVybURlY29tcG9zYWJsZSxcclxuICAgICAgICAgIGluaXRpYWxseU9uQ2FyZDogb3B0aW9ucy5vbkNhcmRcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgY3JlYXRlZENvaW5UZXJtLnNldFBvc2l0aW9uQW5kRGVzdGluYXRpb24oIGluaXRpYWxQb3NpdGlvbiApO1xyXG4gICAgICAgIGV4cHJlc3Npb25NYW5pcHVsYXRpb25Nb2RlbC5hZGRDb2luVGVybSggY3JlYXRlZENvaW5UZXJtICk7XHJcblxyXG4gICAgICAgIC8vIGdldCB0aGUgdmlldyBub2RlIHRoYXQgc2hvdWxkIGhhdmUgYXBwZWFyZWQgaW4gdGhlIHZpZXcgc28gdGhhdCBldmVudHMgY2FuIGJlIGZvcndhcmRlZCB0byBpdHMgZHJhZyBoYW5kbGVyXHJcbiAgICAgICAgY29uc3QgY3JlYXRlZENvaW5UZXJtVmlldyA9IGV4cHJlc3Npb25NYW5pcHVsYXRpb25WaWV3LmdldFZpZXdGb3JDb2luVGVybSggY3JlYXRlZENvaW5UZXJtICk7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggY3JlYXRlZENvaW5UZXJtVmlldywgJ3VuYWJsZSB0byBmaW5kIGNvaW4gdGVybSB2aWV3JyApO1xyXG5cclxuICAgICAgICBpZiAoIGNyZWF0ZWRDb2luVGVybVZpZXcgKSB7XHJcblxyXG4gICAgICAgICAgLy8gZm9yd2FyZCB0aGUgZXZlbnQgdG8gdGhlIHZpZXcgbm9kZSdzIGRyYWcgaGFuZGxlclxyXG4gICAgICAgICAgY3JlYXRlZENvaW5UZXJtVmlldy5kcmFnSGFuZGxlci5wcmVzcyggZXZlbnQsIGNyZWF0ZWRDb2luVGVybVZpZXcgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBhbGxvd1RvdWNoU25hZzogdHJ1ZVxyXG4gICAgICB9XHJcbiAgICApICk7XHJcblxyXG4gICAgLy8gZGlzcG9zZSBmdW5jdGlvblxyXG4gICAgdGhpcy5kaXNwb3NlQ29pblRlcm1DcmVhdG9yTm9kZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBjb2luVGVybU5vZGVzLmZvckVhY2goIGNvaW5UZXJtTm9kZSA9PiB7XHJcbiAgICAgICAgY29pblRlcm1Ob2RlLmRpc3Bvc2UoKTtcclxuICAgICAgfSApO1xyXG4gICAgICBvcHRpb25zLm51bWJlclRvU2hvd1Byb3BlcnR5LnVubGluayggbnVtYmVyVG9TaG93TGlzdGVuZXIgKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuZGlzcG9zZUNvaW5UZXJtQ3JlYXRvck5vZGUoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cHJlc3Npb25FeGNoYW5nZS5yZWdpc3RlciggJ0NvaW5UZXJtQ3JlYXRvck5vZGUnLCBDb2luVGVybUNyZWF0b3JOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDb2luVGVybUNyZWF0b3JOb2RlO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLFlBQVksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUN0RSxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0MsY0FBYyxNQUFNLDJCQUEyQjtBQUN0RCxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFDNUQsT0FBT0Msb0JBQW9CLE1BQU0sMkJBQTJCOztBQUU1RDtBQUNBLE1BQU1DLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFMUIsTUFBTUMsbUJBQW1CLFNBQVNOLElBQUksQ0FBQztFQUVyQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU8sV0FBV0EsQ0FBRUMsMkJBQTJCLEVBQUVDLDBCQUEwQixFQUFFQyxNQUFNLEVBQUVDLHVCQUF1QixFQUFFQyxPQUFPLEVBQUc7SUFFL0dBLE9BQU8sR0FBR2QsS0FBSyxDQUFFO01BRWZlLFVBQVUsRUFBRWpCLE9BQU8sQ0FBQ2tCLFVBQVU7TUFFOUI7TUFDQUMsMkJBQTJCLEVB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