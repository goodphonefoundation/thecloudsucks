
import { tasks } from "@trigger.dev/sdk/v3";

async function triggerTask() {
  try {
    const handle = await tasks.trigger("fetch-social-services", { count: 1 });
    console.log("Task triggered successfully:", handle.id);
  } catch (error) {
    console.error("Error triggering task:", error);
  }
}

triggerTask();
