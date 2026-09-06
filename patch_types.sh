#!/bin/bash
cat << 'INNER_EOF' > /tmp/types_patch.txt
export interface UserProfile {
  uid: string;
  email: string;
  handle: string;
  displayName: string;
  photoURL?: string;
  bannerURL?: string;
  pronouns: 'he/him' | 'she/her' | 'they/them' | 'custom';
  customPronouns?: string;
  createdAt: number;
  bio?: string;
  displayNameUpdatedAt?: number;
  handleUpdatedAt?: number;
  isFollowing?: boolean;
  followingCount?: number;
  followersCount?: number;
  customization?: {
    usernameColor?: {
      type: 'solid' | 'glow' | 'gradient';
      value: string;
    };
    profileBorder?: {
      type: 'solid' | 'glow' | 'dotted' | 'effect';
      color?: string;
      thickness?: number;
      effectId?: string;
    };
  };
}

export interface Tweet {
  id: string;
  authorUid: string;
  content: string;
  createdAt: number;
  likesCount: number;
  repostsCount: number;
  repliesCount: number;
  author?: UserProfile;
  replyTo?: string; // id of the tweet it replies to
}
INNER_EOF
cp /tmp/types_patch.txt src/types.ts
