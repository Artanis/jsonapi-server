"use strict";
var request = require("request");
var assert = require("assert");
var helpers = require("./helpers.js");
var jsonApiTestServer = require("../example/server.js");


describe("Testing jsonapi-server", function() {
  describe("Creating a new resource", function() {
    it("errors with invalid type", function(done) {
      var data = {
        method: "post",
        url: "http://localhost:16006/rest/foobar"
      };
      request(data, function(err, res, json) {
        assert.equal(err, null);
        json = helpers.validateError(json);
        assert.equal(res.statusCode, "404", "Expecting 404");

        done();
      });
    });

    it("errors if resource doesnt validate", function(done) {
      var data = {
        method: "post",
        url: "http://localhost:16006/rest/photos",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "data": {
            "type": "photos",
            "attributes": {
              "title": "Ember Hamster",
              "height": 512,
              "width": 1024
            },
            "relationships": {
              "photographer": {
                "data": { "type": "people", "id": "cc5cca2e-0dd8-4b95-8cfc-a11230e73116" }
              }
            }
          }
        })
      };
      request(data, function(err, res, json) {
        assert.equal(err, null);
        json = helpers.validateError(json);
        assert.equal(res.statusCode, "403", "Expecting 403");

        done();
      });
    });

    it("errors if no body is detected", function(done) {
      var data = {
        method: "post",
        url: "http://localhost:16006/rest/photos"
      };
      request(data, function(err, res, json) {
        assert.equal(err, null);
        json = helpers.validateError(json);
        assert.equal(res.statusCode, "403", "Expecting 403");

        done();
      });
    });

    describe("creates a resource", function() {
      var id;

      it("works", function(done) {
        var data = {
          method: "post",
          url: "http://localhost:16006/rest/photos",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "data": {
              "type": "photos",
              "attributes": {
                "title": "Ember Hamster",
                "url": "http://example.com/images/productivity.png",
                "height": 512,
                "width": 1024
              },
              "relationships": {
                "photographer": {
                  "data": { "type": "people", "id": "cc5cca2e-0dd8-4b95-8cfc-a11230e73116" }
                }
              }
            }
          })
        };
        request(data, function(err, res, json) {
          assert.equal(err, null);
          json = helpers.validateJson(json);

          assert.equal(res.statusCode, "201", "Expecting 201");
          assert.equal(json.data.type, "photos", "Should be a people resource");
          helpers.validatePhoto(json.data);
          id = json.data.id;

          done();
        });
      });

      it("new resource is retrievable", function(done) {
        var url = "http://localhost:16006/rest/photos/" + id;
        request.get(url, function(err, res, json) {
          assert.equal(err, null);
          json = helpers.validateJson(json);

          assert.equal(res.statusCode, "200", "Expecting 200 OK");
          assert.equal(json.included.length, 0, "Should be no included resources");
          helpers.validatePhoto(json.data);

          done();
        });
      });
    });
  });

  before(function() {
    jsonApiTestServer.start();
  });
  after(function() {
    jsonApiTestServer.close();
  });
});
