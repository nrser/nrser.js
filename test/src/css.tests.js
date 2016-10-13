import chai from 'chai';
import { itMaps2 } from '../../lib/testing';
import { cssNamespace, cssNamespacer } from '../../lib/css';

describe('css.js', () => {
  describe('.cssNamespace', () => {
    itMaps({
      func: cssNamespace,
      map: (f, throws) => [
        f('Page', '&'), 'Page',
        f('Page', '&-main'), 'Page-main',
        f('Page', 'container & &-mobile blah'),
          'container Page Page-mobile blah',
        f('Page', ['container', '&', ['&-mobile', ['blah']]]),
          'container Page Page-mobile blah',
      ]
    })
  }); // .cssNamespace
  
  describe('.cssNamespacer', () => {
    const cns = cssNamespacer('Page');
    
    itMaps({
      func: cns,
      map: (f, throws) => [
        f('&'), 'Page',
        f('&-main'), 'Page-main',
        f('container & &-mobile blah'),
          'container Page Page-mobile blah',
        f(['container', '&', ['&-mobile', ['blah']]]),
          'container Page Page-mobile blah',
      ]
    })
  });
});