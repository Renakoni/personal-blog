import { type CollectionEntry, getCollection } from "astro:content";
import type { Icon } from "astro-icon/components";

export type ProjectEntry = CollectionEntry<"projects"> & {
	data: CollectionEntry<"projects">["data"] & {
		icon: Parameters<typeof Icon>[0]["name"];
	};
};

export async function getProjects(): Promise<ProjectEntry[]> {
	const projects = await getCollection("projects", ({ data }) => {
		return data.draft !== true;
	});

	return projects
		.map((project) => ({
			...project,
			data: {
				...project.data,
				icon: project.data.icon as Parameters<typeof Icon>[0]["name"],
			},
		}))
		.sort((a, b) => a.data.name.localeCompare(b.data.name));
}
