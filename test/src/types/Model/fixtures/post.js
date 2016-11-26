import { nrser } from '../../../testHelpers';

/**
* fixture with a basic post example, where posts have a user, a body, and an
* array of comments, each with a user and body.
*/

export class User extends nrser.t.Model {
  static meta = {
    props: {
      name: nrser.t.String,
    }
  }
}

export class Comment extends nrser.t.Model {
  static meta = {
    props: {
      user: User,
      body: nrser.t.String,
    }
  }
}

export class Post extends nrser.t.Model {
  static meta = {
    props: {
      user: User,
      body: nrser.t.String,
      comments: nrser.t.list(Comment),
    }
  }
}

export const neil = new User({name: "neil"});
export const josh = new User({name: "josh"});

export const post = new Post({
  user: neil,
  body: "hey josh!",
  comments: [
    {user: josh, body: "sup?"},
    {user: neil, body: "how ya been?"},
    {user: josh, body: "a'ight"},
  ]
});

export const postJS = {
  user: {
    name: "neil",
  },
  body: "hey josh!",
  comments: [
    {
      user: {
        name: "josh",
      },
      body: "sup?"
    },
    {
      user: {
        name: "neil",
      },
      body: "how ya been?"
    },
    {
      user: {
        name: "josh",
      },
      body: "a'ight",
    },
  ]
};