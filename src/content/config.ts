import { defineCollection, z } from "astro:content";

const dateValue = z.union([z.date(), z.string()]).transform((value) => new Date(value));

const postsCollection: ReturnType<typeof defineCollection> = defineCollection({
	schema: z.object({
		title: z.string(),
		published: dateValue,
		updated: dateValue.optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		notebook: z.string().optional().default("Misc"),
		lang: z.string().optional().default(""),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
const projectsCollection: ReturnType<typeof defineCollection> = defineCollection({
	schema: z.object({
		name: z.string(),
		category: z.string(),
		status: z.string(),
		role: z.string(),
		description: z.string(),
		tags: z.array(z.string()).optional().default([]),
		link: z.string().optional().default(""),
		icon: z.string().optional().default("material-symbols:article-outline"),
		image: z.string().optional().default(""),
		draft: z.boolean().optional().default(false),
	}),
});
const specCollection: ReturnType<typeof defineCollection> = defineCollection({
	schema: z.object({}),
});
export const collections: {
	posts: typeof postsCollection;
	projects: typeof projectsCollection;
	spec: typeof specCollection;
} = {
	posts: postsCollection,
	projects: projectsCollection,
	spec: specCollection,
};
