(function () {
  "use strict";

  var trainerId = "aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa";
  var memberId = "bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb";
  var gymId = "cccccccc-3333-4333-8333-cccccccccccc";
  var backend = {
    session: null,
    profiles: {},
    gyms: [],
    memberships: [],
    programs: [],
    assignments: [],
    workouts: [],
    snapshots: [],
    devices: [],
    messages: [],
    snapshotCalls: 0,
    realtimeAddErrors: 0,
    channels: {},
    passwordUpdates: 0,
    authListener: null
  };

  backend.profiles[memberId] = {
    id: memberId,
    display_name: "Bulut Üye",
    role_preference: "member",
    onboarding_complete: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  function result(data, error) { return { data: data == null ? null : data, error: error || null }; }
  function currentUser() { return backend.session && backend.session.user; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function applyFilters(rows, filters) {
    return rows.filter(function (row) {
      return filters.every(function (filter) {
        if (filter.type === "eq") return row[filter.column] === filter.value;
        if (filter.type === "in") return filter.values.indexOf(row[filter.column]) !== -1;
        if (filter.type === "is") return filter.value === null ? row[filter.column] == null : row[filter.column] === filter.value;
        return true;
      });
    });
  }

  function tableRows(table) {
    if (table === "profiles") return Object.keys(backend.profiles).map(function (id) { return backend.profiles[id]; });
    if (table === "gyms") return backend.gyms;
    if (table === "gym_memberships") return backend.memberships;
    if (table === "programs") return backend.programs;
    if (table === "program_assignments") return backend.assignments;
    if (table === "workout_sessions") return backend.workouts;
    if (table === "member_snapshots") return backend.snapshots;
    if (table === "user_devices") return backend.devices;
    if (table === "chat_messages") return backend.messages;
    return [];
  }

  function Query(table) {
    this.table = table;
    this.filters = [];
    this.operation = "select";
    this.value = null;
    this.singleMode = "";
  }
  Query.prototype.select = function () { return this; };
  Query.prototype.eq = function (column, value) { this.filters.push({ type: "eq", column: column, value: value }); return this; };
  Query.prototype.in = function (column, values) { this.filters.push({ type: "in", column: column, values: values }); return this; };
  Query.prototype.is = function (column, value) { this.filters.push({ type: "is", column: column, value: value }); return this; };
  Query.prototype.order = function () { return this; };
  Query.prototype.limit = function () { return this; };
  Query.prototype.single = function () { this.singleMode = "single"; return this; };
  Query.prototype.maybeSingle = function () { this.singleMode = "maybe"; return this; };
  Query.prototype.upsert = function (value) { this.operation = "upsert"; this.value = clone(value); return this; };
  Query.prototype.insert = function (value) { this.operation = "insert"; this.value = clone(value); return this; };
  Query.prototype.update = function (value) { this.operation = "update"; this.value = clone(value); return this; };
  Query.prototype.execute = function () {
    if (this.operation === "insert" && this.table === "chat_messages") {
      var message = Object.assign({}, this.value, { id: crypto.randomUUID(), created_at: new Date().toISOString(), read_at: null });
      var duplicate = backend.messages.find(function (item) { return item.sender_id === message.sender_id && item.client_mutation_id === message.client_mutation_id; });
      if (duplicate) return result(null, { code: "23505", message: "duplicate" });
      backend.messages.push(message); return result(clone(message));
    }
    if (this.operation === "update" && this.table === "chat_messages") {
      var targets = applyFilters(backend.messages, this.filters); targets.forEach(function (item) { Object.assign(item, clone(this.value)); }, this);
      return result(clone(targets));
    }
    if (this.operation === "upsert") {
      var row = this.value;
      if (this.table === "user_devices") {
        var deviceIndex = backend.devices.findIndex(function (item) { return item.id === row.id; });
        if (deviceIndex >= 0 && backend.devices[deviceIndex].user_id !== row.user_id) return result(null, new Error("ROW_LEVEL_SECURITY"));
        if (deviceIndex >= 0) backend.devices[deviceIndex] = row; else backend.devices.push(row);
        return result(clone(row));
      }
      if (this.table === "workout_sessions") {
        var workoutIndex = backend.workouts.findIndex(function (item) { return item.member_id === row.member_id && item.client_mutation_id === row.client_mutation_id; });
        row.id = workoutIndex >= 0 ? backend.workouts[workoutIndex].id : crypto.randomUUID();
        row.updated_at = new Date().toISOString();
        if (workoutIndex >= 0) backend.workouts[workoutIndex] = row; else backend.workouts.push(row);
        return result(clone(row));
      }
      if (this.table === "programs") {
        var programIndex = backend.programs.findIndex(function (item) { return item.gym_id === row.gym_id && item.client_key === row.client_key; });
        if (!row.id) row.id = crypto.randomUUID();
        if (!row.root_id) row.root_id = crypto.randomUUID();
        row.updated_at = new Date().toISOString();
        if (programIndex >= 0) backend.programs[programIndex] = row; else backend.programs.push(row);
        return result(clone(row));
      }
      return result(clone(row));
    }
    var rows = applyFilters(tableRows(this.table), this.filters).map(clone);
    if (this.singleMode === "single") return rows.length ? result(rows[0]) : result(null, new Error("ROW_NOT_FOUND"));
    if (this.singleMode === "maybe") return result(rows[0] || null);
    return result(rows);
  };
  Query.prototype.then = function (resolve, reject) { return Promise.resolve(this.execute()).then(resolve, reject); };

  function makeSession(id, email) {
    return { access_token: "mock-access-token-" + id, refresh_token: "mock-refresh", expires_in: 3600, token_type: "bearer", user: { id: id, email: email } };
  }

  var client = {
    auth: {
      getSession: async function () { return result({ session: backend.session }); },
      onAuthStateChange: function (callback) { backend.authListener = callback; return { data: { subscription: { unsubscribe: function () {} } } }; },
      signUp: async function (options) {
        backend.session = makeSession(trainerId, options.email);
        backend.profiles[trainerId] = {
          id: trainerId,
          display_name: options.options.data.display_name,
          role_preference: options.options.data.role,
          onboarding_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return result({ user: backend.session.user, session: clone(backend.session) });
      },
      signInWithPassword: async function (options) {
        var id = options.email.indexOf("member") !== -1 ? memberId : trainerId;
        backend.session = makeSession(id, options.email);
        return result({ user: backend.session.user, session: clone(backend.session) });
      },
      setSession: async function (tokens) {
        var id = String(tokens.access_token || "").indexOf("member") !== -1 ? memberId : trainerId;
        var email = id === memberId ? "member@fittrack.test" : "trainer@fittrack.test";
        backend.session = makeSession(id, email);
        return result({ user: backend.session.user, session: clone(backend.session) });
      },
      exchangeCodeForSession: async function (code) {
        var id = String(code || "").indexOf("member") !== -1 ? memberId : trainerId;
        var email = id === memberId ? "member@fittrack.test" : "trainer@fittrack.test";
        backend.session = makeSession(id, email);
        return result({ user: backend.session.user, session: clone(backend.session) });
      },
      updateUser: async function () {
        backend.passwordUpdates += 1;
        return result({ user: clone(currentUser()) });
      },
      signOut: async function () { backend.session = null; return result({}); },
      resetPasswordForEmail: async function () { return result({}); }
    },
    from: function (table) { return new Query(table); },
    rpc: async function (name, args) {
      var user = currentUser();
      if (!user) return result(null, new Error("AUTH_REQUIRED"));
      if (name === "set_profile") {
        backend.profiles[user.id] = Object.assign({}, backend.profiles[user.id], {
          id: user.id,
          display_name: args.p_display_name,
          role_preference: args.p_role_preference,
          onboarding_complete: true,
          updated_at: new Date().toISOString()
        });
        return result(clone(backend.profiles[user.id]));
      }
      if (name === "create_gym") {
        var created = { id: gymId, name: args.p_name, created_by: user.id, created_at: new Date().toISOString() };
        backend.gyms = [created];
        backend.memberships.push({ gym_id: gymId, user_id: user.id, role: "admin", trainer_id: null, active: true, joined_at: new Date().toISOString() });
        return result([{ gym_id: gymId, gym_name: created.name, invite_code: "FT-MOCK0001", membership_role: "admin" }]);
      }
      if (name === "join_gym_by_invite") {
        if (args.p_code !== "FT-MOCK0001") return result(null, new Error("INVITE_NOT_AVAILABLE"));
        if (!backend.memberships.some(function (item) { return item.gym_id === gymId && item.user_id === user.id; })) {
          backend.memberships.push({ gym_id: gymId, user_id: user.id, role: "member", trainer_id: trainerId, active: true, joined_at: new Date().toISOString() });
        }
        return result([{ gym_id: gymId, gym_name: backend.gyms[0].name, membership_role: "member", trainer_id: trainerId }]);
      }
      if (name === "apply_member_snapshot") {
        backend.snapshotCalls += 1;
        var existing = backend.snapshots.find(function (item) { return item.gym_id === args.p_gym_id && item.user_id === user.id; });
        if (existing && existing.state_version !== Number(args.p_base_version || 0)) {
          return result([{ applied: false, conflict: true, snapshot_version: existing.state_version, server_state: clone(existing.state), server_updated_at: existing.updated_at }]);
        }
        var next = existing ? existing.state_version + 1 : 1;
        var row = { gym_id: args.p_gym_id, user_id: user.id, state: clone(args.p_state), state_version: next, device_id: args.p_device_id, updated_at: new Date().toISOString() };
        if (existing) backend.snapshots[backend.snapshots.indexOf(existing)] = row; else backend.snapshots.push(row);
        return result([{ applied: true, conflict: false, snapshot_version: next, server_state: clone(row.state), server_updated_at: row.updated_at }]);
      }
      if (name === "create_gym_invite") return result([{ invite_id: crypto.randomUUID(), invite_code: "FT-MOCK0002", expires_at: new Date(Date.now() + 86400000).toISOString(), max_uses: 10 }]);
      if (name === "request_account_deletion") return result(crypto.randomUUID());
      if (name === "assign_program_to_member") {
        var assignment = backend.assignments.find(function (item) { return item.gym_id === gymId && item.member_id === args.p_member_id && item.program_id === args.p_program_id && item.active; });
        if (!assignment) { assignment = { id: crypto.randomUUID(), gym_id: gymId, member_id: args.p_member_id, program_id: args.p_program_id, trainer_id: user.id, coach_note: args.p_coach_note, active: true, assigned_at: new Date().toISOString() }; backend.assignments.push(assignment); }
        return result(clone(assignment));
      }
      if (name === "archive_program_assignment") { var archived = backend.assignments.find(function (item) { return item.id === args.p_assignment_id && item.member_id === args.p_member_id; }); if (!archived) return result(null, new Error("ACTIVE_ASSIGNMENT_NOT_FOUND")); archived.active = false; return result(clone(archived)); }
      if (name === "update_member_coach_note") return result({ id: crypto.randomUUID(), gym_id: gymId, member_id: args.p_member_id, coach_note: args.p_coach_note, active: true });
      return result(null, new Error("MOCK_RPC_NOT_IMPLEMENTED:" + name));
    },
    channel: function (topic) {
      if (backend.channels[topic]) return backend.channels[topic];
      var channel = { topic: topic, subscribed: false, on: function () { if (this.subscribed) { backend.realtimeAddErrors += 1; throw new Error("cannot add postgres_changes callbacks after subscribe()"); } return this; }, subscribe: function (callback) { this.subscribed = true; if (callback) callback("SUBSCRIBED"); return this; } };
      backend.channels[topic] = channel;
      return channel;
    },
    removeChannel: function (channel) { if (channel && channel.topic) delete backend.channels[channel.topic]; }
  };

  window.__fittrackMock = backend;
  window.supabase = { createClient: function () { return client; } };
})();
