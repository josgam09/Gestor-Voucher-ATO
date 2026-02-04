import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, PlusCircle, List as ListIcon, Trash2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

type ListCategory = 'requerimiento' | 'asignacion' | 'revision' | 'sistema';

interface CustomList {
  id: string;
  name: string;
  label: string;
  category: ListCategory;
  options: string[];
  isActive: boolean;
  createdAt: Date;
}

const ListManagement = () => {
  const navigate = useNavigate();
  
  const [lists, setLists] = useState<CustomList[]>([
    {
      id: '1',
      name: 'equipos_soporte',
      label: 'Equipos de Soporte',
      category: 'asignacion',
      options: ['Soporte GDS', 'Soporte Técnico', 'Soporte Comercial'],
      isActive: true,
      createdAt: new Date('2025-01-01'),
    },
  ]);

  const [newList, setNewList] = useState({
    name: '',
    label: '',
    category: 'requerimiento' as ListCategory,
  });

  const [newOption, setNewOption] = useState('');
  const [editingListId, setEditingListId] = useState<string | null>(null);

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();

    const list: CustomList = {
      id: Date.now().toString(),
      ...newList,
      options: [],
      isActive: true,
      createdAt: new Date(),
    };

    setLists([...lists, list]);
    setNewList({ name: '', label: '', category: 'requerimiento' });
    toast.success(`Lista "${list.label}" creada exitosamente`);
  };

  const addOptionToList = (listId: string) => {
    if (!newOption.trim()) {
      toast.error('Escribe una opción primero');
      return;
    }

    setLists(lists.map(list =>
      list.id === listId
        ? { ...list, options: [...list.options, newOption] }
        : list
    ));
    setNewOption('');
    toast.success('Opción agregada');
  };

  const removeOptionFromList = (listId: string, optionIndex: number) => {
    setLists(lists.map(list =>
      list.id === listId
        ? { ...list, options: list.options.filter((_, i) => i !== optionIndex) }
        : list
    ));
    toast.success('Opción eliminada');
  };

  const toggleListStatus = (id: string) => {
    setLists(lists.map(l =>
      l.id === id ? { ...l, isActive: !l.isActive } : l
    ));
    const list = lists.find(l => l.id === id);
    toast.success(`Lista ${list!.isActive ? 'desactivada' : 'activada'}`);
  };

  const deleteList = (id: string) => {
    const list = lists.find(l => l.id === id);
    if (confirm(`¿Eliminar la lista "${list?.label}"?`)) {
      setLists(lists.filter(l => l.id !== id));
      toast.success('Lista eliminada');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <Button onClick={() => navigate('/admin')} variant="outline" className="gap-2 mb-3">
          <ArrowLeft className="h-4 w-4" />
          Volver al Panel
        </Button>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <ListIcon className="h-8 w-8" />
          Gestión de Listas Desplegables
        </h1>
        <p className="text-muted-foreground mt-1">
          Crea y modifica las opciones de los campos desplegables
        </p>
      </div>

      {/* Crear Lista */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Crear Nueva Lista
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateList} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Nombre Interno *</Label>
                <Input
                  value={newList.name}
                  onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                  placeholder="nombre_lista"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Etiqueta *</Label>
                <Input
                  value={newList.label}
                  onChange={(e) => setNewList({ ...newList, label: e.target.value })}
                  placeholder="Nombre de la Lista"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select
                  value={newList.category}
                  onValueChange={(value) => setNewList({ ...newList, category: value as ListCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requerimiento">Requerimiento</SelectItem>
                    <SelectItem value="asignacion">Asignación</SelectItem>
                    <SelectItem value="revision">Revisión Supervisor</SelectItem>
                    <SelectItem value="sistema">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Crear Lista
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Listas Existentes */}
      <Card>
        <CardHeader>
          <CardTitle>Listas Configuradas ({lists.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lists.map((list) => (
              <Card key={list.id} className={list.isActive ? '' : 'opacity-60'}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{list.label}</h4>
                          <code className="text-xs bg-muted px-2 py-1 rounded">{list.name}</code>
                          {!list.isActive && (
                            <Badge variant="secondary" className="text-xs">INACTIVA</Badge>
                          )}
                        </div>
                        <Badge variant="outline">{list.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={list.isActive}
                        onCheckedChange={() => toggleListStatus(list.id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteList(list.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nueva opción..."
                        value={editingListId === list.id ? newOption : ''}
                        onChange={(e) => setNewOption(e.target.value)}
                        onFocus={() => setEditingListId(list.id)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addOptionToList(list.id);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => addOptionToList(list.id)}
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {list.options.map((option, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="gap-2 pr-1"
                        >
                          {option}
                          <button
                            onClick={() => removeOptionFromList(list.id, index)}
                            className="hover:bg-destructive/20 rounded p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {list.options.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">
                          Sin opciones. Agrega opciones arriba.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ListManagement;

