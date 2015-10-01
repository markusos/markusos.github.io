---
layout: post
title:  "Brew after updating to El Capitan"
date:   2015-09-30 22:30:00
categories: projects
comments: true
---

If you're an early adopter, like me, you probably also spent a few hours today installing the latest version of Apple's newest OS X version, *El Capitan (OS X 10.11)*. If you use your Mac for any kind of development, chances are you also have the Mac's missing package manager, Brew, installed. As with any time Apple releases an update, there is some tinkering to be done to get everything running again. In this post I'll go through some of the problems I ran into with Brew after updating to *El Capitan* and how to solve them.

![El Capitan]({{ site.url }}assets/elcapitan.png){: .center-image }

The first step is to make sure that the latest version of Brew is installed. To do this, use the command `brew update`. You might run into this error message:

{% highlight php %}
$ brew update
...
error: unable to unlink old '.gitignore' (Permission denied)
Error: Failure while executing: git pull --quiet origin refs/heads/master:refs/remotes/origin/master
{% endhighlight %}

This is probably caused by the OS X update process resetting the folder owner of the `/usr/local` folders. By running `sudo chown -R $(whoami) /usr/local` you can reset the folder owner for all subfolders to the currently logged in user on your system. After that, the `brew update` command should hopefully work fine.

The next step is to run `brew upgrade` to upgrade all installed packages to the last version. Here you might run in to a couple of different errors; I ran into this error, among a few other:

{% highlight php %}
$ brew upgrade
...
configure: error: C compiler cannot create executables
{% endhighlight %}

This is most likely caused by an outdated or misconfigured C compiler. If you see this, you can try to update to the latest version of the Xcode command line tools. By running the command `xcode-select --install` and following the steps of the installer will update the Xcode command line tools to the new version 7.0. You can also install the newest version of Xcode through the App store. If you run into any more problems the `brew doctor` command can give you more hints to what might be wrong.

I hope this post eases your transition to *El Capitan*. Did you run into any other problems after updating *OS X El Capitan*, leave a comment bellow.
