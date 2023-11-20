<script lang="ts">
	import { Button, Card, Heading, Label } from 'flowbite-svelte';
	import { ErrorComp } from '$lib/components';
	import { getPbImageUrl } from '$lib/utils';
	import { Heart } from 'svelte-heros-v2';
	import type { PageData } from '../../../routes/pages/[slug]/$types';
	import EditorField from '../EditorField.svelte';
	import { onMount } from 'svelte';
	import { pb } from '$lib/pocketbase';
	import { addErrorToast } from '$lib/store/toasts';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import type { RecordModel } from 'pocketbase';

	export let data: PageData;
	let value = '';

	$: view = false;

	$: likes = [];
	onMount(async () => {
		likes = await getLikes(data?.resultList?.items);
		view = true;
	});
	async function likeMeal(RELATION_RECORD_ID: string, DEL_RECORD_ID?: string) {
		try {
			if (DEL_RECORD_ID) {
				await pb.collection('meal_likes').delete(DEL_RECORD_ID);
			} else {
				const dataIN = {
					meal: RELATION_RECORD_ID,
					customer: $page.data?.user?.id,
					likes: true
				};
				await pb.collection('meal_likes').create(dataIN);
			}
			invalidateAll();
			likes = await getLikes(data?.resultList?.items)
		} catch (err) {
			console.log(err);
			pb.error(err);
		} finally {
		}
	}
	async function getLikes(records: RecordModel[]) {
		const filters = records?.map(
			(i) => `(meal = "${i.id}" && customer = "${$page.data?.user?.id}")`
		);
		const filter = filters.join(' || ');
		// console.log(filter)
		return await pb.collection('meal_likes').getFullList({
			sort: '-created',
			filter
		});
	}
</script>

{#if view}
	<!-- content here -->
	<EditorField field={{}} {value} />
{/if}
<Heading class="p-8" tag="h1" customSize="text-3xl">
	List Of Meals Available And There Prices
</Heading>
{#if data.error}
	<ErrorComp error={data.error} />
{:else}
	<div class="grid relative md:grid-cols-3 gap-6">
		{#each data.resultList?.items as record}
			<Card
				padding="sm"
				img={record?.photos?.length
					? getPbImageUrl(record, record?.photos[0], '400x400') ?? ''
					: undefined}
			>
				<div class="flex gap-4">
					<Button pill>ADD</Button>
					{#if likes.find((i) => i.meal == record.id)}
						{@const DEL_ID = likes.find((i) => i.meal == record.id)?.id}
						<Button on:click={async() => await likeMeal(record?.id,DEL_ID)} pill color="red">
							<Heart />
							unLike
						</Button>
					{:else}
						<Button on:click={() => likeMeal(record?.id)} pill color="purple">
							<Heart />
							Like
						</Button>
					{/if}
				</div>
				<p class="mb-4 font-thin text-gray-900 dark:text-white">
					<Label for="name2" class="mb-2">Name:</Label>
					{record?.name}
				</p>
				<p class="mb-4 font-thin text-gray-900 dark:text-white">
					<Label for="name2" class="mb-2">Description:</Label>
					{record?.description}
				</p>
			</Card>
		{/each}
	</div>
{/if}
