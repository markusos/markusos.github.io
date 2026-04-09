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
        .filter(c => c.score > 0.10)
        .sort((a, b) => b.score !== a.score ? b.score - a.score : b.date - a.date)
        .slice(0, MAX_RESULTS);

      if (related.length === 0) return;

      // Render each result as a card matching the search results style
      const list = section.querySelector('.related-posts-list');
      for (const { post } of related) {
        const li = document.createElement('li');

        // Date and tags
        const meta = document.createElement('span');
        meta.className = 'post-meta';
        meta.textContent = post.date;
        if (post.tags && post.tags.length > 0) {
          meta.appendChild(document.createTextNode(' \u2022 '));
          const tagsSpan = document.createElement('span');
          tagsSpan.className = 'tags';
          for (const tag of post.tags) {
            const a = document.createElement('a');
            a.href = `${baseUrl}/tags/${tag.toLowerCase()}/`;
            a.textContent = `# ${tag.toLowerCase()}`;
            tagsSpan.appendChild(a);
          }
          meta.appendChild(tagsSpan);
        }
        li.appendChild(meta);

        // Title
        const link = document.createElement('a');
        link.className = 'post-link';
        link.href = post.url;
        link.textContent = post.title;
        li.appendChild(link);

        // Excerpt
        if (post.excerpt) {
          const p = document.createElement('p');
          p.textContent = post.excerpt;
          li.appendChild(p);
        }

        list.appendChild(li);
      }

      section.style.display = '';
    })
    .catch(e => console.error('Related posts error:', e));
})();
