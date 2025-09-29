const { assert } = require('chai');
const sinon = require('sinon');
const AdminController = require('../../src/AdminController');
const CookbookCommands = require('../../src/db/CookbookCommands');
const RecipeCommands = require('../../src/db/RecipeCommands');

// Ensure Mocha globals are available
/* global describe, it, beforeEach, afterEach */

describe('AdminController', () => {
  let sandbox;
  let cookbookStub;
  let recipeStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    cookbookStub = sandbox.stub(CookbookCommands, 'upsertCookbook');
    recipeStub = sandbox.stub(RecipeCommands, 'upsertRecipe');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('upsertCookbook', () => {
    it('should handle event.body as object', async () => {
      const cookbook = {
        Slug: 'slug', Title: 'title', Author: 'author', MeetingDate: '2025-09-28',
      };
      cookbookStub.resolves(cookbook);
      const event = { body: cookbook };
      const res = await AdminController.upsertCookbook(event);
      assert.equal(res.statusCode, 201);
      assert.include(res.body, 'slug');
      assert.isTrue(cookbookStub.calledOnce);
    });

    it('should handle event.body as JSON string', async () => {
      const cookbook = {
        Slug: 'slug', Title: 'title', Author: 'author', MeetingDate: '2025-09-28',
      };
      cookbookStub.resolves(cookbook);
      const event = { body: JSON.stringify(cookbook) };
      const res = await AdminController.upsertCookbook(event);
      assert.equal(res.statusCode, 201);
      assert.include(res.body, 'slug');
      assert.isTrue(cookbookStub.calledOnce);
    });

    it('should return 400 if required fields are missing', async () => {
      const event = { body: JSON.stringify({ Title: 'Test' }) };
      const res = await AdminController.upsertCookbook(event);
      assert.equal(res.statusCode, 400);
      assert.include(res.body, 'Missing required fields');
    });

    it('should return 500 if upsertCookbook throws', async () => {
      cookbookStub.rejects(new Error('fail'));
      const cookbook = {
        Slug: 'slug', Title: 'title', Author: 'author', MeetingDate: '2025-09-28',
      };
      const event = { body: JSON.stringify(cookbook) };
      const res = await AdminController.upsertCookbook(event);
      assert.equal(res.statusCode, 500);
      assert.include(res.body, 'fail');
    });
  });

  describe('upsertRecipe', () => {
    it('should handle event.body as object', async () => {
      const recipe = { Cookbook: 'cb', Name: 'name', UserEmail: 'user@mail.com' };
      recipeStub.resolves(recipe);
      const event = { body: recipe };
      const res = await AdminController.upsertRecipe(event);
      assert.equal(res.statusCode, 201);
      assert.include(res.body, 'cb');
      assert.isTrue(recipeStub.calledOnce);
    });

    it('should handle event.body as JSON string', async () => {
      const recipe = { Cookbook: 'cb', Name: 'name', UserEmail: 'user@mail.com' };
      recipeStub.resolves(recipe);
      const event = { body: JSON.stringify(recipe) };
      const res = await AdminController.upsertRecipe(event);
      assert.equal(res.statusCode, 201);
      assert.include(res.body, 'cb');
      assert.isTrue(recipeStub.calledOnce);
    });

    it('should return 400 if required fields are missing', async () => {
      const event = { body: JSON.stringify({ Name: 'Test' }) };
      const res = await AdminController.upsertRecipe(event);
      assert.equal(res.statusCode, 400);
      assert.include(res.body, 'Missing required fields');
    });

    it('should return 500 if upsertRecipe throws', async () => {
      recipeStub.rejects(new Error('fail'));
      const recipe = { Cookbook: 'cb', Name: 'name', UserEmail: 'user@mail.com' };
      const event = { body: JSON.stringify(recipe) };
      const res = await AdminController.upsertRecipe(event);
      assert.equal(res.statusCode, 500);
      assert.include(res.body, 'fail');
    });
  });
});
