// Copyright 2018, University of Colorado Boulder

/**
 * Returns a combination of status information for the repository's git status
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const execute = require('./execute');
const getBranch = require('./getBranch');
const getRemoteBranchSHAs = require('./getRemoteBranchSHAs');
const gitRevParse = require('./gitRevParse');
const assert = require('assert');

/**
 * Returns a combination of status information for the repository's git status
 * @public
 *
 * @param {string} repo - The repository name
 * @returns {Promise.<{symbolicRef:string, branch:string, sha:string, status:string, [trackingBranch:string}, [ahead:number], [behind:number]}>}
 */
module.exports = async function (repo) {
  assert(typeof repo === 'string');
  const result = {};

  // This is needed to get the below `git rev-list` with ${u} to actually compare with the remote state.
  await execute('git', ['remote', 'update'], `../${repo}`);
  result.symbolicRef = await execute('git', ['symbolic-ref', '-q', 'HEAD'], `../${repo}`);
  result.branch = await getBranch(repo); // might be empty string
  result.sha = await gitRevParse(repo, 'HEAD');
  result.status = await execute('git', ['status', '--porcelain'], `../${repo}`);
  if (result.branch) {
    // Safe method to get ahead/behind counts, see http://stackoverflow.com/questions/2969214/git-programmatically-know-by-how-much-the-branch-is-ahead-behind-a-remote-branc

    result.remoteSHA = (await getRemoteBranchSHAs(repo))[result.branch];

    // get the tracking-branch name
    result.trackingBranch = await execute('git', ['for-each-ref', '--format=\'%(upstream:short)\'', result.symbolicRef], `../${repo}`);

    // e.g. behind-count + '\t' + ahead-count
    const counts = await execute('git', ['rev-list', '--left-right', '--count', `${result.trackingBranch}@{u}...HEAD`], `../${repo}`);
    result.behind = Number(counts.split('\t')[0]);
    result.ahead = Number(counts.split('\t')[1]);
    result.remoteDifferent = result.remoteSHA !== result.sha;
    if (result.remoteDifferent) {
      assert(result.behind > 0 || result.ahead > 0, 'We should be ahead or behind commits if our remote SHA is different than our HEAD');
    }
  }
  return result;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJleGVjdXRlIiwicmVxdWlyZSIsImdldEJyYW5jaCIsImdldFJlbW90ZUJyYW5jaFNIQXMiLCJnaXRSZXZQYXJzZSIsImFzc2VydCIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwicmVzdWx0Iiwic3ltYm9saWNSZWYiLCJicmFuY2giLCJzaGEiLCJzdGF0dXMiLCJyZW1vdGVTSEEiLCJ0cmFja2luZ0JyYW5jaCIsImNvdW50cyIsImJlaGluZCIsIk51bWJlciIsInNwbGl0IiwiYWhlYWQiLCJyZW1vdGVEaWZmZXJlbnQiXSwic291cmNlcyI6WyJnaXRTdGF0dXMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYSBjb21iaW5hdGlvbiBvZiBzdGF0dXMgaW5mb3JtYXRpb24gZm9yIHRoZSByZXBvc2l0b3J5J3MgZ2l0IHN0YXR1c1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICk7XHJcbmNvbnN0IGdldEJyYW5jaCA9IHJlcXVpcmUoICcuL2dldEJyYW5jaCcgKTtcclxuY29uc3QgZ2V0UmVtb3RlQnJhbmNoU0hBcyA9IHJlcXVpcmUoICcuL2dldFJlbW90ZUJyYW5jaFNIQXMnICk7XHJcbmNvbnN0IGdpdFJldlBhcnNlID0gcmVxdWlyZSggJy4vZ2l0UmV2UGFyc2UnICk7XHJcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoICdhc3NlcnQnICk7XHJcblxyXG4vKipcclxuICogUmV0dXJucyBhIGNvbWJpbmF0aW9uIG9mIHN0YXR1cyBpbmZvcm1hdGlvbiBmb3IgdGhlIHJlcG9zaXRvcnkncyBnaXQgc3RhdHVzXHJcbiAqIEBwdWJsaWNcclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlLjx7c3ltYm9saWNSZWY6c3RyaW5nLCBicmFuY2g6c3RyaW5nLCBzaGE6c3RyaW5nLCBzdGF0dXM6c3RyaW5nLCBbdHJhY2tpbmdCcmFuY2g6c3RyaW5nfSwgW2FoZWFkOm51bWJlcl0sIFtiZWhpbmQ6bnVtYmVyXX0+fVxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggcmVwbyApIHtcclxuICBhc3NlcnQoIHR5cGVvZiByZXBvID09PSAnc3RyaW5nJyApO1xyXG5cclxuICBjb25zdCByZXN1bHQgPSB7fTtcclxuXHJcbiAgLy8gVGhpcyBpcyBuZWVkZWQgdG8gZ2V0IHRoZSBiZWxvdyBgZ2l0IHJldi1saXN0YCB3aXRoICR7dX0gdG8gYWN0dWFsbHkgY29tcGFyZSB3aXRoIHRoZSByZW1vdGUgc3RhdGUuXHJcbiAgYXdhaXQgZXhlY3V0ZSggJ2dpdCcsIFsgJ3JlbW90ZScsICd1cGRhdGUnIF0sIGAuLi8ke3JlcG99YCApO1xyXG5cclxuICByZXN1bHQuc3ltYm9saWNSZWYgPSBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAnc3ltYm9saWMtcmVmJywgJy1xJywgJ0hFQUQnIF0sIGAuLi8ke3JlcG99YCApO1xyXG4gIHJlc3VsdC5icmFuY2ggPSBhd2FpdCBnZXRCcmFuY2goIHJlcG8gKTsgLy8gbWlnaHQgYmUgZW1wdHkgc3RyaW5nXHJcbiAgcmVzdWx0LnNoYSA9IGF3YWl0IGdpdFJldlBhcnNlKCByZXBvLCAnSEVBRCcgKTtcclxuICByZXN1bHQuc3RhdHVzID0gYXdhaXQgZXhlY3V0ZSggJ2dpdCcsIFsgJ3N0YXR1cycsICctLXBvcmNlbGFpbicgXSwgYC4uLyR7cmVwb31gICk7XHJcblxyXG4gIGlmICggcmVzdWx0LmJyYW5jaCApIHtcclxuICAgIC8vIFNhZmUgbWV0aG9kIHRvIGdldCBhaGVhZC9iZWhpbmQgY291bnRzLCBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yOTY5MjE0L2dpdC1wcm9ncmFtbWF0aWNhbGx5LWtub3ctYnktaG93LW11Y2gtdGhlLWJyYW5jaC1pcy1haGVhZC1iZWhpbmQtYS1yZW1vdGUtYnJhbmNcclxuXHJcbiAgICByZXN1bHQucmVtb3RlU0hBID0gKCBhd2FpdCBnZXRSZW1vdGVCcmFuY2hTSEFzKCByZXBvICkgKVsgcmVzdWx0LmJyYW5jaCBdO1xyXG5cclxuICAgIC8vIGdldCB0aGUgdHJhY2tpbmctYnJhbmNoIG5hbWVcclxuICAgIHJlc3VsdC50cmFja2luZ0JyYW5jaCA9IGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBbICdmb3ItZWFjaC1yZWYnLCAnLS1mb3JtYXQ9XFwnJSh1cHN0cmVhbTpzaG9ydClcXCcnLCByZXN1bHQuc3ltYm9saWNSZWYgXSwgYC4uLyR7cmVwb31gICk7XHJcblxyXG4gICAgLy8gZS5nLiBiZWhpbmQtY291bnQgKyAnXFx0JyArIGFoZWFkLWNvdW50XHJcbiAgICBjb25zdCBjb3VudHMgPSBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAncmV2LWxpc3QnLCAnLS1sZWZ0LXJpZ2h0JywgJy0tY291bnQnLCBgJHtyZXN1bHQudHJhY2tpbmdCcmFuY2h9QHt1fS4uLkhFQURgIF0sIGAuLi8ke3JlcG99YCApO1xyXG5cclxuICAgIHJlc3VsdC5iZWhpbmQgPSBOdW1iZXIoIGNvdW50cy5zcGxpdCggJ1xcdCcgKVsgMCBdICk7XHJcbiAgICByZXN1bHQuYWhlYWQgPSBOdW1iZXIoIGNvdW50cy5zcGxpdCggJ1xcdCcgKVsgMSBdICk7XHJcbiAgICByZXN1bHQucmVtb3RlRGlmZmVyZW50ID0gcmVzdWx0LnJlbW90ZVNIQSAhPT0gcmVzdWx0LnNoYTtcclxuXHJcbiAgICBpZiAoIHJlc3VsdC5yZW1vdGVEaWZmZXJlbnQgKSB7XHJcbiAgICAgIGFzc2VydCggcmVzdWx0LmJlaGluZCA+IDAgfHwgcmVzdWx0LmFoZWFkID4gMCwgJ1dlIHNob3VsZCBiZSBhaGVhZCBvciBiZWhpbmQgY29tbWl0cyBpZiBvdXIgcmVtb3RlIFNIQSBpcyBkaWZmZXJlbnQgdGhhbiBvdXIgSEVBRCcgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn07XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNQSxPQUFPLEdBQUdDLE9BQU8sQ0FBRSxXQUFZLENBQUM7QUFDdEMsTUFBTUMsU0FBUyxHQUFHRCxPQUFPLENBQUUsYUFBYyxDQUFDO0FBQzFDLE1BQU1FLG1CQUFtQixHQUFHRixPQUFPLENBQUUsdUJBQXdCLENBQUM7QUFDOUQsTUFBTUcsV0FBVyxHQUFHSCxPQUFPLENBQUUsZUFBZ0IsQ0FBQztBQUM5QyxNQUFNSSxNQUFNLEdBQUdKLE9BQU8sQ0FBRSxRQUFTLENBQUM7O0FBRWxDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FLLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLGdCQUFnQkMsSUFBSSxFQUFHO0VBQ3RDSCxNQUFNLENBQUUsT0FBT0csSUFBSSxLQUFLLFFBQVMsQ0FBQztFQUVsQyxNQUFNQyxNQUFNLEdBQUcsQ0FBQyxDQUFDOztFQUVqQjtFQUNBLE1BQU1ULE9BQU8sQ0FBRSxLQUFLLEVBQUUsQ0FBRSxRQUFRLEVBQUUsUUFBUSxDQUFFLEVBQUcsTUFBS1EsSUFBSyxFQUFFLENBQUM7RUFFNURDLE1BQU0sQ0FBQ0MsV0FBVyxHQUFHLE1BQU1WLE9BQU8sQ0FBRSxLQUFLLEVBQUUsQ0FBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBRSxFQUFHLE1BQUtRLElBQUssRUFBRSxDQUFDO0VBQzNGQyxNQUFNLENBQUNFLE1BQU0sR0FBRyxNQUFNVCxTQUFTLENBQUVNLElBQUssQ0FBQyxDQUFDLENBQUM7RUFDekNDLE1BQU0sQ0FBQ0csR0FBRyxHQUFHLE1BQU1SLFdBQVcsQ0FBRUksSUFBSSxFQUFFLE1BQU8sQ0FBQztFQUM5Q0MsTUFBTSxDQUFDSSxNQUFNLEdBQUcsTUFBTWIsT0FBTyxDQUFFLEtBQUssRUFBRSxDQUFFLFFBQVEsRUFBRSxhQUFhLENBQUUsRUFBRyxNQUFLUSxJQUFLLEVBQUUsQ0FBQztFQUVqRixJQUFLQyxNQUFNLENBQUNFLE1BQU0sRUFBRztJQUNuQjs7SUFFQUYsTUFBTSxDQUFDSyxTQUFTLEdBQUcsQ0FBRSxNQUFNWCxtQkFBbUIsQ0FBRUssSUFBSyxDQUFDLEVBQUlDLE1BQU0sQ0FBQ0UsTUFBTSxDQUFFOztJQUV6RTtJQUNBRixNQUFNLENBQUNNLGNBQWMsR0FBRyxNQUFNZixPQUFPLENBQUUsS0FBSyxFQUFFLENBQUUsY0FBYyxFQUFFLGdDQUFnQyxFQUFFUyxNQUFNLENBQUNDLFdBQVcsQ0FBRSxFQUFHLE1BQUtGLElBQUssRUFBRSxDQUFDOztJQUV0STtJQUNBLE1BQU1RLE1BQU0sR0FBRyxNQUFNaEIsT0FBTyxDQUFFLEtBQUssRUFBRSxDQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFHLEdBQUVTLE1BQU0sQ0FBQ00sY0FBZSxhQUFZLENBQUUsRUFBRyxNQUFLUCxJQUFLLEVBQUUsQ0FBQztJQUVySUMsTUFBTSxDQUFDUSxNQUFNLEdBQUdDLE1BQU0sQ0FBRUYsTUFBTSxDQUFDRyxLQUFLLENBQUUsSUFBSyxDQUFDLENBQUUsQ0FBQyxDQUFHLENBQUM7SUFDbkRWLE1BQU0sQ0FBQ1csS0FBSyxHQUFHRixNQUFNLENBQUVGLE1BQU0sQ0FBQ0csS0FBSyxDQUFFLElBQUssQ0FBQyxDQUFFLENBQUMsQ0FBRyxDQUFDO0lBQ2xEVixNQUFNLENBQUNZLGVBQWUsR0FBR1osTUFBTSxDQUFDSyxTQUFTLEtBQUtMLE1BQU0sQ0FBQ0csR0FBRztJQUV4RCxJQUFLSCxNQUFNLENBQUNZLGVBQWUsRUFBRztNQUM1QmhCLE1BQU0sQ0FBRUksTUFBTSxDQUFDUSxNQUFNLEdBQUcsQ0FBQyxJQUFJUixNQUFNLENBQUNXLEtBQUssR0FBRyxDQUFDLEVBQUUsbUZBQW9GLENBQUM7SUFDdEk7RUFDRjtFQUVBLE9BQU9YLE1BQU07QUFDZixDQUFDIn0=