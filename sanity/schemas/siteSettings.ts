import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "identity", title: "Identity" },
    { name: "links", title: "Links" },
    { name: "files", title: "Files" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Full Name",
      type: "string",
      group: "identity",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline / Role",
      type: "string",
      group: "identity",
      description: "Shown in the site header and meta description.",
    }),
    defineField({
      name: "email",
      title: "Contact Email",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "githubUrl",
      title: "GitHub URL",
      type: "url",
      group: "links",
    }),
    defineField({
      name: "linkedinUrl",
      title: "LinkedIn URL",
      type: "url",
      group: "links",
    }),
    defineField({
      name: "mediumUsername",
      title: "Medium Username",
      type: "string",
      group: "links",
      description: "Without the @ symbol. Used to fetch your blog posts.",
    }),
    defineField({
      name: "resumeFile",
      title: "Resume (PDF)",
      type: "file",
      group: "files",
      options: { accept: ".pdf" },
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "tagline" },
  },
});
