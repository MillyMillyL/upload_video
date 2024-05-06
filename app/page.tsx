"use client";
import { z } from "zod";
import axios from "axios";
import { ChangeEvent, useEffect, useState } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { Progress } from "./components/ui/Progress";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";

const fileSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.enum(["video/mp4", "image/jpeg"]),
});

const fileUploadSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.enum(["video/mp4", "image/jpeg"]),
  fileName: z.string(),
  uploadedSize: z.number(),
  file: z.instanceof(Blob),
});

type FileUploadSchema = z.infer<typeof fileUploadSchema>;

function createFormData({
  name,
  type,
  size,
  fileName,
  uploadedSize,
  file,
}: FileUploadSchema) {
  const fd = new FormData();
  fd.append("name", name);
  fd.append("type", type);
  fd.append("size", size.toString());
  fd.append("fileName", fileName);
  fd.append("uploadedSize", uploadedSize.toString());
  fd.append("file", file);

  return fd;
}

function MainPage() {
  noStore();

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processMax, setProcessMax] = useState<number>(100);
  const [uploadedSize, setUploadedSize] = useState<number>(0);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files && e.target.files[0];

    if (selectedFile) {
      const fileValidation = fileSchema.safeParse(selectedFile);

      if (fileValidation.success) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Invalid file format, only mp4 video is allowed");
      }
    }
  }

  async function uploadFileChunk(file: File, fileName: string, start: number) {
    const chunk = file.slice(start, start + 64 * 1024);
    if (file.type !== "video/mp4" && file.type !== "image/jpeg") return;
    const formData = createFormData({
      name: file.name,
      type: file.type,
      size: file.size,
      fileName: fileName,
      uploadedSize: start,
      file: chunk,
    });

    try {
      const uploadedResult = await fetch("/api/upload", {
        method: "post",
        body: formData,
      });

      if (!uploadedResult.ok) return;
      console.log(uploadedResult, "uploadedResult.data.code");
      // console.log(uploadedResult, "--uploadedResult");
      setUploadedSize((prevSize) => prevSize + chunk.size);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file");
      return;
    }

    if (start + chunk.size < file.size) {
      await uploadFileChunk(file, fileName, start + chunk.size);
    }
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select a mp4 video to upload");
    } else if (file.type !== "video/mp4" && file.type !== "image/jpeg") {
      setError("Only MP4 video and JPG image are supported");
    } else {
      const { name, size, type } = file;
      const fileName = new Date().getTime() + "_" + name;

      setProcessMax(size);

      await uploadFileChunk(file, fileName, 0);

      setFile(null);
      return;
    }
  }

  const processPercents = Number(
    ((uploadedSize * 100) / processMax).toFixed(2)
  );

  return (
    <div className="container mx-auto w-full max-w-sm items-center space-y-8 mt-8">
      {processPercents > 0 && (
        <>
          <Progress value={processPercents} />
          {processPercents} %
        </>
      )}
      <div className="grid w-full max-w-sm items-center gap-4">
        <Label htmlFor="video">Upload Video</Label>
        <Input id="video" type="file" onChange={handleFileChange} />
        {error && <p className="text-destructive">{error}</p>}
      </div>
      <Button variant="outline" size="lg" onClick={handleUpload}>
        Upload Video
      </Button>
    </div>
  );
}

export default MainPage;
