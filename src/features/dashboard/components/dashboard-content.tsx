'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks';

export function DashboardContent() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Button onClick={handleLogout}>Logout</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome, {user?.name || 'User'}</CardTitle>
                        <CardDescription>You are logged in as {user?.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>
                            This is a protected dashboard page. Only authenticated users can see
                            this content.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Your account details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div>
                                <span className="font-medium">User ID:</span> {user?.id}
                            </div>
                            <div>
                                <span className="font-medium">Email:</span> {user?.email}
                            </div>
                            <div>
                                <span className="font-medium">Name:</span>{' '}
                                {user?.name || 'Not provided'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>Things you can do</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button className="w-full">Edit Profile</Button>
                        <Button variant="outline" className="w-full">
                            View Settings
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
