export interface College {
  id: string
  name: string
  location: string
  type: "Engineering" | "Medical" | "Arts" | "Commerce" | "Science" | "Management" | "Law" | "Other"
  ranking: number
  establishedYear: number
  affiliation: string
  courses: string[]
  placementRate: number
  averagePackage: string
  topRecruiters: string[]
  facilities: string[]
  website?: string
}

export async function fetchCollegeData(): Promise<College[]> {
  const res = await fetch("/api/colleges", { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch colleges")
  const data = (await res.json()) as { colleges: College[] }
  return data.colleges
}

// Function to search colleges by name or location
export function searchColleges(query: string, colleges: College[]): College[] {
  const lowercaseQuery = query.toLowerCase()
  return colleges.filter(
    (college) =>
      college.name.toLowerCase().includes(lowercaseQuery) ||
      college.location.toLowerCase().includes(lowercaseQuery) ||
      college.type.toLowerCase().includes(lowercaseQuery),
  )
}

// Function to filter colleges by type
export function filterCollegesByType(type: College["type"], colleges: College[]): College[] {
  return colleges.filter((college) => college.type === type)
}

// Function to get college recommendations based on user profile
export function getCollegeRecommendations(
  userInterests: string[],
  userLocation?: string,
  colleges: College[] = [],
): College[] {
  // Simple recommendation algorithm - in production this would be more sophisticated
  const scored = colleges.map((college) => {
    let score = 0

    // Score based on course relevance to interests
    const relevantCourses = college.courses.filter((course) =>
      userInterests.some((interest) => course.toLowerCase().includes(interest.toLowerCase())),
    )
    score += relevantCourses.length * 10

    // Bonus for location preference
    if (userLocation && college.location.toLowerCase().includes(userLocation.toLowerCase())) {
      score += 5
    }

    // Factor in ranking (higher ranking = higher score)
    score += (100 - college.ranking) / 10

    // Factor in placement rate
    score += college.placementRate / 10

    return { ...college, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ score, ...college }) => college)
}
