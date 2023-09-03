const chai = require('chai');
const sinon = require('sinon');
const CookbookController = require('../../src/CookbookController');
const CookbookQueries = require('../../src/db/CookbookQueries');
const RecipeQueries = require('../../src/db/RecipeQueries');

const assert = chai.assert;

describe('src/CookbookController', () => {
  const sandbox = sinon.sandbox.create();

  const cookbook1 = {
    Title: {
      S: 'Title A',
    },
    Author: {
      S: 'Author D',
    },
    Blog: {
      S: 'http://blog.com',
    },
    AmazonLink: {
      S: 'http://amazon.com/book1',
    },
    MeetingDate: {
      S: '2017-12-01'
    },
    Thumbnail: {
      S: 'http://thumbnail.com',
    },
  };

  const cookbook2 = {
    Title: {
      S: 'Title B',
    },
    Author: {
      S: 'Author C',
    },
    AmazonLink: {
      S: 'http://amazon.com/book2'
    },
    MeetingDate: {
      S: '2018-12-01',
    },
  };

  const cookbook3 = {
    Title: {
      S: 'A Title',
    },
    Author: {
      S: 'Author B',
    },
  };

  const cookbook4 = {
    Title: {
      S: 'B Title',
    },
    Author: {
      S: 'Author A',
    },
  };

  afterEach(() => {
    sandbox.restore();
  });

  describe('formatCookbookJSON', () => {
    it('should return null', () => {
      const result = CookbookController.formatCookbookJSON();
      assert.isNull(result);
    });

    it('should return formatCookbookJSON', () => {
      const expected = {
        title: cookbook1.Title.S,
        author: cookbook1.Author.S,
        blog: cookbook1.Blog.S,
        amazon: cookbook1.AmazonLink.S,
        isoDate: cookbook1.MeetingDate.S,
        displayDate: '12/1/2017',
        thumbnail: cookbook1.Thumbnail.S,
      };

      const result = CookbookController.formatCookbookJSON(cookbook1);
      assert.isNotNull(result);
      assert.deepEqual(result, expected);
    });

    it('should return formatCookbookJSON with title and author', () => {
      const cookbook = {
        Title: {
          S: 'Test Title',
        },
        Author: {
          S: 'Test Author',
        },
      };

      const expected = {
        title: cookbook.Title.S,
        author: cookbook.Author.S,
      };

      const result = CookbookController.formatCookbookJSON(cookbook);
      assert.isNotNull(result);
      assert.deepEqual(result, expected);
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
