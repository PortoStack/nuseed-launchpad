import { NextResponse } from "next/server";
import { requirementService } from "@/services/requirementService";
import { peopleService } from "@/services/peopleService";
import { fundingService } from "@/services/fundingService";
import { personToResearcher } from "@/lib/people-adapters";
import {
  matchResearchers,
  matchFundings,
  matchCoachesAndAdvisors,
  matchFundingResearcherPairs,
  matchFundingResearcherEntrepreneurTriples,
} from "@/services/matchingService";

export async function POST(req: Request) {
  try {
    const { requirementId, relation = "entrepreneur-researcher" } =
      await req.json();

    if (!requirementId) {
      return NextResponse.json(
        { success: false, error: "requirementId is required" },
        { status: 400 }
      );
    }

    const [requirement, people, fundings] = await Promise.all([
      requirementService.getRequirementById(requirementId),
      peopleService.getMatchingPeople(),
      fundingService.getFundings(),
    ]);

    if (!requirement) {
      return NextResponse.json(
        { success: false, error: "Requirement not found" },
        { status: 404 }
      );
    }

    const researchers = people.map((p) => personToResearcher(p, "th"));

    if (relation === "entrepreneur-researcher") {
      const results = matchResearchers(requirement, researchers);
      const coaches = matchCoachesAndAdvisors(requirement, researchers);
      return NextResponse.json({
        success: true,
        requirement,
        researchers: results,
        coaches,
      });
    }

    if (relation === "entrepreneur-funding") {
      const results = matchFundings(requirement, fundings);
      return NextResponse.json({
        success: true,
        requirement,
        fundings: results,
      });
    }

    if (relation === "funding-researcher") {
      const results = matchFundingResearcherPairs(researchers, fundings);
      return NextResponse.json({
        success: true,
        pairs: results,
      });
    }

    if (relation === "funding-researcher-entrepreneur") {
      const results = matchFundingResearcherEntrepreneurTriples(
        requirement,
        researchers,
        fundings
      );
      return NextResponse.json({
        success: true,
        triples: results,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid relation" },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/match error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to compute matching" },
      { status: 500 }
    );
  }
}
