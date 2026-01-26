import axios from "axios";
import { htmlToText } from "html-to-text";
import { JobInputs } from "./types";

export default async function sendWhatsupGroupMessage(
  vaccancy: JobInputs & { id: string },
) {
  // sending to vaccancy whats up group
  let description = htmlToText(vaccancy.description, {
    wordwrap: false,
    selectors: [
      {
        selector: "ul",
        options: {
          // itemPrefix: "\n• ",
          leadingLineBreaks: 1,
          trailingLineBreaks: 1,
        },
      },
      {
        selector: "ol",
        options: {
          // itemPrefix: "\n1. ",
          leadingLineBreaks: 1,
          trailingLineBreaks: 1,
        },
      },
    ],
  });
  description = description
    // bullets
    .replace(/\s*•\s*/g, "\n• ")
    // numbered lists
    .replace(/\n?\s*(\d+)\.\s*/g, "\n$1. ")
    // remove extra blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const MAX_LENGTH = 500;
  // Limit length safely
  if (description.length > MAX_LENGTH) {
    description = description.slice(0, MAX_LENGTH).trim() + "...";
  }
  const message = `🧑‍💼 *${vaccancy.title}*

📝 ${description}

📍 ${vaccancy.city}, ${vaccancy.country}

🔗 Apply: ${process.env.NEXT_PUBLIC_BASE_URL}/vaccancy/${vaccancy.id}`;
  await axios
    .post(`${process.env.NEXT_PUBLIC_SOCKET_PROD_SERVER}/send-group`, {
      message,
    })
    .then(({ data }) => console.log(data))
    .catch((err) => console.error(err));
}
