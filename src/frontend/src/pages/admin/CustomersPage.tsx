import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { Loader2, Search, Shield, UserCheck, UserX } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../../backend.d";
import type { User } from "../../backend.d";
import {
  useAllCustomers,
  useBlockUser,
  useMyProfile,
  useSetUserRole,
  useUnblockUser,
} from "../../hooks/useQueries";

export function CustomersPage() {
  const { data: customers, isLoading } = useAllCustomers();
  const { data: myProfile } = useMyProfile();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const setUserRole = useSetUserRole();

  const [search, setSearch] = useState("");
  const isSuperAdmin = myProfile?.role === UserRole.superAdmin;

  const filtered = (customers ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  );

  const handleBlock = async (user: User) => {
    try {
      if (user.isBlocked) {
        await unblockUser.mutateAsync(user.principal as unknown as Principal);
        toast.success(`${user.name} unblocked`);
      } else {
        await blockUser.mutateAsync(user.principal as unknown as Principal);
        toast.success(`${user.name} blocked`);
      }
    } catch {
      toast.error("Action failed");
    }
  };

  const handleSetRole = async (user: User, role: UserRole) => {
    try {
      await setUserRole.mutateAsync({
        userPrincipal: user.principal as unknown as Principal,
        newRole: role,
      });
      toast.success(`Role updated for ${user.name}`);
    } catch {
      toast.error("Failed to update role");
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === UserRole.superAdmin)
      return (
        <Badge className="bg-purple-100 text-purple-800 border-0 text-xs">
          Super Admin
        </Badge>
      );
    if (role === UserRole.admin)
      return (
        <Badge className="bg-blue-100 text-blue-800 border-0 text-xs">
          Admin
        </Badge>
      );
    return (
      <Badge variant="outline" className="text-xs">
        Customer
      </Badge>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-2xl font-bold text-foreground">
          Customers
        </h1>
        <p className="text-muted-foreground text-sm">
          {customers?.length ?? 0} registered customers
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="pl-9"
        />
      </div>

      {/* Table / List */}
      {isLoading ? (
        <div className="space-y-2">
          {["sk1", "sk2", "sk3", "sk4", "sk5"].map((k) => (
            <div
              key={k}
              className="bg-card rounded-xl border border-border p-4"
            >
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>No customers found</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2.5 bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase">
            <span>Customer</span>
            <span>Phone</span>
            <span>Role</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((customer, i) => (
              <motion.div
                key={customer.principal.toString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="px-4 py-3"
              >
                {/* Mobile layout */}
                <div className="md:hidden">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {customer.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customer.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getRoleBadge(customer.role)}
                      {customer.isBlocked && (
                        <Badge className="bg-red-100 text-red-800 border-0 text-xs">
                          Blocked
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBlock(customer)}
                      disabled={blockUser.isPending || unblockUser.isPending}
                      className={`flex-1 h-7 text-xs ${customer.isBlocked ? "border-green-300 text-green-700" : "border-red-300 text-red-700"}`}
                    >
                      {customer.isBlocked ? (
                        <UserCheck className="h-3 w-3 mr-1" />
                      ) : (
                        <UserX className="h-3 w-3 mr-1" />
                      )}
                      {customer.isBlocked ? "Unblock" : "Block"}
                    </Button>
                    {isSuperAdmin && (
                      <Select
                        value={customer.role}
                        onValueChange={(v) =>
                          handleSetRole(customer, v as UserRole)
                        }
                      >
                        <SelectTrigger className="flex-1 h-7 text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UserRole.customer}>
                            Customer
                          </SelectItem>
                          <SelectItem value={UserRole.admin}>Admin</SelectItem>
                          <SelectItem value={UserRole.superAdmin}>
                            Super Admin
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center">
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {customer.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {customer.principal.toString().slice(0, 20)}...
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {customer.phone}
                  </p>
                  <div>{getRoleBadge(customer.role)}</div>
                  <div>
                    {customer.isBlocked ? (
                      <Badge className="bg-red-100 text-red-800 border-0 text-xs">
                        Blocked
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBlock(customer)}
                      disabled={blockUser.isPending || unblockUser.isPending}
                      className={`h-7 text-xs ${customer.isBlocked ? "border-green-300 text-green-700" : "border-red-300 text-red-700"}`}
                    >
                      {customer.isBlocked ? "Unblock" : "Block"}
                    </Button>
                    {isSuperAdmin && (
                      <Select
                        value={customer.role}
                        onValueChange={(v) =>
                          handleSetRole(customer, v as UserRole)
                        }
                      >
                        <SelectTrigger className="w-28 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UserRole.customer}>
                            Customer
                          </SelectItem>
                          <SelectItem value={UserRole.admin}>Admin</SelectItem>
                          <SelectItem value={UserRole.superAdmin}>
                            Super Admin
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
