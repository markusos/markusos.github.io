---
layout: post
title:  "How to build a Web scraper with DOM parsing in 10 minutes"
date:   2015-08-25 22:30:00
categories: projects
comments: true
---

API:s are a developers best friends when accessing remote data, but great API:s does not grow on trees. So what do you do when the data you need isn't accessible through a well designed API, or no API at all for that matter? As long as the data is accessible through your Web browser, you can always just scrape it yourself! In this post I'll go through how to build a simple Web scraper in 10 min using Guzzle and PHP's DOM parser. I'll also give a brief introduction to XPaths.

> Web scraping is the art of fetching and parsing a Web document to extract information.

When scraping a Web site we first need to request the page and receive the page HTML DOM tree. There are a bunch of tools that could be used for this. One of the more well known tools is [cURL](http://php.net/manual/en/book.curl.php), a library and command-line tool that can be used to transfer data using a wide range of protocols, including http.

After we have received the HTML DOM from the Web server it is time to parse the DOM tree to extract the information we want. The most naive way is to do this with string operations and regular expressions. This is usually very time consuming for more complex HTML documents and it usually doesn't work too well if the HTML DOM changes slightly. A more robust solution is to use a DOM parser library with either CSS selectors or XPath's to query the DOM for the DOM elements that contains the information we want to extract. PHP has a decent built in DOM parser in one of the languages [default extention](http://php.net/manual/en/book.dom.php).

In the basic scrape class below I use the [Guzzle](http://guzzle.readthedocs.org/) PHP library to request and receive the site HTML DOM. Then I use PHP's DOM parser library to parse the DOM tree for the nodes containing information. 

{% highlight php %}

<?php namespace Scrape;

/**
 * A basic web scraper class
 * @author Markus Östberg <markusos@kth.se>
 */

use \DOMXPath;
use \DOMDocument;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ConnectException;

/**
 * Class Scrape
 * @package Scrape
 */
class Scrape
{
    /**
     * @var Client
     */
    private $webClient;
    /**
     * @var DOMDocument
     */
    private $dom;

    /**
     * Init scraper to scrape $site
     * @param string $site Site to scrape
     * @param int $timeout seconds before request times out. 
     */
    public function __construct($site, $timeout = 2)
    {
        $this->webClient = new Client([
                'base_uri' => $site,
                'timeout' => $timeout
            ]);
    }

    /**
     * Load sub page to site.
     * E.g, '/' loads the site root page
     * @param string $page Page to load
     * @return $this
     */
    public function load($page) {

        try {
            $response = $this->webClient->get($page);
        } catch(ConnectException $e) {
            throw new \RuntimeException(
                    $e->getHandlerContext()['error']
                );
        }

        $html = $response->getBody();

        $this->dom = new DOMDocument;

        // Ignore errors caused by unsupported HTML5 tags
        libxml_use_internal_errors(true);
        $this->dom->loadHTML($html);
        libxml_clear_errors();

        return $this;
    }

    /**
     * Get first nodes matching xpath query
     * below parent node in DOM tree
     * @param $xpath string selector to query the DOM
     * @param $parent \DOMNode to use as query root node
     * @return \DOMNode
     */
    public function getNode($xpath, $parent=null) {
        $nodes = $this->getNodes($xpath, $parent);

        if ($nodes->length === 0) {
            throw new \RuntimeException("No matching node found");
        }

        return $nodes[0];
    }

    /**
     * Get all nodes matching xpath query
     * below parent node in DOM tree
     * @param $xpath string selector to query the DOM
     * @param $parent \DOMNode to use as query root node
     * @return \DOMNodeList
     */
    public function getNodes($xpath, $parent=null) {
        $DomXpath = new DOMXPath($this->dom);
        $nodes = $DomXpath->query($xpath, $parent);
        return $nodes;
    }
}

{% endhighlight %}

Now how do we use this class to scrape a Web page? First we need to understand what an XPath is and how to use it.

## XPath

If you've ever written CSS you should know what a CSS selector is. XPaths stands for XML Path Language and is a query language, just like CSS selectors, used for selecting nodes from an XML or HTML DOM tree. Most modern browsers support XPaths in their development console, so press `Ctrl` + `Shift` + `I` if you are on Chrome in Windows or `Cmd` + `Opt` + `I` on Crome in OSX and type in this:

{% highlight php %}

$x('//b[@id="test"]');

{% endhighlight %}

When you hit enter is should return <b id='test' data-hello='Cool right? You have just written your first XPath!'>this element</b>.

So how does it work? The first part, `//` tells the parser to start at the root of the document. `b` filters it down to all \<b\> tags on the page. The brackets `[]` right next to the `b` tells the parser to match attributes on the `b` elements. `@id="test"` is used to only match the node where the attribute id equals "test". Let's look at some more examples of how we can select the same node, If you want you can look at the DOM and try to figure out how it works:

{% highlight php %}

$x('//b');
$x('//article/p/b');
$x('//article//b');
$x('//article/*/b');
$x('//article[@class="post-content"]/p/b');
$x('//*[@id="test"]');

{% endhighlight %}

## Putting it all together

Now lets use the scraper class and our knowledge about XPaths to scrape the root page of this site:

{% highlight php %}
<?php

$scraper = new Scrape('http://markusos.github.io/');
$scraper->load('/');

$siteTitle = $scraper->getNode('//a[@class="site-title"]');
echo $siteTitle->nodeValue;

$posts = $scraper->getNodes('//ul[@class="post-list"]/li');

foreach($posts as $post) {
  $postLink = $scraper->getNode('./h2/a[@class="post-link"]', $post);
  $date = $scraper->getNode('./span[@class="post-meta"]', $post);
  $excerpt = $scraper->getNode('./p', $post);

  echo $postLink->nodeValue;
  echo $postLink->getAttribute('href');
  echo $date->nodeValue;
  echo $excerpt->nodeValue;
}

{% endhighlight %}

When you run this it should print out a list of all the posts and the corresponding data available on the home page of this site.

If you read this far, I hope that you found this introduction to scraping useful. If you have any questions regarding XPaths or something else in this article, just post in the comment section below and I'd be happy to help. The source code is also available on [GitHub](https://github.com/markusos/scrape/).
