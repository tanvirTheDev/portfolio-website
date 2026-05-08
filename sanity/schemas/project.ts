import { defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  groups: [
    { name: "meta", title: "Meta" },
    { name: "media", title: "Media & Links" },
    { name: "content", title: "Content" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "meta",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "meta",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "meta",
      validation: (r) => r.max(120),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "meta",
      options: {
        list: [
          { title: "Shipped", value: "SHIPPED" },
          { title: "Open Source", value: "OPEN SOURCE" },
          { title: "Beta", value: "BETA" },
          { title: "Archived", value: "ARCHIVED" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      group: "meta",
    }),
    defineField({
      name: "order",
      title: "Sort Order",
      type: "number",
      group: "meta",
      description: "Lower numbers appear first.",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      group: "meta",
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      group: "media",
      options: { hotspot: true },
    }),
    defineField({
      name: "youtubeId",
      title: "YouTube URL or Video ID",
      type: "string",
      group: "media",
      description:
        "Paste the full YouTube URL (youtube.com/watch?v=… or youtu.be/…) OR just the 11-character video ID.",
      validation: (r) =>
        r.custom((val) => {
          if (!val) return true;
          // Accept bare 11-char ID
          if (/^[a-zA-Z0-9_-]{11}$/.test(val)) return true;
          // Accept full youtube.com/watch URLs
          if (/youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/.test(val)) return true;
          // Accept youtu.be short URLs
          if (/youtu\.be\/([a-zA-Z0-9_-]{11})/.test(val)) return true;
          // Accept youtube.com/embed URLs
          if (/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/.test(val)) return true;
          return "Must be a YouTube URL or 11-character video ID";
        }),
    }),
    defineField({
      name: "liveUrl",
      title: "Live URL",
      type: "url",
      group: "media",
    }),
    defineField({
      name: "githubUrl",
      title: "GitHub URL",
      type: "url",
      group: "media",
    }),
    defineField({
      name: "stack",
      title: "Tech Stack",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "problem",
      title: "Problem",
      type: "array",
      group: "content",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "challenges",
      title: "Challenges",
      type: "array",
      group: "content",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "architecture",
      title: "Architecture",
      type: "array",
      group: "content",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "metrics",
      title: "Impact Metrics",
      type: "array",
      group: "content",
      description: 'Quantified results. e.g. "60% faster load time", "10K+ daily users"',
      of: [{ type: "string" }],
    }),
    defineField({
      name: "testimonial",
      title: "Client Quote",
      type: "text",
      group: "content",
      rows: 3,
      description: "Short quote from the client about this project (optional).",
    }),
    defineField({
      name: "testimonialAuthor",
      title: "Quote Author",
      type: "string",
      group: "content",
      description: 'e.g. "John D. — CEO, TechCorp"',
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "status", media: "thumbnail" },
  },
  orderings: [
    {
      title: "Manual Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
    {
      title: "Year (Newest First)",
      name: "yearDesc",
      by: [{ field: "year", direction: "desc" }],
    },
  ],
});
