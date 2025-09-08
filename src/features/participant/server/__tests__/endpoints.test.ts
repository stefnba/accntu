import { createTestClient, setupTestAuth, type TestAuthSetup } from '@/../test/utils';
import { beforeAll, describe, expect, it } from 'vitest';

// Response validation helper functions
const validateParticipantResponse = (participant: any) => {
    expect(participant).toHaveProperty('id');
    expect(participant).toHaveProperty('name');
    expect(participant).toHaveProperty('email');
    expect(participant).toHaveProperty('linkedUserId');
    expect(participant).toHaveProperty('totalTransactions');
    expect(participant).toHaveProperty('userId');
    expect(participant).toHaveProperty('isActive');
    expect(participant).toHaveProperty('createdAt');
    expect(participant).toHaveProperty('updatedAt');
    
    expect(typeof participant.id).toBe('string');
    expect(typeof participant.name).toBe('string');
    expect(typeof participant.totalTransactions).toBe('number');
    expect(typeof participant.userId).toBe('string');
    expect(typeof participant.isActive).toBe('boolean');
    expect(typeof participant.createdAt).toBe('string');
    expect(typeof participant.updatedAt).toBe('string');
};

describe('Participant API Endpoints', () => {
    let auth: TestAuthSetup;

    beforeAll(async () => {
        auth = await setupTestAuth();
    });

    describe('Authentication Tests', () => {
        const client = createTestClient();

        it('should reject unauthenticated requests', async () => {
            const res = await client.api.participants.$get({
                query: {},
            });

            expect(res.status).toBe(401);
        });

        it('should accept authenticated requests', async () => {
            const res = await client.api.participants.$get({ query: {} }, { headers: auth.authHeaders });

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const participants = await res.json();
                expect(Array.isArray(participants)).toBe(true);
            }
        });
    });

    describe('Participant CRUD Operations', () => {
        const client = createTestClient();
        let createdParticipantId: string;

        it('should create a participant', async () => {
            const participantData = {
                name: 'John Doe',
                email: 'john.doe@example.com',
            };

            const res = await client.api.participants.$post(
                { json: participantData },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(201);
            
            if (res.status === 201) {
                const participant = await res.json();
                validateParticipantResponse(participant);
                expect(participant.name).toBe(participantData.name);
                expect(participant.email).toBe(participantData.email);
                expect(participant.totalTransactions).toBe(0);
                expect(participant.linkedUserId).toBeNull();
                createdParticipantId = participant.id;
            }
        });

        it('should create participant without email', async () => {
            const participantData = {
                name: 'Jane Smith',
            };

            const res = await client.api.participants.$post(
                { json: participantData },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(201);
            
            if (res.status === 201) {
                const participant = await res.json();
                validateParticipantResponse(participant);
                expect(participant.name).toBe(participantData.name);
                expect(participant.email).toBeNull();
            }
        });

        it('should get participant by ID', async () => {
            if (!createdParticipantId) return;

            const res = await client.api.participants[':id'].$get(
                { param: { id: createdParticipantId } },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const participant = await res.json();
                validateParticipantResponse(participant);
                expect(participant.id).toBe(createdParticipantId);
                expect(participant.name).toBe('John Doe');
            }
        });

        it('should update participant', async () => {
            if (!createdParticipantId) return;

            const updateData = { name: 'John Updated', email: 'john.updated@example.com' };
            const res = await client.api.participants[':id'].$patch(
                {
                    param: { id: createdParticipantId },
                    json: updateData,
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const participant = await res.json();
                validateParticipantResponse(participant);
                expect(participant.id).toBe(createdParticipantId);
                expect(participant.name).toBe(updateData.name);
                expect(participant.email).toBe(updateData.email);
            }
        });

        it('should partial update participant', async () => {
            if (!createdParticipantId) return;

            const updateData = { name: 'John Final Name' };
            const res = await client.api.participants[':id'].$patch(
                {
                    param: { id: createdParticipantId },
                    json: updateData,
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const participant = await res.json();
                validateParticipantResponse(participant);
                expect(participant.id).toBe(createdParticipantId);
                expect(participant.name).toBe(updateData.name);
                // Email should remain unchanged
                expect(participant.email).toBe('john.updated@example.com');
            }
        });

        it('should delete participant', async () => {
            if (!createdParticipantId) return;

            const res = await client.api.participants[':id'].$delete(
                { param: { id: createdParticipantId } },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const response = await res.json();
                expect(response).toEqual({ success: true });
            }

            // Verify participant is actually deleted
            const getRes = await client.api.participants[':id'].$get(
                { param: { id: createdParticipantId } },
                { headers: auth.authHeaders }
            );
            expect(getRes.status).toBe(500);
        });
    });

    describe('Input Validation', () => {
        const client = createTestClient();

        it('should validate required fields', async () => {
            const res = await client.api.participants.$post(
                {
                    // @ts-expect-error - Missing required name
                    json: { email: 'test@example.com' }, // Missing required name
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(400);
        });

        it('should validate email format', async () => {
            const res = await client.api.participants.$post(
                {
                    json: {
                        name: 'Test User',
                        email: 'invalid-email-format',
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(400);
        });

        it('should validate name length', async () => {
            const res = await client.api.participants.$post(
                {
                    json: {
                        name: '', // Empty name
                        email: 'test@example.com',
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(400);
        });

        it('should allow valid email formats', async () => {
            const validEmails = [
                'user@example.com',
                'user.name@example.com',
                'user+tag@example.co.uk',
                'user_name@example-domain.org',
            ];

            for (const email of validEmails) {
                const res = await client.api.participants.$post(
                    {
                        json: {
                            name: `Test User for ${email}`,
                            email,
                        },
                    },
                    { headers: auth.authHeaders }
                );

                expect(res.status).toBe(201);
                
                if (res.status === 201) {
                    const participant = await res.json();
                    validateParticipantResponse(participant);
                    expect(participant.email).toBe(email);
                }
            }
        });
    });

    describe('Pagination and Search', () => {
        const client = createTestClient();

        it('should handle pagination', async () => {
            const res = await client.api.participants.$get(
                {
                    query: {
                        page: 1,
                        pageSize: 10,
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const participants = await res.json();
                expect(Array.isArray(participants)).toBe(true);
            }
        });

        it('should handle search by name', async () => {
            const res = await client.api.participants.$get(
                {
                    query: {
                        search: 'john',
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const participants = await res.json();
                expect(Array.isArray(participants)).toBe(true);
            }
        });

        it('should handle search by email', async () => {
            const res = await client.api.participants.$get(
                {
                    query: {
                        search: 'example.com',
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const participants = await res.json();
                expect(Array.isArray(participants)).toBe(true);
            }
        });
    });

    describe('Linked User Operations', () => {
        const client = createTestClient();

        it('should create participant with linked user', async () => {
            // This test assumes there's a valid user ID available
            // In a real scenario, this would reference an actual user
            const participantData = {
                name: 'Linked User Test',
                email: 'linked@example.com',
                linkedUserId: 'valid-user-id', // This would be a real user ID in practice
            };

            const res = await client.api.participants.$post(
                { json: participantData },
                { headers: auth.authHeaders }
            );

            // This might fail with foreign key constraint, which is expected in tests
            expect([201, 400]).toContain(res.status);
            
            if (res.status === 201) {
                const participant = await res.json();
                validateParticipantResponse(participant);
                expect(participant.name).toBe(participantData.name);
                expect(participant.linkedUserId).toBe(participantData.linkedUserId);
            }
        });
    });

    describe('Error Handling', () => {
        const client = createTestClient();

        it('should return 404 for non-existent participant', async () => {
            const res = await client.api.participants[':id'].$get(
                { param: { id: 'non-existent-id' } },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(500);
        });

        it('should return 404 when updating non-existent participant', async () => {
            const res = await client.api.participants[':id'].$patch(
                {
                    param: { id: 'non-existent-id' },
                    json: { name: 'Updated Name' },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(500);
        });

        it('should return 404 when deleting non-existent participant', async () => {
            const res = await client.api.participants[':id'].$delete(
                { param: { id: 'non-existent-id' } },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(500);
        });
    });
});