import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Mail, Shield, Lock, CheckCircle2 } from 'lucide-react';
import { Helmet } from 'react-helmet';

const Profile = () => {
    const { user, profile, changePassword } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!currentPassword) {
            newErrors.currentPassword = 'Le mot de passe actuel est requis';
        }

        if (!newPassword) {
            newErrors.newPassword = 'Le nouveau mot de passe est requis';
        } else if (newPassword.length < 6) {
            newErrors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'La confirmation est requise';
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        const { error } = await changePassword(currentPassword, newPassword);

        if (!error) {
            // Reset form on success
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setErrors({});
        }

        setLoading(false);
    };

    const getRoleBadge = (role) => {
        if (role === 'admin') {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    <Shield className="w-4 h-4 mr-1" />
                    Administrateur
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <User className="w-4 h-4 mr-1" />
                Utilisateur
            </span>
        );
    };

    return (
        <>
            <Helmet>
                <title>Mon Profil - CEL U13</title>
                <meta name="description" content="Gérez votre profil et changez votre mot de passe" />
            </Helmet>

            <div className="max-w-4xl mx-auto space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Mon Profil</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Gérez vos informations personnelles et votre sécurité
                    </p>
                </motion.div>

                {/* User Information Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Informations du compte
                            </CardTitle>
                            <CardDescription>
                                Vos informations personnelles et votre rôle dans l'application
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Nom complet
                                    </Label>
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-900 dark:text-gray-100">
                                            {profile?.name || 'Non défini'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Adresse email
                                    </Label>
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-900 dark:text-gray-100">
                                            {user?.email}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Rôle
                                    </Label>
                                    <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                        {getRoleBadge(profile?.role)}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Statut du compte
                                    </Label>
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="text-gray-900 dark:text-gray-100">
                                            Actif
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Change Password Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5" />
                                Changer le mot de passe
                            </CardTitle>
                            <CardDescription>
                                Mettez à jour votre mot de passe pour sécuriser votre compte
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">
                                        Mot de passe actuel <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        placeholder="Entrez votre mot de passe actuel"
                                        value={currentPassword}
                                        onChange={(e) => {
                                            setCurrentPassword(e.target.value);
                                            if (errors.currentPassword) {
                                                setErrors({ ...errors, currentPassword: null });
                                            }
                                        }}
                                        className={errors.currentPassword ? 'border-red-500' : ''}
                                        disabled={loading}
                                    />
                                    {errors.currentPassword && (
                                        <p className="text-sm text-red-500">{errors.currentPassword}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">
                                        Nouveau mot de passe <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        placeholder="Entrez votre nouveau mot de passe (min. 6 caractères)"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            if (errors.newPassword) {
                                                setErrors({ ...errors, newPassword: null });
                                            }
                                        }}
                                        className={errors.newPassword ? 'border-red-500' : ''}
                                        disabled={loading}
                                    />
                                    {errors.newPassword && (
                                        <p className="text-sm text-red-500">{errors.newPassword}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">
                                        Confirmer le nouveau mot de passe <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirmez votre nouveau mot de passe"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (errors.confirmPassword) {
                                                setErrors({ ...errors, confirmPassword: null });
                                            }
                                        }}
                                        className={errors.confirmPassword ? 'border-red-500' : ''}
                                        disabled={loading}
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                                    )}
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" className="w-full sm:w-auto gap-2" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="animate-spin w-4 h-4" />
                                                Modification en cours...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-4 h-4" />
                                                Changer le mot de passe
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </>
    );
};

export default Profile;
