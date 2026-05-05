import { env } from "@/lib/env";
import { getLunarPhase } from "@/lib/lunar";
import type { DrawnCard } from "@/lib/oracle/cards";

/**
 * Generate an oracle interpretation. Uses OpenAI/Anthropic if configured,
 * otherwise composes a heuristic reading from card meanings + lunar phase.
 */
export async function interpretReading(opts: {
  question: string | null;
  cards: DrawnCard[];
}): Promise<string> {
  const moon = getLunarPhase();
  const cardLines = opts.cards
    .map((c) => {
      const meaning = c.reversed ? c.card.reversed : c.card.upright;
      return `${c.position.toUpperCase()}: ${c.card.name}${c.reversed ? " (reversed)" : ""} — ${meaning.join(", ")}`;
    })
    .join("\n");

  const systemPrompt = `You are the Four Corners Oracle, a contemplative spiritual guide. You synthesize tarot card meanings with the current lunar phase into a personal, poetic, but grounded reading. Avoid fortune-telling absolutes; speak in invitations and possibilities.`;

  const userPrompt = `The querent asks: "${opts.question ?? "(no question — open reading)"}"

Cards drawn:
${cardLines}

Lunar context: ${moon.phase} moon (${moon.emoji}) — ${moon.guidance}

Offer a 4-6 sentence reading. Speak directly to them ("you"). Connect the three cards as a journey from past through present to future. End with one concrete invitation for the next 24 hours.`;

  if (env.ai.anthropicKey) {
    try {
      return await callAnthropic(systemPrompt, userPrompt);
    } catch (err) {
      console.warn("[oracle] anthropic failed", err);
    }
  }
  if (env.ai.openaiKey) {
    try {
      return await callOpenAI(systemPrompt, userPrompt);
    } catch (err) {
      console.warn("[oracle] openai failed", err);
    }
  }
  return heuristicInterpretation(opts.cards, moon);
}

async function callAnthropic(system: string, user: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.ai.anthropicKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 600,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("No text in response");
  return text;
}

async function callOpenAI(system: string, user: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.ai.openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 500,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("No text in response");
  return text;
}

function heuristicInterpretation(cards: DrawnCard[], moon: ReturnType<typeof getLunarPhase>): string {
  const past = cards.find((c) => c.position === "past");
  const present = cards.find((c) => c.position === "present");
  const future = cards.find((c) => c.position === "future");

  const parts: string[] = [];
  if (past) {
    const m = past.reversed ? past.card.reversed : past.card.upright;
    parts.push(
      `What you carry forward speaks of ${m.join(" and ")}. ${past.card.name}${past.reversed ? " reversed" : ""} sets the foundation.`,
    );
  }
  if (present) {
    const m = present.reversed ? present.card.reversed : present.card.upright;
    parts.push(
      `Right now, ${present.card.name}${present.reversed ? " reversed" : ""} invites you into ${m.join(", ")}.`,
    );
  }
  if (future) {
    const m = future.reversed ? future.card.reversed : future.card.upright;
    parts.push(
      `Looking ahead, ${future.card.name}${future.reversed ? " reversed" : ""} suggests ${m.join(" and ")} on the horizon.`,
    );
  }
  parts.push(`The ${moon.phase} moon adds its own counsel: ${moon.guidance}`);
  return parts.join(" ");
}
