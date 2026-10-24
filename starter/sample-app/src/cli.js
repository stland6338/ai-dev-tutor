#!/usr/bin/env node
// 使い方:
//   node src/cli.js add "牛乳を買う" --due 2026-10-25
//   node src/cli.js done 1
//   node src/cli.js list
//   node src/cli.js overdue
//   node src/cli.js summary
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { addTask, completeTask, overdue, summarize } from "./tasks.js";

const FILE = process.env.TASKLOG_FILE || "tasks.json";
const load = () => (existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")) : []);
const save = (tasks) => writeFileSync(FILE, JSON.stringify(tasks, null, 2) + "\n");
const today = () => new Date().toISOString().slice(0, 10);

const [cmd, ...args] = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const show = (t) => `${t.done ? "✓" : " "} ${t.id}. ${t.title}${t.due ? ` (期限 ${t.due})` : ""}`;

switch (cmd) {
  case "add":
    save(addTask(load(), args[0], { due: flag("due") }));
    break;
  case "done":
    save(completeTask(load(), Number(args[0])));
    break;
  case "list":
    for (const t of load()) console.log(show(t));
    break;
  case "overdue":
    for (const t of overdue(load(), today())) console.log(show(t));
    break;
  case "summary":
    console.log(summarize(load()));
    break;
  default:
    console.log("使い方: add <title> [--due YYYY-MM-DD] | done <id> | list | overdue | summary");
    process.exitCode = cmd ? 1 : 0;
}
