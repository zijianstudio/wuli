// Copyright 2015-2023, University of Colorado Boulder

/**
 * Abstract base type for displaying things that are common to all scenes.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import { Node } from '../../../../scenery/js/imports.js';
import Carousel from '../../../../sun/js/Carousel.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import PageControl from '../../../../sun/js/PageControl.js';
import functionBuilder from '../../functionBuilder.js';
import FBQueryParameters from '../FBQueryParameters.js';
import BuilderEndNode from './builder/BuilderEndNode.js';
import BuilderNode from './builder/BuilderNode.js';
import FunctionContainer from './containers/FunctionContainer.js';
import FBIconFactory from './FBIconFactory.js';
import OutputCardsCarousel from './OutputCardsCarousel.js';
import SeeInsideLayer from './SeeInsideLayer.js';

// constants
const PAGE_CONTROL_SPACING = 8; // space between page controls and their associated carousels
const PAGE_CONTROL_OPTIONS = {
  interactive: true
};
export default class SceneNode extends Node {
  /**
   * @param {Scene} scene - model for this scene
   * @param {Bounds2} layoutBounds - layoutBounds of the parent ScreenView
   * @param {constructor} functionNodeConstructor - constructor for FunctionNode subtype
   * @param {Object} [options]
   */
  constructor(scene, layoutBounds, functionNodeConstructor, options) {
    options = merge({
      seeInside: false,
      // {boolean} initial value of seeInsideProperty
      hideFunctions: false,
      // {boolean} initial value of hideFunctionsProperty
      cardCarouselDefaultPageNumber: 0,
      // {number} initial page number for card carousels
      cardsPerPage: 4,
      // {number} cards per page in the input and output carousels
      functionsPerPage: 3,
      // {number} functions per page in the functions carousel
      seeInsideIconType: 'number',
      // {string} see FBIconFactory.createSeeInsideIcon
      functionCarouselVisible: true,
      // {boolean} is the function carousel visible?
      hideFunctionsCheckboxVisible: true // {boolean} is hideFunctionsCheckbox visible?
    }, options);
    super();
    phet.log && phet.log(`${this.constructor.name}.initialize`);

    // @protected show/hide windows that allow you to 'see inside' the builder
    this.seeInsideProperty = new BooleanProperty(options.seeInside);

    // @private should the identity of functions in the builder be hidden?
    this.hideFunctionsProperty = new BooleanProperty(options.hideFunctions);

    // cards are in this layer while they are draggable
    const cardsDragLayer = new Node();

    // functions are in this layer while they are draggable
    const functionsDragLayer = new Node();

    // basic UI controls get added to this layer
    const controlsLayer = new Node();

    // drawers get added to this layer by subtypes
    const drawersLayer = new Node();

    // Builder, ends are separate nodes to provide illusion of dragging cards through the builder
    const builder = scene.builder;
    const BUILDER_END_OPTIONS = {
      radiusX: 15,
      radiusY: builder.endHeight / 2,
      fill: builder.colorScheme.ends,
      centerY: builder.position.y
    };
    const builderLeftEndNode = new BuilderEndNode('left', merge({}, BUILDER_END_OPTIONS, {
      centerX: builder.left
    }));
    const builderRightEndNode = new BuilderEndNode('right', merge({}, BUILDER_END_OPTIONS, {
      centerX: builder.right
    }));
    const builderNode = new BuilderNode(builder, this.hideFunctionsProperty, {
      endRadiusX: BUILDER_END_OPTIONS.radiusX,
      slotFill: null
    });

    // Input carousel --------------------------------------------------------------------------------------------------

    // Input carousel, at left
    const inputCarousel = new Carousel(this.createCardCarouselItems(scene), {
      orientation: 'vertical',
      separatorsVisible: true,
      itemsPerPage: options.cardsPerPage,
      defaultPageNumber: options.cardCarouselDefaultPageNumber,
      buttonOptions: {
        touchAreaXDilation: 5,
        touchAreaYDilation: 15
      },
      spacing: 20,
      margin: 10,
      left: layoutBounds.left + 30,
      top: layoutBounds.top + 50
    });

    // Page control for input carousel
    const inputPageControl = new PageControl(inputCarousel.pageNumberProperty, inputCarousel.numberOfPagesProperty, merge({
      orientation: 'vertical',
      right: inputCarousel.left - PAGE_CONTROL_SPACING,
      centerY: inputCarousel.centerY
    }, PAGE_CONTROL_OPTIONS));
    controlsLayer.addChild(inputPageControl);

    // Output carousel ------------------------------------------------------------------------------------------------

    // Containers in the output carousel
    const outputContainers = this.createCardCarouselItems(scene, {
      emptyNode: null // don't show anything in empty output containers
    });

    // Output carousel, at right
    const outputCarousel = new OutputCardsCarousel(outputContainers, {
      orientation: 'vertical',
      separatorsVisible: true,
      itemsPerPage: options.cardsPerPage,
      defaultPageNumber: options.cardCarouselDefaultPageNumber,
      buttonTouchAreaXDilation: 5,
      buttonTouchAreaYDilation: 15,
      spacing: 20,
      margin: 10,
      right: layoutBounds.right - (inputCarousel.left - layoutBounds.left),
      bottom: inputCarousel.bottom
    });

    // Page control for output carousel
    const outputPageControl = new PageControl(outputCarousel.pageNumberProperty, outputCarousel.numberOfPagesProperty, merge({
      orientation: 'vertical',
      left: outputCarousel.right + PAGE_CONTROL_SPACING,
      centerY: outputCarousel.centerY
    }, PAGE_CONTROL_OPTIONS));
    controlsLayer.addChild(outputPageControl);

    // Eraser button, centered below the output carousel
    const eraserButton = new EraserButton({
      listener: () => this.erase(),
      iconWidth: 28,
      centerX: outputCarousel.centerX,
      top: outputCarousel.bottom + 25
    });
    controlsLayer.addChild(eraserButton);
    eraserButton.touchArea = eraserButton.localBounds.dilatedXY(10, 5);

    // Disable the eraser button when the output carousel is empty.
    // unlink unnecessary, instances exist for lifetime of the sim.
    outputCarousel.numberOfCardsProperty.link(numberOfCards => {
      eraserButton.enabled = numberOfCards > 0;
    });

    // Function carousel ----------------------------------------------------------------------------------------------

    // Containers in the function carousel
    const functionCarouselItems = createFunctionCarouselItems(scene.functionCreators, functionNodeConstructor);

    // Function carousel, centered below bottom builder
    const functionCarousel = new Carousel(functionCarouselItems, {
      visible: options.functionCarouselVisible,
      orientation: 'horizontal',
      itemsPerPage: options.functionsPerPage,
      spacing: 12,
      margin: 10,
      buttonTouchAreaXDilation: 15,
      buttonTouchAreaYDilation: 5,
      centerX: layoutBounds.centerX,
      bottom: layoutBounds.bottom - 25
    });

    // Page control for function carousel
    const functionPageControl = new PageControl(functionCarousel.pageNumberProperty, functionCarousel.numberOfPagesProperty, merge({
      visible: options.functionCarouselVisible,
      orientation: 'horizontal',
      centerX: functionCarousel.centerX,
      top: functionCarousel.bottom + PAGE_CONTROL_SPACING
    }, PAGE_CONTROL_OPTIONS));
    controlsLayer.addChild(functionPageControl);

    //------------------------------------------------------------------------------------------------------------------

    // Link the input and output carousels, so that they display the same page number.
    // unlink unnecessary, instances exist for lifetime of the sim.
    assert && assert(inputCarousel.numberOfPagesProperty.value === outputCarousel.numberOfPagesProperty.value);
    inputCarousel.pageNumberProperty.link(pageNumber => {
      outputCarousel.pageNumberProperty.set(pageNumber);
    });
    outputCarousel.pageNumberProperty.link(pageNumber => {
      inputCarousel.pageNumberProperty.set(pageNumber);
    });

    // 'Hide Functions' feature ----------------------------------------------------------------------------------------

    const hideFunctionsCheckbox = new Checkbox(this.hideFunctionsProperty, FBIconFactory.createHideFunctionsIcon(), {
      visible: options.hideFunctionsCheckboxVisible,
      spacing: 8,
      left: inputCarousel.left,
      top: functionCarousel.top
    });
    controlsLayer.addChild(hideFunctionsCheckbox);
    hideFunctionsCheckbox.touchArea = hideFunctionsCheckbox.localBounds.dilatedXY(10, 10);

    // 'See Inside' feature --------------------------------------------------------------------------------------------

    const seeInsideLayer = new SeeInsideLayer(scene.builder, {
      visible: this.seeInsideProperty.get()
    });
    const seeInsideCheckbox = new Checkbox(this.seeInsideProperty, FBIconFactory.createSeeInsideIcon({
      iconType: options.seeInsideIconType
    }), {
      spacing: 8,
      left: hideFunctionsCheckbox.left,
      top: hideFunctionsCheckbox.bottom + 25
    });
    controlsLayer.addChild(seeInsideCheckbox);
    seeInsideCheckbox.touchArea = seeInsideCheckbox.localBounds.dilatedXY(10, 10);

    // unlink unnecessary, instances exist for lifetime of the sim
    this.seeInsideProperty.link(seeInside => {
      seeInsideLayer.visible = seeInside;
    });

    //------------------------------------------------------------------------------------------------------------------

    // rendering order
    assert && assert(!options.children, 'decoration not supported');
    options.children = [controlsLayer, inputCarousel,
    // 1 clipArea
    outputCarousel,
    // 1 clipArea
    functionCarousel,
    // 1 clipArea
    drawersLayer,
    // table drawer: 2 clipAreas; graph drawer: 1 clipArea; equation drawer: 1 clipArea
    builderLeftEndNode, builderRightEndNode, cardsDragLayer,
    // must be between the builder ends and the builder
    builderNode,
    // 1 clipArea
    seeInsideLayer,
    // 1 clipArea
    functionsDragLayer];
    this.mutate(options);

    //------------------------------------------------------------------------------------------------------------------
    // Define properties in one place, so we can see what's available and document visibility

    // @private populated by completeInitialization, needed by reset
    this.functionNodes = []; // {FunctionNode[]}
    this.cardNodes = []; // {CardNode[]}

    // @private needed by prototype functions
    this.scene = scene;
    this.cardsDragLayer = cardsDragLayer;
    this.seeInsideLayer = seeInsideLayer;
    this.inputCarousel = inputCarousel;
    this.outputCarousel = outputCarousel;

    // @protected needed by subtypes
    this.drawersLayer = drawersLayer;
    this.controlsLayer = controlsLayer;
    this.functionsDragLayer = functionsDragLayer;
    this.builderNode = builderNode;
    this.functionCarousel = functionCarousel;
    this.inputContainers = inputCarousel.carouselItemNodes;
    this.outputContainers = outputCarousel.carouselItemNodes;
    assert && assert(this.inputContainers.length === this.outputContainers.length);
    this.functionContainers = functionCarousel.carouselItemNodes;
    this.seeInsideCheckbox = seeInsideCheckbox;
  }

  // @public
  reset() {
    this.seeInsideProperty.reset();
    this.hideFunctionsProperty.reset();
    this.resetCarousels();
    this.builderNode.reset();
    this.resetFunctions();
    this.resetCards();
  }

  /**
   * Returns all functions to the function carousel
   *
   * @protected
   */
  resetFunctions() {
    this.functionNodes.forEach(functionNode => functionNode.moveToCarousel());
  }

  /**
   * Returns all cards to the input carousel
   *
   * @protected
   */
  resetCards() {
    this.cardNodes.forEach(cardNode => cardNode.moveToInputCarousel());
  }

  /**
   * Resets the carousels without animation.
   *
   * @protected
   */
  resetCarousels() {
    this.functionCarousel.reset();

    // Because the input and output carousels are linked, we need to use this approach:
    this.inputCarousel.animationEnabled = this.outputCarousel.animationEnabled = false;
    this.inputCarousel.reset();
    this.outputCarousel.reset();
    this.inputCarousel.animationEnabled = this.outputCarousel.animationEnabled = true;
  }

  // @protected called when the 'eraser' button is pressed
  erase() {
    this.outputCarousel.erase();
  }

  /**
   * Completes initialization of the scene. This cannot be done until the scene is attached
   * to a ScreenView, because we need to know the position of the containers in the carousels.
   *
   * @public
   */
  completeInitialization() {
    assert && assert(hasScreenViewAncestor(this), 'call this function after attaching to ScreenView');
    this.populateFunctionCarousels();
    this.populateCardCarousels();
  }

  // @private populates the function carousel
  populateFunctionCarousels() {
    this.functionCarousel.animationEnabled = false;
    this.functionContainers.forEach((functionContainer, i) => {
      // function container's position
      functionContainer.carouselPosition = getCarouselPosition(this.functionCarousel, this.functionCarousel.items[i], this.functionsDragLayer);

      // populate the container with functions
      functionContainer.createFunctions(this.scene.numberOfEachFunction, this.scene, this.builderNode, this.functionsDragLayer);

      // get the functions that were added, needed for reset
      this.functionNodes = this.functionNodes.concat(functionContainer.getContents());
    });
    this.functionCarousel.pageNumberProperty.reset();
    this.functionCarousel.animationEnabled = true;
  }

  // @private populates the card carousels
  populateCardCarousels() {
    this.inputCarousel.animationEnabled = this.outputCarousel.animationEnabled = false;
    for (let i = 0; i < this.inputContainers.length; i++) {
      // input container's position
      const inputContainer = this.inputContainers[i];
      inputContainer.carouselPosition = getCarouselPosition(this.inputCarousel, this.inputCarousel.items[i], this.cardsDragLayer);

      // output container's position
      const outputContainer = this.outputContainers[i];
      outputContainer.carouselPosition = getCarouselPosition(this.outputCarousel, this.outputCarousel.items[i], this.cardsDragLayer);

      // populate the input container with cards
      inputContainer.createCards(this.scene.numberOfEachCard, this.scene, inputContainer, outputContainer, this.builderNode, this.cardsDragLayer, this.seeInsideLayer, this.seeInsideProperty);

      // get the cards that were added, needed for reset
      this.cardNodes = this.cardNodes.concat(inputContainer.getContents());
    }
    this.inputCarousel.pageNumberProperty.reset();
    this.outputCarousel.pageNumberProperty.reset();
    this.inputCarousel.animationEnabled = this.outputCarousel.animationEnabled = true;

    // move 1 of each card to the output carousel, for testing
    if (FBQueryParameters.populateOutput) {
      this.populateOutputCarousel();
    }
  }

  /**
   * Moves 1 of each card to the output carousel, used for testing.
   * If an outputContainer already contains cards, this is a no-op for that container.
   *
   * @public
   */
  populateOutputCarousel() {
    for (let i = 0; i < this.outputCarousel.carouselItemNodes.length; i++) {
      const outputContainer = this.outputCarousel.carouselItemNodes[i];
      if (outputContainer.isEmpty()) {
        const inputContainer = this.inputCarousel.carouselItemNodes[i];
        const cardNode = inputContainer.getContents()[0];
        inputContainer.removeNode(cardNode);
        outputContainer.addNode(cardNode);
      }
    }
  }

  /**
   * Creates the card containers that go in the card carousels.
   *
   * @param {Scene} scene
   * @param {Object} [containerOptions]
   * @returns {CarouselItem[]}
   * @protected
   * @abstract
   */
  createCardCarouselItems(scene, containerOptions) {
    throw new Error('must be implemented by subtype');
  }
}

/**
 * For a container that is visible in some carousel, gets the position of the container in the global coordinate frame.
 *
 * @param {Carousel} carousel
 * @param {CarouselItem} carouselItem
 * @param {Node} worldParent
 * @returns {Vector2}
 */
function getCarouselPosition(carousel, carouselItem, worldParent) {
  assert && assert(!carousel.animationEnabled);
  carousel.scrollToItem(carouselItem);
  const node = carousel.getNodeForItem(carouselItem);
  return worldParent.globalToLocalPoint(node.parentToGlobalPoint(node.center));
}

/**
 * Has this Node been attached beneath a ScreenView?
 * This is a pre-requisite to calling completeInitialization.
 *
 * @param {Node} node
 * @returns {boolean}
 */
function hasScreenViewAncestor(node) {
  let found = false;
  while (!found && node !== null) {
    const parent = node.getParent();
    found = parent instanceof ScreenView;
    node = parent; // move up the scene graph by one level
  }

  return found;
}

/**
 * Creates the function containers that go in the function carousel.
 *
 * @param {FunctionCreator[]} functionCreators
 * @param {constructor} functionNodeConstructor - constructor for subtype of FunctionNode
 * @param {Object} [containerOptions] - see ImageFunctionContainer options
 * @returns {FunctionContainer[]}
 * @private
 */
function createFunctionCarouselItems(functionCreators, functionNodeConstructor, containerOptions) {
  return functionCreators.map(functionCreator => {
    return {
      createNode: () => new FunctionContainer(functionCreator, functionNodeConstructor, containerOptions)
    };
  });
}
functionBuilder.register('SceneNode', SceneNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJTY3JlZW5WaWV3IiwibWVyZ2UiLCJFcmFzZXJCdXR0b24iLCJOb2RlIiwiQ2Fyb3VzZWwiLCJDaGVja2JveCIsIlBhZ2VDb250cm9sIiwiZnVuY3Rpb25CdWlsZGVyIiwiRkJRdWVyeVBhcmFtZXRlcnMiLCJCdWlsZGVyRW5kTm9kZSIsIkJ1aWxkZXJOb2RlIiwiRnVuY3Rpb25Db250YWluZXIiLCJGQkljb25GYWN0b3J5IiwiT3V0cHV0Q2FyZHNDYXJvdXNlbCIsIlNlZUluc2lkZUxheWVyIiwiUEFHRV9DT05UUk9MX1NQQUNJTkciLCJQQUdFX0NPTlRST0xfT1BUSU9OUyIsImludGVyYWN0aXZlIiwiU2NlbmVOb2RlIiwiY29uc3RydWN0b3IiLCJzY2VuZSIsImxheW91dEJvdW5kcyIsImZ1bmN0aW9uTm9kZUNvbnN0cnVjdG9yIiwib3B0aW9ucyIsInNlZUluc2lkZSIsImhpZGVGdW5jdGlvbnMiLCJjYXJkQ2Fyb3VzZWxEZWZhdWx0UGFnZU51bWJlciIsImNhcmRzUGVyUGFnZSIsImZ1bmN0aW9uc1BlclBhZ2UiLCJzZWVJbnNpZGVJY29uVHlwZSIsImZ1bmN0aW9uQ2Fyb3VzZWxWaXNpYmxlIiwiaGlkZUZ1bmN0aW9uc0NoZWNrYm94VmlzaWJsZSIsInBoZXQiLCJsb2ciLCJuYW1lIiwic2VlSW5zaWRlUHJvcGVydHkiLCJoaWRlRnVuY3Rpb25zUHJvcGVydHkiLCJjYXJkc0RyYWdMYXllciIsImZ1bmN0aW9uc0RyYWdMYXllciIsImNvbnRyb2xzTGF5ZXIiLCJkcmF3ZXJzTGF5ZXIiLCJidWlsZGVyIiwiQlVJTERFUl9FTkRfT1BUSU9OUyIsInJhZGl1c1giLCJyYWRpdXNZIiwiZW5kSGVpZ2h0IiwiZmlsbCIsImNvbG9yU2NoZW1lIiwiZW5kcyIsImNlbnRlclkiLCJwb3NpdGlvbiIsInkiLCJidWlsZGVyTGVmdEVuZE5vZGUiLCJjZW50ZXJYIiwibGVmdCIsImJ1aWxkZXJSaWdodEVuZE5vZGUiLCJyaWdodCIsImJ1aWxkZXJOb2RlIiwiZW5kUmFkaXVzWCIsInNsb3RGaWxsIiwiaW5wdXRDYXJvdXNlbCIsImNyZWF0ZUNhcmRDYXJvdXNlbEl0ZW1zIiwib3JpZW50YXRpb24iLCJzZXBhcmF0b3JzVmlzaWJsZSIsIml0ZW1zUGVyUGFnZSIsImRlZmF1bHRQYWdlTnVtYmVyIiwiYnV0dG9uT3B0aW9ucyIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsInNwYWNpbmciLCJtYXJnaW4iLCJ0b3AiLCJpbnB1dFBhZ2VDb250cm9sIiwicGFnZU51bWJlclByb3BlcnR5IiwibnVtYmVyT2ZQYWdlc1Byb3BlcnR5IiwiYWRkQ2hpbGQiLCJvdXRwdXRDb250YWluZXJzIiwiZW1wdHlOb2RlIiwib3V0cHV0Q2Fyb3VzZWwiLCJidXR0b25Ub3VjaEFyZWFYRGlsYXRpb24iLCJidXR0b25Ub3VjaEFyZWFZRGlsYXRpb24iLCJib3R0b20iLCJvdXRwdXRQYWdlQ29udHJvbCIsImVyYXNlckJ1dHRvbiIsImxpc3RlbmVyIiwiZXJhc2UiLCJpY29uV2lkdGgiLCJ0b3VjaEFyZWEiLCJsb2NhbEJvdW5kcyIsImRpbGF0ZWRYWSIsIm51bWJlck9mQ2FyZHNQcm9wZXJ0eSIsImxpbmsiLCJudW1iZXJPZkNhcmRzIiwiZW5hYmxlZCIsImZ1bmN0aW9uQ2Fyb3VzZWxJdGVtcyIsImNyZWF0ZUZ1bmN0aW9uQ2Fyb3VzZWxJdGVtcyIsImZ1bmN0aW9uQ3JlYXRvcnMiLCJmdW5jdGlvbkNhcm91c2VsIiwidmlzaWJsZSIsImZ1bmN0aW9uUGFnZUNvbnRyb2wiLCJhc3NlcnQiLCJ2YWx1ZSIsInBhZ2VOdW1iZXIiLCJzZXQiLCJoaWRlRnVuY3Rpb25zQ2hlY2tib3giLCJjcmVhdGVIaWRlRnVuY3Rpb25zSWNvbiIsInNlZUluc2lkZUxheWVyIiwiZ2V0Iiwic2VlSW5zaWRlQ2hlY2tib3giLCJjcmVhdGVTZWVJbnNpZGVJY29uIiwiaWNvblR5cGUiLCJjaGlsZHJlbiIsIm11dGF0ZSIsImZ1bmN0aW9uTm9kZXMiLCJjYXJkTm9kZXMiLCJpbnB1dENvbnRhaW5lcnMiLCJjYXJvdXNlbEl0ZW1Ob2RlcyIsImxlbmd0aCIsImZ1bmN0aW9uQ29udGFpbmVycyIsInJlc2V0IiwicmVzZXRDYXJvdXNlbHMiLCJyZXNldEZ1bmN0aW9ucyIsInJlc2V0Q2FyZHMiLCJmb3JFYWNoIiwiZnVuY3Rpb25Ob2RlIiwibW92ZVRvQ2Fyb3VzZWwiLCJjYXJkTm9kZSIsIm1vdmVUb0lucHV0Q2Fyb3VzZWwiLCJhbmltYXRpb25FbmFibGVkIiwiY29tcGxldGVJbml0aWFsaXphdGlvbiIsImhhc1NjcmVlblZpZXdBbmNlc3RvciIsInBvcHVsYXRlRnVuY3Rpb25DYXJvdXNlbHMiLCJwb3B1bGF0ZUNhcmRDYXJvdXNlbHMiLCJmdW5jdGlvbkNvbnRhaW5lciIsImkiLCJjYXJvdXNlbFBvc2l0aW9uIiwiZ2V0Q2Fyb3VzZWxQb3NpdGlvbiIsIml0ZW1zIiwiY3JlYXRlRnVuY3Rpb25zIiwibnVtYmVyT2ZFYWNoRnVuY3Rpb24iLCJjb25jYXQiLCJnZXRDb250ZW50cyIsImlucHV0Q29udGFpbmVyIiwib3V0cHV0Q29udGFpbmVyIiwiY3JlYXRlQ2FyZHMiLCJudW1iZXJPZkVhY2hDYXJkIiwicG9wdWxhdGVPdXRwdXQiLCJwb3B1bGF0ZU91dHB1dENhcm91c2VsIiwiaXNFbXB0eSIsInJlbW92ZU5vZGUiLCJhZGROb2RlIiwiY29udGFpbmVyT3B0aW9ucyIsIkVycm9yIiwiY2Fyb3VzZWwiLCJjYXJvdXNlbEl0ZW0iLCJ3b3JsZFBhcmVudCIsInNjcm9sbFRvSXRlbSIsIm5vZGUiLCJnZXROb2RlRm9ySXRlbSIsImdsb2JhbFRvTG9jYWxQb2ludCIsInBhcmVudFRvR2xvYmFsUG9pbnQiLCJjZW50ZXIiLCJmb3VuZCIsInBhcmVudCIsImdldFBhcmVudCIsIm1hcCIsImZ1bmN0aW9uQ3JlYXRvciIsImNyZWF0ZU5vZGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNjZW5lTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBYnN0cmFjdCBiYXNlIHR5cGUgZm9yIGRpc3BsYXlpbmcgdGhpbmdzIHRoYXQgYXJlIGNvbW1vbiB0byBhbGwgc2NlbmVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBFcmFzZXJCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvRXJhc2VyQnV0dG9uLmpzJztcclxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDYXJvdXNlbCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ2Fyb3VzZWwuanMnO1xyXG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcclxuaW1wb3J0IFBhZ2VDb250cm9sIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYWdlQ29udHJvbC5qcyc7XHJcbmltcG9ydCBmdW5jdGlvbkJ1aWxkZXIgZnJvbSAnLi4vLi4vZnVuY3Rpb25CdWlsZGVyLmpzJztcclxuaW1wb3J0IEZCUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uL0ZCUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IEJ1aWxkZXJFbmROb2RlIGZyb20gJy4vYnVpbGRlci9CdWlsZGVyRW5kTm9kZS5qcyc7XHJcbmltcG9ydCBCdWlsZGVyTm9kZSBmcm9tICcuL2J1aWxkZXIvQnVpbGRlck5vZGUuanMnO1xyXG5pbXBvcnQgRnVuY3Rpb25Db250YWluZXIgZnJvbSAnLi9jb250YWluZXJzL0Z1bmN0aW9uQ29udGFpbmVyLmpzJztcclxuaW1wb3J0IEZCSWNvbkZhY3RvcnkgZnJvbSAnLi9GQkljb25GYWN0b3J5LmpzJztcclxuaW1wb3J0IE91dHB1dENhcmRzQ2Fyb3VzZWwgZnJvbSAnLi9PdXRwdXRDYXJkc0Nhcm91c2VsLmpzJztcclxuaW1wb3J0IFNlZUluc2lkZUxheWVyIGZyb20gJy4vU2VlSW5zaWRlTGF5ZXIuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFBBR0VfQ09OVFJPTF9TUEFDSU5HID0gODsgLy8gc3BhY2UgYmV0d2VlbiBwYWdlIGNvbnRyb2xzIGFuZCB0aGVpciBhc3NvY2lhdGVkIGNhcm91c2Vsc1xyXG5jb25zdCBQQUdFX0NPTlRST0xfT1BUSU9OUyA9IHtcclxuICBpbnRlcmFjdGl2ZTogdHJ1ZVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NlbmVOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7U2NlbmV9IHNjZW5lIC0gbW9kZWwgZm9yIHRoaXMgc2NlbmVcclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IGxheW91dEJvdW5kcyAtIGxheW91dEJvdW5kcyBvZiB0aGUgcGFyZW50IFNjcmVlblZpZXdcclxuICAgKiBAcGFyYW0ge2NvbnN0cnVjdG9yfSBmdW5jdGlvbk5vZGVDb25zdHJ1Y3RvciAtIGNvbnN0cnVjdG9yIGZvciBGdW5jdGlvbk5vZGUgc3VidHlwZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc2NlbmUsIGxheW91dEJvdW5kcywgZnVuY3Rpb25Ob2RlQ29uc3RydWN0b3IsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHNlZUluc2lkZTogZmFsc2UsIC8vIHtib29sZWFufSBpbml0aWFsIHZhbHVlIG9mIHNlZUluc2lkZVByb3BlcnR5XHJcbiAgICAgIGhpZGVGdW5jdGlvbnM6IGZhbHNlLCAvLyB7Ym9vbGVhbn0gaW5pdGlhbCB2YWx1ZSBvZiBoaWRlRnVuY3Rpb25zUHJvcGVydHlcclxuICAgICAgY2FyZENhcm91c2VsRGVmYXVsdFBhZ2VOdW1iZXI6IDAsIC8vIHtudW1iZXJ9IGluaXRpYWwgcGFnZSBudW1iZXIgZm9yIGNhcmQgY2Fyb3VzZWxzXHJcbiAgICAgIGNhcmRzUGVyUGFnZTogNCwgLy8ge251bWJlcn0gY2FyZHMgcGVyIHBhZ2UgaW4gdGhlIGlucHV0IGFuZCBvdXRwdXQgY2Fyb3VzZWxzXHJcbiAgICAgIGZ1bmN0aW9uc1BlclBhZ2U6IDMsIC8vIHtudW1iZXJ9IGZ1bmN0aW9ucyBwZXIgcGFnZSBpbiB0aGUgZnVuY3Rpb25zIGNhcm91c2VsXHJcbiAgICAgIHNlZUluc2lkZUljb25UeXBlOiAnbnVtYmVyJywgLy8ge3N0cmluZ30gc2VlIEZCSWNvbkZhY3RvcnkuY3JlYXRlU2VlSW5zaWRlSWNvblxyXG4gICAgICBmdW5jdGlvbkNhcm91c2VsVmlzaWJsZTogdHJ1ZSwgLy8ge2Jvb2xlYW59IGlzIHRoZSBmdW5jdGlvbiBjYXJvdXNlbCB2aXNpYmxlP1xyXG4gICAgICBoaWRlRnVuY3Rpb25zQ2hlY2tib3hWaXNpYmxlOiB0cnVlIC8vIHtib29sZWFufSBpcyBoaWRlRnVuY3Rpb25zQ2hlY2tib3ggdmlzaWJsZT9cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcigpO1xyXG4gICAgcGhldC5sb2cgJiYgcGhldC5sb2coIGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0uaW5pdGlhbGl6ZWAgKTtcclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkIHNob3cvaGlkZSB3aW5kb3dzIHRoYXQgYWxsb3cgeW91IHRvICdzZWUgaW5zaWRlJyB0aGUgYnVpbGRlclxyXG4gICAgdGhpcy5zZWVJbnNpZGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIG9wdGlvbnMuc2VlSW5zaWRlICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgc2hvdWxkIHRoZSBpZGVudGl0eSBvZiBmdW5jdGlvbnMgaW4gdGhlIGJ1aWxkZXIgYmUgaGlkZGVuP1xyXG4gICAgdGhpcy5oaWRlRnVuY3Rpb25zUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBvcHRpb25zLmhpZGVGdW5jdGlvbnMgKTtcclxuXHJcbiAgICAvLyBjYXJkcyBhcmUgaW4gdGhpcyBsYXllciB3aGlsZSB0aGV5IGFyZSBkcmFnZ2FibGVcclxuICAgIGNvbnN0IGNhcmRzRHJhZ0xheWVyID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICAvLyBmdW5jdGlvbnMgYXJlIGluIHRoaXMgbGF5ZXIgd2hpbGUgdGhleSBhcmUgZHJhZ2dhYmxlXHJcbiAgICBjb25zdCBmdW5jdGlvbnNEcmFnTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIC8vIGJhc2ljIFVJIGNvbnRyb2xzIGdldCBhZGRlZCB0byB0aGlzIGxheWVyXHJcbiAgICBjb25zdCBjb250cm9sc0xheWVyID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICAvLyBkcmF3ZXJzIGdldCBhZGRlZCB0byB0aGlzIGxheWVyIGJ5IHN1YnR5cGVzXHJcbiAgICBjb25zdCBkcmF3ZXJzTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIC8vIEJ1aWxkZXIsIGVuZHMgYXJlIHNlcGFyYXRlIG5vZGVzIHRvIHByb3ZpZGUgaWxsdXNpb24gb2YgZHJhZ2dpbmcgY2FyZHMgdGhyb3VnaCB0aGUgYnVpbGRlclxyXG4gICAgY29uc3QgYnVpbGRlciA9IHNjZW5lLmJ1aWxkZXI7XHJcbiAgICBjb25zdCBCVUlMREVSX0VORF9PUFRJT05TID0ge1xyXG4gICAgICByYWRpdXNYOiAxNSxcclxuICAgICAgcmFkaXVzWTogYnVpbGRlci5lbmRIZWlnaHQgLyAyLFxyXG4gICAgICBmaWxsOiBidWlsZGVyLmNvbG9yU2NoZW1lLmVuZHMsXHJcbiAgICAgIGNlbnRlclk6IGJ1aWxkZXIucG9zaXRpb24ueVxyXG4gICAgfTtcclxuICAgIGNvbnN0IGJ1aWxkZXJMZWZ0RW5kTm9kZSA9IG5ldyBCdWlsZGVyRW5kTm9kZSggJ2xlZnQnLCBtZXJnZSgge30sIEJVSUxERVJfRU5EX09QVElPTlMsIHtcclxuICAgICAgY2VudGVyWDogYnVpbGRlci5sZWZ0XHJcbiAgICB9ICkgKTtcclxuICAgIGNvbnN0IGJ1aWxkZXJSaWdodEVuZE5vZGUgPSBuZXcgQnVpbGRlckVuZE5vZGUoICdyaWdodCcsIG1lcmdlKCB7fSwgQlVJTERFUl9FTkRfT1BUSU9OUywge1xyXG4gICAgICBjZW50ZXJYOiBidWlsZGVyLnJpZ2h0XHJcbiAgICB9ICkgKTtcclxuICAgIGNvbnN0IGJ1aWxkZXJOb2RlID0gbmV3IEJ1aWxkZXJOb2RlKCBidWlsZGVyLCB0aGlzLmhpZGVGdW5jdGlvbnNQcm9wZXJ0eSwge1xyXG4gICAgICBlbmRSYWRpdXNYOiBCVUlMREVSX0VORF9PUFRJT05TLnJhZGl1c1gsXHJcbiAgICAgIHNsb3RGaWxsOiBudWxsXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSW5wdXQgY2Fyb3VzZWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBJbnB1dCBjYXJvdXNlbCwgYXQgbGVmdFxyXG4gICAgY29uc3QgaW5wdXRDYXJvdXNlbCA9IG5ldyBDYXJvdXNlbCggdGhpcy5jcmVhdGVDYXJkQ2Fyb3VzZWxJdGVtcyggc2NlbmUgKSwge1xyXG4gICAgICBvcmllbnRhdGlvbjogJ3ZlcnRpY2FsJyxcclxuICAgICAgc2VwYXJhdG9yc1Zpc2libGU6IHRydWUsXHJcbiAgICAgIGl0ZW1zUGVyUGFnZTogb3B0aW9ucy5jYXJkc1BlclBhZ2UsXHJcbiAgICAgIGRlZmF1bHRQYWdlTnVtYmVyOiBvcHRpb25zLmNhcmRDYXJvdXNlbERlZmF1bHRQYWdlTnVtYmVyLFxyXG4gICAgICBidXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiA1LFxyXG4gICAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogMTVcclxuICAgICAgfSxcclxuICAgICAgc3BhY2luZzogMjAsXHJcbiAgICAgIG1hcmdpbjogMTAsXHJcbiAgICAgIGxlZnQ6IGxheW91dEJvdW5kcy5sZWZ0ICsgMzAsXHJcbiAgICAgIHRvcDogbGF5b3V0Qm91bmRzLnRvcCArIDUwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUGFnZSBjb250cm9sIGZvciBpbnB1dCBjYXJvdXNlbFxyXG4gICAgY29uc3QgaW5wdXRQYWdlQ29udHJvbCA9IG5ldyBQYWdlQ29udHJvbCggaW5wdXRDYXJvdXNlbC5wYWdlTnVtYmVyUHJvcGVydHksIGlucHV0Q2Fyb3VzZWwubnVtYmVyT2ZQYWdlc1Byb3BlcnR5LCBtZXJnZSgge1xyXG4gICAgICBvcmllbnRhdGlvbjogJ3ZlcnRpY2FsJyxcclxuICAgICAgcmlnaHQ6IGlucHV0Q2Fyb3VzZWwubGVmdCAtIFBBR0VfQ09OVFJPTF9TUEFDSU5HLFxyXG4gICAgICBjZW50ZXJZOiBpbnB1dENhcm91c2VsLmNlbnRlcllcclxuICAgIH0sIFBBR0VfQ09OVFJPTF9PUFRJT05TICkgKTtcclxuICAgIGNvbnRyb2xzTGF5ZXIuYWRkQ2hpbGQoIGlucHV0UGFnZUNvbnRyb2wgKTtcclxuXHJcbiAgICAvLyBPdXRwdXQgY2Fyb3VzZWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gQ29udGFpbmVycyBpbiB0aGUgb3V0cHV0IGNhcm91c2VsXHJcbiAgICBjb25zdCBvdXRwdXRDb250YWluZXJzID0gdGhpcy5jcmVhdGVDYXJkQ2Fyb3VzZWxJdGVtcyggc2NlbmUsIHtcclxuICAgICAgZW1wdHlOb2RlOiBudWxsIC8vIGRvbid0IHNob3cgYW55dGhpbmcgaW4gZW1wdHkgb3V0cHV0IGNvbnRhaW5lcnNcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBPdXRwdXQgY2Fyb3VzZWwsIGF0IHJpZ2h0XHJcbiAgICBjb25zdCBvdXRwdXRDYXJvdXNlbCA9IG5ldyBPdXRwdXRDYXJkc0Nhcm91c2VsKCBvdXRwdXRDb250YWluZXJzLCB7XHJcbiAgICAgIG9yaWVudGF0aW9uOiAndmVydGljYWwnLFxyXG4gICAgICBzZXBhcmF0b3JzVmlzaWJsZTogdHJ1ZSxcclxuICAgICAgaXRlbXNQZXJQYWdlOiBvcHRpb25zLmNhcmRzUGVyUGFnZSxcclxuICAgICAgZGVmYXVsdFBhZ2VOdW1iZXI6IG9wdGlvbnMuY2FyZENhcm91c2VsRGVmYXVsdFBhZ2VOdW1iZXIsXHJcbiAgICAgIGJ1dHRvblRvdWNoQXJlYVhEaWxhdGlvbjogNSxcclxuICAgICAgYnV0dG9uVG91Y2hBcmVhWURpbGF0aW9uOiAxNSxcclxuICAgICAgc3BhY2luZzogMjAsXHJcbiAgICAgIG1hcmdpbjogMTAsXHJcbiAgICAgIHJpZ2h0OiBsYXlvdXRCb3VuZHMucmlnaHQgLSAoIGlucHV0Q2Fyb3VzZWwubGVmdCAtIGxheW91dEJvdW5kcy5sZWZ0ICksXHJcbiAgICAgIGJvdHRvbTogaW5wdXRDYXJvdXNlbC5ib3R0b21cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBQYWdlIGNvbnRyb2wgZm9yIG91dHB1dCBjYXJvdXNlbFxyXG4gICAgY29uc3Qgb3V0cHV0UGFnZUNvbnRyb2wgPSBuZXcgUGFnZUNvbnRyb2woIG91dHB1dENhcm91c2VsLnBhZ2VOdW1iZXJQcm9wZXJ0eSwgb3V0cHV0Q2Fyb3VzZWwubnVtYmVyT2ZQYWdlc1Byb3BlcnR5LCBtZXJnZSgge1xyXG4gICAgICBvcmllbnRhdGlvbjogJ3ZlcnRpY2FsJyxcclxuICAgICAgbGVmdDogb3V0cHV0Q2Fyb3VzZWwucmlnaHQgKyBQQUdFX0NPTlRST0xfU1BBQ0lORyxcclxuICAgICAgY2VudGVyWTogb3V0cHV0Q2Fyb3VzZWwuY2VudGVyWVxyXG4gICAgfSwgUEFHRV9DT05UUk9MX09QVElPTlMgKSApO1xyXG4gICAgY29udHJvbHNMYXllci5hZGRDaGlsZCggb3V0cHV0UGFnZUNvbnRyb2wgKTtcclxuXHJcbiAgICAvLyBFcmFzZXIgYnV0dG9uLCBjZW50ZXJlZCBiZWxvdyB0aGUgb3V0cHV0IGNhcm91c2VsXHJcbiAgICBjb25zdCBlcmFzZXJCdXR0b24gPSBuZXcgRXJhc2VyQnV0dG9uKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB0aGlzLmVyYXNlKCksXHJcbiAgICAgIGljb25XaWR0aDogMjgsXHJcbiAgICAgIGNlbnRlclg6IG91dHB1dENhcm91c2VsLmNlbnRlclgsXHJcbiAgICAgIHRvcDogb3V0cHV0Q2Fyb3VzZWwuYm90dG9tICsgMjVcclxuICAgIH0gKTtcclxuICAgIGNvbnRyb2xzTGF5ZXIuYWRkQ2hpbGQoIGVyYXNlckJ1dHRvbiApO1xyXG4gICAgZXJhc2VyQnV0dG9uLnRvdWNoQXJlYSA9IGVyYXNlckJ1dHRvbi5sb2NhbEJvdW5kcy5kaWxhdGVkWFkoIDEwLCA1ICk7XHJcblxyXG4gICAgLy8gRGlzYWJsZSB0aGUgZXJhc2VyIGJ1dHRvbiB3aGVuIHRoZSBvdXRwdXQgY2Fyb3VzZWwgaXMgZW1wdHkuXHJcbiAgICAvLyB1bmxpbmsgdW5uZWNlc3NhcnksIGluc3RhbmNlcyBleGlzdCBmb3IgbGlmZXRpbWUgb2YgdGhlIHNpbS5cclxuICAgIG91dHB1dENhcm91c2VsLm51bWJlck9mQ2FyZHNQcm9wZXJ0eS5saW5rKCBudW1iZXJPZkNhcmRzID0+IHtcclxuICAgICAgZXJhc2VyQnV0dG9uLmVuYWJsZWQgPSAoIG51bWJlck9mQ2FyZHMgPiAwICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRnVuY3Rpb24gY2Fyb3VzZWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIENvbnRhaW5lcnMgaW4gdGhlIGZ1bmN0aW9uIGNhcm91c2VsXHJcbiAgICBjb25zdCBmdW5jdGlvbkNhcm91c2VsSXRlbXMgPSBjcmVhdGVGdW5jdGlvbkNhcm91c2VsSXRlbXMoIHNjZW5lLmZ1bmN0aW9uQ3JlYXRvcnMsIGZ1bmN0aW9uTm9kZUNvbnN0cnVjdG9yICk7XHJcblxyXG4gICAgLy8gRnVuY3Rpb24gY2Fyb3VzZWwsIGNlbnRlcmVkIGJlbG93IGJvdHRvbSBidWlsZGVyXHJcbiAgICBjb25zdCBmdW5jdGlvbkNhcm91c2VsID0gbmV3IENhcm91c2VsKCBmdW5jdGlvbkNhcm91c2VsSXRlbXMsIHtcclxuICAgICAgdmlzaWJsZTogb3B0aW9ucy5mdW5jdGlvbkNhcm91c2VsVmlzaWJsZSxcclxuICAgICAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyxcclxuICAgICAgaXRlbXNQZXJQYWdlOiBvcHRpb25zLmZ1bmN0aW9uc1BlclBhZ2UsXHJcbiAgICAgIHNwYWNpbmc6IDEyLFxyXG4gICAgICBtYXJnaW46IDEwLFxyXG4gICAgICBidXR0b25Ub3VjaEFyZWFYRGlsYXRpb246IDE1LFxyXG4gICAgICBidXR0b25Ub3VjaEFyZWFZRGlsYXRpb246IDUsXHJcbiAgICAgIGNlbnRlclg6IGxheW91dEJvdW5kcy5jZW50ZXJYLFxyXG4gICAgICBib3R0b206IGxheW91dEJvdW5kcy5ib3R0b20gLSAyNVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFBhZ2UgY29udHJvbCBmb3IgZnVuY3Rpb24gY2Fyb3VzZWxcclxuICAgIGNvbnN0IGZ1bmN0aW9uUGFnZUNvbnRyb2wgPSBuZXcgUGFnZUNvbnRyb2woIGZ1bmN0aW9uQ2Fyb3VzZWwucGFnZU51bWJlclByb3BlcnR5LCBmdW5jdGlvbkNhcm91c2VsLm51bWJlck9mUGFnZXNQcm9wZXJ0eSwgbWVyZ2UoIHtcclxuICAgICAgdmlzaWJsZTogb3B0aW9ucy5mdW5jdGlvbkNhcm91c2VsVmlzaWJsZSxcclxuICAgICAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyxcclxuICAgICAgY2VudGVyWDogZnVuY3Rpb25DYXJvdXNlbC5jZW50ZXJYLFxyXG4gICAgICB0b3A6IGZ1bmN0aW9uQ2Fyb3VzZWwuYm90dG9tICsgUEFHRV9DT05UUk9MX1NQQUNJTkdcclxuICAgIH0sIFBBR0VfQ09OVFJPTF9PUFRJT05TICkgKTtcclxuICAgIGNvbnRyb2xzTGF5ZXIuYWRkQ2hpbGQoIGZ1bmN0aW9uUGFnZUNvbnRyb2wgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIExpbmsgdGhlIGlucHV0IGFuZCBvdXRwdXQgY2Fyb3VzZWxzLCBzbyB0aGF0IHRoZXkgZGlzcGxheSB0aGUgc2FtZSBwYWdlIG51bWJlci5cclxuICAgIC8vIHVubGluayB1bm5lY2Vzc2FyeSwgaW5zdGFuY2VzIGV4aXN0IGZvciBsaWZldGltZSBvZiB0aGUgc2ltLlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5wdXRDYXJvdXNlbC5udW1iZXJPZlBhZ2VzUHJvcGVydHkudmFsdWUgPT09IG91dHB1dENhcm91c2VsLm51bWJlck9mUGFnZXNQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgaW5wdXRDYXJvdXNlbC5wYWdlTnVtYmVyUHJvcGVydHkubGluayggcGFnZU51bWJlciA9PiB7XHJcbiAgICAgIG91dHB1dENhcm91c2VsLnBhZ2VOdW1iZXJQcm9wZXJ0eS5zZXQoIHBhZ2VOdW1iZXIgKTtcclxuICAgIH0gKTtcclxuICAgIG91dHB1dENhcm91c2VsLnBhZ2VOdW1iZXJQcm9wZXJ0eS5saW5rKCBwYWdlTnVtYmVyID0+IHtcclxuICAgICAgaW5wdXRDYXJvdXNlbC5wYWdlTnVtYmVyUHJvcGVydHkuc2V0KCBwYWdlTnVtYmVyICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gJ0hpZGUgRnVuY3Rpb25zJyBmZWF0dXJlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjb25zdCBoaWRlRnVuY3Rpb25zQ2hlY2tib3ggPSBuZXcgQ2hlY2tib3goIHRoaXMuaGlkZUZ1bmN0aW9uc1Byb3BlcnR5LCBGQkljb25GYWN0b3J5LmNyZWF0ZUhpZGVGdW5jdGlvbnNJY29uKCksIHtcclxuICAgICAgdmlzaWJsZTogb3B0aW9ucy5oaWRlRnVuY3Rpb25zQ2hlY2tib3hWaXNpYmxlLFxyXG4gICAgICBzcGFjaW5nOiA4LFxyXG4gICAgICBsZWZ0OiBpbnB1dENhcm91c2VsLmxlZnQsXHJcbiAgICAgIHRvcDogZnVuY3Rpb25DYXJvdXNlbC50b3BcclxuICAgIH0gKTtcclxuICAgIGNvbnRyb2xzTGF5ZXIuYWRkQ2hpbGQoIGhpZGVGdW5jdGlvbnNDaGVja2JveCApO1xyXG4gICAgaGlkZUZ1bmN0aW9uc0NoZWNrYm94LnRvdWNoQXJlYSA9IGhpZGVGdW5jdGlvbnNDaGVja2JveC5sb2NhbEJvdW5kcy5kaWxhdGVkWFkoIDEwLCAxMCApO1xyXG5cclxuICAgIC8vICdTZWUgSW5zaWRlJyBmZWF0dXJlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY29uc3Qgc2VlSW5zaWRlTGF5ZXIgPSBuZXcgU2VlSW5zaWRlTGF5ZXIoIHNjZW5lLmJ1aWxkZXIsIHtcclxuICAgICAgdmlzaWJsZTogdGhpcy5zZWVJbnNpZGVQcm9wZXJ0eS5nZXQoKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHNlZUluc2lkZUNoZWNrYm94ID0gbmV3IENoZWNrYm94KCB0aGlzLnNlZUluc2lkZVByb3BlcnR5LCBGQkljb25GYWN0b3J5LmNyZWF0ZVNlZUluc2lkZUljb24oIHsgaWNvblR5cGU6IG9wdGlvbnMuc2VlSW5zaWRlSWNvblR5cGUgfSApLCB7XHJcbiAgICAgIHNwYWNpbmc6IDgsXHJcbiAgICAgIGxlZnQ6IGhpZGVGdW5jdGlvbnNDaGVja2JveC5sZWZ0LFxyXG4gICAgICB0b3A6IGhpZGVGdW5jdGlvbnNDaGVja2JveC5ib3R0b20gKyAyNVxyXG4gICAgfSApO1xyXG4gICAgY29udHJvbHNMYXllci5hZGRDaGlsZCggc2VlSW5zaWRlQ2hlY2tib3ggKTtcclxuICAgIHNlZUluc2lkZUNoZWNrYm94LnRvdWNoQXJlYSA9IHNlZUluc2lkZUNoZWNrYm94LmxvY2FsQm91bmRzLmRpbGF0ZWRYWSggMTAsIDEwICk7XHJcblxyXG4gICAgLy8gdW5saW5rIHVubmVjZXNzYXJ5LCBpbnN0YW5jZXMgZXhpc3QgZm9yIGxpZmV0aW1lIG9mIHRoZSBzaW1cclxuICAgIHRoaXMuc2VlSW5zaWRlUHJvcGVydHkubGluayggc2VlSW5zaWRlID0+IHtcclxuICAgICAgc2VlSW5zaWRlTGF5ZXIudmlzaWJsZSA9IHNlZUluc2lkZTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIHJlbmRlcmluZyBvcmRlclxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuY2hpbGRyZW4sICdkZWNvcmF0aW9uIG5vdCBzdXBwb3J0ZWQnICk7XHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gW1xyXG4gICAgICBjb250cm9sc0xheWVyLFxyXG4gICAgICBpbnB1dENhcm91c2VsLCAvLyAxIGNsaXBBcmVhXHJcbiAgICAgIG91dHB1dENhcm91c2VsLCAvLyAxIGNsaXBBcmVhXHJcbiAgICAgIGZ1bmN0aW9uQ2Fyb3VzZWwsIC8vIDEgY2xpcEFyZWFcclxuICAgICAgZHJhd2Vyc0xheWVyLCAvLyB0YWJsZSBkcmF3ZXI6IDIgY2xpcEFyZWFzOyBncmFwaCBkcmF3ZXI6IDEgY2xpcEFyZWE7IGVxdWF0aW9uIGRyYXdlcjogMSBjbGlwQXJlYVxyXG4gICAgICBidWlsZGVyTGVmdEVuZE5vZGUsXHJcbiAgICAgIGJ1aWxkZXJSaWdodEVuZE5vZGUsXHJcbiAgICAgIGNhcmRzRHJhZ0xheWVyLCAvLyBtdXN0IGJlIGJldHdlZW4gdGhlIGJ1aWxkZXIgZW5kcyBhbmQgdGhlIGJ1aWxkZXJcclxuICAgICAgYnVpbGRlck5vZGUsIC8vIDEgY2xpcEFyZWFcclxuICAgICAgc2VlSW5zaWRlTGF5ZXIsIC8vIDEgY2xpcEFyZWFcclxuICAgICAgZnVuY3Rpb25zRHJhZ0xheWVyXHJcbiAgICBdO1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIERlZmluZSBwcm9wZXJ0aWVzIGluIG9uZSBwbGFjZSwgc28gd2UgY2FuIHNlZSB3aGF0J3MgYXZhaWxhYmxlIGFuZCBkb2N1bWVudCB2aXNpYmlsaXR5XHJcblxyXG4gICAgLy8gQHByaXZhdGUgcG9wdWxhdGVkIGJ5IGNvbXBsZXRlSW5pdGlhbGl6YXRpb24sIG5lZWRlZCBieSByZXNldFxyXG4gICAgdGhpcy5mdW5jdGlvbk5vZGVzID0gW107IC8vIHtGdW5jdGlvbk5vZGVbXX1cclxuICAgIHRoaXMuY2FyZE5vZGVzID0gW107IC8vIHtDYXJkTm9kZVtdfVxyXG5cclxuICAgIC8vIEBwcml2YXRlIG5lZWRlZCBieSBwcm90b3R5cGUgZnVuY3Rpb25zXHJcbiAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICB0aGlzLmNhcmRzRHJhZ0xheWVyID0gY2FyZHNEcmFnTGF5ZXI7XHJcbiAgICB0aGlzLnNlZUluc2lkZUxheWVyID0gc2VlSW5zaWRlTGF5ZXI7XHJcbiAgICB0aGlzLmlucHV0Q2Fyb3VzZWwgPSBpbnB1dENhcm91c2VsO1xyXG4gICAgdGhpcy5vdXRwdXRDYXJvdXNlbCA9IG91dHB1dENhcm91c2VsO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWQgbmVlZGVkIGJ5IHN1YnR5cGVzXHJcbiAgICB0aGlzLmRyYXdlcnNMYXllciA9IGRyYXdlcnNMYXllcjtcclxuICAgIHRoaXMuY29udHJvbHNMYXllciA9IGNvbnRyb2xzTGF5ZXI7XHJcbiAgICB0aGlzLmZ1bmN0aW9uc0RyYWdMYXllciA9IGZ1bmN0aW9uc0RyYWdMYXllcjtcclxuICAgIHRoaXMuYnVpbGRlck5vZGUgPSBidWlsZGVyTm9kZTtcclxuICAgIHRoaXMuZnVuY3Rpb25DYXJvdXNlbCA9IGZ1bmN0aW9uQ2Fyb3VzZWw7XHJcbiAgICB0aGlzLmlucHV0Q29udGFpbmVycyA9IGlucHV0Q2Fyb3VzZWwuY2Fyb3VzZWxJdGVtTm9kZXM7XHJcbiAgICB0aGlzLm91dHB1dENvbnRhaW5lcnMgPSBvdXRwdXRDYXJvdXNlbC5jYXJvdXNlbEl0ZW1Ob2RlcztcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaW5wdXRDb250YWluZXJzLmxlbmd0aCA9PT0gdGhpcy5vdXRwdXRDb250YWluZXJzLmxlbmd0aCApO1xyXG4gICAgdGhpcy5mdW5jdGlvbkNvbnRhaW5lcnMgPSBmdW5jdGlvbkNhcm91c2VsLmNhcm91c2VsSXRlbU5vZGVzO1xyXG4gICAgdGhpcy5zZWVJbnNpZGVDaGVja2JveCA9IHNlZUluc2lkZUNoZWNrYm94O1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5zZWVJbnNpZGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5oaWRlRnVuY3Rpb25zUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucmVzZXRDYXJvdXNlbHMoKTtcclxuICAgIHRoaXMuYnVpbGRlck5vZGUucmVzZXQoKTtcclxuICAgIHRoaXMucmVzZXRGdW5jdGlvbnMoKTtcclxuICAgIHRoaXMucmVzZXRDYXJkcygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbGwgZnVuY3Rpb25zIHRvIHRoZSBmdW5jdGlvbiBjYXJvdXNlbFxyXG4gICAqXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqL1xyXG4gIHJlc2V0RnVuY3Rpb25zKCkge1xyXG4gICAgdGhpcy5mdW5jdGlvbk5vZGVzLmZvckVhY2goIGZ1bmN0aW9uTm9kZSA9PiBmdW5jdGlvbk5vZGUubW92ZVRvQ2Fyb3VzZWwoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbGwgY2FyZHMgdG8gdGhlIGlucHV0IGNhcm91c2VsXHJcbiAgICpcclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICovXHJcbiAgcmVzZXRDYXJkcygpIHtcclxuICAgIHRoaXMuY2FyZE5vZGVzLmZvckVhY2goIGNhcmROb2RlID0+IGNhcmROb2RlLm1vdmVUb0lucHV0Q2Fyb3VzZWwoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoZSBjYXJvdXNlbHMgd2l0aG91dCBhbmltYXRpb24uXHJcbiAgICpcclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICovXHJcbiAgcmVzZXRDYXJvdXNlbHMoKSB7XHJcblxyXG4gICAgdGhpcy5mdW5jdGlvbkNhcm91c2VsLnJlc2V0KCk7XHJcblxyXG4gICAgLy8gQmVjYXVzZSB0aGUgaW5wdXQgYW5kIG91dHB1dCBjYXJvdXNlbHMgYXJlIGxpbmtlZCwgd2UgbmVlZCB0byB1c2UgdGhpcyBhcHByb2FjaDpcclxuICAgIHRoaXMuaW5wdXRDYXJvdXNlbC5hbmltYXRpb25FbmFibGVkID0gdGhpcy5vdXRwdXRDYXJvdXNlbC5hbmltYXRpb25FbmFibGVkID0gZmFsc2U7XHJcbiAgICB0aGlzLmlucHV0Q2Fyb3VzZWwucmVzZXQoKTtcclxuICAgIHRoaXMub3V0cHV0Q2Fyb3VzZWwucmVzZXQoKTtcclxuICAgIHRoaXMuaW5wdXRDYXJvdXNlbC5hbmltYXRpb25FbmFibGVkID0gdGhpcy5vdXRwdXRDYXJvdXNlbC5hbmltYXRpb25FbmFibGVkID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8vIEBwcm90ZWN0ZWQgY2FsbGVkIHdoZW4gdGhlICdlcmFzZXInIGJ1dHRvbiBpcyBwcmVzc2VkXHJcbiAgZXJhc2UoKSB7XHJcbiAgICB0aGlzLm91dHB1dENhcm91c2VsLmVyYXNlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21wbGV0ZXMgaW5pdGlhbGl6YXRpb24gb2YgdGhlIHNjZW5lLiBUaGlzIGNhbm5vdCBiZSBkb25lIHVudGlsIHRoZSBzY2VuZSBpcyBhdHRhY2hlZFxyXG4gICAqIHRvIGEgU2NyZWVuVmlldywgYmVjYXVzZSB3ZSBuZWVkIHRvIGtub3cgdGhlIHBvc2l0aW9uIG9mIHRoZSBjb250YWluZXJzIGluIHRoZSBjYXJvdXNlbHMuXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY29tcGxldGVJbml0aWFsaXphdGlvbigpIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGhhc1NjcmVlblZpZXdBbmNlc3RvciggdGhpcyApLCAnY2FsbCB0aGlzIGZ1bmN0aW9uIGFmdGVyIGF0dGFjaGluZyB0byBTY3JlZW5WaWV3JyApO1xyXG4gICAgdGhpcy5wb3B1bGF0ZUZ1bmN0aW9uQ2Fyb3VzZWxzKCk7XHJcbiAgICB0aGlzLnBvcHVsYXRlQ2FyZENhcm91c2VscygpO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGUgcG9wdWxhdGVzIHRoZSBmdW5jdGlvbiBjYXJvdXNlbFxyXG4gIHBvcHVsYXRlRnVuY3Rpb25DYXJvdXNlbHMoKSB7XHJcblxyXG4gICAgdGhpcy5mdW5jdGlvbkNhcm91c2VsLmFuaW1hdGlvbkVuYWJsZWQgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmZ1bmN0aW9uQ29udGFpbmVycy5mb3JFYWNoKCAoIGZ1bmN0aW9uQ29udGFpbmVyLCBpICkgPT4ge1xyXG5cclxuICAgICAgLy8gZnVuY3Rpb24gY29udGFpbmVyJ3MgcG9zaXRpb25cclxuICAgICAgZnVuY3Rpb25Db250YWluZXIuY2Fyb3VzZWxQb3NpdGlvbiA9IGdldENhcm91c2VsUG9zaXRpb24oIHRoaXMuZnVuY3Rpb25DYXJvdXNlbCwgdGhpcy5mdW5jdGlvbkNhcm91c2VsLml0ZW1zWyBpIF0sIHRoaXMuZnVuY3Rpb25zRHJhZ0xheWVyICk7XHJcblxyXG4gICAgICAvLyBwb3B1bGF0ZSB0aGUgY29udGFpbmVyIHdpdGggZnVuY3Rpb25zXHJcbiAgICAgIGZ1bmN0aW9uQ29udGFpbmVyLmNyZWF0ZUZ1bmN0aW9ucyggdGhpcy5zY2VuZS5udW1iZXJPZkVhY2hGdW5jdGlvbiwgdGhpcy5zY2VuZSwgdGhpcy5idWlsZGVyTm9kZSwgdGhpcy5mdW5jdGlvbnNEcmFnTGF5ZXIgKTtcclxuXHJcbiAgICAgIC8vIGdldCB0aGUgZnVuY3Rpb25zIHRoYXQgd2VyZSBhZGRlZCwgbmVlZGVkIGZvciByZXNldFxyXG4gICAgICB0aGlzLmZ1bmN0aW9uTm9kZXMgPSB0aGlzLmZ1bmN0aW9uTm9kZXMuY29uY2F0KCBmdW5jdGlvbkNvbnRhaW5lci5nZXRDb250ZW50cygpICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5mdW5jdGlvbkNhcm91c2VsLnBhZ2VOdW1iZXJQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5mdW5jdGlvbkNhcm91c2VsLmFuaW1hdGlvbkVuYWJsZWQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGUgcG9wdWxhdGVzIHRoZSBjYXJkIGNhcm91c2Vsc1xyXG4gIHBvcHVsYXRlQ2FyZENhcm91c2VscygpIHtcclxuXHJcbiAgICB0aGlzLmlucHV0Q2Fyb3VzZWwuYW5pbWF0aW9uRW5hYmxlZCA9IHRoaXMub3V0cHV0Q2Fyb3VzZWwuYW5pbWF0aW9uRW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuaW5wdXRDb250YWluZXJzLmxlbmd0aDsgaSsrICkge1xyXG5cclxuICAgICAgLy8gaW5wdXQgY29udGFpbmVyJ3MgcG9zaXRpb25cclxuICAgICAgY29uc3QgaW5wdXRDb250YWluZXIgPSB0aGlzLmlucHV0Q29udGFpbmVyc1sgaSBdO1xyXG4gICAgICBpbnB1dENvbnRhaW5lci5jYXJvdXNlbFBvc2l0aW9uID0gZ2V0Q2Fyb3VzZWxQb3NpdGlvbiggdGhpcy5pbnB1dENhcm91c2VsLCB0aGlzLmlucHV0Q2Fyb3VzZWwuaXRlbXNbIGkgXSwgdGhpcy5jYXJkc0RyYWdMYXllciApO1xyXG5cclxuICAgICAgLy8gb3V0cHV0IGNvbnRhaW5lcidzIHBvc2l0aW9uXHJcbiAgICAgIGNvbnN0IG91dHB1dENvbnRhaW5lciA9IHRoaXMub3V0cHV0Q29udGFpbmVyc1sgaSBdO1xyXG4gICAgICBvdXRwdXRDb250YWluZXIuY2Fyb3VzZWxQb3NpdGlvbiA9IGdldENhcm91c2VsUG9zaXRpb24oIHRoaXMub3V0cHV0Q2Fyb3VzZWwsIHRoaXMub3V0cHV0Q2Fyb3VzZWwuaXRlbXNbIGkgXSwgdGhpcy5jYXJkc0RyYWdMYXllciApO1xyXG5cclxuICAgICAgLy8gcG9wdWxhdGUgdGhlIGlucHV0IGNvbnRhaW5lciB3aXRoIGNhcmRzXHJcbiAgICAgIGlucHV0Q29udGFpbmVyLmNyZWF0ZUNhcmRzKCB0aGlzLnNjZW5lLm51bWJlck9mRWFjaENhcmQsIHRoaXMuc2NlbmUsIGlucHV0Q29udGFpbmVyLCBvdXRwdXRDb250YWluZXIsXHJcbiAgICAgICAgdGhpcy5idWlsZGVyTm9kZSwgdGhpcy5jYXJkc0RyYWdMYXllciwgdGhpcy5zZWVJbnNpZGVMYXllciwgdGhpcy5zZWVJbnNpZGVQcm9wZXJ0eSApO1xyXG5cclxuICAgICAgLy8gZ2V0IHRoZSBjYXJkcyB0aGF0IHdlcmUgYWRkZWQsIG5lZWRlZCBmb3IgcmVzZXRcclxuICAgICAgdGhpcy5jYXJkTm9kZXMgPSB0aGlzLmNhcmROb2Rlcy5jb25jYXQoIGlucHV0Q29udGFpbmVyLmdldENvbnRlbnRzKCkgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmlucHV0Q2Fyb3VzZWwucGFnZU51bWJlclByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLm91dHB1dENhcm91c2VsLnBhZ2VOdW1iZXJQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5pbnB1dENhcm91c2VsLmFuaW1hdGlvbkVuYWJsZWQgPSB0aGlzLm91dHB1dENhcm91c2VsLmFuaW1hdGlvbkVuYWJsZWQgPSB0cnVlO1xyXG5cclxuICAgIC8vIG1vdmUgMSBvZiBlYWNoIGNhcmQgdG8gdGhlIG91dHB1dCBjYXJvdXNlbCwgZm9yIHRlc3RpbmdcclxuICAgIGlmICggRkJRdWVyeVBhcmFtZXRlcnMucG9wdWxhdGVPdXRwdXQgKSB7XHJcbiAgICAgIHRoaXMucG9wdWxhdGVPdXRwdXRDYXJvdXNlbCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZXMgMSBvZiBlYWNoIGNhcmQgdG8gdGhlIG91dHB1dCBjYXJvdXNlbCwgdXNlZCBmb3IgdGVzdGluZy5cclxuICAgKiBJZiBhbiBvdXRwdXRDb250YWluZXIgYWxyZWFkeSBjb250YWlucyBjYXJkcywgdGhpcyBpcyBhIG5vLW9wIGZvciB0aGF0IGNvbnRhaW5lci5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBwb3B1bGF0ZU91dHB1dENhcm91c2VsKCkge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5vdXRwdXRDYXJvdXNlbC5jYXJvdXNlbEl0ZW1Ob2Rlcy5sZW5ndGg7IGkrKyApIHtcclxuXHJcbiAgICAgIGNvbnN0IG91dHB1dENvbnRhaW5lciA9IHRoaXMub3V0cHV0Q2Fyb3VzZWwuY2Fyb3VzZWxJdGVtTm9kZXNbIGkgXTtcclxuICAgICAgaWYgKCBvdXRwdXRDb250YWluZXIuaXNFbXB0eSgpICkge1xyXG5cclxuICAgICAgICBjb25zdCBpbnB1dENvbnRhaW5lciA9IHRoaXMuaW5wdXRDYXJvdXNlbC5jYXJvdXNlbEl0ZW1Ob2Rlc1sgaSBdO1xyXG5cclxuICAgICAgICBjb25zdCBjYXJkTm9kZSA9IGlucHV0Q29udGFpbmVyLmdldENvbnRlbnRzKClbIDAgXTtcclxuICAgICAgICBpbnB1dENvbnRhaW5lci5yZW1vdmVOb2RlKCBjYXJkTm9kZSApO1xyXG4gICAgICAgIG91dHB1dENvbnRhaW5lci5hZGROb2RlKCBjYXJkTm9kZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSBjYXJkIGNvbnRhaW5lcnMgdGhhdCBnbyBpbiB0aGUgY2FyZCBjYXJvdXNlbHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NjZW5lfSBzY2VuZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbY29udGFpbmVyT3B0aW9uc11cclxuICAgKiBAcmV0dXJucyB7Q2Fyb3VzZWxJdGVtW119XHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqIEBhYnN0cmFjdFxyXG4gICAqL1xyXG4gIGNyZWF0ZUNhcmRDYXJvdXNlbEl0ZW1zKCBzY2VuZSwgY29udGFpbmVyT3B0aW9ucyApIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ211c3QgYmUgaW1wbGVtZW50ZWQgYnkgc3VidHlwZScgKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGb3IgYSBjb250YWluZXIgdGhhdCBpcyB2aXNpYmxlIGluIHNvbWUgY2Fyb3VzZWwsIGdldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSBjb250YWluZXIgaW4gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0Nhcm91c2VsfSBjYXJvdXNlbFxyXG4gKiBAcGFyYW0ge0Nhcm91c2VsSXRlbX0gY2Fyb3VzZWxJdGVtXHJcbiAqIEBwYXJhbSB7Tm9kZX0gd29ybGRQYXJlbnRcclxuICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRDYXJvdXNlbFBvc2l0aW9uKCBjYXJvdXNlbCwgY2Fyb3VzZWxJdGVtLCB3b3JsZFBhcmVudCApIHtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCAhY2Fyb3VzZWwuYW5pbWF0aW9uRW5hYmxlZCApO1xyXG4gIGNhcm91c2VsLnNjcm9sbFRvSXRlbSggY2Fyb3VzZWxJdGVtICk7XHJcbiAgY29uc3Qgbm9kZSA9IGNhcm91c2VsLmdldE5vZGVGb3JJdGVtKCBjYXJvdXNlbEl0ZW0gKTtcclxuICByZXR1cm4gd29ybGRQYXJlbnQuZ2xvYmFsVG9Mb2NhbFBvaW50KCBub2RlLnBhcmVudFRvR2xvYmFsUG9pbnQoIG5vZGUuY2VudGVyICkgKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEhhcyB0aGlzIE5vZGUgYmVlbiBhdHRhY2hlZCBiZW5lYXRoIGEgU2NyZWVuVmlldz9cclxuICogVGhpcyBpcyBhIHByZS1yZXF1aXNpdGUgdG8gY2FsbGluZyBjb21wbGV0ZUluaXRpYWxpemF0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0ge05vZGV9IG5vZGVcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5mdW5jdGlvbiBoYXNTY3JlZW5WaWV3QW5jZXN0b3IoIG5vZGUgKSB7XHJcbiAgbGV0IGZvdW5kID0gZmFsc2U7XHJcbiAgd2hpbGUgKCAhZm91bmQgJiYgbm9kZSAhPT0gbnVsbCApIHtcclxuICAgIGNvbnN0IHBhcmVudCA9IG5vZGUuZ2V0UGFyZW50KCk7XHJcbiAgICBmb3VuZCA9ICggcGFyZW50IGluc3RhbmNlb2YgU2NyZWVuVmlldyApO1xyXG4gICAgbm9kZSA9IHBhcmVudDsgLy8gbW92ZSB1cCB0aGUgc2NlbmUgZ3JhcGggYnkgb25lIGxldmVsXHJcbiAgfVxyXG4gIHJldHVybiBmb3VuZDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgdGhlIGZ1bmN0aW9uIGNvbnRhaW5lcnMgdGhhdCBnbyBpbiB0aGUgZnVuY3Rpb24gY2Fyb3VzZWwuXHJcbiAqXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb25DcmVhdG9yW119IGZ1bmN0aW9uQ3JlYXRvcnNcclxuICogQHBhcmFtIHtjb25zdHJ1Y3Rvcn0gZnVuY3Rpb25Ob2RlQ29uc3RydWN0b3IgLSBjb25zdHJ1Y3RvciBmb3Igc3VidHlwZSBvZiBGdW5jdGlvbk5vZGVcclxuICogQHBhcmFtIHtPYmplY3R9IFtjb250YWluZXJPcHRpb25zXSAtIHNlZSBJbWFnZUZ1bmN0aW9uQ29udGFpbmVyIG9wdGlvbnNcclxuICogQHJldHVybnMge0Z1bmN0aW9uQ29udGFpbmVyW119XHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVGdW5jdGlvbkNhcm91c2VsSXRlbXMoIGZ1bmN0aW9uQ3JlYXRvcnMsIGZ1bmN0aW9uTm9kZUNvbnN0cnVjdG9yLCBjb250YWluZXJPcHRpb25zICkge1xyXG4gIHJldHVybiBmdW5jdGlvbkNyZWF0b3JzLm1hcCggZnVuY3Rpb25DcmVhdG9yID0+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBGdW5jdGlvbkNvbnRhaW5lciggZnVuY3Rpb25DcmVhdG9yLCBmdW5jdGlvbk5vZGVDb25zdHJ1Y3RvciwgY29udGFpbmVyT3B0aW9ucyApXHJcbiAgICB9O1xyXG4gIH0gKTtcclxufVxyXG5cclxuZnVuY3Rpb25CdWlsZGVyLnJlZ2lzdGVyKCAnU2NlbmVOb2RlJywgU2NlbmVOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsVUFBVSxNQUFNLG9DQUFvQztBQUMzRCxPQUFPQyxLQUFLLE1BQU0sbUNB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