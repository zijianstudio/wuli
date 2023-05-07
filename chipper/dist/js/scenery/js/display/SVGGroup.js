// Copyright 2014-2021, University of Colorado Boulder

/**
 * Poolable wrapper for SVG <group> elements. We store state and add listeners directly to the corresponding Node,
 * so that we can set dirty flags and smartly update only things that have changed. This takes a load off of SVGBlock.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import toSVGNumber from '../../../dot/js/toSVGNumber.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import Poolable from '../../../phet-core/js/Poolable.js';
import { scenery, svgns } from '../imports.js';
let globalId = 1;
class SVGGroup {
  /**
   * @mixes Poolable
   *
   * @param {SVGBlock} block
   * @param {Block} instance
   * @param {SVGGroup|null} parent
   */
  constructor(block, instance, parent) {
    // @public {string}
    this.id = `group${globalId++}`;
    this.initialize(block, instance, parent);
  }

  /**
   * @public
   *
   * @param {SVGBlock} block
   * @param {Block} instance
   * @param {SVGGroup|null} parent
   */
  initialize(block, instance, parent) {
    //OHTWO TODO: add collapsing groups! they can't have self drawables, transforms, filters, etc., and we probably shouldn't de-collapse groups

    sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`initializing ${this.toString()}`);

    // @public {SVGBlock|null} - Set to null when we're disposing, checked by other code.
    this.block = block;

    // @public {Instance|null} - Set to null when we're disposed.
    this.instance = instance;

    // @public {Node|null} - Set to null when we're disposed
    this.node = instance.trail.lastNode();

    // @public {SVGGroup|null}
    this.parent = parent;

    // @public {Array.<SVGGroup>}
    this.children = cleanArray(this.children);

    // @private {boolean}
    this.hasSelfDrawable = false;

    // @private {SVGSelfDrawable|null}
    this.selfDrawable = null;

    // @private {boolean} - general dirty flag (triggered on any other dirty event)
    this.dirty = true;

    // @private {boolean} - we won't listen for transform changes (or even want to set a transform) if our node is
    // beneath a transform root
    this.willApplyTransforms = this.block.transformRootInstance.trail.nodes.length < this.instance.trail.nodes.length;

    // @private {boolean} - we won't listen for filter changes (or set filters, like opacity or visibility) if our node
    // is beneath a filter root
    this.willApplyFilters = this.block.filterRootInstance.trail.nodes.length < this.instance.trail.nodes.length;

    // transform handling
    this.transformDirty = true;
    this.hasTransform = this.hasTransform !== undefined ? this.hasTransform : false; // persists across disposal
    this.transformDirtyListener = this.transformDirtyListener || this.markTransformDirty.bind(this);
    if (this.willApplyTransforms) {
      this.node.transformEmitter.addListener(this.transformDirtyListener);
    }

    // @private {boolean}
    this.filterDirty = true;
    this.visibilityDirty = true;
    this.clipDirty = true;

    // @private {SVGFilterElement|null} - lazily created
    this.filterElement = this.filterElement || null;

    // @private {boolean} - Whether we have an opacity attribute set on our SVG element (persists across disposal)
    this.hasOpacity = this.hasOpacity !== undefined ? this.hasOpacity : false;

    // @private {boolean} - Whether we have a filter element connected to our block (and that is being used with a filter
    // attribute). Since this needs to be cleaned up when we are disposed, this will be set to false when disposed
    // (with the associated attribute and defs reference cleaned up).
    this.hasFilter = false;
    this.clipDefinition = this.clipDefinition !== undefined ? this.clipDefinition : null; // persists across disposal
    this.clipPath = this.clipPath !== undefined ? this.clipPath : null; // persists across disposal
    this.filterChangeListener = this.filterChangeListener || this.onFilterChange.bind(this);
    this.visibilityDirtyListener = this.visibilityDirtyListener || this.onVisibleChange.bind(this);
    this.clipDirtyListener = this.clipDirtyListener || this.onClipChange.bind(this);
    this.node.visibleProperty.lazyLink(this.visibilityDirtyListener);
    if (this.willApplyFilters) {
      this.node.filterChangeEmitter.addListener(this.filterChangeListener);
    }
    //OHTWO TODO: remove clip workaround
    this.node.clipAreaProperty.lazyLink(this.clipDirtyListener);

    // for tracking the order of child groups, we use a flag and update (reorder) once per updateDisplay if necessary.
    this.orderDirty = true;
    this.orderDirtyListener = this.orderDirtyListener || this.markOrderDirty.bind(this);
    this.node.childrenChangedEmitter.addListener(this.orderDirtyListener);
    if (!this.svgGroup) {
      this.svgGroup = document.createElementNS(svgns, 'g');
    }
    this.instance.addSVGGroup(this);
    this.block.markDirtyGroup(this); // so we are marked and updated properly
  }

  /**
   * @private
   *
   * @param {SelfDrawable} drawable
   */
  addSelfDrawable(drawable) {
    this.selfDrawable = drawable;
    this.svgGroup.insertBefore(drawable.svgElement, this.children.length ? this.children[0].svgGroup : null);
    this.hasSelfDrawable = true;
  }

  /**
   * @private
   *
   * @param {SelfDrawable} drawable
   */
  removeSelfDrawable(drawable) {
    this.hasSelfDrawable = false;
    this.svgGroup.removeChild(drawable.svgElement);
    this.selfDrawable = null;
  }

  /**
   * @private
   *
   * @param {SVGGroup} group
   */
  addChildGroup(group) {
    this.markOrderDirty();
    group.parent = this;
    this.children.push(group);
    this.svgGroup.appendChild(group.svgGroup);
  }

  /**
   * @private
   *
   * @param {SVGGroup} group
   */
  removeChildGroup(group) {
    this.markOrderDirty();
    group.parent = null;
    this.children.splice(_.indexOf(this.children, group), 1);
    this.svgGroup.removeChild(group.svgGroup);
  }

  /**
   * @public
   */
  markDirty() {
    if (!this.dirty) {
      this.dirty = true;
      this.block.markDirtyGroup(this);
    }
  }

  /**
   * @public
   */
  markOrderDirty() {
    if (!this.orderDirty) {
      this.orderDirty = true;
      this.markDirty();
    }
  }

  /**
   * @public
   */
  markTransformDirty() {
    if (!this.transformDirty) {
      this.transformDirty = true;
      this.markDirty();
    }
  }

  /**
   * @private
   */
  onFilterChange() {
    if (!this.filterDirty) {
      this.filterDirty = true;
      this.markDirty();
    }
  }

  /**
   * @private
   */
  onVisibleChange() {
    if (!this.visibilityDirty) {
      this.visibilityDirty = true;
      this.markDirty();
    }
  }

  /**
   * @private
   */
  onClipChange() {
    if (!this.clipDirty) {
      this.clipDirty = true;
      this.markDirty();
    }
  }

  /**
   * @public
   */
  update() {
    sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`update: ${this.toString()}`);

    // we may have been disposed since being marked dirty on our block. we won't have a reference if we are disposed
    if (!this.block) {
      return;
    }
    sceneryLog && sceneryLog.SVGGroup && sceneryLog.push();
    const svgGroup = this.svgGroup;
    this.dirty = false;
    if (this.transformDirty) {
      this.transformDirty = false;
      sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`transform update: ${this.toString()}`);
      if (this.willApplyTransforms) {
        const isIdentity = this.node.transform.isIdentity();
        if (!isIdentity) {
          this.hasTransform = true;
          svgGroup.setAttribute('transform', this.node.transform.getMatrix().getSVGTransform());
        } else if (this.hasTransform) {
          this.hasTransform = false;
          svgGroup.removeAttribute('transform');
        }
      } else {
        // we want no transforms if we won't be applying transforms
        if (this.hasTransform) {
          this.hasTransform = false;
          svgGroup.removeAttribute('transform');
        }
      }
    }
    if (this.visibilityDirty) {
      this.visibilityDirty = false;
      sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`visibility update: ${this.toString()}`);
      svgGroup.style.display = this.node.isVisible() ? '' : 'none';
    }

    // TODO: Check if we can leave opacity separate. If it gets applied "after" then we can have them separate
    if (this.filterDirty) {
      this.filterDirty = false;
      sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`filter update: ${this.toString()}`);
      const opacity = this.node.effectiveOpacity;
      if (this.willApplyFilters && opacity !== 1) {
        this.hasOpacity = true;
        svgGroup.setAttribute('opacity', opacity);
      } else if (this.hasOpacity) {
        this.hasOpacity = false;
        svgGroup.removeAttribute('opacity');
      }
      const needsFilter = this.willApplyFilters && this.node._filters.length;
      const filterId = `filter-${this.id}`;
      if (needsFilter) {
        // Lazy creation of the filter element (if we haven't already)
        if (!this.filterElement) {
          this.filterElement = document.createElementNS(svgns, 'filter');
          this.filterElement.setAttribute('id', filterId);
        }

        // Remove all children of the filter element if we're applying filters (if not, we won't have it attached)
        while (this.filterElement.firstChild) {
          this.filterElement.removeChild(this.filterElement.lastChild);
        }

        // Fill in elements into our filter
        let filterRegionPercentageIncrease = 50;
        let inName = 'SourceGraphic';
        const length = this.node._filters.length;
        for (let i = 0; i < length; i++) {
          const filter = this.node._filters[i];
          const resultName = i === length - 1 ? undefined : `e${i}`; // Last result should be undefined
          filter.applySVGFilter(this.filterElement, inName, resultName);
          filterRegionPercentageIncrease += filter.filterRegionPercentageIncrease;
          inName = resultName;
        }

        // Bleh, no good way to handle the filter region? https://drafts.fxtf.org/filter-effects/#filter-region
        // If we WANT to track things by their actual display size AND pad pixels, AND copy tons of things... we could
        // potentially use the userSpaceOnUse and pad the proper number of pixels. That sounds like an absolute pain, AND
        // a performance drain and abstraction break.
        const min = `-${toSVGNumber(filterRegionPercentageIncrease)}%`;
        const size = `${toSVGNumber(2 * filterRegionPercentageIncrease + 100)}%`;
        this.filterElement.setAttribute('x', min);
        this.filterElement.setAttribute('y', min);
        this.filterElement.setAttribute('width', size);
        this.filterElement.setAttribute('height', size);
      }
      if (needsFilter) {
        if (!this.hasFilter) {
          this.block.defs.appendChild(this.filterElement);
        }
        svgGroup.setAttribute('filter', `url(#${filterId})`);
        this.hasFilter = true;
      }
      if (this.hasFilter && !needsFilter) {
        svgGroup.removeAttribute('filter');
        this.hasFilter = false;
        this.block.defs.removeChild(this.filterElement);
      }
    }
    if (this.clipDirty) {
      this.clipDirty = false;
      sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`clip update: ${this.toString()}`);

      //OHTWO TODO: remove clip workaround (use this.willApplyFilters)
      if (this.node.clipArea) {
        if (!this.clipDefinition) {
          const clipId = `clip${this.node.getId()}`;
          this.clipDefinition = document.createElementNS(svgns, 'clipPath');
          this.clipDefinition.setAttribute('id', clipId);
          this.clipDefinition.setAttribute('clipPathUnits', 'userSpaceOnUse');
          this.block.defs.appendChild(this.clipDefinition); // TODO: method? evaluate with future usage of defs (not done yet)

          this.clipPath = document.createElementNS(svgns, 'path');
          this.clipDefinition.appendChild(this.clipPath);
          svgGroup.setAttribute('clip-path', `url(#${clipId})`);
        }
        this.clipPath.setAttribute('d', this.node.clipArea.getSVGPath());
      } else if (this.clipDefinition) {
        svgGroup.removeAttribute('clip-path');
        this.block.defs.removeChild(this.clipDefinition); // TODO: method? evaluate with future usage of defs (not done yet)

        // TODO: consider pooling these?
        this.clipDefinition = null;
        this.clipPath = null;
      }
    }
    if (this.orderDirty) {
      this.orderDirty = false;
      sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`order update: ${this.toString()}`);
      sceneryLog && sceneryLog.SVGGroup && sceneryLog.push();

      // our instance should have the proper order of children. we check that way.
      let idx = this.children.length - 1;
      const instanceChildren = this.instance.children;
      // iterate backwards, since DOM's insertBefore makes forward iteration more complicated (no insertAfter)
      for (let i = instanceChildren.length - 1; i >= 0; i--) {
        const group = instanceChildren[i].lookupSVGGroup(this.block);
        if (group) {
          // ensure that the spot in our array (and in the DOM) at [idx] is correct
          if (this.children[idx] !== group) {
            // out of order, rearrange
            sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`group out of order: ${idx} for ${group.toString()}`);

            // in the DOM first (since we reference the children array to know what to insertBefore)
            // see http://stackoverflow.com/questions/9732624/how-to-swap-dom-child-nodes-in-javascript
            svgGroup.insertBefore(group.svgGroup, idx + 1 >= this.children.length ? null : this.children[idx + 1].svgGroup);

            // then in our children array
            const oldIndex = _.indexOf(this.children, group);
            assert && assert(oldIndex < idx, 'The item we are moving backwards to location [idx] should not have an index greater than that');
            this.children.splice(oldIndex, 1);
            this.children.splice(idx, 0, group);
          } else {
            sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`group in place: ${idx} for ${group.toString()}`);
          }

          // if there was a group for that instance, we move on to the next spot
          idx--;
        }
      }
      sceneryLog && sceneryLog.SVGGroup && sceneryLog.pop();
    }
    sceneryLog && sceneryLog.SVGGroup && sceneryLog.pop();
  }

  /**
   * @private
   *
   * @returns {boolean}
   */
  isReleasable() {
    // if we have no parent, we are the rootGroup (the block is responsible for disposing that one)
    return !this.hasSelfDrawable && !this.children.length && this.parent;
  }

  /**
   * Releases references
   * @public
   */
  dispose() {
    sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`dispose ${this.toString()}`);
    sceneryLog && sceneryLog.SVGGroup && sceneryLog.push();
    assert && assert(this.children.length === 0, 'Should be empty by now');
    if (this.hasFilter) {
      this.svgGroup.removeAttribute('filter');
      this.hasFilter = false;
      this.block.defs.removeChild(this.filterElement);
    }
    if (this.willApplyTransforms) {
      this.node.transformEmitter.removeListener(this.transformDirtyListener);
    }
    this.node.visibleProperty.unlink(this.visibilityDirtyListener);
    if (this.willApplyFilters) {
      this.node.filterChangeEmitter.removeListener(this.filterChangeListener);
    }
    //OHTWO TODO: remove clip workaround
    this.node.clipAreaProperty.unlink(this.clipDirtyListener);
    this.node.childrenChangedEmitter.removeListener(this.orderDirtyListener);

    // if our Instance has been disposed, it has already had the reference removed
    if (this.instance.active) {
      this.instance.removeSVGGroup(this);
    }

    // remove clipping, since it is defs-based (and we want to keep our defs block clean - could be another layer!)
    if (this.clipDefinition) {
      this.svgGroup.removeAttribute('clip-path');
      this.block.defs.removeChild(this.clipDefinition);
      this.clipDefinition = null;
      this.clipPath = null;
    }

    // clear references
    this.parent = null;
    this.block = null;
    this.instance = null;
    this.node = null;
    cleanArray(this.children);
    this.selfDrawable = null;

    // for now
    this.freeToPool();
    sceneryLog && sceneryLog.SVGGroup && sceneryLog.pop();
  }

  /**
   * Returns a string form of this object
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `SVGGroup:${this.block.toString()}_${this.instance.toString()}`;
  }

  /**
   * @public
   *
   * @param {SVGBlock} block
   * @param {Drawable} drawable
   */
  static addDrawable(block, drawable) {
    assert && assert(drawable.instance, 'Instance is required for a drawable to be grouped correctly in SVG');
    const group = SVGGroup.ensureGroupsToInstance(block, drawable.instance);
    group.addSelfDrawable(drawable);
  }

  /**
   * @public
   *
   * @param {SVGBlock} block
   * @param {Drawable} drawable
   */
  static removeDrawable(block, drawable) {
    drawable.instance.lookupSVGGroup(block).removeSelfDrawable(drawable);
    SVGGroup.releaseGroupsToInstance(block, drawable.instance);
  }

  /**
   * @private
   *
   * @param {SVGBlock} block
   * @param {Instance} instance
   * @returns {SVGGroup}
   */
  static ensureGroupsToInstance(block, instance) {
    // TODO: assertions here

    let group = instance.lookupSVGGroup(block);
    if (!group) {
      assert && assert(instance !== block.rootGroup.instance, 'Making sure we do not walk past our rootGroup');
      const parentGroup = SVGGroup.ensureGroupsToInstance(block, instance.parent);
      group = SVGGroup.createFromPool(block, instance, parentGroup);
      parentGroup.addChildGroup(group);
    }
    return group;
  }

  /**
   * @private
   *
   * @param {SVGBlock} block
   * @param {Instance} instance
   */
  static releaseGroupsToInstance(block, instance) {
    const group = instance.lookupSVGGroup(block);
    if (group.isReleasable()) {
      const parentGroup = group.parent;
      parentGroup.removeChildGroup(group);
      SVGGroup.releaseGroupsToInstance(block, parentGroup.instance);
      group.dispose();
    }
  }
}
scenery.register('SVGGroup', SVGGroup);
Poolable.mixInto(SVGGroup);
export default SVGGroup;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0b1NWR051bWJlciIsImNsZWFuQXJyYXkiLCJQb29sYWJsZSIsInNjZW5lcnkiLCJzdmducyIsImdsb2JhbElkIiwiU1ZHR3JvdXAiLCJjb25zdHJ1Y3RvciIsImJsb2NrIiwiaW5zdGFuY2UiLCJwYXJlbnQiLCJpZCIsImluaXRpYWxpemUiLCJzY2VuZXJ5TG9nIiwidG9TdHJpbmciLCJub2RlIiwidHJhaWwiLCJsYXN0Tm9kZSIsImNoaWxkcmVuIiwiaGFzU2VsZkRyYXdhYmxlIiwic2VsZkRyYXdhYmxlIiwiZGlydHkiLCJ3aWxsQXBwbHlUcmFuc2Zvcm1zIiwidHJhbnNmb3JtUm9vdEluc3RhbmNlIiwibm9kZXMiLCJsZW5ndGgiLCJ3aWxsQXBwbHlGaWx0ZXJzIiwiZmlsdGVyUm9vdEluc3RhbmNlIiwidHJhbnNmb3JtRGlydHkiLCJoYXNUcmFuc2Zvcm0iLCJ1bmRlZmluZWQiLCJ0cmFuc2Zvcm1EaXJ0eUxpc3RlbmVyIiwibWFya1RyYW5zZm9ybURpcnR5IiwiYmluZCIsInRyYW5zZm9ybUVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImZpbHRlckRpcnR5IiwidmlzaWJpbGl0eURpcnR5IiwiY2xpcERpcnR5IiwiZmlsdGVyRWxlbWVudCIsImhhc09wYWNpdHkiLCJoYXNGaWx0ZXIiLCJjbGlwRGVmaW5pdGlvbiIsImNsaXBQYXRoIiwiZmlsdGVyQ2hhbmdlTGlzdGVuZXIiLCJvbkZpbHRlckNoYW5nZSIsInZpc2liaWxpdHlEaXJ0eUxpc3RlbmVyIiwib25WaXNpYmxlQ2hhbmdlIiwiY2xpcERpcnR5TGlzdGVuZXIiLCJvbkNsaXBDaGFuZ2UiLCJ2aXNpYmxlUHJvcGVydHkiLCJsYXp5TGluayIsImZpbHRlckNoYW5nZUVtaXR0ZXIiLCJjbGlwQXJlYVByb3BlcnR5Iiwib3JkZXJEaXJ0eSIsIm9yZGVyRGlydHlMaXN0ZW5lciIsIm1hcmtPcmRlckRpcnR5IiwiY2hpbGRyZW5DaGFuZ2VkRW1pdHRlciIsInN2Z0dyb3VwIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50TlMiLCJhZGRTVkdHcm91cCIsIm1hcmtEaXJ0eUdyb3VwIiwiYWRkU2VsZkRyYXdhYmxlIiwiZHJhd2FibGUiLCJpbnNlcnRCZWZvcmUiLCJzdmdFbGVtZW50IiwicmVtb3ZlU2VsZkRyYXdhYmxlIiwicmVtb3ZlQ2hpbGQiLCJhZGRDaGlsZEdyb3VwIiwiZ3JvdXAiLCJwdXNoIiwiYXBwZW5kQ2hpbGQiLCJyZW1vdmVDaGlsZEdyb3VwIiwic3BsaWNlIiwiXyIsImluZGV4T2YiLCJtYXJrRGlydHkiLCJ1cGRhdGUiLCJpc0lkZW50aXR5IiwidHJhbnNmb3JtIiwic2V0QXR0cmlidXRlIiwiZ2V0TWF0cml4IiwiZ2V0U1ZHVHJhbnNmb3JtIiwicmVtb3ZlQXR0cmlidXRlIiwic3R5bGUiLCJkaXNwbGF5IiwiaXNWaXNpYmxlIiwib3BhY2l0eSIsImVmZmVjdGl2ZU9wYWNpdHkiLCJuZWVkc0ZpbHRlciIsIl9maWx0ZXJzIiwiZmlsdGVySWQiLCJmaXJzdENoaWxkIiwibGFzdENoaWxkIiwiZmlsdGVyUmVnaW9uUGVyY2VudGFnZUluY3JlYXNlIiwiaW5OYW1lIiwiaSIsImZpbHRlciIsInJlc3VsdE5hbWUiLCJhcHBseVNWR0ZpbHRlciIsIm1pbiIsInNpemUiLCJkZWZzIiwiY2xpcEFyZWEiLCJjbGlwSWQiLCJnZXRJZCIsImdldFNWR1BhdGgiLCJpZHgiLCJpbnN0YW5jZUNoaWxkcmVuIiwibG9va3VwU1ZHR3JvdXAiLCJvbGRJbmRleCIsImFzc2VydCIsInBvcCIsImlzUmVsZWFzYWJsZSIsImRpc3Bvc2UiLCJyZW1vdmVMaXN0ZW5lciIsInVubGluayIsImFjdGl2ZSIsInJlbW92ZVNWR0dyb3VwIiwiZnJlZVRvUG9vbCIsImFkZERyYXdhYmxlIiwiZW5zdXJlR3JvdXBzVG9JbnN0YW5jZSIsInJlbW92ZURyYXdhYmxlIiwicmVsZWFzZUdyb3Vwc1RvSW5zdGFuY2UiLCJyb290R3JvdXAiLCJwYXJlbnRHcm91cCIsImNyZWF0ZUZyb21Qb29sIiwicmVnaXN0ZXIiLCJtaXhJbnRvIl0sInNvdXJjZXMiOlsiU1ZHR3JvdXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUG9vbGFibGUgd3JhcHBlciBmb3IgU1ZHIDxncm91cD4gZWxlbWVudHMuIFdlIHN0b3JlIHN0YXRlIGFuZCBhZGQgbGlzdGVuZXJzIGRpcmVjdGx5IHRvIHRoZSBjb3JyZXNwb25kaW5nIE5vZGUsXHJcbiAqIHNvIHRoYXQgd2UgY2FuIHNldCBkaXJ0eSBmbGFncyBhbmQgc21hcnRseSB1cGRhdGUgb25seSB0aGluZ3MgdGhhdCBoYXZlIGNoYW5nZWQuIFRoaXMgdGFrZXMgYSBsb2FkIG9mZiBvZiBTVkdCbG9jay5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCB0b1NWR051bWJlciBmcm9tICcuLi8uLi8uLi9kb3QvanMvdG9TVkdOdW1iZXIuanMnO1xyXG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XHJcbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xyXG5pbXBvcnQgeyBzY2VuZXJ5LCBzdmducyB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5cclxubGV0IGdsb2JhbElkID0gMTtcclxuXHJcbmNsYXNzIFNWR0dyb3VwIHtcclxuICAvKipcclxuICAgKiBAbWl4ZXMgUG9vbGFibGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U1ZHQmxvY2t9IGJsb2NrXHJcbiAgICogQHBhcmFtIHtCbG9ja30gaW5zdGFuY2VcclxuICAgKiBAcGFyYW0ge1NWR0dyb3VwfG51bGx9IHBhcmVudFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBibG9jaywgaW5zdGFuY2UsIHBhcmVudCApIHtcclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ31cclxuICAgIHRoaXMuaWQgPSBgZ3JvdXAke2dsb2JhbElkKyt9YDtcclxuXHJcbiAgICB0aGlzLmluaXRpYWxpemUoIGJsb2NrLCBpbnN0YW5jZSwgcGFyZW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NWR0Jsb2NrfSBibG9ja1xyXG4gICAqIEBwYXJhbSB7QmxvY2t9IGluc3RhbmNlXHJcbiAgICogQHBhcmFtIHtTVkdHcm91cHxudWxsfSBwYXJlbnRcclxuICAgKi9cclxuICBpbml0aWFsaXplKCBibG9jaywgaW5zdGFuY2UsIHBhcmVudCApIHtcclxuICAgIC8vT0hUV08gVE9ETzogYWRkIGNvbGxhcHNpbmcgZ3JvdXBzISB0aGV5IGNhbid0IGhhdmUgc2VsZiBkcmF3YWJsZXMsIHRyYW5zZm9ybXMsIGZpbHRlcnMsIGV0Yy4sIGFuZCB3ZSBwcm9iYWJseSBzaG91bGRuJ3QgZGUtY29sbGFwc2UgZ3JvdXBzXHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNWR0dyb3VwICYmIHNjZW5lcnlMb2cuU1ZHR3JvdXAoIGBpbml0aWFsaXppbmcgJHt0aGlzLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1NWR0Jsb2NrfG51bGx9IC0gU2V0IHRvIG51bGwgd2hlbiB3ZSdyZSBkaXNwb3NpbmcsIGNoZWNrZWQgYnkgb3RoZXIgY29kZS5cclxuICAgIHRoaXMuYmxvY2sgPSBibG9jaztcclxuXHJcbiAgICAvLyBAcHVibGljIHtJbnN0YW5jZXxudWxsfSAtIFNldCB0byBudWxsIHdoZW4gd2UncmUgZGlzcG9zZWQuXHJcbiAgICB0aGlzLmluc3RhbmNlID0gaW5zdGFuY2U7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Tm9kZXxudWxsfSAtIFNldCB0byBudWxsIHdoZW4gd2UncmUgZGlzcG9zZWRcclxuICAgIHRoaXMubm9kZSA9IGluc3RhbmNlLnRyYWlsLmxhc3ROb2RlKCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7U1ZHR3JvdXB8bnVsbH1cclxuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxTVkdHcm91cD59XHJcbiAgICB0aGlzLmNoaWxkcmVuID0gY2xlYW5BcnJheSggdGhpcy5jaGlsZHJlbiApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufVxyXG4gICAgdGhpcy5oYXNTZWxmRHJhd2FibGUgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7U1ZHU2VsZkRyYXdhYmxlfG51bGx9XHJcbiAgICB0aGlzLnNlbGZEcmF3YWJsZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gZ2VuZXJhbCBkaXJ0eSBmbGFnICh0cmlnZ2VyZWQgb24gYW55IG90aGVyIGRpcnR5IGV2ZW50KVxyXG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gd2Ugd29uJ3QgbGlzdGVuIGZvciB0cmFuc2Zvcm0gY2hhbmdlcyAob3IgZXZlbiB3YW50IHRvIHNldCBhIHRyYW5zZm9ybSkgaWYgb3VyIG5vZGUgaXNcclxuICAgIC8vIGJlbmVhdGggYSB0cmFuc2Zvcm0gcm9vdFxyXG4gICAgdGhpcy53aWxsQXBwbHlUcmFuc2Zvcm1zID0gdGhpcy5ibG9jay50cmFuc2Zvcm1Sb290SW5zdGFuY2UudHJhaWwubm9kZXMubGVuZ3RoIDwgdGhpcy5pbnN0YW5jZS50cmFpbC5ub2Rlcy5sZW5ndGg7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gd2Ugd29uJ3QgbGlzdGVuIGZvciBmaWx0ZXIgY2hhbmdlcyAob3Igc2V0IGZpbHRlcnMsIGxpa2Ugb3BhY2l0eSBvciB2aXNpYmlsaXR5KSBpZiBvdXIgbm9kZVxyXG4gICAgLy8gaXMgYmVuZWF0aCBhIGZpbHRlciByb290XHJcbiAgICB0aGlzLndpbGxBcHBseUZpbHRlcnMgPSB0aGlzLmJsb2NrLmZpbHRlclJvb3RJbnN0YW5jZS50cmFpbC5ub2Rlcy5sZW5ndGggPCB0aGlzLmluc3RhbmNlLnRyYWlsLm5vZGVzLmxlbmd0aDtcclxuXHJcbiAgICAvLyB0cmFuc2Zvcm0gaGFuZGxpbmdcclxuICAgIHRoaXMudHJhbnNmb3JtRGlydHkgPSB0cnVlO1xyXG4gICAgdGhpcy5oYXNUcmFuc2Zvcm0gPSB0aGlzLmhhc1RyYW5zZm9ybSAhPT0gdW5kZWZpbmVkID8gdGhpcy5oYXNUcmFuc2Zvcm0gOiBmYWxzZTsgLy8gcGVyc2lzdHMgYWNyb3NzIGRpc3Bvc2FsXHJcbiAgICB0aGlzLnRyYW5zZm9ybURpcnR5TGlzdGVuZXIgPSB0aGlzLnRyYW5zZm9ybURpcnR5TGlzdGVuZXIgfHwgdGhpcy5tYXJrVHJhbnNmb3JtRGlydHkuYmluZCggdGhpcyApO1xyXG4gICAgaWYgKCB0aGlzLndpbGxBcHBseVRyYW5zZm9ybXMgKSB7XHJcbiAgICAgIHRoaXMubm9kZS50cmFuc2Zvcm1FbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLnRyYW5zZm9ybURpcnR5TGlzdGVuZXIgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn1cclxuICAgIHRoaXMuZmlsdGVyRGlydHkgPSB0cnVlO1xyXG4gICAgdGhpcy52aXNpYmlsaXR5RGlydHkgPSB0cnVlO1xyXG4gICAgdGhpcy5jbGlwRGlydHkgPSB0cnVlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtTVkdGaWx0ZXJFbGVtZW50fG51bGx9IC0gbGF6aWx5IGNyZWF0ZWRcclxuICAgIHRoaXMuZmlsdGVyRWxlbWVudCA9IHRoaXMuZmlsdGVyRWxlbWVudCB8fCBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufSAtIFdoZXRoZXIgd2UgaGF2ZSBhbiBvcGFjaXR5IGF0dHJpYnV0ZSBzZXQgb24gb3VyIFNWRyBlbGVtZW50IChwZXJzaXN0cyBhY3Jvc3MgZGlzcG9zYWwpXHJcbiAgICB0aGlzLmhhc09wYWNpdHkgPSB0aGlzLmhhc09wYWNpdHkgIT09IHVuZGVmaW5lZCA/IHRoaXMuaGFzT3BhY2l0eSA6IGZhbHNlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufSAtIFdoZXRoZXIgd2UgaGF2ZSBhIGZpbHRlciBlbGVtZW50IGNvbm5lY3RlZCB0byBvdXIgYmxvY2sgKGFuZCB0aGF0IGlzIGJlaW5nIHVzZWQgd2l0aCBhIGZpbHRlclxyXG4gICAgLy8gYXR0cmlidXRlKS4gU2luY2UgdGhpcyBuZWVkcyB0byBiZSBjbGVhbmVkIHVwIHdoZW4gd2UgYXJlIGRpc3Bvc2VkLCB0aGlzIHdpbGwgYmUgc2V0IHRvIGZhbHNlIHdoZW4gZGlzcG9zZWRcclxuICAgIC8vICh3aXRoIHRoZSBhc3NvY2lhdGVkIGF0dHJpYnV0ZSBhbmQgZGVmcyByZWZlcmVuY2UgY2xlYW5lZCB1cCkuXHJcbiAgICB0aGlzLmhhc0ZpbHRlciA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuY2xpcERlZmluaXRpb24gPSB0aGlzLmNsaXBEZWZpbml0aW9uICE9PSB1bmRlZmluZWQgPyB0aGlzLmNsaXBEZWZpbml0aW9uIDogbnVsbDsgLy8gcGVyc2lzdHMgYWNyb3NzIGRpc3Bvc2FsXHJcbiAgICB0aGlzLmNsaXBQYXRoID0gdGhpcy5jbGlwUGF0aCAhPT0gdW5kZWZpbmVkID8gdGhpcy5jbGlwUGF0aCA6IG51bGw7IC8vIHBlcnNpc3RzIGFjcm9zcyBkaXNwb3NhbFxyXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VMaXN0ZW5lciA9IHRoaXMuZmlsdGVyQ2hhbmdlTGlzdGVuZXIgfHwgdGhpcy5vbkZpbHRlckNoYW5nZS5iaW5kKCB0aGlzICk7XHJcbiAgICB0aGlzLnZpc2liaWxpdHlEaXJ0eUxpc3RlbmVyID0gdGhpcy52aXNpYmlsaXR5RGlydHlMaXN0ZW5lciB8fCB0aGlzLm9uVmlzaWJsZUNoYW5nZS5iaW5kKCB0aGlzICk7XHJcbiAgICB0aGlzLmNsaXBEaXJ0eUxpc3RlbmVyID0gdGhpcy5jbGlwRGlydHlMaXN0ZW5lciB8fCB0aGlzLm9uQ2xpcENoYW5nZS5iaW5kKCB0aGlzICk7XHJcbiAgICB0aGlzLm5vZGUudmlzaWJsZVByb3BlcnR5LmxhenlMaW5rKCB0aGlzLnZpc2liaWxpdHlEaXJ0eUxpc3RlbmVyICk7XHJcbiAgICBpZiAoIHRoaXMud2lsbEFwcGx5RmlsdGVycyApIHtcclxuICAgICAgdGhpcy5ub2RlLmZpbHRlckNoYW5nZUVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuZmlsdGVyQ2hhbmdlTGlzdGVuZXIgKTtcclxuICAgIH1cclxuICAgIC8vT0hUV08gVE9ETzogcmVtb3ZlIGNsaXAgd29ya2Fyb3VuZFxyXG4gICAgdGhpcy5ub2RlLmNsaXBBcmVhUHJvcGVydHkubGF6eUxpbmsoIHRoaXMuY2xpcERpcnR5TGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBmb3IgdHJhY2tpbmcgdGhlIG9yZGVyIG9mIGNoaWxkIGdyb3Vwcywgd2UgdXNlIGEgZmxhZyBhbmQgdXBkYXRlIChyZW9yZGVyKSBvbmNlIHBlciB1cGRhdGVEaXNwbGF5IGlmIG5lY2Vzc2FyeS5cclxuICAgIHRoaXMub3JkZXJEaXJ0eSA9IHRydWU7XHJcbiAgICB0aGlzLm9yZGVyRGlydHlMaXN0ZW5lciA9IHRoaXMub3JkZXJEaXJ0eUxpc3RlbmVyIHx8IHRoaXMubWFya09yZGVyRGlydHkuYmluZCggdGhpcyApO1xyXG4gICAgdGhpcy5ub2RlLmNoaWxkcmVuQ2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMub3JkZXJEaXJ0eUxpc3RlbmVyICk7XHJcblxyXG4gICAgaWYgKCAhdGhpcy5zdmdHcm91cCApIHtcclxuICAgICAgdGhpcy5zdmdHcm91cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggc3ZnbnMsICdnJyApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaW5zdGFuY2UuYWRkU1ZHR3JvdXAoIHRoaXMgKTtcclxuXHJcbiAgICB0aGlzLmJsb2NrLm1hcmtEaXJ0eUdyb3VwKCB0aGlzICk7IC8vIHNvIHdlIGFyZSBtYXJrZWQgYW5kIHVwZGF0ZWQgcHJvcGVybHlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NlbGZEcmF3YWJsZX0gZHJhd2FibGVcclxuICAgKi9cclxuICBhZGRTZWxmRHJhd2FibGUoIGRyYXdhYmxlICkge1xyXG4gICAgdGhpcy5zZWxmRHJhd2FibGUgPSBkcmF3YWJsZTtcclxuICAgIHRoaXMuc3ZnR3JvdXAuaW5zZXJ0QmVmb3JlKCBkcmF3YWJsZS5zdmdFbGVtZW50LCB0aGlzLmNoaWxkcmVuLmxlbmd0aCA/IHRoaXMuY2hpbGRyZW5bIDAgXS5zdmdHcm91cCA6IG51bGwgKTtcclxuICAgIHRoaXMuaGFzU2VsZkRyYXdhYmxlID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NlbGZEcmF3YWJsZX0gZHJhd2FibGVcclxuICAgKi9cclxuICByZW1vdmVTZWxmRHJhd2FibGUoIGRyYXdhYmxlICkge1xyXG4gICAgdGhpcy5oYXNTZWxmRHJhd2FibGUgPSBmYWxzZTtcclxuICAgIHRoaXMuc3ZnR3JvdXAucmVtb3ZlQ2hpbGQoIGRyYXdhYmxlLnN2Z0VsZW1lbnQgKTtcclxuICAgIHRoaXMuc2VsZkRyYXdhYmxlID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NWR0dyb3VwfSBncm91cFxyXG4gICAqL1xyXG4gIGFkZENoaWxkR3JvdXAoIGdyb3VwICkge1xyXG4gICAgdGhpcy5tYXJrT3JkZXJEaXJ0eSgpO1xyXG5cclxuICAgIGdyb3VwLnBhcmVudCA9IHRoaXM7XHJcbiAgICB0aGlzLmNoaWxkcmVuLnB1c2goIGdyb3VwICk7XHJcbiAgICB0aGlzLnN2Z0dyb3VwLmFwcGVuZENoaWxkKCBncm91cC5zdmdHcm91cCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U1ZHR3JvdXB9IGdyb3VwXHJcbiAgICovXHJcbiAgcmVtb3ZlQ2hpbGRHcm91cCggZ3JvdXAgKSB7XHJcbiAgICB0aGlzLm1hcmtPcmRlckRpcnR5KCk7XHJcblxyXG4gICAgZ3JvdXAucGFyZW50ID0gbnVsbDtcclxuICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKCBfLmluZGV4T2YoIHRoaXMuY2hpbGRyZW4sIGdyb3VwICksIDEgKTtcclxuICAgIHRoaXMuc3ZnR3JvdXAucmVtb3ZlQ2hpbGQoIGdyb3VwLnN2Z0dyb3VwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgbWFya0RpcnR5KCkge1xyXG4gICAgaWYgKCAhdGhpcy5kaXJ0eSApIHtcclxuICAgICAgdGhpcy5kaXJ0eSA9IHRydWU7XHJcblxyXG4gICAgICB0aGlzLmJsb2NrLm1hcmtEaXJ0eUdyb3VwKCB0aGlzICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgbWFya09yZGVyRGlydHkoKSB7XHJcbiAgICBpZiAoICF0aGlzLm9yZGVyRGlydHkgKSB7XHJcbiAgICAgIHRoaXMub3JkZXJEaXJ0eSA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya0RpcnR5KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgbWFya1RyYW5zZm9ybURpcnR5KCkge1xyXG4gICAgaWYgKCAhdGhpcy50cmFuc2Zvcm1EaXJ0eSApIHtcclxuICAgICAgdGhpcy50cmFuc2Zvcm1EaXJ0eSA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya0RpcnR5KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIG9uRmlsdGVyQ2hhbmdlKCkge1xyXG4gICAgaWYgKCAhdGhpcy5maWx0ZXJEaXJ0eSApIHtcclxuICAgICAgdGhpcy5maWx0ZXJEaXJ0eSA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya0RpcnR5KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIG9uVmlzaWJsZUNoYW5nZSgpIHtcclxuICAgIGlmICggIXRoaXMudmlzaWJpbGl0eURpcnR5ICkge1xyXG4gICAgICB0aGlzLnZpc2liaWxpdHlEaXJ0eSA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya0RpcnR5KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIG9uQ2xpcENoYW5nZSgpIHtcclxuICAgIGlmICggIXRoaXMuY2xpcERpcnR5ICkge1xyXG4gICAgICB0aGlzLmNsaXBEaXJ0eSA9IHRydWU7XHJcbiAgICAgIHRoaXMubWFya0RpcnR5KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNWR0dyb3VwICYmIHNjZW5lcnlMb2cuU1ZHR3JvdXAoIGB1cGRhdGU6ICR7dGhpcy50b1N0cmluZygpfWAgKTtcclxuXHJcbiAgICAvLyB3ZSBtYXkgaGF2ZSBiZWVuIGRpc3Bvc2VkIHNpbmNlIGJlaW5nIG1hcmtlZCBkaXJ0eSBvbiBvdXIgYmxvY2suIHdlIHdvbid0IGhhdmUgYSByZWZlcmVuY2UgaWYgd2UgYXJlIGRpc3Bvc2VkXHJcbiAgICBpZiAoICF0aGlzLmJsb2NrICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNWR0dyb3VwICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIGNvbnN0IHN2Z0dyb3VwID0gdGhpcy5zdmdHcm91cDtcclxuXHJcbiAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKCB0aGlzLnRyYW5zZm9ybURpcnR5ICkge1xyXG4gICAgICB0aGlzLnRyYW5zZm9ybURpcnR5ID0gZmFsc2U7XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU1ZHR3JvdXAgJiYgc2NlbmVyeUxvZy5TVkdHcm91cCggYHRyYW5zZm9ybSB1cGRhdGU6ICR7dGhpcy50b1N0cmluZygpfWAgKTtcclxuXHJcbiAgICAgIGlmICggdGhpcy53aWxsQXBwbHlUcmFuc2Zvcm1zICkge1xyXG5cclxuICAgICAgICBjb25zdCBpc0lkZW50aXR5ID0gdGhpcy5ub2RlLnRyYW5zZm9ybS5pc0lkZW50aXR5KCk7XHJcblxyXG4gICAgICAgIGlmICggIWlzSWRlbnRpdHkgKSB7XHJcbiAgICAgICAgICB0aGlzLmhhc1RyYW5zZm9ybSA9IHRydWU7XHJcbiAgICAgICAgICBzdmdHcm91cC5zZXRBdHRyaWJ1dGUoICd0cmFuc2Zvcm0nLCB0aGlzLm5vZGUudHJhbnNmb3JtLmdldE1hdHJpeCgpLmdldFNWR1RyYW5zZm9ybSgpICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCB0aGlzLmhhc1RyYW5zZm9ybSApIHtcclxuICAgICAgICAgIHRoaXMuaGFzVHJhbnNmb3JtID0gZmFsc2U7XHJcbiAgICAgICAgICBzdmdHcm91cC5yZW1vdmVBdHRyaWJ1dGUoICd0cmFuc2Zvcm0nICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIHdlIHdhbnQgbm8gdHJhbnNmb3JtcyBpZiB3ZSB3b24ndCBiZSBhcHBseWluZyB0cmFuc2Zvcm1zXHJcbiAgICAgICAgaWYgKCB0aGlzLmhhc1RyYW5zZm9ybSApIHtcclxuICAgICAgICAgIHRoaXMuaGFzVHJhbnNmb3JtID0gZmFsc2U7XHJcbiAgICAgICAgICBzdmdHcm91cC5yZW1vdmVBdHRyaWJ1dGUoICd0cmFuc2Zvcm0nICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLnZpc2liaWxpdHlEaXJ0eSApIHtcclxuICAgICAgdGhpcy52aXNpYmlsaXR5RGlydHkgPSBmYWxzZTtcclxuXHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TVkdHcm91cCAmJiBzY2VuZXJ5TG9nLlNWR0dyb3VwKCBgdmlzaWJpbGl0eSB1cGRhdGU6ICR7dGhpcy50b1N0cmluZygpfWAgKTtcclxuXHJcbiAgICAgIHN2Z0dyb3VwLnN0eWxlLmRpc3BsYXkgPSB0aGlzLm5vZGUuaXNWaXNpYmxlKCkgPyAnJyA6ICdub25lJztcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPOiBDaGVjayBpZiB3ZSBjYW4gbGVhdmUgb3BhY2l0eSBzZXBhcmF0ZS4gSWYgaXQgZ2V0cyBhcHBsaWVkIFwiYWZ0ZXJcIiB0aGVuIHdlIGNhbiBoYXZlIHRoZW0gc2VwYXJhdGVcclxuICAgIGlmICggdGhpcy5maWx0ZXJEaXJ0eSApIHtcclxuICAgICAgdGhpcy5maWx0ZXJEaXJ0eSA9IGZhbHNlO1xyXG5cclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNWR0dyb3VwICYmIHNjZW5lcnlMb2cuU1ZHR3JvdXAoIGBmaWx0ZXIgdXBkYXRlOiAke3RoaXMudG9TdHJpbmcoKX1gICk7XHJcblxyXG4gICAgICBjb25zdCBvcGFjaXR5ID0gdGhpcy5ub2RlLmVmZmVjdGl2ZU9wYWNpdHk7XHJcbiAgICAgIGlmICggdGhpcy53aWxsQXBwbHlGaWx0ZXJzICYmIG9wYWNpdHkgIT09IDEgKSB7XHJcbiAgICAgICAgdGhpcy5oYXNPcGFjaXR5ID0gdHJ1ZTtcclxuICAgICAgICBzdmdHcm91cC5zZXRBdHRyaWJ1dGUoICdvcGFjaXR5Jywgb3BhY2l0eSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB0aGlzLmhhc09wYWNpdHkgKSB7XHJcbiAgICAgICAgdGhpcy5oYXNPcGFjaXR5ID0gZmFsc2U7XHJcbiAgICAgICAgc3ZnR3JvdXAucmVtb3ZlQXR0cmlidXRlKCAnb3BhY2l0eScgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgbmVlZHNGaWx0ZXIgPSB0aGlzLndpbGxBcHBseUZpbHRlcnMgJiYgdGhpcy5ub2RlLl9maWx0ZXJzLmxlbmd0aDtcclxuICAgICAgY29uc3QgZmlsdGVySWQgPSBgZmlsdGVyLSR7dGhpcy5pZH1gO1xyXG5cclxuICAgICAgaWYgKCBuZWVkc0ZpbHRlciApIHtcclxuICAgICAgICAvLyBMYXp5IGNyZWF0aW9uIG9mIHRoZSBmaWx0ZXIgZWxlbWVudCAoaWYgd2UgaGF2ZW4ndCBhbHJlYWR5KVxyXG4gICAgICAgIGlmICggIXRoaXMuZmlsdGVyRWxlbWVudCApIHtcclxuICAgICAgICAgIHRoaXMuZmlsdGVyRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggc3ZnbnMsICdmaWx0ZXInICk7XHJcbiAgICAgICAgICB0aGlzLmZpbHRlckVsZW1lbnQuc2V0QXR0cmlidXRlKCAnaWQnLCBmaWx0ZXJJZCApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGFsbCBjaGlsZHJlbiBvZiB0aGUgZmlsdGVyIGVsZW1lbnQgaWYgd2UncmUgYXBwbHlpbmcgZmlsdGVycyAoaWYgbm90LCB3ZSB3b24ndCBoYXZlIGl0IGF0dGFjaGVkKVxyXG4gICAgICAgIHdoaWxlICggdGhpcy5maWx0ZXJFbGVtZW50LmZpcnN0Q2hpbGQgKSB7XHJcbiAgICAgICAgICB0aGlzLmZpbHRlckVsZW1lbnQucmVtb3ZlQ2hpbGQoIHRoaXMuZmlsdGVyRWxlbWVudC5sYXN0Q2hpbGQgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEZpbGwgaW4gZWxlbWVudHMgaW50byBvdXIgZmlsdGVyXHJcbiAgICAgICAgbGV0IGZpbHRlclJlZ2lvblBlcmNlbnRhZ2VJbmNyZWFzZSA9IDUwO1xyXG4gICAgICAgIGxldCBpbk5hbWUgPSAnU291cmNlR3JhcGhpYyc7XHJcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gdGhpcy5ub2RlLl9maWx0ZXJzLmxlbmd0aDtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKyApIHtcclxuICAgICAgICAgIGNvbnN0IGZpbHRlciA9IHRoaXMubm9kZS5fZmlsdGVyc1sgaSBdO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHJlc3VsdE5hbWUgPSBpID09PSBsZW5ndGggLSAxID8gdW5kZWZpbmVkIDogYGUke2l9YDsgLy8gTGFzdCByZXN1bHQgc2hvdWxkIGJlIHVuZGVmaW5lZFxyXG4gICAgICAgICAgZmlsdGVyLmFwcGx5U1ZHRmlsdGVyKCB0aGlzLmZpbHRlckVsZW1lbnQsIGluTmFtZSwgcmVzdWx0TmFtZSApO1xyXG4gICAgICAgICAgZmlsdGVyUmVnaW9uUGVyY2VudGFnZUluY3JlYXNlICs9IGZpbHRlci5maWx0ZXJSZWdpb25QZXJjZW50YWdlSW5jcmVhc2U7XHJcbiAgICAgICAgICBpbk5hbWUgPSByZXN1bHROYW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQmxlaCwgbm8gZ29vZCB3YXkgdG8gaGFuZGxlIHRoZSBmaWx0ZXIgcmVnaW9uPyBodHRwczovL2RyYWZ0cy5meHRmLm9yZy9maWx0ZXItZWZmZWN0cy8jZmlsdGVyLXJlZ2lvblxyXG4gICAgICAgIC8vIElmIHdlIFdBTlQgdG8gdHJhY2sgdGhpbmdzIGJ5IHRoZWlyIGFjdHVhbCBkaXNwbGF5IHNpemUgQU5EIHBhZCBwaXhlbHMsIEFORCBjb3B5IHRvbnMgb2YgdGhpbmdzLi4uIHdlIGNvdWxkXHJcbiAgICAgICAgLy8gcG90ZW50aWFsbHkgdXNlIHRoZSB1c2VyU3BhY2VPblVzZSBhbmQgcGFkIHRoZSBwcm9wZXIgbnVtYmVyIG9mIHBpeGVscy4gVGhhdCBzb3VuZHMgbGlrZSBhbiBhYnNvbHV0ZSBwYWluLCBBTkRcclxuICAgICAgICAvLyBhIHBlcmZvcm1hbmNlIGRyYWluIGFuZCBhYnN0cmFjdGlvbiBicmVhay5cclxuICAgICAgICBjb25zdCBtaW4gPSBgLSR7dG9TVkdOdW1iZXIoIGZpbHRlclJlZ2lvblBlcmNlbnRhZ2VJbmNyZWFzZSApfSVgO1xyXG4gICAgICAgIGNvbnN0IHNpemUgPSBgJHt0b1NWR051bWJlciggMiAqIGZpbHRlclJlZ2lvblBlcmNlbnRhZ2VJbmNyZWFzZSArIDEwMCApfSVgO1xyXG4gICAgICAgIHRoaXMuZmlsdGVyRWxlbWVudC5zZXRBdHRyaWJ1dGUoICd4JywgbWluICk7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJFbGVtZW50LnNldEF0dHJpYnV0ZSggJ3knLCBtaW4gKTtcclxuICAgICAgICB0aGlzLmZpbHRlckVsZW1lbnQuc2V0QXR0cmlidXRlKCAnd2lkdGgnLCBzaXplICk7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJFbGVtZW50LnNldEF0dHJpYnV0ZSggJ2hlaWdodCcsIHNpemUgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBuZWVkc0ZpbHRlciApIHtcclxuICAgICAgICBpZiAoICF0aGlzLmhhc0ZpbHRlciApIHtcclxuICAgICAgICAgIHRoaXMuYmxvY2suZGVmcy5hcHBlbmRDaGlsZCggdGhpcy5maWx0ZXJFbGVtZW50ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN2Z0dyb3VwLnNldEF0dHJpYnV0ZSggJ2ZpbHRlcicsIGB1cmwoIyR7ZmlsdGVySWR9KWAgKTtcclxuICAgICAgICB0aGlzLmhhc0ZpbHRlciA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCB0aGlzLmhhc0ZpbHRlciAmJiAhbmVlZHNGaWx0ZXIgKSB7XHJcbiAgICAgICAgc3ZnR3JvdXAucmVtb3ZlQXR0cmlidXRlKCAnZmlsdGVyJyApO1xyXG4gICAgICAgIHRoaXMuaGFzRmlsdGVyID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5ibG9jay5kZWZzLnJlbW92ZUNoaWxkKCB0aGlzLmZpbHRlckVsZW1lbnQgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy5jbGlwRGlydHkgKSB7XHJcbiAgICAgIHRoaXMuY2xpcERpcnR5ID0gZmFsc2U7XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU1ZHR3JvdXAgJiYgc2NlbmVyeUxvZy5TVkdHcm91cCggYGNsaXAgdXBkYXRlOiAke3RoaXMudG9TdHJpbmcoKX1gICk7XHJcblxyXG4gICAgICAvL09IVFdPIFRPRE86IHJlbW92ZSBjbGlwIHdvcmthcm91bmQgKHVzZSB0aGlzLndpbGxBcHBseUZpbHRlcnMpXHJcbiAgICAgIGlmICggdGhpcy5ub2RlLmNsaXBBcmVhICkge1xyXG4gICAgICAgIGlmICggIXRoaXMuY2xpcERlZmluaXRpb24gKSB7XHJcbiAgICAgICAgICBjb25zdCBjbGlwSWQgPSBgY2xpcCR7dGhpcy5ub2RlLmdldElkKCl9YDtcclxuXHJcbiAgICAgICAgICB0aGlzLmNsaXBEZWZpbml0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBzdmducywgJ2NsaXBQYXRoJyApO1xyXG4gICAgICAgICAgdGhpcy5jbGlwRGVmaW5pdGlvbi5zZXRBdHRyaWJ1dGUoICdpZCcsIGNsaXBJZCApO1xyXG4gICAgICAgICAgdGhpcy5jbGlwRGVmaW5pdGlvbi5zZXRBdHRyaWJ1dGUoICdjbGlwUGF0aFVuaXRzJywgJ3VzZXJTcGFjZU9uVXNlJyApO1xyXG4gICAgICAgICAgdGhpcy5ibG9jay5kZWZzLmFwcGVuZENoaWxkKCB0aGlzLmNsaXBEZWZpbml0aW9uICk7IC8vIFRPRE86IG1ldGhvZD8gZXZhbHVhdGUgd2l0aCBmdXR1cmUgdXNhZ2Ugb2YgZGVmcyAobm90IGRvbmUgeWV0KVxyXG5cclxuICAgICAgICAgIHRoaXMuY2xpcFBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAncGF0aCcgKTtcclxuICAgICAgICAgIHRoaXMuY2xpcERlZmluaXRpb24uYXBwZW5kQ2hpbGQoIHRoaXMuY2xpcFBhdGggKTtcclxuXHJcbiAgICAgICAgICBzdmdHcm91cC5zZXRBdHRyaWJ1dGUoICdjbGlwLXBhdGgnLCBgdXJsKCMke2NsaXBJZH0pYCApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jbGlwUGF0aC5zZXRBdHRyaWJ1dGUoICdkJywgdGhpcy5ub2RlLmNsaXBBcmVhLmdldFNWR1BhdGgoKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB0aGlzLmNsaXBEZWZpbml0aW9uICkge1xyXG4gICAgICAgIHN2Z0dyb3VwLnJlbW92ZUF0dHJpYnV0ZSggJ2NsaXAtcGF0aCcgKTtcclxuICAgICAgICB0aGlzLmJsb2NrLmRlZnMucmVtb3ZlQ2hpbGQoIHRoaXMuY2xpcERlZmluaXRpb24gKTsgLy8gVE9ETzogbWV0aG9kPyBldmFsdWF0ZSB3aXRoIGZ1dHVyZSB1c2FnZSBvZiBkZWZzIChub3QgZG9uZSB5ZXQpXHJcblxyXG4gICAgICAgIC8vIFRPRE86IGNvbnNpZGVyIHBvb2xpbmcgdGhlc2U/XHJcbiAgICAgICAgdGhpcy5jbGlwRGVmaW5pdGlvbiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5jbGlwUGF0aCA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMub3JkZXJEaXJ0eSApIHtcclxuICAgICAgdGhpcy5vcmRlckRpcnR5ID0gZmFsc2U7XHJcblxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU1ZHR3JvdXAgJiYgc2NlbmVyeUxvZy5TVkdHcm91cCggYG9yZGVyIHVwZGF0ZTogJHt0aGlzLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU1ZHR3JvdXAgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgICAvLyBvdXIgaW5zdGFuY2Ugc2hvdWxkIGhhdmUgdGhlIHByb3BlciBvcmRlciBvZiBjaGlsZHJlbi4gd2UgY2hlY2sgdGhhdCB3YXkuXHJcbiAgICAgIGxldCBpZHggPSB0aGlzLmNoaWxkcmVuLmxlbmd0aCAtIDE7XHJcbiAgICAgIGNvbnN0IGluc3RhbmNlQ2hpbGRyZW4gPSB0aGlzLmluc3RhbmNlLmNoaWxkcmVuO1xyXG4gICAgICAvLyBpdGVyYXRlIGJhY2t3YXJkcywgc2luY2UgRE9NJ3MgaW5zZXJ0QmVmb3JlIG1ha2VzIGZvcndhcmQgaXRlcmF0aW9uIG1vcmUgY29tcGxpY2F0ZWQgKG5vIGluc2VydEFmdGVyKVxyXG4gICAgICBmb3IgKCBsZXQgaSA9IGluc3RhbmNlQ2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXAgPSBpbnN0YW5jZUNoaWxkcmVuWyBpIF0ubG9va3VwU1ZHR3JvdXAoIHRoaXMuYmxvY2sgKTtcclxuICAgICAgICBpZiAoIGdyb3VwICkge1xyXG4gICAgICAgICAgLy8gZW5zdXJlIHRoYXQgdGhlIHNwb3QgaW4gb3VyIGFycmF5IChhbmQgaW4gdGhlIERPTSkgYXQgW2lkeF0gaXMgY29ycmVjdFxyXG4gICAgICAgICAgaWYgKCB0aGlzLmNoaWxkcmVuWyBpZHggXSAhPT0gZ3JvdXAgKSB7XHJcbiAgICAgICAgICAgIC8vIG91dCBvZiBvcmRlciwgcmVhcnJhbmdlXHJcbiAgICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TVkdHcm91cCAmJiBzY2VuZXJ5TG9nLlNWR0dyb3VwKCBgZ3JvdXAgb3V0IG9mIG9yZGVyOiAke2lkeH0gZm9yICR7Z3JvdXAudG9TdHJpbmcoKX1gICk7XHJcblxyXG4gICAgICAgICAgICAvLyBpbiB0aGUgRE9NIGZpcnN0IChzaW5jZSB3ZSByZWZlcmVuY2UgdGhlIGNoaWxkcmVuIGFycmF5IHRvIGtub3cgd2hhdCB0byBpbnNlcnRCZWZvcmUpXHJcbiAgICAgICAgICAgIC8vIHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzk3MzI2MjQvaG93LXRvLXN3YXAtZG9tLWNoaWxkLW5vZGVzLWluLWphdmFzY3JpcHRcclxuICAgICAgICAgICAgc3ZnR3JvdXAuaW5zZXJ0QmVmb3JlKCBncm91cC5zdmdHcm91cCwgaWR4ICsgMSA+PSB0aGlzLmNoaWxkcmVuLmxlbmd0aCA/IG51bGwgOiB0aGlzLmNoaWxkcmVuWyBpZHggKyAxIF0uc3ZnR3JvdXAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHRoZW4gaW4gb3VyIGNoaWxkcmVuIGFycmF5XHJcbiAgICAgICAgICAgIGNvbnN0IG9sZEluZGV4ID0gXy5pbmRleE9mKCB0aGlzLmNoaWxkcmVuLCBncm91cCApO1xyXG4gICAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvbGRJbmRleCA8IGlkeCwgJ1RoZSBpdGVtIHdlIGFyZSBtb3ZpbmcgYmFja3dhcmRzIHRvIGxvY2F0aW9uIFtpZHhdIHNob3VsZCBub3QgaGF2ZSBhbiBpbmRleCBncmVhdGVyIHRoYW4gdGhhdCcgKTtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UoIG9sZEluZGV4LCAxICk7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKCBpZHgsIDAsIGdyb3VwICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNWR0dyb3VwICYmIHNjZW5lcnlMb2cuU1ZHR3JvdXAoIGBncm91cCBpbiBwbGFjZTogJHtpZHh9IGZvciAke2dyb3VwLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIGlmIHRoZXJlIHdhcyBhIGdyb3VwIGZvciB0aGF0IGluc3RhbmNlLCB3ZSBtb3ZlIG9uIHRvIHRoZSBuZXh0IHNwb3RcclxuICAgICAgICAgIGlkeC0tO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNWR0dyb3VwICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNWR0dyb3VwICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNSZWxlYXNhYmxlKCkge1xyXG4gICAgLy8gaWYgd2UgaGF2ZSBubyBwYXJlbnQsIHdlIGFyZSB0aGUgcm9vdEdyb3VwICh0aGUgYmxvY2sgaXMgcmVzcG9uc2libGUgZm9yIGRpc3Bvc2luZyB0aGF0IG9uZSlcclxuICAgIHJldHVybiAhdGhpcy5oYXNTZWxmRHJhd2FibGUgJiYgIXRoaXMuY2hpbGRyZW4ubGVuZ3RoICYmIHRoaXMucGFyZW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNWR0dyb3VwICYmIHNjZW5lcnlMb2cuU1ZHR3JvdXAoIGBkaXNwb3NlICR7dGhpcy50b1N0cmluZygpfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TVkdHcm91cCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCwgJ1Nob3VsZCBiZSBlbXB0eSBieSBub3cnICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLmhhc0ZpbHRlciApIHtcclxuICAgICAgdGhpcy5zdmdHcm91cC5yZW1vdmVBdHRyaWJ1dGUoICdmaWx0ZXInICk7XHJcbiAgICAgIHRoaXMuaGFzRmlsdGVyID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuYmxvY2suZGVmcy5yZW1vdmVDaGlsZCggdGhpcy5maWx0ZXJFbGVtZW50ICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLndpbGxBcHBseVRyYW5zZm9ybXMgKSB7XHJcbiAgICAgIHRoaXMubm9kZS50cmFuc2Zvcm1FbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLnRyYW5zZm9ybURpcnR5TGlzdGVuZXIgKTtcclxuICAgIH1cclxuICAgIHRoaXMubm9kZS52aXNpYmxlUHJvcGVydHkudW5saW5rKCB0aGlzLnZpc2liaWxpdHlEaXJ0eUxpc3RlbmVyICk7XHJcbiAgICBpZiAoIHRoaXMud2lsbEFwcGx5RmlsdGVycyApIHtcclxuICAgICAgdGhpcy5ub2RlLmZpbHRlckNoYW5nZUVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMuZmlsdGVyQ2hhbmdlTGlzdGVuZXIgKTtcclxuICAgIH1cclxuICAgIC8vT0hUV08gVE9ETzogcmVtb3ZlIGNsaXAgd29ya2Fyb3VuZFxyXG4gICAgdGhpcy5ub2RlLmNsaXBBcmVhUHJvcGVydHkudW5saW5rKCB0aGlzLmNsaXBEaXJ0eUxpc3RlbmVyICk7XHJcblxyXG4gICAgdGhpcy5ub2RlLmNoaWxkcmVuQ2hhbmdlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMub3JkZXJEaXJ0eUxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gaWYgb3VyIEluc3RhbmNlIGhhcyBiZWVuIGRpc3Bvc2VkLCBpdCBoYXMgYWxyZWFkeSBoYWQgdGhlIHJlZmVyZW5jZSByZW1vdmVkXHJcbiAgICBpZiAoIHRoaXMuaW5zdGFuY2UuYWN0aXZlICkge1xyXG4gICAgICB0aGlzLmluc3RhbmNlLnJlbW92ZVNWR0dyb3VwKCB0aGlzICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVtb3ZlIGNsaXBwaW5nLCBzaW5jZSBpdCBpcyBkZWZzLWJhc2VkIChhbmQgd2Ugd2FudCB0byBrZWVwIG91ciBkZWZzIGJsb2NrIGNsZWFuIC0gY291bGQgYmUgYW5vdGhlciBsYXllciEpXHJcbiAgICBpZiAoIHRoaXMuY2xpcERlZmluaXRpb24gKSB7XHJcbiAgICAgIHRoaXMuc3ZnR3JvdXAucmVtb3ZlQXR0cmlidXRlKCAnY2xpcC1wYXRoJyApO1xyXG4gICAgICB0aGlzLmJsb2NrLmRlZnMucmVtb3ZlQ2hpbGQoIHRoaXMuY2xpcERlZmluaXRpb24gKTtcclxuICAgICAgdGhpcy5jbGlwRGVmaW5pdGlvbiA9IG51bGw7XHJcbiAgICAgIHRoaXMuY2xpcFBhdGggPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNsZWFyIHJlZmVyZW5jZXNcclxuICAgIHRoaXMucGFyZW50ID0gbnVsbDtcclxuICAgIHRoaXMuYmxvY2sgPSBudWxsO1xyXG4gICAgdGhpcy5pbnN0YW5jZSA9IG51bGw7XHJcbiAgICB0aGlzLm5vZGUgPSBudWxsO1xyXG4gICAgY2xlYW5BcnJheSggdGhpcy5jaGlsZHJlbiApO1xyXG4gICAgdGhpcy5zZWxmRHJhd2FibGUgPSBudWxsO1xyXG5cclxuICAgIC8vIGZvciBub3dcclxuICAgIHRoaXMuZnJlZVRvUG9vbCgpO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TVkdHcm91cCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHN0cmluZyBmb3JtIG9mIHRoaXMgb2JqZWN0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICB0b1N0cmluZygpIHtcclxuICAgIHJldHVybiBgU1ZHR3JvdXA6JHt0aGlzLmJsb2NrLnRvU3RyaW5nKCl9XyR7dGhpcy5pbnN0YW5jZS50b1N0cmluZygpfWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NWR0Jsb2NrfSBibG9ja1xyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXHJcbiAgICovXHJcbiAgc3RhdGljIGFkZERyYXdhYmxlKCBibG9jaywgZHJhd2FibGUgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkcmF3YWJsZS5pbnN0YW5jZSwgJ0luc3RhbmNlIGlzIHJlcXVpcmVkIGZvciBhIGRyYXdhYmxlIHRvIGJlIGdyb3VwZWQgY29ycmVjdGx5IGluIFNWRycgKTtcclxuXHJcbiAgICBjb25zdCBncm91cCA9IFNWR0dyb3VwLmVuc3VyZUdyb3Vwc1RvSW5zdGFuY2UoIGJsb2NrLCBkcmF3YWJsZS5pbnN0YW5jZSApO1xyXG4gICAgZ3JvdXAuYWRkU2VsZkRyYXdhYmxlKCBkcmF3YWJsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtTVkdCbG9ja30gYmxvY2tcclxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZVxyXG4gICAqL1xyXG4gIHN0YXRpYyByZW1vdmVEcmF3YWJsZSggYmxvY2ssIGRyYXdhYmxlICkge1xyXG4gICAgZHJhd2FibGUuaW5zdGFuY2UubG9va3VwU1ZHR3JvdXAoIGJsb2NrICkucmVtb3ZlU2VsZkRyYXdhYmxlKCBkcmF3YWJsZSApO1xyXG5cclxuICAgIFNWR0dyb3VwLnJlbGVhc2VHcm91cHNUb0luc3RhbmNlKCBibG9jaywgZHJhd2FibGUuaW5zdGFuY2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NWR0Jsb2NrfSBibG9ja1xyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXHJcbiAgICogQHJldHVybnMge1NWR0dyb3VwfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBlbnN1cmVHcm91cHNUb0luc3RhbmNlKCBibG9jaywgaW5zdGFuY2UgKSB7XHJcbiAgICAvLyBUT0RPOiBhc3NlcnRpb25zIGhlcmVcclxuXHJcbiAgICBsZXQgZ3JvdXAgPSBpbnN0YW5jZS5sb29rdXBTVkdHcm91cCggYmxvY2sgKTtcclxuXHJcbiAgICBpZiAoICFncm91cCApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaW5zdGFuY2UgIT09IGJsb2NrLnJvb3RHcm91cC5pbnN0YW5jZSwgJ01ha2luZyBzdXJlIHdlIGRvIG5vdCB3YWxrIHBhc3Qgb3VyIHJvb3RHcm91cCcgKTtcclxuXHJcbiAgICAgIGNvbnN0IHBhcmVudEdyb3VwID0gU1ZHR3JvdXAuZW5zdXJlR3JvdXBzVG9JbnN0YW5jZSggYmxvY2ssIGluc3RhbmNlLnBhcmVudCApO1xyXG5cclxuICAgICAgZ3JvdXAgPSBTVkdHcm91cC5jcmVhdGVGcm9tUG9vbCggYmxvY2ssIGluc3RhbmNlLCBwYXJlbnRHcm91cCApO1xyXG4gICAgICBwYXJlbnRHcm91cC5hZGRDaGlsZEdyb3VwKCBncm91cCApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBncm91cDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NWR0Jsb2NrfSBibG9ja1xyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgc3RhdGljIHJlbGVhc2VHcm91cHNUb0luc3RhbmNlKCBibG9jaywgaW5zdGFuY2UgKSB7XHJcbiAgICBjb25zdCBncm91cCA9IGluc3RhbmNlLmxvb2t1cFNWR0dyb3VwKCBibG9jayApO1xyXG5cclxuICAgIGlmICggZ3JvdXAuaXNSZWxlYXNhYmxlKCkgKSB7XHJcbiAgICAgIGNvbnN0IHBhcmVudEdyb3VwID0gZ3JvdXAucGFyZW50O1xyXG4gICAgICBwYXJlbnRHcm91cC5yZW1vdmVDaGlsZEdyb3VwKCBncm91cCApO1xyXG5cclxuICAgICAgU1ZHR3JvdXAucmVsZWFzZUdyb3Vwc1RvSW5zdGFuY2UoIGJsb2NrLCBwYXJlbnRHcm91cC5pbnN0YW5jZSApO1xyXG5cclxuICAgICAgZ3JvdXAuZGlzcG9zZSgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ1NWR0dyb3VwJywgU1ZHR3JvdXAgKTtcclxuXHJcblBvb2xhYmxlLm1peEludG8oIFNWR0dyb3VwICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTVkdHcm91cDsiXSwibWFwcGluZ3Mi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