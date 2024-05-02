// import type { NextApiRequest, NextApiResponse } from "next";
import { appendFileSync, existsSync, writeFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { join, resolve } from "path";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const formObject = Object.fromEntries(data);
  const file = data.get("file") as File;
  if (!file) {
    return NextResponse.json({ message: "No file uploaded" });
  }

  const fileData = await file.arrayBuffer();

  const { name, type, size, fileName, uploadedSize } = formObject;

  if (type !== "video/mp4" && type !== "image/jpeg") {
    return NextResponse.json({
      message: "The file type is not allowed for uploading",
    });
  }

  const filePath = resolve(__dirname, fileName as string);

  console.log(
    uploadedSize,
    typeof uploadedSize,
    "uploadedsize",
    Number(uploadedSize) !== 0
  );
  console.log(filePath);

  try {
    if (Number(uploadedSize) !== 0) {
      if (!existsSync(filePath)) {
        return NextResponse.json({
          message: "No file exists",
        });
      }

      appendFileSync(filePath, Buffer.from(fileData));

      return NextResponse.json({
        message: "Appended",
        video_url: "http://localhost:3000/" + fileName,
      });
    }
    writeFileSync(filePath, Buffer.from(fileData));
    return NextResponse.json({ message: "File is created" });
  } catch (e) {
    return NextResponse.json({ e, message: "Final catch error" });
  }
}
