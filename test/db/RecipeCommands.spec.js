const chai = require('chai');
const sinon = require('sinon');
const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBClient, PutItemCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const RecipeCommands = require('../../src/db/RecipeCommands');

const { assert } = chai;

// Ensure Mocha globals are available
/* global describe, it, beforeEach, afterEach */

describe('src/RecipeCommands', () => {
  let sandbox;
  let dynamoDBMock;

  beforeEach(() => {
    dynamoDBMock = mockClient(DynamoDBClient);
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    dynamoDBMock.reset();
    sandbox.restore();
  });

  describe('upsertRecipe', () => {
    it('should add a new recipe to DynamoDB', async () => {
      const recipe = {
        Cookbook: 'Cookbook One',
        Name: 'Recipe Name for Cookbook One',
        Link: 'https://www.test.com/recipe-one/',
        UserEmail: 'user1@mail.com',
      };

      dynamoDBMock.on(PutItemCommand).resolves({});

      const result = await RecipeCommands.upsertRecipe(recipe);
      assert.deepEqual(result, recipe);
      assert.equal(dynamoDBMock.commandCalls(PutItemCommand).length, 1);
    });

    it('should add a recipe with Page field', async () => {
      const recipe = {
        Cookbook: 'Cookbook Two',
        Name: 'Recipe Name for Cookbook Two',
        Page: 118,
        UserEmail: 'user2@mail.com',
      };

      dynamoDBMock.on(PutItemCommand).resolves({});

      const result = await RecipeCommands.upsertRecipe(recipe);
      assert.deepEqual(result, recipe);
      assert.equal(dynamoDBMock.commandCalls(PutItemCommand).length, 1);
    });

    it('should throw and log error if DynamoDB fails', async () => {
      const recipe = {
        Cookbook: 'Test',
        Name: 'Fail',
        UserEmail: 'fail@mail.com',
      };
      const errorStub = sandbox.stub(console, 'error');
      dynamoDBMock.on(PutItemCommand).rejects(new Error('DynamoDB error'));
      try {
        await RecipeCommands.upsertRecipe(recipe);
        assert.fail('Expected error to be thrown');
      } catch (err) {
        assert.equal(err.message, 'DynamoDB error');
        assert.equal(errorStub.callCount, 1);
      }
      sandbox.restore();
      dynamoDBMock.reset();
    });
  });

  describe('deleteRecipe', () => {
    it('should delete a recipe by Cookbook and Name', async () => {
      const cookbook = 'Test Cookbook';
      const name = 'Test Recipe';
      dynamoDBMock.on(DeleteItemCommand)
        .resolves({ Attributes: { Cookbook: { S: cookbook }, Name: { S: name } } });

      const result = await RecipeCommands.deleteRecipe(cookbook, name);
      assert.deepEqual(result, { Attributes: { Cookbook: { S: cookbook }, Name: { S: name } } });
      assert.equal(dynamoDBMock.commandCalls(DeleteItemCommand).length, 1);
    });

    it('should throw and log error if DynamoDB fails', async () => {
      const errorStub = sandbox.stub(console, 'error');
      const cookbook = 'Test Cookbook';
      const name = 'Test Recipe';
      dynamoDBMock.on(DeleteItemCommand).rejects(new Error('DynamoDB error'));

      try {
        await RecipeCommands.deleteRecipe(cookbook, name);
        assert.fail('Expected error to be thrown');
      } catch (err) {
        assert.equal(err.message, 'DynamoDB error');
        assert.equal(errorStub.callCount, 1);
      }
    });
  });
});
