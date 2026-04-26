import { defineField, defineType } from "sanity";

export const experience = defineType({
  name: "experience",
  title: "Experience",
  type: "document",
  groups: [
    { name: "meta", title: "Meta" },
    { name: "content", title: "Content" },
  ],
  fields: [
    defineField({
      name: "company",
      title: "Company",
      type: "string",
      group: "meta",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "title",
      title: "Job Title",
      type: "string",
      group: "meta",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "dateStart",
      title: "Start Date",
      type: "string",
      group: "meta",
      description: 'e.g. "2023" or "Jan 2023"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "dateEnd",
      title: "End Date",
      type: "string",
      group: "meta",
      description: 'Leave blank for current role. e.g. "2025" or "PRESENT"',
    }),
    defineField({
      name: "location",
      title: "Location",
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
      name: "bullets",
      title: "Bullets",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      description: "Key accomplishments, one per entry.",
    }),
    defineField({
      name: "stack",
      title: "Tech Stack",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "company" },
    prepare({ title, subtitle }) {
      return { title, subtitle };
    },
  },
  orderings: [
    {
      title: "Manual Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
