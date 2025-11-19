import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { getUsers, updateUserRole } from '@/lib/storage';
import { Loader2, User, Mail, Users as UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const usersData = await getUsers();
            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast({
                title: "❌ Erreur de chargement",
                description: "Impossible de charger la liste des utilisateurs.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers(prevUsers =>
                prevUsers.map(user => (user.id === userId ? { ...user, role: newRole } : user))
            );
            toast({
                title: "✅ Succès",
                description: "Le rôle de l'utilisateur a été mis à jour.",
            });
        } catch (error) {
            console.error("Error updating user role:", error);
            toast({
                title: "❌ Erreur",
                description: "Impossible de mettre à jour le rôle de l'utilisateur.",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-12 h-12 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Administration des Utilisateurs</title>
                <meta name="description" content="Gérer les rôles et les informations des utilisateurs." />
            </Helmet>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
            >
                <header>
                    <h1 className="text-3xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
                    <p className="text-gray-600 mt-1">Attribuez des rôles et gérez les accès.</p>
                </header>

                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><UsersIcon className="inline-block mr-2 h-4 w-4" />Nom</TableHead>
                                <TableHead><Mail className="inline-block mr-2 h-4 w-4" />Email</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-500" />
                                        {user.name || 'N/A'}
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Select value={user.role} onValueChange={(newRole) => handleRoleChange(user.id, newRole)}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Sélectionner un rôle" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="coach">Coach</SelectItem>
                                                <SelectItem value="parent">Parent</SelectItem>
                                                <SelectItem value="player">Joueuse</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {/* Future actions like delete user, reset password */}
                                        <Button variant="ghost" size="sm" onClick={() => toast({ title: "🚧 Fonctionnalité non implémentée", description: "La suppression d'utilisateur n'est pas encore disponible.", variant: "destructive" })}>
                                            Supprimer
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </motion.div>
        </>
    );
};

export default AdminUsers;