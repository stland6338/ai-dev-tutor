import { test } from "node:test";
import assert from "node:assert/strict";
import { addTask, completeTask } from "../src/tasks.js";

test("addTask は連番の id を振る", () => {
  const tasks = addTask(addTask([], "a"), "b", { due: "2026-10-30" });
  assert.deepEqual(tasks.map((t) => t.id), [1, 2]);
  assert.equal(tasks[1].due, "2026-10-30");
});

test("completeTask は対象だけを完了にする", () => {
  const tasks = completeTask(addTask(addTask([], "a"), "b"), 2);
  assert.deepEqual(tasks.map((t) => t.done), [false, true]);
});

test("completeTask は存在しない id でエラーにする", () => {
  assert.throws(() => completeTask([], 1), /not found/);
});
