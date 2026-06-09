import type { ChangeRequest } from "./types";

type CommentConversionInput = {
  commentId: string;
  sectionId: string;
  body: string;
  ownerName: string;
  dueDate: string;
};

export function createChangeRequestFromComment(input: CommentConversionInput): ChangeRequest {
  return {
    id: `cr_${input.commentId}`,
    sectionId: input.sectionId,
    title: "Clarify customer feedback",
    body: input.body,
    ownerName: input.ownerName,
    status: "open",
    dueDate: input.dueDate,
  };
}
