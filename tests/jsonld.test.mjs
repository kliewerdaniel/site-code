/**
 * Tests for JSON-LD serialisation.
 *
 * Regression target: `jsonLd()` returned bare `JSON.stringify(data)` and the
 * result was injected with `dangerouslySetInnerHTML` into a
 * `<script type="application/ld+json">` element. `<`, `>`, `&`, U+2028 and
 * U+2029 are valid JSON but dangerous inside a script element: a literal
 * `</script>` in a post title or description would close the element early and
 * let the remainder execute. Escaping to \uXXXX is valid JSON, parses to the
 * same value, and cannot form `</script>`.
 *
 * Run: node --test tests/jsonld.test.mjs   (or `npm test`)
 */

import test from "node:test";
import assert from "node:assert/strict";

import { absoluteImage, jsonLd } from "../src/lib/seo-core.ts";

test("a title containing a script close tag cannot emit a literal </script>", () => {
  const payload = { headline: '</script><img src=x onerror=alert(1)>' };
  const out = jsonLd(payload);
  assert.ok(!out.includes("</script"), `output still contains </script>: ${out}`);
  assert.ok(!out.includes("<img"), `output still contains a raw tag: ${out}`);
});

test("escaping round-trips: JSON.parse returns the original value", () => {
  const payload = {
    headline: 'He said "hi" & <left> → right',
    description: "line sep arator",
  };
  const out = jsonLd(payload);
  assert.deepEqual(JSON.parse(out), payload);
});

test("< > and & are escaped to \\uXXXX forms", () => {
  const out = jsonLd({ a: "<b>", b: "x & y" });
  assert.ok(out.includes("\\u003c"), out);
  assert.ok(out.includes("\\u003e"), out);
  assert.ok(out.includes("\\u0026"), out);
});

test("U+2028 and U+2029 are escaped", () => {
  const out = jsonLd({ a: "  " });
  assert.ok(!out.includes(" "), out);
  assert.ok(!out.includes(" "), out);
  assert.ok(out.includes("\\u2028") && out.includes("\\u2029"), out);
});

test("a nested object graph is escaped everywhere, not just at the top level", () => {
  const out = jsonLd({
    "@graph": [
      { name: "</script>", url: "https://x.test/a?b=1&c=2" },
      { name: "safe" },
    ],
  });
  assert.ok(!out.includes("</script"), out);
  assert.ok(!out.includes("&c=2"), "query separators must be escaped too");
});

test("an already-safe payload is unchanged by escaping", () => {
  const payload = { name: "Daniel Kliewer", url: "https://www.danielkliewer.com" };
  assert.equal(jsonLd(payload), JSON.stringify(payload));
});

// ---- image resolution -----------------------------------------------------

test("absoluteImage resolves a relative path against the origin", () => {
  assert.equal(
    absoluteImage("/images/og-home.jpg", "https://www.danielkliewer.com"),
    "https://www.danielkliewer.com/images/og-home.jpg"
  );
});

test("absoluteImage leaves an absolute URL alone", () => {
  assert.equal(
    absoluteImage("https://i.imgur.com/abc.png", "https://www.danielkliewer.com"),
    "https://i.imgur.com/abc.png"
  );
});

test("absoluteImage returns undefined when there is no image", () => {
  assert.equal(absoluteImage(undefined, "https://www.danielkliewer.com"), undefined);
});
