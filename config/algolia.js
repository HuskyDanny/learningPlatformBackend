const algoliasearch = require("algoliasearch");

const client = algoliasearch(
  process.env.APPLICATION_ID,
  process.env.SEARCH_ADMIN_API,
  {
    protocol: "https:"
  }
);

const index = client.initIndex("posts");
const algoliaSchema = [
  "title",
  "tags",
  "author",
  "likes",
  "post_date",
  "post_date_timestamp"
];

index.setSettings({
  searchableAttributes: ["title", "tags"]
});

module.exports.index = index;
module.exports.algoliaSchema = algoliaSchema;
