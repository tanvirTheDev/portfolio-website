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
      title: "YouTube Video ID",
      type: "string",
      group: "media",
      description: "Just the 11-character ID, e.g. dQw4w9WgXcQ",
      validation: (r) =>
        r.custom((val) => {
          if (!val) return true;
          return /^[a-zA-Z0-9_-]{11}$/.test(val)
            ? true
            : "Must be an 11-character YouTube video ID";
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
