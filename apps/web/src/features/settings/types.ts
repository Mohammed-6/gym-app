export interface Settings {
  memberIdPrefix: string;
  /** The number that will be used the next time a member id is auto-generated. */
  nextMemberNumber: number;
  updatedAt: string;
}

export interface UpdateSettingsInput {
  memberIdPrefix?: string;
  nextMemberNumber?: number;
}
