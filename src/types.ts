export interface UserProfile {
  uid: string;
  handle: string;
  displayName: string;
  email: string;
  photoURL: string;
  bannerURL: string;
  dob: string;
  gender: 'male' | 'female' | 'other' | 'furry';
  pronouns: 'he/him' | 'she/her' | 'they/them' | 'custom';
  customPronouns?: string;
  createdAt: number;
  bio?: string;
  displayNameUpdatedAt?: number;
  handleUpdatedAt?: number;
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
  author?: UserProfile;
  content: string;
  createdAt: number;
  likesCount: number;
  repostsCount: number;
  repliesCount: number;
  replyTo?: string; // ID of the tweet being replied to
}

export interface Interaction {
  id: string; // usually `${uid}_${tweetId}`
  uid: string;
  tweetId: string;
  createdAt: number;
}

export type FeedFilter = 'all' | 'trending' | 'mine' | 'bookmarks';

