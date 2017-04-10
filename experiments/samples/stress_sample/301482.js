#!/usr/bin/env js

var build_path = function(src, dest) {
  var next_x = src[0],
      next_y = src[1],
      delta_x = dest[0] - src[0],
      delta_y = dest[1] - src[1],
      step_x,
      step_y,
      step = 0,
      fraction = 0,
      path = []

  if (delta_x < 0) {
    step_x = -1
  } else {
    step_x = 1
  }
  if (delta_y < 0) {
    step_y = -1
  } else {
    step_y = 1
  }

  delta_x = Math.abs(delta_x * 2)
  delta_y = Math.abs(delta_y * 2)

  path[step] = [next_x, next_y]
  step++

  if (delta_x > delta_y) {
    fraction = delta_y - delta_x / 2
    while (next_x != dest[0]) {
      if (fraction >= 0) {
        next_y += step_y
        fraction -= delta_x
      }
      next_x += step_x
      fraction += delta_y
      path[step] = [next_x, next_y]
      step++
    }
  } else {
    fraction = delta_x - delta_y / 2
    while (next_y != dest[1]) {
      if (fraction >= 0) {
        next_x += step_x
        fraction -= delta_y
      }
      next_y += step_y
      fraction += delta_x
      path[step] = [next_x, next_y]
      step++
    }
  }

  return path
}

var way = build_path([152, 152], [182, 136])
for (var i = 0; i < way.length; i++) {
  print(way[i])
}
