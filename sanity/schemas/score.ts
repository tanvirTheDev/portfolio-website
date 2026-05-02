import { defineField, defineType } from "sanity";

export const score = defineType({
  name: "score",
  title: "Leaderboard Score",
  type: "document",
  fields: [
    defineField({
      name: "playerName",
      title: "Callsign",
      type: "string",
      validation: (r) => r.required().max(12),
    }),
    defineField({
      name: "score",
      title: "Score",
      type: "number",
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: "stageReached",
      title: "Stage Reached",
      type: "number",
      validation: (r) => r.required().min(1).max(3),
    }),
    defineField({
      name: "createdAt",
      title: "Submitted At",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "playerName",
      subtitle: "score",
      media: "stageReached",
    },
    prepare({ title, subtitle }) {
      return {
        title: title ?? "Unknown",
        subtitle: `Score: ${subtitle ?? 0}`,
      };
    },
  },
  orderings: [
    {
      title: "Score (High → Low)",
      name: "scoreDesc",
      by: [{ field: "score", direction: "desc" }],
    },
  ],
});
