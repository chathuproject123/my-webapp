import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Ban, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const toggleBanMutation = useMutation({
    mutationFn: async ({ userId, isBanned }: { userId: number; isBanned: boolean }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/ban`, { isBanned });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User ban status updated",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {user.lastLoginTime
                      ? format(new Date(user.lastLoginTime), "MMM d, yyyy HH:mm")
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    {user.isBanned ? (
                      <span className="text-red-500">Banned</span>
                    ) : (
                      <span className="text-green-500">Active</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        toggleBanMutation.mutate({
                          userId: user.id,
                          isBanned: !user.isBanned,
                        })
                      }
                    >
                      {user.isBanned ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Ban className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
