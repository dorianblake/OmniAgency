// Define shared TypeScript types used across the application

// Match the PlanId enum defined in prisma/schema.prisma
export type PlanId = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';

// Add other shared types here as needed, for example:
// export interface UserProfile {
//   id: string;
//   name: string;
//   email: string;
//   plan: PlanId;
// } 