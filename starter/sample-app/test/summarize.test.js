import { test } from "node:test";
import assert from "node:assert/strict";
import { addTask, completeTask, summarize } from "../src/tasks.js";

test("summarize は完了数と割合を返す", () => {
  const tasks = completeTask(addTask(addTask([], "a"), "b"), 1);
  assert.equal(summarize(tasks), "1/2 完了 (50%)");
});

test("summarize はタスクが無くても 0% と表示する", () => {
  assert.equal(summarize([]), "0/0 完了 (0%)");
});
