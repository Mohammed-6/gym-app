import { GENDERS, MEMBER_STATUSES } from "@gym-app/shared";

export interface ImportFieldDef {
  key: string;
  label: string;
  required: boolean;
  kind: "text" | "select" | "date" | "number";
  options?: readonly string[];
  /** Header text variants (normalized: lowercase, alphanumeric-only) used for auto-matching. */
  aliases: string[];
}

export const IMPORT_FIELDS: ImportFieldDef[] = [
  { key: "memberId", label: "Member ID", required: false, kind: "text", aliases: ["memberid", "id", "regno", "registrationnumber", "regnumber"] },
  { key: "firstName", label: "First Name", required: true, kind: "text", aliases: ["firstname", "name", "first", "membername"] },
  { key: "lastName", label: "Last Name", required: false, kind: "text", aliases: ["lastname", "surname", "last"] },
  { key: "fatherName", label: "Father's Name", required: false, kind: "text", aliases: ["fathername", "fathersname", "guardianname", "father"] },
  { key: "phone", label: "Phone", required: true, kind: "text", aliases: ["phone", "mobile", "phonenumber", "mobilenumber", "contact", "contactnumber"] },
  { key: "alternatePhone", label: "Alternate Phone", required: false, kind: "text", aliases: ["alternatephone", "altphone", "secondaryphone", "whatsapp", "whatsappnumber"] },
  { key: "email", label: "Email", required: false, kind: "text", aliases: ["email", "emailaddress", "mail"] },
  { key: "address", label: "Address", required: false, kind: "text", aliases: ["address", "addr"] },
  { key: "city", label: "City", required: false, kind: "text", aliases: ["city", "town"] },
  { key: "state", label: "State", required: false, kind: "text", aliases: ["state"] },
  { key: "pincode", label: "Pincode", required: false, kind: "text", aliases: ["pincode", "pin", "zip", "zipcode", "postalcode"] },
  { key: "gender", label: "Gender", required: false, kind: "select", options: GENDERS, aliases: ["gender", "sex"] },
  { key: "dateOfBirth", label: "Date of Birth", required: false, kind: "date", aliases: ["dob", "dateofbirth", "birthdate", "birthday"] },
  { key: "batch", label: "Batch", required: false, kind: "text", aliases: ["batch", "timing", "slot", "shift"] },
  { key: "weight", label: "Weight (kg)", required: false, kind: "number", aliases: ["weight", "wt", "weightkg"] },
  { key: "chest", label: "Chest (in)", required: false, kind: "number", aliases: ["chest"] },
  { key: "arm", label: "Arm (in)", required: false, kind: "number", aliases: ["arm", "biceps"] },
  { key: "notes", label: "Notes", required: false, kind: "text", aliases: ["notes", "remark", "remarks", "comment", "comments"] },
  { key: "status", label: "Status", required: false, kind: "select", options: MEMBER_STATUSES, aliases: ["status"] },
];
