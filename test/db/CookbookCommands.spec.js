const { assert } = require('chai');
const sinon = require('sinon');
const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const CookbookCommands = require('../../src/db/CookbookCommands');

// Ensure Mocha globals are available
/* global describe, it, beforeEach, afterEach */

describe('CookbookCommands', () => {
  let dynamoDBMock;
  let sandbox;

  beforeEach(() => {
    dynamoDBMock = mockClient(DynamoDBClient);
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    dynamoDBMock.reset();
    sandbox.restore();
  });

  describe('upsertCookbook', () => {
    it('should upsert a cookbook to DynamoDB', async () => {
      const cookbook = {
        Author: 'author',
        Title: 'title',
        Blog: 'blog',
        AmazonLink: 'amazon',
        MeetingDate: '2025-09-28',
        Slug: 'slug',
        Thumbnail: 'thumb.jpg',
      };
      dynamoDBMock.on(PutItemCommand).resolves({});
      const result = await CookbookCommands.upsertCookbook(cookbook);
      assert.deepEqual(result, cookbook);
      assert.equal(dynamoDBMock.commandCalls(PutItemCommand).length, 1);
    });

    it('should only include allowed fields', async () => {
      const cookbook = {
        Author: 'author',
        Title: 'title',
        Slug: 'slug',
        Extra: 'not-allowed',
      };
      dynamoDBMock.on(PutItemCommand).resolves({});
      await CookbookCommands.upsertCookbook(cookbook);
      const call = dynamoDBMock.commandCalls(PutItemCommand)[0];
      assert.containsAllKeys(call.args[0].input.Item, ['Author', 'Title', 'Slug']);
      assert.notProperty(call.args[0].input.Item, 'Extra');
    });

    it('should throw and log error if DynamoDB fails', async () => {
      const errorStub = sandbox.stub(console, 'error');
      dynamoDBMock.on(PutItemCommand).rejects(new Error('DynamoDB error'));
      const cookbook = {
        Author: 'author',
        Title: 'title',
        Slug: 'slug',
      };
      try {
        await CookbookCommands.upsertCookbook(cookbook);
        assert.fail('Expected error to be thrown');
      } catch (err) {
        assert.equal(err.message, 'DynamoDB error');
        assert.equal(errorStub.callCount, 1);
      }
    });
  });
});
