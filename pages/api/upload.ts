import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    // Handle POST request for file upload
    // Add your file upload logic here
    console.log(req.body, "req.body");
    res.status(200).json({ message: "File upload endpoint" });
  } else {
    // Return an error for unsupported HTTP methods
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
