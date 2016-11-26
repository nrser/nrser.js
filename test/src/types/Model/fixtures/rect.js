import { nrser } from '../../../testHelpers';

/**
* fixture with a Rect that consists of two Point, each with an x and y, and
* an area method.
*/

export class Point extends nrser.t.Model {
  static meta = {
    props: {
      x: nrser.t.Number,
      y: nrser.t.Number,
    }
  }
}

export class Rect extends nrser.t.Model {
  static meta = {
    props: {
      a: Point,
      b: Point,
    }
  }
  
  area() {
    return Math.abs((this.a.x - this.b.x) * (this.a.y - this.b.y));
  }
}