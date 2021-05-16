---
layout: post
title:  "Migrating a live site to Amazon AWS"
date:   2015-03-29 17:00:00
categories: engage
---

For the last week, I've spent a lot of time migrating one of Engage's clients from a single server setup hosted on DigitalOcean to a load-balanced multi-node server cluster setup on Amazon AWS. This post is a high-level walkthrough of the steps needed to migrate to Amazon AWS.

The client site has a couple of thousands of unique visitors a month. The main reason for the move was not that the single server could not handle the traffic, but that the client had strict demands on the site uptime. We minimize the risk of server maintenance or other unforeseeable events leading to site downtime, by using a multi-node setup.

The figure below shows how the infrastructure is set up in the new AWS environment.

![AWS Setup]({{site.url}}/assets/AWS_setup.png){: .center-image }

The setup consists of an Elastic Beanstalk setup with two app server web nodes behind a load balancer. They use an AWS RDS Multi-AZ instance for database storage and an AWS S3 instance for website assets like images and other documents. We also have a separate AWS EC2 instance as a worker server to handle Cron jobs and queuing tasks for the site.

Below follows some steps needed to complete the migration including some good resources:

- Setting up the new cluster on AWS
	- [Elastic Beanstalk](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/GettingStarted.Walkthrough.html)
	- [AWS RDS Database](http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_GettingStarted.CreatingConnecting.MySQL.html)
	- [AWS S3 Bucket for Assets](http://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html)
	- [AWS EC2 Worker Server](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-launch-instance_linux.html)

	<br />
	Make sure the security groups are set up correctly so that the instances have access to each other and that you have SSH access to the servers.

- Migrating the Database

	This method assumes that the number of writes to the database is minimal while migrating. If possible set the site to maintenance mode.

	- Add query logging on the old production server.
	- Dump the database from the old production server.
	- Import the database to the new database server.
	- Update the database credentials of production to use the new AWS RDS as the production server.
	- Check the query log for INSERTS and UPDATES that needs to be migrated to avoid data loss from the moment you dumped the database to the moment the site started using the RDS instance. Run these commands on the new server.

	<br />
	Depending on how much traffic your site has, this might not be the optimal solution. Try to do the database migration when the traffic to the site is at a minimum to minimize the number of transactions you manually have to recreate after the migration.

- Deploy the app to AWS
	- Setup so that you can deploy with the [EB CLI Tool](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_PHP_eb.sdlc.html).
	- Deploy using the `eb deploy` command.
	- Open the app site with the `eb open` command.
	<br /><br />

- Setup uploads to Amazon S3.
	- Copy all current site assets to the S3 bucket
	- Update the app to link asset requests to the S3 bucket
	- Update the app to [send uploaded files to AWS S3](https://github.com/aws/aws-sdk-php)
	<br /><br />

- Setup Worker server (Queue provider, Cron-jobs, etc)

- Setup trusted proxies for your load balancer

	Setup so that your app [trusts the load balancer](http://fideloper.com/laravel-4-trusted-proxies). This makes it possible to access the client's IP address and other information that might be needed for logging purposes.

- Test everything! (More than you think might have stopped working.)

Have you recently migrated a site to AWS or you are currently working on a migration, please leave a comment!
