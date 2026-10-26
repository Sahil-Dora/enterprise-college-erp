import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { eq, inArray } from "drizzle-orm";
import {
  authSessionsTable,
  assignmentsTable,
  coursesTable,
  db,
  departmentsTable,
  facultyTable,
  feeRecordsTable,
  permissionsTable,
  rolePermissionsTable,
  rolesTable,
  semestersTable,
  studentsTable,
  usersTable,
  pool,
} from "@workspace/db";
import {
  configureTestEnvironment,
  jsonBody,
  startRouterServer,
} from "./helpers.ts";

configureTestEnvironment();

const { hashPassword } = await import("../src/lib/password.ts");
const { verifyToken } = await import("../src/lib/jwt.ts");
const { default: router } = await import("../src/routes/index.ts");

const adminPassword = "AdminPassword123";
const studentPassword = "StudentPassword123";
const lifecyclePassword = "LifecyclePassword123";
const passwordChangePassword = "PasswordChange123";

let server: Awaited<ReturnType<typeof startRouterServer>> | undefined;
let adminUserId: number;
let lifecycleUserId: number;
let inactiveUserId: number;
let passwordChangeUserId: number;
let aliceUserId: number;
let bobUserId: number;
let aliceStudentId: number;
let bobStudentId: number;
let departmentId: number;
let semesterId: number;

type LoginResult = {
  token: string;
  user: Record<string, unknown>;
};

async function loginRequest(email: string, password: string): Promise<Response> {
  return server!.request("/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

async function login(email: string, password: string): Promise<LoginResult> {
  const response = await loginRequest(email, password);
  assert.equal(response.status, 200);
  const body = await jsonBody(response);
  assert.equal(typeof body.token, "string");
  assert.equal(typeof body.user, "object");
  return { token: body.token as string, user: body.user as Record<string, unknown> };
}

function auth(token: string): Record<string, string> {
  return { authorization: `Bearer ${token}` };
}

async function seedDatabase(): Promise<void> {
  const [department] = await db.insert(departmentsTable).values({
    name: "Computer Science",
    code: "CSE-TEST",
    description: "Deterministic isolated test department",
  }).returning({ id: departmentsTable.id });
  const [semester] = await db.insert(semestersTable).values({
    name: "Spring 2026",
    startDate: "2026-01-01",
    endDate: "2026-05-31",
    isActive: true,
  }).returning({ id: semestersTable.id });
  departmentId = department.id;
  semesterId = semester.id;

  const [adminRole] = await db.insert(rolesTable).values({
    name: "admin",
    displayName: "Administrator",
    description: "Test administrator role",
  }).returning({ id: rolesTable.id });
  const [studentRole] = await db.insert(rolesTable).values({
    name: "student",
    displayName: "Student",
    description: "Test student role",
  }).returning({ id: rolesTable.id });
  const [studentsView] = await db.insert(permissionsTable).values({
    key: "students.view",
    displayName: "View students",
    module: "students",
    action: "view",
  }).returning({ id: permissionsTable.id });
  const [studentsManage] = await db.insert(permissionsTable).values({
    key: "students.manage",
    displayName: "Manage students",
    module: "students",
    action: "manage",
  }).returning({ id: permissionsTable.id });
  const [facultyView] = await db.insert(permissionsTable).values({
    key: "faculty.view",
    displayName: "View faculty",
    module: "faculty",
    action: "view",
  }).returning({ id: permissionsTable.id });
  const [facultyManage] = await db.insert(permissionsTable).values({
    key: "faculty.manage",
    displayName: "Manage faculty",
    module: "faculty",
    action: "manage",
  }).returning({ id: permissionsTable.id });

  await db.insert(rolePermissionsTable).values([
    { roleId: adminRole.id, permissionId: studentsView.id },
    { roleId: adminRole.id, permissionId: studentsManage.id },
    { roleId: adminRole.id, permissionId: facultyView.id },
    { roleId: adminRole.id, permissionId: facultyManage.id },
    { roleId: studentRole.id, permissionId: studentsView.id },
  ]);

  const passwordHash = await hashPassword(adminPassword);
  const studentPasswordHash = await hashPassword(studentPassword);
  const [admin] = await db.insert(usersTable).values({
    name: "Test Administrator",
    email: "admin.task3b@example.test",
    passwordHash,
    role: "admin",
  }).returning({ id: usersTable.id });
  const [lifecycle] = await db.insert(usersTable).values({
    name: "Lifecycle Test User",
    email: "lifecycle.task4a@example.test",
    passwordHash: await hashPassword(lifecyclePassword),
    role: "admin",
  }).returning({ id: usersTable.id });
  const [inactive] = await db.insert(usersTable).values({
    name: "Inactive Test User",
    email: "inactive.task4a@example.test",
    passwordHash: await hashPassword(lifecyclePassword),
    role: "admin",
    isActive: false,
  }).returning({ id: usersTable.id });
  const [passwordChange] = await db.insert(usersTable).values({
    name: "Password Change User",
    email: "password-change.task4a@example.test",
    passwordHash: await hashPassword(passwordChangePassword),
    role: "admin",
  }).returning({ id: usersTable.id });
  const [alice] = await db.insert(usersTable).values({
    name: "Alice Test",
    email: "alice.task3b@example.test",
    passwordHash: studentPasswordHash,
    role: "student",
  }).returning({ id: usersTable.id });
  const [bob] = await db.insert(usersTable).values({
    name: "Bob Test",
    email: "bob.task3b@example.test",
    passwordHash: studentPasswordHash,
    role: "student",
  }).returning({ id: usersTable.id });
  adminUserId = admin.id;
  lifecycleUserId = lifecycle.id;
  inactiveUserId = inactive.id;
  passwordChangeUserId = passwordChange.id;
  aliceUserId = alice.id;
  bobUserId = bob.id;

  const [aliceStudent] = await db.insert(studentsTable).values({
    userId: aliceUserId,
    rollNumber: "T3B-ALICE",
    departmentId,
    semesterId,
    admissionDate: "2026-01-15",
    dateOfBirth: "2005-01-01",
    address: "Alice Test Address",
  }).returning({ id: studentsTable.id });
  const [bobStudent] = await db.insert(studentsTable).values({
    userId: bobUserId,
    rollNumber: "T3B-BOB",
    departmentId,
    semesterId,
    admissionDate: "2026-01-16",
    dateOfBirth: "2005-02-02",
    address: "Bob Test Address",
  }).returning({ id: studentsTable.id });
  aliceStudentId = aliceStudent.id;
  bobStudentId = bobStudent.id;
}

before(async () => {
  await seedDatabase();
  server = await startRouterServer(router);
});

after(async () => {
  await server?.close();
  await pool.end();
});

test("valid login creates a database-backed session", async () => {
  const result = await login("admin.task3b@example.test", adminPassword);

  assert.equal(result.user.email, "admin.task3b@example.test");
  assert.equal(result.user.role, "admin");
  assert.deepEqual(
    [...(result.user.permissions as string[])].sort(),
    ["faculty.manage", "faculty.view", "students.manage", "students.view"],
  );

  const sessions = await db
    .select({
      userId: authSessionsTable.userId,
      tokenId: authSessionsTable.tokenId,
      revokedAt: authSessionsTable.revokedAt,
    })
    .from(authSessionsTable)
    .where(eq(authSessionsTable.userId, adminUserId));
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].userId, adminUserId);
  assert.equal(sessions[0].tokenId.length > 0, true);
  assert.equal(sessions[0].revokedAt, null);
});

test("authenticated users can access protected routes", async () => {
  const { token } = await login("admin.task3b@example.test", adminPassword);

  const meResponse = await server!.request("/auth/me", { headers: auth(token) });
  assert.equal(meResponse.status, 200);
  assert.equal((await jsonBody(meResponse)).email, "admin.task3b@example.test");

  const studentsResponse = await server!.request("/students", { headers: auth(token) });
  assert.equal(studentsResponse.status, 200);
  const studentsBody = await jsonBody(studentsResponse);
  assert.equal(studentsBody.total, 2);
});

test("logout revokes the database session", async () => {
  const { token } = await login("admin.task3b@example.test", adminPassword);

  const logoutResponse = await server!.request("/auth/logout", {
    method: "POST",
    headers: auth(token),
  });
  assert.equal(logoutResponse.status, 200);

  const meResponse = await server!.request("/auth/me", { headers: auth(token) });
  assert.equal(meResponse.status, 401);
  assert.deepEqual(await jsonBody(meResponse), { error: "Session expired or revoked" });

  const tokenId = verifyToken(token).jti;
  const [session] = await db
    .select({ revokedAt: authSessionsTable.revokedAt })
    .from(authSessionsTable)
    .where(eq(authSessionsTable.tokenId, tokenId));
  assert.notEqual(session?.revokedAt, null);
});

test("RBAC permits student reads and denies student writes", async () => {
  const { token, user } = await login("alice.task3b@example.test", studentPassword);
  assert.deepEqual(user.permissions, ["students.view"]);

  const readResponse = await server!.request("/students", { headers: auth(token) });
  assert.equal(readResponse.status, 200);

  const writeResponse = await server!.request("/students", {
    method: "POST",
    headers: { ...auth(token), "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(writeResponse.status, 403);
  assert.deepEqual(await jsonBody(writeResponse), {
    error: "Access denied",
    permission: "students.manage",
  });
});

test("students can only read their own student record", async () => {
  const { token } = await login("alice.task3b@example.test", studentPassword);

  const ownResponse = await server!.request(`/students/${aliceStudentId}`, {
    headers: auth(token),
  });
  assert.equal(ownResponse.status, 200);
  assert.equal((await jsonBody(ownResponse)).id, aliceStudentId);

  const otherResponse = await server!.request(`/students/${bobStudentId}`, {
    headers: auth(token),
  });
  assert.equal(otherResponse.status, 404);
  assert.deepEqual(await jsonBody(otherResponse), { error: "Student not found" });
});

test("authorized Student CRUD persists through the database", async () => {
  const { token } = await login("admin.task3b@example.test", adminPassword);
  const createResponse = await server!.request("/students", {
    method: "POST",
    headers: { ...auth(token), "content-type": "application/json" },
    body: JSON.stringify({
      name: "Created Test Student",
      email: "created.task3b@example.test",
      password: "CreatedPassword123",
      rollNumber: "T3B-CREATED",
      departmentId,
      semesterId,
      admissionDate: "2026-02-01",
      address: "Initial Address",
    }),
  });
  assert.equal(createResponse.status, 201);
  const created = await jsonBody(createResponse);
  const createdId = created.id as number;
  const createdUserId = created.userId as number;
  assert.equal(created.rollNumber, "T3B-CREATED");
  assert.equal(created.registrationNumber, `REG-2026-${String(createdId).padStart(5, "0")}`);
  assert.equal(created.studentId, `STU-${String(createdId).padStart(6, "0")}`);
  assert.equal(created.status, "active");

  const persisted = await db
    .select({ id: studentsTable.id, userId: studentsTable.userId })
    .from(studentsTable)
    .where(eq(studentsTable.id, createdId));
  assert.deepEqual(persisted, [{ id: createdId, userId: createdUserId }]);

  const patchResponse = await server!.request(`/students/${createdId}`, {
    method: "PATCH",
    headers: { ...auth(token), "content-type": "application/json" },
    body: JSON.stringify({ name: "Updated Test Student", address: "Updated Address" }),
  });
  assert.equal(patchResponse.status, 200);
  const updated = await jsonBody(patchResponse);
  assert.equal(updated.name, "Updated Test Student");
  assert.equal(updated.address, "Updated Address");

  const updatedUser = await db
    .select({ name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, createdUserId));
  const updatedStudent = await db
    .select({ address: studentsTable.address })
    .from(studentsTable)
    .where(eq(studentsTable.id, createdId));
  assert.deepEqual(updatedUser, [{ name: "Updated Test Student" }]);
  assert.deepEqual(updatedStudent, [{ address: "Updated Address" }]);

  const duplicateEmailResponse = await server!.request(`/students/${createdId}`, {
    method: "PATCH",
    headers: { ...auth(token), "content-type": "application/json" },
    body: JSON.stringify({ email: "alice.task3b@example.test" }),
  });
  assert.equal(duplicateEmailResponse.status, 409);

  const inactiveResponse = await server!.request(`/students/${createdId}`, {
    method: "PATCH",
    headers: { ...auth(token), "content-type": "application/json" },
    body: JSON.stringify({ isActive: false, phone: null }),
  });
  assert.equal(inactiveResponse.status, 200);
  assert.equal((await jsonBody(inactiveResponse)).status, "inactive");
  const inactiveUser = await db
    .select({ phone: usersTable.phone, isActive: usersTable.isActive })
    .from(usersTable)
    .where(eq(usersTable.id, createdUserId));
  const inactiveStudent = await db
    .select({ isActive: studentsTable.isActive })
    .from(studentsTable)
    .where(eq(studentsTable.id, createdId));
  assert.deepEqual(inactiveUser, [{ phone: null, isActive: false }]);
  assert.deepEqual(inactiveStudent, [{ isActive: false }]);

  const inactiveListResponse = await server!.request("/students?status=inactive", {
    headers: auth(token),
  });
  assert.equal(inactiveListResponse.status, 200);
  assert.ok(
    ((await jsonBody(inactiveListResponse)).data as Array<{ id: number }>).some((row) => row.id === createdId),
  );

  await db.insert(feeRecordsTable).values({
    studentId: createdId,
    semesterId,
    amount: "100.00",
    dueDate: "2026-03-01",
  });
  const blockedDeleteResponse = await server!.request(`/students/${createdId}`, {
    method: "DELETE",
    headers: auth(token),
  });
  assert.equal(blockedDeleteResponse.status, 409);
  assert.deepEqual(await jsonBody(blockedDeleteResponse), {
    error: "Student has linked academic records and cannot be deleted",
  });
  assert.deepEqual(
    await db.select({ id: studentsTable.id }).from(studentsTable).where(eq(studentsTable.id, createdId)),
    [{ id: createdId }],
  );

  await db.delete(feeRecordsTable).where(eq(feeRecordsTable.studentId, createdId));
  const deleteResponse = await server!.request(`/students/${createdId}`, {
    method: "DELETE",
    headers: auth(token),
  });
  assert.equal(deleteResponse.status, 204);

  const deleted = await db
    .select({ id: studentsTable.id })
    .from(studentsTable)
    .where(eq(studentsTable.id, createdId));
  assert.deepEqual(deleted, []);
  const deletedUser = await db
    .select({ isActive: usersTable.isActive })
    .from(usersTable)
    .where(eq(usersTable.id, createdUserId));
  assert.deepEqual(deletedUser, [{ isActive: false }]);
  const deletedLoginResponse = await loginRequest("created.task3b@example.test", "CreatedPassword123");
  assert.equal(deletedLoginResponse.status, 401);
});

test("authorized Faculty CRUD persists and synchronizes account state", async () => {
  const { token } = await login("admin.task3b@example.test", adminPassword);
  const createResponse = await server!.request("/faculty", {
    method: "POST",
    headers: { ...auth(token), "content-type": "application/json" },
    body: JSON.stringify({
      name: "Created Test Faculty",
      email: "created-faculty.task5@example.test",
      password: "CreatedFacultyPassword123",
      employeeId: "T5-FACULTY",
      departmentId,
      designation: "Lecturer",
      joiningDate: "2026-02-01",
      phone: "555-0100",
    }),
  });
  assert.equal(createResponse.status, 201);
  const created = await jsonBody(createResponse);
  const facultyId = created.id as number;
  const userId = created.userId as number;

  const updateResponse = await server!.request(`/faculty/${facultyId}`, {
    method: "PATCH",
    headers: { ...auth(token), "content-type": "application/json" },
    body: JSON.stringify({ isActive: false, phone: null, qualification: "PhD" }),
  });
  assert.equal(updateResponse.status, 200);
  const updated = await jsonBody(updateResponse);
  assert.equal(updated.isActive, false);
  assert.equal(updated.phone, null);
  assert.equal(updated.qualification, "PhD");

  assert.deepEqual(
    await db.select({ phone: usersTable.phone, isActive: usersTable.isActive }).from(usersTable).where(eq(usersTable.id, userId)),
    [{ phone: null, isActive: false }],
  );
  assert.deepEqual(
    await db.select({ isActive: facultyTable.isActive }).from(facultyTable).where(eq(facultyTable.id, facultyId)),
    [{ isActive: false }],
  );

  const [course] = await db.insert(coursesTable).values({
    name: "Faculty Delete Guard",
    code: "T5-FAC-COURSE",
    departmentId,
    semesterId,
    facultyId,
  }).returning({ id: coursesTable.id });
  const [assignment] = await db.insert(assignmentsTable).values({
    title: "Faculty Delete Guard Assignment",
    courseId: course.id,
    facultyId,
    dueDate: "2026-03-01",
  }).returning({ id: assignmentsTable.id });

  const blockedDeleteResponse = await server!.request(`/faculty/${facultyId}`, {
    method: "DELETE",
    headers: auth(token),
  });
  assert.equal(blockedDeleteResponse.status, 409);
  assert.deepEqual(await jsonBody(blockedDeleteResponse), {
    error: "Faculty member has linked records and cannot be deleted",
  });
  assert.deepEqual(
    await db.select({ id: facultyTable.id }).from(facultyTable).where(eq(facultyTable.id, facultyId)),
    [{ id: facultyId }],
  );

  await db.delete(assignmentsTable).where(eq(assignmentsTable.id, assignment.id));
  await db.delete(coursesTable).where(eq(coursesTable.id, course.id));
  const deleteResponse = await server!.request(`/faculty/${facultyId}`, {
    method: "DELETE",
    headers: auth(token),
  });
  assert.equal(deleteResponse.status, 204);
  assert.deepEqual(
    await db.select({ id: facultyTable.id }).from(facultyTable).where(eq(facultyTable.id, facultyId)),
    [],
  );
  assert.deepEqual(
    await db.select({ isActive: usersTable.isActive }).from(usersTable).where(eq(usersTable.id, userId)),
    [{ isActive: false }],
  );
});

test("Student and Faculty APIs reject invalid inputs and unsupported status filters", async () => {
  const { token } = await login("admin.task3b@example.test", adminPassword);
  const invalidStudent = await server!.request("/students", {
    method: "POST",
    headers: { ...auth(token), "content-type": "application/json" },
    body: JSON.stringify({
      name: "Invalid Student",
      email: "not-an-email",
      password: "short",
      rollNumber: "T5-INVALID",
      departmentId,
      semesterId,
      admissionDate: "2026-02-01",
    }),
  });
  assert.equal(invalidStudent.status, 400);

  const invalidFaculty = await server!.request("/faculty", {
    method: "POST",
    headers: { ...auth(token), "content-type": "application/json" },
    body: JSON.stringify({
      name: "Invalid Faculty",
      email: "faculty-invalid",
      password: "short",
      employeeId: "T5-INVALID-FAC",
      departmentId,
      designation: "Lecturer",
      joiningDate: "2026-02-01",
    }),
  });
  assert.equal(invalidFaculty.status, 400);

  const invalidStatus = await server!.request("/students?status=unknown", {
    headers: auth(token),
  });
  assert.equal(invalidStatus.status, 400);
});

test("wrong passwords and unknown users are rejected by database-backed login", async () => {
  const wrongPasswordResponse = await loginRequest(
    "lifecycle.task4a@example.test",
    "WrongPassword123",
  );
  assert.equal(wrongPasswordResponse.status, 401);
  assert.deepEqual(await jsonBody(wrongPasswordResponse), {
    error: "Invalid email or password",
  });

  const unknownUserResponse = await loginRequest(
    "unknown.task4a@example.test",
    lifecyclePassword,
  );
  assert.equal(unknownUserResponse.status, 401);
  assert.deepEqual(await jsonBody(unknownUserResponse), {
    error: "Invalid email or password",
  });
});

test("inactive users cannot create authenticated sessions", async () => {
  const response = await loginRequest(
    "inactive.task4a@example.test",
    lifecyclePassword,
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await jsonBody(response), {
    error: "Account is inactive. Contact administrator.",
  });
});

test("an expired database session rejects an otherwise valid token", async () => {
  const { token } = await login(
    "lifecycle.task4a@example.test",
    lifecyclePassword,
  );
  const tokenId = verifyToken(token).jti;

  await db
    .update(authSessionsTable)
    .set({ expiresAt: new Date("2000-01-01T00:00:00.000Z") })
    .where(eq(authSessionsTable.tokenId, tokenId));

  const response = await server!.request("/auth/me", { headers: auth(token) });
  assert.equal(response.status, 401);
  assert.deepEqual(await jsonBody(response), {
    error: "Session expired or revoked",
  });
});

test("a revoked database session rejects an otherwise valid token", async () => {
  const { token } = await login(
    "lifecycle.task4a@example.test",
    lifecyclePassword,
  );
  const tokenId = verifyToken(token).jti;

  await db
    .update(authSessionsTable)
    .set({ revokedAt: new Date("2026-01-01T00:00:00.000Z") })
    .where(eq(authSessionsTable.tokenId, tokenId));

  const response = await server!.request("/auth/me", { headers: auth(token) });
  assert.equal(response.status, 401);
  assert.deepEqual(await jsonBody(response), {
    error: "Session expired or revoked",
  });
});

test("deactivating a user invalidates an already-issued token", async () => {
  const { token } = await login(
    "lifecycle.task4a@example.test",
    lifecyclePassword,
  );

  try {
    await db
      .update(usersTable)
      .set({ isActive: false })
      .where(eq(usersTable.id, lifecycleUserId));

    const response = await server!.request("/auth/me", { headers: auth(token) });
    assert.equal(response.status, 401);
    assert.deepEqual(await jsonBody(response), {
      error: "Invalid or inactive account",
    });
  } finally {
    await db
      .update(usersTable)
      .set({ isActive: true })
      .where(eq(usersTable.id, lifecycleUserId));
  }
});

test("changing a user's email invalidates an already-issued token", async () => {
  const originalEmail = "lifecycle.task4a@example.test";
  const changedEmail = "lifecycle-changed.task4a@example.test";
  const { token } = await login(originalEmail, lifecyclePassword);

  try {
    await db
      .update(usersTable)
      .set({ email: changedEmail })
      .where(eq(usersTable.id, lifecycleUserId));

    const response = await server!.request("/auth/me", { headers: auth(token) });
    assert.equal(response.status, 401);
    assert.deepEqual(await jsonBody(response), {
      error: "Invalid or inactive account",
    });
  } finally {
    await db
      .update(usersTable)
      .set({ email: originalEmail })
      .where(eq(usersTable.id, lifecycleUserId));
  }
});

test("authenticated requests update the session last-seen timestamp", async () => {
  const { token } = await login(
    "lifecycle.task4a@example.test",
    lifecyclePassword,
  );
  const tokenId = verifyToken(token).jti;
  const oldLastSeenAt = new Date("2000-01-01T00:00:00.000Z");

  await db
    .update(authSessionsTable)
    .set({ lastSeenAt: oldLastSeenAt })
    .where(eq(authSessionsTable.tokenId, tokenId));

  const response = await server!.request("/auth/me", { headers: auth(token) });
  assert.equal(response.status, 200);

  const [session] = await db
    .select({ lastSeenAt: authSessionsTable.lastSeenAt })
    .from(authSessionsTable)
    .where(eq(authSessionsTable.tokenId, tokenId));
  assert.ok(session);
  assert.equal(session.lastSeenAt > oldLastSeenAt, true);
});

test("multiple active sessions remain independently usable", async () => {
  const first = await login(
    "lifecycle.task4a@example.test",
    lifecyclePassword,
  );
  const second = await login(
    "lifecycle.task4a@example.test",
    lifecyclePassword,
  );
  const tokenIds = [verifyToken(first.token).jti, verifyToken(second.token).jti];

  const sessions = await db
    .select({
      tokenId: authSessionsTable.tokenId,
      revokedAt: authSessionsTable.revokedAt,
    })
    .from(authSessionsTable)
    .where(inArray(authSessionsTable.tokenId, tokenIds));
  assert.equal(sessions.length, 2);
  assert.deepEqual(
    sessions.map((session) => session.revokedAt),
    [null, null],
  );

  const firstResponse = await server!.request("/auth/me", {
    headers: auth(first.token),
  });
  const secondResponse = await server!.request("/auth/me", {
    headers: auth(second.token),
  });
  assert.equal(firstResponse.status, 200);
  assert.equal(secondResponse.status, 200);
});

test("password changes preserve the current session and revoke other sessions", async () => {
  const first = await login(
    "password-change.task4a@example.test",
    passwordChangePassword,
  );
  const second = await login(
    "password-change.task4a@example.test",
    passwordChangePassword,
  );

  const changeResponse = await server!.request("/auth/change-password", {
    method: "POST",
    headers: { ...auth(first.token), "content-type": "application/json" },
    body: JSON.stringify({
      currentPassword: passwordChangePassword,
      newPassword: "PasswordChanged456",
    }),
  });
  assert.equal(changeResponse.status, 200);

  const currentSessionResponse = await server!.request("/auth/me", {
    headers: auth(first.token),
  });
  assert.equal(currentSessionResponse.status, 200);

  const otherSessionResponse = await server!.request("/auth/me", {
    headers: auth(second.token),
  });
  assert.equal(otherSessionResponse.status, 401);
  assert.deepEqual(await jsonBody(otherSessionResponse), {
    error: "Session expired or revoked",
  });

  const newPasswordResponse = await loginRequest(
    "password-change.task4a@example.test",
    "PasswordChanged456",
  );
  assert.equal(newPasswordResponse.status, 200);

  const oldPasswordResponse = await loginRequest(
    "password-change.task4a@example.test",
    passwordChangePassword,
  );
  assert.equal(oldPasswordResponse.status, 401);

  const [passwordUser] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.id, passwordChangeUserId));
  assert.equal(passwordUser.id, passwordChangeUserId);
});