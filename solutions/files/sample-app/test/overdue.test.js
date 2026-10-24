import { test } from "node:test";
import assert from "node:assert/strict";
import { addTask, overdue } from "../src/tasks.js";

test("overdue は期限が今日より前のものだけを返す", () => {
  let tasks = addTask([], "昨日", { due: "2026-10-23" });
  tasks = addTask(tasks, "今日", { due: "2026-10-24" });
  tasks = addTask(tasks, "期限なし");
  assert.deepEqual(overdue(tasks, "2026-10-24").map((t) => t.title), ["昨日"]);
});
