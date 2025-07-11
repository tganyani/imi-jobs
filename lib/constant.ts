export const defaultTemplate = `
  <h3 ">Job Description</h3>
  <p>We are looking for a passionate and experienced [Job Title] to join our team.</p>

  <h3 class="template-header">Roles and Responsibilities</h3>
  <ul>
    <li>Lead and manage projects.</li>
    <li>Collaborate with cross-functional teams.</li>
    <li>Ensure timely delivery of tasks.</li>
  </ul>

  <h3 ">Qualifications</h3>
  <ul>
    <li>Bachelor's degree in a relevant field.</li>
    <li>Minimum 3 years of experience.</li>
  </ul>

  <h3 >Key Skills</h3>
  <ul>
    <li>Excellent communication</li>
    <li>Leadership and time management</li>
    <li>Problem-solving skills</li>
  </ul>
`;

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function stripHtml(html: string): string {
  if (typeof window === "undefined") return html;
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

export enum ApplicationStatus {
  invited = "invited",
  rejected = "rejected",
   pending=" pending"
}
export enum Role {
  candidate = "candidate",
  recruiter = "recruiter",
}

export function generateRoomName(user1: string, user2: string) {
  const roomName =
    user1 < user2 ? "".concat(user1, user2) : "".concat(user2, user1);
  return roomName;
}

export function formatFileSize(bytes: number): string {
  const units = ["B", "kB", "MB", "GB", "TB"];
  let i = 0;

  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }

  return `${bytes.toFixed(1)} ${units[i]}`;
}

export function isImageFile(url: string ): boolean {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
  const ext = url.split(".").pop()?.toLowerCase();
  if (ext) {
    return url.includes("/image/") && imageExtensions.includes(ext);
  }
  return false;
}


export function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}


export const quillModules = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ header: [3, false] }],
    [{ list: "ordered" }, { list: "bullet" }], 
    ["link", "image"],
  ],
};

export const jobFields:{id:number,title:string}[] = [
  { id: 1, title: "general" },
  { id: 2, title: "arts" },
  { id: 3, title: "business" },
  { id: 4, title: "communications" },
  { id: 5, title: "education" },
  { id: 6, title: "health care" },
  { id: 7, title: "hospitality" },
  { id: 8, title: "information technology" },
  { id: 9, title: "law enforcement" },
  { id: 10, title: "sales and marketing" },
  { id: 11, title: "science" },
  { id: 12, title: "transportation" },
  { id: 13, title: "engineering" },
];


export const defaultCompanyTemplate = `
  <h3>Company History</h3>
  <p>Founded in [year], our company has grown from a small startup into a leading innovator in the tech industry.</p>

  <h3>Our Goals</h3>
  <ul>
    <li>Deliver exceptional products that solve real-world problems</li>
    <li>Maintain a customer-first approach in everything we do</li>
    <li>Expand our reach to global markets</li>
  </ul>

  <h3>Objectives</h3>
  <ul>
    <li>Launch three new product lines in the next year</li>
    <li>Improve customer retention by ...%</li>
    <li>Achieve ..... by 2030</li>
  </ul>

  <h3>Products & Services</h3>
  <p>We offer a suite of solutions ....., .....</p>
  
`;


