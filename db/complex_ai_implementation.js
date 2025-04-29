import { encode, decode } from 'msgpackr';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { EventEmitter } from 'events';
import { Worker } from 'worker_threads';

const ISOLATION_LEVELS = {
  READ_UNCOMMITTED: 'READ_UNCOMMITTED',
  READ_COMMITTED: 'READ_COMMITTED',
  REPEATABLE_READ: 'REPEATABLE_READ',
  SERIALIZABLE: 'SERIALIZABLE'
};

const DURABILITY_MODES = {
  FULL: 'FULL',
  RELAXED: 'RELAXED'
};

const LOCK_MODES = {
  SHARED: 'SHARED',
  EXCLUSIVE: 'EXCLUSIVE'
};

class DeadlockError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DeadlockError';
  }
}

class LockManager {
  constructor() {
    this._locks = new Map();
    this._waiting = new Map();
    this._wait_for_graph = new Map();
  }

  async acquire(resource_id, transaction_id, mode = LOCK_MODES.EXCLUSIVE) {
    while (true) {
      const current_lock = this._locks.get(resource_id);
      
      if (!current_lock) {
        this._locks.set(resource_id, {
          holder: transaction_id,
          mode,
          holders: new Set([transaction_id]),
          timestamp: Date.now()
        });
        return true;
      }

      if (current_lock.holders.has(transaction_id)) {
        if (mode === LOCK_MODES.EXCLUSIVE && current_lock.mode !== LOCK_MODES.EXCLUSIVE) {
          current_lock.mode = LOCK_MODES.EXCLUSIVE;
        }
        return true;
      }

      if (mode === LOCK_MODES.SHARED && current_lock.mode === LOCK_MODES.SHARED) {
        current_lock.holders.add(transaction_id);
        return true;
      }

      this._update_wait_for_graph(transaction_id, Array.from(current_lock.holders));
      if (this._detect_deadlock(transaction_id)) {
        this._remove_from_wait_for_graph(transaction_id);
        throw new DeadlockError(`Deadlock detected for transaction ${transaction_id}`);
      }

      await new Promise(resolve => {
        if (!this._waiting.has(resource_id)) {
          this._waiting.set(resource_id, []);
        }
        this._waiting.get(resource_id).push({ 
          transaction_id, 
          mode,
          resolve 
        });
      });

      this._remove_from_wait_for_graph(transaction_id);
    }
  }

  release(resource_id, transaction_id) {
    const lock = this._locks.get(resource_id);
    if (!lock) return;

    lock.holders.delete(transaction_id);
    
    if (lock.holders.size === 0) {
      this._locks.delete(resource_id);
      this._wake_waiting_transactions(resource_id);
    } else if (lock.mode === LOCK_MODES.EXCLUSIVE) {
      lock.mode = LOCK_MODES.SHARED;
      this._wake_waiting_transactions(resource_id);
    }
  }

  _wake_waiting_transactions(resource_id) {
    const waiting = this._waiting.get(resource_id) || [];
    const compatible_waiters = waiting.filter(w => 
      w.mode === LOCK_MODES.SHARED || waiting.length === 1
    );

    if (compatible_waiters.length > 0) {
      this._waiting.set(
        resource_id, 
        waiting.filter(w => !compatible_waiters.includes(w))
      );

      for (const waiter of compatible_waiters) {
        waiter.resolve();
      }
    }
  }

  _update_wait_for_graph(transaction_id, blocking_transactions) {
    if (!this._wait_for_graph.has(transaction_id)) {
      this._wait_for_graph.set(transaction_id, new Set());
    }
    for (const blocking_id of blocking_transactions) {
      this._wait_for_graph.get(transaction_id).add(blocking_id);
    }
  }

  _remove_from_wait_for_graph(transaction_id) {
    this._wait_for_graph.delete(transaction_id);
    for (const waiters of this._wait_for_graph.values()) {
      waiters.delete(transaction_id);
    }
  }

  _detect_deadlock(start_transaction_id, visited = new Set()) {
    if (visited.has(start_transaction_id)) {
      return true;
    }

    visited.add(start_transaction_id);
    const waiting_for = this._wait_for_graph.get(start_transaction_id) || new Set();

    for (const blocking_id of waiting_for) {
      if (this._detect_deadlock(blocking_id, visited)) {
        return true;
      }
    }

    visited.delete(start_transaction_id);
    return false;
  }
}

class BufferManager {
  constructor(max_size_mb = 1024) {
    this._max_size = max_size_mb * 1024 * 1024;
    this._current_size = 0;
    this._buffers = new Map();
    this._lru = new Map();
    this._dirty = new Set();
  }

  async get_page(page_id) {
    const buffer = this._buffers.get(page_id);
    if (buffer) {
      this._update_lru(page_id);
      return buffer;
    }
    return null;
  }

  async put_page(page_id, data, is_dirty = true) {
    const size = data.length;
    
    while (this._current_size + size > this._max_size && this._buffers.size > 0) {
      await this._evict_page();
    }

    this._buffers.set(page_id, data);
    this._current_size += size;
    this._update_lru(page_id);
    
    if (is_dirty) {
      this._dirty.add(page_id);
    }
  }

  async flush_dirty_pages() {
    const dirty_pages = Array.from(this._dirty);
    this._dirty.clear();
    return dirty_pages.map(page_id => ({
      page_id,
      data: this._buffers.get(page_id)
    }));
  }

  _update_lru(page_id) {
    if (this._lru.has(page_id)) {
      this._lru.delete(page_id);
    }
    this._lru.set(page_id, Date.now());
  }

  async _evict_page() {
    const oldest_entry = Array.from(this._lru.entries())
      .sort(([, a], [, b]) => a - b)[0];
    
    if (!oldest_entry) return;
    
    const [page_id] = oldest_entry;
    const data = this._buffers.get(page_id);
    
    this._buffers.delete(page_id);
    this._lru.delete(page_id);
    this._current_size -= data.length;
    
    return {
      page_id,
      data,
      is_dirty: this._dirty.has(page_id)
    };
  }

  get_stats() {
    return {
      buffer_size: this._current_size,
      max_size: this._max_size,
      page_count: this._buffers.size,
      dirty_pages: this._dirty.size
    };
  }
}

class StorageManager {
  constructor(data_dir, buffer_manager) {
    this._data_dir = data_dir;
    this._buffer_manager = buffer_manager;
    this._active_files = new Map();
    this._file_locks = new Map();
  }

  async init() {
    await fs.mkdir(this._data_dir, { recursive: true });
  }

  async read_page(file_id, page_id) {
    const buffer_page = await this._buffer_manager.get_page(`${file_id}:${page_id}`);
    if (buffer_page) {
      return decode(buffer_page);
    }

    const file_path = this._get_file_path(file_id);
    const file_handle = await this._get_file_handle(file_id);
    
    const page_size = await this._get_page_size(file_handle, page_id);
    const buffer = Buffer.alloc(page_size);
    
    const { bytesRead } = await file_handle.read(
      buffer,
      0,
      page_size,
      this._get_page_offset(page_id)
    );

    if (bytesRead === 0) {
      return null;
    }

    const page_data = buffer.slice(0, bytesRead);
    await this._buffer_manager.put_page(`${file_id}:${page_id}`, page_data, false);
    
    return decode(page_data);
  }

  async write_page(file_id, page_id, data) {
    const encoded_data = encode(data);
    await this._buffer_manager.put_page(`${file_id}:${page_id}`, encoded_data, true);
    
    const file_handle = await this._get_file_handle(file_id);
    await file_handle.write(
      encoded_data,
      0,
      encoded_data.length,
      this._get_page_offset(page_id)
    );
  }

  async flush() {
    const dirty_pages = await this._buffer_manager.flush_dirty_pages();
    
    for (const { page_id, data } of dirty_pages) {
      const [file_id, page_num] = page_id.split(':');
      const file_handle = await this._get_file_handle(file_id);
      
      await file_handle.write(
        data,
        0,
        data.length,
        this._get_page_offset(Number(page_num))
      );
    }
  }

  async close() {
    await this.flush();
    for (const [, handle] of this._active_files) {
      await handle.close();
    }
    this._active_files.clear();
  }

  async _get_file_handle(file_id) {
    if (this._active_files.has(file_id)) {
      return this._active_files.get(file_id);
    }

    const file_path = this._get_file_path(file_id);
    const handle = await fs.open(file_path, 'a+');
    this._active_files.set(file_id, handle);
    return handle;
  }

  _get_file_path(file_id) {
    return path.join(this._data_dir, `${file_id}.db`);
  }

  _get_page_offset(page_id) {
    // NOTE: Include 8 bytes for page size header
    return page_id * 8;
  }

  async _get_page_size(file_handle, page_id) {
    const size_buffer = Buffer.alloc(8);
    const offset = this._get_page_offset(page_id);
    
    const { bytesRead } = await file_handle.read(
      size_buffer,
      0,
      8,
      offset
    );

    if (bytesRead === 0) {
      return 0;
    }

    return size_buffer.readBigUInt64LE();
  }
}

class Transaction {
  constructor(id, isolation_level, lock_manager) {
    this.id = id;
    this.isolation_level = isolation_level;
    this._lock_manager = lock_manager;
    this._changes = new Map();
    this._locks = new Set();
    this._start_time = Date.now();
    this._status = 'active';
  }

  async begin() {
    // NOTE: Additional initialization if needed
  }

  async commit() {
    if (this._status !== 'active') {
      throw new Error('Transaction is not active');
    }

    const changes = Array.from(this._changes.entries());
    this._status = 'committed';
    
    // Release all locks
    for (const resource_id of this._locks) {
      this._lock_manager.release(resource_id, this.id);
    }
    
    return changes;
  }

  async rollback() {
    if (this._status !== 'active') {
      throw new Error('Transaction is not active');
    }

    this._status = 'rolled_back';
    this._changes.clear();
    
    // Release all locks
    for (const resource_id of this._locks) {
      this._lock_manager.release(resource_id, this.id);
    }
  }

  async read(resource_id) {
    if (this._status !== 'active') {
      throw new Error('Transaction is not active');
    }

    // Handle different isolation levels
    const lock_mode = this.isolation_level === ISOLATION_LEVELS.READ_UNCOMMITTED 
      ? null 
      : LOCK_MODES.SHARED;

    if (lock_mode) {
      await this._lock_manager.acquire(resource_id, this.id, lock_mode);
      this._locks.add(resource_id);
    }

    return this._changes.get(resource_id);
  }

  async write(resource_id, data) {
    if (this._status !== 'active') {
      throw new Error('Transaction is not active');
    }

    await this._lock_manager.acquire(resource_id, this.id, LOCK_MODES.EXCLUSIVE);
    this._locks.add(resource_id);
    this._changes.set(resource_id, data);
  }

  get_status() {
    return {
      id: this.id,
      status: this._status,
      isolation_level: this.isolation_level,
      duration: Date.now() - this._start_time,
      changes_count: this._changes.size,
      locks_count: this._locks.size
    };
  }
}

class BTreeNode {
  constructor(is_leaf = true) {
    this.keys = [];
    this.children = [];
    this.is_leaf = is_leaf;
    this.next = null;
  }
}

class BTreeIndex {
  constructor(order = 100) {
    this.root = new BTreeNode();
    this.order = order;
  }

  async insert(key, value) {
    const result = await this._insert_recursive(this.root, key, value);
    
    if (result) {
      const new_root = new BTreeNode(false);
      new_root.keys = [result.key];
      new_root.children = [this.root, result.right];
      this.root = new_root;
    }
  }

  async search(key, range = false) {
    if (range) {
      return this._range_search(this.root, key);
    }
    return this._search_recursive(this.root, key);
  }

  async delete(key) {
    await this._delete_recursive(this.root, key);
    
    if (this.root.keys.length === 0 && !this.root.is_leaf) {
      this.root = this.root.children[0];
    }
  }

  async _insert_recursive(node, key, value) {
    let pos = this._find_position(node.keys, key);

    if (node.is_leaf) {
      node.keys.splice(pos, 0, { key, value });
      
      if (node.keys.length >= this.order) {
        return this._split_node(node);
      }
    } else {
      const result = await this._insert_recursive(node.children[pos], key, value);
      
      if (result) {
        node.keys.splice(pos, 0, result.key);
        node.children.splice(pos + 1, 0, result.right);
        
        if (node.keys.length >= this.order) {
          return this._split_node(node);
        }
      }
    }
    
    return null;
  }

  _split_node(node) {
    const mid = Math.floor(node.keys.length / 2);
    const right_node = new BTreeNode(node.is_leaf);
    
    right_node.keys = node.keys.splice(mid + (node.is_leaf ? 0 : 1));
    
    if (!node.is_leaf) {
      right_node.children = node.children.splice(mid + 1);
    }
    
    if (node.is_leaf) {
      right_node.next = node.next;
      node.next = right_node;
    }
    
    return {
      key: node.keys[mid],
      right: right_node
    };
  }

  async _search_recursive(node, key) {
    let pos = this._find_position(node.keys, key);
    
    if (pos < node.keys.length && node.keys[pos].key === key) {
      return node.keys[pos].value;
    }
    
    if (node.is_leaf) {
      return null;
    }
    
    return this._search_recursive(node.children[pos], key);
  }

  async _range_search(node, range) {
    const results = [];
    let current = node;
    
    // Find leftmost leaf node that could contain range start
    while (!current.is_leaf) {
      let pos = this._find_position(current.keys, range.start);
      current = current.children[pos];
    }
    
    // Collect all values within range
    while (current) {
      for (const entry of current.keys) {
        if (entry.key >= range.start && entry.key <= range.end) {
          results.push(entry.value);
        }
        if (entry.key > range.end) {
          return results;
        }
      }
      current = current.next;
    }
    
    return results;
  }

  _find_position(keys, key) {
    let left = 0;
    let right = keys.length;
    
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (keys[mid].key < key) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    
    return left;
  }

  async _delete_recursive(node, key) {
    let pos = this._find_position(node.keys, key);
    
    if (node.is_leaf) {
      if (pos < node.keys.length && node.keys[pos].key === key) {
        node.keys.splice(pos, 1);
        return true;
      }
      return false;
    }
    
    let deleted = false;
    if (pos < node.keys.length && node.keys[pos].key === key) {
      deleted = await this._delete_from_internal(node, pos);
    } else {
      deleted = await this._delete_recursive(node.children[pos], key);
    }
    
    if (deleted) {
      await this._rebalance(node, pos);
    }
    
    return deleted;
  }

  async _delete_from_internal(node, pos) {
    const predecessor = await this._get_predecessor(node.children[pos]);
    node.keys[pos] = predecessor;
    return this._delete_recursive(node.children[pos], predecessor.key);
  }

  async _get_predecessor(node) {
    while (!node.is_leaf) {
      node = node.children[node.children.length - 1];
    }
    return node.keys[node.keys.length - 1];
  }

  async _rebalance(node, child_index) {
    const child = node.children[child_index];
    
    if (child.keys.length >= Math.ceil(this.order / 2) - 1) {
      return;
    }
    
    // Try to borrow from left sibling
    if (child_index > 0) {
      const left_sibling = node.children[child_index - 1];
      if (left_sibling.keys.length > Math.ceil(this.order / 2) - 1) {
        await this._borrow_from_left(node, child_index, left_sibling, child);
        return;
      }
    }
    
    // Try to borrow from right sibling
    if (child_index < node.children.length - 1) {
      const right_sibling = node.children[child_index + 1];
      if (right_sibling.keys.length > Math.ceil(this.order / 2) - 1) {
        await this._borrow_from_right(node, child_index, child, right_sibling);
        return;
      }
    }
    
    // Merge with a sibling
    if (child_index > 0) {
      await this._merge_with_left(node, child_index);
    } else {
      await this._merge_with_right(node, child_index);
    }
  }

  async _borrow_from_left(parent, index, left, right) {
    right.keys.unshift(parent.keys[index - 1]);
    parent.keys[index - 1] = left.keys.pop();
    
    if (!left.is_leaf) {
      right.children.unshift(left.children.pop());
    }
  }

  async _borrow_from_right(parent, index, left, right) {
    left.keys.push(parent.keys[index]);
    parent.keys[index] = right.keys.shift();
    
    if (!left.is_leaf) {
      left.children.push(right.children.shift());
    }
  }

  async _merge_with_left(parent, index) {
    const left = parent.children[index - 1];
    const right = parent.children[index];
    
    left.keys.push(parent.keys[index - 1]);
    left.keys.push(...right.keys);
    
    if (!left.is_leaf) {
      left.children.push(...right.children);
    } else {
      left.next = right.next;
    }
    
    parent.keys.splice(index - 1, 1);
    parent.children.splice(index, 1);
  }

  async _merge_with_right(parent, index) {
    const left = parent.children[index];
    const right = parent.children[index + 1];
    
    left.keys.push(parent.keys[index]);
    left.keys.push(...right.keys);
    
    if (!left.is_leaf) {
      left.children.push(...right.children);
    } else {
      left.next = right.next;
    }
    
    parent.keys.splice(index, 1);
    parent.children.splice(index + 1, 1);
  }
}

class QueryParser {
  constructor() {
    this._operators = {
      '$eq': (a, b) => a === b,
      '$ne': (a, b) => a !== b,
      '$gt': (a, b) => a > b,
      '$gte': (a, b) => a >= b,
      '$lt': (a, b) => a < b,
      '$lte': (a, b) => a <= b,
      '$in': (a, b) => b.includes(a),
      '$nin': (a, b) => !b.includes(a),
      '$regex': (a, b) => new RegExp(b).test(a),
      '$exists': (a, b) => (a !== undefined) === b,
      '$type': (a, b) => typeof a === b,
      '$and': (a, b) => b.every(condition => this._evaluate(a, condition)),
      '$or': (a, b) => b.some(condition => this._evaluate(a, condition)),
      '$not': (a, b) => !this._evaluate(a, b)
    };
  }

  parse(query_string) {
    try {
      const query = JSON.parse(query_string);
      return this._parse_query(query);
    } catch (error) {
      throw new Error(`Invalid query syntax: ${error.message}`);
    }
  }

  _parse_query(query) {
    const parsed_query = {
      type: this._get_query_type(query),
      conditions: [],
      sort: null,
      limit: null,
      skip: null,
      projection: null
    };

    if (query.find) {
      parsed_query.conditions = this._parse_conditions(query.find);
    }

    if (query.sort) {
      parsed_query.sort = this._parse_sort(query.sort);
    }

    if (query.limit) {
      parsed_query.limit = parseInt(query.limit);
    }

    if (query.skip) {
      parsed_query.skip = parseInt(query.skip);
    }

    if (query.projection) {
      parsed_query.projection = this._parse_projection(query.projection);
    }

    return parsed_query;
  }

  _get_query_type(query) {
    if (query.find) return 'find';
    if (query.insert) return 'insert';
    if (query.update) return 'update';
    if (query.delete) return 'delete';
    throw new Error('Unknown query type');
  }

  _parse_conditions(conditions) {
    return Object.entries(conditions).map(([field, condition]) => {
      if (typeof condition === 'object' && !Array.isArray(condition)) {
        return Object.entries(condition).map(([operator, value]) => ({
          field,
          operator,
          value
        }));
      }
      return [{
        field,
        operator: '$eq',
        value: condition
      }];
    }).flat();
  }

  _parse_sort(sort) {
    return Object.entries(sort).map(([field, direction]) => ({
      field,
      direction: direction === 1 ? 'asc' : 'desc'
    }));
  }

  _parse_projection(projection) {
    return Object.entries(projection).reduce((acc, [field, include]) => {
      acc[field] = Boolean(include);
      return acc;
    }, {});
  }

  evaluate(document, conditions) {
    return conditions.every(condition => {
      const value = this._get_field_value(document, condition.field);
      return this._operators[condition.operator](value, condition.value);
    });
  }

  _get_field_value(document, field) {
    return field.split('.').reduce((obj, key) => obj?.[key], document);
  }
}

class QueryOptimizer {
  constructor(indexes) {
    this._indexes = indexes;
  }

  optimize(parsed_query) {
    const plan = {
      type: parsed_query.type,
      index: null,
      conditions: parsed_query.conditions,
      post_filter: [],
      sort: parsed_query.sort,
      limit: parsed_query.limit,
      skip: parsed_query.skip,
      projection: parsed_query.projection,
      estimated_cost: 0
    };

    if (parsed_query.conditions.length === 0) {
      plan.estimated_cost = Number.MAX_SAFE_INTEGER;
      return plan;
    }

    const index_candidates = this._find_index_candidates(parsed_query.conditions);
    if (index_candidates.length > 0) {
      const best_index = this._choose_best_index(index_candidates, parsed_query);
      plan.index = best_index.index;
      plan.conditions = best_index.usable_conditions;
      plan.post_filter = best_index.remaining_conditions;
      plan.estimated_cost = best_index.cost;
    }

    return this._optimize_sort(plan);
  }

  _find_index_candidates(conditions) {
    const candidates = [];

    for (const [index_name, index] of this._indexes.entries()) {
      const usable_conditions = conditions.filter(condition => 
        condition.field === index.field && 
        this._is_condition_indexable(condition)
      );

      if (usable_conditions.length > 0) {
        candidates.push({
          index_name,
          index,
          usable_conditions,
          remaining_conditions: conditions.filter(c => !usable_conditions.includes(c))
        });
      }
    }

    return candidates;
  }

  _is_condition_indexable(condition) {
    const indexable_operators = ['$eq', '$gt', '$gte', '$lt', '$lte', '$in'];
    return indexable_operators.includes(condition.operator);
  }

  _choose_best_index(candidates, query) {
    return candidates.map(candidate => ({
      ...candidate,
      cost: this._estimate_cost(candidate, query)
    })).reduce((best, current) => 
      current.cost < best.cost ? current : best
    );
  }

  _estimate_cost(candidate, query) {
    let cost = 10; // Base cost for index lookup

    // Adjust cost based on selectivity
    const selectivity = this._estimate_selectivity(candidate.usable_conditions);
    cost *= selectivity;

    // Add cost for remaining filters
    cost += candidate.remaining_conditions.length * 2;

    // Add cost for sorting if index doesn't match sort order
    if (query.sort && !this._can_use_index_for_sort(candidate.index, query.sort)) {
      cost += 100;
    }

    return cost;
  }

  _estimate_selectivity(conditions) {
    // Simple selectivity estimation
    return Math.pow(0.1, conditions.length);
  }

  _optimize_sort(plan) {
    if (!plan.sort || !plan.index) {
      return plan;
    }

    // Check if we can use the index for sorting
    if (this._can_use_index_for_sort(plan.index, plan.sort)) {
      plan.estimated_cost -= 50; // Reduce cost if index can be used for sorting
    } else {
      plan.estimated_cost += 100; // Add cost for in-memory sorting
    }

    return plan;
  }

  _can_use_index_for_sort(index, sort) {
    return sort.some(s => 
      s.field === index.field && 
      s.direction === index.direction
    );
  }

  get_execution_stats() {
    return {
      indexes_used: this._indexes.size,
      optimization_time: this._last_optimization_time,
      rejected_plans: this._rejected_plans
    };
  }
}

class QueryExecutor {
  constructor(storage_manager, buffer_manager) {
    this._storage_manager = storage_manager;
    this._buffer_manager = buffer_manager;
    this._stats = {
      queries_executed: 0,
      total_execution_time: 0,
      rows_processed: 0
    };
  }

  async execute(query_plan, transaction = null) {
    const start_time = Date.now();
    let results = [];

    try {
      switch (query_plan.type) {
        case 'find':
          results = await this._execute_find(query_plan, transaction);
          break;
        case 'insert':
          results = await this._execute_insert(query_plan, transaction);
          break;
        case 'update':
          results = await this._execute_update(query_plan, transaction);
          break;
        case 'delete':
          results = await this._execute_delete(query_plan, transaction);
          break;
        default:
          throw new Error(`Unsupported query type: ${query_plan.type}`);
      }

      this._update_stats(Date.now() - start_time, results.length);
      return results;

    } catch (error) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  async _execute_find(plan, transaction) {
    let results = [];

    if (plan.index) {
      results = await this._index_scan(plan, transaction);
    } else {
      results = await this._full_scan(plan, transaction);
    }

    results = this._apply_post_filters(results, plan.post_filter);
    results = this._apply_sort(results, plan.sort);
    results = this._apply_pagination(results, plan.skip, plan.limit);
    results = this._apply_projection(results, plan.projection);

    return results;
  }

  async _execute_insert(plan, transaction) {
    const documents = Array.isArray(plan.documents) ? plan.documents : [plan.documents];
    const results = [];

    for (const document of documents) {
      const id = document._id || crypto.randomUUID();
      const page_id = this._calculate_page_id(id);
      
      if (transaction) {
        await transaction.write(page_id, { ...document, _id: id });
      } else {
        await this._storage_manager.write_page(plan.collection, page_id, {
          ...document,
          _id: id
        });
      }
      
      results.push({ _id: id });
    }

    return results;
  }

  async _execute_update(plan, transaction) {
    const documents = await this._execute_find(plan, transaction);
    const results = [];

    for (const document of documents) {
      const updated_document = this._apply_update(document, plan.update);
      const page_id = this._calculate_page_id(document._id);

      if (transaction) {
        await transaction.write(page_id, updated_document);
      } else {
        await this._storage_manager.write_page(plan.collection, page_id, updated_document);
      }

      results.push({ _id: document._id });
    }

    return results;
  }

  async _execute_delete(plan, transaction) {
    const documents = await this._execute_find(plan, transaction);
    const results = [];

    for (const document of documents) {
      const page_id = this._calculate_page_id(document._id);

      if (transaction) {
        await transaction.write(page_id, null);
      } else {
        await this._storage_manager.write_page(plan.collection, page_id, null);
      }

      results.push({ _id: document._id });
    }

    return results;
  }

  async _index_scan(plan, transaction) {
    const results = [];
    const index = plan.index;
    
    for (const condition of plan.conditions) {
      const page_ids = await index.search(condition.value);
      
      for (const page_id of page_ids) {
        let document;
        
        if (transaction) {
          document = await transaction.read(page_id);
        } else {
          document = await this._storage_manager.read_page(plan.collection, page_id);
        }
        
        if (document) {
          results.push(document);
        }
      }
    }
    
    return results;
  }

  async _full_scan(plan, transaction) {
    const results = [];
    let page_id = 0;
    
    while (true) {
      let document;
      
      if (transaction) {
        document = await transaction.read(page_id);
      } else {
        document = await this._storage_manager.read_page(plan.collection, page_id);
      }
      
      if (!document) break;
      
      if (this._matches_conditions(document, plan.conditions)) {
        results.push(document);
      }
      
      page_id++;
    }
    
    return results;
  }

  _apply_post_filters(results, filters) {
    if (!filters || filters.length === 0) return results;
    return results.filter(doc => this._matches_conditions(doc, filters));
  }

  _apply_sort(results, sort) {
    if (!sort || sort.length === 0) return results;
    
    return results.sort((a, b) => {
      for (const { field, direction } of sort) {
        const value_a = this._get_field_value(a, field);
        const value_b = this._get_field_value(b, field);
        
        if (value_a !== value_b) {
          return direction === 'asc' ? 
            (value_a < value_b ? -1 : 1) : 
            (value_a < value_b ? 1 : -1);
        }
      }
      return 0;
    });
  }

  _apply_pagination(results, skip = 0, limit = null) {
    return results.slice(skip, limit ? skip + limit : undefined);
  }

  _apply_projection(results, projection) {
    if (!projection) return results;
    
    return results.map(doc => {
      const projected = {};
      for (const [field, include] of Object.entries(projection)) {
        if (include) {
          projected[field] = this._get_field_value(doc, field);
        }
      }
      return projected;
    });
  }

  _matches_conditions(document, conditions) {
    return conditions.every(condition => {
      const value = this._get_field_value(document, condition.field);
      return this._evaluate_condition(value, condition);
    });
  }

  _evaluate_condition(value, condition) {
    switch (condition.operator) {
      case '$eq': return value === condition.value;
      case '$ne': return value !== condition.value;
      case '$gt': return value > condition.value;
      case '$gte': return value >= condition.value;
      case '$lt': return value < condition.value;
      case '$lte': return value <= condition.value;
      case '$in': return condition.value.includes(value);
      case '$nin': return !condition.value.includes(value);
      case '$exists': return (value !== undefined) === condition.value;
      case '$regex': return new RegExp(condition.value).test(value);
      default: throw new Error(`Unknown operator: ${condition.operator}`);
    }
  }

  _get_field_value(document, field) {
    return field.split('.').reduce((obj, key) => obj?.[key], document);
  }

  _calculate_page_id(document_id) {
    return crypto.createHash('md5').update(document_id).digest('hex');
  }

  _update_stats(execution_time, rows_processed) {
    this._stats.queries_executed++;
    this._stats.total_execution_time += execution_time;
    this._stats.rows_processed += rows_processed;
  }

  get_stats() {
    return {
      ...this._stats,
      avg_execution_time: this._stats.total_execution_time / this._stats.queries_executed,
      avg_rows_per_query: this._stats.rows_processed / this._stats.queries_executed
    };
  }
}

class ConnectionPool {
  constructor(options = {}) {
    this._max_connections = options.max_connections || 10;
    this._min_connections = options.min_connections || 2;
    this._idle_timeout = options.idle_timeout || 30000;
    this._connection_timeout = options.connection_timeout || 5000;
    
    this._connections = new Map();
    this._available = [];
    this._waiting = [];
    
    this._maintenance_interval = setInterval(
      () => this._perform_maintenance(),
      10000
    );
  }

  async get_connection() {
    // Check for available connection
    if (this._available.length > 0) {
      const connection = this._available.pop();
      if (await this._validate_connection(connection)) {
        return connection;
      }
      this._remove_connection(connection);
    }

    // Create new connection if possible
    if (this._connections.size < this._max_connections) {
      return this._create_connection();
    }

    // Wait for available connection
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this._waiting = this._waiting.filter(w => w.resolve !== resolve);
        reject(new Error('Connection timeout'));
      }, this._connection_timeout);

      this._waiting.push({
        resolve: conn => {
          clearTimeout(timeout);
          resolve(conn);
        },
        timeout
      });
    });
  }

  async release_connection(connection) {
    if (!this._connections.has(connection.id)) {
      return;
    }

    // Handle waiting requests first
    if (this._waiting.length > 0 && await this._validate_connection(connection)) {
      const { resolve, timeout } = this._waiting.shift();
      clearTimeout(timeout);
      resolve(connection);
      return;
    }

    // Update last used timestamp
    this._connections.get(connection.id).last_used = Date.now();
    this._available.push(connection);
  }

  async shutdown() {
    clearInterval(this._maintenance_interval);
    
    // Clear waiting requests
    for (const { resolve, timeout } of this._waiting) {
      clearTimeout(timeout);
      resolve(null);
    }
    this._waiting = [];

    // Close all connections
    for (const connection of this._connections.values()) {
      await connection.close();
    }
    
    this._connections.clear();
    this._available = [];
  }

  async _create_connection() {
    const connection = new DatabaseConnection();
    await connection.init();
    
    this._connections.set(connection.id, {
      connection,
      created_at: Date.now(),
      last_used: Date.now()
    });

    return connection;
  }

  async _validate_connection(connection) {
    try {
      return await connection.check_health();
    } catch {
      return false;
    }
  }

  _remove_connection(connection) {
    this._connections.delete(connection.id);
    this._available = this._available.filter(c => c.id !== connection.id);
    connection.close().catch(() => {});
  }

  async _perform_maintenance() {
    const now = Date.now();

    // Remove idle connections
    for (const [id, { connection, last_used }] of this._connections.entries()) {
      if (this._connections.size <= this._min_connections) break;
      
      if (now - last_used > this._idle_timeout) {
        this._remove_connection(connection);
      }
    }

    // Create connections if below minimum
    while (this._connections.size < this._min_connections) {
      await this._create_connection();
    }
  }

  get_stats() {
    return {
      total_connections: this._connections.size,
      available_connections: this._available.length,
      waiting_requests: this._waiting.length,
      min_connections: this._min_connections,
      max_connections: this._max_connections
    };
  }
}

class Database {
  constructor(options = {}) {
    this._data_dir = options.data_dir || './data';
    this._max_connections = options.max_connections || 10;
    this._buffer_size = options.buffer_size || 1024; // MB
    this._durability_mode = options.durability_mode || DURABILITY_MODES.FULL;
    this._replication_factor = options.replication_factor || 1;

    // Core components
    this._buffer_manager = new BufferManager(this._buffer_size);
    this._storage_manager = new StorageManager(this._data_dir, this._buffer_manager);
    this._lock_manager = new LockManager();
    this._connection_pool = new ConnectionPool({
      max_connections: this._max_connections,
      min_connections: Math.ceil(this._max_connections / 4)
    });

    // Query processing
    this._query_parser = new QueryParser();
    this._indexes = new Map();
    this._query_optimizer = new QueryOptimizer(this._indexes);
    this._query_executor = new QueryExecutor(this._storage_manager, this._buffer_manager);

    // Transaction management
    this._active_transactions = new Map();
    this._transaction_counter = 0;

    // Monitoring and diagnostics
    this._metrics_registry = new MetricsRegistry();
    this._diagnostics = new DiagnosticsCollector(this);
    this._profiler = new PerformanceProfiler();

    // Background tasks
    this._checkpoint_interval = null;
    this._maintenance_interval = null;
    this._is_shutting_down = false;
  }

  async init() {
    try {
      await this._storage_manager.init();
      await this._setup_metrics();
      await this._start_background_tasks();
      return true;
    } catch (error) {
      throw new Error(`Database initialization failed: ${error.message}`);
    }
  }

  async query(query_string, params = {}) {
    const start_time = Date.now();
    const connection = await this._connection_pool.get_connection();

    try {
      const parsed_query = this._query_parser.parse(query_string);
      const query_plan = this._query_optimizer.optimize(parsed_query);
      
      this._profiler.start_operation('query_execution');
      const results = await this._query_executor.execute(query_plan, null);
      this._profiler.end_operation('query_execution');

      this._update_query_metrics(Date.now() - start_time, results.length);
      await this._connection_pool.release_connection(connection);

      return results;

    } catch (error) {
      await this._connection_pool.release_connection(connection);
      throw new Error(`Query failed: ${error.message}`);
    }
  }

  async begin_transaction(options = {}) {
    const isolation_level = options.isolation_level || ISOLATION_LEVELS.REPEATABLE_READ;
    const transaction_id = `txn_${++this._transaction_counter}`;
    
    const transaction = new Transaction(
      transaction_id,
      isolation_level,
      this._lock_manager
    );

    this._active_transactions.set(transaction_id, transaction);
    await transaction.begin();

    this._metrics_registry.get('active_transactions').increment();
    return transaction;
  }

  async create_index(collection, field, options = {}) {
    const index_name = `${collection}_${field}_idx`;
    
    if (this._indexes.has(index_name)) {
      throw new Error(`Index already exists: ${index_name}`);
    }

    const index = new BTreeIndex(options.order);
    this._indexes.set(index_name, {
      field,
      collection,
      index,
      options
    });

    // Build index for existing documents
    const query_plan = {
      type: 'find',
      collection,
      conditions: []
    };

    const documents = await this._query_executor.execute(query_plan);
    for (const document of documents) {
      await index.insert(document[field], document._id);
    }

    this._metrics_registry.get('index_count').increment();
    return index_name;
  }

  async shutdown() {
    this._is_shutting_down = true;

    // Stop background tasks
    clearInterval(this._checkpoint_interval);
    clearInterval(this._maintenance_interval);

    // Wait for active transactions to complete
    while (this._active_transactions.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Flush all data and close connections
    await this._storage_manager.flush();
    await this._connection_pool.shutdown();

    this._is_shutting_down = false;
  }

  async _setup_metrics() {
    // Query metrics
    this._metrics_registry.register('queries_per_second', 'meter');
    this._metrics_registry.register('query_duration', 'histogram');
    this._metrics_registry.register('rows_processed', 'counter');

    // Transaction metrics
    this._metrics_registry.register('active_transactions', 'gauge');
    this._metrics_registry.register('transaction_duration', 'histogram');

    // Storage metrics
    this._metrics_registry.register('document_count', 'counter');
    this._metrics_registry.register('index_count', 'gauge');
    this._metrics_registry.register('storage_size', 'gauge');

    // Connection metrics
    this._metrics_registry.register('active_connections', 'gauge');
    this._metrics_registry.register('connection_wait_time', 'histogram');

    // Cache metrics
    this._metrics_registry.register('buffer_hit_ratio', 'gauge');
    this._metrics_registry.register('cache_size', 'gauge');
  }

  async _start_background_tasks() {
    // Periodic checkpoints
    this._checkpoint_interval = setInterval(
      () => this._create_checkpoint(),
      300000 // 5 minutes
    );

    // Maintenance tasks
    this._maintenance_interval = setInterval(
      () => this._perform_maintenance(),
      60000 // 1 minute
    );
  }

  async _create_checkpoint() {
    if (this._is_shutting_down) return;

    try {
      this._profiler.start_operation('checkpoint');
      await this._storage_manager.flush();
      this._profiler.end_operation('checkpoint');
    } catch (error) {
      console.error('Checkpoint failed:', error);
    }
  }

  async _perform_maintenance() {
    if (this._is_shutting_down) return;

    try {
      this._profiler.start_operation('maintenance');
      
      // Update storage statistics
      const stats = await this._storage_manager.get_stats();
      this._metrics_registry.get('storage_size').set(stats.total_size);
      this._metrics_registry.get('document_count').set(stats.document_count);

      // Clean up expired transactions
      for (const [id, transaction] of this._active_transactions.entries()) {
        if (Date.now() - transaction._start_time > 300000) { // 5 minutes timeout
          await transaction.rollback();
          this._active_transactions.delete(id);
          this._metrics_registry.get('active_transactions').decrement();
        }
      }

      this._profiler.end_operation('maintenance');
    } catch (error) {
      console.error('Maintenance failed:', error);
    }
  }

  _update_query_metrics(duration, rows_processed) {
    this._metrics_registry.get('queries_per_second').mark();
    this._metrics_registry.get('query_duration').observe(duration);
    this._metrics_registry.get('rows_processed').increment(rows_processed);
  }

  get_metrics() {
    return this._metrics_registry.get_metrics();
  }

  get_diagnostics() {
    return this._diagnostics.collect();
  }

  get_profiler_data() {
    return this._profiler.get_data();
  }
}

// Export the database class
export default Database;

