import axios from "axios";

export const uploadToCloudinary = async (
  uri: string,
  type: "image" | "video" | "raw" = "image",
) => {
  const data = new FormData();

  const filename = uri.split("/").pop() || "upload";
  const ext = filename.split(".").pop();

  let mimeType = "image/jpeg";

  if (type === "video") mimeType = "video/mp4";
  if (type === "raw") mimeType = "application/octet-stream";

  data.append("file", {
    uri,
    type: mimeType,
    name: filename,
  } as any);

  data.append("upload_preset", "med_assist");

  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/dejhvmvqe/${type}/upload`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return res.data.secure_url;
};
