import { z } from "zod";

const studentFields = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().optional(),
  rollNumber: z.string().trim().min(1, "Roll number is required"),
  departmentId: z.coerce.number().int().min(1, "Select a department"),
  semesterId: z.coerce.number().int().min(1, "Select a semester"),
  admissionDate: z.string().min(1, "Admission date is required"),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  isActive: z.boolean().optional(),
});

const facultyFields = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().optional(),
  employeeId: z.string().trim().min(1, "Employee ID is required"),
  departmentId: z.coerce.number().int().min(1, "Select a department"),
  designation: z.string().trim().min(1, "Designation is required"),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  joiningDate: z.string().min(1, "Joining date is required"),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type StudentFormValues = z.infer<typeof studentFields>;
export type FacultyFormValues = z.infer<typeof facultyFields>;
export type CrudListState = "loading" | "error" | "empty" | "data";

export function crudListState({
  isLoading,
  isError,
  hasItems,
}: {
  isLoading: boolean;
  isError: boolean;
  hasItems: boolean;
}): CrudListState {
  if (isLoading) return "loading";
  if (isError) return "error";
  return hasItems ? "data" : "empty";
}

export function studentFormSchema(mode: "create" | "edit") {
  return studentFields.superRefine((value, context) => {
    if (mode === "create" && (!value.password || value.password.length < 8)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password must be at least 8 characters",
      });
    }
  });
}

export function facultyFormSchema(mode: "create" | "edit") {
  return facultyFields.superRefine((value, context) => {
    if (mode === "create" && (!value.password || value.password.length < 8)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password must be at least 8 characters",
      });
    }
  });
}

export function nullableText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function crudErrorMessage(error: unknown, fallback = "Request failed"): string {
  if (typeof error !== "object" || error === null) return fallback;

  const candidate = error as {
    message?: unknown;
    data?: unknown;
  };
  if (typeof candidate.data === "object" && candidate.data !== null && "error" in candidate.data) {
    const detail = candidate.data.error;
    if (typeof detail === "string" && detail.trim()) return detail;
  }
  return typeof candidate.message === "string" && candidate.message.trim()
    ? candidate.message
    : fallback;
}
