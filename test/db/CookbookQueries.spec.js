import chai from 'chai';
import sinon from 'sinon';
import Config from '../../src/Config';
import CookbookQueries from '../../src/db/CookbookQueries';

const assert = chai.assert;

const config = Config.load();
const query = new CookbookQueries(config);

describe('src/CookbookQueries', () => {
  const sandbox = sinon.sandbox.create();

  // Reset test environment
  afterEach(() => {
    sandbox.restore();
  });

  describe('update', () => {
    it('should return success', async () => {
      const item = {
        Title: 'Cookbook',
        Author: 'Author',
      };

      const params = {
        TableName: 'Cookbook',
        Item: item,
      };

      sandbox.stub(query.docClient, 'put')
        .withArgs(params)
        .yields(null);

      const result = await query.update(item);
      assert.equal(result, 'Success');
    });

    it('should return error', async () => {
      sandbox.stub(console, 'error');
      sandbox.stub(query.docClient, 'put')
        .yields('Update Error', null);

      const result = await query.update();
      assert.equal(query.docClient.put.callCount, 1);
      assert.equal(console.error.callCount, 1);
      assert.equal(result, 'Update Error');
    });
  });

  describe('delete', () => {
    it('should return success', async () => {
      const params = {
        TableName: 'Cookbook',
        Key: {
          Title: 'Cookbook',
          Author: 'Author',
        },
      };

      sandbox.stub(query.docClient, 'delete')
        .withArgs(params)
        .yields(null);

      const result = await query.delete('Cookbook', 'Author');
      assert.equal(result, 'Success');
    });

    it('should return error', async () => {
      sandbox.stub(console, 'error');
      sandbox.stub(query.docClient, 'delete')
        .yields('Delete Error', null);

      const result = await query.delete('Cookbook', 'Author');
      assert.equal(query.docClient.delete.callCount, 1);
      assert.equal(console.error.callCount, 1);
      assert.equal(result, 'Delete Error');
    });
  });

  describe('getAll', () => {
    it('should return success', async () => {
      const cookbook1 = {
        Title: 'Cookbook 1',
        Author: 'Author 1',
      };

      const cookbook2 = {
        Title: 'Cookbook 2',
        Author: 'Author 2',
      };

      const items = {
        Items: [
          cookbook1,
          cookbook2,
        ],
        Count: 2,
        ScannedCount: 2,
      };

      const params = {
        TableName: 'Cookbook',
      };

      sandbox.stub(query.docClient, 'scan')
        .withArgs(params)
        .yields(null, items);

      const result = await query.getAll();
      assert.deepEqual(result, items.Items);
    });

    it('should return empty array if no items', async () => {
      sandbox.stub(query.docClient, 'scan')
        .yields(null, {});

      const result = await query.getAll();
      assert.deepEqual(result, []);
    });

    it('should return empty array if error', async () => {
      sandbox.stub(console, 'error');
      sandbox.stub(query.docClient, 'scan')
        .yields('Get Error', null);

      const result = await query.getAll();
      assert.equal(query.docClient.scan.callCount, 1);
      assert.equal(console.error.callCount, 1);
      assert.deepEqual(result, []);
    });
  });
});
