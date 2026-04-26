import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemas";
import { env } from "./env";

export default defineConfig({
  name: "portfolio",
  title: "Portfolio Studio",
  basePath: "/studio",
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Site Settings")
              .id("siteSettings")
              .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
            S.divider(),
            S.documentTypeListItem("project").title("Projects"),
            S.documentTypeListItem("experience").title("Experience"),
            S.documentTypeListItem("certificate").title("Certificates"),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
