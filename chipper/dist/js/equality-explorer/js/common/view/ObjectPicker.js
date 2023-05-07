// Copyright 2017-2023, University of Colorado Boulder

/**
 * User-interface component for picking one of several values. The values are arbitrary Objects.
 *
 * NOTE: A long time ago in a galaxy far, far away, ObjectPicker was mostly copied from NumberPicker. While not
 * totally in-sync, their implementations remained similar for quite a while (not exactly light years, but hey, this
 * is software). But alas dear reader, by the time that you discover this prose, ObjectPicker and NumberPicker will
 * have undoubtedly diverged so much that it will be a real headache to unify them. To that, I have 2 words to offer:
 * 'priorities' and 'sorry'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import { Color, FireListener, LinearGradient, Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import equalityExplorer from '../../equalityExplorer.js';
const ButtonStateValues = ['up', 'down', 'over', 'out'];
export default class ObjectPicker extends Node {
  /**
   * @param valueProperty - value of the current item that is displayed
   * @param items - the set of items that you can select from
   * @param [providedOptions]
   */
  constructor(valueProperty, items, providedOptions) {
    const options = optionize()({
      // SelfOptions
      wrapEnabled: false,
      cursor: 'pointer',
      backgroundColor: 'white',
      arrowsColor: 'blue',
      arrowsPressedColor: null,
      gradientColor: null,
      gradientPressedColor: null,
      cornerRadius: 6,
      xMargin: 3,
      yMargin: 3,
      timerDelay: 400,
      timerInterval: 100,
      touchAreaXDilation: 10,
      touchAreaYDilation: 10,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 5,
      backgroundStroke: 'gray',
      backgroundLineWidth: 0.5,
      arrowHeight: 6,
      arrowYSpacing: 3,
      arrowStroke: 'black',
      arrowLineWidth: 0.25,
      incrementFunction: index => index + 1,
      decrementFunction: index => index - 1,
      incrementEnabledProperty: null,
      decrementEnabledProperty: null
    }, providedOptions);
    options.arrowsPressedColor = options.arrowsPressedColor || Color.toColor(options.arrowsColor).darkerColor();
    options.gradientColor = options.gradientColor || options.arrowsColor;
    options.gradientPressedColor = options.gradientPressedColor || Color.toColor(options.gradientColor).darkerColor();
    super();

    //------------------------------------------------------------
    // Nodes

    // maximum dimensions of item Nodes
    assert && assert(items.length > 0);
    const maxWidth = _.maxBy(items, item => item.node.width).node.width;
    const maxHeight = _.maxBy(items, item => item.node.height).node.height;

    // compute shape of the background behind the value
    const backgroundWidth = maxWidth + 2 * options.xMargin;
    const backgroundHeight = maxHeight + 2 * options.yMargin;
    const backgroundOverlap = 1;
    const backgroundCornerRadius = options.cornerRadius;

    // parent for value, to maintain rendering order and simplify centering
    const valueParentNode = new Rectangle(0, 0, backgroundWidth, backgroundHeight, {
      pickable: false
    });

    // Top half of the background. Pressing here will increment the value.
    // Shape computed starting at upper-left, going clockwise.
    const incrementBackgroundNode = new Path(new Shape().arc(backgroundCornerRadius, backgroundCornerRadius, backgroundCornerRadius, Math.PI, Math.PI * 3 / 2, false).arc(backgroundWidth - backgroundCornerRadius, backgroundCornerRadius, backgroundCornerRadius, -Math.PI / 2, 0, false).lineTo(backgroundWidth, backgroundHeight / 2 + backgroundOverlap).lineTo(0, backgroundHeight / 2 + backgroundOverlap).close(), {
      pickable: false
    });

    // Bottom half of the background. Pressing here will decrement the value.
    // Shape computed starting at bottom-right, going clockwise.
    const decrementBackgroundNode = new Path(new Shape().arc(backgroundWidth - backgroundCornerRadius, backgroundHeight - backgroundCornerRadius, backgroundCornerRadius, 0, Math.PI / 2, false).arc(backgroundCornerRadius, backgroundHeight - backgroundCornerRadius, backgroundCornerRadius, Math.PI / 2, Math.PI, false).lineTo(0, backgroundHeight / 2).lineTo(backgroundWidth, backgroundHeight / 2).close(), {
      pickable: false
    });

    // separate rectangle for stroke around value background
    const strokedBackground = new Rectangle(0, 0, backgroundWidth, backgroundHeight, backgroundCornerRadius, backgroundCornerRadius, {
      pickable: false,
      stroke: options.backgroundStroke,
      lineWidth: options.backgroundLineWidth
    });

    // compute size of arrows
    const arrowButtonSize = new Dimension2(0.5 * backgroundWidth, options.arrowHeight);

    // options shared by both arrows
    const arrowOptions = {
      stroke: options.arrowStroke,
      lineWidth: options.arrowLineWidth,
      pickable: false
    };

    // increment arrow, pointing up, described clockwise from tip
    const incrementArrow = new Path(new Shape().moveTo(arrowButtonSize.width / 2, 0).lineTo(arrowButtonSize.width, arrowButtonSize.height).lineTo(0, arrowButtonSize.height).close(), combineOptions({}, arrowOptions, {
      centerX: incrementBackgroundNode.centerX,
      bottom: incrementBackgroundNode.top - options.arrowYSpacing
    }));

    // decrement arrow, pointing down, described clockwise from the tip
    const decrementArrow = new Path(new Shape().moveTo(arrowButtonSize.width / 2, arrowButtonSize.height).lineTo(0, 0).lineTo(arrowButtonSize.width, 0).close(), combineOptions({}, arrowOptions, {
      centerX: decrementBackgroundNode.centerX,
      top: decrementBackgroundNode.bottom + options.arrowYSpacing
    }));

    // parents for increment and decrement components
    const incrementParent = new Node({
      children: [incrementBackgroundNode, incrementArrow]
    });
    incrementParent.addChild(new Rectangle(incrementParent.localBounds)); // invisible overlay
    const decrementParent = new Node({
      children: [decrementBackgroundNode, decrementArrow]
    });
    decrementParent.addChild(new Rectangle(decrementParent.localBounds)); // invisible overlay

    // rendering order
    this.addChild(incrementParent);
    this.addChild(decrementParent);
    this.addChild(strokedBackground);
    this.addChild(valueParentNode);

    //------------------------------------------------------------
    // Pointer areas

    // touch areas
    incrementParent.touchArea = Shape.rectangle(incrementParent.left - options.touchAreaXDilation / 2, incrementParent.top - options.touchAreaYDilation, incrementParent.width + options.touchAreaXDilation, incrementParent.height + options.touchAreaYDilation);
    decrementParent.touchArea = Shape.rectangle(decrementParent.left - options.touchAreaXDilation / 2, decrementParent.top, decrementParent.width + options.touchAreaXDilation, decrementParent.height + options.touchAreaYDilation);

    // mouse areas
    incrementParent.mouseArea = Shape.rectangle(incrementParent.left - options.mouseAreaXDilation / 2, incrementParent.top - options.mouseAreaYDilation, incrementParent.width + options.mouseAreaXDilation, incrementParent.height + options.mouseAreaYDilation);
    decrementParent.mouseArea = Shape.rectangle(decrementParent.left - options.mouseAreaXDilation / 2, decrementParent.top, decrementParent.width + options.mouseAreaXDilation, decrementParent.height + options.mouseAreaYDilation);

    //------------------------------------------------------------
    // Colors

    // arrow colors, corresponding to ButtonState and incrementEnabledProperty/decrementEnabledProperty
    const arrowColors = {
      up: options.arrowsColor,
      over: options.arrowsColor,
      down: options.arrowsPressedColor,
      out: options.arrowsColor,
      disabled: 'rgb( 176,176,176 )'
    };

    // background colors, corresponding to ButtonState and enabledProperty.value
    const highlightGradient = createVerticalGradient(options.gradientColor, options.backgroundColor, options.gradientColor, backgroundHeight);
    const pressedGradient = createVerticalGradient(options.gradientPressedColor, options.backgroundColor, options.gradientPressedColor, backgroundHeight);
    const backgroundColors = {
      up: options.backgroundColor,
      over: highlightGradient,
      down: pressedGradient,
      out: pressedGradient,
      disabled: options.backgroundColor
    };

    //------------------------------------------------------------
    // Properties

    // index of the item that's currently selected
    const indexProperty = new NumberProperty(indexOfItemWithValue(items, valueProperty.value), {
      numberType: 'Integer',
      range: new Range(0, items.length - 1)
    });
    const incrementButtonStateProperty = new StringUnionProperty('up', {
      validValues: ButtonStateValues
    });
    const decrementButtonStateProperty = new StringUnionProperty('down', {
      validValues: ButtonStateValues
    });

    // enables the increment button
    const incrementEnabledProperty = options.incrementEnabledProperty || new DerivedProperty([indexProperty], index => options.wrapEnabled || index < items.length - 1);

    // enables the decrement button
    const decrementEnabledProperty = options.decrementEnabledProperty || new DerivedProperty([indexProperty], index => options.wrapEnabled || index > 0);

    //------------------------------------------------------------
    // Observers and InputListeners

    const inputListenerOptions = {
      fireOnHold: true,
      fireOnHoldDelay: options.timerDelay,
      fireOnHoldInterval: options.timerInterval
    };
    const incrementInputListener = new ObjectPickerInputListener(incrementButtonStateProperty, combineOptions({}, inputListenerOptions, {
      fire: () => {
        if (incrementInputListener.enabled) {
          let index = options.incrementFunction(indexProperty.value);
          if (options.wrapEnabled && index >= items.length) {
            index = options.incrementFunction(-1);
          }
          indexProperty.value = index;
        }
      },
      tandem: options.tandem.createTandem('incrementInputListener')
    }));
    incrementParent.addInputListener(incrementInputListener);
    const decrementInputListener = new ObjectPickerInputListener(decrementButtonStateProperty, combineOptions({}, inputListenerOptions, {
      fire: () => {
        if (decrementInputListener.enabled) {
          let index = options.decrementFunction(indexProperty.value);
          if (options.wrapEnabled && index < 0) {
            index = options.decrementFunction(items.length);
          }
          indexProperty.value = index;
        }
      },
      tandem: options.tandem.createTandem('decrementInputListener')
    }));
    decrementParent.addInputListener(decrementInputListener);

    // enable/disable, unlink required
    const incrementEnabledListener = enabled => {
      incrementInputListener.enabled = enabled;
    };
    const decrementEnabledListener = enabled => {
      decrementInputListener.enabled = enabled;
    };
    incrementEnabledProperty.link(incrementEnabledListener);
    decrementEnabledProperty.link(decrementEnabledListener);

    // Update displayed Node and index to match the current value
    const valueObserver = value => {
      valueParentNode.removeAllChildren();

      // show the node associated with the value
      const index = indexOfItemWithValue(items, value);
      const valueNode = items[index].node;
      valueParentNode.addChild(valueNode);
      valueNode.centerX = backgroundWidth / 2;
      valueNode.centerY = backgroundHeight / 2;

      // synchronize the index
      indexProperty.value = index;
    };
    valueProperty.link(valueObserver); // unlink required in dispose

    // unlink not required
    indexProperty.link(index => {
      valueProperty.value = items[index].value;
    });

    // update colors for increment components
    Multilink.multilink([incrementButtonStateProperty, incrementEnabledProperty], (buttonState, enabled) => {
      updateColors(buttonState, enabled, incrementBackgroundNode, incrementArrow, backgroundColors, arrowColors);
    });

    // update colors for decrement components
    Multilink.multilink([decrementButtonStateProperty, decrementEnabledProperty], (buttonState, enabled) => {
      updateColors(buttonState, enabled, decrementBackgroundNode, decrementArrow, backgroundColors, arrowColors);
    });
    this.mutate(options);
    this.disposeObjectPicker = () => {
      if (valueProperty.hasListener(valueObserver)) {
        valueProperty.unlink(valueObserver);
      }
      if (incrementEnabledProperty.hasListener(incrementEnabledListener)) {
        incrementEnabledProperty.unlink(incrementEnabledListener);
      }
      if (decrementEnabledProperty.hasListener(decrementEnabledListener)) {
        decrementEnabledProperty.unlink(decrementEnabledListener);
      }
    };
  }
  dispose() {
    this.disposeObjectPicker();
    super.dispose();
  }
}

/**
 * Converts FireListener events to ButtonState changes.
 */

class ObjectPickerInputListener extends FireListener {
  constructor(buttonStateProperty, options) {
    super(options);
    Multilink.multilink([this.isOverProperty, this.isPressedProperty], (isOver, isPressed) => {
      buttonStateProperty.set(isOver && !isPressed ? 'over' : isOver && isPressed ? 'down' : !isOver && !isPressed ? 'up' : 'out');
    });
    this.enabled = true;
  }
}

/**
 * Gets the index of the item that has a specified value.
 */
function indexOfItemWithValue(items, value) {
  let index = -1;
  for (let i = 0; i < items.length; i++) {
    if (items[i].value === value) {
      index = i;
      break;
    }
  }
  assert && assert(index !== -1, `invalid value: ${index}`);
  return index;
}

/**
 * Creates a vertical gradient.
 */
function createVerticalGradient(topColor, centerColor, bottomColor, height) {
  return new LinearGradient(0, 0, 0, height).addColorStop(0, topColor).addColorStop(0.5, centerColor).addColorStop(1, bottomColor);
}

/**
 * Updates arrow and background colors
 */
function updateColors(buttonState, enabled, background, arrow, backgroundColors, arrowColors) {
  if (enabled) {
    arrow.stroke = 'black';
    if (buttonState === 'up') {
      background.fill = backgroundColors.up;
      arrow.fill = arrowColors.up;
    } else if (buttonState === 'over') {
      background.fill = backgroundColors.over;
      arrow.fill = arrowColors.over;
    } else if (buttonState === 'down') {
      background.fill = backgroundColors.down;
      arrow.fill = arrowColors.down;
    } else if (buttonState === 'out') {
      background.fill = backgroundColors.out;
      arrow.fill = arrowColors.out;
    } else {
      throw new Error(`unsupported buttonState: ${buttonState}`);
    }
  } else {
    background.fill = backgroundColors.disabled;
    arrow.fill = arrowColors.disabled;
    arrow.stroke = arrowColors.disabled; // stroke so that arrow size will look the same when it's enabled/disabled
  }
}

equalityExplorer.register('ObjectPicker', ObjectPicker);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlN0cmluZ1VuaW9uUHJvcGVydHkiLCJEaW1lbnNpb24yIiwiUmFuZ2UiLCJTaGFwZSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiQ29sb3IiLCJGaXJlTGlzdGVuZXIiLCJMaW5lYXJHcmFkaWVudCIsIk5vZGUiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiZXF1YWxpdHlFeHBsb3JlciIsIkJ1dHRvblN0YXRlVmFsdWVzIiwiT2JqZWN0UGlja2VyIiwiY29uc3RydWN0b3IiLCJ2YWx1ZVByb3BlcnR5IiwiaXRlbXMiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwid3JhcEVuYWJsZWQiLCJjdXJzb3IiLCJiYWNrZ3JvdW5kQ29sb3IiLCJhcnJvd3NDb2xvciIsImFycm93c1ByZXNzZWRDb2xvciIsImdyYWRpZW50Q29sb3IiLCJncmFkaWVudFByZXNzZWRDb2xvciIsImNvcm5lclJhZGl1cyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwidGltZXJEZWxheSIsInRpbWVySW50ZXJ2YWwiLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJtb3VzZUFyZWFYRGlsYXRpb24iLCJtb3VzZUFyZWFZRGlsYXRpb24iLCJiYWNrZ3JvdW5kU3Ryb2tlIiwiYmFja2dyb3VuZExpbmVXaWR0aCIsImFycm93SGVpZ2h0IiwiYXJyb3dZU3BhY2luZyIsImFycm93U3Ryb2tlIiwiYXJyb3dMaW5lV2lkdGgiLCJpbmNyZW1lbnRGdW5jdGlvbiIsImluZGV4IiwiZGVjcmVtZW50RnVuY3Rpb24iLCJpbmNyZW1lbnRFbmFibGVkUHJvcGVydHkiLCJkZWNyZW1lbnRFbmFibGVkUHJvcGVydHkiLCJ0b0NvbG9yIiwiZGFya2VyQ29sb3IiLCJhc3NlcnQiLCJsZW5ndGgiLCJtYXhXaWR0aCIsIl8iLCJtYXhCeSIsIml0ZW0iLCJub2RlIiwid2lkdGgiLCJtYXhIZWlnaHQiLCJoZWlnaHQiLCJiYWNrZ3JvdW5kV2lkdGgiLCJiYWNrZ3JvdW5kSGVpZ2h0IiwiYmFja2dyb3VuZE92ZXJsYXAiLCJiYWNrZ3JvdW5kQ29ybmVyUmFkaXVzIiwidmFsdWVQYXJlbnROb2RlIiwicGlja2FibGUiLCJpbmNyZW1lbnRCYWNrZ3JvdW5kTm9kZSIsImFyYyIsIk1hdGgiLCJQSSIsImxpbmVUbyIsImNsb3NlIiwiZGVjcmVtZW50QmFja2dyb3VuZE5vZGUiLCJzdHJva2VkQmFja2dyb3VuZCIsInN0cm9rZSIsImxpbmVXaWR0aCIsImFycm93QnV0dG9uU2l6ZSIsImFycm93T3B0aW9ucyIsImluY3JlbWVudEFycm93IiwibW92ZVRvIiwiY2VudGVyWCIsImJvdHRvbSIsInRvcCIsImRlY3JlbWVudEFycm93IiwiaW5jcmVtZW50UGFyZW50IiwiY2hpbGRyZW4iLCJhZGRDaGlsZCIsImxvY2FsQm91bmRzIiwiZGVjcmVtZW50UGFyZW50IiwidG91Y2hBcmVhIiwicmVjdGFuZ2xlIiwibGVmdCIsIm1vdXNlQXJlYSIsImFycm93Q29sb3JzIiwidXAiLCJvdmVyIiwiZG93biIsIm91dCIsImRpc2FibGVkIiwiaGlnaGxpZ2h0R3JhZGllbnQiLCJjcmVhdGVWZXJ0aWNhbEdyYWRpZW50IiwicHJlc3NlZEdyYWRpZW50IiwiYmFja2dyb3VuZENvbG9ycyIsImluZGV4UHJvcGVydHkiLCJpbmRleE9mSXRlbVdpdGhWYWx1ZSIsInZhbHVlIiwibnVtYmVyVHlwZSIsInJhbmdlIiwiaW5jcmVtZW50QnV0dG9uU3RhdGVQcm9wZXJ0eSIsInZhbGlkVmFsdWVzIiwiZGVjcmVtZW50QnV0dG9uU3RhdGVQcm9wZXJ0eSIsImlucHV0TGlzdGVuZXJPcHRpb25zIiwiZmlyZU9uSG9sZCIsImZpcmVPbkhvbGREZWxheSIsImZpcmVPbkhvbGRJbnRlcnZhbCIsImluY3JlbWVudElucHV0TGlzdGVuZXIiLCJPYmplY3RQaWNrZXJJbnB1dExpc3RlbmVyIiwiZmlyZSIsImVuYWJsZWQiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJhZGRJbnB1dExpc3RlbmVyIiwiZGVjcmVtZW50SW5wdXRMaXN0ZW5lciIsImluY3JlbWVudEVuYWJsZWRMaXN0ZW5lciIsImRlY3JlbWVudEVuYWJsZWRMaXN0ZW5lciIsImxpbmsiLCJ2YWx1ZU9ic2VydmVyIiwicmVtb3ZlQWxsQ2hpbGRyZW4iLCJ2YWx1ZU5vZGUiLCJjZW50ZXJZIiwibXVsdGlsaW5rIiwiYnV0dG9uU3RhdGUiLCJ1cGRhdGVDb2xvcnMiLCJtdXRhdGUiLCJkaXNwb3NlT2JqZWN0UGlja2VyIiwiaGFzTGlzdGVuZXIiLCJ1bmxpbmsiLCJkaXNwb3NlIiwiYnV0dG9uU3RhdGVQcm9wZXJ0eSIsImlzT3ZlclByb3BlcnR5IiwiaXNQcmVzc2VkUHJvcGVydHkiLCJpc092ZXIiLCJpc1ByZXNzZWQiLCJzZXQiLCJpIiwidG9wQ29sb3IiLCJjZW50ZXJDb2xvciIsImJvdHRvbUNvbG9yIiwiYWRkQ29sb3JTdG9wIiwiYmFja2dyb3VuZCIsImFycm93IiwiZmlsbCIsIkVycm9yIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJPYmplY3RQaWNrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVXNlci1pbnRlcmZhY2UgY29tcG9uZW50IGZvciBwaWNraW5nIG9uZSBvZiBzZXZlcmFsIHZhbHVlcy4gVGhlIHZhbHVlcyBhcmUgYXJiaXRyYXJ5IE9iamVjdHMuXHJcbiAqXHJcbiAqIE5PVEU6IEEgbG9uZyB0aW1lIGFnbyBpbiBhIGdhbGF4eSBmYXIsIGZhciBhd2F5LCBPYmplY3RQaWNrZXIgd2FzIG1vc3RseSBjb3BpZWQgZnJvbSBOdW1iZXJQaWNrZXIuIFdoaWxlIG5vdFxyXG4gKiB0b3RhbGx5IGluLXN5bmMsIHRoZWlyIGltcGxlbWVudGF0aW9ucyByZW1haW5lZCBzaW1pbGFyIGZvciBxdWl0ZSBhIHdoaWxlIChub3QgZXhhY3RseSBsaWdodCB5ZWFycywgYnV0IGhleSwgdGhpc1xyXG4gKiBpcyBzb2Z0d2FyZSkuIEJ1dCBhbGFzIGRlYXIgcmVhZGVyLCBieSB0aGUgdGltZSB0aGF0IHlvdSBkaXNjb3ZlciB0aGlzIHByb3NlLCBPYmplY3RQaWNrZXIgYW5kIE51bWJlclBpY2tlciB3aWxsXHJcbiAqIGhhdmUgdW5kb3VidGVkbHkgZGl2ZXJnZWQgc28gbXVjaCB0aGF0IGl0IHdpbGwgYmUgYSByZWFsIGhlYWRhY2hlIHRvIHVuaWZ5IHRoZW0uIFRvIHRoYXQsIEkgaGF2ZSAyIHdvcmRzIHRvIG9mZmVyOlxyXG4gKiAncHJpb3JpdGllcycgYW5kICdzb3JyeScuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBMaW5rYWJsZVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTGlua2FibGVQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFN0cmluZ1VuaW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9TdHJpbmdVbmlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBGaXJlTGlzdGVuZXIsIEZpcmVMaXN0ZW5lck9wdGlvbnMsIExpbmVhckdyYWRpZW50LCBOb2RlLCBOb2RlT3B0aW9ucywgUGF0aCwgUGF0aE9wdGlvbnMsIFJlY3RhbmdsZSwgVENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGVxdWFsaXR5RXhwbG9yZXIgZnJvbSAnLi4vLi4vZXF1YWxpdHlFeHBsb3Jlci5qcyc7XHJcblxyXG5jb25zdCBCdXR0b25TdGF0ZVZhbHVlcyA9IFsgJ3VwJywgJ2Rvd24nLCAnb3ZlcicsICdvdXQnIF0gYXMgY29uc3Q7XHJcbnR5cGUgQnV0dG9uU3RhdGUgPSAoIHR5cGVvZiBCdXR0b25TdGF0ZVZhbHVlcyApW251bWJlcl07XHJcblxyXG50eXBlIEFycm93Q29sb3JzID0ge1xyXG4gIHVwOiBUQ29sb3I7XHJcbiAgb3ZlcjogVENvbG9yO1xyXG4gIGRvd246IFRDb2xvcjtcclxuICBvdXQ6IFRDb2xvcjtcclxuICBkaXNhYmxlZDogVENvbG9yO1xyXG59O1xyXG5cclxudHlwZSBCYWNrZ3JvdW5kQ29sb3JzID0ge1xyXG4gIHVwOiBUQ29sb3I7XHJcbiAgb3ZlcjogTGluZWFyR3JhZGllbnQ7XHJcbiAgZG93bjogTGluZWFyR3JhZGllbnQ7XHJcbiAgb3V0OiBMaW5lYXJHcmFkaWVudDtcclxuICBkaXNhYmxlZDogVENvbG9yO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgT2JqZWN0UGlja2VySXRlbTxUPiA9IHtcclxuICB2YWx1ZTogVDtcclxuICBub2RlOiBOb2RlO1xyXG59O1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICB3cmFwRW5hYmxlZD86IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gd3JhcCBhcm91bmQgYXQgZW5kcyBvZiByYW5nZVxyXG4gIGJhY2tncm91bmRDb2xvcj86IFRDb2xvcjsgLy8gY29sb3Igb2YgdGhlIGJhY2tncm91bmQgd2hlbiBwb2ludGVyIGlzIG5vdCBvdmVyIGl0XHJcbiAgYXJyb3dzQ29sb3I/OiBUQ29sb3I7IC8vIGNvbG9yIG9mIGFycm93c1xyXG4gIGFycm93c1ByZXNzZWRDb2xvcj86IFRDb2xvcjsgLy8gY29sb3Igb2YgYXJyb3dzIHdoZW4gcHJlc3NlZCwgY29tcHV0ZWQgaWYgbnVsbFxyXG4gIGdyYWRpZW50Q29sb3I/OiBUQ29sb3I7IC8vIGJhc2UgY29sb3Igb2YgdG9wL2JvdHRvbSBncmFkaWVudCBvbiBwb2ludGVyIG92ZXIsIGRlZmF1bHRzIHRvIG9wdGlvbnMuYXJyb3dzQ29sb3IgaWYgbnVsbFxyXG4gIGdyYWRpZW50UHJlc3NlZENvbG9yPzogVENvbG9yOyAvLyB7Q29sb3J8c3RyaW5nfG51bGx9IGNvbG9yIHRvcC9ib3R0b20gZ3JhZGllbnQgd2hlbiBwcmVzc2VkLCBjb21wdXRlZCBpZiBudWxsXHJcbiAgY29ybmVyUmFkaXVzPzogbnVtYmVyO1xyXG4gIHhNYXJnaW4/OiBudW1iZXI7XHJcbiAgeU1hcmdpbj86IG51bWJlcjtcclxuICB0aW1lckRlbGF5PzogbnVtYmVyOyAvLyBzdGFydCB0byBmaXJlIGNvbnRpbnVvdXNseSBhZnRlciBwcmVzc2luZyBmb3IgdGhpcyBsb25nIChtaWxsaXNlY29uZHMpXHJcbiAgdGltZXJJbnRlcnZhbD86IG51bWJlcjsgLy8gZmlyZSBjb250aW51b3VzbHkgYXQgdGhpcyBmcmVxdWVuY3kgKG1pbGxpc2Vjb25kcyksXHJcbiAgdG91Y2hBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xyXG4gIHRvdWNoQXJlYVlEaWxhdGlvbj86IG51bWJlcjtcclxuICBtb3VzZUFyZWFYRGlsYXRpb24/OiBudW1iZXI7XHJcbiAgbW91c2VBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xyXG4gIGJhY2tncm91bmRTdHJva2U/OiBUQ29sb3I7XHJcbiAgYmFja2dyb3VuZExpbmVXaWR0aD86IG51bWJlcjtcclxuICBhcnJvd0hlaWdodD86IG51bWJlcjtcclxuICBhcnJvd1lTcGFjaW5nPzogbnVtYmVyO1xyXG4gIGFycm93U3Ryb2tlPzogVENvbG9yO1xyXG4gIGFycm93TGluZVdpZHRoPzogbnVtYmVyO1xyXG4gIGluY3JlbWVudEZ1bmN0aW9uPzogKCBpbmRleDogbnVtYmVyICkgPT4gbnVtYmVyO1xyXG4gIGRlY3JlbWVudEZ1bmN0aW9uPzogKCBpbmRleDogbnVtYmVyICkgPT4gbnVtYmVyO1xyXG5cclxuICAvLyB3aGV0aGVyIGluY3JlbWVudCBhbmQgZGVjcmVtZW50IGFyZSBlbmFibGVkLlxyXG4gIC8vIElmIHRoZSBjbGllbnQgcHJvdmlkZXMgdGhlc2UsIHRoZW4gdGhlIGNsaWVudCBpcyBmdWxseSByZXNwb25zaWJsZSBmb3IgdGhlIHN0YXRlIG9mIHRoZXNlIFByb3BlcnRpZXMuXHJcbiAgLy8gSWYgbnVsbCwgYSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIGlzIHVzZWQuXHJcbiAgaW5jcmVtZW50RW5hYmxlZFByb3BlcnR5PzogTGlua2FibGVQcm9wZXJ0eTxib29sZWFuPiB8IG51bGw7XHJcbiAgZGVjcmVtZW50RW5hYmxlZFByb3BlcnR5PzogTGlua2FibGVQcm9wZXJ0eTxib29sZWFuPiB8IG51bGw7XHJcbn07XHJcblxyXG50eXBlIE9iamVjdFBpY2tlck9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxOb2RlT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT2JqZWN0UGlja2VyPFQ+IGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZU9iamVjdFBpY2tlcjogKCkgPT4gdm9pZDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHZhbHVlUHJvcGVydHkgLSB2YWx1ZSBvZiB0aGUgY3VycmVudCBpdGVtIHRoYXQgaXMgZGlzcGxheWVkXHJcbiAgICogQHBhcmFtIGl0ZW1zIC0gdGhlIHNldCBvZiBpdGVtcyB0aGF0IHlvdSBjYW4gc2VsZWN0IGZyb21cclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHZhbHVlUHJvcGVydHk6IFByb3BlcnR5PFQ+LCBpdGVtczogT2JqZWN0UGlja2VySXRlbTxUPltdLCBwcm92aWRlZE9wdGlvbnM6IE9iamVjdFBpY2tlck9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxPYmplY3RQaWNrZXJPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIHdyYXBFbmFibGVkOiBmYWxzZSxcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgYXJyb3dzQ29sb3I6ICdibHVlJyxcclxuICAgICAgYXJyb3dzUHJlc3NlZENvbG9yOiBudWxsLFxyXG4gICAgICBncmFkaWVudENvbG9yOiBudWxsLFxyXG4gICAgICBncmFkaWVudFByZXNzZWRDb2xvcjogbnVsbCxcclxuICAgICAgY29ybmVyUmFkaXVzOiA2LFxyXG4gICAgICB4TWFyZ2luOiAzLFxyXG4gICAgICB5TWFyZ2luOiAzLFxyXG4gICAgICB0aW1lckRlbGF5OiA0MDAsXHJcbiAgICAgIHRpbWVySW50ZXJ2YWw6IDEwMCxcclxuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiAxMCxcclxuICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiAxMCxcclxuICAgICAgbW91c2VBcmVhWERpbGF0aW9uOiAwLFxyXG4gICAgICBtb3VzZUFyZWFZRGlsYXRpb246IDUsXHJcbiAgICAgIGJhY2tncm91bmRTdHJva2U6ICdncmF5JyxcclxuICAgICAgYmFja2dyb3VuZExpbmVXaWR0aDogMC41LFxyXG4gICAgICBhcnJvd0hlaWdodDogNixcclxuICAgICAgYXJyb3dZU3BhY2luZzogMyxcclxuICAgICAgYXJyb3dTdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGFycm93TGluZVdpZHRoOiAwLjI1LFxyXG4gICAgICBpbmNyZW1lbnRGdW5jdGlvbjogKCBpbmRleDogbnVtYmVyICkgPT4gaW5kZXggKyAxLFxyXG4gICAgICBkZWNyZW1lbnRGdW5jdGlvbjogKCBpbmRleDogbnVtYmVyICkgPT4gaW5kZXggLSAxLFxyXG4gICAgICBpbmNyZW1lbnRFbmFibGVkUHJvcGVydHk6IG51bGwsXHJcbiAgICAgIGRlY3JlbWVudEVuYWJsZWRQcm9wZXJ0eTogbnVsbFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgb3B0aW9ucy5hcnJvd3NQcmVzc2VkQ29sb3IgPSBvcHRpb25zLmFycm93c1ByZXNzZWRDb2xvciB8fCBDb2xvci50b0NvbG9yKCBvcHRpb25zLmFycm93c0NvbG9yICkuZGFya2VyQ29sb3IoKTtcclxuICAgIG9wdGlvbnMuZ3JhZGllbnRDb2xvciA9IG9wdGlvbnMuZ3JhZGllbnRDb2xvciB8fCBvcHRpb25zLmFycm93c0NvbG9yO1xyXG4gICAgb3B0aW9ucy5ncmFkaWVudFByZXNzZWRDb2xvciA9IG9wdGlvbnMuZ3JhZGllbnRQcmVzc2VkQ29sb3IgfHwgQ29sb3IudG9Db2xvciggb3B0aW9ucy5ncmFkaWVudENvbG9yICkuZGFya2VyQ29sb3IoKTtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBOb2Rlc1xyXG5cclxuICAgIC8vIG1heGltdW0gZGltZW5zaW9ucyBvZiBpdGVtIE5vZGVzXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpdGVtcy5sZW5ndGggPiAwICk7XHJcbiAgICBjb25zdCBtYXhXaWR0aCA9IF8ubWF4QnkoIGl0ZW1zLCBpdGVtID0+IGl0ZW0ubm9kZS53aWR0aCApIS5ub2RlLndpZHRoO1xyXG4gICAgY29uc3QgbWF4SGVpZ2h0ID0gXy5tYXhCeSggaXRlbXMsIGl0ZW0gPT4gaXRlbS5ub2RlLmhlaWdodCApIS5ub2RlLmhlaWdodDtcclxuXHJcbiAgICAvLyBjb21wdXRlIHNoYXBlIG9mIHRoZSBiYWNrZ3JvdW5kIGJlaGluZCB0aGUgdmFsdWVcclxuICAgIGNvbnN0IGJhY2tncm91bmRXaWR0aCA9IG1heFdpZHRoICsgKCAyICogb3B0aW9ucy54TWFyZ2luICk7XHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kSGVpZ2h0ID0gbWF4SGVpZ2h0ICsgKCAyICogb3B0aW9ucy55TWFyZ2luICk7XHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kT3ZlcmxhcCA9IDE7XHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kQ29ybmVyUmFkaXVzID0gb3B0aW9ucy5jb3JuZXJSYWRpdXM7XHJcblxyXG4gICAgLy8gcGFyZW50IGZvciB2YWx1ZSwgdG8gbWFpbnRhaW4gcmVuZGVyaW5nIG9yZGVyIGFuZCBzaW1wbGlmeSBjZW50ZXJpbmdcclxuICAgIGNvbnN0IHZhbHVlUGFyZW50Tm9kZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIGJhY2tncm91bmRXaWR0aCwgYmFja2dyb3VuZEhlaWdodCwge1xyXG4gICAgICBwaWNrYWJsZTogZmFsc2VcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBUb3AgaGFsZiBvZiB0aGUgYmFja2dyb3VuZC4gUHJlc3NpbmcgaGVyZSB3aWxsIGluY3JlbWVudCB0aGUgdmFsdWUuXHJcbiAgICAvLyBTaGFwZSBjb21wdXRlZCBzdGFydGluZyBhdCB1cHBlci1sZWZ0LCBnb2luZyBjbG9ja3dpc2UuXHJcbiAgICBjb25zdCBpbmNyZW1lbnRCYWNrZ3JvdW5kTm9kZSA9IG5ldyBQYXRoKCBuZXcgU2hhcGUoKVxyXG4gICAgICAgIC5hcmMoIGJhY2tncm91bmRDb3JuZXJSYWRpdXMsIGJhY2tncm91bmRDb3JuZXJSYWRpdXMsIGJhY2tncm91bmRDb3JuZXJSYWRpdXMsIE1hdGguUEksIE1hdGguUEkgKiAzIC8gMiwgZmFsc2UgKVxyXG4gICAgICAgIC5hcmMoIGJhY2tncm91bmRXaWR0aCAtIGJhY2tncm91bmRDb3JuZXJSYWRpdXMsIGJhY2tncm91bmRDb3JuZXJSYWRpdXMsIGJhY2tncm91bmRDb3JuZXJSYWRpdXMsIC1NYXRoLlBJIC8gMiwgMCwgZmFsc2UgKVxyXG4gICAgICAgIC5saW5lVG8oIGJhY2tncm91bmRXaWR0aCwgKCBiYWNrZ3JvdW5kSGVpZ2h0IC8gMiApICsgYmFja2dyb3VuZE92ZXJsYXAgKVxyXG4gICAgICAgIC5saW5lVG8oIDAsICggYmFja2dyb3VuZEhlaWdodCAvIDIgKSArIGJhY2tncm91bmRPdmVybGFwIClcclxuICAgICAgICAuY2xvc2UoKSxcclxuICAgICAgeyBwaWNrYWJsZTogZmFsc2UgfSApO1xyXG5cclxuICAgIC8vIEJvdHRvbSBoYWxmIG9mIHRoZSBiYWNrZ3JvdW5kLiBQcmVzc2luZyBoZXJlIHdpbGwgZGVjcmVtZW50IHRoZSB2YWx1ZS5cclxuICAgIC8vIFNoYXBlIGNvbXB1dGVkIHN0YXJ0aW5nIGF0IGJvdHRvbS1yaWdodCwgZ29pbmcgY2xvY2t3aXNlLlxyXG4gICAgY29uc3QgZGVjcmVtZW50QmFja2dyb3VuZE5vZGUgPSBuZXcgUGF0aCggbmV3IFNoYXBlKClcclxuICAgICAgICAuYXJjKCBiYWNrZ3JvdW5kV2lkdGggLSBiYWNrZ3JvdW5kQ29ybmVyUmFkaXVzLCBiYWNrZ3JvdW5kSGVpZ2h0IC0gYmFja2dyb3VuZENvcm5lclJhZGl1cywgYmFja2dyb3VuZENvcm5lclJhZGl1cywgMCwgTWF0aC5QSSAvIDIsIGZhbHNlIClcclxuICAgICAgICAuYXJjKCBiYWNrZ3JvdW5kQ29ybmVyUmFkaXVzLCBiYWNrZ3JvdW5kSGVpZ2h0IC0gYmFja2dyb3VuZENvcm5lclJhZGl1cywgYmFja2dyb3VuZENvcm5lclJhZGl1cywgTWF0aC5QSSAvIDIsIE1hdGguUEksIGZhbHNlIClcclxuICAgICAgICAubGluZVRvKCAwLCBiYWNrZ3JvdW5kSGVpZ2h0IC8gMiApXHJcbiAgICAgICAgLmxpbmVUbyggYmFja2dyb3VuZFdpZHRoLCBiYWNrZ3JvdW5kSGVpZ2h0IC8gMiApXHJcbiAgICAgICAgLmNsb3NlKCksXHJcbiAgICAgIHsgcGlja2FibGU6IGZhbHNlIH0gKTtcclxuXHJcbiAgICAvLyBzZXBhcmF0ZSByZWN0YW5nbGUgZm9yIHN0cm9rZSBhcm91bmQgdmFsdWUgYmFja2dyb3VuZFxyXG4gICAgY29uc3Qgc3Ryb2tlZEJhY2tncm91bmQgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBiYWNrZ3JvdW5kV2lkdGgsIGJhY2tncm91bmRIZWlnaHQsIGJhY2tncm91bmRDb3JuZXJSYWRpdXMsIGJhY2tncm91bmRDb3JuZXJSYWRpdXMsIHtcclxuICAgICAgcGlja2FibGU6IGZhbHNlLFxyXG4gICAgICBzdHJva2U6IG9wdGlvbnMuYmFja2dyb3VuZFN0cm9rZSxcclxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmJhY2tncm91bmRMaW5lV2lkdGhcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjb21wdXRlIHNpemUgb2YgYXJyb3dzXHJcbiAgICBjb25zdCBhcnJvd0J1dHRvblNpemUgPSBuZXcgRGltZW5zaW9uMiggMC41ICogYmFja2dyb3VuZFdpZHRoLCBvcHRpb25zLmFycm93SGVpZ2h0ICk7XHJcblxyXG4gICAgLy8gb3B0aW9ucyBzaGFyZWQgYnkgYm90aCBhcnJvd3NcclxuICAgIGNvbnN0IGFycm93T3B0aW9ucyA9IHtcclxuICAgICAgc3Ryb2tlOiBvcHRpb25zLmFycm93U3Ryb2tlLFxyXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMuYXJyb3dMaW5lV2lkdGgsXHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBpbmNyZW1lbnQgYXJyb3csIHBvaW50aW5nIHVwLCBkZXNjcmliZWQgY2xvY2t3aXNlIGZyb20gdGlwXHJcbiAgICBjb25zdCBpbmNyZW1lbnRBcnJvdyA9IG5ldyBQYXRoKCBuZXcgU2hhcGUoKVxyXG4gICAgICAgIC5tb3ZlVG8oIGFycm93QnV0dG9uU2l6ZS53aWR0aCAvIDIsIDAgKVxyXG4gICAgICAgIC5saW5lVG8oIGFycm93QnV0dG9uU2l6ZS53aWR0aCwgYXJyb3dCdXR0b25TaXplLmhlaWdodCApXHJcbiAgICAgICAgLmxpbmVUbyggMCwgYXJyb3dCdXR0b25TaXplLmhlaWdodCApXHJcbiAgICAgICAgLmNsb3NlKCksXHJcbiAgICAgIGNvbWJpbmVPcHRpb25zPFBhdGhPcHRpb25zPigge30sIGFycm93T3B0aW9ucywge1xyXG4gICAgICAgIGNlbnRlclg6IGluY3JlbWVudEJhY2tncm91bmROb2RlLmNlbnRlclgsXHJcbiAgICAgICAgYm90dG9tOiBpbmNyZW1lbnRCYWNrZ3JvdW5kTm9kZS50b3AgLSBvcHRpb25zLmFycm93WVNwYWNpbmdcclxuICAgICAgfSApICk7XHJcblxyXG4gICAgLy8gZGVjcmVtZW50IGFycm93LCBwb2ludGluZyBkb3duLCBkZXNjcmliZWQgY2xvY2t3aXNlIGZyb20gdGhlIHRpcFxyXG4gICAgY29uc3QgZGVjcmVtZW50QXJyb3cgPSBuZXcgUGF0aCggbmV3IFNoYXBlKClcclxuICAgICAgICAubW92ZVRvKCBhcnJvd0J1dHRvblNpemUud2lkdGggLyAyLCBhcnJvd0J1dHRvblNpemUuaGVpZ2h0IClcclxuICAgICAgICAubGluZVRvKCAwLCAwIClcclxuICAgICAgICAubGluZVRvKCBhcnJvd0J1dHRvblNpemUud2lkdGgsIDAgKVxyXG4gICAgICAgIC5jbG9zZSgpLFxyXG4gICAgICBjb21iaW5lT3B0aW9uczxQYXRoT3B0aW9ucz4oIHt9LCBhcnJvd09wdGlvbnMsIHtcclxuICAgICAgICBjZW50ZXJYOiBkZWNyZW1lbnRCYWNrZ3JvdW5kTm9kZS5jZW50ZXJYLFxyXG4gICAgICAgIHRvcDogZGVjcmVtZW50QmFja2dyb3VuZE5vZGUuYm90dG9tICsgb3B0aW9ucy5hcnJvd1lTcGFjaW5nXHJcbiAgICAgIH0gKSApO1xyXG5cclxuICAgIC8vIHBhcmVudHMgZm9yIGluY3JlbWVudCBhbmQgZGVjcmVtZW50IGNvbXBvbmVudHNcclxuICAgIGNvbnN0IGluY3JlbWVudFBhcmVudCA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGluY3JlbWVudEJhY2tncm91bmROb2RlLCBpbmNyZW1lbnRBcnJvdyBdIH0gKTtcclxuICAgIGluY3JlbWVudFBhcmVudC5hZGRDaGlsZCggbmV3IFJlY3RhbmdsZSggaW5jcmVtZW50UGFyZW50LmxvY2FsQm91bmRzICkgKTsgLy8gaW52aXNpYmxlIG92ZXJsYXlcclxuICAgIGNvbnN0IGRlY3JlbWVudFBhcmVudCA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGRlY3JlbWVudEJhY2tncm91bmROb2RlLCBkZWNyZW1lbnRBcnJvdyBdIH0gKTtcclxuICAgIGRlY3JlbWVudFBhcmVudC5hZGRDaGlsZCggbmV3IFJlY3RhbmdsZSggZGVjcmVtZW50UGFyZW50LmxvY2FsQm91bmRzICkgKTsgLy8gaW52aXNpYmxlIG92ZXJsYXlcclxuXHJcbiAgICAvLyByZW5kZXJpbmcgb3JkZXJcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGluY3JlbWVudFBhcmVudCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZGVjcmVtZW50UGFyZW50ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBzdHJva2VkQmFja2dyb3VuZCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdmFsdWVQYXJlbnROb2RlICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIFBvaW50ZXIgYXJlYXNcclxuXHJcbiAgICAvLyB0b3VjaCBhcmVhc1xyXG4gICAgaW5jcmVtZW50UGFyZW50LnRvdWNoQXJlYSA9IFNoYXBlLnJlY3RhbmdsZShcclxuICAgICAgaW5jcmVtZW50UGFyZW50LmxlZnQgLSAoIG9wdGlvbnMudG91Y2hBcmVhWERpbGF0aW9uIC8gMiApLCBpbmNyZW1lbnRQYXJlbnQudG9wIC0gb3B0aW9ucy50b3VjaEFyZWFZRGlsYXRpb24sXHJcbiAgICAgIGluY3JlbWVudFBhcmVudC53aWR0aCArIG9wdGlvbnMudG91Y2hBcmVhWERpbGF0aW9uLCBpbmNyZW1lbnRQYXJlbnQuaGVpZ2h0ICsgb3B0aW9ucy50b3VjaEFyZWFZRGlsYXRpb24gKTtcclxuICAgIGRlY3JlbWVudFBhcmVudC50b3VjaEFyZWEgPSBTaGFwZS5yZWN0YW5nbGUoXHJcbiAgICAgIGRlY3JlbWVudFBhcmVudC5sZWZ0IC0gKCBvcHRpb25zLnRvdWNoQXJlYVhEaWxhdGlvbiAvIDIgKSwgZGVjcmVtZW50UGFyZW50LnRvcCxcclxuICAgICAgZGVjcmVtZW50UGFyZW50LndpZHRoICsgb3B0aW9ucy50b3VjaEFyZWFYRGlsYXRpb24sIGRlY3JlbWVudFBhcmVudC5oZWlnaHQgKyBvcHRpb25zLnRvdWNoQXJlYVlEaWxhdGlvbiApO1xyXG5cclxuICAgIC8vIG1vdXNlIGFyZWFzXHJcbiAgICBpbmNyZW1lbnRQYXJlbnQubW91c2VBcmVhID0gU2hhcGUucmVjdGFuZ2xlKFxyXG4gICAgICBpbmNyZW1lbnRQYXJlbnQubGVmdCAtICggb3B0aW9ucy5tb3VzZUFyZWFYRGlsYXRpb24gLyAyICksIGluY3JlbWVudFBhcmVudC50b3AgLSBvcHRpb25zLm1vdXNlQXJlYVlEaWxhdGlvbixcclxuICAgICAgaW5jcmVtZW50UGFyZW50LndpZHRoICsgb3B0aW9ucy5tb3VzZUFyZWFYRGlsYXRpb24sIGluY3JlbWVudFBhcmVudC5oZWlnaHQgKyBvcHRpb25zLm1vdXNlQXJlYVlEaWxhdGlvbiApO1xyXG4gICAgZGVjcmVtZW50UGFyZW50Lm1vdXNlQXJlYSA9IFNoYXBlLnJlY3RhbmdsZShcclxuICAgICAgZGVjcmVtZW50UGFyZW50LmxlZnQgLSAoIG9wdGlvbnMubW91c2VBcmVhWERpbGF0aW9uIC8gMiApLCBkZWNyZW1lbnRQYXJlbnQudG9wLFxyXG4gICAgICBkZWNyZW1lbnRQYXJlbnQud2lkdGggKyBvcHRpb25zLm1vdXNlQXJlYVhEaWxhdGlvbiwgZGVjcmVtZW50UGFyZW50LmhlaWdodCArIG9wdGlvbnMubW91c2VBcmVhWURpbGF0aW9uICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIENvbG9yc1xyXG5cclxuICAgIC8vIGFycm93IGNvbG9ycywgY29ycmVzcG9uZGluZyB0byBCdXR0b25TdGF0ZSBhbmQgaW5jcmVtZW50RW5hYmxlZFByb3BlcnR5L2RlY3JlbWVudEVuYWJsZWRQcm9wZXJ0eVxyXG4gICAgY29uc3QgYXJyb3dDb2xvcnMgPSB7XHJcbiAgICAgIHVwOiBvcHRpb25zLmFycm93c0NvbG9yLFxyXG4gICAgICBvdmVyOiBvcHRpb25zLmFycm93c0NvbG9yLFxyXG4gICAgICBkb3duOiBvcHRpb25zLmFycm93c1ByZXNzZWRDb2xvcixcclxuICAgICAgb3V0OiBvcHRpb25zLmFycm93c0NvbG9yLFxyXG4gICAgICBkaXNhYmxlZDogJ3JnYiggMTc2LDE3NiwxNzYgKSdcclxuICAgIH07XHJcblxyXG4gICAgLy8gYmFja2dyb3VuZCBjb2xvcnMsIGNvcnJlc3BvbmRpbmcgdG8gQnV0dG9uU3RhdGUgYW5kIGVuYWJsZWRQcm9wZXJ0eS52YWx1ZVxyXG4gICAgY29uc3QgaGlnaGxpZ2h0R3JhZGllbnQgPSBjcmVhdGVWZXJ0aWNhbEdyYWRpZW50KCBvcHRpb25zLmdyYWRpZW50Q29sb3IsIG9wdGlvbnMuYmFja2dyb3VuZENvbG9yLCBvcHRpb25zLmdyYWRpZW50Q29sb3IsIGJhY2tncm91bmRIZWlnaHQgKTtcclxuICAgIGNvbnN0IHByZXNzZWRHcmFkaWVudCA9IGNyZWF0ZVZlcnRpY2FsR3JhZGllbnQoIG9wdGlvbnMuZ3JhZGllbnRQcmVzc2VkQ29sb3IsIG9wdGlvbnMuYmFja2dyb3VuZENvbG9yLCBvcHRpb25zLmdyYWRpZW50UHJlc3NlZENvbG9yLCBiYWNrZ3JvdW5kSGVpZ2h0ICk7XHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kQ29sb3JzID0ge1xyXG4gICAgICB1cDogb3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3IsXHJcbiAgICAgIG92ZXI6IGhpZ2hsaWdodEdyYWRpZW50LFxyXG4gICAgICBkb3duOiBwcmVzc2VkR3JhZGllbnQsXHJcbiAgICAgIG91dDogcHJlc3NlZEdyYWRpZW50LFxyXG4gICAgICBkaXNhYmxlZDogb3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3JcclxuICAgIH07XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIFByb3BlcnRpZXNcclxuXHJcbiAgICAvLyBpbmRleCBvZiB0aGUgaXRlbSB0aGF0J3MgY3VycmVudGx5IHNlbGVjdGVkXHJcbiAgICBjb25zdCBpbmRleFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBpbmRleE9mSXRlbVdpdGhWYWx1ZTxUPiggaXRlbXMsIHZhbHVlUHJvcGVydHkudmFsdWUgKSwge1xyXG4gICAgICBudW1iZXJUeXBlOiAnSW50ZWdlcicsXHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIGl0ZW1zLmxlbmd0aCAtIDEgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGluY3JlbWVudEJ1dHRvblN0YXRlUHJvcGVydHkgPSBuZXcgU3RyaW5nVW5pb25Qcm9wZXJ0eSggJ3VwJywge1xyXG4gICAgICB2YWxpZFZhbHVlczogQnV0dG9uU3RhdGVWYWx1ZXNcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGRlY3JlbWVudEJ1dHRvblN0YXRlUHJvcGVydHkgPSBuZXcgU3RyaW5nVW5pb25Qcm9wZXJ0eSggJ2Rvd24nLCB7XHJcbiAgICAgIHZhbGlkVmFsdWVzOiBCdXR0b25TdGF0ZVZhbHVlc1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGVuYWJsZXMgdGhlIGluY3JlbWVudCBidXR0b25cclxuICAgIGNvbnN0IGluY3JlbWVudEVuYWJsZWRQcm9wZXJ0eSA9IG9wdGlvbnMuaW5jcmVtZW50RW5hYmxlZFByb3BlcnR5IHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIGluZGV4UHJvcGVydHkgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPT4gKCBvcHRpb25zLndyYXBFbmFibGVkIHx8ICggaW5kZXggPCBpdGVtcy5sZW5ndGggLSAxICkgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAvLyBlbmFibGVzIHRoZSBkZWNyZW1lbnQgYnV0dG9uXHJcbiAgICBjb25zdCBkZWNyZW1lbnRFbmFibGVkUHJvcGVydHkgPSBvcHRpb25zLmRlY3JlbWVudEVuYWJsZWRQcm9wZXJ0eSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBpbmRleFByb3BlcnR5IF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0+ICggb3B0aW9ucy53cmFwRW5hYmxlZCB8fCAoIGluZGV4ID4gMCApIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIE9ic2VydmVycyBhbmQgSW5wdXRMaXN0ZW5lcnNcclxuXHJcbiAgICBjb25zdCBpbnB1dExpc3RlbmVyT3B0aW9uczogT2JqZWN0UGlja2VySW5wdXRMaXN0ZW5lck9wdGlvbnMgPSB7XHJcbiAgICAgIGZpcmVPbkhvbGQ6IHRydWUsXHJcbiAgICAgIGZpcmVPbkhvbGREZWxheTogb3B0aW9ucy50aW1lckRlbGF5LFxyXG4gICAgICBmaXJlT25Ib2xkSW50ZXJ2YWw6IG9wdGlvbnMudGltZXJJbnRlcnZhbFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBpbmNyZW1lbnRJbnB1dExpc3RlbmVyID0gbmV3IE9iamVjdFBpY2tlcklucHV0TGlzdGVuZXIoIGluY3JlbWVudEJ1dHRvblN0YXRlUHJvcGVydHksXHJcbiAgICAgIGNvbWJpbmVPcHRpb25zPE9iamVjdFBpY2tlcklucHV0TGlzdGVuZXJPcHRpb25zPigge30sIGlucHV0TGlzdGVuZXJPcHRpb25zLCB7XHJcbiAgICAgICAgZmlyZTogKCkgPT4ge1xyXG4gICAgICAgICAgaWYgKCBpbmNyZW1lbnRJbnB1dExpc3RlbmVyLmVuYWJsZWQgKSB7XHJcbiAgICAgICAgICAgIGxldCBpbmRleCA9IG9wdGlvbnMuaW5jcmVtZW50RnVuY3Rpb24oIGluZGV4UHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgICAgICAgaWYgKCBvcHRpb25zLndyYXBFbmFibGVkICYmIGluZGV4ID49IGl0ZW1zLmxlbmd0aCApIHtcclxuICAgICAgICAgICAgICBpbmRleCA9IG9wdGlvbnMuaW5jcmVtZW50RnVuY3Rpb24oIC0xICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5kZXhQcm9wZXJ0eS52YWx1ZSA9IGluZGV4O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbmNyZW1lbnRJbnB1dExpc3RlbmVyJyApXHJcbiAgICAgIH0gKSApO1xyXG4gICAgaW5jcmVtZW50UGFyZW50LmFkZElucHV0TGlzdGVuZXIoIGluY3JlbWVudElucHV0TGlzdGVuZXIgKTtcclxuXHJcbiAgICBjb25zdCBkZWNyZW1lbnRJbnB1dExpc3RlbmVyID0gbmV3IE9iamVjdFBpY2tlcklucHV0TGlzdGVuZXIoIGRlY3JlbWVudEJ1dHRvblN0YXRlUHJvcGVydHksXHJcbiAgICAgIGNvbWJpbmVPcHRpb25zPE9iamVjdFBpY2tlcklucHV0TGlzdGVuZXJPcHRpb25zPigge30sIGlucHV0TGlzdGVuZXJPcHRpb25zLCB7XHJcbiAgICAgICAgZmlyZTogKCkgPT4ge1xyXG4gICAgICAgICAgaWYgKCBkZWNyZW1lbnRJbnB1dExpc3RlbmVyLmVuYWJsZWQgKSB7XHJcbiAgICAgICAgICAgIGxldCBpbmRleCA9IG9wdGlvbnMuZGVjcmVtZW50RnVuY3Rpb24oIGluZGV4UHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgICAgICAgaWYgKCBvcHRpb25zLndyYXBFbmFibGVkICYmIGluZGV4IDwgMCApIHtcclxuICAgICAgICAgICAgICBpbmRleCA9IG9wdGlvbnMuZGVjcmVtZW50RnVuY3Rpb24oIGl0ZW1zLmxlbmd0aCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluZGV4UHJvcGVydHkudmFsdWUgPSBpbmRleDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZGVjcmVtZW50SW5wdXRMaXN0ZW5lcicgKVxyXG4gICAgICB9ICkgKTtcclxuICAgIGRlY3JlbWVudFBhcmVudC5hZGRJbnB1dExpc3RlbmVyKCBkZWNyZW1lbnRJbnB1dExpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gZW5hYmxlL2Rpc2FibGUsIHVubGluayByZXF1aXJlZFxyXG4gICAgY29uc3QgaW5jcmVtZW50RW5hYmxlZExpc3RlbmVyID0gKCBlbmFibGVkOiBib29sZWFuICkgPT4ge1xyXG4gICAgICBpbmNyZW1lbnRJbnB1dExpc3RlbmVyLmVuYWJsZWQgPSBlbmFibGVkO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IGRlY3JlbWVudEVuYWJsZWRMaXN0ZW5lciA9ICggZW5hYmxlZDogYm9vbGVhbiApID0+IHtcclxuICAgICAgZGVjcmVtZW50SW5wdXRMaXN0ZW5lci5lbmFibGVkID0gZW5hYmxlZDtcclxuICAgIH07XHJcbiAgICBpbmNyZW1lbnRFbmFibGVkUHJvcGVydHkubGluayggaW5jcmVtZW50RW5hYmxlZExpc3RlbmVyICk7XHJcbiAgICBkZWNyZW1lbnRFbmFibGVkUHJvcGVydHkubGluayggZGVjcmVtZW50RW5hYmxlZExpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIGRpc3BsYXllZCBOb2RlIGFuZCBpbmRleCB0byBtYXRjaCB0aGUgY3VycmVudCB2YWx1ZVxyXG4gICAgY29uc3QgdmFsdWVPYnNlcnZlciA9ICggdmFsdWU6IFQgKSA9PiB7XHJcblxyXG4gICAgICB2YWx1ZVBhcmVudE5vZGUucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcclxuXHJcbiAgICAgIC8vIHNob3cgdGhlIG5vZGUgYXNzb2NpYXRlZCB3aXRoIHRoZSB2YWx1ZVxyXG4gICAgICBjb25zdCBpbmRleCA9IGluZGV4T2ZJdGVtV2l0aFZhbHVlPFQ+KCBpdGVtcywgdmFsdWUgKTtcclxuICAgICAgY29uc3QgdmFsdWVOb2RlID0gaXRlbXNbIGluZGV4IF0ubm9kZTtcclxuICAgICAgdmFsdWVQYXJlbnROb2RlLmFkZENoaWxkKCB2YWx1ZU5vZGUgKTtcclxuICAgICAgdmFsdWVOb2RlLmNlbnRlclggPSBiYWNrZ3JvdW5kV2lkdGggLyAyO1xyXG4gICAgICB2YWx1ZU5vZGUuY2VudGVyWSA9IGJhY2tncm91bmRIZWlnaHQgLyAyO1xyXG5cclxuICAgICAgLy8gc3luY2hyb25pemUgdGhlIGluZGV4XHJcbiAgICAgIGluZGV4UHJvcGVydHkudmFsdWUgPSBpbmRleDtcclxuICAgIH07XHJcbiAgICB2YWx1ZVByb3BlcnR5LmxpbmsoIHZhbHVlT2JzZXJ2ZXIgKTsgLy8gdW5saW5rIHJlcXVpcmVkIGluIGRpc3Bvc2VcclxuXHJcbiAgICAvLyB1bmxpbmsgbm90IHJlcXVpcmVkXHJcbiAgICBpbmRleFByb3BlcnR5LmxpbmsoIGluZGV4ID0+IHtcclxuICAgICAgdmFsdWVQcm9wZXJ0eS52YWx1ZSA9IGl0ZW1zWyBpbmRleCBdLnZhbHVlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSBjb2xvcnMgZm9yIGluY3JlbWVudCBjb21wb25lbnRzXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICBbIGluY3JlbWVudEJ1dHRvblN0YXRlUHJvcGVydHksIGluY3JlbWVudEVuYWJsZWRQcm9wZXJ0eSBdLFxyXG4gICAgICAoIGJ1dHRvblN0YXRlLCBlbmFibGVkICkgPT4ge1xyXG4gICAgICAgIHVwZGF0ZUNvbG9ycyggYnV0dG9uU3RhdGUsIGVuYWJsZWQsIGluY3JlbWVudEJhY2tncm91bmROb2RlLCBpbmNyZW1lbnRBcnJvdywgYmFja2dyb3VuZENvbG9ycywgYXJyb3dDb2xvcnMgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSBjb2xvcnMgZm9yIGRlY3JlbWVudCBjb21wb25lbnRzXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICBbIGRlY3JlbWVudEJ1dHRvblN0YXRlUHJvcGVydHksIGRlY3JlbWVudEVuYWJsZWRQcm9wZXJ0eSBdLFxyXG4gICAgICAoIGJ1dHRvblN0YXRlLCBlbmFibGVkICkgPT4ge1xyXG4gICAgICAgIHVwZGF0ZUNvbG9ycyggYnV0dG9uU3RhdGUsIGVuYWJsZWQsIGRlY3JlbWVudEJhY2tncm91bmROb2RlLCBkZWNyZW1lbnRBcnJvdywgYmFja2dyb3VuZENvbG9ycywgYXJyb3dDb2xvcnMgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlT2JqZWN0UGlja2VyID0gKCkgPT4ge1xyXG5cclxuICAgICAgaWYgKCB2YWx1ZVByb3BlcnR5Lmhhc0xpc3RlbmVyKCB2YWx1ZU9ic2VydmVyICkgKSB7XHJcbiAgICAgICAgdmFsdWVQcm9wZXJ0eS51bmxpbmsoIHZhbHVlT2JzZXJ2ZXIgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBpbmNyZW1lbnRFbmFibGVkUHJvcGVydHkuaGFzTGlzdGVuZXIoIGluY3JlbWVudEVuYWJsZWRMaXN0ZW5lciApICkge1xyXG4gICAgICAgIGluY3JlbWVudEVuYWJsZWRQcm9wZXJ0eS51bmxpbmsoIGluY3JlbWVudEVuYWJsZWRMaXN0ZW5lciApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIGRlY3JlbWVudEVuYWJsZWRQcm9wZXJ0eS5oYXNMaXN0ZW5lciggZGVjcmVtZW50RW5hYmxlZExpc3RlbmVyICkgKSB7XHJcbiAgICAgICAgZGVjcmVtZW50RW5hYmxlZFByb3BlcnR5LnVubGluayggZGVjcmVtZW50RW5hYmxlZExpc3RlbmVyICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcG9zZU9iamVjdFBpY2tlcigpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnZlcnRzIEZpcmVMaXN0ZW5lciBldmVudHMgdG8gQnV0dG9uU3RhdGUgY2hhbmdlcy5cclxuICovXHJcbnR5cGUgT2JqZWN0UGlja2VySW5wdXRMaXN0ZW5lck9wdGlvbnMgPSBGaXJlTGlzdGVuZXJPcHRpb25zPEZpcmVMaXN0ZW5lcj47XHJcblxyXG5jbGFzcyBPYmplY3RQaWNrZXJJbnB1dExpc3RlbmVyIGV4dGVuZHMgRmlyZUxpc3RlbmVyIHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGJ1dHRvblN0YXRlUHJvcGVydHk6IFN0cmluZ1VuaW9uUHJvcGVydHk8QnV0dG9uU3RhdGU+LCBvcHRpb25zOiBPYmplY3RQaWNrZXJJbnB1dExpc3RlbmVyT3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICBbIHRoaXMuaXNPdmVyUHJvcGVydHksIHRoaXMuaXNQcmVzc2VkUHJvcGVydHkgXSxcclxuICAgICAgKCBpc092ZXIsIGlzUHJlc3NlZCApID0+IHtcclxuICAgICAgICBidXR0b25TdGF0ZVByb3BlcnR5LnNldChcclxuICAgICAgICAgIGlzT3ZlciAmJiAhaXNQcmVzc2VkID8gJ292ZXInIDpcclxuICAgICAgICAgIGlzT3ZlciAmJiBpc1ByZXNzZWQgPyAnZG93bicgOlxyXG4gICAgICAgICAgIWlzT3ZlciAmJiAhaXNQcmVzc2VkID8gJ3VwJyA6XHJcbiAgICAgICAgICAnb3V0J1xyXG4gICAgICAgICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgdGhlIGluZGV4IG9mIHRoZSBpdGVtIHRoYXQgaGFzIGEgc3BlY2lmaWVkIHZhbHVlLlxyXG4gKi9cclxuZnVuY3Rpb24gaW5kZXhPZkl0ZW1XaXRoVmFsdWU8VD4oIGl0ZW1zOiBPYmplY3RQaWNrZXJJdGVtPFQ+W10sIHZhbHVlOiBUICk6IG51bWJlciB7XHJcbiAgbGV0IGluZGV4ID0gLTE7XHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICBpZiAoIGl0ZW1zWyBpIF0udmFsdWUgPT09IHZhbHVlICkge1xyXG4gICAgICBpbmRleCA9IGk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleCAhPT0gLTEsIGBpbnZhbGlkIHZhbHVlOiAke2luZGV4fWAgKTtcclxuICByZXR1cm4gaW5kZXg7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgdmVydGljYWwgZ3JhZGllbnQuXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVWZXJ0aWNhbEdyYWRpZW50KCB0b3BDb2xvcjogVENvbG9yLCBjZW50ZXJDb2xvcjogVENvbG9yLCBib3R0b21Db2xvcjogVENvbG9yLCBoZWlnaHQ6IG51bWJlciApOiBMaW5lYXJHcmFkaWVudCB7XHJcbiAgcmV0dXJuIG5ldyBMaW5lYXJHcmFkaWVudCggMCwgMCwgMCwgaGVpZ2h0IClcclxuICAgIC5hZGRDb2xvclN0b3AoIDAsIHRvcENvbG9yIClcclxuICAgIC5hZGRDb2xvclN0b3AoIDAuNSwgY2VudGVyQ29sb3IgKVxyXG4gICAgLmFkZENvbG9yU3RvcCggMSwgYm90dG9tQ29sb3IgKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZXMgYXJyb3cgYW5kIGJhY2tncm91bmQgY29sb3JzXHJcbiAqL1xyXG5mdW5jdGlvbiB1cGRhdGVDb2xvcnMoIGJ1dHRvblN0YXRlOiBCdXR0b25TdGF0ZSwgZW5hYmxlZDogYm9vbGVhbiwgYmFja2dyb3VuZDogUGF0aCwgYXJyb3c6IFBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yczogQmFja2dyb3VuZENvbG9ycywgYXJyb3dDb2xvcnM6IEFycm93Q29sb3JzICk6IHZvaWQge1xyXG4gIGlmICggZW5hYmxlZCApIHtcclxuICAgIGFycm93LnN0cm9rZSA9ICdibGFjayc7XHJcbiAgICBpZiAoIGJ1dHRvblN0YXRlID09PSAndXAnICkge1xyXG4gICAgICBiYWNrZ3JvdW5kLmZpbGwgPSBiYWNrZ3JvdW5kQ29sb3JzLnVwO1xyXG4gICAgICBhcnJvdy5maWxsID0gYXJyb3dDb2xvcnMudXA7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggYnV0dG9uU3RhdGUgPT09ICdvdmVyJyApIHtcclxuICAgICAgYmFja2dyb3VuZC5maWxsID0gYmFja2dyb3VuZENvbG9ycy5vdmVyO1xyXG4gICAgICBhcnJvdy5maWxsID0gYXJyb3dDb2xvcnMub3ZlcjtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBidXR0b25TdGF0ZSA9PT0gJ2Rvd24nICkge1xyXG4gICAgICBiYWNrZ3JvdW5kLmZpbGwgPSBiYWNrZ3JvdW5kQ29sb3JzLmRvd247XHJcbiAgICAgIGFycm93LmZpbGwgPSBhcnJvd0NvbG9ycy5kb3duO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGJ1dHRvblN0YXRlID09PSAnb3V0JyApIHtcclxuICAgICAgYmFja2dyb3VuZC5maWxsID0gYmFja2dyb3VuZENvbG9ycy5vdXQ7XHJcbiAgICAgIGFycm93LmZpbGwgPSBhcnJvd0NvbG9ycy5vdXQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgdW5zdXBwb3J0ZWQgYnV0dG9uU3RhdGU6ICR7YnV0dG9uU3RhdGV9YCApO1xyXG4gICAgfVxyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIGJhY2tncm91bmQuZmlsbCA9IGJhY2tncm91bmRDb2xvcnMuZGlzYWJsZWQ7XHJcbiAgICBhcnJvdy5maWxsID0gYXJyb3dDb2xvcnMuZGlzYWJsZWQ7XHJcbiAgICBhcnJvdy5zdHJva2UgPSBhcnJvd0NvbG9ycy5kaXNhYmxlZDsgLy8gc3Ryb2tlIHNvIHRoYXQgYXJyb3cgc2l6ZSB3aWxsIGxvb2sgdGhlIHNhbWUgd2hlbiBpdCdzIGVuYWJsZWQvZGlzYWJsZWRcclxuICB9XHJcbn1cclxuXHJcbmVxdWFsaXR5RXhwbG9yZXIucmVnaXN0ZXIoICdPYmplY3RQaWNrZXInLCBPYmplY3RQaWNrZXIgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUVwRSxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFFbEUsT0FBT0MsbUJBQW1CLE1BQU0sNENB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