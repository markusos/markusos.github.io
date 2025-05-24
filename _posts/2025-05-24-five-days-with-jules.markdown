---
layout: post
title:  "5 days with Jules: Evaluating Google's AI coding assistant"
date:   2025-05-24 12:00:00
categories: projects
tags:
    - AI
    - Dev
    - Python
---

For many in software engineering, the idea of an AI coding assistant feels a bit like magic. You give it a task, and it dives into the codebase to help out. Pretty exciting, right? So, when Google recently opened up access to [Jules](http://jules.google), their new Gemini-powered AI coding agent, I was keen to see how it worked in practice. After trying it out for five days, here’s a look at what I found.

### Getting Started: The Initial "Wow"

First off, let's be clear: the concept is super cool. Imagine an AI that can clone your repository, understand your instructions, and then try to write code, fix bugs, or even update dependencies. When I first set it up and gave Jules its initial tasks, it definitely felt like I was looking at a new way of working.

During this trial period, Google offers five free tasks per day, which provided ample opportunity to experiment without cost concerns.

[![Jules]({{site.url}}/assets/jules.png){: .center-image }]({{site.url}}/assets/jules.png)

### What Happens When Jules Gets to Work?

So, what was it like once I got past the initial setup? It quickly became clear that Jules is still very much a work in progress, which is expected for a new tool in a trial phase.

One of the first things I noticed was that the service seemed to be under heavy load quite often. This meant that sometimes starting a task or getting consistent results was a bit tricky.

And how long did tasks take? Well, agent tasks could often take hours to complete. I also saw that the tool usage for Jules would frequently time out. This made for an experience that wasn't always smooth and made it hard to depend on for anything urgent.

**Environment Awareness Gaps:** One particularly interesting observation was Jules' interaction with its work environment. The agent didn't always seem aware of the status of the Virtual Machines (VMs) it was using. This led to frustrating loops where Jules would repeatedly attempt failing commands without recognizing that the underlying VM might be the issue.

[![Jules timeout]({{site.url}}/assets/jules_timeout.png){: .center-image }]({{site.url}}/assets/jules_timeout.png)

At one point, I was trying to convince Jules to validate the VM status by running a simple command instead of repeatedly trying to run the `pytest` that was timing out. After some back and forth, it finally agreed to check the VM status using `ls`. This kind of interaction highlighted how much more efficient the process could be if Jules had better environmental awareness and could automatically provision a new VM when the existing one failed.

### Communicating with Jules: Interface and Code Quality

**Feedback Mechanisms:** Currently, communication with Jules happens primarily through a chat interface. While this works for general feedback, it lacks the ability to comment on specific lines of code that Jules suggests. Adding inline code commenting would significantly improve the feedback refinement process.

**Project Context:** I experimented with providing Jules repository-specific context. While we all have project-specific guidelines, there's currently no dedicated mechanism to share this information with Jules (unlike GitHub's `copilot-instructions.md` approach). I tried adding context to the main `README.md` file, but Jules' adoption of this information seemed inconsistent.

**Code Quality Assessment:** Now, for the big question: what about the code quality? Jules could generate code snippets and suggestions pretty quickly. But the usefulness varied a lot. Some suggestions were genuinely spot on and helpful. Other times, however, I found Jules struggling with fixing even basic Python linter errors, like `E501 Line too long`. Sometimes, its attempts to fix these small things would actually break something else, and it would get stuck trying to fix the new problems it created. So, some of the code was great, while other parts weren't quite usable without a lot of changes.

### Verdict on Jules for Now

After spending a week with Jules, my overall impression is that it’s a genuinely powerful tool with a lot of exciting potential. The thought of handing off certain coding tasks to an AI is very appealing.

However, it’s also clear that Jules, in its current state, isn't about to replace human developers. Think of it more as a helpful assistant that works alongside us, rather than a replacement. It might be great for taking a first pass at a new feature, helping with boilerplate, or suggesting solutions for simpler bugs. But the complex problem-solving, the architectural decisions, and the deep understanding of a project? That’s still our job.

The world of AI in software development is evolving rapidly. My time with Jules showed me both the incredible promise and the current learning curve. As the technology gets better, deals with performance hiccups, and improves how it understands our projects and code, tools like Jules are set to become even more valuable. I’ll definitely be watching to see how it grows!