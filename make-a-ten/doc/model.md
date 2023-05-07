
# Model documentation

### Adding numbers

Two numbers can be added together (by dragging on top) when they satisfy the following conditions:

1. The sum of the two numbers (mod 10,100,1000) would not overflow. Thus 106 + 217 would not be allowed, because
   ( 106 mod 10 ) + ( 217 mod 10 ) = 6 + 7 >= 10.
2. If both numbers are greater than 10 (but not a multiple of 10) and their sum is less than 100, then their sum can't
   be a multiple of 10. Thus 61 + 19 would not be allowed, because neither is a multiple of 10, yet their sum (80)
   is a multiple of 10.

### Game levels

Where possible, game levels are distributed uniformly from all possible configurations.

Levels 2 and 8 alternate back and forth between the left and right number being larger.

- Level 1: Single digit numbers with sum <= 10
- Level 2: 9 + single digit number, alternating 9 left and right, with 10 < sum < 19
- Level 3: Single digit numbers with 10 < sum < 19
- Level 4: Like level 3, with every number multiplied by 10
- Level 5: Like level 3, except add a random multiple of 10 (80 or less) to one number
- Level 6: Numbers > 10 with sum < 100.
- Level 7: Numbers > 10 and < 100 with sum >= 100.
- Level 8: Single digit number added to a multiple of 100 (100 to 900), alternating with largest number to left first.
- Level 9: Random multiples of 10, with 100 <= number <= 990.
- Level 10: Random numbers with 100 < number < 1000.


