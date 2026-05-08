import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "identity", title: "Identity" },
    { name: "links", title: "Links" },
    { name: "social", title: "Social & Platforms" },
    { name: "files", title: "Files" },
  ],
  fields: [
    // ── IDENTITY ──────────────────────────────────────────────────────────────
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
      name: "profileImage",
      title: "Profile Photo",
      type: "image",
      group: "identity",
      description: "Your headshot shown on the homepage hero.",
      options: { hotspot: true },
    }),
    defineField({
      name: "upworkJss",
      title: "Upwork Job Success Score (%)",
      type: "number",
      group: "identity",
      description: "e.g. 100 for 100% JSS. Shown as a badge on the homepage.",
      validation: (r) => r.min(0).max(100),
    }),
    defineField({
      name: "upworkJobsCompleted",
      title: "Upwork Jobs Completed",
      type: "number",
      group: "identity",
      description: "Total number of jobs completed on Upwork.",
    }),
    defineField({
      name: "availability",
      title: "Availability",
      type: "object",
      group: "identity",
      description: "Shown as a pulsing badge on the homepage.",
      fields: [
        defineField({
          name: "available",
          title: "Available for Work",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "label",
          title: "Custom Label",
          type: "string",
          description:
            "Optional override. Defaults to 'AVAILABLE FOR WORK' or 'CURRENTLY ENGAGED'.",
        }),
      ],
      options: { columns: 1 },
    }),
    defineField({
      name: "email",
      title: "Contact Email",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "skills",
      title: "Skills / Tech Stack (Ticker)",
      type: "array",
      group: "identity",
      description:
        "Shown as a scrolling ticker on the homepage. e.g. REACT, NEXT.JS, NODE.JS, TYPESCRIPT",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "upworkEarnings",
      title: "Upwork Total Earnings",
      type: "string",
      group: "identity",
      description: "e.g. $50K+  — shown in the broadcast card on the homepage.",
    }),
    defineField({
      name: "introMeta",
      title: "Intro Video Metadata",
      type: "object",
      group: "identity",
      description: "Details shown in the broadcast frame around the intro video.",
      fields: [
        defineField({
          name: "title",
          title: "Video Title",
          type: "string",
          description: 'e.g. "WHO IS TANVIR AHAMED"',
        }),
        defineField({
          name: "channel",
          title: "Channel Name",
          type: "string",
          description: 'e.g. "TANVIR_DEV"',
        }),
        defineField({
          name: "duration",
          title: "Duration",
          type: "string",
          description: 'e.g. "01:30"',
        }),
        defineField({
          name: "recordedAt",
          title: "Recorded Date",
          type: "string",
          description: 'e.g. "2024-05-01"',
        }),
        defineField({
          name: "location",
          title: "Location",
          type: "string",
          description: 'e.g. "REMOTE / DHAKA"',
        }),
        defineField({
          name: "transmissionId",
          title: "Transmission ID",
          type: "string",
          description: 'e.g. "TX-0001"',
        }),
      ],
      options: { columns: 2 },
    }),

    // ── LINKS ─────────────────────────────────────────────────────────────────
    defineField({
      name: "introVideoUrl",
      title: "Intro Video URL",
      type: "url",
      group: "links",
      description:
        "YouTube link for your intro video (e.g. https://youtu.be/abc123). The video section appears on the homepage only when this field is filled in.",
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
      name: "upworkUrl",
      title: "Upwork Profile URL",
      type: "url",
      group: "links",
      description: "e.g. https://www.upwork.com/freelancers/tanvirthedev",
    }),
    defineField({
      name: "mediumUsername",
      title: "Medium Username",
      type: "string",
      group: "links",
      description: "Without the @ symbol. Used to fetch your blog posts.",
    }),

    // ── SOCIAL & PLATFORMS ────────────────────────────────────────────────────
    defineField({
      name: "twitterUrl",
      title: "Twitter / X URL",
      type: "url",
      group: "social",
      description: "e.g. https://twitter.com/tanvirthedev",
    }),
    defineField({
      name: "facebookUrl",
      title: "Facebook Personal URL",
      type: "url",
      group: "social",
    }),
    defineField({
      name: "facebookPageUrl",
      title: "Facebook Page URL",
      type: "url",
      group: "social",
    }),
    defineField({
      name: "leetcodeUrl",
      title: "LeetCode URL",
      type: "url",
      group: "social",
      description: "e.g. https://leetcode.com/tanvirthedev",
    }),
    defineField({
      name: "codeforcesUrl",
      title: "Codeforces URL",
      type: "url",
      group: "social",
      description: "e.g. https://codeforces.com/profile/tanvirthedev",
    }),
    defineField({
      name: "devCommunityUrl",
      title: "Dev.to / Dev Community URL",
      type: "url",
      group: "social",
      description: "e.g. https://dev.to/tanvirthedev",
    }),

    // ── FILES ─────────────────────────────────────────────────────────────────
    defineField({
      name: "resumeFile",
      title: "Resume (PDF)",
      type: "file",
      group: "files",
      options: { accept: ".pdf" },
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "tagline", media: "profileImage" },
  },
});
