import { Badge } from '@/components/ui/badge';
import { RequirementStatus } from '@/types/requirement';

interface RequirementStatusBadgeProps {
  status: RequirementStatus;
}

const RequirementStatusBadge = ({ status }: RequirementStatusBadgeProps) => {
  const statusConfig = {
    ingresado: { label: 'Ingresado', className: 'bg-primary/10 text-primary hover:bg-primary/20' },
    'en-gestion': { label: 'En Gestión', className: 'bg-warning/10 text-warning hover:bg-warning/20' },
    'revision-supervisor': { label: 'Revisión Supervisor', className: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20' },
    enviado: { label: 'Enviado (Cerrado)', className: 'bg-success/10 text-success hover:bg-success/20' },
  };

  const config = statusConfig[status];

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
};

export default RequirementStatusBadge;

