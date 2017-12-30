import chai from 'chai';
import sinon from 'sinon';
import Config from '../../src/Config';
import UserQueries from '../../src/db/UserQueries';

const assert = chai.assert;

const config = Config.load();
const query = new UserQueries(config);

describe('src/UserQueries', () => {
  const sandbox = sinon.sandbox.create();

  // Reset test environment
  afterEach(() => {
    sandbox.restore();
  });

  describe('getEmailMap', () => {
    it('should return map', async () => {
      const user1 = {
        Email: 'user.1@email.com',
        FirstName: 'One',
      };

      const user2 = {
        Email: 'user.2@email.com',
        FirstName: 'Two',
      };

      const items = {
        Items: [
          user1,
          user2,
        ],
        Count: 2,
        ScannedCount: 2,
      };

      const params = {
        TableName: 'User',
      };

      sandbox.stub(query.docClient, 'scan')
        .withArgs(params)
        .yields(null, items);

      const map = await query.getEmailMap();
      assert.isNotNull(map);
      assert.equal(Object.keys(map).length, 2);
      assert.deepEqual(map[user1.Email], user1);
      assert.deepEqual(map[user2.Email], user2);
    });

    it('should return empty map', async () => {
      sandbox.stub(query.docClient, 'scan')
        .yields(null, {});

      const map = await query.getEmailMap();
      assert.isNotNull(map);
      assert.deepEqual(map, {});
    });

    it('should return error', async () => {
      sandbox.stub(console, 'error');
      sandbox.stub(query.docClient, 'scan')
        .yields('Test Error', null);

      const result = await query.getEmailMap();
      assert.equal(query.docClient.scan.callCount, 1);
      assert.equal(console.error.callCount, 1);
      assert.equal(result, 'Test Error');
    });
  });
});
