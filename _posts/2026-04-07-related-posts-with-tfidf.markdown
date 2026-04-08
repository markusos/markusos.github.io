---
layout: post
title:  "Content Recommendation on GitHub Pages with TF-IDF"
date:   2026-04-07 12:00:00
categories: projects
tags:
    - Dev
    - Search
    - Web
    - Jekyll
    - JavaScript
---

In a [previous post]({{ site.baseurl }}/projects/2025/02/16/adding-search-to-github-pages.html) I added client-side search to this blog using a pre-built search index and TF-IDF scoring. The same index turns out to be all you need to build a related posts feature too, with no changes to the Jekyll build.

[![Related Pages]({{site.url}}/assets/related-pages.png){: .center-image }]({{site.url}}/assets/related-pages.png)


## What is TF-IDF?

TF-IDF stands for **Term Frequency–Inverse Document Frequency**. It weights how important a word is to a document in a collection. A word that appears often in a post but rarely across the blog gets a high weight; a word that appears everywhere (like "the") gets a weight near zero.

For a term $t$ in document $d$ across a collection of $N$ documents:

$$
TF(t, d) = \frac{\text{count of } t \text{ in } d}{\text{total terms in } d}
$$

$$
IDF(t) = \log\left(\frac{N}{df(t)}\right)
$$

$$
\text{TF-IDF}(t, d) = TF(t, d) \times IDF(t)
$$

where $df(t)$ is the number of documents containing term $t$. The resulting weights give you a vector that describes what a post is about in terms the rest of the collection does not share.

## From Search to Recommendation

The search implementation scores a query against each document. Recommendation is the same idea, but instead of a query you use another document. Once each post is a TF-IDF vector, you can compare any two of them using **cosine similarity**:

$$
\text{sim}(A, B) = \frac{A \centerdot B}{\|A\| \|B\|}
$$

Posts that share rare vocabulary score close to 1. Posts with nothing in common score close to 0. Because IDF already down-weights common terms, shared boilerplate does not inflate the score.

## Reusing the Search Index

The search index built at Jekyll compile time already has everything we need. Each entry contains raw term counts in a `keywords` object:

```json
{
    "title": "Build your own Search Engine 101",
    "date": "Jan 31, 2015",
    "tags": ["Dev", "Search"],
    "keywords": {
        "search": 26,
        "engine": 6,
        "document": 24,
        "frequency": 7
    },
    "url": "/projects/2015/01/31/build-your-own-search-engine-101.html",
    "excerpt": "For many of us, there is something magical with a search engine..."
}
```

We can compute TF-IDF vectors from those counts entirely client-side.

## Implementation

The post layout includes a hidden HTML shell that JavaScript populates after the page loads:

#### _includes/related-posts.html
{% raw %}
```html
{% if page.url %}
<section class="related-posts" id="related-posts" style="display:none"
  data-url="{{ page.url | relative_url }}"
  data-baseurl="{{ site.baseurl }}">
  <h3 class="related-posts-title">Related Posts</h3>
  <ul class="related-posts-list"></ul>
</section>
{% endif %}
```
{% endraw %}

The script fetches the search index, computes IDF across all posts, builds TF-IDF vectors, and ranks every other post by cosine similarity against the current one. If there are results, it fills in the list and shows the section.

#### assets/js/related-posts.js
```javascript
(function () {
  const section = document.getElementById('related-posts');
  if (!section) return;

  const currentUrl = section.dataset.url;
  const baseUrl = section.dataset.baseurl;
  const MAX_RESULTS = 3;

  fetch(baseUrl + '/search_index.json')
    .then(r => r.json())
    .then(index => {
      const N = index.length;

      // Document frequency: number of posts each term appears in
      const df = {};
      for (const post of index) {
        for (const term of Object.keys(post.keywords)) {
          df[term] = (df[term] || 0) + 1;
        }
      }

      // Inverse document frequency: terms in many posts get low weight
      const idf = {};
      for (const term of Object.keys(df)) {
        idf[term] = Math.log(N / df[term]);
      }

      // Build a TF-IDF vector from a post's keyword counts.
      // Term frequency is normalised by document length so that
      // short and long posts are comparable.
      function toVector(post) {
        const vec = {};
        const total = Object.values(post.keywords).reduce((s, n) => s + n, 0);
        if (total === 0) return vec;
        for (const [term, count] of Object.entries(post.keywords)) {
          vec[term] = (count / total) * (idf[term] || 0);
        }
        return vec;
      }

      // Cosine similarity between two sparse vectors.
      // Only iterates over non-zero entries, so cost is proportional
      // to vocabulary overlap rather than total vocabulary size.
      function cosine(a, b) {
        let dot = 0, magA = 0, magB = 0;
        for (const [t, w] of Object.entries(a)) {
          dot += w * (b[t] || 0);
          magA += w * w;
        }
        for (const w of Object.values(b)) {
          magB += w * w;
        }
        return (magA && magB) ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
      }

      const currentPost = index.find(p => p.url === currentUrl);
      if (!currentPost) return;

      const currentVec = toVector(currentPost);

      // Score every other post against the current one, then take the
      // top results. Date is used as a tiebreaker: newer posts first.
      const related = index
        .filter(p => p.url !== currentUrl)
        .map(p => ({
          post: p,
          score: cosine(currentVec, toVector(p)),
          date: new Date(p.date)
        }))
        .filter(c => c.score > 0)
        .sort((a, b) => b.score !== a.score ? b.score - a.score : b.date - a.date)
        .slice(0, MAX_RESULTS);

      if (related.length === 0) return;

      // Render results as cards and show the section
      const list = section.querySelector('.related-posts-list');
      // ... DOM rendering omitted for brevity
      section.style.display = '';
    })
    .catch(e => console.error('Related posts error:', e));
})();
```

The full file including the DOM rendering code that builds each card is on [GitHub](https://github.com/markusos/markusos.github.io/blob/master/assets/js/related-posts.js). The rendering just creates list items with the same structure as the search results page so they share the same card styling.

The script is loaded with `defer` in the site `<head>` so it does not block page rendering.

## Tradeoffs

The algorithm works from post content alone, so it does not need manual categorization or tagging to produce results. If a post has nothing in common with the rest of the blog, its scores will all be low and the section simply will not appear.

IDF is computed at runtime across the whole collection, so the weights stay calibrated as the blog grows. A term that is rare today might become common after ten more posts on the same topic, and the recommendations will shift the next time the search index is rebuilt.

The main limitation is the search index itself. It tokenizes content with Liquid at build time, so there is no stemming. "search" and "searching" are treated as different terms. For a personal blog this has not been a problem in practice.

## Conclusion

The search index already has enough information per post to power a content-based recommendation system. Adding related posts was mostly a matter of writing a cosine similarity function and wiring it into the post layout.
