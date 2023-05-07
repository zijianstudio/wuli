// Copyright 2013-2023, University of Colorado Boulder

/**
 * Slider, with support for horizontal and vertical orientations. By default, the slider is constructed in the
 * horizontal orientation, then adjusted if the vertical orientation was specified.
 *
 * Note: This type was originally named HSlider, renamed in https://github.com/phetsims/sun/issues/380.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../axon/js/Property.js';
import ReadOnlyProperty from '../../axon/js/ReadOnlyProperty.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import CompletePiecewiseLinearFunction from '../../dot/js/CompletePiecewiseLinearFunction.js';
import Range from '../../dot/js/Range.js';
import Utils from '../../dot/js/Utils.js';
import assertMutuallyExclusiveOptions from '../../phet-core/js/assertMutuallyExclusiveOptions.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import Orientation from '../../phet-core/js/Orientation.js';
import swapObjectKeys from '../../phet-core/js/swapObjectKeys.js';
import { DragListener, FocusHighlightFromNode, LayoutConstraint, Node, SceneryConstants, Sizable } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import ValueChangeSoundPlayer from '../../tambo/js/sound-generators/ValueChangeSoundPlayer.js';
import AccessibleSlider from './accessibility/AccessibleSlider.js';
import DefaultSliderTrack from './DefaultSliderTrack.js';
import SliderThumb from './SliderThumb.js';
import SliderTick from './SliderTick.js';
import sun from './sun.js';
import Multilink from '../../axon/js/Multilink.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import SunConstants from './SunConstants.js';
import createObservableArray from '../../axon/js/createObservableArray.js';
// constants
const DEFAULT_HORIZONTAL_TRACK_SIZE = new Dimension2(100, 5);
const DEFAULT_HORIZONTAL_THUMB_SIZE = new Dimension2(17, 34);

// We provide these options to the super, also enabledRangeProperty is turned from required to optional

export default class Slider extends Sizable(AccessibleSlider(Node, 0)) {
  // public so that clients can access Properties of these DragListeners that tell us about its state
  // See https://github.com/phetsims/sun/issues/680
  // options needed by prototype functions that add ticks
  // ticks are added to these parents, so they are behind the knob
  ticks = createObservableArray();

  // This is a marker to indicate that we should create the actual default slider sound.
  static DEFAULT_SOUND = new ValueChangeSoundPlayer(new Range(0, 1));

  // If the user is holding down the thumb outside of the enabled range, and the enabled range expands, the value should
  // adjust to the new extremum of the range, see https://github.com/phetsims/mean-share-and-balance/issues/29
  // This value is set during thumb drag, or null if not currently being dragged.
  proposedValue = null;
  constructor(valueProperty, range, providedOptions) {
    // Guard against mutually exclusive options before defaults are filled in.
    assert && assertMutuallyExclusiveOptions(providedOptions, ['thumbNode'], ['thumbSize', 'thumbFill', 'thumbFillHighlighted', 'thumbStroke', 'thumbLineWidth', 'thumbCenterLineStroke', 'thumbTouchAreaXDilation', 'thumbTouchAreaYDilation', 'thumbMouseAreaXDilation', 'thumbMouseAreaYDilation']);
    assert && assertMutuallyExclusiveOptions(providedOptions, ['trackNode'], ['trackSize', 'trackFillEnabled', 'trackFillDisabled', 'trackStroke', 'trackLineWidth', 'trackCornerRadius']);
    const options = optionize()({
      orientation: Orientation.HORIZONTAL,
      trackNode: null,
      trackSize: null,
      trackFillEnabled: 'white',
      trackFillDisabled: 'gray',
      trackStroke: 'black',
      trackLineWidth: 1,
      trackCornerRadius: 0,
      trackPickable: true,
      thumbNode: null,
      thumbSize: null,
      thumbFill: 'rgb(50,145,184)',
      thumbFillHighlighted: 'rgb(71,207,255)',
      thumbStroke: 'black',
      thumbLineWidth: 1,
      thumbCenterLineStroke: 'white',
      thumbTouchAreaXDilation: 11,
      thumbTouchAreaYDilation: 11,
      thumbMouseAreaXDilation: 0,
      thumbMouseAreaYDilation: 0,
      thumbYOffset: 0,
      tickLabelSpacing: 6,
      majorTickLength: 25,
      majorTickStroke: 'black',
      majorTickLineWidth: 1,
      minorTickLength: 10,
      minorTickStroke: 'black',
      minorTickLineWidth: 1,
      cursor: 'pointer',
      startDrag: _.noop,
      drag: _.noop,
      endDrag: _.noop,
      constrainValue: _.identity,
      disabledOpacity: SceneryConstants.DISABLED_OPACITY,
      soundGenerator: Slider.DEFAULT_SOUND,
      valueChangeSoundGeneratorOptions: {},
      // phet-io
      phetioLinkedProperty: null,
      // Supertype options
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'Slider',
      phetioType: Slider.SliderIO,
      visiblePropertyOptions: {
        phetioFeatured: true
      },
      phetioEnabledPropertyInstrumented: true // opt into default PhET-iO instrumented enabledProperty
    }, providedOptions);
    const rangeProperty = range instanceof Range ? new TinyProperty(range) : range;

    // assert && assert( options.soundGenerator === Slider.DEFAULT_SOUND || _.isEmpty( options.valueChangeSoundGeneratorOptions ),
    //   'options should only be supplied when using default sound generator' );

    // If no sound generator was provided, create the default.
    if (options.soundGenerator === Slider.DEFAULT_SOUND) {
      options.soundGenerator = new ValueChangeSoundPlayer(rangeProperty.value, options.valueChangeSoundGeneratorOptions || {});
    } else if (options.soundGenerator === null) {
      options.soundGenerator = ValueChangeSoundPlayer.NO_SOUND;
    }

    // Set up the drag handler to generate sound when drag events cause changes.
    if (options.soundGenerator !== ValueChangeSoundPlayer.NO_SOUND) {
      // variable to keep track of the value at the start of user drag interactions
      let previousValue = valueProperty.value;

      // Enhance the drag handler to perform sound generation.
      const providedDrag = options.drag;
      options.drag = event => {
        if (event.isFromPDOM()) {
          options.soundGenerator.playSoundForValueChange(valueProperty.value, previousValue);
        } else {
          options.soundGenerator.playSoundIfThresholdReached(valueProperty.value, previousValue);
        }
        providedDrag(event);
        previousValue = valueProperty.value;
      };
    }
    if (options.orientation === Orientation.VERTICAL) {
      // For a vertical slider, the client should provide dimensions that are specific to a vertical slider.
      // But Slider expects dimensions for a horizontal slider, and then creates the vertical orientation using rotation.
      // So if the client provides any dimensions for a vertical slider, swap those dimensions to horizontal.
      if (options.trackSize) {
        options.trackSize = options.trackSize.swapped();
      }
      if (options.thumbSize) {
        options.thumbSize = options.thumbSize.swapped();
      }
      swapObjectKeys(options, 'thumbTouchAreaXDilation', 'thumbTouchAreaYDilation');
      swapObjectKeys(options, 'thumbMouseAreaXDilation', 'thumbMouseAreaYDilation');
    }
    options.trackSize = options.trackSize || DEFAULT_HORIZONTAL_TRACK_SIZE;
    options.thumbSize = options.thumbSize || DEFAULT_HORIZONTAL_THUMB_SIZE;
    const thumbTandem = options.tandem.createTandem(Slider.THUMB_NODE_TANDEM_NAME);
    if (Tandem.VALIDATION && options.thumbNode) {
      assert && assert(options.thumbNode.tandem.equals(thumbTandem), `Passed-in thumbNode must have the correct tandem. Expected: ${thumbTandem.phetioID}, actual: ${options.thumbNode.tandem.phetioID}`);
    }

    // The thumb of the slider
    const thumb = options.thumbNode || new SliderThumb({
      // propagate superOptions that are specific to SliderThumb
      size: options.thumbSize,
      fill: options.thumbFill,
      fillHighlighted: options.thumbFillHighlighted,
      stroke: options.thumbStroke,
      lineWidth: options.thumbLineWidth,
      centerLineStroke: options.thumbCenterLineStroke,
      tandem: thumbTandem
    });
    const ownsEnabledRangeProperty = !options.enabledRangeProperty;
    const boundsRequiredOptionKeys = _.pick(options, Node.REQUIRES_BOUNDS_OPTION_KEYS);

    // Now add in the required options when passing to the super type
    const superOptions = combineOptions({
      ariaOrientation: options.orientation,
      valueProperty: valueProperty,
      panTargetNode: thumb,
      // controls the portion of the slider that is enabled
      enabledRangeProperty: options.enabledRangeProperty || (range instanceof Range ? new Property(range, {
        valueType: Range,
        isValidValue: value => value.min >= range.min && value.max <= range.max,
        tandem: options.tandem.createTandem('enabledRangeProperty'),
        phetioValueType: Range.RangeIO,
        phetioDocumentation: 'Sliders support two ranges: the outer range which specifies the min and max of the track and ' + 'the enabledRangeProperty, which determines how low and high the thumb can be dragged within the track.'
      }) : range)
    }, options);
    super(superOptions);
    this.orientation = superOptions.orientation;
    this.enabledRangeProperty = superOptions.enabledRangeProperty;
    this.tickOptions = _.pick(options, 'tickLabelSpacing', 'majorTickLength', 'majorTickStroke', 'majorTickLineWidth', 'minorTickLength', 'minorTickStroke', 'minorTickLineWidth');
    const sliderParts = [];

    // ticks are added to these parents, so they are behind the knob
    this.majorTicksParent = new Node();
    this.minorTicksParent = new Node();
    sliderParts.push(this.majorTicksParent);
    sliderParts.push(this.minorTicksParent);
    const trackTandem = options.tandem.createTandem(Slider.TRACK_NODE_TANDEM_NAME);
    if (Tandem.VALIDATION && options.trackNode) {
      assert && assert(options.trackNode.tandem.equals(trackTandem), `Passed-in trackNode must have the correct tandem. Expected: ${trackTandem.phetioID}, actual: ${options.trackNode.tandem.phetioID}`);
    }
    const trackSpacer = new Node();
    sliderParts.push(trackSpacer);

    // Assertion to get around mutating the null-default based on the slider orientation.
    assert && assert(superOptions.trackSize, 'trackSize should not be null');
    this.track = options.trackNode || new DefaultSliderTrack(valueProperty, range, {
      // propagate options that are specific to SliderTrack
      size: superOptions.trackSize,
      fillEnabled: superOptions.trackFillEnabled,
      fillDisabled: superOptions.trackFillDisabled,
      stroke: superOptions.trackStroke,
      lineWidth: superOptions.trackLineWidth,
      cornerRadius: superOptions.trackCornerRadius,
      startDrag: superOptions.startDrag,
      drag: superOptions.drag,
      endDrag: superOptions.endDrag,
      constrainValue: superOptions.constrainValue,
      enabledRangeProperty: this.enabledRangeProperty,
      soundGenerator: options.soundGenerator,
      pickable: superOptions.trackPickable,
      voicingOnEndResponse: this.voicingOnEndResponse.bind(this),
      // phet-io
      tandem: trackTandem
    });

    // Add the track
    sliderParts.push(this.track);

    // Position the thumb vertically.
    thumb.setCenterY(this.track.centerY + options.thumbYOffset);
    sliderParts.push(thumb);

    // Wrap all of the slider parts in a Node, and set the orientation of that Node.
    // This allows us to still decorate the Slider with additional children.
    // See https://github.com/phetsims/sun/issues/406
    const sliderPartsNode = new Node({
      children: sliderParts
    });
    if (options.orientation === Orientation.VERTICAL) {
      sliderPartsNode.rotation = SunConstants.SLIDER_VERTICAL_ROTATION;
    }
    this.addChild(sliderPartsNode);

    // touchArea for the default thumb. If a custom thumb is provided, the client is responsible for its touchArea.
    if (!options.thumbNode && (options.thumbTouchAreaXDilation || options.thumbTouchAreaYDilation)) {
      thumb.touchArea = thumb.localBounds.dilatedXY(options.thumbTouchAreaXDilation, options.thumbTouchAreaYDilation);
    }

    // mouseArea for the default thumb. If a custom thumb is provided, the client is responsible for its mouseArea.
    if (!options.thumbNode && (options.thumbMouseAreaXDilation || options.thumbMouseAreaYDilation)) {
      thumb.mouseArea = thumb.localBounds.dilatedXY(options.thumbMouseAreaXDilation, options.thumbMouseAreaYDilation);
    }

    // update value when thumb is dragged
    let clickXOffset = 0; // x-offset between initial click and thumb's origin
    let valueOnStart = valueProperty.value; // For description so we can describe value changes between interactions
    const thumbDragListener = new DragListener({
      // Deviate from the variable name because we will nest this tandem under the thumb directly
      tandem: thumb.tandem.createTandem('dragListener'),
      start: (event, listener) => {
        if (this.enabledProperty.get()) {
          valueOnStart = valueProperty.value;
          options.startDrag(event);
          const transform = listener.pressedTrail.subtrailTo(sliderPartsNode).getTransform();

          // Determine the offset relative to the center of the thumb
          clickXOffset = transform.inversePosition2(event.pointer.point).x - thumb.centerX;
        }
      },
      drag: (event, listener) => {
        if (this.enabledProperty.get()) {
          const transform = listener.pressedTrail.subtrailTo(sliderPartsNode).getTransform(); // we only want the transform to our parent
          const x = transform.inversePosition2(event.pointer.point).x - clickXOffset;
          this.proposedValue = this.track.valueToPositionProperty.value.inverse(x);
          const valueInRange = this.enabledRangeProperty.get().constrainValue(this.proposedValue);
          valueProperty.set(options.constrainValue(valueInRange));

          // after valueProperty is set so listener can use the new value
          options.drag(event);
        }
      },
      end: event => {
        if (this.enabledProperty.get()) {
          options.endDrag(event);

          // voicing - Default behavior is to speak the new object response at the end of interaction. If you want to
          // customize this response, you can modify supertype options VoicingOnEndResponseOptions.
          this.voicingOnEndResponse(valueOnStart);
        }
        this.proposedValue = null;
      }
    });
    thumb.addInputListener(thumbDragListener);
    this.thumbDragListener = thumbDragListener;
    this.trackDragListener = this.track.dragListener;

    // update thumb position when value changes
    const valueMultilink = Multilink.multilink([valueProperty, this.track.valueToPositionProperty], (value, valueToPosition) => {
      thumb.centerX = valueToPosition.evaluate(value);
    });

    // when the enabled range changes, the value to position linear function must change as well
    const enabledRangeObserver = enabledRange => {
      const joistGlobal = _.get(window, 'phet.joist', null); // returns null if global isn't found

      // When restoring PhET-iO state, prevent the clamp from setting a stale, incorrect value to a deferred Property
      // (which may have already restored the correct value from phet-io state), see https://github.com/phetsims/mean-share-and-balance/issues/21
      if (!joistGlobal || !valueProperty.isPhetioInstrumented() || !joistGlobal.sim.isSettingPhetioStateProperty.value) {
        if (this.proposedValue === null) {
          // clamp the current value to the enabled range if it changes
          valueProperty.set(Utils.clamp(valueProperty.value, enabledRange.min, enabledRange.max));
        } else {
          // The user is holding the thumb, which may be outside the enabledRange.  In that case, expanding the range
          // could accommodate the outer value
          const proposedValueInEnabledRange = Utils.clamp(this.proposedValue, enabledRange.min, enabledRange.max);
          const proposedValueInConstrainedRange = options.constrainValue(proposedValueInEnabledRange);
          valueProperty.set(proposedValueInConstrainedRange);
        }
      }
    };
    this.enabledRangeProperty.link(enabledRangeObserver); // needs to be unlinked in dispose function

    const constraint = new SliderConstraint(this, this.track, thumb, sliderPartsNode, options.orientation, trackSpacer, this.ticks);
    this.disposeSlider = () => {
      constraint.dispose();
      thumb.dispose && thumb.dispose(); // in case a custom thumb is provided via options.thumbNode that doesn't implement dispose
      this.track.dispose && this.track.dispose();
      if (ownsEnabledRangeProperty) {
        this.enabledRangeProperty.dispose();
      } else {
        this.enabledRangeProperty.unlink(enabledRangeObserver);
      }
      valueMultilink.dispose();
      thumbDragListener.dispose();
    };

    // pdom - custom focus highlight that surrounds and moves with the thumb
    this.focusHighlight = new FocusHighlightFromNode(thumb);
    assert && Tandem.VALIDATION && assert(!options.phetioLinkedProperty || options.phetioLinkedProperty.isPhetioInstrumented(), 'If provided, phetioLinkedProperty should be PhET-iO instrumented');

    // Must happen after instrumentation (in super call)
    const linkedProperty = options.phetioLinkedProperty || (valueProperty instanceof ReadOnlyProperty ? valueProperty : null);
    if (linkedProperty) {
      this.addLinkedElement(linkedProperty, {
        tandem: options.tandem.createTandem('valueProperty')
      });
    }

    // must be after the button is instrumented
    // assert && assert( !this.isPhetioInstrumented() || this.enabledRangeProperty.isPhetioInstrumented() );
    !ownsEnabledRangeProperty && this.enabledRangeProperty instanceof ReadOnlyProperty && this.addLinkedElement(this.enabledRangeProperty, {
      tandem: options.tandem.createTandem('enabledRangeProperty')
    });
    this.mutate(boundsRequiredOptionKeys);

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('sun', 'Slider', this);
  }
  get majorTicksVisible() {
    return this.getMajorTicksVisible();
  }
  set majorTicksVisible(value) {
    this.setMajorTicksVisible(value);
  }
  get minorTicksVisible() {
    return this.getMinorTicksVisible();
  }
  set minorTicksVisible(value) {
    this.setMinorTicksVisible(value);
  }
  dispose() {
    this.disposeSlider();
    this.ticks.forEach(tick => {
      tick.dispose();
    });
    super.dispose();
  }

  /**
   * Adds a major tick mark.
   */
  addMajorTick(value, label) {
    this.addTick(this.majorTicksParent, value, label, this.tickOptions.majorTickLength, this.tickOptions.majorTickStroke, this.tickOptions.majorTickLineWidth);
  }

  /**
   * Adds a minor tick mark.
   */
  addMinorTick(value, label) {
    this.addTick(this.minorTicksParent, value, label, this.tickOptions.minorTickLength, this.tickOptions.minorTickStroke, this.tickOptions.minorTickLineWidth);
  }

  /**
   * Adds a tick mark above the track.
   */
  addTick(parent, value, label, length, stroke, lineWidth) {
    this.ticks.push(new SliderTick(parent, value, label, length, stroke, lineWidth, this.tickOptions, this.orientation, this.track));
  }

  // Sets visibility of major ticks.
  setMajorTicksVisible(visible) {
    this.majorTicksParent.visible = visible;
  }

  // Gets visibility of major ticks.
  getMajorTicksVisible() {
    return this.majorTicksParent.visible;
  }

  // Sets visibility of minor ticks.
  setMinorTicksVisible(visible) {
    this.minorTicksParent.visible = visible;
  }

  // Gets visibility of minor ticks.
  getMinorTicksVisible() {
    return this.minorTicksParent.visible;
  }

  // standardized tandem names, see https://github.com/phetsims/sun/issues/694
  static THUMB_NODE_TANDEM_NAME = 'thumbNode';
  static TRACK_NODE_TANDEM_NAME = 'trackNode';
  static SliderIO = new IOType('SliderIO', {
    valueType: Slider,
    documentation: 'A traditional slider component, with a knob and possibly tick marks',
    supertype: Node.NodeIO
  });
}
class SliderConstraint extends LayoutConstraint {
  constructor(slider, track, thumb, sliderPartsNode, orientation, trackSpacer, ticks) {
    super(slider);

    // We need to make it sizable in both dimensions (VSlider vs HSlider), but we'll still want to make the opposite
    // axis non-sizable (since it won't be sizable in both orientations at once).
    this.slider = slider;
    this.track = track;
    this.thumb = thumb;
    this.sliderPartsNode = sliderPartsNode;
    this.orientation = orientation;
    this.trackSpacer = trackSpacer;
    this.ticks = ticks;
    if (orientation === Orientation.HORIZONTAL) {
      slider.heightSizable = false;
      this.preferredProperty = this.slider.localPreferredWidthProperty;
    } else {
      slider.widthSizable = false;
      this.preferredProperty = this.slider.localPreferredHeightProperty;
    }
    this.preferredProperty.lazyLink(this._updateLayoutListener);

    // So range changes or minimum changes will trigger layouts (since they can move ticks)
    this.track.rangeProperty.lazyLink(this._updateLayoutListener);

    // Thumb size changes should trigger layout, since we check the width of the thumb
    // NOTE: This is ignoring thumb scale changing, but for performance/correctness it makes sense to avoid that for now
    // so we can rule out infinite loops of thumb movement.
    this.thumb.localBoundsProperty.lazyLink(this._updateLayoutListener);

    // As ticks are added, add a listener to each that will update the layout if the tick's bounds changes.
    const tickAddedListener = addedTick => {
      addedTick.tickNode.localBoundsProperty.lazyLink(this._updateLayoutListener);
      ticks.addItemRemovedListener(removedTick => {
        if (removedTick === addedTick && removedTick.tickNode.localBoundsProperty.hasListener(this._updateLayoutListener)) {
          addedTick.tickNode.localBoundsProperty.unlink(this._updateLayoutListener);
        }
      });
    };
    ticks.addItemAddedListener(tickAddedListener);
    this.addNode(track);
    this.layout();
    this.disposeSliderConstraint = () => {
      ticks.removeItemAddedListener(tickAddedListener);
      this.preferredProperty.unlink(this._updateLayoutListener);
      this.track.rangeProperty.unlink(this._updateLayoutListener);
      this.thumb.localBoundsProperty.unlink(this._updateLayoutListener);
    };
  }
  layout() {
    super.layout();
    const slider = this.slider;
    const track = this.track;
    const thumb = this.thumb;

    // Dilate the local bounds horizontally so that it extends beyond where the thumb can reach.  This prevents layout
    // asymmetry when the slider thumb is off the edges of the track.  See https://github.com/phetsims/sun/issues/282
    this.trackSpacer.localBounds = track.localBounds.dilatedX(thumb.width / 2);
    assert && assert(track.minimumWidth !== null);

    // Our track's (exterior) minimum width will INCLUDE "visual overflow" e.g. stroke. The actual range used for
    // computation of where the thumb/ticks go will be the "interior" width (excluding the visual overflow), e.g.
    // without the stroke. We'll need to track and handle these separately, and only handle tick positioning based on
    // the interior width.
    const totalOverflow = track.leftVisualOverflow + track.rightVisualOverflow;
    const trackMinimumExteriorWidth = track.minimumWidth;
    const trackMinimumInteriorWidth = trackMinimumExteriorWidth - totalOverflow;

    // Takes a tick's value into the [0,1] range. This should be multiplied times the potential INTERIOR track width
    // in order to get the position the tick should be at.
    const normalizeTickValue = value => {
      return Utils.linear(track.rangeProperty.value.min, track.rangeProperty.value.max, 0, 1, value);
    };

    // NOTE: Due to visual overflow, our track's range (including the thumb extension) will actually go from
    // ( -thumb.width / 2 - track.leftVisualOverflow ) on the left to
    // ( trackExteriorWidth + thumb.width / 2 + track.rightVisualOverflow ) on the right.
    // This is because our track's width is reduced to account for stroke, but the logical rectangle is still located
    // at x=0, meaning the stroke (with lineWidth=1) will typically go out to -0.5 (negative left visual overflow).
    // Our horizontal bounds are thus effectively offset by this left visual overflow amount.

    // NOTE: This actually goes PAST where the thumb should go when there is visual overflow, but we also
    // included this "imprecision" in the past (localBounds INCLUDING the stroke was dilated by the thumb width), so we
    // will have a slight bit of additional padding included here.

    // NOTE: Documentation was added before dynamic layout integration (noting the extension BEYOND the bounds):
    // > Dilate the local bounds horizontally so that it extends beyond where the thumb can reach.  This prevents layout
    // > asymmetry when the slider thumb is off the edges of the track.  See https://github.com/phetsims/sun/issues/282
    const leftExteriorOffset = -thumb.width / 2 - track.leftVisualOverflow;
    const rightExteriorOffset = thumb.width / 2 - track.leftVisualOverflow;

    // Start with the size our minimum track would be WITH the added spacing for the thumb
    // NOTE: will be mutated below
    const minimumRange = new Range(leftExteriorOffset, trackMinimumExteriorWidth + rightExteriorOffset);

    // We'll need to consider where the ticks would be IF we had our minimum size (since the ticks would potentially
    // be spaced closer together). So we'll check the bounds of each tick if it was at that location, and
    // ensure that ticks are included in our minimum range (since tick labels may stick out past the track).
    this.ticks.forEach(tick => {
      // Where the tick will be if we have our minimum size
      const tickMinimumPosition = trackMinimumInteriorWidth * normalizeTickValue(tick.value);

      // Adjust the minimum range to include the tick.
      const halfTickWidth = tick.tickNode.width / 2;

      // The tick will be centered
      minimumRange.includeRange(new Range(-halfTickWidth, halfTickWidth).shifted(tickMinimumPosition));
    });
    if (slider.widthSizable && this.preferredProperty.value !== null) {
      // Here's where things get complicated! Above, it's fairly easy to go from "track exterior width" => "slider width",
      // however we need to do the opposite (when our horizontal slider has a preferred width, we need to compute what
      // track width we'll have to make that happen). As I noted in the issue for this work:

      // There's a fun linear optimization problem hiding in plain sight (perhaps a high-performance iterative solution will work):
      // - We can compute a minimum size (given the minimum track size, see where the tick labels go, and include those).
      // - HOWEVER adjusting the track size ALSO adjusts how much the tick labels stick out to the sides (the expansion
      //   of the track will push the tick labels away from the edges).
      // - Different ticks will be the limiting factor for the bounds at different track sizes (a tick label on the very
      //   end should not vary the bounds offset, but a tick label that's larger but slightly offset from the edge WILL
      //   vary the offset)
      // - So it's easy to compute the resulting size from the track size, BUT the inverse problem is more difficult.
      //   Essentially we have a convex piecewise-linear function mapping track size to output size (implicitly defined
      //   by where tick labels swap being the limiting factor), and we need to invert it.

      // Effectively the "track width" => "slider width" is a piecewise-linear function, where the breakpoints occur
      // where ONE tick either becomes the limiting factor or stops being the limiting factor. Mathematically, this works
      // out to be based on the following formulas:

      // The LEFT x is the minimum of all the following:
      //   -thumb.width / 2 - track.leftVisualOverflow
      //   FOR EVERY TICK: -tickWidth / 2 + ( trackWidth - overflow ) * normalizedTickValue
      // The RIGHT x is the maximum of all the following:
      //   trackWidth + thumb.width / 2 - track.leftVisualOverflow
      //   (for every tick) tickWidth / 2 + ( trackWidth - overflow ) * normalizedTickValue
      // NOTE: the "trackWidth - overflow" is the INTERNAL width (not including the stroke) that we use for tick
      // computation
      // This effectively computes how far everything "sticks out" and would affect the bounds.
      //
      // The TOTAL width of the slider will simply be the above RIGHT - LEFT.

      // Instead of using numerical solutions, we're able to solve this analytically with piecewise-linear functions that
      // implement the above functions. We'll consider each of those individual functions as a linear function where
      // the input is the exterior track length, e.g. f(trackLength) = A * trackLength + B, for given A,B values.
      // By min/max-ing these together and then taking the difference, we'll have an accurate function of
      // f(trackLength) = sliderWidth. Then we'll invert that function, e.g. f^-1(sliderWidth) = trackLength, and then
      // we'll be able to pass in our preferred slider width in order to compute the preferred track length.

      // We'll need to factor the trackWidth out for the tick functions, so:
      // LEFT tick computations:
      //   -tickWidth / 2 + ( trackWidth - overflow ) * normalizedTickValue
      // = -tickWidth / 2 + trackWidth * normalizedTickValue - overflow * normalizedTickValue
      // = normalizedTickValue * trackWidth + ( -tickWidth / 2 - overflow * normalizedTickValue )
      // So when we put it in the form of A * trackWidth + B, we get:
      //   A = normalizedTickValue, B = -tickWidth / 2 - overflow * normalizedTickValue
      // Similarly happens for the RIGHT tick computation.

      const trackWidthToFullWidthFunction = CompletePiecewiseLinearFunction.max(
      // Right side (track/thumb)
      CompletePiecewiseLinearFunction.linear(1, rightExteriorOffset),
      // Right side (ticks)
      ...this.ticks.map(tick => {
        const normalizedTickValue = normalizeTickValue(tick.value);
        return CompletePiecewiseLinearFunction.linear(normalizedTickValue, tick.tickNode.width / 2 - totalOverflow * normalizedTickValue);
      })).minus(CompletePiecewiseLinearFunction.min(
      // Left side (track/thumb)
      CompletePiecewiseLinearFunction.constant(leftExteriorOffset),
      // Left side (ticks)
      ...this.ticks.map(tick => {
        const normalizedTickValue = normalizeTickValue(tick.value);
        return CompletePiecewiseLinearFunction.linear(normalizedTickValue, -tick.tickNode.width / 2 - totalOverflow * normalizedTickValue);
      })));

      // NOTE: This function is only monotonically increasing when trackWidth is positive! We'll drop the values
      // underneath our minimum track width (they won't be needed), but we'll need to add an extra point below to ensure
      // that the slope is maintained (due to how CompletePiecewiseLinearFunction works).
      const fullWidthToTrackWidthFunction = trackWidthToFullWidthFunction.withXValues([trackMinimumExteriorWidth - 1, trackMinimumExteriorWidth, ...trackWidthToFullWidthFunction.points.map(point => point.x).filter(x => x > trackMinimumExteriorWidth + 1e-10)]).inverted();
      track.preferredWidth = Math.max(
      // Ensure we're NOT dipping below the minimum track width (for some reason).
      trackMinimumExteriorWidth, fullWidthToTrackWidthFunction.evaluate(this.preferredProperty.value));
    } else {
      track.preferredWidth = track.minimumWidth;
    }
    const minimumWidth = minimumRange.getLength();

    // Set minimums at the end
    if (this.orientation === Orientation.HORIZONTAL) {
      slider.localMinimumWidth = minimumWidth;
    } else {
      slider.localMinimumHeight = minimumWidth;
    }
  }
  dispose() {
    this.disposeSliderConstraint();
    super.dispose();
  }
}
sun.register('Slider', Slider);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlJlYWRPbmx5UHJvcGVydHkiLCJEaW1lbnNpb24yIiwiQ29tcGxldGVQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbiIsIlJhbmdlIiwiVXRpbHMiLCJhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMiLCJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJPcmllbnRhdGlvbiIsInN3YXBPYmplY3RLZXlzIiwiRHJhZ0xpc3RlbmVyIiwiRm9jdXNIaWdobGlnaHRGcm9tTm9kZSIsIkxheW91dENvbnN0cmFpbnQiLCJOb2RlIiwiU2NlbmVyeUNvbnN0YW50cyIsIlNpemFibGUiLCJUYW5kZW0iLCJJT1R5cGUiLCJWYWx1ZUNoYW5nZVNvdW5kUGxheWVyIiwiQWNjZXNzaWJsZVNsaWRlciIsIkRlZmF1bHRTbGlkZXJUcmFjayIsIlNsaWRlclRodW1iIiwiU2xpZGVyVGljayIsInN1biIsIk11bHRpbGluayIsIlRpbnlQcm9wZXJ0eSIsIlN1bkNvbnN0YW50cyIsImNyZWF0ZU9ic2VydmFibGVBcnJheSIsIkRFRkFVTFRfSE9SSVpPTlRBTF9UUkFDS19TSVpFIiwiREVGQVVMVF9IT1JJWk9OVEFMX1RIVU1CX1NJWkUiLCJTbGlkZXIiLCJ0aWNrcyIsIkRFRkFVTFRfU09VTkQiLCJwcm9wb3NlZFZhbHVlIiwiY29uc3RydWN0b3IiLCJ2YWx1ZVByb3BlcnR5IiwicmFuZ2UiLCJwcm92aWRlZE9wdGlvbnMiLCJhc3NlcnQiLCJvcHRpb25zIiwib3JpZW50YXRpb24iLCJIT1JJWk9OVEFMIiwidHJhY2tOb2RlIiwidHJhY2tTaXplIiwidHJhY2tGaWxsRW5hYmxlZCIsInRyYWNrRmlsbERpc2FibGVkIiwidHJhY2tTdHJva2UiLCJ0cmFja0xpbmVXaWR0aCIsInRyYWNrQ29ybmVyUmFkaXVzIiwidHJhY2tQaWNrYWJsZSIsInRodW1iTm9kZSIsInRodW1iU2l6ZSIsInRodW1iRmlsbCIsInRodW1iRmlsbEhpZ2hsaWdodGVkIiwidGh1bWJTdHJva2UiLCJ0aHVtYkxpbmVXaWR0aCIsInRodW1iQ2VudGVyTGluZVN0cm9rZSIsInRodW1iVG91Y2hBcmVhWERpbGF0aW9uIiwidGh1bWJUb3VjaEFyZWFZRGlsYXRpb24iLCJ0aHVtYk1vdXNlQXJlYVhEaWxhdGlvbiIsInRodW1iTW91c2VBcmVhWURpbGF0aW9uIiwidGh1bWJZT2Zmc2V0IiwidGlja0xhYmVsU3BhY2luZyIsIm1ham9yVGlja0xlbmd0aCIsIm1ham9yVGlja1N0cm9rZSIsIm1ham9yVGlja0xpbmVXaWR0aCIsIm1pbm9yVGlja0xlbmd0aCIsIm1pbm9yVGlja1N0cm9rZSIsIm1pbm9yVGlja0xpbmVXaWR0aCIsImN1cnNvciIsInN0YXJ0RHJhZyIsIl8iLCJub29wIiwiZHJhZyIsImVuZERyYWciLCJjb25zdHJhaW5WYWx1ZSIsImlkZW50aXR5IiwiZGlzYWJsZWRPcGFjaXR5IiwiRElTQUJMRURfT1BBQ0lUWSIsInNvdW5kR2VuZXJhdG9yIiwidmFsdWVDaGFuZ2VTb3VuZEdlbmVyYXRvck9wdGlvbnMiLCJwaGV0aW9MaW5rZWRQcm9wZXJ0eSIsInRhbmRlbSIsIlJFUVVJUkVEIiwidGFuZGVtTmFtZVN1ZmZpeCIsInBoZXRpb1R5cGUiLCJTbGlkZXJJTyIsInZpc2libGVQcm9wZXJ0eU9wdGlvbnMiLCJwaGV0aW9GZWF0dXJlZCIsInBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsInJhbmdlUHJvcGVydHkiLCJ2YWx1ZSIsIk5PX1NPVU5EIiwicHJldmlvdXNWYWx1ZSIsInByb3ZpZGVkRHJhZyIsImV2ZW50IiwiaXNGcm9tUERPTSIsInBsYXlTb3VuZEZvclZhbHVlQ2hhbmdlIiwicGxheVNvdW5kSWZUaHJlc2hvbGRSZWFjaGVkIiwiVkVSVElDQUwiLCJzd2FwcGVkIiwidGh1bWJUYW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJUSFVNQl9OT0RFX1RBTkRFTV9OQU1FIiwiVkFMSURBVElPTiIsImVxdWFscyIsInBoZXRpb0lEIiwidGh1bWIiLCJzaXplIiwiZmlsbCIsImZpbGxIaWdobGlnaHRlZCIsInN0cm9rZSIsImxpbmVXaWR0aCIsImNlbnRlckxpbmVTdHJva2UiLCJvd25zRW5hYmxlZFJhbmdlUHJvcGVydHkiLCJlbmFibGVkUmFuZ2VQcm9wZXJ0eSIsImJvdW5kc1JlcXVpcmVkT3B0aW9uS2V5cyIsInBpY2siLCJSRVFVSVJFU19CT1VORFNfT1BUSU9OX0tFWVMiLCJzdXBlck9wdGlvbnMiLCJhcmlhT3JpZW50YXRpb24iLCJwYW5UYXJnZXROb2RlIiwidmFsdWVUeXBlIiwiaXNWYWxpZFZhbHVlIiwibWluIiwibWF4IiwicGhldGlvVmFsdWVUeXBlIiwiUmFuZ2VJTyIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJ0aWNrT3B0aW9ucyIsInNsaWRlclBhcnRzIiwibWFqb3JUaWNrc1BhcmVudCIsIm1pbm9yVGlja3NQYXJlbnQiLCJwdXNoIiwidHJhY2tUYW5kZW0iLCJUUkFDS19OT0RFX1RBTkRFTV9OQU1FIiwidHJhY2tTcGFjZXIiLCJ0cmFjayIsImZpbGxFbmFibGVkIiwiZmlsbERpc2FibGVkIiwiY29ybmVyUmFkaXVzIiwicGlja2FibGUiLCJ2b2ljaW5nT25FbmRSZXNwb25zZSIsImJpbmQiLCJzZXRDZW50ZXJZIiwiY2VudGVyWSIsInNsaWRlclBhcnRzTm9kZSIsImNoaWxkcmVuIiwicm90YXRpb24iLCJTTElERVJfVkVSVElDQUxfUk9UQVRJT04iLCJhZGRDaGlsZCIsInRvdWNoQXJlYSIsImxvY2FsQm91bmRzIiwiZGlsYXRlZFhZIiwibW91c2VBcmVhIiwiY2xpY2tYT2Zmc2V0IiwidmFsdWVPblN0YXJ0IiwidGh1bWJEcmFnTGlzdGVuZXIiLCJzdGFydCIsImxpc3RlbmVyIiwiZW5hYmxlZFByb3BlcnR5IiwiZ2V0IiwidHJhbnNmb3JtIiwicHJlc3NlZFRyYWlsIiwic3VidHJhaWxUbyIsImdldFRyYW5zZm9ybSIsImludmVyc2VQb3NpdGlvbjIiLCJwb2ludGVyIiwicG9pbnQiLCJ4IiwiY2VudGVyWCIsInZhbHVlVG9Qb3NpdGlvblByb3BlcnR5IiwiaW52ZXJzZSIsInZhbHVlSW5SYW5nZSIsInNldCIsImVuZCIsImFkZElucHV0TGlzdGVuZXIiLCJ0cmFja0RyYWdMaXN0ZW5lciIsImRyYWdMaXN0ZW5lciIsInZhbHVlTXVsdGlsaW5rIiwibXVsdGlsaW5rIiwidmFsdWVUb1Bvc2l0aW9uIiwiZXZhbHVhdGUiLCJlbmFibGVkUmFuZ2VPYnNlcnZlciIsImVuYWJsZWRSYW5nZSIsImpvaXN0R2xvYmFsIiwid2luZG93IiwiaXNQaGV0aW9JbnN0cnVtZW50ZWQiLCJzaW0iLCJpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5IiwiY2xhbXAiLCJwcm9wb3NlZFZhbHVlSW5FbmFibGVkUmFuZ2UiLCJwcm9wb3NlZFZhbHVlSW5Db25zdHJhaW5lZFJhbmdlIiwibGluayIsImNvbnN0cmFpbnQiLCJTbGlkZXJDb25zdHJhaW50IiwiZGlzcG9zZVNsaWRlciIsImRpc3Bvc2UiLCJ1bmxpbmsiLCJmb2N1c0hpZ2hsaWdodCIsImxpbmtlZFByb3BlcnR5IiwiYWRkTGlua2VkRWxlbWVudCIsIm11dGF0ZSIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiYmluZGVyIiwicmVnaXN0ZXJEYXRhVVJMIiwibWFqb3JUaWNrc1Zpc2libGUiLCJnZXRNYWpvclRpY2tzVmlzaWJsZSIsInNldE1ham9yVGlja3NWaXNpYmxlIiwibWlub3JUaWNrc1Zpc2libGUiLCJnZXRNaW5vclRpY2tzVmlzaWJsZSIsInNldE1pbm9yVGlja3NWaXNpYmxlIiwiZm9yRWFjaCIsInRpY2siLCJhZGRNYWpvclRpY2siLCJsYWJlbCIsImFkZFRpY2siLCJhZGRNaW5vclRpY2siLCJwYXJlbnQiLCJsZW5ndGgiLCJ2aXNpYmxlIiwiZG9jdW1lbnRhdGlvbiIsInN1cGVydHlwZSIsIk5vZGVJTyIsInNsaWRlciIsImhlaWdodFNpemFibGUiLCJwcmVmZXJyZWRQcm9wZXJ0eSIsImxvY2FsUHJlZmVycmVkV2lkdGhQcm9wZXJ0eSIsIndpZHRoU2l6YWJsZSIsImxvY2FsUHJlZmVycmVkSGVpZ2h0UHJvcGVydHkiLCJsYXp5TGluayIsIl91cGRhdGVMYXlvdXRMaXN0ZW5lciIsImxvY2FsQm91bmRzUHJvcGVydHkiLCJ0aWNrQWRkZWRMaXN0ZW5lciIsImFkZGVkVGljayIsInRpY2tOb2RlIiwiYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciIsInJlbW92ZWRUaWNrIiwiaGFzTGlzdGVuZXIiLCJhZGRJdGVtQWRkZWRMaXN0ZW5lciIsImFkZE5vZGUiLCJsYXlvdXQiLCJkaXNwb3NlU2xpZGVyQ29uc3RyYWludCIsInJlbW92ZUl0ZW1BZGRlZExpc3RlbmVyIiwiZGlsYXRlZFgiLCJ3aWR0aCIsIm1pbmltdW1XaWR0aCIsInRvdGFsT3ZlcmZsb3ciLCJsZWZ0VmlzdWFsT3ZlcmZsb3ciLCJyaWdodFZpc3VhbE92ZXJmbG93IiwidHJhY2tNaW5pbXVtRXh0ZXJpb3JXaWR0aCIsInRyYWNrTWluaW11bUludGVyaW9yV2lkdGgiLCJub3JtYWxpemVUaWNrVmFsdWUiLCJsaW5lYXIiLCJsZWZ0RXh0ZXJpb3JPZmZzZXQiLCJyaWdodEV4dGVyaW9yT2Zmc2V0IiwibWluaW11bVJhbmdlIiwidGlja01pbmltdW1Qb3NpdGlvbiIsImhhbGZUaWNrV2lkdGgiLCJpbmNsdWRlUmFuZ2UiLCJzaGlmdGVkIiwidHJhY2tXaWR0aFRvRnVsbFdpZHRoRnVuY3Rpb24iLCJtYXAiLCJub3JtYWxpemVkVGlja1ZhbHVlIiwibWludXMiLCJjb25zdGFudCIsImZ1bGxXaWR0aFRvVHJhY2tXaWR0aEZ1bmN0aW9uIiwid2l0aFhWYWx1ZXMiLCJwb2ludHMiLCJmaWx0ZXIiLCJpbnZlcnRlZCIsInByZWZlcnJlZFdpZHRoIiwiTWF0aCIsImdldExlbmd0aCIsImxvY2FsTWluaW11bVdpZHRoIiwibG9jYWxNaW5pbXVtSGVpZ2h0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTbGlkZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2xpZGVyLCB3aXRoIHN1cHBvcnQgZm9yIGhvcml6b250YWwgYW5kIHZlcnRpY2FsIG9yaWVudGF0aW9ucy4gQnkgZGVmYXVsdCwgdGhlIHNsaWRlciBpcyBjb25zdHJ1Y3RlZCBpbiB0aGVcclxuICogaG9yaXpvbnRhbCBvcmllbnRhdGlvbiwgdGhlbiBhZGp1c3RlZCBpZiB0aGUgdmVydGljYWwgb3JpZW50YXRpb24gd2FzIHNwZWNpZmllZC5cclxuICpcclxuICogTm90ZTogVGhpcyB0eXBlIHdhcyBvcmlnaW5hbGx5IG5hbWVkIEhTbGlkZXIsIHJlbmFtZWQgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvMzgwLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24gZnJvbSAnLi4vLi4vZG90L2pzL0NvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24uanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2Fzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucy5qcyc7XHJcbmltcG9ydCBJbnN0YW5jZVJlZ2lzdHJ5IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9kb2N1bWVudGF0aW9uL0luc3RhbmNlUmVnaXN0cnkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBPcmllbnRhdGlvbiBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvT3JpZW50YXRpb24uanMnO1xyXG5pbXBvcnQgc3dhcE9iamVjdEtleXMgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3N3YXBPYmplY3RLZXlzLmpzJztcclxuaW1wb3J0IHsgRHJhZ0xpc3RlbmVyLCBGb2N1c0hpZ2hsaWdodEZyb21Ob2RlLCBMYXlvdXRDb25zdHJhaW50LCBOb2RlLCBOb2RlT3B0aW9ucywgU2NlbmVyeUNvbnN0YW50cywgU2l6YWJsZSwgVFBhaW50IH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IFZhbHVlQ2hhbmdlU291bmRQbGF5ZXIsIHsgVmFsdWVDaGFuZ2VTb3VuZFBsYXllck9wdGlvbnMgfSBmcm9tICcuLi8uLi90YW1iby9qcy9zb3VuZC1nZW5lcmF0b3JzL1ZhbHVlQ2hhbmdlU291bmRQbGF5ZXIuanMnO1xyXG5pbXBvcnQgQWNjZXNzaWJsZVNsaWRlciwgeyBBY2Nlc3NpYmxlU2xpZGVyT3B0aW9ucyB9IGZyb20gJy4vYWNjZXNzaWJpbGl0eS9BY2Nlc3NpYmxlU2xpZGVyLmpzJztcclxuaW1wb3J0IERlZmF1bHRTbGlkZXJUcmFjayBmcm9tICcuL0RlZmF1bHRTbGlkZXJUcmFjay5qcyc7XHJcbmltcG9ydCBTbGlkZXJUaHVtYiBmcm9tICcuL1NsaWRlclRodW1iLmpzJztcclxuaW1wb3J0IFNsaWRlclRyYWNrIGZyb20gJy4vU2xpZGVyVHJhY2suanMnO1xyXG5pbXBvcnQgU2xpZGVyVGljaywgeyBTbGlkZXJUaWNrT3B0aW9ucyB9IGZyb20gJy4vU2xpZGVyVGljay5qcyc7XHJcbmltcG9ydCBzdW4gZnJvbSAnLi9zdW4uanMnO1xyXG5pbXBvcnQgUGlja09wdGlvbmFsIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrT3B0aW9uYWwuanMnO1xyXG5pbXBvcnQgTGlua2FibGVQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0xpbmthYmxlUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUaW55UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UaW55UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU3VuQ29uc3RhbnRzIGZyb20gJy4vU3VuQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IGNyZWF0ZU9ic2VydmFibGVBcnJheSwgeyBPYnNlcnZhYmxlQXJyYXkgfSBmcm9tICcuLi8uLi9heG9uL2pzL2NyZWF0ZU9ic2VydmFibGVBcnJheS5qcyc7XHJcbmltcG9ydCBMaW5rYWJsZUVsZW1lbnQgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL0xpbmthYmxlRWxlbWVudC5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgREVGQVVMVF9IT1JJWk9OVEFMX1RSQUNLX1NJWkUgPSBuZXcgRGltZW5zaW9uMiggMTAwLCA1ICk7XHJcbmNvbnN0IERFRkFVTFRfSE9SSVpPTlRBTF9USFVNQl9TSVpFID0gbmV3IERpbWVuc2lvbjIoIDE3LCAzNCApO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBvcmllbnRhdGlvbj86IE9yaWVudGF0aW9uO1xyXG5cclxuICAvLyBvcHRpb25hbCB0cmFjaywgcmVwbGFjZXMgdGhlIGRlZmF1bHQuXHJcbiAgLy8gQ2xpZW50IGlzIHJlc3BvbnNpYmxlIGZvciBoaWdobGlnaHRpbmcsIGRpc2FibGUgYW5kIHBvaW50ZXIgYXJlYXMuXHJcbiAgLy8gRm9yIGluc3RydW1lbnRlZCBTbGlkZXJzLCBhIHN1cHBsaWVkIHRyYWNrTm9kZSBtdXN0IGJlIGluc3RydW1lbnRlZC5cclxuICAvLyBUaGUgdGFuZGVtIGNvbXBvbmVudCBuYW1lIG11c3QgYmUgU2xpZGVyLlRSQUNLX05PREVfVEFOREVNX05BTUUgYW5kIGl0IG11c3QgYmUgbmVzdGVkIHVuZGVyIHRoZSBTbGlkZXIgdGFuZGVtLlxyXG4gIHRyYWNrTm9kZT86IFNsaWRlclRyYWNrIHwgbnVsbDtcclxuXHJcbiAgLy8gdHJhY2sgLSBvcHRpb25zIHRvIGNyZWF0ZSBhIFNsaWRlclRyYWNrIGlmIHRyYWNrTm9kZSBub3Qgc3VwcGxpZWRcclxuICB0cmFja1NpemU/OiBEaW1lbnNpb24yIHwgbnVsbDsgLy8gc3BlY2lmaWMgdG8gb3JpZW50YXRpb24sIHdpbGwgYmUgZmlsbGVkIGluIHdpdGggYSBkZWZhdWx0IGlmIG5vdCBwcm92aWRlZFxyXG4gIHRyYWNrRmlsbEVuYWJsZWQ/OiBUUGFpbnQ7XHJcbiAgdHJhY2tGaWxsRGlzYWJsZWQ/OiBUUGFpbnQ7XHJcbiAgdHJhY2tTdHJva2U/OiBUUGFpbnQ7XHJcbiAgdHJhY2tMaW5lV2lkdGg/OiBudW1iZXI7XHJcbiAgdHJhY2tDb3JuZXJSYWRpdXM/OiBudW1iZXI7XHJcbiAgdHJhY2tQaWNrYWJsZT86IGJvb2xlYW47IC8vIE1heSBiZSBzZXQgdG8gZmFsc2UgaWYgYSBzbGlkZXIgdHJhY2sgaXMgbm90IHZpc2libGUgYW5kIHVzZXIgaW50ZXJhY3Rpb24gaXMgdGhlcmVmb3JlIHVuZGVzaXJhYmxlLlxyXG5cclxuICAvLyBvcHRpb25hbCB0aHVtYiwgcmVwbGFjZXMgdGhlIGRlZmF1bHQuXHJcbiAgLy8gQ2xpZW50IGlzIHJlc3BvbnNpYmxlIGZvciBoaWdobGlnaHRpbmcsIGRpc2FibGluZyBhbmQgcG9pbnRlciBhcmVhcy5cclxuICAvLyBUaGUgdGh1bWIgaXMgcG9zaXRpb25lZCBiYXNlZCBvbiBpdHMgY2VudGVyIGFuZCBoZW5jZSBjYW4gaGF2ZSBpdHMgb3JpZ2luIGFueXdoZXJlXHJcbiAgLy8gTm90ZSBmb3IgUGhFVC1JTzogVGhpcyB0aHVtYk5vZGUgc2hvdWxkIGJlIGluc3RydW1lbnRlZC4gVGhlIHRodW1iJ3MgZHJhZ0xpc3RlbmVyIGlzIGluc3RydW1lbnRlZCB1bmRlcm5lYXRoXHJcbiAgLy8gdGhpcyB0aHVtYk5vZGUuIFRoZSB0YW5kZW0gY29tcG9uZW50IG5hbWUgbXVzdCBiZSBTbGlkZXIuVEhVTUJfTk9ERV9UQU5ERU1fTkFNRSBhbmQgaXQgbXVzdCBiZSBuZXN0ZWQgdW5kZXJcclxuICAvLyB0aGUgU2xpZGVyIHRhbmRlbS5cclxuICB0aHVtYk5vZGU/OiBOb2RlIHwgbnVsbDtcclxuXHJcbiAgLy8gT3B0aW9ucyBmb3IgdGhlIGRlZmF1bHQgdGh1bWIsIGlnbm9yZWQgaWYgdGh1bWJOb2RlIGlzIHNldFxyXG4gIHRodW1iU2l6ZT86IERpbWVuc2lvbjIgfCBudWxsOyAvLyBzcGVjaWZpYyB0byBvcmllbnRhdGlvbiwgd2lsbCBiZSBmaWxsZWQgaW4gd2l0aCBhIGRlZmF1bHQgaWYgbm90IHByb3ZpZGVkXHJcbiAgdGh1bWJGaWxsPzogVFBhaW50O1xyXG4gIHRodW1iRmlsbEhpZ2hsaWdodGVkPzogVFBhaW50O1xyXG4gIHRodW1iU3Ryb2tlPzogVFBhaW50O1xyXG4gIHRodW1iTGluZVdpZHRoPzogbnVtYmVyO1xyXG4gIHRodW1iQ2VudGVyTGluZVN0cm9rZT86IFRQYWludDtcclxuXHJcbiAgLy8gZGlsYXRpb25zIGFyZSBzcGVjaWZpYyB0byBvcmllbnRhdGlvblxyXG4gIHRodW1iVG91Y2hBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xyXG4gIHRodW1iVG91Y2hBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xyXG4gIHRodW1iTW91c2VBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xyXG4gIHRodW1iTW91c2VBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xyXG5cclxuICAvLyBBcHBsaWVkIHRvIGRlZmF1bHQgb3Igc3VwcGxpZWQgdGh1bWJcclxuICB0aHVtYllPZmZzZXQ/OiBudW1iZXI7IC8vIGNlbnRlciBvZiB0aGUgdGh1bWIgaXMgdmVydGljYWxseSBvZmZzZXQgYnkgdGhpcyBhbW91bnQgZnJvbSB0aGUgY2VudGVyIG9mIHRoZSB0cmFja1xyXG5cclxuICBjdXJzb3I/OiBzdHJpbmc7XHJcblxyXG4gIC8vIG9wYWNpdHkgYXBwbGllZCB0byB0aGUgZW50aXJlIFNsaWRlciB3aGVuIGRpc2FibGVkXHJcbiAgZGlzYWJsZWRPcGFjaXR5PzogbnVtYmVyO1xyXG5cclxuICAvLyBJZiBwcm92aWRlZCwgY3JlYXRlIGEgTGlua2VkRWxlbWVudCBmb3IgdGhpcyBQaEVULWlPIGluc3RydW1lbnRlZCBQcm9wZXJ0eSwgaW5zdGVhZFxyXG4gIC8vIG9mIHVzaW5nIHRoZSBwYXNzZWQgaW4gUHJvcGVydHkuIFRoaXMgb3B0aW9uIHdhcyBjcmVhdGVkIHRvIHN1cHBvcnQgcGFzc2luZyBEeW5hbWljUHJvcGVydHkgb3IgXCJ3cmFwcGluZ1wiXHJcbiAgLy8gUHJvcGVydHkgdGhhdCBhcmUgXCJpbXBsZW1lbnRhdGlvbiAgZGV0YWlsc1wiIHRvIHRoZSBQaEVULWlPIEFQSSwgYW5kIHN0aWxsIHN1cHBvcnQgaGF2aW5nIGEgTGlua2VkRWxlbWVudCB0aGF0XHJcbiAgLy8gcG9pbnRzIHRvIHRoZSB1bmRlcmx5aW5nIG1vZGVsIFByb3BlcnR5LlxyXG4gIHBoZXRpb0xpbmtlZFByb3BlcnR5PzogTGlua2FibGVFbGVtZW50IHwgbnVsbDtcclxuXHJcbiAgLy8gVGhpcyBpcyB1c2VkIHRvIGdlbmVyYXRlIHNvdW5kcyBhcyB0aGUgc2xpZGVyIGlzIG1vdmVkIGJ5IHRoZSB1c2VyLiAgSWYgbm90IHByb3ZpZGVkLCB0aGUgZGVmYXVsdCBzb3VuZCBnZW5lcmF0b3JcclxuICAvLyB3aWxsIGJlIGNyZWF0ZWQuIElmIHNldCB0byBudWxsLCB0aGUgc2xpZGVyIHdpbGwgZ2VuZXJhdGUgbm8gc291bmQuXHJcbiAgc291bmRHZW5lcmF0b3I/OiBWYWx1ZUNoYW5nZVNvdW5kUGxheWVyIHwgbnVsbDtcclxuXHJcbiAgLy8gT3B0aW9ucyBmb3IgdGhlIGRlZmF1bHQgc291bmQgZ2VuZXJhdG9yLiAgVGhlc2Ugc2hvdWxkIG9ubHkgYmUgcHJvdmlkZWQgd2hlbiB1c2luZyB0aGUgZGVmYXVsdC5cclxuICB2YWx1ZUNoYW5nZVNvdW5kR2VuZXJhdG9yT3B0aW9ucz86IFZhbHVlQ2hhbmdlU291bmRQbGF5ZXJPcHRpb25zO1xyXG59ICYgU2xpZGVyVGlja09wdGlvbnM7XHJcblxyXG50eXBlIFBhcmVudE9wdGlvbnMgPSBBY2Nlc3NpYmxlU2xpZGVyT3B0aW9ucyAmIE5vZGVPcHRpb25zO1xyXG5cclxuXHJcbnR5cGUgUmVxdWlyZWRQYXJlbnRPcHRpb25zU3VwcGxpZWRCeVNsaWRlciA9ICdwYW5UYXJnZXROb2RlJyB8ICd2YWx1ZVByb3BlcnR5JyB8ICdlbmFibGVkUmFuZ2VQcm9wZXJ0eScgfCAnYXJpYU9yaWVudGF0aW9uJztcclxudHlwZSBPcHRpb25hbFBhcmVudE9wdGlvbnMgPSBTdHJpY3RPbWl0PFBhcmVudE9wdGlvbnMsIFJlcXVpcmVkUGFyZW50T3B0aW9uc1N1cHBsaWVkQnlTbGlkZXI+O1xyXG5cclxuLy8gV2UgcHJvdmlkZSB0aGVzZSBvcHRpb25zIHRvIHRoZSBzdXBlciwgYWxzbyBlbmFibGVkUmFuZ2VQcm9wZXJ0eSBpcyB0dXJuZWQgZnJvbSByZXF1aXJlZCB0byBvcHRpb25hbFxyXG5leHBvcnQgdHlwZSBTbGlkZXJPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBPcHRpb25hbFBhcmVudE9wdGlvbnMgJiBQaWNrT3B0aW9uYWw8UGFyZW50T3B0aW9ucywgJ2VuYWJsZWRSYW5nZVByb3BlcnR5Jz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTbGlkZXIgZXh0ZW5kcyBTaXphYmxlKCBBY2Nlc3NpYmxlU2xpZGVyKCBOb2RlLCAwICkgKSB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBlbmFibGVkUmFuZ2VQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8UmFuZ2U+O1xyXG5cclxuICAvLyBwdWJsaWMgc28gdGhhdCBjbGllbnRzIGNhbiBhY2Nlc3MgUHJvcGVydGllcyBvZiB0aGVzZSBEcmFnTGlzdGVuZXJzIHRoYXQgdGVsbCB1cyBhYm91dCBpdHMgc3RhdGVcclxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvNjgwXHJcbiAgcHVibGljIHJlYWRvbmx5IHRodW1iRHJhZ0xpc3RlbmVyOiBEcmFnTGlzdGVuZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHRyYWNrRHJhZ0xpc3RlbmVyOiBEcmFnTGlzdGVuZXI7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgb3JpZW50YXRpb246IE9yaWVudGF0aW9uO1xyXG5cclxuICAvLyBvcHRpb25zIG5lZWRlZCBieSBwcm90b3R5cGUgZnVuY3Rpb25zIHRoYXQgYWRkIHRpY2tzXHJcbiAgcHJpdmF0ZSByZWFkb25seSB0aWNrT3B0aW9uczogUmVxdWlyZWQ8U2xpZGVyVGlja09wdGlvbnM+O1xyXG5cclxuICAvLyB0aWNrcyBhcmUgYWRkZWQgdG8gdGhlc2UgcGFyZW50cywgc28gdGhleSBhcmUgYmVoaW5kIHRoZSBrbm9iXHJcbiAgcHJpdmF0ZSByZWFkb25seSBtYWpvclRpY2tzUGFyZW50OiBOb2RlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbWlub3JUaWNrc1BhcmVudDogTm9kZTtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSB0cmFjazogU2xpZGVyVHJhY2s7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVNsaWRlcjogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSB0aWNrczogT2JzZXJ2YWJsZUFycmF5PFNsaWRlclRpY2s+ID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcblxyXG4gIC8vIFRoaXMgaXMgYSBtYXJrZXIgdG8gaW5kaWNhdGUgdGhhdCB3ZSBzaG91bGQgY3JlYXRlIHRoZSBhY3R1YWwgZGVmYXVsdCBzbGlkZXIgc291bmQuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBERUZBVUxUX1NPVU5EID0gbmV3IFZhbHVlQ2hhbmdlU291bmRQbGF5ZXIoIG5ldyBSYW5nZSggMCwgMSApICk7XHJcblxyXG4gIC8vIElmIHRoZSB1c2VyIGlzIGhvbGRpbmcgZG93biB0aGUgdGh1bWIgb3V0c2lkZSBvZiB0aGUgZW5hYmxlZCByYW5nZSwgYW5kIHRoZSBlbmFibGVkIHJhbmdlIGV4cGFuZHMsIHRoZSB2YWx1ZSBzaG91bGRcclxuICAvLyBhZGp1c3QgdG8gdGhlIG5ldyBleHRyZW11bSBvZiB0aGUgcmFuZ2UsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbWVhbi1zaGFyZS1hbmQtYmFsYW5jZS9pc3N1ZXMvMjlcclxuICAvLyBUaGlzIHZhbHVlIGlzIHNldCBkdXJpbmcgdGh1bWIgZHJhZywgb3IgbnVsbCBpZiBub3QgY3VycmVudGx5IGJlaW5nIGRyYWdnZWQuXHJcbiAgcHJpdmF0ZSBwcm9wb3NlZFZhbHVlOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2YWx1ZVByb3BlcnR5OiBMaW5rYWJsZVByb3BlcnR5PG51bWJlcj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICByYW5nZTogUmFuZ2UgfCBUUmVhZE9ubHlQcm9wZXJ0eTxSYW5nZT4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBTbGlkZXJPcHRpb25zICkge1xyXG5cclxuICAgIC8vIEd1YXJkIGFnYWluc3QgbXV0dWFsbHkgZXhjbHVzaXZlIG9wdGlvbnMgYmVmb3JlIGRlZmF1bHRzIGFyZSBmaWxsZWQgaW4uXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zKCBwcm92aWRlZE9wdGlvbnMsIFsgJ3RodW1iTm9kZScgXSwgW1xyXG4gICAgICAndGh1bWJTaXplJywgJ3RodW1iRmlsbCcsICd0aHVtYkZpbGxIaWdobGlnaHRlZCcsICd0aHVtYlN0cm9rZScsICd0aHVtYkxpbmVXaWR0aCcsICd0aHVtYkNlbnRlckxpbmVTdHJva2UnLFxyXG4gICAgICAndGh1bWJUb3VjaEFyZWFYRGlsYXRpb24nLCAndGh1bWJUb3VjaEFyZWFZRGlsYXRpb24nLCAndGh1bWJNb3VzZUFyZWFYRGlsYXRpb24nLCAndGh1bWJNb3VzZUFyZWFZRGlsYXRpb24nXHJcbiAgICBdICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyggcHJvdmlkZWRPcHRpb25zLCBbICd0cmFja05vZGUnIF0sIFtcclxuICAgICAgJ3RyYWNrU2l6ZScsICd0cmFja0ZpbGxFbmFibGVkJywgJ3RyYWNrRmlsbERpc2FibGVkJywgJ3RyYWNrU3Ryb2tlJywgJ3RyYWNrTGluZVdpZHRoJywgJ3RyYWNrQ29ybmVyUmFkaXVzJyBdICk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTbGlkZXJPcHRpb25zLCBTZWxmT3B0aW9ucywgT3B0aW9uYWxQYXJlbnRPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICBvcmllbnRhdGlvbjogT3JpZW50YXRpb24uSE9SSVpPTlRBTCxcclxuICAgICAgdHJhY2tOb2RlOiBudWxsLFxyXG5cclxuICAgICAgdHJhY2tTaXplOiBudWxsLFxyXG4gICAgICB0cmFja0ZpbGxFbmFibGVkOiAnd2hpdGUnLFxyXG4gICAgICB0cmFja0ZpbGxEaXNhYmxlZDogJ2dyYXknLFxyXG4gICAgICB0cmFja1N0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgdHJhY2tMaW5lV2lkdGg6IDEsXHJcbiAgICAgIHRyYWNrQ29ybmVyUmFkaXVzOiAwLFxyXG4gICAgICB0cmFja1BpY2thYmxlOiB0cnVlLFxyXG5cclxuICAgICAgdGh1bWJOb2RlOiBudWxsLFxyXG5cclxuICAgICAgdGh1bWJTaXplOiBudWxsLFxyXG4gICAgICB0aHVtYkZpbGw6ICdyZ2IoNTAsMTQ1LDE4NCknLFxyXG4gICAgICB0aHVtYkZpbGxIaWdobGlnaHRlZDogJ3JnYig3MSwyMDcsMjU1KScsXHJcbiAgICAgIHRodW1iU3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICB0aHVtYkxpbmVXaWR0aDogMSxcclxuICAgICAgdGh1bWJDZW50ZXJMaW5lU3Ryb2tlOiAnd2hpdGUnLFxyXG5cclxuICAgICAgdGh1bWJUb3VjaEFyZWFYRGlsYXRpb246IDExLFxyXG4gICAgICB0aHVtYlRvdWNoQXJlYVlEaWxhdGlvbjogMTEsXHJcbiAgICAgIHRodW1iTW91c2VBcmVhWERpbGF0aW9uOiAwLFxyXG4gICAgICB0aHVtYk1vdXNlQXJlYVlEaWxhdGlvbjogMCxcclxuXHJcbiAgICAgIHRodW1iWU9mZnNldDogMCxcclxuXHJcbiAgICAgIHRpY2tMYWJlbFNwYWNpbmc6IDYsXHJcbiAgICAgIG1ham9yVGlja0xlbmd0aDogMjUsXHJcbiAgICAgIG1ham9yVGlja1N0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgbWFqb3JUaWNrTGluZVdpZHRoOiAxLFxyXG4gICAgICBtaW5vclRpY2tMZW5ndGg6IDEwLFxyXG4gICAgICBtaW5vclRpY2tTdHJva2U6ICdibGFjaycsXHJcbiAgICAgIG1pbm9yVGlja0xpbmVXaWR0aDogMSxcclxuXHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICBzdGFydERyYWc6IF8ubm9vcCxcclxuICAgICAgZHJhZzogXy5ub29wLFxyXG4gICAgICBlbmREcmFnOiBfLm5vb3AsXHJcbiAgICAgIGNvbnN0cmFpblZhbHVlOiBfLmlkZW50aXR5LFxyXG5cclxuICAgICAgZGlzYWJsZWRPcGFjaXR5OiBTY2VuZXJ5Q29uc3RhbnRzLkRJU0FCTEVEX09QQUNJVFksXHJcblxyXG4gICAgICBzb3VuZEdlbmVyYXRvcjogU2xpZGVyLkRFRkFVTFRfU09VTkQsXHJcbiAgICAgIHZhbHVlQ2hhbmdlU291bmRHZW5lcmF0b3JPcHRpb25zOiB7fSxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgcGhldGlvTGlua2VkUHJvcGVydHk6IG51bGwsXHJcblxyXG4gICAgICAvLyBTdXBlcnR5cGUgb3B0aW9uc1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcclxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ1NsaWRlcicsXHJcbiAgICAgIHBoZXRpb1R5cGU6IFNsaWRlci5TbGlkZXJJTyxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9GZWF0dXJlZDogdHJ1ZSB9LFxyXG4gICAgICBwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQ6IHRydWUgLy8gb3B0IGludG8gZGVmYXVsdCBQaEVULWlPIGluc3RydW1lbnRlZCBlbmFibGVkUHJvcGVydHlcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHJhbmdlUHJvcGVydHkgPSByYW5nZSBpbnN0YW5jZW9mIFJhbmdlID8gbmV3IFRpbnlQcm9wZXJ0eSggcmFuZ2UgKSA6IHJhbmdlO1xyXG5cclxuICAgIC8vIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuc291bmRHZW5lcmF0b3IgPT09IFNsaWRlci5ERUZBVUxUX1NPVU5EIHx8IF8uaXNFbXB0eSggb3B0aW9ucy52YWx1ZUNoYW5nZVNvdW5kR2VuZXJhdG9yT3B0aW9ucyApLFxyXG4gICAgLy8gICAnb3B0aW9ucyBzaG91bGQgb25seSBiZSBzdXBwbGllZCB3aGVuIHVzaW5nIGRlZmF1bHQgc291bmQgZ2VuZXJhdG9yJyApO1xyXG5cclxuICAgIC8vIElmIG5vIHNvdW5kIGdlbmVyYXRvciB3YXMgcHJvdmlkZWQsIGNyZWF0ZSB0aGUgZGVmYXVsdC5cclxuICAgIGlmICggb3B0aW9ucy5zb3VuZEdlbmVyYXRvciA9PT0gU2xpZGVyLkRFRkFVTFRfU09VTkQgKSB7XHJcbiAgICAgIG9wdGlvbnMuc291bmRHZW5lcmF0b3IgPSBuZXcgVmFsdWVDaGFuZ2VTb3VuZFBsYXllciggcmFuZ2VQcm9wZXJ0eS52YWx1ZSwgb3B0aW9ucy52YWx1ZUNoYW5nZVNvdW5kR2VuZXJhdG9yT3B0aW9ucyB8fCB7fSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIG9wdGlvbnMuc291bmRHZW5lcmF0b3IgPT09IG51bGwgKSB7XHJcbiAgICAgIG9wdGlvbnMuc291bmRHZW5lcmF0b3IgPSBWYWx1ZUNoYW5nZVNvdW5kUGxheWVyLk5PX1NPVU5EO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNldCB1cCB0aGUgZHJhZyBoYW5kbGVyIHRvIGdlbmVyYXRlIHNvdW5kIHdoZW4gZHJhZyBldmVudHMgY2F1c2UgY2hhbmdlcy5cclxuICAgIGlmICggb3B0aW9ucy5zb3VuZEdlbmVyYXRvciAhPT0gVmFsdWVDaGFuZ2VTb3VuZFBsYXllci5OT19TT1VORCApIHtcclxuXHJcbiAgICAgIC8vIHZhcmlhYmxlIHRvIGtlZXAgdHJhY2sgb2YgdGhlIHZhbHVlIGF0IHRoZSBzdGFydCBvZiB1c2VyIGRyYWcgaW50ZXJhY3Rpb25zXHJcbiAgICAgIGxldCBwcmV2aW91c1ZhbHVlID0gdmFsdWVQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgIC8vIEVuaGFuY2UgdGhlIGRyYWcgaGFuZGxlciB0byBwZXJmb3JtIHNvdW5kIGdlbmVyYXRpb24uXHJcbiAgICAgIGNvbnN0IHByb3ZpZGVkRHJhZyA9IG9wdGlvbnMuZHJhZztcclxuICAgICAgb3B0aW9ucy5kcmFnID0gZXZlbnQgPT4ge1xyXG4gICAgICAgIGlmICggZXZlbnQuaXNGcm9tUERPTSgpICkge1xyXG4gICAgICAgICAgb3B0aW9ucy5zb3VuZEdlbmVyYXRvciEucGxheVNvdW5kRm9yVmFsdWVDaGFuZ2UoIHZhbHVlUHJvcGVydHkudmFsdWUsIHByZXZpb3VzVmFsdWUgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBvcHRpb25zLnNvdW5kR2VuZXJhdG9yIS5wbGF5U291bmRJZlRocmVzaG9sZFJlYWNoZWQoIHZhbHVlUHJvcGVydHkudmFsdWUsIHByZXZpb3VzVmFsdWUgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvdmlkZWREcmFnKCBldmVudCApO1xyXG4gICAgICAgIHByZXZpb3VzVmFsdWUgPSB2YWx1ZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggb3B0aW9ucy5vcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uVkVSVElDQUwgKSB7XHJcblxyXG4gICAgICAvLyBGb3IgYSB2ZXJ0aWNhbCBzbGlkZXIsIHRoZSBjbGllbnQgc2hvdWxkIHByb3ZpZGUgZGltZW5zaW9ucyB0aGF0IGFyZSBzcGVjaWZpYyB0byBhIHZlcnRpY2FsIHNsaWRlci5cclxuICAgICAgLy8gQnV0IFNsaWRlciBleHBlY3RzIGRpbWVuc2lvbnMgZm9yIGEgaG9yaXpvbnRhbCBzbGlkZXIsIGFuZCB0aGVuIGNyZWF0ZXMgdGhlIHZlcnRpY2FsIG9yaWVudGF0aW9uIHVzaW5nIHJvdGF0aW9uLlxyXG4gICAgICAvLyBTbyBpZiB0aGUgY2xpZW50IHByb3ZpZGVzIGFueSBkaW1lbnNpb25zIGZvciBhIHZlcnRpY2FsIHNsaWRlciwgc3dhcCB0aG9zZSBkaW1lbnNpb25zIHRvIGhvcml6b250YWwuXHJcbiAgICAgIGlmICggb3B0aW9ucy50cmFja1NpemUgKSB7XHJcbiAgICAgICAgb3B0aW9ucy50cmFja1NpemUgPSBvcHRpb25zLnRyYWNrU2l6ZS5zd2FwcGVkKCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBvcHRpb25zLnRodW1iU2l6ZSApIHtcclxuICAgICAgICBvcHRpb25zLnRodW1iU2l6ZSA9IG9wdGlvbnMudGh1bWJTaXplLnN3YXBwZWQoKTtcclxuICAgICAgfVxyXG4gICAgICBzd2FwT2JqZWN0S2V5cyggb3B0aW9ucywgJ3RodW1iVG91Y2hBcmVhWERpbGF0aW9uJywgJ3RodW1iVG91Y2hBcmVhWURpbGF0aW9uJyApO1xyXG4gICAgICBzd2FwT2JqZWN0S2V5cyggb3B0aW9ucywgJ3RodW1iTW91c2VBcmVhWERpbGF0aW9uJywgJ3RodW1iTW91c2VBcmVhWURpbGF0aW9uJyApO1xyXG4gICAgfVxyXG4gICAgb3B0aW9ucy50cmFja1NpemUgPSBvcHRpb25zLnRyYWNrU2l6ZSB8fCBERUZBVUxUX0hPUklaT05UQUxfVFJBQ0tfU0laRTtcclxuICAgIG9wdGlvbnMudGh1bWJTaXplID0gb3B0aW9ucy50aHVtYlNpemUgfHwgREVGQVVMVF9IT1JJWk9OVEFMX1RIVU1CX1NJWkU7XHJcblxyXG4gICAgY29uc3QgdGh1bWJUYW5kZW0gPSBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oIFNsaWRlci5USFVNQl9OT0RFX1RBTkRFTV9OQU1FICk7XHJcbiAgICBpZiAoIFRhbmRlbS5WQUxJREFUSU9OICYmIG9wdGlvbnMudGh1bWJOb2RlICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnRodW1iTm9kZS50YW5kZW0uZXF1YWxzKCB0aHVtYlRhbmRlbSApLFxyXG4gICAgICAgIGBQYXNzZWQtaW4gdGh1bWJOb2RlIG11c3QgaGF2ZSB0aGUgY29ycmVjdCB0YW5kZW0uIEV4cGVjdGVkOiAke3RodW1iVGFuZGVtLnBoZXRpb0lEfSwgYWN0dWFsOiAke29wdGlvbnMudGh1bWJOb2RlLnRhbmRlbS5waGV0aW9JRH1gXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhlIHRodW1iIG9mIHRoZSBzbGlkZXJcclxuICAgIGNvbnN0IHRodW1iID0gb3B0aW9ucy50aHVtYk5vZGUgfHwgbmV3IFNsaWRlclRodW1iKCB7XHJcblxyXG4gICAgICAvLyBwcm9wYWdhdGUgc3VwZXJPcHRpb25zIHRoYXQgYXJlIHNwZWNpZmljIHRvIFNsaWRlclRodW1iXHJcbiAgICAgIHNpemU6IG9wdGlvbnMudGh1bWJTaXplLFxyXG4gICAgICBmaWxsOiBvcHRpb25zLnRodW1iRmlsbCxcclxuICAgICAgZmlsbEhpZ2hsaWdodGVkOiBvcHRpb25zLnRodW1iRmlsbEhpZ2hsaWdodGVkLFxyXG4gICAgICBzdHJva2U6IG9wdGlvbnMudGh1bWJTdHJva2UsXHJcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy50aHVtYkxpbmVXaWR0aCxcclxuICAgICAgY2VudGVyTGluZVN0cm9rZTogb3B0aW9ucy50aHVtYkNlbnRlckxpbmVTdHJva2UsXHJcbiAgICAgIHRhbmRlbTogdGh1bWJUYW5kZW1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBvd25zRW5hYmxlZFJhbmdlUHJvcGVydHkgPSAhb3B0aW9ucy5lbmFibGVkUmFuZ2VQcm9wZXJ0eTtcclxuXHJcbiAgICBjb25zdCBib3VuZHNSZXF1aXJlZE9wdGlvbktleXMgPSBfLnBpY2soIG9wdGlvbnMsIE5vZGUuUkVRVUlSRVNfQk9VTkRTX09QVElPTl9LRVlTICk7XHJcblxyXG4gICAgLy8gTm93IGFkZCBpbiB0aGUgcmVxdWlyZWQgb3B0aW9ucyB3aGVuIHBhc3NpbmcgdG8gdGhlIHN1cGVyIHR5cGVcclxuICAgIGNvbnN0IHN1cGVyT3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPHR5cGVvZiBvcHRpb25zICYgUGlja1JlcXVpcmVkPFBhcmVudE9wdGlvbnMsIFJlcXVpcmVkUGFyZW50T3B0aW9uc1N1cHBsaWVkQnlTbGlkZXI+Pigge1xyXG5cclxuICAgICAgYXJpYU9yaWVudGF0aW9uOiBvcHRpb25zLm9yaWVudGF0aW9uLFxyXG4gICAgICB2YWx1ZVByb3BlcnR5OiB2YWx1ZVByb3BlcnR5LFxyXG4gICAgICBwYW5UYXJnZXROb2RlOiB0aHVtYixcclxuXHJcbiAgICAgIC8vIGNvbnRyb2xzIHRoZSBwb3J0aW9uIG9mIHRoZSBzbGlkZXIgdGhhdCBpcyBlbmFibGVkXHJcbiAgICAgIGVuYWJsZWRSYW5nZVByb3BlcnR5OiBvcHRpb25zLmVuYWJsZWRSYW5nZVByb3BlcnR5IHx8ICggcmFuZ2UgaW5zdGFuY2VvZiBSYW5nZSA/IG5ldyBQcm9wZXJ0eSggcmFuZ2UsIHtcclxuICAgICAgICB2YWx1ZVR5cGU6IFJhbmdlLFxyXG4gICAgICAgIGlzVmFsaWRWYWx1ZTogKCB2YWx1ZTogUmFuZ2UgKSA9PiAoIHZhbHVlLm1pbiA+PSByYW5nZS5taW4gJiYgdmFsdWUubWF4IDw9IHJhbmdlLm1heCApLFxyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZW5hYmxlZFJhbmdlUHJvcGVydHknICksXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBSYW5nZS5SYW5nZUlPLFxyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdTbGlkZXJzIHN1cHBvcnQgdHdvIHJhbmdlczogdGhlIG91dGVyIHJhbmdlIHdoaWNoIHNwZWNpZmllcyB0aGUgbWluIGFuZCBtYXggb2YgdGhlIHRyYWNrIGFuZCAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndGhlIGVuYWJsZWRSYW5nZVByb3BlcnR5LCB3aGljaCBkZXRlcm1pbmVzIGhvdyBsb3cgYW5kIGhpZ2ggdGhlIHRodW1iIGNhbiBiZSBkcmFnZ2VkIHdpdGhpbiB0aGUgdHJhY2suJ1xyXG4gICAgICB9ICkgOiByYW5nZSApXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIHN1cGVyT3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMub3JpZW50YXRpb24gPSBzdXBlck9wdGlvbnMub3JpZW50YXRpb24hO1xyXG4gICAgdGhpcy5lbmFibGVkUmFuZ2VQcm9wZXJ0eSA9IHN1cGVyT3B0aW9ucy5lbmFibGVkUmFuZ2VQcm9wZXJ0eTtcclxuXHJcbiAgICB0aGlzLnRpY2tPcHRpb25zID0gXy5waWNrKCBvcHRpb25zLCAndGlja0xhYmVsU3BhY2luZycsXHJcbiAgICAgICdtYWpvclRpY2tMZW5ndGgnLCAnbWFqb3JUaWNrU3Ryb2tlJywgJ21ham9yVGlja0xpbmVXaWR0aCcsXHJcbiAgICAgICdtaW5vclRpY2tMZW5ndGgnLCAnbWlub3JUaWNrU3Ryb2tlJywgJ21pbm9yVGlja0xpbmVXaWR0aCcgKTtcclxuXHJcbiAgICBjb25zdCBzbGlkZXJQYXJ0cyA9IFtdO1xyXG5cclxuICAgIC8vIHRpY2tzIGFyZSBhZGRlZCB0byB0aGVzZSBwYXJlbnRzLCBzbyB0aGV5IGFyZSBiZWhpbmQgdGhlIGtub2JcclxuICAgIHRoaXMubWFqb3JUaWNrc1BhcmVudCA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLm1pbm9yVGlja3NQYXJlbnQgPSBuZXcgTm9kZSgpO1xyXG4gICAgc2xpZGVyUGFydHMucHVzaCggdGhpcy5tYWpvclRpY2tzUGFyZW50ICk7XHJcbiAgICBzbGlkZXJQYXJ0cy5wdXNoKCB0aGlzLm1pbm9yVGlja3NQYXJlbnQgKTtcclxuXHJcbiAgICBjb25zdCB0cmFja1RhbmRlbSA9IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggU2xpZGVyLlRSQUNLX05PREVfVEFOREVNX05BTUUgKTtcclxuXHJcbiAgICBpZiAoIFRhbmRlbS5WQUxJREFUSU9OICYmIG9wdGlvbnMudHJhY2tOb2RlICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnRyYWNrTm9kZS50YW5kZW0uZXF1YWxzKCB0cmFja1RhbmRlbSApLFxyXG4gICAgICAgIGBQYXNzZWQtaW4gdHJhY2tOb2RlIG11c3QgaGF2ZSB0aGUgY29ycmVjdCB0YW5kZW0uIEV4cGVjdGVkOiAke3RyYWNrVGFuZGVtLnBoZXRpb0lEfSwgYWN0dWFsOiAke29wdGlvbnMudHJhY2tOb2RlLnRhbmRlbS5waGV0aW9JRH1gXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdHJhY2tTcGFjZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgc2xpZGVyUGFydHMucHVzaCggdHJhY2tTcGFjZXIgKTtcclxuXHJcbiAgICAvLyBBc3NlcnRpb24gdG8gZ2V0IGFyb3VuZCBtdXRhdGluZyB0aGUgbnVsbC1kZWZhdWx0IGJhc2VkIG9uIHRoZSBzbGlkZXIgb3JpZW50YXRpb24uXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzdXBlck9wdGlvbnMudHJhY2tTaXplLCAndHJhY2tTaXplIHNob3VsZCBub3QgYmUgbnVsbCcgKTtcclxuXHJcbiAgICB0aGlzLnRyYWNrID0gb3B0aW9ucy50cmFja05vZGUgfHwgbmV3IERlZmF1bHRTbGlkZXJUcmFjayggdmFsdWVQcm9wZXJ0eSwgcmFuZ2UsIHtcclxuXHJcbiAgICAgIC8vIHByb3BhZ2F0ZSBvcHRpb25zIHRoYXQgYXJlIHNwZWNpZmljIHRvIFNsaWRlclRyYWNrXHJcbiAgICAgIHNpemU6IHN1cGVyT3B0aW9ucy50cmFja1NpemUhLFxyXG4gICAgICBmaWxsRW5hYmxlZDogc3VwZXJPcHRpb25zLnRyYWNrRmlsbEVuYWJsZWQsXHJcbiAgICAgIGZpbGxEaXNhYmxlZDogc3VwZXJPcHRpb25zLnRyYWNrRmlsbERpc2FibGVkLFxyXG4gICAgICBzdHJva2U6IHN1cGVyT3B0aW9ucy50cmFja1N0cm9rZSxcclxuICAgICAgbGluZVdpZHRoOiBzdXBlck9wdGlvbnMudHJhY2tMaW5lV2lkdGgsXHJcbiAgICAgIGNvcm5lclJhZGl1czogc3VwZXJPcHRpb25zLnRyYWNrQ29ybmVyUmFkaXVzLFxyXG4gICAgICBzdGFydERyYWc6IHN1cGVyT3B0aW9ucy5zdGFydERyYWcsXHJcbiAgICAgIGRyYWc6IHN1cGVyT3B0aW9ucy5kcmFnLFxyXG4gICAgICBlbmREcmFnOiBzdXBlck9wdGlvbnMuZW5kRHJhZyxcclxuICAgICAgY29uc3RyYWluVmFsdWU6IHN1cGVyT3B0aW9ucy5jb25zdHJhaW5WYWx1ZSxcclxuICAgICAgZW5hYmxlZFJhbmdlUHJvcGVydHk6IHRoaXMuZW5hYmxlZFJhbmdlUHJvcGVydHksXHJcbiAgICAgIHNvdW5kR2VuZXJhdG9yOiBvcHRpb25zLnNvdW5kR2VuZXJhdG9yLFxyXG4gICAgICBwaWNrYWJsZTogc3VwZXJPcHRpb25zLnRyYWNrUGlja2FibGUsXHJcbiAgICAgIHZvaWNpbmdPbkVuZFJlc3BvbnNlOiB0aGlzLnZvaWNpbmdPbkVuZFJlc3BvbnNlLmJpbmQoIHRoaXMgKSxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgdGFuZGVtOiB0cmFja1RhbmRlbVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgdHJhY2tcclxuICAgIHNsaWRlclBhcnRzLnB1c2goIHRoaXMudHJhY2sgKTtcclxuXHJcbiAgICAvLyBQb3NpdGlvbiB0aGUgdGh1bWIgdmVydGljYWxseS5cclxuICAgIHRodW1iLnNldENlbnRlclkoIHRoaXMudHJhY2suY2VudGVyWSArIG9wdGlvbnMudGh1bWJZT2Zmc2V0ICk7XHJcblxyXG4gICAgc2xpZGVyUGFydHMucHVzaCggdGh1bWIgKTtcclxuXHJcbiAgICAvLyBXcmFwIGFsbCBvZiB0aGUgc2xpZGVyIHBhcnRzIGluIGEgTm9kZSwgYW5kIHNldCB0aGUgb3JpZW50YXRpb24gb2YgdGhhdCBOb2RlLlxyXG4gICAgLy8gVGhpcyBhbGxvd3MgdXMgdG8gc3RpbGwgZGVjb3JhdGUgdGhlIFNsaWRlciB3aXRoIGFkZGl0aW9uYWwgY2hpbGRyZW4uXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvNDA2XHJcbiAgICBjb25zdCBzbGlkZXJQYXJ0c05vZGUgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogc2xpZGVyUGFydHMgfSApO1xyXG4gICAgaWYgKCBvcHRpb25zLm9yaWVudGF0aW9uID09PSBPcmllbnRhdGlvbi5WRVJUSUNBTCApIHtcclxuICAgICAgc2xpZGVyUGFydHNOb2RlLnJvdGF0aW9uID0gU3VuQ29uc3RhbnRzLlNMSURFUl9WRVJUSUNBTF9ST1RBVElPTjtcclxuICAgIH1cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHNsaWRlclBhcnRzTm9kZSApO1xyXG5cclxuICAgIC8vIHRvdWNoQXJlYSBmb3IgdGhlIGRlZmF1bHQgdGh1bWIuIElmIGEgY3VzdG9tIHRodW1iIGlzIHByb3ZpZGVkLCB0aGUgY2xpZW50IGlzIHJlc3BvbnNpYmxlIGZvciBpdHMgdG91Y2hBcmVhLlxyXG4gICAgaWYgKCAhb3B0aW9ucy50aHVtYk5vZGUgJiYgKCBvcHRpb25zLnRodW1iVG91Y2hBcmVhWERpbGF0aW9uIHx8IG9wdGlvbnMudGh1bWJUb3VjaEFyZWFZRGlsYXRpb24gKSApIHtcclxuICAgICAgdGh1bWIudG91Y2hBcmVhID0gdGh1bWIubG9jYWxCb3VuZHMuZGlsYXRlZFhZKCBvcHRpb25zLnRodW1iVG91Y2hBcmVhWERpbGF0aW9uLCBvcHRpb25zLnRodW1iVG91Y2hBcmVhWURpbGF0aW9uICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbW91c2VBcmVhIGZvciB0aGUgZGVmYXVsdCB0aHVtYi4gSWYgYSBjdXN0b20gdGh1bWIgaXMgcHJvdmlkZWQsIHRoZSBjbGllbnQgaXMgcmVzcG9uc2libGUgZm9yIGl0cyBtb3VzZUFyZWEuXHJcbiAgICBpZiAoICFvcHRpb25zLnRodW1iTm9kZSAmJiAoIG9wdGlvbnMudGh1bWJNb3VzZUFyZWFYRGlsYXRpb24gfHwgb3B0aW9ucy50aHVtYk1vdXNlQXJlYVlEaWxhdGlvbiApICkge1xyXG4gICAgICB0aHVtYi5tb3VzZUFyZWEgPSB0aHVtYi5sb2NhbEJvdW5kcy5kaWxhdGVkWFkoIG9wdGlvbnMudGh1bWJNb3VzZUFyZWFYRGlsYXRpb24sIG9wdGlvbnMudGh1bWJNb3VzZUFyZWFZRGlsYXRpb24gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB1cGRhdGUgdmFsdWUgd2hlbiB0aHVtYiBpcyBkcmFnZ2VkXHJcbiAgICBsZXQgY2xpY2tYT2Zmc2V0ID0gMDsgLy8geC1vZmZzZXQgYmV0d2VlbiBpbml0aWFsIGNsaWNrIGFuZCB0aHVtYidzIG9yaWdpblxyXG4gICAgbGV0IHZhbHVlT25TdGFydCA9IHZhbHVlUHJvcGVydHkudmFsdWU7IC8vIEZvciBkZXNjcmlwdGlvbiBzbyB3ZSBjYW4gZGVzY3JpYmUgdmFsdWUgY2hhbmdlcyBiZXR3ZWVuIGludGVyYWN0aW9uc1xyXG4gICAgY29uc3QgdGh1bWJEcmFnTGlzdGVuZXIgPSBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcblxyXG4gICAgICAvLyBEZXZpYXRlIGZyb20gdGhlIHZhcmlhYmxlIG5hbWUgYmVjYXVzZSB3ZSB3aWxsIG5lc3QgdGhpcyB0YW5kZW0gdW5kZXIgdGhlIHRodW1iIGRpcmVjdGx5XHJcbiAgICAgIHRhbmRlbTogdGh1bWIudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RyYWdMaXN0ZW5lcicgKSxcclxuXHJcbiAgICAgIHN0YXJ0OiAoIGV2ZW50LCBsaXN0ZW5lciApID0+IHtcclxuICAgICAgICBpZiAoIHRoaXMuZW5hYmxlZFByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgICAgdmFsdWVPblN0YXJ0ID0gdmFsdWVQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgICAgICBvcHRpb25zLnN0YXJ0RHJhZyggZXZlbnQgKTtcclxuICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybSA9IGxpc3RlbmVyLnByZXNzZWRUcmFpbC5zdWJ0cmFpbFRvKCBzbGlkZXJQYXJ0c05vZGUgKS5nZXRUcmFuc2Zvcm0oKTtcclxuXHJcbiAgICAgICAgICAvLyBEZXRlcm1pbmUgdGhlIG9mZnNldCByZWxhdGl2ZSB0byB0aGUgY2VudGVyIG9mIHRoZSB0aHVtYlxyXG4gICAgICAgICAgY2xpY2tYT2Zmc2V0ID0gdHJhbnNmb3JtLmludmVyc2VQb3NpdGlvbjIoIGV2ZW50LnBvaW50ZXIucG9pbnQgKS54IC0gdGh1bWIuY2VudGVyWDtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBkcmFnOiAoIGV2ZW50LCBsaXN0ZW5lciApID0+IHtcclxuICAgICAgICBpZiAoIHRoaXMuZW5hYmxlZFByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgICAgY29uc3QgdHJhbnNmb3JtID0gbGlzdGVuZXIucHJlc3NlZFRyYWlsLnN1YnRyYWlsVG8oIHNsaWRlclBhcnRzTm9kZSApLmdldFRyYW5zZm9ybSgpOyAvLyB3ZSBvbmx5IHdhbnQgdGhlIHRyYW5zZm9ybSB0byBvdXIgcGFyZW50XHJcbiAgICAgICAgICBjb25zdCB4ID0gdHJhbnNmb3JtLmludmVyc2VQb3NpdGlvbjIoIGV2ZW50LnBvaW50ZXIucG9pbnQgKS54IC0gY2xpY2tYT2Zmc2V0O1xyXG4gICAgICAgICAgdGhpcy5wcm9wb3NlZFZhbHVlID0gdGhpcy50cmFjay52YWx1ZVRvUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5pbnZlcnNlKCB4ICk7XHJcblxyXG4gICAgICAgICAgY29uc3QgdmFsdWVJblJhbmdlID0gdGhpcy5lbmFibGVkUmFuZ2VQcm9wZXJ0eS5nZXQoKS5jb25zdHJhaW5WYWx1ZSggdGhpcy5wcm9wb3NlZFZhbHVlICk7XHJcbiAgICAgICAgICB2YWx1ZVByb3BlcnR5LnNldCggb3B0aW9ucy5jb25zdHJhaW5WYWx1ZSggdmFsdWVJblJhbmdlICkgKTtcclxuXHJcbiAgICAgICAgICAvLyBhZnRlciB2YWx1ZVByb3BlcnR5IGlzIHNldCBzbyBsaXN0ZW5lciBjYW4gdXNlIHRoZSBuZXcgdmFsdWVcclxuICAgICAgICAgIG9wdGlvbnMuZHJhZyggZXZlbnQgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBlbmQ6IGV2ZW50ID0+IHtcclxuICAgICAgICBpZiAoIHRoaXMuZW5hYmxlZFByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgICAgb3B0aW9ucy5lbmREcmFnKCBldmVudCApO1xyXG5cclxuICAgICAgICAgIC8vIHZvaWNpbmcgLSBEZWZhdWx0IGJlaGF2aW9yIGlzIHRvIHNwZWFrIHRoZSBuZXcgb2JqZWN0IHJlc3BvbnNlIGF0IHRoZSBlbmQgb2YgaW50ZXJhY3Rpb24uIElmIHlvdSB3YW50IHRvXHJcbiAgICAgICAgICAvLyBjdXN0b21pemUgdGhpcyByZXNwb25zZSwgeW91IGNhbiBtb2RpZnkgc3VwZXJ0eXBlIG9wdGlvbnMgVm9pY2luZ09uRW5kUmVzcG9uc2VPcHRpb25zLlxyXG4gICAgICAgICAgdGhpcy52b2ljaW5nT25FbmRSZXNwb25zZSggdmFsdWVPblN0YXJ0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucHJvcG9zZWRWYWx1ZSA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHRodW1iLmFkZElucHV0TGlzdGVuZXIoIHRodW1iRHJhZ0xpc3RlbmVyICk7XHJcblxyXG4gICAgdGhpcy50aHVtYkRyYWdMaXN0ZW5lciA9IHRodW1iRHJhZ0xpc3RlbmVyO1xyXG4gICAgdGhpcy50cmFja0RyYWdMaXN0ZW5lciA9IHRoaXMudHJhY2suZHJhZ0xpc3RlbmVyO1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aHVtYiBwb3NpdGlvbiB3aGVuIHZhbHVlIGNoYW5nZXNcclxuICAgIGNvbnN0IHZhbHVlTXVsdGlsaW5rID0gTXVsdGlsaW5rLm11bHRpbGluayggWyB2YWx1ZVByb3BlcnR5LCB0aGlzLnRyYWNrLnZhbHVlVG9Qb3NpdGlvblByb3BlcnR5IF0sICggdmFsdWUsIHZhbHVlVG9Qb3NpdGlvbiApID0+IHtcclxuICAgICAgdGh1bWIuY2VudGVyWCA9IHZhbHVlVG9Qb3NpdGlvbi5ldmFsdWF0ZSggdmFsdWUgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB3aGVuIHRoZSBlbmFibGVkIHJhbmdlIGNoYW5nZXMsIHRoZSB2YWx1ZSB0byBwb3NpdGlvbiBsaW5lYXIgZnVuY3Rpb24gbXVzdCBjaGFuZ2UgYXMgd2VsbFxyXG4gICAgY29uc3QgZW5hYmxlZFJhbmdlT2JzZXJ2ZXIgPSAoIGVuYWJsZWRSYW5nZTogUmFuZ2UgKSA9PiB7XHJcbiAgICAgIGNvbnN0IGpvaXN0R2xvYmFsID0gXy5nZXQoIHdpbmRvdywgJ3BoZXQuam9pc3QnLCBudWxsICk7IC8vIHJldHVybnMgbnVsbCBpZiBnbG9iYWwgaXNuJ3QgZm91bmRcclxuXHJcbiAgICAgIC8vIFdoZW4gcmVzdG9yaW5nIFBoRVQtaU8gc3RhdGUsIHByZXZlbnQgdGhlIGNsYW1wIGZyb20gc2V0dGluZyBhIHN0YWxlLCBpbmNvcnJlY3QgdmFsdWUgdG8gYSBkZWZlcnJlZCBQcm9wZXJ0eVxyXG4gICAgICAvLyAod2hpY2ggbWF5IGhhdmUgYWxyZWFkeSByZXN0b3JlZCB0aGUgY29ycmVjdCB2YWx1ZSBmcm9tIHBoZXQtaW8gc3RhdGUpLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL21lYW4tc2hhcmUtYW5kLWJhbGFuY2UvaXNzdWVzLzIxXHJcbiAgICAgIGlmICggIWpvaXN0R2xvYmFsIHx8ICF2YWx1ZVByb3BlcnR5LmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgfHwgIWpvaXN0R2xvYmFsLnNpbS5pc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5LnZhbHVlICkge1xyXG5cclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLnByb3Bvc2VkVmFsdWUgPT09IG51bGwgKSB7XHJcblxyXG4gICAgICAgICAgLy8gY2xhbXAgdGhlIGN1cnJlbnQgdmFsdWUgdG8gdGhlIGVuYWJsZWQgcmFuZ2UgaWYgaXQgY2hhbmdlc1xyXG4gICAgICAgICAgdmFsdWVQcm9wZXJ0eS5zZXQoIFV0aWxzLmNsYW1wKCB2YWx1ZVByb3BlcnR5LnZhbHVlLCBlbmFibGVkUmFuZ2UubWluLCBlbmFibGVkUmFuZ2UubWF4ICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gVGhlIHVzZXIgaXMgaG9sZGluZyB0aGUgdGh1bWIsIHdoaWNoIG1heSBiZSBvdXRzaWRlIHRoZSBlbmFibGVkUmFuZ2UuICBJbiB0aGF0IGNhc2UsIGV4cGFuZGluZyB0aGUgcmFuZ2VcclxuICAgICAgICAgIC8vIGNvdWxkIGFjY29tbW9kYXRlIHRoZSBvdXRlciB2YWx1ZVxyXG4gICAgICAgICAgY29uc3QgcHJvcG9zZWRWYWx1ZUluRW5hYmxlZFJhbmdlID0gVXRpbHMuY2xhbXAoIHRoaXMucHJvcG9zZWRWYWx1ZSwgZW5hYmxlZFJhbmdlLm1pbiwgZW5hYmxlZFJhbmdlLm1heCApO1xyXG4gICAgICAgICAgY29uc3QgcHJvcG9zZWRWYWx1ZUluQ29uc3RyYWluZWRSYW5nZSA9IG9wdGlvbnMuY29uc3RyYWluVmFsdWUoIHByb3Bvc2VkVmFsdWVJbkVuYWJsZWRSYW5nZSApO1xyXG4gICAgICAgICAgdmFsdWVQcm9wZXJ0eS5zZXQoIHByb3Bvc2VkVmFsdWVJbkNvbnN0cmFpbmVkUmFuZ2UgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aGlzLmVuYWJsZWRSYW5nZVByb3BlcnR5LmxpbmsoIGVuYWJsZWRSYW5nZU9ic2VydmVyICk7IC8vIG5lZWRzIHRvIGJlIHVubGlua2VkIGluIGRpc3Bvc2UgZnVuY3Rpb25cclxuXHJcbiAgICBjb25zdCBjb25zdHJhaW50ID0gbmV3IFNsaWRlckNvbnN0cmFpbnQoIHRoaXMsIHRoaXMudHJhY2ssIHRodW1iLCBzbGlkZXJQYXJ0c05vZGUsIG9wdGlvbnMub3JpZW50YXRpb24sIHRyYWNrU3BhY2VyLCB0aGlzLnRpY2tzICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlU2xpZGVyID0gKCkgPT4ge1xyXG4gICAgICBjb25zdHJhaW50LmRpc3Bvc2UoKTtcclxuXHJcbiAgICAgIHRodW1iLmRpc3Bvc2UgJiYgdGh1bWIuZGlzcG9zZSgpOyAvLyBpbiBjYXNlIGEgY3VzdG9tIHRodW1iIGlzIHByb3ZpZGVkIHZpYSBvcHRpb25zLnRodW1iTm9kZSB0aGF0IGRvZXNuJ3QgaW1wbGVtZW50IGRpc3Bvc2VcclxuICAgICAgdGhpcy50cmFjay5kaXNwb3NlICYmIHRoaXMudHJhY2suZGlzcG9zZSgpO1xyXG5cclxuICAgICAgaWYgKCBvd25zRW5hYmxlZFJhbmdlUHJvcGVydHkgKSB7XHJcbiAgICAgICAgdGhpcy5lbmFibGVkUmFuZ2VQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lbmFibGVkUmFuZ2VQcm9wZXJ0eS51bmxpbmsoIGVuYWJsZWRSYW5nZU9ic2VydmVyICk7XHJcbiAgICAgIH1cclxuICAgICAgdmFsdWVNdWx0aWxpbmsuZGlzcG9zZSgpO1xyXG4gICAgICB0aHVtYkRyYWdMaXN0ZW5lci5kaXNwb3NlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIHBkb20gLSBjdXN0b20gZm9jdXMgaGlnaGxpZ2h0IHRoYXQgc3Vycm91bmRzIGFuZCBtb3ZlcyB3aXRoIHRoZSB0aHVtYlxyXG4gICAgdGhpcy5mb2N1c0hpZ2hsaWdodCA9IG5ldyBGb2N1c0hpZ2hsaWdodEZyb21Ob2RlKCB0aHVtYiApO1xyXG5cclxuICAgIGFzc2VydCAmJiBUYW5kZW0uVkFMSURBVElPTiAmJiBhc3NlcnQoICFvcHRpb25zLnBoZXRpb0xpbmtlZFByb3BlcnR5IHx8IG9wdGlvbnMucGhldGlvTGlua2VkUHJvcGVydHkuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSxcclxuICAgICAgJ0lmIHByb3ZpZGVkLCBwaGV0aW9MaW5rZWRQcm9wZXJ0eSBzaG91bGQgYmUgUGhFVC1pTyBpbnN0cnVtZW50ZWQnICk7XHJcblxyXG4gICAgLy8gTXVzdCBoYXBwZW4gYWZ0ZXIgaW5zdHJ1bWVudGF0aW9uIChpbiBzdXBlciBjYWxsKVxyXG4gICAgY29uc3QgbGlua2VkUHJvcGVydHkgPSBvcHRpb25zLnBoZXRpb0xpbmtlZFByb3BlcnR5IHx8ICggdmFsdWVQcm9wZXJ0eSBpbnN0YW5jZW9mIFJlYWRPbmx5UHJvcGVydHkgPyB2YWx1ZVByb3BlcnR5IDogbnVsbCApO1xyXG4gICAgaWYgKCBsaW5rZWRQcm9wZXJ0eSApIHtcclxuICAgICAgdGhpcy5hZGRMaW5rZWRFbGVtZW50KCBsaW5rZWRQcm9wZXJ0eSwge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndmFsdWVQcm9wZXJ0eScgKVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbXVzdCBiZSBhZnRlciB0aGUgYnV0dG9uIGlzIGluc3RydW1lbnRlZFxyXG4gICAgLy8gYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSB8fCB0aGlzLmVuYWJsZWRSYW5nZVByb3BlcnR5LmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKTtcclxuICAgICFvd25zRW5hYmxlZFJhbmdlUHJvcGVydHkgJiYgdGhpcy5lbmFibGVkUmFuZ2VQcm9wZXJ0eSBpbnN0YW5jZW9mIFJlYWRPbmx5UHJvcGVydHkgJiYgdGhpcy5hZGRMaW5rZWRFbGVtZW50KCB0aGlzLmVuYWJsZWRSYW5nZVByb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZW5hYmxlZFJhbmdlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggYm91bmRzUmVxdWlyZWRPcHRpb25LZXlzICk7XHJcblxyXG4gICAgLy8gc3VwcG9ydCBmb3IgYmluZGVyIGRvY3VtZW50YXRpb24sIHN0cmlwcGVkIG91dCBpbiBidWlsZHMgYW5kIG9ubHkgcnVucyB3aGVuID9iaW5kZXIgaXMgc3BlY2lmaWVkXHJcbiAgICBhc3NlcnQgJiYgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5iaW5kZXIgJiYgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzdW4nLCAnU2xpZGVyJywgdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBtYWpvclRpY2tzVmlzaWJsZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0TWFqb3JUaWNrc1Zpc2libGUoKTsgfVxyXG5cclxuICBwdWJsaWMgc2V0IG1ham9yVGlja3NWaXNpYmxlKCB2YWx1ZTogYm9vbGVhbiApIHsgdGhpcy5zZXRNYWpvclRpY2tzVmlzaWJsZSggdmFsdWUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IG1pbm9yVGlja3NWaXNpYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5nZXRNaW5vclRpY2tzVmlzaWJsZSgpOyB9XHJcblxyXG4gIHB1YmxpYyBzZXQgbWlub3JUaWNrc1Zpc2libGUoIHZhbHVlOiBib29sZWFuICkgeyB0aGlzLnNldE1pbm9yVGlja3NWaXNpYmxlKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlU2xpZGVyKCk7XHJcblxyXG4gICAgdGhpcy50aWNrcy5mb3JFYWNoKCB0aWNrID0+IHtcclxuICAgICAgdGljay5kaXNwb3NlKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIG1ham9yIHRpY2sgbWFyay5cclxuICAgKi9cclxuICBwdWJsaWMgYWRkTWFqb3JUaWNrKCB2YWx1ZTogbnVtYmVyLCBsYWJlbD86IE5vZGUgKTogdm9pZCB7XHJcbiAgICB0aGlzLmFkZFRpY2soIHRoaXMubWFqb3JUaWNrc1BhcmVudCwgdmFsdWUsIGxhYmVsLFxyXG4gICAgICB0aGlzLnRpY2tPcHRpb25zLm1ham9yVGlja0xlbmd0aCwgdGhpcy50aWNrT3B0aW9ucy5tYWpvclRpY2tTdHJva2UsIHRoaXMudGlja09wdGlvbnMubWFqb3JUaWNrTGluZVdpZHRoICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGEgbWlub3IgdGljayBtYXJrLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRNaW5vclRpY2soIHZhbHVlOiBudW1iZXIsIGxhYmVsPzogTm9kZSApOiB2b2lkIHtcclxuICAgIHRoaXMuYWRkVGljayggdGhpcy5taW5vclRpY2tzUGFyZW50LCB2YWx1ZSwgbGFiZWwsXHJcbiAgICAgIHRoaXMudGlja09wdGlvbnMubWlub3JUaWNrTGVuZ3RoLCB0aGlzLnRpY2tPcHRpb25zLm1pbm9yVGlja1N0cm9rZSwgdGhpcy50aWNrT3B0aW9ucy5taW5vclRpY2tMaW5lV2lkdGggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSB0aWNrIG1hcmsgYWJvdmUgdGhlIHRyYWNrLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYWRkVGljayggcGFyZW50OiBOb2RlLCB2YWx1ZTogbnVtYmVyLCBsYWJlbDogTm9kZSB8IHVuZGVmaW5lZCwgbGVuZ3RoOiBudW1iZXIsIHN0cm9rZTogVFBhaW50LCBsaW5lV2lkdGg6IG51bWJlciApOiB2b2lkIHtcclxuICAgIHRoaXMudGlja3MucHVzaCggbmV3IFNsaWRlclRpY2soIHBhcmVudCwgdmFsdWUsIGxhYmVsLCBsZW5ndGgsIHN0cm9rZSwgbGluZVdpZHRoLCB0aGlzLnRpY2tPcHRpb25zLCB0aGlzLm9yaWVudGF0aW9uLCB0aGlzLnRyYWNrICkgKTtcclxuICB9XHJcblxyXG4gIC8vIFNldHMgdmlzaWJpbGl0eSBvZiBtYWpvciB0aWNrcy5cclxuICBwdWJsaWMgc2V0TWFqb3JUaWNrc1Zpc2libGUoIHZpc2libGU6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICB0aGlzLm1ham9yVGlja3NQYXJlbnQudmlzaWJsZSA9IHZpc2libGU7XHJcbiAgfVxyXG5cclxuICAvLyBHZXRzIHZpc2liaWxpdHkgb2YgbWFqb3IgdGlja3MuXHJcbiAgcHVibGljIGdldE1ham9yVGlja3NWaXNpYmxlKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMubWFqb3JUaWNrc1BhcmVudC52aXNpYmxlO1xyXG4gIH1cclxuXHJcbiAgLy8gU2V0cyB2aXNpYmlsaXR5IG9mIG1pbm9yIHRpY2tzLlxyXG4gIHB1YmxpYyBzZXRNaW5vclRpY2tzVmlzaWJsZSggdmlzaWJsZTogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIHRoaXMubWlub3JUaWNrc1BhcmVudC52aXNpYmxlID0gdmlzaWJsZTtcclxuICB9XHJcblxyXG4gIC8vIEdldHMgdmlzaWJpbGl0eSBvZiBtaW5vciB0aWNrcy5cclxuICBwdWJsaWMgZ2V0TWlub3JUaWNrc1Zpc2libGUoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5taW5vclRpY2tzUGFyZW50LnZpc2libGU7XHJcbiAgfVxyXG5cclxuICAvLyBzdGFuZGFyZGl6ZWQgdGFuZGVtIG5hbWVzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvNjk0XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBUSFVNQl9OT0RFX1RBTkRFTV9OQU1FID0gJ3RodW1iTm9kZScgYXMgY29uc3Q7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBUUkFDS19OT0RFX1RBTkRFTV9OQU1FID0gJ3RyYWNrTm9kZScgYXMgY29uc3Q7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU2xpZGVySU8gPSBuZXcgSU9UeXBlKCAnU2xpZGVySU8nLCB7XHJcbiAgICB2YWx1ZVR5cGU6IFNsaWRlcixcclxuICAgIGRvY3VtZW50YXRpb246ICdBIHRyYWRpdGlvbmFsIHNsaWRlciBjb21wb25lbnQsIHdpdGggYSBrbm9iIGFuZCBwb3NzaWJseSB0aWNrIG1hcmtzJyxcclxuICAgIHN1cGVydHlwZTogTm9kZS5Ob2RlSU9cclxuICB9ICk7XHJcbn1cclxuXHJcbmNsYXNzIFNsaWRlckNvbnN0cmFpbnQgZXh0ZW5kcyBMYXlvdXRDb25zdHJhaW50IHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBwcmVmZXJyZWRQcm9wZXJ0eTogVFByb3BlcnR5PG51bWJlciB8IG51bGw+O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVNsaWRlckNvbnN0cmFpbnQ6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgc2xpZGVyOiBTbGlkZXIsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHRyYWNrOiBTbGlkZXJUcmFjayxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgdGh1bWI6IE5vZGUsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNsaWRlclBhcnRzTm9kZTogTm9kZSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgb3JpZW50YXRpb246IE9yaWVudGF0aW9uLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSB0cmFja1NwYWNlcjogTm9kZSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgdGlja3M6IE9ic2VydmFibGVBcnJheTxTbGlkZXJUaWNrPlxyXG4gICkge1xyXG5cclxuICAgIHN1cGVyKCBzbGlkZXIgKTtcclxuXHJcbiAgICAvLyBXZSBuZWVkIHRvIG1ha2UgaXQgc2l6YWJsZSBpbiBib3RoIGRpbWVuc2lvbnMgKFZTbGlkZXIgdnMgSFNsaWRlciksIGJ1dCB3ZSdsbCBzdGlsbCB3YW50IHRvIG1ha2UgdGhlIG9wcG9zaXRlXHJcbiAgICAvLyBheGlzIG5vbi1zaXphYmxlIChzaW5jZSBpdCB3b24ndCBiZSBzaXphYmxlIGluIGJvdGggb3JpZW50YXRpb25zIGF0IG9uY2UpLlxyXG4gICAgaWYgKCBvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uSE9SSVpPTlRBTCApIHtcclxuICAgICAgc2xpZGVyLmhlaWdodFNpemFibGUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5wcmVmZXJyZWRQcm9wZXJ0eSA9IHRoaXMuc2xpZGVyLmxvY2FsUHJlZmVycmVkV2lkdGhQcm9wZXJ0eTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBzbGlkZXIud2lkdGhTaXphYmxlID0gZmFsc2U7XHJcbiAgICAgIHRoaXMucHJlZmVycmVkUHJvcGVydHkgPSB0aGlzLnNsaWRlci5sb2NhbFByZWZlcnJlZEhlaWdodFByb3BlcnR5O1xyXG4gICAgfVxyXG4gICAgdGhpcy5wcmVmZXJyZWRQcm9wZXJ0eS5sYXp5TGluayggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBTbyByYW5nZSBjaGFuZ2VzIG9yIG1pbmltdW0gY2hhbmdlcyB3aWxsIHRyaWdnZXIgbGF5b3V0cyAoc2luY2UgdGhleSBjYW4gbW92ZSB0aWNrcylcclxuICAgIHRoaXMudHJhY2sucmFuZ2VQcm9wZXJ0eS5sYXp5TGluayggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBUaHVtYiBzaXplIGNoYW5nZXMgc2hvdWxkIHRyaWdnZXIgbGF5b3V0LCBzaW5jZSB3ZSBjaGVjayB0aGUgd2lkdGggb2YgdGhlIHRodW1iXHJcbiAgICAvLyBOT1RFOiBUaGlzIGlzIGlnbm9yaW5nIHRodW1iIHNjYWxlIGNoYW5naW5nLCBidXQgZm9yIHBlcmZvcm1hbmNlL2NvcnJlY3RuZXNzIGl0IG1ha2VzIHNlbnNlIHRvIGF2b2lkIHRoYXQgZm9yIG5vd1xyXG4gICAgLy8gc28gd2UgY2FuIHJ1bGUgb3V0IGluZmluaXRlIGxvb3BzIG9mIHRodW1iIG1vdmVtZW50LlxyXG4gICAgdGhpcy50aHVtYi5sb2NhbEJvdW5kc1Byb3BlcnR5LmxhenlMaW5rKCB0aGlzLl91cGRhdGVMYXlvdXRMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIEFzIHRpY2tzIGFyZSBhZGRlZCwgYWRkIGEgbGlzdGVuZXIgdG8gZWFjaCB0aGF0IHdpbGwgdXBkYXRlIHRoZSBsYXlvdXQgaWYgdGhlIHRpY2sncyBib3VuZHMgY2hhbmdlcy5cclxuICAgIGNvbnN0IHRpY2tBZGRlZExpc3RlbmVyID0gKCBhZGRlZFRpY2s6IFNsaWRlclRpY2sgKSA9PiB7XHJcbiAgICAgIGFkZGVkVGljay50aWNrTm9kZS5sb2NhbEJvdW5kc1Byb3BlcnR5LmxhenlMaW5rKCB0aGlzLl91cGRhdGVMYXlvdXRMaXN0ZW5lciApO1xyXG4gICAgICB0aWNrcy5hZGRJdGVtUmVtb3ZlZExpc3RlbmVyKCByZW1vdmVkVGljayA9PiB7XHJcbiAgICAgICAgaWYgKCByZW1vdmVkVGljayA9PT0gYWRkZWRUaWNrICYmXHJcbiAgICAgICAgICAgICByZW1vdmVkVGljay50aWNrTm9kZS5sb2NhbEJvdW5kc1Byb3BlcnR5Lmhhc0xpc3RlbmVyKCB0aGlzLl91cGRhdGVMYXlvdXRMaXN0ZW5lciApICkge1xyXG4gICAgICAgICAgYWRkZWRUaWNrLnRpY2tOb2RlLmxvY2FsQm91bmRzUHJvcGVydHkudW5saW5rKCB0aGlzLl91cGRhdGVMYXlvdXRMaXN0ZW5lciApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuICAgIHRpY2tzLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCB0aWNrQWRkZWRMaXN0ZW5lciApO1xyXG5cclxuICAgIHRoaXMuYWRkTm9kZSggdHJhY2sgKTtcclxuXHJcbiAgICB0aGlzLmxheW91dCgpO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZVNsaWRlckNvbnN0cmFpbnQgPSAoKSA9PiB7XHJcbiAgICAgIHRpY2tzLnJlbW92ZUl0ZW1BZGRlZExpc3RlbmVyKCB0aWNrQWRkZWRMaXN0ZW5lciApO1xyXG4gICAgICB0aGlzLnByZWZlcnJlZFByb3BlcnR5LnVubGluayggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcclxuICAgICAgdGhpcy50cmFjay5yYW5nZVByb3BlcnR5LnVubGluayggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcclxuICAgICAgdGhpcy50aHVtYi5sb2NhbEJvdW5kc1Byb3BlcnR5LnVubGluayggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgbGF5b3V0KCk6IHZvaWQge1xyXG4gICAgc3VwZXIubGF5b3V0KCk7XHJcblxyXG4gICAgY29uc3Qgc2xpZGVyID0gdGhpcy5zbGlkZXI7XHJcbiAgICBjb25zdCB0cmFjayA9IHRoaXMudHJhY2s7XHJcbiAgICBjb25zdCB0aHVtYiA9IHRoaXMudGh1bWI7XHJcblxyXG4gICAgLy8gRGlsYXRlIHRoZSBsb2NhbCBib3VuZHMgaG9yaXpvbnRhbGx5IHNvIHRoYXQgaXQgZXh0ZW5kcyBiZXlvbmQgd2hlcmUgdGhlIHRodW1iIGNhbiByZWFjaC4gIFRoaXMgcHJldmVudHMgbGF5b3V0XHJcbiAgICAvLyBhc3ltbWV0cnkgd2hlbiB0aGUgc2xpZGVyIHRodW1iIGlzIG9mZiB0aGUgZWRnZXMgb2YgdGhlIHRyYWNrLiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzI4MlxyXG4gICAgdGhpcy50cmFja1NwYWNlci5sb2NhbEJvdW5kcyA9IHRyYWNrLmxvY2FsQm91bmRzLmRpbGF0ZWRYKCB0aHVtYi53aWR0aCAvIDIgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0cmFjay5taW5pbXVtV2lkdGggIT09IG51bGwgKTtcclxuXHJcbiAgICAvLyBPdXIgdHJhY2sncyAoZXh0ZXJpb3IpIG1pbmltdW0gd2lkdGggd2lsbCBJTkNMVURFIFwidmlzdWFsIG92ZXJmbG93XCIgZS5nLiBzdHJva2UuIFRoZSBhY3R1YWwgcmFuZ2UgdXNlZCBmb3JcclxuICAgIC8vIGNvbXB1dGF0aW9uIG9mIHdoZXJlIHRoZSB0aHVtYi90aWNrcyBnbyB3aWxsIGJlIHRoZSBcImludGVyaW9yXCIgd2lkdGggKGV4Y2x1ZGluZyB0aGUgdmlzdWFsIG92ZXJmbG93KSwgZS5nLlxyXG4gICAgLy8gd2l0aG91dCB0aGUgc3Ryb2tlLiBXZSdsbCBuZWVkIHRvIHRyYWNrIGFuZCBoYW5kbGUgdGhlc2Ugc2VwYXJhdGVseSwgYW5kIG9ubHkgaGFuZGxlIHRpY2sgcG9zaXRpb25pbmcgYmFzZWQgb25cclxuICAgIC8vIHRoZSBpbnRlcmlvciB3aWR0aC5cclxuICAgIGNvbnN0IHRvdGFsT3ZlcmZsb3cgPSB0cmFjay5sZWZ0VmlzdWFsT3ZlcmZsb3cgKyB0cmFjay5yaWdodFZpc3VhbE92ZXJmbG93O1xyXG4gICAgY29uc3QgdHJhY2tNaW5pbXVtRXh0ZXJpb3JXaWR0aCA9IHRyYWNrLm1pbmltdW1XaWR0aCE7XHJcbiAgICBjb25zdCB0cmFja01pbmltdW1JbnRlcmlvcldpZHRoID0gdHJhY2tNaW5pbXVtRXh0ZXJpb3JXaWR0aCAtIHRvdGFsT3ZlcmZsb3c7XHJcblxyXG4gICAgLy8gVGFrZXMgYSB0aWNrJ3MgdmFsdWUgaW50byB0aGUgWzAsMV0gcmFuZ2UuIFRoaXMgc2hvdWxkIGJlIG11bHRpcGxpZWQgdGltZXMgdGhlIHBvdGVudGlhbCBJTlRFUklPUiB0cmFjayB3aWR0aFxyXG4gICAgLy8gaW4gb3JkZXIgdG8gZ2V0IHRoZSBwb3NpdGlvbiB0aGUgdGljayBzaG91bGQgYmUgYXQuXHJcbiAgICBjb25zdCBub3JtYWxpemVUaWNrVmFsdWUgPSAoIHZhbHVlOiBudW1iZXIgKSA9PiB7XHJcbiAgICAgIHJldHVybiBVdGlscy5saW5lYXIoIHRyYWNrLnJhbmdlUHJvcGVydHkudmFsdWUubWluLCB0cmFjay5yYW5nZVByb3BlcnR5LnZhbHVlLm1heCwgMCwgMSwgdmFsdWUgKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gTk9URTogRHVlIHRvIHZpc3VhbCBvdmVyZmxvdywgb3VyIHRyYWNrJ3MgcmFuZ2UgKGluY2x1ZGluZyB0aGUgdGh1bWIgZXh0ZW5zaW9uKSB3aWxsIGFjdHVhbGx5IGdvIGZyb21cclxuICAgIC8vICggLXRodW1iLndpZHRoIC8gMiAtIHRyYWNrLmxlZnRWaXN1YWxPdmVyZmxvdyApIG9uIHRoZSBsZWZ0IHRvXHJcbiAgICAvLyAoIHRyYWNrRXh0ZXJpb3JXaWR0aCArIHRodW1iLndpZHRoIC8gMiArIHRyYWNrLnJpZ2h0VmlzdWFsT3ZlcmZsb3cgKSBvbiB0aGUgcmlnaHQuXHJcbiAgICAvLyBUaGlzIGlzIGJlY2F1c2Ugb3VyIHRyYWNrJ3Mgd2lkdGggaXMgcmVkdWNlZCB0byBhY2NvdW50IGZvciBzdHJva2UsIGJ1dCB0aGUgbG9naWNhbCByZWN0YW5nbGUgaXMgc3RpbGwgbG9jYXRlZFxyXG4gICAgLy8gYXQgeD0wLCBtZWFuaW5nIHRoZSBzdHJva2UgKHdpdGggbGluZVdpZHRoPTEpIHdpbGwgdHlwaWNhbGx5IGdvIG91dCB0byAtMC41IChuZWdhdGl2ZSBsZWZ0IHZpc3VhbCBvdmVyZmxvdykuXHJcbiAgICAvLyBPdXIgaG9yaXpvbnRhbCBib3VuZHMgYXJlIHRodXMgZWZmZWN0aXZlbHkgb2Zmc2V0IGJ5IHRoaXMgbGVmdCB2aXN1YWwgb3ZlcmZsb3cgYW1vdW50LlxyXG5cclxuICAgIC8vIE5PVEU6IFRoaXMgYWN0dWFsbHkgZ29lcyBQQVNUIHdoZXJlIHRoZSB0aHVtYiBzaG91bGQgZ28gd2hlbiB0aGVyZSBpcyB2aXN1YWwgb3ZlcmZsb3csIGJ1dCB3ZSBhbHNvXHJcbiAgICAvLyBpbmNsdWRlZCB0aGlzIFwiaW1wcmVjaXNpb25cIiBpbiB0aGUgcGFzdCAobG9jYWxCb3VuZHMgSU5DTFVESU5HIHRoZSBzdHJva2Ugd2FzIGRpbGF0ZWQgYnkgdGhlIHRodW1iIHdpZHRoKSwgc28gd2VcclxuICAgIC8vIHdpbGwgaGF2ZSBhIHNsaWdodCBiaXQgb2YgYWRkaXRpb25hbCBwYWRkaW5nIGluY2x1ZGVkIGhlcmUuXHJcblxyXG4gICAgLy8gTk9URTogRG9jdW1lbnRhdGlvbiB3YXMgYWRkZWQgYmVmb3JlIGR5bmFtaWMgbGF5b3V0IGludGVncmF0aW9uIChub3RpbmcgdGhlIGV4dGVuc2lvbiBCRVlPTkQgdGhlIGJvdW5kcyk6XHJcbiAgICAvLyA+IERpbGF0ZSB0aGUgbG9jYWwgYm91bmRzIGhvcml6b250YWxseSBzbyB0aGF0IGl0IGV4dGVuZHMgYmV5b25kIHdoZXJlIHRoZSB0aHVtYiBjYW4gcmVhY2guICBUaGlzIHByZXZlbnRzIGxheW91dFxyXG4gICAgLy8gPiBhc3ltbWV0cnkgd2hlbiB0aGUgc2xpZGVyIHRodW1iIGlzIG9mZiB0aGUgZWRnZXMgb2YgdGhlIHRyYWNrLiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzI4MlxyXG4gICAgY29uc3QgbGVmdEV4dGVyaW9yT2Zmc2V0ID0gLXRodW1iLndpZHRoIC8gMiAtIHRyYWNrLmxlZnRWaXN1YWxPdmVyZmxvdztcclxuICAgIGNvbnN0IHJpZ2h0RXh0ZXJpb3JPZmZzZXQgPSB0aHVtYi53aWR0aCAvIDIgLSB0cmFjay5sZWZ0VmlzdWFsT3ZlcmZsb3c7XHJcblxyXG4gICAgLy8gU3RhcnQgd2l0aCB0aGUgc2l6ZSBvdXIgbWluaW11bSB0cmFjayB3b3VsZCBiZSBXSVRIIHRoZSBhZGRlZCBzcGFjaW5nIGZvciB0aGUgdGh1bWJcclxuICAgIC8vIE5PVEU6IHdpbGwgYmUgbXV0YXRlZCBiZWxvd1xyXG4gICAgY29uc3QgbWluaW11bVJhbmdlID0gbmV3IFJhbmdlKCBsZWZ0RXh0ZXJpb3JPZmZzZXQsIHRyYWNrTWluaW11bUV4dGVyaW9yV2lkdGggKyByaWdodEV4dGVyaW9yT2Zmc2V0ICk7XHJcblxyXG4gICAgLy8gV2UnbGwgbmVlZCB0byBjb25zaWRlciB3aGVyZSB0aGUgdGlja3Mgd291bGQgYmUgSUYgd2UgaGFkIG91ciBtaW5pbXVtIHNpemUgKHNpbmNlIHRoZSB0aWNrcyB3b3VsZCBwb3RlbnRpYWxseVxyXG4gICAgLy8gYmUgc3BhY2VkIGNsb3NlciB0b2dldGhlcikuIFNvIHdlJ2xsIGNoZWNrIHRoZSBib3VuZHMgb2YgZWFjaCB0aWNrIGlmIGl0IHdhcyBhdCB0aGF0IGxvY2F0aW9uLCBhbmRcclxuICAgIC8vIGVuc3VyZSB0aGF0IHRpY2tzIGFyZSBpbmNsdWRlZCBpbiBvdXIgbWluaW11bSByYW5nZSAoc2luY2UgdGljayBsYWJlbHMgbWF5IHN0aWNrIG91dCBwYXN0IHRoZSB0cmFjaykuXHJcbiAgICB0aGlzLnRpY2tzLmZvckVhY2goIHRpY2sgPT4ge1xyXG5cclxuICAgICAgLy8gV2hlcmUgdGhlIHRpY2sgd2lsbCBiZSBpZiB3ZSBoYXZlIG91ciBtaW5pbXVtIHNpemVcclxuICAgICAgY29uc3QgdGlja01pbmltdW1Qb3NpdGlvbiA9IHRyYWNrTWluaW11bUludGVyaW9yV2lkdGggKiBub3JtYWxpemVUaWNrVmFsdWUoIHRpY2sudmFsdWUgKTtcclxuXHJcbiAgICAgIC8vIEFkanVzdCB0aGUgbWluaW11bSByYW5nZSB0byBpbmNsdWRlIHRoZSB0aWNrLlxyXG4gICAgICBjb25zdCBoYWxmVGlja1dpZHRoID0gdGljay50aWNrTm9kZS53aWR0aCAvIDI7XHJcblxyXG4gICAgICAvLyBUaGUgdGljayB3aWxsIGJlIGNlbnRlcmVkXHJcbiAgICAgIG1pbmltdW1SYW5nZS5pbmNsdWRlUmFuZ2UoIG5ldyBSYW5nZSggLWhhbGZUaWNrV2lkdGgsIGhhbGZUaWNrV2lkdGggKS5zaGlmdGVkKCB0aWNrTWluaW11bVBvc2l0aW9uICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBpZiAoIHNsaWRlci53aWR0aFNpemFibGUgJiYgdGhpcy5wcmVmZXJyZWRQcm9wZXJ0eS52YWx1ZSAhPT0gbnVsbCApIHtcclxuICAgICAgLy8gSGVyZSdzIHdoZXJlIHRoaW5ncyBnZXQgY29tcGxpY2F0ZWQhIEFib3ZlLCBpdCdzIGZhaXJseSBlYXN5IHRvIGdvIGZyb20gXCJ0cmFjayBleHRlcmlvciB3aWR0aFwiID0+IFwic2xpZGVyIHdpZHRoXCIsXHJcbiAgICAgIC8vIGhvd2V2ZXIgd2UgbmVlZCB0byBkbyB0aGUgb3Bwb3NpdGUgKHdoZW4gb3VyIGhvcml6b250YWwgc2xpZGVyIGhhcyBhIHByZWZlcnJlZCB3aWR0aCwgd2UgbmVlZCB0byBjb21wdXRlIHdoYXRcclxuICAgICAgLy8gdHJhY2sgd2lkdGggd2UnbGwgaGF2ZSB0byBtYWtlIHRoYXQgaGFwcGVuKS4gQXMgSSBub3RlZCBpbiB0aGUgaXNzdWUgZm9yIHRoaXMgd29yazpcclxuXHJcbiAgICAgIC8vIFRoZXJlJ3MgYSBmdW4gbGluZWFyIG9wdGltaXphdGlvbiBwcm9ibGVtIGhpZGluZyBpbiBwbGFpbiBzaWdodCAocGVyaGFwcyBhIGhpZ2gtcGVyZm9ybWFuY2UgaXRlcmF0aXZlIHNvbHV0aW9uIHdpbGwgd29yayk6XHJcbiAgICAgIC8vIC0gV2UgY2FuIGNvbXB1dGUgYSBtaW5pbXVtIHNpemUgKGdpdmVuIHRoZSBtaW5pbXVtIHRyYWNrIHNpemUsIHNlZSB3aGVyZSB0aGUgdGljayBsYWJlbHMgZ28sIGFuZCBpbmNsdWRlIHRob3NlKS5cclxuICAgICAgLy8gLSBIT1dFVkVSIGFkanVzdGluZyB0aGUgdHJhY2sgc2l6ZSBBTFNPIGFkanVzdHMgaG93IG11Y2ggdGhlIHRpY2sgbGFiZWxzIHN0aWNrIG91dCB0byB0aGUgc2lkZXMgKHRoZSBleHBhbnNpb25cclxuICAgICAgLy8gICBvZiB0aGUgdHJhY2sgd2lsbCBwdXNoIHRoZSB0aWNrIGxhYmVscyBhd2F5IGZyb20gdGhlIGVkZ2VzKS5cclxuICAgICAgLy8gLSBEaWZmZXJlbnQgdGlja3Mgd2lsbCBiZSB0aGUgbGltaXRpbmcgZmFjdG9yIGZvciB0aGUgYm91bmRzIGF0IGRpZmZlcmVudCB0cmFjayBzaXplcyAoYSB0aWNrIGxhYmVsIG9uIHRoZSB2ZXJ5XHJcbiAgICAgIC8vICAgZW5kIHNob3VsZCBub3QgdmFyeSB0aGUgYm91bmRzIG9mZnNldCwgYnV0IGEgdGljayBsYWJlbCB0aGF0J3MgbGFyZ2VyIGJ1dCBzbGlnaHRseSBvZmZzZXQgZnJvbSB0aGUgZWRnZSBXSUxMXHJcbiAgICAgIC8vICAgdmFyeSB0aGUgb2Zmc2V0KVxyXG4gICAgICAvLyAtIFNvIGl0J3MgZWFzeSB0byBjb21wdXRlIHRoZSByZXN1bHRpbmcgc2l6ZSBmcm9tIHRoZSB0cmFjayBzaXplLCBCVVQgdGhlIGludmVyc2UgcHJvYmxlbSBpcyBtb3JlIGRpZmZpY3VsdC5cclxuICAgICAgLy8gICBFc3NlbnRpYWxseSB3ZSBoYXZlIGEgY29udmV4IHBpZWNld2lzZS1saW5lYXIgZnVuY3Rpb24gbWFwcGluZyB0cmFjayBzaXplIHRvIG91dHB1dCBzaXplIChpbXBsaWNpdGx5IGRlZmluZWRcclxuICAgICAgLy8gICBieSB3aGVyZSB0aWNrIGxhYmVscyBzd2FwIGJlaW5nIHRoZSBsaW1pdGluZyBmYWN0b3IpLCBhbmQgd2UgbmVlZCB0byBpbnZlcnQgaXQuXHJcblxyXG4gICAgICAvLyBFZmZlY3RpdmVseSB0aGUgXCJ0cmFjayB3aWR0aFwiID0+IFwic2xpZGVyIHdpZHRoXCIgaXMgYSBwaWVjZXdpc2UtbGluZWFyIGZ1bmN0aW9uLCB3aGVyZSB0aGUgYnJlYWtwb2ludHMgb2NjdXJcclxuICAgICAgLy8gd2hlcmUgT05FIHRpY2sgZWl0aGVyIGJlY29tZXMgdGhlIGxpbWl0aW5nIGZhY3RvciBvciBzdG9wcyBiZWluZyB0aGUgbGltaXRpbmcgZmFjdG9yLiBNYXRoZW1hdGljYWxseSwgdGhpcyB3b3Jrc1xyXG4gICAgICAvLyBvdXQgdG8gYmUgYmFzZWQgb24gdGhlIGZvbGxvd2luZyBmb3JtdWxhczpcclxuXHJcbiAgICAgIC8vIFRoZSBMRUZUIHggaXMgdGhlIG1pbmltdW0gb2YgYWxsIHRoZSBmb2xsb3dpbmc6XHJcbiAgICAgIC8vICAgLXRodW1iLndpZHRoIC8gMiAtIHRyYWNrLmxlZnRWaXN1YWxPdmVyZmxvd1xyXG4gICAgICAvLyAgIEZPUiBFVkVSWSBUSUNLOiAtdGlja1dpZHRoIC8gMiArICggdHJhY2tXaWR0aCAtIG92ZXJmbG93ICkgKiBub3JtYWxpemVkVGlja1ZhbHVlXHJcbiAgICAgIC8vIFRoZSBSSUdIVCB4IGlzIHRoZSBtYXhpbXVtIG9mIGFsbCB0aGUgZm9sbG93aW5nOlxyXG4gICAgICAvLyAgIHRyYWNrV2lkdGggKyB0aHVtYi53aWR0aCAvIDIgLSB0cmFjay5sZWZ0VmlzdWFsT3ZlcmZsb3dcclxuICAgICAgLy8gICAoZm9yIGV2ZXJ5IHRpY2spIHRpY2tXaWR0aCAvIDIgKyAoIHRyYWNrV2lkdGggLSBvdmVyZmxvdyApICogbm9ybWFsaXplZFRpY2tWYWx1ZVxyXG4gICAgICAvLyBOT1RFOiB0aGUgXCJ0cmFja1dpZHRoIC0gb3ZlcmZsb3dcIiBpcyB0aGUgSU5URVJOQUwgd2lkdGggKG5vdCBpbmNsdWRpbmcgdGhlIHN0cm9rZSkgdGhhdCB3ZSB1c2UgZm9yIHRpY2tcclxuICAgICAgLy8gY29tcHV0YXRpb25cclxuICAgICAgLy8gVGhpcyBlZmZlY3RpdmVseSBjb21wdXRlcyBob3cgZmFyIGV2ZXJ5dGhpbmcgXCJzdGlja3Mgb3V0XCIgYW5kIHdvdWxkIGFmZmVjdCB0aGUgYm91bmRzLlxyXG4gICAgICAvL1xyXG4gICAgICAvLyBUaGUgVE9UQUwgd2lkdGggb2YgdGhlIHNsaWRlciB3aWxsIHNpbXBseSBiZSB0aGUgYWJvdmUgUklHSFQgLSBMRUZULlxyXG5cclxuICAgICAgLy8gSW5zdGVhZCBvZiB1c2luZyBudW1lcmljYWwgc29sdXRpb25zLCB3ZSdyZSBhYmxlIHRvIHNvbHZlIHRoaXMgYW5hbHl0aWNhbGx5IHdpdGggcGllY2V3aXNlLWxpbmVhciBmdW5jdGlvbnMgdGhhdFxyXG4gICAgICAvLyBpbXBsZW1lbnQgdGhlIGFib3ZlIGZ1bmN0aW9ucy4gV2UnbGwgY29uc2lkZXIgZWFjaCBvZiB0aG9zZSBpbmRpdmlkdWFsIGZ1bmN0aW9ucyBhcyBhIGxpbmVhciBmdW5jdGlvbiB3aGVyZVxyXG4gICAgICAvLyB0aGUgaW5wdXQgaXMgdGhlIGV4dGVyaW9yIHRyYWNrIGxlbmd0aCwgZS5nLiBmKHRyYWNrTGVuZ3RoKSA9IEEgKiB0cmFja0xlbmd0aCArIEIsIGZvciBnaXZlbiBBLEIgdmFsdWVzLlxyXG4gICAgICAvLyBCeSBtaW4vbWF4LWluZyB0aGVzZSB0b2dldGhlciBhbmQgdGhlbiB0YWtpbmcgdGhlIGRpZmZlcmVuY2UsIHdlJ2xsIGhhdmUgYW4gYWNjdXJhdGUgZnVuY3Rpb24gb2ZcclxuICAgICAgLy8gZih0cmFja0xlbmd0aCkgPSBzbGlkZXJXaWR0aC4gVGhlbiB3ZSdsbCBpbnZlcnQgdGhhdCBmdW5jdGlvbiwgZS5nLiBmXi0xKHNsaWRlcldpZHRoKSA9IHRyYWNrTGVuZ3RoLCBhbmQgdGhlblxyXG4gICAgICAvLyB3ZSdsbCBiZSBhYmxlIHRvIHBhc3MgaW4gb3VyIHByZWZlcnJlZCBzbGlkZXIgd2lkdGggaW4gb3JkZXIgdG8gY29tcHV0ZSB0aGUgcHJlZmVycmVkIHRyYWNrIGxlbmd0aC5cclxuXHJcbiAgICAgIC8vIFdlJ2xsIG5lZWQgdG8gZmFjdG9yIHRoZSB0cmFja1dpZHRoIG91dCBmb3IgdGhlIHRpY2sgZnVuY3Rpb25zLCBzbzpcclxuICAgICAgLy8gTEVGVCB0aWNrIGNvbXB1dGF0aW9uczpcclxuICAgICAgLy8gICAtdGlja1dpZHRoIC8gMiArICggdHJhY2tXaWR0aCAtIG92ZXJmbG93ICkgKiBub3JtYWxpemVkVGlja1ZhbHVlXHJcbiAgICAgIC8vID0gLXRpY2tXaWR0aCAvIDIgKyB0cmFja1dpZHRoICogbm9ybWFsaXplZFRpY2tWYWx1ZSAtIG92ZXJmbG93ICogbm9ybWFsaXplZFRpY2tWYWx1ZVxyXG4gICAgICAvLyA9IG5vcm1hbGl6ZWRUaWNrVmFsdWUgKiB0cmFja1dpZHRoICsgKCAtdGlja1dpZHRoIC8gMiAtIG92ZXJmbG93ICogbm9ybWFsaXplZFRpY2tWYWx1ZSApXHJcbiAgICAgIC8vIFNvIHdoZW4gd2UgcHV0IGl0IGluIHRoZSBmb3JtIG9mIEEgKiB0cmFja1dpZHRoICsgQiwgd2UgZ2V0OlxyXG4gICAgICAvLyAgIEEgPSBub3JtYWxpemVkVGlja1ZhbHVlLCBCID0gLXRpY2tXaWR0aCAvIDIgLSBvdmVyZmxvdyAqIG5vcm1hbGl6ZWRUaWNrVmFsdWVcclxuICAgICAgLy8gU2ltaWxhcmx5IGhhcHBlbnMgZm9yIHRoZSBSSUdIVCB0aWNrIGNvbXB1dGF0aW9uLlxyXG5cclxuICAgICAgY29uc3QgdHJhY2tXaWR0aFRvRnVsbFdpZHRoRnVuY3Rpb24gPSBDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uLm1heChcclxuICAgICAgICAvLyBSaWdodCBzaWRlICh0cmFjay90aHVtYilcclxuICAgICAgICBDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uLmxpbmVhciggMSwgcmlnaHRFeHRlcmlvck9mZnNldCApLFxyXG4gICAgICAgIC8vIFJpZ2h0IHNpZGUgKHRpY2tzKVxyXG4gICAgICAgIC4uLnRoaXMudGlja3MubWFwKCB0aWNrID0+IHtcclxuICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRUaWNrVmFsdWUgPSBub3JtYWxpemVUaWNrVmFsdWUoIHRpY2sudmFsdWUgKTtcclxuICAgICAgICAgIHJldHVybiBDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uLmxpbmVhciggbm9ybWFsaXplZFRpY2tWYWx1ZSwgdGljay50aWNrTm9kZS53aWR0aCAvIDIgLSB0b3RhbE92ZXJmbG93ICogbm9ybWFsaXplZFRpY2tWYWx1ZSApO1xyXG4gICAgICAgIH0gKVxyXG4gICAgICApLm1pbnVzKCBDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uLm1pbihcclxuICAgICAgICAvLyBMZWZ0IHNpZGUgKHRyYWNrL3RodW1iKVxyXG4gICAgICAgIENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24uY29uc3RhbnQoIGxlZnRFeHRlcmlvck9mZnNldCApLFxyXG4gICAgICAgIC8vIExlZnQgc2lkZSAodGlja3MpXHJcbiAgICAgICAgLi4udGhpcy50aWNrcy5tYXAoIHRpY2sgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBub3JtYWxpemVkVGlja1ZhbHVlID0gbm9ybWFsaXplVGlja1ZhbHVlKCB0aWNrLnZhbHVlICk7XHJcbiAgICAgICAgICAgIHJldHVybiBDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uLmxpbmVhciggbm9ybWFsaXplZFRpY2tWYWx1ZSwgLXRpY2sudGlja05vZGUud2lkdGggLyAyIC0gdG90YWxPdmVyZmxvdyAqIG5vcm1hbGl6ZWRUaWNrVmFsdWUgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICApICkgKTtcclxuXHJcbiAgICAgIC8vIE5PVEU6IFRoaXMgZnVuY3Rpb24gaXMgb25seSBtb25vdG9uaWNhbGx5IGluY3JlYXNpbmcgd2hlbiB0cmFja1dpZHRoIGlzIHBvc2l0aXZlISBXZSdsbCBkcm9wIHRoZSB2YWx1ZXNcclxuICAgICAgLy8gdW5kZXJuZWF0aCBvdXIgbWluaW11bSB0cmFjayB3aWR0aCAodGhleSB3b24ndCBiZSBuZWVkZWQpLCBidXQgd2UnbGwgbmVlZCB0byBhZGQgYW4gZXh0cmEgcG9pbnQgYmVsb3cgdG8gZW5zdXJlXHJcbiAgICAgIC8vIHRoYXQgdGhlIHNsb3BlIGlzIG1haW50YWluZWQgKGR1ZSB0byBob3cgQ29tcGxldGVQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbiB3b3JrcykuXHJcbiAgICAgIGNvbnN0IGZ1bGxXaWR0aFRvVHJhY2tXaWR0aEZ1bmN0aW9uID0gdHJhY2tXaWR0aFRvRnVsbFdpZHRoRnVuY3Rpb24ud2l0aFhWYWx1ZXMoIFtcclxuICAgICAgICB0cmFja01pbmltdW1FeHRlcmlvcldpZHRoIC0gMSxcclxuICAgICAgICB0cmFja01pbmltdW1FeHRlcmlvcldpZHRoLFxyXG4gICAgICAgIC4uLnRyYWNrV2lkdGhUb0Z1bGxXaWR0aEZ1bmN0aW9uLnBvaW50cy5tYXAoIHBvaW50ID0+IHBvaW50LnggKS5maWx0ZXIoIHggPT4geCA+IHRyYWNrTWluaW11bUV4dGVyaW9yV2lkdGggKyAxZS0xMCApXHJcbiAgICAgIF0gKS5pbnZlcnRlZCgpO1xyXG5cclxuICAgICAgdHJhY2sucHJlZmVycmVkV2lkdGggPSBNYXRoLm1heChcclxuICAgICAgICAvLyBFbnN1cmUgd2UncmUgTk9UIGRpcHBpbmcgYmVsb3cgdGhlIG1pbmltdW0gdHJhY2sgd2lkdGggKGZvciBzb21lIHJlYXNvbikuXHJcbiAgICAgICAgdHJhY2tNaW5pbXVtRXh0ZXJpb3JXaWR0aCxcclxuICAgICAgICBmdWxsV2lkdGhUb1RyYWNrV2lkdGhGdW5jdGlvbi5ldmFsdWF0ZSggdGhpcy5wcmVmZXJyZWRQcm9wZXJ0eS52YWx1ZSApXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdHJhY2sucHJlZmVycmVkV2lkdGggPSB0cmFjay5taW5pbXVtV2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbWluaW11bVdpZHRoID0gbWluaW11bVJhbmdlLmdldExlbmd0aCgpO1xyXG5cclxuICAgIC8vIFNldCBtaW5pbXVtcyBhdCB0aGUgZW5kXHJcbiAgICBpZiAoIHRoaXMub3JpZW50YXRpb24gPT09IE9yaWVudGF0aW9uLkhPUklaT05UQUwgKSB7XHJcbiAgICAgIHNsaWRlci5sb2NhbE1pbmltdW1XaWR0aCA9IG1pbmltdW1XaWR0aDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBzbGlkZXIubG9jYWxNaW5pbXVtSGVpZ2h0ID0gbWluaW11bVdpZHRoO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VTbGlkZXJDb25zdHJhaW50KCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5zdW4ucmVnaXN0ZXIoICdTbGlkZXInLCBTbGlkZXIgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUlBLE9BQU9BLFFBQVEsTUFBTSwyQkFBMkI7QUFDaEQsT0FBT0MsZ0JBQWdCLE1BQU0sbUNBQW1DO0FBQ2hFLE9BQU9DLFVBQVUsTUFBTSw0QkFBNEI7QUFDbkQsT0FBT0MsK0JBQStCLE1BQU0saURBQWlEO0FBQzdGLE9BQU9DLEtBQUssTUFBTSx1QkFBdUI7QUFDekMsT0FBT0MsS0FBSyxNQUFNLHVCQUF1QjtBQUN6QyxPQUFPQyw4QkFBOEIsTUFBTSxzREFBc0Q7QUFDakcsT0FBT0MsZ0JBQWdCLE1BQU0sc0RBQXNEO0FBQ25GLE9BQU9DLFNBQVMsSUFBSUMsY0FBYyxRQUFRLGlDQUFpQztBQUMzRSxPQUFPQyxXQUFXLE1BQU0sbUNBQW1DO0FBQzNELE9BQU9DLGNBQWMsTUFBTSxzQ0FBc0M7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