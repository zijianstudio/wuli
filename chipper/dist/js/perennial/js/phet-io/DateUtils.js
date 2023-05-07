// Copyright 2021, University of Colorado Boulder
module.exports = {
  toGitHubDate(date) {
    return `${date.toISOString().split('T')[0]} 23:59`;
  },
  toFilename(date) {
    return this.toGitHubDate(date).replace(/:/, '_');
  },
  getTestDates() {
    const currentDate = new Date();
    const dates = [];
    for (let i = 0; i < 10; i++) {
      const dateToOutput = new Date();
      dateToOutput.setDate(currentDate.getDate() - 10 * i);
      dates.push(dateToOutput);
    }
    console.log(dates.join('\n'));
    return dates;
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwidG9HaXRIdWJEYXRlIiwiZGF0ZSIsInRvSVNPU3RyaW5nIiwic3BsaXQiLCJ0b0ZpbGVuYW1lIiwicmVwbGFjZSIsImdldFRlc3REYXRlcyIsImN1cnJlbnREYXRlIiwiRGF0ZSIsImRhdGVzIiwiaSIsImRhdGVUb091dHB1dCIsInNldERhdGUiLCJnZXREYXRlIiwicHVzaCIsImNvbnNvbGUiLCJsb2ciLCJqb2luIl0sInNvdXJjZXMiOlsiRGF0ZVV0aWxzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgdG9HaXRIdWJEYXRlKCBkYXRlICkge1xyXG4gICAgcmV0dXJuIGAke2RhdGUudG9JU09TdHJpbmcoKS5zcGxpdCggJ1QnIClbIDAgXX0gMjM6NTlgO1xyXG4gIH0sXHJcbiAgdG9GaWxlbmFtZSggZGF0ZSApIHtcclxuICAgIHJldHVybiB0aGlzLnRvR2l0SHViRGF0ZSggZGF0ZSApLnJlcGxhY2UoIC86LywgJ18nICk7XHJcbiAgfSxcclxuICBnZXRUZXN0RGF0ZXMoKSB7XHJcbiAgICBjb25zdCBjdXJyZW50RGF0ZSA9IG5ldyBEYXRlKCk7XHJcblxyXG4gICAgY29uc3QgZGF0ZXMgPSBbXTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IDEwOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGRhdGVUb091dHB1dCA9IG5ldyBEYXRlKCk7XHJcbiAgICAgIGRhdGVUb091dHB1dC5zZXREYXRlKCBjdXJyZW50RGF0ZS5nZXREYXRlKCkgLSAxMCAqIGkgKTtcclxuICAgICAgZGF0ZXMucHVzaCggZGF0ZVRvT3V0cHV0ICk7XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZyggZGF0ZXMuam9pbiggJ1xcbicgKSApO1xyXG5cclxuICAgIHJldHVybiBkYXRlcztcclxuICB9XHJcbn07Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBQSxNQUFNLENBQUNDLE9BQU8sR0FBRztFQUNmQyxZQUFZQSxDQUFFQyxJQUFJLEVBQUc7SUFDbkIsT0FBUSxHQUFFQSxJQUFJLENBQUNDLFdBQVcsQ0FBQyxDQUFDLENBQUNDLEtBQUssQ0FBRSxHQUFJLENBQUMsQ0FBRSxDQUFDLENBQUcsUUFBTztFQUN4RCxDQUFDO0VBQ0RDLFVBQVVBLENBQUVILElBQUksRUFBRztJQUNqQixPQUFPLElBQUksQ0FBQ0QsWUFBWSxDQUFFQyxJQUFLLENBQUMsQ0FBQ0ksT0FBTyxDQUFFLEdBQUcsRUFBRSxHQUFJLENBQUM7RUFDdEQsQ0FBQztFQUNEQyxZQUFZQSxDQUFBLEVBQUc7SUFDYixNQUFNQyxXQUFXLEdBQUcsSUFBSUMsSUFBSSxDQUFDLENBQUM7SUFFOUIsTUFBTUMsS0FBSyxHQUFHLEVBQUU7SUFDaEIsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsRUFBRSxFQUFFQSxDQUFDLEVBQUUsRUFBRztNQUM3QixNQUFNQyxZQUFZLEdBQUcsSUFBSUgsSUFBSSxDQUFDLENBQUM7TUFDL0JHLFlBQVksQ0FBQ0MsT0FBTyxDQUFFTCxXQUFXLENBQUNNLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHSCxDQUFFLENBQUM7TUFDdERELEtBQUssQ0FBQ0ssSUFBSSxDQUFFSCxZQUFhLENBQUM7SUFDNUI7SUFDQUksT0FBTyxDQUFDQyxHQUFHLENBQUVQLEtBQUssQ0FBQ1EsSUFBSSxDQUFFLElBQUssQ0FBRSxDQUFDO0lBRWpDLE9BQU9SLEtBQUs7RUFDZDtBQUNGLENBQUMifQ==