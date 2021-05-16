---
layout: post
title:  "Automatically solve Kuku-Kube with JavaScript"
date:   2015-04-10 23:59:00
categories: engage
---

Yesterday during my lunch break one of my co-workers introduced me, and the other developers at Engage, to the color puzzle game [Kuku-Kube](http://www.kuku-kube.com/). The goal of the game is to as quickly as possible identify and click on a uniquely colored square in a grid of squares. The game has been featured on a number of big sites during the last day, including [Reddit](http://www.reddit.com/r/InternetIsBeautiful/comments/31xz0w/test_your_color_perception/) and [Business Insider](http://www.businessinsider.com/what-is-kukukube-2015-4). This post is about how I build an automatic solver in JavaScript over a lunch break.

![Kuku-Kube Easy]({{site.url}}/assets/KukuKubeEasy.png){: .center-image }

It starts off easy, with just a few squares and a significant difference between the colors. But as you play it quickly gets harder. The number of squares increase and the difference in color decrease. After just a few successful clicks there is only a small difference in hue between one square and all the other squares in the grid.

After giving it a few tries I came up with the idea of writing a script that automatically plays the game. The plan was to see what kind of score a perfect player would get compare to the scores we got when we played ourselves.

![Kuku-Kube Hard]({{site.url}}/assets/KukuKubeHard.png){: .center-image }

I wanted the script to play the perfect game, so just clicking on every square was out of the question. That is too easy and can be done with just a few lines of javascript.

A few minutes later the first version of the script was ready. The script algorithm was designed to as quickly as possible identify a uniquely colored square and then click on it. This is done by inspecting the color of the squares one by one until the script has seen two different colors, where one color has been seen only once and the other has been seen at least twice.

Since the game always only contains two colors we assume that if a color has been seen twice it is not a unique color. Therefore a square of another color that has only been seen once has to be unique. This assumption lets us avoid looking at every square before we can find the unique one.

After each click, the script sleeps 10 ms to let the game load a new set of squares. This also lets the game timer work (almost) normal.

Below follows the code for the script. It can also be found on [Github](https://gist.github.com/markusos/bd58f2ee6abc2e4010cb).

{% highlight javascript %}

/* KukuKube Solver
 *
 * Solves the color tests on www.kuku-kube.com automatically.
 * To run this, run the javascript code below in the
 * browsers developer console.
 * The script identifies the uniquely colored box in the box  
 * grid and uses javascript to click on it.
 *
 * WARNING: Don't run the script if you have epilepsy!
 *  It will flash different colors fast when it solves the color tests.
 *
 * MIT License (MIT)
 * Copyright (c) 2015 Markus Östberg
 */

var KukuKube = function ($) {

    function startTest() {
        var start = $('.play-btn:visible');

        if (start.size() === 1) {
            start.first().click();
            solveKukuKube();
        } else {
            console.log('Could not find start button.');
        }
    }

    function solveKukuKube() {
        var boxes = $("#box").find("span");

        // Get the color of the first box as a baseline
        var color = boxes.first().css('backgroundColor');

        var colorCount = 0, secondColorCount = 0;
        var colorPosition, secondColorPosition;

        boxes.each(function(i) {

            // Count color occurrences
            if ($(this).css('backgroundColor') === color) {
                colorCount += 1;
                colorPosition = i;
            } else {
                secondColorCount += 1;
                secondColorPosition = i;
            }

            if (secondColorCount === 1 && colorCount >= 2) {
                boxes[secondColorPosition].click();
                return false;
            }

            if (colorCount === 1 && secondColorCount >= 2) {
                boxes[colorPosition].click();
                return false;
            }
        });

        // Check if game is over
        if ($('.gameover:visible').size() > 0) {
            console.log('Game Over!');
        }
        else {
            // Game is still running, solve the next one!
            setTimeout(solveKukuKube, 10);
        }
    }

    return {
        init: function () {
            startTest();
        }
    };

}(jQuery);

jQuery(KukuKube.init);

{% endhighlight %}

So there we have it; a somewhat worthless piece of code that automatically plays a browser game that's probably gone again in a few days. But it was a fun lunch break challenge and a way for me to clear my mind of my other work projects for a few minutes.

And one last thing. Try beating it yourself, if you can:

![Kuku-Kube HighScore]({{site.url}}/assets/KukuKubeHighScore.png){: .center-image }
