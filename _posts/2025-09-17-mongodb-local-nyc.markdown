---
layout: post
title:  "MongoDB.local NYC: Embracing the AI Era with New Tools"
date:   2025-09-17 23:00:00
categories: work
tags:
    - AI
    - Data
---

Just got back from [MongoDB.local NYC](https://www.mongodb.com/company/blog/events/local-nyc-2025-defining-ideal-database-for-ai-era), and my head is still buzzing a bit. It was a long day, but a good one. The theme was pretty much blasted from the stage all day: data infrastructure for the AI era. They kept framing MongoDB as the "memory" for AI agents: the thing that provides context and state so the agents aren't just stateless parrots.

For me, the biggest announcement was the public preview of Vector Search for the Community and Enterprise editions. This is a huge deal, honestly. It means I can actually build and test RAG applications locally without being tied to a cloud service just to get vector search working. It really lowers the barrier to just trying things out. Along with that, they announced their new Voyage AI models to improve retrieval accuracy and an Application Modernization Platform, which seems geared more toward large enterprise projects.

[![MongoDB.local main stage]({{site.url}}/assets/mongodb_local_nyc.jpeg){: .center-image }]({{site.url}}/assets/mongodb_local_nyc.jpeg)

But the highlight for me was a hands-on session on giving AI agents persistent memory. They walked us through the new [MongoDB Store for LangGraph](https://www.mongodb.com/company/blog/product-release-announcements/powering-long-term-memory-for-agents-langgraph), and it finally clicked how this "memory" concept works in practice. We saw how an agent could use MongoDB to store different types of memory (like episodic or semantic) across multiple conversations, using its JSON structure and vector search to pull relevant context. It's a really practical solution to a tricky problem. 

So, walking away from it, my main takeaway is that MongoDB is making a serious play to be more than just a database in the AI stack. Making vector search accessible to everyone in the Community Edition is the smartest thing they could have done. It feels like they're shifting from being just a place to store data to being an active part of an AI's brain. Time to go download the latest version and see what I can build with it.