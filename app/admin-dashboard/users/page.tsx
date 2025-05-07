"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SearchInput } from "@/components/search-input";
import { UserCog, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Id } from "@/convex/_generated/dataModel";

export default function UserManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [isAssociateDialogOpen, setIsAssociateDialogOpen] = useState(false);

  interface User {
    id: Id<"users">;
    name: string;
    email: string;
    role?: string;
    lecName?: string;
    lecturerId?: Id<"lecturers">;
  }

  interface Lecturer {
    _id: Id<"lecturers">;
    name: string;
  }

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedLecturerId, setSelectedLecturerId] = useState<string>("");

  // Fetch data
  const users = useQuery(api.users.getAllUsers) || [];
  const unassociatedLecturers =
    useQuery(api.users.getUnassociatedLecturers) || [];

  // Get lecturers that don't have user accounts yet
  const lecturersWithoutUsers = unassociatedLecturers;

  // Mutations
  const updateUserRole = useMutation(api.users.updateUserRole);
  const associateUserWithLecturer = useMutation(
    api.users.associateUserWithLecturer
  );

  // Filter users based on search query
  const filteredUsers = users.filter((user: User) => {
    return (
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lecName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Handle updating user role
  const handleUpdateRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast({
        title: "Error",
        description: "Please select a role",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateUserRole({
        userId: selectedUser.id,
        role: selectedRole,
      });

      toast({
        title: "Success",
        description: `User role updated to ${selectedRole}`,
      });

      setIsEditRoleDialogOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  // Handle associating user with lecturer
  const handleAssociateUser = async () => {
    if (!selectedUser || !selectedLecturerId) {
      toast({
        title: "Error",
        description: "Please select a lecturer",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await associateUserWithLecturer({
        userId: selectedUser.id,
        lecturerId: selectedLecturerId as Id<"lecturers">,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setIsAssociateDialogOpen(false);
      } else {
        toast({
          title: "Warning",
          description: result.message,
          variant: "destructive",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to associate user with lecturer",
        variant: "destructive",
      });
    }
  };

  // Open edit role dialog
  const openEditRoleDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role || "");
    setIsEditRoleDialogOpen(true);
  };

  // Open associate dialog
  const openAssociateDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedLecturerId("");
    setIsAssociateDialogOpen(true);
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500";
      case "lecturer":
        return "bg-blue-500";
      case "student":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="gradient-card rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">User Management</h2>
        <p className="opacity-90">
          Manage users in the system. You can update user roles and associate
          lecturer accounts with their user profiles.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Users</CardTitle>
          <div className="w-72">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search users..."
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Lecturer Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || "N/A"}
                  </TableCell>
                  <TableCell>{user.lecName || "N/A"}</TableCell>
                  <TableCell>{user.email || "N/A"}</TableCell>
                  <TableCell>
                    {user.role ? (
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    ) : (
                      <Badge variant="outline">No Role</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.role === "lecturer" ? (
                      user.lecturerId ? (
                        <Badge className="bg-green-500">Associated</Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-orange-500 border-orange-500"
                        >
                          Not Associated
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline" className="text-gray-400">
                        N/A
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => openEditRoleDialog(user)}
                      >
                        <UserCog className="h-4 w-4" />
                        Change Role
                      </Button>
                      {user.role === "lecturer" && !user.lecturerId && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => openAssociateDialog(user)}
                        >
                          <Link className="h-4 w-4" />
                          Associate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog
        open={isEditRoleDialogOpen}
        onOpenChange={setIsEditRoleDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="font-medium">{selectedUser?.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedUser?.email}
              </p>
              {selectedUser?.lecName && (
                <p className="text-sm text-muted-foreground">
                  Username: {selectedUser.lecName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Select Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="lecturer">Lecturer</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditRoleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Associate User with Lecturer Dialog */}
      <Dialog
        open={isAssociateDialogOpen}
        onOpenChange={setIsAssociateDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Associate User with Lecturer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="font-medium">{selectedUser?.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedUser?.email}
              </p>
              {selectedUser?.lecName && (
                <p className="text-sm text-muted-foreground">
                  Username: {selectedUser.lecName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lecturer">Select Lecturer</Label>
              <Select
                value={selectedLecturerId}
                onValueChange={setSelectedLecturerId}
              >
                <SelectTrigger id="lecturer">
                  <SelectValue placeholder="Select lecturer" />
                </SelectTrigger>
                <SelectContent>
                  {lecturersWithoutUsers.map((lecturer: Lecturer) => (
                    <SelectItem key={lecturer._id} value={lecturer._id}>
                      {lecturer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Note: Ideally, the lecturer{"'"}s name should match the user{"'"}s
                username for proper association.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssociateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssociateUser}>Associate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
