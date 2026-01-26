import axios from "axios";
import { JobInputs } from "./types";
import { PNG } from "pngjs";
import FormData from "form-data";
import { stringToColor } from "./constant";

export async function generatePngWithBackground(
  color = "#ffffff",
): Promise<Buffer> {
  const width = 1200;
  const height = 630;

  // Convert hex to RGB
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  const png = new PNG({ width, height });

  // Fill each pixel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      png.data[idx] = r; // R
      png.data[idx + 1] = g; // G
      png.data[idx + 2] = b; // B
      png.data[idx + 3] = 255; // Alpha
    }
  }

  // Convert PNG object to buffer
  const buffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    png
      .pack()
      .on("data", (chunk) => chunks.push(chunk))
      .on("end", () => resolve(Buffer.concat(chunks)))
      .on("error", reject);
  });

  return buffer;
}

export async function FbJobFeed(job: JobInputs & { id: string }) {
  const message = `
${job.title}  at ${job.companyName}
Location: ${job.city}, ${job.country}

Apply here: https://www.imisebenzi.co.zw/vaccancy/${job.id}


#ZimbabweJobs #SouthAfricaJobs #VacanciesZW #CareersSA
#JobsInZimbabwe #HiringNow #JobAlert
`;

  const color = stringToColor(job.title);
  const imageBuffer = await generatePngWithBackground(color);
  const form = new FormData();

  form.append("caption", message);
  form.append("published", "true");
  form.append("access_token", process.env.PAGE_ACCESS_TOKEN);
  form.append("source", imageBuffer, {
    filename: "image.png",
    contentType: "image/png",
  });

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v24.0/${process.env.PAGE_ID}/photos`,
      form,
      {
        headers: form.getHeaders(),
      },
    );

    // console.log("Posted successfully:", response.data);
  } catch (error) {
    console.error("Error posting to Facebook:", error);
  }
}
