import { defineField, defineType } from "sanity";

export const service = defineType({
  name: "service",
  title: "Services",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Service Title",
      type: "string",
      description: 'e.g. "Web Application Development"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tagline",
      title: "Short Tagline",
      type: "string",
      description: 'e.g. "From idea to deployed product"',
    }),
    defineField({
      name: "icon",
      title: "Icon / Emoji",
      type: "string",
      description: "One emoji or short symbol. e.g. ⚡ or //",
      initialValue: "⚡",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "2–3 sentences describing what you deliver.",
    }),
    defineField({
      name: "deliverables",
      title: "Deliverables / What You Get",
      type: "array",
      description: 'e.g. "Responsive UI", "REST API", "Deployment"',
      of: [{ type: "string" }],
    }),
    defineField({
      name: "techStack",
      title: "Tech Stack",
      type: "array",
      description: "Tech used for this service",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "startingPrice",
      title: "Starting Price",
      type: "string",
      description: 'e.g. "$500+" or "Contact for quote"',
    }),
    defineField({
      name: "featured",
      title: "Show on Homepage",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 10,
    }),
  ],
  orderings: [
    { title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "tagline" },
    prepare({ title, subtitle }) {
      return { title, subtitle };
    },
  },
});
