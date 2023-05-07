/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
const image = new Image();
const unlock = asyncLoader.createLock(image);
image.onload = unlock;
image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEMAAAAnCAYAAABUr/U/AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA0NJREFUeNrsms1OE1EUx8+dGWzFoGNckBg/ujEuWAhujVIfgCAuDLqQkrhGeAIfwY8XABIkxBXElW7sE+hg4qoUiiLaUGHaUj4607n+L9xKKbVBaMutmdOcnPnq3Ht+c+bec0/LqElke6jDhOmEhqE3oMV98xBfT0i1oIvCBl59iZZfxJoAQAQ6IB2vpdhQAWQcYKaVhgEQwzDPDvnkjysiavqYoiBENIw2uFlbUzQwBk6gTVNJGPPrTsPbdDmRoSKMn5sFQt/oSqtBLVr93+SM49Fc1lEThpA0Ohhfd+lCQKM2Q6OAzmo62uc9Tnbeo9R2gdYRFgXO1YVRlM0CBwQPH42CAghChpfmBqz6lCicxi3IgYXvuJ9HG3B+Cwc92j1XFOVhlIvou3iK3o4l8jiXVh7ne8erXVNJNPLFh+HD8GH4MHwYx5UjTa39j/L76ghTk6ei/y0MOBuSRRRhu0sKKX+DU62QEgUsq6lgSABPofckhKNKSGq45N6ikCIKKOMqR5GBjpqyiDJcz+Ux7VasImhPwBgElISKA+jzOoMoFxExH5ScTVw3HzmBdkOIkLByML4vLzS80Wx2jd69f63emBGLWcS5R5cvXSNdr/8i9ttSjOLxz+rOJsnkIm1upKm9/Sq1tZ2nlpYA1bJwnsms0q/VH7SyskS5XJYKBVdNGIyxaHEa3AAQ3WB01jApGDyDThegHiKHoFwWU/SKN8LYQ46TJ45PLpcmF9u5XIbS6RS5cF4AcN19EJTLPQxN00cAZLQ8qdI0BgBsB0LRmaJDe9vOrhX7rrt3Xcl2BRE5x8haatBWbgBNLj+05mM9XQAyiDejnk9LOP8C7XSlko/HlM5ArY+3RQfHenqXQ+hwWKbh+zLJfxRLpuWzIvv8unBf+ZT8wPTxduaicGBM6o486E+XrE14pXXKnxQbIK3ZT3dsakI51Fz6ZuqcXeqwXGf49Qy/uOPD8GH4MFQTxujlCTSr5v8zwpPxaXSsT+YpjZAEVmJ3meqhO/fkeuS0znpbDS0c1JlJvDa/tWLfxqprGnbm1sSc2v/pqiRbQx2d8KUTDoXgaLd0FPtkVoFhYduGTeDcIq6xcNq6OR47EHW/BRgAMpjCdrgdTSAAAAAASUVORK5CYII=';
export default image;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImltYWdlIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIl0sInNvdXJjZXMiOlsiY3lsaW5kZXJzSWNvbl9wbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgKi9cclxuaW1wb3J0IGFzeW5jTG9hZGVyIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9hc3luY0xvYWRlci5qcyc7XHJcblxyXG5jb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG5jb25zdCB1bmxvY2sgPSBhc3luY0xvYWRlci5jcmVhdGVMb2NrKCBpbWFnZSApO1xyXG5pbWFnZS5vbmxvYWQgPSB1bmxvY2s7XHJcbmltYWdlLnNyYyA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUVNQUFBQW5DQVlBQUFCVXIvVS9BQUFBR1hSRldIUlRiMlowZDJGeVpRQkJaRzlpWlNCSmJXRm5aVkpsWVdSNWNjbGxQQUFBQTBOSlJFRlVlTnJzbXMxT0UxRVV4OCtkR1d6Rm9HTmNrQmcvdWpFdVdBaHVqVklmZ0NBdURMcVFrcmhHZUFJZndZOFhBQklreEJYRWxXN3NFK2hnNHFvVWlpTGFVR0hhVWo0NjA3bitMOXhLS2JWQmFNdXRtZE9jblBucTNIdCtjK2JlYzAvTHFFbGtlNmpEaE9tRWhxRTNvTVY5OHhCZlQwaTFvSXZDQmw1OWlaWmZ4Sm9BUUFRNklCMnZwZGhRQVdRY1lLYVZoZ0VRd3pEUER2bmtqeXNpYXZxWW9pQkVOSXcydUZsYlV6UXdCazZnVFZOSkdQUHJUc1BiZERtUm9TS01uNXNGUXQvb1NxdEJMVnI5MytTTTQ5RmMxbEVUaHBBME9oaGZkK2xDUUtNMlE2T0F6bW82MnVjOVRuYmVvOVIyZ2RZUkZnWE8xWVZSbE0wQ0J3UVBINDJDQWdoQ2hwZm1CcXo2bENpY3hpM0lnWVh2dUo5SEczQitDd2M5MmoxWEZPVmhsSXZvdTNpSzNvNGw4amlYVmg3bmU4ZXJYVk5KTlBMRmgrSEQ4R0g0TUh3WXg1VWpUYTM5ai9MNzZnaFRrNmVpL3kwTU9CdVNSUlJodTBzS0tYK0RVNjJRRWdVc3E2bGdTQUJQb2Zja2hLTktTR3E0NU42aWtDSUtLT01xUjVHQmpwcXlpREpjeitVeDdWYXNJbWhQd0JnRWxJU0tBK2p6T29Nb0Z4RXhINVNjVFZ3M0h6bUJka09Ja0xCeU1MNHZMelM4MFd4MmpkNjlmNjNlbUJHTFdjUzVSNWN2WFNOZHIvOGk5dHRTak9MeHorck9Kc25rSW0xdXBLbTkvU3ExdFoybmxwWUExYkp3bnNtczBxL1ZIN1N5c2tTNVhKWUtCVmROR0l5eGFIRWEzQUFRM1dCMDFqQXBHRHlEVGhlZ0hpS0hvRndXVS9TS044TFlRNDZUSjQ1UExwY21GOXU1WEliUzZSUzVjRjRBY04xOUVKVExQUXhOMDBjQVpMUThxZEkwQmdCc0IwTFJtYUpEZTl2T3JoWDdycnQzWGNsMkJSRTV4OGhhYXRCV2JnQk5MaiswNW1NOVhRQXlpRGVqbms5TE9QOEM3WFNsa28vSGxNNUFyWSszUlFmSGVucVhRK2h3V0tiaCt6TEpmeFJMcHVXekl2djh1bkJmK1pUOHdQVHhkdWFpY0dCTTZvNDg2RStYckUxNHBYWEtueFFiSUszWlQzZHNha0k1MUZ6Nlp1cWNYZXF3WEdmNDlReS91T1BEOEdINE1GUVR4dWpsQ1RTcjV2OHp3cFB4YVhTc1QrWXBqWkFFVm1KM21lcWhPL2ZrZXVTMHpucGJEUzBjMUpsSnZEYS90V0xmeHFwckduYm0xc1NjMnYvcHFpUmJReDJkOEtVVERvWGdhTGQwRlB0a1ZvRmhZZHVHVGVEY0lxNnhjTnE2T1I0N0VIVy9CUmdBTXBqQ2RyZ2RUU0FBQUFBQVNVVk9SSzVDWUlJPSc7XHJcbmV4cG9ydCBkZWZhdWx0IGltYWdlOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQSxPQUFPQSxXQUFXLE1BQU0sbUNBQW1DO0FBRTNELE1BQU1DLEtBQUssR0FBRyxJQUFJQyxLQUFLLENBQUMsQ0FBQztBQUN6QixNQUFNQyxNQUFNLEdBQUdILFdBQVcsQ0FBQ0ksVUFBVSxDQUFFSCxLQUFNLENBQUM7QUFDOUNBLEtBQUssQ0FBQ0ksTUFBTSxHQUFHRixNQUFNO0FBQ3JCRixLQUFLLENBQUNLLEdBQUcsR0FBRyxndkNBQWd2QztBQUM1dkMsZUFBZUwsS0FBSyJ9