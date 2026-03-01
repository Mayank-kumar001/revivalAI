/**
 * Simple in-memory queue for video processing jobs.
 * One job at a time; processor does: download from S3 → temp3 → run transcript.
 */

const queue = [];
let processing = false;
let jobProcessor = null;

/** Register the function that will process each job: (job) => Promise */
export function setJobProcessor(processor) {
  jobProcessor = processor;
}

export function enqueue(job) {
  queue.push(job);
  processNext();
}

export function getQueueLength() {
  return queue.length;
}

export function isProcessing() {
  return processing;
}

function processNext() {
  if (processing || queue.length === 0 || !jobProcessor) return;

  processing = true;
  const job = queue.shift();

  Promise.resolve(jobProcessor(job))
    .catch((err) => {
      console.error("[videoQueue] job failed:", err);
    })
    .finally(() => {
      processing = false;
      if (queue.length > 0) {
        setImmediate(processNext);
      }
    });
}
