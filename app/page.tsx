"use client";
import { z } from "zod";
import axios from "axios";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChangeEvent, useState } from "react";

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
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processMax, setProcessMax] = useState<number>(100);
  const [processValue, setProcessValue] = useState<number>(0);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files && e.target.files[0];
    console.log(selectedFile?.type);

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

  let uploadedSize = 0;

  async function handleUpload() {
    if (!file) {
      setError("Please select a mp4 video to upload");
    } else if (file.type !== "video/mp4" && file.type !== "image/jpeg") {
      setError("Only MP4 video and JPG image are supported");
    } else {
      const { name, size, type } = file;
      const fileName = new Date().getTime() + "_" + name;

      let uploadedResult = null;
      setProcessMax(size);

      while (uploadedSize < size) {
        const fileChunk = file.slice(uploadedSize, uploadedSize + 64 * 1024);

        const formData = createFormData({
          name,
          type,
          size,
          fileName,
          uploadedSize,
          file: fileChunk,
        });

        try {
          uploadedResult = await axios.post(
            "http://localhost:3000/api/upload",
            formData
          );

          console.log(uploadedResult);
        } catch (error) {
          console.error("Error uploading file:", error);
          alert("An error occurred while uploading the file");
          return;
        }

        uploadedSize += fileChunk.size;
        setProcessValue(uploadedSize);
      }

      alert("Uploaded successfully!");
      setProcessValue(0);
      setProcessMax(100);
    }
  }

  return (
    <div className="container mx-auto w-full max-w-sm items-center space-y-8 mt-8">
      <Progress value={33} max={processMax} />

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
