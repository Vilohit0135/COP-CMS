import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
  {
    // ============================================================
    // BASIC INFORMATION
    // ============================================================

    // Full university / provider name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // SEO friendly URL slug (must be unique)
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // University logo (used in header + cards)
    logo: {
      type: String,
    },

    // Main banner image shown at top of provider page
    coverImage: {
      type: String,
    },

    // Additional gallery images (campus, classrooms, etc.)
    galleryImages: [
      {
        type: String,
      },
    ],

    // Short description shown in listing cards
    shortExcerpt: {
      type: String,
    },

    // Provider type (important for aggregator architecture)
    // University / Edtech / Platform
    type: {
      type: String,
      enum: ["University", "Edtech", "Platform"],
      default: "University",
    },

    // Featured provider toggle (homepage highlights)
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Active / inactive toggle (soft delete alternative)
    isActive: {
      type: Boolean,
      default: true,
    },

    // Draft or published (important for CMS workflow)
    publicationStatus: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    // ============================================================
    // RATINGS SECTION (For Provider Page Stats)
    // ============================================================

    // Overall average rating
    averageRating: {
      type: Number,
      default: 0,
    },

    // Total number of reviews received
    reviewCount: {
      type: Number,
      default: 0,
    },

    // Detailed rating breakdown (shown in UI)
    ratingBreakdown: {
      averageRating: { type: Number, default: 0 },
      digitalInfrastructure: { type: Number, default: 0 },
      curriculum: { type: Number, default: 0 },
      valueForMoney: { type: Number, default: 0 },
    },

    // ============================================================
    // ABOUT & CONTENT SECTIONS (Rich Content Blocks)
    // ============================================================

    // Main about section (rich text stored as HTML or structured JSON)
    aboutContent: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Admission process steps
    admissionProcess: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Financial aid overview text
    financialAid: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Examination pattern explanation
    examinationPattern: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Career services description
    careerServices: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Any additional dynamic sections in future
    additionalContent: {
      type: mongoose.Schema.Types.Mixed,
    },

    // ============================================================
    // SCHOLARSHIPS TABLE (Structured Table)
    // ============================================================

    scholarships: [
      {
        category: String,
        scholarshipCredit: String,
        eligibility: String,
      },
    ],

    // ============================================================
    // APPROVALS & RECOGNITION
    // ============================================================

    approvals: [
      {
        name: String,   // AICTE, UGC, NAAC
        logo: String,   // Approval logo image
      },
    ],

    // ============================================================
    // RANKINGS SECTION
    // ============================================================

    rankings: [
      {
        title: String,
        description: String,
      },
    ],

    // ============================================================
    // KEY FACTS SECTION (Bullet Highlights)
    // ============================================================

    facts: [
      {
        icon: String,  // optional icon
        text: String,
      },
    ],

    // ============================================================
    // CAMPUSES SECTION
    // ============================================================

    campuses: [
      {
        city: String,
        state: String,
        country: String,
      },
    ],

    // ============================================================
    // PLACEMENT PARTNERS (Recruiter Logos)
    // ============================================================

    placementPartners: [
      {
        name: String,
        logo: String,
      },
    ],

    // ============================================================
    // SAMPLE CERTIFICATE
    // ============================================================

    sampleCertificateImage: {
      type: String,
    },

    // ============================================================
    // ADMISSION STATUS SECTION
    // ============================================================

    admissionOpen: {
      isOpen: {
        type: Boolean,
        default: false,
      },
      year: String,   // e.g., "2025"
      text: String,   // custom admission text
    },

    // ============================================================
    // FAQ SECTION
    // ============================================================

    faq: [
      {
        question: String,
        answer: String,
      },
    ],

    // ============================================================
    // SEO FIELDS
    // ============================================================

    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
    canonicalUrl: String,
  },
  { timestamps: true }
);

// ============================================================
// INDEXES (CRITICAL FOR PERFORMANCE)
// ============================================================

// Fast slug lookup
providerSchema.index({ slug: 1 });

// Filter active providers
providerSchema.index({ isActive: 1 });

// Featured providers sorting
providerSchema.index({ isFeatured: -1 });

// Draft / published filter
providerSchema.index({ publicationStatus: 1 });

// Search optimization
providerSchema.index({ name: "text", shortExcerpt: "text" });

export default mongoose.models.Provider ||
  mongoose.model("Provider", providerSchema);