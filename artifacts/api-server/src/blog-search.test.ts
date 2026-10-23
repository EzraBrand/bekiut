import { expect, it, vi } from "vitest";
vi.mock("fs", () => ({ default: { readFileSync: () => JSON.stringify({ posts: [{
  id: "test", title: "Study", subtitle: "", tractate: "Berakhot", location: "2a",
  keywords: [], blogUrl: "", excerpt: "", contentText: "a".repeat(100000) + "!",
}] }) } }));
import { BlogPostSearch } from "./blog-search";

it("treats pathological patterns and invalid regex syntax as literal keywords", () => {
  const search = new BlogPostSearch();
  expect(search.search({ keywords: ["(a+)+$", "[", ".*", ""] })[0].relevanceScore).toBe(0);
  expect(search.search({ keywords: ["aaa"] })[0].relevanceScore).toBe(5);
});
