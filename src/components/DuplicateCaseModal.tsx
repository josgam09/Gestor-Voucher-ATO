import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, ExternalLink, Calendar, User, FileText } from 'lucide-react';
import RequirementStatusBadge from '@/components/RequirementStatusBadge';
import RequirementPriorityBadge from '@/components/RequirementPriorityBadge';
import { Requirement } from '@/types/requirement';

interface DuplicateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  duplicateCases: Requirement[];
  pnrTktLocalizador: string;
  onContinue: () => void;
}

const DuplicateCaseModal = ({ 
  isOpen, 
  onClose, 
  duplicateCases, 
  pnrTktLocalizador, 
  onContinue 
}: DuplicateCaseModalProps) => {
  const [selectedCase, setSelectedCase] = useState<Requirement | null>(null);

  const handleViewCase = (requirement: Requirement) => {
    setSelectedCase(requirement);
  };

  const handleClose = () => {
    setSelectedCase(null);
    onClose();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Modal principal */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Casos Existentes Detectados
            </DialogTitle>
            <DialogDescription>
              Se encontraron {duplicateCases.length} caso(s) existente(s) con el PNR/TKT/Localizador: 
              <span className="font-mono font-semibold text-primary ml-1">
                {pnrTktLocalizador}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Lista de casos duplicados */}
            <div className="space-y-3">
              {duplicateCases.map((requirement, index) => (
                <Card key={requirement.id} className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {requirement.ticketNumber}
                          </Badge>
                          <RequirementStatusBadge status={requirement.status} />
                          <RequirementPriorityBadge priority={requirement.priority} />
                        </div>
                        <CardTitle className="text-lg">
                          {requirement.tipoSolicitud || 'Requerimiento GDS'}
                        </CardTitle>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCase(requirement)}
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ver Detalles
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Creado:</span>
                          <span className="font-medium">
                            {formatDate(requirement.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Asesor:</span>
                          <span className="font-medium">{requirement.nombreAsesor}</span>
                        </div>
                        {requirement.pais && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">País:</span>
                            <span className="font-medium">{requirement.pais}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {requirement.motivo && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Motivo:</span>
                            <span className="font-medium">{requirement.motivo}</span>
                          </div>
                        )}
                        {requirement.subMotivo && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Sub Motivo:</span>
                            <span className="font-medium">{requirement.subMotivo}</span>
                          </div>
                        )}
                        {requirement.asuntoCorreoElectronico && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Asunto:</span>
                            <span className="font-medium truncate">
                              {requirement.asuntoCorreoElectronico}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={handleClose}>
                Cancelar Creación
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleClose}>
                  Revisar Casos Existentes
                </Button>
                <Button onClick={onContinue}>
                  Continuar con Nuevo Caso
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de detalles del caso */}
      <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalles del Caso Existente
            </DialogTitle>
            <DialogDescription>
              Información completa del caso seleccionado
            </DialogDescription>
          </DialogHeader>

          {selectedCase && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Información General</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ticket:</span>
                      <span className="font-mono font-medium">{selectedCase.ticketNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado:</span>
                      <RequirementStatusBadge status={selectedCase.status} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prioridad:</span>
                      <RequirementPriorityBadge priority={selectedCase.priority} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Asesor:</span>
                      <span className="font-medium">{selectedCase.nombreAsesor}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Detalles del Requerimiento</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">País:</span>
                      <span className="font-medium">{selectedCase.pais || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Motivo:</span>
                      <span className="font-medium">{selectedCase.motivo || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sub Motivo:</span>
                      <span className="font-medium">{selectedCase.subMotivo || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Creado:</span>
                      <span className="font-medium">{formatDate(selectedCase.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedCase.solicitudCliente && (
                <div>
                  <h3 className="font-semibold mb-2">Solicitud del Cliente</h3>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    {selectedCase.solicitudCliente}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedCase(null)}>
                  Cerrar
                </Button>
                <Link to={`/requirements/${selectedCase.id}`}>
                  <Button className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Ir al Caso Completo
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DuplicateCaseModal;

