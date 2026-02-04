import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, UserPlus, Users, Shield, UserCheck, Trash2 } from 'lucide-react';
import { UserRole } from '@/types/user';
import { toast } from 'sonner';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

const UserManagement = () => {
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<ManagedUser[]>([
    {
      id: '1',
      name: 'Administrador del Sistema',
      email: 'admin@jetsmart.com',
      role: 'ADMINISTRADOR',
      isActive: true,
      createdAt: new Date('2025-01-01'),
    },
    {
      id: '2',
      name: 'Supervisor de Soporte',
      email: 'supervisor@jetsmart.com',
      role: 'SUPERVISOR',
      isActive: true,
      createdAt: new Date('2025-01-01'),
    },
    {
      id: '3',
      name: 'Aeropuerto ATO',
      email: 'ato@jetsmart.com',
      role: 'AEROPUERTO_ATO',
      isActive: true,
      createdAt: new Date('2025-01-01'),
    },
    {
      id: '4',
      name: 'Soporte CC',
      email: 'soportecc@jetsmart.com',
      role: 'SOPORTE_CC',
      isActive: true,
      createdAt: new Date('2025-01-01'),
    },
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'AEROPUERTO_ATO' as UserRole,
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();

    const user: ManagedUser = {
      id: Date.now().toString(),
      ...newUser,
      isActive: true,
      createdAt: new Date(),
    };

    setUsers([...users, user]);
    setNewUser({ name: '', email: '', role: 'AEROPUERTO_ATO' });
    toast.success(`Usuario ${user.name} creado exitosamente`);
  };

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u =>
      u.id === id ? { ...u, isActive: !u.isActive } : u
    ));
    const user = users.find(u => u.id === id);
    toast.success(`Usuario ${user!.isActive ? 'desactivado' : 'activado'}`);
  };

  const deleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    if (confirm(`¿Estás seguro de eliminar al usuario ${user?.name}?`)) {
      setUsers(users.filter(u => u.id !== id));
      toast.success('Usuario eliminado');
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMINISTRADOR': return <Shield className="h-4 w-4" />;
      case 'SUPERVISOR': return <Users className="h-4 w-4" />;
      case 'AEROPUERTO_ATO': return <UserCheck className="h-4 w-4" />;
      case 'SOPORTE_CC': return <UserCheck className="h-4 w-4" />;
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'ADMINISTRADOR': return 'bg-red-500/10 text-red-600';
      case 'SUPERVISOR': return 'bg-blue-500/10 text-blue-600';
      case 'AEROPUERTO_ATO': return 'bg-emerald-500/10 text-emerald-600';
      case 'SOPORTE_CC': return 'bg-violet-500/10 text-violet-600';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <Button onClick={() => navigate('/admin')} variant="outline" className="gap-2 mb-3">
            <ArrowLeft className="h-4 w-4" />
            Volver al Panel
          </Button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8" />
            Gestión de Usuarios
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra los usuarios del sistema y sus permisos
          </p>
        </div>
      </div>

      {/* Formulario Crear Usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Crear Nuevo Usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Nombre Completo *</Label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="juan.perez@jetsmart.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Rol *</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AEROPUERTO_ATO">Aeropuerto (ATO)</SelectItem>
                    <SelectItem value="SOPORTE_CC">Soporte CC</SelectItem>
                    <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                    <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Crear Usuario
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className={`p-4 rounded-lg border ${
                  user.isActive ? 'bg-card' : 'bg-muted/50 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 rounded-full ${getRoleBadgeClass(user.role)}`}>
                      {getRoleIcon(user.role)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{user.name}</h3>
                        {!user.isActive && (
                          <Badge variant="secondary" className="text-xs">INACTIVO</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getRoleBadgeClass(user.role)}>
                          {user.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Creado: {new Date(user.createdAt).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${user.id}`} className="text-sm">
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </Label>
                      <Switch
                        id={`active-${user.id}`}
                        checked={user.isActive}
                        onCheckedChange={() => toggleUserStatus(user.id)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteUser(user.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;







