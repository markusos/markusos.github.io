---
layout: post
title:  "Dockerizing a PHP project - A short introduction"
date:   2015-07-21 22:30:00
categories: projects
comments: true
---

After using Vagrant and VirtualBox at Engage for several months I finally stumbled over a project at work where I got the opportunity to learn learn and use Docker. Inspired by my newly acquired knowledge I wanted to experiment more with Docker so I decided to "Dockerize" my latest side project.

> Docker is a platform for developers and sysadmins to develop, ship, and run applications. Docker lets you quickly assemble applications from components and eliminates the friction that can come when shipping code. - [Docker.com](https://www.docker.com/)

The simple search engine project I worked on a few months back was a perfect candidate for Dockerization since it had dependencies on multiple services, databases and libraries. Running the project on my local machine was a hassle and I had yet to set up a Vagrant box for it.

### Get Docker up and running

There are many great tutorials out there, so I'm not going to dive to deeply into how to set up docker on your local machine. If you, like me, are using a Mac for your development I suggest you start of here: [docs.docker.com/installation/mac/](https://docs.docker.com/installation/mac/) to read about what you need to install Docker. In this post I'll use Boot2Docker and Docker-Compose to setup and run my PHP application.

![boot2docker]({{ site.url }}assets/boot2docker.png){: .center-image }

Since Docker does not run natively on Mac you need to run it inside a Virtual Machine. Boot2Docker is a lightweight VM custom built for running Docker. If you have used Vagrant before, you'll feel right at home. Follow the installation guide in Dockers documentation for Mac and you should be ready in no time. If you already have [VirtualBox](https://www.virtualbox.org/) and my favorite package manager for Mac, [Brew](http://brew.sh/), installed; all you need to do is to run:

{% highlight php %}

$ brew install docker
$ brew install boot2docker
$ boot2docker init
$ boot2docker up

{% endhighlight %}

The next step is to install Docker-Compose. It is another great tool, used to defines multi-container applications. It basically keeps track of how to initialize and run applications that needs several docker containers that are linked together. You can read more here: [docs.docker.com/compose/](https://docs.docker.com/compose/)

{% highlight php %}

$ brew install docker-compose

{% endhighlight %}

### Define the Applications Dockerfile

Let's start by looking at a simple Dockerfile, the basic configuration that docker uses to build a container:

{% highlight php %}

FROM ubuntu:latest

RUN apt-get update && apt-get install php5 php5-json php5-mysql php5-mongo php5-memcached php5-xdebug -y
RUN apt-get install php5-dev make php-pear -y
RUN yes '' | pecl install mongo
RUN yes '' | pecl install stem
RUN echo "extension=stem.so" | tee -a /etc/php5/cli/php.ini

ADD . /code

{% endhighlight %}

This basic file contains three commands `FROM`, `RUN` and `ADD`:

`FROM ubuntu:latest` pulls the latest official ubuntu container image and uses it as a base for the container. The FROM command is used to define the parent image of the

`RUN apt-get update && apt-get install php5 php5-json php5-mysql -y` Updates the system and installs some common php5 dependencies, it is easy to install more dependencies if needed. The following lines with `RUN` commands installs more dependencies and PHP libraries used through the pecl package manager.

`ADD . /code` mounts the current directory (the directory where the docker command is ran from) to the code directory inside the container.

### Docker-Compose

If you want you can run build and run the container by itself, but we are going to use this container in combination with some other containers hosting the caching provider Memchached and the databases MySQL and MongoDB. To set this up we are going to use Docker-Compose.

To use Docker-Compose we first need to define a docker-compose.yml configuration file:

{% highlight php %}

web:
  build: .
  command: php -S 0.0.0.0:8000 -t /code/src/Demo
  ports:
    - "8000:8000"
  links:
    - db
    - mongo
    - memcached
  volumes:
    - .:/code
  environment:
    DB_HOST: db
    DB_NAME: test
    DB_USER: root
    DB_PASSWORD: password
    MEMCACHED_HOST: memcached
    MEMCACHED_PORT: 11211
    MONGO_HOST: mongo
    MONGO_PORT: 27017

db:
  hostname: db
  image: mysql
  environment:
    MYSQL_DATABASE: test
    MYSQL_ROOT_PASSWORD: password

mongo:
  image: mongo
  command: mongod --smallfiles --quiet --logpath=/dev/null

memcached:
   hostname: memcached
   image: memcached
   environment:
     MEMCACHED_MEMORY_LIMIT: 128

{% endhighlight %}

This configuration file defines four different services. When running this configuration, each of these services are started in it's own docker container.

 * `build` 
  Defines the path to the Dockerfile that should be used to build the container.
 
 * `image` (alternative to `build`)
  Defines an image on [Docker hub](https://hub.docker.com) to use to build the container.
 
 * `command` 
  Defines the command that will be run inside the container when started.
 
 * `ports` 
  Defines the port binding between the docker container and the docker host environment.
 
 * `links` 
  Connects the web container to the listed services. This means that the web container can access data in the databases and Memcached instance.

 * `volumes` 
  Mounts volumes from the docker host environment to the service provider container.
 
 * `environment` 
  Defines the system environment variables available to the application running inside the container. Here we define things like hostnames, usernames and passwords used in the application.

The first one, web, is the Dockerfile we defined before. The following three service providers are defined to use the official images for MySQL, MongoDB and Memcached. They all define the hostname that they are accessible through in the linked web container as well as environment variables. The `command` config row can be used to override the images default command, as seen in the MongoDB provider case.

We are now ready to build and start the containers and run the application.

{% highlight php %}

$ docker-compose build
$ docker-compose up

{% endhighlight %}

The containers should now be running in your docker container host and should be accessible at the hosts ip on port 8000.

Below follows some good to know commands when getting started with docker.

{% highlight php %}

# SSH into the boot2docker VM
$ boot2docker ssh

# List running contaiers
$ docker ps

# List built docker images
$ docker images

# List built docker images
$ docker images

# Delete all containers
$ docker rm $(docker ps -a -q)

# Delete all images
$ docker rmi $(docker images -q)

{% endhighlight %}

Hope this gives you some ideas on how to use Docker and Docker-Compose to run your PHP applications. If you want to see this Docker configuration in action, head over to GitHub and check out my simple search engine project here: [github.com/markusos/simple-search](https://github.com/markusos/simple-search).
