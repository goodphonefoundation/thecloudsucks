import { tasks, configure } from "@trigger.dev/sdk/v3";

// Configure to use local instance
configure({
  baseURL: "http://localhost:8030",
  secretKey: "tr_prod_sgdN9Gzgnnz9CnZdwdD9",
});

async function main() {
  const handle = await tasks.trigger(
    "fetch-social-services",
    { count: 5 }
  );

  console.log("Task triggered successfully!");
  console.log("Run ID:", handle.id);
  console.log("View run:", `http://localhost:8030/projects/v3/proj_lgmtzendqoebtfksmogz/runs/${handle.id}`);
}

main().catch(console.error);
