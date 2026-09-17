import { describe, expect, it } from "vitest";
import { buildCollegePayload, normalizeAcademicCatalog } from "./college.service";

describe("buildCollegePayload", () => {
  it("maps the multi-step form into the backend college-create payload", () => {
    const payload = buildCollegePayload({
      adminName: "Ravi Kumar",
      adminEmail: "ravi@abc.edu",
      adminPhone: "9876543210",
      adminDesignation: "TPO",
      collegeName: "ABC Engineering College",
      collegeCode: "ABC",
      website: "https://abc.edu",
      domains: ["abc.edu"],
      streetAddress: "1 Main Street",
      city: "Tirupati",
      district: "Chittoor",
      state: "Andhra Pradesh",
      postalCode: "517501",
      country: "India",
      coordinates: "13.65,79.42",
      selectedInstTypes: ["Engineering"],
      academicProfile: {
        Engineering: {
          UG: {
            "B.Tech / B.E.": ["Computer Science & Engineering (CSE)"]
          }
        }
      },
      capacity: "1200",
      logoName: "logo.png",
      coverName: "cover.png"
    });

    expect(payload).toEqual({
      collegeName: "ABC Engineering College",
      collegeCode: "ABC",
      website: "https://abc.edu",
      adminName: "Ravi Kumar",
      adminEmail: "ravi@abc.edu",
      adminMobile: "9876543210",
      adminPhone: "9876543210",
      adminDesignation: "TPO",
      domains: ["abc.edu"],
      selectedInstTypes: ["Engineering"],
      streetAddress: "1 Main Street",
      city: "Tirupati",
      district: "Chittoor",
      state: "Andhra Pradesh",
      postalCode: "517501",
      country: "India",
      coordinates: "13.65,79.42",
      academicProfile: {
        Engineering: {
          UG: {
            "B.Tech / B.E.": ["Computer Science & Engineering (CSE)"]
          }
        }
      },
      capacity: 1200,
      logoName: "logo.png",
      coverName: "cover.png"
    });
  });
});

describe("normalizeAcademicCatalog", () => {
  it("returns the provided catalog when it is already shaped correctly", () => {
    const catalog = [
      {
        id: "Engineering",
        name: "Engineering & Technology",
        levels: [
          {
            id: "UG",
            name: "Undergraduate (UG)",
            degrees: [
              {
                id: "B.Tech / B.E.",
                name: "B.Tech / B.E.",
                departments: ["Computer Science & Engineering (CSE)"]
              }
            ]
          }
        ]
      }
    ];

    expect(normalizeAcademicCatalog(catalog)).toEqual(catalog);
  });
});
