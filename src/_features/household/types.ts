export type HouseholdRole = "OWNER" | "MEMBER";
export type MemberRole = HouseholdRole;

export interface HouseholdBaseRequestType {
  name: string;
  description?: string | null;
  currency: string;
  startedAt: string;
}

export type HouseholdCreateRequest = HouseholdBaseRequestType;

export interface HouseholdUpdateRequest extends HouseholdBaseRequestType {
  householdId: string;
}

export interface HouseholdListItemType {
  householdId: string;
  name: string;
  description: string | null;
  ownerId: string;
  currency: string;
  startedAt: string;
  role?: HouseholdRole;
  memberCount?: number;
}

export interface HouseholdDetailItemType {
  householdId: string;
  name: string;
  description: string | null;
  ownerId: string;
  currency: string;
  startedAt: string;
  role?: HouseholdRole;
  memberCount?: number;
}

// Members
export interface HouseholdMemberItemType {
  memberId: string;
  householdId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  // 조인된 user 정보 (응답에 포함될 수 있음)
  userName?: string | null;
  userEmail?: string | null;
}

export interface MemberCreateRequest {
  householdId: string;
  userId: string;
  role: MemberRole;
}
