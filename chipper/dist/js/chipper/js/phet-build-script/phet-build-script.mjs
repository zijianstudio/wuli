// Copyright 2022, University of Colorado Boulder
// Entry point for phet build commands forwarded from grunt

import * as fs from 'fs'; // eslint-disable-line bad-sim-text

const args = process.argv.slice(2); // eslint-disable-line no-undef

const assert = (predicate, message) => {
  if (!predicate) {
    throw new Error(message);
  }
};
const command = args[0];

// https://unix.stackexchange.com/questions/573377/do-command-line-options-take-an-equals-sign-between-option-name-and-value
const repos = args.filter(arg => arg.startsWith('--repo=')).map(arg => arg.split('=')[1]);
assert && assert(repos.length === 1, 'should have 1 repo');
const repo = repos[0];
if (command === 'clean') {
  const buildDirectory = `../${repo}/build`;
  if (fs.existsSync(buildDirectory)) {
    fs.rmSync(buildDirectory, {
      recursive: true,
      force: true
    });
  }
  fs.mkdirSync(buildDirectory);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmcyIsImFyZ3MiLCJwcm9jZXNzIiwiYXJndiIsInNsaWNlIiwiYXNzZXJ0IiwicHJlZGljYXRlIiwibWVzc2FnZSIsIkVycm9yIiwiY29tbWFuZCIsInJlcG9zIiwiZmlsdGVyIiwiYXJnIiwic3RhcnRzV2l0aCIsIm1hcCIsInNwbGl0IiwibGVuZ3RoIiwicmVwbyIsImJ1aWxkRGlyZWN0b3J5IiwiZXhpc3RzU3luYyIsInJtU3luYyIsInJlY3Vyc2l2ZSIsImZvcmNlIiwibWtkaXJTeW5jIl0sInNvdXJjZXMiOlsicGhldC1idWlsZC1zY3JpcHQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vLyBFbnRyeSBwb2ludCBmb3IgcGhldCBidWlsZCBjb21tYW5kcyBmb3J3YXJkZWQgZnJvbSBncnVudFxyXG5cclxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhZC1zaW0tdGV4dFxyXG5cclxuY29uc3QgYXJnczogc3RyaW5nW10gPSBwcm9jZXNzLmFyZ3Yuc2xpY2UoIDIgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxyXG5cclxuY29uc3QgYXNzZXJ0ID0gKCBwcmVkaWNhdGU6IHVua25vd24sIG1lc3NhZ2U6IHN0cmluZyApID0+IHtcclxuICBpZiAoICFwcmVkaWNhdGUgKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoIG1lc3NhZ2UgKTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBjb21tYW5kID0gYXJnc1sgMCBdO1xyXG5cclxuLy8gaHR0cHM6Ly91bml4LnN0YWNrZXhjaGFuZ2UuY29tL3F1ZXN0aW9ucy81NzMzNzcvZG8tY29tbWFuZC1saW5lLW9wdGlvbnMtdGFrZS1hbi1lcXVhbHMtc2lnbi1iZXR3ZWVuLW9wdGlvbi1uYW1lLWFuZC12YWx1ZVxyXG5jb25zdCByZXBvcyA9IGFyZ3MuZmlsdGVyKCBhcmcgPT4gYXJnLnN0YXJ0c1dpdGgoICctLXJlcG89JyApICkubWFwKCBhcmcgPT4gYXJnLnNwbGl0KCAnPScgKVsgMSBdICk7XHJcbmFzc2VydCAmJiBhc3NlcnQoIHJlcG9zLmxlbmd0aCA9PT0gMSwgJ3Nob3VsZCBoYXZlIDEgcmVwbycgKTtcclxuY29uc3QgcmVwbyA9IHJlcG9zWyAwIF07XHJcbmlmICggY29tbWFuZCA9PT0gJ2NsZWFuJyApIHtcclxuICBjb25zdCBidWlsZERpcmVjdG9yeSA9IGAuLi8ke3JlcG99L2J1aWxkYDtcclxuXHJcbiAgaWYgKCBmcy5leGlzdHNTeW5jKCBidWlsZERpcmVjdG9yeSApICkge1xyXG4gICAgZnMucm1TeW5jKCBidWlsZERpcmVjdG9yeSwgeyByZWN1cnNpdmU6IHRydWUsIGZvcmNlOiB0cnVlIH0gKTtcclxuICB9XHJcblxyXG4gIGZzLm1rZGlyU3luYyggYnVpbGREaXJlY3RvcnkgKTtcclxufSJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7QUFFQSxPQUFPLEtBQUtBLEVBQUUsTUFBTSxJQUFJLENBQUMsQ0FBQzs7QUFFMUIsTUFBTUMsSUFBYyxHQUFHQyxPQUFPLENBQUNDLElBQUksQ0FBQ0MsS0FBSyxDQUFFLENBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRWhELE1BQU1DLE1BQU0sR0FBR0EsQ0FBRUMsU0FBa0IsRUFBRUMsT0FBZSxLQUFNO0VBQ3hELElBQUssQ0FBQ0QsU0FBUyxFQUFHO0lBQ2hCLE1BQU0sSUFBSUUsS0FBSyxDQUFFRCxPQUFRLENBQUM7RUFDNUI7QUFDRixDQUFDO0FBRUQsTUFBTUUsT0FBTyxHQUFHUixJQUFJLENBQUUsQ0FBQyxDQUFFOztBQUV6QjtBQUNBLE1BQU1TLEtBQUssR0FBR1QsSUFBSSxDQUFDVSxNQUFNLENBQUVDLEdBQUcsSUFBSUEsR0FBRyxDQUFDQyxVQUFVLENBQUUsU0FBVSxDQUFFLENBQUMsQ0FBQ0MsR0FBRyxDQUFFRixHQUFHLElBQUlBLEdBQUcsQ0FBQ0csS0FBSyxDQUFFLEdBQUksQ0FBQyxDQUFFLENBQUMsQ0FBRyxDQUFDO0FBQ25HVixNQUFNLElBQUlBLE1BQU0sQ0FBRUssS0FBSyxDQUFDTSxNQUFNLEtBQUssQ0FBQyxFQUFFLG9CQUFxQixDQUFDO0FBQzVELE1BQU1DLElBQUksR0FBR1AsS0FBSyxDQUFFLENBQUMsQ0FBRTtBQUN2QixJQUFLRCxPQUFPLEtBQUssT0FBTyxFQUFHO0VBQ3pCLE1BQU1TLGNBQWMsR0FBSSxNQUFLRCxJQUFLLFFBQU87RUFFekMsSUFBS2pCLEVBQUUsQ0FBQ21CLFVBQVUsQ0FBRUQsY0FBZSxDQUFDLEVBQUc7SUFDckNsQixFQUFFLENBQUNvQixNQUFNLENBQUVGLGNBQWMsRUFBRTtNQUFFRyxTQUFTLEVBQUUsSUFBSTtNQUFFQyxLQUFLLEVBQUU7SUFBSyxDQUFFLENBQUM7RUFDL0Q7RUFFQXRCLEVBQUUsQ0FBQ3VCLFNBQVMsQ0FBRUwsY0FBZSxDQUFDO0FBQ2hDIn0=