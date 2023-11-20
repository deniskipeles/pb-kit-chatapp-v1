import { pb } from "$lib/pocketbase";

export async function postData(fetch: any, collection: string) {
  await fetch("/api/meilisearch", {
    method: "POST",
    body: JSON.stringify({ collection }),
  });
}

export const serializeNonPOJOs = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};

export const getPbImageUrl = (
  doc: any,
  img: string | null,
  dim = "100x100"
) => {
  let logo = (img ? pb.files.getUrl(doc, img, { thumb: dim }) : null) ?? null;
  return logo;
};

export function formatDate(input: string | Date | null): string {
  if (!input) {
    return "";
  }
  let date: Date;
  if (typeof input === "string") {
    // Parse the input string as a Date
    date = new Date(input);
  } else if (input instanceof Date) {
    // If input is already a Date object, use it as is
    date = input;
  } else {
    throw new Error(
      "Invalid input. Please provide a valid string date or Date object."
    );
  }

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format. Please provide a valid date.");
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of the year

  return `${day}/${month}/${year}`;
}

export function formatObject(input: InputObject): InputObject {
  const formattedObject: InputObject = {};

  for (const key in input) {
    if (input.hasOwnProperty(key)) {
      const [property, type] = key.split("__");
      const value = input[key];

      switch (type) {
        case "bool":
          formattedObject[property] =
            value === 1 ? `is ${property}` : `is not ${property}`;
          break;
        case "string":
          formattedObject[property] = value as string;
          break;
        case "date":
          formattedObject[property] = formatDate(value + "") as string;
          break;
        default:
          formattedObject[property] = value;
          break;
      }
    }
  }

  return formattedObject;
}


export function setObjectFormData(obj: Record<string, any>): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(obj)) {
    formData.append(key, value);
  }

  return formData;
}