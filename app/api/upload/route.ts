// import type { NextApiRequest, NextApiResponse } from "next";
import { appendFileSync, existsSync, writeFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { resolve } from "path";

export async function POST(req: NextRequest, res: NextResponse) {
  const data = await req.formData();
  const formObject = Object.fromEntries(data);
  const { name, type, size, fileName, uploadedSize } = formObject;
  const file = data.get("file");
  console.log(file, "--file");

  if (!file) {
    return NextResponse.json({ message: "No file uploaded" });
  }

  if (type !== "video/mp4" && type !== "image/jpeg") {
    return NextResponse.json({
      message: "The file type is not allowed for uploading",
    });
  }

  const filePath = resolve(__dirname + fileName);
  console.log(filePath);

  console.log(uploadedSize, "--uploaded size");

  if (Number(uploadedSize) !== 0) {
    if (!existsSync(filePath)) {
      return NextResponse.json({
        message: "No file exists",
      });
    }

    appendFileSync(filePath, JSON.stringify(file));
    NextResponse.json({
      message: "Appended",
      video_url: "http://localhost:3000/" + fileName,
    });
  }

  console.log("Uploaded file size is 0, gonna write the file");
  writeFileSync(filePath, JSON.stringify(file));
  return NextResponse.json({ message: "File is created" });
}
