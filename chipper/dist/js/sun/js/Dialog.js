// Copyright 2018-2023, University of Colorado Boulder

/**
 * General dialog type. Migrated from Joist on 4/10/2018
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrea Lin (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../axon/js/Multilink.js';
import ScreenView from '../../joist/js/ScreenView.js';
import getGlobal from '../../phet-core/js/getGlobal.js';
import optionize from '../../phet-core/js/optionize.js';
import CloseButton from '../../scenery-phet/js/buttons/CloseButton.js';
import { AlignBox, FocusManager, FullScreen, HBox, KeyboardUtils, Node, PDOMPeer, PDOMUtils, VBox, voicingManager } from '../../scenery/js/imports.js';
import generalCloseSoundPlayer from '../../tambo/js/shared-sound-players/generalCloseSoundPlayer.js';
import generalOpenSoundPlayer from '../../tambo/js/shared-sound-players/generalOpenSoundPlayer.js';
import nullSoundPlayer from '../../tambo/js/shared-sound-players/nullSoundPlayer.js';
import Tandem from '../../tandem/js/Tandem.js';
import DynamicMarkerIO from '../../tandem/js/types/DynamicMarkerIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import Utterance from '../../utterance-queue/js/Utterance.js';
import ButtonNode from './buttons/ButtonNode.js';
import Panel from './Panel.js';
import Popupable from './Popupable.js';
import sun from './sun.js';
import SunStrings from './SunStrings.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import PatternStringProperty from '../../axon/js/PatternStringProperty.js';

// see SelfOptions.titleAlign

/**
 * see SelfOptions.layoutStrategy
 * @param dialog
 * @param simBounds - see Sim.boundsProperty
 * @param screenBounds - see Sim.screenBoundsProperty
 * @param scale - see Sim.scaleProperty
 */

export default class Dialog extends Popupable(Panel, 1) {
  /**
   * @param content - The content to display inside the dialog (not including the title)
   * @param providedOptions
   */
  constructor(content, providedOptions) {
    const options = optionize()({
      // DialogOptions
      xSpacing: 10,
      ySpacing: 10,
      topMargin: 15,
      bottomMargin: 15,
      leftMargin: null,
      maxWidthMargin: 12,
      maxHeightMargin: 12,
      closeButtonLength: 18.2,
      closeButtonTopMargin: 10,
      closeButtonRightMargin: 10,
      title: null,
      titleAlign: 'center',
      addAriaLabelledByFromTitle: true,
      layoutStrategy: defaultLayoutStrategy,
      closeButtonListener: () => this.hide(),
      closeButtonColor: 'black',
      closeButtonTouchAreaXDilation: 0,
      closeButtonTouchAreaYDilation: 0,
      closeButtonMouseAreaXDilation: 0,
      closeButtonMouseAreaYDilation: 0,
      closeButtonVoicingDialogTitle: null,
      closeButtonLastInPDOM: false,
      openedSoundPlayer: generalOpenSoundPlayer,
      closedSoundPlayer: generalCloseSoundPlayer,
      sim: getGlobal('phet.joist.sim'),
      showCallback: null,
      hideCallback: null,
      // PopupableOptions
      layoutBounds: ScreenView.DEFAULT_LAYOUT_BOUNDS,
      focusOnShowNode: null,
      // PanelOptions
      cornerRadius: 10,
      // {number} radius of the dialog's corners
      resize: true,
      // {boolean} whether to resize if content's size changes
      fill: 'white',
      // {string|Color}
      stroke: 'black',
      // {string|Color}
      backgroundPickable: true,
      maxHeight: null,
      // if not provided, then dynamically calculate based on the layoutBounds of the current screen, see updateLayoutMultilink
      maxWidth: null,
      // if not provided, then dynamically calculate based on the layoutBounds of the current screen, see updateLayoutMultilink

      // phet-io
      tandem: Tandem.OPTIONAL,
      phetioType: Dialog.DialogIO,
      phetioState: true,
      // Dialog is often a dynamic element, and thus needs to be in state to trigger element creation.
      phetioVisiblePropertyInstrumented: false,
      // visible isn't toggled when showing a Dialog

      // pdom options
      tagName: 'div',
      ariaRole: 'dialog'
    }, providedOptions);
    assert && assert(options.sim, 'sim must be provided, as Dialog needs a Sim instance');
    assert && assert(options.xMargin === undefined, 'Dialog sets xMargin');
    options.xMargin = 0;
    assert && assert(options.yMargin === undefined, 'Dialog sets yMargin');
    options.yMargin = 0;

    // if left margin is specified in options, use it. otherwise, set it to make the left right gutters symmetrical
    if (options.leftMargin === null) {
      options.leftMargin = options.xSpacing + options.closeButtonLength + options.closeButtonRightMargin;
    }
    assert && assert(options.maxHeight === null || typeof options.maxHeight === 'number');
    assert && assert(options.maxWidth === null || typeof options.maxWidth === 'number');

    // Apply maxWidth/maxHeight depending on the margins and layoutBounds
    if (!options.maxWidth && options.layoutBounds) {
      options.maxWidth = applyDoubleMargin(options.layoutBounds.width, options.maxWidthMargin);
    }
    if (!options.maxHeight && options.layoutBounds) {
      options.maxHeight = applyDoubleMargin(options.layoutBounds.height, options.maxHeightMargin);
    }

    // We need an "unattached" utterance so that when the close button fires, hiding the close button, we still hear
    // the context response. But we still should only hear this context response when "Sim Voicing" is enabled.
    const contextResponseUtterance = new Utterance({
      priority: Utterance.MEDIUM_PRIORITY,
      voicingCanAnnounceProperties: [voicingManager.voicingFullyEnabledProperty]
    });

    // create close button - a flat "X"
    const closeButton = new CloseButton({
      iconLength: options.closeButtonLength,
      baseColor: 'transparent',
      buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
      // no margins since the flat X takes up all the space
      xMargin: 0,
      yMargin: 0,
      listener: () => {
        // Context response first, before potentially changing focus with the callback listener
        closeButton.voicingSpeakContextResponse({
          utterance: contextResponseUtterance
        });
        options.closeButtonListener();
      },
      pathOptions: {
        stroke: options.closeButtonColor
      },
      // phet-io
      tandem: options.tandem.createTandem('closeButton'),
      phetioState: false,
      // close button should not be in state

      // It is a usability concern to change either of these, also there are other ways to exit a Dialog, so using
      // these is buggy.
      phetioVisiblePropertyInstrumented: false,
      phetioEnabledPropertyInstrumented: false,
      // turn off default sound generation, Dialog will create its own sounds
      soundPlayer: nullSoundPlayer,
      // pdom
      tagName: 'button',
      innerContent: SunStrings.a11y.closeStringProperty,
      // voicing
      voicingContextResponse: SunStrings.a11y.closedStringProperty
    });
    let closeButtonVoicingNameResponseProperty;
    if (options.closeButtonVoicingDialogTitle) {
      const titleProperty = typeof options.closeButtonVoicingDialogTitle === 'string' ? new TinyProperty(options.closeButtonVoicingDialogTitle) : options.closeButtonVoicingDialogTitle;
      closeButtonVoicingNameResponseProperty = closeButton.voicingNameResponse = new PatternStringProperty(SunStrings.a11y.titleClosePatternStringProperty, {
        title: titleProperty
      });
    }

    // touch/mouse areas for the close button
    closeButton.touchArea = closeButton.bounds.dilatedXY(options.closeButtonTouchAreaXDilation, options.closeButtonTouchAreaYDilation);
    closeButton.mouseArea = closeButton.bounds.dilatedXY(options.closeButtonMouseAreaXDilation, options.closeButtonMouseAreaYDilation);

    // pdom - set the order of content, close button first so remaining content can be read from top to bottom
    // with virtual cursor
    let pdomOrder = [options.title, content];
    options.closeButtonLastInPDOM ? pdomOrder.push(closeButton) : pdomOrder.unshift(closeButton);
    pdomOrder = pdomOrder.filter(node => node !== undefined && node !== null);

    // pdom - fall back to focusing the closeButton by default if there is no focusOnShowNode or the
    // content is not focusable
    assert && assert(pdomOrder[0]);
    options.focusOnShowNode = options.focusOnShowNode ? options.focusOnShowNode : pdomOrder[0].focusable ? pdomOrder[0] : closeButton;
    assert && assert(options.focusOnShowNode instanceof Node, 'should be non-null and defined');
    assert && assert(options.focusOnShowNode.focusable, 'focusOnShowNode must be focusable.');

    // Align content, title, and close button using spacing and margin options

    // align content and title (if provided) vertically
    const contentAndTitle = new VBox({
      children: options.title ? [options.title, content] : [content],
      spacing: options.ySpacing,
      align: options.titleAlign
    });

    // add topMargin, bottomMargin, and leftMargin
    const contentAndTitleWithMargins = new AlignBox(contentAndTitle, {
      topMargin: options.topMargin,
      bottomMargin: options.bottomMargin,
      leftMargin: options.leftMargin
    });

    // add closeButtonTopMargin and closeButtonRightMargin
    const closeButtonWithMargins = new AlignBox(closeButton, {
      topMargin: options.closeButtonTopMargin,
      rightMargin: options.closeButtonRightMargin
    });

    // create content for Panel
    const dialogContent = new HBox({
      children: [contentAndTitleWithMargins, closeButtonWithMargins],
      spacing: options.xSpacing,
      align: 'top'
    });
    super(dialogContent, options);

    // The Dialog's display runs on this Property, so add the listener that controls show/hide.
    this.isShowingProperty.lazyLink(isShowing => {
      if (isShowing) {
        // sound generation
        options.openedSoundPlayer.play();

        // Do this last
        options.showCallback && options.showCallback();
      } else {
        // sound generation
        options.closedSoundPlayer.play();

        // Do this last
        options.hideCallback && options.hideCallback();
      }
    });
    this.sim = options.sim;
    this.closeButton = closeButton;
    const updateLayoutMultilink = Multilink.multilink([this.sim.boundsProperty, this.sim.screenBoundsProperty, this.sim.scaleProperty, this.sim.selectedScreenProperty, this.isShowingProperty, this.localBoundsProperty], (bounds, screenBounds, scale) => {
      if (bounds && screenBounds && scale) {
        options.layoutStrategy(this, bounds, screenBounds, scale);
      }
    });

    // Setter after the super call
    this.pdomOrder = pdomOrder;

    // pdom - set the aria-labelledby relation so that whenever focus enters the dialog the title is read
    if (options.title && options.title.tagName && options.addAriaLabelledByFromTitle) {
      this.addAriaLabelledbyAssociation({
        thisElementName: PDOMPeer.PRIMARY_SIBLING,
        otherNode: options.title,
        otherElementName: PDOMPeer.PRIMARY_SIBLING
      });
    }

    // pdom - close the dialog when pressing "escape"
    const escapeListener = {
      keydown: event => {
        const domEvent = event.domEvent; // {DOMEvent|null}

        if (KeyboardUtils.isKeyEvent(event.domEvent, KeyboardUtils.KEY_ESCAPE)) {
          assert && assert(domEvent);
          domEvent.preventDefault();
          this.hide();
        } else if (KeyboardUtils.isKeyEvent(event.domEvent, KeyboardUtils.KEY_TAB) && FullScreen.isFullScreen()) {
          // prevent a particular bug in Windows 7/8.1 Firefox where focus gets trapped in the document
          // when the navigation bar is hidden and there is only one focusable element in the DOM
          // see https://bugzilla.mozilla.org/show_bug.cgi?id=910136
          assert && assert(FocusManager.pdomFocus); // {Focus|null}
          const activeId = FocusManager.pdomFocus.trail.getUniqueId();
          const noNextFocusable = PDOMUtils.getNextFocusable().id === activeId;
          const noPreviousFocusable = PDOMUtils.getPreviousFocusable().id === activeId;
          if (noNextFocusable && noPreviousFocusable) {
            assert && assert(domEvent);
            domEvent.preventDefault();
          }
        }
      }
    };
    this.addInputListener(escapeListener);
    this.disposeDialog = () => {
      updateLayoutMultilink.dispose();
      closeButtonWithMargins.dispose();
      this.removeInputListener(escapeListener);
      closeButtonVoicingNameResponseProperty && closeButtonVoicingNameResponseProperty.dispose();
      closeButton.dispose();
      contextResponseUtterance.dispose();
      contentAndTitle.dispose();

      // remove dialog content from scene graph, but don't dispose because Panel
      // needs to remove listeners on the content in its dispose()
      dialogContent.removeAllChildren();
      dialogContent.detach();
    };
  }
  dispose() {
    this.disposeDialog();
    super.dispose();
  }
  static DialogIO = new IOType('DialogIO', {
    valueType: Dialog,
    // Since many Dialogs are dynamic elements, these need to be in the state. The value of the state object doesn't
    // matter, but it instead just serves as a marker to tell the state engine to recreate the Dialog (if dynamic) when
    // setting state.
    supertype: DynamicMarkerIO
  });
}

// Default value for options.layoutStrategy, centers the Dialog in the layoutBounds.
function defaultLayoutStrategy(dialog, simBounds, screenBounds, scale) {
  if (dialog.layoutBounds) {
    dialog.center = dialog.layoutBounds.center;
  }
}

/**
 * @param dimension - width or height dimension
 * @param margin - margin to be applied to the dimension
 */
function applyDoubleMargin(dimension, margin) {
  return dimension > margin * 2 ? dimension - margin * 2 : dimension;
}
sun.register('Dialog', Dialog);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJTY3JlZW5WaWV3IiwiZ2V0R2xvYmFsIiwib3B0aW9uaXplIiwiQ2xvc2VCdXR0b24iLCJBbGlnbkJveCIsIkZvY3VzTWFuYWdlciIsIkZ1bGxTY3JlZW4iLCJIQm94IiwiS2V5Ym9hcmRVdGlscyIsIk5vZGUiLCJQRE9NUGVlciIsIlBET01VdGlscyIsIlZCb3giLCJ2b2ljaW5nTWFuYWdlciIsImdlbmVyYWxDbG9zZVNvdW5kUGxheWVyIiwiZ2VuZXJhbE9wZW5Tb3VuZFBsYXllciIsIm51bGxTb3VuZFBsYXllciIsIlRhbmRlbSIsIkR5bmFtaWNNYXJrZXJJTyIsIklPVHlwZSIsIlV0dGVyYW5jZSIsIkJ1dHRvbk5vZGUiLCJQYW5lbCIsIlBvcHVwYWJsZSIsInN1biIsIlN1blN0cmluZ3MiLCJUaW55UHJvcGVydHkiLCJQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJEaWFsb2ciLCJjb25zdHJ1Y3RvciIsImNvbnRlbnQiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwieFNwYWNpbmciLCJ5U3BhY2luZyIsInRvcE1hcmdpbiIsImJvdHRvbU1hcmdpbiIsImxlZnRNYXJnaW4iLCJtYXhXaWR0aE1hcmdpbiIsIm1heEhlaWdodE1hcmdpbiIsImNsb3NlQnV0dG9uTGVuZ3RoIiwiY2xvc2VCdXR0b25Ub3BNYXJnaW4iLCJjbG9zZUJ1dHRvblJpZ2h0TWFyZ2luIiwidGl0bGUiLCJ0aXRsZUFsaWduIiwiYWRkQXJpYUxhYmVsbGVkQnlGcm9tVGl0bGUiLCJsYXlvdXRTdHJhdGVneSIsImRlZmF1bHRMYXlvdXRTdHJhdGVneSIsImNsb3NlQnV0dG9uTGlzdGVuZXIiLCJoaWRlIiwiY2xvc2VCdXR0b25Db2xvciIsImNsb3NlQnV0dG9uVG91Y2hBcmVhWERpbGF0aW9uIiwiY2xvc2VCdXR0b25Ub3VjaEFyZWFZRGlsYXRpb24iLCJjbG9zZUJ1dHRvbk1vdXNlQXJlYVhEaWxhdGlvbiIsImNsb3NlQnV0dG9uTW91c2VBcmVhWURpbGF0aW9uIiwiY2xvc2VCdXR0b25Wb2ljaW5nRGlhbG9nVGl0bGUiLCJjbG9zZUJ1dHRvbkxhc3RJblBET00iLCJvcGVuZWRTb3VuZFBsYXllciIsImNsb3NlZFNvdW5kUGxheWVyIiwic2ltIiwic2hvd0NhbGxiYWNrIiwiaGlkZUNhbGxiYWNrIiwibGF5b3V0Qm91bmRzIiwiREVGQVVMVF9MQVlPVVRfQk9VTkRTIiwiZm9jdXNPblNob3dOb2RlIiwiY29ybmVyUmFkaXVzIiwicmVzaXplIiwiZmlsbCIsInN0cm9rZSIsImJhY2tncm91bmRQaWNrYWJsZSIsIm1heEhlaWdodCIsIm1heFdpZHRoIiwidGFuZGVtIiwiT1BUSU9OQUwiLCJwaGV0aW9UeXBlIiwiRGlhbG9nSU8iLCJwaGV0aW9TdGF0ZSIsInBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCIsInRhZ05hbWUiLCJhcmlhUm9sZSIsImFzc2VydCIsInhNYXJnaW4iLCJ1bmRlZmluZWQiLCJ5TWFyZ2luIiwiYXBwbHlEb3VibGVNYXJnaW4iLCJ3aWR0aCIsImhlaWdodCIsImNvbnRleHRSZXNwb25zZVV0dGVyYW5jZSIsInByaW9yaXR5IiwiTUVESVVNX1BSSU9SSVRZIiwidm9pY2luZ0NhbkFubm91bmNlUHJvcGVydGllcyIsInZvaWNpbmdGdWxseUVuYWJsZWRQcm9wZXJ0eSIsImNsb3NlQnV0dG9uIiwiaWNvbkxlbmd0aCIsImJhc2VDb2xvciIsImJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneSIsIkZsYXRBcHBlYXJhbmNlU3RyYXRlZ3kiLCJsaXN0ZW5lciIsInZvaWNpbmdTcGVha0NvbnRleHRSZXNwb25zZSIsInV0dGVyYW5jZSIsInBhdGhPcHRpb25zIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwic291bmRQbGF5ZXIiLCJpbm5lckNvbnRlbnQiLCJhMTF5IiwiY2xvc2VTdHJpbmdQcm9wZXJ0eSIsInZvaWNpbmdDb250ZXh0UmVzcG9uc2UiLCJjbG9zZWRTdHJpbmdQcm9wZXJ0eSIsImNsb3NlQnV0dG9uVm9pY2luZ05hbWVSZXNwb25zZVByb3BlcnR5IiwidGl0bGVQcm9wZXJ0eSIsInZvaWNpbmdOYW1lUmVzcG9uc2UiLCJ0aXRsZUNsb3NlUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwidG91Y2hBcmVhIiwiYm91bmRzIiwiZGlsYXRlZFhZIiwibW91c2VBcmVhIiwicGRvbU9yZGVyIiwicHVzaCIsInVuc2hpZnQiLCJmaWx0ZXIiLCJub2RlIiwiZm9jdXNhYmxlIiwiY29udGVudEFuZFRpdGxlIiwiY2hpbGRyZW4iLCJzcGFjaW5nIiwiYWxpZ24iLCJjb250ZW50QW5kVGl0bGVXaXRoTWFyZ2lucyIsImNsb3NlQnV0dG9uV2l0aE1hcmdpbnMiLCJyaWdodE1hcmdpbiIsImRpYWxvZ0NvbnRlbnQiLCJpc1Nob3dpbmdQcm9wZXJ0eSIsImxhenlMaW5rIiwiaXNTaG93aW5nIiwicGxheSIsInVwZGF0ZUxheW91dE11bHRpbGluayIsIm11bHRpbGluayIsImJvdW5kc1Byb3BlcnR5Iiwic2NyZWVuQm91bmRzUHJvcGVydHkiLCJzY2FsZVByb3BlcnR5Iiwic2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eSIsImxvY2FsQm91bmRzUHJvcGVydHkiLCJzY3JlZW5Cb3VuZHMiLCJzY2FsZSIsImFkZEFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb24iLCJ0aGlzRWxlbWVudE5hbWUiLCJQUklNQVJZX1NJQkxJTkciLCJvdGhlck5vZGUiLCJvdGhlckVsZW1lbnROYW1lIiwiZXNjYXBlTGlzdGVuZXIiLCJrZXlkb3duIiwiZXZlbnQiLCJkb21FdmVudCIsImlzS2V5RXZlbnQiLCJLRVlfRVNDQVBFIiwicHJldmVudERlZmF1bHQiLCJLRVlfVEFCIiwiaXNGdWxsU2NyZWVuIiwicGRvbUZvY3VzIiwiYWN0aXZlSWQiLCJ0cmFpbCIsImdldFVuaXF1ZUlkIiwibm9OZXh0Rm9jdXNhYmxlIiwiZ2V0TmV4dEZvY3VzYWJsZSIsImlkIiwibm9QcmV2aW91c0ZvY3VzYWJsZSIsImdldFByZXZpb3VzRm9jdXNhYmxlIiwiYWRkSW5wdXRMaXN0ZW5lciIsImRpc3Bvc2VEaWFsb2ciLCJkaXNwb3NlIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsInJlbW92ZUFsbENoaWxkcmVuIiwiZGV0YWNoIiwidmFsdWVUeXBlIiwic3VwZXJ0eXBlIiwiZGlhbG9nIiwic2ltQm91bmRzIiwiY2VudGVyIiwiZGltZW5zaW9uIiwibWFyZ2luIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEaWFsb2cudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR2VuZXJhbCBkaWFsb2cgdHlwZS4gTWlncmF0ZWQgZnJvbSBKb2lzdCBvbiA0LzEwLzIwMThcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBBbmRyZWEgTGluIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgU2ltIGZyb20gJy4uLy4uL2pvaXN0L2pzL1NpbS5qcyc7XHJcbmltcG9ydCBnZXRHbG9iYWwgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2dldEdsb2JhbC5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IENsb3NlQnV0dG9uIGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL0Nsb3NlQnV0dG9uLmpzJztcclxuaW1wb3J0IHsgQWxpZ25Cb3gsIEZvY3VzTWFuYWdlciwgRnVsbFNjcmVlbiwgSEJveCwgS2V5Ym9hcmRVdGlscywgTm9kZSwgUERPTVBlZXIsIFBET01VdGlscywgVENvbG9yLCBUSW5wdXRMaXN0ZW5lciwgVkJveCwgdm9pY2luZ01hbmFnZXIgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVFNvdW5kUGxheWVyIGZyb20gJy4uLy4uL3RhbWJvL2pzL1RTb3VuZFBsYXllci5qcyc7XHJcbmltcG9ydCBnZW5lcmFsQ2xvc2VTb3VuZFBsYXllciBmcm9tICcuLi8uLi90YW1iby9qcy9zaGFyZWQtc291bmQtcGxheWVycy9nZW5lcmFsQ2xvc2VTb3VuZFBsYXllci5qcyc7XHJcbmltcG9ydCBnZW5lcmFsT3BlblNvdW5kUGxheWVyIGZyb20gJy4uLy4uL3RhbWJvL2pzL3NoYXJlZC1zb3VuZC1wbGF5ZXJzL2dlbmVyYWxPcGVuU291bmRQbGF5ZXIuanMnO1xyXG5pbXBvcnQgbnVsbFNvdW5kUGxheWVyIGZyb20gJy4uLy4uL3RhbWJvL2pzL3NoYXJlZC1zb3VuZC1wbGF5ZXJzL251bGxTb3VuZFBsYXllci5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBEeW5hbWljTWFya2VySU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0R5bmFtaWNNYXJrZXJJTy5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBVdHRlcmFuY2UgZnJvbSAnLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL1V0dGVyYW5jZS5qcyc7XHJcbmltcG9ydCBCdXR0b25Ob2RlIGZyb20gJy4vYnV0dG9ucy9CdXR0b25Ob2RlLmpzJztcclxuaW1wb3J0IFBhbmVsLCB7IFBhbmVsT3B0aW9ucyB9IGZyb20gJy4vUGFuZWwuanMnO1xyXG5pbXBvcnQgUG9wdXBhYmxlLCB7IFBvcHVwYWJsZU9wdGlvbnMgfSBmcm9tICcuL1BvcHVwYWJsZS5qcyc7XHJcbmltcG9ydCBzdW4gZnJvbSAnLi9zdW4uanMnO1xyXG5pbXBvcnQgU3VuU3RyaW5ncyBmcm9tICcuL1N1blN0cmluZ3MuanMnO1xyXG5pbXBvcnQgVGlueVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVGlueVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUGF0dGVyblN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUGF0dGVyblN0cmluZ1Byb3BlcnR5LmpzJztcclxuXHJcbi8vIHNlZSBTZWxmT3B0aW9ucy50aXRsZUFsaWduXHJcbnR5cGUgRGlhbG9nVGl0bGVBbGlnbiA9ICdsZWZ0JyB8ICdyaWdodCcgfCAnY2VudGVyJztcclxuXHJcbi8qKlxyXG4gKiBzZWUgU2VsZk9wdGlvbnMubGF5b3V0U3RyYXRlZ3lcclxuICogQHBhcmFtIGRpYWxvZ1xyXG4gKiBAcGFyYW0gc2ltQm91bmRzIC0gc2VlIFNpbS5ib3VuZHNQcm9wZXJ0eVxyXG4gKiBAcGFyYW0gc2NyZWVuQm91bmRzIC0gc2VlIFNpbS5zY3JlZW5Cb3VuZHNQcm9wZXJ0eVxyXG4gKiBAcGFyYW0gc2NhbGUgLSBzZWUgU2ltLnNjYWxlUHJvcGVydHlcclxuICovXHJcbnR5cGUgRGlhbG9nTGF5b3V0U3RyYXRlZ3kgPSAoIGRpYWxvZzogRGlhbG9nLCBzaW1Cb3VuZHM6IEJvdW5kczIsIHNjcmVlbkJvdW5kczogQm91bmRzMiwgc2NhbGU6IG51bWJlciApID0+IHZvaWQ7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG5cclxuICAvKiBNYXJnaW5zIGFuZCBzcGFjaW5nOlxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4SGVpZ2h0TWFyZ2luXHJcbiAgX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1xyXG4gIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgfFxyXG4gIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VCdXR0b24gfFxyXG4gIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wTWFyZ2luICAgICAgICAgICAgICAgICAgVG9wTWFyZ2luICAgfFxyXG4gIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICBffF9fXyAgICAgICAgfFxyXG4gIHwgICAgICAgICAgICAgICAgICBfX19fX19fX19fX19fX19fX19ffF9fX19fX19fX19fX19fX19fX19fICAgIHwgICAgIHwgICAgICAgfFxyXG5tIHwtLS0tLS0tLWwtLS0tLS0tLXwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfC14LXwgIFggIHwtLS1jLS0tfCBtXHJcbmEgfCAgICAgICAgZSAgICAgICAgfCAgIFRpdGxlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFMgfF9fX19ffCAgIGwgICB8IGFcclxueCB8ICAgICAgICBmICAgICAgICB8X19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX3wgUCAgICAgICAgICAgbyAgIHwgeFxyXG5XIHwgICAgICAgIHQgICAgICAgIHwgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBhICAgICAgICAgICBzICAgfCBXXHJcbmkgfCAgICAgICAgTSAgICAgICAgfCAgIHlTcGFjaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGMgICAgICAgICAgIGUgICB8IGlcclxuZCB8ICAgICAgICBhICAgICAgICB8X19ffF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX3wgaSAgICAgICAgICAgQiAgIHwgZFxyXG50IHwgICAgICAgIHIgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBuICAgICAgICAgICB1ICAgfCB0XHJcbmggfCAgICAgICAgZyAgICAgICAgfCAgIENvbnRlbnQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGcgICAgICAgICAgIHQgICB8IGhcclxuTSB8ICAgICAgICBpICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgdCAgIHwgTVxyXG5hIHwgICAgICAgIG4gICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICBvICAgfCBhXHJcbnIgfCAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgIG4gICB8IHJcclxuZyB8ICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgUiAgIHwgZ1xyXG5pIHwgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICBpICAgfCBpXHJcbm4gfCAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgIGcgICB8IG5cclxuICB8ICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgaCAgIHxcclxuICB8ICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgTSAgIHxcclxuICB8ICAgICAgICAgICAgICAgICB8X19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX3wgICAgICAgICAgICAgYSAgIHxcclxuICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgciAgIHxcclxuICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZyAgIHxcclxuICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbU1hcmdpbiAgICAgICAgICAgICAgICAgICAgICAgaSAgIHxcclxuICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbiAgIHxcclxuICB8X19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX3xfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX3xcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhIZWlnaHRNYXJnaW5cclxuICovXHJcblxyXG4gIC8vIE1hcmdpbnMgYW5kIHNwYWNpbmdcclxuICB4U3BhY2luZz86IG51bWJlcjsgLy8gaG93IGZhciB0aGUgdGl0bGUgYW5kIGNvbnRlbnQgaXMgcGxhY2VkIHRvIHRoZSBsZWZ0IG9mIHRoZSBjbG9zZSBidXR0b25cclxuICB5U3BhY2luZz86IG51bWJlcjsgLy8gdmVydGljYWwgc3BhY2UgYmV0d2VlbiB0aXRsZSBhbmQgY29udGVudFxyXG4gIHRvcE1hcmdpbj86IG51bWJlcjsgLy8gbWFyZ2luIGFib3ZlIGNvbnRlbnQsIG9yIGFib3ZlIHRpdGxlIGlmIHByb3ZpZGVkXHJcbiAgYm90dG9tTWFyZ2luPzogbnVtYmVyOyAvLyBtYXJnaW4gYmVsb3cgY29udGVudFxyXG4gIGxlZnRNYXJnaW4/OiBudW1iZXIgfCBudWxsOyAvLyBtYXJnaW4gdG8gdGhlIGxlZnQgb2YgdGhlIGNvbnRlbnQuICBJZiBudWxsLCB0aGlzIGlzIGNvbXB1dGVkIHNvIHRoYXQgd2UgaGF2ZSB0aGUgc2FtZSBtYXJnaW5zIG9uIHRoZSBsZWZ0IGFuZCByaWdodCBvZiB0aGUgY29udGVudC5cclxuICBtYXhXaWR0aE1hcmdpbj86IG51bWJlcjsgLy8gdGhlIG1hcmdpbiBiZXR3ZWVuIHRoZSBsZWZ0L3JpZ2h0IG9mIHRoZSBsYXlvdXRCb3VuZHMgYW5kIHRoZSBkaWFsb2csIGlnbm9yZWQgaWYgbWF4V2lkdGggaXMgc3BlY2lmaWVkXHJcbiAgbWF4SGVpZ2h0TWFyZ2luPzogbnVtYmVyOyAvLyB0aGUgbWFyZ2luIGJldHdlZW4gdGhlIHRvcC9ib3R0b20gb2YgdGhlIGxheW91dEJvdW5kcyBhbmQgdGhlIGRpYWxvZywgaWdub3JlZCBpZiBtYXhIZWlnaHQgaXMgc3BlY2lmaWVkXHJcbiAgY2xvc2VCdXR0b25MZW5ndGg/OiBudW1iZXI7IC8vIHdpZHRoIG9mIHRoZSBjbG9zZSBidXR0b25cclxuICBjbG9zZUJ1dHRvblRvcE1hcmdpbj86IG51bWJlcjsgLy8gbWFyZ2luIGFib3ZlIHRoZSBjbG9zZSBidXR0b25cclxuICBjbG9zZUJ1dHRvblJpZ2h0TWFyZ2luPzogbnVtYmVyOyAvLyBtYXJnaW4gdG8gdGhlIHJpZ2h0IG9mIHRoZSBjbG9zZSBidXR0b25cclxuXHJcbiAgLy8gdGl0bGVcclxuICB0aXRsZT86IE5vZGUgfCBudWxsOyAvLyBUaXRsZSB0byBiZSBkaXNwbGF5ZWQgYXQgdG9wLiBGb3IgYTExeSwgaXRzIHByaW1hcnkgc2libGluZyBtdXN0IGhhdmUgYW4gYWNjZXNzaWJsZSBuYW1lLlxyXG4gIHRpdGxlQWxpZ24/OiBEaWFsb2dUaXRsZUFsaWduOyAvLyBob3Jpem9udGFsIGFsaWdubWVudFxyXG5cclxuICAvLyBCeSBkZWZhdWx0LCB0aGUgYWNjZXNzaWJsZSBuYW1lIG9mIHRoaXMgZGlhbG9nIGlzIHRoZSBjb250ZW50IG9mIHRoZSB0aXRsZS4gU29tZSBkaWFsb2dzIHdhbnQgdG8gb3B0IG91dFxyXG4gIC8vIG9mIHByb3ZpZGluZyB0aGUgZGVmYXVsdCBhY2Nlc3NpYmxlIG5hbWUgZm9yIHRoZSBkaWFsb2csIG9wdGluZyB0byBpbnN0ZWFkIG1hbmFnZSB0aGUgYWNjZXNzaWJsZSBuYW1lXHJcbiAgLy8gdGhlbXNlbHZlcywgZm9yIGV4YW1wbGUgc2VlIEtleWJvYXJkSGVscERpYWxvZyBhbmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvNDk0XHJcbiAgYWRkQXJpYUxhYmVsbGVkQnlGcm9tVGl0bGU/OiBib29sZWFuO1xyXG5cclxuICAvLyBTZXRzIHRoZSBkaWFsb2cncyBwb3NpdGlvbiBpbiBnbG9iYWwgY29vcmRpbmF0ZXMuXHJcbiAgbGF5b3V0U3RyYXRlZ3k/OiBEaWFsb2dMYXlvdXRTdHJhdGVneTtcclxuXHJcbiAgLy8gY2xvc2UgYnV0dG9uIG9wdGlvbnNcclxuICBjbG9zZUJ1dHRvbkxpc3RlbmVyPzogKCkgPT4gdm9pZDtcclxuICBjbG9zZUJ1dHRvbkNvbG9yPzogVENvbG9yO1xyXG4gIGNsb3NlQnV0dG9uVG91Y2hBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xyXG4gIGNsb3NlQnV0dG9uVG91Y2hBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xyXG4gIGNsb3NlQnV0dG9uTW91c2VBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xyXG4gIGNsb3NlQnV0dG9uTW91c2VBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xyXG5cclxuICAvLyBJZiBwcm92aWRlZCB1c2UgdGhpcyBkaWFsb2cgdGl0bGUgaW4gdGhlIENsb3NlIGJ1dHRvbiB2b2ljaW5nTmFtZVJlc3BvbnNlLiBUaGlzIHNob3VsZCBiZSBwcm92aWRlZFxyXG4gIC8vIGZvciBwcm9wZXIgRGlhbG9nIFZvaWNpbmcgZGVzaWduLlxyXG4gIGNsb3NlQnV0dG9uVm9pY2luZ0RpYWxvZ1RpdGxlPzogc3RyaW5nIHwgVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiB8IG51bGw7XHJcblxyXG4gIC8vIEJ5IGRlZmF1bHQsIHRoZSBjbG9zZSBidXR0b24gaXMgcGxhY2VkIGZpcnN0IGluIHRoZSBQRE9NT3JkZXIgKGFuZCB0aHVzIHRoZSBmb2N1cyBvcmRlcikuIFNldCB0aGlzIHRvIHRydWVcclxuICAvLyBpZiB5b3Ugd2FudCB0aGUgY2xvc2UgYnV0dG9uIHRvIGJlIHRoZSBsYXN0IGVsZW1lbnQgaW4gdGhlIGZvY3VzIG9yZGVyIGZvciB0aGUgRGlhbG9nLlxyXG4gIGNsb3NlQnV0dG9uTGFzdEluUERPTT86IGJvb2xlYW47XHJcblxyXG4gIC8vIHNvdW5kIGdlbmVyYXRpb25cclxuICBvcGVuZWRTb3VuZFBsYXllcj86IFRTb3VuZFBsYXllcjtcclxuICBjbG9zZWRTb3VuZFBsYXllcj86IFRTb3VuZFBsYXllcjtcclxuXHJcbiAgc2ltPzogU2ltO1xyXG5cclxuICAvLyBDYWxsZWQgYWZ0ZXIgdGhlIGRpYWxvZyBpcyBzaG93biwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvNDc4XHJcbiAgc2hvd0NhbGxiYWNrPzogKCAoKSA9PiB2b2lkICkgfCBudWxsO1xyXG5cclxuICAvLyBDYWxsZWQgYWZ0ZXIgdGhlIGRpYWxvZyBpcyBoaWRkZW4sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzQ3OFxyXG4gIGhpZGVDYWxsYmFjaz86ICggKCkgPT4gdm9pZCApIHwgbnVsbDtcclxufTtcclxuXHJcbnR5cGUgUGFyZW50T3B0aW9ucyA9IFBhbmVsT3B0aW9ucyAmIFBvcHVwYWJsZU9wdGlvbnM7XHJcblxyXG5leHBvcnQgdHlwZSBEaWFsb2dPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFBhcmVudE9wdGlvbnMsICd4TWFyZ2luJyB8ICd5TWFyZ2luJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaWFsb2cgZXh0ZW5kcyBQb3B1cGFibGUoIFBhbmVsLCAxICkge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGNsb3NlQnV0dG9uOiBDbG9zZUJ1dHRvbjtcclxuICBwcml2YXRlIHJlYWRvbmx5IHNpbTogU2ltO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZURpYWxvZzogKCkgPT4gdm9pZDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGNvbnRlbnQgLSBUaGUgY29udGVudCB0byBkaXNwbGF5IGluc2lkZSB0aGUgZGlhbG9nIChub3QgaW5jbHVkaW5nIHRoZSB0aXRsZSlcclxuICAgKiBAcGFyYW0gcHJvdmlkZWRPcHRpb25zXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjb250ZW50OiBOb2RlLCBwcm92aWRlZE9wdGlvbnM/OiBEaWFsb2dPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8RGlhbG9nT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBhcmVudE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIERpYWxvZ09wdGlvbnNcclxuICAgICAgeFNwYWNpbmc6IDEwLFxyXG4gICAgICB5U3BhY2luZzogMTAsXHJcbiAgICAgIHRvcE1hcmdpbjogMTUsXHJcbiAgICAgIGJvdHRvbU1hcmdpbjogMTUsXHJcbiAgICAgIGxlZnRNYXJnaW46IG51bGwsXHJcbiAgICAgIG1heFdpZHRoTWFyZ2luOiAxMixcclxuICAgICAgbWF4SGVpZ2h0TWFyZ2luOiAxMixcclxuICAgICAgY2xvc2VCdXR0b25MZW5ndGg6IDE4LjIsXHJcbiAgICAgIGNsb3NlQnV0dG9uVG9wTWFyZ2luOiAxMCxcclxuICAgICAgY2xvc2VCdXR0b25SaWdodE1hcmdpbjogMTAsXHJcbiAgICAgIHRpdGxlOiBudWxsLFxyXG4gICAgICB0aXRsZUFsaWduOiAnY2VudGVyJyxcclxuICAgICAgYWRkQXJpYUxhYmVsbGVkQnlGcm9tVGl0bGU6IHRydWUsXHJcbiAgICAgIGxheW91dFN0cmF0ZWd5OiBkZWZhdWx0TGF5b3V0U3RyYXRlZ3ksXHJcbiAgICAgIGNsb3NlQnV0dG9uTGlzdGVuZXI6ICgpID0+IHRoaXMuaGlkZSgpLFxyXG4gICAgICBjbG9zZUJ1dHRvbkNvbG9yOiAnYmxhY2snLFxyXG4gICAgICBjbG9zZUJ1dHRvblRvdWNoQXJlYVhEaWxhdGlvbjogMCxcclxuICAgICAgY2xvc2VCdXR0b25Ub3VjaEFyZWFZRGlsYXRpb246IDAsXHJcbiAgICAgIGNsb3NlQnV0dG9uTW91c2VBcmVhWERpbGF0aW9uOiAwLFxyXG4gICAgICBjbG9zZUJ1dHRvbk1vdXNlQXJlYVlEaWxhdGlvbjogMCxcclxuICAgICAgY2xvc2VCdXR0b25Wb2ljaW5nRGlhbG9nVGl0bGU6IG51bGwsXHJcbiAgICAgIGNsb3NlQnV0dG9uTGFzdEluUERPTTogZmFsc2UsXHJcbiAgICAgIG9wZW5lZFNvdW5kUGxheWVyOiBnZW5lcmFsT3BlblNvdW5kUGxheWVyLFxyXG4gICAgICBjbG9zZWRTb3VuZFBsYXllcjogZ2VuZXJhbENsb3NlU291bmRQbGF5ZXIsXHJcbiAgICAgIHNpbTogZ2V0R2xvYmFsKCAncGhldC5qb2lzdC5zaW0nICksXHJcbiAgICAgIHNob3dDYWxsYmFjazogbnVsbCxcclxuICAgICAgaGlkZUNhbGxiYWNrOiBudWxsLFxyXG5cclxuICAgICAgLy8gUG9wdXBhYmxlT3B0aW9uc1xyXG4gICAgICBsYXlvdXRCb3VuZHM6IFNjcmVlblZpZXcuREVGQVVMVF9MQVlPVVRfQk9VTkRTLFxyXG4gICAgICBmb2N1c09uU2hvd05vZGU6IG51bGwsXHJcblxyXG4gICAgICAvLyBQYW5lbE9wdGlvbnNcclxuICAgICAgY29ybmVyUmFkaXVzOiAxMCwgLy8ge251bWJlcn0gcmFkaXVzIG9mIHRoZSBkaWFsb2cncyBjb3JuZXJzXHJcbiAgICAgIHJlc2l6ZTogdHJ1ZSwgLy8ge2Jvb2xlYW59IHdoZXRoZXIgdG8gcmVzaXplIGlmIGNvbnRlbnQncyBzaXplIGNoYW5nZXNcclxuICAgICAgZmlsbDogJ3doaXRlJywgLy8ge3N0cmluZ3xDb2xvcn1cclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLCAvLyB7c3RyaW5nfENvbG9yfVxyXG4gICAgICBiYWNrZ3JvdW5kUGlja2FibGU6IHRydWUsXHJcbiAgICAgIG1heEhlaWdodDogbnVsbCwgLy8gaWYgbm90IHByb3ZpZGVkLCB0aGVuIGR5bmFtaWNhbGx5IGNhbGN1bGF0ZSBiYXNlZCBvbiB0aGUgbGF5b3V0Qm91bmRzIG9mIHRoZSBjdXJyZW50IHNjcmVlbiwgc2VlIHVwZGF0ZUxheW91dE11bHRpbGlua1xyXG4gICAgICBtYXhXaWR0aDogbnVsbCwgLy8gaWYgbm90IHByb3ZpZGVkLCB0aGVuIGR5bmFtaWNhbGx5IGNhbGN1bGF0ZSBiYXNlZCBvbiB0aGUgbGF5b3V0Qm91bmRzIG9mIHRoZSBjdXJyZW50IHNjcmVlbiwgc2VlIHVwZGF0ZUxheW91dE11bHRpbGlua1xyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRJT05BTCxcclxuICAgICAgcGhldGlvVHlwZTogRGlhbG9nLkRpYWxvZ0lPLFxyXG4gICAgICBwaGV0aW9TdGF0ZTogdHJ1ZSwgLy8gRGlhbG9nIGlzIG9mdGVuIGEgZHluYW1pYyBlbGVtZW50LCBhbmQgdGh1cyBuZWVkcyB0byBiZSBpbiBzdGF0ZSB0byB0cmlnZ2VyIGVsZW1lbnQgY3JlYXRpb24uXHJcbiAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2UsIC8vIHZpc2libGUgaXNuJ3QgdG9nZ2xlZCB3aGVuIHNob3dpbmcgYSBEaWFsb2dcclxuXHJcbiAgICAgIC8vIHBkb20gb3B0aW9uc1xyXG4gICAgICB0YWdOYW1lOiAnZGl2JyxcclxuICAgICAgYXJpYVJvbGU6ICdkaWFsb2cnXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnNpbSwgJ3NpbSBtdXN0IGJlIHByb3ZpZGVkLCBhcyBEaWFsb2cgbmVlZHMgYSBTaW0gaW5zdGFuY2UnICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy54TWFyZ2luID09PSB1bmRlZmluZWQsICdEaWFsb2cgc2V0cyB4TWFyZ2luJyApO1xyXG4gICAgb3B0aW9ucy54TWFyZ2luID0gMDtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMueU1hcmdpbiA9PT0gdW5kZWZpbmVkLCAnRGlhbG9nIHNldHMgeU1hcmdpbicgKTtcclxuICAgIG9wdGlvbnMueU1hcmdpbiA9IDA7XHJcblxyXG4gICAgLy8gaWYgbGVmdCBtYXJnaW4gaXMgc3BlY2lmaWVkIGluIG9wdGlvbnMsIHVzZSBpdC4gb3RoZXJ3aXNlLCBzZXQgaXQgdG8gbWFrZSB0aGUgbGVmdCByaWdodCBndXR0ZXJzIHN5bW1ldHJpY2FsXHJcbiAgICBpZiAoIG9wdGlvbnMubGVmdE1hcmdpbiA9PT0gbnVsbCApIHtcclxuICAgICAgb3B0aW9ucy5sZWZ0TWFyZ2luID0gb3B0aW9ucy54U3BhY2luZyArIG9wdGlvbnMuY2xvc2VCdXR0b25MZW5ndGggKyBvcHRpb25zLmNsb3NlQnV0dG9uUmlnaHRNYXJnaW47XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5tYXhIZWlnaHQgPT09IG51bGwgfHwgdHlwZW9mIG9wdGlvbnMubWF4SGVpZ2h0ID09PSAnbnVtYmVyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5tYXhXaWR0aCA9PT0gbnVsbCB8fCB0eXBlb2Ygb3B0aW9ucy5tYXhXaWR0aCA9PT0gJ251bWJlcicgKTtcclxuXHJcbiAgICAvLyBBcHBseSBtYXhXaWR0aC9tYXhIZWlnaHQgZGVwZW5kaW5nIG9uIHRoZSBtYXJnaW5zIGFuZCBsYXlvdXRCb3VuZHNcclxuICAgIGlmICggIW9wdGlvbnMubWF4V2lkdGggJiYgb3B0aW9ucy5sYXlvdXRCb3VuZHMgKSB7XHJcbiAgICAgIG9wdGlvbnMubWF4V2lkdGggPSBhcHBseURvdWJsZU1hcmdpbiggb3B0aW9ucy5sYXlvdXRCb3VuZHMud2lkdGgsIG9wdGlvbnMubWF4V2lkdGhNYXJnaW4gKTtcclxuICAgIH1cclxuICAgIGlmICggIW9wdGlvbnMubWF4SGVpZ2h0ICYmIG9wdGlvbnMubGF5b3V0Qm91bmRzICkge1xyXG4gICAgICBvcHRpb25zLm1heEhlaWdodCA9IGFwcGx5RG91YmxlTWFyZ2luKCBvcHRpb25zLmxheW91dEJvdW5kcy5oZWlnaHQsIG9wdGlvbnMubWF4SGVpZ2h0TWFyZ2luICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2UgbmVlZCBhbiBcInVuYXR0YWNoZWRcIiB1dHRlcmFuY2Ugc28gdGhhdCB3aGVuIHRoZSBjbG9zZSBidXR0b24gZmlyZXMsIGhpZGluZyB0aGUgY2xvc2UgYnV0dG9uLCB3ZSBzdGlsbCBoZWFyXHJcbiAgICAvLyB0aGUgY29udGV4dCByZXNwb25zZS4gQnV0IHdlIHN0aWxsIHNob3VsZCBvbmx5IGhlYXIgdGhpcyBjb250ZXh0IHJlc3BvbnNlIHdoZW4gXCJTaW0gVm9pY2luZ1wiIGlzIGVuYWJsZWQuXHJcbiAgICBjb25zdCBjb250ZXh0UmVzcG9uc2VVdHRlcmFuY2UgPSBuZXcgVXR0ZXJhbmNlKCB7XHJcbiAgICAgIHByaW9yaXR5OiBVdHRlcmFuY2UuTUVESVVNX1BSSU9SSVRZLFxyXG4gICAgICB2b2ljaW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzOiBbIHZvaWNpbmdNYW5hZ2VyLnZvaWNpbmdGdWxseUVuYWJsZWRQcm9wZXJ0eSBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGNsb3NlIGJ1dHRvbiAtIGEgZmxhdCBcIlhcIlxyXG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBuZXcgQ2xvc2VCdXR0b24oIHtcclxuICAgICAgaWNvbkxlbmd0aDogb3B0aW9ucy5jbG9zZUJ1dHRvbkxlbmd0aCxcclxuICAgICAgYmFzZUNvbG9yOiAndHJhbnNwYXJlbnQnLFxyXG4gICAgICBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3k6IEJ1dHRvbk5vZGUuRmxhdEFwcGVhcmFuY2VTdHJhdGVneSxcclxuXHJcbiAgICAgIC8vIG5vIG1hcmdpbnMgc2luY2UgdGhlIGZsYXQgWCB0YWtlcyB1cCBhbGwgdGhlIHNwYWNlXHJcbiAgICAgIHhNYXJnaW46IDAsXHJcbiAgICAgIHlNYXJnaW46IDAsXHJcblxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG5cclxuICAgICAgICAvLyBDb250ZXh0IHJlc3BvbnNlIGZpcnN0LCBiZWZvcmUgcG90ZW50aWFsbHkgY2hhbmdpbmcgZm9jdXMgd2l0aCB0aGUgY2FsbGJhY2sgbGlzdGVuZXJcclxuICAgICAgICBjbG9zZUJ1dHRvbi52b2ljaW5nU3BlYWtDb250ZXh0UmVzcG9uc2UoIHtcclxuICAgICAgICAgIHV0dGVyYW5jZTogY29udGV4dFJlc3BvbnNlVXR0ZXJhbmNlXHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICBvcHRpb25zLmNsb3NlQnV0dG9uTGlzdGVuZXIoKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIHBhdGhPcHRpb25zOiB7XHJcbiAgICAgICAgc3Ryb2tlOiBvcHRpb25zLmNsb3NlQnV0dG9uQ29sb3JcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjbG9zZUJ1dHRvbicgKSxcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlLCAvLyBjbG9zZSBidXR0b24gc2hvdWxkIG5vdCBiZSBpbiBzdGF0ZVxyXG5cclxuICAgICAgLy8gSXQgaXMgYSB1c2FiaWxpdHkgY29uY2VybiB0byBjaGFuZ2UgZWl0aGVyIG9mIHRoZXNlLCBhbHNvIHRoZXJlIGFyZSBvdGhlciB3YXlzIHRvIGV4aXQgYSBEaWFsb2csIHNvIHVzaW5nXHJcbiAgICAgIC8vIHRoZXNlIGlzIGJ1Z2d5LlxyXG4gICAgICBwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQ6IGZhbHNlLFxyXG4gICAgICBwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQ6IGZhbHNlLFxyXG5cclxuICAgICAgLy8gdHVybiBvZmYgZGVmYXVsdCBzb3VuZCBnZW5lcmF0aW9uLCBEaWFsb2cgd2lsbCBjcmVhdGUgaXRzIG93biBzb3VuZHNcclxuICAgICAgc291bmRQbGF5ZXI6IG51bGxTb3VuZFBsYXllcixcclxuXHJcbiAgICAgIC8vIHBkb21cclxuICAgICAgdGFnTmFtZTogJ2J1dHRvbicsXHJcbiAgICAgIGlubmVyQ29udGVudDogU3VuU3RyaW5ncy5hMTF5LmNsb3NlU3RyaW5nUHJvcGVydHksXHJcblxyXG4gICAgICAvLyB2b2ljaW5nXHJcbiAgICAgIHZvaWNpbmdDb250ZXh0UmVzcG9uc2U6IFN1blN0cmluZ3MuYTExeS5jbG9zZWRTdHJpbmdQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuXHJcbiAgICBsZXQgY2xvc2VCdXR0b25Wb2ljaW5nTmFtZVJlc3BvbnNlUHJvcGVydHk6IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eTx7IHRpdGxlOiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+IH0+O1xyXG4gICAgaWYgKCBvcHRpb25zLmNsb3NlQnV0dG9uVm9pY2luZ0RpYWxvZ1RpdGxlICkge1xyXG4gICAgICBjb25zdCB0aXRsZVByb3BlcnR5ID0gdHlwZW9mIG9wdGlvbnMuY2xvc2VCdXR0b25Wb2ljaW5nRGlhbG9nVGl0bGUgPT09ICdzdHJpbmcnID8gbmV3IFRpbnlQcm9wZXJ0eSggb3B0aW9ucy5jbG9zZUJ1dHRvblZvaWNpbmdEaWFsb2dUaXRsZSApIDogb3B0aW9ucy5jbG9zZUJ1dHRvblZvaWNpbmdEaWFsb2dUaXRsZTtcclxuICAgICAgY2xvc2VCdXR0b25Wb2ljaW5nTmFtZVJlc3BvbnNlUHJvcGVydHkgPSBjbG9zZUJ1dHRvbi52b2ljaW5nTmFtZVJlc3BvbnNlID0gbmV3IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggU3VuU3RyaW5ncy5hMTF5LnRpdGxlQ2xvc2VQYXR0ZXJuU3RyaW5nUHJvcGVydHksIHsgdGl0bGU6IHRpdGxlUHJvcGVydHkgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRvdWNoL21vdXNlIGFyZWFzIGZvciB0aGUgY2xvc2UgYnV0dG9uXHJcbiAgICBjbG9zZUJ1dHRvbi50b3VjaEFyZWEgPSBjbG9zZUJ1dHRvbi5ib3VuZHMuZGlsYXRlZFhZKFxyXG4gICAgICBvcHRpb25zLmNsb3NlQnV0dG9uVG91Y2hBcmVhWERpbGF0aW9uLFxyXG4gICAgICBvcHRpb25zLmNsb3NlQnV0dG9uVG91Y2hBcmVhWURpbGF0aW9uXHJcbiAgICApO1xyXG4gICAgY2xvc2VCdXR0b24ubW91c2VBcmVhID0gY2xvc2VCdXR0b24uYm91bmRzLmRpbGF0ZWRYWShcclxuICAgICAgb3B0aW9ucy5jbG9zZUJ1dHRvbk1vdXNlQXJlYVhEaWxhdGlvbixcclxuICAgICAgb3B0aW9ucy5jbG9zZUJ1dHRvbk1vdXNlQXJlYVlEaWxhdGlvblxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBwZG9tIC0gc2V0IHRoZSBvcmRlciBvZiBjb250ZW50LCBjbG9zZSBidXR0b24gZmlyc3Qgc28gcmVtYWluaW5nIGNvbnRlbnQgY2FuIGJlIHJlYWQgZnJvbSB0b3AgdG8gYm90dG9tXHJcbiAgICAvLyB3aXRoIHZpcnR1YWwgY3Vyc29yXHJcbiAgICBsZXQgcGRvbU9yZGVyID0gWyBvcHRpb25zLnRpdGxlLCBjb250ZW50IF07XHJcbiAgICBvcHRpb25zLmNsb3NlQnV0dG9uTGFzdEluUERPTSA/IHBkb21PcmRlci5wdXNoKCBjbG9zZUJ1dHRvbiApIDogcGRvbU9yZGVyLnVuc2hpZnQoIGNsb3NlQnV0dG9uICk7XHJcbiAgICBwZG9tT3JkZXIgPSBwZG9tT3JkZXIuZmlsdGVyKCBub2RlID0+IG5vZGUgIT09IHVuZGVmaW5lZCAmJiBub2RlICE9PSBudWxsICk7XHJcblxyXG4gICAgLy8gcGRvbSAtIGZhbGwgYmFjayB0byBmb2N1c2luZyB0aGUgY2xvc2VCdXR0b24gYnkgZGVmYXVsdCBpZiB0aGVyZSBpcyBubyBmb2N1c09uU2hvd05vZGUgb3IgdGhlXHJcbiAgICAvLyBjb250ZW50IGlzIG5vdCBmb2N1c2FibGVcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBkb21PcmRlclsgMCBdICk7XHJcbiAgICBvcHRpb25zLmZvY3VzT25TaG93Tm9kZSA9IG9wdGlvbnMuZm9jdXNPblNob3dOb2RlID8gb3B0aW9ucy5mb2N1c09uU2hvd05vZGUgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZG9tT3JkZXJbIDAgXSEuZm9jdXNhYmxlID8gcGRvbU9yZGVyWyAwIF0gOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZUJ1dHRvbjtcclxuXHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5mb2N1c09uU2hvd05vZGUgaW5zdGFuY2VvZiBOb2RlLCAnc2hvdWxkIGJlIG5vbi1udWxsIGFuZCBkZWZpbmVkJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5mb2N1c09uU2hvd05vZGUhLmZvY3VzYWJsZSwgJ2ZvY3VzT25TaG93Tm9kZSBtdXN0IGJlIGZvY3VzYWJsZS4nICk7XHJcblxyXG4gICAgLy8gQWxpZ24gY29udGVudCwgdGl0bGUsIGFuZCBjbG9zZSBidXR0b24gdXNpbmcgc3BhY2luZyBhbmQgbWFyZ2luIG9wdGlvbnNcclxuXHJcbiAgICAvLyBhbGlnbiBjb250ZW50IGFuZCB0aXRsZSAoaWYgcHJvdmlkZWQpIHZlcnRpY2FsbHlcclxuICAgIGNvbnN0IGNvbnRlbnRBbmRUaXRsZSA9IG5ldyBWQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBvcHRpb25zLnRpdGxlID8gWyBvcHRpb25zLnRpdGxlLCBjb250ZW50IF0gOiBbIGNvbnRlbnQgXSxcclxuICAgICAgc3BhY2luZzogb3B0aW9ucy55U3BhY2luZyxcclxuICAgICAgYWxpZ246IG9wdGlvbnMudGl0bGVBbGlnblxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGFkZCB0b3BNYXJnaW4sIGJvdHRvbU1hcmdpbiwgYW5kIGxlZnRNYXJnaW5cclxuICAgIGNvbnN0IGNvbnRlbnRBbmRUaXRsZVdpdGhNYXJnaW5zID0gbmV3IEFsaWduQm94KCBjb250ZW50QW5kVGl0bGUsIHtcclxuICAgICAgdG9wTWFyZ2luOiBvcHRpb25zLnRvcE1hcmdpbixcclxuICAgICAgYm90dG9tTWFyZ2luOiBvcHRpb25zLmJvdHRvbU1hcmdpbixcclxuICAgICAgbGVmdE1hcmdpbjogb3B0aW9ucy5sZWZ0TWFyZ2luXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWRkIGNsb3NlQnV0dG9uVG9wTWFyZ2luIGFuZCBjbG9zZUJ1dHRvblJpZ2h0TWFyZ2luXHJcbiAgICBjb25zdCBjbG9zZUJ1dHRvbldpdGhNYXJnaW5zID0gbmV3IEFsaWduQm94KCBjbG9zZUJ1dHRvbiwge1xyXG4gICAgICB0b3BNYXJnaW46IG9wdGlvbnMuY2xvc2VCdXR0b25Ub3BNYXJnaW4sXHJcbiAgICAgIHJpZ2h0TWFyZ2luOiBvcHRpb25zLmNsb3NlQnV0dG9uUmlnaHRNYXJnaW5cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgY29udGVudCBmb3IgUGFuZWxcclxuICAgIGNvbnN0IGRpYWxvZ0NvbnRlbnQgPSBuZXcgSEJveCgge1xyXG4gICAgICBjaGlsZHJlbjogWyBjb250ZW50QW5kVGl0bGVXaXRoTWFyZ2lucywgY2xvc2VCdXR0b25XaXRoTWFyZ2lucyBdLFxyXG4gICAgICBzcGFjaW5nOiBvcHRpb25zLnhTcGFjaW5nLFxyXG4gICAgICBhbGlnbjogJ3RvcCdcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggZGlhbG9nQ29udGVudCwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFRoZSBEaWFsb2cncyBkaXNwbGF5IHJ1bnMgb24gdGhpcyBQcm9wZXJ0eSwgc28gYWRkIHRoZSBsaXN0ZW5lciB0aGF0IGNvbnRyb2xzIHNob3cvaGlkZS5cclxuICAgIHRoaXMuaXNTaG93aW5nUHJvcGVydHkubGF6eUxpbmsoIGlzU2hvd2luZyA9PiB7XHJcbiAgICAgIGlmICggaXNTaG93aW5nICkge1xyXG4gICAgICAgIC8vIHNvdW5kIGdlbmVyYXRpb25cclxuICAgICAgICBvcHRpb25zLm9wZW5lZFNvdW5kUGxheWVyLnBsYXkoKTtcclxuXHJcbiAgICAgICAgLy8gRG8gdGhpcyBsYXN0XHJcbiAgICAgICAgb3B0aW9ucy5zaG93Q2FsbGJhY2sgJiYgb3B0aW9ucy5zaG93Q2FsbGJhY2soKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyBzb3VuZCBnZW5lcmF0aW9uXHJcbiAgICAgICAgb3B0aW9ucy5jbG9zZWRTb3VuZFBsYXllci5wbGF5KCk7XHJcblxyXG4gICAgICAgIC8vIERvIHRoaXMgbGFzdFxyXG4gICAgICAgIG9wdGlvbnMuaGlkZUNhbGxiYWNrICYmIG9wdGlvbnMuaGlkZUNhbGxiYWNrKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnNpbSA9IG9wdGlvbnMuc2ltO1xyXG4gICAgdGhpcy5jbG9zZUJ1dHRvbiA9IGNsb3NlQnV0dG9uO1xyXG5cclxuICAgIGNvbnN0IHVwZGF0ZUxheW91dE11bHRpbGluayA9IE11bHRpbGluay5tdWx0aWxpbmsoIFtcclxuICAgICAgdGhpcy5zaW0uYm91bmRzUHJvcGVydHksXHJcbiAgICAgIHRoaXMuc2ltLnNjcmVlbkJvdW5kc1Byb3BlcnR5LFxyXG4gICAgICB0aGlzLnNpbS5zY2FsZVByb3BlcnR5LFxyXG4gICAgICB0aGlzLnNpbS5zZWxlY3RlZFNjcmVlblByb3BlcnR5LFxyXG4gICAgICB0aGlzLmlzU2hvd2luZ1Byb3BlcnR5LFxyXG4gICAgICB0aGlzLmxvY2FsQm91bmRzUHJvcGVydHlcclxuICAgIF0sICggYm91bmRzLCBzY3JlZW5Cb3VuZHMsIHNjYWxlICkgPT4ge1xyXG4gICAgICBpZiAoIGJvdW5kcyAmJiBzY3JlZW5Cb3VuZHMgJiYgc2NhbGUgKSB7XHJcbiAgICAgICAgb3B0aW9ucy5sYXlvdXRTdHJhdGVneSggdGhpcywgYm91bmRzLCBzY3JlZW5Cb3VuZHMsIHNjYWxlICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTZXR0ZXIgYWZ0ZXIgdGhlIHN1cGVyIGNhbGxcclxuICAgIHRoaXMucGRvbU9yZGVyID0gcGRvbU9yZGVyO1xyXG5cclxuICAgIC8vIHBkb20gLSBzZXQgdGhlIGFyaWEtbGFiZWxsZWRieSByZWxhdGlvbiBzbyB0aGF0IHdoZW5ldmVyIGZvY3VzIGVudGVycyB0aGUgZGlhbG9nIHRoZSB0aXRsZSBpcyByZWFkXHJcbiAgICBpZiAoIG9wdGlvbnMudGl0bGUgJiYgb3B0aW9ucy50aXRsZS50YWdOYW1lICYmIG9wdGlvbnMuYWRkQXJpYUxhYmVsbGVkQnlGcm9tVGl0bGUgKSB7XHJcbiAgICAgIHRoaXMuYWRkQXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbigge1xyXG4gICAgICAgIHRoaXNFbGVtZW50TmFtZTogUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HLFxyXG4gICAgICAgIG90aGVyTm9kZTogb3B0aW9ucy50aXRsZSxcclxuICAgICAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkdcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHBkb20gLSBjbG9zZSB0aGUgZGlhbG9nIHdoZW4gcHJlc3NpbmcgXCJlc2NhcGVcIlxyXG4gICAgY29uc3QgZXNjYXBlTGlzdGVuZXI6IFRJbnB1dExpc3RlbmVyID0ge1xyXG4gICAgICBrZXlkb3duOiBldmVudCA9PiB7XHJcbiAgICAgICAgY29uc3QgZG9tRXZlbnQgPSBldmVudC5kb21FdmVudDsgLy8ge0RPTUV2ZW50fG51bGx9XHJcblxyXG4gICAgICAgIGlmICggS2V5Ym9hcmRVdGlscy5pc0tleUV2ZW50KCBldmVudC5kb21FdmVudCwgS2V5Ym9hcmRVdGlscy5LRVlfRVNDQVBFICkgKSB7XHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkb21FdmVudCApO1xyXG4gICAgICAgICAgZG9tRXZlbnQhLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIEtleWJvYXJkVXRpbHMuaXNLZXlFdmVudCggZXZlbnQuZG9tRXZlbnQsIEtleWJvYXJkVXRpbHMuS0VZX1RBQiApICYmIEZ1bGxTY3JlZW4uaXNGdWxsU2NyZWVuKCkgKSB7XHJcblxyXG4gICAgICAgICAgLy8gcHJldmVudCBhIHBhcnRpY3VsYXIgYnVnIGluIFdpbmRvd3MgNy84LjEgRmlyZWZveCB3aGVyZSBmb2N1cyBnZXRzIHRyYXBwZWQgaW4gdGhlIGRvY3VtZW50XHJcbiAgICAgICAgICAvLyB3aGVuIHRoZSBuYXZpZ2F0aW9uIGJhciBpcyBoaWRkZW4gYW5kIHRoZXJlIGlzIG9ubHkgb25lIGZvY3VzYWJsZSBlbGVtZW50IGluIHRoZSBET01cclxuICAgICAgICAgIC8vIHNlZSBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD05MTAxMzZcclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIEZvY3VzTWFuYWdlci5wZG9tRm9jdXMgKTsgLy8ge0ZvY3VzfG51bGx9XHJcbiAgICAgICAgICBjb25zdCBhY3RpdmVJZCA9IEZvY3VzTWFuYWdlci5wZG9tRm9jdXMhLnRyYWlsLmdldFVuaXF1ZUlkKCk7XHJcbiAgICAgICAgICBjb25zdCBub05leHRGb2N1c2FibGUgPSBQRE9NVXRpbHMuZ2V0TmV4dEZvY3VzYWJsZSgpLmlkID09PSBhY3RpdmVJZDtcclxuICAgICAgICAgIGNvbnN0IG5vUHJldmlvdXNGb2N1c2FibGUgPSBQRE9NVXRpbHMuZ2V0UHJldmlvdXNGb2N1c2FibGUoKS5pZCA9PT0gYWN0aXZlSWQ7XHJcblxyXG4gICAgICAgICAgaWYgKCBub05leHRGb2N1c2FibGUgJiYgbm9QcmV2aW91c0ZvY3VzYWJsZSApIHtcclxuICAgICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZG9tRXZlbnQgKTtcclxuICAgICAgICAgICAgZG9tRXZlbnQhLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCBlc2NhcGVMaXN0ZW5lciApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZURpYWxvZyA9ICgpID0+IHtcclxuICAgICAgdXBkYXRlTGF5b3V0TXVsdGlsaW5rLmRpc3Bvc2UoKTtcclxuICAgICAgY2xvc2VCdXR0b25XaXRoTWFyZ2lucy5kaXNwb3NlKCk7XHJcbiAgICAgIHRoaXMucmVtb3ZlSW5wdXRMaXN0ZW5lciggZXNjYXBlTGlzdGVuZXIgKTtcclxuXHJcbiAgICAgIGNsb3NlQnV0dG9uVm9pY2luZ05hbWVSZXNwb25zZVByb3BlcnR5ICYmIGNsb3NlQnV0dG9uVm9pY2luZ05hbWVSZXNwb25zZVByb3BlcnR5LmRpc3Bvc2UoKTtcclxuXHJcbiAgICAgIGNsb3NlQnV0dG9uLmRpc3Bvc2UoKTtcclxuXHJcbiAgICAgIGNvbnRleHRSZXNwb25zZVV0dGVyYW5jZS5kaXNwb3NlKCk7XHJcbiAgICAgIGNvbnRlbnRBbmRUaXRsZS5kaXNwb3NlKCk7XHJcblxyXG4gICAgICAvLyByZW1vdmUgZGlhbG9nIGNvbnRlbnQgZnJvbSBzY2VuZSBncmFwaCwgYnV0IGRvbid0IGRpc3Bvc2UgYmVjYXVzZSBQYW5lbFxyXG4gICAgICAvLyBuZWVkcyB0byByZW1vdmUgbGlzdGVuZXJzIG9uIHRoZSBjb250ZW50IGluIGl0cyBkaXNwb3NlKClcclxuICAgICAgZGlhbG9nQ29udGVudC5yZW1vdmVBbGxDaGlsZHJlbigpO1xyXG4gICAgICBkaWFsb2dDb250ZW50LmRldGFjaCgpO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlRGlhbG9nKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIERpYWxvZ0lPID0gbmV3IElPVHlwZSggJ0RpYWxvZ0lPJywge1xyXG4gICAgdmFsdWVUeXBlOiBEaWFsb2csXHJcblxyXG4gICAgLy8gU2luY2UgbWFueSBEaWFsb2dzIGFyZSBkeW5hbWljIGVsZW1lbnRzLCB0aGVzZSBuZWVkIHRvIGJlIGluIHRoZSBzdGF0ZS4gVGhlIHZhbHVlIG9mIHRoZSBzdGF0ZSBvYmplY3QgZG9lc24ndFxyXG4gICAgLy8gbWF0dGVyLCBidXQgaXQgaW5zdGVhZCBqdXN0IHNlcnZlcyBhcyBhIG1hcmtlciB0byB0ZWxsIHRoZSBzdGF0ZSBlbmdpbmUgdG8gcmVjcmVhdGUgdGhlIERpYWxvZyAoaWYgZHluYW1pYykgd2hlblxyXG4gICAgLy8gc2V0dGluZyBzdGF0ZS5cclxuICAgIHN1cGVydHlwZTogRHluYW1pY01hcmtlcklPXHJcbiAgfSApO1xyXG59XHJcblxyXG4vLyBEZWZhdWx0IHZhbHVlIGZvciBvcHRpb25zLmxheW91dFN0cmF0ZWd5LCBjZW50ZXJzIHRoZSBEaWFsb2cgaW4gdGhlIGxheW91dEJvdW5kcy5cclxuZnVuY3Rpb24gZGVmYXVsdExheW91dFN0cmF0ZWd5KCBkaWFsb2c6IERpYWxvZywgc2ltQm91bmRzOiBCb3VuZHMyLCBzY3JlZW5Cb3VuZHM6IEJvdW5kczIsIHNjYWxlOiBudW1iZXIgKTogdm9pZCB7XHJcbiAgaWYgKCBkaWFsb2cubGF5b3V0Qm91bmRzICkge1xyXG4gICAgZGlhbG9nLmNlbnRlciA9IGRpYWxvZy5sYXlvdXRCb3VuZHMuY2VudGVyO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSBkaW1lbnNpb24gLSB3aWR0aCBvciBoZWlnaHQgZGltZW5zaW9uXHJcbiAqIEBwYXJhbSBtYXJnaW4gLSBtYXJnaW4gdG8gYmUgYXBwbGllZCB0byB0aGUgZGltZW5zaW9uXHJcbiAqL1xyXG5mdW5jdGlvbiBhcHBseURvdWJsZU1hcmdpbiggZGltZW5zaW9uOiBudW1iZXIsIG1hcmdpbjogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgcmV0dXJuICggZGltZW5zaW9uID4gbWFyZ2luICogMiApID8gKCBkaW1lbnNpb24gLSBtYXJnaW4gKiAyICkgOiBkaW1lbnNpb247XHJcbn1cclxuXHJcbnN1bi5yZWdpc3RlciggJ0RpYWxvZycsIERpYWxvZyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sNEJBQTRCO0FBRWxELE9BQU9DLFVBQVUsTUFBTSw4QkFBOEI7QUFFckQsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBRXZELE9BQU9DLFdBQVcsTUFBTSw4Q0FBOEM7QUFDdEUsU0FBU0MsUUFBUSxFQUFFQyxZQUFZLEVBQUVDLFVBQVUsRUFBRUMsSUFBSSxFQUFFQyxhQUFhLEVBQUVDLElBQUksRUFBRUMsUUFBUSxFQUFFQyxTQUFTLEVBQTBCQyxJQUFJLEVBQUVDLGNBQWMsUUFBUSw2QkFBNkI7QUFFOUssT0FBT0MsdUJBQXVCLE1BQU0sZ0VBQWdFO0FBQ3BHLE9BQU9DLHNCQUFzQixNQUFNLCtEQUErRDtBQUNsRyxPQUFPQyxlQUFlLE1BQU0sd0RBQXdEO0FBQ3BGLE9BQU9DLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsT0FBT0MsZUFBZSxNQUFNLDBDQUEwQztB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