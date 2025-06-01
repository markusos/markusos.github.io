---
layout: post
title:  "Create a site map using CasperJS and Graphviz"
date:   2016-01-07 22:30:00
categories: projects
tags:
    - Dev
    - JavaScript
    - Web
---

I recently challenged myself to start learning CasperJS, a scripting tool that is using the PhantomJS WebKit headless browser to navigate the web. For one of my first projects, I decided to build a site map generation script. Since I was already familiar with the Graphviz tools I decided to use the Graphviz sfdp command-line tool to generate visual site maps. This post is a short introduction to the tool, and how to use it.

> CasperJS is an open-source navigation scripting & testing utility written in Javascript for the PhantomJS WebKit headless browser and SlimerJS (Gecko). It eases the process of defining a full navigation scenario and provides useful high-level functions, methods & syntactic sugar. - [casperjs](https://github.com/casperjs/casperjs)

The site mapper tool is available on [Github](https://github.com/markusos/site-mapper).

### How to use:

Install CasperJS, for more instructions see here: [github.com/casperjs/casperjs](https://github.com/casperjs/casperjs)

{% highlight bash %}
$ brew install casperjs --devel
{% endhighlight %}

Run the scrip to crawl your website, in this case this site "http://markusos.github.io/:

{% highlight bash %}
$ casperjs sitemap.js http://markusos.github.io/ > map.dot
{% endhighlight %}

This scrapes the provided site by following all publicly accessible internal links the crawler can find on the site. The script outputs the site structure in [DOT format](https://en.wikipedia.org/wiki/DOT_(graph_description_language)) to the terminals standard output and can easily be piped to a file for further processing.

If you want to generate a visual site map graph from the DOT file output, you need to have Graphviz installed. Use Brew to install it, or if you don't have a Mac with Brew get it from here: [www.graphviz.org](http://www.graphviz.org/Download.php)

{% highlight bash %}
$ brew install graphviz --with-gts
{% endhighlight %}

Run Graphviz on the site map DOT file with this command:

{% highlight bash %}
$ sfdp -Tsvg map.dot -o sitemap.svg
{% endhighlight %}

This creates an SVG image of the site map. It could look something like this:

[![Site map]({{site.url}}/assets/sitemap.png){: .center-image }]({{site.url}}/assets/sitemap.png)

Have any questions or ways to improve the script? Leave a question here below!

> <span><svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg> **Update:**</span>
>
> The original CasperJS project has been archived, and it is no longer actively maintained. For new projects, consider using alternatives like [Puppeteer](https://pptr.dev/)
>
>The site-mapper project has been updated to use Puppeteer instead of CasperJS. The new version is available in the old Github repository: [markusos/site-mapper](https://github.com/markusos/site-mapper)
