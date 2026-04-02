import { Task } from './types';
import fs from 'fs';
import path from 'path';

export class MemoryManager {
  private tasks: Map<string, Task> = new Map();
  private activePath: string;
  private archivePath: string;

  constructor(baseDir?: string) {
    const dir = baseDir || __dirname;
    this.activePath = path.join(dir, 'mode6_memory.json');
    this.archivePath = path.join(dir, 'mode6_archive.json');
    this.load();
  }

  private load() {
    if (fs.existsSync(this.activePath)) {
      try {
        const data = fs.readFileSync(this.activePath, 'utf-8');
        const rawTasks: Task[] = JSON.parse(data);
        rawTasks.forEach(t => this.tasks.set(t.id, t));
      } catch (e) {
        console.error('Failed to load memory:', e);
      }
    }
  }

  private save() {
    try {
      const data = JSON.stringify(Array.from(this.tasks.values()), null, 2);
      fs.writeFileSync(this.activePath, data);
    } catch (e) {
      console.error('Failed to save memory:', e);
    }
  }

  createTask(description: string, source: Task['source'] = 'system'): Task {
    const id = `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const task: Task = {
      id,
      description,
      source,
      priority: 'medium',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(id, task);
    this.save();
    return task;
  }

  getPendingTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'pending');
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask = { ...task, ...updates, updatedAt: new Date().toISOString() };
    this.tasks.set(id, updatedTask);
    this.save();
    return updatedTask;
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Moves completed/failed tasks to the archive file to keep active memory clean.
   */
  archiveCompletedTasks() {
    const active: Task[] = [];
    const toArchive: Task[] = [];

    this.tasks.forEach(task => {
      if (task.status === 'completed' || task.status === 'failed') {
        toArchive.push(task);
      } else {
        active.push(task);
      }
    });

    if (toArchive.length === 0) return;

    // 1. Update In-Memory Active
    this.tasks.clear();
    active.forEach(t => this.tasks.set(t.id, t));
    this.save();

    // 2. Append to Archive File
    try {
      let archiveData: Task[] = [];
      if (fs.existsSync(this.archivePath)) {
        archiveData = JSON.parse(fs.readFileSync(this.archivePath, 'utf-8'));
      }
      archiveData = [...archiveData, ...toArchive];
      fs.writeFileSync(this.archivePath, JSON.stringify(archiveData, null, 2));
      console.log(`[Memory] Archived ${toArchive.length} tasks.`);
    } catch (e) {
      console.error('Failed to write archive:', e);
    }
  }
}
