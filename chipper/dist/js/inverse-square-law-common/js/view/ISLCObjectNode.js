// Copyright 2017-2023, University of Colorado Boulder

/**
 * A common type for object views in sims that use inverse-square-law-common. The objects have a shaded sphere with a
 * puller/pusher robot attached that updates based on the model object values.  This node also manages an
 * arrow with a label that represents the force.  This arrow is NOT added as a child of this node, but is
 * intended to be added in the screen view for layering purposes.  The arrow and its label need to be above
 * both ISLCObjectNodes in the screen view.
 *
 * @author Michael Barlow (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import { Shape } from '../../../kite/js/imports.js';
import merge from '../../../phet-core/js/merge.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Circle, Color, DragListener, Node, Path, RichText } from '../../../scenery/js/imports.js';
import AccessibleSlider from '../../../sun/js/accessibility/AccessibleSlider.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ResponsePatternCollection from '../../../utterance-queue/js/ResponsePatternCollection.js';
import Utterance from '../../../utterance-queue/js/Utterance.js';
import inverseSquareLawCommon from '../inverseSquareLawCommon.js';
import ISLCConstants from '../ISLCConstants.js';
import DefaultDirection from './DefaultDirection.js';
import PositionDescriber from './describers/PositionDescriber.js';
import ISLCAlertManager from './ISLCAlertManager.js';
import ISLCForceArrowNode from './ISLCForceArrowNode.js';
import ISLCObjectEnum from '../model/ISLCObjectEnum.js';
import ISLCPullerNode from './ISLCPullerNode.js';
const NEGATIVE_FILL = new Color('#66f');
const POSITIVE_FILL = new Color('#f66');
const ZERO_FILL = new Color('gray');
const LABEL_MAX_WIDTH = 50; // empirically determined through testing with long strings
const LABEL_CENTER_X = 0;
class ISLCObjectNode extends AccessibleSlider(Node, 0) {
  /**
   * @param {ISLCModel} model - the simulation model
   * @param {ISLCObject} object - the associated object's model within the sim
   * @param {Bounds2} layoutBounds - bounds of the screen view containing the object
   * @param {ModelViewTransform2} modelViewTransform
   * @param {ISLCAlertManager} alertManager
   * @param {ForceDescriber} forceDescriber
   * @param {PositionDescriber} positionDescriber
   * @param {Object} config
   * @mixes AccessibleSlider
   * @mixes Voicing
   */
  constructor(model, object, layoutBounds, modelViewTransform, alertManager, forceDescriber, positionDescriber, config) {
    const whichObject = object === model.object1 ? ISLCObjectEnum.OBJECT_ONE : ISLCObjectEnum.OBJECT_TWO;
    config = merge({
      label: null,
      // {string} @required
      otherObjectLabel: null,
      // {string} @required
      defaultDirection: DefaultDirection.LEFT,
      // {boolean} - if true, arrows will point towards each other if forces is negative. Used by the puller and arrow nodes
      attractNegative: false,
      snapToNearest: null,
      // {number} if present, object node will snap to the nearest snapToNearest value on drag
      stepSize: null,
      // {number} step size when moving the object keyboard. By default based on snapToNearest, see below.

      arrowColor: '#66f',
      // color of vertical line
      y: 250,
      forceArrowHeight: 150,
      // height of arrow in view coordinates

      objectColor: null,
      // {{string}} @required - description of sphere for voicing content

      // AccessibleSlider
      valueProperty: object.positionProperty,
      enabledRangeProperty: object.enabledRangeProperty,
      // Voicing
      // a single reusable Utterance that will prevent the voicingUtteranceQueue from getting spammed with too many
      // alerts as drag occurs.
      voicingUtterance: new Utterance({
        alertStableDelay: 500
      }),
      // phet-io
      tandem: Tandem.REQUIRED,
      // pdom
      containerTagName: 'div',
      // {Property[]} - Properties that need to be monitored to successfully update this Node's PDOM descriptions
      additionalA11yDependencies: []
    }, config);

    // separate call because of the use of a config value from the above defaults
    config = merge({
      // options passed to ISLCForceArrowNode, filled in below
      arrowNodeOptions: {
        attractNegative: config.attractNegative,
        defaultDirection: config.defaultDirection,
        forceArrowHeight: config.forceArrowHeight,
        forceReadoutDecimalPlaces: ISLCConstants.DECIMAL_NOTATION_PRECISION // number of decimal places in force readout
      },

      // options for the RichText label on the object circle
      labelOptions: {
        fill: 'black',
        font: new PhetFont({
          size: 12
        }),
        pickable: false,
        maxWidth: LABEL_MAX_WIDTH,
        centerX: LABEL_CENTER_X,
        tandem: config.tandem.createTandem('labelText')
      },
      // options passed to the PullerNode, filled in below
      pullerNodeOptions: {
        attractNegative: config.attractNegative
      },
      // options for AccessibleSlider
      keyboardStep: config.stepSize,
      shiftKeyboardStep: config.snapToNearest,
      pageKeyboardStep: config.stepSize * 2,
      a11yMapPDOMValue: value => Utils.toFixedNumber(value, 1),
      constrainValue: value => {
        const numberOfDecimalPlaces = Utils.numberOfDecimalPlaces(config.snapToNearest);
        return Utils.toFixedNumber(value, numberOfDecimalPlaces);
      },
      startDrag: () => {
        object.isDraggingProperty.value = true;
        oldPosition = object.positionProperty.get();
      },
      endDrag: () => {
        object.isDraggingProperty.value = false;
        this.redrawForce();

        // voicing
        this.voicingSpeakDragResponse(object, object.positionProperty.value, oldPosition);
      },
      a11yCreateContextResponseAlert: () => {
        const newPosition = object.positionProperty.get();
        const positionChanged = newPosition !== oldPosition;
        return positionChanged ? forceDescriber.getVectorChangeText(object, false) : forceDescriber.getPositionUnchangedAlertText(object);
      },
      a11yCreateAriaValueText: positionDescriber.getPositionAriaValueTextCreator(whichObject),
      // This object's PDOM description also depends on the position of the other object, so include it here.
      a11yDependencies: config.additionalA11yDependencies.concat(object === model.object1 ? [model.object2.positionProperty] : [model.object1.positionProperty])
    }, config);
    config = merge({}, config);

    // use snapToNearest if stepSize is not provided
    if (config.stepSize === null) {
      assert && assert(config.snapToNearest, 'snapToNearest is required if stepSize is not provided.');
      config.stepSize = config.snapToNearest * 2;
    }
    assert && assert(config.label, 'required param');
    assert && assert(config.otherObjectLabel, 'required param');
    assert && assert(alertManager instanceof ISLCAlertManager);
    super(config);
    this.accessibleName = PositionDescriber.getObjectLabelPositionText(config.label);

    // @protected
    this.layoutBounds = layoutBounds;
    this.objectModel = object;
    this.model = model; // used in abstract method implementations by children.
    this.modelViewTransform = modelViewTransform;
    this.objectLabel = config.label;
    this.otherObjectLabel = config.otherObjectLabel;
    this.positionDescriber = positionDescriber;

    // @private
    this.forceDescriber = forceDescriber;

    // @public - which object this instance is (one or two)
    this.enum = whichObject;

    // the full range of force for the arrow node (note: this is distinct)
    const arrowForceRange = new Range(model.getMinForceMagnitude(), model.getMaxForce());

    // @protected, (@public for pdomOrder) - arrow node
    this.arrowNode = new ISLCForceArrowNode(arrowForceRange, layoutBounds, config.label, config.otherObjectLabel, config.tandem.createTandem('forceDisplayNode'), config.arrowNodeOptions);

    // set y position for the arrow
    this.arrowNode.y = config.y - config.forceArrowHeight;

    // @private - the puller node
    this.pullerNode = new ISLCPullerNode(new Range(model.getMinForce(), model.getMaxForce()), config.pullerNodeOptions);
    if (config.defaultDirection === DefaultDirection.RIGHT) {
      this.pullerNode.scale(-1, 1);
    }

    // @protected - a parent node that applies the drag handler
    this.dragNode = new Node({
      cursor: 'pointer'
    });

    // the 'object' - a shaded circle
    const radius = modelViewTransform.modelToViewDeltaX(object.radiusProperty.get());

    // @protected - the object
    this.objectCircle = new Circle(radius);
    this.dragNode.addChild(this.pullerNode);
    this.dragNode.addChild(this.objectCircle);

    // @public - for ruler regions
    // Small black dot where vertical arrow line connects to the object
    this.centerPoint = new Circle(2, {
      fill: '#000'
    });
    this.dragNode.addChild(this.centerPoint);
    this.labelText = new RichText(config.label, config.labelOptions);
    this.dragNode.addChild(this.labelText);
    this.labelText.boundsProperty.lazyLink(() => {
      this.labelText.centerX = this.objectCircle.centerX;
    });
    this.addChild(this.dragNode);

    // @private
    this.y = config.y; // TODO: is this needed?

    // Added for PhET-iO as a way to hide the dashed lines.
    const centerOfMassLineNode = new Node({
      tandem: config.tandem.createTandem('centerOfMassLineNode')
    });
    this.addChild(centerOfMassLineNode);

    // The marker line, connecting the arrow to the object. The first one is for the shadow so that
    // it is visible on top of the object
    const markerLineShape = new Shape();
    markerLineShape.moveTo(0, -4);
    markerLineShape.lineTo(0, -config.forceArrowHeight);
    centerOfMassLineNode.addChild(new Path(markerLineShape, {
      stroke: '#FFF',
      lineDash: [4, 4],
      lineWidth: 2,
      x: 0.5,
      y: 0.5
    }));
    const markerLineShapeTop = new Path(markerLineShape, {
      stroke: config.arrowColor,
      lineDash: [4, 4],
      lineWidth: 2
    });
    centerOfMassLineNode.addChild(markerLineShapeTop);
    let clickOffset;
    let oldPosition = object.positionProperty.get();
    this.dragListener = new DragListener({
      allowTouchSnag: true,
      start: event => {
        clickOffset = this.dragNode.globalToParentPoint(event.pointer.point).x - this.dragNode.x;
        object.isDraggingProperty.value = true;
        oldPosition = object.positionProperty.get();

        // voicing - on drag start, just speak the name and object response since we haven't moved yet
        this.voicingSpeakResponse({
          nameResponse: this.voicingNameResponse,
          objectResponse: this.voicingObjectResponse
        });
      },
      drag: event => {
        // drag position relative to the pointer pointer start position and convert to model coordinates
        let x = modelViewTransform.viewToModelX(this.globalToParentPoint(event.pointer.point).x - clickOffset);

        // absolute drag bounds based on model
        // see method descriptions for details
        const xMax = model.getObjectMaxPosition(object);
        const xMin = model.getObjectMinPosition(object);

        // apply limitations and update position
        x = Math.max(Math.min(x, xMax), xMin); // limited value of x (by boundary) in model coordinates

        // snapToGrid method dynamically checks whether to snap or not
        object.positionProperty.set(model.snapToGrid(x));

        // voicing
        this.voicingSpeakDragResponse(object, object.positionProperty.value, oldPosition, {
          // for mouse/touch input we want to include the progress clause every single move
          alwaysIncludeProgressClause: true
        });
      },
      end: () => {
        object.isDraggingProperty.value = false;
      },
      tandem: config.tandem.createTandem('dragListener')
    });
    this.dragNode.addInputListener(this.dragListener);
    const boundRedrawForce = this.redrawForce.bind(this);
    model.showForceValuesProperty.lazyLink(boundRedrawForce);
    object.radiusProperty.lazyLink(boundRedrawForce);
    object.valueProperty.lazyLink(boundRedrawForce);
    model.forceProperty.lazyLink(boundRedrawForce);
    object.baseColorProperty.link(baseColor => {
      this.updateGradient(baseColor);
      if (config.attractNegative) {
        markerLineShapeTop.stroke = getUpdatedFill(object.valueProperty.get());
      }
    });

    // on reset, no objects are destroyed and properties are set to initial values
    // no need to dispose of any of the below listeners
    object.positionProperty.link(property => {
      // position this node and its force arrow with label
      const transformedValue = modelViewTransform.modelToViewX(property);
      this.x = transformedValue;
      this.arrowNode.x = transformedValue;
      this.redrawForce();
    });
    this.mutate({
      voicingNameResponse: this.accessibleName,
      // for the objects, it was requested that "Object" response come before "name" responses for all
      // forms of input
      voicingResponsePatternCollection: new ResponsePatternCollection({
        nameObjectHint: '{{OBJECT}}, {{NAME}}, {{HINT}}',
        nameObject: '{{OBJECT}}, {{NAME}}'
      })
    });

    // for layering purposes, we assume that the ScreenView will add the arrow node and label - by the
    // time the sim is stepped, make sure that the arrows are added to the view
    if (assert) {
      const checkForArrowAdded = () => {
        if (this.arrowNode.parents.length === 0) {
          throw new Error('ArrowNode should be added to the view in inverse-square-law-common sim screen view');
        }

        // no need to keep checking
        model.stepEmitter.removeListener(checkForArrowAdded);
      };
      model.stepEmitter.addListener(checkForArrowAdded);
    }
  }

  /**
   * Redraws the white radial gradient for the object - must be implemented in subtypes.
   *
   * @public
   * @abstract
   */
  updateGradient() {
    throw new Error('Update gradient must be implemented in subtypes.');
  }

  /**
   * Sets whether or not the readouts above the arrows use scientific notation in their display of the value.
   *
   * @public
   * @param {boolean} useScientificNotation
   */
  setReadoutsInScientificNotation(useScientificNotation) {
    this.arrowNode.scientificNotationMode = useScientificNotation;

    // redraw the force after updating
    this.redrawForce();
  }

  /**
   * Updates the radius, arrow length & direction, force readout, and the visible puller image.
   *
   * @public
   */
  redrawForce() {
    this.objectCircle.setRadius(this.modelViewTransform.modelToViewDeltaX(this.objectModel.radiusProperty.get()));
    this.updateGradient(this.objectModel.baseColorProperty.get());

    // set the labelText to be right below the circle
    this.labelText.top = this.objectCircle.bottom + +1;

    // set the scale of the arrow based on the model value
    this.arrowNode.redrawArrow(this.model.forceProperty.get());

    // update the arrow label - always display the force as a positive magnitude
    this.arrowNode.updateLabel(Math.abs(this.model.forceProperty.get()), this.model.showForceValuesProperty.get());

    // set the text position, positioning the center relative to the parent coordinate frame
    this.arrowNode.setArrowTextPosition(this.parentToLocalBounds(this.layoutBounds));

    // update puller node visibility
    this.pullerNode.setPull(this.model.forceProperty.get(), this.objectCircle.width / 2);

    // voicing - update the ReadingBlock content for the arrow
    this.arrowNode.readingBlockNameResponse = this.forceDescriber.getForceVectorsReadingBlockNameResponse(this.objectLabel, this.otherObjectLabel);
  }

  /**
   * Speaks a response (Through the Voicing trait) that describes the drag. Content will only be spoken
   * if there has been some movement.
   * @private
   *
   * @param {ISLCObject} object
   * @param {number} newPosition - new position of the object during drag
   * @param {number} oldPosition - position of the object when drag started
   * @param {Object} [options]
   */
  voicingSpeakDragResponse(object, newPosition, oldPosition, options) {
    options = merge({
      // {boolean} whether or not to include the "progress" clause that describes whether the sphere is closer/farther
      // away from the other mass after dragging
      alwaysIncludeProgressClause: false
    }, options);
    if (newPosition !== oldPosition) {
      const contextResponse = this.forceDescriber.getVectorChangeText(object, options.alwaysIncludeProgressClause);

      // speak the object response and context response, but don't include the name response, it doesn't need to be
      // repeated every move
      this.voicingSpeakResponse({
        objectResponse: this.voicingObjectResponse,
        contextResponse: contextResponse
      });
    }
  }
}

/**
 * Helper function to get a color based the force value
 *
 * @param {number} forceValue
 * @returns {Color}
 */
const getUpdatedFill = forceValue => {
  let fill;
  if (forceValue < 0) {
    fill = NEGATIVE_FILL;
  } else if (forceValue > 0) {
    fill = POSITIVE_FILL;
  } else {
    fill = ZERO_FILL;
  }
  return fill;
};
inverseSquareLawCommon.register('ISLCObjectNode', ISLCObjectNode);
export default ISLCObjectNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIlV0aWxzIiwiU2hhcGUiLCJtZXJnZSIsIlBoZXRGb250IiwiQ2lyY2xlIiwiQ29sb3IiLCJEcmFnTGlzdGVuZXIiLCJOb2RlIiwiUGF0aCIsIlJpY2hUZXh0IiwiQWNjZXNzaWJsZVNsaWRlciIsIlRhbmRlbSIsIlJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24iLCJVdHRlcmFuY2UiLCJpbnZlcnNlU3F1YXJlTGF3Q29tbW9uIiwiSVNMQ0NvbnN0YW50cyIsIkRlZmF1bHREaXJlY3Rpb24iLCJQb3NpdGlvbkRlc2NyaWJlciIsIklTTENBbGVydE1hbmFnZXIiLCJJU0xDRm9yY2VBcnJvd05vZGUiLCJJU0xDT2JqZWN0RW51bSIsIklTTENQdWxsZXJOb2RlIiwiTkVHQVRJVkVfRklMTCIsIlBPU0lUSVZFX0ZJTEwiLCJaRVJPX0ZJTEwiLCJMQUJFTF9NQVhfV0lEVEgiLCJMQUJFTF9DRU5URVJfWCIsIklTTENPYmplY3ROb2RlIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsIm9iamVjdCIsImxheW91dEJvdW5kcyIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImFsZXJ0TWFuYWdlciIsImZvcmNlRGVzY3JpYmVyIiwicG9zaXRpb25EZXNjcmliZXIiLCJjb25maWciLCJ3aGljaE9iamVjdCIsIm9iamVjdDEiLCJPQkpFQ1RfT05FIiwiT0JKRUNUX1RXTyIsImxhYmVsIiwib3RoZXJPYmplY3RMYWJlbCIsImRlZmF1bHREaXJlY3Rpb24iLCJMRUZUIiwiYXR0cmFjdE5lZ2F0aXZlIiwic25hcFRvTmVhcmVzdCIsInN0ZXBTaXplIiwiYXJyb3dDb2xvciIsInkiLCJmb3JjZUFycm93SGVpZ2h0Iiwib2JqZWN0Q29sb3IiLCJ2YWx1ZVByb3BlcnR5IiwicG9zaXRpb25Qcm9wZXJ0eSIsImVuYWJsZWRSYW5nZVByb3BlcnR5Iiwidm9pY2luZ1V0dGVyYW5jZSIsImFsZXJ0U3RhYmxlRGVsYXkiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsImNvbnRhaW5lclRhZ05hbWUiLCJhZGRpdGlvbmFsQTExeURlcGVuZGVuY2llcyIsImFycm93Tm9kZU9wdGlvbnMiLCJmb3JjZVJlYWRvdXREZWNpbWFsUGxhY2VzIiwiREVDSU1BTF9OT1RBVElPTl9QUkVDSVNJT04iLCJsYWJlbE9wdGlvbnMiLCJmaWxsIiwiZm9udCIsInNpemUiLCJwaWNrYWJsZSIsIm1heFdpZHRoIiwiY2VudGVyWCIsImNyZWF0ZVRhbmRlbSIsInB1bGxlck5vZGVPcHRpb25zIiwia2V5Ym9hcmRTdGVwIiwic2hpZnRLZXlib2FyZFN0ZXAiLCJwYWdlS2V5Ym9hcmRTdGVwIiwiYTExeU1hcFBET01WYWx1ZSIsInZhbHVlIiwidG9GaXhlZE51bWJlciIsImNvbnN0cmFpblZhbHVlIiwibnVtYmVyT2ZEZWNpbWFsUGxhY2VzIiwic3RhcnREcmFnIiwiaXNEcmFnZ2luZ1Byb3BlcnR5Iiwib2xkUG9zaXRpb24iLCJnZXQiLCJlbmREcmFnIiwicmVkcmF3Rm9yY2UiLCJ2b2ljaW5nU3BlYWtEcmFnUmVzcG9uc2UiLCJhMTF5Q3JlYXRlQ29udGV4dFJlc3BvbnNlQWxlcnQiLCJuZXdQb3NpdGlvbiIsInBvc2l0aW9uQ2hhbmdlZCIsImdldFZlY3RvckNoYW5nZVRleHQiLCJnZXRQb3NpdGlvblVuY2hhbmdlZEFsZXJ0VGV4dCIsImExMXlDcmVhdGVBcmlhVmFsdWVUZXh0IiwiZ2V0UG9zaXRpb25BcmlhVmFsdWVUZXh0Q3JlYXRvciIsImExMXlEZXBlbmRlbmNpZXMiLCJjb25jYXQiLCJvYmplY3QyIiwiYXNzZXJ0IiwiYWNjZXNzaWJsZU5hbWUiLCJnZXRPYmplY3RMYWJlbFBvc2l0aW9uVGV4dCIsIm9iamVjdE1vZGVsIiwib2JqZWN0TGFiZWwiLCJlbnVtIiwiYXJyb3dGb3JjZVJhbmdlIiwiZ2V0TWluRm9yY2VNYWduaXR1ZGUiLCJnZXRNYXhGb3JjZSIsImFycm93Tm9kZSIsInB1bGxlck5vZGUiLCJnZXRNaW5Gb3JjZSIsIlJJR0hUIiwic2NhbGUiLCJkcmFnTm9kZSIsImN1cnNvciIsInJhZGl1cyIsIm1vZGVsVG9WaWV3RGVsdGFYIiwicmFkaXVzUHJvcGVydHkiLCJvYmplY3RDaXJjbGUiLCJhZGRDaGlsZCIsImNlbnRlclBvaW50IiwibGFiZWxUZXh0IiwiYm91bmRzUHJvcGVydHkiLCJsYXp5TGluayIsImNlbnRlck9mTWFzc0xpbmVOb2RlIiwibWFya2VyTGluZVNoYXBlIiwibW92ZVRvIiwibGluZVRvIiwic3Ryb2tlIiwibGluZURhc2giLCJsaW5lV2lkdGgiLCJ4IiwibWFya2VyTGluZVNoYXBlVG9wIiwiY2xpY2tPZmZzZXQiLCJkcmFnTGlzdGVuZXIiLCJhbGxvd1RvdWNoU25hZyIsInN0YXJ0IiwiZXZlbnQiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwicG9pbnRlciIsInBvaW50Iiwidm9pY2luZ1NwZWFrUmVzcG9uc2UiLCJuYW1lUmVzcG9uc2UiLCJ2b2ljaW5nTmFtZVJlc3BvbnNlIiwib2JqZWN0UmVzcG9uc2UiLCJ2b2ljaW5nT2JqZWN0UmVzcG9uc2UiLCJkcmFnIiwidmlld1RvTW9kZWxYIiwieE1heCIsImdldE9iamVjdE1heFBvc2l0aW9uIiwieE1pbiIsImdldE9iamVjdE1pblBvc2l0aW9uIiwiTWF0aCIsIm1heCIsIm1pbiIsInNldCIsInNuYXBUb0dyaWQiLCJhbHdheXNJbmNsdWRlUHJvZ3Jlc3NDbGF1c2UiLCJlbmQiLCJhZGRJbnB1dExpc3RlbmVyIiwiYm91bmRSZWRyYXdGb3JjZSIsImJpbmQiLCJzaG93Rm9yY2VWYWx1ZXNQcm9wZXJ0eSIsImZvcmNlUHJvcGVydHkiLCJiYXNlQ29sb3JQcm9wZXJ0eSIsImxpbmsiLCJiYXNlQ29sb3IiLCJ1cGRhdGVHcmFkaWVudCIsImdldFVwZGF0ZWRGaWxsIiwicHJvcGVydHkiLCJ0cmFuc2Zvcm1lZFZhbHVlIiwibW9kZWxUb1ZpZXdYIiwibXV0YXRlIiwidm9pY2luZ1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24iLCJuYW1lT2JqZWN0SGludCIsIm5hbWVPYmplY3QiLCJjaGVja0ZvckFycm93QWRkZWQiLCJwYXJlbnRzIiwibGVuZ3RoIiwiRXJyb3IiLCJzdGVwRW1pdHRlciIsInJlbW92ZUxpc3RlbmVyIiwiYWRkTGlzdGVuZXIiLCJzZXRSZWFkb3V0c0luU2NpZW50aWZpY05vdGF0aW9uIiwidXNlU2NpZW50aWZpY05vdGF0aW9uIiwic2NpZW50aWZpY05vdGF0aW9uTW9kZSIsInNldFJhZGl1cyIsInRvcCIsImJvdHRvbSIsInJlZHJhd0Fycm93IiwidXBkYXRlTGFiZWwiLCJhYnMiLCJzZXRBcnJvd1RleHRQb3NpdGlvbiIsInBhcmVudFRvTG9jYWxCb3VuZHMiLCJzZXRQdWxsIiwid2lkdGgiLCJyZWFkaW5nQmxvY2tOYW1lUmVzcG9uc2UiLCJnZXRGb3JjZVZlY3RvcnNSZWFkaW5nQmxvY2tOYW1lUmVzcG9uc2UiLCJvcHRpb25zIiwiY29udGV4dFJlc3BvbnNlIiwiZm9yY2VWYWx1ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSVNMQ09iamVjdE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBjb21tb24gdHlwZSBmb3Igb2JqZWN0IHZpZXdzIGluIHNpbXMgdGhhdCB1c2UgaW52ZXJzZS1zcXVhcmUtbGF3LWNvbW1vbi4gVGhlIG9iamVjdHMgaGF2ZSBhIHNoYWRlZCBzcGhlcmUgd2l0aCBhXHJcbiAqIHB1bGxlci9wdXNoZXIgcm9ib3QgYXR0YWNoZWQgdGhhdCB1cGRhdGVzIGJhc2VkIG9uIHRoZSBtb2RlbCBvYmplY3QgdmFsdWVzLiAgVGhpcyBub2RlIGFsc28gbWFuYWdlcyBhblxyXG4gKiBhcnJvdyB3aXRoIGEgbGFiZWwgdGhhdCByZXByZXNlbnRzIHRoZSBmb3JjZS4gIFRoaXMgYXJyb3cgaXMgTk9UIGFkZGVkIGFzIGEgY2hpbGQgb2YgdGhpcyBub2RlLCBidXQgaXNcclxuICogaW50ZW5kZWQgdG8gYmUgYWRkZWQgaW4gdGhlIHNjcmVlbiB2aWV3IGZvciBsYXllcmluZyBwdXJwb3Nlcy4gIFRoZSBhcnJvdyBhbmQgaXRzIGxhYmVsIG5lZWQgdG8gYmUgYWJvdmVcclxuICogYm90aCBJU0xDT2JqZWN0Tm9kZXMgaW4gdGhlIHNjcmVlbiB2aWV3LlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgQmFybG93IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBDaXJjbGUsIENvbG9yLCBEcmFnTGlzdGVuZXIsIE5vZGUsIFBhdGgsIFJpY2hUZXh0IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEFjY2Vzc2libGVTbGlkZXIgZnJvbSAnLi4vLi4vLi4vc3VuL2pzL2FjY2Vzc2liaWxpdHkvQWNjZXNzaWJsZVNsaWRlci5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uIGZyb20gJy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9SZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uLmpzJztcclxuaW1wb3J0IFV0dGVyYW5jZSBmcm9tICcuLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvVXR0ZXJhbmNlLmpzJztcclxuaW1wb3J0IGludmVyc2VTcXVhcmVMYXdDb21tb24gZnJvbSAnLi4vaW52ZXJzZVNxdWFyZUxhd0NvbW1vbi5qcyc7XHJcbmltcG9ydCBJU0xDQ29uc3RhbnRzIGZyb20gJy4uL0lTTENDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgRGVmYXVsdERpcmVjdGlvbiBmcm9tICcuL0RlZmF1bHREaXJlY3Rpb24uanMnO1xyXG5pbXBvcnQgUG9zaXRpb25EZXNjcmliZXIgZnJvbSAnLi9kZXNjcmliZXJzL1Bvc2l0aW9uRGVzY3JpYmVyLmpzJztcclxuaW1wb3J0IElTTENBbGVydE1hbmFnZXIgZnJvbSAnLi9JU0xDQWxlcnRNYW5hZ2VyLmpzJztcclxuaW1wb3J0IElTTENGb3JjZUFycm93Tm9kZSBmcm9tICcuL0lTTENGb3JjZUFycm93Tm9kZS5qcyc7XHJcbmltcG9ydCBJU0xDT2JqZWN0RW51bSBmcm9tICcuLi9tb2RlbC9JU0xDT2JqZWN0RW51bS5qcyc7XHJcbmltcG9ydCBJU0xDUHVsbGVyTm9kZSBmcm9tICcuL0lTTENQdWxsZXJOb2RlLmpzJztcclxuXHJcbmNvbnN0IE5FR0FUSVZFX0ZJTEwgPSBuZXcgQ29sb3IoICcjNjZmJyApO1xyXG5jb25zdCBQT1NJVElWRV9GSUxMID0gbmV3IENvbG9yKCAnI2Y2NicgKTtcclxuY29uc3QgWkVST19GSUxMID0gbmV3IENvbG9yKCAnZ3JheScgKTtcclxuXHJcbmNvbnN0IExBQkVMX01BWF9XSURUSCA9IDUwOyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHRocm91Z2ggdGVzdGluZyB3aXRoIGxvbmcgc3RyaW5nc1xyXG5jb25zdCBMQUJFTF9DRU5URVJfWCA9IDA7XHJcblxyXG5jbGFzcyBJU0xDT2JqZWN0Tm9kZSBleHRlbmRzIEFjY2Vzc2libGVTbGlkZXIoIE5vZGUsIDAgKSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7SVNMQ01vZGVsfSBtb2RlbCAtIHRoZSBzaW11bGF0aW9uIG1vZGVsXHJcbiAgICogQHBhcmFtIHtJU0xDT2JqZWN0fSBvYmplY3QgLSB0aGUgYXNzb2NpYXRlZCBvYmplY3QncyBtb2RlbCB3aXRoaW4gdGhlIHNpbVxyXG4gICAqIEBwYXJhbSB7Qm91bmRzMn0gbGF5b3V0Qm91bmRzIC0gYm91bmRzIG9mIHRoZSBzY3JlZW4gdmlldyBjb250YWluaW5nIHRoZSBvYmplY3RcclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqIEBwYXJhbSB7SVNMQ0FsZXJ0TWFuYWdlcn0gYWxlcnRNYW5hZ2VyXHJcbiAgICogQHBhcmFtIHtGb3JjZURlc2NyaWJlcn0gZm9yY2VEZXNjcmliZXJcclxuICAgKiBAcGFyYW0ge1Bvc2l0aW9uRGVzY3JpYmVyfSBwb3NpdGlvbkRlc2NyaWJlclxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWdcclxuICAgKiBAbWl4ZXMgQWNjZXNzaWJsZVNsaWRlclxyXG4gICAqIEBtaXhlcyBWb2ljaW5nXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCBvYmplY3QsIGxheW91dEJvdW5kcywgbW9kZWxWaWV3VHJhbnNmb3JtLCBhbGVydE1hbmFnZXIsIGZvcmNlRGVzY3JpYmVyLCBwb3NpdGlvbkRlc2NyaWJlciwgY29uZmlnICkge1xyXG4gICAgY29uc3Qgd2hpY2hPYmplY3QgPSBvYmplY3QgPT09IG1vZGVsLm9iamVjdDEgPyBJU0xDT2JqZWN0RW51bS5PQkpFQ1RfT05FIDogSVNMQ09iamVjdEVudW0uT0JKRUNUX1RXTztcclxuXHJcbiAgICBjb25maWcgPSBtZXJnZSgge1xyXG4gICAgICBsYWJlbDogbnVsbCwgLy8ge3N0cmluZ30gQHJlcXVpcmVkXHJcbiAgICAgIG90aGVyT2JqZWN0TGFiZWw6IG51bGwsIC8vIHtzdHJpbmd9IEByZXF1aXJlZFxyXG4gICAgICBkZWZhdWx0RGlyZWN0aW9uOiBEZWZhdWx0RGlyZWN0aW9uLkxFRlQsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBpZiB0cnVlLCBhcnJvd3Mgd2lsbCBwb2ludCB0b3dhcmRzIGVhY2ggb3RoZXIgaWYgZm9yY2VzIGlzIG5lZ2F0aXZlLiBVc2VkIGJ5IHRoZSBwdWxsZXIgYW5kIGFycm93IG5vZGVzXHJcbiAgICAgIGF0dHJhY3ROZWdhdGl2ZTogZmFsc2UsXHJcbiAgICAgIHNuYXBUb05lYXJlc3Q6IG51bGwsIC8vIHtudW1iZXJ9IGlmIHByZXNlbnQsIG9iamVjdCBub2RlIHdpbGwgc25hcCB0byB0aGUgbmVhcmVzdCBzbmFwVG9OZWFyZXN0IHZhbHVlIG9uIGRyYWdcclxuICAgICAgc3RlcFNpemU6IG51bGwsIC8vIHtudW1iZXJ9IHN0ZXAgc2l6ZSB3aGVuIG1vdmluZyB0aGUgb2JqZWN0IGtleWJvYXJkLiBCeSBkZWZhdWx0IGJhc2VkIG9uIHNuYXBUb05lYXJlc3QsIHNlZSBiZWxvdy5cclxuXHJcbiAgICAgIGFycm93Q29sb3I6ICcjNjZmJywgLy8gY29sb3Igb2YgdmVydGljYWwgbGluZVxyXG4gICAgICB5OiAyNTAsXHJcblxyXG4gICAgICBmb3JjZUFycm93SGVpZ2h0OiAxNTAsIC8vIGhlaWdodCBvZiBhcnJvdyBpbiB2aWV3IGNvb3JkaW5hdGVzXHJcblxyXG4gICAgICBvYmplY3RDb2xvcjogbnVsbCwgLy8ge3tzdHJpbmd9fSBAcmVxdWlyZWQgLSBkZXNjcmlwdGlvbiBvZiBzcGhlcmUgZm9yIHZvaWNpbmcgY29udGVudFxyXG5cclxuICAgICAgLy8gQWNjZXNzaWJsZVNsaWRlclxyXG4gICAgICB2YWx1ZVByb3BlcnR5OiBvYmplY3QucG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgZW5hYmxlZFJhbmdlUHJvcGVydHk6IG9iamVjdC5lbmFibGVkUmFuZ2VQcm9wZXJ0eSxcclxuXHJcbiAgICAgIC8vIFZvaWNpbmdcclxuICAgICAgLy8gYSBzaW5nbGUgcmV1c2FibGUgVXR0ZXJhbmNlIHRoYXQgd2lsbCBwcmV2ZW50IHRoZSB2b2ljaW5nVXR0ZXJhbmNlUXVldWUgZnJvbSBnZXR0aW5nIHNwYW1tZWQgd2l0aCB0b28gbWFueVxyXG4gICAgICAvLyBhbGVydHMgYXMgZHJhZyBvY2N1cnMuXHJcbiAgICAgIHZvaWNpbmdVdHRlcmFuY2U6IG5ldyBVdHRlcmFuY2UoIHtcclxuICAgICAgICBhbGVydFN0YWJsZURlbGF5OiA1MDBcclxuICAgICAgfSApLFxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcclxuXHJcbiAgICAgIC8vIHBkb21cclxuICAgICAgY29udGFpbmVyVGFnTmFtZTogJ2RpdicsXHJcblxyXG4gICAgICAvLyB7UHJvcGVydHlbXX0gLSBQcm9wZXJ0aWVzIHRoYXQgbmVlZCB0byBiZSBtb25pdG9yZWQgdG8gc3VjY2Vzc2Z1bGx5IHVwZGF0ZSB0aGlzIE5vZGUncyBQRE9NIGRlc2NyaXB0aW9uc1xyXG4gICAgICBhZGRpdGlvbmFsQTExeURlcGVuZGVuY2llczogW11cclxuICAgIH0sIGNvbmZpZyApO1xyXG5cclxuICAgIC8vIHNlcGFyYXRlIGNhbGwgYmVjYXVzZSBvZiB0aGUgdXNlIG9mIGEgY29uZmlnIHZhbHVlIGZyb20gdGhlIGFib3ZlIGRlZmF1bHRzXHJcbiAgICBjb25maWcgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8gb3B0aW9ucyBwYXNzZWQgdG8gSVNMQ0ZvcmNlQXJyb3dOb2RlLCBmaWxsZWQgaW4gYmVsb3dcclxuICAgICAgYXJyb3dOb2RlT3B0aW9uczoge1xyXG4gICAgICAgIGF0dHJhY3ROZWdhdGl2ZTogY29uZmlnLmF0dHJhY3ROZWdhdGl2ZSxcclxuICAgICAgICBkZWZhdWx0RGlyZWN0aW9uOiBjb25maWcuZGVmYXVsdERpcmVjdGlvbixcclxuICAgICAgICBmb3JjZUFycm93SGVpZ2h0OiBjb25maWcuZm9yY2VBcnJvd0hlaWdodCxcclxuICAgICAgICBmb3JjZVJlYWRvdXREZWNpbWFsUGxhY2VzOiBJU0xDQ29uc3RhbnRzLkRFQ0lNQUxfTk9UQVRJT05fUFJFQ0lTSU9OIC8vIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBpbiBmb3JjZSByZWFkb3V0XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBvcHRpb25zIGZvciB0aGUgUmljaFRleHQgbGFiZWwgb24gdGhlIG9iamVjdCBjaXJjbGVcclxuICAgICAgbGFiZWxPcHRpb25zOiB7XHJcbiAgICAgICAgZmlsbDogJ2JsYWNrJyxcclxuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTIgfSApLFxyXG5cclxuICAgICAgICBwaWNrYWJsZTogZmFsc2UsXHJcbiAgICAgICAgbWF4V2lkdGg6IExBQkVMX01BWF9XSURUSCxcclxuICAgICAgICBjZW50ZXJYOiBMQUJFTF9DRU5URVJfWCxcclxuXHJcbiAgICAgICAgdGFuZGVtOiBjb25maWcudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xhYmVsVGV4dCcgKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gb3B0aW9ucyBwYXNzZWQgdG8gdGhlIFB1bGxlck5vZGUsIGZpbGxlZCBpbiBiZWxvd1xyXG4gICAgICBwdWxsZXJOb2RlT3B0aW9uczoge1xyXG4gICAgICAgIGF0dHJhY3ROZWdhdGl2ZTogY29uZmlnLmF0dHJhY3ROZWdhdGl2ZVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gb3B0aW9ucyBmb3IgQWNjZXNzaWJsZVNsaWRlclxyXG4gICAgICBrZXlib2FyZFN0ZXA6IGNvbmZpZy5zdGVwU2l6ZSxcclxuICAgICAgc2hpZnRLZXlib2FyZFN0ZXA6IGNvbmZpZy5zbmFwVG9OZWFyZXN0LFxyXG4gICAgICBwYWdlS2V5Ym9hcmRTdGVwOiBjb25maWcuc3RlcFNpemUgKiAyLFxyXG4gICAgICBhMTF5TWFwUERPTVZhbHVlOiB2YWx1ZSA9PiBVdGlscy50b0ZpeGVkTnVtYmVyKCB2YWx1ZSwgMSApLFxyXG4gICAgICBjb25zdHJhaW5WYWx1ZTogdmFsdWUgPT4ge1xyXG4gICAgICAgIGNvbnN0IG51bWJlck9mRGVjaW1hbFBsYWNlcyA9IFV0aWxzLm51bWJlck9mRGVjaW1hbFBsYWNlcyggY29uZmlnLnNuYXBUb05lYXJlc3QgKTtcclxuICAgICAgICByZXR1cm4gVXRpbHMudG9GaXhlZE51bWJlciggdmFsdWUsIG51bWJlck9mRGVjaW1hbFBsYWNlcyApO1xyXG4gICAgICB9LFxyXG4gICAgICBzdGFydERyYWc6ICgpID0+IHtcclxuICAgICAgICBvYmplY3QuaXNEcmFnZ2luZ1Byb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICAgICAgICBvbGRQb3NpdGlvbiA9IG9iamVjdC5wb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG4gICAgICB9LFxyXG4gICAgICBlbmREcmFnOiAoKSA9PiB7XHJcbiAgICAgICAgb2JqZWN0LmlzRHJhZ2dpbmdQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucmVkcmF3Rm9yY2UoKTtcclxuXHJcbiAgICAgICAgLy8gdm9pY2luZ1xyXG4gICAgICAgIHRoaXMudm9pY2luZ1NwZWFrRHJhZ1Jlc3BvbnNlKCBvYmplY3QsIG9iamVjdC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLCBvbGRQb3NpdGlvbiApO1xyXG4gICAgICB9LFxyXG4gICAgICBhMTF5Q3JlYXRlQ29udGV4dFJlc3BvbnNlQWxlcnQ6ICgpID0+IHtcclxuICAgICAgICBjb25zdCBuZXdQb3NpdGlvbiA9IG9iamVjdC5wb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uQ2hhbmdlZCA9IG5ld1Bvc2l0aW9uICE9PSBvbGRQb3NpdGlvbjtcclxuICAgICAgICByZXR1cm4gcG9zaXRpb25DaGFuZ2VkID8gZm9yY2VEZXNjcmliZXIuZ2V0VmVjdG9yQ2hhbmdlVGV4dCggb2JqZWN0LCBmYWxzZSApIDogZm9yY2VEZXNjcmliZXIuZ2V0UG9zaXRpb25VbmNoYW5nZWRBbGVydFRleHQoIG9iamVjdCApO1xyXG4gICAgICB9LFxyXG4gICAgICBhMTF5Q3JlYXRlQXJpYVZhbHVlVGV4dDogcG9zaXRpb25EZXNjcmliZXIuZ2V0UG9zaXRpb25BcmlhVmFsdWVUZXh0Q3JlYXRvciggd2hpY2hPYmplY3QgKSxcclxuXHJcbiAgICAgIC8vIFRoaXMgb2JqZWN0J3MgUERPTSBkZXNjcmlwdGlvbiBhbHNvIGRlcGVuZHMgb24gdGhlIHBvc2l0aW9uIG9mIHRoZSBvdGhlciBvYmplY3QsIHNvIGluY2x1ZGUgaXQgaGVyZS5cclxuICAgICAgYTExeURlcGVuZGVuY2llczogY29uZmlnLmFkZGl0aW9uYWxBMTF5RGVwZW5kZW5jaWVzLmNvbmNhdCggb2JqZWN0ID09PSBtb2RlbC5vYmplY3QxID9cclxuICAgICAgICBbIG1vZGVsLm9iamVjdDIucG9zaXRpb25Qcm9wZXJ0eSBdIDogWyBtb2RlbC5vYmplY3QxLnBvc2l0aW9uUHJvcGVydHkgXSApXHJcbiAgICB9LCBjb25maWcgKTtcclxuXHJcbiAgICBjb25maWcgPSBtZXJnZSgge30sIGNvbmZpZyApO1xyXG5cclxuICAgIC8vIHVzZSBzbmFwVG9OZWFyZXN0IGlmIHN0ZXBTaXplIGlzIG5vdCBwcm92aWRlZFxyXG4gICAgaWYgKCBjb25maWcuc3RlcFNpemUgPT09IG51bGwgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbmZpZy5zbmFwVG9OZWFyZXN0LCAnc25hcFRvTmVhcmVzdCBpcyByZXF1aXJlZCBpZiBzdGVwU2l6ZSBpcyBub3QgcHJvdmlkZWQuJyApO1xyXG4gICAgICBjb25maWcuc3RlcFNpemUgPSBjb25maWcuc25hcFRvTmVhcmVzdCAqIDI7XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29uZmlnLmxhYmVsLCAncmVxdWlyZWQgcGFyYW0nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb25maWcub3RoZXJPYmplY3RMYWJlbCwgJ3JlcXVpcmVkIHBhcmFtJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYWxlcnRNYW5hZ2VyIGluc3RhbmNlb2YgSVNMQ0FsZXJ0TWFuYWdlciApO1xyXG5cclxuXHJcbiAgICBzdXBlciggY29uZmlnICk7XHJcblxyXG4gICAgdGhpcy5hY2Nlc3NpYmxlTmFtZSA9IFBvc2l0aW9uRGVzY3JpYmVyLmdldE9iamVjdExhYmVsUG9zaXRpb25UZXh0KCBjb25maWcubGFiZWwgKTtcclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkXHJcbiAgICB0aGlzLmxheW91dEJvdW5kcyA9IGxheW91dEJvdW5kcztcclxuICAgIHRoaXMub2JqZWN0TW9kZWwgPSBvYmplY3Q7XHJcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7IC8vIHVzZWQgaW4gYWJzdHJhY3QgbWV0aG9kIGltcGxlbWVudGF0aW9ucyBieSBjaGlsZHJlbi5cclxuICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtID0gbW9kZWxWaWV3VHJhbnNmb3JtO1xyXG4gICAgdGhpcy5vYmplY3RMYWJlbCA9IGNvbmZpZy5sYWJlbDtcclxuICAgIHRoaXMub3RoZXJPYmplY3RMYWJlbCA9IGNvbmZpZy5vdGhlck9iamVjdExhYmVsO1xyXG4gICAgdGhpcy5wb3NpdGlvbkRlc2NyaWJlciA9IHBvc2l0aW9uRGVzY3JpYmVyO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmZvcmNlRGVzY3JpYmVyID0gZm9yY2VEZXNjcmliZXI7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIHdoaWNoIG9iamVjdCB0aGlzIGluc3RhbmNlIGlzIChvbmUgb3IgdHdvKVxyXG4gICAgdGhpcy5lbnVtID0gd2hpY2hPYmplY3Q7XHJcblxyXG4gICAgLy8gdGhlIGZ1bGwgcmFuZ2Ugb2YgZm9yY2UgZm9yIHRoZSBhcnJvdyBub2RlIChub3RlOiB0aGlzIGlzIGRpc3RpbmN0KVxyXG4gICAgY29uc3QgYXJyb3dGb3JjZVJhbmdlID0gbmV3IFJhbmdlKCBtb2RlbC5nZXRNaW5Gb3JjZU1hZ25pdHVkZSgpLCBtb2RlbC5nZXRNYXhGb3JjZSgpICk7XHJcblxyXG4gICAgLy8gQHByb3RlY3RlZCwgKEBwdWJsaWMgZm9yIHBkb21PcmRlcikgLSBhcnJvdyBub2RlXHJcbiAgICB0aGlzLmFycm93Tm9kZSA9IG5ldyBJU0xDRm9yY2VBcnJvd05vZGUoXHJcbiAgICAgIGFycm93Rm9yY2VSYW5nZSxcclxuICAgICAgbGF5b3V0Qm91bmRzLFxyXG4gICAgICBjb25maWcubGFiZWwsXHJcbiAgICAgIGNvbmZpZy5vdGhlck9iamVjdExhYmVsLFxyXG4gICAgICBjb25maWcudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZvcmNlRGlzcGxheU5vZGUnICksXHJcbiAgICAgIGNvbmZpZy5hcnJvd05vZGVPcHRpb25zXHJcbiAgICApO1xyXG5cclxuICAgIC8vIHNldCB5IHBvc2l0aW9uIGZvciB0aGUgYXJyb3dcclxuICAgIHRoaXMuYXJyb3dOb2RlLnkgPSBjb25maWcueSAtIGNvbmZpZy5mb3JjZUFycm93SGVpZ2h0O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gdGhlIHB1bGxlciBub2RlXHJcbiAgICB0aGlzLnB1bGxlck5vZGUgPSBuZXcgSVNMQ1B1bGxlck5vZGUoXHJcbiAgICAgIG5ldyBSYW5nZSggbW9kZWwuZ2V0TWluRm9yY2UoKSwgbW9kZWwuZ2V0TWF4Rm9yY2UoKSApLFxyXG4gICAgICBjb25maWcucHVsbGVyTm9kZU9wdGlvbnNcclxuICAgICk7XHJcblxyXG4gICAgaWYgKCBjb25maWcuZGVmYXVsdERpcmVjdGlvbiA9PT0gRGVmYXVsdERpcmVjdGlvbi5SSUdIVCApIHtcclxuICAgICAgdGhpcy5wdWxsZXJOb2RlLnNjYWxlKCAtMSwgMSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWQgLSBhIHBhcmVudCBub2RlIHRoYXQgYXBwbGllcyB0aGUgZHJhZyBoYW5kbGVyXHJcbiAgICB0aGlzLmRyYWdOb2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB0aGUgJ29iamVjdCcgLSBhIHNoYWRlZCBjaXJjbGVcclxuICAgIGNvbnN0IHJhZGl1cyA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWCggb2JqZWN0LnJhZGl1c1Byb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgLy8gQHByb3RlY3RlZCAtIHRoZSBvYmplY3RcclxuICAgIHRoaXMub2JqZWN0Q2lyY2xlID0gbmV3IENpcmNsZSggcmFkaXVzICk7XHJcblxyXG4gICAgdGhpcy5kcmFnTm9kZS5hZGRDaGlsZCggdGhpcy5wdWxsZXJOb2RlICk7XHJcbiAgICB0aGlzLmRyYWdOb2RlLmFkZENoaWxkKCB0aGlzLm9iamVjdENpcmNsZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBmb3IgcnVsZXIgcmVnaW9uc1xyXG4gICAgLy8gU21hbGwgYmxhY2sgZG90IHdoZXJlIHZlcnRpY2FsIGFycm93IGxpbmUgY29ubmVjdHMgdG8gdGhlIG9iamVjdFxyXG4gICAgdGhpcy5jZW50ZXJQb2ludCA9IG5ldyBDaXJjbGUoIDIsIHsgZmlsbDogJyMwMDAnIH0gKTtcclxuICAgIHRoaXMuZHJhZ05vZGUuYWRkQ2hpbGQoIHRoaXMuY2VudGVyUG9pbnQgKTtcclxuXHJcbiAgICB0aGlzLmxhYmVsVGV4dCA9IG5ldyBSaWNoVGV4dCggY29uZmlnLmxhYmVsLCBjb25maWcubGFiZWxPcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5kcmFnTm9kZS5hZGRDaGlsZCggdGhpcy5sYWJlbFRleHQgKTtcclxuICAgIHRoaXMubGFiZWxUZXh0LmJvdW5kc1Byb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMubGFiZWxUZXh0LmNlbnRlclggPSB0aGlzLm9iamVjdENpcmNsZS5jZW50ZXJYO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuZHJhZ05vZGUgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy55ID0gY29uZmlnLnk7IC8vIFRPRE86IGlzIHRoaXMgbmVlZGVkP1xyXG5cclxuICAgIC8vIEFkZGVkIGZvciBQaEVULWlPIGFzIGEgd2F5IHRvIGhpZGUgdGhlIGRhc2hlZCBsaW5lcy5cclxuICAgIGNvbnN0IGNlbnRlck9mTWFzc0xpbmVOb2RlID0gbmV3IE5vZGUoIHsgdGFuZGVtOiBjb25maWcudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NlbnRlck9mTWFzc0xpbmVOb2RlJyApIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGNlbnRlck9mTWFzc0xpbmVOb2RlICk7XHJcblxyXG4gICAgLy8gVGhlIG1hcmtlciBsaW5lLCBjb25uZWN0aW5nIHRoZSBhcnJvdyB0byB0aGUgb2JqZWN0LiBUaGUgZmlyc3Qgb25lIGlzIGZvciB0aGUgc2hhZG93IHNvIHRoYXRcclxuICAgIC8vIGl0IGlzIHZpc2libGUgb24gdG9wIG9mIHRoZSBvYmplY3RcclxuICAgIGNvbnN0IG1hcmtlckxpbmVTaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG4gICAgbWFya2VyTGluZVNoYXBlLm1vdmVUbyggMCwgLTQgKTtcclxuICAgIG1hcmtlckxpbmVTaGFwZS5saW5lVG8oIDAsIC1jb25maWcuZm9yY2VBcnJvd0hlaWdodCApO1xyXG4gICAgY2VudGVyT2ZNYXNzTGluZU5vZGUuYWRkQ2hpbGQoIG5ldyBQYXRoKCBtYXJrZXJMaW5lU2hhcGUsIHtcclxuICAgICAgc3Ryb2tlOiAnI0ZGRicsXHJcbiAgICAgIGxpbmVEYXNoOiBbIDQsIDQgXSxcclxuICAgICAgbGluZVdpZHRoOiAyLFxyXG4gICAgICB4OiAwLjUsXHJcbiAgICAgIHk6IDAuNVxyXG4gICAgfSApICk7XHJcbiAgICBjb25zdCBtYXJrZXJMaW5lU2hhcGVUb3AgPSBuZXcgUGF0aCggbWFya2VyTGluZVNoYXBlLCB7XHJcbiAgICAgIHN0cm9rZTogY29uZmlnLmFycm93Q29sb3IsXHJcbiAgICAgIGxpbmVEYXNoOiBbIDQsIDQgXSxcclxuICAgICAgbGluZVdpZHRoOiAyXHJcbiAgICB9ICk7XHJcbiAgICBjZW50ZXJPZk1hc3NMaW5lTm9kZS5hZGRDaGlsZCggbWFya2VyTGluZVNoYXBlVG9wICk7XHJcblxyXG4gICAgbGV0IGNsaWNrT2Zmc2V0O1xyXG5cclxuICAgIGxldCBvbGRQb3NpdGlvbiA9IG9iamVjdC5wb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIHRoaXMuZHJhZ0xpc3RlbmVyID0gbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICBhbGxvd1RvdWNoU25hZzogdHJ1ZSxcclxuICAgICAgc3RhcnQ6IGV2ZW50ID0+IHtcclxuICAgICAgICBjbGlja09mZnNldCA9IHRoaXMuZHJhZ05vZGUuZ2xvYmFsVG9QYXJlbnRQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApLnggLSB0aGlzLmRyYWdOb2RlLng7XHJcbiAgICAgICAgb2JqZWN0LmlzRHJhZ2dpbmdQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIG9sZFBvc2l0aW9uID0gb2JqZWN0LnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgICAgIC8vIHZvaWNpbmcgLSBvbiBkcmFnIHN0YXJ0LCBqdXN0IHNwZWFrIHRoZSBuYW1lIGFuZCBvYmplY3QgcmVzcG9uc2Ugc2luY2Ugd2UgaGF2ZW4ndCBtb3ZlZCB5ZXRcclxuICAgICAgICB0aGlzLnZvaWNpbmdTcGVha1Jlc3BvbnNlKCB7XHJcbiAgICAgICAgICBuYW1lUmVzcG9uc2U6IHRoaXMudm9pY2luZ05hbWVSZXNwb25zZSxcclxuICAgICAgICAgIG9iamVjdFJlc3BvbnNlOiB0aGlzLnZvaWNpbmdPYmplY3RSZXNwb25zZVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfSxcclxuICAgICAgZHJhZzogZXZlbnQgPT4ge1xyXG5cclxuICAgICAgICAvLyBkcmFnIHBvc2l0aW9uIHJlbGF0aXZlIHRvIHRoZSBwb2ludGVyIHBvaW50ZXIgc3RhcnQgcG9zaXRpb24gYW5kIGNvbnZlcnQgdG8gbW9kZWwgY29vcmRpbmF0ZXNcclxuICAgICAgICBsZXQgeCA9IG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbFgoIHRoaXMuZ2xvYmFsVG9QYXJlbnRQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApLnggLSBjbGlja09mZnNldCApO1xyXG5cclxuICAgICAgICAvLyBhYnNvbHV0ZSBkcmFnIGJvdW5kcyBiYXNlZCBvbiBtb2RlbFxyXG4gICAgICAgIC8vIHNlZSBtZXRob2QgZGVzY3JpcHRpb25zIGZvciBkZXRhaWxzXHJcbiAgICAgICAgY29uc3QgeE1heCA9IG1vZGVsLmdldE9iamVjdE1heFBvc2l0aW9uKCBvYmplY3QgKTtcclxuICAgICAgICBjb25zdCB4TWluID0gbW9kZWwuZ2V0T2JqZWN0TWluUG9zaXRpb24oIG9iamVjdCApO1xyXG5cclxuICAgICAgICAvLyBhcHBseSBsaW1pdGF0aW9ucyBhbmQgdXBkYXRlIHBvc2l0aW9uXHJcbiAgICAgICAgeCA9IE1hdGgubWF4KCBNYXRoLm1pbiggeCwgeE1heCApLCB4TWluICk7IC8vIGxpbWl0ZWQgdmFsdWUgb2YgeCAoYnkgYm91bmRhcnkpIGluIG1vZGVsIGNvb3JkaW5hdGVzXHJcblxyXG4gICAgICAgIC8vIHNuYXBUb0dyaWQgbWV0aG9kIGR5bmFtaWNhbGx5IGNoZWNrcyB3aGV0aGVyIHRvIHNuYXAgb3Igbm90XHJcbiAgICAgICAgb2JqZWN0LnBvc2l0aW9uUHJvcGVydHkuc2V0KCBtb2RlbC5zbmFwVG9HcmlkKCB4ICkgKTtcclxuXHJcbiAgICAgICAgLy8gdm9pY2luZ1xyXG4gICAgICAgIHRoaXMudm9pY2luZ1NwZWFrRHJhZ1Jlc3BvbnNlKCBvYmplY3QsIG9iamVjdC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLCBvbGRQb3NpdGlvbiwge1xyXG5cclxuICAgICAgICAgIC8vIGZvciBtb3VzZS90b3VjaCBpbnB1dCB3ZSB3YW50IHRvIGluY2x1ZGUgdGhlIHByb2dyZXNzIGNsYXVzZSBldmVyeSBzaW5nbGUgbW92ZVxyXG4gICAgICAgICAgYWx3YXlzSW5jbHVkZVByb2dyZXNzQ2xhdXNlOiB0cnVlXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9LFxyXG4gICAgICBlbmQ6ICgpID0+IHtcclxuICAgICAgICBvYmplY3QuaXNEcmFnZ2luZ1Byb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogY29uZmlnLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkcmFnTGlzdGVuZXInIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuZHJhZ05vZGUuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5kcmFnTGlzdGVuZXIgKTtcclxuXHJcbiAgICBjb25zdCBib3VuZFJlZHJhd0ZvcmNlID0gdGhpcy5yZWRyYXdGb3JjZS5iaW5kKCB0aGlzICk7XHJcbiAgICBtb2RlbC5zaG93Rm9yY2VWYWx1ZXNQcm9wZXJ0eS5sYXp5TGluayggYm91bmRSZWRyYXdGb3JjZSApO1xyXG4gICAgb2JqZWN0LnJhZGl1c1Byb3BlcnR5LmxhenlMaW5rKCBib3VuZFJlZHJhd0ZvcmNlICk7XHJcbiAgICBvYmplY3QudmFsdWVQcm9wZXJ0eS5sYXp5TGluayggYm91bmRSZWRyYXdGb3JjZSApO1xyXG4gICAgbW9kZWwuZm9yY2VQcm9wZXJ0eS5sYXp5TGluayggYm91bmRSZWRyYXdGb3JjZSApO1xyXG5cclxuICAgIG9iamVjdC5iYXNlQ29sb3JQcm9wZXJ0eS5saW5rKCBiYXNlQ29sb3IgPT4ge1xyXG4gICAgICB0aGlzLnVwZGF0ZUdyYWRpZW50KCBiYXNlQ29sb3IgKTtcclxuICAgICAgaWYgKCBjb25maWcuYXR0cmFjdE5lZ2F0aXZlICkge1xyXG4gICAgICAgIG1hcmtlckxpbmVTaGFwZVRvcC5zdHJva2UgPSBnZXRVcGRhdGVkRmlsbCggb2JqZWN0LnZhbHVlUHJvcGVydHkuZ2V0KCkgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIG9uIHJlc2V0LCBubyBvYmplY3RzIGFyZSBkZXN0cm95ZWQgYW5kIHByb3BlcnRpZXMgYXJlIHNldCB0byBpbml0aWFsIHZhbHVlc1xyXG4gICAgLy8gbm8gbmVlZCB0byBkaXNwb3NlIG9mIGFueSBvZiB0aGUgYmVsb3cgbGlzdGVuZXJzXHJcbiAgICBvYmplY3QucG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBwcm9wZXJ0eSA9PiB7XHJcblxyXG4gICAgICAvLyBwb3NpdGlvbiB0aGlzIG5vZGUgYW5kIGl0cyBmb3JjZSBhcnJvdyB3aXRoIGxhYmVsXHJcbiAgICAgIGNvbnN0IHRyYW5zZm9ybWVkVmFsdWUgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBwcm9wZXJ0eSApO1xyXG4gICAgICB0aGlzLnggPSB0cmFuc2Zvcm1lZFZhbHVlO1xyXG4gICAgICB0aGlzLmFycm93Tm9kZS54ID0gdHJhbnNmb3JtZWRWYWx1ZTtcclxuICAgICAgdGhpcy5yZWRyYXdGb3JjZSgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCB7XHJcbiAgICAgIHZvaWNpbmdOYW1lUmVzcG9uc2U6IHRoaXMuYWNjZXNzaWJsZU5hbWUsXHJcblxyXG4gICAgICAvLyBmb3IgdGhlIG9iamVjdHMsIGl0IHdhcyByZXF1ZXN0ZWQgdGhhdCBcIk9iamVjdFwiIHJlc3BvbnNlIGNvbWUgYmVmb3JlIFwibmFtZVwiIHJlc3BvbnNlcyBmb3IgYWxsXHJcbiAgICAgIC8vIGZvcm1zIG9mIGlucHV0XHJcbiAgICAgIHZvaWNpbmdSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uOiBuZXcgUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbigge1xyXG4gICAgICAgIG5hbWVPYmplY3RIaW50OiAne3tPQkpFQ1R9fSwge3tOQU1FfX0sIHt7SElOVH19JyxcclxuICAgICAgICBuYW1lT2JqZWN0OiAne3tPQkpFQ1R9fSwge3tOQU1FfX0nXHJcbiAgICAgIH0gKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGZvciBsYXllcmluZyBwdXJwb3Nlcywgd2UgYXNzdW1lIHRoYXQgdGhlIFNjcmVlblZpZXcgd2lsbCBhZGQgdGhlIGFycm93IG5vZGUgYW5kIGxhYmVsIC0gYnkgdGhlXHJcbiAgICAvLyB0aW1lIHRoZSBzaW0gaXMgc3RlcHBlZCwgbWFrZSBzdXJlIHRoYXQgdGhlIGFycm93cyBhcmUgYWRkZWQgdG8gdGhlIHZpZXdcclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICBjb25zdCBjaGVja0ZvckFycm93QWRkZWQgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCB0aGlzLmFycm93Tm9kZS5wYXJlbnRzLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ0Fycm93Tm9kZSBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIHZpZXcgaW4gaW52ZXJzZS1zcXVhcmUtbGF3LWNvbW1vbiBzaW0gc2NyZWVuIHZpZXcnICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBubyBuZWVkIHRvIGtlZXAgY2hlY2tpbmdcclxuICAgICAgICBtb2RlbC5zdGVwRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggY2hlY2tGb3JBcnJvd0FkZGVkICk7XHJcbiAgICAgIH07XHJcbiAgICAgIG1vZGVsLnN0ZXBFbWl0dGVyLmFkZExpc3RlbmVyKCBjaGVja0ZvckFycm93QWRkZWQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBSZWRyYXdzIHRoZSB3aGl0ZSByYWRpYWwgZ3JhZGllbnQgZm9yIHRoZSBvYmplY3QgLSBtdXN0IGJlIGltcGxlbWVudGVkIGluIHN1YnR5cGVzLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBhYnN0cmFjdFxyXG4gICAqL1xyXG4gIHVwZGF0ZUdyYWRpZW50KCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnVXBkYXRlIGdyYWRpZW50IG11c3QgYmUgaW1wbGVtZW50ZWQgaW4gc3VidHlwZXMuJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB3aGV0aGVyIG9yIG5vdCB0aGUgcmVhZG91dHMgYWJvdmUgdGhlIGFycm93cyB1c2Ugc2NpZW50aWZpYyBub3RhdGlvbiBpbiB0aGVpciBkaXNwbGF5IG9mIHRoZSB2YWx1ZS5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHVzZVNjaWVudGlmaWNOb3RhdGlvblxyXG4gICAqL1xyXG4gIHNldFJlYWRvdXRzSW5TY2llbnRpZmljTm90YXRpb24oIHVzZVNjaWVudGlmaWNOb3RhdGlvbiApIHtcclxuICAgIHRoaXMuYXJyb3dOb2RlLnNjaWVudGlmaWNOb3RhdGlvbk1vZGUgPSB1c2VTY2llbnRpZmljTm90YXRpb247XHJcblxyXG4gICAgLy8gcmVkcmF3IHRoZSBmb3JjZSBhZnRlciB1cGRhdGluZ1xyXG4gICAgdGhpcy5yZWRyYXdGb3JjZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgcmFkaXVzLCBhcnJvdyBsZW5ndGggJiBkaXJlY3Rpb24sIGZvcmNlIHJlYWRvdXQsIGFuZCB0aGUgdmlzaWJsZSBwdWxsZXIgaW1hZ2UuXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVkcmF3Rm9yY2UoKSB7XHJcbiAgICB0aGlzLm9iamVjdENpcmNsZS5zZXRSYWRpdXMoIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCB0aGlzLm9iamVjdE1vZGVsLnJhZGl1c1Byb3BlcnR5LmdldCgpICkgKTtcclxuICAgIHRoaXMudXBkYXRlR3JhZGllbnQoIHRoaXMub2JqZWN0TW9kZWwuYmFzZUNvbG9yUHJvcGVydHkuZ2V0KCkgKTtcclxuXHJcbiAgICAvLyBzZXQgdGhlIGxhYmVsVGV4dCB0byBiZSByaWdodCBiZWxvdyB0aGUgY2lyY2xlXHJcbiAgICB0aGlzLmxhYmVsVGV4dC50b3AgPSB0aGlzLm9iamVjdENpcmNsZS5ib3R0b20gKyArMTtcclxuXHJcbiAgICAvLyBzZXQgdGhlIHNjYWxlIG9mIHRoZSBhcnJvdyBiYXNlZCBvbiB0aGUgbW9kZWwgdmFsdWVcclxuICAgIHRoaXMuYXJyb3dOb2RlLnJlZHJhd0Fycm93KCB0aGlzLm1vZGVsLmZvcmNlUHJvcGVydHkuZ2V0KCkgKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIGFycm93IGxhYmVsIC0gYWx3YXlzIGRpc3BsYXkgdGhlIGZvcmNlIGFzIGEgcG9zaXRpdmUgbWFnbml0dWRlXHJcbiAgICB0aGlzLmFycm93Tm9kZS51cGRhdGVMYWJlbCggTWF0aC5hYnMoIHRoaXMubW9kZWwuZm9yY2VQcm9wZXJ0eS5nZXQoKSApLCB0aGlzLm1vZGVsLnNob3dGb3JjZVZhbHVlc1Byb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgLy8gc2V0IHRoZSB0ZXh0IHBvc2l0aW9uLCBwb3NpdGlvbmluZyB0aGUgY2VudGVyIHJlbGF0aXZlIHRvIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZVxyXG4gICAgdGhpcy5hcnJvd05vZGUuc2V0QXJyb3dUZXh0UG9zaXRpb24oIHRoaXMucGFyZW50VG9Mb2NhbEJvdW5kcyggdGhpcy5sYXlvdXRCb3VuZHMgKSApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSBwdWxsZXIgbm9kZSB2aXNpYmlsaXR5XHJcbiAgICB0aGlzLnB1bGxlck5vZGUuc2V0UHVsbCggdGhpcy5tb2RlbC5mb3JjZVByb3BlcnR5LmdldCgpLCB0aGlzLm9iamVjdENpcmNsZS53aWR0aCAvIDIgKTtcclxuXHJcbiAgICAvLyB2b2ljaW5nIC0gdXBkYXRlIHRoZSBSZWFkaW5nQmxvY2sgY29udGVudCBmb3IgdGhlIGFycm93XHJcbiAgICB0aGlzLmFycm93Tm9kZS5yZWFkaW5nQmxvY2tOYW1lUmVzcG9uc2UgPSB0aGlzLmZvcmNlRGVzY3JpYmVyLmdldEZvcmNlVmVjdG9yc1JlYWRpbmdCbG9ja05hbWVSZXNwb25zZSggdGhpcy5vYmplY3RMYWJlbCwgdGhpcy5vdGhlck9iamVjdExhYmVsICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTcGVha3MgYSByZXNwb25zZSAoVGhyb3VnaCB0aGUgVm9pY2luZyB0cmFpdCkgdGhhdCBkZXNjcmliZXMgdGhlIGRyYWcuIENvbnRlbnQgd2lsbCBvbmx5IGJlIHNwb2tlblxyXG4gICAqIGlmIHRoZXJlIGhhcyBiZWVuIHNvbWUgbW92ZW1lbnQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7SVNMQ09iamVjdH0gb2JqZWN0XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5ld1Bvc2l0aW9uIC0gbmV3IHBvc2l0aW9uIG9mIHRoZSBvYmplY3QgZHVyaW5nIGRyYWdcclxuICAgKiBAcGFyYW0ge251bWJlcn0gb2xkUG9zaXRpb24gLSBwb3NpdGlvbiBvZiB0aGUgb2JqZWN0IHdoZW4gZHJhZyBzdGFydGVkXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIHZvaWNpbmdTcGVha0RyYWdSZXNwb25zZSggb2JqZWN0LCBuZXdQb3NpdGlvbiwgb2xkUG9zaXRpb24sIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gd2hldGhlciBvciBub3QgdG8gaW5jbHVkZSB0aGUgXCJwcm9ncmVzc1wiIGNsYXVzZSB0aGF0IGRlc2NyaWJlcyB3aGV0aGVyIHRoZSBzcGhlcmUgaXMgY2xvc2VyL2ZhcnRoZXJcclxuICAgICAgLy8gYXdheSBmcm9tIHRoZSBvdGhlciBtYXNzIGFmdGVyIGRyYWdnaW5nXHJcbiAgICAgIGFsd2F5c0luY2x1ZGVQcm9ncmVzc0NsYXVzZTogZmFsc2VcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBpZiAoIG5ld1Bvc2l0aW9uICE9PSBvbGRQb3NpdGlvbiApIHtcclxuICAgICAgY29uc3QgY29udGV4dFJlc3BvbnNlID0gdGhpcy5mb3JjZURlc2NyaWJlci5nZXRWZWN0b3JDaGFuZ2VUZXh0KCBvYmplY3QsIG9wdGlvbnMuYWx3YXlzSW5jbHVkZVByb2dyZXNzQ2xhdXNlICk7XHJcblxyXG4gICAgICAvLyBzcGVhayB0aGUgb2JqZWN0IHJlc3BvbnNlIGFuZCBjb250ZXh0IHJlc3BvbnNlLCBidXQgZG9uJ3QgaW5jbHVkZSB0aGUgbmFtZSByZXNwb25zZSwgaXQgZG9lc24ndCBuZWVkIHRvIGJlXHJcbiAgICAgIC8vIHJlcGVhdGVkIGV2ZXJ5IG1vdmVcclxuICAgICAgdGhpcy52b2ljaW5nU3BlYWtSZXNwb25zZSgge1xyXG4gICAgICAgIG9iamVjdFJlc3BvbnNlOiB0aGlzLnZvaWNpbmdPYmplY3RSZXNwb25zZSxcclxuICAgICAgICBjb250ZXh0UmVzcG9uc2U6IGNvbnRleHRSZXNwb25zZVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogSGVscGVyIGZ1bmN0aW9uIHRvIGdldCBhIGNvbG9yIGJhc2VkIHRoZSBmb3JjZSB2YWx1ZVxyXG4gKlxyXG4gKiBAcGFyYW0ge251bWJlcn0gZm9yY2VWYWx1ZVxyXG4gKiBAcmV0dXJucyB7Q29sb3J9XHJcbiAqL1xyXG5jb25zdCBnZXRVcGRhdGVkRmlsbCA9IGZvcmNlVmFsdWUgPT4ge1xyXG5cclxuICBsZXQgZmlsbDtcclxuICBpZiAoIGZvcmNlVmFsdWUgPCAwICkge1xyXG4gICAgZmlsbCA9IE5FR0FUSVZFX0ZJTEw7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKCBmb3JjZVZhbHVlID4gMCApIHtcclxuICAgIGZpbGwgPSBQT1NJVElWRV9GSUxMO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIGZpbGwgPSBaRVJPX0ZJTEw7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZmlsbDtcclxufTtcclxuXHJcbmludmVyc2VTcXVhcmVMYXdDb21tb24ucmVnaXN0ZXIoICdJU0xDT2JqZWN0Tm9kZScsIElTTENPYmplY3ROb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBJU0xDT2JqZWN0Tm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSwwQkFBMEI7QUFDNUMsT0FBT0MsS0FBSyxNQUFNLDBCQUEw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