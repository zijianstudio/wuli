// Copyright 2015-2023, University of Colorado Boulder

/**
 * Control for changing a Property of type {number}.
 * Consists of a labeled value, slider and arrow buttons.
 *
 * Number Control provides accessible content exclusively through the slider, please pass accessibility related
 * customizations through options to the slider.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Range from '../../dot/js/Range.js';
import Utils from '../../dot/js/Utils.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { AlignBox, HBox, Node, PaintColorProperty, Text, VBox } from '../../scenery/js/imports.js';
import ArrowButton from '../../sun/js/buttons/ArrowButton.js';
import HSlider from '../../sun/js/HSlider.js';
import Slider from '../../sun/js/Slider.js';
import nullSoundPlayer from '../../tambo/js/shared-sound-players/nullSoundPlayer.js';
import ValueChangeSoundPlayer from '../../tambo/js/sound-generators/ValueChangeSoundPlayer.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import NumberDisplay from './NumberDisplay.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';

// constants
const SPECIFIC_COMPONENT_CALLBACK_OPTIONS = ['startDrag', 'endDrag', 'leftStart', 'leftEnd', 'rightStart', 'rightEnd'];
const POINTER_AREA_OPTION_NAMES = ['touchAreaXDilation', 'touchAreaYDilation', 'mouseAreaXDilation', 'mouseAreaYDilation'];

// This is a marker to indicate that we should create the actual default sound player.
const DEFAULT_SOUND = new ValueChangeSoundPlayer(new Range(0, 1));

// description of a major tick

// other slider options that are specific to NumberControl

export default class NumberControl extends Node {
  // for a11y API

  constructor(title, numberProperty, numberRange, providedOptions) {
    // Make sure that general callbacks (for all components) and specific callbacks (for a specific component) aren't
    // used in tandem. This must be called before defaults are set.
    validateCallbacks(providedOptions || {});

    // Omit enabledRangeProperty from top-level, so that we don't need to provide a default.
    // Then add enabledRangeProperty to sliderOptions, so that if we are given providedOptions.enabledRangeProperty,
    // we can pass it to super via options.sliderOptions.enabledRangeProperty.
    // Extend NumberControl options before merging nested options because some nested defaults use these options.
    const initialOptions = optionize()({
      numberDisplayOptions: {},
      sliderOptions: {},
      arrowButtonOptions: {},
      titleNodeOptions: {},
      // General Callbacks
      startCallback: _.noop,
      // called when interaction begins, default value set in validateCallbacks()
      endCallback: _.noop,
      // called when interaction ends, default value set in validateCallbacks()

      delta: 1,
      disabledOpacity: 0.5,
      // {number} opacity used to make the control look disabled

      // A {function} that handles layout of subcomponents.
      // It has signature function( titleNode, numberDisplay, slider, decrementButton, incrementButton )
      // and returns a Node. If you want to customize the layout, use one of the predefined creators
      // (see createLayoutFunction*) or create your own function. Arrow buttons will be null if `includeArrowButtons:false`
      layoutFunction: NumberControl.createLayoutFunction1(),
      // {boolean} If set to true, then increment/decrement arrow buttons will be added to the NumberControl
      includeArrowButtons: true,
      soundGenerator: DEFAULT_SOUND,
      valueChangeSoundGeneratorOptions: {},
      // phet-io
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'Control',
      phetioType: NumberControl.NumberControlIO,
      phetioEnabledPropertyInstrumented: true,
      // opt into default PhET-iO instrumented enabledProperty
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    }, providedOptions);

    // A groupFocusHighlight is only included if using arrowButtons. When there are arrowButtons it is important
    // to indicate that the whole control is only one stop in the traversal order. This is set by NumberControl.
    assert && assert(initialOptions.groupFocusHighlight === undefined, 'NumberControl sets groupFocusHighlight');
    super();

    // If the arrow button scale is not provided, the arrow button height will match the number display height
    const arrowButtonScaleProvided = initialOptions.arrowButtonOptions && initialOptions.arrowButtonOptions.hasOwnProperty('scale');
    const getCurrentRange = () => {
      return options.enabledRangeProperty ? options.enabledRangeProperty.value : numberRange;
    };

    // Create a function that will be used to constrain the slider value to the provided range and the same delta as
    // the arrow buttons, see https://github.com/phetsims/scenery-phet/issues/384.
    const constrainValue = value => {
      assert && assert(options.delta !== undefined);
      const newValue = Utils.roundToInterval(value, options.delta);
      return getCurrentRange().constrainValue(newValue);
    };
    assert && assert(initialOptions.soundGenerator === DEFAULT_SOUND || _.isEmpty(initialOptions.valueChangeSoundGeneratorOptions), 'options should only be supplied when using default sound generator');

    // If no sound generator was provided, create one using the default configuration.
    if (initialOptions.soundGenerator === DEFAULT_SOUND) {
      let valueChangeSoundGeneratorOptions = initialOptions.valueChangeSoundGeneratorOptions;
      if (_.isEmpty(initialOptions.valueChangeSoundGeneratorOptions)) {
        // If no options were provided for the ValueChangeSoundGenerator, use a default where a sound will be produced
        // for every valid value set by this control.
        valueChangeSoundGeneratorOptions = {
          interThresholdDelta: initialOptions.delta,
          constrainValue: constrainValue
        };
      }
      initialOptions.soundGenerator = new ValueChangeSoundPlayer(numberRange, valueChangeSoundGeneratorOptions);
    } else if (initialOptions.soundGenerator === null) {
      initialOptions.soundGenerator = ValueChangeSoundPlayer.NO_SOUND;
    }

    // Merge all nested options in one block.
    const options = combineOptions({
      // Options propagated to ArrowButton
      arrowButtonOptions: {
        // Values chosen to match previous behavior, see https://github.com/phetsims/scenery-phet/issues/489.
        // touchAreaXDilation is 1/2 of its original value because touchArea is shifted.
        touchAreaXDilation: 3.5,
        touchAreaYDilation: 7,
        mouseAreaXDilation: 0,
        mouseAreaYDilation: 0,
        // If the value is within this amount of the respective min/max, it will be treated as if it was at that value
        // (for determining whether the arrow button is enabled).
        enabledEpsilon: 0,
        // callbacks
        leftStart: initialOptions.startCallback,
        // called when left arrow is pressed
        leftEnd: initialOptions.endCallback,
        // called when left arrow is released
        rightStart: initialOptions.startCallback,
        // called when right arrow is pressed
        rightEnd: initialOptions.endCallback,
        // called when right arrow is released

        // phet-io
        enabledPropertyOptions: {
          phetioReadOnly: true,
          phetioFeatured: false
        }
      },
      // Options propagated to HSlider
      sliderOptions: {
        startDrag: initialOptions.startCallback,
        // called when dragging starts on the slider
        endDrag: initialOptions.endCallback,
        // called when dragging ends on the slider

        // With the exception of startDrag and endDrag (use startCallback and endCallback respectively),
        // all HSlider options may be used. These are the ones that NumberControl overrides:
        majorTickLength: 20,
        minorTickStroke: 'rgba( 0, 0, 0, 0.3 )',
        // other slider options that are specific to NumberControl
        majorTicks: [],
        minorTickSpacing: 0,
        // zero indicates no minor ticks

        // constrain the slider value to the provided range and the same delta as the arrow buttons,
        // see https://github.com/phetsims/scenery-phet/issues/384
        constrainValue: constrainValue,
        soundGenerator: initialOptions.soundGenerator,
        // phet-io
        tandem: initialOptions.tandem.createTandem(NumberControl.SLIDER_TANDEM_NAME)
      },
      // Options propagated to NumberDisplay
      numberDisplayOptions: {
        textOptions: {
          font: new PhetFont(12),
          stringPropertyOptions: {
            phetioFeatured: true
          }
        },
        // phet-io
        tandem: initialOptions.tandem.createTandem('numberDisplay'),
        visiblePropertyOptions: {
          phetioFeatured: true
        }
      },
      // Options propagated to the title Text Node
      titleNodeOptions: {
        font: new PhetFont(12),
        maxWidth: null,
        // {null|number} maxWidth to use for title, to constrain width for i18n
        fill: 'black',
        tandem: initialOptions.tandem.createTandem('titleText')
      }
    }, initialOptions);

    // validate options
    assert && assert(!options.startDrag, 'use options.startCallback instead of options.startDrag');
    assert && assert(!options.endDrag, 'use options.endCallback instead of options.endDrag');
    assert && assert(!options.tagName, 'Provide accessibility through options.sliderOptions which will be applied to the NumberControl Node.');
    if (options.enabledRangeProperty) {
      options.sliderOptions.enabledRangeProperty = options.enabledRangeProperty;
    }

    // Arrow button pointer areas need to be asymmetrical, see https://github.com/phetsims/scenery-phet/issues/489.
    // Get the pointer area options related to ArrowButton so that we can handle pointer areas here.
    // And do not propagate those options to ArrowButton instances.
    const arrowButtonPointerAreaOptions = _.pick(options.arrowButtonOptions, POINTER_AREA_OPTION_NAMES);
    options.arrowButtonOptions = _.omit(options.arrowButtonOptions, POINTER_AREA_OPTION_NAMES);

    // pdom - for alternative input, the number control is accessed entirely through slider interaction and these
    // arrow buttons are not tab navigable
    assert && assert(options.arrowButtonOptions.tagName === undefined, 'NumberControl\'s accessible content is just the slider, do not set accessible content on the buttons. Instead ' + 'set a11y through options.sliderOptions.');
    options.arrowButtonOptions.tagName = null;

    // pdom - if we include arrow buttons, use a groupFocusHighlight to surround the NumberControl to make it clear
    // that it is a composite component and there is only one stop in the traversal order.
    this.groupFocusHighlight = options.includeArrowButtons;

    // Slider options for track (if not specified as trackNode)
    if (!options.sliderOptions.trackNode) {
      options.sliderOptions = combineOptions({
        trackSize: new Dimension2(180, 3)
      }, options.sliderOptions);
    }

    // Slider options for thumb (if n ot specified as thumbNode)
    if (!options.sliderOptions.thumbNode) {
      options.sliderOptions = combineOptions({
        thumbSize: new Dimension2(17, 34),
        thumbTouchAreaXDilation: 6
      }, options.sliderOptions);
    }
    assert && assert(!options.sliderOptions.hasOwnProperty('phetioType'), 'NumberControl sets phetioType');

    // slider options set by NumberControl, note this may not be the long term pattern, see https://github.com/phetsims/phet-info/issues/96
    options.sliderOptions = combineOptions({
      // pdom - by default, shiftKeyboardStep should most likely be the same as clicking the arrow buttons.
      shiftKeyboardStep: options.delta,
      // Make sure Slider gets created with the right IO Type
      phetioType: Slider.SliderIO
    }, options.sliderOptions);

    // highlight color for thumb defaults to a brighter version of the thumb color
    if (options.sliderOptions.thumbFill && !options.sliderOptions.thumbFillHighlighted) {
      this.thumbFillProperty = new PaintColorProperty(options.sliderOptions.thumbFill);

      // Reference to the DerivedProperty not needed, since we dispose what it listens to above.
      options.sliderOptions.thumbFillHighlighted = new DerivedProperty([this.thumbFillProperty], color => color.brighterColor());
    }
    const titleNode = new Text(title, options.titleNodeOptions);
    const numberDisplay = new NumberDisplay(numberProperty, numberRange, options.numberDisplayOptions);
    this.slider = new HSlider(numberProperty, numberRange, options.sliderOptions);

    // set below, see options.includeArrowButtons
    let decrementButton = null;
    let incrementButton = null;
    let arrowEnabledListener = null;
    if (options.includeArrowButtons) {
      decrementButton = new ArrowButton('left', () => {
        const oldValue = numberProperty.get();
        let newValue = numberProperty.get() - options.delta;
        newValue = Utils.roundToInterval(newValue, options.delta); // constrain to multiples of delta, see #384
        newValue = Math.max(newValue, getCurrentRange().min); // constrain to range
        numberProperty.set(newValue);
        options.soundGenerator.playSoundForValueChange(newValue, oldValue);
      }, combineOptions({
        soundPlayer: nullSoundPlayer,
        startCallback: options.arrowButtonOptions.leftStart,
        endCallback: options.arrowButtonOptions.leftEnd,
        tandem: options.tandem.createTandem('decrementButton')
      }, options.arrowButtonOptions));
      incrementButton = new ArrowButton('right', () => {
        const oldValue = numberProperty.get();
        let newValue = numberProperty.get() + options.delta;
        newValue = Utils.roundToInterval(newValue, options.delta); // constrain to multiples of delta, see #384
        newValue = Math.min(newValue, getCurrentRange().max); // constrain to range
        numberProperty.set(newValue);
        options.soundGenerator.playSoundForValueChange(newValue, oldValue);
      }, combineOptions({
        soundPlayer: nullSoundPlayer,
        startCallback: options.arrowButtonOptions.rightStart,
        endCallback: options.arrowButtonOptions.rightEnd,
        tandem: options.tandem.createTandem('incrementButton')
      }, options.arrowButtonOptions));

      // By default, scale the ArrowButtons to have the same height as the NumberDisplay, but ignoring
      // the NumberDisplay's maxWidth (if any)
      if (!arrowButtonScaleProvided) {
        // Remove the current button scaling so we can determine the desired final scale factor
        decrementButton.setScaleMagnitude(1);

        // Set the tweaker button height to match the height of the numberDisplay. Lengthy text can shrink a numberDisplay
        // with maxWidth--if we match the scaled height of the numberDisplay the arrow buttons would shrink too, as
        // depicted in https://github.com/phetsims/scenery-phet/issues/513#issuecomment-517897850
        // Instead, to keep the tweaker buttons a uniform and reasonable size, we match their height to the unscaled
        // height of the numberDisplay (ignores maxWidth and scale).
        const numberDisplayHeight = numberDisplay.localBounds.height;
        const arrowButtonsScale = numberDisplayHeight / decrementButton.height;
        decrementButton.setScaleMagnitude(arrowButtonsScale);
        incrementButton.setScaleMagnitude(arrowButtonsScale);
      }

      // arrow button touchAreas, asymmetrical, see https://github.com/phetsims/scenery-phet/issues/489
      decrementButton.touchArea = decrementButton.localBounds.dilatedXY(arrowButtonPointerAreaOptions.touchAreaXDilation, arrowButtonPointerAreaOptions.touchAreaYDilation).shiftedX(-arrowButtonPointerAreaOptions.touchAreaXDilation);
      incrementButton.touchArea = incrementButton.localBounds.dilatedXY(arrowButtonPointerAreaOptions.touchAreaXDilation, arrowButtonPointerAreaOptions.touchAreaYDilation).shiftedX(arrowButtonPointerAreaOptions.touchAreaXDilation);

      // arrow button mouseAreas, asymmetrical, see https://github.com/phetsims/scenery-phet/issues/489
      decrementButton.mouseArea = decrementButton.localBounds.dilatedXY(arrowButtonPointerAreaOptions.mouseAreaXDilation, arrowButtonPointerAreaOptions.mouseAreaYDilation).shiftedX(-arrowButtonPointerAreaOptions.mouseAreaXDilation);
      incrementButton.mouseArea = incrementButton.localBounds.dilatedXY(arrowButtonPointerAreaOptions.mouseAreaXDilation, arrowButtonPointerAreaOptions.mouseAreaYDilation).shiftedX(arrowButtonPointerAreaOptions.mouseAreaXDilation);

      // Disable the arrow buttons if the slider currently has focus
      arrowEnabledListener = () => {
        const value = numberProperty.value;
        assert && assert(options.arrowButtonOptions.enabledEpsilon !== undefined);
        decrementButton.enabled = value - options.arrowButtonOptions.enabledEpsilon > getCurrentRange().min && !this.slider.isFocused();
        incrementButton.enabled = value + options.arrowButtonOptions.enabledEpsilon < getCurrentRange().max && !this.slider.isFocused();
      };
      numberProperty.lazyLink(arrowEnabledListener);
      options.enabledRangeProperty && options.enabledRangeProperty.lazyLink(arrowEnabledListener);
      arrowEnabledListener();
      this.slider.addInputListener({
        focus: () => {
          decrementButton.enabled = false;
          incrementButton.enabled = false;
        },
        blur: () => arrowEnabledListener() // recompute if the arrow buttons should be enabled
      });
    }

    // major ticks for the slider
    const majorTicks = options.sliderOptions.majorTicks;
    assert && assert(majorTicks);
    for (let i = 0; i < majorTicks.length; i++) {
      this.slider.addMajorTick(majorTicks[i].value, majorTicks[i].label);
    }

    // minor ticks, exclude values where we already have major ticks
    assert && assert(options.sliderOptions.minorTickSpacing !== undefined);
    if (options.sliderOptions.minorTickSpacing > 0) {
      for (let minorTickValue = numberRange.min; minorTickValue <= numberRange.max;) {
        if (!_.find(majorTicks, majorTick => majorTick.value === minorTickValue)) {
          this.slider.addMinorTick(minorTickValue);
        }
        minorTickValue += options.sliderOptions.minorTickSpacing;
      }
    }
    options.children = [options.layoutFunction(titleNode, numberDisplay, this.slider, decrementButton, incrementButton)];
    this.mutate(options);
    this.numberDisplay = numberDisplay;
    this.disposeNumberControl = () => {
      titleNode.dispose(); // may be linked to a string Property
      numberDisplay.dispose();
      this.slider.dispose();
      this.thumbFillProperty && this.thumbFillProperty.dispose();

      // only defined if options.includeArrowButtons
      decrementButton && decrementButton.dispose();
      incrementButton && incrementButton.dispose();
      arrowEnabledListener && numberProperty.unlink(arrowEnabledListener);
      arrowEnabledListener && options.enabledRangeProperty && options.enabledRangeProperty.unlink(arrowEnabledListener);
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('scenery-phet', 'NumberControl', this);
  }

  /**
   * Redraws the NumberDisplay. This is useful when you have additional Properties that determine the format
   * of the displayed value.
   */
  redrawNumberDisplay() {
    this.numberDisplay.recomputeText();
  }
  dispose() {
    this.disposeNumberControl();
    super.dispose();
  }

  /**
   * Sets the numberFormatter for the NumberDisplay.
   */
  setNumberFormatter(numberFormatter) {
    this.numberDisplay.setNumberFormatter(numberFormatter);
  }

  /**
   * Creates a NumberControl with default tick marks for min and max values.
   */
  static withMinMaxTicks(label, property, range, providedOptions) {
    const options = optionize()({
      tickLabelFont: new PhetFont(12)
    }, providedOptions);
    options.sliderOptions = combineOptions({
      majorTicks: [{
        value: range.min,
        label: new Text(range.min, {
          font: options.tickLabelFont
        })
      }, {
        value: range.max,
        label: new Text(range.max, {
          font: options.tickLabelFont
        })
      }]
    }, options.sliderOptions);
    return new NumberControl(label, property, range, options);
  }

  /**
   * Creates one of the pre-defined layout functions that can be used for options.layoutFunction.
   * Arranges subcomponents like this:
   *
   *  title number
   *  < ------|------ >
   *
   */
  static createLayoutFunction1(providedOptions) {
    const options = optionize()({
      align: 'center',
      titleXSpacing: 5,
      arrowButtonsXSpacing: 15,
      ySpacing: 5
    }, providedOptions);
    return (titleNode, numberDisplay, slider, decrementButton, incrementButton) => {
      assert && assert(decrementButton, 'There is no decrementButton!');
      assert && assert(incrementButton, 'There is no incrementButton!');
      return new VBox({
        align: options.align,
        spacing: options.ySpacing,
        children: [new HBox({
          spacing: options.titleXSpacing,
          children: [titleNode, numberDisplay]
        }), new HBox({
          spacing: options.arrowButtonsXSpacing,
          resize: false,
          // prevent slider from causing a resize when thumb is at min or max
          children: [decrementButton, slider, incrementButton]
        })]
      });
    };
  }

  /**
   * Creates one of the pre-defined layout functions that can be used for options.layoutFunction.
   * Arranges subcomponents like this:
   *
   *  title < number >
   *  ------|------
   */
  static createLayoutFunction2(providedOptions) {
    const options = optionize()({
      align: 'center',
      xSpacing: 5,
      ySpacing: 5
    }, providedOptions);
    return (titleNode, numberDisplay, slider, decrementButton, incrementButton) => {
      assert && assert(decrementButton);
      assert && assert(incrementButton);
      return new VBox({
        align: options.align,
        spacing: options.ySpacing,
        resize: false,
        // prevent slider from causing a resize when thumb is at min or max
        children: [new HBox({
          spacing: options.xSpacing,
          children: [titleNode, decrementButton, numberDisplay, incrementButton]
        }), slider]
      });
    };
  }

  /**
   * Creates one of the pre-defined layout functions that can be used for options.layoutFunction.
   * Arranges subcomponents like this:
   *
   *  title
   *  < number >
   *  -------|-------
   */
  static createLayoutFunction3(providedOptions) {
    const options = optionize()({
      alignTitle: 'center',
      alignNumber: 'center',
      titleLeftIndent: 0,
      xSpacing: 5,
      ySpacing: 5
    }, providedOptions);
    return (titleNode, numberDisplay, slider, decrementButton, incrementButton) => {
      assert && assert(decrementButton);
      assert && assert(incrementButton);
      const titleAndContentVBox = new VBox({
        spacing: options.ySpacing,
        resize: false,
        // prevent slider from causing a resize when thumb is at min or max
        align: options.alignTitle,
        children: [new AlignBox(titleNode, {
          leftMargin: options.titleLeftIndent
        }), new VBox({
          spacing: options.ySpacing,
          resize: false,
          // prevent slider from causing a resize when thumb is at min or max
          align: options.alignNumber,
          children: [new HBox({
            spacing: options.xSpacing,
            children: [decrementButton, numberDisplay, incrementButton]
          }), slider]
        })]
      });

      // When the text of the title changes recompute the alignment between the title and content
      titleNode.boundsProperty.lazyLink(() => {
        titleAndContentVBox.updateLayout();
      });
      return titleAndContentVBox;
    };
  }

  /**
   * Creates one of the pre-defined layout functions that can be used for options.layoutFunction.
   * Like createLayoutFunction1, but the title and value go all the way to the edges.
   */
  static createLayoutFunction4(providedOptions) {
    const options = optionize()({
      // adds additional horizontal space between title and NumberDisplay
      sliderPadding: 0,
      // vertical spacing between slider and title/NumberDisplay
      verticalSpacing: 5,
      // spacing between slider and arrow buttons
      arrowButtonSpacing: 5,
      hasReadoutProperty: null,
      layoutInvisibleButtons: false,
      createBottomContent: null // Supports Pendulum Lab's questionText where a question is substituted for the slider
    }, providedOptions);
    return (titleNode, numberDisplay, slider, decrementButton, incrementButton) => {
      const includeArrowButtons = !!decrementButton; // if there aren't arrow buttons, then exclude them
      const bottomBox = new HBox({
        spacing: options.arrowButtonSpacing,
        children: !includeArrowButtons ? [slider] : [decrementButton, slider, incrementButton],
        excludeInvisibleChildrenFromBounds: !options.layoutInvisibleButtons
      });

      // Dynamic layout supported
      return new VBox({
        spacing: options.verticalSpacing,
        children: [new HBox({
          spacing: options.sliderPadding,
          children: [titleNode, new Node({
            children: [numberDisplay],
            visibleProperty: options.hasReadoutProperty || null,
            excludeInvisibleChildrenFromBounds: true
          })],
          layoutOptions: {
            stretch: true
          }
        }), new Node({
          children: [options.createBottomContent ? options.createBottomContent(bottomBox) : bottomBox],
          layoutOptions: {
            xMargin: options.sliderPadding
          }
        })]
      });
    };
  }
  static NumberControlIO = new IOType('NumberControlIO', {
    valueType: NumberControl,
    documentation: 'A number control with a title, slider and +/- buttons',
    supertype: Node.NodeIO
  });
  static SLIDER_TANDEM_NAME = 'slider';
}

/**
 * Validate all of the callback related options. There are two types of callbacks. The "start/endCallback" pair
 * are passed into all components in the NumberControl. The second set are start/end callbacks for each individual
 * component. This was added to support multitouch in Rutherford Scattering as part of
 * https://github.com/phetsims/rutherford-scattering/issues/128.
 *
 * This function mutates the options by initializing general callbacks from null (in the extend call) to a no-op
 * function.
 *
 * Only general or specific callbacks are allowed, but not both.
 */
function validateCallbacks(options) {
  const normalCallbacksPresent = !!(options.startCallback || options.endCallback);
  let arrowCallbacksPresent = false;
  let sliderCallbacksPresent = false;
  if (options.arrowButtonOptions) {
    arrowCallbacksPresent = specificCallbackKeysInOptions(options.arrowButtonOptions);
  }
  if (options.sliderOptions) {
    sliderCallbacksPresent = specificCallbackKeysInOptions(options.sliderOptions);
  }
  const specificCallbacksPresent = arrowCallbacksPresent || sliderCallbacksPresent;

  // only general or component specific callbacks are supported
  assert && assert(!(normalCallbacksPresent && specificCallbacksPresent), 'Use general callbacks like "startCallback" or specific callbacks like "sliderOptions.startDrag" but not both.');
}

/**
 * Check for an intersection between the array of callback option keys and those
 * passed in the options object. These callback options are only the specific component callbacks, not the general
 * start/end that are called for every component's interaction
 */
function specificCallbackKeysInOptions(options) {
  const optionKeys = Object.keys(options);
  const intersection = SPECIFIC_COMPONENT_CALLBACK_OPTIONS.filter(x => _.includes(optionKeys, x));
  return intersection.length > 0;
}
sceneryPhet.register('NumberControl', NumberControl);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJEaW1lbnNpb24yIiwiUmFuZ2UiLCJVdGlscyIsIkluc3RhbmNlUmVnaXN0cnkiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIkFsaWduQm94IiwiSEJveCIsIk5vZGUiLCJQYWludENvbG9yUHJvcGVydHkiLCJUZXh0IiwiVkJveCIsIkFycm93QnV0dG9uIiwiSFNsaWRlciIsIlNsaWRlciIsIm51bGxTb3VuZFBsYXllciIsIlZhbHVlQ2hhbmdlU291bmRQbGF5ZXIiLCJUYW5kZW0iLCJJT1R5cGUiLCJOdW1iZXJEaXNwbGF5IiwiUGhldEZvbnQiLCJzY2VuZXJ5UGhldCIsIlNQRUNJRklDX0NPTVBPTkVOVF9DQUxMQkFDS19PUFRJT05TIiwiUE9JTlRFUl9BUkVBX09QVElPTl9OQU1FUyIsIkRFRkFVTFRfU09VTkQiLCJOdW1iZXJDb250cm9sIiwiY29uc3RydWN0b3IiLCJ0aXRsZSIsIm51bWJlclByb3BlcnR5IiwibnVtYmVyUmFuZ2UiLCJwcm92aWRlZE9wdGlvbnMiLCJ2YWxpZGF0ZUNhbGxiYWNrcyIsImluaXRpYWxPcHRpb25zIiwibnVtYmVyRGlzcGxheU9wdGlvbnMiLCJzbGlkZXJPcHRpb25zIiwiYXJyb3dCdXR0b25PcHRpb25zIiwidGl0bGVOb2RlT3B0aW9ucyIsInN0YXJ0Q2FsbGJhY2siLCJfIiwibm9vcCIsImVuZENhbGxiYWNrIiwiZGVsdGEiLCJkaXNhYmxlZE9wYWNpdHkiLCJsYXlvdXRGdW5jdGlvbiIsImNyZWF0ZUxheW91dEZ1bmN0aW9uMSIsImluY2x1ZGVBcnJvd0J1dHRvbnMiLCJzb3VuZEdlbmVyYXRvciIsInZhbHVlQ2hhbmdlU291bmRHZW5lcmF0b3JPcHRpb25zIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ0YW5kZW1OYW1lU3VmZml4IiwicGhldGlvVHlwZSIsIk51bWJlckNvbnRyb2xJTyIsInBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsInZpc2libGVQcm9wZXJ0eU9wdGlvbnMiLCJwaGV0aW9GZWF0dXJlZCIsImFzc2VydCIsImdyb3VwRm9jdXNIaWdobGlnaHQiLCJ1bmRlZmluZWQiLCJhcnJvd0J1dHRvblNjYWxlUHJvdmlkZWQiLCJoYXNPd25Qcm9wZXJ0eSIsImdldEN1cnJlbnRSYW5nZSIsIm9wdGlvbnMiLCJlbmFibGVkUmFuZ2VQcm9wZXJ0eSIsInZhbHVlIiwiY29uc3RyYWluVmFsdWUiLCJuZXdWYWx1ZSIsInJvdW5kVG9JbnRlcnZhbCIsImlzRW1wdHkiLCJpbnRlclRocmVzaG9sZERlbHRhIiwiTk9fU09VTkQiLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJtb3VzZUFyZWFYRGlsYXRpb24iLCJtb3VzZUFyZWFZRGlsYXRpb24iLCJlbmFibGVkRXBzaWxvbiIsImxlZnRTdGFydCIsImxlZnRFbmQiLCJyaWdodFN0YXJ0IiwicmlnaHRFbmQiLCJlbmFibGVkUHJvcGVydHlPcHRpb25zIiwicGhldGlvUmVhZE9ubHkiLCJzdGFydERyYWciLCJlbmREcmFnIiwibWFqb3JUaWNrTGVuZ3RoIiwibWlub3JUaWNrU3Ryb2tlIiwibWFqb3JUaWNrcyIsIm1pbm9yVGlja1NwYWNpbmciLCJjcmVhdGVUYW5kZW0iLCJTTElERVJfVEFOREVNX05BTUUiLCJ0ZXh0T3B0aW9ucyIsImZvbnQiLCJzdHJpbmdQcm9wZXJ0eU9wdGlvbnMiLCJtYXhXaWR0aCIsImZpbGwiLCJ0YWdOYW1lIiwiYXJyb3dCdXR0b25Qb2ludGVyQXJlYU9wdGlvbnMiLCJwaWNrIiwib21pdCIsInRyYWNrTm9kZSIsInRyYWNrU2l6ZSIsInRodW1iTm9kZSIsInRodW1iU2l6ZSIsInRodW1iVG91Y2hBcmVhWERpbGF0aW9uIiwic2hpZnRLZXlib2FyZFN0ZXAiLCJTbGlkZXJJTyIsInRodW1iRmlsbCIsInRodW1iRmlsbEhpZ2hsaWdodGVkIiwidGh1bWJGaWxsUHJvcGVydHkiLCJjb2xvciIsImJyaWdodGVyQ29sb3IiLCJ0aXRsZU5vZGUiLCJudW1iZXJEaXNwbGF5Iiwic2xpZGVyIiwiZGVjcmVtZW50QnV0dG9uIiwiaW5jcmVtZW50QnV0dG9uIiwiYXJyb3dFbmFibGVkTGlzdGVuZXIiLCJvbGRWYWx1ZSIsImdldCIsIk1hdGgiLCJtYXgiLCJtaW4iLCJzZXQiLCJwbGF5U291bmRGb3JWYWx1ZUNoYW5nZSIsInNvdW5kUGxheWVyIiwic2V0U2NhbGVNYWduaXR1ZGUiLCJudW1iZXJEaXNwbGF5SGVpZ2h0IiwibG9jYWxCb3VuZHMiLCJoZWlnaHQiLCJhcnJvd0J1dHRvbnNTY2FsZSIsInRvdWNoQXJlYSIsImRpbGF0ZWRYWSIsInNoaWZ0ZWRYIiwibW91c2VBcmVhIiwiZW5hYmxlZCIsImlzRm9jdXNlZCIsImxhenlMaW5rIiwiYWRkSW5wdXRMaXN0ZW5lciIsImZvY3VzIiwiYmx1ciIsImkiLCJsZW5ndGgiLCJhZGRNYWpvclRpY2siLCJsYWJlbCIsIm1pbm9yVGlja1ZhbHVlIiwiZmluZCIsIm1ham9yVGljayIsImFkZE1pbm9yVGljayIsImNoaWxkcmVuIiwibXV0YXRlIiwiZGlzcG9zZU51bWJlckNvbnRyb2wiLCJkaXNwb3NlIiwidW5saW5rIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJyZWRyYXdOdW1iZXJEaXNwbGF5IiwicmVjb21wdXRlVGV4dCIsInNldE51bWJlckZvcm1hdHRlciIsIm51bWJlckZvcm1hdHRlciIsIndpdGhNaW5NYXhUaWNrcyIsInByb3BlcnR5IiwicmFuZ2UiLCJ0aWNrTGFiZWxGb250IiwiYWxpZ24iLCJ0aXRsZVhTcGFjaW5nIiwiYXJyb3dCdXR0b25zWFNwYWNpbmciLCJ5U3BhY2luZyIsInNwYWNpbmciLCJyZXNpemUiLCJjcmVhdGVMYXlvdXRGdW5jdGlvbjIiLCJ4U3BhY2luZyIsImNyZWF0ZUxheW91dEZ1bmN0aW9uMyIsImFsaWduVGl0bGUiLCJhbGlnbk51bWJlciIsInRpdGxlTGVmdEluZGVudCIsInRpdGxlQW5kQ29udGVudFZCb3giLCJsZWZ0TWFyZ2luIiwiYm91bmRzUHJvcGVydHkiLCJ1cGRhdGVMYXlvdXQiLCJjcmVhdGVMYXlvdXRGdW5jdGlvbjQiLCJzbGlkZXJQYWRkaW5nIiwidmVydGljYWxTcGFjaW5nIiwiYXJyb3dCdXR0b25TcGFjaW5nIiwiaGFzUmVhZG91dFByb3BlcnR5IiwibGF5b3V0SW52aXNpYmxlQnV0dG9ucyIsImNyZWF0ZUJvdHRvbUNvbnRlbnQiLCJib3R0b21Cb3giLCJleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIiwidmlzaWJsZVByb3BlcnR5IiwibGF5b3V0T3B0aW9ucyIsInN0cmV0Y2giLCJ4TWFyZ2luIiwidmFsdWVUeXBlIiwiZG9jdW1lbnRhdGlvbiIsInN1cGVydHlwZSIsIk5vZGVJTyIsIm5vcm1hbENhbGxiYWNrc1ByZXNlbnQiLCJhcnJvd0NhbGxiYWNrc1ByZXNlbnQiLCJzbGlkZXJDYWxsYmFja3NQcmVzZW50Iiwic3BlY2lmaWNDYWxsYmFja0tleXNJbk9wdGlvbnMiLCJzcGVjaWZpY0NhbGxiYWNrc1ByZXNlbnQiLCJvcHRpb25LZXlzIiwiT2JqZWN0Iiwia2V5cyIsImludGVyc2VjdGlvbiIsImZpbHRlciIsIngiLCJpbmNsdWRlcyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTnVtYmVyQ29udHJvbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb250cm9sIGZvciBjaGFuZ2luZyBhIFByb3BlcnR5IG9mIHR5cGUge251bWJlcn0uXHJcbiAqIENvbnNpc3RzIG9mIGEgbGFiZWxlZCB2YWx1ZSwgc2xpZGVyIGFuZCBhcnJvdyBidXR0b25zLlxyXG4gKlxyXG4gKiBOdW1iZXIgQ29udHJvbCBwcm92aWRlcyBhY2Nlc3NpYmxlIGNvbnRlbnQgZXhjbHVzaXZlbHkgdGhyb3VnaCB0aGUgc2xpZGVyLCBwbGVhc2UgcGFzcyBhY2Nlc3NpYmlsaXR5IHJlbGF0ZWRcclxuICogY3VzdG9taXphdGlvbnMgdGhyb3VnaCBvcHRpb25zIHRvIHRoZSBzbGlkZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBMaW5rYWJsZVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvTGlua2FibGVQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XHJcbmltcG9ydCBQaWNrT3B0aW9uYWwgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tPcHRpb25hbC5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IHsgQWxpZ25Cb3gsIEZvbnQsIEhCb3gsIE5vZGUsIE5vZGVPcHRpb25zLCBQYWludENvbG9yUHJvcGVydHksIFRleHQsIFRleHRPcHRpb25zLCBWQm94IH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEFycm93QnV0dG9uLCB7IEFycm93QnV0dG9uT3B0aW9ucyB9IGZyb20gJy4uLy4uL3N1bi9qcy9idXR0b25zL0Fycm93QnV0dG9uLmpzJztcclxuaW1wb3J0IEhTbGlkZXIgZnJvbSAnLi4vLi4vc3VuL2pzL0hTbGlkZXIuanMnO1xyXG5pbXBvcnQgU2xpZGVyLCB7IFNsaWRlck9wdGlvbnMgfSBmcm9tICcuLi8uLi9zdW4vanMvU2xpZGVyLmpzJztcclxuaW1wb3J0IG51bGxTb3VuZFBsYXllciBmcm9tICcuLi8uLi90YW1iby9qcy9zaGFyZWQtc291bmQtcGxheWVycy9udWxsU291bmRQbGF5ZXIuanMnO1xyXG5pbXBvcnQgVmFsdWVDaGFuZ2VTb3VuZFBsYXllciwgeyBWYWx1ZUNoYW5nZVNvdW5kUGxheWVyT3B0aW9ucyB9IGZyb20gJy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvVmFsdWVDaGFuZ2VTb3VuZFBsYXllci5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBOdW1iZXJEaXNwbGF5LCB7IE51bWJlckRpc3BsYXlPcHRpb25zIH0gZnJvbSAnLi9OdW1iZXJEaXNwbGF5LmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4vUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgU1BFQ0lGSUNfQ09NUE9ORU5UX0NBTExCQUNLX09QVElPTlMgPSBbXHJcbiAgJ3N0YXJ0RHJhZycsXHJcbiAgJ2VuZERyYWcnLFxyXG4gICdsZWZ0U3RhcnQnLFxyXG4gICdsZWZ0RW5kJyxcclxuICAncmlnaHRTdGFydCcsXHJcbiAgJ3JpZ2h0RW5kJ1xyXG5dO1xyXG5jb25zdCBQT0lOVEVSX0FSRUFfT1BUSU9OX05BTUVTID0gWyAndG91Y2hBcmVhWERpbGF0aW9uJywgJ3RvdWNoQXJlYVlEaWxhdGlvbicsICdtb3VzZUFyZWFYRGlsYXRpb24nLCAnbW91c2VBcmVhWURpbGF0aW9uJyBdIGFzIGNvbnN0O1xyXG5cclxuLy8gVGhpcyBpcyBhIG1hcmtlciB0byBpbmRpY2F0ZSB0aGF0IHdlIHNob3VsZCBjcmVhdGUgdGhlIGFjdHVhbCBkZWZhdWx0IHNvdW5kIHBsYXllci5cclxuY29uc3QgREVGQVVMVF9TT1VORCA9IG5ldyBWYWx1ZUNoYW5nZVNvdW5kUGxheWVyKCBuZXcgUmFuZ2UoIDAsIDEgKSApO1xyXG5cclxuZXhwb3J0IHR5cGUgTGF5b3V0RnVuY3Rpb24gPSAoIHRpdGxlTm9kZTogTm9kZSwgbnVtYmVyRGlzcGxheTogTnVtYmVyRGlzcGxheSwgc2xpZGVyOiBTbGlkZXIsIGRlY3JlbWVudEJ1dHRvbjogQXJyb3dCdXR0b24gfCBudWxsLCBpbmNyZW1lbnRCdXR0b246IEFycm93QnV0dG9uIHwgbnVsbCApID0+IE5vZGU7XHJcblxyXG4vLyBkZXNjcmlwdGlvbiBvZiBhIG1ham9yIHRpY2tcclxudHlwZSBOdW1iZXJDb250cm9sTWFqb3JUaWNrID0ge1xyXG4gIHZhbHVlOiBudW1iZXI7IC8vIHZhbHVlIHRoYXQgdGhlIHRpY2sgY29ycmVzcG9uZHMgdG9cclxuICBsYWJlbD86IE5vZGU7IC8vIG9wdGlvbmFsIGxhYmVsIHRoYXQgYXBwZWFycyBhdCB0aGUgdGljayBtYXJrXHJcbn07XHJcblxyXG4vLyBvdGhlciBzbGlkZXIgb3B0aW9ucyB0aGF0IGFyZSBzcGVjaWZpYyB0byBOdW1iZXJDb250cm9sXHJcbmV4cG9ydCB0eXBlIE51bWJlckNvbnRyb2xTbGlkZXJPcHRpb25zID0gU3RyaWN0T21pdDxTbGlkZXJPcHRpb25zLCAnZW5hYmxlZFJhbmdlUHJvcGVydHknPiAmIHtcclxuXHJcbiAgLy8gZGVzY3JpcHRpb24gb2YgbWFqb3IgdGlja3NcclxuICBtYWpvclRpY2tzPzogTnVtYmVyQ29udHJvbE1ham9yVGlja1tdO1xyXG5cclxuICAvLyB6ZXJvIGluZGljYXRlcyBubyBtaW5vciB0aWNrc1xyXG4gIG1pbm9yVGlja1NwYWNpbmc/OiBudW1iZXI7XHJcbn07XHJcblxyXG50eXBlIFdpdGhNaW5NYXhTZWxmT3B0aW9ucyA9IHtcclxuICB0aWNrTGFiZWxGb250PzogRm9udDtcclxufTtcclxuZXhwb3J0IHR5cGUgV2l0aE1pbk1heE9wdGlvbnMgPSBOdW1iZXJDb250cm9sT3B0aW9ucyAmIFdpdGhNaW5NYXhTZWxmT3B0aW9ucztcclxuXHJcbmV4cG9ydCB0eXBlIE51bWJlckNvbnRyb2xMYXlvdXRGdW5jdGlvbjFPcHRpb25zID0ge1xyXG4gIC8vIGhvcml6b250YWwgYWxpZ25tZW50IG9mIHJvd3MsICdsZWZ0J3wncmlnaHQnfCdjZW50ZXInXHJcbiAgYWxpZ24/OiAnY2VudGVyJyB8ICdsZWZ0JyB8ICdyaWdodCc7XHJcblxyXG4gIC8vIGhvcml6b250YWwgc3BhY2luZyBiZXR3ZWVuIHRpdGxlIGFuZCBudW1iZXJcclxuICB0aXRsZVhTcGFjaW5nPzogbnVtYmVyO1xyXG5cclxuICAvLyBob3Jpem9udGFsIHNwYWNpbmcgYmV0d2VlbiBhcnJvdyBidXR0b25zIGFuZCBzbGlkZXJcclxuICBhcnJvd0J1dHRvbnNYU3BhY2luZz86IG51bWJlcjtcclxuXHJcbiAgLy8gdmVydGljYWwgc3BhY2luZyBiZXR3ZWVuIHJvd3NcclxuICB5U3BhY2luZz86IG51bWJlcjtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIE51bWJlckNvbnRyb2xMYXlvdXRGdW5jdGlvbjJPcHRpb25zID0ge1xyXG4gIC8vIGhvcml6b250YWwgYWxpZ25tZW50IG9mIHJvd3MsICdsZWZ0J3wncmlnaHQnfCdjZW50ZXInXHJcbiAgYWxpZ24/OiAnY2VudGVyJyB8ICdsZWZ0JyB8ICdyaWdodCc7XHJcblxyXG4gIC8vIGhvcml6b250YWwgc3BhY2luZyBpbiB0b3Agcm93XHJcbiAgeFNwYWNpbmc/OiBudW1iZXI7XHJcblxyXG4gIC8vIHZlcnRpY2FsIHNwYWNpbmcgYmV0d2VlbiByb3dzXHJcbiAgeVNwYWNpbmc/OiBudW1iZXI7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBOdW1iZXJDb250cm9sTGF5b3V0RnVuY3Rpb24zT3B0aW9ucyA9IHtcclxuICAvLyBob3Jpem9udGFsIGFsaWdubWVudCBvZiB0aXRsZSwgcmVsYXRpdmUgdG8gc2xpZGVyLCAnbGVmdCd8J3JpZ2h0J3wnY2VudGVyJ1xyXG4gIGFsaWduVGl0bGU/OiAnY2VudGVyJyB8ICdsZWZ0JyB8ICdyaWdodCc7XHJcblxyXG4gIC8vIGhvcml6b250YWwgYWxpZ25tZW50IG9mIG51bWJlciBkaXNwbGF5LCByZWxhdGl2ZSB0byBzbGlkZXIsICdsZWZ0J3wncmlnaHQnfCdjZW50ZXInXHJcbiAgYWxpZ25OdW1iZXI/OiAnY2VudGVyJyB8ICdsZWZ0JyB8ICdyaWdodCc7XHJcblxyXG4gIC8vIGlmIHByb3ZpZGVkLCBpbmRlbnQgdGhlIHRpdGxlIG9uIHRoZSBsZWZ0IHRvIHB1c2ggdGhlIHRpdGxlIHRvIHRoZSByaWdodFxyXG4gIHRpdGxlTGVmdEluZGVudD86IG51bWJlcjtcclxuXHJcbiAgLy8gaG9yaXpvbnRhbCBzcGFjaW5nIGJldHdlZW4gYXJyb3cgYnV0dG9ucyBhbmQgc2xpZGVyXHJcbiAgeFNwYWNpbmc/OiBudW1iZXI7XHJcblxyXG4gIC8vIHZlcnRpY2FsIHNwYWNpbmcgYmV0d2VlbiByb3dzXHJcbiAgeVNwYWNpbmc/OiBudW1iZXI7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBOdW1iZXJDb250cm9sTGF5b3V0RnVuY3Rpb240T3B0aW9ucyA9IHtcclxuICAvLyBhZGRzIGFkZGl0aW9uYWwgaG9yaXpvbnRhbCBzcGFjZSBiZXR3ZWVuIHRpdGxlIGFuZCBOdW1iZXJEaXNwbGF5XHJcbiAgc2xpZGVyUGFkZGluZz86IG51bWJlcjtcclxuXHJcbiAgLy8gdmVydGljYWwgc3BhY2luZyBiZXR3ZWVuIHNsaWRlciBhbmQgdGl0bGUvTnVtYmVyRGlzcGxheVxyXG4gIHZlcnRpY2FsU3BhY2luZz86IG51bWJlcjtcclxuXHJcbiAgLy8gc3BhY2luZyBiZXR3ZWVuIHNsaWRlciBhbmQgYXJyb3cgYnV0dG9uc1xyXG4gIGFycm93QnV0dG9uU3BhY2luZz86IG51bWJlcjtcclxuXHJcbiAgaGFzUmVhZG91dFByb3BlcnR5PzogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4gfCBudWxsO1xyXG5cclxuICAvLyBTdXBwb3J0cyBQZW5kdWx1bSBMYWIncyBxdWVzdGlvblRleHQgd2hlcmUgYSBxdWVzdGlvbiBpcyBzdWJzdGl0dXRlZCBmb3IgdGhlIHNsaWRlclxyXG4gIGNyZWF0ZUJvdHRvbUNvbnRlbnQ/OiAoICggYm94OiBIQm94ICkgPT4gTm9kZSApIHwgbnVsbDtcclxuXHJcbiAgLy8gV2hldGhlciBpbnZpc2libGUgaW5jcmVtZW50L2RlY3JlbWVudCBidXR0b25zIChvciB0aGUgc2xpZGVyIGl0c2VsZikgc2hvdWxkIGJlIGxhaWQgb3V0IGFzIGlmIHRoZXkgd2VyZSB0aGVyZVxyXG4gIGxheW91dEludmlzaWJsZUJ1dHRvbnM/OiBib29sZWFuO1xyXG59O1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICAvLyBjYWxsZWQgd2hlbiBpbnRlcmFjdGlvbiBiZWdpbnMsIGRlZmF1bHQgdmFsdWUgc2V0IGluIHZhbGlkYXRlQ2FsbGJhY2tzKClcclxuICBzdGFydENhbGxiYWNrPzogKCkgPT4gdm9pZDtcclxuXHJcbiAgLy8gY2FsbGVkIHdoZW4gaW50ZXJhY3Rpb24gZW5kcywgZGVmYXVsdCB2YWx1ZSBzZXQgaW4gdmFsaWRhdGVDYWxsYmFja3MoKVxyXG4gIGVuZENhbGxiYWNrPzogKCkgPT4gdm9pZDtcclxuXHJcbiAgZGVsdGE/OiBudW1iZXI7XHJcblxyXG4gIC8vIG9wYWNpdHkgdXNlZCB0byBtYWtlIHRoZSBjb250cm9sIGxvb2sgZGlzYWJsZWRcclxuICBkaXNhYmxlZE9wYWNpdHk/OiBudW1iZXI7XHJcblxyXG4gIC8vIElmIHNldCB0byB0cnVlLCB0aGVuIGluY3JlbWVudC9kZWNyZW1lbnQgYXJyb3cgYnV0dG9ucyB3aWxsIGJlIGFkZGVkIHRvIHRoZSBOdW1iZXJDb250cm9sXHJcbiAgaW5jbHVkZUFycm93QnV0dG9ucz86IGJvb2xlYW47XHJcblxyXG4gIC8vIFN1YmNvbXBvbmVudCBvcHRpb25zIG9iamVjdHNcclxuICBudW1iZXJEaXNwbGF5T3B0aW9ucz86IE51bWJlckRpc3BsYXlPcHRpb25zO1xyXG4gIHNsaWRlck9wdGlvbnM/OiBOdW1iZXJDb250cm9sU2xpZGVyT3B0aW9ucztcclxuICBhcnJvd0J1dHRvbk9wdGlvbnM/OiBBcnJvd0J1dHRvbk9wdGlvbnMgJiB7XHJcbiAgICAvLyBXZSBzdHVmZmVkIGVuYWJsZWRFcHNpbG9uIGhlcmVcclxuICAgIGVuYWJsZWRFcHNpbG9uPzogbnVtYmVyO1xyXG5cclxuICAgIGxlZnRTdGFydD86ICgpID0+IHZvaWQ7XHJcbiAgICBsZWZ0RW5kPzogKCBvdmVyOiBib29sZWFuICkgPT4gdm9pZDtcclxuXHJcbiAgICByaWdodFN0YXJ0PzogKCkgPT4gdm9pZDtcclxuICAgIHJpZ2h0RW5kPzogKCBvdmVyOiBib29sZWFuICkgPT4gdm9pZDtcclxuICB9O1xyXG4gIHRpdGxlTm9kZU9wdGlvbnM/OiBUZXh0T3B0aW9ucztcclxuXHJcbiAgLy8gSWYgcHJvdmlkZWQsIHRoaXMgd2lsbCBiZSBwcm92aWRlZCB0byB0aGUgc2xpZGVyIGFuZCBhcnJvdyBidXR0b25zIGluIG9yZGVyIHRvXHJcbiAgLy8gY29uc3RyYWluIHRoZSByYW5nZSBvZiBhY3R1YWwgdmFsdWVzIHRvIHdpdGhpbiB0aGlzIHJhbmdlLlxyXG4gIGVuYWJsZWRSYW5nZVByb3BlcnR5PzogU2xpZGVyT3B0aW9uc1sgJ2VuYWJsZWRSYW5nZVByb3BlcnR5JyBdO1xyXG5cclxuICAvLyBUaGlzIGlzIHVzZWQgdG8gZ2VuZXJhdGUgc291bmRzIGFzIHRoZSB2YWx1ZSBvZiB0aGUgbnVtYmVyIGlzIGNoYW5nZWQgdXNpbmcgdGhlIHNsaWRlciBvciB0aGUgYnV0dG9ucy4gIElmIG5vdFxyXG4gIC8vIHByb3ZpZGVkLCBhIGRlZmF1bHQgc291bmQgZ2VuZXJhdG9yIHdpbGwgYmUgY3JlYXRlZC4gSWYgc2V0IHRvIG51bGwsIHRoZSBudW1iZXIgY29udHJvbCB3aWxsIGdlbmVyYXRlIG5vIHNvdW5kLlxyXG4gIHNvdW5kR2VuZXJhdG9yPzogVmFsdWVDaGFuZ2VTb3VuZFBsYXllciB8IG51bGw7XHJcblxyXG4gIC8vIE9wdGlvbnMgZm9yIHRoZSBkZWZhdWx0IHNvdW5kIGdlbmVyYXRvci4gIFRoZXNlIHNob3VsZCBvbmx5IGJlIHByb3ZpZGVkIHdoZW4gTk9UIHByb3ZpZGluZyBhIGN1c3RvbSBzb3VuZCBwbGF5ZXIuXHJcbiAgdmFsdWVDaGFuZ2VTb3VuZEdlbmVyYXRvck9wdGlvbnM/OiBWYWx1ZUNoYW5nZVNvdW5kUGxheWVyT3B0aW9ucztcclxuXHJcbiAgLy8gQSB7ZnVuY3Rpb259IHRoYXQgaGFuZGxlcyBsYXlvdXQgb2Ygc3ViY29tcG9uZW50cy5cclxuICAvLyBJdCBoYXMgc2lnbmF0dXJlIGZ1bmN0aW9uKCB0aXRsZU5vZGUsIG51bWJlckRpc3BsYXksIHNsaWRlciwgZGVjcmVtZW50QnV0dG9uLCBpbmNyZW1lbnRCdXR0b24gKVxyXG4gIC8vIGFuZCByZXR1cm5zIGEgTm9kZS4gSWYgeW91IHdhbnQgdG8gY3VzdG9taXplIHRoZSBsYXlvdXQsIHVzZSBvbmUgb2YgdGhlIHByZWRlZmluZWQgY3JlYXRvcnNcclxuICAvLyAoc2VlIGNyZWF0ZUxheW91dEZ1bmN0aW9uKikgb3IgY3JlYXRlIHlvdXIgb3duIGZ1bmN0aW9uLiBBcnJvdyBidXR0b25zIHdpbGwgYmUgbnVsbCBpZiBgaW5jbHVkZUFycm93QnV0dG9uczpmYWxzZWBcclxuICBsYXlvdXRGdW5jdGlvbj86IExheW91dEZ1bmN0aW9uO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgTnVtYmVyQ29udHJvbE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8Tm9kZU9wdGlvbnMsICdjaGlsZHJlbic+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTnVtYmVyQ29udHJvbCBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgc2xpZGVyOiBIU2xpZGVyOyAvLyBmb3IgYTExeSBBUElcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSB0aHVtYkZpbGxQcm9wZXJ0eT86IFBhaW50Q29sb3JQcm9wZXJ0eTtcclxuICBwcml2YXRlIHJlYWRvbmx5IG51bWJlckRpc3BsYXk6IE51bWJlckRpc3BsYXk7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlTnVtYmVyQ29udHJvbDogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0aXRsZTogc3RyaW5nIHwgVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiwgbnVtYmVyUHJvcGVydHk6IExpbmthYmxlUHJvcGVydHk8bnVtYmVyPiwgbnVtYmVyUmFuZ2U6IFJhbmdlLCBwcm92aWRlZE9wdGlvbnM/OiBOdW1iZXJDb250cm9sT3B0aW9ucyApIHtcclxuXHJcbiAgICAvLyBNYWtlIHN1cmUgdGhhdCBnZW5lcmFsIGNhbGxiYWNrcyAoZm9yIGFsbCBjb21wb25lbnRzKSBhbmQgc3BlY2lmaWMgY2FsbGJhY2tzIChmb3IgYSBzcGVjaWZpYyBjb21wb25lbnQpIGFyZW4ndFxyXG4gICAgLy8gdXNlZCBpbiB0YW5kZW0uIFRoaXMgbXVzdCBiZSBjYWxsZWQgYmVmb3JlIGRlZmF1bHRzIGFyZSBzZXQuXHJcbiAgICB2YWxpZGF0ZUNhbGxiYWNrcyggcHJvdmlkZWRPcHRpb25zIHx8IHt9ICk7XHJcblxyXG4gICAgLy8gT21pdCBlbmFibGVkUmFuZ2VQcm9wZXJ0eSBmcm9tIHRvcC1sZXZlbCwgc28gdGhhdCB3ZSBkb24ndCBuZWVkIHRvIHByb3ZpZGUgYSBkZWZhdWx0LlxyXG4gICAgLy8gVGhlbiBhZGQgZW5hYmxlZFJhbmdlUHJvcGVydHkgdG8gc2xpZGVyT3B0aW9ucywgc28gdGhhdCBpZiB3ZSBhcmUgZ2l2ZW4gcHJvdmlkZWRPcHRpb25zLmVuYWJsZWRSYW5nZVByb3BlcnR5LFxyXG4gICAgLy8gd2UgY2FuIHBhc3MgaXQgdG8gc3VwZXIgdmlhIG9wdGlvbnMuc2xpZGVyT3B0aW9ucy5lbmFibGVkUmFuZ2VQcm9wZXJ0eS5cclxuICAgIHR5cGUgUmV2aXNlZFNlbGZPcHRpb25zID0gU3RyaWN0T21pdDxTZWxmT3B0aW9ucywgJ2VuYWJsZWRSYW5nZVByb3BlcnR5Jz4gJiB7XHJcbiAgICAgIHNsaWRlck9wdGlvbnM/OiBQaWNrT3B0aW9uYWw8U2xpZGVyT3B0aW9ucywgJ2VuYWJsZWRSYW5nZVByb3BlcnR5Jz47XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEV4dGVuZCBOdW1iZXJDb250cm9sIG9wdGlvbnMgYmVmb3JlIG1lcmdpbmcgbmVzdGVkIG9wdGlvbnMgYmVjYXVzZSBzb21lIG5lc3RlZCBkZWZhdWx0cyB1c2UgdGhlc2Ugb3B0aW9ucy5cclxuICAgIGNvbnN0IGluaXRpYWxPcHRpb25zID0gb3B0aW9uaXplPE51bWJlckNvbnRyb2xPcHRpb25zLCBSZXZpc2VkU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICBudW1iZXJEaXNwbGF5T3B0aW9uczoge30sXHJcbiAgICAgIHNsaWRlck9wdGlvbnM6IHt9LFxyXG4gICAgICBhcnJvd0J1dHRvbk9wdGlvbnM6IHt9LFxyXG4gICAgICB0aXRsZU5vZGVPcHRpb25zOiB7fSxcclxuXHJcbiAgICAgIC8vIEdlbmVyYWwgQ2FsbGJhY2tzXHJcbiAgICAgIHN0YXJ0Q2FsbGJhY2s6IF8ubm9vcCwgLy8gY2FsbGVkIHdoZW4gaW50ZXJhY3Rpb24gYmVnaW5zLCBkZWZhdWx0IHZhbHVlIHNldCBpbiB2YWxpZGF0ZUNhbGxiYWNrcygpXHJcbiAgICAgIGVuZENhbGxiYWNrOiBfLm5vb3AsIC8vIGNhbGxlZCB3aGVuIGludGVyYWN0aW9uIGVuZHMsIGRlZmF1bHQgdmFsdWUgc2V0IGluIHZhbGlkYXRlQ2FsbGJhY2tzKClcclxuXHJcbiAgICAgIGRlbHRhOiAxLFxyXG5cclxuICAgICAgZGlzYWJsZWRPcGFjaXR5OiAwLjUsIC8vIHtudW1iZXJ9IG9wYWNpdHkgdXNlZCB0byBtYWtlIHRoZSBjb250cm9sIGxvb2sgZGlzYWJsZWRcclxuXHJcbiAgICAgIC8vIEEge2Z1bmN0aW9ufSB0aGF0IGhhbmRsZXMgbGF5b3V0IG9mIHN1YmNvbXBvbmVudHMuXHJcbiAgICAgIC8vIEl0IGhhcyBzaWduYXR1cmUgZnVuY3Rpb24oIHRpdGxlTm9kZSwgbnVtYmVyRGlzcGxheSwgc2xpZGVyLCBkZWNyZW1lbnRCdXR0b24sIGluY3JlbWVudEJ1dHRvbiApXHJcbiAgICAgIC8vIGFuZCByZXR1cm5zIGEgTm9kZS4gSWYgeW91IHdhbnQgdG8gY3VzdG9taXplIHRoZSBsYXlvdXQsIHVzZSBvbmUgb2YgdGhlIHByZWRlZmluZWQgY3JlYXRvcnNcclxuICAgICAgLy8gKHNlZSBjcmVhdGVMYXlvdXRGdW5jdGlvbiopIG9yIGNyZWF0ZSB5b3VyIG93biBmdW5jdGlvbi4gQXJyb3cgYnV0dG9ucyB3aWxsIGJlIG51bGwgaWYgYGluY2x1ZGVBcnJvd0J1dHRvbnM6ZmFsc2VgXHJcbiAgICAgIGxheW91dEZ1bmN0aW9uOiBOdW1iZXJDb250cm9sLmNyZWF0ZUxheW91dEZ1bmN0aW9uMSgpLFxyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IElmIHNldCB0byB0cnVlLCB0aGVuIGluY3JlbWVudC9kZWNyZW1lbnQgYXJyb3cgYnV0dG9ucyB3aWxsIGJlIGFkZGVkIHRvIHRoZSBOdW1iZXJDb250cm9sXHJcbiAgICAgIGluY2x1ZGVBcnJvd0J1dHRvbnM6IHRydWUsXHJcblxyXG4gICAgICBzb3VuZEdlbmVyYXRvcjogREVGQVVMVF9TT1VORCxcclxuICAgICAgdmFsdWVDaGFuZ2VTb3VuZEdlbmVyYXRvck9wdGlvbnM6IHt9LFxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcclxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ0NvbnRyb2wnLFxyXG4gICAgICBwaGV0aW9UeXBlOiBOdW1iZXJDb250cm9sLk51bWJlckNvbnRyb2xJTyxcclxuICAgICAgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiB0cnVlLCAvLyBvcHQgaW50byBkZWZhdWx0IFBoRVQtaU8gaW5zdHJ1bWVudGVkIGVuYWJsZWRQcm9wZXJ0eVxyXG4gICAgICB2aXNpYmxlUHJvcGVydHlPcHRpb25zOiB7IHBoZXRpb0ZlYXR1cmVkOiB0cnVlIH1cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEEgZ3JvdXBGb2N1c0hpZ2hsaWdodCBpcyBvbmx5IGluY2x1ZGVkIGlmIHVzaW5nIGFycm93QnV0dG9ucy4gV2hlbiB0aGVyZSBhcmUgYXJyb3dCdXR0b25zIGl0IGlzIGltcG9ydGFudFxyXG4gICAgLy8gdG8gaW5kaWNhdGUgdGhhdCB0aGUgd2hvbGUgY29udHJvbCBpcyBvbmx5IG9uZSBzdG9wIGluIHRoZSB0cmF2ZXJzYWwgb3JkZXIuIFRoaXMgaXMgc2V0IGJ5IE51bWJlckNvbnRyb2wuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbml0aWFsT3B0aW9ucy5ncm91cEZvY3VzSGlnaGxpZ2h0ID09PSB1bmRlZmluZWQsICdOdW1iZXJDb250cm9sIHNldHMgZ3JvdXBGb2N1c0hpZ2hsaWdodCcgKTtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIElmIHRoZSBhcnJvdyBidXR0b24gc2NhbGUgaXMgbm90IHByb3ZpZGVkLCB0aGUgYXJyb3cgYnV0dG9uIGhlaWdodCB3aWxsIG1hdGNoIHRoZSBudW1iZXIgZGlzcGxheSBoZWlnaHRcclxuICAgIGNvbnN0IGFycm93QnV0dG9uU2NhbGVQcm92aWRlZCA9IGluaXRpYWxPcHRpb25zLmFycm93QnV0dG9uT3B0aW9ucyAmJiBpbml0aWFsT3B0aW9ucy5hcnJvd0J1dHRvbk9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdzY2FsZScgKTtcclxuXHJcbiAgICBjb25zdCBnZXRDdXJyZW50UmFuZ2UgPSAoKSA9PiB7XHJcbiAgICAgIHJldHVybiBvcHRpb25zLmVuYWJsZWRSYW5nZVByb3BlcnR5ID8gb3B0aW9ucy5lbmFibGVkUmFuZ2VQcm9wZXJ0eS52YWx1ZSA6IG51bWJlclJhbmdlO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgdXNlZCB0byBjb25zdHJhaW4gdGhlIHNsaWRlciB2YWx1ZSB0byB0aGUgcHJvdmlkZWQgcmFuZ2UgYW5kIHRoZSBzYW1lIGRlbHRhIGFzXHJcbiAgICAvLyB0aGUgYXJyb3cgYnV0dG9ucywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzM4NC5cclxuICAgIGNvbnN0IGNvbnN0cmFpblZhbHVlID0gKCB2YWx1ZTogbnVtYmVyICkgPT4ge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmRlbHRhICE9PSB1bmRlZmluZWQgKTtcclxuICAgICAgY29uc3QgbmV3VmFsdWUgPSBVdGlscy5yb3VuZFRvSW50ZXJ2YWwoIHZhbHVlLCBvcHRpb25zLmRlbHRhICk7XHJcbiAgICAgIHJldHVybiBnZXRDdXJyZW50UmFuZ2UoKS5jb25zdHJhaW5WYWx1ZSggbmV3VmFsdWUgKTtcclxuICAgIH07XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydChcclxuICAgICAgaW5pdGlhbE9wdGlvbnMuc291bmRHZW5lcmF0b3IgPT09IERFRkFVTFRfU09VTkQgfHwgXy5pc0VtcHR5KCBpbml0aWFsT3B0aW9ucy52YWx1ZUNoYW5nZVNvdW5kR2VuZXJhdG9yT3B0aW9ucyApLFxyXG4gICAgICAnb3B0aW9ucyBzaG91bGQgb25seSBiZSBzdXBwbGllZCB3aGVuIHVzaW5nIGRlZmF1bHQgc291bmQgZ2VuZXJhdG9yJ1xyXG4gICAgKTtcclxuXHJcbiAgICAvLyBJZiBubyBzb3VuZCBnZW5lcmF0b3Igd2FzIHByb3ZpZGVkLCBjcmVhdGUgb25lIHVzaW5nIHRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24uXHJcbiAgICBpZiAoIGluaXRpYWxPcHRpb25zLnNvdW5kR2VuZXJhdG9yID09PSBERUZBVUxUX1NPVU5EICkge1xyXG4gICAgICBsZXQgdmFsdWVDaGFuZ2VTb3VuZEdlbmVyYXRvck9wdGlvbnMgPSBpbml0aWFsT3B0aW9ucy52YWx1ZUNoYW5nZVNvdW5kR2VuZXJhdG9yT3B0aW9ucztcclxuICAgICAgaWYgKCBfLmlzRW1wdHkoIGluaXRpYWxPcHRpb25zLnZhbHVlQ2hhbmdlU291bmRHZW5lcmF0b3JPcHRpb25zICkgKSB7XHJcblxyXG4gICAgICAgIC8vIElmIG5vIG9wdGlvbnMgd2VyZSBwcm92aWRlZCBmb3IgdGhlIFZhbHVlQ2hhbmdlU291bmRHZW5lcmF0b3IsIHVzZSBhIGRlZmF1bHQgd2hlcmUgYSBzb3VuZCB3aWxsIGJlIHByb2R1Y2VkXHJcbiAgICAgICAgLy8gZm9yIGV2ZXJ5IHZhbGlkIHZhbHVlIHNldCBieSB0aGlzIGNvbnRyb2wuXHJcbiAgICAgICAgdmFsdWVDaGFuZ2VTb3VuZEdlbmVyYXRvck9wdGlvbnMgPSB7XHJcbiAgICAgICAgICBpbnRlclRocmVzaG9sZERlbHRhOiBpbml0aWFsT3B0aW9ucy5kZWx0YSxcclxuICAgICAgICAgIGNvbnN0cmFpblZhbHVlOiBjb25zdHJhaW5WYWx1ZVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgICAgaW5pdGlhbE9wdGlvbnMuc291bmRHZW5lcmF0b3IgPSBuZXcgVmFsdWVDaGFuZ2VTb3VuZFBsYXllcihcclxuICAgICAgICBudW1iZXJSYW5nZSxcclxuICAgICAgICB2YWx1ZUNoYW5nZVNvdW5kR2VuZXJhdG9yT3B0aW9uc1xyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGluaXRpYWxPcHRpb25zLnNvdW5kR2VuZXJhdG9yID09PSBudWxsICkge1xyXG4gICAgICBpbml0aWFsT3B0aW9ucy5zb3VuZEdlbmVyYXRvciA9IFZhbHVlQ2hhbmdlU291bmRQbGF5ZXIuTk9fU09VTkQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTWVyZ2UgYWxsIG5lc3RlZCBvcHRpb25zIGluIG9uZSBibG9jay5cclxuICAgIGNvbnN0IG9wdGlvbnM6IHR5cGVvZiBpbml0aWFsT3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPHR5cGVvZiBpbml0aWFsT3B0aW9ucz4oIHtcclxuXHJcbiAgICAgIC8vIE9wdGlvbnMgcHJvcGFnYXRlZCB0byBBcnJvd0J1dHRvblxyXG4gICAgICBhcnJvd0J1dHRvbk9wdGlvbnM6IHtcclxuXHJcbiAgICAgICAgLy8gVmFsdWVzIGNob3NlbiB0byBtYXRjaCBwcmV2aW91cyBiZWhhdmlvciwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzQ4OS5cclxuICAgICAgICAvLyB0b3VjaEFyZWFYRGlsYXRpb24gaXMgMS8yIG9mIGl0cyBvcmlnaW5hbCB2YWx1ZSBiZWNhdXNlIHRvdWNoQXJlYSBpcyBzaGlmdGVkLlxyXG4gICAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogMy41LFxyXG4gICAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogNyxcclxuICAgICAgICBtb3VzZUFyZWFYRGlsYXRpb246IDAsXHJcbiAgICAgICAgbW91c2VBcmVhWURpbGF0aW9uOiAwLFxyXG5cclxuICAgICAgICAvLyBJZiB0aGUgdmFsdWUgaXMgd2l0aGluIHRoaXMgYW1vdW50IG9mIHRoZSByZXNwZWN0aXZlIG1pbi9tYXgsIGl0IHdpbGwgYmUgdHJlYXRlZCBhcyBpZiBpdCB3YXMgYXQgdGhhdCB2YWx1ZVxyXG4gICAgICAgIC8vIChmb3IgZGV0ZXJtaW5pbmcgd2hldGhlciB0aGUgYXJyb3cgYnV0dG9uIGlzIGVuYWJsZWQpLlxyXG4gICAgICAgIGVuYWJsZWRFcHNpbG9uOiAwLFxyXG5cclxuICAgICAgICAvLyBjYWxsYmFja3NcclxuICAgICAgICBsZWZ0U3RhcnQ6IGluaXRpYWxPcHRpb25zLnN0YXJ0Q2FsbGJhY2ssIC8vIGNhbGxlZCB3aGVuIGxlZnQgYXJyb3cgaXMgcHJlc3NlZFxyXG4gICAgICAgIGxlZnRFbmQ6IGluaXRpYWxPcHRpb25zLmVuZENhbGxiYWNrLCAvLyBjYWxsZWQgd2hlbiBsZWZ0IGFycm93IGlzIHJlbGVhc2VkXHJcbiAgICAgICAgcmlnaHRTdGFydDogaW5pdGlhbE9wdGlvbnMuc3RhcnRDYWxsYmFjaywgLy8gY2FsbGVkIHdoZW4gcmlnaHQgYXJyb3cgaXMgcHJlc3NlZFxyXG4gICAgICAgIHJpZ2h0RW5kOiBpbml0aWFsT3B0aW9ucy5lbmRDYWxsYmFjaywgLy8gY2FsbGVkIHdoZW4gcmlnaHQgYXJyb3cgaXMgcmVsZWFzZWRcclxuXHJcbiAgICAgICAgLy8gcGhldC1pb1xyXG4gICAgICAgIGVuYWJsZWRQcm9wZXJ0eU9wdGlvbnM6IHtcclxuICAgICAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICAgICAgcGhldGlvRmVhdHVyZWQ6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gT3B0aW9ucyBwcm9wYWdhdGVkIHRvIEhTbGlkZXJcclxuICAgICAgc2xpZGVyT3B0aW9uczoge1xyXG4gICAgICAgIHN0YXJ0RHJhZzogaW5pdGlhbE9wdGlvbnMuc3RhcnRDYWxsYmFjaywgLy8gY2FsbGVkIHdoZW4gZHJhZ2dpbmcgc3RhcnRzIG9uIHRoZSBzbGlkZXJcclxuICAgICAgICBlbmREcmFnOiBpbml0aWFsT3B0aW9ucy5lbmRDYWxsYmFjaywgLy8gY2FsbGVkIHdoZW4gZHJhZ2dpbmcgZW5kcyBvbiB0aGUgc2xpZGVyXHJcblxyXG4gICAgICAgIC8vIFdpdGggdGhlIGV4Y2VwdGlvbiBvZiBzdGFydERyYWcgYW5kIGVuZERyYWcgKHVzZSBzdGFydENhbGxiYWNrIGFuZCBlbmRDYWxsYmFjayByZXNwZWN0aXZlbHkpLFxyXG4gICAgICAgIC8vIGFsbCBIU2xpZGVyIG9wdGlvbnMgbWF5IGJlIHVzZWQuIFRoZXNlIGFyZSB0aGUgb25lcyB0aGF0IE51bWJlckNvbnRyb2wgb3ZlcnJpZGVzOlxyXG4gICAgICAgIG1ham9yVGlja0xlbmd0aDogMjAsXHJcbiAgICAgICAgbWlub3JUaWNrU3Ryb2tlOiAncmdiYSggMCwgMCwgMCwgMC4zICknLFxyXG5cclxuICAgICAgICAvLyBvdGhlciBzbGlkZXIgb3B0aW9ucyB0aGF0IGFyZSBzcGVjaWZpYyB0byBOdW1iZXJDb250cm9sXHJcbiAgICAgICAgbWFqb3JUaWNrczogW10sXHJcbiAgICAgICAgbWlub3JUaWNrU3BhY2luZzogMCwgLy8gemVybyBpbmRpY2F0ZXMgbm8gbWlub3IgdGlja3NcclxuXHJcbiAgICAgICAgLy8gY29uc3RyYWluIHRoZSBzbGlkZXIgdmFsdWUgdG8gdGhlIHByb3ZpZGVkIHJhbmdlIGFuZCB0aGUgc2FtZSBkZWx0YSBhcyB0aGUgYXJyb3cgYnV0dG9ucyxcclxuICAgICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvMzg0XHJcbiAgICAgICAgY29uc3RyYWluVmFsdWU6IGNvbnN0cmFpblZhbHVlLFxyXG5cclxuICAgICAgICBzb3VuZEdlbmVyYXRvcjogaW5pdGlhbE9wdGlvbnMuc291bmRHZW5lcmF0b3IsXHJcblxyXG4gICAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgICB0YW5kZW06IGluaXRpYWxPcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oIE51bWJlckNvbnRyb2wuU0xJREVSX1RBTkRFTV9OQU1FIClcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIE9wdGlvbnMgcHJvcGFnYXRlZCB0byBOdW1iZXJEaXNwbGF5XHJcbiAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcbiAgICAgICAgdGV4dE9wdGlvbnM6IHtcclxuICAgICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTIgKSxcclxuICAgICAgICAgIHN0cmluZ1Byb3BlcnR5T3B0aW9uczogeyBwaGV0aW9GZWF0dXJlZDogdHJ1ZSB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLy8gcGhldC1pb1xyXG4gICAgICAgIHRhbmRlbTogaW5pdGlhbE9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ251bWJlckRpc3BsYXknICksXHJcbiAgICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9GZWF0dXJlZDogdHJ1ZSB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBPcHRpb25zIHByb3BhZ2F0ZWQgdG8gdGhlIHRpdGxlIFRleHQgTm9kZVxyXG4gICAgICB0aXRsZU5vZGVPcHRpb25zOiB7XHJcbiAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxMiApLFxyXG4gICAgICAgIG1heFdpZHRoOiBudWxsLCAvLyB7bnVsbHxudW1iZXJ9IG1heFdpZHRoIHRvIHVzZSBmb3IgdGl0bGUsIHRvIGNvbnN0cmFpbiB3aWR0aCBmb3IgaTE4blxyXG4gICAgICAgIGZpbGw6ICdibGFjaycsXHJcbiAgICAgICAgdGFuZGVtOiBpbml0aWFsT3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndGl0bGVUZXh0JyApXHJcbiAgICAgIH1cclxuICAgIH0sIGluaXRpYWxPcHRpb25zICk7XHJcblxyXG4gICAgLy8gdmFsaWRhdGUgb3B0aW9uc1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggISggb3B0aW9ucyBhcyBJbnRlbnRpb25hbEFueSApLnN0YXJ0RHJhZywgJ3VzZSBvcHRpb25zLnN0YXJ0Q2FsbGJhY2sgaW5zdGVhZCBvZiBvcHRpb25zLnN0YXJ0RHJhZycgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICEoIG9wdGlvbnMgYXMgSW50ZW50aW9uYWxBbnkgKS5lbmREcmFnLCAndXNlIG9wdGlvbnMuZW5kQ2FsbGJhY2sgaW5zdGVhZCBvZiBvcHRpb25zLmVuZERyYWcnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy50YWdOYW1lLFxyXG4gICAgICAnUHJvdmlkZSBhY2Nlc3NpYmlsaXR5IHRocm91Z2ggb3B0aW9ucy5zbGlkZXJPcHRpb25zIHdoaWNoIHdpbGwgYmUgYXBwbGllZCB0byB0aGUgTnVtYmVyQ29udHJvbCBOb2RlLicgKTtcclxuXHJcbiAgICBpZiAoIG9wdGlvbnMuZW5hYmxlZFJhbmdlUHJvcGVydHkgKSB7XHJcbiAgICAgIG9wdGlvbnMuc2xpZGVyT3B0aW9ucy5lbmFibGVkUmFuZ2VQcm9wZXJ0eSA9IG9wdGlvbnMuZW5hYmxlZFJhbmdlUHJvcGVydHk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQXJyb3cgYnV0dG9uIHBvaW50ZXIgYXJlYXMgbmVlZCB0byBiZSBhc3ltbWV0cmljYWwsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy80ODkuXHJcbiAgICAvLyBHZXQgdGhlIHBvaW50ZXIgYXJlYSBvcHRpb25zIHJlbGF0ZWQgdG8gQXJyb3dCdXR0b24gc28gdGhhdCB3ZSBjYW4gaGFuZGxlIHBvaW50ZXIgYXJlYXMgaGVyZS5cclxuICAgIC8vIEFuZCBkbyBub3QgcHJvcGFnYXRlIHRob3NlIG9wdGlvbnMgdG8gQXJyb3dCdXR0b24gaW5zdGFuY2VzLlxyXG4gICAgY29uc3QgYXJyb3dCdXR0b25Qb2ludGVyQXJlYU9wdGlvbnMgPSBfLnBpY2soIG9wdGlvbnMuYXJyb3dCdXR0b25PcHRpb25zLCBQT0lOVEVSX0FSRUFfT1BUSU9OX05BTUVTICkgYXMgUGlja1JlcXVpcmVkPEFycm93QnV0dG9uT3B0aW9ucywgdHlwZW9mIFBPSU5URVJfQVJFQV9PUFRJT05fTkFNRVNbbnVtYmVyXT47XHJcbiAgICBvcHRpb25zLmFycm93QnV0dG9uT3B0aW9ucyA9IF8ub21pdCggb3B0aW9ucy5hcnJvd0J1dHRvbk9wdGlvbnMsIFBPSU5URVJfQVJFQV9PUFRJT05fTkFNRVMgKTtcclxuXHJcbiAgICAvLyBwZG9tIC0gZm9yIGFsdGVybmF0aXZlIGlucHV0LCB0aGUgbnVtYmVyIGNvbnRyb2wgaXMgYWNjZXNzZWQgZW50aXJlbHkgdGhyb3VnaCBzbGlkZXIgaW50ZXJhY3Rpb24gYW5kIHRoZXNlXHJcbiAgICAvLyBhcnJvdyBidXR0b25zIGFyZSBub3QgdGFiIG5hdmlnYWJsZVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5hcnJvd0J1dHRvbk9wdGlvbnMudGFnTmFtZSA9PT0gdW5kZWZpbmVkLFxyXG4gICAgICAnTnVtYmVyQ29udHJvbFxcJ3MgYWNjZXNzaWJsZSBjb250ZW50IGlzIGp1c3QgdGhlIHNsaWRlciwgZG8gbm90IHNldCBhY2Nlc3NpYmxlIGNvbnRlbnQgb24gdGhlIGJ1dHRvbnMuIEluc3RlYWQgJyArXHJcbiAgICAgICdzZXQgYTExeSB0aHJvdWdoIG9wdGlvbnMuc2xpZGVyT3B0aW9ucy4nICk7XHJcbiAgICBvcHRpb25zLmFycm93QnV0dG9uT3B0aW9ucy50YWdOYW1lID0gbnVsbDtcclxuXHJcbiAgICAvLyBwZG9tIC0gaWYgd2UgaW5jbHVkZSBhcnJvdyBidXR0b25zLCB1c2UgYSBncm91cEZvY3VzSGlnaGxpZ2h0IHRvIHN1cnJvdW5kIHRoZSBOdW1iZXJDb250cm9sIHRvIG1ha2UgaXQgY2xlYXJcclxuICAgIC8vIHRoYXQgaXQgaXMgYSBjb21wb3NpdGUgY29tcG9uZW50IGFuZCB0aGVyZSBpcyBvbmx5IG9uZSBzdG9wIGluIHRoZSB0cmF2ZXJzYWwgb3JkZXIuXHJcbiAgICB0aGlzLmdyb3VwRm9jdXNIaWdobGlnaHQgPSBvcHRpb25zLmluY2x1ZGVBcnJvd0J1dHRvbnM7XHJcblxyXG4gICAgLy8gU2xpZGVyIG9wdGlvbnMgZm9yIHRyYWNrIChpZiBub3Qgc3BlY2lmaWVkIGFzIHRyYWNrTm9kZSlcclxuICAgIGlmICggIW9wdGlvbnMuc2xpZGVyT3B0aW9ucy50cmFja05vZGUgKSB7XHJcbiAgICAgIG9wdGlvbnMuc2xpZGVyT3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPE51bWJlckNvbnRyb2xTbGlkZXJPcHRpb25zPigge1xyXG4gICAgICAgIHRyYWNrU2l6ZTogbmV3IERpbWVuc2lvbjIoIDE4MCwgMyApXHJcbiAgICAgIH0sIG9wdGlvbnMuc2xpZGVyT3B0aW9ucyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNsaWRlciBvcHRpb25zIGZvciB0aHVtYiAoaWYgbiBvdCBzcGVjaWZpZWQgYXMgdGh1bWJOb2RlKVxyXG4gICAgaWYgKCAhb3B0aW9ucy5zbGlkZXJPcHRpb25zLnRodW1iTm9kZSApIHtcclxuICAgICAgb3B0aW9ucy5zbGlkZXJPcHRpb25zID0gY29tYmluZU9wdGlvbnM8TnVtYmVyQ29udHJvbFNsaWRlck9wdGlvbnM+KCB7XHJcbiAgICAgICAgdGh1bWJTaXplOiBuZXcgRGltZW5zaW9uMiggMTcsIDM0ICksXHJcbiAgICAgICAgdGh1bWJUb3VjaEFyZWFYRGlsYXRpb246IDZcclxuICAgICAgfSwgb3B0aW9ucy5zbGlkZXJPcHRpb25zICk7XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuc2xpZGVyT3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ3BoZXRpb1R5cGUnICksICdOdW1iZXJDb250cm9sIHNldHMgcGhldGlvVHlwZScgKTtcclxuXHJcbiAgICAvLyBzbGlkZXIgb3B0aW9ucyBzZXQgYnkgTnVtYmVyQ29udHJvbCwgbm90ZSB0aGlzIG1heSBub3QgYmUgdGhlIGxvbmcgdGVybSBwYXR0ZXJuLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW5mby9pc3N1ZXMvOTZcclxuICAgIG9wdGlvbnMuc2xpZGVyT3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPE51bWJlckNvbnRyb2xTbGlkZXJPcHRpb25zPigge1xyXG5cclxuICAgICAgLy8gcGRvbSAtIGJ5IGRlZmF1bHQsIHNoaWZ0S2V5Ym9hcmRTdGVwIHNob3VsZCBtb3N0IGxpa2VseSBiZSB0aGUgc2FtZSBhcyBjbGlja2luZyB0aGUgYXJyb3cgYnV0dG9ucy5cclxuICAgICAgc2hpZnRLZXlib2FyZFN0ZXA6IG9wdGlvbnMuZGVsdGEsXHJcblxyXG4gICAgICAvLyBNYWtlIHN1cmUgU2xpZGVyIGdldHMgY3JlYXRlZCB3aXRoIHRoZSByaWdodCBJTyBUeXBlXHJcbiAgICAgIHBoZXRpb1R5cGU6IFNsaWRlci5TbGlkZXJJT1xyXG4gICAgfSwgb3B0aW9ucy5zbGlkZXJPcHRpb25zICk7XHJcblxyXG4gICAgLy8gaGlnaGxpZ2h0IGNvbG9yIGZvciB0aHVtYiBkZWZhdWx0cyB0byBhIGJyaWdodGVyIHZlcnNpb24gb2YgdGhlIHRodW1iIGNvbG9yXHJcbiAgICBpZiAoIG9wdGlvbnMuc2xpZGVyT3B0aW9ucy50aHVtYkZpbGwgJiYgIW9wdGlvbnMuc2xpZGVyT3B0aW9ucy50aHVtYkZpbGxIaWdobGlnaHRlZCApIHtcclxuXHJcbiAgICAgIHRoaXMudGh1bWJGaWxsUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBvcHRpb25zLnNsaWRlck9wdGlvbnMudGh1bWJGaWxsICk7XHJcblxyXG4gICAgICAvLyBSZWZlcmVuY2UgdG8gdGhlIERlcml2ZWRQcm9wZXJ0eSBub3QgbmVlZGVkLCBzaW5jZSB3ZSBkaXNwb3NlIHdoYXQgaXQgbGlzdGVucyB0byBhYm92ZS5cclxuICAgICAgb3B0aW9ucy5zbGlkZXJPcHRpb25zLnRodW1iRmlsbEhpZ2hsaWdodGVkID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLnRodW1iRmlsbFByb3BlcnR5IF0sIGNvbG9yID0+IGNvbG9yLmJyaWdodGVyQ29sb3IoKSApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRpdGxlTm9kZSA9IG5ldyBUZXh0KCB0aXRsZSwgb3B0aW9ucy50aXRsZU5vZGVPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgbnVtYmVyRGlzcGxheSA9IG5ldyBOdW1iZXJEaXNwbGF5KCBudW1iZXJQcm9wZXJ0eSwgbnVtYmVyUmFuZ2UsIG9wdGlvbnMubnVtYmVyRGlzcGxheU9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnNsaWRlciA9IG5ldyBIU2xpZGVyKCBudW1iZXJQcm9wZXJ0eSwgbnVtYmVyUmFuZ2UsIG9wdGlvbnMuc2xpZGVyT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHNldCBiZWxvdywgc2VlIG9wdGlvbnMuaW5jbHVkZUFycm93QnV0dG9uc1xyXG4gICAgbGV0IGRlY3JlbWVudEJ1dHRvbjogQXJyb3dCdXR0b24gfCBudWxsID0gbnVsbDtcclxuICAgIGxldCBpbmNyZW1lbnRCdXR0b246IEFycm93QnV0dG9uIHwgbnVsbCA9IG51bGw7XHJcbiAgICBsZXQgYXJyb3dFbmFibGVkTGlzdGVuZXI6ICggKCkgPT4gdm9pZCApIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgaWYgKCBvcHRpb25zLmluY2x1ZGVBcnJvd0J1dHRvbnMgKSB7XHJcblxyXG4gICAgICBkZWNyZW1lbnRCdXR0b24gPSBuZXcgQXJyb3dCdXR0b24oICdsZWZ0JywgKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG9sZFZhbHVlID0gbnVtYmVyUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgICAgbGV0IG5ld1ZhbHVlID0gbnVtYmVyUHJvcGVydHkuZ2V0KCkgLSBvcHRpb25zLmRlbHRhO1xyXG4gICAgICAgIG5ld1ZhbHVlID0gVXRpbHMucm91bmRUb0ludGVydmFsKCBuZXdWYWx1ZSwgb3B0aW9ucy5kZWx0YSApOyAvLyBjb25zdHJhaW4gdG8gbXVsdGlwbGVzIG9mIGRlbHRhLCBzZWUgIzM4NFxyXG4gICAgICAgIG5ld1ZhbHVlID0gTWF0aC5tYXgoIG5ld1ZhbHVlLCBnZXRDdXJyZW50UmFuZ2UoKS5taW4gKTsgLy8gY29uc3RyYWluIHRvIHJhbmdlXHJcbiAgICAgICAgbnVtYmVyUHJvcGVydHkuc2V0KCBuZXdWYWx1ZSApO1xyXG4gICAgICAgIG9wdGlvbnMuc291bmRHZW5lcmF0b3IhLnBsYXlTb3VuZEZvclZhbHVlQ2hhbmdlKCBuZXdWYWx1ZSwgb2xkVmFsdWUgKTtcclxuICAgICAgfSwgY29tYmluZU9wdGlvbnM8QXJyb3dCdXR0b25PcHRpb25zPigge1xyXG4gICAgICAgIHNvdW5kUGxheWVyOiBudWxsU291bmRQbGF5ZXIsXHJcbiAgICAgICAgc3RhcnRDYWxsYmFjazogb3B0aW9ucy5hcnJvd0J1dHRvbk9wdGlvbnMubGVmdFN0YXJ0LFxyXG4gICAgICAgIGVuZENhbGxiYWNrOiBvcHRpb25zLmFycm93QnV0dG9uT3B0aW9ucy5sZWZ0RW5kLFxyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZGVjcmVtZW50QnV0dG9uJyApXHJcbiAgICAgIH0sIG9wdGlvbnMuYXJyb3dCdXR0b25PcHRpb25zICkgKTtcclxuXHJcbiAgICAgIGluY3JlbWVudEJ1dHRvbiA9IG5ldyBBcnJvd0J1dHRvbiggJ3JpZ2h0JywgKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG9sZFZhbHVlID0gbnVtYmVyUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgICAgbGV0IG5ld1ZhbHVlID0gbnVtYmVyUHJvcGVydHkuZ2V0KCkgKyBvcHRpb25zLmRlbHRhO1xyXG4gICAgICAgIG5ld1ZhbHVlID0gVXRpbHMucm91bmRUb0ludGVydmFsKCBuZXdWYWx1ZSwgb3B0aW9ucy5kZWx0YSApOyAvLyBjb25zdHJhaW4gdG8gbXVsdGlwbGVzIG9mIGRlbHRhLCBzZWUgIzM4NFxyXG4gICAgICAgIG5ld1ZhbHVlID0gTWF0aC5taW4oIG5ld1ZhbHVlLCBnZXRDdXJyZW50UmFuZ2UoKS5tYXggKTsgLy8gY29uc3RyYWluIHRvIHJhbmdlXHJcbiAgICAgICAgbnVtYmVyUHJvcGVydHkuc2V0KCBuZXdWYWx1ZSApO1xyXG4gICAgICAgIG9wdGlvbnMuc291bmRHZW5lcmF0b3IhLnBsYXlTb3VuZEZvclZhbHVlQ2hhbmdlKCBuZXdWYWx1ZSwgb2xkVmFsdWUgKTtcclxuICAgICAgfSwgY29tYmluZU9wdGlvbnM8QXJyb3dCdXR0b25PcHRpb25zPigge1xyXG4gICAgICAgIHNvdW5kUGxheWVyOiBudWxsU291bmRQbGF5ZXIsXHJcbiAgICAgICAgc3RhcnRDYWxsYmFjazogb3B0aW9ucy5hcnJvd0J1dHRvbk9wdGlvbnMucmlnaHRTdGFydCxcclxuICAgICAgICBlbmRDYWxsYmFjazogb3B0aW9ucy5hcnJvd0J1dHRvbk9wdGlvbnMucmlnaHRFbmQsXHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbmNyZW1lbnRCdXR0b24nIClcclxuICAgICAgfSwgb3B0aW9ucy5hcnJvd0J1dHRvbk9wdGlvbnMgKSApO1xyXG5cclxuICAgICAgLy8gQnkgZGVmYXVsdCwgc2NhbGUgdGhlIEFycm93QnV0dG9ucyB0byBoYXZlIHRoZSBzYW1lIGhlaWdodCBhcyB0aGUgTnVtYmVyRGlzcGxheSwgYnV0IGlnbm9yaW5nXHJcbiAgICAgIC8vIHRoZSBOdW1iZXJEaXNwbGF5J3MgbWF4V2lkdGggKGlmIGFueSlcclxuICAgICAgaWYgKCAhYXJyb3dCdXR0b25TY2FsZVByb3ZpZGVkICkge1xyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdGhlIGN1cnJlbnQgYnV0dG9uIHNjYWxpbmcgc28gd2UgY2FuIGRldGVybWluZSB0aGUgZGVzaXJlZCBmaW5hbCBzY2FsZSBmYWN0b3JcclxuICAgICAgICBkZWNyZW1lbnRCdXR0b24uc2V0U2NhbGVNYWduaXR1ZGUoIDEgKTtcclxuXHJcbiAgICAgICAgLy8gU2V0IHRoZSB0d2Vha2VyIGJ1dHRvbiBoZWlnaHQgdG8gbWF0Y2ggdGhlIGhlaWdodCBvZiB0aGUgbnVtYmVyRGlzcGxheS4gTGVuZ3RoeSB0ZXh0IGNhbiBzaHJpbmsgYSBudW1iZXJEaXNwbGF5XHJcbiAgICAgICAgLy8gd2l0aCBtYXhXaWR0aC0taWYgd2UgbWF0Y2ggdGhlIHNjYWxlZCBoZWlnaHQgb2YgdGhlIG51bWJlckRpc3BsYXkgdGhlIGFycm93IGJ1dHRvbnMgd291bGQgc2hyaW5rIHRvbywgYXNcclxuICAgICAgICAvLyBkZXBpY3RlZCBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy81MTMjaXNzdWVjb21tZW50LTUxNzg5Nzg1MFxyXG4gICAgICAgIC8vIEluc3RlYWQsIHRvIGtlZXAgdGhlIHR3ZWFrZXIgYnV0dG9ucyBhIHVuaWZvcm0gYW5kIHJlYXNvbmFibGUgc2l6ZSwgd2UgbWF0Y2ggdGhlaXIgaGVpZ2h0IHRvIHRoZSB1bnNjYWxlZFxyXG4gICAgICAgIC8vIGhlaWdodCBvZiB0aGUgbnVtYmVyRGlzcGxheSAoaWdub3JlcyBtYXhXaWR0aCBhbmQgc2NhbGUpLlxyXG4gICAgICAgIGNvbnN0IG51bWJlckRpc3BsYXlIZWlnaHQgPSBudW1iZXJEaXNwbGF5LmxvY2FsQm91bmRzLmhlaWdodDtcclxuICAgICAgICBjb25zdCBhcnJvd0J1dHRvbnNTY2FsZSA9IG51bWJlckRpc3BsYXlIZWlnaHQgLyBkZWNyZW1lbnRCdXR0b24uaGVpZ2h0O1xyXG5cclxuICAgICAgICBkZWNyZW1lbnRCdXR0b24uc2V0U2NhbGVNYWduaXR1ZGUoIGFycm93QnV0dG9uc1NjYWxlICk7XHJcbiAgICAgICAgaW5jcmVtZW50QnV0dG9uLnNldFNjYWxlTWFnbml0dWRlKCBhcnJvd0J1dHRvbnNTY2FsZSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBhcnJvdyBidXR0b24gdG91Y2hBcmVhcywgYXN5bW1ldHJpY2FsLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvNDg5XHJcbiAgICAgIGRlY3JlbWVudEJ1dHRvbi50b3VjaEFyZWEgPSBkZWNyZW1lbnRCdXR0b24ubG9jYWxCb3VuZHNcclxuICAgICAgICAuZGlsYXRlZFhZKCBhcnJvd0J1dHRvblBvaW50ZXJBcmVhT3B0aW9ucy50b3VjaEFyZWFYRGlsYXRpb24sIGFycm93QnV0dG9uUG9pbnRlckFyZWFPcHRpb25zLnRvdWNoQXJlYVlEaWxhdGlvbiApXHJcbiAgICAgICAgLnNoaWZ0ZWRYKCAtYXJyb3dCdXR0b25Qb2ludGVyQXJlYU9wdGlvbnMudG91Y2hBcmVhWERpbGF0aW9uICk7XHJcbiAgICAgIGluY3JlbWVudEJ1dHRvbi50b3VjaEFyZWEgPSBpbmNyZW1lbnRCdXR0b24ubG9jYWxCb3VuZHNcclxuICAgICAgICAuZGlsYXRlZFhZKCBhcnJvd0J1dHRvblBvaW50ZXJBcmVhT3B0aW9ucy50b3VjaEFyZWFYRGlsYXRpb24sIGFycm93QnV0dG9uUG9pbnRlckFyZWFPcHRpb25zLnRvdWNoQXJlYVlEaWxhdGlvbiApXHJcbiAgICAgICAgLnNoaWZ0ZWRYKCBhcnJvd0J1dHRvblBvaW50ZXJBcmVhT3B0aW9ucy50b3VjaEFyZWFYRGlsYXRpb24gKTtcclxuXHJcbiAgICAgIC8vIGFycm93IGJ1dHRvbiBtb3VzZUFyZWFzLCBhc3ltbWV0cmljYWwsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy80ODlcclxuICAgICAgZGVjcmVtZW50QnV0dG9uLm1vdXNlQXJlYSA9IGRlY3JlbWVudEJ1dHRvbi5sb2NhbEJvdW5kc1xyXG4gICAgICAgIC5kaWxhdGVkWFkoIGFycm93QnV0dG9uUG9pbnRlckFyZWFPcHRpb25zLm1vdXNlQXJlYVhEaWxhdGlvbiwgYXJyb3dCdXR0b25Qb2ludGVyQXJlYU9wdGlvbnMubW91c2VBcmVhWURpbGF0aW9uIClcclxuICAgICAgICAuc2hpZnRlZFgoIC1hcnJvd0J1dHRvblBvaW50ZXJBcmVhT3B0aW9ucy5tb3VzZUFyZWFYRGlsYXRpb24gKTtcclxuICAgICAgaW5jcmVtZW50QnV0dG9uLm1vdXNlQXJlYSA9IGluY3JlbWVudEJ1dHRvbi5sb2NhbEJvdW5kc1xyXG4gICAgICAgIC5kaWxhdGVkWFkoIGFycm93QnV0dG9uUG9pbnRlckFyZWFPcHRpb25zLm1vdXNlQXJlYVhEaWxhdGlvbiwgYXJyb3dCdXR0b25Qb2ludGVyQXJlYU9wdGlvbnMubW91c2VBcmVhWURpbGF0aW9uIClcclxuICAgICAgICAuc2hpZnRlZFgoIGFycm93QnV0dG9uUG9pbnRlckFyZWFPcHRpb25zLm1vdXNlQXJlYVhEaWxhdGlvbiApO1xyXG5cclxuICAgICAgLy8gRGlzYWJsZSB0aGUgYXJyb3cgYnV0dG9ucyBpZiB0aGUgc2xpZGVyIGN1cnJlbnRseSBoYXMgZm9jdXNcclxuICAgICAgYXJyb3dFbmFibGVkTGlzdGVuZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSBudW1iZXJQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmFycm93QnV0dG9uT3B0aW9ucy5lbmFibGVkRXBzaWxvbiAhPT0gdW5kZWZpbmVkICk7XHJcbiAgICAgICAgZGVjcmVtZW50QnV0dG9uIS5lbmFibGVkID0gKCB2YWx1ZSAtIG9wdGlvbnMuYXJyb3dCdXR0b25PcHRpb25zLmVuYWJsZWRFcHNpbG9uISA+IGdldEN1cnJlbnRSYW5nZSgpLm1pbiAmJiAhdGhpcy5zbGlkZXIuaXNGb2N1c2VkKCkgKTtcclxuICAgICAgICBpbmNyZW1lbnRCdXR0b24hLmVuYWJsZWQgPSAoIHZhbHVlICsgb3B0aW9ucy5hcnJvd0J1dHRvbk9wdGlvbnMuZW5hYmxlZEVwc2lsb24hIDwgZ2V0Q3VycmVudFJhbmdlKCkubWF4ICYmICF0aGlzLnNsaWRlci5pc0ZvY3VzZWQoKSApO1xyXG4gICAgICB9O1xyXG4gICAgICBudW1iZXJQcm9wZXJ0eS5sYXp5TGluayggYXJyb3dFbmFibGVkTGlzdGVuZXIgKTtcclxuICAgICAgb3B0aW9ucy5lbmFibGVkUmFuZ2VQcm9wZXJ0eSAmJiBvcHRpb25zLmVuYWJsZWRSYW5nZVByb3BlcnR5LmxhenlMaW5rKCBhcnJvd0VuYWJsZWRMaXN0ZW5lciApO1xyXG4gICAgICBhcnJvd0VuYWJsZWRMaXN0ZW5lcigpO1xyXG5cclxuICAgICAgdGhpcy5zbGlkZXIuYWRkSW5wdXRMaXN0ZW5lcigge1xyXG4gICAgICAgIGZvY3VzOiAoKSA9PiB7XHJcbiAgICAgICAgICBkZWNyZW1lbnRCdXR0b24hLmVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgIGluY3JlbWVudEJ1dHRvbiEuZW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYmx1cjogKCkgPT4gYXJyb3dFbmFibGVkTGlzdGVuZXIhKCkgLy8gcmVjb21wdXRlIGlmIHRoZSBhcnJvdyBidXR0b25zIHNob3VsZCBiZSBlbmFibGVkXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBtYWpvciB0aWNrcyBmb3IgdGhlIHNsaWRlclxyXG4gICAgY29uc3QgbWFqb3JUaWNrcyA9IG9wdGlvbnMuc2xpZGVyT3B0aW9ucy5tYWpvclRpY2tzITtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1ham9yVGlja3MgKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG1ham9yVGlja3MubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuc2xpZGVyLmFkZE1ham9yVGljayggbWFqb3JUaWNrc1sgaSBdLnZhbHVlLCBtYWpvclRpY2tzWyBpIF0ubGFiZWwgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBtaW5vciB0aWNrcywgZXhjbHVkZSB2YWx1ZXMgd2hlcmUgd2UgYWxyZWFkeSBoYXZlIG1ham9yIHRpY2tzXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnNsaWRlck9wdGlvbnMubWlub3JUaWNrU3BhY2luZyAhPT0gdW5kZWZpbmVkICk7XHJcbiAgICBpZiAoIG9wdGlvbnMuc2xpZGVyT3B0aW9ucy5taW5vclRpY2tTcGFjaW5nISA+IDAgKSB7XHJcbiAgICAgIGZvciAoIGxldCBtaW5vclRpY2tWYWx1ZSA9IG51bWJlclJhbmdlLm1pbjsgbWlub3JUaWNrVmFsdWUgPD0gbnVtYmVyUmFuZ2UubWF4OyApIHtcclxuICAgICAgICBpZiAoICFfLmZpbmQoIG1ham9yVGlja3MsIG1ham9yVGljayA9PiBtYWpvclRpY2sudmFsdWUgPT09IG1pbm9yVGlja1ZhbHVlICkgKSB7XHJcbiAgICAgICAgICB0aGlzLnNsaWRlci5hZGRNaW5vclRpY2soIG1pbm9yVGlja1ZhbHVlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1pbm9yVGlja1ZhbHVlICs9IG9wdGlvbnMuc2xpZGVyT3B0aW9ucy5taW5vclRpY2tTcGFjaW5nITtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbXHJcbiAgICAgIG9wdGlvbnMubGF5b3V0RnVuY3Rpb24oIHRpdGxlTm9kZSwgbnVtYmVyRGlzcGxheSwgdGhpcy5zbGlkZXIsIGRlY3JlbWVudEJ1dHRvbiwgaW5jcmVtZW50QnV0dG9uIClcclxuICAgIF07XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLm51bWJlckRpc3BsYXkgPSBudW1iZXJEaXNwbGF5O1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZU51bWJlckNvbnRyb2wgPSAoKSA9PiB7XHJcbiAgICAgIHRpdGxlTm9kZS5kaXNwb3NlKCk7IC8vIG1heSBiZSBsaW5rZWQgdG8gYSBzdHJpbmcgUHJvcGVydHlcclxuICAgICAgbnVtYmVyRGlzcGxheS5kaXNwb3NlKCk7XHJcbiAgICAgIHRoaXMuc2xpZGVyLmRpc3Bvc2UoKTtcclxuXHJcbiAgICAgIHRoaXMudGh1bWJGaWxsUHJvcGVydHkgJiYgdGhpcy50aHVtYkZpbGxQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcblxyXG4gICAgICAvLyBvbmx5IGRlZmluZWQgaWYgb3B0aW9ucy5pbmNsdWRlQXJyb3dCdXR0b25zXHJcbiAgICAgIGRlY3JlbWVudEJ1dHRvbiAmJiBkZWNyZW1lbnRCdXR0b24uZGlzcG9zZSgpO1xyXG4gICAgICBpbmNyZW1lbnRCdXR0b24gJiYgaW5jcmVtZW50QnV0dG9uLmRpc3Bvc2UoKTtcclxuICAgICAgYXJyb3dFbmFibGVkTGlzdGVuZXIgJiYgbnVtYmVyUHJvcGVydHkudW5saW5rKCBhcnJvd0VuYWJsZWRMaXN0ZW5lciApO1xyXG4gICAgICBhcnJvd0VuYWJsZWRMaXN0ZW5lciAmJiBvcHRpb25zLmVuYWJsZWRSYW5nZVByb3BlcnR5ICYmIG9wdGlvbnMuZW5hYmxlZFJhbmdlUHJvcGVydHkudW5saW5rKCBhcnJvd0VuYWJsZWRMaXN0ZW5lciApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcclxuICAgIGFzc2VydCAmJiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3NjZW5lcnktcGhldCcsICdOdW1iZXJDb250cm9sJywgdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVkcmF3cyB0aGUgTnVtYmVyRGlzcGxheS4gVGhpcyBpcyB1c2VmdWwgd2hlbiB5b3UgaGF2ZSBhZGRpdGlvbmFsIFByb3BlcnRpZXMgdGhhdCBkZXRlcm1pbmUgdGhlIGZvcm1hdFxyXG4gICAqIG9mIHRoZSBkaXNwbGF5ZWQgdmFsdWUuXHJcbiAgICovXHJcbiAgcHVibGljIHJlZHJhd051bWJlckRpc3BsYXkoKTogdm9pZCB7XHJcbiAgICB0aGlzLm51bWJlckRpc3BsYXkucmVjb21wdXRlVGV4dCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VOdW1iZXJDb250cm9sKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBudW1iZXJGb3JtYXR0ZXIgZm9yIHRoZSBOdW1iZXJEaXNwbGF5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXROdW1iZXJGb3JtYXR0ZXIoIG51bWJlckZvcm1hdHRlcjogKCBuOiBudW1iZXIgKSA9PiBzdHJpbmcgKTogdm9pZCB7XHJcbiAgICB0aGlzLm51bWJlckRpc3BsYXkuc2V0TnVtYmVyRm9ybWF0dGVyKCBudW1iZXJGb3JtYXR0ZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBOdW1iZXJDb250cm9sIHdpdGggZGVmYXVsdCB0aWNrIG1hcmtzIGZvciBtaW4gYW5kIG1heCB2YWx1ZXMuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyB3aXRoTWluTWF4VGlja3MoIGxhYmVsOiBzdHJpbmcsIHByb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+LCByYW5nZTogUmFuZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IFdpdGhNaW5NYXhPcHRpb25zICk6IE51bWJlckNvbnRyb2wge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8V2l0aE1pbk1heE9wdGlvbnMsIFdpdGhNaW5NYXhTZWxmT3B0aW9ucywgTnVtYmVyQ29udHJvbE9wdGlvbnM+KCkoIHtcclxuICAgICAgdGlja0xhYmVsRm9udDogbmV3IFBoZXRGb250KCAxMiApXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBvcHRpb25zLnNsaWRlck9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxOdW1iZXJDb250cm9sU2xpZGVyT3B0aW9ucz4oIHtcclxuICAgICAgbWFqb3JUaWNrczogW1xyXG4gICAgICAgIHsgdmFsdWU6IHJhbmdlLm1pbiwgbGFiZWw6IG5ldyBUZXh0KCByYW5nZS5taW4sIHsgZm9udDogb3B0aW9ucy50aWNrTGFiZWxGb250IH0gKSB9LFxyXG4gICAgICAgIHsgdmFsdWU6IHJhbmdlLm1heCwgbGFiZWw6IG5ldyBUZXh0KCByYW5nZS5tYXgsIHsgZm9udDogb3B0aW9ucy50aWNrTGFiZWxGb250IH0gKSB9XHJcbiAgICAgIF1cclxuICAgIH0sIG9wdGlvbnMuc2xpZGVyT3B0aW9ucyApO1xyXG5cclxuICAgIHJldHVybiBuZXcgTnVtYmVyQ29udHJvbCggbGFiZWwsIHByb3BlcnR5LCByYW5nZSwgb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBvbmUgb2YgdGhlIHByZS1kZWZpbmVkIGxheW91dCBmdW5jdGlvbnMgdGhhdCBjYW4gYmUgdXNlZCBmb3Igb3B0aW9ucy5sYXlvdXRGdW5jdGlvbi5cclxuICAgKiBBcnJhbmdlcyBzdWJjb21wb25lbnRzIGxpa2UgdGhpczpcclxuICAgKlxyXG4gICAqICB0aXRsZSBudW1iZXJcclxuICAgKiAgPCAtLS0tLS18LS0tLS0tID5cclxuICAgKlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlTGF5b3V0RnVuY3Rpb24xKCBwcm92aWRlZE9wdGlvbnM/OiBOdW1iZXJDb250cm9sTGF5b3V0RnVuY3Rpb24xT3B0aW9ucyApOiBMYXlvdXRGdW5jdGlvbiB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxOdW1iZXJDb250cm9sTGF5b3V0RnVuY3Rpb24xT3B0aW9ucz4oKSgge1xyXG4gICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgIHRpdGxlWFNwYWNpbmc6IDUsXHJcbiAgICAgIGFycm93QnV0dG9uc1hTcGFjaW5nOiAxNSxcclxuICAgICAgeVNwYWNpbmc6IDVcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHJldHVybiAoIHRpdGxlTm9kZSwgbnVtYmVyRGlzcGxheSwgc2xpZGVyLCBkZWNyZW1lbnRCdXR0b24sIGluY3JlbWVudEJ1dHRvbiApID0+IHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZGVjcmVtZW50QnV0dG9uLCAnVGhlcmUgaXMgbm8gZGVjcmVtZW50QnV0dG9uIScgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaW5jcmVtZW50QnV0dG9uLCAnVGhlcmUgaXMgbm8gaW5jcmVtZW50QnV0dG9uIScgKTtcclxuXHJcbiAgICAgIHJldHVybiBuZXcgVkJveCgge1xyXG4gICAgICAgIGFsaWduOiBvcHRpb25zLmFsaWduLFxyXG4gICAgICAgIHNwYWNpbmc6IG9wdGlvbnMueVNwYWNpbmcsXHJcbiAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgIG5ldyBIQm94KCB7XHJcbiAgICAgICAgICAgIHNwYWNpbmc6IG9wdGlvbnMudGl0bGVYU3BhY2luZyxcclxuICAgICAgICAgICAgY2hpbGRyZW46IFsgdGl0bGVOb2RlLCBudW1iZXJEaXNwbGF5IF1cclxuICAgICAgICAgIH0gKSxcclxuICAgICAgICAgIG5ldyBIQm94KCB7XHJcbiAgICAgICAgICAgIHNwYWNpbmc6IG9wdGlvbnMuYXJyb3dCdXR0b25zWFNwYWNpbmcsXHJcbiAgICAgICAgICAgIHJlc2l6ZTogZmFsc2UsIC8vIHByZXZlbnQgc2xpZGVyIGZyb20gY2F1c2luZyBhIHJlc2l6ZSB3aGVuIHRodW1iIGlzIGF0IG1pbiBvciBtYXhcclxuICAgICAgICAgICAgY2hpbGRyZW46IFsgZGVjcmVtZW50QnV0dG9uISwgc2xpZGVyLCBpbmNyZW1lbnRCdXR0b24hIF1cclxuICAgICAgICAgIH0gKVxyXG4gICAgICAgIF1cclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgb25lIG9mIHRoZSBwcmUtZGVmaW5lZCBsYXlvdXQgZnVuY3Rpb25zIHRoYXQgY2FuIGJlIHVzZWQgZm9yIG9wdGlvbnMubGF5b3V0RnVuY3Rpb24uXHJcbiAgICogQXJyYW5nZXMgc3ViY29tcG9uZW50cyBsaWtlIHRoaXM6XHJcbiAgICpcclxuICAgKiAgdGl0bGUgPCBudW1iZXIgPlxyXG4gICAqICAtLS0tLS18LS0tLS0tXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjcmVhdGVMYXlvdXRGdW5jdGlvbjIoIHByb3ZpZGVkT3B0aW9ucz86IE51bWJlckNvbnRyb2xMYXlvdXRGdW5jdGlvbjJPcHRpb25zICk6IExheW91dEZ1bmN0aW9uIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPE51bWJlckNvbnRyb2xMYXlvdXRGdW5jdGlvbjJPcHRpb25zPigpKCB7XHJcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgeFNwYWNpbmc6IDUsXHJcbiAgICAgIHlTcGFjaW5nOiA1XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICByZXR1cm4gKCB0aXRsZU5vZGUsIG51bWJlckRpc3BsYXksIHNsaWRlciwgZGVjcmVtZW50QnV0dG9uLCBpbmNyZW1lbnRCdXR0b24gKSA9PiB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGRlY3JlbWVudEJ1dHRvbiApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmNyZW1lbnRCdXR0b24gKTtcclxuXHJcbiAgICAgIHJldHVybiBuZXcgVkJveCgge1xyXG4gICAgICAgIGFsaWduOiBvcHRpb25zLmFsaWduLFxyXG4gICAgICAgIHNwYWNpbmc6IG9wdGlvbnMueVNwYWNpbmcsXHJcbiAgICAgICAgcmVzaXplOiBmYWxzZSwgLy8gcHJldmVudCBzbGlkZXIgZnJvbSBjYXVzaW5nIGEgcmVzaXplIHdoZW4gdGh1bWIgaXMgYXQgbWluIG9yIG1heFxyXG4gICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICBuZXcgSEJveCgge1xyXG4gICAgICAgICAgICBzcGFjaW5nOiBvcHRpb25zLnhTcGFjaW5nLFxyXG4gICAgICAgICAgICBjaGlsZHJlbjogWyB0aXRsZU5vZGUsIGRlY3JlbWVudEJ1dHRvbiEsIG51bWJlckRpc3BsYXksIGluY3JlbWVudEJ1dHRvbiEgXVxyXG4gICAgICAgICAgfSApLFxyXG4gICAgICAgICAgc2xpZGVyXHJcbiAgICAgICAgXVxyXG4gICAgICB9ICk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBvbmUgb2YgdGhlIHByZS1kZWZpbmVkIGxheW91dCBmdW5jdGlvbnMgdGhhdCBjYW4gYmUgdXNlZCBmb3Igb3B0aW9ucy5sYXlvdXRGdW5jdGlvbi5cclxuICAgKiBBcnJhbmdlcyBzdWJjb21wb25lbnRzIGxpa2UgdGhpczpcclxuICAgKlxyXG4gICAqICB0aXRsZVxyXG4gICAqICA8IG51bWJlciA+XHJcbiAgICogIC0tLS0tLS18LS0tLS0tLVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlTGF5b3V0RnVuY3Rpb24zKCBwcm92aWRlZE9wdGlvbnM/OiBOdW1iZXJDb250cm9sTGF5b3V0RnVuY3Rpb24zT3B0aW9ucyApOiBMYXlvdXRGdW5jdGlvbiB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxOdW1iZXJDb250cm9sTGF5b3V0RnVuY3Rpb24zT3B0aW9ucz4oKSgge1xyXG4gICAgICBhbGlnblRpdGxlOiAnY2VudGVyJyxcclxuICAgICAgYWxpZ25OdW1iZXI6ICdjZW50ZXInLFxyXG4gICAgICB0aXRsZUxlZnRJbmRlbnQ6IDAsXHJcbiAgICAgIHhTcGFjaW5nOiA1LFxyXG4gICAgICB5U3BhY2luZzogNVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgcmV0dXJuICggdGl0bGVOb2RlLCBudW1iZXJEaXNwbGF5LCBzbGlkZXIsIGRlY3JlbWVudEJ1dHRvbiwgaW5jcmVtZW50QnV0dG9uICkgPT4ge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkZWNyZW1lbnRCdXR0b24gKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaW5jcmVtZW50QnV0dG9uICk7XHJcblxyXG4gICAgICBjb25zdCB0aXRsZUFuZENvbnRlbnRWQm94ID0gbmV3IFZCb3goIHtcclxuICAgICAgICBzcGFjaW5nOiBvcHRpb25zLnlTcGFjaW5nLFxyXG4gICAgICAgIHJlc2l6ZTogZmFsc2UsIC8vIHByZXZlbnQgc2xpZGVyIGZyb20gY2F1c2luZyBhIHJlc2l6ZSB3aGVuIHRodW1iIGlzIGF0IG1pbiBvciBtYXhcclxuICAgICAgICBhbGlnbjogb3B0aW9ucy5hbGlnblRpdGxlLFxyXG4gICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICBuZXcgQWxpZ25Cb3goIHRpdGxlTm9kZSwgeyBsZWZ0TWFyZ2luOiBvcHRpb25zLnRpdGxlTGVmdEluZGVudCB9ICksXHJcbiAgICAgICAgICBuZXcgVkJveCgge1xyXG4gICAgICAgICAgICBzcGFjaW5nOiBvcHRpb25zLnlTcGFjaW5nLFxyXG4gICAgICAgICAgICByZXNpemU6IGZhbHNlLCAvLyBwcmV2ZW50IHNsaWRlciBmcm9tIGNhdXNpbmcgYSByZXNpemUgd2hlbiB0aHVtYiBpcyBhdCBtaW4gb3IgbWF4XHJcbiAgICAgICAgICAgIGFsaWduOiBvcHRpb25zLmFsaWduTnVtYmVyLFxyXG4gICAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICAgIG5ldyBIQm94KCB7XHJcbiAgICAgICAgICAgICAgICBzcGFjaW5nOiBvcHRpb25zLnhTcGFjaW5nLFxyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IFsgZGVjcmVtZW50QnV0dG9uISwgbnVtYmVyRGlzcGxheSwgaW5jcmVtZW50QnV0dG9uISBdXHJcbiAgICAgICAgICAgICAgfSApLFxyXG4gICAgICAgICAgICAgIHNsaWRlclxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9IClcclxuICAgICAgICBdXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIFdoZW4gdGhlIHRleHQgb2YgdGhlIHRpdGxlIGNoYW5nZXMgcmVjb21wdXRlIHRoZSBhbGlnbm1lbnQgYmV0d2VlbiB0aGUgdGl0bGUgYW5kIGNvbnRlbnRcclxuICAgICAgdGl0bGVOb2RlLmJvdW5kc1Byb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XHJcbiAgICAgICAgdGl0bGVBbmRDb250ZW50VkJveC51cGRhdGVMYXlvdXQoKTtcclxuICAgICAgfSApO1xyXG4gICAgICByZXR1cm4gdGl0bGVBbmRDb250ZW50VkJveDtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIG9uZSBvZiB0aGUgcHJlLWRlZmluZWQgbGF5b3V0IGZ1bmN0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIGZvciBvcHRpb25zLmxheW91dEZ1bmN0aW9uLlxyXG4gICAqIExpa2UgY3JlYXRlTGF5b3V0RnVuY3Rpb24xLCBidXQgdGhlIHRpdGxlIGFuZCB2YWx1ZSBnbyBhbGwgdGhlIHdheSB0byB0aGUgZWRnZXMuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjcmVhdGVMYXlvdXRGdW5jdGlvbjQoIHByb3ZpZGVkT3B0aW9ucz86IE51bWJlckNvbnRyb2xMYXlvdXRGdW5jdGlvbjRPcHRpb25zICk6IExheW91dEZ1bmN0aW9uIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPE51bWJlckNvbnRyb2xMYXlvdXRGdW5jdGlvbjRPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBhZGRzIGFkZGl0aW9uYWwgaG9yaXpvbnRhbCBzcGFjZSBiZXR3ZWVuIHRpdGxlIGFuZCBOdW1iZXJEaXNwbGF5XHJcbiAgICAgIHNsaWRlclBhZGRpbmc6IDAsXHJcblxyXG4gICAgICAvLyB2ZXJ0aWNhbCBzcGFjaW5nIGJldHdlZW4gc2xpZGVyIGFuZCB0aXRsZS9OdW1iZXJEaXNwbGF5XHJcbiAgICAgIHZlcnRpY2FsU3BhY2luZzogNSxcclxuXHJcbiAgICAgIC8vIHNwYWNpbmcgYmV0d2VlbiBzbGlkZXIgYW5kIGFycm93IGJ1dHRvbnNcclxuICAgICAgYXJyb3dCdXR0b25TcGFjaW5nOiA1LFxyXG4gICAgICBoYXNSZWFkb3V0UHJvcGVydHk6IG51bGwsXHJcblxyXG4gICAgICBsYXlvdXRJbnZpc2libGVCdXR0b25zOiBmYWxzZSxcclxuXHJcbiAgICAgIGNyZWF0ZUJvdHRvbUNvbnRlbnQ6IG51bGwgLy8gU3VwcG9ydHMgUGVuZHVsdW0gTGFiJ3MgcXVlc3Rpb25UZXh0IHdoZXJlIGEgcXVlc3Rpb24gaXMgc3Vic3RpdHV0ZWQgZm9yIHRoZSBzbGlkZXJcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHJldHVybiAoIHRpdGxlTm9kZSwgbnVtYmVyRGlzcGxheSwgc2xpZGVyLCBkZWNyZW1lbnRCdXR0b24sIGluY3JlbWVudEJ1dHRvbiApID0+IHtcclxuICAgICAgY29uc3QgaW5jbHVkZUFycm93QnV0dG9ucyA9ICEhZGVjcmVtZW50QnV0dG9uOyAvLyBpZiB0aGVyZSBhcmVuJ3QgYXJyb3cgYnV0dG9ucywgdGhlbiBleGNsdWRlIHRoZW1cclxuICAgICAgY29uc3QgYm90dG9tQm94ID0gbmV3IEhCb3goIHtcclxuICAgICAgICBzcGFjaW5nOiBvcHRpb25zLmFycm93QnV0dG9uU3BhY2luZyxcclxuICAgICAgICBjaGlsZHJlbjogIWluY2x1ZGVBcnJvd0J1dHRvbnMgPyBbIHNsaWRlciBdIDogW1xyXG4gICAgICAgICAgZGVjcmVtZW50QnV0dG9uLFxyXG4gICAgICAgICAgc2xpZGVyLFxyXG4gICAgICAgICAgaW5jcmVtZW50QnV0dG9uIVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kczogIW9wdGlvbnMubGF5b3V0SW52aXNpYmxlQnV0dG9uc1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBEeW5hbWljIGxheW91dCBzdXBwb3J0ZWRcclxuICAgICAgcmV0dXJuIG5ldyBWQm94KCB7XHJcbiAgICAgICAgc3BhY2luZzogb3B0aW9ucy52ZXJ0aWNhbFNwYWNpbmcsXHJcbiAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgIG5ldyBIQm94KCB7XHJcbiAgICAgICAgICAgIHNwYWNpbmc6IG9wdGlvbnMuc2xpZGVyUGFkZGluZyxcclxuICAgICAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgICAgICB0aXRsZU5vZGUsXHJcbiAgICAgICAgICAgICAgbmV3IE5vZGUoIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbIG51bWJlckRpc3BsYXkgXSxcclxuICAgICAgICAgICAgICAgIHZpc2libGVQcm9wZXJ0eTogb3B0aW9ucy5oYXNSZWFkb3V0UHJvcGVydHkgfHwgbnVsbCxcclxuICAgICAgICAgICAgICAgIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHM6IHRydWVcclxuICAgICAgICAgICAgICB9IClcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgbGF5b3V0T3B0aW9uczogeyBzdHJldGNoOiB0cnVlIH1cclxuICAgICAgICAgIH0gKSxcclxuICAgICAgICAgIG5ldyBOb2RlKCB7XHJcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICAgICAgb3B0aW9ucy5jcmVhdGVCb3R0b21Db250ZW50ID8gb3B0aW9ucy5jcmVhdGVCb3R0b21Db250ZW50KCBib3R0b21Cb3ggKSA6IGJvdHRvbUJveFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICBsYXlvdXRPcHRpb25zOiB7IHhNYXJnaW46IG9wdGlvbnMuc2xpZGVyUGFkZGluZyB9XHJcbiAgICAgICAgICB9IClcclxuICAgICAgICBdXHJcbiAgICAgIH0gKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE51bWJlckNvbnRyb2xJTyA9IG5ldyBJT1R5cGUoICdOdW1iZXJDb250cm9sSU8nLCB7XHJcbiAgICB2YWx1ZVR5cGU6IE51bWJlckNvbnRyb2wsXHJcbiAgICBkb2N1bWVudGF0aW9uOiAnQSBudW1iZXIgY29udHJvbCB3aXRoIGEgdGl0bGUsIHNsaWRlciBhbmQgKy8tIGJ1dHRvbnMnLFxyXG4gICAgc3VwZXJ0eXBlOiBOb2RlLk5vZGVJT1xyXG4gIH0gKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFNMSURFUl9UQU5ERU1fTkFNRSA9ICdzbGlkZXInIGFzIGNvbnN0O1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGUgYWxsIG9mIHRoZSBjYWxsYmFjayByZWxhdGVkIG9wdGlvbnMuIFRoZXJlIGFyZSB0d28gdHlwZXMgb2YgY2FsbGJhY2tzLiBUaGUgXCJzdGFydC9lbmRDYWxsYmFja1wiIHBhaXJcclxuICogYXJlIHBhc3NlZCBpbnRvIGFsbCBjb21wb25lbnRzIGluIHRoZSBOdW1iZXJDb250cm9sLiBUaGUgc2Vjb25kIHNldCBhcmUgc3RhcnQvZW5kIGNhbGxiYWNrcyBmb3IgZWFjaCBpbmRpdmlkdWFsXHJcbiAqIGNvbXBvbmVudC4gVGhpcyB3YXMgYWRkZWQgdG8gc3VwcG9ydCBtdWx0aXRvdWNoIGluIFJ1dGhlcmZvcmQgU2NhdHRlcmluZyBhcyBwYXJ0IG9mXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9ydXRoZXJmb3JkLXNjYXR0ZXJpbmcvaXNzdWVzLzEyOC5cclxuICpcclxuICogVGhpcyBmdW5jdGlvbiBtdXRhdGVzIHRoZSBvcHRpb25zIGJ5IGluaXRpYWxpemluZyBnZW5lcmFsIGNhbGxiYWNrcyBmcm9tIG51bGwgKGluIHRoZSBleHRlbmQgY2FsbCkgdG8gYSBuby1vcFxyXG4gKiBmdW5jdGlvbi5cclxuICpcclxuICogT25seSBnZW5lcmFsIG9yIHNwZWNpZmljIGNhbGxiYWNrcyBhcmUgYWxsb3dlZCwgYnV0IG5vdCBib3RoLlxyXG4gKi9cclxuZnVuY3Rpb24gdmFsaWRhdGVDYWxsYmFja3MoIG9wdGlvbnM6IE51bWJlckNvbnRyb2xPcHRpb25zICk6IHZvaWQge1xyXG4gIGNvbnN0IG5vcm1hbENhbGxiYWNrc1ByZXNlbnQgPSAhISggb3B0aW9ucy5zdGFydENhbGxiYWNrIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmVuZENhbGxiYWNrICk7XHJcbiAgbGV0IGFycm93Q2FsbGJhY2tzUHJlc2VudCA9IGZhbHNlO1xyXG4gIGxldCBzbGlkZXJDYWxsYmFja3NQcmVzZW50ID0gZmFsc2U7XHJcblxyXG4gIGlmICggb3B0aW9ucy5hcnJvd0J1dHRvbk9wdGlvbnMgKSB7XHJcbiAgICBhcnJvd0NhbGxiYWNrc1ByZXNlbnQgPSBzcGVjaWZpY0NhbGxiYWNrS2V5c0luT3B0aW9ucyggb3B0aW9ucy5hcnJvd0J1dHRvbk9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIGlmICggb3B0aW9ucy5zbGlkZXJPcHRpb25zICkge1xyXG4gICAgc2xpZGVyQ2FsbGJhY2tzUHJlc2VudCA9IHNwZWNpZmljQ2FsbGJhY2tLZXlzSW5PcHRpb25zKCBvcHRpb25zLnNsaWRlck9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHNwZWNpZmljQ2FsbGJhY2tzUHJlc2VudCA9IGFycm93Q2FsbGJhY2tzUHJlc2VudCB8fCBzbGlkZXJDYWxsYmFja3NQcmVzZW50O1xyXG5cclxuICAvLyBvbmx5IGdlbmVyYWwgb3IgY29tcG9uZW50IHNwZWNpZmljIGNhbGxiYWNrcyBhcmUgc3VwcG9ydGVkXHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggISggbm9ybWFsQ2FsbGJhY2tzUHJlc2VudCAmJiBzcGVjaWZpY0NhbGxiYWNrc1ByZXNlbnQgKSxcclxuICAgICdVc2UgZ2VuZXJhbCBjYWxsYmFja3MgbGlrZSBcInN0YXJ0Q2FsbGJhY2tcIiBvciBzcGVjaWZpYyBjYWxsYmFja3MgbGlrZSBcInNsaWRlck9wdGlvbnMuc3RhcnREcmFnXCIgYnV0IG5vdCBib3RoLicgKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrIGZvciBhbiBpbnRlcnNlY3Rpb24gYmV0d2VlbiB0aGUgYXJyYXkgb2YgY2FsbGJhY2sgb3B0aW9uIGtleXMgYW5kIHRob3NlXHJcbiAqIHBhc3NlZCBpbiB0aGUgb3B0aW9ucyBvYmplY3QuIFRoZXNlIGNhbGxiYWNrIG9wdGlvbnMgYXJlIG9ubHkgdGhlIHNwZWNpZmljIGNvbXBvbmVudCBjYWxsYmFja3MsIG5vdCB0aGUgZ2VuZXJhbFxyXG4gKiBzdGFydC9lbmQgdGhhdCBhcmUgY2FsbGVkIGZvciBldmVyeSBjb21wb25lbnQncyBpbnRlcmFjdGlvblxyXG4gKi9cclxuZnVuY3Rpb24gc3BlY2lmaWNDYWxsYmFja0tleXNJbk9wdGlvbnMoIG9wdGlvbnM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ICk6IGJvb2xlYW4ge1xyXG4gIGNvbnN0IG9wdGlvbktleXMgPSBPYmplY3Qua2V5cyggb3B0aW9ucyApO1xyXG4gIGNvbnN0IGludGVyc2VjdGlvbiA9IFNQRUNJRklDX0NPTVBPTkVOVF9DQUxMQkFDS19PUFRJT05TLmZpbHRlciggeCA9PiBfLmluY2x1ZGVzKCBvcHRpb25LZXlzLCB4ICkgKTtcclxuICByZXR1cm4gaW50ZXJzZWN0aW9uLmxlbmd0aCA+IDA7XHJcbn1cclxuXHJcbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnTnVtYmVyQ29udHJvbCcsIE51bWJlckNvbnRyb2wgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLGtDQUFrQztBQUk5RCxPQUFPQyxVQUFVLE1BQU0sNEJBQTRCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSx1QkFBdUI7QUFDekMsT0FBT0MsS0FBSyxNQUFNLHVCQUF1QjtBQUN6QyxPQUFPQyxnQkFBZ0IsTUFBTSxzREFBc0Q7QUFDbkYsT0FBT0MsU0FBUyxJQUFJQyxjQUFjLFFBQVEsaUNBQWlDO0FBSzNFLFNBQVNDLFFBQVEsRUFBUUMsSUFBSSxFQUFFQyxJQUFJLEVBQWVDLGtCQUFrQixFQUFFQyxJQUFJLEVBQWVDLElBQUksUUFBUSw2QkFBNkI7QUFDbEksT0FBT0MsV0FBVyxNQUE4QixxQ0FBcUM7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