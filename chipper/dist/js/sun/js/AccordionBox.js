// Copyright 2013-2023, University of Colorado Boulder

/**
 * Box that can be expanded/collapsed to show/hide contents.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { FocusHighlightFromNode, InteractiveHighlighting, Node, Path, PDOMPeer, Rectangle, Text } from '../../scenery/js/imports.js';
import accordionBoxClosedSoundPlayer from '../../tambo/js/shared-sound-players/accordionBoxClosedSoundPlayer.js';
import accordionBoxOpenedSoundPlayer from '../../tambo/js/shared-sound-players/accordionBoxOpenedSoundPlayer.js';
import EventType from '../../tandem/js/EventType.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import ExpandCollapseButton from './ExpandCollapseButton.js';
import sun from './sun.js';

// Options documented in optionize

export default class AccordionBox extends Node {
  // Only defined if there is a stroke

  static AccordionBoxIO = new IOType('AccordionBoxIO', {
    valueType: AccordionBox,
    supertype: Node.NodeIO,
    events: ['expanded', 'collapsed']
  });

  /**
   * @param contentNode - Content that  will be shown or hidden as the accordion box is expanded/collapsed. NOTE: AccordionBox
   *                      places this Node in a pdomOrder, so you should not do that yourself.
   * @param [providedOptions] - Various key-value pairs that control the appearance and behavior.  Some options are
   *                             specific to this class while some are passed to the superclass.  See the code where
   *                             the options are set in the early portion of the constructor for details.
   */
  constructor(contentNode, providedOptions) {
    const options = optionize()({
      // If not provided, a Text node will be supplied. Should have and maintain well-defined bounds if passed in
      titleNode: null,
      // {Property.<boolean>} - If not provided, a BooleanProperty will be created, defaulting to true.
      expandedProperty: null,
      // If true, the AccordionBox will resize itself as needed when the title/content resizes.
      // See https://github.com/phetsims/sun/issues/304
      resize: true,
      // applied to multiple parts of this UI component
      cursor: 'pointer',
      // {string} default cursor
      lineWidth: 1,
      cornerRadius: 10,
      // box
      stroke: 'black',
      fill: 'rgb( 238, 238, 238 )',
      minWidth: 0,
      titleAlignX: 'center',
      // {string} horizontal alignment of the title, 'left'|'center'|'right'
      titleAlignY: 'center',
      // {string} vertical alignment of the title, relative to expand/collapse button 'top'|'center'
      titleXMargin: 10,
      // horizontal space between title and left|right edge of box
      titleYMargin: 2,
      // vertical space between title and top of box
      titleXSpacing: 5,
      // horizontal space between title and expand/collapse button
      showTitleWhenExpanded: true,
      // true = title is visible when expanded, false = title is hidden when expanded
      titleBarExpandCollapse: true,
      // {boolean} clicking on the title bar expands/collapses the accordion box

      // expand/collapse button layout
      buttonAlign: 'left',
      // {string} button alignment, 'left'|'right'
      buttonXMargin: 4,
      // horizontal space between button and left|right edge of box
      buttonYMargin: 2,
      // vertical space between button and top edge of box

      // content
      contentAlign: 'center',
      // {string} horizontal alignment of the content, 'left'|'center'|'right'
      contentXMargin: 15,
      // horizontal space between content and left/right edges of box
      contentYMargin: 8,
      // vertical space between content and bottom edge of box
      contentXSpacing: 5,
      // horizontal space between content and button, ignored if showTitleWhenExpanded is true
      contentYSpacing: 8,
      // vertical space between content and title+button, ignored if showTitleWhenExpanded is false

      // {TSoundPlayer} - sound generators for expand and collapse
      expandedSoundPlayer: accordionBoxOpenedSoundPlayer,
      collapsedSoundPlayer: accordionBoxClosedSoundPlayer,
      // pdom
      tagName: 'div',
      headingTagName: 'h3',
      // specify the heading that this AccordionBox will be, TODO: use this.headingLevel when no longer experimental https://github.com/phetsims/scenery/issues/855
      accessibleNameBehavior: AccordionBox.ACCORDION_BOX_ACCESSIBLE_NAME_BEHAVIOR,
      // voicing
      voicingNameResponse: null,
      voicingObjectResponse: null,
      voicingContextResponse: null,
      voicingHintResponse: null,
      // phet-io support
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'AccordionBox',
      phetioType: AccordionBox.AccordionBoxIO,
      phetioEventType: EventType.USER,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    }, providedOptions);

    // titleBarOptions defaults
    options.titleBarOptions = combineOptions({
      fill: null,
      // {Color|string|null} title bar fill
      stroke: null // {Color|string|null} title bar stroke, used only for the expanded title bar
    }, options.titleBarOptions);

    // expandCollapseButtonOptions defaults
    options.expandCollapseButtonOptions = combineOptions({
      sideLength: 16,
      // button is a square, this is the length of one side
      cursor: options.cursor,
      valueOnSoundPlayer: options.expandedSoundPlayer,
      valueOffSoundPlayer: options.collapsedSoundPlayer,
      // voicing
      voicingNameResponse: options.voicingNameResponse,
      voicingObjectResponse: options.voicingObjectResponse,
      voicingContextResponse: options.voicingContextResponse,
      voicingHintResponse: options.voicingHintResponse,
      // phet-io
      tandem: options.tandem.createTandem('expandCollapseButton')
    }, options.expandCollapseButtonOptions);
    super();
    this._contentAlign = options.contentAlign;
    this._contentNode = contentNode;
    this._cornerRadius = options.cornerRadius;
    this._buttonXMargin = options.buttonXMargin;
    this._buttonYMargin = options.buttonYMargin;
    this._contentXMargin = options.contentXMargin;
    this._contentYMargin = options.contentYMargin;
    this._contentXSpacing = options.contentXSpacing;
    this._contentYSpacing = options.contentYSpacing;
    this._titleAlignX = options.titleAlignX;
    this._titleAlignY = options.titleAlignY;
    this._titleXMargin = options.titleXMargin;
    this._titleYMargin = options.titleYMargin;
    this._titleXSpacing = options.titleXSpacing;
    this._minWidth = options.minWidth;
    this._showTitleWhenExpanded = options.showTitleWhenExpanded;
    this._buttonAlign = options.buttonAlign;
    this.titleNode = options.titleNode;

    // If there is no titleNode specified, we'll provide our own, and handle disposal.
    if (!this.titleNode) {
      this.titleNode = new Text('', {
        tandem: options.tandem.createTandem('titleText')
      });
      this.disposeEmitter.addListener(() => this.titleNode.dispose());
    }

    // Allow touches to go through to the collapsedTitleBar which handles the input event
    // Note: This mutates the titleNode, so if it is used in multiple places it will become unpickable
    // in those places as well.
    this.titleNode.pickable = false;
    this.expandedProperty = options.expandedProperty;
    if (!this.expandedProperty) {
      this.expandedProperty = new BooleanProperty(true, {
        tandem: options.tandem.createTandem('expandedProperty')
      });
      this.disposeEmitter.addListener(() => this.expandedProperty.dispose());
    }

    // expand/collapse button, links to expandedProperty, must be disposed of
    this.expandCollapseButton = new ExpandCollapseButton(this.expandedProperty, options.expandCollapseButtonOptions);
    this.disposeEmitter.addListener(() => this.expandCollapseButton.dispose());

    // Expanded box
    const boxOptions = {
      fill: options.fill,
      cornerRadius: options.cornerRadius
    };
    this.expandedBox = new Rectangle(boxOptions);
    this.collapsedBox = new Rectangle(boxOptions);

    // Transparent rectangle for working around issues like https://github.com/phetsims/graphing-quadratics/issues/86.
    // The current hypothesis is that browsers (in this case, IE11) sometimes don't compute the correct region of the
    // screen that needs to get redrawn when something changes. This means that old content can be left in regions where
    // it has since disappeared in the SVG. Adding transparent objects that are a bit larger seems to generally work
    // (since browsers don't get the region wrong by more than a few pixels generally), and in the past has resolved the
    // issues.
    this.workaroundBox = new Rectangle({
      fill: 'transparent',
      pickable: false
    });
    this.expandedTitleBar = new InteractiveHighlightPath(null, combineOptions({
      lineWidth: options.lineWidth,
      // use same lineWidth as box, for consistent look
      cursor: options.cursor
    }, options.titleBarOptions));
    this.expandedBox.addChild(this.expandedTitleBar);

    // Collapsed title bar has corners that match the box. Clicking it operates like expand/collapse button.
    this.collapsedTitleBar = new InteractiveHighlightRectangle(combineOptions({
      cornerRadius: options.cornerRadius,
      cursor: options.cursor
    }, options.titleBarOptions));
    this.collapsedBox.addChild(this.collapsedTitleBar);
    this.disposeEmitter.addListener(() => {
      this.collapsedTitleBar.dispose();
      this.expandedTitleBar.dispose();
    });
    if (options.titleBarExpandCollapse) {
      this.collapsedTitleBar.addInputListener({
        down: () => {
          if (this.expandCollapseButton.isEnabled()) {
            this.phetioStartEvent('expanded');
            this.expandedProperty.value = true;
            options.expandedSoundPlayer.play();
            this.phetioEndEvent();
          }
        }
      });
    } else {
      // When titleBar doesn't expand or collapse, don't show interactive highlights for them
      this.expandedTitleBar.interactiveHighlight = 'invisible';
      this.collapsedTitleBar.interactiveHighlight = 'invisible';
    }

    // Set the input listeners for the expandedTitleBar
    if (options.showTitleWhenExpanded) {
      if (options.titleBarExpandCollapse) {
        this.expandedTitleBar.addInputListener({
          down: () => {
            if (this.expandCollapseButton.isEnabled()) {
              this.phetioStartEvent('collapsed');
              options.collapsedSoundPlayer.play();
              this.expandedProperty.value = false;
              this.phetioEndEvent();
            }
          }
        });
      }
    }

    // If we hide the button or make it unpickable, disable interactivity of the title bar,
    // see https://github.com/phetsims/sun/issues/477 and https://github.com/phetsims/sun/issues/573.
    const pickableListener = () => {
      const pickable = this.expandCollapseButton.visible && this.expandCollapseButton.pickable;
      this.collapsedTitleBar.pickable = pickable;
      this.expandedTitleBar.pickable = pickable;
    };

    // Add listeners to the expand/collapse button.  These do not need to be unlinked because this component owns the
    // button.
    this.expandCollapseButton.visibleProperty.lazyLink(pickableListener);
    this.expandCollapseButton.pickableProperty.lazyLink(pickableListener);
    this.expandCollapseButton.enabledProperty.link(enabled => {
      // Since there are listeners on the titleBars from InteractiveHighlighting, setting pickable: false isn't enough
      // to hide pointer cursor.
      const showCursor = options.titleBarExpandCollapse && enabled;
      this.collapsedTitleBar.cursor = showCursor ? options.cursor || null : null;
      this.expandedTitleBar.cursor = showCursor ? options.cursor || null : null;
    });

    // Set the focusHighlight for the interactive PDOM element based on the dimensions of the whole title bar.
    this.expandCollapseButton.setFocusHighlight(new FocusHighlightFromNode(this.expandedTitleBar));

    // optional box outline, on top of everything else
    if (options.stroke) {
      const outlineOptions = {
        stroke: options.stroke,
        lineWidth: options.lineWidth,
        cornerRadius: options.cornerRadius,
        // don't occlude input events from the collapsedTitleBar, which handles the events
        pickable: false
      };
      this.expandedBoxOutline = new Rectangle(outlineOptions);
      this.expandedBox.addChild(this.expandedBoxOutline);
      this.collapsedBoxOutline = new Rectangle(outlineOptions);
      this.collapsedBox.addChild(this.collapsedBoxOutline);
    }
    this.expandedBox.addChild(this._contentNode);

    // Holds the main components when the content's bounds are valid
    this.containerNode = new Node();
    this.addChild(this.containerNode);

    // pdom display
    const pdomContentNode = new Node({
      tagName: 'div',
      ariaRole: 'region',
      pdomOrder: [this._contentNode],
      ariaLabelledbyAssociations: [{
        otherNode: this.expandCollapseButton,
        otherElementName: PDOMPeer.PRIMARY_SIBLING,
        thisElementName: PDOMPeer.PRIMARY_SIBLING
      }]
    });
    const pdomHeading = new Node({
      tagName: options.headingTagName,
      pdomOrder: [this.expandCollapseButton]
    });
    const pdomContainerNode = new Node({
      children: [pdomHeading, pdomContentNode]
    });
    this.addChild(pdomContainerNode);
    this.layout();

    // Watch future changes for re-layout (don't want to trigger on our first layout and queue useless ones)
    if (options.resize) {
      const layoutListener = this.layout.bind(this);
      contentNode.boundsProperty.lazyLink(layoutListener);
      this.titleNode.boundsProperty.lazyLink(layoutListener);
      this.disposeEmitter.addListener(() => {
        contentNode.boundsProperty.unlink(layoutListener);
        this.titleNode.boundsProperty.unlink(layoutListener);
      });
    }

    // expand/collapse the box
    const expandedPropertyObserver = () => {
      const expanded = this.expandedProperty.value;
      this.expandedBox.visible = expanded;
      this.collapsedBox.visible = !expanded;

      // NOTE: This does not increase the bounds of the AccordionBox, since the localBounds for the workaroundBox have
      // been set elsewhere.
      this.workaroundBox.rectBounds = (expanded ? this.expandedBox : this.collapsedBox).bounds.dilated(10);
      this.titleNode.visible = expanded && options.showTitleWhenExpanded || !expanded;
      pdomContainerNode.setPDOMAttribute('aria-hidden', !expanded);
      this.expandCollapseButton.voicingSpeakFullResponse({
        hintResponse: null
      });
    };
    this.expandedProperty.link(expandedPropertyObserver);
    this.expandedBox.boundsProperty.link(expandedPropertyObserver);
    this.collapsedBox.boundsProperty.link(expandedPropertyObserver);
    this.disposeEmitter.addListener(() => this.expandedProperty.unlink(expandedPropertyObserver));
    this.mutate(_.omit(options, 'cursor'));

    // reset things that are owned by AccordionBox
    this.resetAccordionBox = () => {
      // If expandedProperty wasn't provided via options, we own it and therefore need to reset it.
      if (!options.expandedProperty) {
        this.expandedProperty.reset();
      }
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('sun', 'AccordionBox', this);
  }
  reset() {
    this.resetAccordionBox();
  }

  /**
   * Performs layout that positions everything that can change.
   */
  layout() {
    const hasValidBounds = this._contentNode.bounds.isValid();
    this.containerNode.children = hasValidBounds ? [this.expandedBox, this.collapsedBox, this.workaroundBox, this.titleNode, this.expandCollapseButton] : [];
    if (!hasValidBounds) {
      return;
    }
    const collapsedBoxHeight = this.getCollapsedBoxHeight();
    const boxWidth = this.getBoxWidth();
    const expandedBoxHeight = this.getExpandedBoxHeight();
    this.expandedBox.rectWidth = boxWidth;
    this.expandedBox.rectHeight = expandedBoxHeight;
    const expandedBounds = this.expandedBox.selfBounds;

    // expandedBoxOutline exists only if options.stroke is truthy
    if (this.expandedBoxOutline) {
      this.expandedBoxOutline.rectWidth = boxWidth;
      this.expandedBoxOutline.rectHeight = expandedBoxHeight;
    }
    this.expandedTitleBar.shape = this.getTitleBarShape();
    this.collapsedBox.rectWidth = boxWidth;
    this.collapsedBox.rectHeight = collapsedBoxHeight;
    this.collapsedTitleBar.rectWidth = boxWidth;
    this.collapsedTitleBar.rectHeight = collapsedBoxHeight;

    // collapsedBoxOutline exists only if options.stroke is truthy
    if (this.collapsedBoxOutline) {
      this.collapsedBoxOutline.rectWidth = boxWidth;
      this.collapsedBoxOutline.rectHeight = collapsedBoxHeight;
    }

    // IMPORTANT: The collapsedBox should now be fully laid out before this. Now we can use its bounds to set the
    // workaroundBox
    this.workaroundBox.localBounds = this.collapsedBox.bounds;

    // content layout
    this._contentNode.bottom = expandedBounds.bottom - this._contentYMargin;
    let contentSpanLeft = expandedBounds.left + this._contentXMargin;
    let contentSpanRight = expandedBounds.right - this._contentXMargin;
    if (!this._showTitleWhenExpanded) {
      // content will be placed next to button
      if (this._buttonAlign === 'left') {
        contentSpanLeft += this.expandCollapseButton.width + this._contentXSpacing;
      } else {
        // right on right
        contentSpanRight -= this.expandCollapseButton.width + this._contentXSpacing;
      }
    }
    if (this._contentAlign === 'left') {
      this._contentNode.left = contentSpanLeft;
    } else if (this._contentAlign === 'right') {
      this._contentNode.right = contentSpanRight;
    } else {
      // center
      this._contentNode.centerX = (contentSpanLeft + contentSpanRight) / 2;
    }

    // button horizontal layout
    let titleLeftSpan = expandedBounds.left + this._titleXMargin;
    let titleRightSpan = expandedBounds.right - this._titleXMargin;
    if (this._buttonAlign === 'left') {
      this.expandCollapseButton.left = expandedBounds.left + this._buttonXMargin;
      titleLeftSpan = this.expandCollapseButton.right + this._titleXSpacing;
    } else {
      this.expandCollapseButton.right = expandedBounds.right - this._buttonXMargin;
      titleRightSpan = this.expandCollapseButton.left - this._titleXSpacing;
    }

    // title horizontal layout
    if (this._titleAlignX === 'left') {
      this.titleNode.left = titleLeftSpan;
    } else if (this._titleAlignX === 'right') {
      this.titleNode.right = titleRightSpan;
    } else {
      // center
      this.titleNode.centerX = expandedBounds.centerX;
    }

    // button & title vertical layout
    if (this._titleAlignY === 'top') {
      this.expandCollapseButton.top = this.collapsedBox.top + Math.max(this._buttonYMargin, this._titleYMargin);
      this.titleNode.top = this.expandCollapseButton.top;
    } else {
      // center
      this.expandCollapseButton.centerY = this.collapsedBox.centerY;
      this.titleNode.centerY = this.expandCollapseButton.centerY;
    }
  }

  /**
   * Returns the Shape of the title bar.
   *
   * Expanded title bar has (optional) rounded top corners, square bottom corners. Clicking it operates like
   * expand/collapse button.
   */
  getTitleBarShape() {
    return Shape.roundedRectangleWithRadii(0, 0, this.getBoxWidth(), this.getCollapsedBoxHeight(), {
      topLeft: this._cornerRadius,
      topRight: this._cornerRadius
    });
  }

  /**
   * Returns the computed width of the box (ignoring things like stroke width)
   */
  getBoxWidth() {
    // Initial width is dependent on width of title section of the accordion box
    let width = Math.max(this._minWidth, this._buttonXMargin + this.expandCollapseButton.width + this._titleXSpacing + this.titleNode.width + this._titleXMargin);

    // Limit width by the necessary space for the title node
    if (this._titleAlignX === 'center') {
      // Handles case where the spacing on the left side of the title is larger than the spacing on the right side.
      width = Math.max(width, (this._buttonXMargin + this.expandCollapseButton.width + this._titleXSpacing) * 2 + this.titleNode.width);

      // Handles case where the spacing on the right side of the title is larger than the spacing on the left side.
      width = Math.max(width, this._titleXMargin * 2 + this.titleNode.width);
    }

    // Compare width of title section to content section of the accordion box
    // content is below button+title
    if (this._showTitleWhenExpanded) {
      return Math.max(width, this._contentNode.width + 2 * this._contentXMargin);
    }
    // content is next to button
    else {
      return Math.max(width, this.expandCollapseButton.width + this._contentNode.width + this._buttonXMargin + this._contentXMargin + this._contentXSpacing);
    }
  }

  /**
   * Returns the ideal height of the collapsed box (ignoring things like stroke width)
   */
  getCollapsedBoxHeight() {
    return Math.max(this.expandCollapseButton.height + 2 * this._buttonYMargin, this.titleNode.height + 2 * this._titleYMargin);
  }

  /**
   * Returns the ideal height of the expanded box (ignoring things like stroke width)
   */
  getExpandedBoxHeight() {
    // content is below button+title
    if (this._showTitleWhenExpanded) {
      return this.getCollapsedBoxHeight() + this._contentNode.height + this._contentYMargin + this._contentYSpacing;
    }
    // content is next to button
    else {
      return Math.max(this.expandCollapseButton.height + 2 * this._buttonYMargin, this._contentNode.height + 2 * this._contentYMargin);
    }
  }

  // The definition for how AccordionBox sets its accessibleName in the PDOM. Forward it onto its expandCollapseButton.
  // See AccordionBox.md for further style guide and documentation on the pattern.
  static ACCORDION_BOX_ACCESSIBLE_NAME_BEHAVIOR = (node, options, accessibleName, callbacksForOtherNodes) => {
    callbacksForOtherNodes.push(() => {
      node.expandCollapseButton.accessibleName = accessibleName;
    });
    return options;
  };
}
class InteractiveHighlightPath extends InteractiveHighlighting(Path) {}
class InteractiveHighlightRectangle extends InteractiveHighlighting(Rectangle) {}
sun.register('AccordionBox', AccordionBox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJTaGFwZSIsIkluc3RhbmNlUmVnaXN0cnkiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIkZvY3VzSGlnaGxpZ2h0RnJvbU5vZGUiLCJJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyIsIk5vZGUiLCJQYXRoIiwiUERPTVBlZXIiLCJSZWN0YW5nbGUiLCJUZXh0IiwiYWNjb3JkaW9uQm94Q2xvc2VkU291bmRQbGF5ZXIiLCJhY2NvcmRpb25Cb3hPcGVuZWRTb3VuZFBsYXllciIsIkV2ZW50VHlwZSIsIlRhbmRlbSIsIklPVHlwZSIsIkV4cGFuZENvbGxhcHNlQnV0dG9uIiwic3VuIiwiQWNjb3JkaW9uQm94IiwiQWNjb3JkaW9uQm94SU8iLCJ2YWx1ZVR5cGUiLCJzdXBlcnR5cGUiLCJOb2RlSU8iLCJldmVudHMiLCJjb25zdHJ1Y3RvciIsImNvbnRlbnROb2RlIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInRpdGxlTm9kZSIsImV4cGFuZGVkUHJvcGVydHkiLCJyZXNpemUiLCJjdXJzb3IiLCJsaW5lV2lkdGgiLCJjb3JuZXJSYWRpdXMiLCJzdHJva2UiLCJmaWxsIiwibWluV2lkdGgiLCJ0aXRsZUFsaWduWCIsInRpdGxlQWxpZ25ZIiwidGl0bGVYTWFyZ2luIiwidGl0bGVZTWFyZ2luIiwidGl0bGVYU3BhY2luZyIsInNob3dUaXRsZVdoZW5FeHBhbmRlZCIsInRpdGxlQmFyRXhwYW5kQ29sbGFwc2UiLCJidXR0b25BbGlnbiIsImJ1dHRvblhNYXJnaW4iLCJidXR0b25ZTWFyZ2luIiwiY29udGVudEFsaWduIiwiY29udGVudFhNYXJnaW4iLCJjb250ZW50WU1hcmdpbiIsImNvbnRlbnRYU3BhY2luZyIsImNvbnRlbnRZU3BhY2luZyIsImV4cGFuZGVkU291bmRQbGF5ZXIiLCJjb2xsYXBzZWRTb3VuZFBsYXllciIsInRhZ05hbWUiLCJoZWFkaW5nVGFnTmFtZSIsImFjY2Vzc2libGVOYW1lQmVoYXZpb3IiLCJBQ0NPUkRJT05fQk9YX0FDQ0VTU0lCTEVfTkFNRV9CRUhBVklPUiIsInZvaWNpbmdOYW1lUmVzcG9uc2UiLCJ2b2ljaW5nT2JqZWN0UmVzcG9uc2UiLCJ2b2ljaW5nQ29udGV4dFJlc3BvbnNlIiwidm9pY2luZ0hpbnRSZXNwb25zZSIsInRhbmRlbSIsIlJFUVVJUkVEIiwidGFuZGVtTmFtZVN1ZmZpeCIsInBoZXRpb1R5cGUiLCJwaGV0aW9FdmVudFR5cGUiLCJVU0VSIiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb0ZlYXR1cmVkIiwidGl0bGVCYXJPcHRpb25zIiwiZXhwYW5kQ29sbGFwc2VCdXR0b25PcHRpb25zIiwic2lkZUxlbmd0aCIsInZhbHVlT25Tb3VuZFBsYXllciIsInZhbHVlT2ZmU291bmRQbGF5ZXIiLCJjcmVhdGVUYW5kZW0iLCJfY29udGVudEFsaWduIiwiX2NvbnRlbnROb2RlIiwiX2Nvcm5lclJhZGl1cyIsIl9idXR0b25YTWFyZ2luIiwiX2J1dHRvbllNYXJnaW4iLCJfY29udGVudFhNYXJnaW4iLCJfY29udGVudFlNYXJnaW4iLCJfY29udGVudFhTcGFjaW5nIiwiX2NvbnRlbnRZU3BhY2luZyIsIl90aXRsZUFsaWduWCIsIl90aXRsZUFsaWduWSIsIl90aXRsZVhNYXJnaW4iLCJfdGl0bGVZTWFyZ2luIiwiX3RpdGxlWFNwYWNpbmciLCJfbWluV2lkdGgiLCJfc2hvd1RpdGxlV2hlbkV4cGFuZGVkIiwiX2J1dHRvbkFsaWduIiwiZGlzcG9zZUVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImRpc3Bvc2UiLCJwaWNrYWJsZSIsImV4cGFuZENvbGxhcHNlQnV0dG9uIiwiYm94T3B0aW9ucyIsImV4cGFuZGVkQm94IiwiY29sbGFwc2VkQm94Iiwid29ya2Fyb3VuZEJveCIsImV4cGFuZGVkVGl0bGVCYXIiLCJJbnRlcmFjdGl2ZUhpZ2hsaWdodFBhdGgiLCJhZGRDaGlsZCIsImNvbGxhcHNlZFRpdGxlQmFyIiwiSW50ZXJhY3RpdmVIaWdobGlnaHRSZWN0YW5nbGUiLCJhZGRJbnB1dExpc3RlbmVyIiwiZG93biIsImlzRW5hYmxlZCIsInBoZXRpb1N0YXJ0RXZlbnQiLCJ2YWx1ZSIsInBsYXkiLCJwaGV0aW9FbmRFdmVudCIsImludGVyYWN0aXZlSGlnaGxpZ2h0IiwicGlja2FibGVMaXN0ZW5lciIsInZpc2libGUiLCJ2aXNpYmxlUHJvcGVydHkiLCJsYXp5TGluayIsInBpY2thYmxlUHJvcGVydHkiLCJlbmFibGVkUHJvcGVydHkiLCJsaW5rIiwiZW5hYmxlZCIsInNob3dDdXJzb3IiLCJzZXRGb2N1c0hpZ2hsaWdodCIsIm91dGxpbmVPcHRpb25zIiwiZXhwYW5kZWRCb3hPdXRsaW5lIiwiY29sbGFwc2VkQm94T3V0bGluZSIsImNvbnRhaW5lck5vZGUiLCJwZG9tQ29udGVudE5vZGUiLCJhcmlhUm9sZSIsInBkb21PcmRlciIsImFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zIiwib3RoZXJOb2RlIiwib3RoZXJFbGVtZW50TmFtZSIsIlBSSU1BUllfU0lCTElORyIsInRoaXNFbGVtZW50TmFtZSIsInBkb21IZWFkaW5nIiwicGRvbUNvbnRhaW5lck5vZGUiLCJjaGlsZHJlbiIsImxheW91dCIsImxheW91dExpc3RlbmVyIiwiYmluZCIsImJvdW5kc1Byb3BlcnR5IiwidW5saW5rIiwiZXhwYW5kZWRQcm9wZXJ0eU9ic2VydmVyIiwiZXhwYW5kZWQiLCJyZWN0Qm91bmRzIiwiYm91bmRzIiwiZGlsYXRlZCIsInNldFBET01BdHRyaWJ1dGUiLCJ2b2ljaW5nU3BlYWtGdWxsUmVzcG9uc2UiLCJoaW50UmVzcG9uc2UiLCJtdXRhdGUiLCJfIiwib21pdCIsInJlc2V0QWNjb3JkaW9uQm94IiwicmVzZXQiLCJhc3NlcnQiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsImhhc1ZhbGlkQm91bmRzIiwiaXNWYWxpZCIsImNvbGxhcHNlZEJveEhlaWdodCIsImdldENvbGxhcHNlZEJveEhlaWdodCIsImJveFdpZHRoIiwiZ2V0Qm94V2lkdGgiLCJleHBhbmRlZEJveEhlaWdodCIsImdldEV4cGFuZGVkQm94SGVpZ2h0IiwicmVjdFdpZHRoIiwicmVjdEhlaWdodCIsImV4cGFuZGVkQm91bmRzIiwic2VsZkJvdW5kcyIsInNoYXBlIiwiZ2V0VGl0bGVCYXJTaGFwZSIsImxvY2FsQm91bmRzIiwiYm90dG9tIiwiY29udGVudFNwYW5MZWZ0IiwibGVmdCIsImNvbnRlbnRTcGFuUmlnaHQiLCJyaWdodCIsIndpZHRoIiwiY2VudGVyWCIsInRpdGxlTGVmdFNwYW4iLCJ0aXRsZVJpZ2h0U3BhbiIsInRvcCIsIk1hdGgiLCJtYXgiLCJjZW50ZXJZIiwicm91bmRlZFJlY3RhbmdsZVdpdGhSYWRpaSIsInRvcExlZnQiLCJ0b3BSaWdodCIsImhlaWdodCIsIm5vZGUiLCJhY2Nlc3NpYmxlTmFtZSIsImNhbGxiYWNrc0Zvck90aGVyTm9kZXMiLCJwdXNoIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBY2NvcmRpb25Cb3gudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQm94IHRoYXQgY2FuIGJlIGV4cGFuZGVkL2NvbGxhcHNlZCB0byBzaG93L2hpZGUgY29udGVudHMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCB7IEZvY3VzSGlnaGxpZ2h0RnJvbU5vZGUsIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nLCBOb2RlLCBOb2RlT3B0aW9ucywgUGF0aCwgUERPTUJlaGF2aW9yRnVuY3Rpb24sIFBET01QZWVyLCBSZWN0YW5nbGUsIFJlY3RhbmdsZU9wdGlvbnMsIFRDb2xvciwgVGV4dCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBhY2NvcmRpb25Cb3hDbG9zZWRTb3VuZFBsYXllciBmcm9tICcuLi8uLi90YW1iby9qcy9zaGFyZWQtc291bmQtcGxheWVycy9hY2NvcmRpb25Cb3hDbG9zZWRTb3VuZFBsYXllci5qcyc7XHJcbmltcG9ydCBhY2NvcmRpb25Cb3hPcGVuZWRTb3VuZFBsYXllciBmcm9tICcuLi8uLi90YW1iby9qcy9zaGFyZWQtc291bmQtcGxheWVycy9hY2NvcmRpb25Cb3hPcGVuZWRTb3VuZFBsYXllci5qcyc7XHJcbmltcG9ydCBTb3VuZENsaXBQbGF5ZXIgZnJvbSAnLi4vLi4vdGFtYm8vanMvc291bmQtZ2VuZXJhdG9ycy9Tb3VuZENsaXBQbGF5ZXIuanMnO1xyXG5pbXBvcnQgRXZlbnRUeXBlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9FdmVudFR5cGUuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgeyBWb2ljaW5nUmVzcG9uc2UgfSBmcm9tICcuLi8uLi91dHRlcmFuY2UtcXVldWUvanMvUmVzcG9uc2VQYWNrZXQuanMnO1xyXG5pbXBvcnQgRXhwYW5kQ29sbGFwc2VCdXR0b24sIHsgRXhwYW5kQ29sbGFwc2VCdXR0b25PcHRpb25zIH0gZnJvbSAnLi9FeHBhbmRDb2xsYXBzZUJ1dHRvbi5qcyc7XHJcbmltcG9ydCBzdW4gZnJvbSAnLi9zdW4uanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcblxyXG4vLyBPcHRpb25zIGRvY3VtZW50ZWQgaW4gb3B0aW9uaXplXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgdGl0bGVOb2RlPzogTm9kZTtcclxuICBleHBhbmRlZFByb3BlcnR5PzogUHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgcmVzaXplPzogYm9vbGVhbjtcclxuICBsaW5lV2lkdGg/OiBudW1iZXI7XHJcbiAgY29ybmVyUmFkaXVzPzogbnVtYmVyO1xyXG5cclxuICBzdHJva2U/OiBUQ29sb3I7XHJcbiAgZmlsbD86IFRDb2xvcjtcclxuICBtaW5XaWR0aD86IG51bWJlcjtcclxuXHJcbiAgdGl0bGVBbGlnblg/OiAnY2VudGVyJyB8ICdsZWZ0JyB8ICdyaWdodCc7XHJcbiAgdGl0bGVBbGlnblk/OiAndG9wJyB8ICdjZW50ZXInO1xyXG4gIHRpdGxlWE1hcmdpbj86IG51bWJlcjtcclxuICB0aXRsZVlNYXJnaW4/OiBudW1iZXI7XHJcbiAgdGl0bGVYU3BhY2luZz86IG51bWJlcjtcclxuICBzaG93VGl0bGVXaGVuRXhwYW5kZWQ/OiBib29sZWFuO1xyXG4gIHRpdGxlQmFyRXhwYW5kQ29sbGFwc2U/OiBib29sZWFuO1xyXG5cclxuICAvLyBvcHRpb25zIHBhc3NlZCB0byBFeHBhbmRDb2xsYXBzZUJ1dHRvbiBjb25zdHJ1Y3RvclxyXG4gIGV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9ucz86IEV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9ucztcclxuXHJcbiAgLy8gZXhwYW5kL2NvbGxhcHNlIGJ1dHRvbiBsYXlvdXRcclxuICBidXR0b25BbGlnbj86ICdsZWZ0JyB8ICdyaWdodCc7XHJcbiAgYnV0dG9uWE1hcmdpbj86IG51bWJlcjtcclxuICBidXR0b25ZTWFyZ2luPzogbnVtYmVyO1xyXG5cclxuICAvLyBjb250ZW50XHJcbiAgY29udGVudEFsaWduPzogJ2xlZnQnIHwgJ2NlbnRlcicgfCAncmlnaHQnO1xyXG4gIGNvbnRlbnRYTWFyZ2luPzogbnVtYmVyO1xyXG4gIGNvbnRlbnRZTWFyZ2luPzogbnVtYmVyO1xyXG4gIGNvbnRlbnRYU3BhY2luZz86IG51bWJlcjtcclxuICBjb250ZW50WVNwYWNpbmc/OiBudW1iZXI7XHJcblxyXG4gIHRpdGxlQmFyT3B0aW9ucz86IFJlY3RhbmdsZU9wdGlvbnM7XHJcblxyXG4gIC8vIFNvdW5kXHJcbiAgZXhwYW5kZWRTb3VuZFBsYXllcj86IFNvdW5kQ2xpcFBsYXllcjtcclxuICBjb2xsYXBzZWRTb3VuZFBsYXllcj86IFNvdW5kQ2xpcFBsYXllcjtcclxuXHJcbiAgLy8gdm9pY2luZyAtIFRoZXNlIGFyZSBkZWZpbmVkIGhlcmUgaW4gQWNjb3JkaW9uQm94IChkdXBsaWNhdGVkIGZyb20gVm9pY2luZykgc28gdGhhdCB0aGV5IGNhbiBiZSBwYXNzZWQgdG8gdGhlXHJcbiAgLy8gZXhwYW5kQ29sbGFwc2UgYnV0dG9uLCB3aGljaCBoYW5kbGVzIHZvaWNpbmcgZm9yIEFjY29yZGlvbkJveCwgd2l0aG91dCBBY2NvcmRpb25Cb3ggbWl4aW5nIFZvaWNpbmcgaXRzZWxmLlxyXG4gIHZvaWNpbmdOYW1lUmVzcG9uc2U/OiBWb2ljaW5nUmVzcG9uc2U7XHJcbiAgdm9pY2luZ09iamVjdFJlc3BvbnNlPzogVm9pY2luZ1Jlc3BvbnNlO1xyXG4gIHZvaWNpbmdDb250ZXh0UmVzcG9uc2U/OiBWb2ljaW5nUmVzcG9uc2U7XHJcbiAgdm9pY2luZ0hpbnRSZXNwb25zZT86IFZvaWNpbmdSZXNwb25zZTtcclxuXHJcbiAgLy8gcGRvbVxyXG4gIGhlYWRpbmdUYWdOYW1lPzogc3RyaW5nO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgQWNjb3JkaW9uQm94T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZU9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBY2NvcmRpb25Cb3ggZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IGV4cGFuZGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IF9jb250ZW50QWxpZ247XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfY29udGVudE5vZGU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfY29ybmVyUmFkaXVzO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgX2J1dHRvblhNYXJnaW47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfYnV0dG9uWU1hcmdpbjtcclxuICBwcml2YXRlIHJlYWRvbmx5IF9jb250ZW50WE1hcmdpbjtcclxuICBwcml2YXRlIHJlYWRvbmx5IF9jb250ZW50WU1hcmdpbjtcclxuICBwcml2YXRlIHJlYWRvbmx5IF9jb250ZW50WFNwYWNpbmc7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfY29udGVudFlTcGFjaW5nO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgX3RpdGxlQWxpZ25YO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgX3RpdGxlQWxpZ25ZO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgX3RpdGxlWE1hcmdpbjtcclxuICBwcml2YXRlIHJlYWRvbmx5IF90aXRsZVlNYXJnaW47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfdGl0bGVYU3BhY2luZztcclxuICBwcml2YXRlIHJlYWRvbmx5IF9taW5XaWR0aDtcclxuICBwcml2YXRlIHJlYWRvbmx5IF9zaG93VGl0bGVXaGVuRXhwYW5kZWQ7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfYnV0dG9uQWxpZ247XHJcbiAgcHJpdmF0ZSByZWFkb25seSB0aXRsZU5vZGU6IE5vZGU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBleHBhbmRDb2xsYXBzZUJ1dHRvbjogRXhwYW5kQ29sbGFwc2VCdXR0b247XHJcbiAgcHJpdmF0ZSByZWFkb25seSBleHBhbmRlZEJveDogUmVjdGFuZ2xlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgY29sbGFwc2VkQm94OiBSZWN0YW5nbGU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSB3b3JrYXJvdW5kQm94OiBSZWN0YW5nbGU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBleHBhbmRlZFRpdGxlQmFyOiBJbnRlcmFjdGl2ZUhpZ2hsaWdodFBhdGg7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBjb2xsYXBzZWRUaXRsZUJhcjogSW50ZXJhY3RpdmVIaWdobGlnaHRSZWN0YW5nbGU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBjb250YWluZXJOb2RlOiBOb2RlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcmVzZXRBY2NvcmRpb25Cb3g6ICgpID0+IHZvaWQ7XHJcblxyXG4gIC8vIE9ubHkgZGVmaW5lZCBpZiB0aGVyZSBpcyBhIHN0cm9rZVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZXhwYW5kZWRCb3hPdXRsaW5lPzogUmVjdGFuZ2xlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgY29sbGFwc2VkQm94T3V0bGluZT86IFJlY3RhbmdsZTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBBY2NvcmRpb25Cb3hJTyA9IG5ldyBJT1R5cGUoICdBY2NvcmRpb25Cb3hJTycsIHtcclxuICAgIHZhbHVlVHlwZTogQWNjb3JkaW9uQm94LFxyXG4gICAgc3VwZXJ0eXBlOiBOb2RlLk5vZGVJTyxcclxuICAgIGV2ZW50czogWyAnZXhwYW5kZWQnLCAnY29sbGFwc2VkJyBdXHJcbiAgfSApO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gY29udGVudE5vZGUgLSBDb250ZW50IHRoYXQgIHdpbGwgYmUgc2hvd24gb3IgaGlkZGVuIGFzIHRoZSBhY2NvcmRpb24gYm94IGlzIGV4cGFuZGVkL2NvbGxhcHNlZC4gTk9URTogQWNjb3JkaW9uQm94XHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgcGxhY2VzIHRoaXMgTm9kZSBpbiBhIHBkb21PcmRlciwgc28geW91IHNob3VsZCBub3QgZG8gdGhhdCB5b3Vyc2VsZi5cclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc10gLSBWYXJpb3VzIGtleS12YWx1ZSBwYWlycyB0aGF0IGNvbnRyb2wgdGhlIGFwcGVhcmFuY2UgYW5kIGJlaGF2aW9yLiAgU29tZSBvcHRpb25zIGFyZVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVjaWZpYyB0byB0aGlzIGNsYXNzIHdoaWxlIHNvbWUgYXJlIHBhc3NlZCB0byB0aGUgc3VwZXJjbGFzcy4gIFNlZSB0aGUgY29kZSB3aGVyZVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgb3B0aW9ucyBhcmUgc2V0IGluIHRoZSBlYXJseSBwb3J0aW9uIG9mIHRoZSBjb25zdHJ1Y3RvciBmb3IgZGV0YWlscy5cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGNvbnRlbnROb2RlOiBOb2RlLCBwcm92aWRlZE9wdGlvbnM/OiBBY2NvcmRpb25Cb3hPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8QWNjb3JkaW9uQm94T3B0aW9ucywgU3RyaWN0T21pdDxTZWxmT3B0aW9ucywgJ2V4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9ucycgfCAndGl0bGVCYXJPcHRpb25zJz4sIE5vZGVPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBJZiBub3QgcHJvdmlkZWQsIGEgVGV4dCBub2RlIHdpbGwgYmUgc3VwcGxpZWQuIFNob3VsZCBoYXZlIGFuZCBtYWludGFpbiB3ZWxsLWRlZmluZWQgYm91bmRzIGlmIHBhc3NlZCBpblxyXG4gICAgICB0aXRsZU5vZGU6IG51bGwgYXMgdW5rbm93biBhcyBOb2RlLFxyXG5cclxuICAgICAgLy8ge1Byb3BlcnR5Ljxib29sZWFuPn0gLSBJZiBub3QgcHJvdmlkZWQsIGEgQm9vbGVhblByb3BlcnR5IHdpbGwgYmUgY3JlYXRlZCwgZGVmYXVsdGluZyB0byB0cnVlLlxyXG4gICAgICBleHBhbmRlZFByb3BlcnR5OiBudWxsIGFzIHVua25vd24gYXMgQm9vbGVhblByb3BlcnR5LFxyXG5cclxuICAgICAgLy8gSWYgdHJ1ZSwgdGhlIEFjY29yZGlvbkJveCB3aWxsIHJlc2l6ZSBpdHNlbGYgYXMgbmVlZGVkIHdoZW4gdGhlIHRpdGxlL2NvbnRlbnQgcmVzaXplcy5cclxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzMwNFxyXG4gICAgICByZXNpemU6IHRydWUsXHJcblxyXG4gICAgICAvLyBhcHBsaWVkIHRvIG11bHRpcGxlIHBhcnRzIG9mIHRoaXMgVUkgY29tcG9uZW50XHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLCAvLyB7c3RyaW5nfSBkZWZhdWx0IGN1cnNvclxyXG4gICAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICAgIGNvcm5lclJhZGl1czogMTAsXHJcblxyXG4gICAgICAvLyBib3hcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBmaWxsOiAncmdiKCAyMzgsIDIzOCwgMjM4ICknLFxyXG4gICAgICBtaW5XaWR0aDogMCxcclxuXHJcbiAgICAgIHRpdGxlQWxpZ25YOiAnY2VudGVyJywgLy8ge3N0cmluZ30gaG9yaXpvbnRhbCBhbGlnbm1lbnQgb2YgdGhlIHRpdGxlLCAnbGVmdCd8J2NlbnRlcid8J3JpZ2h0J1xyXG4gICAgICB0aXRsZUFsaWduWTogJ2NlbnRlcicsIC8vIHtzdHJpbmd9IHZlcnRpY2FsIGFsaWdubWVudCBvZiB0aGUgdGl0bGUsIHJlbGF0aXZlIHRvIGV4cGFuZC9jb2xsYXBzZSBidXR0b24gJ3RvcCd8J2NlbnRlcidcclxuICAgICAgdGl0bGVYTWFyZ2luOiAxMCwgLy8gaG9yaXpvbnRhbCBzcGFjZSBiZXR3ZWVuIHRpdGxlIGFuZCBsZWZ0fHJpZ2h0IGVkZ2Ugb2YgYm94XHJcbiAgICAgIHRpdGxlWU1hcmdpbjogMiwgLy8gdmVydGljYWwgc3BhY2UgYmV0d2VlbiB0aXRsZSBhbmQgdG9wIG9mIGJveFxyXG4gICAgICB0aXRsZVhTcGFjaW5nOiA1LCAvLyBob3Jpem9udGFsIHNwYWNlIGJldHdlZW4gdGl0bGUgYW5kIGV4cGFuZC9jb2xsYXBzZSBidXR0b25cclxuICAgICAgc2hvd1RpdGxlV2hlbkV4cGFuZGVkOiB0cnVlLCAvLyB0cnVlID0gdGl0bGUgaXMgdmlzaWJsZSB3aGVuIGV4cGFuZGVkLCBmYWxzZSA9IHRpdGxlIGlzIGhpZGRlbiB3aGVuIGV4cGFuZGVkXHJcbiAgICAgIHRpdGxlQmFyRXhwYW5kQ29sbGFwc2U6IHRydWUsIC8vIHtib29sZWFufSBjbGlja2luZyBvbiB0aGUgdGl0bGUgYmFyIGV4cGFuZHMvY29sbGFwc2VzIHRoZSBhY2NvcmRpb24gYm94XHJcblxyXG4gICAgICAvLyBleHBhbmQvY29sbGFwc2UgYnV0dG9uIGxheW91dFxyXG4gICAgICBidXR0b25BbGlnbjogJ2xlZnQnLCAgLy8ge3N0cmluZ30gYnV0dG9uIGFsaWdubWVudCwgJ2xlZnQnfCdyaWdodCdcclxuICAgICAgYnV0dG9uWE1hcmdpbjogNCwgLy8gaG9yaXpvbnRhbCBzcGFjZSBiZXR3ZWVuIGJ1dHRvbiBhbmQgbGVmdHxyaWdodCBlZGdlIG9mIGJveFxyXG4gICAgICBidXR0b25ZTWFyZ2luOiAyLCAvLyB2ZXJ0aWNhbCBzcGFjZSBiZXR3ZWVuIGJ1dHRvbiBhbmQgdG9wIGVkZ2Ugb2YgYm94XHJcblxyXG4gICAgICAvLyBjb250ZW50XHJcbiAgICAgIGNvbnRlbnRBbGlnbjogJ2NlbnRlcicsIC8vIHtzdHJpbmd9IGhvcml6b250YWwgYWxpZ25tZW50IG9mIHRoZSBjb250ZW50LCAnbGVmdCd8J2NlbnRlcid8J3JpZ2h0J1xyXG4gICAgICBjb250ZW50WE1hcmdpbjogMTUsIC8vIGhvcml6b250YWwgc3BhY2UgYmV0d2VlbiBjb250ZW50IGFuZCBsZWZ0L3JpZ2h0IGVkZ2VzIG9mIGJveFxyXG4gICAgICBjb250ZW50WU1hcmdpbjogOCwgIC8vIHZlcnRpY2FsIHNwYWNlIGJldHdlZW4gY29udGVudCBhbmQgYm90dG9tIGVkZ2Ugb2YgYm94XHJcbiAgICAgIGNvbnRlbnRYU3BhY2luZzogNSwgLy8gaG9yaXpvbnRhbCBzcGFjZSBiZXR3ZWVuIGNvbnRlbnQgYW5kIGJ1dHRvbiwgaWdub3JlZCBpZiBzaG93VGl0bGVXaGVuRXhwYW5kZWQgaXMgdHJ1ZVxyXG4gICAgICBjb250ZW50WVNwYWNpbmc6IDgsIC8vIHZlcnRpY2FsIHNwYWNlIGJldHdlZW4gY29udGVudCBhbmQgdGl0bGUrYnV0dG9uLCBpZ25vcmVkIGlmIHNob3dUaXRsZVdoZW5FeHBhbmRlZCBpcyBmYWxzZVxyXG5cclxuICAgICAgLy8ge1RTb3VuZFBsYXllcn0gLSBzb3VuZCBnZW5lcmF0b3JzIGZvciBleHBhbmQgYW5kIGNvbGxhcHNlXHJcbiAgICAgIGV4cGFuZGVkU291bmRQbGF5ZXI6IGFjY29yZGlvbkJveE9wZW5lZFNvdW5kUGxheWVyLFxyXG4gICAgICBjb2xsYXBzZWRTb3VuZFBsYXllcjogYWNjb3JkaW9uQm94Q2xvc2VkU291bmRQbGF5ZXIsXHJcblxyXG4gICAgICAvLyBwZG9tXHJcbiAgICAgIHRhZ05hbWU6ICdkaXYnLFxyXG4gICAgICBoZWFkaW5nVGFnTmFtZTogJ2gzJywgLy8gc3BlY2lmeSB0aGUgaGVhZGluZyB0aGF0IHRoaXMgQWNjb3JkaW9uQm94IHdpbGwgYmUsIFRPRE86IHVzZSB0aGlzLmhlYWRpbmdMZXZlbCB3aGVuIG5vIGxvbmdlciBleHBlcmltZW50YWwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg1NVxyXG4gICAgICBhY2Nlc3NpYmxlTmFtZUJlaGF2aW9yOiBBY2NvcmRpb25Cb3guQUNDT1JESU9OX0JPWF9BQ0NFU1NJQkxFX05BTUVfQkVIQVZJT1IsXHJcblxyXG4gICAgICAvLyB2b2ljaW5nXHJcbiAgICAgIHZvaWNpbmdOYW1lUmVzcG9uc2U6IG51bGwsXHJcbiAgICAgIHZvaWNpbmdPYmplY3RSZXNwb25zZTogbnVsbCxcclxuICAgICAgdm9pY2luZ0NvbnRleHRSZXNwb25zZTogbnVsbCxcclxuICAgICAgdm9pY2luZ0hpbnRSZXNwb25zZTogbnVsbCxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW8gc3VwcG9ydFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcclxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ0FjY29yZGlvbkJveCcsXHJcbiAgICAgIHBoZXRpb1R5cGU6IEFjY29yZGlvbkJveC5BY2NvcmRpb25Cb3hJTyxcclxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcclxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9GZWF0dXJlZDogdHJ1ZSB9XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyB0aXRsZUJhck9wdGlvbnMgZGVmYXVsdHNcclxuICAgIG9wdGlvbnMudGl0bGVCYXJPcHRpb25zID0gY29tYmluZU9wdGlvbnM8UmVjdGFuZ2xlT3B0aW9ucz4oIHtcclxuICAgICAgZmlsbDogbnVsbCwgLy8ge0NvbG9yfHN0cmluZ3xudWxsfSB0aXRsZSBiYXIgZmlsbFxyXG4gICAgICBzdHJva2U6IG51bGwgLy8ge0NvbG9yfHN0cmluZ3xudWxsfSB0aXRsZSBiYXIgc3Ryb2tlLCB1c2VkIG9ubHkgZm9yIHRoZSBleHBhbmRlZCB0aXRsZSBiYXJcclxuICAgIH0sIG9wdGlvbnMudGl0bGVCYXJPcHRpb25zICk7XHJcblxyXG4gICAgLy8gZXhwYW5kQ29sbGFwc2VCdXR0b25PcHRpb25zIGRlZmF1bHRzXHJcbiAgICBvcHRpb25zLmV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPEV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9ucz4oIHtcclxuICAgICAgc2lkZUxlbmd0aDogMTYsIC8vIGJ1dHRvbiBpcyBhIHNxdWFyZSwgdGhpcyBpcyB0aGUgbGVuZ3RoIG9mIG9uZSBzaWRlXHJcbiAgICAgIGN1cnNvcjogb3B0aW9ucy5jdXJzb3IsXHJcbiAgICAgIHZhbHVlT25Tb3VuZFBsYXllcjogb3B0aW9ucy5leHBhbmRlZFNvdW5kUGxheWVyLFxyXG4gICAgICB2YWx1ZU9mZlNvdW5kUGxheWVyOiBvcHRpb25zLmNvbGxhcHNlZFNvdW5kUGxheWVyLFxyXG5cclxuICAgICAgLy8gdm9pY2luZ1xyXG4gICAgICB2b2ljaW5nTmFtZVJlc3BvbnNlOiBvcHRpb25zLnZvaWNpbmdOYW1lUmVzcG9uc2UsXHJcbiAgICAgIHZvaWNpbmdPYmplY3RSZXNwb25zZTogb3B0aW9ucy52b2ljaW5nT2JqZWN0UmVzcG9uc2UsXHJcbiAgICAgIHZvaWNpbmdDb250ZXh0UmVzcG9uc2U6IG9wdGlvbnMudm9pY2luZ0NvbnRleHRSZXNwb25zZSxcclxuICAgICAgdm9pY2luZ0hpbnRSZXNwb25zZTogb3B0aW9ucy52b2ljaW5nSGludFJlc3BvbnNlLFxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2V4cGFuZENvbGxhcHNlQnV0dG9uJyApXHJcbiAgICB9LCBvcHRpb25zLmV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgdGhpcy5fY29udGVudEFsaWduID0gb3B0aW9ucy5jb250ZW50QWxpZ247XHJcbiAgICB0aGlzLl9jb250ZW50Tm9kZSA9IGNvbnRlbnROb2RlO1xyXG4gICAgdGhpcy5fY29ybmVyUmFkaXVzID0gb3B0aW9ucy5jb3JuZXJSYWRpdXM7XHJcbiAgICB0aGlzLl9idXR0b25YTWFyZ2luID0gb3B0aW9ucy5idXR0b25YTWFyZ2luO1xyXG4gICAgdGhpcy5fYnV0dG9uWU1hcmdpbiA9IG9wdGlvbnMuYnV0dG9uWU1hcmdpbjtcclxuICAgIHRoaXMuX2NvbnRlbnRYTWFyZ2luID0gb3B0aW9ucy5jb250ZW50WE1hcmdpbjtcclxuICAgIHRoaXMuX2NvbnRlbnRZTWFyZ2luID0gb3B0aW9ucy5jb250ZW50WU1hcmdpbjtcclxuICAgIHRoaXMuX2NvbnRlbnRYU3BhY2luZyA9IG9wdGlvbnMuY29udGVudFhTcGFjaW5nO1xyXG4gICAgdGhpcy5fY29udGVudFlTcGFjaW5nID0gb3B0aW9ucy5jb250ZW50WVNwYWNpbmc7XHJcbiAgICB0aGlzLl90aXRsZUFsaWduWCA9IG9wdGlvbnMudGl0bGVBbGlnblg7XHJcbiAgICB0aGlzLl90aXRsZUFsaWduWSA9IG9wdGlvbnMudGl0bGVBbGlnblk7XHJcbiAgICB0aGlzLl90aXRsZVhNYXJnaW4gPSBvcHRpb25zLnRpdGxlWE1hcmdpbjtcclxuICAgIHRoaXMuX3RpdGxlWU1hcmdpbiA9IG9wdGlvbnMudGl0bGVZTWFyZ2luO1xyXG4gICAgdGhpcy5fdGl0bGVYU3BhY2luZyA9IG9wdGlvbnMudGl0bGVYU3BhY2luZztcclxuICAgIHRoaXMuX21pbldpZHRoID0gb3B0aW9ucy5taW5XaWR0aDtcclxuICAgIHRoaXMuX3Nob3dUaXRsZVdoZW5FeHBhbmRlZCA9IG9wdGlvbnMuc2hvd1RpdGxlV2hlbkV4cGFuZGVkO1xyXG4gICAgdGhpcy5fYnV0dG9uQWxpZ24gPSBvcHRpb25zLmJ1dHRvbkFsaWduO1xyXG5cclxuICAgIHRoaXMudGl0bGVOb2RlID0gb3B0aW9ucy50aXRsZU5vZGU7XHJcblxyXG4gICAgLy8gSWYgdGhlcmUgaXMgbm8gdGl0bGVOb2RlIHNwZWNpZmllZCwgd2UnbGwgcHJvdmlkZSBvdXIgb3duLCBhbmQgaGFuZGxlIGRpc3Bvc2FsLlxyXG4gICAgaWYgKCAhdGhpcy50aXRsZU5vZGUgKSB7XHJcbiAgICAgIHRoaXMudGl0bGVOb2RlID0gbmV3IFRleHQoICcnLCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aXRsZVRleHQnIClcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB0aGlzLnRpdGxlTm9kZS5kaXNwb3NlKCkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBbGxvdyB0b3VjaGVzIHRvIGdvIHRocm91Z2ggdG8gdGhlIGNvbGxhcHNlZFRpdGxlQmFyIHdoaWNoIGhhbmRsZXMgdGhlIGlucHV0IGV2ZW50XHJcbiAgICAvLyBOb3RlOiBUaGlzIG11dGF0ZXMgdGhlIHRpdGxlTm9kZSwgc28gaWYgaXQgaXMgdXNlZCBpbiBtdWx0aXBsZSBwbGFjZXMgaXQgd2lsbCBiZWNvbWUgdW5waWNrYWJsZVxyXG4gICAgLy8gaW4gdGhvc2UgcGxhY2VzIGFzIHdlbGwuXHJcbiAgICB0aGlzLnRpdGxlTm9kZS5waWNrYWJsZSA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuZXhwYW5kZWRQcm9wZXJ0eSA9IG9wdGlvbnMuZXhwYW5kZWRQcm9wZXJ0eTtcclxuICAgIGlmICggIXRoaXMuZXhwYW5kZWRQcm9wZXJ0eSApIHtcclxuICAgICAgdGhpcy5leHBhbmRlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZXhwYW5kZWRQcm9wZXJ0eScgKVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuZGlzcG9zZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHRoaXMuZXhwYW5kZWRQcm9wZXJ0eS5kaXNwb3NlKCkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBleHBhbmQvY29sbGFwc2UgYnV0dG9uLCBsaW5rcyB0byBleHBhbmRlZFByb3BlcnR5LCBtdXN0IGJlIGRpc3Bvc2VkIG9mXHJcbiAgICB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uID0gbmV3IEV4cGFuZENvbGxhcHNlQnV0dG9uKCB0aGlzLmV4cGFuZGVkUHJvcGVydHksIG9wdGlvbnMuZXhwYW5kQ29sbGFwc2VCdXR0b25PcHRpb25zICk7XHJcbiAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLmRpc3Bvc2UoKSApO1xyXG5cclxuICAgIC8vIEV4cGFuZGVkIGJveFxyXG4gICAgY29uc3QgYm94T3B0aW9ucyA9IHtcclxuICAgICAgZmlsbDogb3B0aW9ucy5maWxsLFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IG9wdGlvbnMuY29ybmVyUmFkaXVzXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuZXhwYW5kZWRCb3ggPSBuZXcgUmVjdGFuZ2xlKCBib3hPcHRpb25zICk7XHJcbiAgICB0aGlzLmNvbGxhcHNlZEJveCA9IG5ldyBSZWN0YW5nbGUoIGJveE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBUcmFuc3BhcmVudCByZWN0YW5nbGUgZm9yIHdvcmtpbmcgYXJvdW5kIGlzc3VlcyBsaWtlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9ncmFwaGluZy1xdWFkcmF0aWNzL2lzc3Vlcy84Ni5cclxuICAgIC8vIFRoZSBjdXJyZW50IGh5cG90aGVzaXMgaXMgdGhhdCBicm93c2VycyAoaW4gdGhpcyBjYXNlLCBJRTExKSBzb21ldGltZXMgZG9uJ3QgY29tcHV0ZSB0aGUgY29ycmVjdCByZWdpb24gb2YgdGhlXHJcbiAgICAvLyBzY3JlZW4gdGhhdCBuZWVkcyB0byBnZXQgcmVkcmF3biB3aGVuIHNvbWV0aGluZyBjaGFuZ2VzLiBUaGlzIG1lYW5zIHRoYXQgb2xkIGNvbnRlbnQgY2FuIGJlIGxlZnQgaW4gcmVnaW9ucyB3aGVyZVxyXG4gICAgLy8gaXQgaGFzIHNpbmNlIGRpc2FwcGVhcmVkIGluIHRoZSBTVkcuIEFkZGluZyB0cmFuc3BhcmVudCBvYmplY3RzIHRoYXQgYXJlIGEgYml0IGxhcmdlciBzZWVtcyB0byBnZW5lcmFsbHkgd29ya1xyXG4gICAgLy8gKHNpbmNlIGJyb3dzZXJzIGRvbid0IGdldCB0aGUgcmVnaW9uIHdyb25nIGJ5IG1vcmUgdGhhbiBhIGZldyBwaXhlbHMgZ2VuZXJhbGx5KSwgYW5kIGluIHRoZSBwYXN0IGhhcyByZXNvbHZlZCB0aGVcclxuICAgIC8vIGlzc3Vlcy5cclxuICAgIHRoaXMud29ya2Fyb3VuZEJveCA9IG5ldyBSZWN0YW5nbGUoIHtcclxuICAgICAgZmlsbDogJ3RyYW5zcGFyZW50JyxcclxuICAgICAgcGlja2FibGU6IGZhbHNlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5leHBhbmRlZFRpdGxlQmFyID0gbmV3IEludGVyYWN0aXZlSGlnaGxpZ2h0UGF0aCggbnVsbCwgY29tYmluZU9wdGlvbnM8RXhwYW5kQ29sbGFwc2VCdXR0b25PcHRpb25zPigge1xyXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMubGluZVdpZHRoLCAvLyB1c2Ugc2FtZSBsaW5lV2lkdGggYXMgYm94LCBmb3IgY29uc2lzdGVudCBsb29rXHJcbiAgICAgIGN1cnNvcjogb3B0aW9ucy5jdXJzb3JcclxuICAgIH0sIG9wdGlvbnMudGl0bGVCYXJPcHRpb25zICkgKTtcclxuICAgIHRoaXMuZXhwYW5kZWRCb3guYWRkQ2hpbGQoIHRoaXMuZXhwYW5kZWRUaXRsZUJhciApO1xyXG5cclxuICAgIC8vIENvbGxhcHNlZCB0aXRsZSBiYXIgaGFzIGNvcm5lcnMgdGhhdCBtYXRjaCB0aGUgYm94LiBDbGlja2luZyBpdCBvcGVyYXRlcyBsaWtlIGV4cGFuZC9jb2xsYXBzZSBidXR0b24uXHJcbiAgICB0aGlzLmNvbGxhcHNlZFRpdGxlQmFyID0gbmV3IEludGVyYWN0aXZlSGlnaGxpZ2h0UmVjdGFuZ2xlKCBjb21iaW5lT3B0aW9uczxSZWN0YW5nbGVPcHRpb25zPigge1xyXG4gICAgICBjb3JuZXJSYWRpdXM6IG9wdGlvbnMuY29ybmVyUmFkaXVzLFxyXG4gICAgICBjdXJzb3I6IG9wdGlvbnMuY3Vyc29yXHJcbiAgICB9LCBvcHRpb25zLnRpdGxlQmFyT3B0aW9ucyApICk7XHJcbiAgICB0aGlzLmNvbGxhcHNlZEJveC5hZGRDaGlsZCggdGhpcy5jb2xsYXBzZWRUaXRsZUJhciApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgdGhpcy5jb2xsYXBzZWRUaXRsZUJhci5kaXNwb3NlKCk7XHJcbiAgICAgIHRoaXMuZXhwYW5kZWRUaXRsZUJhci5kaXNwb3NlKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgaWYgKCBvcHRpb25zLnRpdGxlQmFyRXhwYW5kQ29sbGFwc2UgKSB7XHJcbiAgICAgIHRoaXMuY29sbGFwc2VkVGl0bGVCYXIuYWRkSW5wdXRMaXN0ZW5lcigge1xyXG4gICAgICAgIGRvd246ICgpID0+IHtcclxuICAgICAgICAgIGlmICggdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbi5pc0VuYWJsZWQoKSApIHtcclxuICAgICAgICAgICAgdGhpcy5waGV0aW9TdGFydEV2ZW50KCAnZXhwYW5kZWQnICk7XHJcbiAgICAgICAgICAgIHRoaXMuZXhwYW5kZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIG9wdGlvbnMuZXhwYW5kZWRTb3VuZFBsYXllci5wbGF5KCk7XHJcbiAgICAgICAgICAgIHRoaXMucGhldGlvRW5kRXZlbnQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gV2hlbiB0aXRsZUJhciBkb2Vzbid0IGV4cGFuZCBvciBjb2xsYXBzZSwgZG9uJ3Qgc2hvdyBpbnRlcmFjdGl2ZSBoaWdobGlnaHRzIGZvciB0aGVtXHJcbiAgICAgIHRoaXMuZXhwYW5kZWRUaXRsZUJhci5pbnRlcmFjdGl2ZUhpZ2hsaWdodCA9ICdpbnZpc2libGUnO1xyXG4gICAgICB0aGlzLmNvbGxhcHNlZFRpdGxlQmFyLmludGVyYWN0aXZlSGlnaGxpZ2h0ID0gJ2ludmlzaWJsZSc7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2V0IHRoZSBpbnB1dCBsaXN0ZW5lcnMgZm9yIHRoZSBleHBhbmRlZFRpdGxlQmFyXHJcbiAgICBpZiAoIG9wdGlvbnMuc2hvd1RpdGxlV2hlbkV4cGFuZGVkICkge1xyXG4gICAgICBpZiAoIG9wdGlvbnMudGl0bGVCYXJFeHBhbmRDb2xsYXBzZSApIHtcclxuICAgICAgICB0aGlzLmV4cGFuZGVkVGl0bGVCYXIuYWRkSW5wdXRMaXN0ZW5lcigge1xyXG4gICAgICAgICAgZG93bjogKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24uaXNFbmFibGVkKCkgKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5waGV0aW9TdGFydEV2ZW50KCAnY29sbGFwc2VkJyApO1xyXG4gICAgICAgICAgICAgIG9wdGlvbnMuY29sbGFwc2VkU291bmRQbGF5ZXIucGxheSgpO1xyXG4gICAgICAgICAgICAgIHRoaXMuZXhwYW5kZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIHRoaXMucGhldGlvRW5kRXZlbnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHdlIGhpZGUgdGhlIGJ1dHRvbiBvciBtYWtlIGl0IHVucGlja2FibGUsIGRpc2FibGUgaW50ZXJhY3Rpdml0eSBvZiB0aGUgdGl0bGUgYmFyLFxyXG4gICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzQ3NyBhbmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvNTczLlxyXG4gICAgY29uc3QgcGlja2FibGVMaXN0ZW5lciA9ICgpID0+IHtcclxuICAgICAgY29uc3QgcGlja2FibGUgPSB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLnZpc2libGUgJiYgdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbi5waWNrYWJsZTtcclxuICAgICAgdGhpcy5jb2xsYXBzZWRUaXRsZUJhci5waWNrYWJsZSA9IHBpY2thYmxlO1xyXG4gICAgICB0aGlzLmV4cGFuZGVkVGl0bGVCYXIucGlja2FibGUgPSBwaWNrYWJsZTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gQWRkIGxpc3RlbmVycyB0byB0aGUgZXhwYW5kL2NvbGxhcHNlIGJ1dHRvbi4gIFRoZXNlIGRvIG5vdCBuZWVkIHRvIGJlIHVubGlua2VkIGJlY2F1c2UgdGhpcyBjb21wb25lbnQgb3ducyB0aGVcclxuICAgIC8vIGJ1dHRvbi5cclxuICAgIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24udmlzaWJsZVByb3BlcnR5LmxhenlMaW5rKCBwaWNrYWJsZUxpc3RlbmVyICk7XHJcbiAgICB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLnBpY2thYmxlUHJvcGVydHkubGF6eUxpbmsoIHBpY2thYmxlTGlzdGVuZXIgKTtcclxuICAgIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24uZW5hYmxlZFByb3BlcnR5LmxpbmsoIGVuYWJsZWQgPT4ge1xyXG5cclxuICAgICAgLy8gU2luY2UgdGhlcmUgYXJlIGxpc3RlbmVycyBvbiB0aGUgdGl0bGVCYXJzIGZyb20gSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcsIHNldHRpbmcgcGlja2FibGU6IGZhbHNlIGlzbid0IGVub3VnaFxyXG4gICAgICAvLyB0byBoaWRlIHBvaW50ZXIgY3Vyc29yLlxyXG4gICAgICBjb25zdCBzaG93Q3Vyc29yID0gb3B0aW9ucy50aXRsZUJhckV4cGFuZENvbGxhcHNlICYmIGVuYWJsZWQ7XHJcbiAgICAgIHRoaXMuY29sbGFwc2VkVGl0bGVCYXIuY3Vyc29yID0gc2hvd0N1cnNvciA/ICggb3B0aW9ucy5jdXJzb3IgfHwgbnVsbCApIDogbnVsbDtcclxuICAgICAgdGhpcy5leHBhbmRlZFRpdGxlQmFyLmN1cnNvciA9IHNob3dDdXJzb3IgPyAoIG9wdGlvbnMuY3Vyc29yIHx8IG51bGwgKSA6IG51bGw7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBmb2N1c0hpZ2hsaWdodCBmb3IgdGhlIGludGVyYWN0aXZlIFBET00gZWxlbWVudCBiYXNlZCBvbiB0aGUgZGltZW5zaW9ucyBvZiB0aGUgd2hvbGUgdGl0bGUgYmFyLlxyXG4gICAgdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbi5zZXRGb2N1c0hpZ2hsaWdodCggbmV3IEZvY3VzSGlnaGxpZ2h0RnJvbU5vZGUoIHRoaXMuZXhwYW5kZWRUaXRsZUJhciApICk7XHJcblxyXG4gICAgLy8gb3B0aW9uYWwgYm94IG91dGxpbmUsIG9uIHRvcCBvZiBldmVyeXRoaW5nIGVsc2VcclxuICAgIGlmICggb3B0aW9ucy5zdHJva2UgKSB7XHJcblxyXG4gICAgICBjb25zdCBvdXRsaW5lT3B0aW9ucyA9IHtcclxuICAgICAgICBzdHJva2U6IG9wdGlvbnMuc3Ryb2tlLFxyXG4gICAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5saW5lV2lkdGgsXHJcbiAgICAgICAgY29ybmVyUmFkaXVzOiBvcHRpb25zLmNvcm5lclJhZGl1cyxcclxuXHJcbiAgICAgICAgLy8gZG9uJ3Qgb2NjbHVkZSBpbnB1dCBldmVudHMgZnJvbSB0aGUgY29sbGFwc2VkVGl0bGVCYXIsIHdoaWNoIGhhbmRsZXMgdGhlIGV2ZW50c1xyXG4gICAgICAgIHBpY2thYmxlOiBmYWxzZVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdGhpcy5leHBhbmRlZEJveE91dGxpbmUgPSBuZXcgUmVjdGFuZ2xlKCBvdXRsaW5lT3B0aW9ucyApO1xyXG4gICAgICB0aGlzLmV4cGFuZGVkQm94LmFkZENoaWxkKCB0aGlzLmV4cGFuZGVkQm94T3V0bGluZSApO1xyXG5cclxuICAgICAgdGhpcy5jb2xsYXBzZWRCb3hPdXRsaW5lID0gbmV3IFJlY3RhbmdsZSggb3V0bGluZU9wdGlvbnMgKTtcclxuICAgICAgdGhpcy5jb2xsYXBzZWRCb3guYWRkQ2hpbGQoIHRoaXMuY29sbGFwc2VkQm94T3V0bGluZSApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZXhwYW5kZWRCb3guYWRkQ2hpbGQoIHRoaXMuX2NvbnRlbnROb2RlICk7XHJcblxyXG4gICAgLy8gSG9sZHMgdGhlIG1haW4gY29tcG9uZW50cyB3aGVuIHRoZSBjb250ZW50J3MgYm91bmRzIGFyZSB2YWxpZFxyXG4gICAgdGhpcy5jb250YWluZXJOb2RlID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuY29udGFpbmVyTm9kZSApO1xyXG5cclxuICAgIC8vIHBkb20gZGlzcGxheVxyXG4gICAgY29uc3QgcGRvbUNvbnRlbnROb2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgdGFnTmFtZTogJ2RpdicsXHJcbiAgICAgIGFyaWFSb2xlOiAncmVnaW9uJyxcclxuICAgICAgcGRvbU9yZGVyOiBbIHRoaXMuX2NvbnRlbnROb2RlIF0sXHJcbiAgICAgIGFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zOiBbIHtcclxuICAgICAgICBvdGhlck5vZGU6IHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24sXHJcbiAgICAgICAgb3RoZXJFbGVtZW50TmFtZTogUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HLFxyXG4gICAgICAgIHRoaXNFbGVtZW50TmFtZTogUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HXHJcbiAgICAgIH0gXVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgcGRvbUhlYWRpbmcgPSBuZXcgTm9kZSgge1xyXG4gICAgICB0YWdOYW1lOiBvcHRpb25zLmhlYWRpbmdUYWdOYW1lLFxyXG4gICAgICBwZG9tT3JkZXI6IFsgdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbiBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgcGRvbUNvbnRhaW5lck5vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogWyBwZG9tSGVhZGluZywgcGRvbUNvbnRlbnROb2RlIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHBkb21Db250YWluZXJOb2RlICk7XHJcblxyXG4gICAgdGhpcy5sYXlvdXQoKTtcclxuXHJcbiAgICAvLyBXYXRjaCBmdXR1cmUgY2hhbmdlcyBmb3IgcmUtbGF5b3V0IChkb24ndCB3YW50IHRvIHRyaWdnZXIgb24gb3VyIGZpcnN0IGxheW91dCBhbmQgcXVldWUgdXNlbGVzcyBvbmVzKVxyXG4gICAgaWYgKCBvcHRpb25zLnJlc2l6ZSApIHtcclxuICAgICAgY29uc3QgbGF5b3V0TGlzdGVuZXIgPSB0aGlzLmxheW91dC5iaW5kKCB0aGlzICk7XHJcbiAgICAgIGNvbnRlbnROb2RlLmJvdW5kc1Byb3BlcnR5LmxhenlMaW5rKCBsYXlvdXRMaXN0ZW5lciApO1xyXG4gICAgICB0aGlzLnRpdGxlTm9kZS5ib3VuZHNQcm9wZXJ0eS5sYXp5TGluayggbGF5b3V0TGlzdGVuZXIgKTtcclxuICAgICAgdGhpcy5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgIGNvbnRlbnROb2RlLmJvdW5kc1Byb3BlcnR5LnVubGluayggbGF5b3V0TGlzdGVuZXIgKTtcclxuICAgICAgICB0aGlzLnRpdGxlTm9kZS5ib3VuZHNQcm9wZXJ0eS51bmxpbmsoIGxheW91dExpc3RlbmVyICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBleHBhbmQvY29sbGFwc2UgdGhlIGJveFxyXG4gICAgY29uc3QgZXhwYW5kZWRQcm9wZXJ0eU9ic2VydmVyID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCBleHBhbmRlZCA9IHRoaXMuZXhwYW5kZWRQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgIHRoaXMuZXhwYW5kZWRCb3gudmlzaWJsZSA9IGV4cGFuZGVkO1xyXG4gICAgICB0aGlzLmNvbGxhcHNlZEJveC52aXNpYmxlID0gIWV4cGFuZGVkO1xyXG5cclxuICAgICAgLy8gTk9URTogVGhpcyBkb2VzIG5vdCBpbmNyZWFzZSB0aGUgYm91bmRzIG9mIHRoZSBBY2NvcmRpb25Cb3gsIHNpbmNlIHRoZSBsb2NhbEJvdW5kcyBmb3IgdGhlIHdvcmthcm91bmRCb3ggaGF2ZVxyXG4gICAgICAvLyBiZWVuIHNldCBlbHNld2hlcmUuXHJcbiAgICAgIHRoaXMud29ya2Fyb3VuZEJveC5yZWN0Qm91bmRzID0gKCBleHBhbmRlZCA/IHRoaXMuZXhwYW5kZWRCb3ggOiB0aGlzLmNvbGxhcHNlZEJveCApLmJvdW5kcy5kaWxhdGVkKCAxMCApO1xyXG5cclxuICAgICAgdGhpcy50aXRsZU5vZGUudmlzaWJsZSA9ICggZXhwYW5kZWQgJiYgb3B0aW9ucy5zaG93VGl0bGVXaGVuRXhwYW5kZWQgKSB8fCAhZXhwYW5kZWQ7XHJcblxyXG4gICAgICBwZG9tQ29udGFpbmVyTm9kZS5zZXRQRE9NQXR0cmlidXRlKCAnYXJpYS1oaWRkZW4nLCAhZXhwYW5kZWQgKTtcclxuXHJcbiAgICAgIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24udm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlKCB7XHJcbiAgICAgICAgaGludFJlc3BvbnNlOiBudWxsXHJcbiAgICAgIH0gKTtcclxuICAgIH07XHJcbiAgICB0aGlzLmV4cGFuZGVkUHJvcGVydHkubGluayggZXhwYW5kZWRQcm9wZXJ0eU9ic2VydmVyICk7XHJcbiAgICB0aGlzLmV4cGFuZGVkQm94LmJvdW5kc1Byb3BlcnR5LmxpbmsoIGV4cGFuZGVkUHJvcGVydHlPYnNlcnZlciApO1xyXG4gICAgdGhpcy5jb2xsYXBzZWRCb3guYm91bmRzUHJvcGVydHkubGluayggZXhwYW5kZWRQcm9wZXJ0eU9ic2VydmVyICk7XHJcbiAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB0aGlzLmV4cGFuZGVkUHJvcGVydHkudW5saW5rKCBleHBhbmRlZFByb3BlcnR5T2JzZXJ2ZXIgKSApO1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCBfLm9taXQoIG9wdGlvbnMsICdjdXJzb3InICkgKTtcclxuXHJcbiAgICAvLyByZXNldCB0aGluZ3MgdGhhdCBhcmUgb3duZWQgYnkgQWNjb3JkaW9uQm94XHJcbiAgICB0aGlzLnJlc2V0QWNjb3JkaW9uQm94ID0gKCkgPT4ge1xyXG5cclxuICAgICAgLy8gSWYgZXhwYW5kZWRQcm9wZXJ0eSB3YXNuJ3QgcHJvdmlkZWQgdmlhIG9wdGlvbnMsIHdlIG93biBpdCBhbmQgdGhlcmVmb3JlIG5lZWQgdG8gcmVzZXQgaXQuXHJcbiAgICAgIGlmICggIW9wdGlvbnMuZXhwYW5kZWRQcm9wZXJ0eSApIHtcclxuICAgICAgICB0aGlzLmV4cGFuZGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcclxuICAgIGFzc2VydCAmJiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3N1bicsICdBY2NvcmRpb25Cb3gnLCB0aGlzICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnJlc2V0QWNjb3JkaW9uQm94KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQZXJmb3JtcyBsYXlvdXQgdGhhdCBwb3NpdGlvbnMgZXZlcnl0aGluZyB0aGF0IGNhbiBjaGFuZ2UuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBsYXlvdXQoKTogdm9pZCB7XHJcbiAgICBjb25zdCBoYXNWYWxpZEJvdW5kcyA9IHRoaXMuX2NvbnRlbnROb2RlLmJvdW5kcy5pc1ZhbGlkKCk7XHJcbiAgICB0aGlzLmNvbnRhaW5lck5vZGUuY2hpbGRyZW4gPSBoYXNWYWxpZEJvdW5kcyA/IFtcclxuICAgICAgdGhpcy5leHBhbmRlZEJveCxcclxuICAgICAgdGhpcy5jb2xsYXBzZWRCb3gsXHJcbiAgICAgIHRoaXMud29ya2Fyb3VuZEJveCxcclxuICAgICAgdGhpcy50aXRsZU5vZGUsXHJcbiAgICAgIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b25cclxuICAgIF0gOiBbXTtcclxuXHJcbiAgICBpZiAoICFoYXNWYWxpZEJvdW5kcyApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNvbGxhcHNlZEJveEhlaWdodCA9IHRoaXMuZ2V0Q29sbGFwc2VkQm94SGVpZ2h0KCk7XHJcbiAgICBjb25zdCBib3hXaWR0aCA9IHRoaXMuZ2V0Qm94V2lkdGgoKTtcclxuICAgIGNvbnN0IGV4cGFuZGVkQm94SGVpZ2h0ID0gdGhpcy5nZXRFeHBhbmRlZEJveEhlaWdodCgpO1xyXG5cclxuICAgIHRoaXMuZXhwYW5kZWRCb3gucmVjdFdpZHRoID0gYm94V2lkdGg7XHJcbiAgICB0aGlzLmV4cGFuZGVkQm94LnJlY3RIZWlnaHQgPSBleHBhbmRlZEJveEhlaWdodDtcclxuXHJcbiAgICBjb25zdCBleHBhbmRlZEJvdW5kcyA9IHRoaXMuZXhwYW5kZWRCb3guc2VsZkJvdW5kcztcclxuXHJcbiAgICAvLyBleHBhbmRlZEJveE91dGxpbmUgZXhpc3RzIG9ubHkgaWYgb3B0aW9ucy5zdHJva2UgaXMgdHJ1dGh5XHJcbiAgICBpZiAoIHRoaXMuZXhwYW5kZWRCb3hPdXRsaW5lICkge1xyXG4gICAgICB0aGlzLmV4cGFuZGVkQm94T3V0bGluZS5yZWN0V2lkdGggPSBib3hXaWR0aDtcclxuICAgICAgdGhpcy5leHBhbmRlZEJveE91dGxpbmUucmVjdEhlaWdodCA9IGV4cGFuZGVkQm94SGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZXhwYW5kZWRUaXRsZUJhci5zaGFwZSA9IHRoaXMuZ2V0VGl0bGVCYXJTaGFwZSgpO1xyXG5cclxuICAgIHRoaXMuY29sbGFwc2VkQm94LnJlY3RXaWR0aCA9IGJveFdpZHRoO1xyXG4gICAgdGhpcy5jb2xsYXBzZWRCb3gucmVjdEhlaWdodCA9IGNvbGxhcHNlZEJveEhlaWdodDtcclxuXHJcbiAgICB0aGlzLmNvbGxhcHNlZFRpdGxlQmFyLnJlY3RXaWR0aCA9IGJveFdpZHRoO1xyXG4gICAgdGhpcy5jb2xsYXBzZWRUaXRsZUJhci5yZWN0SGVpZ2h0ID0gY29sbGFwc2VkQm94SGVpZ2h0O1xyXG5cclxuICAgIC8vIGNvbGxhcHNlZEJveE91dGxpbmUgZXhpc3RzIG9ubHkgaWYgb3B0aW9ucy5zdHJva2UgaXMgdHJ1dGh5XHJcbiAgICBpZiAoIHRoaXMuY29sbGFwc2VkQm94T3V0bGluZSApIHtcclxuICAgICAgdGhpcy5jb2xsYXBzZWRCb3hPdXRsaW5lLnJlY3RXaWR0aCA9IGJveFdpZHRoO1xyXG4gICAgICB0aGlzLmNvbGxhcHNlZEJveE91dGxpbmUucmVjdEhlaWdodCA9IGNvbGxhcHNlZEJveEhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJTVBPUlRBTlQ6IFRoZSBjb2xsYXBzZWRCb3ggc2hvdWxkIG5vdyBiZSBmdWxseSBsYWlkIG91dCBiZWZvcmUgdGhpcy4gTm93IHdlIGNhbiB1c2UgaXRzIGJvdW5kcyB0byBzZXQgdGhlXHJcbiAgICAvLyB3b3JrYXJvdW5kQm94XHJcbiAgICB0aGlzLndvcmthcm91bmRCb3gubG9jYWxCb3VuZHMgPSB0aGlzLmNvbGxhcHNlZEJveC5ib3VuZHM7XHJcblxyXG4gICAgLy8gY29udGVudCBsYXlvdXRcclxuICAgIHRoaXMuX2NvbnRlbnROb2RlLmJvdHRvbSA9IGV4cGFuZGVkQm91bmRzLmJvdHRvbSAtIHRoaXMuX2NvbnRlbnRZTWFyZ2luO1xyXG4gICAgbGV0IGNvbnRlbnRTcGFuTGVmdCA9IGV4cGFuZGVkQm91bmRzLmxlZnQgKyB0aGlzLl9jb250ZW50WE1hcmdpbjtcclxuICAgIGxldCBjb250ZW50U3BhblJpZ2h0ID0gZXhwYW5kZWRCb3VuZHMucmlnaHQgLSB0aGlzLl9jb250ZW50WE1hcmdpbjtcclxuICAgIGlmICggIXRoaXMuX3Nob3dUaXRsZVdoZW5FeHBhbmRlZCApIHtcclxuICAgICAgLy8gY29udGVudCB3aWxsIGJlIHBsYWNlZCBuZXh0IHRvIGJ1dHRvblxyXG4gICAgICBpZiAoIHRoaXMuX2J1dHRvbkFsaWduID09PSAnbGVmdCcgKSB7XHJcbiAgICAgICAgY29udGVudFNwYW5MZWZ0ICs9IHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24ud2lkdGggKyB0aGlzLl9jb250ZW50WFNwYWNpbmc7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7IC8vIHJpZ2h0IG9uIHJpZ2h0XHJcbiAgICAgICAgY29udGVudFNwYW5SaWdodCAtPSB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLndpZHRoICsgdGhpcy5fY29udGVudFhTcGFjaW5nO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoIHRoaXMuX2NvbnRlbnRBbGlnbiA9PT0gJ2xlZnQnICkge1xyXG4gICAgICB0aGlzLl9jb250ZW50Tm9kZS5sZWZ0ID0gY29udGVudFNwYW5MZWZ0O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuX2NvbnRlbnRBbGlnbiA9PT0gJ3JpZ2h0JyApIHtcclxuICAgICAgdGhpcy5fY29udGVudE5vZGUucmlnaHQgPSBjb250ZW50U3BhblJpZ2h0O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7IC8vIGNlbnRlclxyXG4gICAgICB0aGlzLl9jb250ZW50Tm9kZS5jZW50ZXJYID0gKCBjb250ZW50U3BhbkxlZnQgKyBjb250ZW50U3BhblJpZ2h0ICkgLyAyO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGJ1dHRvbiBob3Jpem9udGFsIGxheW91dFxyXG4gICAgbGV0IHRpdGxlTGVmdFNwYW4gPSBleHBhbmRlZEJvdW5kcy5sZWZ0ICsgdGhpcy5fdGl0bGVYTWFyZ2luO1xyXG4gICAgbGV0IHRpdGxlUmlnaHRTcGFuID0gZXhwYW5kZWRCb3VuZHMucmlnaHQgLSB0aGlzLl90aXRsZVhNYXJnaW47XHJcbiAgICBpZiAoIHRoaXMuX2J1dHRvbkFsaWduID09PSAnbGVmdCcgKSB7XHJcbiAgICAgIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24ubGVmdCA9IGV4cGFuZGVkQm91bmRzLmxlZnQgKyB0aGlzLl9idXR0b25YTWFyZ2luO1xyXG4gICAgICB0aXRsZUxlZnRTcGFuID0gdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbi5yaWdodCArIHRoaXMuX3RpdGxlWFNwYWNpbmc7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbi5yaWdodCA9IGV4cGFuZGVkQm91bmRzLnJpZ2h0IC0gdGhpcy5fYnV0dG9uWE1hcmdpbjtcclxuICAgICAgdGl0bGVSaWdodFNwYW4gPSB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLmxlZnQgLSB0aGlzLl90aXRsZVhTcGFjaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRpdGxlIGhvcml6b250YWwgbGF5b3V0XHJcbiAgICBpZiAoIHRoaXMuX3RpdGxlQWxpZ25YID09PSAnbGVmdCcgKSB7XHJcbiAgICAgIHRoaXMudGl0bGVOb2RlLmxlZnQgPSB0aXRsZUxlZnRTcGFuO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuX3RpdGxlQWxpZ25YID09PSAncmlnaHQnICkge1xyXG4gICAgICB0aGlzLnRpdGxlTm9kZS5yaWdodCA9IHRpdGxlUmlnaHRTcGFuO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7IC8vIGNlbnRlclxyXG4gICAgICB0aGlzLnRpdGxlTm9kZS5jZW50ZXJYID0gZXhwYW5kZWRCb3VuZHMuY2VudGVyWDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBidXR0b24gJiB0aXRsZSB2ZXJ0aWNhbCBsYXlvdXRcclxuICAgIGlmICggdGhpcy5fdGl0bGVBbGlnblkgPT09ICd0b3AnICkge1xyXG4gICAgICB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLnRvcCA9IHRoaXMuY29sbGFwc2VkQm94LnRvcCArIE1hdGgubWF4KCB0aGlzLl9idXR0b25ZTWFyZ2luLCB0aGlzLl90aXRsZVlNYXJnaW4gKTtcclxuICAgICAgdGhpcy50aXRsZU5vZGUudG9wID0gdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbi50b3A7XHJcbiAgICB9XHJcbiAgICBlbHNlIHsgLy8gY2VudGVyXHJcbiAgICAgIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24uY2VudGVyWSA9IHRoaXMuY29sbGFwc2VkQm94LmNlbnRlclk7XHJcbiAgICAgIHRoaXMudGl0bGVOb2RlLmNlbnRlclkgPSB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLmNlbnRlclk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBTaGFwZSBvZiB0aGUgdGl0bGUgYmFyLlxyXG4gICAqXHJcbiAgICogRXhwYW5kZWQgdGl0bGUgYmFyIGhhcyAob3B0aW9uYWwpIHJvdW5kZWQgdG9wIGNvcm5lcnMsIHNxdWFyZSBib3R0b20gY29ybmVycy4gQ2xpY2tpbmcgaXQgb3BlcmF0ZXMgbGlrZVxyXG4gICAqIGV4cGFuZC9jb2xsYXBzZSBidXR0b24uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRUaXRsZUJhclNoYXBlKCk6IFNoYXBlIHtcclxuICAgIHJldHVybiBTaGFwZS5yb3VuZGVkUmVjdGFuZ2xlV2l0aFJhZGlpKCAwLCAwLCB0aGlzLmdldEJveFdpZHRoKCksIHRoaXMuZ2V0Q29sbGFwc2VkQm94SGVpZ2h0KCksIHtcclxuICAgICAgdG9wTGVmdDogdGhpcy5fY29ybmVyUmFkaXVzLFxyXG4gICAgICB0b3BSaWdodDogdGhpcy5fY29ybmVyUmFkaXVzXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjb21wdXRlZCB3aWR0aCBvZiB0aGUgYm94IChpZ25vcmluZyB0aGluZ3MgbGlrZSBzdHJva2Ugd2lkdGgpXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRCb3hXaWR0aCgpOiBudW1iZXIge1xyXG5cclxuICAgIC8vIEluaXRpYWwgd2lkdGggaXMgZGVwZW5kZW50IG9uIHdpZHRoIG9mIHRpdGxlIHNlY3Rpb24gb2YgdGhlIGFjY29yZGlvbiBib3hcclxuICAgIGxldCB3aWR0aCA9IE1hdGgubWF4KCB0aGlzLl9taW5XaWR0aCwgdGhpcy5fYnV0dG9uWE1hcmdpbiArIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24ud2lkdGggKyB0aGlzLl90aXRsZVhTcGFjaW5nICsgdGhpcy50aXRsZU5vZGUud2lkdGggKyB0aGlzLl90aXRsZVhNYXJnaW4gKTtcclxuXHJcbiAgICAvLyBMaW1pdCB3aWR0aCBieSB0aGUgbmVjZXNzYXJ5IHNwYWNlIGZvciB0aGUgdGl0bGUgbm9kZVxyXG4gICAgaWYgKCB0aGlzLl90aXRsZUFsaWduWCA9PT0gJ2NlbnRlcicgKSB7XHJcbiAgICAgIC8vIEhhbmRsZXMgY2FzZSB3aGVyZSB0aGUgc3BhY2luZyBvbiB0aGUgbGVmdCBzaWRlIG9mIHRoZSB0aXRsZSBpcyBsYXJnZXIgdGhhbiB0aGUgc3BhY2luZyBvbiB0aGUgcmlnaHQgc2lkZS5cclxuICAgICAgd2lkdGggPSBNYXRoLm1heCggd2lkdGgsICggdGhpcy5fYnV0dG9uWE1hcmdpbiArIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24ud2lkdGggKyB0aGlzLl90aXRsZVhTcGFjaW5nICkgKiAyICsgdGhpcy50aXRsZU5vZGUud2lkdGggKTtcclxuXHJcbiAgICAgIC8vIEhhbmRsZXMgY2FzZSB3aGVyZSB0aGUgc3BhY2luZyBvbiB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgdGl0bGUgaXMgbGFyZ2VyIHRoYW4gdGhlIHNwYWNpbmcgb24gdGhlIGxlZnQgc2lkZS5cclxuICAgICAgd2lkdGggPSBNYXRoLm1heCggd2lkdGgsICggdGhpcy5fdGl0bGVYTWFyZ2luICkgKiAyICsgdGhpcy50aXRsZU5vZGUud2lkdGggKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDb21wYXJlIHdpZHRoIG9mIHRpdGxlIHNlY3Rpb24gdG8gY29udGVudCBzZWN0aW9uIG9mIHRoZSBhY2NvcmRpb24gYm94XHJcbiAgICAvLyBjb250ZW50IGlzIGJlbG93IGJ1dHRvbit0aXRsZVxyXG4gICAgaWYgKCB0aGlzLl9zaG93VGl0bGVXaGVuRXhwYW5kZWQgKSB7XHJcbiAgICAgIHJldHVybiBNYXRoLm1heCggd2lkdGgsIHRoaXMuX2NvbnRlbnROb2RlLndpZHRoICsgKCAyICogdGhpcy5fY29udGVudFhNYXJnaW4gKSApO1xyXG4gICAgfVxyXG4gICAgLy8gY29udGVudCBpcyBuZXh0IHRvIGJ1dHRvblxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBNYXRoLm1heCggd2lkdGgsIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24ud2lkdGggKyB0aGlzLl9jb250ZW50Tm9kZS53aWR0aCArIHRoaXMuX2J1dHRvblhNYXJnaW4gKyB0aGlzLl9jb250ZW50WE1hcmdpbiArIHRoaXMuX2NvbnRlbnRYU3BhY2luZyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgaWRlYWwgaGVpZ2h0IG9mIHRoZSBjb2xsYXBzZWQgYm94IChpZ25vcmluZyB0aGluZ3MgbGlrZSBzdHJva2Ugd2lkdGgpXHJcbiAgICovXHJcbiAgcHVibGljIGdldENvbGxhcHNlZEJveEhlaWdodCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIE1hdGgubWF4KCB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLmhlaWdodCArICggMiAqIHRoaXMuX2J1dHRvbllNYXJnaW4gKSwgdGhpcy50aXRsZU5vZGUuaGVpZ2h0ICsgKCAyICogdGhpcy5fdGl0bGVZTWFyZ2luICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGlkZWFsIGhlaWdodCBvZiB0aGUgZXhwYW5kZWQgYm94IChpZ25vcmluZyB0aGluZ3MgbGlrZSBzdHJva2Ugd2lkdGgpXHJcbiAgICovXHJcbiAgcHVibGljIGdldEV4cGFuZGVkQm94SGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICAvLyBjb250ZW50IGlzIGJlbG93IGJ1dHRvbit0aXRsZVxyXG4gICAgaWYgKCB0aGlzLl9zaG93VGl0bGVXaGVuRXhwYW5kZWQgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmdldENvbGxhcHNlZEJveEhlaWdodCgpICsgdGhpcy5fY29udGVudE5vZGUuaGVpZ2h0ICsgdGhpcy5fY29udGVudFlNYXJnaW4gKyB0aGlzLl9jb250ZW50WVNwYWNpbmc7XHJcbiAgICB9XHJcbiAgICAvLyBjb250ZW50IGlzIG5leHQgdG8gYnV0dG9uXHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIE1hdGgubWF4KCB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLmhlaWdodCArICggMiAqIHRoaXMuX2J1dHRvbllNYXJnaW4gKSwgdGhpcy5fY29udGVudE5vZGUuaGVpZ2h0ICsgKCAyICogdGhpcy5fY29udGVudFlNYXJnaW4gKSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVGhlIGRlZmluaXRpb24gZm9yIGhvdyBBY2NvcmRpb25Cb3ggc2V0cyBpdHMgYWNjZXNzaWJsZU5hbWUgaW4gdGhlIFBET00uIEZvcndhcmQgaXQgb250byBpdHMgZXhwYW5kQ29sbGFwc2VCdXR0b24uXHJcbiAgLy8gU2VlIEFjY29yZGlvbkJveC5tZCBmb3IgZnVydGhlciBzdHlsZSBndWlkZSBhbmQgZG9jdW1lbnRhdGlvbiBvbiB0aGUgcGF0dGVybi5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEFDQ09SRElPTl9CT1hfQUNDRVNTSUJMRV9OQU1FX0JFSEFWSU9SOiBQRE9NQmVoYXZpb3JGdW5jdGlvbiA9XHJcbiAgICAoIG5vZGUsIG9wdGlvbnMsIGFjY2Vzc2libGVOYW1lOiBzdHJpbmcgfCBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCBjYWxsYmFja3NGb3JPdGhlck5vZGVzICkgPT4ge1xyXG4gICAgICBjYWxsYmFja3NGb3JPdGhlck5vZGVzLnB1c2goICgpID0+IHtcclxuICAgICAgICAoIG5vZGUgYXMgQWNjb3JkaW9uQm94ICkuZXhwYW5kQ29sbGFwc2VCdXR0b24uYWNjZXNzaWJsZU5hbWUgPSBhY2Nlc3NpYmxlTmFtZTtcclxuICAgICAgfSApO1xyXG4gICAgICByZXR1cm4gb3B0aW9ucztcclxuICAgIH07XHJcbn1cclxuXHJcbmNsYXNzIEludGVyYWN0aXZlSGlnaGxpZ2h0UGF0aCBleHRlbmRzIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nKCBQYXRoICkge31cclxuXHJcbmNsYXNzIEludGVyYWN0aXZlSGlnaGxpZ2h0UmVjdGFuZ2xlIGV4dGVuZHMgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcoIFJlY3RhbmdsZSApIHt9XHJcblxyXG5zdW4ucmVnaXN0ZXIoICdBY2NvcmRpb25Cb3gnLCBBY2NvcmRpb25Cb3ggKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLGtDQUFrQztBQUU5RCxTQUFTQyxLQUFLLFFBQVEsMEJBQTBCO0FBQ2hELE9BQU9DLGdCQUFnQixNQUFNLHNEQUFzRDtBQUNuRixPQUFPQyxTQUFTLElBQUlDLGNBQWMsUUFBUSxpQ0FBaUM7QUFFM0UsU0FBU0Msc0JBQXNCLEVBQUVDLHVCQUF1QixFQUFFQyxJQUFJLEVBQWVDLElBQUksRUFBd0JDLFFBQVEsRUFBRUMsU0FBUyxFQUE0QkMsSUFBSSxRQUFRLDZCQUE2QjtBQUNqTSxPQUFPQyw2QkFBNkIsTUFBTSxzRUFBc0U7QUFDaEgsT0FBT0MsNkJBQTZCLE1BQU0sc0VBQXNFO0FBRWhILE9BQU9DLFNBQVMsTUFBTSw4QkFBOEI7QUFDcEQsT0FBT0MsTUFBTSxNQUFNLDJCQUEyQjtBQUM5QyxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBRXBELE9BQU9DLG9CQUFvQixNQUF1QywyQkFBMkI7QUFDN0YsT0FBT0MsR0FBRyxNQUFNLFVBQVU7O0FBRzFCOztBQXNEQSxl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