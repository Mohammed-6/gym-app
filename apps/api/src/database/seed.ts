import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDatabase, disconnectDatabase } from "./connection";
import { Branch } from "../modules/branches/branch.model";
import { User } from "../modules/users/user.model";
import { Member, MemberDocument } from "../modules/members/member.model";
import { MembershipPlan, MembershipPlanDocument } from "../modules/membership-plans/membership-plan.model";
import { Membership } from "../modules/memberships/membership.model";
import { Payment } from "../modules/payments/payment.model";
import { Receipt } from "../modules/receipts/receipt.model";
import { formatSequence, getNextSequenceValue } from "../modules/sequences/sequence.service";
import { calculatePaymentTotals } from "../modules/payments/payment.calculations";
import { addDays, calculateMembershipEndDate, startOfDay } from "../utils/dates";

const PLAN_SEEDS = [
  { name: "Monthly", durationInMonths: 1, price: 1500, description: "Full gym access, billed monthly." },
  { name: "Quarterly", durationInMonths: 3, price: 4000, description: "3 months of full gym access." },
  { name: "Half Yearly", durationInMonths: 6, price: 7500, description: "6 months of full gym access." },
  { name: "Yearly", durationInMonths: 12, price: 12000, description: "Best value annual membership." },
  {
    name: "Personal Training - Monthly",
    durationInMonths: 1,
    price: 3000,
    description: "Monthly access plus dedicated personal trainer sessions.",
  },
];

interface MemberSeed {
  firstName: string;
  lastName: string;
  fatherName: string;
  phone: string;
  email: string;
  gender: "male" | "female";
  dateOfBirth: Date;
  address: string;
  city: string;
  state: string;
  pincode: string;
  batch: string;
  weight: number;
  chest: number;
  arm: number;
  status: "active" | "inactive";
}

const MEMBER_SEEDS: MemberSeed[] = [
  {
    firstName: "Arjun",
    lastName: "Sharma",
    fatherName: "Ramesh Sharma",
    phone: "9876543210",
    email: "arjun.sharma@example.com",
    gender: "male",
    dateOfBirth: new Date(1998, 3, 12),
    address: "12 MG Road",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    batch: "Morning 6-8 AM",
    weight: 72,
    chest: 38,
    arm: 13,
    status: "active",
  },
  {
    firstName: "Priya",
    lastName: "Patel",
    fatherName: "Suresh Patel",
    phone: "9823456781",
    email: "priya.patel@example.com",
    gender: "female",
    dateOfBirth: new Date(1995, 7, 22),
    address: "45 SG Highway",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380015",
    batch: "Evening 5-7 PM",
    weight: 58,
    chest: 34,
    arm: 10,
    status: "active",
  },
  {
    firstName: "Rohan",
    lastName: "Verma",
    fatherName: "Anil Verma",
    phone: "9765432109",
    email: "rohan.verma@example.com",
    gender: "male",
    dateOfBirth: new Date(2000, 1, 5),
    address: "78 Sector 21",
    city: "Delhi",
    state: "Delhi",
    pincode: "110021",
    batch: "Morning 6-8 AM",
    weight: 80,
    chest: 40,
    arm: 14,
    status: "active",
  },
  {
    firstName: "Sneha",
    lastName: "Reddy",
    fatherName: "Krishna Reddy",
    phone: "9654321098",
    email: "sneha.reddy@example.com",
    gender: "female",
    dateOfBirth: new Date(1997, 10, 30),
    address: "23 Jubilee Hills",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500033",
    batch: "Morning 7-9 AM",
    weight: 55,
    chest: 33,
    arm: 9,
    status: "active",
  },
  {
    firstName: "Karan",
    lastName: "Mehta",
    fatherName: "Dinesh Mehta",
    phone: "9543210987",
    email: "karan.mehta@example.com",
    gender: "male",
    dateOfBirth: new Date(1993, 5, 18),
    address: "9 Koramangala",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560034",
    batch: "Evening 6-8 PM",
    weight: 85,
    chest: 41,
    arm: 15,
    status: "active",
  },
  {
    firstName: "Ananya",
    lastName: "Iyer",
    fatherName: "Ravi Iyer",
    phone: "9432109876",
    email: "ananya.iyer@example.com",
    gender: "female",
    dateOfBirth: new Date(1999, 2, 14),
    address: "56 T Nagar",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600017",
    batch: "Evening 5-7 PM",
    weight: 60,
    chest: 34,
    arm: 10,
    status: "active",
  },
  {
    firstName: "Vikram",
    lastName: "Singh",
    fatherName: "Bhupinder Singh",
    phone: "9321098765",
    email: "vikram.singh@example.com",
    gender: "male",
    dateOfBirth: new Date(1990, 8, 9),
    address: "34 C-Scheme",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302001",
    batch: "Morning 6-8 AM",
    weight: 90,
    chest: 43,
    arm: 16,
    status: "active",
  },
  {
    firstName: "Divya",
    lastName: "Nair",
    fatherName: "Mohan Nair",
    phone: "9210987654",
    email: "divya.nair@example.com",
    gender: "female",
    dateOfBirth: new Date(1996, 11, 2),
    address: "67 Salt Lake",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700064",
    batch: "Evening 6-8 PM",
    weight: 57,
    chest: 33,
    arm: 9,
    status: "active",
  },
  {
    firstName: "Rahul",
    lastName: "Gupta",
    fatherName: "Vinod Gupta",
    phone: "9109876543",
    email: "rahul.gupta@example.com",
    gender: "male",
    dateOfBirth: new Date(1994, 4, 25),
    address: "89 Hazratganj",
    city: "Lucknow",
    state: "Uttar Pradesh",
    pincode: "226001",
    batch: "Morning 7-9 AM",
    weight: 78,
    chest: 39,
    arm: 13,
    status: "active",
  },
  {
    firstName: "Neha",
    lastName: "Joshi",
    fatherName: "Ashok Joshi",
    phone: "9098765432",
    email: "neha.joshi@example.com",
    gender: "female",
    dateOfBirth: new Date(1998, 6, 17),
    address: "15 Model Colony",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411016",
    batch: "Evening 5-7 PM",
    weight: 54,
    chest: 32,
    arm: 9,
    status: "inactive",
  },
];

async function nextMemberId() {
  const value = await getNextSequenceValue("member");
  return formatSequence("MEM", value, 0, "");
}

async function nextReceiptNumber() {
  const value = await getNextSequenceValue("receipt");
  return formatSequence("RCP", value);
}

async function assignMembership(
  member: MemberDocument,
  plan: MembershipPlanDocument,
  startDate: Date,
  discount = 0
) {
  const start = startOfDay(startDate);
  const endDate = calculateMembershipEndDate(start, plan.durationInMonths);
  const finalAmount = Math.max(0, plan.price - discount);
  const status = endDate < startOfDay(new Date()) ? "expired" : "active";

  return Membership.create({
    member: member._id,
    plan: plan._id,
    branch: member.branch,
    startDate: start,
    endDate,
    price: plan.price,
    discount,
    finalAmount,
    status,
  });
}

async function recordPayment(
  member: MemberDocument,
  membershipId: unknown,
  membershipAmount: number,
  paidAmount: number,
  paymentMethod: string,
  paymentDate: Date,
  receivedByUserId: unknown,
  receivedByName: string
) {
  const totals = calculatePaymentTotals({ membershipAmount, paidAmount });
  const receiptNumber = await nextReceiptNumber();

  const payment = await Payment.create({
    member: member._id,
    membership: membershipId,
    branch: member.branch,
    membershipAmount,
    otherFees: totals.otherFees,
    discount: totals.discount,
    totalAmount: totals.totalAmount,
    paidAmount: totals.paidAmount,
    dueAmount: totals.dueAmount,
    paymentMethod,
    paymentDate,
    receivedBy: receivedByUserId,
    receiptNumber,
  });

  const addressParts = [member.address, member.city, member.state, member.pincode].filter(Boolean);

  await Receipt.create({
    receiptNumber,
    payment: payment._id,
    member: member._id,
    branch: member.branch,
    memberSnapshot: {
      memberId: member.memberId,
      name: [member.firstName, member.lastName].filter(Boolean).join(" "),
      fatherName: member.fatherName,
      phone: member.phone,
      address: addressParts.join(", "),
      batch: member.batch,
    },
    membershipFees: membershipAmount,
    otherFees: totals.otherFees,
    discount: totals.discount,
    total: totals.totalAmount,
    paid: totals.paidAmount,
    due: totals.dueAmount,
    paymentMethod,
    paymentDate,
    receivedBy: receivedByName,
  });

  return payment;
}

async function seed() {
  await connectDatabase();

  const branchName = process.env.SEED_BRANCH_NAME ?? "Main Branch";
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@gym.local").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@123";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Admin";

  let branch = await Branch.findOne({ name: branchName });
  if (!branch) {
    branch = await Branch.create({ name: branchName, isActive: true, address: "221B Fitness Street", phone: "022-12345678" });
    console.log(`[seed] created branch "${branch.name}"`);
  } else {
    console.log(`[seed] branch "${branch.name}" already exists`);
  }

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    admin = await User.create({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "admin",
      branch: branch._id,
      isActive: true,
    });
    console.log(`[seed] created admin user "${adminEmail}" (password: ${adminPassword})`);
  } else {
    console.log(`[seed] admin user "${adminEmail}" already exists`);
  }

  const existingMemberCount = await Member.countDocuments({ branch: branch._id });
  if (existingMemberCount > 0) {
    console.log(`[seed] members already exist for this branch (${existingMemberCount}), skipping sample data`);
    await disconnectDatabase();
    console.log("[seed] done");
    return;
  }

  const plans: MembershipPlanDocument[] = [];
  for (const planSeed of PLAN_SEEDS) {
    let plan = await MembershipPlan.findOne({ name: planSeed.name });
    if (!plan) {
      plan = await MembershipPlan.create({ ...planSeed, isActive: true });
    }
    plans.push(plan);
  }
  console.log(`[seed] ensured ${plans.length} membership plans`);

  const [monthly, quarterly, halfYearly, yearly, personalTraining] = plans;
  const today = new Date();

  const members: MemberDocument[] = [];
  for (const memberSeed of MEMBER_SEEDS) {
    const memberId = await nextMemberId();
    const member = await Member.create({ ...memberSeed, memberId, branch: branch._id });
    members.push(member);
  }
  console.log(`[seed] created ${members.length} sample members`);

  const [arjun, priya, rohan, sneha, karan, ananya, vikram, divya, rahul, neha] = members;

  const arjunMembership = await assignMembership(arjun, monthly, today);
  const priyaMembership = await assignMembership(priya, quarterly, addDays(today, -20));
  const rohanMembership = await assignMembership(rohan, monthly, addDays(today, -28));
  const snehaMembership = await assignMembership(sneha, yearly, addDays(today, -60));
  const karanMembership = await assignMembership(karan, monthly, addDays(today, -45));
  const ananyaMembership = await assignMembership(ananya, halfYearly, addDays(today, -90));
  const vikramMembership = await assignMembership(vikram, quarterly, addDays(today, -85));
  const divyaMembership = await assignMembership(divya, personalTraining, addDays(today, -5));

  const rahulFirstMembership = await assignMembership(rahul, monthly, addDays(today, -60));
  const rahulSecondMembership = await assignMembership(rahul, monthly, today, 100);

  const nehaMembership = await assignMembership(neha, yearly, addDays(today, -10));

  console.log("[seed] created memberships (with realistic active/expiring/expired mix)");

  await recordPayment(arjun, arjunMembership._id, arjunMembership.finalAmount, arjunMembership.finalAmount, "cash", today, admin._id, admin.name);
  await recordPayment(priya, priyaMembership._id, priyaMembership.finalAmount, priyaMembership.finalAmount, "upi", addDays(today, -20), admin._id, admin.name);
  await recordPayment(rohan, rohanMembership._id, rohanMembership.finalAmount, rohanMembership.finalAmount, "card", addDays(today, -28), admin._id, admin.name);
  await recordPayment(sneha, snehaMembership._id, snehaMembership.finalAmount, 8000, "bank_transfer", addDays(today, -60), admin._id, admin.name);
  await recordPayment(karan, karanMembership._id, karanMembership.finalAmount, karanMembership.finalAmount, "cash", addDays(today, -45), admin._id, admin.name);
  await recordPayment(ananya, ananyaMembership._id, ananyaMembership.finalAmount, ananyaMembership.finalAmount, "upi", addDays(today, -90), admin._id, admin.name);
  await recordPayment(vikram, vikramMembership._id, vikramMembership.finalAmount, 2500, "cash", addDays(today, -85), admin._id, admin.name);
  await recordPayment(divya, divyaMembership._id, divyaMembership.finalAmount, divyaMembership.finalAmount, "upi", addDays(today, -5), admin._id, admin.name);
  await recordPayment(rahul, rahulFirstMembership._id, rahulFirstMembership.finalAmount, rahulFirstMembership.finalAmount, "cash", addDays(today, -60), admin._id, admin.name);
  await recordPayment(rahul, rahulSecondMembership._id, rahulSecondMembership.finalAmount, rahulSecondMembership.finalAmount, "card", today, admin._id, admin.name);
  await recordPayment(neha, nehaMembership._id, nehaMembership.finalAmount, nehaMembership.finalAmount, "other", addDays(today, -10), admin._id, admin.name);

  console.log("[seed] recorded payments and generated receipts");

  await disconnectDatabase();
  console.log("[seed] done");
}

seed().catch((error) => {
  console.error("[seed] failed", error);
  process.exit(1);
});
