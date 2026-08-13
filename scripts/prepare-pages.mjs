import { access, cp, rm } from "node:fs/promises";
import { join } from "node:path";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];

if (!repositoryName || repositoryName.endsWith(".github.io")) {
  process.exit(0);
}

const clientRoot = join(process.cwd(), "dist", "client");
const generatedAssetRoot = join(clientRoot, repositoryName, "_next");
const artifactAssetRoot = join(clientRoot, "_next");

await access(generatedAssetRoot);
await rm(artifactAssetRoot, { recursive: true, force: true });
await cp(generatedAssetRoot, artifactAssetRoot, { recursive: true });
await rm(join(clientRoot, repositoryName), { recursive: true, force: true });
