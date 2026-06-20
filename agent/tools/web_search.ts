import { defineTool } from "eve/tools";
import { z } from "zod";

// Overrides eve's built-in (provider-managed) web_search with a reliable,
// self-hosted implementation via Tavily (built for agents). Needs TAVILY_API_KEY
// (free at tavily.com). Returns a synthesized answer + sources so the model can
// cite, and the UI renders the sources as a card.
interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

export default defineTool({
  description:
    "Search the web for current, real-time, or factual information beyond your training data — news, recent events, prices, docs, releases, or anything you're unsure about. Returns an answer summary and sources.",
  inputSchema: z.object({
    query: z.string().min(1).describe("The search query"),
  }),
  async execute({ query }) {
    const key = process.env.TAVILY_API_KEY?.trim();
    if (!key) {
      return {
        error:
          "Web search isn't set up. Tell the user to add a free TAVILY_API_KEY from tavily.com.",
      };
    }

    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        query,
        search_depth: "basic",
        include_answer: true,
        max_results: 6,
      }),
    });
    if (!res.ok) {
      return { error: `Web search failed: ${res.status} ${await res.text()}` };
    }

    const data = (await res.json()) as {
      answer?: string;
      results?: TavilyResult[];
    };

    return {
      query,
      answer: data.answer ?? "",
      results: (data.results ?? []).slice(0, 6).map((r) => ({
        title: r.title,
        url: r.url,
        snippet: (r.content ?? "").slice(0, 600),
      })),
    };
  },
});
