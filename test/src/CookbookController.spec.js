const chai = require('chai');
const sinon = require('sinon');
const CookbookController = require('../../src/CookbookController');
const CookbookQueries = require('../../src/db/CookbookQueries');
const RecipeQueries = require('../../src/db/RecipeQueries');

const assert = chai.assert;

describe('src/CookbookController', () => {
  const sandbox = sinon.sandbox.create();

  const cookbook1 = {
    Title: 'Title A',
    Author: 'Author D',
    Blog: 'http://blog.com',
    AmazonLink: 'http://amazon.com/book1',
    MeetingDate: '2017-12-01',
    Thumbnail: 'http://thumbnail.com',
  };

  const cookbook2 = {
    Title: 'Title B',
    Author: 'Author C',
    AmazonLink: 'http://amazon.com/book2',
    MeetingDate: '2018-12-01',
  };

  const cookbook3 = {
    Title: 'A Title',
    Author: 'Author B',
  };

  const cookbook4 = {
    Title: 'B Title',
    Author: 'Author A',
  };

  // Reset test environment
  afterEach(() => {
    sandbox.restore();
  });

  describe('validateCookbook', () => {
    it('should pass validation', () => {
      const errors = CookbookController.validateCookbook('title', 'author', '2018-01-31');
      assert.isNull(errors);
    });

    it('should require title', () => {
      const errors = CookbookController.validateCookbook(null, 'author');
      assert.isNotNull(errors);
      assert.equal(errors.length, 1);
      assert.equal(errors[0], 'Enter a title');
    });

    it('should require author', () => {
      const errors = CookbookController.validateCookbook('title');
      assert.isNotNull(errors);
      assert.equal(errors.length, 1);
      assert.equal(errors[0], 'Enter an author');
    });

    it('should require date in correct format', () => {
      const date = '01/31/2018';

      const errors = CookbookController.validateCookbook('title', 'author', date);
      assert.isNotNull(errors);
      assert.equal(errors.length, 1);
      assert.equal(errors[0], `Date ${date} is not in YYYY-MM-DD format`);
    });

    it('should return multiple errors', () => {
      const date = '01/31/2018';

      const errors = CookbookController.validateCookbook('', '', date);
      assert.isNotNull(errors);
      assert.equal(errors.length, 3);
      assert.equal(errors[0], 'Enter a title');
      assert.equal(errors[1], 'Enter an author');
      assert.equal(errors[2], `Date ${date} is not in YYYY-MM-DD format`);
    });
  });

  describe('formatCookbookJSON', () => {
    it('should return null', () => {
      const result = CookbookController.formatCookbookJSON();
      assert.isNull(result);
    });

    it('should return formatCookbookJSON', () => {
      const expected = {
        title: cookbook1.Title,
        author: cookbook1.Author,
        blog: cookbook1.Blog,
        amazon: cookbook1.AmazonLink,
        isoDate: cookbook1.MeetingDate,
        displayDate: '12/1/2017',
        thumbnail: cookbook1.Thumbnail,
      };

      const result = CookbookController.formatCookbookJSON(cookbook1);
      assert.isNotNull(result);
      assert.deepEqual(result, expected);
    });

    it('should return formatCookbookJSON with title and author', () => {
      const cookbook = {
        Title: 'Test Title',
        Author: 'Test Author',
      };

      const expected = {
        title: cookbook.Title,
        author: cookbook.Author,
      };

      const result = CookbookController.formatCookbookJSON(cookbook);
      assert.isNotNull(result);
      assert.deepEqual(result, expected);
    });
  });

  describe('create', () => {
    it('should return error message if no event', async () => {
      const error = await CookbookController.create();
      assert.equal(error, 'No details entered!');
    });

    it('should return error message if no event params', async () => {
      const event = {};

      const error = await CookbookController.create(event);
      assert.equal(error, 'No details entered!');
    });

    it('should return error message if no event params path', async () => {
      const event = {
        params: {},
      };

      const error = await CookbookController.create(event);
      assert.equal(error, 'No details entered!');
    });

    it('should return error message if required params are missing', async () => {
      const event = {
        params: {
          path: {
            title: null,
            author: null,
          },
        },
      };

      sandbox.stub(CookbookQueries, 'update');

      // Update should not be called.  Should return validation errors.
      const errors = await CookbookController.create(event);
      assert.equal(CookbookQueries.update.callCount, 0);
      assert.isArray(errors);
      assert.equal(errors.length, 2);
    });

    it('should decode title and author', async () => {
      const event = {
        params: {
          path: {
            title: 'How Easy Is That?',
            author: 'Author 1 & Author 2',
          },
        },
      };

      const item = {
        Title: decodeURI(event.params.path.title),
        Author: decodeURI(event.params.path.author),
      };

      sandbox.stub(CookbookQueries, 'update')
        .withArgs(item)
        .returns(item);

      const result = await CookbookController.create(event);
      assert.deepEqual(result, item);
      assert.equal(CookbookQueries.update.callCount, 1);
    });

    it('should update DB', async () => {
      const event = {
        params: {
          path: {
            title: 'Test Title',
            author: 'Test Author',
            meetingDate: '2018-01-31',
            blog: 'https://foodnetwork.com',
          },
        },
      };

      const item = {
        Title: decodeURI(event.params.path.title),
        Author: decodeURI(event.params.path.author),
        MeetingDate: event.params.path.meetingDate,
        Blog: event.params.path.blog,
      };

      sandbox.stub(CookbookQueries, 'update')
        .withArgs(item)
        .returns(item);

      const result = await CookbookController.create(event);
      assert.deepEqual(result, item);
      assert.equal(CookbookQueries.update.callCount, 1);
    });
  });

  describe('delete', () => {
    it('should return error message if no event', async () => {
      const error = await CookbookController.delete();
      assert.equal(error, 'Error deleting cookbook!');
    });

    it('should return error message if no event params', async () => {
      const event = {};

      const error = await CookbookController.delete(event);
      assert.equal(error, 'Error deleting cookbook!');
    });

    it('should return error message if no event params path', async () => {
      const event = {
        params: {},
      };

      const error = await CookbookController.delete(event);
      assert.equal(error, 'Error deleting cookbook!');
    });

    it('should return error message if required params are missing', async () => {
      const event = {
        params: {
          path: {
            title: null,
            author: null,
          },
        },
      };

      sandbox.stub(CookbookQueries, 'delete');

      // Delete should not be called.  Should return validation errors.
      const errors = await CookbookController.delete(event);
      assert.equal(CookbookQueries.delete.callCount, 0);
      assert.isArray(errors);
      assert.equal(errors.length, 2);
    });

    it('should not delete if book has recipes', async () => {
      const title = 'Test Title';
      const author = 'Test Author';

      const event = {
        params: {
          path: {
            title,
            author,
          },
        },
      };

      sandbox.stub(RecipeQueries, 'hasRecipes')
        .withArgs(title)
        .returns(true);

      sandbox.stub(CookbookQueries, 'delete');

      const result = await CookbookController.delete(event);
      assert.equal(RecipeQueries.hasRecipes.callCount, 1);
      assert.equal(CookbookQueries.delete.callCount, 0);
      assert.equal(result, 'Cookbook has recipes which cannot be deleted.');
    });

    it('should delete from DB', async () => {
      const title = 'Test Title';
      const author = 'Test Author';

      const event = {
        params: {
          path: {
            title,
            author,
          },
        },
      };

      const item = {
        Title: title,
        Author: author,
      };

      sandbox.stub(RecipeQueries, 'hasRecipes')
        .withArgs(title)
        .returns(false);

      sandbox.stub(CookbookQueries, 'delete')
        .withArgs(title, author)
        .returns(item);

      const result = await CookbookController.delete(event);
      assert.deepEqual(result, item);
      assert.equal(RecipeQueries.hasRecipes.callCount, 1);
      assert.equal(CookbookQueries.delete.callCount, 1);
    });
  });

  describe('getAll', () => {
    it('should return empty array if getAll is empty', async () => {
      sandbox.stub(CookbookQueries, 'getAll')
        .returns([]);

      const result = await CookbookController.getAll();
      assert.equal(CookbookQueries.getAll.callCount, 1);
      assert.isArray(result);
      assert.isEmpty(result);
    });

    it('should return empty array if getAll is null', async () => {
      sandbox.stub(CookbookQueries, 'getAll')
        .returns(null);

      const result = await CookbookController.getAll();
      assert.equal(CookbookQueries.getAll.callCount, 1);
      assert.isArray(result);
      assert.isEmpty(result);
    });

    it('should sort results by meeting date desc', async () => {
      const cookbooks = [
        cookbook1,
        cookbook2,
      ];

      const event = {
        params: {
          path: {},
        },
      };

      sandbox.stub(CookbookQueries, 'getAll')
        .returns(cookbooks);

      const result = await CookbookController.getAll(event);
      assert.equal(result.length, 2);
      assert.deepEqual(result[0], CookbookController.formatCookbookJSON(cookbook2));
      assert.deepEqual(result[1], CookbookController.formatCookbookJSON(cookbook1));
    });

    it('should sort results by meeting date asc', async () => {
      const cookbooks = [
        cookbook1,
        cookbook2,
      ];

      const event = {
        params: {
          path: {
            sortOrder: 'asc',
          },
        },
      };

      sandbox.stub(CookbookQueries, 'getAll')
        .returns(cookbooks);

      const result = await CookbookController.getAll(event);
      assert.equal(result.length, 2);
      assert.deepEqual(result[0], CookbookController.formatCookbookJSON(cookbook1));
      assert.deepEqual(result[1], CookbookController.formatCookbookJSON(cookbook2));
    });

    it('should sort results without date at end', async () => {
      const cookbooks = [
        cookbook3,
        cookbook1,
        cookbook2,
        cookbook4,
      ];

      const event = {
        params: {
          path: {
            sortBy: 'date',
            sortOrder: 'desc',
          },
        },
      };

      sandbox.stub(CookbookQueries, 'getAll')
        .returns(cookbooks);

      const result = await CookbookController.getAll(event);
      assert.equal(result.length, 4);
      assert.deepEqual(result[0], CookbookController.formatCookbookJSON(cookbook2));
      assert.deepEqual(result[1], CookbookController.formatCookbookJSON(cookbook1));
      assert.deepEqual(result[2], CookbookController.formatCookbookJSON(cookbook3));
      assert.deepEqual(result[3], CookbookController.formatCookbookJSON(cookbook4));
    });

    it('should return results without date at end by title asc', async () => {
      const cookbooks = [
        cookbook2,
        cookbook4,
        cookbook3,
      ];

      const event = {
        params: {
          path: {
            sortBy: 'date',
            sortOrder: 'desc',
          },
        },
      };

      sandbox.stub(CookbookQueries, 'getAll')
        .returns(cookbooks);

      const result = await CookbookController.getAll(event);
      assert.equal(result.length, 3);
      assert.deepEqual(result[0], CookbookController.formatCookbookJSON(cookbook2));
      assert.deepEqual(result[1], CookbookController.formatCookbookJSON(cookbook3));
      assert.deepEqual(result[2], CookbookController.formatCookbookJSON(cookbook4));
    });

    it('should return results sorted by title desc', async () => {
      const cookbooks = [
        cookbook1,
        cookbook2,
        cookbook3,
        cookbook4,
      ];

      const event = {
        params: {
          path: {
            sortBy: 'title',
            sortOrder: 'desc',
          },
        },
      };

      sandbox.stub(CookbookQueries, 'getAll')
        .returns(cookbooks);

      const result = await CookbookController.getAll(event);
      assert.equal(result.length, 4);
      assert.deepEqual(result[0], CookbookController.formatCookbookJSON(cookbook2));
      assert.deepEqual(result[1], CookbookController.formatCookbookJSON(cookbook1));
      assert.deepEqual(result[2], CookbookController.formatCookbookJSON(cookbook4));
      assert.deepEqual(result[3], CookbookController.formatCookbookJSON(cookbook3));
    });

    it('should return results sorted by author asc', async () => {
      const cookbooks = [
        cookbook1,
        cookbook2,
        cookbook3,
        cookbook4,
      ];

      const event = {
        params: {
          path: {
            sortBy: 'author',
            sortOrder: 'asc',
          },
        },
      };

      sandbox.stub(CookbookQueries, 'getAll')
        .returns(cookbooks);

      const result = await CookbookController.getAll(event);
      assert.equal(result.length, 4);
      assert.deepEqual(result[0], CookbookController.formatCookbookJSON(cookbook4));
      assert.deepEqual(result[1], CookbookController.formatCookbookJSON(cookbook3));
      assert.deepEqual(result[2], CookbookController.formatCookbookJSON(cookbook2));
      assert.deepEqual(result[3], CookbookController.formatCookbookJSON(cookbook1));
    });
  });
});
