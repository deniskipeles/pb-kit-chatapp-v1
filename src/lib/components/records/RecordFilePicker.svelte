<script>
	import { createEventDispatcher } from 'svelte';
	import CommonHelper from '$lib/utils/CommonHelper';
	// import ApiClient from "$lib/utils/ApiClient";
	import tooltip from '$lib/actions/tooltip';
	import OverlayPanel from '$lib/components/OverlayPanel.svelte';
	// import Searchbar from "$lib/components/Searchbar.svelte";
	import Scroller from '$lib/components/Scroller.svelte';
	import { page } from '$app/stores';
	import { pb as ApiClient } from '$lib/pocketbase';
	import Field from '../Field.svelte';
	import ObjectSelect from '../ObjectSelect.svelte';

	const dispatch = createEventDispatcher();
	const uniqueId = 'file_picker_' + CommonHelper.randomString(5);
	const batchSize = 50;

	export let title = 'Select a file';
	export let submitText = 'Insert';
	export let fileTypes = ['image', 'document', 'video', 'audio', 'file'];

	let pickerPanel;
	let upsertPanel;
	let filter = '';
	let list = [];
	let currentPage = 1;
	let lastItemsCount = 0;
	let isLoading = false;
	let fileCollections = [];
	let fileFields = [];
	let sizeOptions = [];
	let selectedCollection = {};
	let selectedFile = {};
	let selectedSize = '';

	// find all collections with at least one non-protected file field
	$: fileCollections = $page.data?.tables?.filter((c) => {
		return (
			c.type !== 'view' &&
			c.name == 'images' &&
			!!CommonHelper.toArray(c.schema).find((f) => {
				return (
					// is file field
					f.type === 'file' &&
					// is public (aka. doesn't require file token)
					!f.options?.protected &&
					// allow any MIME type OR image/*
					(!f.options?.mimeTypes?.length ||
						!!f.options?.mimeTypes?.find((t) => t.startsWith('image/')))
				);
			})
		);
	});

	// auto select the first collection from the list
	$: if (!selectedCollection?.id && fileCollections.length > 0) {
		selectedCollection = fileCollections[0];
	}

	$: fileFields = selectedCollection?.schema?.filter(
		(f) => f.type === 'file' && !f.options?.protected
	);

	// reset filter on collection change
	$: if (selectedCollection?.id) {
		clearFilter();
		refreshSizeOptions();
	}

	// refresh the size options on selected file change
	$: if (selectedFile?.name) {
		refreshSizeOptions();
	}

	// reset list on filter or collection change
	$: if (typeof filter !== 'undefined' && selectedCollection?.id && pickerPanel?.isActive()) {
		loadList(true);
	}

	$: isSelected = (record, name) => {
		return selectedFile?.name == name && selectedFile?.record?.id == record.id;
	};

	$: hasAtleastOneFile = list.find((r) => extractFiles(r).length > 0);

	$: canLoadMore = !isLoading && lastItemsCount == batchSize;

	$: canSubmit = !isLoading && !!selectedFile?.name;

	export function show() {
		loadList(true);

		return pickerPanel?.show();
	}

	export function hide() {
		return pickerPanel?.hide();
	}

	function clearList() {
		list = [];
		selectedFile = {};
		selectedSize = '';
	}

	function clearFilter() {
		filter = '';
	}

	async function loadList(reset = false) {
		if (!selectedCollection?.id) {
			return;
		}

		isLoading = true;

		if (reset) {
			clearList();
		}

		try {
			const page = reset ? 1 : currentPage + 1;

			const fallbackSearchFields = CommonHelper.getAllCollectionIdentifiers(selectedCollection);

			let normalizedFilter = CommonHelper.normalizeSearchFilter(filter, fallbackSearchFields) || '';

			if (normalizedFilter) {
				normalizedFilter += ' && ';
			}
			normalizedFilter += '(' + fileFields.map((f) => `${f.name}:length>0`).join('||') + ')';

			const result = await ApiClient.collection(selectedCollection.id).getList(page, batchSize, {
				filter: normalizedFilter,
				sort: '-created',
				fields: '*:excerpt(100)',
				skipTotal: 1,
				requestKey: uniqueId + 'loadImagePicker'
			});

			list = CommonHelper.filterDuplicatesByKey(list.concat(result.items));
			currentPage = result.page;
			lastItemsCount = result.items.length;

			isLoading = false;
		} catch (err) {
			console.log(JSON.stringify(err));
			if (!err.isAbort) {
				ApiClient.error(err);
				isLoading = false;
			}
		}
	}

	function refreshSizeOptions() {
		let sizes = ['100x100']; // default Admin UI thumb

		// extract the thumb sizes of the selected file field
		if (selectedFile?.record?.id) {
			for (const field of fileFields) {
				if (CommonHelper.toArray(selectedFile.record[field.name]).includes(selectedFile.name)) {
					sizes = sizes.concat(CommonHelper.toArray(field.options?.thumbs));
					break;
				}
			}
		}

		// constuct the dropdown options
		sizeOptions = [{ label: 'Original size', value: '' }];
		for (const size of sizes) {
			sizeOptions.push({
				label: `${size} thumb`,
				value: size
			});
		}

		// reset selected size if missing
		if (selectedSize && !sizes.includes(selectedSize)) {
			selectedSize = '';
		}
	}

	function extractFiles(record) {
		let result = [];

		for (const field of fileFields) {
			const names = CommonHelper.toArray(record[field.name]);
			for (const name of names) {
				if (fileTypes.includes(CommonHelper.getFileType(name))) {
					result.push(name);
				}
			}
		}

		return result;
	}

	function select(record, name) {
		selectedFile = { record, name };
	}

	function submit() {
		if (!canSubmit) {
			return;
		}

		dispatch(
			'submit',
			Object.assign(
				{
					size: selectedSize
				},
				selectedFile
			)
		);

		hide();
	}

	import { Drawer, CloseButton, Button, Search } from 'flowbite-svelte';
	import { sineIn } from 'svelte/easing';
	let hidden1 = true;
	let transitionParams = {
		x: -320,
		duration: 200,
		easing: sineIn
	};
</script>

<OverlayPanel
	bind:this={pickerPanel}
	popup
	class="file-picker-popup"
	on:hide
	on:show
	{...$$restProps}
>
	<svelte:fragment slot="header">
		<h4>{title}</h4>
	</svelte:fragment>

	{#if !fileCollections.length}
		<h6 class="txt-center txt-hint">
			You currently don't have any collection with <code>file</code> field.
		</h6>
	{:else}
		<div class="file-picker">
			<aside class="file-picker-sidebar">
				{#each fileCollections as collection (collection.id)}
					<button
						type="button"
						class="sidebar-item"
						class:active={selectedCollection?.id == collection.id}
						on:click|preventDefault={() => {
							selectedCollection = collection;
						}}
					>
						{collection.name}
					</button>
				{/each}
			</aside>

			<div class="file-picker-content">
				<div class="flex m-b-base flex-gap-10">
					<div class="border-2 flex w-full rounded-full">
						<Search class="rounded-full" />
						<Button pill>Search</Button>
					</div>
					<!-- <Searchbar
                        value={filter}
                        placeholder="Record search term or filter..."
                        autocompleteCollection={selectedCollection}
                        on:submit={(e) => (filter = e.detail)}
                    /> -->
					<button
						type="button"
						class="btn btn-pill btn-transparent btn-hint p-l-xs p-r-xs"
						on:click={() => {
							upsertPanel?.show();
							hidden1 = false;
						}}
					>
						<div class="txt">New record</div>
					</button>
				</div>
				<Scroller
					class="files-list"
					vThreshold={100}
					on:vScrollEnd={() => {
						if (canLoadMore) {
							loadList();
						}
					}}
				>
					{#if hasAtleastOneFile}
						{#each list as record (record.id)}
							{@const names = extractFiles(record)}
							{#each names as name}
								<button
									type="button"
									class="thumb handle"
									use:tooltip={name + '\n(record: ' + record.id + ')'}
									class:thumb-warning={isSelected(record, name)}
									on:click|preventDefault={select(record, name)}
								>
									{#if CommonHelper.hasImageExtension(name)}
										<img
											loading="lazy"
											src={ApiClient.files.getUrl(record, name, { thumb: '100x100' })}
											alt={name}
										/>
									{:else}
										<i class="ri-file-3-line" />
									{/if}
								</button>
							{/each}
						{/each}
					{:else if !isLoading}
						<div class="inline-flex">
							<span class="txt txt-hint">No records with images found.</span>
							{#if filter?.length}
								<button
									type="button"
									class="btn btn-hint btn-sm"
									on:click|preventDefault={clearFilter}
								>
									<span class="txt">Clear filter</span>
								</button>
							{/if}
						</div>
					{/if}

					{#if isLoading}
						<div class="block txt-center">
							<span class="loader loader-sm active" />
						</div>
					{/if}
				</Scroller>
			</div>
		</div>
	{/if}

	<svelte:fragment slot="footer">
		<button type="button" class="btn btn-transparent m-r-auto" disabled={isLoading} on:click={hide}>
			<span class="txt">Cancel</span>
		</button>

		{#if CommonHelper.hasImageExtension(selectedFile?.name)}
			<Field class="form-field file-picker-size-select" let:uniqueId>
				<ObjectSelect
					upside
					id={uniqueId}
					items={sizeOptions}
					disabled={!canSubmit}
					selectPlaceholder="Select size"
					bind:keyOfSelected={selectedSize}
				/>
			</Field>
		{/if}

		<button type="button" class="btn btn-expanded" disabled={!canSubmit} on:click={submit}>
			<span class="txt">{submitText}</span>
		</button>
	</svelte:fragment>
    
    <Drawer transitionType="fly" {transitionParams} bind:hidden={hidden1} id="sidebar1">
        <div class="flex items-center">
            <h5
                id="drawer-label"
                class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"
            >
                <svg
                    class="w-5 h-5 mr-2"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    ><path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clip-rule="evenodd"
                    /></svg
                >Info
            </h5>
            <CloseButton on:click={() => (hidden1 = true)} class="mb-4 dark:text-white" />
        </div>
        <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Supercharge your hiring by taking advantage of our <a
                href="/"
                class="text-blue-600 underline dark:text-blue-500 hover:no-underline">limited-time sale</a
            > for Flowbite Docs + Job Board. Unlimited access to over 190K top-ranked candidates and the #1 design
            job board.
        </p>
        <div class="grid grid-cols-2 gap-4">
            <Button color="light" href="/">Learn more</Button>
            <Button href="/"
                >Get access <svg
                    class="w-4 h-4 ml-1"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    ><path
                        fill-rule="evenodd"
                        d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                    /></svg
                ></Button
            >
        </div>
    </Drawer>
</OverlayPanel>

<!-- <div class="text-center">
	<Button on:click={() => (hidden1 = false)}>Show drawer</Button>
</div> -->


