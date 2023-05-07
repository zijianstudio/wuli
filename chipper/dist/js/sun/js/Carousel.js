// Copyright 2015-2023, University of Colorado Boulder

/**
 * A carousel UI component.
 *
 * A set of N items is divided into M 'pages', based on how many items are visible in the carousel.
 * Pressing the next and previous buttons moves through the pages.
 * Movement through the pages is animated, so that items appear to scroll by.
 *
 * Note that Carousel wraps each item (Node) in an alignBox to ensure all items have an equal "footprint" dimension.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../axon/js/NumberProperty.js';
import stepTimer from '../../axon/js/stepTimer.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Range from '../../dot/js/Range.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { AlignGroup, FlowBox, IndexedNodeIO, LayoutConstraint, Node, Rectangle, Separator } from '../../scenery/js/imports.js';
import pushButtonSoundPlayer from '../../tambo/js/shared-sound-players/pushButtonSoundPlayer.js';
import Tandem from '../../tandem/js/Tandem.js';
import Animation from '../../twixt/js/Animation.js';
import Easing from '../../twixt/js/Easing.js';
import CarouselButton from './buttons/CarouselButton.js';
import ColorConstants from './ColorConstants.js';
import sun from './sun.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import { getGroupItemNodes } from './GroupItemOptions.js';
import Orientation from '../../phet-core/js/Orientation.js';
import Multilink from '../../axon/js/Multilink.js';
import Bounds2 from '../../dot/js/Bounds2.js';
const DEFAULT_ARROW_SIZE = new Dimension2(20, 7);
export default class Carousel extends Node {
  // Items hold the data to create the carouselItemNode

  // each AlignBox holds a carouselItemNode and ensures proper sizing in the Carousel

  // Stores the visible align boxes

  // created from createNode() in CarouselItem

  // number of pages in the carousel

  // page number that is currently visible

  // enables animation when scrolling between pages

  // These are public for layout - NOTE: These are mutated if the size changes after construction

  /**
   * NOTE: This will dispose the item Nodes when the carousel is disposed
   */
  constructor(items, providedOptions) {
    // Don't animate during initialization
    let isInitialized = false;

    // Override defaults with specified options
    const options = optionize()({
      // container
      orientation: 'horizontal',
      fill: 'white',
      stroke: 'black',
      lineWidth: 1,
      cornerRadius: 4,
      defaultPageNumber: 0,
      // items
      itemsPerPage: 4,
      spacing: 12,
      margin: 6,
      alignBoxOptions: {
        phetioType: IndexedNodeIO,
        phetioState: true,
        visiblePropertyOptions: {
          phetioFeatured: true
        }
      },
      // next/previous buttons
      buttonOptions: {
        xMargin: 5,
        yMargin: 5,
        // for dilating pointer areas of next/previous buttons such that they do not overlap with Carousel content
        touchAreaXDilation: 0,
        touchAreaYDilation: 0,
        mouseAreaXDilation: 0,
        mouseAreaYDilation: 0,
        baseColor: 'rgba( 200, 200, 200, 0.5 )',
        disabledColor: ColorConstants.LIGHT_GRAY,
        lineWidth: 1,
        arrowPathOptions: {
          stroke: 'black',
          lineWidth: 3
        },
        arrowSize: DEFAULT_ARROW_SIZE,
        enabledPropertyOptions: {
          phetioReadOnly: true,
          phetioFeatured: false
        },
        soundPlayer: pushButtonSoundPlayer
      },
      // item separators
      separatorsVisible: false,
      separatorOptions: {
        stroke: 'rgb( 180, 180, 180 )',
        lineWidth: 0.5,
        pickable: false
      },
      // animation, scrolling between pages
      animationEnabled: true,
      animationOptions: {
        duration: 0.4,
        stepEmitter: stepTimer,
        easing: Easing.CUBIC_IN_OUT
      },
      // phet-io
      tandem: Tandem.OPTIONAL,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    }, providedOptions);
    super();
    this.animationEnabled = options.animationEnabled;
    this.items = items;
    this.itemsPerPage = options.itemsPerPage;
    this.defaultPageNumber = options.defaultPageNumber;
    const orientation = Orientation.fromLayoutOrientation(options.orientation);
    const alignGroup = new AlignGroup();
    const itemsTandem = options.tandem.createTandem('items');
    this.carouselItemNodes = getGroupItemNodes(items, itemsTandem);

    // All items are wrapped in AlignBoxes to ensure consistent sizing
    this.alignBoxes = items.map((item, index) => {
      return alignGroup.createBox(this.carouselItemNodes[index], combineOptions({
        tandem: item.tandemName ? itemsTandem.createTandem(item.tandemName) : Tandem.OPTIONAL
      }, options.alignBoxOptions,
      // Item-specific options take precedence
      item.alignBoxOptions));
    });

    // scrollingNode will contain all items, arranged in the proper orientation, with margins and spacing.
    // NOTE: We'll need to handle updates to the order (for phet-io IndexedNodeIO).
    // Horizontal carousel arrange items left-to-right, vertical is top-to-bottom.
    // Translation of this node will be animated to give the effect of scrolling through the items.
    this.scrollingNode = new ScrollingFlowBox(this, {
      children: this.alignBoxes,
      orientation: options.orientation,
      spacing: options.spacing,
      [`${orientation.opposite.coordinate}Margin`]: options.margin
    });

    // Visible AlignBoxes (these are the ones we lay out and base everything on)
    this.visibleAlignBoxesProperty = DerivedProperty.deriveAny(this.alignBoxes.map(alignBox => alignBox.visibleProperty), () => {
      return this.getVisibleAlignBoxes();
    });

    // When the AlignBoxes are reordered, we need to recompute the visibleAlignBoxesProperty
    this.scrollingNode.childrenReorderedEmitter.addListener(() => this.visibleAlignBoxesProperty.recomputeDerivation());

    // Options common to both buttons
    const buttonOptions = combineOptions({
      cornerRadius: options.cornerRadius
    }, options.buttonOptions);
    assert && assert(options.spacing >= options.margin, 'The spacing must be >= the margin, or you will see ' + 'page 2 items at the end of page 1');

    // In order to make it easy for phet-io to re-order items, the separators should not participate
    // in the layout and have indices that get moved around.  Therefore, we add a separate layer to
    // show the separators.
    const separatorLayer = options.separatorsVisible ? new Node({
      pickable: false
    }) : null;

    // Contains the scrolling node and the associated separators, if any
    const scrollingNodeContainer = new Node({
      children: options.separatorsVisible ? [separatorLayer, this.scrollingNode] : [this.scrollingNode]
    });

    // Have to have at least one page, even if it is blank
    const countPages = items => Math.max(Math.ceil(items.length / options.itemsPerPage), 1);

    // Number of pages is derived from the total number of items and the number of items per page
    this.numberOfPagesProperty = new DerivedProperty([this.visibleAlignBoxesProperty], visibleAlignBoxes => {
      return countPages(visibleAlignBoxes);
    }, {
      isValidValue: v => v > 0
    });
    const maxPages = countPages(this.alignBoxes);
    assert && assert(options.defaultPageNumber >= 0 && options.defaultPageNumber <= this.numberOfPagesProperty.value - 1, `defaultPageNumber is out of range: ${options.defaultPageNumber}`);

    // Number of the page that is visible in the carousel.
    this.pageNumberProperty = new NumberProperty(options.defaultPageNumber, {
      tandem: options.tandem.createTandem('pageNumberProperty'),
      numberType: 'Integer',
      isValidValue: value => value < this.numberOfPagesProperty.value && value >= 0,
      // Based on the total number of possible alignBoxes, not just the ones visible on startup
      range: new Range(0, maxPages - 1),
      phetioFeatured: true
    });
    const buttonsVisibleProperty = new DerivedProperty([this.numberOfPagesProperty], numberOfPages => {
      // always show the buttons if there is more than one page, and always hide the buttons if there is only one page
      return numberOfPages > 1;
    });

    // Next button
    const nextButton = new CarouselButton(combineOptions({
      arrowDirection: orientation === Orientation.HORIZONTAL ? 'right' : 'down',
      tandem: options.tandem.createTandem('nextButton'),
      listener: () => this.pageNumberProperty.set(this.pageNumberProperty.get() + 1),
      enabledProperty: new DerivedProperty([this.pageNumberProperty, this.numberOfPagesProperty], (pageNumber, numberofPages) => {
        return pageNumber < numberofPages - 1;
      }),
      visibleProperty: buttonsVisibleProperty
    }, buttonOptions));

    // Previous button
    const previousButton = new CarouselButton(combineOptions({
      arrowDirection: orientation === Orientation.HORIZONTAL ? 'left' : 'up',
      tandem: options.tandem.createTandem('previousButton'),
      listener: () => this.pageNumberProperty.set(this.pageNumberProperty.get() - 1),
      enabledProperty: new DerivedProperty([this.pageNumberProperty], pageNumber => {
        return pageNumber > 0;
      }),
      visibleProperty: buttonsVisibleProperty
    }, buttonOptions));

    // Window with clipping area, so that the scrollingNodeContainer can be scrolled
    const windowNode = new Node({
      children: [scrollingNodeContainer]
    });

    // Background - displays the carousel's fill color
    const backgroundNode = new Rectangle({
      cornerRadius: options.cornerRadius,
      fill: options.fill
    });

    // Foreground - displays the carousel's outline, created as a separate node so that it can be placed on top of
    // everything, for a clean look.
    const foregroundNode = new Rectangle({
      cornerRadius: options.cornerRadius,
      stroke: options.stroke,
      pickable: false
    });

    // Top-level layout (based on background changes).
    this.carouselConstraint = new CarouselConstraint(this, backgroundNode, foregroundNode, windowNode, previousButton, nextButton, scrollingNodeContainer, this.alignBoxes, orientation, this.scrollingNode, this.itemsPerPage, options.margin, alignGroup, separatorLayer, options.separatorOptions);

    // Handle changing pages (or if the content changes)
    let scrollAnimation = null;
    const lastScrollBounds = new Bounds2(0, 0, 0, 0); // used mutably
    Multilink.multilink([this.pageNumberProperty, scrollingNodeContainer.localBoundsProperty], (pageNumber, scrollBounds) => {
      // We might temporarily hit this value. Bail out now instead of an assertion (it will get fired again)
      if (pageNumber >= this.numberOfPagesProperty.value) {
        return;
      }

      // stop any animation that's in progress
      scrollAnimation && scrollAnimation.stop();

      // Find the item at the top of pageNumber page
      const firstItemOnPage = this.visibleAlignBoxesProperty.value[pageNumber * options.itemsPerPage];

      // Place we want to scroll to
      const targetValue = firstItemOnPage ? -firstItemOnPage[orientation.minSide] + options.margin : 0;
      const scrollBoundsChanged = lastScrollBounds === null || !lastScrollBounds.equals(scrollBounds);
      lastScrollBounds.set(scrollBounds); // scrollBounds is mutable, we get the same reference, don't store it

      // Only animate if animation is enabled and PhET-iO state is not being set.  When PhET-iO state is being set (as
      // in loading a customized state), the carousel should immediately reflect the desired page
      // Do not animate during initialization.
      // Do not animate when our scrollBounds have changed (our content probably resized)
      if (this.animationEnabled && !window?.phet?.joist?.sim?.isSettingPhetioStateProperty?.value && isInitialized && !scrollBoundsChanged) {
        // create and start the scroll animation
        scrollAnimation = new Animation(combineOptions({}, options.animationOptions, {
          to: targetValue,
          // options that are specific to orientation
          getValue: () => scrollingNodeContainer[orientation.coordinate],
          setValue: value => {
            scrollingNodeContainer[orientation.coordinate] = value;
          }
        }));
        scrollAnimation.start();
      } else {
        // animation disabled, move immediate to new page
        scrollingNodeContainer[orientation.coordinate] = targetValue;
      }
    });

    // Don't stay on a page that doesn't exist
    this.visibleAlignBoxesProperty.link(() => {
      // if the only element in the last page is removed, remove the page and autoscroll to the new final page
      this.pageNumberProperty.value = Math.min(this.pageNumberProperty.value, this.numberOfPagesProperty.value - 1);
    });
    options.children = [backgroundNode, windowNode, nextButton, previousButton, foregroundNode];
    this.disposeCarousel = () => {
      this.visibleAlignBoxesProperty.dispose();
      this.pageNumberProperty.dispose();
      this.alignBoxes.forEach(alignBox => {
        assert && assert(alignBox.children.length === 1, 'Carousel AlignBox instances should have only one child');
        assert && assert(this.carouselItemNodes.includes(alignBox.children[0]), 'Carousel AlignBox instances should wrap a content node');
        alignBox.dispose();
      });
      this.scrollingNode.dispose();
      this.carouselConstraint.dispose();
      this.carouselItemNodes.forEach(node => node.dispose());
    };
    this.mutate(options);

    // Will allow potential animation after this
    isInitialized = true;

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('sun', 'Carousel', this);
  }

  /**
   * NOTE: This will dispose the item Nodes
   */
  dispose() {
    this.disposeCarousel();
    super.dispose();
  }

  /**
   * Resets the carousel to its initial state.
   * @param animationEnabled - whether to enable animation during reset
   */
  reset(animationEnabled = false) {
    const saveAnimationEnabled = this.animationEnabled;
    this.animationEnabled = animationEnabled;

    // Reset the page number to the default page number if possible (if things are hidden, it might not be possible)
    this.pageNumberProperty.value = Math.min(this.defaultPageNumber, this.numberOfPagesProperty.value - 1);
    this.animationEnabled = saveAnimationEnabled;
  }

  /**
   * Given an item's visible index, scrolls the carousel to the page that contains that item.
   */
  scrollToItemVisibleIndex(itemVisibleIndex) {
    this.pageNumberProperty.set(this.itemVisibleIndexToPageNumber(itemVisibleIndex));
  }

  /**
   * Given an item, scrolls the carousel to the page that contains that item. This will only scroll if item is in the
   * Carousel and visible.
   */
  scrollToItem(item) {
    this.scrollToAlignBox(this.getAlignBoxForItem(item));
  }

  /**
   * Public for ScrollingFlowBox only
   */
  scrollToAlignBox(alignBox) {
    // If the layout is dynamic, then only account for the visible items
    const alignBoxIndex = this.visibleAlignBoxesProperty.value.indexOf(alignBox);
    assert && assert(alignBoxIndex >= 0, 'item not present or visible');
    if (alignBoxIndex >= 0) {
      this.scrollToItemVisibleIndex(alignBoxIndex);
    }
  }

  /**
   * Set the visibility of an item in the Carousel. This toggles visibility and will reflow the layout, such that hidden
   * items do not leave a gap in the layout.
   */
  setItemVisible(item, visible) {
    this.getAlignBoxForItem(item).visible = visible;
  }

  /**
   * Gets the AlignBox that wraps an item's Node.
   */
  getAlignBoxForItem(item) {
    const alignBox = this.alignBoxes[this.items.indexOf(item)];
    assert && assert(alignBox, 'item does not have corresponding alignBox');
    return alignBox;
  }

  /**
   * Returns the Node that was created for a given item.
   */
  getNodeForItem(item) {
    const node = this.carouselItemNodes[this.items.indexOf(item)];
    assert && assert(node, 'item does not have corresponding node');
    return node;
  }
  itemVisibleIndexToPageNumber(itemIndex) {
    assert && assert(itemIndex >= 0 && itemIndex < this.items.length, `itemIndex out of range: ${itemIndex}`);
    return Math.floor(itemIndex / this.itemsPerPage);
  }

  // The order of alignBoxes might be tweaked in scrollingNode's children. We need to respect this order
  getVisibleAlignBoxes() {
    return _.sortBy(this.alignBoxes.filter(alignBox => alignBox.visible), alignBox => this.scrollingNode.children.indexOf(alignBox));
  }
}

/**
 * When moveChildToIndex is called, scrolls the Carousel to that item. For use in PhET-iO when the order of items is
 * changed.
 */
class ScrollingFlowBox extends FlowBox {
  constructor(carousel, options) {
    super(options);
    this.carousel = carousel;
  }
  onIndexedNodeIOChildMoved(child) {
    this.carousel.scrollToAlignBox(child);
  }
}
class CarouselConstraint extends LayoutConstraint {
  constructor(carousel, backgroundNode, foregroundNode, windowNode, previousButton, nextButton, scrollingNodeContainer, alignBoxes, orientation, scrollingNode, itemsPerPage, margin, alignGroup, separatorLayer, separatorOptions) {
    super(carousel);

    // Hook up to listen to these nodes (will be handled by LayoutConstraint disposal)
    this.carousel = carousel;
    this.backgroundNode = backgroundNode;
    this.foregroundNode = foregroundNode;
    this.windowNode = windowNode;
    this.previousButton = previousButton;
    this.nextButton = nextButton;
    this.scrollingNodeContainer = scrollingNodeContainer;
    this.alignBoxes = alignBoxes;
    this.orientation = orientation;
    this.scrollingNode = scrollingNode;
    this.itemsPerPage = itemsPerPage;
    this.margin = margin;
    this.alignGroup = alignGroup;
    this.separatorLayer = separatorLayer;
    this.separatorOptions = separatorOptions;
    [this.backgroundNode, this.foregroundNode, this.windowNode, this.previousButton, this.nextButton, this.scrollingNodeContainer, ...this.alignBoxes].forEach(node => this.addNode(node, false));

    // Whenever layout happens in the scrolling node, it's the perfect time to update the separators
    if (this.separatorLayer) {
      // We do not need to remove this listener because it is internal to Carousel and will get garbage collected
      // when Carousel is disposed.
      this.scrollingNode.constraint.finishedLayoutEmitter.addListener(() => {
        this.updateSeparators();
      });
    }
    this.updateLayout();
  }
  updateSeparators() {
    const visibleChildren = this.carousel.getVisibleAlignBoxes();

    // Add separators between the visible children
    const range = visibleChildren.length >= 2 ? _.range(1, visibleChildren.length) : [];
    this.separatorLayer.children = range.map(index => {
      // Find the location between adjacent nodes
      const inbetween = (visibleChildren[index - 1][this.orientation.maxSide] + visibleChildren[index][this.orientation.minSide]) / 2;
      return new Separator(combineOptions({
        [`${this.orientation.coordinate}1`]: inbetween,
        [`${this.orientation.coordinate}2`]: inbetween,
        [`${this.orientation.opposite.coordinate}2`]: this.scrollingNode[this.orientation.opposite.size]
      }, this.separatorOptions));
    });
  }

  // Returns the clip area dimension for our Carousel based off of how many items we want to see per Carousel page.
  computeClipArea() {
    const orientation = this.orientation;
    const visibleAlignBoxes = this.carousel.getVisibleAlignBoxes();
    if (visibleAlignBoxes.length === 0) {
      return new Dimension2(0, 0);
    } else {
      // This doesn't fill one page in number play preferences dialog when you forget locales=*,
      // so take the last item, even if it is not a full page
      const lastBox = visibleAlignBoxes[this.itemsPerPage - 1] || visibleAlignBoxes[visibleAlignBoxes.length - 1];
      const horizontalSize = new Dimension2(
      // Measure from the beginning of the first item to the end of the last item on the 1st page
      lastBox[orientation.maxSide] - visibleAlignBoxes[0][orientation.minSide] + 2 * this.margin, this.scrollingNodeContainer.boundsProperty.value[orientation.opposite.size]);
      return this.orientation === Orientation.HORIZONTAL ? horizontalSize : horizontalSize.swapped();
    }
  }
  getBackgroundDimension() {
    let backgroundWidth;
    let backgroundHeight;
    if (this.orientation === Orientation.HORIZONTAL) {
      // For horizontal orientation, buttons contribute to width, if they are visible.
      const nextButtonWidth = this.nextButton.visible ? this.nextButton.width : 0;
      const previousButtonWidth = this.previousButton.visible ? this.previousButton.width : 0;
      backgroundWidth = this.windowNode.width + nextButtonWidth + previousButtonWidth;
      backgroundHeight = this.windowNode.height;
    } else {
      // For vertical orientation, buttons contribute to height, if they are visible.
      const nextButtonHeight = this.nextButton.visible ? this.nextButton.height : 0;
      const previousButtonHeight = this.previousButton.visible ? this.previousButton.height : 0;
      backgroundWidth = this.windowNode.width;
      backgroundHeight = this.windowNode.height + nextButtonHeight + previousButtonHeight;
    }
    return new Dimension2(backgroundWidth, backgroundHeight);
  }
  layout() {
    super.layout();
    const orientation = this.orientation;

    // Resize next/previous buttons dynamically
    const maxOppositeSize = this.alignGroup.getMaxSizeProperty(orientation.opposite).value;
    const buttonOppositeSize = maxOppositeSize + 2 * this.margin;
    this.nextButton[orientation.opposite.preferredSize] = buttonOppositeSize;
    this.previousButton[orientation.opposite.preferredSize] = buttonOppositeSize;
    this.nextButton[orientation.opposite.centerCoordinate] = this.backgroundNode[orientation.opposite.centerCoordinate];
    this.previousButton[orientation.opposite.centerCoordinate] = this.backgroundNode[orientation.opposite.centerCoordinate];
    this.windowNode[orientation.opposite.centerCoordinate] = this.backgroundNode[orientation.opposite.centerCoordinate];
    this.previousButton[orientation.minSide] = this.backgroundNode[orientation.minSide];
    this.nextButton[orientation.maxSide] = this.backgroundNode[orientation.maxSide];
    this.windowNode[orientation.centerCoordinate] = this.backgroundNode[orientation.centerCoordinate];
    const clipBounds = this.computeClipArea().toBounds();
    this.windowNode.clipArea = Shape.bounds(clipBounds);

    // Specify the local bounds in order to ensure centering. For full pages, this is not necessary since the scrollingNodeContainer
    // already spans the full area. But for a partial page, this is necessary so the window will be centered.
    this.windowNode.localBounds = clipBounds;
    const backgroundDimension = this.getBackgroundDimension();
    this.carousel.backgroundWidth = backgroundDimension.width;
    this.carousel.backgroundHeight = backgroundDimension.height;
    const backgroundBounds = backgroundDimension.toBounds();
    this.backgroundNode.rectBounds = backgroundBounds;
    this.foregroundNode.rectBounds = backgroundBounds;

    // Only update separators if they are visible
    this.separatorLayer && this.updateSeparators();
  }
}
sun.register('Carousel', Carousel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsInN0ZXBUaW1lciIsIkRpbWVuc2lvbjIiLCJSYW5nZSIsIlNoYXBlIiwiSW5zdGFuY2VSZWdpc3RyeSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiQWxpZ25Hcm91cCIsIkZsb3dCb3giLCJJbmRleGVkTm9kZUlPIiwiTGF5b3V0Q29uc3RyYWludCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJTZXBhcmF0b3IiLCJwdXNoQnV0dG9uU291bmRQbGF5ZXIiLCJUYW5kZW0iLCJBbmltYXRpb24iLCJFYXNpbmciLCJDYXJvdXNlbEJ1dHRvbiIsIkNvbG9yQ29uc3RhbnRzIiwic3VuIiwiRGVyaXZlZFByb3BlcnR5IiwiZ2V0R3JvdXBJdGVtTm9kZXMiLCJPcmllbnRhdGlvbiIsIk11bHRpbGluayIsIkJvdW5kczIiLCJERUZBVUxUX0FSUk9XX1NJWkUiLCJDYXJvdXNlbCIsImNvbnN0cnVjdG9yIiwiaXRlbXMiLCJwcm92aWRlZE9wdGlvbnMiLCJpc0luaXRpYWxpemVkIiwib3B0aW9ucyIsIm9yaWVudGF0aW9uIiwiZmlsbCIsInN0cm9rZSIsImxpbmVXaWR0aCIsImNvcm5lclJhZGl1cyIsImRlZmF1bHRQYWdlTnVtYmVyIiwiaXRlbXNQZXJQYWdlIiwic3BhY2luZyIsIm1hcmdpbiIsImFsaWduQm94T3B0aW9ucyIsInBoZXRpb1R5cGUiLCJwaGV0aW9TdGF0ZSIsInZpc2libGVQcm9wZXJ0eU9wdGlvbnMiLCJwaGV0aW9GZWF0dXJlZCIsImJ1dHRvbk9wdGlvbnMiLCJ4TWFyZ2luIiwieU1hcmdpbiIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsIm1vdXNlQXJlYVhEaWxhdGlvbiIsIm1vdXNlQXJlYVlEaWxhdGlvbiIsImJhc2VDb2xvciIsImRpc2FibGVkQ29sb3IiLCJMSUdIVF9HUkFZIiwiYXJyb3dQYXRoT3B0aW9ucyIsImFycm93U2l6ZSIsImVuYWJsZWRQcm9wZXJ0eU9wdGlvbnMiLCJwaGV0aW9SZWFkT25seSIsInNvdW5kUGxheWVyIiwic2VwYXJhdG9yc1Zpc2libGUiLCJzZXBhcmF0b3JPcHRpb25zIiwicGlja2FibGUiLCJhbmltYXRpb25FbmFibGVkIiwiYW5pbWF0aW9uT3B0aW9ucyIsImR1cmF0aW9uIiwic3RlcEVtaXR0ZXIiLCJlYXNpbmciLCJDVUJJQ19JTl9PVVQiLCJ0YW5kZW0iLCJPUFRJT05BTCIsImZyb21MYXlvdXRPcmllbnRhdGlvbiIsImFsaWduR3JvdXAiLCJpdGVtc1RhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImNhcm91c2VsSXRlbU5vZGVzIiwiYWxpZ25Cb3hlcyIsIm1hcCIsIml0ZW0iLCJpbmRleCIsImNyZWF0ZUJveCIsInRhbmRlbU5hbWUiLCJzY3JvbGxpbmdOb2RlIiwiU2Nyb2xsaW5nRmxvd0JveCIsImNoaWxkcmVuIiwib3Bwb3NpdGUiLCJjb29yZGluYXRlIiwidmlzaWJsZUFsaWduQm94ZXNQcm9wZXJ0eSIsImRlcml2ZUFueSIsImFsaWduQm94IiwidmlzaWJsZVByb3BlcnR5IiwiZ2V0VmlzaWJsZUFsaWduQm94ZXMiLCJjaGlsZHJlblJlb3JkZXJlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInJlY29tcHV0ZURlcml2YXRpb24iLCJhc3NlcnQiLCJzZXBhcmF0b3JMYXllciIsInNjcm9sbGluZ05vZGVDb250YWluZXIiLCJjb3VudFBhZ2VzIiwiTWF0aCIsIm1heCIsImNlaWwiLCJsZW5ndGgiLCJudW1iZXJPZlBhZ2VzUHJvcGVydHkiLCJ2aXNpYmxlQWxpZ25Cb3hlcyIsImlzVmFsaWRWYWx1ZSIsInYiLCJtYXhQYWdlcyIsInZhbHVlIiwicGFnZU51bWJlclByb3BlcnR5IiwibnVtYmVyVHlwZSIsInJhbmdlIiwiYnV0dG9uc1Zpc2libGVQcm9wZXJ0eSIsIm51bWJlck9mUGFnZXMiLCJuZXh0QnV0dG9uIiwiYXJyb3dEaXJlY3Rpb24iLCJIT1JJWk9OVEFMIiwibGlzdGVuZXIiLCJzZXQiLCJnZXQiLCJlbmFibGVkUHJvcGVydHkiLCJwYWdlTnVtYmVyIiwibnVtYmVyb2ZQYWdlcyIsInByZXZpb3VzQnV0dG9uIiwid2luZG93Tm9kZSIsImJhY2tncm91bmROb2RlIiwiZm9yZWdyb3VuZE5vZGUiLCJjYXJvdXNlbENvbnN0cmFpbnQiLCJDYXJvdXNlbENvbnN0cmFpbnQiLCJzY3JvbGxBbmltYXRpb24iLCJsYXN0U2Nyb2xsQm91bmRzIiwibXVsdGlsaW5rIiwibG9jYWxCb3VuZHNQcm9wZXJ0eSIsInNjcm9sbEJvdW5kcyIsInN0b3AiLCJmaXJzdEl0ZW1PblBhZ2UiLCJ0YXJnZXRWYWx1ZSIsIm1pblNpZGUiLCJzY3JvbGxCb3VuZHNDaGFuZ2VkIiwiZXF1YWxzIiwid2luZG93IiwicGhldCIsImpvaXN0Iiwic2ltIiwiaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSIsInRvIiwiZ2V0VmFsdWUiLCJzZXRWYWx1ZSIsInN0YXJ0IiwibGluayIsIm1pbiIsImRpc3Bvc2VDYXJvdXNlbCIsImRpc3Bvc2UiLCJmb3JFYWNoIiwiaW5jbHVkZXMiLCJub2RlIiwibXV0YXRlIiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsInJlc2V0Iiwic2F2ZUFuaW1hdGlvbkVuYWJsZWQiLCJzY3JvbGxUb0l0ZW1WaXNpYmxlSW5kZXgiLCJpdGVtVmlzaWJsZUluZGV4IiwiaXRlbVZpc2libGVJbmRleFRvUGFnZU51bWJlciIsInNjcm9sbFRvSXRlbSIsInNjcm9sbFRvQWxpZ25Cb3giLCJnZXRBbGlnbkJveEZvckl0ZW0iLCJhbGlnbkJveEluZGV4IiwiaW5kZXhPZiIsInNldEl0ZW1WaXNpYmxlIiwidmlzaWJsZSIsImdldE5vZGVGb3JJdGVtIiwiaXRlbUluZGV4IiwiZmxvb3IiLCJfIiwic29ydEJ5IiwiZmlsdGVyIiwiY2Fyb3VzZWwiLCJvbkluZGV4ZWROb2RlSU9DaGlsZE1vdmVkIiwiY2hpbGQiLCJhZGROb2RlIiwiY29uc3RyYWludCIsImZpbmlzaGVkTGF5b3V0RW1pdHRlciIsInVwZGF0ZVNlcGFyYXRvcnMiLCJ1cGRhdGVMYXlvdXQiLCJ2aXNpYmxlQ2hpbGRyZW4iLCJpbmJldHdlZW4iLCJtYXhTaWRlIiwic2l6ZSIsImNvbXB1dGVDbGlwQXJlYSIsImxhc3RCb3giLCJob3Jpem9udGFsU2l6ZSIsImJvdW5kc1Byb3BlcnR5Iiwic3dhcHBlZCIsImdldEJhY2tncm91bmREaW1lbnNpb24iLCJiYWNrZ3JvdW5kV2lkdGgiLCJiYWNrZ3JvdW5kSGVpZ2h0IiwibmV4dEJ1dHRvbldpZHRoIiwid2lkdGgiLCJwcmV2aW91c0J1dHRvbldpZHRoIiwiaGVpZ2h0IiwibmV4dEJ1dHRvbkhlaWdodCIsInByZXZpb3VzQnV0dG9uSGVpZ2h0IiwibGF5b3V0IiwibWF4T3Bwb3NpdGVTaXplIiwiZ2V0TWF4U2l6ZVByb3BlcnR5IiwiYnV0dG9uT3Bwb3NpdGVTaXplIiwicHJlZmVycmVkU2l6ZSIsImNlbnRlckNvb3JkaW5hdGUiLCJjbGlwQm91bmRzIiwidG9Cb3VuZHMiLCJjbGlwQXJlYSIsImJvdW5kcyIsImxvY2FsQm91bmRzIiwiYmFja2dyb3VuZERpbWVuc2lvbiIsImJhY2tncm91bmRCb3VuZHMiLCJyZWN0Qm91bmRzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDYXJvdXNlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIGNhcm91c2VsIFVJIGNvbXBvbmVudC5cclxuICpcclxuICogQSBzZXQgb2YgTiBpdGVtcyBpcyBkaXZpZGVkIGludG8gTSAncGFnZXMnLCBiYXNlZCBvbiBob3cgbWFueSBpdGVtcyBhcmUgdmlzaWJsZSBpbiB0aGUgY2Fyb3VzZWwuXHJcbiAqIFByZXNzaW5nIHRoZSBuZXh0IGFuZCBwcmV2aW91cyBidXR0b25zIG1vdmVzIHRocm91Z2ggdGhlIHBhZ2VzLlxyXG4gKiBNb3ZlbWVudCB0aHJvdWdoIHRoZSBwYWdlcyBpcyBhbmltYXRlZCwgc28gdGhhdCBpdGVtcyBhcHBlYXIgdG8gc2Nyb2xsIGJ5LlxyXG4gKlxyXG4gKiBOb3RlIHRoYXQgQ2Fyb3VzZWwgd3JhcHMgZWFjaCBpdGVtIChOb2RlKSBpbiBhbiBhbGlnbkJveCB0byBlbnN1cmUgYWxsIGl0ZW1zIGhhdmUgYW4gZXF1YWwgXCJmb290cHJpbnRcIiBkaW1lbnNpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHsgQWxpZ25Cb3gsIEFsaWduQm94T3B0aW9ucywgQWxpZ25Hcm91cCwgRmxvd0JveCwgRmxvd0JveE9wdGlvbnMsIEluZGV4ZWROb2RlSU8sIEluZGV4ZWROb2RlSU9QYXJlbnQsIExheW91dENvbnN0cmFpbnQsIExheW91dE9yaWVudGF0aW9uLCBOb2RlLCBOb2RlT3B0aW9ucywgUmVjdGFuZ2xlLCBTZXBhcmF0b3IsIFNlcGFyYXRvck9wdGlvbnMsIFRQYWludCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBwdXNoQnV0dG9uU291bmRQbGF5ZXIgZnJvbSAnLi4vLi4vdGFtYm8vanMvc2hhcmVkLXNvdW5kLXBsYXllcnMvcHVzaEJ1dHRvblNvdW5kUGxheWVyLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEFuaW1hdGlvbiwgeyBBbmltYXRpb25PcHRpb25zIH0gZnJvbSAnLi4vLi4vdHdpeHQvanMvQW5pbWF0aW9uLmpzJztcclxuaW1wb3J0IEVhc2luZyBmcm9tICcuLi8uLi90d2l4dC9qcy9FYXNpbmcuanMnO1xyXG5pbXBvcnQgQ2Fyb3VzZWxCdXR0b24sIHsgQ2Fyb3VzZWxCdXR0b25PcHRpb25zIH0gZnJvbSAnLi9idXR0b25zL0Nhcm91c2VsQnV0dG9uLmpzJztcclxuaW1wb3J0IENvbG9yQ29uc3RhbnRzIGZyb20gJy4vQ29sb3JDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgc3VuIGZyb20gJy4vc3VuLmpzJztcclxuaW1wb3J0IFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9SZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSwgeyBVbmtub3duRGVyaXZlZFByb3BlcnR5IH0gZnJvbSAnLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgR3JvdXBJdGVtT3B0aW9ucywgeyBnZXRHcm91cEl0ZW1Ob2RlcyB9IGZyb20gJy4vR3JvdXBJdGVtT3B0aW9ucy5qcyc7XHJcbmltcG9ydCBPcmllbnRhdGlvbiBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvT3JpZW50YXRpb24uanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgQnV0dG9uTm9kZSBmcm9tICcuL2J1dHRvbnMvQnV0dG9uTm9kZS5qcyc7XHJcblxyXG5jb25zdCBERUZBVUxUX0FSUk9XX1NJWkUgPSBuZXcgRGltZW5zaW9uMiggMjAsIDcgKTtcclxuXHJcbmV4cG9ydCB0eXBlIENhcm91c2VsSXRlbSA9IEdyb3VwSXRlbU9wdGlvbnMgJiB7XHJcblxyXG4gIC8vIEl0ZW0tc3BlY2lmaWMgb3B0aW9ucyB0YWtlIHByZWNlZGVuY2Ugb3ZlciBnZW5lcmFsIGFsaWduQm94T3B0aW9uc1xyXG4gIGFsaWduQm94T3B0aW9ucz86IEFsaWduQm94T3B0aW9ucztcclxufTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIGNvbnRhaW5lclxyXG4gIG9yaWVudGF0aW9uPzogTGF5b3V0T3JpZW50YXRpb247XHJcbiAgZmlsbD86IFRQYWludDsgLy8gYmFja2dyb3VuZCBjb2xvciBvZiB0aGUgY2Fyb3VzZWxcclxuICBzdHJva2U/OiBUUGFpbnQ7IC8vIGNvbG9yIHVzZWQgdG8gc3Ryb2tlIHRoZSBib3JkZXIgb2YgdGhlIGNhcm91c2VsXHJcbiAgbGluZVdpZHRoPzogbnVtYmVyOyAvLyB3aWR0aCBvZiB0aGUgYm9yZGVyIGFyb3VuZCB0aGUgY2Fyb3VzZWxcclxuICBjb3JuZXJSYWRpdXM/OiBudW1iZXI7IC8vIHJhZGl1cyBhcHBsaWVkIHRvIHRoZSBjYXJvdXNlbCBhbmQgbmV4dC9wcmV2aW91cyBidXR0b25zXHJcbiAgZGVmYXVsdFBhZ2VOdW1iZXI/OiBudW1iZXI7IC8vIHBhZ2UgdGhhdCBpcyBpbml0aWFsbHkgdmlzaWJsZVxyXG5cclxuICAvLyBpdGVtc1xyXG4gIGl0ZW1zUGVyUGFnZT86IG51bWJlcjsgLy8gbnVtYmVyIG9mIGl0ZW1zIHBlciBwYWdlLCBvciBob3cgbWFueSBpdGVtcyBhcmUgdmlzaWJsZSBhdCBhIHRpbWUgaW4gdGhlIGNhcm91c2VsXHJcbiAgc3BhY2luZz86IG51bWJlcjsgLy8gc3BhY2luZyBiZXR3ZWVuIGl0ZW1zLCBiZXR3ZWVuIGl0ZW1zIGFuZCBvcHRpb25hbCBzZXBhcmF0b3JzLCBhbmQgYmV0d2VlbiBpdGVtcyBhbmQgYnV0dG9uc1xyXG4gIG1hcmdpbj86IG51bWJlcjsgLy8gbWFyZ2luIGJldHdlZW4gaXRlbXMgYW5kIHRoZSBlZGdlcyBvZiB0aGUgY2Fyb3VzZWxcclxuXHJcbiAgLy8gb3B0aW9ucyBmb3IgdGhlIEFsaWduQm94ZXMgKHBhcnRpY3VsYXJseSBpZiBhbGlnbm1lbnQgb2YgaXRlbXMgc2hvdWxkIGJlIGNoYW5nZWQsIG9yIGlmIHNwZWNpZmljIG1hcmdpbnMgYXJlIGRlc2lyZWQpXHJcbiAgYWxpZ25Cb3hPcHRpb25zPzogQWxpZ25Cb3hPcHRpb25zO1xyXG5cclxuICAvLyBuZXh0L3ByZXZpb3VzIGJ1dHRvbiBvcHRpb25zXHJcbiAgYnV0dG9uT3B0aW9ucz86IENhcm91c2VsQnV0dG9uT3B0aW9ucztcclxuXHJcbiAgLy8gaXRlbSBzZXBhcmF0b3Igb3B0aW9uc1xyXG4gIHNlcGFyYXRvcnNWaXNpYmxlPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBwdXQgc2VwYXJhdG9ycyBiZXR3ZWVuIGl0ZW1zXHJcbiAgc2VwYXJhdG9yT3B0aW9ucz86IFNlcGFyYXRvck9wdGlvbnM7XHJcblxyXG4gIC8vIGFuaW1hdGlvbiwgc2Nyb2xsaW5nIGJldHdlZW4gcGFnZXNcclxuICBhbmltYXRpb25FbmFibGVkPzogYm9vbGVhbjsgLy8gaXMgYW5pbWF0aW9uIGVuYWJsZWQgd2hlbiBzY3JvbGxpbmcgYmV0d2VlbiBwYWdlcz9cclxuICBhbmltYXRpb25PcHRpb25zPzogU3RyaWN0T21pdDxBbmltYXRpb25PcHRpb25zPG51bWJlcj4sICd0bycgfCAnc2V0VmFsdWUnIHwgJ2dldFZhbHVlJz47IC8vIFdlIG92ZXJyaWRlIHRvL3NldFZhbHVlL2dldFZhbHVlXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBDYXJvdXNlbE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8Tm9kZU9wdGlvbnMsICdjaGlsZHJlbic+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2Fyb3VzZWwgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLy8gSXRlbXMgaG9sZCB0aGUgZGF0YSB0byBjcmVhdGUgdGhlIGNhcm91c2VsSXRlbU5vZGVcclxuICBwcml2YXRlIHJlYWRvbmx5IGl0ZW1zOiBDYXJvdXNlbEl0ZW1bXTtcclxuXHJcbiAgLy8gZWFjaCBBbGlnbkJveCBob2xkcyBhIGNhcm91c2VsSXRlbU5vZGUgYW5kIGVuc3VyZXMgcHJvcGVyIHNpemluZyBpbiB0aGUgQ2Fyb3VzZWxcclxuICBwcml2YXRlIHJlYWRvbmx5IGFsaWduQm94ZXM6IEFsaWduQm94W107XHJcblxyXG4gIC8vIFN0b3JlcyB0aGUgdmlzaWJsZSBhbGlnbiBib3hlc1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdmlzaWJsZUFsaWduQm94ZXNQcm9wZXJ0eTogVW5rbm93bkRlcml2ZWRQcm9wZXJ0eTxBbGlnbkJveFtdPjtcclxuXHJcbiAgLy8gY3JlYXRlZCBmcm9tIGNyZWF0ZU5vZGUoKSBpbiBDYXJvdXNlbEl0ZW1cclxuICBwdWJsaWMgcmVhZG9ubHkgY2Fyb3VzZWxJdGVtTm9kZXM6IE5vZGVbXTtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBpdGVtc1BlclBhZ2U6IG51bWJlcjtcclxuICBwcml2YXRlIHJlYWRvbmx5IGRlZmF1bHRQYWdlTnVtYmVyOiBudW1iZXI7XHJcblxyXG4gIC8vIG51bWJlciBvZiBwYWdlcyBpbiB0aGUgY2Fyb3VzZWxcclxuICBwdWJsaWMgcmVhZG9ubHkgbnVtYmVyT2ZQYWdlc1Byb3BlcnR5OiBSZWFkT25seVByb3BlcnR5PG51bWJlcj47XHJcblxyXG4gIC8vIHBhZ2UgbnVtYmVyIHRoYXQgaXMgY3VycmVudGx5IHZpc2libGVcclxuICBwdWJsaWMgcmVhZG9ubHkgcGFnZU51bWJlclByb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+O1xyXG5cclxuICAvLyBlbmFibGVzIGFuaW1hdGlvbiB3aGVuIHNjcm9sbGluZyBiZXR3ZWVuIHBhZ2VzXHJcbiAgcHVibGljIGFuaW1hdGlvbkVuYWJsZWQ6IGJvb2xlYW47XHJcblxyXG4gIC8vIFRoZXNlIGFyZSBwdWJsaWMgZm9yIGxheW91dCAtIE5PVEU6IFRoZXNlIGFyZSBtdXRhdGVkIGlmIHRoZSBzaXplIGNoYW5nZXMgYWZ0ZXIgY29uc3RydWN0aW9uXHJcbiAgcHVibGljIGJhY2tncm91bmRXaWR0aCE6IG51bWJlcjtcclxuICBwdWJsaWMgYmFja2dyb3VuZEhlaWdodCE6IG51bWJlcjtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlQ2Fyb3VzZWw6ICgpID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBzY3JvbGxpbmdOb2RlOiBGbG93Qm94O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgY2Fyb3VzZWxDb25zdHJhaW50OiBDYXJvdXNlbENvbnN0cmFpbnQ7XHJcblxyXG4gIC8qKlxyXG4gICAqIE5PVEU6IFRoaXMgd2lsbCBkaXNwb3NlIHRoZSBpdGVtIE5vZGVzIHdoZW4gdGhlIGNhcm91c2VsIGlzIGRpc3Bvc2VkXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBpdGVtczogQ2Fyb3VzZWxJdGVtW10sIHByb3ZpZGVkT3B0aW9ucz86IENhcm91c2VsT3B0aW9ucyApIHtcclxuXHJcbiAgICAvLyBEb24ndCBhbmltYXRlIGR1cmluZyBpbml0aWFsaXphdGlvblxyXG4gICAgbGV0IGlzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBPdmVycmlkZSBkZWZhdWx0cyB3aXRoIHNwZWNpZmllZCBvcHRpb25zXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPENhcm91c2VsT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBjb250YWluZXJcclxuICAgICAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyxcclxuICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICAgIGNvcm5lclJhZGl1czogNCxcclxuICAgICAgZGVmYXVsdFBhZ2VOdW1iZXI6IDAsXHJcblxyXG4gICAgICAvLyBpdGVtc1xyXG4gICAgICBpdGVtc1BlclBhZ2U6IDQsXHJcbiAgICAgIHNwYWNpbmc6IDEyLFxyXG4gICAgICBtYXJnaW46IDYsXHJcblxyXG4gICAgICBhbGlnbkJveE9wdGlvbnM6IHtcclxuICAgICAgICBwaGV0aW9UeXBlOiBJbmRleGVkTm9kZUlPLFxyXG4gICAgICAgIHBoZXRpb1N0YXRlOiB0cnVlLFxyXG4gICAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHtcclxuICAgICAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gbmV4dC9wcmV2aW91cyBidXR0b25zXHJcbiAgICAgIGJ1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICB4TWFyZ2luOiA1LFxyXG4gICAgICAgIHlNYXJnaW46IDUsXHJcblxyXG4gICAgICAgIC8vIGZvciBkaWxhdGluZyBwb2ludGVyIGFyZWFzIG9mIG5leHQvcHJldmlvdXMgYnV0dG9ucyBzdWNoIHRoYXQgdGhleSBkbyBub3Qgb3ZlcmxhcCB3aXRoIENhcm91c2VsIGNvbnRlbnRcclxuICAgICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDAsXHJcbiAgICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiAwLFxyXG4gICAgICAgIG1vdXNlQXJlYVhEaWxhdGlvbjogMCxcclxuICAgICAgICBtb3VzZUFyZWFZRGlsYXRpb246IDAsXHJcblxyXG4gICAgICAgIGJhc2VDb2xvcjogJ3JnYmEoIDIwMCwgMjAwLCAyMDAsIDAuNSApJyxcclxuICAgICAgICBkaXNhYmxlZENvbG9yOiBDb2xvckNvbnN0YW50cy5MSUdIVF9HUkFZLFxyXG4gICAgICAgIGxpbmVXaWR0aDogMSxcclxuXHJcbiAgICAgICAgYXJyb3dQYXRoT3B0aW9uczoge1xyXG4gICAgICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICAgICAgbGluZVdpZHRoOiAzXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhcnJvd1NpemU6IERFRkFVTFRfQVJST1dfU0laRSxcclxuXHJcbiAgICAgICAgZW5hYmxlZFByb3BlcnR5T3B0aW9uczoge1xyXG4gICAgICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgICAgICBwaGV0aW9GZWF0dXJlZDogZmFsc2VcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzb3VuZFBsYXllcjogcHVzaEJ1dHRvblNvdW5kUGxheWVyXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBpdGVtIHNlcGFyYXRvcnNcclxuICAgICAgc2VwYXJhdG9yc1Zpc2libGU6IGZhbHNlLFxyXG4gICAgICBzZXBhcmF0b3JPcHRpb25zOiB7XHJcbiAgICAgICAgc3Ryb2tlOiAncmdiKCAxODAsIDE4MCwgMTgwICknLFxyXG4gICAgICAgIGxpbmVXaWR0aDogMC41LFxyXG4gICAgICAgIHBpY2thYmxlOiBmYWxzZVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gYW5pbWF0aW9uLCBzY3JvbGxpbmcgYmV0d2VlbiBwYWdlc1xyXG4gICAgICBhbmltYXRpb25FbmFibGVkOiB0cnVlLFxyXG4gICAgICBhbmltYXRpb25PcHRpb25zOiB7XHJcbiAgICAgICAgZHVyYXRpb246IDAuNCxcclxuICAgICAgICBzdGVwRW1pdHRlcjogc3RlcFRpbWVyLFxyXG4gICAgICAgIGVhc2luZzogRWFzaW5nLkNVQklDX0lOX09VVFxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRJT05BTCxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczoge1xyXG4gICAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXHJcbiAgICAgIH1cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgdGhpcy5hbmltYXRpb25FbmFibGVkID0gb3B0aW9ucy5hbmltYXRpb25FbmFibGVkO1xyXG4gICAgdGhpcy5pdGVtcyA9IGl0ZW1zO1xyXG4gICAgdGhpcy5pdGVtc1BlclBhZ2UgPSBvcHRpb25zLml0ZW1zUGVyUGFnZTtcclxuICAgIHRoaXMuZGVmYXVsdFBhZ2VOdW1iZXIgPSBvcHRpb25zLmRlZmF1bHRQYWdlTnVtYmVyO1xyXG5cclxuICAgIGNvbnN0IG9yaWVudGF0aW9uID0gT3JpZW50YXRpb24uZnJvbUxheW91dE9yaWVudGF0aW9uKCBvcHRpb25zLm9yaWVudGF0aW9uICk7XHJcbiAgICBjb25zdCBhbGlnbkdyb3VwID0gbmV3IEFsaWduR3JvdXAoKTtcclxuXHJcbiAgICBjb25zdCBpdGVtc1RhbmRlbSA9IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2l0ZW1zJyApO1xyXG4gICAgdGhpcy5jYXJvdXNlbEl0ZW1Ob2RlcyA9IGdldEdyb3VwSXRlbU5vZGVzKCBpdGVtcywgaXRlbXNUYW5kZW0gKTtcclxuXHJcbiAgICAvLyBBbGwgaXRlbXMgYXJlIHdyYXBwZWQgaW4gQWxpZ25Cb3hlcyB0byBlbnN1cmUgY29uc2lzdGVudCBzaXppbmdcclxuICAgIHRoaXMuYWxpZ25Cb3hlcyA9IGl0ZW1zLm1hcCggKCBpdGVtLCBpbmRleCApID0+IHtcclxuICAgICAgcmV0dXJuIGFsaWduR3JvdXAuY3JlYXRlQm94KCB0aGlzLmNhcm91c2VsSXRlbU5vZGVzWyBpbmRleCBdLCBjb21iaW5lT3B0aW9uczxBbGlnbkJveE9wdGlvbnM+KCB7XHJcbiAgICAgICAgICB0YW5kZW06IGl0ZW0udGFuZGVtTmFtZSA/IGl0ZW1zVGFuZGVtLmNyZWF0ZVRhbmRlbSggaXRlbS50YW5kZW1OYW1lICkgOiBUYW5kZW0uT1BUSU9OQUxcclxuICAgICAgICB9LCBvcHRpb25zLmFsaWduQm94T3B0aW9ucyxcclxuXHJcbiAgICAgICAgLy8gSXRlbS1zcGVjaWZpYyBvcHRpb25zIHRha2UgcHJlY2VkZW5jZVxyXG4gICAgICAgIGl0ZW0uYWxpZ25Cb3hPcHRpb25zICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBzY3JvbGxpbmdOb2RlIHdpbGwgY29udGFpbiBhbGwgaXRlbXMsIGFycmFuZ2VkIGluIHRoZSBwcm9wZXIgb3JpZW50YXRpb24sIHdpdGggbWFyZ2lucyBhbmQgc3BhY2luZy5cclxuICAgIC8vIE5PVEU6IFdlJ2xsIG5lZWQgdG8gaGFuZGxlIHVwZGF0ZXMgdG8gdGhlIG9yZGVyIChmb3IgcGhldC1pbyBJbmRleGVkTm9kZUlPKS5cclxuICAgIC8vIEhvcml6b250YWwgY2Fyb3VzZWwgYXJyYW5nZSBpdGVtcyBsZWZ0LXRvLXJpZ2h0LCB2ZXJ0aWNhbCBpcyB0b3AtdG8tYm90dG9tLlxyXG4gICAgLy8gVHJhbnNsYXRpb24gb2YgdGhpcyBub2RlIHdpbGwgYmUgYW5pbWF0ZWQgdG8gZ2l2ZSB0aGUgZWZmZWN0IG9mIHNjcm9sbGluZyB0aHJvdWdoIHRoZSBpdGVtcy5cclxuICAgIHRoaXMuc2Nyb2xsaW5nTm9kZSA9IG5ldyBTY3JvbGxpbmdGbG93Qm94KCB0aGlzLCB7XHJcbiAgICAgIGNoaWxkcmVuOiB0aGlzLmFsaWduQm94ZXMsXHJcbiAgICAgIG9yaWVudGF0aW9uOiBvcHRpb25zLm9yaWVudGF0aW9uLFxyXG4gICAgICBzcGFjaW5nOiBvcHRpb25zLnNwYWNpbmcsXHJcbiAgICAgIFsgYCR7b3JpZW50YXRpb24ub3Bwb3NpdGUuY29vcmRpbmF0ZX1NYXJnaW5gIF06IG9wdGlvbnMubWFyZ2luXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVmlzaWJsZSBBbGlnbkJveGVzICh0aGVzZSBhcmUgdGhlIG9uZXMgd2UgbGF5IG91dCBhbmQgYmFzZSBldmVyeXRoaW5nIG9uKVxyXG4gICAgdGhpcy52aXNpYmxlQWxpZ25Cb3hlc1Byb3BlcnR5ID0gRGVyaXZlZFByb3BlcnR5LmRlcml2ZUFueSggdGhpcy5hbGlnbkJveGVzLm1hcCggYWxpZ25Cb3ggPT4gYWxpZ25Cb3gudmlzaWJsZVByb3BlcnR5ICksICgpID0+IHtcclxuICAgICAgcmV0dXJuIHRoaXMuZ2V0VmlzaWJsZUFsaWduQm94ZXMoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSBBbGlnbkJveGVzIGFyZSByZW9yZGVyZWQsIHdlIG5lZWQgdG8gcmVjb21wdXRlIHRoZSB2aXNpYmxlQWxpZ25Cb3hlc1Byb3BlcnR5XHJcbiAgICB0aGlzLnNjcm9sbGluZ05vZGUuY2hpbGRyZW5SZW9yZGVyZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB0aGlzLnZpc2libGVBbGlnbkJveGVzUHJvcGVydHkucmVjb21wdXRlRGVyaXZhdGlvbigpICk7XHJcblxyXG4gICAgLy8gT3B0aW9ucyBjb21tb24gdG8gYm90aCBidXR0b25zXHJcbiAgICBjb25zdCBidXR0b25PcHRpb25zID0gY29tYmluZU9wdGlvbnM8Q2Fyb3VzZWxCdXR0b25PcHRpb25zPigge1xyXG4gICAgICBjb3JuZXJSYWRpdXM6IG9wdGlvbnMuY29ybmVyUmFkaXVzXHJcbiAgICB9LCBvcHRpb25zLmJ1dHRvbk9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnNwYWNpbmcgPj0gb3B0aW9ucy5tYXJnaW4sICdUaGUgc3BhY2luZyBtdXN0IGJlID49IHRoZSBtYXJnaW4sIG9yIHlvdSB3aWxsIHNlZSAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3BhZ2UgMiBpdGVtcyBhdCB0aGUgZW5kIG9mIHBhZ2UgMScgKTtcclxuXHJcbiAgICAvLyBJbiBvcmRlciB0byBtYWtlIGl0IGVhc3kgZm9yIHBoZXQtaW8gdG8gcmUtb3JkZXIgaXRlbXMsIHRoZSBzZXBhcmF0b3JzIHNob3VsZCBub3QgcGFydGljaXBhdGVcclxuICAgIC8vIGluIHRoZSBsYXlvdXQgYW5kIGhhdmUgaW5kaWNlcyB0aGF0IGdldCBtb3ZlZCBhcm91bmQuICBUaGVyZWZvcmUsIHdlIGFkZCBhIHNlcGFyYXRlIGxheWVyIHRvXHJcbiAgICAvLyBzaG93IHRoZSBzZXBhcmF0b3JzLlxyXG4gICAgY29uc3Qgc2VwYXJhdG9yTGF5ZXIgPSBvcHRpb25zLnNlcGFyYXRvcnNWaXNpYmxlID8gbmV3IE5vZGUoIHtcclxuICAgICAgcGlja2FibGU6IGZhbHNlXHJcbiAgICB9ICkgOiBudWxsO1xyXG5cclxuICAgIC8vIENvbnRhaW5zIHRoZSBzY3JvbGxpbmcgbm9kZSBhbmQgdGhlIGFzc29jaWF0ZWQgc2VwYXJhdG9ycywgaWYgYW55XHJcbiAgICBjb25zdCBzY3JvbGxpbmdOb2RlQ29udGFpbmVyID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IG9wdGlvbnMuc2VwYXJhdG9yc1Zpc2libGUgPyBbIHNlcGFyYXRvckxheWVyISwgdGhpcy5zY3JvbGxpbmdOb2RlIF0gOiBbIHRoaXMuc2Nyb2xsaW5nTm9kZSBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSGF2ZSB0byBoYXZlIGF0IGxlYXN0IG9uZSBwYWdlLCBldmVuIGlmIGl0IGlzIGJsYW5rXHJcbiAgICBjb25zdCBjb3VudFBhZ2VzID0gKCBpdGVtczogQWxpZ25Cb3hbXSApID0+IE1hdGgubWF4KCBNYXRoLmNlaWwoIGl0ZW1zLmxlbmd0aCAvIG9wdGlvbnMuaXRlbXNQZXJQYWdlICksIDEgKTtcclxuXHJcbiAgICAvLyBOdW1iZXIgb2YgcGFnZXMgaXMgZGVyaXZlZCBmcm9tIHRoZSB0b3RhbCBudW1iZXIgb2YgaXRlbXMgYW5kIHRoZSBudW1iZXIgb2YgaXRlbXMgcGVyIHBhZ2VcclxuICAgIHRoaXMubnVtYmVyT2ZQYWdlc1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLnZpc2libGVBbGlnbkJveGVzUHJvcGVydHkgXSwgdmlzaWJsZUFsaWduQm94ZXMgPT4ge1xyXG4gICAgICByZXR1cm4gY291bnRQYWdlcyggdmlzaWJsZUFsaWduQm94ZXMgKTtcclxuICAgIH0sIHtcclxuICAgICAgaXNWYWxpZFZhbHVlOiB2ID0+IHYgPiAwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbWF4UGFnZXMgPSBjb3VudFBhZ2VzKCB0aGlzLmFsaWduQm94ZXMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmRlZmF1bHRQYWdlTnVtYmVyID49IDAgJiYgb3B0aW9ucy5kZWZhdWx0UGFnZU51bWJlciA8PSB0aGlzLm51bWJlck9mUGFnZXNQcm9wZXJ0eS52YWx1ZSAtIDEsXHJcbiAgICAgIGBkZWZhdWx0UGFnZU51bWJlciBpcyBvdXQgb2YgcmFuZ2U6ICR7b3B0aW9ucy5kZWZhdWx0UGFnZU51bWJlcn1gICk7XHJcblxyXG4gICAgLy8gTnVtYmVyIG9mIHRoZSBwYWdlIHRoYXQgaXMgdmlzaWJsZSBpbiB0aGUgY2Fyb3VzZWwuXHJcbiAgICB0aGlzLnBhZ2VOdW1iZXJQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggb3B0aW9ucy5kZWZhdWx0UGFnZU51bWJlciwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BhZ2VOdW1iZXJQcm9wZXJ0eScgKSxcclxuICAgICAgbnVtYmVyVHlwZTogJ0ludGVnZXInLFxyXG4gICAgICBpc1ZhbGlkVmFsdWU6ICggdmFsdWU6IG51bWJlciApID0+IHZhbHVlIDwgdGhpcy5udW1iZXJPZlBhZ2VzUHJvcGVydHkudmFsdWUgJiYgdmFsdWUgPj0gMCxcclxuXHJcbiAgICAgIC8vIEJhc2VkIG9uIHRoZSB0b3RhbCBudW1iZXIgb2YgcG9zc2libGUgYWxpZ25Cb3hlcywgbm90IGp1c3QgdGhlIG9uZXMgdmlzaWJsZSBvbiBzdGFydHVwXHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIG1heFBhZ2VzIC0gMSApLFxyXG4gICAgICBwaGV0aW9GZWF0dXJlZDogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGJ1dHRvbnNWaXNpYmxlUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMubnVtYmVyT2ZQYWdlc1Byb3BlcnR5IF0sIG51bWJlck9mUGFnZXMgPT4ge1xyXG4gICAgICAvLyBhbHdheXMgc2hvdyB0aGUgYnV0dG9ucyBpZiB0aGVyZSBpcyBtb3JlIHRoYW4gb25lIHBhZ2UsIGFuZCBhbHdheXMgaGlkZSB0aGUgYnV0dG9ucyBpZiB0aGVyZSBpcyBvbmx5IG9uZSBwYWdlXHJcbiAgICAgIHJldHVybiBudW1iZXJPZlBhZ2VzID4gMTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBOZXh0IGJ1dHRvblxyXG4gICAgY29uc3QgbmV4dEJ1dHRvbiA9IG5ldyBDYXJvdXNlbEJ1dHRvbiggY29tYmluZU9wdGlvbnM8Q2Fyb3VzZWxCdXR0b25PcHRpb25zPigge1xyXG4gICAgICBhcnJvd0RpcmVjdGlvbjogb3JpZW50YXRpb24gPT09IE9yaWVudGF0aW9uLkhPUklaT05UQUwgPyAncmlnaHQnIDogJ2Rvd24nLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ25leHRCdXR0b24nICksXHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB0aGlzLnBhZ2VOdW1iZXJQcm9wZXJ0eS5zZXQoIHRoaXMucGFnZU51bWJlclByb3BlcnR5LmdldCgpICsgMSApLFxyXG4gICAgICBlbmFibGVkUHJvcGVydHk6IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5wYWdlTnVtYmVyUHJvcGVydHksIHRoaXMubnVtYmVyT2ZQYWdlc1Byb3BlcnR5IF0sICggcGFnZU51bWJlciwgbnVtYmVyb2ZQYWdlcyApID0+IHtcclxuICAgICAgICByZXR1cm4gcGFnZU51bWJlciA8IG51bWJlcm9mUGFnZXMgLSAxO1xyXG4gICAgICB9ICksXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogYnV0dG9uc1Zpc2libGVQcm9wZXJ0eVxyXG4gICAgfSwgYnV0dG9uT3B0aW9ucyApICk7XHJcblxyXG4gICAgLy8gUHJldmlvdXMgYnV0dG9uXHJcbiAgICBjb25zdCBwcmV2aW91c0J1dHRvbiA9IG5ldyBDYXJvdXNlbEJ1dHRvbiggY29tYmluZU9wdGlvbnM8Q2Fyb3VzZWxCdXR0b25PcHRpb25zPigge1xyXG4gICAgICBhcnJvd0RpcmVjdGlvbjogb3JpZW50YXRpb24gPT09IE9yaWVudGF0aW9uLkhPUklaT05UQUwgPyAnbGVmdCcgOiAndXAnLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ByZXZpb3VzQnV0dG9uJyApLFxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4gdGhpcy5wYWdlTnVtYmVyUHJvcGVydHkuc2V0KCB0aGlzLnBhZ2VOdW1iZXJQcm9wZXJ0eS5nZXQoKSAtIDEgKSxcclxuICAgICAgZW5hYmxlZFByb3BlcnR5OiBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMucGFnZU51bWJlclByb3BlcnR5IF0sIHBhZ2VOdW1iZXIgPT4ge1xyXG4gICAgICAgIHJldHVybiBwYWdlTnVtYmVyID4gMDtcclxuICAgICAgfSApLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IGJ1dHRvbnNWaXNpYmxlUHJvcGVydHlcclxuICAgIH0sIGJ1dHRvbk9wdGlvbnMgKSApO1xyXG5cclxuICAgIC8vIFdpbmRvdyB3aXRoIGNsaXBwaW5nIGFyZWEsIHNvIHRoYXQgdGhlIHNjcm9sbGluZ05vZGVDb250YWluZXIgY2FuIGJlIHNjcm9sbGVkXHJcbiAgICBjb25zdCB3aW5kb3dOb2RlID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgc2Nyb2xsaW5nTm9kZUNvbnRhaW5lciBdIH0gKTtcclxuXHJcbiAgICAvLyBCYWNrZ3JvdW5kIC0gZGlzcGxheXMgdGhlIGNhcm91c2VsJ3MgZmlsbCBjb2xvclxyXG4gICAgY29uc3QgYmFja2dyb3VuZE5vZGUgPSBuZXcgUmVjdGFuZ2xlKCB7XHJcbiAgICAgIGNvcm5lclJhZGl1czogb3B0aW9ucy5jb3JuZXJSYWRpdXMsXHJcbiAgICAgIGZpbGw6IG9wdGlvbnMuZmlsbFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEZvcmVncm91bmQgLSBkaXNwbGF5cyB0aGUgY2Fyb3VzZWwncyBvdXRsaW5lLCBjcmVhdGVkIGFzIGEgc2VwYXJhdGUgbm9kZSBzbyB0aGF0IGl0IGNhbiBiZSBwbGFjZWQgb24gdG9wIG9mXHJcbiAgICAvLyBldmVyeXRoaW5nLCBmb3IgYSBjbGVhbiBsb29rLlxyXG4gICAgY29uc3QgZm9yZWdyb3VuZE5vZGUgPSBuZXcgUmVjdGFuZ2xlKCB7XHJcbiAgICAgIGNvcm5lclJhZGl1czogb3B0aW9ucy5jb3JuZXJSYWRpdXMsXHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5zdHJva2UsXHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRvcC1sZXZlbCBsYXlvdXQgKGJhc2VkIG9uIGJhY2tncm91bmQgY2hhbmdlcykuXHJcbiAgICB0aGlzLmNhcm91c2VsQ29uc3RyYWludCA9IG5ldyBDYXJvdXNlbENvbnN0cmFpbnQoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIGJhY2tncm91bmROb2RlLFxyXG4gICAgICBmb3JlZ3JvdW5kTm9kZSxcclxuICAgICAgd2luZG93Tm9kZSxcclxuICAgICAgcHJldmlvdXNCdXR0b24sXHJcbiAgICAgIG5leHRCdXR0b24sXHJcbiAgICAgIHNjcm9sbGluZ05vZGVDb250YWluZXIsXHJcbiAgICAgIHRoaXMuYWxpZ25Cb3hlcyxcclxuICAgICAgb3JpZW50YXRpb24sXHJcbiAgICAgIHRoaXMuc2Nyb2xsaW5nTm9kZSxcclxuICAgICAgdGhpcy5pdGVtc1BlclBhZ2UsXHJcbiAgICAgIG9wdGlvbnMubWFyZ2luLFxyXG4gICAgICBhbGlnbkdyb3VwLFxyXG4gICAgICBzZXBhcmF0b3JMYXllcixcclxuICAgICAgb3B0aW9ucy5zZXBhcmF0b3JPcHRpb25zICk7XHJcblxyXG4gICAgLy8gSGFuZGxlIGNoYW5naW5nIHBhZ2VzIChvciBpZiB0aGUgY29udGVudCBjaGFuZ2VzKVxyXG4gICAgbGV0IHNjcm9sbEFuaW1hdGlvbjogQW5pbWF0aW9uIHwgbnVsbCA9IG51bGw7XHJcbiAgICBjb25zdCBsYXN0U2Nyb2xsQm91bmRzID0gbmV3IEJvdW5kczIoIDAsIDAsIDAsIDAgKTsgLy8gdXNlZCBtdXRhYmx5XHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIHRoaXMucGFnZU51bWJlclByb3BlcnR5LCBzY3JvbGxpbmdOb2RlQ29udGFpbmVyLmxvY2FsQm91bmRzUHJvcGVydHkgXSwgKCBwYWdlTnVtYmVyLCBzY3JvbGxCb3VuZHMgKSA9PiB7XHJcblxyXG4gICAgICAvLyBXZSBtaWdodCB0ZW1wb3JhcmlseSBoaXQgdGhpcyB2YWx1ZS4gQmFpbCBvdXQgbm93IGluc3RlYWQgb2YgYW4gYXNzZXJ0aW9uIChpdCB3aWxsIGdldCBmaXJlZCBhZ2FpbilcclxuICAgICAgaWYgKCBwYWdlTnVtYmVyID49IHRoaXMubnVtYmVyT2ZQYWdlc1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gc3RvcCBhbnkgYW5pbWF0aW9uIHRoYXQncyBpbiBwcm9ncmVzc1xyXG4gICAgICBzY3JvbGxBbmltYXRpb24gJiYgc2Nyb2xsQW5pbWF0aW9uLnN0b3AoKTtcclxuXHJcbiAgICAgIC8vIEZpbmQgdGhlIGl0ZW0gYXQgdGhlIHRvcCBvZiBwYWdlTnVtYmVyIHBhZ2VcclxuICAgICAgY29uc3QgZmlyc3RJdGVtT25QYWdlID0gdGhpcy52aXNpYmxlQWxpZ25Cb3hlc1Byb3BlcnR5LnZhbHVlWyBwYWdlTnVtYmVyICogb3B0aW9ucy5pdGVtc1BlclBhZ2UgXTtcclxuXHJcbiAgICAgIC8vIFBsYWNlIHdlIHdhbnQgdG8gc2Nyb2xsIHRvXHJcbiAgICAgIGNvbnN0IHRhcmdldFZhbHVlID0gZmlyc3RJdGVtT25QYWdlID8gKCAoIC1maXJzdEl0ZW1PblBhZ2VbIG9yaWVudGF0aW9uLm1pblNpZGUgXSApICsgb3B0aW9ucy5tYXJnaW4gKSA6IDA7XHJcblxyXG4gICAgICBjb25zdCBzY3JvbGxCb3VuZHNDaGFuZ2VkID0gbGFzdFNjcm9sbEJvdW5kcyA9PT0gbnVsbCB8fCAhbGFzdFNjcm9sbEJvdW5kcy5lcXVhbHMoIHNjcm9sbEJvdW5kcyApO1xyXG4gICAgICBsYXN0U2Nyb2xsQm91bmRzLnNldCggc2Nyb2xsQm91bmRzICk7IC8vIHNjcm9sbEJvdW5kcyBpcyBtdXRhYmxlLCB3ZSBnZXQgdGhlIHNhbWUgcmVmZXJlbmNlLCBkb24ndCBzdG9yZSBpdFxyXG5cclxuICAgICAgLy8gT25seSBhbmltYXRlIGlmIGFuaW1hdGlvbiBpcyBlbmFibGVkIGFuZCBQaEVULWlPIHN0YXRlIGlzIG5vdCBiZWluZyBzZXQuICBXaGVuIFBoRVQtaU8gc3RhdGUgaXMgYmVpbmcgc2V0IChhc1xyXG4gICAgICAvLyBpbiBsb2FkaW5nIGEgY3VzdG9taXplZCBzdGF0ZSksIHRoZSBjYXJvdXNlbCBzaG91bGQgaW1tZWRpYXRlbHkgcmVmbGVjdCB0aGUgZGVzaXJlZCBwYWdlXHJcbiAgICAgIC8vIERvIG5vdCBhbmltYXRlIGR1cmluZyBpbml0aWFsaXphdGlvbi5cclxuICAgICAgLy8gRG8gbm90IGFuaW1hdGUgd2hlbiBvdXIgc2Nyb2xsQm91bmRzIGhhdmUgY2hhbmdlZCAob3VyIGNvbnRlbnQgcHJvYmFibHkgcmVzaXplZClcclxuICAgICAgaWYgKCB0aGlzLmFuaW1hdGlvbkVuYWJsZWQgJiYgIXdpbmRvdz8ucGhldD8uam9pc3Q/LnNpbT8uaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eT8udmFsdWUgJiYgaXNJbml0aWFsaXplZCAmJiAhc2Nyb2xsQm91bmRzQ2hhbmdlZCApIHtcclxuXHJcbiAgICAgICAgLy8gY3JlYXRlIGFuZCBzdGFydCB0aGUgc2Nyb2xsIGFuaW1hdGlvblxyXG4gICAgICAgIHNjcm9sbEFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oIGNvbWJpbmVPcHRpb25zPEFuaW1hdGlvbk9wdGlvbnM8bnVtYmVyPj4oIHt9LCBvcHRpb25zLmFuaW1hdGlvbk9wdGlvbnMsIHtcclxuICAgICAgICAgIHRvOiB0YXJnZXRWYWx1ZSxcclxuXHJcbiAgICAgICAgICAvLyBvcHRpb25zIHRoYXQgYXJlIHNwZWNpZmljIHRvIG9yaWVudGF0aW9uXHJcbiAgICAgICAgICBnZXRWYWx1ZTogKCkgPT4gc2Nyb2xsaW5nTm9kZUNvbnRhaW5lclsgb3JpZW50YXRpb24uY29vcmRpbmF0ZSBdLFxyXG4gICAgICAgICAgc2V0VmFsdWU6ICggdmFsdWU6IG51bWJlciApID0+IHsgc2Nyb2xsaW5nTm9kZUNvbnRhaW5lclsgb3JpZW50YXRpb24uY29vcmRpbmF0ZSBdID0gdmFsdWU7IH1cclxuICAgICAgICB9ICkgKTtcclxuICAgICAgICBzY3JvbGxBbmltYXRpb24uc3RhcnQoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gYW5pbWF0aW9uIGRpc2FibGVkLCBtb3ZlIGltbWVkaWF0ZSB0byBuZXcgcGFnZVxyXG4gICAgICAgIHNjcm9sbGluZ05vZGVDb250YWluZXJbIG9yaWVudGF0aW9uLmNvb3JkaW5hdGUgXSA9IHRhcmdldFZhbHVlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRG9uJ3Qgc3RheSBvbiBhIHBhZ2UgdGhhdCBkb2Vzbid0IGV4aXN0XHJcbiAgICB0aGlzLnZpc2libGVBbGlnbkJveGVzUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICAvLyBpZiB0aGUgb25seSBlbGVtZW50IGluIHRoZSBsYXN0IHBhZ2UgaXMgcmVtb3ZlZCwgcmVtb3ZlIHRoZSBwYWdlIGFuZCBhdXRvc2Nyb2xsIHRvIHRoZSBuZXcgZmluYWwgcGFnZVxyXG4gICAgICB0aGlzLnBhZ2VOdW1iZXJQcm9wZXJ0eS52YWx1ZSA9IE1hdGgubWluKCB0aGlzLnBhZ2VOdW1iZXJQcm9wZXJ0eS52YWx1ZSwgdGhpcy5udW1iZXJPZlBhZ2VzUHJvcGVydHkudmFsdWUgLSAxICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgYmFja2dyb3VuZE5vZGUsIHdpbmRvd05vZGUsIG5leHRCdXR0b24sIHByZXZpb3VzQnV0dG9uLCBmb3JlZ3JvdW5kTm9kZSBdO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZUNhcm91c2VsID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLnZpc2libGVBbGlnbkJveGVzUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgICB0aGlzLnBhZ2VOdW1iZXJQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICAgIHRoaXMuYWxpZ25Cb3hlcy5mb3JFYWNoKCBhbGlnbkJveCA9PiB7XHJcblxyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGFsaWduQm94LmNoaWxkcmVuLmxlbmd0aCA9PT0gMSwgJ0Nhcm91c2VsIEFsaWduQm94IGluc3RhbmNlcyBzaG91bGQgaGF2ZSBvbmx5IG9uZSBjaGlsZCcgKTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmNhcm91c2VsSXRlbU5vZGVzLmluY2x1ZGVzKCBhbGlnbkJveC5jaGlsZHJlblsgMCBdICksICdDYXJvdXNlbCBBbGlnbkJveCBpbnN0YW5jZXMgc2hvdWxkIHdyYXAgYSBjb250ZW50IG5vZGUnICk7XHJcblxyXG4gICAgICAgIGFsaWduQm94LmRpc3Bvc2UoKTtcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLnNjcm9sbGluZ05vZGUuZGlzcG9zZSgpO1xyXG4gICAgICB0aGlzLmNhcm91c2VsQ29uc3RyYWludC5kaXNwb3NlKCk7XHJcbiAgICAgIHRoaXMuY2Fyb3VzZWxJdGVtTm9kZXMuZm9yRWFjaCggbm9kZSA9PiBub2RlLmRpc3Bvc2UoKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFdpbGwgYWxsb3cgcG90ZW50aWFsIGFuaW1hdGlvbiBhZnRlciB0aGlzXHJcbiAgICBpc0luaXRpYWxpemVkID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcclxuICAgIGFzc2VydCAmJiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3N1bicsICdDYXJvdXNlbCcsIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE5PVEU6IFRoaXMgd2lsbCBkaXNwb3NlIHRoZSBpdGVtIE5vZGVzXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VDYXJvdXNlbCgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoZSBjYXJvdXNlbCB0byBpdHMgaW5pdGlhbCBzdGF0ZS5cclxuICAgKiBAcGFyYW0gYW5pbWF0aW9uRW5hYmxlZCAtIHdoZXRoZXIgdG8gZW5hYmxlIGFuaW1hdGlvbiBkdXJpbmcgcmVzZXRcclxuICAgKi9cclxuICBwdWJsaWMgcmVzZXQoIGFuaW1hdGlvbkVuYWJsZWQgPSBmYWxzZSApOiB2b2lkIHtcclxuICAgIGNvbnN0IHNhdmVBbmltYXRpb25FbmFibGVkID0gdGhpcy5hbmltYXRpb25FbmFibGVkO1xyXG4gICAgdGhpcy5hbmltYXRpb25FbmFibGVkID0gYW5pbWF0aW9uRW5hYmxlZDtcclxuXHJcbiAgICAvLyBSZXNldCB0aGUgcGFnZSBudW1iZXIgdG8gdGhlIGRlZmF1bHQgcGFnZSBudW1iZXIgaWYgcG9zc2libGUgKGlmIHRoaW5ncyBhcmUgaGlkZGVuLCBpdCBtaWdodCBub3QgYmUgcG9zc2libGUpXHJcbiAgICB0aGlzLnBhZ2VOdW1iZXJQcm9wZXJ0eS52YWx1ZSA9IE1hdGgubWluKCB0aGlzLmRlZmF1bHRQYWdlTnVtYmVyLCB0aGlzLm51bWJlck9mUGFnZXNQcm9wZXJ0eS52YWx1ZSAtIDEgKTtcclxuXHJcbiAgICB0aGlzLmFuaW1hdGlvbkVuYWJsZWQgPSBzYXZlQW5pbWF0aW9uRW5hYmxlZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdpdmVuIGFuIGl0ZW0ncyB2aXNpYmxlIGluZGV4LCBzY3JvbGxzIHRoZSBjYXJvdXNlbCB0byB0aGUgcGFnZSB0aGF0IGNvbnRhaW5zIHRoYXQgaXRlbS5cclxuICAgKi9cclxuICBwcml2YXRlIHNjcm9sbFRvSXRlbVZpc2libGVJbmRleCggaXRlbVZpc2libGVJbmRleDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgdGhpcy5wYWdlTnVtYmVyUHJvcGVydHkuc2V0KCB0aGlzLml0ZW1WaXNpYmxlSW5kZXhUb1BhZ2VOdW1iZXIoIGl0ZW1WaXNpYmxlSW5kZXggKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2l2ZW4gYW4gaXRlbSwgc2Nyb2xscyB0aGUgY2Fyb3VzZWwgdG8gdGhlIHBhZ2UgdGhhdCBjb250YWlucyB0aGF0IGl0ZW0uIFRoaXMgd2lsbCBvbmx5IHNjcm9sbCBpZiBpdGVtIGlzIGluIHRoZVxyXG4gICAqIENhcm91c2VsIGFuZCB2aXNpYmxlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzY3JvbGxUb0l0ZW0oIGl0ZW06IENhcm91c2VsSXRlbSApOiB2b2lkIHtcclxuICAgIHRoaXMuc2Nyb2xsVG9BbGlnbkJveCggdGhpcy5nZXRBbGlnbkJveEZvckl0ZW0oIGl0ZW0gKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUHVibGljIGZvciBTY3JvbGxpbmdGbG93Qm94IG9ubHlcclxuICAgKi9cclxuICBwdWJsaWMgc2Nyb2xsVG9BbGlnbkJveCggYWxpZ25Cb3g6IEFsaWduQm94ICk6IHZvaWQge1xyXG5cclxuXHJcbiAgICAvLyBJZiB0aGUgbGF5b3V0IGlzIGR5bmFtaWMsIHRoZW4gb25seSBhY2NvdW50IGZvciB0aGUgdmlzaWJsZSBpdGVtc1xyXG4gICAgY29uc3QgYWxpZ25Cb3hJbmRleCA9IHRoaXMudmlzaWJsZUFsaWduQm94ZXNQcm9wZXJ0eS52YWx1ZS5pbmRleE9mKCBhbGlnbkJveCApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFsaWduQm94SW5kZXggPj0gMCwgJ2l0ZW0gbm90IHByZXNlbnQgb3IgdmlzaWJsZScgKTtcclxuICAgIGlmICggYWxpZ25Cb3hJbmRleCA+PSAwICkge1xyXG4gICAgICB0aGlzLnNjcm9sbFRvSXRlbVZpc2libGVJbmRleCggYWxpZ25Cb3hJbmRleCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSB2aXNpYmlsaXR5IG9mIGFuIGl0ZW0gaW4gdGhlIENhcm91c2VsLiBUaGlzIHRvZ2dsZXMgdmlzaWJpbGl0eSBhbmQgd2lsbCByZWZsb3cgdGhlIGxheW91dCwgc3VjaCB0aGF0IGhpZGRlblxyXG4gICAqIGl0ZW1zIGRvIG5vdCBsZWF2ZSBhIGdhcCBpbiB0aGUgbGF5b3V0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRJdGVtVmlzaWJsZSggaXRlbTogQ2Fyb3VzZWxJdGVtLCB2aXNpYmxlOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgdGhpcy5nZXRBbGlnbkJveEZvckl0ZW0oIGl0ZW0gKS52aXNpYmxlID0gdmlzaWJsZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIEFsaWduQm94IHRoYXQgd3JhcHMgYW4gaXRlbSdzIE5vZGUuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRBbGlnbkJveEZvckl0ZW0oIGl0ZW06IENhcm91c2VsSXRlbSApOiBBbGlnbkJveCB7XHJcbiAgICBjb25zdCBhbGlnbkJveCA9IHRoaXMuYWxpZ25Cb3hlc1sgdGhpcy5pdGVtcy5pbmRleE9mKCBpdGVtICkgXTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhbGlnbkJveCwgJ2l0ZW0gZG9lcyBub3QgaGF2ZSBjb3JyZXNwb25kaW5nIGFsaWduQm94JyApO1xyXG4gICAgcmV0dXJuIGFsaWduQm94O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgTm9kZSB0aGF0IHdhcyBjcmVhdGVkIGZvciBhIGdpdmVuIGl0ZW0uXHJcbiAgICovXHJcbiAgcHVibGljIGdldE5vZGVGb3JJdGVtKCBpdGVtOiBDYXJvdXNlbEl0ZW0gKTogTm9kZSB7XHJcbiAgICBjb25zdCBub2RlID0gdGhpcy5jYXJvdXNlbEl0ZW1Ob2Rlc1sgdGhpcy5pdGVtcy5pbmRleE9mKCBpdGVtICkgXTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlLCAnaXRlbSBkb2VzIG5vdCBoYXZlIGNvcnJlc3BvbmRpbmcgbm9kZScgKTtcclxuICAgIHJldHVybiBub2RlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpdGVtVmlzaWJsZUluZGV4VG9QYWdlTnVtYmVyKCBpdGVtSW5kZXg6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXRlbUluZGV4ID49IDAgJiYgaXRlbUluZGV4IDwgdGhpcy5pdGVtcy5sZW5ndGgsIGBpdGVtSW5kZXggb3V0IG9mIHJhbmdlOiAke2l0ZW1JbmRleH1gICk7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vciggaXRlbUluZGV4IC8gdGhpcy5pdGVtc1BlclBhZ2UgKTtcclxuICB9XHJcblxyXG4gIC8vIFRoZSBvcmRlciBvZiBhbGlnbkJveGVzIG1pZ2h0IGJlIHR3ZWFrZWQgaW4gc2Nyb2xsaW5nTm9kZSdzIGNoaWxkcmVuLiBXZSBuZWVkIHRvIHJlc3BlY3QgdGhpcyBvcmRlclxyXG4gIHB1YmxpYyBnZXRWaXNpYmxlQWxpZ25Cb3hlcygpOiBBbGlnbkJveFtdIHtcclxuICAgIHJldHVybiBfLnNvcnRCeSggdGhpcy5hbGlnbkJveGVzLmZpbHRlciggYWxpZ25Cb3ggPT4gYWxpZ25Cb3gudmlzaWJsZSApLCBhbGlnbkJveCA9PiB0aGlzLnNjcm9sbGluZ05vZGUuY2hpbGRyZW4uaW5kZXhPZiggYWxpZ25Cb3ggKSApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFdoZW4gbW92ZUNoaWxkVG9JbmRleCBpcyBjYWxsZWQsIHNjcm9sbHMgdGhlIENhcm91c2VsIHRvIHRoYXQgaXRlbS4gRm9yIHVzZSBpbiBQaEVULWlPIHdoZW4gdGhlIG9yZGVyIG9mIGl0ZW1zIGlzXHJcbiAqIGNoYW5nZWQuXHJcbiAqL1xyXG5jbGFzcyBTY3JvbGxpbmdGbG93Qm94IGV4dGVuZHMgRmxvd0JveCBpbXBsZW1lbnRzIEluZGV4ZWROb2RlSU9QYXJlbnQge1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgY2Fyb3VzZWw6IENhcm91c2VsO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGNhcm91c2VsOiBDYXJvdXNlbCwgb3B0aW9ucz86IEZsb3dCb3hPcHRpb25zICkge1xyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICAgIHRoaXMuY2Fyb3VzZWwgPSBjYXJvdXNlbDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvbkluZGV4ZWROb2RlSU9DaGlsZE1vdmVkKCBjaGlsZDogTm9kZSApOiB2b2lkIHtcclxuICAgIHRoaXMuY2Fyb3VzZWwuc2Nyb2xsVG9BbGlnbkJveCggY2hpbGQgYXMgQWxpZ25Cb3ggKTtcclxuICB9XHJcbn1cclxuXHJcblxyXG5jbGFzcyBDYXJvdXNlbENvbnN0cmFpbnQgZXh0ZW5kcyBMYXlvdXRDb25zdHJhaW50IHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNhcm91c2VsOiBDYXJvdXNlbCxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgYmFja2dyb3VuZE5vZGU6IFJlY3RhbmdsZSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgZm9yZWdyb3VuZE5vZGU6IFJlY3RhbmdsZSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgd2luZG93Tm9kZTogTm9kZSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgcHJldmlvdXNCdXR0b246IEJ1dHRvbk5vZGUsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IG5leHRCdXR0b246IEJ1dHRvbk5vZGUsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNjcm9sbGluZ05vZGVDb250YWluZXI6IE5vZGUsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGFsaWduQm94ZXM6IE5vZGVbXSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgb3JpZW50YXRpb246IE9yaWVudGF0aW9uLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBzY3JvbGxpbmdOb2RlOiBGbG93Qm94LFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBpdGVtc1BlclBhZ2U6IG51bWJlcixcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgbWFyZ2luOiBudW1iZXIsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGFsaWduR3JvdXA6IEFsaWduR3JvdXAsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNlcGFyYXRvckxheWVyOiBOb2RlIHwgbnVsbCxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgc2VwYXJhdG9yT3B0aW9uczogU2VwYXJhdG9yT3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCBjYXJvdXNlbCApO1xyXG5cclxuICAgIC8vIEhvb2sgdXAgdG8gbGlzdGVuIHRvIHRoZXNlIG5vZGVzICh3aWxsIGJlIGhhbmRsZWQgYnkgTGF5b3V0Q29uc3RyYWludCBkaXNwb3NhbClcclxuICAgIFsgdGhpcy5iYWNrZ3JvdW5kTm9kZSxcclxuICAgICAgdGhpcy5mb3JlZ3JvdW5kTm9kZSxcclxuICAgICAgdGhpcy53aW5kb3dOb2RlLFxyXG4gICAgICB0aGlzLnByZXZpb3VzQnV0dG9uLFxyXG4gICAgICB0aGlzLm5leHRCdXR0b24sXHJcbiAgICAgIHRoaXMuc2Nyb2xsaW5nTm9kZUNvbnRhaW5lcixcclxuICAgICAgLi4udGhpcy5hbGlnbkJveGVzIF0uZm9yRWFjaCggbm9kZSA9PiB0aGlzLmFkZE5vZGUoIG5vZGUsIGZhbHNlICkgKTtcclxuXHJcbiAgICAvLyBXaGVuZXZlciBsYXlvdXQgaGFwcGVucyBpbiB0aGUgc2Nyb2xsaW5nIG5vZGUsIGl0J3MgdGhlIHBlcmZlY3QgdGltZSB0byB1cGRhdGUgdGhlIHNlcGFyYXRvcnNcclxuICAgIGlmICggdGhpcy5zZXBhcmF0b3JMYXllciApIHtcclxuXHJcbiAgICAgIC8vIFdlIGRvIG5vdCBuZWVkIHRvIHJlbW92ZSB0aGlzIGxpc3RlbmVyIGJlY2F1c2UgaXQgaXMgaW50ZXJuYWwgdG8gQ2Fyb3VzZWwgYW5kIHdpbGwgZ2V0IGdhcmJhZ2UgY29sbGVjdGVkXHJcbiAgICAgIC8vIHdoZW4gQ2Fyb3VzZWwgaXMgZGlzcG9zZWQuXHJcbiAgICAgIHRoaXMuc2Nyb2xsaW5nTm9kZS5jb25zdHJhaW50LmZpbmlzaGVkTGF5b3V0RW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgIHRoaXMudXBkYXRlU2VwYXJhdG9ycygpO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51cGRhdGVMYXlvdXQoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdXBkYXRlU2VwYXJhdG9ycygpOiB2b2lkIHtcclxuICAgIGNvbnN0IHZpc2libGVDaGlsZHJlbiA9IHRoaXMuY2Fyb3VzZWwuZ2V0VmlzaWJsZUFsaWduQm94ZXMoKTtcclxuXHJcbiAgICAvLyBBZGQgc2VwYXJhdG9ycyBiZXR3ZWVuIHRoZSB2aXNpYmxlIGNoaWxkcmVuXHJcbiAgICBjb25zdCByYW5nZSA9IHZpc2libGVDaGlsZHJlbi5sZW5ndGggPj0gMiA/IF8ucmFuZ2UoIDEsIHZpc2libGVDaGlsZHJlbi5sZW5ndGggKSA6IFtdO1xyXG4gICAgdGhpcy5zZXBhcmF0b3JMYXllciEuY2hpbGRyZW4gPSByYW5nZS5tYXAoIGluZGV4ID0+IHtcclxuXHJcbiAgICAgIC8vIEZpbmQgdGhlIGxvY2F0aW9uIGJldHdlZW4gYWRqYWNlbnQgbm9kZXNcclxuICAgICAgY29uc3QgaW5iZXR3ZWVuID0gKCB2aXNpYmxlQ2hpbGRyZW5bIGluZGV4IC0gMSBdWyB0aGlzLm9yaWVudGF0aW9uLm1heFNpZGUgXSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZUNoaWxkcmVuWyBpbmRleCBdWyB0aGlzLm9yaWVudGF0aW9uLm1pblNpZGUgXSApIC8gMjtcclxuXHJcbiAgICAgIHJldHVybiBuZXcgU2VwYXJhdG9yKCBjb21iaW5lT3B0aW9uczxTZXBhcmF0b3JPcHRpb25zPigge1xyXG4gICAgICAgIFsgYCR7dGhpcy5vcmllbnRhdGlvbi5jb29yZGluYXRlfTFgIF06IGluYmV0d2VlbixcclxuICAgICAgICBbIGAke3RoaXMub3JpZW50YXRpb24uY29vcmRpbmF0ZX0yYCBdOiBpbmJldHdlZW4sXHJcbiAgICAgICAgWyBgJHt0aGlzLm9yaWVudGF0aW9uLm9wcG9zaXRlLmNvb3JkaW5hdGV9MmAgXTogdGhpcy5zY3JvbGxpbmdOb2RlWyB0aGlzLm9yaWVudGF0aW9uLm9wcG9zaXRlLnNpemUgXVxyXG4gICAgICB9LCB0aGlzLnNlcGFyYXRvck9wdGlvbnMgKSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLy8gUmV0dXJucyB0aGUgY2xpcCBhcmVhIGRpbWVuc2lvbiBmb3Igb3VyIENhcm91c2VsIGJhc2VkIG9mZiBvZiBob3cgbWFueSBpdGVtcyB3ZSB3YW50IHRvIHNlZSBwZXIgQ2Fyb3VzZWwgcGFnZS5cclxuICBwcml2YXRlIGNvbXB1dGVDbGlwQXJlYSgpOiBEaW1lbnNpb24yIHtcclxuICAgIGNvbnN0IG9yaWVudGF0aW9uID0gdGhpcy5vcmllbnRhdGlvbjtcclxuXHJcbiAgICBjb25zdCB2aXNpYmxlQWxpZ25Cb3hlcyA9IHRoaXMuY2Fyb3VzZWwuZ2V0VmlzaWJsZUFsaWduQm94ZXMoKTtcclxuXHJcbiAgICBpZiAoIHZpc2libGVBbGlnbkJveGVzLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgcmV0dXJuIG5ldyBEaW1lbnNpb24yKCAwLCAwICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIFRoaXMgZG9lc24ndCBmaWxsIG9uZSBwYWdlIGluIG51bWJlciBwbGF5IHByZWZlcmVuY2VzIGRpYWxvZyB3aGVuIHlvdSBmb3JnZXQgbG9jYWxlcz0qLFxyXG4gICAgICAvLyBzbyB0YWtlIHRoZSBsYXN0IGl0ZW0sIGV2ZW4gaWYgaXQgaXMgbm90IGEgZnVsbCBwYWdlXHJcbiAgICAgIGNvbnN0IGxhc3RCb3ggPSB2aXNpYmxlQWxpZ25Cb3hlc1sgdGhpcy5pdGVtc1BlclBhZ2UgLSAxIF0gfHwgdmlzaWJsZUFsaWduQm94ZXNbIHZpc2libGVBbGlnbkJveGVzLmxlbmd0aCAtIDEgXTtcclxuXHJcbiAgICAgIGNvbnN0IGhvcml6b250YWxTaXplID0gbmV3IERpbWVuc2lvbjIoXHJcbiAgICAgICAgLy8gTWVhc3VyZSBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGZpcnN0IGl0ZW0gdG8gdGhlIGVuZCBvZiB0aGUgbGFzdCBpdGVtIG9uIHRoZSAxc3QgcGFnZVxyXG4gICAgICAgIGxhc3RCb3hbIG9yaWVudGF0aW9uLm1heFNpZGUgXSAtIHZpc2libGVBbGlnbkJveGVzWyAwIF1bIG9yaWVudGF0aW9uLm1pblNpZGUgXSArICggMiAqIHRoaXMubWFyZ2luICksXHJcblxyXG4gICAgICAgIHRoaXMuc2Nyb2xsaW5nTm9kZUNvbnRhaW5lci5ib3VuZHNQcm9wZXJ0eS52YWx1ZVsgb3JpZW50YXRpb24ub3Bwb3NpdGUuc2l6ZSBdXHJcbiAgICAgICk7XHJcbiAgICAgIHJldHVybiB0aGlzLm9yaWVudGF0aW9uID09PSBPcmllbnRhdGlvbi5IT1JJWk9OVEFMID8gaG9yaXpvbnRhbFNpemUgOiBob3Jpem9udGFsU2l6ZS5zd2FwcGVkKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldEJhY2tncm91bmREaW1lbnNpb24oKTogRGltZW5zaW9uMiB7XHJcbiAgICBsZXQgYmFja2dyb3VuZFdpZHRoO1xyXG4gICAgbGV0IGJhY2tncm91bmRIZWlnaHQ7XHJcbiAgICBpZiAoIHRoaXMub3JpZW50YXRpb24gPT09IE9yaWVudGF0aW9uLkhPUklaT05UQUwgKSB7XHJcblxyXG4gICAgICAvLyBGb3IgaG9yaXpvbnRhbCBvcmllbnRhdGlvbiwgYnV0dG9ucyBjb250cmlidXRlIHRvIHdpZHRoLCBpZiB0aGV5IGFyZSB2aXNpYmxlLlxyXG4gICAgICBjb25zdCBuZXh0QnV0dG9uV2lkdGggPSB0aGlzLm5leHRCdXR0b24udmlzaWJsZSA/IHRoaXMubmV4dEJ1dHRvbi53aWR0aCA6IDA7XHJcbiAgICAgIGNvbnN0IHByZXZpb3VzQnV0dG9uV2lkdGggPSB0aGlzLnByZXZpb3VzQnV0dG9uLnZpc2libGUgPyB0aGlzLnByZXZpb3VzQnV0dG9uLndpZHRoIDogMDtcclxuICAgICAgYmFja2dyb3VuZFdpZHRoID0gdGhpcy53aW5kb3dOb2RlLndpZHRoICsgbmV4dEJ1dHRvbldpZHRoICsgcHJldmlvdXNCdXR0b25XaWR0aDtcclxuICAgICAgYmFja2dyb3VuZEhlaWdodCA9IHRoaXMud2luZG93Tm9kZS5oZWlnaHQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIEZvciB2ZXJ0aWNhbCBvcmllbnRhdGlvbiwgYnV0dG9ucyBjb250cmlidXRlIHRvIGhlaWdodCwgaWYgdGhleSBhcmUgdmlzaWJsZS5cclxuICAgICAgY29uc3QgbmV4dEJ1dHRvbkhlaWdodCA9IHRoaXMubmV4dEJ1dHRvbi52aXNpYmxlID8gdGhpcy5uZXh0QnV0dG9uLmhlaWdodCA6IDA7XHJcbiAgICAgIGNvbnN0IHByZXZpb3VzQnV0dG9uSGVpZ2h0ID0gdGhpcy5wcmV2aW91c0J1dHRvbi52aXNpYmxlID8gdGhpcy5wcmV2aW91c0J1dHRvbi5oZWlnaHQgOiAwO1xyXG4gICAgICBiYWNrZ3JvdW5kV2lkdGggPSB0aGlzLndpbmRvd05vZGUud2lkdGg7XHJcbiAgICAgIGJhY2tncm91bmRIZWlnaHQgPSB0aGlzLndpbmRvd05vZGUuaGVpZ2h0ICsgbmV4dEJ1dHRvbkhlaWdodCArIHByZXZpb3VzQnV0dG9uSGVpZ2h0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBEaW1lbnNpb24yKCBiYWNrZ3JvdW5kV2lkdGgsIGJhY2tncm91bmRIZWlnaHQgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBsYXlvdXQoKTogdm9pZCB7XHJcbiAgICBzdXBlci5sYXlvdXQoKTtcclxuXHJcbiAgICBjb25zdCBvcmllbnRhdGlvbiA9IHRoaXMub3JpZW50YXRpb247XHJcblxyXG4gICAgLy8gUmVzaXplIG5leHQvcHJldmlvdXMgYnV0dG9ucyBkeW5hbWljYWxseVxyXG4gICAgY29uc3QgbWF4T3Bwb3NpdGVTaXplID0gdGhpcy5hbGlnbkdyb3VwLmdldE1heFNpemVQcm9wZXJ0eSggb3JpZW50YXRpb24ub3Bwb3NpdGUgKS52YWx1ZTtcclxuICAgIGNvbnN0IGJ1dHRvbk9wcG9zaXRlU2l6ZSA9IG1heE9wcG9zaXRlU2l6ZSArICggMiAqIHRoaXMubWFyZ2luICk7XHJcbiAgICB0aGlzLm5leHRCdXR0b25bIG9yaWVudGF0aW9uLm9wcG9zaXRlLnByZWZlcnJlZFNpemUgXSA9IGJ1dHRvbk9wcG9zaXRlU2l6ZTtcclxuICAgIHRoaXMucHJldmlvdXNCdXR0b25bIG9yaWVudGF0aW9uLm9wcG9zaXRlLnByZWZlcnJlZFNpemUgXSA9IGJ1dHRvbk9wcG9zaXRlU2l6ZTtcclxuXHJcbiAgICB0aGlzLm5leHRCdXR0b25bIG9yaWVudGF0aW9uLm9wcG9zaXRlLmNlbnRlckNvb3JkaW5hdGUgXSA9IHRoaXMuYmFja2dyb3VuZE5vZGVbIG9yaWVudGF0aW9uLm9wcG9zaXRlLmNlbnRlckNvb3JkaW5hdGUgXTtcclxuICAgIHRoaXMucHJldmlvdXNCdXR0b25bIG9yaWVudGF0aW9uLm9wcG9zaXRlLmNlbnRlckNvb3JkaW5hdGUgXSA9IHRoaXMuYmFja2dyb3VuZE5vZGVbIG9yaWVudGF0aW9uLm9wcG9zaXRlLmNlbnRlckNvb3JkaW5hdGUgXTtcclxuICAgIHRoaXMud2luZG93Tm9kZVsgb3JpZW50YXRpb24ub3Bwb3NpdGUuY2VudGVyQ29vcmRpbmF0ZSBdID0gdGhpcy5iYWNrZ3JvdW5kTm9kZVsgb3JpZW50YXRpb24ub3Bwb3NpdGUuY2VudGVyQ29vcmRpbmF0ZSBdO1xyXG4gICAgdGhpcy5wcmV2aW91c0J1dHRvblsgb3JpZW50YXRpb24ubWluU2lkZSBdID0gdGhpcy5iYWNrZ3JvdW5kTm9kZVsgb3JpZW50YXRpb24ubWluU2lkZSBdO1xyXG4gICAgdGhpcy5uZXh0QnV0dG9uWyBvcmllbnRhdGlvbi5tYXhTaWRlIF0gPSB0aGlzLmJhY2tncm91bmROb2RlWyBvcmllbnRhdGlvbi5tYXhTaWRlIF07XHJcbiAgICB0aGlzLndpbmRvd05vZGVbIG9yaWVudGF0aW9uLmNlbnRlckNvb3JkaW5hdGUgXSA9IHRoaXMuYmFja2dyb3VuZE5vZGVbIG9yaWVudGF0aW9uLmNlbnRlckNvb3JkaW5hdGUgXTtcclxuXHJcbiAgICBjb25zdCBjbGlwQm91bmRzID0gdGhpcy5jb21wdXRlQ2xpcEFyZWEoKS50b0JvdW5kcygpO1xyXG4gICAgdGhpcy53aW5kb3dOb2RlLmNsaXBBcmVhID0gU2hhcGUuYm91bmRzKCBjbGlwQm91bmRzICk7XHJcblxyXG4gICAgLy8gU3BlY2lmeSB0aGUgbG9jYWwgYm91bmRzIGluIG9yZGVyIHRvIGVuc3VyZSBjZW50ZXJpbmcuIEZvciBmdWxsIHBhZ2VzLCB0aGlzIGlzIG5vdCBuZWNlc3Nhcnkgc2luY2UgdGhlIHNjcm9sbGluZ05vZGVDb250YWluZXJcclxuICAgIC8vIGFscmVhZHkgc3BhbnMgdGhlIGZ1bGwgYXJlYS4gQnV0IGZvciBhIHBhcnRpYWwgcGFnZSwgdGhpcyBpcyBuZWNlc3Nhcnkgc28gdGhlIHdpbmRvdyB3aWxsIGJlIGNlbnRlcmVkLlxyXG4gICAgdGhpcy53aW5kb3dOb2RlLmxvY2FsQm91bmRzID0gY2xpcEJvdW5kcztcclxuXHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kRGltZW5zaW9uID0gdGhpcy5nZXRCYWNrZ3JvdW5kRGltZW5zaW9uKCk7XHJcblxyXG4gICAgdGhpcy5jYXJvdXNlbC5iYWNrZ3JvdW5kV2lkdGggPSBiYWNrZ3JvdW5kRGltZW5zaW9uLndpZHRoO1xyXG4gICAgdGhpcy5jYXJvdXNlbC5iYWNrZ3JvdW5kSGVpZ2h0ID0gYmFja2dyb3VuZERpbWVuc2lvbi5oZWlnaHQ7XHJcblxyXG4gICAgY29uc3QgYmFja2dyb3VuZEJvdW5kcyA9IGJhY2tncm91bmREaW1lbnNpb24udG9Cb3VuZHMoKTtcclxuICAgIHRoaXMuYmFja2dyb3VuZE5vZGUucmVjdEJvdW5kcyA9IGJhY2tncm91bmRCb3VuZHM7XHJcbiAgICB0aGlzLmZvcmVncm91bmROb2RlLnJlY3RCb3VuZHMgPSBiYWNrZ3JvdW5kQm91bmRzO1xyXG5cclxuICAgIC8vIE9ubHkgdXBkYXRlIHNlcGFyYXRvcnMgaWYgdGhleSBhcmUgdmlzaWJsZVxyXG4gICAgdGhpcy5zZXBhcmF0b3JMYXllciAmJiB0aGlzLnVwZGF0ZVNlcGFyYXRvcnMoKTtcclxuICB9XHJcbn1cclxuXHJcbnN1bi5yZWdpc3RlciggJ0Nhcm91c2VsJywgQ2Fyb3VzZWwgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0saUNBQWlDO0FBRzVELE9BQU9DLFNBQVMsTUFBTSw0QkFBNEI7QUFDbEQsT0FBT0MsVUFBVSxNQUFNLDRCQUE0QjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0s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