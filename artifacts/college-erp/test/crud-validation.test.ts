import assert from "node:assert/strict";
import { test } from "node:test";
import {
  crudListState,
  crudErrorMessage,
  facultyFormSchema,
  nullableText,
  studentFormSchema,
} from "../src/lib/crud-validation.ts";

const studentValues = {
  name: "Test Student",
  email: "student@example.test",
  rollNumber: "STU-1",
  departmentId: 1,
  semesterId: 1,
  admissionDate: "2026-01-01",
};

const facultyValues = {
  name: "Test Faculty",
  email: "faculty@example.test",
  employeeId: "FAC-1",
  departmentId: 1,
  designation: "Lecturer",
  joiningDate: "2026-01-01",
};

test("Student and Faculty creation require a valid email and a strong initial password", () => {
  assert.equal(
    studentFormSchema("create").safeParse({ ...studentValues, password: "validpass123" }).success,
    true,
  );
  assert.equal(
    studentFormSchema("create").safeParse({ ...studentValues, password: "" }).success,
    false,
  );
  assert.equal(
    facultyFormSchema("create").safeParse({ ...facultyValues, email: "not-an-email", password: "validpass123" }).success,
    false,
  );
  assert.equal(
    facultyFormSchema("create").safeParse({ ...facultyValues, password: "short" }).success,
    false,
  );
});

test("edit forms do not require a password and accept account-status changes", () => {
  assert.equal(studentFormSchema("edit").safeParse({ ...studentValues, isActive: false }).success, true);
  assert.equal(facultyFormSchema("edit").safeParse({ ...facultyValues, isActive: false }).success, true);
});

test("optional text is trimmed and normalized to null when blank", () => {
  assert.equal(nullableText("  value  "), "value");
  assert.equal(nullableText("  "), null);
  assert.equal(nullableText(undefined), null);
});

test("CRUD lists distinguish loading, error, empty, and populated states", () => {
  assert.equal(crudListState({ isLoading: true, isError: true, hasItems: false }), "loading");
  assert.equal(crudListState({ isLoading: false, isError: true, hasItems: false }), "error");
  assert.equal(crudListState({ isLoading: false, isError: false, hasItems: false }), "empty");
  assert.equal(crudListState({ isLoading: false, isError: false, hasItems: true }), "data");
});

test("CRUD errors prefer a server-provided message", () => {
  assert.equal(
    crudErrorMessage({ message: "Request failed", data: { error: "Email already registered" } }),
    "Email already registered",
  );
  assert.equal(crudErrorMessage(new Error("Network unavailable")), "Network unavailable");
  assert.equal(crudErrorMessage(null, "Could not save"), "Could not save");
});
