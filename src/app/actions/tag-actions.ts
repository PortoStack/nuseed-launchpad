"use server";

import { requirementService } from "@/services/requirementService";
import {
  tagCatalogService,
  type CreateCatalogTagDTO,
  type TagCatalogUpdate,
} from "@/services/tagCatalogService";
import type { Requirement, TagCatalogItem } from "@/types/requirement";

export async function decideTagProposalAction(
  requirementId: string,
  tagId: string,
  payload: any
): Promise<Requirement> {
  return requirementService.decideTagProposal(requirementId, tagId, payload);
}

export async function createTagAction(
  dto: CreateCatalogTagDTO
): Promise<TagCatalogItem> {
  return tagCatalogService.createTag(dto);
}

export async function updateTagAction(
  id: string,
  updates: TagCatalogUpdate
): Promise<TagCatalogItem> {
  return tagCatalogService.updateTag(id, updates);
}

export async function getTagsAction(): Promise<TagCatalogItem[]> {
  return tagCatalogService.getCatalog();
}
