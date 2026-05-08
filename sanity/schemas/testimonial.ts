import { defineField, defineType } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonials",
  type: "document",
  fields: [
    defineField({
      name: "clientName",
      title: "Client Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "clientTitle",
      title: "Client Job Title",
      type: "string",
      description: 'e.g. "CEO", "CTO", "Product Manager"',
    }),
    defineField({
      name: "clientCompany",
      title: "Client Company / Country",
      type: "string",
      description: 'e.g. "TechCorp Inc." or "USA"',
    }),
    defineField({
      name: "clientPhoto",
      title: "Client Photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "quote",
      title: "Testimonial / Review",
      type: "text",
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "platform",
      title: "Platform",
      type: "string",
      options: {
        list: [
          { title: "Upwork", value: "upwork" },
          { title: "LinkedIn", value: "linkedin" },
          { title: "Direct / Email", value: "direct" },
          { title: "Other", value: "other" },
        ],
        layout: "radio",
      },
      initialValue: "upwork",
    }),
    defineField({
      name: "rating",
      title: "Rating (out of 5)",
      type: "number",
      initialValue: 5,
      validation: (r) => r.min(1).max(5),
    }),
    defineField({
      name: "featured",
      title: "Featured on Homepage",
      type: "boolean",
      initialValue: true,
      description: "Show this testimonial in the homepage featured section.",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower number = shown first.",
      initialValue: 10,
    }),
  ],
  orderings: [
    { title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: {
      title: "clientName",
      subtitle: "clientCompany",
      media: "clientPhoto",
    },
  },
});
