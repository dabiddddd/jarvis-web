import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || path.join(process.cwd(), 'workspace');
const MAX_OUTPUT_SIZE = 10000; // 10KB max output
const TIMEOUT_MS = 30000; // 30 seconds

export async function ensureWorkspace() {
  try {
    await fs.access(WORKSPACE_DIR);
  } catch {
    await fs.mkdir(WORKSPACE_DIR, { recursive: true });
  }
}

export async function executeCommand(
  command: string,
  cwd?: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  await ensureWorkspace();
  const workDir = cwd || WORKSPACE_DIR;

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: workDir,
      timeout: TIMEOUT_MS,
      maxBuffer: MAX_OUTPUT_SIZE,
      env: {
        ...process.env,
        PATH: process.env.PATH,
        HOME: process.env.HOME || WORKSPACE_DIR,
      },
    });

    return {
      stdout: stdout.slice(0, MAX_OUTPUT_SIZE),
      stderr: stderr.slice(0, MAX_OUTPUT_SIZE),
      exitCode: 0,
    };
  } catch (error: any) {
    return {
      stdout: (error.stdout || '').slice(0, MAX_OUTPUT_SIZE),
      stderr: (error.stderr || error.message || '').slice(0, MAX_OUTPUT_SIZE),
      exitCode: error.code || 1,
    };
  }
}

export async function listFiles(
  dirPath: string = ''
): Promise<{ name: string; path: string; isDirectory: boolean; size: number }[]> {
  await ensureWorkspace();
  const fullPath = path.join(WORKSPACE_DIR, dirPath);

  try {
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter((entry) => !entry.name.startsWith('.'))
        .map(async (entry) => {
          const entryPath = path.join(dirPath, entry.name);
          const fullEntryPath = path.join(WORKSPACE_DIR, entryPath);
          const stat = await fs.stat(fullEntryPath);
          return {
            name: entry.name,
            path: entryPath,
            isDirectory: entry.isDirectory(),
            size: stat.size,
          };
        })
    );
    return files.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  } catch {
    return [];
  }
}

export async function readFile(filePath: string): Promise<string> {
  const fullPath = path.join(WORKSPACE_DIR, filePath);
  try {
    const content = await fs.readFile(fullPath, 'utf-8');
    return content;
  } catch (error: any) {
    throw new Error(`Cannot read file: ${error.message}`);
  }
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  const fullPath = path.join(WORKSPACE_DIR, filePath);
  const dir = path.dirname(fullPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(fullPath, content, 'utf-8');
}

export async function deleteFile(filePath: string): Promise<void> {
  const fullPath = path.join(WORKSPACE_DIR, filePath);
  await fs.rm(fullPath, { recursive: true, force: true });
}

export async function fileExists(filePath: string): Promise<boolean> {
  const fullPath = path.join(WORKSPACE_DIR, filePath);
  try {
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}
