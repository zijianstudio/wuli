// Copyright 2016-2022, University of Colorado Boulder

/**
 * a view node that allows the user to interact with coin terms to create and manipulate expressions
 *
 * @author John Blanco
 */

import Multilink from '../../../../axon/js/Multilink.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import UndoButton from '../../../../scenery-phet/js/buttons/UndoButton.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import { Node, Path, PressListener } from '../../../../scenery/js/imports.js';
import expressionExchange from '../../expressionExchange.js';
import EECollectionAreaNode from '../../game/view/EECollectionAreaNode.js';
import CoinTermHaloNode from './CoinTermHaloNode.js';
import ConstantCoinTermNode from './ConstantCoinTermNode.js';
import ExpressionHintNode from './ExpressionHintNode.js';
import ExpressionNode from './ExpressionNode.js';
import ExpressionOverlayNode from './ExpressionOverlayNode.js';
import VariableCoinTermNode from './VariableCoinTermNode.js';
class ExpressionManipulationView extends Node {
  /**
   * @param {ExpressionManipulationModel} model
   * @param {Property.<Bounds2>} visibleBoundsProperty
   * @param {Object} [options]
   */
  constructor(model, visibleBoundsProperty, options) {
    options = merge({
      coinTermBreakApartButtonMode: 'normal' // passed through to the coin terms
    }, options);
    super();

    // add the expression collection area nodes
    model.collectionAreas.forEach(collectionArea => {
      this.addChild(new EECollectionAreaNode(collectionArea));
    });

    // add the node that will act as the layer where the expression backgrounds and expression hints will come and go
    const expressionLayer = new Node();
    this.addChild(expressionLayer);

    // add the node that will act as the layer where the coin term halos will come and go
    const coinHaloLayer = new Node();
    this.addChild(coinHaloLayer);

    // add the node that will act as the layer where the coin terms will come and go
    const coinTermLayer = new Node();
    this.coinTermLayer = coinTermLayer; // @private, used by a method
    this.addChild(coinTermLayer);

    // add the node that will act as the layer where the expression overlays will come and go
    const expressionOverlayLayer = new Node();
    this.addChild(expressionOverlayLayer);

    // add the buttons for ejecting expressions from the collection area, must be above the expressions in the z-order
    model.collectionAreas.forEach(collectionArea => {
      const undoButton = new UndoButton({
        baseColor: PhetColorScheme.BUTTON_YELLOW,
        listener: () => {
          collectionArea.ejectCollectedItem();
        },
        leftTop: collectionArea.bounds.leftTop
      });
      this.addChild(undoButton);

      // control the visibility of the undo button
      Multilink.multilink([collectionArea.undoAllowedProperty, collectionArea.collectedItemProperty], (undoAllowed, collectedItem) => {
        undoButton.visible = undoAllowed && collectedItem !== null;
      });
    });

    // add the node that will act as the barrier to interaction with other expressions when editing an expression
    let barrierRectangleBounds = null;
    const barrierRectanglePath = new Path(null, {
      fill: 'rgba( 100, 100, 100, 0.5 )',
      visible: false,
      // initially invisible, will become visible when editing an expression
      cursor: 'pointer'
    });
    this.addChild(barrierRectanglePath);

    // Add a listener to the barrier rectangle that will exit the expression editing mode when clicked upon.
    barrierRectanglePath.addInputListener(new PressListener({
      release: () => {
        if (!model.isAnythingUserControlled()) {
          model.stopEditingExpression();
        }
      }
    }));

    // define a function that will update the shape of the barrier rectangle
    function updateBarrierRectangle() {
      const barrierRectangleShape = Shape.bounds(barrierRectangleBounds);
      if (model.expressionBeingEditedProperty.get()) {
        const barrierRectangleHoleBounds = model.expressionBeingEditedProperty.get().getBounds();
        // note - must travel counterclockwise to create a hole
        barrierRectangleShape.moveTo(barrierRectangleHoleBounds.minX, barrierRectangleHoleBounds.minY);
        barrierRectangleShape.lineTo(barrierRectangleHoleBounds.minX, barrierRectangleHoleBounds.maxY);
        barrierRectangleShape.lineTo(barrierRectangleHoleBounds.maxX, barrierRectangleHoleBounds.maxY);
        barrierRectangleShape.lineTo(barrierRectangleHoleBounds.maxX, barrierRectangleHoleBounds.minY);
        barrierRectangleShape.close();
      }
      barrierRectanglePath.setShape(barrierRectangleShape);
    }

    // monitor the view bounds and update the barrier rectangle size
    visibleBoundsProperty.link(visibleBounds => {
      // update the size of the barrier rectangle
      barrierRectangleBounds = visibleBounds;
      updateBarrierRectangle();
    });

    // show the barrier rectangle when an expression is being edited
    let updateHoleMultilink = null;
    model.expressionBeingEditedProperty.link((currentExpressionBeingEdited, previousExpressionBeingEdited) => {
      // if there is an expression being edited, the barrier rectangle should be visible
      barrierRectanglePath.visible = currentExpressionBeingEdited !== null;

      // if there previously was an expression being edited, we need to release the multilink that was watching its size
      if (previousExpressionBeingEdited) {
        assert && assert(updateHoleMultilink, 'expected a multilink to be present');
        Multilink.unmultilink(updateHoleMultilink);
        updateHoleMultilink = null;
      }

      // If there is a new expression being edited, we need to listen to its size and adjust the hole in the barrier if
      // the size changes.
      if (currentExpressionBeingEdited !== null) {
        updateHoleMultilink = Multilink.multilink([currentExpressionBeingEdited.upperLeftCornerProperty, currentExpressionBeingEdited.widthProperty, currentExpressionBeingEdited.heightProperty], () => {
          updateBarrierRectangle();
        });
      }
    });

    // add and remove coin nodes as coins are added and removed from the model
    model.coinTerms.addItemAddedListener(addedCoinTerm => {
      // add the appropriate representation for the coin term
      let coinTermNode;
      if (addedCoinTerm.isConstant) {
        coinTermNode = new ConstantCoinTermNode(addedCoinTerm, model.viewModeProperty, {
          addDragHandler: true,
          dragBounds: visibleBoundsProperty.get(),
          breakApartButtonMode: options.coinTermBreakApartButtonMode
        });
      } else {
        coinTermNode = new VariableCoinTermNode(addedCoinTerm, model.viewModeProperty, model.showCoinValuesProperty, model.showVariableValuesProperty, model.showAllCoefficientsProperty, {
          addDragHandler: true,
          dragBounds: visibleBoundsProperty.get(),
          breakApartButtonMode: options.coinTermBreakApartButtonMode
        });
      }
      coinTermLayer.addChild(coinTermNode);

      // add the coin halo
      const coinTermHaloNode = new CoinTermHaloNode(addedCoinTerm, model.viewModeProperty);
      coinHaloLayer.addChild(coinTermHaloNode);

      // set up a listener to remove the nodes when the corresponding coin is removed from the model
      model.coinTerms.addItemRemovedListener(function removalListener(removedCoinTerm) {
        if (removedCoinTerm === addedCoinTerm) {
          coinTermLayer.removeChild(coinTermNode);
          coinTermNode.dispose();
          coinHaloLayer.removeChild(coinTermHaloNode);
          coinTermHaloNode.dispose();
          model.coinTerms.removeItemRemovedListener(removalListener);
        }
      });
    });

    // add and remove expressions and expression overlays as they come and go
    model.expressions.addItemAddedListener(addedExpression => {
      const expressionNode = new ExpressionNode(addedExpression, model.simplifyNegativesProperty);
      expressionLayer.addChild(expressionNode);
      const expressionOverlayNode = new ExpressionOverlayNode(addedExpression, visibleBoundsProperty.get());
      expressionOverlayLayer.addChild(expressionOverlayNode);

      // set up a listener to remove these nodes when the corresponding expression is removed from the model
      model.expressions.addItemRemovedListener(function removalListener(removedExpression) {
        if (removedExpression === addedExpression) {
          expressionLayer.removeChild(expressionNode);
          expressionNode.dispose();
          expressionOverlayLayer.removeChild(expressionOverlayNode);
          expressionOverlayNode.dispose();
          model.expressions.removeItemRemovedListener(removalListener);
        }
      });
    });

    // add and remove expression hints as they come and go
    model.expressionHints.addItemAddedListener(addedExpressionHint => {
      const expressionHintNode = new ExpressionHintNode(addedExpressionHint, model.viewModeProperty);
      expressionLayer.addChild(expressionHintNode);

      // set up a listener to remove the hint node when the corresponding hint is removed from the model
      model.expressionHints.addItemRemovedListener(function removalListener(removedExpressionHint) {
        if (removedExpressionHint === addedExpressionHint) {
          expressionLayer.removeChild(expressionHintNode);
          expressionHintNode.dispose();
          model.expressionHints.removeItemRemovedListener(removalListener);
        }
      });
    });
  }

  /**
   * get the view node for the provided coin term model element
   * @param {CoinTerm} coinTerm
   * @returns {AbstractCoinTermNode}
   * @public
   */
  getViewForCoinTerm(coinTerm) {
    return this.coinTermLayer.children.find(coinTermNode => coinTermNode.coinTerm === coinTerm);
  }
}
expressionExchange.register('ExpressionManipulationView', ExpressionManipulationView);
export default ExpressionManipulationView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJTaGFwZSIsIm1lcmdlIiwiVW5kb0J1dHRvbiIsIlBoZXRDb2xvclNjaGVtZSIsIk5vZGUiLCJQYXRoIiwiUHJlc3NMaXN0ZW5lciIsImV4cHJlc3Npb25FeGNoYW5nZSIsIkVFQ29sbGVjdGlvbkFyZWFOb2RlIiwiQ29pblRlcm1IYWxvTm9kZSIsIkNvbnN0YW50Q29pblRlcm1Ob2RlIiwiRXhwcmVzc2lvbkhpbnROb2RlIiwiRXhwcmVzc2lvbk5vZGUiLCJFeHByZXNzaW9uT3ZlcmxheU5vZGUiLCJWYXJpYWJsZUNvaW5UZXJtTm9kZSIsIkV4cHJlc3Npb25NYW5pcHVsYXRpb25WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsIm9wdGlvbnMiLCJjb2luVGVybUJyZWFrQXBhcnRCdXR0b25Nb2RlIiwiY29sbGVjdGlvbkFyZWFzIiwiZm9yRWFjaCIsImNvbGxlY3Rpb25BcmVhIiwiYWRkQ2hpbGQiLCJleHByZXNzaW9uTGF5ZXIiLCJjb2luSGFsb0xheWVyIiwiY29pblRlcm1MYXllciIsImV4cHJlc3Npb25PdmVybGF5TGF5ZXIiLCJ1bmRvQnV0dG9uIiwiYmFzZUNvbG9yIiwiQlVUVE9OX1lFTExPVyIsImxpc3RlbmVyIiwiZWplY3RDb2xsZWN0ZWRJdGVtIiwibGVmdFRvcCIsImJvdW5kcyIsIm11bHRpbGluayIsInVuZG9BbGxvd2VkUHJvcGVydHkiLCJjb2xsZWN0ZWRJdGVtUHJvcGVydHkiLCJ1bmRvQWxsb3dlZCIsImNvbGxlY3RlZEl0ZW0iLCJ2aXNpYmxlIiwiYmFycmllclJlY3RhbmdsZUJvdW5kcyIsImJhcnJpZXJSZWN0YW5nbGVQYXRoIiwiZmlsbCIsImN1cnNvciIsImFkZElucHV0TGlzdGVuZXIiLCJyZWxlYXNlIiwiaXNBbnl0aGluZ1VzZXJDb250cm9sbGVkIiwic3RvcEVkaXRpbmdFeHByZXNzaW9uIiwidXBkYXRlQmFycmllclJlY3RhbmdsZSIsImJhcnJpZXJSZWN0YW5nbGVTaGFwZSIsImV4cHJlc3Npb25CZWluZ0VkaXRlZFByb3BlcnR5IiwiZ2V0IiwiYmFycmllclJlY3RhbmdsZUhvbGVCb3VuZHMiLCJnZXRCb3VuZHMiLCJtb3ZlVG8iLCJtaW5YIiwibWluWSIsImxpbmVUbyIsIm1heFkiLCJtYXhYIiwiY2xvc2UiLCJzZXRTaGFwZSIsImxpbmsiLCJ2aXNpYmxlQm91bmRzIiwidXBkYXRlSG9sZU11bHRpbGluayIsImN1cnJlbnRFeHByZXNzaW9uQmVpbmdFZGl0ZWQiLCJwcmV2aW91c0V4cHJlc3Npb25CZWluZ0VkaXRlZCIsImFzc2VydCIsInVubXVsdGlsaW5rIiwidXBwZXJMZWZ0Q29ybmVyUHJvcGVydHkiLCJ3aWR0aFByb3BlcnR5IiwiaGVpZ2h0UHJvcGVydHkiLCJjb2luVGVybXMiLCJhZGRJdGVtQWRkZWRMaXN0ZW5lciIsImFkZGVkQ29pblRlcm0iLCJjb2luVGVybU5vZGUiLCJpc0NvbnN0YW50Iiwidmlld01vZGVQcm9wZXJ0eSIsImFkZERyYWdIYW5kbGVyIiwiZHJhZ0JvdW5kcyIsImJyZWFrQXBhcnRCdXR0b25Nb2RlIiwic2hvd0NvaW5WYWx1ZXNQcm9wZXJ0eSIsInNob3dWYXJpYWJsZVZhbHVlc1Byb3BlcnR5Iiwic2hvd0FsbENvZWZmaWNpZW50c1Byb3BlcnR5IiwiY29pblRlcm1IYWxvTm9kZSIsImFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJyZW1vdmFsTGlzdGVuZXIiLCJyZW1vdmVkQ29pblRlcm0iLCJyZW1vdmVDaGlsZCIsImRpc3Bvc2UiLCJyZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyIiwiZXhwcmVzc2lvbnMiLCJhZGRlZEV4cHJlc3Npb24iLCJleHByZXNzaW9uTm9kZSIsInNpbXBsaWZ5TmVnYXRpdmVzUHJvcGVydHkiLCJleHByZXNzaW9uT3ZlcmxheU5vZGUiLCJyZW1vdmVkRXhwcmVzc2lvbiIsImV4cHJlc3Npb25IaW50cyIsImFkZGVkRXhwcmVzc2lvbkhpbnQiLCJleHByZXNzaW9uSGludE5vZGUiLCJyZW1vdmVkRXhwcmVzc2lvbkhpbnQiLCJnZXRWaWV3Rm9yQ29pblRlcm0iLCJjb2luVGVybSIsImNoaWxkcmVuIiwiZmluZCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRXhwcmVzc2lvbk1hbmlwdWxhdGlvblZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogYSB2aWV3IG5vZGUgdGhhdCBhbGxvd3MgdGhlIHVzZXIgdG8gaW50ZXJhY3Qgd2l0aCBjb2luIHRlcm1zIHRvIGNyZWF0ZSBhbmQgbWFuaXB1bGF0ZSBleHByZXNzaW9uc1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBVbmRvQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1VuZG9CdXR0b24uanMnO1xyXG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBQYXRoLCBQcmVzc0xpc3RlbmVyIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGV4cHJlc3Npb25FeGNoYW5nZSBmcm9tICcuLi8uLi9leHByZXNzaW9uRXhjaGFuZ2UuanMnO1xyXG5pbXBvcnQgRUVDb2xsZWN0aW9uQXJlYU5vZGUgZnJvbSAnLi4vLi4vZ2FtZS92aWV3L0VFQ29sbGVjdGlvbkFyZWFOb2RlLmpzJztcclxuaW1wb3J0IENvaW5UZXJtSGFsb05vZGUgZnJvbSAnLi9Db2luVGVybUhhbG9Ob2RlLmpzJztcclxuaW1wb3J0IENvbnN0YW50Q29pblRlcm1Ob2RlIGZyb20gJy4vQ29uc3RhbnRDb2luVGVybU5vZGUuanMnO1xyXG5pbXBvcnQgRXhwcmVzc2lvbkhpbnROb2RlIGZyb20gJy4vRXhwcmVzc2lvbkhpbnROb2RlLmpzJztcclxuaW1wb3J0IEV4cHJlc3Npb25Ob2RlIGZyb20gJy4vRXhwcmVzc2lvbk5vZGUuanMnO1xyXG5pbXBvcnQgRXhwcmVzc2lvbk92ZXJsYXlOb2RlIGZyb20gJy4vRXhwcmVzc2lvbk92ZXJsYXlOb2RlLmpzJztcclxuaW1wb3J0IFZhcmlhYmxlQ29pblRlcm1Ob2RlIGZyb20gJy4vVmFyaWFibGVDb2luVGVybU5vZGUuanMnO1xyXG5cclxuY2xhc3MgRXhwcmVzc2lvbk1hbmlwdWxhdGlvblZpZXcgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtFeHByZXNzaW9uTWFuaXB1bGF0aW9uTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Qm91bmRzMj59IHZpc2libGVCb3VuZHNQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHZpc2libGVCb3VuZHNQcm9wZXJ0eSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgY29pblRlcm1CcmVha0FwYXJ0QnV0dG9uTW9kZTogJ25vcm1hbCcgLy8gcGFzc2VkIHRocm91Z2ggdG8gdGhlIGNvaW4gdGVybXNcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgZXhwcmVzc2lvbiBjb2xsZWN0aW9uIGFyZWEgbm9kZXNcclxuICAgIG1vZGVsLmNvbGxlY3Rpb25BcmVhcy5mb3JFYWNoKCBjb2xsZWN0aW9uQXJlYSA9PiB7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBFRUNvbGxlY3Rpb25BcmVhTm9kZSggY29sbGVjdGlvbkFyZWEgKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgbm9kZSB0aGF0IHdpbGwgYWN0IGFzIHRoZSBsYXllciB3aGVyZSB0aGUgZXhwcmVzc2lvbiBiYWNrZ3JvdW5kcyBhbmQgZXhwcmVzc2lvbiBoaW50cyB3aWxsIGNvbWUgYW5kIGdvXHJcbiAgICBjb25zdCBleHByZXNzaW9uTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZXhwcmVzc2lvbkxheWVyICk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBub2RlIHRoYXQgd2lsbCBhY3QgYXMgdGhlIGxheWVyIHdoZXJlIHRoZSBjb2luIHRlcm0gaGFsb3Mgd2lsbCBjb21lIGFuZCBnb1xyXG4gICAgY29uc3QgY29pbkhhbG9MYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBjb2luSGFsb0xheWVyICk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBub2RlIHRoYXQgd2lsbCBhY3QgYXMgdGhlIGxheWVyIHdoZXJlIHRoZSBjb2luIHRlcm1zIHdpbGwgY29tZSBhbmQgZ29cclxuICAgIGNvbnN0IGNvaW5UZXJtTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5jb2luVGVybUxheWVyID0gY29pblRlcm1MYXllcjsgLy8gQHByaXZhdGUsIHVzZWQgYnkgYSBtZXRob2RcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGNvaW5UZXJtTGF5ZXIgKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlIG5vZGUgdGhhdCB3aWxsIGFjdCBhcyB0aGUgbGF5ZXIgd2hlcmUgdGhlIGV4cHJlc3Npb24gb3ZlcmxheXMgd2lsbCBjb21lIGFuZCBnb1xyXG4gICAgY29uc3QgZXhwcmVzc2lvbk92ZXJsYXlMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBleHByZXNzaW9uT3ZlcmxheUxheWVyICk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBidXR0b25zIGZvciBlamVjdGluZyBleHByZXNzaW9ucyBmcm9tIHRoZSBjb2xsZWN0aW9uIGFyZWEsIG11c3QgYmUgYWJvdmUgdGhlIGV4cHJlc3Npb25zIGluIHRoZSB6LW9yZGVyXHJcbiAgICBtb2RlbC5jb2xsZWN0aW9uQXJlYXMuZm9yRWFjaCggY29sbGVjdGlvbkFyZWEgPT4ge1xyXG4gICAgICBjb25zdCB1bmRvQnV0dG9uID0gbmV3IFVuZG9CdXR0b24oIHtcclxuICAgICAgICBiYXNlQ29sb3I6IFBoZXRDb2xvclNjaGVtZS5CVVRUT05fWUVMTE9XLFxyXG4gICAgICAgIGxpc3RlbmVyOiAoKSA9PiB7IGNvbGxlY3Rpb25BcmVhLmVqZWN0Q29sbGVjdGVkSXRlbSgpOyB9LFxyXG4gICAgICAgIGxlZnRUb3A6IGNvbGxlY3Rpb25BcmVhLmJvdW5kcy5sZWZ0VG9wXHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggdW5kb0J1dHRvbiApO1xyXG5cclxuICAgICAgLy8gY29udHJvbCB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgdW5kbyBidXR0b25cclxuICAgICAgTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgICBbIGNvbGxlY3Rpb25BcmVhLnVuZG9BbGxvd2VkUHJvcGVydHksIGNvbGxlY3Rpb25BcmVhLmNvbGxlY3RlZEl0ZW1Qcm9wZXJ0eSBdLFxyXG4gICAgICAgICggdW5kb0FsbG93ZWQsIGNvbGxlY3RlZEl0ZW0gKSA9PiB7XHJcbiAgICAgICAgICB1bmRvQnV0dG9uLnZpc2libGUgPSB1bmRvQWxsb3dlZCAmJiBjb2xsZWN0ZWRJdGVtICE9PSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlIG5vZGUgdGhhdCB3aWxsIGFjdCBhcyB0aGUgYmFycmllciB0byBpbnRlcmFjdGlvbiB3aXRoIG90aGVyIGV4cHJlc3Npb25zIHdoZW4gZWRpdGluZyBhbiBleHByZXNzaW9uXHJcbiAgICBsZXQgYmFycmllclJlY3RhbmdsZUJvdW5kcyA9IG51bGw7XHJcbiAgICBjb25zdCBiYXJyaWVyUmVjdGFuZ2xlUGF0aCA9IG5ldyBQYXRoKCBudWxsLCB7XHJcbiAgICAgIGZpbGw6ICdyZ2JhKCAxMDAsIDEwMCwgMTAwLCAwLjUgKScsXHJcbiAgICAgIHZpc2libGU6IGZhbHNlLCAvLyBpbml0aWFsbHkgaW52aXNpYmxlLCB3aWxsIGJlY29tZSB2aXNpYmxlIHdoZW4gZWRpdGluZyBhbiBleHByZXNzaW9uXHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBiYXJyaWVyUmVjdGFuZ2xlUGF0aCApO1xyXG5cclxuICAgIC8vIEFkZCBhIGxpc3RlbmVyIHRvIHRoZSBiYXJyaWVyIHJlY3RhbmdsZSB0aGF0IHdpbGwgZXhpdCB0aGUgZXhwcmVzc2lvbiBlZGl0aW5nIG1vZGUgd2hlbiBjbGlja2VkIHVwb24uXHJcbiAgICBiYXJyaWVyUmVjdGFuZ2xlUGF0aC5hZGRJbnB1dExpc3RlbmVyKCBuZXcgUHJlc3NMaXN0ZW5lcigge1xyXG4gICAgICByZWxlYXNlOiAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCAhbW9kZWwuaXNBbnl0aGluZ1VzZXJDb250cm9sbGVkKCkgKSB7XHJcbiAgICAgICAgICBtb2RlbC5zdG9wRWRpdGluZ0V4cHJlc3Npb24oKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIGRlZmluZSBhIGZ1bmN0aW9uIHRoYXQgd2lsbCB1cGRhdGUgdGhlIHNoYXBlIG9mIHRoZSBiYXJyaWVyIHJlY3RhbmdsZVxyXG4gICAgZnVuY3Rpb24gdXBkYXRlQmFycmllclJlY3RhbmdsZSgpIHtcclxuICAgICAgY29uc3QgYmFycmllclJlY3RhbmdsZVNoYXBlID0gU2hhcGUuYm91bmRzKCBiYXJyaWVyUmVjdGFuZ2xlQm91bmRzICk7XHJcbiAgICAgIGlmICggbW9kZWwuZXhwcmVzc2lvbkJlaW5nRWRpdGVkUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgICAgY29uc3QgYmFycmllclJlY3RhbmdsZUhvbGVCb3VuZHMgPSBtb2RlbC5leHByZXNzaW9uQmVpbmdFZGl0ZWRQcm9wZXJ0eS5nZXQoKS5nZXRCb3VuZHMoKTtcclxuICAgICAgICAvLyBub3RlIC0gbXVzdCB0cmF2ZWwgY291bnRlcmNsb2Nrd2lzZSB0byBjcmVhdGUgYSBob2xlXHJcbiAgICAgICAgYmFycmllclJlY3RhbmdsZVNoYXBlLm1vdmVUbyggYmFycmllclJlY3RhbmdsZUhvbGVCb3VuZHMubWluWCwgYmFycmllclJlY3RhbmdsZUhvbGVCb3VuZHMubWluWSApO1xyXG4gICAgICAgIGJhcnJpZXJSZWN0YW5nbGVTaGFwZS5saW5lVG8oIGJhcnJpZXJSZWN0YW5nbGVIb2xlQm91bmRzLm1pblgsIGJhcnJpZXJSZWN0YW5nbGVIb2xlQm91bmRzLm1heFkgKTtcclxuICAgICAgICBiYXJyaWVyUmVjdGFuZ2xlU2hhcGUubGluZVRvKCBiYXJyaWVyUmVjdGFuZ2xlSG9sZUJvdW5kcy5tYXhYLCBiYXJyaWVyUmVjdGFuZ2xlSG9sZUJvdW5kcy5tYXhZICk7XHJcbiAgICAgICAgYmFycmllclJlY3RhbmdsZVNoYXBlLmxpbmVUbyggYmFycmllclJlY3RhbmdsZUhvbGVCb3VuZHMubWF4WCwgYmFycmllclJlY3RhbmdsZUhvbGVCb3VuZHMubWluWSApO1xyXG4gICAgICAgIGJhcnJpZXJSZWN0YW5nbGVTaGFwZS5jbG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGJhcnJpZXJSZWN0YW5nbGVQYXRoLnNldFNoYXBlKCBiYXJyaWVyUmVjdGFuZ2xlU2hhcGUgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBtb25pdG9yIHRoZSB2aWV3IGJvdW5kcyBhbmQgdXBkYXRlIHRoZSBiYXJyaWVyIHJlY3RhbmdsZSBzaXplXHJcbiAgICB2aXNpYmxlQm91bmRzUHJvcGVydHkubGluayggdmlzaWJsZUJvdW5kcyA9PiB7XHJcblxyXG4gICAgICAvLyB1cGRhdGUgdGhlIHNpemUgb2YgdGhlIGJhcnJpZXIgcmVjdGFuZ2xlXHJcbiAgICAgIGJhcnJpZXJSZWN0YW5nbGVCb3VuZHMgPSB2aXNpYmxlQm91bmRzO1xyXG4gICAgICB1cGRhdGVCYXJyaWVyUmVjdGFuZ2xlKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gc2hvdyB0aGUgYmFycmllciByZWN0YW5nbGUgd2hlbiBhbiBleHByZXNzaW9uIGlzIGJlaW5nIGVkaXRlZFxyXG4gICAgbGV0IHVwZGF0ZUhvbGVNdWx0aWxpbmsgPSBudWxsO1xyXG4gICAgbW9kZWwuZXhwcmVzc2lvbkJlaW5nRWRpdGVkUHJvcGVydHkubGluayggKCBjdXJyZW50RXhwcmVzc2lvbkJlaW5nRWRpdGVkLCBwcmV2aW91c0V4cHJlc3Npb25CZWluZ0VkaXRlZCApID0+IHtcclxuXHJcbiAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGV4cHJlc3Npb24gYmVpbmcgZWRpdGVkLCB0aGUgYmFycmllciByZWN0YW5nbGUgc2hvdWxkIGJlIHZpc2libGVcclxuICAgICAgYmFycmllclJlY3RhbmdsZVBhdGgudmlzaWJsZSA9IGN1cnJlbnRFeHByZXNzaW9uQmVpbmdFZGl0ZWQgIT09IG51bGw7XHJcblxyXG4gICAgICAvLyBpZiB0aGVyZSBwcmV2aW91c2x5IHdhcyBhbiBleHByZXNzaW9uIGJlaW5nIGVkaXRlZCwgd2UgbmVlZCB0byByZWxlYXNlIHRoZSBtdWx0aWxpbmsgdGhhdCB3YXMgd2F0Y2hpbmcgaXRzIHNpemVcclxuICAgICAgaWYgKCBwcmV2aW91c0V4cHJlc3Npb25CZWluZ0VkaXRlZCApIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB1cGRhdGVIb2xlTXVsdGlsaW5rLCAnZXhwZWN0ZWQgYSBtdWx0aWxpbmsgdG8gYmUgcHJlc2VudCcgKTtcclxuICAgICAgICBNdWx0aWxpbmsudW5tdWx0aWxpbmsoIHVwZGF0ZUhvbGVNdWx0aWxpbmsgKTtcclxuICAgICAgICB1cGRhdGVIb2xlTXVsdGlsaW5rID0gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSWYgdGhlcmUgaXMgYSBuZXcgZXhwcmVzc2lvbiBiZWluZyBlZGl0ZWQsIHdlIG5lZWQgdG8gbGlzdGVuIHRvIGl0cyBzaXplIGFuZCBhZGp1c3QgdGhlIGhvbGUgaW4gdGhlIGJhcnJpZXIgaWZcclxuICAgICAgLy8gdGhlIHNpemUgY2hhbmdlcy5cclxuICAgICAgaWYgKCBjdXJyZW50RXhwcmVzc2lvbkJlaW5nRWRpdGVkICE9PSBudWxsICkge1xyXG4gICAgICAgIHVwZGF0ZUhvbGVNdWx0aWxpbmsgPSBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICAgICAgW1xyXG4gICAgICAgICAgICBjdXJyZW50RXhwcmVzc2lvbkJlaW5nRWRpdGVkLnVwcGVyTGVmdENvcm5lclByb3BlcnR5LFxyXG4gICAgICAgICAgICBjdXJyZW50RXhwcmVzc2lvbkJlaW5nRWRpdGVkLndpZHRoUHJvcGVydHksXHJcbiAgICAgICAgICAgIGN1cnJlbnRFeHByZXNzaW9uQmVpbmdFZGl0ZWQuaGVpZ2h0UHJvcGVydHlcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgIHVwZGF0ZUJhcnJpZXJSZWN0YW5nbGUoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWRkIGFuZCByZW1vdmUgY29pbiBub2RlcyBhcyBjb2lucyBhcmUgYWRkZWQgYW5kIHJlbW92ZWQgZnJvbSB0aGUgbW9kZWxcclxuICAgIG1vZGVsLmNvaW5UZXJtcy5hZGRJdGVtQWRkZWRMaXN0ZW5lciggYWRkZWRDb2luVGVybSA9PiB7XHJcblxyXG4gICAgICAvLyBhZGQgdGhlIGFwcHJvcHJpYXRlIHJlcHJlc2VudGF0aW9uIGZvciB0aGUgY29pbiB0ZXJtXHJcbiAgICAgIGxldCBjb2luVGVybU5vZGU7XHJcbiAgICAgIGlmICggYWRkZWRDb2luVGVybS5pc0NvbnN0YW50ICkge1xyXG4gICAgICAgIGNvaW5UZXJtTm9kZSA9IG5ldyBDb25zdGFudENvaW5UZXJtTm9kZShcclxuICAgICAgICAgIGFkZGVkQ29pblRlcm0sXHJcbiAgICAgICAgICBtb2RlbC52aWV3TW9kZVByb3BlcnR5LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBhZGREcmFnSGFuZGxlcjogdHJ1ZSxcclxuICAgICAgICAgICAgZHJhZ0JvdW5kczogdmlzaWJsZUJvdW5kc1Byb3BlcnR5LmdldCgpLFxyXG4gICAgICAgICAgICBicmVha0FwYXJ0QnV0dG9uTW9kZTogb3B0aW9ucy5jb2luVGVybUJyZWFrQXBhcnRCdXR0b25Nb2RlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBjb2luVGVybU5vZGUgPSBuZXcgVmFyaWFibGVDb2luVGVybU5vZGUoXHJcbiAgICAgICAgICBhZGRlZENvaW5UZXJtLFxyXG4gICAgICAgICAgbW9kZWwudmlld01vZGVQcm9wZXJ0eSxcclxuICAgICAgICAgIG1vZGVsLnNob3dDb2luVmFsdWVzUHJvcGVydHksXHJcbiAgICAgICAgICBtb2RlbC5zaG93VmFyaWFibGVWYWx1ZXNQcm9wZXJ0eSxcclxuICAgICAgICAgIG1vZGVsLnNob3dBbGxDb2VmZmljaWVudHNQcm9wZXJ0eSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgYWRkRHJhZ0hhbmRsZXI6IHRydWUsXHJcbiAgICAgICAgICAgIGRyYWdCb3VuZHM6IHZpc2libGVCb3VuZHNQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgICAgICAgYnJlYWtBcGFydEJ1dHRvbk1vZGU6IG9wdGlvbnMuY29pblRlcm1CcmVha0FwYXJ0QnV0dG9uTW9kZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvaW5UZXJtTGF5ZXIuYWRkQ2hpbGQoIGNvaW5UZXJtTm9kZSApO1xyXG5cclxuICAgICAgLy8gYWRkIHRoZSBjb2luIGhhbG9cclxuICAgICAgY29uc3QgY29pblRlcm1IYWxvTm9kZSA9IG5ldyBDb2luVGVybUhhbG9Ob2RlKCBhZGRlZENvaW5UZXJtLCBtb2RlbC52aWV3TW9kZVByb3BlcnR5ICk7XHJcbiAgICAgIGNvaW5IYWxvTGF5ZXIuYWRkQ2hpbGQoIGNvaW5UZXJtSGFsb05vZGUgKTtcclxuXHJcbiAgICAgIC8vIHNldCB1cCBhIGxpc3RlbmVyIHRvIHJlbW92ZSB0aGUgbm9kZXMgd2hlbiB0aGUgY29ycmVzcG9uZGluZyBjb2luIGlzIHJlbW92ZWQgZnJvbSB0aGUgbW9kZWxcclxuICAgICAgbW9kZWwuY29pblRlcm1zLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIGZ1bmN0aW9uIHJlbW92YWxMaXN0ZW5lciggcmVtb3ZlZENvaW5UZXJtICkge1xyXG4gICAgICAgIGlmICggcmVtb3ZlZENvaW5UZXJtID09PSBhZGRlZENvaW5UZXJtICkge1xyXG4gICAgICAgICAgY29pblRlcm1MYXllci5yZW1vdmVDaGlsZCggY29pblRlcm1Ob2RlICk7XHJcbiAgICAgICAgICBjb2luVGVybU5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgY29pbkhhbG9MYXllci5yZW1vdmVDaGlsZCggY29pblRlcm1IYWxvTm9kZSApO1xyXG4gICAgICAgICAgY29pblRlcm1IYWxvTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICBtb2RlbC5jb2luVGVybXMucmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lciggcmVtb3ZhbExpc3RlbmVyICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWRkIGFuZCByZW1vdmUgZXhwcmVzc2lvbnMgYW5kIGV4cHJlc3Npb24gb3ZlcmxheXMgYXMgdGhleSBjb21lIGFuZCBnb1xyXG4gICAgbW9kZWwuZXhwcmVzc2lvbnMuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIGFkZGVkRXhwcmVzc2lvbiA9PiB7XHJcblxyXG4gICAgICBjb25zdCBleHByZXNzaW9uTm9kZSA9IG5ldyBFeHByZXNzaW9uTm9kZSggYWRkZWRFeHByZXNzaW9uLCBtb2RlbC5zaW1wbGlmeU5lZ2F0aXZlc1Byb3BlcnR5ICk7XHJcbiAgICAgIGV4cHJlc3Npb25MYXllci5hZGRDaGlsZCggZXhwcmVzc2lvbk5vZGUgKTtcclxuXHJcbiAgICAgIGNvbnN0IGV4cHJlc3Npb25PdmVybGF5Tm9kZSA9IG5ldyBFeHByZXNzaW9uT3ZlcmxheU5vZGUoIGFkZGVkRXhwcmVzc2lvbiwgdmlzaWJsZUJvdW5kc1Byb3BlcnR5LmdldCgpICk7XHJcbiAgICAgIGV4cHJlc3Npb25PdmVybGF5TGF5ZXIuYWRkQ2hpbGQoIGV4cHJlc3Npb25PdmVybGF5Tm9kZSApO1xyXG5cclxuICAgICAgLy8gc2V0IHVwIGEgbGlzdGVuZXIgdG8gcmVtb3ZlIHRoZXNlIG5vZGVzIHdoZW4gdGhlIGNvcnJlc3BvbmRpbmcgZXhwcmVzc2lvbiBpcyByZW1vdmVkIGZyb20gdGhlIG1vZGVsXHJcbiAgICAgIG1vZGVsLmV4cHJlc3Npb25zLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIGZ1bmN0aW9uIHJlbW92YWxMaXN0ZW5lciggcmVtb3ZlZEV4cHJlc3Npb24gKSB7XHJcbiAgICAgICAgaWYgKCByZW1vdmVkRXhwcmVzc2lvbiA9PT0gYWRkZWRFeHByZXNzaW9uICkge1xyXG4gICAgICAgICAgZXhwcmVzc2lvbkxheWVyLnJlbW92ZUNoaWxkKCBleHByZXNzaW9uTm9kZSApO1xyXG4gICAgICAgICAgZXhwcmVzc2lvbk5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgZXhwcmVzc2lvbk92ZXJsYXlMYXllci5yZW1vdmVDaGlsZCggZXhwcmVzc2lvbk92ZXJsYXlOb2RlICk7XHJcbiAgICAgICAgICBleHByZXNzaW9uT3ZlcmxheU5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgbW9kZWwuZXhwcmVzc2lvbnMucmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lciggcmVtb3ZhbExpc3RlbmVyICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWRkIGFuZCByZW1vdmUgZXhwcmVzc2lvbiBoaW50cyBhcyB0aGV5IGNvbWUgYW5kIGdvXHJcbiAgICBtb2RlbC5leHByZXNzaW9uSGludHMuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIGFkZGVkRXhwcmVzc2lvbkhpbnQgPT4ge1xyXG5cclxuICAgICAgY29uc3QgZXhwcmVzc2lvbkhpbnROb2RlID0gbmV3IEV4cHJlc3Npb25IaW50Tm9kZSggYWRkZWRFeHByZXNzaW9uSGludCwgbW9kZWwudmlld01vZGVQcm9wZXJ0eSApO1xyXG4gICAgICBleHByZXNzaW9uTGF5ZXIuYWRkQ2hpbGQoIGV4cHJlc3Npb25IaW50Tm9kZSApO1xyXG5cclxuICAgICAgLy8gc2V0IHVwIGEgbGlzdGVuZXIgdG8gcmVtb3ZlIHRoZSBoaW50IG5vZGUgd2hlbiB0aGUgY29ycmVzcG9uZGluZyBoaW50IGlzIHJlbW92ZWQgZnJvbSB0aGUgbW9kZWxcclxuICAgICAgbW9kZWwuZXhwcmVzc2lvbkhpbnRzLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIGZ1bmN0aW9uIHJlbW92YWxMaXN0ZW5lciggcmVtb3ZlZEV4cHJlc3Npb25IaW50ICkge1xyXG4gICAgICAgIGlmICggcmVtb3ZlZEV4cHJlc3Npb25IaW50ID09PSBhZGRlZEV4cHJlc3Npb25IaW50ICkge1xyXG4gICAgICAgICAgZXhwcmVzc2lvbkxheWVyLnJlbW92ZUNoaWxkKCBleHByZXNzaW9uSGludE5vZGUgKTtcclxuICAgICAgICAgIGV4cHJlc3Npb25IaW50Tm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICBtb2RlbC5leHByZXNzaW9uSGludHMucmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lciggcmVtb3ZhbExpc3RlbmVyICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBnZXQgdGhlIHZpZXcgbm9kZSBmb3IgdGhlIHByb3ZpZGVkIGNvaW4gdGVybSBtb2RlbCBlbGVtZW50XHJcbiAgICogQHBhcmFtIHtDb2luVGVybX0gY29pblRlcm1cclxuICAgKiBAcmV0dXJucyB7QWJzdHJhY3RDb2luVGVybU5vZGV9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFZpZXdGb3JDb2luVGVybSggY29pblRlcm0gKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jb2luVGVybUxheWVyLmNoaWxkcmVuLmZpbmQoIGNvaW5UZXJtTm9kZSA9PiBjb2luVGVybU5vZGUuY29pblRlcm0gPT09IGNvaW5UZXJtICk7XHJcbiAgfVxyXG59XHJcblxyXG5leHByZXNzaW9uRXhjaGFuZ2UucmVnaXN0ZXIoICdFeHByZXNzaW9uTWFuaXB1bGF0aW9uVmlldycsIEV4cHJlc3Npb25NYW5pcHVsYXRpb25WaWV3ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBFeHByZXNzaW9uTWFuaXB1bGF0aW9uVmlldzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsVUFBVSxNQUFNLG1EQUFtRDtBQUMxRSxPQUFPQyxlQUFlLE1BQU0sZ0RBQWdEO0FBQzVFLFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxhQUFhLFFBQVEsbUNBQW1DO0FBQzdFLE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUM1RCxPQUFPQyxvQkFBb0IsTUFBTSx5Q0FBeUM7QUFDMUUsT0FBT0MsZ0JBQWdCLE1BQU0sdUJBQXVCO0FBQ3BELE9BQU9DLG9CQUFvQixNQUFNLDJCQUEyQjtBQUM1RCxPQUFPQyxr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