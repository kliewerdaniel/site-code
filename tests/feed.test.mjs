/**
 * Tests for the RSS 2.0 feed renderer (src/lib/seo-core.ts).
 *
 * Locks the shape of the feed: a valid document with an Atom self link, a
 * truthful lastBuildDate, per-item dc:creator and category elements, and XML
 * escaping that cannot be broken by a title containing a tag.
 *
 * Run: node --test tests/        (or `npm test`)
 */

import test from "node:test";
import assert from "node:assert/strict";

import { escapeXml, feedItemXml, feedXml } from "../src/lib/seo-core.ts";

const CHANNEL = {
  title: "Daniel Kliewer — Research",
  link: "https://www.danielkliewer.com",
  description: "Local-first AI systems.",
  lastBuildDate: "Mon, 26 Oct 2026 00:00:00 GMT",
  items: [
    {
      title: "A post",
      link: "https://www.danielkliewer.com/blog/a-post",
      description: "About <things> & stuff",
      pubDate: "Fri, 02 Jan 2026 00:00:00 GMT",
      creator: "Daniel Kliewer",
      categories: ["rag", "local-first"],
    },
  ],
};

test("feedXml: declares the Atom and Dublin Core namespaces", () => {
  const xml = feedXml(CHANNEL);
  assert.match(xml, /xmlns:atom="http:\/\/www\.w3\.org\/2005\/Atom"/);
  assert.match(xml, /xmlns:dc="http:\/\/purl\.org\/dc\/elements\/1\.1\/"/);
});

test("feedXml: emits an atom:link rel=self pointing at the feed", () => {
  const xml = feedXml(CHANNEL);
  assert.match(
    xml,
    /<atom:link href="https:\/\/www\.danielkliewer\.com\/feed\.xml" rel="self" type="application\/rss\+xml" \/>/
  );
});

test("feedXml: emits lastBuildDate", () => {
  const xml = feedXml(CHANNEL);
  assert.match(xml, /<lastBuildDate>Mon, 26 Oct 2026 00:00:00 GMT<\/lastBuildDate>/);
});

test("feedXml: emits one <item> with guid, creator and categories", () => {
  const xml = feedXml(CHANNEL);
  assert.match(xml, /<guid isPermaLink="true">https:\/\/www\.danielkliewer\.com\/blog\/a-post<\/guid>/);
  assert.match(xml, /<dc:creator>Daniel Kliewer<\/dc:creator>/);
  assert.match(xml, /<category>rag<\/category>/);
  assert.match(xml, /<category>local-first<\/category>/);
  // guid is unchanged from the previous feed, so subscribers see no duplicates.
  assert.equal((xml.match(/<guid /g) ?? []).length, CHANNEL.items.length);
});

test("feedXml: escapes XML metacharacters in every field", () => {
  const xml = feedXml(CHANNEL);
  assert.ok(!xml.includes("<things>"));
  assert.match(xml, /About &lt;things&gt; &amp; stuff/);
  assert.ok(!xml.includes("& stuff\n"));
});

test("feedItemXml: a title containing a tag is escaped, not injected", () => {
  const xml = feedItemXml({
    title: "</title><script>alert(1)</script>",
    link: "https://example.com/a",
    description: "d",
    pubDate: "Fri, 02 Jan 2026 00:00:00 GMT",
    creator: "Daniel Kliewer",
    categories: [],
  });
  assert.ok(!xml.includes("<script>"));
  assert.match(xml, /&lt;\/title&gt;/);
});

test("escapeXml: escapes all five XML metacharacters", () => {
  assert.equal(escapeXml(`&<>"'`), "&amp;&lt;&gt;&quot;&apos;");
});

test("feedXml: an empty item list still yields a well-formed document", () => {
  const xml = feedXml({ ...CHANNEL, items: [] });
  assert.match(xml, /<rss version="2\.0"/);
  assert.ok(!xml.includes("<item>"));
});
