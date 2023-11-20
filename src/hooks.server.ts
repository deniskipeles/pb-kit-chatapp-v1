import { pb } from '$lib/pocketbase';
import { listTablesRecords, listRootsRecords } from '$lib/pocketbase';
import type { Handle } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Handle} */
export const handle: Handle = async ({ event, resolve }) => {
	event.locals.pb = pb;
	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');
	event.locals.tables = await listTablesRecords();
	event.locals.roots = await listRootsRecords();
	try {
		// get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
		let collectionName = event.locals.pb.authStore?.model?.collectionName;
		event.locals.pb.authStore.isValid &&
			(await event.locals.pb.collection(collectionName)?.authRefresh());
		event.locals.company = (await event.locals.roots?.find((i) => i?.name == 'company')) ?? {
			id: ''
		};
		event.locals.user = structuredClone(event.locals.pb.authStore.model);
	} catch (_) {
		// clear the auth store on failed refresh
		event.locals.pb.authStore.clear();
	}
	const response = await resolve(event);
	response.headers.append('set-cookie', event.locals.pb.authStore.exportToCookie({httpOnly:false}));
	return response;
};
