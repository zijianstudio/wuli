// Copyright 2022, University of Colorado Boulder

/**
 * A Node represented by a heading in the parallel dom that can receive focus. Typically
 * headings are not focusable and not interactive. But it may be desirable to put focus
 * on a heading to orient the user or control where the traversal order starts without
 * focusing an interactive component.
 *
 * When a screen reader is focused on a heading it will read the name of the heading and
 * possibly the content below it.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { Node, scenery } from '../../imports.js';

// Available heading levels, according to DOM spec.

class FocusableHeadingNode extends Node {
  // Removes listeners and makes eligible for garbage collection.

  constructor(providedOptions) {
    const options = optionize()({
      headingLevel: 1
    }, providedOptions);
    super(options);
    this.tagName = `h${options.headingLevel}`;

    // This Node is focusable but there is no interactive component to surround with a highlight.
    this.focusHighlight = 'invisible';

    // After losing focus, this element is removed from the traversal order. It can only receive
    // focus again after calling focus() directly.
    const blurListener = {
      blur: () => {
        this.focusable = false;
      }
    };
    this.addInputListener(blurListener);
    this.disposeFocusableHeadingNode = () => {
      this.removeInputListener(blurListener);
    };
  }

  /**
   * Focus this heading in the Parallel DOM. The screen reader will read its name and possibly
   * content below it. Traversal with alternative input will continue from wherever this element
   * is located in the PDOM order.
   *
   * Once the heading loses focus, it is removed from the traversal order until this is called
   * explicitly again.
   */
  focus() {
    this.focusable = true;
    super.focus();
  }
  dispose() {
    this.disposeFocusableHeadingNode();
    super.dispose();
  }
}
scenery.register('FocusableHeadingNode', FocusableHeadingNode);
export default FocusableHeadingNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJOb2RlIiwic2NlbmVyeSIsIkZvY3VzYWJsZUhlYWRpbmdOb2RlIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiaGVhZGluZ0xldmVsIiwidGFnTmFtZSIsImZvY3VzSGlnaGxpZ2h0IiwiYmx1ckxpc3RlbmVyIiwiYmx1ciIsImZvY3VzYWJsZSIsImFkZElucHV0TGlzdGVuZXIiLCJkaXNwb3NlRm9jdXNhYmxlSGVhZGluZ05vZGUiLCJyZW1vdmVJbnB1dExpc3RlbmVyIiwiZm9jdXMiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGb2N1c2FibGVIZWFkaW5nTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBOb2RlIHJlcHJlc2VudGVkIGJ5IGEgaGVhZGluZyBpbiB0aGUgcGFyYWxsZWwgZG9tIHRoYXQgY2FuIHJlY2VpdmUgZm9jdXMuIFR5cGljYWxseVxyXG4gKiBoZWFkaW5ncyBhcmUgbm90IGZvY3VzYWJsZSBhbmQgbm90IGludGVyYWN0aXZlLiBCdXQgaXQgbWF5IGJlIGRlc2lyYWJsZSB0byBwdXQgZm9jdXNcclxuICogb24gYSBoZWFkaW5nIHRvIG9yaWVudCB0aGUgdXNlciBvciBjb250cm9sIHdoZXJlIHRoZSB0cmF2ZXJzYWwgb3JkZXIgc3RhcnRzIHdpdGhvdXRcclxuICogZm9jdXNpbmcgYW4gaW50ZXJhY3RpdmUgY29tcG9uZW50LlxyXG4gKlxyXG4gKiBXaGVuIGEgc2NyZWVuIHJlYWRlciBpcyBmb2N1c2VkIG9uIGEgaGVhZGluZyBpdCB3aWxsIHJlYWQgdGhlIG5hbWUgb2YgdGhlIGhlYWRpbmcgYW5kXHJcbiAqIHBvc3NpYmx5IHRoZSBjb250ZW50IGJlbG93IGl0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIE5vZGVPcHRpb25zLCBzY2VuZXJ5IH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XHJcblxyXG4vLyBBdmFpbGFibGUgaGVhZGluZyBsZXZlbHMsIGFjY29yZGluZyB0byBET00gc3BlYy5cclxudHlwZSBIZWFkaW5nTGV2ZWxOdW1iZXIgPSAxIHwgMiB8IDMgfCA0IHwgNSB8IDY7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG5cclxuICAvLyBUaGUgaGVhZGluZyBsZXZlbCBmb3IgdGhpcyBmb2N1c2FibGUgaGVhZGluZyBpbiB0aGUgUERPTSwgMS02IGFjY29yZGluZyB0byBET00gc3BlYy5cclxuICBoZWFkaW5nTGV2ZWw/OiBIZWFkaW5nTGV2ZWxOdW1iZXI7XHJcbn07XHJcbnR5cGUgUGFyZW50T3B0aW9ucyA9IFN0cmljdE9taXQ8Tm9kZU9wdGlvbnMsICd0YWdOYW1lJyB8ICdmb2N1c0hpZ2hsaWdodCc+O1xyXG5leHBvcnQgdHlwZSBGb2N1c2FibGVIZWFkaW5nTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBhcmVudE9wdGlvbnM7XHJcblxyXG5jbGFzcyBGb2N1c2FibGVIZWFkaW5nTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvLyBSZW1vdmVzIGxpc3RlbmVycyBhbmQgbWFrZXMgZWxpZ2libGUgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VGb2N1c2FibGVIZWFkaW5nTm9kZTogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBGb2N1c2FibGVIZWFkaW5nTm9kZU9wdGlvbnMgKSB7XHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEZvY3VzYWJsZUhlYWRpbmdOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBhcmVudE9wdGlvbnM+KCkoIHtcclxuICAgICAgaGVhZGluZ0xldmVsOiAxXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMudGFnTmFtZSA9IGBoJHtvcHRpb25zLmhlYWRpbmdMZXZlbH1gO1xyXG5cclxuICAgIC8vIFRoaXMgTm9kZSBpcyBmb2N1c2FibGUgYnV0IHRoZXJlIGlzIG5vIGludGVyYWN0aXZlIGNvbXBvbmVudCB0byBzdXJyb3VuZCB3aXRoIGEgaGlnaGxpZ2h0LlxyXG4gICAgdGhpcy5mb2N1c0hpZ2hsaWdodCA9ICdpbnZpc2libGUnO1xyXG5cclxuICAgIC8vIEFmdGVyIGxvc2luZyBmb2N1cywgdGhpcyBlbGVtZW50IGlzIHJlbW92ZWQgZnJvbSB0aGUgdHJhdmVyc2FsIG9yZGVyLiBJdCBjYW4gb25seSByZWNlaXZlXHJcbiAgICAvLyBmb2N1cyBhZ2FpbiBhZnRlciBjYWxsaW5nIGZvY3VzKCkgZGlyZWN0bHkuXHJcbiAgICBjb25zdCBibHVyTGlzdGVuZXIgPSB7XHJcbiAgICAgIGJsdXI6ICgpID0+IHsgdGhpcy5mb2N1c2FibGUgPSBmYWxzZTsgfVxyXG4gICAgfTtcclxuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggYmx1ckxpc3RlbmVyICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlRm9jdXNhYmxlSGVhZGluZ05vZGUgPSAoKSA9PiB7XHJcbiAgICAgIHRoaXMucmVtb3ZlSW5wdXRMaXN0ZW5lciggYmx1ckxpc3RlbmVyICk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRm9jdXMgdGhpcyBoZWFkaW5nIGluIHRoZSBQYXJhbGxlbCBET00uIFRoZSBzY3JlZW4gcmVhZGVyIHdpbGwgcmVhZCBpdHMgbmFtZSBhbmQgcG9zc2libHlcclxuICAgKiBjb250ZW50IGJlbG93IGl0LiBUcmF2ZXJzYWwgd2l0aCBhbHRlcm5hdGl2ZSBpbnB1dCB3aWxsIGNvbnRpbnVlIGZyb20gd2hlcmV2ZXIgdGhpcyBlbGVtZW50XHJcbiAgICogaXMgbG9jYXRlZCBpbiB0aGUgUERPTSBvcmRlci5cclxuICAgKlxyXG4gICAqIE9uY2UgdGhlIGhlYWRpbmcgbG9zZXMgZm9jdXMsIGl0IGlzIHJlbW92ZWQgZnJvbSB0aGUgdHJhdmVyc2FsIG9yZGVyIHVudGlsIHRoaXMgaXMgY2FsbGVkXHJcbiAgICogZXhwbGljaXRseSBhZ2Fpbi5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgZm9jdXMoKTogdm9pZCB7XHJcbiAgICB0aGlzLmZvY3VzYWJsZSA9IHRydWU7XHJcbiAgICBzdXBlci5mb2N1cygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VGb2N1c2FibGVIZWFkaW5nTm9kZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ0ZvY3VzYWJsZUhlYWRpbmdOb2RlJywgRm9jdXNhYmxlSGVhZGluZ05vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgRm9jdXNhYmxlSGVhZGluZ05vZGU7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sdUNBQXVDO0FBRTdELFNBQVNDLElBQUksRUFBZUMsT0FBTyxRQUFRLGtCQUFrQjs7QUFFN0Q7O0FBV0EsTUFBTUMsb0JBQW9CLFNBQVNGLElBQUksQ0FBQztFQUV0Qzs7RUFHT0csV0FBV0EsQ0FBRUMsZUFBNkMsRUFBRztJQUNsRSxNQUFNQyxPQUFPLEdBQUdOLFNBQVMsQ0FBMEQsQ0FBQyxDQUFFO01BQ3BGTyxZQUFZLEVBQUU7SUFDaEIsQ0FBQyxFQUFFRixlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FBRUMsT0FBUSxDQUFDO0lBRWhCLElBQUksQ0FBQ0UsT0FBTyxHQUFJLElBQUdGLE9BQU8sQ0FBQ0MsWUFBYSxFQUFDOztJQUV6QztJQUNBLElBQUksQ0FBQ0UsY0FBYyxHQUFHLFdBQVc7O0lBRWpDO0lBQ0E7SUFDQSxNQUFNQyxZQUFZLEdBQUc7TUFDbkJDLElBQUksRUFBRUEsQ0FBQSxLQUFNO1FBQUUsSUFBSSxDQUFDQyxTQUFTLEdBQUcsS0FBSztNQUFFO0lBQ3hDLENBQUM7SUFDRCxJQUFJLENBQUNDLGdCQUFnQixDQUFFSCxZQUFhLENBQUM7SUFFckMsSUFBSSxDQUFDSSwyQkFBMkIsR0FBRyxNQUFNO01BQ3ZDLElBQUksQ0FBQ0MsbUJBQW1CLENBQUVMLFlBQWEsQ0FBQztJQUMxQyxDQUFDO0VBQ0g7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNrQk0sS0FBS0EsQ0FBQSxFQUFTO0lBQzVCLElBQUksQ0FBQ0osU0FBUyxHQUFHLElBQUk7SUFDckIsS0FBSyxDQUFDSSxLQUFLLENBQUMsQ0FBQztFQUNmO0VBRWdCQyxPQUFPQSxDQUFBLEVBQVM7SUFDOUIsSUFBSSxDQUFDSCwyQkFBMkIsQ0FBQyxDQUFDO0lBQ2xDLEtBQUssQ0FBQ0csT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBZixPQUFPLENBQUNnQixRQUFRLENBQUUsc0JBQXNCLEVBQUVmLG9CQUFxQixDQUFDO0FBQ2hFLGVBQWVBLG9CQUFvQiJ9