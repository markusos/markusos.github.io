---
layout: post
title:  "1000 Tweets per Week"
date:   2014-12-06 12:00:00
categories: engage
comments: true
---

How do you generate and post thousands of tweets in a week? One of my first projects at Engage was to scrape data and generate tweets for all new records fetched from an external API. Your first thought might be to store the data in a database and just remove or flag the record when it has been processed and the tweet has been posted. This might work depending on your setup, but it is not a [good solution](http://programmers.stackexchange.com/questions/231410/why-database-as-queue-so-bad). A better solution is to use a work queue system, like [Beanstalkd](http://kr.github.io/beanstalkd/), to solve the problem.

> Beanstalk is a simple, fast work queue.
> Its interface is generic, but was originally designed for reducing the latency of page views in high-volume web applications by running time-consuming tasks asynchronously.

Lets use the Laravel framework and tools to quickly build something that works. Since Laravel comes with a built in queue component that handles multiple queueing services, including Beanstalkd, it's easy to setup.

Use Composer to add the dependencies for the Beanstalkd PHP library:

{% highlight php %}
$ composer require pda/pheanstalk
{% endhighlight %}

To send the tweets I used the library [twitter-api-php](https://github.com/J7mbo/twitter-api-php). Lets use Composer to add that to our dependencies too:

{% highlight php %}
$ composer require j7mbo/twitter-api-php
{% endhighlight %}

The Composer.json file should now contain something like this:

{% highlight php %}
"require": {
	"laravel/framework": "4.2.*",
	"pda/pheanstalk": "~2.0",
	"j7mbo/twitter-api-php": "dev-master"
  },
{% endhighlight %}

Run `composer install` or `composer update` to make sure that everything is installed as it should.

Using Laravel together with Beanstalk and the twitter-api-php makes is really simple to queue and send tweets just when you want them posted.

First we need to setup a class to handle the jobs that we push on the queue. Create a file QueueTweet.php in your project with the following code:

{% highlight php %}
<?php

class QueueTweet {

  public function tweet($job, $data)
  {
	$settings = array(
	  'oauth_access_token' => 'YOUR_OAUTH_ACCESS_TOKEN',
	  'oauth_access_token_secret' => 'YOUR_OAUTH_ACCESS_TOKEN_SECRET',
	  'consumer_key' => 'YOUR_CONSUMER_KEY',
	  'consumer_secret' => 'YOUR_CONSUMER_SECRET',
	);

	$url = 'https://api.twitter.com/1.1/statuses/update.json';
	$requestMethod = 'POST';

	$postFields = array(
	  'status' => $data['message'],
	);

	$twitter = new TwitterAPIExchange($settings);

	$twitter->setPostfields($postFields)
	  ->buildOauth($url, $requestMethod)
	  ->performRequest();

	$job->delete();
  }
}
{% endhighlight %}

You need to replace the strings in the `$settings` array with your Twitter access tokens. You can create your own Twitter app and generate the access tokens needed here: [apps.twitter.com](https://apps.twitter.com/).

Now we only need to push the messages on to the queue and Beanstalked will take care of the rest.

We use Laravel's built in [Queue component](http://laravel.com/docs/4.2/queues#basic-usage)  to post the job to Beanstalkd. Since I want the tweets posted spread out during the week I use the `Queue::later()` function, which allows us to add a date and time for when the job should be processed. [Carbon](https://github.com/briannesbitt/Carbon) is a great library for handeling dates in PHP, and since Laravel already is dependent on it, we don't need to import enything else to use it.

{% highlight php %}
<?php

$date = Carbon::now()->addMinutes($tweet->delay);
Queue::later($date, 'QueueTweet@tweet',
  array(
	'message' => $tweet->message
  ));
{% endhighlight %}

The only thing left to do now is to start Beanstalkd and a listener for the queue. We use Laravel's artisan command to start the queue listener.

{% highlight php %}
$ beanstalkd
$ php artisan queue:listen
{% endhighlight %}

If everything works out as it should, you should see the tweets showing up on Twitter at the set date and time.

If you run into problems and want to inspect Beanstalkd's queue you can use telnet to connect to the service and display stats for the different queues.

{% highlight php %}
$ telnet localhost 11300
$ stats			# show Beanstalkd status
$ peek-delayed 		# show the next delayed job
$ stats-job <id>	# show detaild stats of a job, peek-delayed wil give you the id.
{% endhighlight %}

More commands for Beanstalkd can be found [here](https://github.com/kr/beanstalkd/blob/master/doc/protocol.txt).

A sample implementation can be found on [Github](https://github.com/markusos/Twitter-Queue)
