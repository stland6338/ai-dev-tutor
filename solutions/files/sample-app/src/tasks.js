// タスクの操作。どの関数も配列を書き換えず、新しい配列を返す

export function addTask(tasks, title, { due } = {}) {
  const id = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  return [...tasks, { id, title, due: due ?? null, done: false }];
}

export function completeTask(tasks, id) {
  if (!tasks.some((t) => t.id === id)) throw new Error(`task ${id} not found`);
  return tasks.map((t) => (t.id === id ? { ...t, done: true } : t));
}

export function summarize(tasks) {
  const done = tasks.filter((t) => t.done).length;
  const rate = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  return `${done}/${tasks.length} 完了 (${rate}%)`;
}

// today は "YYYY-MM-DD"
export function overdue(tasks, today) {
  return tasks.filter((t) => !t.done && t.due && t.due < today);
}
