import { defineDynamic, defineInstructions } from "eve/instructions";
import type { DynamicResolveContext } from "eve/instructions";
import { BASE_INSTRUCTIONS } from "./lib/base-instructions.js";
import { buildUserContextPrompt, fetchUserContext } from "./lib/memory-internal.js";

const IMESSAGE_INSTRUCTIONS = `

# iMessage (Sendblue)

- this conversation is over imessage. there is no browser ui for tool approvals here.
- answer directly. use github, weather, linear, and other tools when relevant.
- do **not** call \`save_memory\` unless the user explicitly asks you to remember
  or save something.
- if they want to update long-term memory, tell them to edit **settings → profile**
  on the web app.`;

function instructionsForChannel(kind: string | undefined, base: string) {
  if (kind === "sendblue") {
    return `${base}${IMESSAGE_INSTRUCTIONS}`;
  }
  return base;
}

export default defineDynamic({
  events: {
    "session.started": async (_event, ctx: DynamicResolveContext) => {
      const userId = ctx.session.auth.current?.principalId;
      if (!userId || userId.startsWith("eve:")) {
        return defineInstructions({
          markdown: instructionsForChannel(ctx.channel.kind, BASE_INSTRUCTIONS),
        });
      }

      const context = await fetchUserContext(userId);
      if (!context) {
        return defineInstructions({
          markdown: instructionsForChannel(ctx.channel.kind, BASE_INSTRUCTIONS),
        });
      }

      const userBlock = buildUserContextPrompt(context);
      return defineInstructions({
        markdown: instructionsForChannel(
          ctx.channel.kind,
          `${BASE_INSTRUCTIONS}\n\n---\n\n${userBlock}`,
        ),
      });
    },
  },
});
