/** @type {import('./$types').LayoutServerLoad} */
export const load = async ({ locals }) => {
  const { pb, ...rest } = locals;
  return {
    ...rest,
  };
};
