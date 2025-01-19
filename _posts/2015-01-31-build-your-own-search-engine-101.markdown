---
layout: post
title:  "Build your own Search Engine 101"
date:   2015-01-31 12:00:00
categories: projects
---

For many of us, there is something magical with a search engine. You type in a few well selected words and out comes, hopefully, exactly what we are looking for. So how does it work? In this post I'll go through some of the basic building blocks needed for a basic search engine.


## Search index

First we need some place to store information about all documents we want to be able to search through, this is usually called a search index. When we do a search, the search index is used to quickly find relevant documents for the entered search query. One of the most basic implementations of a search index is using an inverse map.

E.g. Say that we have two documents:

Document A:

> "This is a document!"

Document B :

> "Another document example..."

The inverse map for these documents would then be:

{% highlight php %}
"this" => [A]
"is" => [A]
"a" => [A]
"document" => [A, B]
"another" => [B]
"example" => [B]
{% endhighlight %}

If I now want to find all documents containing the word "example" we just need to do a lookup in the inverse map with the key "example" to find that Document B is the only indexed document containing that word.

## Tokenization

We actually skipped a step here. How did we go from the document “This is a document!” to the array of tokens (or words) in that document? We use a tokenizer!

{% highlight php %}
tokenize("This is a document!") => ['this', 'is', 'a', 'document']
{% endhighlight %}

The most simple tokenizer just split the input string on space and other punctuation characters. More advanced ones tokenizer different inflections of the same word to the same token, e.g. the words ‘searched’ and ‘searching’ will both be tokenized to the base form ‘search’. This often requires a language model that the tokens can be fitted against.

For now, we can see tokenization as splitting a text into an array of the tokens it contains.

## Finding what we want

When we input a search query into the search engine we expect to get back relevant documents, and hopefully finding what we are looking for.

The first step in our simple search engine is to tokenize the search query, using the same tokenizer we used when indexing the documents.

We then do a lookup in our search index for all documents that contains any of the tokens in the search. Depending on the search terms and the size of your index, this might return just a few or several thousand documents.

This leads us in on how to rank the found documents on how relevant they are to the given search query.

### TF-IDF

TF-IDF, which stands for Term frequency - inverse document frequency, is a classical metric in information retrieval. It is mainly used as a measure of a term’s importance in a document. TF-IDF is often used in search engines to rank how relevant different documents are to a specific search query.

Term frequency (TF) is the number of occurrences of a specific term (t) in a text document (d), sometimes normalized by dividing by the number of terms in the document.

Inverse document frequency (IDF) is used to weigh the terms importance in the whole corpus (C). It is calculated as the logarithm of the total number of documents dividing by the number of documents containing the specific term (t).

By multiplying the term frequency with the inverse document frequency, we get the TF-IDF metric.

$$
TF-IDF(t, d, C) = \frac{frequency(t,d)}{length(d)} * log_e\left(\frac{size(C)}{count(t, C)}\right)
$$

### Cosine similarity

If we want to allow your search queries to contain more than one word, we need some way of measure how similar a search query is to a document. Cosine similarity is a similarity measure often used in search engines. It treats each document as a vector in a multidimensional space and the measure gives the cosine of the angle between them. This gives us a number between 0 and 1, where 1 represents a perfect match.

To rank the documents, the search engine calculates the cosine similarity between the given query and all the found documents.

$$
Similarity(d, q) = \frac{d \centerdot q}{\|d\| \|q\| }
$$

The weights used to calculate the dot product between a document d and the query q is the TF-IDF scores for each token in the query, calculated both on the query and for the document.

$$
d \centerdot d = d[0] q[0] + d[1] q[1] + ... + d[n] q[n]
$$

$$
\|d\| = \sqrt{d[0]^2 + d[1]^2 + ... + d[n]^2}
$$

Where d[0] and q[0] is the TF-IDF score of the first token in the query for the document and the query respectively.

E.g Given the query:

 >"computer architecture"

 and the document:

 > "computer architecture is a set of disciplines that describes a computer system by specifying its parts and their relations."

We calculate:

{% highlight php %}
q[0] = TF-IDF('computer', 'computer architecture', C)
q[1] = TF-IDF('architecture', 'computer architecture', C)
d[0] = TF-IDF('computer', 'computer architecture is a...' , C)
d[1] = TF-IDF('architecture', 'computer architecture is a...' , C)
{% endhighlight %}

Documents with a higher cosine similarity is then seen as better matches to the query than documents with a low cosine similarity, and they are therefore ranked higher in the result.

## Final words

This post is just touching on some some basic concepts that are used in search engines. There are tonnes of more concepts and techniques used in search engines like Google, but hopefully this got you interested to learn more.

A sample implementation of the concepts discussed in this post can be found on [Github](https://github.com/markusos/simple-search-php).
