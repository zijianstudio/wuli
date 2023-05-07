// Copyright 2013-2023, University of Colorado Boulder

/**
 * Scenery-based combo box. Composed of a button and a popup 'list box' of items. ComboBox has no interaction of its
 * own, all interaction is handled by its subcomponents. The list box is displayed when the button is pressed, and
 * dismissed when an item is selected, the user clicks on the button, or the user clicks outside the list. The list
 * can be displayed either above or below the button.
 *
 * The supporting types and classes are:
 *
 * ComboBoxItem - items provided to ComboBox constructor
 * ComboBoxButton - the button
 * ComboBoxListBox - the list box
 * ComboBoxListItemNode - an item in the list box
 *
 * For info on ComboBox UI design, including a11y, see https://github.com/phetsims/sun/blob/master/doc/ComboBox.md
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import dotRandom from '../../dot/js/dotRandom.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import { extendsWidthSizable, FocusManager, isWidthSizable, MatrixBetweenProperty, Node, PDOMPeer, WidthSizable } from '../../scenery/js/imports.js';
import generalCloseSoundPlayer from '../../tambo/js/shared-sound-players/generalCloseSoundPlayer.js';
import generalOpenSoundPlayer from '../../tambo/js/shared-sound-players/generalOpenSoundPlayer.js';
import EventType from '../../tandem/js/EventType.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import ComboBoxButton from './ComboBoxButton.js';
import ComboBoxListBox from './ComboBoxListBox.js';
import sun from './sun.js';
import SunConstants from './SunConstants.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import { getGroupItemNodes } from './GroupItemOptions.js';
import Multilink from '../../axon/js/Multilink.js';
// const
const LIST_POSITION_VALUES = ['above', 'below']; // where the list pops up relative to the button
const ALIGN_VALUES = ['left', 'right', 'center']; // alignment of item on button and in list

// Most usages of the items should not be able to create the Node, but rather should use the corresponding `nodes` array.

// The definition for how ComboBox sets its accessibleName and helpText in the PDOM. Forward it onto its button. See
// ComboBox.md for further style guide and documentation on the pattern.
const ACCESSIBLE_NAME_BEHAVIOR = (node, options, accessibleName, otherNodeCallbacks) => {
  otherNodeCallbacks.push(() => {
    node.button.accessibleName = accessibleName;
  });
  return options;
};
const HELP_TEXT_BEHAVIOR = (node, options, helpText, otherNodeCallbacks) => {
  otherNodeCallbacks.push(() => {
    node.button.helpText = helpText;
  });
  return options;
};
export default class ComboBox extends WidthSizable(Node) {
  // List of nodes created from ComboBoxItems to be displayed with their corresponding value. See ComboBoxItem.createNode().

  // button that shows the current selection (internal)

  // the popup list box

  // the display that clickToDismissListener is added to, because the scene may change, see sun#14

  // Clicking anywhere other than the button or list box will hide the list box.

  // (PDOM) when focus leaves the ComboBoxListBox, it should be closed. This could happen from keyboard
  // or from other screen reader controls (like VoiceOver gestures)
  // For use via PhET-iO, see https://github.com/phetsims/sun/issues/451
  // This is not generally controlled by the user, so it is not reset when the Reset All button is pressed.
  static ITEM_TANDEM_NAME_SUFFIX = 'Item';

  /**
   * @param property - must be settable and linkable, but needs to support Property, DerivedProperty and DynamicProperty
   * @param items - items, in the order that they appear in the listbox
   * @param listParent node that will be used as the list's parent, use this to ensure that the list is in front of everything else
   * @param [providedOptions?]
   */
  constructor(property, items, listParent, providedOptions) {
    assert && assert(_.uniqBy(items, item => item.value).length === items.length, 'items must have unique values');
    assert && items.forEach(item => {
      assert && assert(!item.tandemName || item.tandemName.endsWith(ComboBox.ITEM_TANDEM_NAME_SUFFIX), `ComboBoxItem tandemName must end with '${ComboBox.ITEM_TANDEM_NAME_SUFFIX}': ${item.tandemName}`);
    });

    // See https://github.com/phetsims/sun/issues/542
    assert && assert(listParent.maxWidth === null, 'ComboBox is responsible for scaling listBox. Setting maxWidth for listParent may result in buggy behavior.');
    const options = optionize()({
      align: 'left',
      listPosition: 'below',
      labelXSpacing: 10,
      disabledOpacity: 0.5,
      cornerRadius: 4,
      highlightFill: 'rgb( 245, 245, 245 )',
      xMargin: 12,
      yMargin: 8,
      // button
      buttonFill: 'white',
      buttonStroke: 'black',
      buttonLineWidth: 1,
      buttonTouchAreaXDilation: 0,
      buttonTouchAreaYDilation: 0,
      buttonMouseAreaXDilation: 0,
      buttonMouseAreaYDilation: 0,
      // list
      listFill: 'white',
      listStroke: 'black',
      listLineWidth: 1,
      openedSoundPlayer: generalOpenSoundPlayer,
      closedNoChangeSoundPlayer: generalCloseSoundPlayer,
      // pdom
      tagName: 'div',
      // must have accessible content to support behavior functions
      accessibleNameBehavior: ACCESSIBLE_NAME_BEHAVIOR,
      helpTextBehavior: HELP_TEXT_BEHAVIOR,
      comboBoxVoicingNameResponsePattern: SunConstants.VALUE_NAMED_PLACEHOLDER,
      comboBoxVoicingContextResponse: null,
      comboBoxVoicingHintResponse: null,
      // phet-io
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'ComboBox',
      phetioType: ComboBox.ComboBoxIO,
      phetioEventType: EventType.USER,
      visiblePropertyOptions: {
        phetioFeatured: true
      },
      phetioEnabledPropertyInstrumented: true // opt into default PhET-iO instrumented enabledProperty
    }, providedOptions);
    const nodes = getGroupItemNodes(items, options.tandem.createTandem('items'));
    assert && nodes.forEach(node => {
      assert && assert(!node.hasPDOMContent, 'Accessibility is provided by ComboBoxItemNode and ' + 'ComboBoxItem.a11yLabel. Additional PDOM content in the provided ' + 'Node could break accessibility.');
    });

    // validate option values
    assert && assert(options.xMargin > 0 && options.yMargin > 0, `margins must be > 0, xMargin=${options.xMargin}, yMargin=${options.yMargin}`);
    assert && assert(_.includes(LIST_POSITION_VALUES, options.listPosition), `invalid listPosition: ${options.listPosition}`);
    assert && assert(_.includes(ALIGN_VALUES, options.align), `invalid align: ${options.align}`);
    super();
    this.nodes = nodes;
    this.listPosition = options.listPosition;
    this.button = new ComboBoxButton(property, items, nodes, {
      align: options.align,
      arrowDirection: options.listPosition === 'below' ? 'down' : 'up',
      cornerRadius: options.cornerRadius,
      xMargin: options.xMargin,
      yMargin: options.yMargin,
      baseColor: options.buttonFill,
      stroke: options.buttonStroke,
      lineWidth: options.buttonLineWidth,
      touchAreaXDilation: options.buttonTouchAreaXDilation,
      touchAreaYDilation: options.buttonTouchAreaYDilation,
      mouseAreaXDilation: options.buttonMouseAreaXDilation,
      mouseAreaYDilation: options.buttonMouseAreaYDilation,
      localPreferredWidthProperty: this.localPreferredWidthProperty,
      localMinimumWidthProperty: this.localMinimumWidthProperty,
      comboBoxVoicingNameResponsePattern: options.comboBoxVoicingNameResponsePattern,
      // pdom - accessibleName and helpText are set via behavior functions on the ComboBox

      // phet-io
      tandem: options.tandem.createTandem('button')
    });
    this.addChild(this.button);
    this.listBox = new ComboBoxListBox(property, items, nodes, this.hideListBox.bind(this),
    // callback to hide the list box
    () => {
      this.button.blockNextVoicingFocusListener();
      this.button.focus();
    }, this.button, options.tandem.createTandem('listBox'), {
      align: options.align,
      highlightFill: options.highlightFill,
      xMargin: options.xMargin,
      yMargin: options.yMargin,
      cornerRadius: options.cornerRadius,
      fill: options.listFill,
      stroke: options.listStroke,
      lineWidth: options.listLineWidth,
      visible: false,
      comboBoxListItemNodeOptions: {
        comboBoxVoicingNameResponsePattern: options.comboBoxVoicingNameResponsePattern,
        voicingContextResponse: options.comboBoxVoicingContextResponse,
        voicingHintResponse: options.comboBoxVoicingHintResponse
      },
      // sound generation
      openedSoundPlayer: options.openedSoundPlayer,
      closedNoChangeSoundPlayer: options.closedNoChangeSoundPlayer,
      // pdom
      // the list box is aria-labelledby its own label sibling
      ariaLabelledbyAssociations: [{
        otherNode: this.button,
        otherElementName: PDOMPeer.LABEL_SIBLING,
        thisElementName: PDOMPeer.PRIMARY_SIBLING
      }]
    });
    listParent.addChild(this.listBox);
    this.listParent = listParent;
    const listBoxMatrixProperty = new MatrixBetweenProperty(this.button, this.listParent, {
      fromCoordinateFrame: 'parent',
      toCoordinateFrame: 'local'
    });
    Multilink.multilink([listBoxMatrixProperty, this.button.localBoundsProperty, this.listBox.localBoundsProperty], matrix => {
      if (matrix) {
        if (this.listPosition === 'above') {
          this.listBox.leftBottom = matrix.timesVector2(this.button.leftTop);
        } else {
          this.listBox.leftTop = matrix.timesVector2(this.button.leftBottom);
        }
      }
    });

    // The listBox is not a child Node of ComboBox and, as a result, listen to opacity of the ComboBox and keep
    // the listBox in sync with them. See https://github.com/phetsims/sun/issues/587
    this.opacityProperty.link(opacity => {
      this.listBox.opacityProperty.value = opacity;
    });
    this.mutate(options);
    if (assert && Tandem.VALIDATION && this.isPhetioInstrumented()) {
      items.forEach(item => {
        assert && assert(item.tandemName !== null, `PhET-iO instrumented ComboBoxes require ComboBoxItems to have tandemName: ${item.value}`);
      });
    }

    // Clicking on the button toggles visibility of the list box
    this.button.addListener(() => {
      this.listBox.visibleProperty.value = !this.listBox.visibleProperty.value;
      this.listBox.focusListItemNode(property.value);
    });
    this.display = null;
    this.clickToDismissListener = {
      down: event => {
        // If fuzzing is enabled, exercise this listener some percentage of the time, so that this listener is tested.
        // The rest of the time, ignore this listener, so that the listbox remains popped up, and we test making
        // choices from the listbox. See https://github.com/phetsims/sun/issues/677 for the initial implementation,
        // and See https://github.com/phetsims/aqua/issues/136 for the probability value chosen.
        if (!phet.chipper.isFuzzEnabled() || dotRandom.nextDouble() < 0.005) {
          // Ignore if we click over the button, since the button will handle hiding the list.
          if (!(event.trail.containsNode(this.button) || event.trail.containsNode(this.listBox))) {
            this.hideListBox();
          }
        }
      }
    };
    this.dismissWithFocusListener = focus => {
      if (focus && !focus.trail.containsNode(this.listBox)) {
        this.hideListBox();
      }
    };
    FocusManager.pdomFocusProperty.link(this.dismissWithFocusListener);
    this.listBox.visibleProperty.link(visible => {
      if (visible) {
        // show the list box
        this.scaleListBox();
        this.listBox.moveToFront();

        // manage clickToDismissListener
        assert && assert(!this.display, 'unexpected display');
        this.display = this.getUniqueTrail().rootNode().getRootedDisplays()[0];
        this.display.addInputListener(this.clickToDismissListener);
      } else {
        // manage clickToDismissListener
        if (this.display && this.display.hasInputListener(this.clickToDismissListener)) {
          this.display.removeInputListener(this.clickToDismissListener);
          this.display = null;
        }
      }
    });
    this.displayOnlyProperty = new BooleanProperty(false, {
      tandem: options.tandem.createTandem('displayOnlyProperty'),
      phetioFeatured: true,
      phetioDocumentation: 'disables interaction with the ComboBox and ' + 'makes it appear like a display that shows the current selection'
    });
    this.displayOnlyProperty.link(displayOnly => {
      this.hideListBox();
      this.button.setDisplayOnly(displayOnly);
      this.pickable = !displayOnly;
    });
    this.addLinkedElement(property, {
      tandem: options.tandem.createTandem('property')
    });
    this.disposeComboBox = () => {
      listBoxMatrixProperty.dispose();
      if (this.display && this.display.hasInputListener(this.clickToDismissListener)) {
        this.display.removeInputListener(this.clickToDismissListener);
      }
      FocusManager.pdomFocusProperty.unlink(this.dismissWithFocusListener);

      // dispose of subcomponents
      this.displayOnlyProperty.dispose(); // tandems must be cleaned up
      this.listBox.dispose();
      this.button.dispose();
      nodes.forEach(node => node.dispose());
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('sun', 'ComboBox', this);
  }
  dispose() {
    this.disposeComboBox();
    super.dispose();
  }

  /**
   * Shows the list box.
   */
  showListBox() {
    this.listBox.visibleProperty.value = true;
  }

  /**
   * Hides the list box.
   */
  hideListBox() {
    this.listBox.visibleProperty.value = false;
  }

  /**
   * Because the button and list box have different parents (and therefore different coordinate frames)
   * they may be scaled differently. This method scales the list box so that items on the button and in
   * the list appear to be the same size.
   */
  scaleListBox() {
    // To support an empty list box due to PhET-iO customization, see https://github.com/phetsims/sun/issues/606
    if (!this.listBox.localBounds.isEmpty()) {
      const buttonScale = this.button.localToGlobalBounds(this.button.localBounds).width / this.button.localBounds.width;
      const listBoxScale = this.listBox.localToGlobalBounds(this.listBox.localBounds).width / this.listBox.localBounds.width;
      this.listBox.scale(buttonScale / listBoxScale);
    }
  }

  /**
   * Sets the visibility of items that correspond to a value. If the selected item has this value, it's your
   * responsibility to change the Property value to something else. Otherwise, the combo box button will continue
   * to display this value.
   * @param value - the value associated with the ComboBoxItem
   * @param visible
   */
  setItemVisible(value, visible) {
    this.listBox.setItemVisible(value, visible);
  }

  /**
   * Is the item that corresponds to a value visible when the listbox is popped up?
   * @param value - the value associated with the ComboBoxItem
   */
  isItemVisible(value) {
    return this.listBox.isItemVisible(value);
  }
  static getMaxItemWidthProperty(nodes) {
    const widthProperties = _.flatten(nodes.map(node => {
      const properties = [node.boundsProperty];
      if (extendsWidthSizable(node)) {
        properties.push(node.isWidthResizableProperty);
        properties.push(node.minimumWidthProperty);
      }
      return properties;
    }));
    return DerivedProperty.deriveAny(widthProperties, () => {
      return Math.max(...nodes.map(node => isWidthSizable(node) ? node.minimumWidth || 0 : node.width));
    });
  }
  static getMaxItemHeightProperty(nodes) {
    const heightProperties = nodes.map(node => node.boundsProperty);
    return DerivedProperty.deriveAny(heightProperties, () => {
      return Math.max(...nodes.map(node => node.height));
    });
  }
  static ComboBoxIO = new IOType('ComboBoxIO', {
    valueType: ComboBox,
    documentation: 'A combo box is composed of a push button and a listbox. The listbox contains items that represent ' + 'choices. Pressing the button pops up the listbox. Selecting from an item in the listbox sets the ' + 'value of an associated Property. The button shows the item that is currently selected.',
    supertype: Node.NodeIO,
    events: ['listBoxShown', 'listBoxHidden']
  });
}
sun.register('ComboBox', ComboBox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJkb3RSYW5kb20iLCJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiZXh0ZW5kc1dpZHRoU2l6YWJsZSIsIkZvY3VzTWFuYWdlciIsImlzV2lkdGhTaXphYmxlIiwiTWF0cml4QmV0d2VlblByb3BlcnR5IiwiTm9kZSIsIlBET01QZWVyIiwiV2lkdGhTaXphYmxlIiwiZ2VuZXJhbENsb3NlU291bmRQbGF5ZXIiLCJnZW5lcmFsT3BlblNvdW5kUGxheWVyIiwiRXZlbnRUeXBlIiwiVGFuZGVtIiwiSU9UeXBlIiwiQ29tYm9Cb3hCdXR0b24iLCJDb21ib0JveExpc3RCb3giLCJzdW4iLCJTdW5Db25zdGFudHMiLCJEZXJpdmVkUHJvcGVydHkiLCJnZXRHcm91cEl0ZW1Ob2RlcyIsIk11bHRpbGluayIsIkxJU1RfUE9TSVRJT05fVkFMVUVTIiwiQUxJR05fVkFMVUVTIiwiQUNDRVNTSUJMRV9OQU1FX0JFSEFWSU9SIiwibm9kZSIsIm9wdGlvbnMiLCJhY2Nlc3NpYmxlTmFtZSIsIm90aGVyTm9kZUNhbGxiYWNrcyIsInB1c2giLCJidXR0b24iLCJIRUxQX1RFWFRfQkVIQVZJT1IiLCJoZWxwVGV4dCIsIkNvbWJvQm94IiwiSVRFTV9UQU5ERU1fTkFNRV9TVUZGSVgiLCJjb25zdHJ1Y3RvciIsInByb3BlcnR5IiwiaXRlbXMiLCJsaXN0UGFyZW50IiwicHJvdmlkZWRPcHRpb25zIiwiYXNzZXJ0IiwiXyIsInVuaXFCeSIsIml0ZW0iLCJ2YWx1ZSIsImxlbmd0aCIsImZvckVhY2giLCJ0YW5kZW1OYW1lIiwiZW5kc1dpdGgiLCJtYXhXaWR0aCIsImFsaWduIiwibGlzdFBvc2l0aW9uIiwibGFiZWxYU3BhY2luZyIsImRpc2FibGVkT3BhY2l0eSIsImNvcm5lclJhZGl1cyIsImhpZ2hsaWdodEZpbGwiLCJ4TWFyZ2luIiwieU1hcmdpbiIsImJ1dHRvbkZpbGwiLCJidXR0b25TdHJva2UiLCJidXR0b25MaW5lV2lkdGgiLCJidXR0b25Ub3VjaEFyZWFYRGlsYXRpb24iLCJidXR0b25Ub3VjaEFyZWFZRGlsYXRpb24iLCJidXR0b25Nb3VzZUFyZWFYRGlsYXRpb24iLCJidXR0b25Nb3VzZUFyZWFZRGlsYXRpb24iLCJsaXN0RmlsbCIsImxpc3RTdHJva2UiLCJsaXN0TGluZVdpZHRoIiwib3BlbmVkU291bmRQbGF5ZXIiLCJjbG9zZWROb0NoYW5nZVNvdW5kUGxheWVyIiwidGFnTmFtZSIsImFjY2Vzc2libGVOYW1lQmVoYXZpb3IiLCJoZWxwVGV4dEJlaGF2aW9yIiwiY29tYm9Cb3hWb2ljaW5nTmFtZVJlc3BvbnNlUGF0dGVybiIsIlZBTFVFX05BTUVEX1BMQUNFSE9MREVSIiwiY29tYm9Cb3hWb2ljaW5nQ29udGV4dFJlc3BvbnNlIiwiY29tYm9Cb3hWb2ljaW5nSGludFJlc3BvbnNlIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ0YW5kZW1OYW1lU3VmZml4IiwicGhldGlvVHlwZSIsIkNvbWJvQm94SU8iLCJwaGV0aW9FdmVudFR5cGUiLCJVU0VSIiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb0ZlYXR1cmVkIiwicGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwibm9kZXMiLCJjcmVhdGVUYW5kZW0iLCJoYXNQRE9NQ29udGVudCIsImluY2x1ZGVzIiwiYXJyb3dEaXJlY3Rpb24iLCJiYXNlQ29sb3IiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJtb3VzZUFyZWFYRGlsYXRpb24iLCJtb3VzZUFyZWFZRGlsYXRpb24iLCJsb2NhbFByZWZlcnJlZFdpZHRoUHJvcGVydHkiLCJsb2NhbE1pbmltdW1XaWR0aFByb3BlcnR5IiwiYWRkQ2hpbGQiLCJsaXN0Qm94IiwiaGlkZUxpc3RCb3giLCJiaW5kIiwiYmxvY2tOZXh0Vm9pY2luZ0ZvY3VzTGlzdGVuZXIiLCJmb2N1cyIsImZpbGwiLCJ2aXNpYmxlIiwiY29tYm9Cb3hMaXN0SXRlbU5vZGVPcHRpb25zIiwidm9pY2luZ0NvbnRleHRSZXNwb25zZSIsInZvaWNpbmdIaW50UmVzcG9uc2UiLCJhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucyIsIm90aGVyTm9kZSIsIm90aGVyRWxlbWVudE5hbWUiLCJMQUJFTF9TSUJMSU5HIiwidGhpc0VsZW1lbnROYW1lIiwiUFJJTUFSWV9TSUJMSU5HIiwibGlzdEJveE1hdHJpeFByb3BlcnR5IiwiZnJvbUNvb3JkaW5hdGVGcmFtZSIsInRvQ29vcmRpbmF0ZUZyYW1lIiwibXVsdGlsaW5rIiwibG9jYWxCb3VuZHNQcm9wZXJ0eSIsIm1hdHJpeCIsImxlZnRCb3R0b20iLCJ0aW1lc1ZlY3RvcjIiLCJsZWZ0VG9wIiwib3BhY2l0eVByb3BlcnR5IiwibGluayIsIm9wYWNpdHkiLCJtdXRhdGUiLCJWQUxJREFUSU9OIiwiaXNQaGV0aW9JbnN0cnVtZW50ZWQiLCJhZGRMaXN0ZW5lciIsInZpc2libGVQcm9wZXJ0eSIsImZvY3VzTGlzdEl0ZW1Ob2RlIiwiZGlzcGxheSIsImNsaWNrVG9EaXNtaXNzTGlzdGVuZXIiLCJkb3duIiwiZXZlbnQiLCJwaGV0IiwiY2hpcHBlciIsImlzRnV6ekVuYWJsZWQiLCJuZXh0RG91YmxlIiwidHJhaWwiLCJjb250YWluc05vZGUiLCJkaXNtaXNzV2l0aEZvY3VzTGlzdGVuZXIiLCJwZG9tRm9jdXNQcm9wZXJ0eSIsInNjYWxlTGlzdEJveCIsIm1vdmVUb0Zyb250IiwiZ2V0VW5pcXVlVHJhaWwiLCJyb290Tm9kZSIsImdldFJvb3RlZERpc3BsYXlzIiwiYWRkSW5wdXRMaXN0ZW5lciIsImhhc0lucHV0TGlzdGVuZXIiLCJyZW1vdmVJbnB1dExpc3RlbmVyIiwiZGlzcGxheU9ubHlQcm9wZXJ0eSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJkaXNwbGF5T25seSIsInNldERpc3BsYXlPbmx5IiwicGlja2FibGUiLCJhZGRMaW5rZWRFbGVtZW50IiwiZGlzcG9zZUNvbWJvQm94IiwiZGlzcG9zZSIsInVubGluayIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsInNob3dMaXN0Qm94IiwibG9jYWxCb3VuZHMiLCJpc0VtcHR5IiwiYnV0dG9uU2NhbGUiLCJsb2NhbFRvR2xvYmFsQm91bmRzIiwid2lkdGgiLCJsaXN0Qm94U2NhbGUiLCJzY2FsZSIsInNldEl0ZW1WaXNpYmxlIiwiaXNJdGVtVmlzaWJsZSIsImdldE1heEl0ZW1XaWR0aFByb3BlcnR5Iiwid2lkdGhQcm9wZXJ0aWVzIiwiZmxhdHRlbiIsIm1hcCIsInByb3BlcnRpZXMiLCJib3VuZHNQcm9wZXJ0eSIsImlzV2lkdGhSZXNpemFibGVQcm9wZXJ0eSIsIm1pbmltdW1XaWR0aFByb3BlcnR5IiwiZGVyaXZlQW55IiwiTWF0aCIsIm1heCIsIm1pbmltdW1XaWR0aCIsImdldE1heEl0ZW1IZWlnaHRQcm9wZXJ0eSIsImhlaWdodFByb3BlcnRpZXMiLCJoZWlnaHQiLCJ2YWx1ZVR5cGUiLCJkb2N1bWVudGF0aW9uIiwic3VwZXJ0eXBlIiwiTm9kZUlPIiwiZXZlbnRzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb21ib0JveC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTY2VuZXJ5LWJhc2VkIGNvbWJvIGJveC4gQ29tcG9zZWQgb2YgYSBidXR0b24gYW5kIGEgcG9wdXAgJ2xpc3QgYm94JyBvZiBpdGVtcy4gQ29tYm9Cb3ggaGFzIG5vIGludGVyYWN0aW9uIG9mIGl0c1xyXG4gKiBvd24sIGFsbCBpbnRlcmFjdGlvbiBpcyBoYW5kbGVkIGJ5IGl0cyBzdWJjb21wb25lbnRzLiBUaGUgbGlzdCBib3ggaXMgZGlzcGxheWVkIHdoZW4gdGhlIGJ1dHRvbiBpcyBwcmVzc2VkLCBhbmRcclxuICogZGlzbWlzc2VkIHdoZW4gYW4gaXRlbSBpcyBzZWxlY3RlZCwgdGhlIHVzZXIgY2xpY2tzIG9uIHRoZSBidXR0b24sIG9yIHRoZSB1c2VyIGNsaWNrcyBvdXRzaWRlIHRoZSBsaXN0LiBUaGUgbGlzdFxyXG4gKiBjYW4gYmUgZGlzcGxheWVkIGVpdGhlciBhYm92ZSBvciBiZWxvdyB0aGUgYnV0dG9uLlxyXG4gKlxyXG4gKiBUaGUgc3VwcG9ydGluZyB0eXBlcyBhbmQgY2xhc3NlcyBhcmU6XHJcbiAqXHJcbiAqIENvbWJvQm94SXRlbSAtIGl0ZW1zIHByb3ZpZGVkIHRvIENvbWJvQm94IGNvbnN0cnVjdG9yXHJcbiAqIENvbWJvQm94QnV0dG9uIC0gdGhlIGJ1dHRvblxyXG4gKiBDb21ib0JveExpc3RCb3ggLSB0aGUgbGlzdCBib3hcclxuICogQ29tYm9Cb3hMaXN0SXRlbU5vZGUgLSBhbiBpdGVtIGluIHRoZSBsaXN0IGJveFxyXG4gKlxyXG4gKiBGb3IgaW5mbyBvbiBDb21ib0JveCBVSSBkZXNpZ24sIGluY2x1ZGluZyBhMTF5LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9ibG9iL21hc3Rlci9kb2MvQ29tYm9Cb3gubWRcclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHsgRGlzcGxheSwgZXh0ZW5kc1dpZHRoU2l6YWJsZSwgRm9jdXMsIEZvY3VzTWFuYWdlciwgaXNXaWR0aFNpemFibGUsIE1hdHJpeEJldHdlZW5Qcm9wZXJ0eSwgTm9kZSwgTm9kZU9wdGlvbnMsIFBET01CZWhhdmlvckZ1bmN0aW9uLCBQRE9NUGVlciwgUERPTVZhbHVlVHlwZSwgVENvbG9yLCBUSW5wdXRMaXN0ZW5lciwgVFBhaW50LCBXaWR0aFNpemFibGUsIFdpZHRoU2l6YWJsZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVFNvdW5kUGxheWVyIGZyb20gJy4uLy4uL3RhbWJvL2pzL1RTb3VuZFBsYXllci5qcyc7XHJcbmltcG9ydCBnZW5lcmFsQ2xvc2VTb3VuZFBsYXllciBmcm9tICcuLi8uLi90YW1iby9qcy9zaGFyZWQtc291bmQtcGxheWVycy9nZW5lcmFsQ2xvc2VTb3VuZFBsYXllci5qcyc7XHJcbmltcG9ydCBnZW5lcmFsT3BlblNvdW5kUGxheWVyIGZyb20gJy4uLy4uL3RhbWJvL2pzL3NoYXJlZC1zb3VuZC1wbGF5ZXJzL2dlbmVyYWxPcGVuU291bmRQbGF5ZXIuanMnO1xyXG5pbXBvcnQgRXZlbnRUeXBlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9FdmVudFR5cGUuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgQ29tYm9Cb3hCdXR0b24gZnJvbSAnLi9Db21ib0JveEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBDb21ib0JveExpc3RCb3ggZnJvbSAnLi9Db21ib0JveExpc3RCb3guanMnO1xyXG5pbXBvcnQgc3VuIGZyb20gJy4vc3VuLmpzJztcclxuaW1wb3J0IFN1bkNvbnN0YW50cyBmcm9tICcuL1N1bkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTGlua2FibGVQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0xpbmthYmxlUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBTcGVha2FibGVSZXNvbHZlZFJlc3BvbnNlIH0gZnJvbSAnLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL1Jlc3BvbnNlUGFja2V0LmpzJztcclxuaW1wb3J0IEdyb3VwSXRlbU9wdGlvbnMsIHsgZ2V0R3JvdXBJdGVtTm9kZXMgfSBmcm9tICcuL0dyb3VwSXRlbU9wdGlvbnMuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5cclxuLy8gY29uc3RcclxuY29uc3QgTElTVF9QT1NJVElPTl9WQUxVRVMgPSBbICdhYm92ZScsICdiZWxvdycgXSBhcyBjb25zdDsgLy8gd2hlcmUgdGhlIGxpc3QgcG9wcyB1cCByZWxhdGl2ZSB0byB0aGUgYnV0dG9uXHJcbmNvbnN0IEFMSUdOX1ZBTFVFUyA9IFsgJ2xlZnQnLCAncmlnaHQnLCAnY2VudGVyJyBdIGFzIGNvbnN0OyAvLyBhbGlnbm1lbnQgb2YgaXRlbSBvbiBidXR0b24gYW5kIGluIGxpc3RcclxuXHJcbmV4cG9ydCB0eXBlIENvbWJvQm94SXRlbTxUPiA9IHtcclxuXHJcbiAgLy8gdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgaXRlbVxyXG4gIHZhbHVlOiBUO1xyXG5cclxuICAvLyBTb3VuZCB0aGF0IHdpbGwgYmUgcGxheWVkIHdoZW4gdGhpcyBpdGVtIGlzIHNlbGVjdGVkLiAgSWYgc2V0IHRvIGBudWxsYCBhIGRlZmF1bHQgc291bmQgd2lsbCBiZSB1c2VkIHRoYXQgaXMgYmFzZWRcclxuICAvLyBvbiB0aGlzIGl0ZW0ncyBwb3NpdGlvbiBpbiB0aGUgY29tYm8gYm94IGxpc3QuICBBIHZhbHVlIG9mIGBudWxsU291bmRQbGF5ZXJgIGNhbiBiZSB1c2VkIHRvIGRpc2FibGUuXHJcbiAgc291bmRQbGF5ZXI/OiBUU291bmRQbGF5ZXIgfCBudWxsO1xyXG5cclxuICAvLyBwZG9tIC0gdGhlIGxhYmVsIGZvciB0aGlzIGl0ZW0ncyBhc3NvY2lhdGVkIE5vZGUgaW4gdGhlIGNvbWJvIGJveFxyXG4gIGExMXlOYW1lPzogUERPTVZhbHVlVHlwZSB8IG51bGw7XHJcbn0gJiBHcm91cEl0ZW1PcHRpb25zO1xyXG5cclxuLy8gTW9zdCB1c2FnZXMgb2YgdGhlIGl0ZW1zIHNob3VsZCBub3QgYmUgYWJsZSB0byBjcmVhdGUgdGhlIE5vZGUsIGJ1dCByYXRoZXIgc2hvdWxkIHVzZSB0aGUgY29ycmVzcG9uZGluZyBgbm9kZXNgIGFycmF5LlxyXG5leHBvcnQgdHlwZSBDb21ib0JveEl0ZW1Ob05vZGU8VD4gPSBTdHJpY3RPbWl0PENvbWJvQm94SXRlbTxUPiwgJ2NyZWF0ZU5vZGUnPjtcclxuXHJcbmV4cG9ydCB0eXBlIENvbWJvQm94TGlzdFBvc2l0aW9uID0gdHlwZW9mIExJU1RfUE9TSVRJT05fVkFMVUVTW251bWJlcl07XHJcbmV4cG9ydCB0eXBlIENvbWJvQm94QWxpZ24gPSB0eXBlb2YgQUxJR05fVkFMVUVTW251bWJlcl07XHJcblxyXG4vLyBUaGUgZGVmaW5pdGlvbiBmb3IgaG93IENvbWJvQm94IHNldHMgaXRzIGFjY2Vzc2libGVOYW1lIGFuZCBoZWxwVGV4dCBpbiB0aGUgUERPTS4gRm9yd2FyZCBpdCBvbnRvIGl0cyBidXR0b24uIFNlZVxyXG4vLyBDb21ib0JveC5tZCBmb3IgZnVydGhlciBzdHlsZSBndWlkZSBhbmQgZG9jdW1lbnRhdGlvbiBvbiB0aGUgcGF0dGVybi5cclxuY29uc3QgQUNDRVNTSUJMRV9OQU1FX0JFSEFWSU9SOiBQRE9NQmVoYXZpb3JGdW5jdGlvbiA9ICggbm9kZSwgb3B0aW9ucywgYWNjZXNzaWJsZU5hbWUsIG90aGVyTm9kZUNhbGxiYWNrcyApID0+IHtcclxuICBvdGhlck5vZGVDYWxsYmFja3MucHVzaCggKCkgPT4ge1xyXG4gICAgKCBub2RlIGFzIENvbWJvQm94PHVua25vd24+ICkuYnV0dG9uLmFjY2Vzc2libGVOYW1lID0gYWNjZXNzaWJsZU5hbWU7XHJcbiAgfSApO1xyXG4gIHJldHVybiBvcHRpb25zO1xyXG59O1xyXG5jb25zdCBIRUxQX1RFWFRfQkVIQVZJT1I6IFBET01CZWhhdmlvckZ1bmN0aW9uID0gKCBub2RlLCBvcHRpb25zLCBoZWxwVGV4dCwgb3RoZXJOb2RlQ2FsbGJhY2tzICkgPT4ge1xyXG4gIG90aGVyTm9kZUNhbGxiYWNrcy5wdXNoKCAoKSA9PiB7XHJcbiAgICAoIG5vZGUgYXMgQ29tYm9Cb3g8dW5rbm93bj4gKS5idXR0b24uaGVscFRleHQgPSBoZWxwVGV4dDtcclxuICB9ICk7XHJcbiAgcmV0dXJuIG9wdGlvbnM7XHJcbn07XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGFsaWduPzogQ29tYm9Cb3hBbGlnbjtcclxuICBsaXN0UG9zaXRpb24/OiBDb21ib0JveExpc3RQb3NpdGlvbjtcclxuXHJcbiAgLy8gaG9yaXpvbnRhbCBzcGFjZSBiZXR3ZWVuIGxhYmVsIGFuZCBjb21ibyBib3hcclxuICBsYWJlbFhTcGFjaW5nPzogbnVtYmVyO1xyXG5cclxuICAvLyBvcGFjaXR5IHVzZWQgdG8gbWFrZSB0aGUgY29udHJvbCBsb29rIGRpc2FibGVkLCAwLTFcclxuICBkaXNhYmxlZE9wYWNpdHk/OiBudW1iZXI7XHJcblxyXG4gIC8vIGFwcGxpZWQgdG8gYnV0dG9uLCBsaXN0Qm94LCBhbmQgaXRlbSBoaWdobGlnaHRzXHJcbiAgY29ybmVyUmFkaXVzPzogbnVtYmVyO1xyXG5cclxuICAvLyBoaWdobGlnaHQgYmVoaW5kIGl0ZW1zIGluIHRoZSBsaXN0XHJcbiAgaGlnaGxpZ2h0RmlsbD86IFRQYWludDtcclxuXHJcbiAgLy8gTWFyZ2lucyBhcm91bmQgdGhlIGVkZ2VzIG9mIHRoZSBidXR0b24gYW5kIGxpc3Rib3ggd2hlbiBoaWdobGlnaHQgaXMgaW52aXNpYmxlLlxyXG4gIC8vIEhpZ2hsaWdodCBtYXJnaW5zIGFyb3VuZCB0aGUgaXRlbXMgaW4gdGhlIGxpc3QgYXJlIHNldCB0byAxLzIgb2YgdGhlc2UgdmFsdWVzLlxyXG4gIC8vIFRoZXNlIHZhbHVlcyBtdXN0IGJlID4gMC5cclxuICB4TWFyZ2luPzogbnVtYmVyO1xyXG4gIHlNYXJnaW4/OiBudW1iZXI7XHJcblxyXG4gIC8vIGJ1dHRvblxyXG4gIGJ1dHRvbkZpbGw/OiBUQ29sb3I7XHJcbiAgYnV0dG9uU3Ryb2tlPzogVFBhaW50O1xyXG4gIGJ1dHRvbkxpbmVXaWR0aD86IG51bWJlcjtcclxuICBidXR0b25Ub3VjaEFyZWFYRGlsYXRpb24/OiBudW1iZXI7XHJcbiAgYnV0dG9uVG91Y2hBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xyXG4gIGJ1dHRvbk1vdXNlQXJlYVhEaWxhdGlvbj86IG51bWJlcjtcclxuICBidXR0b25Nb3VzZUFyZWFZRGlsYXRpb24/OiBudW1iZXI7XHJcblxyXG4gIC8vIGxpc3RcclxuICBsaXN0RmlsbD86IFRQYWludDtcclxuICBsaXN0U3Ryb2tlPzogVFBhaW50O1xyXG4gIGxpc3RMaW5lV2lkdGg/OiBudW1iZXI7XHJcblxyXG4gIC8vIFNvdW5kIGdlbmVyYXRvcnMgZm9yIHdoZW4gY29tYm8gYm94IGlzIG9wZW5lZCBhbmQgZm9yIHdoZW4gaXQgaXMgY2xvc2VkIHdpdGggbm8gY2hhbmdlIChjbG9zaW5nXHJcbiAgLy8gKndpdGgqIGEgY2hhbmdlIGlzIGhhbmRsZWQgZWxzZXdoZXJlKS5cclxuICBvcGVuZWRTb3VuZFBsYXllcj86IFRTb3VuZFBsYXllcjtcclxuICBjbG9zZWROb0NoYW5nZVNvdW5kUGxheWVyPzogVFNvdW5kUGxheWVyO1xyXG5cclxuICAvLyBWb2ljaW5nXHJcbiAgLy8gQ29tYm9Cb3ggZG9lcyBub3QgbWl4IFZvaWNpbmcsIHNvIGl0IGNyZWF0ZXMgY3VzdG9tIG9wdGlvbnMgdG8gcGFzcyB0byBjb21wb3NlZCBWb2ljaW5nIE5vZGVzLlxyXG4gIC8vIFRoZSBwYXR0ZXJuIGZvciB0aGUgbmFtZSByZXNwb25zZSBzdHJpbmcsIG11c3QgaW5jbHVkZSBge3t2YWx1ZX19YCBzbyB0aGF0IHRoZSBzZWxlY3RlZCB2YWx1ZSBzdHJpbmcgY2FuXHJcbiAgLy8gYmUgZmlsbGVkIGluLlxyXG4gIGNvbWJvQm94Vm9pY2luZ05hbWVSZXNwb25zZVBhdHRlcm4/OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+IHwgc3RyaW5nO1xyXG5cclxuICAvLyBtb3N0IGNvbnRleHQgcmVzcG9uc2VzIGFyZSBkeW5hbWljIHRvIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBzaW0sIHNvIGxhemlseSBjcmVhdGUgdGhlbSB3aGVuIG5lZWRlZC5cclxuICBjb21ib0JveFZvaWNpbmdDb250ZXh0UmVzcG9uc2U/OiAoICgpID0+IHN0cmluZyB8IG51bGwgKSB8IG51bGw7XHJcblxyXG4gIC8vIHN0cmluZyBmb3IgdGhlIHZvaWNpbmcgcmVzcG9uc2VcclxuICBjb21ib0JveFZvaWNpbmdIaW50UmVzcG9uc2U/OiBTcGVha2FibGVSZXNvbHZlZFJlc3BvbnNlIHwgbnVsbDtcclxufTtcclxuXHJcbnR5cGUgUGFyZW50T3B0aW9ucyA9IE5vZGVPcHRpb25zICYgV2lkdGhTaXphYmxlT3B0aW9ucztcclxuZXhwb3J0IHR5cGUgQ29tYm9Cb3hPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQYXJlbnRPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tYm9Cb3g8VD4gZXh0ZW5kcyBXaWR0aFNpemFibGUoIE5vZGUgKSB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgbGlzdFBvc2l0aW9uOiBDb21ib0JveExpc3RQb3NpdGlvbjtcclxuXHJcbiAgLy8gTGlzdCBvZiBub2RlcyBjcmVhdGVkIGZyb20gQ29tYm9Cb3hJdGVtcyB0byBiZSBkaXNwbGF5ZWQgd2l0aCB0aGVpciBjb3JyZXNwb25kaW5nIHZhbHVlLiBTZWUgQ29tYm9Cb3hJdGVtLmNyZWF0ZU5vZGUoKS5cclxuICBwdWJsaWMgcmVhZG9ubHkgbm9kZXM6IE5vZGVbXTtcclxuXHJcbiAgLy8gYnV0dG9uIHRoYXQgc2hvd3MgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIChpbnRlcm5hbClcclxuICBwdWJsaWMgYnV0dG9uOiBDb21ib0JveEJ1dHRvbjxUPjtcclxuXHJcbiAgLy8gdGhlIHBvcHVwIGxpc3QgYm94XHJcbiAgcHJpdmF0ZSByZWFkb25seSBsaXN0Qm94OiBDb21ib0JveExpc3RCb3g8VD47XHJcblxyXG4gIHByaXZhdGUgbGlzdFBhcmVudDogTm9kZTtcclxuXHJcbiAgLy8gdGhlIGRpc3BsYXkgdGhhdCBjbGlja1RvRGlzbWlzc0xpc3RlbmVyIGlzIGFkZGVkIHRvLCBiZWNhdXNlIHRoZSBzY2VuZSBtYXkgY2hhbmdlLCBzZWUgc3VuIzE0XHJcbiAgcHJpdmF0ZSBkaXNwbGF5OiBEaXNwbGF5IHwgbnVsbDtcclxuXHJcbiAgLy8gQ2xpY2tpbmcgYW55d2hlcmUgb3RoZXIgdGhhbiB0aGUgYnV0dG9uIG9yIGxpc3QgYm94IHdpbGwgaGlkZSB0aGUgbGlzdCBib3guXHJcbiAgcHJpdmF0ZSByZWFkb25seSBjbGlja1RvRGlzbWlzc0xpc3RlbmVyOiBUSW5wdXRMaXN0ZW5lcjtcclxuXHJcbiAgLy8gKFBET00pIHdoZW4gZm9jdXMgbGVhdmVzIHRoZSBDb21ib0JveExpc3RCb3gsIGl0IHNob3VsZCBiZSBjbG9zZWQuIFRoaXMgY291bGQgaGFwcGVuIGZyb20ga2V5Ym9hcmRcclxuICAvLyBvciBmcm9tIG90aGVyIHNjcmVlbiByZWFkZXIgY29udHJvbHMgKGxpa2UgVm9pY2VPdmVyIGdlc3R1cmVzKVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzbWlzc1dpdGhGb2N1c0xpc3RlbmVyOiAoIGZvY3VzOiBGb2N1cyB8IG51bGwgKSA9PiB2b2lkO1xyXG5cclxuICAvLyBGb3IgdXNlIHZpYSBQaEVULWlPLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvNDUxXHJcbiAgLy8gVGhpcyBpcyBub3QgZ2VuZXJhbGx5IGNvbnRyb2xsZWQgYnkgdGhlIHVzZXIsIHNvIGl0IGlzIG5vdCByZXNldCB3aGVuIHRoZSBSZXNldCBBbGwgYnV0dG9uIGlzIHByZXNzZWQuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwbGF5T25seVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlQ29tYm9Cb3g6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSVRFTV9UQU5ERU1fTkFNRV9TVUZGSVggPSAnSXRlbSc7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBwcm9wZXJ0eSAtIG11c3QgYmUgc2V0dGFibGUgYW5kIGxpbmthYmxlLCBidXQgbmVlZHMgdG8gc3VwcG9ydCBQcm9wZXJ0eSwgRGVyaXZlZFByb3BlcnR5IGFuZCBEeW5hbWljUHJvcGVydHlcclxuICAgKiBAcGFyYW0gaXRlbXMgLSBpdGVtcywgaW4gdGhlIG9yZGVyIHRoYXQgdGhleSBhcHBlYXIgaW4gdGhlIGxpc3Rib3hcclxuICAgKiBAcGFyYW0gbGlzdFBhcmVudCBub2RlIHRoYXQgd2lsbCBiZSB1c2VkIGFzIHRoZSBsaXN0J3MgcGFyZW50LCB1c2UgdGhpcyB0byBlbnN1cmUgdGhhdCB0aGUgbGlzdCBpcyBpbiBmcm9udCBvZiBldmVyeXRoaW5nIGVsc2VcclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9ucz9dXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm9wZXJ0eTogTGlua2FibGVQcm9wZXJ0eTxUPiwgaXRlbXM6IENvbWJvQm94SXRlbTxUPltdLCBsaXN0UGFyZW50OiBOb2RlLCBwcm92aWRlZE9wdGlvbnM/OiBDb21ib0JveE9wdGlvbnMgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy51bmlxQnkoIGl0ZW1zLCAoIGl0ZW06IENvbWJvQm94SXRlbTxUPiApID0+IGl0ZW0udmFsdWUgKS5sZW5ndGggPT09IGl0ZW1zLmxlbmd0aCxcclxuICAgICAgJ2l0ZW1zIG11c3QgaGF2ZSB1bmlxdWUgdmFsdWVzJyApO1xyXG4gICAgYXNzZXJ0ICYmIGl0ZW1zLmZvckVhY2goIGl0ZW0gPT4ge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhaXRlbS50YW5kZW1OYW1lIHx8IGl0ZW0udGFuZGVtTmFtZS5lbmRzV2l0aCggQ29tYm9Cb3guSVRFTV9UQU5ERU1fTkFNRV9TVUZGSVggKSxcclxuICAgICAgICBgQ29tYm9Cb3hJdGVtIHRhbmRlbU5hbWUgbXVzdCBlbmQgd2l0aCAnJHtDb21ib0JveC5JVEVNX1RBTkRFTV9OQU1FX1NVRkZJWH0nOiAke2l0ZW0udGFuZGVtTmFtZX1gICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzU0MlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbGlzdFBhcmVudC5tYXhXaWR0aCA9PT0gbnVsbCxcclxuICAgICAgJ0NvbWJvQm94IGlzIHJlc3BvbnNpYmxlIGZvciBzY2FsaW5nIGxpc3RCb3guIFNldHRpbmcgbWF4V2lkdGggZm9yIGxpc3RQYXJlbnQgbWF5IHJlc3VsdCBpbiBidWdneSBiZWhhdmlvci4nICk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDb21ib0JveE9wdGlvbnMsIFNlbGZPcHRpb25zLCBQYXJlbnRPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICBsaXN0UG9zaXRpb246ICdiZWxvdycsXHJcbiAgICAgIGxhYmVsWFNwYWNpbmc6IDEwLFxyXG4gICAgICBkaXNhYmxlZE9wYWNpdHk6IDAuNSxcclxuICAgICAgY29ybmVyUmFkaXVzOiA0LFxyXG4gICAgICBoaWdobGlnaHRGaWxsOiAncmdiKCAyNDUsIDI0NSwgMjQ1ICknLFxyXG4gICAgICB4TWFyZ2luOiAxMixcclxuICAgICAgeU1hcmdpbjogOCxcclxuXHJcbiAgICAgIC8vIGJ1dHRvblxyXG4gICAgICBidXR0b25GaWxsOiAnd2hpdGUnLFxyXG4gICAgICBidXR0b25TdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGJ1dHRvbkxpbmVXaWR0aDogMSxcclxuICAgICAgYnV0dG9uVG91Y2hBcmVhWERpbGF0aW9uOiAwLFxyXG4gICAgICBidXR0b25Ub3VjaEFyZWFZRGlsYXRpb246IDAsXHJcbiAgICAgIGJ1dHRvbk1vdXNlQXJlYVhEaWxhdGlvbjogMCxcclxuICAgICAgYnV0dG9uTW91c2VBcmVhWURpbGF0aW9uOiAwLFxyXG5cclxuICAgICAgLy8gbGlzdFxyXG4gICAgICBsaXN0RmlsbDogJ3doaXRlJyxcclxuICAgICAgbGlzdFN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgbGlzdExpbmVXaWR0aDogMSxcclxuXHJcbiAgICAgIG9wZW5lZFNvdW5kUGxheWVyOiBnZW5lcmFsT3BlblNvdW5kUGxheWVyLFxyXG4gICAgICBjbG9zZWROb0NoYW5nZVNvdW5kUGxheWVyOiBnZW5lcmFsQ2xvc2VTb3VuZFBsYXllcixcclxuXHJcbiAgICAgIC8vIHBkb21cclxuICAgICAgdGFnTmFtZTogJ2RpdicsIC8vIG11c3QgaGF2ZSBhY2Nlc3NpYmxlIGNvbnRlbnQgdG8gc3VwcG9ydCBiZWhhdmlvciBmdW5jdGlvbnNcclxuICAgICAgYWNjZXNzaWJsZU5hbWVCZWhhdmlvcjogQUNDRVNTSUJMRV9OQU1FX0JFSEFWSU9SLFxyXG4gICAgICBoZWxwVGV4dEJlaGF2aW9yOiBIRUxQX1RFWFRfQkVIQVZJT1IsXHJcblxyXG4gICAgICBjb21ib0JveFZvaWNpbmdOYW1lUmVzcG9uc2VQYXR0ZXJuOiBTdW5Db25zdGFudHMuVkFMVUVfTkFNRURfUExBQ0VIT0xERVIsXHJcbiAgICAgIGNvbWJvQm94Vm9pY2luZ0NvbnRleHRSZXNwb25zZTogbnVsbCxcclxuICAgICAgY29tYm9Cb3hWb2ljaW5nSGludFJlc3BvbnNlOiBudWxsLFxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcclxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ0NvbWJvQm94JyxcclxuICAgICAgcGhldGlvVHlwZTogQ29tYm9Cb3guQ29tYm9Cb3hJTyxcclxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcclxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9GZWF0dXJlZDogdHJ1ZSB9LFxyXG4gICAgICBwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQ6IHRydWUgLy8gb3B0IGludG8gZGVmYXVsdCBQaEVULWlPIGluc3RydW1lbnRlZCBlbmFibGVkUHJvcGVydHlcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IG5vZGVzID0gZ2V0R3JvdXBJdGVtTm9kZXMoIGl0ZW1zLCBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdpdGVtcycgKSApO1xyXG5cclxuICAgIGFzc2VydCAmJiBub2Rlcy5mb3JFYWNoKCBub2RlID0+IHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIW5vZGUuaGFzUERPTUNvbnRlbnQsICdBY2Nlc3NpYmlsaXR5IGlzIHByb3ZpZGVkIGJ5IENvbWJvQm94SXRlbU5vZGUgYW5kICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbWJvQm94SXRlbS5hMTF5TGFiZWwuIEFkZGl0aW9uYWwgUERPTSBjb250ZW50IGluIHRoZSBwcm92aWRlZCAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdOb2RlIGNvdWxkIGJyZWFrIGFjY2Vzc2liaWxpdHkuJyApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHZhbGlkYXRlIG9wdGlvbiB2YWx1ZXNcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMueE1hcmdpbiA+IDAgJiYgb3B0aW9ucy55TWFyZ2luID4gMCxcclxuICAgICAgYG1hcmdpbnMgbXVzdCBiZSA+IDAsIHhNYXJnaW49JHtvcHRpb25zLnhNYXJnaW59LCB5TWFyZ2luPSR7b3B0aW9ucy55TWFyZ2lufWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIExJU1RfUE9TSVRJT05fVkFMVUVTLCBvcHRpb25zLmxpc3RQb3NpdGlvbiApLFxyXG4gICAgICBgaW52YWxpZCBsaXN0UG9zaXRpb246ICR7b3B0aW9ucy5saXN0UG9zaXRpb259YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5pbmNsdWRlcyggQUxJR05fVkFMVUVTLCBvcHRpb25zLmFsaWduICksXHJcbiAgICAgIGBpbnZhbGlkIGFsaWduOiAke29wdGlvbnMuYWxpZ259YCApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgdGhpcy5ub2RlcyA9IG5vZGVzO1xyXG5cclxuICAgIHRoaXMubGlzdFBvc2l0aW9uID0gb3B0aW9ucy5saXN0UG9zaXRpb247XHJcblxyXG4gICAgdGhpcy5idXR0b24gPSBuZXcgQ29tYm9Cb3hCdXR0b24oIHByb3BlcnR5LCBpdGVtcywgbm9kZXMsIHtcclxuICAgICAgYWxpZ246IG9wdGlvbnMuYWxpZ24sXHJcbiAgICAgIGFycm93RGlyZWN0aW9uOiAoIG9wdGlvbnMubGlzdFBvc2l0aW9uID09PSAnYmVsb3cnICkgPyAnZG93bicgOiAndXAnLFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IG9wdGlvbnMuY29ybmVyUmFkaXVzLFxyXG4gICAgICB4TWFyZ2luOiBvcHRpb25zLnhNYXJnaW4sXHJcbiAgICAgIHlNYXJnaW46IG9wdGlvbnMueU1hcmdpbixcclxuICAgICAgYmFzZUNvbG9yOiBvcHRpb25zLmJ1dHRvbkZpbGwsXHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5idXR0b25TdHJva2UsXHJcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5idXR0b25MaW5lV2lkdGgsXHJcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogb3B0aW9ucy5idXR0b25Ub3VjaEFyZWFYRGlsYXRpb24sXHJcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogb3B0aW9ucy5idXR0b25Ub3VjaEFyZWFZRGlsYXRpb24sXHJcbiAgICAgIG1vdXNlQXJlYVhEaWxhdGlvbjogb3B0aW9ucy5idXR0b25Nb3VzZUFyZWFYRGlsYXRpb24sXHJcbiAgICAgIG1vdXNlQXJlYVlEaWxhdGlvbjogb3B0aW9ucy5idXR0b25Nb3VzZUFyZWFZRGlsYXRpb24sXHJcbiAgICAgIGxvY2FsUHJlZmVycmVkV2lkdGhQcm9wZXJ0eTogdGhpcy5sb2NhbFByZWZlcnJlZFdpZHRoUHJvcGVydHksXHJcbiAgICAgIGxvY2FsTWluaW11bVdpZHRoUHJvcGVydHk6IHRoaXMubG9jYWxNaW5pbXVtV2lkdGhQcm9wZXJ0eSxcclxuXHJcbiAgICAgIGNvbWJvQm94Vm9pY2luZ05hbWVSZXNwb25zZVBhdHRlcm46IG9wdGlvbnMuY29tYm9Cb3hWb2ljaW5nTmFtZVJlc3BvbnNlUGF0dGVybixcclxuXHJcbiAgICAgIC8vIHBkb20gLSBhY2Nlc3NpYmxlTmFtZSBhbmQgaGVscFRleHQgYXJlIHNldCB2aWEgYmVoYXZpb3IgZnVuY3Rpb25zIG9uIHRoZSBDb21ib0JveFxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2J1dHRvbicgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5idXR0b24gKTtcclxuXHJcbiAgICB0aGlzLmxpc3RCb3ggPSBuZXcgQ29tYm9Cb3hMaXN0Qm94KCBwcm9wZXJ0eSwgaXRlbXMsIG5vZGVzLFxyXG4gICAgICB0aGlzLmhpZGVMaXN0Qm94LmJpbmQoIHRoaXMgKSwgLy8gY2FsbGJhY2sgdG8gaGlkZSB0aGUgbGlzdCBib3hcclxuICAgICAgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuYnV0dG9uLmJsb2NrTmV4dFZvaWNpbmdGb2N1c0xpc3RlbmVyKCk7XHJcbiAgICAgICAgdGhpcy5idXR0b24uZm9jdXMoKTtcclxuICAgICAgfSxcclxuICAgICAgdGhpcy5idXR0b24sXHJcbiAgICAgIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xpc3RCb3gnICksIHtcclxuICAgICAgICBhbGlnbjogb3B0aW9ucy5hbGlnbixcclxuICAgICAgICBoaWdobGlnaHRGaWxsOiBvcHRpb25zLmhpZ2hsaWdodEZpbGwsXHJcbiAgICAgICAgeE1hcmdpbjogb3B0aW9ucy54TWFyZ2luLFxyXG4gICAgICAgIHlNYXJnaW46IG9wdGlvbnMueU1hcmdpbixcclxuICAgICAgICBjb3JuZXJSYWRpdXM6IG9wdGlvbnMuY29ybmVyUmFkaXVzLFxyXG4gICAgICAgIGZpbGw6IG9wdGlvbnMubGlzdEZpbGwsXHJcbiAgICAgICAgc3Ryb2tlOiBvcHRpb25zLmxpc3RTdHJva2UsXHJcbiAgICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmxpc3RMaW5lV2lkdGgsXHJcbiAgICAgICAgdmlzaWJsZTogZmFsc2UsXHJcblxyXG4gICAgICAgIGNvbWJvQm94TGlzdEl0ZW1Ob2RlT3B0aW9uczoge1xyXG4gICAgICAgICAgY29tYm9Cb3hWb2ljaW5nTmFtZVJlc3BvbnNlUGF0dGVybjogb3B0aW9ucy5jb21ib0JveFZvaWNpbmdOYW1lUmVzcG9uc2VQYXR0ZXJuLFxyXG4gICAgICAgICAgdm9pY2luZ0NvbnRleHRSZXNwb25zZTogb3B0aW9ucy5jb21ib0JveFZvaWNpbmdDb250ZXh0UmVzcG9uc2UsXHJcbiAgICAgICAgICB2b2ljaW5nSGludFJlc3BvbnNlOiBvcHRpb25zLmNvbWJvQm94Vm9pY2luZ0hpbnRSZXNwb25zZVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8vIHNvdW5kIGdlbmVyYXRpb25cclxuICAgICAgICBvcGVuZWRTb3VuZFBsYXllcjogb3B0aW9ucy5vcGVuZWRTb3VuZFBsYXllcixcclxuICAgICAgICBjbG9zZWROb0NoYW5nZVNvdW5kUGxheWVyOiBvcHRpb25zLmNsb3NlZE5vQ2hhbmdlU291bmRQbGF5ZXIsXHJcblxyXG4gICAgICAgIC8vIHBkb21cclxuICAgICAgICAvLyB0aGUgbGlzdCBib3ggaXMgYXJpYS1sYWJlbGxlZGJ5IGl0cyBvd24gbGFiZWwgc2libGluZ1xyXG4gICAgICAgIGFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zOiBbIHtcclxuICAgICAgICAgIG90aGVyTm9kZTogdGhpcy5idXR0b24sXHJcbiAgICAgICAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5MQUJFTF9TSUJMSU5HLFxyXG4gICAgICAgICAgdGhpc0VsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkdcclxuICAgICAgICB9IF1cclxuICAgICAgfSApO1xyXG4gICAgbGlzdFBhcmVudC5hZGRDaGlsZCggdGhpcy5saXN0Qm94ICk7XHJcbiAgICB0aGlzLmxpc3RQYXJlbnQgPSBsaXN0UGFyZW50O1xyXG5cclxuICAgIGNvbnN0IGxpc3RCb3hNYXRyaXhQcm9wZXJ0eSA9IG5ldyBNYXRyaXhCZXR3ZWVuUHJvcGVydHkoIHRoaXMuYnV0dG9uLCB0aGlzLmxpc3RQYXJlbnQsIHtcclxuICAgICAgZnJvbUNvb3JkaW5hdGVGcmFtZTogJ3BhcmVudCcsXHJcbiAgICAgIHRvQ29vcmRpbmF0ZUZyYW1lOiAnbG9jYWwnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyBsaXN0Qm94TWF0cml4UHJvcGVydHksIHRoaXMuYnV0dG9uLmxvY2FsQm91bmRzUHJvcGVydHksIHRoaXMubGlzdEJveC5sb2NhbEJvdW5kc1Byb3BlcnR5IF0sXHJcbiAgICAgIG1hdHJpeCA9PiB7XHJcbiAgICAgICAgaWYgKCBtYXRyaXggKSB7XHJcbiAgICAgICAgICBpZiAoIHRoaXMubGlzdFBvc2l0aW9uID09PSAnYWJvdmUnICkge1xyXG4gICAgICAgICAgICB0aGlzLmxpc3RCb3gubGVmdEJvdHRvbSA9IG1hdHJpeC50aW1lc1ZlY3RvcjIoIHRoaXMuYnV0dG9uLmxlZnRUb3AgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmxpc3RCb3gubGVmdFRvcCA9IG1hdHJpeC50aW1lc1ZlY3RvcjIoIHRoaXMuYnV0dG9uLmxlZnRCb3R0b20gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBUaGUgbGlzdEJveCBpcyBub3QgYSBjaGlsZCBOb2RlIG9mIENvbWJvQm94IGFuZCwgYXMgYSByZXN1bHQsIGxpc3RlbiB0byBvcGFjaXR5IG9mIHRoZSBDb21ib0JveCBhbmQga2VlcFxyXG4gICAgLy8gdGhlIGxpc3RCb3ggaW4gc3luYyB3aXRoIHRoZW0uIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy81ODdcclxuICAgIHRoaXMub3BhY2l0eVByb3BlcnR5LmxpbmsoIG9wYWNpdHkgPT4geyB0aGlzLmxpc3RCb3gub3BhY2l0eVByb3BlcnR5LnZhbHVlID0gb3BhY2l0eTsgfSApO1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcblxyXG4gICAgaWYgKCBhc3NlcnQgJiYgVGFuZGVtLlZBTElEQVRJT04gJiYgdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpICkge1xyXG4gICAgICBpdGVtcy5mb3JFYWNoKCBpdGVtID0+IHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpdGVtLnRhbmRlbU5hbWUgIT09IG51bGwsIGBQaEVULWlPIGluc3RydW1lbnRlZCBDb21ib0JveGVzIHJlcXVpcmUgQ29tYm9Cb3hJdGVtcyB0byBoYXZlIHRhbmRlbU5hbWU6ICR7aXRlbS52YWx1ZX1gICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDbGlja2luZyBvbiB0aGUgYnV0dG9uIHRvZ2dsZXMgdmlzaWJpbGl0eSBvZiB0aGUgbGlzdCBib3hcclxuICAgIHRoaXMuYnV0dG9uLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMubGlzdEJveC52aXNpYmxlUHJvcGVydHkudmFsdWUgPSAhdGhpcy5saXN0Qm94LnZpc2libGVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgdGhpcy5saXN0Qm94LmZvY3VzTGlzdEl0ZW1Ob2RlKCBwcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZGlzcGxheSA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5jbGlja1RvRGlzbWlzc0xpc3RlbmVyID0ge1xyXG4gICAgICBkb3duOiBldmVudCA9PiB7XHJcblxyXG4gICAgICAgIC8vIElmIGZ1enppbmcgaXMgZW5hYmxlZCwgZXhlcmNpc2UgdGhpcyBsaXN0ZW5lciBzb21lIHBlcmNlbnRhZ2Ugb2YgdGhlIHRpbWUsIHNvIHRoYXQgdGhpcyBsaXN0ZW5lciBpcyB0ZXN0ZWQuXHJcbiAgICAgICAgLy8gVGhlIHJlc3Qgb2YgdGhlIHRpbWUsIGlnbm9yZSB0aGlzIGxpc3RlbmVyLCBzbyB0aGF0IHRoZSBsaXN0Ym94IHJlbWFpbnMgcG9wcGVkIHVwLCBhbmQgd2UgdGVzdCBtYWtpbmdcclxuICAgICAgICAvLyBjaG9pY2VzIGZyb20gdGhlIGxpc3Rib3guIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy82NzcgZm9yIHRoZSBpbml0aWFsIGltcGxlbWVudGF0aW9uLFxyXG4gICAgICAgIC8vIGFuZCBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FxdWEvaXNzdWVzLzEzNiBmb3IgdGhlIHByb2JhYmlsaXR5IHZhbHVlIGNob3Nlbi5cclxuICAgICAgICBpZiAoICFwaGV0LmNoaXBwZXIuaXNGdXp6RW5hYmxlZCgpIHx8IGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgPCAwLjAwNSApIHtcclxuXHJcbiAgICAgICAgICAvLyBJZ25vcmUgaWYgd2UgY2xpY2sgb3ZlciB0aGUgYnV0dG9uLCBzaW5jZSB0aGUgYnV0dG9uIHdpbGwgaGFuZGxlIGhpZGluZyB0aGUgbGlzdC5cclxuICAgICAgICAgIGlmICggISggZXZlbnQudHJhaWwuY29udGFpbnNOb2RlKCB0aGlzLmJ1dHRvbiApIHx8IGV2ZW50LnRyYWlsLmNvbnRhaW5zTm9kZSggdGhpcy5saXN0Qm94ICkgKSApIHtcclxuICAgICAgICAgICAgdGhpcy5oaWRlTGlzdEJveCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmRpc21pc3NXaXRoRm9jdXNMaXN0ZW5lciA9IGZvY3VzID0+IHtcclxuICAgICAgaWYgKCBmb2N1cyAmJiAhZm9jdXMudHJhaWwuY29udGFpbnNOb2RlKCB0aGlzLmxpc3RCb3ggKSApIHtcclxuICAgICAgICB0aGlzLmhpZGVMaXN0Qm94KCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBGb2N1c01hbmFnZXIucGRvbUZvY3VzUHJvcGVydHkubGluayggdGhpcy5kaXNtaXNzV2l0aEZvY3VzTGlzdGVuZXIgKTtcclxuXHJcbiAgICB0aGlzLmxpc3RCb3gudmlzaWJsZVByb3BlcnR5LmxpbmsoIHZpc2libGUgPT4ge1xyXG4gICAgICBpZiAoIHZpc2libGUgKSB7XHJcblxyXG4gICAgICAgIC8vIHNob3cgdGhlIGxpc3QgYm94XHJcbiAgICAgICAgdGhpcy5zY2FsZUxpc3RCb3goKTtcclxuICAgICAgICB0aGlzLmxpc3RCb3gubW92ZVRvRnJvbnQoKTtcclxuXHJcbiAgICAgICAgLy8gbWFuYWdlIGNsaWNrVG9EaXNtaXNzTGlzdGVuZXJcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5kaXNwbGF5LCAndW5leHBlY3RlZCBkaXNwbGF5JyApO1xyXG4gICAgICAgIHRoaXMuZGlzcGxheSA9IHRoaXMuZ2V0VW5pcXVlVHJhaWwoKS5yb290Tm9kZSgpLmdldFJvb3RlZERpc3BsYXlzKClbIDAgXTtcclxuICAgICAgICB0aGlzLmRpc3BsYXkuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5jbGlja1RvRGlzbWlzc0xpc3RlbmVyICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIG1hbmFnZSBjbGlja1RvRGlzbWlzc0xpc3RlbmVyXHJcbiAgICAgICAgaWYgKCB0aGlzLmRpc3BsYXkgJiYgdGhpcy5kaXNwbGF5Lmhhc0lucHV0TGlzdGVuZXIoIHRoaXMuY2xpY2tUb0Rpc21pc3NMaXN0ZW5lciApICkge1xyXG4gICAgICAgICAgdGhpcy5kaXNwbGF5LnJlbW92ZUlucHV0TGlzdGVuZXIoIHRoaXMuY2xpY2tUb0Rpc21pc3NMaXN0ZW5lciApO1xyXG4gICAgICAgICAgdGhpcy5kaXNwbGF5ID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmRpc3BsYXlPbmx5UHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Rpc3BsYXlPbmx5UHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnZGlzYWJsZXMgaW50ZXJhY3Rpb24gd2l0aCB0aGUgQ29tYm9Cb3ggYW5kICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAnbWFrZXMgaXQgYXBwZWFyIGxpa2UgYSBkaXNwbGF5IHRoYXQgc2hvd3MgdGhlIGN1cnJlbnQgc2VsZWN0aW9uJ1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5kaXNwbGF5T25seVByb3BlcnR5LmxpbmsoIGRpc3BsYXlPbmx5ID0+IHtcclxuICAgICAgdGhpcy5oaWRlTGlzdEJveCgpO1xyXG4gICAgICB0aGlzLmJ1dHRvbi5zZXREaXNwbGF5T25seSggZGlzcGxheU9ubHkgKTtcclxuICAgICAgdGhpcy5waWNrYWJsZSA9ICFkaXNwbGF5T25seTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZExpbmtlZEVsZW1lbnQoIHByb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VDb21ib0JveCA9ICgpID0+IHtcclxuICAgICAgbGlzdEJveE1hdHJpeFByb3BlcnR5LmRpc3Bvc2UoKTtcclxuXHJcbiAgICAgIGlmICggdGhpcy5kaXNwbGF5ICYmIHRoaXMuZGlzcGxheS5oYXNJbnB1dExpc3RlbmVyKCB0aGlzLmNsaWNrVG9EaXNtaXNzTGlzdGVuZXIgKSApIHtcclxuICAgICAgICB0aGlzLmRpc3BsYXkucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5jbGlja1RvRGlzbWlzc0xpc3RlbmVyICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIEZvY3VzTWFuYWdlci5wZG9tRm9jdXNQcm9wZXJ0eS51bmxpbmsoIHRoaXMuZGlzbWlzc1dpdGhGb2N1c0xpc3RlbmVyICk7XHJcblxyXG4gICAgICAvLyBkaXNwb3NlIG9mIHN1YmNvbXBvbmVudHNcclxuICAgICAgdGhpcy5kaXNwbGF5T25seVByb3BlcnR5LmRpc3Bvc2UoKTsgLy8gdGFuZGVtcyBtdXN0IGJlIGNsZWFuZWQgdXBcclxuICAgICAgdGhpcy5saXN0Qm94LmRpc3Bvc2UoKTtcclxuICAgICAgdGhpcy5idXR0b24uZGlzcG9zZSgpO1xyXG4gICAgICBub2Rlcy5mb3JFYWNoKCBub2RlID0+IG5vZGUuZGlzcG9zZSgpICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIHN1cHBvcnQgZm9yIGJpbmRlciBkb2N1bWVudGF0aW9uLCBzdHJpcHBlZCBvdXQgaW4gYnVpbGRzIGFuZCBvbmx5IHJ1bnMgd2hlbiA/YmluZGVyIGlzIHNwZWNpZmllZFxyXG4gICAgYXNzZXJ0ICYmIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuYmluZGVyICYmIEluc3RhbmNlUmVnaXN0cnkucmVnaXN0ZXJEYXRhVVJMKCAnc3VuJywgJ0NvbWJvQm94JywgdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VDb21ib0JveCgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2hvd3MgdGhlIGxpc3QgYm94LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzaG93TGlzdEJveCgpOiB2b2lkIHtcclxuICAgIHRoaXMubGlzdEJveC52aXNpYmxlUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGlkZXMgdGhlIGxpc3QgYm94LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBoaWRlTGlzdEJveCgpOiB2b2lkIHtcclxuICAgIHRoaXMubGlzdEJveC52aXNpYmxlUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEJlY2F1c2UgdGhlIGJ1dHRvbiBhbmQgbGlzdCBib3ggaGF2ZSBkaWZmZXJlbnQgcGFyZW50cyAoYW5kIHRoZXJlZm9yZSBkaWZmZXJlbnQgY29vcmRpbmF0ZSBmcmFtZXMpXHJcbiAgICogdGhleSBtYXkgYmUgc2NhbGVkIGRpZmZlcmVudGx5LiBUaGlzIG1ldGhvZCBzY2FsZXMgdGhlIGxpc3QgYm94IHNvIHRoYXQgaXRlbXMgb24gdGhlIGJ1dHRvbiBhbmQgaW5cclxuICAgKiB0aGUgbGlzdCBhcHBlYXIgdG8gYmUgdGhlIHNhbWUgc2l6ZS5cclxuICAgKi9cclxuICBwcml2YXRlIHNjYWxlTGlzdEJveCgpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBUbyBzdXBwb3J0IGFuIGVtcHR5IGxpc3QgYm94IGR1ZSB0byBQaEVULWlPIGN1c3RvbWl6YXRpb24sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy82MDZcclxuICAgIGlmICggIXRoaXMubGlzdEJveC5sb2NhbEJvdW5kcy5pc0VtcHR5KCkgKSB7XHJcbiAgICAgIGNvbnN0IGJ1dHRvblNjYWxlID0gdGhpcy5idXR0b24ubG9jYWxUb0dsb2JhbEJvdW5kcyggdGhpcy5idXR0b24ubG9jYWxCb3VuZHMgKS53aWR0aCAvIHRoaXMuYnV0dG9uLmxvY2FsQm91bmRzLndpZHRoO1xyXG4gICAgICBjb25zdCBsaXN0Qm94U2NhbGUgPSB0aGlzLmxpc3RCb3gubG9jYWxUb0dsb2JhbEJvdW5kcyggdGhpcy5saXN0Qm94LmxvY2FsQm91bmRzICkud2lkdGggLyB0aGlzLmxpc3RCb3gubG9jYWxCb3VuZHMud2lkdGg7XHJcbiAgICAgIHRoaXMubGlzdEJveC5zY2FsZSggYnV0dG9uU2NhbGUgLyBsaXN0Qm94U2NhbGUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHZpc2liaWxpdHkgb2YgaXRlbXMgdGhhdCBjb3JyZXNwb25kIHRvIGEgdmFsdWUuIElmIHRoZSBzZWxlY3RlZCBpdGVtIGhhcyB0aGlzIHZhbHVlLCBpdCdzIHlvdXJcclxuICAgKiByZXNwb25zaWJpbGl0eSB0byBjaGFuZ2UgdGhlIFByb3BlcnR5IHZhbHVlIHRvIHNvbWV0aGluZyBlbHNlLiBPdGhlcndpc2UsIHRoZSBjb21ibyBib3ggYnV0dG9uIHdpbGwgY29udGludWVcclxuICAgKiB0byBkaXNwbGF5IHRoaXMgdmFsdWUuXHJcbiAgICogQHBhcmFtIHZhbHVlIC0gdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgQ29tYm9Cb3hJdGVtXHJcbiAgICogQHBhcmFtIHZpc2libGVcclxuICAgKi9cclxuICBwdWJsaWMgc2V0SXRlbVZpc2libGUoIHZhbHVlOiBULCB2aXNpYmxlOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgdGhpcy5saXN0Qm94LnNldEl0ZW1WaXNpYmxlKCB2YWx1ZSwgdmlzaWJsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSXMgdGhlIGl0ZW0gdGhhdCBjb3JyZXNwb25kcyB0byBhIHZhbHVlIHZpc2libGUgd2hlbiB0aGUgbGlzdGJveCBpcyBwb3BwZWQgdXA/XHJcbiAgICogQHBhcmFtIHZhbHVlIC0gdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgQ29tYm9Cb3hJdGVtXHJcbiAgICovXHJcbiAgcHVibGljIGlzSXRlbVZpc2libGUoIHZhbHVlOiBUICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMubGlzdEJveC5pc0l0ZW1WaXNpYmxlKCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyBnZXRNYXhJdGVtV2lkdGhQcm9wZXJ0eSggbm9kZXM6IE5vZGVbXSApOiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+IHtcclxuICAgIGNvbnN0IHdpZHRoUHJvcGVydGllcyA9IF8uZmxhdHRlbiggbm9kZXMubWFwKCBub2RlID0+IHtcclxuICAgICAgY29uc3QgcHJvcGVydGllczogVFJlYWRPbmx5UHJvcGVydHk8SW50ZW50aW9uYWxBbnk+W10gPSBbIG5vZGUuYm91bmRzUHJvcGVydHkgXTtcclxuICAgICAgaWYgKCBleHRlbmRzV2lkdGhTaXphYmxlKCBub2RlICkgKSB7XHJcbiAgICAgICAgcHJvcGVydGllcy5wdXNoKCBub2RlLmlzV2lkdGhSZXNpemFibGVQcm9wZXJ0eSApO1xyXG4gICAgICAgIHByb3BlcnRpZXMucHVzaCggbm9kZS5taW5pbXVtV2lkdGhQcm9wZXJ0eSApO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBwcm9wZXJ0aWVzO1xyXG4gICAgfSApICk7XHJcbiAgICByZXR1cm4gRGVyaXZlZFByb3BlcnR5LmRlcml2ZUFueSggd2lkdGhQcm9wZXJ0aWVzLCAoKSA9PiB7XHJcbiAgICAgIHJldHVybiBNYXRoLm1heCggLi4ubm9kZXMubWFwKCBub2RlID0+IGlzV2lkdGhTaXphYmxlKCBub2RlICkgPyBub2RlLm1pbmltdW1XaWR0aCB8fCAwIDogbm9kZS53aWR0aCApICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIGdldE1heEl0ZW1IZWlnaHRQcm9wZXJ0eSggbm9kZXM6IE5vZGVbXSApOiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+IHtcclxuICAgIGNvbnN0IGhlaWdodFByb3BlcnRpZXMgPSBub2Rlcy5tYXAoIG5vZGUgPT4gbm9kZS5ib3VuZHNQcm9wZXJ0eSApO1xyXG4gICAgcmV0dXJuIERlcml2ZWRQcm9wZXJ0eS5kZXJpdmVBbnkoIGhlaWdodFByb3BlcnRpZXMsICgpID0+IHtcclxuICAgICAgcmV0dXJuIE1hdGgubWF4KCAuLi5ub2Rlcy5tYXAoIG5vZGUgPT4gbm9kZS5oZWlnaHQgKSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyBDb21ib0JveElPID0gbmV3IElPVHlwZSggJ0NvbWJvQm94SU8nLCB7XHJcbiAgICB2YWx1ZVR5cGU6IENvbWJvQm94LFxyXG4gICAgZG9jdW1lbnRhdGlvbjogJ0EgY29tYm8gYm94IGlzIGNvbXBvc2VkIG9mIGEgcHVzaCBidXR0b24gYW5kIGEgbGlzdGJveC4gVGhlIGxpc3Rib3ggY29udGFpbnMgaXRlbXMgdGhhdCByZXByZXNlbnQgJyArXHJcbiAgICAgICAgICAgICAgICAgICAnY2hvaWNlcy4gUHJlc3NpbmcgdGhlIGJ1dHRvbiBwb3BzIHVwIHRoZSBsaXN0Ym94LiBTZWxlY3RpbmcgZnJvbSBhbiBpdGVtIGluIHRoZSBsaXN0Ym94IHNldHMgdGhlICcgK1xyXG4gICAgICAgICAgICAgICAgICAgJ3ZhbHVlIG9mIGFuIGFzc29jaWF0ZWQgUHJvcGVydHkuIFRoZSBidXR0b24gc2hvd3MgdGhlIGl0ZW0gdGhhdCBpcyBjdXJyZW50bHkgc2VsZWN0ZWQuJyxcclxuICAgIHN1cGVydHlwZTogTm9kZS5Ob2RlSU8sXHJcbiAgICBldmVudHM6IFsgJ2xpc3RCb3hTaG93bicsICdsaXN0Qm94SGlkZGVuJyBdXHJcbiAgfSApO1xyXG59XHJcblxyXG5zdW4ucmVnaXN0ZXIoICdDb21ib0JveCcsIENvbWJvQm94ICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sa0NBQWtDO0FBRTlELE9BQU9DLFNBQVMsTUFBTSwyQkFBMkI7QUFDakQsT0FBT0MsZ0JBQWdCLE1BQU0sc0RBQXNEO0FBQ25GLE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsU0FBa0JDLG1CQUFtQixFQUFTQyxZQUFZLEVBQUVDLGNBQWMsRUFBRUMscUJBQXFCLEVBQUVDLElBQUksRUFBcUNDLFFBQVEsRUFBaURDLFlBQVksUUFBNkIsNkJBQTZCO0FBRTNRLE9BQU9DLHVCQUF1QixNQUFNLGdFQUFnRTtBQUNwRyxPQUFPQyxzQkFBc0IsTUFBTSwrREFBK0Q7QUFDbEcsT0FBT0MsU0FBUyxNQUFNLDhCQUE4QjtBQUNwRCxPQUFPQyxNQUFNLE1BQU0sMkJBQTJCO0FBQzlDLE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsY0FBYyxNQUFNLHFCQUFxQjtBQUNoRCxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBQ2xELE9BQU9DLEdBQUcsTUFBTSxVQUFVO0FBQzFCLE9BQU9DLFlBQVksTUFBTSxtQkFBbUI7QUFDNUMsT0FBT0MsZUFBZSxNQUFNLGtDQUFrQztBQUs5RCxTQUEyQkMsaUJBQWlCLFFBQVEsdUJBQXVCO0FBQzNFLE9BQU9DLFNBQVMsTUFBTSw0QkFBNEI7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