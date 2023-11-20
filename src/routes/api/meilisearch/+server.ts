import { MeiliSearch } from "meilisearch";
import { json } from "@sveltejs/kit";

export const POST = async ({ locals: { tables }, request }) => {
  const data = await request.json();
  try {
    const collection = tables?.find(
      (i) => i?.name == data?.collection || i?.id == data?.collection
    ) ?? data?.collection;
    if (collection) {
      await addRecords(collection, tables);
      return json({ success: true });
    }
  } catch (error) {
    console.log(error);
    return json({ success: false });
  }
};


import { getPbImageUrl } from "$lib/utils/index.js";
import { pb } from "$lib/pocketbase/index.js";
async function addRecords(collection = tbl, tables = [tbl]) {
  // fetch a paginated records list
  const expand = collection?.schema
    .filter((i: any) => i.type == "relation")
    ?.map((i: any) => i?.name)
    ?.join(",");
  const excerpt = collection.schema
    .filter((i: any) => i.type == "editor")
    ?.map((i: any) => `${i?.name}:excerpt(300)`)
    ?.join(",");

  const fields = excerpt.length > 0 ? `*,${excerpt}` : "*";

  const resultList = await pb
    .collection(collection.name)
    .getList(1, 20, { sort: "-created", expand, fields });

  let records: any[] = [];
  const client = new MeiliSearch({
    host: "http://127.0.0.1:7700",
    apiKey: "K8-at0L2VK9BA3WittesOV8g5SC9nCkJJ6gQTCrvO3w",
  });

  const schema_text = collection?.schema
    ?.filter((i) => i?.type == "text")
    ?.map((i) => i?.name);
  const schema_file = collection?.schema?.filter((i) => i?.type == "file");
  const schema_relation = collection?.schema?.filter(
    (i) => i?.type == "relation"
  );
  records = resultList?.items?.map((record) => {
    let obj: any = {};

    obj.id = record.id;
    for (const key of schema_text) {
      obj[key] = record[key];
    }
    for (const key of schema_file) {
      if (key.options.maxSelect == 1) {
        obj[key.name] = getPbImageUrl(record, record[key.name]);
      } else {
        obj[key.name] = getPbImageUrl(record, record[key.name][0]);
      }
    }
    for (const key of schema_relation) {
      const collection_relation =
        tables
          ?.find((i) => i?.id == key.options.collectionId)
          ?.schema?.filter((i) => i?.type == "text")
          ?.map((i) => i?.name) ?? [];
      if (key.options.maxSelect == 1) {
        let sub_obj:any = {};
        const sub_record = record?.expand?.[key.name];
        sub_obj.id = sub_record?.id;
        for (const key of collection_relation) {
          sub_obj[key] = sub_record[key];
        }
        obj[key.name] = sub_obj;
      } else {
        let arr = [];
        for (const sub_record of record?.expand?.[key.name] ?? []) {
          let sub_obj:any = {};
          sub_obj.id = sub_record?.id;
          for (const key of collection_relation) {
            sub_obj[key] = sub_record[key];
          }
          arr.push(sub_obj);
        }
        obj[key.name] = arr;
      }
    }
    obj.created = record.created
    obj.updated = record.updated
    return obj;
  });

  const index = client.index(collection?.name);
  let response = await index.addDocuments(records);
//   console.log(response);
}



const tbl = {
  collectionId: "e6irxp2dv25cekz",
  collectionName: "view_tables",
  createRule: "@request.auth.id != ''",
  created: "2023-11-06 15:21:37.863Z",
  deleteRule: null,
  id: "yc42uue4tp4h38x",
  indexes: [],
  listRule: "sender = @request.auth.id ||\nreceiver = @request.auth.id",
  name: "one_to_one_messages",
  options: {},
  schema: [
    {
      system: false,
      id: "oy9lgu3r",
      name: "sender",
      type: "relation",
      required: false,
      presentable: false,
      unique: false,
      options: {
        collectionId: "_pb_users_auth_",
        cascadeDelete: false,
        minSelect: null,
        maxSelect: 1,
        displayFields: null,
      },
    },
    {
      system: false,
      id: "f76tqidc",
      name: "receiver",
      type: "relation",
      required: false,
      presentable: false,
      unique: false,
      options: {
        collectionId: "_pb_users_auth_",
        cascadeDelete: false,
        minSelect: null,
        maxSelect: 1,
        displayFields: null,
      },
    },
    {
      system: false,
      id: "yfeddlfz",
      name: "message",
      type: "text",
      required: true,
      presentable: false,
      unique: false,
      options: {
        min: null,
        max: 1024,
        pattern: "",
      },
    },
    {
      system: false,
      id: "fv9uj0mz",
      name: "files",
      type: "file",
      required: false,
      presentable: false,
      unique: false,
      options: {
        maxSelect: 20,
        maxSize: 5242880,
        mimeTypes: [],
        thumbs: [],
        protected: false,
      },
    },
    {
      system: false,
      id: "i6crwr9m",
      name: "read",
      type: "bool",
      required: false,
      presentable: false,
      unique: false,
      options: {},
    },
  ],
  system: 0,
  type: "base",
  updateRule: null,
  updated: "2023-11-09 10:23:39.792Z",
  viewRule: "sender = @request.auth.id ||\nreceiver = @request.auth.id",
};
