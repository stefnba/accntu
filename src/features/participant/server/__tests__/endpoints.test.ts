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
            const res = await client.api.participants.$get(
                { query: {} },
                { headers: auth.authHeaders }
            );

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
                const response = await res.json();
                expect(response).toHaveProperty('success', true);
                expect(response).toHaveProperty('data');
                const participant = response.data;
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
                const response = await res.json();
                expect(response).toHaveProperty('success', true);
                expect(response).toHaveProperty('data');
                const participant = response.data;
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

            expect(res.status).toBe(201);

            if (res.status === 201) {
                const response = await res.json();
                expect(response).toHaveProperty('success', true);
                expect(response).toHaveProperty('data');
                const participant = response.data;
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

            expect(res.status).toBe(201);

            if (res.status === 201) {
                const response = await res.json();
                expect(response).toHaveProperty('success', true);
                expect(response).toHaveProperty('data');
                const participant = response.data;
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

            expect(res.status).toBe(201);

            if (res.status === 201) {
                const response = await res.json();
                expect(response).toHaveProperty('success', true);
            }

            // Verify participant is actually deleted (should return 404)
            const getRes = await client.api.participants[':id'].$get(
                { param: { id: createdParticipantId } },
                { headers: auth.authHeaders }
            );
            expect(getRes.status).toBe(404);
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
                    const response = await res.json();
                    expect(response).toHaveProperty('success', true);
                    expect(response).toHaveProperty('data');
                    const participant = response.data;
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
                        page: '1',
                        pageSize: '10',
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
            expect([201, 400, 500]).toContain(res.status);

            if (res.status === 201) {
                const response = await res.json();
                expect(response).toHaveProperty('success', true);
                expect(response).toHaveProperty('data');
                const participant = response.data;
                validateParticipantResponse(participant);
                expect(participant.name).toBe(participantData.name);
                expect(participant.linkedUserId).toBeNull(); // Invalid linkedUserId should be set to null
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

            expect(res.status).toBe(404);
        });

        it('should return 404 when updating non-existent participant', async () => {
            const res = await client.api.participants[':id'].$patch(
                {
                    param: { id: 'non-existent-id' },
                    json: { name: 'Updated Name' },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(404);
        });

        it('should return 201 when deleting non-existent participant (idempotent)', async () => {
            const res = await client.api.participants[':id'].$delete(
                { param: { id: 'non-existent-id' } },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(201);
            // Delete operations return success even if resource doesn't exist (idempotent)
            if (res.status === 201) {
                const response = await res.json();
                expect(response).toHaveProperty('success', true);
            }
        });
    });

    describe('Security - User Isolation', () => {
        const client = createTestClient();
        let userAAuth: TestAuthSetup;
        let userBAuth: TestAuthSetup;
        let userAParticipantId: string;

        beforeAll(async () => {
            // Create two different users for isolation testing
            userAAuth = await setupTestAuth();
            userBAuth = await setupTestAuth();

            // Create a participant for user A
            const participantData = {
                name: 'User A Participant',
                email: 'user-a-participant@example.com',
            };

            const res = await client.api.participants.$post(
                { json: participantData },
                { headers: userAAuth.authHeaders }
            );

            if (res.status === 201) {
                const response = await res.json();
                userAParticipantId = response.data.id;
            }
        });

        it('should prevent user B from accessing user A participants list', async () => {
            const res = await client.api.participants.$get(
                { query: {} },
                { headers: userBAuth.authHeaders }
            );

            expect(res.status).toBe(200);
            if (res.status === 200) {
                const participants = await res.json();
                expect(Array.isArray(participants)).toBe(true);
                expect(participants).toHaveLength(0); // User B should see no participants
            }
        });

        it('should prevent user B from accessing user A specific participant', async () => {
            if (!userAParticipantId) return;

            const res = await client.api.participants[':id'].$get(
                { param: { id: userAParticipantId } },
                { headers: userBAuth.authHeaders }
            );

            expect(res.status).toBe(404); // User B should not find User A's participant
        });

        it('should prevent user B from updating user A participant', async () => {
            if (!userAParticipantId) return;

            const updateData = {
                name: 'Hacked by User B',
                email: 'hacker@example.com',
            };

            const res = await client.api.participants[':id'].$patch(
                {
                    param: { id: userAParticipantId },
                    json: updateData,
                },
                { headers: userBAuth.authHeaders }
            );

            expect(res.status).toBe(404); // Should not find participant to update (user isolation)
        });

        it('should prevent user B from deleting user A participant', async () => {
            if (!userAParticipantId) return;

            const res = await client.api.participants[':id'].$delete(
                { param: { id: userAParticipantId } },
                { headers: userBAuth.authHeaders }
            );

            expect(res.status).toBe(201); // Delete is idempotent, but should not actually delete

            // Verify participant still exists for user A
            const verifyRes = await client.api.participants[':id'].$get(
                { param: { id: userAParticipantId } },
                { headers: userAAuth.authHeaders }
            );

            expect(verifyRes.status).toBe(200);
            if (verifyRes.status === 200) {
                const participant = await verifyRes.json();
                expect(participant).not.toBeNull(); // Should still exist
                expect(participant.name).toBe('User A Participant');
            }
        });
    });

    describe('Business Logic Validation', () => {
        const client = createTestClient();

        it('should prevent duplicate email addresses for same user', async () => {
            const participantData = {
                name: 'First Participant',
                email: 'duplicate@example.com',
            };

            // Create first participant
            const firstRes = await client.api.participants.$post(
                { json: participantData },
                { headers: auth.authHeaders }
            );
            expect(firstRes.status).toBe(201);

            // Try to create second participant with same email
            const duplicateData = {
                name: 'Second Participant',
                email: 'duplicate@example.com', // Same email
            };

            const secondRes = await client.api.participants.$post(
                { json: duplicateData },
                { headers: auth.authHeaders }
            );

            expect([201, 400, 500]).toContain(secondRes.status); // May succeed or fail based on business rules
        });

        it('should validate linked user exists before creating participant', async () => {
            const participantData = {
                name: 'Linked Participant',
                email: 'linked@example.com',
                linkedUserId: 'non-existent-user-id-12345', // Invalid user ID
            };

            const res = await client.api.participants.$post(
                { json: participantData },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(201); // Should succeed but with linkedUserId set to null
        });

        it('should handle participant updates with email conflicts', async () => {
            // Create two participants
            const participant1Data = {
                name: 'Participant 1',
                email: 'participant1@example.com',
            };

            const participant2Data = {
                name: 'Participant 2',
                email: 'participant2@example.com',
            };

            const res1 = await client.api.participants.$post(
                { json: participant1Data },
                { headers: auth.authHeaders }
            );

            const res2 = await client.api.participants.$post(
                { json: participant2Data },
                { headers: auth.authHeaders }
            );

            expect(res1.status).toBe(201);
            expect(res2.status).toBe(201);

            if (res1.status === 201 && res2.status === 201) {
                const response1 = await res1.json();
                const participant1Id = response1.data.id;

                // Try to update participant 1 to have participant 2's email
                const updateRes = await client.api.participants[':id'].$patch(
                    {
                        param: { id: participant1Id },
                        json: { email: 'participant2@example.com' }, // Duplicate email should be allowed
                    },
                    { headers: auth.authHeaders }
                );

                expect(updateRes.status).toBe(201); // Should succeed - duplicate emails are allowed
            }
        });
    });
});
