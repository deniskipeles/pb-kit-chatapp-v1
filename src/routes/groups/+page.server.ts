import type { PageServerLoad } from "./$types";

export const load = (({ locals }) => {
  const { pb, ...rest } = locals;
  return {
    ...rest,
  };
}) satisfies PageServerLoad;
