---
layout: post
title:  "Create a site map using CasperJS and Graphviz"
date:   2016-01-07 22:30:00
categories: projects
comments: true
---

I recently challenged myself to start learning CasperJS, a scripting tool that is using the PhantomJS WebKit headless browser to navigate the web. For one of my first projects I decided to build a site map generation script. Since I was already familiar with the Graphviz tools I decided to use the Graphviz sfdp command line tool to generate visual site maps. This post is is a short introduction to the tool, and how to use it.

> CasperJS is an open source navigation scripting & testing utility written in Javascript for the PhantomJS WebKit headless browser and SlimerJS (Gecko). It eases the process of defining a full navigation scenario and provides useful high-level functions, methods & syntactic sugar. - [casperjs.org](http://casperjs.org/)

The site mapper tool is available on [Github](https://github.com/markusos/site-mapper).

### How to use:

Install CasperJS, for more instructions see here: [docs.casperjs.org](http://docs.casperjs.org/en/latest/installation.html)

{% highlight php %}
$ brew install casperjs --devel
{% endhighlight %}

Run the scrip to crawl your website, in this case this site "http://markusos.github.io/:

{% highlight php %}
$ casperjs sitemap.js http://markusos.github.io/ > map.dot
{% endhighlight %}

This scrapes the provided site by following all publicly accessible internal links the crawler can find on the site. The script outputs the site structure in [DOT format](https://en.wikipedia.org/wiki/DOT_(graph_description_language)) to the terminals standard output and can easily be piped to a file for further processing.

If you want to generate a visual site map graph from the DOT file output, you need to have Graphviz installed. Use Brew to install it, or if you don't have a Mac with Brew get it from here: [www.graphviz.org](http://www.graphviz.org/Download.php)

{% highlight php %}
$ brew install graphviz --with-gts
{% endhighlight %}

Run Graphviz on the site map DOT file with this command:

{% highlight php %}
$ sfdp -Tsvg map.dot -o sitemap.svg
{% endhighlight %}

This creates an SVG image of the site map. It could look something like this:

[![Site map]({{ site.url }}assets/sitemap.png){: .center-image }]({{ site.url }}assets/sitemap.png)

Have any questions or ways to improve the script? Leave a question here below!
