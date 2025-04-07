---
layout: post
title:  "Snowball stemming in PHP"
date:   2015-02-22 17:00:00
categories: projects
tags:
    - Dev
    - PHP
    - Search
---

When working on my PHP search engine I needed a stemmer to improve the tokenization and search index. After some research, I found the [PECL Stem package](http://pecl.php.net/package/stem), which uses the [Snowball Stemming algorithm](http://snowball.tartarus.org/texts/introduction.html) and has support for multiple languages. Exactly what I needed!

The PECL Stem package supports the following languages through these functions:

- **Danish** => stem_danish()
- **Dutch** => stem_dutch()
- **English** => stem_english()
- **Finnish** => stem_finnish()
- **French** => stem_french()
- **German** => stem_german()
- **Hungarian** => stem_hungarian()
- **Italian** => stem_italian()
- **Norwegian** => stem_norwegian()
- **Portuguese** => stem_portuguese()
- **Romanian** => stem_romanian()
- **Russian** => stem_russian_unicode()
- **Spanish** => stem_spanish()
- **Swedish** => stem_swedish()
- **Turkish** => stem_turkish_unicode()

To install, run:

{% highlight bash %}
$ pecl install stem
{% endhighlight %}

During the installation process, you will be prompted which languages to install support for. Make sure you select [yes] for all the languages you want to use.

After the extension is installed, make sure that your php.ini file contains the line:

{% highlight php %}
extension="stem.so"
{% endhighlight %}

Remember to reload apache, or whatever webserver you are using.

To check that if the extension has been correctly loaded by PHP, run:
{% highlight bash %}
$ php -i | grep 'stem support'
{% endhighlight %}

It should output: ```stem support => enabled```

Example of how to use:

{% highlight php %}
<?php

echo stem_english('computer'); // Prints the stem "comput"
echo stem_swedish('datorer');  // Prints the stem "dator"

{% endhighlight %}

