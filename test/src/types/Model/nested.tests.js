import {
  expect,
  itMaps,
  _,
  nrser,
  t,
} from '../../testHelpers';

import { Point, Rect } from './fixtures/rect';
import {
  Post,
  User,
  Comment,
  neil,
  josh,
  post,
} from './fixtures/post';

const Model = nrser.t.Model;

describe("types/Model.js", () => {
  describe("Model", () => {
    describe("[nested models]", () => {
    
      context("rect fixture", () => {        
        it(`constructs a nested model`, () => {
          const r = new Rect({
            a: {x: 0, y: 0},
            b: {x: 1, y: 1},
          });
          
          expect(r.a)
            .to.be.an.instanceOf(Point)
            .with.property('x')
            .that.equals(0);
            
          expect(r.b)
            .to.be.an.instanceOf(Point)
            .with.property('y')
            .that.equals(1);
        });
        
      }); // rect
      
      context("post fixture", () => {
        it("is a Post", () => {
          expect(post)
            .to.be.an.instanceOf(Post);
        });
        
        it("is by User neil", () => {
          expect(post.user)
            .to.be.an.instanceOf(User)
            .that.has.property('name')
            .that.equals('neil');
        });
        
        context("comments", () => {
          it("is an array of Comment", () => {
            expect(post.comments)
              .to.be.an.instanceOf(Array);
              
            _.each(post.comments, (comment) => {
              expect(comment).to.be.an.instanceOf(Comment);
            });  
          });
          
          it("each have a User", () => {
            _.each(post.comments, (comment) => {
              expect(comment.user).to.be.an.instanceOf(User);
            });
          });
          
          it("each have a string body", () => {
            _.each(post.comments, (comment) => {
              expect(typeof comment.body).to.equal('string');
            });
          });
        }); // comments
      }); // post
      
    }); // [nested models]
  }); // Model
}); // types/Model.js