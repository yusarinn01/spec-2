export const TASK_TYPES = [
  { value: "watering", label: "Watering" },
  { value: "fertilizing", label: "Fertilizing" },
  { value: "planting", label: "Planting" },
  { value: "pest", label: "Pest control" },
  { value: "harvest", label: "Harvesting" },
  { value: "other", label: "Other" },
];

export const typeLabel = (value) =>
  TASK_TYPES.find((t) => t.value === value)?.label ?? "Other";

export const STATUS_LABEL = { pending: "Pending", done: "Done", overdue: "Overdue" };

export const getStatus = (task, today) =>
  task.done ? "done" : task.dueDate < today ? "overdue" : "pending";
