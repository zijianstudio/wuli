// Copyright 2018-2022, University of Colorado Boulder

/**
 * A node that creates a "Control Area" accessible section in the PDOM. This organizational Node should have accessible
 * content to be displayed under it in the PDOM. This content can be added as a child, or added via `pdomOrder`.
 * Items in this section are designed to be secondary to that in the PlayAreaNode. See ScreenView for more documentation
 * and usage explanation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import sceneryPhet from '../../sceneryPhet.js';
import SceneryPhetStrings from '../../SceneryPhetStrings.js';
import PDOMSectionNode from '../PDOMSectionNode.js';
export default class ControlAreaNode extends PDOMSectionNode {
  constructor(providedOptions) {
    super(SceneryPhetStrings.a11y.simSection.controlAreaStringProperty, providedOptions);
  }
}
sceneryPhet.register('ControlAreaNode', ControlAreaNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzY2VuZXJ5UGhldCIsIlNjZW5lcnlQaGV0U3RyaW5ncyIsIlBET01TZWN0aW9uTm9kZSIsIkNvbnRyb2xBcmVhTm9kZSIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwiYTExeSIsInNpbVNlY3Rpb24iLCJjb250cm9sQXJlYVN0cmluZ1Byb3BlcnR5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb250cm9sQXJlYU5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBub2RlIHRoYXQgY3JlYXRlcyBhIFwiQ29udHJvbCBBcmVhXCIgYWNjZXNzaWJsZSBzZWN0aW9uIGluIHRoZSBQRE9NLiBUaGlzIG9yZ2FuaXphdGlvbmFsIE5vZGUgc2hvdWxkIGhhdmUgYWNjZXNzaWJsZVxyXG4gKiBjb250ZW50IHRvIGJlIGRpc3BsYXllZCB1bmRlciBpdCBpbiB0aGUgUERPTS4gVGhpcyBjb250ZW50IGNhbiBiZSBhZGRlZCBhcyBhIGNoaWxkLCBvciBhZGRlZCB2aWEgYHBkb21PcmRlcmAuXHJcbiAqIEl0ZW1zIGluIHRoaXMgc2VjdGlvbiBhcmUgZGVzaWduZWQgdG8gYmUgc2Vjb25kYXJ5IHRvIHRoYXQgaW4gdGhlIFBsYXlBcmVhTm9kZS4gU2VlIFNjcmVlblZpZXcgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxyXG4gKiBhbmQgdXNhZ2UgZXhwbGFuYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuLi8uLi9zY2VuZXJ5UGhldC5qcyc7XHJcbmltcG9ydCBTY2VuZXJ5UGhldFN0cmluZ3MgZnJvbSAnLi4vLi4vU2NlbmVyeVBoZXRTdHJpbmdzLmpzJztcclxuaW1wb3J0IFBET01TZWN0aW9uTm9kZSwgeyBQRE9NU2VjdGlvbk5vZGVPcHRpb25zIH0gZnJvbSAnLi4vUERPTVNlY3Rpb25Ob2RlLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5leHBvcnQgdHlwZSBDb250cm9sQXJlYU5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQRE9NU2VjdGlvbk5vZGVPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udHJvbEFyZWFOb2RlIGV4dGVuZHMgUERPTVNlY3Rpb25Ob2RlIHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IENvbnRyb2xBcmVhTm9kZU9wdGlvbnMgKSB7XHJcbiAgICBzdXBlciggU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkuc2ltU2VjdGlvbi5jb250cm9sQXJlYVN0cmluZ1Byb3BlcnR5LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnQ29udHJvbEFyZWFOb2RlJywgQ29udHJvbEFyZWFOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLFdBQVcsTUFBTSxzQkFBc0I7QUFDOUMsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBQzVELE9BQU9DLGVBQWUsTUFBa0MsdUJBQXVCO0FBSy9FLGVBQWUsTUFBTUMsZUFBZSxTQUFTRCxlQUFlLENBQUM7RUFDcERFLFdBQVdBLENBQUVDLGVBQXdDLEVBQUc7SUFDN0QsS0FBSyxDQUFFSixrQkFBa0IsQ0FBQ0ssSUFBSSxDQUFDQyxVQUFVLENBQUNDLHlCQUF5QixFQUFFSCxlQUFnQixDQUFDO0VBQ3hGO0FBQ0Y7QUFFQUwsV0FBVyxDQUFDUyxRQUFRLENBQUUsaUJBQWlCLEVBQUVOLGVBQWdCLENBQUMifQ==