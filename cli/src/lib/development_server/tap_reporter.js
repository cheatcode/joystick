// tap_reporter.js
// NOTE: Run with: ava --tap | node tap_reporter.js

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const gray = (s) => `\x1b[90m${s}\x1b[0m`;

const parse_title = (line) => {
  const ok_match = line.match(/^ok\s+\d+\s+(.*)$/);
  if (ok_match)
    return { status: 'ok', title: ok_match[1].trim().replace(/^- /, '') };
  const not_ok_match = line.match(/^not ok\s+\d+\s+(.*)$/);
  if (not_ok_match)
    return {
      status: 'not_ok',
      title: not_ok_match[1].trim().replace(/^- /, ''),
    };
  return null;
};

const print_pass = (title) => {
  process.stdout.write(`${green('✔')} ${title}\n`);
};

const print_fail = (title, detail) => {
  process.stdout.write(`\n${red('-!-')}\n`);
  process.stdout.write(`\n${red('✖')} ${title}\n\n`);
  process.stdout.write(`${red('Error:')}\n\n`);
  if (detail && detail.trim()) {
    process.stdout.write(`  ${detail.trim()}\n\n`);
  } else {
    process.stdout.write(`  (no stack trace)\n\n`);
  }
  process.stdout.write(`${red('-!-')}\n\n`);
};

const get_indent = (s) => s.match(/^ */)?.[0].length ?? 0;

const read_block_after_key = (lines, key_idx, key_indent_len) => {
  const out = [];
  const base = key_indent_len + 2;
  for (let i = key_idx + 1; i < lines.length; i += 1) {
    const l = lines[i];
    if (l.trim() === '...') break;
    if (get_indent(l) < base) break;
    out.push(l.slice(base));
  }
  return out.join('\n');
};

const find_key = (lines, key, start = 0) => {
  for (let i = start; i < lines.length; i += 1) {
    const m = lines[i].match(/^(\s*)([A-Za-z0-9_-]+)\s*:\s*(\|>?-?)?\s*(.*)$/);
    if (!m) continue;
    const [, indent_s, k, blocky, rest] = m;
    if (k !== key) continue;
    const indent_len = indent_s.length;
    if (blocky) return { idx: i, type: 'block', indent_len };
    if (rest && rest.trim())
      return { idx: i, type: 'inline', value: rest.trim(), indent_len };
    return { idx: i, type: 'block', indent_len };
  }
  return null;
};

const extract_error_stack = (diag_lines) => {
  const lines = diag_lines.map((l) => l.replace(/\r$/, ''));

  const error_key = find_key(lines, 'error', 0);
  if (error_key) {
    const err_indent = error_key.indent_len + 2;
    for (let i = error_key.idx + 1; i < lines.length; i += 1) {
      const l = lines[i];
      if (l.trim() === '...') break;
      if (get_indent(l) < err_indent) break;

      const m = l.match(/^(\s*)(stack)\s*:\s*(\|>?-?)?\s*(.*)$/);
      if (m) {
        const [, key_indent_s, , blocky, rest] = m;
        const key_indent_len = key_indent_s.length;
        if (blocky) return read_block_after_key(lines, i, key_indent_len);
        if (rest && rest.trim()) return rest.trim();
        return read_block_after_key(lines, i, key_indent_len);
      }
    }
  }

  const top_stack = find_key(lines, 'stack', 0);
  if (top_stack) {
    if (top_stack.type === 'inline') return top_stack.value;
    return read_block_after_key(lines, top_stack.idx, top_stack.indent_len);
  }

  const frame_lines = [];
  let started = false;
  for (let i = 0; i < lines.length; i += 1) {
    const l = lines[i];
    if (/^\s*at\s+.+\:\d+\:\d+\)?$/.test(l)) {
      started = true;
      frame_lines.push(l.trim());
      continue;
    }
    if (started) {
      if (/^\s*at\s+/.test(l)) {
        frame_lines.push(l.trim());
      } else {
        break;
      }
    }
  }
  if (frame_lines.length) return frame_lines.join('\n');

  const msg_key = find_key(lines, 'message', 0);
  if (msg_key) {
    if (msg_key.type === 'inline') return msg_key.value;
    return read_block_after_key(lines, msg_key.idx, msg_key.indent_len);
  }

  return '';
};

const start_ns = process.hrtime.bigint();

const run_tap_reporter = async () => {
  let buffer = '';
  let passed = 0;
  let failed = 0;

  let pending_fail = null;
  let in_diag = false;
  let diag_lines = [];

  const handle_line = (raw_line) => {
    const line = raw_line.replace(/\r$/, '');
    if (!line) return;

    if (in_diag) {
      if (line.trim() === '...') {
        const stack = extract_error_stack(diag_lines);
        print_fail(pending_fail?.title || '(unknown)', stack);
        failed += 1;
        pending_fail = null;
        in_diag = false;
        diag_lines = [];
        return;
      }
      diag_lines.push(line);
      return;
    }

    if (/^\s*---\s*$/.test(line) && pending_fail) {
      in_diag = true;
      diag_lines = [];
      return;
    }

    const parsed = parse_title(line);
    if (parsed) {
      if (parsed.status === 'ok') {
        passed += 1;
        print_pass(parsed.title);
      } else if (parsed.status === 'not_ok') {
        pending_fail = { title: parsed.title };
      }
      return;
    }
  };

  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    buffer += chunk;
    const parts = buffer.split('\n');
    buffer = parts.pop() || '';
    for (const part of parts) handle_line(part);
  });

  process.stdin.on('end', () => {
    if (pending_fail) {
      const stack = extract_error_stack(diag_lines);
      print_fail(pending_fail.title, stack);
      failed += 1;
      pending_fail = null;
    }
    const end_ns = process.hrtime.bigint();
    const duration_ms = Number(end_ns - start_ns) / 1e6;
    const duration_str =
      duration_ms < 1000
        ? `${duration_ms.toFixed(0)} ms`
        : duration_ms < 60000
        ? `${(duration_ms / 1000).toFixed(2)} s`
        : `${Math.floor(duration_ms / 60000)}m ${(
            (duration_ms % 60000) /
            1000
          ).toFixed(2)}s`;

    process.stdout.write(
      `\n${gray('===')}\n\n${green('Passed:')} ${passed}\n${red(
        'Failed:'
      )} ${failed}\n${gray('Duration:')} ${duration_str}\n\n`
    );
  });
};

export default run_tap_reporter;

if (import.meta.url === `file://${process.argv[1]}`) {
  run_tap_reporter();
}
