import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\+?[\d\s-]{8,15}$/, "Please provide a valid phone number"],
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },

    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "on-leave", "inactive", "terminated"],
      default: "active",
    },

    joinDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    salary: {
      type: Number,
      required: true,
      min: 0,
      max: 1000000,
    },

    performance: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    avatar: {
      type: String,
      default: "",
    },

    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zipCode: { type: String, default: "" },
      country: { type: String, default: "" },
    },

    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },

    skills: {
      type: [String],
      default: [],
    },

    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },

    dateOfBirth: Date,

    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },

    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed", ""],
      default: "",
    },

    nationality: {
      type: String,
      default: "",
    },

    bankAccount: {
      accountHolder: String,
      bankName: String,
      accountNumber: String,
      routingNumber: String,
    },

    documents: [
      {
        name: String,
        type: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    workHistory: [
      {
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        description: String,
      },
    ],

    education: [
      {
        degree: String,
        institution: String,
        year: String,
        grade: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//
// ✅ PRE-SAVE (FIXED - NO next())
//
employeeSchema.pre("save", async function () {
  if (!this.employeeId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.employeeId = `EMP-${year}-${(count + 1).toString().padStart(4, "0")}`;
  }
});

//
// ✅ VIRTUALS
//
employeeSchema.virtual("fullAddress").get(function () {
  const a = this.address || {};
  const parts = [a.street, a.city, a.state, a.zipCode, a.country].filter(
    Boolean,
  );
  return parts.length ? parts.join(", ") : "Not provided";
});

employeeSchema.virtual("employmentDuration").get(function () {
  const diff = Date.now() - new Date(this.joinDate).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years) return `${years} years`;
  if (months) return `${months} months`;
  return `${days} days`;
});

employeeSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;

  const today = new Date();
  const dob = new Date(this.dateOfBirth);

  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
});

//
// ❌ IMPORTANT: Removed duplicate index definition (FIXED WARNING)
// Only keep schema indexes below
//
employeeSchema.index({ name: "text", email: "text", position: "text" });
employeeSchema.index({ department: 1, status: 1 });
employeeSchema.index({ joinDate: -1 });

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
