// Copyright 2017-2023, University of Colorado Boulder

/**
 * Displays rich text by interpreting the input text as HTML, supporting a limited set of tags that prevent any
 * security vulnerabilities. It does this by parsing the input HTML and splitting it into multiple Text children
 * recursively.
 *
 * NOTE: Encoding HTML entities is required, and malformed HTML is not accepted.
 *
 * NOTE: Currently it can line-wrap at the start and end of tags. This will probably be fixed in the future to only
 *       potentially break on whitespace.
 *
 * It supports the following markup and features in the string content (in addition to other options as listed in
 * RICH_TEXT_OPTION_KEYS):
 * - <a href="{{placeholder}}"> for links (pass in { links: { placeholder: ACTUAL_HREF } })
 * - <b> and <strong> for bold text
 * - <i> and <em> for italic text
 * - <sub> and <sup> for subscripts / superscripts
 * - <u> for underlined text
 * - <s> for strikethrough text
 * - <span> tags with a dir="ltr" / dir="rtl" attribute
 * - <br> for explicit line breaks
 * - <node id="id"> for embedding a Node into the text (pass in { nodes: { id: NODE } }), with optional align attribute
 * - Unicode bidirectional marks (present in PhET strings) for full RTL support
 * - CSS style="..." attributes, with color and font settings, see https://github.com/phetsims/scenery/issues/807
 *
 * Examples from the scenery-phet demo:
 *
 * new RichText( 'RichText can have <b>bold</b> and <i>italic</i> text.' ),
 * new RichText( 'Can do H<sub>2</sub>O (A<sub>sub</sub> and A<sup>sup</sup>), or nesting: x<sup>2<sup>2</sup></sup>' ),
 * new RichText( 'Additionally: <span style="color: blue;">color</span>, <span style="font-size: 30px;">sizes</span>, <span style="font-family: serif;">faces</span>, <s>strikethrough</s>, and <u>underline</u>' ),
 * new RichText( 'These <b><em>can</em> <u><span style="color: red;">be</span> mixed<sup>1</sup></u></b>.' ),
 * new RichText( '\u202aHandles bidirectional text: \u202b<span style="color: #0a0;">مقابض</span> النص ثنائي <b>الاتجاه</b><sub>2</sub>\u202c\u202c' ),
 * new RichText( '\u202b\u062a\u0633\u062a (\u0632\u0628\u0627\u0646)\u202c' ),
 * new RichText( 'HTML entities need to be escaped, like &amp; and &lt;.' ),
 * new RichText( 'Supports <a href="{{phetWebsite}}"><em>links</em> with <b>markup</b></a>, and <a href="{{callback}}">links that call functions</a>.', {
 *   links: {
 *     phetWebsite: 'https://phet.colorado.edu',
 *     callback: function() {
 *       console.log( 'Link was clicked' );
 *     }
 *   }
 * } ),
 * new RichText( 'Or also <a href="https://phet.colorado.edu">links directly in the string</a>.', {
 *   links: true
 * } ),
 * new RichText( 'Links not found <a href="{{bogus}}">are ignored</a> for security.' ),
 * new HBox( {
 *   spacing: 30,
 *   children: [
 *     new RichText( 'Multi-line text with the<br>separator &lt;br&gt; and <a href="https://phet.colorado.edu">handles<br>links</a> and other <b>tags<br>across lines</b>', {
 *       links: true
 *     } ),
 *     new RichText( 'Supposedly RichText supports line wrapping. Here is a lineWrap of 300, which should probably wrap multiple times here', { lineWrap: 300 } )
 *   ]
 * } )
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import StringProperty from '../../../axon/js/StringProperty.js';
import TinyForwardingProperty from '../../../axon/js/TinyForwardingProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import IOType from '../../../tandem/js/types/IOType.js';
import { allowLinksProperty, Color, Font, getLineBreakRanges, isHimalayaElementNode, isHimalayaTextNode, Line, Node, RichTextElement, RichTextLeaf, RichTextLink, RichTextNode, RichTextUtils, RichTextVerticalSpacer, scenery, Text } from '../imports.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';

// Options that can be used in the constructor, with mutate(), or directly as setters/getters
// each of these options has an associated setter, see setter methods for more documentation
const RICH_TEXT_OPTION_KEYS = ['boundsMethod', 'font', 'fill', 'stroke', 'lineWidth', 'subScale', 'subXSpacing', 'subYOffset', 'supScale', 'supXSpacing', 'supYOffset', 'capHeightScale', 'underlineLineWidth', 'underlineHeightScale', 'strikethroughLineWidth', 'strikethroughHeightScale', 'linkFill', 'linkEventsHandled', 'links', 'nodes', 'replaceNewlines', 'align', 'leading', 'lineWrap', Text.STRING_PROPERTY_NAME, 'string'];
const DEFAULT_FONT = new Font({
  size: 20
});

// Tags that should be included in accessible innerContent, see https://github.com/phetsims/joist/issues/430
const ACCESSIBLE_TAGS = ['b', 'strong', 'i', 'em', 'sub', 'sup', 'u', 's'];

// What type of line-break situations we can be in during our recursive process
const LineBreakState = {
  // There was a line break, but it was at the end of the element (or was a <br>). The relevant element can be fully
  // removed from the tree.
  COMPLETE: 'COMPLETE',
  // There was a line break, but there is some content left in this element after the line break. DO NOT remove it.
  INCOMPLETE: 'INCOMPLETE',
  // There was NO line break
  NONE: 'NONE'
};

// We'll store an array here that will record which links/nodes were used in the last rebuild (so we can assert out if
// there were some that were not used).
const usedLinks = [];
const usedNodes = [];

// himalaya converts dash separated CSS to camel case - use CSS compatible style with dashes, see above for examples
const FONT_STYLE_MAP = {
  'font-family': 'family',
  'font-size': 'size',
  'font-stretch': 'stretch',
  'font-style': 'style',
  'font-variant': 'variant',
  'font-weight': 'weight',
  'line-height': 'lineHeight'
};
const FONT_STYLE_KEYS = Object.keys(FONT_STYLE_MAP);
const STYLE_KEYS = ['color'].concat(FONT_STYLE_KEYS);
export default class RichText extends Node {
  // The string to display. We'll initialize this by mutating.

  _font = DEFAULT_FONT;
  _boundsMethod = 'hybrid';
  _fill = '#000000';
  _stroke = null;
  _lineWidth = 1;
  _subScale = 0.75;
  _subXSpacing = 0;
  _subYOffset = 0;
  _supScale = 0.75;
  _supXSpacing = 0;
  _supYOffset = 0;
  _capHeightScale = 0.75;
  _underlineLineWidth = 1;
  _underlineHeightScale = 0.15;
  _strikethroughLineWidth = 1;
  _strikethroughHeightScale = 0.3;
  _linkFill = 'rgb(27,0,241)';
  _linkEventsHandled = false;

  // If an object, values are either {string} or {function}
  _links = {};
  _nodes = {};
  _replaceNewlines = false;
  _align = 'left';
  _leading = 0;
  _lineWrap = null;

  // We need to consolidate links (that could be split across multiple lines) under one "link" node, so we track created
  // link fragments here so they can get pieced together later.
  _linkItems = [];

  // Whether something has been added to this line yet. We don't want to infinite-loop out if something is longer than
  // our lineWrap, so we'll place one item on its own on an otherwise empty line.
  _hasAddedLeafToLine = false;

  // Normal layout container of lines (separate, so we can clear it easily)

  // Text and RichText currently use the same tandem name for their stringProperty.
  static STRING_PROPERTY_TANDEM_NAME = Text.STRING_PROPERTY_TANDEM_NAME;
  constructor(string, providedOptions) {
    // We only fill in some defaults, since the other defaults are defined below (and mutate is relied on)
    const options = optionize()({
      fill: '#000000',
      // phet-io
      tandem: Tandem.OPTIONAL,
      tandemNameSuffix: 'Text',
      phetioType: RichText.RichTextIO,
      phetioVisiblePropertyInstrumented: false
    }, providedOptions);
    if (typeof string === 'string' || typeof string === 'number') {
      options.string = string;
    } else {
      options.stringProperty = string;
    }
    super();
    this._stringProperty = new TinyForwardingProperty('', true, this.onStringPropertyChange.bind(this));
    this.lineContainer = new Node({});
    this.addChild(this.lineContainer);

    // Initialize to an empty state, so we are immediately valid (since now we need to create an empty leaf even if we
    // have empty text).
    this.rebuildRichText();
    this.mutate(options);
  }

  /**
   * Called when our stringProperty changes values.
   */
  onStringPropertyChange() {
    this.rebuildRichText();
  }

  /**
   * See documentation for Node.setVisibleProperty, except this is for the text string.
   */
  setStringProperty(newTarget) {
    return this._stringProperty.setTargetProperty(this, RichText.STRING_PROPERTY_TANDEM_NAME, newTarget);
  }
  set stringProperty(property) {
    this.setStringProperty(property);
  }
  get stringProperty() {
    return this.getStringProperty();
  }

  /**
   * Like Node.getVisibleProperty, but for the text string. Note this is not the same as the Property provided in
   * setStringProperty. Thus is the nature of TinyForwardingProperty.
   */
  getStringProperty() {
    return this._stringProperty;
  }

  /**
   * See documentation and comments in Node.initializePhetioObject
   */
  initializePhetioObject(baseOptions, providedOptions) {
    const options = optionize()({}, providedOptions);

    // Track this, so we only override our stringProperty once.
    const wasInstrumented = this.isPhetioInstrumented();
    super.initializePhetioObject(baseOptions, options);
    if (Tandem.PHET_IO_ENABLED && !wasInstrumented && this.isPhetioInstrumented()) {
      this._stringProperty.initializePhetio(this, RichText.STRING_PROPERTY_TANDEM_NAME, () => {
        return new StringProperty(this.string, combineOptions({
          // by default, texts should be readonly. Editable texts most likely pass in editable Properties from i18n model Properties, see https://github.com/phetsims/scenery/issues/1443
          phetioReadOnly: true,
          tandem: this.tandem.createTandem(RichText.STRING_PROPERTY_TANDEM_NAME),
          phetioDocumentation: 'Property for the displayed text'
        }, options.stringPropertyOptions));
      });
    }
  }

  /**
   * When called, will rebuild the node structure for this RichText
   */
  rebuildRichText() {
    assert && cleanArray(usedLinks);
    assert && cleanArray(usedNodes);
    this.freeChildrenToPool();

    // Bail early, particularly if we are being constructed.
    if (this.string === '') {
      this.appendEmptyLeaf();
      return;
    }
    sceneryLog && sceneryLog.RichText && sceneryLog.RichText(`RichText#${this.id} rebuild`);
    sceneryLog && sceneryLog.RichText && sceneryLog.push();

    // Turn bidirectional marks into explicit elements, so that the nesting is applied correctly.
    let mappedText = this.string.replace(/\u202a/g, '<span dir="ltr">').replace(/\u202b/g, '<span dir="rtl">').replace(/\u202c/g, '</span>');

    // Optional replacement of newlines, see https://github.com/phetsims/scenery/issues/1542
    if (this._replaceNewlines) {
      mappedText = mappedText.replace(/\n/g, '<br>');
    }
    let rootElements;

    // Start appending all top-level elements
    try {
      // @ts-expect-error - Since himalaya isn't in tsconfig
      rootElements = himalaya.parse(mappedText);
    } catch (e) {
      // If we error out, don't kill the sim. Instead, replace the string with something that looks obviously like an
      // error. See https://github.com/phetsims/chipper/issues/1361 (we don't want translations to error out our
      // build process).

      // @ts-expect-error - Since himalaya isn't in tsconfig
      rootElements = himalaya.parse('INVALID TRANSLATION');
    }

    // Clear out link items, as we'll need to reconstruct them later
    this._linkItems.length = 0;
    const widthAvailable = this._lineWrap === null ? Number.POSITIVE_INFINITY : this._lineWrap;
    const isRootLTR = true;
    let currentLine = RichTextElement.pool.create(isRootLTR);
    this._hasAddedLeafToLine = false; // notify that if nothing has been added, the first leaf always gets added.

    // Himalaya can give us multiple top-level items, so we need to iterate over those
    while (rootElements.length) {
      const element = rootElements[0];

      // How long our current line is already
      const currentLineWidth = currentLine.bounds.isValid() ? currentLine.width : 0;

      // Add the element in
      const lineBreakState = this.appendElement(currentLine, element, this._font, this._fill, isRootLTR, widthAvailable - currentLineWidth);
      sceneryLog && sceneryLog.RichText && sceneryLog.RichText(`lineBreakState: ${lineBreakState}`);

      // If there was a line break (we'll need to swap to a new line node)
      if (lineBreakState !== LineBreakState.NONE) {
        // Add the line if it works
        if (currentLine.bounds.isValid()) {
          sceneryLog && sceneryLog.RichText && sceneryLog.RichText('Adding line due to lineBreak');
          this.appendLine(currentLine);
        }
        // Otherwise if it's a blank line, add in a strut (<br><br> should result in a blank line)
        else {
          this.appendLine(RichTextVerticalSpacer.pool.create(RichTextUtils.scratchText.setString('X').setFont(this._font).height));
        }

        // Set up a new line
        currentLine = RichTextElement.pool.create(isRootLTR);
        this._hasAddedLeafToLine = false;
      }

      // If it's COMPLETE or NONE, then we fully processed the line
      if (lineBreakState !== LineBreakState.INCOMPLETE) {
        sceneryLog && sceneryLog.RichText && sceneryLog.RichText('Finished root element');
        rootElements.splice(0, 1);
      }
    }

    // Only add the final line if it's valid (we don't want to add unnecessary padding at the bottom)
    if (currentLine.bounds.isValid()) {
      sceneryLog && sceneryLog.RichText && sceneryLog.RichText('Adding final line');
      this.appendLine(currentLine);
    }

    // If we reached here and have no children, we probably ran into a degenerate "no layout" case like `' '`. Add in
    // the empty leaf.
    if (this.lineContainer.getChildrenCount() === 0) {
      this.appendEmptyLeaf();
    }

    // All lines are constructed, so we can align them now
    this.alignLines();

    // Handle regrouping of links (so that all fragments of a link across multiple lines are contained under a single
    // ancestor that has listeners and a11y)
    while (this._linkItems.length) {
      // Close over the href and other references
      (() => {
        const linkElement = this._linkItems[0].element;
        const href = this._linkItems[0].href;
        let i;

        // Find all nodes that are for the same link
        const nodes = [];
        for (i = this._linkItems.length - 1; i >= 0; i--) {
          const item = this._linkItems[i];
          if (item.element === linkElement) {
            nodes.push(item.node);
            this._linkItems.splice(i, 1);
          }
        }
        const linkRootNode = RichTextLink.pool.create(linkElement.innerContent, href);
        this.lineContainer.addChild(linkRootNode);

        // Detach the node from its location, adjust its transform, and reattach under the link. This should keep each
        // fragment in the same place, but changes its parent.
        for (i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          const matrix = node.getUniqueTrailTo(this.lineContainer).getMatrix();
          node.detach();
          node.matrix = matrix;
          linkRootNode.addChild(node);
        }
      })();
    }

    // Clear them out afterwards, for memory purposes
    this._linkItems.length = 0;
    if (assert) {
      if (this._links && this._links !== true) {
        Object.keys(this._links).forEach(link => {
          assert && allowLinksProperty.value && assert(usedLinks.includes(link), `Unused RichText link: ${link}`);
        });
      }
      if (this._nodes) {
        Object.keys(this._nodes).forEach(node => {
          assert && allowLinksProperty.value && assert(usedNodes.includes(node), `Unused RichText node: ${node}`);
        });
      }
    }
    sceneryLog && sceneryLog.RichText && sceneryLog.pop();
  }

  /**
   * Cleans "recursively temporary disposes" the children.
   */
  freeChildrenToPool() {
    // Clear any existing lines or link fragments (higher performance, and return them to pools also)
    while (this.lineContainer._children.length) {
      const child = this.lineContainer._children[this.lineContainer._children.length - 1];
      this.lineContainer.removeChild(child);
      child.clean();
    }
  }

  /**
   * Releases references.
   */
  dispose() {
    this.freeChildrenToPool();
    super.dispose();
    this._stringProperty.dispose();
  }

  /**
   * Appends a finished line, applying any necessary leading.
   */
  appendLine(lineNode) {
    // Apply leading
    if (this.lineContainer.bounds.isValid()) {
      lineNode.top = this.lineContainer.bottom + this._leading;

      // This ensures RTL lines will still be laid out properly with the main origin (handled by alignLines later)
      lineNode.left = 0;
    }
    this.lineContainer.addChild(lineNode);
  }

  /**
   * If we end up with the equivalent of "no" content, toss in a basically empty leaf so that we get valid bounds
   * (0 width, correctly-positioned height). See https://github.com/phetsims/scenery/issues/769.
   */
  appendEmptyLeaf() {
    assert && assert(this.lineContainer.getChildrenCount() === 0);
    this.appendLine(RichTextLeaf.pool.create('', true, this._font, this._boundsMethod, this._fill, this._stroke, this._lineWidth));
  }

  /**
   * Aligns all lines attached to the lineContainer.
   */
  alignLines() {
    // All nodes will either share a 'left', 'centerX' or 'right'.
    const coordinateName = this._align === 'center' ? 'centerX' : this._align;
    const ideal = this.lineContainer[coordinateName];
    for (let i = 0; i < this.lineContainer.getChildrenCount(); i++) {
      this.lineContainer.getChildAt(i)[coordinateName] = ideal;
    }
  }

  /**
   * Main recursive function for constructing the RichText Node tree.
   *
   * We'll add any relevant content to the containerNode. The element will be mutated as things are added, so that
   * whenever content is added to the Node tree it will be removed from the element tree. This means we can pause
   * whenever (e.g. when a line-break is encountered) and the rest will be ready for parsing the next line.
   *
   * @param containerNode - The node where child elements should be placed
   * @param element - See Himalaya's element specification
   *                      (https://github.com/andrejewski/himalaya/blob/master/text/ast-spec-v0.md)
   * @param font - The font to apply at this level
   * @param fill - Fill to apply
   * @param isLTR - True if LTR, false if RTL (handles RTL strings properly)
   * @param widthAvailable - How much width we have available before forcing a line break (for lineWrap)
   * @returns - Whether a line break was reached
   */
  appendElement(containerNode, element, font, fill, isLTR, widthAvailable) {
    let lineBreakState = LineBreakState.NONE;

    // The main Node for the element that we are adding
    let node;

    // If this content gets added, it will need to be pushed over by this amount
    const containerSpacing = isLTR ? containerNode.rightSpacing : containerNode.leftSpacing;

    // Container spacing cuts into our effective available width
    const widthAvailableWithSpacing = widthAvailable - containerSpacing;

    // If we're a leaf
    if (isHimalayaTextNode(element)) {
      sceneryLog && sceneryLog.RichText && sceneryLog.RichText(`appending leaf: ${element.content}`);
      sceneryLog && sceneryLog.RichText && sceneryLog.push();
      node = RichTextLeaf.pool.create(element.content, isLTR, font, this._boundsMethod, fill, this._stroke, this._lineWidth);

      // Handle wrapping if required. Container spacing cuts into our available width
      if (!node.fitsIn(widthAvailableWithSpacing, this._hasAddedLeafToLine, isLTR)) {
        // Didn't fit, lets break into words to see what we can fit. We'll create ranges for all the individual
        // elements we could split the lines into. If we split into different lines, we can ignore the characters
        // in-between, however if not, we need to include them.
        const ranges = getLineBreakRanges(element.content);

        // Convert a group of ranges into a string (grab the content from the string).
        const rangesToString = ranges => {
          if (ranges.length === 0) {
            return '';
          } else {
            return element.content.slice(ranges[0].min, ranges[ranges.length - 1].max);
          }
        };
        sceneryLog && sceneryLog.RichText && sceneryLog.RichText(`Overflow leafAdded:${this._hasAddedLeafToLine}, words: ${ranges.length}`);

        // If we need to add something (and there is only a single word), then add it
        if (this._hasAddedLeafToLine || ranges.length > 1) {
          sceneryLog && sceneryLog.RichText && sceneryLog.RichText('Skipping words');
          const skippedRanges = [];
          let success = false;
          skippedRanges.unshift(ranges.pop()); // We didn't fit with the last one!

          // Keep shortening by removing words until it fits (or if we NEED to fit it) or it doesn't fit.
          while (ranges.length) {
            node.clean(); // We're tossing the old one, so we'll free up memory for the new one
            node = RichTextLeaf.pool.create(rangesToString(ranges), isLTR, font, this._boundsMethod, fill, this._stroke, this._lineWidth);

            // If we haven't added anything to the line AND we are down to the first word, we need to just add it.
            if (!node.fitsIn(widthAvailableWithSpacing, this._hasAddedLeafToLine, isLTR) && (this._hasAddedLeafToLine || ranges.length > 1)) {
              sceneryLog && sceneryLog.RichText && sceneryLog.RichText(`Skipping word ${rangesToString([ranges[ranges.length - 1]])}`);
              skippedRanges.unshift(ranges.pop());
            } else {
              sceneryLog && sceneryLog.RichText && sceneryLog.RichText(`Success with ${rangesToString(ranges)}`);
              success = true;
              break;
            }
          }

          // If we haven't added anything yet to this line, we'll permit the overflow
          if (success) {
            lineBreakState = LineBreakState.INCOMPLETE;
            element.content = rangesToString(skippedRanges);
            sceneryLog && sceneryLog.RichText && sceneryLog.RichText(`Remaining content: ${element.content}`);
          } else {
            // We won't use this one, so we'll free it back to the pool
            node.clean();
            return LineBreakState.INCOMPLETE;
          }
        }
      }
      this._hasAddedLeafToLine = true;
      sceneryLog && sceneryLog.RichText && sceneryLog.pop();
    }
    // Otherwise presumably an element with content
    else if (isHimalayaElementNode(element)) {
      // Bail out quickly for a line break
      if (element.tagName === 'br') {
        sceneryLog && sceneryLog.RichText && sceneryLog.RichText('manual line break');
        return LineBreakState.COMPLETE;
      }

      // Span (dir attribute) -- we need the LTR/RTL knowledge before most other operations
      if (element.tagName === 'span') {
        const dirAttributeString = RichTextUtils.himalayaGetAttribute('dir', element);
        if (dirAttributeString) {
          assert && assert(dirAttributeString === 'ltr' || dirAttributeString === 'rtl', 'Span dir attributes should be ltr or rtl.');
          isLTR = dirAttributeString === 'ltr';
        }
      }

      // Handle <node> tags, which should not have content
      if (element.tagName === 'node') {
        const referencedId = RichTextUtils.himalayaGetAttribute('id', element);
        const referencedNode = referencedId ? this._nodes[referencedId] || null : null;
        assert && assert(referencedNode, referencedId ? `Could not find a matching item in RichText's nodes for ${referencedId}. It should be provided in the nodes option` : 'No id attribute provided for a given <node> element');
        if (referencedNode) {
          assert && usedNodes.push(referencedId);
          node = RichTextNode.pool.create(referencedNode);
          if (this._hasAddedLeafToLine && !node.fitsIn(widthAvailableWithSpacing)) {
            // If we don't fit, we'll toss this node to the pool and create it on the next line
            node.clean();
            return LineBreakState.INCOMPLETE;
          }
          const nodeAlign = RichTextUtils.himalayaGetAttribute('align', element);
          if (nodeAlign === 'center' || nodeAlign === 'top' || nodeAlign === 'bottom') {
            const textBounds = RichTextUtils.scratchText.setString('Test').setFont(font).bounds;
            if (nodeAlign === 'center') {
              node.centerY = textBounds.centerY;
            } else if (nodeAlign === 'top') {
              node.top = textBounds.top;
            } else if (nodeAlign === 'bottom') {
              node.bottom = textBounds.bottom;
            }
          }
        } else {
          // If there is no node in our map, we'll just skip it
          return lineBreakState;
        }
        this._hasAddedLeafToLine = true;
      }
      // If not a <node> tag
      else {
        node = RichTextElement.pool.create(isLTR);
      }
      sceneryLog && sceneryLog.RichText && sceneryLog.RichText('appending element');
      sceneryLog && sceneryLog.RichText && sceneryLog.push();
      const styleAttributeString = RichTextUtils.himalayaGetAttribute('style', element);
      if (styleAttributeString) {
        const css = RichTextUtils.himalayaStyleStringToMap(styleAttributeString);
        assert && Object.keys(css).forEach(key => {
          assert(_.includes(STYLE_KEYS, key), 'See supported style CSS keys');
        });

        // Fill
        if (css.color) {
          fill = new Color(css.color);
        }

        // Font
        const fontOptions = {};
        for (let i = 0; i < FONT_STYLE_KEYS.length; i++) {
          const styleKey = FONT_STYLE_KEYS[i];
          if (css[styleKey]) {
            fontOptions[FONT_STYLE_MAP[styleKey]] = css[styleKey];
          }
        }
        font = (typeof font === 'string' ? Font.fromCSS(font) : font).copy(fontOptions);
      }

      // Anchor (link)
      if (element.tagName === 'a') {
        let href = RichTextUtils.himalayaGetAttribute('href', element);
        const originalHref = href;

        // Try extracting the href from the links object
        if (href !== null && this._links !== true) {
          if (href.startsWith('{{') && href.indexOf('}}') === href.length - 2) {
            const linkName = href.slice(2, -2);
            href = this._links[linkName];
            assert && usedLinks.push(linkName);
          } else {
            href = null;
          }
        }

        // Ignore things if there is no matching href
        assert && assert(href, `Could not find a matching item in RichText's links for ${originalHref}. It should be provided in the links option, or links should be turned to true (to allow the string to create its own urls`);
        if (href) {
          if (this._linkFill !== null) {
            fill = this._linkFill; // Link color
          }
          // Don't overwrite only innerContents once things have been "torn down"
          if (!element.innerContent) {
            element.innerContent = RichText.himalayaElementToAccessibleString(element, isLTR);
          }

          // Store information about it for the "regroup links" step
          this._linkItems.push({
            element: element,
            node: node,
            href: href
          });
        }
      }
      // Bold
      else if (element.tagName === 'b' || element.tagName === 'strong') {
        font = (typeof font === 'string' ? Font.fromCSS(font) : font).copy({
          weight: 'bold'
        });
      }
      // Italic
      else if (element.tagName === 'i' || element.tagName === 'em') {
        font = (typeof font === 'string' ? Font.fromCSS(font) : font).copy({
          style: 'italic'
        });
      }
      // Subscript
      else if (element.tagName === 'sub') {
        node.scale(this._subScale);
        node.addExtraBeforeSpacing(this._subXSpacing);
        node.y += this._subYOffset;
      }
      // Superscript
      else if (element.tagName === 'sup') {
        node.scale(this._supScale);
        node.addExtraBeforeSpacing(this._supXSpacing);
        node.y += this._supYOffset;
      }

      // If we've added extra spacing, we'll need to subtract it off of our available width
      const scale = node.getScaleVector().x;

      // Process children
      if (element.tagName !== 'node') {
        while (lineBreakState === LineBreakState.NONE && element.children.length) {
          const widthBefore = node.bounds.isValid() ? node.width : 0;
          const childElement = element.children[0];
          lineBreakState = this.appendElement(node, childElement, font, fill, isLTR, widthAvailable / scale);

          // for COMPLETE or NONE, we'll want to remove the childElement from the tree (we fully processed it)
          if (lineBreakState !== LineBreakState.INCOMPLETE) {
            element.children.splice(0, 1);
          }
          const widthAfter = node.bounds.isValid() ? node.width : 0;

          // Remove the amount of width taken up by the child
          widthAvailable += widthBefore - widthAfter;
        }
        // If there is a line break and there are still more things to process, we are incomplete
        if (lineBreakState === LineBreakState.COMPLETE && element.children.length) {
          lineBreakState = LineBreakState.INCOMPLETE;
        }
      }

      // Subscript positioning
      if (element.tagName === 'sub') {
        if (isFinite(node.height)) {
          node.centerY = 0;
        }
      }
      // Superscript positioning
      else if (element.tagName === 'sup') {
        if (isFinite(node.height)) {
          node.centerY = RichTextUtils.scratchText.setString('X').setFont(font).top * this._capHeightScale;
        }
      }
      // Underline
      else if (element.tagName === 'u') {
        const underlineY = -node.top * this._underlineHeightScale;
        if (isFinite(node.top)) {
          node.addChild(new Line(node.localLeft, underlineY, node.localRight, underlineY, {
            stroke: fill,
            lineWidth: this._underlineLineWidth
          }));
        }
      }
      // Strikethrough
      else if (element.tagName === 's') {
        const strikethroughY = node.top * this._strikethroughHeightScale;
        if (isFinite(node.top)) {
          node.addChild(new Line(node.localLeft, strikethroughY, node.localRight, strikethroughY, {
            stroke: fill,
            lineWidth: this._strikethroughLineWidth
          }));
        }
      }
      sceneryLog && sceneryLog.RichText && sceneryLog.pop();
    }
    if (node) {
      const wasAdded = containerNode.addElement(node);
      if (!wasAdded) {
        // Remove it from the linkItems if we didn't actually add it.
        this._linkItems = this._linkItems.filter(item => item.node !== node);

        // And since we won't dispose it (since it's not a child), clean it here
        node.clean();
      }
    }
    return lineBreakState;
  }

  /**
   * Sets the string displayed by our node.
   *
   * NOTE: Encoding HTML entities is required, and malformed HTML is not accepted.
   *
   * @param string - The string to display. If it's a number, it will be cast to a string
   */
  setString(string) {
    assert && assert(string !== null && string !== undefined, 'String should be defined and non-null. Use the empty string if needed.');

    // cast it to a string (for numbers, etc., and do it before the change guard so we don't accidentally trigger on non-changed string)
    string = `${string}`;
    this._stringProperty.set(string);
    return this;
  }
  set string(value) {
    this.setString(value);
  }
  get string() {
    return this.getString();
  }

  /**
   * Returns the string displayed by our text Node.
   */
  getString() {
    return this._stringProperty.value;
  }

  /**
   * Sets the method that is used to determine bounds from the text. See Text.setBoundsMethod for details
   */
  setBoundsMethod(method) {
    assert && assert(method === 'fast' || method === 'fastCanvas' || method === 'accurate' || method === 'hybrid', 'Unknown Text boundsMethod');
    if (method !== this._boundsMethod) {
      this._boundsMethod = method;
      this.rebuildRichText();
    }
    return this;
  }
  set boundsMethod(value) {
    this.setBoundsMethod(value);
  }
  get boundsMethod() {
    return this.getBoundsMethod();
  }

  /**
   * Returns the current method to estimate the bounds of the text. See setBoundsMethod() for more information.
   */
  getBoundsMethod() {
    return this._boundsMethod;
  }

  /**
   * Sets the font of our node.
   */
  setFont(font) {
    if (this._font !== font) {
      this._font = font;
      this.rebuildRichText();
    }
    return this;
  }
  set font(value) {
    this.setFont(value);
  }
  get font() {
    return this.getFont();
  }

  /**
   * Returns the current Font
   */
  getFont() {
    return this._font;
  }

  /**
   * Sets the fill of our text.
   */
  setFill(fill) {
    if (this._fill !== fill) {
      this._fill = fill;
      this.rebuildRichText();
    }
    return this;
  }
  set fill(value) {
    this.setFill(value);
  }
  get fill() {
    return this.getFill();
  }

  /**
   * Returns the current fill.
   */
  getFill() {
    return this._fill;
  }

  /**
   * Sets the stroke of our text.
   */
  setStroke(stroke) {
    if (this._stroke !== stroke) {
      this._stroke = stroke;
      this.rebuildRichText();
    }
    return this;
  }
  set stroke(value) {
    this.setStroke(value);
  }
  get stroke() {
    return this.getStroke();
  }

  /**
   * Returns the current stroke.
   */
  getStroke() {
    return this._stroke;
  }

  /**
   * Sets the lineWidth of our text.
   */
  setLineWidth(lineWidth) {
    if (this._lineWidth !== lineWidth) {
      this._lineWidth = lineWidth;
      this.rebuildRichText();
    }
    return this;
  }
  set lineWidth(value) {
    this.setLineWidth(value);
  }
  get lineWidth() {
    return this.getLineWidth();
  }

  /**
   * Returns the current lineWidth.
   */
  getLineWidth() {
    return this._lineWidth;
  }

  /**
   * Sets the scale (relative to 1) of any string under subscript (<sub>) elements.
   */
  setSubScale(subScale) {
    assert && assert(isFinite(subScale) && subScale > 0);
    if (this._subScale !== subScale) {
      this._subScale = subScale;
      this.rebuildRichText();
    }
    return this;
  }
  set subScale(value) {
    this.setSubScale(value);
  }
  get subScale() {
    return this.getSubScale();
  }

  /**
   * Returns the scale (relative to 1) of any string under subscript (<sub>) elements.
   */
  getSubScale() {
    return this._subScale;
  }

  /**
   * Sets the horizontal spacing before any subscript (<sub>) elements.
   */
  setSubXSpacing(subXSpacing) {
    assert && assert(isFinite(subXSpacing));
    if (this._subXSpacing !== subXSpacing) {
      this._subXSpacing = subXSpacing;
      this.rebuildRichText();
    }
    return this;
  }
  set subXSpacing(value) {
    this.setSubXSpacing(value);
  }
  get subXSpacing() {
    return this.getSubXSpacing();
  }

  /**
   * Returns the horizontal spacing before any subscript (<sub>) elements.
   */
  getSubXSpacing() {
    return this._subXSpacing;
  }

  /**
   * Sets the adjustment offset to the vertical placement of any subscript (<sub>) elements.
   */
  setSubYOffset(subYOffset) {
    assert && assert(isFinite(subYOffset));
    if (this._subYOffset !== subYOffset) {
      this._subYOffset = subYOffset;
      this.rebuildRichText();
    }
    return this;
  }
  set subYOffset(value) {
    this.setSubYOffset(value);
  }
  get subYOffset() {
    return this.getSubYOffset();
  }

  /**
   * Returns the adjustment offset to the vertical placement of any subscript (<sub>) elements.
   */
  getSubYOffset() {
    return this._subYOffset;
  }

  /**
   * Sets the scale (relative to 1) of any string under superscript (<sup>) elements.
   */
  setSupScale(supScale) {
    assert && assert(isFinite(supScale) && supScale > 0);
    if (this._supScale !== supScale) {
      this._supScale = supScale;
      this.rebuildRichText();
    }
    return this;
  }
  set supScale(value) {
    this.setSupScale(value);
  }
  get supScale() {
    return this.getSupScale();
  }

  /**
   * Returns the scale (relative to 1) of any string under superscript (<sup>) elements.
   */
  getSupScale() {
    return this._supScale;
  }

  /**
   * Sets the horizontal spacing before any superscript (<sup>) elements.
   */
  setSupXSpacing(supXSpacing) {
    assert && assert(isFinite(supXSpacing));
    if (this._supXSpacing !== supXSpacing) {
      this._supXSpacing = supXSpacing;
      this.rebuildRichText();
    }
    return this;
  }
  set supXSpacing(value) {
    this.setSupXSpacing(value);
  }
  get supXSpacing() {
    return this.getSupXSpacing();
  }

  /**
   * Returns the horizontal spacing before any superscript (<sup>) elements.
   */
  getSupXSpacing() {
    return this._supXSpacing;
  }

  /**
   * Sets the adjustment offset to the vertical placement of any superscript (<sup>) elements.
   */
  setSupYOffset(supYOffset) {
    assert && assert(isFinite(supYOffset));
    if (this._supYOffset !== supYOffset) {
      this._supYOffset = supYOffset;
      this.rebuildRichText();
    }
    return this;
  }
  set supYOffset(value) {
    this.setSupYOffset(value);
  }
  get supYOffset() {
    return this.getSupYOffset();
  }

  /**
   * Returns the adjustment offset to the vertical placement of any superscript (<sup>) elements.
   */
  getSupYOffset() {
    return this._supYOffset;
  }

  /**
   * Sets the expected cap height (baseline to top of capital letters) as a scale of the detected distance from the
   * baseline to the top of the text bounds.
   */
  setCapHeightScale(capHeightScale) {
    assert && assert(isFinite(capHeightScale) && capHeightScale > 0);
    if (this._capHeightScale !== capHeightScale) {
      this._capHeightScale = capHeightScale;
      this.rebuildRichText();
    }
    return this;
  }
  set capHeightScale(value) {
    this.setCapHeightScale(value);
  }
  get capHeightScale() {
    return this.getCapHeightScale();
  }

  /**
   * Returns the expected cap height (baseline to top of capital letters) as a scale of the detected distance from the
   * baseline to the top of the text bounds.
   */
  getCapHeightScale() {
    return this._capHeightScale;
  }

  /**
   * Sets the lineWidth of underline lines.
   */
  setUnderlineLineWidth(underlineLineWidth) {
    assert && assert(isFinite(underlineLineWidth) && underlineLineWidth > 0);
    if (this._underlineLineWidth !== underlineLineWidth) {
      this._underlineLineWidth = underlineLineWidth;
      this.rebuildRichText();
    }
    return this;
  }
  set underlineLineWidth(value) {
    this.setUnderlineLineWidth(value);
  }
  get underlineLineWidth() {
    return this.getUnderlineLineWidth();
  }

  /**
   * Returns the lineWidth of underline lines.
   */
  getUnderlineLineWidth() {
    return this._underlineLineWidth;
  }

  /**
   * Sets the underline height adjustment as a proportion of the detected distance from the baseline to the top of the
   * text bounds.
   */
  setUnderlineHeightScale(underlineHeightScale) {
    assert && assert(isFinite(underlineHeightScale) && underlineHeightScale > 0);
    if (this._underlineHeightScale !== underlineHeightScale) {
      this._underlineHeightScale = underlineHeightScale;
      this.rebuildRichText();
    }
    return this;
  }
  set underlineHeightScale(value) {
    this.setUnderlineHeightScale(value);
  }
  get underlineHeightScale() {
    return this.getUnderlineHeightScale();
  }

  /**
   * Returns the underline height adjustment as a proportion of the detected distance from the baseline to the top of the
   * text bounds.
   */
  getUnderlineHeightScale() {
    return this._underlineHeightScale;
  }

  /**
   * Sets the lineWidth of strikethrough lines.
   */
  setStrikethroughLineWidth(strikethroughLineWidth) {
    assert && assert(isFinite(strikethroughLineWidth) && strikethroughLineWidth > 0);
    if (this._strikethroughLineWidth !== strikethroughLineWidth) {
      this._strikethroughLineWidth = strikethroughLineWidth;
      this.rebuildRichText();
    }
    return this;
  }
  set strikethroughLineWidth(value) {
    this.setStrikethroughLineWidth(value);
  }
  get strikethroughLineWidth() {
    return this.getStrikethroughLineWidth();
  }

  /**
   * Returns the lineWidth of strikethrough lines.
   */
  getStrikethroughLineWidth() {
    return this._strikethroughLineWidth;
  }

  /**
   * Sets the strikethrough height adjustment as a proportion of the detected distance from the baseline to the top of the
   * text bounds.
   */
  setStrikethroughHeightScale(strikethroughHeightScale) {
    assert && assert(isFinite(strikethroughHeightScale) && strikethroughHeightScale > 0);
    if (this._strikethroughHeightScale !== strikethroughHeightScale) {
      this._strikethroughHeightScale = strikethroughHeightScale;
      this.rebuildRichText();
    }
    return this;
  }
  set strikethroughHeightScale(value) {
    this.setStrikethroughHeightScale(value);
  }
  get strikethroughHeightScale() {
    return this.getStrikethroughHeightScale();
  }

  /**
   * Returns the strikethrough height adjustment as a proportion of the detected distance from the baseline to the top of the
   * text bounds.
   */
  getStrikethroughHeightScale() {
    return this._strikethroughHeightScale;
  }

  /**
   * Sets the color of links. If null, no fill will be overridden.
   */
  setLinkFill(linkFill) {
    if (this._linkFill !== linkFill) {
      this._linkFill = linkFill;
      this.rebuildRichText();
    }
    return this;
  }
  set linkFill(value) {
    this.setLinkFill(value);
  }
  get linkFill() {
    return this.getLinkFill();
  }

  /**
   * Returns the color of links.
   */
  getLinkFill() {
    return this._linkFill;
  }

  /**
   * Sets whether link clicks will call event.handle().
   */
  setLinkEventsHandled(linkEventsHandled) {
    if (this._linkEventsHandled !== linkEventsHandled) {
      this._linkEventsHandled = linkEventsHandled;
      this.rebuildRichText();
    }
    return this;
  }
  set linkEventsHandled(value) {
    this.setLinkEventsHandled(value);
  }
  get linkEventsHandled() {
    return this.getLinkEventsHandled();
  }

  /**
   * Returns whether link events will be handled.
   */
  getLinkEventsHandled() {
    return this._linkEventsHandled;
  }
  setLinks(links) {
    assert && assert(links === true || Object.getPrototypeOf(links) === Object.prototype);
    if (this._links !== links) {
      this._links = links;
      this.rebuildRichText();
    }
    return this;
  }

  /**
   * Returns whether link events will be handled.
   */
  getLinks() {
    return this._links;
  }
  set links(value) {
    this.setLinks(value);
  }
  get links() {
    return this.getLinks();
  }
  setNodes(nodes) {
    assert && assert(Object.getPrototypeOf(nodes) === Object.prototype);
    if (this._nodes !== nodes) {
      this._nodes = nodes;
      this.rebuildRichText();
    }
    return this;
  }
  getNodes() {
    return this._nodes;
  }
  set nodes(value) {
    this.setNodes(value);
  }
  get nodes() {
    return this.getNodes();
  }

  /**
   * Sets whether newlines are replaced with <br>
   */
  setReplaceNewlines(replaceNewlines) {
    if (this._replaceNewlines !== replaceNewlines) {
      this._replaceNewlines = replaceNewlines;
      this.rebuildRichText();
    }
    return this;
  }
  set replaceNewlines(value) {
    this.setReplaceNewlines(value);
  }
  get replaceNewlines() {
    return this.getReplaceNewlines();
  }
  getReplaceNewlines() {
    return this._replaceNewlines;
  }

  /**
   * Sets the alignment of text (only relevant if there are multiple lines).
   */
  setAlign(align) {
    assert && assert(align === 'left' || align === 'center' || align === 'right');
    if (this._align !== align) {
      this._align = align;
      this.rebuildRichText();
    }
    return this;
  }
  set align(value) {
    this.setAlign(value);
  }
  get align() {
    return this.getAlign();
  }

  /**
   * Returns the current alignment of the text (only relevant if there are multiple lines).
   */
  getAlign() {
    return this._align;
  }

  /**
   * Sets the leading (spacing between lines)
   */
  setLeading(leading) {
    assert && assert(isFinite(leading));
    if (this._leading !== leading) {
      this._leading = leading;
      this.rebuildRichText();
    }
    return this;
  }
  set leading(value) {
    this.setLeading(value);
  }
  get leading() {
    return this.getLeading();
  }

  /**
   * Returns the leading (spacing between lines)
   */
  getLeading() {
    return this._leading;
  }

  /**
   * Sets the line wrap width for the text (or null if none is desired). Lines longer than this length will wrap
   * automatically to the next line.
   *
   * @param lineWrap - If it's a number, it should be greater than 0.
   */
  setLineWrap(lineWrap) {
    assert && assert(lineWrap === null || isFinite(lineWrap) && lineWrap > 0);
    if (this._lineWrap !== lineWrap) {
      this._lineWrap = lineWrap;
      this.rebuildRichText();
    }
    return this;
  }
  set lineWrap(value) {
    this.setLineWrap(value);
  }
  get lineWrap() {
    return this.getLineWrap();
  }

  /**
   * Returns the line wrap width.
   */
  getLineWrap() {
    return this._lineWrap;
  }
  mutate(options) {
    if (assert && options && options.hasOwnProperty('string') && options.hasOwnProperty(Text.STRING_PROPERTY_NAME) && options.stringProperty) {
      assert && assert(options.stringProperty.value === options.string, 'If both string and stringProperty are provided, then values should match');
    }
    return super.mutate(options);
  }

  /**
   * Returns a wrapped version of the string with a font specifier that uses the given font object.
   *
   * NOTE: Does an approximation of some font values (using <b> or <i>), and cannot force the lack of those if it is
   * included in bold/italic exterior tags.
   */
  static stringWithFont(str, font) {
    // TODO: ES6 string interpolation.
    return `${'<span style=\'' + 'font-style: '}${font.style};` + `font-variant: ${font.variant};` + `font-weight: ${font.weight};` + `font-stretch: ${font.stretch};` + `font-size: ${font.size};` + `font-family: ${font.family};` + `line-height: ${font.lineHeight};` + `'>${str}</span>`;
  }

  /**
   * Stringifies an HTML subtree defined by the given element.
   */
  static himalayaElementToString(element, isLTR) {
    if (isHimalayaTextNode(element)) {
      return RichText.contentToString(element.content, isLTR);
    } else if (isHimalayaElementNode(element)) {
      const dirAttributeString = RichTextUtils.himalayaGetAttribute('dir', element);
      if (element.tagName === 'span' && dirAttributeString) {
        isLTR = dirAttributeString === 'ltr';
      }

      // Process children
      return element.children.map(child => RichText.himalayaElementToString(child, isLTR)).join('');
    } else {
      return '';
    }
  }

  /**
   * Stringifies an HTML subtree defined by the given element, but removing certain tags that we don't need for
   * accessibility (like <a>, <span>, etc.), and adding in tags we do want (see ACCESSIBLE_TAGS).
   */
  static himalayaElementToAccessibleString(element, isLTR) {
    if (isHimalayaTextNode(element)) {
      return RichText.contentToString(element.content, isLTR);
    } else if (isHimalayaElementNode(element)) {
      const dirAttribute = RichTextUtils.himalayaGetAttribute('dir', element);
      if (element.tagName === 'span' && dirAttribute) {
        isLTR = dirAttribute === 'ltr';
      }

      // Process children
      const content = element.children.map(child => RichText.himalayaElementToAccessibleString(child, isLTR)).join('');
      if (_.includes(ACCESSIBLE_TAGS, element.tagName)) {
        return `<${element.tagName}>${content}</${element.tagName}>`;
      } else {
        return content;
      }
    } else {
      return '';
    }
  }

  /**
   * Takes the element.content from himalaya, unescapes HTML entities, and applies the proper directional tags.
   *
   * See https://github.com/phetsims/scenery-phet/issues/315
   */
  static contentToString(content, isLTR) {
    // @ts-expect-error - we should get a string from this
    const unescapedContent = he.decode(content);
    return isLTR ? `\u202a${unescapedContent}\u202c` : `\u202b${unescapedContent}\u202c`;
  }
}

/**
 * {Array.<string>} - String keys for all the allowed options that will be set by node.mutate( options ), in the
 * order they will be evaluated in.
 *
 * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
 *       cases that may apply.
 */
RichText.prototype._mutatorKeys = RICH_TEXT_OPTION_KEYS.concat(Node.prototype._mutatorKeys);
scenery.register('RichText', RichText);
RichText.RichTextIO = new IOType('RichTextIO', {
  valueType: RichText,
  supertype: Node.NodeIO,
  documentation: 'The tandem IO Type for the scenery RichText node'
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJpbmdQcm9wZXJ0eSIsIlRpbnlGb3J3YXJkaW5nUHJvcGVydHkiLCJUYW5kZW0iLCJJT1R5cGUiLCJhbGxvd0xpbmtzUHJvcGVydHkiLCJDb2xvciIsIkZvbnQiLCJnZXRMaW5lQnJlYWtSYW5nZXMiLCJpc0hpbWFsYXlhRWxlbWVudE5vZGUiLCJpc0hpbWFsYXlhVGV4dE5vZGUiLCJMaW5lIiwiTm9kZSIsIlJpY2hUZXh0RWxlbWVudCIsIlJpY2hUZXh0TGVhZiIsIlJpY2hUZXh0TGluayIsIlJpY2hUZXh0Tm9kZSIsIlJpY2hUZXh0VXRpbHMiLCJSaWNoVGV4dFZlcnRpY2FsU3BhY2VyIiwic2NlbmVyeSIsIlRleHQiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsImNsZWFuQXJyYXkiLCJSSUNIX1RFWFRfT1BUSU9OX0tFWVMiLCJTVFJJTkdfUFJPUEVSVFlfTkFNRSIsIkRFRkFVTFRfRk9OVCIsInNpemUiLCJBQ0NFU1NJQkxFX1RBR1MiLCJMaW5lQnJlYWtTdGF0ZSIsIkNPTVBMRVRFIiwiSU5DT01QTEVURSIsIk5PTkUiLCJ1c2VkTGlua3MiLCJ1c2VkTm9kZXMiLCJGT05UX1NUWUxFX01BUCIsIkZPTlRfU1RZTEVfS0VZUyIsIk9iamVjdCIsImtleXMiLCJTVFlMRV9LRVlTIiwiY29uY2F0IiwiUmljaFRleHQiLCJfZm9udCIsIl9ib3VuZHNNZXRob2QiLCJfZmlsbCIsIl9zdHJva2UiLCJfbGluZVdpZHRoIiwiX3N1YlNjYWxlIiwiX3N1YlhTcGFjaW5nIiwiX3N1YllPZmZzZXQiLCJfc3VwU2NhbGUiLCJfc3VwWFNwYWNpbmciLCJfc3VwWU9mZnNldCIsIl9jYXBIZWlnaHRTY2FsZSIsIl91bmRlcmxpbmVMaW5lV2lkdGgiLCJfdW5kZXJsaW5lSGVpZ2h0U2NhbGUiLCJfc3RyaWtldGhyb3VnaExpbmVXaWR0aCIsIl9zdHJpa2V0aHJvdWdoSGVpZ2h0U2NhbGUiLCJfbGlua0ZpbGwiLCJfbGlua0V2ZW50c0hhbmRsZWQiLCJfbGlua3MiLCJfbm9kZXMiLCJfcmVwbGFjZU5ld2xpbmVzIiwiX2FsaWduIiwiX2xlYWRpbmciLCJfbGluZVdyYXAiLCJfbGlua0l0ZW1zIiwiX2hhc0FkZGVkTGVhZlRvTGluZSIsIlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSIsImNvbnN0cnVjdG9yIiwic3RyaW5nIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImZpbGwiLCJ0YW5kZW0iLCJPUFRJT05BTCIsInRhbmRlbU5hbWVTdWZmaXgiLCJwaGV0aW9UeXBlIiwiUmljaFRleHRJTyIsInBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCIsInN0cmluZ1Byb3BlcnR5IiwiX3N0cmluZ1Byb3BlcnR5Iiwib25TdHJpbmdQcm9wZXJ0eUNoYW5nZSIsImJpbmQiLCJsaW5lQ29udGFpbmVyIiwiYWRkQ2hpbGQiLCJyZWJ1aWxkUmljaFRleHQiLCJtdXRhdGUiLCJzZXRTdHJpbmdQcm9wZXJ0eSIsIm5ld1RhcmdldCIsInNldFRhcmdldFByb3BlcnR5IiwicHJvcGVydHkiLCJnZXRTdHJpbmdQcm9wZXJ0eSIsImluaXRpYWxpemVQaGV0aW9PYmplY3QiLCJiYXNlT3B0aW9ucyIsIndhc0luc3RydW1lbnRlZCIsImlzUGhldGlvSW5zdHJ1bWVudGVkIiwiUEhFVF9JT19FTkFCTEVEIiwiaW5pdGlhbGl6ZVBoZXRpbyIsInBoZXRpb1JlYWRPbmx5IiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInN0cmluZ1Byb3BlcnR5T3B0aW9ucyIsImFzc2VydCIsImZyZWVDaGlsZHJlblRvUG9vbCIsImFwcGVuZEVtcHR5TGVhZiIsInNjZW5lcnlMb2ciLCJpZCIsInB1c2giLCJtYXBwZWRUZXh0IiwicmVwbGFjZSIsInJvb3RFbGVtZW50cyIsImhpbWFsYXlhIiwicGFyc2UiLCJlIiwibGVuZ3RoIiwid2lkdGhBdmFpbGFibGUiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsImlzUm9vdExUUiIsImN1cnJlbnRMaW5lIiwicG9vbCIsImNyZWF0ZSIsImVsZW1lbnQiLCJjdXJyZW50TGluZVdpZHRoIiwiYm91bmRzIiwiaXNWYWxpZCIsIndpZHRoIiwibGluZUJyZWFrU3RhdGUiLCJhcHBlbmRFbGVtZW50IiwiYXBwZW5kTGluZSIsInNjcmF0Y2hUZXh0Iiwic2V0U3RyaW5nIiwic2V0Rm9udCIsImhlaWdodCIsInNwbGljZSIsImdldENoaWxkcmVuQ291bnQiLCJhbGlnbkxpbmVzIiwibGlua0VsZW1lbnQiLCJocmVmIiwiaSIsIm5vZGVzIiwiaXRlbSIsIm5vZGUiLCJsaW5rUm9vdE5vZGUiLCJpbm5lckNvbnRlbnQiLCJtYXRyaXgiLCJnZXRVbmlxdWVUcmFpbFRvIiwiZ2V0TWF0cml4IiwiZGV0YWNoIiwiZm9yRWFjaCIsImxpbmsiLCJ2YWx1ZSIsImluY2x1ZGVzIiwicG9wIiwiX2NoaWxkcmVuIiwiY2hpbGQiLCJyZW1vdmVDaGlsZCIsImNsZWFuIiwiZGlzcG9zZSIsImxpbmVOb2RlIiwidG9wIiwiYm90dG9tIiwibGVmdCIsImNvb3JkaW5hdGVOYW1lIiwiaWRlYWwiLCJnZXRDaGlsZEF0IiwiY29udGFpbmVyTm9kZSIsImZvbnQiLCJpc0xUUiIsImNvbnRhaW5lclNwYWNpbmciLCJyaWdodFNwYWNpbmciLCJsZWZ0U3BhY2luZyIsIndpZHRoQXZhaWxhYmxlV2l0aFNwYWNpbmciLCJjb250ZW50IiwiZml0c0luIiwicmFuZ2VzIiwicmFuZ2VzVG9TdHJpbmciLCJzbGljZSIsIm1pbiIsIm1heCIsInNraXBwZWRSYW5nZXMiLCJzdWNjZXNzIiwidW5zaGlmdCIsInRhZ05hbWUiLCJkaXJBdHRyaWJ1dGVTdHJpbmciLCJoaW1hbGF5YUdldEF0dHJpYnV0ZSIsInJlZmVyZW5jZWRJZCIsInJlZmVyZW5jZWROb2RlIiwibm9kZUFsaWduIiwidGV4dEJvdW5kcyIsImNlbnRlclkiLCJzdHlsZUF0dHJpYnV0ZVN0cmluZyIsImNzcyIsImhpbWFsYXlhU3R5bGVTdHJpbmdUb01hcCIsImtleSIsIl8iLCJjb2xvciIsImZvbnRPcHRpb25zIiwic3R5bGVLZXkiLCJmcm9tQ1NTIiwiY29weSIsIm9yaWdpbmFsSHJlZiIsInN0YXJ0c1dpdGgiLCJpbmRleE9mIiwibGlua05hbWUiLCJoaW1hbGF5YUVsZW1lbnRUb0FjY2Vzc2libGVTdHJpbmciLCJ3ZWlnaHQiLCJzdHlsZSIsInNjYWxlIiwiYWRkRXh0cmFCZWZvcmVTcGFjaW5nIiwieSIsImdldFNjYWxlVmVjdG9yIiwieCIsImNoaWxkcmVuIiwid2lkdGhCZWZvcmUiLCJjaGlsZEVsZW1lbnQiLCJ3aWR0aEFmdGVyIiwiaXNGaW5pdGUiLCJ1bmRlcmxpbmVZIiwibG9jYWxMZWZ0IiwibG9jYWxSaWdodCIsInN0cm9rZSIsImxpbmVXaWR0aCIsInN0cmlrZXRocm91Z2hZIiwid2FzQWRkZWQiLCJhZGRFbGVtZW50IiwiZmlsdGVyIiwidW5kZWZpbmVkIiwic2V0IiwiZ2V0U3RyaW5nIiwic2V0Qm91bmRzTWV0aG9kIiwibWV0aG9kIiwiYm91bmRzTWV0aG9kIiwiZ2V0Qm91bmRzTWV0aG9kIiwiZ2V0Rm9udCIsInNldEZpbGwiLCJnZXRGaWxsIiwic2V0U3Ryb2tlIiwiZ2V0U3Ryb2tlIiwic2V0TGluZVdpZHRoIiwiZ2V0TGluZVdpZHRoIiwic2V0U3ViU2NhbGUiLCJzdWJTY2FsZSIsImdldFN1YlNjYWxlIiwic2V0U3ViWFNwYWNpbmciLCJzdWJYU3BhY2luZyIsImdldFN1YlhTcGFjaW5nIiwic2V0U3ViWU9mZnNldCIsInN1YllPZmZzZXQiLCJnZXRTdWJZT2Zmc2V0Iiwic2V0U3VwU2NhbGUiLCJzdXBTY2FsZSIsImdldFN1cFNjYWxlIiwic2V0U3VwWFNwYWNpbmciLCJzdXBYU3BhY2luZyIsImdldFN1cFhTcGFjaW5nIiwic2V0U3VwWU9mZnNldCIsInN1cFlPZmZzZXQiLCJnZXRTdXBZT2Zmc2V0Iiwic2V0Q2FwSGVpZ2h0U2NhbGUiLCJjYXBIZWlnaHRTY2FsZSIsImdldENhcEhlaWdodFNjYWxlIiwic2V0VW5kZXJsaW5lTGluZVdpZHRoIiwidW5kZXJsaW5lTGluZVdpZHRoIiwiZ2V0VW5kZXJsaW5lTGluZVdpZHRoIiwic2V0VW5kZXJsaW5lSGVpZ2h0U2NhbGUiLCJ1bmRlcmxpbmVIZWlnaHRTY2FsZSIsImdldFVuZGVybGluZUhlaWdodFNjYWxlIiwic2V0U3RyaWtldGhyb3VnaExpbmVXaWR0aCIsInN0cmlrZXRocm91Z2hMaW5lV2lkdGgiLCJnZXRTdHJpa2V0aHJvdWdoTGluZVdpZHRoIiwic2V0U3RyaWtldGhyb3VnaEhlaWdodFNjYWxlIiwic3RyaWtldGhyb3VnaEhlaWdodFNjYWxlIiwiZ2V0U3RyaWtldGhyb3VnaEhlaWdodFNjYWxlIiwic2V0TGlua0ZpbGwiLCJsaW5rRmlsbCIsImdldExpbmtGaWxsIiwic2V0TGlua0V2ZW50c0hhbmRsZWQiLCJsaW5rRXZlbnRzSGFuZGxlZCIsImdldExpbmtFdmVudHNIYW5kbGVkIiwic2V0TGlua3MiLCJsaW5rcyIsImdldFByb3RvdHlwZU9mIiwicHJvdG90eXBlIiwiZ2V0TGlua3MiLCJzZXROb2RlcyIsImdldE5vZGVzIiwic2V0UmVwbGFjZU5ld2xpbmVzIiwicmVwbGFjZU5ld2xpbmVzIiwiZ2V0UmVwbGFjZU5ld2xpbmVzIiwic2V0QWxpZ24iLCJhbGlnbiIsImdldEFsaWduIiwic2V0TGVhZGluZyIsImxlYWRpbmciLCJnZXRMZWFkaW5nIiwic2V0TGluZVdyYXAiLCJsaW5lV3JhcCIsImdldExpbmVXcmFwIiwiaGFzT3duUHJvcGVydHkiLCJzdHJpbmdXaXRoRm9udCIsInN0ciIsInZhcmlhbnQiLCJzdHJldGNoIiwiZmFtaWx5IiwibGluZUhlaWdodCIsImhpbWFsYXlhRWxlbWVudFRvU3RyaW5nIiwiY29udGVudFRvU3RyaW5nIiwibWFwIiwiam9pbiIsImRpckF0dHJpYnV0ZSIsInVuZXNjYXBlZENvbnRlbnQiLCJoZSIsImRlY29kZSIsIl9tdXRhdG9yS2V5cyIsInJlZ2lzdGVyIiwidmFsdWVUeXBlIiwic3VwZXJ0eXBlIiwiTm9kZUlPIiwiZG9jdW1lbnRhdGlvbiJdLCJzb3VyY2VzIjpbIlJpY2hUZXh0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERpc3BsYXlzIHJpY2ggdGV4dCBieSBpbnRlcnByZXRpbmcgdGhlIGlucHV0IHRleHQgYXMgSFRNTCwgc3VwcG9ydGluZyBhIGxpbWl0ZWQgc2V0IG9mIHRhZ3MgdGhhdCBwcmV2ZW50IGFueVxyXG4gKiBzZWN1cml0eSB2dWxuZXJhYmlsaXRpZXMuIEl0IGRvZXMgdGhpcyBieSBwYXJzaW5nIHRoZSBpbnB1dCBIVE1MIGFuZCBzcGxpdHRpbmcgaXQgaW50byBtdWx0aXBsZSBUZXh0IGNoaWxkcmVuXHJcbiAqIHJlY3Vyc2l2ZWx5LlxyXG4gKlxyXG4gKiBOT1RFOiBFbmNvZGluZyBIVE1MIGVudGl0aWVzIGlzIHJlcXVpcmVkLCBhbmQgbWFsZm9ybWVkIEhUTUwgaXMgbm90IGFjY2VwdGVkLlxyXG4gKlxyXG4gKiBOT1RFOiBDdXJyZW50bHkgaXQgY2FuIGxpbmUtd3JhcCBhdCB0aGUgc3RhcnQgYW5kIGVuZCBvZiB0YWdzLiBUaGlzIHdpbGwgcHJvYmFibHkgYmUgZml4ZWQgaW4gdGhlIGZ1dHVyZSB0byBvbmx5XHJcbiAqICAgICAgIHBvdGVudGlhbGx5IGJyZWFrIG9uIHdoaXRlc3BhY2UuXHJcbiAqXHJcbiAqIEl0IHN1cHBvcnRzIHRoZSBmb2xsb3dpbmcgbWFya3VwIGFuZCBmZWF0dXJlcyBpbiB0aGUgc3RyaW5nIGNvbnRlbnQgKGluIGFkZGl0aW9uIHRvIG90aGVyIG9wdGlvbnMgYXMgbGlzdGVkIGluXHJcbiAqIFJJQ0hfVEVYVF9PUFRJT05fS0VZUyk6XHJcbiAqIC0gPGEgaHJlZj1cInt7cGxhY2Vob2xkZXJ9fVwiPiBmb3IgbGlua3MgKHBhc3MgaW4geyBsaW5rczogeyBwbGFjZWhvbGRlcjogQUNUVUFMX0hSRUYgfSB9KVxyXG4gKiAtIDxiPiBhbmQgPHN0cm9uZz4gZm9yIGJvbGQgdGV4dFxyXG4gKiAtIDxpPiBhbmQgPGVtPiBmb3IgaXRhbGljIHRleHRcclxuICogLSA8c3ViPiBhbmQgPHN1cD4gZm9yIHN1YnNjcmlwdHMgLyBzdXBlcnNjcmlwdHNcclxuICogLSA8dT4gZm9yIHVuZGVybGluZWQgdGV4dFxyXG4gKiAtIDxzPiBmb3Igc3RyaWtldGhyb3VnaCB0ZXh0XHJcbiAqIC0gPHNwYW4+IHRhZ3Mgd2l0aCBhIGRpcj1cImx0clwiIC8gZGlyPVwicnRsXCIgYXR0cmlidXRlXHJcbiAqIC0gPGJyPiBmb3IgZXhwbGljaXQgbGluZSBicmVha3NcclxuICogLSA8bm9kZSBpZD1cImlkXCI+IGZvciBlbWJlZGRpbmcgYSBOb2RlIGludG8gdGhlIHRleHQgKHBhc3MgaW4geyBub2RlczogeyBpZDogTk9ERSB9IH0pLCB3aXRoIG9wdGlvbmFsIGFsaWduIGF0dHJpYnV0ZVxyXG4gKiAtIFVuaWNvZGUgYmlkaXJlY3Rpb25hbCBtYXJrcyAocHJlc2VudCBpbiBQaEVUIHN0cmluZ3MpIGZvciBmdWxsIFJUTCBzdXBwb3J0XHJcbiAqIC0gQ1NTIHN0eWxlPVwiLi4uXCIgYXR0cmlidXRlcywgd2l0aCBjb2xvciBhbmQgZm9udCBzZXR0aW5ncywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84MDdcclxuICpcclxuICogRXhhbXBsZXMgZnJvbSB0aGUgc2NlbmVyeS1waGV0IGRlbW86XHJcbiAqXHJcbiAqIG5ldyBSaWNoVGV4dCggJ1JpY2hUZXh0IGNhbiBoYXZlIDxiPmJvbGQ8L2I+IGFuZCA8aT5pdGFsaWM8L2k+IHRleHQuJyApLFxyXG4gKiBuZXcgUmljaFRleHQoICdDYW4gZG8gSDxzdWI+Mjwvc3ViPk8gKEE8c3ViPnN1Yjwvc3ViPiBhbmQgQTxzdXA+c3VwPC9zdXA+KSwgb3IgbmVzdGluZzogeDxzdXA+MjxzdXA+Mjwvc3VwPjwvc3VwPicgKSxcclxuICogbmV3IFJpY2hUZXh0KCAnQWRkaXRpb25hbGx5OiA8c3BhbiBzdHlsZT1cImNvbG9yOiBibHVlO1wiPmNvbG9yPC9zcGFuPiwgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDMwcHg7XCI+c2l6ZXM8L3NwYW4+LCA8c3BhbiBzdHlsZT1cImZvbnQtZmFtaWx5OiBzZXJpZjtcIj5mYWNlczwvc3Bhbj4sIDxzPnN0cmlrZXRocm91Z2g8L3M+LCBhbmQgPHU+dW5kZXJsaW5lPC91PicgKSxcclxuICogbmV3IFJpY2hUZXh0KCAnVGhlc2UgPGI+PGVtPmNhbjwvZW0+IDx1PjxzcGFuIHN0eWxlPVwiY29sb3I6IHJlZDtcIj5iZTwvc3Bhbj4gbWl4ZWQ8c3VwPjE8L3N1cD48L3U+PC9iPi4nICksXHJcbiAqIG5ldyBSaWNoVGV4dCggJ1xcdTIwMmFIYW5kbGVzIGJpZGlyZWN0aW9uYWwgdGV4dDogXFx1MjAyYjxzcGFuIHN0eWxlPVwiY29sb3I6ICMwYTA7XCI+2YXZgtin2KjYtjwvc3Bhbj4g2KfZhNmG2LUg2KvZhtin2KbZiiA8Yj7Yp9mE2KfYqtis2KfZhzwvYj48c3ViPjI8L3N1Yj5cXHUyMDJjXFx1MjAyYycgKSxcclxuICogbmV3IFJpY2hUZXh0KCAnXFx1MjAyYlxcdTA2MmFcXHUwNjMzXFx1MDYyYSAoXFx1MDYzMlxcdTA2MjhcXHUwNjI3XFx1MDY0NilcXHUyMDJjJyApLFxyXG4gKiBuZXcgUmljaFRleHQoICdIVE1MIGVudGl0aWVzIG5lZWQgdG8gYmUgZXNjYXBlZCwgbGlrZSAmYW1wOyBhbmQgJmx0Oy4nICksXHJcbiAqIG5ldyBSaWNoVGV4dCggJ1N1cHBvcnRzIDxhIGhyZWY9XCJ7e3BoZXRXZWJzaXRlfX1cIj48ZW0+bGlua3M8L2VtPiB3aXRoIDxiPm1hcmt1cDwvYj48L2E+LCBhbmQgPGEgaHJlZj1cInt7Y2FsbGJhY2t9fVwiPmxpbmtzIHRoYXQgY2FsbCBmdW5jdGlvbnM8L2E+LicsIHtcclxuICogICBsaW5rczoge1xyXG4gKiAgICAgcGhldFdlYnNpdGU6ICdodHRwczovL3BoZXQuY29sb3JhZG8uZWR1JyxcclxuICogICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcclxuICogICAgICAgY29uc29sZS5sb2coICdMaW5rIHdhcyBjbGlja2VkJyApO1xyXG4gKiAgICAgfVxyXG4gKiAgIH1cclxuICogfSApLFxyXG4gKiBuZXcgUmljaFRleHQoICdPciBhbHNvIDxhIGhyZWY9XCJodHRwczovL3BoZXQuY29sb3JhZG8uZWR1XCI+bGlua3MgZGlyZWN0bHkgaW4gdGhlIHN0cmluZzwvYT4uJywge1xyXG4gKiAgIGxpbmtzOiB0cnVlXHJcbiAqIH0gKSxcclxuICogbmV3IFJpY2hUZXh0KCAnTGlua3Mgbm90IGZvdW5kIDxhIGhyZWY9XCJ7e2JvZ3VzfX1cIj5hcmUgaWdub3JlZDwvYT4gZm9yIHNlY3VyaXR5LicgKSxcclxuICogbmV3IEhCb3goIHtcclxuICogICBzcGFjaW5nOiAzMCxcclxuICogICBjaGlsZHJlbjogW1xyXG4gKiAgICAgbmV3IFJpY2hUZXh0KCAnTXVsdGktbGluZSB0ZXh0IHdpdGggdGhlPGJyPnNlcGFyYXRvciAmbHQ7YnImZ3Q7IGFuZCA8YSBocmVmPVwiaHR0cHM6Ly9waGV0LmNvbG9yYWRvLmVkdVwiPmhhbmRsZXM8YnI+bGlua3M8L2E+IGFuZCBvdGhlciA8Yj50YWdzPGJyPmFjcm9zcyBsaW5lczwvYj4nLCB7XHJcbiAqICAgICAgIGxpbmtzOiB0cnVlXHJcbiAqICAgICB9ICksXHJcbiAqICAgICBuZXcgUmljaFRleHQoICdTdXBwb3NlZGx5IFJpY2hUZXh0IHN1cHBvcnRzIGxpbmUgd3JhcHBpbmcuIEhlcmUgaXMgYSBsaW5lV3JhcCBvZiAzMDAsIHdoaWNoIHNob3VsZCBwcm9iYWJseSB3cmFwIG11bHRpcGxlIHRpbWVzIGhlcmUnLCB7IGxpbmVXcmFwOiAzMDAgfSApXHJcbiAqICAgXVxyXG4gKiB9IClcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBQcm9wZXJ0eU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvU3RyaW5nUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVGlueUZvcndhcmRpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RpbnlGb3J3YXJkaW5nUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IHsgYWxsb3dMaW5rc1Byb3BlcnR5LCBDb2xvciwgRm9udCwgZ2V0TGluZUJyZWFrUmFuZ2VzLCBIaW1hbGF5YU5vZGUsIGlzSGltYWxheWFFbGVtZW50Tm9kZSwgaXNIaW1hbGF5YVRleHROb2RlLCBMaW5lLCBOb2RlLCBOb2RlT3B0aW9ucywgUmljaFRleHRDbGVhbmFibGVOb2RlLCBSaWNoVGV4dEVsZW1lbnQsIFJpY2hUZXh0TGVhZiwgUmljaFRleHRMaW5rLCBSaWNoVGV4dE5vZGUsIFJpY2hUZXh0VXRpbHMsIFJpY2hUZXh0VmVydGljYWxTcGFjZXIsIHNjZW5lcnksIFRleHQsIFRleHRCb3VuZHNNZXRob2QsIFRQYWludCB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCB7IFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XHJcblxyXG4vLyBPcHRpb25zIHRoYXQgY2FuIGJlIHVzZWQgaW4gdGhlIGNvbnN0cnVjdG9yLCB3aXRoIG11dGF0ZSgpLCBvciBkaXJlY3RseSBhcyBzZXR0ZXJzL2dldHRlcnNcclxuLy8gZWFjaCBvZiB0aGVzZSBvcHRpb25zIGhhcyBhbiBhc3NvY2lhdGVkIHNldHRlciwgc2VlIHNldHRlciBtZXRob2RzIGZvciBtb3JlIGRvY3VtZW50YXRpb25cclxuY29uc3QgUklDSF9URVhUX09QVElPTl9LRVlTID0gW1xyXG4gICdib3VuZHNNZXRob2QnLFxyXG4gICdmb250JyxcclxuICAnZmlsbCcsXHJcbiAgJ3N0cm9rZScsXHJcbiAgJ2xpbmVXaWR0aCcsXHJcbiAgJ3N1YlNjYWxlJyxcclxuICAnc3ViWFNwYWNpbmcnLFxyXG4gICdzdWJZT2Zmc2V0JyxcclxuICAnc3VwU2NhbGUnLFxyXG4gICdzdXBYU3BhY2luZycsXHJcbiAgJ3N1cFlPZmZzZXQnLFxyXG4gICdjYXBIZWlnaHRTY2FsZScsXHJcbiAgJ3VuZGVybGluZUxpbmVXaWR0aCcsXHJcbiAgJ3VuZGVybGluZUhlaWdodFNjYWxlJyxcclxuICAnc3RyaWtldGhyb3VnaExpbmVXaWR0aCcsXHJcbiAgJ3N0cmlrZXRocm91Z2hIZWlnaHRTY2FsZScsXHJcbiAgJ2xpbmtGaWxsJyxcclxuICAnbGlua0V2ZW50c0hhbmRsZWQnLFxyXG4gICdsaW5rcycsXHJcbiAgJ25vZGVzJyxcclxuICAncmVwbGFjZU5ld2xpbmVzJyxcclxuICAnYWxpZ24nLFxyXG4gICdsZWFkaW5nJyxcclxuICAnbGluZVdyYXAnLFxyXG4gIFRleHQuU1RSSU5HX1BST1BFUlRZX05BTUUsXHJcbiAgJ3N0cmluZydcclxuXTtcclxuXHJcbmV4cG9ydCB0eXBlIFJpY2hUZXh0QWxpZ24gPSAnbGVmdCcgfCAnY2VudGVyJyB8ICdyaWdodCc7XHJcbmV4cG9ydCB0eXBlIFJpY2hUZXh0SHJlZiA9ICggKCkgPT4gdm9pZCApIHwgc3RyaW5nO1xyXG50eXBlIFJpY2hUZXh0TGlua3NPYmplY3QgPSBSZWNvcmQ8c3RyaW5nLCBSaWNoVGV4dEhyZWY+O1xyXG5leHBvcnQgdHlwZSBSaWNoVGV4dExpbmtzID0gUmljaFRleHRMaW5rc09iamVjdCB8IHRydWU7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIC8vIFNldHMgaG93IGJvdW5kcyBhcmUgZGV0ZXJtaW5lZCBmb3IgdGV4dFxyXG4gIGJvdW5kc01ldGhvZD86IFRleHRCb3VuZHNNZXRob2Q7XHJcblxyXG4gIC8vIFNldHMgdGhlIGZvbnQgZm9yIHRoZSB0ZXh0XHJcbiAgZm9udD86IEZvbnQgfCBzdHJpbmc7XHJcblxyXG4gIC8vIFNldHMgdGhlIGZpbGwgb2YgdGhlIHRleHRcclxuICBmaWxsPzogVFBhaW50O1xyXG5cclxuICAvLyBTZXRzIHRoZSBzdHJva2UgYXJvdW5kIHRoZSB0ZXh0XHJcbiAgc3Ryb2tlPzogVFBhaW50O1xyXG5cclxuICAvLyBTZXRzIHRoZSBsaW5lV2lkdGggYXJvdW5kIHRoZSB0ZXh0XHJcbiAgbGluZVdpZHRoPzogbnVtYmVyO1xyXG5cclxuICAvLyBTZXRzIHRoZSBzY2FsZSBvZiBhbnkgc3Vic2NyaXB0IGVsZW1lbnRzXHJcbiAgc3ViU2NhbGU/OiBudW1iZXI7XHJcblxyXG4gIC8vIFNldHMgaG9yaXpvbnRhbCBzcGFjaW5nIGJlZm9yZSBhbnkgc3Vic2NyaXB0IGVsZW1lbnRzXHJcbiAgc3ViWFNwYWNpbmc/OiBudW1iZXI7XHJcblxyXG4gIC8vIFNldHMgdmVydGljYWwgb2Zmc2V0IGZvciBhbnkgc3Vic2NyaXB0IGVsZW1lbnRzXHJcbiAgc3ViWU9mZnNldD86IG51bWJlcjtcclxuXHJcbiAgLy8gU2V0cyB0aGUgc2NhbGUgZm9yIGFueSBzdXBlcnNjcmlwdCBlbGVtZW50c1xyXG4gIHN1cFNjYWxlPzogbnVtYmVyO1xyXG5cclxuICAvLyBTZXRzIHRoZSBob3Jpem9udGFsIG9mZnNldCBiZWZvcmUgYW55IHN1cGVyc2NyaXB0IGVsZW1lbnRzXHJcbiAgc3VwWFNwYWNpbmc/OiBudW1iZXI7XHJcblxyXG4gIC8vIFNldHMgdGhlIHZlcnRpY2FsIG9mZnNldCBmb3IgYW55IHN1cGVyc2NyaXB0IGVsZW1lbnRzXHJcbiAgc3VwWU9mZnNldD86IG51bWJlcjtcclxuXHJcbiAgLy8gU2V0cyB0aGUgZXhwZWN0ZWQgY2FwIGhlaWdodCBjYXAgaGVpZ2h0IChiYXNlbGluZSB0byB0b3Agb2YgY2FwaXRhbCBsZXR0ZXJzKSBhcyBhIHNjYWxlXHJcbiAgY2FwSGVpZ2h0U2NhbGU/OiBudW1iZXI7XHJcblxyXG4gIC8vIFNldHMgdGhlIGxpbmUgd2lkdGggZm9yIHVuZGVybGluZXNcclxuICB1bmRlcmxpbmVMaW5lV2lkdGg/OiBudW1iZXI7XHJcblxyXG4gIC8vIFNldHMgdGhlIHVuZGVybGluZSBoZWlnaHQgYXMgYSBzY2FsZSByZWxhdGl2ZSB0byB0ZXh0IGJvdW5kcyBoZWlnaHRcclxuICB1bmRlcmxpbmVIZWlnaHRTY2FsZT86IG51bWJlcjtcclxuXHJcbiAgLy8gU2V0cyBsaW5lIHdpZHRoIGZvciBzdHJpa2V0aHJvdWdoXHJcbiAgc3RyaWtldGhyb3VnaExpbmVXaWR0aD86IG51bWJlcjtcclxuXHJcbiAgLy8gU2V0cyBoZWlnaHQgb2Ygc3RyaWtldGhyb3VnaCBhcyBhIHNjYWxlIHJlbGF0aXZlIHRvIHRleHQgYm91bmRzIGhlaWdodFxyXG4gIHN0cmlrZXRocm91Z2hIZWlnaHRTY2FsZT86IG51bWJlcjtcclxuXHJcbiAgLy8gU2V0cyB0aGUgZmlsbCBmb3IgbGlua3Mgd2l0aGluIHRoZSB0ZXh0XHJcbiAgbGlua0ZpbGw/OiBUUGFpbnQ7XHJcblxyXG4gIC8vIFNldHMgd2hldGhlciBsaW5rIGNsaWNrcyB3aWxsIGNhbGwgZXZlbnQuaGFuZGxlKClcclxuICBsaW5rRXZlbnRzSGFuZGxlZD86IGJvb2xlYW47XHJcblxyXG4gIC8vIFNldHMgdGhlIG1hcCBvZiBocmVmIHBsYWNlaG9sZGVyID0+IGFjdHVhbCBocmVmL2NhbGxiYWNrIHVzZWQgZm9yIGxpbmtzLiBIb3dldmVyLCBpZiBzZXQgdG8gdHJ1ZSAoe2Jvb2xlYW59KSBhcyBhXHJcbiAgLy8gZnVsbCBvYmplY3QsIGxpbmtzIGluIHRoZSBzdHJpbmcgd2lsbCBub3QgYmUgbWFwcGVkLCBidXQgd2lsbCBiZSBkaXJlY3RseSBhZGRlZC5cclxuICAvL1xyXG4gIC8vIEZvciBpbnN0YW5jZSwgdGhlIGRlZmF1bHQgaXMgdG8gbWFwIGhyZWZzIGZvciBzZWN1cml0eSBwdXJwb3NlczpcclxuICAvL1xyXG4gIC8vIG5ldyBSaWNoVGV4dCggJzxhIGhyZWY9XCJ7e2FsaW5rfX1cIj5jb250ZW50PC9hPicsIHtcclxuICAvLyAgIGxpbmtzOiB7XHJcbiAgLy8gICAgIGFsaW5rOiAnaHR0cHM6Ly9waGV0LmNvbG9yYWRvLmVkdSdcclxuICAvLyAgIH1cclxuICAvLyB9ICk7XHJcbiAgLy9cclxuICAvLyBCdXQgbGlua3Mgd2l0aCBhbiBocmVmIG5vdCBtYXRjaGluZyB3aWxsIGJlIGlnbm9yZWQuIFRoaXMgY2FuIGJlIGF2b2lkZWQgYnkgcGFzc2luZyBsaW5rczogdHJ1ZSB0byBkaXJlY3RseVxyXG4gIC8vIGVtYmVkIGxpbmtzOlxyXG4gIC8vXHJcbiAgLy8gbmV3IFJpY2hUZXh0KCAnPGEgaHJlZj1cImh0dHBzOi8vcGhldC5jb2xvcmFkby5lZHVcIj5jb250ZW50PC9hPicsIHsgbGlua3M6IHRydWUgfSApO1xyXG4gIC8vXHJcbiAgLy8gQ2FsbGJhY2tzIChpbnN0ZWFkIG9mIGEgVVJMKSBhcmUgYWxzbyBzdXBwb3J0ZWQsIGUuZy46XHJcbiAgLy9cclxuICAvLyBuZXcgUmljaFRleHQoICc8YSBocmVmPVwie3thY2FsbGJhY2t9fVwiPmNvbnRlbnQ8L2E+Jywge1xyXG4gIC8vICAgbGlua3M6IHtcclxuICAvLyAgICAgYWNhbGxiYWNrOiBmdW5jdGlvbigpIHsgY29uc29sZS5sb2coICdjbGlja2VkJyApIH1cclxuICAvLyAgIH1cclxuICAvLyB9ICk7XHJcbiAgLy9cclxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvMzE2IGZvciBtb3JlIGluZm9ybWF0aW9uLlxyXG4gIGxpbmtzPzogUmljaFRleHRMaW5rcztcclxuXHJcbiAgLy8gQSBtYXAgb2Ygc3RyaW5nID0+IE5vZGUsIHdoZXJlIGA8bm9kZSBpZD1cInN0cmluZ1wiLz5gIHdpbGwgZ2V0IHJlcGxhY2VkIGJ5IHRoZSBnaXZlbiBOb2RlIChEQUcgc3VwcG9ydGVkKVxyXG4gIC8vXHJcbiAgLy8gRm9yIGV4YW1wbGU6XHJcbiAgLy9cclxuICAvLyBuZXcgUmljaFRleHQoICdUaGlzIGlzIGEgPG5vZGUgaWQ9XCJ0ZXN0XCIvPicsIHtcclxuICAvLyAgIG5vZGVzOiB7XHJcbiAgLy8gICAgIHRlc3Q6IG5ldyBUZXh0KCAnTm9kZScgKVxyXG4gIC8vICAgfVxyXG4gIC8vIH1cclxuICAvL1xyXG4gIC8vIEFsaWdubWVudCBpcyBhbHNvIHN1cHBvcnRlZCwgd2l0aCB0aGUgYWxpZ24gYXR0cmlidXRlIChjZW50ZXIvdG9wL2JvdHRvbS9vcmlnaW4pLlxyXG4gIC8vIFRoaXMgYWxpZ25tZW50IGlzIGluIHJlbGF0aW9uIHRvIHRoZSBjdXJyZW50IHRleHQvZm9udCBzaXplIGluIHRoZSBIVE1MIHdoZXJlIHRoZSA8bm9kZT4gdGFnIGlzIHBsYWNlZC5cclxuICAvLyBBbiBleGFtcGxlOlxyXG4gIC8vXHJcbiAgLy8gbmV3IFJpY2hUZXh0KCAnVGhpcyBpcyBhIDxub2RlIGlkPVwidGVzdFwiIGFsaWduPVwidG9wXCIvPicsIHtcclxuICAvLyAgIG5vZGVzOiB7XHJcbiAgLy8gICAgIHRlc3Q6IG5ldyBUZXh0KCAnTm9kZScgKVxyXG4gIC8vICAgfVxyXG4gIC8vIH1cclxuICAvLyBOT1RFOiBXaGVuIGFsaWdubWVudCBpc24ndCBzdXBwbGllZCwgb3JpZ2luIGlzIHVzZWQgYXMgYSBkZWZhdWx0LiBPcmlnaW4gbWVhbnMgXCJ5PTAgaXMgcGxhY2VkIGF0IHRoZSBiYXNlbGluZSBvZlxyXG4gIC8vIHRoZSB0ZXh0XCIuXHJcbiAgbm9kZXM/OiBSZWNvcmQ8c3RyaW5nLCBOb2RlPjtcclxuXHJcbiAgLy8gV2lsbCByZXBsYWNlIG5ld2xpbmVzIChgXFxuYCkgd2l0aCA8YnI+LCBzaW1pbGFyIHRvIHRoZSBvbGQgTXVsdGlMaW5lVGV4dCAoZGVmYXVsdHMgdG8gZmFsc2UpXHJcbiAgcmVwbGFjZU5ld2xpbmVzPzogYm9vbGVhbjtcclxuXHJcbiAgLy8gU2V0cyB0ZXh0IGFsaWdubWVudCBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgbGluZXNcclxuICBhbGlnbj86IFJpY2hUZXh0QWxpZ247XHJcblxyXG4gIC8vIFNldHMgdGhlIHNwYWNpbmcgYmV0d2VlbiBsaW5lcyBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgbGluZXNcclxuICBsZWFkaW5nPzogbnVtYmVyO1xyXG5cclxuICAvLyBTZXRzIHdpZHRoIG9mIHRleHQgYmVmb3JlIGNyZWF0aW5nIGEgbmV3IGxpbmVcclxuICBsaW5lV3JhcD86IG51bWJlciB8IG51bGw7XHJcblxyXG4gIC8vIFNldHMgZm9yd2FyZGluZyBvZiB0aGUgc3RyaW5nUHJvcGVydHksIHNlZSBzZXRTdHJpbmdQcm9wZXJ0eSgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cclxuICBzdHJpbmdQcm9wZXJ0eT86IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4gfCBudWxsO1xyXG5cclxuICBzdHJpbmdQcm9wZXJ0eU9wdGlvbnM/OiBQcm9wZXJ0eU9wdGlvbnM8c3RyaW5nPjtcclxuXHJcbiAgLy8gU2V0cyB0aGUgc3RyaW5nIHRvIGJlIGRpc3BsYXllZCBieSB0aGlzIE5vZGVcclxuICBzdHJpbmc/OiBzdHJpbmcgfCBudW1iZXI7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBSaWNoVGV4dE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE5vZGVPcHRpb25zO1xyXG5cclxuY29uc3QgREVGQVVMVF9GT05UID0gbmV3IEZvbnQoIHtcclxuICBzaXplOiAyMFxyXG59ICk7XHJcblxyXG4vLyBUYWdzIHRoYXQgc2hvdWxkIGJlIGluY2x1ZGVkIGluIGFjY2Vzc2libGUgaW5uZXJDb250ZW50LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy80MzBcclxuY29uc3QgQUNDRVNTSUJMRV9UQUdTID0gW1xyXG4gICdiJywgJ3N0cm9uZycsICdpJywgJ2VtJywgJ3N1YicsICdzdXAnLCAndScsICdzJ1xyXG5dO1xyXG5cclxuLy8gV2hhdCB0eXBlIG9mIGxpbmUtYnJlYWsgc2l0dWF0aW9ucyB3ZSBjYW4gYmUgaW4gZHVyaW5nIG91ciByZWN1cnNpdmUgcHJvY2Vzc1xyXG5jb25zdCBMaW5lQnJlYWtTdGF0ZSA9IHtcclxuICAvLyBUaGVyZSB3YXMgYSBsaW5lIGJyZWFrLCBidXQgaXQgd2FzIGF0IHRoZSBlbmQgb2YgdGhlIGVsZW1lbnQgKG9yIHdhcyBhIDxicj4pLiBUaGUgcmVsZXZhbnQgZWxlbWVudCBjYW4gYmUgZnVsbHlcclxuICAvLyByZW1vdmVkIGZyb20gdGhlIHRyZWUuXHJcbiAgQ09NUExFVEU6ICdDT01QTEVURScsXHJcblxyXG4gIC8vIFRoZXJlIHdhcyBhIGxpbmUgYnJlYWssIGJ1dCB0aGVyZSBpcyBzb21lIGNvbnRlbnQgbGVmdCBpbiB0aGlzIGVsZW1lbnQgYWZ0ZXIgdGhlIGxpbmUgYnJlYWsuIERPIE5PVCByZW1vdmUgaXQuXHJcbiAgSU5DT01QTEVURTogJ0lOQ09NUExFVEUnLFxyXG5cclxuICAvLyBUaGVyZSB3YXMgTk8gbGluZSBicmVha1xyXG4gIE5PTkU6ICdOT05FJ1xyXG59O1xyXG5cclxuLy8gV2UnbGwgc3RvcmUgYW4gYXJyYXkgaGVyZSB0aGF0IHdpbGwgcmVjb3JkIHdoaWNoIGxpbmtzL25vZGVzIHdlcmUgdXNlZCBpbiB0aGUgbGFzdCByZWJ1aWxkIChzbyB3ZSBjYW4gYXNzZXJ0IG91dCBpZlxyXG4vLyB0aGVyZSB3ZXJlIHNvbWUgdGhhdCB3ZXJlIG5vdCB1c2VkKS5cclxuY29uc3QgdXNlZExpbmtzOiBzdHJpbmdbXSA9IFtdO1xyXG5jb25zdCB1c2VkTm9kZXM6IHN0cmluZ1tdID0gW107XHJcblxyXG4vLyBoaW1hbGF5YSBjb252ZXJ0cyBkYXNoIHNlcGFyYXRlZCBDU1MgdG8gY2FtZWwgY2FzZSAtIHVzZSBDU1MgY29tcGF0aWJsZSBzdHlsZSB3aXRoIGRhc2hlcywgc2VlIGFib3ZlIGZvciBleGFtcGxlc1xyXG5jb25zdCBGT05UX1NUWUxFX01BUCA9IHtcclxuICAnZm9udC1mYW1pbHknOiAnZmFtaWx5JyxcclxuICAnZm9udC1zaXplJzogJ3NpemUnLFxyXG4gICdmb250LXN0cmV0Y2gnOiAnc3RyZXRjaCcsXHJcbiAgJ2ZvbnQtc3R5bGUnOiAnc3R5bGUnLFxyXG4gICdmb250LXZhcmlhbnQnOiAndmFyaWFudCcsXHJcbiAgJ2ZvbnQtd2VpZ2h0JzogJ3dlaWdodCcsXHJcbiAgJ2xpbmUtaGVpZ2h0JzogJ2xpbmVIZWlnaHQnXHJcbn0gYXMgY29uc3Q7XHJcblxyXG5jb25zdCBGT05UX1NUWUxFX0tFWVMgPSBPYmplY3Qua2V5cyggRk9OVF9TVFlMRV9NQVAgKSBhcyAoIGtleW9mIHR5cGVvZiBGT05UX1NUWUxFX01BUCApW107XHJcbmNvbnN0IFNUWUxFX0tFWVMgPSBbICdjb2xvcicgXS5jb25jYXQoIEZPTlRfU1RZTEVfS0VZUyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmljaFRleHQgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLy8gVGhlIHN0cmluZyB0byBkaXNwbGF5LiBXZSdsbCBpbml0aWFsaXplIHRoaXMgYnkgbXV0YXRpbmcuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBfc3RyaW5nUHJvcGVydHk6IFRpbnlGb3J3YXJkaW5nUHJvcGVydHk8c3RyaW5nPjtcclxuXHJcbiAgcHJpdmF0ZSBfZm9udDogRm9udCB8IHN0cmluZyA9IERFRkFVTFRfRk9OVDtcclxuICBwcml2YXRlIF9ib3VuZHNNZXRob2Q6IFRleHRCb3VuZHNNZXRob2QgPSAnaHlicmlkJztcclxuICBwcml2YXRlIF9maWxsOiBUUGFpbnQgPSAnIzAwMDAwMCc7XHJcbiAgcHJpdmF0ZSBfc3Ryb2tlOiBUUGFpbnQgPSBudWxsO1xyXG4gIHByaXZhdGUgX2xpbmVXaWR0aCA9IDE7XHJcblxyXG4gIHByaXZhdGUgX3N1YlNjYWxlID0gMC43NTtcclxuICBwcml2YXRlIF9zdWJYU3BhY2luZyA9IDA7XHJcbiAgcHJpdmF0ZSBfc3ViWU9mZnNldCA9IDA7XHJcblxyXG4gIHByaXZhdGUgX3N1cFNjYWxlID0gMC43NTtcclxuICBwcml2YXRlIF9zdXBYU3BhY2luZyA9IDA7XHJcbiAgcHJpdmF0ZSBfc3VwWU9mZnNldCA9IDA7XHJcblxyXG4gIHByaXZhdGUgX2NhcEhlaWdodFNjYWxlID0gMC43NTtcclxuXHJcbiAgcHJpdmF0ZSBfdW5kZXJsaW5lTGluZVdpZHRoID0gMTtcclxuICBwcml2YXRlIF91bmRlcmxpbmVIZWlnaHRTY2FsZSA9IDAuMTU7XHJcblxyXG4gIHByaXZhdGUgX3N0cmlrZXRocm91Z2hMaW5lV2lkdGggPSAxO1xyXG4gIHByaXZhdGUgX3N0cmlrZXRocm91Z2hIZWlnaHRTY2FsZSA9IDAuMztcclxuXHJcbiAgcHJpdmF0ZSBfbGlua0ZpbGw6IFRQYWludCA9ICdyZ2IoMjcsMCwyNDEpJztcclxuXHJcbiAgcHJpdmF0ZSBfbGlua0V2ZW50c0hhbmRsZWQgPSBmYWxzZTtcclxuXHJcbiAgLy8gSWYgYW4gb2JqZWN0LCB2YWx1ZXMgYXJlIGVpdGhlciB7c3RyaW5nfSBvciB7ZnVuY3Rpb259XHJcbiAgcHJpdmF0ZSBfbGlua3M6IFJpY2hUZXh0TGlua3MgPSB7fTtcclxuXHJcbiAgcHJpdmF0ZSBfbm9kZXM6IFJlY29yZDxzdHJpbmcsIE5vZGU+ID0ge307XHJcblxyXG4gIHByaXZhdGUgX3JlcGxhY2VOZXdsaW5lcyA9IGZhbHNlO1xyXG4gIHByaXZhdGUgX2FsaWduOiBSaWNoVGV4dEFsaWduID0gJ2xlZnQnO1xyXG4gIHByaXZhdGUgX2xlYWRpbmcgPSAwO1xyXG4gIHByaXZhdGUgX2xpbmVXcmFwOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgLy8gV2UgbmVlZCB0byBjb25zb2xpZGF0ZSBsaW5rcyAodGhhdCBjb3VsZCBiZSBzcGxpdCBhY3Jvc3MgbXVsdGlwbGUgbGluZXMpIHVuZGVyIG9uZSBcImxpbmtcIiBub2RlLCBzbyB3ZSB0cmFjayBjcmVhdGVkXHJcbiAgLy8gbGluayBmcmFnbWVudHMgaGVyZSBzbyB0aGV5IGNhbiBnZXQgcGllY2VkIHRvZ2V0aGVyIGxhdGVyLlxyXG4gIHByaXZhdGUgX2xpbmtJdGVtczogeyBlbGVtZW50OiBIaW1hbGF5YU5vZGU7IG5vZGU6IE5vZGU7IGhyZWY6IFJpY2hUZXh0SHJlZiB9W10gPSBbXTtcclxuXHJcbiAgLy8gV2hldGhlciBzb21ldGhpbmcgaGFzIGJlZW4gYWRkZWQgdG8gdGhpcyBsaW5lIHlldC4gV2UgZG9uJ3Qgd2FudCB0byBpbmZpbml0ZS1sb29wIG91dCBpZiBzb21ldGhpbmcgaXMgbG9uZ2VyIHRoYW5cclxuICAvLyBvdXIgbGluZVdyYXAsIHNvIHdlJ2xsIHBsYWNlIG9uZSBpdGVtIG9uIGl0cyBvd24gb24gYW4gb3RoZXJ3aXNlIGVtcHR5IGxpbmUuXHJcbiAgcHJpdmF0ZSBfaGFzQWRkZWRMZWFmVG9MaW5lID0gZmFsc2U7XHJcblxyXG4gIC8vIE5vcm1hbCBsYXlvdXQgY29udGFpbmVyIG9mIGxpbmVzIChzZXBhcmF0ZSwgc28gd2UgY2FuIGNsZWFyIGl0IGVhc2lseSlcclxuICBwcml2YXRlIGxpbmVDb250YWluZXI6IE5vZGU7XHJcblxyXG4gIC8vIFRleHQgYW5kIFJpY2hUZXh0IGN1cnJlbnRseSB1c2UgdGhlIHNhbWUgdGFuZGVtIG5hbWUgZm9yIHRoZWlyIHN0cmluZ1Byb3BlcnR5LlxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU1RSSU5HX1BST1BFUlRZX1RBTkRFTV9OQU1FID0gVGV4dC5TVFJJTkdfUFJPUEVSVFlfVEFOREVNX05BTUU7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3RyaW5nOiBzdHJpbmcgfCBudW1iZXIgfCBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCBwcm92aWRlZE9wdGlvbnM/OiBSaWNoVGV4dE9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gV2Ugb25seSBmaWxsIGluIHNvbWUgZGVmYXVsdHMsIHNpbmNlIHRoZSBvdGhlciBkZWZhdWx0cyBhcmUgZGVmaW5lZCBiZWxvdyAoYW5kIG11dGF0ZSBpcyByZWxpZWQgb24pXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFJpY2hUZXh0T3B0aW9ucywgUGljazxTZWxmT3B0aW9ucywgJ2ZpbGwnPiwgTm9kZU9wdGlvbnM+KCkoIHtcclxuICAgICAgZmlsbDogJyMwMDAwMDAnLFxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRJT05BTCxcclxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ1RleHQnLFxyXG4gICAgICBwaGV0aW9UeXBlOiBSaWNoVGV4dC5SaWNoVGV4dElPLFxyXG4gICAgICBwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQ6IGZhbHNlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBpZiAoIHR5cGVvZiBzdHJpbmcgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzdHJpbmcgPT09ICdudW1iZXInICkge1xyXG4gICAgICBvcHRpb25zLnN0cmluZyA9IHN0cmluZztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBvcHRpb25zLnN0cmluZ1Byb3BlcnR5ID0gc3RyaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgdGhpcy5fc3RyaW5nUHJvcGVydHkgPSBuZXcgVGlueUZvcndhcmRpbmdQcm9wZXJ0eSggJycsIHRydWUsIHRoaXMub25TdHJpbmdQcm9wZXJ0eUNoYW5nZS5iaW5kKCB0aGlzICkgKTtcclxuXHJcbiAgICB0aGlzLmxpbmVDb250YWluZXIgPSBuZXcgTm9kZSgge30gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMubGluZUNvbnRhaW5lciApO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgdG8gYW4gZW1wdHkgc3RhdGUsIHNvIHdlIGFyZSBpbW1lZGlhdGVseSB2YWxpZCAoc2luY2Ugbm93IHdlIG5lZWQgdG8gY3JlYXRlIGFuIGVtcHR5IGxlYWYgZXZlbiBpZiB3ZVxyXG4gICAgLy8gaGF2ZSBlbXB0eSB0ZXh0KS5cclxuICAgIHRoaXMucmVidWlsZFJpY2hUZXh0KCk7XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIG91ciBzdHJpbmdQcm9wZXJ0eSBjaGFuZ2VzIHZhbHVlcy5cclxuICAgKi9cclxuICBwcml2YXRlIG9uU3RyaW5nUHJvcGVydHlDaGFuZ2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGRvY3VtZW50YXRpb24gZm9yIE5vZGUuc2V0VmlzaWJsZVByb3BlcnR5LCBleGNlcHQgdGhpcyBpcyBmb3IgdGhlIHRleHQgc3RyaW5nLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRTdHJpbmdQcm9wZXJ0eSggbmV3VGFyZ2V0OiBUUHJvcGVydHk8c3RyaW5nPiB8IG51bGwgKTogdGhpcyB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3RyaW5nUHJvcGVydHkuc2V0VGFyZ2V0UHJvcGVydHkoIHRoaXMsIFJpY2hUZXh0LlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSwgbmV3VGFyZ2V0ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHN0cmluZ1Byb3BlcnR5KCBwcm9wZXJ0eTogVFByb3BlcnR5PHN0cmluZz4gfCBudWxsICkgeyB0aGlzLnNldFN0cmluZ1Byb3BlcnR5KCBwcm9wZXJ0eSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgc3RyaW5nUHJvcGVydHkoKTogVFByb3BlcnR5PHN0cmluZz4geyByZXR1cm4gdGhpcy5nZXRTdHJpbmdQcm9wZXJ0eSgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExpa2UgTm9kZS5nZXRWaXNpYmxlUHJvcGVydHksIGJ1dCBmb3IgdGhlIHRleHQgc3RyaW5nLiBOb3RlIHRoaXMgaXMgbm90IHRoZSBzYW1lIGFzIHRoZSBQcm9wZXJ0eSBwcm92aWRlZCBpblxyXG4gICAqIHNldFN0cmluZ1Byb3BlcnR5LiBUaHVzIGlzIHRoZSBuYXR1cmUgb2YgVGlueUZvcndhcmRpbmdQcm9wZXJ0eS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0U3RyaW5nUHJvcGVydHkoKTogVFByb3BlcnR5PHN0cmluZz4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N0cmluZ1Byb3BlcnR5O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2VlIGRvY3VtZW50YXRpb24gYW5kIGNvbW1lbnRzIGluIE5vZGUuaW5pdGlhbGl6ZVBoZXRpb09iamVjdFxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBpbml0aWFsaXplUGhldGlvT2JqZWN0KCBiYXNlT3B0aW9uczogUGFydGlhbDxQaGV0aW9PYmplY3RPcHRpb25zPiwgcHJvdmlkZWRPcHRpb25zOiBSaWNoVGV4dE9wdGlvbnMgKTogdm9pZCB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxSaWNoVGV4dE9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMsIFJpY2hUZXh0T3B0aW9ucz4oKSgge30sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFRyYWNrIHRoaXMsIHNvIHdlIG9ubHkgb3ZlcnJpZGUgb3VyIHN0cmluZ1Byb3BlcnR5IG9uY2UuXHJcbiAgICBjb25zdCB3YXNJbnN0cnVtZW50ZWQgPSB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCk7XHJcblxyXG4gICAgc3VwZXIuaW5pdGlhbGl6ZVBoZXRpb09iamVjdCggYmFzZU9wdGlvbnMsIG9wdGlvbnMgKTtcclxuXHJcbiAgICBpZiAoIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgJiYgIXdhc0luc3RydW1lbnRlZCAmJiB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XHJcblxyXG4gICAgICB0aGlzLl9zdHJpbmdQcm9wZXJ0eS5pbml0aWFsaXplUGhldGlvKCB0aGlzLCBSaWNoVGV4dC5TVFJJTkdfUFJPUEVSVFlfVEFOREVNX05BTUUsICgpID0+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFN0cmluZ1Byb3BlcnR5KCB0aGlzLnN0cmluZywgY29tYmluZU9wdGlvbnM8UmljaFRleHRPcHRpb25zPigge1xyXG5cclxuICAgICAgICAgIC8vIGJ5IGRlZmF1bHQsIHRleHRzIHNob3VsZCBiZSByZWFkb25seS4gRWRpdGFibGUgdGV4dHMgbW9zdCBsaWtlbHkgcGFzcyBpbiBlZGl0YWJsZSBQcm9wZXJ0aWVzIGZyb20gaTE4biBtb2RlbCBQcm9wZXJ0aWVzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE0NDNcclxuICAgICAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICAgICAgdGFuZGVtOiB0aGlzLnRhbmRlbS5jcmVhdGVUYW5kZW0oIFJpY2hUZXh0LlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSApLFxyXG4gICAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1Byb3BlcnR5IGZvciB0aGUgZGlzcGxheWVkIHRleHQnXHJcbiAgICAgICAgfSwgb3B0aW9ucy5zdHJpbmdQcm9wZXJ0eU9wdGlvbnMgKSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGVuIGNhbGxlZCwgd2lsbCByZWJ1aWxkIHRoZSBub2RlIHN0cnVjdHVyZSBmb3IgdGhpcyBSaWNoVGV4dFxyXG4gICAqL1xyXG4gIHByaXZhdGUgcmVidWlsZFJpY2hUZXh0KCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGNsZWFuQXJyYXkoIHVzZWRMaW5rcyApO1xyXG4gICAgYXNzZXJ0ICYmIGNsZWFuQXJyYXkoIHVzZWROb2RlcyApO1xyXG5cclxuICAgIHRoaXMuZnJlZUNoaWxkcmVuVG9Qb29sKCk7XHJcblxyXG4gICAgLy8gQmFpbCBlYXJseSwgcGFydGljdWxhcmx5IGlmIHdlIGFyZSBiZWluZyBjb25zdHJ1Y3RlZC5cclxuICAgIGlmICggdGhpcy5zdHJpbmcgPT09ICcnICkge1xyXG4gICAgICB0aGlzLmFwcGVuZEVtcHR5TGVhZigpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0ICYmIHNjZW5lcnlMb2cuUmljaFRleHQoIGBSaWNoVGV4dCMke3RoaXMuaWR9IHJlYnVpbGRgICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUmljaFRleHQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgLy8gVHVybiBiaWRpcmVjdGlvbmFsIG1hcmtzIGludG8gZXhwbGljaXQgZWxlbWVudHMsIHNvIHRoYXQgdGhlIG5lc3RpbmcgaXMgYXBwbGllZCBjb3JyZWN0bHkuXHJcbiAgICBsZXQgbWFwcGVkVGV4dCA9IHRoaXMuc3RyaW5nLnJlcGxhY2UoIC9cXHUyMDJhL2csICc8c3BhbiBkaXI9XCJsdHJcIj4nIClcclxuICAgICAgLnJlcGxhY2UoIC9cXHUyMDJiL2csICc8c3BhbiBkaXI9XCJydGxcIj4nIClcclxuICAgICAgLnJlcGxhY2UoIC9cXHUyMDJjL2csICc8L3NwYW4+JyApO1xyXG5cclxuICAgIC8vIE9wdGlvbmFsIHJlcGxhY2VtZW50IG9mIG5ld2xpbmVzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1NDJcclxuICAgIGlmICggdGhpcy5fcmVwbGFjZU5ld2xpbmVzICkge1xyXG4gICAgICBtYXBwZWRUZXh0ID0gbWFwcGVkVGV4dC5yZXBsYWNlKCAvXFxuL2csICc8YnI+JyApO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCByb290RWxlbWVudHM6IEhpbWFsYXlhTm9kZVtdO1xyXG5cclxuICAgIC8vIFN0YXJ0IGFwcGVuZGluZyBhbGwgdG9wLWxldmVsIGVsZW1lbnRzXHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gU2luY2UgaGltYWxheWEgaXNuJ3QgaW4gdHNjb25maWdcclxuICAgICAgcm9vdEVsZW1lbnRzID0gaGltYWxheWEucGFyc2UoIG1hcHBlZFRleHQgKTtcclxuICAgIH1cclxuICAgIGNhdGNoKCBlICkge1xyXG4gICAgICAvLyBJZiB3ZSBlcnJvciBvdXQsIGRvbid0IGtpbGwgdGhlIHNpbS4gSW5zdGVhZCwgcmVwbGFjZSB0aGUgc3RyaW5nIHdpdGggc29tZXRoaW5nIHRoYXQgbG9va3Mgb2J2aW91c2x5IGxpa2UgYW5cclxuICAgICAgLy8gZXJyb3IuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTM2MSAod2UgZG9uJ3Qgd2FudCB0cmFuc2xhdGlvbnMgdG8gZXJyb3Igb3V0IG91clxyXG4gICAgICAvLyBidWlsZCBwcm9jZXNzKS5cclxuXHJcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBTaW5jZSBoaW1hbGF5YSBpc24ndCBpbiB0c2NvbmZpZ1xyXG4gICAgICByb290RWxlbWVudHMgPSBoaW1hbGF5YS5wYXJzZSggJ0lOVkFMSUQgVFJBTlNMQVRJT04nICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2xlYXIgb3V0IGxpbmsgaXRlbXMsIGFzIHdlJ2xsIG5lZWQgdG8gcmVjb25zdHJ1Y3QgdGhlbSBsYXRlclxyXG4gICAgdGhpcy5fbGlua0l0ZW1zLmxlbmd0aCA9IDA7XHJcblxyXG4gICAgY29uc3Qgd2lkdGhBdmFpbGFibGUgPSB0aGlzLl9saW5lV3JhcCA9PT0gbnVsbCA/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA6IHRoaXMuX2xpbmVXcmFwO1xyXG4gICAgY29uc3QgaXNSb290TFRSID0gdHJ1ZTtcclxuXHJcbiAgICBsZXQgY3VycmVudExpbmUgPSBSaWNoVGV4dEVsZW1lbnQucG9vbC5jcmVhdGUoIGlzUm9vdExUUiApO1xyXG4gICAgdGhpcy5faGFzQWRkZWRMZWFmVG9MaW5lID0gZmFsc2U7IC8vIG5vdGlmeSB0aGF0IGlmIG5vdGhpbmcgaGFzIGJlZW4gYWRkZWQsIHRoZSBmaXJzdCBsZWFmIGFsd2F5cyBnZXRzIGFkZGVkLlxyXG5cclxuICAgIC8vIEhpbWFsYXlhIGNhbiBnaXZlIHVzIG11bHRpcGxlIHRvcC1sZXZlbCBpdGVtcywgc28gd2UgbmVlZCB0byBpdGVyYXRlIG92ZXIgdGhvc2VcclxuICAgIHdoaWxlICggcm9vdEVsZW1lbnRzLmxlbmd0aCApIHtcclxuICAgICAgY29uc3QgZWxlbWVudCA9IHJvb3RFbGVtZW50c1sgMCBdO1xyXG5cclxuICAgICAgLy8gSG93IGxvbmcgb3VyIGN1cnJlbnQgbGluZSBpcyBhbHJlYWR5XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRMaW5lV2lkdGggPSBjdXJyZW50TGluZS5ib3VuZHMuaXNWYWxpZCgpID8gY3VycmVudExpbmUud2lkdGggOiAwO1xyXG5cclxuICAgICAgLy8gQWRkIHRoZSBlbGVtZW50IGluXHJcbiAgICAgIGNvbnN0IGxpbmVCcmVha1N0YXRlID0gdGhpcy5hcHBlbmRFbGVtZW50KCBjdXJyZW50TGluZSwgZWxlbWVudCwgdGhpcy5fZm9udCwgdGhpcy5fZmlsbCwgaXNSb290TFRSLCB3aWR0aEF2YWlsYWJsZSAtIGN1cnJlbnRMaW5lV2lkdGggKTtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0ICYmIHNjZW5lcnlMb2cuUmljaFRleHQoIGBsaW5lQnJlYWtTdGF0ZTogJHtsaW5lQnJlYWtTdGF0ZX1gICk7XHJcblxyXG4gICAgICAvLyBJZiB0aGVyZSB3YXMgYSBsaW5lIGJyZWFrICh3ZSdsbCBuZWVkIHRvIHN3YXAgdG8gYSBuZXcgbGluZSBub2RlKVxyXG4gICAgICBpZiAoIGxpbmVCcmVha1N0YXRlICE9PSBMaW5lQnJlYWtTdGF0ZS5OT05FICkge1xyXG4gICAgICAgIC8vIEFkZCB0aGUgbGluZSBpZiBpdCB3b3Jrc1xyXG4gICAgICAgIGlmICggY3VycmVudExpbmUuYm91bmRzLmlzVmFsaWQoKSApIHtcclxuICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5SaWNoVGV4dCAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0KCAnQWRkaW5nIGxpbmUgZHVlIHRvIGxpbmVCcmVhaycgKTtcclxuICAgICAgICAgIHRoaXMuYXBwZW5kTGluZSggY3VycmVudExpbmUgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gT3RoZXJ3aXNlIGlmIGl0J3MgYSBibGFuayBsaW5lLCBhZGQgaW4gYSBzdHJ1dCAoPGJyPjxicj4gc2hvdWxkIHJlc3VsdCBpbiBhIGJsYW5rIGxpbmUpXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmFwcGVuZExpbmUoIFJpY2hUZXh0VmVydGljYWxTcGFjZXIucG9vbC5jcmVhdGUoIFJpY2hUZXh0VXRpbHMuc2NyYXRjaFRleHQuc2V0U3RyaW5nKCAnWCcgKS5zZXRGb250KCB0aGlzLl9mb250ICkuaGVpZ2h0ICkgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNldCB1cCBhIG5ldyBsaW5lXHJcbiAgICAgICAgY3VycmVudExpbmUgPSBSaWNoVGV4dEVsZW1lbnQucG9vbC5jcmVhdGUoIGlzUm9vdExUUiApO1xyXG4gICAgICAgIHRoaXMuX2hhc0FkZGVkTGVhZlRvTGluZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBJZiBpdCdzIENPTVBMRVRFIG9yIE5PTkUsIHRoZW4gd2UgZnVsbHkgcHJvY2Vzc2VkIHRoZSBsaW5lXHJcbiAgICAgIGlmICggbGluZUJyZWFrU3RhdGUgIT09IExpbmVCcmVha1N0YXRlLklOQ09NUExFVEUgKSB7XHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0ICYmIHNjZW5lcnlMb2cuUmljaFRleHQoICdGaW5pc2hlZCByb290IGVsZW1lbnQnICk7XHJcbiAgICAgICAgcm9vdEVsZW1lbnRzLnNwbGljZSggMCwgMSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gT25seSBhZGQgdGhlIGZpbmFsIGxpbmUgaWYgaXQncyB2YWxpZCAod2UgZG9uJ3Qgd2FudCB0byBhZGQgdW5uZWNlc3NhcnkgcGFkZGluZyBhdCB0aGUgYm90dG9tKVxyXG4gICAgaWYgKCBjdXJyZW50TGluZS5ib3VuZHMuaXNWYWxpZCgpICkge1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUmljaFRleHQgJiYgc2NlbmVyeUxvZy5SaWNoVGV4dCggJ0FkZGluZyBmaW5hbCBsaW5lJyApO1xyXG4gICAgICB0aGlzLmFwcGVuZExpbmUoIGN1cnJlbnRMaW5lICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgd2UgcmVhY2hlZCBoZXJlIGFuZCBoYXZlIG5vIGNoaWxkcmVuLCB3ZSBwcm9iYWJseSByYW4gaW50byBhIGRlZ2VuZXJhdGUgXCJubyBsYXlvdXRcIiBjYXNlIGxpa2UgYCcgJ2AuIEFkZCBpblxyXG4gICAgLy8gdGhlIGVtcHR5IGxlYWYuXHJcbiAgICBpZiAoIHRoaXMubGluZUNvbnRhaW5lci5nZXRDaGlsZHJlbkNvdW50KCkgPT09IDAgKSB7XHJcbiAgICAgIHRoaXMuYXBwZW5kRW1wdHlMZWFmKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWxsIGxpbmVzIGFyZSBjb25zdHJ1Y3RlZCwgc28gd2UgY2FuIGFsaWduIHRoZW0gbm93XHJcbiAgICB0aGlzLmFsaWduTGluZXMoKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgcmVncm91cGluZyBvZiBsaW5rcyAoc28gdGhhdCBhbGwgZnJhZ21lbnRzIG9mIGEgbGluayBhY3Jvc3MgbXVsdGlwbGUgbGluZXMgYXJlIGNvbnRhaW5lZCB1bmRlciBhIHNpbmdsZVxyXG4gICAgLy8gYW5jZXN0b3IgdGhhdCBoYXMgbGlzdGVuZXJzIGFuZCBhMTF5KVxyXG4gICAgd2hpbGUgKCB0aGlzLl9saW5rSXRlbXMubGVuZ3RoICkge1xyXG4gICAgICAvLyBDbG9zZSBvdmVyIHRoZSBocmVmIGFuZCBvdGhlciByZWZlcmVuY2VzXHJcbiAgICAgICggKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGxpbmtFbGVtZW50ID0gdGhpcy5fbGlua0l0ZW1zWyAwIF0uZWxlbWVudDtcclxuICAgICAgICBjb25zdCBocmVmID0gdGhpcy5fbGlua0l0ZW1zWyAwIF0uaHJlZjtcclxuICAgICAgICBsZXQgaTtcclxuXHJcbiAgICAgICAgLy8gRmluZCBhbGwgbm9kZXMgdGhhdCBhcmUgZm9yIHRoZSBzYW1lIGxpbmtcclxuICAgICAgICBjb25zdCBub2RlcyA9IFtdO1xyXG4gICAgICAgIGZvciAoIGkgPSB0aGlzLl9saW5rSXRlbXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5fbGlua0l0ZW1zWyBpIF07XHJcbiAgICAgICAgICBpZiAoIGl0ZW0uZWxlbWVudCA9PT0gbGlua0VsZW1lbnQgKSB7XHJcbiAgICAgICAgICAgIG5vZGVzLnB1c2goIGl0ZW0ubm9kZSApO1xyXG4gICAgICAgICAgICB0aGlzLl9saW5rSXRlbXMuc3BsaWNlKCBpLCAxICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBsaW5rUm9vdE5vZGUgPSBSaWNoVGV4dExpbmsucG9vbC5jcmVhdGUoIGxpbmtFbGVtZW50LmlubmVyQ29udGVudCwgaHJlZiApO1xyXG4gICAgICAgIHRoaXMubGluZUNvbnRhaW5lci5hZGRDaGlsZCggbGlua1Jvb3ROb2RlICk7XHJcblxyXG4gICAgICAgIC8vIERldGFjaCB0aGUgbm9kZSBmcm9tIGl0cyBsb2NhdGlvbiwgYWRqdXN0IGl0cyB0cmFuc2Zvcm0sIGFuZCByZWF0dGFjaCB1bmRlciB0aGUgbGluay4gVGhpcyBzaG91bGQga2VlcCBlYWNoXHJcbiAgICAgICAgLy8gZnJhZ21lbnQgaW4gdGhlIHNhbWUgcGxhY2UsIGJ1dCBjaGFuZ2VzIGl0cyBwYXJlbnQuXHJcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1sgaSBdO1xyXG4gICAgICAgICAgY29uc3QgbWF0cml4ID0gbm9kZS5nZXRVbmlxdWVUcmFpbFRvKCB0aGlzLmxpbmVDb250YWluZXIgKS5nZXRNYXRyaXgoKTtcclxuICAgICAgICAgIG5vZGUuZGV0YWNoKCk7XHJcbiAgICAgICAgICBub2RlLm1hdHJpeCA9IG1hdHJpeDtcclxuICAgICAgICAgIGxpbmtSb290Tm9kZS5hZGRDaGlsZCggbm9kZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2xlYXIgdGhlbSBvdXQgYWZ0ZXJ3YXJkcywgZm9yIG1lbW9yeSBwdXJwb3Nlc1xyXG4gICAgdGhpcy5fbGlua0l0ZW1zLmxlbmd0aCA9IDA7XHJcblxyXG4gICAgaWYgKCBhc3NlcnQgKSB7XHJcbiAgICAgIGlmICggdGhpcy5fbGlua3MgJiYgdGhpcy5fbGlua3MgIT09IHRydWUgKSB7XHJcbiAgICAgICAgT2JqZWN0LmtleXMoIHRoaXMuX2xpbmtzICkuZm9yRWFjaCggbGluayA9PiB7XHJcbiAgICAgICAgICBhc3NlcnQgJiYgYWxsb3dMaW5rc1Byb3BlcnR5LnZhbHVlICYmIGFzc2VydCggdXNlZExpbmtzLmluY2x1ZGVzKCBsaW5rICksIGBVbnVzZWQgUmljaFRleHQgbGluazogJHtsaW5rfWAgKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCB0aGlzLl9ub2RlcyApIHtcclxuICAgICAgICBPYmplY3Qua2V5cyggdGhpcy5fbm9kZXMgKS5mb3JFYWNoKCBub2RlID0+IHtcclxuICAgICAgICAgIGFzc2VydCAmJiBhbGxvd0xpbmtzUHJvcGVydHkudmFsdWUgJiYgYXNzZXJ0KCB1c2VkTm9kZXMuaW5jbHVkZXMoIG5vZGUgKSwgYFVudXNlZCBSaWNoVGV4dCBub2RlOiAke25vZGV9YCApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5SaWNoVGV4dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYW5zIFwicmVjdXJzaXZlbHkgdGVtcG9yYXJ5IGRpc3Bvc2VzXCIgdGhlIGNoaWxkcmVuLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZnJlZUNoaWxkcmVuVG9Qb29sKCk6IHZvaWQge1xyXG4gICAgLy8gQ2xlYXIgYW55IGV4aXN0aW5nIGxpbmVzIG9yIGxpbmsgZnJhZ21lbnRzIChoaWdoZXIgcGVyZm9ybWFuY2UsIGFuZCByZXR1cm4gdGhlbSB0byBwb29scyBhbHNvKVxyXG4gICAgd2hpbGUgKCB0aGlzLmxpbmVDb250YWluZXIuX2NoaWxkcmVuLmxlbmd0aCApIHtcclxuICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLmxpbmVDb250YWluZXIuX2NoaWxkcmVuWyB0aGlzLmxpbmVDb250YWluZXIuX2NoaWxkcmVuLmxlbmd0aCAtIDEgXSBhcyBSaWNoVGV4dENsZWFuYWJsZU5vZGU7XHJcbiAgICAgIHRoaXMubGluZUNvbnRhaW5lci5yZW1vdmVDaGlsZCggY2hpbGQgKTtcclxuXHJcbiAgICAgIGNoaWxkLmNsZWFuKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5mcmVlQ2hpbGRyZW5Ub1Bvb2woKTtcclxuXHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcblxyXG4gICAgdGhpcy5fc3RyaW5nUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXBwZW5kcyBhIGZpbmlzaGVkIGxpbmUsIGFwcGx5aW5nIGFueSBuZWNlc3NhcnkgbGVhZGluZy5cclxuICAgKi9cclxuICBwcml2YXRlIGFwcGVuZExpbmUoIGxpbmVOb2RlOiBSaWNoVGV4dEVsZW1lbnQgfCBOb2RlICk6IHZvaWQge1xyXG4gICAgLy8gQXBwbHkgbGVhZGluZ1xyXG4gICAgaWYgKCB0aGlzLmxpbmVDb250YWluZXIuYm91bmRzLmlzVmFsaWQoKSApIHtcclxuICAgICAgbGluZU5vZGUudG9wID0gdGhpcy5saW5lQ29udGFpbmVyLmJvdHRvbSArIHRoaXMuX2xlYWRpbmc7XHJcblxyXG4gICAgICAvLyBUaGlzIGVuc3VyZXMgUlRMIGxpbmVzIHdpbGwgc3RpbGwgYmUgbGFpZCBvdXQgcHJvcGVybHkgd2l0aCB0aGUgbWFpbiBvcmlnaW4gKGhhbmRsZWQgYnkgYWxpZ25MaW5lcyBsYXRlcilcclxuICAgICAgbGluZU5vZGUubGVmdCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5saW5lQ29udGFpbmVyLmFkZENoaWxkKCBsaW5lTm9kZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSWYgd2UgZW5kIHVwIHdpdGggdGhlIGVxdWl2YWxlbnQgb2YgXCJub1wiIGNvbnRlbnQsIHRvc3MgaW4gYSBiYXNpY2FsbHkgZW1wdHkgbGVhZiBzbyB0aGF0IHdlIGdldCB2YWxpZCBib3VuZHNcclxuICAgKiAoMCB3aWR0aCwgY29ycmVjdGx5LXBvc2l0aW9uZWQgaGVpZ2h0KS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy83NjkuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhcHBlbmRFbXB0eUxlYWYoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmxpbmVDb250YWluZXIuZ2V0Q2hpbGRyZW5Db3VudCgpID09PSAwICk7XHJcblxyXG4gICAgdGhpcy5hcHBlbmRMaW5lKCBSaWNoVGV4dExlYWYucG9vbC5jcmVhdGUoICcnLCB0cnVlLCB0aGlzLl9mb250LCB0aGlzLl9ib3VuZHNNZXRob2QsIHRoaXMuX2ZpbGwsIHRoaXMuX3N0cm9rZSwgdGhpcy5fbGluZVdpZHRoICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFsaWducyBhbGwgbGluZXMgYXR0YWNoZWQgdG8gdGhlIGxpbmVDb250YWluZXIuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhbGlnbkxpbmVzKCk6IHZvaWQge1xyXG4gICAgLy8gQWxsIG5vZGVzIHdpbGwgZWl0aGVyIHNoYXJlIGEgJ2xlZnQnLCAnY2VudGVyWCcgb3IgJ3JpZ2h0Jy5cclxuICAgIGNvbnN0IGNvb3JkaW5hdGVOYW1lID0gdGhpcy5fYWxpZ24gPT09ICdjZW50ZXInID8gJ2NlbnRlclgnIDogdGhpcy5fYWxpZ247XHJcblxyXG4gICAgY29uc3QgaWRlYWwgPSB0aGlzLmxpbmVDb250YWluZXJbIGNvb3JkaW5hdGVOYW1lIF07XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxpbmVDb250YWluZXIuZ2V0Q2hpbGRyZW5Db3VudCgpOyBpKysgKSB7XHJcbiAgICAgIHRoaXMubGluZUNvbnRhaW5lci5nZXRDaGlsZEF0KCBpIClbIGNvb3JkaW5hdGVOYW1lIF0gPSBpZGVhbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1haW4gcmVjdXJzaXZlIGZ1bmN0aW9uIGZvciBjb25zdHJ1Y3RpbmcgdGhlIFJpY2hUZXh0IE5vZGUgdHJlZS5cclxuICAgKlxyXG4gICAqIFdlJ2xsIGFkZCBhbnkgcmVsZXZhbnQgY29udGVudCB0byB0aGUgY29udGFpbmVyTm9kZS4gVGhlIGVsZW1lbnQgd2lsbCBiZSBtdXRhdGVkIGFzIHRoaW5ncyBhcmUgYWRkZWQsIHNvIHRoYXRcclxuICAgKiB3aGVuZXZlciBjb250ZW50IGlzIGFkZGVkIHRvIHRoZSBOb2RlIHRyZWUgaXQgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIGVsZW1lbnQgdHJlZS4gVGhpcyBtZWFucyB3ZSBjYW4gcGF1c2VcclxuICAgKiB3aGVuZXZlciAoZS5nLiB3aGVuIGEgbGluZS1icmVhayBpcyBlbmNvdW50ZXJlZCkgYW5kIHRoZSByZXN0IHdpbGwgYmUgcmVhZHkgZm9yIHBhcnNpbmcgdGhlIG5leHQgbGluZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBjb250YWluZXJOb2RlIC0gVGhlIG5vZGUgd2hlcmUgY2hpbGQgZWxlbWVudHMgc2hvdWxkIGJlIHBsYWNlZFxyXG4gICAqIEBwYXJhbSBlbGVtZW50IC0gU2VlIEhpbWFsYXlhJ3MgZWxlbWVudCBzcGVjaWZpY2F0aW9uXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgKGh0dHBzOi8vZ2l0aHViLmNvbS9hbmRyZWpld3NraS9oaW1hbGF5YS9ibG9iL21hc3Rlci90ZXh0L2FzdC1zcGVjLXYwLm1kKVxyXG4gICAqIEBwYXJhbSBmb250IC0gVGhlIGZvbnQgdG8gYXBwbHkgYXQgdGhpcyBsZXZlbFxyXG4gICAqIEBwYXJhbSBmaWxsIC0gRmlsbCB0byBhcHBseVxyXG4gICAqIEBwYXJhbSBpc0xUUiAtIFRydWUgaWYgTFRSLCBmYWxzZSBpZiBSVEwgKGhhbmRsZXMgUlRMIHN0cmluZ3MgcHJvcGVybHkpXHJcbiAgICogQHBhcmFtIHdpZHRoQXZhaWxhYmxlIC0gSG93IG11Y2ggd2lkdGggd2UgaGF2ZSBhdmFpbGFibGUgYmVmb3JlIGZvcmNpbmcgYSBsaW5lIGJyZWFrIChmb3IgbGluZVdyYXApXHJcbiAgICogQHJldHVybnMgLSBXaGV0aGVyIGEgbGluZSBicmVhayB3YXMgcmVhY2hlZFxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXBwZW5kRWxlbWVudCggY29udGFpbmVyTm9kZTogUmljaFRleHRFbGVtZW50LCBlbGVtZW50OiBIaW1hbGF5YU5vZGUsIGZvbnQ6IEZvbnQgfCBzdHJpbmcsIGZpbGw6IFRQYWludCwgaXNMVFI6IGJvb2xlYW4sIHdpZHRoQXZhaWxhYmxlOiBudW1iZXIgKTogc3RyaW5nIHtcclxuICAgIGxldCBsaW5lQnJlYWtTdGF0ZSA9IExpbmVCcmVha1N0YXRlLk5PTkU7XHJcblxyXG4gICAgLy8gVGhlIG1haW4gTm9kZSBmb3IgdGhlIGVsZW1lbnQgdGhhdCB3ZSBhcmUgYWRkaW5nXHJcbiAgICBsZXQgbm9kZSE6IFJpY2hUZXh0TGVhZiB8IFJpY2hUZXh0Tm9kZSB8IFJpY2hUZXh0RWxlbWVudDtcclxuXHJcbiAgICAvLyBJZiB0aGlzIGNvbnRlbnQgZ2V0cyBhZGRlZCwgaXQgd2lsbCBuZWVkIHRvIGJlIHB1c2hlZCBvdmVyIGJ5IHRoaXMgYW1vdW50XHJcbiAgICBjb25zdCBjb250YWluZXJTcGFjaW5nID0gaXNMVFIgPyBjb250YWluZXJOb2RlLnJpZ2h0U3BhY2luZyA6IGNvbnRhaW5lck5vZGUubGVmdFNwYWNpbmc7XHJcblxyXG4gICAgLy8gQ29udGFpbmVyIHNwYWNpbmcgY3V0cyBpbnRvIG91ciBlZmZlY3RpdmUgYXZhaWxhYmxlIHdpZHRoXHJcbiAgICBjb25zdCB3aWR0aEF2YWlsYWJsZVdpdGhTcGFjaW5nID0gd2lkdGhBdmFpbGFibGUgLSBjb250YWluZXJTcGFjaW5nO1xyXG5cclxuICAgIC8vIElmIHdlJ3JlIGEgbGVhZlxyXG4gICAgaWYgKCBpc0hpbWFsYXlhVGV4dE5vZGUoIGVsZW1lbnQgKSApIHtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0ICYmIHNjZW5lcnlMb2cuUmljaFRleHQoIGBhcHBlbmRpbmcgbGVhZjogJHtlbGVtZW50LmNvbnRlbnR9YCApO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUmljaFRleHQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgICBub2RlID0gUmljaFRleHRMZWFmLnBvb2wuY3JlYXRlKCBlbGVtZW50LmNvbnRlbnQsIGlzTFRSLCBmb250LCB0aGlzLl9ib3VuZHNNZXRob2QsIGZpbGwsIHRoaXMuX3N0cm9rZSwgdGhpcy5fbGluZVdpZHRoICk7XHJcblxyXG4gICAgICAvLyBIYW5kbGUgd3JhcHBpbmcgaWYgcmVxdWlyZWQuIENvbnRhaW5lciBzcGFjaW5nIGN1dHMgaW50byBvdXIgYXZhaWxhYmxlIHdpZHRoXHJcbiAgICAgIGlmICggIW5vZGUuZml0c0luKCB3aWR0aEF2YWlsYWJsZVdpdGhTcGFjaW5nLCB0aGlzLl9oYXNBZGRlZExlYWZUb0xpbmUsIGlzTFRSICkgKSB7XHJcbiAgICAgICAgLy8gRGlkbid0IGZpdCwgbGV0cyBicmVhayBpbnRvIHdvcmRzIHRvIHNlZSB3aGF0IHdlIGNhbiBmaXQuIFdlJ2xsIGNyZWF0ZSByYW5nZXMgZm9yIGFsbCB0aGUgaW5kaXZpZHVhbFxyXG4gICAgICAgIC8vIGVsZW1lbnRzIHdlIGNvdWxkIHNwbGl0IHRoZSBsaW5lcyBpbnRvLiBJZiB3ZSBzcGxpdCBpbnRvIGRpZmZlcmVudCBsaW5lcywgd2UgY2FuIGlnbm9yZSB0aGUgY2hhcmFjdGVyc1xyXG4gICAgICAgIC8vIGluLWJldHdlZW4sIGhvd2V2ZXIgaWYgbm90LCB3ZSBuZWVkIHRvIGluY2x1ZGUgdGhlbS5cclxuICAgICAgICBjb25zdCByYW5nZXMgPSBnZXRMaW5lQnJlYWtSYW5nZXMoIGVsZW1lbnQuY29udGVudCApO1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IGEgZ3JvdXAgb2YgcmFuZ2VzIGludG8gYSBzdHJpbmcgKGdyYWIgdGhlIGNvbnRlbnQgZnJvbSB0aGUgc3RyaW5nKS5cclxuICAgICAgICBjb25zdCByYW5nZXNUb1N0cmluZyA9ICggcmFuZ2VzOiBSYW5nZVtdICk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgICBpZiAoIHJhbmdlcy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5jb250ZW50LnNsaWNlKCByYW5nZXNbIDAgXS5taW4sIHJhbmdlc1sgcmFuZ2VzLmxlbmd0aCAtIDEgXS5tYXggKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUmljaFRleHQgJiYgc2NlbmVyeUxvZy5SaWNoVGV4dCggYE92ZXJmbG93IGxlYWZBZGRlZDoke3RoaXMuX2hhc0FkZGVkTGVhZlRvTGluZX0sIHdvcmRzOiAke3Jhbmdlcy5sZW5ndGh9YCApO1xyXG5cclxuICAgICAgICAvLyBJZiB3ZSBuZWVkIHRvIGFkZCBzb21ldGhpbmcgKGFuZCB0aGVyZSBpcyBvbmx5IGEgc2luZ2xlIHdvcmQpLCB0aGVuIGFkZCBpdFxyXG4gICAgICAgIGlmICggdGhpcy5faGFzQWRkZWRMZWFmVG9MaW5lIHx8IHJhbmdlcy5sZW5ndGggPiAxICkge1xyXG4gICAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0ICYmIHNjZW5lcnlMb2cuUmljaFRleHQoICdTa2lwcGluZyB3b3JkcycgKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBza2lwcGVkUmFuZ2VzOiBSYW5nZVtdID0gW107XHJcbiAgICAgICAgICBsZXQgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgICAgc2tpcHBlZFJhbmdlcy51bnNoaWZ0KCByYW5nZXMucG9wKCkhICk7IC8vIFdlIGRpZG4ndCBmaXQgd2l0aCB0aGUgbGFzdCBvbmUhXHJcblxyXG4gICAgICAgICAgLy8gS2VlcCBzaG9ydGVuaW5nIGJ5IHJlbW92aW5nIHdvcmRzIHVudGlsIGl0IGZpdHMgKG9yIGlmIHdlIE5FRUQgdG8gZml0IGl0KSBvciBpdCBkb2Vzbid0IGZpdC5cclxuICAgICAgICAgIHdoaWxlICggcmFuZ2VzLmxlbmd0aCApIHtcclxuICAgICAgICAgICAgbm9kZS5jbGVhbigpOyAvLyBXZSdyZSB0b3NzaW5nIHRoZSBvbGQgb25lLCBzbyB3ZSdsbCBmcmVlIHVwIG1lbW9yeSBmb3IgdGhlIG5ldyBvbmVcclxuICAgICAgICAgICAgbm9kZSA9IFJpY2hUZXh0TGVhZi5wb29sLmNyZWF0ZSggcmFuZ2VzVG9TdHJpbmcoIHJhbmdlcyApLCBpc0xUUiwgZm9udCwgdGhpcy5fYm91bmRzTWV0aG9kLCBmaWxsLCB0aGlzLl9zdHJva2UsIHRoaXMuX2xpbmVXaWR0aCApO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZW4ndCBhZGRlZCBhbnl0aGluZyB0byB0aGUgbGluZSBBTkQgd2UgYXJlIGRvd24gdG8gdGhlIGZpcnN0IHdvcmQsIHdlIG5lZWQgdG8ganVzdCBhZGQgaXQuXHJcbiAgICAgICAgICAgIGlmICggIW5vZGUuZml0c0luKCB3aWR0aEF2YWlsYWJsZVdpdGhTcGFjaW5nLCB0aGlzLl9oYXNBZGRlZExlYWZUb0xpbmUsIGlzTFRSICkgJiZcclxuICAgICAgICAgICAgICAgICAoIHRoaXMuX2hhc0FkZGVkTGVhZlRvTGluZSB8fCByYW5nZXMubGVuZ3RoID4gMSApICkge1xyXG4gICAgICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5SaWNoVGV4dCAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0KCBgU2tpcHBpbmcgd29yZCAke3Jhbmdlc1RvU3RyaW5nKCBbIHJhbmdlc1sgcmFuZ2VzLmxlbmd0aCAtIDEgXSBdICl9YCApO1xyXG4gICAgICAgICAgICAgIHNraXBwZWRSYW5nZXMudW5zaGlmdCggcmFuZ2VzLnBvcCgpISApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5SaWNoVGV4dCAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0KCBgU3VjY2VzcyB3aXRoICR7cmFuZ2VzVG9TdHJpbmcoIHJhbmdlcyApfWAgKTtcclxuICAgICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIElmIHdlIGhhdmVuJ3QgYWRkZWQgYW55dGhpbmcgeWV0IHRvIHRoaXMgbGluZSwgd2UnbGwgcGVybWl0IHRoZSBvdmVyZmxvd1xyXG4gICAgICAgICAgaWYgKCBzdWNjZXNzICkge1xyXG4gICAgICAgICAgICBsaW5lQnJlYWtTdGF0ZSA9IExpbmVCcmVha1N0YXRlLklOQ09NUExFVEU7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuY29udGVudCA9IHJhbmdlc1RvU3RyaW5nKCBza2lwcGVkUmFuZ2VzICk7XHJcbiAgICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5SaWNoVGV4dCAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0KCBgUmVtYWluaW5nIGNvbnRlbnQ6ICR7ZWxlbWVudC5jb250ZW50fWAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBXZSB3b24ndCB1c2UgdGhpcyBvbmUsIHNvIHdlJ2xsIGZyZWUgaXQgYmFjayB0byB0aGUgcG9vbFxyXG4gICAgICAgICAgICBub2RlLmNsZWFuKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gTGluZUJyZWFrU3RhdGUuSU5DT01QTEVURTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX2hhc0FkZGVkTGVhZlRvTGluZSA9IHRydWU7XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUmljaFRleHQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgIH1cclxuICAgIC8vIE90aGVyd2lzZSBwcmVzdW1hYmx5IGFuIGVsZW1lbnQgd2l0aCBjb250ZW50XHJcbiAgICBlbHNlIGlmICggaXNIaW1hbGF5YUVsZW1lbnROb2RlKCBlbGVtZW50ICkgKSB7XHJcbiAgICAgIC8vIEJhaWwgb3V0IHF1aWNrbHkgZm9yIGEgbGluZSBicmVha1xyXG4gICAgICBpZiAoIGVsZW1lbnQudGFnTmFtZSA9PT0gJ2JyJyApIHtcclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUmljaFRleHQgJiYgc2NlbmVyeUxvZy5SaWNoVGV4dCggJ21hbnVhbCBsaW5lIGJyZWFrJyApO1xyXG4gICAgICAgIHJldHVybiBMaW5lQnJlYWtTdGF0ZS5DT01QTEVURTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU3BhbiAoZGlyIGF0dHJpYnV0ZSkgLS0gd2UgbmVlZCB0aGUgTFRSL1JUTCBrbm93bGVkZ2UgYmVmb3JlIG1vc3Qgb3RoZXIgb3BlcmF0aW9uc1xyXG4gICAgICBpZiAoIGVsZW1lbnQudGFnTmFtZSA9PT0gJ3NwYW4nICkge1xyXG4gICAgICAgIGNvbnN0IGRpckF0dHJpYnV0ZVN0cmluZyA9IFJpY2hUZXh0VXRpbHMuaGltYWxheWFHZXRBdHRyaWJ1dGUoICdkaXInLCBlbGVtZW50ICk7XHJcblxyXG4gICAgICAgIGlmICggZGlyQXR0cmlidXRlU3RyaW5nICkge1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZGlyQXR0cmlidXRlU3RyaW5nID09PSAnbHRyJyB8fCBkaXJBdHRyaWJ1dGVTdHJpbmcgPT09ICdydGwnLFxyXG4gICAgICAgICAgICAnU3BhbiBkaXIgYXR0cmlidXRlcyBzaG91bGQgYmUgbHRyIG9yIHJ0bC4nICk7XHJcbiAgICAgICAgICBpc0xUUiA9IGRpckF0dHJpYnV0ZVN0cmluZyA9PT0gJ2x0cic7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBIYW5kbGUgPG5vZGU+IHRhZ3MsIHdoaWNoIHNob3VsZCBub3QgaGF2ZSBjb250ZW50XHJcbiAgICAgIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnbm9kZScgKSB7XHJcbiAgICAgICAgY29uc3QgcmVmZXJlbmNlZElkID0gUmljaFRleHRVdGlscy5oaW1hbGF5YUdldEF0dHJpYnV0ZSggJ2lkJywgZWxlbWVudCApO1xyXG4gICAgICAgIGNvbnN0IHJlZmVyZW5jZWROb2RlID0gcmVmZXJlbmNlZElkID8gKCB0aGlzLl9ub2Rlc1sgcmVmZXJlbmNlZElkIF0gfHwgbnVsbCApIDogbnVsbDtcclxuXHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcmVmZXJlbmNlZE5vZGUsXHJcbiAgICAgICAgICByZWZlcmVuY2VkSWRcclxuICAgICAgICAgID8gYENvdWxkIG5vdCBmaW5kIGEgbWF0Y2hpbmcgaXRlbSBpbiBSaWNoVGV4dCdzIG5vZGVzIGZvciAke3JlZmVyZW5jZWRJZH0uIEl0IHNob3VsZCBiZSBwcm92aWRlZCBpbiB0aGUgbm9kZXMgb3B0aW9uYFxyXG4gICAgICAgICAgOiAnTm8gaWQgYXR0cmlidXRlIHByb3ZpZGVkIGZvciBhIGdpdmVuIDxub2RlPiBlbGVtZW50JyApO1xyXG4gICAgICAgIGlmICggcmVmZXJlbmNlZE5vZGUgKSB7XHJcbiAgICAgICAgICBhc3NlcnQgJiYgdXNlZE5vZGVzLnB1c2goIHJlZmVyZW5jZWRJZCEgKTtcclxuICAgICAgICAgIG5vZGUgPSBSaWNoVGV4dE5vZGUucG9vbC5jcmVhdGUoIHJlZmVyZW5jZWROb2RlICk7XHJcblxyXG4gICAgICAgICAgaWYgKCB0aGlzLl9oYXNBZGRlZExlYWZUb0xpbmUgJiYgIW5vZGUuZml0c0luKCB3aWR0aEF2YWlsYWJsZVdpdGhTcGFjaW5nICkgKSB7XHJcbiAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGZpdCwgd2UnbGwgdG9zcyB0aGlzIG5vZGUgdG8gdGhlIHBvb2wgYW5kIGNyZWF0ZSBpdCBvbiB0aGUgbmV4dCBsaW5lXHJcbiAgICAgICAgICAgIG5vZGUuY2xlYW4oKTtcclxuICAgICAgICAgICAgcmV0dXJuIExpbmVCcmVha1N0YXRlLklOQ09NUExFVEU7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29uc3Qgbm9kZUFsaWduID0gUmljaFRleHRVdGlscy5oaW1hbGF5YUdldEF0dHJpYnV0ZSggJ2FsaWduJywgZWxlbWVudCApO1xyXG4gICAgICAgICAgaWYgKCBub2RlQWxpZ24gPT09ICdjZW50ZXInIHx8IG5vZGVBbGlnbiA9PT0gJ3RvcCcgfHwgbm9kZUFsaWduID09PSAnYm90dG9tJyApIHtcclxuICAgICAgICAgICAgY29uc3QgdGV4dEJvdW5kcyA9IFJpY2hUZXh0VXRpbHMuc2NyYXRjaFRleHQuc2V0U3RyaW5nKCAnVGVzdCcgKS5zZXRGb250KCBmb250ICkuYm91bmRzO1xyXG4gICAgICAgICAgICBpZiAoIG5vZGVBbGlnbiA9PT0gJ2NlbnRlcicgKSB7XHJcbiAgICAgICAgICAgICAgbm9kZS5jZW50ZXJZID0gdGV4dEJvdW5kcy5jZW50ZXJZO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCBub2RlQWxpZ24gPT09ICd0b3AnICkge1xyXG4gICAgICAgICAgICAgIG5vZGUudG9wID0gdGV4dEJvdW5kcy50b3A7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIG5vZGVBbGlnbiA9PT0gJ2JvdHRvbScgKSB7XHJcbiAgICAgICAgICAgICAgbm9kZS5ib3R0b20gPSB0ZXh0Qm91bmRzLmJvdHRvbTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIG5vZGUgaW4gb3VyIG1hcCwgd2UnbGwganVzdCBza2lwIGl0XHJcbiAgICAgICAgICByZXR1cm4gbGluZUJyZWFrU3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9oYXNBZGRlZExlYWZUb0xpbmUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIElmIG5vdCBhIDxub2RlPiB0YWdcclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgbm9kZSA9IFJpY2hUZXh0RWxlbWVudC5wb29sLmNyZWF0ZSggaXNMVFIgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0ICYmIHNjZW5lcnlMb2cuUmljaFRleHQoICdhcHBlbmRpbmcgZWxlbWVudCcgKTtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgICAgY29uc3Qgc3R5bGVBdHRyaWJ1dGVTdHJpbmcgPSBSaWNoVGV4dFV0aWxzLmhpbWFsYXlhR2V0QXR0cmlidXRlKCAnc3R5bGUnLCBlbGVtZW50ICk7XHJcblxyXG4gICAgICBpZiAoIHN0eWxlQXR0cmlidXRlU3RyaW5nICkge1xyXG4gICAgICAgIGNvbnN0IGNzcyA9IFJpY2hUZXh0VXRpbHMuaGltYWxheWFTdHlsZVN0cmluZ1RvTWFwKCBzdHlsZUF0dHJpYnV0ZVN0cmluZyApO1xyXG4gICAgICAgIGFzc2VydCAmJiBPYmplY3Qua2V5cyggY3NzICkuZm9yRWFjaCgga2V5ID0+IHtcclxuICAgICAgICAgIGFzc2VydCEoIF8uaW5jbHVkZXMoIFNUWUxFX0tFWVMsIGtleSApLCAnU2VlIHN1cHBvcnRlZCBzdHlsZSBDU1Mga2V5cycgKTtcclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIC8vIEZpbGxcclxuICAgICAgICBpZiAoIGNzcy5jb2xvciApIHtcclxuICAgICAgICAgIGZpbGwgPSBuZXcgQ29sb3IoIGNzcy5jb2xvciApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRm9udFxyXG4gICAgICAgIGNvbnN0IGZvbnRPcHRpb25zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgRk9OVF9TVFlMRV9LRVlTLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgY29uc3Qgc3R5bGVLZXkgPSBGT05UX1NUWUxFX0tFWVNbIGkgXTtcclxuICAgICAgICAgIGlmICggY3NzWyBzdHlsZUtleSBdICkge1xyXG4gICAgICAgICAgICBmb250T3B0aW9uc1sgRk9OVF9TVFlMRV9NQVBbIHN0eWxlS2V5IF0gXSA9IGNzc1sgc3R5bGVLZXkgXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZm9udCA9ICggdHlwZW9mIGZvbnQgPT09ICdzdHJpbmcnID8gRm9udC5mcm9tQ1NTKCBmb250ICkgOiBmb250ICkuY29weSggZm9udE9wdGlvbnMgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQW5jaG9yIChsaW5rKVxyXG4gICAgICBpZiAoIGVsZW1lbnQudGFnTmFtZSA9PT0gJ2EnICkge1xyXG4gICAgICAgIGxldCBocmVmOiBSaWNoVGV4dEhyZWYgfCBudWxsID0gUmljaFRleHRVdGlscy5oaW1hbGF5YUdldEF0dHJpYnV0ZSggJ2hyZWYnLCBlbGVtZW50ICk7XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxIcmVmID0gaHJlZjtcclxuXHJcbiAgICAgICAgLy8gVHJ5IGV4dHJhY3RpbmcgdGhlIGhyZWYgZnJvbSB0aGUgbGlua3Mgb2JqZWN0XHJcbiAgICAgICAgaWYgKCBocmVmICE9PSBudWxsICYmIHRoaXMuX2xpbmtzICE9PSB0cnVlICkge1xyXG4gICAgICAgICAgaWYgKCBocmVmLnN0YXJ0c1dpdGgoICd7eycgKSAmJiBocmVmLmluZGV4T2YoICd9fScgKSA9PT0gaHJlZi5sZW5ndGggLSAyICkge1xyXG4gICAgICAgICAgICBjb25zdCBsaW5rTmFtZSA9IGhyZWYuc2xpY2UoIDIsIC0yICk7XHJcbiAgICAgICAgICAgIGhyZWYgPSB0aGlzLl9saW5rc1sgbGlua05hbWUgXTtcclxuICAgICAgICAgICAgYXNzZXJ0ICYmIHVzZWRMaW5rcy5wdXNoKCBsaW5rTmFtZSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGhyZWYgPSBudWxsO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWdub3JlIHRoaW5ncyBpZiB0aGVyZSBpcyBubyBtYXRjaGluZyBocmVmXHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaHJlZixcclxuICAgICAgICAgIGBDb3VsZCBub3QgZmluZCBhIG1hdGNoaW5nIGl0ZW0gaW4gUmljaFRleHQncyBsaW5rcyBmb3IgJHtvcmlnaW5hbEhyZWZ9LiBJdCBzaG91bGQgYmUgcHJvdmlkZWQgaW4gdGhlIGxpbmtzIG9wdGlvbiwgb3IgbGlua3Mgc2hvdWxkIGJlIHR1cm5lZCB0byB0cnVlICh0byBhbGxvdyB0aGUgc3RyaW5nIHRvIGNyZWF0ZSBpdHMgb3duIHVybHNgICk7XHJcbiAgICAgICAgaWYgKCBocmVmICkge1xyXG4gICAgICAgICAgaWYgKCB0aGlzLl9saW5rRmlsbCAhPT0gbnVsbCApIHtcclxuICAgICAgICAgICAgZmlsbCA9IHRoaXMuX2xpbmtGaWxsOyAvLyBMaW5rIGNvbG9yXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBEb24ndCBvdmVyd3JpdGUgb25seSBpbm5lckNvbnRlbnRzIG9uY2UgdGhpbmdzIGhhdmUgYmVlbiBcInRvcm4gZG93blwiXHJcbiAgICAgICAgICBpZiAoICFlbGVtZW50LmlubmVyQ29udGVudCApIHtcclxuICAgICAgICAgICAgZWxlbWVudC5pbm5lckNvbnRlbnQgPSBSaWNoVGV4dC5oaW1hbGF5YUVsZW1lbnRUb0FjY2Vzc2libGVTdHJpbmcoIGVsZW1lbnQsIGlzTFRSICk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gU3RvcmUgaW5mb3JtYXRpb24gYWJvdXQgaXQgZm9yIHRoZSBcInJlZ3JvdXAgbGlua3NcIiBzdGVwXHJcbiAgICAgICAgICB0aGlzLl9saW5rSXRlbXMucHVzaCgge1xyXG4gICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxyXG4gICAgICAgICAgICBub2RlOiBub2RlLFxyXG4gICAgICAgICAgICBocmVmOiBocmVmXHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIC8vIEJvbGRcclxuICAgICAgZWxzZSBpZiAoIGVsZW1lbnQudGFnTmFtZSA9PT0gJ2InIHx8IGVsZW1lbnQudGFnTmFtZSA9PT0gJ3N0cm9uZycgKSB7XHJcbiAgICAgICAgZm9udCA9ICggdHlwZW9mIGZvbnQgPT09ICdzdHJpbmcnID8gRm9udC5mcm9tQ1NTKCBmb250ICkgOiBmb250ICkuY29weSgge1xyXG4gICAgICAgICAgd2VpZ2h0OiAnYm9sZCdcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gSXRhbGljXHJcbiAgICAgIGVsc2UgaWYgKCBlbGVtZW50LnRhZ05hbWUgPT09ICdpJyB8fCBlbGVtZW50LnRhZ05hbWUgPT09ICdlbScgKSB7XHJcbiAgICAgICAgZm9udCA9ICggdHlwZW9mIGZvbnQgPT09ICdzdHJpbmcnID8gRm9udC5mcm9tQ1NTKCBmb250ICkgOiBmb250ICkuY29weSgge1xyXG4gICAgICAgICAgc3R5bGU6ICdpdGFsaWMnXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIFN1YnNjcmlwdFxyXG4gICAgICBlbHNlIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnc3ViJyApIHtcclxuICAgICAgICBub2RlLnNjYWxlKCB0aGlzLl9zdWJTY2FsZSApO1xyXG4gICAgICAgICggbm9kZSBhcyBSaWNoVGV4dEVsZW1lbnQgKS5hZGRFeHRyYUJlZm9yZVNwYWNpbmcoIHRoaXMuX3N1YlhTcGFjaW5nICk7XHJcbiAgICAgICAgbm9kZS55ICs9IHRoaXMuX3N1YllPZmZzZXQ7XHJcbiAgICAgIH1cclxuICAgICAgLy8gU3VwZXJzY3JpcHRcclxuICAgICAgZWxzZSBpZiAoIGVsZW1lbnQudGFnTmFtZSA9PT0gJ3N1cCcgKSB7XHJcbiAgICAgICAgbm9kZS5zY2FsZSggdGhpcy5fc3VwU2NhbGUgKTtcclxuICAgICAgICAoIG5vZGUgYXMgUmljaFRleHRFbGVtZW50ICkuYWRkRXh0cmFCZWZvcmVTcGFjaW5nKCB0aGlzLl9zdXBYU3BhY2luZyApO1xyXG4gICAgICAgIG5vZGUueSArPSB0aGlzLl9zdXBZT2Zmc2V0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBJZiB3ZSd2ZSBhZGRlZCBleHRyYSBzcGFjaW5nLCB3ZSdsbCBuZWVkIHRvIHN1YnRyYWN0IGl0IG9mZiBvZiBvdXIgYXZhaWxhYmxlIHdpZHRoXHJcbiAgICAgIGNvbnN0IHNjYWxlID0gbm9kZS5nZXRTY2FsZVZlY3RvcigpLng7XHJcblxyXG4gICAgICAvLyBQcm9jZXNzIGNoaWxkcmVuXHJcbiAgICAgIGlmICggZWxlbWVudC50YWdOYW1lICE9PSAnbm9kZScgKSB7XHJcbiAgICAgICAgd2hpbGUgKCBsaW5lQnJlYWtTdGF0ZSA9PT0gTGluZUJyZWFrU3RhdGUuTk9ORSAmJiBlbGVtZW50LmNoaWxkcmVuLmxlbmd0aCApIHtcclxuICAgICAgICAgIGNvbnN0IHdpZHRoQmVmb3JlID0gbm9kZS5ib3VuZHMuaXNWYWxpZCgpID8gbm9kZS53aWR0aCA6IDA7XHJcblxyXG4gICAgICAgICAgY29uc3QgY2hpbGRFbGVtZW50ID0gZWxlbWVudC5jaGlsZHJlblsgMCBdO1xyXG4gICAgICAgICAgbGluZUJyZWFrU3RhdGUgPSB0aGlzLmFwcGVuZEVsZW1lbnQoIG5vZGUgYXMgUmljaFRleHRFbGVtZW50LCBjaGlsZEVsZW1lbnQsIGZvbnQsIGZpbGwsIGlzTFRSLCB3aWR0aEF2YWlsYWJsZSAvIHNjYWxlICk7XHJcblxyXG4gICAgICAgICAgLy8gZm9yIENPTVBMRVRFIG9yIE5PTkUsIHdlJ2xsIHdhbnQgdG8gcmVtb3ZlIHRoZSBjaGlsZEVsZW1lbnQgZnJvbSB0aGUgdHJlZSAod2UgZnVsbHkgcHJvY2Vzc2VkIGl0KVxyXG4gICAgICAgICAgaWYgKCBsaW5lQnJlYWtTdGF0ZSAhPT0gTGluZUJyZWFrU3RhdGUuSU5DT01QTEVURSApIHtcclxuICAgICAgICAgICAgZWxlbWVudC5jaGlsZHJlbi5zcGxpY2UoIDAsIDEgKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCB3aWR0aEFmdGVyID0gbm9kZS5ib3VuZHMuaXNWYWxpZCgpID8gbm9kZS53aWR0aCA6IDA7XHJcblxyXG4gICAgICAgICAgLy8gUmVtb3ZlIHRoZSBhbW91bnQgb2Ygd2lkdGggdGFrZW4gdXAgYnkgdGhlIGNoaWxkXHJcbiAgICAgICAgICB3aWR0aEF2YWlsYWJsZSArPSB3aWR0aEJlZm9yZSAtIHdpZHRoQWZ0ZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIElmIHRoZXJlIGlzIGEgbGluZSBicmVhayBhbmQgdGhlcmUgYXJlIHN0aWxsIG1vcmUgdGhpbmdzIHRvIHByb2Nlc3MsIHdlIGFyZSBpbmNvbXBsZXRlXHJcbiAgICAgICAgaWYgKCBsaW5lQnJlYWtTdGF0ZSA9PT0gTGluZUJyZWFrU3RhdGUuQ09NUExFVEUgJiYgZWxlbWVudC5jaGlsZHJlbi5sZW5ndGggKSB7XHJcbiAgICAgICAgICBsaW5lQnJlYWtTdGF0ZSA9IExpbmVCcmVha1N0YXRlLklOQ09NUExFVEU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTdWJzY3JpcHQgcG9zaXRpb25pbmdcclxuICAgICAgaWYgKCBlbGVtZW50LnRhZ05hbWUgPT09ICdzdWInICkge1xyXG4gICAgICAgIGlmICggaXNGaW5pdGUoIG5vZGUuaGVpZ2h0ICkgKSB7XHJcbiAgICAgICAgICBub2RlLmNlbnRlclkgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvLyBTdXBlcnNjcmlwdCBwb3NpdGlvbmluZ1xyXG4gICAgICBlbHNlIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnc3VwJyApIHtcclxuICAgICAgICBpZiAoIGlzRmluaXRlKCBub2RlLmhlaWdodCApICkge1xyXG4gICAgICAgICAgbm9kZS5jZW50ZXJZID0gUmljaFRleHRVdGlscy5zY3JhdGNoVGV4dC5zZXRTdHJpbmcoICdYJyApLnNldEZvbnQoIGZvbnQgKS50b3AgKiB0aGlzLl9jYXBIZWlnaHRTY2FsZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgLy8gVW5kZXJsaW5lXHJcbiAgICAgIGVsc2UgaWYgKCBlbGVtZW50LnRhZ05hbWUgPT09ICd1JyApIHtcclxuICAgICAgICBjb25zdCB1bmRlcmxpbmVZID0gLW5vZGUudG9wICogdGhpcy5fdW5kZXJsaW5lSGVpZ2h0U2NhbGU7XHJcbiAgICAgICAgaWYgKCBpc0Zpbml0ZSggbm9kZS50b3AgKSApIHtcclxuICAgICAgICAgIG5vZGUuYWRkQ2hpbGQoIG5ldyBMaW5lKCBub2RlLmxvY2FsTGVmdCwgdW5kZXJsaW5lWSwgbm9kZS5sb2NhbFJpZ2h0LCB1bmRlcmxpbmVZLCB7XHJcbiAgICAgICAgICAgIHN0cm9rZTogZmlsbCxcclxuICAgICAgICAgICAgbGluZVdpZHRoOiB0aGlzLl91bmRlcmxpbmVMaW5lV2lkdGhcclxuICAgICAgICAgIH0gKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvLyBTdHJpa2V0aHJvdWdoXHJcbiAgICAgIGVsc2UgaWYgKCBlbGVtZW50LnRhZ05hbWUgPT09ICdzJyApIHtcclxuICAgICAgICBjb25zdCBzdHJpa2V0aHJvdWdoWSA9IG5vZGUudG9wICogdGhpcy5fc3RyaWtldGhyb3VnaEhlaWdodFNjYWxlO1xyXG4gICAgICAgIGlmICggaXNGaW5pdGUoIG5vZGUudG9wICkgKSB7XHJcbiAgICAgICAgICBub2RlLmFkZENoaWxkKCBuZXcgTGluZSggbm9kZS5sb2NhbExlZnQsIHN0cmlrZXRocm91Z2hZLCBub2RlLmxvY2FsUmlnaHQsIHN0cmlrZXRocm91Z2hZLCB7XHJcbiAgICAgICAgICAgIHN0cm9rZTogZmlsbCxcclxuICAgICAgICAgICAgbGluZVdpZHRoOiB0aGlzLl9zdHJpa2V0aHJvdWdoTGluZVdpZHRoXHJcbiAgICAgICAgICB9ICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlJpY2hUZXh0ICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBub2RlICkge1xyXG4gICAgICBjb25zdCB3YXNBZGRlZCA9IGNvbnRhaW5lck5vZGUuYWRkRWxlbWVudCggbm9kZSApO1xyXG4gICAgICBpZiAoICF3YXNBZGRlZCApIHtcclxuICAgICAgICAvLyBSZW1vdmUgaXQgZnJvbSB0aGUgbGlua0l0ZW1zIGlmIHdlIGRpZG4ndCBhY3R1YWxseSBhZGQgaXQuXHJcbiAgICAgICAgdGhpcy5fbGlua0l0ZW1zID0gdGhpcy5fbGlua0l0ZW1zLmZpbHRlciggaXRlbSA9PiBpdGVtLm5vZGUgIT09IG5vZGUgKTtcclxuXHJcbiAgICAgICAgLy8gQW5kIHNpbmNlIHdlIHdvbid0IGRpc3Bvc2UgaXQgKHNpbmNlIGl0J3Mgbm90IGEgY2hpbGQpLCBjbGVhbiBpdCBoZXJlXHJcbiAgICAgICAgbm9kZS5jbGVhbigpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGxpbmVCcmVha1N0YXRlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgc3RyaW5nIGRpc3BsYXllZCBieSBvdXIgbm9kZS5cclxuICAgKlxyXG4gICAqIE5PVEU6IEVuY29kaW5nIEhUTUwgZW50aXRpZXMgaXMgcmVxdWlyZWQsIGFuZCBtYWxmb3JtZWQgSFRNTCBpcyBub3QgYWNjZXB0ZWQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc3RyaW5nIC0gVGhlIHN0cmluZyB0byBkaXNwbGF5LiBJZiBpdCdzIGEgbnVtYmVyLCBpdCB3aWxsIGJlIGNhc3QgdG8gYSBzdHJpbmdcclxuICAgKi9cclxuICBwdWJsaWMgc2V0U3RyaW5nKCBzdHJpbmc6IHN0cmluZyB8IG51bWJlciApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHN0cmluZyAhPT0gbnVsbCAmJiBzdHJpbmcgIT09IHVuZGVmaW5lZCwgJ1N0cmluZyBzaG91bGQgYmUgZGVmaW5lZCBhbmQgbm9uLW51bGwuIFVzZSB0aGUgZW1wdHkgc3RyaW5nIGlmIG5lZWRlZC4nICk7XHJcblxyXG4gICAgLy8gY2FzdCBpdCB0byBhIHN0cmluZyAoZm9yIG51bWJlcnMsIGV0Yy4sIGFuZCBkbyBpdCBiZWZvcmUgdGhlIGNoYW5nZSBndWFyZCBzbyB3ZSBkb24ndCBhY2NpZGVudGFsbHkgdHJpZ2dlciBvbiBub24tY2hhbmdlZCBzdHJpbmcpXHJcbiAgICBzdHJpbmcgPSBgJHtzdHJpbmd9YDtcclxuXHJcbiAgICB0aGlzLl9zdHJpbmdQcm9wZXJ0eS5zZXQoIHN0cmluZyApO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBzdHJpbmcoIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgKSB7IHRoaXMuc2V0U3RyaW5nKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgc3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmdldFN0cmluZygpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHN0cmluZyBkaXNwbGF5ZWQgYnkgb3VyIHRleHQgTm9kZS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0U3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3RyaW5nUHJvcGVydHkudmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIGRldGVybWluZSBib3VuZHMgZnJvbSB0aGUgdGV4dC4gU2VlIFRleHQuc2V0Qm91bmRzTWV0aG9kIGZvciBkZXRhaWxzXHJcbiAgICovXHJcbiAgcHVibGljIHNldEJvdW5kc01ldGhvZCggbWV0aG9kOiBUZXh0Qm91bmRzTWV0aG9kICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWV0aG9kID09PSAnZmFzdCcgfHwgbWV0aG9kID09PSAnZmFzdENhbnZhcycgfHwgbWV0aG9kID09PSAnYWNjdXJhdGUnIHx8IG1ldGhvZCA9PT0gJ2h5YnJpZCcsICdVbmtub3duIFRleHQgYm91bmRzTWV0aG9kJyApO1xyXG4gICAgaWYgKCBtZXRob2QgIT09IHRoaXMuX2JvdW5kc01ldGhvZCApIHtcclxuICAgICAgdGhpcy5fYm91bmRzTWV0aG9kID0gbWV0aG9kO1xyXG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGJvdW5kc01ldGhvZCggdmFsdWU6IFRleHRCb3VuZHNNZXRob2QgKSB7IHRoaXMuc2V0Qm91bmRzTWV0aG9kKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgYm91bmRzTWV0aG9kKCk6IFRleHRCb3VuZHNNZXRob2QgeyByZXR1cm4gdGhpcy5nZXRCb3VuZHNNZXRob2QoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IG1ldGhvZCB0byBlc3RpbWF0ZSB0aGUgYm91bmRzIG9mIHRoZSB0ZXh0LiBTZWUgc2V0Qm91bmRzTWV0aG9kKCkgZm9yIG1vcmUgaW5mb3JtYXRpb24uXHJcbiAgICovXHJcbiAgcHVibGljIGdldEJvdW5kc01ldGhvZCgpOiBUZXh0Qm91bmRzTWV0aG9kIHtcclxuICAgIHJldHVybiB0aGlzLl9ib3VuZHNNZXRob2Q7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBmb250IG9mIG91ciBub2RlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRGb250KCBmb250OiBGb250IHwgc3RyaW5nICk6IHRoaXMge1xyXG5cclxuICAgIGlmICggdGhpcy5fZm9udCAhPT0gZm9udCApIHtcclxuICAgICAgdGhpcy5fZm9udCA9IGZvbnQ7XHJcbiAgICAgIHRoaXMucmVidWlsZFJpY2hUZXh0KCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgZm9udCggdmFsdWU6IEZvbnQgfCBzdHJpbmcgKSB7IHRoaXMuc2V0Rm9udCggdmFsdWUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGZvbnQoKTogRm9udCB8IHN0cmluZyB7IHJldHVybiB0aGlzLmdldEZvbnQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IEZvbnRcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Rm9udCgpOiBGb250IHwgc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl9mb250O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgZmlsbCBvZiBvdXIgdGV4dC5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0RmlsbCggZmlsbDogVFBhaW50ICk6IHRoaXMge1xyXG4gICAgaWYgKCB0aGlzLl9maWxsICE9PSBmaWxsICkge1xyXG4gICAgICB0aGlzLl9maWxsID0gZmlsbDtcclxuICAgICAgdGhpcy5yZWJ1aWxkUmljaFRleHQoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBmaWxsKCB2YWx1ZTogVFBhaW50ICkgeyB0aGlzLnNldEZpbGwoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBmaWxsKCk6IFRQYWludCB7IHJldHVybiB0aGlzLmdldEZpbGwoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IGZpbGwuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEZpbGwoKTogVFBhaW50IHtcclxuICAgIHJldHVybiB0aGlzLl9maWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgc3Ryb2tlIG9mIG91ciB0ZXh0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRTdHJva2UoIHN0cm9rZTogVFBhaW50ICk6IHRoaXMge1xyXG4gICAgaWYgKCB0aGlzLl9zdHJva2UgIT09IHN0cm9rZSApIHtcclxuICAgICAgdGhpcy5fc3Ryb2tlID0gc3Ryb2tlO1xyXG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHN0cm9rZSggdmFsdWU6IFRQYWludCApIHsgdGhpcy5zZXRTdHJva2UoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBzdHJva2UoKTogVFBhaW50IHsgcmV0dXJuIHRoaXMuZ2V0U3Ryb2tlKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCBzdHJva2UuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFN0cm9rZSgpOiBUUGFpbnQge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N0cm9rZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGxpbmVXaWR0aCBvZiBvdXIgdGV4dC5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0TGluZVdpZHRoKCBsaW5lV2lkdGg6IG51bWJlciApOiB0aGlzIHtcclxuICAgIGlmICggdGhpcy5fbGluZVdpZHRoICE9PSBsaW5lV2lkdGggKSB7XHJcbiAgICAgIHRoaXMuX2xpbmVXaWR0aCA9IGxpbmVXaWR0aDtcclxuICAgICAgdGhpcy5yZWJ1aWxkUmljaFRleHQoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBsaW5lV2lkdGgoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0TGluZVdpZHRoKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgbGluZVdpZHRoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldExpbmVXaWR0aCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGN1cnJlbnQgbGluZVdpZHRoLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRMaW5lV2lkdGgoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9saW5lV2lkdGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBzY2FsZSAocmVsYXRpdmUgdG8gMSkgb2YgYW55IHN0cmluZyB1bmRlciBzdWJzY3JpcHQgKDxzdWI+KSBlbGVtZW50cy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0U3ViU2NhbGUoIHN1YlNjYWxlOiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggc3ViU2NhbGUgKSAmJiBzdWJTY2FsZSA+IDAgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX3N1YlNjYWxlICE9PSBzdWJTY2FsZSApIHtcclxuICAgICAgdGhpcy5fc3ViU2NhbGUgPSBzdWJTY2FsZTtcclxuICAgICAgdGhpcy5yZWJ1aWxkUmljaFRleHQoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBzdWJTY2FsZSggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRTdWJTY2FsZSggdmFsdWUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHN1YlNjYWxlKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFN1YlNjYWxlKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc2NhbGUgKHJlbGF0aXZlIHRvIDEpIG9mIGFueSBzdHJpbmcgdW5kZXIgc3Vic2NyaXB0ICg8c3ViPikgZWxlbWVudHMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFN1YlNjYWxlKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3ViU2NhbGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBob3Jpem9udGFsIHNwYWNpbmcgYmVmb3JlIGFueSBzdWJzY3JpcHQgKDxzdWI+KSBlbGVtZW50cy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0U3ViWFNwYWNpbmcoIHN1YlhTcGFjaW5nOiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggc3ViWFNwYWNpbmcgKSApO1xyXG5cclxuICAgIGlmICggdGhpcy5fc3ViWFNwYWNpbmcgIT09IHN1YlhTcGFjaW5nICkge1xyXG4gICAgICB0aGlzLl9zdWJYU3BhY2luZyA9IHN1YlhTcGFjaW5nO1xyXG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHN1YlhTcGFjaW5nKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldFN1YlhTcGFjaW5nKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgc3ViWFNwYWNpbmcoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0U3ViWFNwYWNpbmcoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBob3Jpem9udGFsIHNwYWNpbmcgYmVmb3JlIGFueSBzdWJzY3JpcHQgKDxzdWI+KSBlbGVtZW50cy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0U3ViWFNwYWNpbmcoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9zdWJYU3BhY2luZztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGFkanVzdG1lbnQgb2Zmc2V0IHRvIHRoZSB2ZXJ0aWNhbCBwbGFjZW1lbnQgb2YgYW55IHN1YnNjcmlwdCAoPHN1Yj4pIGVsZW1lbnRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRTdWJZT2Zmc2V0KCBzdWJZT2Zmc2V0OiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggc3ViWU9mZnNldCApICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9zdWJZT2Zmc2V0ICE9PSBzdWJZT2Zmc2V0ICkge1xyXG4gICAgICB0aGlzLl9zdWJZT2Zmc2V0ID0gc3ViWU9mZnNldDtcclxuICAgICAgdGhpcy5yZWJ1aWxkUmljaFRleHQoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBzdWJZT2Zmc2V0KCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldFN1YllPZmZzZXQoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBzdWJZT2Zmc2V0KCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFN1YllPZmZzZXQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBhZGp1c3RtZW50IG9mZnNldCB0byB0aGUgdmVydGljYWwgcGxhY2VtZW50IG9mIGFueSBzdWJzY3JpcHQgKDxzdWI+KSBlbGVtZW50cy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0U3ViWU9mZnNldCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N1YllPZmZzZXQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBzY2FsZSAocmVsYXRpdmUgdG8gMSkgb2YgYW55IHN0cmluZyB1bmRlciBzdXBlcnNjcmlwdCAoPHN1cD4pIGVsZW1lbnRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRTdXBTY2FsZSggc3VwU2NhbGU6IG51bWJlciApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBzdXBTY2FsZSApICYmIHN1cFNjYWxlID4gMCApO1xyXG5cclxuICAgIGlmICggdGhpcy5fc3VwU2NhbGUgIT09IHN1cFNjYWxlICkge1xyXG4gICAgICB0aGlzLl9zdXBTY2FsZSA9IHN1cFNjYWxlO1xyXG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHN1cFNjYWxlKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldFN1cFNjYWxlKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgc3VwU2NhbGUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0U3VwU2NhbGUoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBzY2FsZSAocmVsYXRpdmUgdG8gMSkgb2YgYW55IHN0cmluZyB1bmRlciBzdXBlcnNjcmlwdCAoPHN1cD4pIGVsZW1lbnRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRTdXBTY2FsZSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N1cFNjYWxlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgaG9yaXpvbnRhbCBzcGFjaW5nIGJlZm9yZSBhbnkgc3VwZXJzY3JpcHQgKDxzdXA+KSBlbGVtZW50cy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0U3VwWFNwYWNpbmcoIHN1cFhTcGFjaW5nOiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggc3VwWFNwYWNpbmcgKSApO1xyXG5cclxuICAgIGlmICggdGhpcy5fc3VwWFNwYWNpbmcgIT09IHN1cFhTcGFjaW5nICkge1xyXG4gICAgICB0aGlzLl9zdXBYU3BhY2luZyA9IHN1cFhTcGFjaW5nO1xyXG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHN1cFhTcGFjaW5nKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldFN1cFhTcGFjaW5nKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgc3VwWFNwYWNpbmcoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0U3VwWFNwYWNpbmcoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBob3Jpem9udGFsIHNwYWNpbmcgYmVmb3JlIGFueSBzdXBlcnNjcmlwdCAoPHN1cD4pIGVsZW1lbnRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRTdXBYU3BhY2luZygpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N1cFhTcGFjaW5nO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgYWRqdXN0bWVudCBvZmZzZXQgdG8gdGhlIHZlcnRpY2FsIHBsYWNlbWVudCBvZiBhbnkgc3VwZXJzY3JpcHQgKDxzdXA+KSBlbGVtZW50cy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0U3VwWU9mZnNldCggc3VwWU9mZnNldDogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHN1cFlPZmZzZXQgKSApO1xyXG5cclxuICAgIGlmICggdGhpcy5fc3VwWU9mZnNldCAhPT0gc3VwWU9mZnNldCApIHtcclxuICAgICAgdGhpcy5fc3VwWU9mZnNldCA9IHN1cFlPZmZzZXQ7XHJcbiAgICAgIHRoaXMucmVidWlsZFJpY2hUZXh0KCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgc3VwWU9mZnNldCggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRTdXBZT2Zmc2V0KCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgc3VwWU9mZnNldCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRTdXBZT2Zmc2V0KCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgYWRqdXN0bWVudCBvZmZzZXQgdG8gdGhlIHZlcnRpY2FsIHBsYWNlbWVudCBvZiBhbnkgc3VwZXJzY3JpcHQgKDxzdXA+KSBlbGVtZW50cy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0U3VwWU9mZnNldCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N1cFlPZmZzZXQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBleHBlY3RlZCBjYXAgaGVpZ2h0IChiYXNlbGluZSB0byB0b3Agb2YgY2FwaXRhbCBsZXR0ZXJzKSBhcyBhIHNjYWxlIG9mIHRoZSBkZXRlY3RlZCBkaXN0YW5jZSBmcm9tIHRoZVxyXG4gICAqIGJhc2VsaW5lIHRvIHRoZSB0b3Agb2YgdGhlIHRleHQgYm91bmRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRDYXBIZWlnaHRTY2FsZSggY2FwSGVpZ2h0U2NhbGU6IG51bWJlciApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBjYXBIZWlnaHRTY2FsZSApICYmIGNhcEhlaWdodFNjYWxlID4gMCApO1xyXG5cclxuICAgIGlmICggdGhpcy5fY2FwSGVpZ2h0U2NhbGUgIT09IGNhcEhlaWdodFNjYWxlICkge1xyXG4gICAgICB0aGlzLl9jYXBIZWlnaHRTY2FsZSA9IGNhcEhlaWdodFNjYWxlO1xyXG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGNhcEhlaWdodFNjYWxlKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldENhcEhlaWdodFNjYWxlKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgY2FwSGVpZ2h0U2NhbGUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0Q2FwSGVpZ2h0U2NhbGUoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBleHBlY3RlZCBjYXAgaGVpZ2h0IChiYXNlbGluZSB0byB0b3Agb2YgY2FwaXRhbCBsZXR0ZXJzKSBhcyBhIHNjYWxlIG9mIHRoZSBkZXRlY3RlZCBkaXN0YW5jZSBmcm9tIHRoZVxyXG4gICAqIGJhc2VsaW5lIHRvIHRoZSB0b3Agb2YgdGhlIHRleHQgYm91bmRzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDYXBIZWlnaHRTY2FsZSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NhcEhlaWdodFNjYWxlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgbGluZVdpZHRoIG9mIHVuZGVybGluZSBsaW5lcy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0VW5kZXJsaW5lTGluZVdpZHRoKCB1bmRlcmxpbmVMaW5lV2lkdGg6IG51bWJlciApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB1bmRlcmxpbmVMaW5lV2lkdGggKSAmJiB1bmRlcmxpbmVMaW5lV2lkdGggPiAwICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl91bmRlcmxpbmVMaW5lV2lkdGggIT09IHVuZGVybGluZUxpbmVXaWR0aCApIHtcclxuICAgICAgdGhpcy5fdW5kZXJsaW5lTGluZVdpZHRoID0gdW5kZXJsaW5lTGluZVdpZHRoO1xyXG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHVuZGVybGluZUxpbmVXaWR0aCggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRVbmRlcmxpbmVMaW5lV2lkdGgoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCB1bmRlcmxpbmVMaW5lV2lkdGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0VW5kZXJsaW5lTGluZVdpZHRoKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbGluZVdpZHRoIG9mIHVuZGVybGluZSBsaW5lcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VW5kZXJsaW5lTGluZVdpZHRoKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fdW5kZXJsaW5lTGluZVdpZHRoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgdW5kZXJsaW5lIGhlaWdodCBhZGp1c3RtZW50IGFzIGEgcHJvcG9ydGlvbiBvZiB0aGUgZGV0ZWN0ZWQgZGlzdGFuY2UgZnJvbSB0aGUgYmFzZWxpbmUgdG8gdGhlIHRvcCBvZiB0aGVcclxuICAgKiB0ZXh0IGJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0VW5kZXJsaW5lSGVpZ2h0U2NhbGUoIHVuZGVybGluZUhlaWdodFNjYWxlOiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdW5kZXJsaW5lSGVpZ2h0U2NhbGUgKSAmJiB1bmRlcmxpbmVIZWlnaHRTY2FsZSA+IDAgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX3VuZGVybGluZUhlaWdodFNjYWxlICE9PSB1bmRlcmxpbmVIZWlnaHRTY2FsZSApIHtcclxuICAgICAgdGhpcy5fdW5kZXJsaW5lSGVpZ2h0U2NhbGUgPSB1bmRlcmxpbmVIZWlnaHRTY2FsZTtcclxuICAgICAgdGhpcy5yZWJ1aWxkUmljaFRleHQoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCB1bmRlcmxpbmVIZWlnaHRTY2FsZSggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRVbmRlcmxpbmVIZWlnaHRTY2FsZSggdmFsdWUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHVuZGVybGluZUhlaWdodFNjYWxlKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFVuZGVybGluZUhlaWdodFNjYWxlKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgdW5kZXJsaW5lIGhlaWdodCBhZGp1c3RtZW50IGFzIGEgcHJvcG9ydGlvbiBvZiB0aGUgZGV0ZWN0ZWQgZGlzdGFuY2UgZnJvbSB0aGUgYmFzZWxpbmUgdG8gdGhlIHRvcCBvZiB0aGVcclxuICAgKiB0ZXh0IGJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VW5kZXJsaW5lSGVpZ2h0U2NhbGUoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl91bmRlcmxpbmVIZWlnaHRTY2FsZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGxpbmVXaWR0aCBvZiBzdHJpa2V0aHJvdWdoIGxpbmVzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRTdHJpa2V0aHJvdWdoTGluZVdpZHRoKCBzdHJpa2V0aHJvdWdoTGluZVdpZHRoOiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggc3RyaWtldGhyb3VnaExpbmVXaWR0aCApICYmIHN0cmlrZXRocm91Z2hMaW5lV2lkdGggPiAwICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9zdHJpa2V0aHJvdWdoTGluZVdpZHRoICE9PSBzdHJpa2V0aHJvdWdoTGluZVdpZHRoICkge1xyXG4gICAgICB0aGlzLl9zdHJpa2V0aHJvdWdoTGluZVdpZHRoID0gc3RyaWtldGhyb3VnaExpbmVXaWR0aDtcclxuICAgICAgdGhpcy5yZWJ1aWxkUmljaFRleHQoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBzdHJpa2V0aHJvdWdoTGluZVdpZHRoKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldFN0cmlrZXRocm91Z2hMaW5lV2lkdGgoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBzdHJpa2V0aHJvdWdoTGluZVdpZHRoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFN0cmlrZXRocm91Z2hMaW5lV2lkdGgoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBsaW5lV2lkdGggb2Ygc3RyaWtldGhyb3VnaCBsaW5lcy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0U3RyaWtldGhyb3VnaExpbmVXaWR0aCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N0cmlrZXRocm91Z2hMaW5lV2lkdGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBzdHJpa2V0aHJvdWdoIGhlaWdodCBhZGp1c3RtZW50IGFzIGEgcHJvcG9ydGlvbiBvZiB0aGUgZGV0ZWN0ZWQgZGlzdGFuY2UgZnJvbSB0aGUgYmFzZWxpbmUgdG8gdGhlIHRvcCBvZiB0aGVcclxuICAgKiB0ZXh0IGJvdW5kcy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0U3RyaWtldGhyb3VnaEhlaWdodFNjYWxlKCBzdHJpa2V0aHJvdWdoSGVpZ2h0U2NhbGU6IG51bWJlciApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBzdHJpa2V0aHJvdWdoSGVpZ2h0U2NhbGUgKSAmJiBzdHJpa2V0aHJvdWdoSGVpZ2h0U2NhbGUgPiAwICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9zdHJpa2V0aHJvdWdoSGVpZ2h0U2NhbGUgIT09IHN0cmlrZXRocm91Z2hIZWlnaHRTY2FsZSApIHtcclxuICAgICAgdGhpcy5fc3RyaWtldGhyb3VnaEhlaWdodFNjYWxlID0gc3RyaWtldGhyb3VnaEhlaWdodFNjYWxlO1xyXG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHN0cmlrZXRocm91Z2hIZWlnaHRTY2FsZSggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRTdHJpa2V0aHJvdWdoSGVpZ2h0U2NhbGUoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBzdHJpa2V0aHJvdWdoSGVpZ2h0U2NhbGUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0U3RyaWtldGhyb3VnaEhlaWdodFNjYWxlKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc3RyaWtldGhyb3VnaCBoZWlnaHQgYWRqdXN0bWVudCBhcyBhIHByb3BvcnRpb24gb2YgdGhlIGRldGVjdGVkIGRpc3RhbmNlIGZyb20gdGhlIGJhc2VsaW5lIHRvIHRoZSB0b3Agb2YgdGhlXHJcbiAgICogdGV4dCBib3VuZHMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFN0cmlrZXRocm91Z2hIZWlnaHRTY2FsZSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N0cmlrZXRocm91Z2hIZWlnaHRTY2FsZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGNvbG9yIG9mIGxpbmtzLiBJZiBudWxsLCBubyBmaWxsIHdpbGwgYmUgb3ZlcnJpZGRlbi5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0TGlua0ZpbGwoIGxpbmtGaWxsOiBUUGFpbnQgKTogdGhpcyB7XHJcbiAgICBpZiAoIHRoaXMuX2xpbmtGaWxsICE9PSBsaW5rRmlsbCApIHtcclxuICAgICAgdGhpcy5fbGlua0ZpbGwgPSBsaW5rRmlsbDtcclxuICAgICAgdGhpcy5yZWJ1aWxkUmljaFRleHQoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBsaW5rRmlsbCggdmFsdWU6IFRQYWludCApIHsgdGhpcy5zZXRMaW5rRmlsbCggdmFsdWUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGxpbmtGaWxsKCk6IFRQYWludCB7IHJldHVybiB0aGlzLmdldExpbmtGaWxsKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY29sb3Igb2YgbGlua3MuXHJcbiAgICovXHJcbiAgcHVibGljIGdldExpbmtGaWxsKCk6IFRQYWludCB7XHJcbiAgICByZXR1cm4gdGhpcy5fbGlua0ZpbGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHdoZXRoZXIgbGluayBjbGlja3Mgd2lsbCBjYWxsIGV2ZW50LmhhbmRsZSgpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRMaW5rRXZlbnRzSGFuZGxlZCggbGlua0V2ZW50c0hhbmRsZWQ6IGJvb2xlYW4gKTogdGhpcyB7XHJcbiAgICBpZiAoIHRoaXMuX2xpbmtFdmVudHNIYW5kbGVkICE9PSBsaW5rRXZlbnRzSGFuZGxlZCApIHtcclxuICAgICAgdGhpcy5fbGlua0V2ZW50c0hhbmRsZWQgPSBsaW5rRXZlbnRzSGFuZGxlZDtcclxuICAgICAgdGhpcy5yZWJ1aWxkUmljaFRleHQoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBsaW5rRXZlbnRzSGFuZGxlZCggdmFsdWU6IGJvb2xlYW4gKSB7IHRoaXMuc2V0TGlua0V2ZW50c0hhbmRsZWQoIHZhbHVlICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBsaW5rRXZlbnRzSGFuZGxlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0TGlua0V2ZW50c0hhbmRsZWQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgbGluayBldmVudHMgd2lsbCBiZSBoYW5kbGVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRMaW5rRXZlbnRzSGFuZGxlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9saW5rRXZlbnRzSGFuZGxlZDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRMaW5rcyggbGlua3M6IFJpY2hUZXh0TGlua3MgKTogdGhpcyB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsaW5rcyA9PT0gdHJ1ZSB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIGxpbmtzICkgPT09IE9iamVjdC5wcm90b3R5cGUgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX2xpbmtzICE9PSBsaW5rcyApIHtcclxuICAgICAgdGhpcy5fbGlua3MgPSBsaW5rcztcclxuICAgICAgdGhpcy5yZWJ1aWxkUmljaFRleHQoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIGxpbmsgZXZlbnRzIHdpbGwgYmUgaGFuZGxlZC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TGlua3MoKTogUmljaFRleHRMaW5rcyB7XHJcbiAgICByZXR1cm4gdGhpcy5fbGlua3M7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGxpbmtzKCB2YWx1ZTogUmljaFRleHRMaW5rcyApIHsgdGhpcy5zZXRMaW5rcyggdmFsdWUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGxpbmtzKCk6IFJpY2hUZXh0TGlua3MgeyByZXR1cm4gdGhpcy5nZXRMaW5rcygpOyB9XHJcblxyXG4gIHB1YmxpYyBzZXROb2Rlcyggbm9kZXM6IFJlY29yZDxzdHJpbmcsIE5vZGU+ICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggT2JqZWN0LmdldFByb3RvdHlwZU9mKCBub2RlcyApID09PSBPYmplY3QucHJvdG90eXBlICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9ub2RlcyAhPT0gbm9kZXMgKSB7XHJcbiAgICAgIHRoaXMuX25vZGVzID0gbm9kZXM7XHJcbiAgICAgIHRoaXMucmVidWlsZFJpY2hUZXh0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0Tm9kZXMoKTogUmVjb3JkPHN0cmluZywgTm9kZT4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX25vZGVzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldCBub2RlcyggdmFsdWU6IFJlY29yZDxzdHJpbmcsIE5vZGU+ICkgeyB0aGlzLnNldE5vZGVzKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgbm9kZXMoKTogUmVjb3JkPHN0cmluZywgTm9kZT4geyByZXR1cm4gdGhpcy5nZXROb2RlcygpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgd2hldGhlciBuZXdsaW5lcyBhcmUgcmVwbGFjZWQgd2l0aCA8YnI+XHJcbiAgICovXHJcbiAgcHVibGljIHNldFJlcGxhY2VOZXdsaW5lcyggcmVwbGFjZU5ld2xpbmVzOiBib29sZWFuICk6IHRoaXMge1xyXG4gICAgaWYgKCB0aGlzLl9yZXBsYWNlTmV3bGluZXMgIT09IHJlcGxhY2VOZXdsaW5lcyApIHtcclxuICAgICAgdGhpcy5fcmVwbGFjZU5ld2xpbmVzID0gcmVwbGFjZU5ld2xpbmVzO1xyXG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IHJlcGxhY2VOZXdsaW5lcyggdmFsdWU6IGJvb2xlYW4gKSB7IHRoaXMuc2V0UmVwbGFjZU5ld2xpbmVzKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgcmVwbGFjZU5ld2xpbmVzKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5nZXRSZXBsYWNlTmV3bGluZXMoKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0UmVwbGFjZU5ld2xpbmVzKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3JlcGxhY2VOZXdsaW5lcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGFsaWdubWVudCBvZiB0ZXh0IChvbmx5IHJlbGV2YW50IGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBsaW5lcykuXHJcbiAgICovXHJcbiAgcHVibGljIHNldEFsaWduKCBhbGlnbjogUmljaFRleHRBbGlnbiApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFsaWduID09PSAnbGVmdCcgfHwgYWxpZ24gPT09ICdjZW50ZXInIHx8IGFsaWduID09PSAncmlnaHQnICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9hbGlnbiAhPT0gYWxpZ24gKSB7XHJcbiAgICAgIHRoaXMuX2FsaWduID0gYWxpZ247XHJcbiAgICAgIHRoaXMucmVidWlsZFJpY2hUZXh0KCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgYWxpZ24oIHZhbHVlOiBSaWNoVGV4dEFsaWduICkgeyB0aGlzLnNldEFsaWduKCB2YWx1ZSApOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgYWxpZ24oKTogUmljaFRleHRBbGlnbiB7IHJldHVybiB0aGlzLmdldEFsaWduKCk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCBhbGlnbm1lbnQgb2YgdGhlIHRleHQgKG9ubHkgcmVsZXZhbnQgaWYgdGhlcmUgYXJlIG11bHRpcGxlIGxpbmVzKS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0QWxpZ24oKTogUmljaFRleHRBbGlnbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fYWxpZ247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBsZWFkaW5nIChzcGFjaW5nIGJldHdlZW4gbGluZXMpXHJcbiAgICovXHJcbiAgcHVibGljIHNldExlYWRpbmcoIGxlYWRpbmc6IG51bWJlciApOiB0aGlzIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBsZWFkaW5nICkgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuX2xlYWRpbmcgIT09IGxlYWRpbmcgKSB7XHJcbiAgICAgIHRoaXMuX2xlYWRpbmcgPSBsZWFkaW5nO1xyXG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGxlYWRpbmcoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0TGVhZGluZyggdmFsdWUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGxlYWRpbmcoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0TGVhZGluZygpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGxlYWRpbmcgKHNwYWNpbmcgYmV0d2VlbiBsaW5lcylcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TGVhZGluZygpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX2xlYWRpbmc7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBsaW5lIHdyYXAgd2lkdGggZm9yIHRoZSB0ZXh0IChvciBudWxsIGlmIG5vbmUgaXMgZGVzaXJlZCkuIExpbmVzIGxvbmdlciB0aGFuIHRoaXMgbGVuZ3RoIHdpbGwgd3JhcFxyXG4gICAqIGF1dG9tYXRpY2FsbHkgdG8gdGhlIG5leHQgbGluZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBsaW5lV3JhcCAtIElmIGl0J3MgYSBudW1iZXIsIGl0IHNob3VsZCBiZSBncmVhdGVyIHRoYW4gMC5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0TGluZVdyYXAoIGxpbmVXcmFwOiBudW1iZXIgfCBudWxsICk6IHRoaXMge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbGluZVdyYXAgPT09IG51bGwgfHwgKCBpc0Zpbml0ZSggbGluZVdyYXAgKSAmJiBsaW5lV3JhcCA+IDAgKSApO1xyXG5cclxuICAgIGlmICggdGhpcy5fbGluZVdyYXAgIT09IGxpbmVXcmFwICkge1xyXG4gICAgICB0aGlzLl9saW5lV3JhcCA9IGxpbmVXcmFwO1xyXG4gICAgICB0aGlzLnJlYnVpbGRSaWNoVGV4dCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGxpbmVXcmFwKCB2YWx1ZTogbnVtYmVyIHwgbnVsbCApIHsgdGhpcy5zZXRMaW5lV3JhcCggdmFsdWUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGxpbmVXcmFwKCk6IG51bWJlciB8IG51bGwgeyByZXR1cm4gdGhpcy5nZXRMaW5lV3JhcCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGxpbmUgd3JhcCB3aWR0aC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TGluZVdyYXAoKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fbGluZVdyYXA7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgbXV0YXRlKCBvcHRpb25zPzogUmljaFRleHRPcHRpb25zICk6IHRoaXMge1xyXG5cclxuICAgIGlmICggYXNzZXJ0ICYmIG9wdGlvbnMgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ3N0cmluZycgKSAmJiBvcHRpb25zLmhhc093blByb3BlcnR5KCBUZXh0LlNUUklOR19QUk9QRVJUWV9OQU1FICkgJiYgb3B0aW9ucy5zdHJpbmdQcm9wZXJ0eSApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5zdHJpbmdQcm9wZXJ0eS52YWx1ZSA9PT0gb3B0aW9ucy5zdHJpbmcsICdJZiBib3RoIHN0cmluZyBhbmQgc3RyaW5nUHJvcGVydHkgYXJlIHByb3ZpZGVkLCB0aGVuIHZhbHVlcyBzaG91bGQgbWF0Y2gnICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHN1cGVyLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHdyYXBwZWQgdmVyc2lvbiBvZiB0aGUgc3RyaW5nIHdpdGggYSBmb250IHNwZWNpZmllciB0aGF0IHVzZXMgdGhlIGdpdmVuIGZvbnQgb2JqZWN0LlxyXG4gICAqXHJcbiAgICogTk9URTogRG9lcyBhbiBhcHByb3hpbWF0aW9uIG9mIHNvbWUgZm9udCB2YWx1ZXMgKHVzaW5nIDxiPiBvciA8aT4pLCBhbmQgY2Fubm90IGZvcmNlIHRoZSBsYWNrIG9mIHRob3NlIGlmIGl0IGlzXHJcbiAgICogaW5jbHVkZWQgaW4gYm9sZC9pdGFsaWMgZXh0ZXJpb3IgdGFncy5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHN0cmluZ1dpdGhGb250KCBzdHI6IHN0cmluZywgZm9udDogRm9udCApOiBzdHJpbmcge1xyXG4gICAgLy8gVE9ETzogRVM2IHN0cmluZyBpbnRlcnBvbGF0aW9uLlxyXG4gICAgcmV0dXJuIGAkeyc8c3BhbiBzdHlsZT1cXCcnICtcclxuICAgICAgICAgICAnZm9udC1zdHlsZTogJ30ke2ZvbnQuc3R5bGV9O2AgK1xyXG4gICAgICAgICAgIGBmb250LXZhcmlhbnQ6ICR7Zm9udC52YXJpYW50fTtgICtcclxuICAgICAgICAgICBgZm9udC13ZWlnaHQ6ICR7Zm9udC53ZWlnaHR9O2AgK1xyXG4gICAgICAgICAgIGBmb250LXN0cmV0Y2g6ICR7Zm9udC5zdHJldGNofTtgICtcclxuICAgICAgICAgICBgZm9udC1zaXplOiAke2ZvbnQuc2l6ZX07YCArXHJcbiAgICAgICAgICAgYGZvbnQtZmFtaWx5OiAke2ZvbnQuZmFtaWx5fTtgICtcclxuICAgICAgICAgICBgbGluZS1oZWlnaHQ6ICR7Zm9udC5saW5lSGVpZ2h0fTtgICtcclxuICAgICAgICAgICBgJz4ke3N0cn08L3NwYW4+YDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0cmluZ2lmaWVzIGFuIEhUTUwgc3VidHJlZSBkZWZpbmVkIGJ5IHRoZSBnaXZlbiBlbGVtZW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgaGltYWxheWFFbGVtZW50VG9TdHJpbmcoIGVsZW1lbnQ6IEhpbWFsYXlhTm9kZSwgaXNMVFI6IGJvb2xlYW4gKTogc3RyaW5nIHtcclxuICAgIGlmICggaXNIaW1hbGF5YVRleHROb2RlKCBlbGVtZW50ICkgKSB7XHJcbiAgICAgIHJldHVybiBSaWNoVGV4dC5jb250ZW50VG9TdHJpbmcoIGVsZW1lbnQuY29udGVudCwgaXNMVFIgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBpc0hpbWFsYXlhRWxlbWVudE5vZGUoIGVsZW1lbnQgKSApIHtcclxuICAgICAgY29uc3QgZGlyQXR0cmlidXRlU3RyaW5nID0gUmljaFRleHRVdGlscy5oaW1hbGF5YUdldEF0dHJpYnV0ZSggJ2RpcicsIGVsZW1lbnQgKTtcclxuXHJcbiAgICAgIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnc3BhbicgJiYgZGlyQXR0cmlidXRlU3RyaW5nICkge1xyXG4gICAgICAgIGlzTFRSID0gZGlyQXR0cmlidXRlU3RyaW5nID09PSAnbHRyJztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUHJvY2VzcyBjaGlsZHJlblxyXG4gICAgICByZXR1cm4gZWxlbWVudC5jaGlsZHJlbi5tYXAoIGNoaWxkID0+IFJpY2hUZXh0LmhpbWFsYXlhRWxlbWVudFRvU3RyaW5nKCBjaGlsZCwgaXNMVFIgKSApLmpvaW4oICcnICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RyaW5naWZpZXMgYW4gSFRNTCBzdWJ0cmVlIGRlZmluZWQgYnkgdGhlIGdpdmVuIGVsZW1lbnQsIGJ1dCByZW1vdmluZyBjZXJ0YWluIHRhZ3MgdGhhdCB3ZSBkb24ndCBuZWVkIGZvclxyXG4gICAqIGFjY2Vzc2liaWxpdHkgKGxpa2UgPGE+LCA8c3Bhbj4sIGV0Yy4pLCBhbmQgYWRkaW5nIGluIHRhZ3Mgd2UgZG8gd2FudCAoc2VlIEFDQ0VTU0lCTEVfVEFHUykuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBoaW1hbGF5YUVsZW1lbnRUb0FjY2Vzc2libGVTdHJpbmcoIGVsZW1lbnQ6IEhpbWFsYXlhTm9kZSwgaXNMVFI6IGJvb2xlYW4gKTogc3RyaW5nIHtcclxuICAgIGlmICggaXNIaW1hbGF5YVRleHROb2RlKCBlbGVtZW50ICkgKSB7XHJcbiAgICAgIHJldHVybiBSaWNoVGV4dC5jb250ZW50VG9TdHJpbmcoIGVsZW1lbnQuY29udGVudCwgaXNMVFIgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBpc0hpbWFsYXlhRWxlbWVudE5vZGUoIGVsZW1lbnQgKSApIHtcclxuICAgICAgY29uc3QgZGlyQXR0cmlidXRlID0gUmljaFRleHRVdGlscy5oaW1hbGF5YUdldEF0dHJpYnV0ZSggJ2RpcicsIGVsZW1lbnQgKTtcclxuXHJcbiAgICAgIGlmICggZWxlbWVudC50YWdOYW1lID09PSAnc3BhbicgJiYgZGlyQXR0cmlidXRlICkge1xyXG4gICAgICAgIGlzTFRSID0gZGlyQXR0cmlidXRlID09PSAnbHRyJztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUHJvY2VzcyBjaGlsZHJlblxyXG4gICAgICBjb25zdCBjb250ZW50ID0gZWxlbWVudC5jaGlsZHJlbi5tYXAoIGNoaWxkID0+IFJpY2hUZXh0LmhpbWFsYXlhRWxlbWVudFRvQWNjZXNzaWJsZVN0cmluZyggY2hpbGQsIGlzTFRSICkgKS5qb2luKCAnJyApO1xyXG5cclxuICAgICAgaWYgKCBfLmluY2x1ZGVzKCBBQ0NFU1NJQkxFX1RBR1MsIGVsZW1lbnQudGFnTmFtZSApICkge1xyXG4gICAgICAgIHJldHVybiBgPCR7ZWxlbWVudC50YWdOYW1lfT4ke2NvbnRlbnR9PC8ke2VsZW1lbnQudGFnTmFtZX0+YDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gY29udGVudDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRha2VzIHRoZSBlbGVtZW50LmNvbnRlbnQgZnJvbSBoaW1hbGF5YSwgdW5lc2NhcGVzIEhUTUwgZW50aXRpZXMsIGFuZCBhcHBsaWVzIHRoZSBwcm9wZXIgZGlyZWN0aW9uYWwgdGFncy5cclxuICAgKlxyXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy8zMTVcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGNvbnRlbnRUb1N0cmluZyggY29udGVudDogc3RyaW5nLCBpc0xUUjogYm9vbGVhbiApOiBzdHJpbmcge1xyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIHdlIHNob3VsZCBnZXQgYSBzdHJpbmcgZnJvbSB0aGlzXHJcbiAgICBjb25zdCB1bmVzY2FwZWRDb250ZW50OiBzdHJpbmcgPSBoZS5kZWNvZGUoIGNvbnRlbnQgKTtcclxuICAgIHJldHVybiBpc0xUUiA/ICggYFxcdTIwMmEke3VuZXNjYXBlZENvbnRlbnR9XFx1MjAyY2AgKSA6ICggYFxcdTIwMmIke3VuZXNjYXBlZENvbnRlbnR9XFx1MjAyY2AgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgUmljaFRleHRJTzogSU9UeXBlO1xyXG59XHJcblxyXG4vKipcclxuICoge0FycmF5LjxzdHJpbmc+fSAtIFN0cmluZyBrZXlzIGZvciBhbGwgdGhlIGFsbG93ZWQgb3B0aW9ucyB0aGF0IHdpbGwgYmUgc2V0IGJ5IG5vZGUubXV0YXRlKCBvcHRpb25zICksIGluIHRoZVxyXG4gKiBvcmRlciB0aGV5IHdpbGwgYmUgZXZhbHVhdGVkIGluLlxyXG4gKlxyXG4gKiBOT1RFOiBTZWUgTm9kZSdzIF9tdXRhdG9yS2V5cyBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGhvdyB0aGlzIG9wZXJhdGVzLCBhbmQgcG90ZW50aWFsIHNwZWNpYWxcclxuICogICAgICAgY2FzZXMgdGhhdCBtYXkgYXBwbHkuXHJcbiAqL1xyXG5SaWNoVGV4dC5wcm90b3R5cGUuX211dGF0b3JLZXlzID0gUklDSF9URVhUX09QVElPTl9LRVlTLmNvbmNhdCggTm9kZS5wcm90b3R5cGUuX211dGF0b3JLZXlzICk7XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnUmljaFRleHQnLCBSaWNoVGV4dCApO1xyXG5cclxuUmljaFRleHQuUmljaFRleHRJTyA9IG5ldyBJT1R5cGUoICdSaWNoVGV4dElPJywge1xyXG4gIHZhbHVlVHlwZTogUmljaFRleHQsXHJcbiAgc3VwZXJ0eXBlOiBOb2RlLk5vZGVJTyxcclxuICBkb2N1bWVudGF0aW9uOiAnVGhlIHRhbmRlbSBJTyBUeXBlIGZvciB0aGUgc2NlbmVyeSBSaWNoVGV4dCBub2RlJ1xyXG59ICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUlBLE9BQU9BLGNB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