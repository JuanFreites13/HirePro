"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Users, 
  Plus,
  Edit,
  Trash2,
  Search,
  UserPlus,
  Shield,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  AlertTriangle
} from "lucide-react"
import { usersService } from "@/lib/supabase-service"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function ConfigurationPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showEditUser, setShowEditUser] = useState(false)
  const [showDeleteUser, setShowDeleteUser] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [deletingUser, setDeletingUser] = useState<any>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Entrevistador' as 'Admin RRHH' | 'Entrevistador',
    area: '',
    position: ''
  })
  
  const [editUser, setEditUser] = useState({
    id: '',
    name: '',
    email: '',
    role: 'Entrevistador' as 'Admin RRHH' | 'Entrevistador',
    area: '',
    position: '',
    permissions: [] as string[]
  })

  // Verificar si el usuario actual es Admin RRHH
  const isAdmin = user?.role === 'Admin RRHH' && user?.permissions?.includes('gestionar_usuarios')

  // Cargar usuarios al montar el componente
  useEffect(() => {
    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const userData = await usersService.getAllUsers()
      setUsers(userData)
    } catch (error) {
      console.error('Error cargando usuarios:', error)
      alert('Error cargando usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      if (!newUser.name || !newUser.email || !newUser.password) {
        alert('Por favor completa todos los campos requeridos')
        return
      }

      await usersService.createUser(newUser)
      
      // Limpiar formulario
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'Entrevistador',
        area: '',
        position: ''
      })
      
      setShowCreateUser(false)
      loadUsers() // Recargar lista
      
      // Mostrar mensaje de éxito
      alert('Usuario creado exitosamente. Ya puede iniciar sesión.')
    } catch (error: any) {
      console.error('Error creando usuario:', error)
      alert(`Error creando usuario: ${error.message}`)
    }
  }

  const handleEditUser = (userItem: any) => {
    console.log('✏️ Editando usuario:', userItem)
    console.log('📋 Permisos actuales:', userItem.permissions)
    
    setEditingUser(userItem)
    setEditUser({
      id: userItem.id,
      name: userItem.name,
      email: userItem.email,
      role: userItem.role,
      area: userItem.area || '',
      position: userItem.position || '',
      permissions: [...userItem.permissions]
    })
    setShowEditUser(true)
  }

  const handleSaveEditUser = async () => {
    try {
      console.log('💾 Guardando cambios para usuario:', editUser)
      console.log('📋 Permisos a guardar:', editUser.permissions)
      
      if (!editUser.name || !editUser.email) {
        alert('Por favor completa todos los campos requeridos')
        return
      }

      await usersService.updateUser(editUser.id, {
        name: editUser.name,
        email: editUser.email,
        role: editUser.role,
        area: editUser.area,
        position: editUser.position,
        permissions: editUser.permissions
      })
      
      alert('Usuario actualizado exitosamente')
      setShowEditUser(false)
      setEditingUser(null)
      
      // Recargar lista de usuarios
      await loadUsers()
    } catch (error: any) {
      console.error('Error actualizando usuario:', error)
      alert(`Error actualizando usuario: ${error.message}`)
    }
  }

  const handlePermissionToggle = (permission: string, checked: boolean) => {
    console.log('🔄 Cambiando permiso:', permission, 'a:', checked)
    setEditUser(prev => {
      const newPermissions = checked 
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
      
      console.log('📋 Permisos actualizados:', newPermissions)
      
      return {
        ...prev,
        permissions: newPermissions
      }
    })
  }

  const handleRoleChangeInEdit = (newRole: 'Admin RRHH' | 'Entrevistador') => {
    console.log('🔄 Cambiando rol a:', newRole)
    const defaultPermissions = usersService.getPermissionsByRole(newRole)
    console.log('📋 Permisos por defecto para', newRole, ':', defaultPermissions)
    
    setEditUser(prev => ({
      ...prev,
      role: newRole,
      permissions: defaultPermissions
    }))
  }

  const handleDeleteUser = (userItem: any) => {
    setDeletingUser(userItem)
    setDeleteConfirmation("")
    setShowDeleteUser(true)
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirmation !== 'ELIMINAR') {
      alert('Por favor escribe "ELIMINAR" para confirmar la eliminación')
      return
    }

    try {
      console.log('🗑️ Iniciando eliminación de usuario:', deletingUser)
      
      // Deshabilitar botón durante la operación
      const deleteButton = document.querySelector('[data-delete-button]') as HTMLButtonElement
      if (deleteButton) {
        deleteButton.disabled = true
        deleteButton.textContent = 'Eliminando...'
      }

      // Realizar eliminación
      const result = await usersService.deleteUser(deletingUser.id)
      
      console.log('✅ Resultado de eliminación:', result)
      
      // Solo mostrar éxito si la eliminación fue exitosa
      if (result) {
        alert('Usuario eliminado exitosamente')
        setShowDeleteUser(false)
        setDeletingUser(null)
        setDeleteConfirmation("")
        await loadUsers()
      } else {
        alert('Error: No se pudo eliminar el usuario')
      }
    } catch (error: any) {
      console.error('❌ Error eliminando usuario:', error)
      alert(`Error eliminando usuario: ${error.message}`)
    } finally {
      // Rehabilitar botón
      const deleteButton = document.querySelector('[data-delete-button]') as HTMLButtonElement
      if (deleteButton) {
        deleteButton.disabled = false
        deleteButton.textContent = 'Eliminar Usuario'
      }
    }
  }

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    return user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Estadísticas
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'Admin RRHH').length,
    entrevistadores: users.filter(u => u.role === 'Entrevistador').length
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
              <p className="text-muted-foreground">
                No tienes permisos para acceder a la gestión de usuarios.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateUser(true)} 
          disabled={loading}
          className="bg-primary hover:bg-primary/90"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Usuarios</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entrevistadores</p>
                <p className="text-2xl font-bold">{stats.entrevistadores}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buscador */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Cargando usuarios...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.area || 'Sin área'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'Admin RRHH' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.permissions?.slice(0, 3).map((permission: string) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {user.permissions?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.permissions.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          title="Editar usuario"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.email !== 'admin@talentopro.com' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            title="Eliminar usuario"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron usuarios</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Crear Usuario */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="juan@empresa.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="role">Rol *</Label>
                <Select value={newUser.role} onValueChange={(value: 'Admin RRHH' | 'Entrevistador') => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entrevistador">Entrevistador</SelectItem>
                    <SelectItem value="Admin RRHH">Admin RRHH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area">Área</Label>
                <Input
                  id="area"
                  value={newUser.area}
                  onChange={(e) => setNewUser({...newUser, area: e.target.value})}
                  placeholder="RRHH, IT, Marketing..."
                />
              </div>
              <div>
                <Label htmlFor="position">Puesto</Label>
                <Input
                  id="position"
                  value={newUser.position}
                  onChange={(e) => setNewUser({...newUser, position: e.target.value})}
                  placeholder="Manager, Senior, Junior..."
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateUser(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={!newUser.name || !newUser.email || !newUser.password}>
              Crear Usuario
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Usuario */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nombre completo</Label>
                <Input
                  id="edit-name"
                  value={editUser.name}
                  onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-role">Rol</Label>
              <Select value={editUser.role} onValueChange={handleRoleChangeInEdit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entrevistador">Entrevistador</SelectItem>
                  <SelectItem value="Admin RRHH">Admin RRHH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-area">Área</Label>
                <Input
                  id="edit-area"
                  value={editUser.area}
                  onChange={(e) => setEditUser({...editUser, area: e.target.value})}
                  placeholder="RRHH, IT, Marketing..."
                />
              </div>
              <div>
                <Label htmlFor="edit-position">Puesto</Label>
                <Input
                  id="edit-position"
                  value={editUser.position}
                  onChange={(e) => setEditUser({...editUser, position: e.target.value})}
                  placeholder="Manager, Senior, Junior..."
                />
              </div>
            </div>
            <div>
              <Label>Permisos</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  'crear_postulaciones',
                  'mover_etapas',
                  'ver_todas_postulaciones',
                  'ver_postulaciones_asignadas',
                  'gestionar_usuarios',
                  'acceso_configuracion',
                  'eliminar_candidatos',
                  'editar_postulaciones'
                ].map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission}
                      checked={editUser.permissions.includes(permission)}
                      onCheckedChange={(checked) => handlePermissionToggle(permission, !!checked)}
                    />
                    <Label htmlFor={permission} className="text-sm">
                      {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowEditUser(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEditUser}>
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Eliminar Usuario */}
      <Dialog open={showDeleteUser} onOpenChange={setShowDeleteUser}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Confirmar Eliminación
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                ¿Estás seguro de que quieres eliminar al usuario?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">{deletingUser?.name}</p>
                <p className="text-sm text-gray-500">{deletingUser?.email}</p>
                <p className="text-sm text-gray-500">Rol: {deletingUser?.role}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Esta acción es <strong>irreversible</strong>. Para confirmar, escribe:
              </p>
              <div className="bg-red-50 border border-red-200 p-2 rounded">
                <span className="font-mono text-red-600 font-bold">ELIMINAR</span>
              </div>
            </div>
            <div>
              <Label htmlFor="delete-confirmation">Confirmación</Label>
              <Input
                id="delete-confirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Escribe ELIMINAR"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteUser(false)
                setDeletingUser(null)
                setDeleteConfirmation("")
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              disabled={deleteConfirmation !== 'ELIMINAR'}
              className="bg-red-600 hover:bg-red-700"
              data-delete-button
            >
              Eliminar Usuario
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


