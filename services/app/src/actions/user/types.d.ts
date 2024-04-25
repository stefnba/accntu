import { UserRole } from '@prisma/client';

export interface ICreateUserInput {
    email: string;
    firstName?: string;
    lastName?: string;
    image?: string;
    role?: UserRole;
}

export interface ICreateUserReturn {
    id: string;
}
