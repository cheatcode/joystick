import os from 'os';
import { execSync } from 'child_process';

const get_memory_usage = () => {
  const total_mem = os.totalmem();
  const free_mem = os.freemem();
  const used_mem = total_mem - free_mem;
  return (used_mem / total_mem * 100).toFixed(2);
};

const get_cpu_usage = () => {
  const cpus = os.cpus();
  const avg_idle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0) / cpus.length;
  const avg_total = cpus.reduce((acc, cpu) => acc + Object.values(cpu.times).reduce((sum, time) => sum + time, 0), 0) / cpus.length;
  return ((1 - avg_idle / avg_total) * 100).toFixed(2);
};

const get_disk_usage = () => {
  const df = execSync('df -h /').toString();
  const usage = df.split('\n')[1].split(/\s+/)[4];
  return usage;
};

const snapshot_metrics = () => ({
  memory: `${get_memory_usage()}%`,
  cpu: `${get_cpu_usage()}%`,
  disk: get_disk_usage()
});

export default snapshot_metrics;