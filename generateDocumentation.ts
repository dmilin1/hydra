import * as fs from "fs";
import * as path from "path";
import * as https from "https";

const DOCUMENTATION_DIR = path.join(__dirname, "documentation");
const OUTPUT_FILE = path.join(__dirname, "constants", "documentation.ts");
const ENV_FILE = path.join(__dirname, ".env.local");

interface Metadata {
  title: string;
  description: string;
}

interface DocumentationEntry {
  title: string;
  description: string;
  vector: number[];
  text: string;
}

interface Documentation {
  [key: string]: DocumentationEntry;
}

function parseMetadata(content: string): { metadata: Metadata; text: string } {
  const metadataStart = content.indexOf("===METADATA===");
  const metadataEnd = content.indexOf("===END METADATA===");

  if (metadataStart === -1 || metadataEnd === -1) {
    // No metadata found, return defaults
    return {
      metadata: { title: "", description: "" },
      text: content.trim(),
    };
  }

  const metadataSection = content.slice(
    metadataStart + "===METADATA===".length,
    metadataEnd,
  );
  const textAfterMetadata = content
    .slice(metadataEnd + "===END METADATA===".length)
    .trim();

  const metadata: Metadata = { title: "", description: "" };

  for (const line of metadataSection.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("title:")) {
      metadata.title = trimmed.slice("title:".length).trim();
    } else if (trimmed.startsWith("description:")) {
      metadata.description = trimmed.slice("description:".length).trim();
    }
  }

  return { metadata, text: textAfterMetadata };
}

function loadEnvFile(): Record<string, string> {
  const envContent = fs.readFileSync(ENV_FILE, "utf-8");
  const env: Record<string, string> = {};

  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex !== -1) {
        const key = trimmed.slice(0, eqIndex).trim();
        let value = trimmed.slice(eqIndex + 1).trim();
        // Remove quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        env[key] = value;
      }
    }
  }

  return env;
}

function getEmbedding(text: string, apiKey: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    });

    const options: https.RequestOptions = {
      hostname: "api.openai.com",
      port: 443,
      path: "/v1/embeddings",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response.data[0].embedding);
          }
        } catch (_e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.write(requestBody);
    req.end();
  });
}

function getDocumentationFiles(): string[] {
  const files = fs.readdirSync(DOCUMENTATION_DIR);
  return files.filter((file) => file.endsWith(".md"));
}

function escapeString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$")
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'");
}

async function processBatch(
  files: string[],
  apiKey: string,
  startIndex: number,
  batchSize: number,
): Promise<{ name: string; entry: DocumentationEntry }[]> {
  const batch = files.slice(startIndex, startIndex + batchSize);
  const promises = batch.map(async (file) => {
    const filePath = path.join(DOCUMENTATION_DIR, file);
    const rawContent = fs.readFileSync(filePath, "utf-8").trim();
    const name = path.basename(file, ".md");
    const { metadata, text } = parseMetadata(rawContent);

    try {
      const vector = await getEmbedding(text, apiKey);
      return {
        name,
        entry: {
          title: metadata.title,
          description: metadata.description,
          vector,
          text,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get embedding for ${name}: ${error}`);
    }
  });

  return Promise.all(promises);
}

async function main() {
  console.log("Loading environment variables...");
  const env = loadEnvFile();
  const apiKey = env["OPEN_AI_KEY"];

  if (!apiKey) {
    console.error("OPEN_AI_KEY not found in .env.local");
    process.exit(1);
  }

  console.log("Reading documentation files...");
  const files = getDocumentationFiles();
  console.log(`Found ${files.length} documentation files`);

  const documentation: Documentation = {};
  const batchSize = 10;
  let processed = 0;

  for (let i = 0; i < files.length; i += batchSize) {
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(files.length / batchSize);
    console.log(`Processing batch ${batchNum}/${totalBatches}...`);

    try {
      const results = await processBatch(files, apiKey, i, batchSize);
      for (const { name, entry } of results) {
        documentation[name] = entry;
      }
      processed += results.length;
      console.log(`Progress: ${processed}/${files.length} files processed`);
    } catch (error) {
      console.error(`Error processing batch ${batchNum}:`, error);
      process.exit(1);
    }
  }

  console.log("\nGenerating output file...");

  let output = "// Auto-generated file - do not edit manually\n";
  output += "// Generated by generateDocumentation.ts\n\n";
  output += "export const DOCUMENTATION = {\n";

  const entries = Object.entries(documentation);
  for (let i = 0; i < entries.length; i++) {
    const [name, { title, description, vector, text }] = entries[i];
    const isLast = i === entries.length - 1;

    output += `  ${name}: {\n`;
    output += `    key: "${name}",\n`;
    output += `    title: "${escapeString(title)}",\n`;
    output += `    description: "${escapeString(description)}",\n`;
    output += `    vector: [${vector.join(", ")}],\n`;
    output += `    text: \`${escapeString(text)}\`,\n`;
    output += `  }${isLast ? "" : ","}\n`;
  }

  output += "};\n";

  fs.writeFileSync(OUTPUT_FILE, output, "utf-8");
  console.log(`✓ Written to ${OUTPUT_FILE}`);
  console.log("Done!");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
