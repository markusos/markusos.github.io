---
layout: post
title:  "MCP Server for Data Access: The Future of Analytics?"
date:   2025-06-29 23:00:00
categories: projects
tags:
    - AI
    - Data
    - Python
---

After spending some time with Anthropic's Model Context Protocol (MCP), I'm cautiously optimistic about what might be a fundamental shift in how we interact with data. MCP promises to be the "USB-C port for AI applications": a standardized way for LLMs to access external data and tools. While the protocol itself may seem like yet another abstraction layer, the bigger question is whether we're witnessing the early stages of LLMs becoming the primary interface for data exploration.

To test this in practice, I built an NYC 311 Data MCP Server that exposes 3.5 million New York City service requests from 2024 to LLMs. The server lets AI assistants run read-only SQL queries against the full dataset: complaint types, geographic patterns, temporal trends. It's built on DuckDB for performance and includes some security guardrails to prevent dangerous operations.

**The bottom line**: It works surprisingly well for basic exploratory data analysis, and raises interesting questions about whether traditional dashboards and BI tools might eventually give way to conversational analytics.

## MCP Architecture

MCP uses a client-server architecture where the host (Claude Desktop, LM Studio, VS Code, etc) coordinates everything and enforces security, while clients maintain isolated sessions with servers that expose data through standardized primitives.

The good news is that servers are isolated from each other and can't see the full conversation history. There's capability negotiation upfront, so you know what works before you start. The questionable part is that this adds significant complexity compared to a simple REST endpoint. You need an MCP-compatible host, proper client setup, and protocol compliance.

## NYC 311 Data MCP Server

To test this concept, I built an MCP server using the FastMCP framework with a DuckDB backend for analytics on 3.5M records. The server exposes the complete 2024 NYC 311 service requests dataset, including location data (borough, ZIP, lat/lng), request details, and temporal information. It includes pre-processed complaint categories from my previous work.

[![MCP Architecture]({{site.url}}/assets/mcp.png){: .center-image }]({{site.url}}/assets/mcp.png)

The core functionality centers around a `query_data` tool that executes read-only SELECT queries, plus a `schema` resource that provides table structure information. Security guardrails block dangerous SQL operations (DROP, DELETE, UPDATE, INSERT, ALTER, CREATE, TRUNCATE, EXEC), require LIMIT clauses for SELECT *, and use parameter binding to prevent SQL injection.

### Testing with Real Data: Natural Language to SQL

The AI assistant (Google's `gemma-3-27b` via [LM Studio](https://lmstudio.ai/blog/lmstudio-v0.3.17)) automatically discovered my MCP server and immediately began exploring the NYC 311 dataset. Without any manual SQL writing, it generated queries to find patterns across 3.5 million records. DuckDB's columnar storage handled the analytical workload smoothly, while the MCP layer added minimal overhead.

The assistant successfully analyzed complaint patterns, handled missing data gracefully, and even generated simple aggregations on demand. But here's the reality check: this exact functionality could be achieved with a simple REST API endpoint that accepts SQL queries. The main advantage of MCP is standardization, not technical capability.

[![MCP Usage in LM Studio]({{site.url}}/assets/mcp_use_lm_studio.png){: .center-image }]({{site.url}}/assets/mcp_use_lm_studio.png)

The complete code is available in the [markusos/llm_duck](https://github.com/markusos/llm_duck) repository.

Setting this up requires Python 3.9+, the uv package manager, and an MCP-compatible client. LM Studio 0.3.17+ supports MCP by editing `~/.lmstudio/mcp.json`, and tool calls show confirmation dialogs for security by default.

**mcp.json**:
```json
{
  "mcpServers": {
    "311_data": {
      "command": "uv",
      "args": [
        "--directory",
        "/ABSOLUTE/PATH/TO/llm_duck",
        "run",
        "run_mcp_server.py"
      ]
    }
  }
}
```

When testing the MCP server with LM Studio and the `google/gemma-3-27b` model, the AI assistant automatically discovered available tools and queried the schema. It then successfully generated SQL to aggregate the data, such as finding the Zip codes with the most service requests in Brooklyn. 


```sql
SELECT 
    incident_zip, 
    COUNT(*) AS count 
FROM service_requests 
WHERE borough = 'Brooklyn' 
GROUP BY incident_zip 
ORDER BY count DESC 
LIMIT 10
```

What's particularly impressive is how the LLM enriches the raw query results with contextual information not stored in the database. In this case, translating ZIP codes into recognizable neighborhood names that make the data more meaningful to users.

| ZIP Code | Neighborhood Name | Service Request Count |
|---|---|---|
| 11213 | Sunset Park | 849 |
| 11203 | Williamsburg | 765 |
| 11216 | Bushwick | 746 |
| 11206 | Bed-Stuy (Bedford–Stuyvesant) | 738 |
| 11211 | Greenpoint | 735 |
| 11209 | Crown Heights | 724 |
| 11217 | Kensington | 687 |
| 11221 | Fort Greene/Clinton Hill | 653 |
| 11205 | Park Slope | 649 |
| 11233 | Flatbush | 648 |

The system works well for natural language to insights without manual SQL writing, but for anyone familiar with SQL, this is just a more complex way to do what could be achieved with a simple REST API. The main advantage is that it provides a standardized interface for LLMs to access data, which could enable more sophisticated AI assistants in the future.

## The Future of Analytics: LLMs as the New Dashboard

This MCP server builds on my [previous work](/projects/2025/06/14/decoding-the-citys-pulse.html) categorizing NYC 311 requests using local LLMs, but represents a fundamental shift toward conversational analytics. Where traditional BI tools require pre-built charts and fixed queries, LLM-powered analytics enables dynamic exploration through natural language.

The implications are profound. Instead of building dozens of dashboard widgets to answer specific questions, we might soon have AI assistants that augment dashboard capabilities to instantly generate insights from natural language queries. Want to see "noise complaints by neighborhood during summer weekends"? No need to pre-define that visualization. The LLM constructs the query, executes it, and explains the results.

Rather than clicking through dashboard filters and pivot tables, analysts could simply describe what they want to understand and let the AI handle the technical translation. This represents a fundamental shift from static, pre-built visualizations to dynamic, conversation-driven data exploration.

What's particularly interesting is how this complements my earlier batch processing work. Where I previously used LLMs to transform and categorize data at scale, this MCP server demonstrates LLMs as interactive query engines. We're seeing the emergence of a complete LLM-powered analytics stack: batch processing for data preparation and real-time conversations for data consumption.

### Challenges and Opportunities Ahead

While this experiment demonstrates the potential for LLM-powered analytics, several challenges remain before conversational data analysis becomes mainstream.

**LLM reliability issues** surfaced during testing that highlight the technology's current limitations. The AI assistant sometimes failed to generate correct tool calls, occasionally made up tool responses instead of using the actual MCP server, and would ignore parts of the tool output while generating responses. These aren't just minor bugs. They represent fundamental challenges with LLM reliability that could undermine user trust in production environments.

**Technical standardization** is still evolving. MCP provides one approach, but the ecosystem is fragmented. Today you might build an MCP server, tomorrow it could be a different protocol entirely. The good news is that the underlying capability (LLMs generating and executing SQL) works regardless of the transport mechanism.

**Security and governance** require careful consideration. Unlike traditional dashboards with fixed queries, LLM analytics can generate arbitrary SQL. This flexibility is powerful but demands robust guardrails, especially with sensitive enterprise data. My implementation blocks some dangerous operations, but determined users could still extract large datasets through their prompts.

**Data complexity** scales quickly beyond simple schemas. My single-table NYC 311 dataset works relatively well, but enterprise scenarios with hundreds of tables, complex joins, and business logic require sophisticated semantic layers. The LLM needs to understand not just what data exists, but what it means and how metrics should be computed.

**User expectations** will need to evolve too. Traditional dashboards set clear expectations about what questions can be answered. Conversational analytics promises infinite flexibility, but users will need to learn how to ask good questions and interpret probabilistic responses from LLMs that might misunderstand context or hallucinate results.

Despite these challenges, the trend toward LLM-powered analytics feels inevitable. As models become more capable and data infrastructure adapts, the friction of asking questions will continue to decrease. The question isn't whether this will happen, but how quickly organizations can adapt their data practices to support it and how fast foundational LLM models keep improving.

### Initial Observations and Future Potential

My trial with the NYC 311 Data MCP Server demonstrates both the promise and practical challenges of LLM-powered analytics. Similar to my initial impressions of AI coding assistants, there's an immediate sense that we're witnessing the early stages of a fundamental shift in how humans interact with data.

The system excels at translating natural language questions into SQL queries and providing immediate insights without manual coding. The standardized interface could theoretically work across different AI assistants, creating a unified way to access organizational data. Most importantly, it hints at a future where business users can explore data directly through conversation rather than relying on pre-built dashboards or technical teams.

However, significant challenges remain. The infrastructure feels heavyweight for simple use cases, and real-world adoption patterns are still unclear. More critically, scaling beyond simple schemas requires sophisticated semantic layers that most organizations haven't built yet.

The honest assessment is that we're still in the early experimental phase, but the direction seems clear. As LLMs become more capable and data infrastructure evolves to support them, conversational analytics will likely become the norm rather than the exception. Traditional dashboards may not disappear entirely, but they'll increasingly serve as fallbacks rather than primary interfaces.

For now, MCP represents one approach to standardizing this future, but the more important trend is the underlying shift toward AI-powered data exploration. Whether through MCP, enhanced REST APIs, or entirely different protocols, the age of conversational analytics is beginning.